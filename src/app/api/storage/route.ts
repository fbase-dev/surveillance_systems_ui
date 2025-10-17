export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const action = searchParams.get("action");

  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL || 'http://102.208.116.12:8000/api';

  try {
    let apiUrl: string;

    switch (action) {
      case 'status':
        apiUrl = `${baseUrl}/status`;
        break;

      case 'files':
        if (!path) {
          return new Response("Path is required for files action", { status: 400 });
        }
        apiUrl = `${baseUrl}/files?path=${encodeURIComponent(path)}`;
        break;

      case 'details':
        if (!path) {
          return new Response("Path is required for details action", { status: 400 });
        }
        apiUrl = `${baseUrl}/files/details?path=${encodeURIComponent(path)}`;
        break;

      case 'download':
        if (!path) {
          return new Response("Path is required for download action", { status: 400 });
        }

        // Return a redirect to the hardware API directly for downloads
        // This bypasses serverless timeout limitations
        const downloadUrl = `${baseUrl}/files/download?path=${encodeURIComponent(path)}`;

        return Response.redirect(downloadUrl, 302);

      default:
        return new Response("Invalid action. Use 'status', 'files', 'details', or 'download'", { status: 400 });
    }

    // For non-download actions, fetch and return JSON
    const response = await fetch(apiUrl, {
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return new Response(`Failed to fetch storage data: ${response.statusText}`, {
        status: response.status
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error('Storage API Error:', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Path is required", { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL || 'http://102.208.116.12:8000/api';
  const apiUrl = `${baseUrl}/files?path=${encodeURIComponent(path)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete failed:', errorText);
      return new Response(`Failed to delete file: ${response.statusText}`, {
        status: response.status
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Delete API Error:', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, old_path, new_name } = body;

    if (action !== 'rename') {
      return new Response("Only 'rename' action is supported in POST", { status: 400 });
    }

    if (!old_path || !new_name) {
      return new Response("old_path and new_name are required for rename", { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_STORAGE_API_URL || 'http://102.208.116.12:8000/api';
    const apiUrl = `${baseUrl}/files/rename`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        old_path,
        new_name
      }),
      cache: "no-cache",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rename failed:', errorText);
      return new Response(`Failed to rename file: ${errorText}`, {
        status: response.status
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Rename API Error:', error);
    return new Response(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500
    });
  }
}