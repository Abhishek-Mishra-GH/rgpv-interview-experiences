"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ExperienceSummaryCard } from "@/components/experience-summary-card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Bookmark, ArrowLeft } from "lucide-react";

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
}

export default function SavedExperiences() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user?.isAnonymous) {
      setError("Anonymous users cannot save experiences");
      setLoading(false);
      return;
    }

    fetchSavedExperiences(1, true);
  }, [session, status, router]);

  const fetchSavedExperiences = async (pageNum: number, reset = false) => {
    try {
      if (reset) {
        setError("");
        setLoading(true);
      }

      const response = await fetch(`/api/saved?page=${pageNum}`);

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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to load saved experiences: ${errorMessage}`);
      if (reset) {
        setExperiences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSavedExperiences(nextPage);
  };

  const retryFetch = () => {
    setPage(1);
    fetchSavedExperiences(1, true);
  };

  const handleExperienceUpdate = () => {
    // Refresh the current page
    fetchSavedExperiences(1, true);
    setPage(1);
  };

  if (status === "loading") {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to sign in
  }

  if (session.user?.isAnonymous) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiences
        </Button>

        <div className="text-center">
          <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Saved Experiences
          </h1>
          <p className="text-gray-600 mb-6">
            Anonymous users cannot save experiences. Sign in with an email to
            save and organize your favorite interview experiences.
          </p>
          <Button onClick={() => router.push("/auth/signin")}>
            Sign In with Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiences
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <Bookmark className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Saved Experiences
          </h1>
        </div>
        <p className="text-gray-600">
          Your collection of saved interview experiences
        </p>
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
          <p className="text-gray-600">Loading saved experiences...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {experiences.map((experience) => (
            <ExperienceSummaryCard
              key={experience.id}
              experience={experience}
              onUpdate={handleExperienceUpdate}
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
              <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                No saved experiences yet. Start exploring and save experiences
                you find helpful!
              </p>
              <Button onClick={() => router.push("/")}>
                Browse Experiences
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
