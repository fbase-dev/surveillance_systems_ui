export async function GET() {
  const baseUrl = "https://camera-server-cloud-run-183968704272.us-central1.run.app";

  try {
    // Fetch raw AIS data from your server
    const response = await fetch(`${baseUrl}/ais_data/own`, { cache: "no-cache" });
    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch own vessel data: ${response.statusText}`,
        }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse response JSON
    const data = await response.json();
    const batch = Array.isArray(data?.batch) ? data.batch : [];

    // Extract decoded values from the first available batch
    const decoded = batch[0]?.decoded;
    if (!decoded || !decoded.lat || !decoded.lon) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No valid AIS position data available",
          data: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build processed data for frontend radar plotting
    const result = {
      latitude: Number(decoded.lat),
      longitude: Number(decoded.lon),
      heading: Number(decoded.heading) || null,
      speed: Number(decoded.speed) || null,
      course: Number(decoded.course) || null,
      mmsi: decoded.mmsi ?? null,
      status: decoded.status ?? null,
      accuracy: decoded.accuracy ?? null,
      raw: batch[0]?.raw ?? null,
      timestamp: data?.timestamp ?? new Date().toISOString(),
    };

    // Return success response
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
    console.error("own vessel error:", error);
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
