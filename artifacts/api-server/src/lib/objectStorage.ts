import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { randomUUID } from "crypto";
import {
  ObjectAclPolicy,
  ObjectPermission,
  canAccessObject,
  getObjectAclPolicy,
  setObjectAclPolicy,
} from "./objectAcl";

// ---------------------------------------------------------------------------
// Cloudflare R2 client (S3-compatible API)
//
// Required env vars on Railway:
//   R2_ACCOUNT_ID
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET_NAME
//   PRIVATE_OBJECT_DIR        e.g. "/private"
//   PUBLIC_OBJECT_SEARCH_PATHS  e.g. "/public"
// (PRIVATE_OBJECT_DIR / PUBLIC_OBJECT_SEARCH_PATHS are just key PREFIXES
//  inside the single R2_BUCKET_NAME bucket — they no longer need a leading
//  "/bucket-name" segment like the old Replit/GCS paths did.)
// ---------------------------------------------------------------------------

function requiredEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`${name} not set. Add it in Railway → Variables.`);
  }
  return val;
}

export const objectStorageClient = new S3Client({
  region: "auto",
  endpoint: `https://${requiredEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
  },
});

const BUCKET_NAME = requiredEnv("R2_BUCKET_NAME");

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// Lightweight stand-in for the GCS "File" object, used so objectAcl.ts
// (and anything else referencing `File`) keeps working with minimal changes.
export interface StorageFile {
  bucket: string;
  key: string;
  // mimic the bits of the GCS File API that objectAcl.ts uses
  exists(): Promise<[boolean]>;
  getMetadata(): Promise<[{ contentType?: string; size?: number; metadata?: Record<string, string> }]>;
  setMetadata(opts: { metadata: Record<string, string> }): Promise<void>;
  get name(): string;
}

function makeStorageFile(bucket: string, key: string): StorageFile {
  return {
    bucket,
    key,
    get name() {
      return key;
    },
    async exists() {
      try {
        await objectStorageClient.send(
          new HeadObjectCommand({ Bucket: bucket, Key: key })
        );
        return [true];
      } catch {
        return [false];
      }
    },
    async getMetadata() {
      const head = await objectStorageClient.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key })
      );
      return [
        {
          contentType: head.ContentType,
          size: head.ContentLength,
          metadata: head.Metadata || {},
        },
      ];
    },
    async setMetadata({ metadata }) {
      // S3/R2 requires a self-copy to update metadata on an existing object.
      const head = await objectStorageClient.send(
        new HeadObjectCommand({ Bucket: bucket, Key: key })
      );
      await objectStorageClient.send(
        new CopyObjectCommand({
          Bucket: bucket,
          Key: key,
          CopySource: `${bucket}/${key}`,
          ContentType: head.ContentType,
          Metadata: { ...(head.Metadata || {}), ...metadata },
          MetadataDirective: "REPLACE",
        })
      );
    },
  };
}

export class ObjectStorageService {
  constructor() {}

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Set it on Railway (comma-separated key prefixes, e.g. /public)."
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set it on Railway (a key prefix, e.g. /private)."
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<StorageFile | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const key = stripLeadingSlash(`${searchPath}/${filePath}`);
      const file = makeStorageFile(BUCKET_NAME, key);
      const [exists] = await file.exists();
      if (exists) return file;
    }
    return null;
  }

  async downloadObject(file: StorageFile, cacheTtlSec: number = 3600): Promise<Response> {
    const [metadata] = await file.getMetadata();
    const aclPolicy = await getObjectAclPolicy(file as any);
    const isPublic = aclPolicy?.visibility === "public";

    const obj = await objectStorageClient.send(
      new GetObjectCommand({ Bucket: file.bucket, Key: file.key })
    );

    const webStream = obj.Body
      ? (Readable.toWeb(obj.Body as Readable) as ReadableStream)
      : undefined;

    const headers: Record<string, string> = {
      "Content-Type": (metadata.contentType as string) || "application/octet-stream",
      "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`,
    };
    if (metadata.size) {
      headers["Content-Length"] = String(metadata.size);
    }

    return new Response(webStream as any, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const key = stripLeadingSlash(`${privateObjectDir}/uploads/${objectId}`);

    const command = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const signedUrl = await getSignedUrl(objectStorageClient, command, {
      expiresIn: 900,
    });
    return signedUrl;
  }

  async getObjectEntityFile(objectPath: string): Promise<StorageFile> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join("/");
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith("/")) entityDir = `${entityDir}/`;
    const key = stripLeadingSlash(`${entityDir}${entityId}`);

    const file = makeStorageFile(BUCKET_NAME, key);
    const [exists] = await file.exists();
    if (!exists) throw new ObjectNotFoundError();
    return file;
  }

  /**
   * Converts a presigned R2 upload URL into our internal "/objects/..." path.
   */
  normalizeObjectEntityPath(rawPath: string): string {
    let url: URL;
    try {
      url = new URL(rawPath);
    } catch {
      return rawPath;
    }

    // Only normalize URLs that point at our R2 endpoint.
    if (!url.hostname.endsWith(".r2.cloudflarestorage.com")) {
      return rawPath;
    }

    // Pathname looks like /<bucket>/<key...> OR just /<key...> depending on
    // path-style vs virtual-hosted-style addressing; handle both.
    let rawObjectPath = url.pathname;
    if (rawObjectPath.startsWith(`/${BUCKET_NAME}/`)) {
      rawObjectPath = rawObjectPath.slice(BUCKET_NAME.length + 1);
    }

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith("/")) objectEntityDir = `${objectEntityDir}/`;
    objectEntityDir = stripLeadingSlash(objectEntityDir);

    const normalized = stripLeadingSlash(rawObjectPath);
    if (!normalized.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = normalized.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(objectFile as any, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StorageFile;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    return canAccessObject({
      userId,
      objectFile: objectFile as any,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
}

function stripLeadingSlash(s: string): string {
  return s.startsWith("/") ? s.slice(1) : s;
}
