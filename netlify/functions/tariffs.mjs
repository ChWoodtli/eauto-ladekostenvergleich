const API_BASE = process.env.INNOSTROM_API_BASE || "https://portal.dynamische-stromtarife.ch/api";

const json = (status, body, extraHeaders = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...extraHeaders }
});

export default async function handler(request) {
  if (request.method !== "GET") return json(405, { error: "Nur GET ist erlaubt." }, { Allow: "GET" });

  const token = process.env.INNOSTROM_API_TOKEN;
  const meteringCode = process.env.INNOSTROM_METERING_CODE;
  if (!token || !meteringCode) {
    return json(500, { error: "Netlify-Umgebungsvariablen fehlen.", required: ["INNOSTROM_API_TOKEN", "INNOSTROM_METERING_CODE"] });
  }

  const incoming = new URL(request.url);
  const start = incoming.searchParams.get("start_timestamp");
  const end = incoming.searchParams.get("end_timestamp");
  if (!start || !end || Number.isNaN(Date.parse(start)) || Number.isNaN(Date.parse(end))) {
    return json(400, { error: "Gueltige start_timestamp und end_timestamp im RFC3339-Format sind erforderlich." });
  }
  if (Date.parse(end) <= Date.parse(start)) return json(400, { error: "end_timestamp muss nach start_timestamp liegen." });
  if (Date.parse(end) - Date.parse(start) > 72 * 3600 * 1000) return json(400, { error: "Maximal 72 Stunden pro Anfrage." });

  const upstream = new URL(`${API_BASE.replace(/\/$/, "")}/v2/metering_code`);
  upstream.searchParams.set("start_timestamp", start);
  upstream.searchParams.set("end_timestamp", end);
  upstream.searchParams.set("metering_code", meteringCode);
  upstream.searchParams.set("tariff_type", "integrated");

  try {
    const response = await fetch(upstream, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
    if (!response.ok) {
      console.error("Innostrom API error", response.status);
      return json(response.status, { error: "Tarif-API konnte nicht erfolgreich abgefragt werden.", upstreamStatus: response.status, details: payload });
    }
    return json(200, payload, { "Cache-Control": "public, max-age=60, s-maxage=300" });
  } catch (error) {
    console.error("Proxy error", error);
    return json(502, { error: "Verbindung zur Tarif-API fehlgeschlagen." });
  }
}

export const config = { path: "/api/tariffs" };
