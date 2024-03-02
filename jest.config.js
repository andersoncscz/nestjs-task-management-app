module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/src/migrations/',
    //------- Removed coverage from unit testing -------
    '\\.entity\\.ts$',
    '\\.decorator\\.ts$',
    '\\.interceptor\\.ts$',
    //--------------------------------------------------
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
