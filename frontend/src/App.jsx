import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Receipt,
  CreditCard,
  Scale,
  BarChart3,
  Share2,
  LogOut,
  Menu,
  X,
  Plus,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Phone,
  Calendar,
  DollarSign,
  Trash2,
  RotateCcw,
  Store,
  User,
  Lock,
  EyeOff,
  Smartphone,
  QrCode,
  Copy,
  ExternalLink,
  Send
} from "lucide-react";

const API = "/api";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center", background: "#ffffff", borderRadius: "14px", margin: "20px auto", maxWidth: "500px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: "54px", height: "54px", borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: "18px", color: "#0f172a", marginBottom: "8px", fontWeight: "800" }}>Unable to Open Page</h3>
          <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
            {String(this.state.error?.message || "An unexpected error occurred while loading this view.")}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            style={{ background: "#ea580c", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: "0 2px 8px rgba(234,88,12,0.3)" }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("cb_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cb_user") || "null");
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [toast, setToast] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }
    const promptHandler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", promptHandler);
    window.addEventListener("appinstalled", () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    });
    return () => window.removeEventListener("beforeinstallprompt", promptHandler);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowInstallModal(false);
        showToast("App installed successfully to your home screen!", "success");
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (data) => {
    localStorage.setItem("cb_token", data.token);
    localStorage.setItem("cb_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setPage("dashboard");
    showToast(`Welcome back, ${data.user.role === "supplier" ? "Supplier (Sri Kanaka Durga)" : "Novel Hotel"}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_user");
    setToken(null);
    setUser(null);
    setPage("dashboard");
  };

  if (!token || !user) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          onInstallApp={() => setShowInstallModal(true)}
          deferredPrompt={deferredPrompt}
          isAppInstalled={isAppInstalled}
        />
        {showInstallModal && (
          <InstallAppModal
            onClose={() => setShowInstallModal(false)}
            deferredPrompt={deferredPrompt}
            onPromptInstall={handleInstallApp}
          />
        )}
      </>
    );
  }

  const isSupplier = user.role === "supplier";

  const navItems = isSupplier
    ? [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "supply", label: "Daily Supply", icon: ClipboardList },
        { id: "bills", label: "Bills", icon: Receipt },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "balance", label: "Previous Balance", icon: Scale },
        { id: "reports", label: "Weekly Reports", icon: BarChart3 },
        { id: "whatsapp", label: "WhatsApp Share", icon: Share2 }
      ]
    : [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "bills", label: "Bill History", icon: Receipt },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "balance", label: "Previous Balance", icon: Scale },
        { id: "reports", label: "Weekly Reports", icon: BarChart3 },
        { id: "whatsapp", label: "WhatsApp Share", icon: Share2 }
      ];

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="brand-header">
          <img src="/chicken-avatar.png" alt="Sri Kanaka Durga" className="brand-avatar-img" />
          <div className="brand-text">
            <h3>Sri Kanaka Durga</h3>
            <span className="brand-sub">Chicken Center</span>
          </div>
        </div>

        <div className="supply-target-card">
          <div className="target-label">PRIMARY RECIPIENT</div>
          <div className="target-name">🏨 Novel Hotel</div>
          <div className="target-meta">Daily Wholesale Supply</div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  setPage(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="user-profile-widget">
          <div className="user-avatar">{isSupplier ? "SKD" : "NH"}</div>
          <div className="user-info">
            <strong>{isSupplier ? "Supplier Admin" : "Novel Hotel"}</strong>
            <span className="role-tag">{isSupplier ? "Full Supplier Access" : "View-Only Portal"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Backdrop for Mobile Sidebar */}
      {mobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />}

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-toggle-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h2 className="topbar-title">
                {navItems.find((n) => n.id === page)?.label || "Dashboard"}
              </h2>
              <span className="topbar-breadcrumb">
                Sri Kanaka Durga Chicken Center &nbsp;➔&nbsp; Novel Hotel
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="role-pill-badge">
              {isSupplier ? (
                <span className="pill-supplier">Supplier Mode</span>
              ) : (
                <span className="pill-hotel">Novel Hotel (View Only)</span>
              )}
            </div>
            {isSupplier && page !== "supply" && (
              <button className="btn-primary-sm" onClick={() => setPage("supply")}>
                <Plus size={16} />
                <span>New Supply</span>
              </button>
            )}
            <button
              className="btn-mobile-app-top"
              onClick={() => setShowInstallModal(true)}
              title="Install Sri Kanaka Durga App on Mobile Phone"
            >
              <Smartphone size={15} />
              <span>Mobile App</span>
            </button>
            <button className="btn-logout-top" onClick={handleLogout} title="Logout to view login page">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="content-area">
          <ErrorBoundary>
            {page === "dashboard" && (
              <DashboardView
                token={token}
                isSupplier={isSupplier}
                onNavigate={setPage}
                onViewInvoice={setSelectedInvoice}
              />
            )}

            {page === "supply" && isSupplier && (
              <DailySupplyView
                token={token}
                onSupplySaved={(newSupply) => {
                  showToast(`Bill ${newSupply.billNumber} created successfully! Total: ₹${newSupply.totalBill}`);
                  setPage("bills");
                }}
              />
            )}

            {page === "bills" && (
              <BillsView
                token={token}
                isSupplier={isSupplier}
                onViewInvoice={setSelectedInvoice}
                showToast={showToast}
                onPayBill={(b) => setPage("payments")}
              />
            )}

            {page === "payments" && (
              <PaymentsView token={token} isSupplier={isSupplier} showToast={showToast} />
            )}

            {page === "balance" && (
              <PreviousBalanceView token={token} isSupplier={isSupplier} showToast={showToast} />
            )}

            {page === "reports" && <WeeklyReportsView token={token} />}

            {page === "whatsapp" && <WhatsAppShareView token={token} />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

      {/* Mobile App Install Modal */}
      {showInstallModal && (
        <InstallAppModal
          onClose={() => setShowInstallModal(false)}
          deferredPrompt={deferredPrompt}
          onPromptInstall={handleInstallApp}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Visible on phones/tablets) */}
      <nav className="mobile-bottom-nav">
        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        {isSupplier && (
          <button
            className={page === "supply" ? "active" : ""}
            onClick={() => setPage("supply")}
          >
            <ClipboardList size={20} />
            <span>Supply</span>
          </button>
        )}
        <button
          className={page === "bills" ? "active" : ""}
          onClick={() => setPage("bills")}
        >
          <Receipt size={20} />
          <span>Bills</span>
        </button>
        <button
          className={page === "payments" ? "active" : ""}
          onClick={() => setPage("payments")}
        >
          <CreditCard size={20} />
          <span>Pay</span>
        </button>
        <button
          className={page === "reports" ? "active" : ""}
          onClick={() => setPage("reports")}
        >
          <BarChart3 size={20} />
          <span>Reports</span>
        </button>
        <button
          className="btn-install-tab"
          onClick={() => setShowInstallModal(true)}
        >
          <Smartphone size={20} />
          <span>App</span>
        </button>
      </nav>
    </div>
  );
}

// =========================================================================
// MOBILE APP INSTALL MODAL (Android PWA & APK Support)
// =========================================================================
function InstallAppModal({ onClose, deferredPrompt, onPromptInstall }) {
  const [copied, setCopied] = useState(false);
  const localIpUrl = `http://${window.location.hostname || "192.168.29.103"}:5173`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(localIpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet install-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <Smartphone className="brand-accent-icon" size={24} />
            <div>
              <h3>Install Mobile App</h3>
              <span className="modal-sub">Sri Kanaka Durga Chicken Center</span>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="install-modal-body">
          <div className="app-card-preview">
            <img src="/chicken-avatar.png" alt="App Icon" className="preview-app-icon" />
            <div className="preview-app-details">
              <div className="preview-app-title">Sri Kanaka Durga Chicken Billing</div>
              <div className="preview-app-meta">Wholesale Supply to Novel Hotel • Realtime Sync</div>
              <div className="preview-app-tags">
                <span className="badge-pwa">📱 Android PWA</span>
                <span className="badge-pwa">⚡ Instant Home-Screen</span>
                <span className="badge-pwa">🔒 Role-Secured</span>
              </div>
            </div>
          </div>

          {/* Direct Android APK Download Banner */}
          <div className="apk-download-hero-card">
            <div className="apk-hero-content">
              <h4>📦 Download Standalone Android APK</h4>
              <p>Install directly onto your Android phone (3.0 MB). No browser restrictions!</p>
            </div>
            <a
              href="/skd-chicken.apk"
              download="Sri Kanaka Durga Chicken Center.apk"
              className="btn-download-apk-action"
            >
              <Download size={18} />
              <span>Download .APK</span>
            </a>
          </div>

          {deferredPrompt ? (
            <div className="install-one-tap-card">
              <h4>🚀 Ready for 1-Click Install</h4>
              <p>Your browser supports direct installation. Tap below to add the official icon to your phone or desktop home screen:</p>
              <button className="btn-login-orange w-full" onClick={onPromptInstall}>
                <Smartphone size={18} />
                <span>Install Official Mobile App Now</span>
              </button>
            </div>
          ) : (
            <div className="install-steps-container">
              <div className="install-step-card">
                <div className="step-badge">Step 1</div>
                <div className="step-info">
                  <h4>Open on your Android Phone</h4>
                  <p>Connect your phone to your Wi-Fi, then open this address in <strong>Google Chrome</strong>:</p>
                  <div className="mobile-url-bar">
                    <span className="url-text">{localIpUrl}</span>
                    <button className="btn-copy-chip" onClick={handleCopyLink}>
                      {copied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="install-step-card">
                <div className="step-badge">Fastest</div>
                <div className="step-info">
                  <h4>Option 1: Tap 'Create shortcut'</h4>
                  <p>In the Chrome prompt <em>"Install and create shortcut"</em>, tap <strong>Create shortcut</strong> (or in Chrome menu ⋮ ➔ tap <strong>Add to Home screen / Create shortcut</strong>). Android will immediately put the Chicken icon on your home screen!</p>
                </div>
              </div>

              <div className="install-step-card">
                <div className="step-badge">Official</div>
                <div className="step-info">
                  <h4>Option 2: Install via Cloudflare HTTPS (Enables [Install] Button)</h4>
                  <p>Google's cloud WebAPK builder requires HTTPS. Open this secure Cloudflare link on your phone:</p>
                  <div className="mobile-url-bar">
                    <span className="url-text">https://hon-solve-butterfly-branches.trycloudflare.com</span>
                    <button
                      className="btn-copy-chip"
                      onClick={() => {
                        navigator.clipboard?.writeText("https://hon-solve-butterfly-branches.trycloudflare.com");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                    >
                      {copied ? "✓ Copied!" : "Copy Link"}
                    </button>
                  </div>
                  <p style={{ marginTop: "6px", fontSize: "0.78rem", color: "#38bdf8" }}>
                    ✓ Over this link, Chrome's <strong>[Install]</strong> button activates with zero errors!
                  </p>
                </div>
              </div>

              <div className="install-step-card">
                <div className="step-badge">Result</div>
                <div className="step-info">
                  <h4>Instant Fullscreen App</h4>
                  <p>The 🐔 <strong>SKD Chicken</strong> app appears on your phone home screen. It opens full screen with zero address bar, fast offline caching, bottom navigation bar, and instant billing access!</p>
                </div>
              </div>
            </div>
          )}

          <div className="apk-native-info-box">
            <strong>📦 Want a Standalone Android APK File?</strong>
            <p>
              This app is fully compatible with <strong>Capacitor</strong>. A preconfigured <code>capacitor.config.json</code> is included. Run <code>npx cap add android</code> to build a native release <code>.apk</code> in Android Studio.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 1. LOGIN PAGE COMPONENT (Matches Reference UI)
// =========================================================================
function LoginPage({ onLogin, onInstallApp }) {
  const [role, setRole] = useState("supplier");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (selected) => {
    setRole(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials. Please verify your login details.");
      }

      onLogin(data);
    } catch (err) {
      setError(err.message || "Failed to connect to backend server. Make sure API is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-branded">
      <div className="login-card-duo">
        {/* Left Side: Brand Visual with Chicken Art & Typography */}
        <div className="login-hero-art">
          <img
            src="/login-left-banner.png"
            alt="Sri Kanaka Durga Chicken Center"
            className="hero-art-img"
          />
        </div>

        {/* Right Side: Form Card */}
        <div className="login-form-card">
          <div className="login-form-top">
            <img
              src="/chicken-mini.png"
              alt="Sri Kanaka Durga Chicken Center"
              className="login-top-logo"
            />
            <h2 className="login-heading">
              {role === "supplier" ? "Supplier Login" : "Novel Hotel Login"}
            </h2>
            <p className="login-subheading">
              {role === "supplier" ? "Access your supplier account" : "Access your hotel account"}
            </p>
            <button
              type="button"
              className="btn-install-pwa-badge"
              onClick={onInstallApp}
              title="Install Mobile App on Android"
            >
              <Smartphone size={15} />
              <span>📱 Install Mobile App (Android APK / PWA)</span>
            </button>
          </div>

          {error && (
            <div className="login-error-pill">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-fields-form">
            {/* Segmented Role Switcher */}
            <div className="segmented-role-nav">
              <button
                type="button"
                className={`segmented-tab ${role === "supplier" ? "active-supplier" : ""}`}
                onClick={() => handleRoleChange("supplier")}
              >
                <Store size={18} className="tab-icon" />
                <span>Supplier (Admin)</span>
              </button>
              <button
                type="button"
                className={`segmented-tab ${role === "hotel" ? "active-hotel" : ""}`}
                onClick={() => handleRoleChange("hotel")}
              >
                <Building2 size={18} className="tab-icon" />
                <span>Novel Hotel</span>
              </button>
            </div>

            {/* Username Input with Left Icon */}
            <div className="input-block">
              <label className="input-label">Username</label>
              <div className="input-icon-shell">
                <User size={18} className="input-left-icon" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="input-boxed"
                />
              </div>
            </div>

            {/* Password Input with Left Icon & Eye Toggle */}
            <div className="input-block">
              <label className="input-label">Password</label>
              <div className="input-icon-shell">
                <Lock size={18} className="input-left-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-boxed with-eye"
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="auth-options-row">
              <label className="checkbox-wrap">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="orange-checkbox"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-link-btn"
                onClick={() => alert("To reset password, please contact Sri Kanaka Durga Admin at +91 95507 14566.")}
              >
                Forgot password?
              </button>
            </div>

            {/* Vibrant Orange Submit Button */}
            <button type="submit" disabled={loading} className="btn-login-orange">
              <span>{loading ? "Signing in..." : (role === "supplier" ? "Login as Supplier" : "Login as Novel Hotel")}</span>
              <ArrowRight size={18} />
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. DASHBOARD VIEW COMPONENT
// =========================================================================
function DashboardView({ token, isSupplier, onNavigate, onViewInvoice }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="loading-state">Loading billing overview...</div>;
  }

  const statCards = [
    {
      title: "Today's Supply",
      value: `${Number(data?.todayWeight || 0).toFixed(2)} kg`,
      sub: `${data?.todayChickens || 0} Chickens delivered today`,
      icon: ClipboardList,
      color: "blue"
    },
    {
      title: "Today's Bill",
      value: `₹${Number(data?.todayBill || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      sub: "Billed after ₹60/kg deduction",
      icon: Receipt,
      color: "amber"
    },
    {
      title: "Total Paid",
      value: `₹${Number(data?.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      sub: "Cumulative payments recorded",
      icon: CreditCard,
      color: "green"
    },
    {
      title: "Pending Balance",
      value: `₹${Number(data?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      sub: "Balance due from Novel Hotel",
      icon: Scale,
      color: "red"
    }
  ];

  return (
    <div className="dashboard-content">
      {/* Branded Dashboard Hero Banner matching design */}
      <div className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-badge-tag">
            <span className="hero-bullet">●</span>
            <span>{isSupplier ? "SRI KANAKA DURGA CHICKEN CENTER — WHOLESALE PORTAL" : "NOVEL HOTEL — CUSTOMER VIEW-ONLY PORTAL"}</span>
          </div>
          <h1>{isSupplier ? "Sri Kanaka Durga Chicken Billing" : "Welcome, Novel Hotel 👋"}</h1>
          <p className="hero-banner-p">
            {isSupplier
              ? "Wholesale daily broiler chicken delivery, automated ₹60/kg rate deduction, live invoicing, customer ledger & instant WhatsApp billing."
              : "Real-time view-only billing portal for Novel Hotel. View daily supply weights, verified invoices, payments, and account ledger."}
          </p>
          <div className="hero-pills-row">
            <span className="hero-pill-badge">🏨 Recipient: Novel Hotel</span>
            <span className="hero-pill-badge highlight-pill">⚡ Agreed Deduction: −₹60.00 / kg</span>
            <span className="hero-pill-badge date-pill">📅 {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>
        <div className="hero-banner-art">
          <img src="/chicken-avatar.png" alt="Sri Kanaka Durga Rooster Mascot" className="hero-rooster-img" />
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="stat-cards-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`stat-card border-${card.color}`}>
              <div className="stat-top">
                <span className="stat-title">{card.title}</span>
                <div className={`stat-icon-wrapper bg-${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="stat-val">{card.value}</div>
              <div className="stat-sub">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Business Calculation Rule Card */}
      <div className="panel formula-highlight-card">
        <div className="formula-header">
          <TrendingUp size={20} className="formula-icon" />
          <div>
            <h3>Wholesale Pricing Rule & Business Formula</h3>
            <p>Applied transparently to every delivery challan</p>
          </div>
        </div>
        <div className="formula-steps">
          <div className="formula-step">
            <span className="f-label">Market Paper Rate</span>
            <strong>Paper Rate (₹/kg)</strong>
          </div>
          <span className="f-operator">−</span>
          <div className="formula-step highlight-step">
            <span className="f-label">Standard Agreed Discount</span>
            <strong>₹60.00 / kg Deduction</strong>
          </div>
          <span className="f-operator">=</span>
          <div className="formula-step">
            <span className="f-label">Effective Hotel Rate</span>
            <strong>Final Rate (₹/kg)</strong>
          </div>
          <span className="f-operator">×</span>
          <div className="formula-step">
            <span className="f-label">Weight Delivered</span>
            <strong>Total Weight (kg)</strong>
          </div>
          <span className="f-operator">=</span>
          <div className="formula-step highlight-total">
            <span className="f-label">Total Amount Billed</span>
            <strong>Total Bill (₹)</strong>
          </div>
        </div>
      </div>

      {/* Activity Tables Grid */}
      <div className="dashboard-grid-2">
        {/* Recent Supplies */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Chicken Supplies</h3>
              <p>Latest deliveries to Novel Hotel</p>
            </div>
            <button className="btn-link" onClick={() => onNavigate("bills")}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Final Rate</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentSupplies?.length > 0 ? (
                  data.recentSupplies.map((s) => (
                    <tr key={s.id}>
                      <td><b>{s.bill_number || `SKD-2026-${String(s.id).padStart(5, "0")}`}</b></td>
                      <td>{String(s.supply_date).slice(0, 10)}</td>
                      <td>{Number(s.weight).toFixed(2)} kg</td>
                      <td>₹{Number(s.final_rate).toFixed(2)}</td>
                      <td><b>₹{Number(s.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b></td>
                      <td>
                        <button
                          className="action-icon-btn"
                          title="View Invoice"
                          onClick={() => onViewInvoice(s)}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-text">No supplies recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Recent Payments Received</h3>
              <p>Settlement history from Novel Hotel</p>
            </div>
            <button className="btn-link" onClick={() => onNavigate("payments")}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPayments?.length > 0 ? (
                  data.recentPayments.map((p) => (
                    <tr key={p.id}>
                      <td>{String(p.payment_date).slice(0, 10)}</td>
                      <td><b className="text-success">₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b></td>
                      <td><span className="badge-method">{p.method}</span></td>
                      <td className="note-cell">{p.notes || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-text">No payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. DAILY CHICKEN SUPPLY VIEW (Supplier Only)
// =========================================================================
function DailySupplyView({ token, onSupplySaved }) {
  const [supplyDate, setSupplyDate] = useState(new Date().toISOString().slice(0, 10));
  const [chickens, setChickens] = useState("");
  const [weight, setWeight] = useState("");
  const [paperRate, setPaperRate] = useState("");
  const [saving, setSaving] = useState(false);

  // Live Dynamic Calculation
  const calculation = useMemo(() => {
    const numWeight = parseFloat(weight) || 0;
    const numPaperRate = parseFloat(paperRate) || 0;
    const deduction = 60.0;
    const finalRate = Math.max(0, numPaperRate - deduction);
    const totalBill = numWeight * finalRate;

    return {
      numWeight,
      numPaperRate,
      deduction,
      finalRate,
      totalBill
    };
  }, [weight, paperRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chickens || !weight || !paperRate) {
      return alert("Please fill in all supply fields.");
    }

    if (parseFloat(paperRate) < 60) {
      return alert("Paper Rate must be at least ₹60/kg.");
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/supplies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supplyDate,
          chickens,
          weight,
          paperRate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to record daily supply.");
      }

      onSupplySaved(data.supply);
      setChickens("");
      setWeight("");
      setPaperRate("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearForm = () => {
    setChickens("");
    setWeight("");
    setPaperRate("");
  };

  return (
    <div className="supply-view-container">
      <div className="section-title-wrap">
        <div>
          <span className="welcome-eyebrow">SUPPLIER DISPATCH</span>
          <h2>Daily Chicken Supply Entry</h2>
          <p>Record daily weight and paper rate. Bill is computed with automatic ₹60/kg deduction.</p>
        </div>
      </div>

      <div className="supply-layout-grid">
        {/* Entry Form */}
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-title-bar">
            <h3>Supply Delivery Details</h3>
            <span className="form-sub-tag">Billed to: Novel Hotel</span>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Delivery Date *</label>
              <input
                type="date"
                required
                value={supplyDate}
                onChange={(e) => setSupplyDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Number of Chickens (Quantity) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 25"
                value={chickens}
                onChange={(e) => setChickens(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Total Weight in kg *</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="e.g. 48.50"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>Market Paper Rate (₹/kg) *</label>
              <input
                type="number"
                step="0.01"
                min="60"
                required
                placeholder="e.g. 250"
                value={paperRate}
                onChange={(e) => setPaperRate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="fixed-deduction-callout">
            <div className="deduction-badge">FIXED DEDUCTION</div>
            <div className="deduction-content">
              <strong>₹60.00 / kg Automatic Discount</strong>
              <p>Per supply agreement, ₹60/kg is automatically subtracted from the paper rate.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
            <button type="submit" disabled={saving} className="btn-primary-lg" style={{ flex: 1, margin: 0 }}>
              <Plus size={18} />
              <span>{saving ? "Generating Bill..." : "Save Daily Bill & Generate Invoice"}</span>
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="action-icon-btn"
              style={{ padding: "0 18px", borderRadius: "8px", fontWeight: "700", display: "flex", gap: "6px" }}
              title="Clear entered details"
            >
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {/* Live Bill Preview Card */}
        <div className="panel live-calc-panel">
          <div className="panel-header">
            <h3>Live Bill Computation</h3>
            <span className="live-tag">Real-Time Preview</span>
          </div>

          <div className="live-calc-items">
            <div className="live-row">
              <span>Paper Rate:</span>
              <strong>₹{calculation.numPaperRate.toFixed(2)} / kg</strong>
            </div>
            <div className="live-row text-danger">
              <span>Deduction:</span>
              <strong>− ₹{calculation.deduction.toFixed(2)} / kg</strong>
            </div>
            <div className="live-row highlight-row">
              <span>Final Hotel Rate:</span>
              <strong className="text-primary">₹{calculation.finalRate.toFixed(2)} / kg</strong>
            </div>
            <div className="live-row">
              <span>Total Weight:</span>
              <strong>{calculation.numWeight.toFixed(2)} kg</strong>
            </div>
            <div className="live-divider" />
            <div className="live-total-box">
              <span className="total-label">Total Bill Amount</span>
              <h2 className="total-amount">
                ₹{calculation.totalBill.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <span className="total-formula-sub">
                ({calculation.numWeight.toFixed(2)} kg × ₹{calculation.finalRate.toFixed(2)})
              </span>
            </div>
          </div>

          <div className="calc-note">
            <AlertCircle size={15} />
            <span>Generating this entry creates a unique invoice number (e.g. SKD-2026-XXXXX) and adds it to Novel Hotel's account.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. BILLS VIEW COMPONENT
// =========================================================================
function BillsView({ token, isSupplier, onViewInvoice, showToast, onPayBill }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadBills = () => {
    setLoading(true);
    fetch(`${API}/supplies`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        setBills(Array.isArray(res) ? res : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBills();
  }, [token]);

  const updateStatus = async (billId, newStatus) => {
    try {
      const res = await fetch(`${API}/bills/${billId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Bill marked as ${newStatus}`);
        loadBills();
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteBill = async (b) => {
    if (!window.confirm(`Are you sure you want to clear/delete bill ${b.bill_number}? This will permanently remove it from the ledger.`)) {
      return;
    }
    try {
      const res = await fetch(`${API}/supplies/${b.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete bill.");
      showToast(`Bill ${b.bill_number} has been cleared.`);
      loadBills();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredBills = useMemo(() => {
    if (!search.trim()) return bills;
    const q = search.toLowerCase();
    return bills.filter(
      (b) =>
        (b.bill_number && b.bill_number.toLowerCase().includes(q)) ||
        (b.supply_date && String(b.supply_date).includes(q))
    );
  }, [bills, search]);

  const handleShareWhatsApp = (b) => {
    const text = `*Chicken Bill ${b.bill_number}*
Sri Kanaka Durga Chicken Center ➔ Novel Hotel
---------------------------------
Date: ${String(b.supply_date).slice(0, 10)}
Quantity: ${b.chickens} Chickens
Weight: ${Number(b.weight).toFixed(2)} kg
Paper Rate: ₹${Number(b.paper_rate).toFixed(2)}/kg
Deduction: ₹${Number(b.deduction).toFixed(2)}/kg
Final Rate: ₹${Number(b.final_rate).toFixed(2)}/kg
Total Bill: ₹${Number(b.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Status: ${b.payment_status || "Pending"}
---------------------------------
Sri Kanaka Durga Chicken Center`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadInvoiceHTML = (b) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${b.bill_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 700px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #b45309; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 20px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
          th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
          th { background: #f3f4f6; }
          .total-row { font-size: 16px; font-weight: bold; background: #fffbeb; }
          .signature { margin-top: 50px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SRI KANAKA DURGA CHICKEN CENTER</h1>
          <p>Wholesale Fresh Chicken Suppliers | Ph: +91 95507 14566</p>
          <h3>DELIVERY CHALLAN / TAX INVOICE</h3>
        </div>
        <div class="meta-grid">
          <div>
            <strong>BILLED TO:</strong><br>
            Novel Hotel<br>
            Station Road, Near Clock Tower
          </div>
          <div style="text-align: right;">
            <strong>INVOICE NO:</strong> ${b.bill_number}<br>
            <strong>DATE:</strong> ${String(b.supply_date).slice(0, 10)}<br>
            <strong>STATUS:</strong> ${b.payment_status || "Pending"}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Chickens</th>
              <th>Weight</th>
              <th>Paper Rate</th>
              <th>Deduction</th>
              <th>Final Rate</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Fresh Broiler Chicken</td>
              <td>${b.chickens}</td>
              <td>${Number(b.weight).toFixed(2)} kg</td>
              <td>₹${Number(b.paper_rate).toFixed(2)}</td>
              <td>-₹${Number(b.deduction).toFixed(2)}</td>
              <td>₹${Number(b.final_rate).toFixed(2)}</td>
              <td><b>₹${Number(b.total_bill).toFixed(2)}</b></td>
            </tr>
            <tr class="total-row">
              <td colspan="6" style="text-align: right;">TOTAL BILL AMOUNT:</td>
              <td>₹${Number(b.total_bill).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div class="signature">
          <div>Receiver's Signature (Novel Hotel)</div>
          <div>Authorized Signatory (Sri Kanaka Durga)</div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${b.bill_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bills-view-container">
      <div className="section-title-wrap flex-between">
        <div>
          <span className="welcome-eyebrow">INVOICE & CHALLAN REGISTRY</span>
          <h2>{isSupplier ? "Bills Management" : "Novel Hotel Bill History"}</h2>
          <p>View, print, download, and share detailed chicken supply invoices.</p>
        </div>
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Search by Bill No or Date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Date</th>
                <th>Chickens</th>
                <th>Weight</th>
                <th>Paper Rate</th>
                <th>Deduction</th>
                <th>Final Rate</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="empty-text">Loading bills...</td>
                </tr>
              ) : filteredBills.length > 0 ? (
                filteredBills.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <b className="bill-tag">{b.bill_number || `SKD-2026-${String(b.id).padStart(5, "0")}`}</b>
                    </td>
                    <td>{String(b.supply_date).slice(0, 10)}</td>
                    <td>{b.chickens}</td>
                    <td>{Number(b.weight).toFixed(2)} kg</td>
                    <td>₹{Number(b.paper_rate).toFixed(2)}</td>
                    <td className="text-danger">-₹{Number(b.deduction).toFixed(2)}</td>
                    <td><b className="text-primary">₹{Number(b.final_rate).toFixed(2)}</b></td>
                    <td><b>₹{Number(b.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b></td>
                    <td>
                      {isSupplier ? (
                        <select
                          className={`status-select ${b.payment_status?.toLowerCase() || "pending"}`}
                          value={b.payment_status || "Pending"}
                          onChange={(e) => updateStatus(b.bill_id || b.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Partial">Partial</option>
                          <option value="Paid">Paid</option>
                        </select>
                      ) : (
                        <span className={`status-pill ${b.payment_status?.toLowerCase() || "pending"}`}>
                          {b.payment_status || "Pending"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          className="action-icon-btn"
                          title="View Invoice"
                          onClick={() => onViewInvoice(b)}
                        >
                          <Eye size={15} />
                        </button>
                        {onPayBill && (
                          <button
                            className="action-icon-btn"
                            style={{ color: "#ea580c" }}
                            title={isSupplier ? "Record Payment for this Bill" : "Pay via UPI"}
                            onClick={() => onPayBill(b)}
                          >
                            <CreditCard size={15} />
                          </button>
                        )}
                        <button
                          className="action-icon-btn"
                          title="Download Invoice"
                          onClick={() => handleDownloadInvoiceHTML(b)}
                        >
                          <Download size={15} />
                        </button>
                        <button
                          className="action-icon-btn text-success"
                          title="Share via WhatsApp"
                          onClick={() => handleShareWhatsApp(b)}
                        >
                          <Share2 size={15} />
                        </button>
                        {isSupplier && (
                          <button
                            className="action-icon-btn text-danger"
                            title="Delete / Clear Bill"
                            onClick={() => handleDeleteBill(b)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="empty-text">No bills found matching your query.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 5. INVOICE MODAL COMPONENT (View & Print)
// =========================================================================
function InvoiceModal({ invoice, onClose }) {
  const upiUrl = `upi://pay?pa=9550714566@upi&pn=${encodeURIComponent("Sri Kanaka Durga Chicken Center")}&am=${Number(invoice.total_bill).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Bill ${invoice.bill_number}`)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `*Chicken Bill ${invoice.bill_number}*
Sri Kanaka Durga Chicken Center ➔ Novel Hotel
---------------------------------
Date: ${String(invoice.supply_date).slice(0, 10)}
Quantity: ${invoice.chickens} Chickens
Weight: ${Number(invoice.weight).toFixed(2)} kg
Paper Rate: ₹${Number(invoice.paper_rate).toFixed(2)}/kg
Deduction: ₹${Number(invoice.deduction).toFixed(2)}/kg
Final Rate: ₹${Number(invoice.final_rate).toFixed(2)}/kg
Total Bill: ₹${Number(invoice.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Status: ${invoice.payment_status || "Pending"}
---------------------------------`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-actions-bar no-print">
          <div className="modal-action-title">Delivery Challan & Invoice Preview</div>
          <div className="btn-group">
            <a
              href={upiUrl}
              className="btn-action-modal"
              style={{ background: "#16a34a", color: "#ffffff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "700" }}
              title="Open Google Pay / PhonePe / Paytm"
            >
              <Smartphone size={16} /> Pay via UPI
            </a>
            <button className="btn-action-modal print-btn" onClick={handlePrint}>
              <Printer size={16} /> Print Bill
            </button>
            <button className="btn-action-modal whatsapp-btn" onClick={handleShare}>
              <Share2 size={16} /> WhatsApp Share
            </button>
            <button className="btn-close-modal" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="invoice-sheet printable-area">
          <div className="invoice-header">
            <div className="invoice-brand">
              <h1>🐔 SRI KANAKA DURGA CHICKEN CENTER</h1>
              <p className="supplier-tagline">Wholesale Fresh Broiler Chicken Suppliers & Daily Distributors</p>
              <div className="supplier-contact">
                <span>📍 Market Yard Main Road</span>
                <span>📞 Ph: +91 95507 14566</span>
              </div>
            </div>
            <div className="invoice-title-badge">DELIVERY CHALLAN & INVOICE</div>
          </div>

          <div className="invoice-meta-grid">
            <div className="meta-billed-to">
              <span className="meta-heading">BILLED TO (CUSTOMER):</span>
              <h3>🏨 NOVEL HOTEL</h3>
              <p>Station Road, Beside Clock Tower</p>
              <p>Contact: N Ravi Kumar | +91 95507 14566</p>
            </div>

            <div className="meta-invoice-details">
              <div className="meta-field">
                <span>INVOICE NUMBER:</span>
                <strong>{invoice.bill_number || `SKD-2026-${invoice.id}`}</strong>
              </div>
              <div className="meta-field">
                <span>DELIVERY DATE:</span>
                <strong>{String(invoice.supply_date).slice(0, 10)}</strong>
              </div>
              <div className="meta-field">
                <span>PAYMENT STATUS:</span>
                <span className="invoice-status-tag">{invoice.payment_status || "Pending"}</span>
              </div>
            </div>
          </div>

          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Description</th>
                <th>Quantity</th>
                <th>Total Weight</th>
                <th>Paper Rate</th>
                <th>Discount</th>
                <th>Final Rate</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Fresh Wholesale Broiler Chicken</strong>
                  <br />
                  <small>Daily hotel supply batch</small>
                </td>
                <td>{invoice.chickens} Birds</td>
                <td>{Number(invoice.weight).toFixed(2)} kg</td>
                <td>₹{Number(invoice.paper_rate).toFixed(2)}</td>
                <td className="text-danger">-₹{Number(invoice.deduction).toFixed(2)}</td>
                <td><b>₹{Number(invoice.final_rate).toFixed(2)}</b></td>
                <td><b>₹{Number(invoice.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b></td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="7" className="tfoot-label">Subtotal Amount:</td>
                <td>₹{Number(invoice.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="tfoot-grand">
                <td colSpan="7" className="tfoot-label">GRAND TOTAL BILL AMOUNT:</td>
                <td>₹{Number(invoice.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

          <div className="business-rule-note">
            <b>Billing Rule Applied:</b> Final Rate = Paper Rate (₹{Number(invoice.paper_rate).toFixed(2)}) − Fixed ₹60/kg Deduction = ₹{Number(invoice.final_rate).toFixed(2)}/kg × {Number(invoice.weight).toFixed(2)} kg.
          </div>

          <div className="invoice-signatures">
            <div className="sig-box">
              <div className="sig-line" />
              <span>Novel Hotel Receiver Signature</span>
            </div>
            <div className="sig-box">
              <div className="sig-line" />
              <span>For Sri Kanaka Durga Chicken Center</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 6. PAYMENT MANAGEMENT VIEW
// =========================================================================
function PaymentsView({ token, isSupplier, showToast }) {
  const [data, setData] = useState({ payments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Supplier Record Form State
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Online UPI Payment State (For Novel Hotel or Supplier showing QR)
  const [upiAmount, setUpiAmount] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

  const loadPayments = () => {
    setLoading(true);
    setLoadError(null);
    fetch(`${API}/payments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.removeItem("cb_token");
          localStorage.removeItem("cb_user");
          window.location.reload();
          return null;
        }
        if (!r.ok) {
          throw new Error(`Server returned error code ${r.status}`);
        }
        return r.json();
      })
      .then((res) => {
        if (res) {
          setData({
            payments: Array.isArray(res.payments) ? res.payments : [],
            summary: res.summary || {}
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Payments load error:", err);
        setLoadError(err.message || "Failed to load payment records");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
  }, [token]);

  const pendingBalance = Number(data?.summary?.pendingBalance || 0);

  // Set default UPI amount to pending balance once loaded
  useEffect(() => {
    if (pendingBalance > 0 && !upiAmount) {
      setUpiAmount(String(Math.round(pendingBalance)));
    }
  }, [pendingBalance]);

  const currentUpiAmt = parseFloat(upiAmount) > 0 ? parseFloat(upiAmount) : (pendingBalance > 0 ? pendingBalance : 1000);
  const upiId = "9550714566@upi";
  const payeeName = "Sri Kanaka Durga Chicken Center";
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${currentUpiAmt}&cu=INR&tn=${encodeURIComponent("Novel Hotel Chicken Bill Settlement")}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
    showToast("UPI ID copied to clipboard: 9550714566@upi");
  };

  const handleWhatsAppReceipt = () => {
    const text = `*Chicken Payment Confirmation*
From: Novel Hotel
To: Sri Kanaka Durga Chicken Center
---------------------------------
Amount: ₹${Number(currentUpiAmt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Date: ${new Date().toISOString().slice(0, 10)}
Mode: UPI / Online Payment
---------------------------------
Please verify and update our ledger balance. Thank you!`;
    window.open(`https://api.whatsapp.com/send?phone=919550714566&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      return alert("Please enter a valid payment amount.");
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentDate,
          amount,
          method,
          notes
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to record payment.");
      }

      showToast(`Payment of ₹${parseFloat(amount).toLocaleString("en-IN")} recorded successfully!`);
      setAmount("");
      setNotes("");
      loadPayments();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async (p) => {
    if (!window.confirm(`Are you sure you want to clear/delete payment of ₹${p.amount}? This will update the pending balance.`)) {
      return;
    }
    try {
      const res = await fetch(`${API}/payments/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to delete payment.");
      showToast("Payment record deleted.");
      loadPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const summaryCards = [
    { label: "Total Billed", val: data?.summary?.totalBilled || 0, color: "blue" },
    { label: "Total Paid", val: data?.summary?.totalPaid || 0, color: "green" },
    { label: "Previous Balance", val: data?.summary?.previousBalance || 0, color: "amber" },
    { label: "Current Pending Balance", val: data?.summary?.pendingBalance || 0, color: "red" }
  ];

  return (
    <div className="payments-view-container">
      <div className="section-title-wrap">
        <div>
          <span className="welcome-eyebrow">FINANCIAL LEDGER & SETTLEMENT</span>
          <h2>Payment Management</h2>
          <p>Instant UPI settlement, cash & bank transfers for Sri Kanaka Durga ➔ Novel Hotel billing.</p>
        </div>
      </div>

      {loadError && (
        <div style={{ background: "#fee2e2", border: "1px solid #f87171", borderRadius: "10px", padding: "14px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#991b1b", fontSize: "14px", fontWeight: "600" }}>
            <AlertCircle size={20} />
            <span>Could not load payments: {loadError}</span>
          </div>
          <button onClick={loadPayments} style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
            Retry
          </button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="stat-cards-grid">
        {summaryCards.map((sc, i) => (
          <div key={i} className={`stat-card border-${sc.color}`}>
            <span className="stat-title">{sc.label}</span>
            <div className="stat-val">
              ₹{Number(sc.val).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="stat-sub">
              {sc.label === "Current Pending Balance"
                ? "Opening Balance + Billed − Paid"
                : "Cumulative account balance"}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid-2">
        {/* LEFT PANEL: UPI Pay Portal (Customer) or Record Form (Supplier) */}
        {isSupplier ? (
          <div className="panel form-panel">
            <div className="form-title-bar">
              <div>
                <h3>Record Supplier Payment</h3>
                <span className="form-sub-tag">Received from Novel Hotel</span>
              </div>
              <button
                type="button"
                className="btn-action-modal"
                style={{ padding: "6px 10px", fontSize: "12px", gap: "5px" }}
                onClick={() => setShowQrCode(!showQrCode)}
              >
                <QrCode size={14} />
                <span>{showQrCode ? "Hide QR" : "Show QR"}</span>
              </button>
            </div>

            {showQrCode && (
              <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", padding: "14px", marginBottom: "16px", textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                  Show QR to Customer at Delivery
                </span>
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  style={{ width: "160px", height: "160px", borderRadius: "8px", margin: "0 auto 8px auto", display: "block", border: "1px solid #e2e8f0" }}
                />
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                  UPI: <span style={{ color: "#ea580c" }}>{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{ background: "#e2e8f0", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", marginTop: "6px" }}
                >
                  {copiedUpi ? "Copied!" : "Copy UPI ID"}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitPayment}>
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Amount Received (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="input-field"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Transaction Notes / Reference</label>
                <textarea
                  placeholder="e.g. UPI Ref: 4291882910 or Cash paid by Ravi Kumar"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-textarea"
                  rows="3"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary-lg">
                <CreditCard size={18} />
                <span>{saving ? "Recording..." : "Record Payment & Update Balance"}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Novel Hotel Customer View: Complete UPI Online Payment Portal */
          <div className="panel" style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}>
            <div className="form-title-bar" style={{ marginBottom: "16px" }}>
              <div>
                <span className="welcome-eyebrow" style={{ color: "#ea580c" }}>ONLINE UPI BILL SETTLEMENT</span>
                <h3 style={{ margin: "2px 0 0 0" }}>Pay Sri Kanaka Durga Center</h3>
                <span className="form-sub-tag">Direct UPI Transfer via PhonePe / GPay / Paytm</span>
              </div>
            </div>

            {/* Pending Balance Callout */}
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "14px", marginBottom: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#c2410c", textTransform: "uppercase" }}>Current Balance Due</span>
                <div style={{ fontSize: "22px", fontWeight: "900", color: "#9a3412" }}>
                  ₹{Number(pendingBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
              <span style={{ background: "#ea580c", color: "#fff", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                Novel Hotel
              </span>
            </div>

            {/* Preset Amount Pills */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", display: "block", marginBottom: "6px" }}>
                Choose Payment Amount:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {pendingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setUpiAmount(String(Math.round(pendingBalance)))}
                    style={{
                      background: upiAmount === String(Math.round(pendingBalance)) ? "#ea580c" : "#f1f5f9",
                      color: upiAmount === String(Math.round(pendingBalance)) ? "#fff" : "#334155",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    Full Balance (₹{Math.round(pendingBalance)})
                  </button>
                )}
                {[20000, 10000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setUpiAmount(String(amt))}
                    style={{
                      background: upiAmount === String(amt) ? "#ea580c" : "#f1f5f9",
                      color: upiAmount === String(amt) ? "#fff" : "#334155",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer"
                    }}
                  >
                    ₹{amt.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="form-group" style={{ marginBottom: "14px" }}>
              <label>Amount to Pay (₹)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={upiAmount}
                onChange={(e) => setUpiAmount(e.target.value)}
                placeholder="Enter custom amount (e.g. 5000)"
                className="input-field"
                style={{ fontSize: "16px", fontWeight: "700" }}
              />
            </div>

            {/* Pay via UPI App Mobile Deep Link Button */}
            <a
              href={upiDeepLink}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#ffffff",
                padding: "14px 20px",
                borderRadius: "10px",
                fontWeight: "800",
                fontSize: "15px",
                textDecoration: "none",
                marginBottom: "12px",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
              }}
            >
              <Smartphone size={18} />
              <span>⚡ Open Google Pay / PhonePe / Paytm</span>
              <ExternalLink size={16} />
            </a>

            {/* Interactive QR Code for Scanning */}
            <div style={{ textAlign: "center", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Scan to Pay ₹{Number(currentUpiAmt).toLocaleString("en-IN")}
              </span>
              <img
                src={qrCodeUrl}
                alt="Scan to Pay QR"
                style={{ width: "170px", height: "170px", borderRadius: "8px", margin: "0 auto 8px auto", display: "block", border: "1px solid #cbd5e1" }}
              />
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span>UPI ID: <b style={{ color: "#ea580c" }}>{upiId}</b></span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{ background: "#e2e8f0", border: "none", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Copy size={12} />
                  <span>{copiedUpi ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* WhatsApp Receipt Notify Button */}
            <button
              type="button"
              onClick={handleWhatsAppReceipt}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "#25D366",
                color: "#ffffff",
                border: "none",
                padding: "12px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <Share2 size={16} />
              <span>Send Payment Screenshot via WhatsApp</span>
            </button>
          </div>
        )}

        {/* RIGHT PANEL: Payment History Ledger */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Payment Receipts Ledger</h3>
              <p>Historical settlements from Novel Hotel</p>
            </div>
            <span className="history-count">{data?.payments?.length || 0} Records</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Notes</th>
                  {isSupplier && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={isSupplier ? 5 : 4} className="empty-text">Loading payments...</td>
                  </tr>
                ) : (data?.payments?.length || 0) > 0 ? (
                  data.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{String(p.payment_date).slice(0, 10)}</td>
                      <td>
                        <b className="text-success">
                          ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </b>
                      </td>
                      <td>
                        <span className="badge-method">{p.method}</span>
                      </td>
                      <td className="note-cell">{p.notes || "—"}</td>
                      {isSupplier && (
                        <td>
                          <button
                            className="action-icon-btn text-danger"
                            title="Delete / Clear Payment"
                            onClick={() => handleDeletePayment(p)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isSupplier ? 5 : 4} className="empty-text">No payment records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 7. PREVIOUS BALANCE VIEW
// =========================================================================
function PreviousBalanceView({ token, isSupplier, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newOpening, setNewOpening] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadBalance = () => {
    setLoading(true);
    fetch(`${API}/balance`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setNewOpening(res.previousBalance || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBalance();
  }, [token]);

  const handleUpdateOpening = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`${API}/balance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ openingBalance: newOpening })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to update opening balance.");

      showToast("Opening Previous Balance updated successfully!");
      loadBalance();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading balance ledger...</div>;
  }

  return (
    <div className="balance-view-container">
      <div className="section-title-wrap">
        <div>
          <span className="welcome-eyebrow">ACCOUNT RECONCILIATION</span>
          <h2>Previous Balance & Account Ledger</h2>
          <p>Balance brought forward and ongoing calculation of pending dues.</p>
        </div>
      </div>

      {/* Formula Card */}
      <div className="panel formula-highlight-card">
        <div className="formula-header">
          <Scale size={20} className="formula-icon" />
          <div>
            <h3>Balance Formula Equation</h3>
            <p>Standard double-entry accounting rule applied to Novel Hotel</p>
          </div>
        </div>
        <div className="balance-equation-box">
          <div className="eq-item">
            <span>Previous Balance</span>
            <strong>₹{Number(data?.previousBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
          <span className="eq-sign">+</span>
          <div className="eq-item">
            <span>Current Bills</span>
            <strong>₹{Number(data?.totalBilled || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
          <span className="eq-sign">−</span>
          <div className="eq-item">
            <span>Payments Received</span>
            <strong className="text-success">₹{Number(data?.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
          <span className="eq-sign">=</span>
          <div className="eq-item eq-result">
            <span>Pending Balance</span>
            <strong className="text-danger">₹{Number(data?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="panel">
          <h3>Hotel Account Summary</h3>
          <div className="ledger-details-list">
            <div className="ledger-row">
              <span>Customer Name:</span>
              <strong>{data?.hotel?.hotel_name || "Novel Hotel"}</strong>
            </div>
            <div className="ledger-row">
              <span>Contact Person:</span>
              <span>{data?.hotel?.contact_person || "N Ravi Kumar"}</span>
            </div>
            <div className="ledger-row">
              <span>Phone:</span>
              <span>{data?.hotel?.phone || "+91 95507 14566"}</span>
            </div>
            <div className="ledger-row">
              <span>Opening / Previous Balance:</span>
              <b>₹{Number(data?.previousBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>
            </div>
            <div className="ledger-row">
              <span>Total Supplies Billed:</span>
              <b>₹{Number(data?.totalBilled || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>
            </div>
            <div className="ledger-row">
              <span>Total Payments Cleared:</span>
              <b className="text-success">₹{Number(data?.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>
            </div>
            <div className="ledger-row highlight-pending">
              <span>Net Pending Balance Due:</span>
              <b className="text-danger">₹{Number(data?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b>
            </div>
          </div>
        </div>

        {isSupplier ? (
          <form className="panel form-panel" onSubmit={handleUpdateOpening}>
            <h3>Modify Opening Previous Balance</h3>
            <p className="form-sub-desc">
              Only Sri Kanaka Durga Supplier can adjust the opening balance brought forward.
            </p>
            <div className="form-group">
              <label>Opening Previous Balance (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={newOpening}
                onChange={(e) => setNewOpening(e.target.value)}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={updating} className="btn-primary-md">
              <Scale size={16} />
              <span>{updating ? "Updating..." : "Save Opening Balance"}</span>
            </button>
          </form>
        ) : (
          <div className="panel view-only-card">
            <h3>Hotel Access Notice</h3>
            <p>
              Novel Hotel has read-only access to previous balance figures and ledger statements. Any discrepancies should be verified with Sri Kanaka Durga Chicken Center.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 8. WEEKLY REPORTS VIEW (Monday to Sunday)
// =========================================================================
function WeeklyReportsView({ token }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default to current week dates
  const currentWeek = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(today.setDate(monday.getDate() + 6));
    return {
      monday: monday.toISOString().slice(0, 10),
      sunday: sunday.toISOString().slice(0, 10)
    };
  }, []);

  const [startDate, setStartDate] = useState(currentWeek.monday);
  const [endDate, setEndDate] = useState(currentWeek.sunday);

  const loadWeeklyReport = (start, end) => {
    setLoading(true);
    fetch(`${API}/reports/weekly?startDate=${start}&endDate=${end}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((r) => r.json())
      .then((res) => {
        setReport(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadWeeklyReport(startDate, endDate);
  }, [token, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*Weekly Chicken Supply Report (Monday - Sunday)*
Sri Kanaka Durga Chicken Center ➔ Novel Hotel
Period: ${startDate} to ${endDate}
---------------------------------
Total Chickens: ${report?.totalChickens || 0}
Total Weight: ${Number(report?.totalWeight || 0).toFixed(2)} kg
Total Bills: ₹${Number(report?.totalBills || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Total Payments: ₹${Number(report?.totalPayments || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Previous Balance: ₹${Number(report?.previousBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Pending Balance: ₹${Number(report?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
---------------------------------
Thank you for your business!`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDownloadHTML = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weekly Chicken Report - ${startDate} to ${endDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 800px; margin: auto; }
          .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #b45309; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 9px; text-align: left; }
          th { background: #f3f4f6; }
          .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
          .stat { border: 1px solid #ddd; padding: 12px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SRI KANAKA DURGA CHICKEN CENTER</h1>
          <p>Weekly Supply & Billing Summary for <b>Novel Hotel</b></p>
          <h3>Period: ${startDate} to ${endDate}</h3>
        </div>
        <div class="stat-grid">
          <div class="stat">Total Chickens: <b>${report?.totalChickens || 0}</b></div>
          <div class="stat">Total Weight: <b>${report?.totalWeight || 0} kg</b></div>
          <div class="stat">Total Bills: <b>₹${report?.totalBills || 0}</b></div>
          <div class="stat">Total Payments: <b>₹${report?.totalPayments || 0}</b></div>
          <div class="stat">Previous Balance: <b>₹${report?.previousBalance || 0}</b></div>
          <div class="stat">Pending Balance: <b>₹${report?.pendingBalance || 0}</b></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Bill No</th>
              <th>Chickens</th>
              <th>Weight</th>
              <th>Paper Rate</th>
              <th>Final Rate</th>
              <th>Total Bill (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(report?.dailyBreakdown || [])
              .map(
                (d) => `
              <tr>
                <td>${String(d.supply_date).slice(0, 10)}</td>
                <td>${d.bill_number}</td>
                <td>${d.chickens}</td>
                <td>${d.weight} kg</td>
                <td>₹${d.paper_rate}</td>
                <td>₹${d.final_rate}</td>
                <td>₹${d.total_bill}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Weekly_Report_${startDate}_${endDate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-view-container">
      <div className="section-title-wrap flex-between">
        <div>
          <span className="welcome-eyebrow">AUDIT & SUMMARY</span>
          <h2>Weekly Reports (Monday to Sunday)</h2>
          <p>Consolidated chicken quantity, weight, billing, payments, and balances.</p>
        </div>

        {/* Date Filter */}
        <div className="date-filter-row no-print">
          <div>
            <label>From (Monday):</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field-sm"
            />
          </div>
          <div>
            <label>To (Sunday):</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field-sm"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="panel report-actions-bar no-print">
        <button className="btn-action-modal print-btn" onClick={handlePrint}>
          <Printer size={16} /> Print Report
        </button>
        <button className="btn-action-modal download-btn" onClick={handleDownloadHTML}>
          <Download size={16} /> Download Report
        </button>
        <button className="btn-action-modal whatsapp-btn" onClick={handleShareWhatsApp}>
          <Share2 size={16} /> WhatsApp Share
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="printable-area">
        {/* Printable Header */}
        <div className="print-only-header">
          <h1>SRI KANAKA DURGA CHICKEN CENTER</h1>
          <p>Wholesale Chicken Supply & Billing Summary for <b>Novel Hotel</b></p>
          <p>Period: {startDate} to {endDate} (Monday to Sunday)</p>
        </div>

        {/* 6 Report Metric Cards */}
        <div className="stat-cards-grid grid-3">
          <div className="stat-card border-blue">
            <span className="stat-title">Total Chickens</span>
            <div className="stat-val">{report?.totalChickens || 0}</div>
            <div className="stat-sub">Quantity delivered in period</div>
          </div>
          <div className="stat-card border-blue">
            <span className="stat-title">Total Weight</span>
            <div className="stat-val">{Number(report?.totalWeight || 0).toFixed(2)} kg</div>
            <div className="stat-sub">Total supply weight</div>
          </div>
          <div className="stat-card border-amber">
            <span className="stat-title">Total Bills</span>
            <div className="stat-val">₹{Number(report?.totalBills || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="stat-sub">Billed after ₹60/kg deduction</div>
          </div>
          <div className="stat-card border-green">
            <span className="stat-title">Total Payments</span>
            <div className="stat-val">₹{Number(report?.totalPayments || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="stat-sub">Payments cleared this week</div>
          </div>
          <div className="stat-card border-amber">
            <span className="stat-title">Previous Balance</span>
            <div className="stat-val">₹{Number(report?.previousBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="stat-sub">Balance before this period</div>
          </div>
          <div className="stat-card border-red">
            <span className="stat-title">Pending Balance</span>
            <div className="stat-val">₹{Number(report?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            <div className="stat-sub">Net closing balance due</div>
          </div>
        </div>

        {/* Day-by-Day Table */}
        <div className="panel table-panel">
          <div className="panel-header">
            <h3>Itemized Daily Supplies for Week</h3>
            <span className="history-count">{report?.dailyBreakdown?.length || 0} Days</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill No</th>
                  <th>Chickens</th>
                  <th>Weight</th>
                  <th>Paper Rate</th>
                  <th>Deduction</th>
                  <th>Final Rate</th>
                  <th>Total Bill</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="empty-text">Loading report data...</td>
                  </tr>
                ) : report?.dailyBreakdown?.length > 0 ? (
                  report.dailyBreakdown.map((row) => (
                    <tr key={row.id}>
                      <td>{String(row.supply_date).slice(0, 10)}</td>
                      <td><b>{row.bill_number}</b></td>
                      <td>{row.chickens}</td>
                      <td>{Number(row.weight).toFixed(2)} kg</td>
                      <td>₹{Number(row.paper_rate).toFixed(2)}</td>
                      <td className="text-danger">-₹{Number(row.deduction).toFixed(2)}</td>
                      <td><b className="text-primary">₹{Number(row.final_rate).toFixed(2)}</b></td>
                      <td><b>₹{Number(row.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</b></td>
                      <td>
                        <span className={`status-pill ${row.payment_status?.toLowerCase() || "pending"}`}>
                          {row.payment_status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-text">No chicken supplies recorded in this week range.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 9. WHATSAPP SHARING VIEW
// =========================================================================
function WhatsAppShareView({ token }) {
  const [bills, setBills] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState("");
  const [balanceData, setBalanceData] = useState(null);
  const [customNotes, setCustomNotes] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/supplies`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setBills(res);
          setSelectedBillId(res[0].id);
        }
      });

    fetch(`${API}/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setBalanceData);
  }, [token]);

  const activeBill = useMemo(() => {
    return bills.find((b) => String(b.id) === String(selectedBillId)) || bills[0];
  }, [bills, selectedBillId]);

  // Generate required exact WhatsApp message format
  const messageText = useMemo(() => {
    if (!activeBill) return "No bill selected.";

    return `Chicken Supply Report
Date: ${String(activeBill.supply_date).slice(0, 10)}
Quantity: ${activeBill.chickens} Chickens
Weight: ${Number(activeBill.weight).toFixed(2)} kg
Paper Rate: ₹${Number(activeBill.paper_rate).toFixed(2)}/kg
Deduction ₹60/kg
Final Rate: ₹${Number(activeBill.final_rate).toFixed(2)}/kg
Total Bill: ₹${Number(activeBill.total_bill).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Payment: ₹${Number(balanceData?.totalPaid || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Previous Balance: ₹${Number(balanceData?.previousBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
Pending Balance: ₹${Number(balanceData?.pendingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
${customNotes ? `Note: ${customNotes}\n` : ""}
Sri Kanaka Durga Chicken Center
Supplying to Novel Hotel`;
  }, [activeBill, balanceData, customNotes]);

  const handleSendToWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="whatsapp-view-container">
      <div className="section-title-wrap">
        <div>
          <span className="welcome-eyebrow">INSTANT MESSAGING</span>
          <h2>WhatsApp Report Sharing</h2>
          <p>Format and dispatch standardized chicken supply statements directly to Novel Hotel.</p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Controls */}
        <div className="panel form-panel">
          <h3>Select Supply Bill</h3>
          <div className="form-group">
            <label>Choose Bill / Date</label>
            <select
              value={selectedBillId}
              onChange={(e) => setSelectedBillId(e.target.value)}
              className="input-field"
            >
              {bills.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bill_number} — {String(b.supply_date).slice(0, 10)} ({b.weight} kg, ₹{b.total_bill})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Additional Message Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Delivered by driver Suresh"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="whatsapp-actions-group">
            <button className="btn-primary-lg whatsapp-btn" onClick={handleSendToWhatsApp}>
              <Share2 size={18} />
              <span>Share on WhatsApp (Desktop / Mobile)</span>
            </button>
            <button className="btn-secondary-lg" onClick={handleCopy}>
              <span>{copied ? "✓ Copied to Clipboard!" : "Copy Formatted Text"}</span>
            </button>
          </div>
        </div>

        {/* Message Preview */}
        <div className="panel preview-panel">
          <div className="preview-top-bar">
            <span>WhatsApp Message Preview</span>
            <span className="preview-client-tag">Novel Hotel</span>
          </div>

          <div className="whatsapp-bubble">
            <pre className="bubble-text">{messageText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
