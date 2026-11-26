import { useEffect, useState } from "react";
import "./Styles/Orders.css";

const API_ORDERS = "http://localhost:5002/api/orders";

function Orders({ onBrowseProducts }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [invoiceOrder, setInvoiceOrder] = useState(null);

    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        let isMounted = true;

        const fetchOrders = async () => {
            if (!userId) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const response = await fetch(API_ORDERS, {
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId
                    }
                });

                const data = await response.json();

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load orders");
                }

                setOrders(data.orders || []);
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Unable to fetch orders");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            isMounted = false;
        };
    }, [userId]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        try {
            setActionLoading(true);
            const response = await fetch(`${API_ORDERS}/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({ orderStatus: "Cancelled" })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to cancel order");
            }

            setOrders((prev) =>
                prev.map((ord) => (ord._id === orderId ? data.order : ord))
            );
        } catch (err) {
            alert(err.message || "Could not cancel order");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setActionLoading(true);
            const response = await fetch(`${API_ORDERS}/${orderId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId
                },
                body: JSON.stringify({ orderStatus: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update status");
            }

            setOrders((prev) =>
                prev.map((ord) => (ord._id === orderId ? data.order : ord))
            );
        } catch (err) {
            alert(err.message || "Failed to update order status");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesStatus =
            statusFilter === "all" ||
            order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

        const query = searchQuery.trim().toLowerCase();
        if (!query) return matchesStatus;

        const matchesOrderId = order.orderId?.toLowerCase().includes(query);
        const matchesAddress = order.shippingAddress?.fullName?.toLowerCase().includes(query) ||
            order.shippingAddress?.city?.toLowerCase().includes(query);
        const matchesItems = order.items?.some((it) =>
            it.name?.toLowerCase().includes(query)
        );

        return matchesStatus && (matchesOrderId || matchesAddress || matchesItems);
    });

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const escapeHtml = (value) =>
        String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const getPaymentLabel = (method) => {
        if (method === "COD") return "Cash on Delivery / Campus Handover";
        if (method === "UPI") return "UPI / Instant Payment";
        return "Debit / Credit Card";
    };

    const buildInvoiceHtml = (order) => {
        const orderCode = order.orderId || order._id?.slice(-6) || "ORDER";
        const invoiceNumber = `INV-${orderCode}`;
        const itemRows = (order.items || [])
            .map((item, idx) => {
                const price = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                const lineTotal = price * qty;
                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${escapeHtml(item.name || "Product Item")}</td>
                        <td style="text-align:right;">&#8377;${price.toFixed(2)}</td>
                        <td style="text-align:right;">${qty}</td>
                        <td style="text-align:right;">&#8377;${lineTotal.toFixed(2)}</td>
                    </tr>
                `;
            })
            .join("");

        const total = Number(order.totalAmount || 0).toFixed(2);
        const customerName = order.shippingAddress?.fullName || order.user?.name || "Student";
        const customerPhone = order.shippingAddress?.phone || order.user?.phone || "N/A";
        const customerEmail = order.user?.email ? `<p><strong>Email:</strong> ${escapeHtml(order.user.email)}</p>` : "";
        const customerUsn = order.user?.usn ? `<p><strong>USN:</strong> ${escapeHtml(order.user.usn)}</p>` : "";

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>StudentMart Invoice - #${escapeHtml(orderCode)}</title>
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; background: #f4f7fb; color: #1e293b; margin: 0; padding: 30px; }
  .sheet { max-width: 760px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 18px; margin-bottom: 22px; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-mark { width: 42px; height: 42px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #fff; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; }
  .brand h1 { margin: 0 0 3px; font-size: 22px; color: #172554; }
  .brand p { margin: 0; font-size: 12px; color: #64748b; }
  .meta { text-align: right; font-size: 13px; color: #475569; }
  .meta p { margin: 3px 0; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
  .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; }
  .box h4 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; color: #64748b; }
  .box p { margin: 3px 0; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
  th { background: #f1f5f9; color: #334155; text-align: left; padding: 10px 12px; border-bottom: 1px solid #cbd5e1; }
  td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
  .totals { margin-left: auto; max-width: 280px; font-size: 14px; }
  .row { display: flex; justify-content: space-between; margin-bottom: 7px; color: #475569; }
  .row.grand { border-top: 2px dashed #cbd5e1; padding-top: 10px; margin-top: 8px; font-size: 17px; font-weight: 800; color: #0f172a; }
  .row.grand span:last-child { color: #16a34a; }
  .footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
  @media print { body { background: #fff; padding: 0; } .sheet { border: none; box-shadow: none; } }
</style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div class="brand">
        <div class="brand-mark">SM</div>
        <div>
          <h1>StudentMart</h1>
          <p>Official Campus Order Invoice / Bill</p>
        </div>
      </div>
      <div class="meta">
        <p><strong>Invoice No:</strong> ${escapeHtml(invoiceNumber)}</p>
        <p><strong>Order ID:</strong> #${escapeHtml(orderCode)}</p>
        <p><strong>Date:</strong> ${escapeHtml(formatDate(order.createdAt))}</p>
        <p><strong>Status:</strong> ${escapeHtml(order.orderStatus || "Placed")}</p>
      </div>
    </div>

    <div class="parties">
      <div class="box">
        <h4>Billed &amp; Delivered To</h4>
        <p><strong>${escapeHtml(customerName)}</strong></p>
        <p>${escapeHtml(order.shippingAddress?.address || "")}</p>
        <p>${escapeHtml(order.shippingAddress?.city || "")} - ${escapeHtml(order.shippingAddress?.postalCode || "")}</p>
        <p><strong>Phone:</strong> ${escapeHtml(customerPhone)}</p>
        ${customerUsn}
        ${customerEmail}
      </div>
      <div class="box">
        <h4>Payment &amp; Store Details</h4>
        <p><strong>Seller:</strong> StudentMart Campus Store</p>
        <p><strong>Location:</strong> Block A, Campus Center, Bengaluru - 560064</p>
        <p><strong>Payment Method:</strong> ${escapeHtml(getPaymentLabel(order.paymentMethod))}</p>
        <p><strong>Payment Status:</strong> ${escapeHtml(order.paymentStatus || "Pending")}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Description</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Qty</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>&#8377;${total}</span></div>
      <div class="row"><span>Campus Delivery</span><span style="color:#16a34a;font-weight:700;">FREE</span></div>
      <div class="row grand"><span>Grand Total</span><span>&#8377;${total}</span></div>
    </div>

    <div class="footer">
      Thank you for shopping with StudentMart! For support, contact support@studentmart.edu.in
    </div>
  </div>
</body>
</html>`;
    };

    const handleDownloadInvoice = (order) => {
        const html = buildInvoiceHtml(order);
        const orderCode = order.orderId || order._id?.slice(-6) || "order";
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `StudentMart-Invoice-${orderCode}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePrintInvoice = (order) => {
        const html = buildInvoiceHtml(order);
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            iframe.contentWindow.focus();
            setTimeout(() => {
                iframe.contentWindow.print();
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 1000);
            }, 250);
        }
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div style={{ textAlign: "center", padding: "60px 0", color: "#2563eb", fontWeight: "600" }}>
                    Loading your orders...
                </div>
            </div>
        );
    }

    return (
        <section className="orders-page">
            <div className="orders-header">
                <div className="orders-header-text">
                    <h1>
                        <span>📦</span> {isAdmin ? "All Store Orders" : "My Orders"}
                    </h1>
                    <p>
                        {isAdmin
                            ? "View, track, and manage all student orders placed across the store."
                            : "Track your active orders, campus delivery progress, and past purchase history."}
                    </p>
                </div>
                <div className="orders-count-badge">
                    Total: {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </div>
            </div>

            {error && (
                <div style={{ padding: "12px 18px", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "20px" }}>
                    {error}
                </div>
            )}

            <div className="orders-filter-bar">
                <div className="orders-status-filters">
                    {["all", "Placed", "Processing", "Delivered", "Cancelled"].map((st) => (
                        <button
                            key={st}
                            type="button"
                            className={`orders-filter-pill ${statusFilter === st ? "active" : ""}`}
                            onClick={() => setStatusFilter(st)}
                        >
                            {st === "all" ? "All Orders" : st}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    className="orders-search-input"
                    placeholder="Search by Order ID or item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredOrders.length === 0 ? (
                <div className="orders-empty-state">
                    <span className="orders-empty-icon">📭</span>
                    <h3>No Orders Found</h3>
                    <p>
                        {statusFilter !== "all" || searchQuery
                            ? "No orders match your selected filters."
                            : "You haven't placed any orders yet. Check out student essentials now!"}
                    </p>
                    <button
                        type="button"
                        className="orders-browse-btn"
                        onClick={onBrowseProducts}
                    >
                        Browse Store Catalog
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map((order) => {
                        const statusClass = (order.orderStatus || "placed").toLowerCase();
                        const isPlaced = order.orderStatus === "Placed";

                        return (
                            <article className="order-card" key={order._id}>
                                <div className="order-card-header">
                                    <div className="order-card-header-left">
                                        <span className="order-id-badge">
                                            #{order.orderId || order._id.slice(-6)}
                                        </span>
                                        <span className="order-date">
                                            📅 {formatDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <span className={`order-status-badge ${statusClass}`}>
                                        {statusClass === "placed" && "⏳ "}
                                        {statusClass === "processing" && "⚙️ "}
                                        {statusClass === "delivered" && "✅ "}
                                        {statusClass === "cancelled" && "❌ "}
                                        {order.orderStatus}
                                    </span>
                                </div>

                                {isAdmin && order.user && (
                                    <div className="order-customer-banner">
                                        <span>👤 <strong>Customer:</strong> {order.user.name || "Student"}</span>
                                        <span>•</span>
                                        <span>✉️ {order.user.email}</span>
                                        {order.user.usn && (
                                            <>
                                                <span>•</span>
                                                <span>🎓 USN: {order.user.usn}</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div className="order-info-grid">
                                    <div className="order-info-block">
                                        <h4>📍 Delivery Address</h4>
                                        <p>
                                            <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.phone})
                                        </p>
                                        <p>{order.shippingAddress?.address}</p>
                                        <p>
                                            {order.shippingAddress?.city} - {order.shippingAddress?.postalCode}
                                        </p>
                                        {typeof order.shippingAddress?.latitude === "number" &&
                                            typeof order.shippingAddress?.longitude === "number" && (
                                                <p style={{ marginTop: "4px" }}>
                                                    <a
                                                        href={`https://www.openstreetmap.org/?mlat=${order.shippingAddress.latitude}&mlon=${order.shippingAddress.longitude}#map=17/${order.shippingAddress.latitude}/${order.shippingAddress.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ color: "#2563eb", fontWeight: "600", fontSize: "12px" }}
                                                    >
                                                        🗺️ View Pinned Location ({order.shippingAddress.latitude.toFixed(4)}, {order.shippingAddress.longitude.toFixed(4)})
                                                    </a>
                                                </p>
                                            )}
                                    </div>

                                    <div className="order-info-block">
                                        <h4>💳 Payment Information</h4>
                                        <p>
                                            <strong>Method:</strong>{" "}
                                            {order.paymentMethod === "COD"
                                                ? "Cash on Delivery / Campus Handover"
                                                : order.paymentMethod === "UPI"
                                                ? "UPI / Instant Payment"
                                                : "Debit / Credit Card"}
                                        </p>
                                        <p>
                                            <strong>Status:</strong>{" "}
                                            <span style={{ color: order.paymentStatus === "Completed" ? "#16a34a" : "#ca8a04", fontWeight: "600" }}>
                                                {order.paymentStatus || "Pending"}
                                            </span>
                                        </p>
                                        <span className="order-payment-pill">
                                            Campus Delivery: FREE
                                        </span>
                                    </div>
                                </div>

                                <div className="order-items-table">
                                    {order.items?.map((item, idx) => (
                                        <div className="order-item-row" key={idx}>
                                            <div className="order-item-main">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="order-item-thumb"
                                                    />
                                                ) : (
                                                    <div className="order-item-placeholder">
                                                        📦
                                                    </div>
                                                )}
                                                <div>
                                                    <h5 className="order-item-title">{item.name}</h5>
                                                    <p className="order-item-meta">
                                                        ₹{Number(item.price).toFixed(2)} × {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="order-item-subtotal">
                                                ₹{(Number(item.price) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-card-footer">
                                    <div className="order-total-amount">
                                        Order Total:
                                        <strong>₹{Number(order.totalAmount || 0).toFixed(2)}</strong>
                                    </div>

                                    <div className="order-actions">
                                        <button
                                            type="button"
                                            className="order-invoice-btn"
                                            onClick={() => setInvoiceOrder(order)}
                                        >
                                            📄 View Bill
                                        </button>
                                        <button
                                            type="button"
                                            className="order-download-btn"
                                            onClick={() => handleDownloadInvoice(order)}
                                        >
                                            ⬇️ Download Bill
                                        </button>

                                        {!isAdmin && isPlaced && (
                                            <button
                                                type="button"
                                                className="order-cancel-btn"
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={actionLoading}
                                            >
                                                ✕ Cancel Order
                                            </button>
                                        )}

                                        {isAdmin && (
                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                <select
                                                    className="order-status-select"
                                                    value={order.orderStatus}
                                                    onChange={(e) =>
                                                        handleUpdateStatus(order._id, e.target.value)
                                                    }
                                                    disabled={actionLoading}
                                                >
                                                    <option value="Placed">Placed</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Invoice Preview Modal */}
            {invoiceOrder && (
                <div
                    className="invoice-modal-backdrop"
                    onClick={() => setInvoiceOrder(null)}
                >
                    <div
                        className="invoice-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="invoice-modal-toolbar">
                            <h3>
                                Invoice #{invoiceOrder.orderId || invoiceOrder._id?.slice(-6)}
                            </h3>
                            <div className="invoice-modal-actions">
                                <button
                                    type="button"
                                    className="invoice-action-btn print"
                                    onClick={() => handlePrintInvoice(invoiceOrder)}
                                >
                                    🖨️ Print / Save PDF
                                </button>
                                <button
                                    type="button"
                                    className="invoice-action-btn download"
                                    onClick={() => handleDownloadInvoice(invoiceOrder)}
                                >
                                    ⬇️ Download Bill
                                </button>
                                <button
                                    type="button"
                                    className="invoice-action-btn close"
                                    onClick={() => setInvoiceOrder(null)}
                                >
                                    ✕ Close
                                </button>
                            </div>
                        </div>

                        <div className="invoice-sheet">
                            <div className="invoice-sheet-header">
                                <div className="invoice-brand">
                                    <h2>StudentMart</h2>
                                    <p>Official Campus Order Invoice / Bill</p>
                                </div>
                                <div className="invoice-meta">
                                    <p>
                                        <strong>Invoice No:</strong> INV-{invoiceOrder.orderId || invoiceOrder._id?.slice(-6)}
                                    </p>
                                    <p>
                                        <strong>Order ID:</strong> #{invoiceOrder.orderId || invoiceOrder._id?.slice(-6)}
                                    </p>
                                    <p>
                                        <strong>Date:</strong> {formatDate(invoiceOrder.createdAt)}
                                    </p>
                                    <p>
                                        <strong>Status:</strong> {invoiceOrder.orderStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="invoice-parties">
                                <div className="invoice-party-box">
                                    <h4>Billed &amp; Delivered To</h4>
                                    <p>
                                        <strong>
                                            {invoiceOrder.shippingAddress?.fullName || invoiceOrder.user?.name || "Student"}
                                        </strong>
                                    </p>
                                    <p>{invoiceOrder.shippingAddress?.address}</p>
                                    <p>
                                        {invoiceOrder.shippingAddress?.city} - {invoiceOrder.shippingAddress?.postalCode}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> {invoiceOrder.shippingAddress?.phone || invoiceOrder.user?.phone || "N/A"}
                                    </p>
                                    {invoiceOrder.user?.usn && (
                                        <p>
                                            <strong>USN:</strong> {invoiceOrder.user.usn}
                                        </p>
                                    )}
                                </div>

                                <div className="invoice-party-box">
                                    <h4>Payment &amp; Store Details</h4>
                                    <p>
                                        <strong>Seller:</strong> StudentMart Campus Store
                                    </p>
                                    <p>
                                        <strong>Method:</strong> {getPaymentLabel(invoiceOrder.paymentMethod)}
                                    </p>
                                    <p>
                                        <strong>Payment Status:</strong> {invoiceOrder.paymentStatus || "Pending"}
                                    </p>
                                    <p>
                                        <strong>Delivery:</strong> Campus Delivery (FREE)
                                    </p>
                                </div>
                            </div>

                            <table className="invoice-items-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Item</th>
                                        <th>Unit Price</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.name}</td>
                                            <td>₹{Number(item.price || 0).toFixed(2)}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="invoice-totals">
                                <div className="invoice-total-row">
                                    <span>Subtotal</span>
                                    <span>₹{Number(invoiceOrder.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="invoice-total-row">
                                    <span>Campus Delivery</span>
                                    <span style={{ color: "#16a34a", fontWeight: "700" }}>FREE</span>
                                </div>
                                <div className="invoice-total-row grand">
                                    <span>Grand Total</span>
                                    <span>₹{Number(invoiceOrder.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Orders;