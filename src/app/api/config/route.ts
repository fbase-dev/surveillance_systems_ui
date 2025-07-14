export async function GET() {
  const config = {
    mapApiKey: process.env.NEXT_PUBLIC_MAP_API_KEY,
    mapApiId: process.env.NEXT_PUBLIC_MAP_ID,
    videoFeed1: process.env.NEXT_PUBLIC_API_VIDEO_FEED_1,
    videoFeed2: process.env.NEXT_PUBLIC_API_VIDEO_FEED_2,
    videoFeed3: process.env.NEXT_PUBLIC_API_VIDEO_FEED_3,
  }
  return new Response(JSON.stringify(config), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
