const { composePlugins, withNx } = require('@nrwl/webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = composePlugins(withNx(), (config) => {
    config.externals = {
        dotenv: 'dotenv',
    };
    return config;
});
