import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import * as Logger from '../../util/Logger'
import * as moment from 'moment'
import { Message, TextChannel, Role, User, GuildChannel } from 'discord.js';

module.exports = class AddRoleCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'addrole',
      aliases: ['addrank', 'promote'],
      group: 'staff',
      memberName: 'addrole',
      description: 'Adds a mentioned role to a mentioned user.',
      details: oneLine`
				This is an incredibly useful command that changes the username of the bot.
				Only usable by the owner, JasonHaxStuff.
			`,
      examples: ['addrole @JasonHaxStuff @Owner', 'promote @JasonHaxStuff @Owner'],
      guildOnly: true,

      args: [{
        key: 'username',
        label: 'username',
        prompt: 'Who would you like to add the role to?',
        type: 'user',
        infinite: false
      },
      {
        key: 'role',
        label: 'role',
        prompt: 'What role would you like to add?',
        type: 'role',
        infinite: false
      }
      ]
    })
  }

  async run(msg: commando.CommandMessage, { username, role }: { username: User, role: Role }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission("ADMINISTRATOR")) {
      await msg.reply("Too bad, so sad. Very sad.")
      return msg.delete()
    }

    const user = msg.guild.member(username)

    try {
      const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel

      user.roles.add(role)

      if (channel) {
        channel.send(`${msg.author.username} has added ${role.name} to ${user.displayName}.`)
      }

      const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
      Logger.log(`\r\n[${time}] ${msg.author.username} has added ${role.name} to ${user.displayName}.`)

      await msg.reply(`Added rank ${role.name} to ${user.displayName}.`)
      msg.delete()
    } catch (err) {
      console.log(err)

      await msg.reply("I couldn't complete your request, sorry 'bout that.")
      return msg.delete()
    }
  }
}
