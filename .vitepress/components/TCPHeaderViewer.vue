<template>
  <div class="tcp-header-viewer">
    <div class="viewer-header">
      <h4>TCP 报文段首部格式 (20 字节固定)</h4>
      <p class="subtitle">鼠标悬停在各个字段上查看详细说明</p>
    </div>
    
    <div class="header-container">
      <div class="bit-ruler">
        <span>0 bit</span>
        <span>16 bit</span>
        <span>31 bit</span>
      </div>

      <!-- Row 1: 源端口和目的端口 -->
      <div class="header-row">
        <div 
          class="header-field w-16 bg-port"
          @mouseenter="selectField(fields.sourcePort)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">源端口</div>
          <div class="field-size">16位</div>
        </div>
        <div 
          class="header-field w-16 bg-port"
          @mouseenter="selectField(fields.destPort)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">目的端口</div>
          <div class="field-size">16位</div>
        </div>
      </div>

      <!-- Row 2: 序号 -->
      <div class="header-row">
        <div 
          class="header-field w-32 bg-seq"
          @mouseenter="selectField(fields.seqNum)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">序号 (Seq)</div>
          <div class="field-size">32位</div>
        </div>
      </div>

      <!-- Row 3: 确认号 -->
      <div class="header-row">
        <div 
          class="header-field w-32 bg-ack"
          @mouseenter="selectField(fields.ackNum)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">确认号 (Ack)</div>
          <div class="field-size">32位</div>
        </div>
      </div>

      <!-- Row 4: 数据偏移、保留、标志位、窗口 -->
      <div class="header-row">
        <div 
          class="header-field w-4 bg-ctrl"
          @mouseenter="selectField(fields.dataOffset)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">数据<br>偏移</div>
          <div class="field-size">4位</div>
        </div>
        <div 
          class="header-field w-6 bg-ctrl"
          @mouseenter="selectField(fields.reserved)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">保留</div>
          <div class="field-size">6位</div>
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.urg)"
          @mouseleave="clearSelection"
        >
          U
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.ack)"
          @mouseleave="clearSelection"
        >
          A
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.psh)"
          @mouseleave="clearSelection"
        >
          P
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.rst)"
          @mouseleave="clearSelection"
        >
          R
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.syn)"
          @mouseleave="clearSelection"
        >
          S
        </div>
        <div 
          class="header-field w-1 bg-flag"
          @mouseenter="selectField(fields.fin)"
          @mouseleave="clearSelection"
        >
          F
        </div>
        <div 
          class="header-field w-16 bg-win"
          @mouseenter="selectField(fields.window)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">窗口</div>
          <div class="field-size">16位</div>
        </div>
      </div>

      <!-- Row 5: 检验和、紧急指针 -->
      <div class="header-row">
        <div 
          class="header-field w-16 bg-chk"
          @mouseenter="selectField(fields.checksum)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">检验和</div>
          <div class="field-size">16位</div>
        </div>
        <div 
          class="header-field w-16 bg-ctrl"
          @mouseenter="selectField(fields.urgentPtr)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">紧急指针</div>
          <div class="field-size">16位</div>
        </div>
      </div>

      <!-- Row 6: 选项 -->
      <div class="header-row bg-opt">
        <div 
          class="header-field w-32"
          style="border: none;"
          @mouseenter="selectField(fields.options)"
          @mouseleave="clearSelection"
        >
          <div class="field-name">选项 (如 MSS) + 填充</div>
          <div class="field-size">0-40字节</div>
        </div>
      </div>
    </div>

    <!-- 字段详情面板 -->
    <div class="field-panel" v-if="selectedField">
      <h5>{{ selectedField.name }}</h5>
      <div class="field-details" v-html="renderMarkdown(selectedField.details)"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TCPField {
  name: string
  bits: string
  details: string
}

const selectedField = ref<TCPField | null>(null)

const fields = {
  sourcePort: {
    name: '源端口 (Source Port)',
    bits: '16位',
    details: '**源端口 (Source Port)** - 16位\n\n**含义**：标识发送方进程。用于区分同一主机上的不同应用进程。\n\n**作用**：在发送方主机上，多个应用进程可能同时使用TCP，源端口帮助接收方知道数据来自哪个进程。\n\n**取值范围**：0-65535\n\n**常见值**：客户端通常使用随机分配的高端口号（1024-65535）'
  },
  destPort: {
    name: '目的端口 (Destination Port)',
    bits: '16位',
    details: '**目的端口 (Destination Port)** - 16位\n\n**含义**：标识接收方进程。\n\n**作用**：接收方根据目的端口将数据交付给相应的应用进程。\n\n**常见端口**：\n- HTTP: 80\n- HTTPS: 443\n- FTP: 21\n- SSH: 22\n- SMTP: 25\n- DNS: 53\n\n**取值范围**：0-65535'
  },
  seqNum: {
    name: '序号 (Sequence Number)',
    bits: '32位',
    details: '**序号 (Sequence Number)** - 32位 ★核心考点\n\n**含义**：指出本报文段数据部分的第一个字节的序号。\n\n**原理**：TCP是面向字节流的，每一个字节都有一个序号。\n\n**作用**：\n1. 解决乱序问题\n2. 用于重传机制\n3. 用于流量控制\n\n**计算示例**：\n- 如果seq=301，本报文段数据长度=100字节\n- 那么下一个报文段的seq=301+100=401\n\n**考点**：序号的计算是考试常考内容'
  },
  ackNum: {
    name: '确认号 (Acknowledgment Number)',
    bits: '32位',
    details: '**确认号 (Acknowledgment Number)** - 32位 ★核心考点\n\n**含义**：期望收到对方下一个报文段的第一个字节的序号。\n\n**口诀**：若确认号为N，则表明到序号N-1为止的所有数据都已正确收到。\n\n**作用**：\n1. 实现累积确认机制\n2. 告诉发送方哪些数据已收到\n\n**示例**：\n- 如果收到seq=301, len=100的报文\n- 则发送ack=401（期望收到401）\n\n**考点**：确认号的计算和累积确认机制'
  },
  dataOffset: {
    name: '数据偏移 (Data Offset)',
    bits: '4位',
    details: '**数据偏移 (Data Offset)** - 4位\n\n**含义**：即首部长度。单位是4字节。\n\n**作用**：用于定位数据部分的起始位置。\n\n**计算**：\n- 最小值5(0101)表示20字节（无选项）\n- 最大值15(1111)表示60字节（最长）\n- 如果值为8，则首部长度=8×4=32字节\n\n**考点**：数据偏移字段的二进制转十进制，再乘以4得到首部长度'
  },
  reserved: {
    name: '保留 (Reserved)',
    bits: '6位',
    details: '**保留 (Reserved)** - 6位\n\n**含义**：目前置0，保留给将来使用。\n\n**作用**：为TCP协议的扩展预留空间。\n\n**当前值**：全0'
  },
  urg: {
    name: 'URG (Urgent)',
    bits: '1位',
    details: '**URG (Urgent)** - 紧急位\n\n**含义**：URG=1时，紧急指针有效。\n\n**作用**：告诉系统这段数据很急，需要插队处理。\n\n**应用场景**：\n- Ctrl+C中断命令\n- 紧急控制信息\n\n**注意**：只有URG=1时，紧急指针字段才有意义'
  },
  ack: {
    name: 'ACK (Acknowledgment)',
    bits: '1位',
    details: '**ACK (Acknowledgment)** - 确认位 ★重点\n\n**含义**：ACK=1时，确认号字段有效。\n\n**规则**：建立连接后，所有报文的ACK必须置1。\n\n**作用**：\n- ACK=0时，确认号字段无效\n- ACK=1时，确认号字段才有效\n\n**考点**：三次握手和四次挥手时ACK标志位的状态'
  },
  psh: {
    name: 'PSH (Push)',
    bits: '1位',
    details: '**PSH (Push)** - 推送位\n\n**含义**：PSH=1时，要求接收方尽快将数据交付给应用进程。\n\n**作用**：接收方收到PSH=1的报文后，不要等缓存填满，立即交给应用进程。\n\n**应用场景**：需要实时交互的应用'
  },
  rst: {
    name: 'RST (Reset)',
    bits: '1位',
    details: '**RST (Reset)** - 复位位\n\n**含义**：RST=1时，表示连接出现严重差错。\n\n**作用**：强制断开连接，不走正常的四次挥手流程。\n\n**应用场景**：\n- 主机断电重启\n- 非法访问\n- 连接异常\n\n**注意**：RST=1时，连接立即断开'
  },
  syn: {
    name: 'SYN (Synchronize)',
    bits: '1位',
    details: '**SYN (Synchronize)** - 同步位 ★重点\n\n**含义**：SYN=1表示这是一个连接请求或连接接受报文。\n\n**作用**：用于三次握手建立连接。\n\n**三次握手中的状态**：\n- 第一次：SYN=1, ACK=0（连接请求）\n- 第二次：SYN=1, ACK=1（连接接受）\n- 第三次：SYN=0, ACK=1（确认）\n\n**考点**：三次握手时SYN标志位的变化'
  },
  fin: {
    name: 'FIN (Finish)',
    bits: '1位',
    details: '**FIN (Finish)** - 终止位 ★重点\n\n**含义**：FIN=1表示数据发完了，要求释放连接。\n\n**作用**：用于四次挥手释放连接。\n\n**四次挥手中的状态**：\n- 第一次：FIN=1, ACK=1（请求释放）\n- 第二次：ACK=1（确认）\n- 第三次：FIN=1, ACK=1（请求释放）\n- 第四次：ACK=1（确认）\n\n**考点**：四次挥手时FIN标志位的变化'
  },
  window: {
    name: '窗口 (Window)',
    bits: '16位',
    details: '**窗口 (Window)** - 16位 ★流量控制核心\n\n**含义**：告诉对方"我的接收缓存还能装多少字节"。\n\n**作用**：\n1. 流量控制的依据\n2. 发送方的发送窗口不能超过接收方给出的这个值\n3. 动态调整，实现流量控制\n\n**取值范围**：0-65535字节\n\n**考点**：窗口字段在流量控制中的作用'
  },
  checksum: {
    name: '检验和 (Checksum)',
    bits: '16位',
    details: '**检验和 (Checksum)** - 16位\n\n**含义**：检验首部+数据+伪首部。\n\n**计算方法**：与UDP计算方法一样，使用二进制反码求和。\n\n**检验范围**：\n1. 伪首部（12字节）\n2. TCP首部\n3. TCP数据部分\n\n**作用**：检测传输过程中的错误，有错则丢弃。'
  },
  urgentPtr: {
    name: '紧急指针 (Urgent Pointer)',
    bits: '16位',
    details: '**紧急指针 (Urgent Pointer)** - 16位\n\n**含义**：只有URG=1时有用。指出紧急数据的末尾在报文段中的位置。\n\n**作用**：配合URG标志位，标识紧急数据的范围。\n\n**注意**：只有URG=1时，此字段才有意义'
  },
  options: {
    name: '选项 (Options)',
    bits: '0-40字节',
    details: '**选项 (Options)** - 长度可变，0-40字节\n\n**常见选项**：\n- **MSS (Maximum Segment Size)**：最大报文段长度\n\n**MSS的坑**：\n- MSS指的是**数据字段**的最大长度，**不包含TCP首部**\n- TCP报文段长度 = TCP首部 + TCP数据(MSS)\n\n**计算**：\n- MSS = MTU - IP首部(20) - TCP首部(20)\n- 通常MTU=1500，所以MSS=1460字节\n\n**考点**：MSS的计算，注意不包含首部'
  }
}

function selectField(field: TCPField) {
  selectedField.value = field
}

function clearSelection() {
  // 不移除选择，保持最后悬停的字段显示
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  // 默认显示第一个字段
  selectedField.value = fields.sourcePort
})
</script>

<style scoped>
.tcp-header-viewer {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  max-width: 800px;
}

.viewer-header {
  margin-bottom: 1.5rem;
}

.viewer-header h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
  text-align: center;
}

.subtitle {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  text-align: center;
}

.header-container {
  font-family: 'Courier New', monospace;
}

.bit-ruler {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--vp-c-text-2);
  margin-bottom: 5px;
  padding: 0 5px;
}

.header-row {
  display: flex;
  height: 50px;
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
}

.header-row:last-child {
  border-bottom: 1px solid var(--vp-c-divider);
}

.header-field {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--vp-c-divider);
  font-size: 12px;
  font-weight: bold;
  color: white;
  text-align: center;
  position: relative;
  flex-direction: column;
  padding: 2px;
  cursor: help;
  transition: all 0.2s;
}

.header-field:hover {
  transform: scale(1.05);
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  filter: brightness(1.2);
}

.header-field:last-child {
  border-right: none;
}

.field-name {
  font-size: 12px;
}

.field-size {
  font-size: 9px;
  color: rgba(255,255,255,0.8);
  margin-top: 2px;
}

/* Widths */
.w-16 {
  width: 50%;
}

.w-32 {
  width: 100%;
}

.w-4 {
  width: 12.5%;
}

.w-6 {
  width: 18.75%;
}

.w-1 {
  width: 3.125%;
  font-size: 10px;
}

/* Colors */
.bg-port {
  background: #74b9ff;
}

.bg-seq {
  background: #a29bfe;
}

.bg-ack {
  background: #fab1a0;
}

.bg-ctrl {
  background: #636e72;
}

.bg-flag {
  background: #e74c3c;
}

.bg-win {
  background: #81ecec;
  color: #2d3436;
}

.bg-chk {
  background: #55efc4;
  color: #2d3436;
}

.bg-opt {
  background: #b2bec3;
  border-style: dashed;
  color: #2d3436;
}

.field-panel {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-left: 5px solid #0984e3;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.field-panel h5 {
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
  font-weight: bold;
}

.field-details {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.6;
}

.field-details :deep(strong) {
  color: var(--vp-c-text-1);
  font-weight: bold;
}
</style>


