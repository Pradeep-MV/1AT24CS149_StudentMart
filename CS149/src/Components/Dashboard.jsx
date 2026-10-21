
import { useState } from "react";
import Profile from "./Profile";

function Dashboard({ onLogout }) {
    const [page, setPage] = useState("dashboard");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    return (
        <div className="dashboard-container">

            {/* Navigation Bar */}
            <nav className="navbar">
                <h2>StudentMart</h2>

                <div className="nav-links">

                    <button
                        className={page === "dashboard" ? "active" : ""}
                        onClick={() => setPage("dashboard")}
                    >
                        Dashboard
                    </button>

                    <button
                        className={page === "profile" ? "active" : ""}
                        onClick={() => setPage("profile")}
                    >
                        Profile
                    </button>

                    <button
                        className={page === "edit" ? "active" : ""}
                        onClick={() => setPage("edit")}
                    >
                        Edit Profile
                    </button>

                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>
            </nav>

            {/* Dashboard Page */}
            {page === "dashboard" && (
                <main className="dashboard-content">

                    <div className="welcome-section">
                        <h1>Welcome to StudentMart</h1>

                        <p>
                            Welcome, {user?.name || "Student"}!
                        </p>
                    </div>

                    <div className="dashboard-cards">

                        <div className="dashboard-card">
                            <h3>My Profile</h3>

                            <p>
                                View your personal information.
                            </p>

                            <button
                                onClick={() => setPage("profile")}
                            >
                                View Profile
                            </button>
                        </div>

                        <div className="dashboard-card">
                            <h3>Edit Profile</h3>

                            <p>
                                Update your profile information.
                            </p>

                            <button
                                onClick={() => setPage("edit")}
                            >
                                Edit Profile
                            </button>
                        </div>

                    </div>
                </main>
            )}

            {/* Profile and Edit Profile */}
            {(page === "profile" || page === "edit") && (
                <Profile
                    key={page}
                    initialEditing={page === "edit"}
                    onBack={() => setPage("dashboard")}
                />
            )}

        </div>
    );
}

export default Dashboard;
