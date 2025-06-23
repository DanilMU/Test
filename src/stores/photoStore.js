import { defineStore } from 'pinia'
import axios from 'axios'

export const usePhotoStore = defineStore('photo', {
  state: () => ({
    photos: [],
    filteredPhotos: [],
    isLoading: false,
    error: null,
    albumIds: [],
    sortField: null,
    sortDirection: 'asc',
    page: 1,
    pageSize: 30,
    total: 0
  }),
  actions: {
    async fetchPhotos() {
      this.isLoading = true
      this.error = null
      
      try {
        let params = {}
        if (this.albumIds.length > 0) {
          const sp = new URLSearchParams()
          this.albumIds.forEach(id => sp.append('albumId', id))
          params = sp
        }
        
        const response = await axios.get('https://jsonplaceholder.typicode.com/photos', { params })
        this.photos = response.data
        this.filteredPhotos = [...this.photos]
        this.total = this.photos.length
        this.page = 1
        
        if (this.sortField) {
          this.applySort()
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки данных'
      } finally {
        this.isLoading = false
      }
    },
    
    applySort() {
      this.filteredPhotos.sort((a, b) => {
        const field = this.sortField
        const valueA = a[field]
        const valueB = b[field]
        
        if (typeof valueA === 'string') {
          return this.sortDirection === 'asc' 
            ? valueA.localeCompare(valueB) 
            : valueB.localeCompare(valueA)
        }
        return this.sortDirection === 'asc' 
          ? valueA - valueB 
          : valueB - valueA
      })
      this.page = 1
    },
    
    setSort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
      this.applySort()
    },
    
    loadMore() {
      if (this.page * this.pageSize < this.filteredPhotos.length) {
        this.page += 1
      }
    },
    
    setAlbumIds(ids) {
      this.albumIds = ids
      this.fetchPhotos()
    },
    
    loadStateFromLocalStorage() {
      const savedAlbumIds = localStorage.getItem('albumIds')
      if (savedAlbumIds) {
        this.albumIds = JSON.parse(savedAlbumIds)
      }
      
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark')
      }
    },
    
    saveAlbumIdsToLocalStorage() {
      localStorage.setItem('albumIds', JSON.stringify(this.albumIds))
    }
  },
  getters: {
    displayedPhotos(state) {
      const start = 0
      const end = state.page * state.pageSize
      return state.filteredPhotos.slice(start, end)
    },
    
    sortIndicator(state) {
      return (field) => {
        if (state.sortField === field) {
          return state.sortDirection === 'asc' ? '↑' : '↓'
        }
        return ''
      }
    }
  }
})