import { Test, TestingModule } from '@nestjs/testing';
import { ClientsController } from '@modules/clients/clients.controller';
import { ClientsService } from '@modules/clients/clients.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard, RolesGuard } from '@common/auth';
import { CreateClientDto } from '@modules/clients/dto/create-client.dto';
import { UpdateClientDto } from '@modules/clients/dto/update-client.dto';

describe('ClientsController', () => {
  let controller: ClientsController;
  let service: ClientsService;

  const mockClient = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St',
    company: 'Acme Corp',
    organizationId: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateClientDto: CreateClientDto = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St',
    company: 'Acme Corp',
  };

  const mockUpdateClientDto: UpdateClientDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 'admin',
    organizationId: 1,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
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
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientsController>(ClientsController);
    service = module.get<ClientsService>(ClientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockClient);

      const result = await controller.create(mockCreateClientDto, mockUser, 1);

      expect(service.create).toHaveBeenCalledWith(mockCreateClientDto, 1, 1);
      expect(result).toEqual(mockClient);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(mockCreateClientDto, mockUser, 1),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const mockClients = [
        mockClient,
        { ...mockClient, id: 2, name: 'Jane Doe' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockClients);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockClients);
    });

    it('should return empty array when no clients exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single client by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);

      const result = await controller.findOne(1, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockClient);
    });

    it('should handle client not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined as any);

      const result = await controller.findOne(999, mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updatedClient = { ...mockClient, ...mockUpdateClientDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedClient);

      const result = await controller.update(1, mockUpdateClientDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(1, mockUpdateClientDto, 1, 1);
      expect(result).toEqual(updatedClient);
    });

    it('should handle update errors', async () => {
      const error = new Error('Client not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update(999, mockUpdateClientDto, mockUser),
      ).rejects.toThrow('Client not found');
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const deleteMessage = { message: 'Client deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteMessage);

      const result = await controller.remove(1, mockUser);

      expect(service.remove).toHaveBeenCalledWith(1, 1, 1);
      expect(result).toEqual(deleteMessage);
    });

    it('should handle removal errors', async () => {
      const error = new Error('Client not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove(999, mockUser)).rejects.toThrow(
        'Client not found',
      );
    });
  });
});
