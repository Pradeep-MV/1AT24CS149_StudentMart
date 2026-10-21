import { useState } from "react";

function Register() {
    const [name, setName] = useState("");
    const [usn, setUsn] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch(
                "http://localhost:5002/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        usn,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Registration failed");
                return;
            }

            setMessage(data.message || "Registration successful");

            setName("");
            setUsn("");
            setEmail("");
            setPassword("");

        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Cannot connect to the server");
        }
    };

    return (
        <div className="register-card">
            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                    />
                </div>

                <div>
                    <label>USN</label>
                    <input
                        type="text"
                        value={usn}
                        onChange={(e) =>
                            setUsn(e.target.value.toUpperCase())
                        }
                        placeholder="Enter your USN"
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                        minLength={6}
                        required
                    />
                </div>

                <button type="submit">Register</button>
            </form>

            {message && (
                <p className="register-message">{message}</p>
            )}
        </div>
    );
}

export default Register;
