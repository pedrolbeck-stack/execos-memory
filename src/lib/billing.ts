export const plans = [
  {
    key: "free",
    name: "Free Preview",
    price: "$0",
    cadence: "forever",
    audience: "For exploring the product loop",
    cta: "Current preview",
    featured: false,
    features: [
      "1 user",
      "3 active projects",
      "Limited source uploads",
      "Limited AI generations",
      "Demo workspace data",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$19",
    cadence: "user / month",
    audience: "For founders, consultants, and solo operators",
    cta: "Choose Pro",
    featured: false,
    features: [
      "10 active projects",
      "Project memory and AI console",
      "Meeting summaries and executive briefs",
      "PRDs, SOPs, project plans, and emails",
      "Included monthly processing allowance",
    ],
  },
  {
    key: "team",
    name: "Team",
    price: "$39",
    cadence: "user / month",
    annualPrice: "$29 annual",
    audience: "For shared operating teams",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "3+ seats",
      "Shared workspace memory",
      "Team action tracking",
      "Pooled AI processing",
      "Role-based access",
      "Higher storage and meeting limits",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: "$69",
    cadence: "user / month",
    annualPrice: "$49 annual",
    audience: "For teams running strategic programs",
    cta: "Talk to sales",
    featured: false,
    features: [
      "Everything in Team",
      "M365, Teams, SharePoint, and OneDrive path",
      "Admin controls and audit logs",
      "Advanced templates and reporting",
      "Custom retention controls",
      "Priority processing",
    ],
  },
];

export const processingPacks = [
  {
    name: "Extra Processing",
    price: "$20",
    units: "small pack",
    description: "For extra meeting uploads, source processing, and artifact generation.",
  },
  {
    name: "Team Processing",
    price: "$100",
    units: "pooled pack",
    description: "Shared processing capacity for heavier team workspaces.",
  },
];

export const onboardingSteps = [
  {
    title: "Create an initiative",
    body: "Start with a strategic project, customer, partner motion, or internal program.",
    signal: "Workspace memory begins around a real business objective.",
  },
  {
    title: "Add messy context",
    body: "Upload transcripts, notes, files, and recordings from the workstream.",
    signal: "ExecOS extracts decisions, risks, actions, questions, and stakeholders.",
  },
  {
    title: "Ask executive questions",
    body: "Use the AI console to ask what changed, what is blocked, and who owns what.",
    signal: "Answers stay grounded in project memory and source context.",
  },
  {
    title: "Generate the work product",
    body: "Create briefs, PRDs, SOPs, project plans, follow-up emails, and meeting prep.",
    signal: "The output becomes reusable team knowledge, not another lost chat.",
  },
];
