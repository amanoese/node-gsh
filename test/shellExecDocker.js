const test = require('ava');
const fs    = require('fs');
const util  = require('util');
const readFileAsync  = util.promisify(fs.readFile);

let shellExecDocker = require('../src/shellExecDocker');

test('docker run',async t =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let outstr = await shellExecDocker.exec('seq 20 | factor')
  console.log(JSON.stringify(outstr,null,'  '));
  t.pass();
});

test.only('docker start && exec ',async t =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let { container,data } = await shellExecDocker.dockerInitAsync();
  let { stdout, stderr } = await shellExecDocker.dockerExec(container);
  console.log({ stdout: (await readFileAsync(stdout)).toString() });
  console.log({ stderr: (await readFileAsync(stderr)).toString() });
  t.pass();
});
