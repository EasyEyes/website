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

## Setup

```shell
npm run setup
```

## Contribute

Always pull from the GitHub before making any changes.

```shell
npm run pull
```

To commit at all levels, use

```shell
npm run git "commit message" n
```

`n` is the commit level - `0` means only **website**, `1` means only **website** and **threshold-scientist**, `2` means **website**, **threshold-scientist**, and **threshold**.

## Threshold Local Development

### Scientist Page

```shell
cd docs/threshold
npm run start
```

### Participant Page

```shell
cd docs/threshold/threshold
npm run build # Only needed once
npm run examples # Needed every time changes made to the experiment tables
npm run start -- --name=nameOfTheExperimentTable
```

You don't need to build before committing to GitHub, Netlify will do it for you during the deployment. An auto formatter (Prettier) will format your code during the commit (pre-commit hook).
