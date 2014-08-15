var request     = require('request');
var fs          = require('fs');
var http        = require('http');
var util        = require('util');

var symbols = "http://www.localeplanet.com/api/auto/currencymap.json";
var symbolFile = "symbols.json";

var modules = [
    'request',
    'colors',
    'numeral'
];

function getColor(message, color)
{
    if (colorBol)
    {
        if (color == "red")
        {
            return message.red;
        }
        else if (color == "green")
        {
            return message.green;
        }
    }
    else
    {
        return message;
    }
}

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

var colorBol = isModuleAvailableSync('colors');
var color = colorBol ? require('colors') : null;

function error (moduleError)
{
    var message = "Module " + moduleError + " is not installed, please install it by running npm install " + moduleError;
    console.log(getColor("Error","red"));
    console.log(getColor(message, "red"));
    console.log("");
}

function success (moduleSuccess)
{
    var message = "Module " + moduleSuccess + " is installed";
    console.log(getColor("Success", "green"));
    console.log(getColor(message, "green"));
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
                        console.log(getColor("ERROR", "red"));
                        console.log(getColor("You need read and write permission, please contact your administrator.", "red"));
                    }
                    else
                    {
                        console.log(getColor("ERROR", "red"));
                        console.log(getColor(e, "red"));
                    }
                }
                else
                {
                    console.log(getColor("SUCCESS", "green"));
                    console.log(getColor(symbolFile, "green" )+ getColor(" has been created.", "green"));
                }
            })
        }
    });

}
downloadSymbol();