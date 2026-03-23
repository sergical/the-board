import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

export function Eyebrow({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={clsx('inline-flex rounded-full bg-olive-950/5 px-3 py-1 font-mono text-xs font-medium uppercase tracking-widest text-olive-600 dark:bg-white/10 dark:text-olive-400', className)} {...props}>
      {children}
    </div>
  )
}
