import * as apicache from 'apicache';

const cache = apicache.options({
    headers: {
        'cache-control': 'no-cache',
    },
}).middleware;

export default cache('5 minute');
