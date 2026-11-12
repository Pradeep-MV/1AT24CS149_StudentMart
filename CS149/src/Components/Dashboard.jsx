import { useState } from "react";
import Profile from "./Profile";
import ProductGrid from "./Productgrid";
import ProductDetails from "./Productdetails";
import ProductForm from "./Productform";
import Cart from "./Cart";
import UserManagement from "./UserManagement";

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
                    />
                );

            default:
                return (
                    <main className="sm-dashboard-content">
                        <section className="sm-welcome-section">
                            <h1>
                                {isAdmin ? "🛡️ Admin Control Center" : "Welcome to StudentMart"}
                            </h1>
                            <p>
                                Welcome back, <strong>{user?.name || (isAdmin ? "Administrator" : "Student")}</strong>!
                                {isAdmin && (
                                    <span style={{
                                        marginLeft: "10px",
                                        background: "#fef3c7",
                                        color: "#92400e",
                                        padding: "3px 10px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                        fontWeight: "700"
                                    }}>
                                        ADMINISTRATOR
                                    </span>
                                )}
                            </p>
                            <p className="sm-welcome-subtitle">
                                {isAdmin
                                    ? "Full administrative control: manage catalog, add/modify products, and administer student accounts."
                                    : "Explore textbooks, campus supplies, and student items at budget-friendly prices."}
                            </p>
                        </section>

                        {/* Admin Action Cards */}
                        {isAdmin ? (
                            <section className="sm-dashboard-cards">
                                <article className="sm-dashboard-card">
                                    <h3>Manage Products</h3>
                                    <p>View, edit, or remove items from the store catalog.</p>
                                    <button
                                        type="button"
                                        onClick={goToProducts}
                                    >
                                        Manage Catalog
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>Add New Product</h3>
                                    <p>Upload a new product with stock and pricing to the store.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("addProduct")}
                                    >
                                        + Add Product
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>Manage Users</h3>
                                    <p>View student accounts, promote administrators, and manage users.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("users")}
                                    >
                                        View Accounts
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>Admin Profile</h3>
                                    <p>Review and edit administrator profile information.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("profile")}
                                    >
                                        View Profile
                                    </button>
                                </article>
                            </section>
                        ) : (
                            /* Student Action Cards */
                            <section className="sm-dashboard-cards">
                                <article className="sm-dashboard-card">
                                    <h3>Explore Store</h3>
                                    <p>Discover campus essentials and textbooks at student prices.</p>
                                    <button
                                        type="button"
                                        onClick={goToProducts}
                                    >
                                        Browse Products
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>My Cart</h3>
                                    <p>Review items in your shopping cart and place orders.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("cart")}
                                    >
                                        Open Cart
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>My Profile</h3>
                                    <p>View your USN, personal information and settings.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("profile")}
                                    >
                                        View Profile
                                    </button>
                                </article>

                                <article className="sm-dashboard-card">
                                    <h3>Edit Profile</h3>
                                    <p>Update your contact number, college, and semester details.</p>
                                    <button
                                        type="button"
                                        onClick={() => setPage("edit")}
                                    >
                                        Edit Profile
                                    </button>
                                </article>
                            </section>
                        )}

                        <section className="sm-dashboard-products">
                            <ProductGrid
                                onViewDetails={openProductDetails}
                                onAddNewProduct={() => setPage("addProduct")}
                                onEditProduct={handleStartEdit}
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
                                className={page === "users" ? "sm-nav-item active" : "sm-nav-item"}
                                onClick={() => setPage("users")}
                            >
                                <span>👥</span> Manage Users
                            </button>
                        </>
                    )}

                    {/* Student Only Navigation */}
                    {!isAdmin && (
                        <button
                            type="button"
                            className={page === "cart" ? "sm-nav-item active" : "sm-nav-item"}
                            onClick={() => setPage("cart")}
                        >
                            <span>🛒</span> My Cart
                        </button>
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