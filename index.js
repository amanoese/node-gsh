const autocompletePrompt = require('cli-autocomplete')

const colors = [
	{title: 'red',    value: '#f00'},
	{title: 'yellow', value: '#ff0'},
	{title: 'green',  value: '#0f0'},
	{title: 'blue',   value: '#00f'},
	{title: 'black',  value: '#000'},
	{title: 'white',  value: '#fff'}
]
const suggestColors = (input) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(colors.filter((color) => color.title.slice(0, input.length) === input)) , 500);
  });
}

autocompletePrompt('What is your favorite color?', suggestColors)
	.on('data', (e) => console.log('Interim value', e.value))
	.on('abort', (v) => console.log('Aborted with', v))
	.on('submit', (v) => console.log('Submitted with', v))
