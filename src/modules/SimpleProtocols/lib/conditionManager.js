/*
    SimpleProtocols - A protocol generator
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

module.exports = function (obj, data, parse, type, name, lvl, opt, dtlvl) {




    var condition = "var obj=data" + dtlvl + ";if (" + obj.if+") {";
    var then = obj.then
    var els = obj.else
    data.if = true
    if (opt.scrambleConditionals && Math.random() >= 0.5) {
        var condition = "var obj=data" + dtlvl + ";if (!(" + obj.if+")) {";
        then = obj.else;
        els = obj.then;
    }
    data.index++;
    data.byteLen[data.index] = 0;
    data.get.push("if (ifs[ifid++] == 1) {");
    data.set.push(condition);
    data.count.push(condition);
    data.count.push("ifs.push(1)");
    parse(then, name, type);
    if (data.byteLen[data.index]) data.count.push("byteLen += " + data.byteLen[data.index] + ";");
    data.byteLen[data.index] = 0;
    data.get.push("} else {");
    data.set.push("} else {");
    data.count.push("} else {");
    data.count.push("ifs.push(0)");
    parse(els, name, type);
    if (data.byteLen[data.index]) data.count.push("byteLen += " + data.byteLen[data.index] + ";");
    data.byteLen[data.index] = 0;
    data.get.push("}");
    data.set.push("}");
    data.count.push("}");

    data.index--;

}