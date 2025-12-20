import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '@modules/users/users.controller';
import { UsersService } from '@modules/users/users.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard, RolesGuard } from '@common/auth';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUserEntity = {
    id: 1,
    clerkUserId: 'user_abc123',
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashedPassword',
    type: 'regular',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    clerkUserId: 'user_abc123',
    email: 'john@example.com',
    name: 'John Doe',
    password: 'password123',
    type: 'regular',
    role: 'member',
  };

  const mockUpdateUserDto: UpdateUserDto = {
    name: 'Jane Doe',
  };

  const mockCurrentUser = {
    id: 1,
    email: 'admin@example.com',
    type: 'regular',
    role: 'admin',
    organizationId: 1,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getUsersInOrganization: jest.fn(),
            getUserOrganizations: jest.fn(),
            addUserToOrganization: jest.fn(),
            updateUserRoleInOrganization: jest.fn(),
            removeUserFromOrganization: jest.fn(),
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

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockUserEntity);

      const result = await controller.create(
        mockCreateUserDto,
        mockCurrentUser,
        1,
      );

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto, 1, 1);
      expect(result).toEqual(mockUserEntity);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(mockCreateUserDto, mockCurrentUser, 1),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of users in organization', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'john@example.com',
          name: 'John Doe',
          type: 'regular' as const,
          isActive: true,
          role: 'admin' as const,
          joinedAt: new Date(),
        },
        {
          id: 2,
          email: 'jane@example.com',
          name: 'Jane Doe',
          type: 'regular' as const,
          isActive: true,
          role: 'member' as const,
          joinedAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'getUsersInOrganization')
        .mockResolvedValue(mockUsers);

      const result = await controller.findAll(mockCurrentUser);

      expect(service.getUsersInOrganization).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await controller.getCurrentUser(mockCurrentUser);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserEntity);
    });
  });

  describe('getUserOrganizations', () => {
    it('should return user organizations', async () => {
      const mockOrganizations = [
        {
          organizationId: 1,
          role: 'admin' as const,
          isActive: true,
          createdAt: new Date(),
        },
        {
          organizationId: 2,
          role: 'member' as const,
          isActive: true,
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'getUserOrganizations')
        .mockResolvedValue(mockOrganizations);

      const result = await controller.getUserOrganizations(mockCurrentUser);

      expect(service.getUserOrganizations).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrganizations);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUserEntity);

      const result = await controller.findOne(1, mockCurrentUser);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserEntity);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUserEntity, ...mockUpdateUserDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update(
        1,
        mockUpdateUserDto,
        mockCurrentUser,
      );

      expect(service.update).toHaveBeenCalledWith(1, mockUpdateUserDto, 1, 1);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const deleteMessage = { message: 'User deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteMessage);

      const result = await controller.remove(1, mockCurrentUser);

      expect(service.remove).toHaveBeenCalledWith(1, 1, 1);
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('addUserToOrganization', () => {
    it('should add user to organization', async () => {
      const mockResult = {
        id: 1,
        userId: 2,
        organizationId: 1,
        role: 'member' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1,
        updatedBy: 1,
      };
      jest
        .spyOn(service, 'addUserToOrganization')
        .mockResolvedValue(mockResult);

      const result = await controller.addUserToOrganization(
        2,
        1,
        { role: 'member' },
        mockCurrentUser,
      );

      expect(service.addUserToOrganization).toHaveBeenCalledWith(
        2,
        1,
        'member',
        1,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateUserRoleInOrganization', () => {
    it('should update user role in organization', async () => {
      const mockResult = {
        id: 1,
        userId: 2,
        organizationId: 1,
        role: 'admin' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 1,
        updatedBy: 1,
      };
      jest
        .spyOn(service, 'updateUserRoleInOrganization')
        .mockResolvedValue(mockResult);

      const result = await controller.updateUserRoleInOrganization(
        2,
        1,
        { role: 'admin' },
        mockCurrentUser,
      );

      expect(service.updateUserRoleInOrganization).toHaveBeenCalledWith(
        2,
        1,
        'admin',
        1,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('removeUserFromOrganization', () => {
    it('should remove user from organization', async () => {
      const deleteMessage = {
        message: 'User removed from organization successfully',
      };
      jest
        .spyOn(service, 'removeUserFromOrganization')
        .mockResolvedValue(deleteMessage);

      const result = await controller.removeUserFromOrganization(
        2,
        1,
        mockCurrentUser,
      );

      expect(service.removeUserFromOrganization).toHaveBeenCalledWith(2, 1, 1);
      expect(result).toEqual(deleteMessage);
    });
  });
});
