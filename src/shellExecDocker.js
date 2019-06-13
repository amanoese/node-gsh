const Docker = require('dockerode');
const docker = new Docker();

const fs    = require('fs');
const tempy = require('tempy');
const util  = require('util');

const readFileAsync  = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const copyFileAsync = util.promisify(fs.copyFile);

module.exports = {
  dockerInitAsync : async (options={}) => {
    let Image = options.Image || 'ubuntu';
    let tempdir = tempy.directory();
    let container = await docker.createContainer({
      Image,
      Tty: true,
      Cmd: ['/bin/bash'],
      Hostconfig: {
        AutoRemove : true,
        Binds: [
          `${tempdir}:/app`,
        ]
      },
      WorkingDir : '/app',
      ...options
    });
    let data = await container.start({})

    return { container, data ,tempdir }
  },
  dockerExec : async (container,tempdir,cmd,options={}) => {
    let outputBase = { stdout:'', stderr:'', cmd }
    if (cmd == null||cmd == '') {
      return outputBase
    }

    await copyFileAsync(options.stdinPath || '/dev/null',tempdir + '/shell-stdin')
    await writeFileAsync(tempdir + '/shell-gei',cmd)

    let stdout = tempy.file({extension: 'shell-gei'});
    let stderr = tempy.file({extension: 'shell-gei'});

    let exec = await container.exec({
      Cmd: ['/bin/bash', 'shell-gei'],
      AttachStdout: true,
      AttachStderr: true
    });

    let stream = await exec.start({});
    docker.modem.demuxStream(stream.output, fs.createWriteStream(stdout),fs.createWriteStream(stderr));

    return await new Promise((resolve,reject)=>{
      stream.output.on('end', async () => {
        resolve({
          ...outputBase,
          stdout : (await readFileAsync(stdout,  {encoding : 'utf8'})).replace(/\r\n/g,'\n'),
          stderr : (await readFileAsync(stderr,  {encoding : 'utf8'})).replace(/\r\n/g,'\n')
        });
      });
    });
  },
  container : null,
  tempdir : null,
  exec : async function(cmd,initOption={},execOption={}) {
    if (!this.container || !this.tempdir) {
      let { container, data ,tempdir } = await this.dockerInitAsync(initOption)
      this.container = container
      this.tempdir = tempdir
    }

    return await this.dockerExec(this.container,this.tempdir,cmd,execOption);
  },
  close : async function(){
    if ( !this.container) { return }
    //container stop & auto remove
    await this.container.stop();
  }
}
