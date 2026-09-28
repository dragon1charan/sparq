# Sparq — setup guide

This is the real, working codebase (not the prototype). Follow these steps in order.

## What you need (all free to start)
- Node.js installed on your computer (nodejs.org — get the LTS version)
- A Supabase account (supabase.com)
- A Vercel account (vercel.com)
- A GitHub account (github.com) — Vercel deploys from GitHub

## Step 1 — Create your Supabase project
1. Go to supabase.com, sign up, click "New project"
2. Name it "sparq", set a database password (save it somewhere), pick a region close to India (Singapore is usually closest)
3. Once it's created, go to Project Settings → API. Copy the "Project URL" and the "anon public" key — you'll need these in Step 3

## Step 2 — Set up the database
1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Open `supabase/schema.sql` from this project, copy everything, paste it into the SQL editor, click "Run"
3. This creates all your tables (profiles, tags, matches, messages, groups) and adds 4 starter group chats

## Step 3 — Run it on your computer
1. Open a terminal in this project folder
2. Run: `npm install`
3. Copy `.env.local.example` to a new file called `.env.local`
4. Paste in your Supabase URL and anon key from Step 1
5. Run: `npm run dev`
6. Open `http://localhost:3000` — you now have the real app running locally

## Step 4 — Put it on the internet (Vercel)
1. Create a new GitHub repo, push this project to it
2. Go to vercel.com, click "New Project", import your GitHub repo
3. In the "Environment Variables" section, add the same two variables from your `.env.local`
4. Click Deploy — you'll get a real URL like `sparq-yourname.vercel.app` in about a minute

## What's real vs. what's stubbed
- **Real**: signup/login, profile creation, the 3-tag minimum, matching sorted by shared interests, mutual likes creating real matches, live chat (via Supabase realtime), group chats
- **Stubbed**: the paywall button shows an alert instead of taking real payment. For India, Razorpay is the standard choice — when you're ready to charge real money, tell me and we'll wire that in (it's a well-documented, contained addition on top of what's here)

## Sensible next steps, in order
1. Deploy it and test signup/login yourself first
2. Get 5-10 friends to sign up for real and use it — this tests the actual backend, not just clicks on a mockup
3. Only after that works smoothly, connect real payments
4. Add photo upload (currently just an initial-letter avatar)
