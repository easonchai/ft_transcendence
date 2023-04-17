import React from 'react'
import { ProCard } from '@ant-design/pro-components'
import { Avatar, Col, Row, Typography } from 'antd';

interface ChatWindowProps {
	chats: {
		messages: string;
		avatar: string;
		name: string;
		created_at: string;
		[options: string]: unknown;
	}[];
}

const ChatWindow = (props: ChatWindowProps) => {
	return (
		<ProCard bordered style={{ overflowY: 'scroll' }}>
			<div className='h-[60vh]'>
				{
					props.chats.map((item, index) => (
						index % 2 === 0 ? (
							<Row key={index} className='py-3'>
								<Col span={12}></Col>
								<Col span={12}>
									<Row gutter={10} align={'middle'}>
										<Col span={18} className='text-right'>
											<div>
												<Typography.Text type='secondary'>{item.created_at}</Typography.Text>
											</div>
											{item.messages}
										</Col>
										<Col span={6}>
											<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
										</Col>
									</Row>
								</Col>
							</Row>
						) : (
							<Row key={index} className='py-3'>
								<Col span={12}>
									<Row gutter={10} align={'middle'}>
										<Col span={6} className='text-right'>
											<Avatar src={`https://source.boringavatars.com/pixel/150/${(new Date()).getTime()}`} />
										</Col>
										<Col span={18}>
											<div>
												<Typography.Text type='secondary'>{item.created_at}</Typography.Text>
											</div>
											{item.messages}
										</Col>
									</Row>
								<Col span={12}></Col>
								</Col>
							</Row>
						)
					))
				}
			</div>
		</ProCard>
	)
}

export default ChatWindow