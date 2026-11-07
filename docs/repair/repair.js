"use strict";
(() => {
  var yn = Object.create;
  var Tt = Object.defineProperty;
  var xn = Object.getOwnPropertyDescriptor;
  var vn = Object.getOwnPropertyNames;
  var wn = Object.getPrototypeOf,
    _n = Object.prototype.hasOwnProperty;
  var et = ((e) =>
    typeof require < "u"
      ? require
      : typeof Proxy < "u"
      ? new Proxy(e, { get: (d, a) => (typeof require < "u" ? require : d)[a] })
      : e)(function (e) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + e + '" is not supported');
  });
  var En = (e, d) => () => (
    d || e((d = { exports: {} }).exports, d), d.exports
  );
  var Dn = (e, d, a, n) => {
    if ((d && typeof d == "object") || typeof d == "function")
      for (let r of vn(d))
        !_n.call(e, r) &&
          r !== a &&
          Tt(e, r, {
            get: () => d[r],
            enumerable: !(n = xn(d, r)) || n.enumerable,
          });
    return e;
  };
  var Sn = (e, d, a) => (
    (a = e != null ? yn(wn(e)) : {}),
    Dn(
      d || !e || !e.__esModule
        ? Tt(a, "default", { value: e, enumerable: !0 })
        : a,
      e,
    )
  );
  var jt = En((Ut, yt) => {
    (function (e) {
      typeof Ut == "object" && typeof yt < "u"
        ? (yt.exports = e())
        : typeof define == "function" && define.amd
        ? define([], e)
        : ((typeof window < "u"
            ? window
            : typeof global < "u"
            ? global
            : typeof self < "u"
            ? self
            : this
          ).JSZip = e());
    })(function () {
      return (function e(d, a, n) {
        function r(h, g) {
          if (!a[h]) {
            if (!d[h]) {
              var o = typeof et == "function" && et;
              if (!g && o) return o(h, !0);
              if (s) return s(h, !0);
              var b = new Error("Cannot find module '" + h + "'");
              throw ((b.code = "MODULE_NOT_FOUND"), b);
            }
            var u = (a[h] = { exports: {} });
            d[h][0].call(
              u.exports,
              function (p) {
                var l = d[h][1][p];
                return r(l || p);
              },
              u,
              u.exports,
              e,
              d,
              a,
              n,
            );
          }
          return a[h].exports;
        }
        for (var s = typeof et == "function" && et, i = 0; i < n.length; i++)
          r(n[i]);
        return r;
      })(
        {
          1: [
            function (e, d, a) {
              "use strict";
              var n = e("./utils"),
                r = e("./support"),
                s =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              (a.encode = function (i) {
                for (
                  var h,
                    g,
                    o,
                    b,
                    u,
                    p,
                    l,
                    m = [],
                    f = 0,
                    x = i.length,
                    w = x,
                    D = n.getTypeOf(i) !== "string";
                  f < i.length;

                )
                  (w = x - f),
                    (o = D
                      ? ((h = i[f++]),
                        (g = f < x ? i[f++] : 0),
                        f < x ? i[f++] : 0)
                      : ((h = i.charCodeAt(f++)),
                        (g = f < x ? i.charCodeAt(f++) : 0),
                        f < x ? i.charCodeAt(f++) : 0)),
                    (b = h >> 2),
                    (u = ((3 & h) << 4) | (g >> 4)),
                    (p = 1 < w ? ((15 & g) << 2) | (o >> 6) : 64),
                    (l = 2 < w ? 63 & o : 64),
                    m.push(
                      s.charAt(b) + s.charAt(u) + s.charAt(p) + s.charAt(l),
                    );
                return m.join("");
              }),
                (a.decode = function (i) {
                  var h,
                    g,
                    o,
                    b,
                    u,
                    p,
                    l = 0,
                    m = 0,
                    f = "data:";
                  if (i.substr(0, f.length) === f)
                    throw new Error(
                      "Invalid base64 input, it looks like a data url.",
                    );
                  var x,
                    w =
                      (3 * (i = i.replace(/[^A-Za-z0-9+/=]/g, "")).length) / 4;
                  if (
                    (i.charAt(i.length - 1) === s.charAt(64) && w--,
                    i.charAt(i.length - 2) === s.charAt(64) && w--,
                    w % 1 != 0)
                  )
                    throw new Error(
                      "Invalid base64 input, bad content length.",
                    );
                  for (
                    x = r.uint8array ? new Uint8Array(0 | w) : new Array(0 | w);
                    l < i.length;

                  )
                    (h =
                      (s.indexOf(i.charAt(l++)) << 2) |
                      ((b = s.indexOf(i.charAt(l++))) >> 4)),
                      (g =
                        ((15 & b) << 4) |
                        ((u = s.indexOf(i.charAt(l++))) >> 2)),
                      (o = ((3 & u) << 6) | (p = s.indexOf(i.charAt(l++)))),
                      (x[m++] = h),
                      u !== 64 && (x[m++] = g),
                      p !== 64 && (x[m++] = o);
                  return x;
                });
            },
            { "./support": 30, "./utils": 32 },
          ],
          2: [
            function (e, d, a) {
              "use strict";
              var n = e("./external"),
                r = e("./stream/DataWorker"),
                s = e("./stream/Crc32Probe"),
                i = e("./stream/DataLengthProbe");
              function h(g, o, b, u, p) {
                (this.compressedSize = g),
                  (this.uncompressedSize = o),
                  (this.crc32 = b),
                  (this.compression = u),
                  (this.compressedContent = p);
              }
              (h.prototype = {
                getContentWorker: function () {
                  var g = new r(n.Promise.resolve(this.compressedContent))
                      .pipe(this.compression.uncompressWorker())
                      .pipe(new i("data_length")),
                    o = this;
                  return (
                    g.on("end", function () {
                      if (this.streamInfo.data_length !== o.uncompressedSize)
                        throw new Error(
                          "Bug : uncompressed data size mismatch",
                        );
                    }),
                    g
                  );
                },
                getCompressedWorker: function () {
                  return new r(n.Promise.resolve(this.compressedContent))
                    .withStreamInfo("compressedSize", this.compressedSize)
                    .withStreamInfo("uncompressedSize", this.uncompressedSize)
                    .withStreamInfo("crc32", this.crc32)
                    .withStreamInfo("compression", this.compression);
                },
              }),
                (h.createWorkerFrom = function (g, o, b) {
                  return g
                    .pipe(new s())
                    .pipe(new i("uncompressedSize"))
                    .pipe(o.compressWorker(b))
                    .pipe(new i("compressedSize"))
                    .withStreamInfo("compression", o);
                }),
                (d.exports = h);
            },
            {
              "./external": 6,
              "./stream/Crc32Probe": 25,
              "./stream/DataLengthProbe": 26,
              "./stream/DataWorker": 27,
            },
          ],
          3: [
            function (e, d, a) {
              "use strict";
              var n = e("./stream/GenericWorker");
              (a.STORE = {
                magic: "\0\0",
                compressWorker: function () {
                  return new n("STORE compression");
                },
                uncompressWorker: function () {
                  return new n("STORE decompression");
                },
              }),
                (a.DEFLATE = e("./flate"));
            },
            { "./flate": 7, "./stream/GenericWorker": 28 },
          ],
          4: [
            function (e, d, a) {
              "use strict";
              var n = e("./utils"),
                r = (function () {
                  for (var s, i = [], h = 0; h < 256; h++) {
                    s = h;
                    for (var g = 0; g < 8; g++)
                      s = 1 & s ? 3988292384 ^ (s >>> 1) : s >>> 1;
                    i[h] = s;
                  }
                  return i;
                })();
              d.exports = function (s, i) {
                return s !== void 0 && s.length
                  ? n.getTypeOf(s) !== "string"
                    ? (function (h, g, o, b) {
                        var u = r,
                          p = b + o;
                        h ^= -1;
                        for (var l = b; l < p; l++)
                          h = (h >>> 8) ^ u[255 & (h ^ g[l])];
                        return -1 ^ h;
                      })(0 | i, s, s.length, 0)
                    : (function (h, g, o, b) {
                        var u = r,
                          p = b + o;
                        h ^= -1;
                        for (var l = b; l < p; l++)
                          h = (h >>> 8) ^ u[255 & (h ^ g.charCodeAt(l))];
                        return -1 ^ h;
                      })(0 | i, s, s.length, 0)
                  : 0;
              };
            },
            { "./utils": 32 },
          ],
          5: [
            function (e, d, a) {
              "use strict";
              (a.base64 = !1),
                (a.binary = !1),
                (a.dir = !1),
                (a.createFolders = !0),
                (a.date = null),
                (a.compression = null),
                (a.compressionOptions = null),
                (a.comment = null),
                (a.unixPermissions = null),
                (a.dosPermissions = null);
            },
            {},
          ],
          6: [
            function (e, d, a) {
              "use strict";
              var n = null;
              (n = typeof Promise < "u" ? Promise : e("lie")),
                (d.exports = { Promise: n });
            },
            { lie: 37 },
          ],
          7: [
            function (e, d, a) {
              "use strict";
              var n =
                  typeof Uint8Array < "u" &&
                  typeof Uint16Array < "u" &&
                  typeof Uint32Array < "u",
                r = e("pako"),
                s = e("./utils"),
                i = e("./stream/GenericWorker"),
                h = n ? "uint8array" : "array";
              function g(o, b) {
                i.call(this, "FlateWorker/" + o),
                  (this._pako = null),
                  (this._pakoAction = o),
                  (this._pakoOptions = b),
                  (this.meta = {});
              }
              (a.magic = "\b\0"),
                s.inherits(g, i),
                (g.prototype.processChunk = function (o) {
                  (this.meta = o.meta),
                    this._pako === null && this._createPako(),
                    this._pako.push(s.transformTo(h, o.data), !1);
                }),
                (g.prototype.flush = function () {
                  i.prototype.flush.call(this),
                    this._pako === null && this._createPako(),
                    this._pako.push([], !0);
                }),
                (g.prototype.cleanUp = function () {
                  i.prototype.cleanUp.call(this), (this._pako = null);
                }),
                (g.prototype._createPako = function () {
                  this._pako = new r[this._pakoAction]({
                    raw: !0,
                    level: this._pakoOptions.level || -1,
                  });
                  var o = this;
                  this._pako.onData = function (b) {
                    o.push({ data: b, meta: o.meta });
                  };
                }),
                (a.compressWorker = function (o) {
                  return new g("Deflate", o);
                }),
                (a.uncompressWorker = function () {
                  return new g("Inflate", {});
                });
            },
            { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 },
          ],
          8: [
            function (e, d, a) {
              "use strict";
              function n(u, p) {
                var l,
                  m = "";
                for (l = 0; l < p; l++)
                  (m += String.fromCharCode(255 & u)), (u >>>= 8);
                return m;
              }
              function r(u, p, l, m, f, x) {
                var w,
                  D,
                  _ = u.file,
                  z = u.compression,
                  A = x !== h.utf8encode,
                  B = s.transformTo("string", x(_.name)),
                  k = s.transformTo("string", h.utf8encode(_.name)),
                  I = _.comment,
                  W = s.transformTo("string", x(I)),
                  E = s.transformTo("string", h.utf8encode(I)),
                  M = k.length !== _.name.length,
                  c = E.length !== I.length,
                  T = "",
                  U = "",
                  C = "",
                  Y = _.dir,
                  L = _.date,
                  Z = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                (p && !l) ||
                  ((Z.crc32 = u.crc32),
                  (Z.compressedSize = u.compressedSize),
                  (Z.uncompressedSize = u.uncompressedSize));
                var $ = 0;
                p && ($ |= 8), A || (!M && !c) || ($ |= 2048);
                var R = 0,
                  V = 0;
                Y && (R |= 16),
                  f === "UNIX"
                    ? ((V = 798),
                      (R |= (function (j, ae) {
                        var oe = j;
                        return (
                          j || (oe = ae ? 16893 : 33204), (65535 & oe) << 16
                        );
                      })(_.unixPermissions, Y)))
                    : ((V = 20),
                      (R |= (function (j) {
                        return 63 & (j || 0);
                      })(_.dosPermissions))),
                  (w = L.getUTCHours()),
                  (w <<= 6),
                  (w |= L.getUTCMinutes()),
                  (w <<= 5),
                  (w |= L.getUTCSeconds() / 2),
                  (D = L.getUTCFullYear() - 1980),
                  (D <<= 4),
                  (D |= L.getUTCMonth() + 1),
                  (D <<= 5),
                  (D |= L.getUTCDate()),
                  M &&
                    ((U = n(1, 1) + n(g(B), 4) + k),
                    (T += "up" + n(U.length, 2) + U)),
                  c &&
                    ((C = n(1, 1) + n(g(W), 4) + E),
                    (T += "uc" + n(C.length, 2) + C));
                var H = "";
                return (
                  (H += `
\0`),
                  (H += n($, 2)),
                  (H += z.magic),
                  (H += n(w, 2)),
                  (H += n(D, 2)),
                  (H += n(Z.crc32, 4)),
                  (H += n(Z.compressedSize, 4)),
                  (H += n(Z.uncompressedSize, 4)),
                  (H += n(B.length, 2)),
                  (H += n(T.length, 2)),
                  {
                    fileRecord: o.LOCAL_FILE_HEADER + H + B + T,
                    dirRecord:
                      o.CENTRAL_FILE_HEADER +
                      n(V, 2) +
                      H +
                      n(W.length, 2) +
                      "\0\0\0\0" +
                      n(R, 4) +
                      n(m, 4) +
                      B +
                      T +
                      W,
                  }
                );
              }
              var s = e("../utils"),
                i = e("../stream/GenericWorker"),
                h = e("../utf8"),
                g = e("../crc32"),
                o = e("../signature");
              function b(u, p, l, m) {
                i.call(this, "ZipFileWorker"),
                  (this.bytesWritten = 0),
                  (this.zipComment = p),
                  (this.zipPlatform = l),
                  (this.encodeFileName = m),
                  (this.streamFiles = u),
                  (this.accumulate = !1),
                  (this.contentBuffer = []),
                  (this.dirRecords = []),
                  (this.currentSourceOffset = 0),
                  (this.entriesCount = 0),
                  (this.currentFile = null),
                  (this._sources = []);
              }
              s.inherits(b, i),
                (b.prototype.push = function (u) {
                  var p = u.meta.percent || 0,
                    l = this.entriesCount,
                    m = this._sources.length;
                  this.accumulate
                    ? this.contentBuffer.push(u)
                    : ((this.bytesWritten += u.data.length),
                      i.prototype.push.call(this, {
                        data: u.data,
                        meta: {
                          currentFile: this.currentFile,
                          percent: l ? (p + 100 * (l - m - 1)) / l : 100,
                        },
                      }));
                }),
                (b.prototype.openedSource = function (u) {
                  (this.currentSourceOffset = this.bytesWritten),
                    (this.currentFile = u.file.name);
                  var p = this.streamFiles && !u.file.dir;
                  if (p) {
                    var l = r(
                      u,
                      p,
                      !1,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                    this.push({ data: l.fileRecord, meta: { percent: 0 } });
                  } else this.accumulate = !0;
                }),
                (b.prototype.closedSource = function (u) {
                  this.accumulate = !1;
                  var p = this.streamFiles && !u.file.dir,
                    l = r(
                      u,
                      p,
                      !0,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                  if ((this.dirRecords.push(l.dirRecord), p))
                    this.push({
                      data: (function (m) {
                        return (
                          o.DATA_DESCRIPTOR +
                          n(m.crc32, 4) +
                          n(m.compressedSize, 4) +
                          n(m.uncompressedSize, 4)
                        );
                      })(u),
                      meta: { percent: 100 },
                    });
                  else
                    for (
                      this.push({ data: l.fileRecord, meta: { percent: 0 } });
                      this.contentBuffer.length;

                    )
                      this.push(this.contentBuffer.shift());
                  this.currentFile = null;
                }),
                (b.prototype.flush = function () {
                  for (
                    var u = this.bytesWritten, p = 0;
                    p < this.dirRecords.length;
                    p++
                  )
                    this.push({
                      data: this.dirRecords[p],
                      meta: { percent: 100 },
                    });
                  var l = this.bytesWritten - u,
                    m = (function (f, x, w, D, _) {
                      var z = s.transformTo("string", _(D));
                      return (
                        o.CENTRAL_DIRECTORY_END +
                        "\0\0\0\0" +
                        n(f, 2) +
                        n(f, 2) +
                        n(x, 4) +
                        n(w, 4) +
                        n(z.length, 2) +
                        z
                      );
                    })(
                      this.dirRecords.length,
                      l,
                      u,
                      this.zipComment,
                      this.encodeFileName,
                    );
                  this.push({ data: m, meta: { percent: 100 } });
                }),
                (b.prototype.prepareNextSource = function () {
                  (this.previous = this._sources.shift()),
                    this.openedSource(this.previous.streamInfo),
                    this.isPaused
                      ? this.previous.pause()
                      : this.previous.resume();
                }),
                (b.prototype.registerPrevious = function (u) {
                  this._sources.push(u);
                  var p = this;
                  return (
                    u.on("data", function (l) {
                      p.processChunk(l);
                    }),
                    u.on("end", function () {
                      p.closedSource(p.previous.streamInfo),
                        p._sources.length ? p.prepareNextSource() : p.end();
                    }),
                    u.on("error", function (l) {
                      p.error(l);
                    }),
                    this
                  );
                }),
                (b.prototype.resume = function () {
                  return (
                    !!i.prototype.resume.call(this) &&
                    (!this.previous && this._sources.length
                      ? (this.prepareNextSource(), !0)
                      : this.previous ||
                        this._sources.length ||
                        this.generatedError
                      ? void 0
                      : (this.end(), !0))
                  );
                }),
                (b.prototype.error = function (u) {
                  var p = this._sources;
                  if (!i.prototype.error.call(this, u)) return !1;
                  for (var l = 0; l < p.length; l++)
                    try {
                      p[l].error(u);
                    } catch {}
                  return !0;
                }),
                (b.prototype.lock = function () {
                  i.prototype.lock.call(this);
                  for (var u = this._sources, p = 0; p < u.length; p++)
                    u[p].lock();
                }),
                (d.exports = b);
            },
            {
              "../crc32": 4,
              "../signature": 23,
              "../stream/GenericWorker": 28,
              "../utf8": 31,
              "../utils": 32,
            },
          ],
          9: [
            function (e, d, a) {
              "use strict";
              var n = e("../compressions"),
                r = e("./ZipFileWorker");
              a.generateWorker = function (s, i, h) {
                var g = new r(i.streamFiles, h, i.platform, i.encodeFileName),
                  o = 0;
                try {
                  s.forEach(function (b, u) {
                    o++;
                    var p = (function (x, w) {
                        var D = x || w,
                          _ = n[D];
                        if (!_)
                          throw new Error(
                            D + " is not a valid compression method !",
                          );
                        return _;
                      })(u.options.compression, i.compression),
                      l =
                        u.options.compressionOptions ||
                        i.compressionOptions ||
                        {},
                      m = u.dir,
                      f = u.date;
                    u._compressWorker(p, l)
                      .withStreamInfo("file", {
                        name: b,
                        dir: m,
                        date: f,
                        comment: u.comment || "",
                        unixPermissions: u.unixPermissions,
                        dosPermissions: u.dosPermissions,
                      })
                      .pipe(g);
                  }),
                    (g.entriesCount = o);
                } catch (b) {
                  g.error(b);
                }
                return g;
              };
            },
            { "../compressions": 3, "./ZipFileWorker": 8 },
          ],
          10: [
            function (e, d, a) {
              "use strict";
              function n() {
                if (!(this instanceof n)) return new n();
                if (arguments.length)
                  throw new Error(
                    "The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                (this.files = Object.create(null)),
                  (this.comment = null),
                  (this.root = ""),
                  (this.clone = function () {
                    var r = new n();
                    for (var s in this)
                      typeof this[s] != "function" && (r[s] = this[s]);
                    return r;
                  });
              }
              ((n.prototype = e("./object")).loadAsync = e("./load")),
                (n.support = e("./support")),
                (n.defaults = e("./defaults")),
                (n.version = "3.10.1"),
                (n.loadAsync = function (r, s) {
                  return new n().loadAsync(r, s);
                }),
                (n.external = e("./external")),
                (d.exports = n);
            },
            {
              "./defaults": 5,
              "./external": 6,
              "./load": 11,
              "./object": 15,
              "./support": 30,
            },
          ],
          11: [
            function (e, d, a) {
              "use strict";
              var n = e("./utils"),
                r = e("./external"),
                s = e("./utf8"),
                i = e("./zipEntries"),
                h = e("./stream/Crc32Probe"),
                g = e("./nodejsUtils");
              function o(b) {
                return new r.Promise(function (u, p) {
                  var l = b.decompressed.getContentWorker().pipe(new h());
                  l.on("error", function (m) {
                    p(m);
                  })
                    .on("end", function () {
                      l.streamInfo.crc32 !== b.decompressed.crc32
                        ? p(new Error("Corrupted zip : CRC32 mismatch"))
                        : u();
                    })
                    .resume();
                });
              }
              d.exports = function (b, u) {
                var p = this;
                return (
                  (u = n.extend(u || {}, {
                    base64: !1,
                    checkCRC32: !1,
                    optimizedBinaryString: !1,
                    createFolders: !1,
                    decodeFileName: s.utf8decode,
                  })),
                  g.isNode && g.isStream(b)
                    ? r.Promise.reject(
                        new Error(
                          "JSZip can't accept a stream when loading a zip file.",
                        ),
                      )
                    : n
                        .prepareContent(
                          "the loaded zip file",
                          b,
                          !0,
                          u.optimizedBinaryString,
                          u.base64,
                        )
                        .then(function (l) {
                          var m = new i(u);
                          return m.load(l), m;
                        })
                        .then(function (l) {
                          var m = [r.Promise.resolve(l)],
                            f = l.files;
                          if (u.checkCRC32)
                            for (var x = 0; x < f.length; x++) m.push(o(f[x]));
                          return r.Promise.all(m);
                        })
                        .then(function (l) {
                          for (
                            var m = l.shift(), f = m.files, x = 0;
                            x < f.length;
                            x++
                          ) {
                            var w = f[x],
                              D = w.fileNameStr,
                              _ = n.resolve(w.fileNameStr);
                            p.file(_, w.decompressed, {
                              binary: !0,
                              optimizedBinaryString: !0,
                              date: w.date,
                              dir: w.dir,
                              comment: w.fileCommentStr.length
                                ? w.fileCommentStr
                                : null,
                              unixPermissions: w.unixPermissions,
                              dosPermissions: w.dosPermissions,
                              createFolders: u.createFolders,
                            }),
                              w.dir || (p.file(_).unsafeOriginalName = D);
                          }
                          return (
                            m.zipComment.length && (p.comment = m.zipComment), p
                          );
                        })
                );
              };
            },
            {
              "./external": 6,
              "./nodejsUtils": 14,
              "./stream/Crc32Probe": 25,
              "./utf8": 31,
              "./utils": 32,
              "./zipEntries": 33,
            },
          ],
          12: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils"),
                r = e("../stream/GenericWorker");
              function s(i, h) {
                r.call(this, "Nodejs stream input adapter for " + i),
                  (this._upstreamEnded = !1),
                  this._bindStream(h);
              }
              n.inherits(s, r),
                (s.prototype._bindStream = function (i) {
                  var h = this;
                  (this._stream = i).pause(),
                    i
                      .on("data", function (g) {
                        h.push({ data: g, meta: { percent: 0 } });
                      })
                      .on("error", function (g) {
                        h.isPaused ? (this.generatedError = g) : h.error(g);
                      })
                      .on("end", function () {
                        h.isPaused ? (h._upstreamEnded = !0) : h.end();
                      });
                }),
                (s.prototype.pause = function () {
                  return (
                    !!r.prototype.pause.call(this) && (this._stream.pause(), !0)
                  );
                }),
                (s.prototype.resume = function () {
                  return (
                    !!r.prototype.resume.call(this) &&
                    (this._upstreamEnded ? this.end() : this._stream.resume(),
                    !0)
                  );
                }),
                (d.exports = s);
            },
            { "../stream/GenericWorker": 28, "../utils": 32 },
          ],
          13: [
            function (e, d, a) {
              "use strict";
              var n = e("readable-stream").Readable;
              function r(s, i, h) {
                n.call(this, i), (this._helper = s);
                var g = this;
                s.on("data", function (o, b) {
                  g.push(o) || g._helper.pause(), h && h(b);
                })
                  .on("error", function (o) {
                    g.emit("error", o);
                  })
                  .on("end", function () {
                    g.push(null);
                  });
              }
              e("../utils").inherits(r, n),
                (r.prototype._read = function () {
                  this._helper.resume();
                }),
                (d.exports = r);
            },
            { "../utils": 32, "readable-stream": 16 },
          ],
          14: [
            function (e, d, a) {
              "use strict";
              d.exports = {
                isNode: typeof Buffer < "u",
                newBufferFrom: function (n, r) {
                  if (Buffer.from && Buffer.from !== Uint8Array.from)
                    return Buffer.from(n, r);
                  if (typeof n == "number")
                    throw new Error('The "data" argument must not be a number');
                  return new Buffer(n, r);
                },
                allocBuffer: function (n) {
                  if (Buffer.alloc) return Buffer.alloc(n);
                  var r = new Buffer(n);
                  return r.fill(0), r;
                },
                isBuffer: function (n) {
                  return Buffer.isBuffer(n);
                },
                isStream: function (n) {
                  return (
                    n &&
                    typeof n.on == "function" &&
                    typeof n.pause == "function" &&
                    typeof n.resume == "function"
                  );
                },
              };
            },
            {},
          ],
          15: [
            function (e, d, a) {
              "use strict";
              function n(_, z, A) {
                var B,
                  k = s.getTypeOf(z),
                  I = s.extend(A || {}, g);
                (I.date = I.date || new Date()),
                  I.compression !== null &&
                    (I.compression = I.compression.toUpperCase()),
                  typeof I.unixPermissions == "string" &&
                    (I.unixPermissions = parseInt(I.unixPermissions, 8)),
                  I.unixPermissions &&
                    16384 & I.unixPermissions &&
                    (I.dir = !0),
                  I.dosPermissions && 16 & I.dosPermissions && (I.dir = !0),
                  I.dir && (_ = f(_)),
                  I.createFolders && (B = m(_)) && x.call(this, B, !0);
                var W = k === "string" && I.binary === !1 && I.base64 === !1;
                (A && A.binary !== void 0) || (I.binary = !W),
                  ((z instanceof o && z.uncompressedSize === 0) ||
                    I.dir ||
                    !z ||
                    z.length === 0) &&
                    ((I.base64 = !1),
                    (I.binary = !0),
                    (z = ""),
                    (I.compression = "STORE"),
                    (k = "string"));
                var E = null;
                E =
                  z instanceof o || z instanceof i
                    ? z
                    : p.isNode && p.isStream(z)
                    ? new l(_, z)
                    : s.prepareContent(
                        _,
                        z,
                        I.binary,
                        I.optimizedBinaryString,
                        I.base64,
                      );
                var M = new b(_, E, I);
                this.files[_] = M;
              }
              var r = e("./utf8"),
                s = e("./utils"),
                i = e("./stream/GenericWorker"),
                h = e("./stream/StreamHelper"),
                g = e("./defaults"),
                o = e("./compressedObject"),
                b = e("./zipObject"),
                u = e("./generate"),
                p = e("./nodejsUtils"),
                l = e("./nodejs/NodejsStreamInputAdapter"),
                m = function (_) {
                  _.slice(-1) === "/" && (_ = _.substring(0, _.length - 1));
                  var z = _.lastIndexOf("/");
                  return 0 < z ? _.substring(0, z) : "";
                },
                f = function (_) {
                  return _.slice(-1) !== "/" && (_ += "/"), _;
                },
                x = function (_, z) {
                  return (
                    (z = z !== void 0 ? z : g.createFolders),
                    (_ = f(_)),
                    this.files[_] ||
                      n.call(this, _, null, { dir: !0, createFolders: z }),
                    this.files[_]
                  );
                };
              function w(_) {
                return Object.prototype.toString.call(_) === "[object RegExp]";
              }
              var D = {
                load: function () {
                  throw new Error(
                    "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                },
                forEach: function (_) {
                  var z, A, B;
                  for (z in this.files)
                    (B = this.files[z]),
                      (A = z.slice(this.root.length, z.length)) &&
                        z.slice(0, this.root.length) === this.root &&
                        _(A, B);
                },
                filter: function (_) {
                  var z = [];
                  return (
                    this.forEach(function (A, B) {
                      _(A, B) && z.push(B);
                    }),
                    z
                  );
                },
                file: function (_, z, A) {
                  if (arguments.length !== 1)
                    return (_ = this.root + _), n.call(this, _, z, A), this;
                  if (w(_)) {
                    var B = _;
                    return this.filter(function (I, W) {
                      return !W.dir && B.test(I);
                    });
                  }
                  var k = this.files[this.root + _];
                  return k && !k.dir ? k : null;
                },
                folder: function (_) {
                  if (!_) return this;
                  if (w(_))
                    return this.filter(function (k, I) {
                      return I.dir && _.test(k);
                    });
                  var z = this.root + _,
                    A = x.call(this, z),
                    B = this.clone();
                  return (B.root = A.name), B;
                },
                remove: function (_) {
                  _ = this.root + _;
                  var z = this.files[_];
                  if (
                    (z ||
                      (_.slice(-1) !== "/" && (_ += "/"), (z = this.files[_])),
                    z && !z.dir)
                  )
                    delete this.files[_];
                  else
                    for (
                      var A = this.filter(function (k, I) {
                          return I.name.slice(0, _.length) === _;
                        }),
                        B = 0;
                      B < A.length;
                      B++
                    )
                      delete this.files[A[B].name];
                  return this;
                },
                generate: function () {
                  throw new Error(
                    "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                },
                generateInternalStream: function (_) {
                  var z,
                    A = {};
                  try {
                    if (
                      (((A = s.extend(_ || {}, {
                        streamFiles: !1,
                        compression: "STORE",
                        compressionOptions: null,
                        type: "",
                        platform: "DOS",
                        comment: null,
                        mimeType: "application/zip",
                        encodeFileName: r.utf8encode,
                      })).type = A.type.toLowerCase()),
                      (A.compression = A.compression.toUpperCase()),
                      A.type === "binarystring" && (A.type = "string"),
                      !A.type)
                    )
                      throw new Error("No output type specified.");
                    s.checkSupport(A.type),
                      (A.platform !== "darwin" &&
                        A.platform !== "freebsd" &&
                        A.platform !== "linux" &&
                        A.platform !== "sunos") ||
                        (A.platform = "UNIX"),
                      A.platform === "win32" && (A.platform = "DOS");
                    var B = A.comment || this.comment || "";
                    z = u.generateWorker(this, A, B);
                  } catch (k) {
                    (z = new i("error")).error(k);
                  }
                  return new h(z, A.type || "string", A.mimeType);
                },
                generateAsync: function (_, z) {
                  return this.generateInternalStream(_).accumulate(z);
                },
                generateNodeStream: function (_, z) {
                  return (
                    (_ = _ || {}).type || (_.type = "nodebuffer"),
                    this.generateInternalStream(_).toNodejsStream(z)
                  );
                },
              };
              d.exports = D;
            },
            {
              "./compressedObject": 2,
              "./defaults": 5,
              "./generate": 9,
              "./nodejs/NodejsStreamInputAdapter": 12,
              "./nodejsUtils": 14,
              "./stream/GenericWorker": 28,
              "./stream/StreamHelper": 29,
              "./utf8": 31,
              "./utils": 32,
              "./zipObject": 35,
            },
          ],
          16: [
            function (e, d, a) {
              "use strict";
              d.exports = e("stream");
            },
            { stream: void 0 },
          ],
          17: [
            function (e, d, a) {
              "use strict";
              var n = e("./DataReader");
              function r(s) {
                n.call(this, s);
                for (var i = 0; i < this.data.length; i++) s[i] = 255 & s[i];
              }
              e("../utils").inherits(r, n),
                (r.prototype.byteAt = function (s) {
                  return this.data[this.zero + s];
                }),
                (r.prototype.lastIndexOfSignature = function (s) {
                  for (
                    var i = s.charCodeAt(0),
                      h = s.charCodeAt(1),
                      g = s.charCodeAt(2),
                      o = s.charCodeAt(3),
                      b = this.length - 4;
                    0 <= b;
                    --b
                  )
                    if (
                      this.data[b] === i &&
                      this.data[b + 1] === h &&
                      this.data[b + 2] === g &&
                      this.data[b + 3] === o
                    )
                      return b - this.zero;
                  return -1;
                }),
                (r.prototype.readAndCheckSignature = function (s) {
                  var i = s.charCodeAt(0),
                    h = s.charCodeAt(1),
                    g = s.charCodeAt(2),
                    o = s.charCodeAt(3),
                    b = this.readData(4);
                  return i === b[0] && h === b[1] && g === b[2] && o === b[3];
                }),
                (r.prototype.readData = function (s) {
                  if ((this.checkOffset(s), s === 0)) return [];
                  var i = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + s,
                  );
                  return (this.index += s), i;
                }),
                (d.exports = r);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          18: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils");
              function r(s) {
                (this.data = s),
                  (this.length = s.length),
                  (this.index = 0),
                  (this.zero = 0);
              }
              (r.prototype = {
                checkOffset: function (s) {
                  this.checkIndex(this.index + s);
                },
                checkIndex: function (s) {
                  if (this.length < this.zero + s || s < 0)
                    throw new Error(
                      "End of data reached (data length = " +
                        this.length +
                        ", asked index = " +
                        s +
                        "). Corrupted zip ?",
                    );
                },
                setIndex: function (s) {
                  this.checkIndex(s), (this.index = s);
                },
                skip: function (s) {
                  this.setIndex(this.index + s);
                },
                byteAt: function () {},
                readInt: function (s) {
                  var i,
                    h = 0;
                  for (
                    this.checkOffset(s), i = this.index + s - 1;
                    i >= this.index;
                    i--
                  )
                    h = (h << 8) + this.byteAt(i);
                  return (this.index += s), h;
                },
                readString: function (s) {
                  return n.transformTo("string", this.readData(s));
                },
                readData: function () {},
                lastIndexOfSignature: function () {},
                readAndCheckSignature: function () {},
                readDate: function () {
                  var s = this.readInt(4);
                  return new Date(
                    Date.UTC(
                      1980 + ((s >> 25) & 127),
                      ((s >> 21) & 15) - 1,
                      (s >> 16) & 31,
                      (s >> 11) & 31,
                      (s >> 5) & 63,
                      (31 & s) << 1,
                    ),
                  );
                },
              }),
                (d.exports = r);
            },
            { "../utils": 32 },
          ],
          19: [
            function (e, d, a) {
              "use strict";
              var n = e("./Uint8ArrayReader");
              function r(s) {
                n.call(this, s);
              }
              e("../utils").inherits(r, n),
                (r.prototype.readData = function (s) {
                  this.checkOffset(s);
                  var i = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + s,
                  );
                  return (this.index += s), i;
                }),
                (d.exports = r);
            },
            { "../utils": 32, "./Uint8ArrayReader": 21 },
          ],
          20: [
            function (e, d, a) {
              "use strict";
              var n = e("./DataReader");
              function r(s) {
                n.call(this, s);
              }
              e("../utils").inherits(r, n),
                (r.prototype.byteAt = function (s) {
                  return this.data.charCodeAt(this.zero + s);
                }),
                (r.prototype.lastIndexOfSignature = function (s) {
                  return this.data.lastIndexOf(s) - this.zero;
                }),
                (r.prototype.readAndCheckSignature = function (s) {
                  return s === this.readData(4);
                }),
                (r.prototype.readData = function (s) {
                  this.checkOffset(s);
                  var i = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + s,
                  );
                  return (this.index += s), i;
                }),
                (d.exports = r);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          21: [
            function (e, d, a) {
              "use strict";
              var n = e("./ArrayReader");
              function r(s) {
                n.call(this, s);
              }
              e("../utils").inherits(r, n),
                (r.prototype.readData = function (s) {
                  if ((this.checkOffset(s), s === 0)) return new Uint8Array(0);
                  var i = this.data.subarray(
                    this.zero + this.index,
                    this.zero + this.index + s,
                  );
                  return (this.index += s), i;
                }),
                (d.exports = r);
            },
            { "../utils": 32, "./ArrayReader": 17 },
          ],
          22: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils"),
                r = e("../support"),
                s = e("./ArrayReader"),
                i = e("./StringReader"),
                h = e("./NodeBufferReader"),
                g = e("./Uint8ArrayReader");
              d.exports = function (o) {
                var b = n.getTypeOf(o);
                return (
                  n.checkSupport(b),
                  b !== "string" || r.uint8array
                    ? b === "nodebuffer"
                      ? new h(o)
                      : r.uint8array
                      ? new g(n.transformTo("uint8array", o))
                      : new s(n.transformTo("array", o))
                    : new i(o)
                );
              };
            },
            {
              "../support": 30,
              "../utils": 32,
              "./ArrayReader": 17,
              "./NodeBufferReader": 19,
              "./StringReader": 20,
              "./Uint8ArrayReader": 21,
            },
          ],
          23: [
            function (e, d, a) {
              "use strict";
              (a.LOCAL_FILE_HEADER = "PK"),
                (a.CENTRAL_FILE_HEADER = "PK"),
                (a.CENTRAL_DIRECTORY_END = "PK"),
                (a.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07"),
                (a.ZIP64_CENTRAL_DIRECTORY_END = "PK"),
                (a.DATA_DESCRIPTOR = "PK\x07\b");
            },
            {},
          ],
          24: [
            function (e, d, a) {
              "use strict";
              var n = e("./GenericWorker"),
                r = e("../utils");
              function s(i) {
                n.call(this, "ConvertWorker to " + i), (this.destType = i);
              }
              r.inherits(s, n),
                (s.prototype.processChunk = function (i) {
                  this.push({
                    data: r.transformTo(this.destType, i.data),
                    meta: i.meta,
                  });
                }),
                (d.exports = s);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          25: [
            function (e, d, a) {
              "use strict";
              var n = e("./GenericWorker"),
                r = e("../crc32");
              function s() {
                n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              e("../utils").inherits(s, n),
                (s.prototype.processChunk = function (i) {
                  (this.streamInfo.crc32 = r(
                    i.data,
                    this.streamInfo.crc32 || 0,
                  )),
                    this.push(i);
                }),
                (d.exports = s);
            },
            { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 },
          ],
          26: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils"),
                r = e("./GenericWorker");
              function s(i) {
                r.call(this, "DataLengthProbe for " + i),
                  (this.propName = i),
                  this.withStreamInfo(i, 0);
              }
              n.inherits(s, r),
                (s.prototype.processChunk = function (i) {
                  if (i) {
                    var h = this.streamInfo[this.propName] || 0;
                    this.streamInfo[this.propName] = h + i.data.length;
                  }
                  r.prototype.processChunk.call(this, i);
                }),
                (d.exports = s);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          27: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils"),
                r = e("./GenericWorker");
              function s(i) {
                r.call(this, "DataWorker");
                var h = this;
                (this.dataIsReady = !1),
                  (this.index = 0),
                  (this.max = 0),
                  (this.data = null),
                  (this.type = ""),
                  (this._tickScheduled = !1),
                  i.then(
                    function (g) {
                      (h.dataIsReady = !0),
                        (h.data = g),
                        (h.max = (g && g.length) || 0),
                        (h.type = n.getTypeOf(g)),
                        h.isPaused || h._tickAndRepeat();
                    },
                    function (g) {
                      h.error(g);
                    },
                  );
              }
              n.inherits(s, r),
                (s.prototype.cleanUp = function () {
                  r.prototype.cleanUp.call(this), (this.data = null);
                }),
                (s.prototype.resume = function () {
                  return (
                    !!r.prototype.resume.call(this) &&
                    (!this._tickScheduled &&
                      this.dataIsReady &&
                      ((this._tickScheduled = !0),
                      n.delay(this._tickAndRepeat, [], this)),
                    !0)
                  );
                }),
                (s.prototype._tickAndRepeat = function () {
                  (this._tickScheduled = !1),
                    this.isPaused ||
                      this.isFinished ||
                      (this._tick(),
                      this.isFinished ||
                        (n.delay(this._tickAndRepeat, [], this),
                        (this._tickScheduled = !0)));
                }),
                (s.prototype._tick = function () {
                  if (this.isPaused || this.isFinished) return !1;
                  var i = null,
                    h = Math.min(this.max, this.index + 16384);
                  if (this.index >= this.max) return this.end();
                  switch (this.type) {
                    case "string":
                      i = this.data.substring(this.index, h);
                      break;
                    case "uint8array":
                      i = this.data.subarray(this.index, h);
                      break;
                    case "array":
                    case "nodebuffer":
                      i = this.data.slice(this.index, h);
                  }
                  return (
                    (this.index = h),
                    this.push({
                      data: i,
                      meta: {
                        percent: this.max ? (this.index / this.max) * 100 : 0,
                      },
                    })
                  );
                }),
                (d.exports = s);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          28: [
            function (e, d, a) {
              "use strict";
              function n(r) {
                (this.name = r || "default"),
                  (this.streamInfo = {}),
                  (this.generatedError = null),
                  (this.extraStreamInfo = {}),
                  (this.isPaused = !0),
                  (this.isFinished = !1),
                  (this.isLocked = !1),
                  (this._listeners = { data: [], end: [], error: [] }),
                  (this.previous = null);
              }
              (n.prototype = {
                push: function (r) {
                  this.emit("data", r);
                },
                end: function () {
                  if (this.isFinished) return !1;
                  this.flush();
                  try {
                    this.emit("end"), this.cleanUp(), (this.isFinished = !0);
                  } catch (r) {
                    this.emit("error", r);
                  }
                  return !0;
                },
                error: function (r) {
                  return (
                    !this.isFinished &&
                    (this.isPaused
                      ? (this.generatedError = r)
                      : ((this.isFinished = !0),
                        this.emit("error", r),
                        this.previous && this.previous.error(r),
                        this.cleanUp()),
                    !0)
                  );
                },
                on: function (r, s) {
                  return this._listeners[r].push(s), this;
                },
                cleanUp: function () {
                  (this.streamInfo =
                    this.generatedError =
                    this.extraStreamInfo =
                      null),
                    (this._listeners = []);
                },
                emit: function (r, s) {
                  if (this._listeners[r])
                    for (var i = 0; i < this._listeners[r].length; i++)
                      this._listeners[r][i].call(this, s);
                },
                pipe: function (r) {
                  return r.registerPrevious(this);
                },
                registerPrevious: function (r) {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.streamInfo = r.streamInfo),
                    this.mergeStreamInfo(),
                    (this.previous = r);
                  var s = this;
                  return (
                    r.on("data", function (i) {
                      s.processChunk(i);
                    }),
                    r.on("end", function () {
                      s.end();
                    }),
                    r.on("error", function (i) {
                      s.error(i);
                    }),
                    this
                  );
                },
                pause: function () {
                  return (
                    !this.isPaused &&
                    !this.isFinished &&
                    ((this.isPaused = !0),
                    this.previous && this.previous.pause(),
                    !0)
                  );
                },
                resume: function () {
                  if (!this.isPaused || this.isFinished) return !1;
                  var r = (this.isPaused = !1);
                  return (
                    this.generatedError &&
                      (this.error(this.generatedError), (r = !0)),
                    this.previous && this.previous.resume(),
                    !r
                  );
                },
                flush: function () {},
                processChunk: function (r) {
                  this.push(r);
                },
                withStreamInfo: function (r, s) {
                  return (
                    (this.extraStreamInfo[r] = s), this.mergeStreamInfo(), this
                  );
                },
                mergeStreamInfo: function () {
                  for (var r in this.extraStreamInfo)
                    Object.prototype.hasOwnProperty.call(
                      this.extraStreamInfo,
                      r,
                    ) && (this.streamInfo[r] = this.extraStreamInfo[r]);
                },
                lock: function () {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.isLocked = !0), this.previous && this.previous.lock();
                },
                toString: function () {
                  var r = "Worker " + this.name;
                  return this.previous ? this.previous + " -> " + r : r;
                },
              }),
                (d.exports = n);
            },
            {},
          ],
          29: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils"),
                r = e("./ConvertWorker"),
                s = e("./GenericWorker"),
                i = e("../base64"),
                h = e("../support"),
                g = e("../external"),
                o = null;
              if (h.nodestream)
                try {
                  o = e("../nodejs/NodejsStreamOutputAdapter");
                } catch {}
              function b(p, l) {
                return new g.Promise(function (m, f) {
                  var x = [],
                    w = p._internalType,
                    D = p._outputType,
                    _ = p._mimeType;
                  p.on("data", function (z, A) {
                    x.push(z), l && l(A);
                  })
                    .on("error", function (z) {
                      (x = []), f(z);
                    })
                    .on("end", function () {
                      try {
                        var z = (function (A, B, k) {
                          switch (A) {
                            case "blob":
                              return n.newBlob(
                                n.transformTo("arraybuffer", B),
                                k,
                              );
                            case "base64":
                              return i.encode(B);
                            default:
                              return n.transformTo(A, B);
                          }
                        })(
                          D,
                          (function (A, B) {
                            var k,
                              I = 0,
                              W = null,
                              E = 0;
                            for (k = 0; k < B.length; k++) E += B[k].length;
                            switch (A) {
                              case "string":
                                return B.join("");
                              case "array":
                                return Array.prototype.concat.apply([], B);
                              case "uint8array":
                                for (
                                  W = new Uint8Array(E), k = 0;
                                  k < B.length;
                                  k++
                                )
                                  W.set(B[k], I), (I += B[k].length);
                                return W;
                              case "nodebuffer":
                                return Buffer.concat(B);
                              default:
                                throw new Error(
                                  "concat : unsupported type '" + A + "'",
                                );
                            }
                          })(w, x),
                          _,
                        );
                        m(z);
                      } catch (A) {
                        f(A);
                      }
                      x = [];
                    })
                    .resume();
                });
              }
              function u(p, l, m) {
                var f = l;
                switch (l) {
                  case "blob":
                  case "arraybuffer":
                    f = "uint8array";
                    break;
                  case "base64":
                    f = "string";
                }
                try {
                  (this._internalType = f),
                    (this._outputType = l),
                    (this._mimeType = m),
                    n.checkSupport(f),
                    (this._worker = p.pipe(new r(f))),
                    p.lock();
                } catch (x) {
                  (this._worker = new s("error")), this._worker.error(x);
                }
              }
              (u.prototype = {
                accumulate: function (p) {
                  return b(this, p);
                },
                on: function (p, l) {
                  var m = this;
                  return (
                    p === "data"
                      ? this._worker.on(p, function (f) {
                          l.call(m, f.data, f.meta);
                        })
                      : this._worker.on(p, function () {
                          n.delay(l, arguments, m);
                        }),
                    this
                  );
                },
                resume: function () {
                  return n.delay(this._worker.resume, [], this._worker), this;
                },
                pause: function () {
                  return this._worker.pause(), this;
                },
                toNodejsStream: function (p) {
                  if (
                    (n.checkSupport("nodestream"),
                    this._outputType !== "nodebuffer")
                  )
                    throw new Error(
                      this._outputType + " is not supported by this method",
                    );
                  return new o(
                    this,
                    { objectMode: this._outputType !== "nodebuffer" },
                    p,
                  );
                },
              }),
                (d.exports = u);
            },
            {
              "../base64": 1,
              "../external": 6,
              "../nodejs/NodejsStreamOutputAdapter": 13,
              "../support": 30,
              "../utils": 32,
              "./ConvertWorker": 24,
              "./GenericWorker": 28,
            },
          ],
          30: [
            function (e, d, a) {
              "use strict";
              if (
                ((a.base64 = !0),
                (a.array = !0),
                (a.string = !0),
                (a.arraybuffer =
                  typeof ArrayBuffer < "u" && typeof Uint8Array < "u"),
                (a.nodebuffer = typeof Buffer < "u"),
                (a.uint8array = typeof Uint8Array < "u"),
                typeof ArrayBuffer > "u")
              )
                a.blob = !1;
              else {
                var n = new ArrayBuffer(0);
                try {
                  a.blob =
                    new Blob([n], { type: "application/zip" }).size === 0;
                } catch {
                  try {
                    var r = new (self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder)();
                    r.append(n),
                      (a.blob = r.getBlob("application/zip").size === 0);
                  } catch {
                    a.blob = !1;
                  }
                }
              }
              try {
                a.nodestream = !!e("readable-stream").Readable;
              } catch {
                a.nodestream = !1;
              }
            },
            { "readable-stream": 16 },
          ],
          31: [
            function (e, d, a) {
              "use strict";
              for (
                var n = e("./utils"),
                  r = e("./support"),
                  s = e("./nodejsUtils"),
                  i = e("./stream/GenericWorker"),
                  h = new Array(256),
                  g = 0;
                g < 256;
                g++
              )
                h[g] =
                  252 <= g
                    ? 6
                    : 248 <= g
                    ? 5
                    : 240 <= g
                    ? 4
                    : 224 <= g
                    ? 3
                    : 192 <= g
                    ? 2
                    : 1;
              h[254] = h[254] = 1;
              function o() {
                i.call(this, "utf-8 decode"), (this.leftOver = null);
              }
              function b() {
                i.call(this, "utf-8 encode");
              }
              (a.utf8encode = function (u) {
                return r.nodebuffer
                  ? s.newBufferFrom(u, "utf-8")
                  : (function (p) {
                      var l,
                        m,
                        f,
                        x,
                        w,
                        D = p.length,
                        _ = 0;
                      for (x = 0; x < D; x++)
                        (64512 & (m = p.charCodeAt(x))) == 55296 &&
                          x + 1 < D &&
                          (64512 & (f = p.charCodeAt(x + 1))) == 56320 &&
                          ((m = 65536 + ((m - 55296) << 10) + (f - 56320)),
                          x++),
                          (_ += m < 128 ? 1 : m < 2048 ? 2 : m < 65536 ? 3 : 4);
                      for (
                        l = r.uint8array ? new Uint8Array(_) : new Array(_),
                          x = w = 0;
                        w < _;
                        x++
                      )
                        (64512 & (m = p.charCodeAt(x))) == 55296 &&
                          x + 1 < D &&
                          (64512 & (f = p.charCodeAt(x + 1))) == 56320 &&
                          ((m = 65536 + ((m - 55296) << 10) + (f - 56320)),
                          x++),
                          m < 128
                            ? (l[w++] = m)
                            : (m < 2048
                                ? (l[w++] = 192 | (m >>> 6))
                                : (m < 65536
                                    ? (l[w++] = 224 | (m >>> 12))
                                    : ((l[w++] = 240 | (m >>> 18)),
                                      (l[w++] = 128 | ((m >>> 12) & 63))),
                                  (l[w++] = 128 | ((m >>> 6) & 63))),
                              (l[w++] = 128 | (63 & m)));
                      return l;
                    })(u);
              }),
                (a.utf8decode = function (u) {
                  return r.nodebuffer
                    ? n.transformTo("nodebuffer", u).toString("utf-8")
                    : (function (p) {
                        var l,
                          m,
                          f,
                          x,
                          w = p.length,
                          D = new Array(2 * w);
                        for (l = m = 0; l < w; )
                          if ((f = p[l++]) < 128) D[m++] = f;
                          else if (4 < (x = h[f]))
                            (D[m++] = 65533), (l += x - 1);
                          else {
                            for (
                              f &= x === 2 ? 31 : x === 3 ? 15 : 7;
                              1 < x && l < w;

                            )
                              (f = (f << 6) | (63 & p[l++])), x--;
                            1 < x
                              ? (D[m++] = 65533)
                              : f < 65536
                              ? (D[m++] = f)
                              : ((f -= 65536),
                                (D[m++] = 55296 | ((f >> 10) & 1023)),
                                (D[m++] = 56320 | (1023 & f)));
                          }
                        return (
                          D.length !== m &&
                            (D.subarray
                              ? (D = D.subarray(0, m))
                              : (D.length = m)),
                          n.applyFromCharCode(D)
                        );
                      })(
                        (u = n.transformTo(
                          r.uint8array ? "uint8array" : "array",
                          u,
                        )),
                      );
                }),
                n.inherits(o, i),
                (o.prototype.processChunk = function (u) {
                  var p = n.transformTo(
                    r.uint8array ? "uint8array" : "array",
                    u.data,
                  );
                  if (this.leftOver && this.leftOver.length) {
                    if (r.uint8array) {
                      var l = p;
                      (p = new Uint8Array(l.length + this.leftOver.length)).set(
                        this.leftOver,
                        0,
                      ),
                        p.set(l, this.leftOver.length);
                    } else p = this.leftOver.concat(p);
                    this.leftOver = null;
                  }
                  var m = (function (x, w) {
                      var D;
                      for (
                        (w = w || x.length) > x.length && (w = x.length),
                          D = w - 1;
                        0 <= D && (192 & x[D]) == 128;

                      )
                        D--;
                      return D < 0 || D === 0 ? w : D + h[x[D]] > w ? D : w;
                    })(p),
                    f = p;
                  m !== p.length &&
                    (r.uint8array
                      ? ((f = p.subarray(0, m)),
                        (this.leftOver = p.subarray(m, p.length)))
                      : ((f = p.slice(0, m)),
                        (this.leftOver = p.slice(m, p.length)))),
                    this.push({ data: a.utf8decode(f), meta: u.meta });
                }),
                (o.prototype.flush = function () {
                  this.leftOver &&
                    this.leftOver.length &&
                    (this.push({ data: a.utf8decode(this.leftOver), meta: {} }),
                    (this.leftOver = null));
                }),
                (a.Utf8DecodeWorker = o),
                n.inherits(b, i),
                (b.prototype.processChunk = function (u) {
                  this.push({ data: a.utf8encode(u.data), meta: u.meta });
                }),
                (a.Utf8EncodeWorker = b);
            },
            {
              "./nodejsUtils": 14,
              "./stream/GenericWorker": 28,
              "./support": 30,
              "./utils": 32,
            },
          ],
          32: [
            function (e, d, a) {
              "use strict";
              var n = e("./support"),
                r = e("./base64"),
                s = e("./nodejsUtils"),
                i = e("./external");
              function h(l) {
                return l;
              }
              function g(l, m) {
                for (var f = 0; f < l.length; ++f) m[f] = 255 & l.charCodeAt(f);
                return m;
              }
              e("setimmediate"),
                (a.newBlob = function (l, m) {
                  a.checkSupport("blob");
                  try {
                    return new Blob([l], { type: m });
                  } catch {
                    try {
                      var f = new (self.BlobBuilder ||
                        self.WebKitBlobBuilder ||
                        self.MozBlobBuilder ||
                        self.MSBlobBuilder)();
                      return f.append(l), f.getBlob(m);
                    } catch {
                      throw new Error("Bug : can't construct the Blob.");
                    }
                  }
                });
              var o = {
                stringifyByChunk: function (l, m, f) {
                  var x = [],
                    w = 0,
                    D = l.length;
                  if (D <= f) return String.fromCharCode.apply(null, l);
                  for (; w < D; )
                    m === "array" || m === "nodebuffer"
                      ? x.push(
                          String.fromCharCode.apply(
                            null,
                            l.slice(w, Math.min(w + f, D)),
                          ),
                        )
                      : x.push(
                          String.fromCharCode.apply(
                            null,
                            l.subarray(w, Math.min(w + f, D)),
                          ),
                        ),
                      (w += f);
                  return x.join("");
                },
                stringifyByChar: function (l) {
                  for (var m = "", f = 0; f < l.length; f++)
                    m += String.fromCharCode(l[f]);
                  return m;
                },
                applyCanBeUsed: {
                  uint8array: (function () {
                    try {
                      return (
                        n.uint8array &&
                        String.fromCharCode.apply(null, new Uint8Array(1))
                          .length === 1
                      );
                    } catch {
                      return !1;
                    }
                  })(),
                  nodebuffer: (function () {
                    try {
                      return (
                        n.nodebuffer &&
                        String.fromCharCode.apply(null, s.allocBuffer(1))
                          .length === 1
                      );
                    } catch {
                      return !1;
                    }
                  })(),
                },
              };
              function b(l) {
                var m = 65536,
                  f = a.getTypeOf(l),
                  x = !0;
                if (
                  (f === "uint8array"
                    ? (x = o.applyCanBeUsed.uint8array)
                    : f === "nodebuffer" && (x = o.applyCanBeUsed.nodebuffer),
                  x)
                )
                  for (; 1 < m; )
                    try {
                      return o.stringifyByChunk(l, f, m);
                    } catch {
                      m = Math.floor(m / 2);
                    }
                return o.stringifyByChar(l);
              }
              function u(l, m) {
                for (var f = 0; f < l.length; f++) m[f] = l[f];
                return m;
              }
              a.applyFromCharCode = b;
              var p = {};
              (p.string = {
                string: h,
                array: function (l) {
                  return g(l, new Array(l.length));
                },
                arraybuffer: function (l) {
                  return p.string.uint8array(l).buffer;
                },
                uint8array: function (l) {
                  return g(l, new Uint8Array(l.length));
                },
                nodebuffer: function (l) {
                  return g(l, s.allocBuffer(l.length));
                },
              }),
                (p.array = {
                  string: b,
                  array: h,
                  arraybuffer: function (l) {
                    return new Uint8Array(l).buffer;
                  },
                  uint8array: function (l) {
                    return new Uint8Array(l);
                  },
                  nodebuffer: function (l) {
                    return s.newBufferFrom(l);
                  },
                }),
                (p.arraybuffer = {
                  string: function (l) {
                    return b(new Uint8Array(l));
                  },
                  array: function (l) {
                    return u(new Uint8Array(l), new Array(l.byteLength));
                  },
                  arraybuffer: h,
                  uint8array: function (l) {
                    return new Uint8Array(l);
                  },
                  nodebuffer: function (l) {
                    return s.newBufferFrom(new Uint8Array(l));
                  },
                }),
                (p.uint8array = {
                  string: b,
                  array: function (l) {
                    return u(l, new Array(l.length));
                  },
                  arraybuffer: function (l) {
                    return l.buffer;
                  },
                  uint8array: h,
                  nodebuffer: function (l) {
                    return s.newBufferFrom(l);
                  },
                }),
                (p.nodebuffer = {
                  string: b,
                  array: function (l) {
                    return u(l, new Array(l.length));
                  },
                  arraybuffer: function (l) {
                    return p.nodebuffer.uint8array(l).buffer;
                  },
                  uint8array: function (l) {
                    return u(l, new Uint8Array(l.length));
                  },
                  nodebuffer: h,
                }),
                (a.transformTo = function (l, m) {
                  if (((m = m || ""), !l)) return m;
                  a.checkSupport(l);
                  var f = a.getTypeOf(m);
                  return p[f][l](m);
                }),
                (a.resolve = function (l) {
                  for (var m = l.split("/"), f = [], x = 0; x < m.length; x++) {
                    var w = m[x];
                    w === "." ||
                      (w === "" && x !== 0 && x !== m.length - 1) ||
                      (w === ".." ? f.pop() : f.push(w));
                  }
                  return f.join("/");
                }),
                (a.getTypeOf = function (l) {
                  return typeof l == "string"
                    ? "string"
                    : Object.prototype.toString.call(l) === "[object Array]"
                    ? "array"
                    : n.nodebuffer && s.isBuffer(l)
                    ? "nodebuffer"
                    : n.uint8array && l instanceof Uint8Array
                    ? "uint8array"
                    : n.arraybuffer && l instanceof ArrayBuffer
                    ? "arraybuffer"
                    : void 0;
                }),
                (a.checkSupport = function (l) {
                  if (!n[l.toLowerCase()])
                    throw new Error(l + " is not supported by this platform");
                }),
                (a.MAX_VALUE_16BITS = 65535),
                (a.MAX_VALUE_32BITS = -1),
                (a.pretty = function (l) {
                  var m,
                    f,
                    x = "";
                  for (f = 0; f < (l || "").length; f++)
                    x +=
                      "\\x" +
                      ((m = l.charCodeAt(f)) < 16 ? "0" : "") +
                      m.toString(16).toUpperCase();
                  return x;
                }),
                (a.delay = function (l, m, f) {
                  setImmediate(function () {
                    l.apply(f || null, m || []);
                  });
                }),
                (a.inherits = function (l, m) {
                  function f() {}
                  (f.prototype = m.prototype), (l.prototype = new f());
                }),
                (a.extend = function () {
                  var l,
                    m,
                    f = {};
                  for (l = 0; l < arguments.length; l++)
                    for (m in arguments[l])
                      Object.prototype.hasOwnProperty.call(arguments[l], m) &&
                        f[m] === void 0 &&
                        (f[m] = arguments[l][m]);
                  return f;
                }),
                (a.prepareContent = function (l, m, f, x, w) {
                  return i.Promise.resolve(m)
                    .then(function (D) {
                      return n.blob &&
                        (D instanceof Blob ||
                          ["[object File]", "[object Blob]"].indexOf(
                            Object.prototype.toString.call(D),
                          ) !== -1) &&
                        typeof FileReader < "u"
                        ? new i.Promise(function (_, z) {
                            var A = new FileReader();
                            (A.onload = function (B) {
                              _(B.target.result);
                            }),
                              (A.onerror = function (B) {
                                z(B.target.error);
                              }),
                              A.readAsArrayBuffer(D);
                          })
                        : D;
                    })
                    .then(function (D) {
                      var _ = a.getTypeOf(D);
                      return _
                        ? (_ === "arraybuffer"
                            ? (D = a.transformTo("uint8array", D))
                            : _ === "string" &&
                              (w
                                ? (D = r.decode(D))
                                : f &&
                                  x !== !0 &&
                                  (D = (function (z) {
                                    return g(
                                      z,
                                      n.uint8array
                                        ? new Uint8Array(z.length)
                                        : new Array(z.length),
                                    );
                                  })(D))),
                          D)
                        : i.Promise.reject(
                            new Error(
                              "Can't read the data of '" +
                                l +
                                "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?",
                            ),
                          );
                    });
                });
            },
            {
              "./base64": 1,
              "./external": 6,
              "./nodejsUtils": 14,
              "./support": 30,
              setimmediate: 54,
            },
          ],
          33: [
            function (e, d, a) {
              "use strict";
              var n = e("./reader/readerFor"),
                r = e("./utils"),
                s = e("./signature"),
                i = e("./zipEntry"),
                h = e("./support");
              function g(o) {
                (this.files = []), (this.loadOptions = o);
              }
              (g.prototype = {
                checkSignature: function (o) {
                  if (!this.reader.readAndCheckSignature(o)) {
                    this.reader.index -= 4;
                    var b = this.reader.readString(4);
                    throw new Error(
                      "Corrupted zip or bug: unexpected signature (" +
                        r.pretty(b) +
                        ", expected " +
                        r.pretty(o) +
                        ")",
                    );
                  }
                },
                isSignature: function (o, b) {
                  var u = this.reader.index;
                  this.reader.setIndex(o);
                  var p = this.reader.readString(4) === b;
                  return this.reader.setIndex(u), p;
                },
                readBlockEndOfCentral: function () {
                  (this.diskNumber = this.reader.readInt(2)),
                    (this.diskWithCentralDirStart = this.reader.readInt(2)),
                    (this.centralDirRecordsOnThisDisk = this.reader.readInt(2)),
                    (this.centralDirRecords = this.reader.readInt(2)),
                    (this.centralDirSize = this.reader.readInt(4)),
                    (this.centralDirOffset = this.reader.readInt(4)),
                    (this.zipCommentLength = this.reader.readInt(2));
                  var o = this.reader.readData(this.zipCommentLength),
                    b = h.uint8array ? "uint8array" : "array",
                    u = r.transformTo(b, o);
                  this.zipComment = this.loadOptions.decodeFileName(u);
                },
                readBlockZip64EndOfCentral: function () {
                  (this.zip64EndOfCentralSize = this.reader.readInt(8)),
                    this.reader.skip(4),
                    (this.diskNumber = this.reader.readInt(4)),
                    (this.diskWithCentralDirStart = this.reader.readInt(4)),
                    (this.centralDirRecordsOnThisDisk = this.reader.readInt(8)),
                    (this.centralDirRecords = this.reader.readInt(8)),
                    (this.centralDirSize = this.reader.readInt(8)),
                    (this.centralDirOffset = this.reader.readInt(8)),
                    (this.zip64ExtensibleData = {});
                  for (
                    var o, b, u, p = this.zip64EndOfCentralSize - 44;
                    0 < p;

                  )
                    (o = this.reader.readInt(2)),
                      (b = this.reader.readInt(4)),
                      (u = this.reader.readData(b)),
                      (this.zip64ExtensibleData[o] = {
                        id: o,
                        length: b,
                        value: u,
                      });
                },
                readBlockZip64EndOfCentralLocator: function () {
                  if (
                    ((this.diskWithZip64CentralDirStart =
                      this.reader.readInt(4)),
                    (this.relativeOffsetEndOfZip64CentralDir =
                      this.reader.readInt(8)),
                    (this.disksCount = this.reader.readInt(4)),
                    1 < this.disksCount)
                  )
                    throw new Error("Multi-volumes zip are not supported");
                },
                readLocalFiles: function () {
                  var o, b;
                  for (o = 0; o < this.files.length; o++)
                    (b = this.files[o]),
                      this.reader.setIndex(b.localHeaderOffset),
                      this.checkSignature(s.LOCAL_FILE_HEADER),
                      b.readLocalPart(this.reader),
                      b.handleUTF8(),
                      b.processAttributes();
                },
                readCentralDir: function () {
                  var o;
                  for (
                    this.reader.setIndex(this.centralDirOffset);
                    this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);

                  )
                    (o = new i(
                      { zip64: this.zip64 },
                      this.loadOptions,
                    )).readCentralPart(this.reader),
                      this.files.push(o);
                  if (
                    this.centralDirRecords !== this.files.length &&
                    this.centralDirRecords !== 0 &&
                    this.files.length === 0
                  )
                    throw new Error(
                      "Corrupted zip or bug: expected " +
                        this.centralDirRecords +
                        " records in central dir, got " +
                        this.files.length,
                    );
                },
                readEndOfCentral: function () {
                  var o = this.reader.lastIndexOfSignature(
                    s.CENTRAL_DIRECTORY_END,
                  );
                  if (o < 0)
                    throw this.isSignature(0, s.LOCAL_FILE_HEADER)
                      ? new Error(
                          "Corrupted zip: can't find end of central directory",
                        )
                      : new Error(
                          "Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html",
                        );
                  this.reader.setIndex(o);
                  var b = o;
                  if (
                    (this.checkSignature(s.CENTRAL_DIRECTORY_END),
                    this.readBlockEndOfCentral(),
                    this.diskNumber === r.MAX_VALUE_16BITS ||
                      this.diskWithCentralDirStart === r.MAX_VALUE_16BITS ||
                      this.centralDirRecordsOnThisDisk === r.MAX_VALUE_16BITS ||
                      this.centralDirRecords === r.MAX_VALUE_16BITS ||
                      this.centralDirSize === r.MAX_VALUE_32BITS ||
                      this.centralDirOffset === r.MAX_VALUE_32BITS)
                  ) {
                    if (
                      ((this.zip64 = !0),
                      (o = this.reader.lastIndexOfSignature(
                        s.ZIP64_CENTRAL_DIRECTORY_LOCATOR,
                      )) < 0)
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory locator",
                      );
                    if (
                      (this.reader.setIndex(o),
                      this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),
                      this.readBlockZip64EndOfCentralLocator(),
                      !this.isSignature(
                        this.relativeOffsetEndOfZip64CentralDir,
                        s.ZIP64_CENTRAL_DIRECTORY_END,
                      ) &&
                        ((this.relativeOffsetEndOfZip64CentralDir =
                          this.reader.lastIndexOfSignature(
                            s.ZIP64_CENTRAL_DIRECTORY_END,
                          )),
                        this.relativeOffsetEndOfZip64CentralDir < 0))
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory",
                      );
                    this.reader.setIndex(
                      this.relativeOffsetEndOfZip64CentralDir,
                    ),
                      this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),
                      this.readBlockZip64EndOfCentral();
                  }
                  var u = this.centralDirOffset + this.centralDirSize;
                  this.zip64 &&
                    ((u += 20), (u += 12 + this.zip64EndOfCentralSize));
                  var p = b - u;
                  if (0 < p)
                    this.isSignature(b, s.CENTRAL_FILE_HEADER) ||
                      (this.reader.zero = p);
                  else if (p < 0)
                    throw new Error(
                      "Corrupted zip: missing " + Math.abs(p) + " bytes.",
                    );
                },
                prepareReader: function (o) {
                  this.reader = n(o);
                },
                load: function (o) {
                  this.prepareReader(o),
                    this.readEndOfCentral(),
                    this.readCentralDir(),
                    this.readLocalFiles();
                },
              }),
                (d.exports = g);
            },
            {
              "./reader/readerFor": 22,
              "./signature": 23,
              "./support": 30,
              "./utils": 32,
              "./zipEntry": 34,
            },
          ],
          34: [
            function (e, d, a) {
              "use strict";
              var n = e("./reader/readerFor"),
                r = e("./utils"),
                s = e("./compressedObject"),
                i = e("./crc32"),
                h = e("./utf8"),
                g = e("./compressions"),
                o = e("./support");
              function b(u, p) {
                (this.options = u), (this.loadOptions = p);
              }
              (b.prototype = {
                isEncrypted: function () {
                  return (1 & this.bitFlag) == 1;
                },
                useUTF8: function () {
                  return (2048 & this.bitFlag) == 2048;
                },
                readLocalPart: function (u) {
                  var p, l;
                  if (
                    (u.skip(22),
                    (this.fileNameLength = u.readInt(2)),
                    (l = u.readInt(2)),
                    (this.fileName = u.readData(this.fileNameLength)),
                    u.skip(l),
                    this.compressedSize === -1 || this.uncompressedSize === -1)
                  )
                    throw new Error(
                      "Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)",
                    );
                  if (
                    (p = (function (m) {
                      for (var f in g)
                        if (
                          Object.prototype.hasOwnProperty.call(g, f) &&
                          g[f].magic === m
                        )
                          return g[f];
                      return null;
                    })(this.compressionMethod)) === null
                  )
                    throw new Error(
                      "Corrupted zip : compression " +
                        r.pretty(this.compressionMethod) +
                        " unknown (inner file : " +
                        r.transformTo("string", this.fileName) +
                        ")",
                    );
                  this.decompressed = new s(
                    this.compressedSize,
                    this.uncompressedSize,
                    this.crc32,
                    p,
                    u.readData(this.compressedSize),
                  );
                },
                readCentralPart: function (u) {
                  (this.versionMadeBy = u.readInt(2)),
                    u.skip(2),
                    (this.bitFlag = u.readInt(2)),
                    (this.compressionMethod = u.readString(2)),
                    (this.date = u.readDate()),
                    (this.crc32 = u.readInt(4)),
                    (this.compressedSize = u.readInt(4)),
                    (this.uncompressedSize = u.readInt(4));
                  var p = u.readInt(2);
                  if (
                    ((this.extraFieldsLength = u.readInt(2)),
                    (this.fileCommentLength = u.readInt(2)),
                    (this.diskNumberStart = u.readInt(2)),
                    (this.internalFileAttributes = u.readInt(2)),
                    (this.externalFileAttributes = u.readInt(4)),
                    (this.localHeaderOffset = u.readInt(4)),
                    this.isEncrypted())
                  )
                    throw new Error("Encrypted zip are not supported");
                  u.skip(p),
                    this.readExtraFields(u),
                    this.parseZIP64ExtraField(u),
                    (this.fileComment = u.readData(this.fileCommentLength));
                },
                processAttributes: function () {
                  (this.unixPermissions = null), (this.dosPermissions = null);
                  var u = this.versionMadeBy >> 8;
                  (this.dir = !!(16 & this.externalFileAttributes)),
                    u == 0 &&
                      (this.dosPermissions = 63 & this.externalFileAttributes),
                    u == 3 &&
                      (this.unixPermissions =
                        (this.externalFileAttributes >> 16) & 65535),
                    this.dir ||
                      this.fileNameStr.slice(-1) !== "/" ||
                      (this.dir = !0);
                },
                parseZIP64ExtraField: function () {
                  if (this.extraFields[1]) {
                    var u = n(this.extraFields[1].value);
                    this.uncompressedSize === r.MAX_VALUE_32BITS &&
                      (this.uncompressedSize = u.readInt(8)),
                      this.compressedSize === r.MAX_VALUE_32BITS &&
                        (this.compressedSize = u.readInt(8)),
                      this.localHeaderOffset === r.MAX_VALUE_32BITS &&
                        (this.localHeaderOffset = u.readInt(8)),
                      this.diskNumberStart === r.MAX_VALUE_32BITS &&
                        (this.diskNumberStart = u.readInt(4));
                  }
                },
                readExtraFields: function (u) {
                  var p,
                    l,
                    m,
                    f = u.index + this.extraFieldsLength;
                  for (
                    this.extraFields || (this.extraFields = {});
                    u.index + 4 < f;

                  )
                    (p = u.readInt(2)),
                      (l = u.readInt(2)),
                      (m = u.readData(l)),
                      (this.extraFields[p] = { id: p, length: l, value: m });
                  u.setIndex(f);
                },
                handleUTF8: function () {
                  var u = o.uint8array ? "uint8array" : "array";
                  if (this.useUTF8())
                    (this.fileNameStr = h.utf8decode(this.fileName)),
                      (this.fileCommentStr = h.utf8decode(this.fileComment));
                  else {
                    var p = this.findExtraFieldUnicodePath();
                    if (p !== null) this.fileNameStr = p;
                    else {
                      var l = r.transformTo(u, this.fileName);
                      this.fileNameStr = this.loadOptions.decodeFileName(l);
                    }
                    var m = this.findExtraFieldUnicodeComment();
                    if (m !== null) this.fileCommentStr = m;
                    else {
                      var f = r.transformTo(u, this.fileComment);
                      this.fileCommentStr = this.loadOptions.decodeFileName(f);
                    }
                  }
                },
                findExtraFieldUnicodePath: function () {
                  var u = this.extraFields[28789];
                  if (u) {
                    var p = n(u.value);
                    return p.readInt(1) !== 1 ||
                      i(this.fileName) !== p.readInt(4)
                      ? null
                      : h.utf8decode(p.readData(u.length - 5));
                  }
                  return null;
                },
                findExtraFieldUnicodeComment: function () {
                  var u = this.extraFields[25461];
                  if (u) {
                    var p = n(u.value);
                    return p.readInt(1) !== 1 ||
                      i(this.fileComment) !== p.readInt(4)
                      ? null
                      : h.utf8decode(p.readData(u.length - 5));
                  }
                  return null;
                },
              }),
                (d.exports = b);
            },
            {
              "./compressedObject": 2,
              "./compressions": 3,
              "./crc32": 4,
              "./reader/readerFor": 22,
              "./support": 30,
              "./utf8": 31,
              "./utils": 32,
            },
          ],
          35: [
            function (e, d, a) {
              "use strict";
              function n(p, l, m) {
                (this.name = p),
                  (this.dir = m.dir),
                  (this.date = m.date),
                  (this.comment = m.comment),
                  (this.unixPermissions = m.unixPermissions),
                  (this.dosPermissions = m.dosPermissions),
                  (this._data = l),
                  (this._dataBinary = m.binary),
                  (this.options = {
                    compression: m.compression,
                    compressionOptions: m.compressionOptions,
                  });
              }
              var r = e("./stream/StreamHelper"),
                s = e("./stream/DataWorker"),
                i = e("./utf8"),
                h = e("./compressedObject"),
                g = e("./stream/GenericWorker");
              n.prototype = {
                internalStream: function (p) {
                  var l = null,
                    m = "string";
                  try {
                    if (!p) throw new Error("No output type specified.");
                    var f = (m = p.toLowerCase()) === "string" || m === "text";
                    (m !== "binarystring" && m !== "text") || (m = "string"),
                      (l = this._decompressWorker());
                    var x = !this._dataBinary;
                    x && !f && (l = l.pipe(new i.Utf8EncodeWorker())),
                      !x && f && (l = l.pipe(new i.Utf8DecodeWorker()));
                  } catch (w) {
                    (l = new g("error")).error(w);
                  }
                  return new r(l, m, "");
                },
                async: function (p, l) {
                  return this.internalStream(p).accumulate(l);
                },
                nodeStream: function (p, l) {
                  return this.internalStream(p || "nodebuffer").toNodejsStream(
                    l,
                  );
                },
                _compressWorker: function (p, l) {
                  if (
                    this._data instanceof h &&
                    this._data.compression.magic === p.magic
                  )
                    return this._data.getCompressedWorker();
                  var m = this._decompressWorker();
                  return (
                    this._dataBinary || (m = m.pipe(new i.Utf8EncodeWorker())),
                    h.createWorkerFrom(m, p, l)
                  );
                },
                _decompressWorker: function () {
                  return this._data instanceof h
                    ? this._data.getContentWorker()
                    : this._data instanceof g
                    ? this._data
                    : new s(this._data);
                },
              };
              for (
                var o = [
                    "asText",
                    "asBinary",
                    "asNodeBuffer",
                    "asUint8Array",
                    "asArrayBuffer",
                  ],
                  b = function () {
                    throw new Error(
                      "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                    );
                  },
                  u = 0;
                u < o.length;
                u++
              )
                n.prototype[o[u]] = b;
              d.exports = n;
            },
            {
              "./compressedObject": 2,
              "./stream/DataWorker": 27,
              "./stream/GenericWorker": 28,
              "./stream/StreamHelper": 29,
              "./utf8": 31,
            },
          ],
          36: [
            function (e, d, a) {
              (function (n) {
                "use strict";
                var r,
                  s,
                  i = n.MutationObserver || n.WebKitMutationObserver;
                if (i) {
                  var h = 0,
                    g = new i(p),
                    o = n.document.createTextNode("");
                  g.observe(o, { characterData: !0 }),
                    (r = function () {
                      o.data = h = ++h % 2;
                    });
                } else if (n.setImmediate || n.MessageChannel === void 0)
                  r =
                    "document" in n &&
                    "onreadystatechange" in n.document.createElement("script")
                      ? function () {
                          var l = n.document.createElement("script");
                          (l.onreadystatechange = function () {
                            p(),
                              (l.onreadystatechange = null),
                              l.parentNode.removeChild(l),
                              (l = null);
                          }),
                            n.document.documentElement.appendChild(l);
                        }
                      : function () {
                          setTimeout(p, 0);
                        };
                else {
                  var b = new n.MessageChannel();
                  (b.port1.onmessage = p),
                    (r = function () {
                      b.port2.postMessage(0);
                    });
                }
                var u = [];
                function p() {
                  var l, m;
                  s = !0;
                  for (var f = u.length; f; ) {
                    for (m = u, u = [], l = -1; ++l < f; ) m[l]();
                    f = u.length;
                  }
                  s = !1;
                }
                d.exports = function (l) {
                  u.push(l) !== 1 || s || r();
                };
              }).call(
                this,
                typeof global < "u"
                  ? global
                  : typeof self < "u"
                  ? self
                  : typeof window < "u"
                  ? window
                  : {},
              );
            },
            {},
          ],
          37: [
            function (e, d, a) {
              "use strict";
              var n = e("immediate");
              function r() {}
              var s = {},
                i = ["REJECTED"],
                h = ["FULFILLED"],
                g = ["PENDING"];
              function o(f) {
                if (typeof f != "function")
                  throw new TypeError("resolver must be a function");
                (this.state = g),
                  (this.queue = []),
                  (this.outcome = void 0),
                  f !== r && l(this, f);
              }
              function b(f, x, w) {
                (this.promise = f),
                  typeof x == "function" &&
                    ((this.onFulfilled = x),
                    (this.callFulfilled = this.otherCallFulfilled)),
                  typeof w == "function" &&
                    ((this.onRejected = w),
                    (this.callRejected = this.otherCallRejected));
              }
              function u(f, x, w) {
                n(function () {
                  var D;
                  try {
                    D = x(w);
                  } catch (_) {
                    return s.reject(f, _);
                  }
                  D === f
                    ? s.reject(
                        f,
                        new TypeError("Cannot resolve promise with itself"),
                      )
                    : s.resolve(f, D);
                });
              }
              function p(f) {
                var x = f && f.then;
                if (
                  f &&
                  (typeof f == "object" || typeof f == "function") &&
                  typeof x == "function"
                )
                  return function () {
                    x.apply(f, arguments);
                  };
              }
              function l(f, x) {
                var w = !1;
                function D(A) {
                  w || ((w = !0), s.reject(f, A));
                }
                function _(A) {
                  w || ((w = !0), s.resolve(f, A));
                }
                var z = m(function () {
                  x(_, D);
                });
                z.status === "error" && D(z.value);
              }
              function m(f, x) {
                var w = {};
                try {
                  (w.value = f(x)), (w.status = "success");
                } catch (D) {
                  (w.status = "error"), (w.value = D);
                }
                return w;
              }
              ((d.exports = o).prototype.finally = function (f) {
                if (typeof f != "function") return this;
                var x = this.constructor;
                return this.then(
                  function (w) {
                    return x.resolve(f()).then(function () {
                      return w;
                    });
                  },
                  function (w) {
                    return x.resolve(f()).then(function () {
                      throw w;
                    });
                  },
                );
              }),
                (o.prototype.catch = function (f) {
                  return this.then(null, f);
                }),
                (o.prototype.then = function (f, x) {
                  if (
                    (typeof f != "function" && this.state === h) ||
                    (typeof x != "function" && this.state === i)
                  )
                    return this;
                  var w = new this.constructor(r);
                  return (
                    this.state !== g
                      ? u(w, this.state === h ? f : x, this.outcome)
                      : this.queue.push(new b(w, f, x)),
                    w
                  );
                }),
                (b.prototype.callFulfilled = function (f) {
                  s.resolve(this.promise, f);
                }),
                (b.prototype.otherCallFulfilled = function (f) {
                  u(this.promise, this.onFulfilled, f);
                }),
                (b.prototype.callRejected = function (f) {
                  s.reject(this.promise, f);
                }),
                (b.prototype.otherCallRejected = function (f) {
                  u(this.promise, this.onRejected, f);
                }),
                (s.resolve = function (f, x) {
                  var w = m(p, x);
                  if (w.status === "error") return s.reject(f, w.value);
                  var D = w.value;
                  if (D) l(f, D);
                  else {
                    (f.state = h), (f.outcome = x);
                    for (var _ = -1, z = f.queue.length; ++_ < z; )
                      f.queue[_].callFulfilled(x);
                  }
                  return f;
                }),
                (s.reject = function (f, x) {
                  (f.state = i), (f.outcome = x);
                  for (var w = -1, D = f.queue.length; ++w < D; )
                    f.queue[w].callRejected(x);
                  return f;
                }),
                (o.resolve = function (f) {
                  return f instanceof this ? f : s.resolve(new this(r), f);
                }),
                (o.reject = function (f) {
                  var x = new this(r);
                  return s.reject(x, f);
                }),
                (o.all = function (f) {
                  var x = this;
                  if (Object.prototype.toString.call(f) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var w = f.length,
                    D = !1;
                  if (!w) return this.resolve([]);
                  for (
                    var _ = new Array(w), z = 0, A = -1, B = new this(r);
                    ++A < w;

                  )
                    k(f[A], A);
                  return B;
                  function k(I, W) {
                    x.resolve(I).then(
                      function (E) {
                        (_[W] = E),
                          ++z !== w || D || ((D = !0), s.resolve(B, _));
                      },
                      function (E) {
                        D || ((D = !0), s.reject(B, E));
                      },
                    );
                  }
                }),
                (o.race = function (f) {
                  var x = this;
                  if (Object.prototype.toString.call(f) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var w = f.length,
                    D = !1;
                  if (!w) return this.resolve([]);
                  for (var _ = -1, z = new this(r); ++_ < w; )
                    (A = f[_]),
                      x.resolve(A).then(
                        function (B) {
                          D || ((D = !0), s.resolve(z, B));
                        },
                        function (B) {
                          D || ((D = !0), s.reject(z, B));
                        },
                      );
                  var A;
                  return z;
                });
            },
            { immediate: 36 },
          ],
          38: [
            function (e, d, a) {
              "use strict";
              var n = {};
              (0, e("./lib/utils/common").assign)(
                n,
                e("./lib/deflate"),
                e("./lib/inflate"),
                e("./lib/zlib/constants"),
              ),
                (d.exports = n);
            },
            {
              "./lib/deflate": 39,
              "./lib/inflate": 40,
              "./lib/utils/common": 41,
              "./lib/zlib/constants": 44,
            },
          ],
          39: [
            function (e, d, a) {
              "use strict";
              var n = e("./zlib/deflate"),
                r = e("./utils/common"),
                s = e("./utils/strings"),
                i = e("./zlib/messages"),
                h = e("./zlib/zstream"),
                g = Object.prototype.toString,
                o = 0,
                b = -1,
                u = 0,
                p = 8;
              function l(f) {
                if (!(this instanceof l)) return new l(f);
                this.options = r.assign(
                  {
                    level: b,
                    method: p,
                    chunkSize: 16384,
                    windowBits: 15,
                    memLevel: 8,
                    strategy: u,
                    to: "",
                  },
                  f || {},
                );
                var x = this.options;
                x.raw && 0 < x.windowBits
                  ? (x.windowBits = -x.windowBits)
                  : x.gzip &&
                    0 < x.windowBits &&
                    x.windowBits < 16 &&
                    (x.windowBits += 16),
                  (this.err = 0),
                  (this.msg = ""),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new h()),
                  (this.strm.avail_out = 0);
                var w = n.deflateInit2(
                  this.strm,
                  x.level,
                  x.method,
                  x.windowBits,
                  x.memLevel,
                  x.strategy,
                );
                if (w !== o) throw new Error(i[w]);
                if (
                  (x.header && n.deflateSetHeader(this.strm, x.header),
                  x.dictionary)
                ) {
                  var D;
                  if (
                    ((D =
                      typeof x.dictionary == "string"
                        ? s.string2buf(x.dictionary)
                        : g.call(x.dictionary) === "[object ArrayBuffer]"
                        ? new Uint8Array(x.dictionary)
                        : x.dictionary),
                    (w = n.deflateSetDictionary(this.strm, D)) !== o)
                  )
                    throw new Error(i[w]);
                  this._dict_set = !0;
                }
              }
              function m(f, x) {
                var w = new l(x);
                if ((w.push(f, !0), w.err)) throw w.msg || i[w.err];
                return w.result;
              }
              (l.prototype.push = function (f, x) {
                var w,
                  D,
                  _ = this.strm,
                  z = this.options.chunkSize;
                if (this.ended) return !1;
                (D = x === ~~x ? x : x === !0 ? 4 : 0),
                  typeof f == "string"
                    ? (_.input = s.string2buf(f))
                    : g.call(f) === "[object ArrayBuffer]"
                    ? (_.input = new Uint8Array(f))
                    : (_.input = f),
                  (_.next_in = 0),
                  (_.avail_in = _.input.length);
                do {
                  if (
                    (_.avail_out === 0 &&
                      ((_.output = new r.Buf8(z)),
                      (_.next_out = 0),
                      (_.avail_out = z)),
                    (w = n.deflate(_, D)) !== 1 && w !== o)
                  )
                    return this.onEnd(w), !(this.ended = !0);
                  (_.avail_out !== 0 &&
                    (_.avail_in !== 0 || (D !== 4 && D !== 2))) ||
                    (this.options.to === "string"
                      ? this.onData(
                          s.buf2binstring(r.shrinkBuf(_.output, _.next_out)),
                        )
                      : this.onData(r.shrinkBuf(_.output, _.next_out)));
                } while ((0 < _.avail_in || _.avail_out === 0) && w !== 1);
                return D === 4
                  ? ((w = n.deflateEnd(this.strm)),
                    this.onEnd(w),
                    (this.ended = !0),
                    w === o)
                  : D !== 2 || (this.onEnd(o), !(_.avail_out = 0));
              }),
                (l.prototype.onData = function (f) {
                  this.chunks.push(f);
                }),
                (l.prototype.onEnd = function (f) {
                  f === o &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = r.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = f),
                    (this.msg = this.strm.msg);
                }),
                (a.Deflate = l),
                (a.deflate = m),
                (a.deflateRaw = function (f, x) {
                  return ((x = x || {}).raw = !0), m(f, x);
                }),
                (a.gzip = function (f, x) {
                  return ((x = x || {}).gzip = !0), m(f, x);
                });
            },
            {
              "./utils/common": 41,
              "./utils/strings": 42,
              "./zlib/deflate": 46,
              "./zlib/messages": 51,
              "./zlib/zstream": 53,
            },
          ],
          40: [
            function (e, d, a) {
              "use strict";
              var n = e("./zlib/inflate"),
                r = e("./utils/common"),
                s = e("./utils/strings"),
                i = e("./zlib/constants"),
                h = e("./zlib/messages"),
                g = e("./zlib/zstream"),
                o = e("./zlib/gzheader"),
                b = Object.prototype.toString;
              function u(l) {
                if (!(this instanceof u)) return new u(l);
                this.options = r.assign(
                  { chunkSize: 16384, windowBits: 0, to: "" },
                  l || {},
                );
                var m = this.options;
                m.raw &&
                  0 <= m.windowBits &&
                  m.windowBits < 16 &&
                  ((m.windowBits = -m.windowBits),
                  m.windowBits === 0 && (m.windowBits = -15)),
                  !(0 <= m.windowBits && m.windowBits < 16) ||
                    (l && l.windowBits) ||
                    (m.windowBits += 32),
                  15 < m.windowBits &&
                    m.windowBits < 48 &&
                    (15 & m.windowBits) == 0 &&
                    (m.windowBits |= 15),
                  (this.err = 0),
                  (this.msg = ""),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new g()),
                  (this.strm.avail_out = 0);
                var f = n.inflateInit2(this.strm, m.windowBits);
                if (f !== i.Z_OK) throw new Error(h[f]);
                (this.header = new o()),
                  n.inflateGetHeader(this.strm, this.header);
              }
              function p(l, m) {
                var f = new u(m);
                if ((f.push(l, !0), f.err)) throw f.msg || h[f.err];
                return f.result;
              }
              (u.prototype.push = function (l, m) {
                var f,
                  x,
                  w,
                  D,
                  _,
                  z,
                  A = this.strm,
                  B = this.options.chunkSize,
                  k = this.options.dictionary,
                  I = !1;
                if (this.ended) return !1;
                (x = m === ~~m ? m : m === !0 ? i.Z_FINISH : i.Z_NO_FLUSH),
                  typeof l == "string"
                    ? (A.input = s.binstring2buf(l))
                    : b.call(l) === "[object ArrayBuffer]"
                    ? (A.input = new Uint8Array(l))
                    : (A.input = l),
                  (A.next_in = 0),
                  (A.avail_in = A.input.length);
                do {
                  if (
                    (A.avail_out === 0 &&
                      ((A.output = new r.Buf8(B)),
                      (A.next_out = 0),
                      (A.avail_out = B)),
                    (f = n.inflate(A, i.Z_NO_FLUSH)) === i.Z_NEED_DICT &&
                      k &&
                      ((z =
                        typeof k == "string"
                          ? s.string2buf(k)
                          : b.call(k) === "[object ArrayBuffer]"
                          ? new Uint8Array(k)
                          : k),
                      (f = n.inflateSetDictionary(this.strm, z))),
                    f === i.Z_BUF_ERROR && I === !0 && ((f = i.Z_OK), (I = !1)),
                    f !== i.Z_STREAM_END && f !== i.Z_OK)
                  )
                    return this.onEnd(f), !(this.ended = !0);
                  A.next_out &&
                    ((A.avail_out !== 0 &&
                      f !== i.Z_STREAM_END &&
                      (A.avail_in !== 0 ||
                        (x !== i.Z_FINISH && x !== i.Z_SYNC_FLUSH))) ||
                      (this.options.to === "string"
                        ? ((w = s.utf8border(A.output, A.next_out)),
                          (D = A.next_out - w),
                          (_ = s.buf2string(A.output, w)),
                          (A.next_out = D),
                          (A.avail_out = B - D),
                          D && r.arraySet(A.output, A.output, w, D, 0),
                          this.onData(_))
                        : this.onData(r.shrinkBuf(A.output, A.next_out)))),
                    A.avail_in === 0 && A.avail_out === 0 && (I = !0);
                } while (
                  (0 < A.avail_in || A.avail_out === 0) &&
                  f !== i.Z_STREAM_END
                );
                return (
                  f === i.Z_STREAM_END && (x = i.Z_FINISH),
                  x === i.Z_FINISH
                    ? ((f = n.inflateEnd(this.strm)),
                      this.onEnd(f),
                      (this.ended = !0),
                      f === i.Z_OK)
                    : x !== i.Z_SYNC_FLUSH ||
                      (this.onEnd(i.Z_OK), !(A.avail_out = 0))
                );
              }),
                (u.prototype.onData = function (l) {
                  this.chunks.push(l);
                }),
                (u.prototype.onEnd = function (l) {
                  l === i.Z_OK &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = r.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = l),
                    (this.msg = this.strm.msg);
                }),
                (a.Inflate = u),
                (a.inflate = p),
                (a.inflateRaw = function (l, m) {
                  return ((m = m || {}).raw = !0), p(l, m);
                }),
                (a.ungzip = p);
            },
            {
              "./utils/common": 41,
              "./utils/strings": 42,
              "./zlib/constants": 44,
              "./zlib/gzheader": 47,
              "./zlib/inflate": 49,
              "./zlib/messages": 51,
              "./zlib/zstream": 53,
            },
          ],
          41: [
            function (e, d, a) {
              "use strict";
              var n =
                typeof Uint8Array < "u" &&
                typeof Uint16Array < "u" &&
                typeof Int32Array < "u";
              (a.assign = function (i) {
                for (
                  var h = Array.prototype.slice.call(arguments, 1);
                  h.length;

                ) {
                  var g = h.shift();
                  if (g) {
                    if (typeof g != "object")
                      throw new TypeError(g + "must be non-object");
                    for (var o in g) g.hasOwnProperty(o) && (i[o] = g[o]);
                  }
                }
                return i;
              }),
                (a.shrinkBuf = function (i, h) {
                  return i.length === h
                    ? i
                    : i.subarray
                    ? i.subarray(0, h)
                    : ((i.length = h), i);
                });
              var r = {
                  arraySet: function (i, h, g, o, b) {
                    if (h.subarray && i.subarray)
                      i.set(h.subarray(g, g + o), b);
                    else for (var u = 0; u < o; u++) i[b + u] = h[g + u];
                  },
                  flattenChunks: function (i) {
                    var h, g, o, b, u, p;
                    for (h = o = 0, g = i.length; h < g; h++) o += i[h].length;
                    for (
                      p = new Uint8Array(o), h = b = 0, g = i.length;
                      h < g;
                      h++
                    )
                      (u = i[h]), p.set(u, b), (b += u.length);
                    return p;
                  },
                },
                s = {
                  arraySet: function (i, h, g, o, b) {
                    for (var u = 0; u < o; u++) i[b + u] = h[g + u];
                  },
                  flattenChunks: function (i) {
                    return [].concat.apply([], i);
                  },
                };
              (a.setTyped = function (i) {
                i
                  ? ((a.Buf8 = Uint8Array),
                    (a.Buf16 = Uint16Array),
                    (a.Buf32 = Int32Array),
                    a.assign(a, r))
                  : ((a.Buf8 = Array),
                    (a.Buf16 = Array),
                    (a.Buf32 = Array),
                    a.assign(a, s));
              }),
                a.setTyped(n);
            },
            {},
          ],
          42: [
            function (e, d, a) {
              "use strict";
              var n = e("./common"),
                r = !0,
                s = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                r = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                s = !1;
              }
              for (var i = new n.Buf8(256), h = 0; h < 256; h++)
                i[h] =
                  252 <= h
                    ? 6
                    : 248 <= h
                    ? 5
                    : 240 <= h
                    ? 4
                    : 224 <= h
                    ? 3
                    : 192 <= h
                    ? 2
                    : 1;
              function g(o, b) {
                if (b < 65537 && ((o.subarray && s) || (!o.subarray && r)))
                  return String.fromCharCode.apply(null, n.shrinkBuf(o, b));
                for (var u = "", p = 0; p < b; p++)
                  u += String.fromCharCode(o[p]);
                return u;
              }
              (i[254] = i[254] = 1),
                (a.string2buf = function (o) {
                  var b,
                    u,
                    p,
                    l,
                    m,
                    f = o.length,
                    x = 0;
                  for (l = 0; l < f; l++)
                    (64512 & (u = o.charCodeAt(l))) == 55296 &&
                      l + 1 < f &&
                      (64512 & (p = o.charCodeAt(l + 1))) == 56320 &&
                      ((u = 65536 + ((u - 55296) << 10) + (p - 56320)), l++),
                      (x += u < 128 ? 1 : u < 2048 ? 2 : u < 65536 ? 3 : 4);
                  for (b = new n.Buf8(x), l = m = 0; m < x; l++)
                    (64512 & (u = o.charCodeAt(l))) == 55296 &&
                      l + 1 < f &&
                      (64512 & (p = o.charCodeAt(l + 1))) == 56320 &&
                      ((u = 65536 + ((u - 55296) << 10) + (p - 56320)), l++),
                      u < 128
                        ? (b[m++] = u)
                        : (u < 2048
                            ? (b[m++] = 192 | (u >>> 6))
                            : (u < 65536
                                ? (b[m++] = 224 | (u >>> 12))
                                : ((b[m++] = 240 | (u >>> 18)),
                                  (b[m++] = 128 | ((u >>> 12) & 63))),
                              (b[m++] = 128 | ((u >>> 6) & 63))),
                          (b[m++] = 128 | (63 & u)));
                  return b;
                }),
                (a.buf2binstring = function (o) {
                  return g(o, o.length);
                }),
                (a.binstring2buf = function (o) {
                  for (
                    var b = new n.Buf8(o.length), u = 0, p = b.length;
                    u < p;
                    u++
                  )
                    b[u] = o.charCodeAt(u);
                  return b;
                }),
                (a.buf2string = function (o, b) {
                  var u,
                    p,
                    l,
                    m,
                    f = b || o.length,
                    x = new Array(2 * f);
                  for (u = p = 0; u < f; )
                    if ((l = o[u++]) < 128) x[p++] = l;
                    else if (4 < (m = i[l])) (x[p++] = 65533), (u += m - 1);
                    else {
                      for (
                        l &= m === 2 ? 31 : m === 3 ? 15 : 7;
                        1 < m && u < f;

                      )
                        (l = (l << 6) | (63 & o[u++])), m--;
                      1 < m
                        ? (x[p++] = 65533)
                        : l < 65536
                        ? (x[p++] = l)
                        : ((l -= 65536),
                          (x[p++] = 55296 | ((l >> 10) & 1023)),
                          (x[p++] = 56320 | (1023 & l)));
                    }
                  return g(x, p);
                }),
                (a.utf8border = function (o, b) {
                  var u;
                  for (
                    (b = b || o.length) > o.length && (b = o.length), u = b - 1;
                    0 <= u && (192 & o[u]) == 128;

                  )
                    u--;
                  return u < 0 || u === 0 ? b : u + i[o[u]] > b ? u : b;
                });
            },
            { "./common": 41 },
          ],
          43: [
            function (e, d, a) {
              "use strict";
              d.exports = function (n, r, s, i) {
                for (
                  var h = (65535 & n) | 0, g = ((n >>> 16) & 65535) | 0, o = 0;
                  s !== 0;

                ) {
                  for (
                    s -= o = 2e3 < s ? 2e3 : s;
                    (g = (g + (h = (h + r[i++]) | 0)) | 0), --o;

                  );
                  (h %= 65521), (g %= 65521);
                }
                return h | (g << 16) | 0;
              };
            },
            {},
          ],
          44: [
            function (e, d, a) {
              "use strict";
              d.exports = {
                Z_NO_FLUSH: 0,
                Z_PARTIAL_FLUSH: 1,
                Z_SYNC_FLUSH: 2,
                Z_FULL_FLUSH: 3,
                Z_FINISH: 4,
                Z_BLOCK: 5,
                Z_TREES: 6,
                Z_OK: 0,
                Z_STREAM_END: 1,
                Z_NEED_DICT: 2,
                Z_ERRNO: -1,
                Z_STREAM_ERROR: -2,
                Z_DATA_ERROR: -3,
                Z_BUF_ERROR: -5,
                Z_NO_COMPRESSION: 0,
                Z_BEST_SPEED: 1,
                Z_BEST_COMPRESSION: 9,
                Z_DEFAULT_COMPRESSION: -1,
                Z_FILTERED: 1,
                Z_HUFFMAN_ONLY: 2,
                Z_RLE: 3,
                Z_FIXED: 4,
                Z_DEFAULT_STRATEGY: 0,
                Z_BINARY: 0,
                Z_TEXT: 1,
                Z_UNKNOWN: 2,
                Z_DEFLATED: 8,
              };
            },
            {},
          ],
          45: [
            function (e, d, a) {
              "use strict";
              var n = (function () {
                for (var r, s = [], i = 0; i < 256; i++) {
                  r = i;
                  for (var h = 0; h < 8; h++)
                    r = 1 & r ? 3988292384 ^ (r >>> 1) : r >>> 1;
                  s[i] = r;
                }
                return s;
              })();
              d.exports = function (r, s, i, h) {
                var g = n,
                  o = h + i;
                r ^= -1;
                for (var b = h; b < o; b++) r = (r >>> 8) ^ g[255 & (r ^ s[b])];
                return -1 ^ r;
              };
            },
            {},
          ],
          46: [
            function (e, d, a) {
              "use strict";
              var n,
                r = e("../utils/common"),
                s = e("./trees"),
                i = e("./adler32"),
                h = e("./crc32"),
                g = e("./messages"),
                o = 0,
                b = 4,
                u = 0,
                p = -2,
                l = -1,
                m = 4,
                f = 2,
                x = 8,
                w = 9,
                D = 286,
                _ = 30,
                z = 19,
                A = 2 * D + 1,
                B = 15,
                k = 3,
                I = 258,
                W = I + k + 1,
                E = 42,
                M = 113,
                c = 1,
                T = 2,
                U = 3,
                C = 4;
              function Y(t, N) {
                return (t.msg = g[N]), N;
              }
              function L(t) {
                return (t << 1) - (4 < t ? 9 : 0);
              }
              function Z(t) {
                for (var N = t.length; 0 <= --N; ) t[N] = 0;
              }
              function $(t) {
                var N = t.state,
                  F = N.pending;
                F > t.avail_out && (F = t.avail_out),
                  F !== 0 &&
                    (r.arraySet(
                      t.output,
                      N.pending_buf,
                      N.pending_out,
                      F,
                      t.next_out,
                    ),
                    (t.next_out += F),
                    (N.pending_out += F),
                    (t.total_out += F),
                    (t.avail_out -= F),
                    (N.pending -= F),
                    N.pending === 0 && (N.pending_out = 0));
              }
              function R(t, N) {
                s._tr_flush_block(
                  t,
                  0 <= t.block_start ? t.block_start : -1,
                  t.strstart - t.block_start,
                  N,
                ),
                  (t.block_start = t.strstart),
                  $(t.strm);
              }
              function V(t, N) {
                t.pending_buf[t.pending++] = N;
              }
              function H(t, N) {
                (t.pending_buf[t.pending++] = (N >>> 8) & 255),
                  (t.pending_buf[t.pending++] = 255 & N);
              }
              function j(t, N) {
                var F,
                  v,
                  y = t.max_chain_length,
                  S = t.strstart,
                  X = t.prev_length,
                  O = t.nice_match,
                  P =
                    t.strstart > t.w_size - W ? t.strstart - (t.w_size - W) : 0,
                  q = t.window,
                  J = t.w_mask,
                  G = t.prev,
                  ne = t.strstart + I,
                  de = q[S + X - 1],
                  le = q[S + X];
                t.prev_length >= t.good_match && (y >>= 2),
                  O > t.lookahead && (O = t.lookahead);
                do
                  if (
                    q[(F = N) + X] === le &&
                    q[F + X - 1] === de &&
                    q[F] === q[S] &&
                    q[++F] === q[S + 1]
                  ) {
                    (S += 2), F++;
                    do;
                    while (
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      q[++S] === q[++F] &&
                      S < ne
                    );
                    if (((v = I - (ne - S)), (S = ne - I), X < v)) {
                      if (((t.match_start = N), O <= (X = v))) break;
                      (de = q[S + X - 1]), (le = q[S + X]);
                    }
                  }
                while ((N = G[N & J]) > P && --y != 0);
                return X <= t.lookahead ? X : t.lookahead;
              }
              function ae(t) {
                var N,
                  F,
                  v,
                  y,
                  S,
                  X,
                  O,
                  P,
                  q,
                  J,
                  G = t.w_size;
                do {
                  if (
                    ((y = t.window_size - t.lookahead - t.strstart),
                    t.strstart >= G + (G - W))
                  ) {
                    for (
                      r.arraySet(t.window, t.window, G, G, 0),
                        t.match_start -= G,
                        t.strstart -= G,
                        t.block_start -= G,
                        N = F = t.hash_size;
                      (v = t.head[--N]), (t.head[N] = G <= v ? v - G : 0), --F;

                    );
                    for (
                      N = F = G;
                      (v = t.prev[--N]), (t.prev[N] = G <= v ? v - G : 0), --F;

                    );
                    y += G;
                  }
                  if (t.strm.avail_in === 0) break;
                  if (
                    ((X = t.strm),
                    (O = t.window),
                    (P = t.strstart + t.lookahead),
                    (q = y),
                    (J = void 0),
                    (J = X.avail_in),
                    q < J && (J = q),
                    (F =
                      J === 0
                        ? 0
                        : ((X.avail_in -= J),
                          r.arraySet(O, X.input, X.next_in, J, P),
                          X.state.wrap === 1
                            ? (X.adler = i(X.adler, O, J, P))
                            : X.state.wrap === 2 &&
                              (X.adler = h(X.adler, O, J, P)),
                          (X.next_in += J),
                          (X.total_in += J),
                          J)),
                    (t.lookahead += F),
                    t.lookahead + t.insert >= k)
                  )
                    for (
                      S = t.strstart - t.insert,
                        t.ins_h = t.window[S],
                        t.ins_h =
                          ((t.ins_h << t.hash_shift) ^ t.window[S + 1]) &
                          t.hash_mask;
                      t.insert &&
                      ((t.ins_h =
                        ((t.ins_h << t.hash_shift) ^ t.window[S + k - 1]) &
                        t.hash_mask),
                      (t.prev[S & t.w_mask] = t.head[t.ins_h]),
                      (t.head[t.ins_h] = S),
                      S++,
                      t.insert--,
                      !(t.lookahead + t.insert < k));

                    );
                } while (t.lookahead < W && t.strm.avail_in !== 0);
              }
              function oe(t, N) {
                for (var F, v; ; ) {
                  if (t.lookahead < W) {
                    if ((ae(t), t.lookahead < W && N === o)) return c;
                    if (t.lookahead === 0) break;
                  }
                  if (
                    ((F = 0),
                    t.lookahead >= k &&
                      ((t.ins_h =
                        ((t.ins_h << t.hash_shift) ^
                          t.window[t.strstart + k - 1]) &
                        t.hash_mask),
                      (F = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h]),
                      (t.head[t.ins_h] = t.strstart)),
                    F !== 0 &&
                      t.strstart - F <= t.w_size - W &&
                      (t.match_length = j(t, F)),
                    t.match_length >= k)
                  )
                    if (
                      ((v = s._tr_tally(
                        t,
                        t.strstart - t.match_start,
                        t.match_length - k,
                      )),
                      (t.lookahead -= t.match_length),
                      t.match_length <= t.max_lazy_match && t.lookahead >= k)
                    ) {
                      for (
                        t.match_length--;
                        t.strstart++,
                          (t.ins_h =
                            ((t.ins_h << t.hash_shift) ^
                              t.window[t.strstart + k - 1]) &
                            t.hash_mask),
                          (F = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h]),
                          (t.head[t.ins_h] = t.strstart),
                          --t.match_length != 0;

                      );
                      t.strstart++;
                    } else
                      (t.strstart += t.match_length),
                        (t.match_length = 0),
                        (t.ins_h = t.window[t.strstart]),
                        (t.ins_h =
                          ((t.ins_h << t.hash_shift) ^
                            t.window[t.strstart + 1]) &
                          t.hash_mask);
                  else
                    (v = s._tr_tally(t, 0, t.window[t.strstart])),
                      t.lookahead--,
                      t.strstart++;
                  if (v && (R(t, !1), t.strm.avail_out === 0)) return c;
                }
                return (
                  (t.insert = t.strstart < k - 1 ? t.strstart : k - 1),
                  N === b
                    ? (R(t, !0), t.strm.avail_out === 0 ? U : C)
                    : t.last_lit && (R(t, !1), t.strm.avail_out === 0)
                    ? c
                    : T
                );
              }
              function te(t, N) {
                for (var F, v, y; ; ) {
                  if (t.lookahead < W) {
                    if ((ae(t), t.lookahead < W && N === o)) return c;
                    if (t.lookahead === 0) break;
                  }
                  if (
                    ((F = 0),
                    t.lookahead >= k &&
                      ((t.ins_h =
                        ((t.ins_h << t.hash_shift) ^
                          t.window[t.strstart + k - 1]) &
                        t.hash_mask),
                      (F = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h]),
                      (t.head[t.ins_h] = t.strstart)),
                    (t.prev_length = t.match_length),
                    (t.prev_match = t.match_start),
                    (t.match_length = k - 1),
                    F !== 0 &&
                      t.prev_length < t.max_lazy_match &&
                      t.strstart - F <= t.w_size - W &&
                      ((t.match_length = j(t, F)),
                      t.match_length <= 5 &&
                        (t.strategy === 1 ||
                          (t.match_length === k &&
                            4096 < t.strstart - t.match_start)) &&
                        (t.match_length = k - 1)),
                    t.prev_length >= k && t.match_length <= t.prev_length)
                  ) {
                    for (
                      y = t.strstart + t.lookahead - k,
                        v = s._tr_tally(
                          t,
                          t.strstart - 1 - t.prev_match,
                          t.prev_length - k,
                        ),
                        t.lookahead -= t.prev_length - 1,
                        t.prev_length -= 2;
                      ++t.strstart <= y &&
                        ((t.ins_h =
                          ((t.ins_h << t.hash_shift) ^
                            t.window[t.strstart + k - 1]) &
                          t.hash_mask),
                        (F = t.prev[t.strstart & t.w_mask] = t.head[t.ins_h]),
                        (t.head[t.ins_h] = t.strstart)),
                        --t.prev_length != 0;

                    );
                    if (
                      ((t.match_available = 0),
                      (t.match_length = k - 1),
                      t.strstart++,
                      v && (R(t, !1), t.strm.avail_out === 0))
                    )
                      return c;
                  } else if (t.match_available) {
                    if (
                      ((v = s._tr_tally(t, 0, t.window[t.strstart - 1])) &&
                        R(t, !1),
                      t.strstart++,
                      t.lookahead--,
                      t.strm.avail_out === 0)
                    )
                      return c;
                  } else (t.match_available = 1), t.strstart++, t.lookahead--;
                }
                return (
                  t.match_available &&
                    ((v = s._tr_tally(t, 0, t.window[t.strstart - 1])),
                    (t.match_available = 0)),
                  (t.insert = t.strstart < k - 1 ? t.strstart : k - 1),
                  N === b
                    ? (R(t, !0), t.strm.avail_out === 0 ? U : C)
                    : t.last_lit && (R(t, !1), t.strm.avail_out === 0)
                    ? c
                    : T
                );
              }
              function se(t, N, F, v, y) {
                (this.good_length = t),
                  (this.max_lazy = N),
                  (this.nice_length = F),
                  (this.max_chain = v),
                  (this.func = y);
              }
              function K() {
                (this.strm = null),
                  (this.status = 0),
                  (this.pending_buf = null),
                  (this.pending_buf_size = 0),
                  (this.pending_out = 0),
                  (this.pending = 0),
                  (this.wrap = 0),
                  (this.gzhead = null),
                  (this.gzindex = 0),
                  (this.method = x),
                  (this.last_flush = -1),
                  (this.w_size = 0),
                  (this.w_bits = 0),
                  (this.w_mask = 0),
                  (this.window = null),
                  (this.window_size = 0),
                  (this.prev = null),
                  (this.head = null),
                  (this.ins_h = 0),
                  (this.hash_size = 0),
                  (this.hash_bits = 0),
                  (this.hash_mask = 0),
                  (this.hash_shift = 0),
                  (this.block_start = 0),
                  (this.match_length = 0),
                  (this.prev_match = 0),
                  (this.match_available = 0),
                  (this.strstart = 0),
                  (this.match_start = 0),
                  (this.lookahead = 0),
                  (this.prev_length = 0),
                  (this.max_chain_length = 0),
                  (this.max_lazy_match = 0),
                  (this.level = 0),
                  (this.strategy = 0),
                  (this.good_match = 0),
                  (this.nice_match = 0),
                  (this.dyn_ltree = new r.Buf16(2 * A)),
                  (this.dyn_dtree = new r.Buf16(2 * (2 * _ + 1))),
                  (this.bl_tree = new r.Buf16(2 * (2 * z + 1))),
                  Z(this.dyn_ltree),
                  Z(this.dyn_dtree),
                  Z(this.bl_tree),
                  (this.l_desc = null),
                  (this.d_desc = null),
                  (this.bl_desc = null),
                  (this.bl_count = new r.Buf16(B + 1)),
                  (this.heap = new r.Buf16(2 * D + 1)),
                  Z(this.heap),
                  (this.heap_len = 0),
                  (this.heap_max = 0),
                  (this.depth = new r.Buf16(2 * D + 1)),
                  Z(this.depth),
                  (this.l_buf = 0),
                  (this.lit_bufsize = 0),
                  (this.last_lit = 0),
                  (this.d_buf = 0),
                  (this.opt_len = 0),
                  (this.static_len = 0),
                  (this.matches = 0),
                  (this.insert = 0),
                  (this.bi_buf = 0),
                  (this.bi_valid = 0);
              }
              function Q(t) {
                var N;
                return t && t.state
                  ? ((t.total_in = t.total_out = 0),
                    (t.data_type = f),
                    ((N = t.state).pending = 0),
                    (N.pending_out = 0),
                    N.wrap < 0 && (N.wrap = -N.wrap),
                    (N.status = N.wrap ? E : M),
                    (t.adler = N.wrap === 2 ? 0 : 1),
                    (N.last_flush = o),
                    s._tr_init(N),
                    u)
                  : Y(t, p);
              }
              function ce(t) {
                var N = Q(t);
                return (
                  N === u &&
                    (function (F) {
                      (F.window_size = 2 * F.w_size),
                        Z(F.head),
                        (F.max_lazy_match = n[F.level].max_lazy),
                        (F.good_match = n[F.level].good_length),
                        (F.nice_match = n[F.level].nice_length),
                        (F.max_chain_length = n[F.level].max_chain),
                        (F.strstart = 0),
                        (F.block_start = 0),
                        (F.lookahead = 0),
                        (F.insert = 0),
                        (F.match_length = F.prev_length = k - 1),
                        (F.match_available = 0),
                        (F.ins_h = 0);
                    })(t.state),
                  N
                );
              }
              function he(t, N, F, v, y, S) {
                if (!t) return p;
                var X = 1;
                if (
                  (N === l && (N = 6),
                  v < 0 ? ((X = 0), (v = -v)) : 15 < v && ((X = 2), (v -= 16)),
                  y < 1 ||
                    w < y ||
                    F !== x ||
                    v < 8 ||
                    15 < v ||
                    N < 0 ||
                    9 < N ||
                    S < 0 ||
                    m < S)
                )
                  return Y(t, p);
                v === 8 && (v = 9);
                var O = new K();
                return (
                  ((t.state = O).strm = t),
                  (O.wrap = X),
                  (O.gzhead = null),
                  (O.w_bits = v),
                  (O.w_size = 1 << O.w_bits),
                  (O.w_mask = O.w_size - 1),
                  (O.hash_bits = y + 7),
                  (O.hash_size = 1 << O.hash_bits),
                  (O.hash_mask = O.hash_size - 1),
                  (O.hash_shift = ~~((O.hash_bits + k - 1) / k)),
                  (O.window = new r.Buf8(2 * O.w_size)),
                  (O.head = new r.Buf16(O.hash_size)),
                  (O.prev = new r.Buf16(O.w_size)),
                  (O.lit_bufsize = 1 << (y + 6)),
                  (O.pending_buf_size = 4 * O.lit_bufsize),
                  (O.pending_buf = new r.Buf8(O.pending_buf_size)),
                  (O.d_buf = 1 * O.lit_bufsize),
                  (O.l_buf = 3 * O.lit_bufsize),
                  (O.level = N),
                  (O.strategy = S),
                  (O.method = F),
                  ce(t)
                );
              }
              (n = [
                new se(0, 0, 0, 0, function (t, N) {
                  var F = 65535;
                  for (
                    F > t.pending_buf_size - 5 && (F = t.pending_buf_size - 5);
                    ;

                  ) {
                    if (t.lookahead <= 1) {
                      if ((ae(t), t.lookahead === 0 && N === o)) return c;
                      if (t.lookahead === 0) break;
                    }
                    (t.strstart += t.lookahead), (t.lookahead = 0);
                    var v = t.block_start + F;
                    if (
                      ((t.strstart === 0 || t.strstart >= v) &&
                        ((t.lookahead = t.strstart - v),
                        (t.strstart = v),
                        R(t, !1),
                        t.strm.avail_out === 0)) ||
                      (t.strstart - t.block_start >= t.w_size - W &&
                        (R(t, !1), t.strm.avail_out === 0))
                    )
                      return c;
                  }
                  return (
                    (t.insert = 0),
                    N === b
                      ? (R(t, !0), t.strm.avail_out === 0 ? U : C)
                      : (t.strstart > t.block_start &&
                          (R(t, !1), t.strm.avail_out),
                        c)
                  );
                }),
                new se(4, 4, 8, 4, oe),
                new se(4, 5, 16, 8, oe),
                new se(4, 6, 32, 32, oe),
                new se(4, 4, 16, 16, te),
                new se(8, 16, 32, 32, te),
                new se(8, 16, 128, 128, te),
                new se(8, 32, 128, 256, te),
                new se(32, 128, 258, 1024, te),
                new se(32, 258, 258, 4096, te),
              ]),
                (a.deflateInit = function (t, N) {
                  return he(t, N, x, 15, 8, 0);
                }),
                (a.deflateInit2 = he),
                (a.deflateReset = ce),
                (a.deflateResetKeep = Q),
                (a.deflateSetHeader = function (t, N) {
                  return t && t.state
                    ? t.state.wrap !== 2
                      ? p
                      : ((t.state.gzhead = N), u)
                    : p;
                }),
                (a.deflate = function (t, N) {
                  var F, v, y, S;
                  if (!t || !t.state || 5 < N || N < 0) return t ? Y(t, p) : p;
                  if (
                    ((v = t.state),
                    !t.output ||
                      (!t.input && t.avail_in !== 0) ||
                      (v.status === 666 && N !== b))
                  )
                    return Y(t, t.avail_out === 0 ? -5 : p);
                  if (
                    ((v.strm = t),
                    (F = v.last_flush),
                    (v.last_flush = N),
                    v.status === E)
                  )
                    if (v.wrap === 2)
                      (t.adler = 0),
                        V(v, 31),
                        V(v, 139),
                        V(v, 8),
                        v.gzhead
                          ? (V(
                              v,
                              (v.gzhead.text ? 1 : 0) +
                                (v.gzhead.hcrc ? 2 : 0) +
                                (v.gzhead.extra ? 4 : 0) +
                                (v.gzhead.name ? 8 : 0) +
                                (v.gzhead.comment ? 16 : 0),
                            ),
                            V(v, 255 & v.gzhead.time),
                            V(v, (v.gzhead.time >> 8) & 255),
                            V(v, (v.gzhead.time >> 16) & 255),
                            V(v, (v.gzhead.time >> 24) & 255),
                            V(
                              v,
                              v.level === 9
                                ? 2
                                : 2 <= v.strategy || v.level < 2
                                ? 4
                                : 0,
                            ),
                            V(v, 255 & v.gzhead.os),
                            v.gzhead.extra &&
                              v.gzhead.extra.length &&
                              (V(v, 255 & v.gzhead.extra.length),
                              V(v, (v.gzhead.extra.length >> 8) & 255)),
                            v.gzhead.hcrc &&
                              (t.adler = h(
                                t.adler,
                                v.pending_buf,
                                v.pending,
                                0,
                              )),
                            (v.gzindex = 0),
                            (v.status = 69))
                          : (V(v, 0),
                            V(v, 0),
                            V(v, 0),
                            V(v, 0),
                            V(v, 0),
                            V(
                              v,
                              v.level === 9
                                ? 2
                                : 2 <= v.strategy || v.level < 2
                                ? 4
                                : 0,
                            ),
                            V(v, 3),
                            (v.status = M));
                    else {
                      var X = (x + ((v.w_bits - 8) << 4)) << 8;
                      (X |=
                        (2 <= v.strategy || v.level < 2
                          ? 0
                          : v.level < 6
                          ? 1
                          : v.level === 6
                          ? 2
                          : 3) << 6),
                        v.strstart !== 0 && (X |= 32),
                        (X += 31 - (X % 31)),
                        (v.status = M),
                        H(v, X),
                        v.strstart !== 0 &&
                          (H(v, t.adler >>> 16), H(v, 65535 & t.adler)),
                        (t.adler = 1);
                    }
                  if (v.status === 69)
                    if (v.gzhead.extra) {
                      for (
                        y = v.pending;
                        v.gzindex < (65535 & v.gzhead.extra.length) &&
                        (v.pending !== v.pending_buf_size ||
                          (v.gzhead.hcrc &&
                            v.pending > y &&
                            (t.adler = h(
                              t.adler,
                              v.pending_buf,
                              v.pending - y,
                              y,
                            )),
                          $(t),
                          (y = v.pending),
                          v.pending !== v.pending_buf_size));

                      )
                        V(v, 255 & v.gzhead.extra[v.gzindex]), v.gzindex++;
                      v.gzhead.hcrc &&
                        v.pending > y &&
                        (t.adler = h(t.adler, v.pending_buf, v.pending - y, y)),
                        v.gzindex === v.gzhead.extra.length &&
                          ((v.gzindex = 0), (v.status = 73));
                    } else v.status = 73;
                  if (v.status === 73)
                    if (v.gzhead.name) {
                      y = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > y &&
                            (t.adler = h(
                              t.adler,
                              v.pending_buf,
                              v.pending - y,
                              y,
                            )),
                          $(t),
                          (y = v.pending),
                          v.pending === v.pending_buf_size)
                        ) {
                          S = 1;
                          break;
                        }
                        (S =
                          v.gzindex < v.gzhead.name.length
                            ? 255 & v.gzhead.name.charCodeAt(v.gzindex++)
                            : 0),
                          V(v, S);
                      } while (S !== 0);
                      v.gzhead.hcrc &&
                        v.pending > y &&
                        (t.adler = h(t.adler, v.pending_buf, v.pending - y, y)),
                        S === 0 && ((v.gzindex = 0), (v.status = 91));
                    } else v.status = 91;
                  if (v.status === 91)
                    if (v.gzhead.comment) {
                      y = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > y &&
                            (t.adler = h(
                              t.adler,
                              v.pending_buf,
                              v.pending - y,
                              y,
                            )),
                          $(t),
                          (y = v.pending),
                          v.pending === v.pending_buf_size)
                        ) {
                          S = 1;
                          break;
                        }
                        (S =
                          v.gzindex < v.gzhead.comment.length
                            ? 255 & v.gzhead.comment.charCodeAt(v.gzindex++)
                            : 0),
                          V(v, S);
                      } while (S !== 0);
                      v.gzhead.hcrc &&
                        v.pending > y &&
                        (t.adler = h(t.adler, v.pending_buf, v.pending - y, y)),
                        S === 0 && (v.status = 103);
                    } else v.status = 103;
                  if (
                    (v.status === 103 &&
                      (v.gzhead.hcrc
                        ? (v.pending + 2 > v.pending_buf_size && $(t),
                          v.pending + 2 <= v.pending_buf_size &&
                            (V(v, 255 & t.adler),
                            V(v, (t.adler >> 8) & 255),
                            (t.adler = 0),
                            (v.status = M)))
                        : (v.status = M)),
                    v.pending !== 0)
                  ) {
                    if (($(t), t.avail_out === 0))
                      return (v.last_flush = -1), u;
                  } else if (t.avail_in === 0 && L(N) <= L(F) && N !== b)
                    return Y(t, -5);
                  if (v.status === 666 && t.avail_in !== 0) return Y(t, -5);
                  if (
                    t.avail_in !== 0 ||
                    v.lookahead !== 0 ||
                    (N !== o && v.status !== 666)
                  ) {
                    var O =
                      v.strategy === 2
                        ? (function (P, q) {
                            for (var J; ; ) {
                              if (
                                P.lookahead === 0 &&
                                (ae(P), P.lookahead === 0)
                              ) {
                                if (q === o) return c;
                                break;
                              }
                              if (
                                ((P.match_length = 0),
                                (J = s._tr_tally(P, 0, P.window[P.strstart])),
                                P.lookahead--,
                                P.strstart++,
                                J && (R(P, !1), P.strm.avail_out === 0))
                              )
                                return c;
                            }
                            return (
                              (P.insert = 0),
                              q === b
                                ? (R(P, !0), P.strm.avail_out === 0 ? U : C)
                                : P.last_lit &&
                                  (R(P, !1), P.strm.avail_out === 0)
                                ? c
                                : T
                            );
                          })(v, N)
                        : v.strategy === 3
                        ? (function (P, q) {
                            for (var J, G, ne, de, le = P.window; ; ) {
                              if (P.lookahead <= I) {
                                if ((ae(P), P.lookahead <= I && q === o))
                                  return c;
                                if (P.lookahead === 0) break;
                              }
                              if (
                                ((P.match_length = 0),
                                P.lookahead >= k &&
                                  0 < P.strstart &&
                                  (G = le[(ne = P.strstart - 1)]) ===
                                    le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne])
                              ) {
                                de = P.strstart + I;
                                do;
                                while (
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  G === le[++ne] &&
                                  ne < de
                                );
                                (P.match_length = I - (de - ne)),
                                  P.match_length > P.lookahead &&
                                    (P.match_length = P.lookahead);
                              }
                              if (
                                (P.match_length >= k
                                  ? ((J = s._tr_tally(
                                      P,
                                      1,
                                      P.match_length - k,
                                    )),
                                    (P.lookahead -= P.match_length),
                                    (P.strstart += P.match_length),
                                    (P.match_length = 0))
                                  : ((J = s._tr_tally(
                                      P,
                                      0,
                                      P.window[P.strstart],
                                    )),
                                    P.lookahead--,
                                    P.strstart++),
                                J && (R(P, !1), P.strm.avail_out === 0))
                              )
                                return c;
                            }
                            return (
                              (P.insert = 0),
                              q === b
                                ? (R(P, !0), P.strm.avail_out === 0 ? U : C)
                                : P.last_lit &&
                                  (R(P, !1), P.strm.avail_out === 0)
                                ? c
                                : T
                            );
                          })(v, N)
                        : n[v.level].func(v, N);
                    if (
                      ((O !== U && O !== C) || (v.status = 666),
                      O === c || O === U)
                    )
                      return t.avail_out === 0 && (v.last_flush = -1), u;
                    if (
                      O === T &&
                      (N === 1
                        ? s._tr_align(v)
                        : N !== 5 &&
                          (s._tr_stored_block(v, 0, 0, !1),
                          N === 3 &&
                            (Z(v.head),
                            v.lookahead === 0 &&
                              ((v.strstart = 0),
                              (v.block_start = 0),
                              (v.insert = 0)))),
                      $(t),
                      t.avail_out === 0)
                    )
                      return (v.last_flush = -1), u;
                  }
                  return N !== b
                    ? u
                    : v.wrap <= 0
                    ? 1
                    : (v.wrap === 2
                        ? (V(v, 255 & t.adler),
                          V(v, (t.adler >> 8) & 255),
                          V(v, (t.adler >> 16) & 255),
                          V(v, (t.adler >> 24) & 255),
                          V(v, 255 & t.total_in),
                          V(v, (t.total_in >> 8) & 255),
                          V(v, (t.total_in >> 16) & 255),
                          V(v, (t.total_in >> 24) & 255))
                        : (H(v, t.adler >>> 16), H(v, 65535 & t.adler)),
                      $(t),
                      0 < v.wrap && (v.wrap = -v.wrap),
                      v.pending !== 0 ? u : 1);
                }),
                (a.deflateEnd = function (t) {
                  var N;
                  return t && t.state
                    ? (N = t.state.status) !== E &&
                      N !== 69 &&
                      N !== 73 &&
                      N !== 91 &&
                      N !== 103 &&
                      N !== M &&
                      N !== 666
                      ? Y(t, p)
                      : ((t.state = null), N === M ? Y(t, -3) : u)
                    : p;
                }),
                (a.deflateSetDictionary = function (t, N) {
                  var F,
                    v,
                    y,
                    S,
                    X,
                    O,
                    P,
                    q,
                    J = N.length;
                  if (
                    !t ||
                    !t.state ||
                    (S = (F = t.state).wrap) === 2 ||
                    (S === 1 && F.status !== E) ||
                    F.lookahead
                  )
                    return p;
                  for (
                    S === 1 && (t.adler = i(t.adler, N, J, 0)),
                      F.wrap = 0,
                      J >= F.w_size &&
                        (S === 0 &&
                          (Z(F.head),
                          (F.strstart = 0),
                          (F.block_start = 0),
                          (F.insert = 0)),
                        (q = new r.Buf8(F.w_size)),
                        r.arraySet(q, N, J - F.w_size, F.w_size, 0),
                        (N = q),
                        (J = F.w_size)),
                      X = t.avail_in,
                      O = t.next_in,
                      P = t.input,
                      t.avail_in = J,
                      t.next_in = 0,
                      t.input = N,
                      ae(F);
                    F.lookahead >= k;

                  ) {
                    for (
                      v = F.strstart, y = F.lookahead - (k - 1);
                      (F.ins_h =
                        ((F.ins_h << F.hash_shift) ^ F.window[v + k - 1]) &
                        F.hash_mask),
                        (F.prev[v & F.w_mask] = F.head[F.ins_h]),
                        (F.head[F.ins_h] = v),
                        v++,
                        --y;

                    );
                    (F.strstart = v), (F.lookahead = k - 1), ae(F);
                  }
                  return (
                    (F.strstart += F.lookahead),
                    (F.block_start = F.strstart),
                    (F.insert = F.lookahead),
                    (F.lookahead = 0),
                    (F.match_length = F.prev_length = k - 1),
                    (F.match_available = 0),
                    (t.next_in = O),
                    (t.input = P),
                    (t.avail_in = X),
                    (F.wrap = S),
                    u
                  );
                }),
                (a.deflateInfo = "pako deflate (from Nodeca project)");
            },
            {
              "../utils/common": 41,
              "./adler32": 43,
              "./crc32": 45,
              "./messages": 51,
              "./trees": 52,
            },
          ],
          47: [
            function (e, d, a) {
              "use strict";
              d.exports = function () {
                (this.text = 0),
                  (this.time = 0),
                  (this.xflags = 0),
                  (this.os = 0),
                  (this.extra = null),
                  (this.extra_len = 0),
                  (this.name = ""),
                  (this.comment = ""),
                  (this.hcrc = 0),
                  (this.done = !1);
              };
            },
            {},
          ],
          48: [
            function (e, d, a) {
              "use strict";
              d.exports = function (n, r) {
                var s,
                  i,
                  h,
                  g,
                  o,
                  b,
                  u,
                  p,
                  l,
                  m,
                  f,
                  x,
                  w,
                  D,
                  _,
                  z,
                  A,
                  B,
                  k,
                  I,
                  W,
                  E,
                  M,
                  c,
                  T;
                (s = n.state),
                  (i = n.next_in),
                  (c = n.input),
                  (h = i + (n.avail_in - 5)),
                  (g = n.next_out),
                  (T = n.output),
                  (o = g - (r - n.avail_out)),
                  (b = g + (n.avail_out - 257)),
                  (u = s.dmax),
                  (p = s.wsize),
                  (l = s.whave),
                  (m = s.wnext),
                  (f = s.window),
                  (x = s.hold),
                  (w = s.bits),
                  (D = s.lencode),
                  (_ = s.distcode),
                  (z = (1 << s.lenbits) - 1),
                  (A = (1 << s.distbits) - 1);
                e: do {
                  w < 15 &&
                    ((x += c[i++] << w),
                    (w += 8),
                    (x += c[i++] << w),
                    (w += 8)),
                    (B = D[x & z]);
                  t: for (;;) {
                    if (
                      ((x >>>= k = B >>> 24),
                      (w -= k),
                      (k = (B >>> 16) & 255) === 0)
                    )
                      T[g++] = 65535 & B;
                    else {
                      if (!(16 & k)) {
                        if ((64 & k) == 0) {
                          B = D[(65535 & B) + (x & ((1 << k) - 1))];
                          continue t;
                        }
                        if (32 & k) {
                          s.mode = 12;
                          break e;
                        }
                        (n.msg = "invalid literal/length code"), (s.mode = 30);
                        break e;
                      }
                      (I = 65535 & B),
                        (k &= 15) &&
                          (w < k && ((x += c[i++] << w), (w += 8)),
                          (I += x & ((1 << k) - 1)),
                          (x >>>= k),
                          (w -= k)),
                        w < 15 &&
                          ((x += c[i++] << w),
                          (w += 8),
                          (x += c[i++] << w),
                          (w += 8)),
                        (B = _[x & A]);
                      n: for (;;) {
                        if (
                          ((x >>>= k = B >>> 24),
                          (w -= k),
                          !(16 & (k = (B >>> 16) & 255)))
                        ) {
                          if ((64 & k) == 0) {
                            B = _[(65535 & B) + (x & ((1 << k) - 1))];
                            continue n;
                          }
                          (n.msg = "invalid distance code"), (s.mode = 30);
                          break e;
                        }
                        if (
                          ((W = 65535 & B),
                          w < (k &= 15) &&
                            ((x += c[i++] << w),
                            (w += 8) < k && ((x += c[i++] << w), (w += 8))),
                          u < (W += x & ((1 << k) - 1)))
                        ) {
                          (n.msg = "invalid distance too far back"),
                            (s.mode = 30);
                          break e;
                        }
                        if (((x >>>= k), (w -= k), (k = g - o) < W)) {
                          if (l < (k = W - k) && s.sane) {
                            (n.msg = "invalid distance too far back"),
                              (s.mode = 30);
                            break e;
                          }
                          if (((M = f), (E = 0) === m)) {
                            if (((E += p - k), k < I)) {
                              for (I -= k; (T[g++] = f[E++]), --k; );
                              (E = g - W), (M = T);
                            }
                          } else if (m < k) {
                            if (((E += p + m - k), (k -= m) < I)) {
                              for (I -= k; (T[g++] = f[E++]), --k; );
                              if (((E = 0), m < I)) {
                                for (I -= k = m; (T[g++] = f[E++]), --k; );
                                (E = g - W), (M = T);
                              }
                            }
                          } else if (((E += m - k), k < I)) {
                            for (I -= k; (T[g++] = f[E++]), --k; );
                            (E = g - W), (M = T);
                          }
                          for (; 2 < I; )
                            (T[g++] = M[E++]),
                              (T[g++] = M[E++]),
                              (T[g++] = M[E++]),
                              (I -= 3);
                          I && ((T[g++] = M[E++]), 1 < I && (T[g++] = M[E++]));
                        } else {
                          for (
                            E = g - W;
                            (T[g++] = T[E++]),
                              (T[g++] = T[E++]),
                              (T[g++] = T[E++]),
                              2 < (I -= 3);

                          );
                          I && ((T[g++] = T[E++]), 1 < I && (T[g++] = T[E++]));
                        }
                        break;
                      }
                    }
                    break;
                  }
                } while (i < h && g < b);
                (i -= I = w >> 3),
                  (x &= (1 << (w -= I << 3)) - 1),
                  (n.next_in = i),
                  (n.next_out = g),
                  (n.avail_in = i < h ? h - i + 5 : 5 - (i - h)),
                  (n.avail_out = g < b ? b - g + 257 : 257 - (g - b)),
                  (s.hold = x),
                  (s.bits = w);
              };
            },
            {},
          ],
          49: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils/common"),
                r = e("./adler32"),
                s = e("./crc32"),
                i = e("./inffast"),
                h = e("./inftrees"),
                g = 1,
                o = 2,
                b = 0,
                u = -2,
                p = 1,
                l = 852,
                m = 592;
              function f(E) {
                return (
                  ((E >>> 24) & 255) +
                  ((E >>> 8) & 65280) +
                  ((65280 & E) << 8) +
                  ((255 & E) << 24)
                );
              }
              function x() {
                (this.mode = 0),
                  (this.last = !1),
                  (this.wrap = 0),
                  (this.havedict = !1),
                  (this.flags = 0),
                  (this.dmax = 0),
                  (this.check = 0),
                  (this.total = 0),
                  (this.head = null),
                  (this.wbits = 0),
                  (this.wsize = 0),
                  (this.whave = 0),
                  (this.wnext = 0),
                  (this.window = null),
                  (this.hold = 0),
                  (this.bits = 0),
                  (this.length = 0),
                  (this.offset = 0),
                  (this.extra = 0),
                  (this.lencode = null),
                  (this.distcode = null),
                  (this.lenbits = 0),
                  (this.distbits = 0),
                  (this.ncode = 0),
                  (this.nlen = 0),
                  (this.ndist = 0),
                  (this.have = 0),
                  (this.next = null),
                  (this.lens = new n.Buf16(320)),
                  (this.work = new n.Buf16(288)),
                  (this.lendyn = null),
                  (this.distdyn = null),
                  (this.sane = 0),
                  (this.back = 0),
                  (this.was = 0);
              }
              function w(E) {
                var M;
                return E && E.state
                  ? ((M = E.state),
                    (E.total_in = E.total_out = M.total = 0),
                    (E.msg = ""),
                    M.wrap && (E.adler = 1 & M.wrap),
                    (M.mode = p),
                    (M.last = 0),
                    (M.havedict = 0),
                    (M.dmax = 32768),
                    (M.head = null),
                    (M.hold = 0),
                    (M.bits = 0),
                    (M.lencode = M.lendyn = new n.Buf32(l)),
                    (M.distcode = M.distdyn = new n.Buf32(m)),
                    (M.sane = 1),
                    (M.back = -1),
                    b)
                  : u;
              }
              function D(E) {
                var M;
                return E && E.state
                  ? (((M = E.state).wsize = 0),
                    (M.whave = 0),
                    (M.wnext = 0),
                    w(E))
                  : u;
              }
              function _(E, M) {
                var c, T;
                return E && E.state
                  ? ((T = E.state),
                    M < 0
                      ? ((c = 0), (M = -M))
                      : ((c = 1 + (M >> 4)), M < 48 && (M &= 15)),
                    M && (M < 8 || 15 < M)
                      ? u
                      : (T.window !== null &&
                          T.wbits !== M &&
                          (T.window = null),
                        (T.wrap = c),
                        (T.wbits = M),
                        D(E)))
                  : u;
              }
              function z(E, M) {
                var c, T;
                return E
                  ? ((T = new x()),
                    ((E.state = T).window = null),
                    (c = _(E, M)) !== b && (E.state = null),
                    c)
                  : u;
              }
              var A,
                B,
                k = !0;
              function I(E) {
                if (k) {
                  var M;
                  for (
                    A = new n.Buf32(512), B = new n.Buf32(32), M = 0;
                    M < 144;

                  )
                    E.lens[M++] = 8;
                  for (; M < 256; ) E.lens[M++] = 9;
                  for (; M < 280; ) E.lens[M++] = 7;
                  for (; M < 288; ) E.lens[M++] = 8;
                  for (
                    h(g, E.lens, 0, 288, A, 0, E.work, { bits: 9 }), M = 0;
                    M < 32;

                  )
                    E.lens[M++] = 5;
                  h(o, E.lens, 0, 32, B, 0, E.work, { bits: 5 }), (k = !1);
                }
                (E.lencode = A),
                  (E.lenbits = 9),
                  (E.distcode = B),
                  (E.distbits = 5);
              }
              function W(E, M, c, T) {
                var U,
                  C = E.state;
                return (
                  C.window === null &&
                    ((C.wsize = 1 << C.wbits),
                    (C.wnext = 0),
                    (C.whave = 0),
                    (C.window = new n.Buf8(C.wsize))),
                  T >= C.wsize
                    ? (n.arraySet(C.window, M, c - C.wsize, C.wsize, 0),
                      (C.wnext = 0),
                      (C.whave = C.wsize))
                    : (T < (U = C.wsize - C.wnext) && (U = T),
                      n.arraySet(C.window, M, c - T, U, C.wnext),
                      (T -= U)
                        ? (n.arraySet(C.window, M, c - T, T, 0),
                          (C.wnext = T),
                          (C.whave = C.wsize))
                        : ((C.wnext += U),
                          C.wnext === C.wsize && (C.wnext = 0),
                          C.whave < C.wsize && (C.whave += U))),
                  0
                );
              }
              (a.inflateReset = D),
                (a.inflateReset2 = _),
                (a.inflateResetKeep = w),
                (a.inflateInit = function (E) {
                  return z(E, 15);
                }),
                (a.inflateInit2 = z),
                (a.inflate = function (E, M) {
                  var c,
                    T,
                    U,
                    C,
                    Y,
                    L,
                    Z,
                    $,
                    R,
                    V,
                    H,
                    j,
                    ae,
                    oe,
                    te,
                    se,
                    K,
                    Q,
                    ce,
                    he,
                    t,
                    N,
                    F,
                    v,
                    y = 0,
                    S = new n.Buf8(4),
                    X = [
                      16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14,
                      1, 15,
                    ];
                  if (
                    !E ||
                    !E.state ||
                    !E.output ||
                    (!E.input && E.avail_in !== 0)
                  )
                    return u;
                  (c = E.state).mode === 12 && (c.mode = 13),
                    (Y = E.next_out),
                    (U = E.output),
                    (Z = E.avail_out),
                    (C = E.next_in),
                    (T = E.input),
                    (L = E.avail_in),
                    ($ = c.hold),
                    (R = c.bits),
                    (V = L),
                    (H = Z),
                    (N = b);
                  e: for (;;)
                    switch (c.mode) {
                      case p:
                        if (c.wrap === 0) {
                          c.mode = 13;
                          break;
                        }
                        for (; R < 16; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if (2 & c.wrap && $ === 35615) {
                          (S[(c.check = 0)] = 255 & $),
                            (S[1] = ($ >>> 8) & 255),
                            (c.check = s(c.check, S, 2, 0)),
                            (R = $ = 0),
                            (c.mode = 2);
                          break;
                        }
                        if (
                          ((c.flags = 0),
                          c.head && (c.head.done = !1),
                          !(1 & c.wrap) || (((255 & $) << 8) + ($ >> 8)) % 31)
                        ) {
                          (E.msg = "incorrect header check"), (c.mode = 30);
                          break;
                        }
                        if ((15 & $) != 8) {
                          (E.msg = "unknown compression method"), (c.mode = 30);
                          break;
                        }
                        if (
                          ((R -= 4), (t = 8 + (15 & ($ >>>= 4))), c.wbits === 0)
                        )
                          c.wbits = t;
                        else if (t > c.wbits) {
                          (E.msg = "invalid window size"), (c.mode = 30);
                          break;
                        }
                        (c.dmax = 1 << t),
                          (E.adler = c.check = 1),
                          (c.mode = 512 & $ ? 10 : 12),
                          (R = $ = 0);
                        break;
                      case 2:
                        for (; R < 16; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if (((c.flags = $), (255 & c.flags) != 8)) {
                          (E.msg = "unknown compression method"), (c.mode = 30);
                          break;
                        }
                        if (57344 & c.flags) {
                          (E.msg = "unknown header flags set"), (c.mode = 30);
                          break;
                        }
                        c.head && (c.head.text = ($ >> 8) & 1),
                          512 & c.flags &&
                            ((S[0] = 255 & $),
                            (S[1] = ($ >>> 8) & 255),
                            (c.check = s(c.check, S, 2, 0))),
                          (R = $ = 0),
                          (c.mode = 3);
                      case 3:
                        for (; R < 32; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        c.head && (c.head.time = $),
                          512 & c.flags &&
                            ((S[0] = 255 & $),
                            (S[1] = ($ >>> 8) & 255),
                            (S[2] = ($ >>> 16) & 255),
                            (S[3] = ($ >>> 24) & 255),
                            (c.check = s(c.check, S, 4, 0))),
                          (R = $ = 0),
                          (c.mode = 4);
                      case 4:
                        for (; R < 16; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        c.head &&
                          ((c.head.xflags = 255 & $), (c.head.os = $ >> 8)),
                          512 & c.flags &&
                            ((S[0] = 255 & $),
                            (S[1] = ($ >>> 8) & 255),
                            (c.check = s(c.check, S, 2, 0))),
                          (R = $ = 0),
                          (c.mode = 5);
                      case 5:
                        if (1024 & c.flags) {
                          for (; R < 16; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          (c.length = $),
                            c.head && (c.head.extra_len = $),
                            512 & c.flags &&
                              ((S[0] = 255 & $),
                              (S[1] = ($ >>> 8) & 255),
                              (c.check = s(c.check, S, 2, 0))),
                            (R = $ = 0);
                        } else c.head && (c.head.extra = null);
                        c.mode = 6;
                      case 6:
                        if (
                          1024 & c.flags &&
                          (L < (j = c.length) && (j = L),
                          j &&
                            (c.head &&
                              ((t = c.head.extra_len - c.length),
                              c.head.extra ||
                                (c.head.extra = new Array(c.head.extra_len)),
                              n.arraySet(c.head.extra, T, C, j, t)),
                            512 & c.flags && (c.check = s(c.check, T, j, C)),
                            (L -= j),
                            (C += j),
                            (c.length -= j)),
                          c.length)
                        )
                          break e;
                        (c.length = 0), (c.mode = 7);
                      case 7:
                        if (2048 & c.flags) {
                          if (L === 0) break e;
                          for (
                            j = 0;
                            (t = T[C + j++]),
                              c.head &&
                                t &&
                                c.length < 65536 &&
                                (c.head.name += String.fromCharCode(t)),
                              t && j < L;

                          );
                          if (
                            (512 & c.flags && (c.check = s(c.check, T, j, C)),
                            (L -= j),
                            (C += j),
                            t)
                          )
                            break e;
                        } else c.head && (c.head.name = null);
                        (c.length = 0), (c.mode = 8);
                      case 8:
                        if (4096 & c.flags) {
                          if (L === 0) break e;
                          for (
                            j = 0;
                            (t = T[C + j++]),
                              c.head &&
                                t &&
                                c.length < 65536 &&
                                (c.head.comment += String.fromCharCode(t)),
                              t && j < L;

                          );
                          if (
                            (512 & c.flags && (c.check = s(c.check, T, j, C)),
                            (L -= j),
                            (C += j),
                            t)
                          )
                            break e;
                        } else c.head && (c.head.comment = null);
                        c.mode = 9;
                      case 9:
                        if (512 & c.flags) {
                          for (; R < 16; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          if ($ !== (65535 & c.check)) {
                            (E.msg = "header crc mismatch"), (c.mode = 30);
                            break;
                          }
                          R = $ = 0;
                        }
                        c.head &&
                          ((c.head.hcrc = (c.flags >> 9) & 1),
                          (c.head.done = !0)),
                          (E.adler = c.check = 0),
                          (c.mode = 12);
                        break;
                      case 10:
                        for (; R < 32; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        (E.adler = c.check = f($)), (R = $ = 0), (c.mode = 11);
                      case 11:
                        if (c.havedict === 0)
                          return (
                            (E.next_out = Y),
                            (E.avail_out = Z),
                            (E.next_in = C),
                            (E.avail_in = L),
                            (c.hold = $),
                            (c.bits = R),
                            2
                          );
                        (E.adler = c.check = 1), (c.mode = 12);
                      case 12:
                        if (M === 5 || M === 6) break e;
                      case 13:
                        if (c.last) {
                          ($ >>>= 7 & R), (R -= 7 & R), (c.mode = 27);
                          break;
                        }
                        for (; R < 3; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        switch (((c.last = 1 & $), (R -= 1), 3 & ($ >>>= 1))) {
                          case 0:
                            c.mode = 14;
                            break;
                          case 1:
                            if ((I(c), (c.mode = 20), M !== 6)) break;
                            ($ >>>= 2), (R -= 2);
                            break e;
                          case 2:
                            c.mode = 17;
                            break;
                          case 3:
                            (E.msg = "invalid block type"), (c.mode = 30);
                        }
                        ($ >>>= 2), (R -= 2);
                        break;
                      case 14:
                        for ($ >>>= 7 & R, R -= 7 & R; R < 32; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if ((65535 & $) != (($ >>> 16) ^ 65535)) {
                          (E.msg = "invalid stored block lengths"),
                            (c.mode = 30);
                          break;
                        }
                        if (
                          ((c.length = 65535 & $),
                          (R = $ = 0),
                          (c.mode = 15),
                          M === 6)
                        )
                          break e;
                      case 15:
                        c.mode = 16;
                      case 16:
                        if ((j = c.length)) {
                          if ((L < j && (j = L), Z < j && (j = Z), j === 0))
                            break e;
                          n.arraySet(U, T, C, j, Y),
                            (L -= j),
                            (C += j),
                            (Z -= j),
                            (Y += j),
                            (c.length -= j);
                          break;
                        }
                        c.mode = 12;
                        break;
                      case 17:
                        for (; R < 14; ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if (
                          ((c.nlen = 257 + (31 & $)),
                          ($ >>>= 5),
                          (R -= 5),
                          (c.ndist = 1 + (31 & $)),
                          ($ >>>= 5),
                          (R -= 5),
                          (c.ncode = 4 + (15 & $)),
                          ($ >>>= 4),
                          (R -= 4),
                          286 < c.nlen || 30 < c.ndist)
                        ) {
                          (E.msg = "too many length or distance symbols"),
                            (c.mode = 30);
                          break;
                        }
                        (c.have = 0), (c.mode = 18);
                      case 18:
                        for (; c.have < c.ncode; ) {
                          for (; R < 3; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          (c.lens[X[c.have++]] = 7 & $), ($ >>>= 3), (R -= 3);
                        }
                        for (; c.have < 19; ) c.lens[X[c.have++]] = 0;
                        if (
                          ((c.lencode = c.lendyn),
                          (c.lenbits = 7),
                          (F = { bits: c.lenbits }),
                          (N = h(0, c.lens, 0, 19, c.lencode, 0, c.work, F)),
                          (c.lenbits = F.bits),
                          N)
                        ) {
                          (E.msg = "invalid code lengths set"), (c.mode = 30);
                          break;
                        }
                        (c.have = 0), (c.mode = 19);
                      case 19:
                        for (; c.have < c.nlen + c.ndist; ) {
                          for (
                            ;
                            (se =
                              ((y = c.lencode[$ & ((1 << c.lenbits) - 1)]) >>>
                                16) &
                              255),
                              (K = 65535 & y),
                              !((te = y >>> 24) <= R);

                          ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          if (K < 16)
                            ($ >>>= te), (R -= te), (c.lens[c.have++] = K);
                          else {
                            if (K === 16) {
                              for (v = te + 2; R < v; ) {
                                if (L === 0) break e;
                                L--, ($ += T[C++] << R), (R += 8);
                              }
                              if ((($ >>>= te), (R -= te), c.have === 0)) {
                                (E.msg = "invalid bit length repeat"),
                                  (c.mode = 30);
                                break;
                              }
                              (t = c.lens[c.have - 1]),
                                (j = 3 + (3 & $)),
                                ($ >>>= 2),
                                (R -= 2);
                            } else if (K === 17) {
                              for (v = te + 3; R < v; ) {
                                if (L === 0) break e;
                                L--, ($ += T[C++] << R), (R += 8);
                              }
                              (R -= te),
                                (t = 0),
                                (j = 3 + (7 & ($ >>>= te))),
                                ($ >>>= 3),
                                (R -= 3);
                            } else {
                              for (v = te + 7; R < v; ) {
                                if (L === 0) break e;
                                L--, ($ += T[C++] << R), (R += 8);
                              }
                              (R -= te),
                                (t = 0),
                                (j = 11 + (127 & ($ >>>= te))),
                                ($ >>>= 7),
                                (R -= 7);
                            }
                            if (c.have + j > c.nlen + c.ndist) {
                              (E.msg = "invalid bit length repeat"),
                                (c.mode = 30);
                              break;
                            }
                            for (; j--; ) c.lens[c.have++] = t;
                          }
                        }
                        if (c.mode === 30) break;
                        if (c.lens[256] === 0) {
                          (E.msg = "invalid code -- missing end-of-block"),
                            (c.mode = 30);
                          break;
                        }
                        if (
                          ((c.lenbits = 9),
                          (F = { bits: c.lenbits }),
                          (N = h(
                            g,
                            c.lens,
                            0,
                            c.nlen,
                            c.lencode,
                            0,
                            c.work,
                            F,
                          )),
                          (c.lenbits = F.bits),
                          N)
                        ) {
                          (E.msg = "invalid literal/lengths set"),
                            (c.mode = 30);
                          break;
                        }
                        if (
                          ((c.distbits = 6),
                          (c.distcode = c.distdyn),
                          (F = { bits: c.distbits }),
                          (N = h(
                            o,
                            c.lens,
                            c.nlen,
                            c.ndist,
                            c.distcode,
                            0,
                            c.work,
                            F,
                          )),
                          (c.distbits = F.bits),
                          N)
                        ) {
                          (E.msg = "invalid distances set"), (c.mode = 30);
                          break;
                        }
                        if (((c.mode = 20), M === 6)) break e;
                      case 20:
                        c.mode = 21;
                      case 21:
                        if (6 <= L && 258 <= Z) {
                          (E.next_out = Y),
                            (E.avail_out = Z),
                            (E.next_in = C),
                            (E.avail_in = L),
                            (c.hold = $),
                            (c.bits = R),
                            i(E, H),
                            (Y = E.next_out),
                            (U = E.output),
                            (Z = E.avail_out),
                            (C = E.next_in),
                            (T = E.input),
                            (L = E.avail_in),
                            ($ = c.hold),
                            (R = c.bits),
                            c.mode === 12 && (c.back = -1);
                          break;
                        }
                        for (
                          c.back = 0;
                          (se =
                            ((y = c.lencode[$ & ((1 << c.lenbits) - 1)]) >>>
                              16) &
                            255),
                            (K = 65535 & y),
                            !((te = y >>> 24) <= R);

                        ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if (se && (240 & se) == 0) {
                          for (
                            Q = te, ce = se, he = K;
                            (se =
                              ((y =
                                c.lencode[
                                  he + (($ & ((1 << (Q + ce)) - 1)) >> Q)
                                ]) >>>
                                16) &
                              255),
                              (K = 65535 & y),
                              !(Q + (te = y >>> 24) <= R);

                          ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          ($ >>>= Q), (R -= Q), (c.back += Q);
                        }
                        if (
                          (($ >>>= te),
                          (R -= te),
                          (c.back += te),
                          (c.length = K),
                          se === 0)
                        ) {
                          c.mode = 26;
                          break;
                        }
                        if (32 & se) {
                          (c.back = -1), (c.mode = 12);
                          break;
                        }
                        if (64 & se) {
                          (E.msg = "invalid literal/length code"),
                            (c.mode = 30);
                          break;
                        }
                        (c.extra = 15 & se), (c.mode = 22);
                      case 22:
                        if (c.extra) {
                          for (v = c.extra; R < v; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          (c.length += $ & ((1 << c.extra) - 1)),
                            ($ >>>= c.extra),
                            (R -= c.extra),
                            (c.back += c.extra);
                        }
                        (c.was = c.length), (c.mode = 23);
                      case 23:
                        for (
                          ;
                          (se =
                            ((y = c.distcode[$ & ((1 << c.distbits) - 1)]) >>>
                              16) &
                            255),
                            (K = 65535 & y),
                            !((te = y >>> 24) <= R);

                        ) {
                          if (L === 0) break e;
                          L--, ($ += T[C++] << R), (R += 8);
                        }
                        if ((240 & se) == 0) {
                          for (
                            Q = te, ce = se, he = K;
                            (se =
                              ((y =
                                c.distcode[
                                  he + (($ & ((1 << (Q + ce)) - 1)) >> Q)
                                ]) >>>
                                16) &
                              255),
                              (K = 65535 & y),
                              !(Q + (te = y >>> 24) <= R);

                          ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          ($ >>>= Q), (R -= Q), (c.back += Q);
                        }
                        if ((($ >>>= te), (R -= te), (c.back += te), 64 & se)) {
                          (E.msg = "invalid distance code"), (c.mode = 30);
                          break;
                        }
                        (c.offset = K), (c.extra = 15 & se), (c.mode = 24);
                      case 24:
                        if (c.extra) {
                          for (v = c.extra; R < v; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          (c.offset += $ & ((1 << c.extra) - 1)),
                            ($ >>>= c.extra),
                            (R -= c.extra),
                            (c.back += c.extra);
                        }
                        if (c.offset > c.dmax) {
                          (E.msg = "invalid distance too far back"),
                            (c.mode = 30);
                          break;
                        }
                        c.mode = 25;
                      case 25:
                        if (Z === 0) break e;
                        if (((j = H - Z), c.offset > j)) {
                          if ((j = c.offset - j) > c.whave && c.sane) {
                            (E.msg = "invalid distance too far back"),
                              (c.mode = 30);
                            break;
                          }
                          (ae =
                            j > c.wnext
                              ? ((j -= c.wnext), c.wsize - j)
                              : c.wnext - j),
                            j > c.length && (j = c.length),
                            (oe = c.window);
                        } else (oe = U), (ae = Y - c.offset), (j = c.length);
                        for (
                          Z < j && (j = Z), Z -= j, c.length -= j;
                          (U[Y++] = oe[ae++]), --j;

                        );
                        c.length === 0 && (c.mode = 21);
                        break;
                      case 26:
                        if (Z === 0) break e;
                        (U[Y++] = c.length), Z--, (c.mode = 21);
                        break;
                      case 27:
                        if (c.wrap) {
                          for (; R < 32; ) {
                            if (L === 0) break e;
                            L--, ($ |= T[C++] << R), (R += 8);
                          }
                          if (
                            ((H -= Z),
                            (E.total_out += H),
                            (c.total += H),
                            H &&
                              (E.adler = c.check =
                                c.flags
                                  ? s(c.check, U, H, Y - H)
                                  : r(c.check, U, H, Y - H)),
                            (H = Z),
                            (c.flags ? $ : f($)) !== c.check)
                          ) {
                            (E.msg = "incorrect data check"), (c.mode = 30);
                            break;
                          }
                          R = $ = 0;
                        }
                        c.mode = 28;
                      case 28:
                        if (c.wrap && c.flags) {
                          for (; R < 32; ) {
                            if (L === 0) break e;
                            L--, ($ += T[C++] << R), (R += 8);
                          }
                          if ($ !== (4294967295 & c.total)) {
                            (E.msg = "incorrect length check"), (c.mode = 30);
                            break;
                          }
                          R = $ = 0;
                        }
                        c.mode = 29;
                      case 29:
                        N = 1;
                        break e;
                      case 30:
                        N = -3;
                        break e;
                      case 31:
                        return -4;
                      case 32:
                      default:
                        return u;
                    }
                  return (
                    (E.next_out = Y),
                    (E.avail_out = Z),
                    (E.next_in = C),
                    (E.avail_in = L),
                    (c.hold = $),
                    (c.bits = R),
                    (c.wsize ||
                      (H !== E.avail_out &&
                        c.mode < 30 &&
                        (c.mode < 27 || M !== 4))) &&
                    W(E, E.output, E.next_out, H - E.avail_out)
                      ? ((c.mode = 31), -4)
                      : ((V -= E.avail_in),
                        (H -= E.avail_out),
                        (E.total_in += V),
                        (E.total_out += H),
                        (c.total += H),
                        c.wrap &&
                          H &&
                          (E.adler = c.check =
                            c.flags
                              ? s(c.check, U, H, E.next_out - H)
                              : r(c.check, U, H, E.next_out - H)),
                        (E.data_type =
                          c.bits +
                          (c.last ? 64 : 0) +
                          (c.mode === 12 ? 128 : 0) +
                          (c.mode === 20 || c.mode === 15 ? 256 : 0)),
                        ((V == 0 && H === 0) || M === 4) && N === b && (N = -5),
                        N)
                  );
                }),
                (a.inflateEnd = function (E) {
                  if (!E || !E.state) return u;
                  var M = E.state;
                  return M.window && (M.window = null), (E.state = null), b;
                }),
                (a.inflateGetHeader = function (E, M) {
                  var c;
                  return E && E.state
                    ? (2 & (c = E.state).wrap) == 0
                      ? u
                      : (((c.head = M).done = !1), b)
                    : u;
                }),
                (a.inflateSetDictionary = function (E, M) {
                  var c,
                    T = M.length;
                  return E && E.state
                    ? (c = E.state).wrap !== 0 && c.mode !== 11
                      ? u
                      : c.mode === 11 && r(1, M, T, 0) !== c.check
                      ? -3
                      : W(E, M, T, T)
                      ? ((c.mode = 31), -4)
                      : ((c.havedict = 1), b)
                    : u;
                }),
                (a.inflateInfo = "pako inflate (from Nodeca project)");
            },
            {
              "../utils/common": 41,
              "./adler32": 43,
              "./crc32": 45,
              "./inffast": 48,
              "./inftrees": 50,
            },
          ],
          50: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils/common"),
                r = [
                  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35,
                  43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
                ],
                s = [
                  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18,
                  18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72,
                  78,
                ],
                i = [
                  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
                  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193,
                  12289, 16385, 24577, 0, 0,
                ],
                h = [
                  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22,
                  22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29,
                  64, 64,
                ];
              d.exports = function (g, o, b, u, p, l, m, f) {
                var x,
                  w,
                  D,
                  _,
                  z,
                  A,
                  B,
                  k,
                  I,
                  W = f.bits,
                  E = 0,
                  M = 0,
                  c = 0,
                  T = 0,
                  U = 0,
                  C = 0,
                  Y = 0,
                  L = 0,
                  Z = 0,
                  $ = 0,
                  R = null,
                  V = 0,
                  H = new n.Buf16(16),
                  j = new n.Buf16(16),
                  ae = null,
                  oe = 0;
                for (E = 0; E <= 15; E++) H[E] = 0;
                for (M = 0; M < u; M++) H[o[b + M]]++;
                for (U = W, T = 15; 1 <= T && H[T] === 0; T--);
                if ((T < U && (U = T), T === 0))
                  return (
                    (p[l++] = 20971520), (p[l++] = 20971520), (f.bits = 1), 0
                  );
                for (c = 1; c < T && H[c] === 0; c++);
                for (U < c && (U = c), E = L = 1; E <= 15; E++)
                  if (((L <<= 1), (L -= H[E]) < 0)) return -1;
                if (0 < L && (g === 0 || T !== 1)) return -1;
                for (j[1] = 0, E = 1; E < 15; E++) j[E + 1] = j[E] + H[E];
                for (M = 0; M < u; M++)
                  o[b + M] !== 0 && (m[j[o[b + M]]++] = M);
                if (
                  ((A =
                    g === 0
                      ? ((R = ae = m), 19)
                      : g === 1
                      ? ((R = r), (V -= 257), (ae = s), (oe -= 257), 256)
                      : ((R = i), (ae = h), -1)),
                  (E = c),
                  (z = l),
                  (Y = M = $ = 0),
                  (D = -1),
                  (_ = (Z = 1 << (C = U)) - 1),
                  (g === 1 && 852 < Z) || (g === 2 && 592 < Z))
                )
                  return 1;
                for (;;) {
                  for (
                    B = E - Y,
                      I =
                        m[M] < A
                          ? ((k = 0), m[M])
                          : m[M] > A
                          ? ((k = ae[oe + m[M]]), R[V + m[M]])
                          : ((k = 96), 0),
                      x = 1 << (E - Y),
                      c = w = 1 << C;
                    (p[z + ($ >> Y) + (w -= x)] =
                      (B << 24) | (k << 16) | I | 0),
                      w !== 0;

                  );
                  for (x = 1 << (E - 1); $ & x; ) x >>= 1;
                  if (
                    (x !== 0 ? (($ &= x - 1), ($ += x)) : ($ = 0),
                    M++,
                    --H[E] == 0)
                  ) {
                    if (E === T) break;
                    E = o[b + m[M]];
                  }
                  if (U < E && ($ & _) !== D) {
                    for (
                      Y === 0 && (Y = U), z += c, L = 1 << (C = E - Y);
                      C + Y < T && !((L -= H[C + Y]) <= 0);

                    )
                      C++, (L <<= 1);
                    if (
                      ((Z += 1 << C),
                      (g === 1 && 852 < Z) || (g === 2 && 592 < Z))
                    )
                      return 1;
                    p[(D = $ & _)] = (U << 24) | (C << 16) | (z - l) | 0;
                  }
                }
                return (
                  $ !== 0 && (p[z + $] = ((E - Y) << 24) | (64 << 16) | 0),
                  (f.bits = U),
                  0
                );
              };
            },
            { "../utils/common": 41 },
          ],
          51: [
            function (e, d, a) {
              "use strict";
              d.exports = {
                2: "need dictionary",
                1: "stream end",
                0: "",
                "-1": "file error",
                "-2": "stream error",
                "-3": "data error",
                "-4": "insufficient memory",
                "-5": "buffer error",
                "-6": "incompatible version",
              };
            },
            {},
          ],
          52: [
            function (e, d, a) {
              "use strict";
              var n = e("../utils/common"),
                r = 0,
                s = 1;
              function i(y) {
                for (var S = y.length; 0 <= --S; ) y[S] = 0;
              }
              var h = 0,
                g = 29,
                o = 256,
                b = o + 1 + g,
                u = 30,
                p = 19,
                l = 2 * b + 1,
                m = 15,
                f = 16,
                x = 7,
                w = 256,
                D = 16,
                _ = 17,
                z = 18,
                A = [
                  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4,
                  4, 4, 4, 5, 5, 5, 5, 0,
                ],
                B = [
                  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9,
                  9, 10, 10, 11, 11, 12, 12, 13, 13,
                ],
                k = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
                I = [
                  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
                  15,
                ],
                W = new Array(2 * (b + 2));
              i(W);
              var E = new Array(2 * u);
              i(E);
              var M = new Array(512);
              i(M);
              var c = new Array(256);
              i(c);
              var T = new Array(g);
              i(T);
              var U,
                C,
                Y,
                L = new Array(u);
              function Z(y, S, X, O, P) {
                (this.static_tree = y),
                  (this.extra_bits = S),
                  (this.extra_base = X),
                  (this.elems = O),
                  (this.max_length = P),
                  (this.has_stree = y && y.length);
              }
              function $(y, S) {
                (this.dyn_tree = y), (this.max_code = 0), (this.stat_desc = S);
              }
              function R(y) {
                return y < 256 ? M[y] : M[256 + (y >>> 7)];
              }
              function V(y, S) {
                (y.pending_buf[y.pending++] = 255 & S),
                  (y.pending_buf[y.pending++] = (S >>> 8) & 255);
              }
              function H(y, S, X) {
                y.bi_valid > f - X
                  ? ((y.bi_buf |= (S << y.bi_valid) & 65535),
                    V(y, y.bi_buf),
                    (y.bi_buf = S >> (f - y.bi_valid)),
                    (y.bi_valid += X - f))
                  : ((y.bi_buf |= (S << y.bi_valid) & 65535),
                    (y.bi_valid += X));
              }
              function j(y, S, X) {
                H(y, X[2 * S], X[2 * S + 1]);
              }
              function ae(y, S) {
                for (var X = 0; (X |= 1 & y), (y >>>= 1), (X <<= 1), 0 < --S; );
                return X >>> 1;
              }
              function oe(y, S, X) {
                var O,
                  P,
                  q = new Array(m + 1),
                  J = 0;
                for (O = 1; O <= m; O++) q[O] = J = (J + X[O - 1]) << 1;
                for (P = 0; P <= S; P++) {
                  var G = y[2 * P + 1];
                  G !== 0 && (y[2 * P] = ae(q[G]++, G));
                }
              }
              function te(y) {
                var S;
                for (S = 0; S < b; S++) y.dyn_ltree[2 * S] = 0;
                for (S = 0; S < u; S++) y.dyn_dtree[2 * S] = 0;
                for (S = 0; S < p; S++) y.bl_tree[2 * S] = 0;
                (y.dyn_ltree[2 * w] = 1),
                  (y.opt_len = y.static_len = 0),
                  (y.last_lit = y.matches = 0);
              }
              function se(y) {
                8 < y.bi_valid
                  ? V(y, y.bi_buf)
                  : 0 < y.bi_valid && (y.pending_buf[y.pending++] = y.bi_buf),
                  (y.bi_buf = 0),
                  (y.bi_valid = 0);
              }
              function K(y, S, X, O) {
                var P = 2 * S,
                  q = 2 * X;
                return y[P] < y[q] || (y[P] === y[q] && O[S] <= O[X]);
              }
              function Q(y, S, X) {
                for (
                  var O = y.heap[X], P = X << 1;
                  P <= y.heap_len &&
                  (P < y.heap_len &&
                    K(S, y.heap[P + 1], y.heap[P], y.depth) &&
                    P++,
                  !K(S, O, y.heap[P], y.depth));

                )
                  (y.heap[X] = y.heap[P]), (X = P), (P <<= 1);
                y.heap[X] = O;
              }
              function ce(y, S, X) {
                var O,
                  P,
                  q,
                  J,
                  G = 0;
                if (y.last_lit !== 0)
                  for (
                    ;
                    (O =
                      (y.pending_buf[y.d_buf + 2 * G] << 8) |
                      y.pending_buf[y.d_buf + 2 * G + 1]),
                      (P = y.pending_buf[y.l_buf + G]),
                      G++,
                      O === 0
                        ? j(y, P, S)
                        : (j(y, (q = c[P]) + o + 1, S),
                          (J = A[q]) !== 0 && H(y, (P -= T[q]), J),
                          j(y, (q = R(--O)), X),
                          (J = B[q]) !== 0 && H(y, (O -= L[q]), J)),
                      G < y.last_lit;

                  );
                j(y, w, S);
              }
              function he(y, S) {
                var X,
                  O,
                  P,
                  q = S.dyn_tree,
                  J = S.stat_desc.static_tree,
                  G = S.stat_desc.has_stree,
                  ne = S.stat_desc.elems,
                  de = -1;
                for (y.heap_len = 0, y.heap_max = l, X = 0; X < ne; X++)
                  q[2 * X] !== 0
                    ? ((y.heap[++y.heap_len] = de = X), (y.depth[X] = 0))
                    : (q[2 * X + 1] = 0);
                for (; y.heap_len < 2; )
                  (q[2 * (P = y.heap[++y.heap_len] = de < 2 ? ++de : 0)] = 1),
                    (y.depth[P] = 0),
                    y.opt_len--,
                    G && (y.static_len -= J[2 * P + 1]);
                for (S.max_code = de, X = y.heap_len >> 1; 1 <= X; X--)
                  Q(y, q, X);
                for (
                  P = ne;
                  (X = y.heap[1]),
                    (y.heap[1] = y.heap[y.heap_len--]),
                    Q(y, q, 1),
                    (O = y.heap[1]),
                    (y.heap[--y.heap_max] = X),
                    (y.heap[--y.heap_max] = O),
                    (q[2 * P] = q[2 * X] + q[2 * O]),
                    (y.depth[P] =
                      (y.depth[X] >= y.depth[O] ? y.depth[X] : y.depth[O]) + 1),
                    (q[2 * X + 1] = q[2 * O + 1] = P),
                    (y.heap[1] = P++),
                    Q(y, q, 1),
                    2 <= y.heap_len;

                );
                (y.heap[--y.heap_max] = y.heap[1]),
                  (function (le, $e) {
                    var Te,
                      Re,
                      Xe,
                      ve,
                      Ae,
                      Me,
                      ue = $e.dyn_tree,
                      xe = $e.max_code,
                      Be = $e.stat_desc.static_tree,
                      me = $e.stat_desc.has_stree,
                      qe = $e.stat_desc.extra_bits,
                      Ge = $e.stat_desc.extra_base,
                      Le = $e.stat_desc.max_length,
                      Ve = 0;
                    for (ve = 0; ve <= m; ve++) le.bl_count[ve] = 0;
                    for (
                      ue[2 * le.heap[le.heap_max] + 1] = 0,
                        Te = le.heap_max + 1;
                      Te < l;
                      Te++
                    )
                      Le <
                        (ve = ue[2 * ue[2 * (Re = le.heap[Te]) + 1] + 1] + 1) &&
                        ((ve = Le), Ve++),
                        (ue[2 * Re + 1] = ve),
                        xe < Re ||
                          (le.bl_count[ve]++,
                          (Ae = 0),
                          Ge <= Re && (Ae = qe[Re - Ge]),
                          (Me = ue[2 * Re]),
                          (le.opt_len += Me * (ve + Ae)),
                          me && (le.static_len += Me * (Be[2 * Re + 1] + Ae)));
                    if (Ve !== 0) {
                      do {
                        for (ve = Le - 1; le.bl_count[ve] === 0; ) ve--;
                        le.bl_count[ve]--,
                          (le.bl_count[ve + 1] += 2),
                          le.bl_count[Le]--,
                          (Ve -= 2);
                      } while (0 < Ve);
                      for (ve = Le; ve !== 0; ve--)
                        for (Re = le.bl_count[ve]; Re !== 0; )
                          xe < (Xe = le.heap[--Te]) ||
                            (ue[2 * Xe + 1] !== ve &&
                              ((le.opt_len +=
                                (ve - ue[2 * Xe + 1]) * ue[2 * Xe]),
                              (ue[2 * Xe + 1] = ve)),
                            Re--);
                    }
                  })(y, S),
                  oe(q, de, y.bl_count);
              }
              function t(y, S, X) {
                var O,
                  P,
                  q = -1,
                  J = S[1],
                  G = 0,
                  ne = 7,
                  de = 4;
                for (
                  J === 0 && ((ne = 138), (de = 3)),
                    S[2 * (X + 1) + 1] = 65535,
                    O = 0;
                  O <= X;
                  O++
                )
                  (P = J),
                    (J = S[2 * (O + 1) + 1]),
                    (++G < ne && P === J) ||
                      (G < de
                        ? (y.bl_tree[2 * P] += G)
                        : P !== 0
                        ? (P !== q && y.bl_tree[2 * P]++, y.bl_tree[2 * D]++)
                        : G <= 10
                        ? y.bl_tree[2 * _]++
                        : y.bl_tree[2 * z]++,
                      (q = P),
                      (de =
                        (G = 0) === J
                          ? ((ne = 138), 3)
                          : P === J
                          ? ((ne = 6), 3)
                          : ((ne = 7), 4)));
              }
              function N(y, S, X) {
                var O,
                  P,
                  q = -1,
                  J = S[1],
                  G = 0,
                  ne = 7,
                  de = 4;
                for (J === 0 && ((ne = 138), (de = 3)), O = 0; O <= X; O++)
                  if (
                    ((P = J), (J = S[2 * (O + 1) + 1]), !(++G < ne && P === J))
                  ) {
                    if (G < de) for (; j(y, P, y.bl_tree), --G != 0; );
                    else
                      P !== 0
                        ? (P !== q && (j(y, P, y.bl_tree), G--),
                          j(y, D, y.bl_tree),
                          H(y, G - 3, 2))
                        : G <= 10
                        ? (j(y, _, y.bl_tree), H(y, G - 3, 3))
                        : (j(y, z, y.bl_tree), H(y, G - 11, 7));
                    (q = P),
                      (de =
                        (G = 0) === J
                          ? ((ne = 138), 3)
                          : P === J
                          ? ((ne = 6), 3)
                          : ((ne = 7), 4));
                  }
              }
              i(L);
              var F = !1;
              function v(y, S, X, O) {
                H(y, (h << 1) + (O ? 1 : 0), 3),
                  (function (P, q, J, G) {
                    se(P),
                      G && (V(P, J), V(P, ~J)),
                      n.arraySet(P.pending_buf, P.window, q, J, P.pending),
                      (P.pending += J);
                  })(y, S, X, !0);
              }
              (a._tr_init = function (y) {
                F ||
                  ((function () {
                    var S,
                      X,
                      O,
                      P,
                      q,
                      J = new Array(m + 1);
                    for (P = O = 0; P < g - 1; P++)
                      for (T[P] = O, S = 0; S < 1 << A[P]; S++) c[O++] = P;
                    for (c[O - 1] = P, P = q = 0; P < 16; P++)
                      for (L[P] = q, S = 0; S < 1 << B[P]; S++) M[q++] = P;
                    for (q >>= 7; P < u; P++)
                      for (L[P] = q << 7, S = 0; S < 1 << (B[P] - 7); S++)
                        M[256 + q++] = P;
                    for (X = 0; X <= m; X++) J[X] = 0;
                    for (S = 0; S <= 143; ) (W[2 * S + 1] = 8), S++, J[8]++;
                    for (; S <= 255; ) (W[2 * S + 1] = 9), S++, J[9]++;
                    for (; S <= 279; ) (W[2 * S + 1] = 7), S++, J[7]++;
                    for (; S <= 287; ) (W[2 * S + 1] = 8), S++, J[8]++;
                    for (oe(W, b + 1, J), S = 0; S < u; S++)
                      (E[2 * S + 1] = 5), (E[2 * S] = ae(S, 5));
                    (U = new Z(W, A, o + 1, b, m)),
                      (C = new Z(E, B, 0, u, m)),
                      (Y = new Z(new Array(0), k, 0, p, x));
                  })(),
                  (F = !0)),
                  (y.l_desc = new $(y.dyn_ltree, U)),
                  (y.d_desc = new $(y.dyn_dtree, C)),
                  (y.bl_desc = new $(y.bl_tree, Y)),
                  (y.bi_buf = 0),
                  (y.bi_valid = 0),
                  te(y);
              }),
                (a._tr_stored_block = v),
                (a._tr_flush_block = function (y, S, X, O) {
                  var P,
                    q,
                    J = 0;
                  0 < y.level
                    ? (y.strm.data_type === 2 &&
                        (y.strm.data_type = (function (G) {
                          var ne,
                            de = 4093624447;
                          for (ne = 0; ne <= 31; ne++, de >>>= 1)
                            if (1 & de && G.dyn_ltree[2 * ne] !== 0) return r;
                          if (
                            G.dyn_ltree[18] !== 0 ||
                            G.dyn_ltree[20] !== 0 ||
                            G.dyn_ltree[26] !== 0
                          )
                            return s;
                          for (ne = 32; ne < o; ne++)
                            if (G.dyn_ltree[2 * ne] !== 0) return s;
                          return r;
                        })(y)),
                      he(y, y.l_desc),
                      he(y, y.d_desc),
                      (J = (function (G) {
                        var ne;
                        for (
                          t(G, G.dyn_ltree, G.l_desc.max_code),
                            t(G, G.dyn_dtree, G.d_desc.max_code),
                            he(G, G.bl_desc),
                            ne = p - 1;
                          3 <= ne && G.bl_tree[2 * I[ne] + 1] === 0;
                          ne--
                        );
                        return (G.opt_len += 3 * (ne + 1) + 5 + 5 + 4), ne;
                      })(y)),
                      (P = (y.opt_len + 3 + 7) >>> 3),
                      (q = (y.static_len + 3 + 7) >>> 3) <= P && (P = q))
                    : (P = q = X + 5),
                    X + 4 <= P && S !== -1
                      ? v(y, S, X, O)
                      : y.strategy === 4 || q === P
                      ? (H(y, 2 + (O ? 1 : 0), 3), ce(y, W, E))
                      : (H(y, 4 + (O ? 1 : 0), 3),
                        (function (G, ne, de, le) {
                          var $e;
                          for (
                            H(G, ne - 257, 5),
                              H(G, de - 1, 5),
                              H(G, le - 4, 4),
                              $e = 0;
                            $e < le;
                            $e++
                          )
                            H(G, G.bl_tree[2 * I[$e] + 1], 3);
                          N(G, G.dyn_ltree, ne - 1), N(G, G.dyn_dtree, de - 1);
                        })(
                          y,
                          y.l_desc.max_code + 1,
                          y.d_desc.max_code + 1,
                          J + 1,
                        ),
                        ce(y, y.dyn_ltree, y.dyn_dtree)),
                    te(y),
                    O && se(y);
                }),
                (a._tr_tally = function (y, S, X) {
                  return (
                    (y.pending_buf[y.d_buf + 2 * y.last_lit] = (S >>> 8) & 255),
                    (y.pending_buf[y.d_buf + 2 * y.last_lit + 1] = 255 & S),
                    (y.pending_buf[y.l_buf + y.last_lit] = 255 & X),
                    y.last_lit++,
                    S === 0
                      ? y.dyn_ltree[2 * X]++
                      : (y.matches++,
                        S--,
                        y.dyn_ltree[2 * (c[X] + o + 1)]++,
                        y.dyn_dtree[2 * R(S)]++),
                    y.last_lit === y.lit_bufsize - 1
                  );
                }),
                (a._tr_align = function (y) {
                  H(y, 2, 3),
                    j(y, w, W),
                    (function (S) {
                      S.bi_valid === 16
                        ? (V(S, S.bi_buf), (S.bi_buf = 0), (S.bi_valid = 0))
                        : 8 <= S.bi_valid &&
                          ((S.pending_buf[S.pending++] = 255 & S.bi_buf),
                          (S.bi_buf >>= 8),
                          (S.bi_valid -= 8));
                    })(y);
                });
            },
            { "../utils/common": 41 },
          ],
          53: [
            function (e, d, a) {
              "use strict";
              d.exports = function () {
                (this.input = null),
                  (this.next_in = 0),
                  (this.avail_in = 0),
                  (this.total_in = 0),
                  (this.output = null),
                  (this.next_out = 0),
                  (this.avail_out = 0),
                  (this.total_out = 0),
                  (this.msg = ""),
                  (this.state = null),
                  (this.data_type = 2),
                  (this.adler = 0);
              };
            },
            {},
          ],
          54: [
            function (e, d, a) {
              (function (n) {
                (function (r, s) {
                  "use strict";
                  if (!r.setImmediate) {
                    var i,
                      h,
                      g,
                      o,
                      b = 1,
                      u = {},
                      p = !1,
                      l = r.document,
                      m = Object.getPrototypeOf && Object.getPrototypeOf(r);
                    (m = m && m.setTimeout ? m : r),
                      (i =
                        {}.toString.call(r.process) === "[object process]"
                          ? function (D) {
                              process.nextTick(function () {
                                x(D);
                              });
                            }
                          : (function () {
                              if (r.postMessage && !r.importScripts) {
                                var D = !0,
                                  _ = r.onmessage;
                                return (
                                  (r.onmessage = function () {
                                    D = !1;
                                  }),
                                  r.postMessage("", "*"),
                                  (r.onmessage = _),
                                  D
                                );
                              }
                            })()
                          ? ((o = "setImmediate$" + Math.random() + "$"),
                            r.addEventListener
                              ? r.addEventListener("message", w, !1)
                              : r.attachEvent("onmessage", w),
                            function (D) {
                              r.postMessage(o + D, "*");
                            })
                          : r.MessageChannel
                          ? (((g = new MessageChannel()).port1.onmessage =
                              function (D) {
                                x(D.data);
                              }),
                            function (D) {
                              g.port2.postMessage(D);
                            })
                          : l &&
                            "onreadystatechange" in l.createElement("script")
                          ? ((h = l.documentElement),
                            function (D) {
                              var _ = l.createElement("script");
                              (_.onreadystatechange = function () {
                                x(D),
                                  (_.onreadystatechange = null),
                                  h.removeChild(_),
                                  (_ = null);
                              }),
                                h.appendChild(_);
                            })
                          : function (D) {
                              setTimeout(x, 0, D);
                            }),
                      (m.setImmediate = function (D) {
                        typeof D != "function" && (D = new Function("" + D));
                        for (
                          var _ = new Array(arguments.length - 1), z = 0;
                          z < _.length;
                          z++
                        )
                          _[z] = arguments[z + 1];
                        var A = { callback: D, args: _ };
                        return (u[b] = A), i(b), b++;
                      }),
                      (m.clearImmediate = f);
                  }
                  function f(D) {
                    delete u[D];
                  }
                  function x(D) {
                    if (p) setTimeout(x, 0, D);
                    else {
                      var _ = u[D];
                      if (_) {
                        p = !0;
                        try {
                          (function (z) {
                            var A = z.callback,
                              B = z.args;
                            switch (B.length) {
                              case 0:
                                A();
                                break;
                              case 1:
                                A(B[0]);
                                break;
                              case 2:
                                A(B[0], B[1]);
                                break;
                              case 3:
                                A(B[0], B[1], B[2]);
                                break;
                              default:
                                A.apply(s, B);
                            }
                          })(_);
                        } finally {
                          f(D), (p = !1);
                        }
                      }
                    }
                  }
                  function w(D) {
                    D.source === r &&
                      typeof D.data == "string" &&
                      D.data.indexOf(o) === 0 &&
                      x(+D.data.slice(o.length));
                  }
                })(typeof self > "u" ? (n === void 0 ? this : n) : self);
              }).call(
                this,
                typeof global < "u"
                  ? global
                  : typeof self < "u"
                  ? self
                  : typeof window < "u"
                  ? window
                  : {},
              );
            },
            {},
          ],
        },
        {},
        [10],
      )(10);
    });
  });
  var Ft =
      "Eccentricity r is distance from fixation, in degrees. Log level = log\u2081\u2080[(spacing or size) / 1\xB0].",
    At =
      "A and B are consistent with the logged triplet width. The data do not identify which occurred.",
    Nt = (e) => {
      let d = e.corrected + e.ranged,
        a = [];
      e.corrected &&
        e.ranged > 0 &&
        a.push(`${e.corrected} trials have exact recovered geometry.`),
        e.discreteScenarios &&
          a.push(
            `${e.discreteScenarios} trials have two fixation candidates consistent with the logged triplet width.`,
          ),
        e.continuousRanges &&
          a.push(
            `${e.continuousRanges} trials have approximate continuous ranges.`,
          );
      let n = e.ranged - e.discreteScenarios - e.continuousRanges;
      return (
        n > 0 && a.push(`${n} trials have ranged recovered geometry.`),
        {
          count: d,
          heading:
            e.ranged === 0
              ? "trials with exact recovered geometry"
              : e.corrected === 0
              ? "trials with candidates or ranges"
              : "trials with repair output",
          sentences: a,
        }
      );
    },
    Lt = (e, d) => {
      let a = [
        ...new Set(
          e.filter(
            (n, r) => n && (!d || ["CORRECTED", "RANGED"].includes(d[r])),
          ),
        ),
      ];
      return a.length !== 1
        ? "size or spacing"
        : a[0] === "spacingDeg"
        ? "spacing"
        : a[0] === "targetSizeDeg"
        ? "size"
        : a[0] === "flankerSpacingDeg"
        ? "flanker spacing"
        : "size or spacing";
    },
    tt = (e, d, a) => {
      let n = `${a ? "midpoint" : "recovered"} ${d}`,
        r = Math.abs(e).toFixed(1);
      return e === 0
        ? `The median change in ${n} is ${r}%.`
        : `The median ${
            e > 0 ? "increase" : "decrease"
          } in ${n}, relative to the requested value, is ${r}%.`;
    },
    It = ".csv,.zip",
    Bt = (e, d) =>
      d === "all"
        ? !0
        : d === "review"
        ? e === "FLAGGED"
        : e === "CORRECTED" || e === "RANGED",
    mt = (e) => Number.isFinite(e[2]) && Number.isFinite(e[3]),
    Ot = (e) => {
      let d = e
          .flatMap((n) => n.slice(0, 4))
          .filter((n) => typeof n == "number" && Number.isFinite(n)),
        a = Math.max(...d);
      return Number.isFinite(a) && a > 0 ? a * 1.1 : 1;
    },
    pt = (e) => e.filter((d) => Number.isFinite(d)),
    st = (e) => {
      if (!e.length) return;
      let d = [...e].sort((n, r) => n - r),
        a = Math.floor(d.length / 2);
      return d.length % 2 ? d[a] : (d[a - 1] + d[a]) / 2;
    },
    Xt = (e) => ({
      fileCount: e.length,
      eccentricityMedian: st(pt(e.map((d) => d.eccentricity))),
      spacingMedian: st(pt(e.map((d) => d.spacing))),
      uncertaintyMedian: st(pt(e.map((d) => d.uncertainty))),
      quantity:
        new Set(e.map((d) => d.quantity)).size === 1 && e.length
          ? e[0].quantity
          : "size or spacing",
    }),
    gt = (e) =>
      String(e)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    Mt = (e, d = 1) => `${e >= 0 ? "+" : "\u2212"}${Math.abs(e).toFixed(d)}%`,
    bt = (e, d, a) => {
      let n = e.filter((z) => Number.isFinite(z[d]));
      if (!n.length) return "";
      let r = n.map((z) => z[d]),
        s = st(r),
        i = Math.min(...r, 0),
        h = Math.max(...r, 0),
        g = h - i || Math.max(1, Math.abs(h) * 0.2),
        o = i - g * 0.08,
        b = h + g * 0.08,
        u = 520,
        p = 155,
        l = 38,
        m = 16,
        f = 116,
        x = (z) => l + ((z - o) / (b - o)) * (u - l - m),
        w = [o, (o + b) / 2, b]
          .map(
            (z) =>
              `<line x1="${x(z)}" y1="${f}" x2="${x(z)}" y2="${
                f + 5
              }" stroke="#8b9499"/><text x="${x(z)}" y="${
                f + 20
              }" text-anchor="middle" font-size="10" fill="#555">${z.toFixed(
                1,
              )}%</text>`,
          )
          .join(""),
        D = n
          .map(
            (z, A) =>
              `<circle cx="${x(z[d])}" cy="${43 + (A % 3) * 18}" r="5" fill="${
                z.mode === "midpoint" ? "#365a77" : "#b26a00"
              }" fill-opacity="0.82"><title>${gt(z.label)}: ${Mt(
                z[d],
              )}</title></circle>`,
          )
          .join(""),
        _ =
          o < 0 && b > 0
            ? `<line x1="${x(0)}" y1="25" x2="${x(
                0,
              )}" y2="${f}" stroke="#aab2b7" stroke-dasharray="3 3"/>${
                Math.abs((o + b) / 2) > (b - o) * 0.06
                  ? `<text x="${x(0)}" y="${
                      f + 20
                    }" text-anchor="middle" font-size="10" fill="#555">0%</text>`
                  : ""
              }`
            : "";
      return `<svg viewBox="0 0 ${u} ${p}" class="distribution-plot" role="img" aria-label="Distribution of per-file median ${gt(
        a,
      )} change">
    <line x1="${l}" y1="${f}" x2="${u - m}" y2="${f}" stroke="#aab2b7"/>
    ${w}${_}
    <line x1="${x(s)}" y1="25" x2="${x(
      s,
    )}" y2="${f}" stroke="#0b6e4f" stroke-width="2"/>
    <text x="${Math.max(
      65,
      Math.min(u - 65, x(s)),
    )}" y="17" text-anchor="middle" font-size="12" font-weight="600" fill="#0b6e4f">Median: ${Mt(
      s,
    )}</text>
    ${D}
    <text x="${
      u / 2
    }" y="151" text-anchor="middle" font-size="11" fill="#444">Per-file median ${gt(
      a,
    )} change (%)</text>
  </svg>`;
    },
    Yt = (e, d, a = 50) => {
      let n = Math.max(1, Math.trunc(a) || 1),
        r = e.length,
        s = Math.max(1, Math.ceil(r / n)),
        i = Number.isFinite(d) ? Math.trunc(d) : 0,
        h = Math.min(s - 1, Math.max(0, i)),
        g = h * n,
        o = Math.min(g + n, r);
      return {
        items: e.slice(g, o),
        page: h,
        pageCount: s,
        start: g,
        end: o,
        total: r,
        label: r ? `${g + 1}\u2013${o} of ${r}` : "0 of 0",
      };
    };
  var kt = Sn(jt());
  var qt = (e) =>
      Array.isArray(e) &&
      e.length === 2 &&
      typeof e[0] == "number" &&
      typeof e[1] == "number",
    Wt = (e, d, a) => {
      let n = Math.sqrt(e[0] * e[0] + e[1] * e[1]);
      if (n == 0) return [0, 0];
      let s = Math.atan2(n / d, a) * (180 / Math.PI);
      return [(e[0] * s) / n, (e[1] * s) / n];
    },
    Zt = (e, d, a) => {
      let n = Math.sqrt(e[0] * e[0] + e[1] * e[1]);
      if (n >= 90) {
        let s = 89.99999999 / n;
        return Zt([e[0] * s, e[1] * s], d, a);
      }
      let r = d * a * Math.tan((n * Math.PI) / 180);
      return n == 0 ? [0, 0] : [(e[0] * r) / n, (e[1] * r) / n];
    },
    Ht = (e) => {
      let d = Wt(
        [
          e.fixationXYPx[0] - e.nearestPointXYZPx[0],
          e.fixationXYPx[1] - e.nearestPointXYZPx[1],
        ],
        e.pxPerCm,
        e.viewingDistanceCm,
      );
      return [-d[0], -d[1]];
    },
    be = (e, d) => {
      let a = Ht(d),
        n = (r) => {
          let s = [r[0] - a[0], r[1] - a[1]],
            i = Zt(s, d.pxPerCm, d.viewingDistanceCm);
          return [i[0] + d.nearestPointXYZPx[0], i[1] + d.nearestPointXYZPx[1]];
        };
      return qt(e) ? n(e) : e.map(n);
    },
    _e = (e, d) => {
      let a = Ht(d),
        n = (r) => {
          let s = [
              r[0] - d.nearestPointXYZPx[0],
              r[1] - d.nearestPointXYZPx[1],
            ],
            i = Wt(s, d.pxPerCm, d.viewingDistanceCm);
          return [i[0] + a[0], i[1] + a[1]];
        };
      return qt(e) ? n(e) : e.map(n);
    };
  var je = (e) => {
      e.charCodeAt(0) === 65279 && (e = e.slice(1));
      let d = [],
        a = [],
        n = "",
        r = !1,
        s = () => {
          a.push(n.trim()), (n = "");
        },
        i = () => {
          (a.length > 1 || a[0] !== "") && d.push(a), (a = []);
        };
      for (let h = 0; h < e.length; h++) {
        let g = e[h];
        r
          ? g === '"'
            ? e[h + 1] === '"'
              ? ((n += '"'), h++)
              : (r = !1)
            : (n += g)
          : g === '"'
          ? (r = !0)
          : g === ","
          ? s()
          : g ===
              `
` || g === "\r"
          ? (g === "\r" &&
              e[h + 1] ===
                `
` &&
              h++,
            s(),
            i())
          : (n += g);
      }
      return s(), i(), { header: d[0] ?? [], rows: d.slice(1) };
    },
    we = (e) => {
      if (e === void 0) return;
      let d = Number(e);
      return Number.isFinite(d) ? d : void 0;
    },
    ot = (e) => {
      let d = e.match(/(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!d) return;
      let a = Number(d[1]),
        n = Number(d[2]);
      return Number.isFinite(a) && Number.isFinite(n) ? [a, n] : void 0;
    },
    en = (e) => {
      let d = e.match(
        /\[\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*,\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\]/,
      );
      if (!d) return;
      let a = d.slice(1).map(Number);
      return a.every(Number.isFinite)
        ? [
            [a[0], a[1]],
            [a[2], a[3]],
          ]
        : void 0;
    },
    kn = (e, d, a) => [e[0] - d / 2, a / 2 - e[1]],
    Gt = (e) => {
      let d = e?.match(/width\s*:\s*([\d.]+)/),
        a = d ? Number(d[1]) : void 0;
      return a !== void 0 && Number.isFinite(a) && a > 0 ? a : void 0;
    },
    tn = (e, d) => Math.hypot(e[0] - d[0], e[1] - d[1]),
    nn = (e, d, a, n) => {
      let r = be(e, a),
        s = _e([r[0] - d / 2, r[1]], n),
        i = _e([r[0] + d / 2, r[1]], n);
      return tn(s, i) / 3;
    },
    Vt = (e, d, a = [], n = !1) => {
      let r = [
          [-d.screenW / 2, -d.screenH / 2],
          [d.screenW / 2, d.screenH / 2],
        ],
        s = n ? 3 : 2,
        i = (l) => ({
          pxPerCm: d.pxPerCm,
          viewingDistanceCm: n ? l[2] : d.viewingDistanceCm,
          fixationXYPx: d.fixationXYPx ?? [0, 0],
          nearestPointXYZPx: [l[0], l[1]],
        }),
        h = (l) => {
          let m = 0;
          for (let f = 0; f < 2; f++) {
            let x = _e(r[f], i(l)),
              w = x[0] - e[f][0],
              D = x[1] - e[f][1];
            m += w * w + D * D;
          }
          return Math.sqrt(m);
        },
        g = (l) => (n ? [...l, d.viewingDistanceCm] : [...l]),
        o = [
          ...a.map((l) => g([...l])),
          g([0, 0]),
          g([d.screenW / 2, d.screenH / 2]),
          g([d.screenW / 4, d.screenH / 4]),
        ],
        b = o[0],
        u = h(b);
      for (let l of o.slice(1)) {
        let m = h(l);
        m < u && ((u = m), (b = l));
      }
      let p = Math.max(d.screenW, d.screenH) / 8;
      for (; p >= 0.25; ) {
        let l = !0;
        for (; l; ) {
          l = !1;
          for (let m = 0; m < s; m++)
            for (let f of [1, -1]) {
              let x = [...b];
              x[m] += f * p;
              let w = h(x);
              w < u - 1e-12 && ((u = w), (b = x), (l = !0));
            }
        }
        p /= 2;
      }
      return {
        nearest: [b[0], b[1]],
        viewingDistanceCm: b[2] ?? d.viewingDistanceCm,
        residualDeg: u,
      };
    },
    xt = 0.15,
    ct = 150,
    Kt = 2.5,
    Jt = 3,
    Qt = (e, d, a) =>
      e[0] > 0.1 * d && e[0] < 0.9 * d && e[1] > -0.25 * a && e[1] < 0.95 * a,
    $n = (e, d, a) => Math.abs(e[0]) < 0.4 * d && Math.abs(e[1]) < 0.4 * a,
    Rn = (e, d, a) => {
      if (
        (e("fixationLocationStrategy") ?? "centerFixation") !== "centerFixation"
      )
        return [0, 0];
      let r = (e("fixationOriginXYScreen") ?? "0.5, 0.5").match(
        /([\d.]+)\s*,\s*([\d.]+)/,
      );
      if (!r) return [0, 0];
      let s = Number(r[1]),
        i = Number(r[2]),
        h = we(e("targetImageSpareFraction") ?? "");
      if (h && h > 0) {
        let g = e("targetImageWhere") ?? "top",
          o = 0,
          b = 1,
          u = 0,
          p = 1;
        g === "top"
          ? (u = h)
          : g === "bottom"
          ? (p = 1 - h)
          : g === "left"
          ? (b = 1 - h)
          : (o = h),
          (s = o + s * (b - o)),
          (i = u + i * (p - u));
      }
      return [
        Math.round((2 * s - 1) * (d / 2)),
        Math.round((2 * i - 1) * (a / 2)),
      ];
    },
    ze = (e) => ({
      status: "FLAGGED",
      statusReason: e,
      columns: { repairStatus: "FLAGGED", repairStatusReason: e },
    }),
    Cn = (e, d, a) => {
      let n = be([e[0], e[1] + d], a),
        r = be([e[0], e[1] - d], a);
      return tn(n, r) / 2;
    },
    zn = (e) => {
      let {
          nearestUsed: d,
          nearestCorrect: a,
          pxPerCm: n,
          viewingDistanceCm: r,
          nominalFixationXYPx: s,
          motionRadiusDeg: i,
          targetXYDeg: h,
          drawnWidthPx: g,
        } = e,
        o = {
          pxPerCm: n,
          viewingDistanceCm: r,
          fixationXYPx: s,
          nearestPointXYZPx: d,
        },
        b = { ...o, nearestPointXYZPx: a },
        u = be([i, 0], o)[0];
      if (!Number.isFinite(u) || u <= 0) return;
      let p = (Y) => [s[0] + u * Math.cos(Y), s[1] + u * Math.sin(Y)],
        l = (Y, L) => {
          let Z = { ...o, fixationXYPx: Y },
            $ = { ...b, fixationXYPx: Y },
            R = be(h, Z),
            V = _e(R, $);
          return {
            center: R,
            actualXY: V,
            actualR: Math.hypot(V[0], V[1]),
            spacing: nn(h, L, Z, $),
          };
        },
        m = (() => {
          let { fontSizePx: Y, fontMaxPx: L, fontPadding: Z } = e;
          if (
            Y === void 0 ||
            L === void 0 ||
            Z === void 0 ||
            !(Y > 0) ||
            !(e.requestedLevelDeg > 0) ||
            !e.fontBoundingBoxReNominalRect
          )
            return;
          let $ = L / (1 + Z);
          if (Y >= $ - 1e-4) return;
          let R = en(e.fontBoundingBoxReNominalRect);
          if (!R) return;
          let V = R[1][0] - R[0][0],
            j = [V, (V * n * 2.54) / 72]
              .map((ae) => ({ widthPerFont: ae, drawn: Y * ae }))
              .sort(
                (ae, oe) => Math.abs(ae.drawn - g) - Math.abs(oe.drawn - g),
              )[0];
          if (!(Math.abs(j.drawn - g) > Math.max(5, g * 0.02)))
            return { stepPx: j.drawn / 3, residualPx: j.drawn - g };
        })(),
        f = [];
      if (m !== void 0) {
        let Y = (L) =>
          Cn(h, e.requestedLevelDeg, { ...o, fixationXYPx: p(L) }) - m.stepPx;
        for (let L = 0; L < 360; L++) {
          let Z = (L * 2 * Math.PI) / 360,
            $ = ((L + 1) * 2 * Math.PI) / 360,
            R = Y(Z),
            V = Y($);
          if (R * V < 0) {
            let H = Z,
              j = $,
              ae = R;
            for (let te = 0; te < 40; te++) {
              let se = (H + j) / 2,
                K = Y(se);
              ae * K <= 0 ? (j = se) : ((H = se), (ae = K));
            }
            let oe = (H + j) / 2;
            f.some(
              (te) =>
                Math.abs(Math.atan2(Math.sin(te - oe), Math.cos(te - oe))) <
                1e-4,
            ) || f.push(oe);
          }
        }
      }
      let x = f.length
          ? f
          : Array.from({ length: 360 }, (Y, L) => (L * 2 * Math.PI) / 360),
        w = { x: 1 / 0, y: 1 / 0, r: 1 / 0, spacing: 1 / 0 },
        D = { x: -1 / 0, y: -1 / 0, r: -1 / 0, spacing: -1 / 0 },
        _ = { x: 0, y: 0, r: 0, spacing: 0 },
        z = { x: 0, y: 0, r: 0, spacing: 0 },
        A = (2 * Math.PI) / 360;
      for (let Y of x) {
        let L = p(Y);
        for (let Z of [g - 0.5, g + 0.5]) {
          let $ = l(L, Z);
          $.actualXY[0] < w.x && ((w.x = $.actualXY[0]), (_.x = Y)),
            $.actualXY[0] > D.x && ((D.x = $.actualXY[0]), (z.x = Y)),
            $.actualXY[1] < w.y && ((w.y = $.actualXY[1]), (_.y = Y)),
            $.actualXY[1] > D.y && ((D.y = $.actualXY[1]), (z.y = Y)),
            $.actualR < w.r && ((w.r = $.actualR), (_.r = Y)),
            $.actualR > D.r && ((D.r = $.actualR), (z.r = Y)),
            $.spacing < w.spacing && ((w.spacing = $.spacing), (_.spacing = Y)),
            $.spacing > D.spacing && ((D.spacing = $.spacing), (z.spacing = Y));
        }
      }
      let B = (Y, L, Z) => {
        let $ = (H) => {
            let ae = [g - 0.5, g + 0.5]
              .map(
                (oe) =>
                  l(p(H), oe)[
                    Y === "spacing"
                      ? "spacing"
                      : Y === "r"
                      ? "actualR"
                      : "actualXY"
                  ],
              )
              .map((oe) =>
                Y === "spacing" || Y === "r" ? oe : oe[Y === "x" ? 0 : 1],
              );
            return Z ? Math.max(...ae) : Math.min(...ae);
          },
          R = L - A,
          V = L + A;
        for (let H = 0; H < 28; H++) {
          let j = R + (V - R) / 3,
            ae = V - (V - R) / 3,
            oe = $(j),
            te = $(ae);
          (Z && oe > te) || (!Z && oe < te) ? (V = ae) : (R = j);
        }
        return $((R + V) / 2);
      };
      if (
        (f.length ||
          ((w.x = B("x", _.x, !1)),
          (D.x = B("x", z.x, !0)),
          (w.y = B("y", _.y, !1)),
          (D.y = B("y", z.y, !0)),
          (w.r = B("r", _.r, !1)),
          (D.r = B("r", z.r, !0)),
          (w.spacing = B("spacing", _.spacing, !1)),
          (D.spacing = B("spacing", z.spacing, !0))),
        ![w.x, w.y, w.r, w.spacing, D.x, D.y, D.r, D.spacing].every(
          Number.isFinite,
        ))
      )
        return;
      let k = l(s, g),
        I = f.map((Y) => ({ angle: Y, fixation: p(Y), result: l(p(Y), g) })),
        W = (w.spacing + D.spacing) / 2,
        E = (w.r + D.r) / 2,
        M = f.length
          ? `ranged: ${
              f.length
            } model-consistent fixation scenarios from the rendered-width equation; extrema across scenarios and \xB10.5 px width rounding${
              e.extraNote ?? ""
            }`
          : `approximate range: frozen crosshair position not logged; adaptively refined estimates over the ${i}-degree circular path and the rendered triplet width's \xB10.5 px rounding${
              e.extraNote ?? ""
            }`,
        c = `${d[0].toFixed(1)}, ${d[1].toFixed(1)}`,
        T = `${a[0].toFixed(1)}, ${a[1].toFixed(1)}`,
        U = f.length ? "actual" : "approximate",
        C = {
          repairStatus: "RANGED",
          repairStatusReason: M,
          nearestUsedXY: c,
          nearestCorrectXY: T,
          referenceNominalCenterTargetEccentricityXDeg:
            k.actualXY[0].toFixed(4),
          referenceNominalCenterTargetEccentricityYDeg:
            k.actualXY[1].toFixed(4),
          [`${U}TargetEccentricityXDegMin`]: w.x.toFixed(4),
          [`${U}TargetEccentricityXDegMax`]: D.x.toFixed(4),
          [`${U}TargetEccentricityYDegMin`]: w.y.toFixed(4),
          [`${U}TargetEccentricityYDegMax`]: D.y.toFixed(4),
          referenceNominalCenterTargetEccentricityRDeg: k.actualR.toFixed(4),
          [`${U}TargetEccentricityRDegMin`]: w.r.toFixed(4),
          [`${U}TargetEccentricityRDegMax`]: D.r.toFixed(4),
          midpointTargetEccentricityRDeg: E.toFixed(4),
          referenceNominalCenterDrawnTargetXYPx: `${k.center[0].toFixed(
            1,
          )}, ${k.center[1].toFixed(1)}`,
          drawnTripletWidthPx: g.toFixed(1),
          fixationMotionRadiusPx: u.toFixed(3),
          referenceNominalCenterSpacingDeg: k.spacing.toFixed(4),
          [`${U}SpacingDegMin`]: w.spacing.toFixed(4),
          [`${U}SpacingDegMax`]: D.spacing.toFixed(4),
          midpointSpacingDeg: W.toFixed(4),
          referenceNominalCenterLevelLog10Deg: Math.log10(k.spacing).toFixed(4),
          [`${U}LevelLog10DegMin`]: Math.log10(w.spacing).toFixed(4),
          [`${U}LevelLog10DegMax`]: Math.log10(D.spacing).toFixed(4),
          midpointLevelLog10Deg: Math.log10(W).toFixed(4),
          fixationCandidateCount: String(f.length),
          scenarioCount: f.length ? String(f.length) : "continuous",
          rangeMode: f.length ? "two-candidates" : "continuous",
        };
      return (
        m !== void 0 && (C.widthEquationResidualPx = m.residualPx.toFixed(3)),
        f.length &&
          ((C.fixationCandidatesXYPx = I.map(
            (Y) => `${Y.fixation[0].toFixed(1)}, ${Y.fixation[1].toFixed(1)}`,
          ).join("; ")),
          I.forEach((Y, L) => {
            let Z = L === 0 ? "A" : "B";
            (C[`fixationXYPxScenario${Z}`] = `${Y.fixation[0].toFixed(
              1,
            )}, ${Y.fixation[1].toFixed(1)}`),
              (C[`actualSpacingDegScenario${Z}`] = Y.result.spacing.toFixed(4)),
              (C[`actualLevelLog10DegScenario${Z}`] = Math.log10(
                Y.result.spacing,
              ).toFixed(4)),
              (C[`actualTargetEccentricityRDegScenario${Z}`] =
                Y.result.actualR.toFixed(4));
          })),
        {
          status: "RANGED",
          statusReason: M,
          nearestUsedXY: d,
          nearestCorrectXY: a,
          columns: C,
        }
      );
    },
    lt = (e) => {
      if (/-repaired(\.results)?\.csv$/i.test(e)) return e;
      let d = e.match(/^(.*?)(\.results)?\.csv$/i);
      return d ? `${d[1]}-repaired${d[2] ?? ""}.csv` : `${e}-repaired.csv`;
    },
    rn = (e) => {
      let { header: d, rows: a } = je(e);
      if (d.includes("repairStatus") || d.includes("repairImputedColumns"))
        return {
          rows: [],
          summary: {
            total: a.length,
            corrected: 0,
            ranged: 0,
            discreteScenarios: 0,
            continuousRanges: 0,
            unaffected: 0,
            flagged: 0,
            ignored: 0,
            unsupported: 0,
            alreadyRepaired: !0,
          },
        };
      if (!a.length) throw new Error("no data rows \u2014 not a results file");
      let n = (T) => d.indexOf(T),
        r = (T, U) => {
          let C = n(U);
          if (C < 0) return;
          let Y = T[C];
          return Y === "" ? void 0 : Y;
        },
        s = (T) => {
          for (let U of a) {
            let C = r(U, T);
            if (C !== void 0) return C;
          }
        },
        i = we(s("screenWidthPx")),
        h = we(s("screenHeightPx")),
        g = we(s("pxPerCm")),
        o = "2025-08-30",
        b = "2026-09-15",
        u = s("date") ?? "",
        p = u.match(/(\d{4})-(\d{2})-(\d{2})/),
        l = p ? `${p[1]}-${p[2]}-${p[3]}` : "",
        m = !!l && l < o,
        f = !!l && l < b,
        x = [
          "nearpointXYPxAppleCoords",
          "screenBoundingRectDeg",
          "targetEccentricityXDeg",
          "targetEccentricityYDeg",
          "markingFixationMotionRadiusDeg",
          "markingFixationMotionPath",
          "markingFixationAfterTargetOnset",
          "markingFixationMotionSpeedDegPerSec",
          "spacingRelationToSize",
          "thresholdParameter",
          "level",
          "targetKind",
          "fixationOriginXYScreen",
          "fixationLocationStrategy",
          "spacingDirection",
          "targetSizeIsHeightBool",
          "targetImageSpareFraction",
          "targetImageWhere",
          "spacingDeg",
          "targetSizeDeg",
          "flankerSpacingDeg",
          "distanceCm",
          "viewingDistancePredictedCm",
          "viewingDistanceDesiredCm",
          "pxPerCm",
          "screenWidthPx",
          "screenHeightPx",
        ],
        w = a.map((T) => [...T]),
        D = new Map();
      w.forEach((T) => {
        for (let U of x) {
          let C = n(U);
          if (C < 0) continue;
          let Y = T[C];
          Y !== "" && Y !== void 0
            ? D.set(U, Y)
            : D.has(U) && (T[C] = D.get(U));
        }
      });
      let _ = (T, U) => {
          let C = n(U);
          if (C < 0) return;
          let Y = T[C];
          return Y === "" ? void 0 : Y;
        },
        z = a.map(() => ze("not assessed")),
        A = 0,
        B = 0,
        k = 0,
        I = 0,
        W = 0,
        E = 0,
        M = 0,
        c = 0;
      a.forEach((T, U) => {
        let C = w[U],
          Y = _(C, "nearpointXYPxAppleCoords"),
          L = _(C, "screenBoundingRectDeg"),
          Z = _(C, "nearestXYPx"),
          $ = we(_(C, "targetEccentricityXDeg")),
          R = we(_(C, "targetEccentricityYDeg")),
          V = we(_(C, "markingFixationMotionRadiusDeg")),
          H = we(_(C, "markingFixationMotionSpeedDegPerSec")),
          j = V !== void 0 && V > 0 && (H === void 0 || H > 0),
          ae = _(C, "thresholdParameter"),
          oe = we(_(C, "level"));
        if (
          we(_(T, "level")) === void 0 &&
          _(T, "trials.thisN") === void 0 &&
          _(T, "trials.response") === void 0 &&
          _(T, "key_resp.corr") === void 0 &&
          _(T, "rsvpReadingResponseCorrectBool") === void 0
        ) {
          let ee = "metadata/non-trial row; no repair assessment needed";
          z[U] = {
            status: "IGNORED",
            statusReason: ee,
            columns: { repairStatus: "IGNORED", repairStatusReason: ee },
          };
          return;
        }
        let se =
            we(_(C, "distanceCm")) ??
            we(_(C, "viewingDistancePredictedCm")) ??
            we(s("viewingDistanceDesiredCm")),
          K = Rn((ee) => _(C, ee), i, h);
        if (m) {
          z[U] = {
            status: "UNAFFECTED",
            statusReason: `run predates the bug (date ${u.slice(
              0,
              10,
            )} < 2025-08-30; code hardcoded nearest [0,0])`,
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "predates bug",
            },
          };
          return;
        }
        let Q = _(C, "targetKind");
        if (Q === "reading" || Q === "rsvpReading") {
          let ee = `unsupported targetKind=${Q}; no validated repair model for its text layout`;
          z[U] = {
            status: "UNSUPPORTED",
            statusReason: ee,
            columns: { repairStatus: "UNSUPPORTED", repairStatusReason: ee },
          };
          return;
        }
        if (
          !(i && i > 0) ||
          !(h && h > 0) ||
          !(g && g > 0) ||
          !(se && se > 0)
        ) {
          z[U] = ze(
            "missing apparatus columns (pxPerCm/screenWidthPx/screenHeightPx/distance)",
          );
          return;
        }
        let ce = Y ? ot(Y) : void 0,
          he = L ? en(L) : void 0,
          t = Z ? ot(Z) : void 0,
          N = f ? t : void 0;
        if (
          ce &&
          !Z &&
          Math.abs(ce[0] - i / 2) <= Kt &&
          Math.abs(ce[1] - h / 2) <= Kt
        ) {
          z[U] = {
            status: "UNAFFECTED",
            statusReason:
              "nearest point at screen center [0,0]; bug never active",
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "nearest point at screen center [0,0]",
            },
          };
          return;
        }
        if (!he && !N) {
          z[U] = ze(
            ce
              ? "no screenBoundingRectDeg, non-center apple \u2014 window size unknown"
              : "no nearest-point data on this row or prior (metadata row?)",
          );
          return;
        }
        let F = ce ? [ce[0] - i / 2, h / 2 - ce[1]] : void 0,
          v = {
            pxPerCm: g,
            viewingDistanceCm: se,
            screenW: i,
            screenH: h,
            fixationXYPx: K,
          },
          y = N
            ? { nearest: N, viewingDistanceCm: se, residualDeg: 0 }
            : Vt(he, v, F ? [F] : []),
          S = se,
          X = "";
        if (!N && y.residualDeg > xt) {
          let ee = Vt(he, v, F ? [F] : [], !0);
          ee.residualDeg <= xt &&
            ee.viewingDistanceCm >= 15 &&
            ee.viewingDistanceCm <= 250 &&
            ((y = ee),
            (S = ee.viewingDistanceCm),
            (X = `; rect fit moved viewing distance ${se.toFixed(
              1,
            )}->${S.toFixed(1)} cm`));
        }
        if (!N && y.residualDeg > xt) {
          z[U] = ze(
            `screenBoundingRectDeg not reproducible (fit residual ${y.residualDeg.toFixed(
              3,
            )} deg). Likely cause: viewing distance at logging time differed, or the (unlogged) random fixation offset was nonzero \u2014 neither recoverable from this file.`,
          );
          return;
        }
        let O = y.nearest,
          P = !0;
        F && (P = Math.abs(F[0] - O[0]) <= Jt && Math.abs(F[1] - O[1]) <= Jt);
        let q = N
          ? "; stimulus-time raw nearest used directly (pre-gate apple/rect not required)"
          : P
          ? ""
          : " (appleCoords disagrees \u2014 non-fullscreen window; rect fit used)";
        if ((!Z || N) && Math.abs(O[0]) <= 5 && Math.abs(O[1]) <= 5) {
          z[U] = {
            status: "UNAFFECTED",
            statusReason:
              "nearest point at screen center [0,0]; bug never active" + q,
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "nearest point at screen center [0,0]",
            },
          };
          return;
        }
        let J = Qt(O, i, h),
          G = $n(O, i, h),
          ne,
          de = O;
        if (Z) {
          let ee = t;
          if (!ee) {
            z[U] = ze("nearestXYPx column unparseable");
            return;
          }
          let fe = Math.hypot(ee[0] - O[0], ee[1] - O[1]),
            ge = [O[0] + i / 2, h / 2 - O[1]],
            Ee = Math.hypot(ee[0] - ge[0], ee[1] - ge[1]),
            Ce = Math.abs(O[0]) <= 5 && Math.abs(O[1]) <= 5;
          if (f) {
            if (!N && !Ce && fe > ct && Ee > ct) {
              z[U] = ze(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${Math.min(
                  fe,
                  Ee,
                ).toFixed(0)} px)`,
              );
              return;
            }
            (ne = !0), (de = ee);
          } else if (J && !G) {
            if (fe > ct) {
              z[U] = ze(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${fe.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            (ne = !0), (de = ee);
          } else if (G && !J) {
            if (Ee > ct) {
              z[U] = ze(
                `trial-time nearestXYPx inconsistent with condition geometry (drift ${Ee.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            ne = !1;
          } else {
            z[U] = ze(
              "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
                q,
            );
            return;
          }
        } else if (J && !G) ne = !0;
        else if (G && !J) ne = !1;
        else {
          z[U] = ze(
            "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
              q,
          );
          return;
        }
        if (ne && !f && !Qt(de, i, h)) {
          z[U] = ze(
            "nearest outside plausible rc band \u2014 not corrected" + q,
          );
          return;
        }
        if (ne && !Z && O.some((ee) => ee !== 0)) {
          z[U] = ze(
            "buggy session; no stimulus-time nearestXYPx on this row \u2014 live eye unknown" +
              q,
          );
          return;
        }
        if (!ne) {
          z[U] = {
            status: "UNAFFECTED",
            statusReason: "fix already applied (converted nearest used)" + q,
            nearestUsedXY: O,
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "fixed-code run",
            },
          };
          return;
        }
        let le = kn(de, i, h),
          $e = we(_(C, "distanceCm")) ?? S,
          Te = ot(_(C, "fixationXYPxUsedForTarget") ?? ""),
          Re = ot(_(C, "fixationXYPxAtStimulusOnset") ?? "");
        if (j) {
          if (
            (_(C, "markingFixationAfterTargetOnset") ?? "freeze") ===
            "continueMovingAsOrigin"
          ) {
            z[U] = ze(
              "moving coordinate origin (continueMovingAsOrigin); stimulus-time trajectory not logged",
            );
            return;
          }
          if (!Te) {
            let fe = $ !== void 0 && R !== void 0 ? [$, R] : void 0,
              ge = Gt(_(C, "targetBoundingBox"));
            if (
              _(C, "markingFixationMotionPath") === "circle" &&
              _(C, "targetKind") === "letter" &&
              ae === "spacingDeg" &&
              _(C, "spacingRelationToSize") === "typographic" &&
              fe &&
              ge !== void 0
            ) {
              let Ee = zn({
                nearestUsed: de,
                nearestCorrect: le,
                pxPerCm: g,
                viewingDistanceCm: $e,
                nominalFixationXYPx: K,
                motionRadiusDeg: V,
                targetXYDeg: fe,
                drawnWidthPx: ge,
                requestedLevelDeg: oe === void 0 ? NaN : Math.pow(10, oe),
                fontSizePx: we(_(C, "fontSizePx")),
                fontMaxPx: we(_(C, "fontMaxPx")),
                fontPadding: we(_(C, "fontPadding")),
                fontBoundingBoxReNominalRect: _(
                  C,
                  "fontBoundingBoxReNominalRect",
                ),
                extraNote: q + X,
              });
              if (Ee) {
                z[U] = Ee;
                return;
              }
            }
            z[U] = ze(
              "moving crosshair; frozen target-transform fixation not logged and no supported range is available",
            );
            return;
          }
        }
        let Xe = Te ?? K,
          ve = Re ?? Xe,
          Ae = {
            pxPerCm: g,
            viewingDistanceCm: $e,
            fixationXYPx: Xe,
            nearestPointXYZPx: de,
          },
          Me = { ...Ae, fixationXYPx: ve, nearestPointXYZPx: le },
          ue = {},
          xe = {
            status: "CORRECTED",
            statusReason:
              (Te
                ? "nearest and logged target-transform fixation recovered; corrected"
                : "nearest recovered; corrected (static fixation assumed \u2014 random offset not logged)") +
              q +
              X,
            nearestUsedXY: de,
            nearestCorrectXY: le,
            columns: ue,
          };
        if (Te && Re) {
          let ee = Re[0] - Te[0],
            fe = Re[1] - Te[1];
          (ue.fixationOnsetMinusUsedXYPx = `${ee.toFixed(1)}, ${fe.toFixed(
            1,
          )}`),
            (xe.statusReason += `; onset minus used fixation (${ee.toFixed(
              1,
            )}, ${fe.toFixed(1)}) px`);
        }
        let Be = (ee, fe, ge) => {
            if (!(ge > 0) || !Number.isFinite(ge)) return;
            let Ee = be(ee, Ae),
              Ce = be([ee[0] + fe[0] * ge, ee[1] + fe[1] * ge], Ae),
              Ne = _e(Ee, Me),
              Ye = _e(Ce, Me);
            return Math.hypot(Ye[0] - Ne[0], Ye[1] - Ne[1]);
          },
          me = $ !== void 0 && R !== void 0 ? [$, R] : void 0;
        if (me) {
          let ee = be(me, Ae),
            fe = _e(ee, Me);
          (xe.actualTargetEccentricityXDeg = fe[0]),
            (xe.actualTargetEccentricityYDeg = fe[1]),
            (ue.actualTargetEccentricityXDeg = fe[0].toFixed(4)),
            (ue.actualTargetEccentricityYDeg = fe[1].toFixed(4)),
            (ue.drawnTargetXYPx = `${ee[0].toFixed(1)}, ${ee[1].toFixed(1)}`);
          let ge = be(me, Me);
          ue.correctedTargetXYPx = `${ge[0].toFixed(1)}, ${ge[1].toFixed(1)}`;
        }
        let qe = me
            ? (() => {
                let ee = Math.hypot(me[0], me[1]) || 1;
                return [me[0] / ee, me[1] / ee];
              })()
            : [1, 0],
          Ge = [-qe[1], qe[0]],
          Le = oe === void 0 ? NaN : Math.pow(10, oe);
        if (me && ae === "spacingDeg") {
          let ee = _(C, "spacingDirection") ?? "radial",
            fe = (Ne) =>
              Ne.includes("horizontal")
                ? [1, 0]
                : Ne.includes("vertical")
                ? [0, 1]
                : Ne.includes("tangential")
                ? Ge
                : qe,
            ge = _(C, "spacingRelationToSize") === "typographic",
            Ee = Gt(_(C, "targetBoundingBox")),
            Ce = ge
              ? Ee !== void 0
                ? nn(me, Ee, Ae, Me)
                : void 0
              : Be(me, fe(ee), Le);
          if (
            (ge &&
              Ee === void 0 &&
              (xe.statusReason +=
                "; typographic spacing unavailable (targetBoundingBox width missing)"),
            Ce !== void 0 &&
              ((xe.actualSpacingDeg = Ce),
              (xe.actualLevelLog10Deg = Math.log10(Ce)),
              (ue.actualSpacingDeg = Ce.toFixed(4)),
              (ue.actualLevelLog10Deg = xe.actualLevelLog10Deg.toFixed(4))),
            !ge && /And/.test(ee))
          ) {
            let Ne = ee.includes("radial") ? Ge : [1, 0],
              Ye = Be(me, Ne, Le);
            Ye !== void 0 && (ue.actualSpacingSecondaryDeg = Ye.toFixed(4));
          }
        }
        if (me && ae === "targetSizeDeg") {
          let fe = /true/i.test(_(C, "targetSizeIsHeightBool") ?? "FALSE")
              ? [0, 1]
              : [1, 0],
            ge = Be(me, fe, Le);
          ge !== void 0 &&
            ((xe.actualSizeDeg = ge),
            (xe.actualLevelLog10Deg = Math.log10(ge)),
            (ue.actualSizeDeg = ge.toFixed(4)),
            (ue.actualLevelLog10Deg = xe.actualLevelLog10Deg.toFixed(4)));
        }
        if (
          me &&
          ae === "targetEccentricityXDeg" &&
          xe.actualTargetEccentricityXDeg !== void 0
        ) {
          let ee = Math.hypot(
            xe.actualTargetEccentricityXDeg,
            xe.actualTargetEccentricityYDeg ?? 0,
          );
          (xe.actualLevelLog10Deg = Math.log10(ee)),
            (ue.actualLevelLog10Deg = xe.actualLevelLog10Deg.toFixed(4));
        }
        if (me && ae === "targetOffsetDeg") {
          let ee = Be(me, [1, 0], Le);
          ee !== void 0 &&
            ((xe.actualLevelLog10Deg = Math.log10(ee)),
            (ue.actualLevelLog10Deg = xe.actualLevelLog10Deg.toFixed(4)));
        }
        let Ve = (() => {
            let ee = _(C, "spacingDirection") ?? "radial";
            return ee.includes("horizontal")
              ? [1, 0]
              : ee.includes("vertical")
              ? [0, 1]
              : ee.includes("tangential")
              ? Ge
              : qe;
          })(),
          ut = we(_(C, "spacingDeg") ?? "");
        if (
          me &&
          ut !== void 0 &&
          ut > 0 &&
          ae !== "spacingDeg" &&
          _(C, "spacingRelationToSize") !== "typographic"
        ) {
          let ee = Be(me, Ve, ut);
          ee !== void 0 && (ue.actualSpacingDegNominal = ee.toFixed(4));
        }
        let ft = we(_(C, "targetSizeDeg") ?? "");
        if (
          me &&
          ft !== void 0 &&
          ft > 0 &&
          ae !== "targetSizeDeg" &&
          _(C, "spacingRelationToSize") !== "typographic"
        ) {
          let ee = /true/i.test(_(C, "targetSizeIsHeightBool") ?? "FALSE"),
            fe = Be(me, ee ? [0, 1] : [1, 0], ft);
          fe !== void 0 && (ue.actualSizeDegNominal = fe.toFixed(4));
        }
        let ht = we(_(C, "flankerSpacingDeg") ?? "");
        if (me && ht !== void 0 && ht > 0) {
          let ee = Be(me, qe, ht);
          ee !== void 0 && (ue.actualFlankerSpacingDeg = ee.toFixed(4));
        }
        {
          let ee = _e([-i / 2, -h / 2], Me),
            fe = _e([i / 2, h / 2], Me);
          ue.screenBoundingRectDegCorrected = `[(${ee[0].toFixed(
            4,
          )}, ${ee[1].toFixed(4)}), (${fe[0].toFixed(4)}, ${fe[1].toFixed(
            4,
          )})]`;
        }
        if (
          _(C, "gazeMeasuredXDeg") !== "" ||
          _(C, "gazeMeasuredYDeg") !== "" ||
          _(C, "gazeMeasuredRawDeg") !== ""
        )
          if (!P)
            xe.statusReason += "; gaze left as logged (window size unknown)";
          else {
            let ee = (We) => {
                let Ke = be(We, Ae);
                return _e(Ke, Me);
              },
              fe = we(_(C, "gazeMeasuredXDeg")),
              ge = we(_(C, "gazeMeasuredYDeg")),
              Ee,
              Ce;
            if (
              (fe !== void 0 &&
                ((Ee = ee([fe, ge ?? 0])),
                (ue.gazeMeasuredXDeg = Ee[0].toFixed(5))),
              ge !== void 0 &&
                ((Ce = ee([fe ?? 0, ge])),
                (ue.gazeMeasuredYDeg = Ce[1].toFixed(5))),
              Ee !== void 0 || Ce !== void 0)
            ) {
              let We = Ee ? Ee[0] : fe,
                Ke = Ce ? Ce[1] : ge;
              ue.gazeMeasuredRDeg = Math.hypot(We, Ke).toFixed(5);
            }
            let Ne = Ee !== void 0 || Ce !== void 0,
              Ye = _(C, "gazeMeasuredRawDeg");
            if (Ye !== "")
              try {
                let We = JSON.parse(Ye);
                Array.isArray(We) &&
                  We.length > 0 &&
                  ((ue.gazeMeasuredRawDeg = JSON.stringify(
                    We.map((Ke) => {
                      let Pt = ee([Number(Ke[0]), Number(Ke[1])]);
                      return [
                        Number(Pt[0].toFixed(5)),
                        Number(Pt[1].toFixed(5)),
                      ];
                    }),
                  )),
                  (Ne = !0));
              } catch {}
            Ne &&
              (xe.statusReason +=
                "; gaze corrected via stimulus-time eye position (gaze-time position not logged)");
          }
        (ue.repairStatus = "CORRECTED"),
          (ue.repairStatusReason = xe.statusReason),
          (ue.nearestUsedXY = `${de[0].toFixed(1)}, ${de[1].toFixed(1)}`),
          (ue.nearestCorrectXY = `${le[0].toFixed(1)}, ${le[1].toFixed(1)}`),
          (z[U] = xe);
      });
      for (let T of z)
        T.status === "CORRECTED"
          ? A++
          : T.status === "RANGED"
          ? (B++, T.columns.rangeMode === "two-candidates" ? k++ : I++)
          : T.status === "UNAFFECTED"
          ? W++
          : T.status === "IGNORED"
          ? M++
          : T.status === "UNSUPPORTED"
          ? c++
          : E++;
      return {
        rows: z,
        summary: {
          total: z.length,
          corrected: A,
          ranged: B,
          discreteScenarios: k,
          continuousRanges: I,
          unaffected: W,
          flagged: E,
          ignored: M,
          unsupported: c,
        },
      };
    },
    an = (e) =>
      /nearestXYPx.*inconsistent with condition|trial-time nearestXYPx/i.test(e)
        ? "trial-time eye point inconsistent with condition geometry"
        : /^screenBoundingRectDeg not reproducible/i.test(e)
        ? "screenBoundingRectDeg not reproducible"
        : e.replace(
            / \(appleCoords disagrees — non-fullscreen window; rect fit used\)/g,
            "",
          ),
    Pn = [
      "repairStatus",
      "repairStatusReason",
      "repairImputedColumns",
      "nearestUsedXY",
      "nearestCorrectXY",
      "fixationOnsetMinusUsedXYPx",
      "referenceNominalCenterTargetEccentricityXDeg",
      "referenceNominalCenterTargetEccentricityYDeg",
      "actualTargetEccentricityXDegMin",
      "actualTargetEccentricityXDegMax",
      "actualTargetEccentricityYDegMin",
      "actualTargetEccentricityYDegMax",
      "approximateTargetEccentricityXDegMin",
      "approximateTargetEccentricityXDegMax",
      "approximateTargetEccentricityYDegMin",
      "approximateTargetEccentricityYDegMax",
      "referenceNominalCenterTargetEccentricityRDeg",
      "actualTargetEccentricityRDegMin",
      "actualTargetEccentricityRDegMax",
      "approximateTargetEccentricityRDegMin",
      "approximateTargetEccentricityRDegMax",
      "midpointTargetEccentricityRDeg",
      "actualTargetEccentricityRDegScenarioA",
      "actualTargetEccentricityRDegScenarioB",
      "referenceNominalCenterDrawnTargetXYPx",
      "drawnTripletWidthPx",
      "fixationMotionRadiusPx",
      "referenceNominalCenterSpacingDeg",
      "actualSpacingDegMin",
      "actualSpacingDegMax",
      "approximateSpacingDegMin",
      "approximateSpacingDegMax",
      "midpointSpacingDeg",
      "actualSpacingDegScenarioA",
      "actualSpacingDegScenarioB",
      "referenceNominalCenterLevelLog10Deg",
      "actualLevelLog10DegMin",
      "actualLevelLog10DegMax",
      "approximateLevelLog10DegMin",
      "approximateLevelLog10DegMax",
      "midpointLevelLog10Deg",
      "actualLevelLog10DegScenarioA",
      "actualLevelLog10DegScenarioB",
      "fixationCandidateCount",
      "scenarioCount",
      "fixationCandidatesXYPx",
      "fixationXYPxScenarioA",
      "fixationXYPxScenarioB",
      "widthEquationResidualPx",
      "rangeMode",
      "actualTargetEccentricityXDeg",
      "actualTargetEccentricityYDeg",
      "drawnTargetXYPx",
      "correctedTargetXYPx",
      "actualSpacingDeg",
      "actualSpacingSecondaryDeg",
      "actualSpacingDegNominal",
      "actualSizeDeg",
      "actualSizeDegNominal",
      "actualFlankerSpacingDeg",
      "actualLevelLog10Deg",
      "screenBoundingRectDegCorrected",
    ],
    vt = (e) => (/[",\r\n]/.test(e) ? `"${e.replace(/"/g, '""')}"` : e),
    Tn = {
      actualTargetEccentricityXDeg: "targetEccentricityXDeg",
      actualTargetEccentricityYDeg: "targetEccentricityYDeg",
      actualLevelLog10Deg: "level",
      actualSpacingDeg: "spacingDeg",
      actualSpacingDegNominal: "spacingDeg",
      actualSizeDeg: "targetSizeDeg",
      actualSizeDegNominal: "targetSizeDeg",
      actualFlankerSpacingDeg: "flankerSpacingDeg",
      screenBoundingRectDegCorrected: "screenBoundingRectDeg",
      gazeMeasuredXDeg: "gazeMeasuredXDeg",
      gazeMeasuredYDeg: "gazeMeasuredYDeg",
      gazeMeasuredRDeg: "gazeMeasuredRDeg",
      gazeMeasuredRawDeg: "gazeMeasuredRawDeg",
    },
    wt = (e, d) => {
      if (d.summary.alreadyRepaired) return e;
      let { header: a, rows: n } = je(e),
        r = n.map((b) => [...b]),
        s = new Set();
      n.forEach((b, u) => {
        let p = d.rows[u].columns,
          l = [];
        for (let [m, f] of Object.entries(Tn)) {
          if (!(m in p)) continue;
          let x = a.indexOf(f);
          x >= 0 && ((r[u][x] = p[m]), s.add(m), l.includes(f) || l.push(f));
        }
        l.length && (p.repairImputedColumns = l.join("; "));
      });
      let i = Pn.filter(
          (b) => !s.has(b) && n.some((u, p) => b in d.rows[p].columns),
        ),
        h = i.map((b) =>
          a.includes(b) ? `repair${b[0].toUpperCase()}${b.slice(1)}` : b,
        ),
        g = [
          [...a, ...h].join(","),
          ...r.map((b, u) =>
            [
              ...b.map(vt),
              ...h.map((p, l) => vt(d.rows[u].columns[i[l]] ?? "")),
            ].join(","),
          ),
        ];
      return (
        (e.charCodeAt(0) === 65279 ? "\uFEFF" : "") +
        g.join(`
`)
      );
    },
    rt = (e, d) => {
      let { header: a, rows: n } = je(e),
        r = [
          "participant",
          "experiment",
          "conditionName",
          "font",
          "targetKind",
          "thresholdParameter",
          "targetEccentricityXDeg",
          "targetEccentricityYDeg",
          "block",
          "block_condition",
          "trialsThisN",
          "response",
          "repairStatus",
          "requestedLevelLog10Deg",
          "actualLevelLog10DegLower",
          "actualLevelLog10DegMidpoint",
          "actualLevelLog10DegUpper",
          "actualLevelLog10DegScenarioA",
          "actualLevelLog10DegScenarioB",
          "actualSpacingDegLower",
          "actualSpacingDegMidpoint",
          "actualSpacingDegUpper",
          "actualSpacingDegScenarioA",
          "actualSpacingDegScenarioB",
          "actualTargetEccentricityRDegLower",
          "actualTargetEccentricityRDegMidpoint",
          "actualTargetEccentricityRDegUpper",
          "actualTargetEccentricityRDegScenarioA",
          "actualTargetEccentricityRDegScenarioB",
          "widthEquationResidualPx",
          "scenarioCount",
          "fixationCandidatesXYPx",
          "fixationXYPxScenarioA",
          "fixationXYPxScenarioB",
          "rangeMode",
          "repairStatusReason",
        ],
        s = [r.join(",")],
        i = (h) => (h !== void 0 && Number.isFinite(h) ? h.toFixed(4) : "");
      return (
        n.forEach((h, g) => {
          let o = d.rows[g],
            b = o.status === "CORRECTED",
            u = o.status === "RANGED";
          if (!b && !u) return;
          let p = (k) => {
              let I = a.indexOf(k);
              return I >= 0 ? h[I] : "";
            },
            l = b
              ? o.actualLevelLog10Deg
              : Number(o.columns.midpointLevelLog10Deg);
          if (!Number.isFinite(l)) return;
          let m = b
              ? l
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }LevelLog10DegMin`
                  ],
                ),
            f = b
              ? l
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }LevelLog10DegMax`
                  ],
                ),
            x = b ? o.actualSpacingDeg : Number(o.columns.midpointSpacingDeg),
            w = b
              ? x
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }SpacingDegMin`
                  ],
                ),
            D = b
              ? x
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }SpacingDegMax`
                  ],
                ),
            _ = b
              ? o.actualTargetEccentricityXDeg !== void 0
                ? Math.hypot(
                    o.actualTargetEccentricityXDeg,
                    o.actualTargetEccentricityYDeg ?? 0,
                  )
                : void 0
              : Number(o.columns.midpointTargetEccentricityRDeg),
            z = b
              ? _
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }TargetEccentricityRDegMin`
                  ],
                ),
            A = b
              ? _
              : Number(
                  o.columns[
                    `${
                      o.columns.rangeMode === "two-candidates"
                        ? "actual"
                        : "approximate"
                    }TargetEccentricityRDegMax`
                  ],
                ),
            B = {
              participant: p("EasyEyesID") || p("participant"),
              experiment: p("experiment"),
              conditionName: p("conditionName"),
              font: p("font"),
              targetKind: p("targetKind"),
              thresholdParameter: p("thresholdParameter"),
              targetEccentricityXDeg: p("targetEccentricityXDeg"),
              targetEccentricityYDeg: p("targetEccentricityYDeg"),
              block: p("block"),
              block_condition: p("block_condition"),
              trialsThisN: p("trials.thisN"),
              response:
                p("trials.response") ||
                p("key_resp.corr") ||
                p("rsvpReadingResponseCorrectBool"),
              repairStatus: o.status,
              requestedLevelLog10Deg: p("level"),
              actualLevelLog10DegLower: i(m),
              actualLevelLog10DegMidpoint: i(l),
              actualLevelLog10DegUpper: i(f),
              actualLevelLog10DegScenarioA: b
                ? i(l)
                : o.columns.actualLevelLog10DegScenarioA ?? "",
              actualLevelLog10DegScenarioB: b
                ? ""
                : o.columns.actualLevelLog10DegScenarioB ?? "",
              actualSpacingDegLower: i(w),
              actualSpacingDegMidpoint: i(x),
              actualSpacingDegUpper: i(D),
              actualSpacingDegScenarioA: b
                ? i(x)
                : o.columns.actualSpacingDegScenarioA ?? "",
              actualSpacingDegScenarioB: b
                ? ""
                : o.columns.actualSpacingDegScenarioB ?? "",
              actualTargetEccentricityRDegLower: i(z),
              actualTargetEccentricityRDegMidpoint: i(_),
              actualTargetEccentricityRDegUpper: i(A),
              actualTargetEccentricityRDegScenarioA: b
                ? i(_)
                : o.columns.actualTargetEccentricityRDegScenarioA ?? "",
              actualTargetEccentricityRDegScenarioB: b
                ? ""
                : o.columns.actualTargetEccentricityRDegScenarioB ?? "",
              widthEquationResidualPx: o.columns.widthEquationResidualPx ?? "",
              scenarioCount: b ? "1" : o.columns.scenarioCount ?? "continuous",
              fixationCandidatesXYPx: o.columns.fixationCandidatesXYPx ?? "",
              fixationXYPxScenarioA: b
                ? ""
                : o.columns.fixationXYPxScenarioA ?? "",
              fixationXYPxScenarioB: b
                ? ""
                : o.columns.fixationXYPxScenarioB ?? "",
              rangeMode: b ? "scalar" : o.columns.rangeMode ?? "",
              repairStatusReason: o.statusReason,
            };
          s.push(r.map((k) => vt(String(B[k] ?? ""))).join(","));
        }),
        s.join(`
`)
      );
    },
    nt = (e) => e.sort((d, a) => d - a)[Math.floor(e.length / 2)],
    Ue = (e, d) => e.sort((a, n) => a - n)[Math.floor(d * (e.length - 1))],
    sn = (e, d) => {
      if (d.summary.alreadyRepaired)
        return { correctedTrials: 0, rangedTrials: 0 };
      let { header: a, rows: n } = je(e),
        r = a.indexOf("targetEccentricityXDeg"),
        s = a.indexOf("targetEccentricityYDeg"),
        i = a.indexOf("level"),
        h = [],
        g = [],
        o = [],
        b = [],
        u = [],
        p = 0,
        l = 0;
      n.forEach((f, x) => {
        let w = d.rows[x];
        if (w.status === "RANGED") {
          if (
            (l++,
            r >= 0 &&
              w.columns.referenceNominalCenterTargetEccentricityXDeg !== void 0)
          ) {
            let _ = Math.hypot(Number(f[r]), Number(f[s])),
              z = Math.hypot(Number(w.columns.midpointTargetEccentricityRDeg));
            _ > 0 && Number.isFinite(_) && o.push(((z - _) / _) * 100);
          }
          if (i >= 0 && w.columns.midpointLevelLog10Deg !== void 0) {
            let _ = Math.pow(10, Number(f[i])),
              z = Math.pow(10, Number(w.columns.midpointLevelLog10Deg));
            _ > 0 && Number.isFinite(_) && b.push(((z - _) / _) * 100);
          }
          let D =
            w.columns.rangeMode === "two-candidates" ? "actual" : "approximate";
          w.columns[`${D}SpacingDegMin`] !== void 0 &&
            w.columns[`${D}SpacingDegMax`] !== void 0 &&
            u.push(
              Number(w.columns[`${D}SpacingDegMax`]) -
                Number(w.columns[`${D}SpacingDegMin`]),
            );
          return;
        }
        if (w.status === "CORRECTED") {
          if ((p++, r >= 0 && w.actualTargetEccentricityXDeg !== void 0)) {
            let D = Math.hypot(Number(f[r]), Number(f[s])),
              _ = Math.hypot(
                w.actualTargetEccentricityXDeg,
                w.actualTargetEccentricityYDeg ?? 0,
              );
            D > 0 && Number.isFinite(D) && h.push(((_ - D) / D) * 100);
          }
          if (i >= 0 && w.actualLevelLog10Deg !== void 0) {
            let D = Math.pow(10, Number(f[i])),
              _ = Math.pow(10, w.actualLevelLog10Deg);
            D > 0 && Number.isFinite(D) && g.push(((_ - D) / D) * 100);
          }
        }
      });
      let m = { correctedTrials: p, rangedTrials: l };
      return (
        h.length &&
          ((m.eccentricityErrPct = [nt(h), Math.max(...h.map(Math.abs))]),
          (m.eccentricityErrPct05 = Ue(h, 0.05)),
          (m.eccentricityErrPct95 = Ue(h, 0.95))),
        g.length &&
          ((m.sizeSpacingInflationPct = [nt(g), Math.max(...g.map(Math.abs))]),
          (m.sizeSpacingInflationPct05 = Ue(g, 0.05)),
          (m.sizeSpacingInflationPct95 = Ue(g, 0.95))),
        o.length &&
          ((m.rangedEccentricityErrPct = [nt(o), Math.max(...o.map(Math.abs))]),
          (m.rangedEccentricityErrPct05 = Ue(o, 0.05)),
          (m.rangedEccentricityErrPct95 = Ue(o, 0.95))),
        b.length &&
          ((m.rangedSizeSpacingInflationPct = [
            nt(b),
            Math.max(...b.map(Math.abs)),
          ]),
          (m.rangedSizeSpacingInflationPct05 = Ue(b, 0.05)),
          (m.rangedSizeSpacingInflationPct95 = Ue(b, 0.95))),
        u.length && (m.rangedSpacingUncertaintyDeg = [nt(u), Math.max(...u)]),
        m
      );
    };
  document
    .querySelector("main")
    .insertBefore(
      document.getElementById("repairsec"),
      document.querySelector(".layout"),
    );
  var ye = (e) => String(e).replace(/-/g, "\u2212"),
    re = (e, d = 1) =>
      e == null || !Number.isFinite(e) ? "" : ye(e.toFixed(d)),
    De = (e, d = 1) => (e == null || !Number.isFinite(e) ? "" : e.toFixed(d)),
    Ie = (e) => `${e >= 0 ? "+" : ""}${re(e)}%`,
    pe = (e) =>
      String(e)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    Pe = (e, d, a) =>
      `<span class="pill ${e}"${a ? ` data-tip="${pe(a)}"` : ""}>${pe(
        d,
      )}</span>`,
    _t = (e) => e.replace(/(\.results)?\.csv$/i, "-sensitivity.csv"),
    Mn = (e, d) => {
      let a = je(rt(e, d)),
        n = (h) => a.header.indexOf(h),
        r = new Map();
      a.rows.forEach((h) => {
        let g = h[n("experiment")] || "?",
          o = h[n("block_condition")] || "?",
          b = h[n("conditionName")],
          u = `${g} / ${b || o} (${o})`;
        r.has(u) || r.set(u, []),
          r
            .get(u)
            .push({
              status: h[n("repairStatus")],
              lower: Number(h[n("actualLevelLog10DegLower")]),
              midpoint: Number(h[n("actualLevelLog10DegMidpoint")]),
              upper: Number(h[n("actualLevelLog10DegUpper")]),
            });
      });
      let s = (h) => h.sort((g, o) => g - o)[Math.floor(h.length / 2)],
        i = [];
      for (let [h, g] of r) {
        let o = g.filter((u) => u.status === "CORRECTED").length,
          b = g.filter((u) => u.status === "RANGED").length;
        i.push(
          `  ${h}: ${o} corrected / ${b} ranged; median recovered log10 level ${De(
            s(g.map((u) => u.lower)),
            4,
          )} / ${De(s(g.map((u) => u.midpoint)), 4)} / ${De(
            s(g.map((u) => u.upper)),
            4,
          )} (lower/midpoint/upper)`,
        );
      }
      return i;
    },
    on = (e, d) => {
      e.rows.forEach((a) => {
        if (a.status !== "FLAGGED") return;
        let n = an(a.statusReason);
        d[n] = (d[n] || 0) + 1;
      });
    },
    Se = (e, d) =>
      e.columns[
        `${
          e.columns.rangeMode === "two-candidates" ? "actual" : "approximate"
        }${d}`
      ],
    Fn = (e, d, a) => {
      let n = [],
        r = (s) => {
          let i = a.indexOf(s);
          return i >= 0 ? d[i] : "";
        };
      return (
        e.status === "CORRECTED" &&
          (e.columns.screenBoundingRectDegCorrected &&
            n.push(
              `bounding rect logged ${r("screenBoundingRectDeg")}; corrected ${
                e.columns.screenBoundingRectDegCorrected
              }`,
            ),
          e.nearestUsedXY &&
            e.nearestCorrectXY &&
            n.push(
              `assumed eye (buggy transform) (${re(
                e.nearestUsedXY[0],
                0,
              )}, ${re(
                e.nearestUsedXY[1],
                0,
              )}) px; logged eye (corrected coordinates) (${re(
                e.nearestCorrectXY[0],
                0,
              )}, ${re(e.nearestCorrectXY[1], 0)}) px`,
            ),
          e.actualTargetEccentricityXDeg !== void 0 &&
            (n.push(
              `requested position (${r("targetEccentricityXDeg")}, ${r(
                "targetEccentricityYDeg",
              )})\xB0; drawn position (${
                e.columns.drawnTargetXYPx
              }) px; recovered position (${re(
                e.actualTargetEccentricityXDeg,
                2,
              )}, ${re(e.actualTargetEccentricityYDeg, 2)})\xB0`,
            ),
            e.columns.correctedTargetXYPx &&
              n.push(
                `position required to match request: (${e.columns.correctedTargetXYPx}) px`,
              )),
          e.actualLevelLog10Deg !== void 0 &&
            n.push(
              `size or spacing: requested ${re(
                Math.pow(10, Number(r("level"))),
                2,
              )}\xB0; recovered ${re(
                Math.pow(10, e.actualLevelLog10Deg),
                2,
              )}\xB0`,
            )),
        e.status === "RANGED" &&
          (e.nearestUsedXY &&
            e.nearestCorrectXY &&
            n.push(
              `assumed eye (buggy transform) (${re(
                e.nearestUsedXY[0],
                0,
              )}, ${re(
                e.nearestUsedXY[1],
                0,
              )}) px; logged eye (corrected coordinates) (${re(
                e.nearestCorrectXY[0],
                0,
              )}, ${re(e.nearestCorrectXY[1], 0)}) px`,
            ),
          e.columns.midpointTargetEccentricityRDeg !== void 0 &&
            n.push(
              `midpoint eccentricity r ${re(
                Number(e.columns.midpointTargetEccentricityRDeg),
                2,
              )}\xB0; ${
                e.columns.rangeMode === "two-candidates"
                  ? "scenario extrema"
                  : "approximate range"
              } [${re(Number(Se(e, "TargetEccentricityRDegMin")), 2)}, ${re(
                Number(Se(e, "TargetEccentricityRDegMax")),
                2,
              )}]\xB0`,
            ),
          e.columns.referenceNominalCenterTargetEccentricityXDeg !== void 0 &&
            n.push(
              `nominal-center reference (not an observation) (${re(
                Number(e.columns.referenceNominalCenterTargetEccentricityXDeg),
                2,
              )}, ${re(
                Number(e.columns.referenceNominalCenterTargetEccentricityYDeg),
                2,
              )})\xB0; X [${re(
                Number(Se(e, "TargetEccentricityXDegMin")),
                2,
              )}, ${re(
                Number(Se(e, "TargetEccentricityXDegMax")),
                2,
              )}]\xB0, Y [${re(
                Number(Se(e, "TargetEccentricityYDegMin")),
                2,
              )}, ${re(Number(Se(e, "TargetEccentricityYDegMax")), 2)}]\xB0`,
            ),
          e.columns.midpointSpacingDeg !== void 0 &&
            n.push(
              `spacing midpoint ${re(
                Number(e.columns.midpointSpacingDeg),
                3,
              )}\xB0; ${
                e.columns.rangeMode === "two-candidates"
                  ? "scenario extrema"
                  : "approximate range"
              } [${re(Number(Se(e, "SpacingDegMin")), 3)}, ${re(
                Number(Se(e, "SpacingDegMax")),
                3,
              )}]\xB0 (triplet width ${e.columns.drawnTripletWidthPx} px)`,
            ),
          e.columns.rangeMode === "two-candidates" &&
            e.columns.widthEquationResidualPx !== void 0 &&
            n.push(
              `width residual ${e.columns.widthEquationResidualPx} px = font size \xD7 normalized width \u2212 logged target width`,
            ),
          n.push(
            "These ranges cover fixation position and rendered-width rounding only. They exclude eye-tracker noise, viewing-distance error, timing error, and actual gaze deviation.",
          )),
        n.push(e.statusReason),
        n.join(`
`)
      );
    },
    cn = {
      CORRECTED: ["corrected", "st-corrected"],
      RANGED: ["ranged", "st-ranged"],
      UNAFFECTED: ["unaffected", "st-unaffected"],
      UNSUPPORTED: ["unsupported", "st-ignored"],
      IGNORED: ["metadata", "st-ignored"],
      FLAGGED: ["needs review", "st-flagged"],
    },
    ln = {
      actualTargetEccentricityXDeg: "targetEccentricityXDeg",
      actualTargetEccentricityYDeg: "targetEccentricityYDeg",
      midpointTargetEccentricityRDeg: "targetEccentricityXDeg",
      midpointLevelLog10Deg: "level",
      midpointSpacingDeg: "spacingDeg",
      actualLevelLog10Deg: "level",
      actualSpacingDeg: "spacingDeg",
      actualSizeDeg: "targetSizeDeg",
      actualFlankerSpacingDeg: "flankerSpacingDeg",
      screenBoundingRectDegCorrected: "screenBoundingRectDeg",
      nearestCorrectXY: "nearestXYPx",
      gazeMeasuredXDeg: "gazeMeasuredXDeg",
      gazeMeasuredYDeg: "gazeMeasuredYDeg",
      gazeMeasuredRDeg: "gazeMeasuredRDeg",
      gazeMeasuredRawDeg: "gazeMeasuredRawDeg",
    },
    Dt = (e) => {
      let d = new Set();
      for (let a of Object.keys(e.columns)) a in ln && d.add(ln[a]);
      return (
        (e.columns.referenceNominalCenterTargetEccentricityYDeg !== void 0 ||
          e.columns.midpointTargetEccentricityRDeg !== void 0 ||
          e.columns.actualTargetEccentricityRDegScenarioA !== void 0) &&
          d.add("targetEccentricityYDeg"),
        [...d]
      );
    },
    An = (e, d) => {
      let a = (i) => {
          let h = d.indexOf(i);
          return h >= 0 ? e[h] : "";
        },
        n = [],
        r = a("level"),
        s = r !== "" && Number.isFinite(Number(r)) ? re(Number(r), 3) : pe(r);
      return (
        a("targetEccentricityXDeg") !== "" &&
          n.push(
            `<span class="metric-label">position (x, y)</span><span>(${pe(
              a("targetEccentricityXDeg"),
            )}, ${pe(a("targetEccentricityYDeg"))})\xB0</span>`,
          ),
        a("level") !== "" &&
          n.push(
            `<span class="metric-label">log\u2081\u2080 level</span><span>${s}</span>`,
          ),
        n.length
          ? n.map((i) => `<div class="metric">${i}</div>`).join("")
          : '<span class="muted">\u2014</span>'
      );
    },
    Nn = (e) => {
      if (e.status === "RANGED") {
        let d = [];
        return (
          e.columns.actualTargetEccentricityRDegScenarioA !== void 0
            ? d.push(
                `<span class="metric-label">eccentricity r</span><span>A ${re(
                  Number(e.columns.actualTargetEccentricityRDegScenarioA),
                  2,
                )}\xB0 \xB7 B ${re(
                  Number(e.columns.actualTargetEccentricityRDegScenarioB),
                  2,
                )}\xB0</span>`,
                `<span class="metric-label">spacing</span><span>A ${re(
                  Number(e.columns.actualSpacingDegScenarioA),
                  2,
                )}\xB0 \xB7 B ${re(
                  Number(e.columns.actualSpacingDegScenarioB),
                  2,
                )}\xB0</span>`,
                `<span class="metric-label">log\u2081\u2080 level</span><span>A ${re(
                  Number(e.columns.actualLevelLog10DegScenarioA),
                  3,
                )} \xB7 B ${re(
                  Number(e.columns.actualLevelLog10DegScenarioB),
                  3,
                )}</span>`,
              )
            : (e.columns.midpointTargetEccentricityRDeg !== void 0 &&
                d.push(
                  `<span class="metric-label">eccentricity r</span><span>[${re(
                    Number(Se(e, "TargetEccentricityRDegMin")),
                    2,
                  )}, ${re(
                    Number(Se(e, "TargetEccentricityRDegMax")),
                    2,
                  )}]\xB0</span>`,
                ),
              e.columns.midpointSpacingDeg !== void 0 &&
                d.push(
                  `<span class="metric-label">spacing</span><span>${re(
                    Number(Se(e, "SpacingDegMin")),
                    2,
                  )}\u2013${re(Number(Se(e, "SpacingDegMax")), 2)}\xB0</span>`,
                  `<span class="metric-label">log\u2081\u2080 level</span><span>${re(
                    Number(Se(e, "LevelLog10DegMin")),
                    3,
                  )}\u2013${re(Number(Se(e, "LevelLog10DegMax")), 3)}</span>`,
                )),
          d.map((a) => `<div class="metric">${a}</div>`).join("")
        );
      }
      if (e.status === "CORRECTED") {
        let d = [];
        return (
          e.actualTargetEccentricityXDeg !== void 0 &&
            d.push(
              `<span class="metric-label">position (x, y)</span><span>(${re(
                e.actualTargetEccentricityXDeg,
                2,
              )}, ${re(e.actualTargetEccentricityYDeg, 2)})\xB0</span>`,
            ),
          e.actualSpacingDeg !== void 0 &&
            d.push(
              `<span class="metric-label">spacing</span><span>${re(
                e.actualSpacingDeg,
                2,
              )}\xB0</span>`,
            ),
          e.actualLevelLog10Deg !== void 0 &&
            d.push(
              `<span class="metric-label">log\u2081\u2080 level</span><span>${re(
                e.actualLevelLog10Deg,
                3,
              )}</span>`,
            ),
          d.length
            ? d.map((a) => `<div class="metric">${a}</div>`).join("")
            : '<span class="muted">\u2014</span>'
        );
      }
      return '<span class="muted">\u2014</span>';
    },
    Ln = (e) => {
      if (e.columns.rangeMode !== "two-candidates") return "";
      let d = ["A", "B"]
        .map(
          (a) =>
            `<tr><td>${a}</td><td class="num">(${pe(
              e.columns[`fixationXYPxScenario${a}`],
            )})</td><td class="num">${re(
              Number(e.columns[`actualTargetEccentricityRDegScenario${a}`]),
              2,
            )}\xB0</td><td class="num">${re(
              Number(e.columns[`actualSpacingDegScenario${a}`]),
              3,
            )}\xB0</td><td class="num">${re(
              Number(e.columns[`actualLevelLog10DegScenario${a}`]),
              3,
            )}</td></tr>`,
        )
        .join("");
      return `<p class="scenario-definition">${At}</p>
    <div class="scenario-wrap"><table class="scenario-table"><thead><tr>
    <th>Candidate</th><th>Fixation (x, y), px</th><th>Eccentricity r</th>
    <th>Spacing</th><th>Log\u2081\u2080 level</th></tr></thead><tbody>${d}</tbody>
    </table></div>`;
    },
    In = (e, d, a, n) => {
      let r =
          e.status === "RANGED"
            ? e.columns.rangeMode === "two-candidates"
              ? "2 candidates"
              : "approximate range"
            : cn[e.status][0],
        s = cn[e.status][1],
        i = e.status === "CORRECTED" || e.status === "RANGED",
        h = Fn(e, d, a)
          .split(
            `
`,
          )
          .filter(Boolean)
          .map((o) => `<li>${pe(o)}</li>`)
          .join(""),
        g = Dt(e)
          .map((o) => `<code>${pe(o)}</code>`)
          .join(", ");
      return `<tr data-st="${e.status}" class="trial-row ${i ? "r-diff" : ""}">
    <td class="rownum">${n + 1}</td>
    <td>${Pe(s, r)}</td>
    <td class="requested">${An(d, a)}</td>
    <td class="recovered">${Nn(e)}</td>
    <td class="detail-action"><button type="button" class="rowdetails" data-row="${
      n + 1
    }" aria-expanded="false" aria-label="Show details for CSV row ${
      n + 1
    }">Details</button></td>
  </tr><tr data-st="${e.status}" class="trial-detail-row" hidden>
    <td colspan="5"><div class="derivation">
      ${Ln(e)}
      <ul class="derivation-list">${h}</ul>
      ${g ? `<p class="affected"><b>Affected parameters:</b> ${g}</p>` : ""}
    </div></td></tr>`;
    },
    dn = (e, d, a) => {
      if (!e.length) return "";
      let n = 360,
        r = 260,
        s = 42,
        i = Ot(e),
        h = (p) => s + (p / i) * (n - s - 8),
        g = (p) => r - s + 8 - (p / i) * (r - s - 8),
        o = e
          .filter(mt)
          .map(
            (p) =>
              `<line x1="${h(p[0]).toFixed(1)}" y1="${g(p[2]).toFixed(
                1,
              )}" x2="${h(p[0]).toFixed(1)}" y2="${g(p[3]).toFixed(
                1,
              )}" stroke="#125a9c" stroke-width="1.2" stroke-opacity="0.55"/>`,
          )
          .join(""),
        b = e
          .map((p) => {
            let l = mt(p);
            return `<circle cx="${h(p[0]).toFixed(1)}" cy="${g(p[1]).toFixed(
              1,
            )}" r="3.5" fill="#b26a00" fill-opacity="0.85"><title>asked ${ye(
              p[0].toFixed(2),
            )}\xB0, ${l ? "midpoint" : "actually drew"} ${ye(
              p[1].toFixed(2),
            )}\xB0 (${Ie(((p[1] - p[0]) / p[0]) * 100)})${
              l
                ? `; interval [${ye(p[2].toFixed(2))}, ${ye(
                    p[3].toFixed(2),
                  )}]\xB0`
                : ""
            }</title></circle>`;
          })
          .join(""),
        u = [0, i / 2, i]
          .map(
            (p) =>
              `<line x1="${h(p)}" y1="${g(0)}" x2="${h(p)}" y2="${
                g(0) + 4
              }" stroke="#999"/><text x="${h(p)}" y="${
                g(0) + 15
              }" font-size="9" text-anchor="middle" fill="#666">${p.toFixed(
                1,
              )}</text><line x1="${h(0) - 4}" y1="${g(p)}" x2="${h(0)}" y2="${g(
                p,
              )}" stroke="#999"/><text x="${h(0) - 6}" y="${
                g(p) + 3
              }" font-size="9" text-anchor="end" fill="#666">${p.toFixed(
                1,
              )}</text>`,
          )
          .join("");
      return `<svg width="${n}" height="${r}" class="plot" role="img" aria-label="${pe(
        d,
      )} versus recovered value">
    <line x1="${h(0)}" y1="${g(0)}" x2="${h(i)}" y2="${g(
      i,
    )}" stroke="#2e7d32" stroke-dasharray="4 3"/>
    <text x="${h(i * 0.82)}" y="${
      g(i * 0.82) - 6
    }" font-size="9" fill="#2e7d32">no error</text>
    <line x1="${h(0)}" y1="${g(0)}" x2="${h(i)}" y2="${g(0)}" stroke="#bbb"/>
    <line x1="${h(0)}" y1="${g(0)}" x2="${h(0)}" y2="${g(i)}" stroke="#bbb"/>
    ${u}${o}${b}
    <text x="${n / 2}" y="${
      r - 2
    }" font-size="10" text-anchor="middle" fill="#444">${pe(d)}</text>
    <text x="10" y="${
      r / 2
    }" font-size="10" text-anchor="middle" fill="#444" transform="rotate(-90 10 ${
      r / 2
    })">${pe(a)}</text>
  </svg>`;
    },
    St = (e, d) => {
      let a = new Blob([d], { type: "text/csv" }),
        n = document.createElement("a");
      (n.href = URL.createObjectURL(a)),
        (n.download = e),
        n.click(),
        setTimeout(() => URL.revokeObjectURL(n.href), 5e3);
    },
    Ze = document.getElementById("results"),
    Oe = document.createElement("div");
  Oe.className = "rtip";
  document.body.appendChild(Oe);
  var un = (e) => {
    let a = Oe.getBoundingClientRect(),
      n = e.clientX + 14,
      r = e.clientY - a.height / 2;
    n + a.width > innerWidth - 8 && (n = e.clientX - a.width - 14),
      (r = Math.min(Math.max(r, 8), innerHeight - a.height - 8)),
      (Oe.style.left = n + "px"),
      (Oe.style.top = r + "px");
  };
  document.body.addEventListener("mouseover", (e) => {
    let d = e.target.closest("[data-tip]");
    d &&
      ((Oe.innerHTML = pe(d.getAttribute("data-tip")).replace(/\n/g, "<br>")),
      (Oe.style.display = "block"),
      un(e));
  });
  document.body.addEventListener("mousemove", (e) => {
    Oe.style.display === "block" && un(e);
  });
  document.body.addEventListener("mouseout", (e) => {
    e.target.closest("[data-tip]") && (Oe.style.display = "none");
  });
  var Fe = [],
    ie = {
      processed: 0,
      repaired: 0,
      clean: 0,
      flaggedOnly: 0,
      already: 0,
      errors: 0,
      skippedNonCsv: 0,
      entries: new Map(),
      archiveStems: [],
      conditions: new Map(),
      files: [],
    },
    it = (e, d) => {
      if (!ie.entries.has(e)) return ie.entries.set(e, d), e;
      let a = 2,
        n;
      do
        (n = /\.csv$/i.test(e)
          ? e.replace(/\.csv$/i, ` (${a}).csv`)
          : `${e} (${a})`),
          a++;
      while (ie.entries.has(n));
      return ie.entries.set(n, d), n;
    },
    Bn = (e, d) => {
      let a = je(rt(e, d)),
        n = (r) => a.header.indexOf(r);
      a.rows.forEach((r) => {
        let s = r[n("experiment")] || "?",
          i = r[n("block_condition")] || "?",
          h = r[n("conditionName")],
          g = `${s} / ${h || i} (${i})`;
        ie.conditions.has(g) ||
          ie.conditions.set(g, { trials: [], participants: new Set() });
        let o = ie.conditions.get(g);
        o.participants.add(r[n("participant")] || "?"),
          o.trials.push({
            status: r[n("repairStatus")],
            lower: Number(r[n("actualLevelLog10DegLower")]),
            midpoint: Number(r[n("actualLevelLog10DegMidpoint")]),
            upper: Number(r[n("actualLevelLog10DegUpper")]),
          });
      });
    },
    On = () => {
      if (!ie.conditions.size) return [];
      let e = (a) => a.sort((n, r) => n - r)[Math.floor(a.length / 2)],
        d = ["", "Batch condition sensitivity (all files):"];
      for (let [a, n] of [...ie.conditions.entries()].sort((r, s) =>
        r[0].localeCompare(s[0]),
      )) {
        let r = n.trials,
          s = r.filter((h) => h.status === "CORRECTED").length,
          i = r.filter((h) => h.status === "RANGED").length;
        d.push(
          `  ${a}: ${
            n.participants.size
          } participants; ${s} corrected / ${i} ranged; median recovered log10 level ${De(
            e(r.map((h) => h.lower)),
            4,
          )} / ${De(e(r.map((h) => h.midpoint)), 4)} / ${De(
            e(r.map((h) => h.upper)),
            4,
          )} (lower/midpoint/upper)`,
        );
      }
      return d;
    },
    He = () => {
      if (!ie.processed && !ie.errors && !ie.skippedNonCsv) return;
      let e = document.getElementById("batchbar");
      e.style.display = "flex";
      let d = [];
      ie.repaired && d.push(`${ie.repaired} repaired`),
        ie.clean && d.push(`${ie.clean} needed nothing`),
        ie.flaggedOnly && d.push(`${ie.flaggedOnly} flagged for review`),
        ie.already && d.push(`${ie.already} already repaired`),
        ie.errors && d.push(`${ie.errors} unreadable`);
      let a = ie.processed + ie.errors,
        n = a > 0 && ie.repaired === a,
        r = n ? "files repaired" : "files assessed",
        s = `${
          n
            ? "Original files unchanged \xB7 folder structure preserved"
            : d.length
            ? d.join(" \xB7 ")
            : "no repairs needed"
        }${
          ie.skippedNonCsv ? ` \xB7 ${ie.skippedNonCsv} non-CSV skipped` : ""
        }`;
      document.getElementById(
        "batchcounts",
      ).innerHTML = `<strong>${a}</strong><span>${r}</span><small>${pe(
        s,
      )}</small>`;
    },
    Xn = () => {
      let e = document.getElementById("batchsummary");
      if (!ie.files.length) {
        e.hidden = !0;
        return;
      }
      let d = Xt(ie.files),
        a = [
          ie.files.some((r) => r.mode === "midpoint")
            ? '<span><i class="midpoint-dot"></i>Ranged midpoint</span>'
            : "",
          ie.files.some((r) => r.mode === "exact")
            ? '<span><i class="exact-dot"></i>Exact recovered</span>'
            : "",
        ].join(""),
        n = (r, s, i) =>
          Number.isFinite(s)
            ? `<div class="archive-metric"><span>${r}</span><strong>${i(
                s,
              )}</strong></div>`
            : "";
      (e.innerHTML = `
    <div class="archive-heading"><h2>Archive summary</h2>
      <p>${d.fileCount} repaired file${
        d.fileCount === 1 ? "" : "s"
      }. Each point is one file.</p></div>
    <div class="archive-metrics">
      ${n("Median eccentricity change", d.eccentricityMedian, Ie)}
      ${n(`Median ${d.quantity} change`, d.spacingMedian, Ie)}
      ${n(
        "Median spacing interval width",
        d.uncertaintyMedian,
        (r) => `${re(r, 3)}\xB0`,
      )}
    </div>
    <p class="archive-method">Large values and green lines mark the median of per-file medians. Ranged files use midpoint summaries; exact-only files use recovered values. Vertical offsets only separate points.</p>
    <div class="archive-plots">
      ${bt(ie.files, "eccentricity", "eccentricity")}
      ${bt(ie.files, "spacing", d.quantity)}
    </div>
    <div class="archive-legend">${a}</div>`),
        (e.hidden = !1);
    },
    fn = () =>
      `EasyEyes results repair report
` +
      new Date().toISOString() +
      `
${ie.processed} files assessed: ${ie.repaired} repaired (renamed "-repaired"), ${ie.clean} needed nothing, ${ie.flaggedOnly} flagged for review, ${ie.already} already repaired, ${ie.errors} unreadable` +
      (ie.skippedNonCsv ? `, ${ie.skippedNonCsv} non-CSV files skipped` : "") +
      `
Corrected rows replace requested values and list the replacements in repairImputedColumns. Ranged rows keep original values and append midpoint summaries, approximate continuous ranges, and model-consistent scenarios. Ranges cover fixation and rendered-width rounding only, not eye-tracker noise, viewing-distance error, timing error, or actual gaze deviation. Sensitivity CSVs carry trial responses and model-based lower/midpoint/upper levels for offline fitting, not QUEST replays or threshold estimates.

` +
      Fe.join(`
`) +
      On().join(`
`) +
      `
`,
    Yn = async (e) => {
      let d = [...ie.entries.keys()],
        a = new Set(d.map((o) => (o.includes("/") ? o.split("/")[0] : ""))),
        n = a.size === 1 && !a.has("") ? [...a][0] : "",
        r = [...new Set(ie.archiveStems)],
        i =
          r.length === 1 && r[0].endsWith(".results")
            ? `${r[0]
                .replace(/\.results$/i, "")
                .replace(/-repaired$/i, "")}-repaired.results.zip`
            : n
            ? n.endsWith(".results")
              ? `${n.slice(0, -8)}-repaired.results.zip`
              : `${n}-repaired.zip`
            : "easyeyes-results-repaired.zip",
        h = await e.generateAsync({ type: "blob", compression: "DEFLATE" }),
        g = document.createElement("a");
      (g.href = URL.createObjectURL(h)),
        (g.download = i),
        g.click(),
        setTimeout(() => URL.revokeObjectURL(g.href), 5e3);
    },
    Un =
      "These trials were not affected by the bug (e.g. eye at screen center, untracked session, or recorded outside the bug window).",
    Et =
      "The file lacks enough logged evidence to determine what was drawn. Nothing is changed; the report lists the reasons.",
    jn =
      "Metadata and non-trial rows need no repair assessment and are not counted as failures.";
  var qn =
      "This file already carries the repair audit columns \u2014 it was repaired before. It passes through unchanged; correcting twice is impossible.",
    hn = async (e, d) => {
      let a = d || e.name,
        n;
      try {
        let K = await e.arrayBuffer();
        n = new TextDecoder("utf-8", { ignoreBOM: !0 }).decode(K);
      } catch {
        n = null;
      }
      let r = null,
        s = null;
      if (n !== null)
        try {
          r = rn(n);
        } catch (K) {
          s = K && K.message ? String(K.message) : null;
        }
      if (!r) {
        ie.errors++,
          n !== null && it(a, n),
          Ze.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${pe(a)}</span>${Pe(
              "st-flagged",
              "could not parse",
              s || "The file is not a readable results CSV.",
            )}</div>`,
          ),
          Fe.push(`${a}: ERROR ${s || "could not parse"}`),
          He();
        return;
      }
      if (r.summary.alreadyRepaired) {
        ie.already++,
          it(a, n),
          Ze.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${pe(a)}</span>${Pe(
              "st-done",
              "already repaired",
              qn,
            )}</div>`,
          ),
          Fe.push(`${a}: already repaired \u2014 unchanged`),
          ie.processed++,
          He();
        return;
      }
      let i = r.summary;
      if (i.corrected + i.ranged === 0) {
        it(a, n);
        let K = {};
        on(r, K);
        let Q = Object.entries(K)
            .sort((he, t) => t[1] - he[1])
            .map(([he, t]) => `${t}\xD7 ${he}`).join(`
`),
          ce = [
            i.unaffected
              ? Pe("st-unaffected", `${i.unaffected} unaffected`, Un)
              : "",
            i.flagged ? Pe("st-flagged", `${i.flagged} flagged`, Q || Et) : "",
            i.ignored ? Pe("st-ignored", `${i.ignored} metadata`, jn) : "",
            i.unsupported
              ? Pe("st-ignored", `${i.unsupported} unsupported`, Et)
              : "",
          ].join("");
        Ze.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${pe(a)}</span>${ce}</div>`,
        ),
          Fe.push(
            `${a}: no scalar corrections or ranges \u2014 ${i.unaffected} unaffected / ${i.flagged} flagged / ${i.ignored} metadata / ${i.unsupported} unsupported (${i.total} rows); file unchanged`,
          ),
          Object.entries(K).forEach(([he, t]) =>
            Fe.push(`  FLAG ${t}x: ${he}`),
          ),
          ie[i.flagged ? "flaggedOnly" : "clean"]++,
          ie.processed++,
          He();
        return;
      }
      let { header: h, rows: g } = je(n),
        o = sn(n, r),
        b = h.indexOf("thresholdParameter"),
        u = Lt(
          b >= 0 ? g.map((K) => K[b] || "") : [],
          r.rows.map((K) => K.status),
        ),
        p = [
          i.corrected
            ? Pe(
                "st-corrected",
                `${i.corrected} trials \xB7 exact corrections`,
                "The repaired CSV replaces requested values with the exact recovered values.",
              )
            : "",
          i.discreteScenarios
            ? Pe(
                "st-ranged",
                `${i.discreteScenarios} trials \xB7 2 candidates`,
                "Two fixation candidates fit the logged triplet width.",
              )
            : "",
          i.continuousRanges
            ? Pe(
                "st-ranged",
                `${i.continuousRanges} trials \xB7 approximate ranges`,
                "Approximate continuous ranges are not guaranteed global bounds.",
              )
            : "",
          i.flagged
            ? Pe("st-flagged", `${i.flagged} trials need review`, Et)
            : "",
        ].join(" "),
        l = [
          i.unaffected ? `${i.unaffected} unaffected trials` : "",
          i.ignored ? `${i.ignored} metadata rows` : "",
          i.unsupported ? `${i.unsupported} unsupported trials` : "",
        ]
          .filter(Boolean)
          .join(" \xB7 "),
        m = [
          i.discreteScenarios ? `${i.discreteScenarios} two-candidate` : "",
          i.continuousRanges ? `${i.continuousRanges} approximate ranges` : "",
        ]
          .filter(Boolean)
          .join(" / "),
        f = (K, Q, ce = "") =>
          `<div class="summary-metric"><span>${K}</span><strong>${Q}</strong>${
            ce ? `<small>${ce}</small>` : ""
          }</div>`,
        x = [],
        w = [];
      o.eccentricityErrPct &&
        (w.push(tt(o.eccentricityErrPct[0], "eccentricity", !1)),
        x.push(
          f(
            "Median eccentricity change",
            Ie(o.eccentricityErrPct[0]),
            `Exact corrections; 5th\u201395th percentile: ${re(
              o.eccentricityErrPct05,
            )}% to ${re(o.eccentricityErrPct95)}%`,
          ),
        )),
        o.sizeSpacingInflationPct &&
          (w.push(tt(o.sizeSpacingInflationPct[0], u, !1)),
          x.push(
            f(
              `Median ${u} change`,
              Ie(o.sizeSpacingInflationPct[0]),
              `Exact corrections; 5th\u201395th percentile: ${re(
                o.sizeSpacingInflationPct05,
              )}% to ${re(o.sizeSpacingInflationPct95)}%`,
            ),
          )),
        o.rangedEccentricityErrPct &&
          (w.push(tt(o.rangedEccentricityErrPct[0], "eccentricity", !0)),
          x.push(
            f(
              "Median eccentricity change",
              Ie(o.rangedEccentricityErrPct[0]),
              `Midpoint values; 5th\u201395th percentiles: ${re(
                o.rangedEccentricityErrPct05,
              )}% to ${re(o.rangedEccentricityErrPct95)}%`,
            ),
          )),
        o.rangedSizeSpacingInflationPct &&
          (w.push(tt(o.rangedSizeSpacingInflationPct[0], u, !0)),
          x.push(
            f(
              `Median ${u} change`,
              Ie(o.rangedSizeSpacingInflationPct[0]),
              `Midpoint values; 5th\u201395th percentiles: ${re(
                o.rangedSizeSpacingInflationPct05,
              )}% to ${re(o.rangedSizeSpacingInflationPct95)}%`,
            ),
          ));
      let D = [];
      o.rangedSpacingUncertaintyDeg &&
        D.push(
          f(
            "Median spacing interval width",
            `${re(o.rangedSpacingUncertaintyDeg[0], 3)}\xB0`,
            `Upper minus lower value for each trial. Maximum: ${re(
              o.rangedSpacingUncertaintyDeg[1],
              3,
            )}\xB0`,
          ),
        );
      let _ = Nt(i),
        z = `<section class="repair-gist" aria-label="Repair summary">
    <div class="gist-count"><strong>${_.count}</strong><span>${pe(
      _.heading,
    )}</span></div>
    <div class="gist-copy"><h3>Repair summary</h3>
      ${_.sentences.map((K) => `<p>${pe(K)}</p>`).join("")}
      <p class="gist-caveat">${
        i.ranged
          ? "Original values remain unchanged for ranged trials. Midpoints summarize candidates or ranges; they are not observations."
          : "Exact corrections replace requested values with recovered geometry."
      } Recovered values come from logged geometry, not new measurements.</p>
    </div></section>`,
        A = `<div class="metrics-grid">
    <section class="metric-box"><h3>Estimated bug effect</h3>${x.join(
      "",
    )}<div class="metric-context">${w
      .map((K) => `<p>${pe(K)}</p>`)
      .join("")}</div></section>
    ${
      D.length
        ? `<section class="metric-box uncertainty"><h3>Remaining repair uncertainty</h3>${D.join(
            "",
          )}<p class="metric-context">${
            i.continuousRanges
              ? "Continuous ranges are approximate, not guaranteed bounds."
              : "Two-candidate intervals span scenario extrema and rendered-width rounding."
          }</p></section>`
        : ""
    }
    </div>`,
        B = 50,
        k = r.rows.map((K, Q) => ({
          status: K.status,
          html: In(K, g[Q], h, Q),
        })),
        I = new Map(),
        W = new Map();
      r.rows.forEach((K) => {
        if (K.status === "RANGED")
          for (let Q of Dt(K)) W.set(Q, (W.get(Q) || 0) + 1);
        if (K.status === "CORRECTED")
          for (let Q of Dt(K)) I.set(Q, (I.get(Q) || 0) + 1);
      });
      let E = I.size
          ? `<div class="pstrip"><b>Corrected parameters:</b> ${[...I]
              .map(
                ([K, Q]) =>
                  `<span class="pchip big">${pe(K)} <b>\xD7${Q}</b></span>`,
              )
              .join(
                "",
              )}<span class="hint">Corrected values replace requested values in these original columns, so existing analysis works unchanged. <code>repairImputedColumns</code> lists what changed on each row. Your source file is untouched.</span></div>`
          : "",
        M = W.size
          ? `<div class="pstrip"><b>Ranged parameters:</b> ${[...W]
              .map(
                ([K, Q]) =>
                  `<span class="pchip big">${pe(K)} <b>\xD7${Q}</b></span>`,
              )
              .join(
                "",
              )}<span class="hint">Original values are preserved; midpoint/min/max and any model-consistent scenarios are appended because the fixation used for target geometry was not logged.</span></div>`
          : "",
        c = `<section class="trials" aria-label="Trial repair results">
      <div class="trial-tools">
        <div><h3>Trials</h3><span class="rowscap">Expand a row for its derivation.</span></div>
        <label>Show
          <select class="rowfilter" aria-label="Filter trial rows">
            <option value="output">Repair output</option>
            <option value="review">Needs review</option>
            <option value="all">All CSV rows</option>
          </select>
        </label>
      </div>
      <p class="trial-definitions">${Ft}</p>
      <div class="pager">
        <button class="pageprev" type="button">\u2190 Previous</button>
        <span><span class="pageinfo"></span> \xB7 page <span class="pagecount"></span></span>
        <button class="pagenext" type="button">Next \u2192</button>
      </div>
      <div class="rowswrap"><table class="trial-table"><thead><tr>
        <th>CSV row</th><th>Recovery</th><th>Requested</th><th>Recovered</th>
        <th><span class="visually-hidden">Derivation</span></th>
      </tr></thead><tbody></tbody></table></div>
      </section>`,
        T = h.indexOf("targetEccentricityXDeg"),
        U = h.indexOf("targetEccentricityYDeg"),
        C = h.indexOf("level"),
        Y = [],
        L = [];
      r.rows.forEach((K, Q) => {
        let ce = K.status === "RANGED";
        if (K.status !== "CORRECTED" && !ce) return;
        let he = ce
            ? Number(K.columns.midpointTargetEccentricityRDeg)
            : K.actualTargetEccentricityXDeg,
          t = ce ? 0 : K.actualTargetEccentricityYDeg,
          N = ce
            ? Number(K.columns.midpointLevelLog10Deg)
            : K.actualLevelLog10Deg,
          F = ce ? Number(Se(K, "TargetEccentricityRDegMin")) : void 0,
          v = ce ? Number(Se(K, "TargetEccentricityRDegMax")) : void 0,
          y = ce ? Number(Se(K, "SpacingDegMin")) : void 0,
          S = ce ? Number(Se(K, "SpacingDegMax")) : void 0;
        if (T >= 0 && Number.isFinite(he)) {
          let X = Math.hypot(Number(g[Q][T]), Number(g[Q][U])),
            O = Math.hypot(he, t ?? 0);
          X > 0 && Number.isFinite(X) && Y.push([X, O, F, v]);
        }
        if (C >= 0 && Number.isFinite(N)) {
          let X = Math.pow(10, Number(g[Q][C]));
          X > 0 && Number.isFinite(X) && L.push([X, Math.pow(10, N), y, S]);
        }
      });
      let Z =
          Y.length || L.length
            ? `<div class="plots">${dn(
                Y,
                "requested eccentricity (\xB0)",
                "recovered (\xB0)",
              )}${dn(L, `requested ${u} (\xB0)`, "recovered (\xB0)")}</div>`
            : "",
        $ = 0,
        R = "output",
        V = () => {
          let K = k.filter((ce) => Bt(ce.status, R)),
            Q = Yt(K, $, B);
          ($ = Q.page),
            (te.querySelector(".trial-table > tbody").innerHTML = Q.items.length
              ? Q.items.map((ce) => ce.html).join("")
              : '<tr><td colspan="5" class="empty-rows">No rows match this filter.</td></tr>'),
            (te.querySelector(".pageinfo").textContent = Q.label),
            (te.querySelector(".pagecount").textContent = `${Q.page + 1}/${
              Q.pageCount
            }`),
            (te.querySelector(".pageprev").disabled = Q.page === 0),
            (te.querySelector(".pagenext").disabled =
              Q.page >= Q.pageCount - 1);
        },
        H = lt(e.name),
        j = e.name.replace(/\.csv$/i, ""),
        ae = j.split("_")[0] || j,
        oe = j.match(/\d{4}-\d{2}-\d{2}/)?.[0] || "";
      ie.files.push({
        label: `${ae}${oe ? ` \xB7 ${oe}` : ""}`,
        eccentricity: o.rangedTrials
          ? o.rangedEccentricityErrPct?.[0] ?? Number.NaN
          : o.eccentricityErrPct?.[0] ?? Number.NaN,
        spacing: o.rangedTrials
          ? o.rangedSizeSpacingInflationPct?.[0] ?? Number.NaN
          : o.sizeSpacingInflationPct?.[0] ?? Number.NaN,
        uncertainty: o.rangedSpacingUncertaintyDeg?.[0] ?? Number.NaN,
        quantity: u,
        mode: o.rangedTrials ? "midpoint" : "exact",
      }),
        Xn();
      let te = document.createElement("details");
      (te.className = "card file-card"),
        (te.open = !Ze.querySelector(".file-card")),
        (te.innerHTML = `
      <summary>
        <span class="file-heading">
          <span class="file-title">${pe(ae)}${
            oe ? ` \xB7 ${pe(oe)}` : ""
          }</span>
          <span class="fpath">${pe(a)}</span>
        </span>
        <span class="file-outcomes"><span class="chips">${p}</span>
          <span class="expand-label">Details</span></span>
      </summary>
      <div class="file-body">
        <div class="file-actions">
          <div class="download-group">
            <button class="dl" title="Download the repaired trial data; your source file is untouched">Repaired CSV</button>
            <button class="dl sens secondary" title="Trial responses and scenario levels for offline fitting; not a threshold estimate">Sensitivity CSV</button>
          </div>
          ${l ? `<span class="secondary-counts">${pe(l)}</span>` : ""}
        </div>
        ${z}
        ${A}
        <details class="output-details">
          <summary>Output columns and file names</summary>
          <p>Repaired file: <code>${pe(H)}</code></p>
          <p>Sensitivity CSV: trial responses with lower/midpoint/upper levels for offline fitting\u2014not a QUEST replay or threshold estimate.</p>
          ${E}
          ${M}
        </details>
        ${
          Z
            ? `<details class="plots-details"><summary>Requested-vs-recovered plots</summary><p class="note">Ranged points are midpoint summaries, not individual observations; bars show scenario extrema or approximate ranges.</p>${Z}</details>`
            : ""
        }
        ${c}
      </div>`),
        te.querySelector(".pageprev").addEventListener("click", () => {
          $--, V();
        }),
        te.querySelector(".pagenext").addEventListener("click", () => {
          $++, V();
        }),
        te.querySelector(".rowfilter").addEventListener("change", (K) => {
          (R = K.target.value), ($ = 0), V();
        }),
        te
          .querySelector(".trial-table > tbody")
          .addEventListener("click", (K) => {
            let Q = K.target.closest(".rowdetails");
            if (!Q) return;
            let ce = Q.closest("tr").nextElementSibling,
              he = ce.hidden;
            (ce.hidden = !he),
              (Q.textContent = he ? "Hide" : "Details"),
              Q.setAttribute("aria-expanded", String(he)),
              Q.setAttribute(
                "aria-label",
                `${he ? "Hide" : "Show"} details for CSV row ${Q.dataset.row}`,
              );
          }),
        V(),
        te
          .querySelector(".dl")
          .addEventListener("click", () => St(H, wt(n, r))),
        te
          .querySelector(".sens")
          .addEventListener("click", () => St(_t(a), rt(n, r))),
        Ze.appendChild(te),
        ie.repaired++,
        it(lt(a), wt(n, r)),
        it(_t(a), rt(n, r)),
        Bn(n, r),
        Fe.push(
          `${a}: ${i.corrected} corrected / ${i.ranged} ranged / ${
            i.unaffected
          } unaffected / ${i.flagged} flagged / ${i.ignored} metadata / ${
            i.unsupported
          } unsupported (${i.total} rows; ${m}) \u2014 fixed -> ${lt(
            a,
          )}; sensitivity -> ${_t(a)}`,
        ),
        Fe.push(...Mn(n, r)),
        o.correctedTrials > 0 &&
          Fe.push(
            `  drawn-vs-requested: ${
              o.eccentricityErrPct
                ? `position median ${De(
                    Math.abs(o.eccentricityErrPct[0]),
                  )}% max ${De(o.eccentricityErrPct[1])}%; `
                : ""
            }${
              o.sizeSpacingInflationPct
                ? `size/spacing median ${De(
                    Math.abs(o.sizeSpacingInflationPct[0]),
                  )}% max ${De(o.sizeSpacingInflationPct[1])}%`
                : ""
            }`,
          ),
        o.rangedTrials > 0 &&
          Fe.push(
            `  ranged midpoint summaries (not observations): ${
              o.rangedEccentricityErrPct
                ? `position median ${De(
                    o.rangedEccentricityErrPct[0],
                  )}% [5th-95th ${De(o.rangedEccentricityErrPct05)}%, ${De(
                    o.rangedEccentricityErrPct95,
                  )}%]; `
                : ""
            }${
              o.rangedSizeSpacingInflationPct
                ? `size/spacing median ${De(
                    o.rangedSizeSpacingInflationPct[0],
                  )}% [5th-95th ${De(o.rangedSizeSpacingInflationPct05)}%, ${De(
                    o.rangedSizeSpacingInflationPct95,
                  )}%]; `
                : ""
            }${
              o.rangedSpacingUncertaintyDeg
                ? `median spacing interval width ${De(
                    o.rangedSpacingUncertaintyDeg[0],
                    3,
                  )} deg; maximum ${De(
                    o.rangedSpacingUncertaintyDeg[1],
                    3,
                  )} deg`
                : ""
            }`,
          );
      let se = {};
      on(r, se),
        Object.entries(se).forEach(([K, Q]) => Fe.push(`  FLAG ${Q}x: ${K}`)),
        ie.processed++,
        He();
    },
    Wn = async (e) => {
      let d = [],
        a = e.items
          ? [...e.items]
              .map((r) => (r.webkitGetAsEntry ? r.webkitGetAsEntry() : null))
              .filter(Boolean)
          : [];
      if (!a.length)
        return [...e.files].map((r) => ({ file: r, relPath: r.name }));
      let n = async (r, s) => {
        if (r.isFile) {
          let i = await new Promise((h, g) => r.file(h, g));
          d.push({ file: i, relPath: s + r.name });
        } else if (r.isDirectory) {
          let i = r.createReader(),
            h = await new Promise((g, o) => i.readEntries(g, o));
          for (; h.length; ) {
            for (let g of h) await n(g, s + r.name + "/");
            h = await new Promise((g, o) => i.readEntries(g, o));
          }
        }
      };
      for (let r of a) await n(r, "");
      return d;
    },
    Zn = async (e, d) => {
      let a = d || e.name,
        n = null;
      try {
        n = await kt.default.loadAsync(await e.arrayBuffer());
      } catch {
        n = null;
      }
      if (!n) {
        ie.errors++,
          Ze.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${pe(a)}</span>${Pe(
              "st-flagged",
              "could not unzip",
              "The archive is corrupt, encrypted, or not a ZIP file \u2014 it is included unchanged.",
            )}</div>`,
          ),
          Fe.push(`${a}: ERROR could not unzip`),
          He();
        return;
      }
      let r = Object.values(n.files).filter((o) => !o.dir),
        s = (o) => o.split("/").pop(),
        i = (o) =>
          /^__MACOSX\//i.test(o) ||
          /^\./.test(s(o)) ||
          o === "REPAIR-REPORT.txt",
        h = (o) => /\.csv$/i.test(s(o)) && !i(o),
        g = r.filter((o) => h(o.name));
      if (
        (r.forEach((o) => {
          !h(o.name) && !i(o.name) && ie.skippedNonCsv++;
        }),
        !g.length)
      ) {
        Ze.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${pe(a)}</span>${Pe(
            "st-flagged",
            "no data files",
            "No .csv results files inside this archive.",
          )}</div>`,
        ),
          Fe.push(`${a}: no CSV files inside \u2014 unchanged`),
          He();
        return;
      }
      ie.archiveStems.push(
        a
          .replace(/\.zip$/i, "")
          .split("/")
          .pop(),
      );
      for (let o of g) {
        let b = s(o.name);
        await hn(
          { name: b, arrayBuffer: () => o.async("arraybuffer") },
          o.name,
        );
      }
    },
    $t = async (e) => {
      for (let { file: d, relPath: a } of e) {
        let n = (a || d.name).split("/").pop();
        if (/\.zip$/i.test(n)) {
          await Zn(d, a);
          continue;
        }
        if (!/\.csv$/i.test(n) || /^\./.test(n)) {
          ie.skippedNonCsv++, He();
          continue;
        }
        await hn(d, a);
      }
    },
    Qe = document.getElementById("drop"),
    at = document.getElementById("file");
  at.accept = It;
  var dt = document.getElementById("folder");
  document.getElementById("pickFiles").addEventListener("click", (e) => {
    e.stopPropagation(), at.click();
  });
  document.getElementById("pickFolder").addEventListener("click", (e) => {
    e.stopPropagation(), dt.click();
  });
  Qe.addEventListener("dragover", (e) => {
    e.preventDefault(), Qe.classList.add("over");
  });
  Qe.addEventListener("dragleave", () => Qe.classList.remove("over"));
  Qe.addEventListener("drop", async (e) => {
    e.preventDefault(),
      Qe.classList.remove("over"),
      $t(await Wn(e.dataTransfer));
  });
  at.addEventListener("change", () => {
    $t([...at.files].map((e) => ({ file: e, relPath: e.name }))),
      (at.value = "");
  });
  dt.addEventListener("change", () => {
    $t(
      [...dt.files].map((e) => ({
        file: e,
        relPath: e.webkitRelativePath || e.name,
      })),
    ),
      (dt.value = "");
  });
  document
    .getElementById("reportBtn")
    .addEventListener("click", () => St("repair-report.txt", fn()));
  document.getElementById("zipBtn").addEventListener("click", async () => {
    let e = new kt.default();
    for (let [d, a] of ie.entries) e.file(d, a);
    e.file("REPAIR-REPORT.txt", fn()), await Yn(e);
  });
  var Je = null,
    Hn = () => {
      let e = document.getElementById("xp-char").value || "E",
        d = document.createElement("canvas").getContext("2d");
      d.font = "700 100px Arial, sans-serif";
      let a = d.measureText(e[0]),
        n =
          a.actualBoundingBoxAscent && a.actualBoundingBoxDescent !== void 0
            ? a.actualBoundingBoxAscent + a.actualBoundingBoxDescent
            : 72;
      Je = { ch: e[0], capH: n, width: a.width || 60 };
    };
  var pn = "placement",
    ke = {};
  ["preset", "w", "h", "ppc", "dist", "ex", "ey", "grid", "ref"].forEach(
    (e) => (ke[e] = document.getElementById("xp-" + e)),
  );
  var Rt = () => {
      let e = Number(ke.w.value),
        d = Number(ke.h.value),
        a = Number(ke.ppc.value);
      return (
        ke.preset.value !== "custom" &&
          ([e, d, a] = ke.preset.value.split(",").map(Number)),
        (a = Math.max(1, a)),
        ke.preset.value === "custom" &&
          Number(ke.ppc.value) !== a &&
          (ke.ppc.value = a),
        {
          w: e,
          h: d,
          ppc: a,
          dist: Number(ke.dist.value),
          eyeXPx: Number(ke.ex.value) * a,
          eyeYPx: Number(ke.ey.value) * a,
          showGrid: ke.grid.checked,
          showRef: ke.ref.checked,
          mode: pn,
          sizeDeg: Number(document.getElementById("xp-size").value),
          sizeDim: document.getElementById("xp-sizedim").value,
        }
      );
    },
    Gn = (e) => {
      let d = Math.max(-1, Math.min(1, (e - 1) / 0.2)),
        a = (r, s, i) => Math.round(r + (s - r) * i);
      if (d >= 0) {
        let r = d;
        return `rgb(${a(250, 212, r)},${a(250, 78, r)},${a(250, 0, r)})`;
      }
      let n = -d;
      return `rgb(${a(250, 26, n)},${a(250, 90, n)},${a(250, 200, n)})`;
    },
    Ct = () => {
      let e = Rt();
      if (!(e.w > 0 && e.h > 0 && e.ppc > 0 && e.dist > 0)) return;
      (document.getElementById("xp-dist-v").textContent = e.dist),
        (document.getElementById("xp-ex-v").textContent = ye(
          (e.eyeXPx / e.ppc).toFixed(1),
        )),
        (document.getElementById("xp-ey-v").textContent = ye(
          (e.eyeYPx / e.ppc).toFixed(1),
        )),
        document
          .getElementById("explore")
          .classList.toggle("showCustom", ke.preset.value === "custom");
      let d = [e.eyeXPx, e.eyeYPx],
        a = [e.eyeXPx + e.w / 2, e.h / 2 - e.eyeYPx],
        n = { pxPerCm: e.ppc, viewingDistanceCm: e.dist, fixationXYPx: [0, 0] },
        r = { ...n, nearestPointXYZPx: d },
        s = { ...n, nearestPointXYZPx: a },
        i = 640,
        h = Math.round((i * e.h) / e.w),
        g = (k) => ((k + e.w / 2) / e.w) * i,
        o = (k) => ((e.h / 2 - k) / e.h) * h,
        b = 52,
        u = 32,
        p = i / b,
        l = h / u,
        m = [];
      for (let k = 0; k < u; k++)
        for (let I = 0; I < b; I++) {
          let W = -e.w / 2 + ((I + 0.5) / b) * e.w,
            E = e.h / 2 - ((k + 0.5) / u) * e.h,
            M = _e([W, E], r),
            c = Math.hypot(M[0], M[1]);
          if (c < 0.5) continue;
          let T;
          if (e.mode === "size") {
            let U = e.sizeDim === "h" ? [0, 1] : [1, 0],
              C = be(M, s),
              Y = be([M[0] + U[0] * e.sizeDeg, M[1] + U[1] * e.sizeDeg], s),
              L = _e(C, r),
              Z = _e(Y, r);
            T = Math.hypot(Z[0] - L[0], Z[1] - L[1]) / e.sizeDeg;
          } else {
            let U = be(M, s),
              C = _e(U, r);
            T = Math.hypot(C[0], C[1]) / c;
          }
          m.push(
            `<rect x="${(I * p).toFixed(1)}" y="${(k * l).toFixed(
              1,
            )}" width="${(p + 0.5).toFixed(1)}" height="${(l + 0.5).toFixed(
              1,
            )}" fill="${Gn(T)}"/>`,
          );
        }
      let f = 5,
        x = (k, I) => {
          let W = [],
            M = (c, T) => {
              let U = "",
                C = null,
                Y = Math.max(e.w, e.h) * 4,
                L = Math.max(e.w, e.h) * 3;
              for (let Z = -80; Z <= 80; Z += 1) {
                let R = be(c ? [T, Z] : [Z, T], k);
                if (
                  !Number.isFinite(R[0]) ||
                  !Number.isFinite(R[1]) ||
                  Math.abs(R[0]) > L ||
                  Math.abs(R[1]) > L
                ) {
                  C = null;
                  continue;
                }
                let V = C && Math.hypot(R[0] - C[0], R[1] - C[1]) > Y;
                (U += `${U && !V ? "L" : "M"}${g(R[0]).toFixed(1)},${o(
                  R[1],
                ).toFixed(1)}`),
                  (C = R);
              }
              U && W.push(`<path d="${U}" fill="none" ${I}/>`);
            };
          for (let c = -80; c <= 80; c += f) M(!0, c), M(!1, c);
          return W.join("");
        },
        w = "";
      if (e.showRef) {
        w += x(
          r,
          'stroke="#2e7d32" stroke-opacity="0.6" stroke-width="0.8" stroke-dasharray="5 4"',
        );
        let k = [];
        for (let I = -80; I <= 80; I += f) {
          if (I === 0) continue;
          let W = be([I, 0], r);
          Number.isFinite(W[0]) &&
            W[0] > -e.w / 2 + 8 &&
            W[0] < e.w / 2 - 8 &&
            k.push(
              `<text x="${g(W[0]).toFixed(
                1,
              )}" y="11" font-size="9" fill="#1e6b2f" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${ye(
                I,
              )}\xB0</text>`,
            );
          let E = be([0, I], r);
          Number.isFinite(E[1]) &&
            E[1] > -e.h / 2 + 8 &&
            E[1] < e.h / 2 - 8 &&
            k.push(
              `<text x="4" y="${(o(E[1]) + 3).toFixed(
                1,
              )}" font-size="9" fill="#1e6b2f" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${ye(
                I,
              )}\xB0</text>`,
            );
        }
        w += k.join("");
      }
      e.showGrid &&
        (w += x(
          s,
          'stroke="#16344d" stroke-opacity="0.85" stroke-width="1.3"',
        ));
      let D = `<circle cx="${g(0)}" cy="${o(
        0,
      )}" r="4" fill="none" stroke="#222" stroke-width="1.4"><title>fixation</title></circle>`;
      document.querySelector(".legend").innerHTML =
        e.mode === "size"
          ? '<span class="sw" style="background:#1a5ac8"></span> drawn smaller than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> drawn larger than requested'
          : '<span class="sw" style="background:#1a5ac8"></span> drawn closer than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> drawn farther than requested';
      let _ = `<svg id="xp-svg" viewBox="0 0 ${i} ${h}" width="${i}" height="${h}">
    ${m.join("")}${w}${D}<g id="xp-glyphs"></g>
  </svg>`,
        z = document.getElementById("xp-plot");
      z.innerHTML = _;
      let A = document.getElementById("xp-svg"),
        B = document.createElement("div");
      (B.id = "xp-tooltip"),
        (z.style.position = "relative"),
        z.appendChild(B),
        A.addEventListener("mousemove", (k) => {
          let I = A.getBoundingClientRect(),
            W = ((k.clientX - I.left) / I.width) * e.w - e.w / 2,
            E = e.h / 2 - ((k.clientY - I.top) / I.height) * e.h,
            M = _e([W, E], r),
            c = Math.hypot(M[0], M[1]),
            T;
          if (e.mode === "size") {
            let V = e.sizeDim === "h" ? [0, 1] : [1, 0],
              H = be(M, s),
              j = be([M[0] + V[0] * e.sizeDeg, M[1] + V[1] * e.sizeDeg], s),
              ae = _e(H, r),
              oe = _e(j, r),
              te = Math.hypot(oe[0] - ae[0], oe[1] - ae[1]);
            (T = `<b>${Ie(
              ((te - e.sizeDeg) / e.sizeDeg) * 100,
            )}</b> size error`),
              Je || Hn();
            let se = be(M, r),
              K = H,
              Q = (F, v) => {
                let y = be(
                  [M[0] + V[0] * e.sizeDeg, M[1] + V[1] * e.sizeDeg],
                  v,
                );
                return Math.hypot(y[0] - F[0], y[1] - F[1]);
              },
              ce = Q(se, r),
              he = Q(K, s),
              t = e.sizeDim === "h" ? Je.capH : Je.width,
              N = (F, v, y, S) =>
                `<text x="${g(F[0]).toFixed(1)}" y="${o(F[1]).toFixed(
                  1,
                )}" font-family="Arial, sans-serif" font-weight="700" font-size="${(
                  (v / t) *
                  100
                ).toFixed(
                  1,
                )}" fill="${y}" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${pe(
                  Je.ch,
                )}</text><text x="${g(F[0]).toFixed(1)}" y="${(
                  o(F[1]) +
                  ((v / t) * 100) / 2 +
                  12
                ).toFixed(
                  1,
                )}" font-size="10" fill="${y}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${S}</text>`;
            A.querySelector("#xp-glyphs").innerHTML =
              N(se, ce, "#2e7d32", `requested ${e.sizeDeg}\xB0`) +
              N(K, he, "#16344d", `actual ${ye(te.toFixed(2))}\xB0`);
          } else {
            let V = be(M, s),
              H = _e(V, r),
              j = Math.hypot(H[0], H[1]);
            T = `<b>${
              c > 0.1 ? Ie(((j - c) / c) * 100) : "\u2014"
            }</b> eccentricity error`;
            let ae = be(M, r),
              oe = (te, se, K, Q) =>
                `<text x="${g(te[0]).toFixed(1)}" y="${(
                  o(te[1]) + (Q ? -12 : 20)
                ).toFixed(
                  1,
                )}" font-size="10" fill="${se}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${K}</text>`;
            A.querySelector("#xp-glyphs").innerHTML =
              `<line x1="${g(ae[0]).toFixed(1)}" y1="${o(ae[1]).toFixed(
                1,
              )}" x2="${g(V[0]).toFixed(1)}" y2="${o(V[1]).toFixed(
                1,
              )}" stroke="#555" stroke-width="1" stroke-opacity="0.6"/><circle cx="${g(
                ae[0],
              ).toFixed(1)}" cy="${o(ae[1]).toFixed(
                1,
              )}" r="7" fill="#2e7d32" fill-opacity="0.55"/><circle cx="${g(
                V[0],
              ).toFixed(1)}" cy="${o(V[1]).toFixed(
                1,
              )}" r="7" fill="#16344d" fill-opacity="0.55"/>` +
              oe(
                ae,
                "#2e7d32",
                `requested (${ye(M[0].toFixed(1))}, ${ye(
                  M[1].toFixed(1),
                )})\xB0 \xB7 ${ye(c.toFixed(2))}\xB0`,
                !0,
              ) +
              oe(
                V,
                "#16344d",
                `actual (${ye(H[0].toFixed(1))}, ${ye(
                  H[1].toFixed(1),
                )})\xB0 \xB7 ${ye(j.toFixed(2))}\xB0`,
                !1,
              );
          }
          (B.innerHTML = T), (B.style.display = "block");
          let U = z.getBoundingClientRect();
          (B.style.left = "0px"), (B.style.top = "0px");
          let C = B.offsetWidth,
            Y = B.offsetHeight,
            L = k.clientX - U.left,
            Z = k.clientY - U.top,
            $ = L + 16;
          $ + C > U.width - 4 && ($ = L - C - 16);
          let R = Math.min(Math.max(Z - Y / 2, 2), U.height - Y - 2);
          B.style.transform = `translate(${$}px, ${R}px)`;
        }),
        A.addEventListener("mouseleave", () => {
          (B.style.display = "none"),
            (A.querySelector("#xp-glyphs").innerHTML = "");
        });
    },
    gn = () => {
      let e = Rt();
      if (!(e.w > 0 && e.h > 0 && e.ppc > 0 && e.dist > 0)) return;
      let d = e.w,
        a = e.h,
        n = e.ppc,
        r = e.dist,
        s = [e.eyeXPx, e.eyeYPx],
        i = [s[0] + d / 2, a / 2 - s[1]],
        h = Number(document.getElementById("xp-req").value),
        g = (l) => `<span class="st" data-tip="${pe(l)}">`,
        o = "</span>",
        b = `
    <div class="fx"><span class="lbl">pixels &rarr; angle (radial):</span>
      ${g(
        "R: maps a pixel offset to the visual angle it subtends at the eye; preserves direction, rescales length",
      )}<i><b>R</b>(<b>u</b>)</i>${o} = <span class="frac"><span class="num">180</span><span class="den">&pi;</span></span> atan<span class="frac"><span class="num">&Vert;<b>u</b>&Vert;</span><span class="den">${g(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${o}</span></span> &middot; <span class="frac"><span class="num"><b>u</b></span><span class="den">&Vert;<b>u</b>&Vert;</span></span>
    </div>
    <div class="fx"><span class="lbl">angle &rarr; pixels (its inverse):</span>
      ${g(
        "R\u207B\xB9: the inverse map, angle \u2192 pixel offset \u2014 this is what places a stimulus on screen",
      )}<i><b>R</b><sup>&minus;1</sup>(<b>v</b>)</i>${o} = ${g(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${o} tan<span class="frac"><span class="num">&pi;&Vert;<b>v</b>&Vert;</span><span class="den">180</span></span> &middot; <span class="frac"><span class="num"><b>v</b></span><span class="den">&Vert;<b>v</b>&Vert;</span></span>
    </div>
    <div class="fx fxline-bug"><span class="lbl">drawn on screen (assumed eye):</span>
      <b class="v">p</b> = ${g(
        "n_bug: the point the buggy code used as the nearest point \u2014 its projection's pivot",
      )}<b class="v">n<sub>bug</sub></b>${o} + <i><b>R</b><sup>&minus;1</sup></i>(&theta; &minus; <i><b>R</b></i>(<b class="v">n<sub>bug</sub></b>))
    </div>
    <div class="fx fxline-act"><span class="lbl">what you actually saw (true eye):</span>
      <b class="v">a</b> = <i><b>R</b></i>(<b class="v">p</b> &minus; ${g(
        "n: the true nearest point \u2014 the screen point closest to your eye",
      )}<b class="v">n</b>${o}) + <i><b>R</b></i>(<b class="v">n</b>)
    </div>
    <div class="fx"><span class="lbl">the bug, in full ${g(
      "The webcam tracker's top-left-origin coordinates were used verbatim in the center-origin frame.",
    )}(raw rc, unconverted)${o}:</span>
      <b class="v">n<sub>bug</sub></b> = ( n<sub>x</sub> + W/2 , &nbsp;H/2 &minus; n<sub>y</sub> )
    </div>
    <div class="fxwhere">
      <p class="conv">Where: screen positions are in pixels from screen center (x rightward, y upward); positions <span class="sym">&theta;</span> and <span class="sym">a</span> are in degrees of visual angle from the fixation mark; the offsets <span class="sym">u</span> and <span class="sym">v</span> are measured from the nearest point <span class="sym">n</span>; vectors are 2-component (x, y), and &Vert;<span class="sym">u</span>&Vert; is a vector&rsquo;s length; 180/&pi; converts radians to degrees.</p>
      <div class="fxdefs">
        <div class="fd"><span class="sym">s</span> \u2014 pixel density: pixels per cm (set by the Screen preset).</div>
        <div class="fd"><span class="sym">d</span> \u2014 viewing distance, eye to screen, in cm (&ldquo;Viewing distance&rdquo; control); <span class="sym">s</span>&middot;<span class="sym">d</span> is that distance in pixels.</div>
        <div class="fd"><span class="sym">W</span>, <span class="sym">H</span> \u2014 screen width and height in pixels (set by the Screen preset).</div>
        <div class="fd"><span class="sym">n</span> \u2014 the nearest point: the screen point closest to your eye, in pixels from center (&ldquo;True eye X/Y&rdquo; controls).</div>
        <div class="fd"><span class="sym">n<sub>x</sub></span>, <span class="sym">n<sub>y</sub></span> \u2014 n&rsquo;s horizontal and vertical components.</div>
        <div class="fd"><span class="sym">n<sub>bug</sub></span> \u2014 the point the buggy code used as the nearest point \u2014 its projection&rsquo;s pivot.</div>
        <div class="fd"><span class="sym">u</span> \u2014 a screen offset in pixels, measured from the nearest point.</div>
        <div class="fd"><span class="sym">v</span> \u2014 an angular offset in degrees, measured from the nearest point&rsquo;s direction.</div>
        <div class="fd"><span class="sym">R</span> \u2014 maps a pixel offset to the visual angle it subtends at the eye; preserves direction, rescales length (atan = arctangent).</div>
        <div class="fd"><span class="sym">R<sup>&minus;1</sup></span> \u2014 the inverse map, angle &rarr; pixel offset: what places a stimulus on screen.</div>
        <div class="fd"><span class="sym">&theta;</span> \u2014 the requested stimulus position, in degrees from fixation (&ldquo;requested position&rdquo; slider).</div>
        <div class="fd"><span class="sym">p</span> \u2014 the pixel position actually drawn, computed with the assumed eye (&ldquo;drawn \u2026 cm&rdquo; on the diagram).</div>
        <div class="fd"><span class="sym">a</span> \u2014 the drawn stimulus&rsquo;s actual position, in degrees from fixation, as seen from the true eye (&ldquo;actual \u2026&deg;&rdquo; on the diagram).</div>
        <div class="fd"><span class="sym">rc</span> \u2014 the Remote Calibrator, our webcam tracker: coordinates from the screen&rsquo;s top-left, y downward.</div>
      </div>
      <p class="fxnote">In <span class="sym">R</span>(<span class="sym">n</span>) and <span class="sym">R</span>(<span class="sym">n<sub>bug</sub></span>) above, <span class="sym">R</span> receives a position rather than an offset: the offset from <span class="sym">n</span> to the central fixation is <span class="sym">&minus;n</span>, and <span class="sym">R</span> preserves direction, so <span class="sym">R(n) = &minus;R(&minus;n)</span> \u2014 the nearest point&rsquo;s own position in degrees from fixation.</p>
    </div>`,
        u = document.getElementById("xp-formulas");
      u && (u.innerHTML = `<div class="formulas">${b}</div>`);
      let p = document.getElementById("xp-values");
      p &&
        (p.innerHTML = `<div class="fxvals">&theta; ${ye(
          h,
        )}&deg;&nbsp;|&nbsp;s ${n} px/cm&nbsp;|&nbsp;d ${r} cm&nbsp;|&nbsp;W ${d} px&nbsp;|&nbsp;H ${a} px&nbsp;|&nbsp;n (${ye(
          s[0],
        )}, ${ye(s[1])}) px&nbsp;|&nbsp;n<sub>bug</sub> (${ye(i[0])}, ${ye(
          i[1],
        )}) px</div>`);
    },
    mn = () => {
      let e = document.getElementById("xp-diagram");
      if (!e) return;
      let d = Rt();
      if (!(d.w > 0 && d.h > 0 && d.ppc > 0 && d.dist > 0)) return;
      let a = document.getElementById("xp-req"),
        n = Number(a.value);
      document.getElementById("xp-req-v").textContent = ye(n);
      let r = [d.eyeXPx, d.eyeYPx],
        s = [d.eyeXPx + d.w / 2, d.h / 2 - d.eyeYPx],
        i = { pxPerCm: d.ppc, viewingDistanceCm: d.dist, fixationXYPx: [0, 0] },
        h = be([n, 0], { ...i, nearestPointXYZPx: s }),
        g = _e(h, { ...i, nearestPointXYZPx: r }),
        o = d.w / d.ppc,
        b = d.eyeXPx / d.ppc,
        u = b + o / 2,
        p = h[0] / d.ppc,
        l = d.dist,
        m = 30,
        f = Math.min(-o / 2, b, p) - 6,
        x = Math.max(o / 2, u, p) + 6,
        w = 368,
        D = Math.min((w - 2 * m) / (x - f), 430 / (l + 6)),
        _ = w,
        z = (f + x) / 2,
        A = (_ - 2 * m) / D,
        B = z - A / 2,
        k = (Z) => m + (Z - B) * D,
        I = Math.round(70 + (l + 6) * D),
        W = (Z) => 40 + Z * D,
        E = `<line x1="${k(-o / 2)}" y1="${W(0)}" x2="${k(o / 2)}" y2="${W(
          0,
        )}" stroke="#222" stroke-width="4"/>
    <text x="${k(o / 2)}" y="${
      W(0) + 16
    }" font-size="10" fill="#444" text-anchor="end">screen (${o.toFixed(
      0,
    )} cm wide)</text>`,
        M = `<circle cx="${k(0)}" cy="${W(
          0,
        )}" r="4" fill="#222"><title>fixation</title></circle>
    <text x="${k(0) + 6}" y="${
      W(0) - 6
    }" font-size="10" fill="#222">fixation</text>`,
        c = [
          `<line x1="${k(u)}" y1="${W(l)}" x2="${k(p)}" y2="${W(
            0,
          )}" stroke="#b26a00" stroke-width="2"/>`,
          `<line x1="${k(u)}" y1="${W(l)}" x2="${k(0)}" y2="${W(
            0,
          )}" stroke="#b26a00" stroke-width="1" stroke-dasharray="4 3"/>`,
          `<line x1="${k(b)}" y1="${W(l)}" x2="${k(p)}" y2="${W(
            0,
          )}" stroke="#2b6cb0" stroke-width="2"/>`,
          `<line x1="${k(b)}" y1="${W(l)}" x2="${k(0)}" y2="${W(
            0,
          )}" stroke="#2b6cb0" stroke-width="1" stroke-dasharray="4 3"/>`,
        ].join(""),
        T = `
    <circle cx="${k(u)}" cy="${W(l)}" r="5" fill="#b26a00"/>
    <text x="${k(u)}" y="${
      W(l) + 18
    }" font-size="10" fill="#b26a00" text-anchor="middle">eye as the bug assumed</text>
    <circle cx="${k(b)}" cy="${W(l)}" r="5" fill="#2b6cb0"/>
    <text x="${k(b)}" y="${
      W(l) - 10
    }" font-size="10" fill="#2b6cb0" text-anchor="middle">your true eye</text>`,
        U = [(u + p) / 2, l / 2],
        C = [(b + p) / 2, l / 2],
        Y = n !== 0 ? ((Math.abs(g[0]) - Math.abs(n)) / Math.abs(n)) * 100 : 0,
        L = `<circle cx="${k(p)}" cy="${W(0)}" r="4.5" fill="#b3261e"/>
    <text x="${k(p) - 6}" y="${
      W(0) - 8
    }" font-size="10" fill="#b3261e" text-anchor="end">drawn ${ye(
      p.toFixed(1),
    )} cm</text>
    <text x="${k(U[0]) + 8}" y="${
      W(U[1]) + 4
    }" font-size="10" fill="#b26a00">requested ${ye(n)}\xB0</text>
    <text x="${k(C[0]) - 8}" y="${
      W(C[1]) - 6
    }" font-size="10" fill="#2b6cb0">actual ${ye(g[0].toFixed(2))}\xB0${
      n ? ` (${Ie(Y)} farther)` : ""
    }</text>`;
      e.innerHTML = `<svg viewBox="0 0 ${_} ${I}" width="${_}" height="${I}">${E}${M}${c}${T}${L}</svg>`;
    },
    zt = () => {
      mn(), Ct(), gn();
    };
  ["preset", "w", "h", "ppc", "grid", "ref"].forEach((e) =>
    ke[e].addEventListener("change", zt),
  );
  ["dist", "ex", "ey"].forEach((e) => ke[e].addEventListener("input", zt));
  document.getElementById("xp-req").addEventListener("input", () => {
    mn(), gn();
  });
  document.getElementById("xp-char").addEventListener("input", () => {
    Je = null;
  });
  ["size", "sizedim"].forEach((e) =>
    document.getElementById("xp-" + e).addEventListener("input", () => {
      (document.getElementById("xp-size-v").textContent =
        document.getElementById("xp-size").value),
        Ct();
    }),
  );
  var bn = (e) => {
    (pn = e),
      document
        .getElementById("xp-mode-pos")
        .classList.toggle("on", e === "placement"),
      document
        .getElementById("xp-mode-size")
        .classList.toggle("on", e === "size"),
      document
        .getElementById("xp-sizeopts")
        .classList.toggle("show", e === "size"),
      Ct();
  };
  document
    .getElementById("xp-mode-pos")
    .addEventListener("click", () => bn("placement"));
  document
    .getElementById("xp-mode-size")
    .addEventListener("click", () => bn("size"));
  zt();
})();
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
