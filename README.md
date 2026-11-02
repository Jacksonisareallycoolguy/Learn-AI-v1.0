# Learn AI (v1.0)

A gamified AI learning site for high school students. React + Vite on the front end, Supabase for accounts and progress, hosted on Vercel.

**Lessons (done in order):** How AI Works → Practical Use → Ethical Use. Each has a short "big idea" card and 5 multiple-choice questions (A/B/C/D). Earn XP, levels, badges, and a daily streak.

## 1. Get your Supabase key (2 minutes)

1. Open your project: https://supabase.com/dashboard/project/znpumgglvkfgbztuucco
2. Go to **Project Settings → API Keys** and copy the **Publishable key** (starts with `sb_publishable_`; the older "anon" key also works).
3. **Never** use the `service_role` or "secret" key in this app.
4. Go to **Authentication → Providers → Email** and turn **OFF "Confirm email"**. Students sign up with a username only, so there is no inbox to confirm.

## 2. Run it on your computer (optional)

Needs Node 18 or newer.

```
npm install
cp .env.example .env      # then paste your publishable key into .env
npm run dev
```

## 3. Put it on GitHub

Create a new empty repository, then upload every file from this folder (drag and drop works on github.com). Do **not** upload a `.env` file (it is already in `.gitignore`).

## 4. Deploy on Vercel

1. Vercel → **Add New → Project** → import your GitHub repo. It detects Vite automatically.
2. Before deploying, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` = `https://znpumgglvkfgbztuucco.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your publishable key
3. Click **Deploy**. Every push to GitHub redeploys automatically.

`vercel.json` makes page refreshes and direct links (like `/learn`) work.

## How it works

- **Usernames:** Supabase Auth needs an email, so a username becomes a hidden address like `jordan@learnai.app`. Nothing is ever sent to it. Because of that there is **no password reset**; a forgotten password means a new account (or you reset it in the Supabase dashboard under Authentication → Users). The domain is set in `src/lib/auth.jsx`.
- **Everything important happens in the database**, not the browser: grading, XP (paid once per lesson, so replays and refreshes cannot farm it), levels, streaks, badges, and lesson unlocking. The correct answers live in an admin-only table that students cannot read.
- **Supabase functions used:** `get_course_map`, `get_dashboard`, `start_lesson`, `check_answer` (added for v1.0), `submit_quiz`.
- **Passing score:** 60% (3 of 5). Streak days roll over at midnight Pacific time.

## Changing lessons

Edit them in Supabase (Table Editor): `lessons` (teaching text in the `content` column), `questions` (options as `[{"id":"a","text":"..."}]`), and `question_answers` (the correct option id and the explanation). Lesson order comes from `categories.display_order` and each lesson's `prerequisite_lesson_id`.

## Project layout

```
src/pages        Home, Auth (log in / sign up), Learn, Lesson, Progress
src/components   Pixel brain, nodes, badges, navigation
src/lib          supabase.js (client), auth.jsx (username login), api.js (database calls)
src/styles       global.css (colors and design tokens at the top)
```

## Known limits in v1.0

- If a student refreshes in the middle of a lesson, they restart that lesson's quiz (completed lessons and XP are never lost).
- No password reset (see above) and no About/Contact pages.
