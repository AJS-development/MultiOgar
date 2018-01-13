# SimpleProtocols
Serialize your data in binary!

## Purpose
Generates code for binary serialisation. Like google's protocol buffers, but simpler, easier and more secure. This allows you to send data very quickly over networks or pipes.

## Usage
> node index.js

1. Edit the data.json file to specify data types. (You can also edit options.json)
2. Run `node index.js`
3. Generated code located at /out/

## Documentation

### Data types
1. `int [min] [max]` - Integer
2. `string [encoding]` - A string. Encodings include `8` (default), `16`, and `32`.

### Arrays
#### Fixed arrays
You can have a fixed array by doing:

```
[
"length [length]",
"your stuff"
]
```
#### Dynamic arrays
You can have dynamic arrays by doing
```
[
"Your stuff"
]
```

### Objects
You can have objects by doing
```
{
hello: "int 0 255",
this: "string",
is: "string 16",
aobject: "int 0 10000"
}
```

### Conditionals
You can also have conditional statements
```
{
if: "obj.type == 0",
then: "something",
else: "anotherthing" 
}
```

### Security Features
There are some security features. Note that none of these features impact preformance except for encodeStrings.

1. shuffleObjects - Shuffle order in objects. Default: true
2. scrambleConditionals - Scramble conditional statements. Default: true
3. scrambleNumbers - Scramble numbers. Default: true
4. encodeStrings - Encode strings using rc4 encryption. Default: false
5. pack - Pack output code using Dean Edward's packer (http://dean.edwards.name/packer/). Not a significant security feature. Default: false

## Note:
The json files in this project are not actually json. This is to simplify its syntax. `eval()` is used to evaluate the files.
