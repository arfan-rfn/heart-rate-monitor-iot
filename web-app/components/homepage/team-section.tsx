import { siteConfig } from "@/config/site"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import Link from "next/link"

export function TeamSection() {
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <section className="border-t py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm font-medium text-muted-foreground">Our Team</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Meet the Team
            </h2>
            <p className="mx-auto max-w-3xl text-muted-foreground">
              The people behind PulseConnect
            </p>
          </div>

          {/* Team Members Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.teamMembers.map((member, index) => (
              <div key={index} className="space-y-4 text-center">
                {/* Avatar */}
                <Avatar className="mx-auto h-24 w-24">
                  <AvatarImage src={member.photo} alt={member.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm">
                    <a
                      href={`mailto:${member.email}`}
                      className="text-muted-foreground hover:underline"
                    >
                      {member.email}
                    </a>
                  </p>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground">{member.bio}</p>

                {/* Social Links */}
                <div className="flex justify-center gap-2">
                  {member.github && (
                    <Link
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
                    >
                      <Icons.GitHub className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                  )}
                  {member.linkedin && (
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent"
                    >
                      <Icons.LinkedIn className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
