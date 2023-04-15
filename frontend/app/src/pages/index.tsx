import { Inter } from 'next/font/google'
import { useSession, signIn, signOut } from 'next-auth/react'
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	const { data: session } = useSession();
	
	if (session) {
		return (
			<>
				<button onClick={() => signOut()}>Log out</button>
			</>
		)
	} else {
		return (
			<>
				<button onClick={() => signIn()}>Log in</button>
				<Layout />
			</>
		)
	}
}
