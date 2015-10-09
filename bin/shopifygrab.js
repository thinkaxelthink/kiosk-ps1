var request     = require('request'),
	_           = require('lodash'),
	chalk       = require('chalk'),
	fs          = require('fs'),
	target_url  = process.env.KIOSK_SHOPIFY_URL || 'http://localhost/products.json?limit=50&page=',
	total_pages = 26,
	all_products = [];

_.times(total_pages, runForCover);

function runForCover(n){
	request(target_url+(n+1), onResponse);
}

function onResponse(err, res, body){
	if(!err && res.statusCode == 200){
		var obj = JSON.parse(body);

		all_products.push(_.map(obj.products, getBodyHtml));

		if(all_products.length >= total_pages) {
		 	writeProducts(_.flatten(all_products));
		}

	} else {
		console.log(err || res.statusCode);
	}
};

function getBodyHtml(product, idx, arr) {

	var doc = {
			title: product.title,
			id: product.id,
			handle: product.handle,
			images: product.images,
			product_type: product.product_type
		};

	if(product.body_html){

		_.extend(doc, parseBody(product.body_html));

		if(process.env.DEBUG){
			console.log(chalk.yellow('Product: ', product.title));
			console.log(chalk.yellow('id# ', product.id));
			console.log(chalk.blue(doc.provenance));
			console.log(chalk.blue(doc.description));
			console.log(chalk.yellow('======================='));
		}
	}else{
		console.log(chalk.yellow(product.title + ', #' + product.id + ' has an NO body'));
	}

	return doc;
}

function parseBody(body_html){
  var parts, heads;

  parts = (body_html) ? body_html.replace(/<\/?(?!p|br)[^>]+>/gmi,'').split(/<p[^>]*>/) : null;
  parts.shift();
  heads = (parts) ? parts.shift() : null;
  return {
    provenance: (heads) ? heads.split(/<br ?\/?>/gmi).pop().trim() : null,
    description: (parts) ? parts.join('\n\n').replace(/<[^>]+>/gmi,' ').trim() : null
  }
}

function writeProducts(products) {
	products.sort(function(a,b){return a.id - b.id});
	fs.writeFile(process.env.PRODUCT_JSON_PATH, JSON.stringify(products), 'utf-8', function(err){
		if(err){
			console.log(chalk.red('Error: kioskkiosk > json \n\n'), err);
		} else {
			console.log(chalk.green('Done writing ', products.length, ' Documents'));
		}
	});
}
