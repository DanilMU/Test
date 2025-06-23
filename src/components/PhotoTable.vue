<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePhotoStore } from '../stores/photoStore'

const store = usePhotoStore()
const tableContainer = ref(null)
const isLoadingMore = ref(false)
let observer = null

const isLoading = computed(() => store.isLoading)
const displayedPhotos = computed(() => store.displayedPhotos)
const sortIndicator = computed(() => store.sortIndicator)

const setSort = (field) => {
  store.setSort(field)
}

// Более эффективная обработка скролла с Intersection Observer
const setupInfiniteScroll = () => {
  const options = {
    root: tableContainer.value,
    rootMargin: '0px 0px 100px 0px',
    threshold: 0.1
  }

  observer = new IntersectionObserver((entries) => {
    const lastEntry = entries[0]
    if (lastEntry.isIntersecting && 
        !isLoadingMore.value && 
        store.displayedPhotos.length < store.filteredPhotos.length) {
      loadMorePhotos()
    }
  }, options)

  // Добавляем элемент-триггер в конец таблицы
  const sentinel = document.createElement('div')
  sentinel.id = 'scroll-sentinel'
  tableContainer.value.appendChild(sentinel)
  observer.observe(sentinel)
}

const loadMorePhotos = () => {
  isLoadingMore.value = true
  store.loadMore()
  isLoadingMore.value = false
}

onMounted(() => {
  if (tableContainer.value) {
    setupInfiniteScroll()
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow">
    <div 
      ref="tableContainer"
      class="overflow-auto bg-white dark:bg-gray-800"
      :style="{ height: '600px', width: '600px', maxWidth: '100%' }"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-[10%]"
              @click="setSort('id')"
            >
              <div class="flex items-center">
                <span>ID</span>
                <span class="ml-1">{{ sortIndicator('id') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-1 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-[10%]"
              @click="setSort('albumId')"
            >
              <div class="flex items-center">
                <span>Альбом</span>
                <span class="ml-1">{{ sortIndicator('albumId') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-[25%]"
              @click="setSort('title')"
            >
              <div class="flex items-center">
                <span>Название</span>
                <span class="ml-1">{{ sortIndicator('title') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-[25%]"
              @click="setSort('url')"
            >
              <div class="flex items-center">
                <span>Ссылка</span>
                <span class="ml-1">{{ sortIndicator('url') }}</span>
              </div>
            </th>
            <th 
              scope="col" 
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-[30%]"
              @click="setSort('thumbnailUrl')"
            >
              <div class="flex items-center">
                <span>Миниатюра</span>
                <span class="ml-1">{{ sortIndicator('thumbnailUrl') }}</span>
              </div>
            </th>
          </tr>
        </thead>
        
        <tbody>
          <!-- Скелетон загрузки -->
          <tr v-if="isLoading" v-for="i in 10" :key="`skeleton-${i}`">
            <td v-for="j in 5" :key="`cell-${j}`" class="px-4 py-3">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </td>
          </tr>
          
          <!-- Пустое состояние -->
          <tr v-else-if="displayedPhotos.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              Нет данных для отображения
            </td>
          </tr>
          
          <!-- Данные -->
          <template v-else>
            <tr 
              v-for="photo in displayedPhotos" 
              :key="photo.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td 
                class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                :title="photo.id"
              >
                {{ photo.id }}
              </td>
              <td 
                class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 truncate"
                :title="photo.albumId"
              >
                {{ photo.albumId }}
              </td>
              <td 
                class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate"
                :title="photo.title"
              >
                {{ photo.title }}
              </td>
              <td 
                class="px-4 py-3 text-sm truncate"
              >
                <a 
                  :href="photo.url" 
                  target="_blank" 
                  class="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  :title="photo.url"
                >
                  {{ photo.url.substring(0, 30) + (photo.url.length > 30 ? '...' : '') }}
                </a>
              </td>
              <td 
                class="px-4 py-3 text-sm truncate"
              >
                <a 
                  :href="photo.thumbnailUrl" 
                  target="_blank" 
                  class="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  :title="photo.thumbnailUrl"
                >
                  {{ photo.thumbnailUrl.substring(0, 30) + (photo.thumbnailUrl.length > 30 ? '...' : '') }}
                </a>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      
      <div v-if="isLoadingMore" class="flex justify-center p-4">
        <div class="h-8 w-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
</template>

