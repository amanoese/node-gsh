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

module.exports = {
  dockerInitAsync : async (options={}) => {
    let tempdir = tempy.directory();
    let container = await docker.createContainer({
        Image: 'ubuntu',
        Tty: true,
        Cmd: ['/bin/bash'],
        Hostconfig: {
          AutoRemove : true,
          Binds: [
            `${tempdir}:/app`,
          ]
        },
        ...options
    });
    let data = await container.start({})

    return { container, data ,tempdir }
  },
  dockerExec : async (container,tempdir,cmd) => {
    await writeFileAsync(tempdir + '/shell-gei',cmd)

    let stdout = tempy.file({extension: 'shell-gei'});
    let stderr = tempy.file({extension: 'shell-gei'});

    let exec = await container.exec({
        Cmd: ['bash', '/app/shell-gei'],
        AttachStdout: true,
        AttachStderr: true
    });

    let stream = await exec.start({});
    docker.modem.demuxStream(stream.output, fs.createWriteStream(stdout),fs.createWriteStream(stderr));

    return await new Promise((resolve,reject)=>{
        stream.output.on('end', () => {
            resolve({ stdout, stderr });
        });
    });
  },
  exec : async (cmd,opt={}) => {
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
  }
}
