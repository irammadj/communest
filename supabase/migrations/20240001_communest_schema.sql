-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'regular_user',
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  estate_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estates
CREATE TABLE IF NOT EXISTS estates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) NOT NULL,
  location VARCHAR(20) NOT NULL,
  county VARCHAR(50) NOT NULL,
  units INTEGER NOT NULL,
  total_area INTEGER NOT NULL,
  description TEXT,
  management_name VARCHAR(20) NOT NULL,
  management_email VARCHAR(255) NOT NULL,
  management_phone VARCHAR(20) NOT NULL,
  title_deed_number VARCHAR(100) NOT NULL,
  estate_photo TEXT NOT NULL,
  amenity_photos TEXT[] DEFAULT '{}',
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  admin_id UUID REFERENCES profiles(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Houses
CREATE TABLE IF NOT EXISTS houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  house_number VARCHAR(20) NOT NULL,
  total_area INTEGER NOT NULL,
  rooms INTEGER NOT NULL,
  photos TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  rent_amount INTEGER NOT NULL,
  manager_phone VARCHAR(20) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'vacant',
  occupied_at TIMESTAMPTZ,
  tenant_name VARCHAR(100),
  payment_status VARCHAR(10)
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id),
  house_id UUID REFERENCES houses(id),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance issues
CREATE TABLE IF NOT EXISTS maintenance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment options
CREATE TABLE IF NOT EXISTS payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  details TEXT NOT NULL
);

-- Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estate_id UUID REFERENCES estates(id),
  house_id UUID REFERENCES houses(id),
  tenant_id UUID REFERENCES profiles(id),
  tenant_name VARCHAR(100) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  replied_at TIMESTAMPTZ
);

-- Enable RLS on all tables (edge function uses service role so it bypasses RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
