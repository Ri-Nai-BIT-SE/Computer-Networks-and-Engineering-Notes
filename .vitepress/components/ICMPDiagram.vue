<template>
  <div class="icmp-diagram">
    <div class="diagram-header">
      <h3>ICMP 示意图</h3>
      <div class="diagram-selector">
        <button
          v-for="diagram in diagrams"
          :key="diagram.id"
          class="diagram-btn"
          :class="{ active: selectedDiagram === diagram.id }"
          @click="selectedDiagram = diagram.id"
        >
          {{ diagram.name }}
        </button>
      </div>
    </div>

    <div class="diagram-content">
      <!-- ICMP报文结构 -->
      <div v-if="selectedDiagram === 'structure'" class="icmp-structure">
        <h4>ICMP 报文通用格式</h4>
        <div class="packet-diagram">
          <div class="packet-header">
            <div class="packet-field" style="width: 12.5%">
              <div class="field-label">类型<br>(Type)</div>
              <div class="field-size">8位</div>
            </div>
            <div class="packet-field" style="width: 12.5%">
              <div class="field-label">代码<br>(Code)</div>
              <div class="field-size">8位</div>
            </div>
            <div class="packet-field" style="width: 25%">
              <div class="field-label">检验和<br>(Checksum)</div>
              <div class="field-size">16位</div>
            </div>
            <div class="packet-field" style="width: 50%; background: var(--vp-c-bg-soft)">
              <div class="field-label">数据部分<br>(可变长度)</div>
            </div>
          </div>
          <div class="packet-note">
            <p>前4字节是统一的，数据部分长度取决于ICMP报文类型</p>
          </div>
        </div>
      </div>

      <!-- 差错报告报文结构 -->
      <div v-if="selectedDiagram === 'error'" class="icmp-error">
        <h4>ICMP 差错报告报文结构 ⭐⭐</h4>
        <div class="packet-diagram">
          <div class="packet-header">
            <div class="packet-field" style="width: 20%">
              <div class="field-label">ICMP首部</div>
              <div class="field-detail">类型/代码/检验和</div>
            </div>
            <div class="packet-field" style="width: 40%">
              <div class="field-label">原IP首部</div>
              <div class="field-detail">源IP、目的IP等</div>
            </div>
            <div class="packet-field" style="width: 40%">
              <div class="field-label">原IP数据前8字节</div>
              <div class="field-detail">包含端口号</div>
            </div>
          </div>
          <div class="packet-note">
            <p>⚠️ <strong>为什么是前8字节？</strong> 包含TCP/UDP的源端口(2字节) + 目的端口(2字节) + 其他字段(4字节)</p>
          </div>
        </div>
      </div>

      <!-- PING工作流程 -->
      <div v-if="selectedDiagram === 'ping'" class="icmp-ping">
        <h4>PING 工作流程</h4>
        <div class="flow-diagram">
          <div class="flow-step">
            <div class="step-box source">
              <div class="step-label">源主机</div>
              <div class="step-action">发送 ICMP 回送请求<br>(Type=8)</div>
            </div>
            <div class="arrow">→</div>
            <div class="step-box dest">
              <div class="step-label">目的主机</div>
              <div class="step-action">收到请求</div>
            </div>
          </div>
          <div class="flow-step">
            <div class="step-box dest">
              <div class="step-label">目的主机</div>
              <div class="step-action">发送 ICMP 回送回答<br>(Type=0)</div>
            </div>
            <div class="arrow">→</div>
            <div class="step-box source">
              <div class="step-label">源主机</div>
              <div class="step-action">收到回答<br>显示连通性</div>
            </div>
          </div>
          <div class="flow-note">
            <p>💡 <strong>特点</strong>：应用层直接使用网络层ICMP，不经过传输层（TCP/UDP）</p>
          </div>
        </div>
      </div>

      <!-- Traceroute工作流程 -->
      <div v-if="selectedDiagram === 'traceroute'" class="icmp-traceroute">
        <h4>Traceroute 工作流程</h4>
        <div class="traceroute-flow">
          <div class="hop-item" v-for="(hop, index) in tracerouteHops" :key="index">
            <div class="hop-number">第{{ hop.number }}跳</div>
            <div class="hop-content">
              <div class="hop-step">
                <div class="step-box source">
                  <div class="step-label">源主机</div>
                  <div class="step-action">发送数据报<br>TTL={{ hop.ttl }}</div>
                </div>
                <div class="arrow">→</div>
                <div class="step-box router">
                  <div class="step-label">路由器{{ hop.number }}</div>
                  <div class="step-action">TTL减1变为0<br>丢弃数据报</div>
                </div>
              </div>
              <div class="hop-step">
                <div class="step-box router">
                  <div class="step-label">路由器{{ hop.number }}</div>
                  <div class="step-action">发送 ICMP 时间超过<br>(Type=11)</div>
                </div>
                <div class="arrow">→</div>
                <div class="step-box source">
                  <div class="step-label">源主机</div>
                  <div class="step-action">收到报文<br>得到路由器IP</div>
                </div>
              </div>
            </div>
          </div>
          <div class="hop-item final">
            <div class="hop-number">到达终点</div>
            <div class="hop-content">
              <div class="hop-step">
                <div class="step-box source">
                  <div class="step-label">源主机</div>
                  <div class="step-action">发送数据报<br>TTL足够大</div>
                </div>
                <div class="arrow">→</div>
                <div class="step-box dest">
                  <div class="step-label">目的主机</div>
                  <div class="step-action">端口不可达</div>
                </div>
              </div>
              <div class="hop-step">
                <div class="step-box dest">
                  <div class="step-label">目的主机</div>
                  <div class="step-action">发送 ICMP 终点不可达<br>(Type=3)</div>
                </div>
                <div class="arrow">→</div>
                <div class="step-box source">
                  <div class="step-label">源主机</div>
                  <div class="step-action">收到报文<br>停止探测</div>
                </div>
              </div>
            </div>
          </div>
          <div class="flow-note">
            <p>💡 <strong>关键</strong>：通过逐步增加TTL值（1, 2, 3...）来探测每一跳路由器</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedDiagram = ref('structure')

const diagrams = [
  { id: 'structure', name: 'ICMP报文结构' },
  { id: 'error', name: '差错报告报文' },
  { id: 'ping', name: 'PING流程' },
  { id: 'traceroute', name: 'Traceroute流程' }
]

const tracerouteHops = [
  { number: 1, ttl: 1 },
  { number: 2, ttl: 2 },
  { number: 3, ttl: 3 }
]
</script>

<style scoped>
.icmp-diagram {
  margin: 2rem 0;
  padding: 1.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
}

.diagram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.diagram-header h3 {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 1.25rem;
}

.diagram-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.diagram-btn {
  padding: 0.5rem 1rem;
  border: 2px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.diagram-btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.diagram-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: white;
}

.diagram-content {
  min-height: 300px;
}

.diagram-content h4 {
  margin: 0 0 1rem 0;
  color: var(--vp-c-text-1);
  font-size: 1.1rem;
}

.packet-diagram {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
}

.packet-header {
  display: flex;
  gap: 2px;
  margin-bottom: 1rem;
}

.packet-field {
  background: var(--vp-c-brand-lighter);
  border: 2px solid var(--vp-c-brand-1);
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.field-label {
  font-weight: 600;
  color: var(--vp-c-brand-dark);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.field-size {
  font-size: 0.8rem;
  color: var(--vp-c-brand-dark);
  opacity: 0.8;
}

.field-detail {
  font-size: 0.75rem;
  color: var(--vp-c-brand-dark);
  opacity: 0.8;
  margin-top: 0.5rem;
}

.packet-note {
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border-left: 4px solid var(--vp-c-brand-1);
}

.packet-note p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.flow-diagram {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
}

.flow-step {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step-box {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 2px solid var(--vp-c-divider);
  min-width: 150px;
  text-align: center;
}

.step-box.source {
  background: var(--vp-c-brand-lighter);
  border-color: var(--vp-c-brand-1);
}

.step-box.dest {
  background: #e8f5e9;
  border-color: #4caf50;
}

.step-box.router {
  background: #fff3e0;
  border-color: #ff9800;
}

.step-label {
  font-weight: 600;
  color: var(--vp-c-brand-dark);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.step-action {
  font-size: 0.85rem;
  color: var(--vp-c-brand-dark);
  line-height: 1.4;
}

.dark .step-box.dest {
  background: #1b4332;
  border-color: #4caf50;
}

.dark .step-box.dest .step-label,
.dark .step-box.dest .step-action {
  color: #81c995;
}

.dark .step-box.router {
  background: #7c2d12;
  border-color: #ff9800;
}

.dark .step-box.router .step-label,
.dark .step-box.router .step-action {
  color: #ffb74d;
}

.arrow {
  font-size: 1.5rem;
  color: var(--vp-c-brand-1);
  font-weight: bold;
}

.flow-note {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  border-left: 4px solid var(--vp-c-brand-1);
}

.flow-note p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.traceroute-flow {
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
}

.hop-item {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--vp-c-divider);
}

.hop-item:last-child {
  border-bottom: none;
}

.hop-item.final {
  border-bottom: 2px solid var(--vp-c-brand-1);
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
}

.hop-number {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 1rem;
  font-size: 1rem;
}

.hop-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hop-step {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .diagram-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .diagram-selector {
    width: 100%;
  }

  .diagram-btn {
    flex: 1;
    min-width: 0;
  }

  .packet-header {
    flex-direction: column;
  }

  .packet-field {
    width: 100% !important;
  }

  .flow-step {
    flex-direction: column;
  }

  .arrow {
    transform: rotate(90deg);
  }
}
</style>
