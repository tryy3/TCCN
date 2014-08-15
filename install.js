var request     = require('request');
var fs          = require('fs');
var color       = require('colors');
var http        = require('http');
var util        = require('util');

var symbols = "http://www.localeplanet.com/api/auto/currencymap.json";
var symbolFile = "symbols.json";

var modules = [
    'request',
    'colors',
    'numeral'
];

var isModuleAvailableSync = function(moduleName)
{
    var ret = false;
    var dirSeparator = require("path").sep;

    module.paths.forEach(function(nodeModulesPath)
    {
        if(fs.existsSync(nodeModulesPath + dirSeparator + moduleName) === true)
        {
            ret = true;
            return false;
        }
    });

    return ret;
}

function error (moduleError)
{
    var message = "Module " + moduleError + " is not installed, please install it by running npm install " + moduleError;
    console.log("Error".red);
    console.log(message.red);
    console.log("");
}

function success (moduleSuccess)
{
    var message = "Module " + moduleSuccess + " is installed";
    console.log("Success".green);
    console.log(message.green);
    console.log("");
}

modules.forEach(function(moduleN)
{
    if(!isModuleAvailableSync(moduleN))
    {
        error(moduleN);
    }
    else
    {
        success(moduleN);
    }
});

function downloadSymbol()
{
    var currencies = {};
    request(symbols, function(error, response, body)
    {
        if (!error && response.statusCode == 200)
        {
            var jsonSymbol = JSON.parse(body);

            for (var symbol in jsonSymbol)
            {
                var currency = jsonSymbol[symbol];
                var currencyCode = currency.code;
                var currencySymbol = currency.symbol_native;
                if (currencyCode !== currencySymbol)
                {
                    currencies[currencyCode] = {'Code' : currencySymbol};
                }
            }

            var jsonOutput = JSON.stringify(currencies);
            
            var file = fs.writeFile(symbolFile, jsonOutput, function(e)
            {
                if (e)
                {
                    if (e.errno == 3)
                    {
                        console.log("ERROR".red);
                        console.log("You need read and write permission, please contact your administrator.".red);
                    }
                    else
                    {
                        console.log("ERROR".red);
                        console.log(e.red);
                    }
                }
                else
                {
                    console.log("SUCCESS".green);
                    console.log(symbolFile.green + " has been created.".green);
                }
            })
        }
    });

}
downloadSymbol();