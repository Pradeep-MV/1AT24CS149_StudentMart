import { useEffect, useState } from "react";
import "./Styles/UserManagement.css";

const API = "http://localhost:5002/api/users";

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [actionId, setActionId] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        let isMounted = true;

        const loadUsers = async () => {
            try {
                const response = await fetch(API);
                const data = await response.json();

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load users");
                }

                setUsers(data);
            } catch (error) {
                if (isMounted) {
                    setMessage({
                        text: error.message || "Unable to connect to users server",
                        type: "error"
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadUsers();

        return () => {
            isMounted = false;
        };
    }, []);

    // Toggle Role (Student <-> Admin)
    const handleToggleRole = async (targetUser) => {
        const newRole = targetUser.role === "admin" ? "student" : "admin";

        if (!window.confirm(`Change ${targetUser.name}'s role to "${newRole.toUpperCase()}"?`)) {
            return;
        }

        try {
            setActionId(targetUser._id);
            setMessage({ text: "", type: "" });

            const response = await fetch(`${API}/${targetUser._id}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update role");
            }

            setUsers((prev) =>
                prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
            );

            setMessage({
                text: `${targetUser.name}'s role updated to ${newRole.toUpperCase()}`,
                type: "success"
            });
        } catch (error) {
            setMessage({ text: error.message || "Error updating role", type: "error" });
        } finally {
            setActionId(null);
        }
    };

    // Delete User
    const handleDeleteUser = async (targetUser) => {
        if (!window.confirm(`Are you sure you want to delete user ${targetUser.name} (${targetUser.email})?`)) {
            return;
        }

        try {
            setActionId(targetUser._id);
            setMessage({ text: "", type: "" });

            const response = await fetch(`${API}/${targetUser._id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete user");
            }

            setUsers((prev) => prev.filter((u) => u._id !== targetUser._id));

            setMessage({
                text: `User ${targetUser.name} deleted successfully.`,
                type: "success"
            });
        } catch (error) {
            setMessage({ text: error.message || "Error deleting user", type: "error" });
        } finally {
            setActionId(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        const query = search.toLowerCase();
        return (
            u.name?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.usn?.toLowerCase().includes(query) ||
            u.role?.toLowerCase().includes(query)
        );
    });

    return (
        <section className="user-mgmt-page">
            <div className="user-mgmt-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage student accounts and administrator permissions.</p>
                </div>
                <span className="user-mgmt-count-badge">
                    Total: {users.length} Registered Accounts
                </span>
            </div>

            {message.text && (
                <div className={`user-mgmt-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="user-mgmt-search">
                <input
                    type="search"
                    placeholder="Search by name, email, USN, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="user-mgmt-card">
                <div className="user-mgmt-table-wrapper">
                    <table className="user-mgmt-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>USN</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>College</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                                        No users matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const isSelf = u._id === currentUser?.id || u._id === currentUser?._id;
                                    const isDefaultAdmin = u.email === "admin@studentmart.com";

                                    return (
                                        <tr key={u._id}>
                                            <td>
                                                <strong>{u.name || "N/A"}</strong>
                                                {isSelf && <span style={{ marginLeft: "6px", color: "#2563eb", fontSize: "11px" }}>(You)</span>}
                                            </td>
                                            <td><code>{u.usn || "N/A"}</code></td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`role-badge ${u.role || "student"}`}>
                                                    {u.role || "student"}
                                                </span>
                                            </td>
                                            <td>{u.college || "—"}</td>
                                            <td>
                                                {u.createdAt
                                                    ? new Date(u.createdAt).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                            <td>
                                                {isDefaultAdmin ? (
                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                                                        System Root
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="user-action-btn role-toggle"
                                                            onClick={() => handleToggleRole(u)}
                                                            disabled={actionId === u._id}
                                                        >
                                                            {u.role === "admin" ? "Demote" : "Make Admin"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="user-action-btn delete"
                                                            onClick={() => handleDeleteUser(u)}
                                                            disabled={actionId === u._id || isSelf}
                                                        >
                                                            {actionId === u._id ? "..." : "Delete"}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

export default UserManagement;