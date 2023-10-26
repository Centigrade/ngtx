import { NgtxApi, TargetCollection } from '../core/api.decorator';

describe('TargetCollection', () => {
  it('should auto-rename static methods', () => {
    // arrange, act
    @TargetCollection()
    class Get {
      static Test() {}
    }
    // assert
    expect(Get.Test.toString()).toEqual('Test');
  });

  it('should auto-rename instance methods', () => {
    // arrange, act
    @TargetCollection()
    class Get {
      Test() {}
    }
    // assert
    const instance = new Get();
    expect(instance.Test.toString()).toEqual('Test');
  });

  it('should not activate static getters', () => {
    // arrange, act
    class Get {
      static test: any = undefined;
      static get Getter() {
        // won't throw if it does not get activated:
        return this.test.shouldNotGetExecuted;
      }
    }
    // assert
    expect(() => NgtxApi()(Get)).not.toThrow();
  });

  it('should not activate instance getters', () => {
    // arrange, act
    class Get {
      test: any = undefined;
      get Getter() {
        // won't throw if it does not get activated:
        return this.test.shouldNotGetExecuted;
      }
    }
    // assert
    expect(() => TargetCollection()(Get)).not.toThrow();
  });
});
