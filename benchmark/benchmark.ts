import { Trie, TrieStats } from "../src";

// Benchmark configuration
interface BenchmarkConfig {
	iterations: number;
	warmupIterations: number;
	animalCount: number;
}

interface BenchmarkResult {
	name: string;
	opsPerSecond: number;
	averageTime: number;
	minTime: number;
	maxTime: number;
	memoryUsed?: number;
}

interface AnimalData {
	species: string;
	family: string;
	habitat: string;
	weight: number;
	lifespan: number;
	conservationStatus: string;
	lastSeen: Date;
}

// Enhanced animal data for classification and behavior analysis
interface DetailedAnimalData extends AnimalData {
	behaviorType: "predator" | "prey" | "scavenger" | "herbivore" | "omnivore";
	dangerLevel: "low" | "medium" | "high" | "critical";
	behavioralTraits: string[];
	aggressionScore: number; // 0-100, higher = more aggressive
	firstObserved: Date;
	encounterCount: number;
	lastEncounter: Date;
	habitatPreference: "forest" | "desert" | "ocean" | "mountain" | "grassland" | "urban";
	populationDensity: "sparse" | "moderate" | "dense";
	nocturnal: boolean;
	migratory: boolean;
	territorial: boolean;
	socialBehavior: "solitary" | "pair" | "group" | "herd";
}

class AnimalTrieBenchmark {
	private config: BenchmarkConfig;
	private testAnimals: string[] = [];
	private testData: AnimalData[] = [];
	private detailedAnimals: string[] = [];
	private detailedData: DetailedAnimalData[] = [];
	private familyPrefixes: string[] = [];
	private behavioralPatterns: string[] = [];
	
	// No need to pre-normalize - let the Trie handle it naturally

	constructor(config: Partial<BenchmarkConfig> = {}) {
		this.config = {
			iterations: 1000,
			warmupIterations: 100,
			animalCount: 10000,
			...config
		};

		// Generate realistic animal test data
		this.generateTestData();
		this.generateDetailedData();
		
		// Let the Trie handle string normalization naturally
	}

	private generateTestData(): void {
		this.testAnimals = [];
		this.testData = [];
		this.familyPrefixes = [];

		const species = [
			"Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Cheetah", "Leopard", "Rhino",
			"Gorilla", "Chimpanzee", "Orangutan", "Bonobo", "Wolf", "Fox", "Bear", "Deer",
			"Antelope", "Gazelle", "Hippo", "Crocodile", "Alligator", "Snake", "Eagle", "Hawk",
			"Owl", "Falcon", "Vulture", "Shark", "Whale", "Dolphin", "Octopus", "Squid"
		];

		const families = [
			"Felidae", "Elephantidae", "Giraffidae", "Equidae", "Canidae", "Ursidae",
			"Cervidae", "Bovidae", "Hippopotamidae", "Crocodylidae", "Accipitridae",
			"Strigidae", "Delphinidae", "Carcharhinidae", "Octopodidae"
		];

		const habitats = [
			"African Savanna", "Asian Forest", "Arctic Tundra", "Amazon Rainforest",
			"Great Plains", "Rocky Mountains", "Pacific Ocean", "Atlantic Ocean",
			"Mediterranean Sea", "Himalayan Mountains", "Sahara Desert", "Antarctic Ice"
		];

		const conservationStatuses = [
			"Least Concern", "Near Threatened", "Vulnerable", "Endangered",
			"Critically Endangered", "Extinct in the Wild", "Extinct"
		];

		// Generate realistic animal names with rich metadata
		for (let i = 0; i < this.config.animalCount; i++) {
			// Generate animal names with family prefixes
			let animalName: string;
			if (i < this.config.animalCount * 0.3) {
				// Common animals with family prefixes
				const family = families[i % families.length];
				const speciesName = species[i % species.length];
				animalName = `${family}_${speciesName}_${i % 1000}`;
			} else if (i < this.config.animalCount * 0.6) {
				// Geographic variants
				const region = ["African", "Asian", "European", "American", "Australian"][i % 5];
				const speciesName = species[i % species.length];
				animalName = `${region}_${speciesName}_${i % 1000}`;
			} else {
				// Scientific names
				const genus = ["Panthera", "Elephas", "Giraffa", "Equus", "Canis"][i % 5];
				const speciesName = species[i % species.length].toLowerCase();
				animalName = `${genus}_${speciesName}_${i % 1000}`;
			}

			this.testAnimals.push(animalName);
			this.testData.push({
				species: species[i % species.length],
				family: families[i % families.length],
				habitat: habitats[i % habitats.length],
				weight: Math.random() * 5000 + 1, // 1kg to 5000kg
				lifespan: Math.random() * 50 + 5, // 5 to 55 years
				conservationStatus: conservationStatuses[i % conservationStatuses.length],
				lastSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date in last year
			});

			// Collect family prefixes for testing
			if (i < 100) {
				const parts = animalName.split("_");
				if (parts.length > 1) {
					this.familyPrefixes.push(parts[0]); // Family prefix
				}
			}
		}

		// Remove duplicates from family prefixes
		this.familyPrefixes = [...new Set(this.familyPrefixes)];
	}

	private generateDetailedData(): void {
		this.detailedAnimals = [];
		this.detailedData = [];
		this.behavioralPatterns = [];

		const behavioralTraits = [
			"territorial", "migratory", "nocturnal", "social", "solitary",
			"aggressive", "defensive", "curious", "shy", "bold",
			"intelligent", "playful", "protective", "hunting", "foraging"
		];



		const habitats = [
			"Forest", "Desert", "Ocean", "Mountain", "Grassland", "Urban",
			"Savanna", "Tundra", "Rainforest", "Wetland", "Coral Reef"
		];

		// Generate detailed animal data for behavioral analysis
		for (let i = 0; i < 5000; i++) {
			let animalName: string;
			let isDangerous = false;

			if (i < 1000) {
				// Large predators (higher danger)
				const family = ["Panthera", "Ursus", "Canis"][i % 3];
				animalName = `${family}_predator_${i % 1000}`;
				isDangerous = true;
			} else if (i < 2000) {
				// Medium-sized animals (moderate danger)
				const family = ["Cervus", "Bos", "Equus"][i % 3];
				animalName = `${family}_herbivore_${i % 1000}`;
				isDangerous = Math.random() < 0.3;
			} else {
				// Small animals (lower danger)
				const family = ["Lepus", "Sciurus", "Mus"][i % 3];
				animalName = `${family}_small_${i % 1000}`;
				isDangerous = Math.random() < 0.1;
			}

			this.detailedAnimals.push(animalName);

			const behaviorType = isDangerous 
				? (Math.random() < 0.6 ? "predator" : "scavenger")
				: (Math.random() < 0.7 ? "herbivore" : "omnivore");

			const dangerLevel = isDangerous 
				? (Math.random() < 0.4 ? "critical" : Math.random() < 0.6 ? "high" : "medium")
				: "low";

			const aggressionScore = isDangerous 
				? Math.floor(Math.random() * 60) + 40  // 40-100 for dangerous
				: Math.floor(Math.random() * 30) + 10; // 10-40 for safe

			this.detailedData.push({
				species: animalName.split("_")[1] || "Unknown",
				family: animalName.split("_")[0] || "Unknown",
				habitat: habitats[i % habitats.length],
				weight: Math.random() * 2000 + 1,
				lifespan: Math.random() * 40 + 5,
				conservationStatus: isDangerous ? "Vulnerable" : "Least Concern",
				lastSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
				behaviorType,
				dangerLevel,
				behavioralTraits: [behavioralTraits[Math.floor(Math.random() * behavioralTraits.length)]],
				aggressionScore,
				firstObserved: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
				encounterCount: isDangerous ? Math.floor(Math.random() * 50) + 1 : 0,
				lastEncounter: isDangerous 
					? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
					: new Date(0),
				habitatPreference: habitats[i % habitats.length] as any,
				populationDensity: isDangerous ? "sparse" : (Math.random() < 0.7 ? "moderate" : "dense"),
				nocturnal: Math.random() < 0.4,
				migratory: Math.random() < 0.3,
				territorial: isDangerous && Math.random() < 0.7,
				socialBehavior: isDangerous ? (Math.random() < 0.6 ? "solitary" : "pair") : (Math.random() < 0.7 ? "herd" : "group")
			});
		}

		// Generate behavioral patterns for analysis
		this.behavioralPatterns = [
			"Panthera_predator", "Ursus_predator", "Canis_predator",
			"Cervus_herbivore", "Bos_herbivore", "Equus_herbivore",
			"Lepus_small", "Sciurus_small", "Mus_small"
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

	// ========== ANIMAL BEHAVIORAL ANALYSIS ==========

	async benchmarkDangerousAnimalDetection(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Dangerous Animal Detection",
			() => {
				const trie = new Trie<DetailedAnimalData>();
				// Pre-populate with detailed animal data
				for (let i = 0; i < this.detailedAnimals.length; i++) {
					trie.insert(this.detailedAnimals[i], this.detailedData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate wildlife monitoring and danger assessment
				for (let i = 0; i < 100; i++) {
					const testAnimal = this.detailedAnimals[i % this.detailedAnimals.length];
					const data = trie.getData(testAnimal);
          
					if (data) {
						// Simulate danger assessment
						const isDangerous = data.aggressionScore > 60 || 
											data.dangerLevel === "critical" || 
											data.dangerLevel === "high";
              
						// Simulate behavioral pattern matching
						for (const pattern of this.behavioralPatterns) {
							if (testAnimal.startsWith(pattern)) {
								// Pattern matched - potential danger
								if (isDangerous) {
									// Log danger detection (simulate wildlife monitoring system)
									// console.log(`Dangerous animal detected: ${testAnimal} matches pattern ${pattern}`);
								}
								break;
							}
						}
					}
				}
			}
		);
	}

	async benchmarkBehavioralAnalysis(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Behavioral Analysis",
			() => {
				const trie = new Trie<DetailedAnimalData>();
				// Pre-populate with detailed animal data
				for (let i = 0; i < this.detailedAnimals.length; i++) {
					trie.insert(this.detailedAnimals[i], this.detailedData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate comprehensive behavioral analysis
				for (let i = 0; i < 100; i++) {
					const testAnimal = this.detailedAnimals[i % this.detailedAnimals.length];
					const data = trie.getData(testAnimal);
          
					if (data) {
						// Simulate behavioral scoring
						let behaviorScore = 100;
            
						// Reduce score based on dangerous behaviors
						if (data.aggressionScore > 70) behaviorScore -= 30;
						if (data.territorial) behaviorScore -= 15;
						if (data.behaviorType === "predator") behaviorScore -= 25;
						if (data.encounterCount > 10) behaviorScore -= 20;
            
						// Habitat risk assessment
						if (data.habitatPreference === "Urban") behaviorScore -= 10;
						if (data.populationDensity === "sparse") behaviorScore -= 5;
            
						// Time-based analysis
						const daysSinceLastEncounter = (Date.now() - data.lastEncounter.getTime()) / (1000 * 60 * 60 * 24);
						if (daysSinceLastEncounter < 7) behaviorScore -= 15;
            
						// Final risk assessment
						const riskLevel = behaviorScore < 30 ? "critical" : 
							behaviorScore < 50 ? "high" : 
								behaviorScore < 70 ? "medium" : "low";
              
						// Use riskLevel to simulate wildlife management action
						if (riskLevel === "critical" || riskLevel === "high") {
							// console.log(`High risk animal: ${testAnimal} - ${riskLevel} (score: ${behaviorScore})`);
						}
					}
				}
			}
		);
	}

	async benchmarkHabitatAnalysis(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Habitat Analysis",
			() => {
				const trie = new Trie<DetailedAnimalData>();
				// Pre-populate with detailed animal data
				for (let i = 0; i < this.detailedAnimals.length; i++) {
					trie.insert(this.detailedAnimals[i], this.detailedData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate analyzing entire habitats for wildlife management
				const habitatPatterns = ["Forest", "Desert", "Ocean", "Mountain", "Grassland"];
        
				for (const habitat of habitatPatterns) {
					// Get all animals in this habitat
					const habitatAnimals = trie.getWordsWithPrefix(habitat, 100);
          
					// Analyze habitat population
					let totalRiskScore = 0;
					let dangerousCount = 0;
					let totalCount = habitatAnimals.length;
          
					for (const animalResult of habitatAnimals) {
						const data = animalResult.value;
						if (data) {
							totalRiskScore += data.aggressionScore;
							if (data.dangerLevel === "high" || data.dangerLevel === "critical") {
								dangerousCount++;
							}
						}
					}
          
					// Calculate habitat risk
					const avgRiskScore = totalCount > 0 ? totalRiskScore / totalCount : 0;
					const dangerousPercentage = totalCount > 0 ? (dangerousCount / totalCount) * 100 : 0;
          
					// Determine habitat risk level
					let habitatRiskLevel = "low";
					if (avgRiskScore > 70 || dangerousPercentage > 30) habitatRiskLevel = "critical";
					else if (avgRiskScore > 50 || dangerousPercentage > 20) habitatRiskLevel = "high";
					else if (avgRiskScore > 30 || dangerousPercentage > 10) habitatRiskLevel = "medium";
            
					// Use habitatRiskLevel to simulate wildlife management action
					if (habitatRiskLevel === "critical" || habitatRiskLevel === "high") {
						// console.log(`High risk habitat: ${habitat} - ${habitatRiskLevel} (${dangerousPercentage.toFixed(1)}% dangerous)`);
					}
				}
			}
		);
	}

	async benchmarkSpeciesClassification(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Species Classification",
			() => {
				const trie = new Trie<DetailedAnimalData>();
				// Pre-populate with detailed animal data
				for (let i = 0; i < this.detailedAnimals.length; i++) {
					trie.insert(this.detailedAnimals[i], this.detailedData[i]);
				}
				return trie;
			},
			(trie) => {
				// Simulate species classification and taxonomy
				for (let i = 0; i < 100; i++) {
					const testAnimal = this.detailedAnimals[i % this.detailedAnimals.length];
					const data = trie.getData(testAnimal);
          
					if (data) {
						// Simulate taxonomic classification
						const classificationFactors: string[] = [];
						if (data.behaviorType === "predator") classificationFactors.push("carnivore");
						if (data.behaviorType === "herbivore") classificationFactors.push("herbivore");
						if (data.territorial) classificationFactors.push("territorial");
						if (data.migratory) classificationFactors.push("migratory");
						if (data.nocturnal) classificationFactors.push("nocturnal");
						if (data.socialBehavior === "herd") classificationFactors.push("social_herd");
						if (data.conservationStatus === "Endangered") classificationFactors.push("conservation_priority");
					}
				}
			}
		);
	}

	// ========== BASIC ANIMAL OPERATIONS ==========

	async benchmarkAnimalInsert(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Data Insert",
			() => new Trie<AnimalData>(),
			(trie) => {
				// Insert animal data with metadata - let Trie handle normalization
				for (let i = 0; i < 100; i++) {
					trie.insert(this.testAnimals[i], this.testData[i]);
				}
			}
		);
	}

	async benchmarkAnimalSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Data Search",
			() => {
				const trie = new Trie<AnimalData>();
				// Pre-populate with test data - let Trie handle normalization
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testAnimals[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search for specific animals - let Trie handle normalization
				for (let i = 0; i < 100; i++) {
					trie.search(this.testAnimals[i]);
					trie.getData(this.testAnimals[i]);
				}
			}
		);
	}

	async benchmarkFamilyPrefixSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Family Prefix Search",
			() => {
				const trie = new Trie<AnimalData>();
				// Pre-populate with test data - let Trie handle normalization
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testAnimals[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search for animals in specific families - let Trie handle normalization
				for (const prefix of this.familyPrefixes) {
					trie.getWordsWithPrefix(prefix, 20);
					trie.startsWith(prefix);
				}
			}
		);
	}

	async benchmarkAnimalRangeSearch(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Range Search (Multiple Families)",
			() => {
				const trie = new Trie<AnimalData>();
				// Pre-populate with test data - let Trie handle normalization
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testAnimals[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Search across multiple family ranges - let Trie handle normalization
				const ranges = ["Panthera", "Elephas", "Canis"];
				for (const range of ranges) {
					trie.getWordsWithPrefix(range, 50);
					trie.startsWith(range);
				}
			}
		);
	}

	async benchmarkAnimalDelete(): Promise<BenchmarkResult> {
		return this.benchmark(
			"Animal Data Delete",
			() => {
				const trie = new Trie<AnimalData>();
				// Pre-populate with test data - let Trie handle normalization
				for (let i = 0; i < 1000; i++) {
					trie.insert(this.testAnimals[i], this.testData[i]);
				}
				return trie;
			},
			(trie) => {
				// Delete some animals - let Trie handle normalization
				for (let i = 0; i < 100; i++) {
					trie.delete(this.testAnimals[i]);
				}
			}
		);
	}

	// ========== MEMORY EFFICIENCY TESTS ==========

	measureMemoryEfficiency(): {
		memoryUsed: number;
		stats: TrieStats;
		animalCount: number;
		} {
		// Test with animals that have common family prefixes to show Trie advantage
		const commonPrefixAnimals: string[] = [];
		const families = ["Panthera", "Elephas", "Canis"];
		const suffixes: string[] = Array.from({length: 1000}, (_, i) => `_species_${i % 1000}`);
    
		for (const family of families) {
			for (const suffix of suffixes) {
				commonPrefixAnimals.push(family + suffix);
			}
		}

		// Measure Trie memory usage
		const memBefore = process.memoryUsage().heapUsed;
		const trie = new Trie<AnimalData>();
		for (let i = 0; i < commonPrefixAnimals.length; i++) {
			trie.insert(commonPrefixAnimals[i], this.testData[i % this.testData.length]);
		}
		const memAfter = process.memoryUsage().heapUsed;
		const trieStats = trie.getStats();

		return {
			memoryUsed: memAfter - memBefore,
			stats: trieStats,
			animalCount: commonPrefixAnimals.length
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

	async runAnimalBenchmark(): Promise<void> {
		console.log("🦁 Animal Trie Benchmark (with Behavioral Analysis)");
		console.log("==================================================");
		console.log(`📝 Dataset: ${this.formatNumber(this.config.animalCount)} animals + ${this.formatNumber(this.detailedAnimals.length)} detailed entries`);
		console.log(`🔄 Iterations: ${this.config.iterations} (warmup: ${this.config.warmupIterations})`);
		console.log("📋 Data: Rich animal metadata + Behavioral characteristics");
		console.log();

		// Basic Animal Operations
		console.log("🟢 BASIC ANIMAL OPERATIONS");
		const basicResults = await Promise.all([
			this.benchmarkAnimalInsert(),
			this.benchmarkAnimalSearch()
		]);

		basicResults.forEach(result => this.printResult(result));

		// Advanced Animal Operations
		console.log("\n🔵 ADVANCED ANIMAL OPERATIONS");
		const advancedResults = await Promise.all([
			this.benchmarkFamilyPrefixSearch(),
			this.benchmarkAnimalRangeSearch(),
			this.benchmarkAnimalDelete()
		]);

		advancedResults.forEach(result => this.printResult(result));

		// Behavioral & Wildlife Analysis
		console.log("\n🔴 BEHAVIORAL & WILDLIFE ANALYSIS");
		const behavioralResults = await Promise.all([
			this.benchmarkDangerousAnimalDetection(),
			this.benchmarkBehavioralAnalysis(),
			this.benchmarkHabitatAnalysis(),
			this.benchmarkSpeciesClassification()
		]);

		behavioralResults.forEach(result => this.printResult(result));

		// Memory Efficiency
		console.log("\n🟡 MEMORY EFFICIENCY");
		const memoryStats = this.measureMemoryEfficiency();

		console.log(`Memory usage for ${this.formatNumber(memoryStats.animalCount)} animals with shared family prefixes:`);
		console.log(`  Total memory: ${this.formatBytes(memoryStats.memoryUsed)}`);
		console.log("  Trie stats:");
		console.log(`    Size: ${memoryStats.stats.size}`);
		console.log(`    Total nodes: ${memoryStats.stats.nodes}`);
		console.log(`    Max depth: ${memoryStats.stats.maxDepth}`);
		console.log(`    Average depth: ${memoryStats.stats.avgDepth.toFixed(2)}`);
		console.log(`    Memory per animal: ${this.formatBytes(memoryStats.memoryUsed / memoryStats.animalCount)}`);

		// Performance Analysis
		console.log("\n📈 PERFORMANCE ANALYSIS");
		console.log("─".repeat(40));
    
		const allResults = [...basicResults, ...advancedResults, ...behavioralResults];
		const fastest = allResults.reduce((prev, current) => 
			current.opsPerSecond > prev.opsPerSecond ? current : prev
		);
		const slowest = allResults.reduce((prev, current) => 
			current.opsPerSecond < prev.opsPerSecond ? current : prev
		);

		console.log(`✅ Fastest operation: ${fastest.name} (${this.formatNumber(fastest.opsPerSecond)} ops/sec)`);
		console.log(`🐌 Slowest operation: ${slowest.name} (${this.formatNumber(slowest.opsPerSecond)} ops/sec)`);
		console.log(`📊 Performance range: ${(fastest.opsPerSecond / slowest.opsPerSecond).toFixed(2)}x difference`);
	}
}

// Export for use
export { AnimalTrieBenchmark };

// Main execution
async function main(): Promise<void> {
	try {
		const benchmark = new AnimalTrieBenchmark({
			iterations: 500,
			warmupIterations: 50,
			animalCount: 10000
		});

		await benchmark.runAnimalBenchmark();

		console.log("\n✅ Animal benchmark with behavioral analysis completed successfully!");
	} catch (error) {
		console.error("❌ Benchmark failed:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}