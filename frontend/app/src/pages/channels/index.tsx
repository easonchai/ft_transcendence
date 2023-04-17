import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Button, List, Tag } from 'antd'
import React from 'react'

const MockData = [
	{ name: 'Channel 1', type: 'PUBLIC' },
	{ name: 'Channel 2', type: 'PUBLIC' },
	{ name: 'Channel 3', type: 'PROTECTED' },
	{ name: 'Channel 4', type: 'PUBLIC' },
	{ name: 'Channel 5', type: 'PROTECTED' },
	{ name: 'Channel 6', type: 'PUBLIC' },
	{ name: 'Channel 7', type: 'PUBLIC' },
]

const index = () => {
	return (
		<PageContainer
			extra={[<Button icon={<PlusOutlined />}>Create</Button>]}
		>
			<ProCard
				wrap={true}
			>
				<ProCard
					title="Your channels"
					headerBordered
					bordered
				>
					<List 
						dataSource={MockData}
						renderItem={(item, index) => (
							<List.Item 
								key={index}
								actions={[
									<Button>Chat</Button>
								]}
							>
								<List.Item.Meta title={`${index + 1}. ${item.name}`} />
							</List.Item>
						)}
					/>
				</ProCard>
				<ProCard
					title="Channels list"
					headerBordered
					bordered
					className='mt-5'
				>
					<List 
						dataSource={MockData}
						renderItem={(item, index) => (
							<List.Item 
								key={index}
								actions={[
									<Button>Join</Button>
								]}
							>
								<List.Item.Meta title={`${index + 1}. ${item.name}`} />
								<Tag color="blue">{item.type}</Tag>
							</List.Item>
						)}
					/>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default index