import * as commando from 'discord.js-commando'
import { oneLine } from 'common-tags'
import ec = require('embed-creator')
import { Message } from 'discord.js';
import * as materialColors from 'material-colors'

module.exports = class AddNumbersCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: 'embed',
      aliases: [],
      group: 'member',
      memberName: 'embed',
      description: 'Makes a fancy lil\' embed.',
      details: oneLine`
        This command can be used to make an embed. It's pretty useful. To
        learn how to use it, just type \`help embed\`.
			`,
      examples: ['embed --title [title] --desc [description] --color {color}', 'embed --title Embed title --desc Embed description --color green'],

      args: [{
        key: 'content',
        label: 'content',
        prompt: 'Type `--title [title] --desc [description] --color {color}`',
        type: 'string',
        infinite: false
      }]
    })
  }

  async run(msg: commando.CommandMessage, { content }): Promise<Message> {
    // find these thingys
    let titleParam: number = content.toLowerCase().indexOf("--title")
    let descParam: number = content.toLowerCase().indexOf("--desc")
    let colorParam: number = content.toLowerCase().indexOf("--color")

    // gotta check if the title and description are there, doi
    if (titleParam > -1 && descParam > -1) {
      // gotta get that title String
      let realTitle: string = content.substring(titleParam + 7, descParam)

      // do we have a color parameter? yes.
      if (colorParam > -1) {
        // get the description
        let realDesc: string = content.substring(descParam + 6, colorParam)
        // color String
        let realColor: string = content.substring(colorParam + 8, content.length)
        try {
          // check if it's a real color
          let colorThing: string = materialColors[realColor || 'blue']['500']
          // send a good ol' embed if it is real
          msg.channel.send(ec(
            colorThing, {
              "name": msg.author.username,
              "icon_url": msg.author.displayAvatarURL,
              "url": null
            }, realTitle, realDesc, [], {
              "text": "Macho",
              "icon_url": null
            }, {
              "thumbnail": null,
              "image": null
            }, false
          ))
        } catch (err) {
          // i guess it wasn't real, make one anyways
          msg.channel.send(ec(
            "#FEAFEA", {
              "name": msg.author.username,
              "icon_url": msg.author.displayAvatarURL,
              "url": null
            }, realTitle, realDesc, [], {
              "text": "Macho",
              "icon_url": null
            }, {
              "thumbnail": null,
              "image": null
            }, false
          ))
        }

      }
      // nevermind, we don't (have a color parameter).
      else {
        // get that description
        let realDesc = content.substring(descParam + 6, content.length)
        // do the same thing except that gosh darn color is like pink or whatever
        msg.channel.send(ec(
          "#FEAFEA", {
            "name": msg.author.username,
            "icon_url": msg.author.displayAvatarURL,
            "url": null
          }, realTitle, realDesc, [], {
            "text": "Macho",
            "icon_url": null
          }, {
            "thumbnail": null,
            "image": null
          }, false
        ))
      }
    } else {
      msg.reply("Use `m!help embed` for usage instructions.")
    }
    // delete that gosh darn message, it's cloggin up the beautiful embed
    if (msg.channel.type == 'text') {
      msg.delete()
    }
    return undefined
  }
}
