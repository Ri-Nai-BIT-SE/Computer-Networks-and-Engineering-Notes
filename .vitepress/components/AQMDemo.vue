<template>
  <div class="aqm-demo">
    <div class="viewer-header">
      <h4>🚥 路由器队列管理演示</h4>
      <p class="subtitle">对比尾部丢弃和RED算法的区别</p>
    </div>
    
    <div class="mode-switch">
      <label>
        <input type="radio" value="tail" v-model="mode" />
        传统：尾部丢弃
      </label>
      <label>
        <input type="radio" value="red" v-model="mode" />
        AQM：随机早期检测 (RED)
      </label>
    </div>

    <div class="router-box">
      <!-- 背景区域 -->
      <div class="zone zone-green">
        <span class="zone-label">安全区</span>
      </div>
      <div class="zone zone-yellow">
        <span class="zone-label">随机丢弃区</span>
      </div>
      <div class="zone zone-red">
        <span class="zone-label">必丢区</span>
      </div>

      <!-- 队列中的包 -->
      <div 
        v-for="(p, i) in queue" 
        :key="i" 
        :class="['packet', p.dropped ? 'pkt-drop' : 'pkt-ok']"
      >
        {{ p.dropped ? 'X' : '' }}
      </div>
    </div>

    <div class="queue-info">
      <div class="info-item">
        <span class="label">当前队列长度:</span>
        <span class="value">{{ queue.length }}</span>
      </div>
      <div class="info-item">
        <span class="label">最大容量:</span>
        <span class="value">{{ max }}</span>
      </div>
      <div v-if="mode === 'red'" class="info-item">
        <span class="label">警戒门限:</span>
        <span class="value">{{ thMin }} ~ {{ thMax }}</span>
      </div>
    </div>

    <div class="log">{{ logMsg }}</div>

    <div class="controls">
      <button 
        class="btn-add" 
        @click="packetArrive"
      >
        📥 有分组到达 (点我)
      </button>
      <button 
        class="btn-clear" 
        @click="processPacket"
        :disabled="queue.length === 0"
      >
        📤 路由器转发一个
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>
    
    <div class="note">
      最大容量: {{ max }}。警戒门限: {{ thMin }} ({{ Math.floor(thMin/max*100) }}%) ~ {{ thMax }} ({{ Math.floor(thMax/max*100) }}%)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Packet {
  dropped: boolean
}

const mode = ref<'tail' | 'red'>('red')
const queue = ref<Packet[]>([])
const max = 20
const thMin = 8
const thMax = 16
const logMsg = ref("准备就绪")

const packetArrive = () => {
  const len = queue.value.length
  let dropped = false

  if (mode.value === 'tail') {
    // 尾部丢弃：只有满的时候才丢
    if (len >= max) {
      dropped = true
      logMsg.value = "队列已满！执行尾部丢弃。"
    } else {
      logMsg.value = "接收分组。"
    }
  } else {
    // RED 逻辑
    if (len < thMin) {
      // 绿色区：不丢
      dropped = false
      logMsg.value = "绿色区域：安全接收。"
    } else if (len >= thMax) {
      // 红色区：必丢
      dropped = true
      logMsg.value = "红色区域：强制丢弃！"
    } else {
      // 黄色区：随机丢
      // 队列越长，丢弃概率越大 (线性增长)
      const prob = (len - thMin) / (thMax - thMin) // 0 ~ 1
      dropped = Math.random() < prob
      
      if (dropped) {
        logMsg.value = `黄色警戒区：触发随机丢弃 (概率 ${(prob*100).toFixed(0)}%)`
      } else {
        logMsg.value = "黄色警戒区：侥幸通过。"
      }
    }
  }

  // 即使丢弃了，为了演示效果也放进队列显示一下（实际上路由器直接扔了）
  // 这里为了演示，如果是满导致的丢弃就不放进去了，否则溢出界面
  if (len < max) {
    queue.value.push({ dropped: dropped })
  }
}

const processPacket = () => {
  if (queue.value.length > 0) {
    queue.value.shift()
    logMsg.value = "路由器转发了一个分组。"
  }
}

const reset = () => {
  queue.value = []
  logMsg.value = "准备就绪"
}
</script>

<style scoped>
.aqm-demo {
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

.mode-switch {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.mode-switch label {
  margin: 0 15px;
  cursor: pointer;
  font-weight: bold;
  color: var(--vp-c-text-1);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.mode-switch input[type="radio"] {
  cursor: pointer;
}

.router-box {
  border: 3px solid var(--vp-c-text-1);
  height: 80px;
  margin: 30px 0;
  border-radius: 0 8px 8px 0;
  border-left: none;
  position: relative;
  display: flex;
  align-items: center;
  padding: 5px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

/* Zones */
.zone {
  position: absolute;
  height: 100%;
  top: 0;
  z-index: 0;
  opacity: 0.2;
  font-size: 10px;
  font-weight: bold;
  writing-mode: vertical-rl;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.zone-green {
  background: #00b894;
  left: 0;
  width: 40%;
}

.zone-yellow {
  background: #f1c40f;
  left: 40%;
  width: 40%;
}

.zone-red {
  background: #c0392b;
  left: 80%;
  width: 20%;
}

.zone-label {
  color: var(--vp-c-text-1);
  font-size: 11px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Packets */
.packet {
  width: 30px;
  height: 60px;
  margin-right: 2px;
  border-radius: 4px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
  animation: slideIn 0.2s;
  position: relative;
}

.pkt-ok {
  background: #3498db;
}

.pkt-drop {
  background: #e74c3c;
  opacity: 0.6;
  text-decoration: line-through;
}

.queue-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.info-item {
  font-size: 14px;
  color: var(--vp-c-text-1);
}

.info-item .label {
  color: var(--vp-c-text-2);
  margin-right: 5px;
}

.info-item .value {
  font-weight: bold;
  color: var(--vp-c-brand-1);
}

.log {
  font-size: 13px;
  color: var(--vp-c-text-1);
  text-align: center;
  min-height: 30px;
  padding: 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border-left: 4px solid #3498db;
  margin: 15px 0;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
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

.btn-add {
  background: #27ae60;
}

.btn-add:active {
  transform: scale(0.95);
}

.btn-clear {
  background: #3498db;
}

.btn-reset {
  background: #7f8c8d;
}

.note {
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 15px;
}

@keyframes slideIn {
  from {
    width: 0;
    transform: translateX(-10px);
    opacity: 0;
  }
  to {
    width: 30px;
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .router-box {
    height: 60px;
  }
  
  .packet {
    width: 25px;
    height: 50px;
    font-size: 10px;
  }
}
</style>


