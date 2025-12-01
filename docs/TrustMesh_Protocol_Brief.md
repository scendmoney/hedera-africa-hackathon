# TrustMesh Protocol + ContextEngine + TRST  
### Technical + Product Brief for HCS Standards Review

> Draft for: **HashgraphOnline HCS Standards Team**  
> CC: **Ken Anderson (Tech Strategy Advisor)**  
> Author: Tony Camero / TrustMesh

---

## 0. IP & Positioning

- **TrustMesh Protocol**  
  - Patent-protected architecture, but **open specification**.  
  - Intention: anyone can implement or integrate, subject to licensing, with TrustMesh as primary reference implementation.
- **ContextEngine**  
  - Patent-protected, **SaaS product** operated by TrustMesh (closed infra, open APIs).
- **TRST**  
  - Canonical **medium for fees and trust-weighted payments**.  
  - Open for ecosystem use; can be instantiated on **20+ L1s**, plus regional variants (e.g. `TRST-USD-Princeton`, `TRST-KES`, etc.).  
  - TRST is **mandatory** at protocol level for:
    - Protocol fees  
    - Trust-weighted payment semantics

Regulators / enterprises can plug into this stack without needing to accept "yet another arbitrary token": TRST is a *unit of trustful value* with clear semantics, not random tokenomics.

---

## 1. What is TrustMesh Protocol?

At its core, TrustMesh Protocol defines three things:

1. **Identity bindings (HCS 22)**  
   - DIDs ↔ Hedera accounts, pseudonymous by default.  
   - HCS events capture "this DID can settle via this Hedera account".

2. **Trust signals (HCS 21)**  
   - Immutable recognition / proof-of-character events between parties.  
   - Typed signals (e.g. `RECOGNITION`, `ENDORSEMENT`, `COMPLETION`, `SLASH`) with optional context.

3. **Trust graph constraints + TRST flows**  
   - Each identity has a **bounded inner circle** (e.g. max 9 "deep trust" edges).  
   - All signals feed into trust scores; inner circle edges carry more weight.  
   - Payments and fees are expressed in **TRST**, with hooks for local stable variants.

The goal: make **trust** and **context** first-class citizens in the Hedera ecosystem, not an afterthought glued onto applications.

---

## 2. Identity: HCS 22 Binding

### 2.1. Model

- **Primary identity**: `did` (e.g. `did:ethr:0x...` from Magic or other DID providers).
- **Settlement identity**: `hederaAccountId` (e.g. `0.0.7148063`), used for TRST settlement.

A binding event:

```json
{
  "version": "1.0",
  "type": "IDENTITY_BIND",
  "issuerDid": "did:ethr:0xa78926a2397ad0ba457a45e989506b69bcaf40d0",
  "hederaAccountId": "0.0.7148063",
  "evmAddress": "0xa78926a2397ad0ba457a45e989506b69bcaf40d0",
  "iat": "2025-11-15T19:10:00.000Z"
}
```

### 2.2. Rules

- A DID **MAY** bind to multiple settlement accounts over time, but the spec encourages a single active binding with historical records.
- Bindings are **append-only**; "unbinding" is "bind to a new account" with status/metadata.
- No KYC/KYB is assumed; real-world identity is modeled as **optional extension events**.

---

## 3. Trust Signals: HCS‑21

### 3.1. Model

A **Trust Signal** is an immutable record that one DID assigns to another:

```json
{
  "version": "1.0",
  "type": "TRUST_SIGNAL",
  "actorDid": "did:ethr:0xACTOR",
  "targetDid": "did:ethr:0xTARGET",
  "signalType": "RECOGNITION",
  "weight": 1,
  "contextRef": {
    "loop": "commerce",
    "referenceId": "order_123",
    "tags": ["on-time", "paid-in-full"]
  },
  "iat": "2025-11-15T19:12:00.000Z"
}
```

All such messages go onto a configured **HCS 21 topic**.

### 3.2. Categories

- `RECOGNITION` / `ENDORSEMENT`: positive signals, typically from peer to peer.
- `COMPLETION`: a verifiable completion of a task / contract.
- `SLASH`: negative signal (breach, fraud, non-performance).
- `BADGE` / `META`: admin/DAO-defined achievements.

The spec is extensible via `signalType` strings but defines canonical categories for scoring.

---

## 4. Trust Graph & Inner Circle Constraint

### 4.1. Bounded Inner Circle

To align with **bounded dynamical networks** theory (Mark Braverman, Princeton):

- Each DID has an **Inner Circle**: up to `maxInnerCircleSize` (default 9) peers they allocate explicit trust to.
- This is expressed via specialized `TRUST_SIGNAL` events with additional metadata:

```json
{
  "version": "1.0",
  "type": "TRUST_SIGNAL",
  "actorDid": "did:ethr:0xACTOR",
  "targetDid": "did:ethr:0xFRIEND",
  "signalType": "TRUST_ALLOCATE",
  "weight": 3,
  "isInnerCircle": true,
  "iat": "2025-11-15T19:20:00.000Z"
}
```

**Properties:**

- **Bounded out-degree** on "deep trust" edges.
- Forces users to **"choose wisely"**; every slot matters.
- Provides **Sybil resistance** and reduces spam influence.

### 4.2. Scoring Surface

The spec defines a minimal scoring interface:

- `localTrustScore(did)` — from the perspective of one app or loop.
- `globalTrustScore(did)` — network-wide aggregated view.
- `circleTrustScore(did)` — trust restricted to inner circle.

Implementors can define exact algorithms, but must:

- Treat positive/negative signals distinctly.
- Weight inner-circle allocations heavier than incidental recognition.

---

## 5. TRST: Canonical Medium

### 5.1. Role

TRST plays three roles:

1. **Fee unit**  
   - All protocol-level and ContextEngine API usage fees are denominated in TRST.

2. **Trust-weighted payment medium**  
   - TRST-based flows can be modulated by trust scores (limits, discounts, terms).

3. **Unit of account for trustful value**  
   - Even when wrapped as `TRST-USD-Princeton`, the underlying semantics remain TRST-based.

### 5.2. Variants

The spec allows variants such as:

- `TRST-USD-Princeton` — e.g. backed by custodial USD, Princeton-based trust pool.
- `TRST-<REGION>-<CURRENCY>` — regional stablecoins built on TRST rules.

But:

- **Fees** at the protocol level are always expressed in TRST units.
- Licensees cannot "avoid" TRST by inventing a fully separate token.

### 5.3. Multi-chain

TRST can be issued on multiple L1s:

```json
{
  "symbol": "TRST",
  "instances": [
    {
      "chainId": "hedera-testnet",
      "tokenId": "0.0.123456"
    },
    {
      "chainId": "eth-mainnet",
      "tokenAddress": "0x1234..."
    }
  ]
}
```

Reconciliation and supply discipline are handled by TrustMesh infra + audits.

---

## 6. ContextEngine (SaaS Layer)

**ContextEngine** is not the standard; it’s the *service* that applies TrustMesh primitives:

- Ingests events from:
  - HCS 21 (trust signals)
  - HCS 22 (bindings)
  - App-specific loops: commerce, civic, education, social.

- Computes:
  - "Context facts" (e.g. `user_x_paid_3_invoices_on_time`, `user_y_completed_5 community tasks`).
  - High-level insights and triggers for apps (e.g. "eligible for credit line", "eligible for grant").

- Exposes:
  - REST/GraphQL APIs and webhooks for apps to subscribe to changes (e.g. `trust.score.updated`).

Think of ContextEngine as: **"Trust-aware analytics and decision layer"** built on the TrustMesh Protocol.

---

## 7. External Developer API Snapshot (v0)

_Not a formal standard, but illustrates how others would consume TrustMesh._

Base URL (example): `https://api.trustmesh.io/v0`

Auth:

- App-level: `X-API-Key: <app_api_key>`
- User-level: `Authorization: Bearer <user_jwt>`

### 7.1. Identity Resolution

`POST /identity/resolve`

```json
{
  "issuerDid": "did:ethr:0xa78926a2397ad0ba457a45e989506b69bcaf40d0",
  "allowProvision": true
}
```

Response:

```json
{
  "did": "did:ethr:0xa78926a2397ad0ba457a45e989506b69bcaf40d0",
  "hederaAccountId": "0.0.7148063",
  "source": "provisioned",
  "timestamp": "2025-11-15T19:41:00.123Z"
}
```

### 7.2. Emit Trust Signal

`POST /signals`

```json
{
  "actorDid": "did:ethr:0xACTOR",
  "targetDid": "did:ethr:0xTARGET",
  "signalType": "RECOGNITION",
  "weight": 1,
  "contextRef": {
    "loop": "civic",
    "referenceId": "cleanup_event_42"
  }
}
```

### 7.3. Query Trust Score

`GET /trust/did:ethr:0xTARGET/score`

```json
{
  "did": "did:ethr:0xTARGET",
  "localScore": 12.5,
  "globalScore": 48.1,
  "circleScore": 9.0,
  "metrics": {
    "signalsGiven": 20,
    "signalsReceived": 35,
    "positiveSignals": 30,
    "negativeSignals": 5,
    "innerCircleCount": 6
  },
  "updatedAt": "2025-11-15T19:45:00.000Z"
}
```

### 7.4. Inner Circle Management

`GET /trust/:did/circle` and `POST /trust/:did/circle`  
Max size enforced (e.g. 9). Replacement required when at capacity.

---

## 8. Two Civic / Community Example Flows

### 8.1. Youth / Builder Collective (Africa-focused)

**Actors:**

- Local collective of devs/designers.  
- Sponsors providing grants / bounties.  
- Community organizers.

**Flow:**

1. **Onboarding**  
   - Members onboard via Magic or similar; TrustMesh binds DID ↔ Hedera account via HCS‑22.  
   - Trust Agent (system profile) is auto-bonded as their first contact.

2. **Contribution Signals**  
   - Shipping a project, mentoring, running an event → organizers issue `TRUST_SIGNAL` with `signalType: RECOGNITION` or `COMPLETION`.

3. **TRST-based Rewards**  
   - Grants / micro-payments to members are denominated in TRST or a local variant (e.g. `TRST-USD-Princeton`).  
   - Payments recorded via `/payments/trst` and optionally auto-emit trust signals.

4. **Selection Logic**  
   - When allocating additional grants, the collective uses:  
     - `GET /trust/:did/score`  
     - Filters for sustained contributions, not one-off spikes.

5. **Outcome**  
   - Youth can show portable, protocol-readable proof of character and participation, reusable when they apply to other DAOs, jobs, or programs.

### 8.2. Municipal Pilot

**Actors:**

- City govt / municipal treasury.  
- Local NGOs, contractors, citizen groups.

**Flow:**

1. **Citizen & Vendor Onboarding**  
   - DIDs issued/linked per citizen/vendor.  
   - City uses HCS‑22 bindings for vendor accounts on Hedera.

2. **Program Participation**  
   - Citizens join clean-up campaigns, training programs, civic events.  
   - Each completion triggers a `TRUST_SIGNAL` (`COMPLETION` / `RECOGNITION`).

3. **TRST-based Micro-Grants**  
   - City issues TRST-based micro-grants or vouchers for those with sufficient scores.  
   - Rewards recorded via `/payments/trst`.

4. **Accountability & Audits**  
   - Trust scores & signals form a **transparent, immutable trail** of who earned what and why.  
   - Exportable reports show both financial flows and trust evidence.

5. **Policy Feedback**  
   - ContextEngine aggregates which programs generate sustained trust/value.  
   - City iterates programs based on which ones produce the healthiest trust graph.

---

## 9. What We’re Asking For Feedback On

From **HCS standards team** and **Ken**, the main questions to review:

1. **HCS 21 / HCS 22 Fit**  
   - Are the proposed event shapes and semantics aligned with how you’d like to see "trust" and "identity bindings" standardized on Hedera?  
   - Are there existing or planned HCS standards that this should align with / merge into?

2. **Graph Constraints & Braverman Tie-in**  
   - Does the "bounded inner circle" idea (max degree ~9) make sense as a **recommended pattern** for trust graphs on Hedera?  
   - Any concerns about how we’ve translated bounded network theory into a practical constraint?

3. **TRST as Canonical Fee / Payment Medium**  
   - Any technical or ecosystem risks to making TRST *the* canonical fee unit for TrustMesh integrations?  
   - Thoughts on multi-chain issuance & how best to keep this auditable and sane.

4. **ContextEngine / Protocol Boundary**  
   - Is the separation between "open protocol" and "closed SaaS analytics layer" clean and sensible from your vantage point?  
   - Suggestions for interfaces or standards that would make it easier for others to build their own ContextEngines?

5. **Civic & Youth Use Cases**  
   - Any concerns or strong recommendations about using trust signals + TRST in civic contexts?  
   - Guidance on pilots/evidence the standards team would want to see if this moves toward formal standardization.
