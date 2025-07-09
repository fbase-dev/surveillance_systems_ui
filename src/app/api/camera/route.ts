export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path is required", { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_CAMERA_CONTROL_URL}${path}`;

  try {
    const upstreamResponse = await fetch(apiUrl, {
      cache: "no-cache",
    });

    if (!upstreamResponse.ok) {
      return new Response("Failed to fetch resource", {
        status: upstreamResponse.status,
      });
    }

    if (path.includes("/video_feed")) {
      // Stream MJPEG as-is
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "multipart/x-mixed-replace; boundary=frame",
          "Cache-Control": "no-cache",
        },
      });
    }

    const data = await upstreamResponse.json();
    return new Response(JSON.stringify(data), {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Proxy Error:", error);
    return new Response("Error fetching resource", { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path is required", { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_CAMERA_CONTROL_URL}${path}`;

  try {
    const body = await request.formData();
    const encodedBody = new URLSearchParams(body as any).toString(); 

    const upstreamResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodedBody,
    });

    // Handle 204 No Content gracefully
    if (upstreamResponse.status === 204) {
      // Return a simple success message
      return new Response(null, { status: 204 });
    }

    // If the response has content (non-204 status), forward it
    const responseText = await upstreamResponse.text();
    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error("API Proxy POST Error:", error);
    return new Response("Error forwarding request", { status: 500 });
  }
}
