import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Statistic } from 'antd'
import { GetMatchStatsResponse } from '@/apis/matchService'

interface UserMatchStatsProps {
	stats: GetMatchStatsResponse,
	isLoading: boolean
}

const UserMatchStats = (props: UserMatchStatsProps) => {
	return (
		<ProCard.Group
			direction='column'
			headerBordered
			bordered
			title="Match stats"
			className='h-full'
			loading={props.isLoading}
		>
			<ProCard>
				<Statistic title="Total" value={props.stats?.total}/>
			</ProCard>
			<ProCard.Divider type='horizontal' />
			<ProCard>
				<Statistic title="Wins" value={props.stats?.total_win} />
			</ProCard>
			<ProCard.Divider type='horizontal' />
			<ProCard>
				<Statistic title="Rank" value={props.stats?.rank} />
			</ProCard>
		</ProCard.Group>
	)
}

export default UserMatchStats