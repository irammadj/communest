import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppData, useUser } from "../context/UserContext";
import { proposals as proposalsApi } from "../api";

export default function RentalApplication() {
  const { estateId, houseId } = useParams<{
    estateId: string;
    houseId: string;
  }>();
  const { estates, houses, setProposals } = useAppData();
  const { user, token } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const estate = estates.find((e) => e.id === estateId);
  const house = houses.find((h) => h.id === houseId);

  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!estate || !house) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] text-center px-6">
          <div>
            <p className="mb-4" style={{ color: "var(--muted-foreground)" }}>
              House or estate not found.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="btn-primary"
            >
              Back to Explore
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !token || user.role !== "regular_user") {
      setError("Sign in with a regular user account before applying.");
      return;
    }

    try {
      const result = await proposalsApi.create(token, {
        estateId: estate.id,
        houseId: house.id,
      });
      setProposals((prev) => [
        ...prev,
        {
          id: result.proposalId,
          estateId: estate.id,
          houseId: house.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          submittedAt: new Date().toISOString(),
          status: "pending",
        },
      ]);
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Application submission failed.",
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/explore")}
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
          Back to Explore
        </button>

        {/* House summary */}
        <div className="card mb-8 p-0 overflow-hidden">
          <img
            src={house.photos?.[0] ?? estate.estatePhoto}
            alt={house.houseNumber}
            className="w-full h-40 object-cover"
          />
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  Unit {house.houseNumber}
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {estate.name} · {estate.location}, {estate.county}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold"
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
            <div
              className="flex gap-4 text-xs mt-3"
              style={{ color: "var(--muted-foreground)" }}
            >
              <span>{house.rooms} rooms</span>
              <span>{house.totalArea} m²</span>
              <span>Manager: {house.managerPhone}</span>
            </div>
          </div>
        </div>

        {!user || !token ? (
          <div className="card text-center">
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Sign in to apply
            </h1>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--muted-foreground)" }}
            >
              You need a Communest account before applying. If your application
              is approved, your account will become a tenant account.
            </p>
            <Link
              to="/sign-in"
              state={{ from: location.pathname }}
              className="btn-primary inline-flex justify-center"
            >
              Sign In or Register
            </Link>
          </div>
        ) : user.role !== "regular_user" ? (
          <div className="card text-center">
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Regular account required
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Rental applications must be submitted from a regular user
              account.
            </p>
          </div>
        ) : house.status !== "vacant" ? (
          <div className="card text-center">
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              This house is no longer available
            </h1>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              Choose another vacant house from Explore.
            </p>
          </div>
        ) : submitted ? (
          <div className="text-center py-10">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "var(--success)",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Application Submitted!
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Your application has been sent to the estate admin. If approved,
              your account will become a tenant account. Sign out and back in
              after approval to refresh your access.
            </p>
            <button
              onClick={() => navigate("/explore")}
              className="btn-primary"
            >
              Back to Explore
            </button>
          </div>
        ) : (
          <>
            <h1
              className="text-xl font-bold mb-2"
              style={{ color: "var(--foreground)" }}
            >
              Apply to Rent
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Fill in your details below. The estate admin will review your
              proposal and get in touch.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  value={user.name}
                  readOnly
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
                  value={user.phone}
                  readOnly
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: "var(--danger)" }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-primary w-full justify-center py-3"
              >
                Submit Application
              </button>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
}
