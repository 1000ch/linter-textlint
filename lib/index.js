'use babel';

// eslint-disable-next-line import/extensions
import { CompositeDisposable } from 'atom';
import * as fs from 'fs';
import { TextLintEngine } from 'textlint';
import { generateRange } from 'atom-linter';
import ruleURI from 'textlint-rule-documentation';

let subscriptions;
let textlintrcPath;
let textlintRulesDir;

export function activate() {
  require('atom-package-deps').install('linter-textlint');

  subscriptions = new CompositeDisposable();
  subscriptions.add(atom.config.observe('linter-textlint.textlintrcPath', (value) => {
    textlintrcPath = value;
  }));
  subscriptions.add(atom.config.observe('linter-textlint.textlintRulesDir', (value) => {
    textlintRulesDir = value;
  }));
}

export function deactivate() {
  subscriptions.dispose();
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
    grammarScopes: [
      'source.gfm',
      'source.pfm',
      'source.re',
      'source.review',
      'text.plain',
      'text.md',
      'text.tex',
      'text.latex'
    ],
    scope: 'file',
    lintsOnChange: false,
    lint: (editor) => {
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

      return textlint.executeOnFiles([filePath]).then((results) => {
        const { push } = Array.prototype;
        const messages = [];
        results
          .filter(result => result.messages.length)
          .forEach(result => push.apply(messages, result.messages));

        return messages.map((message) => {
          const linterMessage = {
            severity: textlint.isErrorMessage(message) ? 'error' : 'warning',
            location: {
              file: filePath,
              position: generateRange(editor, message.line - 1, message.column - 1)
            },
            excerpt: message.message
          };

          const { ruleId } = message;
          const rule = ruleURI(ruleId);
          linterMessage.description = rule.found ? `[${ruleId}](${rule.url})` : ruleId;

          return linterMessage;
        });
      });
    }
  };
}
