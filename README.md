# PackEasy

## Vercel Deploy

Import this repository into Vercel, then add the required environment variables from `.env.example` in the Vercel project settings.

The app uses the `/api/groq` serverless route for Mr. Roam chat, so `GROQ_API_KEY` must be set in Vercel. The Firebase `EXPO_PUBLIC_*` values are also required for the mobile web build.