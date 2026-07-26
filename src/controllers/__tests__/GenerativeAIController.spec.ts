import 'reflect-metadata';
import { Response } from 'express';
import { GenerativeAIController } from '../GenerativeAIController';
import { IGenerativeAIService } from '../../services/interfaces/IGenerativeAIService';
import { GenerateVideoDTO } from '../../dtos/generative-ai/GenerateVideoDTO';
import { GenerateVideoResponseDTO } from '../../dtos/generative-ai/GenerateVideoResponseDTO';
import { GenerateAudioDTO } from '../../dtos/generative-ai/GenerateAudioDTO';
import { GenerateAudioResponseDTO } from '../../dtos/generative-ai/GenerateAudioResponseDTO';
import { GetStatusDTO } from '../../dtos/generative-ai/GetStatusDTO';
import { GetStatusResponseDTO } from '../../dtos/generative-ai/GetStatusResponseDTO';
import { TypedRequestBody, TypedRequestParams } from '../../types/requests';
import { GenerateImageDTO } from '../../dtos/generative-ai/GenerateImageDTO';
import { GenerateImageResponseDTO } from '../../dtos/generative-ai/GenerateImageResponseDTO';
import { GenerateTextDTO } from '../../dtos/generative-ai/GenerateTextDTO';
import { GenerateTextResponseDTO } from '../../dtos/generative-ai/GenerateTextResponseDTO';

describe('GenerativeAIController', () => {
    let controller: GenerativeAIController;
    let mockGenerativeAIService: jest.Mocked<IGenerativeAIService>;
    let mockRequest: Partial<TypedRequestBody<GenerateVideoDTO>>;
    let mockImageRequest: Partial<TypedRequestBody<GenerateImageDTO>>;
    let mockTextRequest: Partial<TypedRequestBody<GenerateTextDTO>>;
    let mockAudioRequest: Partial<TypedRequestBody<GenerateAudioDTO>>;
    let mockStatusRequest: Partial<TypedRequestParams<GetStatusDTO>>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockGenerativeAIService = {
            GenerateAsset: jest.fn(),
            GetStatus: jest.fn(),
            CancelGeneration: jest.fn(),
            GetLog: jest.fn(),
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        controller = new GenerativeAIController(mockGenerativeAIService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GenerateVideo method', () => {
        describe('Positive cases', () => {
            it('should successfully generate video and return 201 with job id', async () => {
                const expectedJobId = 12345;
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate a beautiful sunset video with mountains',
                    model: 'stable-diffusion-video',
                    referenceImageId: 123,
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateVideo(
                    mockRequest as TypedRequestBody<GenerateVideoDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validVideoData.prompt,
                    validVideoData.model,
                    'video',
                    validVideoData.projectId,
                    validVideoData.referenceImageId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateVideoResponseDTO(expectedJobId)
                );
            });

            it('should successfully generate video without reference image and return 201', async () => {
                const expectedJobId = 67890;
                const validVideoDataWithoutRef: GenerateVideoDTO = {
                    projectId: 2,
                    prompt: 'Create an animated video of a dancing robot',
                    model: 'runway-ml',
                };

                mockRequest = {
                    validatedBody: validVideoDataWithoutRef,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateVideo(
                    mockRequest as TypedRequestBody<GenerateVideoDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validVideoDataWithoutRef.prompt,
                    validVideoDataWithoutRef.model,
                    'video',
                    validVideoDataWithoutRef.projectId,
                    undefined
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateVideoResponseDTO(expectedJobId)
                );
            });

            it('should handle different valid models correctly', async () => {
                const testCases = [
                    'stable-diffusion-video',
                    'runway-ml',
                    'pika-labs',
                    'synthesia',
                    'luma-ai'
                ];

                for (const model of testCases) {
                    const expectedJobId = Math.floor(Math.random() * 10000);
                    const validVideoData: GenerateVideoDTO = {
                        projectId: 1,
                        prompt: `Generate video with ${model}`,
                        model: model,
                    };

                    mockRequest = {
                        validatedBody: validVideoData,
                    };

                    mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                    await controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    );

                    expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                        validVideoData.prompt,
                        model,
                        'video',
                        validVideoData.projectId,
                        undefined
                    );
                }
            });

            it('should handle referenceImageId as zero correctly', async () => {
                const expectedJobId = 11111;
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate a video with reference image zero',
                    model: 'stable-diffusion-video',
                    referenceImageId: 0,
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateVideo(
                    mockRequest as TypedRequestBody<GenerateVideoDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validVideoData.prompt,
                    validVideoData.model,
                    'video',
                    validVideoData.projectId,
                    0
                );
            });
        });

        describe('Negative cases - Service errors', () => {
            it('should propagate error when service throws project not found error', async () => {
                const validVideoData: GenerateVideoDTO = {
                    projectId: 999,
                    prompt: 'Generate video for non-existent project',
                    model: 'stable-diffusion-video',
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                const expectedError = new Error('Proyecto con ID 999 no encontrado');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Proyecto con ID 999 no encontrado');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws project not active error', async () => {
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate video for inactive project',
                    model: 'runway-ml',
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                const expectedError = new Error('El proyecto con ID 1 no está activo');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('El proyecto con ID 1 no está activo');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws reference image not found error', async () => {
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate video with invalid reference image',
                    model: 'pika-labs',
                    referenceImageId: 999,
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                const expectedError = new Error('Imagen de referencia con ID 999 no encontrada');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Imagen de referencia con ID 999 no encontrada');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws Azure Blob Storage error', async () => {
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate video with blob storage issue',
                    model: 'synthesia',
                    referenceImageId: 123,
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                const expectedError = new Error('Error al obtener imagen de referencia desde Azure Blob Storage: File not found');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Error al obtener imagen de referencia desde Azure Blob Storage: File not found');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate generic error when service throws unexpected error', async () => {
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate video with unexpected error',
                    model: 'luma-ai',
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                const expectedError = new Error('Unexpected database connection error');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Unexpected database connection error');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });

        describe('Edge cases', () => {
            it('should handle service returning zero as valid job id', async () => {
                const expectedJobId = 0;
                const validVideoData: GenerateVideoDTO = {
                    projectId: 1,
                    prompt: 'Generate video that returns job id zero',
                    model: 'runway-ml',
                };

                mockRequest = {
                    validatedBody: validVideoData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateVideo(
                    mockRequest as TypedRequestBody<GenerateVideoDTO>,
                    mockResponse as Response
                );

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateVideoResponseDTO(0)
                );
            });
        });

        describe('Request validation scenarios', () => {
            it('should handle request with validatedBody being null or undefined', async () => {
                mockRequest = {
                    validatedBody: undefined,
                };

                await expect(
                    controller.GenerateVideo(
                        mockRequest as TypedRequestBody<GenerateVideoDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow();

                expect(mockGenerativeAIService.GenerateAsset).not.toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('GenerateImage method', () => {
        describe('Positive cases', () => {
            it('should successfully generate image and return 201 with job id', async () => {
                const expectedJobId = 54321;
                const validImageData: GenerateImageDTO = {
                    projectId: 3,
                    prompt: 'A futuristic cityscape, very detailed',
                    model: 'google-image',
                };

                mockImageRequest = {
                    validatedBody: validImageData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateImage(
                    mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validImageData.prompt,
                    validImageData.model,
                    'image',
                    validImageData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateImageResponseDTO(expectedJobId)
                );
            });

            it('should handle different valid image models correctly', async () => {
                const testCases = [
                    'google-image',
                    'adobe-firefly',
                    'stable-diffusion',
                ];

                for (const model of testCases) {
                    const expectedJobId = Math.floor(Math.random() * 10000);
                    const validImageData: GenerateImageDTO = {
                        projectId: 4,
                        prompt: `Generate image with ${model} model`,
                        model: model,
                    };

                    mockImageRequest = {
                        validatedBody: validImageData,
                    };

                    mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                    await controller.GenerateImage(
                        mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                        mockResponse as Response
                    );

                    expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                        validImageData.prompt,
                        model,
                        'image',
                        validImageData.projectId
                    );
                }
            });
        });

        describe('Negative cases - Service errors', () => {
            it('should propagate error when service throws project not found error for image generation', async () => {
                const validImageData: GenerateImageDTO = {
                    projectId: 998,
                    prompt: 'Generate image for non-existent project',
                    model: 'adobe-firefly',
                };

                mockImageRequest = {
                    validatedBody: validImageData,
                };

                const expectedError = new Error('Proyecto con ID 998 no encontrado');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateImage(
                        mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Proyecto con ID 998 no encontrado');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate generic error when service throws unexpected error for image generation', async () => {
                const validImageData: GenerateImageDTO = {
                    projectId: 5,
                    prompt: 'Generate image with an unexpected error',
                    model: 'stable-diffusion',
                };

                mockImageRequest = {
                    validatedBody: validImageData,
                };

                const expectedError = new Error('Unexpected network issue');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateImage(
                        mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Unexpected network issue');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });

        describe('Edge cases', () => {
            it('should handle service returning zero as valid job id for image generation', async () => {
                const expectedJobId = 0;
                const validImageData: GenerateImageDTO = {
                    projectId: 6,
                    prompt: 'Generate image that returns job id zero',
                    model: 'google-image',
                };

                mockImageRequest = {
                    validatedBody: validImageData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateImage(
                    mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                    mockResponse as Response
                );

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateImageResponseDTO(0)
                );
            });
        });

        describe('Request validation scenarios', () => {
            it('should handle request with validatedBody being null or undefined for image generation', async () => {
                mockImageRequest = {
                    validatedBody: undefined,
                };

                await expect(
                    controller.GenerateImage(
                        mockImageRequest as TypedRequestBody<GenerateImageDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow();

                expect(mockGenerativeAIService.GenerateAsset).not.toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('GenerateText method', () => {
        describe('Positive cases', () => {
            it('should successfully generate text and return 201 with job id', async () => {
                const expectedJobId = 98765;
                const validTextData: GenerateTextDTO = {
                    projectId: 7,
                    prompt: 'Write a creative story about artificial intelligence',
                    model: 'gpt-4o',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateText(
                    mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validTextData.prompt,
                    validTextData.model,
                    'text',
                    validTextData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateTextResponseDTO(expectedJobId)
                );
            });

            it('should handle different valid text models correctly', async () => {
                const testCases = [
                    'gpt-4o',
                    'gemini2.5',
                ];

                for (const model of testCases) {
                    const expectedJobId = Math.floor(Math.random() * 10000);
                    const validTextData: GenerateTextDTO = {
                        projectId: 8,
                        prompt: `Generate text content using ${model} model for testing purposes`,
                        model: model,
                    };

                    mockTextRequest = {
                        validatedBody: validTextData,
                    };

                    mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                    await controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    );

                    expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                        validTextData.prompt,
                        model,
                        'text',
                        validTextData.projectId
                    );
                }
            });

            it('should handle long prompts correctly', async () => {
                const expectedJobId = 55555;
                const longPrompt = 'This is a very long prompt '.repeat(50) + 'for text generation testing.';
                const validTextData: GenerateTextDTO = {
                    projectId: 9,
                    prompt: longPrompt,
                    model: 'gemini2.5',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateText(
                    mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validTextData.prompt,
                    validTextData.model,
                    'text',
                    validTextData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateTextResponseDTO(expectedJobId)
                );
            });
        });

        describe('Negative cases - Service errors', () => {
            it('should propagate error when service throws project not found error for text generation', async () => {
                const validTextData: GenerateTextDTO = {
                    projectId: 997,
                    prompt: 'Generate text for non-existent project',
                    model: 'gpt-4o',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                const expectedError = new Error('Proyecto con ID 997 no encontrado');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Proyecto con ID 997 no encontrado');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws project not active error for text generation', async () => {
                const validTextData: GenerateTextDTO = {
                    projectId: 10,
                    prompt: 'Generate text for inactive project',
                    model: 'gemini2.5',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                const expectedError = new Error('El proyecto con ID 10 no está activo');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('El proyecto con ID 10 no está activo');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate generic error when service throws unexpected error for text generation', async () => {
                const validTextData: GenerateTextDTO = {
                    projectId: 11,
                    prompt: 'Generate text with unexpected error scenario',
                    model: 'gpt-4o',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                const expectedError = new Error('API rate limit exceeded');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('API rate limit exceeded');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws model unavailable error', async () => {
                const validTextData: GenerateTextDTO = {
                    projectId: 12,
                    prompt: 'Generate text when model is unavailable',
                    model: 'gemini2.5',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                const expectedError = new Error('Modelo gemini2.5 temporalmente no disponible');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Modelo gemini2.5 temporalmente no disponible');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });

        describe('Edge cases', () => {
            it('should handle service returning zero as valid job id for text generation', async () => {
                const expectedJobId = 0;
                const validTextData: GenerateTextDTO = {
                    projectId: 13,
                    prompt: 'Generate text that returns job id zero',
                    model: 'gpt-4o',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateText(
                    mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                    mockResponse as Response
                );

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateTextResponseDTO(0)
                );
            });

            it('should handle minimum length prompt correctly', async () => {
                const expectedJobId = 77777;
                const validTextData: GenerateTextDTO = {
                    projectId: 14,
                    prompt: 'Short', // 5 characters minimum
                    model: 'gemini2.5',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateText(
                    mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validTextData.prompt,
                    validTextData.model,
                    'text',
                    validTextData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateTextResponseDTO(expectedJobId)
                );
            });

            it('should handle maximum length prompt correctly', async () => {
                const expectedJobId = 88888;
                const maxPrompt = 'A'.repeat(4000); // Maximum 4000 characters
                const validTextData: GenerateTextDTO = {
                    projectId: 15,
                    prompt: maxPrompt,
                    model: 'gpt-4o',
                };

                mockTextRequest = {
                    validatedBody: validTextData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateText(
                    mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validTextData.prompt,
                    validTextData.model,
                    'text',
                    validTextData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateTextResponseDTO(expectedJobId)
                );
            });
        });

        describe('Request validation scenarios', () => {
            it('should handle request with validatedBody being null or undefined for text generation', async () => {
                mockTextRequest = {
                    validatedBody: undefined,
                };

                await expect(
                    controller.GenerateText(
                        mockTextRequest as TypedRequestBody<GenerateTextDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow();

                expect(mockGenerativeAIService.GenerateAsset).not.toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('GenerateAudio method', () => {
        describe('Positive cases', () => {
            it('should successfully generate audio and return 201 with job id', async () => {
                const expectedJobId = 12345;
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate a calm background music for meditation',
                    model: 'eleven-labs',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateAudio(
                    mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validAudioData.prompt,
                    validAudioData.model,
                    'audio',
                    validAudioData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateAudioResponseDTO(expectedJobId)
                );
            });

            it('should successfully generate audio with optional parameters and return 201', async () => {
                const expectedJobId = 67890;
                const validAudioDataWithOptionals: GenerateAudioDTO = {
                    projectId: 2,
                    prompt: 'Create a dramatic voice narration for documentary',
                    model: 'murf-ai',
                    duration: 120,
                    quality: 'high',
                    soundType: 'voice',
                    voice: 'male',
                    language: 'en',
                    speed: 150,
                };

                mockAudioRequest = {
                    validatedBody: validAudioDataWithOptionals,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateAudio(
                    mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validAudioDataWithOptionals.prompt,
                    validAudioDataWithOptionals.model,
                    'audio',
                    validAudioDataWithOptionals.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateAudioResponseDTO(expectedJobId)
                );
            });

            it('should handle different valid models correctly', async () => {
                const testCases = [
                    'eleven-labs',
                    'murf-ai',
                    'speechify',
                    'azure-speech',
                    'google-tts'
                ];

                for (const model of testCases) {
                    const expectedJobId = Math.floor(Math.random() * 10000);
                    const validAudioData: GenerateAudioDTO = {
                        projectId: 1,
                        prompt: `Generate audio with ${model}`,
                        model: model,
                    };

                    mockAudioRequest = {
                        validatedBody: validAudioData,
                    };

                    mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                    await controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    );

                    expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                        validAudioData.prompt,
                        model,
                        'audio',
                        validAudioData.projectId
                    );
                }
            });

            it('should handle optional parameters with boundary values correctly', async () => {
                const expectedJobId = 11111;
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio with boundary values',
                    model: 'eleven-labs',
                    duration: 1,
                    speed: 50,
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateAudio(
                    mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validAudioData.prompt,
                    validAudioData.model,
                    'audio',
                    validAudioData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateAudioResponseDTO(expectedJobId)
                );
            });
        });

        describe('Negative cases - Service errors', () => {
            it('should propagate error when service throws project not found error', async () => {
                const validAudioData: GenerateAudioDTO = {
                    projectId: 999,
                    prompt: 'Generate audio for non-existent project',
                    model: 'eleven-labs',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                const expectedError = new Error('Proyecto con ID 999 no encontrado');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Proyecto con ID 999 no encontrado');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws project not active error', async () => {
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio for inactive project',
                    model: 'murf-ai',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                const expectedError = new Error('El proyecto con ID 1 no está activo');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('El proyecto con ID 1 no está activo');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws database connection error', async () => {
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio with database issue',
                    model: 'speechify',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                const expectedError = new Error('Database connection timeout');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Database connection timeout');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate generic error when service throws unexpected error', async () => {
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio with unexpected error',
                    model: 'azure-speech',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                const expectedError = new Error('Unexpected service unavailable error');
                mockGenerativeAIService.GenerateAsset.mockRejectedValue(expectedError);

                await expect(
                    controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Unexpected service unavailable error');

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });

        describe('Edge cases', () => {
            it('should handle service returning zero as valid job id', async () => {
                const expectedJobId = 0;
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio that returns job id zero',
                    model: 'google-tts',
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateAudio(
                    mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                    mockResponse as Response
                );

                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateAudioResponseDTO(0)
                );
            });

            it('should handle maximum duration boundary value correctly', async () => {
                const expectedJobId = 22222;
                const validAudioData: GenerateAudioDTO = {
                    projectId: 1,
                    prompt: 'Generate audio with maximum duration',
                    model: 'eleven-labs',
                    duration: 600,
                    speed: 200,
                };

                mockAudioRequest = {
                    validatedBody: validAudioData,
                };

                mockGenerativeAIService.GenerateAsset.mockResolvedValue(expectedJobId);

                await controller.GenerateAudio(
                    mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GenerateAsset).toHaveBeenCalledWith(
                    validAudioData.prompt,
                    validAudioData.model,
                    'audio',
                    validAudioData.projectId
                );
                expect(mockResponse.status).toHaveBeenCalledWith(201);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GenerateAudioResponseDTO(expectedJobId)
                );
            });
        });

        describe('Request validation scenarios', () => {
            it('should handle request with validatedBody being null or undefined', async () => {
                mockAudioRequest = {
                    validatedBody: undefined,
                };

                await expect(
                    controller.GenerateAudio(
                        mockAudioRequest as TypedRequestBody<GenerateAudioDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow();

                expect(mockGenerativeAIService.GenerateAsset).not.toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });

    describe('GetStatus method', () => {
        describe('Positive cases', () => {
            it('should successfully get status and return 200 with status data', async () => {
                const jobId = 12345;
                const expectedStatus = 'completed';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });

            it('should handle pending status correctly', async () => {
                const jobId = 67890;
                const expectedStatus = 'pending';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });

            it('should handle processing status correctly', async () => {
                const jobId = 11111;
                const expectedStatus = 'processing';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });

            it('should handle failed status correctly', async () => {
                const jobId = 22222;
                const expectedStatus = 'failed';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });
        });

        describe('Negative cases - Service errors', () => {
            it('should propagate error when service throws job not found error', async () => {
                const jobId = 99999;
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                const expectedError = new Error('Job con ID 99999 no encontrado');
                mockGenerativeAIService.GetStatus.mockRejectedValue(expectedError);

                await expect(
                    controller.GetStatus(
                        mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Job con ID 99999 no encontrado');

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledTimes(1);
                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate error when service throws database connection error', async () => {
                const jobId = 33333;
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                const expectedError = new Error('Database connection timeout');
                mockGenerativeAIService.GetStatus.mockRejectedValue(expectedError);

                await expect(
                    controller.GetStatus(
                        mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Database connection timeout');

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });

            it('should propagate generic error when service throws unexpected error', async () => {
                const jobId = 44444;
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                const expectedError = new Error('Unexpected service unavailable error');
                mockGenerativeAIService.GetStatus.mockRejectedValue(expectedError);

                await expect(
                    controller.GetStatus(
                        mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow('Unexpected service unavailable error');

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledTimes(1);
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });

        describe('Edge cases', () => {
            it('should handle job id as minimum positive value correctly', async () => {
                const jobId = 1;
                const expectedStatus = 'completed';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(1);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });

            it('should handle large job id values correctly', async () => {
                const jobId = 2147483647;
                const expectedStatus = 'processing';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO(expectedStatus)
                );
            });

            it('should handle empty string status from service correctly', async () => {
                const jobId = 55555;
                const expectedStatus = '';
                const validStatusParams: GetStatusDTO = {
                    jobId: jobId,
                };

                mockStatusRequest = {
                    validatedParams: validStatusParams,
                };

                mockGenerativeAIService.GetStatus.mockResolvedValue(expectedStatus);

                await controller.GetStatus(
                    mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                    mockResponse as Response
                );

                expect(mockGenerativeAIService.GetStatus).toHaveBeenCalledWith(jobId);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith(
                    new GetStatusResponseDTO('')
                );
            });
        });

        describe('Request validation scenarios', () => {
            it('should handle request with validatedParams being null or undefined', async () => {
                mockStatusRequest = {
                    validatedParams: undefined,
                };

                await expect(
                    controller.GetStatus(
                        mockStatusRequest as TypedRequestParams<GetStatusDTO>,
                        mockResponse as Response
                    )
                ).rejects.toThrow();

                expect(mockGenerativeAIService.GetStatus).not.toHaveBeenCalled();
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
            });
        });
    });
});

