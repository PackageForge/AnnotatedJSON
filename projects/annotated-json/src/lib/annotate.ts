import { IAnnotation, PATH_DELIMETER } from "./annotation";

export function annotate(...args: (string | number | any)[]) {
  const annotation: IAnnotation = {};
  let index = 0;
  const root = args[index++];
  if (root)
    annotation[""] = root;
  while (index < args.length) {
    const prop = Array.isArray(args[index]) ? args[index++].join(PATH_DELIMETER) : args[index++];
    if (typeof (args[index]) === "string")
      annotation[prop] = args[index++];
    if (index < args.length && (typeof (args[index]) === "undefined" || typeof (args[index]) === "object")) {
      const subAnn = args[index++];
      if (subAnn) {
        const subPath = prop + PATH_DELIMETER;
        if (Array.isArray(subAnn))
          if (subAnn.length > 0 && (typeof (subAnn[0]) === "string" || typeof (subAnn[0]) === "number"))
            index--;
          else
            for (let i = 0; i < subAnn.length; i++) {
              const itemAnn = subAnn[i];
              const itemPath = subPath + i;
              Object.getOwnPropertyNames(itemAnn).forEach(p => {
                if (p === "")
                  annotation[itemPath] = itemAnn[p];
                else
                  annotation[itemPath + PATH_DELIMETER + p] = itemAnn[p];
              });
            }
        else
          Object.getOwnPropertyNames(subAnn).forEach(p => {
            annotation[subPath + p] = subAnn[p];
          });
      }
    }
  }
  return filledAnnotation(annotation);
}

function filledAnnotation(annotation: IAnnotation) {
  const filled: IAnnotation = {};
  const added:string[]=[];
  const props=Object.getOwnPropertyNames(annotation);
  props.forEach(function (prop) {
    const parts = prop.split(PATH_DELIMETER);
    parts.pop();
    for (let i = 1; i <= parts.length; i++) {
      const subProp = parts.slice(0, i).join(PATH_DELIMETER);
      if (!props.includes(subProp) && !added.includes(subProp)) {
        added.push(subProp);
        filled[subProp] = "";
      }
    }
    filled[prop] = annotation[prop];
  });
  return filled;
}