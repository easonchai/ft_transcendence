import axios from 'axios'

const apiClient = axios.create({
	baseURL: process.env.NESTJS_URL,
	withCredentials: true
})

export default apiClient;