import { getAllTemplates } from '@/lib/templates'
import { TemplateCard } from '@/components/templates/template-card'

export const metadata = {
  title: 'Choose Your Review | Annual Review Vault',
  description: 'Select from curated annual review templates by leading creators.',
}

export default function TemplatesPage() {
  const templates = getAllTemplates()

  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Review</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select from curated annual review templates crafted by leading thinkers.
            Each offers a unique approach to reflecting on your year.
          </p>
        </div>

        {/* Template grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {templates.map((template) => (
            <TemplateCard key={template.slug} template={template} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Complete any review for free and download as markdown.
            <br />
            Want to save your progress and unlock the vault? <a href="/pricing" className="underline hover:text-foreground">See pricing</a>.
          </p>
        </div>
      </div>

    </div>
  )
}
