"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  LogOut,
  Menu,
  X,
  Home,
  Trophy,
  Info,
  Briefcase,
  Users,
  Bookmark,
} from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              {/* <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div> */}
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RGPV Interviews
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                RGPV Student Community
              </p>
            </div>
          </Link>



          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
                      {/* Desktop Navigation - moved to right side */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>
            {session && !session.user?.isAnonymous && (
              <Link
                href="/saved"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <Bookmark className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Saved</span>
              </Link>
            )}
            <Link
              href="/ranking"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Ranking</span>
            </Link>
            <Link
              href="/about"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <Info className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>About</span>
            </Link>
          </nav>
            {status === "loading" ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            ) : session ? (
              <>
                <Link href="/share">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Share Experience</span>
                    <span className="lg:hidden">Share</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="md:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              {session && !session.user?.isAnonymous && (
                <Link
                  href="/saved"
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>Saved</span>
                </Link>
              )}
              <Link
                href="/ranking"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Weekly Ranking</span>
              </Link>
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>

              {/* Mobile Actions */}
              <div className="pt-3 border-t">
                {status === "loading" ? (
                  <div className="flex justify-center py-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : session ? (
                  <div className="flex flex-col gap-3">
                    <Link href="/share" onClick={closeMobileMenu}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg py-6 text-lg"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Share Experience
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 py-6 text-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/auth/signin" onClick={closeMobileMenu}>
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg py-6 text-lg"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
