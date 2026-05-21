import type { NextRequest } from "next/server";
import { GET as authGET, POST as authPOST } from "@/auth";

export const runtime = "nodejs";

async function logAuthRequest(method: string, url: string) {
  // #region agent log
  fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
    body: JSON.stringify({
      sessionId: "9cec04",
      runId: "post-fix",
      hypothesisId: "C",
      location: "api/auth/[...nextauth]/route.ts",
      message: "Auth route hit",
      data: { method, pathname: new URL(url).pathname },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export async function GET(req: NextRequest) {
  await logAuthRequest("GET", req.url);
  try {
    return await authGET(req);
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
      body: JSON.stringify({
        sessionId: "9cec04",
        runId: "post-fix-v2",
        hypothesisId: "D",
        location: "api/auth/route:GET",
        message: "Auth GET threw",
        data: { error: err instanceof Error ? err.message.slice(0, 200) : "unknown" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }
}

export async function POST(req: NextRequest) {
  await logAuthRequest("POST", req.url);
  try {
    return await authPOST(req);
  } catch (err) {
    // #region agent log
    fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
      body: JSON.stringify({
        sessionId: "9cec04",
        runId: "post-fix-v2",
        hypothesisId: "D",
        location: "api/auth/route:POST",
        message: "Auth POST threw",
        data: { error: err instanceof Error ? err.message.slice(0, 200) : "unknown" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw err;
  }
}
