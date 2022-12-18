---
title: Module / Core
---

```typescript
interface HydrateChunk {
  frontMatter: FrontMatter;
  content: string;
  breadcrumb: string[];
}

export function compile(
  options: string,
  hydrate?: (chunk: HydrateChunk) => undefined | Output
): undefined | Output;

export function traverse(
  options: string,
  hydrate?: (chunk: HydrateChunk) => Output[]
): Output[];
```

Marqua provides a core module with a couple of functions within them. Using a folder structure shown below as a reference for the next examples, the usage will be as follows

```
~ Hypothetical Content Folder Structure
content
    ├── posts
    │   ├── draft.my-amazing-two-part-series-part-1.md
    │   ├── draft.my-amazing-two-part-series-part-2.md
    │   ├── 2021-04-01.my-first-post.md
    │   └── 2021-04-13.marqua-is-the-best.md
    └── reviews
        ├── game
        │   └── doki-doki-literature-club.md
        ├── book
        │   ├── amazing-book-one.md
        │   └── manga-is-literature.md
        └── movie
            ├── spirited-away.md
            └── your-name.md
```

### compile / traverse

An example usage from the *hypothetical* content folder structure above should look like

```javascript
import { compile, traverse } from 'marqua';

/* compile - parse a single source file */
const body = compile(
  'content/posts/2021-04-01.my-first-post.md',
  ({ frontMatter, content, breadcrumb: [filename] }) => {
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // {'posts/2021-04-01.my-first-post.md'}

/* traverse - scans a directory for sources */
const data = traverse(
  'content/posts',
  ({ frontMatter, content, breadcrumb: [filename] }) => {
    if (filename.startsWith('draft')) return;
    const [date, slug] = filename.split('.');
    return { slug, date, ...frontMatter, content };
  }
); // [{'posts/3'}, {'posts/4'}]

/* traverse - nested directories recursive scan */
const data = traverse(
  { entry: 'content/reviews', recurse: true },
  ({ frontMatter, content, breadcrumb: [slug, category] }) => {
    return { slug, category, date, ...frontMatter, content };
  }
); // [{'game/0'}, {'book/0'}, {'book/1'}, {'movie/0'}, {'movie/1'}]
```

Marqua is shipped with built-in types, so any code editor that supports it should give autocompletion for the arguments passed. For a more detailed information, take a look at the [source code](src/index.ts) itself or at the [types](src/internal/types.ts) directly.

The first argument of `compile` can either be `string | FileOptions`, and for `traverse` it can be `string | DirOptions`. The second argument of both functions is an optional callback (`hydrate`), when not specified or `undefined`, will return an object with `content` and all properties of `frontMatter`.

```typescript
interface FileOptions {
  entry: string;

  /**
   * `minimal = false`
   *
   * it can be set to true so it will not generate anything
   * other than what is written in the file's frontMatter
   */
  minimal?: boolean;

  /**
   * `exclude = []`
   * accepts: 'toc' | 'rt' | 'date' | 'cnt'
   *
   * sometimes table of contents isn't needed and will add
   * a lot of unnecessary bytes while it's still useful to
   * know the read time duration
   *
   * these generated features can be individually turned off
   * by passing their 'id's in an array
   */
  exclude?: string[];
}

interface DirOptions extends FileOptions {
  entry: string;

  /**
   * `recurse = false`
   *
   * traverse will only scan the root/top-level directory
   * and will recursively scan all nested subdirectories
   * when this flag is turned on
   */
  recurse?: boolean;

  /**
   * `extensions = ['.md']`
   *
   * traverse will only scan directories with files that
   * ends with '.md', this can be changed or added by
   * passing in other extensions
   *
   * it will consequently overwrite the default array and
   * remove '.md' extension, you will need to explicitly
   * readd the extension again to your newly passed array
   */
  extensions?: string[];
}
```

When everything is set to default (none of the optional properties are passed), passing in a string as the first argument of `compile` or `traverse` will be the same as only passing in `pathname` or `dirname` as the options.

### forge

Both `compile` and `traverse` has an `Input` generic for the available properties in `{ frontMatter }` and `Output` generic for the expected returned object, defaulting to `Input`.

```typescript
import type { Post } from './types';
import { compile } from 'marqua';

/**
 * 1. Pass it in directly to the functions
 *    with a caveat of declaring its options
 *    beforehand as const
 */
const opts = { entry: 'content/reviews/movie/your-name.md', minimal: false } as const;
// alternative declaration using forge for autocompletion
// const opts = forge.compile({ entry: 'content/reviews/movie/your-name.md', minimal: false });
compile<typeof opts, Post>(opts);


/**
 * 2. Import and use forge helper
 */
import { forge } from 'marqua';
compile(
  { entry: 'content/reviews/movie/your-name.md', minimal: false },
  ({ frontMatter, content, breadcrumb }) => {
    // do stuff with frontMatter / content
    // parse breadcrumb or some other stuff
    return { ...frontMatter, content };
  },
  forge.types<Post>()
);
```

Both options are available and optional to use if needed, the rest is up to your preference on how you type your code. All methods acts as a helper and are only meant to provide autocompletion.

- `forge.compile` will return an object with `FileOptions` type
- `forge.traverse` will return an object with `DirOptions` type
- `forge.types` accepts 1 generic, no arguments, and returns `void`
- `forge.types` is only used as the last argument of `compile` or `traverse`

### Front Matter

Metadata will be generated from the front matter semantically placed at the start of the file between two separate 3-dashes. Marqua syntax resembles yaml in some ways except it only read raw strings. It doesn't support whitespace indentation, `[...]`, or `{...}`. Instead, it has some ways to handle creating objects/maps and arrays/lists.

```yaml
---
title: My First Blog Post, Hello World!
description: Welcome to my first post.
tags: blog, life, coding
date:published: 2021-04-01
date:updated: 2021-04-13
---
```

Every property is expressed in one line as a `[key]: [value]` pair, separated by a colon and whitespace. The whitespace after the key denotes the end of that key and indicates the start of the value.

To create nested properties, add the keys separated by a colon (`:`). Once it becomes an object, it cannot be assigned a top-level value or it will either break or overwrite the previously assigned properties.

To create an array/list, separate the values by a comma (`,`). This can be combined with nested properties. Applies to all keys with the exception of `title` and `description`, which always parses into raw strings.

The output of the front matter should be

```json
{
  "title": "My First Blog Post, Hello World!",
  "description": "Welcome to my first post.",
  "tags": ["blog", "life", "coding"],
  "date": {
    "published": "2021-04-01",
    "updated": "2021-04-03",
  },
}
```

### Content

Everything after front matter (the second 3-dashes) will be considered as content. All declared properties in the front matter are available to the content and can be accessed inside `!{name}`, replace `name` with your property key or keys separated by a colon.

```yaml
---
tags: blog, life, coding
date:published: 2021-04-01
date:updated: 2021-04-13
---

# the properties above will result to
#
# tags = ['blog', 'life', 'coding']
# date = {
#   published: '2021-04-01',
#   updated: '2021-04-13',
# }
#
# these can be accessed with !{}

# !{tags:0} - accessing tags array at index 0
This article's main topic will be about !{tags:0}

# !{date:property} - accessing property of date
This article was originally published on !{date:published}
Thoroughly updated through this website on !{date:updated}
```

Heading starts at 2 `##` (equivalent to `<h2>`) with the lowest one being 4 `####` (equivalent to `<h4>`) and should conform with the [rules of markdownlint](https://github.com/DavidAnson/markdownlint#rules--aliases), with some essential ones to follow are

- MD001: Heading levels should only increment by one level at a time
- MD003: Heading style; only ATX style
- MD018: No space after hash on atx style heading
- MD023: Headings must start at the beginning of the line
- MD024: Multiple headings with the same content; siblings only
- MD042: No empty links

If you're using VSCode, you can install the [markdownlint extension](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) to help you catch these lint errors / warnings and write better markdown. These rules can be configured, see the [.jsonc template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.jsonc) and [.yaml template](https://github.com/DavidAnson/markdownlint/blob/main/schema/.markdownlint.yaml) with an [example here](https://github.com/ignatiusmb/mauss.dev/blob/master/.markdownlint.yaml).
