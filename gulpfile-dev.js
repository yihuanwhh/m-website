const { src, dest, series, parallel, watch } = require('gulp')
const path = require('path')

const gulpWebserver = require('gulp-webserver')
const webpackStream = require('webpack-stream')
const gulpSass = require('gulp-sass')
const proxy = require('http-proxy-middleware')
const del = require('del')

//任务的回调一定要有返回值，返回值全部都是异步操作
//如果不返回值，需要调用一个callback
// gulp.task('copyhtml',()=>{
//     return gulp.src('./index.html')
//         .pipe(gulp.dest('./dev/'))
// }) 
/*gulp.task('copyhtml',(cb)=>{
    gulp.src('./index.html')
        .pipe(gulp.dest('./dev/'))
    cb()
})*/

//启动一个server
// gulp.task("webserver",()=>{
//     return gulp.src('./dev/')
//         .pipe(webserver({
//             port : 8000,
//             livereload : true
//         })
//         )
// })

// gulp.task('default',gulp.series('copyhtml','webserver'))

//复制并将html文件放到dev文件夹里
function copyhtml() {
    return src('./*.html').pipe(dest('./dev/'))
}


function copylibs() {
    return src('./src/libs/**/*').pipe(dest('./dev/libs'))
}

function copyimages() {
    return src('./sec/images/**/*').pipe(dest('./dev/images'))
}

function copyicons() {
    return src('./src/icons/**/*').pipe(dest('./dev/icons'))
}


//启动一个gulpserver
function webserver() {
    return src('./dev/').pipe(gulpWebserver({
        host: 'localhost',
        port: 8080,
        livereload: true,
        middleware: [
            proxy('/api', {
                target: 'http://zshpldbz.com/',
                changeOrigin: true,   // 访问不同的域名，需要配置成true
                pathRewrite: {
                    '^/api': ''
                }
            }),
            proxy('/json', {
                target: 'http://localhost:9000',
                pathRewrite: {
                    '^json': ''
                }
            })
        ]
    }))
}

//编译js文件
function packjs() {
    return src('./src/**/*').pipe(webpackStream({
        //开发模式下配置，不用压缩js
        mode: 'development',
        //入口文件即哪些文件需要进行打包
        entry: {
            app: './src/app.js'
        },
        //输出文件，即打包为哪个文件
        output: {
            filename: '[name].js',  //[name]  ==  app
            path: path.resolve(__dirname, './dev')  //路径解析，一定是绝对路径
        },
        //将ES6-ES8的代码转化成ES5
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
        .pipe(dest('./dev/scripts'))
}

function packCSS() {
    return src('./src/styles/app.scss')
        .pipe(gulpSass().on('error', gulpSass.logError))
        .pipe(dest('./dev/styles'))
}

function clear(target) {
    return function () {
        return del(target)
    }
}

function watcher() {
    watch('./src/libs/**/*', series(clear('./dev/libs'), copylibs))
    watch('./src/images/**/*', series(clear('./dev/images'), copyimages))
    watch('./src/icons/**/*', series(clear('./dev/icons'), copyicons))
    watch('./*.html', series(clear('./dev/*.html'), copyhtml))
    watch('./src/styles/**/*', series(packCSS))
    watch(['./src/**/*', '!src/libs/**/*', '!src/icons/**/*', '!src/images/**/*', '!src/styles/**/*'], series(packjs))
  }

exports.default = series(parallel(packCSS,packjs,copylibs,copyimages,copyicons),copyhtml,webserver,watcher)