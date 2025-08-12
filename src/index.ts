import { Trie } from "./trie";
import TrieNode from "./trie-node";

export type { 
	LoadFromFileOptions, 
	TransformStreamOptions, 
	LoadResult, 
	WordResult, 
	TrieStats, 
	TrieJSON 
} from "./trie";

export { Trie, TrieNode };

/**
 * Factory function to create a new Trie instance
 * @returns A new Trie instance
 */
export function createTrie<T = unknown>(): Trie<T> {
	return new Trie<T>();
}

/**
 * Utility function to create and load a trie from file in one step
 * @param filePath - Path to the file
 * @param options - Loading options
 * @returns Promise with trie instance and loading results
 */
export async function loadTrieFromFile<T = unknown>(
	filePath: string, 
	options: import("./trie").LoadFromFileOptions = {}
): Promise<{ trie: Trie<T> } & import("./trie").LoadResult> {
	const trie = new Trie<T>();
	const result = await trie.loadFromFile(filePath, options);
	return { trie, ...result };
}

export default Trie;