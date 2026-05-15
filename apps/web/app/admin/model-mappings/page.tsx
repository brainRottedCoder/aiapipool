import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminModelMappingsPage() {
  const mappings = [
    { id: "1", alias: "gpt-4o", provider: "OpenAI", providerModelId: "gpt-4o", inputPrice: "$2.50", outputPrice: "$10.00", status: "ACTIVE" },
    { id: "2", alias: "claude-3.5-sonnet", provider: "Anthropic", providerModelId: "claude-3-5-sonnet-20241022", inputPrice: "$3.00", outputPrice: "$15.00", status: "ACTIVE" },
    { id: "3", alias: "llama-3.1-70b", provider: "Together AI", providerModelId: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", inputPrice: "$0.90", outputPrice: "$0.90", status: "ACTIVE" },
    { id: "4", alias: "gemini-1.5-pro", provider: "Google", providerModelId: "gemini-1.5-pro", inputPrice: "$1.25", outputPrice: "$5.00", status: "ACTIVE" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Model Mappings</h1>
          <p className="font-sans text-body-md text-on-surface-variant">Map model aliases to provider model IDs with pricing.</p>
        </div>
        <Link href="/admin/model-mappings/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> Add Mapping</Button>
        </Link>
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Alias</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Provider</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Provider Model ID</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Input / 1M</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Output / 1M</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                <th className="text-right p-4 font-mono text-label-sm text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {mappings.map((m) => (
                <tr key={m.id} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-mono text-code-md text-primary">{m.alias}</td>
                  <td className="p-4 font-sans text-body-md text-on-surface">{m.provider}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant text-xs">{m.providerModelId}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{m.inputPrice}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{m.outputPrice}</td>
                  <td className="p-4"><Badge variant="success" className="text-xs">{m.status}</Badge></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
