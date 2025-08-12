import * as fs from "fs";
import * as readline from "readline";
import { Transform } from "stream";
import TrieNode from "./trie-node";

// Type definitions
interface LoadFromFileOptions {
	delimiter?: string;
	encoding?: BufferEncoding;
	skipEmpty?: boolean;
	transform?: (word: string, lineNumber: number) => string | { word: string; data: any } | null;
	onProgress?: (linesProcessed: number, wordsInserted: number) => void;
	batchSize?: number;
}

interface TransformStreamOptions {
	skipEmpty?: boolean;
	transform?: (word: string) => string | { word: string; data: any } | null;
}

interface LoadResult {
	linesProcessed: number;
	wordsInserted: number;
}

interface WordResult<T> {
	word: string;
	data: T | null;
}

interface TrieStats {
	size: number;
	nodes: number;
	maxDepth: number;
	avgDepth: number;
	memoryUsage: number;
}

interface TrieJSON {
	size: number;
	root: TrieNodeJSON;
}

interface TrieNodeJSON {
	isEndOfWord: boolean;
	data: any;
	children: Record<string, TrieNodeJSON>;
}

class Trie<T = unknown> {
	private root: TrieNode<T>;
	private size: number;

	constructor() {
		this.root = new TrieNode<T>();
		this.size = 0;
	}

	/**
	 * Insert a word into the trie
	 * @param word - The word to insert
	 * @param data - Optional data to associate with the word
	 * @throws {Error} If word is not a string
	 */
	insert(word: string, data: T | null = null): void {
		if (typeof word !== "string") {
			throw new Error("Word must be a string");
		}

		let node = this.root;
		const normalizedWord = word.toLowerCase();

		for (const char of normalizedWord) {
			if (!node.children.has(char)) {
				node.children.set(char, new TrieNode<T>());
			}
			node = node.children.get(char)!;
		}

		if (!node.isEndOfWord) {
			this.size++;
		}

		node.isEndOfWord = true;
		node.data = data;
	}

	/**
	 * Search for a word in the trie
	 * @param word - The word to search for
	 * @returns True if word exists
	 */
	search(word: string): boolean {
		const node = this._findNode(word);
		return node !== null && node.isEndOfWord;
	}

	/**
	 * Check if any word starts with the given prefix
	 * @param prefix - The prefix to search for
	 * @returns True if prefix exists
	 */
	startsWith(prefix: string): boolean {
		return this._findNode(prefix) !== null;
	}

	/**
	 * Get data associated with a word
	 * @param word - The word to get data for
	 * @returns The data associated with the word, or null
	 */
	getData(word: string): T | null {
		const node = this._findNode(word);
		return (node && node.isEndOfWord) ? node.data : null;
	}

	/**
	 * Get all words with the given prefix
	 * @param prefix - The prefix to search for
	 * @param limit - Maximum number of results (default: no limit)
	 * @returns Array of words with the prefix
	 */
	getWordsWithPrefix(prefix: string, limit: number = Infinity): WordResult<T>[] {
		const results: WordResult<T>[] = [];
		const prefixNode = this._findNode(prefix);

		if (!prefixNode) return results;

		this._collectWords(prefixNode, prefix.toLowerCase(), results, limit);
		return results;
	}

	/**
	 * Delete a word from the trie
	 * @param word - The word to delete
	 * @returns True if word was deleted
	 */
	delete(word: string): boolean {
		if (!word || typeof word !== "string") return false;
		
		const normalizedWord = word.toLowerCase();
		
		// First check if the word exists
		if (!this.search(normalizedWord)) {
			return false;
		}
		
		// Word exists, so delete it
		this._deleteHelper(this.root, normalizedWord, 0);
		return true;
	}

	/**
	 * Load words from a file stream
	 * @param filePath - Path to the file
	 * @param options - Options for file processing
	 * @returns Promise with processing results
	 */
	async loadFromFile(filePath: string, options: LoadFromFileOptions = {}): Promise<LoadResult> {
		const {
			encoding = "utf8",
			skipEmpty = true,
			transform = null,
			onProgress = null,
			batchSize = 1000
		} = options;

		if (!fs.existsSync(filePath)) {
			throw new Error(`File not found: ${filePath}`);
		}

		return new Promise((resolve, reject) => {
			const fileStream = fs.createReadStream(filePath, { encoding });
			const rl = readline.createInterface({
				input: fileStream,
				crlfDelay: Infinity
			});

			let lineCount = 0;
			let batch: { line: string; lineNumber: number }[] = [];
			const initialSize = this.size;

			const processBatch = (): void => {
				for (const { line, lineNumber } of batch) {
					if (skipEmpty && !line.trim()) continue;

					try {
						let word = line.trim();
						let data: T | null = null;

						if (transform) {
							const result = transform(word, lineNumber);
							if (result === null) {
								continue; // Skip this word
							} else if (result && typeof result === "object" && "word" in result) {
								word = result.word || word;
								data = (result.data as T) || null;
							} else if (result) {
								word = result;
							}
						}

						if (word) {
							this.insert(word, data);
						}
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : "Unknown error";
						console.warn(`Error processing line ${lineNumber}: ${errorMessage}`);
					}
				}
				batch = [];

				if (onProgress) {
					onProgress(lineCount, this.size);
				}
			};

			rl.on("line", (line: string) => {
				lineCount++;
				batch.push({ line, lineNumber: lineCount });

				if (batch.length >= batchSize) {
					processBatch();
				}
			});

			rl.on("close", () => {
				if (batch.length > 0) {
					processBatch();
				}
				resolve({
					linesProcessed: lineCount,
					wordsInserted: this.size - initialSize
				});
			});

			rl.on("error", reject);
			fileStream.on("error", reject);
		});
	}

	/**
	 * Create a transform stream for processing words
	 * @param options - Transform options
	 * @returns Transform stream
	 */
	createTransformStream(options: TransformStreamOptions = {}): Transform {
		const {
			skipEmpty = true,
			transform = null
		} = options;

		return new Transform({
			objectMode: true,
			transform: (chunk: Buffer, _encoding: BufferEncoding, callback: Function) => {
				const lines = chunk.toString().split("\n");

				for (const line of lines) {
					if (skipEmpty && !line.trim()) continue;

					try {
						let word = line.trim();
						let data: T | null = null;

						if (transform) {
							const result = transform(word);
							if (result && typeof result === "object" && "word" in result) {
								word = result.word || word;
								data = (result.data as T) || null;
							} else if (result) {
								word = result;
							}
						}

						if (word) {
							this.insert(word, data);
						}
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : "Unknown error";
						console.warn(`Error processing word: ${errorMessage}`);
					}
				}

				callback();
			}
		});
	}

	/**
	 * Export trie to JSON
	 * @returns JSON representation of the trie
	 */
	toJSON(): TrieJSON {
		return {
			size: this.size,
			root: this._nodeToJSON(this.root)
		};
	}

	/**
	 * Load trie from JSON
	 * @param json - JSON representation
	 */
	fromJSON(json: TrieJSON): void {
		if (!json || typeof json !== "object") {
			throw new Error("Invalid JSON object");
		}

		this.size = json.size || 0;
		this.root = this._nodeFromJSON(json.root || {} as TrieNodeJSON);
	}

	/**
	 * Get statistics about the trie
	 * @returns Trie statistics
	 */
	getStats(): TrieStats {
		const stats: TrieStats = {
			size: this.size,
			nodes: 0,
			maxDepth: 0,
			avgDepth: 0,
			memoryUsage: 0
		};

		const depths: number[] = [];
		this._calculateStats(this.root, 0, stats, depths);

		if (depths.length > 0) {
			stats.avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length;
		}

		// Rough memory calculation
		stats.memoryUsage = stats.nodes * 64; // Rough estimate in bytes

		return stats;
	}

	/**
	 * Clear all data from the trie
	 */
	clear(): void {
		this.root = new TrieNode<T>();
		this.size = 0;
	}

	/**
	 * Get the current size of the trie
	 */
	getSize(): number {
		return this.size;
	}

	// Private helper methods
	private _findNode(word: string): TrieNode<T> | null {
		let node = this.root;

		for (const char of word.toLowerCase()) {
			const childNode = node.children.get(char);
			if (!childNode) {
				return null;
			}
			node = childNode;
		}

		return node;
	}

	private _collectWords(node: TrieNode<T>, prefix: string, results: WordResult<T>[], limit: number): void {
		if (results.length >= limit) return;

		if (node.isEndOfWord) {
			results.push({
				word: prefix,
				data: node.data
			});
		}

		for (const [char, childNode] of node.children) {
			if (results.length >= limit) break;
			this._collectWords(childNode, prefix + char, results, limit);
		}
	}

	private _deleteHelper(node: TrieNode<T>, word: string, index: number): boolean {
		if (index === word.length) {
			if (!node.isEndOfWord) return false;

			node.isEndOfWord = false;
			node.data = null;
			this.size--;

			// Return true if this node has no children (can be deleted)
			return node.children.size === 0;
		}

		const char = word[index];
		const childNode = node.children.get(char);

		if (!childNode) return false;

		const shouldDeleteChild = this._deleteHelper(childNode, word, index + 1);

		if (shouldDeleteChild) {
			node.children.delete(char);
			// Return true if this node can also be deleted (has no children and is not end of word)
			return node.children.size === 0 && !node.isEndOfWord;
		}

		return false;
	}

	private _nodeToJSON(node: TrieNode<T>): TrieNodeJSON {
		const result: TrieNodeJSON = {
			isEndOfWord: node.isEndOfWord,
			data: node.data,
			children: {}
		};

		for (const [char, childNode] of node.children) {
			result.children[char] = this._nodeToJSON(childNode);
		}

		return result;
	}

	private _nodeFromJSON(json: TrieNodeJSON): TrieNode<T> {
		const node = new TrieNode<T>();
		node.isEndOfWord = json.isEndOfWord || false;
		node.data = (json.data as T) || null;

		if (json.children) {
			for (const [char, childJson] of Object.entries(json.children)) {
				node.setChild(char, this._nodeFromJSON(childJson));
			}
		}

		return node;
	}

	private _calculateStats(node: TrieNode<T>, depth: number, stats: TrieStats, depths: number[]): void {
		stats.nodes++;
		stats.maxDepth = Math.max(stats.maxDepth, depth);

		if (node.isEndOfWord) {
			depths.push(depth);
		}

		for (const childNode of node.children.values()) {
			this._calculateStats(childNode, depth + 1, stats, depths);
		}
	}
}

export { Trie, TrieNode };
export type { LoadFromFileOptions, TransformStreamOptions, LoadResult, WordResult, TrieStats, TrieJSON };
export default Trie;