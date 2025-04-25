const replaceTemplate = function (temp, product) {
  let outPut = temp;

  outPut = outPut.replaceAll('{%PRODUCTNAME%}', product.productName);
  outPut = outPut.replaceAll('{%IMAGE%}', product.image);
  outPut = outPut.replaceAll('{%FROM%}', product.from);
  outPut = outPut.replaceAll('{%NUTRIENTS%}', product.nutrients);
  outPut = outPut.replaceAll('{%QUANTITY%}', product.quantity);
  outPut = outPut.replaceAll('{%PRICE%}', product.price);
  outPut = outPut.replaceAll('%DESCRIPTION%', product.description);
  outPut = outPut.replaceAll('{%SLUG%}', product.slug);
  // outPut = outPut.replaceAll('{%ID%}', product.id);

  outPut = outPut.replace(
    '{%NOT-ORGANIC%}',
    `${!product.organic ? 'not-organic' : ''}`
  );

  return outPut;
};

module.exports = replaceTemplate;
