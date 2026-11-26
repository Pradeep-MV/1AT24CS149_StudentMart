import { useEffect, useState } from "react";
import DeliveryLocationMap from "./DeliveryLocationMap";
import "./Styles/Cart.css";

const API = "http://localhost:5002/api/cart";
const API_ORDERS = "http://localhost:5002/api/orders";

function Cart({ onBrowseProducts, onGoToOrders }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [orderSuccess, setOrderSuccess] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;

    // Delivery Address Form
    const [addressForm, setAddressForm] = useState({
        fullName: user?.name || "",
        phone: user?.phone || "",
        address: "",
        city: "Bengaluru",
        postalCode: "560064",
        latitude: null,
        longitude: null
    });

    // Payment Method Option
    const [paymentMethod, setPaymentMethod] = useState("COD");

    // Card dummy fields
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        cardExpiry: "",
        cardCvv: ""
    });

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

    // Form Change Handlers
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = ({ lat, lng, address, city, postalCode }) => {
        setAddressForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address || prev.address,
            city: city || prev.city,
            postalCode: postalCode || prev.postalCode
        }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardDetails((prev) => ({ ...prev, [name]: value }));
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

    // Place Order Handler with Database Storage
    const handleCheckout = async (e) => {
        if (e) e.preventDefault();
        if (!cart?.items || cart.items.length === 0) return;

        // Validation
        if (!addressForm.fullName.trim()) {
            setMessage({ text: "Please provide the recipient full name.", type: "error" });
            return;
        }
        if (!addressForm.phone.trim()) {
            setMessage({ text: "Please enter your contact phone number.", type: "error" });
            return;
        }
        if (!addressForm.address.trim()) {
            setMessage({ text: "Please enter your campus, hostel, or room address.", type: "error" });
            return;
        }
        if (!addressForm.city.trim() || !addressForm.postalCode.trim()) {
            setMessage({ text: "Please specify your City and Postal Code.", type: "error" });
            return;
        }

        if (paymentMethod === "CARD") {
            if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 12) {
                setMessage({ text: "Please enter a valid card number.", type: "error" });
                return;
            }
        }

        try {
            setActionLoading(true);
            setMessage({ text: "", type: "" });

            const orderPayload = {
                items: cart.items,
                shippingAddress: {
                    fullName: addressForm.fullName.trim(),
                    phone: addressForm.phone.trim(),
                    address: addressForm.address.trim(),
                    city: addressForm.city.trim(),
                    postalCode: addressForm.postalCode.trim(),
                    ...(typeof addressForm.latitude === "number" &&
                    typeof addressForm.longitude === "number"
                        ? {
                              latitude: addressForm.latitude,
                              longitude: addressForm.longitude
                          }
                        : {})
                },
                paymentMethod: paymentMethod,
                totalAmount: calculateSubtotal()
            };

            const response = await fetch(API_ORDERS, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to place order");
            }

            // Success: order stored in MongoDB & cart cleared
            setOrderSuccess(data.order);
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

    // Success Screen after Placing Order
    if (orderSuccess) {
        return (
            <div className="cart-page">
                <div className="cart-success-box">
                    <span className="cart-success-icon">🎉</span>
                    <h2>Order Placed Successfully!</h2>
                    <p style={{ color: "#64748b", margin: "4px 0" }}>
                        Thank you for your order, <strong>{orderSuccess.shippingAddress?.fullName || user?.name}</strong>!
                    </p>

                    <div>
                        <span className="cart-success-order-id">
                            Order ID: #{orderSuccess.orderId}
                        </span>
                    </div>

                    <div className="cart-success-details">
                        <p>
                            📍 <strong>Delivery Address:</strong> {orderSuccess.shippingAddress?.address},{" "}
                            {orderSuccess.shippingAddress?.city} - {orderSuccess.shippingAddress?.postalCode}
                        </p>
                        <p>
                            📞 <strong>Contact Phone:</strong> {orderSuccess.shippingAddress?.phone}
                        </p>
                        <p>
                            💳 <strong>Payment Method:</strong>{" "}
                            {orderSuccess.paymentMethod === "COD"
                                ? "Cash on Delivery / Campus Handover"
                                : orderSuccess.paymentMethod === "UPI"
                                ? "UPI / Instant Payment"
                                : "Credit / Debit Card"}
                        </p>
                        <p>
                            💰 <strong>Total Amount:</strong> ₹{Number(orderSuccess.totalAmount).toFixed(2)} (
                            {orderSuccess.items?.reduce((acc, it) => acc + it.quantity, 0)} items)
                        </p>
                        <p>
                            📦 <strong>Order Status:</strong>{" "}
                            <span style={{ color: "#b45309", fontWeight: "700" }}>{orderSuccess.orderStatus}</span> (Saved in My Orders)
                        </p>
                    </div>

                    <div className="cart-success-btn-row">
                        <button
                            type="button"
                            className="cart-btn-primary"
                            onClick={() => {
                                setOrderSuccess(null);
                                if (onGoToOrders) {
                                    onGoToOrders();
                                }
                            }}
                        >
                            📦 View in My Orders
                        </button>

                        <button
                            type="button"
                            className="cart-btn-secondary"
                            onClick={() => {
                                setOrderSuccess(null);
                                if (onBrowseProducts) {
                                    onBrowseProducts();
                                }
                            }}
                        >
                            🛍️ Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <section className="cart-page">
            {/* Header */}
            <div className="cart-header">
                <div>
                    <h1>My Cart & Checkout</h1>
                    <p>Review items in your cart, enter delivery address, and place your order.</p>
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
                    {/* Left Column: Items List + Checkout Form */}
                    <div className="cart-main-col">
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

                        {/* Checkout Details: Delivery Address */}
                        <div className="cart-checkout-section">
                            <h3 className="cart-section-title">
                                <span>📍</span> 1. Delivery Address
                            </h3>

                            <DeliveryLocationMap
                                latitude={addressForm.latitude}
                                longitude={addressForm.longitude}
                                onLocationSelect={handleLocationSelect}
                            />

                            <div className="cart-form-grid">
                                <div className="cart-form-group">
                                    <label>Recipient Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={addressForm.fullName}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="cart-form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Mobile Number"
                                        value={addressForm.phone}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="cart-form-group full-width">
                                    <label>Campus / Hostel / Delivery Address *</label>
                                    <textarea
                                        rows={2}
                                        name="address"
                                        placeholder="Room No., Hostel Block, Department, or Street Address"
                                        value={addressForm.address}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="cart-form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        value={addressForm.city}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>

                                <div className="cart-form-group">
                                    <label>Postal Code / Pincode *</label>
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="e.g. 560064"
                                        value={addressForm.postalCode}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Checkout Details: Payment Option */}
                        <div className="cart-checkout-section">
                            <h3 className="cart-section-title">
                                <span>💳</span> 2. Payment Method
                            </h3>

                            <div className="cart-payment-options">
                                <div
                                    className={`cart-payment-option ${paymentMethod === "COD" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("COD")}
                                >
                                    <div className="cart-payment-option-header">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "COD"}
                                            onChange={() => setPaymentMethod("COD")}
                                        />
                                        <span>💵 Cash on Delivery</span>
                                    </div>
                                    <p>Pay cash when picking up or receiving order on campus.</p>
                                </div>

                                <div
                                    className={`cart-payment-option ${paymentMethod === "UPI" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("UPI")}
                                >
                                    <div className="cart-payment-option-header">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "UPI"}
                                            onChange={() => setPaymentMethod("UPI")}
                                        />
                                        <span>📱 UPI / QR Code</span>
                                    </div>
                                    <p>Instant UPI pay via GPay, PhonePe, Paytm, or BHIM.</p>
                                </div>

                                <div
                                    className={`cart-payment-option ${paymentMethod === "CARD" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("CARD")}
                                >
                                    <div className="cart-payment-option-header">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === "CARD"}
                                            onChange={() => setPaymentMethod("CARD")}
                                        />
                                        <span>💳 Debit / Credit Card</span>
                                    </div>
                                    <p>Pay securely via Visa, MasterCard, or RuPay card.</p>
                                </div>
                            </div>

                            {/* Sub details for UPI */}
                            {paymentMethod === "UPI" && (
                                <div className="cart-payment-subdetails">
                                    <p>Scan campus QR or transfer directly to StudentMart UPI ID:</p>
                                    <span className="cart-upi-box">studentmart@upi</span>
                                    <p style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                                        ✓ Automatic order verification upon placement.
                                    </p>
                                </div>
                            )}

                            {/* Sub details for Card */}
                            {paymentMethod === "CARD" && (
                                <div className="cart-payment-subdetails">
                                    <div className="cart-form-grid" style={{ marginBottom: 0 }}>
                                        <div className="cart-form-group full-width">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder="•••• •••• •••• ••••"
                                                maxLength={19}
                                                value={cardDetails.cardNumber}
                                                onChange={handleCardChange}
                                            />
                                        </div>
                                        <div className="cart-form-group">
                                            <label>Expiry (MM/YY)</label>
                                            <input
                                                type="text"
                                                name="cardExpiry"
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardDetails.cardExpiry}
                                                onChange={handleCardChange}
                                            />
                                        </div>
                                        <div className="cart-form-group">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                name="cardCvv"
                                                placeholder="•••"
                                                maxLength={4}
                                                value={cardDetails.cardCvv}
                                                onChange={handleCardChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
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
                            <span>Payment Method</span>
                            <span style={{ fontWeight: "600", color: "#2563eb" }}>
                                {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod === "UPI" ? "UPI" : "Card"}
                            </span>
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
                            {actionLoading
                                ? "Processing Order..."
                                : `Confirm & Place Order (₹${calculateSubtotal().toFixed(2)})`}
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