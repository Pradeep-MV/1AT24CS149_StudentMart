import { useState } from "react";

function Profile({ goToDashboard }) {

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const [message, setMessage] = useState("");

    // Save updated profile
    const handleUpdate = (e) => {
        e.preventDefault();

        const updatedUser = {
            ...user,
            name: name.trim(),
            email: email.trim().toLowerCase()
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setMessage("Profile updated successfully!");
        setIsEditing(false);
    };

    // EDIT PROFILE
    if (isEditing) {
        return (
            <div className="profile-container">
                <div className="profile-card">

                    <h1>Edit Profile</h1>

                    <form onSubmit={handleUpdate}>
                        <div>
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button type="submit">
                            Save Changes
                        </button>
                    </form>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                            setIsEditing(false);
                            setName(user?.name || "");
                            setEmail(user?.email || "");
                            setMessage("");
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={goToDashboard}
                    >
                        Back to Dashboard
                    </button>

                </div>
            </div>
        );
    }

    // PROFILE PAGE
    return (
        <div className="profile-container">
            <div className="profile-card">

                <h1>My Profile</h1>

                <div className="profile-info">
                    <p>
                        <strong>Name:</strong>
                        <span>{name || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>Email:</strong>
                        <span>{email || "Not provided"}</span>
                    </p>
                </div>

                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}

                <button
                    type="button"
                    onClick={() => {
                        setMessage("");
                        setIsEditing(true);
                    }}
                >
                    Edit Profile
                </button>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                        if (typeof goToDashboard === "function") {
                            goToDashboard();
                        }
                    }}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default Profile;