import { useEffect, useState } from "react";
import "./App.css";

const API = "https://education-support-ticket-management.onrender.com";

const categories = [
  "FEES",
  "ATTENDANCE",
  "ID_CARD",
  "DOCUMENTS",
  "CERTIFICATES",
  "OTHER",
];

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statuses = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING",
  "RESOLVED",
  "CLOSED",
];

function App() {
  const [token, setToken] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tickets, setTickets] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [newTicket, setNewTicket] = useState({
    category: "FEES",
    subject: "",
    description: "",
    priority: "MEDIUM",
  });

  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const savedToken = sessionStorage.getItem("edusupport_token");
    const savedRole = sessionStorage.getItem("edusupport_role");
    const savedEmail = sessionStorage.getItem("edusupport_email");

    if (savedToken && savedRole) {
      setToken(savedToken);
      setUserRole(savedRole);
      setUserEmail(savedEmail || "");
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, userRole]);

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    return data;
  }

  async function login(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      const payload = JSON.parse(atob(data.access_token.split(".")[1]));

      const role = payload.role;

      sessionStorage.setItem("edusupport_token", data.access_token);
      sessionStorage.setItem("edusupport_role", role);
      sessionStorage.setItem("edusupport_email", email);

      setToken(data.access_token);
      setUserRole(role);
      setUserEmail(email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    sessionStorage.clear();

    setToken("");
    setUserRole("");
    setUserEmail("");
    setTickets([]);
    setDashboard(null);
    setSelectedTicket(null);
    setActivities([]);
  }

  async function loadData() {
    try {
      setError("");

      const ticketData = await apiRequest("/tickets/");
      setTickets(ticketData);

      if (userRole === "STAFF" || userRole === "MANAGER") {
        const dashboardData = await apiRequest("/dashboard/summary");
        setDashboard(dashboardData);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadActivities(ticketId) {
    try {
      const data = await apiRequest(`/tickets/${ticketId}/activities`);
      setActivities(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function openTicket(ticket) {
    setSelectedTicket(ticket);
    setActivities([]);
    await loadActivities(ticket.id);
  }

  async function createTicket(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/tickets/", {
        method: "POST",
        body: JSON.stringify(newTicket),
      });

      setMessage("Ticket submitted successfully.");

      setNewTicket({
        category: "FEES",
        subject: "",
        description: "",
        priority: "MEDIUM",
      });

      setShowCreate(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateTicket(ticketId, changes) {
    setLoading(true);
    setError("");

    try {
      await apiRequest(`/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });

      setMessage("Ticket updated successfully.");

      await loadData();

      const updated = await apiRequest(`/tickets/${ticketId}`);

      setSelectedTicket(updated);
      await loadActivities(ticketId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredTickets =
    filter === "ALL"
      ? tickets
      : tickets.filter((ticket) => ticket.status === filter);

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-panel">
          <div className="logo">E</div>

          <div className="brand-name">EduSupport</div>

          <h1>Welcome back</h1>

          <p className="login-subtitle">
            Manage student support requests in one place.
          </p>

          <form onSubmit={login}>
            <label>Email</label>

            <input
              type="email"
              placeholder="student@edusupport.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <div className="error-box">{error}</div>}

            <button className="primary-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="login-demo">
            <strong>Demo access</strong>
            <span>student@edusupport.com / student123</span>
            <span>staff@edusupport.com / staff123</span>
            <span>manager@edusupport.com / manager123</span>
          </div>
        </div>
      </div>
    );
  }

  const isStaff = userRole === "STAFF";
  const isManager = userRole === "MANAGER";
  const isStudent = userRole === "STUDENT";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="mini-logo">E</div>

          <div>
            <strong>EduSupport</strong>
            <span>Student Support System</span>
          </div>
        </div>

        <div className="topbar-user">
          <div className="user-info">
            <strong>
              {isStudent
                ? "Student"
                : isStaff
                ? "Support Staff"
                : "Support Manager"}
            </strong>
            <span>{userEmail}</span>
          </div>

          <div className="role-pill">{userRole}</div>

          <button className="logout-button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow">
              {isStudent ? "Student Portal" : "Support Operations"}
            </p>

            <h1>
              {isStudent
                ? "My support requests"
                : isManager
                ? "Support overview"
                : "Support queue"}
            </h1>

            <p>
              {isStudent
                ? "Track your requests and their progress."
                : "Review, assign and resolve student requests."}
            </p>
          </div>

          {isStudent && (
            <button
              className="primary-button create-button"
              onClick={() => setShowCreate(true)}
            >
              + New request
            </button>
          )}
        </section>

        {error && (
          <div className="alert error-box">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {message && (
          <div className="alert success-box">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {(isStaff || isManager) && dashboard && (
          <section className="stats-grid">
            <StatCard
              label="Total tickets"
              value={dashboard.total_tickets}
            />

            <StatCard
              label="Open"
              value={dashboard.open_tickets}
            />

            <StatCard
              label="In progress"
              value={dashboard.in_progress_tickets}
            />

            <StatCard
              label="Pending"
              value={dashboard.pending_tickets}
            />

            <StatCard
              label="Resolved"
              value={dashboard.resolved_tickets}
            />

            <StatCard
              label="Overdue"
              value={dashboard.overdue_tickets}
              warning={dashboard.overdue_tickets > 0}
            />
          </section>
        )}

        <section className="content-grid">
          <div className="tickets-panel">
            <div className="panel-header">
              <div>
                <h2>Tickets</h2>
                <span>{filteredTickets.length} requests</span>
              </div>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">All statuses</option>

                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="ticket-list">
              {filteredTickets.length === 0 ? (
                <div className="empty-state">
                  <div>✓</div>
                  <strong>No tickets found</strong>
                  <span>
                    {isStudent
                      ? "Your support requests will appear here."
                      : "The queue is currently empty."}
                  </span>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <button
                    className={`ticket-row ${
                      selectedTicket?.id === ticket.id ? "selected" : ""
                    }`}
                    key={ticket.id}
                    onClick={() => openTicket(ticket)}
                  >
                    <div className="ticket-main">
                      <div className="ticket-number">
                        {ticket.ticket_number}
                      </div>

                      <strong>{ticket.subject}</strong>

                      <span>
                        {ticket.category} · Created{" "}
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>

                    <div className="ticket-right">
                      <StatusBadge status={ticket.status} />

                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedTicket && (
            <TicketDetails
              ticket={selectedTicket}
              activities={activities}
              canUpdate={isStaff || isManager}
              onUpdate={updateTicket}
              onClose={() => setSelectedTicket(null)}
              loading={loading}
            />
          )}
        </section>
      </main>

      {showCreate && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">Student request</p>
                <h2>Create support ticket</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={createTicket}>
              <label>Category</label>

              <select
                value={newTicket.category}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    category: e.target.value,
                  })
                }
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <label>Subject</label>

              <input
                value={newTicket.subject}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    subject: e.target.value,
                  })
                }
                placeholder="Briefly describe your issue"
                required
              />

              <label>Description</label>

              <textarea
                rows="5"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    description: e.target.value,
                  })
                }
                placeholder="Give the support team enough detail to help you."
                required
              />

              <label>Priority</label>

              <select
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({
                    ...newTicket,
                    priority: e.target.value,
                  })
                }
              >
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>

                <button
                  className="primary-button"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, warning }) {
  return (
    <div className={`stat-card ${warning ? "warning" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`priority-badge ${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}

function TicketDetails({
  ticket,
  activities,
  canUpdate,
  onUpdate,
  onClose,
  loading,
}) {
  return (
    <aside className="details-panel">
      <div className="details-header">
        <div>
          <span className="ticket-number">{ticket.ticket_number}</span>
          <h2>{ticket.subject}</h2>
        </div>

        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="details-badges">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="detail-section">
        <label>Description</label>
        <p>{ticket.description}</p>
      </div>

      <div className="detail-grid">
        <div>
          <span>Category</span>
          <strong>{ticket.category}</strong>
        </div>

        <div>
          <span>Assigned to</span>
          <strong>
            {ticket.assigned_to
              ? `Staff #${ticket.assigned_to}`
              : "Unassigned"}
          </strong>
        </div>

        <div>
          <span>SLA</span>
          <strong>{ticket.sla_hours} hours</strong>
        </div>

        <div>
          <span>Due</span>
          <strong>{formatDate(ticket.due_at)}</strong>
        </div>
      </div>

      {canUpdate && (
        <div className="staff-controls">
          <label>Status</label>

          <select
            value={ticket.status}
            disabled={loading}
            onChange={(e) =>
              onUpdate(ticket.id, {
                status: e.target.value,
              })
            }
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <label>Priority</label>

          <select
            value={ticket.priority}
            disabled={loading}
            onChange={(e) =>
              onUpdate(ticket.id, {
                priority: e.target.value,
              })
            }
          >
            {priorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>

          <label>Assignment</label>

          <select
            value={ticket.assigned_to || ""}
            disabled={loading}
            onChange={(e) =>
              onUpdate(ticket.id, {
                assigned_to: Number(e.target.value),
              })
            }
          >
            <option value="">Select staff</option>
            <option value="3">Staff #3</option>
          </select>
        </div>
      )}

      <div className="activity-section">
        <div className="section-title">
          <h3>Activity</h3>
          <span>{activities.length} updates</span>
        </div>

        {activities.length === 0 ? (
          <p className="muted">No activity recorded yet.</p>
        ) : (
          <div className="timeline">
            {activities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-dot" />

                <div>
                  <strong>{formatActivity(activity.activity_type)}</strong>

                  <p>{activity.description}</p>

                  <span>{formatDate(activity.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatActivity(value) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default App;