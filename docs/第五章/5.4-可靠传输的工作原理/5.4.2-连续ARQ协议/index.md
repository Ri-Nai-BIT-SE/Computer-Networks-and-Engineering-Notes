# 5.4.2 连续 ARQ 协议 (Continuous ARQ Protocol)

如果说 5.4.1 的"停止等待协议"是发一个等一个的**单车道**，那么 5.4.2 就是**多车道流水线**。

这一节是 TCP **滑动窗口**机制的理论原型。考试中，这里最喜欢考**"累积确认"**的概念以及**"回退 N (Go-Back-N)"**的机制。

---

## 1. 核心概念：流水线传输

* **发送窗口 (Sending Window)**：
  - 发送方维持一个窗口（比如大小为 5）。
  - 位于窗口内的分组（比如 1, 2, 3, 4, 5），发送方**不需要等待确认**，可以连续发出去。
  - *作用*：填满信道，极大提高信道利用率。

* **滑动窗口 (Sliding Window)**：
  - 每收到一个确认，窗口就向前滑动一位，把新的分组包进来，允许发送新数据。

---

## 2. 关键机制：累积确认 (Cumulative Acknowledgment) ★★★

这是考试**必考**的选择题/填空题考点。

* **定义**：接收方**不需要**对每个分组逐一发送 ACK。接收方收到几个分组后，**只对按序到达的最后一个分组发送确认**。
* **含义**：如果收到 `ACK 5`，表示 **"5号及以前的所有分组（1, 2, 3, 4, 5）我都收到了"**。
* **优点**：容易实现，信道开销小。即使中间某个 ACK（比如 ACK 3）丢了，只要 ACK 5 到了，发送方就知道 3 肯定也到了。
* **缺点**：不能反映中间缺失的情况（见下文的回退 N）。

---

## 3. 异常处理：回退 N (Go-Back-N, GBN) ★★★

这是连续 ARQ 协议最大的弱点，也是**大题分析**的重点。

* **场景**：发送方发了 1, 2, 3, 4, 5。
* **故障**：**分组 3 丢了**，但是 1, 2, 4, 5 都到了。
* **接收方逻辑**：
  1. 收到 1, 2 -> 正常，发 `ACK 2`。
  2. 收到 4 -> **乱序了！**（想要 3，来了 4）。接收方**丢弃** 4，重复发送 `ACK 2`。
  3. 收到 5 -> **乱序了！** 接收方**丢弃** 5，重复发送 `ACK 2`。
* **发送方逻辑**：
  - 收到 `ACK 2`，窗口滑到 3。
  - 迟迟收不到 3 的确认，**超时计时器**响了。
  - **回退 N**：虽然 4 和 5 其实到了，但发送方不知道。它必须**重传 3，以及 3 后面所有已发送的分组 (4, 5)**。
* **结论**：当网络质量不好时，GBN 会导致大量不必要的重传，浪费带宽。

---

## 🟢 [静态演示]：滑动窗口与回退 N

下面用静态图示展示**累积确认**和**回退 N**的工作过程。

<style>
.gbn-demo {
    font-family: 'Segoe UI', sans-serif;
    padding: 20px;
    background: var(--vp-c-bg-soft);
    border-radius: 8px;
    border: 1px solid var(--vp-c-divider);
    max-width: 800px;
    margin: 20px 0;
    color: var(--vp-c-text-1);
}

.gbn-demo h4 {
    margin-top: 0;
    color: var(--vp-c-text-1);
    border-bottom: 2px solid var(--vp-c-divider);
    padding-bottom: 10px;
}

.gbn-demo .scenario {
    margin: 25px 0;
    padding: 15px;
    background: var(--vp-c-bg-alt);
    border-radius: 6px;
    border-left: 4px solid #3498db;
}

.gbn-demo .scenario-title {
    font-weight: bold;
    font-size: 15px;
    color: var(--vp-c-text-1);
    margin-bottom: 15px;
}

.gbn-demo .track-container {
    position: relative;
    background: var(--vp-c-bg);
    border: 2px solid var(--vp-c-divider);
    border-radius: 4px;
    padding: 20px;
    margin: 15px 0;
    min-height: 120px;
}

.gbn-demo .track {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    position: relative;
}

.gbn-demo .packet {
    width: 45px;
    height: 45px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    color: white;
    position: relative;
}

.gbn-demo .packet.unsent {
    background: #bdc3c7;
    color: #7f8c8d;
}

.gbn-demo .packet.sent {
    background: #3498db;
}

.gbn-demo .packet.acked {
    background: #27ae60;
}

.gbn-demo .packet.lost {
    background: #e74c3c;
    opacity: 0.5;
    border: 2px dashed #c0392b;
}

.gbn-demo .packet.discard {
    background: #95a5a6;
    text-decoration: line-through;
    opacity: 0.6;
}

.gbn-demo .packet.retransmit {
    background: #e67e22;
    border: 2px solid #d35400;
}

.gbn-demo .window-frame {
    position: absolute;
    border: 3px solid #e67e22;
    border-radius: 6px;
    pointer-events: none;
    box-shadow: 0 0 10px rgba(230, 126, 34, 0.3);
    background: rgba(230, 126, 34, 0.1);
}

.gbn-demo .window-label {
    position: absolute;
    top: -22px;
    left: 0;
    color: #e67e22;
    font-size: 11px;
    font-weight: bold;
    white-space: nowrap;
}

.gbn-demo .step-description {
    font-size: 12px;
    color: var(--vp-c-text-2);
    margin-top: 10px;
    padding: 8px;
    background: var(--vp-c-bg);
    border-radius: 3px;
    line-height: 1.6;
}

.gbn-demo .note-box {
    margin-top: 15px;
    padding: 12px;
    background: var(--vp-c-bg);
    border-left: 3px solid #f39c12;
    border-radius: 3px;
    font-size: 12px;
    color: var(--vp-c-text-1);
}

.gbn-demo .scenario.normal {
    border-left-color: #27ae60;
}

.gbn-demo .scenario.gbn {
    border-left-color: #e74c3c;
}

.gbn-demo .arrow {
    font-size: 18px;
    color: var(--vp-c-text-2);
    margin: 0 5px;
}

.gbn-demo .status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
    margin-left: 5px;
}

.gbn-demo .status-badge.success {
    background: #27ae60;
    color: white;
}

.gbn-demo .status-badge.error {
    background: #e74c3c;
    color: white;
}

.gbn-demo .status-badge.warning {
    background: #f39c12;
    color: white;
}
</style>

<div class="gbn-demo">
    <h4>🔄 连续 ARQ (回退 N) 演示</h4>
    <!-- 情况1：正常传输（累积确认） -->
    <div class="scenario normal">
        <div class="scenario-title">情况 1：正常传输（累积确认）</div>
        <div class="track-container">
            <div class="track">
                <div class="packet acked">1</div>
                <div class="packet acked">2</div>
                <div class="packet acked">3</div>
                <div class="packet acked">4</div>
                <div class="packet acked">5</div>
                <div class="packet unsent">6</div>
                <div class="packet unsent">7</div>
                <div class="packet unsent">8</div>
            </div>
            <div class="window-frame" style="left: 20px; top: 20px; width: 265px; height: 45px;">
                <div class="window-label">发送窗口 (Size 5) - 已滑动</div>
            </div>
        </div>
        <div class="step-description">
            <strong>步骤说明：</strong><br>
            1. 发送方连续发送分组 [1, 2, 3, 4, 5]（窗口内分组）<br>
            2. 接收方按序收到所有分组，发送累积确认 <strong>ACK 5</strong><br>
            3. 发送方收到 ACK 5，知道 1-5 都已收到，窗口向前滑动 5 位<br>
            4. 现在窗口包含 [6, 7, 8, 9, 10]，可以继续发送
        </div>
        <div class="note-box">
            ✅ <strong>累积确认的优势</strong>：即使 ACK 3 丢失了，只要收到 ACK 5，发送方就知道 1-5 都收到了，无需重传
        </div>
    </div>
    <!-- 情况2：回退N -->
    <div class="scenario gbn">
        <div class="scenario-title">情况 2：回退 N (Go-Back-N) - 分组 3 丢失</div>
        <!-- 阶段1：发送和丢失 -->
        <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: var(--vp-c-text-1);">
                阶段 1：发送分组 [1, 2, 3, 4, 5]，分组 3 丢失
            </div>
            <div class="track-container">
                <div class="track">
                    <div class="packet sent">1</div>
                    <div class="packet sent">2</div>
                    <div class="packet lost">3</div>
                    <div class="packet sent">4</div>
                    <div class="packet sent">5</div>
                    <div class="packet unsent">6</div>
                    <div class="packet unsent">7</div>
                    <div class="packet unsent">8</div>
                </div>
                <div class="window-frame" style="left: 20px; top: 20px; width: 265px; height: 45px;">
                    <div class="window-label">发送窗口 (Size 5)</div>
                </div>
            </div>
            <div class="step-description">
                <span class="status-badge error">分组 3 丢失</span> 分组 1, 2 正常到达，分组 4, 5 也到达了但乱序
            </div>
        </div>
        <!-- 阶段2：接收方处理 -->
        <div style="margin-bottom: 20px;">
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: var(--vp-c-text-1);">
                阶段 2：接收方丢弃乱序分组，重复发送 ACK 2
            </div>
            <div class="track-container">
                <div class="track">
                    <div class="packet acked">1</div>
                    <div class="packet acked">2</div>
                    <div class="packet lost">3</div>
                    <div class="packet discard">4</div>
                    <div class="packet discard">5</div>
                    <div class="packet unsent">6</div>
                    <div class="packet unsent">7</div>
                    <div class="packet unsent">8</div>
                </div>
            </div>
            <div class="step-description">
                <strong>接收方逻辑：</strong><br>
                • 收到分组 1, 2 → 正常，发送 <strong>ACK 2</strong><br>
                • 收到分组 4 → <span class="status-badge warning">乱序！</span> 期望收到 3，却来了 4。丢弃分组 4，重复发送 <strong>ACK 2</strong><br>
                • 收到分组 5 → <span class="status-badge warning">乱序！</span> 丢弃分组 5，重复发送 <strong>ACK 2</strong>
            </div>
        </div>
        <!-- 阶段3：超时重传 -->
        <div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: var(--vp-c-text-1);">
                阶段 3：发送方超时，执行回退 N，重传 [3, 4, 5]
            </div>
            <div class="track-container">
                <div class="track">
                    <div class="packet acked">1</div>
                    <div class="packet acked">2</div>
                    <div class="packet retransmit">3</div>
                    <div class="packet retransmit">4</div>
                    <div class="packet retransmit">5</div>
                    <div class="packet unsent">6</div>
                    <div class="packet unsent">7</div>
                    <div class="packet unsent">8</div>
                </div>
                <div class="window-frame" style="left: 20px; top: 20px; width: 265px; height: 45px;">
                    <div class="window-label">发送窗口 (Size 5) - 等待确认</div>
                </div>
            </div>
            <div class="step-description">
                <strong>发送方逻辑：</strong><br>
                • 收到 ACK 2，窗口滑动到位置 3<br>
                • 超时计时器响起，未收到 ACK 3<br>
                • <span class="status-badge error">回退 N</span>：虽然分组 4, 5 其实已经到达，但发送方不知道<br>
                • 必须重传分组 3，以及 3 后面所有已发送的分组 (4, 5)
            </div>
        </div>
        <div class="note-box">
            ⚠️ <strong>回退 N 的缺点</strong>：当网络质量不好时，会导致大量不必要的重传（分组 4, 5 明明到了却被重传），浪费带宽。这就是为什么后来有了"选择重传 (Selective Repeat)"协议。
        </div>
    </div>
</div>

---

## 4. 考试避坑指南

### 考点一：ACK 的含义

* **题目**：收到 ACK 500。
* **含义**：**500号及之前**的数据都收到了（期待收到 501）。
* *注意*：如果是 TCP，通常 ACK 指的是"期待收到的下一个序号"，即收到 ACK 501 表示收到 500。**考试时请注意看题目中对 ACK 的定义**（谢希仁教材中，连续 ARQ 协议的 ACK $n$ 通常指"收到 $n$"）。

### 考点二：重传范围

* **题目**：窗口大小为 N，发送了序号 1 到 N，其中第 2 个丢失了。
* **问**：需要重传多少个？
* **答**：重传 **第 2 个到第 N 个**（共 N-1 个）。因为第 2 个之后的虽然到了，但因为乱序被扔掉了。

### 考点三：优点与缺点

* **优点**：信道利用率高（流水线）。
* **缺点**：线路质量差时，重传量大，效率极低。

---

## 🎓 易错点提醒

1. **累积确认 vs 逐个确认**：
   - 累积确认：收到 ACK 5 表示 1-5 都收到
   - 逐个确认：每个分组都需要单独的 ACK（停止等待协议）

2. **回退 N 的重传范围**：
   - 不是只重传丢失的分组
   - 而是重传丢失分组及其**之后所有已发送的分组**

3. **窗口滑动时机**：
   - 收到累积确认后，窗口向前滑动
   - 窗口大小保持不变，只是位置移动

4. **与停止等待协议的区别**：
   - 停止等待：发一个等一个，效率低
   - 连续 ARQ：流水线发送，效率高，但需要处理乱序和重传


