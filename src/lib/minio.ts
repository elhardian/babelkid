import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function env(name: string, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function isMinioConfigured() {
  return Boolean(
    env("MINIO_ENDPOINT") &&
      env("MINIO_ACCESS_KEY") &&
      env("MINIO_SECRET_KEY") &&
      env("MINIO_BUCKET"),
  );
}

export function getMinioConfig() {
  const endpoint = env("MINIO_ENDPOINT", "localhost");
  const port = env("MINIO_PORT", "9000");
  const useSSL = env("MINIO_USE_SSL", "false") === "true";
  const bucket = env("MINIO_BUCKET", "babelkid");
  const accessKey = env("MINIO_ACCESS_KEY", "minioadmin");
  const secretKey = env("MINIO_SECRET_KEY", "minioadmin");
  const publicBase =
    env("MINIO_PUBLIC_URL") ||
    `${useSSL ? "https" : "http"}://${endpoint}:${port}/${bucket}`;

  return {
    endpoint,
    port,
    useSSL,
    bucket,
    accessKey,
    secretKey,
    publicBase: publicBase.replace(/\/$/, ""),
  };
}

let client: S3Client | null = null;
let bucketReady = false;

export function getMinioClient() {
  if (client) return client;
  const cfg = getMinioConfig();
  client = new S3Client({
    region: env("MINIO_REGION", "us-east-1"),
    endpoint: `${cfg.useSSL ? "https" : "http"}://${cfg.endpoint}:${cfg.port}`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKey,
      secretAccessKey: cfg.secretKey,
    },
  });
  return client;
}

async function ensureBucket() {
  if (bucketReady) return;
  const cfg = getMinioConfig();
  const s3 = getMinioClient();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: cfg.bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: cfg.bucket }));
  }
  bucketReady = true;
}

export async function uploadToMinio(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const cfg = getMinioConfig();
  const s3 = getMinioClient();
  await ensureBucket();
  await s3.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${cfg.publicBase}/${key}`;
}

export function buildObjectKey(filename: string, folder = "kegiatan") {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${folder}/${stamp}-${rand}-${safe}`;
}
