<template>
  <div class="tcp-nagle-algorithm">
    <div class="viewer-header">
      <h4>🐢 Nagle 算法模拟器</h4>
      <p class="subtitle">规则：有未确认的包时，数据先囤积，直到收到 ACK 才发大包。</p>
    </div>

    <div class="input-area">
      <input 
        type="text" 
        v-model="inputText" 
        @input="handleInput" 
        placeholder="在这里快速打字..." 
        :disabled="false"
      />
    </div>

    <div class="pipeline">
      <div :class="['buffer-box', buffer.length > 0 ? 'buffer-has-data' : '']">
        TCP 发送缓存<br>
        <span v-if="buffer.length > 0">囤积: "{{ buffer }}"</span>
        <span v-else>(空)</span>
      </div>

      <!-- 正在飞行的包 -->
      <div v-if="packetInFlight" class="packet">
        数据包: "{{ packetContent }}" <br> 
        <small>(等待ACK...)</small>
      </div>

      <div class="receiver-label">接收方</div>
    </div>

    <div class="control-area">
      <button 
        @click="receiveAck" 
        :disabled="!packetInFlight"
      >
        📩 接收方发送 ACK
      </button>
      <button 
        class="btn-reset" 
        @click="reset"
      >
        🔄 重置
      </button>
    </div>

    <div class="status-text">
      {{ statusMsg }}
    </div>

    <div class="tips">
      <strong>Nagle 算法规则：</strong>
      <ul>
        <li>如果链路空闲（没有未确认的包），立即发送第一个字符</li>
        <li>如果有包在等待 ACK，后续字符先存入缓存</li>
        <li>收到 ACK 后，将缓存中的所有数据打包成一个大包发送</li>
        <li>这样可以减少小包的数量，提高传输效率</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputText = ref("")
const buffer = ref("") // 发送缓存
const packetInFlight = ref(false) // 链路上是否有未确认的包
const packetContent = ref("") // 当前飞行包的内容
const statusMsg = ref("准备就绪。")

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const newValue = target.value
  const char = newValue[newValue.length - 1] // 获取最新输入的字符
  
  if (!char || newValue.length <= inputText.value.length) {
    // 忽略删除键等
    inputText.value = newValue
    return
  }

  inputText.value = newValue

  // 核心算法逻辑：
  // 1. 如果没有包在飞（空闲），直接发送
  if (!packetInFlight.value) {
    sendPacket(char)
    statusMsg.value = `[Nagle] 链路空闲，"${char}" 立即发送！`
  } 
  // 2. 如果有包在飞，囤积到缓存
  else {
    buffer.value += char
    statusMsg.value = `[Nagle] 等待 ACK 中... "${char}" 存入缓存囤积。`
  }
}

const sendPacket = (data: string) => {
  packetContent.value = data
  packetInFlight.value = true
}

const receiveAck = () => {
  packetInFlight.value = false
  statusMsg.value = "收到 ACK！"

  // ACK 到达后，检查缓存有没有囤积的数据
  if (buffer.value.length > 0) {
    const chunk = buffer.value
    buffer.value = "" // 清空缓存
    // 发送囤积的大包
    setTimeout(() => {
      sendPacket(chunk)
      statusMsg.value += ` 把囤积的 "${chunk}" 打包发送！`
    }, 200)
  } else {
    statusMsg.value += " 缓存为空，等待新输入。"
  }
}

const reset = () => {
  inputText.value = ""
  buffer.value = ""
  packetInFlight.value = false
  packetContent.value = ""
  statusMsg.value = "准备就绪。"
}
</script>

<style scoped>
.tcp-nagle-algorithm {
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

.input-area {
  text-align: center;
  margin-bottom: 20px;
}

.input-area input {
  padding: 12px;
  font-size: 18px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 2px solid var(--vp-c-divider);
  border-radius: 6px;
  outline: none;
  transition: 0.3s;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.input-area input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
}

.pipeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0;
  min-height: 100px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  border: 1px solid var(--vp-c-divider);
}

.buffer-box {
  width: 150px;
  min-height: 60px;
  border: 2px dashed var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  text-align: center;
  padding: 10px;
  border-radius: 4px;
  transition: all 0.3s;
}

.buffer-has-data {
  border-color: #e67e22;
  color: #d35400;
  background: rgba(230, 126, 34, 0.1);
  font-weight: bold;
}

.packet {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  animation: pulse 1.5s infinite;
  z-index: 10;
}

.packet small {
  font-size: 11px;
  opacity: 0.9;
}

.receiver-label {
  font-weight: bold;
  color: var(--vp-c-text-1);
  font-size: 16px;
}

.control-area {
  text-align: center;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: 0.2s;
}

button:hover:not(:disabled) {
  background: #229954;
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

.status-text {
  text-align: center;
  color: var(--vp-c-text-1);
  font-size: 14px;
  margin-top: 15px;
  min-height: 30px;
  padding: 10px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border-left: 4px solid #3498db;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) scale(1.05);
  }
}

@media (max-width: 768px) {
  .pipeline {
    flex-direction: column;
    gap: 20px;
  }
  
  .packet {
    position: relative;
    left: auto;
    transform: none;
    margin: 10px 0;
  }
}
</style>


