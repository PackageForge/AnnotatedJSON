import { IAnnotation, PATH_DELIMETER } from "./annotation";

export function annotatedJson(value: any, annotation: IAnnotation = {}, indention: number = 0) {
  const buffer: (number | string | undefined)[] = [];
  const nl = indention <= 0 ? "" : "\n";
  let lastDepth = 0;
  let maxLengths: number[] = [];
  walk(buffer, 0, "", value, false, annotation, "", indention);
  let json = buffer.map((part, index) => {
    if (index % 3 === 0 && typeof (part) === "number") {
      if (indention <= 0)
        return "";
      if (part > lastDepth)
        maxLengths[part] = getMaxLength(buffer, index);
      lastDepth = part;
      return "".padEnd((part as number) * indention, " ");
    }
    if (index % 3 === 2) {
      if (!part)
        return nl;
      if (indention <= 0)
        return "/*" + part + "*/" + nl;
      const valueLength = (buffer[index - 1] as string).length;
      return "".padEnd(maxLengths[lastDepth] - valueLength, " ") + " // " + part + nl;
    }
    return part;
  }).join("");
  return json;
}
function getMaxLength(buffer: (number | string | undefined)[], index: number) {
  let max = 0;
  const depth = buffer[index] as number;
  while (index < buffer.length && (buffer[index] as number) >= depth) {
    if ((buffer[index] as number) === depth)
      max = Math.max(max, (buffer[index + 1] as string).length);
    index += 3;
  }
  return max;
}

function walk(buffer: (number | string | undefined)[], depth: number, propName: string, value: any, delimit: boolean, annotation: IAnnotation, path: string, indention: number) {
  if (value && typeof (value) === "object") {
    const subPath = path ? path + PATH_DELIMETER : "";
    if (Array.isArray(value)) {
      buffer.push(depth++, propAssign(propName, indention) + "[", annotation[path]);
      for (let i = 0; i < value.length; i++)
        walk(buffer, depth, "", value[i], i < value.length - 1, annotation, subPath + i, indention);
      buffer.push(--depth, "]" + delimeter(delimit), undefined);
    } else {
      buffer.push(depth++, propAssign(propName, indention) + "{", annotation[path]);
      const props = getSortedPropertyNames(value, annotation, subPath)
      props.forEach((prop, index, props) => {
        walk(buffer, depth, prop, value[prop], index < props.length - 1, annotation, subPath + prop, indention);
      });
      buffer.push(--depth, "}" + delimeter(delimit), undefined);
    }
  } else
    buffer.push(depth, propAssign(propName, indention) + JSON.stringify(value) + delimeter(delimit), annotation[path]);
}
function getSortedPropertyNames(value: any, annotation: IAnnotation, path: string) {
  const desired = Object.getOwnPropertyNames(annotation);
  return Object.getOwnPropertyNames(value)
    .sort(function (a, b) {
      const ai = desired.indexOf(path + a);
      if (ai < 0)
        return 1;
      const bi = desired.indexOf(path + b);
      if (bi < 0)
        return -1;
      return ai - bi;
    });
}

function delimeter(delimit: boolean) {
  return delimit ? "," : "";
}
const startsWithNumber = /[0-9]/;
const hasNonNormal = /[^\w$]/;
function propAssign(propName: string, indention: number) {
  if (!propName)
    return "";
  if (indention >= 0 || propName.search(startsWithNumber) === 0 || propName.search(hasNonNormal) >= 0)
    propName = JSON.stringify(propName);
  propName += ":";
  if (indention > 0)
    propName += " ";
  return propName;
}