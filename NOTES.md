NOTES

happy things
  - solves the cache/no-cache-explosion issue
    - by preventing mutations on original (except closure state)
    - by allowing mutable lazy clones of original
    - by enabling cache

perf problems
  - we wrap things too eagerly
    - eg: kowtow set hits will wrap the overwrite content
  - call stack depth in Proxy handler functions

existential problems
  - kowtow must run before membrane
    - bc it needs to decide what realm and obj came from
  - kowtow needs to be able to "exit early"
    - kowtow basically needs to only occasionally call the membrane handler / membrane tools
    - kowtow needs access to the bridge fn?
  - is localWrites distortion sound?
    - interaction with closure state?
    - input and output from what graph (in/out)?
      - if thisRef is the proxy, its the out graph but mixes with inGraph closureState
        - may be able to look up graph origin and otherwise its from in graph
