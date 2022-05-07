import { Context, Logger, Service, Schema } from 'koishi'
import { SyntaxError, parse } from './parser'

declare module 'koishi' {
  namespace Context {
    interface Services {
      dice: Dice
    }
  }
}

class Dice extends Service {

  constructor(ctx: Context, public config: Dice.Config) {
    super(ctx, 'dice')
  }

  parse(input: string) {
    try {
      return parse(input)
    } catch (error) {
      return error
    }
  }

}

namespace Dice {

  export interface Config { }

  export const Config = Schema.object({})

}

export default Dice
