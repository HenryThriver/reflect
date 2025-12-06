interface DividerWithTextProps {
  children: React.ReactNode
  className?: string
}

/**
 * A horizontal divider with centered text.
 * Common pattern for "Or continue with" sections.
 */
export function DividerWithText({ children, className = '' }: DividerWithTextProps) {
  return (
    <div className={`relative my-6 ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          {children}
        </span>
      </div>
    </div>
  )
}
