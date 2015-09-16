'use babel';

import fs from 'fs';
import path from 'path';
import helper from 'atom-linter';
import { Range } from 'atom';
import { TextLintEngine } from 'textlint';

export let config = {};

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

      if (configFile) {
        textlintConfig = JSON.parse(fs.readFileSync(configFile));
      }

      const projectDirectory = atom.project.getPaths().shift();
      const nodeModules = path.join(projectDirectory, './node_modules/textlint-rule-max-ten');

      if (!Array.isArray(textlintConfig.rulePaths)) {
        textlintConfig.rulePaths = [nodeModules];
      } else {
        textlintConfig.rulePaths.push(nodeModules);
      }

      const textlint = new TextLintEngine(textlintConfig);
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
