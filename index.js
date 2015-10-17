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
  textlint = new TextLintEngine({
    configFile: configFile,
    rulesBaseDirectory: pluginPath
  });
};

export const provideLinter = () => {
  return {
    name: 'textlint',
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
      textlint.executeOnFiles([filePath])
        .filter(result => result.messages.length)
        .forEach(result => push.apply(messages, result.messages));

      return messages.map(message => {
        // line and column 1-based index
        // https://github.com/azu/textlint/blob/master/docs/use-as-modules.md
        let range = new Range(
          [message.line - 1, message.column - 1],
          [message.line - 1, message.column - 1]
        );

        return {
          type: textlint.isErrorMessage(message) ? "Error" : "Warning",
          text: message.message,
          filePath: filePath,
          range: range
        };
      });
    }
  };
};
