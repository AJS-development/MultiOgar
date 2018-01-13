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

var fs = require('fs');
var Child = require('child_process')


module.exports = function (amount, call) {
    var cpus = require('os').cpus().length;

    var todo = amount + 3 + cpus;
    var done = 0;

    function loading(ne) {
        done++;
        var percent = Math.round(done / todo * 10)
        var bar = ""
        for (var i = 0; i < percent; i++) {
            bar = bar + "===";
        }
        if (percent == 10) bar = bar + "=";
        else bar = bar + ">";
        var extras = 31 - bar.length;
        var extra = "";
        for (var i = 0; i < extras; i++) extra = extra + " ";
        process.stdout.write("\u001B[?25l\r\x1b[K[Generator] [" + bar + extra + "] " + percent * 10 + "% " + ne);
    }
    loading("Generating secure protocol.")

    var results = [];
    var client = fs.readFileSync(__dirname + '/../client/main_out.js', 'utf8');
    var childs = [];
    for (var i = 0; i < cpus; i++) {
        childs.push(Child.fork(__dirname + '/generatorChild.js'))
    }

    var e = Math.floor(amount / cpus);
    var mod = (amount % cpus)
    var results = [];
    var id = 0;
    var totals = [];
    childs.forEach((child, i) => {
        totals[i] = 0;
        var a = e + ((i < mod) ? 1 : 0);
        //console.log(a, amount, e, mod)
        if (a) {

            child.on('message', function (msg) {

                if (msg.type === 'progress') {

                    totals[i] = msg.i;
                    var tot = (totals.reduce((a, b) => {
                        return a + b
                    }, 0));
                    done = tot;
                    loading('Generated ' + tot + '/' + amount)

                    if (tot === amount) {
                        loading("Gathering data...")
                        childs.forEach((child) => {
                            child.send({
                                type: 'get'
                            })
                        });
                    }
                } else if (msg.type === 'results') {
                    msg.data.forEach((d) => {
                        results.push(d)
                    })
                    loading('Recieved ' + results.length + '/' + amount);
                    if (results.length === amount) {
                        results.forEach((d, i) => {
                            d.id = i;
                            d.update = new Function('data1', d.UNodesProtocol);
                        })
                        childs.forEach((child) => {
                            child.send({
                                type: 'stop'
                            });
                        });
                        loading('Done! ' + results.length + '/' + amount);
                        console.log('')
                        call(results)
                    }
                }
            })

            child.send({
                type: 'generate',
                client: client,
                amount: a,
                updateNodesStruct: {
                    eat: [
                        {
                            killer: 'int 0 4000000000',
                            killed: 'int 0 4000000000'
                        }
                    ],
                    update: [
                        {
                            id: 'int 0 4000000000',
                            posX: 'int -32000 32000',
                            posY: 'int -32000 32000',
                            size: 'int -32000 32000',
                            r: 'int uint8',
                            g: 'int uint8',
                            b: 'int uint8',
                            flags: 'int 0 50',
                            skin: 'string 8',
                            name: 'string 16',
                        }
                    ],
                    remove: [
                        'int 0 4000000000'
                    ]
                }
            })

        }

    })

}
