{{
  const roll = face => Math.floor(Math.random() * face) + 1
  const default_face = 20
  // pegjs 生成的 parser 类型感人，ts-pegjs 的 returnTypes 毫无影响 metadevpro/ts-pegjs#11
  // 这里考虑怎么和外部交互，考虑引用固定包或者运行时生成 parser
  // 运行时生成 parser 无法使用 ts-pegjs

  // 如果需要多次投相同表达式，目前只能重复解析，很浪费
  // 然而 peggyjs 不仅仅是不支持增量编译的，它甚至不输出语法树
  // 就算如此，我还是不可能回去用 tree-sitter 受 gyp 折磨
  // 暂时不确定 cache 的作用，但是看起来至少不会跳过掷骰

  // 出于泛用的考虑，不用 parser 处理重复次数和 comment（返回 tuple 真的泛用吗
}}

Expr
  = head: Term tail: (([-+])Term)* {
    const res = tail.reduce((res, match) => {
      res[0] += match[0] + match[1][0]
      if (match[0] === "+") res[1] = res[1] + match[1][1]
      if (match[0] === "-") res[1] = res[1] - match[1][1]
      return res
    }, head)
    // 此处如果拍平, Expr 就无法被 Factor 复用
    // 如果要把 Term 拍平，只能在 Term 的上一级操作 (此处) , 所以无法做到 (Dice 怎么做的？)
    return res
  }

Term
  = head: Factor tail: (([x*\/])Factor)* {
    const res = tail.reduce((res, match) => {
      res[0] += match[0] + match[1][0]
      if (match[0] === "*") res[1] = res[1] * match[1][1]
      if (match[0] === "/") res[1] = res[1] / match[1][1]
      return res
    }, head)
    return res
  }

Factor
  = '('expr:Expr')' { return [ '(' + expr[0] + ')', expr[1]] }
  / Dice // 这里是存在从上到下优先级的
  / Integer
// 我不希望把 d 和 k 作为运算符
// 整个骰子独立适合处理逻辑
// 不考虑带括号参数

Dice 'dice'
  = quantity:Integer? 'd' face:Integer? keep:('k' keep:Integer { return keep })? {
    if (face === null)
      face = default_face
    else if ((face = face[1]) === 0) // 压根没做负数，减号会直接作为算符
      throw new Error('骰子面数不合法')
    if (quantity === null || (quantity = quantity[1]) === 1) {
      // 此时不对 k 进行处理
      const res = roll(face)
      return [res.toString(), res]
    } else {
      if (quantity === 0)
        throw new Error('骰子个数不合法')
      if (keep === null)
        keep = quantity
      else if ((keep = keep[1]) === 0)
        throw new Error('骰子保留数不合法')
      let res = []
      for (let i = 0; i < quantity; ++i)
        res.push(roll(face))
      res = res.sort((a, b) => b - a).slice(0, keep) // slice 在 keep 大于长度时行为正确
      return [
        '(' + res.join('+') + ')',
        res.reduce((a, b) => a + b)
      ]
    }
  }

Integer 'integer'
  = [0-9]+ {
// 不吃空格，对 dice 有影响
    return [
      text(),
      parseInt(text(), 10)
    ]
  }
