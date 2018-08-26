import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js'

export default class AcceptCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'accept',
      aliases: ['join', 'acceptrules'],
      group: 'member',
      memberName: 'accept',
      description: 'Allows you to join the server when typed in #accept-rules',
      details: oneLine`
				This command is used to join the server. That's it.
			`,
      examples: ['accept'],
      guildOnly: true
    })
  }

  async run (msg: commando.CommandMessage): Promise<Message | Message[]> {
    const acceptRules = msg.guild.roles.find(role => role.name === 'Accept Rules')
    const commoner = msg.guild.roles.find(role => role.name === 'Commoner')
    const member = msg.guild.roles.find(role => role.name === 'Member')

    if (!acceptRules || (!commoner && !member)) {
      return
    }

    if (!msg.member.roles.find(role => role.id === acceptRules.id)) {
      await msg.reply("No, you can't do that lol")
      return msg.delete()
    }

    await msg.member.roles.remove(acceptRules)
    await msg.member.roles.add(commoner ? commoner : member)

    return msg.delete()
  }
}
