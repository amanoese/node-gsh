const autocompletePrompt = require('cli-autocomplete')
const execa = require('execa')

const suggestExec = async (input) => {
  let {stdout,cmd} = result  = await execa.shell(input);
  let title = stdout.split('\n').slice(0,20).join('\n')
  return [ { title , value: input } ]
}

autocompletePrompt('gsh', suggestExec)
  //.on('data', (e) => console.log('miss exec', e.value))
  .on('submit', (v) => console.log(v))
