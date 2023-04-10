import { ChannelMessages } from "@prisma/client"

export const ChannelMessagesStubs = (): Partial<ChannelMessages> => {
	return {
		id: 1,
		user_id: 'User ID 1',
		channel_id: 1,
		message: 'Hello world',
		created_at: new Date('2023-04-10T06:23:10.325Z'),
		updated_at: new Date('2023-04-10T06:23:10.325Z'),
	}
}