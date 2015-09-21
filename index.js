'use babel';

import fs from 'fs';
import path from 'path';
import { Range } from 'atom';
import { TextLintEngine } from 'textlint';

let textlint = null;

export const activate = () => {

  // install deps
  require("atom-package-deps").install("linter-textlint");

  let directories = atom.project.getDirectories();

  if (!directories.length) {
    return;
  }

  let directory = directories.shift();
  let configFile = directory.resolve('./.textlintrc');
  let pluginPath = directory.resolve('./node_modules/');

  // do not lint if .textlintrc does not exist
  if (!fs.existsSync(configFile) ||
      !fs.existsSync(pluginPath)) {
    textlint = null;
    return;
  }

  // initialize textlint
  textlint = new TextLintEngine({ configFile: configFile });

  // load textlint plugins installed in atom workspace
  textlint.config.rules.forEach(ruleName => textlint.loadRule(ruleName, pluginPath));
};

export const provideLinter = () => {
  return {
    grammarScopes: ['source.gfm', 'source.pfm', 'source.txt'],
    scope: 'file',
    lintOnFly: true,
    lint: (editor) => {

      if (!textlint) {
        return;
      }

      let filePath = editor.getPath();
      let text = editor.getText();

      const items = textlint.executeOnText(text)
        .filter(result => result.messages.length)
        .map(result => result.messages.shift());

      return items.map(item => {

        let range = new Range(
          [item.loc.start.line - 1, item.loc.start.column],
          [item.loc.end.line - 1, item.loc.end.column]
        );

        return {
          type: item.type,
          text: item.message,
          filePath: filePath,
          range: range
        };
      });
    }
  };
};
