import { channelsService } from '@/apis/channelsService';
import ChatWindow from '@/components/ChatWindow';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Avatar, Button, Col, Input, List, Row, Space, message } from 'antd';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query';

const Messsages = [
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John', created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet.', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
	{ messages: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?', avatar: 'https://source.boringavatars.com/pixel/150', name: 'John',created_at: '2nd June' },
]

const MockData = [
	{ name: 'John Doe'},
	{ name: 'Ash Bee'},
	{ name: 'Cat Tom'},
]

const ChannelsChat = () => {
	const router = useRouter();
	const { id } = router.query;
	const [messageApi, contextHolder] = message.useMessage();
	const [channeName, setChannelName] = useState<string>('');
	
	useEffect(() => {
		if (router.query.success === '1') messageApi.success('Successfully joined channel!');
	}, [router.isReady, router.query])
	
	const { isLoading: getChannelByIdIsLoading } = useQuery(
		'getChannelById',
		() => channelsService.getChannelById(id as string | number),
		{
			onSuccess: (res) => { setChannelName(res.name); }
		}
	)
	
	
	return (
		<>
			{contextHolder}
			<PageContainer
				title={`Channel chat`}
			>
				<ProCard
					title={channeName}
					headerBordered
					bordered
					loading={getChannelByIdIsLoading}
				>
					<Row gutter={10}>
						<Col span={6}>
							<ProCard
								title="Channel users"
								headerBordered
								bordered
								className='h-full'
							>
								<List 
									dataSource={MockData}
									renderItem={(item, index) => (
										<List.Item
											key={index}
										>
											<List.Item.Meta style={{ alignItems: 'center' }} title={item.name} avatar={<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />} />
										</List.Item>
									)}
								/>
							</ProCard>
						</Col>
						<Col span={18}>
							<ChatWindow chats={Messsages} />
							<Row className='pt-3'>
								<Space.Compact className='w-full'>
									<Input placeholder='Type messages here...' />
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