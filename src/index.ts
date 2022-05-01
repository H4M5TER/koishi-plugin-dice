import { Context } from 'koishi'
import roll from './roll'

export const name = 'dice'

export function apply(ctx: Context) {
  ctx.plugin(roll)
}
