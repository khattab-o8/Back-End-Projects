// (Built-in node modules)
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////////////////

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

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  switch (pathname) {
    // Overview Page
    case '/':
    case '/overview':
      res.writeHead(200, { 'content-type': 'text/html' });

      const cardsHtml = dataObj
        .map(el => replaceTemplate(tempCard, el))
        .join('');

      const outPutOverview = tempOverview.replace('{%CARD-FIGURE%}', cardsHtml);

      res.end(outPutOverview);
      break;

    // Product Page
    case '/product':
      res.writeHead(200, { 'content-type': 'text/html' });
      // const product = dataObj.at(query.id);
      const product = dataObj.find(el => el.slug.includes(query.id));
      const outPutProduct = replaceTemplate(tempProduct, product);

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
