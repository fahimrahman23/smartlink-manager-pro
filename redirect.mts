export interface NetlifyContext {
  ip?: string;
  geo?: {
    city?: string;
    country?: { code?: string; name?: string };
  };
  [key: string]: any;
}

export interface NetlifyConfig {
  path?: string | string[];
}

export default async (req: Request, context: NetlifyContext) => {
  // Extract slug from /r/:slug or /:slug
  const pathname = url.pathname.replace(/^\/r\//, "/").replace(/^\//, "");
  const slug = pathname.split("/")[0]?.toLowerCase();

  if (!slug) {
    return new Response("Invalid redirect request", { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If Supabase is not yet configured, provide helpful guidance
    return new Response(
      `<html><body style="font-family:sans-serif;background:#090d16;color:#f1f5f9;padding:40px;text-align:center;">
        <h2>Supabase Configuration Required</h2>
        <p>Please set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> in your Netlify site environment variables.</p>
        <p><a href="/" style="color:#38bdf8;">Return to Dashboard</a></p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    // 1. Fetch link record from Supabase
    const linkRes = await fetch(
      `${supabaseUrl}/rest/v1/links?slug=eq.${encodeURIComponent(slug)}&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const links = await linkRes.json();
    if (!links || links.length === 0) {
      return new Response(
        `<html><body style="font-family:sans-serif;background:#090d16;color:#f1f5f9;padding:40px;text-align:center;">
          <h2>Link Not Found</h2>
          <p>The requested SmartLink "${slug}" does not exist.</p>
        </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    const link = links[0];

    // 2. Check if link is paused
    if (link.status === "paused") {
      return new Response(
        `<html><body style="font-family:sans-serif;background:#090d16;color:#f1f5f9;padding:40px;text-align:center;">
          <h2>Campaign Paused</h2>
          <p>This SmartLink offer is currently paused by the publisher.</p>
        </body></html>`,
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    }

    // 3. Construct destination URL with preserved query parameters
    const dest = new URL(link.original_url || link.originalUrl);

    // Forward subId if configured on link and not overridden in incoming query
    if (link.sub_id && !url.searchParams.has("subid") && !url.searchParams.has("sub_id")) {
      dest.searchParams.set("subid", link.sub_id);
    }

    // Merge all incoming query parameters
    url.searchParams.forEach((val, key) => {
      dest.searchParams.set(key, val);
    });

    const destinationUrl = dest.toString();

    // 4. Asynchronously log click to Supabase clicks table
    const userAgent = req.headers.get("user-agent") || "Unknown";
    const ip = context.ip || req.headers.get("x-forwarded-for") || "127.0.0.1";
    const referrer = req.headers.get("referer") || "Direct / None";

    let deviceType = "desktop";
    const ua = userAgent.toLowerCase();
    if (/bot|crawl|spider/i.test(ua)) deviceType = "bot";
    else if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) deviceType = "tablet";
    else if (/mobile|iphone|ipod|android/i.test(ua)) deviceType = "mobile";

    // Non-blocking log insert
    fetch(`${supabaseUrl}/rest/v1/clicks`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        link_id: link.id,
        link_slug: link.slug,
        link_name: link.name,
        sub_id: link.sub_id || "",
        user_agent: userAgent,
        device_type: deviceType,
        ip_hash: ip, // or hashed
        referrer,
        destination_url: destinationUrl,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Error logging click to Supabase:", err));

    // Increment click counter on the link
    fetch(`${supabaseUrl}/rest/v1/rpc/increment_link_clicks`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link_row_id: link.id }),
    }).catch((err) => console.error("Error incrementing link count:", err));

    // 5. Genuine HTTP 302 Redirect directly to Adsterra SmartLink
    return new Response(null, {
      status: 302,
      headers: {
        Location: destinationUrl,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    return new Response(`Redirect error: ${err.message}`, { status: 500 });
  }
};

export const config: NetlifyConfig = {
  path: ["/r/*"],
};
