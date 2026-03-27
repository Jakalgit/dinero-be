import { Test, TestingModule } from '@nestjs/testing';
import { NativeHashService } from './native-hash.service';

describe('NativeHashService', () => {
  let service: NativeHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NativeHashService],
    }).compile();

    service = module.get<NativeHashService>(NativeHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
