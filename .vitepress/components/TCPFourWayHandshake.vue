<template>
  <div class="tcp-four-way">
    <div class="viewer-header">
      <h4>👋 TCP 四次挥手 (Connection Release)</h4>
      <p class="subtitle">观察主动关闭方和被动关闭方的状态变化</p>
    </div>

    <div class="topology">
      <!-- Client -->
      <div class="host">
        <span class="icon">📱</span>
        <div class="host-name">客户端 (主动关闭)</div>
        <div :class="['state-box', clientStyle]">{{ clientState }}</div>
      </div>

      <!-- Animation Layer -->
      <div class="arrow-layer">
        <div :class="['msg-arrow step-1', step >= 1 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 1 ? 'show-text' : '']">
            <strong>FIN=1</strong>, seq=u
          </div>
        </div>
        <div :class="['msg-arrow step-2', step >= 2 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 2 ? 'show-text' : '']">
            <strong>ACK=1</strong>, ack=u+1, seq=v
          </div>
        </div>
        <div :class="['msg-arrow step-3', step >= 3 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 3 ? 'show-text' : '']">
            <strong>FIN=1, ACK=1</strong>, seq=w, ack=u+1
          </div>
        </div>
        <div :class="['msg-arrow step-4', step >= 4 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 4 ? 'show-text' : '']">
            <strong>ACK=1</strong>, seq=u+1, ack=w+1
          </div>
        </div>
      </div>

      <!-- Server -->
      <div class="host">
        <span class="icon">🖥️</span>
        <div class="host-name">服务器 (被动关闭)</div>
        <div :class="['state-box', serverStyle]">{{ serverState }}</div>
      </div>
    </div>

    <div class="explain">
      <strong>阶段说明：</strong> {{ explainText }}
    </div>

    <div class="controls">
      <button 
        class="btn-next" 
        @click="nextStep" 
        :disabled="step >= 5"
      >
        {{ step >= 5 ? '✅ 连接彻底关闭' : '下一步 ▶' }}
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const step = ref(0)

const clientState = computed(() => {
  if (step.value === 0) return 'ESTABLISHED'
  if (step.value === 1) return 'FIN-WAIT-1'
  if (step.value === 2) return 'FIN-WAIT-2'
  if (step.value === 3) return 'TIME-WAIT'
  if (step.value === 4) return 'TIME-WAIT'
  if (step.value === 5) return 'CLOSED'
  return ''
})

const serverState = computed(() => {
  if (step.value === 0) return 'ESTABLISHED'
  if (step.value === 1) return 'ESTABLISHED'
  if (step.value === 2) return 'CLOSE-WAIT'
  if (step.value === 3) return 'LAST-ACK'
  if (step.value >= 4) return 'CLOSED'
  return ''
})

const clientStyle = computed(() => {
  if (step.value === 5) return 'state-closed'
  if (step.value >= 3) return 'state-timewait'
  if (step.value >= 1) return 'state-wait'
  return ''
})

const serverStyle = computed(() => {
  if (step.value >= 4) return 'state-closed'
  if (step.value >= 2) return 'state-wait'
  return ''
})

const explainText = computed(() => {
  switch(step.value) {
    case 0:
      return "初始状态：双方都在 ESTABLISHED，正常传输数据。"
    case 1:
      return "第一次挥手：客户端数据发完了，发送 FIN=1，进入 FIN-WAIT-1。我要关了。"
    case 2:
      return "第二次挥手：服务器收到 FIN，发送 ACK=1。进入 CLOSE-WAIT（半关闭）。此时 A→B 断了，但 B→A 还能发数据。"
    case 3:
      return "第三次挥手：服务器数据也发完了，发送 FIN=1，进入 LAST-ACK。我也要关了。"
    case 4:
      return "第四次挥手：客户端收到 FIN，发送 ACK=1。注意！客户端进入 TIME-WAIT，必须等待 2MSL 时间。"
    case 5:
      return "最终：2MSL 时间到，客户端彻底进入 CLOSED。服务器早已在收到 ACK 后 CLOSED。"
    default:
      return ""
  }
})

const nextStep = () => {
  if (step.value < 5) step.value++
}

const reset = () => {
  step.value = 0
}
</script>

<style scoped>
.tcp-four-way {
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

.topology {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding: 0 50px;
  position: relative;
  min-height: 350px;
}

.host {
  width: 140px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.icon {
  font-size: 40px;
  display: block;
  margin-bottom: 10px;
}

.host-name {
  font-weight: bold;
  color: var(--vp-c-text-1);
  margin-bottom: 10px;
  font-size: 14px;
}

.state-box {
  background: #27ae60;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 13px;
  margin-top: 10px;
  transition: all 0.5s;
}

.state-closed {
  background: #34495e;
}

.state-wait {
  background: #e67e22;
}

.state-timewait {
  background: #e74c3c;
  animation: pulse 2s infinite;
}

.arrow-layer {
  position: absolute;
  top: 60px;
  left: 160px;
  right: 160px;
  height: 300px;
  pointer-events: none;
}

.msg-arrow {
  position: absolute;
  height: 2px;
  background: #95a5a6;
  width: 0;
  transition: width 1s ease-in-out;
  display: flex;
  align-items: center;
}

.msg-arrow::after {
  content: '➤';
  position: absolute;
  right: -5px;
  top: -7px;
  font-size: 16px;
  opacity: 0;
  transition: opacity 0.5s 1s;
}

.msg-label {
  position: absolute;
  top: -35px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  opacity: 0;
  transition: opacity 0.5s;
}

.step-1 {
  top: 20px;
  left: 0;
  background: #e74c3c;
}

.step-1::after {
  color: #e74c3c;
}

.step-2 {
  top: 80px;
  right: 0;
  background: #2ecc71;
  flex-direction: row-reverse;
}

.step-2::after {
  content: '◀';
  left: -8px;
  right: auto;
  color: #2ecc71;
}

.step-3 {
  top: 160px;
  right: 0;
  background: #e74c3c;
  flex-direction: row-reverse;
}

.step-3::after {
  content: '◀';
  left: -8px;
  right: auto;
  color: #e74c3c;
}

.step-4 {
  top: 220px;
  left: 0;
  background: #2ecc71;
}

.step-4::after {
  color: #2ecc71;
}

.animate-width {
  width: 100% !important;
}

.show-head::after {
  opacity: 1 !important;
}

.show-text {
  opacity: 1 !important;
}

.explain {
  margin-top: 20px;
  padding: 15px;
  background: var(--vp-c-bg);
  border-left: 4px solid #e74c3c;
  color: var(--vp-c-text-1);
  min-height: 50px;
  font-size: 14px;
  border-radius: 4px;
  line-height: 1.6;
}

.explain strong {
  color: var(--vp-c-text-1);
}

.controls {
  text-align: center;
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 10px 25px;
  font-size: 14px;
  background: #34495e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  background: #2c3e50;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-reset {
  background: #95a5a6;
}

.btn-reset:hover {
  background: #7f8c8d;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .topology {
    padding: 0 20px;
    min-height: 300px;
  }
  
  .arrow-layer {
    left: 120px;
    right: 120px;
  }
  
  .host {
    width: 120px;
  }
  
  .icon {
    font-size: 30px;
  }
}
</style>


