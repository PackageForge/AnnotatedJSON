import { Component } from '@angular/core';
import { annotate, annotatedJson, parseJson } from 'projects/annotated-json/src/public-api';

const cities=[{name:"London"},{name:"Paris"},{name:"Rome"},{name:"Electra"}];
const streets=["Main","Happy","Wood","Ellis","Greenwood"];
type IMyObject = any;
type ILocation = any;
type IStoreQuantity = any;
function getStoreDescription(storeNumber:number){
  return randomInteger(1000,1)+" "+randomArray(streets)+" St., "+randomArray(cities).name+" TX "+randomInteger(76000,75000)+" "+randomInteger(800,700)+"-555-"+randomInteger(10000,1000);
}
function randomInteger(maxExclusive:number,minInclusive:number=0){
  return Math.floor(Math.random()*(maxExclusive-minInclusive)+minInclusive);
}
function randomArray<T>(values:T[]){
  return values.splice(randomInteger(values.length),1)[0];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '@packageforge/annotated-json';
  value:IMyObject = {
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
  }
  result=annotatedJson(this.value,annotateIMyObject(this.value),2);
  parsed=parseJson(this.result);

}


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
