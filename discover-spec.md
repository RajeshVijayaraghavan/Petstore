---
description: Structured discovery that asks all clarification questions upfront, then produces a reviewed discovery brief with an Enriched Feature Description ready to feed into /speckit.specify.
handoffs:
  - label: Generate Specification
    agent: speckit.specify
    prompt: ""
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

# Purpose

This command is the **pre-step** to `/speckit.specify`. It performs structured requirements discovery — asking every clarification question upfront — and produces a **discovery brief** file the user reviews. The brief includes an **Enriched Feature Description**: a synthesized, unambiguous narrative that captures all decisions and assumptions. That description becomes the input to `/speckit.specify`.

**Intended flow:**

```
/discover-spec  →  discovery brief (user reviews)  →  /speckit.specify  →  /speckit.plan  →  /speckit.tasks  →  /speckit.implement
```

This command does **NOT** create branches, spec files, or modify anything in `specs/`. It only produces a discovery brief in `discoveries/`.

---

# Pre-Execution Checks

**Check for extension hooks (before discovery)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook
- For each executable hook, output based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

---

# Step 1 — Parse Intent

The text the user typed after `/discover-spec` in the triggering message **is** the feature description (the "intent"). Assume you always have it available even if `$ARGUMENTS` appears literally. Do not ask the user to repeat it unless they provided an empty command (in which case: ERROR "No feature description provided").

Read the feature description and extract an **Intent Map**:

| Dimension | Extracted Value |
|-----------|----------------|
| **Actors** | Who are the users / personas / roles mentioned or implied? |
| **Actions** | What can they do? (verbs & capabilities) |
| **Data / Entities** | What objects, records, or concepts are involved? |
| **Constraints mentioned** | Any explicit limits, rules, or boundaries stated? |
| **Integrations mentioned** | External APIs, services, data sources? |
| **Ambiguities detected** | Anything vague, missing, or open to multiple interpretations? |

Present this Intent Map to the user so they can validate your understanding before questions begin.

---

# Step 2 — Generate Clarification Questions

For **every** ambiguity or missing dimension, generate a numbered question with lettered options. There is **no artificial limit** on the number of questions — ask as many as the intent's complexity demands. For simple intents this may be 3–5; for complex ones 10–20+.

## Question Categories

Scan the intent against each category below. If a category is relevant but not addressed by the user's description, generate a question. Skip categories that are clearly not applicable.

| # | Category | When to Ask | Example |
|---|----------|------------|---------|
| 1 | **Scope & Boundaries** | Always for non-trivial features | "Which capabilities are in scope for v1?" |
| 2 | **Target Users & Roles** | Multiple user types plausible | "Who will use this?" |
| 3 | **Core Workflows** | Primary user journey is ambiguous | "What is the first thing a user does?" |
| 4 | **Data & Entities** | Entities or relationships unclear | "What data does each [entity] contain?" |
| 5 | **Business Rules** | Rules/constraints not stated | "Under what conditions can an order be cancelled?" |
| 6 | **Edge Cases & Error Handling** | Failure modes matter | "What should happen when [X] fails?" |
| 7 | **Success Criteria** | Always | "How will we measure success?" |
| 8 | **Design / UX Constraints** | UI is involved | "Is there an existing design system?" |
| 9 | **Integration Points** | External systems involved | "What APIs does this integrate with? Contracts available?" |
| 10 | **Security & Authentication** | Access control is relevant | "What auth model? Who can access what?" |
| 11 | **Performance & Scale** | Scale/latency could matter | "Expected data volume? Acceptable response times?" |
| 12 | **Prioritization** | Multiple sub-features described | "Rank these features by v1 importance" |
| 13 | **Existing Assets** | Project context may exist | "Are there wireframes, mockups, an API spec, or prior docs?" |
| 14 | **Out of Scope** | Always for non-trivial features | "Anything this feature should NOT do?" |

## Question Formatting Rules

- **Number all questions** sequentially (1, 2, 3, ...)
- **Group by category** with a category heading
- **List options as A, B, C, D, etc.** — always include a "Custom" option for free-text
- **Include implications per option** so the user understands impact
- **Provide a recommended option** where a reasonable best guess exists, marked with `**Recommended:**` and brief reasoning
- Enable easy replies like `1A, 2C, 3B, 4-Custom: [details]`

## Question Format Template

```markdown
### [Category Name]

**Q1. [Question text]**

**Recommended:** Option [X] — [1-2 sentence reasoning]

| Option | Answer | Implications |
|--------|--------|--------------|
| A | [Answer text] | [What this means for the feature] |
| B | [Answer text] | [What this means for the feature] |
| C | [Answer text] | [What this means for the feature] |
| Custom | Provide your own answer | [How to provide it] |

---
```

## Presentation Rules

- Present **ALL questions at once** so the user can answer in a single pass
- At the top: "I have **N questions** across **M categories** to ensure the spec covers your intent completely."
- At the bottom: "Reply with your selections (e.g., `1A, 2C, 3B, 4-Custom: [details]`). For any question you'd like me to decide, reply `skip` for that number and I'll document my assumption."
- If the intent is extremely clear with no ambiguities: "Your description is well-defined. I have no critical questions — proceeding to brief generation." and skip to Step 3.

---

# Step 3 — Process Answers & Build Discovery Brief

After the user responds:

1. **For every answered question**: Record in the Clarifications section.
2. **For every skipped question** (user said "skip" or gave no answer): Make a reasonable assumption and add to the **Assumptions Register** with these fields:

| Field | Description |
|-------|-------------|
| **ID** | A-001, A-002, ... |
| **Question** | The original question asked |
| **Assumed Answer** | The default chosen |
| **Rationale** | Why this default is reasonable (industry standard, common pattern, context clue) |
| **Impact if Wrong** | Low / Medium / High — what breaks if wrong |
| **Revisit Trigger** | What event or info would require revisiting |

3. **For partially answered questions** (vague response): Ask one targeted follow-up, then assume if still unclear.

---

# Step 4 — Generate the Enriched Feature Description

This is the most critical output. Synthesize **every** decision, answer, and assumption into a single, dense, unambiguous feature description. This is the "super-prompt" that `/speckit.specify` will consume.

Rules for the Enriched Feature Description:
- **Narrative form** — reads as one coherent feature description, not a list of Q&A
- **Incorporates all decisions** — scope boundaries, user roles, workflows, business rules, priorities, out-of-scope items
- **References existing assets** — mentions API specs, wireframes, design systems by name/location if the user provided them
- **States priorities explicitly** — "P1: ..., P2: ..., P3: ..."
- **States out-of-scope explicitly** — "Out of scope for v1: ..."
- **Includes success criteria hints** — "Success means users can ... within ... minutes"
- **No implementation details** — focuses on WHAT and WHY, never HOW
- **Self-contained** — a reader (or AI) should understand the full feature from this description alone, without needing the Q&A log

---

# Step 5 — Write Discovery Brief File

1. Generate a concise short name (2–4 words, lowercase-hyphenated) from the feature description.
2. Create `discoveries/` directory if it doesn't exist.
3. Write the brief to `discoveries/[short-name].discovery.md` using this structure:

```markdown
# Discovery Brief: [FEATURE NAME]

**Created**: [DATE]
**Status**: Ready for Review
**Original Intent**: "[user's original $ARGUMENTS text]"

---

## Intent Map

| Dimension | Extracted |
|-----------|-----------|
| **Actors** | [list] |
| **Actions** | [list] |
| **Data / Entities** | [list] |
| **Constraints** | [list] |
| **Integrations** | [list] |

---

## Clarifications

### Session [DATE]

- Q: [question] → A: [user's answer]
- Q: [question] → A: [user's answer]
[... one bullet per answered question ...]

---

## Assumptions Register

| ID | Question | Assumed Answer | Rationale | Impact if Wrong | Revisit Trigger |
|----|----------|---------------|-----------|-----------------|-----------------|
| A-001 | ... | ... | ... | Medium | ... |
[... one row per unanswered/skipped question. Empty table if all questions answered. ...]

---

## Scope Summary

### In Scope (v1)

- [capability 1]
- [capability 2]

### Out of Scope (v1)

- [excluded item 1]
- [excluded item 2]

### Priority Order

1. **P1**: [highest priority features/stories]
2. **P2**: [next tier]
3. **P3**: [lowest tier for v1]

---

## Enriched Feature Description

> **This section is the input for `/speckit.specify`.** Copy or reference it when running the specify command.

[The synthesized, comprehensive, self-contained feature description that incorporates ALL decisions, assumptions, scope boundaries, priorities, and success criteria from the discovery session. Written as a dense narrative. No implementation details.]

---

## Next Step

Review this brief. When satisfied, run:

\`\`\`
/speckit.specify [paste or reference the Enriched Feature Description above]
\`\`\`

Or use the **"Generate Specification"** handoff button which will pass this context forward.
```

---

# Step 6 — Present Summary & Await Review

After writing the file, present this summary to the user:

```markdown
## Discovery Complete

**Brief saved to**: `discoveries/[short-name].discovery.md`

### Stats
- **Questions asked**: N
- **Answered by user**: X
- **Assumed (documented)**: Y
- **High-impact assumptions**: Z (review recommended)

### High-Impact Assumptions Requiring Attention
[List any assumptions with "High" impact rating — these should be reviewed before proceeding]

### Ready for Next Step
Review the discovery brief, then either:
1. Use the **"Generate Specification"** handoff button above
2. Or run: `/speckit.specify [Enriched Feature Description]`

The enriched description is designed to give `/speckit.specify` everything it needs to produce a complete spec with zero ambiguity.
```

---

# Behavioral Rules

1. **This command produces a discovery brief only.** It does NOT create branches, spec files, or modify `specs/`. That is the job of `/speckit.specify`.
2. **Never skip the question phase.** If the intent has ambiguities, questions must be asked before the brief is generated.
3. **No silent assumptions.** Every gap becomes either a Clarification entry (if answered) or an Assumptions Register row (if defaulted). Nothing is silently decided.
4. **No artificial question limit.** Ask as many questions as the intent demands. Group by category for readability.
5. **Respect user signals.** If the user says "proceed", "skip all", or "use your judgment" for remaining questions, document all remaining items as assumptions with rationale.
6. **The Enriched Feature Description is the primary deliverable.** It must be self-contained, unambiguous, and dense enough that `/speckit.specify` can produce a complete spec from it alone.
7. **Confirm before writing.** After processing answers, show a Discovery Summary with the Assumptions Register preview. Wait for user confirmation before writing the brief file.
8. **Preserve speckit compatibility.** The handoff to `/speckit.specify` must work seamlessly. The enriched description is formatted as natural language input that `speckit.specify` expects as `$ARGUMENTS`.
