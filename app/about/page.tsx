import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About RGPV Interview Experiences</h1>
        <p className="text-gray-600">A platform built by students, for students</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              RGPV Interview Experiences is a platform designed to help students from Rajiv Gandhi Proudyogiki
              Vishwavidyalaya (RGPV) share their interview experiences and learn from each other. We believe that
              knowledge sharing is the key to success, and by creating a community where students can openly discuss
              their interview journeys, we can help everyone prepare better for their career opportunities.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">📝 Share Experiences</h4>
                <p className="text-sm text-gray-600">Share your interview experiences anonymously or with your name</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">❤️ Like & Save</h4>
                <p className="text-sm text-gray-600">Like helpful experiences and save them for later reference</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">🏆 Weekly Rankings</h4>
                <p className="text-sm text-gray-600">Discover the most popular experiences each week</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">🔒 Anonymous Access</h4>
                <p className="text-sm text-gray-600">Access the platform without creating an account</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Meet the Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="Nilesh Dhakad"
                    width={120}
                    height={120}
                    className="rounded-full mx-auto border-4 border-blue-200"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nilesh Dhakad</h3>
                <p className="text-gray-600 mb-4">Full Stack Developer & RGPV Student</p>
                <div className="flex justify-center gap-3">
                  <Link href="https://github.com/nileshdhakad" target="_blank">
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </Link>
                  <Link href="https://linkedin.com/in/nileshdhakad" target="_blank">
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </Link>
                  <Link href="https://twitter.com/nileshdhakad" target="_blank">
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="Abhishek Mishra"
                    width={120}
                    height={120}
                    className="rounded-full mx-auto border-4 border-green-200"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Abhishek Mishra</h3>
                <p className="text-gray-600 mb-4">Backend Developer & RGPV Student</p>
                <div className="flex justify-center gap-3">
                  <Link href="https://github.com/abhishekmishra" target="_blank">
                    <Button variant="outline" size="sm">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </Link>
                  <Link href="https://linkedin.com/in/abhishekmishra" target="_blank">
                    <Button variant="outline" size="sm">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Button>
                  </Link>
                  <Link href="https://twitter.com/abhishekmishra" target="_blank">
                    <Button variant="outline" size="sm">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Thank You for Your Dedication! 🙏</h4>
                <p className="text-gray-700">
                  We appreciate Nilesh and Abhishek for their hard work in creating this platform to help fellow RGPV
                  students succeed in their career journeys. Their commitment to building a supportive community is
                  truly commendable.
                </p>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader>
            <CardTitle>Get Involved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Want to contribute to this project or have suggestions for improvement? We'd love to hear from you!
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/share">
                <Button>Share Your Experience</Button>
              </Link>
              <Link href="https://github.com/rgpv-interview-experiences" target="_blank">
                <Button variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  Contribute on GitHub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
