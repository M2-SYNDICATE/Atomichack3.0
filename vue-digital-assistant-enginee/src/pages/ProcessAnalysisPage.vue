<template>
  <div class="min-h-screen" :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              :class="[
                'text-2xl sm:text-3xl font-bold',
                isDarkMode ? 'text-white' : 'text-gray-900',
              ]"
            >
              Анализ Процесса
            </h1>
            <p :class="['text-sm mt-1 sm:mt-2', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
              Статистика длительности выполнения процессов и итераций между разработчиком и
              нормоконтролером
            </p>
          </div>
          <button
            @click="goToHistory"
            :class="[
              'inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]',
              isDarkMode
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            <History class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span class="hidden sm:inline">История проверок</span>
            <span class="sm:hidden">История</span>
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div
        :class="[
          'p-4 sm:p-6 rounded-lg border mb-6 sm:mb-8',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        ]"
      >
        <h3 :class="['text-lg font-medium mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">
          Диапазон анализа
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              :class="[
                'block text-sm font-medium mb-2',
                isDarkMode ? 'text-gray-300' : 'text-gray-700',
              ]"
            >
              Дата начала
            </label>
            <input
              type="date"
              v-model="dateRange.from"
              :class="[
                'w-full px-3 py-2.5 rounded-lg border transition-colors text-sm',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              ]"
            />
          </div>
          <div>
            <label
              :class="[
                'block text-sm font-medium mb-2',
                isDarkMode ? 'text-gray-300' : 'text-gray-700',
              ]"
            >
              Дата окончания
            </label>
            <input
              type="date"
              v-model="dateRange.to"
              :class="[
                'w-full px-3 py-2.5 rounded-lg border transition-colors text-sm',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              ]"
            />
          </div>
          <div>
            <label
              :class="[
                'block text-sm font-medium mb-2',
                isDarkMode ? 'text-gray-300' : 'text-gray-700',
              ]"
            >
              Единицы измерения
            </label>
            <select
              v-model="timeUnit"
              @change="handleTimeUnitChange"
              :class="[
                'w-full px-3 py-2.5 rounded-lg border transition-colors text-sm',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              ]"
            >
              <option value="days">Дни</option>
              <option value="hours">Часы</option>
              <option value="minutes">Минуты</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadAnalysis"
              :disabled="isLoading"
              :class="[
                'w-full px-4 py-2.5 rounded-lg font-medium transition-colors text-sm min-h-[44px]',
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                  : isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700',
              ]"
            >
              {{ isLoading ? 'Загрузка...' : 'Обновить анализ' }}
            </button>
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
            Загрузка анализа...
          </span>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else-if="analysisData" class="space-y-6 sm:space-y-8">
        <!-- Export Section -->
        <div
          :class="[
            'p-4 sm:p-6 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 :class="['text-lg font-medium', isDarkMode ? 'text-white' : 'text-gray-900']">
                Экспорт отчета
              </h3>
              <p :class="['text-sm mt-1', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                Скачайте детальный отчет в формате CSV
              </p>
            </div>
            <button
              @click="exportReport"
              :class="[
                'inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors text-sm min-h-[44px]',
                isDarkMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700',
              ]"
            >
              <Download class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span class="hidden sm:inline">Экспорт CSV</span>
              <span class="sm:hidden">Экспорт</span>
            </button>
          </div>
        </div>
        <!-- Global Statistics -->
        <div
          :class="[
            'p-4 sm:p-6 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <h3 :class="['text-lg font-medium mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">
            Общая статистика за период
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              :class="['p-4 rounded-lg text-center', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
            >
              <p :class="['text-2xl font-bold mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ analysisData.total_documents }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">Документов</p>
            </div>
            <div
              :class="['p-4 rounded-lg text-center', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
            >
              <p :class="['text-2xl font-bold mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ formatNumber(getTotalFixDuration) }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">Устранение</p>
            </div>
            <div
              :class="['p-4 rounded-lg text-center', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
            >
              <p :class="['text-2xl font-bold mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ formatNumber(getTotalReviewDuration) }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">Проверка</p>
            </div>
            <div
              :class="['p-4 rounded-lg text-center', isDarkMode ? 'bg-gray-700' : 'bg-gray-100']"
            >
              <p :class="['text-2xl font-bold mb-1', isDarkMode ? 'text-white' : 'text-gray-900']">
                {{ getTotalIterations }}
              </p>
              <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">Итераций</p>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <!-- Average Fix Duration -->
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
                  isDarkMode ? 'bg-green-600' : 'bg-green-100',
                ]"
              >
                <Clock
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  :class="isDarkMode ? 'text-white' : 'text-green-600'"
                />
              </div>
              <div>
                <p
                  :class="[
                    'text-xl sm:text-2xl font-bold',
                    isDarkMode ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ formatNumber(getAverageFixDuration) }}
                </p>
                <p :class="['text-xs sm:text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                  Среднее время устранения
                </p>
                <p :class="['text-xs mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
                  Min: {{ formatNumber(getMinFixDuration) }} · Max:
                  {{ formatNumber(getMaxFixDuration) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Average Review Duration -->
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
                <CheckCircle
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  :class="isDarkMode ? 'text-white' : 'text-blue-600'"
                />
              </div>
              <div>
                <p
                  :class="[
                    'text-xl sm:text-2xl font-bold',
                    isDarkMode ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ formatNumber(getAverageReviewDuration) }}
                </p>
                <p :class="['text-xs sm:text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                  Среднее время проверки
                </p>
                <p :class="['text-xs mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
                  Min: {{ formatNumber(getMinReviewDuration) }} · Max:
                  {{ formatNumber(getMaxReviewDuration) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Average Iterations -->
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
                  isDarkMode ? 'bg-purple-600' : 'bg-purple-100',
                ]"
              >
                <RefreshCw
                  class="w-5 h-5 sm:w-6 sm:h-6"
                  :class="isDarkMode ? 'text-white' : 'text-purple-600'"
                />
              </div>
              <div>
                <p
                  :class="[
                    'text-xl sm:text-2xl font-bold',
                    isDarkMode ? 'text-white' : 'text-gray-900',
                  ]"
                >
                  {{ analysisData.average_iterations.toFixed(1) }}
                </p>
                <p :class="['text-xs sm:text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                  Среднее количество итераций
                </p>
                <p :class="['text-xs mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
                  Min: {{ analysisData.min_iterations }} · Max: {{ analysisData.max_iterations }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- Iterations Timeline Chart -->
        <div
          :class="[
            'p-4 sm:p-6 rounded-lg border shadow-md transition-all duration-300',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <h3 :class="['text-lg font-semibold mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">
            График количества итераций во времени
          </h3>

          <apexchart
            type="area"
            height="400"
            :options="iterationTimelineOptions"
            :series="iterationTimelineSeries"
          />
        </div>

        <!-- Time Analysis Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <!-- Fix Duration Distribution -->
          <div
            :class="[
              'p-4 sm:p-6 rounded-lg border',
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
            ]"
          >
            <h3 :class="['text-lg font-medium mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">
              Распределение времени устранения
            </h3>
            <div class="space-y-4">
              <div
                v-for="range in timeRanges"
                :key="range.label"
                class="flex items-center justify-between"
              >
                <span
                  class="text-sm font-medium"
                  :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ range.label }}
                </span>
                <div class="flex items-center space-x-3 flex-1 max-w-xs">
                  <div
                    class="flex-1 bg-gray-200 rounded-full h-3"
                    :class="isDarkMode ? 'bg-gray-600' : 'bg-gray-200'"
                  >
                    <div
                      class="bg-green-500 h-3 rounded-full transition-all duration-500"
                      :style="{ width: `${getFixDurationPercentage(range)}%` }"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium w-12 text-right"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  >
                    {{ getDocumentsInTimeRange('fix', range) }} ({{
                      Math.round(getFixDurationPercentage(range))
                    }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Duration Distribution -->
          <div
            :class="[
              'p-4 sm:p-6 rounded-lg border',
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
            ]"
          >
            <h3 :class="['text-lg font-medium mb-4', isDarkMode ? 'text-white' : 'text-gray-900']">
              Распределение времени проверки
            </h3>
            <div class="space-y-4">
              <div
                v-for="range in timeRanges"
                :key="range.label"
                class="flex items-center justify-between"
              >
                <span
                  class="text-sm font-medium"
                  :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                >
                  {{ range.label }}
                </span>
                <div class="flex items-center space-x-3 flex-1 max-w-xs">
                  <div
                    class="flex-1 bg-gray-200 rounded-full h-3"
                    :class="isDarkMode ? 'bg-gray-600' : 'bg-gray-200'"
                  >
                    <div
                      class="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      :style="{ width: `${getReviewDurationPercentage(range)}%` }"
                    ></div>
                  </div>
                  <span
                    class="text-xs font-medium w-12 text-right"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
                  >
                    {{ getDocumentsInTimeRange('review', range) }} ({{
                      Math.round(getReviewDurationPercentage(range))
                    }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Details with Pagination -->
        <div
          :class="[
            'p-4 sm:p-6 rounded-lg border',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          ]"
        >
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 gap-4">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <h3 :class="['text-lg font-medium', isDarkMode ? 'text-white' : 'text-gray-900']">
                Детализация процессов по документам
              </h3>
              <div class="relative w-full sm:w-64">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Поиск по названию..."
                  :class="[
                    'w-full pl-9 pr-3 py-2 rounded-lg border text-sm transition-colors',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
                  ]"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="absolute left-2.5 top-2.5 w-4 h-4"
                  :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                  />
                </svg>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
                Документов:
              </span>
              <select
                v-model="itemsPerPage"
                :class="[
                  'px-3 py-1 rounded border text-sm',
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900',
                ]"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <!-- Documents Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-50'">
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Документ
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Устранение
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Проверка
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Итерации
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Сессии
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Общее время
                  </th>
                  <th
                    class="px-4 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                  >
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y" :class="isDarkMode ? 'divide-gray-700' : 'divide-gray-200'">
                <tr
                  v-for="doc in paginatedDocuments"
                  :key="doc.doc_id"
                  class="hover:bg-opacity-50 transition-colors cursor-pointer"
                  :class="isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'"
                  @click="toggleDocumentExpansion(doc.doc_id)"
                >
                  <td class="px-4 sm:px-6 py-4">
                    <div>
                      <p
                        :class="[
                          'font-medium text-sm',
                          isDarkMode ? 'text-white' : 'text-gray-900',
                        ]"
                      >
                        {{ doc.filename }}
                      </p>
                      <p :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
                        {{ formatDate(doc.upload_date) }}
                      </p>
                    </div>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getDurationColor(getDocumentFixDuration(doc), 'fix'),
                      ]"
                    >
                      {{ formatNumber(getDocumentFixDuration(doc)) }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getDurationColor(getDocumentReviewDuration(doc), 'review'),
                      ]"
                    >
                      {{ formatNumber(getDocumentReviewDuration(doc)) }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span
                      :class="[
                        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                        getIterationColor(doc.iterations),
                      ]"
                    >
                      {{ doc.iterations }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span
                      :class="[
                        'text-xs sm:text-sm',
                        isDarkMode ? 'text-gray-300' : 'text-gray-600',
                      ]"
                    >
                      {{ doc.sessions.length }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-4">
                    <span
                      :class="[
                        'text-xs sm:text-sm font-medium',
                        isDarkMode ? 'text-gray-300' : 'text-gray-700',
                      ]"
                    >
                      {{
                        formatNumber(getDocumentFixDuration(doc) + getDocumentReviewDuration(doc))
                      }}
                    </span>
                  </td>
                  <td class="px-4 sm:px-6 py-4 text-right">
                    <button
                      @click.stop="goToResult(doc.doc_id)"
                      :class="[
                        'inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        isDarkMode
                          ? 'bg-blue-700 text-white hover:bg-blue-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700',
                      ]"
                    >
                      Открыть
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4 px-4">
            <div class="text-sm" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
              Показано {{ startIndex + 1 }}-{{ endIndex }} из {{ analysisData.documents.length }}
            </div>
            <div class="flex space-x-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 disabled:bg-gray-800 disabled:text-gray-600'
                    : 'bg-gray-200 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400',
                ]"
              >
                Назад
              </button>
              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                :class="[
                  'px-3 py-1 rounded text-sm',
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 disabled:bg-gray-800 disabled:text-gray-600'
                    : 'bg-gray-200 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400',
                ]"
              >
                Вперед
              </button>
            </div>
          </div>

          <!-- Expanded Session Details -->
          <div
            v-if="expandedDocument"
            ref="sessionSection"
            class="mt-6 border-t pt-6"
            :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'"
          >
            <div class="flex justify-between items-center mb-4">
              <h4 class="font-medium" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                Сессии документа: {{ expandedDocument.filename }}
              </h4>
              <button
                @click="expandedDocument = null"
                :class="[
                  'text-sm px-3 py-1 rounded',
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-800',
                ]"
              >
                Свернуть
              </button>
            </div>

            <div class="grid gap-3">
              <div
                v-for="session in expandedDocument.sessions"
                :key="session.occ_id"
                class="p-4 rounded-xl border text-sm shadow-sm transition hover:shadow-md"
                :class="isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white'"
              >
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <span
                      class="block text-xs font-medium uppercase tracking-wide"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
                      >Точка ошибки</span
                    >
                    <p :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                      {{ session.error_point }}
                    </p>
                  </div>
                  <div>
                    <span
                      class="block text-xs font-medium uppercase tracking-wide"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
                      >Результат</span
                    >
                    <span
                      :class="[
                        'inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold',
                        session.outcome === 'fixed'
                          ? isDarkMode
                            ? 'bg-blue-900/40 text-blue-300 border border-blue-700'
                            : 'bg-blue-100 text-blue-700 border border-blue-300'
                          : isDarkMode
                            ? 'bg-red-900/40 text-red-300 border border-red-700'
                            : 'bg-red-100 text-red-700 border border-red-300',
                      ]"
                    >
                      {{ getOutcomeLabel(session.outcome) }}
                    </span>
                  </div>
                  <div>
                    <span
                      class="block text-xs font-medium uppercase tracking-wide"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
                      >Устранение</span
                    >
                    <p :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                      {{ formatNumber(getSessionFixDuration(session)) }}
                    </p>
                  </div>
                  <div>
                    <span
                      class="block text-xs font-medium uppercase tracking-wide"
                      :class="isDarkMode ? 'text-gray-500' : 'text-gray-500'"
                      >Проверка</span
                    >
                    <p :class="isDarkMode ? 'text-gray-200' : 'text-gray-700'">
                      {{ formatNumber(getSessionReviewDuration(session)) }}
                    </p>
                  </div>
                </div>

                <div
                  class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs border-t pt-2"
                  :class="
                    isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-600 border-gray-200'
                  "
                >
                  <div>
                    Обнаружено:
                    <span class="font-medium">{{ formatDateTime(session.detect_at) }}</span>
                  </div>
                  <div>
                    Исправлено:
                    <span class="font-medium">{{ formatDateTime(session.fixed_at) }}</span>
                  </div>
                  <div>
                    Проверено:
                    <span class="font-medium">{{ formatDateTime(session.review_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!isLoading"
        :class="[
          'p-8 sm:p-12 text-center rounded-lg border',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        ]"
      >
        <BarChart3
          class="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4"
          :class="isDarkMode ? 'text-gray-600' : 'text-gray-400'"
        />
        <h3
          :class="[
            'text-lg sm:text-xl font-medium mb-2',
            isDarkMode ? 'text-gray-300' : 'text-gray-900',
          ]"
        >
          Данные для анализа не найдены
        </h3>
        <p :class="['text-sm mb-6', isDarkMode ? 'text-gray-500' : 'text-gray-600']">
          Выберите диапазон дат и обновите анализ
        </p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, inject, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { api, handleApiError } from '@/services/api'
import { History, Clock, CheckCircle, RefreshCw, Download, BarChart3 } from 'lucide-vue-next'
import VueApexCharts from 'vue3-apexcharts'

const isDarkMode = inject('isDarkMode', ref(false))
const router = useRouter()

// Types
interface ProcessSession {
  prev_version_id: number
  curr_version_id: number
  detect_at: string
  fixed_at: string
  review_at: string
  fix_duration: number
  review_duration: number
  fix_duration_minutes: number
  review_duration_minutes: number
  fix_duration_hours: number
  review_duration_hours: number
  error_point: string
  occ_id: string
  outcome: string
}

interface ProcessDocument {
  doc_id: string
  filename: string
  upload_date: string
  fix_duration: number
  review_duration: number
  fix_duration_minutes: number
  review_duration_minutes: number
  fix_duration_hours: number
  review_duration_hours: number
  iterations: number
  sessions: ProcessSession[]
}

interface ProcessAnalysisData {
  average_fix_duration: number
  average_review_duration: number
  max_fix_duration: number
  min_fix_duration: number
  max_review_duration: number
  min_review_duration: number
  average_fix_duration_minutes: number
  average_review_duration_minutes: number
  average_fix_duration_hours: number
  average_review_duration_hours: number
  max_fix_duration_minutes: number
  min_fix_duration_minutes: number
  max_review_duration_minutes: number
  min_review_duration_minutes: number
  max_fix_duration_hours: number
  min_fix_duration_hours: number

  max_review_duration_hours: number
  min_review_duration_hours: number

  average_iterations: number
  max_iterations: number
  min_iterations: number
  total_documents: number
  documents: ProcessDocument[]

  iterations_timeline?: {
    timestamp: string
    iterations_count: number
  }[]
}

// Data
const analysisData = ref<ProcessAnalysisData | null>(null)
const isLoading = ref(false)
const timeUnit = ref<'days' | 'hours' | 'minutes'>('days')
const expandedDocument = ref<ProcessDocument | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sessionSection = ref<HTMLElement | null>(null)

// Date range (default: last 30 days)
const dateRange = ref({
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  to: new Date().toISOString().split('T')[0],
})

// Поиск по названию документа
const searchQuery = ref('')

const filteredDocuments = computed(() => {
  if (!analysisData.value) return []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return analysisData.value.documents
  return analysisData.value.documents.filter((doc) => doc.filename.toLowerCase().includes(query))
})

// Time ranges for distribution charts
const timeRanges = computed(() => {
  if (timeUnit.value === 'days') {
    return [
      { label: '≤ 1 дня', min: 0, max: 1 },
      { label: '1-3 дня', min: 1, max: 3 },
      { label: '3-7 дней', min: 3, max: 7 },
      { label: '> 7 дней', min: 7, max: Infinity },
    ]
  } else if (timeUnit.value === 'hours') {
    return [
      { label: '≤ 1 часа', min: 0, max: 1 },
      { label: '1-6 часов', min: 1, max: 6 },
      { label: '6-24 часа', min: 6, max: 24 },
      { label: '> 24 часов', min: 24, max: Infinity },
    ]
  } else {
    return [
      { label: '≤ 30 мин', min: 0, max: 30 },
      { label: '30-60 мин', min: 30, max: 60 },
      { label: '1-3 часа', min: 60, max: 180 },
      { label: '> 3 часов', min: 180, max: Infinity },
    ]
  }
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredDocuments.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredDocuments.value.length)
})

const paginatedDocuments = computed(() => {
  return filteredDocuments.value.slice(startIndex.value, endIndex.value)
})

// New computed properties for better charts
const getMaxTotalDuration = computed(() => {
  if (!analysisData.value) return 1
  return Math.max(
    ...analysisData.value.documents.map(
      (doc) => getDocumentFixDuration(doc) + getDocumentReviewDuration(doc),
    ),
  )
})

const iterationTimelineSeries = computed(() => {
  if (!analysisData.value?.iterations_timeline) return []

  const data = analysisData.value.iterations_timeline
    .map((point) => ({
      x: new Date(point.timestamp).getTime(),
      y: point.iterations_count,
    }))
    .sort((a, b) => a.x - b.x)

  return [
    {
      name: 'Количество итераций',
      data,
    },
  ]
})

const iterationTimelineOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
    zoom: { enabled: false },
    foreColor: isDarkMode.value ? '#9ca3af' : '#4b5563',
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 5,
    colors: [isDarkMode.value ? '#1f2937' : '#ffffff'],
    strokeColors: ['#3b82f6'],
    strokeWidth: 2,
    hover: { size: 7 },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
  grid: {
    borderColor: isDarkMode.value ? '#374151' : '#e5e7eb',
    strokeDashArray: 4,
  },
  xaxis: {
    type: 'datetime',
    labels: {
      show: true,
      rotate: -30,
      formatter: (val: string) => {
        const date = new Date(parseInt(val))
        return date.toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
      style: {
        colors: isDarkMode.value ? '#9ca3af' : '#4b5563',
        fontSize: '12px',
      },
    },
    title: {
      text: 'Дата и время',
      style: {
        color: isDarkMode.value ? '#9ca3af' : '#4b5563',
      },
    },
  },
  yaxis: {
    min: 0,
    forceNiceScale: true,
    labels: {
      style: { colors: isDarkMode.value ? '#9ca3af' : '#4b5563' },
    },
    title: {
      text: 'Количество итераций',
      style: { color: isDarkMode.value ? '#9ca3af' : '#4b5563' },
    },
  },
  tooltip: {
    theme: isDarkMode.value ? 'dark' : 'light',
    x: {
      formatter: (val: number) =>
        new Date(val).toLocaleString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    y: {
      formatter: (val: number) => `${val} ит.`,
    },
  },
  colors: ['#3b82f6'],
}))

// Computed properties for different time units
const getAverageFixDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.average_fix_duration
  if (timeUnit.value === 'hours') return analysisData.value.average_fix_duration_hours
  return analysisData.value.average_fix_duration_minutes
})

const getAverageReviewDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.average_review_duration
  if (timeUnit.value === 'hours') return analysisData.value.average_review_duration_hours
  return analysisData.value.average_review_duration_minutes
})

const getMaxFixDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.max_fix_duration
  if (timeUnit.value === 'hours') return analysisData.value.max_fix_duration_hours
  return analysisData.value.max_fix_duration_minutes
})

const getMinFixDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.min_fix_duration
  if (timeUnit.value === 'hours') return analysisData.value.min_fix_duration_hours
  return analysisData.value.min_fix_duration_minutes
})

const getMaxReviewDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.max_review_duration
  if (timeUnit.value === 'hours') return analysisData.value.max_review_duration_hours
  return analysisData.value.max_review_duration_minutes
})

const getMinReviewDuration = computed(() => {
  if (!analysisData.value) return 0
  if (timeUnit.value === 'days') return analysisData.value.min_review_duration
  if (timeUnit.value === 'hours') return analysisData.value.min_review_duration_hours
  return analysisData.value.min_review_duration_minutes
})

const getTotalFixDuration = computed(() => {
  if (!analysisData.value) return 0
  return analysisData.value.documents.reduce((total, doc) => {
    return total + getDocumentFixDuration(doc)
  }, 0)
})

const getTotalReviewDuration = computed(() => {
  if (!analysisData.value) return 0
  return analysisData.value.documents.reduce((total, doc) => {
    return total + getDocumentReviewDuration(doc)
  }, 0)
})

const getTotalIterations = computed(() => {
  if (!analysisData.value) return 0
  return analysisData.value.documents.reduce((total, doc) => {
    return total + doc.iterations
  }, 0)
})

const getDocumentsWithMultipleIterations = computed(() => {
  if (!analysisData.value) return 0
  return analysisData.value.documents.filter((doc) => doc.iterations > 1).length
})

// New computed properties for charts
const iterationDistribution = computed(() => {
  if (!analysisData.value) return {}

  const distribution: { [key: number]: number } = {}
  analysisData.value.documents.forEach((doc) => {
    distribution[doc.iterations] = (distribution[doc.iterations] || 0) + 1
  })

  // Ensure we have entries for 0, 1, 2, 3+ iterations
  const result: { [key: string]: number } = {}
  for (let i = 0; i <= Math.max(3, ...Object.keys(distribution).map(Number)); i++) {
    if (i >= 3) {
      result['3+'] = (result['3+'] || 0) + (distribution[i] || 0)
    } else {
      result[i.toString()] = distribution[i] || 0
    }
  }

  return result
})

// Methods
const getDocumentFixDuration = (doc: ProcessDocument): number => {
  if (timeUnit.value === 'days') return doc.fix_duration
  if (timeUnit.value === 'hours') return doc.fix_duration_hours
  return doc.fix_duration_minutes
}

const getDocumentReviewDuration = (doc: ProcessDocument): number => {
  if (timeUnit.value === 'days') return doc.review_duration
  if (timeUnit.value === 'hours') return doc.review_duration_hours
  return doc.review_duration_minutes
}

const getSessionFixDuration = (session: ProcessSession): number => {
  if (timeUnit.value === 'days') return session.fix_duration
  if (timeUnit.value === 'hours') return session.fix_duration_hours
  return session.fix_duration_minutes
}

const getSessionReviewDuration = (session: ProcessSession): number => {
  if (timeUnit.value === 'days') return session.review_duration
  if (timeUnit.value === 'hours') return session.review_duration_hours
  return session.review_duration_minutes
}

const getShortFileName = (filename: string) => {
  if (filename.length <= 20) return filename
  return filename.substring(0, 17) + '...'
}

const toggleDocumentExpansion = (docId: string) => {
  if (!analysisData.value) return
  const doc = analysisData.value.documents.find((d) => d.doc_id === docId)
  if (doc) {
    const wasOpen = expandedDocument.value?.doc_id === docId
    expandedDocument.value = wasOpen ? null : doc

    // если открылся — плавно прокручиваем
    if (!wasOpen) {
      nextTick(() => {
        sessionSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    expandedDocument.value = null
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    expandedDocument.value = null
  }
}

const getIterationStats = (iterations: number) => {
  if (!analysisData.value) return 0
  if (iterations === 3) {
    return analysisData.value.documents.filter((doc) => doc.iterations >= 3).length
  }
  return analysisData.value.documents.filter((doc) => doc.iterations === iterations).length
}

const formatNumber = (value: number): string => {
  if (timeUnit.value === 'days') {
    return `${value.toFixed(1)}д`
  } else if (timeUnit.value === 'hours') {
    return `${value.toFixed(1)}ч`
  } else {
    return `${Math.round(value)}м`
  }
}

const getFixDurationPercentage = (range: { min: number; max: number }) => {
  if (!analysisData.value) return 0
  const count = getDocumentsInTimeRange('fix', range)
  return (count / analysisData.value.total_documents) * 100
}

const getReviewDurationPercentage = (range: { min: number; max: number }) => {
  if (!analysisData.value) return 0
  const count = getDocumentsInTimeRange('review', range)
  return (count / analysisData.value.total_documents) * 100
}

const getDocumentsInTimeRange = (type: 'fix' | 'review', range: { min: number; max: number }) => {
  if (!analysisData.value) return 0

  return analysisData.value.documents.filter((doc) => {
    const duration = type === 'fix' ? getDocumentFixDuration(doc) : getDocumentReviewDuration(doc)
    return duration > range.min && duration <= range.max
  }).length
}

const getDurationColor = (duration: number, type: 'fix' | 'review') => {
  // Different thresholds for different time units
  let goodThreshold, warningThreshold

  if (timeUnit.value === 'days') {
    goodThreshold = type === 'fix' ? 2 : 1
    warningThreshold = type === 'fix' ? 5 : 3
  } else if (timeUnit.value === 'hours') {
    goodThreshold = type === 'fix' ? 48 : 24
    warningThreshold = type === 'fix' ? 120 : 72
  } else {
    goodThreshold = type === 'fix' ? 2880 : 1440
    warningThreshold = type === 'fix' ? 7200 : 4320
  }

  if (duration <= goodThreshold) {
    return isDarkMode.value
      ? 'bg-green-900/20 text-green-400 border border-green-800'
      : 'bg-green-50 text-green-700 border border-green-200'
  } else if (duration <= warningThreshold) {
    return isDarkMode.value
      ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  } else {
    return isDarkMode.value
      ? 'bg-red-900/20 text-red-400 border border-red-800'
      : 'bg-red-50 text-red-700 border border-red-200'
  }
}

const getIterationColor = (iterations: number) => {
  if (iterations === 1) {
    return isDarkMode.value
      ? 'bg-green-900/20 text-green-400 border border-green-800'
      : 'bg-green-50 text-green-700 border border-green-200'
  } else if (iterations === 2) {
    return isDarkMode.value
      ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  } else {
    return isDarkMode.value
      ? 'bg-red-900/20 text-red-400 border border-red-800'
      : 'bg-red-50 text-red-700 border border-red-200'
  }
}

const getIterationColorClass = (iterations: number) => {
  if (iterations === 0) return isDarkMode.value ? 'bg-gray-600' : 'bg-gray-400'
  if (iterations === 1) return isDarkMode.value ? 'bg-green-600' : 'bg-green-500'
  if (iterations === 2) return isDarkMode.value ? 'bg-yellow-600' : 'bg-yellow-500'
  return isDarkMode.value ? 'bg-red-600' : 'bg-red-500'
}

const getOutcomeLabel = (outcome: string) => {
  const labels: { [key: string]: string } = {
    fixed: 'Исправлено',
    rejected: 'Отказано',
  }
  return labels[outcome] || outcome
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleTimeUnitChange = () => {
  // При смене единиц измерения перезагружаем данные
  if (analysisData.value) {
    // Мы уже имеем все данные, просто обновляем отображение
  }
}

// API calls
const loadAnalysis = async () => {
  isLoading.value = true
  try {
    const startDate = new Date(`${dateRange.value.from}T00:00:00Z`).toISOString()
    const endDate = new Date(`${dateRange.value.to}T23:59:59Z`).toISOString()

    // Бэкенд возвращает все единицы измерения сразу
    analysisData.value = await api.getProcessAnalysis(startDate, endDate)
  } catch (error) {
    console.error('Error loading process analysis:', error)
    alert(handleApiError(error))
  } finally {
    isLoading.value = false
  }
}

const exportReport = async () => {
  try {
    const startDate = new Date(`${dateRange.value.from}T00:00:00Z`).toISOString()
    const endDate = new Date(`${dateRange.value.to}T23:59:59Z`).toISOString()

    // Показываем индикатор загрузки (опционально)
    isLoading.value = true

    // 🔹 Вызов нового API-метода
    const blob = await api.exportProcessAnalysisCsv(startDate, endDate)

    // 🔹 Создание и загрузка CSV-файла
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `process_analysis_${dateRange.value.from}_${dateRange.value.to}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Ошибка экспорта CSV:', error)
    alert(handleApiError(error))
  } finally {
    isLoading.value = false
  }
}

const goToHistory = () => {
  router.push('/history')
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Redirects to the result page for a given document ID.
 *
 * @param {string} docId - The ID of the document to view the result for.
 */
/*******  35b33c85-6328-42f8-8ae1-a0740a77a38b  *******/
const goToResult = (docId: string) => {
  if (!docId) return
  router.push(`/result/${docId}`)
}

// Lifecycle
onMounted(() => {
  loadAnalysis()
})
</script>
