import { Trie, WordResult } from "../src";

interface WordData {
  meaning: string;
  lang: string;
}

console.log("=== Basic Trie Example ===\n");

// Create a new trie with typed data
const trie = new Trie<WordData>();

// Insert words with optional data
trie.insert("hello", { meaning: "greeting", lang: "en" });
trie.insert("help", { meaning: "assistance", lang: "en" });
trie.insert("helicopter", { meaning: "aircraft", lang: "en" });
trie.insert("world", { meaning: "planet", lang: "en" });

console.log("Inserted words: hello, help, helicopter, world");
console.log(`Trie size: ${trie.getSize()}\n`);

// Search operations
console.log("=== Search Operations ===");
console.log("Search \"hello\":", trie.search("hello"));
console.log("Search \"hell\":", trie.search("hell"));
console.log("Search \"helicopter\":", trie.search("helicopter"));
console.log("Search \"notfound\":", trie.search("notfound"));
console.log();

// Prefix operations
console.log("=== Prefix Operations ===");
console.log("Starts with \"hel\":", trie.startsWith("hel"));
console.log("Starts with \"wor\":", trie.startsWith("wor"));
console.log("Starts with \"xyz\":", trie.startsWith("xyz"));
console.log();

// Get words with prefix (fully typed results)
console.log("=== Words with Prefix ===");
const helWords: WordResult<WordData>[] = trie.getWordsWithPrefix("hel");
console.log("Words starting with \"hel\":", 
	helWords.map(item => `${item.word} (${item.data?.meaning || "no data"})`));
console.log();

// Get data (type-safe)
console.log("=== Associated Data ===");
const helloData = trie.getData("hello");
console.log("Data for \"hello\":", helloData);
console.log("Data for \"help\":", trie.getData("help"));
console.log("Data for \"notfound\":", trie.getData("notfound"));
console.log();

// Statistics
console.log("=== Trie Statistics ===");
console.log(trie.getStats());
console.log();

// Deletion
console.log("=== Deletion ===");
console.log("Delete \"help\":", trie.delete("help"));
console.log("Search \"help\" after deletion:", trie.search("help"));
console.log("Words starting with \"hel\" after deletion:", 
	trie.getWordsWithPrefix("hel").map(item => item.word));
console.log(`Trie size after deletion: ${trie.getSize()}`);

// Type safety demonstration
console.log("\n=== Type Safety Demo ===");
const typedTrie = new Trie<{ id: number; category: string }>();
typedTrie.insert("typescript", { id: 1, category: "language" });
typedTrie.insert("javascript", { id: 2, category: "language" });

// TypeScript will ensure type safety here
const tsData = typedTrie.getData("typescript");
if (tsData) {
	console.log(`TypeScript ID: ${tsData.id}, Category: ${tsData.category}`);
}