'use babel';

import fs from 'fs';
import path from 'path';
import helper from 'atom-linter';
import { Range } from 'atom';
import { TextLintEngine } from 'textlint';

const configFiles  = ['.textlintrc'];

export const activate = () => {
  require("atom-package-deps").install("linter-textlint");
};

export const provideLinter = () => {
  return {
    grammarScopes: ['source.gfm', 'source.pfm', 'source.txt'],
    scope: 'file',
    lintOnFly: true,
    lint: (editor) => {

      let filePath = editor.getPath();
      let text = editor.getText();
      let textlintConfig = {};

      let configFile = helper.findFile(filePath, configFiles);

      // do not lint if .textlintrc does not exist
      if (!configFile) {
        return;
      }

      const textlint = new TextLintEngine({ configFile: configFile });
      const projects = atom.project.getPaths();

      if (projects.length) {
        return;
      }

      const pluginPath = path.join(projects.shift(), './node_modules/');

      // load textlint plugins installed in atom workspace
      textlint.config.rules.forEach(ruleName => textlint.loadRule(ruleName, pluginPath));

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
