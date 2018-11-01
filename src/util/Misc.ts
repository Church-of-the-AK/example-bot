export function paginate (items: any[]) {
  const pages: Map<number, any> = new Map()
  let page = 1

  for (let i = 0; i < items.length; i++) {
    if (pages.has(page)) {
      pages.set(page, pages.get(page) + items[i] + '\n')
    } else {
      pages.set(page, items[i] + '\n')
    }

    if ((i + 1) % 10 === 0) {
      page++
    }
  }

  return pages
}

export function shuffle (items: any[]) {
  let j
  let x
  let i

  for (i = items.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = items[i]
    items[i] = items[j]
    items[j] = x
  }
  return items
}
