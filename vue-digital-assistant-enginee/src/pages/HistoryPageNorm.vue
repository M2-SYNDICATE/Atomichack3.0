<script setup lang="ts">
import { inject, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileChartPie,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
  FileText,
} from 'lucide-vue-next'
import SearchInput from '../components/SearchInput.vue'
import FilterPanel from '../components/FilterPanel.vue'
import { api, handleApiError, type HistoryItem, type ErrorCounts } from '@/services/api'

// Типы, специфичные для UI (не дублируем HistoryItem из API)
interface CheckResult {
  id: string
  fileName: string
  fileType: string
  uploadDate: string
  status: 'processing' | 'completed'
  correctionStatus: 'processing' | 'rejected' | 'approved' | 'removed' | '-'
  violations: never[]
  complianceScore: number
  totalViolations: number
  errorCounts: ErrorCounts
  correctionStatusAuthor?: string
  developerLogin: string
  developerFullName: string
}

const isDarkMode = inject('isDarkMode', ref(false))
const router = useRouter()

// Хранилище результатов
const results = ref<CheckResult[]>([])

// Поиск и фильтры
const searchQuery = ref('')
const filters = ref({
  status: 'all',
  dateRange: 'all',
  correctionStatus: 'all',
})

// Загрузка
const isLoading = ref(false)
const intervalId = ref<ReturnType<typeof setInterval> | null>(null)

// Загрузка истории из API
const loadHistory = async () => {
  isLoading.value = true
  try {
    const history = await api.getHistory()

    const transformedResults = history.map((item): CheckResult => {
      const maxScore = 100
      const violationPenalty = item.total_violations * 2
      const calculatedScore = Math.max(0, maxScore - violationPenalty)

      return {
        id: item.id.toString(),
        fileName: item.filename,
        fileType: item.filename.split('.').pop()?.toUpperCase() || 'Unknown',
        uploadDate: item.upload_date,
        status:
          item.processing_status === 'in_progress'
            ? 'processing'
            : item.processing_status === 'complete'
              ? 'completed'
              : 'processing',
        correctionStatus: (() => {
          switch (item.status) {
            case 'approved':
              return 'approved'
            case 'rejected':
              return 'rejected'
            case 'removed':
              return 'removed'
            default:
              return '-'
          }
        })(),
        correctionStatusAuthor: item.status === 'rejected' ? item.status_author || '' : '',
        violations: [],
        complianceScore: calculatedScore,
        totalViolations: item.total_violations,
        errorCounts: {
          ...item.error_counts,
          total: item.error_counts?.total ?? item.total_violations ?? 0,
        },
        developerLogin: item.developer_login ?? '',
        developerFullName: item.developer_full_name ?? '',
      }
    })

    transformedResults.sort((a, b) => {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
    })

    results.value = transformedResults
  } catch (error) {
    console.error('Error loading history:', error)
    const errorMessage = handleApiError(error)
    alert(`Ошибка загрузки истории: ${errorMessage}`)
  } finally {
    isLoading.value = false
  }
}

// Запуск автоматического обновления для документов в статусе processing
const startAutoRefresh = () => {
  // Очищаем предыдущий интервал, если он был
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }

  // Проверяем, есть ли документы в статусе processing
  const hasProcessingDocs = results.value.some((result) => result.status === 'processing')

  if (hasProcessingDocs) {
    // Запускаем интервал для обновления каждые 10 секунд
    intervalId.value = setInterval(async () => {
      await loadHistory()
      // Проверяем снова, нужно ли продолжать обновление
      const stillHasProcessingDocs = results.value.some((result) => result.status === 'processing')
      if (!stillHasProcessingDocs && intervalId.value) {
        clearInterval(intervalId.value)
        intervalId.value = null
      }
    }, 10000) // 10 секунд
  }
}

onMounted(async () => {
  await loadHistory()
  startAutoRefresh()
})

// Очищаем интервал при размонтировании компонента
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
})

// Функции управления фильтрами и поиском
const resetFilters = () => {
  filters.value = { status: 'all', dateRange: 'all', correctionStatus: 'all' }
  handleFiltersReset()
}

const isInDateRange = (dateString: string, range: string) => {
  if (range === 'all') return true

  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'today':
      return date >= today
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return date >= weekAgo
    case 'month':
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
      return date >= monthAgo
    case 'quarter':
      const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
      return date >= quarterAgo
    default:
      return true
  }
}

const filteredResults = computed(() => {
  let resultsData = results.value

  // Поиск
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    resultsData = resultsData.filter(
      (result) =>
        result.fileName.toLowerCase().includes(query) ||
        result.developerFullName.toLowerCase().includes(query) ||
        result.developerLogin.toLowerCase().includes(query),
    )
  }

  // Фильтр по статусу проверки
  if (filters.value.status !== 'all') {
    resultsData = resultsData.filter((result) => result.status === filters.value.status)
  }

  // Фильтр по статусу исправления
  if (filters.value.correctionStatus !== 'all') {
    resultsData = resultsData.filter(
      (result) => result.correctionStatus === filters.value.correctionStatus,
    )
  }

  // Фильтр по дате
  if (filters.value.dateRange !== 'all') {
    resultsData = resultsData.filter((result) =>
      isInDateRange(result.uploadDate, filters.value.dateRange),
    )
  }

  return resultsData
})

// Пагинация
const currentPage = ref(1)
const itemsPerPage = 10

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredResults.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / itemsPerPage)
})

// Обработчики событий
const handleSearch = (query: string) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleClearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const handleFiltersChange = () => {
  currentPage.value = 1
}

const handleFiltersReset = () => {
  currentPage.value = 1
}

// Навигация
const viewResult = (resultId: string) => {
  router.push(`/result/norm-controller/${resultId}`)
}

const goToHome = () => {
  router.push('/')
}

// Вспомогательные функции для отображения
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'processing':
      return AlertCircle
    default:
      return AlertCircle
  }
}

const getStatusColor = (status: string) => {
  if (isDarkMode.value) {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'processing':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  } else {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'processing':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Завершено'
    case 'processing':
      return 'В обработке'
    default:
      return 'Неизвестно'
  }
}

// Функции для статуса исправления согласно вашим настройкам
const getCorrectionStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return ThumbsUp
    case 'rejected':
      return ThumbsDown
    case 'removed':
      return FileText
    case 'processing':
    default:
      return Clock
  }
}

const getCorrectionStatusColor = (status: string) => {
  if (isDarkMode.value) {
    switch (status) {
      case 'approved':
        return 'text-green-400'
      case 'rejected':
        return 'text-red-400'
      case 'removed':
        return 'text-gray-400'
      case 'processing':
      default:
        return 'text-blue-400'
    }
  } else {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'removed':
        return 'text-gray-600'
      case 'processing':
      default:
        return 'text-blue-600'
    }
  }
}

const getCorrectionStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return 'Согласовано'
    case 'rejected':
      return 'Отклонено'
    case 'removed':
      return 'Снято'
    case 'processing':
    default:
      return 'В обработке'
  }
}

// Функции для стилей статуса исправления (как в вашем примере)
const getCorrectionStatusStyles = (status: string) => {
  const styles = {
    processing: {
      label: 'В обработке',
      color: isDarkMode.value ? 'text-blue-400' : 'text-blue-600',
      bgColor: isDarkMode.value ? 'bg-blue-900/20' : 'bg-blue-50',
      borderColor: isDarkMode.value ? 'border-blue-800' : 'border-blue-200',
      icon: '⏳',
    },
    approved: {
      label: 'Согласовано',
      color: isDarkMode.value ? 'text-green-400' : 'text-green-600',
      bgColor: isDarkMode.value ? 'bg-green-900/20' : 'bg-green-50',
      borderColor: isDarkMode.value ? 'border-green-800' : 'border-green-200',
      icon: '✅',
    },
    rejected: {
      label: 'Отклонено',
      color: isDarkMode.value ? 'text-red-400' : 'text-red-600',
      bgColor: isDarkMode.value ? 'bg-red-900/20' : 'bg-red-50',
      borderColor: isDarkMode.value ? 'border-red-800' : 'border-red-200',
      icon: '❌',
    },
    removed: {
      label: 'Снято',
      color: isDarkMode.value ? 'text-gray-400' : 'text-gray-600',
      bgColor: isDarkMode.value ? 'bg-gray-900/20' : 'bg-gray-50',
      borderColor: isDarkMode.value ? 'border-gray-800' : 'border-gray-200',
      icon: '📝',
    },
  }
  return styles[status as keyof typeof styles] || styles.processing
}

const getViolationColor = (count: number) => {
  if (count === 0) {
    return isDarkMode.value ? 'text-green-400' : 'text-green-600'
  } else if (count <= 5) {
    return isDarkMode.value ? 'text-yellow-400' : 'text-yellow-600'
  } else {
    return isDarkMode.value ? 'text-red-400' : 'text-red-600'
  }
}

const getViolationText = (count: number) => {
  if (count === 0) {
    return 'Нет ошибок'
  } else if (count <= 5) {
    return 'Несколько ошибок'
  } else {
    return 'Много ошибок'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateMobile = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Header -->
    <div class="mb-6 sm:mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            :class="['text-2xl sm:text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']"
          >
            История Проверок
          </h1>
          <p :class="['text-sm mt-1 sm:mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
            Все результаты анализа документации
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="flex items-center space-x-3">
        <svg class="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span :class="['text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
          Загрузка истории...
        </span>
      </div>
    </div>

    <!-- Search and Filters -->
    <div v-if="results.length > 0" class="mb-6 sm:mb-8 space-y-4">
      <!-- Search -->
      <div class="max-w-md mx-auto sm:mx-0">
        <SearchInput
          v-model="searchQuery"
          placeholder="Поиск по названию файла и имени автора..."
          @search="handleSearch"
          @clear="handleClearSearch"
        >
          <template #results-counter>
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 transform translate-y-1"
              enter-to-class="opacity-100 transform translate-y-0"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 transform translate-y-0"
              leave-to-class="opacity-0 transform translate-y-1"
            >
              <div
                v-if="searchQuery && filteredResults.length !== results.length"
                :class="[
                  'absolute top-full left-0 right-0 mt-2 px-3 py-2 text-xs rounded-lg z-10',
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 border border-gray-700'
                    : 'bg-white text-gray-600 border border-gray-200',
                ]"
              >
                <span v-if="filteredResults.length > 0">
                  Найдено {{ filteredResults.length }} из {{ results.length }} результатов
                </span>
                <span v-else class="text-red-500"> Ничего не найдено </span>
              </div>
            </Transition>
          </template>
        </SearchInput>
      </div>

      <!-- Filters -->
      <FilterPanel
        v-model="filters"
        @update:modelValue="handleFiltersChange"
        @reset="handleFiltersReset"
      />
    </div>

    <!-- Stats -->
    <div
      v-if="results.length > 0"
      class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      <div
        :class="[
          'p-4 sm:p-6 rounded-lg border',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        ]"
      >
        <div class="flex items-center">
          <div
            :class="[
              'w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mr-3 sm:mr-4',
              isDarkMode ? 'bg-blue-600' : 'bg-blue-100',
            ]"
          >
            <FileChartPie
              :class="['w-5 h-5 sm:w-6 sm:h-6', isDarkMode ? 'text-white' : 'text-blue-600']"
            />
          </div>
          <div>
            <p
              :class="[
                'text-xl sm:text-2xl font-bold',
                isDarkMode ? 'text-white' : 'text-gray-900',
              ]"
            >
              {{ filteredResults.length }}
            </p>
            <p :class="['text-xs sm:text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              {{
                searchQuery ||
                filters.status !== 'all' ||
                filters.dateRange !== 'all' ||
                filters.correctionStatus !== 'all'
                  ? 'Найдено'
                  : 'Всего проверок'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Results List -->
    <div v-if="filteredResults.length > 0" class="space-y-3 sm:space-y-4">
      <div
        v-for="result in paginatedResults"
        :key="result.id"
        :class="[
          'border rounded-lg p-4 sm:p-6 transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-[0.98]',
          isDarkMode
            ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300',
        ]"
        @click="viewResult(result.id)"
      >
        <!-- Desktop Layout -->
        <div class="hidden sm:flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center',
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
              ]"
            >
              <FileChartPie :class="['w-6 h-6', isDarkMode ? 'text-gray-400' : 'text-gray-600']" />
            </div>
            <div>
              <h3 :class="['font-medium', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ result.fileName }}
              </h3>
              <p
                :class="[
                  'text-sm mt-0.5 font-medium',
                  isDarkMode ? 'text-blue-400' : 'text-blue-600',
                ]"
              >
                {{ result.developerFullName }}
              </p>
              <div class="flex items-center space-x-4 mt-1">
                <span
                  :class="[
                    'text-sm px-2 py-1 rounded font-mono',
                    isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100',
                  ]"
                >
                  {{ result.fileType }}
                </span>
                <div class="flex items-center text-sm text-gray-500">
                  <Calendar class="w-4 h-4 mr-1" />
                  {{ formatDate(result.uploadDate) }}
                </div>

                <!-- Status indicator -->
                <div class="flex items-center">
                  <component
                    :is="getStatusIcon(result.status)"
                    :class="['w-4 h-4 mr-1', getStatusColor(result.status)]"
                  />
                  <span :class="['text-sm', getStatusColor(result.status)]">
                    {{ getStatusText(result.status) }}
                  </span>
                </div>

                <!-- Correction status indicator -->
                <div
                  :class="[
                    'flex items-center px-2 py-1 rounded text-sm border',
                    getCorrectionStatusStyles(result.correctionStatus).bgColor,
                    getCorrectionStatusStyles(result.correctionStatus).borderColor,
                  ]"
                >
                  <span class="mr-1">{{
                    getCorrectionStatusStyles(result.correctionStatus).icon
                  }}</span>
                  <span
                    :class="[
                      'font-medium',
                      getCorrectionStatusStyles(result.correctionStatus).color,
                    ]"
                  >
                    {{ getCorrectionStatusStyles(result.correctionStatus).label }}
                    <span
                      v-if="result.correctionStatus === 'rejected' && result.correctionStatusAuthor"
                      class="ml-1 opacity-80"
                    >
                      — {{ result.correctionStatusAuthor }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Показываем количество ошибок только для завершенных документов -->
            <div v-if="result.status === 'completed'" class="text-right">
              <div :class="['text-2xl font-bold', getViolationColor(result.totalViolations)]">
                {{ result.totalViolations }}
              </div>
              <div :class="['text-sm', getViolationColor(result.totalViolations)]">
                {{ getViolationText(result.totalViolations) }}
              </div>
            </div>

            <svg
              class="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        <!-- Mobile Layout -->
        <div class="sm:hidden">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div
                :class="[
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
                ]"
              >
                <FileChartPie
                  :class="['w-5 h-5', isDarkMode ? 'text-gray-400' : 'text-gray-600']"
                />
              </div>
              <div class="min-w-0 flex-1">
                <h3
                  :class="[
                    'font-medium text-sm leading-tight truncate',
                    isDarkMode ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ result.fileName }}
                </h3>
                <p
                  :class="[
                    'text-xs mt-0.5 truncate',
                    isDarkMode ? 'text-blue-400' : 'text-blue-600',
                  ]"
                >
                  {{ result.developerFullName }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    :class="[
                      'text-xs px-2 py-0.5 rounded font-mono',
                      isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100',
                    ]"
                  >
                    {{ result.fileType }}
                  </span>

                  <!-- Status indicator for mobile -->
                  <div class="flex items-center">
                    <component
                      :is="getStatusIcon(result.status)"
                      :class="['w-3 h-3 mr-1', getStatusColor(result.status)]"
                    />
                    <span :class="['text-xs', getStatusColor(result.status)]">
                      {{ getStatusText(result.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Показываем количество ошибок только для завершенных документов -->
            <div v-if="result.status === 'completed'" class="text-right">
              <div :class="['text-lg font-bold', getViolationColor(result.totalViolations)]">
                {{ result.totalViolations }}
              </div>
              <div :class="['text-xs mt-1', getViolationColor(result.totalViolations)]">
                {{ getViolationText(result.totalViolations) }}
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center text-xs text-gray-500">
              <Calendar class="w-3 h-3 mr-1" />
              {{ formatDateMobile(result.uploadDate) }}
            </div>

            <!-- Correction status for mobile -->
            <div
              :class="[
                'flex items-center px-2 py-1 rounded text-xs border',
                getCorrectionStatusStyles(result.correctionStatus).bgColor,
                getCorrectionStatusStyles(result.correctionStatus).borderColor,
              ]"
            >
              <span class="mr-1">{{
                getCorrectionStatusStyles(result.correctionStatus).icon
              }}</span>
              <span
                :class="['font-medium', getCorrectionStatusStyles(result.correctionStatus).color]"
              >
                {{ getCorrectionStatusStyles(result.correctionStatus).label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Violations (both layouts) - показываем только для завершенных документов -->
        <div
          v-if="result.status === 'completed' && result.totalViolations > 0"
          :class="[
            'pt-3 sm:pt-4 border-t',
            isDarkMode ? 'border-gray-700 mt-3 sm:mt-4' : 'border-gray-200 mt-3 sm:mt-4',
          ]"
        >
          <div class="flex items-center text-xs sm:text-sm text-gray-500">
            <AlertCircle class="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {{ result.totalViolations }} нарушений обнаружено
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6 sm:mt-8">
        <div class="flex space-x-1 sm:space-x-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- No Search Results -->
    <div
      v-else-if="
        !isLoading &&
        (searchQuery ||
          filters.status !== 'all' ||
          filters.dateRange !== 'all' ||
          filters.correctionStatus !== 'all') &&
        filteredResults.length === 0
      "
      class="p-8 sm:p-12 text-center"
    >
      <div :class="['mb-4', isDarkMode ? 'text-gray-600' : 'text-gray-400']">
        <Search class="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
      </div>
      <h3
        :class="[
          'text-lg sm:text-xl font-medium mb-2',
          isDarkMode ? 'text-gray-300' : 'text-gray-900',
        ]"
      >
        Ничего не найдено
      </h3>
      <p :class="['text-sm mb-6', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
        Попробуйте изменить поисковый запрос или настройки фильтров
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          v-if="searchQuery"
          @click="handleClearSearch"
          :class="[
            'inline-flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-medium min-h-[44px]',
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <X class="w-5 h-5 mr-2" />
          Очистить поиск
        </button>
        <button
          v-if="
            filters.status !== 'all' ||
            filters.dateRange !== 'all' ||
            filters.correctionStatus !== 'all'
          "
          @click="resetFilters"
          :class="[
            'inline-flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-medium min-h-[44px]',
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <X class="w-5 h-5 mr-2" />
          Сбросить фильтры
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isLoading && results.length === 0" class="p-8 sm:p-12 text-center">
      <div :class="['mb-4', isDarkMode ? 'text-gray-600' : 'text-gray-400']">
        <FileChartPie class="w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
      </div>
      <h3
        :class="[
          'text-lg sm:text-xl font-medium mb-2',
          isDarkMode ? 'text-gray-300' : 'text-gray-900',
        ]"
      >
        История пуста
      </h3>
      <p :class="['text-sm mb-6', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
        Здесь будут отображаться результаты всех проведенных анализов
      </p>
      <button
        @click="goToHome"
        class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Начать первую проверку
      </button>
    </div>
  </div>
</template>
