<template>
  <div class="tcp-sack-demo">
    <div class="viewer-header">
      <h4>📦 SACK (选择确认) 构造器</h4>
      <p class="subtitle">
        点击方块切换状态：
        <span style="color:#00b894">绿色=已收到</span>，
        <span style="color:#b2bec3">灰色=丢失/未到</span>
      </p>
    </div>

    <div class="packet-grid">
      <div 
        v-for="pkt in packets" 
        :key="pkt.id" 
        :class="[
          'packet', 
          pkt.received ? 'pkt-received' : 'pkt-lost', 
          isInSackBlock(pkt.id) ? 'pkt-in-sack' : ''
        ]"
        @click="toggle(pkt)"
        :title="`包 ${pkt.id}: ${pkt.received ? '已收到' : '丢失/未到'}`"
      >
        {{ pkt.id }}
      </div>
    </div>

    <div class="result-box">
      <span class="label">TCP 首部反馈给发送方的信息：</span>
      <div>
        [固定首部] 确认号 (ACK) = 
        <span class="ack-value">{{ cumulativeAck }}</span>
      </div>
      <div style="margin-top:15px;">
        [首部选项] SACK 选项列表:
      </div>
      <div v-if="sackBlocks.length === 0" class="no-sack">
        (无 SACK 块，数据连续)
      </div>
      <div v-else class="sack-blocks">
        <div 
          v-for="(block, index) in sackBlocks" 
          :key="index"
          class="sack-block-item"
        >
          Block {{ index + 1 }}: 
          左边界=<span class="highlight">{{ block.left }}</span>, 
          右边界=<span class="highlight">{{ block.right }}</span>
          <span class="block-info">(收到序号 {{ block.left }} 到 {{ block.right - 1 }})</span>
        </div>
      </div>
      <div v-if="sackBlocks.length > 4" class="warning">
        ⚠️ 警告：SACK 块超过 4 个！(TCP选项装不下了)
      </div>
    </div>

    <div class="tips">
      <strong>考点提示：</strong>
      <ul>
        <li><strong>左边界</strong>：块的第一个字节序号。</li>
        <li><strong>右边界</strong>：块的最后一个字节序号 <strong>+ 1</strong>（注意！RFC规定指向下一个字节）。</li>
        <li>在本演示中，为了方便理解，用包序号代替字节序号。如果 Block 显示 4-6，表示收到了 4 和 5。</li>
        <li>蓝色边框表示该包属于某个 SACK 块。</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Packet {
  id: number
  received: boolean
}

interface SACKBlock {
  left: number
  right: number
}

// 初始化 12 个包，默认全收到
const packets = ref<Packet[]>(
  Array.from({ length: 12 }, (_, i) => ({ 
    id: i + 1, 
    received: true 
  }))
)

const toggle = (pkt: Packet) => {
  pkt.received = !pkt.received
}

// 计算累积确认号 (第一个未收到的包)
const cumulativeAck = computed(() => {
  for (let i = 0; i < packets.value.length; i++) {
    if (!packets.value[i].received) {
      return packets.value[i].id
    }
  }
  return packets.value.length + 1
})

// 计算 SACK 块
const sackBlocks = computed(() => {
  const blocks: SACKBlock[] = []
  let inBlock = false
  let start = 0

  // 从 ACK 位置开始往后找孤岛
  for (let i = cumulativeAck.value - 1; i < packets.value.length; i++) {
    const pkt = packets.value[i]
    if (pkt.received && !inBlock) {
      // 开始一个新的块
      inBlock = true
      start = pkt.id
    } else if (!pkt.received && inBlock) {
      // 结束当前块
      inBlock = false
      // Right edge is current id (because right edge is +1)
      blocks.push({ left: start, right: pkt.id })
    }
  }
  // 处理结尾还在块里的情况
  if (inBlock) {
    blocks.push({ left: start, right: packets.value.length + 1 })
  }
  return blocks
})

const isInSackBlock = (id: number): boolean => {
  // 如果 id 小于 ACK，它是连续部分，不是 SACK
  if (id < cumulativeAck.value) return false
  // 如果 id 对应的包没收到，当然不是
  const pkt = packets.value.find(p => p.id === id)
  if (!pkt || !pkt.received) return false
  // 检查是否在某个 SACK 块中
  return sackBlocks.value.some(block => id >= block.left && id < block.right)
}
</script>

<style scoped>
.tcp-sack-demo {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  max-width: 900px;
}

.viewer-header {
  margin-bottom: 1.5rem;
  text-align: center;
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

.packet-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 30px 0;
}

.packet {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  transition: all 0.2s;
  user-select: none;
  border: 2px solid transparent;
}

.packet:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* States */
.pkt-received {
  background-color: #00b894;
  color: white;
}

.pkt-lost {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 2px dashed var(--vp-c-divider);
}

/* SACK block highlight */
.pkt-in-sack {
  border-color: #0984e3;
  box-shadow: 0 0 8px rgba(9, 132, 227, 0.6);
  transform: scale(1.05);
}

.result-box {
  background: #2d3436;
  color: #55efc4;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  margin-top: 20px;
  font-size: 14px;
  line-height: 1.8;
}

.label {
  color: #aaa;
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
}

.ack-value {
  color: white;
  font-size: 1.2em;
  font-weight: bold;
}

.no-sack {
  color: #777;
  font-style: italic;
  margin-top: 10px;
}

.sack-blocks {
  margin-top: 10px;
}

.sack-block-item {
  margin: 8px 0;
  padding: 5px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.sack-block-item:last-child {
  border-bottom: none;
}

.highlight {
  color: #fab1a0;
  font-weight: bold;
}

.block-info {
  color: #aaa;
  font-size: 12px;
  margin-left: 10px;
}

.warning {
  color: #e74c3c;
  margin-top: 10px;
  font-weight: bold;
  padding: 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

.tips {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-top: 20px;
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #f39c12;
}

.tips strong {
  color: var(--vp-c-text-1);
  display: block;
  margin-bottom: 8px;
}

.tips ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.tips li {
  margin: 5px 0;
  line-height: 1.6;
}
</style>


