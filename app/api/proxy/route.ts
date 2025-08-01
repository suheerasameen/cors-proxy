import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // disable caching

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
    const targetUrl = request.nextUrl.searchParams.get("url")
    if (!targetUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    // filter incoming headers
    const incomingHeaders = request.headers
    const filteredHeaders = new Headers()
    for (const [key, value] of incomingHeaders.entries()) {
      const lower = key.toLowerCase()
      if (
        !lower.startsWith("x-vercel-") &&
        !lower.startsWith("sec-") &&
        lower !== "host" &&
        lower !== "connection" &&
        lower !== "content-length"
      ) {
        filteredHeaders.set(key, value)
      }
    }

    // handle request body safely
    let body: BodyInit | undefined
    if (request.method !== "GET" && request.method !== "HEAD") {
      const contentType = request.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        body = JSON.stringify(await request.json())
      } else {
        body = await request.text()
      }
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: filteredHeaders,
      body,
      redirect: "follow",
    }

    const response = await fetch(targetUrl, fetchOptions)

    // clone response headers
    const responseHeaders = new Headers(response.headers)
    const origin = request.headers.get("origin") || "*"
    responseHeaders.set("Access-Control-Allow-Origin", origin)
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    responseHeaders.set("Access-Control-Max-Age", "86400")
    responseHeaders.set("Vary", "Origin")

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      {
        error: "Failed to proxy request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

function handleCors(request: NextRequest) {
  const origin = request.headers.get("origin") || "*"
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
    },
  })
}
