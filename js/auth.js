/**
 * MAHOTSAV 2027 — AUTHENTICATION & ROUTE GUARDS
 */

const AuthGuard = {
    // Requires authenticated session
    requireAuth(allowedRoles = ["participant", "admin"]) {
        const user = MahotsavService.getCurrentUser();
        if (!user) {
            sessionStorage.setItem("mahotsav_redirect_after_login", window.location.pathname);
            window.location.href = "login.html";
            return null;
        }

        if (!allowedRoles.includes(user.role)) {
            alert("Access restricted. You do not have permissions to view this page.");
            window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
            return null;
        }

        if (user.role === "participant" && user.status !== "approved") {
            window.location.href = "status.html";
            return null;
        }

        return user;
    },

    // Strict admin guard for admin.html
    requireAdmin() {
        const user = MahotsavService.getCurrentUser();
        if (!user || user.role !== "admin") {
            // Check if on admin.html, redirect to login
            const currentPage = window.location.pathname.split("/").pop();
            if (currentPage === "admin.html") {
                sessionStorage.setItem("mahotsav_redirect_after_login", "admin.html");
                window.location.href = "login.html?error=admin_required";
                return null;
            }
        }
        return user;
    },

    // Update navigation bar dynamically based on authentication state
    renderNavAuth() {
        const user = MahotsavService.getCurrentUser();
        const navAuthContainer = document.getElementById("nav-auth-container");
        if (!navAuthContainer) return;

        if (user) {
            if (user.role === "admin") {
                navAuthContainer.innerHTML = `
                    <div class="user-nav-badge">
                        <span class="badge-role admin">ADMIN</span>
                        <a href="admin.html" class="btn btn-outline-gold btn-sm"><i class="icon-dashboard"></i> Admin Panel</a>
                        <button onclick="MahotsavService.logout()" class="btn btn-ghost btn-sm" title="Log out">Logout</button>
                    </div>
                `;
            } else {
                navAuthContainer.innerHTML = `
                    <div class="user-nav-badge">
                        <a href="dashboard.html" class="nav-user-pill">
                            <span class="user-avatar-mini">${user.name.charAt(0)}</span>
                            <div class="user-nav-meta">
                                <span class="nav-user-name">${user.name.split(" ")[0]}</span>
                                <span class="nav-user-mhid">${user.mhid || "Pending"}</span>
                            </div>
                        </a>
                        <a href="id-card.html" class="btn btn-outline-gold btn-sm" title="View Digital ID Card"><i class="icon-card"></i> ID Card</a>
                        <button onclick="MahotsavService.logout()" class="btn btn-ghost btn-sm" title="Log out">Logout</button>
                    </div>
                `;
            }
        } else {
            navAuthContainer.innerHTML = `
                <a href="login.html" class="btn btn-ghost btn-sm">Login</a>
                <a href="register.html" class="btn btn-gold btn-sm pulse-glow">Register Now</a>
            `;
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    AuthGuard.renderNavAuth();
});

if (typeof window !== "undefined") {
    window.AuthGuard = AuthGuard;
}
