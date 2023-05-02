import axios from 'axios'

const apiClient = axios.create({
	baseURL: process.env.NEXT_PUBLIC_NESTJS_URL,
	withCredentials: true
})

export default apiClient;