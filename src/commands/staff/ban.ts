import { CommandMessage } from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import { Message, TextChannel, GuildChannel, User } from 'discord.js'
import { MachoCommand } from '../../types'

export default class BanCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'ban',
      aliases: ['banuser', 'banhammer'],
      group: 'staff',
      memberName: 'ban',
      description: 'Bans a mentioned user.',
      details: oneLine`
        This command is used to ban a user that is mentioned.
        Very useful indeed.
			`,
      examples: ['ban @JasonHaxStuff', 'banhammer @KillMeNow'],
      guildOnly: true,

      args: [{
        key: 'user',
        label: 'mention',
        prompt: 'Who would you like to ban?',
        type: 'user',
        infinite: false
      }]
    })
  }

  async run (msg: CommandMessage, { user }: { user: User }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('BAN_MEMBERS')) {
      return msg.reply("You can't ban users.").catch(() => {
        return null
      })
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
      return msg.reply('You can\'t ban that user.').catch(() => {
        return null
      })
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const banResponse = await msg.guild.members.ban(member).catch(() => {
      return
    })

    if (!banResponse) {
      return msg.reply('I can\'t ban that user. Sorry about that.').catch(() => {
        return null
      })
    }

    if (channel) {
      channel.send(`\`${msg.author.tag}\` (${msg.author.id}) has banned \`${member.user.tag} (${member.id})\` from \`${msg.guild.name}\`.`).catch(() => {
        return null
      })
    }

    let time = new Date()
    log(`\r\n[${time}] ${msg.author.tag} (${msg.author.id}) has banned ${member.user.tag} (${member.id}) from ${msg.guild.name} (${msg.guild.id}).`)

    return msg.reply(user.tag + ' has been banned!').catch(() => {
      return null
    })
  }
}
