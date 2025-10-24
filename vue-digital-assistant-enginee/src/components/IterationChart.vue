<template>
  <div class="relative h-full">
    <div class="flex items-center justify-center h-48">
      <div class="relative">
        <svg class="w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            :stroke="isDarkMode ? '#374151' : '#E5E7EB'"
            stroke-width="20"
            fill="none"
          />
          <circle
            v-for="(segment, index) in segments"
            :key="index"
            cx="80"
            cy="80"
            r="70"
            :stroke="segment.color"
            stroke-width="20"
            fill="none"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="segment.offset"
            stroke-linecap="round"
            transform="rotate(-90 80 80)"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span :class="['text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900']">
            {{ total }}
          </span>
          <span :class="['text-xs', isDarkMode ? 'text-gray-400' : 'text-gray-600']">
            всего документов
          </span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap justify-center gap-3 mt-4">
      <div v-for="item in data" :key="item.label" class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded" :style="{ backgroundColor: item.color }"></div>
        <span class="text-xs" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          {{ item.label }} ({{ item.value }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  isDarkMode: boolean
}

const props = defineProps<Props>()

const circumference = 2 * Math.PI * 70
const total = computed(() => props.data.reduce((sum, item) => sum + item.value, 0))

const segments = computed(() => {
  let currentOffset = circumference

  return props.data.map((item) => {
    const percentage = item.value / total.value
    const dashLength = circumference * percentage
    const segment = {
      color: item.color,
      offset: currentOffset,
      length: dashLength,
    }
    currentOffset -= dashLength
    return segment
  })
})
</script>
