/* eslint-disable */
export default {
    displayName: 'api',
    preset: '../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/prisma/singleton.ts'],
    setupFiles: ['dotenv/config'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                useESM: true,
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    // coverageDirectory: '../../coverage/api',
};
