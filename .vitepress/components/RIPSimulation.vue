<template>
  <div class="rip-simulation">
    <div class="simulation-header">
      <h3>4.6.2 内部网关协议 RIP (Distance Vector)</h3>
      <div class="rip-features">
        <span class="feature-tag">仅和相邻路由器交换信息</span>
        <span class="feature-tag">交换全部路由表</span>
        <span class="feature-tag">按固定时间间隔交换</span>
      </div>
      <div class="description-box">
        <p>{{ description }}</p>
      </div>
    </div>

    <div class="simulation-content">
      <!-- 网络拓扑图 -->
      <div class="topology-section">
        <div class="topology-canvas">
          <svg class="topology-svg" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
            <!-- 连接线 -->
            <g v-for="(link, index) in links" :key="index">
              <line
                :x1="getNodePosition(link.from).x"
                :y1="getNodePosition(link.from).y"
                :x2="getNodePosition(link.to).x"
                :y2="getNodePosition(link.to).y"
                stroke="#94a3b8"
                stroke-width="2"
              />
              <!-- 动画数据包 -->
              <circle v-if="!converged && step > 0" r="4" fill="#3b82f6">
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  :path="`M${getNodePosition(link.from).x},${getNodePosition(link.from).y} L${getNodePosition(link.to).x},${getNodePosition(link.to).y}`"
                />
              </circle>
              <circle v-if="!converged && step > 0" r="4" fill="#3b82f6">
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  begin="0.75s"
                  :path="`M${getNodePosition(link.to).x},${getNodePosition(link.to).y} L${getNodePosition(link.from).x},${getNodePosition(link.from).y}`"
                />
              </circle>
            </g>
            
            <!-- 路由器节点 -->
            <g v-for="node in nodes" :key="`node-${node.id}`">
              <circle
                :cx="node.x"
                :cy="node.y"
                r="24"
                fill="var(--vp-c-brand-1)"
                stroke="white"
                stroke-width="4"
              />
              <text
                :x="node.x"
                :y="node.y"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-weight="bold"
                font-size="20"
              >
                {{ node.id }}
              </text>
            </g>
            
            <!-- 网络标签 -->
            <g v-for="node in nodes" :key="`net-${node.id}`">
              <rect
                :x="node.x + 15"
                :y="node.y - 30"
                width="50"
                height="18"
                fill="#e2e8f0"
                rx="4"
              />
              <text
                :x="node.x + 40"
                :y="node.y - 18"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="var(--vp-c-text-2)"
                font-size="12"
                font-family="monospace"
              >
                Net{{ node.id }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- 控制面板和路由表 -->
      <div class="control-section">
        <div class="controls">
          <button
            @click="nextStep"
            :disabled="converged"
            class="next-btn"
            :class="{ converged: converged }"
          >
            {{ converged ? '已收敛' : '下一步 (交换信息)' }}
            <span v-if="!converged">→</span>
          </button>
          <button @click="init" class="reset-btn" title="重置">
            ↻
          </button>
        </div>

        <div class="tables-container">
          <div
            v-for="node in nodes"
            :key="node.id"
            class="router-table"
          >
            <h4 class="table-title">路由表 {{ node.id }}</h4>
            <div class="table-header">
              <div>目的网络</div>
              <div>距离(跳数)</div>
              <div>下一跳</div>
            </div>
            <div
              v-for="entry in tables[node.id]"
              :key="entry.destination"
              class="table-row"
            >
              <div class="destination">{{ entry.destination }}</div>
              <div :class="{ unreachable: entry.metric >= 16 }">
                {{ entry.metric >= 16 ? '∞' : entry.metric }}
              </div>
              <div class="nexthop">{{ entry.nextHop }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="summary-box">
      <h4>⚠️ 特点总结</h4>
      <ul>
        <li>好消息传播快，坏消息传播慢（如果断开链接，收敛时间长）。</li>
        <li>最大跳数 15，16 表示不可达，只适用于小型网络。</li>
        <li>使用 UDP (520端口) 传送。</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

interface RipTableEntry {
  destination: string
  nextHop: string | null
  metric: number
}

const nodes: RouterNode[] = [
  { id: 'A', label: 'Router A', x: 100, y: 100 },
  { id: 'B', label: 'Router B', x: 300, y: 50 },
  { id: 'C', label: 'Router C', x: 300, y: 150 },
  { id: 'D', label: 'Router D', x: 500, y: 100 }
]

const links: Link[] = [
  { from: 'A', to: 'B', cost: 1 },
  { from: 'A', to: 'C', cost: 1 },
  { from: 'B', to: 'D', cost: 1 },
  { from: 'C', to: 'D', cost: 1 }
]

const networks = ['NetA', 'NetB', 'NetC', 'NetD']

const step = ref(0)
const tables = ref<Record<string, RipTableEntry[]>>({})
const converged = ref(false)
const description = ref('初始化：每个路由器只知道直连的网络，距离设为 1 (直接交付)。其他网络不可达 (16)。')

function getNodePosition(nodeId: string) {
  const node = nodes.find(n => n.id === nodeId)
  return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
}

function init() {
  const initialTables: Record<string, RipTableEntry[]> = {}
  nodes.forEach(node => {
    const myTable: RipTableEntry[] = []
    myTable.push({ destination: `Net${node.id}`, nextHop: '-', metric: 1 })
    networks.filter(n => n !== `Net${node.id}`).forEach(net => {
      myTable.push({ destination: net, nextHop: '-', metric: 16 })
    })
    initialTables[node.id] = myTable
  })
  tables.value = initialTables
  step.value = 0
  converged.value = false
  description.value = '初始化：每个路由器只知道直连的网络，距离设为 1 (直接交付)。其他网络不可达 (16)。'
}

function nextStep() {
  let changeOccurred = false
  const newTables = JSON.parse(JSON.stringify(tables.value))

  nodes.forEach(node => {
    const neighbors = links
      .filter(l => l.from === node.id || l.to === node.id)
      .map(l => (l.from === node.id ? l.to : l.from))

    neighbors.forEach(neighborId => {
      const neighborTable = tables.value[neighborId]
      
      neighborTable.forEach(neighborEntry => {
        const newMetric = Math.min(neighborEntry.metric + 1, 16)
        const myEntryIndex = newTables[node.id].findIndex(
          (e: RipTableEntry) => e.destination === neighborEntry.destination
        )
        
        if (myEntryIndex !== -1) {
          const myEntry = newTables[node.id][myEntryIndex]
          if (myEntry.nextHop === neighborId || newMetric < myEntry.metric) {
            newTables[node.id][myEntryIndex] = {
              destination: neighborEntry.destination,
              nextHop: neighborId,
              metric: newMetric
            }
            changeOccurred = true
          }
        }
      })
    })
  })

  tables.value = newTables
  if (!changeOccurred) {
    converged.value = true
    description.value = '收敛完成：所有路由器都拥有了到达全网的最短路径信息。'
  } else {
    step.value = step.value + 1
    description.value = `第 ${step.value} 次交换：路由器向邻居发送路由表。根据距离向量算法更新路由。`
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.rip-simulation {
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
  color: var(--vp-c-brand-1);
  font-size: 1.25rem;
}

.rip-features {
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
  background: var(--vp-c-brand-1);
  border-radius: 50%;
  margin-right: 0.5rem;
}

.description-box {
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
}

.description-box p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
  line-height: 1.6;
}

.dark .description-box {
  background: #78350f;
  border-left-color: #f59e0b;
}

.dark .description-box p {
  color: #fef3c7;
}

.simulation-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
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
  position: relative;
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

.control-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.next-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.next-btn:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
}

.next-btn:disabled {
  cursor: not-allowed;
}

.next-btn.converged {
  background: #10b981;
}

.reset-btn {
  padding: 0.75rem;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}

.reset-btn:hover {
  background: var(--vp-c-bg-soft);
}

.tables-container {
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.router-table {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
}

.table-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  padding-bottom: 0.25rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
}

.table-row:last-child {
  border-bottom: none;
}

.destination {
  font-family: monospace;
  color: var(--vp-c-text-1);
}

.unreachable {
  color: #ef4444;
  font-weight: 600;
}

.nexthop {
  color: var(--vp-c-text-2);
}

.summary-box {
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f59e0b;
}

.summary-box h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-box ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.summary-box li {
  margin-bottom: 0.5rem;
}
</style>
