<template>
  <div class="ip-datagram-viewer">
    <div class="viewer-header">
      <h4>IP 数据报解析器</h4>
      <p class="subtitle">点击十六进制数据查看字段解析（示例：ping 8.8.8.8 的 ICMP 数据包）</p>
    </div>
    
    <div class="datagram-container">
      <!-- 十六进制显示 -->
      <div class="hex-display">
        <div class="bit-markers">
          <div class="bit-marker" v-for="i in 32" :key="i">{{ i }}</div>
        </div>
        <div class="hex-rows">
          <div v-for="(row, rowIndex) in hexRows" :key="rowIndex" class="hex-row">
            <div class="row-label">{{ rowIndex * 4 }}</div>
            <div class="row-content">
              <div
                v-for="(byte, byteIndex) in row"
                :key="byteIndex"
                class="hex-byte"
                :class="{ highlighted: isByteHighlighted(rowIndex, byteIndex) }"
                @click="handleByteClick(rowIndex, byteIndex)"
              >
                {{ byte }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 字段网格 -->
      <div class="field-grid">
        <div class="row-header">
          <div class="row-label">字段</div>
          <div class="row-content">
            <div
              v-for="field in allFields"
              :key="field.name"
              class="field-cell"
              :class="getFieldClass(field)"
              :style="getFieldStyle(field)"
              @click="highlightField(field)"
            >
              <div class="field-name">{{ field.name }}</div>
              <div class="field-bits">{{ field.bits }}位</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 字段详情面板 -->
      <div class="field-panel" v-if="selectedField">
        <h5>{{ selectedField.name }}</h5>
        <div class="field-details" v-html="renderMarkdown(selectedField.details)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// IP数据报示例（ping 8.8.8.8）
const hexData = '45 00 00 3C 1C 46 00 00 40 01 B6 A2 C0 A8 01 02 08 08 08 08'

interface IPField {
  name: string
  bits: number
  startBit: number
  endBit: number
  details: string
}

const selectedField = ref<IPField | null>(null)
const highlightedField = ref<IPField | null>(null)

const hexRows = computed(() => {
  const bytes = hexData.split(' ').filter(b => b)
  const rows: string[][] = []
  for (let i = 0; i < bytes.length; i += 4) {
    rows.push(bytes.slice(i, i + 4))
  }
  return rows
})

const allFields: IPField[] = [
  {
    name: 'Version',
    bits: 4,
    startBit: 0,
    endBit: 3,
    details: '**Version (版本)** - 4位\n\n**含义**：指明IP协议的版本。\n\n**作用**：区分IPv4和IPv6。\n\n**规则**：\n- IPv4的版本号为4（二进制：0100）\n- 当前值：4（IPv4）'
  },
  {
    name: 'IHL',
    bits: 4,
    startBit: 4,
    endBit: 7,
    details: '**IHL (Internet Header Length, 首部长度)** - 4位\n\n**含义**：IP首部的长度，以32位字（4字节）为单位。\n\n**作用**：指示IP首部的实际长度，因为IP首部可能包含可选字段。\n\n**规则**：\n- 最小值为5（20字节，无可选字段）\n- 最大值为15（60字节）\n- 当前值：5（20字节）'
  },
  {
    name: 'TOS',
    bits: 8,
    startBit: 8,
    endBit: 15,
    details: '**TOS (Type of Service, 服务类型)** - 8位\n\n**含义**：用于指定数据报的服务质量要求。\n\n**作用**：允许路由器根据服务类型选择不同的转发策略。\n\n**规则**：\n- 通常为0（一般服务）\n- 当前值：00（一般服务）'
  },
  {
    name: 'Total Length',
    bits: 16,
    startBit: 16,
    endBit: 31,
    details: '**Total Length (总长度)** - 16位\n\n**含义**：整个IP数据报的长度（首部+数据）。\n\n**作用**：接收方据此确定数据报的边界。\n\n**规则**：**\n- 单位：字节\n- 最小值：20（仅首部）\n- 最大值：65535\n- 当前值：60（0x003C = 60字节）'
  },
  {
    name: 'Identification',
    bits: 16,
    startBit: 32,
    endBit: 47,
    details: '**Identification (标识)** - 16位\n\n**含义**：数据报的唯一标识符。\n\n**作用**：用于分片重组，同一数据报的所有分片具有相同的标识。\n\n**规则**：\n- 每发送一个数据报，标识符加1\n- 当前值：7238（0x1C46）'
  },
  {
    name: 'Flags',
    bits: 3,
    startBit: 48,
    endBit: 50,
    details: '**Flags (标志)** - 3位\n\n**含义**：控制数据报的分片行为。\n\n**作用**：\n- DF (Don\'t Fragment)：禁止分片\n- MF (More Fragments)：还有更多分片\n\n**规则**：\n- 第1位：保留，必须为0\n- 第2位：DF=0（允许分片）\n- 第3位：MF=0（最后一个分片或未分片）\n- 当前值：000（允许分片，无更多分片）'
  },
  {
    name: 'Fragment Offset',
    bits: 13,
    startBit: 51,
    endBit: 63,
    details: '**Fragment Offset (片偏移)** - 13位\n\n**含义**：分片在原数据报中的相对位置。\n\n**作用**：用于分片重组时确定分片的顺序。\n\n**规则**：\n- 单位：8字节\n- 第一个分片的偏移为0\n- 当前值：0（未分片）'
  },
  {
    name: 'TTL',
    bits: 8,
    startBit: 64,
    endBit: 71,
    details: '**TTL (Time To Live, 生存时间)** - 8位\n\n**含义**：数据报在网络中的最大跳数。\n\n**作用**：防止数据报在网络中无限循环。\n\n**规则**：\n- 每经过一个路由器，TTL减1\n- TTL=0时，路由器丢弃数据报并发送ICMP超时消息\n- 当前值：64（0x40）'
  },
  {
    name: 'Protocol',
    bits: 8,
    startBit: 72,
    endBit: 79,
    details: '**Protocol (协议)** - 8位\n\n**含义**：指明数据部分使用的协议。\n\n**作用**：接收方据此将数据部分交给相应的协议处理。\n\n**规则**：\n- 1 = ICMP\n- 6 = TCP\n- 17 = UDP\n- 当前值：1（ICMP）'
  },
  {
    name: 'Header Checksum',
    bits: 16,
    startBit: 80,
    endBit: 95,
    details: '**Header Checksum (首部检验和)** - 16位\n\n**含义**：用于检验IP首部在传输过程中是否出错。\n\n**作用**：检测首部传输错误。\n\n**规则**：\n- 只检验首部，不检验数据部分\n- 每经过一个路由器都要重新计算\n- 当前值：0xB6A2'
  },
  {
    name: 'Source Address',
    bits: 32,
    startBit: 96,
    endBit: 127,
    details: '**Source Address (源地址)** - 32位\n\n**含义**：发送方的IP地址。\n\n**作用**：标识数据报的发送者。\n\n**规则**：\n- IPv4地址，点分十进制表示\n- 当前值：192.168.1.2（0xC0A80102）'
  },
  {
    name: 'Destination Address',
    bits: 32,
    startBit: 128,
    endBit: 159,
    details: '**Destination Address (目的地址)** - 32位\n\n**含义**：接收方的IP地址。\n\n**作用**：标识数据报的接收者。\n\n**规则**：\n- IPv4地址，点分十进制表示\n- 当前值：8.8.8.8（0x08080808）'
  }
]

function isByteHighlighted(rowIndex: number, byteIndex: number): boolean {
  if (!highlightedField.value) return false
  const bitIndex = rowIndex * 32 + byteIndex * 8
  return bitIndex >= highlightedField.value.startBit && bitIndex < highlightedField.value.endBit
}

function getFieldClass(field: IPField): string {
  const classes: string[] = []
  if (highlightedField.value?.name === field.name) {
    classes.push('highlighted')
  }
  if (field.bits <= 4) {
    classes.push('field-small')
  }
  return classes.join(' ')
}

function getFieldStyle(field: IPField) {
  const startPercent = (field.startBit / 160) * 100
  const widthPercent = (field.bits / 160) * 100
  return {
    left: `${startPercent}%`,
    width: `${widthPercent}%`
  }
}

function highlightField(field: IPField) {
  highlightedField.value = field
  selectedField.value = field
}

function handleByteClick(rowIndex: number, byteIndex: number) {
  const bitIndex = rowIndex * 32 + byteIndex * 8
  const field = allFields.find(f => bitIndex >= f.startBit && bitIndex < f.endBit)
  if (field) {
    highlightField(field)
  }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

onMounted(() => {
  // 默认选中第一个字段
  if (allFields.length > 0) {
    selectedField.value = allFields[0]
  }
})
</script>

<style scoped>
.ip-datagram-viewer {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.viewer-header {
  margin-bottom: 1.5rem;
}

.viewer-header h4 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.2rem;
}

.subtitle {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.datagram-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hex-display {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
}

.bit-markers {
  display: flex;
  gap: 0;
  margin-bottom: 0.5rem;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.bit-marker {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.hex-rows {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hex-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.row-label {
  width: 40px;
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  text-align: right;
}

.row-content {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  position: relative;
}

.hex-byte {
  flex: 1;
  padding: 0.5rem;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  text-align: center;
  font-family: monospace;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 0;
}

.hex-byte:hover {
  background: var(--vp-c-brand-lighter);
  border-color: var(--vp-c-brand-1);
}

.hex-byte.highlighted {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-dark);
}

.field-grid {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  position: relative;
  min-height: 100px;
}

.row-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-cell {
  position: absolute;
  top: 0;
  height: 100%;
  background: var(--vp-c-brand-lighter);
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.field-cell:hover {
  background: var(--vp-c-brand-1);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.field-cell.highlighted {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-dark);
  box-shadow: 0 0 12px rgba(240, 98, 146, 0.4);
  z-index: 20;
}

.field-cell.highlighted .field-name,
.field-cell.highlighted .field-bits {
  color: white;
}

.field-name {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.field-bits {
  font-size: 0.65rem;
  color: var(--vp-c-text-2);
}

.field-cell.field-small {
  font-size: 0.7rem;
}

.field-panel {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
}

.field-panel h5 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1);
  font-size: 1.1rem;
}

.field-details {
  color: var(--vp-c-text-1);
  line-height: 1.8;
  font-size: 0.9rem;
}

.field-details :deep(strong) {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

@media (max-width: 768px) {
  .datagram-container {
    flex-direction: column;
  }
  
  .field-cell {
    font-size: 0.65rem;
  }
}
</style>
