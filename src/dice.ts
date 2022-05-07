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
  private logger: Logger

  constructor(ctx: Context, public config: Dice.Config) {
    super(ctx, 'dice')
    this.logger = ctx.logger('dice')
  }

  parse(input: string): [string, number] {
    try {
      // this.logger.info('parsed ' + input)
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
