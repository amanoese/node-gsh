const fs = require('fs')
const parse = require('bash-parser');

module.export = {
  exec(cmd){
    const ast = parse(cmd);
    let commands =
      (ast.commands.type === 'Pipeline')
      ? awt.commands.commands
      : awt.commands;
    console.log()
  },
  clear(){

  }
}
