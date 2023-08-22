module.exports = function(eleventyConfig) {  
  eleventyConfig.addWatchTarget("dist");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy("images");
  return {
    dir: {
      input: ".",
      includes: "partials",
      output: "../build",
    },
    templateFormats: ["css", "html", "pug"] 
  };
};
