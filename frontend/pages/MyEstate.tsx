import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useUser, useAppData } from "../context/UserContext";
import type { MaintenanceIssue } from "../types";
import {
  estates as estatesApi,
  houses as housesApi,
  notifications as notificationsApi,
  maintenance as maintenanceApi,
  paymentOptions as paymentOptionsApi,
  inquiries as inquiriesApi,
  proposals as proposalsApi,
} from "../api";

type Section =
  | "overview"
  | "management"
  | "notification"
  | "maintenance"
  | "payment"
  | "proposals"
  | "inquiries";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "management", label: "Management" },
  { id: "notification", label: "Notifications" },
  { id: "maintenance", label: "Maintenance" },
  { id: "payment", label: "Payment" },
  { id: "proposals", label: "Applications" },
  { id: "inquiries", label: "Inquiries" },
];

const TENANT_SECTIONS: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "notification", label: "Notifications" },
  { id: "maintenance", label: "Maintenance" },
  { id: "payment", label: "Payment" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "badge badge-yellow",
    approved: "badge badge-green",
    denied: "badge badge-red",
    scheduled: "badge badge-blue",
    in_progress: "badge badge-yellow",
    resolved: "badge badge-green",
    vacant: "badge badge-blue",
    occupied: "badge badge-green",
    paid: "badge badge-green",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved & Verified",
    denied: "Denied",
    scheduled: "Scheduled",
    in_progress: "In Progress",
    resolved: "Resolved",
    vacant: "Vacant",
    occupied: "Occupied",
    paid: "Paid",
  };
  return (
    <span className={map[status] ?? "badge badge-gray"}>
      {labels[status] ?? status}
    </span>
  );
}

export default function MyEstate() {
  const { user, token } = useUser();
  const {
    estates,
    houses,
    notifications,
    maintenanceIssues,
    paymentOptions,
    inquiries,
    proposals,
    setEstates,
    setHouses,
    setNotifications,
    setMaintenanceIssues,
    setPaymentOptions,
    setInquiries,
    setProposals,
  } = useAppData();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [showListHouseEntry, setShowListHouseEntry] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showSingleHouse, setShowSingleHouse] = useState(false);

  // Notification form
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [notifDesc, setNotifDesc] = useState("");

  // Maintenance form
  const [maintTitle, setMaintTitle] = useState("");
  const [maintDesc, setMaintDesc] = useState("");

  // Payment option form
  const [payName, setPayName] = useState("");
  const [payDetails, setPayDetails] = useState("");

  // Inquiry reply
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  // Single house form
  const [houseNum, setHouseNum] = useState("");
  const [houseArea, setHouseArea] = useState("");
  const [houseRooms, setHouseRooms] = useState("");
  const [houseAmenities, setHouseAmenities] = useState("");
  const [houseRent, setHouseRent] = useState("");
  const [housePhone, setHousePhone] = useState("");

  // Change estate photo
  const [heroPhotoPreview, setHeroPhotoPreview] = useState<string | null>(null);

  if (
    !user ||
    (user.role !== "communest_admin" &&
      user.role !== "estate_admin" &&
      user.role !== "tenant")
  ) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <p
              className="text-base font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Access Restricted
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              You need to be an Estate Admin or Tenant to view this page.
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

  const estate =
    user.role === "communest_admin"
      ? estates.find((e) => e.status === "approved")
      : estates.find((e) => e.id === user.estateId);

  if (!estate) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <p
              className="text-base font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              No Estate Found
            </p>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              {user.role === "estate_admin"
                ? "Your estate submission is still pending approval."
                : "You are not linked to an estate yet."}
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="btn-primary"
            >
              Explore Estates
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isAdmin =
    user.role === "communest_admin" || user.role === "estate_admin";
  const sections = isAdmin ? SECTIONS : TENANT_SECTIONS;

  const estateHouses = houses.filter((h) => h.estateId === estate.id);
  const vacantHouses = estateHouses.filter((h) => h.status === "vacant");
  const occupiedHouses = estateHouses.filter((h) => h.status === "occupied");
  const estateNotifs = notifications.filter((n) => n.estateId === estate.id);
  const estateMaints = maintenanceIssues.filter(
    (m) => m.estateId === estate.id,
  );
  const estatePayOptions = paymentOptions.filter(
    (p) => p.estateId === estate.id,
  );
  const estateInquiries = inquiries.filter((i) => i.estateId === estate.id);
  const estateProposals = proposals.filter(
    (proposal) => proposal.estateId === estate.id,
  );

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifDate || !notifDesc || !token) return;
    const created = await notificationsApi.create(token, estate.id, {
      title: notifTitle,
      eventDate: notifDate,
      description: notifDesc,
    });
    setNotifications((prev) => [...prev, created]);
    setNotifTitle("");
    setNotifDate("");
    setNotifDesc("");
  };

  const handleAddMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintTitle || !maintDesc || !token) return;
    const created = await maintenanceApi.create(token, estate.id, {
      title: maintTitle,
      description: maintDesc,
    });
    setMaintenanceIssues((prev) => [...prev, created]);
    setMaintTitle("");
    setMaintDesc("");
  };

  const handleMaintStatusChange = async (
    id: string,
    status: MaintenanceIssue["status"],
  ) => {
    if (!token) return;
    const updated = await maintenanceApi.updateStatus(token, id, status);
    setMaintenanceIssues((prev) =>
      prev.map((issue) => (issue.id === updated.id ? updated : issue)),
    );
  };

  const handleDeleteMaint = async (id: string) => {
    if (!token) return;
    await maintenanceApi.delete(token, id);
    setMaintenanceIssues((prev) => prev.filter((issue) => issue.id !== id));
  };

  const handleDeleteNotification = async (id: string) => {
    if (!token) return;
    await notificationsApi.delete(token, id);
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const handleAddPayOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payName || !payDetails || !token) return;
    const created = await paymentOptionsApi.create(token, estate.id, {
      name: payName,
      details: payDetails,
    });
    setPaymentOptions((prev) => [...prev, created]);
    setPayName("");
    setPayDetails("");
  };

  const handleDeletePaymentOption = async (id: string) => {
    if (!token) return;
    await paymentOptionsApi.delete(token, id);
    setPaymentOptions((prev) => prev.filter((option) => option.id !== id));
  };

  const handleChangeEstatePhoto = async (file: File) => {
    if (!token) return;
    const photoUrl = URL.createObjectURL(file);
    setHeroPhotoPreview(photoUrl);
    const updated = await estatesApi.updatePhoto(token, estate.id, photoUrl);
    setEstates((prev) =>
      prev.map((current) => (current.id === updated.id ? updated : current)),
    );
  };

  const handleMarkPayment = async (
    houseId: string,
    status: "paid" | "pending",
  ) => {
    if (!token) return;
    const updated = await housesApi.updatePayment(token, houseId, status);
    setHouses((prev) =>
      prev.map((house) => (house.id === updated.id ? updated : house)),
    );
  };

  const handleMarkHouseStatus = async (
    houseId: string,
    status: "vacant" | "occupied",
  ) => {
    if (!token) return;
    const updated = await housesApi.updateStatus(token, houseId, status);
    setHouses((prev) =>
      prev.map((house) => (house.id === updated.id ? updated : house)),
    );
  };

  const handleReplyInquiry = async (id: string) => {
    const reply = replyText[id];
    if (!reply || !token) return;
    const updated = await inquiriesApi.reply(token, id, reply);
    setInquiries((prev) =>
      prev.map((inquiry) => (inquiry.id === updated.id ? updated : inquiry)),
    );
    setReplyText((prev) => ({ ...prev, [id]: "" }));
  };

  const handleProposalStatus = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    if (!token) return;
    const updated = await proposalsApi.updateStatus(token, id, status);
    setProposals((prev) =>
      prev.map((proposal) => (proposal.id === updated.id ? updated : proposal)),
    );
    if (status === "approved") {
      const approvedHouse = houses.find(
        (house) => house.id === updated.houseId,
      );
      if (approvedHouse)
        setHouses((prev) =>
          prev.map((house) =>
            house.id === approvedHouse.id
              ? {
                  ...house,
                  status: "occupied",
                  tenantName: updated.name,
                  paymentStatus: "pending",
                }
              : house,
          ),
        );
    }
  };

  const handleAddHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const created = await housesApi.create(token, estate.id, {
      houseNumber: houseNum,
      totalArea: Number(houseArea),
      rooms: Number(houseRooms),
      photos: [],
      amenities: houseAmenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      rentAmount: Number(houseRent),
      managerPhone: housePhone,
    });
    setHouses((prev) => [...prev, created]);
    setHouseNum("");
    setHouseArea("");
    setHouseRooms("");
    setHouseAmenities("");
    setHouseRent("");
    setHousePhone("");
    setShowSingleHouse(false);
    setShowListHouseEntry(false);
    setActiveSection("management");
  };

  const heroImage = heroPhotoPreview ?? estate.estatePhoto;

  return (
    <Layout>
      {/* Hero */}
      <section
        className="relative"
        style={{ minHeight: "40vh", display: "flex", alignItems: "flex-end" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(7,13,26,1) 0%, rgba(7,13,26,0.6) 60%, rgba(7,13,26,0.3) 100%)",
          }}
        />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "#fff" }}
              >
                {estate.name}
              </h1>
              <StatusBadge status={estate.status} />
            </div>
            <p className="text-sm" style={{ color: "rgba(226,232,240,0.8)" }}>
              {estate.location}, {estate.county}
            </p>
          </div>
          {isAdmin && (
            <label className="btn-outline text-sm py-2 cursor-pointer">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleChangeEstatePhoto(f);
                }}
              />
            </label>
          )}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Section tabs */}
        <div
          className="flex gap-1 mb-8 overflow-x-auto pb-1"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-all"
              style={
                activeSection === s.id
                  ? {
                      color: "var(--accent)",
                      borderBottom: "2px solid var(--accent)",
                    }
                  : { color: "var(--muted-foreground)" }
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeSection === "overview" && (
          <div className="animate-fade-in flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Management", value: estate.managementName },
                { label: "Email", value: estate.managementEmail },
                { label: "Phone", value: estate.managementPhone },
                {
                  label: "Total Area",
                  value: `${estate.totalArea.toLocaleString()} m²`,
                },
                { label: "Total Units", value: estate.units },
                { label: "Vacant Houses", value: vacantHouses.length },
                { label: "Occupied Houses", value: occupiedHouses.length },
                {
                  label: "Open Inquiries",
                  value: estateInquiries.filter((i) => i.status === "pending")
                    .length,
                },
              ].map((item) => (
                <div key={item.label} className="card p-4">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="card">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Recent Notifications
              </h3>
              {estateNotifs.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No notifications posted yet.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {estateNotifs.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-center gap-3 text-sm">
                      <span style={{ color: "var(--accent)" }}>·</span>
                      <span style={{ color: "var(--foreground)" }}>
                        {n.title}
                      </span>
                      <span
                        className="ml-auto text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {new Date(n.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Management (admin only) */}
        {activeSection === "management" && isAdmin && (
          <div className="animate-fade-in flex flex-col gap-6">
            {!showListHouseEntry ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Houses
                  </h2>
                  <button
                    onClick={() => setShowListHouseEntry(true)}
                    className="btn-primary text-sm py-2"
                  >
                    + Register House
                  </button>
                </div>

                {/* Vacant */}
                <div>
                  <h3
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Vacant Houses
                    <span className="badge badge-blue">
                      {vacantHouses.length}
                    </span>
                  </h3>
                  {vacantHouses.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No vacant houses.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {vacantHouses.map((h) => (
                        <HouseRow
                          key={h.id}
                          house={h}
                          isAdmin={isAdmin}
                          onMarkOccupied={() =>
                            handleMarkHouseStatus(h.id, "occupied")
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Occupied */}
                <div>
                  <h3
                    className="text-sm font-semibold mb-3 flex items-center gap-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Occupied Houses
                    <span className="badge badge-green">
                      {occupiedHouses.length}
                    </span>
                  </h3>
                  {occupiedHouses.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      No occupied houses.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {occupiedHouses.map((h) => (
                        <HouseRow
                          key={h.id}
                          house={h}
                          isAdmin={isAdmin}
                          onMarkVacant={() =>
                            handleMarkHouseStatus(h.id, "vacant")
                          }
                          paymentStatus={h.paymentStatus}
                          onMarkPaid={() => handleMarkPayment(h.id, "paid")}
                          onMarkPending={() =>
                            handleMarkPayment(h.id, "pending")
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : !showBulkUpload && !showSingleHouse ? (
              <div className="animate-fade-in">
                <button
                  onClick={() => setShowListHouseEntry(false)}
                  className="btn-ghost text-sm flex items-center gap-2 mb-6 px-0"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </button>
                <h2
                  className="text-lg font-semibold mb-6"
                  style={{ color: "var(--foreground)" }}
                >
                  Register Houses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowBulkUpload(true)}
                    className="card text-left hover:border-accent transition-colors p-6"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="mb-3"
                      style={{ color: "var(--accent)" }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      List Houses in Bulk
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Upload a CSV file to register multiple houses at once. The
                      system will auto-register from the CSV.
                    </p>
                  </button>
                  <button
                    onClick={() => setShowSingleHouse(true)}
                    className="card text-left hover:border-accent transition-colors p-6"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="mb-3"
                      style={{ color: "var(--accent)" }}
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    <h3
                      className="text-base font-semibold mb-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      List a House
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Register a single house by filling in its details
                      manually.
                    </p>
                  </button>
                </div>
              </div>
            ) : showBulkUpload ? (
              <div className="animate-fade-in">
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="btn-ghost text-sm flex items-center gap-2 mb-6 px-0"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </button>
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--foreground)" }}
                >
                  List Houses in Bulk
                </h2>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Upload a CSV file with columns: house_number, total_area,
                  rooms, amenities, rent_amount, manager_phone
                </p>
                <label
                  className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: "2px dashed var(--border)",
                    background: "var(--secondary)",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    style={{ color: "var(--accent)" }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span
                    className="text-sm mt-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Click to upload CSV
                  </span>
                  <input type="file" accept=".csv" className="hidden" />
                </label>
              </div>
            ) : (
              <div className="animate-fade-in">
                <button
                  onClick={() => setShowSingleHouse(false)}
                  className="btn-ghost text-sm flex items-center gap-2 mb-6 px-0"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back
                </button>
                <h2
                  className="text-lg font-semibold mb-5"
                  style={{ color: "var(--foreground)" }}
                >
                  List a House
                </h2>
                <form onSubmit={handleAddHouse} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--foreground)" }}
                      >
                        House Number *
                      </label>
                      <input
                        className="input-field"
                        placeholder="e.g. A-101"
                        value={houseNum}
                        onChange={(e) => setHouseNum(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--foreground)" }}
                      >
                        Total Area (m²) *
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        placeholder="e.g. 85"
                        value={houseArea}
                        onChange={(e) => setHouseArea(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--foreground)" }}
                      >
                        Number of Rooms *
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        min={1}
                        placeholder="e.g. 2"
                        value={houseRooms}
                        onChange={(e) => setHouseRooms(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium mb-1.5"
                        style={{ color: "var(--foreground)" }}
                      >
                        Rent Amount (KES) *
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        min={0}
                        placeholder="e.g. 35000"
                        value={houseRent}
                        onChange={(e) => setHouseRent(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Amenities (comma-separated)
                    </label>
                    <input
                      className="input-field"
                      placeholder="WiFi, Parking, Security"
                      value={houseAmenities}
                      onChange={(e) => setHouseAmenities(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Manager Phone *
                    </label>
                    <input
                      className="input-field"
                      placeholder="+254712345678"
                      value={housePhone}
                      onChange={(e) => setHousePhone(e.target.value)}
                      required
                    />
                  </div>
                  <label
                    className="flex flex-col items-center justify-center w-full h-24 rounded-xl cursor-pointer"
                    style={{
                      border: "2px dashed var(--border)",
                      background: "var(--secondary)",
                    }}
                  >
                    <span
                      className="text-sm"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Upload house photos (multiple)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-primary w-full justify-center py-3"
                  >
                    Register House
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        {activeSection === "notification" && (
          <div className="animate-fade-in flex flex-col gap-6">
            {isAdmin && (
              <form
                onSubmit={handleAddNotification}
                className="card flex flex-col gap-4"
              >
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Post Notification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Title
                    </label>
                    <input
                      className="input-field"
                      placeholder="Notification title"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Event Date &amp; Time
                    </label>
                    <input
                      className="input-field"
                      type="datetime-local"
                      value={notifDate}
                      onChange={(e) => setNotifDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Description
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Details..."
                    value={notifDesc}
                    onChange={(e) => setNotifDesc(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary self-start">
                  Post Notification
                </button>
              </form>
            )}
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Posted Notifications
              </h3>
              {estateNotifs.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No notifications yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {estateNotifs.map((n) => (
                    <div
                      key={n.id}
                      className="card p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {n.title}
                        </p>
                        <p
                          className="text-xs mb-2"
                          style={{ color: "var(--accent)" }}
                        >
                          {new Date(n.eventDate).toLocaleString()}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {n.description}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteNotification(n.id)}
                          className="text-xs p-1.5 rounded"
                          style={{
                            color: "var(--danger)",
                            background: "rgba(239,68,68,0.1)",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maintenance */}
        {activeSection === "maintenance" && (
          <div className="animate-fade-in flex flex-col gap-6">
            {isAdmin && (
              <form
                onSubmit={handleAddMaintenance}
                className="card flex flex-col gap-4"
              >
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Post Maintenance Issue
                </h3>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Title
                  </label>
                  <input
                    className="input-field"
                    placeholder="Issue title"
                    value={maintTitle}
                    onChange={(e) => setMaintTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium mb-1.5"
                    style={{ color: "var(--foreground)" }}
                  >
                    Description
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Details..."
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary self-start">
                  Add Issue
                </button>
              </form>
            )}
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Maintenance Issues
              </h3>
              {estateMaints.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No maintenance issues.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {estateMaints.map((m) => (
                    <div
                      key={m.id}
                      className="card p-4 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p
                          className="text-sm font-semibold mb-1"
                          style={{ color: "var(--foreground)" }}
                        >
                          {m.title}
                        </p>
                        <p
                          className="text-sm mb-2"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {m.description}
                        </p>
                        {isAdmin ? (
                          <select
                            className="input-field text-xs py-1"
                            style={{ width: "auto" }}
                            value={m.status}
                            onChange={(e) =>
                              handleMaintStatusChange(
                                m.id,
                                e.target.value as MaintenanceIssue["status"],
                              )
                            }
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        ) : (
                          <StatusBadge status={m.status} />
                        )}
                      </div>
                      {isAdmin && m.status === "resolved" && (
                        <button
                          onClick={() => handleDeleteMaint(m.id)}
                          className="text-xs p-1.5 rounded"
                          style={{
                            color: "var(--danger)",
                            background: "rgba(239,68,68,0.1)",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment */}
        {activeSection === "payment" && (
          <div className="animate-fade-in flex flex-col gap-6">
            {/* Payment options */}
            <div>
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Payment Options
              </h3>
              {estatePayOptions.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  No payment options configured yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {estatePayOptions.map((p) => (
                    <div
                      key={p.id}
                      className="card p-4 flex items-center justify-between"
                    >
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {p.name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {p.details}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeletePaymentOption(p.id)}
                          className="text-xs p-1.5 rounded"
                          style={{
                            color: "var(--danger)",
                            background: "rgba(239,68,68,0.1)",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isAdmin && (
              <form
                onSubmit={handleAddPayOption}
                className="card flex flex-col gap-4"
              >
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Add Payment Option
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Method Name
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. M-Pesa"
                      value={payName}
                      onChange={(e) => setPayName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1.5"
                      style={{ color: "var(--foreground)" }}
                    >
                      Details
                    </label>
                    <input
                      className="input-field"
                      placeholder="Paybill, account number, etc."
                      value={payDetails}
                      onChange={(e) => setPayDetails(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary self-start">
                  Add Option
                </button>
              </form>
            )}

            {isAdmin && (
              <div>
                <h3
                  className="text-sm font-semibold mb-3"
                  style={{ color: "var(--foreground)" }}
                >
                  Tenant Payment Status
                </h3>
                {occupiedHouses.length === 0 ? (
                  <p
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    No occupied houses.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {occupiedHouses.map((h) => (
                      <div
                        key={h.id}
                        className="card p-4 flex items-center justify-between"
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--foreground)" }}
                          >
                            Unit {h.houseNumber}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            {h.tenantName ?? "Tenant"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={h.paymentStatus ?? "pending"} />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkPayment(h.id, "paid")}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: "rgba(34,197,94,0.15)",
                                color: "var(--success)",
                              }}
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleMarkPayment(h.id, "pending")}
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: "rgba(245,158,11,0.15)",
                                color: "var(--warning)",
                              }}
                            >
                              Mark Pending
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAdmin && (
              <div>
                <h3
                  className="text-sm font-semibold mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Your Payment Status
                </h3>
                <div className="card p-4">
                  <StatusBadge
                    status={
                      occupiedHouses.find((h) => h.tenantName === user.name)
                        ?.paymentStatus ?? "pending"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rental proposals (admin only) */}
        {activeSection === "proposals" && isAdmin && (
          <div className="animate-fade-in flex flex-col gap-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Rental Applications
            </h3>
            {estateProposals.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                No rental applications received.
              </p>
            ) : (
              estateProposals.map((proposal) => (
                <div key={proposal.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {proposal.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {proposal.email} · {proposal.phone}
                      </p>
                    </div>
                    <StatusBadge status={proposal.status} />
                  </div>
                  {proposal.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          handleProposalStatus(proposal.id, "approved")
                        }
                        className="btn-primary text-sm py-2"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleProposalStatus(proposal.id, "rejected")
                        }
                        className="btn-ghost text-sm py-2"
                        style={{ color: "var(--danger)" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Inquiries (admin only) */}
        {activeSection === "inquiries" && isAdmin && (
          <div className="animate-fade-in flex flex-col gap-4">
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Tenant Inquiries
            </h3>
            {estateInquiries.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                No inquiries received.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {estateInquiries.map((inq) => (
                  <div key={inq.id} className="card p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          {inq.tenantName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Unit {inq.unit} ·{" "}
                          {new Date(inq.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={inq.status} />
                    </div>
                    <p
                      className="text-sm mb-3 p-3 rounded-lg"
                      style={{
                        background: "var(--secondary)",
                        color: "var(--foreground)",
                      }}
                    >
                      {inq.message}
                    </p>
                    {inq.reply ? (
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Your reply ·{" "}
                          {inq.repliedAt
                            ? new Date(inq.repliedAt).toLocaleString()
                            : ""}
                        </p>
                        <p
                          className="text-sm p-3 rounded-lg"
                          style={{
                            background: "rgba(30,64,175,0.15)",
                            color: "var(--foreground)",
                          }}
                        >
                          {inq.reply}
                        </p>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-2">
                        <input
                          className="input-field flex-1 text-sm py-2"
                          placeholder="Type your reply..."
                          value={replyText[inq.id] ?? ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [inq.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          onClick={() => handleReplyInquiry(inq.id)}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

function HouseRow({
  house,
  isAdmin,
  onMarkOccupied,
  onMarkVacant,
  paymentStatus,
  onMarkPaid,
  onMarkPending,
}: {
  house: House;
  isAdmin: boolean;
  onMarkOccupied?: () => void;
  onMarkVacant?: () => void;
  paymentStatus?: string;
  onMarkPaid?: () => void;
  onMarkPending?: () => void;
}) {
  return (
    <div className="card p-4 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Unit {house.houseNumber}
          </span>
          <span
            className={`badge ${house.status === "vacant" ? "badge-blue" : "badge-green"}`}
          >
            {house.status === "vacant" ? "Vacant" : "Occupied"}
          </span>
          {paymentStatus && (
            <span
              className={`badge ${paymentStatus === "paid" ? "badge-green" : "badge-yellow"}`}
            >
              {paymentStatus === "paid" ? "Paid" : "Pending"}
            </span>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {house.rooms} rooms · {house.totalArea} m² · KES{" "}
          {house.rentAmount.toLocaleString()}/mo
        </p>
        {house.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {house.amenities.map((a) => (
              <span
                key={a}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
      {isAdmin && (
        <div className="flex gap-2 flex-wrap">
          {house.status === "vacant" && onMarkOccupied && (
            <button
              onClick={onMarkOccupied}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "var(--success)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              Mark Occupied
            </button>
          )}
          {house.status === "occupied" && onMarkVacant && (
            <button
              onClick={onMarkVacant}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: "rgba(59,130,246,0.15)",
                color: "var(--accent)",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              Mark Vacant
            </button>
          )}
          {onMarkPaid && (
            <button
              onClick={onMarkPaid}
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "var(--success)",
              }}
            >
              Paid
            </button>
          )}
          {onMarkPending && (
            <button
              onClick={onMarkPending}
              className="text-xs px-2 py-1 rounded"
              style={{
                background: "rgba(245,158,11,0.1)",
                color: "var(--warning)",
              }}
            >
              Pending
            </button>
          )}
        </div>
      )}
    </div>
  );
}
