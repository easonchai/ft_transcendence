import ChatWindow from '@/components/ChatWindow'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Avatar, Button, Col, Divider, Input, Row, Space } from 'antd'
import { useRouter } from 'next/router'
import React from 'react'

const Messsages = [
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John', created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
]

const chat = () => {
	const router = useRouter()
	const { id } = router.query;
	
	return (
		<PageContainer
			title="Chat"
		>
			<ProCard>
				<ProCard
					title={id}
					headerBordered
					bordered
					bodyStyle={{ display: 'block' }}
				>
					<ChatWindow chats={Messsages} ></ChatWindow>
					<Row className='pt-3'>
						<Space.Compact className='w-full'>
							<Input placeholder='Type messages here...' />
							<Button>Send</Button>
						</Space.Compact>
					</Row>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default chat