import { Test, TestingModule } from '@nestjs/testing';
import { OfficeUserService } from './office-user.service';

describe('OfficeUserService', () => {
  let service: OfficeUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfficeUserService],
    }).compile();

    service = module.get<OfficeUserService>(OfficeUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
