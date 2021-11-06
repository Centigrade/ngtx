import { ComponentHarness } from '../../entities/harness';

describe('ComponentHarness', () => {
  it('should auto-rename methods', () => {
    // arrange, act
    @ComponentHarness()
    class Get {
      static Test() {}
    }
    // assert
    expect(Get.Test.toString()).toEqual('Test');
  });
});
