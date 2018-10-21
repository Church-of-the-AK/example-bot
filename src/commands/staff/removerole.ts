import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, GuildChannel, Role, GuildMember, RoleStore } from 'discord.js'

export default class RemoveRoleCommand extends commando.Command {
  constructor (client) {
    super(client, {
      name: 'removerole',
      aliases: ['delrole', 'demote'],
      group: 'staff',
      memberName: 'removerole',
      description: 'Removes a mentioned role from a mentioned user.',
      details: oneLine`
        This command takes in a mentioned user and a mentioned role,
        and removes that role from that user.
			`,
      examples: ['removerole @JasonHaxStuff @Owner', 'demote @JasonHaxStuff @Owner'],
      guildOnly: true,

      args: [{
        key: 'member',
        label: 'user',
        prompt: 'Who would you like to remove the role from?',
        type: 'member',
        infinite: false
      },
      {
        key: 'role',
        label: 'role',
        prompt: 'What role would you like to remove from the user?',
        type: 'role',
        infinite: false
      }
      ]
    })
  }

  async run (msg: commando.CommandMessage, { member, role }: { member: GuildMember, role: Role }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('MANAGE_ROLES')) {
      return msg.reply('You can\'t remove roles.').catch(() => {
        return null
      })
    }

    if (msg.member.roles.highest.comparePositionTo(role) <= 0) {
      return msg.reply('You can\'t remove roles that are higher than or equal to yours.').catch(() => {
        return null
      })
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const removeRoleResponse = await member.roles.remove(role).catch(() => {
      return
    })

    if (!removeRoleResponse) {
      return msg.reply('I can\'t remove roles.').catch(() => {
        return null
      })
    }

    if (channel) {
      channel.send(`\`${msg.author.tag}\` (${msg.author.id}) has removed role \`${role.name}\` (${role.id}) from \`${member.user.tag}\` (${member.id}).`).catch(() => {
        return null
      })
    }

    const time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has removed role ${role.name} (${role.id}) from ${member.user.tag} (${member.id}).`)

    return msg.reply(`Removed role \`${role.name}\` from \`${member.user.tag}\`.`).catch(() => {
      return null
    })
  }
}
