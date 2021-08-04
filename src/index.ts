import { Context } from 'koishi-core'
import Parser, { SyntaxNode } from 'tree-sitter'

export const name = 'dice'

const parser = new Parser()
parser.setLanguage(require('tree-sitter-dice'))

declare module 'tree-sitter' {
  interface SyntaxNode {
    mainNode?: SyntaxNode
    repeatNode?: SyntaxNode
    commentNode?: SyntaxNode
    quanityNode?: SyntaxNode
    facesNode?: SyntaxNode
    keepNode?: SyntaxNode
  }
}

let default_faces = 100

const evaluate = (node: SyntaxNode): any => {
  switch (node.type) {
    case 'source':
      return evaluate(node.child(0))
    case 'operator':
      return evaluate(node.child(1))(
        evaluate(node.child(0)),
        evaluate(node.child(2))
      )
    case 'dice':
      let quanity = node.quanityNode ? evaluate(node.quanityNode) : 1
      let faces = node.facesNode ? evaluate(node.facesNode) : default_faces
      let keep = node.keepNode ? evaluate(node.keepNode) : quanity
      if (quanity < 1) throw new Error('骰子数不合法')
      if (faces < 1) throw new Error('骰子面数不合法')
      if (keep < 1) throw new Error('保留的骰子数不合法')
      let res = []
      for (let i = 0; i < quanity; ++i)
        res.push(Math.floor(Math.random() * faces) + 1)
      if (keep < quanity) {
        res.sort((a, b) => b - a)
        res = res.slice(0, keep)
      }
      // output = output.replace(node.text, `(${res.join('+')})`)
      // console.log(`(${res.join('+')})`)
      return res.reduce((a, b) => a + b)
    case 'coc_extra_dice':
      quanity = node.quanityNode ? evaluate(node.quanityNode) : 1
      if (quanity < 1) throw new Error()
      let ones = Math.floor(Math.random() * 10)
      let tens = []
      for (let i = 0; i <= quanity; ++i)
        tens.push(Math.floor(Math.random() * 10))
      tens.sort(evaluate(node.child(0)))
      if (tens[0] * 10 + ones === 0) return 100
      else return tens[0] * 10 + ones !== 0
    case 'b':
      return (a: number, b: number) => a - b // ascending
    case 'p':
      return (a: number, b: number) => b - a // descending
    case '+':
      return (l: number, r: number) => l + r
    case '-':
      return (l: number, r: number) => l - r
    case '*':
    case 'x':
      return (l: number, r: number) => l * r
    case '/':
      return (l: number, r: number) => l / r
    case 'number':
      return Number(node.text)
    case 'ERROR':
      throw new Error(`意料之外的 '${node.text}'`)
    default:
      throw new Error(`未知的节点类型 '${node.type}'`)
  }
}

export function apply(ctx: Context) {
  ctx
    .command('roll <input:text]')
    .option('hide', '-h', { fallback: false })
    .shortcut('r(.*)', { args: ['$1'] })
    .shortcut('rh(.*)', { args: ['$1'], options: { hide: true } })
    .userFields(['name'])
    .action(({ options, session }, input) => {
      let { name } = session.user
      let { rootNode } = parser.parse(input.trim().toLowerCase())
      let main = rootNode.mainNode ?? parser.parse('d').rootNode.mainNode
      let comment = rootNode.commentNode.text ?? ''
      let result = `${name}: ${comment}\n`
      try {
        if (rootNode.repeatNode) {
          let repeat = evaluate(rootNode.repeatNode)
          result += `${rootNode.repeatNode.text}=${repeat}`
          for (let i = 1; i <= repeat; ++i) {
            result += `${i}. ${main.text}=${evaluate(main)}`
          }
        } else result += `${main.text}=${evaluate(main)}`
      } catch (error) {
        return error.message
      }
      if (!options.hide) return result
      session.bot.sendPrivateMessage(
        session.userId,
        `在[${session.channelName}](${session.channelId})中:\n${result}`
      )
      return `${name}进行了一次暗骰`
    })
}
