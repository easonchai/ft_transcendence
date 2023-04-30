import React, { useEffect, useRef } from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Avatar, Col, Row, Typography } from 'antd';
import { ChannelMessagesResponse, ChannelUsersResponse } from '@/apis/channelsService';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import { User, UserMessages } from '@prisma/client';
import ProfilePicAvatar from './ProfilePicAvatar';

interface ChatWindowProps {
	chats: Array<ChannelMessagesResponse | UserMessages>,
	isLoading: boolean,
	users: Array<ChannelUsersResponse | User>
	isDM: boolean
}

const ChatWindow = (props: ChatWindowProps) => {
	const { data: session } = useSession();
	const messageRef = useRef<HTMLDivElement>(null);
	
	useEffect(() => {
		if (messageRef.current) {
			messageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
		};
	}, [props.chats])
	
	if (props.isDM) {
		const chats = props.chats as UserMessages[];
		const users = props.users as User[];
		return (
			<ProCard bordered style={{ overflowY: 'scroll' }}>
				<div className='h-[60vh]'>
					{
						chats.map((item, index) => {
							const rowProps = index === (props.chats.length - 1) ? { ref: messageRef } : {}
							const user = users?.find((obj) => obj.id === item.sender_id);
							return session?.user.id === item.sender_id ? (
								<Row key={index} className='py-3' gutter={5} align={'middle'} {...rowProps}>
										<Col flex={'auto'} className='text-right'>
											<div>
												<Typography.Text type='secondary'>{user?.name} - {moment(item.created_at).format('LLL')}</Typography.Text>
											</div>
											{item.message}
										</Col>
										<Col>
											<ProfilePicAvatar user={user!}/>
										</Col>
								</Row>
							) : (
								<Row key={index} className='py-3' gutter={5} align={'middle'} {...rowProps}>
										<Col className='text-right'>
											<ProfilePicAvatar user={user!}/>
										</Col>
										<Col>
											<div>
												<Typography.Text type='secondary'>{user?.name} - {moment(item.created_at).format('LLL')}</Typography.Text>
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
	} else {
		const chats = props.chats as ChannelMessagesResponse[];
		const users = props.users as ChannelUsersResponse[];
		return (
			<ProCard bordered style={{ overflowY: 'scroll' }}>
				<div className='h-[60vh]'>
					{
						chats.map((item, index) => {
							const rowProps = index === (props.chats.length - 1) ? { ref: messageRef } : {}
							const channeluser = users?.find((obj) => obj.user_id === item.user_id)?.user;
							return session?.user.id === item.user_id ? (
								<Row key={index} className='py-3' gutter={5} align={'middle'} {...rowProps}>
										<Col flex={'auto'} className='text-right'>
											<div>
												<Typography.Text type='secondary'>{channeluser?.name} - {moment(item.created_at).format('LLL')}</Typography.Text>
											</div>
											{item.message}
										</Col>
										<Col>
											<ProfilePicAvatar user={channeluser!}/>
										</Col>
								</Row>
							) : (
								<Row key={index} className='py-3' gutter={5} align={'middle'} {...rowProps}>
										<Col className='text-right'>
											<ProfilePicAvatar user={channeluser!}/>
										</Col>
										<Col>
											<div>
												<Typography.Text type='secondary'>{channeluser?.name ?? <Typography.Text className='text-red-700'>Gone</Typography.Text>} - {moment(item.created_at).format('LLL')}</Typography.Text>
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
}

export default ChatWindow