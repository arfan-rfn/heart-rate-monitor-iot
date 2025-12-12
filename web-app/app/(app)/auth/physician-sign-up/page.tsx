"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"
import { useAuthContext } from "@/components/providers/auth-provider"
import { PasswordStrength, validatePassword } from "@/components/ui/password-strength"
import { apiClient } from "@/lib/api/client"

export default function PhysicianSignUpPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Redirect authenticated users to physician dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/physician")
    }
  }, [authLoading, isAuthenticated, router])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    // Validate password strength
    const validation = validatePassword(formData.password)
    if (!validation.isValid) {
      toast.error(validation.error)
      return
    }

    try {
      setIsLoading(true)
      await apiClient.post("/users/register-physician", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      toast.success("Physician account created successfully! Please sign in.")
      router.push("/auth/sign-in")
    } catch (error: any) {
      console.error("Physician sign-up error:", error)
      toast.error(error.message || "Failed to create account. Please try again.")
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
            Physician Registration
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your physician account to access the physician portal
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  Full Name
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
                  placeholder="Dr. John Smith"
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
                  placeholder="doctor@hospital.com"
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
                <div className="mt-2">
                  <PasswordStrength password={formData.password} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Min 8 chars with uppercase, lowercase, and number/special char
                </p>
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
                  "Create Physician Account"
                )}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/sign-in"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Not a physician?{" "}
              <Link
                href="/auth/sign-up"
                className="font-medium text-primary hover:text-primary/80"
              >
                Register as a patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
