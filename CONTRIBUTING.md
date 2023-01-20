# Contributors Guide

Thanks for taking the time to contribute! 🎉

Contributing goes a long way, there are lots of ways you can still help, even if you can't contribute to the code. All methods are outlined in the sections below, but the two main things other than code are testing and creating issues.

## Testing

The easiest way to contribute! By just using the software, you're already helping the project grows. Simply use and let us know if you run into problems, or there's some use case you would like to use it for but are not yet covered, this is the most common way we uncover bugs or implement new features. Open a [new issue](https://github.com/ignatiusmb/marqua/issues/new/choose) or start a [new discussion](https://github.com/ignatiusmb/marqua/discussions/new).

## Documentation

Documentation is especially helpful! You can add something that hasn't been covered or is missing in the docs and help guide others with your experience. The source for the documentation lives in the [content](content) directory.

## Developing

Follow this if you're looking to contribute to the code.

### Preparing

First step is to prepare your environment and make sure that [pnpm](https://pnpm.io/) is available to use, you can follow their [installation guide](https://pnpm.io/installation), but if you're using Node.js above v16.13, you can simply enable [corepack](https://nodejs.org/api/corepack.html).

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

The next step is to checkout the code by forking and cloning the repository.

### Scripts

The first script to run is `"watch"` in `workspace/marqua`, this will compile and watch for changes in the source code. The next step is to run the dev server with `"dev"` in `workspace/documentation`, this will host the documentation site locally and it's the easiest way to see the code changes that you do in `workspace/marqua` source.

### Structure

How the project and code is structured, and some entry points to be aware of

- `workspace/marqua/internal` - marqua core module, compiler components
- `workspace/marqua/artisan` - marqua artisan module, syntax highlighter and marker
- `workspace/marqua/browser` - marqua browser module, DOM hydrating function
- `workspace/marqua/styles` - stylesheets used and exported
- `workspace/documentation` - source code for the website
- `content` - unprocessed markdown files containing all of the documentation

## Maintaining

For maintainers of the project.

### Publishing

1. bump version in `package.json` accordingly
2. update unreleased header in `CHANGELOG.md`
3. create a commit with format of `~ vX.Y.Z`
4. create a (secure) tag formatted as `vX.Y.Z`
5. push commit and tag with `--follow-tags` option
6. create a [new release](https://github.com/ignatiusmb/marqua/releases)
