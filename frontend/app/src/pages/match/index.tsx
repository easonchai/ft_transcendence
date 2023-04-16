import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Button, List } from 'antd'

const MockData = [
  { name: 'Room 1' },
	{ name: 'Room 2' },
	{ name: 'Room 3' },
	{ name: 'Room 4' },
	{ name: 'Room 5' },
	{ name: 'Room 6' },
]

const index = () => {
	return (
		<PageContainer>
			<ProCard>
				<ProCard
					title="Room list"
					headerBordered
					bordered
				>
					<List
						dataSource={MockData}
						extra
						renderItem={(item, index) => (
							<List.Item
								key={index}
								actions={[ <Button>Join</Button> ]}
							>
								<List.Item.Meta title={item.name} />
							</List.Item>
						)}
					/>
				</ProCard>
			</ProCard>
		</PageContainer>
	)
}

export default index