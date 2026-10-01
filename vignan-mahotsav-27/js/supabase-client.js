/**
 * MAHOTSAV 2027 — UNIFIED DATA & AUTH SERVICE LAYER
 * Integrates directly with Supabase JS SDK.
 * Includes local relational storage layer that enforces exact DB constraints
 * (unique email, unique phone, unique college ID, unique UTR, unique event registration)
 * so the application is fully interactive and functional both with live Supabase and out of the box.
 */

class MahotsavDataService {
    constructor() {
        this.client = null;
        this.isLive = false;
        this.STORAGE_KEY = "mahotsav_live_db_v1";
        this.SESSION_KEY = "mahotsav_active_session";
        if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
            localStorage.removeItem("mahotsav_local_db_v1");
        }
        this.init();
    }

    init() {
        if (typeof isSupabaseConfigured === "function" && isSupabaseConfigured() && window.supabase) {
            try {
                this.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    }
                });
                this.isLive = true;
                console.log("⚡ Supabase Client initialized successfully in LIVE mode.");
            } catch (err) {
                console.warn("Failed to initialize live Supabase client, using storage fallback:", err);
                this.isLive = false;
            }
        } else {
            console.log("ℹ️ Supabase credentials not set or placeholder detected. Operating in local compliant mode with DB constraints.");
            this.isLive = false;
        }

        // Initialize local relational schema if not already initialized
        this.ensureLocalSchema();
    }

    // =========================================================================
    // LOCAL DATA LAYER (Enforces exact DB constraints & MHID generator)
    // =========================================================================
    ensureLocalSchema() {
        if (typeof window === "undefined") return;
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            const initialDB = {
                seq: 1,
                profiles: [
                    {
                        id: "00000000-0000-4000-8000-000000000001",
                        name: "Mahotsav Administrator",
                        dob: "1995-01-01",
                        college_name: "Vignan's University",
                        phone: "9032080405",
                        email: "eswaravuthu04@gmail.com",
                        studying_year: "Faculty",
                        course: "Administration",
                        college_id: "VIGNAN-ADMIN-01",
                        category: "Culturals",
                        mhid: "MH270000",
                        role: "admin",
                        status: "approved",
                        password_hash: "vumh2704",
                        created_at: new Date().toISOString()
                    }
                ],
                payments: [],
                events: [
                    {
                        id: "evt-01",
                        title: "Natya Mayuri (Solo Classical Dance)",
                        category: "Performing Arts",
                        description: "Express the divine grace of Bharatanatyam, Kuchipudi, Kathak, or Mohiniyattam in this premier solo classical dance competition.",
                        poster_url: "details.jpeg",
                        rules: "Time limit: 8-10 minutes. Recorded audio track or live accompanists allowed. Judging on bhava, thala, and costume.",
                        venue: "NTR Vignan Vihar Auditorium",
                        event_date: "2027-02-11",
                        event_time: "10:00 AM",
                        prize_money: "₹ 35,000",
                        min_team_size: 1,
                        max_team_size: 1,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-02",
                        title: "Step Up (Western Group Dance)",
                        category: "Performing Arts",
                        description: "The most anticipated high-octane hip-hop, contemporary, and fusion crew showdown at Mahotsav.",
                        poster_url: "background.jpeg",
                        rules: "Team size: 8-20 members. Time limit: 8-12 minutes. Dangerous props and fire strictly prohibited.",
                        venue: "Open Air Theatre (OAT)",
                        event_date: "2027-02-11",
                        event_time: "06:00 PM",
                        prize_money: "₹ 75,000",
                        min_team_size: 8,
                        max_team_size: 20,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-03",
                        title: "War of Bands (Live Rock & Fusion)",
                        category: "Performing Arts",
                        description: "Plug in the amps, hit the drums, and electrify the crowd in the ultimate collegiate battle of the bands.",
                        poster_url: "details.jpeg",
                        rules: "Time limit: 20 minutes (including setup). Original compositions awarded bonus points. Standard drum kit provided.",
                        venue: "Open Air Theatre (OAT)",
                        event_date: "2027-02-12",
                        event_time: "05:30 PM",
                        prize_money: "₹ 60,000",
                        min_team_size: 3,
                        max_team_size: 8,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-04",
                        title: "RoboWars: Iron Clash",
                        category: "Robo Games",
                        description: "Heavyweight remote-controlled combat robots battling inside an armored safety arena till knockout.",
                        poster_url: "background.jpeg",
                        rules: "Max weight: 30kg. Wired or wireless control. Pneumatic flippers and spinning weapons permitted per safety manual.",
                        venue: "Robotics & Innovation Pavilion",
                        event_date: "2027-02-12",
                        event_time: "10:00 AM",
                        prize_money: "₹ 50,000",
                        min_team_size: 2,
                        max_team_size: 5,
                        eligibility: "Engineering & Tech students",
                        published: true
                    },
                    {
                        id: "evt-05",
                        title: "Valorant Apex Cup",
                        category: "Gaming & Multimedia",
                        description: "5v5 tactical tournament on LAN server. Prove your aim, strategy, and utility execution to take the championship.",
                        poster_url: "details.jpeg",
                        rules: "Tournament format: Single elimination BO1, Finals BO3. Bring your own peripherals or use tournament gear.",
                        venue: "Multimedia & Esports Arena",
                        event_date: "2027-02-11",
                        event_time: "11:00 AM",
                        prize_money: "₹ 40,000",
                        min_team_size: 5,
                        max_team_size: 6,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-06",
                        title: "Canvas Chronicles (Live Art & Charcoal)",
                        category: "Visual Arts",
                        description: "Create breathtaking original visual art on the spot under the theme announced at the commencement.",
                        poster_url: "background.jpeg",
                        rules: "Time limit: 3 hours. Standard A2 sheet provided. Bring your own drawing mediums and colors.",
                        venue: "Central Library Portico",
                        event_date: "2027-02-11",
                        event_time: "09:30 AM",
                        prize_money: "₹ 25,000",
                        min_team_size: 1,
                        max_team_size: 1,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-07",
                        title: "National Youth Parliament & Debate",
                        category: "Literary",
                        description: "Debate burning national and geopolitical motions in a parliamentary committee simulation.",
                        poster_url: "details.jpeg",
                        rules: "Strict parliamentary decorum. 2 rounds: Opening speech and rebuttal. English / Telugu / Hindi permitted.",
                        venue: "Conference Hall 1",
                        event_date: "2027-02-12",
                        event_time: "10:30 AM",
                        prize_money: "₹ 30,000",
                        min_team_size: 1,
                        max_team_size: 2,
                        eligibility: "College students with valid ID",
                        published: true
                    },
                    {
                        id: "evt-08",
                        title: "Sprint Kings & Queens (100m & Relay)",
                        category: "Track & Field",
                        description: "Fastest sprinters in collegiate athletics battle on the synthetic track for gold and glory.",
                        poster_url: "background.jpeg",
                        rules: "IAAF rules apply. Spikes mandatory. False start rule strictly enforced.",
                        venue: "Olympic Standard Athletic Track",
                        event_date: "2027-02-11",
                        event_time: "08:30 AM",
                        prize_money: "₹ 45,000",
                        min_team_size: 1,
                        max_team_size: 4,
                        eligibility: "Bona fide college sports athletes",
                        published: true
                    },
                    {
                        id: "evt-09",
                        title: "Mahotsav Basketball Championship",
                        category: "Sports & Games",
                        description: "Fast-paced, full-court collegiate basketball tournament with top university teams competing.",
                        poster_url: "details.jpeg",
                        rules: "FIBA rules apply. 4 quarters of 10 minutes. Knockout bracket.",
                        venue: "Sangamam Indoor Sports Complex",
                        event_date: "2027-02-12",
                        event_time: "09:00 AM",
                        prize_money: "₹ 50,000",
                        min_team_size: 5,
                        max_team_size: 12,
                        eligibility: "College sports teams",
                        published: true
                    },
                    {
                        id: "evt-10",
                        title: "Para Athletics & Boccia Championship",
                        category: "Para Sports",
                        description: "Inclusive celebration of extraordinary athleticism featuring wheelchair racing and boccia.",
                        poster_url: "background.jpeg",
                        rules: "Standard Paralympic classification applies. Medical assistance and specialized equipment available.",
                        venue: "Sangamam Indoor Sports Complex",
                        event_date: "2027-02-13",
                        event_time: "10:00 AM",
                        prize_money: "₹ 40,000",
                        min_team_size: 1,
                        max_team_size: 2,
                        eligibility: "Differently-abled student athletes",
                        published: true
                    }
                ],
                event_registrations: [],
                venues: [
                    {
                        id: "ven-01",
                        name: "Open Air Theatre (OAT)",
                        location: "Vignan Central Quadrangle",
                        description: "Main stage for headlining concerts, battle of bands, celebrity nites, and inaugural ceremony with 15,000+ capacity.",
                        date: "11-13 Feb 2027",
                        time: "05:00 PM onwards",
                        map_url: "https://maps.google.com/?q=Vignan+University+Vadlamudi"
                    },
                    {
                        id: "ven-02",
                        name: "NTR Vignan Vihar Auditorium",
                        location: "Main Administrative Block, 2nd Floor",
                        description: "Air-conditioned acoustic auditorium for classical dance, vocal concerts, dramatics, and literary declamations.",
                        date: "11-13 Feb 2027",
                        time: "09:30 AM - 04:30 PM",
                        map_url: "https://maps.google.com/?q=Vignan+University+Vadlamudi"
                    },
                    {
                        id: "ven-03",
                        name: "Sangamam Indoor Sports Complex",
                        location: "Sports Enclave, South Campus",
                        description: "World-class wooden courts for badminton, table tennis, para-sports, and indoor championships.",
                        date: "11-13 Feb 2027",
                        time: "08:00 AM - 06:00 PM",
                        map_url: "https://maps.google.com/?q=Vignan+University+Vadlamudi"
                    },
                    {
                        id: "ven-04",
                        name: "Olympic Standard Athletic Track",
                        location: "University Main Stadium Ground",
                        description: "400m synthetic athletic track, football field, and field events arena.",
                        date: "11-13 Feb 2027",
                        time: "07:30 AM - 05:30 PM",
                        map_url: "https://maps.google.com/?q=Vignan+University+Vadlamudi"
                    }
                ],
                previous_year_videos: {
                    day1: "PASTE_DAY_1_YOUTUBE_LINK_HERE",
                    day2: "PASTE_DAY_2_YOUTUBE_LINK_HERE",
                    day3: "PASTE_DAY_3_YOUTUBE_LINK_HERE"
                },
                site_settings: {
                    qrImage: "PASTE_PAYMENT_QR_IMAGE_HERE",
                    upiMobile: "PASTE_PAYMENT_UPI_MOBILE_NUMBER_HERE",
                    registrationFee: "PASTE_REGISTRATION_FEE_HERE",
                    hero_tagline: "The Arc of Becoming",
                    announcement: "Registrations are live! ₹20,00,000 cash prizes across 90+ events."
                },
                notifications: [
                    {
                        id: "notif-01",
                        participant_id: null,
                        title: "Welcome to Mahotsav 2027!",
                        message: "The 20th edition of Vignan Mahotsav is officially live. Explore 90+ events and win cash prizes worth ₹20 Lakhs.",
                        type: "success",
                        read: false,
                        created_at: new Date().toISOString()
                    }
                ],
                admin_actions: []
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialDB));
        }
    }

    getLocalDB() {
        this.ensureLocalSchema();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "{}");
    }

    saveLocalDB(db) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    }

    generateMHID(db) {
        db.seq = (db.seq || 1) + 1;
        const numStr = String(db.seq).padStart(4, "0");
        return `MH27${numStr}`;
    }

    // =========================================================================
    // PARTICIPANT REGISTRATION (STEP 1)
    // Enforces unique email, phone, college ID
    // =========================================================================
    async registerParticipant(data) {
        const { name, dob, college_name, phone, email, studying_year, course, college_id, category, password } = data;

        // Clean & format
        const cleanEmail = email.trim().toLowerCase();
        const cleanPhone = phone.trim().replace(/\D/g, "");
        const cleanCollegeId = college_id.trim().toUpperCase();

        if (this.isLive) {
            // Live Supabase
            // 1. Create auth user
            const { data: authData, error: authError } = await this.client.auth.signUp({
                email: cleanEmail,
                password: password || "Mahotsav@2027",
                options: {
                    data: { name, phone: cleanPhone, college_id: cleanCollegeId }
                }
            });

            if (authError) {
                if (authError.message.includes("already registered") || authError.message.includes("User already registered")) {
                    throw new Error("An account with this email address already exists. Please login or check your status.");
                }
                throw authError;
            }

            // 2. Insert profile record
            const { data: profile, error: profError } = await this.client
                .from("profiles")
                .insert([
                    {
                        auth_user_id: authData?.user?.id || null,
                        name: name.trim(),
                        dob,
                        college_name: college_name.trim(),
                        phone: cleanPhone,
                        email: cleanEmail,
                        studying_year,
                        course: course.trim(),
                        college_id: cleanCollegeId,
                        category: category || "Culturals",
                        role: "participant",
                        status: "pending"
                    }
                ])
                .select()
                .single();

            if (profError) {
                // Check unique constraint violations
                if (profError.code === "23505" || profError.message?.includes("duplicate key")) {
                    if (profError.message.includes("phone")) {
                        throw new Error("An account with this phone number already exists.");
                    } else if (profError.message.includes("college_id")) {
                        throw new Error("An account with this College ID Number already exists.");
                    } else {
                        throw new Error("An account with this email or phone number already exists.");
                    }
                }
                throw profError;
            }

            return profile;
        }

        // Local Relational Fallback (Enforces identical DB uniqueness constraints)
        const db = this.getLocalDB();
        
        // Constraint: Email unique
        if (db.profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
            throw new Error("An account with this email address already exists. Please log in or check your registration status.");
        }

        // Constraint: Phone unique
        if (db.profiles.some(p => p.phone === cleanPhone)) {
            throw new Error("An account with this phone number already exists.");
        }

        // Constraint: College ID unique
        if (db.profiles.some(p => p.college_id.toUpperCase() === cleanCollegeId)) {
            throw new Error("An account with this College ID Number already exists.");
        }

        const newProfile = {
            id: "prof-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
            auth_user_id: "auth-" + Date.now(),
            name: name.trim(),
            dob,
            college_name: college_name.trim(),
            phone: cleanPhone,
            email: cleanEmail,
            studying_year,
            course: course.trim(),
            college_id: cleanCollegeId,
            category: category || "Culturals",
            mhid: null, // assigned strictly on approval
            role: "participant",
            status: "pending",
            password_hash: password || "Mahotsav@2027",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        db.profiles.push(newProfile);
        this.saveLocalDB(db);

        // Store active pending session for smooth transition to payment step
        sessionStorage.setItem("mahotsav_pending_reg", JSON.stringify({
            participant_id: newProfile.id,
            name: newProfile.name,
            email: newProfile.email,
            phone: newProfile.phone,
            category: newProfile.category
        }));

        return newProfile;
    }

    // =========================================================================
    // PAYMENT SUBMISSION (STEP 2)
    // Enforces unique UTR number
    // =========================================================================
    async submitPayment(participantId, paymentData) {
        const { amount, category, payment_date, utr_number, receipt_url } = paymentData;
        const cleanUTR = utr_number.trim().toUpperCase();

        if (!cleanUTR || cleanUTR.length < 6) {
            throw new Error("Please enter a valid 12-digit UPI / UTR Transaction Reference Number.");
        }

        if (this.isLive) {
            const { data, error } = await this.client
                .from("payments")
                .insert([
                    {
                        participant_id: participantId,
                        amount: Number(amount),
                        category,
                        payment_date,
                        utr_number: cleanUTR,
                        receipt_url: receipt_url || null,
                        payment_status: "submitted"
                    }
                ])
                .select()
                .single();

            if (error) {
                if (error.code === "23505" || error.message?.includes("duplicate key")) {
                    throw new Error("This UTR / Transaction Reference Number has already been submitted. Duplicate submissions are not permitted.");
                }
                throw error;
            }
            return data;
        }

        // Local Relational Fallback
        const db = this.getLocalDB();

        // Constraint: UTR unique
        if (db.payments.some(p => p.utr_number.toUpperCase() === cleanUTR)) {
            throw new Error("This UTR / Transaction Reference Number has already been submitted. Duplicate submissions are not permitted.");
        }

        const newPayment = {
            id: "pay-" + Date.now(),
            participant_id: participantId,
            amount: Number(amount),
            category: category || "Culturals",
            payment_date,
            utr_number: cleanUTR,
            payment_status: "submitted",
            verified_by: null,
            verified_at: null,
            receipt_url: receipt_url || null,
            created_at: new Date().toISOString()
        };

        db.payments.push(newPayment);

        // Add notification
        db.notifications.push({
            id: "notif-" + Date.now(),
            participant_id: participantId,
            title: "Payment Submitted",
            message: `Your payment of ₹${amount} with UTR ${cleanUTR} has been received and is pending admin verification.`,
            type: "info",
            read: false,
            created_at: new Date().toISOString()
        });

        this.saveLocalDB(db);
        return newPayment;
    }

    // =========================================================================
    // REGISTRATION STATUS LOOKUP
    // Search by Email, Phone, College ID, or MHID
    // =========================================================================
    async getParticipantStatus(identifier) {
        const query = identifier.trim().toLowerCase();
        const queryRaw = identifier.trim();

        if (this.isLive) {
            const { data: profile, error } = await this.client
                .from("profiles")
                .select("*, payments(*)")
                .or(`email.ilike.${query},phone.eq.${queryRaw},college_id.ilike.${queryRaw},mhid.ilike.${queryRaw}`)
                .maybeSingle();

            if (error) throw error;
            return profile;
        }

        const db = this.getLocalDB();
        const profile = db.profiles.find(p => 
            p.email.toLowerCase() === query ||
            p.phone === queryRaw ||
            p.college_id.toLowerCase() === query ||
            (p.mhid && p.mhid.toLowerCase() === query)
        );

        if (!profile) return null;

        const payment = db.payments.find(pay => pay.participant_id === profile.id);
        return {
            ...profile,
            payments: payment ? [payment] : []
        };
    }

    // =========================================================================
    // AUTHENTICATION (SUPABASE AUTH & SESSION MANAGEMENT)
    // =========================================================================
    async login(loginIdentifier, password) {
        const query = loginIdentifier.trim().toLowerCase();
        const queryRaw = loginIdentifier.trim();

        if (this.isLive) {
            let emailToUse = query;
            // If user typed MHID instead of email, resolve email first
            if (queryRaw.toUpperCase().startsWith("MH27")) {
                const { data: prof } = await this.client
                    .from("profiles")
                    .select("email")
                    .eq("mhid", queryRaw.toUpperCase())
                    .maybeSingle();
                if (prof && prof.email) {
                    emailToUse = prof.email;
                }
            }

            const { data, error } = await this.client.auth.signInWithPassword({
                email: emailToUse,
                password: password
            });

            if (error) throw error;

            // Fetch profile
            const { data: profile, error: profErr } = await this.client
                .from("profiles")
                .select("*")
                .eq("auth_user_id", data.user.id)
                .single();

            if (profErr) throw profErr;

            this.setActiveSession(profile);
            return { user: data.user, profile };
        }

        // Local Authentication
        const db = this.getLocalDB();
        const profile = db.profiles.find(p => 
            (p.email.toLowerCase() === query || (p.mhid && p.mhid.toUpperCase() === queryRaw.toUpperCase())) &&
            (p.password_hash === password)
        );

        if (!profile) {
            throw new Error("Invalid credentials. Please verify your Email/MHID and password.");
        }

        if (profile.role === "participant" && profile.status !== "approved") {
            throw new Error(`Your account status is currently: ${profile.status.toUpperCase()}. Only approved participants can access the participant dashboard. Check your status page.`);
        }

        this.setActiveSession(profile);
        return { user: { id: profile.id, email: profile.email }, profile };
    }

    setActiveSession(profile) {
        const sessionData = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            mhid: profile.mhid,
            role: profile.role,
            status: profile.status,
            college_name: profile.college_name,
            course: profile.course,
            studying_year: profile.studying_year,
            college_id: profile.college_id,
            category: profile.category,
            loginTime: Date.now()
        };
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    }

    getCurrentUser() {
        const sess = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
        return sess ? JSON.parse(sess) : null;
    }

    logout() {
        if (this.isLive && this.client) {
            this.client.auth.signOut().catch(console.warn);
        }
        sessionStorage.removeItem(this.SESSION_KEY);
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = "login.html";
    }

    // =========================================================================
    // ADMIN ACTIONS (APPROVE, DECLINE, VERIFY PAYMENTS)
    // =========================================================================
    async getAllParticipants() {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("profiles")
                .select("*, payments(*), event_registrations(*)")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        }

        const db = this.getLocalDB();
        return db.profiles.map(p => {
            const payment = db.payments.find(pay => pay.participant_id === p.id);
            const events = db.event_registrations.filter(er => er.participant_id === p.id);
            return {
                ...p,
                payments: payment ? [payment] : [],
                event_registrations: events
            };
        });
    }

    async approveParticipant(participantId, adminId) {
        if (this.isLive) {
            // Note: Postgres trigger assign_mhid_on_approval will auto-generate MHID on status 'approved'!
            const { data, error } = await this.client
                .from("profiles")
                .update({
                    status: "approved",
                    updated_at: new Date().toISOString()
                })
                .eq("id", participantId)
                .select()
                .single();

            if (error) throw error;

            // Also mark payment as verified if pending
            await this.client
                .from("payments")
                .update({
                    payment_status: "verified",
                    verified_by: adminId || null,
                    verified_at: new Date().toISOString()
                })
                .eq("participant_id", participantId);

            return data;
        }

        // Local Relational
        const db = this.getLocalDB();
        const prof = db.profiles.find(p => p.id === participantId);
        if (!prof) throw new Error("Participant not found");

        prof.status = "approved";
        if (!prof.mhid) {
            prof.mhid = this.generateMHID(db);
        }
        prof.updated_at = new Date().toISOString();

        // Auto verify payment
        const pay = db.payments.find(p => p.participant_id === participantId);
        if (pay) {
            pay.payment_status = "verified";
            pay.verified_by = adminId || "admin";
            pay.verified_at = new Date().toISOString();
        }

        // Add Notification & simulated email log
        db.notifications.push({
            id: "notif-" + Date.now(),
            participant_id: participantId,
            title: "Registration Approved! 🎉",
            message: `Congratulations! Your Mahotsav 2027 registration is approved. Your unique ID is ${prof.mhid}. You can now download your digital ID card and register for events.`,
            type: "success",
            read: false,
            created_at: new Date().toISOString()
        });

        db.admin_actions.push({
            id: "act-" + Date.now(),
            admin_id: adminId || "admin",
            action: "APPROVE_PARTICIPANT",
            target_id: participantId,
            details: `Approved participant ${prof.name} (${prof.mhid})`,
            created_at: new Date().toISOString()
        });

        this.saveLocalDB(db);
        return prof;
    }

    async declineParticipant(participantId, reason, adminId) {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("profiles")
                .update({
                    status: "declined",
                    decline_reason: reason,
                    updated_at: new Date().toISOString()
                })
                .eq("id", participantId)
                .select()
                .single();
            if (error) throw error;
            return data;
        }

        const db = this.getLocalDB();
        const prof = db.profiles.find(p => p.id === participantId);
        if (!prof) throw new Error("Participant not found");

        prof.status = "declined";
        prof.decline_reason = reason || "Documentation or payment verification failed.";
        prof.updated_at = new Date().toISOString();

        db.notifications.push({
            id: "notif-" + Date.now(),
            participant_id: participantId,
            title: "Registration Update",
            message: `Your registration was declined. Reason: ${prof.decline_reason}. Contact mahotsav@vignan.ac.in for assistance.`,
            type: "urgent",
            read: false,
            created_at: new Date().toISOString()
        });

        this.saveLocalDB(db);
        return prof;
    }

    // =========================================================================
    // EVENTS MANAGEMENT & REGISTRATION
    // =========================================================================
    async getAllEvents() {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("events")
                .select("*")
                .order("event_date", { ascending: true });
            if (error) throw error;
            return data;
        }
        const db = this.getLocalDB();
        return db.events;
    }

    async registerForEvent(eventId, participantId, teamData = {}) {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("event_registrations")
                .insert([
                    {
                        event_id: eventId,
                        participant_id: participantId,
                        team_name: teamData.teamName || null,
                        team_members: teamData.teamMembers || null,
                        status: "confirmed"
                    }
                ])
                .select()
                .single();

            if (error) {
                if (error.code === "23505") {
                    throw new Error("You have already registered for this event!");
                }
                throw error;
            }
            return data;
        }

        const db = this.getLocalDB();
        // Check uniqueness constraint
        const exists = db.event_registrations.some(er => er.event_id === eventId && er.participant_id === participantId);
        if (exists) {
            throw new Error("You have already registered for this event!");
        }

        const newReg = {
            id: "ereg-" + Date.now(),
            event_id: eventId,
            participant_id: participantId,
            team_name: teamData.teamName || null,
            team_members: teamData.teamMembers || null,
            status: "confirmed",
            created_at: new Date().toISOString()
        };

        db.event_registrations.push(newReg);

        // Find event title for notification
        const evt = db.events.find(e => e.id === eventId);
        db.notifications.push({
            id: "notif-" + Date.now(),
            participant_id: participantId,
            title: "Event Registration Confirmed!",
            message: `You are registered for ${evt ? evt.title : "Event"}. Venue: ${evt ? evt.venue : "Campus"}.`,
            type: "success",
            read: false,
            created_at: new Date().toISOString()
        });

        this.saveLocalDB(db);
        return newReg;
    }

    async getParticipantEvents(participantId) {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("event_registrations")
                .select("*, events(*)")
                .eq("participant_id", participantId);
            if (error) throw error;
            return data;
        }

        const db = this.getLocalDB();
        const regs = db.event_registrations.filter(er => er.participant_id === participantId);
        return regs.map(r => ({
            ...r,
            events: db.events.find(e => e.id === r.event_id)
        }));
    }

    // =========================================================================
    // VENUES MANAGEMENT
    // =========================================================================
    async getAllVenues() {
        if (this.isLive) {
            const { data, error } = await this.client.from("venues").select("*");
            if (error) throw error;
            return data;
        }
        const db = this.getLocalDB();
        return db.venues;
    }

    async saveVenue(venueData) {
        if (this.isLive) {
            if (venueData.id && !venueData.id.startsWith("ven-")) {
                const { data, error } = await this.client.from("venues").update(venueData).eq("id", venueData.id).select().single();
                if (error) throw error;
                return data;
            } else {
                delete venueData.id;
                const { data, error } = await this.client.from("venues").insert([venueData]).select().single();
                if (error) throw error;
                return data;
            }
        }

        const db = this.getLocalDB();
        if (venueData.id) {
            const idx = db.venues.findIndex(v => v.id === venueData.id);
            if (idx >= 0) db.venues[idx] = { ...db.venues[idx], ...venueData, updated_at: new Date().toISOString() };
        } else {
            venueData.id = "ven-" + Date.now();
            venueData.created_at = new Date().toISOString();
            db.venues.push(venueData);
        }
        this.saveLocalDB(db);
        return venueData;
    }

    // =========================================================================
    // PREVIOUS YEARS VIDEOS
    // =========================================================================
    async getPreviousYearVideos() {
        if (this.isLive) {
            const { data, error } = await this.client.from("previous_year_videos").select("*");
            if (!error && data && data.length > 0) {
                const result = { ...window.previousYearVideos };
                data.forEach(v => { result[v.day] = v.youtube_url; });
                return result;
            }
        }
        const db = this.getLocalDB();
        return db.previous_year_videos || window.previousYearVideos;
    }

    async savePreviousYearVideos(videosObj) {
        if (this.isLive) {
            const upserts = [
                { day: "day1", youtube_url: videosObj.day1, title: "Day 1 Highlights" },
                { day: "day2", youtube_url: videosObj.day2, title: "Day 2 Highlights" },
                { day: "day3", youtube_url: videosObj.day3, title: "Day 3 Highlights" }
            ];
            await this.client.from("previous_year_videos").upsert(upserts, { onConflict: "day" });
        }

        const db = this.getLocalDB();
        db.previous_year_videos = { ...videosObj };
        this.saveLocalDB(db);
        window.previousYearVideos = { ...videosObj };
        return videosObj;
    }

    // =========================================================================
    // PAYMENT SETTINGS
    // =========================================================================
    async getPaymentSettings() {
        if (this.isLive) {
            const { data, error } = await this.client.from("site_settings").select("*");
            if (!error && data) {
                const map = {};
                data.forEach(s => { map[s.setting_key] = s.setting_value; });
                return {
                    qrImage: map.qr_image_url || window.paymentSettings.qrImage,
                    upiMobile: map.upi_mobile || window.paymentSettings.upiMobile,
                    registrationFee: map.fee_culturals || window.paymentSettings.registrationFee
                };
            }
        }
        const db = this.getLocalDB();
        return db.site_settings || window.paymentSettings;
    }

    async savePaymentSettings(settings) {
        if (this.isLive) {
            const updates = [
                { setting_key: "qr_image_url", setting_value: settings.qrImage },
                { setting_key: "upi_mobile", setting_value: settings.upiMobile },
                { setting_key: "fee_culturals", setting_value: settings.registrationFee }
            ];
            await this.client.from("site_settings").upsert(updates, { onConflict: "setting_key" });
        }

        const db = this.getLocalDB();
        db.site_settings = { ...db.site_settings, ...settings };
        this.saveLocalDB(db);
        window.paymentSettings = { ...settings };
        return settings;
    }

    // =========================================================================
    // NOTIFICATIONS
    // =========================================================================
    async getNotifications(participantId) {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("notifications")
                .select("*")
                .or(`participant_id.is.null,participant_id.eq.${participantId}`)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        }

        const db = this.getLocalDB();
        return db.notifications.filter(n => !n.participant_id || n.participant_id === participantId);
    }

    async sendBroadcastNotification(title, message, type = "info") {
        if (this.isLive) {
            const { data, error } = await this.client
                .from("notifications")
                .insert([{ participant_id: null, title, message, type }]);
            if (error) throw error;
            return data;
        }

        const db = this.getLocalDB();
        const notif = {
            id: "notif-" + Date.now(),
            participant_id: null,
            title,
            message,
            type,
            read: false,
            created_at: new Date().toISOString()
        };
        db.notifications.unshift(notif);
        this.saveLocalDB(db);
        return notif;
    }
}

// Global instance
const MahotsavService = new MahotsavDataService();
if (typeof window !== "undefined") {
    window.MahotsavService = MahotsavService;
}
