import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Button, Statistic } from 'antd'
import Link from 'next/link'

const UserInformation = () => {
	return (
		<ProCard.Group
			title="Information"
			direction='row'
			headerBordered
			bordered
			extra={[ <Link key='1' href="/edit"><Button>Edit</Button></Link> ]}
		>
			<ProCard>
				<Statistic title="Name" value="Hiromasa" />
			</ProCard>
			<ProCard.Divider />
			<ProCard>
				<Statistic title="Email" value="Hiromasa@test.com" />
			</ProCard>
			<ProCard.Divider />
			<ProCard>
				<Statistic title="Status" value="Active" />
			</ProCard>
		</ProCard.Group>
	)
}

export default UserInformation