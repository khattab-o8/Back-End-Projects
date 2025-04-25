// (Built-in node modules)
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////////////////
//////////
// Files
// Blocking, synchronous way
/*
// Read file
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const date = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

// Write to file
const textOut = `This is all what we know about avocado 🥑: \n${textIn} \n\nCreated on: ${formattedDate}`;
fs.writeFileSync('./txt/outPut.txt', textOut);
console.log('File written 📝');
*/
///////////////////////////////////////////////
// Non-blocking, Asynchronous way
/*
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if (err) return console.log('ERROR 💥');

  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);

    fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
      console.log(data3);

      fs.writeFile('./txt/final.txt', `${data2} \n${data3}`, 'utf8', err => {
        console.log('Your file has been written 🎉');
      });
    });
  });
});
*/
///////////////////////////////////////////////
//////////

// Server
// Creating a Simple Web Server - Routing
// Building a (Very) Simple API - HTML Templating: Building the Templates
// HTML Templating: Filling the Templates - Parsing Variables from URLs
// Using Modules 2: Our Own Modules (Our Own Modules)
// Introduction to NPM and the package.json File
// Types of Packages and Installs
// Using Modules 3: 3rd Party Modules

/**/
// Step-1: Read data from JSON file
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');

// Step-2: Parse data into JS object
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);

const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

// Adding slugs to each product
dataObj.forEach(el => (el.slug = slugify(el.productName, { lower: true })));

// const slugs = dataObj.map(el =>
//   slugify(el.productName, {
//     replacement: '_',
//     lower: true,
//     strict: true,
//   })
// );

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  switch (pathname) {
    // Overview Page
    case '/':
    case '/overview':
      const cardsHtml = dataObj
        .map(el => replaceTemplate(tempCard, el))
        .join('');

      const outPutOverview = tempOverview.replace('{%CARD-FIGURE%}', cardsHtml);

      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(outPutOverview);
      break;

    // Product Page
    case '/product':
      // const product = dataObj.at(query.id);
      const product = dataObj.find(el => el.slug.includes(query.id));
      const outPutProduct = replaceTemplate(tempProduct, product);

      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(outPutProduct);
      break;

    // API
    case '/api':
      // Step-3: Send data back as a response to the client
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(data);
      break;

    // NOT Found Page
    default:
      res.writeHead(404, {
        'content-type': 'text/html',
        'my-own-header': 'Hello World!',
      });

      res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port: 8000');
});

///////////////////////////////////////////////
