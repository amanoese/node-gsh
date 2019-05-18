#!/usr/bin/env node
const autocompletePrompt = require('cli-autocomplete');
const execa = require('execa');

let title = ''
const suggestExec = async (input) => {
  try {
    let {stdout,cmd} = await execa.shell(input)
    this.title =  stdout.split('\n').slice(0,20).join('\n') || title
  } catch {
    //any
  }
  return [ { title:this.title , value: input } ].filter(v=>v.title)
}

let f = ()=>{
  autocompletePrompt('node-gsh', suggestExec)
  .on('submit', (...args) => {
    title = ''
    f();
    //execa.shell(args[0]).stdout.pipe(process.stdout)
  })
};
f();
