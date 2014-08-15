var request     = require('request');
var util        = require('util');
var color       = require('colors');
var http        = require('http');
var fs          = require('fs');
var buf         = require('buffer');
var numeral     = require('numeral');

//Change this setting!
var appid = "c2180f1420804949ade783320809ba98";



var symbolFile = "symbols.json";
var symbols;

var currencyWebsite = "http://openexchangerates.org/api/";
var currencyList = currencyWebsite + "currencies.json";
var currencyExchange = currencyWebsite + "latest.json?app_id=" + appid;
var currentCurrencyList; 
var currentExchange;
var currencyArray;

var arg1;
var arg2;
var arg3;

function trimer(arg, message)
{
    if (arg == 'space')
    {
        return message.replace(/^\s+|\s+$/g, '');
    }
    else if (arg == 'fspace')
    {
        return message.replace(/^\s+/, '');
    }
    else if (arg == 'lspace')
    {
        return message.replace(/\s+$/, '');
    }

    else if (arg == 'full')
    {
        return message.replace(/^[, . : ; \n \s]+|[, . : ; \n \s]+$/g, '');
    }
    else
    {
        exit('Can\'t trim that method, ' + arg);
    }
}

function list()
{
    request(currencyList, function (error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            currencyArray = JSON.parse(body);
        }
    });
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

function base(arg)
{
    request(currencyExchange + "&base=" + arg, function(error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            currentCurrencyList = JSON.parse(body);
        }
    })

}

function exit(message)
{
    console.log("Error".red);
    console.log(message.red);
    process.exit();
}

function getSymbolList()
{
    var read = fs.readFile(symbolFile, 'utf8', function(e, data)
    {
        if (e)
        {
            if (e.errno == 3)
            {
                console.log("ERROR".red);
                console.log("You need read and write permission, please contact your administrator.".red);
                process.exit();
            }
            else
            {
                console.log("ERROR".red);
                console.log(e.red);
                process.exit();
            }
        }

        symbols = JSON.parse(data);
    });
}

function getSymbol(currency)
{
    if (symbols[currency])
    {
        return symbols[currency].Code + " (" + currency + ")";
    }
    else
    {
        return currency;
    }
}

function convert(cur1, cur2, amount)
{
    cur1 = currentCurrencyList.rates[cur1];
    cur2 = currentCurrencyList.rates[cur2];

    var a1 = cur2 * amount;
    var a2 = a1 / cur1;

    return Math.abs(Math.round(a2 + "e+2") + "e-2");

}

var count = 0;

function read()
{
    if (count == 0)
    {
        getSymbolList();
        console.log("List all the currencies? y/N".yellow);
    }
    else if (count == 1)
    {
        console.log();
        console.log("Please type the currency you want to convert from".yellow);
    }
    else if (count == 2)
    {
        console.log("Please type the currency you want to convert to".yellow);
    }
    else if (count == 3)
    {
        console.log("Please type how much you want to convert".yellow);
    }
}

process.stdin.on('data', function (text) 
{
    console.log("");
    if (count < 4)
    {
        if (typeof(util.inspect(text)) !== 'undefined')
        {
            if (count == 0)
            {
                var list = checkVar(text.toString(), 'string').trim();

                if (list.toUpperCase() == "Y" || list.toUpperCase() == "YE" || list.toUpperCase() == "YES")
                {
                    var p = 0;
                    var message = "";
                    for (var key in currencyArray)
                    {
                        if (p < 5)
                        {
                            message = message.concat(key + ", ");
                            p++;
                        }
                        else
                        {
                            console.log(trimer('full', message).yellow);
                            p = 0;
                            message = "";
                        }
                    }
                }
            }
            else if (count == 1)
            {
                arg1 = checkVar(text.toString(), 'string').trim();

                if (typeof currencyArray[arg1] == 'undefined')
                {
                    exit(arg1 + " is not a supported currency");
                }

                base("USD");
            }
            else if (count == 2)
            {
                arg2 = checkVar(text.toString(), 'string').trim();

                currentExchange = currentCurrencyList.rates[arg2];
            }
            else
            {
                arg3 = checkVar(text.toString(), 'int');

                if (arg3 == 0)
                {
                    var p = 1;
                    var s = "          ";
                    for (var i = 0; i < 10; i++)
                    {
                        msg = arg1 + " " + (p * (Math.pow(10, i))) + s + "=> " + convert(arg1, arg2, p) + " " + arg2;
                        console.log(msg.green);
                        s = s.replace(/\s{1}$/gm, '');
                    }

                    process.exit();
                }

                var msg = arg3 + getSymbol(arg1) + " => " + numeral(convert(arg1, arg2, arg3)).format('0,0.00') + getSymbol(arg2);
                console.log(msg.green);
                process.exit();
            }
            count++;
            read();
        }
    }
});

list();
read();
