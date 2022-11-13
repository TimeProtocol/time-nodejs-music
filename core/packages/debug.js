//  debug.js
//  ========

const path = require('path');

var fpath = './debug.js'
var _objectName = path.basename(fpath, path.extname(fpath));

module.exports = {

    log: function(text) {
        //  filepath object
        var objectName = _objectName;

        //  caller
        var _caller = arguments.callee.caller;

        //  calling function name if applicable
        var _function = arguments.callee.caller.name;

        //console.trace();

        if (_function == "") {
            if (arguments.length > 1) {
                _function = arguments[`1`];
            } else {
                _function = "ASYNC";
            }
        }

        //  Text is an object, print it on a secondary console so the json object extends vertically
        if (typeof text == `object`) {
            console.log(text);
            console.log(``);
        }
        //  Text is a string, print it on the same line
        else if (typeof text == `string`) {
            console.log(`[${_function.toUpperCase()}] => ` + text);
        } 
        //  Text is a number, convert to string
        else if (typeof text == 'number') {
            console.log(`[${_function.toUpperCase()}] => ` + String(text));
        }
        //  Text is a boolean
        else if (typeof text == `boolean`) {
            console.log(`[${_function.toUpperCase()}] => ` + text);
        }
    },

    section: function(text, color="\x1b[0m") {
        var length = text.length;

        //var _time = `[${time.frames}]`;
        //var _timeLength = _time.length;

        //var extraLeftsideLengthString = "";
        //for(var i=0;i<_timeLength;i++) {
        //    extraLeftsideLengthString += " ";
        //}

        var fullLength = length; //+ _timeLength;
        var border = "";
        for(var i=0;i<fullLength;i++) {
            border += "=";
        }

        console.log(color, ``);
        console.log(color, border);
        //console.log(color, `${_time}${extraLeftsideLengthString}${text}`);
        console.log(color, `${text}`);
        console.log(color, border);
        console.log(color, ``);
    },

    error: function(err) {

        if (typeof err == `object`) {
            if (err.fatal) {
                var text = 'FATAL ERROR';
            } else if (!err.fatal) {
                var text = 'NON FATAL ERROR';
            }
        } else if (typeof err == `string`) {
            var text = `ERROR`;
        }


        var textLength = text.length;
        var border = "";
        for(var i=0;i<textLength;i++) {
            border += "=";
        }
        if (typeof err == `string`) {
            for(var i=0;i<err.length;i++) {
                border += "="
            }
        }


        console.log(``);

        console.log('\x1b[31m', border);
        console.log('\x1b[31m', text);
        console.log('\x1b[31m', border);
        console.log(``);

        console.log(err);

        console.log(``);
        console.log('\x1b[31m', border);
        console.log('\x1b[31m', text);
        console.log('\x1b[31m%s\x1b[0m', border);
    },

}