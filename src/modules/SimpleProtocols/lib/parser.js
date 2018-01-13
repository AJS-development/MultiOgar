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
var DataService = require("./DataService.js")
var StringParse = {
    string: require('./stringManager.js'),
    int: require('./integerManager.js')
}
var ObjectParse = {
    array: require('./arrayManager.js'),
    fixedArray: require('./fixedArrayManager.js'),
    object: require('./objectManager.js'),
    conditional: require('./conditionManager.js')
}
var FastBuffers = {
    NodeJS: require('../assets/fastBuffersNodejs.js'),
    Browser: require('../assets/fastBuffersBrowser.js')
}
var JSBeautify = require('../assets/jsbeautify.js');
var JSPack = require('../assets/packer');
var get_code = "\
function getIfs(reader) {\n\
    var final = [];\n\
    while (true) {\n\
        var num = reader.readUInt8();\n\
        if (num == 0) break;\n\
       var length = 7\n\
   while(length--)\n\
   final.push((num >> length ) & 1);\n\
}\n\
return final;\n\
        }\n";

var set_code = "\
function setIfs(writer,array) {\n\
    var i,j,temparray,chunk = 7;\n\
for (i=0,j=array.length; i<j; i+=chunk) {\n\
    temparray = array.slice(i,i+chunk);\n\
while (temparray.length < 7) temparray.push(0)\n\
    writer.writeUInt8(parseInt(\"1\" + temparray.join(\"\"),2));\n\
}\n\
    writer.writeUInt8(0);\n\
}\n";

var rc4 = "function rc4(key, str) {\n\
	var s = [], j = 0, x, res = '';\n\
	for (var i = 0; i < 256; i++) {\n\
		s[i] = i;\n\
	}\n\
	for (i = 0; i < 256; i++) {\n\
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;\n\
		x = s[i];\n\
		s[i] = s[j];\n\
		s[j] = x;\n\
	}\n\
	i = 0;\n\
	j = 0;\n\
	for (var y = 0; y < str.length; y++) {\n\
		i = (i + 1) % 256;\n\
		j = (j + s[i]) % 256;\n\
		x = s[i];\n\
		s[i] = s[j];\n\
		s[j] = x;\n\
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);\n\
	}\n\
	return res;\n\
}"

function sprintf(string) {
    var args = arguments;

    var str = [];
    for (var i = 0; i < args.length; ++i) str.push(i.toString())

    var pattern = new RegExp("%([" + str.join("|") + "])", "g");
    return (string + "").replace(pattern, function (match, index) {
        return args[index];
    });
}
module.exports = function (object, options) {

    var data = {
        get: new DataService(),
        set: new DataService(),
        count: new DataService(),
        byteLen: [],
        index: 0,
        byteSize: [],
        canMultiply: [],
        if: false
    };

    data.byteLen[0] = 0;
    data.byteSize[0] = [];

    data.get.push("%1");
    data.count.push("%1");
    if (options.encodeStrings) {
        data.get.push(rc4);
        data.count.push(rc4);
    }
    //data.get.push("var reader = new Reader(buf);");

    data.count.push("var byteLen = 0;")
    //  data.count.push("var ifs = [];")

    data.count.push("%2")

    data.get.push("var data1;");
    //  data.get.push("var ifid = 0;");
    //  data.get.push("var ifs = getIfs(reader);");
    data.get.push("%2")
    var lvl = 0;
    var dtlvl = 1;
    var parse = function (obj, name, type) {

        if (typeof obj == "string") {
            var split = obj.split(" ")
            var par = StringParse[split[0]];
            if (!par) throw "Invalid type. Use only int or string";

            var code = par(obj, data, name, type, lvl, options);
            return code;
        } else
        if (typeof obj == "object") {
            var ret = true
            if (obj.if && obj.then && obj.else) {
                ObjectParse.conditional(obj, data, parse, type, name, lvl, options, dtlvl);
                return false
            }
            if (type == 1) {
                data.set.push("var data" + (lvl + 1) + " = data" + lvl + "." + name + ";")
                data.count.push("var data" + (lvl + 1) + " = data" + lvl + "." + name + ";")
            }
            lvl++;

            if (Array.isArray(obj)) {

                dtlvl++;

                data.byteLen[++data.index] = 0;
                data.byteSize[data.index] = [];
                if (typeof obj[0] == "string" && obj[0].substr(0, 6) == "length") ret = ObjectParse.fixedArray(obj, data, parse, lvl, options);
                else ret = ObjectParse.array(obj, data, parse, lvl, options);
            } else {
                ret = ObjectParse.object(obj, data, parse, lvl, type, name, options);
            }
            lvl--;
            var lvl2 = lvl + 1;
            //   if (!skip) {






            //            }


            if (Array.isArray(obj)) {
                if (data.byteLen[data.index]) {
                    if (ret) {
                        if (typeof obj[0] == "string" && obj[0].substr(0, 6) == "length") {
                            data.count.push("byteLen += " + data.byteLen[data.index] + " * " + obj[0].split(" ")[1] + ";");
                        } else {
                            data.count.push("byteLen += " + data.byteLen[data.index] + " * data" + (lvl + 1) + ".length;");
                        }
                    } else {
                        data.count.push("byteLen += " + data.byteLen[data.index] + ";");
                    }
                    data.byteLen[data.index] = 0;
                }
                dtlvl--;
                data.index--;
                if (!ret)
                    data.count.end()
                data.get.end();
                data.set.end();

                ret = false;
            }
            if (type == 1) {
                data.get.push("data" + lvl + "." + name + "=data" + lvl2 + ";");
            } else
            if (type == 2) {
                data.get.push("data" + lvl + ".push(data" + lvl2 + ");");
            }
            return ret

        } else {

            throw "ERR: Please only use a string, array, or object";
        }
    }
    parse(object, false, 0);
    if (data.byteLen[0]) data.count.push("byteLen += " + data.byteLen[data.index] + ";");
    data.get.push2("return data1;")

    data.set.push2("return writer.toBuffer();")

    if (data.if) data.count.push("byteLen += Math.ceil(ifs.length / 7) + 1")
    data.count.push("var writer = new Writer(byteLen + 1);")
    data.count.push("writer.writeUInt8(2);")
    if (data.if) data.count.push("setIfs(writer,ifs);");

    if (data.if) {
        var getCode = sprintf(data.get.toString(), get_code, "var ifid = 0;var ifs = getIfs(reader);\n")
        var setCode = sprintf(data.count.toString(), set_code, "var ifs = [];\n") + "\n" + data.set.toString()
    } else {
        var getCode = sprintf(data.get.toString(), "", "")
        var setCode = sprintf(data.count.toString(), "", "") + "\n" + data.set.toString()
    }
    var get = "function " + options.getname + "(reader) {\n" + getCode + "}";
    var set = "function " + options.setname + "(data1) {\n" + FastBuffers.NodeJS("writer") + "\n" + setCode + "}";
    var getBrowser = "function " + options.getname + "(reader) {\n" + getCode + "}";
    var setBrowser = "function " + options.setname + "(data1) {" + FastBuffers.Browser("writer") + "\n" + setCode + "}";

    if (options.pack) {
        return {
            get: JSPack(get, true, true),
            set: JSPack(set, true, true),
            getb: JSPack(getBrowser, true, true),
            setb: JSPack(setBrowser, true, true)
        }

    } else {
        return {
            get: JSBeautify(get),
            set: JSBeautify(set),
            getb: JSBeautify(getBrowser),
            setb: JSBeautify(setBrowser)
        }
    }
}
