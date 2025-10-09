// app/api/ais/other/route.ts
export async function GET() {
  const AIS_ENDPOINT =
    'https://camera-server-cloud-run-183968704272.us-central1.run.app/ais_data/other';

  try {
    const response = await fetch(AIS_ENDPOINT, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`AIS Other API Error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to fetch AIS data',
          status: response.status,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('AIS Other API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
