<template>
  <div class="tcp-congestion-algorithm">
    <div class="viewer-header">
      <h4>📉 TCP 拥塞窗口 (cwnd) 演变图</h4>
      <p class="subtitle">观察拥塞窗口在不同情况下的变化</p>
    </div>
    
    <div class="status-panel">
      <div class="status-item">
        <div class="label">当前轮次</div>
        <div class="val">{{ round }}</div>
      </div>
      <div class="status-item">
        <div class="label">cwnd (窗口)</div>
        <div class="val">{{ cwnd }}</div>
      </div>
      <div class="status-item">
        <div class="label">ssthresh (门限)</div>
        <div class="val threshold">{{ ssthresh }}</div>
      </div>
      <div class="status-item">
        <div class="label">当前算法</div>
        <div :class="['phase-badge', phaseClass]">{{ phaseName }}</div>
      </div>
    </div>

    <div class="chart-box">
      <div class="y-axis-label">cwnd</div>
      <div class="x-axis-label">传输轮次</div>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none">
        <!-- 门限线 -->
        <line 
          x1="0" 
          :y1="getY(ssthresh)" 
          x2="400" 
          :y2="getY(ssthresh)" 
          class="thresh-line" 
        />
        
        <!-- 窗口曲线 -->
        <polyline :points="pointsString" />
        
        <!-- 数据点 -->
        <circle 
          v-for="(p, i) in history" 
          :key="i" 
          :cx="getX(i)" 
          :cy="getY(p)" 
          r="3"
          class="data-point"
        />
      </svg>
    </div>

    <div class="controls">
      <button 
        class="btn-next" 
        @click="nextRound"
      >
        👉 下一轮 (正常传输)
      </button>
      <button 
        class="btn-timeout" 
        @click="handleTimeout"
      >
        💥 发生超时 (Timeout)
      </button>
      <button 
        class="btn-dup" 
        @click="handle3DupAck"
      >
        ⚠️ 3个重复 ACK (快恢复)
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>
    
    <div class="note">
      (注：图表 Y 轴最大刻度为 20，超过部分可能显示不全)
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const cwnd = ref(1)
const ssthresh = ref(16)
const round = ref(0)
const history = ref([1]) // 记录历史 cwnd

// 状态判断
const phaseName = computed(() => {
  if (cwnd.value < ssthresh.value) return "慢开始 (指数)"
  return "拥塞避免 (线性)"
})

const phaseClass = computed(() => {
  if (cwnd.value < ssthresh.value) return "slow-start"
  return "congestion-avoid"
})

// 1. 正常下一轮
const nextRound = () => {
  round.value++
  // 慢开始：指数增长 (*2)
  if (cwnd.value < ssthresh.value) {
    cwnd.value *= 2
  } 
  // 拥塞避免：线性增长 (+1)
  else {
    cwnd.value += 1
  }
  history.value.push(cwnd.value)
}

// 2. 超时 (Timeout)
const handleTimeout = () => {
  round.value++
  // 门限减半
  ssthresh.value = Math.max(2, Math.floor(cwnd.value / 2))
  // 窗口一夜回到解放前
  cwnd.value = 1
  history.value.push(cwnd.value)
}

// 3. 快恢复 (3 Dup ACKs)
const handle3DupAck = () => {
  round.value++
  // 门限减半
  ssthresh.value = Math.max(2, Math.floor(cwnd.value / 2))
  // 窗口也减半 (快恢复)
  cwnd.value = ssthresh.value
  // (有些实现是 ssthresh + 3，这里按教材简化为 ssthresh)
  history.value.push(cwnd.value)
}

const reset = () => {
  cwnd.value = 1
  ssthresh.value = 16
  round.value = 0
  history.value = [1]
}

// 绘图辅助
const getX = (i: number): number => {
  const maxRounds = Math.max(10, history.value.length)
  return i * (400 / maxRounds)
}

const getY = (val: number): number => {
  const maxVal = 20 // 假设最大 20
  return 200 - (val * 10)
}

const pointsString = computed(() => {
  return history.value.map((val, i) => `${getX(i)},${getY(val)}`).join(' ')
})
</script>

<style scoped>
.tcp-congestion-algorithm {
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

.status-panel {
  display: flex;
  justify-content: space-around;
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
  gap: 15px;
}

.status-item {
  text-align: center;
  min-width: 100px;
}

.status-item .label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 5px;
}

.status-item .val {
  font-size: 24px;
  font-weight: bold;
  color: var(--vp-c-text-1);
}

.status-item .val.threshold {
  color: #27ae60;
}

.phase-badge {
  padding: 5px 12px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}

.phase-badge.slow-start {
  background: #3498db;
}

.phase-badge.congestion-avoid {
  background: #27ae60;
}

.chart-box {
  height: 300px;
  border-left: 2px solid var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-text-1);
  margin: 20px;
  position: relative;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 19px,
    var(--vp-c-divider) 20px
  );
  border-radius: 4px;
  overflow: hidden;
}

.y-axis-label {
  position: absolute;
  top: -20px;
  left: -30px;
  font-size: 12px;
  color: var(--vp-c-text-1);
  font-weight: bold;
}

.x-axis-label {
  position: absolute;
  bottom: -25px;
  right: 0;
  font-size: 12px;
  color: var(--vp-c-text-1);
  font-weight: bold;
}

svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.thresh-line {
  stroke: #27ae60;
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  opacity: 0.7;
}

polyline {
  fill: none;
  stroke: #3498db;
  stroke-width: 3;
  stroke-linejoin: round;
  transition: all 0.3s;
}

.data-point {
  fill: #fff;
  stroke: #e74c3c;
  stroke-width: 2;
  transition: all 0.3s;
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
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.btn-next {
  background: #3498db;
}

.btn-timeout {
  background: #c0392b;
}

.btn-dup {
  background: #e67e22;
}

.btn-reset {
  background: #7f8c8d;
}

.note {
  text-align: center;
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-top: 10px;
}

@media (max-width: 768px) {
  .chart-box {
    margin: 10px;
    height: 250px;
  }
  
  .status-panel {
    flex-direction: column;
  }
}
</style>


