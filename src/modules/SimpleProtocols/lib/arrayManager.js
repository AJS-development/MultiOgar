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
module.exports = function (obj, data, parse, lvl) {
    data.get.push("var len" + lvl + " = reader.readUInt16BE();");
    data.get.push("var data" + lvl + " = [];")
    data.get.push("for (var i" + lvl + " = 0; i" + lvl + " < len" + lvl + "; i" + lvl + " ++) {")
    data.get.push4("}")

    var lvl2 = lvl + 1;
    data.set.push("var len" + lvl + " = data" + lvl + ".length")
    data.set.push("writer.writeUInt16BE(len" + lvl + ")")
    data.set.push("for (var i" + lvl + " = 0; i" + lvl + " < len" + lvl + "; i" + lvl + " ++) {")
    data.set.push("var data" + lvl2 + " = data" + lvl + "[i" + lvl + "];")
    data.set.push4("}")

    var now = data.count.index + 1;
    data.count.push("byteLen += 2")
    data.count.push("for (var i" + lvl + " = 0; i" + lvl + " < data" + lvl + ".length; i" + lvl + " ++) {")
    data.count.push("var data" + lvl2 + " = data" + lvl + "[i" + lvl + "];")
    data.count.push4("}")

    var r = parse(obj[0], false, 2);
    if (r) {

        data.count.data.splice(now, data.count.index - now)
        data.count.index = now;
        data.count.append.splice(0, 1);
        //  console.log(data)
    }


    return r;
}
