import { Trie, TrieNode, WordResult, TrieStats } from "../src";

describe("Trie", () => {
	let trie: Trie<string>;
  
	beforeEach(() => {
		trie = new Trie<string>();
	});
  
	describe("Basic Operations", () => {
		test("should create empty trie", () => {
			expect(trie.getSize()).toBe(0);
			expect(trie.search("anything")).toBe(false);
		});

		test("should insert and search words", () => {
			trie.insert("hello", "greeting");
			trie.insert("world", "planet");
      
			expect(trie.search("hello")).toBe(true);
			expect(trie.search("world")).toBe(true);
			expect(trie.search("hell")).toBe(false);
			expect(trie.getSize()).toBe(2);
		});

		test("should handle case insensitive insertion", () => {
			trie.insert("Hello", "greeting");
			trie.insert("WORLD", "planet");
      
			expect(trie.search("hello")).toBe(true);
			expect(trie.search("world")).toBe(true);
			expect(trie.search("Hello")).toBe(true);
			expect(trie.search("WORLD")).toBe(true);
		});

		test("should not insert duplicate words", () => {
			trie.insert("test", "data1");
			trie.insert("test", "data2");
			trie.insert("TEST", "data3");
      
			expect(trie.getSize()).toBe(1);
			expect(trie.getData("test")).toBe("data3"); // Should have latest data
		});

		test("should throw error for non-string input", () => {
			const anyTrie = trie as any;
			expect(() => anyTrie.insert(123)).toThrow("Word must be a string");
			expect(() => anyTrie.insert(null)).toThrow("Word must be a string");
			expect(() => anyTrie.insert(undefined)).toThrow("Word must be a string");
		});
	});

	describe("Prefix Operations", () => {
		beforeEach(() => {
			trie.insert("hello", "greeting");
			trie.insert("help", "assistance");
			trie.insert("helicopter", "aircraft");
			trie.insert("world", "planet");
		});

		test("should check prefixes correctly", () => {
			expect(trie.startsWith("hel")).toBe(true);
			expect(trie.startsWith("wor")).toBe(true);
			expect(trie.startsWith("xyz")).toBe(false);
			expect(trie.startsWith("")).toBe(true);
		});

		test("should get words with prefix", () => {
			const helWords: WordResult<string>[] = trie.getWordsWithPrefix("hel");
			expect(helWords.length).toBe(3);
      
			const wordList = helWords.map(item => item.word);
			expect(wordList).toContain("hello");
			expect(wordList).toContain("help");
			expect(wordList).toContain("helicopter");
		});

		test("should limit results when specified", () => {
			const helWords = trie.getWordsWithPrefix("hel", 2);
			expect(helWords.length).toBe(2);
		});

		test("should return empty array for non-existent prefix", () => {
			const words = trie.getWordsWithPrefix("xyz");
			expect(words).toEqual([]);
		});
	});

	describe("Data Storage", () => {
    interface TestData {
      id: number;
      type: string;
    }

    test("should store and retrieve typed data", () => {
    	const typedTrie = new Trie<TestData>();
    	const testData: TestData = { id: 1, type: "greeting" };
      
    	typedTrie.insert("hello", testData);
      
    	expect(typedTrie.getData("hello")).toEqual(testData);
    	expect(typedTrie.getData("nonexistent")).toBeNull();
    });

    test("should update data for existing word", () => {
    	const typedTrie = new Trie<{ version: number }>();
      
    	typedTrie.insert("test", { version: 1 });
    	typedTrie.insert("test", { version: 2 });
      
    	expect(typedTrie.getData("test")).toEqual({ version: 2 });
    	expect(typedTrie.getSize()).toBe(1);
    });

    test("should include data in prefix search results", () => {
    	const typedTrie = new Trie<{ type: string }>();
      
    	typedTrie.insert("app", { type: "application" });
    	typedTrie.insert("apple", { type: "fruit" });
      
    	const results = typedTrie.getWordsWithPrefix("app");
    	expect(results[0].data).toBeDefined();
    	expect(results[1].data).toBeDefined();
    	expect(results.some(r => r.data?.type === "application")).toBe(true);
    	expect(results.some(r => r.data?.type === "fruit")).toBe(true);
    });
	});

	describe("Deletion", () => {
		beforeEach(() => {
			trie.insert("hello", "greeting");
			trie.insert("help", "assistance");
			trie.insert("helicopter", "aircraft");
		});

		test("should delete existing words", () => {
			expect(trie.delete("hello")).toBe(true);
			expect(trie.search("hello")).toBe(false);
			expect(trie.getSize()).toBe(2);
		});

		test("should not affect other words when deleting", () => {
			trie.delete("hello");
			expect(trie.search("help")).toBe(true);
			expect(trie.search("helicopter")).toBe(true);
		});

		test("should return false for non-existent words", () => {
			expect(trie.delete("nonexistent")).toBe(false);
			expect(trie.getSize()).toBe(3);
		});

		test("should handle deletion of prefixes correctly", () => {
			trie.insert("test", "data1");
			trie.insert("testing", "data2");
      
			trie.delete("test");
			expect(trie.search("test")).toBe(false);
			expect(trie.search("testing")).toBe(true);
		});
	});

	describe("JSON Serialization", () => {
		test("should export and import JSON correctly", () => {
			const typedTrie = new Trie<{ greeting?: boolean; planet?: boolean }>();
      
			typedTrie.insert("hello", { greeting: true });
			typedTrie.insert("world", { planet: true });
      
			const json = typedTrie.toJSON();
			expect(json.size).toBe(2);
      
			const newTrie = new Trie<{ greeting?: boolean; planet?: boolean }>();
			newTrie.fromJSON(json);
      
			expect(newTrie.getSize()).toBe(2);
			expect(newTrie.search("hello")).toBe(true);
			expect(newTrie.search("world")).toBe(true);
			expect(newTrie.getData("hello")).toEqual({ greeting: true });
		});

		test("should handle empty trie JSON", () => {
			const json = trie.toJSON();
			const newTrie = new Trie<string>();
			newTrie.fromJSON(json);
      
			expect(newTrie.getSize()).toBe(0);
		});

		test("should throw error for invalid JSON", () => {
			expect(() => trie.fromJSON(null as any)).toThrow("Invalid JSON object");
			expect(() => trie.fromJSON("invalid" as any)).toThrow("Invalid JSON object");
		});
	});

	describe("Statistics", () => {
		test("should calculate statistics correctly", () => {
			trie.insert("a", "letter");
			trie.insert("ab", "two letters");
			trie.insert("abc", "three letters");
      
			const stats: TrieStats = trie.getStats();
			expect(stats.size).toBe(3);
			expect(stats.maxDepth).toBe(3);
			expect(stats.nodes).toBeGreaterThan(0);
			expect(stats.avgDepth).toBeGreaterThan(0);
		});

		test("should handle empty trie statistics", () => {
			const stats = trie.getStats();
			expect(stats.size).toBe(0);
			expect(stats.nodes).toBe(1); // root node
			expect(stats.maxDepth).toBe(0);
		});
	});

	describe("Clear Operation", () => {
		test("should clear all data", () => {
			trie.insert("hello", "greeting");
			trie.insert("world", "planet");
      
			trie.clear();
      
			expect(trie.getSize()).toBe(0);
			expect(trie.search("hello")).toBe(false);
			expect(trie.search("world")).toBe(false);
		});
	});

	describe("Type Safety", () => {
		test("should maintain type safety with different data types", () => {
      interface NumberData {
        value: number;
      }
      
      const numberTrie = new Trie<NumberData>();
      numberTrie.insert("one", { value: 1 });
      numberTrie.insert("two", { value: 2 });
      
      const oneData = numberTrie.getData("one");
      expect(oneData).toEqual({ value: 1 });
      
      if (oneData) {
      	// TypeScript should know this is NumberData
      	expect(typeof oneData.value).toBe("number");
      }
		});

		test("should work with union types", () => {
      type UnionData = string | { id: number };
      
      const unionTrie = new Trie<UnionData>();
      unionTrie.insert("simple", "just a string");
      unionTrie.insert("complex", { id: 42 });
      
      const simpleData = unionTrie.getData("simple");
      const complexData = unionTrie.getData("complex");
      
      expect(simpleData).toBe("just a string");
      expect(complexData).toEqual({ id: 42 });
		});
	});
});

describe("TrieNode", () => {
	test("should create node with default values", () => {
		const node = new TrieNode<string>();
    
		expect(node.isEndOfWord).toBe(false);
		expect(node.data).toBeNull();
		expect(node.children.size).toBe(0);
	});

	test("should manage children correctly", () => {
		const parent = new TrieNode<string>();
		const child = new TrieNode<string>();
    
		expect(parent.isParent()).toBe(false);
		expect(parent.getChild("a")).toBeNull();
    
		parent.setChild("a", child);
    
		expect(parent.isParent()).toBe(true);
		expect(parent.getChild("a")).toBe(child);
    
		expect(parent.removeChild("a")).toBe(true);
		expect(parent.removeChild("a")).toBe(false); // Already removed
		expect(parent.isParent()).toBe(false);
	});

	test("should store typed data", () => {
		const node = new TrieNode<{ count: number }>();
    
		node.data = { count: 5 };
		node.isEndOfWord = true;
    
		expect(node.data).toEqual({ count: 5 });
		expect(node.isEndOfWord).toBe(true);
	});
});