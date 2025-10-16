# Fusion Starter

A production-ready full-stack React application template with integrated Express server, featuring React Router 6 SPA mode, TypeScript, Vitest, Zod and modern tooling.

While the starter comes with a express server, only create endpoint when strictly neccesary, for example to encapsulate logic that must leave in the server, such as private keys handling, or certain DB operations, db...

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (spa) + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express server integrated with Vite dev server
- **Testing**: Vitest
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons

## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## Key Features

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.tsx` represents the home page.
- Routes are defined in `client/App.tsx` using the `react-router-dom` import
- Route files are located in the `client/pages/` directory

For example, routes can be defined with:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<NotFound />} />
</Routes>;
```

### Styling System

- **Primary**: TailwindCSS 3 utility classes
- **Theme and design tokens**: Configure in `client/global.css` 
- **UI components**: Pre-built library in `client/components/ui/`
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge` for conditional classes

```typescript
// cn utility usage
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // User overrides
)}
```

### Express Server Integration

- **Development**: Single port (8080) for both frontend/backend
- **Hot reload**: Both client and server code
- **API endpoints**: Prefixed with `/api/`

#### Example API Routes
- `GET /api/ping` - Simple ping api
- `GET /api/demo` - Demo endpoint  

### Shared Types
Import consistent types in both client and server:
```typescript
import { DemoResponse } from '@shared/api';
```

Path aliases:
- `@shared/*` - Shared folder
- `@/*` - Client folder

## Getting Started - Clone to Production

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd fusion-starter
```

Replace `<repository-url>` with your actual repository URL.

### Step 2: Install Dependencies

```bash
pnpm install
```

This installs all required dependencies as defined in `package.json`. PNPM is the required package manager for this project.

**Note**: If you don't have PNPM installed globally, run:
```bash
npm install -g pnpm
```

### Step 3: Verify Installation

Check that everything is installed correctly:

```bash
pnpm typecheck    # Verify TypeScript types
pnpm test         # Run the test suite
```

### Step 4: Local Development

Start the development server with hot reload for both client and server:

```bash
pnpm dev
```

The app will be available at `http://localhost:8080/`

### Step 5: Create Production Build

Build the project for production:

```bash
pnpm build
```

This command runs both client and server builds:
- `pnpm build:client` - Builds the React SPA with Vite
- `pnpm build:server` - Builds the Express server with Vite

The build output is generated in the `dist/` directory:
- `dist/spa/` - Frontend bundle (React SPA)
- `dist/server/` - Backend bundle (Express server)

### Step 6: Verify Production Build

```bash
pnpm typecheck    # Ensure no TypeScript errors
```

### Step 7: Run Production Build Locally

To test the production build locally:

```bash
pnpm start
```

This runs the compiled server from `dist/server/node-build.mjs` which serves both the API and the static frontend.

### Step 8: Deploy to Production

#### Option A: Standard Deployment
Deploy the `dist/` folder to your hosting platform.

#### Option B: Binary Deployment
Create self-contained executables (Linux, macOS, Windows):

```bash
pnpm build
pnpm start    # Requires pkg to be installed globally
```

#### Option C: Cloud Deployment
Use Netlify or Vercel for automated deployment via their MCP integrations. Both providers work seamlessly with this starter template.

## Development Commands

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript validation
pnpm test       # Run Vitest tests
```

## Adding Features

### Add new colors to the theme

Open `client/global.css` and `tailwind.config.ts` and add new tailwind colors.

### New API Route
1. **Optional**: Create a shared interface in `shared/api.ts`:
```typescript
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Create a new route handler in `server/routes/my-route.ts`:
```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:
```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:
```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Environment Variables

### Development

Create a `.env` file in the root directory for local development:

```
# Example .env
VITE_API_URL=http://localhost:8080
NODE_ENV=development
```

### Production

Set environment variables in your deployment platform:
- Netlify: Site settings > Environment > Environment variables
- Vercel: Settings > Environment Variables
- Self-hosted: Set via your hosting platform or shell

## Troubleshooting

### Common Issues

#### Module Not Found Error
**Error**: `Cannot find module 'dist/server/node-build.mjs'`
- **Cause**: Production build hasn't been created
- **Solution**: Run `pnpm build` before `pnpm start`

#### Port Already in Use
**Error**: `Error: listen EADDRINUSE: address already in use :::8080`
- **Cause**: Port 8080 is already occupied
- **Solution**:
  - Kill the process using port 8080
  - Or change the port in `vite.config.ts`

#### Dependencies Not Installed
**Error**: `Cannot find module 'react'`
- **Cause**: Dependencies weren't installed
- **Solution**: Run `pnpm install` and verify `node_modules/` exists

#### TypeScript Errors
**Error**: Type errors during development
- **Solution**:
  - Run `pnpm typecheck` to see all errors
  - Check that all imports use correct paths (`@/` or `@shared/`)
  - Ensure all components have proper type annotations

#### Hot Reload Not Working
**Cause**: Vite dev server isn't detecting changes
- **Solution**:
  - Restart the dev server: `pnpm dev`
  - Check file permissions
  - Verify your editor isn't in a read-only mode

### Debugging

#### Enable Debug Logging
Set `DEBUG` environment variable:

```bash
DEBUG=* pnpm dev
```

#### Test Your Build
Verify everything works before deployment:

```bash
pnpm build           # Build
pnpm typecheck       # Check types
pnpm test            # Run tests
pnpm start           # Test production build
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
