'use babel';

import { CompositeDisposable } from 'atom';
import * as fs from 'fs';
import { TextLintEngine } from 'textlint';
import { rangeFromLineNumber } from 'atom-linter';
import escapeHTML from 'escape-html';

const TEXTLINT_RC_PATH = 'linter-textlint.textlintrcPath';
const TEXTLINT_RULES_DIR = 'linter-textlint.textlintRulesDir';
const SHOW_RULE_ID_IN_MESSAGE = 'linter-textlint.showRuleIdInMessage';

let subscriptions;
let textlintrcPath;
let textlintRulesDir;
let showRuleId;

export function activate() {
  // install deps
  require('atom-package-deps').install('linter-textlint');

  subscriptions = new CompositeDisposable();
  textlintrcPath = atom.config.get(TEXTLINT_RC_PATH);
  textlintRulesDir = atom.config.get(TEXTLINT_RULES_DIR);
  showRuleId = atom.config.get(SHOW_RULE_ID_IN_MESSAGE);

  subscriptions.add(atom.config.observe(TEXTLINT_RC_PATH, (value) => {
    textlintrcPath = value;
  }));
  subscriptions.add(atom.config.observe(TEXTLINT_RULES_DIR, (value) => {
    textlintRulesDir = value;
  }));
  subscriptions.add(atom.config.observe(SHOW_RULE_ID_IN_MESSAGE, (value) => {
    showRuleId = value;
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
    grammarScopes: ['source.gfm', 'source.pfm', 'text.plain', 'text.md'],
    scope: 'file',
    lintOnFly: true,
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
        const push = Array.prototype.push;
        const messages = [];
        results
          .filter(result => result.messages.length)
          .forEach(result => push.apply(messages, result.messages));

        return messages.map((message) => {
          const linterMessage = {
            type: textlint.isErrorMessage(message) ? 'Error' : 'Warning',
            filePath,
            range: rangeFromLineNumber(editor, message.line - 1, message.column - 1)
          };

          if (showRuleId) {
            const ruleId = message.ruleId;
            const badge = `<span class="badge badge-flexible textlint">${ruleId}</span>`;
            const escapedMessage = escapeHTML(message.message);
            linterMessage.html = `${badge} ${escapedMessage}`;
          } else {
            linterMessage.text = message.message;
          }

          return linterMessage;
        });
      });
    }
  };
}
