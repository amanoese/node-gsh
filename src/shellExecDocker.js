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
   dockerInitAsync : () => {
    return new Promise((resolve,reject)=>{
        docker.createContainer({
            Image: 'ubuntu',
            Tty: true,
            AttachStdout: true,
            AttachStderr: true,
            Cmd: ['/bin/bash']
        },(err, container)=> {
            if(err){
                reject(err)
                return
            }
            container.start({}, (err, data)=> {
                if(err){
                    reject(err)
                    return
                }
                resolve({ container,data })
            })
        })
    })    
  },
  dockerExec : (container) => {
    let stdout = tempy.file({extension: 'shell-gei'});
    let stderr = tempy.file({extension: 'shell-gei'});

    return new Promise((resolve,reject)=>{
        container.exec({
            Cmd: ['bash', '-c', 'echo test $VAR'],
            Env: ['VAR=ttslkfjsdalkfj'],
            AttachStdout: true,
            AttachStderr: true
            }, function(err, exec) {
            if (err) { reject(err); return }
            exec.start(function(err, stream) {
                if (err) { reject(err); return }

                stream.on('end', () => {
                    resolve({ stdout, stderr });
                });
                docker.modem.demuxStream(stream, fs.createWriteStream(stdout),fs.createWriteStream(stderr));
            });
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
