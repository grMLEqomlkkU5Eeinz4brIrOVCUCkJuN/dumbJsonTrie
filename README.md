### Introduction

This project is a **learning-oriented trie implementation** in TypeScript / Node.js to understand performance trade-offs and features. It's **not optimized for production**, but serves as an educational reference. At the same time it is called "dumb" because there are no optimizations yet, this is just RAW and standard trie.

**🚀 Despite being "dumb" and unoptimized, this trie can still handle massive scale operations!**

### Features

* Stores **rich JSON values** (e.g. animal metadata) per key.
* Supports:
  * 🔁 **Insert** & **Search**
  * 🔍 **Prefix search**
  * 📦 Optional **batch operations**
  * ❌ Fuzzy search (planned)
* Memory & performance metrics included.

### 🚀 Performance at Scale

This trie demonstrates what's possible even without optimizations, handling **massive datasets** across multiple domains:

#### **Dataset Scale**
* **10,000+ animals** with rich metadata
* **5,000+ detailed entries** with behavioral characteristics
* **10,000+ IP addresses** with security metadata
* **5,000+ threat intelligence entries**
* **500 benchmark iterations** with 50 warmup cycles
* **3,000+ animals** with shared family prefixes for memory analysis
* **3,000+ IPs** with shared subnet prefixes for memory analysis

#### **Performance Benchmarks**

**🟢 BASIC OPERATIONS**
* **Animal Data Insert**: 1.13K ops/sec (0.889ms avg)
* **Animal Data Search**: 1.38K ops/sec (0.723ms avg)
* **IP Address Insert**: 26.03K ops/sec (0.038ms avg)
* **IP Address Search**: 31.57K ops/sec (0.032ms avg)

**🔵 ADVANCED OPERATIONS**
* **Animal Family Prefix Search**: 8.03K ops/sec (0.125ms avg)
* **Animal Range Search (Multiple Families)**: **345.54K ops/sec** (0.003ms avg) ⚡
* **Animal Data Delete**: 862.83 ops/sec (1.159ms avg)
* **IP Subnet Prefix Search**: **290.66K ops/sec** (0.003ms avg) ⚡
* **IP Range Search (Multiple Subnets)**: 260.78K ops/sec (0.004ms avg)
* **IP Address Delete**: 26.65K ops/sec (0.038ms avg)

**🔴 DOMAIN-SPECIFIC ANALYSIS**
* **Dangerous Animal Detection**: 2.93K ops/sec (0.341ms avg)
* **Animal Behavioral Analysis**: 2.70K ops/sec (0.371ms avg)
* **Habitat Analysis**: 295.25K ops/sec (0.003ms avg)
* **Species Classification**: 3.00K ops/sec (0.333ms avg)
* **Malicious IP Detection (DPI)**: 24.91K ops/sec (0.040ms avg)
* **Threat Intelligence Lookup**: 30.62K ops/sec (0.033ms avg)
* **Behavioral Analysis (Real-time)**: 21.19K ops/sec (0.047ms avg)
* **Subnet Threat Analysis**: 26.43K ops/sec (0.038ms avg)

**🟡 MEMORY EFFICIENCY**
* **Total memory for 3K animals**: 1.12 MB
* **Memory per animal**: 390.512 bytes
* **Total memory for 3K IPs**: 1.02 MB
* **Memory per IP**: 348.32 bytes
* **Animal nodes**: 3,048 (efficient prefix sharing)
* **IP nodes**: 3,043 (efficient subnet sharing)

#### **Performance Highlights**
* **Fastest operation**: Animal Range Search at **345.54K ops/sec**
* **IP performance**: Subnet Prefix Search at **290.66K ops/sec**
* **Performance range**: 400.48x difference (animals), 13.72x difference (IPs)
* **Memory usage**: Reasonable for datasets with shared prefixes
* **Scale handling**: Can manage thousands of complex JSON objects across domains
* **Cross-domain capability**: Handles both natural language (animals) and structured data (IPs) efficiently

### Use Cases

This trie is ideal for:

* Learning about data structures and benchmarks.
* Exploring when **prefix operations**, **shared-prefix memory savings**, or **fuzzy search** are needed.
* Understanding the contrast with native JavaScript Maps/Objects.
* **Large-scale data processing** where prefix operations are common.
* **Rich metadata storage** with efficient retrieval patterns.
* **Network security applications** (IP address management, threat detection, DPI).
* **Natural language processing** (taxonomic classification, behavioral analysis).
* **Cross-domain data structures** that need to handle different data types efficiently.

### Limitations

* May not match native Map/Object speed for simple key lookups.
* Not optimized for very large datasets (though it handles 10K+ entries well).
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

Benchmarks are done on a windows 11 pro machine running in visual studio code, with Core i7 1165G7 on battery power and 16GB RAM.

As all benchmarks are: Note that for generation that there are some forms of random, so when running on your own each time, understand that luck somewhat matters too.