import { channelsService } from '@/apis/channelsService'
import { usersService } from '@/apis/usersService'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Channels } from '@prisma/client'
import { Button, List, Tag, message } from 'antd'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'react-query'

const index = () => {
	const router = useRouter();
	const [channels, setChannels] = useState<Channels[]>([]);
	const [myChannels, setMyChannels] = useState<Channels[]>([]);
	const [messageApi, contextHolder] = message.useMessage();
	
	const { isLoading: getMyChannelsIsLoading } = useQuery({
		queryKey: 'getMyChannels',
		queryFn: () => usersService.getMyChannels(),
		onSuccess: (res) => setMyChannels(res),
	})
	
	const { isLoading: getChannelsIsLoading } = useQuery({
		queryKey: 'getChannels',
		queryFn: () => channelsService.getChannels(),
		onSuccess: (res) => {
			const c = res.filter((obj) => {
				for (const item of myChannels) {
					if (item.id === obj.id) return false
				}
				return true;
			})
			setChannels(c)
		},
		enabled: myChannels.length !== 0
	})
	
	const joinChannels = useMutation({
		mutationFn: async (id: number) => await channelsService.joinChannels(id),
		onSuccess: (res) => { router.push({pathname: `/channels/${res.channel_id}`, query: { success: 1 }}) },
		onError: (e: any) => { messageApi.error({ content: e.message ?? 'Failed to join channel' }) }
	})
	
	
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
						loading={getMyChannelsIsLoading}
					>
						<List
							dataSource={myChannels}
							renderItem={(item, index) => (
								<List.Item 
									key={index}
									actions={[
										<Button onClick={() => router.push(`/channels/${item.id}`)}>Chat</Button>
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