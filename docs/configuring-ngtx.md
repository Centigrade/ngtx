## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; Configuring ngtx

[home]: ../README.md
[docs]: ./overview.md
[index]: ./built-in.md
[usefixture]: ./helpers/use-fixture.md

### Passing a Testing Framework Adapter for Scenario Testing

In order to let ngtx generate your tests based on declaratively described scenarios, it needs some information about your testing setup:

```ts
// in your test setup file, e.g. the `test.ts` or `setup-jest.ts` file:
import { configureNgtx } from '@centigrade/ngtx';

// e.g. for jasmine or jest:
configureNgtx({
  testingFrameworkAdapter: {
    describe: describe, // pass the describe fn of your testing framework
    beforeEach: beforeEach, // pass the beforeEach fn of your testing framework
  },
});
```

✅ That's it! You're ready to use ngtx' scenario testing feature!

### Passing a Spy Factory Function

Since ngtx supports jest and jasmine, it does not know how to create spies on its own.
Therefore you need to pass ngtx a spy-factory-function it can use.
There are two ways to do that:

1. **Preferred:** Configure ngtx globally, e.g. in the `test.ts` or `setup-jest.ts` file like that:

   ```ts
   import { configureNgtx } from '@centigrade/ngtx';

   // for jasmine spies:
   configureNgtx({
     defaultSpyFactory: (returnValue) =>
       jasmine.createSpy().and.returnValue(returnValue),
   });
   // or for jest spies:
   configureNgtx({
     defaultSpyFactory: (returnValue) => jest.fn(() => returnValue),
   });
   ```

   This will configure ngtx to use this spy-factory-function in all test suites, whenever it is needed.

2. Configure it per test-suite. You can also override the used spy-factory function by passing it to the [useFixture]-helper:

   ```ts
   useFixture(fixture, { spyFactory: (retVal) => jest.fn(() => retVal) });
   ```

   This will only take effect for the current test suite (`describe` block) in which the `useFixture` is called.
