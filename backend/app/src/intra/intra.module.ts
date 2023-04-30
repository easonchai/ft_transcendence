import { Module } from '@nestjs/common';
import { IntraService } from './intra.service';
import { IntraController } from './intra.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/app.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.intra.42.fr',
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [PrismaService, IntraService],
  controllers: [IntraController],
  exports: [IntraService],
})
export class IntraModule {}
