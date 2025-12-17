import { Footer } from '@/components/marketing/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
