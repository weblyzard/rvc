import Ractive from 'ractive';
import * as rcu from '@weblyzard/rcu';
import amdLoader from './utils/amd-loader';
import load from './load';
import build from './build';

let babel;

const babelConfig = {
  presets: ['es2015']
};

const parseOptions = {
  processors: {
    'text/babel': template => {
      template.f[0] = babel.transform(template.f[0], babelConfig).code;
      //console.log('es6+ => es5:', template.f[0]);
      return template;
    }
  }
};

rcu.init( Ractive );

let rvc = amdLoader( 'rvc', 'html', ( name, source, req, callback, errback, config ) => {
	if ( config.isBuild ) {
		babel = require.nodeRequire('babel-core');
		build( name, source, parseOptions, callback, errback );
	} else {
		require(['babel'], (_babel) => {
			babel = _babel;
			load( name, req, source, parseOptions, callback, errback );
		});
	}
});

export default rvc;
