import { NgtxApi } from '../../entities/api';

describe('TestApi', () => {
  it('should auto-rename static methods', () => {
    // arrange, act
    @NgtxApi()
    class Get {
      static Test() {}
    }
    // assert
    expect(Get.Test.toString()).toEqual('Test');
  });

  it('should auto-rename instance methods', () => {
    // arrange, act
    @NgtxApi()
    class Get {
      Test() {}
    }
    // assert
    const instance = new Get();
    expect(instance.Test.toString()).toEqual('Test');
  });
});
