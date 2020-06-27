import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
// import { terser } from 'rollup-plugin-terser';

export default {
  output: {
    sourcemap: true,
    format: 'es'
  },
  plugins: [
    resolve({ browser: true }),
    babel(config()),
    /*
    terser({
      keep_classnames: true,
      output: {
        comments: false
      }
    })
    */
  ]
}

function config() {
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'entry',
          corejs: 3
        }
      ]
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-object-rest-spread'],
      ['@babel/plugin-proposal-optional-chaining'],
      ['@babel/plugin-proposal-nullish-coalescing-operator'],
      ['@babel/plugin-proposal-do-expressions'],
      ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }]
    ]
  };
}

/*
async function license() {
  const { file } = minimist(process.argv.slice(2));
  console.log(file);
  const path = file.split('/')[0] + '/LICENSE';
  console.log(path);
  console.log(fs.readFileSync(path, { encoding: 'UTF-8' }))
  return fs.readFileSync(path, { encoding: 'UTF-8' });
}
*/