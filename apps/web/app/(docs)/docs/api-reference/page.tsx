import { CodeTabs } from "@/components/code/code-tabs";
import { Badge } from "@/components/ui/badge";

const chatCompletionExample = {
  label: "Request",
  language: "json",
  code: `{
  "model": "gpt-4o",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024
}`,
};

const responseExample = {
  label: "Response",
  language: "json",
  code: `{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1716123456,
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 21,
    "completion_tokens": 9,
    "total_tokens": 30
  }
}`,
};

const streamExample = {
  label: "SSE Stream",
  language: "text",
  code: `data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk",...}
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk",...}
data: [DONE]`,
};

export default function ApiReferencePage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">API Reference</h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          Complete reference for the SAPI Gateway REST API.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="default" className="font-mono text-xs">POST</Badge>
            <code className="font-mono text-code-md text-on-surface">/v1/chat/completions</code>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant mb-4">
            Creates a model response for the given chat conversation. Supports streaming via Server-Sent Events.
          </p>
          <CodeTabs tabs={[chatCompletionExample, responseExample, streamExample]} defaultTab="Request" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="success" className="font-mono text-xs">GET</Badge>
            <code className="font-mono text-code-md text-on-surface">/health</code>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Health check endpoint. Returns service status and uptime.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="success" className="font-mono text-xs">GET</Badge>
            <code className="font-mono text-code-md text-on-surface">/api/user/me</code>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Returns current user profile, balance, and status. Requires session authentication.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="success" className="font-mono text-xs">GET</Badge>
            <code className="font-mono text-code-md text-on-surface">/api/user/usage</code>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Aggregated usage statistics by day or month. Query params: <code className="font-mono text-label-sm bg-surface px-1 rounded">period</code>, <code className="font-mono text-label-sm bg-surface px-1 rounded">model</code>.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="success" className="font-mono text-xs">GET</Badge>
            <code className="font-mono text-code-md text-on-surface">/api/user/ledger</code>
          </div>
          <p className="font-sans text-body-md text-on-surface-variant">
            Personal usage ledger entries. Query params: <code className="font-mono text-label-sm bg-surface px-1 rounded">limit</code>, <code className="font-mono text-label-sm bg-surface px-1 rounded">offset</code>.
          </p>
        </div>

        <div>
          <h2 id="errors" className="font-sans text-headline-lg mb-4">Error Codes</h2>
          <div className="card-panel rounded-xl p-6 space-y-3">
            {[
              { code: "invalid_request_error", status: "400", desc: "Missing required fields or invalid values." },
              { code: "authentication_error", status: "401", desc: "Invalid or missing API key / session token." },
              { code: "billing_error", status: "402", desc: "Insufficient balance to complete the request." },
              { code: "rate_limit_error", status: "429", desc: "Rate limit exceeded (RPM, tokens/day, or concurrent)." },
              { code: "server_error", status: "500", desc: "Internal gateway or upstream provider error." },
            ].map((e) => (
              <div key={e.code} className="flex items-start gap-3 py-2 border-b border-outline-subtle/30 last:border-0">
                <Badge variant="outline" className="font-mono text-xs shrink-0">{e.status}</Badge>
                <div>
                  <p className="font-mono text-body-md text-on-surface">{e.code}</p>
                  <p className="font-sans text-body-md text-on-surface-variant">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 id="rate-limits" className="font-sans text-headline-lg mb-4">Rate Limits</h2>
          <div className="card-panel rounded-xl p-6 space-y-2">
            <p className="font-sans text-body-md text-on-surface-variant">
              Each API key has configurable rate limits:
            </p>
            <ul className="list-disc list-inside space-y-1 font-sans text-body-md text-on-surface-variant">
              <li><strong>RPM</strong> (requests per minute): default 60</li>
              <li><strong>Tokens per day</strong>: default 100,000</li>
              <li><strong>Max concurrent</strong>: default 10 requests</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
