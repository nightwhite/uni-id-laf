const { builtinModules } = require('module')
const { terser } = require('rollup-plugin-terser')
const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const json = require('@rollup/plugin-json')

const plugins = [resolve(), commonjs({
  ignore: ['uni-config-center'],
  include: ['node_modules/**']
}), json()]
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    terser({
      output: {
        comments: false
      }
    })
  )
}

module.exports = function (moduleName) {
  return {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'commonjs'
    },
    plugins,
    external: [
      'uni-config-center',
      ...builtinModules
    ]
  }
}
