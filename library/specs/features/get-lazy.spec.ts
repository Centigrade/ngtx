// import { Component } from '@angular/core';
// import { NgtxElement } from '../../entities';
// import { ngtx } from '../../ngtx';
// import { Expect } from '../shared/expect';
// import { configureTestModule } from '../shared/util';

// @Component({
//   template: `
//     <table>
//       <tr data-ngtx="header">
//         <th data-ngtx="name-column">Name</th>
//         <th data-ngtx="age-column">Name</th>
//       </tr>
//     </table>
//   `,
// })
// class TestComponent {}

// describe(
//   'NgtxElement: getLazy',
//   ngtx(({ useFixture, getLazy }) => {
//     configureTestModule(TestComponent, useFixture);

//     class Get {
//       static Header$() {
//         return getLazy('ngtx_header').withApi(RowApi);
//       }
//     }

//     class RowApi extends NgtxElement {
//       Column(name: string) {
//         return this.get(`ngtx_${name}-column`);
//       }
//     }

//     it.each([Get.Header$().Column('name')])(
//       'should resolve to the wanted value',
//       (column) => {
//         // arrange, act
//         const instance = column.resolve();
//         // assert
//         Expect.element(instance).toBeHtmlElement(HTMLTableCellElement);
//       },
//     );
//   }),
// );
