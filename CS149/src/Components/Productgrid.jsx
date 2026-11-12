import { useEffect, useState } from "react";
import "./Styles/ProductGrid.css";

const API = "http://localhost:5002/api/products";
const CART_API = "http://localhost:5002/api/cart";

function ProductGrid({ onViewDetails, onAddNewProduct }) {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sort, setSort] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState(null);
    const [cartSuccessId, setCartSuccessId] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;

    useEffect(() => {
        let isMounted = true;

        const loadProducts = async () => {
            try {
                const params = new URLSearchParams();

                if (search.trim()) params.set("search", search.trim());
                if (category !== "All") params.set("category", category);
                if (sort) params.set("sort", sort);

                const response = await fetch(`${API}?${params.toString()}`);
                const data = await response.json();

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(data.message || "Unable to load products");
                }

                setProducts(data);
            } catch (error) {
                if (isMounted) {
                    setMessage(error.message || "Unable to connect to server");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
        };
    }, [search, category, sort]);

    const handleAddToCart = async (product) => {
        if (!userId) {
            alert("Please log in to add items to your cart.");
            return;
        }

        if (product.stock <= 0) {
            alert("This item is currently out of stock.");
            return;
        }

        try {
            setAddingId(product._id);
            const response = await fetch(`${CART_API}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Could not add to cart");
            }

            setCartSuccessId(product._id);
            setTimeout(() => {
                setCartSuccessId((prev) => (prev === product._id ? null : prev));
            }, 2000);
        } catch (error) {
            alert(error.message || "Error adding item to cart");
        } finally {
            setAddingId(null);
        }
    };

    const categories = [
        "All",
        ...new Set(products.map((product) => product.category).filter(Boolean))
    ];

    return (
        <section className="products-page">
            <div className="products-heading">
                <div>
                    <h1>Explore Products</h1>
                    <p>Find what you need for student life.</p>
                </div>
                {onAddNewProduct && (
                    <button
                        type="button"
                        className="add-product-shortcut-btn"
                        onClick={onAddNewProduct}
                    >
                        + Add New Product
                    </button>
                )}
            </div>

            <div className="product-controls">
                <input
                    type="search"
                    placeholder="Search products by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search products"
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Filter by category"
                >
                    {categories.map((item) => (
                        <option key={item} value={item}>
                            {item === "All" ? "All Categories" : item}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort by price"
                >
                    <option value="">Default Order</option>
                    <option value="lowToHigh">Price: Low to High</option>
                    <option value="highToLow">Price: High to Low</option>
                </select>
            </div>

            {message && <p className="products-message">{message}</p>}

            {loading ? (
                <p className="products-status">Loading products...</p>
            ) : products.length === 0 ? (
                <div className="products-empty">
                    <h3>No products found</h3>
                    <p>Try another search or add a new product.</p>
                    {onAddNewProduct && (
                        <button
                            type="button"
                            className="add-product-shortcut-btn"
                            onClick={onAddNewProduct}
                            style={{ marginTop: "15px" }}
                        >
                            Add First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => {
                        const isOutOfStock = product.stock <= 0;
                        const isAdding = addingId === product._id;
                        const isAdded = cartSuccessId === product._id;

                        return (
                            <article className="product-card" key={product._id}>
                                {product.image ? (
                                    <img
                                        className="product-image"
                                        src={product.image}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="product-image-placeholder">
                                        No image available
                                    </div>
                                )}

                                <div className="product-card-content">
                                    <span className="product-category">
                                        {product.category}
                                    </span>

                                    <h3>{product.name}</h3>

                                    <p className="product-description">
                                        {product.description}
                                    </p>

                                    <div className="product-stock-tag">
                                        {isOutOfStock ? (
                                            <span className="stock-out">Out of Stock</span>
                                        ) : (
                                            <span className="stock-in">In Stock ({product.stock})</span>
                                        )}
                                    </div>

                                    <div className="product-card-footer">
                                        <strong>
                                            ₹{Number(product.price).toFixed(2)}
                                        </strong>

                                        <div className="product-actions">
                                            <button
                                                type="button"
                                                className="btn-details"
                                                onClick={() => onViewDetails(product._id)}
                                            >
                                                Details
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-add-cart ${isAdded ? "btn-added" : ""}`}
                                                onClick={() => handleAddToCart(product)}
                                                disabled={isOutOfStock || isAdding}
                                            >
                                                {isAdded ? "Added ✓" : isAdding ? "..." : "🛒 Add"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ProductGrid;