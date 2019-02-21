const autocompletePrompt = require('cli-autocomplete')
const execa = require('execa')

const suggestExec = async (input) => {
  let {stdout,cmd} = result  = await execa.shell(input);
  let title = stdout.split('\n').slice(0,20).join('\n')
  return [ { title:input , value: input },{ title , value: input } ].filter(v=>v.title)
}

autocompletePrompt('gsh', suggestExec)
//.on('data', (e) => console.log('miss exec', e.value))
.on('submit', (v) => {
  execa.shell(v).stdout.pipe(process.stdout)
})
