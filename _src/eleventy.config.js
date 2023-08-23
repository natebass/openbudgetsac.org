module.exports = function(eleventyConfig) {  
  eleventyConfig.addWatchTarget("dist");
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy({ "images/favicon.ico": "/" })
  return {
    dir: {
      input: ".",
      includes: "partials",
      output: "../build",
    },
    templateFormats: ["css", "html", "pug"] 
  };
};
