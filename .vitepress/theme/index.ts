// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import '@chinese-fonts/maple-mono-cn/dist/MapleMono-CN-SemiBold/result.css';
import IPDatagramViewer from '../components/IPDatagramViewer.vue'
import ICMPDiagram from '../components/ICMPDiagram.vue'
import RIPSimulation from '../components/RIPSimulation.vue'
import OSPFSimulation from '../components/OSPFSimulation.vue'
import BGPSimulation from '../components/BGPSimulation.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('IPDatagramViewer', IPDatagramViewer)
    app.component('ICMPDiagram', ICMPDiagram)
    app.component('RIPSimulation', RIPSimulation)
    app.component('OSPFSimulation', OSPFSimulation)
    app.component('BGPSimulation', BGPSimulation)
  }
} satisfies Theme
