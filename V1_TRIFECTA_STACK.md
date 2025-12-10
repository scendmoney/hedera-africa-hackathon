# v1-trifecta-stack Branch — Quick Reference

**Branch**: `v1-trifecta-stack`  
**Repository**: https://github.com/scendmoney/hedera-africa-hackathon  
**Status**: Active Development — Trifecta Stack Implementation

---

## What is the Trifecta Stack?

A **Computational Trust Stack** that integrates:

1. **TrustMesh** (Layer 1) — Trust, Identity, Legitimacy
2. **XMTP** (Layer 2) — Communication, Coordination
3. **Tashi** (Layer 3) — Deterministic Shared State
4. **FoxMQ** (Layer 4) — Private Event & PII Layer

Together, they create a **social operating system** for trust-based networks.

---

## Current Status

### ✅ What Works Now

- **TrustMesh Layer 1**: Identity binding (HCS-22), trust graph, recognition tokens, TRST incentives
- **XMTP Layer 2**: E2EE messaging, conversations, human ↔ human communication
- **Infrastructure**: Next.js app, SignalsStore, Mirror Node ingestion

### 🔨 What We're Building (Phase 2)

- **Tashi Layer 3**: Deterministic state engine for rooms, presence, workflows
- **Enhanced Integration**: Message → Trust → State data flows
- **Unified Events**: SignalsStore extension for MESSAGE + TRUST + STATE events

### 📋 What's Planned (Phase 3+)

- **FoxMQ Layer 4**: Private event mesh, PII migration
- **Agent Mesh**: Agents as XMTP identities, workflow automation

---

## Key Documents

- **[Trifecta Stack Architecture](docs/TRIFECTA_STACK_ARCHITECTURE.md)** — Full system design
- **[Implementation Plan](plan-de8cd259.md)** — Phased roadmap with technical details
- **[Vision Document](docs/TM+XMPT+Tashi.pdf)** — Original architecture specification
- **[Current Architecture](docs/ARCHITECTURE.md)** — Existing system overview
- **[XMTP Integration](docs/XMTP_INTEGRATION_SPEC.md)** — Messaging layer specs

---

## Quick Start

```bash
# Switch to v1 branch
git checkout v1-trifecta-stack

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with Hedera/XMTP credentials

# Run development server
pnpm dev
```

---

## Implementation Phases

### Phase 1: TrustMesh + XMTP Enhancement ✅ COMPLETE

- Identity binding via HCS-22
- Trust metadata in messaging context
- Basic coordination flows

### Phase 2: Tashi State Engine 🔨 IN PROGRESS

**Goals:**
- Add rooms, presence tracking, missions
- Implement deterministic state transitions
- Route XMTP events → Tashi state updates
- Build governance controls (voting, roles)

**Key Deliverables:**
- `lib/tashi/` module with client and types
- Room creation/membership UI
- Presence indicators in contact lists
- Mission/task boards

### Phase 3: FoxMQ Private Layer 📋 PLANNED

**Goals:**
- Move PII off-chain to encrypted storage
- Create private MQTT channels per tenant
- Build internal analytics and audit trails

**Key Deliverables:**
- FoxMQ node deployment
- PII migration (onboarding, consent, telemetry)
- Admin dashboards with encrypted viewer

### Phase 4: Agent Mesh 📋 PLANNED

**Goals:**
- Enable agents as XMTP identities
- Connect agents to Tashi workflows
- Use TrustMesh for agent legitimacy

**Key Deliverables:**
- Agent registration system
- Agent ↔ human/agent messaging
- Agent governance and accountability

---

## Data Flow Patterns

### Onboarding
```
User signs up → FoxMQ (PII) → TrustMesh (identity) → XMTP (bind) → Tashi (add to world)
```

### Messaging → Trust → State
```
XMTP message → ContextEngine (scan) → Trust event → Tashi state update → FoxMQ (audit)
```

### Recognition → Rewards → Unlocks
```
Recognition → TRST reward → XMTP notify → Tashi modify world → FoxMQ audit trail
```

---

## Architecture Layers

```
Layer 5: Client Applications
  └─ TrustMesh Messenger, Mission UIs, Agent Consoles

Layer 4: FoxMQ (Privacy & Internal Coordination)
  └─ PII storage, Consent logs, Agent telemetry

Layer 3: Tashi (Shared State Engine)
  └─ Rooms, Missions, Presence, Governance

Layer 2: XMTP (Messaging Fabric)
  └─ E2EE messaging, Notifications, Agent interface

Layer 1: TrustMesh (Trust & Identity)
  └─ Identity binding, Trust graph, Recognition, TRST

Layer 0: Infrastructure Anchors
  └─ Hedera (HCS/HTS), TRST rails, FoxMQ mesh
```

---

## Three Flagship Products

### A. Trust Worlds (Youth, Campus, Civic)
- Students/citizens build trust networks
- Chat flows through XMTP
- Tashi manages rooms and missions
- Recognition unlocks opportunities

### B. SMB Trust Economies
- Firms earn trust via quality delivery
- Agents communicate via XMTP
- Tashi simulates credit and workflows
- TRST acts as working capital

### C. Agent Mesh
- Agents as XMTP identities
- Trust context constrains agent actions
- Tashi governs multi-agent workflows
- FoxMQ protects agent data

---

## Contributing

Priority areas for v1 development:

1. **Tashi Integration** — Build rooms, presence, state management
2. **Enhanced Data Flows** — Implement Message → Trust → State pipelines
3. **Testing** — Add Tashi state machine tests, integration tests
4. **Documentation** — Update architecture docs as features land

---

## Technical Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Hedera HCS/HTS (testnet)
- **Messaging**: XMTP v3 (E2EE P2P)
- **State**: Tashi deterministic engine (TBD: Rust/WASM or TypeScript MVP)
- **Privacy**: FoxMQ encrypted mesh (TBD: full MQTT v5 or Redis/Upstash lite)
- **Identity**: Magic.link + HCS-22 binding

---

## Links

- **GitHub Repo**: https://github.com/scendmoney/hedera-africa-hackathon
- **Branch**: https://github.com/scendmoney/hedera-africa-hackathon/tree/v1-trifecta-stack
- **Hedera Docs**: https://docs.hedera.com
- **XMTP Protocol**: https://xmtp.org

---

**This is the foundation for TrustMesh v2: a full stack for governing interactions and environments through trust.**
