var parseString = require('xml2js').parseString;
var request     = require('request');
var util        = require('util');
var color       = require('colors');
var http        = require('http');
var fs          = require('fs');
var csv         = require('csv');
var buf         = require('buffer');

var yahoo = "http://finance.yahoo.com/webservice/v1/symbols/allcurrencies/quote";
var currencyArray = new Array();
var args = new Array();

function start(arg1, arg2, arg3)
{

    var link = "http://download.finance.yahoo.com/d/quotes.csv?s=" + arg1 + arg2 + "=X&f=l1";
    var request = http.get(link, function(response)
    {
        var parser = csv.parse({delimiter: ';'}, function(err, data)
        {
            if (arg3 == 0)
            {
                var p = 1;
                var s = "          ";
                for (var i = 0; i < 10; i++)
                {
                    msg = arg1 + " " + (p * (Math.pow(10, i))) + s + "=> " + (Math.max(Math.round((data * (p * (Math.pow(10, i)))) + "e+2") + "e-2")) + " " + arg2;
                    console.log(msg.green);
                    s = s.replace(/\s{1}$/gm, '');
                }

                process.exit();
            }
            var msg = arg3 + " " + arg1 + " => " +  (Math.max(Math.round((data * arg3) + "e+2")  + "e-2")) + " " + arg2;
            console.log(msg.green);
            process.exit();
        });

        response.pipe(parser);
    });
}

function list(arg1, arg2, arg3)
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

                } 
            });
        }
    })
}

function checkVar(arg, type)
{
    if (type == "int")
    {
        arg = parseInt(arg);
        if (arg)
        {
            return arg;
        }
        else
        {
            return 0;
        }
    }
    else
    {
        if (typeof(arg) === "string")
        {
            return arg.toUpperCase();
        }
        else
        {
            var msg = "Argument " + arg + " is not a number!";
            exit(msg);
            return false;
        }
    }
}

function exit(message)
{
    console.log("Error".red);
    console.log(message.red);
    process.exit();
}

var i = 0;

function read()
{
    if (i == 0)
    {
        console.log("Please type the currency you want to convert from".yellow);
    }
    else if (i == 1)
    {
        console.log("Please type the currency you want to convert to".yellow);
    }
    else if (i == 2)
    {
        console.log("Please type how much you want to convert".yellow);
    }
    else
    {
        start(args[0], args[1], args[2]);
    }
}

process.stdin.on('data', function (text) 
{
    console.log("");
    if (i < 3)
    {
        if (typeof(util.inspect(text)) !== 'undefined')
        {
            if (i < 2)
            {
                args[i] = checkVar(text.toString(), 'string').trim();
                if (currencyArray.indexOf(args[i]) < 0)
                {
                    exit(args[i] + " is not a supported currency");
                }
            }
            else
            {
                args[i] = checkVar(text.toString(), 'int');
            }
            i++;
            read();
        }
    }
});

list();
read();
