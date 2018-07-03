import Ractive from 'ractive';
import * as rcu from '@weblyzard/rcu';
import amdLoader from './utils/amd-loader';
import load from './load';
import build from './build';

let less, babel;

const lessConfig = {
  optimizeCss: true,
  strictMath: true,
	syncImport: true,
	async: false,
	fileAsync: false
};

const babelConfig = {
  presets: ['es2015']
};

const parseOptions = {
  processors: {
    'text/less': template => {
			let css;

      less.render(template.f[0], lessConfig, (error, result) => {
				if (error) console.error(error);
				css = result.css;
			});

			if (!css) throw Error('LESS code cannot be compiled synchronously (most likely using @import)');

      //console.log('less => css:', css);

			template.f[0] = css;
			return template;
		},

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
		less = require.nodeRequire('less');
		babel = require.nodeRequire('babel-core');
		build( name, source, parseOptions, callback, errback );
	} else {
		// Modify the less processor – we render the stylesheets later
		parseOptions.processors['text/less'] = template => template;

		const _callback = function() {
			callback.apply(this, arguments);

			const style = document.querySelector('style[data-ractive-css]:not([rel="stylesheet/less"])');

			if (!style || !style.innerText) return;

			style.setAttribute('rel', 'stylesheet/less');

			less.render(style.innerText, lessConfig, (error, result) => {
				if (error) return console.error(error);
				style.innerHTML = result.css;
			});
		};

		require(['lessc', 'babel'], (_less, _babel) => {
			less = _less;
			babel = _babel;
			load( name, req, source, parseOptions, _callback, errback );
		});
	}
});

export default rvc;
