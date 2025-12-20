import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsController } from '@modules/medical-records/medical-records.controller';
import { MedicalRecordsService } from '@modules/medical-records/medical-records.service';
import { DatabaseService } from '@database/database.service';
import { ClerkGuard, RolesGuard } from '@common/auth';
import { CreateMedicalRecordDto } from '@modules/medical-records/dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from '@modules/medical-records/dto/update-medical-record.dto';

describe('MedicalRecordsController', () => {
  let controller: MedicalRecordsController;
  let service: MedicalRecordsService;

  const mockMedicalRecord = {
    id: 1,
    organizationId: 1,
    patientId: 1,
    appointmentId: 1,
    recordType: 'consultation',
    title: 'Annual Physical Examination',
    description: 'Comprehensive annual physical examination',
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.8,
    weight: 75.5,
    height: 175.0,
    oxygenSaturation: 98,
    symptoms: 'None reported',
    diagnosis: 'Healthy individual',
    treatment: 'Continue healthy lifestyle',
    medications: 'None',
    dosage: 'N/A',
    instructions: 'Maintain regular exercise and balanced diet',
    labResults: 'All blood work within normal ranges',
    imagingResults: 'None required',
    followUpRequired: false,
    followUpDate: null,
    followUpNotes: 'Schedule next annual checkup in 12 months',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 1,
    updatedBy: 1,
  };

  const mockCreateMedicalRecordDto: CreateMedicalRecordDto = {
    patientId: 1,
    appointmentId: 1,
    recordType: 'consultation',
    title: 'Annual Physical Examination',
    description: 'Comprehensive annual physical examination',
    bloodPressure: '120/80',
    heartRate: 72,
    temperature: 36.8,
    weight: 75.5,
    height: 175.0,
    oxygenSaturation: 98,
    symptoms: 'None reported',
    diagnosis: 'Healthy individual',
    treatment: 'Continue healthy lifestyle',
    medications: 'None',
    dosage: 'N/A',
    instructions: 'Maintain regular exercise and balanced diet',
    labResults: 'All blood work within normal ranges',
    imagingResults: 'None required',
    followUpRequired: false,
    followUpDate: null,
    followUpNotes: 'Schedule next annual checkup in 12 months',
  };

  const mockUpdateMedicalRecordDto: UpdateMedicalRecordDto = {
    title: 'Updated Physical Examination',
    diagnosis: 'Updated diagnosis',
    treatment: 'Updated treatment plan',
  };

  const mockUser = {
    id: 2,
    email: 'doctor@healthcare.com',
    role: 'health_professional',
    organizationId: 1,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalRecordsController],
      providers: [
        {
          provide: MedicalRecordsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            restore: jest.fn(),
            hardDelete: jest.fn(),
            findByPatient: jest.fn(),
            findByAppointment: jest.fn(),
            findByRecordType: jest.fn(),
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

    controller = module.get<MedicalRecordsController>(MedicalRecordsController);
    service = module.get<MedicalRecordsService>(MedicalRecordsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new medical record', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockMedicalRecord);

      const result = await controller.create(
        mockCreateMedicalRecordDto,
        mockUser,
        1,
      );

      expect(service.create).toHaveBeenCalledWith(
        mockCreateMedicalRecordDto,
        1,
        undefined,
      );
      expect(result).toEqual(mockMedicalRecord);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      jest.spyOn(service, 'create').mockRejectedValue(error);

      await expect(
        controller.create(mockCreateMedicalRecordDto, mockUser, 1),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return an array of medical records', async () => {
      const mockMedicalRecords = [
        mockMedicalRecord,
        { ...mockMedicalRecord, id: 2, recordType: 'examination' },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockMedicalRecords);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockMedicalRecords);
    });

    it('should return empty array when no medical records exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single medical record by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockMedicalRecord);

      const result = await controller.findOne(1, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockMedicalRecord);
    });

    it('should handle medical record not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined as any);

      const result = await controller.findOne(999, mockUser);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a medical record', async () => {
      const updatedMedicalRecord = {
        ...mockMedicalRecord,
        ...mockUpdateMedicalRecordDto,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedMedicalRecord);

      const result = await controller.update(
        1,
        mockUpdateMedicalRecordDto,
        mockUser,
      );

      expect(service.update).toHaveBeenCalledWith(
        1,
        mockUpdateMedicalRecordDto,
        1,
        2,
      );
      expect(result).toEqual(updatedMedicalRecord);
    });

    it('should handle update errors', async () => {
      const error = new Error('Medical record not found');
      jest.spyOn(service, 'update').mockRejectedValue(error);

      await expect(
        controller.update(999, mockUpdateMedicalRecordDto, mockUser),
      ).rejects.toThrow('Medical record not found');
    });
  });

  describe('remove', () => {
    it('should remove a medical record (soft delete)', async () => {
      const deleteMessage = { message: 'Medical record deleted successfully' };
      jest.spyOn(service, 'remove').mockResolvedValue(deleteMessage);

      const result = await controller.remove(1, mockUser);

      expect(service.remove).toHaveBeenCalledWith(1, 1, 2);
      expect(result).toEqual(deleteMessage);
    });

    it('should handle removal errors', async () => {
      const error = new Error('Medical record not found');
      jest.spyOn(service, 'remove').mockRejectedValue(error);

      await expect(controller.remove(999, mockUser)).rejects.toThrow(
        'Medical record not found',
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted medical record', async () => {
      const restoreMessage = {
        message: 'Medical record restored successfully',
      };
      jest.spyOn(service, 'restore').mockResolvedValue(restoreMessage);

      const result = await controller.restore(1, mockUser);

      expect(service.restore).toHaveBeenCalledWith(1, 1, 2);
      expect(result).toEqual(restoreMessage);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a medical record', async () => {
      const deleteMessage = { message: 'Medical record permanently deleted' };
      jest.spyOn(service, 'hardDelete').mockResolvedValue(deleteMessage);

      const result = await controller.hardDelete(1, mockUser);

      expect(service.hardDelete).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(deleteMessage);
    });
  });

  describe('findByPatient', () => {
    it('should return medical records for a specific patient', async () => {
      const mockMedicalRecords = [mockMedicalRecord];
      jest
        .spyOn(service, 'findByPatient')
        .mockResolvedValue(mockMedicalRecords);

      const result = await controller.findByPatient(1, mockUser);

      expect(service.findByPatient).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockMedicalRecords);
    });
  });

  describe('findByAppointment', () => {
    it('should return medical records for a specific appointment', async () => {
      const mockMedicalRecords = [mockMedicalRecord];
      jest
        .spyOn(service, 'findByAppointment')
        .mockResolvedValue(mockMedicalRecords);

      const result = await controller.findByAppointment(1, mockUser);

      expect(service.findByAppointment).toHaveBeenCalledWith(1, 1, false);
      expect(result).toEqual(mockMedicalRecords);
    });
  });

  describe('findByRecordType', () => {
    it('should return medical records by type', async () => {
      const mockMedicalRecords = [mockMedicalRecord];
      const recordType = 'consultation';
      jest
        .spyOn(service, 'findByRecordType')
        .mockResolvedValue(mockMedicalRecords);

      const result = await controller.findByRecordType(recordType, mockUser);

      expect(service.findByRecordType).toHaveBeenCalledWith(
        recordType,
        1,
        false,
      );
      expect(result).toEqual(mockMedicalRecords);
    });
  });
});
