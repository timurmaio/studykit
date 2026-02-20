import _axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const axios = _axios.create({
  headers: { 'Authorization': localStorage.getItem('jwt_token') }
})

export { API_URL, axios }
