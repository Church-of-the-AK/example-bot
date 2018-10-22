import * as discord from 'discord.js'
import { Song } from './Song'

export interface ServerQueue {
  /**
   * The text channel the queue was started in.
   */
  textChannel: discord.TextChannel,
  /**
   * The voice channel the queue was started in.
   */
  voiceChannel: discord.VoiceChannel,
  /**
   * The voice connection that music is being played over.
   */
  connection: discord.VoiceConnection,
  /**
   * The list of songs remaining.
   */
  songs: Song[],
  /**
   * The volume of the queue.
   */
  volume: number,
  /**
   * If the queue is playing music or not.
   */
  playing: boolean
  /**
   * The people voting to clear the queue.
   */
  votes: string[]
}
