import React, { useEffect, useState } from "react";
import { ProCard } from "@ant-design/pro-components";
import { Avatar, List } from "antd";
import { useSession } from "next-auth/react";
import { usersService } from "@/apis/usersService";
import { useQuery } from "react-query";

interface Achievement {
  achievements: [];
  campus: string[];
  description: string;
  id: number;
  image: string;
  kind: string;
  name: string;
  nbr_of_success: number;
  parent: null;
  tier: string;
  title: null;
  users_url: string;
  visible: true;
}

const UserAchievements = () => {
  const { data: session } = useSession();
  const [achievements, setAchievements] = useState<Achievement[]>();

	/**
	 * Now to set achievements, we need to do a few things
	 * 1. We need to get all achievements of the user
	 * 2. Then, map it and retrieve all achievement info of the user
	 */
	const { isLoading: getAchievementsIsLoading } = useQuery({
		queryKey: 'getAchievements',
		queryFn: () => usersService.getAchievements(),
		onSuccess: (res) => setAchievements(res),
		enabled: !!session?.user
	})

  return (
    <ProCard title="Achievements" className="h-full" bordered headerBordered>
      <List
        style={{ overflowY: "scroll", maxHeight: 320 }}
        dataSource={achievements}
				loading={getAchievementsIsLoading}
        renderItem={(item: Achievement, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              title={item.name}
              description={item.description}
              avatar={
                <Avatar
                  src={item.image.replace(
                    "/uploads",
                    "https://cdn.intra.42.fr"
                  )}
                />
              }
            />
          </List.Item>
        )}
      />
    </ProCard>
  );
};

export default UserAchievements;
