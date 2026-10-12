import { useState, type FormEvent } from "react";

type DemoRole = "manager" | "member";

type MemberPage = {
  items: { id: number }[];
};

type GigPage = {
  items: { id: number; venue: string; date: string }[];
  total: number;
};

async function responseError(response: Response): Promise<Error> {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === "object" &&
    body !== null &&
    "detail" in body &&
    typeof body.detail === "string"
  ) {
    return new Error(body.detail);
  }
  return new Error(`The backend returned an error (${response.status}).`);
}

export default function App() {
  const [role, setRole] = useState<DemoRole>("manager");
  const [gigs, setGigs] = useState<GigPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
  ).replace(/\/$/, "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const headers = new Headers({ "X-Demo-Role": role });
      if (role === "member") {
        const membersResponse = await fetch(`${apiBaseUrl}/api/v1/members`);
        if (!membersResponse.ok) {
          throw await responseError(membersResponse);
        }
        const members = (await membersResponse.json()) as MemberPage;
        const firstMember = members.items[0];
        if (!firstMember) {
          throw new Error(
            "No demo members were found. Seed the backend demo members and try again.",
          );
        }
        headers.set("X-Demo-Member-Id", String(firstMember.id));
      }

      const gigsResponse = await fetch(`${apiBaseUrl}/api/v1/gigs`, { headers });
      if (!gigsResponse.ok) {
        throw await responseError(gigsResponse);
      }
      setGigs((await gigsResponse.json()) as GigPage);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not connect to the backend. Check that it is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (gigs !== null) {
    return (
      <main className="dashboard-shell">
        <header className="dashboard-header">
          <p className="wordmark">ROADHOUSE</p>
          <button className="sign-out-button" onClick={() => setGigs(null)}>
            Back to sign in
          </button>
        </header>
        <section className="dashboard-content">
          <p className="eyebrow">Connected as {role}</p>
          <h1>You’re through the demo login.</h1>
          <p className="login-description">
            The frontend successfully reached the backend.
          </p>
          <h2>Upcoming gigs ({gigs.total})</h2>
          {gigs.items.length > 0 ? (
            <ul className="gig-list">
              {gigs.items.map((gig) => (
                <li key={gig.id}>
                  <strong>{gig.venue}</strong>
                  <span>{gig.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming gigs yet. The backend connection is working.</p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="login-shell">
      <section className="login-art" aria-label="Roadhouse band scheduling">
        <p className="wordmark">ROADHOUSE</p>
        <div className="art-copy">
          <p className="eyebrow">The band, in tune</p>
          <h1>Every gig starts with getting together.</h1>
          <p>One place for the nights you play and the people you play them with.</p>
        </div>
        <span className="art-note" aria-hidden="true">
          RH / 01
        </span>
      </section>
      <section className="login-panel">
        <div className="login-content">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to Roadhouse</h2>
          <p className="login-description">Choose your demo role to continue.</p>
          <form onSubmit={handleSubmit}>
            <fieldset className="role-picker">
              <legend>Your role</legend>
              <label className={role === "manager" ? "role-option selected" : "role-option"}>
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={role === "manager"}
                  onChange={() => setRole("manager")}
                />
                <span>Band manager</span>
              </label>
              <label className={role === "member" ? "role-option selected" : "role-option"}>
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={role === "member"}
                  onChange={() => setRole("member")}
                />
                <span>Band member</span>
              </label>
            </fieldset>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Connecting..." : `Continue as ${role}`}
              <span aria-hidden="true">→</span>
            </button>
            {error && <p className="form-error" role="alert">{error}</p>}
          </form>
          <p className="demo-note">Demo access · no password required</p>
        </div>
        <footer>© 2026 Roadhouse</footer>
      </section>
    </main>
  );
}