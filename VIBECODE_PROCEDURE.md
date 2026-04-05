# Vibecode Procedure Document

## Document Information

| Field | Value |
|-------|-------|
| Version | 2.1 |
| Created | 2026-02-04 |
| Last Updated | 2026-02-04 |

---

## 1. Quick Start

### 1.1 What is Vibecoding?

Vibecoding is a collaborative approach where **humans and AI work together** on software development. The human acts as the senior developer (decision-maker), and AI acts as the junior developer (implementer).

### 1.2 Core Rules (The Non-Negotiables)

```
┌─────────────────────────────────────────────────────────────────┐
│                      VIBECODE CORE RULES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AI writes code, HUMAN pushes code (git)                     │
│  2. AI prepares tests, HUMAN executes tests                     │
│  3. AI proposes, HUMAN decides (on critical matters)            │
│  4. AI provides install instructions, HUMAN runs them           │
│  5. Progress Log is updated after every significant change      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Getting Started Checklist

For any new project:

- [ ] Verify `vibecode/PROGRESS_LOG.md` exists (human creates manually if missing)
- [ ] Verify `vibecode/PROJECT_CONTEXT.md` exists (human creates manually if missing)
- [ ] Verify `vibecode/DECISIONS.md` exists (human creates manually if missing)
- [ ] Define if working in Solo or Team mode

### 1.4 Essential Templates

| Template | Purpose | Required? |
|----------|---------|-----------|
| `PROGRESS_LOG.md` | Track progress, enable AI model transitions | **Yes** |
| `PROJECT_CONTEXT.md` | Project overview for AI onboarding | **Yes** |
| `DECISIONS.md` | Record architectural decisions | Recommended |

---

## 2. Roles & Responsibilities

### 2.1 Solo Mode (1 Human + AI)

| Role | Actor | Key Responsibilities |
|------|-------|---------------------|
| **Code Maintainer** | Human | Decisions, approvals, git operations, testing, installs |
| **Code Writer** | AI | Implementation, documentation, test procedures, suggestions |

### 2.2 Team Mode (Multiple Humans + AI)

| Role | Actor | Key Responsibilities |
|------|-------|---------------------|
| **Project Lead** | Human | Final decisions, architecture, conflict resolution |
| **Code Maintainer** | Human(s) | Code review, git operations, merge approvals |
| **Tester** | Human(s) | Execute tests, report results, verify fixes |
| **Domain Expert** | Human(s) | Requirements, business logic validation |
| **Code Writer** | AI | Implementation, test procedures, documentation |

### 2.3 Decision Authority

| Decision Type | AI Role | Human Role |
|---------------|---------|------------|
| Architecture, tech stack, database | Propose options | **Decide** |
| Dependencies | Suggest with explanation | **Approve & install** |
| Code implementation | Write code | **Review & approve** |
| Git operations | Suggest commands | **Execute** |
| Testing | Prepare procedures | **Execute & report** |

---

## 3. Development Workflow

### 3.1 Stage-Based Development

Every feature is broken into **stages**. Each stage must pass human testing before proceeding.

```
┌─────────────────────────────────────────────────────────────────┐
│                         STAGE WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐   │
│  │ STAGE 1 │────▶│ STAGE 2 │────▶│ STAGE 3 │────▶│ DONE    │   │
│  └────┬────┘     └────┬────┘     └────┬────┘     └─────────┘   │
│       │               │               │                        │
│       ▼               ▼               ▼                        │
│  Human Test      Human Test      Human Test                    │
│  Gate ✓          Gate ✓          Gate ✓                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Stage Cycle

For each stage:

1. **AI** proposes stage objectives and deliverables
2. **Human** approves the plan
3. **AI** implements the stage
4. **AI** prepares test procedure
5. **Human** executes tests and reports PASS/FAIL
6. **If PASS**: Update Progress Log → Next stage
7. **If FAIL**: AI fixes → Human re-tests

### 3.3 What AI Must Ask Before Doing

- Adding new dependencies
- Changing architecture or database schema
- Modifying security-related code
- Making breaking changes
- Proceeding to next stage (needs test PASS)

### 3.4 What AI Must Never Do

- Auto-install packages
- Execute git commands
- Execute tests (only prepare procedures)
- Make critical decisions alone
- Skip human approval for stage completion

---

## 4. Testing

### 4.1 Testing Responsibility

| AI Does | Human Does |
|---------|------------|
| Prepares test procedures | Executes the tests |
| Lists steps and expected results | Reports PASS/FAIL |
| Identifies edge cases | Provides feedback on failures |

### 4.2 Test Procedure Format

AI prepares test procedures like this:

```markdown
## Test: [Stage Name]

### Pre-requisites
- [ ] Server running
- [ ] Database seeded

### Test Cases

**TC-001: [Name]**
Steps:
1. [Action]
2. [Action]

Expected: [Result]
Status: [ ] PASS  [ ] FAIL

### Summary
| Test | Status |
|------|--------|
| TC-001 | |
```

### 4.3 Test Failure Protocol

1. Human reports failure with details
2. AI analyzes and proposes fix
3. Human approves fix approach
4. AI implements fix
5. AI prepares updated test
6. Human re-tests

---

## 5. Git & Version Control

### 5.1 Git Responsibility

**AI writes code. Human manages git.**

| AI Does | Human Does |
|---------|------------|
| Write/modify code files | `git add` |
| Suggest commit messages | `git commit` |
| Recommend branch names | `git push` |
| Explain git concepts | `git merge` |

### 5.2 Example Git Handoff

```
AI: "Stage complete. Here's what to do:

1. git add src/auth/login.ts
2. git commit -m 'feat(auth): add login endpoint'
3. git push origin feature/auth

Ready to commit?"
```

---

## 6. Progress Log

### 6.1 Purpose

The Progress Log enables:
- **AI model continuity** - New AI can read it and continue seamlessly
- **Team handoffs** - Team members know what's done and what's next
- **Project history** - Track decisions and progress over time

### 6.2 When to Update

| Event | Update Required |
|-------|-----------------|
| Stage completed | Yes |
| Test passed/failed | Yes |
| Blocker encountered | Yes |
| Session ending | Yes |
| Decision made | Yes |

### 6.3 AI Model Handoff

When a new AI session starts:

1. AI reads `vibecode/PROGRESS_LOG.md`
2. AI reads `vibecode/PROJECT_CONTEXT.md`
3. AI reads `vibecode/DECISIONS.md` (if exists)
4. AI summarizes understanding to human
5. Human confirms or corrects
6. AI continues from documented state

---

## 7. Team Collaboration

> Skip this section if working in Solo Mode

### 7.1 Team Workflow

```
1. Lead/Expert    → Define requirements
2. AI             → Propose stages (Lead approves)
3. AI             → Implement stage
4. Maintainer     → Review code
5. AI             → Prepare test procedure
6. Tester         → Execute tests, report results
7. If PASS        → Maintainer pushes to git
8. Repeat for next stage
```

### 7.2 Approval Matrix

| Action | Lead | Maintainer | Tester | Expert |
|--------|:----:|:----------:|:------:|:------:|
| Architecture | ✅ | - | - | Consulted |
| Code merge | Backup | ✅ | - | - |
| Test sign-off | - | - | ✅ | - |
| Requirements | ✅ | - | - | ✅ |

### 7.3 Handoffs

When work transfers between team members:

**AI → Tester:**
- What's ready for testing
- Test procedure location
- Pre-requisites
- Known limitations

**Tester → AI (on failure):**
- Which tests failed
- Error details
- Screenshots/logs if available

### 7.4 Async Collaboration

For teams across time zones:
- **Progress Log is the single source of truth**
- Update Progress Log before ending your session
- Check Progress Log when starting your session
- Document who needs to do what next

---

## 8. Security Guidelines

### 8.1 AI Security Boundaries

**AI must NEVER:**
- Hardcode credentials in code
- Store or log sensitive data
- Make security decisions without human approval

**AI must ALWAYS:**
- Use environment variables for secrets
- Flag potential security vulnerabilities
- Follow secure coding practices

---

## 9. Quick Reference

### 9.1 Solo Mode

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOLO MODE QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  HUMAN                          AI                              │
│  ─────                          ──                              │
│  ✓ Decides                      ✓ Writes code                   │
│  ✓ Approves                     ✓ Proposes                      │
│  ✓ Installs                     ✓ Documents                     │
│  ✓ Tests                        ✓ Prepares test procedures      │
│  ✓ Git push                     ✓ Suggests git commands         │
│  ✓ Reviews                      ✓ Updates Progress Log          │
│                                                                 │
│  WORKFLOW: AI proposes → Human approves → AI implements →       │
│            AI prepares test → Human tests → Human pushes        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Team Mode

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEAM MODE QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LEAD           MAINTAINER      TESTER          AI              │
│  ────           ──────────      ──────          ──              │
│  Decides        Reviews code    Executes tests  Writes code     │
│  Architecture   Git operations  Reports bugs    Prepares tests  │
│  Resolves       Merges          Verifies fixes  Documents       │
│                                                                 │
│  WORKFLOW: Lead defines → AI implements → Maintainer reviews →  │
│            AI prepares test → Tester tests → Maintainer pushes  │
│                                                                 │
│  HANDOFFS: Always update Progress Log when handing off work     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Templates

### 10.1 Available Templates

| Template | Location | Purpose |
|----------|----------|---------|
| Progress Log | `vibecode/PROGRESS_LOG.md` | Track progress, enable continuity |
| Project Context | `vibecode/PROJECT_CONTEXT.md` | Project overview and patterns |
| Decisions | `vibecode/DECISIONS.md` | Architectural decision log |

### 10.2 Template Usage

1. Human manually creates the files in the `vibecode/` folder (AI verifies they exist)
2. Fill in the templates using one of these approaches:
   - **AI auto-fill:** Human asks AI to scan the project and auto-populate `vibecode/PROJECT_CONTEXT.md`. AI analyzes the codebase (structure, tech stack, patterns, conventions) and fills in the template. Human reviews and corrects.
   - **Manual edit:** Human fills in the placeholders directly.
3. Update regularly as the project evolves

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-04 | Initial document |
| 2.0 | 2026-02-04 | Simplified structure, fixed numbering, consolidated content |
| 2.1 | 2026-02-13 | Fixed: docs stay in `vibecode/` folder, AI verifies existence instead of copying |
