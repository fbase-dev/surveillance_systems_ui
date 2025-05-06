export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path is required", { status: 400 });
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_CAMERA_CONTROL_URL}${path}`;

  try {
    const upstreamResponse = await fetch(apiUrl, { cache: "no-cache" });

    if (!upstreamResponse.ok) {
      return new Response("Failed to fetch resource", { status: upstreamResponse.status });
    }

    // Handle MJPEG stream
    if (path === "/video_feed") {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": "multipart/x-mixed-replace; boundary=frame",
        },
      });
    }

    // Handle all other JSON responses
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
