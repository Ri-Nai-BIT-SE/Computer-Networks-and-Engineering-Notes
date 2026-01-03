<template>
  <div class="tcp-handshake">
    <div class="viewer-header">
      <h4>🤝 TCP 三次握手 (Three-Way Handshake)</h4>
      <p class="subtitle">观察客户端和服务器在握手过程中的状态变化和报文内容</p>
    </div>

    <div class="topology">
      <!-- Client -->
      <div class="host">
        <span class="icon">💻</span>
        <div class="host-name">客户端 A</div>
        <div :class="['state-box', clientStateClass]">{{ clientState }}</div>
      </div>

      <!-- Animation Layer -->
      <div class="arrow-layer">
        <!-- Step 1 -->
        <div :class="['msg-arrow step-1', step >= 1 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 1 ? 'show-text' : '']">
            <strong>SYN=1</strong>, seq=x
          </div>
        </div>
        <!-- Step 2 -->
        <div :class="['msg-arrow step-2', step >= 2 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 2 ? 'show-text' : '']">
            <strong>SYN=1, ACK=1</strong><br>seq=y, ack=x+1
          </div>
        </div>
        <!-- Step 3 -->
        <div :class="['msg-arrow step-3', step >= 3 ? 'animate-width show-head' : '']">
          <div :class="['msg-label', step >= 3 ? 'show-text' : '']">
            <strong>ACK=1</strong><br>seq=x+1, ack=y+1
          </div>
        </div>
      </div>

      <!-- Server -->
      <div class="host">
        <span class="icon">🖥️</span>
        <div class="host-name">服务器 B</div>
        <div :class="['state-box', serverStateClass]">{{ serverState }}</div>
      </div>
    </div>

    <div class="explain">
      <strong>当前阶段详解：</strong> {{ explainText }}
    </div>

    <div class="controls">
      <button 
        class="btn-next" 
        @click="nextStep" 
        :disabled="step >= 3"
      >
        {{ step >= 3 ? '✅ 握手完成 (Established)' : '下一步 ▶' }}
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
  if (step.value === 0) return 'CLOSED'
  if (step.value === 1) return 'SYN-SENT'
  if (step.value === 2) return 'SYN-SENT'
  if (step.value === 3) return 'ESTABLISHED'
  return 'UNKNOWN'
})

const serverState = computed(() => {
  if (step.value === 0) return 'LISTEN'
  if (step.value === 1) return 'LISTEN'
  if (step.value === 2) return 'SYN-RCVD'
  if (step.value === 3) return 'ESTABLISHED'
  return 'UNKNOWN'
})

const explainText = computed(() => {
  switch(step.value) {
    case 0:
      return "初始状态：服务器处于 LISTEN (监听) 状态，等待客户端连接。"
    case 1:
      return "第一次握手：客户端发送 SYN=1 (连接请求)，消耗序号 x。客户端进入 SYN-SENT 状态。"
    case 2:
      return "第二次握手：服务器收到 SYN，回复 SYN=1, ACK=1。确认号 ack=x+1 (期望收到x+1)，消耗序号 y。服务器进入 SYN-RCVD 状态。"
    case 3:
      return "第三次握手：客户端收到确认，检查 ack=x+1 正确。发送最后的 ACK=1，确认号 ack=y+1。此时双方进入 ESTABLISHED (已连接) 状态！"
    default:
      return ""
  }
})

const clientStateClass = computed(() => 
  step.value === 3 ? 'state-established' : (step.value >= 1 ? 'state-syn' : '')
)

const serverStateClass = computed(() => 
  step.value === 3 ? 'state-established' : (step.value >= 2 ? 'state-syn' : '')
)

const nextStep = () => {
  if (step.value < 3) step.value++
}

const reset = () => {
  step.value = 0
}
</script>

<style scoped>
.tcp-handshake {
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
  min-height: 300px;
}

.host {
  width: 120px;
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
}

.state-box {
  background: #34495e;
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 14px;
  margin-top: 10px;
  transition: all 0.5s;
}

.state-syn {
  background: #e67e22;
}

.state-established {
  background: #27ae60;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.5);
}

.arrow-layer {
  position: absolute;
  top: 60px;
  left: 150px;
  right: 150px;
  height: 200px;
  pointer-events: none;
}

.msg-arrow {
  position: absolute;
  height: 2px;
  background: #3498db;
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
  color: #3498db;
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
  color: #2980b9;
  background: #ebf5fb;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #a9cce3;
  opacity: 0;
  transition: opacity 0.5s;
}

.step-1 {
  top: 20px;
  left: 0;
}

.step-2 {
  top: 80px;
  right: 0;
  background: #9b59b6;
  flex-direction: row-reverse;
}

.step-2::after {
  content: '◀';
  left: -8px;
  right: auto;
  color: #9b59b6;
}

.step-2 .msg-label {
  color: #8e44ad;
  border-color: #d2b4de;
  background: #f4ecf7;
}

.step-3 {
  top: 140px;
  left: 0;
  background: #27ae60;
}

.step-3::after {
  color: #27ae60;
}

.step-3 .msg-label {
  color: #27ae60;
  border-color: #abebc6;
  background: #eafaf1;
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
  border-left: 4px solid #3498db;
  color: var(--vp-c-text-1);
  min-height: 60px;
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

@media (max-width: 768px) {
  .topology {
    padding: 0 20px;
    min-height: 250px;
  }
  
  .arrow-layer {
    left: 100px;
    right: 100px;
  }
  
  .host {
    width: 100px;
  }
  
  .icon {
    font-size: 30px;
  }
}
</style>


