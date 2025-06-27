"use client"

import { useState, useEffect } from "react"
import { ExperienceCard } from "@/components/experience-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, RefreshCw, Database, Play } from "lucide-react"

interface Experience {
  id: string
  title: string
  company: string
  position: string
  content: string
  salary?: string
  location?: string
  difficulty: string
  outcome: string
  tips?: string
  isAnonymous: boolean
  createdAt: string
  author: {
    name: string
    isAnonymous: boolean
  }
  _count: {
    likes: number
    saves: number
  }
}

interface ApiResponse {
  experiences: Experience[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  error?: string
  message?: string
  details?: string
}

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("recent")
  const [hasMore, setHasMore] = useState(true)
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [isFixing, setIsFixing] = useState(false)

  const checkHealth = async () => {
    try {
      const response = await fetch("/api/health")
      const health = await response.json()
      setHealthStatus(health)
      console.log("🏥 Health check:", health)
    } catch (error) {
      console.error("❌ Health check failed:", error)
      setHealthStatus({ status: "error", error: "Failed to check health" })
    }
  }

  const runPrismaSetup = async () => {
    setIsFixing(true)
    try {
      const response = await fetch("/api/prisma/setup", { method: "POST" })
      const result = await response.json()
      console.log("🔧 Prisma setup result:", result)

      if (result.success) {
        // Refresh health status and try fetching data again
        await checkHealth()
        await fetchExperiences(1, sortBy, true)
      } else {
        setError(`Prisma setup failed at step '${result.step}': ${result.details || result.error}`)
      }
    } catch (error) {
      console.error("❌ Failed to run Prisma setup:", error)
      setError("Failed to run Prisma setup")
    } finally {
      setIsFixing(false)
    }
  }

  const fetchExperiences = async (pageNum: number, sort: string, reset = false) => {
    try {
      setError("")
      console.log(`🔍 Fetching experiences: page=${pageNum}, sort=${sort}, reset=${reset}`)

      const url = `/api/experiences?page=${pageNum}&sortBy=${sort}`
      console.log("📡 Request URL:", url)

      const response = await fetch(url)
      console.log("📡 Response status:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      console.log("📊 API Response:", data)

      setDebugInfo({
        url,
        status: response.status,
        dataKeys: Object.keys(data),
        experienceCount: data.experiences?.length || 0,
        pagination: data.pagination,
        hasError: !!data.error,
        message: data.message,
      })

      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""))
      }

      const experiencesData = data.experiences || []
      const paginationData = data.pagination || { page: 1, pages: 1, total: 0, limit: 10 }

      if (reset) {
        setExperiences(experiencesData)
      } else {
        setExperiences((prev) => [...prev, ...experiencesData])
      }

      setHasMore(pageNum < paginationData.pages)

      if (data.message) {
        setError(data.message)
      }
    } catch (error) {
      console.error("❌ Failed to fetch experiences:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(`Failed to load experiences: ${errorMessage}`)
      if (reset) {
        setExperiences([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("🚀 Component mounted, checking health and fetching data")
    checkHealth()
    setLoading(true)
    setPage(1)
    fetchExperiences(1, sortBy, true)
  }, [sortBy])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchExperiences(nextPage, sortBy)
  }

  const retryFetch = () => {
    setLoading(true)
    setError("")
    setPage(1)
    fetchExperiences(1, sortBy, true)
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("🔧 Initializing database...")

      const response = await fetch("/api/init-db", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        await checkHealth()
        await fetchExperiences(1, sortBy, true)
      } else {
        setError(`Failed to initialize database: ${result.details || result.error}`)
      }
    } catch (error) {
      console.error("❌ Failed to initialize database:", error)
      setError("Failed to initialize database")
    }
  }

  const hasSystemIssues =
    healthStatus && (!healthStatus.checks?.prismaImport || !healthStatus.checks?.databaseConnection)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Experiences</h1>
        <p className="text-gray-600">Discover and share interview experiences from RGPV students</p>
      </div>

      {/* Health Status Card */}
      {healthStatus && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database:</span>
                <span className={`text-sm ${healthStatus.status === "healthy" ? "text-green-600" : "text-red-600"}`}>
                  {healthStatus.database || healthStatus.status}
                </span>
              </div>

              {healthStatus.data && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Data:</span>
                  <span className="text-sm text-gray-600">
                    {healthStatus.data.experiences} experiences, {healthStatus.data.users} users
                  </span>
                </div>
              )}

              {healthStatus.checks && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">System Checks:</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={healthStatus.checks.prismaImport ? "text-green-600" : "text-red-600"}>
                      Prisma Import: {healthStatus.checks.prismaImport ? "✓" : "✗"}
                    </div>
                    <div className={healthStatus.checks.databaseConnection ? "text-green-600" : "text-red-600"}>
                      DB Connection: {healthStatus.checks.databaseConnection ? "✓" : "✗"}
                    </div>
                    <div className={healthStatus.checks.basicQuery ? "text-green-600" : "text-red-600"}>
                      Basic Query: {healthStatus.checks.basicQuery ? "✓" : "✗"}
                    </div>
                  </div>
                </div>
              )}

              {hasSystemIssues && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm font-medium text-red-800 mb-2">🚨 System Issues Detected</div>
                  <div className="text-xs text-red-700 mb-3">
                    {healthStatus.troubleshooting?.issue || "Multiple system components are failing"}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={runPrismaSetup} disabled={isFixing}>
                      {isFixing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      Run Setup
                    </Button>
                    <Button size="sm" variant="outline" onClick={checkHealth}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recheck
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex justify-between items-center">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={checkHealth}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Check Status
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={retryFetch}>
                Retry
              </Button>
              {error.includes("No experiences found") && (
                <Button variant="outline" size="sm" onClick={initializeDatabase}>
                  Initialize Database
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <Card className="mb-6 bg-gray-50">
          <CardContent className="p-4">
            <details>
              <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
              <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </CardContent>
        </Card>
      )}

      {loading && experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onUpdate={() => fetchExperiences(1, sortBy, true)}
            />
          ))}

          {hasMore && !error && (
            <div className="flex justify-center py-6">
              <Button onClick={loadMore} variant="outline" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {experiences.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No experiences found. Be the first to share!</p>
              <Button onClick={initializeDatabase} variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Initialize Sample Data
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
