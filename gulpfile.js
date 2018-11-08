var gulp = require("gulp");
var pug = require("gulp-pug");
var livereload = require("gulp-livereload");
var concat = require("gulp-concat");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var cleanCss = require("gulp-clean-css");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var babel = require("gulp-babel");
var imagemin = require("gulp-imagemin");
var imageminPngquant = require("imagemin-pngquant");
var imageminJpegRecompress = require("imagemin-jpeg-recompress");
var zip = require("gulp-zip");

sass.compiler = require("node-sass");

// Paths
var DIST_PATH = "public";
var VIEWS_PATH = "src/views/**/*.pug";
var SCSS_PATH = "src/scss/**/*.{scss,sass,css}";
var JS_PATH = "src/js/**/*.js";
var IMAGES_PATH = "src/images/**/*.{jpeg,jpg,png,svg,gif}";

// views(pug) Task
gulp.task("views", function() {
  return gulp
    .src(VIEWS_PATH)
    .pipe(
      pug({
        doctype: "html",
        pretty: true
      })
    )
    .pipe(gulp.dest(DIST_PATH))
    .pipe(livereload());
});

// Styles Task.
gulp.task("styles", function() {
  return gulp
    .src(SCSS_PATH)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(
      sass({
        outputStyle: "expended"
      })
    )
    .pipe(sourcemaps.write("/maps"))
    .pipe(gulp.dest(DIST_PATH + "/css"))
    .pipe(livereload());
});

// mini-css
gulp.task("mini-css", function() {
  return gulp
    .src([DIST_PATH + "/css/index.css"])
    .pipe(cleanCss())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest(DIST_PATH + "/css"))
    .pipe(livereload());
});

// Scripts Task
gulp.task("scripts", function() {
  return gulp
    .src(JS_PATH)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(sourcemaps.write("/maps"))
    .pipe(gulp.dest(DIST_PATH + "/js"))
    .pipe(livereload());
});

// Images Task
gulp.task("images", function() {
  return gulp
    .src(IMAGES_PATH)
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }]
        }),
        imageminPngquant(),
        imageminJpegRecompress()
      ])
    )
    .pipe(gulp.dest(DIST_PATH + "/images"));
});

//Export Task
gulp.task("export", function() {
  return gulp
    .src("public/**/*")
    .pipe(zip("website.zip"))
    .pipe(gulp.dest("./"));
});

// Default task
gulp.task(
  "default",
  ["views", "styles", "scripts", "images", "mini-css"],
  function() {
    require("./server");
    livereload.listen();
    gulp.watch([VIEWS_PATH], ["views"]);
    gulp.watch([SCSS_PATH], ["styles"]);
    gulp.watch([JS_PATH], ["scripts"]);
    gulp.watch([DIST_PATH + "/css/*.css"], ["mini-css"]);
  }
);
