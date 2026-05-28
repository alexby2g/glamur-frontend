import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://glamur-backend-2.onrender.com/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('glamur_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status
    const hash = window.location.hash || ''
    const pathname = window.location.pathname || ''

    const estaEnLogin =
      hash.includes('/login') ||
      pathname.includes('/login')

    if (status === 401 && !estaEnLogin) {
      localStorage.removeItem('glamur_token')
      localStorage.removeItem('glamur_user')
      window.location.href = '/#/login'
    }

    return Promise.reject(error)
  }
)

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }