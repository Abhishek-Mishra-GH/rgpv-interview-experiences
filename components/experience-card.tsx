"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Bookmark,
  MapPin,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ExperienceCardProps {
  experience: {
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
  };
  onUpdate: () => void;
}

export function ExperienceCard({ experience, onUpdate }: ExperienceCardProps) {
  const { data: session } = useSession();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    if (!session || isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/experiences/${experience.id}/like`, {
        method: "POST",
      });
      const data = await response.json();
      setLiked(data.liked);
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!session || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/experiences/${experience.id}/save`, {
        method: "POST",
      });
      const data = await response.json();
      setSaved(data.saved);
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

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {experience.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="font-medium">{experience.company}</span>
              <span>•</span>
              <span>{experience.position}</span>
              {experience.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{experience.location}</span>
                  </div>
                </>
              )}
              {experience.salary && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{experience.salary}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getDifficultyColor(experience.difficulty)}>
                {experience.difficulty}
              </Badge>
              <Badge className={getOutcomeColor(experience.outcome)}>
                {experience.outcome}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>
              {experience.isAnonymous || experience.author.isAnonymous
                ? "Anonymous"
                : experience.author.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(experience.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">
            {experience.content}
          </p>
        </div>

        {experience.tips && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
            <p className="text-blue-800 text-sm whitespace-pre-wrap">
              {experience.tips}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
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
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              <span>{experience._count.likes}</span>
            </Button>

            {session && session.user && (
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
                  className={`h-4 w-4 ${saved ? "fill-current" : ""}`}
                />
                <span>{experience._count.saves}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
