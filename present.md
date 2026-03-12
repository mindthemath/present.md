# Single Line Text
Clear priorities, measurable outcomes, and faster iteration.

[overview](/view.html)

---

## Numbered List
1. Context and goals
2. Audience and use cases
3. Product capabilities
4. Technical direction
5. Delivery plan

---

## Text with Quote Block
Our current workflow is functional but fragmented.

> Teams are shipping features, but shared visibility and consistency are lagging behind delivery speed.

Key objective: reduce coordination overhead while increasing release confidence.

---

<!-- .slide: class="standalone-table-slide" -->
## Centered Data Table
| User Type | Primary Need | Success Signal |
| --- | --- | --- |
| PM | Track progress clearly | Fewer status meetings |
| Engineer | Ship safely | Lower rollback rate |
| Design | Maintain consistency | Fewer UI regressions |
| Support | Resolve issues faster | Shorter response time |

---

## Bullet List
- Planning: scoped milestones and ownership
- Build: reusable patterns and templates
- Validate: automated checks and quality gates
- Observe: real-time health metrics and alerts
- Iterate: fast feedback loop from production

---

## JSON Code Block
```json
{
  "project": "onboarding-revamp",
  "owner": "team-growth",
  "status": "in_progress",
  "milestone": "beta",
  "metrics": {
    "activation_rate": 0.41,
    "error_rate": 0.012
  }
}
```

---

## Two Code Fences (Bash + Text)
```bash
curl -X POST https://api.example.com/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d @payload.json
```

```text
201 Created
Location: /v1/projects/onboarding-revamp
```

---

## Python Code Block with Basement Slides
```python
from typing import Any


def validate_payload(payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    if not payload.get("project"):
        errors.append("project is required")
    if payload.get("status") not in {"planned", "in_progress", "blocked", "done"}:
        errors.append("status must be one of planned/in_progress/blocked/done")

    metrics = payload.get("metrics", {})
    if not isinstance(metrics.get("activation_rate"), (int, float)):
        errors.append("metrics.activation_rate must be numeric")

    return errors
```

--

## Basement Slide: Python Code Block
```python
from dataclasses import dataclass
from typing import Any


@dataclass
class ValidationResult:
    ok: bool
    errors: list[str]
    score: float


def summarize(payload: dict[str, Any]) -> ValidationResult:
    errors = validate_payload(payload)
    activation = float(payload.get("metrics", {}).get("activation_rate", 0))
    penalty = 0.12 * len(errors)
    score = max(0.0, min(1.0, activation - penalty))
    return ValidationResult(ok=not errors, errors=errors, score=score)
```

---

## TypeScript Code Block (Short Snippet) & Math
```ts
type Status = "planned" | "in_progress" | "blocked" | "done";

export function badgeColor(status: Status): string {
  const palette: Record<Status, string> = {
    planned: "#6b7280",
    in_progress: "#2563eb",
    blocked: "#dc2626",
    done: "#16a34a",
  };

  return palette[status];
}
```

```math
E = mc^2
```

```math
\int_0^\infty e^{-x^2} \, \ dx = \frac{\sqrt{\pi}}{2}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="ts" -->
## Code Walkthrough: Full Context [1/3]
```ts [1-200]
type Stage = "queued" | "running" | "blocked" | "done";

type WorkItem = {
  id: string;
  title: string;
  team: "core" | "growth" | "platform";
  owner: string;
  stage: Stage;
  effort: number;
  risk: number;
  updatedAt: string;
};

type TeamSummary = {
  team: WorkItem["team"];
  total: number;
  running: number;
  blocked: number;
  done: number;
  avgRisk: number;
  health: "green" | "yellow" | "red";
};

const HEALTH_LIMITS = {
  green: 0.28,
  yellow: 0.56,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRiskScore(item: WorkItem): number {
  const stageWeight: Record<Stage, number> = {
    queued: 0.2,
    running: 0.4,
    blocked: 0.9,
    done: 0.1,
  };

  const effortFactor = clamp(item.effort / 13, 0, 1);
  const base = 0.65 * item.risk + 0.35 * effortFactor;
  return clamp(base * stageWeight[item.stage], 0, 1);
}

function groupByTeam(items: WorkItem[]): Record<WorkItem["team"], WorkItem[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.team].push(item);
      return acc;
    },
    { core: [], growth: [], platform: [] } as Record<WorkItem["team"], WorkItem[]>
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function healthFromRisk(avgRisk: number): TeamSummary["health"] {
  if (avgRisk <= HEALTH_LIMITS.green) return "green";
  if (avgRisk <= HEALTH_LIMITS.yellow) return "yellow";
  return "red";
}

function summarizeTeam(team: WorkItem["team"], items: WorkItem[]): TeamSummary {
  const risks = items.map(toRiskScore);
  const avgRisk = average(risks);

  return {
    team,
    total: items.length,
    running: items.filter((item) => item.stage === "running").length,
    blocked: items.filter((item) => item.stage === "blocked").length,
    done: items.filter((item) => item.stage === "done").length,
    avgRisk: Number(avgRisk.toFixed(3)),
    health: healthFromRisk(avgRisk),
  };
}

export function buildTeamDashboard(items: WorkItem[]): TeamSummary[] {
  const grouped = groupByTeam(items);

  const summaries = (Object.keys(grouped) as WorkItem["team"][]).map((team) =>
    summarizeTeam(team, grouped[team])
  );

  return summaries.sort((a, b) => b.avgRisk - a.avgRisk);
}

export function formatTeamSummary(summary: TeamSummary): string {
  const parts = [
    `team=${summary.team}`,
    `health=${summary.health}`,
    `total=${summary.total}`,
    `running=${summary.running}`,
    `blocked=${summary.blocked}`,
    `done=${summary.done}`,
    `avgRisk=${summary.avgRisk.toFixed(2)}`,
  ];

  return parts.join(" | ");
}

export function formatDashboard(rows: TeamSummary[]): string[] {
  return rows.map(formatTeamSummary);
}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="ts" -->
## Code Walkthrough: Mid-File Focus [2/3]
```ts [33-44]
type Stage = "queued" | "running" | "blocked" | "done";

type WorkItem = {
  id: string;
  title: string;
  team: "core" | "growth" | "platform";
  owner: string;
  stage: Stage;
  effort: number;
  risk: number;
  updatedAt: string;
};

type TeamSummary = {
  team: WorkItem["team"];
  total: number;
  running: number;
  blocked: number;
  done: number;
  avgRisk: number;
  health: "green" | "yellow" | "red";
};

const HEALTH_LIMITS = {
  green: 0.28,
  yellow: 0.56,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRiskScore(item: WorkItem): number {
  const stageWeight: Record<Stage, number> = {
    queued: 0.2,
    running: 0.4,
    blocked: 0.9,
    done: 0.1,
  };

  const effortFactor = clamp(item.effort / 13, 0, 1);
  const base = 0.65 * item.risk + 0.35 * effortFactor;
  return clamp(base * stageWeight[item.stage], 0, 1);
}

function groupByTeam(items: WorkItem[]): Record<WorkItem["team"], WorkItem[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.team].push(item);
      return acc;
    },
    { core: [], growth: [], platform: [] } as Record<WorkItem["team"], WorkItem[]>
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function healthFromRisk(avgRisk: number): TeamSummary["health"] {
  if (avgRisk <= HEALTH_LIMITS.green) return "green";
  if (avgRisk <= HEALTH_LIMITS.yellow) return "yellow";
  return "red";
}

function summarizeTeam(team: WorkItem["team"], items: WorkItem[]): TeamSummary {
  const risks = items.map(toRiskScore);
  const avgRisk = average(risks);

  return {
    team,
    total: items.length,
    running: items.filter((item) => item.stage === "running").length,
    blocked: items.filter((item) => item.stage === "blocked").length,
    done: items.filter((item) => item.stage === "done").length,
    avgRisk: Number(avgRisk.toFixed(3)),
    health: healthFromRisk(avgRisk),
  };
}

export function buildTeamDashboard(items: WorkItem[]): TeamSummary[] {
  const grouped = groupByTeam(items);

  const summaries = (Object.keys(grouped) as WorkItem["team"][]).map((team) =>
    summarizeTeam(team, grouped[team])
  );

  return summaries.sort((a, b) => b.avgRisk - a.avgRisk);
}

export function formatTeamSummary(summary: TeamSummary): string {
  const parts = [
    `team=${summary.team}`,
    `health=${summary.health}`,
    `total=${summary.total}`,
    `running=${summary.running}`,
    `blocked=${summary.blocked}`,
    `done=${summary.done}`,
    `avgRisk=${summary.avgRisk.toFixed(2)}`,
  ];

  return parts.join(" | ");
}

export function formatDashboard(rows: TeamSummary[]): string[] {
  return rows.map(formatTeamSummary);
}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="ts" -->
## Code Walkthrough: Lower-File Focus [3/3]
```ts [92-104]
type Stage = "queued" | "running" | "blocked" | "done";

type WorkItem = {
  id: string;
  title: string;
  team: "core" | "growth" | "platform";
  owner: string;
  stage: Stage;
  effort: number;
  risk: number;
  updatedAt: string;
};

type TeamSummary = {
  team: WorkItem["team"];
  total: number;
  running: number;
  blocked: number;
  done: number;
  avgRisk: number;
  health: "green" | "yellow" | "red";
};

const HEALTH_LIMITS = {
  green: 0.28,
  yellow: 0.56,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toRiskScore(item: WorkItem): number {
  const stageWeight: Record<Stage, number> = {
    queued: 0.2,
    running: 0.4,
    blocked: 0.9,
    done: 0.1,
  };

  const effortFactor = clamp(item.effort / 13, 0, 1);
  const base = 0.65 * item.risk + 0.35 * effortFactor;
  return clamp(base * stageWeight[item.stage], 0, 1);
}

function groupByTeam(items: WorkItem[]): Record<WorkItem["team"], WorkItem[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.team].push(item);
      return acc;
    },
    { core: [], growth: [], platform: [] } as Record<WorkItem["team"], WorkItem[]>
  );
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function healthFromRisk(avgRisk: number): TeamSummary["health"] {
  if (avgRisk <= HEALTH_LIMITS.green) return "green";
  if (avgRisk <= HEALTH_LIMITS.yellow) return "yellow";
  return "red";
}

function summarizeTeam(team: WorkItem["team"], items: WorkItem[]): TeamSummary {
  const risks = items.map(toRiskScore);
  const avgRisk = average(risks);

  return {
    team,
    total: items.length,
    running: items.filter((item) => item.stage === "running").length,
    blocked: items.filter((item) => item.stage === "blocked").length,
    done: items.filter((item) => item.stage === "done").length,
    avgRisk: Number(avgRisk.toFixed(3)),
    health: healthFromRisk(avgRisk),
  };
}

export function buildTeamDashboard(items: WorkItem[]): TeamSummary[] {
  const grouped = groupByTeam(items);

  const summaries = (Object.keys(grouped) as WorkItem["team"][]).map((team) =>
    summarizeTeam(team, grouped[team])
  );

  return summaries.sort((a, b) => b.avgRisk - a.avgRisk);
}

export function formatTeamSummary(summary: TeamSummary): string {
  const parts = [
    `team=${summary.team}`,
    `health=${summary.health}`,
    `total=${summary.total}`,
    `running=${summary.running}`,
    `blocked=${summary.blocked}`,
    `done=${summary.done}`,
    `avgRisk=${summary.avgRisk.toFixed(2)}`,
  ];

  return parts.join(" | ");
}

export function formatDashboard(rows: TeamSummary[]): string[] {
  return rows.map(formatTeamSummary);
}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="rust" -->
## Rust Walkthrough: Full Context [1/3]
```rust [1-50]
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
enum Stage {
    Queued,
    Running,
    Blocked,
    Done,
}

#[derive(Clone, Debug)]
struct WorkItem {
    team: &'static str,
    stage: Stage,
    effort: f32,
    risk: f32,
}

fn clamp(value: f32, min: f32, max: f32) -> f32 {
    value.max(min).min(max)
}

fn risk_score(item: &WorkItem) -> f32 {
    let stage_weight = match item.stage {
        Stage::Queued => 0.2,
        Stage::Running => 0.4,
        Stage::Blocked => 0.9,
        Stage::Done => 0.1,
    };
    let effort_factor = clamp(item.effort / 13.0, 0.0, 1.0);
    clamp((0.65 * item.risk + 0.35 * effort_factor) * stage_weight, 0.0, 1.0)
}

fn summarize(items: &[WorkItem]) -> HashMap<&'static str, f32> {
    let mut grouped: HashMap<&'static str, Vec<f32>> = HashMap::new();
    for item in items {
        grouped.entry(item.team).or_default().push(risk_score(item));
    }
    grouped
        .into_iter()
        .map(|(team, scores)| {
            let avg = scores.iter().sum::<f32>() / scores.len() as f32;
            (team, (avg * 100.0).round() / 100.0)
        })
        .collect()
}

fn format_summary(team: &str, score: f32) -> String {
    format!("team={} | avg_risk={:.2}", team, score)
}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="rust" -->
## Rust Walkthrough: Multi-Range Focus [2/3]
```rust [19-32,48-50]
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
enum Stage {
    Queued,
    Running,
    Blocked,
    Done,
}

#[derive(Clone, Debug)]
struct WorkItem {
    team: &'static str,
    stage: Stage,
    effort: f32,
    risk: f32,
}

fn clamp(value: f32, min: f32, max: f32) -> f32 {
    value.max(min).min(max)
}

fn risk_score(item: &WorkItem) -> f32 {
    let stage_weight = match item.stage {
        Stage::Queued => 0.2,
        Stage::Running => 0.4,
        Stage::Blocked => 0.9,
        Stage::Done => 0.1,
    };
    let effort_factor = clamp(item.effort / 13.0, 0.0, 1.0);
    clamp((0.65 * item.risk + 0.35 * effort_factor) * stage_weight, 0.0, 1.0)
}

fn summarize(items: &[WorkItem]) -> HashMap<&'static str, f32> {
    let mut grouped: HashMap<&'static str, Vec<f32>> = HashMap::new();
    for item in items {
        grouped.entry(item.team).or_default().push(risk_score(item));
    }
    grouped
        .into_iter()
        .map(|(team, scores)| {
            let avg = scores.iter().sum::<f32>() / scores.len() as f32;
            (team, (avg * 100.0).round() / 100.0)
        })
        .collect()
}

fn format_summary(team: &str, score: f32) -> String {
    format!("team={} | avg_risk={:.2}", team, score)
}
```

---

<!-- .slide: data-auto-animate class="code-walkthrough" data-walkthrough-group="rust" -->
## Rust Walkthrough: Lower-File Focus [3/3]
```rust [34-45,48-50]
use std::collections::HashMap;

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
enum Stage {
    Queued,
    Running,
    Blocked,
    Done,
}

#[derive(Clone, Debug)]
struct WorkItem {
    team: &'static str,
    stage: Stage,
    effort: f32,
    risk: f32,
}

fn clamp(value: f32, min: f32, max: f32) -> f32 {
    value.max(min).min(max)
}

fn risk_score(item: &WorkItem) -> f32 {
    let stage_weight = match item.stage {
        Stage::Queued => 0.2,
        Stage::Running => 0.4,
        Stage::Blocked => 0.9,
        Stage::Done => 0.1,
    };
    let effort_factor = clamp(item.effort / 13.0, 0.0, 1.0);
    clamp((0.65 * item.risk + 0.35 * effort_factor) * stage_weight, 0.0, 1.0)
}

fn summarize(items: &[WorkItem]) -> HashMap<&'static str, f32> {
    let mut grouped: HashMap<&'static str, Vec<f32>> = HashMap::new();
    for item in items {
        grouped.entry(item.team).or_default().push(risk_score(item));
    }
    grouped
        .into_iter()
        .map(|(team, scores)| {
            let avg = scores.iter().sum::<f32>() / scores.len() as f32;
            (team, (avg * 100.0).round() / 100.0)
        })
        .collect()
}

fn format_summary(team: &str, score: f32) -> String {
    format!("team={} | avg_risk={:.2}", team, score)
}
```

---

<!-- .slide: class="standalone-table-slide" -->
## Standalone Table (Centered) with Basement Slides
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Scope creep | Delays | Strict milestone definitions |
| Data quality gaps | Misleading insights | Validation at ingest |
| Adoption friction | Low usage | Guided onboarding and docs |
| Performance regressions | Poor UX | Budgets + continuous profiling |

--

## Basement Slide: Bullet List
- Leading signal: milestone spillover week-over-week
- Trigger threshold: >20% of tasks pushed from current sprint
- Containment:
  - freeze net-new scope for one cycle
  - split critical/non-critical paths
    - add checkpoint at 50% completion
  - review risk/mitigation plan at 50% completion

--

## Mixed Content: Text Fence + List + Table
```text
SLO Target: 99.9%
Error Budget (30d): 43m 49s
Current Burn Rate: 1.7x
Status: At risk (mitigation active)
```
- Rollback criteria pre-defined per release
- Canary window extended from 15m to 45m
- On-call handoff checklist required before deploy

| Signal | Target | Current |
| --- | --- | --- |
| P95 latency | < 250ms | 312ms |
| Error rate | < 0.10% | 0.18% |
| Availability | >= 99.90% | 99.82% |

---

## End of Demonstration
built with reveal.js
<p class="byline">by mathematicalmichael</p>
