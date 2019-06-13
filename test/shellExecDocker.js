const test = require('ava');
const fs    = require('fs');
const util  = require('util');
const readFileAsync  = util.promisify(fs.readFile);

let shellExecDocker = require('../src/shellExecDocker');

test.only('docker run',async t =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let outstr = await shellExecDocker.exec('seq 20 | factor')
  console.log(JSON.stringify(outstr,null,'  '));
  t.pass();
});

test('docker start && exec ',async t =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let { container,tempdir } = await shellExecDocker.dockerInitAsync();
  let result = await shellExecDocker.dockerExec(container,tempdir,'echo hello😆😆');

  console.log(result);
  t.pass();
});
