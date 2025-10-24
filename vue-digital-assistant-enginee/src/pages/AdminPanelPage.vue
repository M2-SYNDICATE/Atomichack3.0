<template>
  <div
    class="min-h-screen transition-colors duration-200"
    :class="isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1
            :class="[
              'text-4xl font-bold tracking-tight',
              isDarkMode ? 'text-white' : 'text-gray-900',
            ]"
          >
            Админ-панель
          </h1>
          <p :class="['mt-2 text-lg', isDarkMode ? 'text-white' : 'text-gray-600']">
            Управление системой и пользователями
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-8">
        <div
          class="flex space-x-1 p-1 rounded-2xl"
          :class="isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-200'"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 text-center',
              activeTab === tab.key
                ? isDarkMode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : isDarkMode
                  ? 'text-white hover:text-white hover:bg-gray-700/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'create'" class="space-y-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'">
            <svg
              class="w-6 h-6"
              :class="isDarkMode ? 'text-blue-400' : 'text-blue-600'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 :class="['text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            Создание аккаунта
          </h2>
        </div>

        <div
          :class="[
            'p-8 rounded-2xl border-2 transition-all duration-200',
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl'
              : 'bg-white border-gray-200 shadow-xl',
          ]"
        >
          <form
            @submit.prevent="createAccount"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div class="space-y-2">
              <label
                class="text-sm font-semibold flex items-center space-x-2"
                :class="isDarkMode ? 'text-white' : 'text-gray-700'"
              >
                <span>Роль</span>
                <svg
                  class="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </label>
              <select
                v-model="newAccount.role"
                required
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white focus:bg-gray-700 placeholder-white'
                    : 'bg-white border-gray-300 text-gray-900 focus:bg-white focus:shadow-lg placeholder-gray-500',
                ]"
              >
                <option value="developer">Разработчик</option>
                <option value="norm_controller">Нормоконтролёр</option>
                <option value="admin">Админ</option>
              </select>
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-semibold"
                :class="isDarkMode ? 'text-white' : 'text-gray-700'"
              >
                ФИО
              </label>
              <input
                v-model="newAccount.full_name"
                required
                placeholder="Введите ФИО"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-white focus:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:shadow-lg',
                ]"
              />
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-semibold"
                :class="isDarkMode ? 'text-white' : 'text-gray-700'"
              >
                Логин
              </label>
              <input
                v-model="newAccount.login"
                required
                placeholder="login123"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-white focus:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:shadow-lg',
                ]"
              />
            </div>

            <div class="space-y-2">
              <label
                class="text-sm font-semibold"
                :class="isDarkMode ? 'text-white' : 'text-gray-700'"
              >
                Пароль
              </label>
              <input
                v-model="newAccount.password"
                required
                type="password"
                placeholder="••••••••"
                :class="[
                  'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-white focus:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:shadow-lg',
                ]"
              />
            </div>

            <div class="md:col-span-2 lg:col-span-4 flex justify-end mt-4">
              <button
                type="submit"
                :disabled="isCreating"
                :class="[
                  'px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center space-x-2',
                  isCreating
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5',
                ]"
              >
                <svg
                  v-if="isCreating"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                <span>{{ isCreating ? 'Создание...' : 'Создать аккаунт' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Accounts list -->
      <div v-if="activeTab === 'list'" class="space-y-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-green-500/20' : 'bg-green-100'">
            <svg
              class="w-6 h-6"
              :class="isDarkMode ? 'text-green-400' : 'text-green-600'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 :class="['text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            Список аккаунтов
          </h2>
        </div>

        <div
          :class="[
            'rounded-2xl border-2 transition-all duration-200 overflow-hidden',
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl'
              : 'bg-white border-gray-200 shadow-xl',
          ]"
        >
          <div class="p-6 border-b" :class="isDarkMode ? 'border-gray-700' : 'border-gray-200'">
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
            >
              <div class="relative flex-1 sm:max-w-md">
                <svg
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  :class="isDarkMode ? 'text-white' : 'text-gray-500'"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  v-model="searchQuery"
                  placeholder="Поиск по логину..."
                  :class="[
                    'pl-10 pr-4 py-3 rounded-xl border-2 text-sm w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-white focus:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:shadow-lg',
                  ]"
                />
              </div>
              <div class="text-sm" :class="isDarkMode ? 'text-white' : 'text-gray-600'">
                Найдено: {{ filteredUsers.length }} пользователей
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr :class="isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'">
                  <th
                    v-for="col in ['ID', 'Логин', 'ФИО', 'Роль']"
                    :key="col"
                    class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    :class="isDarkMode ? 'text-white' : 'text-gray-600'"
                  >
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(user, index) in filteredUsers"
                  :key="user.id"
                  class="border-b transition-colors duration-150"
                  :class="[
                    isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700/30'
                      : 'border-gray-200 hover:bg-gray-50',
                    index % 2 === 0
                      ? isDarkMode
                        ? 'bg-gray-800/20'
                        : 'bg-white'
                      : isDarkMode
                        ? 'bg-gray-800/40'
                        : 'bg-gray-50/50',
                  ]"
                >
                  <td
                    class="px-6 py-4 font-mono text-sm"
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    {{ user.id }}
                  </td>
                  <td
                    class="px-6 py-4 font-medium"
                    :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                  >
                    {{ user.login }}
                  </td>
                  <td class="px-6 py-4" :class="isDarkMode ? 'text-white' : 'text-gray-900'">
                    {{ user.full_name }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                        getRoleBadgeClass(user.role),
                      ]"
                    >
                      {{ roleLabel(user.role) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Weekends & Holidays -->
      <div v-if="activeTab === 'holidays'" class="space-y-6">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-100'">
            <svg
              class="w-6 h-6"
              :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-600'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 :class="['text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            Настройка выходных и праздничных дней
          </h2>
        </div>

        <div
          :class="[
            'p-8 rounded-2xl border-2 transition-all duration-200',
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl'
              : 'bg-white border-gray-200 shadow-xl',
          ]"
        >
          <!-- Schedule Settings -->
          <div class="mb-8">
            <h3
              class="text-lg font-semibold mb-4"
              :class="isDarkMode ? 'text-white' : 'text-gray-700'"
            >
              График работы
            </h3>
            <div class="grid gap-4">
              <div
                v-for="day in Object.keys(schedule)"
                :key="day"
                class="flex items-center justify-between p-4 rounded-xl"
                :class="isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'"
              >
                <span
                  class="font-medium capitalize"
                  :class="isDarkMode ? 'text-white' : 'text-gray-700'"
                >
                  {{ getDayName(day) }}
                </span>
                <div class="flex items-center space-x-4">
                  <!-- Кнопка "Выходной" -->
                  <button
                    @click="toggleDayOff(day)"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                      isDayOff(day)
                        ? isDarkMode
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                        : isDarkMode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700',
                    ]"
                  >
                    {{ isDayOff(day) ? 'Выходной' : 'Рабочий' }}
                  </button>

                  <!-- Поля времени (только для рабочих дней) -->
                  <div v-if="!isDayOff(day)" class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                      <label class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                        >Начало:</label
                      >
                      <input
                        :value="schedule[day]?.start ?? ''"
                        @input="onInputStart(day, $event)"
                        type="time"
                        :class="[
                          'px-3 py-1 rounded-lg border text-sm',
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900',
                        ]"
                      />
                    </div>
                    <div class="flex items-center space-x-2">
                      <label class="text-sm" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'"
                        >Конец:</label
                      >

                      <input
                        :value="schedule[day]?.end ?? ''"
                        @input="onInputEnd(day, $event)"
                        type="time"
                        :class="[
                          'px-3 py-1 rounded-lg border text-sm',
                          isDarkMode
                            ? 'bg-gray-600 border-gray-500 text-white'
                            : 'bg-white border-gray-300 text-gray-900',
                        ]"
                      />
                    </div>
                  </div>

                  <!-- Сообщение для выходных дней -->
                  <div
                    v-else
                    class="text-sm italic"
                    :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
                  >
                    Выходной день
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Holidays Settings -->
          <div>
            <h3
              class="text-lg font-semibold mb-4"
              :class="isDarkMode ? 'text-white' : 'text-gray-700'"
            >
              Праздничные дни
            </h3>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <div class="flex-1">
                <input
                  type="date"
                  v-model="newHoliday"
                  :class="[
                    'w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white focus:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-900 focus:bg-white focus:shadow-lg',
                  ]"
                />
              </div>
              <button
                @click="addHoliday"
                :class="[
                  'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2',
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-0.5',
                ]"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Добавить</span>
              </button>
            </div>

            <div class="mb-6">
              <h4
                class="text-md font-semibold mb-3"
                :class="isDarkMode ? 'text-white' : 'text-gray-700'"
              >
                Запланированные праздники ({{ holidays.length }})
              </h4>
              <div v-if="holidays.length > 0" class="grid gap-3">
                <div
                  v-for="(day, idx) in holidays"
                  :key="idx"
                  class="flex justify-between items-center p-4 rounded-xl transition-all duration-200 group"
                  :class="
                    isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  "
                >
                  <div class="flex items-center space-x-3">
                    <svg
                      class="w-5 h-5"
                      :class="isDarkMode ? 'text-yellow-400' : 'text-yellow-500'"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span
                      class="font-medium"
                      :class="isDarkMode ? 'text-white' : 'text-gray-900'"
                      >{{ formatDate(day) }}</span
                    >
                  </div>
                  <button
                    @click="removeHoliday(idx)"
                    :class="[
                      'px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 opacity-0 group-hover:opacity-100',
                      isDarkMode
                        ? 'bg-red-900/30 text-white hover:bg-red-900/50 hover:scale-105'
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:scale-105',
                    ]"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div
                v-else
                class="text-center py-8"
                :class="isDarkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                Нет добавленных праздничных дней
              </div>
            </div>

            <!-- Save Settings Button -->
            <div class="flex justify-end">
              <button
                @click="saveSettings"
                :disabled="isSaving"
                :class="[
                  'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2',
                  isSaving
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : isDarkMode
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5'
                      : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5',
                ]"
              >
                <svg
                  v-if="isSaving"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                <span>{{ isSaving ? 'Сохранение...' : 'Сохранить настройки' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiClient, ApiError } from '@/services/api'

const isDarkMode = inject('isDarkMode', ref(false))
const router = useRouter()

// Tabs
const tabs = [
  { key: 'create', label: 'Создание аккаунта' },
  { key: 'list', label: 'Список аккаунтов' },
  { key: 'holidays', label: 'Выходные и праздники' },
]
const activeTab = ref('create')

// Account creation
const newAccount = ref({ role: 'developer', full_name: '', login: '', password: '' })
const isCreating = ref(false)

const createAccount = async () => {
  try {
    isCreating.value = true

    // Используем API для создания пользователя
    const response = await apiClient.request('/admin/reg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccount.value),
    })

    alert('Аккаунт успешно создан!')
    newAccount.value = { role: 'developer', full_name: '', login: '', password: '' }

    // Обновляем список пользователей
    await loadUsers()
  } catch (error) {
    console.error('Error creating account:', error)
    if (error instanceof ApiError) {
      alert(`Ошибка при создании аккаунта: ${error.message}`)
    } else {
      alert('Ошибка при создании аккаунта')
    }
  } finally {
    isCreating.value = false
  }
}

const updateStart = (day: string, value: string) => {
  if (!schedule.value[day]) schedule.value[day] = { start: value, end: '18:00' }
  else schedule.value[day]!.start = value
}

const updateEnd = (day: string, value: string) => {
  if (!schedule.value[day]) schedule.value[day] = { start: '09:00', end: value }
  else schedule.value[day]!.end = value
}

const onInputStart = (day: string, e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (target) updateStart(day, target.value)
}

const onInputEnd = (day: string, e: Event) => {
  const target = e.target as HTMLInputElement | null
  if (target) updateEnd(day, target.value)
}

// Users list
const users = ref<any[]>([])
const searchQuery = ref('')
const filteredUsers = computed(() =>
  users.value.filter((u) => u.login.toLowerCase().includes(searchQuery.value.toLowerCase())),
)

const loadUsers = async () => {
  try {
    const response: any = await apiClient.request('/admin/users', {
      method: 'GET',
    })

    console.log('Users response:', response)

    // Универсальная защита от разных форматов ответа
    if (Array.isArray(response)) {
      users.value = response
    } else if (response?.data && Array.isArray(response.data)) {
      users.value = response.data
    } else if (response?.users && Array.isArray(response.users)) {
      users.value = response.users
    } else {
      console.warn('Unexpected response format for /admin/users:', response)
      users.value = []
    }
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
  }
}

const roleLabel = (role: string) => {
  const map: Record<string, string> = {
    developer: 'Разработчик',
    norm_controller: 'Нормоконтролёр',
    admin: 'Админ',
  }
  return map[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    developer: isDarkMode.value ? 'bg-blue-500/20 text-white' : 'bg-blue-100 text-blue-800',
    norm_controller: isDarkMode.value
      ? 'bg-green-500/20 text-white'
      : 'bg-green-100 text-green-800',
    admin: isDarkMode.value ? 'bg-purple-500/20 text-white' : 'bg-purple-100 text-purple-800',
  }

  return (
    classes[role] ?? (isDarkMode.value ? 'bg-gray-500/20 text-white' : 'bg-gray-100 text-gray-800')
  )
}

// Schedule and Holidays
const newHoliday = ref('')
const holidays = ref<string[]>([])
const isSaving = ref(false)
const schedule = ref<Record<string, { start: string; end: string } | null>>({})

// Функции для работы с выходными днями
const isDayOff = (day: string) => {
  return schedule.value[day] === null
}

const toggleDayOff = (day: string) => {
  if (isDayOff(day)) {
    // Делаем день рабочим с временем по умолчанию
    schedule.value[day] = { start: '09:00', end: '18:00' }
  } else {
    // Делаем день выходным
    schedule.value[day] = null
  }
}

const getDayName = (day: string) => {
  const days: Record<string, string> = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
  }
  return days[day] || day
}

const addHoliday = () => {
  if (newHoliday.value && !holidays.value.includes(newHoliday.value)) {
    holidays.value.push(newHoliday.value)
    newHoliday.value = ''
  }
}

const removeHoliday = (idx: number) => {
  holidays.value.splice(idx, 1)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

const saveSettings = async () => {
  try {
    isSaving.value = true

    const settingsData = {
      holidays: holidays.value.join(','),
      schedule: schedule.value,
    }

    console.log('Saving settings:', settingsData)

    // Отправляем настройки на сервер
    await apiClient.request('/admin/worktime-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settingsData),
    })

    alert('Настройки успешно сохранены!')
  } catch (error) {
    console.error('Error saving settings:', error)
    if (error instanceof ApiError) {
      alert(`Ошибка при сохранении настроек: ${error.message}`)
    } else {
      alert('Ошибка при сохранении настроек')
    }
  } finally {
    isSaving.value = false
  }
}

const loadSettings = async () => {
  try {
    const response = await apiClient.request<any>('/admin/worktime-settings', {
      method: 'GET',
    })

    console.log('Loaded settings:', response)

    // Загружаем праздничные дни
    if (response.holidays) {
      holidays.value = response.holidays.split(',').filter((d: string) => d.trim())
    } else {
      holidays.value = []
    }

    // Загружаем расписание
    if (response.schedule) {
      schedule.value = { ...response.schedule }
    } else {
      schedule.value = {}
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    holidays.value = []
    schedule.value = {}
  }
}

// Initialize data
onMounted(() => {
  loadUsers()
  loadSettings()
})
</script>
