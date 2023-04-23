import { getSession, signOut, useSession } from 'next-auth/react'
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
import UserDetails from '@/components/UserDetails';

export default function Home() {
	const { data: session } = useSession();
	
	return (
		<UserDetails isMe={true} id={session?.user.id!} />
	)
}
