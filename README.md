# eslint-plugin-no-nested-import


# Description

Plugin, looks at imports and checks that there are no nested imports more than a certain number and replaces them with absolute imports, the allowed nesting level is determined by the maxLevel parameter, you also need to specify the baseUrl parameter so that it substitutes the value for absolute imports, baseUrl by default @. The rule is called no-relative-parent-imports.

# Installation

```bash
npm install eslit-plugin-no-nested-import --save-dev
```


# Usage

Add `no-nested-import` to plugin list in eslint.json;
Add `no-nested-import/no-relative-parent-imports` rules in eslint.json


Finally it will look like:

```bash
rules: [
	...
	"no-nested-import/no-relative-parent-imports": ["error", {
		"maxLevel": 2
    }],
]
```

You can set `maxLevel` value, it will check if level you have more than 2 `../` in your import line and will show elsint error with suggestion

Also you can set `baseUrl` value as alias to base url, default value is `@`, so it will put this symbol in the beginning of import e.g. - `../../../../components/myFeature.ts` will be replaced with `@/components/myFeature.ts`

If you don't have `baseUrl` alias, you can pass `noAlias` option and `../../../../components/myFeature.ts` will be replaced with `components/myFeature.ts`
