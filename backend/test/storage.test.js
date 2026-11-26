const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";

const { retryTransientStorageRequest } = require("../src/storage");

test("transient storage errors are retried once", async () => {
  let attempts = 0;
  const result = await retryTransientStorageRequest(async () => {
    attempts += 1;
    if (attempts === 1)
      return { data: null, error: { status: 544, statusCode: "544" } };
    return { data: { signedUrl: "https://example.com/image" }, error: null };
  });

  assert.equal(attempts, 2);
  assert.equal(result.data.signedUrl, "https://example.com/image");
});

test("permanent storage errors are not retried", async () => {
  let attempts = 0;
  const error = { status: 404 };
  const result = await retryTransientStorageRequest(async () => {
    attempts += 1;
    return { data: null, error };
  });

  assert.equal(attempts, 1);
  assert.equal(result.error, error);
});

test("storage errors without a transient status are not retried", async () => {
  let attempts = 0;
  const error = { message: "Invalid request." };
  const result = await retryTransientStorageRequest(async () => {
    attempts += 1;
    return { data: null, error };
  });

  assert.equal(attempts, 1);
  assert.equal(result.error, error);
});

test("a repeated transient storage error is returned", async () => {
  let attempts = 0;
  const error = { status: 544 };
  const result = await retryTransientStorageRequest(async () => {
    attempts += 1;
    return { data: null, error };
  });

  assert.equal(attempts, 2);
  assert.equal(result.error, error);
});

test("signed image URLs are reused until they approach expiration", async () => {
  const supabase = require("../src/supabase");
  const { resolveImage } = require("../src/storage");
  const originalFrom = supabase.storage.from;
  const signedUrl = "https://example.com/cached-image";
  let requests = 0;
  supabase.storage.from = () => ({
    createSignedUrl: async () => {
      requests += 1;
      return { data: { signedUrl }, error: null };
    },
  });

  try {
    const first = await resolveImage("test-cache", "estate/photo.jpg");
    const second = await resolveImage("test-cache", "estate/photo.jpg");

    assert.equal(first, signedUrl);
    assert.equal(second, signedUrl);
    assert.equal(requests, 1);
  } finally {
    supabase.storage.from = originalFrom;
  }
});
