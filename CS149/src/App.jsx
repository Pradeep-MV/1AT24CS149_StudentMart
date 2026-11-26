import { useEffect, useRef, useState } from "react";

import Home, { StudentMartLogo } from "./Components/Home";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";

import "./App.css";

function App() {
    const [page, setPage] = useState("home");
    const pendingSectionRef = useRef(null);

    const [loggedIn, setLoggedIn] = useState(
        Boolean(localStorage.getItem("user"))
    );

    useEffect(() => {
        if (page === "home" && pendingSectionRef.current) {
            const targetId = pendingSectionRef.current;
            pendingSectionRef.current = null;
            requestAnimationFrame(() => {
                const el = document.getElementById(targetId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            });
        }
    }, [page]);

    // Successful login
    const handleLogin = () => {
        setLoggedIn(true);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("user");
        setLoggedIn(false);
        setPage("home");
    };

    const navigateHomeSection = (sectionId) => {
        if (page !== "home") {
            pendingSectionRef.current = sectionId;
            setPage("home");
        } else {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    // Show Dashboard after login
    if (loggedIn) {
        return <Dashboard onLogout={handleLogout} />;
    }

    return (
        <div className="sm-public-shell">
            {/* Public Navigation Bar */}
            <header className="sm-public-navbar">
                <div className="sm-public-navbar-inner">
                    <button
                        type="button"
                        className="sm-brand-btn"
                        onClick={() => {
                            pendingSectionRef.current = null;
                            setPage("home");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <StudentMartLogo size={38} />
                        <span className="sm-brand-text">
                            <span className="sm-brand-name">StudentMart</span>
                            <span className="sm-brand-tag">Campus Essentials Store</span>
                        </span>
                    </button>

                    <nav className="sm-nav-links" aria-label="Primary navigation">
                        <button
                            type="button"
                            className={`sm-nav-link ${page === "home" ? "active" : ""}`}
                            onClick={() => {
                                pendingSectionRef.current = null;
                                setPage("home");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            className="sm-nav-link"
                            onClick={() => navigateHomeSection("about")}
                        >
                            About
                        </button>
                        <button
                            type="button"
                            className="sm-nav-link"
                            onClick={() => navigateHomeSection("contact")}
                        >
                            Contact
                        </button>
                        <button
                            type="button"
                            className={`sm-nav-link signin-btn ${page === "register" ? "active" : ""}`}
                            onClick={() => setPage("register")}
                        >
                            Sign-in
                        </button>
                        <button
                            type="button"
                            className={`sm-nav-link login-btn ${page === "login" ? "active" : ""}`}
                            onClick={() => setPage("login")}
                        >
                            Login
                        </button>
                    </nav>
                </div>
            </header>

            {page === "home" ? (
                <Home onNavigate={(targetPage) => setPage(targetPage)} />
            ) : (
                <div className="sm-public-auth-wrap">
                    {page === "login" ? (
                        <Login
                            onLogin={handleLogin}
                            onRegisterClick={() => setPage("register")}
                        />
                    ) : (
                        <>
                            <Register />

                            <p className="auth-switch">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => setPage("login")}
                                >
                                    Login here
                                </button>
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
