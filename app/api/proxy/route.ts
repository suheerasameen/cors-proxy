import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // No caching

export async function GET(request: NextRequest) {
  return handleProxy(request)
}

export async function POST(request: NextRequest) {
  return handleProxy(request)
}

export async function PUT(request: NextRequest) {
  return handleProxy(request)
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request)
}

export async function PATCH(request: NextRequest) {
  return handleProxy(request)
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request)
}

async function handleProxy(request: NextRequest) {
  try {
    // Get the target URL from the query parameter
    const targetUrl = request.nextUrl.searchParams.get("url")

    if (!targetUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // Create a new request with the same method, headers, and body
    const requestInit: RequestInit = {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.blob() : undefined,
      redirect: "follow",
    }

    // Remove host header to avoid conflicts
    ;(requestInit.headers as Headers).delete("host")

    // Forward the request to the target URL
    const response = await fetch(targetUrl, requestInit)

    // Create a new response with the same status, headers, and body
    const responseInit: ResponseInit = {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    }

    // Add CORS headers
    const corsHeaders = new Headers(responseInit.headers)
    corsHeaders.set("Access-Control-Allow-Origin", "*")
    corsHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
    corsHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    corsHeaders.set("Access-Control-Max-Age", "86400")

    // Return the response with CORS headers
    return new NextResponse(response.body, {
      ...responseInit,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy request" }, { status: 500 })
  }
}

function handleCors(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}
