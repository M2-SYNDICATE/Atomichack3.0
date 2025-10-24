<script setup lang="ts">
import { inject, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileChartPie,
  AlertCircle,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  ExternalLink,
  Download,
} from 'lucide-vue-next'
import { api, handleApiError, type HistoryItem, type ErrorCounts } from '@/services/api'

const isDarkMode = inject('isDarkMode', ref(false))
const router = useRouter()

// Типы для статистики
interface RequirementStats {
  id: string
  title: string
  totalViolations: number
  affectedDocuments: number
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface ViolationDocument {
  id: string
  fileName: string
  fileType: string
  uploadDate: string
  pdfUrl?: string
  violationDetails: {
    requirementId: string
    description: string
    section: string
    pageNumber?: number
    severity: 'critical' | 'high' | 'medium' | 'low'
    pdfAnnotationUrl?: string
  }
}

// Данные статистики
const requirementsStats = ref<RequirementStats[]>([])
const violationDocuments = ref<ViolationDocument[]>([])
const isLoading = ref(false)
const selectedRequirement = ref<string | null>(null)

// Загрузка статистики
const loadStatistics = async () => {
  isLoading.value = true
  try {
    const response = await api.getRequirementsStats()
    console.log('getRequirementsStats response:', response)

    // ✅ Правильное извлечение данных
    const reqs = response?.requirementsStats || []
    const docs = response?.violationDocuments || []

    // Преобразуем требования
    requirementsStats.value = reqs.map((r: any) => ({
      id: r.id,
      title: r.title,
      totalViolations: r.totalViolations,
      affectedDocuments: r.affectedDocuments,
      severity: r.severity,
    }))

    // Преобразуем документы
    violationDocuments.value = docs.map((d: any) => ({
      id: d.id,
      fileName: d.fileName,
      fileType: d.fileType,
      uploadDate: d.uploadDate,
      pdfUrl: d.pdfUrl,
      violationDetails: {
        requirementId: d.violationDetails.requirementId,
        description: d.violationDetails.description,
        severity: d.violationDetails.severity,
        pdfAnnotationUrl: d.violationDetails.pdfAnnotationUrl,
      },
    }))
  } catch (error) {
    console.error('Error loading statistics:', error)
    alert(`Ошибка загрузки статистики: ${handleApiError(error)}`)
  } finally {
    isLoading.value = false
  }
}

// Фильтрация документов по выбранному требованию
const filteredDocuments = computed(() => {
  if (!selectedRequirement.value) return []
  return violationDocuments.value.filter(
    (doc) => doc.violationDetails.requirementId === selectedRequirement.value,
  )
})

// Получение информации о выбранном требовании
const selectedRequirementInfo = computed(() => {
  if (!selectedRequirement.value) return null
  return requirementsStats.value.find((req) => req.id === selectedRequirement.value)
})

// Функции для стилей
const getSeverityColor = (severity: string) => {
  if (isDarkMode.value) {
    switch (severity) {
      case 'critical':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  } else {
    switch (severity) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }
}

const getSeverityBgColor = (severity: string) => {
  if (isDarkMode.value) {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/20'
      case 'high':
        return 'bg-orange-900/20'
      case 'medium':
        return 'bg-yellow-900/20'
      case 'low':
        return 'bg-blue-900/20'
      default:
        return 'bg-gray-900/20'
    }
  } else {
    switch (severity) {
      case 'critical':
        return 'bg-red-50'
      case 'high':
        return 'bg-orange-50'
      case 'medium':
        return 'bg-yellow-50'
      case 'low':
        return 'bg-blue-50'
      default:
        return 'bg-gray-50'
    }
  }
}

const getSeverityBorderColor = (severity: string) => {
  if (isDarkMode.value) {
    switch (severity) {
      case 'critical':
        return 'border-red-800'
      case 'high':
        return 'border-orange-800'
      case 'medium':
        return 'border-yellow-800'
      case 'low':
        return 'border-blue-800'
      default:
        return 'border-gray-800'
    }
  } else {
    switch (severity) {
      case 'critical':
        return 'border-red-200'
      case 'high':
        return 'border-orange-200'
      case 'medium':
        return 'border-yellow-200'
      case 'low':
        return 'border-blue-200'
      default:
        return 'border-gray-200'
    }
  }
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return XCircle
    case 'high':
      return AlertCircle
    case 'medium':
      return TrendingUp
    case 'low':
      return BarChart3
    default:
      return AlertCircle
  }
}

// Обработчики
const selectRequirement = (requirementId: string) => {
  selectedRequirement.value = requirementId
}

const clearSelection = () => {
  selectedRequirement.value = null
}

const viewDocument = (documentId: string) => {
  router.push(`/result/${documentId}`)
}

// Функция для открытия PDF с аннотациями
const openAnnotatedPdf = (document: ViolationDocument, event: Event) => {
  event.stopPropagation()

  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin

  const url = document.violationDetails.pdfAnnotationUrl || document.pdfUrl || null

  if (url) {
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
    console.log('🧭 Открываю PDF:', fullUrl)
    window.open(fullUrl, '_blank')
  } else {
    alert('PDF документ недоступен')
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

onMounted(() => {
  loadStatistics()
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            :class="['text-2xl sm:text-3xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']"
          >
            Статистика по ГОСТ
          </h1>
          <p :class="['text-sm mt-1', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
            Анализ соответствия 9 стандартам ГОСТ
          </p>
        </div>

        <button
          v-if="selectedRequirement"
          @click="clearSelection"
          :class="[
            'inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium text-sm',
            isDarkMode
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          <XCircle class="w-4 h-4 mr-2" />
          Назад к списку
        </button>
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
          Загрузка статистики...
        </span>
      </div>
    </div>

    <!-- Requirements Grid -->
    <div v-if="!selectedRequirement && !isLoading" class="space-y-6">
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          :class="[
            'p-4 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                isDarkMode ? 'bg-blue-600' : 'bg-blue-100',
              ]"
            >
              <FileText :class="['w-5 h-5', isDarkMode ? 'text-white' : 'text-blue-600']" />
            </div>
            <div>
              <p :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ requirementsStats.length }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                Стандартов ГОСТ
              </p>
            </div>
          </div>
        </div>

        <div
          :class="[
            'p-4 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                isDarkMode ? 'bg-orange-600' : 'bg-orange-100',
              ]"
            >
              <AlertCircle :class="['w-5 h-5', isDarkMode ? 'text-white' : 'text-orange-600']" />
            </div>
            <div>
              <p :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ requirementsStats.reduce((sum, req) => sum + req.totalViolations, 0) }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                Всего замечаний
              </p>
            </div>
          </div>
        </div>

        <div
          :class="[
            'p-4 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex items-center">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mr-3',
                isDarkMode ? 'bg-purple-600' : 'bg-purple-100',
              ]"
            >
              <FileChartPie :class="['w-5 h-5', isDarkMode ? 'text-white' : 'text-purple-600']" />
            </div>
            <div>
              <p :class="['text-xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ new Set(violationDocuments.map((doc) => doc.id)).size }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                Документов проверено
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="requirement in requirementsStats"
          :key="requirement.id"
          :class="[
            'border rounded-lg p-4 transition-colors cursor-pointer hover:border-gray-400',
            isDarkMode
              ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
              : 'bg-white border-gray-200',
          ]"
          @click="selectRequirement(requirement.id)"
        >
          <div class="flex items-start justify-between mb-3">
            <div
              :class="[
                'flex items-center px-2 py-1 rounded text-sm border',
                getSeverityBgColor(requirement.severity),
                getSeverityBorderColor(requirement.severity),
              ]"
            >
              <component
                :is="getSeverityIcon(requirement.severity)"
                :class="['w-3 h-3 mr-1', getSeverityColor(requirement.severity)]"
              />
              <span :class="['font-medium', getSeverityColor(requirement.severity)]">
                {{
                  requirement.severity === 'critical'
                    ? 'Критическое'
                    : requirement.severity === 'high'
                      ? 'Высокое'
                      : requirement.severity === 'medium'
                        ? 'Среднее'
                        : 'Низкое'
                }}
              </span>
            </div>
          </div>

          <h3 :class="['font-medium mb-3 text-lg', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ requirement.title }}
          </h3>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <AlertCircle class="w-4 h-4 mr-1 text-red-500" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ requirement.totalViolations }}
                </span>
              </div>
              <div class="flex items-center">
                <FileText class="w-4 h-4 mr-1 text-blue-500" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ requirement.affectedDocuments }}
                </span>
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
      </div>
    </div>

    <!-- Documents List for Selected Requirement -->
    <div v-if="selectedRequirement && !isLoading" class="space-y-6">
      <!-- Requirement Header -->
      <div
        :class="[
          'border rounded-lg p-6',
          getSeverityBgColor(selectedRequirementInfo?.severity || 'medium'),
          getSeverityBorderColor(selectedRequirementInfo?.severity || 'medium'),
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center mb-3">
              <component
                :is="getSeverityIcon(selectedRequirementInfo?.severity || 'medium')"
                :class="[
                  'w-6 h-6 mr-3',
                  getSeverityColor(selectedRequirementInfo?.severity || 'medium'),
                ]"
              />
              <h2
                :class="[
                  'text-xl font-bold',
                  getSeverityColor(selectedRequirementInfo?.severity || 'medium'),
                ]"
              >
                {{ selectedRequirementInfo?.title }}
              </h2>
            </div>
            <div class="flex items-center space-x-6 text-sm">
              <div class="flex items-center">
                <AlertCircle class="w-4 h-4 mr-1 text-white" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ selectedRequirementInfo?.totalViolations }} замечаний
                </span>
              </div>
              <div class="flex items-center">
                <FileText class="w-4 h-4 mr-1 text-white" />
                <span :class="[isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ filteredDocuments.length }} документов с нарушениями
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents List -->
      <div class="space-y-4">
        <div
          v-for="document in filteredDocuments"
          :key="document.id"
          :class="[
            'border rounded-lg p-4 transition-colors',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-4 flex-1">
              <div
                :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100',
                ]"
              >
                <FileText :class="['w-6 h-6', isDarkMode ? 'text-gray-400' : 'text-gray-600']" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 :class="['font-medium mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">
                  {{ document.fileName }}
                </h3>
                <div class="flex items-center space-x-4 text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded font-mono',
                      isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100',
                    ]"
                  >
                    {{ document.fileType }}
                  </span>
                  <span :class="[isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                    {{ formatDate(document.uploadDate) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <button
                @click="viewDocument(document.id)"
                :class="[
                  'inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700',
                ]"
              >
                <ExternalLink class="w-4 h-4 mr-1" />
                Детали
              </button>

              <button
                v-if="document.violationDetails.pdfAnnotationUrl || document.pdfUrl"
                @click="openAnnotatedPdf(document, $event)"
                :class="[
                  'inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isDarkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700',
                ]"
              >
                <span class="mr-1">✏️</span>
                PDF
              </button>
            </div>
          </div>

          <!-- Violation Details -->
          <div
            :class="[
              'border-l-4 pl-4 py-2',
              isDarkMode ? 'border-red-500 bg-red-900/10' : 'border-red-400 bg-red-50',
            ]"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-1">
                  <span :class="['font-medium', isDarkMode ? 'text-red-300' : 'text-red-700']">
                    Замечание
                  </span>
                </div>
                <p :class="['text-sm mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700']">
                  {{ document.violationDetails.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Documents Message -->
      <div
        v-if="filteredDocuments.length === 0"
        :class="[
          'text-center py-12 rounded-lg border',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        ]"
      >
        <CheckCircle class="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h3 :class="['text-lg font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-900']">
          Нарушений не найдено
        </h3>
        <p :class="['text-sm', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
          По выбранному ГОСТ не обнаружено документов с нарушениями
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && requirementsStats.length === 0 && !selectedRequirement"
      class="p-12 text-center"
    >
      <div :class="['mb-4', isDarkMode ? 'text-gray-600' : 'text-gray-400']">
        <BarChart3 class="w-16 h-16 mx-auto" />
      </div>
      <h3 :class="['text-xl font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-900']">
        Статистика недоступна
      </h3>
      <p :class="['text-sm mb-6', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
        Данные для статистики по ГОСТ пока не собраны
      </p>
    </div>
  </div>
</template>
