// File: app/api/tracking-data/route.ts
export async function GET() {
  const baseUrl = 'https://camera-server-cloud-run-183968704272.us-central1.run.app';

  try {
    const response = await fetch(`${baseUrl}/tracking_data`, { cache: "no-cache" });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch: ${response.statusText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

   
    const parsed = {
      acquisition: data?.acquisition ?? null,
      bearing: Number(data?.bearing) || 0,
      brg_ref: data?.brg_ref ?? null,
      cog: Number(data?.cog) || 0,
      cog_unit: data?.cog_unit ?? null,
      dist_cpa: Number(data?.dist_cpa) || 0,
      dist_unit: data?.dist_unit ?? null,
      distance: Number(data?.distance) || 0,
      name: data?.name ?? null,
      reference: data?.reference ?? null,
      speed: Number(data?.speed) || 0,
      status: data?.status ?? null,
      target_number: data?.target_number ?? null,
      time_cpa: Number(data?.time_cpa) || 0,
      timestamp: data?.timestamp ?? null,
    };

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('tracking_data error:', error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
