require("./base2/packer.js");

var packer = new Packer;
module.exports = function () {
    return packer.pack.apply(packer, arguments);
};