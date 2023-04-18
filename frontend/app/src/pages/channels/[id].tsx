import { ChannelMessagesProps, channelsService, ChannelUsersProps } from '@/apis/channelsService';
import ChatWindow from '@/components/ChatWindow';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Col, Input, List, Row, Space, Tag, message } from 'antd';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query';
import { io, Socket } from 'socket.io-client';


const ChannelsChat = () => {
	const router = useRouter();
	const { id } = router.query;
	const [messageApi, contextHolder] = message.useMessage();
	const [channelName, setChannelName] = useState<string>('');
	const [channelUsers, setChannelUsers] = useState<ChannelUsersProps[]>([]);
	const [me, setMe] = useState<ChannelUsersProps>();
	const [channelMessages, setChannelMessages] = useState<ChannelMessagesProps[]>([]);
	const [msg, setMsg] = useState<string>('');
	const [socket, setSocket] = useState<Socket>();
	const { data: session } = useSession()
	
	
	useEffect(() => {
		if (router.query.success === '1') messageApi.success('Successfully joined channel!');
	}, [router.isReady, router.query])
	
	const { isLoading: getChannelByIdIsLoading } = useQuery(
		'getChannelById',
		() => channelsService.getChannelById(id as string | number),
		{
			onSuccess: (res) => setChannelName(res.name)
		}
	)
	
	const { isLoading: getChannelUsersIsLoading } = useQuery(
		'getChannelUsers',
		() => channelsService.getChannelUsers(id as string | number),
		{
			onSuccess: (res) => {
				setChannelUsers(res);
				const me = res.find((obj) => obj.user.name === session?.user?.name);
				setMe(me);
			}
		}
	)
	
	const { isLoading: getChannelMessagesIsLoading } = useQuery(
		'getChannelMessages',
		() => channelsService.getChannelMessages(id as string | number),
		{
			onSuccess: (res) => {
				setChannelMessages(res);
			}
		}
	)
	
	useEffect(() => {
		const s = io(`${process.env.NESTJS_WS}/channels?id=${id}`, {
			reconnection: false,
			withCredentials: true,
		});
		s.on("connect", () => {
			messageApi.success('Message gateway connected!');
		});
		
		s.on('connect_error', (e) => {
			messageApi.error('Message gateway connect error.')
		})
		s.on('exception', (error) => {
			messageApi.error(error.message);
		})
		s.on('channelMessages', (body) => {
			setChannelMessages(prev => [...prev, body]);
		})
		const cleanWs = () => {
			s.disconnect();
		}
		setSocket(s);
		return cleanWs;
	}, [])

	const emitChannelMessages = () => {
		console.log(msg);
		console.log(channelMessages);
		socket?.emit('channelMessages', { message: msg });
		setMsg('');
	}
	
	return (
		<>
			{contextHolder}
			<PageContainer
				title={`Channel chat`}
			>
				<ProCard
					title={channelName}
					headerBordered
					bordered
					loading={getChannelByIdIsLoading}
				>
					<Row gutter={10}>
						<Col span={10}>
							<ProCard
								title="Channel users"
								headerBordered
								bordered
								className='h-full'
							>
								<List 
									dataSource={channelUsers}
									loading={getChannelUsersIsLoading}
									renderItem={(item, index) => (
										<List.Item
											key={index}
											actions={
												me?.type !== 'MEMBER' && me !== item && item.type !== 'OWNER' ? (
													[ 
														<Button danger size='small'>Mute</Button>,
														<Button type="primary" danger size='small'>Kick</Button>
													]
												) : undefined
											}
										>
											<List.Item.Meta 
												style={{ alignItems: 'center' }} 
												title={item.user.name} 
												avatar={<Avatar src={item.user.image ?? `https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />} 
											/>
											<Tag color={item.type === 'OWNER' ? 'gold' : 'default'}>{item.type}</Tag>
										</List.Item>
									)}
								/>
							</ProCard>
						</Col>
						<Col span={14}>
							<ChatWindow chats={channelMessages ?? []} isLoading={getChannelMessagesIsLoading} channelUsers={channelUsers} />
							<Row className='pt-3'>
								<Space.Compact className='w-full'>
									<Input 
										placeholder='Type messages here...'
										onChange={e => setMsg(e.target.value)}
										onPressEnter={() => emitChannelMessages()}
										value={msg}
									/>
									<Button>Send</Button>
								</Space.Compact>
							</Row>
						</Col>
					</Row>
				</ProCard>
			</PageContainer>
		</>
	)
}

export default ChannelsChat