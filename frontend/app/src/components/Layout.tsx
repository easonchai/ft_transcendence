import React, { PropsWithChildren, createContext, useEffect, useState } from 'react'
import { MenuDataItem, ProLayout } from '@ant-design/pro-components'
import { UserOutlined, RobotOutlined, CommentOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { io } from 'socket.io-client'
import { message } from 'antd'
import { useRouter } from 'next/router'

const layoutRoutes: MenuDataItem = {
	path: '/',
	children: [
		{
			key: '1',
			path: 'users',
			name: 'Users',
			icon: <UserOutlined />,
		},
		{
			key: '3',
			path: 'channels',
			name: 'Channels',
			icon: <CommentOutlined />
		}
	]
}

export const AppContext = createContext<Map<string, string>>({} as Map<string, string>);

const Layout = ({ children }: PropsWithChildren) => {
	
	const router = useRouter();
	const [onlineClients, setOnlineClients] = useState<Map<string, string>>({} as Map<string, string>);
	
	useEffect(() => {
		const s = io(`${process.env.NESTJS_WS}/`, {
			reconnection: false,
			withCredentials: true
		})
		
		s.on('connect', () => {
			console.log('Connected to root');
		})
		
		s.on('connect_error', () => {
			console.log('Error connecting to root');
		})
		
		s.on('connectedClients', (body) => {
			setOnlineClients(body);
		})
		
		s.on('exception', (error) => {
			console.log(error.message);
		})
	}, [router.isReady])
	
	return (
		<AppContext.Provider value={onlineClients}>
			<ProLayout
				route={layoutRoutes}
				menuItemRender={(item, dom) => <Link href={item.path!}>{dom}</Link>}
				title="Transcendence"
				token={{ sider: { colorMenuBackground: 'white' } }}
				menuHeaderRender={(logo, title) => <Link href="/">{title}</Link> }
			>
				{ children }
			</ProLayout>
		</AppContext.Provider>
	)
}

export default Layout