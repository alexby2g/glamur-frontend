import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://glamur-backend-2.onrender.com/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }