import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useUser } from "../context/UserContext";
import { profile as profileApi, estates as estatesApi } from "../api";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  communest_admin: { label: "Communest Admin", cls: "badge badge-blue" },
  estate_admin: { label: "Estate Admin", cls: "badge badge-green" },
  tenant: { label: "Tenant", cls: "badge badge-yellow" },
  regular_user: { label: "Regular User", cls: "badge badge-gray" },
};

const CAN_DELETE = ["tenant", "regular_user"];

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
          .update(token, { profilePicture: url })
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
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1
          className="text-2xl font-bold mb-8"
          style={{ color: "var(--foreground)" }}
        >
          My Profile
        </h1>

        {/* Profile picture + badge */}
        <div className="card mb-6 flex items-center gap-5">
          <div className="relative flex-shrink-0">
            {profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
                style={{ border: "3px solid var(--accent)" }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "3px solid var(--accent)",
                }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            <label
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
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
          <div>
            <p
              className="text-lg font-bold mb-1"
              style={{ color: "var(--foreground)" }}
            >
              {user.name}
            </p>
            <span className={badge.cls}>{badge.label}</span>
            <div className="flex gap-3 mt-2">
              <span
                className="text-xs flex items-center gap-1"
                style={{
                  color: user.emailVerified
                    ? "var(--success)"
                    : "var(--warning)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Email {user.emailVerified ? "Verified" : "Unverified"}
              </span>
              <span
                className="text-xs flex items-center gap-1"
                style={{
                  color: user.phoneVerified
                    ? "var(--success)"
                    : "var(--warning)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Phone {user.phoneVerified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit details */}
        <form onSubmit={handleSave} className="card mb-6">
          <h2
            className="text-base font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Personal Details
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Full Name
              </label>
              <input
                type="text"
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
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                value={user.email}
                readOnly
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Phone Number
              </label>
              <input
                type="tel"
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
            {saved && (
              <span className="text-sm" style={{ color: "var(--success)" }}>
                Changes saved!
              </span>
            )}
          </div>
        </form>

        {/* View my estate — tenant or estate admin */}
        {(user.role === "tenant" || user.role === "estate_admin") && (
          <div className="card mb-6">
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              My Estate
            </h2>
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

        {/* Estate Admin: add co-admin */}
        {user.role === "estate_admin" && (
          <form onSubmit={handleAddAdmin} className="card mb-6">
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Add Estate Admin
            </h2>
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
              <button type="submit" className="btn-primary whitespace-nowrap">
                Add Admin
              </button>
            </div>
            {addAdminMsg && (
              <p className="text-sm mt-2" style={{ color: "var(--success)" }}>
                {addAdminMsg}
              </p>
            )}
          </form>
        )}

        {/* Account deletion */}
        {CAN_DELETE.includes(user.role) && (
          <div
            className="card"
            style={{ border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: "var(--danger)" }}
            >
              Delete Account
            </h2>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              This action is permanent and cannot be undone. All your data will
              be deleted.
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
            className="card mt-4"
            style={{ border: "1px solid var(--border)" }}
          >
            <h2
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Account Deletion
            </h2>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              As an Estate Admin, you cannot self-delete your account. Please
              email{" "}
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
      </div>
    </Layout>
  );
}
