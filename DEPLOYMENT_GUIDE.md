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

## Database Schema

The complete database schema is located in:
`supabase/schema.sql`

This file contains all necessary table definitions without any pre-filled data, allowing for a clean installation.


---

## Verification

### 1. Database Check
- [ ] Go to Supabase → **Table Editor**
- [ ] Verify tables exist: `site_settings`, `clients`, `appointments`, `testimonials`, `phone_numbers`, `services_overview`, `price_list`, `price_categories`, `staff_calendars`, `gallery_images`, `custom_sections`, `custom_section_elements`
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
1. Uncomment the `staff_calendars` table in setup SQL
2. Insert professional-calendar mappings:
```sql
INSERT INTO staff_calendars (member_name, calendar_id)
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
