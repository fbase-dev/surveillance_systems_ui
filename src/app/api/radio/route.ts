export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
  
    if (!path) {
      return new Response("Path is required", { status: 400 });
    }
  
    const apiUrl = `${process.env.NEXT_PUBLIC_API_RADIO_URL}${path}`;
  
    const response = await fetch(apiUrl, {
      cache: "no-cache",
    });
  
    if (!response.ok) {
      return new Response("Failed to fetch Radio data", { status: 500 });
    }
  
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
