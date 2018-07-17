import * as commando from 'discord.js-commando'
import { oneLine, stripIndents } from 'common-tags'
import { queue } from '../../index'
import { CommandMessage } from 'discord.js-commando'
import { Message } from 'discord.js';
const ec = require('embed-creator')

module.exports = class QueueCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['songs'],
      group: 'music',
      memberName: 'queue',
      description: 'Lists every song in the current queue.',
      details: oneLine`
        This command is used to list every song currently
        in the bot's queue.
			`,
      examples: ['queue', 'songs'],
      guildOnly: true,

      args: [{
        key: 'arg',
        label: 'page',
        prompt: 'What page would you like to look at?',
        type: 'integer',
        infinite: false,
        default: 1
      }]
    })
  }

  async run(msg: CommandMessage, { arg }): Promise<Message> {
    let pageNum = arg
    const serverQueue = queue.get(msg.guild.id)
    if (!serverQueue) {
      msg.channel.send('There is nothing playing.')
      return msg.delete()
    }
    let songs = serverQueue.songs.map(song => `**-** ${song.title}`)
    let pages = new Map()
    let page = 1
    for (let i = 0; i < songs.length; i++) {
      if (pages.has(page)) {
        pages.set(page, pages.get(page) + songs[i] + "\n")
      } else {
        pages.set(page, songs[i] + "\n")
      }
      if ((i + 1) % 10 == 0) {
        page = page + 1
      }
    }
    if (pages.get(pageNum) == undefined) {
      msg.channel.send("There aren't that many pages!")
      return msg.delete()
    }
    let realDesc = stripIndents`
			${pages.get(pageNum)}
      **Now playing:** ${serverQueue.songs[0].title}
    `
    const commandoGuild = msg.guild as commando.CommandoGuild
    msg.channel.send(ec(
      "#4286F4", {
        "name": msg.author.username,
        "icon_url": this.client.user.displayAvatarURL,
        "url": null
      }, 'Song Queue:', realDesc, [], {
        "text": `Page ${pageNum}/${pages.size}. View different pages with ${commandoGuild.commandPrefix}queue [number].`,
        "icon_url": null
      }, {
        "thumbnail": null,
        "image": null
      }, false
    ))
    return msg.delete()
  }
}
