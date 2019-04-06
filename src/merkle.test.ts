import merkle from "./merkle";
import sha256 from "./sha256";

describe("Merkle Tree, powers of 2", () => {
  it("should yield null for merkle([])", () => {
    expect(merkle([])).toBe(null);
  });

  it("should work for merkle([L1])", () => {
    const tree = merkle(["input"]);
    const hash = sha256("input");
    expect(tree.root()).toBe(hash);
    expect(tree.height()).toBe(1);
    expect(tree.level(1)).toEqual([hash]);
    expect(tree.level(2)).toEqual([]);
  });
  
  it("should work for merkle([L1, L2])", () => {
    const tree = merkle(["input1", "input2"]);
    const hash1 = sha256("input1");
    const hash2 = sha256("input2");
    const hashRoot = sha256(hash1 + hash2);
    expect(tree.root()).toBe(hashRoot);
    expect(tree.height()).toBe(2);
    expect(tree.level(1)).toEqual([hashRoot]);
    expect(tree.level(2)).toEqual([hash1, hash2]);
    expect(tree.level(3)).toEqual([]);
  });
  
  it("should work for merkle([L1, L2, L3, L4])", () => {
    const inputs = ["input1", "input2", "input3", "input4"];
    const tree = merkle(inputs);
    const hashes2 = inputs.map(sha256);
    const hashes1 = [sha256(hashes2[0] + hashes2[1]), sha256(hashes2[2] + hashes2[3])];
    const hashes0 = [sha256(hashes1[0] + hashes1[1])];
    expect(tree.root()).toBe(hashes0[0]);
    expect(tree.height()).toBe(3);
    expect(tree.level(1)).toEqual(hashes0);
    expect(tree.level(2)).toEqual(hashes1);
    expect(tree.level(3)).toEqual(hashes2);
    expect(tree.level(4)).toEqual([]);
  });
  
  it("should scale for 1024 inputs", () => {
    const INPUT_LENGTH = 1024;
    const inputs = new Array(INPUT_LENGTH).fill("input");
    const tree = merkle(inputs);

    // Height should be log2(n) + 1
    const height = Math.log2(INPUT_LENGTH) + 1;
    expect(tree.height()).toBe(height);

    // Should be a perfect, well-built tree
    for (let i = 1; i <= height; i++) {
      expect(tree.level(i).length).toBe(Math.pow(2, i - 1));
    }
    expect(tree.level(height + 1)).toEqual([]);

    // Leaves should match sha256("input")
    const hash = sha256("input");
    for (let leaf of tree.level(height)) {
      expect(leaf).toBe(hash);
    }
  });
  
  it("should scale for 2^15 inputs", () => {
    const INPUT_LENGTH = 32768;
    const inputs = new Array(INPUT_LENGTH).fill("input");
    const tree = merkle(inputs);

    // Height should be log2(n) + 1
    const height = Math.log2(INPUT_LENGTH) + 1;
    expect(tree.height()).toBe(height);

    // Should be a perfect, well-built tree
    for (let i = 1; i <= height; i++) {
      expect(tree.level(i).length).toBe(Math.pow(2, i - 1));
    }
    expect(tree.level(height + 1)).toEqual([]);

    // Leaves should match sha256("input")
    const hash = sha256("input");
    for (let leaf of tree.level(height)) {
      expect(leaf).toBe(hash);
    }
  });
});

describe("Merkle Tree, unbalanced", () => {
  it("should work for merkle([L1, L2, L3])", () => {
    const inputs = ["input1", "input2", "input3"];
    const tree = merkle(inputs);
    const getInputHash = (index: number) => ["", ...inputs.map(sha256)][index];
    // Let's suppose the tree is balanced to the left
    const hashes2 = [getInputHash(1), getInputHash(2)];
    const hashes1 = [sha256(hashes2[0] + hashes2[1]), getInputHash(3)];
    const hashes0 = [sha256(hashes1[0] + hashes1[1])];
    expect(tree.root()).toBe(hashes0[0]);
    expect(tree.height()).toBe(3);
    expect(tree.level(1)).toEqual(hashes0);
    expect(tree.level(2)).toEqual(hashes1);
    expect(tree.level(3)).toEqual(hashes2);
    expect(tree.level(4)).toEqual([]);
  });

  it("should scale for 1000 elements", () => {
    const INPUT_LENGTH = 1000;
    const inputs = new Array(INPUT_LENGTH).fill("input");
    const tree = merkle(inputs);

    // Height should be log2(n) + 1
    const height = Math.ceil(Math.log2(INPUT_LENGTH) + 1);
    expect(tree.height()).toBe(height);

    // Should be a balanced, well-built tree
    for (let i = 1; i <= height; i++) {
      expect(tree.level(i).length).toBeLessThanOrEqual(Math.pow(2, i - 1));
    }
    expect(tree.level(height + 1)).toEqual([]);

    // Last level leaves should match sha256("input")
    const hash = sha256("input");
    for (let leaf of tree.level(height)) {
      expect(leaf).toBe(hash);
    }
  });
  
  it("should scale for 100000 elements", () => {
    const INPUT_LENGTH = 100000;
    const inputs = new Array(INPUT_LENGTH).fill("input");
    const tree = merkle(inputs);

    // Height should be log2(n) + 1
    const height = Math.ceil(Math.log2(INPUT_LENGTH) + 1);
    expect(tree.height()).toBe(height);

    // Should be a balanced, well-built tree
    for (let i = 1; i <= height; i++) {
      expect(tree.level(i).length).toBeLessThanOrEqual(Math.pow(2, i - 1));
    }
    expect(tree.level(height + 1)).toEqual([]);

    // Last level leaves should match sha256("input")
    const hash = sha256("input");
    for (let leaf of tree.level(height)) {
      expect(leaf).toBe(hash);
    }
  });
});