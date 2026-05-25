export type SourceStatus = "uploaded" | "processing" | "processed" | "failed";
export type SourceKind = "file" | "transcript" | "audio" | "video" | "note";

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "active" | "on_hold" | "archived";
  health: "on_track" | "at_risk" | "off_track";
  owner: string;
  updatedAt: string;
  summary: string;
  progress: number;
  sourceCount: number;
  openActions: number;
  openRisks: number;
}

export interface Source {
  id: string;
  projectId: string;
  name: string;
  kind: SourceKind;
  status: SourceStatus;
  sizeKb: number;
  addedBy: string;
  addedAt: string;
}

export interface MemoryItem {
  id: string;
  projectId: string;
  type: "decision" | "risk" | "action" | "question" | "stakeholder";
  title: string;
  detail: string;
  source: string;
  owner?: string;
  priority?: "low" | "med" | "high";
  date: string;
}

export interface ActionItem {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  due: string;
  status: "open" | "in_progress" | "done" | "blocked";
  priority: "low" | "med" | "high";
  source: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  type: string;
  title: string;
  createdAt: string;
  createdBy: string;
}

export interface Activity {
  id: string;
  projectId: string;
  projectName: string;
  text: string;
  when: string;
  actor: string;
}

export const projects: Project[] = [
  {
    id: "atlas",
    name: "Project Atlas — Series B Raise",
    client: "Internal · Finance",
    status: "active",
    health: "on_track",
    owner: "M. Chen",
    updatedAt: "2026-05-25T09:14:00Z",
    summary:
      "Coordinate Series B fundraise: data room readiness, investor narrative alignment, board approval.",
    progress: 68,
    sourceCount: 24,
    openActions: 9,
    openRisks: 2,
  },
  {
    id: "northwind",
    name: "Northwind ERP Migration",
    client: "Northwind Logistics",
    status: "active",
    health: "at_risk",
    owner: "R. Patel",
    updatedAt: "2026-05-24T17:42:00Z",
    summary:
      "Cutover from legacy SAP to Oracle Fusion across 14 warehouses. Phase 2 pilot underway in EMEA.",
    progress: 41,
    sourceCount: 87,
    openActions: 23,
    openRisks: 6,
  },
  {
    id: "helix",
    name: "Helix Product Launch",
    client: "Acme BioTech",
    status: "active",
    health: "on_track",
    owner: "S. Okafor",
    updatedAt: "2026-05-25T07:02:00Z",
    summary: "Q3 GTM launch of Helix diagnostic platform; regulatory + commercial workstreams.",
    progress: 54,
    sourceCount: 52,
    openActions: 14,
    openRisks: 3,
  },
  {
    id: "orion",
    name: "Orion Restructure",
    client: "Orion Industries",
    status: "active",
    health: "off_track",
    owner: "J. Werner",
    updatedAt: "2026-05-23T13:20:00Z",
    summary: "Org redesign across 3 BUs, severance plan, transition services agreement with buyer.",
    progress: 22,
    sourceCount: 31,
    openActions: 18,
    openRisks: 9,
  },
  {
    id: "kestrel",
    name: "Kestrel Board Prep Q2",
    client: "Internal · CEO Office",
    status: "active",
    health: "on_track",
    owner: "M. Chen",
    updatedAt: "2026-05-22T18:55:00Z",
    summary: "Q2 board materials, narrative, financial review, strategic priorities update.",
    progress: 80,
    sourceCount: 18,
    openActions: 5,
    openRisks: 1,
  },
  {
    id: "vega",
    name: "Vega EU Expansion",
    client: "Internal · Corp Dev",
    status: "on_hold",
    health: "at_risk",
    owner: "L. Bianchi",
    updatedAt: "2026-05-18T10:30:00Z",
    summary: "Market entry analysis for DACH region; partner shortlist and entity setup planning.",
    progress: 30,
    sourceCount: 12,
    openActions: 4,
    openRisks: 3,
  },
];

export const recentActivity: Activity[] = [
  {
    id: "a1",
    projectId: "northwind",
    projectName: "Northwind ERP Migration",
    text: "Processed transcript: EMEA Steering Committee — 5/24",
    when: "32m ago",
    actor: "AI",
  },
  {
    id: "a2",
    projectId: "atlas",
    projectName: "Project Atlas",
    text: "New decision extracted: Lead investor terms accepted at $14 pre",
    when: "1h ago",
    actor: "AI",
  },
  {
    id: "a3",
    projectId: "helix",
    projectName: "Helix Product Launch",
    text: "S. Okafor uploaded 3 sources (FDA correspondence)",
    when: "2h ago",
    actor: "S. Okafor",
  },
  {
    id: "a4",
    projectId: "orion",
    projectName: "Orion Restructure",
    text: "Risk flagged: Works council timeline slip — DE",
    when: "4h ago",
    actor: "AI",
  },
  {
    id: "a5",
    projectId: "kestrel",
    projectName: "Kestrel Board Prep",
    text: "Generated artifact: Executive Brief v3",
    when: "Yesterday",
    actor: "M. Chen",
  },
  {
    id: "a6",
    projectId: "northwind",
    projectName: "Northwind ERP Migration",
    text: "Action item closed: Confirm cutover window APAC",
    when: "Yesterday",
    actor: "R. Patel",
  },
];

export const sources: Source[] = [
  { id: "s1", projectId: "northwind", name: "EMEA Steering — 2026-05-24.vtt", kind: "transcript", status: "processed", sizeKb: 312, addedBy: "R. Patel", addedAt: "2026-05-24" },
  { id: "s2", projectId: "northwind", name: "Cutover Plan v4.docx", kind: "file", status: "processed", sizeKb: 845, addedBy: "R. Patel", addedAt: "2026-05-23" },
  { id: "s3", projectId: "northwind", name: "Sponsor Call 5-22.mp3", kind: "audio", status: "processing", sizeKb: 18420, addedBy: "R. Patel", addedAt: "2026-05-22" },
  { id: "s4", projectId: "northwind", name: "Risk Register.xlsx", kind: "file", status: "processed", sizeKb: 122, addedBy: "M. Chen", addedAt: "2026-05-20" },
  { id: "s5", projectId: "northwind", name: "Warehouse Walkthrough.mp4", kind: "video", status: "uploaded", sizeKb: 412000, addedBy: "R. Patel", addedAt: "2026-05-25" },
  { id: "s6", projectId: "northwind", name: "Vendor SOW redline.pdf", kind: "file", status: "failed", sizeKb: 1800, addedBy: "J. Werner", addedAt: "2026-05-19" },
  { id: "s7", projectId: "atlas", name: "Investor Q&A draft.md", kind: "note", status: "processed", sizeKb: 14, addedBy: "M. Chen", addedAt: "2026-05-24" },
  { id: "s8", projectId: "atlas", name: "Board meeting — 5-21.vtt", kind: "transcript", status: "processed", sizeKb: 410, addedBy: "M. Chen", addedAt: "2026-05-21" },
];

export const memory: MemoryItem[] = [
  { id: "m1", projectId: "northwind", type: "decision", title: "Defer APAC cutover to Q4", detail: "Steering committee approved moving APAC go-live from Sep 15 to Nov 3 due to integration gaps.", source: "EMEA Steering — 5/24", date: "2026-05-24", owner: "R. Patel" },
  { id: "m2", projectId: "northwind", type: "risk", title: "Master data quality below threshold", detail: "Vendor master dedupe at 78%; target 95% before cutover. May block invoice processing.", source: "Data Quality Audit", priority: "high", date: "2026-05-22" },
  { id: "m3", projectId: "northwind", type: "risk", title: "Sponsor capacity constrained in June", detail: "Executive sponsor on extended leave 6/8–6/22, reducing decision velocity.", source: "Sponsor Call 5-22", priority: "med", date: "2026-05-22" },
  { id: "m4", projectId: "northwind", type: "action", title: "Finalize cutover window with APAC ops", detail: "Need Tokyo + Singapore confirmation by 5/30.", source: "EMEA Steering — 5/24", owner: "K. Tanaka", priority: "high", date: "2026-05-24" },
  { id: "m5", projectId: "northwind", type: "question", title: "Will Finance accept parallel run of 4 weeks?", detail: "CFO requested justification; current plan is 6 weeks.", source: "Steering Notes", date: "2026-05-24" },
  { id: "m6", projectId: "northwind", type: "question", title: "What is fallback if Oracle environment slips?", detail: "No documented rollback path beyond Phase 1.", source: "Risk Register", date: "2026-05-20" },
  { id: "m7", projectId: "northwind", type: "stakeholder", title: "K. Tanaka — APAC Ops Lead", detail: "Decision authority for APAC cutover scheduling. Prefers async written updates.", source: "Stakeholder Map", date: "2026-05-10" },
  { id: "m8", projectId: "northwind", type: "stakeholder", title: "P. Müller — Works Council DE", detail: "Required sign-off before any role changes in DE warehouses.", source: "Stakeholder Map", date: "2026-05-10" },
  { id: "m9", projectId: "northwind", type: "decision", title: "Adopt phased license model", detail: "Approved 60/40 split between Phase 1 and Phase 2 to defer $1.2M.", source: "Cutover Plan v4", date: "2026-05-23" },
];

export const actions: ActionItem[] = [
  { id: "ac1", projectId: "northwind", title: "Finalize APAC cutover window", owner: "K. Tanaka", due: "2026-05-30", status: "in_progress", priority: "high", source: "EMEA Steering" },
  { id: "ac2", projectId: "northwind", title: "Dedupe vendor master to 95%", owner: "D. Silva", due: "2026-06-07", status: "open", priority: "high", source: "Data Quality Audit" },
  { id: "ac3", projectId: "northwind", title: "Draft fallback rollback plan", owner: "R. Patel", due: "2026-06-03", status: "open", priority: "high", source: "Risk Register" },
  { id: "ac4", projectId: "northwind", title: "Schedule Works Council session DE", owner: "P. Müller", due: "2026-05-29", status: "blocked", priority: "med", source: "Stakeholder Map" },
  { id: "ac5", projectId: "northwind", title: "Send sponsor brief for June absence", owner: "M. Chen", due: "2026-05-28", status: "open", priority: "med", source: "Sponsor Call" },
  { id: "ac6", projectId: "northwind", title: "Validate parallel run duration with CFO", owner: "M. Chen", due: "2026-06-01", status: "in_progress", priority: "med", source: "Steering Notes" },
  { id: "ac7", projectId: "northwind", title: "Confirm training delivery model APAC", owner: "K. Tanaka", due: "2026-06-10", status: "open", priority: "low", source: "Cutover Plan" },
  { id: "ac8", projectId: "northwind", title: "Close out Phase 1 lessons learned", owner: "R. Patel", due: "2026-05-26", status: "done", priority: "low", source: "Internal" },
];

export const artifacts: Artifact[] = [
  { id: "ar1", projectId: "northwind", type: "Executive Brief", title: "Northwind ERP — Week of May 19", createdAt: "2026-05-24", createdBy: "M. Chen" },
  { id: "ar2", projectId: "northwind", type: "Meeting Summary", title: "EMEA Steering Committee 5/24", createdAt: "2026-05-24", createdBy: "AI" },
  { id: "ar3", projectId: "northwind", type: "Project Plan", title: "Cutover Plan v4 — synthesized", createdAt: "2026-05-23", createdBy: "AI" },
  { id: "ar4", projectId: "northwind", type: "Follow-up Email", title: "Re: APAC cutover decision — to K. Tanaka", createdAt: "2026-05-24", createdBy: "M. Chen" },
];

export const ARTIFACT_TYPES = [
  { key: "exec_brief", label: "Executive Brief", desc: "One-page narrative for leadership: status, risks, asks." },
  { key: "meeting_summary", label: "Meeting Summary", desc: "Decisions, actions, open questions from a meeting." },
  { key: "prd", label: "Product Requirements Doc", desc: "PRD synthesized from sources and decisions." },
  { key: "sop", label: "Standard Operating Procedure", desc: "Step-by-step SOP derived from project memory." },
  { key: "project_plan", label: "Project Plan", desc: "Workstreams, milestones, owners, dependencies." },
  { key: "followup_email", label: "Follow-up Email", desc: "Drafted recap email to a stakeholder." },
  { key: "meeting_prep", label: "Meeting Prep", desc: "Briefing pack with context, talking points, decisions needed." },
];

export function projectById(id: string) {
  return projects.find((p) => p.id === id);
}
