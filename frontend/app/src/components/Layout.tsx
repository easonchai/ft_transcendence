import React, { PropsWithChildren } from 'react'
import { MenuDataItem, ProLayout } from '@ant-design/pro-components'
import { UserOutlined, RobotOutlined, CommentOutlined } from '@ant-design/icons'
import Link from 'next/link'

const layoutRoutes: MenuDataItem = {
	path: '/',
	children: [
		{
			key: '1',
			path: 'users',
			name: 'Users',
			icon: <UserOutlined />,
		},
		// {
		// 	key: '2',
		// 	path: 'match',
		// 	name: 'Matches',
		// 	icon: <RobotOutlined />
		// },
		{
			key: '3',
			path: 'channels',
			name: 'Channels',
			icon: <CommentOutlined />
		}
	]
}

const Layout = ({ children }: PropsWithChildren) => {
	return (
		<ProLayout
			route={layoutRoutes}
			menuItemRender={(item, dom) => <Link href={item.path!}>{dom}</Link>}
			title="Transcendence"
			token={{ sider: { colorMenuBackground: 'white' } }}
			menuHeaderRender={(logo, title) => <Link href="/">{title}</Link> }
		>
			{ children }
		</ProLayout>
	)
}

export default Layout