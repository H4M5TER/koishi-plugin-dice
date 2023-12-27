module.exports = {
  input: 'dice.peggy',
  output: 'parser.ts',
  plugins: [
    require('ts-pegjs')
  ],
  // testFile: 'myTestInput.foo',
  cache: true,
  // trace: true,
  tspegjs: {
    // customHeader: '',
    // returnTypes: {

    // }
  }
}