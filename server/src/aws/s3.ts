import * as AWS from "aws-sdk";
import { S3 } from "aws-sdk";
import { Readable } from "stream";

export interface S3DownloadResponse {
  body: Readable;
  contentType: string;
  contentLength: number;
  etag: string;
}

export const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export class S3UploadResponse {
  constructor(public etag: string, public location: string) {}
}

export interface S3DownloadResponse {
  body: Readable;
  contentType: string;
  contentLength: number;
  etag: string;
}

class S3Manager {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      signatureVersion: "v4",
    });
  }

  public async uploadFile(
    bucket: string,
    fileName: string,
    fileContent: Buffer
  ): Promise<S3.ManagedUpload.SendData> {
    try {
      const uploadParams = this.getUploadParams(bucket, fileName, fileContent);
      return await this.s3.upload(uploadParams).promise();
    } catch (error) {
      console.error(`Error uploading file to S3 bucket: ${error}`);
      throw error;
    }
  }

  public async downloadFile(bucket: string, key: string): Promise<S3.GetObjectOutput> {
    try {
      const downloadParams = this.getDownloadParams(bucket, key);
      return await this.s3.getObject(downloadParams).promise();
    } catch (error) {
      console.error(`Error downloading file from S3 bucket: ${error}`);
      throw error;
    }
  }

  public async deleteFile(
    bucket: string,
    fileName: string
  ): Promise<S3.DeleteObjectOutput> {
    try {
      const deleteParams = this.getDeleteParams(bucket, fileName);
      return await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error(`Error deleting file from S3 bucket: ${error}`);
      throw error;
    }
  }

  private getUploadParams(
    bucket: string,
    fileName: string,
    fileContent: Buffer
  ): S3.PutObjectRequest {
    return {
      Bucket: bucket,
      Key: fileName,
      Body: fileContent,
    };
  }

  private getDownloadParams(bucket: string, fileName: string): S3.GetObjectRequest {
    return {
      Bucket: bucket,
      Key: fileName,
    };
  }

  private getDeleteParams(bucket: string, fileName: string): S3.DeleteObjectRequest {
    return {
      Bucket: bucket,
      Key: fileName,
    };
  }
}

export const S3Service = new S3Manager();
