import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const DynamicProLayout = dynamic(() => import('../components/Layout'), { ssr: false });

function MyComponent(props: AppProps) {
	const { data: session } = useSession();
	
	return (
		session ? (
			<DynamicProLayout>
				<props.Component { ...props.pageProps } />
			</DynamicProLayout>
		) : (
			<props.Component { ...props.pageProps } />
		)
		
	)
}

export default function App(props: AppProps) {
  return (
		<SessionProvider session={props.pageProps.session}>
			<MyComponent { ...props } />
		</SessionProvider>
	)
}
