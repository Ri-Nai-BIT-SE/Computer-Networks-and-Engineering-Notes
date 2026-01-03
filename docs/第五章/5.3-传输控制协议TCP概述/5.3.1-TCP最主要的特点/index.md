# 5.3.1 TCP 最主要的特点 (★必考背诵)

TCP 是一个复杂的协议，但其核心特点可以概括为 5 点：

1. **面向连接**：
   - 应用程序在使用 TCP 协议之前，必须先建立 TCP 连接（三次握手）。传输完毕后，必须释放连接（四次挥手）。
   - *对比*：UDP 是无连接的。

2. **每一条 TCP 连接只能是"点对点"的 (Point-to-Point)**：
   - **一对一**。
   - *考点*：TCP **不**支持广播（Broadcast）和多播（Multicast）。凡是听到"广播"，那一定是用 UDP（或者网络层的 IGMP/ICMP 等），绝不是 TCP。

3. **提供可靠交付的服务**：
   - 通过 TCP 连接传送的数据，**无差错、不丢失、不重复、并且按序到达**。
   - *原理*：依赖确认机制、重传机制、滑动窗口等（5.4节会细讲）。

4. **提供全双工通信 (Full-Duplex)**：
   - 连接的两端都设有**发送缓存**和**接收缓存**。
   - 数据可以在两个方向上同时传输。
   - TCP 软件会自动决定何时发送数据（推送机制）。

5. **面向字节流 (Stream-Oriented)** (★最难理解的考点)：
   - **定义**：TCP 中的"流"（Stream）指的是流入或流出进程的**字节序列**。
   - **机制**：虽然应用层是一次发一个数据块（Message），但 TCP 把它们看作是一连串无结构的字节流。
   - **核心区别**：
     - **UDP（面向报文）**：发送方发 3 次，接收方就得收 3 次。保留报文边界。
     - **TCP（面向字节流）**：发送方发 10 个数据块，每个 10 字节；接收方可能一次性读出 100 字节，也可能分两次读出 50 字节。**TCP 不保证接收方读出的数据块大小与发送方一致，但保证字节内容和顺序完全一样。**

---

## 🟢 [深度演示]：什么是"面向字节流"？

为了让你理解**"发送次数 ≠ 接收次数"**，下面用静态图示展示 TCP 面向字节流的工作原理。

**核心概念**：发送方分3次发送了3个数据块（"AAA"、"BB"、"CCCC"），但在TCP接收缓存中，这些数据块**失去了边界**，变成了连续的字节流。接收方可以**一次性把所有数据读走**，完全无视你分了几次发送。这就是**"流"**——像水流一样，没有边界。

<style>
.tcp-stream-demo {
    font-family: 'Segoe UI', sans-serif;
    padding: 20px;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    max-width: 700px;
    margin: 20px 0;
    color: var(--vp-c-text-1);
}

.tcp-stream-demo h4 {
    margin-top: 0;
    color: var(--vp-c-text-1);
    border-bottom: 2px solid var(--vp-c-divider);
    padding-bottom: 10px;
}

.tcp-stream-demo .section {
    margin: 20px 0;
    padding: 15px;
    background: var(--vp-c-bg-alt);
    border-radius: 6px;
}

.tcp-stream-demo .section-title {
    font-weight: bold;
    font-size: 14px;
    color: var(--vp-c-text-1);
    margin-bottom: 10px;
}

.tcp-stream-demo .buffer-box {
    background: var(--vp-c-bg);
    border: 2px solid var(--vp-c-divider);
    min-height: 60px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 10px;
    margin: 10px 0;
    box-shadow: inset 2px 2px 5px rgba(0,0,0,0.1);
}

.tcp-stream-demo .byte-block {
    min-width: 30px;
    height: 40px;
    color: white;
    margin: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    border-radius: 3px;
    font-weight: bold;
}

.tcp-stream-demo .byte-block.type-a {
    background: #00b894;
}

.tcp-stream-demo .byte-block.type-b {
    background: #0984e3;
}

.tcp-stream-demo .byte-block.type-c {
    background: #6c5ce7;
}

.tcp-stream-demo .arrow {
    text-align: center;
    font-size: 24px;
    color: var(--vp-c-text-2);
    margin: 10px 0;
}

.tcp-stream-demo .output-box {
    background: var(--vp-c-bg);
    padding: 12px;
    border-radius: 4px;
    color: var(--vp-c-text-1);
    font-family: 'Courier New', monospace;
    font-size: 13px;
    border: 1px solid var(--vp-c-divider);
    margin-top: 10px;
}

.tcp-stream-demo .note {
    font-size: 12px;
    color: var(--vp-c-text-2);
    font-style: italic;
    margin-top: 10px;
    padding: 8px;
    background: var(--vp-c-bg);
    border-left: 3px solid #e17055;
    border-radius: 3px;
}
</style>

<div class="tcp-stream-demo">
    <h4>🌊 TCP 面向字节流 演示</h4>
    <div class="section">
        <div class="section-title">1. 发送方（应用层）分3次发送数据块：</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <div style="text-align: center;">
                <div style="font-size: 11px; color: var(--vp-c-text-2); margin-bottom: 5px;">第1次发送</div>
                <div class="buffer-box" style="width: 120px;">
                    <div class="byte-block type-a">A</div>
                    <div class="byte-block type-a">A</div>
                    <div class="byte-block type-a">A</div>
                </div>
                <div style="font-size: 11px; color: var(--vp-c-text-2);">"AAA" (3字节)</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 11px; color: var(--vp-c-text-2); margin-bottom: 5px;">第2次发送</div>
                <div class="buffer-box" style="width: 90px;">
                    <div class="byte-block type-b">B</div>
                    <div class="byte-block type-b">B</div>
                </div>
                <div style="font-size: 11px; color: var(--vp-c-text-2);">"BB" (2字节)</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 11px; color: var(--vp-c-text-2); margin-bottom: 5px;">第3次发送</div>
                <div class="buffer-box" style="width: 150px;">
                    <div class="byte-block type-c">C</div>
                    <div class="byte-block type-c">C</div>
                    <div class="byte-block type-c">C</div>
                    <div class="byte-block type-c">C</div>
                </div>
                <div style="font-size: 11px; color: var(--vp-c-text-2);">"CCCC" (4字节)</div>
            </div>
        </div>
    </div>
    <div class="arrow">↓</div>
    <div class="section">
        <div class="section-title">2. TCP 接收缓存（数据失去边界，变成连续的字节流）：</div>
        <div class="buffer-box">
            <div class="byte-block type-a">A</div>
            <div class="byte-block type-a">A</div>
            <div class="byte-block type-a">A</div>
            <div class="byte-block type-b">B</div>
            <div class="byte-block type-b">B</div>
            <div class="byte-block type-c">C</div>
            <div class="byte-block type-c">C</div>
            <div class="byte-block type-c">C</div>
            <div class="byte-block type-c">C</div>
        </div>
        <div style="font-size: 12px; color: var(--vp-c-text-2); text-align: center;">
            总共 9 个字节，边界已消失
        </div>
    </div>
    <div class="arrow">↓</div>
    <div class="section">
        <div class="section-title">3. 接收方（应用层）读取数据（两种方式）：</div>
        <div style="margin-bottom: 15px;">
            <div style="font-size: 13px; color: var(--vp-c-text-1); margin-bottom: 8px; font-weight: 500;">
                方式1：分次读取（每次读3个字节）
            </div>
            <div class="output-box">
                <div>第1次读取：<strong style="color: #00b894;">AAA</strong> (3字节)</div>
                <div>第2次读取：<strong style="color: #0984e3;">BBC</strong> (3字节)</div>
                <div>第3次读取：<strong style="color: #6c5ce7;">CCC</strong> (3字节)</div>
            </div>
            <div class="note">
                ⚠️ 注意：第2次读取时，读取了"BBC"，跨越了原来的数据块边界（"BB" + "C"）
            </div>
        </div>
        <div>
            <div style="font-size: 13px; color: var(--vp-c-text-1); margin-bottom: 8px; font-weight: 500;">
                方式2：一次性读取全部数据
            </div>
            <div class="output-box">
                一次性读取：<strong>AAABBCCCC</strong> (9字节)
            </div>
            <div class="note">
                ✅ 接收方可以一次性把所有数据读走，完全无视发送方分了几次发送
            </div>
        </div>
    </div>
    <div class="note" style="margin-top: 20px;">
        <strong>关键理解：</strong>TCP 不保证接收方读出的数据块大小与发送方一致，但保证字节内容和顺序完全一样。这就是"面向字节流"的核心特征。
    </div>
</div>

---

## 🎓 考试重点与避坑指南

### 1. 选择题高频坑点

* **关于全双工**：题目会问"TCP是半双工还是全双工？" 答案是**全双工**。这意味着两端都有发送缓存和接收缓存。
* **关于广播**：题目问"在一个局域网中，想要把一份数据同时发给所有主机，应该用 TCP 还是 UDP？" 答案是 **UDP**。TCP 只能一对一，绝对不支持广播。
* **关于字节流**：
  - 问："TCP 报文段的边界与应用层报文的边界有关吗？"
  - 答：**无关**。应用层给两个 500 字节的包，TCP 可能把它们合成一个 1000 字节的包发送，也可能拆成四个 250 字节的包。

### 2. 简答题/综合题预备

* **Socket 的概念**：如果题目让你写出 TCP 连接的表示形式，记得写 `(IP:Port)`。
* **同一个端口的连接**：
  - 问："Web服务器 80 端口只有一个，怎么同时服务 100 个客户？"
  - 答：因为 TCP 连接是由 **{源IP, 源端口, 目的IP, 目的端口}** 四元组唯一确定的。虽然目的端口都是 80，但源 IP 和源端口不同，所以是不同的 TCP 连接。

### 3. 为什么 TCP 不保留报文边界？（理解题）

* 因为 TCP 的目的是**可靠传输数据内容**，而不是传输"数据块的形状"。它只负责把水（数据）无损地运过去，至于你是用杯子接还是桶接，TCP 不管。这给了 TCP 极大的灵活性来进行**流量控制**和**拥塞控制**（后面章节会讲）。

