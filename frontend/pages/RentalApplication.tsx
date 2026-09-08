import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAppData } from "../context/UserContext";
import { proposals as proposalsApi } from "../api";
import { Link } from "react-router-dom";

export default function RentalApplication() {
  const { estateId, houseId } = useParams<{
    estateId: string;
    houseId: string;
  }>();
  const { estates, houses, setProposals } = useAppData();
  const navigate = useNavigate();

  const estate = estates.find((e) => e.id === estateId);
  const house = houses.find((h) => h.id === houseId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const emailValid = (e: string) =>
    e.endsWith("@gmail.com") || e.endsWith("@email.com");
  const phoneValid = (p: string) =>
    p.startsWith("+254") &&
    p.replace("+254", "").replace(/\D/g, "").length >= 9;

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
    if (name.length < 2) {
      setError("Please enter your full name");
      return;
    }
    if (!emailValid(email)) {
      setError("Email must end with @gmail.com or @email.com");
      return;
    }
    if (!phoneValid(phone)) {
      setError("Phone must start with +254 and have at least 9 digits");
      return;
    }

    try {
      const result = await proposalsApi.create({
        estateId: estate.id,
        houseId: house.id,
        name,
        email,
        phone,
      });
      setProposals((prev) => [
        ...prev,
        {
          id: result.proposalId,
          estateId: estate.id,
          houseId: house.id,
          name,
          email,
          phone,
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

        {submitted ? (
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
              Your rental proposal has been sent to the estate admin. You will
              be contacted at {email} if approved.
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
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  placeholder="+254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
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
