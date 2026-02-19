// app/features/security/antiForgeryService.ts
import { baseUrl } from "@/features/api/baseUrl.ts";

export async function fetchAntiForgeryToken(token: string) {
  const res = await fetch(`${baseUrl}/AntiForgery/GetAntiForgeryToken`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch anti-forgery token");
  }

  return res.json(); // { token: string }
}
