export async function GET(request: Request) {
  const statusUrl = 'https://camera-server-cloud-run-183968704272.us-central1.run.app/status';

  try {
    const upstreamResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await upstreamResponse.json();

    return new Response(JSON.stringify(responseData), {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching camera status:", error);
    return new Response(
      JSON.stringify({ error: "Error fetching status" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}