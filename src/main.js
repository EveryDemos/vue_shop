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

Vue.prototype.$http=axios

/*引入下面三行*/
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Message from 'element-ui'
Vue.prototype.$message=Message

Vue.use(ElementUI);

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
