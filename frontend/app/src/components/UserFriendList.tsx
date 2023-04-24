import { ProTable, ProColumns, ProCard } from '@ant-design/pro-components'
import { Badge, Button, List } from 'antd'
import Link from 'next/link'
import React, { Dispatch, SetStateAction, useContext } from 'react'
import { AppContext } from './Layout'
import { User } from '@prisma/client'
import { useMutation } from 'react-query'
import { usersService } from '@/apis/usersService'
import { MessageInstance } from 'antd/es/message/interface'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

interface UserFriendListProps {
	friends: User[],
	pendings: User[],
	requested: User[],
	blocked: User[],
	chats: User[],
	isLoading: boolean
	isMe: boolean,
	messageApi: MessageInstance,
	setBlocked: Dispatch<SetStateAction<User[]>>
}

const UserFriendList = (props: UserFriendListProps) => {
	
	const context = useContext(AppContext);
	const { data: session } = useSession();
	
	const unbanMutation = useMutation({
		mutationKey: 'unban',
		mutationFn: (user_id: string)  => usersService.deleteUserBlock(user_id),
		onSuccess: (res) => {
			props.setBlocked(prev => prev.filter((obj) => obj.id !== res.blocked_id));
			props.messageApi.success('Successfully unban user');
		}
	})
	
	return (
		<ProCard
			bordered
			className='h-full'
			tabs={{ type: 'card' }}
			loading={props.isLoading}
		>
			<ProCard.TabPane key='1' tab="Friends">
				<List
					style={{ maxHeight: 320, overflowY: 'scroll' }}
					dataSource={props.friends}
					renderItem={(item, index) => (
						<List.Item
							key={index}
							actions={[ session?.user.id !== item.id ? <Link href={`/chat/${item.id}`}><Button>Chat</Button></Link> : '' ]}
						>
							<List.Item.Meta title={<Link href={`/users/${item.id}`}>{`${index + 1}. ${item.name}`}</Link>} />
						</List.Item>
					)}
				/>
			</ProCard.TabPane>
			{
				props.isMe ? (
					<>
						<ProCard.TabPane key='2' tab="Pending">
							<List
								style={{ maxHeight: 320, overflowY: 'scroll' }}
								dataSource={props.pendings}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										actions={[ <Link href={`/chat/${item.id}`}><Button>Chat</Button></Link> ]}
									>
										<List.Item.Meta title={`${index + 1}. ${item.name}`} />
									</List.Item>
								)}
							/>
						</ProCard.TabPane>
						<ProCard.TabPane key='3' tab="Requested">
							<List
								style={{ maxHeight: 320, overflowY: 'scroll' }}
								dataSource={props.requested}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										actions={[ <Link href={`/chat/${item.id}`}><Button>Chat</Button></Link> ]}
									>
										<List.Item.Meta title={`${index + 1}. ${item.name}`} />
									</List.Item>
								)}
							/>
						</ProCard.TabPane>
						<ProCard.TabPane key='4' tab="Blocked">
							<List
								style={{ maxHeight: 320, overflowY: 'scroll' }}
								dataSource={props.blocked}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										actions={[ <Button onClick={() => unbanMutation.mutate(item.id)} danger>Unblock</Button> ]}
									>
										<List.Item.Meta title={`${index + 1}. ${item.name}`} />
									</List.Item>
								)}
							/>
						</ProCard.TabPane>
						<ProCard.TabPane key='5' tab="Chats">
							<List
								style={{ maxHeight: 320, overflowY: 'scroll' }}
								dataSource={props.chats}
								renderItem={(item, index) => (
									<List.Item
										key={index}
										actions={[ <Link href={`/chat/${item.id}`}><Button>Chat</Button></Link> ]}
									>
										<List.Item.Meta title={`${index + 1}. ${item.name}`} />
									</List.Item>
								)}
							/>
						</ProCard.TabPane>
					</>
				) : ''
			}
		</ProCard>
	)
}

export default UserFriendList