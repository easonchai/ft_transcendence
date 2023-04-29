import { Test, TestingModule } from '@nestjs/testing';
import { IntraService } from './intra.service';

describe('IntraService', () => {
  let service: IntraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntraService],
    }).compile();

    service = module.get<IntraService>(IntraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
