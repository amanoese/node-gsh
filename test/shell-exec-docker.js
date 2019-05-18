let shellDockerExec = require('../shell-exec-docker.js');

(async () =>{
  //let outstr = await shellDockerExec.exec('echo Hello,World!')
  let outstr = await shellDockerExec.exec('seq 10 | factor')
  console.log(JSON.stringify(outstr,null,'  '));
})();
