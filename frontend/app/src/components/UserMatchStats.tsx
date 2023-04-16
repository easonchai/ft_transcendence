import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Statistic } from 'antd'

const UserMatchStats = () => {
	return (
		<ProCard.Group
			direction='column'
			headerBordered
			bordered
			title="Match stats"
			className='h-full'
		>
			<ProCard>
				<Statistic title="Total" value={13}/>
			</ProCard>
			<ProCard.Divider type='horizontal' />
			<ProCard>
				<Statistic title="Wins" value={3} />
			</ProCard>
			<ProCard.Divider type='horizontal' />
			<ProCard>
				<Statistic title="Rank" value={"Beginner"} />
			</ProCard>
		</ProCard.Group>
	)
}

export default UserMatchStats