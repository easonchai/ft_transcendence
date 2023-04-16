import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Button, List } from 'antd'
import React from 'react'

const MockData = [
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
	{ name: 'John Doe', email: "john@testing.com" },
]

const index = () => {
	return (
		<PageContainer>
			<ProCard>
				<ProCard 
					title="Users list"
					bordered
					headerBordered
				>
					<List
						dataSource={MockData}
						renderItem={(item, index) => (
							<List.Item
								key={index}
								actions={[
									<Button>Add</Button>,
									<Button>View</Button>
								]}
							>
								<List.Item.Meta title={`${index + 1}. ${item.name}`} />
								<div>{item.email}</div>
							</List.Item>
						)}
					/>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default index