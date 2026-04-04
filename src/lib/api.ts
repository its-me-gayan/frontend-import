export type UiStage = "new" | "quoted" | "negotiation" | "won" | "lost";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG ?? "colombo-tech";

export function getStoredToken(): string | null {
  return localStorage.getItem("chatclose_token");
}

function authHeaders() {
  const token = getStoredToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Slug": TENANT_SLUG,
    },
    body: JSON.stringify({ email, password }),
  });

  const json = await handleJson<{ success: boolean; data?: { accessToken: string } }>(res);
  const accessToken = json?.data?.accessToken;
  if (!accessToken) throw new Error("Login succeeded but token is missing.");
  localStorage.setItem("chatclose_token", accessToken);
  return accessToken;
}

export function uiStageToBackend(stage: UiStage): string {
  switch (stage) {
    case "new":
      return "NEW_LEAD";
    case "quoted":
      return "QUOTED";
    case "negotiation":
      return "NEGOTIATION";
    case "won":
      return "WON";
    case "lost":
      return "LOST";
    default:
      return "NEW_LEAD";
  }
}

export function backendStageToUi(stage?: string): UiStage {
  switch ((stage ?? "").toUpperCase()) {
    case "NEW_LEAD":
      return "new";
    case "QUOTED":
      return "quoted";
    case "NEGOTIATION":
      return "negotiation";
    case "WON":
      return "won";
    case "LOST":
      return "lost";
    default:
      return "new";
  }
}

export async function getPipeline() {
  const res = await fetch(`${API_BASE_URL}/api/deals/pipeline`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleJson<any>(res);
}

export async function getInbox() {
  const res = await fetch(`${API_BASE_URL}/api/inbox?page=0&size=50`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleJson<any>(res);
}

export async function moveDealStage(dealId: string, stage: UiStage) {
  const res = await fetch(`${API_BASE_URL}/api/deals/${dealId}/move-stage`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ targetStage: uiStageToBackend(stage), targetOrder: 0 }),
  });
  return handleJson<any>(res);
}

export async function sendDealReply(dealId: string, content: string) {
  const res = await fetch(`${API_BASE_URL}/api/deals/${dealId}/reply`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content, messageType: "text" }),
  });
  return handleJson<any>(res);
}

export async function markDealRead(dealId: string) {
  const res = await fetch(`${API_BASE_URL}/api/inbox/${dealId}/read`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
}

