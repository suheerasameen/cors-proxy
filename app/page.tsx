"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Globe } from "lucide-react"

export default function Home() {
  const [url, setUrl] = useState("")
  const [method, setMethod] = useState("GET")
  const [requestBody, setRequestBody] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse("")

    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      }

      if (method !== "GET" && method !== "HEAD" && requestBody) {
        options.body = requestBody
      }

      const res = await fetch(proxyUrl, options)

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`)
      }

      let data
      const contentType = res.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await res.json()
        setResponse(JSON.stringify(data, null, 2))
      } else {
        data = await res.text()
        setResponse(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <CardTitle>CORS Anywhere Proxy</CardTitle>
          </div>
          <CardDescription>Make requests to any API without CORS restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="url" className="text-sm font-medium">
                Target URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/data"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Request Method</label>
              <div className="flex flex-wrap gap-2">
                {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={method === m ? "default" : "outline"}
                    onClick={() => setMethod(m)}
                    className="flex-1"
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </div>

            {method !== "GET" && method !== "HEAD" && (
              <div className="flex flex-col gap-2">
                <label htmlFor="body" className="text-sm font-medium">
                  Request Body (JSON)
                </label>
                <Textarea
                  id="body"
                  placeholder='{"key": "value"}'
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="min-h-[100px] font-mono"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending Request..." : "Send Request"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-start">
          <Tabs defaultValue="response" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="response">Response</TabsTrigger>
              <TabsTrigger value="usage">Usage Example</TabsTrigger>
            </TabsList>
            <TabsContent value="response" className="w-full">
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}
              {response && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Response:</p>
                  <pre className="max-h-[300px] overflow-auto rounded-md bg-slate-100 p-4 text-sm">{response}</pre>
                </div>
              )}
              {!response && !error && (
                <div className="py-8 text-center text-muted-foreground">Send a request to see the response here</div>
              )}
            </TabsContent>
            <TabsContent value="usage" className="w-full">
              <div className="rounded-md bg-slate-100 p-4">
                <p className="mb-2 text-sm font-medium">Client-side JavaScript Example:</p>
                <pre className="overflow-auto text-sm">
                  {`// Replace with your deployed URL
const PROXY_URL = '${typeof window !== "undefined" ? window.location.origin : "https://your-site.com"}/api/proxy';

// The API you want to call
const TARGET_API = 'https://api.example.com/data';

// Make the request through the proxy
fetch(\`\${PROXY_URL}?url=\${encodeURIComponent(TARGET_API)}\`)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardFooter>
      </Card>
    </main>
  )
}
