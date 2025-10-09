// app/api/location-batch/route.ts

export async function GET() {
  const baseUrl =
    "https://camera-server-cloud-run-183968704272.us-central1.run.app";

  try {
    const response = await fetch(`${baseUrl}/target_location_batch`, {
      cache: "no-cache",
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch: ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    // Validate and normalize the batch field
    const parsed = {
      batch: Array.isArray(data?.batch) ? data.batch : [],
    };

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("target_location_batch error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
