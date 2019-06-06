// import Router from './router/'

// new Router({
//     mode:'hash'  //hash  ||  history
// })



const indexTpl = require('./views/index.html')
const { list } = require('./controllers/list')

const renderedIndexTpl = template.render(indexTpl, {})

$('#app').html(renderedIndexTpl)

let swiper = new Swiper('.swiper-container', {
    navigation: {
        nextEl: '.swiper-button-next'
    },
    setWrapperSize: true,
})
