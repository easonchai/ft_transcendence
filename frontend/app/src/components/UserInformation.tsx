import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Button, Statistic } from 'antd'
import Link from 'next/link'
import { User } from '@prisma/client'

interface UserInformationProps {
	user: User;
	isLoading: boolean
}

const UserInformation = (props: UserInformationProps) => {
	
	return (
		<ProCard.Group
			title="Information"
			direction='row'
			headerBordered
			bordered
			extra={[ <Link key='1' href="/edit"><Button>Edit</Button></Link> ]}
		>
			<ProCard>
				<Statistic title="Name" value={props.user ? props.user.name : ''} loading={props.isLoading} />
			</ProCard>
			<ProCard.Divider />
			<ProCard>
				<Statistic title="Email" value={props.user ? props.user.email! : ''} loading={props.isLoading}/>
			</ProCard>
		</ProCard.Group>
	)
}

export default UserInformation