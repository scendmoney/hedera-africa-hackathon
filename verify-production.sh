#!/bin/bash

echo "🔍 TrustMesh Production Verification"
echo "===================================="
echo ""

# Check deployment status
echo "📦 Checking Vercel deployment status..."
vercel ls | head -10
echo ""

# Check environment variables
echo "🔧 Verifying critical environment variables..."
echo "Checking HCS22_DID_SALT in production..."
vercel env ls | grep HCS22_DID_SALT
echo ""

# Show recent logs
echo "📋 Recent Vercel logs (last 20 lines)..."
echo "Looking for identity resolution patterns..."
vercel logs --limit 20 | grep -E "\[HCS22|Auth\]|BIND|email" || echo "No recent HCS22 logs found"
echo ""

echo "✅ Verification complete"
echo ""
echo "Next steps:"
echo "1. Test login at https://trustmesh.app"
echo "2. Check browser console for: '[HCS22 BIND] Using stable identifier: email'"
echo "3. Verify same account ID on repeated logins"
echo ""
echo "For live monitoring:"
echo "  vercel logs --follow"
