import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function SdksPage() {
  const pyCode = `pip install openai

from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.sapi.gateway/v1"
)

# Chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    stream=True
)

for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")`;

  const nodeCode = `npm install openai

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.sapi.gateway/v1",
});

// Streaming
const stream = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Explain quantum computing" }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}`;

  const curlNonStream = `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'`;

  const curlStream = `curl -X POST https://api.sapi.gateway/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }' --no-buffer`;

  return (
    <div>
      <h1 className="font-sans text-headline-xl mb-2">SDKs &amp; Tools</h1>
      <p className="font-sans text-body-lg text-on-surface-variant mb-8">
        sapi.gateway is fully compatible with the OpenAI SDK. Use any existing OpenAI tool or library.
      </p>

      <Tabs defaultValue="python">
        <TabsList>
          <TabsTrigger value="python">Python</TabsTrigger>
          <TabsTrigger value="node">Node.js</TabsTrigger>
          <TabsTrigger value="curl">cURL</TabsTrigger>
        </TabsList>
        <TabsContent value="python">
          <Card className="card-panel">
            <CardContent className="p-6">
              <h3 className="font-sans text-headline-md mb-4">Python SDK</h3>
              <p className="font-sans text-body-md text-on-surface-variant mb-4">
                Use the official OpenAI Python SDK. Just change the <code className="font-mono text-code-md bg-surface px-1.5 py-0.5 rounded">base_url</code>.
              </p>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{pyCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="node">
          <Card className="card-panel">
            <CardContent className="p-6">
              <h3 className="font-sans text-headline-md mb-4">Node.js SDK</h3>
              <p className="font-sans text-body-md text-on-surface-variant mb-4">
                Use the official OpenAI Node.js SDK. Just change the <code className="font-mono text-code-md bg-surface px-1.5 py-0.5 rounded">baseURL</code>.
              </p>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{nodeCode}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="curl">
          <Card className="card-panel">
            <CardContent className="p-6">
              <h3 className="font-sans text-headline-md mb-4">cURL</h3>
              <p className="font-sans text-body-md text-on-surface-variant mb-4">
                Direct HTTP requests work with any HTTP client.
              </p>
              <h4 className="font-mono text-label-sm text-on-surface-variant mb-2">Non-Streaming</h4>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto mb-4">
                <code>{curlNonStream}</code>
              </pre>
              <h4 className="font-mono text-label-sm text-on-surface-variant mb-2">Streaming</h4>
              <pre className="card-panel p-4 rounded-lg font-mono text-code-md text-on-surface overflow-x-auto">
                <code>{curlStream}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
