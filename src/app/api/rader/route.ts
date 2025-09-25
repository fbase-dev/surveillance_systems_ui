

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get("type");

  const baseUrl = 'https://camera-server-cloud-run-183968704272.us-central1.run.app';

  try {
    // Handle individual data type requests
    if (dataType === 'ttm') {
      const response = await fetch(`${baseUrl}/tracking_data`, { cache: "no-cache" });
      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch TTM data: ${response.statusText}`,
        }), { status: response.status, headers: { "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const ttmArray = Array.isArray(data) ? data : [data].filter(Boolean);
      const processedTTM = ttmArray
        .map((t: any) => ({
          ...t,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          source: "ttm",
        }))
        .filter((t: any) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));

      return new Response(JSON.stringify({
        success: true,
        data: processedTTM,
        type: 'ttm',
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    if (dataType === 'tll') {
      const response = await fetch(`${baseUrl}/target_location_batch`, { cache: "no-cache" });
      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch TLL data: ${response.statusText}`,
        }), { status: response.status, headers: { "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const tllArray = Array.isArray(data) ? data : [data].filter(Boolean);
      const processedTLL = tllArray
        .map((t: any) => ({
          ...t,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          source: "tll",
        }))
        .filter((t: any) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));

      return new Response(JSON.stringify({
        success: true,
        data: processedTLL,
        type: 'tll',
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    if (dataType === 'own') {
      const response = await fetch(`${baseUrl}/ais_data/own`, { cache: "no-cache" });
      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch own vessel data: ${response.statusText}`,
        }), { status: response.status, headers: { "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const processedOwn = {
        latitude: Number(data?.latitude),
        longitude: Number(data?.longitude),
        heading: Number(data?.heading),
        speed: Number(data?.speed),
        course: Number(data?.course),
      };

      return new Response(JSON.stringify({
        success: true,
        data: processedOwn,
        type: 'own',
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    const apiUrls: { [key: string]: string } = {};
    if (dataType === 'all' || !dataType) {
      apiUrls.ttm = `${baseUrl}/tracking_data`;
      apiUrls.tll = `${baseUrl}/target_location_batch`;
      apiUrls.own = `${baseUrl}/ais_data/own`;
    }


    // Fetch all requested data types in parallel
    const fetchPromises = Object.entries(apiUrls).map(async ([key, url]) => {
      try {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) {
          console.warn(`Failed to fetch ${key} data: ${response.statusText}`);
          return [key, null];
        }
        const data = await response.json();
        return [key, data];
      } catch (error) {
        console.error(`Error fetching ${key} data:`, error);
        return [key, null];
      }
    });

    const results = await Promise.all(fetchPromises);
    const radarData = Object.fromEntries(results);

    // Process and normalize the data
    const processedData: any = {};

    if (radarData.ttm) {
      const ttmArray = Array.isArray(radarData.ttm) ? radarData.ttm : [radarData.ttm].filter(Boolean);
      processedData.ttm = ttmArray
        .map((t: any) => ({
          ...t,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          source: "ttm",
        }))
        .filter((t: any) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
    }

    if (radarData.tll) {
      const tllArray = Array.isArray(radarData.tll) ? radarData.tll : [radarData.tll].filter(Boolean);
      processedData.tll = tllArray
        .map((t: any) => ({
          ...t,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          source: "tll",
        }))
        .filter((t: any) => Number.isFinite(t.latitude) && Number.isFinite(t.longitude));
    }

    if (radarData.own) {
      const lat = Number(radarData.own?.latitude);
      const lon = Number(radarData.own?.longitude);
      processedData.own = {
        latitude: lat,
        longitude: lon,
        heading: Number(radarData.own?.heading),
        speed: Number(radarData.own?.speed),
        course: Number(radarData.own?.course),
      };
    }

    return new Response(JSON.stringify({
      success: true,
      data: processedData,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error('Radar API Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error",
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}