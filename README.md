# PackEasy

## Vercel Deploy

Import this repository into Vercel, then add `GROQ_API_KEY` in the Vercel project settings.

The Firebase `EXPO_PUBLIC_*` values are already committed in `.env.production` for the web build. The app uses the `/api/groq` serverless route for Mr. Roam chat, so `GROQ_API_KEY` must still be set in Vercel.