var Docker = require('dockerode');
var docker = new Docker();
const getStdin = require('get-stdin');
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

(async () => {
	let str = await getStdin();
  console.log(str)
  const file = fs.createWriteStream('example.txt');
  docker.run('ubuntu', str.split('|'), file, async function (err, data, container) {
    console.log(await readFileAsync(file.path,  {encoding : 'utf8'}));
  });
})();
