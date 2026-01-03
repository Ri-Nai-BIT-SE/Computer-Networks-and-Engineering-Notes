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
import TCPHeaderViewer from '../components/TCPHeaderViewer.vue'
import TCPSlidingWindow from '../components/TCPSlidingWindow.vue'
import TCPRTOCalculator from '../components/TCPRTOCalculator.vue'
import TCPSACKDemo from '../components/TCPSACKDemo.vue'
import TCPFlowControl from '../components/TCPFlowControl.vue'
import TCPNagleAlgorithm from '../components/TCPNagleAlgorithm.vue'
import TCPCongestionControl from '../components/TCPCongestionControl.vue'
import TCPCongestionAlgorithm from '../components/TCPCongestionAlgorithm.vue'
import AQMDemo from '../components/AQMDemo.vue'
import TCPThreeWayHandshake from '../components/TCPThreeWayHandshake.vue'
import TCPFourWayHandshake from '../components/TCPFourWayHandshake.vue'
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
    app.component('TCPHeaderViewer', TCPHeaderViewer)
    app.component('TCPSlidingWindow', TCPSlidingWindow)
    app.component('TCPRTOCalculator', TCPRTOCalculator)
    app.component('TCPSACKDemo', TCPSACKDemo)
    app.component('TCPFlowControl', TCPFlowControl)
    app.component('TCPNagleAlgorithm', TCPNagleAlgorithm)
    app.component('TCPCongestionControl', TCPCongestionControl)
    app.component('TCPCongestionAlgorithm', TCPCongestionAlgorithm)
    app.component('AQMDemo', AQMDemo)
    app.component('TCPThreeWayHandshake', TCPThreeWayHandshake)
    app.component('TCPFourWayHandshake', TCPFourWayHandshake)
  }
} satisfies Theme
