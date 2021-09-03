import production from './config.prod';
import development from './config.dev';
import local from './config.local';

console.log("env =>", process.env.NODE_ENV);

var keys = {}
switch (process.env.NODE_ENV) {
    case 'production':
        keys = production
        break;
    case 'development':
        keys = development
        break;
    default:
        keys = local
        break;
}

export default keys