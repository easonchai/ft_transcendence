import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Badge, Button, Form, Input, Modal, Space, Statistic, Switch } from 'antd'
import Link from 'next/link'
import { User } from '@prisma/client'
import { UseMutationResult, useMutation } from 'react-query'
import { usersService } from '@/apis/usersService'
import { MessageInstance } from 'antd/es/message/interface'
import { AppContext } from './Layout'
import UserStatus from './UserStatus'

interface UserInformationProps {
	user: User;
	isLoading: boolean,
	isMe: boolean,
	messageApi: MessageInstance
	setUser: Dispatch<SetStateAction<User | undefined>>
	
}

const UserInformation = (props: UserInformationProps) => {
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
	const [modalInput, setModalInput] = useState<{name: string, two_factor: boolean}>({ name: props.user.name, two_factor: props.user.two_factor });
	const context = useContext(AppContext);
	
	const updateUserMutation = useMutation({
		mutationKey: 'updateUser',
		mutationFn: () => usersService.updateUser({ name: modalInput.name, two_factor: modalInput.two_factor }),
		onSuccess: (res) => {
			props.messageApi.success('Successfully update user')
			props.setUser({...props.user, name: res.name, two_factor: res.two_factor })
			setModalIsOpen(false);
		},
		onError: (e: any) => {
			props.messageApi.error(e.message);
		}
	})
	
	return (
		<ProCard.Group
			title="Information"
			direction='row'
			headerBordered
			bordered
			extra={ props.isMe ? [ <Button onClick={() => setModalIsOpen(true)}>Edit</Button> ] : []}
		>
			<ProCard>
				<Statistic 
					title="Name" 
					value={props.user ? props.user.name : ''}
					loading={props.isLoading}
					formatter={(value) => (
						<Space>
							{value}
							<UserStatus id={props.user.id} />
						</Space>
					)}
				/>
			</ProCard>
			<ProCard.Divider />
			<ProCard>
				<Statistic title="Email" value={props.user ? props.user.email! : ''} loading={props.isLoading}/>
			</ProCard>
			<EditModal {...{setModalInput, modalInput, modalIsOpen, setModalIsOpen, updateUserMutation}} />
		</ProCard.Group>
	)
}

interface EditModalProps {
	setModalInput: Dispatch<SetStateAction<{name: string, two_factor: boolean}>>;
	modalInput: {name: string, two_factor: boolean};
	modalIsOpen: boolean;
	setModalIsOpen: Dispatch<SetStateAction<boolean>>;
	updateUserMutation: UseMutationResult<User, unknown, void, unknown>
}

const EditModal = (props: EditModalProps) => {
	const [form] = Form.useForm();
	
	return (
		<Modal
			title="Edit user"
			okButtonProps={{ type: 'default' }}
			cancelButtonProps={{ type: 'default', danger: true }}
			okText="Submit"
			cancelText="Cancel"
			onOk={() => form.submit()}
			onCancel={() => props.setModalIsOpen(false)}
			open={props.modalIsOpen}
		>
			<Form
				form={form}
				onFinish={() => {props.updateUserMutation.mutate(); form.resetFields}}
			>
				<Form.Item name="name" label="Name" initialValue={props.modalInput.name} rules={[{ required: true, message: 'Name is required' }]}>
					<Input value={props.modalInput.name} onChange={(e) => props.setModalInput({...props.modalInput, name: e.target.value})} />
				</Form.Item>
				<Form.Item name="two_factor" label="Two factor authorization" initialValue={props.modalInput.two_factor}>
					<Switch defaultChecked={props.modalInput.two_factor} onChange={(checked) => props.setModalInput({...props.modalInput, two_factor: checked})} />
				</Form.Item>
			</Form>
		</Modal>
	)
}

export default UserInformation