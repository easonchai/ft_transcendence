import apiClient from '@/apis/ApiClient'
import { channelsService } from '@/apis/channelsService'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Button, List, Tag, message } from 'antd'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

const MockData = [
	{ name: 'Channel 1', type: 'PUBLIC' },
	{ name: 'Channel 2', type: 'PUBLIC' },
	{ name: 'Channel 3', type: 'PROTECTED' },
	{ name: 'Channel 4', type: 'PUBLIC' },
	{ name: 'Channel 5', type: 'PROTECTED' },
	{ name: 'Channel 6', type: 'PUBLIC' },
	{ name: 'Channel 7', type: 'PUBLIC' },
]

interface ChannelsResponseType {
	id: number,
	name: string,
	type: 'PRIVATE' | 'PROTECTED' | 'PUBLIC'
}

const index = () => {
	const router = useRouter();
	const [channels, setChannels] = useState<ChannelsResponseType[]>([]);
	const [myChannels, setMyChannels] = useState<ChannelsResponseType[]>([]);
	const [messageApi, contextHolder] = message.useMessage();
	
	const { isLoading: getChannelsIsLoading } = useQuery(
		'getChannels',
		channelsService.getChannels,
		{
			onSuccess: (res) => {setChannels(res)},
			onError: () => {messageApi.error({ content: 'Fetch channels failed' })},
		}
	)
	
	const joinChannels = useMutation({
		mutationFn: async (id: number) => await channelsService.joinChannels(id),
		onSuccess: (res) => { router.push({pathname: `/channels/${res.channel_id}`, query: { success: 1 }}) },
		onError: (e: any) => { messageApi.error({ content: e.message ?? 'Failed to join channel' }) }
	})
	
	// const { isLoading: getMyChannelsIsLoading } = useQuery(
	// 	'getMyChannels',
	// 	channelsService.getMyChannels
	// )
	
	return (
		<>
			{contextHolder}
			<PageContainer
				extra={[<Button key='1' icon={<PlusOutlined />}>Create</Button>]}
				loading={joinChannels.isLoading}
			>
				<ProCard
					wrap={true}
				>
					<ProCard
						title="My channels"
						headerBordered
						bordered
					>
						<List
							dataSource={MockData}
							renderItem={(item, index) => (
								<List.Item 
									key={index}
									actions={[
										<Button>Chat</Button>
									]}
								>
									<List.Item.Meta title={`${index + 1}. ${item.name}`} />
								</List.Item>
							)}
						/>
					</ProCard>
					<ProCard
						title="Channels list"
						headerBordered
						bordered
						className='mt-5'
					>
						<List 
							loading={getChannelsIsLoading}
							dataSource={channels}
							renderItem={(item, index) => (
								<List.Item 
									key={index}
									actions={[
										<Button onClick={() => joinChannels.mutate(item.id)}>Join</Button>
									]}
								>
									<List.Item.Meta title={`${index + 1}. ${item.name}`} />
									<Tag color="blue">{item.type}</Tag>
								</List.Item>
							)}
						/>
					</ProCard>
				</ProCard>
			</PageContainer>
		</>
	)
}

export default index