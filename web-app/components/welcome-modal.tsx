"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Icons } from "@/components/icons"
import { useUser } from "@/hooks/use-user"
import { useCompleteProfile } from "@/hooks/use-account"
import { siteConfig } from "@/config/site"

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy to continue",
  }),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const router = useRouter()
  const { data: user, refetch } = useUser()
  const completeProfileMutation = useCompleteProfile()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      agreeToTerms: false,
    },
  })

  // Update form values when user data is available
  useEffect(() => {
    if (user) {
      form.setValue("name", user.name || "")
    }
  }, [user, form])

  const [selectedImage, setSelectedImage] = useState<string>("")

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)

      // Create a local preview URL
      const imageUrl = URL.createObjectURL(file)

      // Store the selected image for preview (not sent to server)
      setSelectedImage(imageUrl)
    } catch (error) {
      console.error("Failed to process image:", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setIsLoading(true)
      await completeProfileMutation.mutateAsync({
        name: values.name,
      })

      // Refresh user data
      await refetch()

      // Close modal and navigate to dashboard
      onOpenChange(false)
      router.push('/dashboard')
    } catch (error) {
      console.error("Failed to complete profile:", error)
      // Error is already handled by the mutation hook with toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl">Welcome to {siteConfig.name}!</DialogTitle>
          <DialogDescription>
            Hi {user?.name || 'there'}! We&apos;re excited to have you here. Please complete your profile to get started.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedImage || user?.avatarUrl || undefined} alt={form.watch("name") || user?.name || user?.email} />
                <AvatarFallback className="bg-muted text-lg">
                  <Icons.User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={isUploadingImage}>
                    <span>
                      {isUploadingImage ? (
                        <>
                          <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icons.Edit className="mr-2 h-4 w-4" />
                          Change Picture
                        </>
                      )}
                    </span>
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                  disabled={isUploadingImage}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Upload a profile picture (JPG, PNG)
                </p>
              </div>
            </div>

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms Agreement */}
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="flex-1 leading-tight">
                    <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                      I agree to the{" "}
                      <a
                        href="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-foreground hover:text-primary underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading || completeProfileMutation.isPending || isUploadingImage}
                className="w-full sm:w-auto"
              >
                {isLoading || completeProfileMutation.isPending ? (
                  <>
                    <Icons.Loader className="mr-2 h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <Icons.Check className="mr-2 h-4 w-4" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}