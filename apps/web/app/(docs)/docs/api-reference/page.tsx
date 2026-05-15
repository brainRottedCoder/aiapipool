"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiReferencePage() {
  return (
    <div>
      <h1 className="font-sans text-headline-xl mb-2">API Reference</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        Complete OpenAI-compatible endpoint specification.
      </p>

      {/* Chat Completions */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="success" className="font-mono text-xs px-2 py-0.5">POST</Badge>
          <code className="font-mono text-code-md text-on-surface">/v1/chat/completions</code>
        </div>
        <p className="font-sans text-body-md text-on-surface-variant mb-6">
          Create a chat completion. Supports streaming and non-streaming responses. Fully OpenAI-compatible.
        </p>

        <h3 className="font-sans text-headline-md mb-4">Request Body</h3>
        <Card className="card-panel overflow-hidden mb-6">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Field</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Required</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {[
                  { field: "model", type: "string", required: "Yes", desc: "Model identifier (e.g., gpt-4o, claude-3.5-sonnet)" },
                  { field: "messages", type: "array<object>", required: "Yes", desc: "Array of message objects with role and content" },
                  { field: "stream", type: "boolean", required: "No", desc: "Enable SSE streaming. Default: false" },
                  { field: "temperature", type: "number", required: "No", desc: "Sampling temperature (0-2). Default: 1" },
                  { field: "max_tokens", type: "integer", required: "No", desc: "Maximum tokens in response (1-32000)" },
                  { field: "top_p", type: "number", required: "No", desc: "Nucleus sampling parameter (0-1)" },
                ].map((row) => (
                  <tr key={row.field} className="hover:bg-surface-hover/50">
                    <td className="p-4 font-mono text-code-md text-primary">{row.field}</td>
                    <td className="p-4 font-mono text-code-md text-on-surface-variant">{row.type}</td>
                    <td className="p-4">
                      <Badge variant={row.required === "Yes" ? "default" : "outline"} className="text-xs">
                        {row.required}
                      </Badge>
                    </td>
                    <td className="p-4 font-sans text-body-md text-on-surface-variant">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <h3 className="font-sans text-headline-md mb-4 mt-8">Response</h3>
        <Card className="card-panel overflow-hidden mb-6">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-subtle/50">
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Field</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                  <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-subtle/30">
                {[
                  { field: "id", type: "string", desc: "Unique response identifier" },
                  { field: "object", type: "string", desc: "Always 'chat.completion'" },
                  { field: "choices", type: "array", desc: "Array of completion choices" },
                  { field: "usage", type: "object", desc: "Token usage: {prompt_tokens, completion_tokens, total_tokens}" },
                ].map((row) => (
                  <tr key={row.field} className="hover:bg-surface-hover/50">
                    <td className="p-4 font-mono text-code-md text-primary">{row.field}</td>
                    <td className="p-4 font-mono text-code-md text-on-surface-variant">{row.type}</td>
                    <td className="p-4 font-sans text-body-md text-on-surface-variant">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Error Codes */}
      <h2 id="errors" className="font-sans text-headline-lg mb-6">Error Codes</h2>
      <Card className="card-panel overflow-hidden mb-12">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Type</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {[
                { status: 400, type: "invalid_request_error", desc: "Malformed request body or invalid parameters." },
                { status: 401, type: "authentication_error", desc: "Missing or invalid API key." },
                { status: 402, type: "billing_error", desc: "Insufficient account balance. Top up to continue." },
                { status: 403, type: "authentication_error", desc: "Account suspended." },
                { status: 404, type: "not_found_error", desc: "Model not found in mapping table." },
                { status: 429, type: "rate_limit_error", desc: "Rate limit exceeded. Retry after the specified duration." },
                { status: 500, type: "server_error", desc: "Internal server error." },
                { status: 502, type: "server_error", desc: "Upstream provider failure. Retried with alternate keys." },
                { status: 503, type: "server_error", desc: "Service unavailable. No available provider keys." },
              ].map((row) => (
                <tr key={row.status} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-mono text-code-md text-on-surface">{row.status}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{row.type}</td>
                  <td className="p-4 font-sans text-body-md text-on-surface-variant">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
