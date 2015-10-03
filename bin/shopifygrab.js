var request     = require('request'),
	_           = require('lodash'),
	chalk       = require('chalk'),
	fs          = require('fs'),
	target_url  = 'http://archive.kioskkiosk.com/products.json?limit=50&page=',
	total_pages = 26,
	all_products = [];

_.times(total_pages, runForCover);

function runForCover(n){
	request(target_url+n, onResponse);
}

function onResponse(err, res, body){
	if(!err && res.statusCode == 200){
		var obj = JSON.parse(body);

		// all_products.push(obj.products);
		
		all_products.push(_.map(obj.products, getBodyHtml));

		if(all_products.length >= total_pages) {
		 	writeProducts(_.flatten(all_products));
		}
		
	}
};

function getBodyHtml(product, idx, arr) {

	var re = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,
		doc = {
			title: product.title,
			id: product.id,
		};

	console.log(chalk.yellow('Product: ', product.title));
	console.log(chalk.yellow('id# ', product.id));

	if(product.body_html){

		_.extend(doc, parseBody(product.body_html));
		//console.log(chalk.blue(product.body_html.replace(re, ' ')));
		//doc = parseBody(product.body_html);

		console.log(chalk.blue(doc.provenance));
		console.log(chalk.blue(doc.description));
		console.log(chalk.yellow('======================='));
	}else{
		console.log(chalk.blue(product.body_html));
	}
	
	return doc;
}

function parseBody(body_html){
  var parts, heads;

  parts = (body_html) ? body_html.replace(/<\/?(?!p|br)[^>]+>/g,'').split(/<p[^>]*>/) : null;
  parts.shift();
  heads = (parts) ? parts.shift() : null;
  return {
    provenance: (heads) ? heads.split(/<br ?\/?>/gi).pop().trim() : null,
    description: (parts) ? parts.join('\n').replace(/<[^>]+>/,'').trim() : null
  }
}

function writeProducts(products) {
	fs.writeFile('bin/kiosk_products.json', JSON.stringify(products), 'utf-8', function(err){
		if(err){
			console.log(chalk.red('Error: kioskkiosk > json \n\n'), err);
		} else {
			console.log(chalk.green('Done'));
		}
	});
}