A DSS parser task for Gulp.

You can add additional DSS parsers like this:

````
dss({
    parsers : {
        'parserName' : function(i,line,block,file) {
            return line
        },
        'template' : function(i,line,block,file) {
            return line
        },
    }
})
````

In a Gulp build your setup could look like the following:

```
'use strict';

var gulp = require('gulp'),
    dss = require('gulp-dss'),
    rename = require('gulp-rename');

gulp.task('dss', function() {
  return gulp.src('sass/**/*.scss')
    .pipe(dss({
        parsers: {
            section: function(i, line, block, file) {
                return line;
            }
        }
    }))
    .pipe(rename({
        extname: '.json'
    }))
    .pipe(gulp.dest('dss/'));
});
```

This would process the DSS blocks and output corresponding JSON files in a `dss` directory.