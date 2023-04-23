import { usersService } from '@/apis/usersService'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { User } from '@prisma/client'
import { Button, List, message } from 'antd'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-query'

const index = () => {
	const [messageApi, contextHolder] = message.useMessage();
	const [users, setUsers] = useState<User[]>([]);
	const router = useRouter();
	
	const { isLoading: getAllUsersIsLoading } = useQuery({
		queryKey: 'getUsers',
		queryFn: () => usersService.getAllUsers(),
		onSuccess: (res) => setUsers(res),
	})
	
	const addFriendMutation = useMutation({
		mutationKey: 'addFriend',
		mutationFn: (user_id: string) => usersService.createUserFriends(user_id),
		onSuccess: (res) => {
			setUsers(prev => prev.filter((obj) => obj.id !== res.friend_id));
			messageApi.success('Successfully added friend');
		}
	})
	
	const blockUserMutation = useMutation({
		mutationKey: 'blockUser',
		mutationFn: (user_id: string) => usersService.createUserBlock(user_id),
		onSuccess: (res) => {
			setUsers(prev => prev.filter((obj) => obj.id !== res.blocked_id));
			messageApi.success('Successfully blocked user');
		}
	})
	
	return (
		<PageContainer>
			{ contextHolder }
			<ProCard>
				<ProCard 
					title="Users list"
					bordered
					headerBordered
					loading={getAllUsersIsLoading}
				>
					<List
						dataSource={users}
						renderItem={(item, index) => (
							<List.Item
								key={index}
								actions={[
									<Button onClick={() => addFriendMutation.mutate(item.id)}>Add</Button>,
									<Button onClick={() => router.push(`/users/${item.id}`)}>View</Button>,
									<Button danger onClick={() => blockUserMutation.mutate(item.id)}>Block</Button>
								]}
							>
								<List.Item.Meta title={`${index + 1}. ${item.name}`} />
								<div>{item.email}</div>
							</List.Item>
						)}
					/>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default index