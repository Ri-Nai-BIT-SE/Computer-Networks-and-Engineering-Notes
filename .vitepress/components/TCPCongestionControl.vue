<template>
  <div class="tcp-congestion-control">
    <div class="viewer-header">
      <h4>📉 网络拥塞与吞吐量关系</h4>
      <p class="subtitle">观察网络负载增加时，吞吐量的变化</p>
    </div>
    
    <div class="legend">
      <span>
        <div class="color-box ideal"></div> 理想情况
      </span>
      <span>
        <div class="color-box no-control"></div> 无拥塞控制 (死锁)
      </span>
      <span>
        <div class="color-box with-control"></div> 实际拥塞控制
      </span>
    </div>

    <div class="chart-container">
      <div class="y-axis">吞吐量 (Throughput)</div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <!-- Ideal curve -->
        <path 
          d="M0,100 L50,0 L100,0" 
          stroke="#27ae60" 
          stroke-dasharray="5,5" 
          opacity="0.5"
          stroke-width="2"
        />
        
        <!-- No Control (Collapse) curve -->
        <path 
          d="M0,100 Q40,0 50,10 Q60,90 100,98" 
          stroke="#c0392b" 
          stroke-width="2.5"
        />
        
        <!-- With Control curve -->
        <path 
          d="M0,100 Q40,10 100,20" 
          stroke="#2980b9" 
          stroke-width="3"
        />

        <!-- Current Position Dot -->
        <circle 
          :cx="load" 
          :cy="getThroughputY(load)" 
          r="2.5" 
          class="dot" 
          :class="statusClass"
        />
      </svg>
      <div class="x-axis">提供的负载 (Offered Load)</div>
    </div>

    <div class="slider-container">
      <span>负载:</span>
      <input 
        type="range" 
        v-model.number="load" 
        min="0" 
        max="100" 
        step="1"
      >
      <span>{{ load }}%</span>
    </div>

    <div :class="['status', statusClass]">
      {{ statusText }}
    </div>

    <div class="tips">
      <strong>关键观察点：</strong>
      <ul>
        <li><strong>理想情况（绿线）</strong>：有多少发多少，直到带宽上限</li>
        <li><strong>无拥塞控制（红线）</strong>：一旦堵了，因为重传效应，吞吐量会断崖式下跌（死锁）</li>
        <li><strong>有拥塞控制（蓝线）</strong>：虽然不能无限增长，但能维持在一个较高的水平，不会崩盘</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const load = ref(10) // 0-100

// 模拟曲线计算 Y 坐标 (0在上方，100在下方)
const getThroughputY = (x: number): number => {
  // 简单的模拟曲线：带控制的曲线
  if (x < 40) {
    return 100 - (x * 2.2) // 线性上升
  }
  return 100 - (88 + (x - 40) * 0.2) // 缓慢饱和
}

const statusClass = computed(() => {
  if (load.value < 40) return 'normal'
  if (load.value < 70) return 'congested'
  return 'collapse'
})

const statusText = computed(() => {
  if (load.value < 40) {
    return "🟢 网络通畅：吞吐量随负载线性增加"
  }
  if (load.value < 70) {
    return "🟠 轻度拥塞：拥塞控制介入，丢弃部分分组，维持吞吐量"
  }
  return "🔴 严重拥塞/死锁风险：如果没有控制，吞吐量将归零！(看红线)"
})
</script>

<style scoped>
.tcp-congestion-control {
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

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  font-size: 13px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.legend span {
  display: flex;
  align-items: center;
  color: var(--vp-c-text-1);
}

.color-box {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  border-radius: 3px;
}

.color-box.ideal {
  background: #27ae60;
}

.color-box.no-control {
  background: #c0392b;
}

.color-box.with-control {
  background: #2980b9;
}

.chart-container {
  position: relative;
  height: 300px;
  border-left: 2px solid var(--vp-c-text-1);
  border-bottom: 2px solid var(--vp-c-text-1);
  margin: 20px 0 40px 40px;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 49px,
    var(--vp-c-divider) 50px
  );
  border-radius: 4px;
  overflow: hidden;
}

.y-axis {
  position: absolute;
  top: -25px;
  left: -10px;
  font-weight: bold;
  font-size: 12px;
  color: var(--vp-c-text-1);
}

.x-axis {
  position: absolute;
  bottom: -25px;
  right: 0;
  font-weight: bold;
  font-size: 12px;
  color: var(--vp-c-text-1);
}

svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

path {
  fill: none;
  stroke-linecap: round;
  transition: all 0.3s;
}

.dot {
  fill: #333;
  stroke: white;
  stroke-width: 2;
  transition: all 0.1s;
}

.dot.normal {
  fill: #27ae60;
}

.dot.congested {
  fill: #e67e22;
}

.dot.collapse {
  fill: #c0392b;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--vp-c-bg);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.slider-container span {
  color: var(--vp-c-text-1);
  font-weight: bold;
  min-width: 60px;
}

input[type=range] {
  flex: 1;
  cursor: pointer;
  height: 6px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  outline: none;
  -webkit-appearance: none;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type=range]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.status {
  margin-top: 15px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: bold;
  color: white;
  transition: 0.3s;
  font-size: 14px;
}

.status.normal {
  background: #27ae60;
}

.status.congested {
  background: #e67e22;
}

.status.collapse {
  background: #c0392b;
  animation: shake 0.5s;
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

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .chart-container {
    margin-left: 30px;
    height: 250px;
  }
  
  .legend {
    gap: 10px;
  }
}
</style>


