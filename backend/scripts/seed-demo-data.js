const { createClient } = require("@supabase/supabase-js");
const supabase = require("../src/supabase");
const app = require("../src");
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const seedTag = "communest-demo-v1";
const demoPasswords = {
  communest_admin: process.env.DEMO_PASSWORD_COMMUNEST_ADMIN,
  regular_user: process.env.DEMO_PASSWORD_REGULAR_USER,
  estate_admin: process.env.DEMO_PASSWORD_ESTATE_ADMIN,
  tenant: process.env.DEMO_PASSWORD_TENANT,
};

const estates = [
  {
    name: "Acacia Ridge Homes",
    location: "Kilimani",
    county: "Nairobi",
    units: 48,
    totalArea: 4200,
    description:
      "A secure, landscaped community close to Nairobi's business district.",
    managementName: "Amani Property Co",
    titleDeedNumber: "DEMO-NRB-2026-001",
    managerPhone: "+254700000902",
    admin: {
      name: "Amani Wanjiku",
      email: "demo.estate.acacia+nov26@gmail.com",
      phone: "+254700000902",
    },
    photo:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&h=900&fit=crop&auto=format",
    amenityPhotos: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&h=600&fit=crop&auto=format",
    ],
    houses: [
      { number: "A-01", area: 68, rooms: 2, rent: 28000 },
      { number: "A-02", area: 92, rooms: 3, rent: 42000 },
      { number: "A-03", area: 54, rooms: 1, rent: 19000 },
    ],
    tenants: [
      {
        name: "Nia Mwangi",
        email: "demo.tenant.acacia1+nov26@gmail.com",
        phone: "+254700000911",
        houseNumber: "A-01",
      },
      {
        name: "Brian Otieno",
        email: "demo.tenant.acacia2+nov26@gmail.com",
        phone: "+254700000912",
        houseNumber: "A-02",
      },
    ],
  },
  {
    name: "Savannah Court",
    location: "Nyali",
    county: "Mombasa",
    units: 36,
    totalArea: 3100,
    description:
      "Coastal apartments with secure parking and shared outdoor spaces.",
    managementName: "Pamoja Living",
    titleDeedNumber: "DEMO-MSA-2026-002",
    managerPhone: "+254700000903",
    admin: {
      name: "Juma Hassan",
      email: "demo.estate.savannah+nov26@gmail.com",
      phone: "+254700000903",
    },
    photo:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&h=900&fit=crop&auto=format",
    amenityPhotos: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&h=600&fit=crop&auto=format",
    ],
    houses: [
      { number: "S-01", area: 72, rooms: 2, rent: 32000 },
      { number: "S-02", area: 96, rooms: 3, rent: 48000 },
      { number: "S-03", area: 58, rooms: 1, rent: 22000 },
    ],
    tenants: [
      {
        name: "Amina Said",
        email: "demo.tenant.savannah1+nov26@gmail.com",
        phone: "+254700000913",
        houseNumber: "S-01",
      },
      {
        name: "Kevin Maina",
        email: "demo.tenant.savannah2+nov26@gmail.com",
        phone: "+254700000914",
        houseNumber: "S-02",
      },
    ],
  },
  {
    name: "Lakeview Gardens",
    location: "Milimani",
    county: "Kisumu",
    units: 42,
    totalArea: 3650,
    description:
      "Family-friendly homes with lake breezes, reliable water, and 24-hour security.",
    managementName: "Lake Homes Ltd",
    titleDeedNumber: "DEMO-KSM-2026-003",
    managerPhone: "+254700000904",
    admin: {
      name: "Grace Achieng",
      email: "demo.estate.lakeview+nov26@gmail.com",
      phone: "+254700000904",
    },
    photo:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&h=900&fit=crop&auto=format",
    amenityPhotos: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=900&h=600&fit=crop&auto=format",
    ],
    houses: [
      { number: "L-01", area: 70, rooms: 2, rent: 26000 },
      { number: "L-02", area: 98, rooms: 3, rent: 39000 },
      { number: "L-03", area: 55, rooms: 1, rent: 18000 },
    ],
    tenants: [
      {
        name: "Faith Ouma",
        email: "demo.tenant.lakeview1+nov26@gmail.com",
        phone: "+254700000915",
        houseNumber: "L-01",
      },
      {
        name: "Daniel Kiptoo",
        email: "demo.tenant.lakeview2+nov26@gmail.com",
        phone: "+254700000916",
        houseNumber: "L-02",
      },
    ],
  },
];

const standaloneUsers = [
  {
    name: "Demo Communest Admin",
    email: "demo.communest.admin+nov26@gmail.com",
    phone: "+254700000901",
    role: "communest_admin",
  },
  {
    name: "Taylor Demo",
    email: "demo.regular.user+nov26@gmail.com",
    phone: "+254700000917",
    role: "regular_user",
  },
];

const allUsers = [
  ...standaloneUsers,
  ...estates.flatMap((estate) => [
    { ...estate.admin, role: "estate_admin" },
    ...estate.tenants.map((tenant) => ({ ...tenant, role: "tenant" })),
  ]),
];

const assertNoError = (error, operation) => {
  if (error) throw new Error(`${operation}: ${error.message}`);
};

async function listAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    assertNoError(error, "Unable to inspect existing Auth users");
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

async function ensureDemoUser(account, authUsers) {
  const password = demoPasswords[account.role];
  const userMetadata = {
    name: account.name,
    phone: account.phone,
    demo_seed: seedTag,
  };
  const existing = authUsers.find(
    (user) => user.email?.toLowerCase() === account.email.toLowerCase(),
  );
  let user;

  if (existing) {
    if (existing.user_metadata?.demo_seed !== seedTag)
      throw new Error(
        `Refusing to overwrite an existing account: ${account.email}`,
      );
    const { data, error } = await supabase.auth.admin.updateUserById(
      existing.id,
      { password, email_confirm: true, user_metadata: userMetadata },
    );
    assertNoError(error, `Unable to refresh demo user ${account.email}`);
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    assertNoError(error, `Unable to create demo user ${account.email}`);
    user = data.user;
    authUsers.push(user);
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: "regular_user",
      email_verified: false,
      phone_verified: false,
      estate_id: null,
    },
    { onConflict: "id" },
  );
  assertNoError(error, `Unable to prepare profile ${account.email}`);
  return { ...account, id: user.id };
}

async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  assertNoError(error, "Unable to update a demo profile");
}

async function findOrCreateEstate(estate, adminId) {
  const values = {
    name: estate.name,
    location: estate.location,
    county: estate.county,
    units: estate.units,
    total_area: estate.totalArea,
    description: estate.description,
    management_name: estate.managementName,
    management_email: estate.admin.email,
    management_phone: estate.managerPhone,
    title_deed_number: estate.titleDeedNumber,
    estate_photo: estate.photo,
    amenity_photos: estate.amenityPhotos,
    status: "pending",
    admin_id: adminId,
    submitted_at: new Date().toISOString(),
  };
  const { data: existing, error: lookupError } = await supabase
    .from("estates")
    .select("id")
    .eq("admin_id", adminId)
    .eq("name", estate.name)
    .maybeSingle();
  assertNoError(lookupError, `Unable to find ${estate.name}`);

  if (!existing) {
    const { data, error } = await supabase
      .from("estates")
      .insert(values)
      .select("id")
      .single();
    assertNoError(error, `Unable to prepare ${estate.name}`);
    return data.id;
  }

  const { error } = await supabase
    .from("estates")
    .update(values)
    .eq("id", existing.id);
  assertNoError(error, `Unable to reset ${estate.name}`);
  return existing.id;
}

async function requestApi(baseUrl, path, { token, method = "GET", body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      `${method} ${path} failed (${response.status}): ${result?.message ?? "Unknown error"}`,
    );
  return result;
}

async function signIn(email) {
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password: demoPasswords[
      allUsers.find((account) => account.email === email)?.role
    ],
  });
  assertNoError(error, `Unable to sign in demo user ${email}`);
  if (!data.session) throw new Error(`No session returned for ${email}`);
  return data.session.access_token;
}

async function ensureHouse(baseUrl, estate, house, estateId, token) {
  const { data: existing, error } = await supabase
    .from("houses")
    .select("id")
    .eq("estate_id", estateId)
    .eq("house_number", house.number)
    .maybeSingle();
  assertNoError(error, `Unable to find unit ${house.number}`);

  if (existing) {
    const { error: updateError } = await supabase
      .from("houses")
      .update({
        status: "vacant",
        occupied_at: null,
        tenant_name: null,
        payment_status: null,
      })
      .eq("id", existing.id);
    assertNoError(updateError, `Unable to reset unit ${house.number}`);
    return existing.id;
  }

  const created = await requestApi(
    baseUrl,
    `/estates/${estateId}/houses`,
    {
      token,
      method: "POST",
      body: {
        houseNumber: house.number,
        totalArea: house.area,
        rooms: house.rooms,
        photos: [],
        amenities: ["24-hour security", "Water"],
        rentAmount: house.rent,
        managerPhone: estate.managerPhone,
      },
    },
  );
  return created.id;
}

async function ensureProposal(
  baseUrl,
  estateId,
  houseId,
  tenant,
  estateAdminToken,
) {
  const { data: existing, error } = await supabase
    .from("proposals")
    .select("id")
    .eq("estate_id", estateId)
    .eq("email", tenant.email)
    .maybeSingle();
  assertNoError(error, `Unable to find application for ${tenant.email}`);

  let proposalId;
  if (existing) {
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ house_id: houseId, status: "pending" })
      .eq("id", existing.id);
    assertNoError(updateError, `Unable to reset application for ${tenant.email}`);
    proposalId = existing.id;
  } else {
    const created = await requestApi(baseUrl, "/proposals", {
      token: await signIn(tenant.email),
      method: "POST",
      body: { estateId, houseId },
    });
    proposalId = created.proposalId;
  }

  await requestApi(baseUrl, `/proposals/${proposalId}/status`, {
    token: estateAdminToken,
    method: "PATCH",
    body: { status: "approved" },
  });
}

async function ensureInquiry(baseUrl, estateId, tenant, houseId) {
  const message = `Demo inquiry from ${tenant.name}: please share details about the next viewing.`;
  const { data: existing, error } = await supabase
    .from("inquiries")
    .select("id")
    .eq("estate_id", estateId)
    .eq("tenant_id", tenant.id)
    .eq("message", message)
    .maybeSingle();
  assertNoError(error, `Unable to find inquiry for ${tenant.email}`);
  if (existing) return;

  const tenantToken = await signIn(tenant.email);
  await requestApi(baseUrl, `/estates/${estateId}/inquiries`, {
    token: tenantToken,
    method: "POST",
    body: { houseId, message },
  });
}

async function startApi() {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return {
    server,
    baseUrl: `http://127.0.0.1:${server.address().port}/api`,
  };
}

async function seed() {
  if (process.env.DEMO_SEED_CONFIRM !== "YES")
    throw new Error("Set DEMO_SEED_CONFIRM=YES to seed the configured project.");
  if (process.env.NODE_ENV === "production")
    throw new Error("Demo seeding is disabled when NODE_ENV=production.");
  if (Object.values(demoPasswords).some((password) => !password))
    throw new Error("Set all role-specific demo passwords before seeding.");

  const authUsers = await listAuthUsers();
  const users = new Map();
  for (const account of allUsers)
    users.set(account.email, await ensureDemoUser(account, authUsers));

  const communestAdmin = users.get(standaloneUsers[0].email);
  const regularUser = users.get(standaloneUsers[1].email);
  await updateProfile(communestAdmin.id, { role: "communest_admin" });

  const { server, baseUrl } = await startApi();
  try {
    const communestAdminToken = await signIn(communestAdmin.email);

    for (const estate of estates) {
      const estateAdmin = users.get(estate.admin.email);
      const estateId = await findOrCreateEstate(estate, estateAdmin.id);
      await updateProfile(estateAdmin.id, {
        role: "estate_admin",
        estate_id: estateId,
      });

      const estateAdminToken = await signIn(estateAdmin.email);
      await requestApi(baseUrl, `/estates/${estateId}/status`, {
        token: communestAdminToken,
        method: "PATCH",
        body: { status: "approved" },
      });

      const houses = new Map();
      for (const house of estate.houses)
        houses.set(
          house.number,
          await ensureHouse(
            baseUrl,
            estate,
            house,
            estateId,
            estateAdminToken,
          ),
        );

      for (const tenantRecord of estate.tenants) {
        const tenant = users.get(tenantRecord.email);
        const houseId = houses.get(tenantRecord.houseNumber);
        await ensureProposal(
          baseUrl,
          estateId,
          houseId,
          tenant,
          estateAdminToken,
        );
        await ensureInquiry(baseUrl, estateId, tenant, houseId);
      }
    }

    console.log(
      JSON.stringify(
        {
          estates: estates.map((estate) => ({
            name: estate.name,
            status: "approved",
            estateAdmin: estate.admin.email,
            tenants: estate.tenants.map((tenant) => tenant.email),
            vacantUnits: 1,
          })),
          users: allUsers.map(({ email, role }) => ({ email, role })),
          passwords: demoPasswords,
        },
        null,
        2,
      ),
    );
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
