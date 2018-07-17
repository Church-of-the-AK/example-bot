import * as  commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message, Role } from 'discord.js';

module.exports = class AcceptCommand extends commando.Command {
  constructor(client) {
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
      guildOnly: true,
    })
  }

  async run(msg: commando.CommandMessage): Promise<Message | Message[]> {
    const acceptRules = msg.guild.roles.find((role: Role) => role.name == 'Accept Rules')
    const commoner = msg.guild.roles.find((role: Role) => role.name === 'Commoner')
    const member = msg.guild.roles.find((role: Role) => role.name === 'Member')

    if (!msg.member.roles.has(acceptRules.id)) {
      await msg.reply("No, you can't do that lol")
      return msg.delete()
    }

    msg.member.roles.remove(acceptRules)
    msg.member.roles.add(commoner ? commoner : member)

    return msg.delete()
  }
}
