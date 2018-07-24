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
        key: 'user',
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

  async run(msg: commando.CommandMessage, { user, role }: { user: User, role: Role }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('MANAGE_ROLES')) {
      await msg.reply('You can\'t add roles.')
      return msg.delete()
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(role) <= 0) {
      await msg.reply('You can\'t add roles that are higher than or equal to yours.')
      return msg.delete()
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const addRoleResponse = await member.roles.add(role).catch(() => {
      return
    })

    if (!addRoleResponse) {
      await msg.reply("I don't have permission to add that role to that user.")
      return msg.delete()
    }

    if (channel) {
      channel.send(`${msg.author.username} has added role ${role.name} to ${member.displayName}.`)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    Logger.log(`\r\n[${time}] ${msg.author.username} has added role ${role.name} to ${member.displayName}.`)

    await msg.reply(`Added role ${role.name} to ${member.displayName}.`)
    return msg.delete()
  }
}
