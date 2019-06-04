const indexTpl = require('./views/index.html')
const { list} = require('./controllers/list')

const renderedIndexTpl = template.render(indexTpl,{})

$('#app').html(renderedIndexTpl)
