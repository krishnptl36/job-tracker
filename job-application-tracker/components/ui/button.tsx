'use client'
import React from 'react'

type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  variant?: 'default' | 'ghost' | 'outline'
}

const base =
  'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2'

const variants: Record<string, string> = {
  default: 'bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]',
  ghost: 'bg-transparent',
  outline: 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
}

const Button = React.forwardRef<any, ButtonProps>(
  ({ className = '', variant = 'default', href, children, ...props }, ref) => {
    const cls = [base, variants[variant] ?? '', className].filter(Boolean).join(' ')

    if (href) {
      return (
        <a ref={ref} className={cls} href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      )
    }

    return (
      <button ref={ref} className={cls} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
