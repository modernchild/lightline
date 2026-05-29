/**
 * Simple markdown to JSX parser for policy documents
 * Handles headings, paragraphs, lists, bold, and links
 */

export function parseMarkdown(markdown) {
  const lines = markdown.split('\n')
  const elements = []
  let currentList = []
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines and horizontal rules
    if (!trimmed || trimmed === '---') continue

    // Parse headings
    if (trimmed.startsWith('# ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'ul', items: currentList })
        currentList = []
      }
      elements.push({ type: 'h1', content: trimmed.slice(2).trim() })
      continue
    }

    if (trimmed.startsWith('## ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'ul', items: currentList })
        currentList = []
      }
      elements.push({ type: 'h2', content: trimmed.slice(3).trim() })
      continue
    }

    if (trimmed.startsWith('### ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'ul', items: currentList })
        currentList = []
      }
      elements.push({ type: 'h3', content: trimmed.slice(4).trim() })
      continue
    }

    if (trimmed.startsWith('#### ')) {
      if (currentList.length > 0) {
        elements.push({ type: 'ul', items: currentList })
        currentList = []
      }
      elements.push({ type: 'h4', content: trimmed.slice(5).trim() })
      continue
    }

    // Parse lists
    if (trimmed.startsWith('- ')) {
      const listItem = trimmed.slice(2).trim()
      currentList.push({ content: listItem, nested: false })
      continue
    }

    // Parse nested lists
    if (trimmed.startsWith('  - ')) {
      const listItem = trimmed.slice(4).trim()
      currentList.push({ content: listItem, nested: true })
      continue
    }

    // Parse tables (simplified - just extract key info)
    if (trimmed.startsWith('| ')) {
      inTable = true
      continue
    }

    if (inTable && trimmed === '') {
      inTable = false
      continue
    }

    // Parse paragraphs
    if (trimmed && !inTable) {
      if (currentList.length > 0) {
        elements.push({ type: 'ul', items: currentList })
        currentList = []
      }
      elements.push({ type: 'p', content: trimmed })
    }
  }

  // Don't forget remaining list
  if (currentList.length > 0) {
    elements.push({ type: 'ul', items: currentList })
  }

  return elements
}

/**
 * Convert inline markdown formatting to JSX
 * Handles **bold**, *italic*, and [links](url)
 */
export function renderInlineContent(text) {
  if (!text) return ''

  // Split by patterns to handle multiple inline formats
  const parts = []
  let remaining = text
  let lastIndex = 0

  // Pattern for bold, italic, links, and email
  const pattern = /\*\*([^\*]+)\*\*|\*([^\*]+)\*|\[([^\]]+)\]\(([^)]+)\)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g

  let match
  const matches = []
  while ((match = pattern.exec(text)) !== null) {
    matches.push({ match, index: match.index, length: match[0].length })
  }

  // If no matches, return as is
  if (matches.length === 0) {
    return text
  }

  // Build parts array with matches
  let currentIndex = 0
  for (const { match, index, length } of matches) {
    if (index > currentIndex) {
      parts.push({ type: 'text', value: text.substring(currentIndex, index) })
    }

    if (match[1]) {
      // Bold
      parts.push({ type: 'bold', value: match[1] })
    } else if (match[2]) {
      // Italic
      parts.push({ type: 'italic', value: match[2] })
    } else if (match[3]) {
      // Link
      parts.push({ type: 'link', text: match[3], url: match[4] })
    } else if (match[5]) {
      // Email
      parts.push({ type: 'email', value: match[5] })
    }

    currentIndex = index + length
  }

  if (currentIndex < text.length) {
    parts.push({ type: 'text', value: text.substring(currentIndex) })
  }

  return parts
}

/**
 * Render inline content with proper JSX elements
 */
export function renderInlineJSX(content) {
  if (typeof content === 'string') {
    const parts = renderInlineContent(content)
    if (typeof parts === 'string') return parts

    return parts.map((part, idx) => {
      switch (part.type) {
        case 'text':
          return part.value
        case 'bold':
          return <strong key={idx}>{part.value}</strong>
        case 'italic':
          return <em key={idx}>{part.value}</em>
        case 'link':
          return (
            <a key={idx} href={part.url} target="_blank" rel="noopener noreferrer">
              {part.text}
            </a>
          )
        case 'email':
          return (
            <a key={idx} href={`mailto:${part.value}`}>
              {part.value}
            </a>
          )
        default:
          return null
      }
    })
  }

  return content
}
