import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface StorageConfig {
  region: string;
  bucket: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export class FileStorageService {
  private s3: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.bucket = config.bucket;
    this.s3 = new S3Client({
      region: config.region,
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
      ...(config.accessKeyId
        ? { credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey! } }
        : {}),
    });
  }

  async upload(
    tenantId: string,
    file: Buffer,
    filename: string,
    contentType: string,
    folder = 'uploads',
  ): Promise<{ key: string; url: string }> {
    const ext = filename.split('.').pop();
    const key = `${tenantId}/${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        Metadata: { tenantId, originalFilename: filename },
      }),
    );

    return { key, url: `https://${this.bucket}.s3.amazonaws.com/${key}` };
  }

  async getSignedUploadUrl(
    tenantId: string,
    filename: string,
    contentType: string,
    expiresIn = 3600,
  ): Promise<{ url: string; key: string }> {
    const ext = filename.split('.').pop();
    const key = `${tenantId}/uploads/${uuidv4()}.${ext}`;

    const url = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn },
    );

    return { url, key };
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.s3,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
