'use babel';

import * as path from 'path';

const good = path.join(__dirname, 'fixtures', 'good.md');
const markdown = path.join(__dirname, 'fixtures', 'bad.md');
const review = path.join(__dirname, 'fixtures', 'bad.re');
const latex = path.join(__dirname, 'fixtures', 'bad.latex');
const textlintrcPath = path.join(__dirname, 'fixtures', '.textlintrc');
const textlintRulesDir = path.join(__dirname, '..', 'node_modules');

describe('The textlint provider for Linter', () => {
  const { lint } = require('../lib').provideLinter();

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    atom.config.set('linter-textlint.textlintrcPath', textlintrcPath);
    atom.config.set('linter-textlint.textlintRulesDir', textlintRulesDir);

    const activation = Promise.all([
      atom.packages.activatePackage('language-review'),
      atom.packages.activatePackage('language-latex'),
      atom.packages.activatePackage('linter-textlint')
    ]);

    waitsForPromise(() => activation);
  });

  describe('checks bad.md and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() => atom.workspace.open(markdown)
        .then(editor => lint(editor))
        .then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        }));
    });

    it('verifies the first message', () => {
      waitsForPromise(() => atom.workspace.open(markdown)
        .then(editor => lint(editor))
        .then((messages) => {
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toEqual('HTML Import => HTML Imports');
          expect(messages[0].location.file).toMatch(/.+bad\.md$/);
          expect(messages[0].location.position).toEqual([
            [2, 0],
            [2, 4]
          ]);
        }));
    });
  });

  describe('checks bad.re and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() => atom.workspace.open(review)
        .then(editor => lint(editor))
        .then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        }));
    });
  });

  describe('checks bad.latex and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() => atom.workspace.open(latex)
        .then(editor => lint(editor))
        .then((messages) => {
          expect(messages.length).toBeGreaterThan(0);
        }));
    });
  });

  describe('checks good.md and', () => {
    it('finds nothing wrong with a valid file', () => {
      waitsForPromise(() => atom.workspace.open(good)
        .then(editor => lint(editor))
        .then((messages) => {
          expect(messages.length).toEqual(0);
        }));
    });
  });
});
