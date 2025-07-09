export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
  
    if (!path) {
      return new Response("Path is required", { status: 400 });
    }
  
    const apiUrl = `${process.env.NEXT_PUBLIC_API_AIS_URL}${path}`;

    console.log(apiUrl);
  
    try{
      const response = await fetch(apiUrl, {
        cache: "no-cache",
      });
    
      if (!response.ok) {
        return new Response("Failed to fetch AIS data", { status: 500 });
      }
    
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }catch (error) {
      console.error("API Proxy Error:", error);
      return new Response("Error fetching resource", { status: 500 });
    }
  }
  
