const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

module.exports.exec = (cmd,opt) => {
  let option = Object.assign({
    containerName : 'ubuntu'
  },opt||{})

  return new Promise(async (resolve, reject)=>{
    let cmdPath    = tempy.file({extension: 'shell-gei'});
    let outPath    = tempy.file({extension: 'shell-gei'});
    let streamFile = fs.createWriteStream(outPath);

    await writeFileAsync(cmdPath,cmd)

    let outputBase = {
      output:'',
      cmd,
      cmdPath,
      outPath,
    };

    let docker_callback = async function (err, data, container) {
      let output = await readFileAsync(outPath,  {encoding : 'utf8'})
      //process.stdout.write(outstr);
      resolve(Object.assign(outputBase,{
        output: output.replace(/\r\n/g,'\n'),
      }))
    };

    docker.run(option.containerName, ["bash","/shell-gei"], streamFile,{
      Hostconfig: {
        AutoRemove : true,
        Binds: [
          `${cmdPath}:/shell-gei`
        ],
      }
    },docker_callback);
  });
};
