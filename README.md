# EasyEyes Website

[![Netlify Status](https://api.netlify.com/api/v1/badges/7ef5bb5a-2b97-4af2-9868-d3e9c7ca2287/deploy-status)](https://app.netlify.com/sites/easyeyes/deploys)

The public website of EasyEyes projects.

---

Submodule structure.

```
[website] (this)
  docs
    [threshold] (threshold-scientist, https://github.com/EasyEyes/threshold-scientist)
      [threshold] (https://github.com/EasyEyes/threshold)
        [psychojs] (forked from psychopy/psychojs, https://github.com/EasyEyes/psychojs)
```

Clone the code to local.

```shell
git clone --recurse-submodules https://github.com/EasyEyes/website.git
```

Install the pre-commit auto formatter before development.

```shell
npm install
```
