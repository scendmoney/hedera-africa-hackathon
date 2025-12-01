# Issuer Studio MVP - Discovery Report

**Date:** 2025-11-29  
**Mission:** Build a TrustMesh Issuer Studio MVP that lets an issuer select HCS topics, build structured message envelopes, sign & publish to Hedera, and see event logs.

---

## 1. Repository Structure

### TrustMesh Main App
- **Location:** `/home/tonycamero/code/TrustMesh_hackathon`
- **Type:** Next.js App Router
- **Key Directories:**
  - `app/` - Next.js app router with `(tabs)`, `(dashboard)`, `api/` routes
  - `lib/` - Core utilities, HCS clients, services, stores
  - `components/` - React components
  - `docs/` - Architecture documentation
  - `scripts/` - Setup and deployment scripts

### Cloned HOL Desktop (Issuer Studio Source)
- **Location:** `/home/tonycamero/code/TrustMesh_hackathon/issuer-studio-mvp/`
- **Type:** Tauri desktop app (React + Rust)
- **Key Components:**
  - `src/renderer/` - React frontend
  - `src-tauri/` - Rust backend with HCS bridge
  - Contains HCS10 context, agent store, block tester tools

**Decision:** We will **NOT** use the Tauri desktop shell for MVP. Instead, we'll build a web-based `/issuer` route in the Next.js app and potentially reference HOL Desktop patterns for HCS message construction.

---

## 2. HCS Topic Registry & Client Infrastructure

### Topic Configuration
**File:** `lib/registry/serverRegistry.ts`

TrustMesh has a validated, frozen topic registry with:
- **contacts** - `NEXT_PUBLIC_TOPIC_CONTACT`
- **trust** - `NEXT_PUBLIC_TOPIC_TRUST`
- **profile** - `NEXT_PUBLIC_TOPIC_PROFILE`
- **recognition** - `NEXT_PUBLIC_TOPIC_RECOGNITION`
- **signal** - `NEXT_PUBLIC_TOPIC_SIGNAL`
- **system** - (derived from signal topic)

Additional optional topics:
- `recognition_genz`
- `recognition_african`

**Access Pattern:**
```typescript
import { topics } from '@/lib/registry/serverRegistry'
const profileTopic = topics().profile
```

### HCS Client Infrastructure
**Key Files:**
- `lib/hedera/serverClient.ts` - Server-side Hedera client
- `packages/hedera/ServerHederaClient.ts` - Core HCS submission logic
- `app/api/hcs/submit/route.ts` - Existing HCS submission endpoint
- `lib/services/HCSFeedService.ts` - Feed ingestion service
- `lib/ingest/ingestor.ts` - Mirror node ingestion
- `app/providers/BootHCSClient.tsx` - Client-side HCS initialization

**Existing Submission Flow:**
1. Client builds envelope
2. POST to `/api/hcs/submit`
3. Server validates, signs, submits to topic via Hedera SDK
4. Mirror node ingestion picks up confirmed messages

---

## 3. Message Envelope Standards

### Canonical Event Types
**File:** `lib/hcs/canonical-events.ts`

Defines structured envelope builders for:
- `PROFILE_UPDATE`
- `CONTACT_ADD`
- `TRUST_ALLOCATE`
- `SIGNAL_MINT`
- `RECOGNITION_MINT`
- System messages

**Example Envelope Structure:**
```typescript
{
  type: 'SIGNAL_MINT',
  payload: {
    // Message-specific fields
  },
  timestamp: ISO8601,
  signature: '...',
  // Additional metadata
}
```

### Signing Infrastructure
- Uses Magic wallet integration (`lib/services/MagicWalletService.ts`)
- Hedera keys from environment (`HEDERA_OPERATOR_ID`, `HEDERA_OPERATOR_KEY`)
- Session-based identity (`lib/identity/ScendIdentity.ts`)

---

## 4. Existing Similar Flows to Reuse

### Signal Minting
**File:** `components/signals/MintSignalFlow.tsx`
- User-facing signal creation UI
- Form validation
- Envelope construction
- HCS submission via API

### Recognition System
**Files:**
- `app/api/recognition/create/route.ts` - Create recognition
- `app/api/recognition/send/route.ts` - Send to HCS
- `lib/services/HCSRecognitionService.ts` - Recognition-specific logic

### Trust Allocation
**File:** `app/api/trust/allocate/route.ts`
- Builds TRUST_ALLOCATE envelope
- Validates allocation rules
- Submits to trust topic

**Reuse Strategy:** The Issuer Studio MVP can follow similar patterns:
1. Build envelope utility functions
2. Form validation
3. POST to submission endpoint
4. Show local confirmation + eventual mirror node confirmation

---

## 5. HOL Desktop Code - What We'll Reference

### Relevant Components from `issuer-studio-mvp/`
- **HCS Bridge:** `src-tauri/resources/hcs10-bridge.js` - Low-level HCS message construction
- **Block Tester:** `src/renderer/stores/blockTesterStore.ts` - Template-based message builder
- **Inscription Logic:** `src-tauri/bridge/inscriber-helpers.ts` - Message formatting

### What We'll Ignore for MVP
- Tauri-specific Rust code
- Desktop window management
- Local agent persistence
- Complex inscription job queue

---

## 6. Architecture Documents

### Key References
- `docs/HCS22_IMPLEMENTATION.md` - HCS v2.2 architecture
- `docs/ARCHITECTURE.md` - Overall system design
- `docs/02-TECHNICAL-ARCHITECTURE.md` - Technical deep dive
- `TRUSTMESH_ARCHITECTURE_MAP.md` - Component relationships
- `docs/HCS22_QUICKSTART.md` - Quick reference for HCS operations

### Message Types Documented
- `SIGNAL_MINT` - Signals feed
- `TRUST_ALLOCATE` - Trust relationships
- `PROFILE_UPDATE` - Profile changes
- `RECOGNITION_MINT` - Recognition NFTs
- `CONTACT_ADD` - Contact management

---

## 7. MVP Scope Definition

### What We'll Build
**Route:** `/issuer` (Next.js app route under `app/issuer/`)

**Components:**
1. **IssuerStudioLayout** - Shell with left form + right event log
2. **TopicSelector** - Dropdown from topic registry
3. **MessageTypeSelector** - Start with SIGNAL_MINT only
4. **MessageForm** - Dynamic fields based on message type
5. **EventLog** - Table showing submitted messages

**Data Flow:**
```
User fills form
  ↓
Build envelope (lib/issuer/buildSignalMintEnvelope.ts)
  ↓
POST /api/issuer/submit
  ↓
Server validates + signs + submits to HCS
  ↓
Success → Add to local event log
  ↓
(Optional) Mirror node confirms → Update event log
```

### What We Won't Build in v1
- Multi-topic batch operations
- Template library
- Complex validation rules
- Desktop/Electron packaging
- Advanced ingestion monitoring
- Historical message browser

---

## 8. Implementation Strategy

### Phase 1: Routing & Shell (Quick)
- Create `app/issuer/page.tsx`
- Basic layout with form left, log right
- No functionality yet

### Phase 2: Topic & Message Type Selection
- Wire topic registry into dropdown
- Hardcode SIGNAL_MINT as only supported type for v1

### Phase 3: Envelope Builder
- Create `lib/issuer/buildSignalMintEnvelope.ts`
- Reference existing `lib/hcs/canonical-events.ts` patterns
- Accept form inputs, return valid envelope

### Phase 4: Submission API
- Create `app/api/issuer/submit/route.ts`
- Reuse Hedera client infrastructure
- Validate, sign, submit to selected topic

### Phase 5: Event Log
- Local React state for submitted messages
- Table with: timestamp, topic, type, payload summary
- Optional: poll for mirror node confirmation

---

## 9. Files We'll Create

### New Files
```
app/issuer/page.tsx                      - Main Issuer Studio page
lib/issuer/buildSignalMintEnvelope.ts    - Envelope constructor
lib/issuer/types.ts                      - TypeScript interfaces
app/api/issuer/submit/route.ts           - Submission endpoint
components/issuer/IssuerForm.tsx         - Form component
components/issuer/EventLog.tsx           - Event log table
docs/ISSUER_STUDIO_PLAN.md               - Technical plan
docs/ISSUER_STUDIO_DEV_NOTES.md          - Developer notes
```

### Files We'll Modify
```
None initially - new feature branch keeps existing code intact
```

---

## 10. Environment Variables Required

Already configured in TrustMesh:
```bash
NEXT_PUBLIC_TOPIC_CONTACT=0.0.xxxxx
NEXT_PUBLIC_TOPIC_TRUST=0.0.xxxxx
NEXT_PUBLIC_TOPIC_PROFILE=0.0.xxxxx
NEXT_PUBLIC_TOPIC_RECOGNITION=0.0.xxxxx
NEXT_PUBLIC_TOPIC_SIGNAL=0.0.xxxxx
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302...
HEDERA_NETWORK=testnet
```

No additional environment variables needed for MVP.

---

## 11. Next Steps

1. ✅ **Discovery Complete**
2. → Create `docs/ISSUER_STUDIO_PLAN.md` with technical design
3. → Create feature branch `feature/issuer-studio-mvp`
4. → Implement routing + shell
5. → Wire topic selection
6. → Build envelope constructor
7. → Create submission endpoint
8. → Implement event log
9. → Test end-to-end
10. → Document in `docs/ISSUER_STUDIO_DEV_NOTES.md`

---

## Summary

**TrustMesh has robust HCS infrastructure.** We can build the Issuer Studio MVP as a new `/issuer` route that:
- Reuses existing topic registry (`lib/registry/serverRegistry.ts`)
- Follows existing envelope patterns (`lib/hcs/canonical-events.ts`)
- Submits via existing Hedera client infrastructure
- Displays submitted messages in a simple event log

**The HOL Desktop code provides reference patterns but we won't directly integrate the Tauri shell.** Instead, we'll build a web-first MVP and can consider desktop packaging in v2.

**Ready to proceed with technical plan.**
