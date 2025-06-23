<script setup>
import { ref, computed } from 'vue'
import { usePhotoStore } from '../stores/photoStore'

const store = usePhotoStore()
const tableContainer = ref(null)

const isLoading = computed(() => store.isLoading)
const isLoadingMore = ref(false)
const displayedPhotos = computed(() => store.displayedPhotos)
const sortIndicator = computed(() => store.sortIndicator)

const setSort = (field) => {
  store.setSort(field)
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text
}

const handleScroll = () => {
  if (!tableContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = tableContainer.value
  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50
  
  if (isAtBottom && !isLoadingMore.value && store.displayedPhotos.length < store.filteredPhotos.length) {
    isLoadingMore.value = true
    setTimeout(() => {
      store.loadMore()
      isLoadingMore.value = false
    }, 500)
  }
}
</script>

<style scoped>
table {
  width: 100%;
  table-layout: fixed;
}

th, td {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow">
    <div 
      ref="tableContainer"
      class="overflow-auto bg-white dark:bg-gray-800"
      :style="{ height: '600px', width: '600px', maxWidth: '100%' }"
      @scroll="handleScroll"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0">
          <tr>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="setSort('id')"
            >
              <div class="flex items-center">
                <span>ID</span>
                <span class="ml-1">{{ sortIndicator('id') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="setSort('albumId')"
            >
              <div class="flex items-center">
                <span>Альбом</span>
                <span class="ml-1">{{ sortIndicator('albumId') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="setSort('title')"
            >
              <div class="flex items-center">
                <span>Название</span>
                <span class="ml-1">{{ sortIndicator('title') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="setSort('url')"
            >
              <div class="flex items-center">
                <span>Ссылка</span>
                <span class="ml-1">{{ sortIndicator('url') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              @click="setSort('thumbnailUrl')"
            >
              <div class="flex items-center">
                <span>Миниатюра</span>
                <span class="ml-1">{{ sortIndicator('thumbnailUrl') }}</span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody v-if="isLoading" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="i in 10" :key="i">
            <td v-for="j in 5" :key="j" class="px-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </td>
          </tr>
        </tbody>
        
        <tbody v-else-if="displayedPhotos.length === 0" class="bg-white dark:bg-gray-800">
          <tr>
            <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              Нет данных для отображения
            </td>
          </tr>
        </tbody>
        
        <tbody v-else class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr 
            v-for="photo in displayedPhotos" 
            :key="photo.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <td 
              class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[100px]"
              :title="photo.id"
            >
              {{ photo.id }}
            </td>
            <td 
              class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px]"
              :title="photo.albumId"
            >
              {{ photo.albumId }}
            </td>
            <td 
              class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]"
              :title="photo.title"
            >
              {{ photo.title }}
            </td>
            <td 
              class="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 truncate max-w-[150px]"
              :title="photo.url"
            >
              <a :href="photo.url" target="_blank" class="hover:underline">
                {{ truncateText(photo.url, 30) }}
              </a>
            </td>
            <td 
              class="px-4 py-3 text-sm text-blue-600 dark:text-blue-400 truncate max-w-[150px]"
              :title="photo.thumbnailUrl"
            >
              <a :href="photo.thumbnailUrl" target="_blank" class="hover:underline">
                {{ truncateText(photo.thumbnailUrl, 30) }}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="isLoadingMore" class="flex justify-center p-4">
        <div class="h-8 w-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
</template>

