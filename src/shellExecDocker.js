const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

module.exports.exec = (cmd,opt) => {
  let stdinPath = opt.stdinPath || '/dev/null'
  let imageName = opt.imageName ||  'ubuntu'

  return new Promise(async (resolve, reject)=>{
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
      resolve(outputBase)
    }
    await writeFileAsync(cmdPath,cmd)


    let docker_callback = async function (err, data, container) {
      let output = await readFileAsync(outPath,  {encoding : 'utf8'})
      //process.stdout.write(outstr);
      resolve(Object.assign(outputBase,{
        output: output.replace(/\r\n/g,'\n'),
      }))
    };

    docker.run(imageName, ["bash","/shell-gei"], streamFile,{
      Hostconfig: {
        AutoRemove : true,
        Binds: [
          `${cmdPath}:/shell-gei`,
          `${stdinPath}:/shell-stdin`,
        ],
      }
    },docker_callback);
  });
};
