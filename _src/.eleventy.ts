const pugPlugin = require('@11ty/eleventy-plugin-pug').default;

module.exports = /**
 * Runs exports.
 *
 * @param {any} eleventyConfig Input value.
 * @returns {any} Function result.
 */
function(eleventyConfig: any) {
  eleventyConfig.addPlugin(pugPlugin);
  eleventyConfig.addWatchTarget('generated');
  eleventyConfig.addWatchTarget('styles');
  eleventyConfig.addWatchTarget('vendor');
  eleventyConfig.addPassthroughCopy('styles');
  eleventyConfig.addPassthroughCopy({'generated/js': 'js'});
  eleventyConfig.addPassthroughCopy({'css/bower_components/jquery/dist/jquery.min.js': 'js/vendor/jquery.min.js'});
  eleventyConfig.addPassthroughCopy({'vendor/jquery-migrate-1.2.1.min.js': 'js/vendor/jquery-migrate-1.2.1.min.js'});
  eleventyConfig.addPassthroughCopy({'css/bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js': 'js/vendor/bootstrap.min.js'});
  eleventyConfig.addPassthroughCopy({'vendor/d3.v3.4.5.min.js': 'js/vendor/d3.v3.4.5.min.js'});
  eleventyConfig.addPassthroughCopy('data');
  eleventyConfig.addPassthroughCopy('images');
  eleventyConfig.setTemplateFormats(['css', 'html', 'pug', 'jade']);

  return {
    dir: {
      input: '.',
      includes: 'partials',
      output: '../build',
    },
  };
};
