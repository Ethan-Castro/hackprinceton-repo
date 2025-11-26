"use client"

import * as React from "react"
import { Streamdown, defaultRehypePlugins, type StreamdownProps } from "streamdown"
import type { Element, Root } from "hast"
import { cn } from "@/lib/utils"

type ResponseProps = Omit<StreamdownProps, "children"> & {
  children: string
  parseIncompleteMarkdown?: boolean
  className?: string
}

const defaultRehypePluginList = Object.values(defaultRehypePlugins)

// Drop any element that carries an empty src attribute to avoid React warnings and stray network requests.
const removeEmptySrcPlugin = () => (tree: Root) => {
  const isElementNode = (node: unknown): node is Element =>
    typeof node === "object" && node !== null && (node as Element).type === "element"

  const hasChildren = (node: unknown): node is { children: unknown[] } =>
    typeof node === "object" && node !== null && Array.isArray((node as { children?: unknown[] }).children)

  const stack: Array<Element | Root> = [tree]

  while (stack.length > 0) {
    const node = stack.pop()

    if (!node) continue

    if (isElementNode(node)) {
      const src = node.properties?.src

      const isEmptySrc =
        typeof src === "string"
          ? src.trim() === ""
          : Array.isArray(src)
            ? src.every((value) => typeof value === "string" && value.trim() === "")
            : false

      if (isEmptySrc && node.properties) {
        delete node.properties.src
      }
    }

    if (hasChildren(node)) {
      node.children.forEach((child) => {
        if (typeof child === "object" && child !== null) {
          stack.push(child as Element)
        }
      })
    }
  }
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
    const mergedRehypePlugins = React.useMemo(() => {
      const basePlugins = rehypePlugins ?? defaultRehypePluginList
      const normalizedPlugins = Array.isArray(basePlugins)
        ? basePlugins
        : basePlugins === null || basePlugins === undefined
          ? []
          : [basePlugins]

      return [...normalizedPlugins, removeEmptySrcPlugin]
    }, [rehypePlugins])

    return (
      <div ref={ref} className={cn("prose prose-sm dark:prose-invert max-w-none", className)} {...props}>
        <Streamdown
          parseIncompleteMarkdown={parseIncompleteMarkdown}
          components={components}
          rehypePlugins={mergedRehypePlugins}
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
