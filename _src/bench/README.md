# bench-node Benchmark Harness

This project uses [`bench-node`](https://www.npmjs.com/package/bench-node) for repeatable microbenchmarks.

## Run

From `_src/`:

- `npm run bench` prints a human-readable benchmark report.
- `npm run bench:json` prints machine-readable JSON output.

## Add a New Benchmark

1. Create a new file in `bench/suites/` ending with `.bench.js`.
2. Export a function with signature `(suite, context) => void`.
3. Register one or more benchmarks with `suite.add(...)`.

Example:

```js
module.exports = function registerSuite (suite, context) {
  suite.add('my-benchmark-name', () => {
    const value = context.someHelper()
    if (!value) {
      throw new Error('unexpected value')
    }
  })
}
```

## Notes

- Benchmark runner entrypoint: `bench/index.js`.
- Suite files are auto-discovered from `bench/suites/*.bench.js`.
- Keep benchmark bodies deterministic and avoid I/O in tight loops.
- Use guards/assertions so code is not optimized away.
