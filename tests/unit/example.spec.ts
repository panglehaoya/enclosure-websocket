function add(a: number, b: number) {
  return a + b;
}

describe("add", () => {
  it("add func", () => {
    expect(add(1, 2)).toEqual(3);
  });
});
