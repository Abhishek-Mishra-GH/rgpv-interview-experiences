"use client";

import { useState, useEffect } from "react";
import { ExperienceSummaryCard } from "@/components/experience-summary-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  position: string;
  content: string;
  salary?: string;
  location?: string;
  difficulty: string;
  outcome: string;
  tips?: string;
  isAnonymous: boolean;
  createdAt: string;
  author: {
    name: string;
    isAnonymous: boolean;
  };
  _count: {
    likes: number;
    saves: number;
  };
  isLikedByUser?: boolean;
  isSavedByUser?: boolean;
}

interface ApiResponse {
  experiences: Experience[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
  message?: string;
}

export default function Home() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [hasMore, setHasMore] = useState(true);

  const fetchExperiences = async (
    pageNum: number,
    sort: string,
    reset = false
  ) => {
    try {
      setError("");
      const response = await fetch(
        `/api/experiences?page=${pageNum}&sortBy=${sort}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const experiencesData = data.experiences || [];
      const paginationData = data.pagination || {
        page: 1,
        pages: 1,
        total: 0,
        limit: 10,
      };

      if (reset) {
        setExperiences(experiencesData);
      } else {
        setExperiences((prev) => [...prev, ...experiencesData]);
      }

      setHasMore(pageNum < paginationData.pages);

      if (data.message) {
        setError(data.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to load experiences: ${errorMessage}`);
      if (reset) {
        setExperiences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchExperiences(1, sortBy, true);
  }, [sortBy]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchExperiences(nextPage, sortBy);
  };

  const retryFetch = () => {
    setLoading(true);
    setError("");
    setPage(1);
    fetchExperiences(1, sortBy, true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interview Experiences
        </h1>
        <p className="text-gray-600">
          Discover and share interview experiences from RGPV students
        </p>
      </div>

      {/* Sort and Filter Controls */}
      <div className="mb-6">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={retryFetch}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading && experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading experiences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((experience) => (
            <ExperienceSummaryCard
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
              <p className="text-gray-500 mb-4">
                No experiences found. Be the first to share!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
