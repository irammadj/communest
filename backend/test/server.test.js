const assert = require("node:assert/strict");
const http = require("node:http");
const { test, after } = require("node:test");

process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-service-role-key";

const supabase = require("../src/supabase");
const supabaseAuth = require("../src/supabaseAuth");
const { validContactEmail, validPhone } = require("../src/validation");
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

test("estate management email accepts a valid company domain", () => {
  assert.equal(validContactEmail("leasing@company.org"), true);
  assert.equal(validContactEmail("invalid-address"), false);
  assert.equal(validContactEmail("contact@company"), false);
  assert.equal(validPhone("+254712345678"), true);
  assert.equal(validPhone("+2540712345678"), false);
});

test("estate submission leaves the owner as a regular user while pending", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalFrom = supabase.from;
  const originalStorageFrom = supabase.storage.from;
  let insertedEstate;
  const profileUpdates = [];

  supabase.auth.getUser = async () => ({
    data: { user: { id: "submitter-id" } },
    error: null,
  });
  supabase.from = (table) => {
    let insertedValues;
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      limit() {
        return query;
      },
      insert(values) {
        insertedValues = values;
        insertedEstate = values;
        return query;
      },
      update(values) {
        if (table === "profiles") profileUpdates.push(values);
        return query;
      },
      async maybeSingle() {
        return { data: null, error: null };
      },
      async single() {
        if (table === "profiles")
          return {
            data: {
              id: "submitter-id",
              role: "regular_user",
              estate_id: null,
            },
            error: null,
          };
        return {
          data: { id: "estate-id", ...insertedValues },
          error: null,
        };
      },
    };
    return query;
  };
  supabase.storage.from = (bucket) => ({
    async upload() {
      return { error: null };
    },
    async createSignedUrl(path) {
      return {
        data: { signedUrl: `https://storage.example/${bucket}/${path}` },
        error: null,
      };
    },
  });

  try {
    const form = new FormData();
    form.set("name", "Test Estate");
    form.set("location", "Kilimani");
    form.set("county", "Nairobi");
    form.set("units", "2");
    form.set("totalArea", "100");
    form.set("managementName", "Test Managers");
    form.set("managementEmail", "office@example.org");
    form.set("managementPhone", "+254712345678");
    form.set("titleDeedNumber", "TD-001");
    form.set(
      "estatePhoto",
      new Blob(["test image"], { type: "image/png" }),
      "estate.png",
    );
    const response = await fetch(`${baseUrl()}/api/estates`, {
      method: "POST",
      headers: { Authorization: "Bearer test-token" },
      body: form,
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.status, "pending");
    assert.equal(insertedEstate.admin_id, "submitter-id");
    assert.deepEqual(profileUpdates, []);
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
    supabase.storage.from = originalStorageFrom;
  }
});

test("Communest Admin approval promotes the estate submitter", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalFrom = supabase.from;
  const profileUpdates = [];
  let estateStatus = "pending";

  supabase.auth.getUser = async () => ({
    data: { user: { id: "communest-admin-id" } },
    error: null,
  });
  supabase.from = (table) => {
    let updateValues;
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      update(values) {
        updateValues = values;
        if (table === "profiles") profileUpdates.push(values);
        if (table === "estates") estateStatus = values.status;
        return query;
      },
      async single() {
        return {
          data: {
            id: "communest-admin-id",
            role: "communest_admin",
            estate_id: null,
          },
          error: null,
        };
      },
      async maybeSingle() {
        if (table === "estates")
          return {
            data: {
              id: "estate-id",
              admin_id: "submitter-id",
              status: estateStatus,
              estate_photo: null,
              amenity_photos: [],
            },
            error: null,
          };
        return { data: { id: "submitter-id" }, error: null };
      },
    };
    return query;
  };

  try {
    const response = await request("/api/estates/estate-id/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(profileUpdates, [
      { role: "estate_admin", estate_id: "estate-id" },
    ]);
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
  }
});

test("denying an estate keeps its submitter regular and resets prior premature access", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalFrom = supabase.from;
  const profileUpdates = [];
  let estateStatus = "pending";

  supabase.auth.getUser = async () => ({
    data: { user: { id: "communest-admin-id" } },
    error: null,
  });
  supabase.from = (table) => {
    let updateValues;
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      update(values) {
        updateValues = values;
        if (table === "profiles") profileUpdates.push(values);
        if (table === "estates") estateStatus = values.status;
        return query;
      },
      async single() {
        return {
          data: {
            id: "communest-admin-id",
            role: "communest_admin",
            estate_id: null,
          },
          error: null,
        };
      },
      async maybeSingle() {
        if (table === "estates")
          return {
            data: {
              id: "estate-id",
              admin_id: "submitter-id",
              status: estateStatus,
              estate_photo: null,
              amenity_photos: [],
            },
            error: null,
          };
        return { data: null, error: null };
      },
      then(resolve, reject) {
        return Promise.resolve({ error: null }).then(resolve, reject);
      },
    };
    return query;
  };

  try {
    const response = await request("/api/estates/estate-id/status", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "denied" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(profileUpdates, [
      { role: "regular_user", estate_id: null },
    ]);
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
  }
});

test("profile estate submissions only return the signed-in user's records", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalFrom = supabase.from;

  supabase.auth.getUser = async () => ({
    data: { user: { id: "submitter-id" } },
    error: null,
  });
  supabase.from = (table) => {
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      async single() {
        return {
          data: { id: "submitter-id", role: "regular_user" },
          error: null,
        };
      },
      async order() {
        assert.equal(table, "estates");
        return {
          data: [
            {
              id: "estate-id",
              name: "Test Estate",
              status: "denied",
              submitted_at: "2026-11-26T00:00:00.000Z",
            },
          ],
          error: null,
        };
      },
    };
    return query;
  };

  try {
    const response = await request("/api/profile/estate-submissions", {
      headers: { Authorization: "Bearer test-token" },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, [
      {
        id: "estate-id",
        name: "Test Estate",
        status: "denied",
        submittedAt: "2026-11-26T00:00:00.000Z",
      },
    ]);
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
  }
});

test("rental applications require a signed-in account", async () => {
  const response = await request("/api/proposals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estateId: "estate-id", houseId: "house-id" }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, {
    message: "Unauthorized.",
  });
});

test("rental applications use the signed-in user's profile details", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalFrom = supabase.from;
  let insertedProposal;

  supabase.auth.getUser = async () => ({
    data: { user: { id: "regular-user-id" } },
    error: null,
  });
  supabase.from = (table) => {
    let insertValues;
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      insert(values) {
        insertValues = values;
        insertedProposal = values;
        return query;
      },
      async single() {
        if (table === "profiles")
          return {
            data: {
              id: "regular-user-id",
              name: "Registered Tenant",
              email: "registered.user@gmail.com",
              phone: "+254700000000",
              role: "regular_user",
            },
            error: null,
          };
        if (table === "houses")
          return {
            data: { id: "house-id", estate_id: "estate-id", status: "vacant" },
            error: null,
          };
        return {
          data: {
            id: "proposal-id",
            ...insertValues,
            submitted_at: "2026-11-26T00:00:00.000Z",
          },
          error: null,
        };
      },
      async maybeSingle() {
        return { data: null, error: null };
      },
    };
    return query;
  };

  try {
    const response = await request("/api/proposals", {
      method: "POST",
      headers: {
        Authorization: "Bearer test-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        estateId: "estate-id",
        houseId: "house-id",
        name: "Spoofed Name",
        email: "someone.else@gmail.com",
        phone: "+254711111111",
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(insertedProposal, {
      estate_id: "estate-id",
      house_id: "house-id",
      name: "Registered Tenant",
      email: "registered.user@gmail.com",
      phone: "+254700000000",
      status: "pending",
    });
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.from = originalFrom;
  }
});

test("registration creates a profile even when no signup trigger is present", async () => {
  const originalCreateUser = supabase.auth.admin.createUser;
  const originalFrom = supabase.from;
  let createdProfile;

  supabase.auth.admin.createUser = async () => ({
    data: { user: { id: "created-user-id" } },
    error: null,
  });
  supabase.from = (table) => {
    assert.equal(table, "profiles");
    return {
      async upsert(values, options) {
        createdProfile = { values, options };
        return { error: null };
      },
    };
  };

  try {
    const response = await request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Taylor Demo",
        email: "taylor.demo@gmail.com",
        phone: "+254700000000",
        password: "TestPassword123!",
      }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(createdProfile, {
      values: {
        id: "created-user-id",
        name: "Taylor Demo",
        email: "taylor.demo@gmail.com",
        phone: "+254700000000",
        role: "regular_user",
      },
      options: { onConflict: "id" },
    });
  } finally {
    supabase.auth.admin.createUser = originalCreateUser;
    supabase.from = originalFrom;
  }
});

test("login restores a missing profile from the authenticated user's metadata", async () => {
  const originalSignIn = supabaseAuth.auth.signInWithPassword;
  const originalFrom = supabase.from;
  let restoredProfile;

  supabaseAuth.auth.signInWithPassword = async () => ({
    data: {
      user: {
        id: "orphaned-user-id",
        email: "orphaned.user@gmail.com",
        user_metadata: {
          name: "Orphaned User",
          phone: "+254700000001",
        },
      },
      session: { access_token: "restored-access-token" },
    },
    error: null,
  });
  supabase.from = (table) => {
    assert.equal(table, "profiles");
    const query = {
      select() {
        return query;
      },
      eq() {
        return query;
      },
      async maybeSingle() {
        return { data: null, error: null };
      },
      upsert(values, options) {
        restoredProfile = { ...values, options };
        return query;
      },
      async single() {
        return { data: restoredProfile, error: null };
      },
    };
    return query;
  };

  try {
    const response = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "orphaned.user@gmail.com",
        password: "TestPassword123!",
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.user.id, "orphaned-user-id");
    assert.equal(response.body.user.role, "regular_user");
    assert.deepEqual(restoredProfile, {
      id: "orphaned-user-id",
      name: "Orphaned User",
      email: "orphaned.user@gmail.com",
      phone: "+254700000001",
      role: "regular_user",
      options: { onConflict: "id" },
    });
  } finally {
    supabaseAuth.auth.signInWithPassword = originalSignIn;
    supabase.from = originalFrom;
  }
});

test("login uses an auth client separate from service-role database queries", async () => {
  const originalSignIn = supabaseAuth.auth.signInWithPassword;
  const originalServiceSignIn = supabase.auth.signInWithPassword;
  const originalFrom = supabase.from;

  supabaseAuth.auth.signInWithPassword = async () => ({
    data: {
      user: { id: "test-user-id" },
      session: { access_token: "test-access-token" },
    },
    error: null,
  });
  supabase.auth.signInWithPassword = async () => {
    throw new Error("The service-role client must not sign in users.");
  };
  supabase.from = (table) => {
    assert.equal(table, "profiles");
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      async maybeSingle() {
        return {
          data: {
            id: "test-user-id",
            name: "Test User",
            email: "test.user@gmail.com",
            phone: "+254700000000",
            role: "regular_user",
            email_verified: false,
            phone_verified: false,
          },
          error: null,
        };
      },
    };
  };

  try {
    const response = await request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test.user@gmail.com",
        password: "TestPassword123!",
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.token, "test-access-token");
    assert.equal(response.body.user.id, "test-user-id");
  } finally {
    supabaseAuth.auth.signInWithPassword = originalSignIn;
    supabase.auth.signInWithPassword = originalServiceSignIn;
    supabase.from = originalFrom;
  }
});

test("account deletion removes the auth user and leaves profile cleanup to cascade", async () => {
  const originalGetUser = supabase.auth.getUser;
  const originalDeleteUser = supabase.auth.admin.deleteUser;
  const originalFrom = supabase.from;
  const deletedIds = [];
  let profileDeleteRequested = false;

  supabase.auth.getUser = async () => ({
    data: { user: { id: "test-user-id" } },
    error: null,
  });
  supabase.auth.admin.deleteUser = async (id) => {
    deletedIds.push(id);
    return { data: { user: { id } }, error: null };
  };
  supabase.from = (table) => {
    assert.equal(table, "profiles");
    return {
      select() {
        return this;
      },
      eq() {
        return this;
      },
      async single() {
        return {
          data: { id: "test-user-id", role: "regular_user" },
          error: null,
        };
      },
      delete() {
        profileDeleteRequested = true;
        return this;
      },
    };
  };

  try {
    const response = await request("/api/profile", {
      method: "DELETE",
      headers: { Authorization: "Bearer test-token" },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(deletedIds, ["test-user-id"]);
    assert.equal(profileDeleteRequested, false);
  } finally {
    supabase.auth.getUser = originalGetUser;
    supabase.auth.admin.deleteUser = originalDeleteUser;
    supabase.from = originalFrom;
  }
});

after(() => server.close());
