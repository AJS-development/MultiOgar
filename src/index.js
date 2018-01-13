 Map.prototype.every = function (c) {
     var a = this.entries()
     var b;
     while (b = a.next().value) {
         if (!c(b[1], b[0])) return false;
     }

     return true;
 }
 Map.prototype.toArray = function () {
     var array = [];
     this.forEach(function (a) {
         array.push(a)
     })
     return array
 }

 Map.prototype.map = function (c) {
     var f = new Map();
     var a = this.entries()
     var b;
     while (b = a.next().value) {
         f.set(b[0], c(b[1], b[0]))
     }
     return f;

 }
 Map.prototype.filter = function (c) {
     var f = new Map();
     var a = this.entries()
     var b;
     while (b = a.next().value) {
         if (c(b[1], b[0])) f.set(b[0], b[1])
     }
     return f;

 }
 Map.prototype.peek = function () {
     var a = this.entries();
     var b = a.next().value;
     return (b) ? b[1] : false;
 }


 // Imports
 var pjson = require('../package.json');
 var Logger = require('./modules/Logger');
 var Commands = require('./modules/CommandList');
 var GameServer = require('./GameServer');

 // Init variables
 var showConsole = true;

 // Start msg
 Logger.start();

 process.on('exit', function (code) {
     Logger.debug("process.exit(" + code + ")");
     Logger.shutdown();
 });

 process.on('uncaughtException', function (err) {
     Logger.fatal(err.stack);
     process.exit(1);
 });

 Logger.info("\u001B[1m\u001B[32mMultiOgar " + pjson.version + "\u001B[37m - An open source multi-protocol ogar server\u001B[0m");


 // Handle arguments
 process.argv.forEach(function (val) {
     if (val == "--noconsole") {
         showConsole = false;
     } else if (val == "--help") {
         console.log("Proper Usage: node index.js");
         console.log("    --noconsole         Disables the console");
         console.log("    --help              Help menu.");
         console.log("");
     }
 });

 // Run Ogar
 var p = require('./generateProtocols.js');
 p(50, function (protocols) {
     var gameServer = new GameServer(protocols);


     gameServer.start();
     // Add command handler
     gameServer.commands = Commands.list;
     // Initialize the server console
     if (showConsole) {
         var readline = require('readline');
         var in_ = readline.createInterface({
             input: process.stdin,
             output: process.stdout
         });
         setTimeout(prompt, 100);
     }

     // Console functions

     function prompt() {
         in_.question(">", function (str) {
             try {
                 parseCommands(str);
             } catch (err) {
                 Logger.error(err.stack);
             } finally {
                 setTimeout(prompt, 0);
             }
         });
     }

     function parseCommands(str) {
         // Log the string
         Logger.write(">" + str);

         // Don't process ENTER
         if (str === '')
             return;

         // Splits the string
         var split = str.split(" ");

         // Process the first string value
         var first = split[0].toLowerCase();

         // Get command function
         var execute = gameServer.commands[first];
         if (typeof execute != 'undefined') {
             execute(gameServer, split);
         } else {
             Logger.warn("Invalid Command!");
         }
     }
 })
