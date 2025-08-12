// unknown because we don't know what the user might want to store in the TrieNode
// last thing we want is to use any and the user stores like undefined or null, but leaving it as unknown
// allows the user to specify a type when they create a TrieNode primarily strings and numbers i guess lolol


// future grml here: yeah no idea what im doing with this file
// it started as me trying to make an actual trie for validation and then somehow now i am working with it storing metadata
export default class TrieNode<T = unknown> {
	children: Map<string, TrieNode<T>>;
	isEndOfWord: boolean;
	data: T | null;
	constructor() {
		this.children = new Map();
		this.isEndOfWord = false;
		this.data = null;
	}

	isParent(): boolean {
		return this.children.size > 0;
	}

	getChild(char: string): TrieNode<T> | null {
		return this.children.get(char) || null;
	}

	setChild(char: string, node: TrieNode<T>): void {
		this.children.set(char, node);
	}

	removeChild(char: string): boolean {
		return this.children.delete(char);
	}
}