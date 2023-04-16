import { Inter } from 'next/font/google'
import { useSession, signIn, signOut } from 'next-auth/react'
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Row, Col, Image } from 'antd';
import UserInformation from '@/components/UserInformation'
import UserFriendList from '@/components/UserFriendList';
import UserAchievements from '@/components/UserAchievements';
import UserMatchStats from '@/components/UserMatchStats';
import UserMatchHistory from '@/components/UserMatchHistory';


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
	const { data: session } = useSession();
	
	return (
		!session ? (
			<button onClick={() => signIn()}>Log in</button>
		) : (
			<PageContainer
				title="Profile"
				header={{
					extra: [ <Button key="1" onClick={() => signOut()} danger type="primary">Log out</Button> ]
				}}
			>
				<ProCard>
					<Row 
						gutter={10}
					>
						<Col span={6}>
							<Image src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} width={150} />
						</Col>
						<Col span={18}>
							<UserInformation />
						</Col>
					</Row>
					<Row
						className='py-5'
						gutter={10}
					>
						<Col span={12}>
							<UserFriendList />
						</Col>
						<Col span={12}>
							<UserAchievements />
						</Col>
					</Row>
					<Row
						gutter={10}
					>
						<Col span={12}>
							<UserMatchStats />
						</Col>
						<Col span={12}>
							<UserMatchHistory />
						</Col>
					</Row>
				</ProCard>
			</PageContainer>
		)
	)
}
