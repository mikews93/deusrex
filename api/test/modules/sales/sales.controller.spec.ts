import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from '@modules/sales/sales.controller';
import { SalesService } from '@modules/sales/sales.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard } from '@common/auth';

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        SalesService,
        {
          provide: DatabaseService,
          useValue: {
            db: {
              select: jest.fn(),
              insert: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(ClerkGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
