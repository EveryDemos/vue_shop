// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
//导入全局样式表
import './assets/css/global.css'
//导入axios
import axios from 'axios'
//配置请求的根路径
axios.defaults.baseURL='https://www.liulongbin.top:8888/api/private/v1/'
//axios请求拦截 预处理添加Authorization
axios.interceptors.request.use(config =>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  //console.log(config)
  //在最后必须return config
  return config
})
Vue.prototype.$http=axios

/*引入下面三行*/
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI);


//导入vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor, /* { default global options } */)

import ZkTable from 'vue-table-with-tree-grid'

Vue.use(ZkTable)

Vue.config.productionTip = false

//时间过滤器
Vue.filter('dateFormat',function(originVal){
  const dt=new Date(originVal)
  const y=dt.getFullYear()
  const m= (dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')
  return `${y}-${m}-${d}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
