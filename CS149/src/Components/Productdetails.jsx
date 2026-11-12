import { useEffect, useState } from "react";
import "./Styles/ProductDetails.css";

const API = "http://localhost:5002/api/products";
const CART_API = "http://localhost:5002/api/cart";

function ProductDetails({ productId, onBack, onGoToCart }) {
    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [cartSuccess, setCartSuccess] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setMessage("");

            try {
                const response = await fetch(`${API}/${productId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load product");
                }

                setProduct(data);
            } catch (error) {
                setMessage(error.message || "Unable to connect to server");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const handleAddToCart = async () => {
        if (!userId) {
            alert("Please log in to add items to your cart.");
            return;
        }

        if (!product || product.stock <= 0) {
            alert("This item is currently out of stock.");
            return;
        }

        try {
            setAdding(true);
            const response = await fetch(`${CART_API}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: Number(quantity)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to add product to cart");
            }

            setCartSuccess(true);
            setTimeout(() => setCartSuccess(false), 3000);
        } catch (error) {
            alert(error.message || "Error adding product to cart");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return <p className="product-details-status">Loading product details...</p>;
    }

    if (!product) {
        return (
            <section className="product-details-page">
                <p>{message || "Product not found"}</p>
                <button onClick={onBack}>Back to Products</button>
            </section>
        );
    }

    const isOutOfStock = product.stock <= 0;

    return (
        <section className="product-details-page">
            <button className="product-back-button" onClick={onBack}>
                ← Back to Products
            </button>

            <div className="product-details-card">
                {product.image ? (
                    <img src={product.image} alt={product.name} />
                ) : (
                    <div className="product-details-placeholder">
                        No image available
                    </div>
                )}

                <div className="product-details-content">
                    <span className="product-category">
                        {product.category}
                    </span>

                    <h1>{product.name}</h1>

                    <p className="product-details-description">
                        {product.description}
                    </p>

                    <p className="product-details-price">
                        ₹{Number(product.price).toFixed(2)}
                    </p>

                    <p className="product-details-stock">
                        <strong>Availability: </strong>
                        {isOutOfStock ? (
                            <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                                Out of Stock
                            </span>
                        ) : (
                            <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                                In Stock ({product.stock} available)
                            </span>
                        )}
                    </p>

                    {/* Add to Cart Actions */}
                    <div className="product-details-actions" style={{ marginTop: "24px" }}>
                        {!isOutOfStock && (
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <label htmlFor="qty-select" style={{ fontWeight: "600", color: "#334155" }}>
                                    Quantity:
                                </label>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={quantity <= 1}
                                        style={{ padding: "6px 12px", background: "#f8fafc", border: "none", cursor: "pointer", fontSize: "16px" }}
                                    >
                                        −
                                    </button>
                                    <span style={{ minWidth: "36px", textAlign: "center", fontWeight: "600" }}>
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        disabled={quantity >= product.stock}
                                        style={{ padding: "6px 12px", background: "#f8fafc", border: "none", cursor: "pointer", fontSize: "16px" }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || adding}
                                style={{
                                    padding: "12px 24px",
                                    backgroundColor: isOutOfStock ? "#cbd5e1" : cartSuccess ? "#16a34a" : "#2563eb",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                                    transition: "0.2s ease"
                                }}
                            >
                                {isOutOfStock
                                    ? "Out of Stock"
                                    : adding
                                    ? "Adding to Cart..."
                                    : cartSuccess
                                    ? "Added to Cart! ✓"
                                    : "🛒 Add to Cart"}
                            </button>

                            {onGoToCart && (
                                <button
                                    type="button"
                                    onClick={onGoToCart}
                                    style={{
                                        padding: "12px 20px",
                                        background: "transparent",
                                        color: "#2563eb",
                                        border: "1px solid #2563eb",
                                        borderRadius: "8px",
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        cursor: "pointer"
                                    }}
                                >
                                    View Cart →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProductDetails;