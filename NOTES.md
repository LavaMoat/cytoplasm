NOTES

kowtow thoughts
- Shadow-on-write protections require three unique membrane spaces
  1. Original
  2. Shadow-layer
  3. Consumer
- layers 1+2 must be seperated to gurantee seperation of graphs
- layers 2+3 must be seperated
  - so that old
  - closure state can be directly set on the inputs?


a new hope
  - cross-package interaction should be mediated by read-only membrane spaces


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
