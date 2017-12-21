require('dotenv').config();
const rp = require('request-promise');
const crypto = require('crypto')
const json2csv = require('json2csv');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const apiKey = process.env.BFX_API_KEY;
const apiSecret = process.env.BFX_API_SECRET;
const baseUrl = 'https://api.bitfinex.com';
const url = '/v1/history';
const completeURL = baseUrl + url;
const symbol = "BTC";

const dates = [
	{
		dateFrom: moment('2016-07-01').unix(),
		dateUntill: moment('2016-09-29').unix(),
	},
	{
		dateFrom: moment('2016-10-01').unix(),
		dateUntill: moment('2016-12-30').unix(),
	},
	{
		dateFrom: moment('2017-01-01').unix(),
		dateUntill: moment('2017-03-31').unix(),
	},
	{
		dateFrom: moment('2017-04-01').unix(),
		dateUntill: moment('2017-06-30').unix(),
	}
]

async function getFinexData() {

	let arrayData = [];

	for (let theDate of dates) {

		let nonce = Date.now().toString();

		let body = {
			request: url,
			nonce,
			currency: symbol,
			since: theDate.dateFrom,
			until: theDate.dateUntill,
			limit: 100000,
			reverse: 1
		}

		let payload = new Buffer(JSON.stringify(body)).toString('base64')

		let signature = crypto
		.createHmac('sha384', apiSecret)
		.update(payload)
		.digest('hex')

		let options = {
			method: "POST",
			url: completeURL,
			headers: {
				'X-BFX-APIKEY': apiKey,
				'X-BFX-PAYLOAD': payload,
				'X-BFX-SIGNATURE': signature
			},
			body: JSON.stringify(body)
		}

		await rp( options )
			.then(function (parsedBody) {
					let data = JSON.parse(parsedBody);

					data.forEach(function(part, index) {
						part.timestamp = moment.unix(part.timestamp).format("YYYY-MM-DD HH-mm-SS");
					});

					arrayData = arrayData.concat(data);
			})
			.catch(function (err) {
					// POST failed...
					console.log("err", err);
			});
	}

	return arrayData;
}

getFinexData().then( (data) => {

	let fields = ['currency', 'amount', 'balance', 'description', 'timestamp'];
	let result = json2csv({ data: data, fields: fields });

	let fileName = "balance_history_" + symbol + '.csv';
	let filePath = path.resolve(__dirname) + '/' + fileName;

	fs.writeFile(filePath, result, function(err) {
		if (err) throw err;
		console.log("file is written");
	});
});
