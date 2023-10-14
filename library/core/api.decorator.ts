/**
 * ## What is a Target Collection Class?
 *
 * Target collection classes have static members that refer to HTML-elements / components (**"targets"**) of the component-under-test's template.
 * These targets are typically bound to the component's state and/or trigger an event handler on the component-under-test. So they are the main
 * candidates for being tested. Here is an example of a HTML-element that is very likely to be tested, so it should be referenced as a target:
 *
 * > ~~~html
 * > <!-- HTML template of a textbox.component -->
 * > <input type="text" [value]="text" (change)="text = $event.target.value" />
 * > <app-icon-button icon="cross" (click)="clearText()"></app-icon-button>
 * > ~~~
 * >
 * > ---
 * >
 * > Then, in the tests file of the textbox.component:
 * > ~~~ts
 * > ＠TargetCollection()
 * > class the {
 * >   static NativeInput() {
 * >     return get<HTMLInputElement>('input[type=text]');
 * >   }
 * >   static ClearButton() {
 * >     return get(IconButtonComponent);
 * >   }
 * > }
 * > ~~~
 *
 * The class is helping to make the tests DRY by centralizing the different targets in the template being relevant for tests.
 * In declarative tests the class is typically named "`the`" as this name is a good fit to the sentence-like structure of those tests.
 *
 * ### Why this Decorator?
 *
 * This decorator makes sure that you can print the class' members to the console, without printing the actual function body, but
 * keep the function name. This makes tests even more understandable, when it comes to the output on console.
 *
 * #### Example
 * Let's say we test a dialog component, that offers a OK and Cancel button.
 * We can parametrize the test, to reduce testing boilerplate and
 *
 * > ~~~ts
 * > ＠TargetCollection()
 * > class the {
 * >   static OkButton() {
 * >     return get('.btn.confirm')
 * >   }
 * >   static ClearButton() {
 * >     return get('.btn.cancel')
 * >   }
 * > }
 * >
 * > it.each(the.OkButton, the.CancelButton)
 * >    // note: here we are printing the functions
 * >    //       to the console by referencing them via %s
 * >   ('should close the dialog when clicking the %s', (theButton) => {
 * >      When(theButton).gets(clicked()).expect(host).to(haveEmitted('closeDialog'))
 * >   }
 * > );
 * > ~~~
 * > Note: this test contains a [jest](https://jestjs.io)-specific feature (`it.each()`).
 *
 * If we would run this test without the `@TargetCollection()` decorator applied to the `the` class,
 * the test's description would read something like:
 *
 * > `DialogView should close the dialog when clicking the static OkButton() { return get('...') }`
 *
 * This obviously is less than optimal. It's hard to read and understand. To fix it, we use the `@TargetCollection` decorator.
 * With this applied the test's description simply becomes:
 *
 * > `DialogView should close the dialog when clicking the OkButton`
 *
 * which is what we want. So whenever you happen to print some of the target-ref functions to the console, better
 * apply the `TargetCollection` decorator on that class, to have clean test-description that are easy to read.
 */
export function TargetCollection() {
  return (target: any) => {
    renameStaticMethods(target);
    renameInstanceMethods(target);

    return target;
  };
}

/**
 * Please use `@TargetCollection()` instead. Documentation can be seen there.
 * @deprecated Use `@TargetCollection()` instead.
 */
export const NgtxApi = TargetCollection;

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
  methods
    // filter out setters and getters
    .filter((fnName) => {
      const descriptor = getPropertyDescriptor(target, fnName);
      return descriptor?.get == null && descriptor?.set == null;
    })
    // filter out non-method properties
    .filter((fnName) => typeof target[fnName] === 'function')
    .forEach((fnName) => {
      const fn = target[fnName];
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
    descriptor = Object.getOwnPropertyDescriptor(obj, property)!;
  } while (descriptor == null && (obj = Object.getPrototypeOf(obj)));

  return descriptor;
}
