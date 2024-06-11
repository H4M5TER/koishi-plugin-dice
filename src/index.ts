import { Context, z } from 'koishi'
import dice from './dice'

export const name = 'dice'

export const Config = z.object({})

export function apply(ctx: Context) {
  ctx.plugin(dice)

  ctx.i18n.define('zh', require('./locales/zh'))
  ctx
    .command('roll <input:text>')
    .option('hide', '--hide')
    .action(({ options, session }, input = '') => {
      function flat(input: [string, number]): string {
        if (parseInt(input[0]) === input[1])
          return input[0]
        return `${input[0]} = ${input[1]}`
      }

      const [, time, dice, comment = ''] = input.trim().toLowerCase().match(/(?:([^#]+)#)?([\d+*x\-\/dk()]+)(.*)/)
      let answer: string
      if (time) {
        const parsed_time = ctx.dice.parse(time)
        const result = Array(parsed_time[1]).fill(0).map((_, i) => {
          return `${i + 1}. ${dice} = ${flat(ctx.dice.parse(dice))}`
        }).join('\n')
        answer = session.text('.multi-dice', [session.username, time, comment, flat(parsed_time), result])
      } else {
        answer = session.text('.single-dice', [session.username, comment, dice, flat(ctx.dice.parse(dice))])
      }

      if (!options.hide) return answer
      session.bot.sendPrivateMessage(
        session.userId,
        `[${session.event.channel.name}]:\n${answer}`
      )
      return session.text('.hide', [session.username])
    })
  ctx.middleware((session, next) => {
    const { content, prefix } = session.stripped
    if (!prefix) return next()
    let index = prefix.length
    if (content[index] !== 'r') return next()
    let options = {}
    if (content[index + 1] === 'h') {
      options = { hide: true }
      index += 1
    }
    return session.execute({
      name: 'roll',
      args: [content.slice(index + 1)],
      options,
    })
  })
}
