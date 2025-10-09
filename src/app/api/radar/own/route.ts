export async function GET() {
  const baseUrl = "https://camera-server-cloud-run-183968704272.us-central1.run.app";

  try {
    const response = await fetch(`${baseUrl}/radar_data/own`, { cache: "no-cache" });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch radar own data: ${response.statusText}`,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const raosd = data?.raosd ?? null;

    if (!raosd || !raosd.lat || !raosd.lon) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No valid radar position data available",
          data: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const latitude =
      raosd.lat_dir === "S" ? -Math.abs(Number(raosd.lat)) : Number(raosd.lat);
    const longitude =
      raosd.lon_dir === "W" ? -Math.abs(Number(raosd.lon)) : Number(raosd.lon);

    const result = {
      latitude,
      longitude,
      course: Number(raosd.true_course) || null,
      speed_knots: Number(raosd.spd_over_grnd_knots) || null,
      speed_kph: Number(raosd.spd_over_grnd_kph) || null,
      magnetic_variation: raosd.mag_variation ? Number(raosd.mag_variation) : null,
      magnetic_variation_dir: raosd.mag_var_dir ?? null,
      status: raosd.status ?? null,
      raw: raosd.raw ?? null,
      source: raosd.source ?? null,
      datestamp_raw: raosd.datestamp_raw ?? null,
      timestamp_raw: raosd.timestamp_raw ?? null,
      iso_timestamp: raosd.iso_timestamp ?? null,
      system_timestamp: data?.timestamp ?? new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: data?.timestamp ?? new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Radar own data error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
