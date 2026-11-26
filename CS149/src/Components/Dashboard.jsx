import { useState } from "react";
import Profile from "./Profile";
import ProductGrid from "./Productgrid";
import ProductDetails from "./Productdetails";
import ProductForm from "./Productform";
import Cart from "./Cart";
import Orders from "./Orders";
import UserManagement from "./UserManagement";
import "./Styles/Dashboard3d.css";;

function Dashboard({ onLogout }) {
    const [page, setPage] = useState("dashboard");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const isAdmin = user?.role === "admin";

    const openProductDetails = (productId) => {
        setSelectedProductId(productId);
        setPage("productDetails");
    };

    const goToProducts = () => {
        setSelectedProductId(null);
        setEditingProduct(null);
        setPage("products");
    };

    const handleStartEdit = (product) => {
        setEditingProduct(product);
        setPage("editProduct");
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
                        onEditProduct={handleStartEdit}
                    />
                );

            case "addProduct":
                return (
                    <ProductForm
                        key="new-product"
                        onProductAdded={() => {
                            goToProducts();
                        }}
                        onCancel={goToProducts}
                    />
                );

            case "editProduct":
                return (
                    <ProductForm
                        key={editingProduct?._id || "edit-product"}
                        editProduct={editingProduct}
                        onProductUpdated={() => {
                            goToProducts();
                        }}
                        onCancel={goToProducts}
                    />
                );

            case "users":
                return <UserManagement />;

            case "orders":
                return (
                    <Orders
                        onBrowseProducts={goToProducts}
                    />
                );

            case "productDetails":
                return (
                    <ProductDetails
                        productId={selectedProductId}
                        onBack={goToProducts}
                        onGoToCart={() => setPage("cart")}
                        onEditProduct={handleStartEdit}
                    />
                );

            case "cart":
                return (
                    <Cart
                        onBrowseProducts={goToProducts}
                        onGoToOrders={() => setPage("orders")}
                    />
                );

            default:
                return (
                    <main className="sm-dashboard-content">
                        {/* 3D Elevated Centered Hero Banner */}
                        <section className="dash3d-hero">
                            <div className="dash3d-hero-content">
                                <div className={`dash3d-pill-badge ${isAdmin ? "admin" : "student"}`}>
                                    <span>{isAdmin ? "🛡️" : "🎓"}</span>
                                    <span>{isAdmin ? "ADMINISTRATOR ACCESS" : "STUDENT ACCOUNT"}</span>
                                </div>

                                <h1>
                                    Welcome back,{" "}
                                    <span className="dash3d-hero-name">
                                        {user?.name || (isAdmin ? "Administrator" : "Student")}
                                    </span>!
                                </h1>

                                <p>
                                    {isAdmin
                                        ? "Full store control enabled. You can add, edit, or delete items from the store catalog, track all student orders, and administer student accounts."
                                        : "Find textbooks, campus stationery, and student essentials, manage your personal shopping cart, and track your active campus orders."}
                                </p>

                                {/* Mini 3D Stat Badges */}
                                <div className="dash3d-stats-row">
                                    {isAdmin ? (
                                        <>
                                            <span className="dash3d-stat-pill">🏷️ Catalog Control Active</span>
                                            <span className="dash3d-stat-pill">📦 Order Management Ready</span>
                                            <span className="dash3d-stat-pill">👥 User Admin Enabled</span>
                                            <span className="dash3d-stat-pill">🔒 Role: Admin</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="dash3d-stat-pill">🚚 Campus Delivery: Free</span>
                                            <span className="dash3d-stat-pill">📦 Order Tracking Enabled</span>
                                            <span className="dash3d-stat-pill">⚡ Verified Student Store</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 3D Floating Action Cards Grid */}
                        {isAdmin ? (
                            <section className="dash3d-grid">
                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-blue">
                                            📦
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Manage Products</h3>
                                            <p>View, modify pricing, edit stock inventory, or delete products.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-blue"
                                        onClick={goToProducts}
                                    >
                                        Manage Catalog →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-emerald">
                                            ✨
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Add New Product</h3>
                                            <p>Upload a new product with stock, category, price, and images.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-emerald"
                                        onClick={() => setPage("addProduct")}
                                    >
                                        + Add Product
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-indigo">
                                            📋
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Manage Orders</h3>
                                            <p>Track all customer orders, update delivery status, and view details.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-blue"
                                        onClick={() => setPage("orders")}
                                    >
                                        View All Orders →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-purple">
                                            👥
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Manage Users</h3>
                                            <p>View registered accounts, change roles, and manage permissions.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-purple"
                                        onClick={() => setPage("users")}
                                    >
                                        View Accounts →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-amber">
                                            👤
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Admin Profile</h3>
                                            <p>Review administrator credentials and personal account details.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-amber"
                                        onClick={() => setPage("profile")}
                                    >
                                        My Profile →
                                    </button>
                                </article>
                            </section>
                        ) : (
                            <section className="dash3d-grid">
                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-blue">
                                            🛍️
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Explore Store</h3>
                                            <p>Discover textbooks, stationery, and gadgets at budget student prices.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-blue"
                                        onClick={goToProducts}
                                    >
                                        Browse Catalog →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-emerald">
                                            🛒
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>My Cart</h3>
                                            <p>Review items in your cart, change quantities, and checkout.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-emerald"
                                        onClick={() => setPage("cart")}
                                    >
                                        Open Cart →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-indigo">
                                            📦
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>My Orders</h3>
                                            <p>Track your active orders, delivery updates, and purchase history.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-blue"
                                        onClick={() => setPage("orders")}
                                    >
                                        Track Orders →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-purple">
                                            🎓
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>My Profile</h3>
                                            <p>View your registered USN, student email, and academic details.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-purple"
                                        onClick={() => setPage("profile")}
                                    >
                                        View Profile →
                                    </button>
                                </article>

                                <article className="dash3d-card">
                                    <div className="dash3d-card-top">
                                        <div className="dash3d-icon-block dash3d-icon-amber">
                                            ✏️
                                        </div>
                                        <div className="dash3d-card-text">
                                            <h3>Edit Profile</h3>
                                            <p>Update your phone number, college campus, and current semester.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="dash3d-btn dash3d-btn-amber"
                                        onClick={() => setPage("edit")}
                                    >
                                        Update Details →
                                    </button>
                                </article>
                            </section>
                        )}
                    </main>
                );
        }
    };

    return (
        <div className="sm-app">
            {/* Centered Header */}
            <header className="sm-header">
                <h1>{isAdmin ? "StudentMart • Admin Portal" : "StudentMart"}</h1>
            </header>

            <div className="sm-layout">
                {/* Left Sidebar */}
                <aside className="sm-sidebar">
                    <h3 className="sm-sidebar-heading">
                        {isAdmin ? "ADMIN MENU" : "MAIN MENU"}
                    </h3>

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
                        <span>▣</span> {isAdmin ? "Manage Products" : "Products"}
                    </button>

                    {/* Admin Only Navigation */}
                    {isAdmin && (
                        <>
                            <button
                                type="button"
                                className={page === "addProduct" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("addProduct")}
                            >
                                <span>➕</span> Add Product
                            </button>

                            <button
                                type="button"
                                className={page === "orders" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("orders")}
                            >
                                <span>📦</span> All Orders
                            </button>

                            <button
                                type="button"
                                className={page === "users" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("users")}
                            >
                                <span>👥</span> Manage Users
                            </button>
                        </>
                    )}

                    {/* Student Only Navigation */}
                    {!isAdmin && (
                        <>
                            <button
                                type="button"
                                className={page === "cart" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("cart")}
                            >
                                <span>🛒</span> My Cart
                            </button>

                            <button
                                type="button"
                                className={page === "orders" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("orders")}
                            >
                                <span>📦</span> My Orders
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        className={page === "profile" ? "sm-nav-item active" : "sm-nav-item"}
                        onClick={() => setPage("profile")}
                    >
                        <span>👤</span> My Profile
                    </button>

                    {!isAdmin && (
                        <button
                            type="button"
                            className={page === "edit" ? "sm-nav-item active" : "sm-nav-item"}
                            onClick={() => setPage("edit")}
                        >
                            <span>✎</span> Edit Profile
                        </button>
                    )}

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