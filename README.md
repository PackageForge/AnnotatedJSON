# @packageforge/annotated-json

Create JSON output with comments describing the data. Yes, I know that means it's no longer JSON. I don't care. It's readable.

Add the package to your project on the command line:
```
npm install @packageforge/annotated-json --save
```

Say you have a object that you wish to convert to JSON, but with annotated comments on the properties and values:
```typescript
// An object with obtuse property names and values.
const myObject:IMyObject = {
  a : 2,
  c : 0,
  T : true,
  z : 0,
  r : [1,4],
  t : 1610761551415,
  d : {
    s: "value",
    n: 2,
    b: true
  },
  pl : {
    r: 23,
    b: 2,
    s: 2
  },
  q:[
    {
      s:121,
      q:0
    },
    {
      s:7413,
      q:12
    },
    {
      s:333,
      q:1
    }
  ]
};
```

First, import the `annotate`, `annotatedJson`, and `parseJson` functions into your code file:
```typescript
import { annotate, annotatedJson, parseJson } from '@packageforge/annotated-json';
```

Next, create a function that understands the object to annotate it:
```typescript
function annotateIMyObject(value?:IMyObject){
  // Return undefined if value is undefined, else annotate it.
  return value && annotate("Type IMyObject",// The is the annotation for the outer object. Always include this argument, even if as an empty string.
  // Then add the properties, in order you want them to appear in the JSON output, with their annotation.
  // Property,  Annotation
      "a",        "Age: "+value.a,
      "c",        "City: "+cities[value.c].name,
      "T",        value.T ? "MY TURN" : "NOT MY TURN",
      "r",        "Rolls: "+value.r.join(','),
      "t",        "Time: "+(new Date(value.t)).toLocaleString(),
      "d",        "Some data",
  // To quickly annotate the sub-properties in d use an array to specify the property names:
      ["d","s"],  "It's a string! "+value.d.s,
      ["d","n"],  "It's a number! "+value.d.n,
      ["d","b"],  "It's a boolean! "+value.d.b,
  // To annotate more complex objects, pass the result from another annotation function:
      "pl",       "Primary Location",      annotateILocation(value.pl),
  // To annotate an array, pass an array of annotations :
      "q",        value.q.map((sq:IStoreQuantity)=> annotateIStoreQuantity(sq)),
  // OPTIONAL PROPERTIES:
  // To annotate an optional simple property, use annotate as if it is there :
      "k",        "Kind: "+value.k,  // Note that since k does not exist, this annotation will not appear, so it does not matter that the string is incorrect.
  // To annotate missing complex objects, make sure the annotation function accepts undefined. The result is immaterial since it will not be displayed.
      "al",       "Alternate Location", annotateILocation(value.al), //Note the three arguments here, the second anotating the property, the third its value.
  // To annotate missing arrays, use the ? notation to return undefined when the property does not exist.
      "aq",       "Alternate Quantities", value.aq?.map((sq:IStoreQuantity)=> annotateIStoreQuantity(sq))
  );
}

function annotateILocation(value?:ILocation){
  // Return undefined if value is undefined, else annotate it.
  return value && annotate("",  // Always a value, even if empty!
    "r","Row: "+value.r,
    "b","Bay: "+value.b,
    "s","Shelf: "+value.s
  );
}
function annotateIStoreQuantity(entry?:IStoreQuantity){
  // Return undefined if entry is undefined, else annotate it.
  return entry && annotate( getStoreDescription(entry.s),  // Always a value, even if empty!
    "q","Quantity in stock: "+entry.q,
    "s","Store #: "+entry.s
  );
}
```

To create annotated JSON, first call the annotate function you created with the object:
```typescript
const annotation=annotateMyObject(myObject);
```

Then call the `annotatedJson` function, passing the object, the annotation, and the indention size:
```typescript
const output=annotatedJson(myObject,annotation,2);
```

Now output is a string that looks like so:
```typescript
{ // Type IMyObject
  "a": 2,             // Age: 2
  "c": 0,             // City: London
  "T": true,          // MY TURN
  "r": [              // Rolls: 1,4
    1,
    4
  ],
  "t": 1610761551415, // Time: 1/15/2021, 7:45:51 PM
  "d": {              // Some data
    "s": "value", // It's a string! value
    "n": 2,       // It's a number! 2
    "b": true     // It's a boolean! true
  },
  "pl": {             // Primary Location
    "r": 23, // Row: 23
    "b": 2,  // Bay: 2
    "s": 2   // Shelf: 2
  },
  "q": [
    {  // 249 Ellis St., Electra TX 75602 737-555-9860
      "q": 12,  // Quantity in stock: 12
      "s": 7413 // Store #: 7413
    },
    {  // 81 Wood St., Rome TX 75895 786-555-6785
      "q": 1,  // Quantity in stock: 1
      "s": 333 // Store #: 333
    },
    {  // 344 Greenwood St., Paris TX 75761 788-555-3451
      "q": 0,  // Quantity in stock: 0
      "s": 121 // Store #: 121
    }
  ],
  "z": 0
}
```

The annotated JSON can be parsed back to an object using the `parseJson` method:
```typescript
const copyOfMyObject=parseJson(output);
```

The `parseJson` function uses code poached from https://github.com/json5/json5 and we are greatfull for their work. 
Hopefully they will allow regular expressions and dates.