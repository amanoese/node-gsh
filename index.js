#!/usr/bin/env node
const tempy = require('tempy');
const fs    = require('fs');
const util  = require('util');
const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const shellExecDocker = require('./src/shellExecDocker');
const shellautocomplete = require('./src/shellAutoComplete');

const inquirer = require('inquirer');
inquirer.registerPrompt('autocomplete',shellautocomplete);

const prog = require('caporal');

prog
.version('1.0.0')
.option('-f <file>', 'File to script')
.action(async function(args, options) {
  let dockerName = 'node';

  let stdinPath = tempy.file({extension: 'shell-gei'});
  await writeFileAsync(stdinPath,await readFileAsync(options.f||'/dev/null'))

  let cmdsuffix = (options.f != null) ?  ' cat /shell-stdin' : '';
  let cmd = (input) => cmdsuffix != null ? `${cmdsuffix}${input||''}` : input

  let prompts = [{
    type: 'autocomplete',
    name: 'from',
    message: 'node-gsh >' + cmdsuffix,
    pageSize: 20,
    suggestOnly : true,
    source: function(answersSoFar, input) {
      return shellExecDocker.exec(cmd(input),{stdinPath})
        .then(({output})=>[output])
        .catch(_=>[''])
    },
  }];

  let answers = await inquirer.prompt(prompts)
  let {output} = await shellExecDocker.exec(cmd(answers.from),{stdinPath})
  process.stdout.write(output);
});

prog.parse(process.argv);
