"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Bookmark,
  MapPin,
  IndianRupee,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

export default function ExperienceDetails() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const experienceId = params.id as string;

  useEffect(() => {
    if (experienceId) {
      fetchExperience();
    }
  }, [experienceId]);

  // Update like/save state when experience changes
  useEffect(() => {
    if (experience) {
      setLiked(experience.isLikedByUser || false);
      setSaved(experience.isSavedByUser || false);
    }
  }, [experience]);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/experiences/${experienceId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Experience not found");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      setExperience(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to load experience: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session || !experience) return;
    setIsLiking(true);
    try {
      const response = await fetch(`/api/experiences/${experience.id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setExperience((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  likes: data.liked
                    ? prev._count.likes + 1
                    : prev._count.likes - 1,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!session || !experience) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiences/${experience.id}/save`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setSaved(data.saved);
        setExperience((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  saves: data.saved
                    ? prev._count.saves + 1
                    : prev._count.saves - 1,
                },
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsSaving(false);
    }
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
          <p className="text-gray-600">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
            >
              Go Back
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Experience not found</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Experiences
      </Button>

      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {experience.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="font-medium text-lg">
                  {experience.company}
                </span>
                <span>•</span>
                <span className="text-lg">{experience.position}</span>
                {experience.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{experience.location}</span>
                    </div>
                  </>
                )}
                {experience.salary && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      <span className="font-medium">{experience.salary}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getDifficultyColor(experience.difficulty)}>
                  {experience.difficulty}
                </Badge>
                <Badge className={getOutcomeColor(experience.outcome)}>
                  {experience.outcome}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 border-b pb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                Shared by{" "}
                {experience.isAnonymous || experience.author.isAnonymous
                  ? "Anonymous"
                  : experience.author.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(experience.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Full Content */}
          <div className="prose prose-lg max-w-none mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Interview Experience
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {experience.content}
            </p>
          </div>

          {/* Tips Section */}
          {experience.tips && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                💡 Tips for Future Candidates
              </h4>
              <p className="text-blue-800 whitespace-pre-wrap leading-relaxed">
                {experience.tips}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={!session || isLiking}
                className={`flex items-center gap-2 ${
                  liked ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                <span>{experience._count.likes}</span>
                <span className="hidden sm:inline">
                  {experience._count.likes === 1 ? "Like" : "Likes"}
                </span>
              </Button>

              {session && session.user && !session.user.isAnonymous && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 ${
                    saved ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  <Bookmark
                    className={`h-5 w-5 ${saved ? "fill-current" : ""}`}
                  />
                  <span>{experience._count.saves}</span>
                  <span className="hidden sm:inline">
                    {experience._count.saves === 1 ? "Save" : "Saves"}
                  </span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/share")}
                className="flex items-center gap-2"
              >
                Share Your Experience
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
