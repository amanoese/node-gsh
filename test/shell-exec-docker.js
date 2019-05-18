let shellExecDocker = require('../src/shell-exec-docker.js');

(async () =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let outstr = await shellExecDocker.exec('seq 20 | factor')
  console.log(JSON.stringify(outstr,null,'  '));
})();
