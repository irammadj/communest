const crypto = require("node:crypto");
const supabase = require("./supabase");

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

const resolveImage = async (bucket, path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);
  if (error) {
    if (/not found|object not found|no such object/i.test(error.message)) {
      console.warn(`Storage object not found: ${bucket}/${path}`);
      return null;
    }
    throw error;
  }
  return data.signedUrl;
};

const removeImage = async (bucket, path) => {
  if (!path || /^https?:\/\//i.test(path)) return;
  await supabase.storage.from(bucket).remove([path]);
};

module.exports = { uploadImage, resolveImage, removeImage };
