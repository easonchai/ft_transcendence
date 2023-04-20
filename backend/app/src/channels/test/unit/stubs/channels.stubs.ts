import { Channels } from "@prisma/client";

export const ChannelsStubs = (): Partial<Channels> => {
	return {
		id: 1,
		name: 'Channel one',
		type: 'PUBLIC',
		created_at: new Date('2023-04-10T06:23:10.325Z'),
		updated_at: new Date('2023-04-10T06:23:10.325Z'),
	}
}