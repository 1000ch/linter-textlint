# linter-textlint [![Dependency Status](https://david-dm.org/1000ch/linter-textlint.svg)](https://david-dm.org/1000ch/linter-textlint)

A plugin for [Atom Linter](https://github.com/AtomLinter/atom-linter) providing an interface to [textlint](https://github.com/textlint/textlint).

## Installation

```sh
$ apm install linter-textlint
```

## Configuration

### Use your project `.textlintrc` and the rule

You have to do following steps before using.

1. Put `.textlintrc` in your workspace ( [`.textlintrc` file format](https://github.com/textlint/textlint#textlintrc) ).
2. Install textlint plugins (`textlint-rule-*`) in your workspace via `npm install`.
3. Open the workspace with Atom Editor.

### Use global `.textlintrc` and the rule

You have to do following steps before using.

1. Put `.textlintrc` in any directory ( [`.textlintrc` file format](https://github.com/textlint/textlint#textlintrc) ).
2. Install textlint plugins (`textlint-rule-*`) in any directory via `npm install`.
3. Open Atom and Show linter-textlint's setting.
4. Set following setting:

- **.textlintrc Path** : path to `.textlintrc`. It will only be used when there's no config file in project
    - e.g.) `/Users/work/my-textlint-config/.textlintrc`
- **textlint Rules Dir**: path to node_modules directory. It will only be used when there's no config file in project
    - e.g.) `/Users/work/my-textlint-config/node_modules`

![setting](https://monosnap.com/file/R6reaywGTmZMkgob15BEdyhHDvaeQF.png)

Open any file(The workspace has not config file) with Atom Editor.

## License

MIT: http://1000ch.mit-license.org
