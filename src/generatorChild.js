"use strict";
/*
    Toweratta.tk - Online Multiplayer Game
    Copyright (C) 2017 Andrew S

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var JavaScriptObfuscator = require('javascript-obfuscator');
var SimpleProtocols = require('./modules/SimpleProtocols/index.js');
var UglifyJS = require("uglify-es");
var fs = require('fs');


function compile(code, callback) {
    return UglifyJS.minify(code).code;
}

function obfuscate(code) {
    return JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: false,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: false,
        disableConsoleOutput: false,
        domainLock: [],
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        renameGlobals: false,
        reservedNames: [],
        rotateStringArray: true,
        seed: 0,
        selfDefending: true,
        sourceMap: false,
        sourceMapBaseUrl: '',
        sourceMapFileName: '',
        sourceMapMode: 'separate',
        stringArray: true,
        stringArrayEncoding: false,
        stringArrayThreshold: 0.75,
        target: 'browser',
        unicodeEscapeSequence: false
    }).getObfuscatedCode()
}

var generated = [];

process.on('message', (msg, socket) => {
    switch (msg.type) {
        case 'generate':

            for (var i = 0; i < msg.amount; i++) {
                var updatenodes = SimpleProtocols(msg.updateNodesStruct);
                var nclient = msg.client.replace('// INSERT PROTOCOL', function () {
                    return updatenodes.getb
                })

                //nclient = compile(nclient);
                //nclient = obfuscate(nclient);
                generated.push({
                    UNodesProtocol: updatenodes.set,
                    UNodesProtocolBrowser: updatenodes.getb,
                    client: nclient
                });

                if (i && i % 5 === 0 || i === msg.amount - 1) {
                    process.send({
                        type: 'progress',
                        i: i + 1
                    })
                }
            }

            break;
        case 'get':
            process.send({
                type: 'results',
                data: generated
            })
            break;
        case 'stop':
            process.exit(0);
            break;
    }
});
