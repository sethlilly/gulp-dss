var Buffer      = require( 'buffer' ).Buffer,
    dss         = require( 'dss' ),
    gutil       = require( 'gulp-util' ),
    File        = gutil.File,
    path        = require( 'path' ),
    PluginError = gutil.PluginError,
    nunjucks    = require( 'nunjucks' ),
    through     = require( 'through2' );

const PLUGIN_NAME = 'gulp-dss';

function plugin( opts ) {

    if( opts === undefined ) {
        throw new PluginError( PLUGIN_NAME, 'Missing options.' );
    }

    // Should have opts.version here

    var firstFile = null;
    var contents  = null;

    // Check to see if a templatePath has been passed in. If not, use the templates included in the plugin.
    nunjucks.configure( opts.templatePath || path.join( __dirname, 'templates' ) );

    function bufferContents( file, enc, cb ) {
        var parseOptions = {};

        dss.parse( file.contents.toString(), parseOptions, function( dssFile ) {
            firstFile = firstFile || file;
            contents  = contents || [];

            if( isBlank( dssFile ) ) return;

            dssFile.blocks.filter( validBlock ).forEach( function( block ) {
                contents.push( render( 'module.html', block ) );
            } );

            function isBlank( dssFile ) {
                return dssFile.blocks.length === 0;
            }

            function validBlock( block ) {
                return block.name !== undefined;
            }
        } );

        cb();
    }

    function endStream( cb ) {
        if( firstFile ) {
            var joinedPath = path.join( firstFile.base, opts.output );

            var newFile = new File( {
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: joinedPath,
                contents: new Buffer( wrapContents( contents.join( '\n' ), opts.version ) )
            } );
        }

        this.push( newFile );
        cb();
    }

    return through.obj( bufferContents, endStream );

}

function render( templateName, context ) {
    return nunjucks.render( templateName, context );
}

function wrapContents( content, version ) {
    return render( 'base.html', { content: content, version: version, build: timeStamp() } );
}

function timeStamp() {
    var now  = new Date();
    var date = [ now.getFullYear(), now.getMonth() + 1, now.getDate() ];
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
    for( var i = 0; i < 3; i++ ) {
        if( time[ i ] < 10 ) {
            time[ i ] = "0" + time[ i ];
        }
    }
    for( var i = 1; i < 3; i++ ) {
        if( date[ i ] < 10 ) {
            date[ i ] = "0" + date[ i ];
        }
    }
    return date.join( "" ) + time.join( "" );
}

module.exports = plugin;
