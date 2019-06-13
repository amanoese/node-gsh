#!/usr/bin/env node
const tempy = require('tempy');
const fs    = require('fs');
const util  = require('util');
const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const shellExecDocker = require('./src/shellExecDocker');
const shellautocomplete = require('./src/shellAutoComplete');
const Prompt = require('inquirer/lib/ui/prompt')

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
        .then(({stdout})=>[stdout])
        .catch(e=>[JSON.stringify(e,null,'  ')])
    },
  }];

  let answers = await inquirer.prompt(prompts)
  let {stdout} = await execCmd(cmd(answers.from))
  process.stdout.write(stdout);
});

class CustumPrompt extends Prompt {
  async onForceClose(){
    try {
        await shellExecDocker.close()
    } catch (e) {
        console.error(e)
    }
    this.close();
    process.kill(process.pid, 'SIGINT');
  }
}
inquirer.ui.Prompt = CustumPrompt;

prog.parse(process.argv);
