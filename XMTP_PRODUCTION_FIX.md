# XMTP Production Fix Summary

## Issue Description

Production was experiencing **critical 500 Internal Server Errors** on all pages (`/`, `/messages`, `/_not-found`, etc.) due to Next.js attempting to `require()` the XMTP browser SDK during server-side rendering.

### Error Pattern
```
Error: require() of ES Module /var/task/node_modules/.pnpm/@xmtp+browser-sdk@5.0.1/node_modules/@xmtp/browser-sdk/dist/index.js from /var/task/.next/server/app/page.js not supported.
Instead change the require of index.js in /var/task/.next/server/app/page.js to a dynamic import() which is available in all CommonJS modules.
```

**Error Code:** `ERR_REQUIRE_ESM`  
**Digest:** `727936594`, `1735261586`, `3985286450`, etc.

### Root Cause

1. **XMTP browser-sdk v5** is published as an **ES Module only** (no CommonJS build)
2. **Next.js 15** with App Router attempts server-side rendering of all pages
3. Previous webpack `externals` configuration was **insufficient** - Next.js still tried to bundle XMTP modules for SSR
4. The module loading occurred **before** the `'use client'` directive could take effect
5. This caused **100% failure rate** on production page loads

### Impact

- ✅ **Localhost:** Working fine (dev mode handles ES modules differently)
- ❌ **Production:** All pages returning 500 errors
- ❌ **XMTP messaging:** Completely non-functional
- ❌ **User onboarding:** Blocked by homepage failures

## Fix Applied

### 1. Updated `next.config.mjs`

**Added to `serverExternalPackages`:**
```javascript
serverExternalPackages: [
  '@hashgraph/sdk',
  '@hashgraphonline/standards-sdk',
  '@xmtp/browser-sdk',        // ← NEW
  '@xmtp/wasm-bindings'       // ← NEW
]
```

**Enhanced webpack configuration:**
```javascript
if (isServer) {
  const originalExternals = config.externals || []
  config.externals = [
    ...originalExternals,
    // Mark XMTP packages as external for server bundles
    ({ request }, callback) => {
      if (
        request === '@xmtp/browser-sdk' ||
        request === '@xmtp/wasm-bindings' ||
        request?.startsWith('@xmtp/browser-sdk/') ||
        request?.startsWith('@xmtp/wasm-bindings/')
      ) {
        return callback(null, `commonjs ${request}`)
      }
      callback()
    }
  ]
}
```

### 2. What This Does

- **`serverExternalPackages`**: Tells Next.js to **never** bundle these packages in server code
- **Webpack externals callback**: Marks XMTP imports as `commonjs` externals, preventing bundler from processing them
- **Dynamic handling**: Catches both direct imports and subpath imports
- **Production-safe**: Ensures client-only code stays client-only

### 3. Deployment

```bash
git add next.config.mjs
git commit -m "Fix XMTP ES Module loading error in production"
git push origin feature/xmtp-nervous-system
```

Vercel will automatically:
1. Detect the push
2. Build with the new config
3. Deploy to production
4. Production pages should load without 500 errors

## Testing Verification

### After Deployment, Test:

1. **Homepage:** https://trustmesh.app/
   - Should load without 500 error
   - Should show app UI

2. **Messages Page:** https://trustmesh.app/messages
   - Should load without 500 error
   - Should show "Sign in required" or conversation list (depending on auth state)

3. **Console Logs:** Check browser console
   - Should show `[XMTP Config] Enabled: true | Environment: dev` (if XMTP_ENABLED=true)
   - Should NOT show module loading errors

4. **Vercel Logs:** Check production logs
   - Should NOT contain `ERR_REQUIRE_ESM`
   - Should NOT contain `@xmtp/browser-sdk` errors

### Expected Behavior

✅ All pages load successfully  
✅ XMTP client initializes on client-side only  
✅ No server-side XMTP code execution  
✅ Messages page functional for authenticated users  

## Additional Notes

### Why This Wasn't Caught Locally

- `next dev` handles ES modules differently than production build
- Development mode uses less aggressive bundling
- Production build (`next build`) fully bundles and optimizes code
- The error only manifested in Vercel's serverless environment

### Similar Issues to Watch For

Any **client-only library** that:
- Is ES Module only
- Uses browser APIs (WebAssembly, IndexedDB, etc.)
- Has no CommonJS build

Should be added to `serverExternalPackages` and webpack externals.

### Related Files

- `lib/xmtp/client.ts` - XMTP client initialization (has `'use client'`)
- `components/xmtp/ConversationList.tsx` - Messages UI (has `'use client'`)
- `app/(tabs)/messages/page.tsx` - Messages page (has `'use client'`)
- `next.config.mjs` - Next.js configuration (fixed)

## References

- [Next.js serverExternalPackages](https://nextjs.org/docs/app/api-reference/next-config-js/serverExternalPackages)
- [Webpack Externals](https://webpack.js.org/configuration/externals/)
- [XMTP Browser SDK v5 Docs](https://github.com/xmtp/xmtp-web/tree/main/packages/browser-sdk)

---

**Fix Committed:** `ebeaa37` on `feature/xmtp-nervous-system`  
**Status:** Deployed to production (pending Vercel build)  
**Expected Resolution:** All pages functional within 5 minutes of deployment
