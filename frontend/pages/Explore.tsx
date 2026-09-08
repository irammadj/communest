import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppData } from "../context/UserContext";

const COUNTIES = [
  "All Counties",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Kiambu",
  "Thika",
  "Machakos",
  "Meru",
  "Nyeri",
  "Kakamega",
  "Kisii",
  "Kericho",
  "Lamu",
  "Malindi",
  "Garissa",
  "Isiolo",
  "Embu",
  "Murang'a",
];

const PRICE_FILTERS = [
  { label: "Any Price", max: Infinity },
  { label: "Under 10,000", max: 10000 },
  { label: "Under 20,000", max: 20000 },
  { label: "Under 30,000", max: 30000 },
  { label: "Under 40,000", max: 40000 },
  { label: "Under 50,000", max: 50000 },
  { label: "Under 70,000", max: 70000 },
  { label: "Under 100,000", max: 100000 },
];

function EstateCard({ estate, onView }: { estate: any; onView: () => void }) {
  return (
    <div className="card estate-card overflow-hidden p-0 flex flex-col">
      <div className="estate-card-media relative">
        <img
          src={estate.estatePhoto}
          alt={estate.name}
          className="w-full h-48 object-cover"
          style={{ background: "var(--muted)" }}
        />
        <span className="absolute top-3 left-3 badge badge-green">
          Approved &amp; Verified
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3
            className="text-base font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {estate.name}
          </h3>
        </div>
        <div
          className="flex items-center gap-1.5 mb-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm">
            {estate.location}, {estate.county}
          </span>
        </div>
        <div
          className="grid grid-cols-2 gap-2 mb-4 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span>{estate.units} units</span>
          <span>{estate.totalArea.toLocaleString()} m²</span>
          <span className="truncate">{estate.managementName}</span>
          <span>{estate.managementPhone}</span>
        </div>
        {estate.description && (
          <p
            className="text-xs leading-relaxed mb-4 line-clamp-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {estate.description}
          </p>
        )}
        <div className="mt-auto">
          <button
            onClick={onView}
            className="btn-primary w-full justify-center text-sm py-2.5"
          >
            View Estate
          </button>
        </div>
      </div>
    </div>
  );
}

function EstateDetailModal({
  estate,
  houses,
  onClose,
}: {
  estate: any;
  houses: any[];
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const vacantHouses = houses.filter(
    (h) => h.estateId === estate.id && h.status === "vacant",
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.75)" }}
    >
      <div
        className="w-full max-w-3xl rounded-2xl overflow-hidden animate-fade-in"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Hero image */}
        <div className="relative">
          <img
            src={estate.estatePhoto}
            alt={estate.name}
            className="w-full h-56 object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(13,27,46,0.9), transparent)",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-xl font-bold text-white mb-1">{estate.name}</h2>
            <div className="flex items-center gap-2">
              <span className="badge badge-green">Approved &amp; Verified</span>
              <span className="text-xs text-white opacity-80">
                {estate.location}, {estate.county}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Info grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl"
            style={{ background: "var(--secondary)" }}
          >
            {[
              { label: "Units", value: estate.units },
              {
                label: "Total Area",
                value: `${estate.totalArea.toLocaleString()} m²`,
              },
              { label: "Management", value: estate.managementName },
              { label: "Phone", value: estate.managementPhone },
            ].map((item) => (
              <div key={item.label}>
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {estate.description && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "var(--foreground)" }}
              >
                About this Estate
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--muted-foreground)" }}
              >
                {estate.description}
              </p>
            </div>
          )}

          {/* Amenity photos */}
          {estate.amenityPhotos?.length > 0 && (
            <div className="mb-6">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "var(--foreground)" }}
              >
                Amenity Photos
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {estate.amenityPhotos.map((photo: string, i: number) => (
                  <img
                    key={i}
                    src={photo}
                    alt="Amenity"
                    className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vacant houses */}
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--foreground)" }}
          >
            Vacant Houses ({vacantHouses.length})
          </h3>
          {vacantHouses.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              No vacant houses available at this time.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {vacantHouses.map((house) => (
                <div
                  key={house.id}
                  className="rounded-xl p-4"
                  style={{
                    background: "var(--secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--foreground)" }}
                        >
                          Unit {house.houseNumber}
                        </span>
                        <span className="badge badge-blue">Vacant</span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {house.rooms} rooms · {house.totalArea} m²
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--accent)" }}
                      >
                        KES {house.rentAmount.toLocaleString()}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        per month
                      </p>
                    </div>
                  </div>
                  {house.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {house.amenities.map((a: string) => (
                        <span
                          key={a}
                          className="text-xs px-2 py-0.5 rounded-full"
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
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Manager: {house.managerPhone}
                    </span>
                    <button
                      onClick={() => {
                        navigate(`/explore/${estate.id}/apply/${house.id}`);
                        onClose();
                      }}
                      className="btn-primary text-xs py-1.5 px-4"
                    >
                      Apply to Rent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const { estates, houses } = useAppData();
  const [search, setSearch] = useState("");
  const [county, setCounty] = useState("All Counties");
  const [priceIdx, setPriceIdx] = useState(0);
  const [selectedEstate, setSelectedEstate] = useState<any>(null);

  const approvedEstates = estates.filter((e) => e.status === "approved");

  const filtered = approvedEstates.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    const matchCounty = county === "All Counties" || e.county === county;
    const maxPrice = PRICE_FILTERS[priceIdx].max;
    const vacantHouses = houses.filter(
      (h) => h.estateId === e.id && h.status === "vacant",
    );
    const matchPrice =
      maxPrice === Infinity ||
      vacantHouses.some((h) => h.rentAmount < maxPrice);
    return matchSearch && matchCounty && matchPrice;
  });

  return (
    <Layout>
      {/* Hero */}
      <section
        className="hero-section"
        style={{
          minHeight: "55vh",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1600&h=900&fit=crop&auto=format")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-20 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
            style={{ color: "#fff", lineHeight: 1.1 }}
          >
            Explore Estates
          </h1>
          <p
            className="text-base mb-8 leading-relaxed"
            style={{ color: "rgba(226,232,240,0.85)" }}
          >
            Browse verified estates across Kenya and find a house that fits your
            life.
          </p>
          <div className="relative max-w-xl mx-auto">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="input-field pl-11 py-3 text-base"
              placeholder="Search estates by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "rgba(13,27,46,0.85)",
                backdropFilter: "blur(8px)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <div
        style={{
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              County:
            </label>
            <select
              className="input-field py-1.5 text-sm"
              style={{ width: "auto" }}
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              {COUNTIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Rent:
            </label>
            <select
              className="input-field py-1.5 text-sm"
              style={{ width: "auto" }}
              value={priceIdx}
              onChange={(e) => setPriceIdx(Number(e.target.value))}
            >
              {PRICE_FILTERS.map((p, i) => (
                <option key={i} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <span
            className="text-sm ml-auto"
            style={{ color: "var(--muted-foreground)" }}
          >
            {filtered.length} estate{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* Estate cards */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p
              className="text-base font-medium mb-2"
              style={{ color: "var(--foreground)" }}
            >
              No estates found
            </p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((estate) => (
              <EstateCard
                key={estate.id}
                estate={estate}
                onView={() => setSelectedEstate(estate)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedEstate && (
        <EstateDetailModal
          estate={selectedEstate}
          houses={houses}
          onClose={() => setSelectedEstate(null)}
        />
      )}
    </Layout>
  );
}
