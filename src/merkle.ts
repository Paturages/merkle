import sha256 from "./sha256";

interface MerkleTree {
  // Hash of tree root
  root: () => string;
  // Height of the tree
  height: () => number;
  // List of hashes of specified level
  level: (index: number) => string[];
}

const makeTree = (levels: string[][]): MerkleTree => ({
  root: () => levels[0][0],
  height: () => levels.length,
  level: (index: number) => levels[index - 1] || []
});

const getLevels = (input = []): string[][] => {
  if (!input || !input.length) return null;
  if (input.length == 1) return [[sha256(input[0])]];
  // Math.ceil is to skew the tree to the left (i.e. more elements for 1st half)
  const halfLength = Math.ceil(input.length / 2);
  const half1 = input.slice(0, halfLength);
  const half2 = input.slice(halfLength);
  const levels1 = getLevels(half1);
  const levels2 = getLevels(half2);
  // Compute the root and merge the levels from the halves
  const levels = [[sha256(levels1[0][0] + levels2[0][0])]];
  for (let i = 0; i < levels1.length; i++) {
    levels.push([
      ...(levels1[i] || []),
      ...(levels2[i] || [])
    ]);
  }
  return levels;
};

const merkle = (input = []): MerkleTree => {
  if (!input || !input.length) return null;
  const levels = getLevels(input);
  return makeTree(levels);
};

export default merkle;