import React from 'react'
import { List, Row, Col, Typography } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { GetMatchesResponse } from '@/apis/matchService'

interface UserMatchHistoryProps {
	matches: GetMatchesResponse[],
	isLoading: boolean
}

const UserMatchHistory = (props: UserMatchHistoryProps) => {
	return (
		<ProCard
			title="History"
			bordered
			headerBordered
			loading={props.isLoading}
			className='h-full'
		>
			<List
				style={{ overflowY: 'scroll', maxHeight: 320 }}
				dataSource={props.matches}
				renderItem={(item, index) => (
					<List.Item 
						key={index}
						style={{ display: 'block' }}
					>
						<Typography.Text type="secondary" >{item.created_at.toDateString()}</Typography.Text>
						<Row justify={'space-between'}>
							<Col>{item.users[0].user.name} {item.users[0].score}</Col>
							-
							<Col>{item.users[1].user.name} {item.users[1].score}</Col>
						</Row>
					</List.Item>
				)}
			/>
		</ProCard>
	)
}

export default UserMatchHistory