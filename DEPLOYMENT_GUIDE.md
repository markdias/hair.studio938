# Business Management System - Complete Deployment Guide

This guide provides everything needed to deploy a new instance of Business Management System website, from database setup to production deployment.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start Checklist](#quick-start-checklist)
4. [Supabase Setup](#supabase-setup)
5. [Google Calendar Setup](#google-calendar-setup)
6. [Gmail SMTP Setup](#gmail-smtp-setup)
7. [Vercel Deployment](#vercel-deployment)
8. [Environment Variables Reference](#environment-variables-reference)
9. [Database Schema](#database-schema)
10. [Verification](#verification)
11. [Troubleshooting](#troubleshooting)

---

This management system is built with:
- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Integrations**: Google Calendar API, Gmail SMTP

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub account with repository access
- ✅ Vercel account (free tier works)
- ✅ Supabase account (free tier works)
- ✅ Google account for Calendar integration
- ✅ Gmail account with 2FA enabled for email notifications

---

## Quick Start Checklist

- [ ] Create Supabase project and run setup SQL
- [ ] Get Supabase credentials (URL + anon key)
- [ ] Create Google Cloud project and enable Calendar API
- [ ] Generate service account and share calendar
- [ ] Create Gmail App Password
- [ ] Connect GitHub repo to Vercel
- [ ] Add all 7 environment variables to Vercel
- [ ] Deploy and verify booking flow

---

## Supabase Setup

### Step 1: Create New Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Configure:
   - **Name**: `business-management-system` (or your choice)
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is sufficient
4. Click **"Create new project"** (takes 1-2 minutes)

### Step 2: Run Database Setup

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this repository
4. Copy its contents and paste into the Supabase SQL Editor
5. Click **"Run"** to execute
6. Verify success message appears

### Step 3: Get Credentials

1. Navigate to **Settings** → **API**
2. Copy and save:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## Google Calendar Setup

### Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `Business Calendar`
4. Click **"Create"**

### Step 2: Enable Calendar API

1. Select your new project
2. Go to **"APIs & Services"** → **"Library"**
3. Search: **"Google Calendar API"**
4. Click **"Enable"**

### Step 3: Create Service Account

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"Service Account"**
3. Fill in:
   - **Name**: `business-calendar-service`
   - **Description**: `Service account for booking appointments`
4. Click **"Create and Continue"** → **"Done"**

### Step 4: Generate Key

1. Click on the service account you created
2. Go to **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Select **JSON** format → **"Create"**
5. JSON file downloads automatically
6. Open file and save:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_PRIVATE_KEY`

### Step 5: Share Calendar

1. Open [calendar.google.com](https://calendar.google.com/)
2. Select calendar to use (or create new one)
3. Click ⋮ → **"Settings and sharing"**
4. Under **"Share with specific people"**, click **"Add people"**
5. Paste the service account email (from JSON file)
6. Set permissions: **"Make changes to events"**
7. Click **"Send"**
8. In **"Integrate calendar"** section, copy **Calendar ID** → `GOOGLE_CALENDAR_ID`

---

## Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ensure **2-Step Verification** is enabled
3. If not, click **"2-Step Verification"** and complete setup

### Step 2: Create App Password

1. Stay in [myaccount.google.com/security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"**
3. Scroll to **"App passwords"** → Click it
4. Select:
   - App: **"Mail"**
   - Device: **"Other"** → Type `Management System`
5. Click **"Generate"**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
7. Remove spaces → `SMTP_PASS`

### Step 3: Note Gmail Address

- Your Gmail address → `SMTP_USER`

---

## Vercel Deployment

### Step 1: Import Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Verify settings:
   - Framework: **Vite** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 2: Add Environment Variables

Before deploying, expand **"Environment Variables"** and add all 7 variables from the [reference below](#environment-variables-reference).

For each variable:
1. Enter **Name** and **Value**
2. Select **all environments** (Production, Preview, Development)
3. Click **"Add"**

> **Critical**: `GOOGLE_PRIVATE_KEY` must include full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. Keep `\n` characters as-is.

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for build completion (1-2 minutes)
3. Site goes live at `https://your-project.vercel.app`

### Step 4: Add Environment Variables Later (if needed)

1. Go to project → **"Settings"** → **"Environment Variables"**
2. Click **"Add New"**
3. After adding variables, **redeploy** for changes to take effect

---

## Environment Variables Reference

### Complete List (7 Required Variables)

#### Supabase (2 variables)
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*From: Supabase → Settings → API*

#### Google Calendar (3 variables)
```
GOOGLE_CALENDAR_ID=yourname@gmail.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----
```
*From: Service account JSON file and Calendar settings*

#### Gmail SMTP (2 variables)
```
SMTP_USER=yourname@gmail.com
SMTP_PASS=abcdabcdabcdabcd
```
*From: Gmail App Password (no spaces)*

### Important Notes

- **`VITE_` prefix**: Required for frontend-accessible variables (Supabase)
- **Private Key**: Must be exact copy from JSON, including `\n` newlines
- **App Password**: 16 characters, no spaces, NOT your regular password
- **Environment scope**: Add to all three (Production, Preview, Development)

---

## Database Schema

Run this complete SQL script in Supabase SQL Editor:

```sql
-- ============================================
-- Complete Database Setup
-- ============================================

-- SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    key TEXT UNIQUE NOT NULL,
    value TEXT
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.site_settings
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.site_settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.site_settings
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.site_settings
    FOR DELETE USING (auth.role() = 'authenticated');

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    notes TEXT
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.clients
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.clients
    FOR INSERT WITH CHECK (true);

The complete database schema is located in:
`supabase/schema.sql`

This file contains all necessary table definitions without any pre-filled data, allowing for a clean installation.

CREATE INDEX IF NOT EXISTS clients_email_idx ON public.clients (email);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    professional TEXT NOT NULL,
    service TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'confirmed',
    notes TEXT,
    google_event_id TEXT
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.appointments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.appointments
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.appointments
    FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS appointments_professional_idx ON public.appointments (professional);
CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON public.appointments (start_time);

-- TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT,
    description TEXT NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.testimonials
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.testimonials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.testimonials
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.testimonials
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);

-- PHONE NUMBERS TABLE
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('phone', 'whatsapp', 'both')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view phone numbers" ON public.phone_numbers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert phone numbers" ON public.phone_numbers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update phone numbers" ON public.phone_numbers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete phone numbers" ON public.phone_numbers
    FOR DELETE USING (auth.role() = 'authenticated');

-- 6. PRICE CATEGORIES
CREATE TABLE IF NOT EXISTS public.price_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access' AND tablename = 'price_categories') THEN
        CREATE POLICY "Public read access" ON public.price_categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth write access' AND tablename = 'price_categories') THEN
        CREATE POLICY "Auth write access" ON public.price_categories FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 7. PRICE LIST
CREATE TABLE IF NOT EXISTS public.price_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    price TEXT,
    duration_minutes INTEGER DEFAULT 60,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access' AND tablename = 'price_list') THEN
        CREATE POLICY "Public read access" ON public.price_list FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth write access' AND tablename = 'price_list') THEN
        CREATE POLICY "Auth write access" ON public.price_list FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- TEAM CALENDARS TABLE
CREATE TABLE IF NOT EXISTS public.stylist_calendars (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stylist_name TEXT NOT NULL UNIQUE,
    calendar_id TEXT NOT NULL,
    image_url TEXT,
    role TEXT,
    provided_services TEXT[],
    hover_video_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stylist_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view staff calendars" ON public.stylist_calendars
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage staff calendars" ON public.stylist_calendars
    FOR ALL USING (auth.role() = 'authenticated');

-- SERVICES OVERVIEW TABLE
CREATE TABLE IF NOT EXISTS public.services_overview (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.services_overview ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.services_overview FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.services_overview FOR ALL USING (auth.role() = 'authenticated');

-- GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Auth write access" ON public.gallery_images FOR ALL USING (auth.role() = 'authenticated');

-- CUSTOM SECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.custom_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    heading_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    element_limit INTEGER DEFAULT 10,
    background_color TEXT,
    text_color TEXT DEFAULT '#2A1D15',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.custom_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Auth manage" ON public.custom_sections FOR ALL USING (auth.role() = 'authenticated');

-- CUSTOM SECTION ELEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.custom_section_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.custom_sections(id) ON DELETE CASCADE,
    element_type TEXT NOT NULL CHECK (element_type IN ('gallery', 'text_box', 'card', 'image', 'video')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.custom_section_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.custom_section_elements FOR SELECT USING (true);
CREATE POLICY "Auth manage" ON public.custom_section_elements FOR ALL USING (auth.role() = 'authenticated');

-- SITE PAGE SECTIONS (ORDERING)
CREATE TABLE IF NOT EXISTS public.site_page_sections (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    sort_order INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.site_page_sections FOR SELECT USING (enabled = true);
CREATE POLICY "Auth manage" ON public.site_page_sections FOR ALL USING (auth.role() = 'authenticated');

-- DEFAULT SETTINGS
INSERT INTO public.site_settings (key, value)
VALUES
    ('theme_primary', '#3D2B1F'),
    ('theme_primary_hover', '#4D3B2F'),
    ('theme_accent', '#EAE0D5'),
    ('theme_soft_cream', '#F5F1ED'),
    ('theme_text_dark', '#2A1D15'),
    ('theme_text_light', '#FFFFFF'),
    ('intro_video_url', ''),
    ('footer_description', 'Your premium experience.'),
    ('terms_and_conditions', ''),
    ('privacy_policy', ''),
    ('payment_methods', 'visa,mastercard,paypal'),
    ('show_privacy_section', 'true'),
    ('privacy_menu_name', 'Privacy Policy'),
    ('privacy_heading_name', 'Privacy Policy'),
    ('show_terms_section', 'true'),
    ('terms_menu_name', 'Terms & Conditions'),
    ('terms_heading_name', 'Terms & Conditions'),
    ('services_menu_name', 'Services'),
    ('services_heading_name', 'Our Services'),
    ('services_bg_color', ''),
    ('services_text_color', ''),
    ('team_menu_name', 'Team'),
    ('team_heading_name', 'Meet the Team'),
    ('team_bg_color', ''),
    ('team_text_color', ''),
    ('pricing_menu_name', 'Pricing'),
    ('pricing_heading_name', 'Service Menu'),
    ('pricing_bg_color', ''),
    ('pricing_text_color', ''),
    ('pricing_currency_symbol', '£'),
    ('show_opening_hours', 'true'),
    ('site_enabled', 'true'),
    ('email_subject', 'Booking Confirmation'),
    ('testimonials_menu_name', 'Testimonials'),
    ('testimonials_heading_name', 'Client Stories'),
    ('testimonials_bg_color', ''),
    ('testimonials_text_color', ''),
    ('gallery_menu_name', 'Gallery'),
    ('gallery_heading_name', 'Our Work'),
    ('gallery_bg_color', ''),
    ('gallery_text_color', ''),
    ('booking_heading_name', 'Book Your Visit'),
    ('booking_bg_color', ''),
    ('booking_text_color', ''),
    ('contact_menu_name', 'Contact'),
    ('contact_heading_name', 'Contact Us'),
    ('contact_bg_color', ''),
    ('contact_text_color', '')
ON CONFLICT (key) DO NOTHING;

-- INITIAL SEED FOR FIXED SECTIONS
INSERT INTO public.site_page_sections (id, label, is_custom, sort_order)
VALUES 
    ('services', 'Services', false, 10),
    ('team', 'Team', false, 20),
    ('pricing', 'Pricing', false, 30),
    ('testimonials', 'Testimonials', false, 40),
    ('booking', 'Booking', false, 50),
    ('gallery', 'Gallery', false, 60),
    ('contact', 'Contact', false, 70)
ON CONFLICT (id) DO NOTHING;
```

---

## Verification

### 1. Database Check
- [ ] Go to Supabase → **Table Editor**
- [ ] Verify tables exist: `site_settings`, `clients`, `appointments`, `testimonials`, `phone_numbers`, `services_overview`, `price_list`, `price_categories`, `stylist_calendars`, `gallery_images`, `custom_sections`, `custom_section_elements`
- [ ] Check `site_settings` has theme values

### 2. Website Check
- [ ] Visit deployed Vercel URL
- [ ] Homepage loads correctly
- [ ] Navigate through all sections

### 3. Booking Flow Test
- [ ] Fill out booking form with test data
- [ ] Submit booking
- [ ] Check Google Calendar for new appointment
- [ ] Check customer email for confirmation
- [ ] Check SMTP_USER email for BCC copy

### 4. Admin Dashboard Check
- [ ] Navigate to `/admin`
- [ ] Verify you can view/edit appointments
- [ ] Test client management
- [ ] Test settings modification

---

## Troubleshooting

### "Google Calendar credentials missing"
- Verify all 3 Google variables are set in Vercel
- Check `GOOGLE_PRIVATE_KEY` includes full key with BEGIN/END markers
- Redeploy after adding variables

### Appointments not appearing in calendar
- Confirm service account email has "Make changes to events" permission
- Verify correct Calendar ID
- Check Vercel function logs for errors

### Emails not sending
- Ensure 2FA enabled on Gmail
- Use App Password, not regular password
- Verify `SMTP_USER` and `SMTP_PASS` in Vercel
- Remove spaces from App Password

### Database connection errors
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Verify Supabase project is not paused
- Re-run setup SQL if RLS policies are missing

### Build failures on Vercel
- Check `package.json` dependencies are correct
- Verify Node version compatibility
- Review build logs for specific errors

---

## Additional Configuration

### Custom Email Templates
1. Log into admin dashboard
2. Navigate to email settings
3. Edit template HTML
4. Use placeholders: `{{name}}`, `{{service}}`, `{{professional}}`, `{{date}}`, `{{time}}`, `{{business_phone}}`, `{{business_address}}`, `{{business_name}}`

### Multiple Professional Calendars
To assign different calendars to professionals:
1. Ensure the `stylist_calendars` table is created (it is included in setup SQL)
2. Insert professional-calendar mappings in Supabase SQL Editor:
```sql
INSERT INTO stylist_calendars (stylist_name, calendar_id)
VALUES ('Sarah', 'sarah@gmail.com'),
       ('Mike', 'mike@gmail.com');
```
3. Share each calendar with the service account

### Custom Domain
1. Vercel project → **Settings** → **Domains**
2. Add domain and configure DNS records
3. Wait for DNS propagation (can take up to 48 hours)

---

## Summary

This template provides a complete business management website with:
- ✅ Customizable admin dashboard
- ✅ Google Calendar integration
- ✅ Automated email confirmations
- ✅ Client and appointment management
- ✅ Testimonials and phone number management
- ✅ Fully responsive design

**Total setup time**: ~30-45 minutes  
**Cost**: $0 (using free tiers)

---

**Last Updated**: February 2026  
**Version**: 1.1
