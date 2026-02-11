# Marketio - Project Status

## What It Is
Interactive MVP demo of Marketio — a white-label marketplace SDK for banks. Shows the marketplace as it would appear inside a bank's mobile app (displayed in an iPhone mockup frame on desktop).

## Tech Stack
- Next.js 16.1.6, React 19, TypeScript, Tailwind v4
- lucide-react (SVG icons), framer-motion (animations)
- Service adapter pattern: mock implementations today, real API client swap when partners sign
- Next.js API Routes (serverless) as backend layer
- localStorage for client state (loyalty cards, transactions, saved vehicles, theme)

## Current Phase: Phase 2 — Integration-Ready Architecture (COMPLETE)

### Phase 1 (Demo) — DONE
- All 8 pages interactive with animations
- 5 bank themes, white-label CSS variables
- Mock data, localStorage persistence
- Deployed at https://marketio-mu.vercel.app

### Phase 2 (Integration-Ready) — DONE
- [x] Service adapter pattern (interface + mock + barrel per partner domain)
- [x] Backend API routes (10 routes across 6 domains)
- [x] Data-fetching hooks (useServiceQuery, useServiceMutation)
- [x] Error handling UI (ErrorState with retry, LoadingState skeletons)
- [x] All pages migrated from direct data imports to API-backed flows
- [x] Parking rebuilt: 10 Croatian cities with real zones/rates, city search, region grouping
- [x] Vignettes rebuilt: VignetteID's real 9 countries (removed Croatia/Germany, added Switzerland/Moldova), DatePicker, order status
- [x] Saved Vehicles: shared VehiclePicker component, localStorage persistence, used on both Parking and Vignettes
- [x] ConfirmationScreen: status badge support (ACTIVE, PENDING, etc.)
- [x] Vignette countries updated to match VignetteID's real product catalog
- [x] Old data files deleted (services.ts kept for home page grid)

## Architecture

### Service Adapter Pattern
Each partner domain has 3 files:
```
src/services/{domain}/
  {domain}.service.ts    — TypeScript interface
  {domain}.mock.ts       — Mock implementation (current data)
  index.ts               — Re-exports active implementation (1-line swap)
```

### API Routes
```
/api/topups          GET: catalog    POST: purchase
/api/gaming          GET: catalog    POST: purchase
/api/vouchers        GET: catalog    POST: purchase
/api/vignettes       GET: catalog    POST: purchase
/api/vignettes/[id]  GET: order status
/api/parking/cities  GET: city list
/api/parking/zones   GET: zones for city (?cityId=xxx)
/api/parking/session POST: start session
/api/lottery         GET: catalog    POST: purchase
```

### When Partners Sign
1. Create one implementation file (e.g., `topups.trilix.ts`)
2. Change one line in the barrel `index.ts`
3. Add API keys to `.env.local` / Vercel environment variables
4. Test with sandbox, then go live. Zero page changes.

## Partner Status
| Partner | Provides | Status |
|---------|----------|--------|
| Trilix | Top-ups, gaming, gift cards | API docs in hand, no agreement signed |
| VignetteID | Highway vignettes (9 countries) | B2B API exists, contact seller@vignette.id |
| Bmove | On-street parking (90+ Croatian cities) | Pitch deck prepared, no public API |

## What's Next
- [ ] Redeploy to Vercel with Phase 2 changes
- [ ] Sign partner agreements (Trilix, VignetteID, Bmove)
- [ ] Implement real partner adapters as agreements come in
- [ ] Bank admin dashboard
- [ ] Authentication system (JWT passthrough from bank app)
- [ ] PostgreSQL database (Prisma) for order tracking/analytics
- [ ] Native SDK wrappers (iOS, Android)

## How to Run
```
cd Projects\marketio
npm run dev
```
Open http://localhost:3000 in your browser.

## Known Issues
- None (clean build, 0 errors)
