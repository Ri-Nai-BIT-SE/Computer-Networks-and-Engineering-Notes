<template>
  <div class="tcp-sliding-window">
    <div class="viewer-header">
      <h4>TCP 发送窗口模拟</h4>
      <p class="subtitle">观察三个指针 P1、P2、P3 的位置关系和窗口滑动过程</p>
    </div>
    
    <div class="byte-track">
      <!-- 渲染字节块 -->
      <div 
        v-for="(byte, index) in totalBytes" 
        :key="index" 
        :class="['byte', getByteStatus(index)]"
      >
        {{ index }}
      </div>

      <!-- 蓝色窗口框 -->
      <div class="window-frame" :style="windowStyle">
        <div class="window-label">发送窗口 ({{ windowSize }} 字节)</div>
      </div>

      <!-- 指针 -->
      <div class="pointer p1" :style="getP1Style">P1 (后沿)</div>
      <div class="pointer p2" :style="getP2Style">P2 (当前)</div>
      <div class="pointer p3" :style="getP3Style">P3 (前沿)</div>
    </div>

    <div class="controls">
      <button 
        class="btn-send" 
        @click="sendBytes(1)" 
        :disabled="usableWindow === 0"
      >
        📤 发送 1 字节
      </button>
      <button 
        class="btn-ack" 
        @click="receiveAck(1)" 
        :disabled="bytesInFlight === 0"
      >
        📩 收到 1 字节 ACK (窗口滑动)
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>

    <div class="info-panel">
      <div class="status-row">
        <strong>P1 (后沿):</strong> {{ p1 }} <small>(最早的未确认字节)</small>
      </div>
      <div class="status-row">
        <strong>P2 (当前):</strong> {{ p2 }} <small>(下一个将要发送的字节)</small>
      </div>
      <div class="status-row">
        <strong>P3 (前沿):</strong> {{ p3 }} <small>(允许发送的边界)</small>
      </div>
      <hr>
      <div class="status-row">
        <span style="color:#d63031">
          已发送未确认 (P2 - P1): <strong>{{ bytesInFlight }}</strong>
        </span>
        <span style="color:#00b894">
          可用窗口 (P3 - P2): <strong>{{ usableWindow }}</strong>
        </span>
      </div>
      <div class="status-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--vp-c-divider);">
        <small style="color: var(--vp-c-text-2);">
          <strong>说明：</strong>灰色=已确认 | 红色=已发送未确认 | 青色=可用窗口 | 白色=不允许发送
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const totalBytes = 20 // 总字节数
const windowSize = ref(5) // 窗口大小固定为 5
const p1 = ref(0) // 后沿
const p2 = ref(0) // 当前发送位置

// P3 前沿是计算出来的: P1 + WindowSize
const p3 = computed(() => p1.value + windowSize.value)

// 计算属性：各类状态
const bytesInFlight = computed(() => p2.value - p1.value)
const usableWindow = computed(() => p3.value - p2.value)

// 获取单个字节的状态样式
const getByteStatus = (index: number) => {
  if (index < p1.value) return 'acked' // 已确认
  if (index >= p1.value && index < p2.value) return 'sent' // 已发送未确认
  if (index >= p2.value && index < p3.value) return 'usable' // 可用
  return 'locked' // 不可发送
}

// 样式计算
const byteWidth = 45 // 40px + 5px gap
const windowStyle = computed(() => ({
  left: (p1.value * byteWidth) + 'px',
  width: (windowSize.value * byteWidth - 5) + 'px'
}))

const getP1Style = computed(() => ({ left: (p1.value * byteWidth) + 'px' }))
const getP2Style = computed(() => ({ left: (p2.value * byteWidth) + 'px' }))
const getP3Style = computed(() => ({ left: (p3.value * byteWidth) + 'px' }))

// 动作：发送数据
const sendBytes = (n: number) => {
  if (usableWindow.value >= n) {
    p2.value += n
  }
}

// 动作：收到ACK
const receiveAck = (n: number) => {
  // 确保不要滑出界
  if (p1.value + n <= p2.value) {
    p1.value += n
  }
}

// 重置
const reset = () => {
  p1.value = 0
  p2.value = 0
}
</script>

<style scoped>
.tcp-sliding-window {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  max-width: 900px;
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

/* 字节流轨道 */
.byte-track {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin: 40px 0;
  padding-bottom: 40px;
  border-bottom: 2px dashed var(--vp-c-divider);
  position: relative;
  min-height: 100px;
}

.byte {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  position: relative;
  transition: all 0.3s;
}

/* 状态颜色 */
.byte.acked {
  background-color: #b2bec3;
  color: #636e72;
  border-color: #b2bec3;
}

.byte.sent {
  background-color: #fab1a0;
  color: #d63031;
  border-color: #e17055;
}

.byte.usable {
  background-color: #81ecec;
  color: #00b894;
  border-color: #00cec9;
  cursor: pointer;
}

.byte.usable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 184, 148, 0.4);
}

.byte.locked {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
}

/* 窗口框 */
.window-frame {
  position: absolute;
  height: 55px;
  top: -8px;
  border: 3px solid #0984e3;
  border-radius: 8px;
  pointer-events: none;
  transition: all 0.4s ease-in-out;
  box-shadow: 0 0 10px rgba(9, 132, 227, 0.4);
  background: rgba(9, 132, 227, 0.05);
}

.window-label {
  position: absolute;
  top: -30px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #0984e3;
  font-weight: bold;
  font-size: 14px;
}

/* 指针 P1, P2, P3 */
.pointer {
  position: absolute;
  bottom: -35px;
  width: 40px;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  transition: left 0.4s ease-in-out;
}

.pointer::before {
  content: '⬆';
  display: block;
  font-size: 16px;
}

.p1 {
  color: #636e72;
}

.p2 {
  color: #d63031;
}

.p3 {
  color: #0984e3;
}

/* 控制区 */
.controls {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: white;
  transition: 0.2s;
  font-weight: bold;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-send {
  background-color: #00b894;
}

.btn-send:hover:not(:disabled) {
  background-color: #00a884;
}

.btn-ack {
  background-color: #e17055;
}

.btn-ack:hover:not(:disabled) {
  background-color: #d35400;
}

.btn-reset {
  background-color: #6c5ce7;
}

.btn-reset:hover {
  background-color: #5f4fd8;
}

.info-panel {
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  border-left: 5px solid #6c5ce7;
}

.status-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.status-row small {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.status-row hr {
  margin: 10px 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}
</style>


