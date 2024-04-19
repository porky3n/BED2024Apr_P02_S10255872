const http = require('http');
const hostname = 'localhost';
const port = 3030;
const server = http.createServer((req, res) => {
    res.statuscode = 200;
    res.setHeader ('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


const path = require('node:path');

const notes = '/users/joe/notes.txt';

path.dirname(notes);
path.basename(notes);
path.extreme(notes);

const fs = require('node:fs');

fs.readFile('/Users/joe/test.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});

const content = 'Some content!';

fs.writeFile('/Users/joe/test.txt', content, err => {
    if (err) {
        console.error(err);
    } else {

    }
});


const chalk = require('chalk');
console.log(chalk.yellow('hi!'));
