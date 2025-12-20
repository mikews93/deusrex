import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from '@modules/appointments/appointments.controller';
import { AppointmentsService } from '@modules/appointments/appointments.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard, RolesGuard } from '@common/auth';
import { CreateAppointmentDto } from '@modules/appointments/dto/create-appointment.dto';
import { UpdateAppointmentDto } from '@modules/appointments/dto/update-appointment.dto';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: AppointmentsService;

  const mockAppointment = {
    id: 1,
    organizationId: 1,
    patientId: 1,
    healthProfessionalId: 2,
    appointmentDate: '2024-02-15 09:00:00',
    duration: 30,
    startTime: '2024-02-15 09:00:00',
    endTime: '2024-02-15 09:30:00',
    appointmentType: 'consultation',
    status: 'scheduled',
    priority: 'normal',
    description: 'Annual checkup',
    notes: 'Patient reports feeling well',
    symptoms: 'None',
    roomNumber: '101',
    location: 'Main Building - Floor 1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 1,
    updatedBy: 1,
  };

  const mockCreateAppointmentDto: CreateAppointmentDto = {
    patientId: 1,
    healthProfessionalId: 2,
    appointmentDate: '2024-02-15 09:00:00',
    duration: 30,
    startTime: '2024-02-15 09:00:00',
    endTime: '2024-02-15 09:30:00',
    appointmentType: 'consultation',
    status: 'scheduled',
    priority: 'normal',
    description: 'Annual checkup',
    notes: 'Patient reports feeling well',
    symptoms: 'None',
    roomNumber: '101',
    location: 'Main Building - Floor 1',
  };

  const mockUpdateAppointmentDto: UpdateAppointmentDto = {
    status: 'confirmed',
    notes: 'Patient confirmed appointment',
    roomNumber: '102',
  };

  const mockUser = {
    id: 2,
    email: 'doctor@healthcare.com',
    role: 'health_professional',
    organizationId: 1,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            restore: jest.fn(),
            hardDelete: jest.fn(),
            findByPatient: jest.fn(),
            findByHealthProfessional: jest.fn(),
            findByDateRange: jest.fn(),
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

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new appointment', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockAppointment as any);

      const result = await controller.create(
        mockCreateAppointmentDto,
        mockUser,
        1,
      );

      expect(service.create).toHaveBeenCalledWith(
        mockCreateAppointmentDto,
        1,
        undefined,
      );
      expect(result).toEqual(mockAppointment);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(mockCreateAppointmentDto, mockUser, 1),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of appointments', async () => {
      const mockAppointments = [
        mockAppointment,
        { ...mockAppointment, id: 2, appointmentType: 'follow_up' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockAppointments);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockAppointments);
    });

    it('should return empty array when no appointments exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single appointment by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAppointment);

      const result = await controller.findOne('1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockAppointment);
    });

    it('should handle appointment not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined as any);

      const result = await controller.findOne('999', mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const updatedAppointment = {
        ...mockAppointment,
        ...mockUpdateAppointmentDto,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedAppointment);

      const result = await controller.update(
        '1',
        mockUpdateAppointmentDto,
        mockUser,
      );

      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdateAppointmentDto,
        1,
        2,
      );
      expect(result).toEqual(updatedAppointment);
    });

    it('should handle update errors', async () => {
      const error = new Error('Appointment not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update('999', mockUpdateAppointmentDto, mockUser),
      ).rejects.toThrow('Appointment not found');
    });
  });

  describe('remove', () => {
    it('should remove an appointment (soft delete)', async () => {
      const deleteMessage = { message: 'Appointment deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteMessage);

      const result = await controller.remove('1', mockUser);

      expect(service.remove).toHaveBeenCalledWith(1, 1, 2);
      expect(result).toEqual(deleteMessage);
    });

    it('should handle removal errors', async () => {
      const error = new Error('Appointment not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove('999', mockUser)).rejects.toThrow(
        'Appointment not found',
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted appointment', async () => {
      const restoreMessage = { message: 'Appointment restored successfully' };
      jest.spyOn(service, 'restore').mockResolvedValue(restoreMessage);

      const result = await controller.restore('1', mockUser);

      expect(service.restore).toHaveBeenCalledWith(1, 1, 2);
      expect(result).toEqual(restoreMessage);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete an appointment', async () => {
      const deleteMessage = { message: 'Appointment permanently deleted' };
      jest.spyOn(service, 'hardDelete').mockResolvedValue(deleteMessage);

      const result = await controller.hardDelete('1', mockUser);

      expect(service.hardDelete).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('findByPatient', () => {
    it('should return appointments for a specific patient', async () => {
      const mockAppointments = [mockAppointment];
      jest.spyOn(service, 'findByPatient').mockResolvedValue(mockAppointments);

      const result = await controller.findByPatient('1', mockUser);

      expect(service.findByPatient).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('findByHealthProfessional', () => {
    it('should return appointments for a specific health professional', async () => {
      const mockAppointments = [mockAppointment];
      jest
        .spyOn(service, 'findByHealthProfessional')
        .mockResolvedValue(mockAppointments);

      const result = await controller.findByHealthProfessional('2', mockUser);

      expect(service.findByHealthProfessional).toHaveBeenCalledWith(
        2,
        1,
        false,
      );
      expect(result).toEqual(mockAppointments);
    });
  });

  describe('findByDateRange', () => {
    it('should return appointments within a date range', async () => {
      const mockAppointments = [mockAppointment];
      const startDate = '2024-02-15';
      const endDate = '2024-02-16';
      jest
        .spyOn(service, 'findByDateRange')
        .mockResolvedValue(mockAppointments);

      const result = await controller.findByDateRange(
        startDate,
        endDate,
        mockUser,
      );

      expect(service.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
        1,
        false,
      );
      expect(result).toEqual(mockAppointments);
    });
  });
});
