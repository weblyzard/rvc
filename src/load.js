import * as rcu from '@weblyzard/rcu';

export default function load ( base, req, source, parseOptions, callback, errback ) {
	rcu.make( source, {
		url: `${base}.html`,
		loadImport ( name, path, baseUrl, callback ) {
			path = rcu.resolve( path, base );
			req([ 'rvc!' + path.replace( /\.html$/, '' ) ], callback );
		},
		loadModule ( name, path, baseUrl, callback ) {
			req([ path ], callback );
		},
		require ( name ) {
			return req( name );
    },
    parseOptions
	}, callback, errback );
}
