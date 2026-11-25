# Repository instructions

## Release version numbering

- Use a separate release sequence for each versioned project. A new sequence starts at `1.0.0`. Show zero-patch versions as `v1.0`, `v1.1`, and so on in public app and documentation labels. Show all three parts for maintenance patches, such as `v1.0.4`. Keep all three parts in machine-readable metadata and GitHub release titles and tags.
- Use patch increments `.1` through `.4` within a minor series for small user-facing fixes and refinements. Advance the minor number and reset the patch for a substantial feature or coherent set of larger user-facing improvements. Continue the same pattern through `v1.4`. An explicitly authorized major-series rollover starts at `v2.0`. At patch `.4`, use the next planned release or follow an explicitly requested maintenance version.
- Choose the increment from the completed user-facing changes going into the release, including work in the commits being prepared. Treat related commits as one release. Keep routine internal changes, documentation, tests, dependency maintenance, and packaging in the current or pending version. Review existing drafts and reuse a matching pending version when appropriate. Bump the version only when the user explicitly requests it for the current work.
- Keep public labels consistent across the app, guides, and release notes. Preserve historical version identifiers and dates. Apply project-specific version exceptions where they are explicitly documented.
