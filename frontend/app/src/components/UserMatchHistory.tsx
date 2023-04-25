import React from 'react'
import { List, Row, Col, Typography } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { GetMatchesResponse } from '@/apis/matchService'
import moment from 'moment'

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
						<Typography.Text type="secondary" >{moment(item.created_at).format('LLL')}</Typography.Text>
						<Row justify={'space-between'}>
							<Col flex={1}>{item.users[0].user.name} {item.users[0].score}</Col>
							-
							<Col flex={1} className='text-right'>{item.users[1].score} {item.users[1].user.name}</Col>
						</Row>
					</List.Item>
				)}
			/>
		</ProCard>
	)
}

export default UserMatchHistory