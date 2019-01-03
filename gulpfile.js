const gulp = require("gulp"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync").create();

gulp.task("sass", function() {
  return gulp
    .src("src/**/*.+(scss|sass)")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("dist/"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task(
  "serve",
  gulp.series("sass", function() {
    browserSync.init({
      server: "dist"
    });
    gulp.watch("./src/**/*.sass", gulp.series("sass"));
    gulp.watch("./**/*.html").on("change", browserSync.reload);
    gulp.watch("./**/*.js").on("change", browserSync.reload);
  })
);

gulp.task("default", gulp.series("serve"));
