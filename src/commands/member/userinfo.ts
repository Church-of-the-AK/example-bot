import { CommandMessage } from 'discord.js-commando'
import { Message, MessageEmbed, version, User } from 'discord.js'
import { api } from '../../config'
import { MachoCommand } from '../../types'

export default class StatsCommand extends MachoCommand {
  constructor (client) {
    super(client, {
      name: 'user',
      aliases: ['userinfo', 'user-info'],
      group: 'member',
      memberName: 'user',
      description: 'Tells you some info about a user',
      details: 'Tells you some info about a user.',
      examples: ['user @JasonHaxStuff', 'userinfo'],

      args: [{
        key: 'userInput',
        label: 'user',
        prompt: '',
        type: 'user',
        default: 0
      }]
    })
  }

  async run (msg: CommandMessage, { userInput }: { userInput: User | 0 }): Promise<Message | Message[]> {
    const user = userInput ? userInput : msg.author
    const member = msg.guild.member(user)
    const lastMessage = member.lastMessage ? member.lastMessage.content.substring(0, 250) : ''
    const roles = member.roles.map(role => {
      return `${role.name === '@everyone' ? 'everyone' : role.name}`
    }).join(', ')

    const userInfo = `ID: ${user.id}
Bot: ${user.bot}
Status: ${user.presence.status}
Playing: ${user.presence.activity ? user.presence.activity.name : 'None'}
Date created: ${user.createdAt}`

    const memberInfo = `Nickname: ${member.displayName === user.username ? 'None' : member.displayName}
Joined ${msg.guild.name} at: ${member.joinedAt}
Last message: ${lastMessage ? lastMessage + (lastMessage.length < member.lastMessage.content.length ? '...' : '') : 'None'}
Roles: ${roles}`

    const embed = new MessageEmbed()
      .setTitle(`Info about ${user.tag}`)
      .setAuthor(msg.author.username, msg.author.displayAvatarURL(), api.url + '/users/' + msg.author.id)
      .setColor('BLUE')
      .setFooter('Macho', this.client.user.displayAvatarURL())
      .setThumbnail(user.displayAvatarURL())
      .addField('User Info', userInfo)
      .addField('Member Info', memberInfo)

    return msg.channel.send(embed).catch(() => {
      return null
    })
  }
}
