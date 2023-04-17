import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';
import { useRouter } from 'next/router';

const DynamicProLayout = dynamic(() => import('../components/Layout'), { ssr: false });

function Auth({ children }: PropsWithChildren) {
	const router = useRouter();
	const { status } = useSession({
		required: true,
		onUnauthenticated: () => {
			router.push('/api/auth/signin');
		}
	})
	
	if (status === 'loading') return (<div>Loading...</div>);
	else return <>{children}</>;
}

function MyComponent(props: AppProps) {
	const { data: session } = useSession();
	
	return (
		<Auth>
			<DynamicProLayout>
				<props.Component { ...props.pageProps } />
			</DynamicProLayout>
		</Auth>
	)
}

export default function App(props: AppProps) {
  return (
		<SessionProvider session={props.pageProps.session}>
			<MyComponent { ...props } />
		</SessionProvider>
	)
}
