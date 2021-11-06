export function NgtxApi() {
  return (target: any) => {
    renameStaticMethods(target);
    renameInstanceMethods(target);

    return target;
  };
}

// -----------------------------
//  Module Internals
// -----------------------------

const classProperties = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
];
const ignoreInstanceProperties = [
  'caller',
  'callee',
  'arguments',
  ...classProperties,
];
const ignoreStaticProperties = ['name', 'prototype', 'length'];

function renameStaticMethods(target: any): void {
  const methods = Object.getOwnPropertyNames(target).filter(
    (property) => !ignoreStaticProperties.includes(property),
  );

  autoName(methods, target);
}

function renameInstanceMethods(target: any): void {
  const proto = target.prototype;
  const methods = getPublicInstanceMethodNames(proto);
  autoName(methods, proto);
}

function autoName(methods: string[], target: any) {
  methods.forEach((fnName) => {
    const fn = (target as any)[fnName];
    const newName = fn.name;
    fn.toString = () => newName;
  });
}

function getPublicInstanceMethodNames(classType: any) {
  const props = [];
  let obj = classType;
  do {
    props.push(...Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)));

  return props
    .sort()
    .filter((property) => !ignoreInstanceProperties.includes(property))
    .filter((property) => !property.startsWith('_'))
    .filter(withoutGettersAndSetters(classType))
    .filter((property, i, arr) => {
      if (property != arr[i + 1] && typeof classType[property] == 'function')
        return true;
    });
}

/** Removes getter- and setter-properties from the given class type */
const withoutGettersAndSetters = (classType: any) => {
  return (property: string) => {
    const descriptor = getPropertyDescriptor(classType, property);
    // do not manipulate any getters or setters
    return descriptor?.get == null && descriptor?.set == null;
  };
};

function getPropertyDescriptor(
  classType: any,
  property: string,
): PropertyDescriptor | null {
  let descriptor: PropertyDescriptor | null = null;
  let obj = classType;
  do {
    descriptor = Object.getOwnPropertyDescriptor(obj, property);
  } while (descriptor == null && (obj = Object.getPrototypeOf(obj)));

  return descriptor;
}
