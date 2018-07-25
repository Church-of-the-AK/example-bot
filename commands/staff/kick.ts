import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import { log } from '../../util'
import * as moment from 'moment'
import { Message, TextChannel, GuildChannel, User } from 'discord.js'

export default class KickCommand extends commando.Command {
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

  async run (msg: commando.CommandMessage, { user }: { user: User }): Promise<Message | Message[]> {
    if (!msg.member.hasPermission('KICK_MEMBERS')) {
      await msg.reply("You can't kick members.")
      return msg.delete()
    }

    const member = msg.guild.member(user)

    if (msg.member.roles.highest.comparePositionTo(member.roles.highest) < 0) {
      await msg.reply('You can\'t kick that user.')
      return msg.delete()
    }

    const channel = msg.guild.channels.find((channel: GuildChannel) => channel.name === 'machobot-audit') as TextChannel
    const kickReponse = await member.kick().catch(() => {
      return
    })

    if (!kickReponse) {
      await msg.reply('I can\'t kick that member.')
      return msg.delete()
    }

    if (channel) {
      channel.send(`${msg.author.username} has kicked ${member} from ${msg.guild.name}.`)
    }

    const time = moment().format('YYYY-MM-DD HH:mm:ss Z')
    log(`\r\n[${time}] ${msg.author.username} has kicked ${member} from ${msg.guild.name}.`)

    await msg.reply(user.tag + ' has been kicked!')
    return msg.delete()
  }
}
