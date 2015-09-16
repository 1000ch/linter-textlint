'use babel';

import fs           from 'fs';
import { Range }    from 'atom';
import { textlint } from 'textlint';
import helper       from 'atom-linter';

export let config = {
};
const configFiles  = ['.textlintrc'];

export const activate = () => {
  console.log('linter-textlint');
  require("atom-package-deps").install("linter-textlint");
};

export const provideLinter = () => {
  return {
    grammarScopes: ['source.md', 'source.markdown', 'source.txt'],
    scope: 'file',
    lintOnFly: true,
    lint: (editor) => {

      console.log('linter-textlint.lint');

      let path = editor.getPath();
      let text = editor.getText();
      let config = {};

      let configFile = helper.findFile(path, configFiles);
      if (configFile) {
        config = JSON.parse(fs.readFileSync(configFile));
      }

      let results = textlint.lintText(text);
      console.log(results);
    }
  };
};
