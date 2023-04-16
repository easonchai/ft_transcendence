import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Avatar, Button, Col, Divider, Input, Row, Space } from 'antd'
import { useRouter } from 'next/router'
import React from 'react'

const Messsages = [
	{ msg: 'Lorem ipsum dolor sit amet.' },
	{ msg: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?' },
	{ msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!' },
	{ msg: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?' },
	{ msg: 'Lorem ipsum dolor sit amet.' },
	{ msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!' },
	{ msg: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?' },
	{ msg: 'Lorem ipsum dolor sit amet.' },
	{ msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!' },
	{ msg: 'Lorem ipsum dolor sit amet.' },
	{ msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, id vel! Perspiciatis veritatis beatae dolor explicabo sed dolores maiores molestiae!' },
	{ msg: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo sit, blanditiis magnam ex veritatis omnis?' },
]

const chat = () => {
	const router = useRouter()
	const { id } = router.query;
	
	return (
		<PageContainer
			title="Chat"
		>
			<ProCard>
				<ProCard
					title={id}
					headerBordered
					bordered
					bodyStyle={{ display: 'block' }}
				>
					<ProCard bordered style={{ overflowY: 'scroll' }}>
						<div className='h-[60vh]'>
							{
								Messsages.map((item, index) => (
									index % 2 === 0 ? (
										<Row key={index} className='py-3'>
											<Col span={12}></Col>
											<Col span={12}>
												<Row gutter={10} align={'middle'}>
													<Col span={18} className='text-right'>
														{item.msg}
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
														{item.msg}
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
					<Row className='pt-3'>
						<Space.Compact className='w-full'>
							<Input placeholder='Type messages here...' />
							<Button>Send</Button>
						</Space.Compact>
					</Row>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default chat