import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../config";
import { prisma } from "../config/prisma";

interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  rootFolder: string;
  enabled: boolean;
}

// Cache S3 clients per org
const clientCache: Record<string, { client: S3Client; config: S3Config }> = {};

function getEnvConfig(): S3Config {
  return {
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    bucket: config.s3.bucket,
    accessKey: config.s3.accessKey,
    secretKey: config.s3.secretKey,
    rootFolder: "",
    enabled: !!config.s3.accessKey,
  };
}

export async function getOrgS3Config(orgId: string): Promise<S3Config> {
  try {
    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { settings: true } });
    const settings = org?.settings as any;
    if (settings?.s3?.enabled && settings.s3.accessKey && settings.s3.bucket) {
      return {
        endpoint: settings.s3.endpoint || config.s3.endpoint,
        region: settings.s3.region || "us-east-1",
        bucket: settings.s3.bucket,
        accessKey: settings.s3.accessKey,
        secretKey: settings.s3.secretKey || config.s3.secretKey,
        rootFolder: settings.s3.rootFolder || "",
        enabled: true,
      };
    }
  } catch {}
  return getEnvConfig();
}

function getClient(cfg: S3Config): S3Client {
  const key = `${cfg.endpoint}:${cfg.bucket}:${cfg.accessKey}`;
  if (!clientCache[key]) {
    clientCache[key] = {
      client: new S3Client({
        endpoint: cfg.endpoint,
        region: cfg.region,
        credentials: { accessKeyId: cfg.accessKey, secretAccessKey: cfg.secretKey },
        forcePathStyle: true,
      }),
      config: cfg,
    };
  }
  return clientCache[key].client;
}

function prefixKey(cfg: S3Config, key: string): string {
  if (cfg.rootFolder) {
    const folder = cfg.rootFolder.replace(/\/+$/, "");
    return `${folder}/${key}`;
  }
  return key;
}

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string = "image/jpeg",
  expiresIn: number = 300,
  orgId?: string,
): Promise<{ url: string; fullKey: string }> {
  const cfg = orgId ? await getOrgS3Config(orgId) : getEnvConfig();
  const client = getClient(cfg);
  const fullKey = prefixKey(cfg, key);
  const command = new PutObjectCommand({ Bucket: cfg.bucket, Key: fullKey, ContentType: contentType });
  const url = await getSignedUrl(client, command, { expiresIn });
  return { url, fullKey };
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600,
  orgId?: string,
): Promise<string> {
  const cfg = orgId ? await getOrgS3Config(orgId) : getEnvConfig();
  const client = getClient(cfg);
  const command = new GetObjectCommand({ Bucket: cfg.bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteObject(key: string, orgId?: string): Promise<void> {
  const cfg = orgId ? await getOrgS3Config(orgId) : getEnvConfig();
  const client = getClient(cfg);
  const command = new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key });
  await client.send(command);
}

export async function isS3Enabled(orgId: string): Promise<boolean> {
  const cfg = await getOrgS3Config(orgId);
  return cfg.enabled;
}
