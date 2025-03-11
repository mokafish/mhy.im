/** @type {import('ts-jest').JestConfigWithTsJest} **/
// export default {
//   testEnvironment: "node",
//   transform: {
//     "^.+\.tsx?$": ["ts-jest/presets/default-esm",{}],
//   },
// };

export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\.tsx?$": ["ts-jest", {}],
  },
};
