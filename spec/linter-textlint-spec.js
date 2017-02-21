'use babel';

import * as path from 'path';

const good = path.join(__dirname, 'fixtures', 'good.md');
const markdown = path.join(__dirname, 'fixtures', 'bad.md');
const review = path.join(__dirname, 'fixtures', 'bad.re');
const asciidoc = path.join(__dirname, 'fixtures', 'bad.asciidoc');
const textlintrcPath = path.join(__dirname, 'fixtures', '.textlintrc');
const textlintRulesDir = path.join(__dirname, '..', 'node_modules');

describe('The textlint provider for Linter', () => {
  const lint = require('../lib').provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    atom.config.set('linter-textlint.textlintrcPath', textlintrcPath);
    atom.config.set('linter-textlint.textlintRulesDir', textlintRulesDir);
    atom.config.set('linter-textlint.showRuleIdInMessage', false);

    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('language-review'),
        atom.packages.activatePackage('language-asciidoc'),
        atom.packages.activatePackage('linter-textlint')
      ])
    );
  });

  describe('checks bad.md and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() =>
        atom.workspace.open(markdown).then(editor => lint(editor)).then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() =>
        atom.workspace.open(markdown).then(editor => lint(editor)).then((messages) => {
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toEqual('HTML Import => HTML Imports');
          expect(messages[0].html).not.toBeDefined();
          expect(messages[0].filePath).toMatch(/.+bad\.md$/);
          expect(messages[0].range).toEqual([
            [2, 0],
            [2, 4]
          ]);
        })
      );
    });

    it('verifies the first message contains a rule ID', () => {
      atom.config.set('linter-textlint.showRuleIdInMessage', true);

      waitsForPromise(() =>
        atom.workspace.open(markdown).then(editor => lint(editor)).then((messages) => {
          expect(messages[0].text).not.toBeDefined();
          // eslint-disable-next-line max-len
          expect(messages[0].html).toEqual('<span class="badge badge-flexible"><a href=https://github.com/azu/textlint-rule-spellcheck-tech-word>spellcheck-tech-word</a></span> HTML Import =&gt; HTML Imports');
        })
      );
    });
  });

  describe('checks bad.re and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() =>
        atom.workspace.open(review).then(editor => lint(editor)).then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        })
      );
    });
  });

  describe('checks bad.asciidoc and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() =>
        atom.workspace.open(asciidoc).then(editor => lint(editor)).then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        })
      );
    });
  });

  describe('checks good.md and', () => {
    it('finds nothing wrong with a valid file', () => {
      waitsForPromise(() =>
        atom.workspace.open(good).then(editor => lint(editor)).then(messages =>
          expect(messages.length).toEqual(0)
        )
      );
    });
  });
});
