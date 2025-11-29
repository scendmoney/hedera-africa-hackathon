# Issuer Studio MVP - Developer Notes

**Status:** ✅ Implementation Complete  
**Branch:** `feature/issuer-studio-mvp`  
**Date:** 2025-11-29

---

## Quick Start

### Accessing the Interface
```bash
pnpm run dev
# Navigate to http://localhost:3000/issuer
```

### Environment Configuration
The Issuer Studio uses existing TrustMesh environment variables:
- `NEXT_PUBLIC_HEDERA_NETWORK` - Network (testnet/mainnet)
- `NEXT_PUBLIC_ISSUER_ACCOUNT_ID` - Issuer account (defaults to `0.0.4851773`)
- All HCS topic IDs from topic registry

### Issuer Account Configuration
To change the issuer account, add to `.env.local`:
```bash
NEXT_PUBLIC_ISSUER_ACCOUNT_ID=0.0.YOUR_ACCOUNT
```

---

## Implementation Summary

### Files Created
```
app/issuer/page.tsx                     - Main UI page
app/api/issuer/submit/route.ts          - Submission API endpoint
components/issuer/SignalMintForm.tsx    - Form component
components/issuer/EventLog.tsx          - Event log component
lib/issuer/types.ts                     - Type definitions
lib/issuer/envelopeBuilder.ts           - Envelope builder
docs/ISSUER_STUDIO_DISCOVERY.md         - Discovery document
```

### Architecture

**Flow:**
1. User fills `SignalMintForm` with template ID, recipient, fill text, note, evidence
2. Form validates inputs client-side
3. On submit, `buildSignalMintEnvelope()` constructs HCS envelope
4. Envelope POSTs to `/api/issuer/submit`
5. API routes to correct topic via registry
6. Hedera SDK submits to HCS
7. Success/failure updates `EventLog` component

**Key Design Decisions:**
- **Web-first:** Next.js route instead of Tauri desktop (can add Electron later)
- **SIGNAL_MINT only:** MVP focuses on recognition signals; easy to extend
- **Timestamp nonce:** Uses `Date.now()` for simplicity (monotonic enough for MVP)
- **No auth:** MVP logs issuer submissions but doesn't enforce RBAC (add later)
- **Client-side validation:** Fast feedback before hitting API
- **Server-side validation:** `envelopeBuilder.ts` validates account IDs, URL format, note length

---

## Usage Guide

### Creating a SIGNAL_MINT Message

**Required Fields:**
- **Template ID** - Without `grit.` prefix or `@1` suffix (e.g., `peer_mentor`)
- **Recipient Account ID** - Format `0.0.xxxxx`
- **Fill Text** - Recognition message content

**Optional Fields:**
- **Note** - Max 120 characters
- **Evidence** - URL (http/https/ipfs)

**Example:**
```
Template ID: community_builder
Recipient: 0.0.12345
Fill: "Led campus sustainability initiative with 50+ student participants"
Note: "Fall 2024 semester"
Evidence: https://example.com/evidence.pdf
```

**Resulting Envelope:**
```json
{
  "type": "RECOGNITION_MINT",
  "from": "0.0.4851773",
  "nonce": 1732886400000,
  "ts": 1732886400,
  "payload": {
    "t": "signal.mint@1",
    "def_id": "grit.community_builder@1",
    "to": "0.0.12345",
    "fill": "Led campus sustainability initiative with 50+ student participants",
    "note": "Fall 2024 semester",
    "evidence": "https://example.com/evidence.pdf"
  }
}
```

---

## Testing

### Manual Test Checklist
- [ ] Navigate to `/issuer` route
- [ ] Page loads with form on left, empty log on right
- [ ] Fill all required fields
- [ ] Submit shows "Submitting to HCS..." button state
- [ ] Pending event appears in log immediately
- [ ] Success updates event to "Confirmed" with sequence number
- [ ] Error handling displays failed status with error message
- [ ] Multiple submissions work correctly
- [ ] Validation catches invalid account IDs
- [ ] Validation catches missing required fields
- [ ] Validation catches note > 120 chars
- [ ] Validation catches invalid URLs

### Integration Test
To verify end-to-end HCS submission:
1. Submit a real message via UI
2. Note the sequence number from event log
3. Query Hedera mirror node for topic messages
4. Confirm message appears with matching sequence number

**Mirror Node Query:**
```bash
curl "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.TOPIC_ID/messages?sequencenumber=SEQ_NUM"
```

---

## Extending the MVP

### Adding New Message Types

**1. Add type to `lib/issuer/types.ts`:**
```typescript
export type MessageType = 
  | 'RECOGNITION_MINT'
  | 'TRUST_ALLOCATE'  // <-- New type
```

**2. Create envelope builder in `lib/issuer/envelopeBuilder.ts`:**
```typescript
export function buildTrustAllocateEnvelope(
  issuerAccountId: string,
  payload: TrustAllocatePayload
): TrustAllocateEnvelope { ... }
```

**3. Create form component `components/issuer/TrustAllocateForm.tsx`:**
```typescript
export function TrustAllocateForm({ issuerAccountId, onSubmit, isSubmitting }) { ... }
```

**4. Add message type selector to `app/issuer/page.tsx`:**
```typescript
const [messageType, setMessageType] = useState<MessageType>('RECOGNITION_MINT')
{messageType === 'RECOGNITION_MINT' && <SignalMintForm ... />}
{messageType === 'TRUST_ALLOCATE' && <TrustAllocateForm ... />}
```

**5. Update API route in `app/api/issuer/submit/route.ts`:**
```typescript
case 'TRUST_ALLOCATE':
  topicId = topics.trust
  break
```

### Adding Authorization

**Option 1: API Key**
```typescript
// app/api/issuer/submit/route.ts
const apiKey = req.headers.get('x-api-key')
if (apiKey !== process.env.ISSUER_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Option 2: Session-based**
```typescript
// Use existing TrustMesh auth
import { getServerSession } from '@/lib/auth/session'
const session = await getServerSession()
if (!session?.user?.roles?.includes('issuer')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

### Adding Template Library

Create `lib/issuer/templates.ts`:
```typescript
export const SIGNAL_TEMPLATES = [
  { id: 'peer_mentor', label: 'Peer Mentor', maxFill: 280 },
  { id: 'community_builder', label: 'Community Builder', maxFill: 280 },
  ...
]
```

Update `SignalMintForm.tsx` to use dropdown:
```typescript
<select value={templateId} onChange={...}>
  {SIGNAL_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
</select>
```

---

## Known Limitations (MVP v1)

- **Single message type:** Only SIGNAL_MINT supported
- **No template browser:** Must know template IDs
- **No batch submission:** One message at a time
- **No mirror confirmation:** Shows HCS response but doesn't poll mirror node
- **No historical view:** Event log is session-based (clears on refresh)
- **Hardcoded issuer:** Uses env var or default, not per-user
- **No message preview:** Envelope shown only in dev console
- **Basic validation:** No template-specific rules (e.g., max fill length)

---

## Production Considerations

### Before Deploying to Production

**Security:**
- [ ] Add issuer authorization (API key or session-based)
- [ ] Add rate limiting to submission endpoint
- [ ] Add audit logging to database
- [ ] Restrict `/issuer` route to authorized users
- [ ] Validate issuer account has sufficient HBAR balance

**Monitoring:**
- [ ] Add structured logging with request IDs
- [ ] Track submission success/failure rates
- [ ] Alert on repeated failures
- [ ] Monitor topic sequence gaps
- [ ] Track Hedera API latency

**Database:**
- [ ] Store submissions in database for audit trail
- [ ] Add `issuer_submissions` table with envelope + result
- [ ] Link to user sessions for accountability
- [ ] Add indexes for querying by timestamp, issuer, type

**UX Enhancements:**
- [ ] Add message preview before submission
- [ ] Show estimated HBAR cost
- [ ] Persist event log across sessions
- [ ] Add export to JSON/CSV
- [ ] Add bulk upload from CSV

---

## Troubleshooting

### "Invalid envelope: missing type field"
- Check envelope builder is producing valid structure
- Verify `buildSignalMintEnvelope()` returns complete object

### "Recognition topic not configured in registry"
- Verify `NEXT_PUBLIC_TOPIC_RECOGNITION` in `.env.local`
- Check `lib/hcs2/registry.ts` for topic config

### "Hedera submission failed"
- Check `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` in `.env.local`
- Verify operator account has sufficient HBAR
- Check network is correct (`testnet` vs `mainnet`)

### TypeScript errors on build
```bash
pnpm run build
```
- All types are properly exported from `lib/issuer/types.ts`
- No circular dependencies

### Form not submitting
- Check browser console for validation errors
- Verify API endpoint is responding at `/api/issuer/submit`
- Check network tab for HTTP errors

---

## Future Roadmap

### v2 Features
- [ ] Support TRUST_ALLOCATE, CONTACT_REQUEST, PROFILE_UPDATE
- [ ] Template library with dropdown selector
- [ ] Batch message upload (CSV import)
- [ ] Message preview with syntax highlighting
- [ ] Export envelope as JSON file
- [ ] Historical message browser (from database)

### v3 Features
- [ ] Desktop/Electron packaging
- [ ] Multi-issuer support with RBAC
- [ ] Template versioning and management UI
- [ ] Advanced validation rules per template
- [ ] Mirror node confirmation polling
- [ ] Real-time HCS feed viewer

---

## Support

For questions or issues:
1. Check `docs/ISSUER_STUDIO_DISCOVERY.md` for architecture overview
2. Review `docs/HCS22_IMPLEMENTATION.md` for HCS details
3. See existing HCS flows in `app/api/recognition/send/route.ts`

---

**Last Updated:** 2025-11-29  
**Maintainer:** TrustMesh Engineering Team
