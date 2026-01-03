# 5.2.2 UDP 的首部格式

UDP 数据报包含两个部分：**首部字段** 和 **数据字段**。

## 首部结构

- **首部开销**：只有 **8 字节**（64位）
- **四个字段**（每个字段 2 字节 = 16 位）：

| 字段名称 | 长度 | 说明 | 考点提示 |
| :--- | :--- | :--- | :--- |
| **源端口** | 2字节 | 源主机的端口号 | 需要对方回信时选用，不需要时可用全0 |
| **目的端口** | 2字节 | 目的主机的端口号 | **必须有**，终点交付报文时需要用它来分用 |
| **长度** | 2字节 | UDP用户数据报的整个长度（首部+数据） | 最小值为 8（仅有首部，无数据） |
| **检验和** | 2字节 | 检测UDP数据报在传输中是否有错 | 有错就丢弃。是**可选**的，不想计算可填全0 |

## UDP 首部结构图解

<style>
.udp-header-diagram {
    font-family: 'Courier New', monospace;
    max-width: 600px;
    margin: 20px 0;
    color: var(--vp-c-text-1);
}

.udp-header-diagram h4 {
    color: var(--vp-c-text-1);
}

.udp-header-diagram .bit-scale {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--vp-c-text-2);
    margin-bottom: 2px;
    padding: 0 5px;
}

.udp-header-diagram .row {
    display: flex;
    border-bottom: none;
    height: 50px;
}

.udp-header-diagram .pseudo-row {
    border: 1px dashed var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
}

.udp-header-diagram .real-row {
    border: 1px solid var(--vp-c-divider);
}

.udp-header-diagram .data-row {
    border: 1px solid var(--vp-c-divider);
}

.udp-header-diagram .field {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
}

.udp-header-diagram .pseudo-field {
    width: 100%;
    color: var(--vp-c-text-2);
}

.udp-header-diagram .pseudo-field-split {
    width: 25%;
    border-right: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-2);
}

.udp-header-diagram .pseudo-field-split:last-child {
    width: 50%;
    border-right: none;
}

.udp-header-diagram .udp-field {
    width: 50%;
    border-right: 1px solid var(--vp-c-divider);
    background-color: #74b9ff;
    color: #fff;
    flex-direction: column;
}

.udp-header-diagram .udp-field:last-child {
    border-right: none;
}

.udp-header-diagram .udp-field-size {
    font-size: 10px;
    color: rgba(255,255,255,0.8);
    margin-top: 4px;
}

.udp-header-diagram .data-field {
    width: 100%;
    background-color: #a29bfe;
    color: white;
}
</style>

<div class="udp-header-diagram">
    <h4>UDP 报文结构 (及伪首部)</h4>
    <div class="bit-scale">
        <span>0 bit</span><span>16 bit</span><span>31 bit</span>
    </div>
    <!-- 伪首部 -->
    <div class="row pseudo-row">
        <div class="field pseudo-field">源 IP 地址 (4字节) - 伪首部</div>
    </div>
    <div class="row pseudo-row">
        <div class="field pseudo-field">目的 IP 地址 (4字节) - 伪首部</div>
    </div>
    <div class="row pseudo-row">
        <div class="field pseudo-field-split">0</div>
        <div class="field pseudo-field-split">协议(17)</div>
        <div class="field pseudo-field-split">UDP 长度</div>
    </div>
    <!-- UDP 首部 -->
    <div class="row real-row">
        <div class="field udp-field">
            <span>源端口</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
        <div class="field udp-field">
            <span>目的端口</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
    </div>
    <div class="row real-row">
        <div class="field udp-field">
            <span>长度</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
        <div class="field udp-field">
            <span>检验和</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
    </div>
    <!-- 数据部分 -->
    <div class="row data-row">
        <div class="field data-field">数据部分 (如果有)</div>
    </div>
</div>

## UDP 被 IP 协议包装的完整结构

<style>
.ip-udp-diagram {
    font-family: 'Courier New', monospace;
    max-width: 600px;
    margin: 20px 0;
    color: var(--vp-c-text-1);
}

.ip-udp-diagram h4 {
    color: var(--vp-c-text-1);
    margin-bottom: 10px;
}

.ip-udp-diagram .bit-scale {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--vp-c-text-2);
    margin-bottom: 2px;
    padding: 0 5px;
}

.ip-udp-diagram .row {
    display: flex;
    border-bottom: none;
    height: 45px;
}

.ip-udp-diagram .ip-row {
    border: 2px solid #007bff;
    background-color: rgba(0, 123, 255, 0.1);
}

.ip-udp-diagram .udp-row {
    border: 2px solid #74b9ff;
    background-color: rgba(116, 185, 255, 0.1);
}

.ip-udp-diagram .data-row {
    border: 2px solid #a29bfe;
    background-color: rgba(162, 155, 254, 0.1);
}

.ip-udp-diagram .field {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 13px;
    padding: 5px;
}

.ip-udp-diagram .ip-field {
    width: 50%;
    border-right: 1px solid var(--vp-c-divider);
    color: #007bff;
}

.ip-udp-diagram .ip-field:last-child {
    border-right: none;
}

.ip-udp-diagram .udp-field {
    width: 50%;
    border-right: 1px solid var(--vp-c-divider);
    color: #74b9ff;
    flex-direction: column;
}

.ip-udp-diagram .udp-field:last-child {
    border-right: none;
}

.ip-udp-diagram .udp-field-size {
    font-size: 10px;
    color: var(--vp-c-text-2);
    margin-top: 2px;
}

.ip-udp-diagram .data-field {
    width: 100%;
    color: #a29bfe;
}

.ip-udp-diagram .label {
    font-size: 11px;
    color: var(--vp-c-text-2);
    margin-top: 5px;
    text-align: center;
}
</style>

<div class="ip-udp-diagram">
    <h4>IP 数据报结构（UDP 被 IP 协议包装）</h4>
    <div class="bit-scale">
        <span>0 bit</span><span>16 bit</span><span>31 bit</span>
    </div>
    <!-- IP 首部 -->
    <div class="row ip-row">
        <div class="field ip-field">版本、首部长度、服务类型</div>
        <div class="field ip-field">总长度、标识</div>
    </div>
    <div class="row ip-row">
        <div class="field ip-field">标志、片偏移</div>
        <div class="field ip-field">生存时间、协议(17)、首部检验和</div>
    </div>
    <div class="row ip-row">
        <div class="field ip-field" style="width: 100%;">源 IP 地址 (4字节)</div>
    </div>
    <div class="row ip-row">
        <div class="field ip-field" style="width: 100%;">目的 IP 地址 (4字节)</div>
    </div>
    <div class="label">IP 首部（通常 20 字节，最小）</div>
    <!-- UDP 首部（作为 IP 的数据部分） -->
    <div class="row udp-row">
        <div class="field udp-field">
            <span>源端口</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
        <div class="field udp-field">
            <span>目的端口</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
    </div>
    <div class="row udp-row">
        <div class="field udp-field">
            <span>长度</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
        <div class="field udp-field">
            <span>检验和</span>
            <span class="udp-field-size">2 Bytes</span>
        </div>
    </div>
    <div class="label">UDP 首部（8 字节）</div>
    <!-- UDP 数据部分 -->
    <div class="row data-row">
        <div class="field data-field">UDP 数据部分</div>
    </div>
    <div class="label">UDP 数据（应用层数据）</div>
</div>

**说明**：
- UDP 用户数据报（UDP首部 + UDP数据）作为 **IP 数据报的数据部分**
- IP 协议在 UDP 数据报前面加上 IP 首部，形成完整的 IP 数据报
- IP 首部中的**协议字段值为 17**，表示数据部分是 UDP
- IP 首部中的**总长度字段** = IP首部长度 + UDP首部长度 + UDP数据长度

## 伪首部 (Pseudo-header)

- **概念**：伪首部**不是**UDP报文真正的首部，它**不会**在网络上传送
- **作用**：仅仅是为了在计算检验和时，验证数据是否真的到达了正确的目的IP地址（包含源IP、目的IP、协议号等信息）
- **组成**：
  - 源 IP 地址 (4字节)
  - 目的 IP 地址 (4字节)
  - 0 (1字节) + 协议号 (1字节，UDP为17) + UDP 长度 (2字节)
- *考法*：综合题可能会问"计算UDP检验和时，需要把什么内容加在一起计算？" 答案是：**伪首部 + 首部 + 数据**

---

## UDP 检验和计算示例

**重要原则**：UDP 的检验和是把**首部**和**数据部分**一起都检验。

<style>
.checksum-demo {
    font-family: 'Courier New', monospace;
    padding: 20px;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    max-width: 900px;
    margin: 20px 0;
    color: var(--vp-c-text-1);
}

.checksum-demo h4 {
    margin-top: 0;
    color: var(--vp-c-text-1);
    border-bottom: 2px solid var(--vp-c-divider);
    padding-bottom: 10px;
}

.checksum-section {
    margin: 20px 0;
    padding: 15px;
    background: var(--vp-c-bg-alt);
    border-radius: 6px;
    border-left: 4px solid #74b9ff;
}

.checksum-section.pseudo {
    border-left-color: #a29bfe;
}

.checksum-section.udp-header {
    border-left-color: #74b9ff;
}

.checksum-section.data {
    border-left-color: #00b894;
}

.checksum-section.calculation {
    border-left-color: #fdcb6e;
}

.checksum-section.result {
    border-left-color: #e17055;
}

.checksum-section-title {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 15px;
    color: var(--vp-c-text-1);
}

.checksum-row {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed var(--vp-c-divider);
    font-size: 13px;
}

.checksum-row:last-child {
    border-bottom: none;
}

.checksum-label {
    width: 180px;
    color: var(--vp-c-text-2);
    font-weight: 500;
}

.checksum-value {
    width: 120px;
    color: var(--vp-c-text-1);
    font-weight: bold;
    text-align: center;
}

.checksum-binary {
    flex: 1;
    font-family: 'Courier New', monospace;
    color: #0984e3;
    font-size: 12px;
    letter-spacing: 1px;
}

.checksum-binary .bit {
    display: inline-block;
    width: 8px;
    text-align: center;
}

.checksum-note {
    font-size: 11px;
    color: var(--vp-c-text-2);
    font-style: italic;
    margin-top: 5px;
}

.calculation-steps {
    background: var(--vp-c-bg);
    padding: 15px;
    border-radius: 4px;
    margin: 10px 0;
}

.calculation-step {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    padding: 5px 0;
    color: var(--vp-c-text-1);
}

.calculation-step.operator {
    color: var(--vp-c-text-2);
    text-align: center;
    padding: 5px 0;
}

.calculation-step.result {
    border-top: 2px solid var(--vp-c-divider);
    margin-top: 10px;
    padding-top: 10px;
    font-weight: bold;
    color: #e17055;
}

.calculation-step.final {
    border-top: 2px solid #e17055;
    margin-top: 15px;
    padding-top: 15px;
    font-weight: bold;
    color: #e17055;
    font-size: 14px;
}

.calculation-step .comment {
    color: var(--vp-c-text-2);
    font-style: italic;
    margin-left: 10px;
}

.invert-demo {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 15px;
    background: var(--vp-c-bg);
    border-radius: 4px;
    margin: 10px 0;
}

.invert-item {
    text-align: center;
}

.invert-label {
    font-size: 11px;
    color: var(--vp-c-text-2);
    margin-bottom: 5px;
}

.invert-binary {
    font-family: 'Courier New', monospace;
    font-size: 14px;
    color: var(--vp-c-text-1);
    letter-spacing: 2px;
    font-weight: bold;
}

.invert-arrow {
    font-size: 20px;
    color: var(--vp-c-text-2);
}

.key-points {
    background: var(--vp-c-bg-alt);
    padding: 15px;
    border-radius: 6px;
    margin-top: 20px;
}

.key-points ul {
    margin: 0;
    padding-left: 20px;
}

.key-points li {
    margin: 8px 0;
    font-size: 13px;
    color: var(--vp-c-text-1);
}
</style>

<style>
.checksum-table {
    width: 100%;
    max-width: 900px;
    margin: 20px 0;
    border-collapse: collapse;
    font-size: 13px;
    background: var(--vp-c-bg);
}

.checksum-table th {
    background: var(--vp-c-bg-soft);
    padding: 10px;
    text-align: left;
    border: 1px solid var(--vp-c-divider);
    font-weight: bold;
    color: var(--vp-c-text-1);
}

.checksum-table td {
    padding: 8px 10px;
    border: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-1);
}

.checksum-table .pseudo-header {
    background: rgba(162, 155, 254, 0.1);
}

.checksum-table .udp-header-row {
    background: rgba(116, 185, 255, 0.1);
}

.checksum-table .data-row {
    background: rgba(0, 184, 148, 0.1);
}

.checksum-table .section-header {
    text-align: center;
    font-weight: bold;
    background: var(--vp-c-bg-soft);
    font-size: 14px;
}

.checksum-table .field-name {
    font-weight: 600;
    color: var(--vp-c-text-1);
    width: 200px;
}

.checksum-table .field-value {
    text-align: center;
    font-weight: bold;
    color: var(--vp-c-text-1);
    width: 120px;
}

.checksum-table .field-binary {
    font-family: 'Courier New', monospace;
    color: #0984e3;
    font-size: 12px;
    letter-spacing: 1px;
    text-align: left;
}

.checksum-table .note {
    font-size: 11px;
    color: var(--vp-c-text-2);
    font-style: italic;
    padding: 5px 10px;
}
</style>

<div class="checksum-demo">
    <h4>计算 UDP 检验和的例子</h4>
    <!-- 示例数据说明 -->
    <div style="margin-bottom: 20px; padding: 10px; background: var(--vp-c-bg); border-radius: 4px; font-size: 12px;">
        <strong>示例数据：</strong>源IP: 153.19.8.104 | 目的IP: 171.3.14.11 | 源端口: 1087 | 目的端口: 13 | UDP长度: 15 | 数据: 7字节（填充1字节0）
    </div>
    <table class="checksum-table">
        <thead>
            <tr>
                <th style="width: 25%;">字段名称</th>
                <th style="width: 15%;">值</th>
                <th style="width: 60%;">二进制表示（16位）</th>
            </tr>
        </thead>
        <tbody>
            <!-- 伪首部 -->
            <tr class="pseudo-header">
                <td colspan="3" class="section-header">12 字节 伪首部</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">源IP前2字节</td>
                <td class="field-value">153.19</td>
                <td class="field-binary">10011001 00010011</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">源IP后2字节</td>
                <td class="field-value">8.104</td>
                <td class="field-binary">00001000 01101000</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">目的IP前2字节</td>
                <td class="field-value">171.3</td>
                <td class="field-binary">10101011 00000011</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">目的IP后2字节</td>
                <td class="field-value">14.11</td>
                <td class="field-binary">00001110 00001011</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">全0 + 协议(17)</td>
                <td class="field-value">0, 17</td>
                <td class="field-binary">00000000 00010001</td>
            </tr>
            <tr class="pseudo-header">
                <td class="field-name">UDP长度</td>
                <td class="field-value">15</td>
                <td class="field-binary">00000000 00001111</td>
            </tr>
            <!-- UDP首部 -->
            <tr class="udp-header-row">
                <td colspan="3" class="section-header">8 字节 UDP 首部</td>
            </tr>
            <tr class="udp-header-row">
                <td class="field-name">源端口</td>
                <td class="field-value">1087</td>
                <td class="field-binary">00000100 01111111</td>
            </tr>
            <tr class="udp-header-row">
                <td class="field-name">目的端口</td>
                <td class="field-value">13</td>
                <td class="field-binary">00000000 00001101</td>
            </tr>
            <tr class="udp-header-row">
                <td class="field-name">UDP长度</td>
                <td class="field-value">15</td>
                <td class="field-binary">00000000 00001111</td>
            </tr>
            <tr class="udp-header-row">
                <td class="field-name">检验和（初始为0）</td>
                <td class="field-value">0</td>
                <td class="field-binary">00000000 00000000</td>
            </tr>
            <!-- 数据部分 -->
            <tr class="data-row">
                <td colspan="3" class="section-header">7 字节 数据（填充1字节0后为8字节）</td>
            </tr>
            <tr class="data-row">
                <td class="field-name">数据前2字节</td>
                <td class="field-value">数据</td>
                <td class="field-binary">01010100 01000101</td>
            </tr>
            <tr class="data-row">
                <td class="field-name">数据中2字节</td>
                <td class="field-value">数据</td>
                <td class="field-binary">01010011 01010100</td>
            </tr>
            <tr class="data-row">
                <td class="field-name">数据中2字节</td>
                <td class="field-value">数据</td>
                <td class="field-binary">01001001 01001110</td>
            </tr>
            <tr class="data-row">
                <td class="field-name">数据最后1字节 + 填充0</td>
                <td class="field-value">数据 + 0</td>
                <td class="field-binary">01000111 00000000</td>
            </tr>
            <tr class="data-row">
                <td colspan="3" class="note">注：数据长度为奇数时，需要填充1字节0使其成为偶数长度</td>
            </tr>
        </tbody>
    </table>
    <!-- 计算步骤 -->
    <div class="checksum-section calculation">
        <div class="checksum-section-title">按二进制反码运算求和</div>
        <div class="calculation-steps">
            <div class="calculation-step">10011001 00010011 <span class="comment">(153.19)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00001000 01101000 <span class="comment">(8.104)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">10101011 00000011 <span class="comment">(171.3)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00001110 00001011 <span class="comment">(14.11)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000000 00010001 <span class="comment">(0, 17)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000000 00001111 <span class="comment">(15)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000100 01111111 <span class="comment">(源端口1087)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000000 00001101 <span class="comment">(目的端口13)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000000 00001111 <span class="comment">(UDP长度15)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">00000000 00000000 <span class="comment">(检验和0)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">01010100 01000101 <span class="comment">(数据)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">01010011 01010100 <span class="comment">(数据)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">01001001 01001110 <span class="comment">(数据)</span></div>
            <div class="calculation-step operator">+</div>
            <div class="calculation-step">01000111 00000000 <span class="comment">(数据+填充0)</span></div>
            <div class="calculation-step result">────────────────────────────────</div>
            <div class="calculation-step result">10010110 11101101 <span class="comment">(求和得出的结果)</span></div>
        </div>
    </div>
    <!-- 求反码 -->
    <div class="checksum-section result">
        <div class="checksum-section-title">将得出的结果求反码</div>
        <div class="invert-demo">
            <div class="invert-item">
                <div class="invert-label">求和结果</div>
                <div class="invert-binary">10010110 11101101</div>
            </div>
            <div class="invert-arrow">→</div>
            <div class="invert-item">
                <div class="invert-label">求反码后（检验和）</div>
                <div class="invert-binary" style="color: #e17055;">01101001 00010010</div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 15px; font-size: 14px; color: var(--vp-c-text-1);">
            <strong>最终检验和：</strong>
            <span style="font-family: 'Courier New', monospace; color: #e17055; font-weight: bold;">
                01101001 00010010
            </span>
            <span style="margin-left: 10px; color: var(--vp-c-text-2);">(二进制)</span>
            <span style="margin-left: 10px; font-family: 'Courier New', monospace; color: #e17055; font-weight: bold;">
                0x6912
            </span>
            <span style="margin-left: 10px; color: var(--vp-c-text-2);">(十六进制)</span>
        </div>
    </div>
    <!-- 关键要点 -->
    <div class="key-points">
        <div style="font-weight: bold; margin-bottom: 10px; color: var(--vp-c-text-1);">关键要点：</div>
        <ul>
            <li><strong>数据填充</strong>：如果数据部分长度为奇数，需要填充1字节0，使其成为偶数长度</li>
            <li><strong>检验范围</strong>：伪首部 + UDP首部 + 数据部分（包括填充）</li>
            <li><strong>计算方法</strong>：二进制反码求和，然后对结果取反码</li>
            <li><strong>接收端验证</strong>：接收方用相同方法计算，如果结果全为1（或检验和字段为0），说明无错误</li>
        </ul>
    </div>
</div>

---

## 🎓 考试重点总结

### UDP首部 (填空/综合题)

- 记住 **8字节**
- 能画出简单的结构图（源端口、目的端口、长度、检验和）
- 理解**长度**字段包含了首部和数据，所以最小是8

### 差错检测 (综合题难点)

- 必须知道**伪首部**的存在
- 计算检验和时，二进制反码求和（如果不考计算，至少要知道原理是把伪首部加进去算）
- 如果接收方算出检验和有错，直接**丢弃**

### 端口分用

- 当UDP数据报到达主机时，是根据**目的端口号**将其交付给相应的应用进程的
- 如果找不到对应端口，会发送ICMP端口不可达报文

