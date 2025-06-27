"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trophy,
  Heart,
  Bookmark,
  Calendar,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RankedExperience {
  id: string;
  title: string;
  company: string;
  position: string;
  content: string;
  difficulty: string;
  outcome: string;
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

export default function WeeklyRanking() {
  const { data: session } = useSession();
  const router = useRouter();
  const [experiences, setExperiences] = useState<RankedExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/experiences/weekly-ranking");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExperiences(data || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to load weekly ranking: ${errorMessage}`);
      console.error("Failed to fetch weekly ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (experienceId: string, currentlyLiked: boolean) => {
    if (!session) return;

    try {
      const response = await fetch(`/api/experiences/${experienceId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  isLikedByUser: data.liked,
                  _count: {
                    ...exp._count,
                    likes: exp._count.likes + (data.liked ? 1 : -1),
                  },
                }
              : exp
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSave = async (experienceId: string, currentlySaved: boolean) => {
    if (!session || session.user?.isAnonymous) return;

    try {
      const response = await fetch(`/api/experiences/${experienceId}/save`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setExperiences((prev) =>
          prev.map((exp) =>
            exp.id === experienceId
              ? {
                  ...exp,
                  isSavedByUser: data.saved,
                  _count: {
                    ...exp._count,
                    saves: exp._count.saves + (data.saved ? 1 : -1),
                  },
                }
              : exp
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    }
  };

  const handleViewDetails = (experienceId: string) => {
    router.push(`/experience/${experienceId}`);
  };

  const retryFetch = () => {
    fetchRanking();
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Trophy className="h-6 w-6 text-amber-600" />;
    return (
      <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case "selected":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading weekly ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🏆 Weekly Top Interview Experiences
        </h1>
        <p className="text-gray-600">
          Most liked interview experiences from the past week
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

      {experiences.length === 0 && !error && !loading ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No experiences found for this week.
            </p>
            <p className="text-sm text-gray-400">
              Check back later or be the first to share your experience!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience, index) => (
            <Card
              key={experience.id}
              className={`${
                index < 3
                  ? "ring-2 ring-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50"
                  : ""
              } hover:shadow-md transition-shadow`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{getRankIcon(index)}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {experience.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                      <span className="font-medium">{experience.company}</span>
                      <span>•</span>
                      <span>{experience.position}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        className={getDifficultyColor(experience.difficulty)}
                      >
                        {experience.difficulty}
                      </Badge>
                      <Badge className={getOutcomeColor(experience.outcome)}>
                        {experience.outcome}
                      </Badge>
                    </div>

                    {/* Content preview */}
                    {experience.content && (
                      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                        {experience.content}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleLike(
                          experience.id,
                          experience.isLikedByUser || false
                        )
                      }
                      disabled={!session}
                      className={`flex items-center gap-2 ${
                        experience.isLikedByUser
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          experience.isLikedByUser ? "fill-current" : ""
                        }`}
                      />
                      <span>{experience._count.likes}</span>
                    </Button>

                    {session && session.user && !session.user.isAnonymous && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleSave(
                            experience.id,
                            experience.isSavedByUser || false
                          )
                        }
                        className={`flex items-center gap-2 ${
                          experience.isSavedByUser
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            experience.isSavedByUser ? "fill-current" : ""
                          }`}
                        />
                        <span>{experience._count.saves}</span>
                      </Button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(experience.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(experience.id)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
