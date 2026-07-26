export class GenerateImageResponseDTO {
  jobId!: number;
  assetId!: number;

  constructor(jobId: number, assetId: number) {
    this.jobId = jobId;
    this.assetId = assetId;
  }
} 