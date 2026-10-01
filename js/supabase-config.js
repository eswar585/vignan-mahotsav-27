/**
 * MAHOTSAV 2027 — SUPABASE CONFIGURATION
 * Provide your Supabase project URL and Public Anon Key below.
 * Found in: Supabase Dashboard -> Project Settings -> API
 */

const SUPABASE_CONFIG = {
    // 1. Supabase Project URL (e.g. "https://abcdefghijklmnopqrst.supabase.co")
    url: "PASTE_SUPABASE_PROJECT_URL_HERE",

    // 2. Supabase Anon Public Key (e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    // NEVER put your service_role secret key here!
    anonKey: "PASTE_SUPABASE_ANON_KEY_HERE"
};

/**
 * Checks if real Supabase credentials have been configured
 */
function isSupabaseConfigured() {
    return Boolean(
        SUPABASE_CONFIG.url &&
        SUPABASE_CONFIG.anonKey &&
        !SUPABASE_CONFIG.url.includes("PASTE_") &&
        !SUPABASE_CONFIG.anonKey.includes("PASTE_") &&
        SUPABASE_CONFIG.url.startsWith("https://")
    );
}

// Export to global window
if (typeof window !== "undefined") {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.isSupabaseConfigured = isSupabaseConfigured;
}
