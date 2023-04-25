import { signOut, useSession } from 'next-auth/react'
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Button, Row, Col, Image, message, Modal, Form, Upload } from 'antd';
import UserInformation from '@/components/UserInformation'
import UserFriendList from '@/components/UserFriendList';
import UserAchievements from '@/components/UserAchievements';
import UserMatchStats from '@/components/UserMatchStats';
import UserMatchHistory from '@/components/UserMatchHistory';
import { UseMutationResult, useMutation, useQuery } from 'react-query';
import { usersService } from '@/apis/usersService';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { GetMatchStatsResponse, GetMatchesResponse, matchService } from '@/apis/matchService';
import { UploadOutlined } from '@ant-design/icons';

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
	const [uploadModalIsOpen, setUploadModalIsOpen] = useState<boolean>(false);
	
	const { isLoading: getUserIsloading, isSuccess: getUserIsSuccess } = useQuery({
		queryKey: ['getUser', props.id],
		queryFn: () => usersService.getUserById(props.id),
		onSuccess: (res) => setUser(res),
	})
	
	const { isLoading: getAcceptedFriendsIsLoading } = useQuery({
		queryKey: ['getAcceptedFriends', props.id],
		queryFn: () => usersService.getAcceptedFriends(props.id),
		onSuccess: (res) => setFriends(res),
	})
	
	const { isLoading: getPendingFriendsIsLoading } = useQuery({
		queryKey: ['getPendingFriends', props.id],
		queryFn: () => usersService.getPendingFriends(),
		onSuccess: (res) => setPendings(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getRequestedFriendsIsLoading } = useQuery({
		queryKey: ['getRequestedFriends', props.id],
		queryFn: () => usersService.getRequestedFriends(),
		onSuccess: (res) => setRequested(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getBlockedIsLoading } = useQuery({
		queryKey: ['getBlocked', props.id],
		queryFn: () => usersService.getBlocked(),
		onSuccess: (res) => setBlocked(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getChatsIsLoading } = useQuery({
		queryKey: ['getChats', props.id],
		queryFn: () => usersService.getChats(),
		onSuccess: (res) => setChats(res),
		enabled: props.isMe === true
	})
	
	const { isLoading: getMatchHistoriesIsLoading } = useQuery({
		queryKey: ['getMatchHistories', props.id],
		queryFn: () => matchService.getMatchHistories(props.id),
		onSuccess: (res) => setMatches(res)
	})
	
	const { isLoading: getMatchStatsIsLoading } = useQuery({
		queryKey: ['getMatchStats', props.id],
		queryFn: () => matchService.getMatchStats(props.id),
		onSuccess: (res) => setStats(res)
	})
	
	const uploadImageMutation = useMutation({
		mutationKey: 'uploadImage',
		mutationFn: (data: FormData) => usersService.updateImage(data),
		onSuccess: (res) => {
			setUser(res);
			messageApi.success('Successfully updated image');
		},
		onError: (e: any) => {
			messageApi.error(e.message);
		}
	})
	
	if (!getUserIsSuccess) return 'Loading...'
	
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
						<div onClick={() => setUploadModalIsOpen(true)}>
							<Image src={
								user?.image 
									? `http://localhost:3000/users/image/${user.id}`
									: `https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`
								} 
								width={150} 
								preview={false}
								className='cursor-pointer rounded-full'
							/>
						</div>
					</Col>
					<Col span={20}>
						<UserInformation {...{user : user!, messageApi, setUser}} isLoading={getUserIsloading} isMe={props.isMe} />
					</Col>
				</Row>
				<Row
					className='py-5'
					gutter={10}
				>
					<Col span={12}>
						<UserFriendList 
							{...{chats, pendings, friends, blocked, requested, messageApi, setBlocked, setPendings}}
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
			<UploadModal {...{setUploadModalIsOpen, uploadImageMutation, uploadModalIsOpen}} />
		</PageContainer>
	)
}

interface UploadModalProps {
	setUploadModalIsOpen: Dispatch<SetStateAction<boolean>>;
	uploadModalIsOpen: boolean;
	uploadImageMutation: UseMutationResult<any, any, FormData, unknown>
}

const UploadModal = (props: UploadModalProps) => {
	const [form] = Form.useForm();
	const [image, setImage] = useState<any>();
	
	const handleUpload = () => {
		let formdata = new FormData();
		
		console.log(image)
		formdata.append('file', image.file.originFileObj, image.file.originFileObj.name);
		props.uploadImageMutation.mutate(formdata);
	}
	
	return (
		<Modal
			title="Update image"
			onOk={() => form.submit()}
			onCancel={() => props.setUploadModalIsOpen(false)}
			cancelText="Cancel"
			okText="Submit"
			open={props.uploadModalIsOpen}
		>
			<Form form={form} onFinish={(data) => { handleUpload(); props.setUploadModalIsOpen(false)} }>
				<Form.Item name="image" label="Image" getValueFromEvent={(e) => {setImage(e)}} valuePropName='fileList'>
					<Upload multiple={false} maxCount={1} accept='image/png, image/jpg, image/jpeg'>
						<Button icon={<UploadOutlined />}>Click to Upload</Button>
					</Upload>
				</Form.Item>
			</Form>
		</Modal>
	)
}