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
      return new Response("Failed to fetch stream", { status: 500 });
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": upstreamResponse.headers.get("Content-Type") || "video/mp4",
      },
    });
  } catch (error) {
    return new Response("Error fetching video stream", { status: 500 });
  }
}
