import { Context } from 'koishi'
import dice from './dice'

export const name = 'dice'

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
        answer = session.text('.multi-dice', [session.username, time, comment, time, flat(parsed_time)])
        for (let i = 1; i <= parsed_time[1]; ++i) {
          answer += `${i}. ${dice} = ${flat(ctx.dice.parse(dice))}\n`
        }
      } else {
        answer = session.text('.single-dice', [session.username, comment, dice, flat(ctx.dice.parse(dice))])
      }

      if (!options.hide) return answer
      session.bot.sendPrivateMessage(
        session.userId,
        `[${session.channelName}]:\n${answer}`
      )
      return session.text('.hide', [session.username])
    })
  ctx.middleware((session, next) => {
    const { content, prefix } = session.parsed
    if (prefix && content[0] === 'r') {
      if (content[1] === 'h')
        return session.execute({
          name: 'roll',
          args: [content.slice(2)],
          options: { hide: true },
        })
      return session.execute({
        name: 'roll',
        args: [content.slice(1)]
      })
    } else return next()
  })
}
