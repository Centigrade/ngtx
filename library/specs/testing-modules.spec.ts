import {
  Component,
  Directive,
  inject,
  Injectable,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TestingModule } from '../core/testing-modules';
import { ngtx } from '../ngtx';
import { ngMocksPlugin } from './shared/util';

@Injectable()
class TestService {
  property = 'Hello, World!';
  method() {
    return 42;
  }
}

@Component({
  standalone: false,
  template: `<div id="moduleComponent"></div>`,
  selector: 'app-module-component',
})
class ModuleComponent {
  method() {
    return 42;
  }
}

@Component({
  template: `<div id="standaloneComponent"></div>`,
  selector: 'app-standalone-component',
  standalone: true,
})
class StandaloneComponent {
  method() {
    return 42;
  }
}

@Pipe({ name: 'modulePipe', standalone: false })
class ModulePipe implements PipeTransform {
  transform(value: any) {
    return 'modulePipe';
  }
}

@Pipe({ name: 'standalonePipe', standalone: true })
class StandalonePipe implements PipeTransform {
  transform(value: any) {
    return 'standalonePipe';
  }
}

@Directive({ selector: '[moduleDirective]', standalone: false })
class ModuleDirective {
  method() {
    return 42;
  }
}

@Directive({ selector: '[standaloneDirective]', standalone: true })
class StandaloneDirective {
  method() {
    return 42;
  }
}

@Component({
  standalone: false,
  template: `
    <app-module-component moduleDirective />
    <app-standalone-component standaloneDirective />
    <div id="modulePipe">{{ 'not applied' | modulePipe }}</div>
    <div id="standalonePipe">{{ 'not applied' | standalonePipe }}</div>
  `,
})
class ScenarioTestComponent {
  myService = inject(TestService);
  route = inject(ActivatedRoute);
  paramId = this.route.snapshot.params.id;
}

const moduleBound = [ModuleComponent, ModulePipe, ModuleDirective];
const standalone = [StandaloneComponent, StandalonePipe, StandaloneDirective];

describe(
  'with auto-mock plugin',
  ngtx(({ useFixture, get }) => {
    const MyTestingModule = TestingModule.configure(
      {
        imports: [RouterModule.forRoot([]), standalone],
        declarations: [ScenarioTestComponent, moduleBound],
        providers: [TestService],
      },
      [ngMocksPlugin],
    );

    beforeEach(async () => {
      await MyTestingModule.forComponent(
        ScenarioTestComponent,
      ).compileComponents();
      const fixture = TestBed.createComponent(ScenarioTestComponent);
      useFixture(fixture);
    });

    it('should not render the module component', () => {
      expect(get('#moduleComponent')).toBeFalsy();
    });

    it('should not render the standalone component', () => {
      expect(get('#standaloneComponent')).toBeFalsy();
    });

    it('should not render the module directive', () => {
      const directive = get(ModuleDirective).injector.get(ModuleDirective);

      // hint: when mocked, all methods get stubbed
      expect(directive.method()).toBe(undefined);
    });

    it('should not render the standalone directive', () => {
      const directive =
        get(StandaloneDirective).injector.get(StandaloneDirective);

      // hint: when mocked, all methods get stubbed
      expect(directive.method()).toBe(undefined);
    });

    it('should not render the module Pipe', () => {
      expect(get('#modulePipe').textContent()).toBe('');
    });

    it('should not render the standalone Pipe', () => {
      expect(get('#standalonePipe').textContent()).toBe('');
    });

    it('should use the mocked service', () => {
      const service = TestBed.inject(TestService);
      expect(service.property).toBe(undefined);
      expect(service.method()).toBe(undefined);
    });
  }),
);

describe(
  'No plugin',
  ngtx(({ useFixture, get }) => {
    const MyTestingModule = TestingModule.configure(
      {
        imports: [RouterModule.forRoot([]), standalone],
        declarations: [ScenarioTestComponent, moduleBound],
        providers: [TestService],
      },
      [],
    );

    beforeEach(async () => {
      await MyTestingModule.forComponent(
        ScenarioTestComponent,
      ).compileComponents();
      const fixture = TestBed.createComponent(ScenarioTestComponent);
      useFixture(fixture);
    });

    it('should render the module component', () => {
      expect(get('#moduleComponent')).toBeTruthy();
    });

    it('should render the standalone component', () => {
      expect(get('#standaloneComponent')).toBeTruthy();
    });

    it('should render the module directive', () => {
      const directive = get(ModuleDirective).injector.get(ModuleDirective);
      expect(directive.method()).toBe(42);
    });

    it('should render the standalone directive', () => {
      const directive =
        get(StandaloneDirective).injector.get(StandaloneDirective);

      expect(directive.method()).toBe(42);
    });

    it('should render the module Pipe', () => {
      expect(get('#modulePipe').textContent()).toContain('modulePipe');
    });

    it('should render the standalone Pipe', () => {
      expect(get('#standalonePipe').textContent()).toContain('standalonePipe');
    });

    it('should use the real service', () => {
      const service = TestBed.inject(TestService);
      expect(service.property).toBe('Hello, World!');
      expect(service.method()).toBe(42);
    });
  }),
);
