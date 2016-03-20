'use babel';

import * as path from 'path';

const bad = path.join(__dirname, 'fixtures', 'bad.md');
const good = path.join(__dirname, 'fixtures', 'good.md');
const textlintrcPath = path.join(__dirname, 'fixtures', '.textlintrc');
const textlintRulesDir = path.join(__dirname, '..', 'node_modules');

describe('The textlint provider for Linter', () => {
  const lint = require(path.join('..', 'lib', 'index.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    atom.config.set('linter-textlint.textlintrcPath', textlintrcPath);
    atom.config.set('linter-textlint.textlintRulesDir', textlintRulesDir);

    waitsForPromise(() =>
      Promise.all([
        atom.packages.activatePackage('linter-textlint'),
        atom.packages.activatePackage('language-gfm')
      ])
    );
  });

  describe('checks bad.md and', () => {
    it('finds at least one message', () => {
      waitsForPromise(() =>
        atom.workspace.open(bad).then(editor => lint(editor)).then(messages => {
          expect(messages.length).toBeGreaterThan(0);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() =>
        atom.workspace.open(bad).then(editor => lint(editor)).then(messages => {
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toEqual('Java Script => JavaScript');
          expect(messages[0].filePath).toMatch(/.+bad\.md$/);
          expect(messages[0].range).toEqual([
            [2, 4],
            [2, 16]
          ]);
        })
      );
    });
  });

  describe('checks bad.md and', () => {
    it('finds nothing wrong with a valid file', () => {
      waitsForPromise(() =>
        atom.workspace.open(good).then(editor => lint(editor)).then(messages =>
          expect(messages.length).toEqual(0)
        )
      );
    });
  });
});
