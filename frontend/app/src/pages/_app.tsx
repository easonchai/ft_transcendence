import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider, useSession } from "next-auth/react"
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConfigProvider } from 'antd';
import locale from 'antd/locale/en_US'

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
	const queryClient = new QueryClient();
	
	return (
		<QueryClientProvider client={queryClient}>
			<Auth>
				<ConfigProvider locale={locale}>
					<DynamicProLayout>
						<props.Component { ...props.pageProps } />
					</DynamicProLayout>
				</ConfigProvider>
			</Auth>
		</QueryClientProvider>
	)
}

export default function App(props: AppProps) {
  return (
		<SessionProvider session={props.pageProps.session}>
				<MyComponent { ...props } />
		</SessionProvider>
	)
}
