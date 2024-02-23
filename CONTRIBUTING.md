# Contributors Guide

Thanks for taking the time to contribute! 🎉

Contributing goes a long way, there are lots of ways you can still help, even if you can't contribute to the code. All methods are outlined in the sections below, but the two main things other than code are testing and creating issues.

## Testing

The easiest way to contribute! By just using the software, you're already helping the project grows. Simply use and let us know if you run into problems, or there's some use case you would like to use it for but are not yet covered, this is the most common way we uncover bugs or implement new features. Open a [new issue](https://github.com/ignatiusmb/aubade/issues/new/choose) or start a [new discussion](https://github.com/ignatiusmb/aubade/discussions/new).

## Documentation

Documentation is especially helpful! You can add something that hasn't been covered or is missing in the docs and help guide others with your experience. The source for the documentation lives in the [workspace/content](workspace/content) directory.

## Developing

Follow this if you're looking to contribute to the code.

### Preparing

First step is to prepare your environment and make sure that [pnpm](https://pnpm.io/) is available to use, you can follow their [installation guide](https://pnpm.io/installation) or enable them through [corepack](https://nodejs.org/api/corepack.html).

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

The next step is to checkout the code by forking and cloning the repository.

### Scripts

The first script to run is `"watch"` in `workspace/aubade`, this will compile and watch for changes in the source code. The next step is to run the dev server with `"dev"` in `workspace/website`, this will host the documentation site locally and it's the easiest way to see the code changes that you do in `workspace/aubade` source.

### Structure

How the project and code is structured, and some entry points to be aware of

-   `workspace/content` - unprocessed markdown files containing all of the documentation
-   `workspace/aubade/src/core` - aubade core module, compiler components
-   `workspace/aubade/src/artisan` - aubade artisan module, syntax highlighter and marker
-   `workspace/aubade/src/browser` - aubade browser module, DOM hydrating function
-   `workspace/aubade/src/compass` - aubade compass module, read files from disk
-   `workspace/aubade/src/transform` - aubade transform module, transformers for `traverse`
-   `workspace/aubade/styles` - stylesheets used and exported
-   `workspace/website` - source code for the website

## Maintaining

For maintainers of the project.

### Publishing

0. prepare a [new release draft](https://github.com/ignatiusmb/aubade/releases/new) with a new tag
1. bump version in [`package.json`](workspace/aubade/package.json) and commit with `~ vX.Y.Z`
2. publish release draft and title release with `X.Y.Z`
