<template>
  <div class="bgp-simulation">
    <div class="simulation-header">
      <h3>4.6.4 外部网关协议 BGP (Path Vector)</h3>
      <div class="bgp-features">
        <span class="feature-tag">自治系统 (AS) 间通信</span>
        <span class="feature-tag">路径向量 (AS-PATH)</span>
        <span class="feature-tag">策略路由</span>
      </div>
      <div class="description-box">
        <p>{{ getStepDescription() }}</p>
        <button @click="handleNextStep" class="next-btn">
          {{ step === 3 ? '重置演示' : '下一步' }}
          <span v-if="step !== 3">→</span>
        </button>
      </div>
    </div>

    <div class="simulation-content">
      <!-- 网络拓扑图 -->
      <div class="topology-section">
        <div class="topology-canvas">
          <svg class="topology-svg" viewBox="0 0 500 400" preserveAspectRatio="xMidYMid meet">
            <!-- AS云背景 -->
            <g v-for="node in nodes" :key="`cloud-${node.id}`">
              <ellipse
                :cx="node.x"
                :cy="node.y"
                rx="60"
                ry="40"
                fill="white"
                stroke="#cbd5e1"
                stroke-width="2"
                opacity="0.5"
              />
            </g>
            
            <!-- AS间连接 -->
            <g v-for="(link, index) in connections" :key="`link-${index}`">
              <line
                :x1="getNodePosition(link.from).x"
                :y1="getNodePosition(link.from).y"
                :x2="getNodePosition(link.to).x"
                :y2="getNodePosition(link.to).y"
                stroke="#64748b"
                stroke-width="4"
                stroke-dasharray="8,4"
              />
            </g>
            
            <!-- 消息动画 -->
            <g v-for="(msg, index) in messages" :key="`msg-${index}`">
              <circle r="6" fill="#4f46e5">
                <animateMotion
                  dur="1.5s"
                  repeatCount="1"
                  fill="freeze"
                  :path="`M${getNodePosition(msg.from).x},${getNodePosition(msg.from).y} L${getNodePosition(msg.to).x},${getNodePosition(msg.to).y}`"
                />
              </circle>
            </g>
            
            <!-- AS节点 -->
            <g v-for="node in nodes" :key="`node-${node.id}`">
              <rect
                :x="node.x - 30"
                :y="node.y - 30"
                width="60"
                height="60"
                :fill="getASColor(node.id)"
                stroke="white"
                stroke-width="3"
                rx="8"
              />
              <text
                :x="node.x"
                :y="node.y + 5"
                text-anchor="middle"
                dominant-baseline="middle"
                fill="white"
                font-weight="bold"
                font-size="14"
              >
                {{ node.id }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- BGP路由表 -->
      <div class="info-section">
        <div class="bgp-table-box">
          <h4>AS1 的 BGP 路由表 (Net X)</h4>
          <div class="table-header">
            <div>前缀</div>
            <div>AS-PATH</div>
            <div>下一跳</div>
          </div>
          <div v-if="step === 0" class="empty-state">
            路由表为空
          </div>
          <template v-if="step >= 2">
            <div class="table-row selected">
              <div>Net X</div>
              <div class="as-path">AS2 AS4</div>
              <div>AS2</div>
            </div>
            <div class="table-row">
              <div>Net X</div>
              <div class="as-path">AS3 AS4</div>
              <div>AS3</div>
            </div>
          </template>
        </div>

        <div class="key-concepts">
          <h4>关键概念：</h4>
          <ul>
            <li><strong>eBGP</strong>: 不同 AS 之间交换路由。</li>
            <li><strong>AS-PATH</strong>: 记录经过的 AS 序列，主要用于防止环路（如果收到的路径包含自己的 AS 号，则丢弃）。</li>
            <li><strong>策略</strong>: 管理员可以配置偏好（如优先走 AS2）。</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ASNode {
  id: string
  x: number
  y: number
  type: 'Source' | 'Transit' | 'Dest'
}

interface Message {
  from: string
  to: string
  path: string[]
  status: 'valid' | 'loop'
}

const nodes: ASNode[] = [
  { id: 'AS1', x: 100, y: 200, type: 'Source' },
  { id: 'AS2', x: 250, y: 100, type: 'Transit' },
  { id: 'AS3', x: 250, y: 300, type: 'Transit' },
  { id: 'AS4', x: 400, y: 200, type: 'Dest' }
]

const connections = [
  { from: 'AS1', to: 'AS2' },
  { from: 'AS1', to: 'AS3' },
  { from: 'AS2', to: 'AS4' },
  { from: 'AS3', to: 'AS4' },
  { from: 'AS2', to: 'AS3' }
]

const step = ref(0)
const messages = ref<Message[]>([])

function getNodePosition(nodeId: string) {
  const node = nodes.find(n => n.id === nodeId)
  return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
}

function getASColor(nodeId: string): string {
  if (nodeId === 'AS4') return '#ef4444'
  if (nodeId === 'AS1') return '#16a34a'
  return '#4f46e5'
}

function getStepDescription(): string {
  switch (step.value) {
    case 0:
      return '初始状态：AS4 拥有网段 X。准备向外通告。'
    case 1:
      return '阶段 1：AS4 向邻居 AS2, AS3 通告路由 [X, AS4]。'
    case 2:
      return '阶段 2：AS2, AS3 将自己的 AS号 加到路径前，向 AS1 通告。'
    case 3:
      return '阶段 3：AS1 收到两条路由。根据策略（如AS跳数）选择路径。'
    default:
      return ''
  }
}

function handleNextStep() {
  if (step.value === 0) {
    messages.value = [
      { from: 'AS4', to: 'AS2', path: ['AS4'], status: 'valid' },
      { from: 'AS4', to: 'AS3', path: ['AS4'], status: 'valid' }
    ]
    step.value = 1
  } else if (step.value === 1) {
    messages.value = [
      { from: 'AS2', to: 'AS1', path: ['AS2', 'AS4'], status: 'valid' },
      { from: 'AS3', to: 'AS1', path: ['AS3', 'AS4'], status: 'valid' },
      { from: 'AS2', to: 'AS3', path: ['AS2', 'AS4'], status: 'valid' }
    ]
    step.value = 2
  } else if (step.value === 2) {
    step.value = 3
  } else {
    step.value = 0
    messages.value = []
  }
}
</script>

<style scoped>
.bgp-simulation {
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
  color: #4f46e5;
  font-size: 1.25rem;
}

.bgp-features {
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
  background: #4f46e5;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.description-box {
  padding: 1rem;
  background: #eef2ff;
  border-left: 4px solid #4f46e5;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.description-box p {
  margin: 0;
  color: #312e81;
  font-weight: 500;
  line-height: 1.6;
  flex: 1;
}

.dark .description-box {
  background: #312e81;
  border-left-color: #4f46e5;
}

.dark .description-box p {
  color: #e0e7ff;
}

.next-btn {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.next-btn:hover {
  background: #4338ca;
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

.bgp-table-box {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.bgp-table-box h4 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
}

.table-row.selected {
  background: #dcfce7;
  border-radius: 4px;
  padding: 0.75rem;
}

.dark .table-row.selected {
  background: #064e3b;
}

.dark .table-row.selected .as-path {
  color: #d1fae5;
}

.as-path {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-1);
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.key-concepts {
  background: var(--vp-c-bg);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}

.key-concepts h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.key-concepts ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--vp-c-text-2);
  line-height: 1.8;
  font-size: 0.85rem;
}

.key-concepts li {
  margin-bottom: 0.5rem;
}

.key-concepts strong {
  color: #4f46e5;
}
</style>

