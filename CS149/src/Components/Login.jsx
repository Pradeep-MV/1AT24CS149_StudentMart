import { useState } from "react";

function Login({ onLogin, onRegisterClick }) {
    const [loginRole, setLoginRole] = useState("student"); // "student" or "admin"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5002/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        requiredRole: loginRole === "admin" ? "admin" : undefined
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                // Save user information including role
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Open Dashboard
                if (onLogin) {
                    onLogin(data.user);
                }
            } else {
                setMessage(
                    data.message || "Login failed"
                );
            }
        } catch (error) {
            console.error(error);
            setMessage("Cannot connect to server. Please ensure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            {/* Role Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
                <button
                    type="button"
                    onClick={() => {
                        setLoginRole("student");
                        setMessage("");
                    }}
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: loginRole === "student" ? "#2563eb" : "#f1f5f9",
                        color: loginRole === "student" ? "#ffffff" : "#475569",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "0.2s"
                    }}
                >
                    👨‍🎓 Student Login
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setLoginRole("admin");
                        setMessage("");
                    }}
                    style={{
                        flex: 1,
                        padding: "10px",
                        background: loginRole === "admin" ? "#0f172a" : "#f1f5f9",
                        color: loginRole === "admin" ? "#ffffff" : "#475569",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "0.2s"
                    }}
                >
                    🛡️ Admin Portal
                </button>
            </div>

            <h2>{loginRole === "admin" ? "Admin Sign In" : "Student Login"}</h2>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "13px", marginTop: "-15px", marginBottom: "20px" }}>
                {loginRole === "admin"
                    ? "Store administrator & catalog management access"
                    : "Log in to browse products and manage your cart"}
            </p>

            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={loginRole === "admin" ? "admin@studentmart.com" : "Enter your email"}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />
                </div>

                {loginRole === "admin" && (
                    <div style={{ background: "#f8fafc", padding: "10px 12px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#64748b", marginBottom: "15px" }}>
                        💡 <strong>Default Admin Credentials:</strong><br />
                        Email: <code>admin@studentmart.com</code><br />
                        Password: <code>admin123</code>
                    </div>
                )}

                {message && (
                    <p className="error-message" style={{ color: "#ef4444", fontSize: "14px", marginBottom: "15px" }}>
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        backgroundColor: loginRole === "admin" ? "#0f172a" : "#2563eb"
                    }}
                >
                    {loading ? "Verifying..." : loginRole === "admin" ? "Login as Admin" : "Login"}
                </button>
            </form>

            <p className="auth-switch">
                Don't have an account?{" "}
                <button
                    type="button"
                    className="link-button"
                    onClick={onRegisterClick}
                >
                    Register here
                </button>
            </p>
        </div>
    );
}

export default Login;