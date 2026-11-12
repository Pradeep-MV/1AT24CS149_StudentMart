import { useState } from "react";

function Profile({ goToDashboard, onBack, initialEditing }) {
    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [college, setCollege] = useState(user?.college || "");
    const [course, setCourse] = useState(user?.course || "");
    const [semester, setSemester] = useState(user?.semester || "");
    const [message, setMessage] = useState("");

    const handleBack = () => {
        if (typeof onBack === "function") {
            onBack();
        } else if (typeof goToDashboard === "function") {
            goToDashboard();
        }
    };

    // Save updated profile
    const handleUpdate = (e) => {
        e.preventDefault();

        const updatedUser = {
            ...user,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            college: college.trim(),
            course: course.trim(),
            semester: semester.trim()
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
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
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
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label>College</label>
                            <input
                                type="text"
                                value={college}
                                onChange={(e) => setCollege(e.target.value)}
                                placeholder="College name"
                            />
                        </div>

                        <div>
                            <label>Course</label>
                            <input
                                type="text"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                placeholder="e.g. B.Tech Computer Science"
                            />
                        </div>

                        <div>
                            <label>Semester</label>
                            <input
                                type="text"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                                placeholder="e.g. 5th Sem"
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
                            setPhone(user?.phone || "");
                            setCollege(user?.college || "");
                            setCourse(user?.course || "");
                            setSemester(user?.semester || "");
                            setMessage("");
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={handleBack}
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
                        <strong>USN:</strong>
                        <span>{user?.usn || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>Email:</strong>
                        <span>{email || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        <span>{phone || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>College:</strong>
                        <span>{college || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>Course:</strong>
                        <span>{course || "Not provided"}</span>
                    </p>

                    <p>
                        <strong>Semester:</strong>
                        <span>{semester || "Not provided"}</span>
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
                    onClick={handleBack}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default Profile;