export const getCookieTokenFromWs = (cookie: string) => {
		const cookies = cookie.split('; ');
		if (!cookies) return undefined;
		const stoken = cookies.find((s) => s.split('=')[0] === 'next-auth.session-token');
		if (!stoken) return undefined
		return stoken.split('=')[1];
}