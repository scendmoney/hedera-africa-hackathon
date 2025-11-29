# Production Persistence Fix Summary

## Problem
Users logging in with the same email were getting **different Hedera accounts** on production, but not on localhost.

## Root Causes

### 1. Missing Environment Variable
**Issue**: `HCS22_DID_SALT` was not set in production environment  
**Impact**: Email hashing used default salt, but inconsistency wasn't the main issue  
**Fix**: Added `HCS22_DID_SALT` to Vercel production environment

### 2. Inconsistent Magic Issuer Format (PRIMARY ISSUE)
**Issue**: Magic.link returns different issuer formats across sessions:
- Sometimes: `did:ethr:0x123abc...` (hex address)
- Sometimes: `did:ethr:email@domain.com` (email-based)
- Fallback format: `did:ethr:email` (simple token)

**Impact**: 
- Different issuer formats → different DIDs after canonicalization
- Different DIDs → system thinks it's a new user
- New user → creates new Hedera account

**Fix**: 
- Always use **email as the stable identifier** when available
- Format: `email:user@domain.com` → consistent DID derivation
- Updated `app/api/hcs22/resolve/route.ts` to extract email first
- Updated `lib/util/getCanonicalDid.ts` to handle `email:` prefix

### 3. Serverless State Reset (KNOWN LIMITATION)
**Issue**: In-memory bindings Map resets on every cold start in Vercel serverless  
**Impact**: Reducer warmup happens on every request, causing delays  
**Mitigation**: 
- System already falls back to Mirror Node query by EVM address
- Mirror Node query works with email-derived DIDs
- Cache layer provides some resilience within warm function instances

## Changes Made

### Files Modified
1. **app/api/hcs22/resolve/route.ts**
   - Line 56: Use `email:${auth.email}` when email available, fallback to issuer
   - Lines 60-63: Added detailed logging for debugging
   - Lines 85, 94, 159: Pass `stableIdentifier` instead of `auth.issuer`

2. **lib/util/getCanonicalDid.ts**
   - Lines 19-25: Added `email:` prefix handling as first check
   - Ensures email-based identifiers are consistently hashed

3. **app/(tabs)/signals/page.tsx**
   - Line 30: Added missing `SendSignalsModal` import

### Environment Variables Added
```bash
HCS22_DID_SALT=5TcaG8SVryrKZaZot4KvPj/a5cq6xNSXUyzR0Jwqyeg=
```

## Testing Guide

### 1. Test DID Consistency (Localhost)
```bash
node test-canonical-did.mjs
```
Expected: All DIDs match ✅

### 2. Test Production Login
1. Open https://trustmesh.app
2. Login with email: `tonycamerobiz+demo04@gmail.com`
3. Check browser console for logs:
   ```
   [HCS22 BIND] Using stable identifier: email
   [HCS22 BIND] Auth email: tonycamerobiz+demo04@gmail.com
   [HCS22 BIND] Canonical DID: did:ethr:0x26a7e06aee1a667fd6071a6c6def68443ba18a94
   ```
4. Note the Hedera Account ID shown in UI
5. Logout and login again with same email
6. **Expected**: Same Hedera Account ID as before

### 3. Check Vercel Logs
```bash
vercel logs --follow
```
Look for:
- `[HCS22 BIND] Using stable identifier: email` ✅
- `[HCS22 BIND] Canonical DID: did:ethr:0x...` (should be consistent)
- `[ResolveOrProvision] Cache hit` or `[ResolveOrProvision] HCS reducer found` (on repeat logins)

### 4. Verify Account Persistence
- Login from different browser/device with same email
- Should get the **same Hedera account**
- Check `/me` page shows consistent account info

## What Should Work Now

✅ Same email → Same Hedera account (across sessions and devices)  
✅ Login persistence across browser sessions  
✅ Mirror Node fallback when reducer cache is cold  
✅ Proper DID canonicalization for privacy (no PII on-chain)  
✅ Signals page loads without errors  

## Known Limitations

⚠️ **Cold Start Performance**: First request after serverless cold start will be slower due to reducer warmup  
⚠️ **In-Memory State**: Bindings Map resets on cold starts, but Mirror Node fallback ensures correctness  
⚠️ **No Cross-Region Cache**: Each Vercel region maintains separate in-memory cache  

## Future Improvements

1. **Redis/Upstash Cache**: Store DID → Account mappings in persistent cache
2. **Edge Config**: Use Vercel Edge Config for fast global reads
3. **Database Persistence**: Store identity bindings in database for reliability
4. **Optimistic Resolution**: Return cached result immediately, refresh in background

## Deployment

Commit: `8cf9216`  
Branch: `feature/xmtp-nervous-system`  
Vercel: Auto-deployment triggered on push  
Environment: Production with `HCS22_DID_SALT` configured  

## Rollback Plan

If issues persist:
```bash
git revert 8cf9216
git push origin feature/xmtp-nervous-system
```

Then investigate Vercel logs for specific error patterns.
