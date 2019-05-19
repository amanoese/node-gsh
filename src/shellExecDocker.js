const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

module.exports.exec = (cmd) => {
  return new Promise(async (resolve, reject)=>{
    let cmdPath    = tempy.file({extension: 'shell-gei'});
    let outPath    = tempy.file({extension: 'shell-gei'});
    let streamFile = fs.createWriteStream(outPath);

    await writeFileAsync(cmdPath,cmd)

    let docker_callback = async function (err, data, container) {
      let output = await readFileAsync(outPath,  {encoding : 'utf8'})
      //process.stdout.write(outstr);
      resolve({
        output: output.replace(/\r\n/g,'\n'),
        cmd,
        cmdPath,
        outPath,
      })
    };

    docker.run('ubuntu', ["bash","/shell-gei"], streamFile,{
      Hostconfig: {
        AutoRemove : true,
        Binds: [
          `${cmdPath}:/shell-gei`
        ],
      }
    },docker_callback);
  });
};
