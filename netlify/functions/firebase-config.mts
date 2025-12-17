import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get Firebase config from server-side environment variables
  const firebaseConfig = {
    apiKey: Netlify.env.get("VITE_FIREBASE_API_KEY") || "",
    authDomain: Netlify.env.get("VITE_FIREBASE_AUTH_DOMAIN") || "",
    projectId: Netlify.env.get("VITE_FIREBASE_PROJECT_ID") || "",
    storageBucket: Netlify.env.get("VITE_FIREBASE_STORAGE_BUCKET") || "",
    messagingSenderId: Netlify.env.get("VITE_FIREBASE_MESSAGING_SENDER_ID") || "",
    appId: Netlify.env.get("VITE_FIREBASE_APP_ID") || "",
    measurementId: Netlify.env.get("VITE_FIREBASE_MEASUREMENT_ID") || "",
  };

  return new Response(JSON.stringify(firebaseConfig), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
};

export const config: Config = {
  path: "/api/firebase-config",
};
