'use babel';

import fs from 'fs';
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
  textlint.setRulesBaseDirectory(pluginPath);
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

      const messages = [];
      const push = Array.prototype.push;
      const results = textlint.executeOnFiles(filePath)
        .filter(result => result.messages.length)
        .forEach(result => push.apply(messages, result.messages));

      return messages.map(message => {

        let range = new Range(
          [message.loc.start.line - 1, message.loc.start.column],
          [message.loc.end.line - 1, message.loc.end.column]
        );

        return {
          type: message.type,
          text: message.message,
          filePath: filePath,
          range: range
        };
      });
    }
  };
};
