const { src, dest, series, parallel } = require('gulp')
const rev = require('gulp-rev')
const revCollector = require('gulp-rev-collector')
const path = require('path')

const webpackStream = require('webpack-stream')
const gulpSass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css');

function copyhtml() {
  return src('./*.html')
    .pipe(dest('./dist'))
}

function copylibs() {
  return src('./src/libs/**/*')
    .pipe(dest('./dist/libs'))
}

function copyimages() {
  return src('./src/images/**/*')
    .pipe(dest('./dist/images'))
}

function copyicons() {
  return src('./src/icons/**/*')
    .pipe(dest('./dist/icons'))
}

function packjs() {
  return src('./src/**/*')
    .pipe(webpackStream({
      mode: 'production',

      entry: {
        app: './src/app.js'
      },

      output: {
        filename: '[name].js',
        path: path.resolve(__dirname, './dist')
      },

      // 将ES6-ES8 代码转换成 ES5
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime']
              }
            }
          },
          {
            test: /\.html$/,
            loader: 'string-loader'
          }
        ]
      }
    }))
    .pipe(rev())  //添加hash后缀
    .pipe(dest('./dist/scripts'))  //移动到./dist/scripts
    .pipe(rev.manifest())   //生成文件映射
    .pipe(dest('./rev/scripts'))  //将映射文件导出
}

function revColl() {
  return src(['./rev/**/*.json', './dist/*.html'])
    .pipe(revCollector())
    .pipe(dest('./dist'))
}

function packCSS() {
  return src('./src/styles/app.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))  //压缩css文件
    .pipe(rev())
    .pipe(dest('./dist/styles'))
    .pipe(rev.manifest())
    .pipe(dest('./rev/styles'))
}

exports.default = series(parallel(packCSS, packjs, copylibs, copyimages, copyicons), copyhtml, revColl)