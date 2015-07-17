var dss     = require( 'dss' ),
    through = require( 'through2' ),
    gutil   = require( 'gulp-util' );

var PLUGIN_NAME = 'gulp-dss';

module.exports = function( opts ) {
    // extend parsers if parsers is {'name':fn(i,line,block,file)}
    if( opts && opts.parsers && (Object.prototype.toString.call( opts.parsers ) === '[object Object]') ) {
        var parsers = opts.parsers;

        for( var key in parsers ) {
            dss.parser( key, parsers[ key ] );
        }
    }

    function plugin( file, enc, cb ) {
        var _this = this;

        if( file.isNull() ) {
            return;
        }
        if( file.isStream() ) {
            return this.emit( 'error', new gutil.PluginError( PLUGIN_NAME, 'Streams are not supported.' ) );
        }

        dss.parse( file.contents.toString(), {}, function( dssString ) {
            file.contents = new Buffer( JSON.stringify( dssString, null, 4 ) );

            return cb( null, file );
        } );
    }

    return through.obj( plugin );
}