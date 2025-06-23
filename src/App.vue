<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePhotoStore } from './stores/photoStore'
import PhotoTable from './components/PhotoTable.vue'

const store = usePhotoStore()
const albumIdsInput = ref('')
const isDark = ref(false)

const isLoading = computed(() => store.isLoading)
const error = computed(() => store.error)
const totalPhotos = computed(() => store.photos.length)
const displayedPhotosCount = computed(() => store.displayedPhotos.length)
const filteredPhotosCount = computed(() => store.filteredPhotos.length)

onMounted(() => {
  // Загружаем состояние из localStorage
  store.loadStateFromLocalStorage()
  
  // Применяем сохраненные albumIds
  if (store.albumIds.length > 0) {
    albumIdsInput.value = store.albumIds.join(' ')
  }
  
  // Проверяем текущую тему
  isDark.value = document.documentElement.classList.contains('dark')
  
  // Загружаем фотографии
  store.fetchPhotos()
})

const applyFilter = () => {
  // Преобразуем введенные значения в массив чисел
  const ids = albumIdsInput.value
    .split(' ')
    .map(id => id.trim())
    .filter(id => id !== '')
    .map(id => parseInt(id))
    .filter(id => !isNaN(id))
  
  // Сохраняем в хранилище и localStorage
  store.setAlbumIds(ids)
  store.saveAlbumIdsToLocalStorage()
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Фото Галерея</h1>
        
        <div class="flex flex-col gap-4 mb-6">
          <div>
            <label for="albumIds" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Фильтр по ID альбомов
            </label>
            <div class="flex flex-col md:flex-row gap-3">
              <input
                id="albumIds"
                v-model="albumIdsInput"
                type="text"
                placeholder="Введите ID альбомов через пробел (например: 1 2 3)"
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                :disabled="isLoading"
              >
              
              <div class="flex gap-3">
                <button
                  @click="applyFilter"
                  class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Загрузка...
                  </span>
                  <span v-else>Поиск</span>
                </button>
                
                <button
                  @click="toggleTheme"
                  class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 self-center"
                  :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
                >
                  <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Оставьте пустым для отображения всех альбомов
            </p>
          </div>
        </div>
      </header>

      <div class="mb-8">
        <div v-if="error" class="p-4 mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {{ error }}
        </div>
        
        <div class="flex justify-center">
          <PhotoTable />
        </div>
      </div>
      
      <footer class="text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Всего загружено: {{ totalPhotos }} фото</p>
        <p>Отображается: {{ displayedPhotosCount }} из {{ filteredPhotosCount }}</p>
      </footer>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background-color 0.2s;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Адаптивные стили для мобильных устройств */
@media (max-width: 640px) {
  .flex-col.md\:flex-row {
    flex-direction: column;
  }
  
  .flex-col.md\:flex-row > input {
    margin-bottom: 12px;
  }
  
  .flex-col.md\:flex-row > .flex {
    width: 100%;
    justify-content: space-between;
  }
  
  .flex-col.md\:flex-row > .flex > button {
    width: 48%;
  }
  
  .flex-col.md\:flex-row > .flex > button:first-child {
    margin-right: 4%;
  }
}
</style>