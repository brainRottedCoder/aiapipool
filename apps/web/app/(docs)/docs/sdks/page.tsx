import { CodeTabs } from "@/components/code/code-tabs";

const sdkExamples = [
  {
    label: "Python",
    language: "python",
    code: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_SAPI_KEY",
    base_url="https://api.sapi.gateway/v1",
)

# Chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
)

# Streaming
for chunk in client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Count to 10"}],
    stream=True,
):
    print(chunk.choices[0].delta.content or "", end="")`,
  },
  {
    label: "Node.js",
    language: "javascript",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_SAPI_KEY",
  baseURL: "https://api.sapi.gateway/v1",
});

// Chat completion
const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});

// Streaming
const stream = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Count to 10" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`,
  },
  {
    label: "cURL",
    language: "bash",
    code: `# Non-streaming
curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_SAPI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello!"}]}'

# Streaming
curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_SAPI_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello!"}],"stream":true}' \\
  --no-buffer`,
  },
];

export default function SdksPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-sans text-headline-xl mb-2">SDKs & Tools</h1>
        <p className="font-sans text-body-lg text-on-surface-variant">
          SAPI is fully compatible with the OpenAI SDK. Just change the base_url.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="font-sans text-headline-md mb-4">Official SDKs</h2>
          <CodeTabs tabs={sdkExamples} defaultTab="Python" />
        </div>

        <div>
          <h2 className="font-sans text-headline-md mb-4">Third-Party Compatibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "LangChain", desc: "Set openai_api_base to SAPI endpoint" },
              { name: "Cursor", desc: "Override OpenAI base URL in settings" },
              { name: "VSCode Copilot", desc: "Use custom OpenAI-compatible endpoint" },
              { name: "OpenWebUI", desc: "Add SAPI as an OpenAI API connection" },
            ].map((tool) => (
              <div key={tool.name} className="card-panel p-5">
                <h3 className="font-sans text-body-lg font-medium text-on-surface mb-1">{tool.name}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
