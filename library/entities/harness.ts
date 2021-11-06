export function ComponentHarness() {
  return (target: any) => {
    const methods = Object.getOwnPropertyNames(target).filter(
      (property) => !['name', 'prototype', 'length'].includes(property),
    );

    methods.forEach((fnName) => {
      const fn = (target as any)[fnName];
      const newName = fn.name;

      fn.toString = () => newName;
    });

    return target;
  };
}
