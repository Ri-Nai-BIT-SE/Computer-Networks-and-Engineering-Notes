# 1.7.5 TCP/IP的体系结构

## TCP/IP四层体系结构

### 应用层（Application Layer）
- **对应**：OSI的应用层、表示层、会话层
- **协议**：HTTP、FTP、SMTP、DNS、TELNET等

### 运输层（Transport Layer）
- **对应**：OSI的运输层
- **协议**：TCP、UDP

### 网际层（Internet Layer）
- **对应**：OSI的网络层
- **协议**：IP、ICMP、ARP、RARP等

### 网络接口层（Network Interface Layer）
- **对应**：OSI的数据链路层和物理层
- **说明**：没有具体内容，可以使用各种网络接口

## 沙漏计时器形状
- **特点**：TCP/IP协议栈呈沙漏计时器形状
- **含义**：
  - 中间窄：IP协议是核心，所有应用都通过IP协议
  - 上下宽：应用层和网络接口层都有多种协议选择
- **意义**：体现了IP协议在互联网中的核心地位

## TCP/IP与OSI的比较
| OSI | TCP/IP |
|-----|--------|
| 7层 | 4层 |
| 理论性强 | 实用性强 |
| 复杂 | 简单 |
| 未广泛应用 | 广泛应用 |



