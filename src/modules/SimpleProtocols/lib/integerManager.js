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

    var split = obj.split(" ");
    var get, set, count;
    var off = "",
        off2 = ""
    var dtobj = {
        dynamic: function () {
            get = 'reader.readDynamic()'
            set = 'writer.writeDynamic('
            count = 'byteLen += getDynamicSize(';
        },
        uint8: function () {
            get = 'reader.readUInt8()'
            set = 'writer.writeUInt8('
            data.byteLen[data.index] += 1;
        },
        int8: function () {
            get = 'reader.readInt8()'
            set = 'writer.writeInt8('
            data.byteLen[data.index] += 1;
        },
        uint16: function () {
            get = 'reader.readUInt16BE()'
            set = 'writer.writeUInt16BE('
            data.byteLen[data.index] += 2;
        },
        int16: function () {
            get = 'reader.readInt16BE()'
            set = 'writer.writeInt16BE('
            data.byteLen[data.index] += 4;
        },
        uint32: function () {
            get = 'reader.readUInt32BE()'
            set = 'writer.writeUInt32BE('
            data.byteLen[data.index] += 4;
        },
        int32: function () {
            get = 'reader.readInt32BE()'
            set = 'writer.writeInt32BE('
            data.byteLen[data.index] += 4;
        }
    }
    if (dtobj[split[1]]) {
        dtobj[split[1]]();
    } else {
        var min = parseInt(split[1])
        var max = parseInt(split[2])
        var diff = max - min;


        var mindiff;

        if (diff > 4294967295) {
            get = 'reader.readDynamic()'
            set = 'writer.writeDynamic('
            count = 'byteLen += getDynamicSize(';
            mindiff = 128;
        } else
        if (diff > 65536) { // 32
            get = "reader.readUInt32BE()";
            set = "writer.writeUInt32BE(";
            data.byteLen[data.index] += 4;
            mindiff = 4294967295 - diff;
        } else if (diff > 255) { // 16
            get = "reader.readUInt16BE()";
            set = "writer.writeUInt16BE(";
            data.byteLen[data.index] += 2;
            mindiff = 65536 - diff;
        } else { // 8
            get = "reader.readUInt8()";
            set = "writer.writeUInt8(";
            data.byteLen[data.index]++;
            mindiff = 255 - diff;
        }


        var omin = min;
        if (opt.scrambleNumbers) {
            var offset = Math.floor(Math.random() * mindiff);
            min += offset;
        }

        if (min) {
            min = Math.abs(min)
            if (omin <= 0) {
                off = "-" + min;
                off2 = "+" + min;
            } else {

                off = "+" + min;
                off2 = "-" + min;
            }
        }
        get += off
    }

    var code, code2

    var lvl2 = lvl + 1
    switch (type) {
        case 0: // no object
            code = "data" + lvl2 + "=" + get + ";";
            code2 = set + "data" + lvl2 + off2 + ")";
            if (count) data.count.push(count + "data" + lvl2 + off2 + ")");
            break;
        case 1: // object
            code = "data" + lvl + "." + name + "=" + get + ";";
            code2 = set + "data" + lvl + "." + name + off2 + ");";
            if (count) data.count.push(count + "data" + lvl + "." + name + off2 + ");");

            break;
        case 2: // array
            code = "data" + lvl + ".push(" + get + ");"
            code2 = set + "data" + lvl2 + off2 + ");";
            if (count) data.count.push(count + "data" + lvl2 + off2 + ");");
            break;
    }
    data.get.push(code);
    data.set.push(code2);
    return !count;
}
