import { Context } from 'koishi-core'
import roll from './roll'

export const name = 'dice'
export function apply(ctx: Context) {
  ctx.plugin(roll)
}
