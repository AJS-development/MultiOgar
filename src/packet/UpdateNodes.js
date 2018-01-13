// Import
var BinaryWriter = require("./BinaryWriter");
var Logger = require('../modules/Logger');


function UpdateNodes(playerTracker, addNodes, updNodes, eatNodes, delNodes) {
    this.playerTracker = playerTracker;
    this.addNodes = addNodes;
    this.updNodes = updNodes;
    this.eatNodes = eatNodes;
    this.delNodes = delNodes;
}

module.exports = UpdateNodes;

UpdateNodes.prototype.build = function (protocol) {
    var obj = {
        eat: [],
        update: [],
        remove: []
    };

    for (var i = 0; i < this.eatNodes.length; i++) {
        var node = this.eatNodes[i];
        var hunterId = 0;
        if (node.getKiller()) {
            hunterId = node.getKiller().nodeId;
        }
        obj.eat.push({
            killer: hunterId,
            killed: node.nodeId
        })
    }
    for (var i = 0; i < this.updNodes.length; i++) {
        var node = this.updNodes[i];
        if (node.nodeId == 0)
            continue;
        var cellX = node.position.x;
        var cellY = node.position.y;
        var color = node.getColor();
        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01; // isVirus
        if (node.isAgitated)
            flags |= 0x10; // isAgitated
        if (node.cellType == 3)
            flags |= 0x20; // isEjected

        obj.update.push({
            id: node.nodeId,
            posX: Math.floor(cellX),
            posY: Math.floor(cellY),
            size: Math.floor(node.getSize()),
            r: color.r,
            g: color.g,
            b: color.b,
            flags: flags,
            name: '',
            skin: ''
        })
    }
    for (var i = 0; i < this.addNodes.length; i++) {
        var node = this.addNodes[i];
        if (node.nodeId == 0)
            continue;
        var cellX = node.position.x;
        var cellY = node.position.y;
        var cellName = null;
        if (node.owner) {
            cellName = node.owner.getNameUnicode();
        }
        var color = node.getColor();

        var flags = 0;
        if (node.isSpiked)
            flags |= 0x01; // isVirus
        if (node.isAgitated)
            flags |= 0x10; // isAgitated
        if (node.cellType == 3)
            flags |= 0x20; // isEjected

        obj.update.push({
            id: node.nodeId,
            posX: Math.floor(cellX),
            posY: Math.floor(cellY),
            size: Math.floor(node.getSize()),
            r: color.r,
            g: color.g,
            b: color.b,
            flags: flags,
            name: cellName || '',
            skin: ''
        })

    }

    for (var i = 0; i < this.eatNodes.length; i++) {
        var node = this.eatNodes[i];
        obj.remove.push(node.nodeId); // Cell ID
    }
    for (var i = 0; i < this.delNodes.length; i++) {
        var node = this.delNodes[i];
        obj.remove.push(node.nodeId); // Cell ID    }
    }
    return this.playerTracker.protocol.update(obj);
};
