const execa = require('execa');
const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
inquirer.registerPrompt('autocomplete',autocomplete);

let dockerName = 'node'
let prompts = [{
  type: 'autocomplete',
  name: 'from',
  message: 'node-gsh >',
  //guggestOnly : true,
  source: function(answersSoFar, input) {
    return execa.shell(input)
      .then(({stdout})=>[stdout.split('\n').slice(0,20).join('\n')])
      .catch(_=>[''])
  }
}];

inquirer.prompt(prompts).then(function(answers) {
  console.log(answers)
  //etc
});
