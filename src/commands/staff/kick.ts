import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, GuildChannel, User } from 'discord.js'
import { MachoCommand } from '../../types'

export default class KickCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'kick',
      aliases: ['kickuser'],
      group: 'staff',
      memberName: 'kick',
      description: 'Kicks a mentioned user.',
      details: oneLine`
        This command is used to kick a user that is mentioned.
        Very useful indeed.
			`,
      examples: ['kick @JasonHaxStuff', 'kickuser @KillMeNow'],
      guildOnly: true,

      args: [{
        key: 'user',
        label: 'mention',
        prompt: 'Who would you like to kick?',
        type: 'user',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { user }: { user: User }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('KICK_MEMBERS')) {
      return msg.reply("You can't kick members.").catch(() => {
        return null
      })
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
      return msg.reply('You can\'t kick that user.').catch(() => {
        return null
      })
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const kickReponse = await member.kick().catch(() => {
      return
    })

    if (!kickReponse) {
      return msg.reply('I can\'t kick that member.').catch(() => {
        return null
      })
    }

    if (channel) {
      channel.send(`\`${msg.author.tag}\` (${msg.author.id}) has kicked \`${user.tag}\` (${user.id}) from ${msg.guild.name}.`).catch(() => {
        return null
      })
    }

    const time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has kicked ${user.tag} (${user.id}) from ${msg.guild.name} (${msg.guild.id}).`)

    return msg.reply(user.tag + ' has been kicked!').catch(() => {
      return null
    })
  }
}
