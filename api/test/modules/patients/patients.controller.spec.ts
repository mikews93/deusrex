import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from '@modules/patients/patients.controller';
import { PatientsService } from '@modules/patients/patients.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard, RolesGuard } from '@common/auth';
import { CreatePatientDto } from '@modules/patients/dto/create-patient.dto';
import { UpdatePatientDto } from '@modules/patients/dto/update-patient.dto';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: PatientsService;

  const mockPatient = {
    id: 1,
    organizationId: 1,
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    sex: 'male',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
    emergencyContactName: 'Mary Smith',
    emergencyContactPhone: '+1-555-0102',
    emergencyContactRelationship: 'Spouse',
    bloodType: 'A+',
    allergies: 'Penicillin, Peanuts',
    currentMedications: 'Lisinopril 10mg daily',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceNumber: 'BCBS123456789',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 1,
    updatedBy: 1,
  };

  const mockCreatePatientDto: CreatePatientDto = {
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    sex: 'male',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    address: '123 Oak Street',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    country: 'USA',
    emergencyContactName: 'Mary Smith',
    emergencyContactPhone: '+1-555-0102',
    emergencyContactRelationship: 'Spouse',
    bloodType: 'A+',
    allergies: 'Penicillin, Peanuts',
    currentMedications: 'Lisinopril 10mg daily',
    medicalHistory: 'Hypertension, Type 2 Diabetes',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceNumber: 'BCBS123456789',
  };

  const mockUpdatePatientDto: UpdatePatientDto = {
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0103',
  };

  const mockUser = {
    id: 1,
    email: 'doctor@healthcare.com',
    role: 'health_professional',
    organizationId: 1,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        {
          provide: PatientsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            restore: jest.fn(),
            hardDelete: jest.fn(),
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

    controller = module.get<PatientsController>(PatientsController);
    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockPatient);

      const result = await controller.create(mockCreatePatientDto, mockUser, 1);

      expect(service.create).toHaveBeenCalledWith(
        mockCreatePatientDto,
        1,
        undefined,
      );
      expect(result).toEqual(mockPatient);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(mockCreatePatientDto, mockUser, 1),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of patients', async () => {
      const mockPatients = [
        mockPatient,
        { ...mockPatient, id: 2, firstName: 'Jane', lastName: 'Doe' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockPatients);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockPatients);
    });

    it('should return empty array when no patients exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single patient by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockPatient);

      const result = await controller.findOne(1, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockPatient);
    });

    it('should handle patient not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined as any);

      const result = await controller.findOne(999, mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a patient', async () => {
      const updatedPatient = { ...mockPatient, ...mockUpdatePatientDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedPatient);

      const result = await controller.update(1, mockUpdatePatientDto, mockUser);

      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdatePatientDto,
        1,
        1,
      );
      expect(result).toEqual(updatedPatient);
    });

    it('should handle update errors', async () => {
      const error = new Error('Patient not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update(999, mockUpdatePatientDto, mockUser),
      ).rejects.toThrow('Patient not found');
    });
  });

  describe('remove', () => {
    it('should remove a patient (soft delete)', async () => {
      const deleteMessage = { message: 'Patient deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteMessage);

      const result = await controller.remove(1, mockUser);

      expect(service.remove).toHaveBeenCalledWith(1, 1, 1);
      expect(result).toEqual(deleteMessage);
    });

    it('should handle removal errors', async () => {
      const error = new Error('Patient not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove(999, mockUser)).rejects.toThrow(
        'Patient not found',
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted patient', async () => {
      const restoreMessage = { message: 'Patient restored successfully' };
      jest.spyOn(service, 'restore').mockResolvedValue(restoreMessage);

      const result = await controller.restore(1, mockUser);

      expect(service.restore).toHaveBeenCalledWith(1, 1, 1);
      expect(result).toEqual(restoreMessage);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a patient', async () => {
      const deleteMessage = { message: 'Patient permanently deleted' };
      jest.spyOn(service, 'hardDelete').mockResolvedValue(deleteMessage);

      const result = await controller.hardDelete(1, mockUser);

      expect(service.hardDelete).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(deleteMessage);
    });
  });
});
