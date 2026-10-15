import { useState } from "react";
import Dashboard from "./Dashboard";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);


    const handleLogin = async (e) => {

        e.preventDefault();

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
                        password
                    })
                }
            );


            const data = await response.json();


            if (response.ok) {

                // Save user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                // Open Dashboard
                setLoggedIn(true);

            }
            else {

                setMessage(data.message);

            }

        }
        catch (error) {

            console.error(error);

            setMessage("Something went wrong");

        }
    };


    // If login successful
    if (loggedIn) {
        return <Dashboard />;
    }


    return (

        <div>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div>

                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        placeholder="Enter your email"
                    />

                </div>


                <div>

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        placeholder="Enter your password"
                    />

                </div>


                <button type="submit">
                    Login
                </button>

            </form>


            {message && (
                <p>{message}</p>
            )}

        </div>
    );
}

export default Login;