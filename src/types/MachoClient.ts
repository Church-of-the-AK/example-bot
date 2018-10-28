import { CommandoClient } from 'discord.js-commando'
import { ServerQueue, Song } from '.'

export class MachoClient extends CommandoClient {
  private queue: Map<string, ServerQueue> = new Map()

  public getQueue (guildId: string) {
    return this.queue.get(guildId)
  }

  public createQueue (guildId: string, queue: ServerQueue) {
    return this.queue.set(guildId, queue)
  }

  public deleteQueue (guildId: string) {
    return this.queue.delete(guildId)
  }

  public addSong (guildId: string, song: Song) {
    const songs = this.queue.get(guildId).songs

    if (songs.find(song1 => song1.id === song.id)) {
      throw new Error('Song is already in the queue.')
    }

    return songs.push(song)
  }

  public removeSong (guildId: string, song: Song) {
    const songs = this.queue.get(guildId).songs
    const index = songs.findIndex(song1 => song1.id === song.id)

    if (index === -1) {
      throw new Error('Song not found.')
    }

    return songs.splice(index, 1)
  }
}
