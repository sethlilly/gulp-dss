var expect = require('chai').expect;
var gutil = require('gulp-util');

var dss = require('./');

describe('gulp-dss', function() {
    it('should parse default file', function(done){
        var stream = dss();
        var fakeBuffer = new Buffer('a');
        var fakeFile = new gutil.File({
            contents : fakeBuffer
        });

        stream.on('data', function(newFile){
            expect(newFile.contents.toString()).to.equal('{"blocks":[]}');
        });
        stream.on('end', function(){
            done();
        });
        stream.write(fakeFile);
        stream.end();
    });

    it('should parse some by default to json', function(done) {
        var stream = dss();
        var fakeBuffer = new Buffer('/* \n @name Button \n @markup \n <div></div> \n */');
        var fakeFile = new gutil.File({
            contents: fakeBuffer
        });

        stream.on('data', function(newFile) {
            expect(newFile.contents.toString()).to.equal('{"blocks":[{"name":"Button","markup":{"example":"<div></div>","escaped":"&lt;div&gt;&lt;/div&gt;"}}]}');
        });
        stream.on('end', function(){
            done();
        });
        stream.write(fakeFile);
        stream.end();
    });

    it('should be able to add custom parser/s', function(done) {
        var stream = dss({
            parsers : {
                'section' : function(i,line,block,file){
                    return line
                }
            }
        });
        var fakeBuffer = new Buffer('/* \n @name Button \n @section one \n @markup \n <div></div> \n */');
        var fakeFile = new gutil.File({
            contents: fakeBuffer
        });

        stream.on('data', function(newFile) {
            expect(newFile.contents.toString()).to.equal('{"blocks":[{"name":"Button",\"section\":\"one\","markup":{"example":"<div></div>","escaped":"&lt;div&gt;&lt;/div&gt;"}}]}');
        });
        stream.on('end', function(){
            done();
        });
        stream.write(fakeFile);
        stream.end();
    });
});

