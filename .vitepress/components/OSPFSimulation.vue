<template>
  <div class="ospf-simulation">
    <div class="simulation-header">
      <h3>4.6.3 内部网关协议 OSPF (Link State)</h3>
      <div class="ospf-features">
        <span class="feature-tag">开放最短路径优先</span>
        <span class="feature-tag">Dijkstra 算法</span>
        <span class="feature-tag">洪泛法更新</span>
      </div>
      <div class="description-box">
        <p>{{ getStepDescription() }}</p>
        <div class="control-buttons">
          <button
            @click="nextStep"
            :disabled="step === OspfStep.COMPLETE"
            class="next-btn"
            :class="{ converged: step === OspfStep.COMPLETE }"
          >
            {{ step === OspfStep.COMPLETE ? '已完成' : '下一步' }}
            <span v-if="step !== OspfStep.COMPLETE">→</span>
          </button>
          <button
            @click="reset"
            class="reset-btn"
            title="重置"
          >
            ↻
          </button>
        </div>
      </div>
    </div>

    <div class="simulation-content">
      <!-- 网络拓扑图 -->
      <div class="topology-section">
        <div class="topology-canvas">
          <svg class="topology-svg" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
            <!-- 连接线 -->
            <g v-for="(link, index) in links" :key="`link-${index}`">
              <line
                :x1="getNodePosition(link.from).x"
                :y1="getNodePosition(link.from).y"
                :x2="getNodePosition(link.to).x"
                :y2="getNodePosition(link.to).y"
                :stroke="isShortestPath(link.from, link.to) ? '#16a34a' : '#cbd5e1'"
                :stroke-width="isShortestPath(link.from, link.to) ? '4' : '2'"
              />
              <!-- 代价标签 -->
              <rect
                :x="(getNodePosition(link.from).x + getNodePosition(link.to).x) / 2 - 10"
                :y="(getNodePosition(link.from).y + getNodePosition(link.to).y) / 2 - 10"
                width="20"
                height="20"
                fill="white"
                rx="4"
              />
              <text
                :x="(getNodePosition(link.from).x + getNodePosition(link.to).x) / 2"
                :y="(getNodePosition(link.from).y + getNodePosition(link.to).y) / 2 + 5"
                text-anchor="middle"
                font-size="12"
                font-weight="bold"
                fill="var(--vp-c-text-2)"
              >
                {{ link.cost }}
              </text>
              
              <!-- 洪泛动画 -->
              <template v-if="step === OspfStep.FLOODING">
                <circle r="4" fill="#fbbf24">
                  <animateMotion
                    dur="1s"
                    repeatCount="indefinite"
                    :path="`M${getNodePosition(link.from).x},${getNodePosition(link.from).y} L${getNodePosition(link.to).x},${getNodePosition(link.to).y}`"
                  />
                </circle>
                <circle r="4" fill="#fbbf24">
                  <animateMotion
                    dur="1s"
                    repeatCount="indefinite"
                    begin="0.5s"
                    :path="`M${getNodePosition(link.to).x},${getNodePosition(link.to).y} L${getNodePosition(link.from).x},${getNodePosition(link.from).y}`"
                  />
                </circle>
              </template>
            </g>
            
            <!-- 路由器节点 -->
            <g v-for="node in nodes" :key="`node-${node.id}`">
              <circle
                :cx="node.x"
                :cy="node.y"
                r="32"
                :fill="getNodeColor(node.id)"
                stroke="white"
                stroke-width="4"
              />
              <text
                :x="node.x"
                :y="node.y - 8"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-weight="bold"
                font-size="16"
              >
                {{ node.label }}
              </text>
              <text
                :x="node.x"
                :y="node.y + 8"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-size="10"
                opacity="0.8"
              >
                {{ node.id }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- LSDB和计算结果 -->
      <div class="info-section">
        <div class="lsdb-box">
          <h4>R1 的链路状态数据库 (LSDB)</h4>
          <div class="lsdb-list">
            <div
              v-for="(link, index) in links"
              :key="index"
              class="lsdb-item"
              :class="{ active: step >= OspfStep.FLOODING }"
            >
              <span class="link-pair">{{ link.from }} &lt;-&gt; {{ link.to }}</span>
              <span class="link-cost">Cost: {{ link.cost }}</span>
            </div>
          </div>
        </div>

        <div class="spf-result" :class="{ visible: step >= OspfStep.SPF_CALC }">
          <h4>计算结果 (以 R1 为根)</h4>
          <ul>
            <li>• 到 R2: 代价 1 (NextHop R2)</li>
            <li>• 到 R3: 代价 2 (NextHop R3)</li>
            <li class="highlight">• 到 R4: 代价 2 (NextHop R2)</li>
            <li class="note">注意：R1-R3-R4 代价为 2+5=7，R1-R2-R4 代价为 1+1=2。选后者。</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface RouterNode {
  id: string
  label: string
  x: number
  y: number
}

interface Link {
  from: string
  to: string
  cost: number
}

enum OspfStep {
  IDLE = 0,
  HELLO = 1,
  FLOODING = 2,
  SPF_CALC = 3,
  COMPLETE = 4
}

const nodes: RouterNode[] = [
  { id: 'A', label: 'R1', x: 250, y: 50 },
  { id: 'B', label: 'R2', x: 100, y: 150 },
  { id: 'C', label: 'R3', x: 400, y: 150 },
  { id: 'D', label: 'R4', x: 250, y: 250 }
]

const links: Link[] = [
  { from: 'A', to: 'B', cost: 1 },
  { from: 'A', to: 'C', cost: 2 },
  { from: 'B', to: 'D', cost: 1 },
  { from: 'C', to: 'D', cost: 5 },
  { from: 'B', to: 'C', cost: 1 }
]

const step = ref<OspfStep>(OspfStep.IDLE)

function getNodePosition(nodeId: string) {
  const node = nodes.find(n => n.id === nodeId)
  return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
}

function getNodeColor(nodeId: string): string {
  if (step.value === OspfStep.HELLO) return '#fef3c7'
  if (step.value === OspfStep.FLOODING) return '#fed7aa'
  if (step.value >= OspfStep.SPF_CALC) return '#16a34a'
  return '#cbd5e1'
}

function isShortestPath(from: string, to: string): boolean {
  if (step.value < OspfStep.COMPLETE) return false
  const shortestLinks = ['A-B', 'B-D', 'A-C']
  const pair = `${from}-${to}`
  const reversePair = `${to}-${from}`
  return shortestLinks.includes(pair) || shortestLinks.includes(reversePair)
}

function getStepDescription(): string {
  switch (step.value) {
    case OspfStep.IDLE:
      return '就绪状态。点击开始演示 OSPF 工作流程。'
    case OspfStep.HELLO:
      return '1. 问候 (Hello)：发现并维持邻居关系 (确定邻站可达)。'
    case OspfStep.FLOODING:
      return '2. 链路状态洪泛 (Flooding)：向全网广播链路状态更新 (LSU)，建立同步的 LSDB。'
    case OspfStep.SPF_CALC:
      return '3. 最短路径优先 (SPF) 计算：基于 Dijkstra 算法计算路由。注意观察 A->D 的路径选择。'
    case OspfStep.COMPLETE:
      return '4. 路由表生成完毕。'
    default:
      return ''
  }
}

function nextStep() {
  if (step.value === OspfStep.IDLE) {
    step.value = OspfStep.HELLO
  } else if (step.value === OspfStep.HELLO) {
    step.value = OspfStep.FLOODING
  } else if (step.value === OspfStep.FLOODING) {
    step.value = OspfStep.SPF_CALC
  } else if (step.value === OspfStep.SPF_CALC) {
    step.value = OspfStep.COMPLETE
  }
}

function reset() {
  step.value = OspfStep.IDLE
}
</script>

<style scoped>
.ospf-simulation {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.simulation-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.simulation-header h3 {
  margin: 0 0 1rem 0;
  color: #16a34a;
  font-size: 1.25rem;
}

.ospf-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.feature-tag {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.feature-tag::before {
  content: '';
  width: 8px;
  height: 8px;
  background: #16a34a;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.description-box {
  padding: 1rem;
  background: #dcfce7;
  border-left: 4px solid #16a34a;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description-box p {
  margin: 0;
  color: #166534;
  font-weight: 500;
  line-height: 1.6;
  flex: 1;
}

.dark .description-box {
  background: #064e3b;
  border-left-color: #16a34a;
}

.dark .description-box p {
  color: #d1fae5;
}

.control-buttons {
  margin-left: 1rem;
}

.next-btn {
  padding: 0.5rem 1rem;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-btn:hover:not(:disabled) {
  background: #15803d;
}

.next-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.next-btn.converged {
  background: #10b981;
}

.reset-btn {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 0.5rem;
}

.reset-btn:hover {
  background: var(--vp-c-bg-soft);
}

.simulation-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .simulation-content {
    grid-template-columns: 1fr;
  }
}

.topology-section {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
}

.topology-canvas {
  width: 100%;
  height: 400px;
  background: #f8fafc;
  border-radius: 6px;
  overflow: hidden;
}

.dark .topology-canvas {
  background: var(--vp-c-bg-alt);
}

.topology-svg {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lsdb-box {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.lsdb-box h4 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lsdb-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lsdb-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  opacity: 0.5;
  transition: all 0.3s;
}

.lsdb-item.active {
  background: #dcfce7;
  border-color: #16a34a;
  opacity: 1;
}

.dark .lsdb-item.active {
  background: #064e3b;
  border-color: #16a34a;
}

.dark .lsdb-item.active .link-pair,
.dark .lsdb-item.active .link-cost {
  color: #d1fae5;
}

.link-pair {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--vp-c-text-1);
}

.link-cost {
  font-size: 0.75rem;
  background: var(--vp-c-bg-alt);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: var(--vp-c-text-2);
}

.spf-result {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  opacity: 0;
  transition: opacity 0.3s;
}

.spf-result.visible {
  opacity: 1;
  background: #dcfce7;
  border-color: #16a34a;
}

.dark .spf-result.visible {
  background: #064e3b;
  border-color: #16a34a;
}

.spf-result h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .spf-result.visible h4,
.dark .spf-result.visible ul {
  color: #d1fae5;
}

.spf-result ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #166534;
  line-height: 1.8;
  font-size: 0.85rem;
}

.spf-result li {
  margin-bottom: 0.5rem;
}

.spf-result li.highlight {
  font-weight: 600;
}

.spf-result li.note {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-top: 0.5rem;
  font-style: italic;
}
</style>

