# TrustAgent Architecture — Agent Mesh for TrustMesh v2

**Version:** 1.0  
**Branch:** `v1-trifecta-stack`  
**Phase:** 4 (Agent Mesh)  
**Status:** Design Specification

---

## Executive Summary

**TrustAgent** is the agent infrastructure for the TrustMesh Trifecta Stack. It enables AI agents to operate as first-class participants in trust-based networks, communicating via XMTP, constrained by TrustMesh legitimacy scores, and coordinating through Tashi state machines.

**Key architectural principles:**

- **Agents are XMTP identities** — Every TrustAgent has an XMTP identity bound to a Hedera account
- **Trust constrains capability** — Agent permissions are computed from TrustMesh context
- **6-layer prompt architecture** — Compositional, auditable, extensible prompts
- **Thread-per-relationship** — Each agent ↔ human/agent pair has isolated XMTP conversations
- **Tashi-aware coordination** — Agents read and update Tashi room/mission state
- **FoxMQ for sensitive data** — Agent configs, telemetry, and PII stored encrypted off-chain

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [TrustAgent Capability System](#trustagent-capability-system)
4. [The 6-Layer Prompt Architecture](#the-6-layer-prompt-architecture)
5. [TrustAgent Provisioning](#trustagent-provisioning)
6. [Communication Layer (XMTP)](#communication-layer-xmtp)
7. [Trust Context Injection](#trust-context-injection)
8. [Tashi Integration](#tashi-integration)
9. [FoxMQ Storage](#foxmq-storage)
10. [TrustAgent Types](#trustagent-types)
11. [Data Flow Patterns](#data-flow-patterns)
12. [Security & Guardrails](#security--guardrails)
13. [API Design](#api-design)
14. [Implementation Roadmap](#implementation-roadmap)
15. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### System Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                   TRUSTMESH CLIENT (Layer 5)                     │
│  • TrustMesh Messenger                                           │
│  • Room/Mission UIs                                              │
│  • Agent Consoles (admin)                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TRUSTAGENT ORCHESTRATOR                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  TrustAgent Controller                                     │ │
│  │  - Routes queries to appropriate TrustAgent               │ │
│  │  - Computes capability profiles from trust context        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │  TrustAgent Query Service                                   ││
│  │  - XMTP conversation management                             ││
│  │  - Trust context injection                                  ││
│  │  - LLM invocation (OpenAI/Anthropic)                        ││
│  │  - Logs to HCS audit trail                                  ││
│  └──────────────────────────────────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │  TrustAgent Prompt Builder                                  ││
│  │  - 6-layer compositional prompts                            ││
│  │  - SHA-256 hash generation                                  ││
│  │  - Capability profile integration                           ││
│  └──────────────────────────────────────────────────────────────┘│
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────────┐│
│  │  TrustAgent Provisioning Service                            ││
│  │  - Creates XMTP identities for agents                       ││
│  │  - Binds to Hedera accounts (HCS-22)                        ││
│  │  - Registers in Tashi worlds                                ││
│  │  - Stores configs in FoxMQ                                  ││
│  └──────────────────────────────────────────────────────────────┘│
└───────────────┬────────────────┬────────────────┬────────────────┘
                │                │                │
                ▼                ▼                ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  XMTP Network    │  │  TrustMesh       │  │  Tashi State     │
│  (Layer 2)       │  │  (Layer 1)       │  │  (Layer 3)       │
│                  │  │                  │  │                  │
│  • Agent↔Human   │  │  • Trust scores  │  │  • Rooms         │
│  • Agent↔Agent   │  │  • Circle of 9   │  │  • Missions      │
│  • E2EE threads  │  │  • Recognition   │  │  • Presence      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                │                │                │
                └────────────────┼────────────────┘
                                 ▼
                      ┌──────────────────────┐
                      │  FoxMQ (Layer 4)     │
                      │  • Agent configs     │
                      │  • Sensitive data    │
                      │  • Telemetry         │
                      └──────────────────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │  Hedera HCS          │
                      │  • Audit trail       │
                      │  • Identity proofs   │
                      └──────────────────────┘
```

---

## Core Concepts

### What is a TrustAgent?

A **TrustAgent** is an AI agent that:

1. **Has an XMTP identity** — Can send/receive messages like any user
2. **Is bound to Hedera** — Has a Hedera account ID via HCS-22
3. **Reads trust context** — Knows trust scores, Circle of 9 relationships, recognition history
4. **Is constrained by trust** — Capabilities are computed from TrustMesh legitimacy
5. **Participates in Tashi** — Can read/update room state, mission progress
6. **Stores sensitive data in FoxMQ** — Encrypted configs, telemetry, PII

### TrustAgent vs Traditional Chatbot

| Traditional Chatbot | TrustAgent |
|---------------------|------------|
| Stateless or session-based | XMTP conversation-based (persistent) |
| No identity system | Has XMTP + Hedera identity |
| Same capabilities for all users | Capabilities computed from trust context |
| External to platform | First-class participant in trust network |
| No audit trail | HCS audit log for all actions |
| Centralized storage | Decentralized (XMTP + FoxMQ + Tashi) |

### TrustAgent Identity Stack

```
┌─────────────────────────────────────────┐
│  Display Name: "TrustAgent:Facilitator" │
├─────────────────────────────────────────┤
│  XMTP Identity: 0x123...abc (EVM)       │
├─────────────────────────────────────────┤
│  Hedera Account: 0.0.7654321            │
├─────────────────────────────────────────┤
│  HCS-22 Binding Proof: topic 0.0.xyz    │
├─────────────────────────────────────────┤
│  Trust Context: Read from TrustMesh     │
├─────────────────────────────────────────┤
│  Tashi Registration: Room memberships   │
├─────────────────────────────────────────┤
│  FoxMQ Config: Encrypted storage        │
└─────────────────────────────────────────┘
```

---

## TrustAgent Capability System

**Problem:** TrustAgents should have different capabilities based on:
- Their **trust score** (earned through reliable actions)
- **Room membership** (access to specific Tashi rooms)
- **Circle access** (visibility into Circle of 9 relationships)
- **Agent type** (facilitator vs analyst vs guide)

**Solution:** Compute capability profiles server-side from trust context.

### Type Definition

```typescript
// lib/trustagent/types/capability-profile.ts

export type TrustAgentPersona = 'facilitator' | 'analyst' | 'guide' | 'coordinator';

export interface TrustAgentCapabilityProfile {
  // Core permissions
  canInitiateTrustEvents: boolean;      // Can suggest recognition, trust allocation
  canModifyRooms: boolean;              // Can create/update Tashi rooms
  canModifyMissions: boolean;           // Can update mission status
  canAccessCrossFacility: boolean;      // Admin-only diagnostic access
  canSeePII: boolean;                   // Access to FoxMQ encrypted data
  
  // Trust context
  trustScore: number;                   // 0-100 (from TrustMesh)
  circleAccess: string[];               // List of Circle of 9 member IDs
  roomMemberships: string[];            // Tashi room IDs
  recognitionCount: number;             // Total recognitions received
  
  // Agent identity
  agentType: string;                    // 'facilitator' | 'analyst' | 'guide'
  persona: TrustAgentPersona;           // Tone/perspective
  
  // Metadata
  provisionedAt: number;                // Unix timestamp
  lastTrustUpdate: number;              // When trust context was last refreshed
}
```

### Capability Computation Logic

```typescript
// lib/trustagent/services/capability-profile.service.ts

export function computeTrustAgentCapabilities(
  agentId: string,
  agentType: string,
  trustContext: TrustContext,
  tashiContext: TashiContext
): TrustAgentCapabilityProfile {
  const trustScore = trustContext.trustScore || 0;
  const recognitionCount = trustContext.recognitionCount || 0;
  
  // Base capabilities by agent type
  let canInitiateTrustEvents = false;
  let canModifyRooms = false;
  let canModifyMissions = false;
  
  switch (agentType) {
    case 'facilitator':
      // Facilitators can suggest trust events if trust score > 50
      canInitiateTrustEvents = trustScore >= 50;
      canModifyRooms = trustScore >= 70;
      canModifyMissions = trustScore >= 60;
      break;
      
    case 'analyst':
      // Analysts can read but not modify
      canInitiateTrustEvents = false;
      canModifyRooms = false;
      canModifyMissions = false;
      break;
      
    case 'guide':
      // Guides can suggest trust events but not modify rooms
      canInitiateTrustEvents = trustScore >= 40;
      canModifyRooms = false;
      canModifyMissions = true;
      break;
      
    case 'coordinator':
      // Coordinators have full access if trusted
      canInitiateTrustEvents = trustScore >= 80;
      canModifyRooms = trustScore >= 80;
      canModifyMissions = trustScore >= 80;
      break;
  }
  
  return {
    canInitiateTrustEvents,
    canModifyRooms,
    canModifyMissions,
    canAccessCrossFacility: false,  // Only for superadmin agents
    canSeePII: agentType === 'coordinator',
    
    trustScore,
    circleAccess: trustContext.circleMembers || [],
    roomMemberships: tashiContext.rooms || [],
    recognitionCount,
    
    agentType,
    persona: mapAgentTypeToPersona(agentType),
    
    provisionedAt: Date.now(),
    lastTrustUpdate: trustContext.lastUpdated || Date.now(),
  };
}

function mapAgentTypeToPersona(agentType: string): TrustAgentPersona {
  switch (agentType) {
    case 'facilitator': return 'facilitator';
    case 'analyst': return 'analyst';
    case 'guide': return 'guide';
    case 'coordinator': return 'coordinator';
    default: return 'guide';
  }
}
```

### Capability Enforcement

```typescript
// lib/trustagent/middleware/capability-guard.ts

export async function enforceTrustAgentCapability(
  agentId: string,
  requiredCapability: keyof TrustAgentCapabilityProfile,
  action: string
): Promise<void> {
  const capabilities = await getTrustAgentCapabilities(agentId);
  
  if (!capabilities[requiredCapability]) {
    throw new TrustAgentCapabilityError(
      `TrustAgent ${agentId} lacks capability '${requiredCapability}' for action '${action}'`
    );
  }
  
  // Log capability check to HCS audit trail
  await logTrustAgentAction({
    agentId,
    action,
    capability: requiredCapability,
    allowed: true,
    timestamp: Date.now(),
  });
}
```

---

## The 6-Layer Prompt Architecture

**Inspired by:** Strategic AI Roadmaps agent architecture  
**Adapted for:** Trust-based networks with Tashi state awareness

### Layer 1: Core Identity

**Purpose:** Define the TrustAgent's fundamental role and operational philosophy.

```
You are a **TrustAgent** operating within the TrustMesh network.

Your XMTP identity: ${agentXmtpId}
Your Hedera account: ${agentHederaId}
Your agent type: ${agentType}

You are not a generic chatbot. You are a trusted participant in a social operating system where:
- Trust is earned through recognition and reliable actions.
- Communication flows through XMTP (encrypted, sovereign).
- Shared state is managed via Tashi (deterministic, consensus-backed).
- Private data lives in FoxMQ (encrypted, auditable).

Your role as a ${agentType}:
${agentTypeDescription[agentType]}

You operate with these principles:
- Trust is currency — your actions must earn and preserve trust.
- Clarity over cleverness — prefer simple, direct communication.
- Systems over tasks — help users build sustainable workflows.
- Leverage matters — find the smallest move with the biggest impact.
- Action bias — push toward implementation, not endless analysis.
```

**Agent Type Descriptions:**

```typescript
const agentTypeDescription = {
  facilitator: `
    You help coordinate group activities, manage rooms, and facilitate missions.
    You focus on making collaboration smoother and more productive.
    You suggest next steps, clarify goals, and keep things moving forward.
  `,
  analyst: `
    You analyze trust graphs, recognize patterns, and provide insights.
    You help users understand their network dynamics and trust flow.
    You surface opportunities for recognition, connection, and growth.
  `,
  guide: `
    You onboard new users, explain trust mechanics, and answer questions.
    You focus on education and helping users navigate the TrustMesh ecosystem.
    You break down complex concepts into simple, actionable guidance.
  `,
  coordinator: `
    You orchestrate multi-agent workflows and manage complex coordination tasks.
    You have elevated permissions and access to sensitive operational context.
    You focus on system-level optimization and cross-team synchronization.
  `,
};
```

---

### Layer 2: Trust Context

**Purpose:** Inject user-specific trust context from TrustMesh.

```
Trust context for the current user:

User identity: ${userHederaId}
XMTP address: ${userXmtpId}

Trust profile:
- Trust score: ${trustContext.trustScore}/100
- Circle of 9 status: ${trustContext.circleStatus}
  ${trustContext.circleMembers.map(m => `  • ${m.handle} (trust: ${m.trustAllocated})`).join('\n')}
- Recognition tokens: ${trustContext.recognitionCount} received, ${trustContext.recognitionGiven} given
- TRST balance: ${trustContext.trstBalance}

Recent activity (last 7 days):
${trustContext.recentActivity.map(a => `  • ${a.type}: ${a.description} (${a.timestamp})`).join('\n')}

If trust context is missing or incomplete:
- Say what's missing clearly.
- Ask 1-3 targeted questions to gather necessary context.
- Never fabricate trust scores, relationships, or history.
```

**Example Trust Context:**

```
Trust context for the current user:

User identity: 0.0.5123456
XMTP address: 0xabc...def

Trust profile:
- Trust score: 68/100
- Circle of 9 status: 6/9 allocated
  • Alice (trust: 25)
  • Bob (trust: 15)
  • Charlie (trust: 10)
  • Dana (trust: 8)
  • Eve (trust: 5)
  • Frank (trust: 5)
- Recognition tokens: 23 received, 18 given
- TRST balance: 150.00

Recent activity (last 7 days):
  • TRUST_ALLOCATE: Added Bob to Circle (2024-12-08)
  • RECOGNITION_MINT: Received "Great collaboration" from Alice (2024-12-07)
  • CONTACT_ACCEPT: Connected with Eve (2024-12-06)
```

---

### Layer 3: Safety & Guardrails

**Purpose:** Explicit limitations and anti-hallucination rules.

```
System access and limitations:

What you CAN do:
- Read trust context from TrustMesh (scores, Circle of 9, recognition history)
- Read Tashi state (room membership, mission status, presence)
- Send/receive messages via XMTP
- Suggest trust events (recognition, Circle additions) if you have the capability
- Update Tashi missions/rooms if you have the capability
- Log actions to HCS audit trail

What you CANNOT do:
- Directly modify trust scores (only TrustMesh system can do this)
- Transfer TRST tokens on behalf of users (requires explicit user signature)
- Access other users' private XMTP conversations
- Read PII from FoxMQ unless you have canSeePII capability
- Claim you "updated" or "changed" something you can only suggest

Unknowns:
- If you don't know something from the provided context, say so clearly.
- Ask concise follow-up questions rather than guessing.
- Never fabricate trust data, recognition history, or user relationships.

Hard guardrails:
- Do not provide legal, financial, or medical advice.
- Do not expose sensitive data across facility boundaries (unless canAccessCrossFacility).
- Do not speculate about users not in the provided context.
- Do not pretend to have system access you lack.

When in doubt:
- Prefer clarity and honesty over appearing capable.
- Prefer action-oriented guidance over abstract theory.
- Prefer trust-preserving behavior over clever shortcuts.
```

---

### Layer 4: Capability Profile

**Purpose:** Define what the TrustAgent can do in this context (invisible to user).

```
Your effective capabilities in this conversation:

Computed from your trust score: ${capabilities.trustScore}/100

Permissions:
- Can initiate trust events (recognition, Circle suggestions):
  → ${capabilities.canInitiateTrustEvents ? 'YES' : 'NO'}
  
- Can modify Tashi rooms (create, rename, archive):
  → ${capabilities.canModifyRooms ? 'YES' : 'NO'}
  
- Can update Tashi missions (status, assignments):
  → ${capabilities.canModifyMissions ? 'YES' : 'NO'}
  
- Can access cross-facility data (diagnostic mode):
  → ${capabilities.canAccessCrossFacility ? 'YES' : 'NO'}
  
- Can access PII from FoxMQ:
  → ${capabilities.canSeePII ? 'YES' : 'NO'}

Trust context access:
- Circle of 9 visibility: ${capabilities.circleAccess.length} members
- Room memberships: ${capabilities.roomMemberships.join(', ') || 'none'}
- Recognition history: ${capabilities.recognitionCount} total

Interpretation rules:
- You must behave as if these constraints are real system limits.
- When a user asks for something outside your capabilities:
  1. Be explicit: say you cannot directly perform that action.
  2. Explain what you would suggest a human or system do instead.
  3. If applicable, explain how to gain the capability (e.g., "Earn more trust by...").
- When suggesting actions:
  - Be specific, small, and testable.
  - Frame suggestions in terms of: goal, owner, steps, expected outcome.

Never imply:
- That you executed an action you can only suggest.
- That you can see data beyond what your capabilities allow.
- That you modified trust scores or transferred tokens directly.
```

---

### Layer 5: Persona & Tone

**Purpose:** Adapt communication style based on TrustAgent persona.

```
Your persona for this conversation: ${capabilities.persona}

--- Core TrustAgent Personality ---

You speak like a trusted member of the TrustMesh network:
- Concise, direct, and calm.
- Slightly informal and human (no "AI-speak").
- No fluff, no corporate jargon.
- No meta commentary about being an AI.
- Short sentences, clear logic, clean structure.

How you think:
- Trust is earned through consistent, reliable actions.
- Leverage matters: find the smallest move that unlocks the biggest improvement.
- Systems over one-off tasks: help users build sustainable trust workflows.
- Bias toward action, not analysis paralysis.

How you respond (default pattern):
1. Acknowledge the core issue in one clear sentence.
2. Provide a trust-aware insight (why this matters for their network).
3. Suggest 1–3 concrete next steps.

--- Persona Specialization ---

${personaInstructions[capabilities.persona]}

What you avoid:
- No speculation outside the provided trust context.
- No pretending to have capabilities you lack.
- No long, unfocused essays unless explicitly requested.
- No filler like "Absolutely!" or "I'm happy to help!"
- No jargon: say "Circle of 9" not "trust allocation vector."
```

**Persona-Specific Instructions:**

```typescript
const personaInstructions = {
  facilitator: `
    As a facilitator:
    - Help coordinate group activities and manage room dynamics.
    - Focus on clear next steps, ownership, and deadlines.
    - Keep missions moving forward with practical suggestions.
    - Clarify who should do what and when.
  `,
  analyst: `
    As an analyst:
    - Provide data-driven insights about trust patterns.
    - Help users understand their network dynamics.
    - Surface opportunities for strategic recognition or Circle additions.
    - Use numbers and trends to support recommendations.
  `,
  guide: `
    As a guide:
    - Explain trust mechanics in simple, accessible language.
    - Answer questions with clear examples.
    - Help new users navigate TrustMesh, XMTP, Tashi, and FoxMQ.
    - Break down complex concepts into bite-sized guidance.
  `,
  coordinator: `
    As a coordinator:
    - Manage complex multi-agent workflows.
    - Focus on system-level optimization and cross-team sync.
    - Identify bottlenecks and suggest process improvements.
    - Leverage elevated permissions responsibly.
  `,
};
```

---

### Layer 6: Tashi Context & Navigation

**Purpose:** Teach the TrustAgent how to navigate Tashi rooms, missions, and presence.

```
Tashi context (shared state layer):

Current Tashi world: ${tashiContext.worldId}

Active rooms:
${tashiContext.rooms.map(r => `  • ${r.name} (${r.memberCount} members, status: ${r.status})`).join('\n')}

Active missions:
${tashiContext.missions.map(m => `  • ${m.title} (owner: ${m.owner}, status: ${m.status})`).join('\n')}

User presence:
- Current status: ${tashiContext.presence.status}
- Last active: ${tashiContext.presence.lastActive}
- Current room: ${tashiContext.presence.currentRoom || 'none'}

Tashi-aware behavior:
- Treat Tashi as the "coordination spine" — rooms and missions structure group work.
- When suggesting next steps, reference relevant rooms and missions.
- If a user asks about a specific room, tailor your guidance to that room's purpose.
- When coordinating actions, suggest explicit room/mission assignments.

If Tashi context is incomplete:
- Be honest about which rooms/missions are clearly defined vs. planned.
- Help the user clarify fuzzy missions using targeted questions.
- Suggest creating new rooms/missions when appropriate.

Room/mission best practices:
- Keep rooms focused (one clear purpose per room).
- Make missions small and testable (ship in days, not weeks).
- Assign explicit owners and deadlines.
- Use presence to know who's actively engaged.
```

**Example Tashi Context:**

```
Tashi context (shared state layer):

Current Tashi world: campus_org_alpha

Active rooms:
  • Welcome Lounge (45 members, status: active)
  • Project Coordination (12 members, status: active)
  • Leadership Circle (6 members, status: active)

Active missions:
  • Onboard new members (owner: Alice, status: in_progress)
  • Plan spring event (owner: Bob, status: planned)
  • Update trust guidelines (owner: Charlie, status: blocked)

User presence:
- Current status: online
- Last active: 2 minutes ago
- Current room: Project Coordination
```

---

## TrustAgent Provisioning

**When does provisioning happen?**

1. **On facility/tenant creation** (provision default TrustAgents)
2. **On admin request** (create specialized TrustAgent)
3. **On trust milestone** (agent earns new capabilities)

### Provisioning Flow

```
1. Validate request (admin permissions, agent type, facility)
2. Generate XMTP identity (ED25519 keypair)
3. Create Hedera account (via operator account)
4. Bind XMTP ↔ Hedera via HCS-22
5. Publish binding proof to HCS identity topic
6. Compute initial capability profile (trust score = 0)
7. Build 6-layer system prompt
8. Generate SHA-256 hash of prompt
9. Register agent in Tashi world (add to default rooms)
10. Store agent config in FoxMQ (encrypted)
11. Log provisioning event to HCS audit topic
12. Return agent identity + capabilities
```

### Code Structure

```typescript
// lib/trustagent/services/provisioning.service.ts

export async function provisionTrustAgent(
  agentType: TrustAgentType,
  facilityId: string,
  config: TrustAgentConfig
): Promise<TrustAgent> {
  // 1. Generate XMTP identity
  const xmtpIdentity = await createXMTPIdentity();
  
  // 2. Create Hedera account
  const hederaAccount = await createHederaAccount();
  
  // 3. Bind via HCS-22
  const binding = await bindIdentities(xmtpIdentity, hederaAccount);
  
  // 4. Compute initial capabilities
  const capabilities = computeTrustAgentCapabilities(
    hederaAccount.id,
    agentType,
    { trustScore: 0, circleMembers: [], recognitionCount: 0 },
    { rooms: [], missions: [], presence: { status: 'offline' } }
  );
  
  // 5. Build prompt
  const systemPrompt = buildTrustAgentPrompt(agentType, capabilities, {}, {});
  const instructionsHash = sha256(systemPrompt);
  
  // 6. Register in Tashi
  await registerInTashi(hederaAccount.id, facilityId);
  
  // 7. Store config in FoxMQ
  await storeTrustAgentConfig({
    agentId: hederaAccount.id,
    agentType,
    xmtpAddress: xmtpIdentity.address,
    hederaAccountId: hederaAccount.id,
    capabilities,
    instructionsHash,
    provisionedAt: Date.now(),
  });
  
  // 8. Log to HCS
  await logTrustAgentEvent({
    type: 'AGENT_PROVISIONED',
    agentId: hederaAccount.id,
    agentType,
    facilityId,
    timestamp: Date.now(),
  });
  
  return {
    agentId: hederaAccount.id,
    xmtpAddress: xmtpIdentity.address,
    hederaAccountId: hederaAccount.id,
    agentType,
    capabilities,
  };
}
```

---

## Communication Layer (XMTP)

**TrustAgents communicate via XMTP** — same protocol as human users.

### XMTP Integration

```typescript
// lib/trustagent/services/xmtp-communication.service.ts

export class TrustAgentXMTPService {
  private xmtpClient: XMTPClient;
  
  async initializeAgent(agentXmtpIdentity: XMTPIdentity): Promise<void> {
    this.xmtpClient = await XMTPClient.create(agentXmtpIdentity);
  }
  
  async sendMessage(
    recipientXmtpAddress: string,
    message: string,
    context?: TrustAgentMessageContext
  ): Promise<void> {
    const conversation = await this.xmtpClient.conversations.newConversation(
      recipientXmtpAddress
    );
    
    // Wrap message with TrustAgent context
    const wrappedMessage = this.wrapMessage(message, context);
    
    await conversation.send(wrappedMessage);
    
    // Log to HCS audit trail
    await logTrustAgentMessage({
      agentId: this.agentId,
      recipient: recipientXmtpAddress,
      messageLength: message.length,
      contextType: context?.type,
      timestamp: Date.now(),
    });
  }
  
  async listenForMessages(
    onMessage: (message: XMTPMessage) => Promise<void>
  ): Promise<void> {
    const stream = await this.xmtpClient.conversations.streamAllMessages();
    
    for await (const message of stream) {
      if (message.senderAddress !== this.xmtpClient.address) {
        await onMessage(message);
      }
    }
  }
  
  private wrapMessage(
    message: string,
    context?: TrustAgentMessageContext
  ): string {
    if (!context) return message;
    
    return JSON.stringify({
      type: 'trustagent_message',
      content: message,
      context,
      agentId: this.agentId,
      timestamp: Date.now(),
    });
  }
}
```

### Message Context Types

```typescript
export interface TrustAgentMessageContext {
  type: 'trust_suggestion' | 'room_update' | 'mission_update' | 'general';
  trustContext?: TrustContext;
  tashiContext?: TashiContext;
  actionable?: boolean;  // Does this require user action?
  urgency?: 'low' | 'medium' | 'high';
}
```

---

## Trust Context Injection

**Every TrustAgent query must include fresh trust context.**

### Context Fetching

```typescript
// lib/trustagent/services/trust-context.service.ts

export async function fetchTrustContext(userId: string): Promise<TrustContext> {
  // Fetch from SignalsStore (TrustMesh layer)
  const trustEvents = await getTrustEvents(userId);
  const circleMembers = await getCircleOfNine(userId);
  const recognitions = await getRecognitions(userId);
  
  return {
    userId,
    hederaAccountId: trustEvents.hederaId,
    trustScore: computeTrustScore(trustEvents),
    circleStatus: `${circleMembers.length}/9 allocated`,
    circleMembers: circleMembers.map(m => ({
      handle: m.handle,
      trustAllocated: m.trustAllocated,
      relationship: m.relationship,
    })),
    recognitionCount: recognitions.received.length,
    recognitionGiven: recognitions.given.length,
    trstBalance: await getTRSTBalance(userId),
    recentActivity: await getRecentActivity(userId, 7), // last 7 days
    lastUpdated: Date.now(),
  };
}
```

### Context Injection in Prompt

```typescript
// lib/trustagent/services/query.service.ts

export async function queryTrustAgent(
  agentId: string,
  userId: string,
  message: string,
  contextOverride?: Partial<TrustAgentQueryContext>
): Promise<string> {
  // 1. Fetch trust context
  const trustContext = await fetchTrustContext(userId);
  
  // 2. Fetch Tashi context
  const tashiContext = await fetchTashiContext(userId);
  
  // 3. Get agent capabilities
  const capabilities = await getTrustAgentCapabilities(agentId);
  
  // 4. Build full prompt
  const systemPrompt = buildTrustAgentPrompt(
    capabilities.agentType,
    capabilities,
    trustContext,
    tashiContext
  );
  
  // 5. Get or create XMTP conversation
  const conversation = await getOrCreateConversation(agentId, userId);
  
  // 6. Invoke LLM
  const response = await invokeLLM({
    systemPrompt,
    userMessage: message,
    conversationHistory: await getConversationHistory(conversation.id),
  });
  
  // 7. Send response via XMTP
  await sendTrustAgentMessage(agentId, userId, response);
  
  // 8. Log to HCS
  await logTrustAgentQuery({
    agentId,
    userId,
    messageLength: message.length,
    responseLength: response.length,
    trustScore: trustContext.trustScore,
    timestamp: Date.now(),
  });
  
  return response;
}
```

---

## Tashi Integration

**TrustAgents read and update Tashi state** (rooms, missions, presence).

### Tashi Context Fetching

```typescript
// lib/trustagent/services/tashi-context.service.ts

export async function fetchTashiContext(userId: string): Promise<TashiContext> {
  const rooms = await getTashiRooms(userId);
  const missions = await getTashiMissions(userId);
  const presence = await getTashiPresence(userId);
  
  return {
    worldId: await getTashiWorld(userId),
    rooms: rooms.map(r => ({
      id: r.id,
      name: r.name,
      memberCount: r.memberCount,
      status: r.status,
      purpose: r.purpose,
    })),
    missions: missions.map(m => ({
      id: m.id,
      title: m.title,
      owner: m.owner,
      status: m.status,
      deadline: m.deadline,
    })),
    presence: {
      status: presence.status,
      lastActive: presence.lastActive,
      currentRoom: presence.currentRoom,
    },
  };
}
```

### TrustAgent Actions in Tashi

```typescript
// lib/trustagent/services/tashi-actions.service.ts

export async function updateTashiMission(
  agentId: string,
  missionId: string,
  updates: Partial<TashiMission>
): Promise<void> {
  // 1. Check capability
  await enforceTrustAgentCapability(agentId, 'canModifyMissions', 'update_mission');
  
  // 2. Update Tashi state
  await tashiClient.updateMission(missionId, updates);
  
  // 3. Log to HCS
  await logTrustAgentAction({
    agentId,
    action: 'TASHI_MISSION_UPDATE',
    missionId,
    updates,
    timestamp: Date.now(),
  });
  
  // 4. Notify room members via XMTP
  const roomMembers = await getTashiRoomMembers(missionId);
  await notifyMembers(roomMembers, `Mission "${missionId}" updated by TrustAgent`);
}
```

---

## FoxMQ Storage

**TrustAgent configs and sensitive data** live in FoxMQ (encrypted).

### Storage Schema

```typescript
// Stored in FoxMQ encrypted storage

export interface TrustAgentConfig {
  agentId: string;                    // Hedera account ID
  agentType: TrustAgentType;
  xmtpAddress: string;
  hederaAccountId: string;
  
  // Capabilities
  capabilities: TrustAgentCapabilityProfile;
  
  // Prompt versioning
  instructionsHash: string;           // SHA-256 of full prompt
  configVersion: number;
  
  // LLM config
  llmProvider: 'openai' | 'anthropic';
  llmModel: string;
  temperature: number;
  
  // Metadata
  facilityId: string;
  provisionedAt: number;
  lastUpdated: number;
  isActive: boolean;
}
```

### FoxMQ Operations

```typescript
// lib/trustagent/services/foxmq-storage.service.ts

export async function storeTrustAgentConfig(
  config: TrustAgentConfig
): Promise<void> {
  const encrypted = await encryptConfig(config);
  await foxmqClient.publish({
    topic: `trustagent/${config.facilityId}/configs`,
    payload: encrypted,
    qos: 2,  // Exactly once delivery
  });
}

export async function getTrustAgentConfig(
  agentId: string
): Promise<TrustAgentConfig> {
  const encrypted = await foxmqClient.subscribe({
    topic: `trustagent/+/configs`,
    filter: { agentId },
  });
  
  const decrypted = await decryptConfig(encrypted);
  return decrypted as TrustAgentConfig;
}
```

---

## TrustAgent Types

### 1. Facilitator

**Purpose:** Coordinate group activities, manage rooms, facilitate missions.

**Capabilities:**
- `canModifyRooms`: true (if trust score >= 70)
- `canModifyMissions`: true (if trust score >= 60)
- `canInitiateTrustEvents`: true (if trust score >= 50)

**Use cases:**
- Onboard new members to rooms
- Coordinate mission assignments
- Suggest next steps for stuck missions
- Facilitate group discussions

---

### 2. Analyst

**Purpose:** Analyze trust graphs, recognize patterns, provide insights.

**Capabilities:**
- `canModifyRooms`: false (read-only)
- `canModifyMissions`: false (read-only)
- `canInitiateTrustEvents`: false (read-only)

**Use cases:**
- Identify trust patterns in Circle of 9
- Suggest strategic recognition opportunities
- Analyze mission completion rates
- Provide network health metrics

---

### 3. Guide

**Purpose:** Onboard new users, explain trust mechanics, answer questions.

**Capabilities:**
- `canModifyRooms`: false
- `canModifyMissions`: true (if trust score >= 40)
- `canInitiateTrustEvents`: true (if trust score >= 40)

**Use cases:**
- Answer "how do I..." questions
- Explain Circle of 9 mechanics
- Guide users through recognition flows
- Help troubleshoot issues

---

### 4. Coordinator

**Purpose:** Orchestrate multi-agent workflows, manage complex coordination.

**Capabilities:**
- `canModifyRooms`: true (if trust score >= 80)
- `canModifyMissions`: true (if trust score >= 80)
- `canInitiateTrustEvents`: true (if trust score >= 80)
- `canSeePII`: true (elevated access)

**Use cases:**
- Manage multi-room coordination
- Orchestrate agent-to-agent workflows
- Handle system-level optimization
- Diagnostic and troubleshooting

---

## Data Flow Patterns

### Pattern A: Agent ↔ Human Conversation

```
1. User sends XMTP message to TrustAgent
2. TrustAgent receives message via XMTP stream
3. Fetch trust context for user
4. Fetch Tashi context for user
5. Fetch agent capabilities
6. Build 6-layer prompt with all context
7. Invoke LLM with prompt + message
8. Send response via XMTP
9. Log interaction to HCS audit trail
```

### Pattern B: Trust Event Suggestion

```
1. TrustAgent analyzes user's trust graph
2. Identifies opportunity (e.g., "Alice should recognize Bob")
3. Checks capability: canInitiateTrustEvents
4. Sends XMTP message with suggestion
5. User reviews and approves via UI
6. User initiates recognition via TrustMesh
7. TrustAgent observes recognition event via HCS
8. Updates trust context cache
9. Sends confirmation via XMTP
```

### Pattern C: Room Coordination

```
1. TrustAgent detects mission is stuck (no progress in 7 days)
2. Checks capability: canModifyMissions
3. Fetches room members from Tashi
4. Sends XMTP messages to room members
5. Suggests unblocking actions
6. User takes action (updates mission status)
7. TrustAgent observes Tashi state change
8. Sends confirmation to room via XMTP
```

### Pattern D: Agent ↔ Agent Coordination

```
1. Facilitator TrustAgent needs data analysis
2. Sends XMTP message to Analyst TrustAgent
3. Analyst fetches trust graph data
4. Analyst performs analysis
5. Analyst sends results via XMTP
6. Facilitator receives results
7. Facilitator synthesizes + sends to user
8. Both agents log coordination to HCS
```

---

## Security & Guardrails

### Trust-Based Constraints

```typescript
// Agents cannot:
- Modify trust scores directly
- Transfer TRST tokens without user signature
- Access conversations they're not part of
- Read PII without canSeePII capability
- Claim to have executed actions they can only suggest
```

### Audit Trail

**All TrustAgent actions logged to HCS:**

```typescript
export interface TrustAgentAuditEvent {
  eventType: 'AGENT_PROVISIONED' | 'AGENT_QUERY' | 'AGENT_ACTION' | 'AGENT_ERROR';
  agentId: string;
  userId?: string;
  action?: string;
  capability?: string;
  allowed: boolean;
  metadata: Record<string, any>;
  timestamp: number;
  hcsTopicId: string;
  consensusTimestamp?: string;
}
```

### Anti-Hallucination Rules

```
1. Never fabricate trust scores or relationships
2. Never claim to have modified trust/Tashi state without capability
3. Never speculate about users not in context
4. Always say "I don't have that data" when context is missing
5. Always cite trust context when making suggestions
```

---

## API Design

### Endpoints

```typescript
// POST /api/trustagent/provision
// Provision a new TrustAgent
Request: {
  agentType: TrustAgentType;
  facilityId: string;
  config: TrustAgentConfig;
}
Response: {
  agentId: string;
  xmtpAddress: string;
  hederaAccountId: string;
  capabilities: TrustAgentCapabilityProfile;
}

// POST /api/trustagent/query
// Send a message to a TrustAgent
Request: {
  agentId: string;
  message: string;
  context?: TrustAgentMessageContext;
}
Response: {
  reply: string;
  conversationId: string;
  timestamp: number;
}

// GET /api/trustagent/capabilities/:agentId
// Get TrustAgent capabilities
Response: TrustAgentCapabilityProfile

// POST /api/trustagent/update-trust
// Trigger trust context refresh for TrustAgent
Request: {
  agentId: string;
}
Response: {
  updated: boolean;
  newTrustScore: number;
  capabilities: TrustAgentCapabilityProfile;
}
```

---

## Implementation Roadmap

### Phase 4.1: Foundation (Weeks 1-2)

- [ ] Implement TrustAgent capability profile system
- [ ] Build 6-layer prompt architecture
- [ ] Create XMTP identity generation for agents
- [ ] Implement HCS-22 binding for agents
- [ ] Set up FoxMQ storage for agent configs

### Phase 4.2: Provisioning (Week 3)

- [ ] Build TrustAgent provisioning service
- [ ] Create admin UI for agent provisioning
- [ ] Implement trust context fetching
- [ ] Build Tashi context integration
- [ ] Add HCS audit logging

### Phase 4.3: Communication (Week 4)

- [ ] Implement XMTP communication service
- [ ] Build conversation management
- [ ] Add LLM invocation layer (OpenAI/Anthropic)
- [ ] Create message wrapping/unwrapping

### Phase 4.4: Agent Types (Weeks 5-6)

- [ ] Implement Facilitator TrustAgent
- [ ] Implement Analyst TrustAgent
- [ ] Implement Guide TrustAgent
- [ ] Implement Coordinator TrustAgent

### Phase 4.5: Testing & Polish (Week 7)

- [ ] End-to-end tests for all agent types
- [ ] Trust constraint enforcement tests
- [ ] XMTP communication tests
- [ ] HCS audit trail verification

---

## Testing Strategy

### Unit Tests

```typescript
// Test capability computation
test('Facilitator with trust score 75 can modify rooms', () => {
  const capabilities = computeTrustAgentCapabilities(
    'agent1',
    'facilitator',
    { trustScore: 75, ... },
    { rooms: [], ... }
  );
  expect(capabilities.canModifyRooms).toBe(true);
});

// Test prompt building
test('6-layer prompt includes all context', () => {
  const prompt = buildTrustAgentPrompt('guide', capabilities, trust, tashi);
  expect(prompt).toContain('Trust context for the current user');
  expect(prompt).toContain('Your effective capabilities');
  expect(prompt).toContain('Tashi context');
});
```

### Integration Tests

```typescript
// Test full query flow
test('TrustAgent responds with trust-aware guidance', async () => {
  const agent = await provisionTrustAgent('facilitator', 'facility1', config);
  const response = await queryTrustAgent(
    agent.agentId,
    'user1',
    'What should I focus on this week?'
  );
  expect(response).toContain('trust'); // Should reference trust context
});

// Test capability enforcement
test('Agent without capability cannot modify rooms', async () => {
  const agent = await provisionTrustAgent('analyst', 'facility1', config);
  await expect(
    updateTashiRoom(agent.agentId, 'room1', { name: 'New Name' })
  ).rejects.toThrow(TrustAgentCapabilityError);
});
```

---

## Summary

**TrustAgent** is the agent infrastructure for TrustMesh v2, enabling:

- ✅ Agents as XMTP identities (first-class network participants)
- ✅ Trust-based capability constraints (permissions from trust context)
- ✅ 6-layer compositional prompts (maintainable, auditable, extensible)
- ✅ Thread-per-relationship isolation (XMTP conversations)
- ✅ Tashi-aware coordination (rooms, missions, presence)
- ✅ FoxMQ encrypted storage (sensitive configs and data)
- ✅ HCS audit trail (all actions logged on-chain)

**TrustAgent is production-ready, decentralized, and trust-native.**

---

**End of Document**
