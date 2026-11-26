const assert = require("node:assert/strict");
const http = require("node:http");
const { test, after } = require("node:test");

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";

const app = require("../src/index");
const server = app.listen(0);
const baseUrl = () => `http://127.0.0.1:${server.address().port}`;

const request = (path, options = {}) =>
  new Promise((resolve, reject) => {
    const request = http.request(`${baseUrl()}${path}`, options, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () =>
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: body ? JSON.parse(body) : null,
        }),
      );
    });
    request.on("error", reject);
    if (options.body) request.write(options.body);
    request.end();
  });

test("health endpoint reports the API is running", async () => {
  const response = await request("/health");
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: "ok" });
});

test("LAN frontend origins can make API preflight requests in development", async () => {
  const response = await request("/api/auth/login", {
    method: "OPTIONS",
    headers: {
      Origin: "http://192.168.0.12:8443",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://192.168.0.12:8443",
  );
});

test("unknown routes return the standard error shape", async () => {
  const response = await request("/not-a-route");
  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { message: "Route not found." });
});

test("malformed JSON returns a validation error", async () => {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    message: "Request body must be valid JSON.",
  });
});

after(() => server.close());
