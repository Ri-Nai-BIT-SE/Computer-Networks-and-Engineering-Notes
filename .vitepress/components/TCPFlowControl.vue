<template>
  <div class="tcp-flow-control">
    <div class="viewer-header">
      <h4>🛑 TCP 流量控制 (rwnd) 演示</h4>
      <p class="subtitle">观察接收缓存如何控制发送窗口</p>
    </div>
    
    <div class="actors">
      <!-- 发送方 -->
      <div class="actor sender">
        <h4>发送方 A</h4>
        <div class="window-display">
          当前发送窗口: 
          <span class="window-value">{{ rwnd }}</span>
        </div>
        <div v-if="rwnd > 0" class="status-badge bg-ok">
          允许发送
        </div>
        <div v-else class="status-badge bg-stop">
          禁止发送 (零窗口)
        </div>
      </div>

      <div class="arrow-box">➔</div>

      <!-- 接收方 -->
      <div class="actor receiver">
        <h4>接收方 B</h4>
        <div class="buffer-label">接收缓存 (总容量: {{ maxBuffer }})</div>
        <div class="buffer-container">
          <div 
            v-for="n in maxBuffer" 
            :key="n" 
            :class="['buffer-cell', n <= usedBuffer ? 'cell-filled' : '']"
          >
            {{ n <= usedBuffer ? 'Data' : '' }}
          </div>
        </div>
        <div class="rwnd-display">
          通告窗口 rwnd = <strong>{{ rwnd }}</strong>
        </div>
      </div>
    </div>

    <div class="controls">
      <button 
        class="btn-send" 
        @click="sendPacket" 
        :disabled="rwnd === 0"
      >
        📤 发送 1 个数据包
      </button>
      <button 
        class="btn-read" 
        @click="appRead" 
        :disabled="usedBuffer === 0"
      >
        📥 应用层读取 1 个包 (腾出空间)
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>

    <div class="log">
      <strong>TCP 协议动作：</strong> 
      <span>{{ logMsg }}</span>
    </div>

    <div class="tips">
      <strong>关键观察点：</strong>
      <ul>
        <li>当接收缓存填满时，rwnd = 0，发送方必须停止发送</li>
        <li>应用层读取数据后，rwnd 增大，发送方可以继续发送</li>
        <li>这就是流量控制的核心：接收方通过 rwnd 控制发送方的发送速率</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const maxBuffer = 10
const usedBuffer = ref(0)

// rwnd (接收窗口) = 总容量 - 已占用
const rwnd = computed(() => maxBuffer - usedBuffer.value)

const logMsg = ref("连接建立，接收窗口 rwnd = 10。")

const sendPacket = () => {
  if (rwnd.value > 0) {
    usedBuffer.value++
    logMsg.value = `A 发送数据。B 的缓存被占用。B 回复 ACK, rwnd = ${rwnd.value}。`
    if (rwnd.value === 0) {
      logMsg.value += " ⚠️ 零窗口！A 必须停止发送，启动持续计时器。"
    }
  }
}

const appRead = () => {
  if (usedBuffer.value > 0) {
    const wasZero = (rwnd.value === 0)
    usedBuffer.value--
    logMsg.value = `B 的应用层读走了数据，缓存空出。`
    
    if (wasZero) {
      logMsg.value += ` ✅ 窗口打开！B 发送 rwnd = ${rwnd.value} 通知 A。A 恢复发送。`
    } else {
      logMsg.value += ` B 发送 rwnd = ${rwnd.value} 通知 A。`
    }
  }
}

const reset = () => {
  usedBuffer.value = 0
  logMsg.value = "连接建立，接收窗口 rwnd = 10。"
}
</script>

<style scoped>
.tcp-flow-control {
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

.actors {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
  gap: 20px;
}

.actor {
  width: 45%;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border: 2px solid var(--vp-c-divider);
  transition: all 0.3s;
  background: var(--vp-c-bg);
}

.sender {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.receiver {
  border-color: #e67e22;
  background: rgba(230, 126, 34, 0.1);
}

.actor h4 {
  margin: 0 0 10px 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.window-display {
  margin: 10px 0;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.window-value {
  font-size: 1.8em;
  color: #3498db;
  font-weight: bold;
}

.buffer-label {
  margin: 10px 0 5px 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.buffer-container {
  margin: 10px 0;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  height: 40px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

.buffer-cell {
  flex: 1;
  border-right: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--vp-c-text-3);
  transition: all 0.3s;
}

.cell-filled {
  background: #e67e22;
  color: white;
  animation: fill 0.3s;
}

.rwnd-display {
  margin-top: 10px;
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.rwnd-display strong {
  color: #e67e22;
  font-size: 1.2em;
}

.arrow-box {
  font-size: 24px;
  color: var(--vp-c-text-1);
  font-weight: bold;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-top: 8px;
}

.bg-ok {
  background: #27ae60;
}

.bg-stop {
  background: #c0392b;
  animation: pulse 1s infinite;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: 0.2s;
  font-size: 14px;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-send {
  background: #3498db;
}

.btn-send:hover:not(:disabled) {
  background: #2980b9;
}

.btn-read {
  background: #27ae60;
}

.btn-read:hover:not(:disabled) {
  background: #229954;
}

.btn-reset {
  background: #95a5a6;
}

.btn-reset:hover {
  background: #7f8c8d;
}

.log {
  margin-top: 20px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
  line-height: 1.6;
}

.log strong {
  color: var(--vp-c-text-1);
}

.tips {
  margin-top: 20px;
  font-size: 13px;
  color: var(--vp-c-text-2);
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

@keyframes fill {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .actors {
    flex-direction: column;
  }
  
  .actor {
    width: 100%;
  }
  
  .arrow-box {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}
</style>


