import { TextChannel, User, DMChannel, GroupDMChannel } from 'discord.js'

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

export function randomItem (arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export async function confirm (message: string, channel: TextChannel | DMChannel | GroupDMChannel, user: User) {
  await channel.send(`${user}, ${message} (\`y\`)es/(\`n\`)o`)

  const response = await channel.awaitMessages(msg2 => (msg2.content.toLowerCase() === 'y' || msg2.content.toLowerCase() === 'n')
    && msg2.author.id === user.id, {
      time: 10000,
      errors: [ 'time' ],
      max: 1
    }).catch(() => {
      return
    })

  if (!response) {
    return false
  }

  const answer = response.first().content.toLowerCase()

  if (answer === 'n') {
    return false
  }

  return true
}
