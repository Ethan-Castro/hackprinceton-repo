"use client"

import * as React from "react"
import { Streamdown, type StreamdownProps } from "streamdown"
import { cn } from "@/lib/utils"

type ResponseProps = Omit<StreamdownProps, "children"> & {
  children: string
  parseIncompleteMarkdown?: boolean
  className?: string
}

const Response = React.forwardRef<HTMLDivElement, ResponseProps>(
  (
    {
      children,
      parseIncompleteMarkdown = true,
      className,
      components,
      rehypePlugins,
      remarkPlugins,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("prose prose-sm dark:prose-invert max-w-none", className)} {...props}>
        <Streamdown
          parseIncompleteMarkdown={parseIncompleteMarkdown}
          components={components}
          rehypePlugins={rehypePlugins}
          remarkPlugins={remarkPlugins}
        >
          {children}
        </Streamdown>
      </div>
    )
  }
)
Response.displayName = "Response"

export { Response }
export type { ResponseProps }

