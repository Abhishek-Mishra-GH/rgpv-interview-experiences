"use client";

import type React from "react";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function ShareExperience() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    position: "",
    content: "",
    salary: "",
    location: "",
    difficulty: "",
    outcome: "",
    tips: "",
    isAnonymous: session?.user?.isAnonymous || false,
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Server error: ${response.status}`;
        setError(errorMessage);
        console.error("Failed to create experience:", errorData);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error occurred";
      setError(errorMessage);
      console.error("Error creating experience:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign In Required
        </h1>
        <p className="text-gray-600 mb-6">
          You need to sign in to share your interview experience.
        </p>
        <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Share Your Interview Experience
        </h1>
        <p className="text-gray-600">
          Help fellow RGPV students by sharing your interview journey
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
          <CardDescription>
            Fill in the details about your interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Experience Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Software Engineer Interview at TCS"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="e.g., TCS, Infosys, Wipro"
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  placeholder="e.g., Software Engineer, Data Analyst"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g., Bhopal, Pune, Bangalore"
                />
              </div>
              <div>
                <Label htmlFor="salary">Salary Package</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  placeholder="e.g., 3.5 LPA, 4-6 LPA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => handleChange("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="outcome">Outcome *</Label>
                <Select
                  value={formData.outcome}
                  onValueChange={(value) => handleChange("outcome", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Selected">Selected</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="content">Interview Experience *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                placeholder="Describe your interview process, questions asked, rounds, etc."
                rows={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="tips">Tips for Future Candidates</Label>
              <Textarea
                id="tips"
                value={formData.tips}
                onChange={(e) => handleChange("tips", e.target.value)}
                placeholder="Share any tips or advice for students preparing for similar interviews"
                rows={4}
              />
            </div>

            {!session.user.isAnonymous && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) =>
                    handleChange("isAnonymous", checked as boolean)
                  }
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Share this experience anonymously
                </Label>
              </div>
            )}

            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.title ||
                !formData.company ||
                !formData.position ||
                !formData.content ||
                !formData.difficulty ||
                !formData.outcome
              }
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing Experience...
                </>
              ) : (
                "Share Experience"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
