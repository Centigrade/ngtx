describe('ConfigExports', () => {
  it('should include setGlobalSpyFactory', async () => {
    const { setDefaultSpyFactory } = await import('../index');
    expect(setDefaultSpyFactory).toBeInstanceOf(Function);
  });
});
