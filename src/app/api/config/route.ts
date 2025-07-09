export async function GET() {
  const config = {
    mapApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY,
    mapApiId: process.env.NEXT_PUBLIC_MAP_ID,
    cameraUrl: process.env.NEXT_PUBLIC_API_CAMERA_CONTROL_URL,
  };

  return new Response(JSON.stringify(config), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
