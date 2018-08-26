import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, TextChannel } from 'discord.js'

export default class InviteCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'invite',
      aliases: [],
      group: 'member',
      memberName: 'invite',
      description: 'Gives you an invite to the current server.',
      details: oneLine`
        Gives you an invite to the current server.
      `,
      examples: ['invite'],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const channel = msg.channel as TextChannel
    const invite = await channel.createInvite({ maxAge: 0, reason: `${msg.author.tag} asked for one.` })

    return msg.reply(`Here is an invite to the server: ${invite.url}`)
  }
}
