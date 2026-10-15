import { useState } from "react";

function Profile({ goToDashboard }) {

    const user = JSON.parse(localStorage.getItem("user"));

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const [message, setMessage] = useState("");


    // Save updated profile
    const handleUpdate = (e) => {

        e.preventDefault();

        const updatedUser = {
            ...user,
            name: name,
            email: email
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setMessage("Profile updated successfully!");

        setIsEditing(false);
    };


    // EDIT PROFILE PAGE
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
                            />

                        </div>


                        <button type="submit">
                            Save Changes
                        </button>

                    </form>


                    <button
                        className="secondary-button"
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel
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
                        <strong>Name:</strong>{" "}
                        {name}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {email}
                    </p>

                </div>


                {message && (
                    <p className="success-message">
                        {message}
                    </p>
                )}


                <button
                    onClick={() => setIsEditing(true)}
                >
                    Edit Profile
                </button>


                <button
                    className="secondary-button"
                    onClick={goToDashboard}
                >
                    Back to Dashboard
                </button>

            </div>

        </div>

    );
}

export default Profile;