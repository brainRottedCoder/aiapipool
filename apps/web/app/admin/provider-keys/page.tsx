import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

export default function AdminProviderKeysPage() {
  const keys = [
    { id: "1", provider: "OpenRouter", credits: "$42.50 / $50.00", status: "ACTIVE", lastUsed: "2 min ago" },
    { id: "2", provider: "Together AI", credits: "$35.20 / $50.00", status: "ACTIVE", lastUsed: "5 min ago" },
    { id: "3", provider: "Groq", credits: "$0.00 / $50.00", status: "EXHAUSTED", lastUsed: "2 hours ago" },
    { id: "4", provider: "OpenAI", credits: "$48.90 / $50.00", status: "ACTIVE", lastUsed: "1 min ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-headline-xl mb-2">Provider Key Pool</h1>
          <p className="font-sans text-body-md text-on-surface-variant">
            {keys.filter(k => k.status === "ACTIVE").length} active, {keys.filter(k => k.status === "EXHAUSTED").length} exhausted
          </p>
        </div>
        <Link href="/admin/provider-keys/create">
          <Button variant="primary"><Plus className="w-4 h-4" /> Add Provider Key</Button>
        </Link>
      </div>
      <Card className="card-panel overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-subtle/50">
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Provider</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Credits</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Status</th>
                <th className="text-left p-4 font-mono text-label-sm text-on-surface-variant">Last Used</th>
                <th className="text-right p-4 font-mono text-label-sm text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-subtle/30">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-surface-hover/50">
                  <td className="p-4 font-sans text-body-md text-on-surface">{k.provider}</td>
                  <td className="p-4 font-mono text-code-md text-on-surface">{k.credits}</td>
                  <td className="p-4">
                    <Badge variant={k.status === "ACTIVE" ? "success" : "destructive"} className="text-xs">{k.status}</Badge>
                  </td>
                  <td className="p-4 font-mono text-code-md text-on-surface-variant">{k.lastUsed}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm"><RefreshCw className="w-4 h-4" /></Button>
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
