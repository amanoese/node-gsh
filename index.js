#!/usr/bin/env node
const shellExecDocker = require('./src/shellExecDocker');
const shellautocomplete = require('./src/shellAutoComplete');
const inquirer = require('inquirer');

inquirer.registerPrompt('autocomplete',shellautocomplete);

let dockerName = 'node'
let prompts = [{
  type: 'autocomplete',
  name: 'from',
  message: 'node-gsh >',
  pageSize: 20,
  suggestOnly : true,
  source: function(answersSoFar, input) {
    return shellExecDocker.exec(input)
      .then(({output})=>[output])
      .catch(_=>[''])
  },
}];

inquirer.prompt(prompts).then(async function(answers) {
  let {output} = await shellExecDocker.exec(answers.from)
  process.stdout.write(output);
});
