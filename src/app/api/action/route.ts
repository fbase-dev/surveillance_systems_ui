export async function POST(request: Request) {
  const apiUrl = process.env.CAMERA_API_URL || 
    'https://camera-server-cloud-run-183968704272.us-central1.run.app/control';

  try {
    const body = await request.json();
    
    // Validate the action exists
    if (!body.action) {
      return new Response(
        JSON.stringify({ error: "Action is required" }), 
        { 
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log('Sending camera action:', body.action);

    // Forward request with the action
    const upstreamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseData = await upstreamResponse.text();

    return new Response(responseData, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error forwarding POST request:", error);
    return new Response(
      JSON.stringify({ error: "Error forwarding request" }), 
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}