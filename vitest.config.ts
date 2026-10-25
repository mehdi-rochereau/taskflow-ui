import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration, loaded by the Angular unit-test builder through the
 * `runnerConfig` option declared in angular.json.
 *
 * It exists for one reason only. The @angular/build:unit-test builder exposes
 * coverage measurement through --coverage and its companion flags, but it
 * exposes no threshold option, so there is no way to make the command fail
 * below a given percentage from angular.json alone.
 *
 * Caveat worth knowing before an Angular upgrade: the builder loads this file
 * but the Angular team does not support its contents. A major version bump may
 * change how it is merged with the configuration the builder generates itself.
 */
export default defineConfig({
  test: {
    coverage: {
      // v8 is the provider the builder already installs with
      // @vitest/coverage-v8. Istanbul would instrument the source instead of
      // using the engine's own counters, which is slower for no gain here.
      provider: 'v8',

      // A summary rather than a per-file table. The per-file detail belongs to
      // a local run when someone is looking for a gap, not to every CI log.
      reporter: ['text-summary'],

      // `enabled` is deliberately left unset, so it stays false by default and
      // coverage only runs when --coverage is passed. That keeps `npm test`
      // fast for the development loop while `npm run test:coverage` enforces
      // the thresholds below.

      // Set one to two points under the baseline measured on 25 October 2026,
      // which was 79.48 statements, 81.64 branches, 68.80 functions and 80.66
      // lines. A threshold set exactly at the baseline fails on the first
      // harmless change; this margin catches a real regression instead.
      //
      // The figures describe the code that tests load, not the whole
      // application: files no spec imports never appear in the report. The
      // coverage table in TESTING.md is the inventory of what is and is not
      // covered, and it is the document to read, not this number.
      thresholds: {
        statements: 78,
        branches: 80,
        functions: 67,
        lines: 79,
      },
    },
  },
});
