import { Test, TestingModule } from '@nestjs/testing';
import { IntraController } from './intra.controller';

describe('IntraController', () => {
  let controller: IntraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntraController],
    }).compile();

    controller = module.get<IntraController>(IntraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
