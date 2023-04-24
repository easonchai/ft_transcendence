import { signOut, useSession } from 'next-auth/react'
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Row, Col, Image, message } from 'antd';
import UserInformation from '@/components/UserInformation'
import UserFriendList from '@/components/UserFriendList';
import UserAchievements from '@/components/UserAchievements';
import UserMatchStats from '@/components/UserMatchStats';
import UserMatchHistory from '@/components/UserMatchHistory';
import { useQuery } from 'react-query';
import { usersService } from '@/apis/usersService';
import { useState } from 'react';
import { User } from '@prisma/client';
import { GetMatchStatsResponse, GetMatchesResponse, matchService } from '@/apis/matchService';

export interface UserDetailsProps {
	isMe: boolean,
	id: string
}

export default function UserDetails(props: UserDetailsProps) {
	const [messageApi, contextHolder] = message.useMessage();
	const [user, setUser] = useState<User>();
	const [friends, setFriends] = useState<User[]>([]);
	const [pendings, setPendings] = useState<User[]>([]);
	const [requested, setRequested] = useState<User[]>([]);
	const [blocked, setBlocked] = useState<User[]>([]);
	const [chats, setChats] = useState<User[]>([]);
	const [matches, setMatches] = useState<GetMatchesResponse[]>([]);
	const [stats, setStats] = useState<GetMatchStatsResponse>();
	
	const { isLoading: getUserIsloading } = useQuery({
		queryKey: 'getUser',
		queryFn: () => usersService.getUserById(props.id),
		onSuccess: (res) => setUser(res),
	})
	
	const { isLoading: getAcceptedFriendsIsLoading } = useQuery({
		queryKey: 'getAcceptedFriends',
		queryFn: () => usersService.getAcceptedFriends(props.id),
		onSuccess: (res) => setFriends(res),
	})
	
	const { isLoading: getPendingFriendsIsLoading } = useQuery({
		queryKey: 'getPendingFriends',
		queryFn: () => usersService.getPendingFriends(),
		onSuccess: (res) => setPendings(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getRequestedFriendsIsLoading } = useQuery({
		queryKey: 'getRequestedFriends',
		queryFn: () => usersService.getRequestedFriends(),
		onSuccess: (res) => setRequested(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getBlockedIsLoading } = useQuery({
		queryKey: 'getBlocked',
		queryFn: () => usersService.getBlocked(),
		onSuccess: (res) => setBlocked(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getChatsIsLoading } = useQuery({
		queryKey: 'getChats',
		queryFn: () => usersService.getChats(),
		onSuccess: (res) => setChats(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getMatchHistoriesIsLoading } = useQuery({
		queryKey: 'getMatchHistories',
		queryFn: () => matchService.getMatchHistories(props.id),
		onSuccess: (res) => setMatches(res)
	})
	
	const { isLoading: getMatchStatsIsLoading } = useQuery({
		queryKey: 'getMatchStats',
		queryFn: () => matchService.getMatchStats(props.id),
		onSuccess: (res) => setStats(res)
	})
	
	return (
		<PageContainer
			title="Profile"
			header={{
				extra: props.isMe ? [ <Button key="1" onClick={() => signOut()} danger type="primary">Log out</Button> ] : []
			}}
		>
			{ contextHolder }
			<ProCard>
				<Row 
					gutter={10}
				>
					<Col span={4}>
						<Image src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} width={150} />
					</Col>
					<Col span={20}>
						<UserInformation user={user!} isLoading={getUserIsloading} />
					</Col>
				</Row>
				<Row
					className='py-5'
					gutter={10}
				>
					<Col span={12}>
						<UserFriendList 
							{...{chats, pendings, friends, blocked, requested, messageApi, setBlocked}}
							isLoading={getChatsIsLoading || getPendingFriendsIsLoading || getAcceptedFriendsIsLoading || getBlockedIsLoading || getRequestedFriendsIsLoading}
							isMe={props.isMe}
						/>
					</Col>
					<Col span={12}>
						<UserAchievements />
					</Col>
				</Row>
				<Row
					gutter={10}
				>
					<Col span={12}>
						<UserMatchStats stats={stats!} isLoading={getMatchStatsIsLoading} />
					</Col>
					<Col span={12}>
						<UserMatchHistory {...{matches}} isLoading={getMatchHistoriesIsLoading} />
					</Col>
				</Row>
			</ProCard>
		</PageContainer>
	)
}
