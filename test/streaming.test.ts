import { Trie, loadTrieFromFile, LoadResult } from "../src";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

interface TestMetadata {
	original: string;
	line: number;
}

describe("File Streaming", () => {
	let tempDir: string;
	let testFile: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "trie-test-"));
		testFile = path.join(tempDir, "test-words.txt");
	});

	afterEach(() => {
		if (fs.existsSync(tempDir)) {
			fs.rmSync(tempDir, { recursive: true });
		}
	});

	test("should load words from file", async () => {
		const words = ["apple", "banana", "cherry", "date"];
		fs.writeFileSync(testFile, words.join("\n"));

		const trie = new Trie<string>();
		const result: LoadResult = await trie.loadFromFile(testFile);

		expect(result.linesProcessed).toBe(4);
		expect(result.wordsInserted).toBe(4);
		expect(trie.getSize()).toBe(4);

		words.forEach(word => {
			expect(trie.search(word)).toBe(true);
		});
	});

	test("should handle empty lines correctly", async () => {
		const content = "apple\n\nbanana\n\ncherry\n";
		fs.writeFileSync(testFile, content);

		const trie = new Trie<string>();
		const result = await trie.loadFromFile(testFile, { skipEmpty: true });

		expect(result.linesProcessed).toBe(5);
		expect(result.wordsInserted).toBe(3);
		expect(trie.getSize()).toBe(3);
	});

	test("should apply transform function with typed data", async () => {
		const words = ["Apple", "BANANA", "Cherry"];
		fs.writeFileSync(testFile, words.join("\n"));

		const trie = new Trie<TestMetadata>();
		await trie.loadFromFile(testFile, {
			transform: (word: string, lineNum: number) => ({
				word: word.toLowerCase(),
				data: { original: word, line: lineNum }
			})
		});

		expect(trie.search("apple")).toBe(true);
		expect(trie.search("banana")).toBe(true);

		const appleData = trie.getData("apple");
		expect(appleData).toEqual({ original: "Apple", line: 1 });

		const bananaData = trie.getData("banana");
		expect(bananaData).toEqual({ original: "BANANA", line: 2 });
	});

	test("should call progress callback with correct types", async () => {
		const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
		fs.writeFileSync(testFile, words.join("\n"));

		const progressCalls: Array<{ lines: number; wordsCount: number }> = [];
		const trie = new Trie<string>();

		await trie.loadFromFile(testFile, {
			batchSize: 10,
			onProgress: (lines: number, wordsCount: number) => {
				progressCalls.push({ lines, wordsCount });
			}
		});

		expect(progressCalls.length).toBeGreaterThan(0);
		expect(progressCalls[progressCalls.length - 1].lines).toBe(100);
		expect(progressCalls[progressCalls.length - 1].wordsCount).toBe(100);
	});

	test("should handle file not found error", async () => {
		const trie = new Trie<string>();
		const nonExistentFile = path.join(tempDir, "does-not-exist.txt");

		await expect(trie.loadFromFile(nonExistentFile)).rejects.toThrow("File not found");
	});

	test("should use loadTrieFromFile utility with types", async () => {
		const words = ["hello", "world", "test"];
		fs.writeFileSync(testFile, words.join("\n"));

		const { trie, linesProcessed, wordsInserted } = await loadTrieFromFile<string>(testFile);

		expect(linesProcessed).toBe(3);
		expect(wordsInserted).toBe(3);
		expect(trie.getSize()).toBe(3);
		expect(trie.search("hello")).toBe(true);
	});

	test("should handle complex transform scenarios", async () => {
		const content = `
      # This is a comment
      apple,fruit,red
      banana,fruit,yellow
      carrot,vegetable,orange
      
      # Another comment
      dog,animal,brown
    `;
		fs.writeFileSync(testFile, content);

		interface CSVData {
			category: string;
			color: string;
			isValid: boolean;
		}

		const trie = new Trie<CSVData>();
		const result = await trie.loadFromFile(testFile, {
			skipEmpty: true,
			transform: (line: string) => { // Removed unused lineNum parameter
				const trimmed = line.trim();

				// Skip comments
				if (trimmed.startsWith("#") || trimmed === "") {
					return null;
				}

				const parts = trimmed.split(",");
				if (parts.length !== 3) {
					return null;
				}

				const [word, category, color] = parts;
				return {
					word: word.toLowerCase(),
					data: {
						category: category.trim(),
						color: color.trim(),
						isValid: true
					}
				};
			}
		});

		expect(result.wordsInserted).toBe(4);
		expect(trie.search("apple")).toBe(true);
		expect(trie.search("dog")).toBe(true);

		const appleData = trie.getData("apple");
		expect(appleData).toEqual({
			category: "fruit",
			color: "red",
			isValid: true
		});
	});

	test("should handle encoding options", async () => {
		const words = ["café", "naïve", "résumé"];
		fs.writeFileSync(testFile, words.join("\n"), "utf8");

		const trie = new Trie<string>();
		await trie.loadFromFile(testFile, { encoding: "utf8" });

		expect(trie.search("café")).toBe(true);
		expect(trie.search("naïve")).toBe(true);
		expect(trie.search("résumé")).toBe(true);
	});

	test("should handle batch processing correctly", async () => {
		const words = Array.from({ length: 1000 }, (_, i) => `batch_word_${i}`);
		fs.writeFileSync(testFile, words.join("\n"));

		const trie = new Trie<{ index: number }>();
		let batchCount = 0;

		await trie.loadFromFile(testFile, {
			batchSize: 100,
			onProgress: () => { batchCount++; },
			transform: (word: string, lineNum: number) => ({
				word,
				data: { index: lineNum }
			})
		});

		expect(trie.getSize()).toBe(1000);
		expect(batchCount).toBeGreaterThan(5); // Should have multiple batch processing calls

		const testWordData = trie.getData("batch_word_500");
		expect(testWordData).toEqual({ index: 501 }); // Line numbers start at 1
	});

	test("should create transform stream", () => {
		const trie = new Trie<string>();
		const transformStream = trie.createTransformStream({
			skipEmpty: true,
			transform: (word: string) => word.toLowerCase()
		});

		expect(transformStream).toBeDefined();
		expect(transformStream.writable).toBe(true);
		expect(transformStream.readable).toBe(true);
	});

	test("should handle errors in transform function gracefully", async () => {
		const words = ["valid", "another_valid", "also_valid"];
		fs.writeFileSync(testFile, words.join("\n"));

		const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

		const trie = new Trie<string>();
		await trie.loadFromFile(testFile, {
			transform: (word: string, lineNum: number) => {
				if (lineNum === 2) {
					throw new Error("Simulated transform error");
				}
				return word;
			}
		});

		expect(consoleSpy).toHaveBeenCalledWith(
			expect.stringContaining("Error processing line 2")
		);
		expect(trie.getSize()).toBe(2); // Only valid words should be inserted
		expect(trie.search("valid")).toBe(true);
		expect(trie.search("also_valid")).toBe(true);

		consoleSpy.mockRestore();
	});
});