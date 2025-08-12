import { loadTrieFromFile, Trie } from "../src";
import * as fs from "fs";
import * as path from "path";

// Type for our word data
interface WordMetadata {
  lineNumber: number;
  length: number;
  firstChar: string;
}

// Create sample data if it doesn't exist
const sampleDataDir = path.join(__dirname, "sample-data");
const sampleFile = path.join(sampleDataDir, "words.txt");

if (!fs.existsSync(sampleDataDir)) {
	fs.mkdirSync(sampleDataDir);
}

if (!fs.existsSync(sampleFile)) {
	const sampleWords = [
		"apple", "application", "apply", "appreciate", "approach",
		"banana", "band", "bank", "bar", "base",
		"cat", "car", "card", "care", "carry",
		"dog", "door", "down", "draw", "drive",
		"elephant", "email", "end", "enter", "example",
		"fish", "find", "fire", "first", "follow",
		"great", "green", "group", "grow", "game"
	];
  
	fs.writeFileSync(sampleFile, sampleWords.join("\n"));
	console.log("Created sample data file:", sampleFile);
}

async function streamingExample(): Promise<void> {
	console.log("\n=== File Streaming Example ===\n");
  
	try {
		console.log("Loading words from file with progress tracking...");
    
		// Load with typed metadata
		const { trie, linesProcessed, wordsInserted } = await loadTrieFromFile<WordMetadata>(sampleFile, {
			onProgress: (lines: number, words: number) => {
				if (lines % 10 === 0 || lines === 1) {
					console.log(`Progress: ${lines} lines processed, ${words} words inserted`);
				}
			},
			transform: (word: string, lineNumber: number) => ({
				word: word.toLowerCase().trim(),
				data: { 
					lineNumber, 
					length: word.length,
					firstChar: word.charAt(0).toUpperCase()
				}
			})
		});
    
		console.log(`\nCompleted! Processed ${linesProcessed} lines, inserted ${wordsInserted} words`);
		console.log(`Trie size: ${trie.getSize()}`);
    
		// Demonstrate usage with type safety
		console.log("\n=== Using Loaded Trie ===");
    
		// Find words starting with 'app'
		const appWords = trie.getWordsWithPrefix("app", 5);
		console.log("Words starting with \"app\":", 
			appWords.map(item => {
				const metadata = item.data;
				return `${item.word} (line: ${metadata?.lineNumber || "unknown"})`;
			}));
    
		// Find words starting with 'gr'
		const grWords = trie.getWordsWithPrefix("gr");
		console.log("Words starting with \"gr\":", 
			grWords.map(item => item.word));
    
		// Show statistics
		console.log("\nTrie Statistics:");
		const stats = trie.getStats();
		console.log(`Size: ${stats.size}, Nodes: ${stats.nodes}, Max Depth: ${stats.maxDepth}`);
		console.log(`Avg Depth: ${stats.avgDepth.toFixed(2)}, Memory: ~${(stats.memoryUsage / 1024).toFixed(2)} KB`);
    
		// Export to JSON
		console.log("\n=== JSON Export/Import ===");
		const json = trie.toJSON();
		console.log(`JSON size: ${JSON.stringify(json).length} characters`);
    
		// Create new trie from JSON
		const newTrie = new Trie<WordMetadata>();
		newTrie.fromJSON(json);
		console.log(`New trie size: ${newTrie.getSize()}`);
		console.log("JSON import successful:", newTrie.search("apple"));
    
		// Demonstrate type-safe data access
		const appleData = newTrie.getData("apple");
		if (appleData) {
			console.log(`Apple metadata - Length: ${appleData.length}, First char: ${appleData.firstChar}`);
		}
    
	} catch (error) {
		if (error instanceof Error) {
			console.error("Error in streaming example:", error.message);
		} else {
			console.error("Unknown error:", error);
		}
	}
}

// Autocomplete class example with TypeScript
class AutoComplete<T = string> {
	private trie: Trie<T>;
  
	constructor() {
		this.trie = new Trie<T>();
	}
  
	async loadDictionary(filePath: string): Promise<void> {
		await this.trie.loadFromFile(filePath, {
			transform: (word: string) => word.toLowerCase().trim()
		});
	}
  
	getSuggestions(prefix: string, maxResults: number = 10): string[] {
		return this.trie.getWordsWithPrefix(prefix, maxResults)
			.map(result => result.word);
	}
  
	addWord(word: string, metadata?: T): void {
		this.trie.insert(word, metadata || null);
	}
  
	hasWord(word: string): boolean {
		return this.trie.search(word);
	}
  
	getWordData(word: string): T | null {
		return this.trie.getData(word);
	}
  
	getStats(): import("../src").TrieStats {
		return this.trie.getStats();
	}
}

async function autocompleteExample(): Promise<void> {
	console.log("\n=== Autocomplete Example ===");
  
	const autocomplete = new AutoComplete<WordMetadata>();
  
	// Add some words manually
	autocomplete.addWord("program", { lineNumber: 1, length: 7, firstChar: "P" });
	autocomplete.addWord("programming", { lineNumber: 2, length: 11, firstChar: "P" });
	autocomplete.addWord("programmer", { lineNumber: 3, length: 10, firstChar: "P" });
  
	const suggestions = autocomplete.getSuggestions("prog");
	console.log("Suggestions for \"prog\":", suggestions);
  
	const programData = autocomplete.getWordData("program");
	console.log("Program metadata:", programData);
}

// Run examples
streamingExample().then(() => {
	return autocompleteExample();
}).catch(console.error);