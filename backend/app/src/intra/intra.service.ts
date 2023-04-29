import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/app.service';

@Injectable()
export class IntraService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}
  access_token: string;

  async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async reauthenticate() {
    // const res = await this.httpService.axiosRef.post(`/oauth/token`, {
    //   params: {
    //     client_id: process.env.FORTYTWO_CLIENT_ID,
    //     client_secret: process.env.FORTYTWO_CLIENT_SECRET,
    //     grant_type: 'client_credentials',
    //     scope: 'public projects',
    //   },
    // });
    const res = await this.httpService.axiosRef.post(
      'https://api.intra.42.fr/oauth/token?client_id=dd8fda85bddb2e94708de20e88aed31e079200081fb561e15298308f43930dd2&client_secret=68379a4b5d47cb2c2599f1d16fc115a71952b0da1e96fda95969adb5d8f19254&grant_type=client_credentials&scope=public projects',
    );

    this.access_token = res.data.access_token;
  }

  private async getIntraAchievements(intraId: number) {
    const res = await this.httpService.axiosRef.get(
      `/v2/achievements_users?filter[user_id]=${intraId}`,
      {
        headers: {
          Authorization: `Bearer ${this.access_token}`,
        },
      },
    );
    return res.data;
  }

  private async getIntraAchievementInfo(achievementId: number) {
    const res = await this.httpService.axiosRef.get(
      `/v2/achievements/${achievementId}`,
      {
        headers: {
          Authorization: `Bearer ${this.access_token}`,
        },
      },
    );
    return res.data;
  }

  async getAchievements(userId: string) {
    await this.reauthenticate();

    const { intraId } = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const achievementsWithInfo = [];

    if (intraId) {
      const achievements = (await this.getIntraAchievements(intraId)).slice(
        0,
        10,
      );

      for await (const achievement of achievements) {
        try {
          const achievementInfo = await this.getIntraAchievementInfo(
            achievement.achievement_id,
          );
          achievementsWithInfo.push(achievementInfo);
          await this.sleep(250);
        } catch (err) {
          if (err.code === 429) {
            console.log('rate limited');
          } else {
            console.log(err);
          }
        }
      }
    }

    return achievementsWithInfo;
  }
}
