## [🏠][home] &nbsp; → &nbsp; **[Documentation][docs]** &nbsp; → &nbsp; Configuring ngtx

[home]: ../README.md
[docs]: ./overview.md
[index]: ./built-in.md
[usefixture]: ./helpers/use-fixture.md

### Passing a Spy Factory Function

Since ngtx supports jest and jasmine, it does not know how to create spies on its own.
Therefore you need to pass ngtx a spy-factory-function it can use.
There are two ways to do that:

1. **Preferred:** Configure ngtx globally, e.g. in the `test.ts` or `setup-jest.ts` file like that:

   ```ts
   import { setDefaultSpyFactory } from '@centigrade/ngtx';

   // for jasmine spies:
   setDefaultSpyFactory((returnValue) =>
     jasmine.createSpy().and.returnValue(returnValue),
   );
   // or for jest spies:
   setDefaultSpyFactory(
     (returnValue) => (returnValue) => jest.fn(() => returnValue),
   );
   ```

   This will configure ngtx to use this spy-factory-function in all test suites, whenever it is needed.

2. Configure it per test-suite. You can also override the used spy-factory function by passing it to the [useFixture]-helper:

   ```ts
   useFixture(fixture, { spyFactory: (retVal) => jest.fn(() => retVal) });
   ```

   This will only take effect for the current test suite (`describe` block) in which the `useFixture` is called.
