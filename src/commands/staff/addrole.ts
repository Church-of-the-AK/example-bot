import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, Role, User, GuildChannel, RoleStore } from 'discord.js'

export default class AddRoleCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'addrole',
      aliases: ['addrank', 'promote'],
      group: 'staff',
      memberName: 'addrole',
      description: 'Adds a mentioned role to a mentioned user.',
      details: oneLine`
				Allows to to add roles to users.
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

  async run (msg: commando.CommandMessage, { user, role }: { user: User, role: Role }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('MANAGE_ROLES')) {
      return msg.reply('You can\'t add roles.').catch(() => {
        return null
      })
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(role) <= 0) {
      return msg.reply('You can\'t add roles that are higher than or equal to yours.').catch(() => {
        return null
      })
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const addRoleResponse = await member.roles.add(role).catch(() => {
      return
    })

    if (!addRoleResponse) {
      return msg.reply("I don't have permission to add that role to that user.").catch(() => {
        return null
      })
    }

    if (channel) {
      channel.send(`\`${msg.author.tag}\` (${msg.author.id}) has added role \`${role.name}\` (${role.id}) to \`${user.tag}\` (${user.id}).`).catch(() => {
        return null
      })
    }

    const time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has added role ${role.name} (${role.id}) to ${user.tag} (${user.id}).`)

    return msg.reply(`Added role \`${role.name}\` to \`${user.tag}\`.`).catch(() => {
      return null
    })
  }
}
