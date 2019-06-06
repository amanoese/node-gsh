const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const dockerRunAsync = (imageName,cmd,stream,option,callback)=> {
  return new Promise((resolve,reject)=>{
    docker.run(imageName,cmd,stream,option,(...args)=> resolve(args));
  })
}

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

  if (cmd == null||cmd == '') {
    return outputBase
  }
  await writeFileAsync(cmdPath,cmd)

  let [ err, data, container ] = await dockerRunAsync(
    imageName,
    ["bash","/shell-gei"],
    streamFile,
    {
      Hostconfig: {
        AutoRemove : true,
        Binds: [
          `${cmdPath}:/shell-gei`,
          `${stdinPath}:/shell-stdin`,
        ]
      }
    }
  );
  if (err) { throw err }

  let output = await readFileAsync(outPath,  {encoding : 'utf8'})

  return Object.assign(outputBase,{
    output: output.replace(/\r\n/g,'\n'),
  })
};
