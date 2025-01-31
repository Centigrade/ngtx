import { NgtxScenarioTestHarness } from './scenario-testing';

export class ElementHarness extends NgtxScenarioTestHarness<HTMLElement, any> {
  toBeFound() {
    return this.provideTests(() => {
      it(`${this.name} should be found`, () => {
        expect(this.debugElement).toBeTruthy();
      });
    });
  }
  toBeMissing() {
    return this.provideTests(() => {
      it(`${this.name} should be missing`, () => {
        expect(this.debugElement).toBeFalsy();
      });
    });
  }
  toHaveText(text: string, options?: { ignoreCase?: boolean; trim?: boolean }) {
    const ignoreCase = options?.ignoreCase ?? false;
    const trim = options?.trim ?? false;

    let description = `${this.name} should have text "${text}"`;
    if (ignoreCase && trim) {
      description += ' (ignoring case and trimmed)';
    } else if (ignoreCase) {
      description += ' (ignoring case)';
    } else if (trim) {
      description += ' (trimmed)';
    }

    return this.provideTests(() => {
      it(description, () => {
        let textContent = this.debugElement.nativeElement.textContent ?? '';

        if (ignoreCase) {
          textContent = textContent.toLowerCase();
          text = text.toLowerCase();
        }
        if (trim) {
          textContent = textContent.trim();
        }

        expect(textContent).toBe(text);
      });
    });
  }
  toContainText(text: string) {
    return this.provideTests(() => {
      it(`${this.name} should contain text "${text}"`, async () => {
        expect(this.debugElement.nativeElement.textContent).toContain(text);
      });
    });
  }
  toHaveClass(...classNames: string[]) {
    return this.provideTests(() => {
      it(`${this.name} should have classes "${classNames.join(
        ', ',
      )}"`, async () => {
        classNames.forEach((className) => {
          expect(
            this.debugElement.nativeElement.classList.contains(className),
          ).toBe(true);
        });
      });
    });
  }
  toHaveStyles(styles: Partial<CSSStyleDeclaration>) {
    return this.provideTests(() => {
      Object.entries(styles).forEach(([key, value]) => {
        it(`${this.name} should have style "${key}: ${value}"`, async () => {
          const styles = this.debugElement.nativeElement.style;

          expect((styles as any)[key]).toBe(value);
        });
      });
    });
  }
}
