import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';
import { TimelineController } from '../../controllers/TimelineController';
import { ITimelineService } from '../../services/interfaces/ITimelineService';
import { TimelineValidationMiddleware } from '../../middlewares/TimelineValidationMiddleware';
import { CreateTimelineEventDTO } from '../../dtos/Timeline/request/CreateTimelineEventDTO';
import { CreateTimelineResponseDTO } from '../../dtos/Timeline/response/CreateTimelineResponseDTO';
import { container } from 'tsyringe';
import { plainToInstance } from 'class-transformer';
import { GetTimelineEventDTO } from '../../dtos/Timeline/request/GetTimelineEventDTO';
import { TimelineEventResponseDTO } from '../../dtos/Timeline/response/TimelineEventResponseDTO';
import { validate } from 'class-validator';
import { EventType } from '../../dtos/Timeline/types/EventType';
import { UpdateTimelineEventDTO } from '../../dtos/Timeline/request/UpdateTimelineEventDTO';

describe('TimelineController', () => {
    let timelineController: TimelineController;
    let mockTimelineService: jest.Mocked<ITimelineService>;
    let mockValidationMiddleware: TimelineValidationMiddleware;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Create service mock with all required methods
        mockTimelineService = {
            saveTimeline: jest.fn().mockResolvedValue(undefined),
            getTimeline: jest.fn().mockResolvedValue(null),
            updateTimeline: jest.fn().mockResolvedValue(null),
            exists: jest.fn().mockResolvedValue(false)
        } as jest.Mocked<ITimelineService>;

        // Create validation middleware instance with mocked methods
        mockValidationMiddleware = new TimelineValidationMiddleware(mockTimelineService);
        const mockMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
            next();
            return undefined;
        };
        
        jest.spyOn(mockValidationMiddleware, 'validateCreate').mockImplementation(mockMiddleware);
        jest.spyOn(mockValidationMiddleware, 'validateUpdate').mockImplementation(mockMiddleware);
        jest.spyOn(mockValidationMiddleware, 'validateTimelineExists').mockImplementation(mockMiddleware);

        // Setup response mock
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            status: mockStatus,
            json: mockJson,
        };

        // Register mocks with tsyringe
        container.clearInstances();
        container.registerInstance('ITimelineService', mockTimelineService);
        container.registerInstance(TimelineValidationMiddleware, mockValidationMiddleware);

        // Create controller instance
        timelineController = new TimelineController(mockTimelineService, mockValidationMiddleware);
    });

    afterEach(() => {
        // Clean up after each test
        jest.resetAllMocks();
        container.clearInstances();
    });

    describe('saveTimeline', () => {
        describe('Positive Cases', () => {
            it('should successfully save a timeline and return 201 status', async () => {
                // Arrange
                const timelineId = 1;
                const timelineData = {
                    project_id: 1,
                    event_type: EventType.Clip,
                    asset_id: 1,
                    start_time: 1704067200000,
                    end_time: 1704153600000,
                    properties: { test: 'property' }
                };

                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: timelineData
                };

                mockTimelineService.saveTimeline.mockResolvedValueOnce(undefined);

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockTimelineService.saveTimeline).toHaveBeenCalledWith(timelineId, expect.objectContaining(timelineData));
                expect(mockTimelineService.saveTimeline).toHaveBeenCalledTimes(1);
                expect(mockStatus).toHaveBeenCalledWith(201);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: 'Timeline saved successfully',
                    data: expect.any(Object)
                });
            });

            it('should transform request body to CreateTimelineEventDTO instance', async () => {
                // Arrange
                const timelineData = {
                    project_id: 1,
                    event_type: 'TEST_EVENT',
                    asset_id: 1,
                    start_time: '2024-01-01',
                    end_time: '2024-01-02'
                };

                mockRequest = {
                    body: timelineData,
                    params: { timelineId: '1' }
                };

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockTimelineService.saveTimeline).toHaveBeenCalledWith(
                    1,
                    expect.any(CreateTimelineEventDTO)
                );
            });
        });

        describe('Negative Cases', () => {
            it('should return 500 status when timeline service throws an error', async () => {
                // Arrange
                const errorMessage = 'Database connection failed';
                mockTimelineService.saveTimeline.mockRejectedValue(new Error(errorMessage));

                mockRequest = {
                    body: {},
                    params: { timelineId: '1' }
                };

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: errorMessage
                });
            });

            it('should handle invalid timelineId parameter', async () => {
                // Arrange
                mockRequest = {
                    body: {},
                    params: { timelineId: 'invalid' }
                };

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Invalid timeline ID'
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty request body', async () => {
                // Arrange
                mockRequest = {
                    body: {},
                    params: { timelineId: '1' }
                };

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockTimelineService.saveTimeline).toHaveBeenCalledWith(
                    1,
                    expect.any(CreateTimelineEventDTO)
                );
            });

            it('should handle missing timelineId parameter', async () => {
                // Arrange
                mockRequest = {
                    body: {},
                    params: {}
                };

                // Act
                await timelineController.saveTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Invalid timeline ID'
                });
            });
        });
    });

    describe('getTimeline', () => {
        describe('Positive Cases', () => {
            it('should successfully retrieve a timeline and return 200 status', async () => {
                // Arrange
                const timelineId = 1;
                const mockTimelineData: TimelineEventResponseDTO = {
                    timeline_id: timelineId,
                    project_id: 1,
                    event_type: EventType.Clip,
                    asset_id: 1,
                    start_time: 1704067200000, // 2024-01-01 in milliseconds
                    end_time: 1704153600000,   // 2024-01-02 in milliseconds
                    properties: { test: 'property' }
                };

                mockRequest = {
                    params: { timelineId: timelineId.toString() }
                };

                mockTimelineService.getTimeline.mockResolvedValue(mockTimelineData);

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockTimelineService.getTimeline).toHaveBeenCalledWith(timelineId);
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    data: expect.any(TimelineEventResponseDTO)
                });
            });

            it('should transform timeline data to TimelineEventResponseDTO', async () => {
                // Arrange
                const timelineId = 1;
                const mockTimelineData: TimelineEventResponseDTO = {
                    timeline_id: timelineId,
                    project_id: 1,
                    event_type: EventType.Clip,
                    asset_id: 1,
                    start_time: 1704067200000, // 2024-01-01 in milliseconds
                    end_time: 1704153600000    // 2024-01-02 in milliseconds
                };

                mockRequest = {
                    params: { timelineId: timelineId.toString() }
                };

                mockTimelineService.getTimeline.mockResolvedValue(mockTimelineData);

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    data: expect.objectContaining(mockTimelineData)
                });
            });
        });

        describe('Negative Cases', () => {
            it('should return 404 when timeline is not found', async () => {
                // Arrange
                mockRequest = {
                    params: { timelineId: '999' }
                };

                mockTimelineService.getTimeline.mockResolvedValue(null as unknown as TimelineEventResponseDTO);

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(404);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Timeline not found'
                });
            });

            it('should return 400 when timelineId validation fails', async () => {
                // Arrange
                mockRequest = {
                    params: { timelineId: 'invalid' }
                };

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Validation failed',
                    details: expect.any(Array)
                });
            });

            it('should return 500 when service throws an error', async () => {
                // Arrange
                const errorMessage = 'Database error';
                mockRequest = {
                    params: { timelineId: '1' }
                };

                mockTimelineService.getTimeline.mockRejectedValue(new Error(errorMessage));

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: errorMessage
                });
            });
        });

        describe('Edge Cases', () => {
            it('should handle missing timelineId parameter', async () => {
                // Arrange
                mockRequest = {
                    params: {}
                };

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Validation failed',
                    details: [
                        {
                            property: 'timeline_id',
                            constraints: {
                                isNumber: 'timeline_id must be a number conforming to the specified constraints'
                            }
                        }
                    ]
                });
            });

            it('should handle zero as timelineId', async () => {
                // Arrange
                mockRequest = {
                    params: { timelineId: '0' }
                };

                // Act
                await timelineController.getTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Validation failed',
                    details: [{
                        property: 'timeline_id',
                        constraints: {
                            isNumber: 'timeline_id must be a number conforming to the specified constraints'
                        }
                    }]
                });
            });
        });
    });

    describe('updateTimeline', () => {
        describe('Positive Cases', () => {
            it('should successfully update a timeline and return 200 status', async () => {
                // Arrange
                const timelineId = 1;
                const updateData: UpdateTimelineEventDTO = {
                    project_id: 2,
                    event_type: EventType.Clip,
                    asset_id: 3,
                    start_time: 1704067200000,
                    end_time: 1704153600000,
                    properties: { test: 'updated' }
                };

                const updatedTimeline: TimelineEventResponseDTO = {
                    timeline_id: timelineId,
                    project_id: 2,
                    event_type: EventType.Clip,
                    asset_id: 3,
                    start_time: 1704067200000,
                    end_time: 1704153600000,
                    properties: { test: 'updated' }
                };

                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: updateData
                };

                mockTimelineService.updateTimeline.mockResolvedValueOnce(updatedTimeline);

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockTimelineService.updateTimeline).toHaveBeenCalledWith(timelineId, expect.objectContaining(updateData));
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: 'Timeline updated successfully',
                    data: expect.any(Object)
                });
            });

            it('should handle partial updates correctly', async () => {
                // Arrange
                const timelineId = 1;
                const partialUpdate = {
                    project_id: 2,
                    properties: { test: 'partial update' }
                };

                const updatedTimeline: TimelineEventResponseDTO = {
                    timeline_id: timelineId,
                    project_id: 2,
                    event_type: EventType.Clip,
                    asset_id: 1,
                    start_time: 1000,
                    end_time: 2000,
                    properties: { test: 'partial update' }
                };

                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: partialUpdate
                };

                mockTimelineService.updateTimeline.mockResolvedValueOnce(updatedTimeline);

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                    success: true,
                    message: 'Timeline updated successfully',
                    data: expect.any(Object)
                });
            });
        });

        describe('Error Cases', () => {
            it('should handle invalid timelineId format', async () => {
                // Arrange
                mockRequest = {
                    params: { timelineId: 'invalid' },
                    body: {}
                };

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Validation failed',
                    details: [{
                        property: 'timeline_id',
                        constraints: {
                            isNumber: 'timeline_id must be a number conforming to the specified constraints'
                        }
                    }]
                });
            });

            it('should handle service errors appropriately', async () => {
                // Arrange
                const timelineId = 1;
                const errorMessage = 'Database error';
                
                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: {
                        project_id: 2,
                        event_type: EventType.Clip,
                        asset_id: 3,
                        start_time: 1000,
                        end_time: 2000
                    }
                };

                mockTimelineService.updateTimeline.mockRejectedValueOnce(new Error(errorMessage));

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: errorMessage
                });
            });

            it('should handle timeline not found', async () => {
                // Arrange
                mockRequest = {
                    params: { timelineId: '999' },
                    body: {
                        project_id: 1,
                        event_type: EventType.Clip,
                        asset_id: 1,
                        start_time: 1000,
                        end_time: 2000
                    }
                };

                mockTimelineService.updateTimeline.mockRejectedValueOnce(new Error('Timeline not found'));

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Timeline not found'
                });
            });
        });

        describe('Validation Cases', () => {
            it('should validate required fields', async () => {
                // Arrange
                const timelineId = 1;
                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: {}
                };

                mockTimelineService.updateTimeline.mockRejectedValueOnce(
                    new Error('Required fields missing')
                );

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(500);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Required fields missing'
                });
            });

            it('should validate numeric fields', async () => {
                // Arrange
                const timelineId = 1;
                mockRequest = {
                    params: { timelineId: timelineId.toString() },
                    body: {
                        project_id: 'not-a-number',
                        asset_id: 'invalid',
                        event_type: EventType.Clip,
                        start_time: 1000,
                        end_time: 2000
                    }
                };

                // Act
                await timelineController.updateTimeline(mockRequest as Request, mockResponse as Response);

                // Assert
                expect(mockStatus).toHaveBeenCalledWith(400);
                expect(mockJson).toHaveBeenCalledWith({
                    success: false,
                    error: 'Validation failed',
                    details: [
                        {
                            property: 'project_id',
                            constraints: {
                                isNumber: 'project_id must be a valid positive number'
                            }
                        },
                        {
                            property: 'asset_id',
                            constraints: {
                                isNumber: 'asset_id must be a valid positive number'
                            }
                        }
                    ]
                });
            });
        });
    });
}); 