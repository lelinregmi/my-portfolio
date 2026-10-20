<<<<<<< HEAD
# Lelin Kumar Regmi Portfolio
=======

>>>>>>> 0d00245d93ffc625cabb7df9701fecf7b4144248

A React, TypeScript, and Vite portfolio with public class 9–12 computer studies notes and a Supabase-backed admin panel for notes, blog posts, and projects.

## Run locally

```sh
npm install
npm run dev
```

## Configure the admin panel and content

1. Create a Supabase project and open its SQL Editor.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) to create the content tables, row-level security policies, and starter blog/project entries.
3. In Supabase Authentication, create an email/password account for yourself. Keep public sign-ups disabled.
4. Use the final SQL example in `supabase/schema.sql` to add your Auth user to `public.admin_users`. Replace the example email with your account email.
5. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using your project's URL and public anon/publishable key. Never put a Supabase service-role key in frontend environment variables.
6. Restart the Vite server and open `/admin` to sign in.

Vercel deployments use `vercel.json` to route direct requests such as `/admin` and `/notes` to the Vite app. After pushing routing changes, redeploy the project.

The admin page lets authorized users add, edit, delete, and publish notes, blogs, and projects, and manage subject names by class. Notes can include a PDF up to 20 MB. Blogs can include one image up to 10 MB. Projects can include one image up to 10 MB and one MP4/WebM demo video up to 50 MB. Media is stored in private Supabase Storage buckets and shown on published content. Unpublished content and its media are only available to admins. Public visitors can browse notes at `/notes`, then choose a class and subject.

If you already ran the database setup before enabling PDF or media uploads and editable subjects, run the updated `supabase/schema.sql` again in the Supabase SQL Editor. It adds the media columns, seeds the subject list, creates the private storage buckets, and applies the storage access policies.

Without Supabase configuration, the portfolio continues to show its original sample blog posts and projects. Database-backed notes and admin editing require the Supabase setup above.

## Checks

```sh
npm run build
npm test
```
