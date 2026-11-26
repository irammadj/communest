const crypto = require("node:crypto");
const supabase = require("./supabase");
const signedUrlCache = new Map();
const signedUrlLifetime = 60 * 60 * 1000;
const signedUrlRefreshWindow = 5 * 60 * 1000;

const uploadImage = async (bucket, folder, file) => {
  const extension = file.originalname.includes(".")
    ? `.${file.originalname.split(".").pop().toLowerCase()}`
    : "";
  const path = `${folder}/${crypto.randomUUID()}${extension}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
  if (error) throw error;
  return path;
};

const retryTransientStorageRequest = async (operation) => {
  let result;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    result = await operation();
    const status = Number(result.error?.status ?? result.error?.statusCode);
    const retryable = status === 429 || (status >= 500 && status <= 599);
    if (!result.error || !retryable || attempt === 1) return result;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return result;
};

const resolveImage = async (bucket, path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const cacheKey = `${bucket}/${path}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.url;

  const { data, error } = await retryTransientStorageRequest(() =>
    supabase.storage.from(bucket).createSignedUrl(path, 60 * 60),
  );
  if (error) {
    if (/not found|object not found|no such object/i.test(error.message)) {
      console.warn(`Storage object not found: ${bucket}/${path}`);
      return null;
    }
    throw error;
  }
  signedUrlCache.set(cacheKey, {
    url: data.signedUrl,
    expiresAt: Date.now() + signedUrlLifetime - signedUrlRefreshWindow,
  });
  return data.signedUrl;
};

const removeImage = async (bucket, path) => {
  if (!path || /^https?:\/\//i.test(path)) return;
  await supabase.storage.from(bucket).remove([path]);
};

module.exports = {
  uploadImage,
  resolveImage,
  removeImage,
  retryTransientStorageRequest,
};
