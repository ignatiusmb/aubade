# contributing

contributions are welcome in many forms — not only code. using the project, reporting issues, improving docs, and testing changes are all valuable. if you want to get involved, start with the sections below.

## testing

the simplest way to help is by using the software. report problems, unexpected behavior, or missing use cases. open a [new issue](https://github.com/ignatiusmb/aubade/issues/new/choose) or start a [discussion](https://github.com/ignatiusmb/aubade/discussions/new).

## documentation

docs are part of the project. you can add missing details, clarify existing sections, or share guidance from your own experience. the source lives in [`workspace/content`](workspace/content).

## development

if you want to work on the codebase:

### setup

make sure [pnpm](https://pnpm.io/) is available. you can install it or enable it with [corepack](https://nodejs.org/api/corepack.html):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

then fork and clone the repository.

### scripts

- run `pnpm dev` in `workspace/aubade` to run the test suite in watch mode
- run `pnpm dev` in `workspace/website` to run the documentation site locally

### layout

project structure and entry points:

- `workspace/aubade/src/core` — basic building blocks
- `workspace/aubade/src/artisan` — markdown compiler
- `workspace/aubade/src/browser` — DOM hydration and interactivity
- `workspace/aubade/src/conductor` — content orchestration
- `workspace/aubade/src/manifest` — front matter parsing
- `workspace/aubade/src/transform` — content transformation
- `workspace/aubade/styles` — exported stylesheets
- `workspace/content` — unprocessed markdown docs
- `workspace/website` — documentation site

## maintenance

for maintainers.

### release

1. bump version in [`workspace/aubade/package.json`](workspace/aubade/package.json), commit as `release ~ vX.Y.Z`
2. publish the release draft titled `aubade@X.Y.Z`
