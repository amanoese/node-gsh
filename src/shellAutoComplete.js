/*
  Thank you for Martin Hansen <martin@martinhansen.no>
  https://github.com/mokkabonna/inquirer-autocomplete-prompt
*/
const chalk = require('chalk');
const autocomplete = require('inquirer-autocomplete-prompt');

class shellautocomplete extends autocomplete {
  constructor(
    questions /*: Array<any> */,
    rl /*: readline$Interface */,
    answers /*: Array<any> */
  ) {
    super(questions, rl, answers);
    this.firstRender = false;
  }
  render(error /*: ?string */) {
    // Render question
    var content = this.getQuestion();
    var bottomContent = '';

    if (this.firstRender) {
      var suggestText = this.opt.suggestOnly ? ', tab to autocomplete' : '';
      content += chalk.dim(
        '(Use arrow keys or type to search' + suggestText + ')'
      );
    }
    // Render choices or answer depending on the state
    if (this.status === 'answered') {
      content += chalk.cyan(this.shortAnswer || this.answerName || this.answer);
    } else if (this.searching) {
      content += this.rl.line;
      bottomContent += '  ' + chalk.dim('Searching...');
    } else if (this.currentChoices.length) {
      var choicesStr = listRender(this.currentChoices, this.selected);
      content += this.rl.line;
      bottomContent += this.paginator.paginate(
        choicesStr,
        this.selected,
        this.opt.pageSize
      );
    } else {
      content += this.rl.line;
      bottomContent += '  ' + chalk.yellow('No results...');
    }

    if (error) {
      bottomContent += '\n' + chalk.red('>> ') + error;
    }

    this.firstRender = false;

    this.screen.render(content, bottomContent);
  }
}

function listRender(choices, pointer /*: string */) /*: string */ {
  var output = '';
  var separatorOffset = 0;

  choices.forEach(function(choice, i) {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }

    var isSelected = i - separatorOffset === pointer;
    //var line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;
    var line = choice.name;

    if (isSelected) {
      line = chalk.cyan(line);
    }
    output += line + ' \n';
  });

  return output.replace(/\n$/, '');
}

module.exports = shellautocomplete;
