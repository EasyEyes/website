"use strict";
(() => {
  var Pe = Object.create;
  var se = Object.defineProperty;
  var Te = Object.getOwnPropertyDescriptor;
  var Ie = Object.getOwnPropertyNames;
  var Oe = Object.getPrototypeOf,
    Be = Object.prototype.hasOwnProperty;
  var Mt = ((t) =>
    typeof require < "u"
      ? require
      : typeof Proxy < "u"
      ? new Proxy(t, { get: (h, l) => (typeof require < "u" ? require : h)[l] })
      : t)(function (t) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + t + '" is not supported');
  });
  var Le = (t, h) => () => (
    h || t((h = { exports: {} }).exports, h), h.exports
  );
  var Ne = (t, h, l, i) => {
    if ((h && typeof h == "object") || typeof h == "function")
      for (let s of Ie(h))
        !Be.call(t, s) &&
          s !== l &&
          se(t, s, {
            get: () => h[s],
            enumerable: !(i = Te(h, s)) || i.enumerable,
          });
    return t;
  };
  var Me = (t, h, l) => (
    (l = t != null ? Pe(Oe(t)) : {}),
    Ne(
      h || !t || !t.__esModule
        ? se(l, "default", { value: t, enumerable: !0 })
        : l,
      t,
    )
  );
  var ae = Le((ie, Gt) => {
    (function (t) {
      typeof ie == "object" && typeof Gt < "u"
        ? (Gt.exports = t())
        : typeof define == "function" && define.amd
        ? define([], t)
        : ((typeof window < "u"
            ? window
            : typeof global < "u"
            ? global
            : typeof self < "u"
            ? self
            : this
          ).JSZip = t());
    })(function () {
      return (function t(h, l, i) {
        function s(b, g) {
          if (!l[b]) {
            if (!h[b]) {
              var u = typeof Mt == "function" && Mt;
              if (!g && u) return u(b, !0);
              if (a) return a(b, !0);
              var v = new Error("Cannot find module '" + b + "'");
              throw ((v.code = "MODULE_NOT_FOUND"), v);
            }
            var c = (l[b] = { exports: {} });
            h[b][0].call(
              c.exports,
              function (m) {
                var r = h[b][1][m];
                return s(r || m);
              },
              c,
              c.exports,
              t,
              h,
              l,
              i,
            );
          }
          return l[b].exports;
        }
        for (var a = typeof Mt == "function" && Mt, o = 0; o < i.length; o++)
          s(i[o]);
        return s;
      })(
        {
          1: [
            function (t, h, l) {
              "use strict";
              var i = t("./utils"),
                s = t("./support"),
                a =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              (l.encode = function (o) {
                for (
                  var b,
                    g,
                    u,
                    v,
                    c,
                    m,
                    r,
                    f = [],
                    d = 0,
                    w = o.length,
                    x = w,
                    C = i.getTypeOf(o) !== "string";
                  d < o.length;

                )
                  (x = w - d),
                    (u = C
                      ? ((b = o[d++]),
                        (g = d < w ? o[d++] : 0),
                        d < w ? o[d++] : 0)
                      : ((b = o.charCodeAt(d++)),
                        (g = d < w ? o.charCodeAt(d++) : 0),
                        d < w ? o.charCodeAt(d++) : 0)),
                    (v = b >> 2),
                    (c = ((3 & b) << 4) | (g >> 4)),
                    (m = 1 < x ? ((15 & g) << 2) | (u >> 6) : 64),
                    (r = 2 < x ? 63 & u : 64),
                    f.push(
                      a.charAt(v) + a.charAt(c) + a.charAt(m) + a.charAt(r),
                    );
                return f.join("");
              }),
                (l.decode = function (o) {
                  var b,
                    g,
                    u,
                    v,
                    c,
                    m,
                    r = 0,
                    f = 0,
                    d = "data:";
                  if (o.substr(0, d.length) === d)
                    throw new Error(
                      "Invalid base64 input, it looks like a data url.",
                    );
                  var w,
                    x =
                      (3 * (o = o.replace(/[^A-Za-z0-9+/=]/g, "")).length) / 4;
                  if (
                    (o.charAt(o.length - 1) === a.charAt(64) && x--,
                    o.charAt(o.length - 2) === a.charAt(64) && x--,
                    x % 1 != 0)
                  )
                    throw new Error(
                      "Invalid base64 input, bad content length.",
                    );
                  for (
                    w = s.uint8array ? new Uint8Array(0 | x) : new Array(0 | x);
                    r < o.length;

                  )
                    (b =
                      (a.indexOf(o.charAt(r++)) << 2) |
                      ((v = a.indexOf(o.charAt(r++))) >> 4)),
                      (g =
                        ((15 & v) << 4) |
                        ((c = a.indexOf(o.charAt(r++))) >> 2)),
                      (u = ((3 & c) << 6) | (m = a.indexOf(o.charAt(r++)))),
                      (w[f++] = b),
                      c !== 64 && (w[f++] = g),
                      m !== 64 && (w[f++] = u);
                  return w;
                });
            },
            { "./support": 30, "./utils": 32 },
          ],
          2: [
            function (t, h, l) {
              "use strict";
              var i = t("./external"),
                s = t("./stream/DataWorker"),
                a = t("./stream/Crc32Probe"),
                o = t("./stream/DataLengthProbe");
              function b(g, u, v, c, m) {
                (this.compressedSize = g),
                  (this.uncompressedSize = u),
                  (this.crc32 = v),
                  (this.compression = c),
                  (this.compressedContent = m);
              }
              (b.prototype = {
                getContentWorker: function () {
                  var g = new s(i.Promise.resolve(this.compressedContent))
                      .pipe(this.compression.uncompressWorker())
                      .pipe(new o("data_length")),
                    u = this;
                  return (
                    g.on("end", function () {
                      if (this.streamInfo.data_length !== u.uncompressedSize)
                        throw new Error(
                          "Bug : uncompressed data size mismatch",
                        );
                    }),
                    g
                  );
                },
                getCompressedWorker: function () {
                  return new s(i.Promise.resolve(this.compressedContent))
                    .withStreamInfo("compressedSize", this.compressedSize)
                    .withStreamInfo("uncompressedSize", this.uncompressedSize)
                    .withStreamInfo("crc32", this.crc32)
                    .withStreamInfo("compression", this.compression);
                },
              }),
                (b.createWorkerFrom = function (g, u, v) {
                  return g
                    .pipe(new a())
                    .pipe(new o("uncompressedSize"))
                    .pipe(u.compressWorker(v))
                    .pipe(new o("compressedSize"))
                    .withStreamInfo("compression", u);
                }),
                (h.exports = b);
            },
            {
              "./external": 6,
              "./stream/Crc32Probe": 25,
              "./stream/DataLengthProbe": 26,
              "./stream/DataWorker": 27,
            },
          ],
          3: [
            function (t, h, l) {
              "use strict";
              var i = t("./stream/GenericWorker");
              (l.STORE = {
                magic: "\0\0",
                compressWorker: function () {
                  return new i("STORE compression");
                },
                uncompressWorker: function () {
                  return new i("STORE decompression");
                },
              }),
                (l.DEFLATE = t("./flate"));
            },
            { "./flate": 7, "./stream/GenericWorker": 28 },
          ],
          4: [
            function (t, h, l) {
              "use strict";
              var i = t("./utils"),
                s = (function () {
                  for (var a, o = [], b = 0; b < 256; b++) {
                    a = b;
                    for (var g = 0; g < 8; g++)
                      a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
                    o[b] = a;
                  }
                  return o;
                })();
              h.exports = function (a, o) {
                return a !== void 0 && a.length
                  ? i.getTypeOf(a) !== "string"
                    ? (function (b, g, u, v) {
                        var c = s,
                          m = v + u;
                        b ^= -1;
                        for (var r = v; r < m; r++)
                          b = (b >>> 8) ^ c[255 & (b ^ g[r])];
                        return -1 ^ b;
                      })(0 | o, a, a.length, 0)
                    : (function (b, g, u, v) {
                        var c = s,
                          m = v + u;
                        b ^= -1;
                        for (var r = v; r < m; r++)
                          b = (b >>> 8) ^ c[255 & (b ^ g.charCodeAt(r))];
                        return -1 ^ b;
                      })(0 | o, a, a.length, 0)
                  : 0;
              };
            },
            { "./utils": 32 },
          ],
          5: [
            function (t, h, l) {
              "use strict";
              (l.base64 = !1),
                (l.binary = !1),
                (l.dir = !1),
                (l.createFolders = !0),
                (l.date = null),
                (l.compression = null),
                (l.compressionOptions = null),
                (l.comment = null),
                (l.unixPermissions = null),
                (l.dosPermissions = null);
            },
            {},
          ],
          6: [
            function (t, h, l) {
              "use strict";
              var i = null;
              (i = typeof Promise < "u" ? Promise : t("lie")),
                (h.exports = { Promise: i });
            },
            { lie: 37 },
          ],
          7: [
            function (t, h, l) {
              "use strict";
              var i =
                  typeof Uint8Array < "u" &&
                  typeof Uint16Array < "u" &&
                  typeof Uint32Array < "u",
                s = t("pako"),
                a = t("./utils"),
                o = t("./stream/GenericWorker"),
                b = i ? "uint8array" : "array";
              function g(u, v) {
                o.call(this, "FlateWorker/" + u),
                  (this._pako = null),
                  (this._pakoAction = u),
                  (this._pakoOptions = v),
                  (this.meta = {});
              }
              (l.magic = "\b\0"),
                a.inherits(g, o),
                (g.prototype.processChunk = function (u) {
                  (this.meta = u.meta),
                    this._pako === null && this._createPako(),
                    this._pako.push(a.transformTo(b, u.data), !1);
                }),
                (g.prototype.flush = function () {
                  o.prototype.flush.call(this),
                    this._pako === null && this._createPako(),
                    this._pako.push([], !0);
                }),
                (g.prototype.cleanUp = function () {
                  o.prototype.cleanUp.call(this), (this._pako = null);
                }),
                (g.prototype._createPako = function () {
                  this._pako = new s[this._pakoAction]({
                    raw: !0,
                    level: this._pakoOptions.level || -1,
                  });
                  var u = this;
                  this._pako.onData = function (v) {
                    u.push({ data: v, meta: u.meta });
                  };
                }),
                (l.compressWorker = function (u) {
                  return new g("Deflate", u);
                }),
                (l.uncompressWorker = function () {
                  return new g("Inflate", {});
                });
            },
            { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 },
          ],
          8: [
            function (t, h, l) {
              "use strict";
              function i(c, m) {
                var r,
                  f = "";
                for (r = 0; r < m; r++)
                  (f += String.fromCharCode(255 & c)), (c >>>= 8);
                return f;
              }
              function s(c, m, r, f, d, w) {
                var x,
                  C,
                  k = c.file,
                  P = c.compression,
                  T = w !== b.utf8encode,
                  U = a.transformTo("string", w(k.name)),
                  D = a.transformTo("string", b.utf8encode(k.name)),
                  I = k.comment,
                  N = a.transformTo("string", w(I)),
                  y = a.transformTo("string", b.utf8encode(I)),
                  S = D.length !== k.name.length,
                  n = y.length !== I.length,
                  A = "",
                  G = "",
                  B = "",
                  J = k.dir,
                  X = k.date,
                  K = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                (m && !r) ||
                  ((K.crc32 = c.crc32),
                  (K.compressedSize = c.compressedSize),
                  (K.uncompressedSize = c.uncompressedSize));
                var F = 0;
                m && (F |= 8), T || (!S && !n) || (F |= 2048);
                var $ = 0,
                  V = 0;
                J && ($ |= 16),
                  d === "UNIX"
                    ? ((V = 798),
                      ($ |= (function (j, it) {
                        var dt = j;
                        return (
                          j || (dt = it ? 16893 : 33204), (65535 & dt) << 16
                        );
                      })(k.unixPermissions, J)))
                    : ((V = 20),
                      ($ |= (function (j) {
                        return 63 & (j || 0);
                      })(k.dosPermissions))),
                  (x = X.getUTCHours()),
                  (x <<= 6),
                  (x |= X.getUTCMinutes()),
                  (x <<= 5),
                  (x |= X.getUTCSeconds() / 2),
                  (C = X.getUTCFullYear() - 1980),
                  (C <<= 4),
                  (C |= X.getUTCMonth() + 1),
                  (C <<= 5),
                  (C |= X.getUTCDate()),
                  S &&
                    ((G = i(1, 1) + i(g(U), 4) + D),
                    (A += "up" + i(G.length, 2) + G)),
                  n &&
                    ((B = i(1, 1) + i(g(N), 4) + y),
                    (A += "uc" + i(B.length, 2) + B));
                var H = "";
                return (
                  (H += `
\0`),
                  (H += i(F, 2)),
                  (H += P.magic),
                  (H += i(x, 2)),
                  (H += i(C, 2)),
                  (H += i(K.crc32, 4)),
                  (H += i(K.compressedSize, 4)),
                  (H += i(K.uncompressedSize, 4)),
                  (H += i(U.length, 2)),
                  (H += i(A.length, 2)),
                  {
                    fileRecord: u.LOCAL_FILE_HEADER + H + U + A,
                    dirRecord:
                      u.CENTRAL_FILE_HEADER +
                      i(V, 2) +
                      H +
                      i(N.length, 2) +
                      "\0\0\0\0" +
                      i($, 4) +
                      i(f, 4) +
                      U +
                      A +
                      N,
                  }
                );
              }
              var a = t("../utils"),
                o = t("../stream/GenericWorker"),
                b = t("../utf8"),
                g = t("../crc32"),
                u = t("../signature");
              function v(c, m, r, f) {
                o.call(this, "ZipFileWorker"),
                  (this.bytesWritten = 0),
                  (this.zipComment = m),
                  (this.zipPlatform = r),
                  (this.encodeFileName = f),
                  (this.streamFiles = c),
                  (this.accumulate = !1),
                  (this.contentBuffer = []),
                  (this.dirRecords = []),
                  (this.currentSourceOffset = 0),
                  (this.entriesCount = 0),
                  (this.currentFile = null),
                  (this._sources = []);
              }
              a.inherits(v, o),
                (v.prototype.push = function (c) {
                  var m = c.meta.percent || 0,
                    r = this.entriesCount,
                    f = this._sources.length;
                  this.accumulate
                    ? this.contentBuffer.push(c)
                    : ((this.bytesWritten += c.data.length),
                      o.prototype.push.call(this, {
                        data: c.data,
                        meta: {
                          currentFile: this.currentFile,
                          percent: r ? (m + 100 * (r - f - 1)) / r : 100,
                        },
                      }));
                }),
                (v.prototype.openedSource = function (c) {
                  (this.currentSourceOffset = this.bytesWritten),
                    (this.currentFile = c.file.name);
                  var m = this.streamFiles && !c.file.dir;
                  if (m) {
                    var r = s(
                      c,
                      m,
                      !1,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                    this.push({ data: r.fileRecord, meta: { percent: 0 } });
                  } else this.accumulate = !0;
                }),
                (v.prototype.closedSource = function (c) {
                  this.accumulate = !1;
                  var m = this.streamFiles && !c.file.dir,
                    r = s(
                      c,
                      m,
                      !0,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                  if ((this.dirRecords.push(r.dirRecord), m))
                    this.push({
                      data: (function (f) {
                        return (
                          u.DATA_DESCRIPTOR +
                          i(f.crc32, 4) +
                          i(f.compressedSize, 4) +
                          i(f.uncompressedSize, 4)
                        );
                      })(c),
                      meta: { percent: 100 },
                    });
                  else
                    for (
                      this.push({ data: r.fileRecord, meta: { percent: 0 } });
                      this.contentBuffer.length;

                    )
                      this.push(this.contentBuffer.shift());
                  this.currentFile = null;
                }),
                (v.prototype.flush = function () {
                  for (
                    var c = this.bytesWritten, m = 0;
                    m < this.dirRecords.length;
                    m++
                  )
                    this.push({
                      data: this.dirRecords[m],
                      meta: { percent: 100 },
                    });
                  var r = this.bytesWritten - c,
                    f = (function (d, w, x, C, k) {
                      var P = a.transformTo("string", k(C));
                      return (
                        u.CENTRAL_DIRECTORY_END +
                        "\0\0\0\0" +
                        i(d, 2) +
                        i(d, 2) +
                        i(w, 4) +
                        i(x, 4) +
                        i(P.length, 2) +
                        P
                      );
                    })(
                      this.dirRecords.length,
                      r,
                      c,
                      this.zipComment,
                      this.encodeFileName,
                    );
                  this.push({ data: f, meta: { percent: 100 } });
                }),
                (v.prototype.prepareNextSource = function () {
                  (this.previous = this._sources.shift()),
                    this.openedSource(this.previous.streamInfo),
                    this.isPaused
                      ? this.previous.pause()
                      : this.previous.resume();
                }),
                (v.prototype.registerPrevious = function (c) {
                  this._sources.push(c);
                  var m = this;
                  return (
                    c.on("data", function (r) {
                      m.processChunk(r);
                    }),
                    c.on("end", function () {
                      m.closedSource(m.previous.streamInfo),
                        m._sources.length ? m.prepareNextSource() : m.end();
                    }),
                    c.on("error", function (r) {
                      m.error(r);
                    }),
                    this
                  );
                }),
                (v.prototype.resume = function () {
                  return (
                    !!o.prototype.resume.call(this) &&
                    (!this.previous && this._sources.length
                      ? (this.prepareNextSource(), !0)
                      : this.previous ||
                        this._sources.length ||
                        this.generatedError
                      ? void 0
                      : (this.end(), !0))
                  );
                }),
                (v.prototype.error = function (c) {
                  var m = this._sources;
                  if (!o.prototype.error.call(this, c)) return !1;
                  for (var r = 0; r < m.length; r++)
                    try {
                      m[r].error(c);
                    } catch {}
                  return !0;
                }),
                (v.prototype.lock = function () {
                  o.prototype.lock.call(this);
                  for (var c = this._sources, m = 0; m < c.length; m++)
                    c[m].lock();
                }),
                (h.exports = v);
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
            function (t, h, l) {
              "use strict";
              var i = t("../compressions"),
                s = t("./ZipFileWorker");
              l.generateWorker = function (a, o, b) {
                var g = new s(o.streamFiles, b, o.platform, o.encodeFileName),
                  u = 0;
                try {
                  a.forEach(function (v, c) {
                    u++;
                    var m = (function (w, x) {
                        var C = w || x,
                          k = i[C];
                        if (!k)
                          throw new Error(
                            C + " is not a valid compression method !",
                          );
                        return k;
                      })(c.options.compression, o.compression),
                      r =
                        c.options.compressionOptions ||
                        o.compressionOptions ||
                        {},
                      f = c.dir,
                      d = c.date;
                    c._compressWorker(m, r)
                      .withStreamInfo("file", {
                        name: v,
                        dir: f,
                        date: d,
                        comment: c.comment || "",
                        unixPermissions: c.unixPermissions,
                        dosPermissions: c.dosPermissions,
                      })
                      .pipe(g);
                  }),
                    (g.entriesCount = u);
                } catch (v) {
                  g.error(v);
                }
                return g;
              };
            },
            { "../compressions": 3, "./ZipFileWorker": 8 },
          ],
          10: [
            function (t, h, l) {
              "use strict";
              function i() {
                if (!(this instanceof i)) return new i();
                if (arguments.length)
                  throw new Error(
                    "The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                (this.files = Object.create(null)),
                  (this.comment = null),
                  (this.root = ""),
                  (this.clone = function () {
                    var s = new i();
                    for (var a in this)
                      typeof this[a] != "function" && (s[a] = this[a]);
                    return s;
                  });
              }
              ((i.prototype = t("./object")).loadAsync = t("./load")),
                (i.support = t("./support")),
                (i.defaults = t("./defaults")),
                (i.version = "3.10.1"),
                (i.loadAsync = function (s, a) {
                  return new i().loadAsync(s, a);
                }),
                (i.external = t("./external")),
                (h.exports = i);
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
            function (t, h, l) {
              "use strict";
              var i = t("./utils"),
                s = t("./external"),
                a = t("./utf8"),
                o = t("./zipEntries"),
                b = t("./stream/Crc32Probe"),
                g = t("./nodejsUtils");
              function u(v) {
                return new s.Promise(function (c, m) {
                  var r = v.decompressed.getContentWorker().pipe(new b());
                  r.on("error", function (f) {
                    m(f);
                  })
                    .on("end", function () {
                      r.streamInfo.crc32 !== v.decompressed.crc32
                        ? m(new Error("Corrupted zip : CRC32 mismatch"))
                        : c();
                    })
                    .resume();
                });
              }
              h.exports = function (v, c) {
                var m = this;
                return (
                  (c = i.extend(c || {}, {
                    base64: !1,
                    checkCRC32: !1,
                    optimizedBinaryString: !1,
                    createFolders: !1,
                    decodeFileName: a.utf8decode,
                  })),
                  g.isNode && g.isStream(v)
                    ? s.Promise.reject(
                        new Error(
                          "JSZip can't accept a stream when loading a zip file.",
                        ),
                      )
                    : i
                        .prepareContent(
                          "the loaded zip file",
                          v,
                          !0,
                          c.optimizedBinaryString,
                          c.base64,
                        )
                        .then(function (r) {
                          var f = new o(c);
                          return f.load(r), f;
                        })
                        .then(function (r) {
                          var f = [s.Promise.resolve(r)],
                            d = r.files;
                          if (c.checkCRC32)
                            for (var w = 0; w < d.length; w++) f.push(u(d[w]));
                          return s.Promise.all(f);
                        })
                        .then(function (r) {
                          for (
                            var f = r.shift(), d = f.files, w = 0;
                            w < d.length;
                            w++
                          ) {
                            var x = d[w],
                              C = x.fileNameStr,
                              k = i.resolve(x.fileNameStr);
                            m.file(k, x.decompressed, {
                              binary: !0,
                              optimizedBinaryString: !0,
                              date: x.date,
                              dir: x.dir,
                              comment: x.fileCommentStr.length
                                ? x.fileCommentStr
                                : null,
                              unixPermissions: x.unixPermissions,
                              dosPermissions: x.dosPermissions,
                              createFolders: c.createFolders,
                            }),
                              x.dir || (m.file(k).unsafeOriginalName = C);
                          }
                          return (
                            f.zipComment.length && (m.comment = f.zipComment), m
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
            function (t, h, l) {
              "use strict";
              var i = t("../utils"),
                s = t("../stream/GenericWorker");
              function a(o, b) {
                s.call(this, "Nodejs stream input adapter for " + o),
                  (this._upstreamEnded = !1),
                  this._bindStream(b);
              }
              i.inherits(a, s),
                (a.prototype._bindStream = function (o) {
                  var b = this;
                  (this._stream = o).pause(),
                    o
                      .on("data", function (g) {
                        b.push({ data: g, meta: { percent: 0 } });
                      })
                      .on("error", function (g) {
                        b.isPaused ? (this.generatedError = g) : b.error(g);
                      })
                      .on("end", function () {
                        b.isPaused ? (b._upstreamEnded = !0) : b.end();
                      });
                }),
                (a.prototype.pause = function () {
                  return (
                    !!s.prototype.pause.call(this) && (this._stream.pause(), !0)
                  );
                }),
                (a.prototype.resume = function () {
                  return (
                    !!s.prototype.resume.call(this) &&
                    (this._upstreamEnded ? this.end() : this._stream.resume(),
                    !0)
                  );
                }),
                (h.exports = a);
            },
            { "../stream/GenericWorker": 28, "../utils": 32 },
          ],
          13: [
            function (t, h, l) {
              "use strict";
              var i = t("readable-stream").Readable;
              function s(a, o, b) {
                i.call(this, o), (this._helper = a);
                var g = this;
                a.on("data", function (u, v) {
                  g.push(u) || g._helper.pause(), b && b(v);
                })
                  .on("error", function (u) {
                    g.emit("error", u);
                  })
                  .on("end", function () {
                    g.push(null);
                  });
              }
              t("../utils").inherits(s, i),
                (s.prototype._read = function () {
                  this._helper.resume();
                }),
                (h.exports = s);
            },
            { "../utils": 32, "readable-stream": 16 },
          ],
          14: [
            function (t, h, l) {
              "use strict";
              h.exports = {
                isNode: typeof Buffer < "u",
                newBufferFrom: function (i, s) {
                  if (Buffer.from && Buffer.from !== Uint8Array.from)
                    return Buffer.from(i, s);
                  if (typeof i == "number")
                    throw new Error('The "data" argument must not be a number');
                  return new Buffer(i, s);
                },
                allocBuffer: function (i) {
                  if (Buffer.alloc) return Buffer.alloc(i);
                  var s = new Buffer(i);
                  return s.fill(0), s;
                },
                isBuffer: function (i) {
                  return Buffer.isBuffer(i);
                },
                isStream: function (i) {
                  return (
                    i &&
                    typeof i.on == "function" &&
                    typeof i.pause == "function" &&
                    typeof i.resume == "function"
                  );
                },
              };
            },
            {},
          ],
          15: [
            function (t, h, l) {
              "use strict";
              function i(k, P, T) {
                var U,
                  D = a.getTypeOf(P),
                  I = a.extend(T || {}, g);
                (I.date = I.date || new Date()),
                  I.compression !== null &&
                    (I.compression = I.compression.toUpperCase()),
                  typeof I.unixPermissions == "string" &&
                    (I.unixPermissions = parseInt(I.unixPermissions, 8)),
                  I.unixPermissions &&
                    16384 & I.unixPermissions &&
                    (I.dir = !0),
                  I.dosPermissions && 16 & I.dosPermissions && (I.dir = !0),
                  I.dir && (k = d(k)),
                  I.createFolders && (U = f(k)) && w.call(this, U, !0);
                var N = D === "string" && I.binary === !1 && I.base64 === !1;
                (T && T.binary !== void 0) || (I.binary = !N),
                  ((P instanceof u && P.uncompressedSize === 0) ||
                    I.dir ||
                    !P ||
                    P.length === 0) &&
                    ((I.base64 = !1),
                    (I.binary = !0),
                    (P = ""),
                    (I.compression = "STORE"),
                    (D = "string"));
                var y = null;
                y =
                  P instanceof u || P instanceof o
                    ? P
                    : m.isNode && m.isStream(P)
                    ? new r(k, P)
                    : a.prepareContent(
                        k,
                        P,
                        I.binary,
                        I.optimizedBinaryString,
                        I.base64,
                      );
                var S = new v(k, y, I);
                this.files[k] = S;
              }
              var s = t("./utf8"),
                a = t("./utils"),
                o = t("./stream/GenericWorker"),
                b = t("./stream/StreamHelper"),
                g = t("./defaults"),
                u = t("./compressedObject"),
                v = t("./zipObject"),
                c = t("./generate"),
                m = t("./nodejsUtils"),
                r = t("./nodejs/NodejsStreamInputAdapter"),
                f = function (k) {
                  k.slice(-1) === "/" && (k = k.substring(0, k.length - 1));
                  var P = k.lastIndexOf("/");
                  return 0 < P ? k.substring(0, P) : "";
                },
                d = function (k) {
                  return k.slice(-1) !== "/" && (k += "/"), k;
                },
                w = function (k, P) {
                  return (
                    (P = P !== void 0 ? P : g.createFolders),
                    (k = d(k)),
                    this.files[k] ||
                      i.call(this, k, null, { dir: !0, createFolders: P }),
                    this.files[k]
                  );
                };
              function x(k) {
                return Object.prototype.toString.call(k) === "[object RegExp]";
              }
              var C = {
                load: function () {
                  throw new Error(
                    "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                },
                forEach: function (k) {
                  var P, T, U;
                  for (P in this.files)
                    (U = this.files[P]),
                      (T = P.slice(this.root.length, P.length)) &&
                        P.slice(0, this.root.length) === this.root &&
                        k(T, U);
                },
                filter: function (k) {
                  var P = [];
                  return (
                    this.forEach(function (T, U) {
                      k(T, U) && P.push(U);
                    }),
                    P
                  );
                },
                file: function (k, P, T) {
                  if (arguments.length !== 1)
                    return (k = this.root + k), i.call(this, k, P, T), this;
                  if (x(k)) {
                    var U = k;
                    return this.filter(function (I, N) {
                      return !N.dir && U.test(I);
                    });
                  }
                  var D = this.files[this.root + k];
                  return D && !D.dir ? D : null;
                },
                folder: function (k) {
                  if (!k) return this;
                  if (x(k))
                    return this.filter(function (D, I) {
                      return I.dir && k.test(D);
                    });
                  var P = this.root + k,
                    T = w.call(this, P),
                    U = this.clone();
                  return (U.root = T.name), U;
                },
                remove: function (k) {
                  k = this.root + k;
                  var P = this.files[k];
                  if (
                    (P ||
                      (k.slice(-1) !== "/" && (k += "/"), (P = this.files[k])),
                    P && !P.dir)
                  )
                    delete this.files[k];
                  else
                    for (
                      var T = this.filter(function (D, I) {
                          return I.name.slice(0, k.length) === k;
                        }),
                        U = 0;
                      U < T.length;
                      U++
                    )
                      delete this.files[T[U].name];
                  return this;
                },
                generate: function () {
                  throw new Error(
                    "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                },
                generateInternalStream: function (k) {
                  var P,
                    T = {};
                  try {
                    if (
                      (((T = a.extend(k || {}, {
                        streamFiles: !1,
                        compression: "STORE",
                        compressionOptions: null,
                        type: "",
                        platform: "DOS",
                        comment: null,
                        mimeType: "application/zip",
                        encodeFileName: s.utf8encode,
                      })).type = T.type.toLowerCase()),
                      (T.compression = T.compression.toUpperCase()),
                      T.type === "binarystring" && (T.type = "string"),
                      !T.type)
                    )
                      throw new Error("No output type specified.");
                    a.checkSupport(T.type),
                      (T.platform !== "darwin" &&
                        T.platform !== "freebsd" &&
                        T.platform !== "linux" &&
                        T.platform !== "sunos") ||
                        (T.platform = "UNIX"),
                      T.platform === "win32" && (T.platform = "DOS");
                    var U = T.comment || this.comment || "";
                    P = c.generateWorker(this, T, U);
                  } catch (D) {
                    (P = new o("error")).error(D);
                  }
                  return new b(P, T.type || "string", T.mimeType);
                },
                generateAsync: function (k, P) {
                  return this.generateInternalStream(k).accumulate(P);
                },
                generateNodeStream: function (k, P) {
                  return (
                    (k = k || {}).type || (k.type = "nodebuffer"),
                    this.generateInternalStream(k).toNodejsStream(P)
                  );
                },
              };
              h.exports = C;
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
            function (t, h, l) {
              "use strict";
              h.exports = t("stream");
            },
            { stream: void 0 },
          ],
          17: [
            function (t, h, l) {
              "use strict";
              var i = t("./DataReader");
              function s(a) {
                i.call(this, a);
                for (var o = 0; o < this.data.length; o++) a[o] = 255 & a[o];
              }
              t("../utils").inherits(s, i),
                (s.prototype.byteAt = function (a) {
                  return this.data[this.zero + a];
                }),
                (s.prototype.lastIndexOfSignature = function (a) {
                  for (
                    var o = a.charCodeAt(0),
                      b = a.charCodeAt(1),
                      g = a.charCodeAt(2),
                      u = a.charCodeAt(3),
                      v = this.length - 4;
                    0 <= v;
                    --v
                  )
                    if (
                      this.data[v] === o &&
                      this.data[v + 1] === b &&
                      this.data[v + 2] === g &&
                      this.data[v + 3] === u
                    )
                      return v - this.zero;
                  return -1;
                }),
                (s.prototype.readAndCheckSignature = function (a) {
                  var o = a.charCodeAt(0),
                    b = a.charCodeAt(1),
                    g = a.charCodeAt(2),
                    u = a.charCodeAt(3),
                    v = this.readData(4);
                  return o === v[0] && b === v[1] && g === v[2] && u === v[3];
                }),
                (s.prototype.readData = function (a) {
                  if ((this.checkOffset(a), a === 0)) return [];
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (h.exports = s);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          18: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils");
              function s(a) {
                (this.data = a),
                  (this.length = a.length),
                  (this.index = 0),
                  (this.zero = 0);
              }
              (s.prototype = {
                checkOffset: function (a) {
                  this.checkIndex(this.index + a);
                },
                checkIndex: function (a) {
                  if (this.length < this.zero + a || a < 0)
                    throw new Error(
                      "End of data reached (data length = " +
                        this.length +
                        ", asked index = " +
                        a +
                        "). Corrupted zip ?",
                    );
                },
                setIndex: function (a) {
                  this.checkIndex(a), (this.index = a);
                },
                skip: function (a) {
                  this.setIndex(this.index + a);
                },
                byteAt: function () {},
                readInt: function (a) {
                  var o,
                    b = 0;
                  for (
                    this.checkOffset(a), o = this.index + a - 1;
                    o >= this.index;
                    o--
                  )
                    b = (b << 8) + this.byteAt(o);
                  return (this.index += a), b;
                },
                readString: function (a) {
                  return i.transformTo("string", this.readData(a));
                },
                readData: function () {},
                lastIndexOfSignature: function () {},
                readAndCheckSignature: function () {},
                readDate: function () {
                  var a = this.readInt(4);
                  return new Date(
                    Date.UTC(
                      1980 + ((a >> 25) & 127),
                      ((a >> 21) & 15) - 1,
                      (a >> 16) & 31,
                      (a >> 11) & 31,
                      (a >> 5) & 63,
                      (31 & a) << 1,
                    ),
                  );
                },
              }),
                (h.exports = s);
            },
            { "../utils": 32 },
          ],
          19: [
            function (t, h, l) {
              "use strict";
              var i = t("./Uint8ArrayReader");
              function s(a) {
                i.call(this, a);
              }
              t("../utils").inherits(s, i),
                (s.prototype.readData = function (a) {
                  this.checkOffset(a);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (h.exports = s);
            },
            { "../utils": 32, "./Uint8ArrayReader": 21 },
          ],
          20: [
            function (t, h, l) {
              "use strict";
              var i = t("./DataReader");
              function s(a) {
                i.call(this, a);
              }
              t("../utils").inherits(s, i),
                (s.prototype.byteAt = function (a) {
                  return this.data.charCodeAt(this.zero + a);
                }),
                (s.prototype.lastIndexOfSignature = function (a) {
                  return this.data.lastIndexOf(a) - this.zero;
                }),
                (s.prototype.readAndCheckSignature = function (a) {
                  return a === this.readData(4);
                }),
                (s.prototype.readData = function (a) {
                  this.checkOffset(a);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (h.exports = s);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          21: [
            function (t, h, l) {
              "use strict";
              var i = t("./ArrayReader");
              function s(a) {
                i.call(this, a);
              }
              t("../utils").inherits(s, i),
                (s.prototype.readData = function (a) {
                  if ((this.checkOffset(a), a === 0)) return new Uint8Array(0);
                  var o = this.data.subarray(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (h.exports = s);
            },
            { "../utils": 32, "./ArrayReader": 17 },
          ],
          22: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils"),
                s = t("../support"),
                a = t("./ArrayReader"),
                o = t("./StringReader"),
                b = t("./NodeBufferReader"),
                g = t("./Uint8ArrayReader");
              h.exports = function (u) {
                var v = i.getTypeOf(u);
                return (
                  i.checkSupport(v),
                  v !== "string" || s.uint8array
                    ? v === "nodebuffer"
                      ? new b(u)
                      : s.uint8array
                      ? new g(i.transformTo("uint8array", u))
                      : new a(i.transformTo("array", u))
                    : new o(u)
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
            function (t, h, l) {
              "use strict";
              (l.LOCAL_FILE_HEADER = "PK"),
                (l.CENTRAL_FILE_HEADER = "PK"),
                (l.CENTRAL_DIRECTORY_END = "PK"),
                (l.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07"),
                (l.ZIP64_CENTRAL_DIRECTORY_END = "PK"),
                (l.DATA_DESCRIPTOR = "PK\x07\b");
            },
            {},
          ],
          24: [
            function (t, h, l) {
              "use strict";
              var i = t("./GenericWorker"),
                s = t("../utils");
              function a(o) {
                i.call(this, "ConvertWorker to " + o), (this.destType = o);
              }
              s.inherits(a, i),
                (a.prototype.processChunk = function (o) {
                  this.push({
                    data: s.transformTo(this.destType, o.data),
                    meta: o.meta,
                  });
                }),
                (h.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          25: [
            function (t, h, l) {
              "use strict";
              var i = t("./GenericWorker"),
                s = t("../crc32");
              function a() {
                i.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              t("../utils").inherits(a, i),
                (a.prototype.processChunk = function (o) {
                  (this.streamInfo.crc32 = s(
                    o.data,
                    this.streamInfo.crc32 || 0,
                  )),
                    this.push(o);
                }),
                (h.exports = a);
            },
            { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 },
          ],
          26: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils"),
                s = t("./GenericWorker");
              function a(o) {
                s.call(this, "DataLengthProbe for " + o),
                  (this.propName = o),
                  this.withStreamInfo(o, 0);
              }
              i.inherits(a, s),
                (a.prototype.processChunk = function (o) {
                  if (o) {
                    var b = this.streamInfo[this.propName] || 0;
                    this.streamInfo[this.propName] = b + o.data.length;
                  }
                  s.prototype.processChunk.call(this, o);
                }),
                (h.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          27: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils"),
                s = t("./GenericWorker");
              function a(o) {
                s.call(this, "DataWorker");
                var b = this;
                (this.dataIsReady = !1),
                  (this.index = 0),
                  (this.max = 0),
                  (this.data = null),
                  (this.type = ""),
                  (this._tickScheduled = !1),
                  o.then(
                    function (g) {
                      (b.dataIsReady = !0),
                        (b.data = g),
                        (b.max = (g && g.length) || 0),
                        (b.type = i.getTypeOf(g)),
                        b.isPaused || b._tickAndRepeat();
                    },
                    function (g) {
                      b.error(g);
                    },
                  );
              }
              i.inherits(a, s),
                (a.prototype.cleanUp = function () {
                  s.prototype.cleanUp.call(this), (this.data = null);
                }),
                (a.prototype.resume = function () {
                  return (
                    !!s.prototype.resume.call(this) &&
                    (!this._tickScheduled &&
                      this.dataIsReady &&
                      ((this._tickScheduled = !0),
                      i.delay(this._tickAndRepeat, [], this)),
                    !0)
                  );
                }),
                (a.prototype._tickAndRepeat = function () {
                  (this._tickScheduled = !1),
                    this.isPaused ||
                      this.isFinished ||
                      (this._tick(),
                      this.isFinished ||
                        (i.delay(this._tickAndRepeat, [], this),
                        (this._tickScheduled = !0)));
                }),
                (a.prototype._tick = function () {
                  if (this.isPaused || this.isFinished) return !1;
                  var o = null,
                    b = Math.min(this.max, this.index + 16384);
                  if (this.index >= this.max) return this.end();
                  switch (this.type) {
                    case "string":
                      o = this.data.substring(this.index, b);
                      break;
                    case "uint8array":
                      o = this.data.subarray(this.index, b);
                      break;
                    case "array":
                    case "nodebuffer":
                      o = this.data.slice(this.index, b);
                  }
                  return (
                    (this.index = b),
                    this.push({
                      data: o,
                      meta: {
                        percent: this.max ? (this.index / this.max) * 100 : 0,
                      },
                    })
                  );
                }),
                (h.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          28: [
            function (t, h, l) {
              "use strict";
              function i(s) {
                (this.name = s || "default"),
                  (this.streamInfo = {}),
                  (this.generatedError = null),
                  (this.extraStreamInfo = {}),
                  (this.isPaused = !0),
                  (this.isFinished = !1),
                  (this.isLocked = !1),
                  (this._listeners = { data: [], end: [], error: [] }),
                  (this.previous = null);
              }
              (i.prototype = {
                push: function (s) {
                  this.emit("data", s);
                },
                end: function () {
                  if (this.isFinished) return !1;
                  this.flush();
                  try {
                    this.emit("end"), this.cleanUp(), (this.isFinished = !0);
                  } catch (s) {
                    this.emit("error", s);
                  }
                  return !0;
                },
                error: function (s) {
                  return (
                    !this.isFinished &&
                    (this.isPaused
                      ? (this.generatedError = s)
                      : ((this.isFinished = !0),
                        this.emit("error", s),
                        this.previous && this.previous.error(s),
                        this.cleanUp()),
                    !0)
                  );
                },
                on: function (s, a) {
                  return this._listeners[s].push(a), this;
                },
                cleanUp: function () {
                  (this.streamInfo =
                    this.generatedError =
                    this.extraStreamInfo =
                      null),
                    (this._listeners = []);
                },
                emit: function (s, a) {
                  if (this._listeners[s])
                    for (var o = 0; o < this._listeners[s].length; o++)
                      this._listeners[s][o].call(this, a);
                },
                pipe: function (s) {
                  return s.registerPrevious(this);
                },
                registerPrevious: function (s) {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.streamInfo = s.streamInfo),
                    this.mergeStreamInfo(),
                    (this.previous = s);
                  var a = this;
                  return (
                    s.on("data", function (o) {
                      a.processChunk(o);
                    }),
                    s.on("end", function () {
                      a.end();
                    }),
                    s.on("error", function (o) {
                      a.error(o);
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
                  var s = (this.isPaused = !1);
                  return (
                    this.generatedError &&
                      (this.error(this.generatedError), (s = !0)),
                    this.previous && this.previous.resume(),
                    !s
                  );
                },
                flush: function () {},
                processChunk: function (s) {
                  this.push(s);
                },
                withStreamInfo: function (s, a) {
                  return (
                    (this.extraStreamInfo[s] = a), this.mergeStreamInfo(), this
                  );
                },
                mergeStreamInfo: function () {
                  for (var s in this.extraStreamInfo)
                    Object.prototype.hasOwnProperty.call(
                      this.extraStreamInfo,
                      s,
                    ) && (this.streamInfo[s] = this.extraStreamInfo[s]);
                },
                lock: function () {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.isLocked = !0), this.previous && this.previous.lock();
                },
                toString: function () {
                  var s = "Worker " + this.name;
                  return this.previous ? this.previous + " -> " + s : s;
                },
              }),
                (h.exports = i);
            },
            {},
          ],
          29: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils"),
                s = t("./ConvertWorker"),
                a = t("./GenericWorker"),
                o = t("../base64"),
                b = t("../support"),
                g = t("../external"),
                u = null;
              if (b.nodestream)
                try {
                  u = t("../nodejs/NodejsStreamOutputAdapter");
                } catch {}
              function v(m, r) {
                return new g.Promise(function (f, d) {
                  var w = [],
                    x = m._internalType,
                    C = m._outputType,
                    k = m._mimeType;
                  m.on("data", function (P, T) {
                    w.push(P), r && r(T);
                  })
                    .on("error", function (P) {
                      (w = []), d(P);
                    })
                    .on("end", function () {
                      try {
                        var P = (function (T, U, D) {
                          switch (T) {
                            case "blob":
                              return i.newBlob(
                                i.transformTo("arraybuffer", U),
                                D,
                              );
                            case "base64":
                              return o.encode(U);
                            default:
                              return i.transformTo(T, U);
                          }
                        })(
                          C,
                          (function (T, U) {
                            var D,
                              I = 0,
                              N = null,
                              y = 0;
                            for (D = 0; D < U.length; D++) y += U[D].length;
                            switch (T) {
                              case "string":
                                return U.join("");
                              case "array":
                                return Array.prototype.concat.apply([], U);
                              case "uint8array":
                                for (
                                  N = new Uint8Array(y), D = 0;
                                  D < U.length;
                                  D++
                                )
                                  N.set(U[D], I), (I += U[D].length);
                                return N;
                              case "nodebuffer":
                                return Buffer.concat(U);
                              default:
                                throw new Error(
                                  "concat : unsupported type '" + T + "'",
                                );
                            }
                          })(x, w),
                          k,
                        );
                        f(P);
                      } catch (T) {
                        d(T);
                      }
                      w = [];
                    })
                    .resume();
                });
              }
              function c(m, r, f) {
                var d = r;
                switch (r) {
                  case "blob":
                  case "arraybuffer":
                    d = "uint8array";
                    break;
                  case "base64":
                    d = "string";
                }
                try {
                  (this._internalType = d),
                    (this._outputType = r),
                    (this._mimeType = f),
                    i.checkSupport(d),
                    (this._worker = m.pipe(new s(d))),
                    m.lock();
                } catch (w) {
                  (this._worker = new a("error")), this._worker.error(w);
                }
              }
              (c.prototype = {
                accumulate: function (m) {
                  return v(this, m);
                },
                on: function (m, r) {
                  var f = this;
                  return (
                    m === "data"
                      ? this._worker.on(m, function (d) {
                          r.call(f, d.data, d.meta);
                        })
                      : this._worker.on(m, function () {
                          i.delay(r, arguments, f);
                        }),
                    this
                  );
                },
                resume: function () {
                  return i.delay(this._worker.resume, [], this._worker), this;
                },
                pause: function () {
                  return this._worker.pause(), this;
                },
                toNodejsStream: function (m) {
                  if (
                    (i.checkSupport("nodestream"),
                    this._outputType !== "nodebuffer")
                  )
                    throw new Error(
                      this._outputType + " is not supported by this method",
                    );
                  return new u(
                    this,
                    { objectMode: this._outputType !== "nodebuffer" },
                    m,
                  );
                },
              }),
                (h.exports = c);
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
            function (t, h, l) {
              "use strict";
              if (
                ((l.base64 = !0),
                (l.array = !0),
                (l.string = !0),
                (l.arraybuffer =
                  typeof ArrayBuffer < "u" && typeof Uint8Array < "u"),
                (l.nodebuffer = typeof Buffer < "u"),
                (l.uint8array = typeof Uint8Array < "u"),
                typeof ArrayBuffer > "u")
              )
                l.blob = !1;
              else {
                var i = new ArrayBuffer(0);
                try {
                  l.blob =
                    new Blob([i], { type: "application/zip" }).size === 0;
                } catch {
                  try {
                    var s = new (self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder)();
                    s.append(i),
                      (l.blob = s.getBlob("application/zip").size === 0);
                  } catch {
                    l.blob = !1;
                  }
                }
              }
              try {
                l.nodestream = !!t("readable-stream").Readable;
              } catch {
                l.nodestream = !1;
              }
            },
            { "readable-stream": 16 },
          ],
          31: [
            function (t, h, l) {
              "use strict";
              for (
                var i = t("./utils"),
                  s = t("./support"),
                  a = t("./nodejsUtils"),
                  o = t("./stream/GenericWorker"),
                  b = new Array(256),
                  g = 0;
                g < 256;
                g++
              )
                b[g] =
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
              b[254] = b[254] = 1;
              function u() {
                o.call(this, "utf-8 decode"), (this.leftOver = null);
              }
              function v() {
                o.call(this, "utf-8 encode");
              }
              (l.utf8encode = function (c) {
                return s.nodebuffer
                  ? a.newBufferFrom(c, "utf-8")
                  : (function (m) {
                      var r,
                        f,
                        d,
                        w,
                        x,
                        C = m.length,
                        k = 0;
                      for (w = 0; w < C; w++)
                        (64512 & (f = m.charCodeAt(w))) == 55296 &&
                          w + 1 < C &&
                          (64512 & (d = m.charCodeAt(w + 1))) == 56320 &&
                          ((f = 65536 + ((f - 55296) << 10) + (d - 56320)),
                          w++),
                          (k += f < 128 ? 1 : f < 2048 ? 2 : f < 65536 ? 3 : 4);
                      for (
                        r = s.uint8array ? new Uint8Array(k) : new Array(k),
                          w = x = 0;
                        x < k;
                        w++
                      )
                        (64512 & (f = m.charCodeAt(w))) == 55296 &&
                          w + 1 < C &&
                          (64512 & (d = m.charCodeAt(w + 1))) == 56320 &&
                          ((f = 65536 + ((f - 55296) << 10) + (d - 56320)),
                          w++),
                          f < 128
                            ? (r[x++] = f)
                            : (f < 2048
                                ? (r[x++] = 192 | (f >>> 6))
                                : (f < 65536
                                    ? (r[x++] = 224 | (f >>> 12))
                                    : ((r[x++] = 240 | (f >>> 18)),
                                      (r[x++] = 128 | ((f >>> 12) & 63))),
                                  (r[x++] = 128 | ((f >>> 6) & 63))),
                              (r[x++] = 128 | (63 & f)));
                      return r;
                    })(c);
              }),
                (l.utf8decode = function (c) {
                  return s.nodebuffer
                    ? i.transformTo("nodebuffer", c).toString("utf-8")
                    : (function (m) {
                        var r,
                          f,
                          d,
                          w,
                          x = m.length,
                          C = new Array(2 * x);
                        for (r = f = 0; r < x; )
                          if ((d = m[r++]) < 128) C[f++] = d;
                          else if (4 < (w = b[d]))
                            (C[f++] = 65533), (r += w - 1);
                          else {
                            for (
                              d &= w === 2 ? 31 : w === 3 ? 15 : 7;
                              1 < w && r < x;

                            )
                              (d = (d << 6) | (63 & m[r++])), w--;
                            1 < w
                              ? (C[f++] = 65533)
                              : d < 65536
                              ? (C[f++] = d)
                              : ((d -= 65536),
                                (C[f++] = 55296 | ((d >> 10) & 1023)),
                                (C[f++] = 56320 | (1023 & d)));
                          }
                        return (
                          C.length !== f &&
                            (C.subarray
                              ? (C = C.subarray(0, f))
                              : (C.length = f)),
                          i.applyFromCharCode(C)
                        );
                      })(
                        (c = i.transformTo(
                          s.uint8array ? "uint8array" : "array",
                          c,
                        )),
                      );
                }),
                i.inherits(u, o),
                (u.prototype.processChunk = function (c) {
                  var m = i.transformTo(
                    s.uint8array ? "uint8array" : "array",
                    c.data,
                  );
                  if (this.leftOver && this.leftOver.length) {
                    if (s.uint8array) {
                      var r = m;
                      (m = new Uint8Array(r.length + this.leftOver.length)).set(
                        this.leftOver,
                        0,
                      ),
                        m.set(r, this.leftOver.length);
                    } else m = this.leftOver.concat(m);
                    this.leftOver = null;
                  }
                  var f = (function (w, x) {
                      var C;
                      for (
                        (x = x || w.length) > w.length && (x = w.length),
                          C = x - 1;
                        0 <= C && (192 & w[C]) == 128;

                      )
                        C--;
                      return C < 0 || C === 0 ? x : C + b[w[C]] > x ? C : x;
                    })(m),
                    d = m;
                  f !== m.length &&
                    (s.uint8array
                      ? ((d = m.subarray(0, f)),
                        (this.leftOver = m.subarray(f, m.length)))
                      : ((d = m.slice(0, f)),
                        (this.leftOver = m.slice(f, m.length)))),
                    this.push({ data: l.utf8decode(d), meta: c.meta });
                }),
                (u.prototype.flush = function () {
                  this.leftOver &&
                    this.leftOver.length &&
                    (this.push({ data: l.utf8decode(this.leftOver), meta: {} }),
                    (this.leftOver = null));
                }),
                (l.Utf8DecodeWorker = u),
                i.inherits(v, o),
                (v.prototype.processChunk = function (c) {
                  this.push({ data: l.utf8encode(c.data), meta: c.meta });
                }),
                (l.Utf8EncodeWorker = v);
            },
            {
              "./nodejsUtils": 14,
              "./stream/GenericWorker": 28,
              "./support": 30,
              "./utils": 32,
            },
          ],
          32: [
            function (t, h, l) {
              "use strict";
              var i = t("./support"),
                s = t("./base64"),
                a = t("./nodejsUtils"),
                o = t("./external");
              function b(r) {
                return r;
              }
              function g(r, f) {
                for (var d = 0; d < r.length; ++d) f[d] = 255 & r.charCodeAt(d);
                return f;
              }
              t("setimmediate"),
                (l.newBlob = function (r, f) {
                  l.checkSupport("blob");
                  try {
                    return new Blob([r], { type: f });
                  } catch {
                    try {
                      var d = new (self.BlobBuilder ||
                        self.WebKitBlobBuilder ||
                        self.MozBlobBuilder ||
                        self.MSBlobBuilder)();
                      return d.append(r), d.getBlob(f);
                    } catch {
                      throw new Error("Bug : can't construct the Blob.");
                    }
                  }
                });
              var u = {
                stringifyByChunk: function (r, f, d) {
                  var w = [],
                    x = 0,
                    C = r.length;
                  if (C <= d) return String.fromCharCode.apply(null, r);
                  for (; x < C; )
                    f === "array" || f === "nodebuffer"
                      ? w.push(
                          String.fromCharCode.apply(
                            null,
                            r.slice(x, Math.min(x + d, C)),
                          ),
                        )
                      : w.push(
                          String.fromCharCode.apply(
                            null,
                            r.subarray(x, Math.min(x + d, C)),
                          ),
                        ),
                      (x += d);
                  return w.join("");
                },
                stringifyByChar: function (r) {
                  for (var f = "", d = 0; d < r.length; d++)
                    f += String.fromCharCode(r[d]);
                  return f;
                },
                applyCanBeUsed: {
                  uint8array: (function () {
                    try {
                      return (
                        i.uint8array &&
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
                        i.nodebuffer &&
                        String.fromCharCode.apply(null, a.allocBuffer(1))
                          .length === 1
                      );
                    } catch {
                      return !1;
                    }
                  })(),
                },
              };
              function v(r) {
                var f = 65536,
                  d = l.getTypeOf(r),
                  w = !0;
                if (
                  (d === "uint8array"
                    ? (w = u.applyCanBeUsed.uint8array)
                    : d === "nodebuffer" && (w = u.applyCanBeUsed.nodebuffer),
                  w)
                )
                  for (; 1 < f; )
                    try {
                      return u.stringifyByChunk(r, d, f);
                    } catch {
                      f = Math.floor(f / 2);
                    }
                return u.stringifyByChar(r);
              }
              function c(r, f) {
                for (var d = 0; d < r.length; d++) f[d] = r[d];
                return f;
              }
              l.applyFromCharCode = v;
              var m = {};
              (m.string = {
                string: b,
                array: function (r) {
                  return g(r, new Array(r.length));
                },
                arraybuffer: function (r) {
                  return m.string.uint8array(r).buffer;
                },
                uint8array: function (r) {
                  return g(r, new Uint8Array(r.length));
                },
                nodebuffer: function (r) {
                  return g(r, a.allocBuffer(r.length));
                },
              }),
                (m.array = {
                  string: v,
                  array: b,
                  arraybuffer: function (r) {
                    return new Uint8Array(r).buffer;
                  },
                  uint8array: function (r) {
                    return new Uint8Array(r);
                  },
                  nodebuffer: function (r) {
                    return a.newBufferFrom(r);
                  },
                }),
                (m.arraybuffer = {
                  string: function (r) {
                    return v(new Uint8Array(r));
                  },
                  array: function (r) {
                    return c(new Uint8Array(r), new Array(r.byteLength));
                  },
                  arraybuffer: b,
                  uint8array: function (r) {
                    return new Uint8Array(r);
                  },
                  nodebuffer: function (r) {
                    return a.newBufferFrom(new Uint8Array(r));
                  },
                }),
                (m.uint8array = {
                  string: v,
                  array: function (r) {
                    return c(r, new Array(r.length));
                  },
                  arraybuffer: function (r) {
                    return r.buffer;
                  },
                  uint8array: b,
                  nodebuffer: function (r) {
                    return a.newBufferFrom(r);
                  },
                }),
                (m.nodebuffer = {
                  string: v,
                  array: function (r) {
                    return c(r, new Array(r.length));
                  },
                  arraybuffer: function (r) {
                    return m.nodebuffer.uint8array(r).buffer;
                  },
                  uint8array: function (r) {
                    return c(r, new Uint8Array(r.length));
                  },
                  nodebuffer: b,
                }),
                (l.transformTo = function (r, f) {
                  if (((f = f || ""), !r)) return f;
                  l.checkSupport(r);
                  var d = l.getTypeOf(f);
                  return m[d][r](f);
                }),
                (l.resolve = function (r) {
                  for (var f = r.split("/"), d = [], w = 0; w < f.length; w++) {
                    var x = f[w];
                    x === "." ||
                      (x === "" && w !== 0 && w !== f.length - 1) ||
                      (x === ".." ? d.pop() : d.push(x));
                  }
                  return d.join("/");
                }),
                (l.getTypeOf = function (r) {
                  return typeof r == "string"
                    ? "string"
                    : Object.prototype.toString.call(r) === "[object Array]"
                    ? "array"
                    : i.nodebuffer && a.isBuffer(r)
                    ? "nodebuffer"
                    : i.uint8array && r instanceof Uint8Array
                    ? "uint8array"
                    : i.arraybuffer && r instanceof ArrayBuffer
                    ? "arraybuffer"
                    : void 0;
                }),
                (l.checkSupport = function (r) {
                  if (!i[r.toLowerCase()])
                    throw new Error(r + " is not supported by this platform");
                }),
                (l.MAX_VALUE_16BITS = 65535),
                (l.MAX_VALUE_32BITS = -1),
                (l.pretty = function (r) {
                  var f,
                    d,
                    w = "";
                  for (d = 0; d < (r || "").length; d++)
                    w +=
                      "\\x" +
                      ((f = r.charCodeAt(d)) < 16 ? "0" : "") +
                      f.toString(16).toUpperCase();
                  return w;
                }),
                (l.delay = function (r, f, d) {
                  setImmediate(function () {
                    r.apply(d || null, f || []);
                  });
                }),
                (l.inherits = function (r, f) {
                  function d() {}
                  (d.prototype = f.prototype), (r.prototype = new d());
                }),
                (l.extend = function () {
                  var r,
                    f,
                    d = {};
                  for (r = 0; r < arguments.length; r++)
                    for (f in arguments[r])
                      Object.prototype.hasOwnProperty.call(arguments[r], f) &&
                        d[f] === void 0 &&
                        (d[f] = arguments[r][f]);
                  return d;
                }),
                (l.prepareContent = function (r, f, d, w, x) {
                  return o.Promise.resolve(f)
                    .then(function (C) {
                      return i.blob &&
                        (C instanceof Blob ||
                          ["[object File]", "[object Blob]"].indexOf(
                            Object.prototype.toString.call(C),
                          ) !== -1) &&
                        typeof FileReader < "u"
                        ? new o.Promise(function (k, P) {
                            var T = new FileReader();
                            (T.onload = function (U) {
                              k(U.target.result);
                            }),
                              (T.onerror = function (U) {
                                P(U.target.error);
                              }),
                              T.readAsArrayBuffer(C);
                          })
                        : C;
                    })
                    .then(function (C) {
                      var k = l.getTypeOf(C);
                      return k
                        ? (k === "arraybuffer"
                            ? (C = l.transformTo("uint8array", C))
                            : k === "string" &&
                              (x
                                ? (C = s.decode(C))
                                : d &&
                                  w !== !0 &&
                                  (C = (function (P) {
                                    return g(
                                      P,
                                      i.uint8array
                                        ? new Uint8Array(P.length)
                                        : new Array(P.length),
                                    );
                                  })(C))),
                          C)
                        : o.Promise.reject(
                            new Error(
                              "Can't read the data of '" +
                                r +
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
            function (t, h, l) {
              "use strict";
              var i = t("./reader/readerFor"),
                s = t("./utils"),
                a = t("./signature"),
                o = t("./zipEntry"),
                b = t("./support");
              function g(u) {
                (this.files = []), (this.loadOptions = u);
              }
              (g.prototype = {
                checkSignature: function (u) {
                  if (!this.reader.readAndCheckSignature(u)) {
                    this.reader.index -= 4;
                    var v = this.reader.readString(4);
                    throw new Error(
                      "Corrupted zip or bug: unexpected signature (" +
                        s.pretty(v) +
                        ", expected " +
                        s.pretty(u) +
                        ")",
                    );
                  }
                },
                isSignature: function (u, v) {
                  var c = this.reader.index;
                  this.reader.setIndex(u);
                  var m = this.reader.readString(4) === v;
                  return this.reader.setIndex(c), m;
                },
                readBlockEndOfCentral: function () {
                  (this.diskNumber = this.reader.readInt(2)),
                    (this.diskWithCentralDirStart = this.reader.readInt(2)),
                    (this.centralDirRecordsOnThisDisk = this.reader.readInt(2)),
                    (this.centralDirRecords = this.reader.readInt(2)),
                    (this.centralDirSize = this.reader.readInt(4)),
                    (this.centralDirOffset = this.reader.readInt(4)),
                    (this.zipCommentLength = this.reader.readInt(2));
                  var u = this.reader.readData(this.zipCommentLength),
                    v = b.uint8array ? "uint8array" : "array",
                    c = s.transformTo(v, u);
                  this.zipComment = this.loadOptions.decodeFileName(c);
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
                    var u, v, c, m = this.zip64EndOfCentralSize - 44;
                    0 < m;

                  )
                    (u = this.reader.readInt(2)),
                      (v = this.reader.readInt(4)),
                      (c = this.reader.readData(v)),
                      (this.zip64ExtensibleData[u] = {
                        id: u,
                        length: v,
                        value: c,
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
                  var u, v;
                  for (u = 0; u < this.files.length; u++)
                    (v = this.files[u]),
                      this.reader.setIndex(v.localHeaderOffset),
                      this.checkSignature(a.LOCAL_FILE_HEADER),
                      v.readLocalPart(this.reader),
                      v.handleUTF8(),
                      v.processAttributes();
                },
                readCentralDir: function () {
                  var u;
                  for (
                    this.reader.setIndex(this.centralDirOffset);
                    this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);

                  )
                    (u = new o(
                      { zip64: this.zip64 },
                      this.loadOptions,
                    )).readCentralPart(this.reader),
                      this.files.push(u);
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
                  var u = this.reader.lastIndexOfSignature(
                    a.CENTRAL_DIRECTORY_END,
                  );
                  if (u < 0)
                    throw this.isSignature(0, a.LOCAL_FILE_HEADER)
                      ? new Error(
                          "Corrupted zip: can't find end of central directory",
                        )
                      : new Error(
                          "Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html",
                        );
                  this.reader.setIndex(u);
                  var v = u;
                  if (
                    (this.checkSignature(a.CENTRAL_DIRECTORY_END),
                    this.readBlockEndOfCentral(),
                    this.diskNumber === s.MAX_VALUE_16BITS ||
                      this.diskWithCentralDirStart === s.MAX_VALUE_16BITS ||
                      this.centralDirRecordsOnThisDisk === s.MAX_VALUE_16BITS ||
                      this.centralDirRecords === s.MAX_VALUE_16BITS ||
                      this.centralDirSize === s.MAX_VALUE_32BITS ||
                      this.centralDirOffset === s.MAX_VALUE_32BITS)
                  ) {
                    if (
                      ((this.zip64 = !0),
                      (u = this.reader.lastIndexOfSignature(
                        a.ZIP64_CENTRAL_DIRECTORY_LOCATOR,
                      )) < 0)
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory locator",
                      );
                    if (
                      (this.reader.setIndex(u),
                      this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR),
                      this.readBlockZip64EndOfCentralLocator(),
                      !this.isSignature(
                        this.relativeOffsetEndOfZip64CentralDir,
                        a.ZIP64_CENTRAL_DIRECTORY_END,
                      ) &&
                        ((this.relativeOffsetEndOfZip64CentralDir =
                          this.reader.lastIndexOfSignature(
                            a.ZIP64_CENTRAL_DIRECTORY_END,
                          )),
                        this.relativeOffsetEndOfZip64CentralDir < 0))
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory",
                      );
                    this.reader.setIndex(
                      this.relativeOffsetEndOfZip64CentralDir,
                    ),
                      this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END),
                      this.readBlockZip64EndOfCentral();
                  }
                  var c = this.centralDirOffset + this.centralDirSize;
                  this.zip64 &&
                    ((c += 20), (c += 12 + this.zip64EndOfCentralSize));
                  var m = v - c;
                  if (0 < m)
                    this.isSignature(v, a.CENTRAL_FILE_HEADER) ||
                      (this.reader.zero = m);
                  else if (m < 0)
                    throw new Error(
                      "Corrupted zip: missing " + Math.abs(m) + " bytes.",
                    );
                },
                prepareReader: function (u) {
                  this.reader = i(u);
                },
                load: function (u) {
                  this.prepareReader(u),
                    this.readEndOfCentral(),
                    this.readCentralDir(),
                    this.readLocalFiles();
                },
              }),
                (h.exports = g);
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
            function (t, h, l) {
              "use strict";
              var i = t("./reader/readerFor"),
                s = t("./utils"),
                a = t("./compressedObject"),
                o = t("./crc32"),
                b = t("./utf8"),
                g = t("./compressions"),
                u = t("./support");
              function v(c, m) {
                (this.options = c), (this.loadOptions = m);
              }
              (v.prototype = {
                isEncrypted: function () {
                  return (1 & this.bitFlag) == 1;
                },
                useUTF8: function () {
                  return (2048 & this.bitFlag) == 2048;
                },
                readLocalPart: function (c) {
                  var m, r;
                  if (
                    (c.skip(22),
                    (this.fileNameLength = c.readInt(2)),
                    (r = c.readInt(2)),
                    (this.fileName = c.readData(this.fileNameLength)),
                    c.skip(r),
                    this.compressedSize === -1 || this.uncompressedSize === -1)
                  )
                    throw new Error(
                      "Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)",
                    );
                  if (
                    (m = (function (f) {
                      for (var d in g)
                        if (
                          Object.prototype.hasOwnProperty.call(g, d) &&
                          g[d].magic === f
                        )
                          return g[d];
                      return null;
                    })(this.compressionMethod)) === null
                  )
                    throw new Error(
                      "Corrupted zip : compression " +
                        s.pretty(this.compressionMethod) +
                        " unknown (inner file : " +
                        s.transformTo("string", this.fileName) +
                        ")",
                    );
                  this.decompressed = new a(
                    this.compressedSize,
                    this.uncompressedSize,
                    this.crc32,
                    m,
                    c.readData(this.compressedSize),
                  );
                },
                readCentralPart: function (c) {
                  (this.versionMadeBy = c.readInt(2)),
                    c.skip(2),
                    (this.bitFlag = c.readInt(2)),
                    (this.compressionMethod = c.readString(2)),
                    (this.date = c.readDate()),
                    (this.crc32 = c.readInt(4)),
                    (this.compressedSize = c.readInt(4)),
                    (this.uncompressedSize = c.readInt(4));
                  var m = c.readInt(2);
                  if (
                    ((this.extraFieldsLength = c.readInt(2)),
                    (this.fileCommentLength = c.readInt(2)),
                    (this.diskNumberStart = c.readInt(2)),
                    (this.internalFileAttributes = c.readInt(2)),
                    (this.externalFileAttributes = c.readInt(4)),
                    (this.localHeaderOffset = c.readInt(4)),
                    this.isEncrypted())
                  )
                    throw new Error("Encrypted zip are not supported");
                  c.skip(m),
                    this.readExtraFields(c),
                    this.parseZIP64ExtraField(c),
                    (this.fileComment = c.readData(this.fileCommentLength));
                },
                processAttributes: function () {
                  (this.unixPermissions = null), (this.dosPermissions = null);
                  var c = this.versionMadeBy >> 8;
                  (this.dir = !!(16 & this.externalFileAttributes)),
                    c == 0 &&
                      (this.dosPermissions = 63 & this.externalFileAttributes),
                    c == 3 &&
                      (this.unixPermissions =
                        (this.externalFileAttributes >> 16) & 65535),
                    this.dir ||
                      this.fileNameStr.slice(-1) !== "/" ||
                      (this.dir = !0);
                },
                parseZIP64ExtraField: function () {
                  if (this.extraFields[1]) {
                    var c = i(this.extraFields[1].value);
                    this.uncompressedSize === s.MAX_VALUE_32BITS &&
                      (this.uncompressedSize = c.readInt(8)),
                      this.compressedSize === s.MAX_VALUE_32BITS &&
                        (this.compressedSize = c.readInt(8)),
                      this.localHeaderOffset === s.MAX_VALUE_32BITS &&
                        (this.localHeaderOffset = c.readInt(8)),
                      this.diskNumberStart === s.MAX_VALUE_32BITS &&
                        (this.diskNumberStart = c.readInt(4));
                  }
                },
                readExtraFields: function (c) {
                  var m,
                    r,
                    f,
                    d = c.index + this.extraFieldsLength;
                  for (
                    this.extraFields || (this.extraFields = {});
                    c.index + 4 < d;

                  )
                    (m = c.readInt(2)),
                      (r = c.readInt(2)),
                      (f = c.readData(r)),
                      (this.extraFields[m] = { id: m, length: r, value: f });
                  c.setIndex(d);
                },
                handleUTF8: function () {
                  var c = u.uint8array ? "uint8array" : "array";
                  if (this.useUTF8())
                    (this.fileNameStr = b.utf8decode(this.fileName)),
                      (this.fileCommentStr = b.utf8decode(this.fileComment));
                  else {
                    var m = this.findExtraFieldUnicodePath();
                    if (m !== null) this.fileNameStr = m;
                    else {
                      var r = s.transformTo(c, this.fileName);
                      this.fileNameStr = this.loadOptions.decodeFileName(r);
                    }
                    var f = this.findExtraFieldUnicodeComment();
                    if (f !== null) this.fileCommentStr = f;
                    else {
                      var d = s.transformTo(c, this.fileComment);
                      this.fileCommentStr = this.loadOptions.decodeFileName(d);
                    }
                  }
                },
                findExtraFieldUnicodePath: function () {
                  var c = this.extraFields[28789];
                  if (c) {
                    var m = i(c.value);
                    return m.readInt(1) !== 1 ||
                      o(this.fileName) !== m.readInt(4)
                      ? null
                      : b.utf8decode(m.readData(c.length - 5));
                  }
                  return null;
                },
                findExtraFieldUnicodeComment: function () {
                  var c = this.extraFields[25461];
                  if (c) {
                    var m = i(c.value);
                    return m.readInt(1) !== 1 ||
                      o(this.fileComment) !== m.readInt(4)
                      ? null
                      : b.utf8decode(m.readData(c.length - 5));
                  }
                  return null;
                },
              }),
                (h.exports = v);
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
            function (t, h, l) {
              "use strict";
              function i(m, r, f) {
                (this.name = m),
                  (this.dir = f.dir),
                  (this.date = f.date),
                  (this.comment = f.comment),
                  (this.unixPermissions = f.unixPermissions),
                  (this.dosPermissions = f.dosPermissions),
                  (this._data = r),
                  (this._dataBinary = f.binary),
                  (this.options = {
                    compression: f.compression,
                    compressionOptions: f.compressionOptions,
                  });
              }
              var s = t("./stream/StreamHelper"),
                a = t("./stream/DataWorker"),
                o = t("./utf8"),
                b = t("./compressedObject"),
                g = t("./stream/GenericWorker");
              i.prototype = {
                internalStream: function (m) {
                  var r = null,
                    f = "string";
                  try {
                    if (!m) throw new Error("No output type specified.");
                    var d = (f = m.toLowerCase()) === "string" || f === "text";
                    (f !== "binarystring" && f !== "text") || (f = "string"),
                      (r = this._decompressWorker());
                    var w = !this._dataBinary;
                    w && !d && (r = r.pipe(new o.Utf8EncodeWorker())),
                      !w && d && (r = r.pipe(new o.Utf8DecodeWorker()));
                  } catch (x) {
                    (r = new g("error")).error(x);
                  }
                  return new s(r, f, "");
                },
                async: function (m, r) {
                  return this.internalStream(m).accumulate(r);
                },
                nodeStream: function (m, r) {
                  return this.internalStream(m || "nodebuffer").toNodejsStream(
                    r,
                  );
                },
                _compressWorker: function (m, r) {
                  if (
                    this._data instanceof b &&
                    this._data.compression.magic === m.magic
                  )
                    return this._data.getCompressedWorker();
                  var f = this._decompressWorker();
                  return (
                    this._dataBinary || (f = f.pipe(new o.Utf8EncodeWorker())),
                    b.createWorkerFrom(f, m, r)
                  );
                },
                _decompressWorker: function () {
                  return this._data instanceof b
                    ? this._data.getContentWorker()
                    : this._data instanceof g
                    ? this._data
                    : new a(this._data);
                },
              };
              for (
                var u = [
                    "asText",
                    "asBinary",
                    "asNodeBuffer",
                    "asUint8Array",
                    "asArrayBuffer",
                  ],
                  v = function () {
                    throw new Error(
                      "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                    );
                  },
                  c = 0;
                c < u.length;
                c++
              )
                i.prototype[u[c]] = v;
              h.exports = i;
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
            function (t, h, l) {
              (function (i) {
                "use strict";
                var s,
                  a,
                  o = i.MutationObserver || i.WebKitMutationObserver;
                if (o) {
                  var b = 0,
                    g = new o(m),
                    u = i.document.createTextNode("");
                  g.observe(u, { characterData: !0 }),
                    (s = function () {
                      u.data = b = ++b % 2;
                    });
                } else if (i.setImmediate || i.MessageChannel === void 0)
                  s =
                    "document" in i &&
                    "onreadystatechange" in i.document.createElement("script")
                      ? function () {
                          var r = i.document.createElement("script");
                          (r.onreadystatechange = function () {
                            m(),
                              (r.onreadystatechange = null),
                              r.parentNode.removeChild(r),
                              (r = null);
                          }),
                            i.document.documentElement.appendChild(r);
                        }
                      : function () {
                          setTimeout(m, 0);
                        };
                else {
                  var v = new i.MessageChannel();
                  (v.port1.onmessage = m),
                    (s = function () {
                      v.port2.postMessage(0);
                    });
                }
                var c = [];
                function m() {
                  var r, f;
                  a = !0;
                  for (var d = c.length; d; ) {
                    for (f = c, c = [], r = -1; ++r < d; ) f[r]();
                    d = c.length;
                  }
                  a = !1;
                }
                h.exports = function (r) {
                  c.push(r) !== 1 || a || s();
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
            function (t, h, l) {
              "use strict";
              var i = t("immediate");
              function s() {}
              var a = {},
                o = ["REJECTED"],
                b = ["FULFILLED"],
                g = ["PENDING"];
              function u(d) {
                if (typeof d != "function")
                  throw new TypeError("resolver must be a function");
                (this.state = g),
                  (this.queue = []),
                  (this.outcome = void 0),
                  d !== s && r(this, d);
              }
              function v(d, w, x) {
                (this.promise = d),
                  typeof w == "function" &&
                    ((this.onFulfilled = w),
                    (this.callFulfilled = this.otherCallFulfilled)),
                  typeof x == "function" &&
                    ((this.onRejected = x),
                    (this.callRejected = this.otherCallRejected));
              }
              function c(d, w, x) {
                i(function () {
                  var C;
                  try {
                    C = w(x);
                  } catch (k) {
                    return a.reject(d, k);
                  }
                  C === d
                    ? a.reject(
                        d,
                        new TypeError("Cannot resolve promise with itself"),
                      )
                    : a.resolve(d, C);
                });
              }
              function m(d) {
                var w = d && d.then;
                if (
                  d &&
                  (typeof d == "object" || typeof d == "function") &&
                  typeof w == "function"
                )
                  return function () {
                    w.apply(d, arguments);
                  };
              }
              function r(d, w) {
                var x = !1;
                function C(T) {
                  x || ((x = !0), a.reject(d, T));
                }
                function k(T) {
                  x || ((x = !0), a.resolve(d, T));
                }
                var P = f(function () {
                  w(k, C);
                });
                P.status === "error" && C(P.value);
              }
              function f(d, w) {
                var x = {};
                try {
                  (x.value = d(w)), (x.status = "success");
                } catch (C) {
                  (x.status = "error"), (x.value = C);
                }
                return x;
              }
              ((h.exports = u).prototype.finally = function (d) {
                if (typeof d != "function") return this;
                var w = this.constructor;
                return this.then(
                  function (x) {
                    return w.resolve(d()).then(function () {
                      return x;
                    });
                  },
                  function (x) {
                    return w.resolve(d()).then(function () {
                      throw x;
                    });
                  },
                );
              }),
                (u.prototype.catch = function (d) {
                  return this.then(null, d);
                }),
                (u.prototype.then = function (d, w) {
                  if (
                    (typeof d != "function" && this.state === b) ||
                    (typeof w != "function" && this.state === o)
                  )
                    return this;
                  var x = new this.constructor(s);
                  return (
                    this.state !== g
                      ? c(x, this.state === b ? d : w, this.outcome)
                      : this.queue.push(new v(x, d, w)),
                    x
                  );
                }),
                (v.prototype.callFulfilled = function (d) {
                  a.resolve(this.promise, d);
                }),
                (v.prototype.otherCallFulfilled = function (d) {
                  c(this.promise, this.onFulfilled, d);
                }),
                (v.prototype.callRejected = function (d) {
                  a.reject(this.promise, d);
                }),
                (v.prototype.otherCallRejected = function (d) {
                  c(this.promise, this.onRejected, d);
                }),
                (a.resolve = function (d, w) {
                  var x = f(m, w);
                  if (x.status === "error") return a.reject(d, x.value);
                  var C = x.value;
                  if (C) r(d, C);
                  else {
                    (d.state = b), (d.outcome = w);
                    for (var k = -1, P = d.queue.length; ++k < P; )
                      d.queue[k].callFulfilled(w);
                  }
                  return d;
                }),
                (a.reject = function (d, w) {
                  (d.state = o), (d.outcome = w);
                  for (var x = -1, C = d.queue.length; ++x < C; )
                    d.queue[x].callRejected(w);
                  return d;
                }),
                (u.resolve = function (d) {
                  return d instanceof this ? d : a.resolve(new this(s), d);
                }),
                (u.reject = function (d) {
                  var w = new this(s);
                  return a.reject(w, d);
                }),
                (u.all = function (d) {
                  var w = this;
                  if (Object.prototype.toString.call(d) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var x = d.length,
                    C = !1;
                  if (!x) return this.resolve([]);
                  for (
                    var k = new Array(x), P = 0, T = -1, U = new this(s);
                    ++T < x;

                  )
                    D(d[T], T);
                  return U;
                  function D(I, N) {
                    w.resolve(I).then(
                      function (y) {
                        (k[N] = y),
                          ++P !== x || C || ((C = !0), a.resolve(U, k));
                      },
                      function (y) {
                        C || ((C = !0), a.reject(U, y));
                      },
                    );
                  }
                }),
                (u.race = function (d) {
                  var w = this;
                  if (Object.prototype.toString.call(d) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var x = d.length,
                    C = !1;
                  if (!x) return this.resolve([]);
                  for (var k = -1, P = new this(s); ++k < x; )
                    (T = d[k]),
                      w.resolve(T).then(
                        function (U) {
                          C || ((C = !0), a.resolve(P, U));
                        },
                        function (U) {
                          C || ((C = !0), a.reject(P, U));
                        },
                      );
                  var T;
                  return P;
                });
            },
            { immediate: 36 },
          ],
          38: [
            function (t, h, l) {
              "use strict";
              var i = {};
              (0, t("./lib/utils/common").assign)(
                i,
                t("./lib/deflate"),
                t("./lib/inflate"),
                t("./lib/zlib/constants"),
              ),
                (h.exports = i);
            },
            {
              "./lib/deflate": 39,
              "./lib/inflate": 40,
              "./lib/utils/common": 41,
              "./lib/zlib/constants": 44,
            },
          ],
          39: [
            function (t, h, l) {
              "use strict";
              var i = t("./zlib/deflate"),
                s = t("./utils/common"),
                a = t("./utils/strings"),
                o = t("./zlib/messages"),
                b = t("./zlib/zstream"),
                g = Object.prototype.toString,
                u = 0,
                v = -1,
                c = 0,
                m = 8;
              function r(d) {
                if (!(this instanceof r)) return new r(d);
                this.options = s.assign(
                  {
                    level: v,
                    method: m,
                    chunkSize: 16384,
                    windowBits: 15,
                    memLevel: 8,
                    strategy: c,
                    to: "",
                  },
                  d || {},
                );
                var w = this.options;
                w.raw && 0 < w.windowBits
                  ? (w.windowBits = -w.windowBits)
                  : w.gzip &&
                    0 < w.windowBits &&
                    w.windowBits < 16 &&
                    (w.windowBits += 16),
                  (this.err = 0),
                  (this.msg = ""),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new b()),
                  (this.strm.avail_out = 0);
                var x = i.deflateInit2(
                  this.strm,
                  w.level,
                  w.method,
                  w.windowBits,
                  w.memLevel,
                  w.strategy,
                );
                if (x !== u) throw new Error(o[x]);
                if (
                  (w.header && i.deflateSetHeader(this.strm, w.header),
                  w.dictionary)
                ) {
                  var C;
                  if (
                    ((C =
                      typeof w.dictionary == "string"
                        ? a.string2buf(w.dictionary)
                        : g.call(w.dictionary) === "[object ArrayBuffer]"
                        ? new Uint8Array(w.dictionary)
                        : w.dictionary),
                    (x = i.deflateSetDictionary(this.strm, C)) !== u)
                  )
                    throw new Error(o[x]);
                  this._dict_set = !0;
                }
              }
              function f(d, w) {
                var x = new r(w);
                if ((x.push(d, !0), x.err)) throw x.msg || o[x.err];
                return x.result;
              }
              (r.prototype.push = function (d, w) {
                var x,
                  C,
                  k = this.strm,
                  P = this.options.chunkSize;
                if (this.ended) return !1;
                (C = w === ~~w ? w : w === !0 ? 4 : 0),
                  typeof d == "string"
                    ? (k.input = a.string2buf(d))
                    : g.call(d) === "[object ArrayBuffer]"
                    ? (k.input = new Uint8Array(d))
                    : (k.input = d),
                  (k.next_in = 0),
                  (k.avail_in = k.input.length);
                do {
                  if (
                    (k.avail_out === 0 &&
                      ((k.output = new s.Buf8(P)),
                      (k.next_out = 0),
                      (k.avail_out = P)),
                    (x = i.deflate(k, C)) !== 1 && x !== u)
                  )
                    return this.onEnd(x), !(this.ended = !0);
                  (k.avail_out !== 0 &&
                    (k.avail_in !== 0 || (C !== 4 && C !== 2))) ||
                    (this.options.to === "string"
                      ? this.onData(
                          a.buf2binstring(s.shrinkBuf(k.output, k.next_out)),
                        )
                      : this.onData(s.shrinkBuf(k.output, k.next_out)));
                } while ((0 < k.avail_in || k.avail_out === 0) && x !== 1);
                return C === 4
                  ? ((x = i.deflateEnd(this.strm)),
                    this.onEnd(x),
                    (this.ended = !0),
                    x === u)
                  : C !== 2 || (this.onEnd(u), !(k.avail_out = 0));
              }),
                (r.prototype.onData = function (d) {
                  this.chunks.push(d);
                }),
                (r.prototype.onEnd = function (d) {
                  d === u &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = s.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = d),
                    (this.msg = this.strm.msg);
                }),
                (l.Deflate = r),
                (l.deflate = f),
                (l.deflateRaw = function (d, w) {
                  return ((w = w || {}).raw = !0), f(d, w);
                }),
                (l.gzip = function (d, w) {
                  return ((w = w || {}).gzip = !0), f(d, w);
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
            function (t, h, l) {
              "use strict";
              var i = t("./zlib/inflate"),
                s = t("./utils/common"),
                a = t("./utils/strings"),
                o = t("./zlib/constants"),
                b = t("./zlib/messages"),
                g = t("./zlib/zstream"),
                u = t("./zlib/gzheader"),
                v = Object.prototype.toString;
              function c(r) {
                if (!(this instanceof c)) return new c(r);
                this.options = s.assign(
                  { chunkSize: 16384, windowBits: 0, to: "" },
                  r || {},
                );
                var f = this.options;
                f.raw &&
                  0 <= f.windowBits &&
                  f.windowBits < 16 &&
                  ((f.windowBits = -f.windowBits),
                  f.windowBits === 0 && (f.windowBits = -15)),
                  !(0 <= f.windowBits && f.windowBits < 16) ||
                    (r && r.windowBits) ||
                    (f.windowBits += 32),
                  15 < f.windowBits &&
                    f.windowBits < 48 &&
                    !(15 & f.windowBits) &&
                    (f.windowBits |= 15),
                  (this.err = 0),
                  (this.msg = ""),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new g()),
                  (this.strm.avail_out = 0);
                var d = i.inflateInit2(this.strm, f.windowBits);
                if (d !== o.Z_OK) throw new Error(b[d]);
                (this.header = new u()),
                  i.inflateGetHeader(this.strm, this.header);
              }
              function m(r, f) {
                var d = new c(f);
                if ((d.push(r, !0), d.err)) throw d.msg || b[d.err];
                return d.result;
              }
              (c.prototype.push = function (r, f) {
                var d,
                  w,
                  x,
                  C,
                  k,
                  P,
                  T = this.strm,
                  U = this.options.chunkSize,
                  D = this.options.dictionary,
                  I = !1;
                if (this.ended) return !1;
                (w = f === ~~f ? f : f === !0 ? o.Z_FINISH : o.Z_NO_FLUSH),
                  typeof r == "string"
                    ? (T.input = a.binstring2buf(r))
                    : v.call(r) === "[object ArrayBuffer]"
                    ? (T.input = new Uint8Array(r))
                    : (T.input = r),
                  (T.next_in = 0),
                  (T.avail_in = T.input.length);
                do {
                  if (
                    (T.avail_out === 0 &&
                      ((T.output = new s.Buf8(U)),
                      (T.next_out = 0),
                      (T.avail_out = U)),
                    (d = i.inflate(T, o.Z_NO_FLUSH)) === o.Z_NEED_DICT &&
                      D &&
                      ((P =
                        typeof D == "string"
                          ? a.string2buf(D)
                          : v.call(D) === "[object ArrayBuffer]"
                          ? new Uint8Array(D)
                          : D),
                      (d = i.inflateSetDictionary(this.strm, P))),
                    d === o.Z_BUF_ERROR && I === !0 && ((d = o.Z_OK), (I = !1)),
                    d !== o.Z_STREAM_END && d !== o.Z_OK)
                  )
                    return this.onEnd(d), !(this.ended = !0);
                  T.next_out &&
                    ((T.avail_out !== 0 &&
                      d !== o.Z_STREAM_END &&
                      (T.avail_in !== 0 ||
                        (w !== o.Z_FINISH && w !== o.Z_SYNC_FLUSH))) ||
                      (this.options.to === "string"
                        ? ((x = a.utf8border(T.output, T.next_out)),
                          (C = T.next_out - x),
                          (k = a.buf2string(T.output, x)),
                          (T.next_out = C),
                          (T.avail_out = U - C),
                          C && s.arraySet(T.output, T.output, x, C, 0),
                          this.onData(k))
                        : this.onData(s.shrinkBuf(T.output, T.next_out)))),
                    T.avail_in === 0 && T.avail_out === 0 && (I = !0);
                } while (
                  (0 < T.avail_in || T.avail_out === 0) &&
                  d !== o.Z_STREAM_END
                );
                return (
                  d === o.Z_STREAM_END && (w = o.Z_FINISH),
                  w === o.Z_FINISH
                    ? ((d = i.inflateEnd(this.strm)),
                      this.onEnd(d),
                      (this.ended = !0),
                      d === o.Z_OK)
                    : w !== o.Z_SYNC_FLUSH ||
                      (this.onEnd(o.Z_OK), !(T.avail_out = 0))
                );
              }),
                (c.prototype.onData = function (r) {
                  this.chunks.push(r);
                }),
                (c.prototype.onEnd = function (r) {
                  r === o.Z_OK &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = s.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = r),
                    (this.msg = this.strm.msg);
                }),
                (l.Inflate = c),
                (l.inflate = m),
                (l.inflateRaw = function (r, f) {
                  return ((f = f || {}).raw = !0), m(r, f);
                }),
                (l.ungzip = m);
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
            function (t, h, l) {
              "use strict";
              var i =
                typeof Uint8Array < "u" &&
                typeof Uint16Array < "u" &&
                typeof Int32Array < "u";
              (l.assign = function (o) {
                for (
                  var b = Array.prototype.slice.call(arguments, 1);
                  b.length;

                ) {
                  var g = b.shift();
                  if (g) {
                    if (typeof g != "object")
                      throw new TypeError(g + "must be non-object");
                    for (var u in g) g.hasOwnProperty(u) && (o[u] = g[u]);
                  }
                }
                return o;
              }),
                (l.shrinkBuf = function (o, b) {
                  return o.length === b
                    ? o
                    : o.subarray
                    ? o.subarray(0, b)
                    : ((o.length = b), o);
                });
              var s = {
                  arraySet: function (o, b, g, u, v) {
                    if (b.subarray && o.subarray)
                      o.set(b.subarray(g, g + u), v);
                    else for (var c = 0; c < u; c++) o[v + c] = b[g + c];
                  },
                  flattenChunks: function (o) {
                    var b, g, u, v, c, m;
                    for (b = u = 0, g = o.length; b < g; b++) u += o[b].length;
                    for (
                      m = new Uint8Array(u), b = v = 0, g = o.length;
                      b < g;
                      b++
                    )
                      (c = o[b]), m.set(c, v), (v += c.length);
                    return m;
                  },
                },
                a = {
                  arraySet: function (o, b, g, u, v) {
                    for (var c = 0; c < u; c++) o[v + c] = b[g + c];
                  },
                  flattenChunks: function (o) {
                    return [].concat.apply([], o);
                  },
                };
              (l.setTyped = function (o) {
                o
                  ? ((l.Buf8 = Uint8Array),
                    (l.Buf16 = Uint16Array),
                    (l.Buf32 = Int32Array),
                    l.assign(l, s))
                  : ((l.Buf8 = Array),
                    (l.Buf16 = Array),
                    (l.Buf32 = Array),
                    l.assign(l, a));
              }),
                l.setTyped(i);
            },
            {},
          ],
          42: [
            function (t, h, l) {
              "use strict";
              var i = t("./common"),
                s = !0,
                a = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                s = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                a = !1;
              }
              for (var o = new i.Buf8(256), b = 0; b < 256; b++)
                o[b] =
                  252 <= b
                    ? 6
                    : 248 <= b
                    ? 5
                    : 240 <= b
                    ? 4
                    : 224 <= b
                    ? 3
                    : 192 <= b
                    ? 2
                    : 1;
              function g(u, v) {
                if (v < 65537 && ((u.subarray && a) || (!u.subarray && s)))
                  return String.fromCharCode.apply(null, i.shrinkBuf(u, v));
                for (var c = "", m = 0; m < v; m++)
                  c += String.fromCharCode(u[m]);
                return c;
              }
              (o[254] = o[254] = 1),
                (l.string2buf = function (u) {
                  var v,
                    c,
                    m,
                    r,
                    f,
                    d = u.length,
                    w = 0;
                  for (r = 0; r < d; r++)
                    (64512 & (c = u.charCodeAt(r))) == 55296 &&
                      r + 1 < d &&
                      (64512 & (m = u.charCodeAt(r + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (m - 56320)), r++),
                      (w += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4);
                  for (v = new i.Buf8(w), r = f = 0; f < w; r++)
                    (64512 & (c = u.charCodeAt(r))) == 55296 &&
                      r + 1 < d &&
                      (64512 & (m = u.charCodeAt(r + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (m - 56320)), r++),
                      c < 128
                        ? (v[f++] = c)
                        : (c < 2048
                            ? (v[f++] = 192 | (c >>> 6))
                            : (c < 65536
                                ? (v[f++] = 224 | (c >>> 12))
                                : ((v[f++] = 240 | (c >>> 18)),
                                  (v[f++] = 128 | ((c >>> 12) & 63))),
                              (v[f++] = 128 | ((c >>> 6) & 63))),
                          (v[f++] = 128 | (63 & c)));
                  return v;
                }),
                (l.buf2binstring = function (u) {
                  return g(u, u.length);
                }),
                (l.binstring2buf = function (u) {
                  for (
                    var v = new i.Buf8(u.length), c = 0, m = v.length;
                    c < m;
                    c++
                  )
                    v[c] = u.charCodeAt(c);
                  return v;
                }),
                (l.buf2string = function (u, v) {
                  var c,
                    m,
                    r,
                    f,
                    d = v || u.length,
                    w = new Array(2 * d);
                  for (c = m = 0; c < d; )
                    if ((r = u[c++]) < 128) w[m++] = r;
                    else if (4 < (f = o[r])) (w[m++] = 65533), (c += f - 1);
                    else {
                      for (
                        r &= f === 2 ? 31 : f === 3 ? 15 : 7;
                        1 < f && c < d;

                      )
                        (r = (r << 6) | (63 & u[c++])), f--;
                      1 < f
                        ? (w[m++] = 65533)
                        : r < 65536
                        ? (w[m++] = r)
                        : ((r -= 65536),
                          (w[m++] = 55296 | ((r >> 10) & 1023)),
                          (w[m++] = 56320 | (1023 & r)));
                    }
                  return g(w, m);
                }),
                (l.utf8border = function (u, v) {
                  var c;
                  for (
                    (v = v || u.length) > u.length && (v = u.length), c = v - 1;
                    0 <= c && (192 & u[c]) == 128;

                  )
                    c--;
                  return c < 0 || c === 0 ? v : c + o[u[c]] > v ? c : v;
                });
            },
            { "./common": 41 },
          ],
          43: [
            function (t, h, l) {
              "use strict";
              h.exports = function (i, s, a, o) {
                for (
                  var b = (65535 & i) | 0, g = ((i >>> 16) & 65535) | 0, u = 0;
                  a !== 0;

                ) {
                  for (
                    a -= u = 2e3 < a ? 2e3 : a;
                    (g = (g + (b = (b + s[o++]) | 0)) | 0), --u;

                  );
                  (b %= 65521), (g %= 65521);
                }
                return b | (g << 16) | 0;
              };
            },
            {},
          ],
          44: [
            function (t, h, l) {
              "use strict";
              h.exports = {
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
            function (t, h, l) {
              "use strict";
              var i = (function () {
                for (var s, a = [], o = 0; o < 256; o++) {
                  s = o;
                  for (var b = 0; b < 8; b++)
                    s = 1 & s ? 3988292384 ^ (s >>> 1) : s >>> 1;
                  a[o] = s;
                }
                return a;
              })();
              h.exports = function (s, a, o, b) {
                var g = i,
                  u = b + o;
                s ^= -1;
                for (var v = b; v < u; v++) s = (s >>> 8) ^ g[255 & (s ^ a[v])];
                return -1 ^ s;
              };
            },
            {},
          ],
          46: [
            function (t, h, l) {
              "use strict";
              var i,
                s = t("../utils/common"),
                a = t("./trees"),
                o = t("./adler32"),
                b = t("./crc32"),
                g = t("./messages"),
                u = 0,
                v = 4,
                c = 0,
                m = -2,
                r = -1,
                f = 4,
                d = 2,
                w = 8,
                x = 9,
                C = 286,
                k = 30,
                P = 19,
                T = 2 * C + 1,
                U = 15,
                D = 3,
                I = 258,
                N = I + D + 1,
                y = 42,
                S = 113,
                n = 1,
                A = 2,
                G = 3,
                B = 4;
              function J(e, O) {
                return (e.msg = g[O]), O;
              }
              function X(e) {
                return (e << 1) - (4 < e ? 9 : 0);
              }
              function K(e) {
                for (var O = e.length; 0 <= --O; ) e[O] = 0;
              }
              function F(e) {
                var O = e.state,
                  R = O.pending;
                R > e.avail_out && (R = e.avail_out),
                  R !== 0 &&
                    (s.arraySet(
                      e.output,
                      O.pending_buf,
                      O.pending_out,
                      R,
                      e.next_out,
                    ),
                    (e.next_out += R),
                    (O.pending_out += R),
                    (e.total_out += R),
                    (e.avail_out -= R),
                    (O.pending -= R),
                    O.pending === 0 && (O.pending_out = 0));
              }
              function $(e, O) {
                a._tr_flush_block(
                  e,
                  0 <= e.block_start ? e.block_start : -1,
                  e.strstart - e.block_start,
                  O,
                ),
                  (e.block_start = e.strstart),
                  F(e.strm);
              }
              function V(e, O) {
                e.pending_buf[e.pending++] = O;
              }
              function H(e, O) {
                (e.pending_buf[e.pending++] = (O >>> 8) & 255),
                  (e.pending_buf[e.pending++] = 255 & O);
              }
              function j(e, O) {
                var R,
                  _,
                  p = e.max_chain_length,
                  E = e.strstart,
                  M = e.prev_length,
                  L = e.nice_match,
                  z =
                    e.strstart > e.w_size - N ? e.strstart - (e.w_size - N) : 0,
                  Y = e.window,
                  Z = e.w_mask,
                  W = e.prev,
                  Q = e.strstart + I,
                  at = Y[E + M - 1],
                  st = Y[E + M];
                e.prev_length >= e.good_match && (p >>= 2),
                  L > e.lookahead && (L = e.lookahead);
                do
                  if (
                    Y[(R = O) + M] === st &&
                    Y[R + M - 1] === at &&
                    Y[R] === Y[E] &&
                    Y[++R] === Y[E + 1]
                  ) {
                    (E += 2), R++;
                    do;
                    while (
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      Y[++E] === Y[++R] &&
                      E < Q
                    );
                    if (((_ = I - (Q - E)), (E = Q - I), M < _)) {
                      if (((e.match_start = O), L <= (M = _))) break;
                      (at = Y[E + M - 1]), (st = Y[E + M]);
                    }
                  }
                while ((O = W[O & Z]) > z && --p != 0);
                return M <= e.lookahead ? M : e.lookahead;
              }
              function it(e) {
                var O,
                  R,
                  _,
                  p,
                  E,
                  M,
                  L,
                  z,
                  Y,
                  Z,
                  W = e.w_size;
                do {
                  if (
                    ((p = e.window_size - e.lookahead - e.strstart),
                    e.strstart >= W + (W - N))
                  ) {
                    for (
                      s.arraySet(e.window, e.window, W, W, 0),
                        e.match_start -= W,
                        e.strstart -= W,
                        e.block_start -= W,
                        O = R = e.hash_size;
                      (_ = e.head[--O]), (e.head[O] = W <= _ ? _ - W : 0), --R;

                    );
                    for (
                      O = R = W;
                      (_ = e.prev[--O]), (e.prev[O] = W <= _ ? _ - W : 0), --R;

                    );
                    p += W;
                  }
                  if (e.strm.avail_in === 0) break;
                  if (
                    ((M = e.strm),
                    (L = e.window),
                    (z = e.strstart + e.lookahead),
                    (Y = p),
                    (Z = void 0),
                    (Z = M.avail_in),
                    Y < Z && (Z = Y),
                    (R =
                      Z === 0
                        ? 0
                        : ((M.avail_in -= Z),
                          s.arraySet(L, M.input, M.next_in, Z, z),
                          M.state.wrap === 1
                            ? (M.adler = o(M.adler, L, Z, z))
                            : M.state.wrap === 2 &&
                              (M.adler = b(M.adler, L, Z, z)),
                          (M.next_in += Z),
                          (M.total_in += Z),
                          Z)),
                    (e.lookahead += R),
                    e.lookahead + e.insert >= D)
                  )
                    for (
                      E = e.strstart - e.insert,
                        e.ins_h = e.window[E],
                        e.ins_h =
                          ((e.ins_h << e.hash_shift) ^ e.window[E + 1]) &
                          e.hash_mask;
                      e.insert &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^ e.window[E + D - 1]) &
                        e.hash_mask),
                      (e.prev[E & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = E),
                      E++,
                      e.insert--,
                      !(e.lookahead + e.insert < D));

                    );
                } while (e.lookahead < N && e.strm.avail_in !== 0);
              }
              function dt(e, O) {
                for (var R, _; ; ) {
                  if (e.lookahead < N) {
                    if ((it(e), e.lookahead < N && O === u)) return n;
                    if (e.lookahead === 0) break;
                  }
                  if (
                    ((R = 0),
                    e.lookahead >= D &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^
                          e.window[e.strstart + D - 1]) &
                        e.hash_mask),
                      (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = e.strstart)),
                    R !== 0 &&
                      e.strstart - R <= e.w_size - N &&
                      (e.match_length = j(e, R)),
                    e.match_length >= D)
                  )
                    if (
                      ((_ = a._tr_tally(
                        e,
                        e.strstart - e.match_start,
                        e.match_length - D,
                      )),
                      (e.lookahead -= e.match_length),
                      e.match_length <= e.max_lazy_match && e.lookahead >= D)
                    ) {
                      for (
                        e.match_length--;
                        e.strstart++,
                          (e.ins_h =
                            ((e.ins_h << e.hash_shift) ^
                              e.window[e.strstart + D - 1]) &
                            e.hash_mask),
                          (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                          (e.head[e.ins_h] = e.strstart),
                          --e.match_length != 0;

                      );
                      e.strstart++;
                    } else
                      (e.strstart += e.match_length),
                        (e.match_length = 0),
                        (e.ins_h = e.window[e.strstart]),
                        (e.ins_h =
                          ((e.ins_h << e.hash_shift) ^
                            e.window[e.strstart + 1]) &
                          e.hash_mask);
                  else
                    (_ = a._tr_tally(e, 0, e.window[e.strstart])),
                      e.lookahead--,
                      e.strstart++;
                  if (_ && ($(e, !1), e.strm.avail_out === 0)) return n;
                }
                return (
                  (e.insert = e.strstart < D - 1 ? e.strstart : D - 1),
                  O === v
                    ? ($(e, !0), e.strm.avail_out === 0 ? G : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? n
                    : A
                );
              }
              function et(e, O) {
                for (var R, _, p; ; ) {
                  if (e.lookahead < N) {
                    if ((it(e), e.lookahead < N && O === u)) return n;
                    if (e.lookahead === 0) break;
                  }
                  if (
                    ((R = 0),
                    e.lookahead >= D &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^
                          e.window[e.strstart + D - 1]) &
                        e.hash_mask),
                      (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = e.strstart)),
                    (e.prev_length = e.match_length),
                    (e.prev_match = e.match_start),
                    (e.match_length = D - 1),
                    R !== 0 &&
                      e.prev_length < e.max_lazy_match &&
                      e.strstart - R <= e.w_size - N &&
                      ((e.match_length = j(e, R)),
                      e.match_length <= 5 &&
                        (e.strategy === 1 ||
                          (e.match_length === D &&
                            4096 < e.strstart - e.match_start)) &&
                        (e.match_length = D - 1)),
                    e.prev_length >= D && e.match_length <= e.prev_length)
                  ) {
                    for (
                      p = e.strstart + e.lookahead - D,
                        _ = a._tr_tally(
                          e,
                          e.strstart - 1 - e.prev_match,
                          e.prev_length - D,
                        ),
                        e.lookahead -= e.prev_length - 1,
                        e.prev_length -= 2;
                      ++e.strstart <= p &&
                        ((e.ins_h =
                          ((e.ins_h << e.hash_shift) ^
                            e.window[e.strstart + D - 1]) &
                          e.hash_mask),
                        (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                        (e.head[e.ins_h] = e.strstart)),
                        --e.prev_length != 0;

                    );
                    if (
                      ((e.match_available = 0),
                      (e.match_length = D - 1),
                      e.strstart++,
                      _ && ($(e, !1), e.strm.avail_out === 0))
                    )
                      return n;
                  } else if (e.match_available) {
                    if (
                      ((_ = a._tr_tally(e, 0, e.window[e.strstart - 1])) &&
                        $(e, !1),
                      e.strstart++,
                      e.lookahead--,
                      e.strm.avail_out === 0)
                    )
                      return n;
                  } else (e.match_available = 1), e.strstart++, e.lookahead--;
                }
                return (
                  e.match_available &&
                    ((_ = a._tr_tally(e, 0, e.window[e.strstart - 1])),
                    (e.match_available = 0)),
                  (e.insert = e.strstart < D - 1 ? e.strstart : D - 1),
                  O === v
                    ? ($(e, !0), e.strm.avail_out === 0 ? G : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? n
                    : A
                );
              }
              function rt(e, O, R, _, p) {
                (this.good_length = e),
                  (this.max_lazy = O),
                  (this.nice_length = R),
                  (this.max_chain = _),
                  (this.func = p);
              }
              function nt() {
                (this.strm = null),
                  (this.status = 0),
                  (this.pending_buf = null),
                  (this.pending_buf_size = 0),
                  (this.pending_out = 0),
                  (this.pending = 0),
                  (this.wrap = 0),
                  (this.gzhead = null),
                  (this.gzindex = 0),
                  (this.method = w),
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
                  (this.dyn_ltree = new s.Buf16(2 * T)),
                  (this.dyn_dtree = new s.Buf16(2 * (2 * k + 1))),
                  (this.bl_tree = new s.Buf16(2 * (2 * P + 1))),
                  K(this.dyn_ltree),
                  K(this.dyn_dtree),
                  K(this.bl_tree),
                  (this.l_desc = null),
                  (this.d_desc = null),
                  (this.bl_desc = null),
                  (this.bl_count = new s.Buf16(U + 1)),
                  (this.heap = new s.Buf16(2 * C + 1)),
                  K(this.heap),
                  (this.heap_len = 0),
                  (this.heap_max = 0),
                  (this.depth = new s.Buf16(2 * C + 1)),
                  K(this.depth),
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
              function ct(e) {
                var O;
                return e && e.state
                  ? ((e.total_in = e.total_out = 0),
                    (e.data_type = d),
                    ((O = e.state).pending = 0),
                    (O.pending_out = 0),
                    O.wrap < 0 && (O.wrap = -O.wrap),
                    (O.status = O.wrap ? y : S),
                    (e.adler = O.wrap === 2 ? 0 : 1),
                    (O.last_flush = u),
                    a._tr_init(O),
                    c)
                  : J(e, m);
              }
              function pt(e) {
                var O = ct(e);
                return (
                  O === c &&
                    (function (R) {
                      (R.window_size = 2 * R.w_size),
                        K(R.head),
                        (R.max_lazy_match = i[R.level].max_lazy),
                        (R.good_match = i[R.level].good_length),
                        (R.nice_match = i[R.level].nice_length),
                        (R.max_chain_length = i[R.level].max_chain),
                        (R.strstart = 0),
                        (R.block_start = 0),
                        (R.lookahead = 0),
                        (R.insert = 0),
                        (R.match_length = R.prev_length = D - 1),
                        (R.match_available = 0),
                        (R.ins_h = 0);
                    })(e.state),
                  O
                );
              }
              function gt(e, O, R, _, p, E) {
                if (!e) return m;
                var M = 1;
                if (
                  (O === r && (O = 6),
                  _ < 0 ? ((M = 0), (_ = -_)) : 15 < _ && ((M = 2), (_ -= 16)),
                  p < 1 ||
                    x < p ||
                    R !== w ||
                    _ < 8 ||
                    15 < _ ||
                    O < 0 ||
                    9 < O ||
                    E < 0 ||
                    f < E)
                )
                  return J(e, m);
                _ === 8 && (_ = 9);
                var L = new nt();
                return (
                  ((e.state = L).strm = e),
                  (L.wrap = M),
                  (L.gzhead = null),
                  (L.w_bits = _),
                  (L.w_size = 1 << L.w_bits),
                  (L.w_mask = L.w_size - 1),
                  (L.hash_bits = p + 7),
                  (L.hash_size = 1 << L.hash_bits),
                  (L.hash_mask = L.hash_size - 1),
                  (L.hash_shift = ~~((L.hash_bits + D - 1) / D)),
                  (L.window = new s.Buf8(2 * L.w_size)),
                  (L.head = new s.Buf16(L.hash_size)),
                  (L.prev = new s.Buf16(L.w_size)),
                  (L.lit_bufsize = 1 << (p + 6)),
                  (L.pending_buf_size = 4 * L.lit_bufsize),
                  (L.pending_buf = new s.Buf8(L.pending_buf_size)),
                  (L.d_buf = 1 * L.lit_bufsize),
                  (L.l_buf = 3 * L.lit_bufsize),
                  (L.level = O),
                  (L.strategy = E),
                  (L.method = R),
                  pt(e)
                );
              }
              (i = [
                new rt(0, 0, 0, 0, function (e, O) {
                  var R = 65535;
                  for (
                    R > e.pending_buf_size - 5 && (R = e.pending_buf_size - 5);
                    ;

                  ) {
                    if (e.lookahead <= 1) {
                      if ((it(e), e.lookahead === 0 && O === u)) return n;
                      if (e.lookahead === 0) break;
                    }
                    (e.strstart += e.lookahead), (e.lookahead = 0);
                    var _ = e.block_start + R;
                    if (
                      ((e.strstart === 0 || e.strstart >= _) &&
                        ((e.lookahead = e.strstart - _),
                        (e.strstart = _),
                        $(e, !1),
                        e.strm.avail_out === 0)) ||
                      (e.strstart - e.block_start >= e.w_size - N &&
                        ($(e, !1), e.strm.avail_out === 0))
                    )
                      return n;
                  }
                  return (
                    (e.insert = 0),
                    O === v
                      ? ($(e, !0), e.strm.avail_out === 0 ? G : B)
                      : (e.strstart > e.block_start &&
                          ($(e, !1), e.strm.avail_out),
                        n)
                  );
                }),
                new rt(4, 4, 8, 4, dt),
                new rt(4, 5, 16, 8, dt),
                new rt(4, 6, 32, 32, dt),
                new rt(4, 4, 16, 16, et),
                new rt(8, 16, 32, 32, et),
                new rt(8, 16, 128, 128, et),
                new rt(8, 32, 128, 256, et),
                new rt(32, 128, 258, 1024, et),
                new rt(32, 258, 258, 4096, et),
              ]),
                (l.deflateInit = function (e, O) {
                  return gt(e, O, w, 15, 8, 0);
                }),
                (l.deflateInit2 = gt),
                (l.deflateReset = pt),
                (l.deflateResetKeep = ct),
                (l.deflateSetHeader = function (e, O) {
                  return e && e.state
                    ? e.state.wrap !== 2
                      ? m
                      : ((e.state.gzhead = O), c)
                    : m;
                }),
                (l.deflate = function (e, O) {
                  var R, _, p, E;
                  if (!e || !e.state || 5 < O || O < 0) return e ? J(e, m) : m;
                  if (
                    ((_ = e.state),
                    !e.output ||
                      (!e.input && e.avail_in !== 0) ||
                      (_.status === 666 && O !== v))
                  )
                    return J(e, e.avail_out === 0 ? -5 : m);
                  if (
                    ((_.strm = e),
                    (R = _.last_flush),
                    (_.last_flush = O),
                    _.status === y)
                  )
                    if (_.wrap === 2)
                      (e.adler = 0),
                        V(_, 31),
                        V(_, 139),
                        V(_, 8),
                        _.gzhead
                          ? (V(
                              _,
                              (_.gzhead.text ? 1 : 0) +
                                (_.gzhead.hcrc ? 2 : 0) +
                                (_.gzhead.extra ? 4 : 0) +
                                (_.gzhead.name ? 8 : 0) +
                                (_.gzhead.comment ? 16 : 0),
                            ),
                            V(_, 255 & _.gzhead.time),
                            V(_, (_.gzhead.time >> 8) & 255),
                            V(_, (_.gzhead.time >> 16) & 255),
                            V(_, (_.gzhead.time >> 24) & 255),
                            V(
                              _,
                              _.level === 9
                                ? 2
                                : 2 <= _.strategy || _.level < 2
                                ? 4
                                : 0,
                            ),
                            V(_, 255 & _.gzhead.os),
                            _.gzhead.extra &&
                              _.gzhead.extra.length &&
                              (V(_, 255 & _.gzhead.extra.length),
                              V(_, (_.gzhead.extra.length >> 8) & 255)),
                            _.gzhead.hcrc &&
                              (e.adler = b(
                                e.adler,
                                _.pending_buf,
                                _.pending,
                                0,
                              )),
                            (_.gzindex = 0),
                            (_.status = 69))
                          : (V(_, 0),
                            V(_, 0),
                            V(_, 0),
                            V(_, 0),
                            V(_, 0),
                            V(
                              _,
                              _.level === 9
                                ? 2
                                : 2 <= _.strategy || _.level < 2
                                ? 4
                                : 0,
                            ),
                            V(_, 3),
                            (_.status = S));
                    else {
                      var M = (w + ((_.w_bits - 8) << 4)) << 8;
                      (M |=
                        (2 <= _.strategy || _.level < 2
                          ? 0
                          : _.level < 6
                          ? 1
                          : _.level === 6
                          ? 2
                          : 3) << 6),
                        _.strstart !== 0 && (M |= 32),
                        (M += 31 - (M % 31)),
                        (_.status = S),
                        H(_, M),
                        _.strstart !== 0 &&
                          (H(_, e.adler >>> 16), H(_, 65535 & e.adler)),
                        (e.adler = 1);
                    }
                  if (_.status === 69)
                    if (_.gzhead.extra) {
                      for (
                        p = _.pending;
                        _.gzindex < (65535 & _.gzhead.extra.length) &&
                        (_.pending !== _.pending_buf_size ||
                          (_.gzhead.hcrc &&
                            _.pending > p &&
                            (e.adler = b(
                              e.adler,
                              _.pending_buf,
                              _.pending - p,
                              p,
                            )),
                          F(e),
                          (p = _.pending),
                          _.pending !== _.pending_buf_size));

                      )
                        V(_, 255 & _.gzhead.extra[_.gzindex]), _.gzindex++;
                      _.gzhead.hcrc &&
                        _.pending > p &&
                        (e.adler = b(e.adler, _.pending_buf, _.pending - p, p)),
                        _.gzindex === _.gzhead.extra.length &&
                          ((_.gzindex = 0), (_.status = 73));
                    } else _.status = 73;
                  if (_.status === 73)
                    if (_.gzhead.name) {
                      p = _.pending;
                      do {
                        if (
                          _.pending === _.pending_buf_size &&
                          (_.gzhead.hcrc &&
                            _.pending > p &&
                            (e.adler = b(
                              e.adler,
                              _.pending_buf,
                              _.pending - p,
                              p,
                            )),
                          F(e),
                          (p = _.pending),
                          _.pending === _.pending_buf_size)
                        ) {
                          E = 1;
                          break;
                        }
                        (E =
                          _.gzindex < _.gzhead.name.length
                            ? 255 & _.gzhead.name.charCodeAt(_.gzindex++)
                            : 0),
                          V(_, E);
                      } while (E !== 0);
                      _.gzhead.hcrc &&
                        _.pending > p &&
                        (e.adler = b(e.adler, _.pending_buf, _.pending - p, p)),
                        E === 0 && ((_.gzindex = 0), (_.status = 91));
                    } else _.status = 91;
                  if (_.status === 91)
                    if (_.gzhead.comment) {
                      p = _.pending;
                      do {
                        if (
                          _.pending === _.pending_buf_size &&
                          (_.gzhead.hcrc &&
                            _.pending > p &&
                            (e.adler = b(
                              e.adler,
                              _.pending_buf,
                              _.pending - p,
                              p,
                            )),
                          F(e),
                          (p = _.pending),
                          _.pending === _.pending_buf_size)
                        ) {
                          E = 1;
                          break;
                        }
                        (E =
                          _.gzindex < _.gzhead.comment.length
                            ? 255 & _.gzhead.comment.charCodeAt(_.gzindex++)
                            : 0),
                          V(_, E);
                      } while (E !== 0);
                      _.gzhead.hcrc &&
                        _.pending > p &&
                        (e.adler = b(e.adler, _.pending_buf, _.pending - p, p)),
                        E === 0 && (_.status = 103);
                    } else _.status = 103;
                  if (
                    (_.status === 103 &&
                      (_.gzhead.hcrc
                        ? (_.pending + 2 > _.pending_buf_size && F(e),
                          _.pending + 2 <= _.pending_buf_size &&
                            (V(_, 255 & e.adler),
                            V(_, (e.adler >> 8) & 255),
                            (e.adler = 0),
                            (_.status = S)))
                        : (_.status = S)),
                    _.pending !== 0)
                  ) {
                    if ((F(e), e.avail_out === 0))
                      return (_.last_flush = -1), c;
                  } else if (e.avail_in === 0 && X(O) <= X(R) && O !== v)
                    return J(e, -5);
                  if (_.status === 666 && e.avail_in !== 0) return J(e, -5);
                  if (
                    e.avail_in !== 0 ||
                    _.lookahead !== 0 ||
                    (O !== u && _.status !== 666)
                  ) {
                    var L =
                      _.strategy === 2
                        ? (function (z, Y) {
                            for (var Z; ; ) {
                              if (
                                z.lookahead === 0 &&
                                (it(z), z.lookahead === 0)
                              ) {
                                if (Y === u) return n;
                                break;
                              }
                              if (
                                ((z.match_length = 0),
                                (Z = a._tr_tally(z, 0, z.window[z.strstart])),
                                z.lookahead--,
                                z.strstart++,
                                Z && ($(z, !1), z.strm.avail_out === 0))
                              )
                                return n;
                            }
                            return (
                              (z.insert = 0),
                              Y === v
                                ? ($(z, !0), z.strm.avail_out === 0 ? G : B)
                                : z.last_lit &&
                                  ($(z, !1), z.strm.avail_out === 0)
                                ? n
                                : A
                            );
                          })(_, O)
                        : _.strategy === 3
                        ? (function (z, Y) {
                            for (var Z, W, Q, at, st = z.window; ; ) {
                              if (z.lookahead <= I) {
                                if ((it(z), z.lookahead <= I && Y === u))
                                  return n;
                                if (z.lookahead === 0) break;
                              }
                              if (
                                ((z.match_length = 0),
                                z.lookahead >= D &&
                                  0 < z.strstart &&
                                  (W = st[(Q = z.strstart - 1)]) === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q])
                              ) {
                                at = z.strstart + I;
                                do;
                                while (
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  W === st[++Q] &&
                                  Q < at
                                );
                                (z.match_length = I - (at - Q)),
                                  z.match_length > z.lookahead &&
                                    (z.match_length = z.lookahead);
                              }
                              if (
                                (z.match_length >= D
                                  ? ((Z = a._tr_tally(
                                      z,
                                      1,
                                      z.match_length - D,
                                    )),
                                    (z.lookahead -= z.match_length),
                                    (z.strstart += z.match_length),
                                    (z.match_length = 0))
                                  : ((Z = a._tr_tally(
                                      z,
                                      0,
                                      z.window[z.strstart],
                                    )),
                                    z.lookahead--,
                                    z.strstart++),
                                Z && ($(z, !1), z.strm.avail_out === 0))
                              )
                                return n;
                            }
                            return (
                              (z.insert = 0),
                              Y === v
                                ? ($(z, !0), z.strm.avail_out === 0 ? G : B)
                                : z.last_lit &&
                                  ($(z, !1), z.strm.avail_out === 0)
                                ? n
                                : A
                            );
                          })(_, O)
                        : i[_.level].func(_, O);
                    if (
                      ((L !== G && L !== B) || (_.status = 666),
                      L === n || L === G)
                    )
                      return e.avail_out === 0 && (_.last_flush = -1), c;
                    if (
                      L === A &&
                      (O === 1
                        ? a._tr_align(_)
                        : O !== 5 &&
                          (a._tr_stored_block(_, 0, 0, !1),
                          O === 3 &&
                            (K(_.head),
                            _.lookahead === 0 &&
                              ((_.strstart = 0),
                              (_.block_start = 0),
                              (_.insert = 0)))),
                      F(e),
                      e.avail_out === 0)
                    )
                      return (_.last_flush = -1), c;
                  }
                  return O !== v
                    ? c
                    : _.wrap <= 0
                    ? 1
                    : (_.wrap === 2
                        ? (V(_, 255 & e.adler),
                          V(_, (e.adler >> 8) & 255),
                          V(_, (e.adler >> 16) & 255),
                          V(_, (e.adler >> 24) & 255),
                          V(_, 255 & e.total_in),
                          V(_, (e.total_in >> 8) & 255),
                          V(_, (e.total_in >> 16) & 255),
                          V(_, (e.total_in >> 24) & 255))
                        : (H(_, e.adler >>> 16), H(_, 65535 & e.adler)),
                      F(e),
                      0 < _.wrap && (_.wrap = -_.wrap),
                      _.pending !== 0 ? c : 1);
                }),
                (l.deflateEnd = function (e) {
                  var O;
                  return e && e.state
                    ? (O = e.state.status) !== y &&
                      O !== 69 &&
                      O !== 73 &&
                      O !== 91 &&
                      O !== 103 &&
                      O !== S &&
                      O !== 666
                      ? J(e, m)
                      : ((e.state = null), O === S ? J(e, -3) : c)
                    : m;
                }),
                (l.deflateSetDictionary = function (e, O) {
                  var R,
                    _,
                    p,
                    E,
                    M,
                    L,
                    z,
                    Y,
                    Z = O.length;
                  if (
                    !e ||
                    !e.state ||
                    (E = (R = e.state).wrap) === 2 ||
                    (E === 1 && R.status !== y) ||
                    R.lookahead
                  )
                    return m;
                  for (
                    E === 1 && (e.adler = o(e.adler, O, Z, 0)),
                      R.wrap = 0,
                      Z >= R.w_size &&
                        (E === 0 &&
                          (K(R.head),
                          (R.strstart = 0),
                          (R.block_start = 0),
                          (R.insert = 0)),
                        (Y = new s.Buf8(R.w_size)),
                        s.arraySet(Y, O, Z - R.w_size, R.w_size, 0),
                        (O = Y),
                        (Z = R.w_size)),
                      M = e.avail_in,
                      L = e.next_in,
                      z = e.input,
                      e.avail_in = Z,
                      e.next_in = 0,
                      e.input = O,
                      it(R);
                    R.lookahead >= D;

                  ) {
                    for (
                      _ = R.strstart, p = R.lookahead - (D - 1);
                      (R.ins_h =
                        ((R.ins_h << R.hash_shift) ^ R.window[_ + D - 1]) &
                        R.hash_mask),
                        (R.prev[_ & R.w_mask] = R.head[R.ins_h]),
                        (R.head[R.ins_h] = _),
                        _++,
                        --p;

                    );
                    (R.strstart = _), (R.lookahead = D - 1), it(R);
                  }
                  return (
                    (R.strstart += R.lookahead),
                    (R.block_start = R.strstart),
                    (R.insert = R.lookahead),
                    (R.lookahead = 0),
                    (R.match_length = R.prev_length = D - 1),
                    (R.match_available = 0),
                    (e.next_in = L),
                    (e.input = z),
                    (e.avail_in = M),
                    (R.wrap = E),
                    c
                  );
                }),
                (l.deflateInfo = "pako deflate (from Nodeca project)");
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
            function (t, h, l) {
              "use strict";
              h.exports = function () {
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
            function (t, h, l) {
              "use strict";
              h.exports = function (i, s) {
                var a,
                  o,
                  b,
                  g,
                  u,
                  v,
                  c,
                  m,
                  r,
                  f,
                  d,
                  w,
                  x,
                  C,
                  k,
                  P,
                  T,
                  U,
                  D,
                  I,
                  N,
                  y,
                  S,
                  n,
                  A;
                (a = i.state),
                  (o = i.next_in),
                  (n = i.input),
                  (b = o + (i.avail_in - 5)),
                  (g = i.next_out),
                  (A = i.output),
                  (u = g - (s - i.avail_out)),
                  (v = g + (i.avail_out - 257)),
                  (c = a.dmax),
                  (m = a.wsize),
                  (r = a.whave),
                  (f = a.wnext),
                  (d = a.window),
                  (w = a.hold),
                  (x = a.bits),
                  (C = a.lencode),
                  (k = a.distcode),
                  (P = (1 << a.lenbits) - 1),
                  (T = (1 << a.distbits) - 1);
                t: do {
                  x < 15 &&
                    ((w += n[o++] << x),
                    (x += 8),
                    (w += n[o++] << x),
                    (x += 8)),
                    (U = C[w & P]);
                  e: for (;;) {
                    if (
                      ((w >>>= D = U >>> 24),
                      (x -= D),
                      (D = (U >>> 16) & 255) === 0)
                    )
                      A[g++] = 65535 & U;
                    else {
                      if (!(16 & D)) {
                        if (!(64 & D)) {
                          U = C[(65535 & U) + (w & ((1 << D) - 1))];
                          continue e;
                        }
                        if (32 & D) {
                          a.mode = 12;
                          break t;
                        }
                        (i.msg = "invalid literal/length code"), (a.mode = 30);
                        break t;
                      }
                      (I = 65535 & U),
                        (D &= 15) &&
                          (x < D && ((w += n[o++] << x), (x += 8)),
                          (I += w & ((1 << D) - 1)),
                          (w >>>= D),
                          (x -= D)),
                        x < 15 &&
                          ((w += n[o++] << x),
                          (x += 8),
                          (w += n[o++] << x),
                          (x += 8)),
                        (U = k[w & T]);
                      n: for (;;) {
                        if (
                          ((w >>>= D = U >>> 24),
                          (x -= D),
                          !(16 & (D = (U >>> 16) & 255)))
                        ) {
                          if (!(64 & D)) {
                            U = k[(65535 & U) + (w & ((1 << D) - 1))];
                            continue n;
                          }
                          (i.msg = "invalid distance code"), (a.mode = 30);
                          break t;
                        }
                        if (
                          ((N = 65535 & U),
                          x < (D &= 15) &&
                            ((w += n[o++] << x),
                            (x += 8) < D && ((w += n[o++] << x), (x += 8))),
                          c < (N += w & ((1 << D) - 1)))
                        ) {
                          (i.msg = "invalid distance too far back"),
                            (a.mode = 30);
                          break t;
                        }
                        if (((w >>>= D), (x -= D), (D = g - u) < N)) {
                          if (r < (D = N - D) && a.sane) {
                            (i.msg = "invalid distance too far back"),
                              (a.mode = 30);
                            break t;
                          }
                          if (((S = d), (y = 0) === f)) {
                            if (((y += m - D), D < I)) {
                              for (I -= D; (A[g++] = d[y++]), --D; );
                              (y = g - N), (S = A);
                            }
                          } else if (f < D) {
                            if (((y += m + f - D), (D -= f) < I)) {
                              for (I -= D; (A[g++] = d[y++]), --D; );
                              if (((y = 0), f < I)) {
                                for (I -= D = f; (A[g++] = d[y++]), --D; );
                                (y = g - N), (S = A);
                              }
                            }
                          } else if (((y += f - D), D < I)) {
                            for (I -= D; (A[g++] = d[y++]), --D; );
                            (y = g - N), (S = A);
                          }
                          for (; 2 < I; )
                            (A[g++] = S[y++]),
                              (A[g++] = S[y++]),
                              (A[g++] = S[y++]),
                              (I -= 3);
                          I && ((A[g++] = S[y++]), 1 < I && (A[g++] = S[y++]));
                        } else {
                          for (
                            y = g - N;
                            (A[g++] = A[y++]),
                              (A[g++] = A[y++]),
                              (A[g++] = A[y++]),
                              2 < (I -= 3);

                          );
                          I && ((A[g++] = A[y++]), 1 < I && (A[g++] = A[y++]));
                        }
                        break;
                      }
                    }
                    break;
                  }
                } while (o < b && g < v);
                (o -= I = x >> 3),
                  (w &= (1 << (x -= I << 3)) - 1),
                  (i.next_in = o),
                  (i.next_out = g),
                  (i.avail_in = o < b ? b - o + 5 : 5 - (o - b)),
                  (i.avail_out = g < v ? v - g + 257 : 257 - (g - v)),
                  (a.hold = w),
                  (a.bits = x);
              };
            },
            {},
          ],
          49: [
            function (t, h, l) {
              "use strict";
              var i = t("../utils/common"),
                s = t("./adler32"),
                a = t("./crc32"),
                o = t("./inffast"),
                b = t("./inftrees"),
                g = 1,
                u = 2,
                v = 0,
                c = -2,
                m = 1,
                r = 852,
                f = 592;
              function d(y) {
                return (
                  ((y >>> 24) & 255) +
                  ((y >>> 8) & 65280) +
                  ((65280 & y) << 8) +
                  ((255 & y) << 24)
                );
              }
              function w() {
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
                  (this.lens = new i.Buf16(320)),
                  (this.work = new i.Buf16(288)),
                  (this.lendyn = null),
                  (this.distdyn = null),
                  (this.sane = 0),
                  (this.back = 0),
                  (this.was = 0);
              }
              function x(y) {
                var S;
                return y && y.state
                  ? ((S = y.state),
                    (y.total_in = y.total_out = S.total = 0),
                    (y.msg = ""),
                    S.wrap && (y.adler = 1 & S.wrap),
                    (S.mode = m),
                    (S.last = 0),
                    (S.havedict = 0),
                    (S.dmax = 32768),
                    (S.head = null),
                    (S.hold = 0),
                    (S.bits = 0),
                    (S.lencode = S.lendyn = new i.Buf32(r)),
                    (S.distcode = S.distdyn = new i.Buf32(f)),
                    (S.sane = 1),
                    (S.back = -1),
                    v)
                  : c;
              }
              function C(y) {
                var S;
                return y && y.state
                  ? (((S = y.state).wsize = 0),
                    (S.whave = 0),
                    (S.wnext = 0),
                    x(y))
                  : c;
              }
              function k(y, S) {
                var n, A;
                return y && y.state
                  ? ((A = y.state),
                    S < 0
                      ? ((n = 0), (S = -S))
                      : ((n = 1 + (S >> 4)), S < 48 && (S &= 15)),
                    S && (S < 8 || 15 < S)
                      ? c
                      : (A.window !== null &&
                          A.wbits !== S &&
                          (A.window = null),
                        (A.wrap = n),
                        (A.wbits = S),
                        C(y)))
                  : c;
              }
              function P(y, S) {
                var n, A;
                return y
                  ? ((A = new w()),
                    ((y.state = A).window = null),
                    (n = k(y, S)) !== v && (y.state = null),
                    n)
                  : c;
              }
              var T,
                U,
                D = !0;
              function I(y) {
                if (D) {
                  var S;
                  for (
                    T = new i.Buf32(512), U = new i.Buf32(32), S = 0;
                    S < 144;

                  )
                    y.lens[S++] = 8;
                  for (; S < 256; ) y.lens[S++] = 9;
                  for (; S < 280; ) y.lens[S++] = 7;
                  for (; S < 288; ) y.lens[S++] = 8;
                  for (
                    b(g, y.lens, 0, 288, T, 0, y.work, { bits: 9 }), S = 0;
                    S < 32;

                  )
                    y.lens[S++] = 5;
                  b(u, y.lens, 0, 32, U, 0, y.work, { bits: 5 }), (D = !1);
                }
                (y.lencode = T),
                  (y.lenbits = 9),
                  (y.distcode = U),
                  (y.distbits = 5);
              }
              function N(y, S, n, A) {
                var G,
                  B = y.state;
                return (
                  B.window === null &&
                    ((B.wsize = 1 << B.wbits),
                    (B.wnext = 0),
                    (B.whave = 0),
                    (B.window = new i.Buf8(B.wsize))),
                  A >= B.wsize
                    ? (i.arraySet(B.window, S, n - B.wsize, B.wsize, 0),
                      (B.wnext = 0),
                      (B.whave = B.wsize))
                    : (A < (G = B.wsize - B.wnext) && (G = A),
                      i.arraySet(B.window, S, n - A, G, B.wnext),
                      (A -= G)
                        ? (i.arraySet(B.window, S, n - A, A, 0),
                          (B.wnext = A),
                          (B.whave = B.wsize))
                        : ((B.wnext += G),
                          B.wnext === B.wsize && (B.wnext = 0),
                          B.whave < B.wsize && (B.whave += G))),
                  0
                );
              }
              (l.inflateReset = C),
                (l.inflateReset2 = k),
                (l.inflateResetKeep = x),
                (l.inflateInit = function (y) {
                  return P(y, 15);
                }),
                (l.inflateInit2 = P),
                (l.inflate = function (y, S) {
                  var n,
                    A,
                    G,
                    B,
                    J,
                    X,
                    K,
                    F,
                    $,
                    V,
                    H,
                    j,
                    it,
                    dt,
                    et,
                    rt,
                    nt,
                    ct,
                    pt,
                    gt,
                    e,
                    O,
                    R,
                    _,
                    p = 0,
                    E = new i.Buf8(4),
                    M = [
                      16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14,
                      1, 15,
                    ];
                  if (
                    !y ||
                    !y.state ||
                    !y.output ||
                    (!y.input && y.avail_in !== 0)
                  )
                    return c;
                  (n = y.state).mode === 12 && (n.mode = 13),
                    (J = y.next_out),
                    (G = y.output),
                    (K = y.avail_out),
                    (B = y.next_in),
                    (A = y.input),
                    (X = y.avail_in),
                    (F = n.hold),
                    ($ = n.bits),
                    (V = X),
                    (H = K),
                    (O = v);
                  t: for (;;)
                    switch (n.mode) {
                      case m:
                        if (n.wrap === 0) {
                          n.mode = 13;
                          break;
                        }
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (2 & n.wrap && F === 35615) {
                          (E[(n.check = 0)] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (n.check = a(n.check, E, 2, 0)),
                            ($ = F = 0),
                            (n.mode = 2);
                          break;
                        }
                        if (
                          ((n.flags = 0),
                          n.head && (n.head.done = !1),
                          !(1 & n.wrap) || (((255 & F) << 8) + (F >> 8)) % 31)
                        ) {
                          (y.msg = "incorrect header check"), (n.mode = 30);
                          break;
                        }
                        if ((15 & F) != 8) {
                          (y.msg = "unknown compression method"), (n.mode = 30);
                          break;
                        }
                        if (
                          (($ -= 4), (e = 8 + (15 & (F >>>= 4))), n.wbits === 0)
                        )
                          n.wbits = e;
                        else if (e > n.wbits) {
                          (y.msg = "invalid window size"), (n.mode = 30);
                          break;
                        }
                        (n.dmax = 1 << e),
                          (y.adler = n.check = 1),
                          (n.mode = 512 & F ? 10 : 12),
                          ($ = F = 0);
                        break;
                      case 2:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (((n.flags = F), (255 & n.flags) != 8)) {
                          (y.msg = "unknown compression method"), (n.mode = 30);
                          break;
                        }
                        if (57344 & n.flags) {
                          (y.msg = "unknown header flags set"), (n.mode = 30);
                          break;
                        }
                        n.head && (n.head.text = (F >> 8) & 1),
                          512 & n.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (n.check = a(n.check, E, 2, 0))),
                          ($ = F = 0),
                          (n.mode = 3);
                      case 3:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        n.head && (n.head.time = F),
                          512 & n.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (E[2] = (F >>> 16) & 255),
                            (E[3] = (F >>> 24) & 255),
                            (n.check = a(n.check, E, 4, 0))),
                          ($ = F = 0),
                          (n.mode = 4);
                      case 4:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        n.head &&
                          ((n.head.xflags = 255 & F), (n.head.os = F >> 8)),
                          512 & n.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (n.check = a(n.check, E, 2, 0))),
                          ($ = F = 0),
                          (n.mode = 5);
                      case 5:
                        if (1024 & n.flags) {
                          for (; $ < 16; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (n.length = F),
                            n.head && (n.head.extra_len = F),
                            512 & n.flags &&
                              ((E[0] = 255 & F),
                              (E[1] = (F >>> 8) & 255),
                              (n.check = a(n.check, E, 2, 0))),
                            ($ = F = 0);
                        } else n.head && (n.head.extra = null);
                        n.mode = 6;
                      case 6:
                        if (
                          1024 & n.flags &&
                          (X < (j = n.length) && (j = X),
                          j &&
                            (n.head &&
                              ((e = n.head.extra_len - n.length),
                              n.head.extra ||
                                (n.head.extra = new Array(n.head.extra_len)),
                              i.arraySet(n.head.extra, A, B, j, e)),
                            512 & n.flags && (n.check = a(n.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            (n.length -= j)),
                          n.length)
                        )
                          break t;
                        (n.length = 0), (n.mode = 7);
                      case 7:
                        if (2048 & n.flags) {
                          if (X === 0) break t;
                          for (
                            j = 0;
                            (e = A[B + j++]),
                              n.head &&
                                e &&
                                n.length < 65536 &&
                                (n.head.name += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & n.flags && (n.check = a(n.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            e)
                          )
                            break t;
                        } else n.head && (n.head.name = null);
                        (n.length = 0), (n.mode = 8);
                      case 8:
                        if (4096 & n.flags) {
                          if (X === 0) break t;
                          for (
                            j = 0;
                            (e = A[B + j++]),
                              n.head &&
                                e &&
                                n.length < 65536 &&
                                (n.head.comment += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & n.flags && (n.check = a(n.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            e)
                          )
                            break t;
                        } else n.head && (n.head.comment = null);
                        n.mode = 9;
                      case 9:
                        if (512 & n.flags) {
                          for (; $ < 16; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (F !== (65535 & n.check)) {
                            (y.msg = "header crc mismatch"), (n.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        n.head &&
                          ((n.head.hcrc = (n.flags >> 9) & 1),
                          (n.head.done = !0)),
                          (y.adler = n.check = 0),
                          (n.mode = 12);
                        break;
                      case 10:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        (y.adler = n.check = d(F)), ($ = F = 0), (n.mode = 11);
                      case 11:
                        if (n.havedict === 0)
                          return (
                            (y.next_out = J),
                            (y.avail_out = K),
                            (y.next_in = B),
                            (y.avail_in = X),
                            (n.hold = F),
                            (n.bits = $),
                            2
                          );
                        (y.adler = n.check = 1), (n.mode = 12);
                      case 12:
                        if (S === 5 || S === 6) break t;
                      case 13:
                        if (n.last) {
                          (F >>>= 7 & $), ($ -= 7 & $), (n.mode = 27);
                          break;
                        }
                        for (; $ < 3; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        switch (((n.last = 1 & F), ($ -= 1), 3 & (F >>>= 1))) {
                          case 0:
                            n.mode = 14;
                            break;
                          case 1:
                            if ((I(n), (n.mode = 20), S !== 6)) break;
                            (F >>>= 2), ($ -= 2);
                            break t;
                          case 2:
                            n.mode = 17;
                            break;
                          case 3:
                            (y.msg = "invalid block type"), (n.mode = 30);
                        }
                        (F >>>= 2), ($ -= 2);
                        break;
                      case 14:
                        for (F >>>= 7 & $, $ -= 7 & $; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if ((65535 & F) != ((F >>> 16) ^ 65535)) {
                          (y.msg = "invalid stored block lengths"),
                            (n.mode = 30);
                          break;
                        }
                        if (
                          ((n.length = 65535 & F),
                          ($ = F = 0),
                          (n.mode = 15),
                          S === 6)
                        )
                          break t;
                      case 15:
                        n.mode = 16;
                      case 16:
                        if ((j = n.length)) {
                          if ((X < j && (j = X), K < j && (j = K), j === 0))
                            break t;
                          i.arraySet(G, A, B, j, J),
                            (X -= j),
                            (B += j),
                            (K -= j),
                            (J += j),
                            (n.length -= j);
                          break;
                        }
                        n.mode = 12;
                        break;
                      case 17:
                        for (; $ < 14; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (
                          ((n.nlen = 257 + (31 & F)),
                          (F >>>= 5),
                          ($ -= 5),
                          (n.ndist = 1 + (31 & F)),
                          (F >>>= 5),
                          ($ -= 5),
                          (n.ncode = 4 + (15 & F)),
                          (F >>>= 4),
                          ($ -= 4),
                          286 < n.nlen || 30 < n.ndist)
                        ) {
                          (y.msg = "too many length or distance symbols"),
                            (n.mode = 30);
                          break;
                        }
                        (n.have = 0), (n.mode = 18);
                      case 18:
                        for (; n.have < n.ncode; ) {
                          for (; $ < 3; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (n.lens[M[n.have++]] = 7 & F), (F >>>= 3), ($ -= 3);
                        }
                        for (; n.have < 19; ) n.lens[M[n.have++]] = 0;
                        if (
                          ((n.lencode = n.lendyn),
                          (n.lenbits = 7),
                          (R = { bits: n.lenbits }),
                          (O = b(0, n.lens, 0, 19, n.lencode, 0, n.work, R)),
                          (n.lenbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid code lengths set"), (n.mode = 30);
                          break;
                        }
                        (n.have = 0), (n.mode = 19);
                      case 19:
                        for (; n.have < n.nlen + n.ndist; ) {
                          for (
                            ;
                            (rt =
                              ((p = n.lencode[F & ((1 << n.lenbits) - 1)]) >>>
                                16) &
                              255),
                              (nt = 65535 & p),
                              !((et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (nt < 16)
                            (F >>>= et), ($ -= et), (n.lens[n.have++] = nt);
                          else {
                            if (nt === 16) {
                              for (_ = et + 2; $ < _; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              if (((F >>>= et), ($ -= et), n.have === 0)) {
                                (y.msg = "invalid bit length repeat"),
                                  (n.mode = 30);
                                break;
                              }
                              (e = n.lens[n.have - 1]),
                                (j = 3 + (3 & F)),
                                (F >>>= 2),
                                ($ -= 2);
                            } else if (nt === 17) {
                              for (_ = et + 3; $ < _; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              ($ -= et),
                                (e = 0),
                                (j = 3 + (7 & (F >>>= et))),
                                (F >>>= 3),
                                ($ -= 3);
                            } else {
                              for (_ = et + 7; $ < _; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              ($ -= et),
                                (e = 0),
                                (j = 11 + (127 & (F >>>= et))),
                                (F >>>= 7),
                                ($ -= 7);
                            }
                            if (n.have + j > n.nlen + n.ndist) {
                              (y.msg = "invalid bit length repeat"),
                                (n.mode = 30);
                              break;
                            }
                            for (; j--; ) n.lens[n.have++] = e;
                          }
                        }
                        if (n.mode === 30) break;
                        if (n.lens[256] === 0) {
                          (y.msg = "invalid code -- missing end-of-block"),
                            (n.mode = 30);
                          break;
                        }
                        if (
                          ((n.lenbits = 9),
                          (R = { bits: n.lenbits }),
                          (O = b(
                            g,
                            n.lens,
                            0,
                            n.nlen,
                            n.lencode,
                            0,
                            n.work,
                            R,
                          )),
                          (n.lenbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid literal/lengths set"),
                            (n.mode = 30);
                          break;
                        }
                        if (
                          ((n.distbits = 6),
                          (n.distcode = n.distdyn),
                          (R = { bits: n.distbits }),
                          (O = b(
                            u,
                            n.lens,
                            n.nlen,
                            n.ndist,
                            n.distcode,
                            0,
                            n.work,
                            R,
                          )),
                          (n.distbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid distances set"), (n.mode = 30);
                          break;
                        }
                        if (((n.mode = 20), S === 6)) break t;
                      case 20:
                        n.mode = 21;
                      case 21:
                        if (6 <= X && 258 <= K) {
                          (y.next_out = J),
                            (y.avail_out = K),
                            (y.next_in = B),
                            (y.avail_in = X),
                            (n.hold = F),
                            (n.bits = $),
                            o(y, H),
                            (J = y.next_out),
                            (G = y.output),
                            (K = y.avail_out),
                            (B = y.next_in),
                            (A = y.input),
                            (X = y.avail_in),
                            (F = n.hold),
                            ($ = n.bits),
                            n.mode === 12 && (n.back = -1);
                          break;
                        }
                        for (
                          n.back = 0;
                          (rt =
                            ((p = n.lencode[F & ((1 << n.lenbits) - 1)]) >>>
                              16) &
                            255),
                            (nt = 65535 & p),
                            !((et = p >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (rt && !(240 & rt)) {
                          for (
                            ct = et, pt = rt, gt = nt;
                            (rt =
                              ((p =
                                n.lencode[
                                  gt + ((F & ((1 << (ct + pt)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (nt = 65535 & p),
                              !(ct + (et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (F >>>= ct), ($ -= ct), (n.back += ct);
                        }
                        if (
                          ((F >>>= et),
                          ($ -= et),
                          (n.back += et),
                          (n.length = nt),
                          rt === 0)
                        ) {
                          n.mode = 26;
                          break;
                        }
                        if (32 & rt) {
                          (n.back = -1), (n.mode = 12);
                          break;
                        }
                        if (64 & rt) {
                          (y.msg = "invalid literal/length code"),
                            (n.mode = 30);
                          break;
                        }
                        (n.extra = 15 & rt), (n.mode = 22);
                      case 22:
                        if (n.extra) {
                          for (_ = n.extra; $ < _; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (n.length += F & ((1 << n.extra) - 1)),
                            (F >>>= n.extra),
                            ($ -= n.extra),
                            (n.back += n.extra);
                        }
                        (n.was = n.length), (n.mode = 23);
                      case 23:
                        for (
                          ;
                          (rt =
                            ((p = n.distcode[F & ((1 << n.distbits) - 1)]) >>>
                              16) &
                            255),
                            (nt = 65535 & p),
                            !((et = p >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (!(240 & rt)) {
                          for (
                            ct = et, pt = rt, gt = nt;
                            (rt =
                              ((p =
                                n.distcode[
                                  gt + ((F & ((1 << (ct + pt)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (nt = 65535 & p),
                              !(ct + (et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (F >>>= ct), ($ -= ct), (n.back += ct);
                        }
                        if (((F >>>= et), ($ -= et), (n.back += et), 64 & rt)) {
                          (y.msg = "invalid distance code"), (n.mode = 30);
                          break;
                        }
                        (n.offset = nt), (n.extra = 15 & rt), (n.mode = 24);
                      case 24:
                        if (n.extra) {
                          for (_ = n.extra; $ < _; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (n.offset += F & ((1 << n.extra) - 1)),
                            (F >>>= n.extra),
                            ($ -= n.extra),
                            (n.back += n.extra);
                        }
                        if (n.offset > n.dmax) {
                          (y.msg = "invalid distance too far back"),
                            (n.mode = 30);
                          break;
                        }
                        n.mode = 25;
                      case 25:
                        if (K === 0) break t;
                        if (((j = H - K), n.offset > j)) {
                          if ((j = n.offset - j) > n.whave && n.sane) {
                            (y.msg = "invalid distance too far back"),
                              (n.mode = 30);
                            break;
                          }
                          (it =
                            j > n.wnext
                              ? ((j -= n.wnext), n.wsize - j)
                              : n.wnext - j),
                            j > n.length && (j = n.length),
                            (dt = n.window);
                        } else (dt = G), (it = J - n.offset), (j = n.length);
                        for (
                          K < j && (j = K), K -= j, n.length -= j;
                          (G[J++] = dt[it++]), --j;

                        );
                        n.length === 0 && (n.mode = 21);
                        break;
                      case 26:
                        if (K === 0) break t;
                        (G[J++] = n.length), K--, (n.mode = 21);
                        break;
                      case 27:
                        if (n.wrap) {
                          for (; $ < 32; ) {
                            if (X === 0) break t;
                            X--, (F |= A[B++] << $), ($ += 8);
                          }
                          if (
                            ((H -= K),
                            (y.total_out += H),
                            (n.total += H),
                            H &&
                              (y.adler = n.check =
                                n.flags
                                  ? a(n.check, G, H, J - H)
                                  : s(n.check, G, H, J - H)),
                            (H = K),
                            (n.flags ? F : d(F)) !== n.check)
                          ) {
                            (y.msg = "incorrect data check"), (n.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        n.mode = 28;
                      case 28:
                        if (n.wrap && n.flags) {
                          for (; $ < 32; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (F !== (4294967295 & n.total)) {
                            (y.msg = "incorrect length check"), (n.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        n.mode = 29;
                      case 29:
                        O = 1;
                        break t;
                      case 30:
                        O = -3;
                        break t;
                      case 31:
                        return -4;
                      case 32:
                      default:
                        return c;
                    }
                  return (
                    (y.next_out = J),
                    (y.avail_out = K),
                    (y.next_in = B),
                    (y.avail_in = X),
                    (n.hold = F),
                    (n.bits = $),
                    (n.wsize ||
                      (H !== y.avail_out &&
                        n.mode < 30 &&
                        (n.mode < 27 || S !== 4))) &&
                    N(y, y.output, y.next_out, H - y.avail_out)
                      ? ((n.mode = 31), -4)
                      : ((V -= y.avail_in),
                        (H -= y.avail_out),
                        (y.total_in += V),
                        (y.total_out += H),
                        (n.total += H),
                        n.wrap &&
                          H &&
                          (y.adler = n.check =
                            n.flags
                              ? a(n.check, G, H, y.next_out - H)
                              : s(n.check, G, H, y.next_out - H)),
                        (y.data_type =
                          n.bits +
                          (n.last ? 64 : 0) +
                          (n.mode === 12 ? 128 : 0) +
                          (n.mode === 20 || n.mode === 15 ? 256 : 0)),
                        ((V == 0 && H === 0) || S === 4) && O === v && (O = -5),
                        O)
                  );
                }),
                (l.inflateEnd = function (y) {
                  if (!y || !y.state) return c;
                  var S = y.state;
                  return S.window && (S.window = null), (y.state = null), v;
                }),
                (l.inflateGetHeader = function (y, S) {
                  var n;
                  return y && y.state && 2 & (n = y.state).wrap
                    ? (((n.head = S).done = !1), v)
                    : c;
                }),
                (l.inflateSetDictionary = function (y, S) {
                  var n,
                    A = S.length;
                  return y && y.state
                    ? (n = y.state).wrap !== 0 && n.mode !== 11
                      ? c
                      : n.mode === 11 && s(1, S, A, 0) !== n.check
                      ? -3
                      : N(y, S, A, A)
                      ? ((n.mode = 31), -4)
                      : ((n.havedict = 1), v)
                    : c;
                }),
                (l.inflateInfo = "pako inflate (from Nodeca project)");
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
            function (t, h, l) {
              "use strict";
              var i = t("../utils/common"),
                s = [
                  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35,
                  43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
                ],
                a = [
                  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18,
                  18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72,
                  78,
                ],
                o = [
                  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
                  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193,
                  12289, 16385, 24577, 0, 0,
                ],
                b = [
                  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22,
                  22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29,
                  64, 64,
                ];
              h.exports = function (g, u, v, c, m, r, f, d) {
                var w,
                  x,
                  C,
                  k,
                  P,
                  T,
                  U,
                  D,
                  I,
                  N = d.bits,
                  y = 0,
                  S = 0,
                  n = 0,
                  A = 0,
                  G = 0,
                  B = 0,
                  J = 0,
                  X = 0,
                  K = 0,
                  F = 0,
                  $ = null,
                  V = 0,
                  H = new i.Buf16(16),
                  j = new i.Buf16(16),
                  it = null,
                  dt = 0;
                for (y = 0; y <= 15; y++) H[y] = 0;
                for (S = 0; S < c; S++) H[u[v + S]]++;
                for (G = N, A = 15; 1 <= A && H[A] === 0; A--);
                if ((A < G && (G = A), A === 0))
                  return (
                    (m[r++] = 20971520), (m[r++] = 20971520), (d.bits = 1), 0
                  );
                for (n = 1; n < A && H[n] === 0; n++);
                for (G < n && (G = n), y = X = 1; y <= 15; y++)
                  if (((X <<= 1), (X -= H[y]) < 0)) return -1;
                if (0 < X && (g === 0 || A !== 1)) return -1;
                for (j[1] = 0, y = 1; y < 15; y++) j[y + 1] = j[y] + H[y];
                for (S = 0; S < c; S++)
                  u[v + S] !== 0 && (f[j[u[v + S]]++] = S);
                if (
                  ((T =
                    g === 0
                      ? (($ = it = f), 19)
                      : g === 1
                      ? (($ = s), (V -= 257), (it = a), (dt -= 257), 256)
                      : (($ = o), (it = b), -1)),
                  (y = n),
                  (P = r),
                  (J = S = F = 0),
                  (C = -1),
                  (k = (K = 1 << (B = G)) - 1),
                  (g === 1 && 852 < K) || (g === 2 && 592 < K))
                )
                  return 1;
                for (;;) {
                  for (
                    U = y - J,
                      I =
                        f[S] < T
                          ? ((D = 0), f[S])
                          : f[S] > T
                          ? ((D = it[dt + f[S]]), $[V + f[S]])
                          : ((D = 96), 0),
                      w = 1 << (y - J),
                      n = x = 1 << B;
                    (m[P + (F >> J) + (x -= w)] =
                      (U << 24) | (D << 16) | I | 0),
                      x !== 0;

                  );
                  for (w = 1 << (y - 1); F & w; ) w >>= 1;
                  if (
                    (w !== 0 ? ((F &= w - 1), (F += w)) : (F = 0),
                    S++,
                    --H[y] == 0)
                  ) {
                    if (y === A) break;
                    y = u[v + f[S]];
                  }
                  if (G < y && (F & k) !== C) {
                    for (
                      J === 0 && (J = G), P += n, X = 1 << (B = y - J);
                      B + J < A && !((X -= H[B + J]) <= 0);

                    )
                      B++, (X <<= 1);
                    if (
                      ((K += 1 << B),
                      (g === 1 && 852 < K) || (g === 2 && 592 < K))
                    )
                      return 1;
                    m[(C = F & k)] = (G << 24) | (B << 16) | (P - r) | 0;
                  }
                }
                return (
                  F !== 0 && (m[P + F] = ((y - J) << 24) | (64 << 16) | 0),
                  (d.bits = G),
                  0
                );
              };
            },
            { "../utils/common": 41 },
          ],
          51: [
            function (t, h, l) {
              "use strict";
              h.exports = {
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
            function (t, h, l) {
              "use strict";
              var i = t("../utils/common"),
                s = 0,
                a = 1;
              function o(p) {
                for (var E = p.length; 0 <= --E; ) p[E] = 0;
              }
              var b = 0,
                g = 29,
                u = 256,
                v = u + 1 + g,
                c = 30,
                m = 19,
                r = 2 * v + 1,
                f = 15,
                d = 16,
                w = 7,
                x = 256,
                C = 16,
                k = 17,
                P = 18,
                T = [
                  0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4,
                  4, 4, 4, 5, 5, 5, 5, 0,
                ],
                U = [
                  0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9,
                  9, 10, 10, 11, 11, 12, 12, 13, 13,
                ],
                D = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
                I = [
                  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
                  15,
                ],
                N = new Array(2 * (v + 2));
              o(N);
              var y = new Array(2 * c);
              o(y);
              var S = new Array(512);
              o(S);
              var n = new Array(256);
              o(n);
              var A = new Array(g);
              o(A);
              var G,
                B,
                J,
                X = new Array(c);
              function K(p, E, M, L, z) {
                (this.static_tree = p),
                  (this.extra_bits = E),
                  (this.extra_base = M),
                  (this.elems = L),
                  (this.max_length = z),
                  (this.has_stree = p && p.length);
              }
              function F(p, E) {
                (this.dyn_tree = p), (this.max_code = 0), (this.stat_desc = E);
              }
              function $(p) {
                return p < 256 ? S[p] : S[256 + (p >>> 7)];
              }
              function V(p, E) {
                (p.pending_buf[p.pending++] = 255 & E),
                  (p.pending_buf[p.pending++] = (E >>> 8) & 255);
              }
              function H(p, E, M) {
                p.bi_valid > d - M
                  ? ((p.bi_buf |= (E << p.bi_valid) & 65535),
                    V(p, p.bi_buf),
                    (p.bi_buf = E >> (d - p.bi_valid)),
                    (p.bi_valid += M - d))
                  : ((p.bi_buf |= (E << p.bi_valid) & 65535),
                    (p.bi_valid += M));
              }
              function j(p, E, M) {
                H(p, M[2 * E], M[2 * E + 1]);
              }
              function it(p, E) {
                for (var M = 0; (M |= 1 & p), (p >>>= 1), (M <<= 1), 0 < --E; );
                return M >>> 1;
              }
              function dt(p, E, M) {
                var L,
                  z,
                  Y = new Array(f + 1),
                  Z = 0;
                for (L = 1; L <= f; L++) Y[L] = Z = (Z + M[L - 1]) << 1;
                for (z = 0; z <= E; z++) {
                  var W = p[2 * z + 1];
                  W !== 0 && (p[2 * z] = it(Y[W]++, W));
                }
              }
              function et(p) {
                var E;
                for (E = 0; E < v; E++) p.dyn_ltree[2 * E] = 0;
                for (E = 0; E < c; E++) p.dyn_dtree[2 * E] = 0;
                for (E = 0; E < m; E++) p.bl_tree[2 * E] = 0;
                (p.dyn_ltree[2 * x] = 1),
                  (p.opt_len = p.static_len = 0),
                  (p.last_lit = p.matches = 0);
              }
              function rt(p) {
                8 < p.bi_valid
                  ? V(p, p.bi_buf)
                  : 0 < p.bi_valid && (p.pending_buf[p.pending++] = p.bi_buf),
                  (p.bi_buf = 0),
                  (p.bi_valid = 0);
              }
              function nt(p, E, M, L) {
                var z = 2 * E,
                  Y = 2 * M;
                return p[z] < p[Y] || (p[z] === p[Y] && L[E] <= L[M]);
              }
              function ct(p, E, M) {
                for (
                  var L = p.heap[M], z = M << 1;
                  z <= p.heap_len &&
                  (z < p.heap_len &&
                    nt(E, p.heap[z + 1], p.heap[z], p.depth) &&
                    z++,
                  !nt(E, L, p.heap[z], p.depth));

                )
                  (p.heap[M] = p.heap[z]), (M = z), (z <<= 1);
                p.heap[M] = L;
              }
              function pt(p, E, M) {
                var L,
                  z,
                  Y,
                  Z,
                  W = 0;
                if (p.last_lit !== 0)
                  for (
                    ;
                    (L =
                      (p.pending_buf[p.d_buf + 2 * W] << 8) |
                      p.pending_buf[p.d_buf + 2 * W + 1]),
                      (z = p.pending_buf[p.l_buf + W]),
                      W++,
                      L === 0
                        ? j(p, z, E)
                        : (j(p, (Y = n[z]) + u + 1, E),
                          (Z = T[Y]) !== 0 && H(p, (z -= A[Y]), Z),
                          j(p, (Y = $(--L)), M),
                          (Z = U[Y]) !== 0 && H(p, (L -= X[Y]), Z)),
                      W < p.last_lit;

                  );
                j(p, x, E);
              }
              function gt(p, E) {
                var M,
                  L,
                  z,
                  Y = E.dyn_tree,
                  Z = E.stat_desc.static_tree,
                  W = E.stat_desc.has_stree,
                  Q = E.stat_desc.elems,
                  at = -1;
                for (p.heap_len = 0, p.heap_max = r, M = 0; M < Q; M++)
                  Y[2 * M] !== 0
                    ? ((p.heap[++p.heap_len] = at = M), (p.depth[M] = 0))
                    : (Y[2 * M + 1] = 0);
                for (; p.heap_len < 2; )
                  (Y[2 * (z = p.heap[++p.heap_len] = at < 2 ? ++at : 0)] = 1),
                    (p.depth[z] = 0),
                    p.opt_len--,
                    W && (p.static_len -= Z[2 * z + 1]);
                for (E.max_code = at, M = p.heap_len >> 1; 1 <= M; M--)
                  ct(p, Y, M);
                for (
                  z = Q;
                  (M = p.heap[1]),
                    (p.heap[1] = p.heap[p.heap_len--]),
                    ct(p, Y, 1),
                    (L = p.heap[1]),
                    (p.heap[--p.heap_max] = M),
                    (p.heap[--p.heap_max] = L),
                    (Y[2 * z] = Y[2 * M] + Y[2 * L]),
                    (p.depth[z] =
                      (p.depth[M] >= p.depth[L] ? p.depth[M] : p.depth[L]) + 1),
                    (Y[2 * M + 1] = Y[2 * L + 1] = z),
                    (p.heap[1] = z++),
                    ct(p, Y, 1),
                    2 <= p.heap_len;

                );
                (p.heap[--p.heap_max] = p.heap[1]),
                  (function (st, wt) {
                    var zt,
                      kt,
                      Ot,
                      q,
                      ot,
                      lt,
                      ut = wt.dyn_tree,
                      xt = wt.max_code,
                      Pt = wt.stat_desc.static_tree,
                      Tt = wt.stat_desc.has_stree,
                      St = wt.stat_desc.extra_bits,
                      $t = wt.stat_desc.extra_base,
                      At = wt.stat_desc.max_length,
                      Xt = 0;
                    for (q = 0; q <= f; q++) st.bl_count[q] = 0;
                    for (
                      ut[2 * st.heap[st.heap_max] + 1] = 0,
                        zt = st.heap_max + 1;
                      zt < r;
                      zt++
                    )
                      At <
                        (q = ut[2 * ut[2 * (kt = st.heap[zt]) + 1] + 1] + 1) &&
                        ((q = At), Xt++),
                        (ut[2 * kt + 1] = q),
                        xt < kt ||
                          (st.bl_count[q]++,
                          (ot = 0),
                          $t <= kt && (ot = St[kt - $t]),
                          (lt = ut[2 * kt]),
                          (st.opt_len += lt * (q + ot)),
                          Tt && (st.static_len += lt * (Pt[2 * kt + 1] + ot)));
                    if (Xt !== 0) {
                      do {
                        for (q = At - 1; st.bl_count[q] === 0; ) q--;
                        st.bl_count[q]--,
                          (st.bl_count[q + 1] += 2),
                          st.bl_count[At]--,
                          (Xt -= 2);
                      } while (0 < Xt);
                      for (q = At; q !== 0; q--)
                        for (kt = st.bl_count[q]; kt !== 0; )
                          xt < (Ot = st.heap[--zt]) ||
                            (ut[2 * Ot + 1] !== q &&
                              ((st.opt_len +=
                                (q - ut[2 * Ot + 1]) * ut[2 * Ot]),
                              (ut[2 * Ot + 1] = q)),
                            kt--);
                    }
                  })(p, E),
                  dt(Y, at, p.bl_count);
              }
              function e(p, E, M) {
                var L,
                  z,
                  Y = -1,
                  Z = E[1],
                  W = 0,
                  Q = 7,
                  at = 4;
                for (
                  Z === 0 && ((Q = 138), (at = 3)),
                    E[2 * (M + 1) + 1] = 65535,
                    L = 0;
                  L <= M;
                  L++
                )
                  (z = Z),
                    (Z = E[2 * (L + 1) + 1]),
                    (++W < Q && z === Z) ||
                      (W < at
                        ? (p.bl_tree[2 * z] += W)
                        : z !== 0
                        ? (z !== Y && p.bl_tree[2 * z]++, p.bl_tree[2 * C]++)
                        : W <= 10
                        ? p.bl_tree[2 * k]++
                        : p.bl_tree[2 * P]++,
                      (Y = z),
                      (at =
                        (W = 0) === Z
                          ? ((Q = 138), 3)
                          : z === Z
                          ? ((Q = 6), 3)
                          : ((Q = 7), 4)));
              }
              function O(p, E, M) {
                var L,
                  z,
                  Y = -1,
                  Z = E[1],
                  W = 0,
                  Q = 7,
                  at = 4;
                for (Z === 0 && ((Q = 138), (at = 3)), L = 0; L <= M; L++)
                  if (
                    ((z = Z), (Z = E[2 * (L + 1) + 1]), !(++W < Q && z === Z))
                  ) {
                    if (W < at) for (; j(p, z, p.bl_tree), --W != 0; );
                    else
                      z !== 0
                        ? (z !== Y && (j(p, z, p.bl_tree), W--),
                          j(p, C, p.bl_tree),
                          H(p, W - 3, 2))
                        : W <= 10
                        ? (j(p, k, p.bl_tree), H(p, W - 3, 3))
                        : (j(p, P, p.bl_tree), H(p, W - 11, 7));
                    (Y = z),
                      (at =
                        (W = 0) === Z
                          ? ((Q = 138), 3)
                          : z === Z
                          ? ((Q = 6), 3)
                          : ((Q = 7), 4));
                  }
              }
              o(X);
              var R = !1;
              function _(p, E, M, L) {
                H(p, (b << 1) + (L ? 1 : 0), 3),
                  (function (z, Y, Z, W) {
                    rt(z),
                      W && (V(z, Z), V(z, ~Z)),
                      i.arraySet(z.pending_buf, z.window, Y, Z, z.pending),
                      (z.pending += Z);
                  })(p, E, M, !0);
              }
              (l._tr_init = function (p) {
                R ||
                  ((function () {
                    var E,
                      M,
                      L,
                      z,
                      Y,
                      Z = new Array(f + 1);
                    for (z = L = 0; z < g - 1; z++)
                      for (A[z] = L, E = 0; E < 1 << T[z]; E++) n[L++] = z;
                    for (n[L - 1] = z, z = Y = 0; z < 16; z++)
                      for (X[z] = Y, E = 0; E < 1 << U[z]; E++) S[Y++] = z;
                    for (Y >>= 7; z < c; z++)
                      for (X[z] = Y << 7, E = 0; E < 1 << (U[z] - 7); E++)
                        S[256 + Y++] = z;
                    for (M = 0; M <= f; M++) Z[M] = 0;
                    for (E = 0; E <= 143; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (; E <= 255; ) (N[2 * E + 1] = 9), E++, Z[9]++;
                    for (; E <= 279; ) (N[2 * E + 1] = 7), E++, Z[7]++;
                    for (; E <= 287; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (dt(N, v + 1, Z), E = 0; E < c; E++)
                      (y[2 * E + 1] = 5), (y[2 * E] = it(E, 5));
                    (G = new K(N, T, u + 1, v, f)),
                      (B = new K(y, U, 0, c, f)),
                      (J = new K(new Array(0), D, 0, m, w));
                  })(),
                  (R = !0)),
                  (p.l_desc = new F(p.dyn_ltree, G)),
                  (p.d_desc = new F(p.dyn_dtree, B)),
                  (p.bl_desc = new F(p.bl_tree, J)),
                  (p.bi_buf = 0),
                  (p.bi_valid = 0),
                  et(p);
              }),
                (l._tr_stored_block = _),
                (l._tr_flush_block = function (p, E, M, L) {
                  var z,
                    Y,
                    Z = 0;
                  0 < p.level
                    ? (p.strm.data_type === 2 &&
                        (p.strm.data_type = (function (W) {
                          var Q,
                            at = 4093624447;
                          for (Q = 0; Q <= 31; Q++, at >>>= 1)
                            if (1 & at && W.dyn_ltree[2 * Q] !== 0) return s;
                          if (
                            W.dyn_ltree[18] !== 0 ||
                            W.dyn_ltree[20] !== 0 ||
                            W.dyn_ltree[26] !== 0
                          )
                            return a;
                          for (Q = 32; Q < u; Q++)
                            if (W.dyn_ltree[2 * Q] !== 0) return a;
                          return s;
                        })(p)),
                      gt(p, p.l_desc),
                      gt(p, p.d_desc),
                      (Z = (function (W) {
                        var Q;
                        for (
                          e(W, W.dyn_ltree, W.l_desc.max_code),
                            e(W, W.dyn_dtree, W.d_desc.max_code),
                            gt(W, W.bl_desc),
                            Q = m - 1;
                          3 <= Q && W.bl_tree[2 * I[Q] + 1] === 0;
                          Q--
                        );
                        return (W.opt_len += 3 * (Q + 1) + 5 + 5 + 4), Q;
                      })(p)),
                      (z = (p.opt_len + 3 + 7) >>> 3),
                      (Y = (p.static_len + 3 + 7) >>> 3) <= z && (z = Y))
                    : (z = Y = M + 5),
                    M + 4 <= z && E !== -1
                      ? _(p, E, M, L)
                      : p.strategy === 4 || Y === z
                      ? (H(p, 2 + (L ? 1 : 0), 3), pt(p, N, y))
                      : (H(p, 4 + (L ? 1 : 0), 3),
                        (function (W, Q, at, st) {
                          var wt;
                          for (
                            H(W, Q - 257, 5),
                              H(W, at - 1, 5),
                              H(W, st - 4, 4),
                              wt = 0;
                            wt < st;
                            wt++
                          )
                            H(W, W.bl_tree[2 * I[wt] + 1], 3);
                          O(W, W.dyn_ltree, Q - 1), O(W, W.dyn_dtree, at - 1);
                        })(
                          p,
                          p.l_desc.max_code + 1,
                          p.d_desc.max_code + 1,
                          Z + 1,
                        ),
                        pt(p, p.dyn_ltree, p.dyn_dtree)),
                    et(p),
                    L && rt(p);
                }),
                (l._tr_tally = function (p, E, M) {
                  return (
                    (p.pending_buf[p.d_buf + 2 * p.last_lit] = (E >>> 8) & 255),
                    (p.pending_buf[p.d_buf + 2 * p.last_lit + 1] = 255 & E),
                    (p.pending_buf[p.l_buf + p.last_lit] = 255 & M),
                    p.last_lit++,
                    E === 0
                      ? p.dyn_ltree[2 * M]++
                      : (p.matches++,
                        E--,
                        p.dyn_ltree[2 * (n[M] + u + 1)]++,
                        p.dyn_dtree[2 * $(E)]++),
                    p.last_lit === p.lit_bufsize - 1
                  );
                }),
                (l._tr_align = function (p) {
                  H(p, 2, 3),
                    j(p, x, N),
                    (function (E) {
                      E.bi_valid === 16
                        ? (V(E, E.bi_buf), (E.bi_buf = 0), (E.bi_valid = 0))
                        : 8 <= E.bi_valid &&
                          ((E.pending_buf[E.pending++] = 255 & E.bi_buf),
                          (E.bi_buf >>= 8),
                          (E.bi_valid -= 8));
                    })(p);
                });
            },
            { "../utils/common": 41 },
          ],
          53: [
            function (t, h, l) {
              "use strict";
              h.exports = function () {
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
            function (t, h, l) {
              (function (i) {
                (function (s, a) {
                  "use strict";
                  if (!s.setImmediate) {
                    var o,
                      b,
                      g,
                      u,
                      v = 1,
                      c = {},
                      m = !1,
                      r = s.document,
                      f = Object.getPrototypeOf && Object.getPrototypeOf(s);
                    (f = f && f.setTimeout ? f : s),
                      (o =
                        {}.toString.call(s.process) === "[object process]"
                          ? function (C) {
                              process.nextTick(function () {
                                w(C);
                              });
                            }
                          : (function () {
                              if (s.postMessage && !s.importScripts) {
                                var C = !0,
                                  k = s.onmessage;
                                return (
                                  (s.onmessage = function () {
                                    C = !1;
                                  }),
                                  s.postMessage("", "*"),
                                  (s.onmessage = k),
                                  C
                                );
                              }
                            })()
                          ? ((u = "setImmediate$" + Math.random() + "$"),
                            s.addEventListener
                              ? s.addEventListener("message", x, !1)
                              : s.attachEvent("onmessage", x),
                            function (C) {
                              s.postMessage(u + C, "*");
                            })
                          : s.MessageChannel
                          ? (((g = new MessageChannel()).port1.onmessage =
                              function (C) {
                                w(C.data);
                              }),
                            function (C) {
                              g.port2.postMessage(C);
                            })
                          : r &&
                            "onreadystatechange" in r.createElement("script")
                          ? ((b = r.documentElement),
                            function (C) {
                              var k = r.createElement("script");
                              (k.onreadystatechange = function () {
                                w(C),
                                  (k.onreadystatechange = null),
                                  b.removeChild(k),
                                  (k = null);
                              }),
                                b.appendChild(k);
                            })
                          : function (C) {
                              setTimeout(w, 0, C);
                            }),
                      (f.setImmediate = function (C) {
                        typeof C != "function" && (C = new Function("" + C));
                        for (
                          var k = new Array(arguments.length - 1), P = 0;
                          P < k.length;
                          P++
                        )
                          k[P] = arguments[P + 1];
                        var T = { callback: C, args: k };
                        return (c[v] = T), o(v), v++;
                      }),
                      (f.clearImmediate = d);
                  }
                  function d(C) {
                    delete c[C];
                  }
                  function w(C) {
                    if (m) setTimeout(w, 0, C);
                    else {
                      var k = c[C];
                      if (k) {
                        m = !0;
                        try {
                          (function (P) {
                            var T = P.callback,
                              U = P.args;
                            switch (U.length) {
                              case 0:
                                T();
                                break;
                              case 1:
                                T(U[0]);
                                break;
                              case 2:
                                T(U[0], U[1]);
                                break;
                              case 3:
                                T(U[0], U[1], U[2]);
                                break;
                              default:
                                T.apply(a, U);
                            }
                          })(k);
                        } finally {
                          d(C), (m = !1);
                        }
                      }
                    }
                  }
                  function x(C) {
                    C.source === s &&
                      typeof C.data == "string" &&
                      C.data.indexOf(u) === 0 &&
                      w(+C.data.slice(u.length));
                  }
                })(typeof self > "u" ? (i === void 0 ? this : i) : self);
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
  var Qt = Me(ae());
  var oe = (t) =>
      Array.isArray(t) &&
      t.length === 2 &&
      typeof t[0] == "number" &&
      typeof t[1] == "number",
    ce = (t, h, l) => {
      let i = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (i == 0) return [0, 0];
      let a = Math.atan2(i / h, l) * (180 / Math.PI);
      return [(t[0] * a) / i, (t[1] * a) / i];
    },
    le = (t, h, l) => {
      let i = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (i >= 90) {
        let a = 89.99999999 / i;
        return le([t[0] * a, t[1] * a], h, l);
      }
      let s = h * l * Math.tan((i * Math.PI) / 180);
      return i == 0 ? [0, 0] : [(t[0] * s) / i, (t[1] * s) / i];
    },
    ue = (t) => {
      let h = ce(
        [
          t.fixationXYPx[0] - t.nearestPointXYZPx[0],
          t.fixationXYPx[1] - t.nearestPointXYZPx[1],
        ],
        t.pxPerCm,
        t.viewingDistanceCm,
      );
      return [-h[0], -h[1]];
    },
    mt = (t, h) => {
      let l = ue(h),
        i = (s) => {
          let a = [s[0] - l[0], s[1] - l[1]],
            o = le(a, h.pxPerCm, h.viewingDistanceCm);
          return [o[0] + h.nearestPointXYZPx[0], o[1] + h.nearestPointXYZPx[1]];
        };
      return oe(t) ? i(t) : t.map(i);
    },
    bt = (t, h) => {
      let l = ue(h),
        i = (s) => {
          let a = [
              s[0] - h.nearestPointXYZPx[0],
              s[1] - h.nearestPointXYZPx[1],
            ],
            o = ce(a, h.pxPerCm, h.viewingDistanceCm);
          return [o[0] + l[0], o[1] + l[1]];
        };
      return oe(t) ? i(t) : t.map(i);
    };
  var Ut = (t) => {
      t.charCodeAt(0) === 65279 && (t = t.slice(1));
      let h = [],
        l = [],
        i = "",
        s = !1,
        a = () => {
          l.push(i.trim()), (i = "");
        },
        o = () => {
          (l.length > 1 || l[0] !== "") && h.push(l), (l = []);
        };
      for (let b = 0; b < t.length; b++) {
        let g = t[b];
        s
          ? g === '"'
            ? t[b + 1] === '"'
              ? ((i += '"'), b++)
              : (s = !1)
            : (i += g)
          : g === '"'
          ? (s = !0)
          : g === ","
          ? a()
          : g ===
              `
` || g === "\r"
          ? (g === "\r" &&
              t[b + 1] ===
                `
` &&
              b++,
            a(),
            o())
          : (i += g);
      }
      return a(), o(), { header: h[0] ?? [], rows: h.slice(1) };
    },
    yt = (t) => {
      if (t === void 0) return;
      let h = Number(t);
      return Number.isFinite(h) ? h : void 0;
    },
    de = (t) => {
      let h = t.match(/(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!h) return;
      let l = Number(h[1]),
        i = Number(h[2]);
      return Number.isFinite(l) && Number.isFinite(i) ? [l, i] : void 0;
    },
    Ue = (t) => {
      let h = t.match(
        /\[\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*,\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\]/,
      );
      if (!h) return;
      let l = h.slice(1).map(Number);
      return l.every(Number.isFinite)
        ? [
            [l[0], l[1]],
            [l[2], l[3]],
          ]
        : void 0;
    },
    Xe = (t, h, l) => [t[0] - h / 2, l / 2 - t[1]],
    fe = (t, h, l = [], i = !1) => {
      let s = [
          [-h.screenW / 2, -h.screenH / 2],
          [h.screenW / 2, h.screenH / 2],
        ],
        a = i ? 3 : 2,
        o = (r) => ({
          pxPerCm: h.pxPerCm,
          viewingDistanceCm: i ? r[2] : h.viewingDistanceCm,
          fixationXYPx: h.fixationXYPx ?? [0, 0],
          nearestPointXYZPx: [r[0], r[1]],
        }),
        b = (r) => {
          let f = 0;
          for (let d = 0; d < 2; d++) {
            let w = bt(s[d], o(r)),
              x = w[0] - t[d][0],
              C = w[1] - t[d][1];
            f += x * x + C * C;
          }
          return Math.sqrt(f);
        },
        g = (r) => (i ? [...r, h.viewingDistanceCm] : [...r]),
        u = [
          ...l.map((r) => g([...r])),
          g([0, 0]),
          g([h.screenW / 2, h.screenH / 2]),
          g([h.screenW / 4, h.screenH / 4]),
        ],
        v = u[0],
        c = b(v);
      for (let r of u.slice(1)) {
        let f = b(r);
        f < c && ((c = f), (v = r));
      }
      let m = Math.max(h.screenW, h.screenH) / 8;
      for (; m >= 0.25; ) {
        let r = !0;
        for (; r; ) {
          r = !1;
          for (let f = 0; f < a; f++)
            for (let d of [1, -1]) {
              let w = [...v];
              w[f] += d * m;
              let x = b(w);
              x < c - 1e-12 && ((c = x), (v = w), (r = !0));
            }
        }
        m /= 2;
      }
      return {
        nearest: [v[0], v[1]],
        viewingDistanceCm: v[2] ?? h.viewingDistanceCm,
        residualDeg: c,
      };
    },
    Vt = 0.15,
    Yt = 150,
    he = 2.5,
    pe = 3,
    me = (t, h, l) =>
      t[0] > 0.1 * h && t[0] < 0.9 * h && t[1] > -0.25 * l && t[1] < 0.95 * l,
    Ye = (t, h, l) => Math.abs(t[0]) < 0.4 * h && Math.abs(t[1]) < 0.4 * l,
    je = (t, h, l) => {
      if (
        (t("fixationLocationStrategy") ?? "centerFixation") !== "centerFixation"
      )
        return [0, 0];
      let s = (t("fixationOriginXYScreen") ?? "0.5, 0.5").match(
        /([\d.]+)\s*,\s*([\d.]+)/,
      );
      if (!s) return [0, 0];
      let a = Number(s[1]),
        o = Number(s[2]),
        b = yt(t("targetImageSpareFraction") ?? "");
      if (b && b > 0) {
        let g = t("targetImageWhere") ?? "top",
          u = 0,
          v = 1,
          c = 0,
          m = 1;
        g === "top"
          ? (c = b)
          : g === "bottom"
          ? (m = 1 - b)
          : g === "left"
          ? (v = 1 - b)
          : (u = b),
          (a = u + a * (v - u)),
          (o = c + o * (m - c));
      }
      return [
        Math.round((2 * a - 1) * (h / 2)),
        Math.round((2 * o - 1) * (l / 2)),
      ];
    },
    Et = (t) => ({
      status: "FLAGGED",
      statusReason: t,
      columns: { repairStatus: "FLAGGED", repairStatusReason: t },
    }),
    jt = (t) => {
      if (/-repaired(\.results)?\.csv$/i.test(t)) return t;
      let h = t.match(/^(.*?)(\.results)?\.csv$/i);
      return h ? `${h[1]}-repaired${h[2] ?? ""}.csv` : `${t}-repaired.csv`;
    },
    ye = (t) => {
      let { header: h, rows: l } = Ut(t);
      if (h.includes("repairStatus") || h.includes("repairImputedColumns"))
        return {
          rows: [],
          summary: {
            total: l.length,
            corrected: 0,
            unaffected: 0,
            flagged: 0,
            alreadyRepaired: !0,
          },
        };
      if (!l.length) throw new Error("no data rows \u2014 not a results file");
      let i = (I) => h.indexOf(I),
        s = (I, N) => {
          let y = i(N);
          if (y < 0) return;
          let S = I[y];
          return S === "" ? void 0 : S;
        },
        a = (I) => {
          for (let N of l) {
            let y = s(N, I);
            if (y !== void 0) return y;
          }
        },
        o = yt(a("screenWidthPx")),
        b = yt(a("screenHeightPx")),
        g = yt(a("pxPerCm")),
        u = "2025-08-30",
        v = "2026-09-15",
        c = a("date") ?? "",
        m = c.match(/(\d{4})-(\d{2})-(\d{2})/),
        r = m ? `${m[1]}-${m[2]}-${m[3]}` : "",
        f = !!r && r < u,
        d = !!r && r < v,
        w = [
          "nearpointXYPxAppleCoords",
          "screenBoundingRectDeg",
          "targetEccentricityXDeg",
          "targetEccentricityYDeg",
          "markingFixationMotionRadiusDeg",
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
        x = l.map((I) => [...I]),
        C = new Map();
      x.forEach((I) => {
        for (let N of w) {
          let y = i(N);
          if (y < 0) continue;
          let S = I[y];
          S !== "" && S !== void 0
            ? C.set(N, S)
            : C.has(N) && (I[y] = C.get(N));
        }
      });
      let k = (I, N) => {
          let y = i(N);
          if (y < 0) return;
          let S = I[y];
          return S === "" ? void 0 : S;
        },
        P = l.map(() => Et("not assessed")),
        T = 0,
        U = 0,
        D = 0;
      l.forEach((I, N) => {
        let y = x[N],
          S = k(y, "nearpointXYPxAppleCoords"),
          n = k(y, "screenBoundingRectDeg"),
          A = k(y, "nearestXYPx"),
          G = yt(k(y, "targetEccentricityXDeg")),
          B = yt(k(y, "targetEccentricityYDeg")),
          J = yt(k(y, "markingFixationMotionRadiusDeg")),
          X = k(y, "thresholdParameter"),
          K = yt(k(y, "level")),
          F =
            yt(k(y, "distanceCm")) ??
            yt(k(y, "viewingDistancePredictedCm")) ??
            yt(a("viewingDistanceDesiredCm")),
          $ = je((q) => k(y, q), o, b);
        if (f) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason: `run predates the bug (date ${c.slice(
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
        if (!(o && o > 0) || !(b && b > 0) || !(g && g > 0) || !(F && F > 0)) {
          P[N] = Et(
            "missing apparatus columns (pxPerCm/screenWidthPx/screenHeightPx/distance)",
          );
          return;
        }
        let V = S ? de(S) : void 0,
          H = n ? Ue(n) : void 0;
        if (
          V &&
          !A &&
          Math.abs(V[0] - o / 2) <= he &&
          Math.abs(V[1] - b / 2) <= he
        ) {
          P[N] = {
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
        if (!H) {
          P[N] = Et(
            V
              ? "no screenBoundingRectDeg, non-center apple \u2014 window size unknown"
              : "no nearest-point data on this row or prior (metadata row?)",
          );
          return;
        }
        let j = V ? [V[0] - o / 2, b / 2 - V[1]] : void 0,
          it = {
            pxPerCm: g,
            viewingDistanceCm: F,
            screenW: o,
            screenH: b,
            fixationXYPx: $,
          },
          dt = fe(H, it, j ? [j] : []),
          et = F,
          rt = "";
        if (dt.residualDeg > Vt) {
          let q = fe(H, it, j ? [j] : [], !0);
          q.residualDeg <= Vt &&
            q.viewingDistanceCm >= 15 &&
            q.viewingDistanceCm <= 250 &&
            ((dt = q),
            (et = q.viewingDistanceCm),
            (rt = `; rect fit moved viewing distance ${F.toFixed(
              1,
            )}->${et.toFixed(1)} cm`));
        }
        if (dt.residualDeg > Vt) {
          P[N] = Et(
            `screenBoundingRectDeg not reproducible (fit residual ${dt.residualDeg.toFixed(
              3,
            )} deg). Likely cause: viewing distance at logging time differed, or the (unlogged) random fixation offset was nonzero \u2014 neither recoverable from this file.`,
          );
          return;
        }
        let nt = dt.nearest,
          ct = !0;
        j &&
          (ct = Math.abs(j[0] - nt[0]) <= pe && Math.abs(j[1] - nt[1]) <= pe);
        let pt = ct
          ? ""
          : " (appleCoords disagrees \u2014 non-fullscreen window; rect fit used)";
        if (!A && Math.abs(nt[0]) <= 5 && Math.abs(nt[1]) <= 5) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason:
              "nearest point at screen center [0,0]; bug never active" + pt,
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "nearest point at screen center [0,0]",
            },
          };
          return;
        }
        let gt = me(nt, o, b),
          e = Ye(nt, o, b),
          O,
          R = nt;
        if (A) {
          let q = de(A);
          if (!q) {
            P[N] = Et("nearestXYPx column unparseable");
            return;
          }
          let ot = Math.hypot(q[0] - nt[0], q[1] - nt[1]),
            lt = [nt[0] + o / 2, b / 2 - nt[1]],
            ut = Math.hypot(q[0] - lt[0], q[1] - lt[1]),
            xt = Math.abs(nt[0]) <= 5 && Math.abs(nt[1]) <= 5;
          if (d) {
            if (!xt && ot > Yt && ut > Yt) {
              P[N] = Et(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${Math.min(
                  ot,
                  ut,
                ).toFixed(0)} px)`,
              );
              return;
            }
            (O = !0), (R = q);
          } else if (gt && !e) {
            if (ot > Yt) {
              P[N] = Et(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${ot.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            (O = !0), (R = q);
          } else if (e && !gt) {
            if (ut > Yt) {
              P[N] = Et(
                `trial-time nearestXYPx inconsistent with condition geometry (drift ${ut.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            O = !1;
          } else {
            P[N] = Et(
              "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
                pt,
            );
            return;
          }
        } else if (gt && !e) O = !0;
        else if (e && !gt) O = !1;
        else {
          P[N] = Et(
            "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
              pt,
          );
          return;
        }
        if (O && !d && !me(R, o, b)) {
          P[N] = Et(
            "nearest outside plausible rc band \u2014 not corrected" + pt,
          );
          return;
        }
        if (O && !A && nt.some((q) => q !== 0)) {
          P[N] = Et(
            "buggy session; no stimulus-time nearestXYPx on this row \u2014 live eye unknown" +
              pt,
          );
          return;
        }
        if (!O) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason: "fix already applied (converted nearest used)" + pt,
            nearestUsedXY: nt,
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "fixed-code run",
            },
          };
          return;
        }
        if (J !== void 0 && J > 0) {
          P[N] = Et(
            "moving crosshair (markingFixationMotionRadiusDeg > 0); per-frame fixation unknown",
          );
          return;
        }
        let _ = Xe(R, o, b),
          p = yt(k(y, "distanceCm")) ?? et,
          E = {
            pxPerCm: g,
            viewingDistanceCm: p,
            fixationXYPx: $,
            nearestPointXYZPx: R,
          },
          M = { ...E, nearestPointXYZPx: _ },
          L = {},
          z = {
            status: "CORRECTED",
            statusReason:
              "nearest recovered; corrected (static fixation assumed \u2014 random offset not logged)" +
              pt +
              rt,
            nearestUsedXY: R,
            nearestCorrectXY: _,
            columns: L,
          },
          Y = (q, ot, lt) => {
            if (!(lt > 0) || !Number.isFinite(lt)) return;
            let ut = mt(q, E),
              xt = mt([q[0] + ot[0] * lt, q[1] + ot[1] * lt], E),
              Pt = bt(ut, M),
              Tt = bt(xt, M);
            return Math.hypot(Tt[0] - Pt[0], Tt[1] - Pt[1]);
          },
          Z = G !== void 0 && B !== void 0 ? [G, B] : void 0;
        if (Z) {
          let q = mt(Z, E),
            ot = bt(q, M);
          (z.actualTargetEccentricityXDeg = ot[0]),
            (z.actualTargetEccentricityYDeg = ot[1]),
            (L.actualTargetEccentricityXDeg = ot[0].toFixed(4)),
            (L.actualTargetEccentricityYDeg = ot[1].toFixed(4)),
            (L.drawnTargetXYPx = `${q[0].toFixed(1)}, ${q[1].toFixed(1)}`);
          let lt = mt(Z, M);
          L.correctedTargetXYPx = `${lt[0].toFixed(1)}, ${lt[1].toFixed(1)}`;
        }
        let W = Z
            ? (() => {
                let q = Math.hypot(Z[0], Z[1]) || 1;
                return [Z[0] / q, Z[1] / q];
              })()
            : [1, 0],
          Q = [-W[1], W[0]],
          at = K === void 0 ? NaN : Math.pow(10, K);
        if (Z && X === "spacingDeg") {
          let q = k(y, "spacingDirection") ?? "radial",
            lt = Y(
              Z,
              ((ut) =>
                ut.includes("horizontal")
                  ? [1, 0]
                  : ut.includes("vertical")
                  ? [0, 1]
                  : ut.includes("tangential")
                  ? Q
                  : W)(q),
              at,
            );
          if (
            (lt !== void 0 &&
              ((z.actualSpacingDeg = lt),
              (z.actualLevelLog10Deg = Math.log10(lt)),
              (L.actualSpacingDeg = lt.toFixed(4)),
              (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4))),
            /And/.test(q))
          ) {
            let ut = q.includes("radial") ? Q : [1, 0],
              xt = Y(Z, ut, at);
            xt !== void 0 && (L.actualSpacingSecondaryDeg = xt.toFixed(4));
          }
        }
        if (Z && X === "targetSizeDeg") {
          let ot = /true/i.test(k(y, "targetSizeIsHeightBool") ?? "FALSE")
              ? [0, 1]
              : [1, 0],
            lt = Y(Z, ot, at);
          lt !== void 0 &&
            ((z.actualSizeDeg = lt),
            (z.actualLevelLog10Deg = Math.log10(lt)),
            (L.actualSizeDeg = lt.toFixed(4)),
            (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4)));
        }
        if (
          Z &&
          X === "targetEccentricityXDeg" &&
          z.actualTargetEccentricityXDeg !== void 0
        ) {
          let q = Math.hypot(
            z.actualTargetEccentricityXDeg,
            z.actualTargetEccentricityYDeg ?? 0,
          );
          (z.actualLevelLog10Deg = Math.log10(q)),
            (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4));
        }
        if (Z && X === "targetOffsetDeg") {
          let q = Y(Z, [1, 0], at);
          q !== void 0 &&
            ((z.actualLevelLog10Deg = Math.log10(q)),
            (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4)));
        }
        let st = (() => {
            let q = k(y, "spacingDirection") ?? "radial";
            return q.includes("horizontal")
              ? [1, 0]
              : q.includes("vertical")
              ? [0, 1]
              : q.includes("tangential")
              ? Q
              : W;
          })(),
          wt = yt(k(y, "spacingDeg") ?? "");
        if (Z && wt !== void 0 && wt > 0 && X !== "spacingDeg") {
          let q = Y(Z, st, wt);
          q !== void 0 && (L.actualSpacingDegNominal = q.toFixed(4));
        }
        let zt = yt(k(y, "targetSizeDeg") ?? "");
        if (Z && zt !== void 0 && zt > 0 && X !== "targetSizeDeg") {
          let q = /true/i.test(k(y, "targetSizeIsHeightBool") ?? "FALSE"),
            ot = Y(Z, q ? [0, 1] : [1, 0], zt);
          ot !== void 0 && (L.actualSizeDegNominal = ot.toFixed(4));
        }
        let kt = yt(k(y, "flankerSpacingDeg") ?? "");
        if (Z && kt !== void 0 && kt > 0) {
          let q = Y(Z, W, kt);
          q !== void 0 && (L.actualFlankerSpacingDeg = q.toFixed(4));
        }
        {
          let q = bt([-o / 2, -b / 2], M),
            ot = bt([o / 2, b / 2], M);
          L.screenBoundingRectDegCorrected = `[(${q[0].toFixed(
            4,
          )}, ${q[1].toFixed(4)}), (${ot[0].toFixed(4)}, ${ot[1].toFixed(4)})]`;
        }
        if (
          k(y, "gazeMeasuredXDeg") !== "" ||
          k(y, "gazeMeasuredYDeg") !== "" ||
          k(y, "gazeMeasuredRawDeg") !== ""
        )
          if (!ct)
            z.statusReason += "; gaze left as logged (window size unknown)";
          else {
            let q = (St) => {
                let $t = mt(St, E);
                return bt($t, M);
              },
              ot = yt(k(y, "gazeMeasuredXDeg")),
              lt = yt(k(y, "gazeMeasuredYDeg")),
              ut,
              xt;
            if (
              (ot !== void 0 &&
                ((ut = q([ot, lt ?? 0])),
                (L.gazeMeasuredXDeg = ut[0].toFixed(5))),
              lt !== void 0 &&
                ((xt = q([ot ?? 0, lt])),
                (L.gazeMeasuredYDeg = xt[1].toFixed(5))),
              ut !== void 0 || xt !== void 0)
            ) {
              let St = ut ? ut[0] : ot,
                $t = xt ? xt[1] : lt;
              L.gazeMeasuredRDeg = Math.hypot(St, $t).toFixed(5);
            }
            let Pt = ut !== void 0 || xt !== void 0,
              Tt = k(y, "gazeMeasuredRawDeg");
            if (Tt !== "")
              try {
                let St = JSON.parse(Tt);
                Array.isArray(St) &&
                  St.length > 0 &&
                  ((L.gazeMeasuredRawDeg = JSON.stringify(
                    St.map(($t) => {
                      let At = q([Number($t[0]), Number($t[1])]);
                      return [
                        Number(At[0].toFixed(5)),
                        Number(At[1].toFixed(5)),
                      ];
                    }),
                  )),
                  (Pt = !0));
              } catch {}
            Pt &&
              (z.statusReason +=
                "; gaze corrected via stimulus-time eye position (gaze-time position not logged)");
          }
        (L.repairStatus = "CORRECTED"),
          (L.repairStatusReason = z.statusReason),
          (L.nearestUsedXY = `${R[0].toFixed(1)}, ${R[1].toFixed(1)}`),
          (L.nearestCorrectXY = `${_[0].toFixed(1)}, ${_[1].toFixed(1)}`),
          (P[N] = z);
      });
      for (let I of P)
        I.status === "CORRECTED" ? T++ : I.status === "UNAFFECTED" ? U++ : D++;
      return {
        rows: P,
        summary: { total: P.length, corrected: T, unaffected: U, flagged: D },
      };
    },
    We = [
      "repairStatus",
      "repairStatusReason",
      "repairImputedColumns",
      "nearestUsedXY",
      "nearestCorrectXY",
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
    ge = (t) => (/[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t),
    Ze = {
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
    Kt = (t, h) => {
      if (h.summary.alreadyRepaired) return t;
      let { header: l, rows: i } = Ut(t),
        s = i.map((v) => [...v]),
        a = new Set();
      i.forEach((v, c) => {
        let m = h.rows[c].columns,
          r = [];
        for (let [f, d] of Object.entries(Ze)) {
          if (!(f in m)) continue;
          let w = l.indexOf(d);
          w >= 0 && ((s[c][w] = m[f]), a.add(f), r.includes(d) || r.push(d));
        }
        r.length && (m.repairImputedColumns = r.join("; "));
      });
      let o = We.filter(
          (v) => !a.has(v) && i.some((c, m) => v in h.rows[m].columns),
        ),
        b = o.map((v) =>
          l.includes(v) ? `repair${v[0].toUpperCase()}${v.slice(1)}` : v,
        ),
        g = [
          [...l, ...b].join(","),
          ...s.map((v, c) =>
            [
              ...v.map(ge),
              ...b.map((m, r) => ge(h.rows[c].columns[o[r]] ?? "")),
            ].join(","),
          ),
        ];
      return (
        (t.charCodeAt(0) === 65279 ? "\uFEFF" : "") +
        g.join(`
`)
      );
    },
    be = (t) => t.sort((h, l) => h - l)[Math.floor(t.length / 2)],
    ve = (t, h) => {
      if (h.summary.alreadyRepaired) return { correctedTrials: 0 };
      let { header: l, rows: i } = Ut(t),
        s = l.indexOf("targetEccentricityXDeg"),
        a = l.indexOf("targetEccentricityYDeg"),
        o = l.indexOf("level"),
        b = [],
        g = [],
        u = 0;
      i.forEach((c, m) => {
        let r = h.rows[m];
        if (r.status === "CORRECTED") {
          if ((u++, s >= 0 && r.actualTargetEccentricityXDeg !== void 0)) {
            let f = Math.hypot(Number(c[s]), Number(c[a])),
              d = Math.hypot(
                r.actualTargetEccentricityXDeg,
                r.actualTargetEccentricityYDeg ?? 0,
              );
            f > 0 && Number.isFinite(f) && b.push(((d - f) / f) * 100);
          }
          if (o >= 0 && r.actualLevelLog10Deg !== void 0) {
            let f = Math.pow(10, Number(c[o])),
              d = Math.pow(10, r.actualLevelLog10Deg);
            f > 0 && Number.isFinite(f) && g.push(((d - f) / f) * 100);
          }
        }
      });
      let v = { correctedTrials: u };
      return (
        b.length &&
          (v.eccentricityErrPct = [be(b), Math.max(...b.map(Math.abs))]),
        g.length &&
          (v.sizeSpacingInflationPct = [be(g), Math.max(...g.map(Math.abs))]),
        v
      );
    };
  var ft = (t) => String(t).replace(/-/g, "\u2212"),
    _t = (t, h = 1) =>
      t == null || !Number.isFinite(t) ? "" : ft(t.toFixed(h)),
    Wt = (t, h = 1) => (t == null || !Number.isFinite(t) ? "" : t.toFixed(h)),
    Ht = (t) => `${t >= 0 ? "+" : ""}${_t(t)}%`,
    ht = (t) =>
      String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    Ct = (t, h, l) =>
      `<span class="pill ${t}"${l ? ` data-tip="${ht(l)}"` : ""}>${ht(
        h,
      )}</span>`,
    qe = (t, h, l) => {
      let i = [],
        s = (a) => {
          let o = l.indexOf(a);
          return o >= 0 ? h[o] : "";
        };
      return (
        t.status === "CORRECTED" &&
          (t.nearestUsedXY &&
            t.nearestCorrectXY &&
            i.push(
              `eye used (${_t(t.nearestUsedXY[0], 0)}, ${_t(
                t.nearestUsedXY[1],
                0,
              )}) px; true (${_t(t.nearestCorrectXY[0], 0)}, ${_t(
                t.nearestCorrectXY[1],
                0,
              )}) px`,
            ),
          t.actualTargetEccentricityXDeg !== void 0 &&
            (i.push(
              `position asked (${s("targetEccentricityXDeg")}, ${s(
                "targetEccentricityYDeg",
              )})\xB0 \u2192 drew (${
                t.columns.drawnTargetXYPx
              }) px = truly (${_t(t.actualTargetEccentricityXDeg, 2)}, ${_t(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`,
            ),
            t.columns.correctedTargetXYPx &&
              i.push(
                `to place as asked: (${t.columns.correctedTargetXYPx}) px`,
              )),
          t.actualLevelLog10Deg !== void 0 &&
            i.push(
              `size/spacing asked ${_t(
                Math.pow(10, Number(s("level"))),
                2,
              )}\xB0 \u2192 drew ${_t(
                Math.pow(10, t.actualLevelLog10Deg),
                2,
              )}\xB0`,
            )),
        i.push(t.statusReason),
        i.join(`
`)
      );
    },
    He = {
      CORRECTED: ["corrected", "st-corrected"],
      UNAFFECTED: ["unaffected", "st-unaffected"],
      FLAGGED: ["flagged", "st-flagged"],
    },
    _e = {
      actualTargetEccentricityXDeg: "targetEccentricityXDeg",
      actualTargetEccentricityYDeg: "targetEccentricityYDeg",
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
    Ee = (t) => {
      let h = new Set();
      for (let l of Object.keys(t.columns)) l in _e && h.add(_e[l]);
      return [...h];
    },
    Jt = (t, h) =>
      h === void 0 || h === ""
        ? `<span class="ov">${ht(t)}</span>`
        : `<span class="ov">${ht(
            t,
          )}</span><span class="arw">\u2192</span><span class="nv">${ht(
            h,
          )}</span>`,
    Ge = (t, h, l, i) => {
      let s = (x) => {
          let C = l.indexOf(x);
          return C >= 0 ? h[C] : "";
        },
        [a, o] = He[t.status],
        b = qe(t, h, l),
        g =
          s("targetEccentricityXDeg") !== ""
            ? `(${s("targetEccentricityXDeg")}, ${s(
                "targetEccentricityYDeg",
              )})\xB0`
            : "",
        u =
          t.actualTargetEccentricityXDeg !== void 0
            ? `(${_t(t.actualTargetEccentricityXDeg, 2)}, ${_t(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`
            : void 0,
        v =
          s("level") !== "" && Number.isFinite(Number(s("level")))
            ? _t(Number(s("level")), 3)
            : s("level"),
        c =
          t.actualLevelLog10Deg !== void 0
            ? _t(t.actualLevelLog10Deg, 3)
            : void 0,
        m = s("screenBoundingRectDeg"),
        r = t.columns.screenBoundingRectDegCorrected,
        f = Ee(t)
          .map((x) => `<span class="pchip">${ht(x)}</span>`)
          .join(""),
        d =
          t.status === "FLAGGED" || t.status === "UNAFFECTED"
            ? `<td class="reason">${ht(t.statusReason)}</td>`
            : '<td class="reason"></td>',
        w = u !== void 0 || c !== void 0;
      return `<tr data-st="${t.status}" class="${
        w ? "r-diff" : ""
      }" data-tip="${ht(b)}">
    <td>${i + 1}</td>
    <td>${Ct(o, a, b)}</td>
    <td class="${u !== void 0 ? "diff" : ""}">${Jt(g, u)}</td>
    <td class="${c !== void 0 ? "diff" : ""}">${Jt(v, c)}</td>
    <td class="rect ${r ? "diff" : ""}">${Jt(m, r)}</td>
    <td class="chipscell">${f}</td>
    ${d}
  </tr>`;
    },
    we = (t, h, l) => {
      if (!t.length) return "";
      let i = 300,
        s = 220,
        a = 34,
        o = t.map((r) => r[0]),
        b = t.map((r) => r[1]),
        g = Math.max(...o, ...b) * 1.1 || 1,
        u = (r) => a + (r / g) * (i - a - 8),
        v = (r) => s - a + 8 - (r / g) * (s - a - 8),
        c = t
          .map(
            (r) =>
              `<circle cx="${u(r[0]).toFixed(1)}" cy="${v(r[1]).toFixed(
                1,
              )}" r="3.5" fill="#b26a00" fill-opacity="0.85"><title>asked ${ft(
                r[0].toFixed(2),
              )}\xB0, actually drew ${ft(r[1].toFixed(2))}\xB0 (${Ht(
                ((r[1] - r[0]) / r[0]) * 100,
              )})</title></circle>`,
          )
          .join(""),
        m = [0, g / 2, g]
          .map(
            (r) =>
              `<line x1="${u(r)}" y1="${v(0)}" x2="${u(r)}" y2="${
                v(0) + 4
              }" stroke="#999"/><text x="${u(r)}" y="${
                v(0) + 15
              }" font-size="9" text-anchor="middle" fill="#666">${r.toFixed(
                1,
              )}</text><line x1="${u(0) - 4}" y1="${v(r)}" x2="${u(0)}" y2="${v(
                r,
              )}" stroke="#999"/><text x="${u(0) - 6}" y="${
                v(r) + 3
              }" font-size="9" text-anchor="end" fill="#666">${r.toFixed(
                1,
              )}</text>`,
          )
          .join("");
      return `<svg width="${i}" height="${s}" class="plot" role="img">
    <line x1="${u(0)}" y1="${v(0)}" x2="${u(g)}" y2="${v(
      g,
    )}" stroke="#2e7d32" stroke-dasharray="4 3"/>
    <text x="${u(g * 0.82)}" y="${
      v(g * 0.82) - 6
    }" font-size="9" fill="#2e7d32">no error</text>
    <line x1="${u(0)}" y1="${v(0)}" x2="${u(g)}" y2="${v(0)}" stroke="#bbb"/>
    <line x1="${u(0)}" y1="${v(0)}" x2="${u(0)}" y2="${v(g)}" stroke="#bbb"/>
    ${m}${c}
    <text x="${i / 2}" y="${
      s - 2
    }" font-size="10" text-anchor="middle" fill="#444">${ht(h)}</text>
    <text x="10" y="${
      s / 2
    }" font-size="10" text-anchor="middle" fill="#444" transform="rotate(-90 10 ${
      s / 2
    })">${ht(l)}</text>
  </svg>`;
    },
    Ce = (t, h) => {
      let l = new Blob([h], { type: "text/csv" }),
        i = document.createElement("a");
      (i.href = URL.createObjectURL(l)),
        (i.download = t),
        i.click(),
        setTimeout(() => URL.revokeObjectURL(i.href), 5e3);
    },
    Bt = document.getElementById("results"),
    Rt = document.createElement("div");
  Rt.className = "rtip";
  document.body.appendChild(Rt);
  var De = (t) => {
    let l = Rt.getBoundingClientRect(),
      i = t.clientX + 14,
      s = t.clientY - l.height / 2;
    i + l.width > innerWidth - 8 && (i = t.clientX - l.width - 14),
      (s = Math.min(Math.max(s, 8), innerHeight - l.height - 8)),
      (Rt.style.left = i + "px"),
      (Rt.style.top = s + "px");
  };
  document.body.addEventListener("mouseover", (t) => {
    let h = t.target.closest("[data-tip]");
    h &&
      ((Rt.innerHTML = ht(h.getAttribute("data-tip")).replace(/\n/g, "<br>")),
      (Rt.style.display = "block"),
      De(t));
  });
  document.body.addEventListener("mousemove", (t) => {
    Rt.style.display === "block" && De(t);
  });
  document.body.addEventListener("mouseout", (t) => {
    t.target.closest("[data-tip]") && (Rt.style.display = "none");
  });
  var Dt = [],
    tt = {
      processed: 0,
      repaired: 0,
      clean: 0,
      flaggedOnly: 0,
      already: 0,
      errors: 0,
      skippedNonCsv: 0,
      entries: new Map(),
      archiveStems: [],
    },
    Zt = (t, h) => {
      if (!tt.entries.has(t)) return tt.entries.set(t, h), t;
      let l = 2,
        i;
      do
        (i = /\.csv$/i.test(t)
          ? t.replace(/\.csv$/i, ` (${l}).csv`)
          : `${t} (${l})`),
          l++;
      while (tt.entries.has(i));
      return tt.entries.set(i, h), i;
    },
    It = () => {
      if (!tt.processed && !tt.errors && !tt.skippedNonCsv) return;
      let t = document.getElementById("batchbar");
      t.style.display = "flex";
      let h = [];
      tt.repaired &&
        h.push(
          `${tt.repaired} repaired \u2014 renamed with \u201C-repaired\u201D`,
        ),
        tt.clean && h.push(`${tt.clean} needed nothing`),
        tt.flaggedOnly && h.push(`${tt.flaggedOnly} flagged for review`),
        tt.already && h.push(`${tt.already} already repaired`),
        tt.errors && h.push(`${tt.errors} unreadable`);
      let l = tt.processed + tt.errors,
        i = `${l} file${l === 1 ? "" : "s"}`;
      document.getElementById("batchcounts").textContent = h.length
        ? `${i}: ${h.join(" \xB7 ")}${
            tt.skippedNonCsv
              ? ` \u2014 ${tt.skippedNonCsv} non-CSV skipped`
              : ""
          }`
        : `${i} \u2014 no repairs needed${
            tt.skippedNonCsv ? `, ${tt.skippedNonCsv} non-CSV skipped` : ""
          }`;
    },
    ze = () =>
      `EasyEyes results repair report
` +
      new Date().toISOString() +
      `
${tt.processed} files assessed: ${tt.repaired} repaired (renamed "-repaired"), ${tt.clean} needed nothing, ${tt.flaggedOnly} flagged for review, ${tt.already} already repaired, ${tt.errors} unreadable` +
      (tt.skippedNonCsv ? `, ${tt.skippedNonCsv} non-CSV files skipped` : "") +
      `
Repaired files list what changed per row in the repairImputedColumns column.

` +
      Dt.join(`
`) +
      `
`,
    Ve = async (t) => {
      let h = [...tt.entries.keys()],
        l = new Set(h.map((u) => (u.includes("/") ? u.split("/")[0] : ""))),
        i = l.size === 1 && !l.has("") ? [...l][0] : "",
        s = [...new Set(tt.archiveStems)],
        o =
          s.length === 1 && s[0].endsWith(".results")
            ? `${s[0]
                .replace(/\.results$/i, "")
                .replace(/-repaired$/i, "")}-repaired.results.zip`
            : i
            ? i.endsWith(".results")
              ? `${i.slice(0, -8)}-repaired.results.zip`
              : `${i}-repaired.zip`
            : "easyeyes-results-repaired.zip",
        b = await t.generateAsync({ type: "blob", compression: "DEFLATE" }),
        g = document.createElement("a");
      (g.href = URL.createObjectURL(b)),
        (g.download = o),
        g.click(),
        setTimeout(() => URL.revokeObjectURL(g.href), 5e3);
    },
    xe =
      "These trials were not affected by the bug (e.g. eye at screen center, untracked session, or recorded outside the bug window).",
    ke =
      "The tool cannot prove what was drawn on these rows \u2014 nothing was changed; the report lists the reasons.",
    Ke =
      "This file already carries the repair audit columns \u2014 it was repaired before. It passes through unchanged; correcting twice is impossible.",
    Se = async (t, h) => {
      let l = h || t.name,
        i;
      try {
        let n = await t.arrayBuffer();
        i = new TextDecoder("utf-8", { ignoreBOM: !0 }).decode(n);
      } catch {
        i = null;
      }
      let s = null,
        a = null;
      if (i !== null)
        try {
          s = ye(i);
        } catch (n) {
          a = n && n.message ? String(n.message) : null;
        }
      if (!s) {
        tt.errors++,
          i !== null && Zt(l, i),
          Bt.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Ct(
              "st-flagged",
              "could not parse",
              a || "The file is not a readable results CSV.",
            )}</div>`,
          ),
          Dt.push(`${l}: ERROR ${a || "could not parse"}`),
          It();
        return;
      }
      if (s.summary.alreadyRepaired) {
        tt.already++,
          Zt(l, i),
          Bt.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Ct(
              "st-done",
              "already repaired",
              Ke,
            )}</div>`,
          ),
          Dt.push(`${l}: already repaired \u2014 unchanged`),
          tt.processed++,
          It();
        return;
      }
      let o = s.summary;
      if (o.corrected === 0) {
        Zt(l, i);
        let n = {};
        s.rows.forEach((B) => {
          B.status === "FLAGGED" &&
            (n[B.statusReason] = (n[B.statusReason] || 0) + 1);
        });
        let A = Object.entries(n)
            .sort((B, J) => J[1] - B[1])
            .map(([B, J]) => `${J}\xD7 ${B}`).join(`
`),
          G = [
            o.unaffected
              ? Ct("st-unaffected", `${o.unaffected} unaffected`, xe)
              : "",
            o.flagged ? Ct("st-flagged", `${o.flagged} flagged`, A || ke) : "",
          ].join("");
        Bt.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${ht(l)}</span>${G}</div>`,
        ),
          Dt.push(
            `${l}: no corrections \u2014 ${o.unaffected} unaffected / ${o.flagged} flagged (${o.total} rows); file unchanged`,
          ),
          Object.entries(n).forEach(([B, J]) => Dt.push(`  FLAG ${J}x: ${B}`)),
          tt[o.flagged ? "flaggedOnly" : "clean"]++,
          tt.processed++,
          It();
        return;
      }
      let { header: b, rows: g } = Ut(i),
        u = ve(i, s),
        v = [
          Ct(
            "st-corrected",
            `${o.corrected} corrected`,
            "These trials were recorded with the warped conversion. The repaired CSV replaces the requested values with what was actually drawn.",
          ),
          o.unaffected
            ? Ct("st-unaffected", `${o.unaffected} unaffected`, xe)
            : "",
          o.flagged ? Ct("st-flagged", `${o.flagged} flagged`, ke) : "",
        ].join(" "),
        c = "";
      if (u.correctedTrials > 0) {
        let n = [];
        u.eccentricityErrPct &&
          n.push(
            `position off by median ${_t(
              Math.abs(u.eccentricityErrPct[0]),
            )}% (max ${_t(u.eccentricityErrPct[1])}%)`,
          ),
          u.sizeSpacingInflationPct &&
            n.push(
              `size/spacing off by median ${_t(
                Math.abs(u.sizeSpacingInflationPct[0]),
              )}% (max ${_t(u.sizeSpacingInflationPct[1])}%)`,
            ),
          (c = `<div class="wrong st-corrected-bg">On the ${
            u.correctedTrials
          } corrected trial${
            u.correctedTrials > 1 ? "s" : ""
          }, what was drawn differed from what was requested: ${n.join(
            "; ",
          )}.</div>`);
      }
      let m = 400,
        r = o.corrected + o.flagged,
        f = r > 0 && r < o.total,
        d = s.rows
          .map((n, A) => Ge(n, g[A], b, A))
          .map((n) =>
            f && n.includes('data-st="UNAFFECTED"')
              ? n.replace("<tr ", '<tr class="r-hidden" ')
              : n,
          )
          .slice(0, m)
          .join(""),
        w = new Map();
      s.rows.forEach((n) => {
        if (n.status === "CORRECTED")
          for (let A of Ee(n)) w.set(A, (w.get(A) || 0) + 1);
      });
      let x = w.size
          ? `<div class="pstrip"><b>Corrected parameters:</b> ${[...w]
              .map(
                ([n, A]) =>
                  `<span class="pchip big">${ht(n)} <b>\xD7${A}</b></span>`,
              )
              .join(
                "",
              )}<span class="hint">Corrected values are imputed into these original columns, so your existing analysis works unchanged; the added <code>repairImputedColumns</code> column lists what changed on each row. Your source file is untouched.</span></div>`
          : "",
        C = `<div class="rowswrap">
      <div class="rowscap">Row-by-row details \u2014 ${
        o.total
      } rows; hover for derivations</div>
      <label class="rowtoggle"><input type="checkbox" ${
        f ? "checked" : ""
      }/> show only affected rows (corrected + flagged)</label>
      <table><thead><tr>
        <th>#</th><th>status</th>
        <th title="requested (muted) \u2192 actually drawn (green), in degrees">target position</th>
        <th title="requested (muted) \u2192 actually drawn (green), log10 degrees">level</th>
        <th title="as logged (muted) \u2192 corrected (green), degrees">bounding rect</th>
        <th title="parameters this row carries corrections for">corrected</th>
        <th>reason</th></tr></thead>
      <tbody>${d}</tbody></table>
      ${o.total > m ? `<div class="note">Showing first ${m} rows.</div>` : ""}
      </div>`,
        k = b.indexOf("targetEccentricityXDeg"),
        P = b.indexOf("targetEccentricityYDeg"),
        T = b.indexOf("level"),
        U = [],
        D = [];
      s.rows.forEach((n, A) => {
        if (n.status === "CORRECTED") {
          if (k >= 0 && n.actualTargetEccentricityXDeg !== void 0) {
            let G = Math.hypot(Number(g[A][k]), Number(g[A][P])),
              B = Math.hypot(
                n.actualTargetEccentricityXDeg,
                n.actualTargetEccentricityYDeg ?? 0,
              );
            G > 0 && Number.isFinite(G) && U.push([G, B]);
          }
          if (T >= 0 && n.actualLevelLog10Deg !== void 0) {
            let G = Math.pow(10, Number(g[A][T]));
            G > 0 &&
              Number.isFinite(G) &&
              D.push([G, Math.pow(10, n.actualLevelLog10Deg)]);
          }
        }
      });
      let I =
          U.length || D.length
            ? `<div class="plots">${we(
                U,
                "requested eccentricity (\xB0)",
                "actual (\xB0)",
              )}${we(
                D,
                "requested size/spacing (\xB0)",
                "actual (\xB0)",
              )}</div>`
            : "",
        N = jt(t.name),
        y = document.createElement("div");
      (y.className = "card"),
        (y.innerHTML = `
      <div class="fhead"><span class="fname">${ht(
        l,
      )} <span class="mark">\u2192 repaired as <b>${ht(N)}</b></span></span>
        <button class="dl" title="Requested values in the original columns are replaced with what was actually drawn; the repairImputedColumns column lists the altered cells; the file is marked "-repaired"; your source file is untouched">\u2B07 repaired CSV</button></div>
      <div class="chips">${v}</div>
      ${c}
      ${x}
      ${I}
      ${C}`),
        y.querySelector(".dl").addEventListener("click", () => Ce(N, Kt(i, s))),
        y.querySelector(".rowtoggle input").addEventListener("change", (n) => {
          y.querySelectorAll("tr[data-st]").forEach((A) => {
            A.getAttribute("data-st") === "UNAFFECTED" &&
              A.classList.toggle("r-hidden", n.target.checked);
          });
        }),
        Bt.appendChild(y),
        tt.repaired++,
        Zt(jt(l), Kt(i, s)),
        Dt.push(
          `${l}: ${o.corrected} corrected / ${o.unaffected} unaffected / ${
            o.flagged
          } flagged (${o.total} rows) \u2014 fixed -> ${jt(l)}`,
        ),
        c &&
          Dt.push(
            `  drawn-vs-requested: ${
              u.eccentricityErrPct
                ? `position median ${Wt(
                    Math.abs(u.eccentricityErrPct[0]),
                  )}% max ${Wt(u.eccentricityErrPct[1])}%; `
                : ""
            }${
              u.sizeSpacingInflationPct
                ? `size/spacing median ${Wt(
                    Math.abs(u.sizeSpacingInflationPct[0]),
                  )}% max ${Wt(u.sizeSpacingInflationPct[1])}%`
                : ""
            }`,
          );
      let S = {};
      s.rows.forEach((n) => {
        n.status === "FLAGGED" &&
          (S[n.statusReason] = (S[n.statusReason] || 0) + 1);
      }),
        Object.entries(S).forEach(([n, A]) => Dt.push(`  FLAG ${A}x: ${n}`)),
        tt.processed++,
        It();
    },
    Je = async (t) => {
      let h = [],
        l = t.items
          ? [...t.items]
              .map((s) => (s.webkitGetAsEntry ? s.webkitGetAsEntry() : null))
              .filter(Boolean)
          : [];
      if (!l.length)
        return [...t.files].map((s) => ({ file: s, relPath: s.name }));
      let i = async (s, a) => {
        if (s.isFile) {
          let o = await new Promise((b, g) => s.file(b, g));
          h.push({ file: o, relPath: a + s.name });
        } else if (s.isDirectory) {
          let o = s.createReader(),
            b = await new Promise((g, u) => o.readEntries(g, u));
          for (; b.length; ) {
            for (let g of b) await i(g, a + s.name + "/");
            b = await new Promise((g, u) => o.readEntries(g, u));
          }
        }
      };
      for (let s of l) await i(s, "");
      return h;
    },
    Qe = async (t, h) => {
      let l = h || t.name,
        i = null;
      try {
        i = await Qt.default.loadAsync(await t.arrayBuffer());
      } catch {
        i = null;
      }
      if (!i) {
        tt.errors++,
          Bt.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Ct(
              "st-flagged",
              "could not unzip",
              "The archive is corrupt, encrypted, or not a ZIP file \u2014 it is included unchanged.",
            )}</div>`,
          ),
          Dt.push(`${l}: ERROR could not unzip`),
          It();
        return;
      }
      let s = Object.values(i.files).filter((u) => !u.dir),
        a = (u) => u.split("/").pop(),
        o = (u) =>
          /^__MACOSX\//i.test(u) ||
          /^\./.test(a(u)) ||
          u === "REPAIR-REPORT.txt",
        b = (u) => /\.csv$/i.test(a(u)) && !o(u),
        g = s.filter((u) => b(u.name));
      if (
        (s.forEach((u) => {
          !b(u.name) && !o(u.name) && tt.skippedNonCsv++;
        }),
        !g.length)
      ) {
        Bt.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${ht(l)}</span>${Ct(
            "st-flagged",
            "no data files",
            "No .csv results files inside this archive.",
          )}</div>`,
        ),
          Dt.push(`${l}: no CSV files inside \u2014 unchanged`),
          It();
        return;
      }
      tt.archiveStems.push(
        l
          .replace(/\.zip$/i, "")
          .split("/")
          .pop(),
      );
      for (let u of g) {
        let v = a(u.name);
        await Se(
          { name: v, arrayBuffer: () => u.async("arraybuffer") },
          u.name,
        );
      }
    },
    te = async (t) => {
      for (let { file: h, relPath: l } of t) {
        let i = (l || h.name).split("/").pop();
        if (/\.zip$/i.test(i)) {
          await Qe(h, l);
          continue;
        }
        if (!/\.csv$/i.test(i) || /^\./.test(i)) {
          tt.skippedNonCsv++, It();
          continue;
        }
        await Se(h, l);
      }
    },
    Ft = document.getElementById("drop"),
    Nt = document.getElementById("file"),
    qt = document.getElementById("folder");
  Ft.addEventListener("click", (t) => {
    t.target.closest("button, input") || Nt.click();
  });
  Ft.addEventListener("keydown", (t) => {
    t.target.closest(".linkbtn") ||
      ((t.key === "Enter" || t.key === " ") &&
        (t.preventDefault(), Nt.click()));
  });
  document.getElementById("pickFiles").addEventListener("click", (t) => {
    t.stopPropagation(), Nt.click();
  });
  document.getElementById("pickFolder").addEventListener("click", (t) => {
    t.stopPropagation(), qt.click();
  });
  Ft.addEventListener("dragover", (t) => {
    t.preventDefault(), Ft.classList.add("over");
  });
  Ft.addEventListener("dragleave", () => Ft.classList.remove("over"));
  Ft.addEventListener("drop", async (t) => {
    t.preventDefault(),
      Ft.classList.remove("over"),
      te(await Je(t.dataTransfer));
  });
  Nt.addEventListener("change", () => {
    te([...Nt.files].map((t) => ({ file: t, relPath: t.name }))),
      (Nt.value = "");
  });
  qt.addEventListener("change", () => {
    te(
      [...qt.files].map((t) => ({
        file: t,
        relPath: t.webkitRelativePath || t.name,
      })),
    ),
      (qt.value = "");
  });
  document
    .getElementById("reportBtn")
    .addEventListener("click", () => Ce("repair-report.txt", ze()));
  document.getElementById("zipBtn").addEventListener("click", async () => {
    let t = new Qt.default();
    for (let [h, l] of tt.entries) t.file(h, l);
    t.file("REPAIR-REPORT.txt", ze()), await Ve(t);
  });
  var Lt = null,
    tn = () => {
      let t = document.getElementById("xp-char").value || "E",
        h = document.createElement("canvas").getContext("2d");
      h.font = "700 100px Arial, sans-serif";
      let l = h.measureText(t[0]),
        i =
          l.actualBoundingBoxAscent && l.actualBoundingBoxDescent !== void 0
            ? l.actualBoundingBoxAscent + l.actualBoundingBoxDescent
            : 72;
      Lt = { ch: t[0], capH: i, width: l.width || 60 };
    };
  var $e = "placement",
    vt = {};
  ["preset", "w", "h", "ppc", "dist", "ex", "ey", "grid", "ref"].forEach(
    (t) => (vt[t] = document.getElementById("xp-" + t)),
  );
  var ee = () => {
      let t = Number(vt.w.value),
        h = Number(vt.h.value),
        l = Number(vt.ppc.value);
      return (
        vt.preset.value !== "custom" &&
          ([t, h, l] = vt.preset.value.split(",").map(Number)),
        (l = Math.max(1, l)),
        vt.preset.value === "custom" &&
          Number(vt.ppc.value) !== l &&
          (vt.ppc.value = l),
        {
          w: t,
          h,
          ppc: l,
          dist: Number(vt.dist.value),
          eyeXPx: Number(vt.ex.value) * l,
          eyeYPx: Number(vt.ey.value) * l,
          showGrid: vt.grid.checked,
          showRef: vt.ref.checked,
          mode: $e,
          sizeDeg: Number(document.getElementById("xp-size").value),
          sizeDim: document.getElementById("xp-sizedim").value,
        }
      );
    },
    en = (t) => {
      let h = Math.max(-1, Math.min(1, (t - 1) / 0.2)),
        l = (s, a, o) => Math.round(s + (a - s) * o);
      if (h >= 0) {
        let s = h;
        return `rgb(${l(250, 212, s)},${l(250, 78, s)},${l(250, 0, s)})`;
      }
      let i = -h;
      return `rgb(${l(250, 26, i)},${l(250, 90, i)},${l(250, 200, i)})`;
    },
    ne = () => {
      let t = ee();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      (document.getElementById("xp-dist-v").textContent = t.dist),
        (document.getElementById("xp-ex-v").textContent = ft(
          (t.eyeXPx / t.ppc).toFixed(1),
        )),
        (document.getElementById("xp-ey-v").textContent = ft(
          (t.eyeYPx / t.ppc).toFixed(1),
        )),
        document
          .getElementById("explore")
          .classList.toggle("showCustom", vt.preset.value === "custom");
      let h = [t.eyeXPx, t.eyeYPx],
        l = [t.eyeXPx + t.w / 2, t.h / 2 - t.eyeYPx],
        i = { pxPerCm: t.ppc, viewingDistanceCm: t.dist, fixationXYPx: [0, 0] },
        s = { ...i, nearestPointXYZPx: h },
        a = { ...i, nearestPointXYZPx: l },
        o = 640,
        b = Math.round((o * t.h) / t.w),
        g = (D) => ((D + t.w / 2) / t.w) * o,
        u = (D) => ((t.h / 2 - D) / t.h) * b,
        v = 52,
        c = 32,
        m = o / v,
        r = b / c,
        f = [];
      for (let D = 0; D < c; D++)
        for (let I = 0; I < v; I++) {
          let N = -t.w / 2 + ((I + 0.5) / v) * t.w,
            y = t.h / 2 - ((D + 0.5) / c) * t.h,
            S = bt([N, y], s),
            n = Math.hypot(S[0], S[1]);
          if (n < 0.5) continue;
          let A;
          if (t.mode === "size") {
            let G = t.sizeDim === "h" ? [0, 1] : [1, 0],
              B = mt(S, a),
              J = mt([S[0] + G[0] * t.sizeDeg, S[1] + G[1] * t.sizeDeg], a),
              X = bt(B, s),
              K = bt(J, s);
            A = Math.hypot(K[0] - X[0], K[1] - X[1]) / t.sizeDeg;
          } else {
            let G = mt(S, a),
              B = bt(G, s);
            A = Math.hypot(B[0], B[1]) / n;
          }
          f.push(
            `<rect x="${(I * m).toFixed(1)}" y="${(D * r).toFixed(
              1,
            )}" width="${(m + 0.5).toFixed(1)}" height="${(r + 0.5).toFixed(
              1,
            )}" fill="${en(A)}"/>`,
          );
        }
      let d = 5,
        w = (D, I) => {
          let N = [],
            S = (n, A) => {
              let G = "",
                B = null,
                J = Math.max(t.w, t.h) * 4,
                X = Math.max(t.w, t.h) * 3;
              for (let K = -80; K <= 80; K += 1) {
                let $ = mt(n ? [A, K] : [K, A], D);
                if (
                  !Number.isFinite($[0]) ||
                  !Number.isFinite($[1]) ||
                  Math.abs($[0]) > X ||
                  Math.abs($[1]) > X
                ) {
                  B = null;
                  continue;
                }
                let V = B && Math.hypot($[0] - B[0], $[1] - B[1]) > J;
                (G += `${G && !V ? "L" : "M"}${g($[0]).toFixed(1)},${u(
                  $[1],
                ).toFixed(1)}`),
                  (B = $);
              }
              G && N.push(`<path d="${G}" fill="none" ${I}/>`);
            };
          for (let n = -80; n <= 80; n += d) S(!0, n), S(!1, n);
          return N.join("");
        },
        x = "";
      if (t.showRef) {
        x += w(
          s,
          'stroke="#2e7d32" stroke-opacity="0.6" stroke-width="0.8" stroke-dasharray="5 4"',
        );
        let D = [];
        for (let I = -80; I <= 80; I += d) {
          if (I === 0) continue;
          let N = mt([I, 0], s);
          Number.isFinite(N[0]) &&
            N[0] > -t.w / 2 + 8 &&
            N[0] < t.w / 2 - 8 &&
            D.push(
              `<text x="${g(N[0]).toFixed(
                1,
              )}" y="11" font-size="9" fill="#1e6b2f" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${ft(
                I,
              )}\xB0</text>`,
            );
          let y = mt([0, I], s);
          Number.isFinite(y[1]) &&
            y[1] > -t.h / 2 + 8 &&
            y[1] < t.h / 2 - 8 &&
            D.push(
              `<text x="4" y="${(u(y[1]) + 3).toFixed(
                1,
              )}" font-size="9" fill="#1e6b2f" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${ft(
                I,
              )}\xB0</text>`,
            );
        }
        x += D.join("");
      }
      t.showGrid &&
        (x += w(
          a,
          'stroke="#16344d" stroke-opacity="0.85" stroke-width="1.3"',
        ));
      let C = `<circle cx="${g(0)}" cy="${u(
        0,
      )}" r="4" fill="none" stroke="#222" stroke-width="1.4"><title>fixation</title></circle>`;
      document.querySelector(".legend").innerHTML =
        t.mode === "size"
          ? '<span class="sw" style="background:#1a5ac8"></span> drawn smaller than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> drawn larger than requested'
          : '<span class="sw" style="background:#1a5ac8"></span> drawn closer than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> drawn farther than requested';
      let k = `<svg id="xp-svg" viewBox="0 0 ${o} ${b}" width="${o}" height="${b}">
    ${f.join("")}${x}${C}<g id="xp-glyphs"></g>
  </svg>`,
        P = document.getElementById("xp-plot");
      P.innerHTML = k;
      let T = document.getElementById("xp-svg"),
        U = document.createElement("div");
      (U.id = "xp-tooltip"),
        (P.style.position = "relative"),
        P.appendChild(U),
        T.addEventListener("mousemove", (D) => {
          let I = T.getBoundingClientRect(),
            N = ((D.clientX - I.left) / I.width) * t.w - t.w / 2,
            y = t.h / 2 - ((D.clientY - I.top) / I.height) * t.h,
            S = bt([N, y], s),
            n = Math.hypot(S[0], S[1]),
            A;
          if (t.mode === "size") {
            let V = t.sizeDim === "h" ? [0, 1] : [1, 0],
              H = mt(S, a),
              j = mt([S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg], a),
              it = bt(H, s),
              dt = bt(j, s),
              et = Math.hypot(dt[0] - it[0], dt[1] - it[1]);
            (A = `<b>${Ht(
              ((et - t.sizeDeg) / t.sizeDeg) * 100,
            )}</b> size error`),
              Lt || tn();
            let rt = mt(S, s),
              nt = H,
              ct = (R, _) => {
                let p = mt(
                  [S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg],
                  _,
                );
                return Math.hypot(p[0] - R[0], p[1] - R[1]);
              },
              pt = ct(rt, s),
              gt = ct(nt, a),
              e = t.sizeDim === "h" ? Lt.capH : Lt.width,
              O = (R, _, p, E) =>
                `<text x="${g(R[0]).toFixed(1)}" y="${u(R[1]).toFixed(
                  1,
                )}" font-family="Arial, sans-serif" font-weight="700" font-size="${(
                  (_ / e) *
                  100
                ).toFixed(
                  1,
                )}" fill="${p}" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${ht(
                  Lt.ch,
                )}</text><text x="${g(R[0]).toFixed(1)}" y="${(
                  u(R[1]) +
                  ((_ / e) * 100) / 2 +
                  12
                ).toFixed(
                  1,
                )}" font-size="10" fill="${p}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${E}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              O(rt, pt, "#2e7d32", `requested ${t.sizeDeg}\xB0`) +
              O(nt, gt, "#16344d", `actual ${ft(et.toFixed(2))}\xB0`);
          } else {
            let V = mt(S, a),
              H = bt(V, s),
              j = Math.hypot(H[0], H[1]);
            A = `<b>${
              n > 0.1 ? Ht(((j - n) / n) * 100) : "\u2014"
            }</b> eccentricity error`;
            let it = mt(S, s),
              dt = (et, rt, nt, ct) =>
                `<text x="${g(et[0]).toFixed(1)}" y="${(
                  u(et[1]) + (ct ? -12 : 20)
                ).toFixed(
                  1,
                )}" font-size="10" fill="${rt}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${nt}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              `<line x1="${g(it[0]).toFixed(1)}" y1="${u(it[1]).toFixed(
                1,
              )}" x2="${g(V[0]).toFixed(1)}" y2="${u(V[1]).toFixed(
                1,
              )}" stroke="#555" stroke-width="1" stroke-opacity="0.6"/><circle cx="${g(
                it[0],
              ).toFixed(1)}" cy="${u(it[1]).toFixed(
                1,
              )}" r="7" fill="#2e7d32" fill-opacity="0.55"/><circle cx="${g(
                V[0],
              ).toFixed(1)}" cy="${u(V[1]).toFixed(
                1,
              )}" r="7" fill="#16344d" fill-opacity="0.55"/>` +
              dt(
                it,
                "#2e7d32",
                `requested (${ft(S[0].toFixed(1))}, ${ft(
                  S[1].toFixed(1),
                )})\xB0 \xB7 ${ft(n.toFixed(2))}\xB0`,
                !0,
              ) +
              dt(
                V,
                "#16344d",
                `actual (${ft(H[0].toFixed(1))}, ${ft(
                  H[1].toFixed(1),
                )})\xB0 \xB7 ${ft(j.toFixed(2))}\xB0`,
                !1,
              );
          }
          (U.innerHTML = A), (U.style.display = "block");
          let G = P.getBoundingClientRect();
          (U.style.left = "0px"), (U.style.top = "0px");
          let B = U.offsetWidth,
            J = U.offsetHeight,
            X = D.clientX - G.left,
            K = D.clientY - G.top,
            F = X + 16;
          F + B > G.width - 4 && (F = X - B - 16);
          let $ = Math.min(Math.max(K - J / 2, 2), G.height - J - 2);
          U.style.transform = `translate(${F}px, ${$}px)`;
        }),
        T.addEventListener("mouseleave", () => {
          (U.style.display = "none"),
            (T.querySelector("#xp-glyphs").innerHTML = "");
        });
    },
    Re = () => {
      let t = ee();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      let h = t.w,
        l = t.h,
        i = t.ppc,
        s = t.dist,
        a = [t.eyeXPx, t.eyeYPx],
        o = [a[0] + h / 2, l / 2 - a[1]],
        b = Number(document.getElementById("xp-req").value),
        g = (r) => `<span class="st" data-tip="${ht(r)}">`,
        u = "</span>",
        v = `
    <div class="fx"><span class="lbl">pixels &rarr; angle (radial):</span>
      ${g(
        "R: maps a pixel offset to the visual angle it subtends at the eye; preserves direction, rescales length",
      )}<i><b>R</b>(<b>u</b>)</i>${u} = <span class="frac"><span class="num">180</span><span class="den">&pi;</span></span> atan<span class="frac"><span class="num">&Vert;<b>u</b>&Vert;</span><span class="den">${g(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${u}</span></span> &middot; <span class="frac"><span class="num"><b>u</b></span><span class="den">&Vert;<b>u</b>&Vert;</span></span>
    </div>
    <div class="fx"><span class="lbl">angle &rarr; pixels (its inverse):</span>
      ${g(
        "R\u207B\xB9: the inverse map, angle \u2192 pixel offset \u2014 this is what places a stimulus on screen",
      )}<i><b>R</b><sup>&minus;1</sup>(<b>v</b>)</i>${u} = ${g(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${u} tan<span class="frac"><span class="num">&pi;&Vert;<b>v</b>&Vert;</span><span class="den">180</span></span> &middot; <span class="frac"><span class="num"><b>v</b></span><span class="den">&Vert;<b>v</b>&Vert;</span></span>
    </div>
    <div class="fx fxline-bug"><span class="lbl">drawn on screen (assumed eye):</span>
      <b class="v">p</b> = ${g(
        "n_bug: the point the buggy code used as the nearest point \u2014 its projection's pivot",
      )}<b class="v">n<sub>bug</sub></b>${u} + <i><b>R</b><sup>&minus;1</sup></i>(&theta; &minus; <i><b>R</b></i>(<b class="v">n<sub>bug</sub></b>))
    </div>
    <div class="fx fxline-act"><span class="lbl">what you actually saw (true eye):</span>
      <b class="v">a</b> = <i><b>R</b></i>(<b class="v">p</b> &minus; ${g(
        "n: the true nearest point \u2014 the screen point closest to your eye",
      )}<b class="v">n</b>${u}) + <i><b>R</b></i>(<b class="v">n</b>)
    </div>
    <div class="fx"><span class="lbl">the bug, in full ${g(
      "The webcam tracker's top-left-origin coordinates were used verbatim in the center-origin frame.",
    )}(raw rc, unconverted)${u}:</span>
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
        c = document.getElementById("xp-formulas");
      c && (c.innerHTML = `<div class="formulas">${v}</div>`);
      let m = document.getElementById("xp-values");
      m &&
        (m.innerHTML = `<div class="fxvals">&theta; ${ft(
          b,
        )}&deg;&nbsp;|&nbsp;s ${i} px/cm&nbsp;|&nbsp;d ${s} cm&nbsp;|&nbsp;W ${h} px&nbsp;|&nbsp;H ${l} px&nbsp;|&nbsp;n (${ft(
          a[0],
        )}, ${ft(a[1])}) px&nbsp;|&nbsp;n<sub>bug</sub> (${ft(o[0])}, ${ft(
          o[1],
        )}) px</div>`);
    },
    Ae = () => {
      let t = document.getElementById("xp-diagram");
      if (!t) return;
      let h = ee();
      if (!(h.w > 0 && h.h > 0 && h.ppc > 0 && h.dist > 0)) return;
      let l = document.getElementById("xp-req"),
        i = Number(l.value);
      document.getElementById("xp-req-v").textContent = ft(i);
      let s = [h.eyeXPx, h.eyeYPx],
        a = [h.eyeXPx + h.w / 2, h.h / 2 - h.eyeYPx],
        o = { pxPerCm: h.ppc, viewingDistanceCm: h.dist, fixationXYPx: [0, 0] },
        b = mt([i, 0], { ...o, nearestPointXYZPx: a }),
        g = bt(b, { ...o, nearestPointXYZPx: s }),
        u = h.w / h.ppc,
        v = h.eyeXPx / h.ppc,
        c = v + u / 2,
        m = b[0] / h.ppc,
        r = h.dist,
        f = 30,
        d = Math.min(-u / 2, v, m) - 6,
        w = Math.max(u / 2, c, m) + 6,
        x = 368,
        C = Math.min((x - 2 * f) / (w - d), 430 / (r + 6)),
        k = x,
        P = (d + w) / 2,
        T = (k - 2 * f) / C,
        U = P - T / 2,
        D = (K) => f + (K - U) * C,
        I = Math.round(70 + (r + 6) * C),
        N = (K) => 40 + K * C,
        y = `<line x1="${D(-u / 2)}" y1="${N(0)}" x2="${D(u / 2)}" y2="${N(
          0,
        )}" stroke="#222" stroke-width="4"/>
    <text x="${D(u / 2)}" y="${
      N(0) + 16
    }" font-size="10" fill="#444" text-anchor="end">screen (${u.toFixed(
      0,
    )} cm wide)</text>`,
        S = `<circle cx="${D(0)}" cy="${N(
          0,
        )}" r="4" fill="#222"><title>fixation</title></circle>
    <text x="${D(0) + 6}" y="${
      N(0) - 6
    }" font-size="10" fill="#222">fixation</text>`,
        n = [
          `<line x1="${D(c)}" y1="${N(r)}" x2="${D(m)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="2"/>`,
          `<line x1="${D(c)}" y1="${N(r)}" x2="${D(0)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="1" stroke-dasharray="4 3"/>`,
          `<line x1="${D(v)}" y1="${N(r)}" x2="${D(m)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="2"/>`,
          `<line x1="${D(v)}" y1="${N(r)}" x2="${D(0)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="1" stroke-dasharray="4 3"/>`,
        ].join(""),
        A = `
    <circle cx="${D(c)}" cy="${N(r)}" r="5" fill="#b26a00"/>
    <text x="${D(c)}" y="${
      N(r) + 18
    }" font-size="10" fill="#b26a00" text-anchor="middle">eye as the bug assumed</text>
    <circle cx="${D(v)}" cy="${N(r)}" r="5" fill="#2b6cb0"/>
    <text x="${D(v)}" y="${
      N(r) - 10
    }" font-size="10" fill="#2b6cb0" text-anchor="middle">your true eye</text>`,
        G = [(c + m) / 2, r / 2],
        B = [(v + m) / 2, r / 2],
        J = i !== 0 ? ((Math.abs(g[0]) - Math.abs(i)) / Math.abs(i)) * 100 : 0,
        X = `<circle cx="${D(m)}" cy="${N(0)}" r="4.5" fill="#b3261e"/>
    <text x="${D(m) - 6}" y="${
      N(0) - 8
    }" font-size="10" fill="#b3261e" text-anchor="end">drawn ${ft(
      m.toFixed(1),
    )} cm</text>
    <text x="${D(G[0]) + 8}" y="${
      N(G[1]) + 4
    }" font-size="10" fill="#b26a00">requested ${ft(i)}\xB0</text>
    <text x="${D(B[0]) - 8}" y="${
      N(B[1]) - 6
    }" font-size="10" fill="#2b6cb0">actual ${ft(g[0].toFixed(2))}\xB0${
      i ? ` (${Ht(J)} farther)` : ""
    }</text>`;
      t.innerHTML = `<svg viewBox="0 0 ${k} ${I}" width="${k}" height="${I}">${y}${S}${n}${A}${X}</svg>`;
    },
    re = () => {
      Ae(), ne(), Re();
    };
  ["preset", "w", "h", "ppc", "grid", "ref"].forEach((t) =>
    vt[t].addEventListener("change", re),
  );
  ["dist", "ex", "ey"].forEach((t) => vt[t].addEventListener("input", re));
  document.getElementById("xp-req").addEventListener("input", () => {
    Ae(), Re();
  });
  document.getElementById("xp-char").addEventListener("input", () => {
    Lt = null;
  });
  ["size", "sizedim"].forEach((t) =>
    document.getElementById("xp-" + t).addEventListener("input", () => {
      (document.getElementById("xp-size-v").textContent =
        document.getElementById("xp-size").value),
        ne();
    }),
  );
  var Fe = (t) => {
    ($e = t),
      document
        .getElementById("xp-mode-pos")
        .classList.toggle("on", t === "placement"),
      document
        .getElementById("xp-mode-size")
        .classList.toggle("on", t === "size"),
      document
        .getElementById("xp-sizeopts")
        .classList.toggle("show", t === "size"),
      ne();
  };
  document
    .getElementById("xp-mode-pos")
    .addEventListener("click", () => Fe("placement"));
  document
    .getElementById("xp-mode-size")
    .addEventListener("click", () => Fe("size"));
  re();
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
