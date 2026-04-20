# The Trifecta Stack — TrustMesh × XMTP × Tashi (+ FoxMQ)

**Version**: 1.0  
**Branch**: `v1-trifecta-stack`  
**Status**: Implementation Roadmap

---

## Executive Summary

This document defines the evolution of TrustMesh from a trust + messaging system to a complete **Computational Trust Stack** — a social operating system where trust, communication, and shared state form an integrated substrate for human and agent networks.

The Trifecta Stack consists of four integrated layers:

1. **TrustMesh** — Trust, Identity, Legitimacy (who matters and how much)
2. **XMTP** — Communication, Coordination, Agent Interface (who is talking to whom)
3. **Tashi** — Deterministic Shared State (what is true in the shared environment)
4. **FoxMQ** — Private Event & PII Layer (what must remain private stays private)

Together, they enable:
- Youth and campus networks
- Civic systems
- SMB trust economies
- Multi-agent ecosystems
- Real-world social computation

---

## 1. Overarching Narrative

The combination of TrustMesh, XMTP, and Tashi—with FoxMQ as the private event layer—forms a new class of infrastructure: a **Computational Trust Stack**.

This is not a traditional "Web3 + messaging + compute" mashup. It is an integrated **social operating system** where:

- **TrustMesh** defines **who matters and how much** (identity, trust graph, incentives)
- **XMTP** defines **who is talking to whom and what they're coordinating** (secure, wallet-native messaging)
- **Tashi** defines **what is true in the shared environment** (deterministic state machines, rooms, worlds, workflows)
- **FoxMQ** ensures **what must remain private stays private** (encrypted PII/event mesh with consensus-backed ordering)

This is the foundation for **TrustMesh v2**: not just a protocol for trust, but a full stack for governing interactions and environments through trust.

---

## 2. Core Roles of Each Layer

### TrustMesh — Trust, Identity, Legitimacy

- Contextual identity (pseudonymous but verifiable)
- Finite trust primitives (Circle of 9)
- Recognition + revocation events
- TRST incentives and value signals
- Hedera HCS ledger for integrity (non-PII)

### XMTP — Communication, Coordination, Agent Interface

- Secure, end-to-end encrypted messaging
- Human ↔ human, human ↔ agent, agent ↔ agent
- Topic-based coordination channels
- Portable inbox across apps and ecosystems

### Tashi — Deterministic Shared State

- "World engines" for rooms, groups, workflows, governance
- Deterministic compute and real-time updates
- Presence, ephemeral signals, group membership
- Simulation-grade consistency for coordination tasks

### FoxMQ — Private Event & PII Layer

- Decentralized MQTT v5 mesh using Tashi consensus
- Identical replicated message state across nodes
- Encrypted storage for PII, sensitive context, internal system events
- Auditable but non-public private message bus

---

## 3. Architectural Model — Layered View

### Layer 0: Infrastructure Anchors

- Hedera (identity, HCS proofs)
- TRST stablecoin rails (payments, rewards)
- FoxMQ PII mesh (privacy, internal events)

### Layer 1: TrustMesh

- Identity binding (Hedera, XMTP, app account)
- Trust graph + finite trust primitives
- Recognition tokens + revocations
- TRST incentives + earn mechanics
- API surface: trust, entitlements, recognition

### Layer 2: XMTP Messaging Fabric

- All users = XMTP identities
- All agents = XMTP identities
- DMs, group chats, command threads
- Control-plane events into Tashi
- Notification layer for TrustMesh & Tashi

### Layer 3: Tashi Shared State Engine

- World objects (rooms, missions, groups)
- Deterministic state transitions
- Presence + ephemeral activity
- Governance & workflow state machines
- Derived views (summaries, sync snapshots)

### Layer 4: Privacy & Internal Coordination (FoxMQ)

- PII storage for onboarding events
- Consent logs, device data, usage telemetry
- Sensitive agent-to-agent coordination
- Internal analytics feeds

### Layer 5: Client Applications

- TrustMesh Messenger / Scend Messenger
- Youth/Campus/Civic network apps
- SMB dashboards + agent consoles
- Governance/mission UIs

---

## 4. Three Flagship Product Experiences Enabled by the Trifecta

### A. Trust Worlds (Youth, Campus, Civic)

- Students/citizens have TrustMesh identities
- Chat + coordination flows through XMTP
- Tashi manages rooms, missions, unlocks, governance
- FoxMQ protects all PII
- TrustMesh recognition unlocks new opportunities, roles, and experiences

### B. SMB Trust Economies

- Firms earn trust via delivery quality + payment reliability
- Agents communicate via XMTP
- Tashi simulates credit lines, risk models, task flows
- TRST acts as working capital + incentive engine
- FoxMQ protects invoices, KYC, financial metadata

### C. Agent Mesh

- Every agent is an XMTP identity
- Agents read trust context from TrustMesh
- Tashi governs workflows & shared state
- FoxMQ stores sensitive agent data & telemetry
- Agents cooperate/coordinate as if they were people

---

## 5. High-Level Data Flow

### Onboarding

1. User signs up → PII stored in FoxMQ
2. TrustMesh creates pseudonymous identity + Hedera record
3. XMTP identity is bound
4. Tashi adds user to correct world(s)

### Messaging → Trust → State

1. Message in XMTP thread
2. Backend XMTP handler adds TrustMesh context
3. Event sent to Tashi for world-state update
4. TrustMesh optionally updates recognition/trust
5. FoxMQ logs sensitive details privately

### Recognition → Rewards → Unlocks

1. Recognition issued → TrustMesh logs event
2. TRST reward distributed
3. XMTP notifies recipient
4. Tashi modifies world (rooms, missions, roles)
5. FoxMQ logs the full internal audit trail

---

## 6. Implementation Phasing

### Phase 1 — TrustMesh + XMTP Integration

- Bind identities
- Inject trust metadata into messaging
- Basic coordination flows

**Status**: ✅ COMPLETE (current implementation)

### Phase 2 — Add Tashi as State Engine

- Presence, room membership, quick sync
- Missions, workflows, lightweight governance

**Status**: 🔨 IN PROGRESS (v1 branch)

### Phase 3 — Introduce FoxMQ for PII

- Move PII off-chain and out of databases
- Introduce private MQTT channels per tenant

**Status**: 📋 PLANNED

### Phase 4 — Agent Mesh

- Agents become first-class XMTP participants
- TrustMesh provides legitimacy & constraints
- Tashi runs multi-agent workflows

**Status**: 📋 PLANNED

---

## 7. Why This Stack Works

### TrustMesh gives you:

- Contextual identity
- Verifiable trust
- Incentive mechanisms (TRST)

### XMTP gives you:

- Sovereign communication
- Cross-app portability
- Human/agent messaging fabric

### Tashi gives you:

- Deterministic shared state
- Real-time presence & environment
- Simulation-grade coordination

### FoxMQ gives you:

- Private event mesh
- Secure PII storage
- Audit-grade internal visibility

**Combined**, they form a new infrastructure layer for human and agent networks, suitable for:

- Campuses
- Youth organizations
- Civic ecosystems
- SMB networks
- Autonomous agent simulations

---

## 8. Current Implementation Status

### What Exists (v1 branch baseline)

- ✅ TrustMesh Layer 1: Identity, trust graph, recognition, TRST, HCS integration
- ✅ XMTP Layer 2: Messaging, conversations, E2EE, human ↔ human communication
- ✅ Infrastructure: Next.js app, SignalsStore, Mirror Node ingestion, Registry

### What's Being Built (v1 branch goals)

- 🔨 Tashi Layer 3: State engine, rooms, presence, workflows
- 🔨 Enhanced XMTP → Trust integration: Context injection, notifications
- 🔨 Unified data flows: Message → Trust → State → Notification

### What's Planned (future)

- 📋 FoxMQ Layer 4: Private event mesh, PII migration
- 📋 Agent Mesh: Agents as XMTP identities, workflow automation
- 📋 Advanced governance: Voting, role management, mission systems

---

## 9. Technical Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                          │
│  (Next.js + React + TrustMesh Messenger)                        │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────┐      ┌──────────────────────────────┐
│   XMTP Messaging Layer    │◄────►│   ContextEngine v2           │
│   (Layer 2)               │      │   (Intelligence Hub)          │
│                           │      │                               │
│  • E2EE Conversations     │      │  • Message → Trust Events     │
│  • Thread Management      │      │  • Trust → Suggestions        │
│  • Typing Indicators      │      │  • Recognition Prompts        │
│  • Agent Communication    │      │  • Payment Shortcuts          │
└───────────┬───────────────┘      └───────────┬──────────────────┘
            │                                  │
            │           ScendIdentity          │
            │         (HCS-22 Binding)         │
            │                                  │
            ▼                                  ▼
┌────────────────────────────────────────────────────────────────┐
│                   SignalsStore v2 (Unified State)              │
│                                                                 │
│  • MESSAGE events (XMTP)                                        │
│  • TRUST events (TrustMesh)                                     │
│  • STATE events (Tashi)                                         │
│  • PRIVATE events (FoxMQ)                                       │
└────┬────────────────┬────────────────┬────────────────┬────────┘
     │                │                │                │
     ▼                ▼                ▼                ▼
┌─────────┐    ┌─────────────┐  ┌──────────┐    ┌──────────┐
│  XMTP   │    │  TrustMesh  │  │  Tashi   │    │  FoxMQ   │
│  P2P    │    │  (Hedera)   │  │  State   │    │  Private │
│ Network │    │   HCS/HTS   │  │  Engine  │    │   Mesh   │
└─────────┘    └─────────────┘  └──────────┘    └──────────┘
```

---

## 10. Getting Started with v1 Branch

### Prerequisites

- Node.js 20+ with Corepack (pnpm enabled)
- Hedera testnet account
- Magic.link account for wallet integration
- XMTP development environment

### Setup

```bash
# Clone and switch to v1 branch
git checkout v1-trifecta-stack

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Hedera/XMTP credentials

# Run development server
pnpm dev
```

### Key Documentation

- [Implementation Plan](../plan-de8cd259.md) — Phased development roadmap
- [Current Architecture](./ARCHITECTURE.md) — Existing system overview
- [XMTP Integration Spec](./XMTP_INTEGRATION_SPEC.md) — Messaging layer details
- [Data Model](./TRUSTMESH_DATA_MODEL.md) — Trust graph and recognition system

---

## 11. Contributing to v1 Branch

This branch is dedicated to building out the Trifecta Stack. Priority areas:

1. **Tashi Integration** — Rooms, presence, state management
2. **Enhanced Data Flows** — Message → Trust → State pipelines
3. **Agent Infrastructure** — Agent identity and communication foundations
4. **FoxMQ Preparation** — PII migration planning, encrypted storage design

See the implementation plan for detailed task breakdown and sequencing.

---

## 12. References

- **Trifecta Stack Vision Doc**: `/docs/TM+XMPT+Tashi.pdf`
- **Hedera Documentation**: https://docs.hedera.com
- **XMTP Protocol**: https://xmtp.org
- **Tashi Framework**: [Research and evaluation in progress]
- **FoxMQ**: [Research and evaluation in progress]

---

**This is the cleanest, most scalable architecture for TrustMesh v2 and the emerging Scend ecosystem.**
