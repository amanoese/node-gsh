const shellExecDocker = require('./src/shell-exec-docker.js')
const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
inquirer.registerPrompt('autocomplete',autocomplete);

let dockerName = 'node'
let prompts = [{
  type: 'autocomplete',
  name: 'from',
  message: 'node-gsh >',
  pageSize: 20,
  guggestOnly : true,
  source: function(answersSoFar, input) {
    return shellExecDocker.exec(input)
      .then(({output})=>[output])
      .catch(_=>[''])
  }
}];

inquirer.prompt(prompts).then(function(answers) {
  console.log(answers.from)
  //etc
});
