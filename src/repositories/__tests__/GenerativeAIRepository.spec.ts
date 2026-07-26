import 'reflect-metadata';
import { GenerativeAIRepository } from '../classes/GenerativeAIRepository';
import { DataSource, Repository } from 'typeorm';
import { GenerationJob } from '../../entities/GenerationJob';
import { Project } from '../../entities/Project';
import { User } from '../../entities/User';

jest.mock('typeorm', () => ({
    ...jest.requireActual('typeorm'),
    DataSource: jest.fn(),
    Repository: jest.fn()
}));

describe('GenerativeAIRepository', () => {
    let repository: GenerativeAIRepository;
    let mockDataSource: jest.Mocked<DataSource>;
    let mockGenerationJobRepository: jest.Mocked<Repository<GenerationJob>>;

    beforeEach(() => {
        mockGenerationJobRepository = Object.create(Repository.prototype);
        mockGenerationJobRepository.create = jest.fn();
        mockGenerationJobRepository.save = jest.fn();
        mockGenerationJobRepository.find = jest.fn();
        mockGenerationJobRepository.findOne = jest.fn();
        mockGenerationJobRepository.findOneBy = jest.fn();
        mockGenerationJobRepository.delete = jest.fn();
        mockGenerationJobRepository.update = jest.fn();
        mockGenerationJobRepository.remove = jest.fn();
        mockGenerationJobRepository.count = jest.fn();
        mockGenerationJobRepository.createQueryBuilder = jest.fn();

        mockDataSource = Object.create(DataSource.prototype);
        mockDataSource.getRepository = jest.fn().mockReturnValue(mockGenerationJobRepository);

        repository = new GenerativeAIRepository(mockDataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GenerateAsset method', () => {
        const validPrompt = 'Crear una imagen de un gato';

        const createMockUser = (): User => ({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hash',
            role: 'creator',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const createMockProject = (overrides: Partial<Project> = {}): Project => ({
            id: 123,
            owner: createMockUser(),
            name: 'Proyecto Test',
            description: 'Descripción del proyecto',
            state: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        const createMockGenerationJob = (project: Project, overrides: Partial<GenerationJob> = {}): GenerationJob => ({
            id: 456,
            project: project,
            prompt: validPrompt,
            status: 'pending',
            resultUrl: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        describe('Success cases', () => {
            it('should create and save generation job successfully', async () => {
                const mockProject = createMockProject();
                const mockGenerationJob = createMockGenerationJob(mockProject);
                const savedGenerationJob = createMockGenerationJob(mockProject, { id: 789 });

                mockGenerationJobRepository.create.mockReturnValue(mockGenerationJob);
                mockGenerationJobRepository.save.mockResolvedValue(savedGenerationJob);

                const result = await repository.GenerateAsset(mockProject, validPrompt);

                expect(result).toBe(savedGenerationJob);
                expect(mockDataSource.getRepository).toHaveBeenCalledWith(GenerationJob);
                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: mockProject,
                    prompt: validPrompt,
                });
                expect(mockGenerationJobRepository.save).toHaveBeenCalledWith(mockGenerationJob);
                expect(mockGenerationJobRepository.create).toHaveBeenCalledTimes(1);
                expect(mockGenerationJobRepository.save).toHaveBeenCalledTimes(1);
            });

            it('should handle different project states correctly', async () => {
                const inactiveProject = createMockProject({ state: 'inactive' });
                const mockGenerationJob = createMockGenerationJob(inactiveProject);
                const savedGenerationJob = createMockGenerationJob(inactiveProject, { id: 999 });

                mockGenerationJobRepository.create.mockReturnValue(mockGenerationJob);
                mockGenerationJobRepository.save.mockResolvedValue(savedGenerationJob);

                const result = await repository.GenerateAsset(inactiveProject, validPrompt);

                expect(result).toBe(savedGenerationJob);
                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: inactiveProject,
                    prompt: validPrompt,
                });
            });

            it('should handle different prompt lengths correctly', async () => {
                const longPrompt = 'Este es un prompt muy largo que describe detalladamente lo que queremos generar con la IA generativa para asegurar que funciona correctamente';
                const mockProject = createMockProject();
                const mockGenerationJob = createMockGenerationJob(mockProject, { prompt: longPrompt });
                const savedGenerationJob = createMockGenerationJob(mockProject, { prompt: longPrompt, id: 555 });

                mockGenerationJobRepository.create.mockReturnValue(mockGenerationJob);
                mockGenerationJobRepository.save.mockResolvedValue(savedGenerationJob);

                const result = await repository.GenerateAsset(mockProject, longPrompt);

                expect(result).toBe(savedGenerationJob);
                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: mockProject,
                    prompt: longPrompt,
                });
            });
        });

        describe('Error cases', () => {
            it('should propagate error when repository create fails', async () => {
                const mockProject = createMockProject();
                const createError = new Error('Error al crear el generation job');

                mockGenerationJobRepository.create.mockImplementation(() => {
                    throw createError;
                });

                await expect(
                    repository.GenerateAsset(mockProject, validPrompt)
                ).rejects.toThrow('Error al crear el generation job');

                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: mockProject,
                    prompt: validPrompt,
                });
                expect(mockGenerationJobRepository.save).not.toHaveBeenCalled();
            });

            it('should propagate error when repository save fails', async () => {
                const mockProject = createMockProject();
                const mockGenerationJob = createMockGenerationJob(mockProject);
                const saveError = new Error('Error de conexión a base de datos');

                mockGenerationJobRepository.create.mockReturnValue(mockGenerationJob);
                mockGenerationJobRepository.save.mockRejectedValue(saveError);

                await expect(
                    repository.GenerateAsset(mockProject, validPrompt)
                ).rejects.toThrow('Error de conexión a base de datos');

                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: mockProject,
                    prompt: validPrompt,
                });
                expect(mockGenerationJobRepository.save).toHaveBeenCalledWith(mockGenerationJob);
            });

            it('should propagate error when database connection fails', async () => {
                const mockProject = createMockProject();
                const connectionError = new Error('Connection timeout');

                mockGenerationJobRepository.save.mockRejectedValue(connectionError);
                mockGenerationJobRepository.create.mockReturnValue(createMockGenerationJob(mockProject));

                await expect(
                    repository.GenerateAsset(mockProject, validPrompt)
                ).rejects.toThrow('Connection timeout');

                expect(mockGenerationJobRepository.create).toHaveBeenCalled();
                expect(mockGenerationJobRepository.save).toHaveBeenCalled();
            });
        });

        describe('Parameter verification', () => {
            it('should pass correct parameters to repository create method', async () => {
                const customProject = createMockProject({ id: 999, name: 'Proyecto Personalizado' });
                const customPrompt = 'Generar logo corporativo moderno';
                const mockGenerationJob = createMockGenerationJob(customProject, { prompt: customPrompt });
                const savedGenerationJob = createMockGenerationJob(customProject, { prompt: customPrompt, id: 1111 });

                mockGenerationJobRepository.create.mockReturnValue(mockGenerationJob);
                mockGenerationJobRepository.save.mockResolvedValue(savedGenerationJob);

                await repository.GenerateAsset(customProject, customPrompt);

                expect(mockGenerationJobRepository.create).toHaveBeenCalledWith({
                    project: customProject,
                    prompt: customPrompt,
                });
                expect(mockGenerationJobRepository.save).toHaveBeenCalledWith(mockGenerationJob);
            });
        });
    });

    describe('GetGenerationJobById method', () => {
        const createMockUser = (): User => ({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hash',
            role: 'creator',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const createMockProject = (overrides: Partial<Project> = {}): Project => ({
            id: 123,
            owner: createMockUser(),
            name: 'Test Project',
            description: 'Test project description',
            state: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        const createMockGenerationJob = (overrides: Partial<GenerationJob> = {}): GenerationJob => ({
            id: 456,
            project: createMockProject(),
            prompt: 'Test prompt',
            status: 'done',
            resultUrl: 'https://example.com/result.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        describe('Success cases', () => {
            it('should return generation job when found by valid id', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123 });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);

                const result = await repository.GetGenerationJobById(123);

                expect(result).toBe(mockGenerationJob);
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
            });

            it('should return generation job with all properties intact', async () => {
                const mockGenerationJob = createMockGenerationJob({
                    id: 999,
                    prompt: 'Complex generation prompt',
                    status: 'pending',
                    resultUrl: undefined
                });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);

                const result = await repository.GetGenerationJobById(999);

                expect(result).toBe(mockGenerationJob);
                expect(result?.id).toBe(999);
                expect(result?.prompt).toBe('Complex generation prompt');
                expect(result?.status).toBe('pending');
                expect(result?.resultUrl).toBeUndefined();
            });

            it('should handle large id numbers correctly', async () => {
                const largeId = 2147483647;
                const mockGenerationJob = createMockGenerationJob({ id: largeId });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);

                const result = await repository.GetGenerationJobById(largeId);

                expect(result).toBe(mockGenerationJob);
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: largeId });
            });
        });

        describe('Not found cases', () => {
            it('should return null when generation job does not exist', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                const result = await repository.GetGenerationJobById(999);

                expect(result).toBeNull();
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
            });

            it('should return null for non existent id and call repository correctly', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                const result = await repository.GetGenerationJobById(12345);

                expect(result).toBeNull();
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 12345 });
            });
        });

        describe('Edge cases', () => {
            it('should handle zero id correctly', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                const result = await repository.GetGenerationJobById(0);

                expect(result).toBeNull();
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 0 });
            });

            it('should handle negative id correctly', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                const result = await repository.GetGenerationJobById(-1);

                expect(result).toBeNull();
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: -1 });
            });

            it('should handle very small positive id correctly', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 1 });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);

                const result = await repository.GetGenerationJobById(1);

                expect(result).toBe(mockGenerationJob);
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
            });
        });

        describe('Error cases', () => {
            it('should propagate database connection errors', async () => {
                const connectionError = new Error('Database connection failed');
                mockGenerationJobRepository.findOneBy.mockRejectedValue(connectionError);

                await expect(repository.GetGenerationJobById(123)).rejects.toThrow('Database connection failed');
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
            });

            it('should propagate query execution errors', async () => {
                const queryError = new Error('Invalid query syntax');
                mockGenerationJobRepository.findOneBy.mockRejectedValue(queryError);

                await expect(repository.GetGenerationJobById(456)).rejects.toThrow('Invalid query syntax');
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 456 });
            });

            it('should propagate timeout errors', async () => {
                const timeoutError = new Error('Query timeout exceeded');
                mockGenerationJobRepository.findOneBy.mockRejectedValue(timeoutError);

                await expect(repository.GetGenerationJobById(789)).rejects.toThrow('Query timeout exceeded');
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 789 });
            });
        });

        describe('Repository interaction verification', () => {
            it('should call findOneBy with correct parameters structure', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await repository.GetGenerationJobById(555);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 555 });
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
            });

            it('should not call any other repository methods', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await repository.GetGenerationJobById(777);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
                expect(mockGenerationJobRepository.find).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.findOne).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.create).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.save).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.delete).not.toHaveBeenCalled();
            });

            it('should use the correct repository instance', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await repository.GetGenerationJobById(888);

                expect(mockDataSource.getRepository).toHaveBeenCalledWith(GenerationJob);
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 888 });
            });
        });
    });

    describe('CancelGeneration method', () => {
        const createMockUser = (): User => ({
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hash',
            role: 'creator',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const createMockProject = (overrides: Partial<Project> = {}): Project => ({
            id: 123,
            owner: createMockUser(),
            name: 'Test Project',
            description: 'Test project description',
            state: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        const createMockGenerationJob = (overrides: Partial<GenerationJob> = {}): GenerationJob => ({
            id: 456,
            project: createMockProject(),
            prompt: 'Test prompt',
            status: 'pending',
            resultUrl: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        });

        describe('Success cases', () => {
            it('should cancel pending generation job successfully', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(123);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: 123 }, { status: 'canceled' });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledTimes(1);
            });

            it('should handle different pending job ids correctly', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 999, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(999);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: 999 }, { status: 'canceled' });
            });

            it('should handle large job id numbers correctly', async () => {
                const largeId = 2147483647;
                const mockGenerationJob = createMockGenerationJob({ id: largeId, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(largeId);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: largeId });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: largeId }, { status: 'canceled' });
            });
        });

        describe('Job not found cases', () => {
            it('should throw error when generation job does not exist', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await expect(repository.CancelGeneration(999)).rejects.toThrow(
                    'Trabajo de generación con ID 999 no encontrado'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });

            it('should throw error with correct message for non-existent job', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await expect(repository.CancelGeneration(12345)).rejects.toThrow(
                    'Trabajo de generación con ID 12345 no encontrado'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 12345 });
            });
        });

        describe('Invalid status cases', () => {
            it('should throw error when trying to cancel running job', async () => {
                const runningJob = createMockGenerationJob({ id: 123, status: 'running' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(runningJob);

                await expect(repository.CancelGeneration(123)).rejects.toThrow(
                    'No se puede cancelar el trabajo. Estado actual: running'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });

            it('should throw error when trying to cancel done job', async () => {
                const doneJob = createMockGenerationJob({ id: 456, status: 'done' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(doneJob);

                await expect(repository.CancelGeneration(456)).rejects.toThrow(
                    'No se puede cancelar el trabajo. Estado actual: done'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 456 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });

            it('should throw error when trying to cancel error job', async () => {
                const errorJob = createMockGenerationJob({ id: 789, status: 'error' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(errorJob);

                await expect(repository.CancelGeneration(789)).rejects.toThrow(
                    'No se puede cancelar el trabajo. Estado actual: error'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 789 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });

            it('should throw error when trying to cancel already canceled job', async () => {
                const canceledJob = createMockGenerationJob({ id: 111, status: 'canceled' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(canceledJob);

                await expect(repository.CancelGeneration(111)).rejects.toThrow(
                    'No se puede cancelar el trabajo. Estado actual: canceled'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 111 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });
        });

        describe('Database error cases', () => {
            it('should propagate error when findOneBy fails', async () => {
                const findError = new Error('Database connection failed');
                mockGenerationJobRepository.findOneBy.mockRejectedValue(findError);

                await expect(repository.CancelGeneration(123)).rejects.toThrow('Database connection failed');

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.update).not.toHaveBeenCalled();
            });

            it('should propagate error when update fails', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123, status: 'pending' });
                const updateError = new Error('Update operation failed');
                
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockRejectedValue(updateError);

                await expect(repository.CancelGeneration(123)).rejects.toThrow('Update operation failed');

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: 123 }, { status: 'canceled' });
            });

            it('should propagate connection timeout errors', async () => {
                const timeoutError = new Error('Query timeout exceeded');
                mockGenerationJobRepository.findOneBy.mockRejectedValue(timeoutError);

                await expect(repository.CancelGeneration(456)).rejects.toThrow('Query timeout exceeded');

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 456 });
            });
        });

        describe('Edge cases', () => {
            it('should handle zero id correctly', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await expect(repository.CancelGeneration(0)).rejects.toThrow(
                    'Trabajo de generación con ID 0 no encontrado'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 0 });
            });

            it('should handle negative id correctly', async () => {
                mockGenerationJobRepository.findOneBy.mockResolvedValue(null);

                await expect(repository.CancelGeneration(-1)).rejects.toThrow(
                    'Trabajo de generación con ID -1 no encontrado'
                );

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: -1 });
            });

            it('should handle minimum positive id correctly', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 1, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(1);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: 1 }, { status: 'canceled' });
            });
        });

        describe('Repository interaction verification', () => {
            it('should call repository methods in correct order', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(123);

                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledWith({ id: 123 });
                expect(mockGenerationJobRepository.update).toHaveBeenCalledWith({ id: 123 }, { status: 'canceled' });
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
                expect(mockGenerationJobRepository.update).toHaveBeenCalledTimes(1);
            });

            it('should not call other repository methods', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(123);

                expect(mockGenerationJobRepository.find).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.findOne).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.create).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.save).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.delete).not.toHaveBeenCalled();
                expect(mockGenerationJobRepository.remove).not.toHaveBeenCalled();
            });

            it('should use correct repository instance', async () => {
                const mockGenerationJob = createMockGenerationJob({ id: 123, status: 'pending' });
                mockGenerationJobRepository.findOneBy.mockResolvedValue(mockGenerationJob);
                mockGenerationJobRepository.update.mockResolvedValue({ affected: 1, generatedMaps: [], raw: {} });

                await repository.CancelGeneration(123);

                expect(mockDataSource.getRepository).toHaveBeenCalledWith(GenerationJob);
                expect(mockGenerationJobRepository.findOneBy).toHaveBeenCalledTimes(1);
                expect(mockGenerationJobRepository.update).toHaveBeenCalledTimes(1);
            });
        });
    });
});
