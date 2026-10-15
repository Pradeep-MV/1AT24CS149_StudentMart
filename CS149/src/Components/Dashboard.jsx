import { useState } from "react";
import Profile from "./Profile";

function Dashboard() {

    const [page, setPage] = useState("dashboard");

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="dashboard-container">

            {/* Navigation Bar */}
            <nav className="navbar">

                <h2>StudentMart</h2>

                <div className="nav-links">

                    <button onClick={() => setPage("dashboard")}>
                        Dashboard
                    </button>

                    <button onClick={() => setPage("profile")}>
                        Profile
                    </button>

                    <button onClick={() => setPage("edit")}>
                        Edit Profile
                    </button>

                </div>

            </nav>


            {/* Dashboard */}
            {page === "dashboard" && (

                <div className="dashboard-content">

                    <h1>Welcome to StudentMart</h1>

                    <p>
                        Welcome, {user?.name || "Student"}!
                    </p>

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

                </div>

            )}


            {/* Profile */}
            {page === "profile" && (

                <Profile
                    goToEdit={() => setPage("edit")}
                    goToDashboard={() => setPage("dashboard")}
                />

            )}


            {/* Edit Profile */}
            {page === "edit" && (

                <EditProfile
                    goToProfile={() => setPage("profile")}
                    goToDashboard={() => setPage("dashboard")}
                />

            )}

        </div>
    );
}

export default Dashboard;