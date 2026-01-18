export function getPaginationPages(
  current: number,
  total: number,
  delta = 1
) {
  const pages: (number | "ellipsis")[] = []

  const range = {
    start: Math.max(2, current - delta),
    end: Math.min(total - 1, current + delta),
  }

  if (current - delta > 2) {
    pages.push("ellipsis")
  }

  for (let i = range.start; i <= range.end; i++) {
    pages.push(i)
  }

  if (current + delta < total - 1) {
    pages.push("ellipsis")
  }

  return [1, ...pages, total]
}
