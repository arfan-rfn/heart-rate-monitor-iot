import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Physician Portal | Heart Track',
  description: 'Manage and monitor your patients health data',
}

export default function PhysicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
