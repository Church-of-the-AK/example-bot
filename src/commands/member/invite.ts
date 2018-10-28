import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, TextChannel } from 'discord.js'
import { MachoCommand } from '../../types'

export default class InviteCommand extends MachoCommand {
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

  async run (msg: CommandMessage): Promise<Message | Message[]> {
    const channel = msg.channel as TextChannel
    const invite = await channel.createInvite({ maxAge: 0, reason: `${msg.author.tag} asked for one.`, unique: false }).catch(() => {
      return
    })

    return msg.reply(invite ? `Here is an invite to the server: ${invite.url}` : 'I could not create an invite to this channel.').catch(() => {
      return null
    })
  }
}
