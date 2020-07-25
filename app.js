// Setup and configuration
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();
const mongoose = require('mongoose');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Connect to monogodb
mongoose.connect('mongodb://localhost:27017/Countries', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

// Creating schema and default items
const countrySchema = {
	name: String,
	population: Number,
	region: String,
	capital: String,
	flag: String,
};

// Create db
const Country = mongoose.model('Country', countrySchema);

app
	.route('/')
	.get(function (req, res) {
		const url = `https://restcountries.eu/rest/v2/all`;
		https.get(url, function (response) {
			var body = '';

			response.on('data', function (data) {
				body += data;
			});

			response.on('end', function () {
				let countryData = JSON.parse(body);
				Country.find({}, function (err, foundCountry) {
					console.log(foundCountry);

					if (foundCountry.length === 0) {
						for (let i = 0; i < countryData.length; i++) {
							const name = countryData[i].name;
							const countryRegion = countryData[i].region;
							const population = countryData[i].population;
							const capital = countryData[i].capital;
							const flag = countryData[i].flag;
							const country = new Country({
								name: name,
								population: population,
								region: countryRegion,
								capital: capital,
								flag: flag,
							});
							country.save();
						}
						res.redirect('/');
					} else {
						res.render('homepage', { country: foundCountry });
					}
				});
			});
		});
	})
	.post(function (req, res) {
		// Get information from text boxes and save in db
		let search = req.body.search;
		Country.find(
			{
				$or: [{ name: search }, { region: search }, { capital: search }],
			},
			function (err, foundList) {
				if (!err) {
					if (foundList) {
						console.log(foundList);
						res.render('homepage', { country: foundList });
					} else {
						console.log('error');
						res.render('error');
					}
				} else {
					console.log('error');
					res.render('error');
				}
			}
		);
	});

app.listen(3000, function () {
	console.log('Server is running on port 3000');
});
