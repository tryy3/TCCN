var parseString = require('xml2js').parseString;
var request     = require('request');
var util        = require('util');
var color       = require('colors');
var http        = require('http');
var fs          = require('fs');
var csv         = require('csv');

var yahoo = "http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote";
var currencyArray = [];

function start(arg1, arg2, arg3)
{
    request(yahoo, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            parseString(body, function (err, result) {
                var jsonResult = JSON.stringify(result);
                var jsonEnd = JSON.parse(jsonResult);
                var start = 0
                var end = jsonEnd.list.resources[0].resource.length
                for (var i = start; i < end; i++)
                {
                    var currency    = jsonEnd.list.resources[0].resource[i].field[0]._;
                    var realC       = currency.replace("USD/", "");
                    if (realC.length == 3)
                    {
                        currencyArray[i] = realC;
                    }

                    if (i == (end - 1))
                    {   
                        if ((currencyArray.indexOf(arg1) >= 0) && (currencyArray.indexOf(arg2) >= 0))
                        {
                            var link = "http://download.finance.yahoo.com/d/quotes.csv?s=" + arg1 + arg2 + "=X&f=l1";
                            var request = http.get(link, function(response)
                            {
                                var parser = csv.parse({delimiter: ';'}, function(err, data){
                                    if (data == 0)
                                    {
                                        console.log("Something went wrong, currency is 0!");
                                        console.log("Please check your arguments!");
                                    }
                                    else
                                    {

                                        var msg = (Math.max(Math.round((data * arg3) + "e+2")  + "e-2")) + " " + arg2;
                                        console.log(msg.green);
                                    }
                                });

                                response.pipe(parser);
                            });
                        }
                        else
                        {
                            console.log("Currency not availible!");
                        }
                    }
                } 
            });
        }
    })
}

if ( (typeof process.argv[2] !== 'undefined' && process.argv[2]) && (typeof process.argv[3] !== 'undefined' && process.argv[3]) && (typeof process.argv[4] !== 'undefined' && process.argv[4]))
{
    start(process.argv[2], process.argv[3], process.argv[4]);
}
else
{
    console.log("Error");
    console.log("1 or more Arguments was not valid");
}