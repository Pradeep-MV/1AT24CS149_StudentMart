import { useState } from "react";
import Profile from "./Profile";
import ProductGrid from "./Productgrid";
import ProductDetails from "./Productdetails";
import ProductForm from "./Productform";
import Cart from "./Cart";

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
                        goToDashboard={() => setPage("dashboard")}
                        onBack={() => setPage("dashboard")}
                    />
                );

            case "products":
                return (
                    <ProductGrid
                        onViewDetails={openProductDetails}
                        onAddNewProduct={() => setPage("addProduct")}
                    />
                );

            case "addProduct":
                return (
                    <ProductForm
                        onProductAdded={() => {
                            goToProducts();
                        }}
                        onCancel={goToProducts}
                    />
                );

            case "productDetails":
                return (
                    <ProductDetails
                        productId={selectedProductId}
                        onBack={goToProducts}
                        onGoToCart={() => setPage("cart")}
                    />
                );

            case "cart":
                return (
                    <Cart
                        onBrowseProducts={goToProducts}
                    />
                );

            default:
                return (
                    <main className="sm-dashboard-content">
                        <section className="sm-welcome-section">
                            <h1>Welcome to StudentMart</h1>
                            <p>
                                Welcome back, {user?.name || "Student"}!
                            </p>
                            <p className="sm-welcome-subtitle">
                                Find textbooks, electronics, campus essentials, or list your own items for sale.
                            </p>
                        </section>

                        <section className="sm-dashboard-cards">
                            <article className="sm-dashboard-card">
                                <h3>Explore Store</h3>
                                <p>Discover campus essentials and textbooks at student prices.</p>
                                <button
                                    type="button"
                                    onClick={goToProducts}
                                >
                                    View Products
                                </button>
                            </article>

                            <article className="sm-dashboard-card">
                                <h3>Sell an Item</h3>
                                <p>List your stationery, textbooks, or gadgets for other students.</p>
                                <button
                                    type="button"
                                    onClick={() => setPage("addProduct")}
                                >
                                    Add Product
                                </button>
                            </article>

                            <article className="sm-dashboard-card">
                                <h3>My Cart</h3>
                                <p>Review items you saved and proceed to checkout.</p>
                                <button
                                    type="button"
                                    onClick={() => setPage("cart")}
                                >
                                    Open Cart
                                </button>
                            </article>

                            <article className="sm-dashboard-card">
                                <h3>My Profile</h3>
                                <p>Manage your USN, personal information and settings.</p>
                                <button
                                    type="button"
                                    onClick={() => setPage("profile")}
                                >
                                    View Profile
                                </button>
                            </article>
                        </section>

                        <section className="sm-dashboard-products">
                            <ProductGrid
                                onViewDetails={openProductDetails}
                                onAddNewProduct={() => setPage("addProduct")}
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
                        type="button"
                        className={page === "dashboard" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("dashboard")}
                    >
                        <span>⌂</span> Dashboard
                    </button>

                    <button
                        type="button"
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
                        type="button"
                        className={page === "addProduct" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("addProduct")}
                    >
                        <span>➕</span> Add Product
                    </button>

                    <button
                        type="button"
                        className={page === "cart" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("cart")}
                    >
                        <span>🛒</span> My Cart
                    </button>

                    <button
                        type="button"
                        className={page === "profile" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("profile")}
                    >
                        <span>👤</span> My Profile
                    </button>

                    <button
                        type="button"
                        className={page === "edit" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("edit")}
                    >
                        <span>✎</span> Edit Profile
                    </button>

                    <div className="sm-sidebar-bottom">
                        <button
                            type="button"
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