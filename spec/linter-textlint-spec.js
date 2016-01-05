'use babel';

import * as path from 'path';

describe('The textlint provider for Linter', () => {
  const lint = require(path.join('..', 'index.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-textlint');
      return atom.packages.activatePackage('language-gfm').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures', 'good.md'))
      );
    });
    const textlintrc = path.join(__dirname, 'fixtures', '.textlintrc');
    const textlintRulesDir = path.join(__dirname, '..', 'node_modules');
    atom.config.set('linter-textlint.textlintrcPath', textlintrc);
    atom.config.set('linter-textlint.textlintRulesDir', textlintRulesDir);
  });

  describe('checks bad.md and', () => {
    let editor = null;
    beforeEach(() => {
      waitsForPromise(() => {
        return atom.workspace.open(path.join(__dirname, 'fixtures', 'bad.md')).then(openEditor => {
          editor = openEditor;
        });
      });
    });

    it('finds at least one message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages.length).toBeGreaterThan(0);
        });
      });
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].type).toBeDefined();
          expect(messages[0].type).toEqual('Error');
          expect(messages[0].text).toBeDefined();
          expect(messages[0].text).toEqual('一文に二回以上利用されている助詞 "て" がみつかりました。');
          expect(messages[0].filePath).toBeDefined();
          expect(messages[0].filePath).toMatch(/.+bad\.md$/);
          expect(messages[0].range).toBeDefined();
          expect(messages[0].range).toEqual({
            start: { row: 0, column: 10 },
            end: { row: 0, column: 10 }
          });
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      return atom.workspace.open(path.join(__dirname, 'fixtures', 'good.md')).then(editor => {
        return lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        });
      });
    });
  });
});
