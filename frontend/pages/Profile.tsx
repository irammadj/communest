import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useUser } from "../context/UserContext";
import { profile as profileApi, estates as estatesApi } from "../api";
import { houses as housesApi } from "../api";
import type { EstateDTO, HouseDTO } from "../api";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  communest_admin: { label: "Communest Admin", cls: "badge badge-blue" },
  estate_admin: { label: "Estate Admin", cls: "badge badge-green" },
  tenant: { label: "Tenant", cls: "badge badge-yellow" },
  regular_user: { label: "Regular User", cls: "badge badge-gray" },
};

const CAN_DELETE = ["tenant", "regular_user"];
const ROLE_DESCRIPTION: Record<string, string> = {
  communest_admin: "Full platform access — manage all estates and users.",
  estate_admin: "Manage your estate, units, and tenant communications.",
  tenant: "View your unit, request maintenance, and message management.",
  regular_user: "Browse and apply for available estates.",
};

function CardIcon({ type }: { type: "user" | "home" | "admin" | "trash" }) {
  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    admin: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0 1 14 0M19 8h3M20.5 6.5v3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v5M14 11v5" />
        <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {paths[type]}
    </svg>
  );
}

function CardHeading({
  type,
  children,
  danger = false,
}: {
  type: "user" | "home" | "admin" | "trash";
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <h2
      className="text-base font-semibold mb-4 flex items-center gap-2"
      style={{ color: danger ? "var(--danger)" : "var(--foreground)" }}
    >
      <CardIcon type={type} />
      {children}
    </h2>
  );
}

export default function Profile() {
  const { user, token, setUser, logout } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminMsg, setAddAdminMsg] = useState("");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    user?.profilePicture ?? null,
  );
  const [estate, setEstate] = useState<EstateDTO | null>(null);
  const [estateHouses, setEstateHouses] = useState<HouseDTO[]>([]);
  const [coAdmins, setCoAdmins] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [estateLoading, setEstateLoading] = useState(false);
  const [estateError, setEstateError] = useState(false);
  const estateId = user?.estateId;
  const role = user?.role;

  useEffect(() => {
    if (
      !token ||
      !estateId ||
      !role ||
      !["tenant", "estate_admin"].includes(role)
    )
      return;
    let active = true;
    setEstateLoading(true);
    setEstateError(false);
    Promise.allSettled([
      estatesApi.get(estateId),
      housesApi.list(estateId),
      ...(role === "estate_admin" ? [estatesApi.admins(token, estateId)] : []),
    ]).then(([estateResult, housesResult, adminsResult]) => {
      if (!active) return;
      if (estateResult.status === "fulfilled") setEstate(estateResult.value);
      else setEstateError(true);
      if (housesResult.status === "fulfilled")
        setEstateHouses(housesResult.value);
      else setEstateError(true);
      if (adminsResult?.status === "fulfilled") setCoAdmins(adminsResult.value);
      setEstateLoading(false);
    });
    return () => {
      active = false;
    };
  }, [token, estateId, role]);

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
              You need to be signed in to view your profile.
            </p>
            <button
              onClick={() => navigate("/sign-in")}
              className="btn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const badge = ROLE_BADGE[user.role] ?? {
    label: "User",
    cls: "badge badge-gray",
  };
  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        new Date(user.createdAt),
      )
    : "Not available";
  const assignedHouse = estateHouses.find(
    (house) => house.tenantName === user.name,
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const updated = await profileApi.update(token, { name, phone });
      setUser({
        ...user,
        name: updated.name,
        phone: updated.phone,
        profilePicture: updated.profilePicture,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(false);
    }
  };

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicPreview(url);
      if (token) {
        profileApi
          .update(token, { profilePicture: file })
          .then((updated) => {
            setUser({ ...user, profilePicture: updated.profilePicture });
          })
          .catch(() => undefined);
      }
    }
  };

  const handleDelete = async () => {
    if (token) await profileApi.deleteAccount(token);
    await logout();
    navigate("/explore");
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAdminEmail || !token || !user.estateId) return;
    try {
      const result = await estatesApi.addAdmin(
        token,
        user.estateId,
        addAdminEmail,
      );
      setAddAdminMsg(result.message);
      setAddAdminEmail("");
      setTimeout(() => setAddAdminMsg(""), 3000);
    } catch (requestError) {
      setAddAdminMsg(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add estate admin.",
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "var(--foreground)" }}
        >
          My Profile
        </h1>

        <div className="grid md:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.6fr)] gap-6 items-start">
          <aside className="card card-static md:sticky md:top-24">
            <div className="relative flex-shrink-0 w-fit mx-auto md:mx-0 group">
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt={user.name}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover"
                  style={{
                    border: "3px solid var(--accent)",
                    boxShadow: "0 0 0 6px rgba(96,165,250,0.1)",
                  }}
                />
              ) : (
                <div
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-2xl md:text-4xl font-bold"
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    border: "3px solid var(--accent)",
                    boxShadow: "0 0 0 6px rgba(96,165,250,0.1)",
                  }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 group-hover:scale-110 group-hover:opacity-100 opacity-85"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePic}
                />
              </label>
            </div>
            <div className="mt-5 text-center md:text-left">
              <p
                className="text-xl font-bold mb-1"
                style={{ color: "var(--foreground)" }}
              >
                {user.name}
              </p>
              <span className={badge.cls}>{badge.label}</span>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                {ROLE_DESCRIPTION[user.role]}
              </p>
              <p
                className="text-xs mt-3"
                style={{ color: "var(--muted-foreground)" }}
              >
                Member since {memberSince}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {user.emailVerified && (
                  <span className="badge badge-green">Email Verified</span>
                )}
                {user.phoneVerified && (
                  <span className="badge badge-green">Phone Verified</span>
                )}
              </div>
            </div>
          </aside>

          <main>
            <form onSubmit={handleSave} className="card card-static mb-6">
              <CardHeading type="user">Personal Details</CardHeading>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="profile-name"
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={4}
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-email"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="profile-email"
                      className="input-field"
                      value={user.email}
                      readOnly
                      style={{ paddingRight: "2.5rem", cursor: "not-allowed" }}
                    />
                    <svg
                      aria-hidden="true"
                      className="absolute right-3 top-3.5"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--muted-foreground)"
                      strokeWidth="2"
                    >
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="profile-phone"
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <span
                  className={`text-sm transition-opacity duration-200 ${saved ? "opacity-100 profile-fade-in" : "opacity-0"}`}
                  aria-live="polite"
                  style={{ color: "var(--success)" }}
                >
                  Changes saved!
                </span>
              </div>
            </form>

            {/* View my estate — tenant or estate admin */}
            {(user.role === "tenant" || user.role === "estate_admin") && (
              <div className="card card-static mb-6">
                <CardHeading type="home">My Estate</CardHeading>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {user.role === "tenant"
                    ? "Navigate to your current estate."
                    : "View and manage your estate."}
                </p>
                <button
                  onClick={() => navigate("/my-estate")}
                  className="btn-primary"
                >
                  View My Estate
                </button>
              </div>
            )}

            {user.role === "tenant" && (
              <div className="card card-static mb-6">
                <CardHeading type="home">My Unit</CardHeading>
                {estateLoading && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Loading unit details...
                  </p>
                )}
                {!estateLoading && estateError && (
                  <p
                    className="text-sm"
                    aria-live="polite"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Unit details are temporarily unavailable.
                  </p>
                )}
                {!estateLoading && !estateError && !assignedHouse && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No unit assigned yet
                  </p>
                )}
                {!estateLoading && assignedHouse && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p style={{ color: "var(--muted-foreground)" }}>House</p>
                      <p className="font-semibold">
                        {assignedHouse.houseNumber}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: "var(--muted-foreground)" }}>Rooms</p>
                      <p className="font-semibold">{assignedHouse.rooms}</p>
                    </div>
                    <div>
                      <p style={{ color: "var(--muted-foreground)" }}>Rent</p>
                      <p className="font-semibold">
                        {assignedHouse.rentAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: "var(--muted-foreground)" }}>
                        Payment
                      </p>
                      <span
                        className={`badge ${assignedHouse.paymentStatus === "paid" ? "badge-green" : "badge-yellow"}`}
                      >
                        {assignedHouse.paymentStatus ?? "Pending"}
                      </span>
                    </div>
                    {assignedHouse.occupiedAt && (
                      <div className="col-span-2">
                        <p style={{ color: "var(--muted-foreground)" }}>
                          Tenant since
                        </p>
                        <p className="font-semibold">
                          {new Date(
                            assignedHouse.occupiedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user.role === "estate_admin" && (
              <div className="card card-static mb-6">
                <CardHeading type="home">Estate Snapshot</CardHeading>
                {estateLoading && (
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Loading estate details...
                  </p>
                )}
                {!estateLoading && estateError && (
                  <p
                    className="text-sm"
                    aria-live="polite"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Estate details are temporarily unavailable.
                  </p>
                )}
                {!estateLoading && !estateError && (
                  <>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {estate?.name ?? "Your estate"}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center mb-5">
                      <div>
                        <p className="text-xl font-bold">
                          {estateHouses.length}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Total units
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">
                          {
                            estateHouses.filter(
                              (house) => house.status === "occupied",
                            ).length
                          }
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Occupied
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold">
                          {
                            estateHouses.filter(
                              (house) => house.status === "vacant",
                            ).length
                          }
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Vacant
                        </p>
                      </div>
                    </div>
                    {/* Pending inquiry and maintenance counts need endpoints that do not exist yet. */}
                    <p className="text-sm font-semibold mb-2">Co-admins</p>
                    {coAdmins.length ? (
                      <div className="flex flex-col gap-2">
                        {coAdmins.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex justify-between text-sm"
                          >
                            <span>{admin.name}</span>
                            <span style={{ color: "var(--muted-foreground)" }}>
                              {admin.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p
                        className="text-sm"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        No co-admins assigned yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Estate Admin: add co-admin */}
            {user.role === "estate_admin" && (
              <form onSubmit={handleAddAdmin} className="card card-static mb-6">
                <CardHeading type="admin">Add Estate Admin</CardHeading>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Grant another registered Communest user admin access to your
                  estate.
                </p>
                <div className="flex gap-3">
                  <input
                    type="email"
                    className="input-field flex-1"
                    placeholder="User's registered email"
                    value={addAdminEmail}
                    onChange={(e) => setAddAdminEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary whitespace-nowrap"
                  >
                    Add Admin
                  </button>
                </div>
                {addAdminMsg && (
                  <p
                    className="text-sm mt-2"
                    aria-live="polite"
                    style={{ color: "var(--success)" }}
                  >
                    {addAdminMsg}
                  </p>
                )}
              </form>
            )}

            {/* Account deletion */}
            {CAN_DELETE.includes(user.role) && (
              <div
                className="card card-static"
                style={{
                  border: "1px solid rgba(239,68,68,0.3)",
                  backgroundImage:
                    "linear-gradient(rgba(239,68,68,0.04), rgba(239,68,68,0.04)), linear-gradient(145deg, rgba(30,64,135,0.2) 0%, rgba(11,23,41,0.96) 48%, rgba(7,16,31,0.98) 100%)",
                }}
              >
                <CardHeading type="trash" danger>
                  Delete Account
                </CardHeading>
                <p
                  className="text-sm mb-4"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  This action is permanent and cannot be undone. All your data
                  will be deleted.
                </p>
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="btn-ghost text-sm px-4 py-2 rounded-lg"
                    style={{
                      color: "var(--danger)",
                      border: "1px solid rgba(239,68,68,0.4)",
                    }}
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={handleDelete}
                      className="btn-primary text-sm py-2 px-4"
                      style={{ background: "var(--danger)" }}
                    >
                      Yes, delete permanently
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="btn-ghost text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Estate admin deletion notice */}
            {user.role === "estate_admin" && (
              <div
                className="card card-static mt-4"
                style={{ border: "1px solid var(--border)" }}
              >
                <h2
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Account Deletion
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  As an Estate Admin, you cannot self-delete your account.
                  Please email{" "}
                  <a
                    href="mailto:admin@communest.gmail.com"
                    className="underline"
                    style={{ color: "var(--accent)" }}
                  >
                    admin@communest.gmail.com
                  </a>{" "}
                  to request account deletion.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
}
