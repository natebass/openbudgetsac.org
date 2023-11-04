const yaml = require('js-yaml');

/**
* Configuration for Eleventy.
* See: /public/documentation/eleventy-configuration.md
* Supports:
* - Yaml data files
*
* @parameter config Eleventy configuration object.
* @return The return object is separate from the Eleventy configuration object.
*/
const eleventyConfig = config => {
  config.ignores.add('README.md');
  config.addPassthroughCopy('./public/');
  // Nate: I don't know why data is needed on the frontend.
  // config.addPassthroughCopy("./_data/");
  config.addPassthroughCopy({ "/public/images/favicon.ico": "/" });
  config.addDataExtension('yml', contents => yaml.load(contents));
  config.addWatchTarget('./styles/');
  config.addWatchTarget('./javascript/');
  return {
    dir: {
      input: "pages",
      includes: "../includes"
    },
    templateFormats: ["css", "html", "pug"],
    compileOptions: {
      cache: false
    }
  };
};