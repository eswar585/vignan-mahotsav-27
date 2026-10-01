-- ============================================================================
-- MAHOTSAV 2027 — PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (SUPABASE)
-- Vignan's Foundation for Science, Technology & Research (Deemed to be University)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects if recreating (clean slate)
DROP TRIGGER IF EXISTS trg_assign_mhid ON profiles;
DROP FUNCTION IF EXISTS assign_mhid_on_approval();
DROP SEQUENCE IF EXISTS mhid_seq;

-- 1. MHID GENERATION SEQUENCE
-- Generates MH270001, MH270002, etc. Format: MH27 + 4+ digit zero-padded sequence
CREATE SEQUENCE mhid_seq START WITH 1 INCREMENT BY 1;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- References auth.users(id) when signed up via Supabase Auth
    name TEXT NOT NULL,
    dob DATE NOT NULL,
    college_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    studying_year TEXT NOT NULL,
    course TEXT NOT NULL,
    college_id TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'Culturals' CHECK (category IN ('Culturals', 'Sports (Men)', 'Sports (Women)')),
    mhid TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'volunteer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    decline_reason TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    payment_date DATE NOT NULL,
    utr_number TEXT NOT NULL UNIQUE,
    payment_status TEXT NOT NULL DEFAULT 'submitted' CHECK (payment_status IN ('submitted', 'verified', 'rejected')),
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Performing Arts', 'Visual Arts', 'Literary', 'Gaming & Multimedia', 'Robo Games', 'Para Sports', 'Track & Field', 'Sports & Games'
    description TEXT NOT NULL,
    poster_url TEXT,
    rules TEXT,
    venue TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TEXT NOT NULL,
    prize_money TEXT NOT NULL,
    min_team_size INT NOT NULL DEFAULT 1,
    max_team_size INT NOT NULL DEFAULT 1,
    registration_deadline TIMESTAMPTZ,
    eligibility TEXT DEFAULT 'Open to all bonafide college students with valid College ID',
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    team_name TEXT,
    team_members TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_participant_event UNIQUE (event_id, participant_id)
);

-- 6. VENUES TABLE
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    date TEXT,
    time TEXT,
    map_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 7. PREVIOUS YEAR VIDEOS TABLE
CREATE TABLE IF NOT EXISTS previous_year_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day TEXT NOT NULL UNIQUE CHECK (day IN ('day1', 'day2', 'day3')),
    youtube_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL means broadcast to all participants
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'urgent')),
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. ADMIN ACTIONS AUDIT LOG
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- AUTOMATED MHID ASSIGNMENT TRIGGER & FUNCTION
-- When participant status changes to 'approved', automatically assign unique MHID
-- ============================================================================
CREATE OR REPLACE FUNCTION assign_mhid_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved' OR NEW.mhid IS NULL) THEN
        NEW.mhid := 'MH27' || LPAD(nextval('mhid_seq')::TEXT, 4, '0');
    END IF;
    NEW.updated_at := TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_mhid
    BEFORE INSERT OR UPDATE OF status, mhid ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION assign_mhid_on_approval();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_year_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public can view basic info or check status" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Anyone can register (insert pending profile)" ON profiles
    FOR INSERT WITH CHECK (role = 'participant' AND status = 'pending');

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth_user_id = auth.uid() OR is_admin())
    WITH CHECK (
        -- Participants cannot alter their own role, status, or MHID
        (auth_user_id = auth.uid() AND role = OLD.role AND status = OLD.status AND mhid = OLD.mhid)
        OR is_admin()
    );

CREATE POLICY "Admins have full control over profiles" ON profiles
    FOR ALL USING (is_admin());

-- Payments Policies
CREATE POLICY "Participants can view their own payment" ON payments
    FOR SELECT USING (
        participant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR is_admin()
        OR true -- allow checking payment by UTR/status page
    );

CREATE POLICY "Participants can submit payment record" ON payments
    FOR INSERT WITH CHECK (
        payment_status = 'submitted'
    );

CREATE POLICY "Admins can update payments" ON payments
    FOR UPDATE USING (is_admin());

-- Events Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can read published events" ON events
    FOR SELECT USING (published = true OR is_admin());

CREATE POLICY "Admins have full event management" ON events
    FOR ALL USING (is_admin());

-- Event Registrations Policies
CREATE POLICY "Approved participants can register for events" ON event_registrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = participant_id AND status = 'approved'
        )
    );

CREATE POLICY "Participants view their event registrations" ON event_registrations
    FOR SELECT USING (
        participant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins manage event registrations" ON event_registrations
    FOR ALL USING (is_admin());

-- Venues Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can read venues" ON venues
    FOR SELECT USING (true);

CREATE POLICY "Admins manage venues" ON venues
    FOR ALL USING (is_admin());

-- Previous Year Videos Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can read videos" ON previous_year_videos
    FOR SELECT USING (true);

CREATE POLICY "Admins manage videos" ON previous_year_videos
    FOR ALL USING (is_admin());

-- Site Settings Policies (Public Read, Admin Write)
CREATE POLICY "Anyone can read settings" ON site_settings
    FOR SELECT USING (true);

CREATE POLICY "Admins manage settings" ON site_settings
    FOR ALL USING (is_admin());

-- Notifications Policies
CREATE POLICY "Users read their notifications or broadcasts" ON notifications
    FOR SELECT USING (
        participant_id IS NULL
        OR participant_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR is_admin()
    );

CREATE POLICY "Admins manage notifications" ON notifications
    FOR ALL USING (is_admin());

-- Admin Actions Policies
CREATE POLICY "Only admins view audit logs" ON admin_actions
    FOR ALL USING (is_admin());

-- ============================================================================
-- INITIAL SEED DATA
-- ============================================================================

-- Site Settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero_title', 'MAHOTSAV 2027'),
('hero_tagline', 'The Arc of Becoming'),
('fest_dates', '11-13 Feb 2027'),
('countdown_target', '2027-02-11T09:00:00+05:30'),
('cash_prizes', '₹ 20,00,000'),
('events_count', '90+ Events'),
('fee_culturals', '250'),
('fee_sports_men', '350'),
('fee_sports_women', '250'),
('upi_mobile', 'PASTE_PAYMENT_UPI_MOBILE_NUMBER_HERE'),
('qr_image_url', 'PASTE_PAYMENT_QR_IMAGE_HERE'),
('payment_instructions', 'Pay using any UPI App (GPay / PhonePe / Paytm / BHIM). Note the 12-digit UTR / UPI Ref number and enter it below.')
ON CONFLICT (setting_key) DO NOTHING;

-- Previous Year Videos (Day 1, Day 2, Day 3)
INSERT INTO previous_year_videos (day, youtube_url, title, description) VALUES
('day1', 'PASTE_DAY_1_YOUTUBE_LINK_HERE', 'Day 1 — Grand Inauguration & Cultural Odyssey', 'A spectacle of rhythm, classical fusion, university dance crews, and national celebrity performances kickstarting Mahotsav.'),
('day2', 'PASTE_DAY_2_YOUTUBE_LINK_HERE', 'Day 2 — Pro Nite & Battle of Bands', 'High-voltage electric arena, rock & fusion band finals, runway fashion show, and high-energy EDM concert under the stars.'),
('day3', 'PASTE_DAY_3_YOUTUBE_LINK_HERE', 'Day 3 — Valedictory & Star Musical Concert', 'Grand prize distribution ceremony followed by the headline musical festival performance and festival fireworks.')
ON CONFLICT (day) DO UPDATE SET 
    youtube_url = EXCLUDED.youtube_url,
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Venues
INSERT INTO venues (name, location, description, date, time, map_url) VALUES
('Open Air Theatre (OAT)', 'Vignan Central Quadrangle', 'Main stage for headlining concerts, battle of bands, celebrity nites, and inaugural ceremony with 15,000+ capacity.', '11-13 Feb 2027', '05:00 PM onwards', 'https://maps.google.com/?q=Vignan+University+Vadlamudi'),
('NTR Vignan Vihar Auditorium', 'Main Administrative Block, 2nd Floor', 'Air-conditioned acoustic auditorium for classical dance, vocal concerts, dramatics, and literary declamations.', '11-13 Feb 2027', '09:30 AM - 04:30 PM', 'https://maps.google.com/?q=Vignan+University+Vadlamudi'),
('Sangamam Indoor Sports Complex', 'Sports Enclave, South Campus', 'World-class wooden courts for badminton, table tennis, para-sports, and indoor championships.', '11-13 Feb 2027', '08:00 AM - 06:00 PM', 'https://maps.google.com/?q=Vignan+University+Vadlamudi'),
('Olympic Standard Athletic Track', 'University Main Stadium Ground', '400m synthetic athletic track, football field, and field events arena.', '11-13 Feb 2027', '07:30 AM - 05:30 PM', 'https://maps.google.com/?q=Vignan+University+Vadlamudi'),
('Multimedia & Esports Arena', 'IT Block Labs, 3rd Floor', 'High-end gaming rigs and projection systems for Valorant, BGMI, and FIFA tournaments.', '11-12 Feb 2027', '10:00 AM - 06:00 PM', 'https://maps.google.com/?q=Vignan+University+Vadlamudi'),
('Robotics & Innovation Pavilion', 'Mechanical Engineering Block Ground', 'Obstacle courses, RoboWars fighting cage, and autonomous line-follower battle arena.', '11-12 Feb 2027', '09:00 AM - 05:00 PM', 'https://maps.google.com/?q=Vignan+University+Vadlamudi')
ON CONFLICT DO NOTHING;

-- Featured Events
INSERT INTO events (title, category, description, poster_url, rules, venue, event_date, event_time, prize_money, min_team_size, max_team_size, eligibility) VALUES
('Natya Mayuri (Solo Classical Dance)', 'Performing Arts', 'Express the divine grace of Bharatanatyam, Kuchipudi, Kathak, or Mohiniyattam in this premier solo classical dance competition.', 'assets/events/classical_dance.jpg', 'Time limit: 8-10 minutes. Recorded audio track or live accompanists allowed. Judging on bhava, thala, and costume.', 'NTR Vignan Vihar Auditorium', '2027-02-11', '10:00 AM', '₹ 35,000', 1, 1, 'College students with valid ID'),
('Step Up (Western Group Dance)', 'Performing Arts', 'The most anticipated high-octane hip-hop, contemporary, and fusion crew showdown at Mahotsav.', 'assets/events/group_dance.jpg', 'Team size: 8-20 members. Time limit: 8-12 minutes. Dangerous props and fire strictly prohibited.', 'Open Air Theatre (OAT)', '2027-02-11', '06:00 PM', '₹ 75,000', 8, 20, 'College students with valid ID'),
('War of Bands (Live Rock & Fusion)', 'Performing Arts', 'Plug in the amps, hit the drums, and electrify the crowd in the ultimate collegiate battle of the bands.', 'assets/events/war_bands.jpg', 'Time limit: 20 minutes (including setup). Original compositions awarded bonus points. Standard drum kit provided.', 'Open Air Theatre (OAT)', '2027-02-12', '05:30 PM', '₹ 60,000', 3, 8, 'College students with valid ID'),
('RoboWars: Iron Clash', 'Robo Games', 'Heavyweight remote-controlled combat robots battling inside an armored safety arena till knockout.', 'assets/events/robowars.jpg', 'Max weight: 30kg. Wired or wireless control. Pneumatic flippers, spinning weapons permitted per safety manual.', 'Robotics & Innovation Pavilion', '2027-02-12', '10:00 AM', '₹ 50,000', 2, 5, 'Engineering & Tech students'),
('Valorant Apex Cup', 'Gaming & Multimedia', '5v5 tactical tournament on LAN server. Prove your aim, strategy, and utility execution to take the championship.', 'assets/events/valorant.jpg', 'Tournament format: Single elimination BO1, Finals BO3. Bring your own peripherals or use tournament gear.', 'Multimedia & Esports Arena', '2027-02-11', '11:00 AM', '₹ 40,000', 5, 6, 'College students with valid ID'),
('Canvas Chronicles (Live Art & Charcoal)', 'Visual Arts', 'Create breathtaking original visual art on the spot under the theme announced at the commencement.', 'assets/events/live_art.jpg', 'Time limit: 3 hours. Standard A2 sheet provided. Bring your own drawing mediums and colors.', 'Central Library Portico', '2027-02-11', '09:30 AM', '₹ 25,000', 1, 1, 'College students with valid ID'),
('National Youth Parliament & Debate', 'Literary', 'Debate burning national and geopolitical motions in a parliamentary committee simulation.', 'assets/events/debate.jpg', 'Strict parliamentary decorum. 2 rounds: Opening speech and rebuttal. English / Telugu / Hindi permitted.', 'Conference Hall 1', '2027-02-12', '10:30 AM', '₹ 30,000', 1, 2, 'College students with valid ID'),
('Sprint Kings & Queens (100m & 4x100m Relay)', 'Track & Field', 'Fastest sprinters in collegiate athletics battle on the synthetic track for gold and glory.', 'assets/events/sprint.jpg', 'IAAF rules apply. Spikes mandatory. False start rule strictly enforced.', 'Olympic Standard Athletic Track', '2027-02-11', '08:30 AM', '₹ 45,000', 1, 4, 'Bona fide college sports athletes'),
('Mahotsav Basketball Championship', 'Sports & Games', 'Fast-paced, full-court collegiate basketball tournament with top university teams competing.', 'assets/events/basketball.jpg', 'FIBA rules apply. 4 quarters of 10 minutes. Knockout bracket.', 'Sangamam Indoor Sports Complex', '2027-02-12', '09:00 AM', '₹ 50,000', 5, 12, 'College sports teams'),
('Para Athletics & Boccia Championship', 'Para Sports', 'Inclusive celebration of extraordinary athleticism featuring wheelchair racing and boccia.', 'assets/events/para_sports.jpg', 'Standard Paralympic classification applies. Medical assistance and specialized equipment available.', 'Sangamam Indoor Sports Complex', '2027-02-13', '10:00 AM', '₹ 40,000', 1, 2, 'Differently-abled student athletes')
ON CONFLICT DO NOTHING;

-- Initial Seed Admin Profile (Password should be configured via Supabase Auth)
-- Default admin user entry in profiles:
INSERT INTO profiles (
    name, dob, college_name, phone, email, studying_year, course, college_id, category, role, status, mhid
) VALUES (
    'Mahotsav Administrator', '1995-01-01', 'Vignan University', '9032080405', 'eswaravuthu04@gmail.com', 'Faculty', 'Administration', 'VIGNAN-ADMIN-01', 'Culturals', 'admin', 'approved', 'MH270000'
) ON CONFLICT (email) DO UPDATE SET role = 'admin', status = 'approved';

-- Initial Sample Broadcast Notification
INSERT INTO notifications (participant_id, title, message, type) VALUES
(NULL, 'Welcome to MAHOTSAV 2027!', 'Registrations are now officially live for the 20th Edition of Vignan Mahotsav. Compete for ₹20,00,000 cash prizes!', 'success');
