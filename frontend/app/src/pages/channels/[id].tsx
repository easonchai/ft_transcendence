import { useRouter } from 'next/router'
import React from 'react'

const ChannelsChat = () => {
	const router = useRouter();
	const { id } = router.query;
	
	return (
		<div>[id]</div>
	)
}

export default ChannelsChat