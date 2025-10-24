<template>
  <div class="relative h-full">
    <div class="flex items-end justify-between h-48 space-x-1 pb-8">
      <div
        v-for="(dataPoint, index) in normalizedData"
        :key="index"
        class="flex flex-col items-center flex-1"
      >
        <div class="flex items-end justify-center space-x-1 flex-1 w-full">
          <!-- Fix Duration Bar -->
          <div
            class="w-1/2 rounded-t transition-all duration-300 hover:opacity-80"
            :style="{
              height: `${dataPoint.fixPercentage}%`,
              backgroundColor: dataSetColors.fix,
            }"
            :title="`Устранение: ${dataPoint.fixValue}д`"
          ></div>
          <!-- Review Duration Bar -->
          <div
            class="w-1/2 rounded-t transition-all duration-300 hover:opacity-80"
            :style="{
              height: `${dataPoint.reviewPercentage}%`,
              backgroundColor: dataSetColors.review,
            }"
            :title="`Проверка: ${dataPoint.reviewValue}д`"
          ></div>
        </div>
        <span class="text-xs mt-2" :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          {{ dataPoint.label }}
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex justify-center space-x-4 mt-4">
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded" :style="{ backgroundColor: dataSetColors.fix }"></div>
        <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          Устранение
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded" :style="{ backgroundColor: dataSetColors.review }"></div>
        <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          Проверка
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      color: string
    }>
  }
  isDarkMode: boolean
  period: string
}

const props = defineProps<Props>()

const dataSetColors = computed(() => ({
  fix: props.isDarkMode ? '#10B981' : '#059669',
  review: props.isDarkMode ? '#3B82F6' : '#2563EB',
}))

const normalizedData = computed(() => {
  if (!props.data?.labels || !props.data?.datasets) return []

  const fixData = props.data.datasets.find((d) => d.label === 'Устранение')?.data || []
  const reviewData = props.data.datasets.find((d) => d.label === 'Проверка')?.data || []

  const maxValue = Math.max(...fixData, ...reviewData)

  return props.data.labels.map((label, index) => ({
    label,
    fixValue: fixData[index] || 0,
    reviewValue: reviewData[index] || 0,
    fixPercentage: maxValue ? ((fixData[index] || 0) / maxValue) * 90 : 0,
    reviewPercentage: maxValue ? ((reviewData[index] || 0) / maxValue) * 90 : 0,
  }))
})
</script>
