### Benchmark: IP Trie with DPI Simulation

This trie isn't just for strings, it handles **real IP address operations** for security contexts, including simulated DPI and threat detection workloads.

📦 Dataset: 10K IPs + 5K threat entries  
🔁 500 iterations (50 warmup)  
🚀 Runtime: Node.js + TypeScript + GC optimization  
🌐 Use Case: Firewall, SIEM, Threat Detection, DPI, IP Intelligence

#### Key Results

| Operation                          | Ops/sec      | Avg Time (ms) | Memory Usage | Notes                        |
|-----------------------------------|--------------|----------------|--------------|------------------------------|
| Insert (IP Address)               | 26.51K       | 0.038          | 7.04 MB     | Basic KV insert              |
| Search (IP Address)               | 30.54K       | 0.033          | 8.24 MB     | Individual IP lookup         |
| Prefix Search (IP Subnet)         | **228.31K**  | 0.004          | 7.86 MB     | **Fastest op** - CIDR match  |
| Range Search (Multiple Subnets)   | 218.57K      | 0.005          | 8.31 MB     | Multi-subnet operations      |
| Delete (IP)                       | 26.49K       | 0.038          | 8.30 MB     | IP removal                   |
| **DPI: Malicious IP Detection**   | 20.03K       | 0.050          | 9.31 MB     | **Real-time threat analysis** |
| **Threat Intelligence Lookup**    | 31.83K       | 0.031          | 9.10 MB     | **Comprehensive risk assessment** |
| **Behavioral Analysis**           | 18.79K       | 0.053          | 7.75 MB     | **Dynamic threat scoring**   |
| **Subnet Threat Analysis**        | 26.56K       | 0.038          | 7.93 MB     | **Network-wide security**    |

#### Memory Efficiency

- 3,000 IPs with shared prefixes: **~1MB total**
- Nodes: 3,043
- Max depth: 13
- Avg depth: 11.23
- **Per-IP memory: ~348B** (highly efficient)

🟢 **Performance range:** 12× between fastest and slowest  
✅ **Fastest:** IP Subnet Prefix Search (228.31K ops/sec)  
🐌 **Slowest:** Behavioral Analysis (18.79K ops/sec)

---

### 🔴 Enhanced Security & DPI Features

#### **Malicious IP Detection (Deep Packet Inspection)**
- **Real-time threat analysis** with pattern matching
- **Known malicious IP ranges** (Tor exit nodes, suspicious subnets)
- **Threat level assessment** (low/medium/high/critical)
- **Reputation scoring** (0-100, lower = more malicious)

#### **Threat Intelligence Lookup**
- **Comprehensive risk factor analysis**
- **Attack history tracking** (frequency, types, timestamps)
- **ISP reputation assessment** (trusted/neutral/suspicious/malicious)
- **Geographic risk evaluation** (country/city-based threats)

#### **Behavioral Analysis (Real-time)**
- **Dynamic behavioral scoring** based on multiple factors
- **Port scan detection** and frequency analysis
- **DDoS participation** and botnet membership detection
- **VPN usage patterns** and Tor exit node identification
- **Time-based threat assessment** (recent attack analysis)

#### **Subnet Threat Analysis**
- **Network-wide security assessment** across entire subnets
- **Malicious IP percentage calculation** within ranges
- **Subnet reputation scoring** for firewall rules
- **Bulk threat detection** for network monitoring

---

### Security Use Cases

The trie supports realistic security workloads like:

- ✅ **Real-time DPI & IP lookup** with threat assessment
- ✅ **Threat intelligence mapping** and reputation tracking
- ✅ **Subnet analysis** for network-wide security
- ✅ **Firewall rule matching** with dynamic threat levels
- ✅ **Behavioral anomaly detection** and scoring
- ✅ **ISP geo-reputation tracking** and analysis
- ✅ **Security Information & Event Management (SIEM)**
- ✅ **Network traffic analysis & forensics**
- ✅ **Botnet & malware detection** systems
- ✅ **Intrusion Prevention Systems (IPS)**

---

### 🚀 Performance Improvements

**Latest updates include:**
- **Garbage collection optimization** for stable memory measurements
- **Memory sampling strategy** to avoid GC interference
- **Enhanced threat detection algorithms** for realistic DPI simulation
- **Improved behavioral analysis** with comprehensive risk factors
- **Subnet-wide security assessment** capabilities

**Memory measurement fixes:**
- ✅ **No more negative memory values** (fixed GC timing issues)
- ✅ **Stable memory reporting** with median sampling
- ✅ **Realistic memory usage** per operation