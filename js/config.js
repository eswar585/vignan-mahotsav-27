/**
 * MAHOTSAV 2027 — CENTRAL CONFIGURATION
 * Vignan's Foundation for Science, Technology & Research (Deemed to be University)
 * 20th Edition | "The Arc of Becoming" | 11-13 Feb 2027
 */

// ============================================================================
// 1. PREVIOUS YEARS YOUTUBE VIDEOS (DAY 1, DAY 2, DAY 3)
// As specified in the requirements, configure your YouTube video links below.
// You can also update these dynamically from the Admin Dashboard!
// ============================================================================
const previousYearVideos = {
    day1: "PASTE_DAY_1_YOUTUBE_LINK_HERE",
    day2: "PASTE_DAY_2_YOUTUBE_LINK_HERE",
    day3: "PASTE_DAY_3_YOUTUBE_LINK_HERE"
};

// ============================================================================
// 2. PAYMENT CONFIGURATION
// Configure your payment QR image, UPI mobile number, and fees below.
// Can also be updated in real-time from the Admin Dashboard!
// ============================================================================
const paymentSettings = {
    qrImage: "PASTE_PAYMENT_QR_IMAGE_HERE",
    upiMobile: "PASTE_PAYMENT_UPI_MOBILE_NUMBER_HERE",
    registrationFee: "PASTE_REGISTRATION_FEE_HERE" // Culturals: 250, Sports Men: 350, Sports Women: 250
};

// ============================================================================
// 3. FESTIVAL METADATA & BRANDING (FROM UPLOADED REFERENCE)
// ============================================================================
const MAHOTSAV_CONFIG = {
    title: "MAHOTSAV",
    edition: "20th Edition",
    festYear: "2027",
    tagline: "The Arc of Becoming",
    subtitle: "A National Level Youth Fest",
    festDatesText: "11-13 Feb 2027",
    countdownTarget: "2027-02-11T09:00:00+05:30",
    cashPrizes: "₹ 20,00,000",
    eventsCount: "90+ Events",
    
    // College Details
    college: {
        name: "Vignan's Foundation for Science, Technology & Research",
        status: "(Deemed to be University) - Estd. u/s 3 of UGC Act 1956",
        accreditations: "NAAC A+ | NIRF 70th Rank | ABET Accredited",
        address: "Vadlamudi, Guntur Dist - 522 213, Andhra Pradesh, India",
        coOrganisers: "VIGNAN's LARA and VIGNAN PHARMACY COLLEGE",
        website: "www.vignan.ac.in",
        festWebsite: "www.vignanmahotsav.in",
        email: "mahotsav@vignan.ac.in",
        logo: "clg.png",
        background: "background.jpeg",
        music: "music.mpeg"
    },

    // Fee structure per poster
    fees: {
        culturals: 250,    // *can participate in any no. of Cultural events
        sportsMen: 350,    // *can participate in one team event & any no. of individual sport events
        sportsWomen: 250   // *can participate in one team event & any no. of individual sport events
    },

    // Conveners & Contacts per uploaded poster
    conveners: {
        chiefConvener: { name: "Dr. M.S.S. Rukmini", designation: "Chief Convener" },
        convener: { name: "Dr. M. Ramesh Naidu", designation: "Convener" },
        facultyConveners: [
            { name: "K. Bhavishya", phone: "90320 80405" },
            { name: "P. Sai Chand", phone: "62815 11563" }
        ],
        studentConveners: [
            { name: "Mahija Sindri", phone: "80742 75627" },
            { name: "P. Sri Vatsav", phone: "94419 34549" },
            { name: "M. Ojaswi", phone: "94182 34545" },
            { name: "D. Harshith", phone: "80191 71205" }
        ]
    }
};

// Export to global scope
if (typeof window !== "undefined") {
    window.previousYearVideos = previousYearVideos;
    window.paymentSettings = paymentSettings;
    window.MAHOTSAV_CONFIG = MAHOTSAV_CONFIG;
}
