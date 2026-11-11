
import { useState } from "react";
import Profile from "./Profile";
import ProductGrid from "./Productgrid";
import ProductDetails from "./Productdetails";

function Dashboard({ onLogout }) {
    const [page, setPage] = useState("dashboard");
    const [selectedProductId, setSelectedProductId] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    const openProductDetails = (productId) => {
        setSelectedProductId(productId);
        setPage("productDetails");
    };

    const goToProducts = () => {
        setSelectedProductId(null);
        setPage("products");
    };

    const renderMainContent = () => {
        switch (page) {
            case "profile":
            case "edit":
                return (
                    <Profile
                        key={page}
                        initialEditing={page === "edit"}
                        onBack={() => setPage("dashboard")}
                    />
                );

            case "products":
                return (
                    <ProductGrid
                        onViewDetails={openProductDetails}
                    />
                );

            case "productDetails":
                return (
                    <ProductDetails
                        productId={selectedProductId}
                        onBack={goToProducts}
                    />
                );

            case "cart":
                return (
                    <section className="sm-placeholder-page">
                        <h2>My Cart</h2>
                        <p>Your shopping cart will appear here.</p>
                        <p>We will connect this page to your Cart API next.</p>
                    </section>
                );

            default:
                return (
                    <main className="sm-dashboard-content">
                        <section className="sm-welcome-section">
                            <h1>Welcome to StudentMart</h1>
                            <p>
                                Welcome, {user?.name || "Student"}!
                            </p>
                            <p className="sm-welcome-subtitle">
                                Find everything you need for student life.
                            </p>
                        </section>

                        <section className="sm-dashboard-cards">
                            <article className="sm-dashboard-card">
                                <h3>My Profile</h3>
                                <p>View your personal information.</p>
                                <button
                                    onClick={() => setPage("profile")}
                                >
                                    View Profile
                                </button>
                            </article>

                            <article className="sm-dashboard-card">
                                <h3>Edit Profile</h3>
                                <p>Update your profile information.</p>
                                <button
                                    onClick={() => setPage("edit")}
                                >
                                    Edit Profile
                                </button>
                            </article>
                        </section>

                        <section className="sm-dashboard-products">
                            <ProductGrid
                                onViewDetails={openProductDetails}
                            />
                        </section>
                    </main>
                );
        }
    };

    return (
        <div className="sm-app">
            {/* Centered Header */}
            <header className="sm-header">
                <h1>StudentMart</h1>
            </header>

            <div className="sm-layout">
                {/* Left Sidebar */}
                <aside className="sm-sidebar">
                    <h3 className="sm-sidebar-heading">MAIN MENU</h3>

                    <button
                        className={page === "dashboard" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("dashboard")}
                    >
                        <span>⌂</span> Dashboard
                    </button>

                    <button
                        className={page === "profile" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("profile")}
                    >
                        <span>👤</span> My Profile
                    </button>

                    <button
                        className={page === "edit" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("edit")}
                    >
                        <span>✎</span> Edit Profile
                    </button>

                    <button
                        className={
                            page === "products" || page === "productDetails"
                                ? "sm-nav-item active"
                                : "sm-nav-item"
                        }
                        onClick={goToProducts}
                    >
                        <span>▣</span> Products
                    </button>

                    <button
                        className={page === "cart" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("cart")}
                    >
                        <span>🛒</span> My Cart
                    </button>

                    <div className="sm-sidebar-bottom">
                        <button
                            className="sm-nav-item sm-logout"
                            onClick={onLogout}
                        >
                            <span>↪</span> Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="sm-main-content">
                    {renderMainContent()}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
