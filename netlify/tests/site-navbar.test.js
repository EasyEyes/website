const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const docsDir = path.resolve(__dirname, "../../docs");

const htmlFilesWithNav = () => {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (
          ["node_modules", "dist", "threshold", "experiment"].includes(
            entry.name,
          )
        )
          continue;
        walk(full);
      } else if (entry.name.endsWith(".html")) {
        const html = fs.readFileSync(full, "utf8");
        if (html.includes("diff-or-join/")) files.push(full);
      }
    }
  };
  walk(docsDir);
  // compiler page lives under docs/experiment and is not walked above
  files.push(path.join(docsDir, "experiment", "index.html"));
  return files;
};

test("menu item linking to diff-or-join is labeled Diff/Join", () => {
  const files = htmlFilesWithNav();
  assert.ok(files.length > 0, "expected to find pages with the menu");
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    const navLinks = html.match(/<a[^>]*diff-or-join\/[^>]*>[^<]*<\/a>/g) || [];
    assert.ok(navLinks.length > 0, `${file}: no diff-or-join nav link found`);
    for (const link of navLinks) {
      assert.match(
        link,
        />Diff\/Join<\/a>/,
        `${file}: menu label should be "Diff/Join", got ${link}`,
      );
    }
  }
});

test("navbar menu wraps on narrow screens instead of overflowing", () => {
  const css = fs.readFileSync(path.join(docsDir, "uni.css"), "utf8");
  const navbarNavBlock = css.match(/\.navbar-nav\s*\{[^}]*\}/s);
  assert.ok(navbarNavBlock, "uni.css: missing .navbar-nav rule");
  assert.match(
    navbarNavBlock[0],
    /flex-wrap:\s*wrap/,
    "uni.css: .navbar-nav must wrap so the menu fits on phones",
  );
});

test("dropdown menus cannot run off-screen on narrow viewports", () => {
  const css = fs.readFileSync(path.join(docsDir, "uni.css"), "utf8");
  assert.match(
    css,
    /\.nav-item[\s\S]*?max-width:\s*820px[\s\S]*?\.dropdown[\s\S]*?position:\s*static/,
    "uni.css: .nav-item.dropdown must be position:static on narrow screens " +
      "so dropdown menus position against the navbar",
  );
  assert.match(
    css,
    /\.dropdown-menu\s*\{[\s\S]*?max-width:\s*820px[\s\S]*?right:\s*0/,
    "uni.css: .dropdown-menu must be pinned right on narrow screens",
  );
  assert.equal(
    /(^|\s)\/\/[^\n]*/m.test(css),
    false,
    "uni.css: // comments are not valid CSS (use /* */); they break rule parsing",
  );
});
