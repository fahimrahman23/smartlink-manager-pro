export interface NetlifyContext {
  [key: string]: any;
}

export interface NetlifyConfig {
  path?: string | string[];
}

// Netlify Function for Link CRUD and Analytics API on Netlify serverless
export default async (req: Request, _context: NetlifyContext) => {
  const url = new URL(req.url);
  const method = req.method;
  const subpath = url.pathname.replace(/^\/api\/?/, "");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Supabase credentials not configured in Netlify environment variables.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const defaultHeaders = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  try {
    // GET /api/links
    if (method === "GET" && (subpath === "links" || subpath === "links/")) {
      const res = await fetch(`${supabaseUrl}/rest/v1/links?select=*&order=created_at.desc`, {
        headers: defaultHeaders,
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /api/links
    if (method === "POST" && subpath === "links") {
      const body = await req.json();
      const res = await fetch(`${supabaseUrl}/rest/v1/links`, {
        method: "POST",
        headers: { ...defaultHeaders, Prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, data: data[0] }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fallback response for unhandled subpath
    return new Response(
      JSON.stringify({ success: true, message: `Netlify API proxy active for ${subpath}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: NetlifyConfig = {
  path: ["/api/*"],
};
