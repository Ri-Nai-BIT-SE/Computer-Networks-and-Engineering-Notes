<template>
  <div class="tcp-rto-calculator">
    <div class="viewer-header">
      <h4>📈 TCP 超时时间 (RTO) 计算器</h4>
      <p class="subtitle">算法基于 RFC 6298 (α=0.125, β=0.25)</p>
    </div>

    <!-- 核心指标 -->
    <div class="dashboard">
      <div class="card">
        <h4>RTTs (平滑往返时间)</h4>
        <div class="value">{{ rtts.toFixed(1) }} ms</div>
      </div>
      <div class="card">
        <h4>RTTd (偏差值)</h4>
        <div class="value">{{ rttd.toFixed(1) }} ms</div>
      </div>
      <div class="card highlight">
        <h4>RTO (超时重传时间)</h4>
        <div class="value">{{ rto.toFixed(1) }} ms</div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <input 
        type="number" 
        v-model.number="newSample" 
        placeholder="输入新的 RTT (ms)" 
        @keyup.enter="calculate"
      />
      <button @click="calculate" :disabled="!newSample || newSample <= 0">
        输入本次测量的 RTT
      </button>
      <button class="btn-reset" @click="reset">
        重置
      </button>
    </div>

    <!-- 历史记录 -->
    <div class="history-list">
      <div class="history-header">
        <span style="width:10%">轮次</span>
        <span style="width:20%">测量值 (Sample)</span>
        <span style="width:20%">新 RTTs</span>
        <span style="width:20%">新 RTTd</span>
        <span style="width:20%; color:#e74c3c; font-weight:bold;">计算出的 RTO</span>
      </div>
      <div 
        class="history-item" 
        v-for="(record, index) in history.slice().reverse()" 
        :key="record.id"
      >
        <span style="width:10%">#{{ record.id }}</span>
        <span style="width:20%">{{ record.sample }} ms</span>
        <span style="width:20%">{{ record.s.toFixed(1) }}</span>
        <span style="width:20%">{{ record.d.toFixed(1) }}</span>
        <span style="width:20%; color:#e74c3c; font-weight:bold;">{{ record.r.toFixed(1) }} ms</span>
      </div>
      <div v-if="history.length === 0" class="history-empty">
        暂无历史记录，输入 RTT 值开始计算
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const rtts = ref(0) // 加权平均往返时间
const rttd = ref(0) // RTT 的偏差
const rto = ref(1000) // 初始默认 RTO (通常是 1秒)

const newSample = ref(100) // 用户输入的 SampleRTT
const history = ref<Array<{
  id: number
  sample: number
  s: number
  d: number
  r: number
}>>([])
const count = ref(0)

// 核心算法系数 (考点)
const ALPHA = 0.125 // 1/8
const BETA = 0.25   // 1/4

const calculate = () => {
  if (!newSample.value || newSample.value <= 0) return
  
  count.value++
  const sample = newSample.value

  // 第一次测量 (RFC 规定特殊处理)
  if (count.value === 1) {
    rtts.value = sample
    rttd.value = sample / 2
    rto.value = rtts.value + 4 * rttd.value
  } else {
    // 后续测量 (迭代公式)
    // 1. 计算新的 RTTs
    const oldRtts = rtts.value
    rtts.value = (1 - ALPHA) * oldRtts + ALPHA * sample

    // 2. 计算新的 RTTd (偏差)
    const oldRttd = rttd.value
    rttd.value = (1 - BETA) * oldRttd + BETA * Math.abs(sample - rtts.value)

    // 3. 计算 RTO
    rto.value = rtts.value + 4 * rttd.value
  }

  history.value.push({
    id: count.value,
    sample: sample,
    s: rtts.value,
    d: rttd.value,
    r: rto.value
  })
  
  // 清空输入框，准备下一次输入
  newSample.value = 0
}

const reset = () => {
  rtts.value = 0
  rttd.value = 0
  rto.value = 1000
  newSample.value = 100
  history.value = []
  count.value = 0
}
</script>

<style scoped>
.tcp-rto-calculator {
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

.dashboard {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.card {
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border-bottom: 4px solid var(--vp-c-divider);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.card .value {
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.card.highlight {
  background: rgba(26, 188, 156, 0.1);
  border-bottom-color: #1abc9c;
}

.card.highlight .value {
  color: #16a085;
}

.input-area {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  background: var(--vp-c-bg);
  padding: 20px;
  border-radius: 8px;
  flex-wrap: wrap;
}

.input-area input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  width: 180px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.input-area input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px rgba(9, 132, 227, 0.2);
}

button {
  padding: 10px 20px;
  font-size: 14px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}

button:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-reset {
  background: #95a5a6;
}

.btn-reset:hover {
  background: #7f8c8d;
}

.history-list {
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid var(--vp-c-divider);
}

.history-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 2px solid var(--vp-c-divider);
  font-weight: bold;
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 5px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.2s;
}

.history-item:hover {
  background: var(--vp-c-bg-soft);
}

.history-item:last-child {
  border-bottom: none;
  font-weight: bold;
  background: var(--vp-c-bg-soft);
}

.history-empty {
  padding: 20px;
  text-align: center;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  
  .input-area {
    flex-direction: column;
  }
  
  .input-area input {
    width: 100%;
  }
}
</style>


