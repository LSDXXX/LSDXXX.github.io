import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue';  // 引入 Ant Design Vue
import 'ant-design-vue/dist/reset.css';

//引入echarts
import * as echarts from 'echarts';


let app = createApp(App)
app.config.globalProperties.$echarts = echarts;
app.use(store).
    use(router).
    use(Antd).
    mount('#app')
