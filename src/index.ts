import { Context } from 'koishi'
import dice from './dice'

export const name = 'dice'

export function apply(ctx: Context) {
  ctx.plugin(dice)
  ctx
    .command('roll <input:text>')
    .option('hide', '--hide')
    .userFields(['name'])
    .action(({ options, session }, input = '') => {
      console.log('roll triggered')
      const match = input.match(/(([^#]+)#)?.+/g)
      let result = ctx.dice.parse(input)
      if (!options.hide) return result
      session.bot.sendPrivateMessage(
        session.userId,
        `在[${session.channelName}](${session.channelId})中:\n${result}`
      )
      return `${session.username}进行了一次暗骰`
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
