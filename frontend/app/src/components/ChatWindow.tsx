import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Avatar, Col, Row, Typography } from 'antd';
import { ChannelMessagesProps, ChannelUsersProps } from '@/apis/channelsService';
import { useSession } from 'next-auth/react';
import moment from 'moment';

interface ChatWindowProps {
	chats: ChannelMessagesProps[],
	isLoading: boolean,
	channelUsers: ChannelUsersProps[]
}

const ChatWindow = (props: ChatWindowProps) => {
	const { data: session } = useSession();
	
	return (
		<ProCard bordered style={{ overflowY: 'scroll' }}>
			<div className='h-[60vh]'>
				{
					props.chats.map((item, index) => {
						const channeluser = props.channelUsers.find((obj) => obj.user_id === item.user_id)?.user;
						return session?.user.id === item.user_id ? (
							<Row key={index} className='py-3' gutter={5} align={'middle'}>
									<Col flex={'auto'} className='text-right'>
										<div>
											<Typography.Text type='secondary'>{channeluser?.name} - {moment(item.created_at).format('LLL')}</Typography.Text>
										</div>
										{item.message}
									</Col>
									<Col>
										<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
									</Col>
							</Row>
						) : (
							<Row key={index} className='py-3' gutter={5} align={'middle'}>
									<Col className='text-right'>
										<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
									</Col>
									<Col>
										<div>
											<Typography.Text type='secondary'>{channeluser?.name} - {moment(item.created_at).format('LLL')}</Typography.Text>
										</div>
										{item.message}
									</Col>
							</Row>
						)
					})
				}
			</div>
		</ProCard>
	)
}

export default ChatWindow

				// 	(
				// 		index % 2 === 0 ? (
				// 			<Row key={index} className='py-3'>
				// 				<Col span={12}></Col>
				// 				<Col span={12}>
				// 					<Row gutter={10} align={'middle'}>
				// 						<Col span={18} className='text-right'>
				// 							<div>
				// 								<Typography.Text type='secondary'>{item.name} - {item.created_at}</Typography.Text>
				// 							</div>
				// 							{item.messages}
				// 						</Col>
				// 						<Col span={6}>
				// 							<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
				// 						</Col>
				// 					</Row>
				// 				</Col>
				// 			</Row>
				// 		) : (
				// 			<Row key={index} className='py-3'>
				// 				<Col span={12}>
				// 					<Row gutter={10} align={'middle'}>
				// 						<Col span={6} className='text-right'>
				// 							<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
				// 						</Col>
				// 						<Col span={18}>
				// 							<div>
				// 								<Typography.Text type='secondary'>{item.name} - {item.created_at}</Typography.Text>
				// 							</div>
				// 							{item.messages}
				// 						</Col>
				// 					</Row>
				// 				<Col span={12}></Col>
				// 				</Col>
				// 			</Row>
				// 		)
				// 	))