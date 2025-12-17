# Frontend Architecture & UX Guidelines

## Project Structure
This project has been refactored from a single-file prototype to a scalable React architecture using Vite.

```
src/
├── components/         # Reusable UI components
│   └── ui/            # Generic UI elements (NeonCard, GlitchText)
├── context/           # Global State Management (TournamentContext)
├── layouts/           # Page Layouts (AdminLayout, ViewerLayout)
├── lib/               # Utilities & Config (Firebase, Theme)
├── pages/             # Route Components
│   ├── admin/         # Admin Dashboard & Login
│   └── viewer/        # Public Viewer Pages
├── types.ts           # TypeScript Definitions
├── App.tsx            # Main Router Setup
└── main.tsx           # Entry Point
```

## UX Flow

### Admin Portal (`/admin`)
1.  **Authentication**: Protected by a simulated login screen.
    *   Credentials are stored in Environment Variables (Netlify safe).
2.  **Dashboard Hub**: A central command center.
    *   **Quick Actions**: Toggle Tournament Stages (Qualifiers -> Finals).
    *   **Viewer Control**: Select which Room is broadcasted on the main viewer screen.
3.  **Player Management**: Add/Edit players and assign them to rooms.
4.  **Scoring**: Real-time score input table.
5.  **Spin Wheel**: Exclusive control for Semifinals to inject RNG elements.

### Viewer Portal (`/tournament`)
1.  **Immersive Landing**: The default view shows the room selected by the Admin.
    *   Designed for large screens/projectors.
    *   Auto-updates in real-time via Firestore.
2.  **Room Specific Views** (`/tournament/room/:id`):
    *   Allows multiple displays to show different rooms simultaneously.
    *   Example: Screen A shows Room 1, Screen B shows Room 2.

## Deployment Instructions (Netlify)

1.  **Connect Repository**: Link this GitHub repo to Netlify.
2.  **Build Settings**:
    *   **Build Command**: `npm run build`
    *   **Publish Directory**: `dist`
3.  **Environment Variables**:
    You **MUST** set these in Netlify Site Settings > Environment Variables:

    ```env
    VITE_ADMIN_USER=admin
    VITE_ADMIN_PASS=adminturxfive
    VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"..."}
    ```
    *(Note: For Firebase Config, you can paste the full JSON string. Ensure it matches your Firebase project settings.)*

## Security Notes
*   **Code Obfuscation**: The production build minifies and chunks code, making it difficult to reverse-engineer logic.
*   **Admin Auth**: While currently client-side (per requirements), the credentials are not hardcoded in the source repository but injected at build time via Env Vars.

## Demo Mode
To prevent "blank screen" issues when the Firebase configuration is missing (e.g., in a preview environment or before the backend is fully connected), the application automatically enters **Demo Mode**.
*   **Behavior**: It uses local mock data for players and scores.
*   **Indicators**: A console warning `⚠️ No valid Firebase Config found. Entering DEMO MODE.` will appear.
*   **Resolution**: To switch to production mode, ensure `VITE_FIREBASE_CONFIG` is set in the environment variables.

## Consistency Guidelines
*   **Theme**: Always import `theme` from `@/lib/theme`.
*   **Components**: Use `NeonCard` for containers to maintain the Cyberpunk aesthetic.
*   **Typography**: Use `Orbitron` for headings and `Oxanium` for data/numbers.
