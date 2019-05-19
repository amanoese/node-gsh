#!/usr/bin/env node
const shellExecDocker = require('./src/shellExecDocker');
const shellautocomplete = require('./src/shellAutoComplete');
const inquirer = require('inquirer');

inquirer.registerPrompt('autocomplete',shellautocomplete);

let dockerName = 'node';

(async () => {
  let prompts = [{
    type: 'autocomplete',
    name: 'from',
    message: 'node-gsh >',
    pageSize: 20,
    suggestOnly : true,
    source: function(answersSoFar, input) {
      //return shellExecDocker.exec(`${stdin}${input}`)
      return shellExecDocker.exec(input)
        .then(({output})=>[output])
        .catch(_=>[''])
    },
  }];

  let answers = await inquirer.prompt(prompts)
  let {output} = await shellExecDocker.exec(answers.from)
  process.stdout.write(output);
})();
