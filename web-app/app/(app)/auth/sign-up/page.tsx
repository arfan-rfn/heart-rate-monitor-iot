"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { auth } from "@/lib/auth"
import { toast } from "sonner"
import { useAuthConfig } from "@/hooks/use-auth-config"
import { useAuthContext } from "@/components/providers/auth-provider"

export default function SignUpPage() {
  const router = useRouter()
  const authConfig = useAuthConfig()
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(authConfig.redirects.afterSignUp)
    }
  }, [authLoading, isAuthenticated, router, authConfig.redirects.afterSignUp])

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      await auth.signInWithGoogle(authConfig.redirects.afterSignUp)
    } catch (error) {
      console.error("Google sign-up error:", error)
      toast.error("Failed to sign up with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppleSignUp = async () => {
    try {
      setIsLoading(true)
      await auth.signInWithApple(authConfig.redirects.afterSignUp)
    } catch (error) {
      console.error("Apple sign-up error:", error)
      toast.error("Failed to sign up with Apple")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    try {
      setIsLoading(true)
      await auth.signUpWithEmail({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      toast.success(authConfig.features.emailVerification 
        ? "Account created successfully! Please check your email to verify your account."
        : "Account created successfully!")
      router.push(authConfig.features.emailVerification ? "/auth/sign-in" : authConfig.redirects.afterSignUp)
    } catch (error) {
      console.error("Email sign-up error:", error)
      toast.error("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Icons.Circle className="mx-auto h-8 w-8 animate-spin" />
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render sign-up form if user is authenticated (redirect will handle navigation)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up to get started with your account
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Social Sign Up Buttons */}
            {(authConfig.methods.google || authConfig.methods.apple) && (
              <div className="space-y-3">
                {authConfig.methods.google && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Icons.Circle className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Icons.Google className="mr-2 h-5 w-5" />
                    )}
                    Continue with Google
                  </Button>
                )}

                {authConfig.methods.apple && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleAppleSignUp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Icons.Circle className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Icons.Apple className="mr-2 h-5 w-5" />
                    )}
                    Continue with Apple
                  </Button>
                )}
              </div>
            )}

            {/* Divider */}
            {authConfig.hasMultipleMethods() && authConfig.methods.emailPassword && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            )}

            {/* Email/Password Form */}
            {authConfig.methods.emailPassword && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Create a password"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icons.Circle className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}