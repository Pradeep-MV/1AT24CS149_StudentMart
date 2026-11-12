import { useEffect, useState } from "react";
import "./Styles/Cart.css";

const API = "http://localhost:5002/api/cart";

function generateOrderId() {
    return `SM-${Math.floor(100000 + Math.random() * 900000)}`;
}

function Cart({ onBrowseProducts }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [orderSuccess, setOrderSuccess] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;

    // Helper to get auth headers
    const getHeaders = () => {
        const headers = { "Content-Type": "application/json" };
        if (userId) {
            headers["x-user-id"] = userId;
        }
        return headers;
    };

    // Load Cart via Effect
    useEffect(() => {
        let isMounted = true;

        const loadCart = async () => {
            if (!userId) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await fetch(API, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId
                    }
                });
                const data = await response.json();

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(data.message || "Unable to fetch cart");
                }

                setCart(data);
            } catch (error) {
                if (isMounted) {
                    setMessage({
                        text: error.message || "Failed to connect to cart server",
                        type: "error"
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadCart();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    // Update Item Quantity
    const handleUpdateQuantity = async (productId, newQuantity, maxStock) => {
        if (newQuantity < 1) return;
        if (maxStock !== undefined && newQuantity > maxStock) {
            setMessage({
                text: `Sorry, only ${maxStock} items available in stock.`,
                type: "error"
            });
            return;
        }

        try {
            setActionLoading(true);
            setMessage({ text: "", type: "" });

            const response = await fetch(`${API}/update/${productId}`, {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify({ quantity: newQuantity })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update item quantity");
            }

            setCart(data.cart);
        } catch (error) {
            setMessage({
                text: error.message || "Unable to update quantity",
                type: "error"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Remove Item from Cart
    const handleRemoveItem = async (productId, productName) => {
        try {
            setActionLoading(true);
            setMessage({ text: "", type: "" });

            const response = await fetch(`${API}/remove/${productId}`, {
                method: "DELETE",
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to remove item");
            }

            setCart(data.cart);
            setMessage({
                text: `"${productName || "Item"}" removed from your cart.`,
                type: "success"
            });
        } catch (error) {
            setMessage({
                text: error.message || "Unable to remove item",
                type: "error"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Clear All Items
    const handleClearCart = async () => {
        if (!window.confirm("Are you sure you want to empty your entire cart?")) {
            return;
        }

        try {
            setActionLoading(true);
            setMessage({ text: "", type: "" });

            const response = await fetch(`${API}/clear`, {
                method: "DELETE",
                headers: getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to clear cart");
            }

            setCart({ ...cart, items: [] });
            setMessage({
                text: "Your cart has been cleared.",
                type: "success"
            });
        } catch (error) {
            setMessage({
                text: error.message || "Unable to clear cart",
                type: "error"
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Calculations
    const items = cart?.items || [];
    const calculateSubtotal = () =>
        items.reduce((total, item) => {
            const price = Number(item.product?.price || 0);
            return total + price * item.quantity;
        }, 0);

    const calculateTotalCount = () =>
        items.reduce((total, item) => total + item.quantity, 0);

    // Checkout / Place Order Simulation
    const handleCheckout = async () => {
        if (!cart?.items || cart.items.length === 0) return;

        try {
            setActionLoading(true);
            await fetch(`${API}/clear`, {
                method: "DELETE",
                headers: getHeaders()
            });

            const orderId = generateOrderId();
            setOrderSuccess({
                orderId,
                total: calculateSubtotal().toFixed(2),
                itemCount: calculateTotalCount()
            });
            setCart({ ...cart, items: [] });
        } catch (error) {
            setMessage({
                text: "Error completing checkout: " + error.message,
                type: "error"
            });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-page">
                <p className="cart-loading">Loading your cart...</p>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="cart-page">
                <div className="cart-empty-state">
                    <span className="cart-empty-icon">🔒</span>
                    <h2>Please Log In</h2>
                    <p>You need to be logged in to view and manage your cart.</p>
                    <button
                        type="button"
                        className="cart-btn-primary"
                        onClick={onBrowseProducts}
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="cart-page">
                <div className="cart-empty-state">
                    <span className="cart-empty-icon">🎉</span>
                    <h2>Order Placed Successfully!</h2>
                    <p>
                        Thank you for your order, <strong>{user?.name || "Student"}</strong>!
                        <br />
                        Your order ID is <strong>#{orderSuccess.orderId}</strong> for a total of{" "}
                        <strong>₹{orderSuccess.total}</strong> ({orderSuccess.itemCount} items).
                    </p>
                    <button
                        className="cart-btn-primary"
                        onClick={() => {
                            setOrderSuccess(null);
                            if (onBrowseProducts) onBrowseProducts();
                        }}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <section className="cart-page">
            {/* Header */}
            <div className="cart-header">
                <div>
                    <h1>My Cart</h1>
                    <p>Review items in your cart and proceed to checkout.</p>
                </div>
                {items.length > 0 && (
                    <span className="cart-badge">
                        {calculateTotalCount()} {calculateTotalCount() === 1 ? "Item" : "Items"}
                    </span>
                )}
            </div>

            {/* Alert / Notification */}
            {message.text && (
                <div className={`cart-alert ${message.type}`}>
                    <span>{message.text}</span>
                    <button
                        onClick={() => setMessage({ text: "", type: "" })}
                        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="cart-empty-state">
                    <span className="cart-empty-icon">🛒</span>
                    <h2>Your cart is empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button
                        type="button"
                        className="cart-btn-primary"
                        onClick={onBrowseProducts}
                    >
                        Explore Products
                    </button>
                </div>
            ) : (
                /* Cart Layout */
                <div className="cart-layout">
                    {/* Items List */}
                    <div className="cart-items-card">
                        <div className="cart-items-header">
                            <h3>Cart Items ({items.length})</h3>
                            <button
                                type="button"
                                className="cart-clear-btn"
                                onClick={handleClearCart}
                                disabled={actionLoading}
                            >
                                Empty Cart
                            </button>
                        </div>

                        {items.map((item) => {
                            const product = item.product || {};
                            const price = Number(product.price || 0);
                            const itemSubtotal = price * item.quantity;

                            return (
                                <article className="cart-item" key={item._id || product._id}>
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="cart-item-image"
                                        />
                                    ) : (
                                        <div className="cart-item-placeholder">
                                            No Image
                                        </div>
                                    )}

                                    <div className="cart-item-info">
                                        <span className="cart-item-category">
                                            {product.category || "General"}
                                        </span>
                                        <h4 className="cart-item-title">
                                            {product.name || "Unknown Product"}
                                        </h4>
                                        <p className="cart-item-price">
                                            ₹{price.toFixed(2)} each
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="cart-quantity-controls">
                                        <button
                                            type="button"
                                            className="cart-qty-btn"
                                            onClick={() =>
                                                handleUpdateQuantity(
                                                    product._id,
                                                    item.quantity - 1,
                                                    product.stock
                                                )
                                            }
                                            disabled={actionLoading || item.quantity <= 1}
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>
                                        <span className="cart-qty-display">
                                            {item.quantity}
                                        </span>
                                        <button
                                            type="button"
                                            className="cart-qty-btn"
                                            onClick={() =>
                                                handleUpdateQuantity(
                                                    product._id,
                                                    item.quantity + 1,
                                                    product.stock
                                                )
                                            }
                                            disabled={
                                                actionLoading ||
                                                (product.stock !== undefined &&
                                                    item.quantity >= product.stock)
                                            }
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Subtotal & Delete */}
                                    <div className="cart-item-total">
                                        <span className="cart-item-subtotal">
                                            ₹{itemSubtotal.toFixed(2)}
                                        </span>
                                        <button
                                            type="button"
                                            className="cart-item-remove-btn"
                                            onClick={() =>
                                                handleRemoveItem(product._id, product.name)
                                            }
                                            disabled={actionLoading}
                                        >
                                            ✕ Remove
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <aside className="cart-summary-card">
                        <h3>Order Summary</h3>

                        <div className="cart-summary-row">
                            <span>Subtotal ({calculateTotalCount()} items)</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Campus Delivery</span>
                            <span style={{ color: "#16a34a", fontWeight: "600" }}>FREE</span>
                        </div>

                        <div className="cart-summary-row">
                            <span>Student Discount</span>
                            <span>-₹0.00</span>
                        </div>

                        <div className="cart-summary-row total">
                            <span>Total Amount</span>
                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>

                        <button
                            type="button"
                            className="cart-checkout-btn"
                            onClick={handleCheckout}
                            disabled={actionLoading || items.length === 0}
                        >
                            {actionLoading ? "Processing..." : "Place Order (Cash on Campus)"}
                        </button>

                        <button
                            type="button"
                            className="cart-continue-btn"
                            onClick={onBrowseProducts}
                        >
                            ← Continue Shopping
                        </button>
                    </aside>
                </div>
            )}
        </section>
    );
}

export default Cart;