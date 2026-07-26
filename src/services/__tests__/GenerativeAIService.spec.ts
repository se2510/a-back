import { GenerativeAIService } from '../classes/GenerativeAIService';
import { IGenerativeAIRepository } from '../../repositories/interfaces/IGenerativeAIRepository';
import { IProjectRepository } from '../../repositories/interfaces/IProjectRepository';
import { IAssetRepository } from '../../repositories/interfaces/IAssetRepository';
import { IBlobStorageService } from '../interfaces/IBlobStorageService';
import { Project } from '../../entities/Project';
import { User } from '../../entities/User';
import { Asset } from '../../entities/Asset';
import { GenerationJob } from '../../entities/GenerationJob';

jest.mock('../../config/env', () => ({
    AZURE_STORAGE_CONTAINER_NAME: 'test-container'
}));

describe('GenerativeAIService', () => {
    let service: GenerativeAIService;
    let mockGenerativeAIRepository: jest.Mocked<IGenerativeAIRepository>;
    let mockProjectRepository: jest.Mocked<IProjectRepository>;
    let mockAssetRepository: jest.Mocked<IAssetRepository>;
    let mockBlobStorageService: jest.Mocked<IBlobStorageService>;

    const createMockUser = (overrides: Partial<User> = {}): User => ({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        role: 'creator',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        ...overrides
    });

    const createMockProject = (overrides: Partial<Project> = {}): Project => ({
        id: 123,
        owner: createMockUser(),
        name: 'Test Project',
        description: 'Test project description',
        state: 'active',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        ...overrides
    });

    const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
        id: 789,
        project: createMockProject(),
        type: 'image',
        filePath: '/path/to/reference-image.jpg',
        metadata: {},
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        ...overrides
    });

    const createMockGenerationJob = (overrides: Partial<GenerationJob> = {}): GenerationJob => ({
        id: 456,
        project: createMockProject(),
        prompt: 'Test prompt',
        status: 'pending',
        resultUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        ...overrides
    });

    beforeEach(() => {
        mockGenerativeAIRepository = {
            GenerateAsset: jest.fn(),
            GetStatus: jest.fn(),
            CancelGeneration: jest.fn(),
            GetLog: jest.fn(),
            GetGenerationJobById: jest.fn()
        };

        mockProjectRepository = {
            CreateProject: jest.fn(),
            GetProjects: jest.fn(),
            GetProjectById: jest.fn(),
            UpdateProject: jest.fn(),
            DeleteProject: jest.fn()
        };

        mockAssetRepository = {
            UploadAsset: jest.fn(),
            GetAssets: jest.fn(),
            DownloadAsset: jest.fn(),
            UpdateAsset: jest.fn(),
            DeleteAsset: jest.fn(),
            GetAssetById: jest.fn()
        };

        mockBlobStorageService = {
            uploadFile: jest.fn(),
            getFileUrl: jest.fn(),
            downloadFile: jest.fn(),
            deleteFile: jest.fn(),
            fileExists: jest.fn()
        };

        service = new GenerativeAIService(
            mockGenerativeAIRepository,
            mockProjectRepository,
            mockAssetRepository,
            mockBlobStorageService
        );

        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('GenerateAsset', () => {
        const validPrompt = 'Generate a beautiful landscape';
        const validModel = 'azure-video-gen-v1';
        const validAssetType = 'video';
        const validProjectId = 123;
        const mockProject = createMockProject({ id: 123, state: 'active', name: 'Test Project' });
        const mockGenerationJob = createMockGenerationJob({ id: 456 });

        describe('positive cases', () => {
            it('should generate asset successfully without reference image', async () => {
                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);

                const result = await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId
                );

                expect(result).toBe(456);
                expect(mockProjectRepository.GetProjectById).toHaveBeenCalledWith(validProjectId);
                expect(mockGenerativeAIRepository.GenerateAsset).toHaveBeenCalledWith(
                    mockProject,
                    validPrompt
                );
                expect(mockAssetRepository.GetAssetById).not.toHaveBeenCalled();
                expect(mockBlobStorageService.fileExists).not.toHaveBeenCalled();
            });

            it('should generate asset successfully with valid reference image', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: '/path/to/reference-image.jpg' 
                });
                const mockImageBuffer = Buffer.from('mock-image-data');
                const mockImageUrl = 'https://blob.storage/reference-image.jpg';

                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue(mockImageUrl);
                mockBlobStorageService.downloadFile.mockResolvedValue(mockImageBuffer);

                const result = await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId,
                    referenceImageId
                );

                expect(result).toBe(456);
                expect(mockProjectRepository.GetProjectById).toHaveBeenCalledWith(validProjectId);
                expect(mockAssetRepository.GetAssetById).toHaveBeenCalledWith(referenceImageId);
                expect(mockBlobStorageService.fileExists).toHaveBeenCalledWith(
                    'test-container',
                    'reference-image.jpg'
                );
                expect(mockBlobStorageService.getFileUrl).toHaveBeenCalledWith(
                    'test-container',
                    'reference-image.jpg'
                );
                expect(mockBlobStorageService.downloadFile).toHaveBeenCalledWith(
                    'test-container',
                    'reference-image.jpg'
                );
                expect(mockGenerativeAIRepository.GenerateAsset).toHaveBeenCalledWith(
                    mockProject,
                    validPrompt
                );
            });

            it('should handle file paths with Windows separators correctly', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: 'C:\\Users\\test\\images\\reference-image.jpg' 
                });
                const mockImageBuffer = Buffer.from('mock-image-data');

                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/reference-image.jpg');
                mockBlobStorageService.downloadFile.mockResolvedValue(mockImageBuffer);

                const result = await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId,
                    referenceImageId
                );

                expect(result).toBe(456);
                expect(mockBlobStorageService.fileExists).toHaveBeenCalledWith(
                    'test-container',
                    'reference-image.jpg'
                );
            });
        });

        describe('negative cases - project validation', () => {
            it('should throw error when project is not found', async () => {
                mockProjectRepository.GetProjectById.mockResolvedValue(null);

                await expect(
                    service.GenerateAsset(validPrompt, validModel, validAssetType, validProjectId)
                ).rejects.toThrow(`Proyecto con ID ${validProjectId} no encontrado`);

                expect(mockProjectRepository.GetProjectById).toHaveBeenCalledWith(validProjectId);
                expect(mockGenerativeAIRepository.GenerateAsset).not.toHaveBeenCalled();
            });

            it('should throw error when project is not active', async () => {
                const inactiveProject = createMockProject({ ...mockProject, state: 'inactive' });
                mockProjectRepository.GetProjectById.mockResolvedValue(inactiveProject);

                await expect(
                    service.GenerateAsset(validPrompt, validModel, validAssetType, validProjectId)
                ).rejects.toThrow(`El proyecto con ID ${validProjectId} no está activo`);

                expect(mockProjectRepository.GetProjectById).toHaveBeenCalledWith(validProjectId);
                expect(mockGenerativeAIRepository.GenerateAsset).not.toHaveBeenCalled();
            });
        });

        describe('negative cases - reference image validation', () => {
            beforeEach(() => {
                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);
            });

            it('should throw error when reference image is not found', async () => {
                const referenceImageId = 999;
                mockAssetRepository.GetAssetById.mockResolvedValue(null);

                await expect(
                    service.GenerateAsset(
                        validPrompt,
                        validModel,
                        validAssetType,
                        validProjectId,
                        referenceImageId
                    )
                ).rejects.toThrow(`Imagen de referencia con ID ${referenceImageId} no encontrada`);

                expect(mockAssetRepository.GetAssetById).toHaveBeenCalledWith(referenceImageId);
                expect(mockBlobStorageService.fileExists).not.toHaveBeenCalled();
            });

            it('should throw error when reference image file does not exist in blob storage', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: '/path/to/nonexistent-image.jpg' 
                });
                
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(false);

                await expect(
                    service.GenerateAsset(
                        validPrompt,
                        validModel,
                        validAssetType,
                        validProjectId,
                        referenceImageId
                    )
                ).rejects.toThrow('Imagen de referencia nonexistent-image.jpg no encontrada en Azure Blob Storage');

                expect(mockBlobStorageService.fileExists).toHaveBeenCalledWith(
                    'test-container',
                    'nonexistent-image.jpg'
                );
                expect(mockBlobStorageService.downloadFile).not.toHaveBeenCalled();
            });

            it('should throw error when blob storage download fails', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: '/path/to/reference-image.jpg' 
                });
                const downloadError = new Error('Network connection failed');
                
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/reference-image.jpg');
                mockBlobStorageService.downloadFile.mockRejectedValue(downloadError);

                await expect(
                    service.GenerateAsset(
                        validPrompt,
                        validModel,
                        validAssetType,
                        validProjectId,
                        referenceImageId
                    )
                ).rejects.toThrow('Error al obtener asset de referencia desde Azure Blob Storage: Network connection failed');

                expect(mockBlobStorageService.downloadFile).toHaveBeenCalledWith(
                    'test-container',
                    'reference-image.jpg'
                );
            });

            it('should handle unknown errors during blob storage operations', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: '/path/to/reference-image.jpg' 
                });
                
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/reference-image.jpg');
                mockBlobStorageService.downloadFile.mockRejectedValue('String error instead of Error object');

                await expect(
                    service.GenerateAsset(
                        validPrompt,
                        validModel,
                        validAssetType,
                        validProjectId,
                        referenceImageId
                    )
                ).rejects.toThrow('Error al obtener asset de referencia desde Azure Blob Storage: Error desconocido');
            });
        });

        describe('edge cases', () => {
            beforeEach(() => {
                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);
            });

            it('should handle reference image ID of 0', async () => {
                const referenceImageId = 0;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: '/path/to/image.jpg' 
                });
                
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/image.jpg');
                mockBlobStorageService.downloadFile.mockResolvedValue(Buffer.from('image-data'));

                const result = await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId,
                    referenceImageId
                );

                expect(result).toBe(456);
                expect(mockAssetRepository.GetAssetById).toHaveBeenCalledWith(0);
            });

            it('should handle file path with only filename (no directory)', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ 
                    id: referenceImageId, 
                    filePath: 'simple-image.jpg' 
                });
                
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/simple-image.jpg');
                mockBlobStorageService.downloadFile.mockResolvedValue(Buffer.from('image-data'));

                const result = await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId,
                    referenceImageId
                );

                expect(result).toBe(456);
                expect(mockBlobStorageService.fileExists).toHaveBeenCalledWith(
                    'test-container',
                    'simple-image.jpg'
                );
            });
        });

        describe('repository interaction verification', () => {
            it('should call repositories in correct order without reference image', async () => {
                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);

                await service.GenerateAsset(validPrompt, validModel, validAssetType, validProjectId);

                const projectCall = mockProjectRepository.GetProjectById.mock.invocationCallOrder[0];
                const generateCall = mockGenerativeAIRepository.GenerateAsset.mock.invocationCallOrder[0];
                
                expect(projectCall).toBeLessThan(generateCall);
            });

            it('should call repositories in correct order with reference image', async () => {
                const referenceImageId = 789;
                const mockReferenceImage = createMockAsset({ id: referenceImageId, filePath: '/path/to/image.jpg' });
                
                mockProjectRepository.GetProjectById.mockResolvedValue(mockProject);
                mockGenerativeAIRepository.GenerateAsset.mockResolvedValue(mockGenerationJob);
                mockAssetRepository.GetAssetById.mockResolvedValue(mockReferenceImage);
                mockBlobStorageService.fileExists.mockResolvedValue(true);
                mockBlobStorageService.getFileUrl.mockResolvedValue('https://blob.storage/image.jpg');
                mockBlobStorageService.downloadFile.mockResolvedValue(Buffer.from('image-data'));

                await service.GenerateAsset(
                    validPrompt,
                    validModel,
                    validAssetType,
                    validProjectId,
                    referenceImageId
                );

                const projectCall = mockProjectRepository.GetProjectById.mock.invocationCallOrder[0];
                const generateCall = mockGenerativeAIRepository.GenerateAsset.mock.invocationCallOrder[0];
                const assetCall = mockAssetRepository.GetAssetById.mock.invocationCallOrder[0];
                
                expect(projectCall).toBeLessThan(generateCall);
                expect(generateCall).toBeLessThan(assetCall);
            });
        });
    });

    describe('GetStatus', () => {
        describe('positive cases', () => {
            it('should return status when generation job exists', async () => {
                const jobId = 456;
                const expectedStatus = 'done';
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: expectedStatus 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe(expectedStatus);
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledTimes(1);
            });

            it('should return pending status for new generation job', async () => {
                const jobId = 123;
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: 'pending' 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe('pending');
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });

            it('should return running status for running generation job', async () => {
                const jobId = 789;
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: 'running' 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe('running');
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });

            it('should return error status for failed generation job', async () => {
                const jobId = 999;
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: 'error' 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe('error');
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });
        });

        describe('negative cases', () => {
            it('should throw error when generation job does not exist', async () => {
                const jobId = 999;
                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(null);

                await expect(service.GetStatus(jobId)).rejects.toThrow(
                    `Generación con ID ${jobId} no encontrada`
                );

                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledTimes(1);
            });

            it('should throw error when generation job is undefined', async () => {
                const jobId = 888;
                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(null);

                await expect(service.GetStatus(jobId)).rejects.toThrow(
                    `Generación con ID ${jobId} no encontrada`
                );

                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });

            it('should throw error when repository throws an error', async () => {
                const jobId = 777;
                const repositoryError = new Error('Database connection failed');
                mockGenerativeAIRepository.GetGenerationJobById.mockRejectedValue(repositoryError);

                await expect(service.GetStatus(jobId)).rejects.toThrow('Database connection failed');

                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });
        });

        describe('edge cases', () => {
            it('should handle job ID of 0', async () => {
                const jobId = 0;
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: 'done' 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe('done');
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(0);
            });

            it('should handle very large job ID', async () => {
                const jobId = Number.MAX_SAFE_INTEGER;
                const mockGenerationJob = createMockGenerationJob({ 
                    id: jobId, 
                    status: 'pending' 
                });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                const result = await service.GetStatus(jobId);

                expect(result).toBe('pending');
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(jobId);
            });

            it('should handle negative job ID', async () => {
                const jobId = -1;
                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(null);

                await expect(service.GetStatus(jobId)).rejects.toThrow(
                    `Generación con ID ${jobId} no encontrada`
                );

                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledWith(-1);
            });
        });

        describe('repository interaction verification', () => {
            it('should call repository method exactly once per invocation', async () => {
                const jobId = 456;
                const mockGenerationJob = createMockGenerationJob({ id: jobId, status: 'done' });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                await service.GetStatus(jobId);
                await service.GetStatus(jobId);

                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenCalledTimes(2);
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenNthCalledWith(1, jobId);
                expect(mockGenerativeAIRepository.GetGenerationJobById).toHaveBeenNthCalledWith(2, jobId);
            });

            it('should not call any other repository methods', async () => {
                const jobId = 456;
                const mockGenerationJob = createMockGenerationJob({ id: jobId, status: 'done' });

                mockGenerativeAIRepository.GetGenerationJobById.mockResolvedValue(mockGenerationJob);

                await service.GetStatus(jobId);

                expect(mockProjectRepository.GetProjectById).not.toHaveBeenCalled();
                expect(mockAssetRepository.GetAssetById).not.toHaveBeenCalled();
                expect(mockGenerativeAIRepository.GenerateAsset).not.toHaveBeenCalled();
                expect(mockBlobStorageService.uploadFile).not.toHaveBeenCalled();
                expect(mockBlobStorageService.downloadFile).not.toHaveBeenCalled();
            });
        });
    });

    describe('CancelGeneration', () => {
        describe('success cases', () => {
            it('should cancel generation job successfully', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(123);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(123);
                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledTimes(1);
            });

            it('should handle different job ids correctly', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(999);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(999);
            });

            it('should handle large job id numbers correctly', async () => {
                const largeId = 2147483647;
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(largeId);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(largeId);
            });

            it('should handle minimum positive job id correctly', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(1);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(1);
            });
        });

        describe('error cases', () => {
            it('should propagate repository error for non-existent job', async () => {
                const repositoryError = new Error('Trabajo de generación con ID 999 no encontrado');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(repositoryError);

                await expect(service.CancelGeneration(999)).rejects.toThrow(
                    'Trabajo de generación con ID 999 no encontrado'
                );

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(999);
            });

            it('should propagate repository error for invalid status', async () => {
                const statusError = new Error('No se puede cancelar el trabajo. Estado actual: running');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(statusError);

                await expect(service.CancelGeneration(123)).rejects.toThrow(
                    'No se puede cancelar el trabajo. Estado actual: running'
                );

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(123);
            });

            it('should propagate database connection errors', async () => {
                const connectionError = new Error('Database connection failed');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(connectionError);

                await expect(service.CancelGeneration(456)).rejects.toThrow('Database connection failed');

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(456);
            });

            it('should propagate update operation errors', async () => {
                const updateError = new Error('Update operation failed');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(updateError);

                await expect(service.CancelGeneration(789)).rejects.toThrow('Update operation failed');

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(789);
            });
        });

        describe('edge cases', () => {
            it('should handle zero id correctly', async () => {
                const repositoryError = new Error('Trabajo de generación con ID 0 no encontrado');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(repositoryError);

                await expect(service.CancelGeneration(0)).rejects.toThrow(
                    'Trabajo de generación con ID 0 no encontrado'
                );

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(0);
            });

            it('should handle negative id correctly', async () => {
                const repositoryError = new Error('Trabajo de generación con ID -1 no encontrado');
                mockGenerativeAIRepository.CancelGeneration.mockRejectedValue(repositoryError);

                await expect(service.CancelGeneration(-1)).rejects.toThrow(
                    'Trabajo de generación con ID -1 no encontrado'
                );

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(-1);
            });
        });

        describe('service delegation verification', () => {
            it('should delegate to repository without transformation', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(555);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(555);
                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledTimes(1);
            });

            it('should not call any other repository methods', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(777);

                expect(mockGenerativeAIRepository.CancelGeneration).toHaveBeenCalledWith(777);
                expect(mockGenerativeAIRepository.GenerateAsset).not.toHaveBeenCalled();
                expect(mockGenerativeAIRepository.GetStatus).not.toHaveBeenCalled();
                expect(mockGenerativeAIRepository.GetLog).not.toHaveBeenCalled();
                expect(mockGenerativeAIRepository.GetGenerationJobById).not.toHaveBeenCalled();
                expect(mockProjectRepository.GetProjectById).not.toHaveBeenCalled();
                expect(mockAssetRepository.GetAssetById).not.toHaveBeenCalled();
            });

            it('should not call any blob storage methods', async () => {
                mockGenerativeAIRepository.CancelGeneration.mockResolvedValue();

                await service.CancelGeneration(888);

                expect(mockBlobStorageService.uploadFile).not.toHaveBeenCalled();
                expect(mockBlobStorageService.getFileUrl).not.toHaveBeenCalled();
                expect(mockBlobStorageService.downloadFile).not.toHaveBeenCalled();
                expect(mockBlobStorageService.deleteFile).not.toHaveBeenCalled();
                expect(mockBlobStorageService.fileExists).not.toHaveBeenCalled();
            });
        });
    });
});
