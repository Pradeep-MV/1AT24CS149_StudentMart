import { useState } from "react";
import "./Styles/Home.css";

export function StudentMartLogo({ size = 38 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="sm-logo-svg"
        >
            <defs>
                <linearGradient id="smLogoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="smLogoAccent" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#dbeafe" />
                </linearGradient>
            </defs>
            <rect width="48" height="48" rx="13" fill="url(#smLogoBg)" />
            {/* Graduation Cap Top */}
            <path
                d="M24 9L38 15.5L24 22L10 15.5L24 9Z"
                fill="url(#smLogoAccent)"
            />
            <path
                d="M34 17.5V22.5"
                stroke="#fde68a"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            <circle cx="34" cy="23.5" r="1.7" fill="#fde68a" />
            {/* Shopping Bag Base */}
            <path
                d="M14 23.5H34L32.4 37.5C32.2 38.9 31 40 29.5 40H18.5C17 40 15.8 38.9 15.6 37.5L14 23.5Z"
                fill="#ffffff"
                fillOpacity="0.96"
            />
            <path
                d="M19.5 23.5V21.5C19.5 19.3 21.5 17.5 24 17.5C26.5 17.5 28.5 19.3 28.5 21.5V23.5"
                stroke="#1d4ed8"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            {/* Smile / Cart Check Accent */}
            <path
                d="M20 30.5C21.1 32.1 22.5 32.9 24 32.9C25.5 32.9 26.9 32.1 28 30.5"
                stroke="#2563eb"
                strokeWidth="2.4"
                strokeLinecap="round"
            />
        </svg>
    );
}

function Home({ onNavigate }) {
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [contactSubmitted, setContactSubmitted] = useState(false);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setContactSubmitted(true);
        setContactForm({ name: "", email: "", message: "" });
    };

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero-content">
                    <div className="home-hero-badge">
                        <StudentMartLogo size={24} />
                        <span>Official Campus Essentials Marketplace</span>
                    </div>

                    <h1>
                        Everything You Need for{" "}
                        <span className="home-hero-highlight">Campus Life</span>, in One Place
                    </h1>

                    <p className="home-hero-subtitle">
                        Shop textbooks, spiral notebooks, stationery, backpacks, and everyday student essentials at student-friendly prices — with free campus delivery and instant order tracking.
                    </p>

                    <div className="home-hero-actions">
                        <button
                            type="button"
                            className="home-btn-primary"
                            onClick={() => onNavigate("login")}
                        >
                            Login to Shop →
                        </button>
                        <button
                            type="button"
                            className="home-btn-secondary"
                            onClick={() => onNavigate("register")}
                        >
                            Create Student Account
                        </button>
                        <button
                            type="button"
                            className="home-btn-ghost"
                            onClick={() => scrollToSection("about")}
                        >
                            Learn More
                        </button>
                    </div>

                    <div className="home-hero-metrics">
                        <div className="home-metric-pill">
                            <strong>FREE</strong>
                            <span>Campus Delivery</span>
                        </div>
                        <div className="home-metric-pill">
                            <strong>3 Modes</strong>
                            <span>COD, UPI &amp; Card</span>
                        </div>
                        <div className="home-metric-pill">
                            <strong>Instant</strong>
                            <span>Invoice &amp; Tracking</span>
                        </div>
                    </div>
                </div>

                {/* Showcase Card */}
                <div className="home-hero-showcase">
                    <div className="home-showcase-card">
                        <div className="home-showcase-top">
                            <StudentMartLogo size={54} />
                            <div>
                                <h3>StudentMart Portal</h3>
                                <p>Verified Campus Store</p>
                            </div>
                        </div>

                        <div className="home-showcase-list">
                            <div className="home-showcase-item">
                                <span>📚</span>
                                <div>
                                    <strong>Books &amp; Textbooks</strong>
                                    <p>Semester guides, lab manuals &amp; notebooks</p>
                                </div>
                            </div>
                            <div className="home-showcase-item">
                                <span>✏️</span>
                                <div>
                                    <strong>Stationery &amp; Supplies</strong>
                                    <p>Pens, markers, geometry &amp; art kits</p>
                                </div>
                            </div>
                            <div className="home-showcase-item">
                                <span>🎒</span>
                                <div>
                                    <strong>Bags &amp; Campus Gear</strong>
                                    <p>Durable backpacks &amp; daily accessories</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="home-section home-about-section">
                <div className="home-section-header">
                    <span className="home-section-tag">ABOUT STUDENTMART</span>
                    <h2>Built by Students, Designed for Campus Convenience</h2>
                    <p>
                        StudentMart is a dedicated college e-commerce platform created to save students time and money. Instead of running off-campus for last-minute stationery, textbooks, or hostel supplies, students can browse curated essentials online, pay securely via Cash on Delivery, UPI, or Card, and receive free delivery right to their hostel block or department.
                    </p>
                </div>

                <div className="home-features-grid">
                    <article className="home-feature-card">
                        <div className="home-feature-icon blue">🎓</div>
                        <h3>Student-Friendly Pricing</h3>
                        <p>
                            Curated textbooks, notebooks, and daily supplies priced specifically for student budgets with transparent billing.
                        </p>
                    </article>

                    <article className="home-feature-card">
                        <div className="home-feature-icon emerald">🚚</div>
                        <h3>Free Campus Delivery</h3>
                        <p>
                            Zero delivery fees across campus hostels, libraries, and academic blocks with fast order confirmation.
                        </p>
                    </article>

                    <article className="home-feature-card">
                        <div className="home-feature-icon indigo">📦</div>
                        <h3>Live Order Tracking &amp; Bills</h3>
                        <p>
                            Monitor every order from Placed to Delivered and download official StudentMart invoices anytime.
                        </p>
                    </article>

                    <article className="home-feature-card">
                        <div className="home-feature-icon amber">🛡️</div>
                        <h3>Verified Student &amp; Admin Portal</h3>
                        <p>
                            USN-backed student registration paired with a full administrator portal for catalog and order management.
                        </p>
                    </article>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="home-section home-contact-section">
                <div className="home-section-header">
                    <span className="home-section-tag">CONTACT US</span>
                    <h2>Get in Touch with the StudentMart Campus Team</h2>
                    <p>
                        Have questions about an order, product availability, or bulk department supplies? Reach out to our campus helpdesk.
                    </p>
                </div>

                <div className="home-contact-grid">
                    <div className="home-contact-info-card">
                        <div className="home-contact-item">
                            <span className="home-contact-icon">📍</span>
                            <div>
                                <h4>Campus Store Desk</h4>
                                <p>StudentMart Hub, Block A Ground Floor, Campus Center, Bengaluru - 560064</p>
                            </div>
                        </div>

                        <div className="home-contact-item">
                            <span className="home-contact-icon">✉️</span>
                            <div>
                                <h4>Support Email</h4>
                                <p>support@studentmart.edu.in</p>
                            </div>
                        </div>

                        <div className="home-contact-item">
                            <span className="home-contact-icon">📞</span>
                            <div>
                                <h4>Campus Helpline</h4>
                                <p>+91 80 4123 5678 / +91 98765 43210</p>
                            </div>
                        </div>

                        <div className="home-contact-item">
                            <span className="home-contact-icon">🕒</span>
                            <div>
                                <h4>Store &amp; Pickup Hours</h4>
                                <p>Monday – Saturday: 9:00 AM – 6:30 PM</p>
                            </div>
                        </div>
                    </div>

                    <form className="home-contact-form-card" onSubmit={handleContactSubmit}>
                        <h3>Send a Quick Message</h3>

                        <div className="home-form-group">
                            <label htmlFor="contact-name">Your Name</label>
                            <input
                                id="contact-name"
                                type="text"
                                placeholder="Enter your full name"
                                value={contactForm.name}
                                onChange={(e) => {
                                    setContactSubmitted(false);
                                    setContactForm((prev) => ({ ...prev, name: e.target.value }));
                                }}
                                required
                            />
                        </div>

                        <div className="home-form-group">
                            <label htmlFor="contact-email">Campus Email</label>
                            <input
                                id="contact-email"
                                type="email"
                                placeholder="you@college.edu"
                                value={contactForm.email}
                                onChange={(e) => {
                                    setContactSubmitted(false);
                                    setContactForm((prev) => ({ ...prev, email: e.target.value }));
                                }}
                                required
                            />
                        </div>

                        <div className="home-form-group">
                            <label htmlFor="contact-message">Message</label>
                            <textarea
                                id="contact-message"
                                rows={3}
                                placeholder="How can we help you?"
                                value={contactForm.message}
                                onChange={(e) => {
                                    setContactSubmitted(false);
                                    setContactForm((prev) => ({ ...prev, message: e.target.value }));
                                }}
                                required
                            />
                        </div>

                        {contactSubmitted && (
                            <p className="home-contact-success">
                                ✓ Thanks for reaching out! Our campus support team will get back to you soon.
                            </p>
                        )}

                        <button type="submit" className="home-btn-primary home-contact-submit">
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-brand">
                    <StudentMartLogo size={26} />
                    <span>StudentMart • Campus Essentials Store</span>
                </div>
                <p>© {new Date().getFullYear()} StudentMart. Built for students.</p>
            </footer>
        </div>
    );
}

export default Home;
