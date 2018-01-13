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
module.exports = function (obj, data, name, type, lvl, opt) {
    var obj = obj.split(" ");
    var get, set;

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    var func = "";
    var func2 = "";
    if (opt.encodeStrings) {
        var key = makeid();
        func = "rc4(\"" + key + "\","
        func2 = ")";
    }
    var len = 0;
    if (obj[1] == "16") {
        get = "reader.readString16()";
        set = "writer.writeString16("
        len = 2
    } else
    if (obj[1] == "32") {
        get = "reader.readString32()"
        set = "writer.writeString32("
        len = 4
    } else {

        get = "reader.readString8()";
        set = "writer.writeString8("
        len = 1

    }
    var code, code2, code3;
    var lvl2 = lvl + 1;
    switch (type) {
        case 0: // no object
            code = "data" + lvl2 + "=" + func + get + func2 + ";";
            code2 = set + func + "data" + lvl2 + func2 + ")"
            code3 = "byteLen += " + len + " + data" + lvl2 + ".length * " + len + ";";
            break;
        case 1: // object
            code = "data" + lvl + "." + name + "=" + func + get + func2 + ";";
            code2 = set + func + "data" + lvl + "." + name + func2 + ");";
            code3 = "byteLen += " + len + " + data" + lvl + "." + name + ".length * " + len + ";";

            break;
        case 2: // array
            code = "data" + lvl + ".push(" + func + get + func2 + ");"
            code2 = set + func + "data" + lvl2 + func2 + ");";
            code3 = "byteLen += " + len + " + data" + lvl2 + ".length * " + len + ";";
            break;
    }
    data.get.push(code);
    data.set.push(code2);
    data.count.push(code3);
    return false;
}
