# Open Budget: Sacramento


## Contributing

If you are looking for a starter development task to get your feet wet with our codebase, any of our Issues tagged [help wanted](https://github.com/code4sac/openbudgetsac.org/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22) might be a good fit.

Some of the other Issues are larger and require some deeper design or architectural work; if one of those catches your eye, you'll probably want to talk with us for some more context and background. Comment on the Issue, and if possible, catch up with us at one of [Open Sacramento's Monthly Action Nights](https://opensac.org/).


## Developing Locally

### Run with Docker
To use Docker as a cross-platform container, run `docker compose up --build` and view the page in your browser at `localhost:8011`. It is required to rerun the command after making changes to see the effects.

### Quick Start Guide for Unix-based systems (macOS, Linux, BSD, or WSL)

1. Sign into GitHub with your account and fork this repository.
2. Clone the fork onto your machine and navigate to the new folder.
3. While still in the root directory of the local repository, create a new folder called `build`. This folder will be ignored by Git, which is our version control system for this project.
4. Navigate to the `_src/` folder which has a local path of `root/_src/`, which is where all development work takes place.
5. Install dependencies with `npm install` into the command-line.
6. Incorpate your CSS changes by running `npm run build-css` into the command-line.
7. Serve the website by entering `npx @11ty/eleventy --serve --port=8011` into the command-line.

Congratulations! Your local copy of Open Budget Sacramento's website should now be running at `http://localhost:8011`. That means you are ready to contribute to the codebase of Open Budget Sacramento. You will probably want to open a new terminal window to re-gain access to the command line.

- Please note that after editing a SASS file you should run `npm run build-css`, like in Step #6, from the `_src/` folder in order to incorporate your changes into the CSS.

### Eleventy

This site is built with [Eleventy](https://11ty.dev), a JavaScript-based static site generator that parses Markdown, Pug, and other template languages and runs on Node.js. That means you can reproduce our site locally with minimal setup!

In order for Eleventy to work, you will need these software libraries and tools installed globally:

- [Node (Required)](http://nodejs.org/download/), as it is required for Eleventy to work.
- [NPM (Required)](https://npmjs.com) or [Yarn (Required)](https://yarnpkg.com/en/), as either one of the package managers are required for Eleventy to work, although NPM is preferred.
- [NVM (Optional)](https://github.com/nvm-sh/nvm/blob/master/README.md), as it is very handy for downloading, updating, and switching between various versions of NPM.
- **Linux/WSL tip (Optional):** Install Node via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (e.g., `nvm install 22 && nvm use 22`) so that `node`/`npm` come from your Linux package manager, not `/mnt/c/...`. If you previously installed with Window's `npm`, then delete `node_modules` and `package-lock.json` in `_src/` before running `npm install --legacy-peer-deps` and also `npx @11ty/eleventy --serve --port=8011`.


### Install & Run Eleventy in `_src/`

Once you have the NPM/Yarm package manager installed, you can install Eleventy and the other dependencies listed in `package.json`. Enter the `npm install` command into the command-line from the `_src/` folder, where the Eleventy configuration file, `.eleventy.js`, lives.

This command usually runs without a glitch, but if you run into trouble, please check your version of node. The latest version of node that we can confirm works with our set-up is **v24.14.1** (Krypton LTS).

To start Eleventy, simply enter the following command `npx @11ty/eleventy --serve --port=8011`.

- Please note that you may choose any network port on your system that is open; 8011 is just a suggestion.


## Frontend Stack

This project is coded with, among other things, the following front-end libraries:

- [Bootstrap](http://getbootstrap.com/), a CSS framework.
- [D3](https://d3js.org), a data visualization library for JavaScript.
- [Pug](https://pugjs.org/api/getting-started.html), a JavaScript-friendly HTML templating language.
- [React](https://facebook.github.io/react/), a rendering library for JavaScript.
- [Sass](https://sass-lang.com/), a CSS preprocessor.

## Creating & Editing Pages

- Please note that it is your responsibility to keep your fork of the repository up-to-date with changes made by others who are working on the project. Doing this diligently should go a long way towards protecting you from confusing Git merge conflicts.
- All development activity occurs in `_src/`. The root folder is only for the compiled program output for deployment.
- Page content is inserted into the `content` block. If you are updating data, be sure you understand it deeply along with how it will be consumed.
- In many cases, you will simply create or update a `.pug` file when making changes to the website, which Eleventy will turn into HTML. If you are making another type of change, you may need to reference the excellent Pug documentation.
- If your page uses custom page-specific CSS, add it to a new `.scss` partial and import it into the main stylesheet. Please note to adhere to the project conventions by following the same CSS namespaces as everyone else.


### Additional Instructions for "flow" Diagram Pages

1. Flow pages are built off a template; As necessary, copy one of the `*-budget-flow.pug` pages and update the content blocks.
2. Data files must be placed in the `data/flow` directory. Follow the naming convention seen there or your files will not load properly. You will also need to point your page at the appropriate files as seen in the `get_datafiles` content block.
3. The following columns are required in your valid datafiles and their names should be normalized as seen here. Other columns should be removed, so to minimize the data download.
   - `budget_year`
   - `department`
   - `fund_code`
   - `account_type` (this should be the Expense/Revenue column, if there are duplicate names)
   - `account_category`
   - `amount`

### Additional Instructions for Treemap Diagram Pages

1. Treemap pages are built off a template; As necessary, copy one of the `*-budget-tree.pug` pages and update the content blocks.
2. Instructions for generating the necessary data files can be found [here](_treemap/README.md). Add them to the `data/tree/` directory following the naming convention seen in the existing files.
3. Update the `datafiles` content block with the appropriate metadata and file path for the data files you generated.

### Additional Instructions for the Compare Page

1. The Compare page is a React application. The source files are in `_src/js/compare/` and are are bundled with [Webpack](https://webpack.js.org/).
1. When developing on the Compare page, run `yarn` to install all the necessary Node dependencies and `yarn run watch` to watch the source files for changes and rebuild the asset bundles accordingly.


## Publishing Changes

Make changes and review them on your local development site. If everything looks good, push your changes to your personal fork and merge the commit(s) into your main branch. Finally, issue a pull request and we will take it from there!

### Issuing a Pull Request

1. Create a pull request from your forked repository to the main branch of the upstream project.
2. Tell an administator of the upstream repository that your work is ready for review. Your changes will ideally then be reviewed, tested, and (if everything looks good) pushed into the master branch.
3. Changes pushed to the main branch of the (original) repository will use GitHub Actions to trigger a continuous integration/continuous deployment (CI/CD) process that (among other things):
    a. Runs WebPack for the Compare page.
    b. Builds static files with Eleventy.
    c. Deploys the updated website files to GitHub Pages, where the changes will be published [here](https://openbudgetsac.org/).

- Please note that after editing a SASS file, you should run `npm run build-css` from the `_src/` folder to incorporate your changes into CSS.

### Additional Instructions for Data Filtering

To get the data for each Fiscal Year from the Sacramento City budget's spreadsheet, in `_src/data`, run the command `python split_csv.py City_of_Sacramento_Approved_Budgets.csv Fiscal_Year _src/data/flow --txf fy_suffix`. Also, in `_src/js/flow.js` and `_src/adopted-budget-flow.pug`, then add an extra case for `FY26` similar to `FY25`, all using the Fiscal Year 2026 (FY2026) as an example.
