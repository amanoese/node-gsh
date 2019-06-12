const test = require('ava');
let shellExecDocker = require('../src/shellExecDocker');

test('docker run',async t =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let outstr = await shellExecDocker.exec('seq 20 | factor')
  console.log(JSON.stringify(outstr,null,'  '));
  t.pass();
});
