"use client";

import { motion } from "framer-motion";
import { Activity, BarChart3, TrendingUp, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROVIDERS } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function StatusPage() {
  return (
    <main className="pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-screen">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="font-sans text-headline-xl mb-2">System Status</h1>
            <p className="font-sans text-body-lg text-on-surface-variant">Real-time infrastructure health and latency monitoring.</p>
          </div>
          <div className="flex items-center gap-3 card-panel rounded-lg px-4 py-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse-dot-green" />
            <span className="font-mono text-code-md text-green-400 font-medium">All systems operational</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Current Traffic", value: "14.2k", unit: "req/s", icon: Activity, trend: 65 },
            { label: "Global Latency", value: "85", unit: "ms", icon: Globe, trend: 42 },
            { label: "Error Rate", value: "0.04", unit: "%", icon: BarChart3, trend: 15 },
            { label: "Uptime (30d)", value: "99.98", unit: "%", icon: TrendingUp, trend: 92 },
          ].map((stat) => (
            <Card key={stat.label} className="card-panel-hover p-5">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div>
                  <span className="font-sans text-headline-xl text-on-surface">{stat.value}</span>
                  <span className="font-mono text-code-md text-primary ml-1">{stat.unit}</span>
                </div>
                <div className="w-full bg-surface rounded-full h-1">
                  <div className="bg-primary h-1 rounded-full" style={{ width: `${stat.trend}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Latency Chart */}
        <Card className="card-panel p-6 mb-8">
          <CardContent className="p-0">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-subtle/50">
              <h2 className="font-sans text-headline-md text-on-surface">Global Latency</h2>
              <div className="flex gap-2">
                {["1H", "24H", "7D"].map((t) => (
                  <Badge key={t} variant={t === "24H" ? "default" : "outline"} className="cursor-pointer">{t}</Badge>
                ))}
              </div>
            </div>
            <div className="relative h-[200px] flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent border-t-2 border-primary"
                style={{ clipPath: "polygon(0 100%, 5% 70%, 10% 75%, 15% 60%, 20% 65%, 25% 50%, 30% 55%, 35% 40%, 40% 45%, 45% 30%, 50% 35%, 55% 20%, 60% 30%, 65% 15%, 70% 25%, 75% 10%, 80% 20%, 85% 8%, 90% 18%, 95% 5%, 100% 12%, 100% 100%)" }}
              />
              <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
                {[...Array(5)].map((_, i) => <div key={i} className="border-t border-white w-full" />)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Grid */}
        <h2 className="font-sans text-headline-md mb-4">Provider Endpoints</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {PROVIDERS.map((provider) => (
            <Card key={provider.name} className="card-panel-hover p-5 group">
              <CardContent className="p-0 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-outline-subtle">
                      <span className="font-mono text-label-sm text-on-surface font-bold">{provider.name.slice(0, 2)}</span>
                    </div>
                    <span className="font-sans text-body-lg font-semibold text-on-surface">{provider.name}</span>
                  </div>
                  <div className={provider.status === "healthy" ? "w-2 h-2 rounded-full bg-green-400" : "w-2 h-2 rounded-full bg-yellow-400"} />
                </div>
                <div className="pt-4 border-t border-outline-subtle/50 grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-mono text-label-sm text-outline block mb-1">Latency</span>
                    <span className="font-mono text-code-md text-on-surface">{provider.latency}ms</span>
                  </div>
                  <div>
                    <span className="font-mono text-label-sm text-outline block mb-1">Uptime</span>
                    <span className="font-mono text-code-md text-on-surface">{provider.uptime}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Events Log */}
        <Card className="card-panel overflow-hidden">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-outline-subtle/50 flex justify-between items-center bg-surface/50">
              <h3 className="font-sans text-headline-md text-on-surface text-lg">Recent Events</h3>
              <button className="font-mono text-label-sm text-primary hover:underline">View All Logs</button>
            </div>
            <div className="font-mono text-code-md divide-y divide-outline-subtle/50">
              {[
                { time: "10:42:01", level: "INFO", msg: "Node eu-west-1a successfully deployed and added to load balancer pool." },
                { time: "10:38:14", level: "WARN", msg: "High latency detected on Anthropic API. Traffic partially routed to failover." },
                { time: "10:15:00", level: "INFO", msg: "Automated health check completed across all provider regions." },
                { time: "09:55:22", level: "OK", msg: "Database synchronization complete. Replication lag: 0.2s." },
              ].map((event, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-4 hover:bg-surface-hover transition-colors">
                  <span className="text-outline-variant w-20 shrink-0">{event.time}</span>
                  <Badge
                    variant={
                      event.level === "INFO" ? "default" :
                      event.level === "WARN" ? "warning" :
                      event.level === "OK" ? "success" : "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {event.level}
                  </Badge>
                  <span className="text-on-surface-variant truncate">{event.msg}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
