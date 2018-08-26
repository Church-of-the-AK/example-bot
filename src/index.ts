import * as commando from 'discord.js-commando'
import * as path from 'path'
import { oneLine, stripIndents } from 'common-tags'
import * as sqlite from 'sqlite'
import * as config from './config'
import { ServerQueue } from './types/ServerQueue'
import { handleMessage, handleGuildAdd } from './handlers'

export const queue: Map<string, ServerQueue> = new Map()

export const client = new commando.CommandoClient({
  owner: config.ownerId,
  commandPrefix: config.prefix,
  unknownCommandResponse: false
})

client
  .on('error', console.error)
  .on('warn', console.warn)
  .on('ready', () => {
    console.log(`Client ready; logged in as ${client.user.tag} (${client.user.id})`)

    client.user.setActivity(`Macho | @${client.user.tag} help`, {
      url: config.twitch,
      type: 'STREAMING'
    })
  })
  .on('guildMemberAdd', member => {
    if (member.user.bot) {
      return
    }

    const commonerRole = member.guild.roles.find(role => role.name.toLowerCase() === 'commoner')
    const memberRole = member.guild.roles.find(role => role.name.toLowerCase() === 'member')

    member.roles.add(commonerRole ? commonerRole : memberRole).catch(() => {
      // eat the error, not important
    })
  })
  .on('disconnect', () => {
    console.warn('Disconnected!')
  })
  .on('reconnecting', () => {
    console.warn('Reconnecting...')
  })
  .on('commandRun', (cmd, promise, msg, args) => {
    const message = `
Command: ${cmd.name}
\tUser: ${msg.author.tag} (${msg.author.id})
\tGuild: ${msg.guild.name} (${msg.guild.id})
\tArgs: \n${JSON.stringify(args, null, 2)}
    `

    console.log(message)
  })
  .on('commandError', (cmd, err) => {
    if (err instanceof commando.FriendlyError) return
    console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err)
  })
  .on('commandBlocked', (msg, reason) => {
    console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`)
  })
  .on('commandPrefixChange', (guild, prefix) => {
    console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('commandStatusChange', (guild, command, enabled) => {
    console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('groupStatusChange', (guild, group, enabled) => {
    console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`)
  })
  .on('message', (msg: commando.CommandMessage) => {
    handleMessage(msg)
  })
  .on('guildCreate', guild => {
    handleGuildAdd(guild)
  })
  .setProvider(
    sqlite.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteProvider(db))
  ).catch(console.error)

client.registry
  .registerGroups([
    ['staff', 'Staff Commands'],
    ['member', 'Member Commands'],
    ['music', 'Music Commands'],
    ['economy', 'Money Commands'],
    ['owner', 'Owner-only Commands.']
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.login(config.token)
