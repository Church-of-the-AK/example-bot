import * as  commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { Message } from 'discord.js';

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

  async run(msg: commando.CommandMessage): Promise<Message> {
    if (msg.member.roles.find('name', 'Accept Rules')) {
      msg.member.removeRole(msg.guild.roles.find('name', 'Accept Rules'))
      msg.member.addRole(msg.guild.roles.find('name', 'Commoner') ? msg.guild.roles.find('name', 'Commoner') : msg.guild.roles.find('name', 'Member'))
    } else {
      const reply = await msg.reply("No, you can't do that lol")
      if (reply instanceof Message) reply.delete(3000)
    }
    msg.delete()

    return undefined
  }
}
