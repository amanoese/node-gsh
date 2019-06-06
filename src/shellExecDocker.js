const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

module.exports.exec = async (cmd,opt={}) => {
  let stdinPath = opt.stdinPath || '/dev/null'
  let imageName = opt.imageName ||  'ubuntu'

  let cmdPath       = tempy.file({extension: 'shell-gei'});
  let outPath       = tempy.file({extension: 'shell-gei'});
  let streamFile    = fs.createWriteStream(outPath);

  let outputBase = {
    output:'',
    cmd,
    cmdPath,
    outPath,
  };

  let docker_run_p = ({imageName,cmdPath,stdinPath,streamFile})=> {
    return new Promise((resolve,reject)=>{
      docker.run(imageName, ["bash","/shell-gei"], streamFile ,{
        Hostconfig: {
          AutoRemove : true,
          Binds: [
            `${cmdPath}:/shell-gei`,
            `${stdinPath}:/shell-stdin`,
          ],
        }
      },(err, data, container)=>{
        if(err){ reject(err) }
        resolve(data)
      });
    })
  }

  if (cmd == null||cmd == '') {
    return outputBase
  }
  await writeFileAsync(cmdPath,cmd)

  await docker_run_p({imageName,cmdPath,stdinPath,streamFile});

  let output = await readFileAsync(outPath,  {encoding : 'utf8'})

  return Object.assign(outputBase,{
    output: output.replace(/\r\n/g,'\n'),
  })
};
