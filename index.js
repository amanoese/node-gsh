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
.version(require('./package.json').version)
.option('-f <file>', 'File to script')
.option('--name <Name>', 'Name is Using Docker Image Name : default "ubuntu"')
.action(async function(args, options) {
  let stdinPath = tempy.file({extension: 'shell-gei'});
  let {name:imageName} = options
  await writeFileAsync(stdinPath,await readFileAsync(options.f||'/dev/null'))

  let cmdsuffix = (options.f != null) ?  ' cat /shell-stdin' : '';

  let cmd = (input) => cmdsuffix != null ? `${cmdsuffix}${input||''}` : input
  let execCmd = async (cmd) => await shellExecDocker.exec(cmd,{stdinPath,imageName})

  let prompts = [{
    type: 'autocomplete',
    name: 'from',
    message: 'node-gsh >' + cmdsuffix,
    pageSize: 20,
    suggestOnly : true,
    source: function(answersSoFar, input) {
      return execCmd(cmd(input))
        .then(({output})=>[output])
        .catch(_=>[''])
    },
  }];

  let answers = await inquirer.prompt(prompts)
  let {output} = await execCmd(cmd(answers.from))
  process.stdout.write(output);
});

prog.parse(process.argv);
