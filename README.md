### Introduction

This project is a **learning-oriented trie implementation** in TypeScript / Node.js to understand performance trade-offs and features. It’s **not optimized for production**, but serves as an educational reference. At the same time it is called "dumb" because ther are on optimizations yet, this is just RAW and standard trie.

### Features

* Stores **rich JSON values** (e.g. animal metadata) per key.
* Supports:

  * 🔁 **Insert** & **Search**
  * 🔍 **Prefix search**
  * 📦 Optional **batch operations**
  * ❌ Fuzzy search (planned)
* Memory & performance metrics included.

### Benchmark Summary

Based on 10K realistic entries and 500 iterations (50 warmup):

* **Key-Value insert + search**: \~9.1K ops/sec vs \~140 K ops/sec for Map/Object.
* **Prefix search**: \~95 K ops/sec vs \~11 K ops/sec with simulation via Map/Object.
* **Memory**: Trie uses less memory for heavy prefix commonality (\~0.21×) on \~3K shared-prefix items.

### Use Cases

This trie is ideal for:

* Learning about data structures and benchmarks.
* Exploring when **prefix operations**, **shared-prefix memory savings**, or **fuzzy search** are needed.
* Understanding the contrast with native JavaScript Maps/Objects.

### Limitations

* May not match native Map/Object speed for simple key lookups.
* Not optimized for very large datasets.
* Written for demonstration, not production.

---

### Future Directions

Planned enhancements for version 2.1 and beyond (I am also considering of making smart-trie a dedicated repo and npm library):

* **Data Deduplication**
  Reduce memory usage by avoiding redundant copies of identical metadata or value objects.

* **Compression**
  Optional compression (e.g. Gzip or Brotli) for storing large subtrees or metadata blobs, especially when persisting to disk.

* **Fuzzy Search**
  Support approximate string matching using algorithms like Damerau–Levenshtein, useful for typos and intelligent autocomplete.

* **Advanced Heuristics**
  Implement search heuristics inspired by Sublime Text’s fuzzy search for more intuitive matching (e.g. acronym support, non-sequential matches).

* **Custom Serialization**
  Allow pluggable formats for saving and loading the trie (JSON, binary, compressed), making it easier to integrate into different systems.

* **WebAssembly (WASM) Acceleration**
  Use WASM to offload performance-critical parts of the trie logic and achieve near-native speed.

* **Encryption Support**
  Built-in support for encrypting values (e.g., using AES) for secure data storage.

* **Distributed Mode**
  Enable multi-node support, including sharded or partitioned tries for large-scale deployments or concurrent access.

* **Machine Learning Integration**
  Add ranking/relevance scoring based on user behavior, usage frequency, or embedded metadata.

* **Incremental Updates**
  Allow efficient partial rebuilds of the trie, avoiding full re-inserts when only a small subset of entries change.

* **Radix / Patricia Trie Variant**
  Explore compressed trie structures that merge common path segments to reduce memory and improve query traversal depth.

* **Typed Array / Contiguous Memory Storage**
  Investigate node storage using typed arrays or contiguous memory blocks to reduce garbage collection overhead and improve cache locality.

* **Range & Field Queries**
  Support numeric or field-based queries like `legCount > 2`, enabling use cases beyond prefix search.

* **Batch Insert/Delete Operations**
  Improve performance for large data imports or cleanup tasks.

* **Persistent Storage**
  Enable file-based saving and loading of the trie state, optionally compressed or encrypted.

---

tbh idk what im doing i made this on the bus on the way home.

Despite its chaotic origin, this project ended up handling 200K+ ops/sec in simulated security workloads, using just raw TypeScript. So yeah, it stayed on the bus, but didn’t miss the packet.

Benchmarks are done on a windows 11 pro machine running in visual studio code, with Core i7 1165G7 on battery power