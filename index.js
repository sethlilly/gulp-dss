'use strict';

var Buffer   = require( 'buffer' ).Buffer,
    dss      = require( 'dss' ),
    File     = require( 'gulp-util' ).File,
    path     = require( 'path' ),
    nunjucks = require( 'nunjucks' ),
    through  = require( 'through' );

//var pjson = require( '../package.json' );

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

function plugin( opts ) {
    if( opts === undefined ) throw new Error( 'Missing options.' );

    var firstFile = null;
    var contents  = null;

    nunjucks.configure( opts.templatePath || path.join( __dirname, 'templates' ) );

    function process( file ) {
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
        
        if( firstFile ) {
            var joinedPath = path.join( firstFile.base, opts.output );

            var newFile = new File( {
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: joinedPath,
                contents: new Buffer( wrapContents( contents.join( '\n' ) ) )
            } );

            this.emit( 'data', newFile );
        }
    }

    function endStream() {


    }

    function wrapContents( content ) {
        //return render( 'base.html', { content: content, version: pjson.version, build: timeStamp() } );
        return render( 'base.html', { content: content } );
    }

    return through( process, this.emit( 'end' ) );
}

function render( templateName, context ) {
    return nunjucks.render( templateName, context );
}

module.exports = plugin;
