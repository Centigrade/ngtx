```ts
// haveCalled needs to register spy after "state" predicate
When(host)
  .has(state({ icon: 'home' }))
  .expect(the.Icon)
  .to(haveCalled(componentMethod, 'ngOnInit'));

// haveCalled needs to register spy before "call" predicate
When(host)
  .does(call(componentMethod, 'ngOnInit'))
  .expect(host)
  .to(haveCalled(componentMethod, 'ngOnInit'));

// haveCalled needs to register spy between "state" and "call" predicate!
When(host)
  .has(state({ icon: 'home' }), and(call(componentMethod, 'ngOnInit')))
  .expect(host)
  .to(haveCalled(componentMethod, 'ngOnInit'));
```
