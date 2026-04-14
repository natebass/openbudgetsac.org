const pugPlugin = require("@11ty/eleventy-plugin-pug").default;

module.exports = /**
 * Runs exports.
 *
 * @param {any} eleventyConfig Input value.
 * @returns {any} Function result.
 */
function(eleventyConfig) {
  // Make Eleventy aware of generated CSS files and keep static assets copied.
  eleventyConfig.addPlugin(pugPlugin);
  eleventyConfig.addWatchTarget("styles");
  eleventyConfig.addPassthroughCopy("styles");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.setTemplateFormats(["css", "html", "pug", "jade"]);

  return {
    dir: {
      input: ".",
      includes: "partials",
      output: "../build",
    },
  };
};
