import { Trie, TrieStats } from "../src";

// Benchmark configuration
interface BenchmarkConfig {
  iterations: number;
  warmupIterations: number;
  ipCount: number;
}

interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  memoryUsed?: number;
}

interface IPData {
  country: string;
  city: string;
  isp: string;
  latitude: number;
  longitude: number;
  lastSeen: Date;
}

// Enhanced IP data for security/threat intelligence
interface SecurityIPData extends IPData {
  threatLevel: "low" | "medium" | "high" | "critical";
  threatTypes: string[];
  reputationScore: number; // 0-100, lower = more malicious
  firstSeen: Date;
  attackCount: number;
  lastAttack: Date;
  ispReputation: "trusted" | "neutral" | "suspicious" | "malicious";
  geolocationRisk: "low" | "medium" | "high";
  portScanAttempts: number;
  ddosParticipation: boolean;
  botnetMember: boolean;
  torExitNode: boolean;
  vpnUsage: boolean;
}

class IPAddressTrieBenchmark {
	private config: BenchmarkConfig;
	private testIPs: string[] = [];
	private testData: IPData[] = [];
	private securityIPs: string[] = [];
	private securityData: SecurityIPData[] = [];
	private prefixIPs: string[] = [];
	private maliciousPatterns: string[] = [];

	constructor(config: Partial<BenchmarkConfig> = {}) {
		this.config = {
			iterations: 1000,
			warmupIterations: 100,
			ipCount: 10000,
			...config
		};

		// Generate realistic IP test data
		this.generateTestData();
		this.generateSecurityData();
	}

	private generateTestData(): void {
		this.testIPs = [];
		this.testData = [];
		this.prefixIPs = [];

		const countries = ["US", "CA", "UK", "DE", "FR", "JP", "AU", "BR", "IN", "CN"];
		const cities = ["New York", "Toronto", "London", "Berlin", "Paris", "Tokyo", "Sydney", "São Paulo", "Mumbai", "Beijing"];
		const isps = ["Comcast", "Rogers", "BT", "Deutsche Telekom", "Orange", "NTT", "Telstra", "Vivo", "BSNL", "China Telecom"];

		// Generate realistic IP addresses with rich metadata
		for (let i = 0; i < this.config.ipCount; i++) {
			// Generate IPv4 addresses in different ranges
			let ip: string;
			if (i < this.config.ipCount * 0.4) {
				// Private IP ranges
				ip = `192.168.${Math.floor(i / 256)}.${i % 256}`;
			} else if (i < this.config.ipCount * 0.7) {
				// Public IP ranges
				ip = `203.${Math.floor(i / 256)}.${Math.floor((i % 256) / 256)}.${i % 256}`;
			} else {
				// Other public ranges
				ip = `10.${Math.floor(i / 256)}.${Math.floor((i % 256) / 256)}.${i % 256}`;
			}
      
			this.testIPs.push(ip);
			this.testData.push({
				country: countries[i % countries.length],
				city: cities[i % cities.length],
				isp: isps[i % isps.length],
				latitude: (Math.random() - 0.5) * 180, // -90 to 90
				longitude: (Math.random() - 0.5) * 360, // -180 to 180
				lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
			});

			// Collect prefix IPs for testing (subnet ranges)
			if (i < 100) {
				const parts = ip.split(".");
				this.prefixIPs.push(`${parts[0]}.${parts[1]}.${parts[2]}`); // /24 subnet
			}
		}

		// Remove duplicates from prefix IPs
		this.prefixIPs = [...new Set(this.prefixIPs)];
	}

	private generateSecurityData(): void {
		this.securityIPs = [];
		this.securityData = [];
		this.maliciousPatterns = [];

		const threatTypes = [
			"port_scan", "ddos", "brute_force", "sql_injection", "xss", 
			"malware_distribution", "phishing", "botnet", "tor_exit", "vpn_abuse"
		];
    
		const countries = ["US", "CN", "RU", "IR", "KP", "VN", "BR", "IN", "NG", "TR"];
		const cities = ["Moscow", "Beijing", "Tehran", "Pyongyang", "Hanoi", "Brasília", "New Delhi", "Lagos", "Istanbul"];
		const isps = ["Rostelecom", "China Telecom", "Iran Telecom", "Korea Telecom", "Viettel", "Vivo", "BSNL", "MTN", "Turk Telekom"];

		// Generate malicious IP patterns for DPI simulation
		const maliciousRanges = [
			"185.220.101", "185.220.102", "185.220.103", // Known Tor exit nodes
			"45.95.147", "45.95.148", "45.95.149",       // Suspicious ranges
			"91.92.240", "91.92.241", "91.92.242",       // High-risk ranges
			"103.21.244", "103.21.245", "103.21.246"     // Malware distribution
		];

		// Generate security-focused IP addresses
		for (let i = 0; i < 5000; i++) {
			let ip: string;
			let isMalicious = false;

			if (i < 1000) {
				// Known malicious ranges
				const range = maliciousRanges[i % maliciousRanges.length];
				ip = `${range}.${i % 256}`;
				isMalicious = true;
			} else if (i < 2000) {
				// Suspicious ranges (higher chance of being malicious)
				ip = `185.${Math.floor(i / 256)}.${Math.floor((i % 256) / 256)}.${i % 256}`;
				isMalicious = Math.random() < 0.7;
			} else {
				// Regular ranges (lower chance of being malicious)
				ip = `203.${Math.floor(i / 256)}.${Math.floor((i % 256) / 256)}.${i % 256}`;
				isMalicious = Math.random() < 0.1;
			}

			this.securityIPs.push(ip);
      
			const threatLevel = isMalicious 
				? (Math.random() < 0.3 ? "critical" : Math.random() < 0.5 ? "high" : "medium")
				: "low";

			const reputationScore = isMalicious 
				? Math.floor(Math.random() * 40) + 10  // 10-50 for malicious
				: Math.floor(Math.random() * 30) + 70; // 70-100 for clean

			this.securityData.push({
				country: countries[i % countries.length],
				city: cities[i % cities.length],
				isp: isps[i % isps.length],
				latitude: (Math.random() - 0.5) * 180,
				longitude: (Math.random() - 0.5) * 360,
				lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
				threatLevel,
				threatTypes: isMalicious 
					? [threatTypes[Math.floor(Math.random() * threatTypes.length)]]
					: [],
				reputationScore,
				firstSeen: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
				attackCount: isMalicious ? Math.floor(Math.random() * 100) + 1 : 0,
				lastAttack: isMalicious 
					? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Last 24 hours
					: new Date(0),
				ispReputation: isMalicious 
					? (Math.random() < 0.6 ? "suspicious" : "malicious")
					: (Math.random() < 0.8 ? "trusted" : "neutral"),
				geolocationRisk: isMalicious 
					? (Math.random() < 0.7 ? "high" : "medium")
					: "low",
				portScanAttempts: isMalicious ? Math.floor(Math.random() * 1000) + 10 : 0,
				ddosParticipation: isMalicious && Math.random() < 0.4,
				botnetMember: isMalicious && Math.random() < 0.3,
				torExitNode: isMalicious && Math.random() < 0.2,
				vpnUsage: Math.random() < 0.3 // Both good and bad actors use VPNs
			});
		}

		// Generate malicious patterns for DPI simulation
		this.maliciousPatterns = [
			"185.220.101", "185.220.102", "185.220.103", // Tor exit nodes
			"45.95.147", "45.95.148", "45.95.149",       // Suspicious ranges
			"91.92.240", "91.92.241", "91.92.242",       // High-risk ranges
			"103.21.244", "103.21.245", "103.21.246",    // Malware distribution
			"185.", "45.95.", "91.92.", "103.21."        // Broader patterns
		];
	}

	private async benchmark(
		name: string, 
		setupFn: () => any, 
		testFn: (setup: any) => void,
		teardownFn?: (setup: any) => void
	): Promise<BenchmarkResult> {
		const times: number[] = [];
		const memorySamples: number[] = [];
		
		// Warmup
		for (let i = 0; i < this.config.warmupIterations; i++) {
			const setup = setupFn();
			testFn(setup);
			if (teardownFn) teardownFn(setup);
		}

		// Force garbage collection if available (Node.js with --expose-gc flag)
		if (global.gc) {
			global.gc();
		}

		// Measure memory before actual benchmark
		const memBefore = process.memoryUsage().heapUsed;

		// Actual benchmark
		for (let i = 0; i < this.config.iterations; i++) {
			const setup = setupFn();
			
			const start = process.hrtime.bigint();
			testFn(setup);
			const end = process.hrtime.bigint();
			
			times.push(Number(end - start) / 1_000_000); // Convert to milliseconds
			
			if (teardownFn) teardownFn(setup);
			
			// Sample memory every 10 iterations to get a more stable measurement
			if (i % 10 === 0) {
				memorySamples.push(process.memoryUsage().heapUsed);
			}
		}

		// Force garbage collection again
		if (global.gc) {
			global.gc();
		}

		const memAfter = process.memoryUsage().heapUsed;
		
		// Calculate memory usage more reliably
		let memoryUsed: number;
		if (memorySamples.length > 0) {
			// Use the median of memory samples to avoid GC interference
			const sortedSamples = [...memorySamples].sort((a, b) => a - b);
			const medianMemory = sortedSamples[Math.floor(sortedSamples.length / 2)];
			memoryUsed = medianMemory - memBefore;
		} else {
			// Fallback to simple before/after
			memoryUsed = memAfter - memBefore;
		}

		const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
		const minTime = Math.min(...times);
		const maxTime = Math.max(...times);
		const opsPerSecond = 1000 / averageTime;

		return {
			name,
			opsPerSecond,
			averageTime,
			minTime,
			maxTime,
			memoryUsed: Math.max(0, memoryUsed) // Ensure non-negative values
		};
	}

	// ========== MALICIOUS IP DETECTION (DPI SIMULATION) ==========

	async benchmarkMaliciousIPDetection(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Malicious IP Detection (DPI)",
			() => {
				const trie = new Trie<SecurityIPData>();
				// Pre-populate with security data
				for (let i = 0; i < this.securityIPs.length; i++) {
					trie.insert(this.securityIPs[i], this.securityData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate real-time DPI traffic analysis
				for (let i = 0; i < 100; i++) {
					const testIP = this.securityIPs[i % this.securityIPs.length];
					const data = trie.getData(testIP);
          
					if (data) {
						// Simulate threat analysis
						const isThreat = data.reputationScore < 50 || 
                            data.threatLevel === "critical" || 
                            data.threatLevel === "high";
             
						// Simulate pattern matching
						for (const pattern of this.maliciousPatterns) {
							if (testIP.startsWith(pattern)) {
								// Pattern matched - potential threat
								if (isThreat) {
									// Log threat detection (simulate real DPI system)
									// console.log(`Threat detected: ${testIP} matches pattern ${pattern}`);
								}
								break;
							}
						}
					}
				}
			}
		);
	}

	async benchmarkThreatIntelligenceLookup(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Threat Intelligence Lookup",
			() => {
				const trie = new Trie<SecurityIPData>();
				// Pre-populate with security data
				for (let i = 0; i < this.securityIPs.length; i++) {
					trie.insert(this.securityIPs[i], this.securityData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate threat intelligence queries
				for (let i = 0; i < 100; i++) {
					const testIP = this.securityIPs[i % this.securityIPs.length];
					const data = trie.getData(testIP);
          
					if (data) {
						// Simulate comprehensive threat analysis
						const riskFactors: string[] = [];
						if (data.reputationScore < 30) riskFactors.push("very_low_reputation");
						if (data.threatLevel === "critical") riskFactors.push("critical_threat");
						if (data.ddosParticipation) riskFactors.push("ddos_participant");
						if (data.botnetMember) riskFactors.push("botnet_member");
						if (data.torExitNode) riskFactors.push("tor_exit_node");
						if (data.portScanAttempts > 100) riskFactors.push("aggressive_port_scan");
						if (data.attackCount > 50) riskFactors.push("high_attack_frequency");
					}
				}
			}
		);
	}

	async benchmarkBehavioralAnalysis(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Behavioral Analysis (Real-time)",
			() => {
				const trie = new Trie<SecurityIPData>();
				// Pre-populate with security data
				for (let i = 0; i < this.securityIPs.length; i++) {
					trie.insert(this.securityIPs[i], this.securityData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate real-time behavioral analysis
				for (let i = 0; i < 100; i++) {
					const testIP = this.securityIPs[i % this.securityIPs.length];
					const data = trie.getData(testIP);
          
					if (data) {
						// Simulate behavioral scoring
						let behaviorScore = 100;
            
						// Reduce score based on suspicious activities
						if (data.portScanAttempts > 0) behaviorScore -= Math.min(20, data.portScanAttempts / 10);
						if (data.ddosParticipation) behaviorScore -= 30;
						if (data.botnetMember) behaviorScore -= 40;
						if (data.torExitNode) behaviorScore -= 15;
						if (data.vpnUsage && data.reputationScore < 50) behaviorScore -= 10;
            
						// Geographic risk assessment
						if (data.geolocationRisk === "high") behaviorScore -= 20;
						if (data.ispReputation === "malicious") behaviorScore -= 25;
            
						// Time-based analysis
						const hoursSinceLastAttack = (Date.now() - data.lastAttack.getTime()) / (1000 * 60 * 60);
						if (hoursSinceLastAttack < 24) behaviorScore -= 15;
            
						// Final threat assessment
						const threatLevel = behaviorScore < 30 ? "critical" : 
							behaviorScore < 50 ? "high" : 
								behaviorScore < 70 ? "medium" : "low";
             
						// Use threatLevel to simulate security action (simulate real DPI system)
						if (threatLevel === "critical" || threatLevel === "high") {
							// console.log(`High threat detected for ${testIP}: ${threatLevel} (score: ${behaviorScore})`);
						}
					}
				}
			}
		);
	}

	async benchmarkSubnetThreatAnalysis(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Subnet Threat Analysis",
			() => {
				const trie = new Trie<SecurityIPData>();
				// Pre-populate with security data
				for (let i = 0; i < this.securityIPs.length; i++) {
					trie.insert(this.securityIPs[i], this.securityData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate analyzing entire subnets for threats
				const subnetPatterns = ["185.220", "45.95", "91.92", "103.21"];
        
				for (const subnet of subnetPatterns) {
					// Get all IPs in this subnet
					const subnetIPs = trie.getWordsWithPrefix(subnet, 100);
          
					// Analyze subnet threat level
					let totalThreatScore = 0;
					let maliciousCount = 0;
					let totalCount = subnetIPs.length;
          
					for (const ipResult of subnetIPs) {
						const data = ipResult.value;
						if (data) {
							totalThreatScore += data.reputationScore;
							if (data.threatLevel === "high" || data.threatLevel === "critical") {
								maliciousCount++;
							}
						}
					}
          
					// Calculate subnet risk
					const avgReputation = totalCount > 0 ? totalThreatScore / totalCount : 100;
					const maliciousPercentage = totalCount > 0 ? (maliciousCount / totalCount) * 100 : 0;
          
					// Determine subnet threat level
					let subnetThreatLevel = "low";
					if (avgReputation < 30 || maliciousPercentage > 30) subnetThreatLevel = "critical";
					else if (avgReputation < 50 || maliciousPercentage > 20) subnetThreatLevel = "high";
					else if (avgReputation < 70 || maliciousPercentage > 10) subnetThreatLevel = "medium";
           
					// Use subnetThreatLevel to simulate network-wide security action
					if (subnetThreatLevel === "critical" || subnetThreatLevel === "high") {
						// console.log(`High subnet threat: ${subnet} - ${subnetThreatLevel} (${maliciousPercentage.toFixed(1)}% malicious)`);
					}
				}
			}
		);
	}

	// ========== EXISTING IP ADDRESS OPERATIONS ==========

	async benchmarkIPInsert(): Promise<BenchmarkResult> {
		return this.benchmark(
			"IP Address Insert",
			() => new Trie<IPData>(),
			(trie) => {
				// Insert IP addresses with metadata
				for (let i = 0; i < 100; i++) {
					trie.insert(this.testIPs[i], this.testData[i]);
				}
			}
		);
	}

	async benchmarkIPSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"IP Address Search",
			() => {
				const trie = new Trie<IPData>();
				// Pre-populate with test data
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testIPs[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search for specific IPs
				for (let i = 0; i < 100; i++) {
					trie.search(this.testIPs[i]);
					trie.getData(this.testIPs[i]);
				}
			}
		);
	}

	async benchmarkIPPrefixSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"IP Subnet Prefix Search",
			() => {
				const trie = new Trie<IPData>();
				// Pre-populate with test data
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testIPs[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search for IPs in specific subnets
				for (const prefix of this.prefixIPs) {
					trie.getWordsWithPrefix(prefix, 20);
					trie.startsWith(prefix);
				}
			}
		);
	}

	async benchmarkIPRangeSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"IP Range Search (Multiple Subnets)",
			() => {
				const trie = new Trie<IPData>();
				// Pre-populate with test data
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testIPs[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search across multiple subnet ranges
				const ranges = ["192.168", "203.0", "10.0"];
				for (const range of ranges) {
					trie.getWordsWithPrefix(range, 50);
					trie.startsWith(range);
				}
			}
		);
	}

	async benchmarkIPDelete(): Promise<BenchmarkResult> {
		return this.benchmark(
			"IP Address Delete",
			() => {
				const trie = new Trie<IPData>();
				// Pre-populate with test data
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testIPs[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Delete some IPs
				for (let i = 0; i < 100; i++) {
					trie.delete(this.testIPs[i]);
				}
			}
		);
	}

	// ========== MEMORY EFFICIENCY TESTS ==========

	measureMemoryEfficiency(): {
    memoryUsed: number;
    stats: TrieStats;
    ipCount: number;
    } {
		// Test with IPs that have common prefixes to show Trie advantage
		const commonPrefixIPs: string[] = [];
		const prefixes = ["192.168", "10.0", "172.16"];
		const suffixes: string[] = Array.from({length: 1000}, (_, i) => `.${Math.floor(i / 256)}.${i % 256}`);
    
		for (const prefix of prefixes) {
			for (const suffix of suffixes) {
				commonPrefixIPs.push(prefix + suffix);
			}
		}

		// Measure Trie memory usage
		const memBefore = process.memoryUsage().heapUsed;
		const trie = new Trie<IPData>();
		for (let i = 0; i < commonPrefixIPs.length; i++) {
			trie.insert(commonPrefixIPs[i], this.testData[i % this.testData.length]);
		}
		const memAfter = process.memoryUsage().heapUsed;
		const trieStats = trie.getStats();

		return {
			memoryUsed: memAfter - memBefore,
			stats: trieStats,
			ipCount: commonPrefixIPs.length
		};
	}

	// ========== UTILITY METHODS ==========

	private formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(2) + "M";
		} else if (num >= 1000) {
			return (num / 1000).toFixed(2) + "K";
		}
		return num.toFixed(2);
	}

	private formatBytes(bytes: number): string {
		if (bytes >= 1024 * 1024) {
			return (bytes / (1024 * 1024)).toFixed(2) + " MB";
		} else if (bytes >= 1024) {
			return (bytes / 1024).toFixed(2) + " KB";
		}
		return bytes + " B";
	}

	private printResult(result: BenchmarkResult, category?: string): void {
		if (category) {
			console.log(`\n📊 ${category}:`);
			console.log("─".repeat(50));
		}
		console.log(`${result.name}:`);
		console.log(`  Ops/sec: ${this.formatNumber(result.opsPerSecond)}`);
		console.log(`  Avg time: ${result.averageTime.toFixed(3)}ms`);
		console.log(`  Range: ${result.minTime.toFixed(3)}ms - ${result.maxTime.toFixed(3)}ms`);
		if (result.memoryUsed) {
			console.log(`  Memory: ${this.formatBytes(result.memoryUsed)}`);
		}
	}

	async runIPBenchmark(): Promise<void> {
		console.log("🌐 IP Address Trie Benchmark (with DPI Simulation)");
		console.log("==================================================");
		console.log(`📝 Dataset: ${this.formatNumber(this.config.ipCount)} IP addresses + ${this.formatNumber(this.securityIPs.length)} security entries`);
		console.log(`🔄 Iterations: ${this.config.iterations} (warmup: ${this.config.warmupIterations})`);
		console.log("📋 Data: Rich IP metadata + Threat intelligence data");
		console.log();

		// Basic IP Operations
		console.log("🟢 BASIC IP OPERATIONS");
		const basicResults = await Promise.all([
			this.benchmarkIPInsert(),
			this.benchmarkIPSearch()
		]);

		basicResults.forEach(result => this.printResult(result));

		// Advanced IP Operations
		console.log("\n🔵 ADVANCED IP OPERATIONS");
		const advancedResults = await Promise.all([
			this.benchmarkIPPrefixSearch(),
			this.benchmarkIPRangeSearch(),
			this.benchmarkIPDelete()
		]);

		advancedResults.forEach(result => this.printResult(result));

		// Security & DPI Operations
		console.log("\n🔴 SECURITY & DEEP PACKET INSPECTION");
		const securityResults = await Promise.all([
			this.benchmarkMaliciousIPDetection(),
			this.benchmarkThreatIntelligenceLookup(),
			this.benchmarkBehavioralAnalysis(),
			this.benchmarkSubnetThreatAnalysis()
		]);

		securityResults.forEach(result => this.printResult(result));

		// Memory Efficiency
		console.log("\n🟡 MEMORY EFFICIENCY");
		const memoryStats = this.measureMemoryEfficiency();

		console.log(`Memory usage for ${this.formatNumber(memoryStats.ipCount)} IPs with shared prefixes:`);
		console.log(`  Total memory: ${this.formatBytes(memoryStats.memoryUsed)}`);
		console.log("  Trie stats:");
		console.log(`    Size: ${memoryStats.stats.size}`);
		console.log(`    Total nodes: ${memoryStats.stats.nodes}`);
		console.log(`    Max depth: ${memoryStats.stats.maxDepth}`);
		console.log(`    Average depth: ${memoryStats.stats.avgDepth.toFixed(2)}`);
		console.log(`    Memory per IP: ${this.formatBytes(memoryStats.memoryUsed / memoryStats.ipCount)}`);

		// Performance Analysis
		console.log("\n📈 PERFORMANCE ANALYSIS");
		console.log("─".repeat(40));
    
		const allResults = [...basicResults, ...advancedResults, ...securityResults];
		const fastest = allResults.reduce((prev, current) => 
			current.opsPerSecond > prev.opsPerSecond ? current : prev
		);
		const slowest = allResults.reduce((prev, current) => 
			current.opsPerSecond < prev.opsPerSecond ? current : prev
		);

		console.log(`✅ Fastest operation: ${fastest.name} (${this.formatNumber(fastest.opsPerSecond)} ops/sec)`);
		console.log(`🐌 Slowest operation: ${slowest.name} (${this.formatNumber(slowest.opsPerSecond)} ops/sec)`);
		console.log(`📊 Performance range: ${(fastest.opsPerSecond / slowest.opsPerSecond).toFixed(2)}x difference`);

		// Security Use Cases
		console.log("\n🎯 SECURITY USE CASES FOR IP ADDRESS TRIE:");
		console.log("─".repeat(50));
		console.log("• Real-time threat detection & DPI");
		console.log("• Network security monitoring & logging");
		console.log("• Firewall & intrusion prevention systems");
		console.log("• Threat intelligence platforms");
		console.log("• Security information & event management (SIEM)");
		console.log("• Network traffic analysis & forensics");
		console.log("• Botnet & malware detection");
		console.log("• Geographic threat assessment");
		console.log("• ISP reputation analysis");
		console.log("• Behavioral anomaly detection");
	}
}

// Export for use
export { IPAddressTrieBenchmark };

// Main execution
async function main(): Promise<void> {
	try {
		const benchmark = new IPAddressTrieBenchmark({
			iterations: 500,
			warmupIterations: 50,
			ipCount: 10000
		});

		await benchmark.runIPBenchmark();

		console.log("\n✅ IP address benchmark with DPI simulation completed successfully!");
	} catch (error) {
		console.error("❌ Benchmark failed:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}