# Dependency updates

Dependabot proposals, CI checks, and existing tested patch/minor auto-merges remain
automatic. Other repository automation is unchanged. Automatic merging requires:

- A Dependabot-authored patch or minor update with a successful `build` check for
  the exact commit being merged.
- Only existing dependency manifests, lockfiles, or GitHub Actions version refs
  changed. Application code, database data, migrations, scripts, and configuration
  changes require review instead.
- No downgraded or removed dependencies, major upgrades, pre-1.0 minor upgrades,
  changed dependency ranges, or changed manifest scripts. Unrecognized versions
  and pinned action hashes require review instead of guessing compatibility.

Passing these checks reduces risk; it cannot guarantee runtime compatibility.
Blocked updates remain open for manual review. Security alerts remain available.
Use `npm ci` with a valid npm lockfile for routine installs. Do not rewrite manifests
or lockfiles, bypass safety checks, or downgrade dependencies to make installs pass.
Repositories that do not already auto-merge updates retain that behavior.
