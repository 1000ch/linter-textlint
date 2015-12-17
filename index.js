'use babel';

import fs from 'fs';
import { Range } from 'atom';
import { TextLintEngine } from 'textlint';

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
Write the value of path to node_modules.
`,
    type: 'string',
    default: ''
  }
};

const textlintrcPath = () => atom.config.get('linter-textlint.textlintrcPath');
const textlintRulesDir = () => atom.config.get('linter-textlint.textlintRulesDir');

export const activate = () => {
  // install deps
  require('atom-package-deps').install('linter-textlint');
};

function existsConfig(configFile, pluginPath) {
  if (configFile.length === 0 || pluginPath.length === 0) {
    return false;
  }
  return fs.existsSync(configFile) && fs.existsSync(pluginPath);
}

export const provideLinter = () => {
  return {
    name: 'textlint',
    grammarScopes: ['source.gfm', 'source.pfm', 'source.txt'],
    scope: 'file',
    lintOnFly: true,
    lint: (editor) => {
      return new Promise(resolve => {
        const directory = atom.project.rootDirectories[0];

        if (!directory) {
          return resolve([]);
        }

        // local config
        let configFile = directory.resolve('./.textlintrc');
        let pluginPath = directory.resolve('./node_modules/');

        if (!existsConfig(configFile, pluginPath)) {
          // global config
          const globalConfigFile = textlintrcPath();
          const globalPluginPath = textlintRulesDir();

          if (!existsConfig(globalConfigFile, globalPluginPath)) {
            return resolve([]);
          }

          // use global config
          configFile = globalConfigFile;
          pluginPath = globalPluginPath;
        }

        const textlint = new TextLintEngine({
          configFile,
          rulesBaseDirectory: pluginPath
        });

        const filePath = editor.getPath();
        textlint.executeOnFiles([filePath]).then(results => {
          const push = Array.prototype.push;
          const messages = [];
          results
            .filter(result => result.messages.length)
            .forEach(result => push.apply(messages, result.messages));

          const lintMessages = messages.map(message => {
            // line and column 1-based index
            // https://github.com/azu/textlint/blob/master/docs/use-as-modules.md
            const range = new Range(
              [message.line - 1, message.column - 1],
              [message.line - 1, message.column - 1]
            );

            return {
              type: textlint.isErrorMessage(message) ? 'Error' : 'Warning',
              text: message.message,
              filePath,
              range
            };
          });

          resolve(lintMessages);
        });
      });
    }
  };
};
