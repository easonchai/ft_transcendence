import React from 'react'
import { List, Row, Col, Typography } from 'antd'
import { ProCard } from '@ant-design/pro-components'

const MockData = [
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022'},
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022' },
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022'},
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022'},
	{ name: 'John Doe', score: 5, opponent_name: 'Ash Bee', opponent_score: '2', date: '5th March 2022'}
]

const UserMatchHistory = () => {
	return (
		<ProCard
			title="History"
			bordered
			headerBordered
		>
			<List
				style={{ overflowY: 'scroll', maxHeight: 320 }}
				dataSource={MockData}
				renderItem={(item, index) => (
					<List.Item 
						key={index}
						style={{ display: 'block' }}
					>
						<Typography.Text type="secondary" >{item.date}</Typography.Text>
						<Row justify={'space-between'}>
							<Col>{item.name} {item.score}</Col>
							-
							<Col>{item.opponent_score} {item.opponent_name}</Col>
						</Row>
					</List.Item>
				)}
			/>
		</ProCard>
	)
}

export default UserMatchHistory