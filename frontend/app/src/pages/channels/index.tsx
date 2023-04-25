import { ChannelUsersResponse, CreateChannelsRequest, channelsService } from '@/apis/channelsService'
import { usersService } from '@/apis/usersService'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Channels } from '@prisma/client'
import { Button, Form, Input, List, Modal, Radio, Tag, message } from 'antd'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { UseMutationResult, useMutation, useQuery } from 'react-query'

const index = () => {
	const router = useRouter();
	const [channels, setChannels] = useState<Channels[]>([]);
	const [myChannels, setMyChannels] = useState<Channels[]>([]);
	const [messageApi, contextHolder] = message.useMessage();
	const [body, setBody] = useState<CreateChannelsRequest>({ name: '', type: 'PUBLIC', password: '' });
	const [createChannelModalIsOpen, setCreatechannelModalIsOpen] = useState<boolean>(false);
	const [passwordModalIsOpen, setPasswordModalIsOpen] = useState<boolean>(false);
	const [password, setPassword] = useState<string>('');
	const [passwordId, setPasswordId] = useState<number>(0);
	
	const { isLoading: getMyChannelsIsLoading, isSuccess: getMyChannelsIsSuccess } = useQuery({
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
		enabled: getMyChannelsIsSuccess
	})
	
	const joinChannelsMutation = useMutation({
		mutationFn: async (id: number) => await channelsService.joinChannels(id),
		onSuccess: (res) => { router.push({pathname: `/channels/${res.channel_id}`, query: { join: 1 }}) },
		onError: (e: any) => { messageApi.error({ content: e.message ?? 'Failed to join channel' }) }
	})
	
	const createChannelsMutation = useMutation({
		mutationFn: () => channelsService.createChannels(body!),
		onSuccess: (res) => {
			router.push({ pathname: `/channels/${res.id}`, query: { create: 1 } });
		},
		onError: (e: any) => {
			messageApi.error(e.message ?? 'Failed to create channel');
			setCreatechannelModalIsOpen(false);
		}
	})
	
	const passwordMutation = useMutation({
		mutationFn: (id: number) => channelsService.joinChannels(id, { password: password }),
		onSuccess: (res) => {
			router.push({ pathname: `/channels/${res.channel_id}`, query: { join: 1 } })
		},
		onError: (e: any) => {
			messageApi.error(e.message ?? 'Failed to join channel');
			setPasswordModalIsOpen(false);
		}
	})
	
	useEffect(() => {
		if (router.query.leave === '1') messageApi.success('Successfuly leave group');
	}, [router.isReady])
	
	return (
		<>
			{contextHolder}
			<PageContainer
				extra={[<Button key='1' icon={<PlusOutlined />} onClick={() => setCreatechannelModalIsOpen(true)}>Create</Button>]}
				loading={joinChannelsMutation.isLoading}
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
										item.type !== 'PROTECTED'
										? <Button onClick={() => joinChannelsMutation.mutate(item.id)}>Join</Button>
										: <Button onClick={() => { setPasswordModalIsOpen(true); setPasswordId(item.id) } }>Join</Button>
										
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
			<CreateChannelModal {...{createChannelModalIsOpen, setCreatechannelModalIsOpen, body, setBody, createChannelsMutation}} />
			<PasswordModal {...{password, setPassword, passwordModalIsOpen, setPasswordModalIsOpen, passwordId, passwordMutation}} />
		</>
	)
}

interface CreateChannelModalProps {
	createChannelModalIsOpen: boolean;
	body: CreateChannelsRequest;
	setBody: React.Dispatch<React.SetStateAction<CreateChannelsRequest>>;
	setCreatechannelModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	createChannelsMutation: UseMutationResult<Channels, any, void, unknown>
}

const CreateChannelModal = (props: CreateChannelModalProps) => {
		
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [form] = Form.useForm();
	
	return (
		<Modal
			title="Create channel"
			open={props.createChannelModalIsOpen}
			onOk={() => form.submit()}
			onCancel={() => { props.setCreatechannelModalIsOpen(false); form.resetFields()}}
			confirmLoading={props.createChannelsMutation.isLoading}
			okButtonProps={{ type: 'default' }}
			cancelButtonProps={{ danger: true }}
			okText={'Submit'}
			cancelText={'Cancel'}
		>
			<Form 
				autoComplete='off'
				layout='vertical'
				validateMessages={{
					required: '${label} is required!'
				}}
				form={form}
				onFinish={(data) => props.createChannelsMutation.mutate()}
			>
				<Form.Item name="name" label="Name" rules={[{ required: true }]}>
					<Input
						placeholder='Type channel name here...'
						value={props.body.name}
						onChange={(e) => props.setBody({...props.body, name: e.target.value})}
					/>
				</Form.Item>
				<Form.Item name="type" label="Type" required={true} initialValue={props.body.type}>
					<Radio.Group 
						onChange={(e) => {
							props.setBody({...props.body, type: e.target.value})
							if (e.target.value === 'PROTECTED') setShowPassword(true)
							else setShowPassword(false)
						}}
					>
						<Radio value='PUBLIC'>Public</Radio>
						<Radio value='PROTECTED'>Protected</Radio>
						<Radio value='PRIVATE'>Private</Radio>
					</Radio.Group>
				</Form.Item>
				{
					showPassword ? (
						<Form.Item name="password" label="Password">
							<Input 
								placeholder='Type channel password here...'
								value={props.body.password} 
								onChange={(e) => props.setBody({...props.body, name: e.target.value})}
							/>
						</Form.Item>
					): ''
				}
			</Form>
		</Modal>
	)
}

interface PasswordModalProps {
	passwordModalIsOpen: boolean;
	setPasswordModalIsOpen: React.Dispatch<React.SetStateAction<boolean>>
	passwordMutation: UseMutationResult<ChannelUsersResponse, any, number, unknown>
	passwordId: number
	password: string,
	setPassword: React.Dispatch<React.SetStateAction<string>>
}

const PasswordModal = (props: PasswordModalProps) => {
	
	const [form] = Form.useForm();
	
	return (
		<Modal
			title="Join channel"
			open={props.passwordModalIsOpen}
			onOk={() => form.submit()}
			confirmLoading={props.passwordMutation.isLoading}
			onCancel={() => props.setPasswordModalIsOpen(false)}
			okButtonProps={{ type: 'default' }}
			cancelButtonProps={{ danger: true }}
			okText={'Submit'}
			cancelText={'Cancel'}
		>
			<Form
				autoComplete='off'
				layout='vertical'
				validateMessages={{
					required: '${label} is required!'
				}}
				form={form}
				onFinish={(data) => {console.log(data); props.passwordMutation.mutate(props.passwordId); form.resetFields()}}
			>
				<Form.Item rules={[{ required: true }]} name="password" label="Password">
					<Input value={props.password} onChange={(e) => props.setPassword(e.target.value)} placeholder='Type password here...' />
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default index