export const SITE = {
  name: "SAPI",
  tagline: "One API. Every model. Zero overhead.",
  description:
    "Universal OpenAI-compatible gateway with intelligent key pooling, automatic failover, and real-time credit tracking.",
  url: "https://sapi.gateway",
};

export const NAV_LINKS = [
  { label: "Platform", href: "/" },
  { label: "Models", href: "/models" },
  { label: "Docs", href: "/docs" },
  { label: "API Reference", href: "/docs/api-reference" },
  { label: "Pricing", href: "/pricing" },
  { label: "Status", href: "/status" },
];

export const PROVIDERS = [
  { name: "OpenRouter", icon: "Router", latency: 124, uptime: 99.98, status: "healthy" },
  { name: "Together AI", icon: "Layers", latency: 95, uptime: 99.95, status: "healthy" },
  { name: "Groq", icon: "Zap", latency: 18, uptime: 99.99, status: "healthy" },
  { name: "OpenAI", icon: "Cpu", latency: 315, uptime: 99.95, status: "healthy" },
  { name: "Anthropic", icon: "Brain", latency: 420, uptime: 99.90, status: "degraded" },
  { name: "Gemini", icon: "Sparkles", latency: 280, uptime: 99.92, status: "healthy" },
];

export const FEATURES = [
  {
    title: "Universal Compatibility",
    description: "OpenAI-compatible API. Any model from any provider through a single endpoint.",
    icon: "Globe",
  },
  {
    title: "Intelligent Key Pool",
    description: "Automatic key rotation, credit tracking, and failover across your managed provider key pool.",
    icon: "Key",
  },
  {
    title: "Real-Time Streaming",
    description: "SSE streaming with token-level cost tracking. Drop-in replacement for OpenAI SDKs.",
    icon: "Zap",
  },
  {
    title: "Provider Agnostic",
    description: "Pluggable adapter architecture. 6+ providers supported with extensible adapter system.",
    icon: "Layers",
  },
  {
    title: "Observability Built-In",
    description: "Request logs, latency charts, margin analytics. Complete operational visibility.",
    icon: "Activity",
  },
  {
    title: "Enterprise Security",
    description: "AES-256-GCM encryption, HMAC-SHA256 hashing, immutable audit ledger, zero content logging.",
    icon: "Shield",
  },
];

export const MODEL_PRICES = [
  {
    model: "gpt-4o",
    provider: "OpenAI",
    inputPrice: 2.5,
    outputPrice: 10.0,
    contextWindow: "128k",
    maxOutput: "16k",
    capabilities: ["Vision", "Tool Use", "JSON Mode"],
    status: "operational",
  },
  {
    model: "claude-3.5-sonnet",
    provider: "Anthropic",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: "200k",
    maxOutput: "8k",
    capabilities: ["Vision", "Tool Use", "Computer Use"],
    status: "operational",
  },
  {
    model: "llama-3.1-70b",
    provider: "Together AI",
    inputPrice: 0.9,
    outputPrice: 0.9,
    contextWindow: "128k",
    maxOutput: "8k",
    capabilities: ["Tool Use", "JSON Mode"],
    status: "operational",
  },
  {
    model: "mixtral-8x7b",
    provider: "OpenRouter",
    inputPrice: 0.6,
    outputPrice: 0.6,
    contextWindow: "32k",
    maxOutput: "4k",
    capabilities: ["JSON Mode"],
    status: "operational",
  },
  {
    model: "gemini-1.5-pro",
    provider: "Google",
    inputPrice: 1.25,
    outputPrice: 5.0,
    contextWindow: "1M",
    maxOutput: "8k",
    capabilities: ["Vision", "Tool Use", "Audio"],
    status: "operational",
  },
  {
    model: "llama-3.2-90b",
    provider: "Groq",
    inputPrice: 0.7,
    outputPrice: 0.8,
    contextWindow: "128k",
    maxOutput: "8k",
    capabilities: ["Tool Use", "JSON Mode"],
    status: "operational",
  },
];

export const MODELS = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: "128k",
    maxOutput: "16k",
    capabilities: ["Vision", "Tool Use", "JSON Mode"],
    status: "operational",
  },
  {
    name: "GPT-4o-mini",
    provider: "OpenAI",
    contextWindow: "128k",
    maxOutput: "16k",
    capabilities: ["Vision", "Tool Use", "JSON Mode"],
    status: "operational",
  },
  {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextWindow: "200k",
    maxOutput: "8k",
    capabilities: ["Vision", "Tool Use", "Computer Use"],
    status: "operational",
  },
  {
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextWindow: "200k",
    maxOutput: "4k",
    capabilities: ["Vision", "Tool Use"],
    status: "operational",
  },
  {
    name: "Llama 3.1 70B",
    provider: "Together AI",
    contextWindow: "128k",
    maxOutput: "8k",
    capabilities: ["Tool Use", "JSON Mode"],
    status: "operational",
  },
  {
    name: "Llama 3.1 8B",
    provider: "Together AI",
    contextWindow: "128k",
    maxOutput: "4k",
    capabilities: ["JSON Mode"],
    status: "operational",
  },
  {
    name: "Mixtral 8x7B",
    provider: "OpenRouter",
    contextWindow: "32k",
    maxOutput: "4k",
    capabilities: ["JSON Mode"],
    status: "operational",
  },
  {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    contextWindow: "1M",
    maxOutput: "8k",
    capabilities: ["Vision", "Tool Use", "Audio"],
    status: "operational",
  },
  {
    name: "Llama 3.2 90B",
    provider: "Groq",
    contextWindow: "128k",
    maxOutput: "8k",
    capabilities: ["Tool Use", "JSON Mode"],
    status: "operational",
  },
];

export const DASHBOARD_SIDEBAR = [
  {
    section: "Core",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "API Keys", href: "/dashboard/api-keys", icon: "Key" },
      { label: "Usage", href: "/dashboard/usage", icon: "BarChart3" },
      { label: "Billing", href: "/dashboard/billing", icon: "CreditCard" },
    ],
  },
  {
    section: "Resources",
    items: [
      { label: "Documentation", href: "/docs", icon: "BookOpen" },
      { label: "API Reference", href: "/docs/api-reference", icon: "Code2" },
      { label: "Status", href: "/status", icon: "Activity" },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "Settings", href: "/settings/profile", icon: "Settings" },
      { label: "Help", href: "/help", icon: "HelpCircle" },
    ],
  },
];

export const ADMIN_SIDEBAR = [
  {
    section: "Admin",
    items: [
      { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
      { label: "Users", href: "/admin/users", icon: "Users" },
      { label: "Provider Keys", href: "/admin/provider-keys", icon: "Key" },
      { label: "Model Mappings", href: "/admin/model-mappings", icon: "GitBranch" },
    ],
  },
  {
    section: "Analytics",
    items: [
      { label: "Activity", href: "/admin/activity", icon: "Activity" },
      { label: "Margins", href: "/admin/margins", icon: "TrendingUp" },
      { label: "Ledgers", href: "/admin/ledgers", icon: "ScrollText" },
      { label: "Health", href: "/admin/health", icon: "HeartPulse" },
    ],
  },
  {
    section: "Operations",
    items: [
      { label: "Emergency", href: "/admin/emergency", icon: "AlertTriangle" },
    ],
  },
];

export const DOCS_SIDEBAR = [
  {
    section: "Getting Started",
    items: [
      { label: "Overview", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Authentication", href: "/docs#authentication" },
    ],
  },
  {
    section: "API Reference",
    items: [
      { label: "Chat Completions", href: "/docs/api-reference" },
      { label: "Streaming", href: "/docs/api-reference#streaming" },
      { label: "Models", href: "/models" },
      { label: "Error Codes", href: "/docs/api-reference#errors" },
      { label: "Rate Limits", href: "/docs/api-reference#rate-limits" },
    ],
  },
  {
    section: "SDKs & Tools",
    items: [
      { label: "Python", href: "/docs/sdks#python" },
      { label: "Node.js", href: "/docs/sdks#nodejs" },
      { label: "cURL", href: "/docs/sdks#curl" },
    ],
  },
  {
    section: "Guides",
    items: [
      { label: "Key Management", href: "/docs#key-management" },
      { label: "Error Handling", href: "/docs#error-handling" },
      { label: "Best Practices", href: "/docs#best-practices" },
    ],
  },
];
