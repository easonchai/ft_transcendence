import { ChannelUsers } from "@prisma/client";

export const ChannelUsersStubs = (): Partial<ChannelUsers> => {
	return {
		user_id: 'User ID 1',
		channel_id: 1,
		type: 'OWNER',
		mute_time: new Date('2023-04-10T06:23:10.325Z'),
		created_at: new Date('2023-04-10T06:23:10.325Z'),
		updated_at: new Date('2023-04-10T06:23:10.325Z'),
	}
}