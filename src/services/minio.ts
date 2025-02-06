import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService {
  private minioClient: Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: false,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || '',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || '',
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'default-bucket';
  }

  async uploadImage(file: { buffer: Buffer; originalname: string; mimetype: string }): Promise<string> {
    try {
      const fileName = `${uuidv4()}-${file.originalname}`;
      await this.minioClient.putObject(
          this.bucketName,
          fileName,
          file.buffer,
          file.buffer.length,
          { 'Content-Type': file.mimetype }
      );
      const imageUrl = `http://${this.configService.get<string>('MINIO_ENDPOINT')}:${this.configService.get<string>('MINIO_PORT')}/${this.bucketName}/${fileName}`;
      console.log('Generated MinIO URL:', imageUrl); // Add this log
      return imageUrl;
    } catch (error) {
      console.error('MinIO upload error:', error);
      throw new InternalServerErrorException('Error uploading image to MinIO');
    }
  }
}