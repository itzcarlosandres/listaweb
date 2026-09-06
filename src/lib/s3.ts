import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createId } from "@paralleldrive/cuid2";

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || "https://s3.us-east-1.amazonaws.com",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "mock_key",
    secretAccessKey: process.env.S3_SECRET_KEY || "mock_secret",
  },
  forcePathStyle: true,
});

export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const extension = filename.split(".").pop() || "png";
  const uniqueKey = `uploads/${createId()}.${extension}`;
  const bucketName = process.env.S3_BUCKET || "launchhub-assets";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `${process.env.S3_ENDPOINT}/${bucketName}/${uniqueKey}`;

  return {
    uploadUrl,
    publicUrl,
    key: uniqueKey,
  };
}
