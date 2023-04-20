/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
	env: {
		NESTJS_URL: "http://localhost:3000",
		NESTJS_WS: "ws://localhost:3000"
	}
}

module.exports = nextConfig
