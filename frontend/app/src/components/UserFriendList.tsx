import { ProTable, ProColumns, ProCard } from '@ant-design/pro-components'
import { Button, List } from 'antd'
import Link from 'next/link'
import React from 'react'

export interface UserFriendListTableType {
	name: string,
	email: string,
	[otherOptions: string]: unknown
}

const MockData: UserFriendListTableType[] = [
	{ name: 'John Doe', email: 'john@testing.com' },
	{ name: 'Ash Bee', email: 'ash@testing.com' },
	{ name: 'Cat Tom', email: 'tom@testing.com' },
	{ name: 'John Doe', email: 'john@testing.com' },
	{ name: 'Ash Bee', email: 'ash@testing.com' },
	{ name: 'Cat Tom', email: 'tom@testing.com' },
	{ name: 'John Doe', email: 'john@testing.com' },
	{ name: 'Ash Bee', email: 'ash@testing.com' },
	{ name: 'Cat Tom', email: 'tom@testing.com' },
]

const UserFriendList = () => {
	return (
		<ProCard
			title="Friends"
			bordered
			headerBordered
		>
			<List
				style={{ maxHeight: 320, overflowY: 'scroll' }}
				dataSource={MockData}
				renderItem={(item, index) => (
					<List.Item
						key={index}
						actions={[ <Link href="/chat/1"><Button>Chat</Button></Link> ]}
					>
						<List.Item.Meta title={`${index + 1}. ${item.name}`} />
					</List.Item>
				)}
			/>
		</ProCard>
	)
}

export default UserFriendList