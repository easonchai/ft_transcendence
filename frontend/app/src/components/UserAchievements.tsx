import React from 'react'
import { ProCard, ProListMetas } from '@ant-design/pro-components'
import { Avatar, List } from 'antd'

const MockData: any = [
	{
		name: "It's a rich man world 3",
		image: 'https://cdn.intra.42.fr/achievement/image/38/SOC004.svg',
		desc: 'Collected 500 wallet points'
	},
	{
		name: 'Boss Hunter 4',
		image: 'https://cdn.intra.42.fr/achievement/image/20/PRO005.svg',
		desc: 'Validated 21 projet with the maximum score.'
	},
	{
		name: "It's a rich man world 3",
		image: 'https://cdn.intra.42.fr/achievement/image/38/SOC004.svg',
		desc: 'Collected 500 wallet points'
	},
	{
		name: 'Boss Hunter 4',
		image: 'https://cdn.intra.42.fr/achievement/image/20/PRO005.svg',
		desc: 'Validated 21 projet with the maximum score.'
	},
	{
		name: "It's a rich man world 3",
		image: 'https://cdn.intra.42.fr/achievement/image/38/SOC004.svg',
		desc: 'Collected 500 wallet points'
	},
	{
		name: 'Boss Hunter 4',
		image: 'https://cdn.intra.42.fr/achievement/image/20/PRO005.svg',
		desc: 'Validated 21 projet with the maximum score.'
	}
]

const UserAchievements = () => {
	return (
		<ProCard
			title="Achievements"
			className='h-full'
			bordered
			headerBordered
		>
			<List 
				style={{ overflowY: 'scroll', maxHeight: 320 }}
				dataSource={MockData}
				renderItem={(item: any, index) => (
					<List.Item key={index}>
						<List.Item.Meta 
							title={item.name}
							description={item.desc}
							avatar={<Avatar src={item.image} />}
						/>
					</List.Item>
				)}
			/>
		</ProCard>
	)
}

export default UserAchievements