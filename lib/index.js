'use babel';

import * as fs from 'fs';
import { TextLintEngine } from 'textlint';
import { rangeFromLineNumber } from 'atom-linter';

// User config
export const config = {
  textlintrcPath: {
    title: '.textlintrc Path',
    description: "It will only be used when there's no config file in project",
    type: 'string',
    default: ''
  },
  textlintRulesDir: {
    title: 'textlint Rules Dir',
    description: `Specify a directory for textlint to load rules from.
It will only be used when there's no config file in project.
Write the value of path to node_modules.`,
    type: 'string',
    default: ''
  }
};

const TEXTLINT_RC_PATH = 'linter-textlint.textlintrcPath';
const TEXTLINT_RULES_DIR = 'linter-textlint.textlintRulesDir';

let textlintrcPath;
let textlintRulesDir;

export function activate() {
  // install deps
  require('atom-package-deps').install('linter-textlint');

  textlintrcPath = atom.config.get(TEXTLINT_RC_PATH);
  textlintRulesDir = atom.config.get(TEXTLINT_RULES_DIR);

  atom.config.observe(TEXTLINT_RC_PATH, value => {
    textlintrcPath = value;
  });
  atom.config.observe(TEXTLINT_RULES_DIR, value => {
    textlintRulesDir = value;
  });
}

function existsConfig(configFile, pluginPath) {
  if (configFile.length === 0 || pluginPath.length === 0) {
    return false;
  }
  return fs.existsSync(configFile) && fs.existsSync(pluginPath);
}

export function provideLinter() {
  return {
    name: 'textlint',
    grammarScopes: ['source.gfm', 'source.pfm', 'source.txt', 'text.md'],
    scope: 'file',
    lintOnFly: true,
    lint: editor => {
      const directory = atom.project.rootDirectories[0];

      if (!directory) {
        return Promise.resolve([]);
      }

      // local config
      let configFile = directory.resolve('./.textlintrc');
      let pluginPath = directory.resolve('./node_modules/');

      if (!existsConfig(configFile, pluginPath)) {
        if (!existsConfig(textlintrcPath, textlintRulesDir)) {
          return Promise.resolve([]);
        }

        // use global config
        configFile = textlintrcPath;
        pluginPath = textlintRulesDir;
      }

      const textlint = new TextLintEngine({
        configFile,
        rulesBaseDirectory: pluginPath
      });
      const filePath = editor.getPath();

      return textlint.executeOnFiles([filePath]).then(results => {
        const push = Array.prototype.push;
        const messages = [];
        results
          .filter(result => result.messages.length)
          .forEach(result => push.apply(messages, result.messages));

        return messages.map(message => {
          // line and column are 1-based index
          // https://github.com/azu/textlint/blob/master/docs/use-as-modules.md
          const { line, column } = message;
          const range = rangeFromLineNumber(editor, line - 1);

          if (column) {
            range[0][1] = column - 1;
          }
          if (column > range[1][1]) {
            range[1][1] = column - 1;
          }

          return {
            type: textlint.isErrorMessage(message) ? 'Error' : 'Warning',
            text: message.message,
            filePath,
            range
          };
        });
      });
    }
  };
}
