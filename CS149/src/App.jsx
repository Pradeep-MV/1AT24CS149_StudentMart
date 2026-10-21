import { useState } from "react";

import Register from "./Components/Register";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";

import "./App.css";

function App() {
    const [page, setPage] = useState("login");

    const [loggedIn, setLoggedIn] = useState(
        Boolean(localStorage.getItem("user"))
    );

    // Successful login
    const handleLogin = () => {
        setLoggedIn(true);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("user");
        setLoggedIn(false);
        setPage("login");
    };

    // Show Dashboard after login
    if (loggedIn) {
        return <Dashboard onLogout={handleLogout} />;
    }

    return (
        <div className="auth-container">
            <h1 className="app-title">StudentMart</h1>

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
    );
}

export default App;
