"use strict";
(() => {
  var Re = Object.create;
  var re = Object.defineProperty;
  var Ae = Object.getOwnPropertyDescriptor;
  var Fe = Object.getOwnPropertyNames;
  var Pe = Object.getPrototypeOf,
    Te = Object.prototype.hasOwnProperty;
  var Nt = ((t) =>
    typeof require < "u"
      ? require
      : typeof Proxy < "u"
      ? new Proxy(t, { get: (m, l) => (typeof require < "u" ? require : m)[l] })
      : t)(function (t) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + t + '" is not supported');
  });
  var Ie = (t, m) => () => (
    m || t((m = { exports: {} }).exports, m), m.exports
  );
  var Oe = (t, m, l, s) => {
    if ((m && typeof m == "object") || typeof m == "function")
      for (let i of Fe(m))
        !Te.call(t, i) &&
          i !== l &&
          re(t, i, {
            get: () => m[i],
            enumerable: !(s = Ae(m, i)) || s.enumerable,
          });
    return t;
  };
  var Be = (t, m, l) => (
    (l = t != null ? Re(Pe(t)) : {}),
    Oe(
      m || !t || !t.__esModule
        ? re(l, "default", { value: t, enumerable: !0 })
        : l,
      t,
    )
  );
  var ie = Ie((ne, Ht) => {
    (function (t) {
      typeof ne == "object" && typeof Ht < "u"
        ? (Ht.exports = t())
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
      return (function t(m, l, s) {
        function i(h, g) {
          if (!l[h]) {
            if (!m[h]) {
              var u = typeof Nt == "function" && Nt;
              if (!g && u) return u(h, !0);
              if (a) return a(h, !0);
              var _ = new Error("Cannot find module '" + h + "'");
              throw ((_.code = "MODULE_NOT_FOUND"), _);
            }
            var c = (l[h] = { exports: {} });
            m[h][0].call(
              c.exports,
              function (b) {
                var n = m[h][1][b];
                return i(n || b);
              },
              c,
              c.exports,
              t,
              m,
              l,
              s,
            );
          }
          return l[h].exports;
        }
        for (var a = typeof Nt == "function" && Nt, o = 0; o < s.length; o++)
          i(s[o]);
        return i;
      })(
        {
          1: [
            function (t, m, l) {
              "use strict";
              var s = t("./utils"),
                i = t("./support"),
                a =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              (l.encode = function (o) {
                for (
                  var h,
                    g,
                    u,
                    _,
                    c,
                    b,
                    n,
                    f = [],
                    d = 0,
                    w = o.length,
                    x = w,
                    C = s.getTypeOf(o) !== "string";
                  d < o.length;

                )
                  (x = w - d),
                    (u = C
                      ? ((h = o[d++]),
                        (g = d < w ? o[d++] : 0),
                        d < w ? o[d++] : 0)
                      : ((h = o.charCodeAt(d++)),
                        (g = d < w ? o.charCodeAt(d++) : 0),
                        d < w ? o.charCodeAt(d++) : 0)),
                    (_ = h >> 2),
                    (c = ((3 & h) << 4) | (g >> 4)),
                    (b = 1 < x ? ((15 & g) << 2) | (u >> 6) : 64),
                    (n = 2 < x ? 63 & u : 64),
                    f.push(
                      a.charAt(_) + a.charAt(c) + a.charAt(b) + a.charAt(n),
                    );
                return f.join("");
              }),
                (l.decode = function (o) {
                  var h,
                    g,
                    u,
                    _,
                    c,
                    b,
                    n = 0,
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
                    w = i.uint8array ? new Uint8Array(0 | x) : new Array(0 | x);
                    n < o.length;

                  )
                    (h =
                      (a.indexOf(o.charAt(n++)) << 2) |
                      ((_ = a.indexOf(o.charAt(n++))) >> 4)),
                      (g =
                        ((15 & _) << 4) |
                        ((c = a.indexOf(o.charAt(n++))) >> 2)),
                      (u = ((3 & c) << 6) | (b = a.indexOf(o.charAt(n++)))),
                      (w[f++] = h),
                      c !== 64 && (w[f++] = g),
                      b !== 64 && (w[f++] = u);
                  return w;
                });
            },
            { "./support": 30, "./utils": 32 },
          ],
          2: [
            function (t, m, l) {
              "use strict";
              var s = t("./external"),
                i = t("./stream/DataWorker"),
                a = t("./stream/Crc32Probe"),
                o = t("./stream/DataLengthProbe");
              function h(g, u, _, c, b) {
                (this.compressedSize = g),
                  (this.uncompressedSize = u),
                  (this.crc32 = _),
                  (this.compression = c),
                  (this.compressedContent = b);
              }
              (h.prototype = {
                getContentWorker: function () {
                  var g = new i(s.Promise.resolve(this.compressedContent))
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
                  return new i(s.Promise.resolve(this.compressedContent))
                    .withStreamInfo("compressedSize", this.compressedSize)
                    .withStreamInfo("uncompressedSize", this.uncompressedSize)
                    .withStreamInfo("crc32", this.crc32)
                    .withStreamInfo("compression", this.compression);
                },
              }),
                (h.createWorkerFrom = function (g, u, _) {
                  return g
                    .pipe(new a())
                    .pipe(new o("uncompressedSize"))
                    .pipe(u.compressWorker(_))
                    .pipe(new o("compressedSize"))
                    .withStreamInfo("compression", u);
                }),
                (m.exports = h);
            },
            {
              "./external": 6,
              "./stream/Crc32Probe": 25,
              "./stream/DataLengthProbe": 26,
              "./stream/DataWorker": 27,
            },
          ],
          3: [
            function (t, m, l) {
              "use strict";
              var s = t("./stream/GenericWorker");
              (l.STORE = {
                magic: "\0\0",
                compressWorker: function () {
                  return new s("STORE compression");
                },
                uncompressWorker: function () {
                  return new s("STORE decompression");
                },
              }),
                (l.DEFLATE = t("./flate"));
            },
            { "./flate": 7, "./stream/GenericWorker": 28 },
          ],
          4: [
            function (t, m, l) {
              "use strict";
              var s = t("./utils"),
                i = (function () {
                  for (var a, o = [], h = 0; h < 256; h++) {
                    a = h;
                    for (var g = 0; g < 8; g++)
                      a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1;
                    o[h] = a;
                  }
                  return o;
                })();
              m.exports = function (a, o) {
                return a !== void 0 && a.length
                  ? s.getTypeOf(a) !== "string"
                    ? (function (h, g, u, _) {
                        var c = i,
                          b = _ + u;
                        h ^= -1;
                        for (var n = _; n < b; n++)
                          h = (h >>> 8) ^ c[255 & (h ^ g[n])];
                        return -1 ^ h;
                      })(0 | o, a, a.length, 0)
                    : (function (h, g, u, _) {
                        var c = i,
                          b = _ + u;
                        h ^= -1;
                        for (var n = _; n < b; n++)
                          h = (h >>> 8) ^ c[255 & (h ^ g.charCodeAt(n))];
                        return -1 ^ h;
                      })(0 | o, a, a.length, 0)
                  : 0;
              };
            },
            { "./utils": 32 },
          ],
          5: [
            function (t, m, l) {
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
            function (t, m, l) {
              "use strict";
              var s = null;
              (s = typeof Promise < "u" ? Promise : t("lie")),
                (m.exports = { Promise: s });
            },
            { lie: 37 },
          ],
          7: [
            function (t, m, l) {
              "use strict";
              var s =
                  typeof Uint8Array < "u" &&
                  typeof Uint16Array < "u" &&
                  typeof Uint32Array < "u",
                i = t("pako"),
                a = t("./utils"),
                o = t("./stream/GenericWorker"),
                h = s ? "uint8array" : "array";
              function g(u, _) {
                o.call(this, "FlateWorker/" + u),
                  (this._pako = null),
                  (this._pakoAction = u),
                  (this._pakoOptions = _),
                  (this.meta = {});
              }
              (l.magic = "\b\0"),
                a.inherits(g, o),
                (g.prototype.processChunk = function (u) {
                  (this.meta = u.meta),
                    this._pako === null && this._createPako(),
                    this._pako.push(a.transformTo(h, u.data), !1);
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
                  this._pako = new i[this._pakoAction]({
                    raw: !0,
                    level: this._pakoOptions.level || -1,
                  });
                  var u = this;
                  this._pako.onData = function (_) {
                    u.push({ data: _, meta: u.meta });
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
            function (t, m, l) {
              "use strict";
              function s(c, b) {
                var n,
                  f = "";
                for (n = 0; n < b; n++)
                  (f += String.fromCharCode(255 & c)), (c >>>= 8);
                return f;
              }
              function i(c, b, n, f, d, w) {
                var x,
                  C,
                  k = c.file,
                  P = c.compression,
                  T = w !== h.utf8encode,
                  U = a.transformTo("string", w(k.name)),
                  D = a.transformTo("string", h.utf8encode(k.name)),
                  I = k.comment,
                  N = a.transformTo("string", w(I)),
                  y = a.transformTo("string", h.utf8encode(I)),
                  S = D.length !== k.name.length,
                  r = y.length !== I.length,
                  A = "",
                  q = "",
                  B = "",
                  J = k.dir,
                  X = k.date,
                  K = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                (b && !n) ||
                  ((K.crc32 = c.crc32),
                  (K.compressedSize = c.compressedSize),
                  (K.uncompressedSize = c.uncompressedSize));
                var F = 0;
                b && (F |= 8), T || (!S && !r) || (F |= 2048);
                var $ = 0,
                  V = 0;
                J && ($ |= 16),
                  d === "UNIX"
                    ? ((V = 798),
                      ($ |= (function (j, st) {
                        var dt = j;
                        return (
                          j || (dt = st ? 16893 : 33204), (65535 & dt) << 16
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
                    ((q = s(1, 1) + s(g(U), 4) + D),
                    (A += "up" + s(q.length, 2) + q)),
                  r &&
                    ((B = s(1, 1) + s(g(N), 4) + y),
                    (A += "uc" + s(B.length, 2) + B));
                var G = "";
                return (
                  (G += `
\0`),
                  (G += s(F, 2)),
                  (G += P.magic),
                  (G += s(x, 2)),
                  (G += s(C, 2)),
                  (G += s(K.crc32, 4)),
                  (G += s(K.compressedSize, 4)),
                  (G += s(K.uncompressedSize, 4)),
                  (G += s(U.length, 2)),
                  (G += s(A.length, 2)),
                  {
                    fileRecord: u.LOCAL_FILE_HEADER + G + U + A,
                    dirRecord:
                      u.CENTRAL_FILE_HEADER +
                      s(V, 2) +
                      G +
                      s(N.length, 2) +
                      "\0\0\0\0" +
                      s($, 4) +
                      s(f, 4) +
                      U +
                      A +
                      N,
                  }
                );
              }
              var a = t("../utils"),
                o = t("../stream/GenericWorker"),
                h = t("../utf8"),
                g = t("../crc32"),
                u = t("../signature");
              function _(c, b, n, f) {
                o.call(this, "ZipFileWorker"),
                  (this.bytesWritten = 0),
                  (this.zipComment = b),
                  (this.zipPlatform = n),
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
              a.inherits(_, o),
                (_.prototype.push = function (c) {
                  var b = c.meta.percent || 0,
                    n = this.entriesCount,
                    f = this._sources.length;
                  this.accumulate
                    ? this.contentBuffer.push(c)
                    : ((this.bytesWritten += c.data.length),
                      o.prototype.push.call(this, {
                        data: c.data,
                        meta: {
                          currentFile: this.currentFile,
                          percent: n ? (b + 100 * (n - f - 1)) / n : 100,
                        },
                      }));
                }),
                (_.prototype.openedSource = function (c) {
                  (this.currentSourceOffset = this.bytesWritten),
                    (this.currentFile = c.file.name);
                  var b = this.streamFiles && !c.file.dir;
                  if (b) {
                    var n = i(
                      c,
                      b,
                      !1,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                    this.push({ data: n.fileRecord, meta: { percent: 0 } });
                  } else this.accumulate = !0;
                }),
                (_.prototype.closedSource = function (c) {
                  this.accumulate = !1;
                  var b = this.streamFiles && !c.file.dir,
                    n = i(
                      c,
                      b,
                      !0,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                  if ((this.dirRecords.push(n.dirRecord), b))
                    this.push({
                      data: (function (f) {
                        return (
                          u.DATA_DESCRIPTOR +
                          s(f.crc32, 4) +
                          s(f.compressedSize, 4) +
                          s(f.uncompressedSize, 4)
                        );
                      })(c),
                      meta: { percent: 100 },
                    });
                  else
                    for (
                      this.push({ data: n.fileRecord, meta: { percent: 0 } });
                      this.contentBuffer.length;

                    )
                      this.push(this.contentBuffer.shift());
                  this.currentFile = null;
                }),
                (_.prototype.flush = function () {
                  for (
                    var c = this.bytesWritten, b = 0;
                    b < this.dirRecords.length;
                    b++
                  )
                    this.push({
                      data: this.dirRecords[b],
                      meta: { percent: 100 },
                    });
                  var n = this.bytesWritten - c,
                    f = (function (d, w, x, C, k) {
                      var P = a.transformTo("string", k(C));
                      return (
                        u.CENTRAL_DIRECTORY_END +
                        "\0\0\0\0" +
                        s(d, 2) +
                        s(d, 2) +
                        s(w, 4) +
                        s(x, 4) +
                        s(P.length, 2) +
                        P
                      );
                    })(
                      this.dirRecords.length,
                      n,
                      c,
                      this.zipComment,
                      this.encodeFileName,
                    );
                  this.push({ data: f, meta: { percent: 100 } });
                }),
                (_.prototype.prepareNextSource = function () {
                  (this.previous = this._sources.shift()),
                    this.openedSource(this.previous.streamInfo),
                    this.isPaused
                      ? this.previous.pause()
                      : this.previous.resume();
                }),
                (_.prototype.registerPrevious = function (c) {
                  this._sources.push(c);
                  var b = this;
                  return (
                    c.on("data", function (n) {
                      b.processChunk(n);
                    }),
                    c.on("end", function () {
                      b.closedSource(b.previous.streamInfo),
                        b._sources.length ? b.prepareNextSource() : b.end();
                    }),
                    c.on("error", function (n) {
                      b.error(n);
                    }),
                    this
                  );
                }),
                (_.prototype.resume = function () {
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
                (_.prototype.error = function (c) {
                  var b = this._sources;
                  if (!o.prototype.error.call(this, c)) return !1;
                  for (var n = 0; n < b.length; n++)
                    try {
                      b[n].error(c);
                    } catch {}
                  return !0;
                }),
                (_.prototype.lock = function () {
                  o.prototype.lock.call(this);
                  for (var c = this._sources, b = 0; b < c.length; b++)
                    c[b].lock();
                }),
                (m.exports = _);
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
            function (t, m, l) {
              "use strict";
              var s = t("../compressions"),
                i = t("./ZipFileWorker");
              l.generateWorker = function (a, o, h) {
                var g = new i(o.streamFiles, h, o.platform, o.encodeFileName),
                  u = 0;
                try {
                  a.forEach(function (_, c) {
                    u++;
                    var b = (function (w, x) {
                        var C = w || x,
                          k = s[C];
                        if (!k)
                          throw new Error(
                            C + " is not a valid compression method !",
                          );
                        return k;
                      })(c.options.compression, o.compression),
                      n =
                        c.options.compressionOptions ||
                        o.compressionOptions ||
                        {},
                      f = c.dir,
                      d = c.date;
                    c._compressWorker(b, n)
                      .withStreamInfo("file", {
                        name: _,
                        dir: f,
                        date: d,
                        comment: c.comment || "",
                        unixPermissions: c.unixPermissions,
                        dosPermissions: c.dosPermissions,
                      })
                      .pipe(g);
                  }),
                    (g.entriesCount = u);
                } catch (_) {
                  g.error(_);
                }
                return g;
              };
            },
            { "../compressions": 3, "./ZipFileWorker": 8 },
          ],
          10: [
            function (t, m, l) {
              "use strict";
              function s() {
                if (!(this instanceof s)) return new s();
                if (arguments.length)
                  throw new Error(
                    "The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                (this.files = Object.create(null)),
                  (this.comment = null),
                  (this.root = ""),
                  (this.clone = function () {
                    var i = new s();
                    for (var a in this)
                      typeof this[a] != "function" && (i[a] = this[a]);
                    return i;
                  });
              }
              ((s.prototype = t("./object")).loadAsync = t("./load")),
                (s.support = t("./support")),
                (s.defaults = t("./defaults")),
                (s.version = "3.10.1"),
                (s.loadAsync = function (i, a) {
                  return new s().loadAsync(i, a);
                }),
                (s.external = t("./external")),
                (m.exports = s);
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
            function (t, m, l) {
              "use strict";
              var s = t("./utils"),
                i = t("./external"),
                a = t("./utf8"),
                o = t("./zipEntries"),
                h = t("./stream/Crc32Probe"),
                g = t("./nodejsUtils");
              function u(_) {
                return new i.Promise(function (c, b) {
                  var n = _.decompressed.getContentWorker().pipe(new h());
                  n.on("error", function (f) {
                    b(f);
                  })
                    .on("end", function () {
                      n.streamInfo.crc32 !== _.decompressed.crc32
                        ? b(new Error("Corrupted zip : CRC32 mismatch"))
                        : c();
                    })
                    .resume();
                });
              }
              m.exports = function (_, c) {
                var b = this;
                return (
                  (c = s.extend(c || {}, {
                    base64: !1,
                    checkCRC32: !1,
                    optimizedBinaryString: !1,
                    createFolders: !1,
                    decodeFileName: a.utf8decode,
                  })),
                  g.isNode && g.isStream(_)
                    ? i.Promise.reject(
                        new Error(
                          "JSZip can't accept a stream when loading a zip file.",
                        ),
                      )
                    : s
                        .prepareContent(
                          "the loaded zip file",
                          _,
                          !0,
                          c.optimizedBinaryString,
                          c.base64,
                        )
                        .then(function (n) {
                          var f = new o(c);
                          return f.load(n), f;
                        })
                        .then(function (n) {
                          var f = [i.Promise.resolve(n)],
                            d = n.files;
                          if (c.checkCRC32)
                            for (var w = 0; w < d.length; w++) f.push(u(d[w]));
                          return i.Promise.all(f);
                        })
                        .then(function (n) {
                          for (
                            var f = n.shift(), d = f.files, w = 0;
                            w < d.length;
                            w++
                          ) {
                            var x = d[w],
                              C = x.fileNameStr,
                              k = s.resolve(x.fileNameStr);
                            b.file(k, x.decompressed, {
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
                              x.dir || (b.file(k).unsafeOriginalName = C);
                          }
                          return (
                            f.zipComment.length && (b.comment = f.zipComment), b
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
            function (t, m, l) {
              "use strict";
              var s = t("../utils"),
                i = t("../stream/GenericWorker");
              function a(o, h) {
                i.call(this, "Nodejs stream input adapter for " + o),
                  (this._upstreamEnded = !1),
                  this._bindStream(h);
              }
              s.inherits(a, i),
                (a.prototype._bindStream = function (o) {
                  var h = this;
                  (this._stream = o).pause(),
                    o
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
                (a.prototype.pause = function () {
                  return (
                    !!i.prototype.pause.call(this) && (this._stream.pause(), !0)
                  );
                }),
                (a.prototype.resume = function () {
                  return (
                    !!i.prototype.resume.call(this) &&
                    (this._upstreamEnded ? this.end() : this._stream.resume(),
                    !0)
                  );
                }),
                (m.exports = a);
            },
            { "../stream/GenericWorker": 28, "../utils": 32 },
          ],
          13: [
            function (t, m, l) {
              "use strict";
              var s = t("readable-stream").Readable;
              function i(a, o, h) {
                s.call(this, o), (this._helper = a);
                var g = this;
                a.on("data", function (u, _) {
                  g.push(u) || g._helper.pause(), h && h(_);
                })
                  .on("error", function (u) {
                    g.emit("error", u);
                  })
                  .on("end", function () {
                    g.push(null);
                  });
              }
              t("../utils").inherits(i, s),
                (i.prototype._read = function () {
                  this._helper.resume();
                }),
                (m.exports = i);
            },
            { "../utils": 32, "readable-stream": 16 },
          ],
          14: [
            function (t, m, l) {
              "use strict";
              m.exports = {
                isNode: typeof Buffer < "u",
                newBufferFrom: function (s, i) {
                  if (Buffer.from && Buffer.from !== Uint8Array.from)
                    return Buffer.from(s, i);
                  if (typeof s == "number")
                    throw new Error('The "data" argument must not be a number');
                  return new Buffer(s, i);
                },
                allocBuffer: function (s) {
                  if (Buffer.alloc) return Buffer.alloc(s);
                  var i = new Buffer(s);
                  return i.fill(0), i;
                },
                isBuffer: function (s) {
                  return Buffer.isBuffer(s);
                },
                isStream: function (s) {
                  return (
                    s &&
                    typeof s.on == "function" &&
                    typeof s.pause == "function" &&
                    typeof s.resume == "function"
                  );
                },
              };
            },
            {},
          ],
          15: [
            function (t, m, l) {
              "use strict";
              function s(k, P, T) {
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
                    : b.isNode && b.isStream(P)
                    ? new n(k, P)
                    : a.prepareContent(
                        k,
                        P,
                        I.binary,
                        I.optimizedBinaryString,
                        I.base64,
                      );
                var S = new _(k, y, I);
                this.files[k] = S;
              }
              var i = t("./utf8"),
                a = t("./utils"),
                o = t("./stream/GenericWorker"),
                h = t("./stream/StreamHelper"),
                g = t("./defaults"),
                u = t("./compressedObject"),
                _ = t("./zipObject"),
                c = t("./generate"),
                b = t("./nodejsUtils"),
                n = t("./nodejs/NodejsStreamInputAdapter"),
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
                      s.call(this, k, null, { dir: !0, createFolders: P }),
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
                    return (k = this.root + k), s.call(this, k, P, T), this;
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
                        encodeFileName: i.utf8encode,
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
                  return new h(P, T.type || "string", T.mimeType);
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
              m.exports = C;
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
            function (t, m, l) {
              "use strict";
              m.exports = t("stream");
            },
            { stream: void 0 },
          ],
          17: [
            function (t, m, l) {
              "use strict";
              var s = t("./DataReader");
              function i(a) {
                s.call(this, a);
                for (var o = 0; o < this.data.length; o++) a[o] = 255 & a[o];
              }
              t("../utils").inherits(i, s),
                (i.prototype.byteAt = function (a) {
                  return this.data[this.zero + a];
                }),
                (i.prototype.lastIndexOfSignature = function (a) {
                  for (
                    var o = a.charCodeAt(0),
                      h = a.charCodeAt(1),
                      g = a.charCodeAt(2),
                      u = a.charCodeAt(3),
                      _ = this.length - 4;
                    0 <= _;
                    --_
                  )
                    if (
                      this.data[_] === o &&
                      this.data[_ + 1] === h &&
                      this.data[_ + 2] === g &&
                      this.data[_ + 3] === u
                    )
                      return _ - this.zero;
                  return -1;
                }),
                (i.prototype.readAndCheckSignature = function (a) {
                  var o = a.charCodeAt(0),
                    h = a.charCodeAt(1),
                    g = a.charCodeAt(2),
                    u = a.charCodeAt(3),
                    _ = this.readData(4);
                  return o === _[0] && h === _[1] && g === _[2] && u === _[3];
                }),
                (i.prototype.readData = function (a) {
                  if ((this.checkOffset(a), a === 0)) return [];
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (m.exports = i);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          18: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils");
              function i(a) {
                (this.data = a),
                  (this.length = a.length),
                  (this.index = 0),
                  (this.zero = 0);
              }
              (i.prototype = {
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
                    h = 0;
                  for (
                    this.checkOffset(a), o = this.index + a - 1;
                    o >= this.index;
                    o--
                  )
                    h = (h << 8) + this.byteAt(o);
                  return (this.index += a), h;
                },
                readString: function (a) {
                  return s.transformTo("string", this.readData(a));
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
                (m.exports = i);
            },
            { "../utils": 32 },
          ],
          19: [
            function (t, m, l) {
              "use strict";
              var s = t("./Uint8ArrayReader");
              function i(a) {
                s.call(this, a);
              }
              t("../utils").inherits(i, s),
                (i.prototype.readData = function (a) {
                  this.checkOffset(a);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (m.exports = i);
            },
            { "../utils": 32, "./Uint8ArrayReader": 21 },
          ],
          20: [
            function (t, m, l) {
              "use strict";
              var s = t("./DataReader");
              function i(a) {
                s.call(this, a);
              }
              t("../utils").inherits(i, s),
                (i.prototype.byteAt = function (a) {
                  return this.data.charCodeAt(this.zero + a);
                }),
                (i.prototype.lastIndexOfSignature = function (a) {
                  return this.data.lastIndexOf(a) - this.zero;
                }),
                (i.prototype.readAndCheckSignature = function (a) {
                  return a === this.readData(4);
                }),
                (i.prototype.readData = function (a) {
                  this.checkOffset(a);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (m.exports = i);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          21: [
            function (t, m, l) {
              "use strict";
              var s = t("./ArrayReader");
              function i(a) {
                s.call(this, a);
              }
              t("../utils").inherits(i, s),
                (i.prototype.readData = function (a) {
                  if ((this.checkOffset(a), a === 0)) return new Uint8Array(0);
                  var o = this.data.subarray(
                    this.zero + this.index,
                    this.zero + this.index + a,
                  );
                  return (this.index += a), o;
                }),
                (m.exports = i);
            },
            { "../utils": 32, "./ArrayReader": 17 },
          ],
          22: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils"),
                i = t("../support"),
                a = t("./ArrayReader"),
                o = t("./StringReader"),
                h = t("./NodeBufferReader"),
                g = t("./Uint8ArrayReader");
              m.exports = function (u) {
                var _ = s.getTypeOf(u);
                return (
                  s.checkSupport(_),
                  _ !== "string" || i.uint8array
                    ? _ === "nodebuffer"
                      ? new h(u)
                      : i.uint8array
                      ? new g(s.transformTo("uint8array", u))
                      : new a(s.transformTo("array", u))
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
            function (t, m, l) {
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
            function (t, m, l) {
              "use strict";
              var s = t("./GenericWorker"),
                i = t("../utils");
              function a(o) {
                s.call(this, "ConvertWorker to " + o), (this.destType = o);
              }
              i.inherits(a, s),
                (a.prototype.processChunk = function (o) {
                  this.push({
                    data: i.transformTo(this.destType, o.data),
                    meta: o.meta,
                  });
                }),
                (m.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          25: [
            function (t, m, l) {
              "use strict";
              var s = t("./GenericWorker"),
                i = t("../crc32");
              function a() {
                s.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              t("../utils").inherits(a, s),
                (a.prototype.processChunk = function (o) {
                  (this.streamInfo.crc32 = i(
                    o.data,
                    this.streamInfo.crc32 || 0,
                  )),
                    this.push(o);
                }),
                (m.exports = a);
            },
            { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 },
          ],
          26: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils"),
                i = t("./GenericWorker");
              function a(o) {
                i.call(this, "DataLengthProbe for " + o),
                  (this.propName = o),
                  this.withStreamInfo(o, 0);
              }
              s.inherits(a, i),
                (a.prototype.processChunk = function (o) {
                  if (o) {
                    var h = this.streamInfo[this.propName] || 0;
                    this.streamInfo[this.propName] = h + o.data.length;
                  }
                  i.prototype.processChunk.call(this, o);
                }),
                (m.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          27: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils"),
                i = t("./GenericWorker");
              function a(o) {
                i.call(this, "DataWorker");
                var h = this;
                (this.dataIsReady = !1),
                  (this.index = 0),
                  (this.max = 0),
                  (this.data = null),
                  (this.type = ""),
                  (this._tickScheduled = !1),
                  o.then(
                    function (g) {
                      (h.dataIsReady = !0),
                        (h.data = g),
                        (h.max = (g && g.length) || 0),
                        (h.type = s.getTypeOf(g)),
                        h.isPaused || h._tickAndRepeat();
                    },
                    function (g) {
                      h.error(g);
                    },
                  );
              }
              s.inherits(a, i),
                (a.prototype.cleanUp = function () {
                  i.prototype.cleanUp.call(this), (this.data = null);
                }),
                (a.prototype.resume = function () {
                  return (
                    !!i.prototype.resume.call(this) &&
                    (!this._tickScheduled &&
                      this.dataIsReady &&
                      ((this._tickScheduled = !0),
                      s.delay(this._tickAndRepeat, [], this)),
                    !0)
                  );
                }),
                (a.prototype._tickAndRepeat = function () {
                  (this._tickScheduled = !1),
                    this.isPaused ||
                      this.isFinished ||
                      (this._tick(),
                      this.isFinished ||
                        (s.delay(this._tickAndRepeat, [], this),
                        (this._tickScheduled = !0)));
                }),
                (a.prototype._tick = function () {
                  if (this.isPaused || this.isFinished) return !1;
                  var o = null,
                    h = Math.min(this.max, this.index + 16384);
                  if (this.index >= this.max) return this.end();
                  switch (this.type) {
                    case "string":
                      o = this.data.substring(this.index, h);
                      break;
                    case "uint8array":
                      o = this.data.subarray(this.index, h);
                      break;
                    case "array":
                    case "nodebuffer":
                      o = this.data.slice(this.index, h);
                  }
                  return (
                    (this.index = h),
                    this.push({
                      data: o,
                      meta: {
                        percent: this.max ? (this.index / this.max) * 100 : 0,
                      },
                    })
                  );
                }),
                (m.exports = a);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          28: [
            function (t, m, l) {
              "use strict";
              function s(i) {
                (this.name = i || "default"),
                  (this.streamInfo = {}),
                  (this.generatedError = null),
                  (this.extraStreamInfo = {}),
                  (this.isPaused = !0),
                  (this.isFinished = !1),
                  (this.isLocked = !1),
                  (this._listeners = { data: [], end: [], error: [] }),
                  (this.previous = null);
              }
              (s.prototype = {
                push: function (i) {
                  this.emit("data", i);
                },
                end: function () {
                  if (this.isFinished) return !1;
                  this.flush();
                  try {
                    this.emit("end"), this.cleanUp(), (this.isFinished = !0);
                  } catch (i) {
                    this.emit("error", i);
                  }
                  return !0;
                },
                error: function (i) {
                  return (
                    !this.isFinished &&
                    (this.isPaused
                      ? (this.generatedError = i)
                      : ((this.isFinished = !0),
                        this.emit("error", i),
                        this.previous && this.previous.error(i),
                        this.cleanUp()),
                    !0)
                  );
                },
                on: function (i, a) {
                  return this._listeners[i].push(a), this;
                },
                cleanUp: function () {
                  (this.streamInfo =
                    this.generatedError =
                    this.extraStreamInfo =
                      null),
                    (this._listeners = []);
                },
                emit: function (i, a) {
                  if (this._listeners[i])
                    for (var o = 0; o < this._listeners[i].length; o++)
                      this._listeners[i][o].call(this, a);
                },
                pipe: function (i) {
                  return i.registerPrevious(this);
                },
                registerPrevious: function (i) {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.streamInfo = i.streamInfo),
                    this.mergeStreamInfo(),
                    (this.previous = i);
                  var a = this;
                  return (
                    i.on("data", function (o) {
                      a.processChunk(o);
                    }),
                    i.on("end", function () {
                      a.end();
                    }),
                    i.on("error", function (o) {
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
                  var i = (this.isPaused = !1);
                  return (
                    this.generatedError &&
                      (this.error(this.generatedError), (i = !0)),
                    this.previous && this.previous.resume(),
                    !i
                  );
                },
                flush: function () {},
                processChunk: function (i) {
                  this.push(i);
                },
                withStreamInfo: function (i, a) {
                  return (
                    (this.extraStreamInfo[i] = a), this.mergeStreamInfo(), this
                  );
                },
                mergeStreamInfo: function () {
                  for (var i in this.extraStreamInfo)
                    Object.prototype.hasOwnProperty.call(
                      this.extraStreamInfo,
                      i,
                    ) && (this.streamInfo[i] = this.extraStreamInfo[i]);
                },
                lock: function () {
                  if (this.isLocked)
                    throw new Error(
                      "The stream '" + this + "' has already been used.",
                    );
                  (this.isLocked = !0), this.previous && this.previous.lock();
                },
                toString: function () {
                  var i = "Worker " + this.name;
                  return this.previous ? this.previous + " -> " + i : i;
                },
              }),
                (m.exports = s);
            },
            {},
          ],
          29: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils"),
                i = t("./ConvertWorker"),
                a = t("./GenericWorker"),
                o = t("../base64"),
                h = t("../support"),
                g = t("../external"),
                u = null;
              if (h.nodestream)
                try {
                  u = t("../nodejs/NodejsStreamOutputAdapter");
                } catch {}
              function _(b, n) {
                return new g.Promise(function (f, d) {
                  var w = [],
                    x = b._internalType,
                    C = b._outputType,
                    k = b._mimeType;
                  b.on("data", function (P, T) {
                    w.push(P), n && n(T);
                  })
                    .on("error", function (P) {
                      (w = []), d(P);
                    })
                    .on("end", function () {
                      try {
                        var P = (function (T, U, D) {
                          switch (T) {
                            case "blob":
                              return s.newBlob(
                                s.transformTo("arraybuffer", U),
                                D,
                              );
                            case "base64":
                              return o.encode(U);
                            default:
                              return s.transformTo(T, U);
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
              function c(b, n, f) {
                var d = n;
                switch (n) {
                  case "blob":
                  case "arraybuffer":
                    d = "uint8array";
                    break;
                  case "base64":
                    d = "string";
                }
                try {
                  (this._internalType = d),
                    (this._outputType = n),
                    (this._mimeType = f),
                    s.checkSupport(d),
                    (this._worker = b.pipe(new i(d))),
                    b.lock();
                } catch (w) {
                  (this._worker = new a("error")), this._worker.error(w);
                }
              }
              (c.prototype = {
                accumulate: function (b) {
                  return _(this, b);
                },
                on: function (b, n) {
                  var f = this;
                  return (
                    b === "data"
                      ? this._worker.on(b, function (d) {
                          n.call(f, d.data, d.meta);
                        })
                      : this._worker.on(b, function () {
                          s.delay(n, arguments, f);
                        }),
                    this
                  );
                },
                resume: function () {
                  return s.delay(this._worker.resume, [], this._worker), this;
                },
                pause: function () {
                  return this._worker.pause(), this;
                },
                toNodejsStream: function (b) {
                  if (
                    (s.checkSupport("nodestream"),
                    this._outputType !== "nodebuffer")
                  )
                    throw new Error(
                      this._outputType + " is not supported by this method",
                    );
                  return new u(
                    this,
                    { objectMode: this._outputType !== "nodebuffer" },
                    b,
                  );
                },
              }),
                (m.exports = c);
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
            function (t, m, l) {
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
                var s = new ArrayBuffer(0);
                try {
                  l.blob =
                    new Blob([s], { type: "application/zip" }).size === 0;
                } catch {
                  try {
                    var i = new (self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder)();
                    i.append(s),
                      (l.blob = i.getBlob("application/zip").size === 0);
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
            function (t, m, l) {
              "use strict";
              for (
                var s = t("./utils"),
                  i = t("./support"),
                  a = t("./nodejsUtils"),
                  o = t("./stream/GenericWorker"),
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
              function u() {
                o.call(this, "utf-8 decode"), (this.leftOver = null);
              }
              function _() {
                o.call(this, "utf-8 encode");
              }
              (l.utf8encode = function (c) {
                return i.nodebuffer
                  ? a.newBufferFrom(c, "utf-8")
                  : (function (b) {
                      var n,
                        f,
                        d,
                        w,
                        x,
                        C = b.length,
                        k = 0;
                      for (w = 0; w < C; w++)
                        (64512 & (f = b.charCodeAt(w))) == 55296 &&
                          w + 1 < C &&
                          (64512 & (d = b.charCodeAt(w + 1))) == 56320 &&
                          ((f = 65536 + ((f - 55296) << 10) + (d - 56320)),
                          w++),
                          (k += f < 128 ? 1 : f < 2048 ? 2 : f < 65536 ? 3 : 4);
                      for (
                        n = i.uint8array ? new Uint8Array(k) : new Array(k),
                          w = x = 0;
                        x < k;
                        w++
                      )
                        (64512 & (f = b.charCodeAt(w))) == 55296 &&
                          w + 1 < C &&
                          (64512 & (d = b.charCodeAt(w + 1))) == 56320 &&
                          ((f = 65536 + ((f - 55296) << 10) + (d - 56320)),
                          w++),
                          f < 128
                            ? (n[x++] = f)
                            : (f < 2048
                                ? (n[x++] = 192 | (f >>> 6))
                                : (f < 65536
                                    ? (n[x++] = 224 | (f >>> 12))
                                    : ((n[x++] = 240 | (f >>> 18)),
                                      (n[x++] = 128 | ((f >>> 12) & 63))),
                                  (n[x++] = 128 | ((f >>> 6) & 63))),
                              (n[x++] = 128 | (63 & f)));
                      return n;
                    })(c);
              }),
                (l.utf8decode = function (c) {
                  return i.nodebuffer
                    ? s.transformTo("nodebuffer", c).toString("utf-8")
                    : (function (b) {
                        var n,
                          f,
                          d,
                          w,
                          x = b.length,
                          C = new Array(2 * x);
                        for (n = f = 0; n < x; )
                          if ((d = b[n++]) < 128) C[f++] = d;
                          else if (4 < (w = h[d]))
                            (C[f++] = 65533), (n += w - 1);
                          else {
                            for (
                              d &= w === 2 ? 31 : w === 3 ? 15 : 7;
                              1 < w && n < x;

                            )
                              (d = (d << 6) | (63 & b[n++])), w--;
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
                          s.applyFromCharCode(C)
                        );
                      })(
                        (c = s.transformTo(
                          i.uint8array ? "uint8array" : "array",
                          c,
                        )),
                      );
                }),
                s.inherits(u, o),
                (u.prototype.processChunk = function (c) {
                  var b = s.transformTo(
                    i.uint8array ? "uint8array" : "array",
                    c.data,
                  );
                  if (this.leftOver && this.leftOver.length) {
                    if (i.uint8array) {
                      var n = b;
                      (b = new Uint8Array(n.length + this.leftOver.length)).set(
                        this.leftOver,
                        0,
                      ),
                        b.set(n, this.leftOver.length);
                    } else b = this.leftOver.concat(b);
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
                      return C < 0 || C === 0 ? x : C + h[w[C]] > x ? C : x;
                    })(b),
                    d = b;
                  f !== b.length &&
                    (i.uint8array
                      ? ((d = b.subarray(0, f)),
                        (this.leftOver = b.subarray(f, b.length)))
                      : ((d = b.slice(0, f)),
                        (this.leftOver = b.slice(f, b.length)))),
                    this.push({ data: l.utf8decode(d), meta: c.meta });
                }),
                (u.prototype.flush = function () {
                  this.leftOver &&
                    this.leftOver.length &&
                    (this.push({ data: l.utf8decode(this.leftOver), meta: {} }),
                    (this.leftOver = null));
                }),
                (l.Utf8DecodeWorker = u),
                s.inherits(_, o),
                (_.prototype.processChunk = function (c) {
                  this.push({ data: l.utf8encode(c.data), meta: c.meta });
                }),
                (l.Utf8EncodeWorker = _);
            },
            {
              "./nodejsUtils": 14,
              "./stream/GenericWorker": 28,
              "./support": 30,
              "./utils": 32,
            },
          ],
          32: [
            function (t, m, l) {
              "use strict";
              var s = t("./support"),
                i = t("./base64"),
                a = t("./nodejsUtils"),
                o = t("./external");
              function h(n) {
                return n;
              }
              function g(n, f) {
                for (var d = 0; d < n.length; ++d) f[d] = 255 & n.charCodeAt(d);
                return f;
              }
              t("setimmediate"),
                (l.newBlob = function (n, f) {
                  l.checkSupport("blob");
                  try {
                    return new Blob([n], { type: f });
                  } catch {
                    try {
                      var d = new (self.BlobBuilder ||
                        self.WebKitBlobBuilder ||
                        self.MozBlobBuilder ||
                        self.MSBlobBuilder)();
                      return d.append(n), d.getBlob(f);
                    } catch {
                      throw new Error("Bug : can't construct the Blob.");
                    }
                  }
                });
              var u = {
                stringifyByChunk: function (n, f, d) {
                  var w = [],
                    x = 0,
                    C = n.length;
                  if (C <= d) return String.fromCharCode.apply(null, n);
                  for (; x < C; )
                    f === "array" || f === "nodebuffer"
                      ? w.push(
                          String.fromCharCode.apply(
                            null,
                            n.slice(x, Math.min(x + d, C)),
                          ),
                        )
                      : w.push(
                          String.fromCharCode.apply(
                            null,
                            n.subarray(x, Math.min(x + d, C)),
                          ),
                        ),
                      (x += d);
                  return w.join("");
                },
                stringifyByChar: function (n) {
                  for (var f = "", d = 0; d < n.length; d++)
                    f += String.fromCharCode(n[d]);
                  return f;
                },
                applyCanBeUsed: {
                  uint8array: (function () {
                    try {
                      return (
                        s.uint8array &&
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
                        s.nodebuffer &&
                        String.fromCharCode.apply(null, a.allocBuffer(1))
                          .length === 1
                      );
                    } catch {
                      return !1;
                    }
                  })(),
                },
              };
              function _(n) {
                var f = 65536,
                  d = l.getTypeOf(n),
                  w = !0;
                if (
                  (d === "uint8array"
                    ? (w = u.applyCanBeUsed.uint8array)
                    : d === "nodebuffer" && (w = u.applyCanBeUsed.nodebuffer),
                  w)
                )
                  for (; 1 < f; )
                    try {
                      return u.stringifyByChunk(n, d, f);
                    } catch {
                      f = Math.floor(f / 2);
                    }
                return u.stringifyByChar(n);
              }
              function c(n, f) {
                for (var d = 0; d < n.length; d++) f[d] = n[d];
                return f;
              }
              l.applyFromCharCode = _;
              var b = {};
              (b.string = {
                string: h,
                array: function (n) {
                  return g(n, new Array(n.length));
                },
                arraybuffer: function (n) {
                  return b.string.uint8array(n).buffer;
                },
                uint8array: function (n) {
                  return g(n, new Uint8Array(n.length));
                },
                nodebuffer: function (n) {
                  return g(n, a.allocBuffer(n.length));
                },
              }),
                (b.array = {
                  string: _,
                  array: h,
                  arraybuffer: function (n) {
                    return new Uint8Array(n).buffer;
                  },
                  uint8array: function (n) {
                    return new Uint8Array(n);
                  },
                  nodebuffer: function (n) {
                    return a.newBufferFrom(n);
                  },
                }),
                (b.arraybuffer = {
                  string: function (n) {
                    return _(new Uint8Array(n));
                  },
                  array: function (n) {
                    return c(new Uint8Array(n), new Array(n.byteLength));
                  },
                  arraybuffer: h,
                  uint8array: function (n) {
                    return new Uint8Array(n);
                  },
                  nodebuffer: function (n) {
                    return a.newBufferFrom(new Uint8Array(n));
                  },
                }),
                (b.uint8array = {
                  string: _,
                  array: function (n) {
                    return c(n, new Array(n.length));
                  },
                  arraybuffer: function (n) {
                    return n.buffer;
                  },
                  uint8array: h,
                  nodebuffer: function (n) {
                    return a.newBufferFrom(n);
                  },
                }),
                (b.nodebuffer = {
                  string: _,
                  array: function (n) {
                    return c(n, new Array(n.length));
                  },
                  arraybuffer: function (n) {
                    return b.nodebuffer.uint8array(n).buffer;
                  },
                  uint8array: function (n) {
                    return c(n, new Uint8Array(n.length));
                  },
                  nodebuffer: h,
                }),
                (l.transformTo = function (n, f) {
                  if (((f = f || ""), !n)) return f;
                  l.checkSupport(n);
                  var d = l.getTypeOf(f);
                  return b[d][n](f);
                }),
                (l.resolve = function (n) {
                  for (var f = n.split("/"), d = [], w = 0; w < f.length; w++) {
                    var x = f[w];
                    x === "." ||
                      (x === "" && w !== 0 && w !== f.length - 1) ||
                      (x === ".." ? d.pop() : d.push(x));
                  }
                  return d.join("/");
                }),
                (l.getTypeOf = function (n) {
                  return typeof n == "string"
                    ? "string"
                    : Object.prototype.toString.call(n) === "[object Array]"
                    ? "array"
                    : s.nodebuffer && a.isBuffer(n)
                    ? "nodebuffer"
                    : s.uint8array && n instanceof Uint8Array
                    ? "uint8array"
                    : s.arraybuffer && n instanceof ArrayBuffer
                    ? "arraybuffer"
                    : void 0;
                }),
                (l.checkSupport = function (n) {
                  if (!s[n.toLowerCase()])
                    throw new Error(n + " is not supported by this platform");
                }),
                (l.MAX_VALUE_16BITS = 65535),
                (l.MAX_VALUE_32BITS = -1),
                (l.pretty = function (n) {
                  var f,
                    d,
                    w = "";
                  for (d = 0; d < (n || "").length; d++)
                    w +=
                      "\\x" +
                      ((f = n.charCodeAt(d)) < 16 ? "0" : "") +
                      f.toString(16).toUpperCase();
                  return w;
                }),
                (l.delay = function (n, f, d) {
                  setImmediate(function () {
                    n.apply(d || null, f || []);
                  });
                }),
                (l.inherits = function (n, f) {
                  function d() {}
                  (d.prototype = f.prototype), (n.prototype = new d());
                }),
                (l.extend = function () {
                  var n,
                    f,
                    d = {};
                  for (n = 0; n < arguments.length; n++)
                    for (f in arguments[n])
                      Object.prototype.hasOwnProperty.call(arguments[n], f) &&
                        d[f] === void 0 &&
                        (d[f] = arguments[n][f]);
                  return d;
                }),
                (l.prepareContent = function (n, f, d, w, x) {
                  return o.Promise.resolve(f)
                    .then(function (C) {
                      return s.blob &&
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
                                ? (C = i.decode(C))
                                : d &&
                                  w !== !0 &&
                                  (C = (function (P) {
                                    return g(
                                      P,
                                      s.uint8array
                                        ? new Uint8Array(P.length)
                                        : new Array(P.length),
                                    );
                                  })(C))),
                          C)
                        : o.Promise.reject(
                            new Error(
                              "Can't read the data of '" +
                                n +
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
            function (t, m, l) {
              "use strict";
              var s = t("./reader/readerFor"),
                i = t("./utils"),
                a = t("./signature"),
                o = t("./zipEntry"),
                h = t("./support");
              function g(u) {
                (this.files = []), (this.loadOptions = u);
              }
              (g.prototype = {
                checkSignature: function (u) {
                  if (!this.reader.readAndCheckSignature(u)) {
                    this.reader.index -= 4;
                    var _ = this.reader.readString(4);
                    throw new Error(
                      "Corrupted zip or bug: unexpected signature (" +
                        i.pretty(_) +
                        ", expected " +
                        i.pretty(u) +
                        ")",
                    );
                  }
                },
                isSignature: function (u, _) {
                  var c = this.reader.index;
                  this.reader.setIndex(u);
                  var b = this.reader.readString(4) === _;
                  return this.reader.setIndex(c), b;
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
                    _ = h.uint8array ? "uint8array" : "array",
                    c = i.transformTo(_, u);
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
                    var u, _, c, b = this.zip64EndOfCentralSize - 44;
                    0 < b;

                  )
                    (u = this.reader.readInt(2)),
                      (_ = this.reader.readInt(4)),
                      (c = this.reader.readData(_)),
                      (this.zip64ExtensibleData[u] = {
                        id: u,
                        length: _,
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
                  var u, _;
                  for (u = 0; u < this.files.length; u++)
                    (_ = this.files[u]),
                      this.reader.setIndex(_.localHeaderOffset),
                      this.checkSignature(a.LOCAL_FILE_HEADER),
                      _.readLocalPart(this.reader),
                      _.handleUTF8(),
                      _.processAttributes();
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
                  var _ = u;
                  if (
                    (this.checkSignature(a.CENTRAL_DIRECTORY_END),
                    this.readBlockEndOfCentral(),
                    this.diskNumber === i.MAX_VALUE_16BITS ||
                      this.diskWithCentralDirStart === i.MAX_VALUE_16BITS ||
                      this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS ||
                      this.centralDirRecords === i.MAX_VALUE_16BITS ||
                      this.centralDirSize === i.MAX_VALUE_32BITS ||
                      this.centralDirOffset === i.MAX_VALUE_32BITS)
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
                  var b = _ - c;
                  if (0 < b)
                    this.isSignature(_, a.CENTRAL_FILE_HEADER) ||
                      (this.reader.zero = b);
                  else if (b < 0)
                    throw new Error(
                      "Corrupted zip: missing " + Math.abs(b) + " bytes.",
                    );
                },
                prepareReader: function (u) {
                  this.reader = s(u);
                },
                load: function (u) {
                  this.prepareReader(u),
                    this.readEndOfCentral(),
                    this.readCentralDir(),
                    this.readLocalFiles();
                },
              }),
                (m.exports = g);
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
            function (t, m, l) {
              "use strict";
              var s = t("./reader/readerFor"),
                i = t("./utils"),
                a = t("./compressedObject"),
                o = t("./crc32"),
                h = t("./utf8"),
                g = t("./compressions"),
                u = t("./support");
              function _(c, b) {
                (this.options = c), (this.loadOptions = b);
              }
              (_.prototype = {
                isEncrypted: function () {
                  return (1 & this.bitFlag) == 1;
                },
                useUTF8: function () {
                  return (2048 & this.bitFlag) == 2048;
                },
                readLocalPart: function (c) {
                  var b, n;
                  if (
                    (c.skip(22),
                    (this.fileNameLength = c.readInt(2)),
                    (n = c.readInt(2)),
                    (this.fileName = c.readData(this.fileNameLength)),
                    c.skip(n),
                    this.compressedSize === -1 || this.uncompressedSize === -1)
                  )
                    throw new Error(
                      "Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)",
                    );
                  if (
                    (b = (function (f) {
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
                        i.pretty(this.compressionMethod) +
                        " unknown (inner file : " +
                        i.transformTo("string", this.fileName) +
                        ")",
                    );
                  this.decompressed = new a(
                    this.compressedSize,
                    this.uncompressedSize,
                    this.crc32,
                    b,
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
                  var b = c.readInt(2);
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
                  c.skip(b),
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
                    var c = s(this.extraFields[1].value);
                    this.uncompressedSize === i.MAX_VALUE_32BITS &&
                      (this.uncompressedSize = c.readInt(8)),
                      this.compressedSize === i.MAX_VALUE_32BITS &&
                        (this.compressedSize = c.readInt(8)),
                      this.localHeaderOffset === i.MAX_VALUE_32BITS &&
                        (this.localHeaderOffset = c.readInt(8)),
                      this.diskNumberStart === i.MAX_VALUE_32BITS &&
                        (this.diskNumberStart = c.readInt(4));
                  }
                },
                readExtraFields: function (c) {
                  var b,
                    n,
                    f,
                    d = c.index + this.extraFieldsLength;
                  for (
                    this.extraFields || (this.extraFields = {});
                    c.index + 4 < d;

                  )
                    (b = c.readInt(2)),
                      (n = c.readInt(2)),
                      (f = c.readData(n)),
                      (this.extraFields[b] = { id: b, length: n, value: f });
                  c.setIndex(d);
                },
                handleUTF8: function () {
                  var c = u.uint8array ? "uint8array" : "array";
                  if (this.useUTF8())
                    (this.fileNameStr = h.utf8decode(this.fileName)),
                      (this.fileCommentStr = h.utf8decode(this.fileComment));
                  else {
                    var b = this.findExtraFieldUnicodePath();
                    if (b !== null) this.fileNameStr = b;
                    else {
                      var n = i.transformTo(c, this.fileName);
                      this.fileNameStr = this.loadOptions.decodeFileName(n);
                    }
                    var f = this.findExtraFieldUnicodeComment();
                    if (f !== null) this.fileCommentStr = f;
                    else {
                      var d = i.transformTo(c, this.fileComment);
                      this.fileCommentStr = this.loadOptions.decodeFileName(d);
                    }
                  }
                },
                findExtraFieldUnicodePath: function () {
                  var c = this.extraFields[28789];
                  if (c) {
                    var b = s(c.value);
                    return b.readInt(1) !== 1 ||
                      o(this.fileName) !== b.readInt(4)
                      ? null
                      : h.utf8decode(b.readData(c.length - 5));
                  }
                  return null;
                },
                findExtraFieldUnicodeComment: function () {
                  var c = this.extraFields[25461];
                  if (c) {
                    var b = s(c.value);
                    return b.readInt(1) !== 1 ||
                      o(this.fileComment) !== b.readInt(4)
                      ? null
                      : h.utf8decode(b.readData(c.length - 5));
                  }
                  return null;
                },
              }),
                (m.exports = _);
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
            function (t, m, l) {
              "use strict";
              function s(b, n, f) {
                (this.name = b),
                  (this.dir = f.dir),
                  (this.date = f.date),
                  (this.comment = f.comment),
                  (this.unixPermissions = f.unixPermissions),
                  (this.dosPermissions = f.dosPermissions),
                  (this._data = n),
                  (this._dataBinary = f.binary),
                  (this.options = {
                    compression: f.compression,
                    compressionOptions: f.compressionOptions,
                  });
              }
              var i = t("./stream/StreamHelper"),
                a = t("./stream/DataWorker"),
                o = t("./utf8"),
                h = t("./compressedObject"),
                g = t("./stream/GenericWorker");
              s.prototype = {
                internalStream: function (b) {
                  var n = null,
                    f = "string";
                  try {
                    if (!b) throw new Error("No output type specified.");
                    var d = (f = b.toLowerCase()) === "string" || f === "text";
                    (f !== "binarystring" && f !== "text") || (f = "string"),
                      (n = this._decompressWorker());
                    var w = !this._dataBinary;
                    w && !d && (n = n.pipe(new o.Utf8EncodeWorker())),
                      !w && d && (n = n.pipe(new o.Utf8DecodeWorker()));
                  } catch (x) {
                    (n = new g("error")).error(x);
                  }
                  return new i(n, f, "");
                },
                async: function (b, n) {
                  return this.internalStream(b).accumulate(n);
                },
                nodeStream: function (b, n) {
                  return this.internalStream(b || "nodebuffer").toNodejsStream(
                    n,
                  );
                },
                _compressWorker: function (b, n) {
                  if (
                    this._data instanceof h &&
                    this._data.compression.magic === b.magic
                  )
                    return this._data.getCompressedWorker();
                  var f = this._decompressWorker();
                  return (
                    this._dataBinary || (f = f.pipe(new o.Utf8EncodeWorker())),
                    h.createWorkerFrom(f, b, n)
                  );
                },
                _decompressWorker: function () {
                  return this._data instanceof h
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
                  _ = function () {
                    throw new Error(
                      "This method has been removed in JSZip 3.0, please check the upgrade guide.",
                    );
                  },
                  c = 0;
                c < u.length;
                c++
              )
                s.prototype[u[c]] = _;
              m.exports = s;
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
            function (t, m, l) {
              (function (s) {
                "use strict";
                var i,
                  a,
                  o = s.MutationObserver || s.WebKitMutationObserver;
                if (o) {
                  var h = 0,
                    g = new o(b),
                    u = s.document.createTextNode("");
                  g.observe(u, { characterData: !0 }),
                    (i = function () {
                      u.data = h = ++h % 2;
                    });
                } else if (s.setImmediate || s.MessageChannel === void 0)
                  i =
                    "document" in s &&
                    "onreadystatechange" in s.document.createElement("script")
                      ? function () {
                          var n = s.document.createElement("script");
                          (n.onreadystatechange = function () {
                            b(),
                              (n.onreadystatechange = null),
                              n.parentNode.removeChild(n),
                              (n = null);
                          }),
                            s.document.documentElement.appendChild(n);
                        }
                      : function () {
                          setTimeout(b, 0);
                        };
                else {
                  var _ = new s.MessageChannel();
                  (_.port1.onmessage = b),
                    (i = function () {
                      _.port2.postMessage(0);
                    });
                }
                var c = [];
                function b() {
                  var n, f;
                  a = !0;
                  for (var d = c.length; d; ) {
                    for (f = c, c = [], n = -1; ++n < d; ) f[n]();
                    d = c.length;
                  }
                  a = !1;
                }
                m.exports = function (n) {
                  c.push(n) !== 1 || a || i();
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
            function (t, m, l) {
              "use strict";
              var s = t("immediate");
              function i() {}
              var a = {},
                o = ["REJECTED"],
                h = ["FULFILLED"],
                g = ["PENDING"];
              function u(d) {
                if (typeof d != "function")
                  throw new TypeError("resolver must be a function");
                (this.state = g),
                  (this.queue = []),
                  (this.outcome = void 0),
                  d !== i && n(this, d);
              }
              function _(d, w, x) {
                (this.promise = d),
                  typeof w == "function" &&
                    ((this.onFulfilled = w),
                    (this.callFulfilled = this.otherCallFulfilled)),
                  typeof x == "function" &&
                    ((this.onRejected = x),
                    (this.callRejected = this.otherCallRejected));
              }
              function c(d, w, x) {
                s(function () {
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
              function b(d) {
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
              function n(d, w) {
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
              ((m.exports = u).prototype.finally = function (d) {
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
                    (typeof d != "function" && this.state === h) ||
                    (typeof w != "function" && this.state === o)
                  )
                    return this;
                  var x = new this.constructor(i);
                  return (
                    this.state !== g
                      ? c(x, this.state === h ? d : w, this.outcome)
                      : this.queue.push(new _(x, d, w)),
                    x
                  );
                }),
                (_.prototype.callFulfilled = function (d) {
                  a.resolve(this.promise, d);
                }),
                (_.prototype.otherCallFulfilled = function (d) {
                  c(this.promise, this.onFulfilled, d);
                }),
                (_.prototype.callRejected = function (d) {
                  a.reject(this.promise, d);
                }),
                (_.prototype.otherCallRejected = function (d) {
                  c(this.promise, this.onRejected, d);
                }),
                (a.resolve = function (d, w) {
                  var x = f(b, w);
                  if (x.status === "error") return a.reject(d, x.value);
                  var C = x.value;
                  if (C) n(d, C);
                  else {
                    (d.state = h), (d.outcome = w);
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
                  return d instanceof this ? d : a.resolve(new this(i), d);
                }),
                (u.reject = function (d) {
                  var w = new this(i);
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
                    var k = new Array(x), P = 0, T = -1, U = new this(i);
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
                  for (var k = -1, P = new this(i); ++k < x; )
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
            function (t, m, l) {
              "use strict";
              var s = {};
              (0, t("./lib/utils/common").assign)(
                s,
                t("./lib/deflate"),
                t("./lib/inflate"),
                t("./lib/zlib/constants"),
              ),
                (m.exports = s);
            },
            {
              "./lib/deflate": 39,
              "./lib/inflate": 40,
              "./lib/utils/common": 41,
              "./lib/zlib/constants": 44,
            },
          ],
          39: [
            function (t, m, l) {
              "use strict";
              var s = t("./zlib/deflate"),
                i = t("./utils/common"),
                a = t("./utils/strings"),
                o = t("./zlib/messages"),
                h = t("./zlib/zstream"),
                g = Object.prototype.toString,
                u = 0,
                _ = -1,
                c = 0,
                b = 8;
              function n(d) {
                if (!(this instanceof n)) return new n(d);
                this.options = i.assign(
                  {
                    level: _,
                    method: b,
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
                  (this.strm = new h()),
                  (this.strm.avail_out = 0);
                var x = s.deflateInit2(
                  this.strm,
                  w.level,
                  w.method,
                  w.windowBits,
                  w.memLevel,
                  w.strategy,
                );
                if (x !== u) throw new Error(o[x]);
                if (
                  (w.header && s.deflateSetHeader(this.strm, w.header),
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
                    (x = s.deflateSetDictionary(this.strm, C)) !== u)
                  )
                    throw new Error(o[x]);
                  this._dict_set = !0;
                }
              }
              function f(d, w) {
                var x = new n(w);
                if ((x.push(d, !0), x.err)) throw x.msg || o[x.err];
                return x.result;
              }
              (n.prototype.push = function (d, w) {
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
                      ((k.output = new i.Buf8(P)),
                      (k.next_out = 0),
                      (k.avail_out = P)),
                    (x = s.deflate(k, C)) !== 1 && x !== u)
                  )
                    return this.onEnd(x), !(this.ended = !0);
                  (k.avail_out !== 0 &&
                    (k.avail_in !== 0 || (C !== 4 && C !== 2))) ||
                    (this.options.to === "string"
                      ? this.onData(
                          a.buf2binstring(i.shrinkBuf(k.output, k.next_out)),
                        )
                      : this.onData(i.shrinkBuf(k.output, k.next_out)));
                } while ((0 < k.avail_in || k.avail_out === 0) && x !== 1);
                return C === 4
                  ? ((x = s.deflateEnd(this.strm)),
                    this.onEnd(x),
                    (this.ended = !0),
                    x === u)
                  : C !== 2 || (this.onEnd(u), !(k.avail_out = 0));
              }),
                (n.prototype.onData = function (d) {
                  this.chunks.push(d);
                }),
                (n.prototype.onEnd = function (d) {
                  d === u &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = i.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = d),
                    (this.msg = this.strm.msg);
                }),
                (l.Deflate = n),
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
            function (t, m, l) {
              "use strict";
              var s = t("./zlib/inflate"),
                i = t("./utils/common"),
                a = t("./utils/strings"),
                o = t("./zlib/constants"),
                h = t("./zlib/messages"),
                g = t("./zlib/zstream"),
                u = t("./zlib/gzheader"),
                _ = Object.prototype.toString;
              function c(n) {
                if (!(this instanceof c)) return new c(n);
                this.options = i.assign(
                  { chunkSize: 16384, windowBits: 0, to: "" },
                  n || {},
                );
                var f = this.options;
                f.raw &&
                  0 <= f.windowBits &&
                  f.windowBits < 16 &&
                  ((f.windowBits = -f.windowBits),
                  f.windowBits === 0 && (f.windowBits = -15)),
                  !(0 <= f.windowBits && f.windowBits < 16) ||
                    (n && n.windowBits) ||
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
                var d = s.inflateInit2(this.strm, f.windowBits);
                if (d !== o.Z_OK) throw new Error(h[d]);
                (this.header = new u()),
                  s.inflateGetHeader(this.strm, this.header);
              }
              function b(n, f) {
                var d = new c(f);
                if ((d.push(n, !0), d.err)) throw d.msg || h[d.err];
                return d.result;
              }
              (c.prototype.push = function (n, f) {
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
                  typeof n == "string"
                    ? (T.input = a.binstring2buf(n))
                    : _.call(n) === "[object ArrayBuffer]"
                    ? (T.input = new Uint8Array(n))
                    : (T.input = n),
                  (T.next_in = 0),
                  (T.avail_in = T.input.length);
                do {
                  if (
                    (T.avail_out === 0 &&
                      ((T.output = new i.Buf8(U)),
                      (T.next_out = 0),
                      (T.avail_out = U)),
                    (d = s.inflate(T, o.Z_NO_FLUSH)) === o.Z_NEED_DICT &&
                      D &&
                      ((P =
                        typeof D == "string"
                          ? a.string2buf(D)
                          : _.call(D) === "[object ArrayBuffer]"
                          ? new Uint8Array(D)
                          : D),
                      (d = s.inflateSetDictionary(this.strm, P))),
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
                          C && i.arraySet(T.output, T.output, x, C, 0),
                          this.onData(k))
                        : this.onData(i.shrinkBuf(T.output, T.next_out)))),
                    T.avail_in === 0 && T.avail_out === 0 && (I = !0);
                } while (
                  (0 < T.avail_in || T.avail_out === 0) &&
                  d !== o.Z_STREAM_END
                );
                return (
                  d === o.Z_STREAM_END && (w = o.Z_FINISH),
                  w === o.Z_FINISH
                    ? ((d = s.inflateEnd(this.strm)),
                      this.onEnd(d),
                      (this.ended = !0),
                      d === o.Z_OK)
                    : w !== o.Z_SYNC_FLUSH ||
                      (this.onEnd(o.Z_OK), !(T.avail_out = 0))
                );
              }),
                (c.prototype.onData = function (n) {
                  this.chunks.push(n);
                }),
                (c.prototype.onEnd = function (n) {
                  n === o.Z_OK &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = i.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = n),
                    (this.msg = this.strm.msg);
                }),
                (l.Inflate = c),
                (l.inflate = b),
                (l.inflateRaw = function (n, f) {
                  return ((f = f || {}).raw = !0), b(n, f);
                }),
                (l.ungzip = b);
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
            function (t, m, l) {
              "use strict";
              var s =
                typeof Uint8Array < "u" &&
                typeof Uint16Array < "u" &&
                typeof Int32Array < "u";
              (l.assign = function (o) {
                for (
                  var h = Array.prototype.slice.call(arguments, 1);
                  h.length;

                ) {
                  var g = h.shift();
                  if (g) {
                    if (typeof g != "object")
                      throw new TypeError(g + "must be non-object");
                    for (var u in g) g.hasOwnProperty(u) && (o[u] = g[u]);
                  }
                }
                return o;
              }),
                (l.shrinkBuf = function (o, h) {
                  return o.length === h
                    ? o
                    : o.subarray
                    ? o.subarray(0, h)
                    : ((o.length = h), o);
                });
              var i = {
                  arraySet: function (o, h, g, u, _) {
                    if (h.subarray && o.subarray)
                      o.set(h.subarray(g, g + u), _);
                    else for (var c = 0; c < u; c++) o[_ + c] = h[g + c];
                  },
                  flattenChunks: function (o) {
                    var h, g, u, _, c, b;
                    for (h = u = 0, g = o.length; h < g; h++) u += o[h].length;
                    for (
                      b = new Uint8Array(u), h = _ = 0, g = o.length;
                      h < g;
                      h++
                    )
                      (c = o[h]), b.set(c, _), (_ += c.length);
                    return b;
                  },
                },
                a = {
                  arraySet: function (o, h, g, u, _) {
                    for (var c = 0; c < u; c++) o[_ + c] = h[g + c];
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
                    l.assign(l, i))
                  : ((l.Buf8 = Array),
                    (l.Buf16 = Array),
                    (l.Buf32 = Array),
                    l.assign(l, a));
              }),
                l.setTyped(s);
            },
            {},
          ],
          42: [
            function (t, m, l) {
              "use strict";
              var s = t("./common"),
                i = !0,
                a = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                i = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                a = !1;
              }
              for (var o = new s.Buf8(256), h = 0; h < 256; h++)
                o[h] =
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
              function g(u, _) {
                if (_ < 65537 && ((u.subarray && a) || (!u.subarray && i)))
                  return String.fromCharCode.apply(null, s.shrinkBuf(u, _));
                for (var c = "", b = 0; b < _; b++)
                  c += String.fromCharCode(u[b]);
                return c;
              }
              (o[254] = o[254] = 1),
                (l.string2buf = function (u) {
                  var _,
                    c,
                    b,
                    n,
                    f,
                    d = u.length,
                    w = 0;
                  for (n = 0; n < d; n++)
                    (64512 & (c = u.charCodeAt(n))) == 55296 &&
                      n + 1 < d &&
                      (64512 & (b = u.charCodeAt(n + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (b - 56320)), n++),
                      (w += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4);
                  for (_ = new s.Buf8(w), n = f = 0; f < w; n++)
                    (64512 & (c = u.charCodeAt(n))) == 55296 &&
                      n + 1 < d &&
                      (64512 & (b = u.charCodeAt(n + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (b - 56320)), n++),
                      c < 128
                        ? (_[f++] = c)
                        : (c < 2048
                            ? (_[f++] = 192 | (c >>> 6))
                            : (c < 65536
                                ? (_[f++] = 224 | (c >>> 12))
                                : ((_[f++] = 240 | (c >>> 18)),
                                  (_[f++] = 128 | ((c >>> 12) & 63))),
                              (_[f++] = 128 | ((c >>> 6) & 63))),
                          (_[f++] = 128 | (63 & c)));
                  return _;
                }),
                (l.buf2binstring = function (u) {
                  return g(u, u.length);
                }),
                (l.binstring2buf = function (u) {
                  for (
                    var _ = new s.Buf8(u.length), c = 0, b = _.length;
                    c < b;
                    c++
                  )
                    _[c] = u.charCodeAt(c);
                  return _;
                }),
                (l.buf2string = function (u, _) {
                  var c,
                    b,
                    n,
                    f,
                    d = _ || u.length,
                    w = new Array(2 * d);
                  for (c = b = 0; c < d; )
                    if ((n = u[c++]) < 128) w[b++] = n;
                    else if (4 < (f = o[n])) (w[b++] = 65533), (c += f - 1);
                    else {
                      for (
                        n &= f === 2 ? 31 : f === 3 ? 15 : 7;
                        1 < f && c < d;

                      )
                        (n = (n << 6) | (63 & u[c++])), f--;
                      1 < f
                        ? (w[b++] = 65533)
                        : n < 65536
                        ? (w[b++] = n)
                        : ((n -= 65536),
                          (w[b++] = 55296 | ((n >> 10) & 1023)),
                          (w[b++] = 56320 | (1023 & n)));
                    }
                  return g(w, b);
                }),
                (l.utf8border = function (u, _) {
                  var c;
                  for (
                    (_ = _ || u.length) > u.length && (_ = u.length), c = _ - 1;
                    0 <= c && (192 & u[c]) == 128;

                  )
                    c--;
                  return c < 0 || c === 0 ? _ : c + o[u[c]] > _ ? c : _;
                });
            },
            { "./common": 41 },
          ],
          43: [
            function (t, m, l) {
              "use strict";
              m.exports = function (s, i, a, o) {
                for (
                  var h = (65535 & s) | 0, g = ((s >>> 16) & 65535) | 0, u = 0;
                  a !== 0;

                ) {
                  for (
                    a -= u = 2e3 < a ? 2e3 : a;
                    (g = (g + (h = (h + i[o++]) | 0)) | 0), --u;

                  );
                  (h %= 65521), (g %= 65521);
                }
                return h | (g << 16) | 0;
              };
            },
            {},
          ],
          44: [
            function (t, m, l) {
              "use strict";
              m.exports = {
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
            function (t, m, l) {
              "use strict";
              var s = (function () {
                for (var i, a = [], o = 0; o < 256; o++) {
                  i = o;
                  for (var h = 0; h < 8; h++)
                    i = 1 & i ? 3988292384 ^ (i >>> 1) : i >>> 1;
                  a[o] = i;
                }
                return a;
              })();
              m.exports = function (i, a, o, h) {
                var g = s,
                  u = h + o;
                i ^= -1;
                for (var _ = h; _ < u; _++) i = (i >>> 8) ^ g[255 & (i ^ a[_])];
                return -1 ^ i;
              };
            },
            {},
          ],
          46: [
            function (t, m, l) {
              "use strict";
              var s,
                i = t("../utils/common"),
                a = t("./trees"),
                o = t("./adler32"),
                h = t("./crc32"),
                g = t("./messages"),
                u = 0,
                _ = 4,
                c = 0,
                b = -2,
                n = -1,
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
                r = 1,
                A = 2,
                q = 3,
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
                    (i.arraySet(
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
              function G(e, O) {
                (e.pending_buf[e.pending++] = (O >>> 8) & 255),
                  (e.pending_buf[e.pending++] = 255 & O);
              }
              function j(e, O) {
                var R,
                  v,
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
                  it = Y[E + M];
                e.prev_length >= e.good_match && (p >>= 2),
                  L > e.lookahead && (L = e.lookahead);
                do
                  if (
                    Y[(R = O) + M] === it &&
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
                    if (((v = I - (Q - E)), (E = Q - I), M < v)) {
                      if (((e.match_start = O), L <= (M = v))) break;
                      (at = Y[E + M - 1]), (it = Y[E + M]);
                    }
                  }
                while ((O = W[O & Z]) > z && --p != 0);
                return M <= e.lookahead ? M : e.lookahead;
              }
              function st(e) {
                var O,
                  R,
                  v,
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
                      i.arraySet(e.window, e.window, W, W, 0),
                        e.match_start -= W,
                        e.strstart -= W,
                        e.block_start -= W,
                        O = R = e.hash_size;
                      (v = e.head[--O]), (e.head[O] = W <= v ? v - W : 0), --R;

                    );
                    for (
                      O = R = W;
                      (v = e.prev[--O]), (e.prev[O] = W <= v ? v - W : 0), --R;

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
                          i.arraySet(L, M.input, M.next_in, Z, z),
                          M.state.wrap === 1
                            ? (M.adler = o(M.adler, L, Z, z))
                            : M.state.wrap === 2 &&
                              (M.adler = h(M.adler, L, Z, z)),
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
                for (var R, v; ; ) {
                  if (e.lookahead < N) {
                    if ((st(e), e.lookahead < N && O === u)) return r;
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
                      ((v = a._tr_tally(
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
                    (v = a._tr_tally(e, 0, e.window[e.strstart])),
                      e.lookahead--,
                      e.strstart++;
                  if (v && ($(e, !1), e.strm.avail_out === 0)) return r;
                }
                return (
                  (e.insert = e.strstart < D - 1 ? e.strstart : D - 1),
                  O === _
                    ? ($(e, !0), e.strm.avail_out === 0 ? q : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? r
                    : A
                );
              }
              function et(e, O) {
                for (var R, v, p; ; ) {
                  if (e.lookahead < N) {
                    if ((st(e), e.lookahead < N && O === u)) return r;
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
                        v = a._tr_tally(
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
                      v && ($(e, !1), e.strm.avail_out === 0))
                    )
                      return r;
                  } else if (e.match_available) {
                    if (
                      ((v = a._tr_tally(e, 0, e.window[e.strstart - 1])) &&
                        $(e, !1),
                      e.strstart++,
                      e.lookahead--,
                      e.strm.avail_out === 0)
                    )
                      return r;
                  } else (e.match_available = 1), e.strstart++, e.lookahead--;
                }
                return (
                  e.match_available &&
                    ((v = a._tr_tally(e, 0, e.window[e.strstart - 1])),
                    (e.match_available = 0)),
                  (e.insert = e.strstart < D - 1 ? e.strstart : D - 1),
                  O === _
                    ? ($(e, !0), e.strm.avail_out === 0 ? q : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? r
                    : A
                );
              }
              function nt(e, O, R, v, p) {
                (this.good_length = e),
                  (this.max_lazy = O),
                  (this.nice_length = R),
                  (this.max_chain = v),
                  (this.func = p);
              }
              function rt() {
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
                  (this.dyn_ltree = new i.Buf16(2 * T)),
                  (this.dyn_dtree = new i.Buf16(2 * (2 * k + 1))),
                  (this.bl_tree = new i.Buf16(2 * (2 * P + 1))),
                  K(this.dyn_ltree),
                  K(this.dyn_dtree),
                  K(this.bl_tree),
                  (this.l_desc = null),
                  (this.d_desc = null),
                  (this.bl_desc = null),
                  (this.bl_count = new i.Buf16(U + 1)),
                  (this.heap = new i.Buf16(2 * C + 1)),
                  K(this.heap),
                  (this.heap_len = 0),
                  (this.heap_max = 0),
                  (this.depth = new i.Buf16(2 * C + 1)),
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
                  : J(e, b);
              }
              function pt(e) {
                var O = ct(e);
                return (
                  O === c &&
                    (function (R) {
                      (R.window_size = 2 * R.w_size),
                        K(R.head),
                        (R.max_lazy_match = s[R.level].max_lazy),
                        (R.good_match = s[R.level].good_length),
                        (R.nice_match = s[R.level].nice_length),
                        (R.max_chain_length = s[R.level].max_chain),
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
              function gt(e, O, R, v, p, E) {
                if (!e) return b;
                var M = 1;
                if (
                  (O === n && (O = 6),
                  v < 0 ? ((M = 0), (v = -v)) : 15 < v && ((M = 2), (v -= 16)),
                  p < 1 ||
                    x < p ||
                    R !== w ||
                    v < 8 ||
                    15 < v ||
                    O < 0 ||
                    9 < O ||
                    E < 0 ||
                    f < E)
                )
                  return J(e, b);
                v === 8 && (v = 9);
                var L = new rt();
                return (
                  ((e.state = L).strm = e),
                  (L.wrap = M),
                  (L.gzhead = null),
                  (L.w_bits = v),
                  (L.w_size = 1 << L.w_bits),
                  (L.w_mask = L.w_size - 1),
                  (L.hash_bits = p + 7),
                  (L.hash_size = 1 << L.hash_bits),
                  (L.hash_mask = L.hash_size - 1),
                  (L.hash_shift = ~~((L.hash_bits + D - 1) / D)),
                  (L.window = new i.Buf8(2 * L.w_size)),
                  (L.head = new i.Buf16(L.hash_size)),
                  (L.prev = new i.Buf16(L.w_size)),
                  (L.lit_bufsize = 1 << (p + 6)),
                  (L.pending_buf_size = 4 * L.lit_bufsize),
                  (L.pending_buf = new i.Buf8(L.pending_buf_size)),
                  (L.d_buf = 1 * L.lit_bufsize),
                  (L.l_buf = 3 * L.lit_bufsize),
                  (L.level = O),
                  (L.strategy = E),
                  (L.method = R),
                  pt(e)
                );
              }
              (s = [
                new nt(0, 0, 0, 0, function (e, O) {
                  var R = 65535;
                  for (
                    R > e.pending_buf_size - 5 && (R = e.pending_buf_size - 5);
                    ;

                  ) {
                    if (e.lookahead <= 1) {
                      if ((st(e), e.lookahead === 0 && O === u)) return r;
                      if (e.lookahead === 0) break;
                    }
                    (e.strstart += e.lookahead), (e.lookahead = 0);
                    var v = e.block_start + R;
                    if (
                      ((e.strstart === 0 || e.strstart >= v) &&
                        ((e.lookahead = e.strstart - v),
                        (e.strstart = v),
                        $(e, !1),
                        e.strm.avail_out === 0)) ||
                      (e.strstart - e.block_start >= e.w_size - N &&
                        ($(e, !1), e.strm.avail_out === 0))
                    )
                      return r;
                  }
                  return (
                    (e.insert = 0),
                    O === _
                      ? ($(e, !0), e.strm.avail_out === 0 ? q : B)
                      : (e.strstart > e.block_start &&
                          ($(e, !1), e.strm.avail_out),
                        r)
                  );
                }),
                new nt(4, 4, 8, 4, dt),
                new nt(4, 5, 16, 8, dt),
                new nt(4, 6, 32, 32, dt),
                new nt(4, 4, 16, 16, et),
                new nt(8, 16, 32, 32, et),
                new nt(8, 16, 128, 128, et),
                new nt(8, 32, 128, 256, et),
                new nt(32, 128, 258, 1024, et),
                new nt(32, 258, 258, 4096, et),
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
                      ? b
                      : ((e.state.gzhead = O), c)
                    : b;
                }),
                (l.deflate = function (e, O) {
                  var R, v, p, E;
                  if (!e || !e.state || 5 < O || O < 0) return e ? J(e, b) : b;
                  if (
                    ((v = e.state),
                    !e.output ||
                      (!e.input && e.avail_in !== 0) ||
                      (v.status === 666 && O !== _))
                  )
                    return J(e, e.avail_out === 0 ? -5 : b);
                  if (
                    ((v.strm = e),
                    (R = v.last_flush),
                    (v.last_flush = O),
                    v.status === y)
                  )
                    if (v.wrap === 2)
                      (e.adler = 0),
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
                              (e.adler = h(
                                e.adler,
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
                            (v.status = S));
                    else {
                      var M = (w + ((v.w_bits - 8) << 4)) << 8;
                      (M |=
                        (2 <= v.strategy || v.level < 2
                          ? 0
                          : v.level < 6
                          ? 1
                          : v.level === 6
                          ? 2
                          : 3) << 6),
                        v.strstart !== 0 && (M |= 32),
                        (M += 31 - (M % 31)),
                        (v.status = S),
                        G(v, M),
                        v.strstart !== 0 &&
                          (G(v, e.adler >>> 16), G(v, 65535 & e.adler)),
                        (e.adler = 1);
                    }
                  if (v.status === 69)
                    if (v.gzhead.extra) {
                      for (
                        p = v.pending;
                        v.gzindex < (65535 & v.gzhead.extra.length) &&
                        (v.pending !== v.pending_buf_size ||
                          (v.gzhead.hcrc &&
                            v.pending > p &&
                            (e.adler = h(
                              e.adler,
                              v.pending_buf,
                              v.pending - p,
                              p,
                            )),
                          F(e),
                          (p = v.pending),
                          v.pending !== v.pending_buf_size));

                      )
                        V(v, 255 & v.gzhead.extra[v.gzindex]), v.gzindex++;
                      v.gzhead.hcrc &&
                        v.pending > p &&
                        (e.adler = h(e.adler, v.pending_buf, v.pending - p, p)),
                        v.gzindex === v.gzhead.extra.length &&
                          ((v.gzindex = 0), (v.status = 73));
                    } else v.status = 73;
                  if (v.status === 73)
                    if (v.gzhead.name) {
                      p = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > p &&
                            (e.adler = h(
                              e.adler,
                              v.pending_buf,
                              v.pending - p,
                              p,
                            )),
                          F(e),
                          (p = v.pending),
                          v.pending === v.pending_buf_size)
                        ) {
                          E = 1;
                          break;
                        }
                        (E =
                          v.gzindex < v.gzhead.name.length
                            ? 255 & v.gzhead.name.charCodeAt(v.gzindex++)
                            : 0),
                          V(v, E);
                      } while (E !== 0);
                      v.gzhead.hcrc &&
                        v.pending > p &&
                        (e.adler = h(e.adler, v.pending_buf, v.pending - p, p)),
                        E === 0 && ((v.gzindex = 0), (v.status = 91));
                    } else v.status = 91;
                  if (v.status === 91)
                    if (v.gzhead.comment) {
                      p = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > p &&
                            (e.adler = h(
                              e.adler,
                              v.pending_buf,
                              v.pending - p,
                              p,
                            )),
                          F(e),
                          (p = v.pending),
                          v.pending === v.pending_buf_size)
                        ) {
                          E = 1;
                          break;
                        }
                        (E =
                          v.gzindex < v.gzhead.comment.length
                            ? 255 & v.gzhead.comment.charCodeAt(v.gzindex++)
                            : 0),
                          V(v, E);
                      } while (E !== 0);
                      v.gzhead.hcrc &&
                        v.pending > p &&
                        (e.adler = h(e.adler, v.pending_buf, v.pending - p, p)),
                        E === 0 && (v.status = 103);
                    } else v.status = 103;
                  if (
                    (v.status === 103 &&
                      (v.gzhead.hcrc
                        ? (v.pending + 2 > v.pending_buf_size && F(e),
                          v.pending + 2 <= v.pending_buf_size &&
                            (V(v, 255 & e.adler),
                            V(v, (e.adler >> 8) & 255),
                            (e.adler = 0),
                            (v.status = S)))
                        : (v.status = S)),
                    v.pending !== 0)
                  ) {
                    if ((F(e), e.avail_out === 0))
                      return (v.last_flush = -1), c;
                  } else if (e.avail_in === 0 && X(O) <= X(R) && O !== _)
                    return J(e, -5);
                  if (v.status === 666 && e.avail_in !== 0) return J(e, -5);
                  if (
                    e.avail_in !== 0 ||
                    v.lookahead !== 0 ||
                    (O !== u && v.status !== 666)
                  ) {
                    var L =
                      v.strategy === 2
                        ? (function (z, Y) {
                            for (var Z; ; ) {
                              if (
                                z.lookahead === 0 &&
                                (st(z), z.lookahead === 0)
                              ) {
                                if (Y === u) return r;
                                break;
                              }
                              if (
                                ((z.match_length = 0),
                                (Z = a._tr_tally(z, 0, z.window[z.strstart])),
                                z.lookahead--,
                                z.strstart++,
                                Z && ($(z, !1), z.strm.avail_out === 0))
                              )
                                return r;
                            }
                            return (
                              (z.insert = 0),
                              Y === _
                                ? ($(z, !0), z.strm.avail_out === 0 ? q : B)
                                : z.last_lit &&
                                  ($(z, !1), z.strm.avail_out === 0)
                                ? r
                                : A
                            );
                          })(v, O)
                        : v.strategy === 3
                        ? (function (z, Y) {
                            for (var Z, W, Q, at, it = z.window; ; ) {
                              if (z.lookahead <= I) {
                                if ((st(z), z.lookahead <= I && Y === u))
                                  return r;
                                if (z.lookahead === 0) break;
                              }
                              if (
                                ((z.match_length = 0),
                                z.lookahead >= D &&
                                  0 < z.strstart &&
                                  (W = it[(Q = z.strstart - 1)]) === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q])
                              ) {
                                at = z.strstart + I;
                                do;
                                while (
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
                                  W === it[++Q] &&
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
                                return r;
                            }
                            return (
                              (z.insert = 0),
                              Y === _
                                ? ($(z, !0), z.strm.avail_out === 0 ? q : B)
                                : z.last_lit &&
                                  ($(z, !1), z.strm.avail_out === 0)
                                ? r
                                : A
                            );
                          })(v, O)
                        : s[v.level].func(v, O);
                    if (
                      ((L !== q && L !== B) || (v.status = 666),
                      L === r || L === q)
                    )
                      return e.avail_out === 0 && (v.last_flush = -1), c;
                    if (
                      L === A &&
                      (O === 1
                        ? a._tr_align(v)
                        : O !== 5 &&
                          (a._tr_stored_block(v, 0, 0, !1),
                          O === 3 &&
                            (K(v.head),
                            v.lookahead === 0 &&
                              ((v.strstart = 0),
                              (v.block_start = 0),
                              (v.insert = 0)))),
                      F(e),
                      e.avail_out === 0)
                    )
                      return (v.last_flush = -1), c;
                  }
                  return O !== _
                    ? c
                    : v.wrap <= 0
                    ? 1
                    : (v.wrap === 2
                        ? (V(v, 255 & e.adler),
                          V(v, (e.adler >> 8) & 255),
                          V(v, (e.adler >> 16) & 255),
                          V(v, (e.adler >> 24) & 255),
                          V(v, 255 & e.total_in),
                          V(v, (e.total_in >> 8) & 255),
                          V(v, (e.total_in >> 16) & 255),
                          V(v, (e.total_in >> 24) & 255))
                        : (G(v, e.adler >>> 16), G(v, 65535 & e.adler)),
                      F(e),
                      0 < v.wrap && (v.wrap = -v.wrap),
                      v.pending !== 0 ? c : 1);
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
                      ? J(e, b)
                      : ((e.state = null), O === S ? J(e, -3) : c)
                    : b;
                }),
                (l.deflateSetDictionary = function (e, O) {
                  var R,
                    v,
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
                    return b;
                  for (
                    E === 1 && (e.adler = o(e.adler, O, Z, 0)),
                      R.wrap = 0,
                      Z >= R.w_size &&
                        (E === 0 &&
                          (K(R.head),
                          (R.strstart = 0),
                          (R.block_start = 0),
                          (R.insert = 0)),
                        (Y = new i.Buf8(R.w_size)),
                        i.arraySet(Y, O, Z - R.w_size, R.w_size, 0),
                        (O = Y),
                        (Z = R.w_size)),
                      M = e.avail_in,
                      L = e.next_in,
                      z = e.input,
                      e.avail_in = Z,
                      e.next_in = 0,
                      e.input = O,
                      st(R);
                    R.lookahead >= D;

                  ) {
                    for (
                      v = R.strstart, p = R.lookahead - (D - 1);
                      (R.ins_h =
                        ((R.ins_h << R.hash_shift) ^ R.window[v + D - 1]) &
                        R.hash_mask),
                        (R.prev[v & R.w_mask] = R.head[R.ins_h]),
                        (R.head[R.ins_h] = v),
                        v++,
                        --p;

                    );
                    (R.strstart = v), (R.lookahead = D - 1), st(R);
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
            function (t, m, l) {
              "use strict";
              m.exports = function () {
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
            function (t, m, l) {
              "use strict";
              m.exports = function (s, i) {
                var a,
                  o,
                  h,
                  g,
                  u,
                  _,
                  c,
                  b,
                  n,
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
                  r,
                  A;
                (a = s.state),
                  (o = s.next_in),
                  (r = s.input),
                  (h = o + (s.avail_in - 5)),
                  (g = s.next_out),
                  (A = s.output),
                  (u = g - (i - s.avail_out)),
                  (_ = g + (s.avail_out - 257)),
                  (c = a.dmax),
                  (b = a.wsize),
                  (n = a.whave),
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
                    ((w += r[o++] << x),
                    (x += 8),
                    (w += r[o++] << x),
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
                        (s.msg = "invalid literal/length code"), (a.mode = 30);
                        break t;
                      }
                      (I = 65535 & U),
                        (D &= 15) &&
                          (x < D && ((w += r[o++] << x), (x += 8)),
                          (I += w & ((1 << D) - 1)),
                          (w >>>= D),
                          (x -= D)),
                        x < 15 &&
                          ((w += r[o++] << x),
                          (x += 8),
                          (w += r[o++] << x),
                          (x += 8)),
                        (U = k[w & T]);
                      r: for (;;) {
                        if (
                          ((w >>>= D = U >>> 24),
                          (x -= D),
                          !(16 & (D = (U >>> 16) & 255)))
                        ) {
                          if (!(64 & D)) {
                            U = k[(65535 & U) + (w & ((1 << D) - 1))];
                            continue r;
                          }
                          (s.msg = "invalid distance code"), (a.mode = 30);
                          break t;
                        }
                        if (
                          ((N = 65535 & U),
                          x < (D &= 15) &&
                            ((w += r[o++] << x),
                            (x += 8) < D && ((w += r[o++] << x), (x += 8))),
                          c < (N += w & ((1 << D) - 1)))
                        ) {
                          (s.msg = "invalid distance too far back"),
                            (a.mode = 30);
                          break t;
                        }
                        if (((w >>>= D), (x -= D), (D = g - u) < N)) {
                          if (n < (D = N - D) && a.sane) {
                            (s.msg = "invalid distance too far back"),
                              (a.mode = 30);
                            break t;
                          }
                          if (((S = d), (y = 0) === f)) {
                            if (((y += b - D), D < I)) {
                              for (I -= D; (A[g++] = d[y++]), --D; );
                              (y = g - N), (S = A);
                            }
                          } else if (f < D) {
                            if (((y += b + f - D), (D -= f) < I)) {
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
                } while (o < h && g < _);
                (o -= I = x >> 3),
                  (w &= (1 << (x -= I << 3)) - 1),
                  (s.next_in = o),
                  (s.next_out = g),
                  (s.avail_in = o < h ? h - o + 5 : 5 - (o - h)),
                  (s.avail_out = g < _ ? _ - g + 257 : 257 - (g - _)),
                  (a.hold = w),
                  (a.bits = x);
              };
            },
            {},
          ],
          49: [
            function (t, m, l) {
              "use strict";
              var s = t("../utils/common"),
                i = t("./adler32"),
                a = t("./crc32"),
                o = t("./inffast"),
                h = t("./inftrees"),
                g = 1,
                u = 2,
                _ = 0,
                c = -2,
                b = 1,
                n = 852,
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
                  (this.lens = new s.Buf16(320)),
                  (this.work = new s.Buf16(288)),
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
                    (S.mode = b),
                    (S.last = 0),
                    (S.havedict = 0),
                    (S.dmax = 32768),
                    (S.head = null),
                    (S.hold = 0),
                    (S.bits = 0),
                    (S.lencode = S.lendyn = new s.Buf32(n)),
                    (S.distcode = S.distdyn = new s.Buf32(f)),
                    (S.sane = 1),
                    (S.back = -1),
                    _)
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
                var r, A;
                return y && y.state
                  ? ((A = y.state),
                    S < 0
                      ? ((r = 0), (S = -S))
                      : ((r = 1 + (S >> 4)), S < 48 && (S &= 15)),
                    S && (S < 8 || 15 < S)
                      ? c
                      : (A.window !== null &&
                          A.wbits !== S &&
                          (A.window = null),
                        (A.wrap = r),
                        (A.wbits = S),
                        C(y)))
                  : c;
              }
              function P(y, S) {
                var r, A;
                return y
                  ? ((A = new w()),
                    ((y.state = A).window = null),
                    (r = k(y, S)) !== _ && (y.state = null),
                    r)
                  : c;
              }
              var T,
                U,
                D = !0;
              function I(y) {
                if (D) {
                  var S;
                  for (
                    T = new s.Buf32(512), U = new s.Buf32(32), S = 0;
                    S < 144;

                  )
                    y.lens[S++] = 8;
                  for (; S < 256; ) y.lens[S++] = 9;
                  for (; S < 280; ) y.lens[S++] = 7;
                  for (; S < 288; ) y.lens[S++] = 8;
                  for (
                    h(g, y.lens, 0, 288, T, 0, y.work, { bits: 9 }), S = 0;
                    S < 32;

                  )
                    y.lens[S++] = 5;
                  h(u, y.lens, 0, 32, U, 0, y.work, { bits: 5 }), (D = !1);
                }
                (y.lencode = T),
                  (y.lenbits = 9),
                  (y.distcode = U),
                  (y.distbits = 5);
              }
              function N(y, S, r, A) {
                var q,
                  B = y.state;
                return (
                  B.window === null &&
                    ((B.wsize = 1 << B.wbits),
                    (B.wnext = 0),
                    (B.whave = 0),
                    (B.window = new s.Buf8(B.wsize))),
                  A >= B.wsize
                    ? (s.arraySet(B.window, S, r - B.wsize, B.wsize, 0),
                      (B.wnext = 0),
                      (B.whave = B.wsize))
                    : (A < (q = B.wsize - B.wnext) && (q = A),
                      s.arraySet(B.window, S, r - A, q, B.wnext),
                      (A -= q)
                        ? (s.arraySet(B.window, S, r - A, A, 0),
                          (B.wnext = A),
                          (B.whave = B.wsize))
                        : ((B.wnext += q),
                          B.wnext === B.wsize && (B.wnext = 0),
                          B.whave < B.wsize && (B.whave += q))),
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
                  var r,
                    A,
                    q,
                    B,
                    J,
                    X,
                    K,
                    F,
                    $,
                    V,
                    G,
                    j,
                    st,
                    dt,
                    et,
                    nt,
                    rt,
                    ct,
                    pt,
                    gt,
                    e,
                    O,
                    R,
                    v,
                    p = 0,
                    E = new s.Buf8(4),
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
                  (r = y.state).mode === 12 && (r.mode = 13),
                    (J = y.next_out),
                    (q = y.output),
                    (K = y.avail_out),
                    (B = y.next_in),
                    (A = y.input),
                    (X = y.avail_in),
                    (F = r.hold),
                    ($ = r.bits),
                    (V = X),
                    (G = K),
                    (O = _);
                  t: for (;;)
                    switch (r.mode) {
                      case b:
                        if (r.wrap === 0) {
                          r.mode = 13;
                          break;
                        }
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (2 & r.wrap && F === 35615) {
                          (E[(r.check = 0)] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (r.check = a(r.check, E, 2, 0)),
                            ($ = F = 0),
                            (r.mode = 2);
                          break;
                        }
                        if (
                          ((r.flags = 0),
                          r.head && (r.head.done = !1),
                          !(1 & r.wrap) || (((255 & F) << 8) + (F >> 8)) % 31)
                        ) {
                          (y.msg = "incorrect header check"), (r.mode = 30);
                          break;
                        }
                        if ((15 & F) != 8) {
                          (y.msg = "unknown compression method"), (r.mode = 30);
                          break;
                        }
                        if (
                          (($ -= 4), (e = 8 + (15 & (F >>>= 4))), r.wbits === 0)
                        )
                          r.wbits = e;
                        else if (e > r.wbits) {
                          (y.msg = "invalid window size"), (r.mode = 30);
                          break;
                        }
                        (r.dmax = 1 << e),
                          (y.adler = r.check = 1),
                          (r.mode = 512 & F ? 10 : 12),
                          ($ = F = 0);
                        break;
                      case 2:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (((r.flags = F), (255 & r.flags) != 8)) {
                          (y.msg = "unknown compression method"), (r.mode = 30);
                          break;
                        }
                        if (57344 & r.flags) {
                          (y.msg = "unknown header flags set"), (r.mode = 30);
                          break;
                        }
                        r.head && (r.head.text = (F >> 8) & 1),
                          512 & r.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (r.check = a(r.check, E, 2, 0))),
                          ($ = F = 0),
                          (r.mode = 3);
                      case 3:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        r.head && (r.head.time = F),
                          512 & r.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (E[2] = (F >>> 16) & 255),
                            (E[3] = (F >>> 24) & 255),
                            (r.check = a(r.check, E, 4, 0))),
                          ($ = F = 0),
                          (r.mode = 4);
                      case 4:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        r.head &&
                          ((r.head.xflags = 255 & F), (r.head.os = F >> 8)),
                          512 & r.flags &&
                            ((E[0] = 255 & F),
                            (E[1] = (F >>> 8) & 255),
                            (r.check = a(r.check, E, 2, 0))),
                          ($ = F = 0),
                          (r.mode = 5);
                      case 5:
                        if (1024 & r.flags) {
                          for (; $ < 16; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (r.length = F),
                            r.head && (r.head.extra_len = F),
                            512 & r.flags &&
                              ((E[0] = 255 & F),
                              (E[1] = (F >>> 8) & 255),
                              (r.check = a(r.check, E, 2, 0))),
                            ($ = F = 0);
                        } else r.head && (r.head.extra = null);
                        r.mode = 6;
                      case 6:
                        if (
                          1024 & r.flags &&
                          (X < (j = r.length) && (j = X),
                          j &&
                            (r.head &&
                              ((e = r.head.extra_len - r.length),
                              r.head.extra ||
                                (r.head.extra = new Array(r.head.extra_len)),
                              s.arraySet(r.head.extra, A, B, j, e)),
                            512 & r.flags && (r.check = a(r.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            (r.length -= j)),
                          r.length)
                        )
                          break t;
                        (r.length = 0), (r.mode = 7);
                      case 7:
                        if (2048 & r.flags) {
                          if (X === 0) break t;
                          for (
                            j = 0;
                            (e = A[B + j++]),
                              r.head &&
                                e &&
                                r.length < 65536 &&
                                (r.head.name += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & r.flags && (r.check = a(r.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            e)
                          )
                            break t;
                        } else r.head && (r.head.name = null);
                        (r.length = 0), (r.mode = 8);
                      case 8:
                        if (4096 & r.flags) {
                          if (X === 0) break t;
                          for (
                            j = 0;
                            (e = A[B + j++]),
                              r.head &&
                                e &&
                                r.length < 65536 &&
                                (r.head.comment += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & r.flags && (r.check = a(r.check, A, j, B)),
                            (X -= j),
                            (B += j),
                            e)
                          )
                            break t;
                        } else r.head && (r.head.comment = null);
                        r.mode = 9;
                      case 9:
                        if (512 & r.flags) {
                          for (; $ < 16; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (F !== (65535 & r.check)) {
                            (y.msg = "header crc mismatch"), (r.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        r.head &&
                          ((r.head.hcrc = (r.flags >> 9) & 1),
                          (r.head.done = !0)),
                          (y.adler = r.check = 0),
                          (r.mode = 12);
                        break;
                      case 10:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        (y.adler = r.check = d(F)), ($ = F = 0), (r.mode = 11);
                      case 11:
                        if (r.havedict === 0)
                          return (
                            (y.next_out = J),
                            (y.avail_out = K),
                            (y.next_in = B),
                            (y.avail_in = X),
                            (r.hold = F),
                            (r.bits = $),
                            2
                          );
                        (y.adler = r.check = 1), (r.mode = 12);
                      case 12:
                        if (S === 5 || S === 6) break t;
                      case 13:
                        if (r.last) {
                          (F >>>= 7 & $), ($ -= 7 & $), (r.mode = 27);
                          break;
                        }
                        for (; $ < 3; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        switch (((r.last = 1 & F), ($ -= 1), 3 & (F >>>= 1))) {
                          case 0:
                            r.mode = 14;
                            break;
                          case 1:
                            if ((I(r), (r.mode = 20), S !== 6)) break;
                            (F >>>= 2), ($ -= 2);
                            break t;
                          case 2:
                            r.mode = 17;
                            break;
                          case 3:
                            (y.msg = "invalid block type"), (r.mode = 30);
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
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.length = 65535 & F),
                          ($ = F = 0),
                          (r.mode = 15),
                          S === 6)
                        )
                          break t;
                      case 15:
                        r.mode = 16;
                      case 16:
                        if ((j = r.length)) {
                          if ((X < j && (j = X), K < j && (j = K), j === 0))
                            break t;
                          s.arraySet(q, A, B, j, J),
                            (X -= j),
                            (B += j),
                            (K -= j),
                            (J += j),
                            (r.length -= j);
                          break;
                        }
                        r.mode = 12;
                        break;
                      case 17:
                        for (; $ < 14; ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (
                          ((r.nlen = 257 + (31 & F)),
                          (F >>>= 5),
                          ($ -= 5),
                          (r.ndist = 1 + (31 & F)),
                          (F >>>= 5),
                          ($ -= 5),
                          (r.ncode = 4 + (15 & F)),
                          (F >>>= 4),
                          ($ -= 4),
                          286 < r.nlen || 30 < r.ndist)
                        ) {
                          (y.msg = "too many length or distance symbols"),
                            (r.mode = 30);
                          break;
                        }
                        (r.have = 0), (r.mode = 18);
                      case 18:
                        for (; r.have < r.ncode; ) {
                          for (; $ < 3; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (r.lens[M[r.have++]] = 7 & F), (F >>>= 3), ($ -= 3);
                        }
                        for (; r.have < 19; ) r.lens[M[r.have++]] = 0;
                        if (
                          ((r.lencode = r.lendyn),
                          (r.lenbits = 7),
                          (R = { bits: r.lenbits }),
                          (O = h(0, r.lens, 0, 19, r.lencode, 0, r.work, R)),
                          (r.lenbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid code lengths set"), (r.mode = 30);
                          break;
                        }
                        (r.have = 0), (r.mode = 19);
                      case 19:
                        for (; r.have < r.nlen + r.ndist; ) {
                          for (
                            ;
                            (nt =
                              ((p = r.lencode[F & ((1 << r.lenbits) - 1)]) >>>
                                16) &
                              255),
                              (rt = 65535 & p),
                              !((et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (rt < 16)
                            (F >>>= et), ($ -= et), (r.lens[r.have++] = rt);
                          else {
                            if (rt === 16) {
                              for (v = et + 2; $ < v; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              if (((F >>>= et), ($ -= et), r.have === 0)) {
                                (y.msg = "invalid bit length repeat"),
                                  (r.mode = 30);
                                break;
                              }
                              (e = r.lens[r.have - 1]),
                                (j = 3 + (3 & F)),
                                (F >>>= 2),
                                ($ -= 2);
                            } else if (rt === 17) {
                              for (v = et + 3; $ < v; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              ($ -= et),
                                (e = 0),
                                (j = 3 + (7 & (F >>>= et))),
                                (F >>>= 3),
                                ($ -= 3);
                            } else {
                              for (v = et + 7; $ < v; ) {
                                if (X === 0) break t;
                                X--, (F += A[B++] << $), ($ += 8);
                              }
                              ($ -= et),
                                (e = 0),
                                (j = 11 + (127 & (F >>>= et))),
                                (F >>>= 7),
                                ($ -= 7);
                            }
                            if (r.have + j > r.nlen + r.ndist) {
                              (y.msg = "invalid bit length repeat"),
                                (r.mode = 30);
                              break;
                            }
                            for (; j--; ) r.lens[r.have++] = e;
                          }
                        }
                        if (r.mode === 30) break;
                        if (r.lens[256] === 0) {
                          (y.msg = "invalid code -- missing end-of-block"),
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.lenbits = 9),
                          (R = { bits: r.lenbits }),
                          (O = h(
                            g,
                            r.lens,
                            0,
                            r.nlen,
                            r.lencode,
                            0,
                            r.work,
                            R,
                          )),
                          (r.lenbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid literal/lengths set"),
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.distbits = 6),
                          (r.distcode = r.distdyn),
                          (R = { bits: r.distbits }),
                          (O = h(
                            u,
                            r.lens,
                            r.nlen,
                            r.ndist,
                            r.distcode,
                            0,
                            r.work,
                            R,
                          )),
                          (r.distbits = R.bits),
                          O)
                        ) {
                          (y.msg = "invalid distances set"), (r.mode = 30);
                          break;
                        }
                        if (((r.mode = 20), S === 6)) break t;
                      case 20:
                        r.mode = 21;
                      case 21:
                        if (6 <= X && 258 <= K) {
                          (y.next_out = J),
                            (y.avail_out = K),
                            (y.next_in = B),
                            (y.avail_in = X),
                            (r.hold = F),
                            (r.bits = $),
                            o(y, G),
                            (J = y.next_out),
                            (q = y.output),
                            (K = y.avail_out),
                            (B = y.next_in),
                            (A = y.input),
                            (X = y.avail_in),
                            (F = r.hold),
                            ($ = r.bits),
                            r.mode === 12 && (r.back = -1);
                          break;
                        }
                        for (
                          r.back = 0;
                          (nt =
                            ((p = r.lencode[F & ((1 << r.lenbits) - 1)]) >>>
                              16) &
                            255),
                            (rt = 65535 & p),
                            !((et = p >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (nt && !(240 & nt)) {
                          for (
                            ct = et, pt = nt, gt = rt;
                            (nt =
                              ((p =
                                r.lencode[
                                  gt + ((F & ((1 << (ct + pt)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (rt = 65535 & p),
                              !(ct + (et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (F >>>= ct), ($ -= ct), (r.back += ct);
                        }
                        if (
                          ((F >>>= et),
                          ($ -= et),
                          (r.back += et),
                          (r.length = rt),
                          nt === 0)
                        ) {
                          r.mode = 26;
                          break;
                        }
                        if (32 & nt) {
                          (r.back = -1), (r.mode = 12);
                          break;
                        }
                        if (64 & nt) {
                          (y.msg = "invalid literal/length code"),
                            (r.mode = 30);
                          break;
                        }
                        (r.extra = 15 & nt), (r.mode = 22);
                      case 22:
                        if (r.extra) {
                          for (v = r.extra; $ < v; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (r.length += F & ((1 << r.extra) - 1)),
                            (F >>>= r.extra),
                            ($ -= r.extra),
                            (r.back += r.extra);
                        }
                        (r.was = r.length), (r.mode = 23);
                      case 23:
                        for (
                          ;
                          (nt =
                            ((p = r.distcode[F & ((1 << r.distbits) - 1)]) >>>
                              16) &
                            255),
                            (rt = 65535 & p),
                            !((et = p >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (F += A[B++] << $), ($ += 8);
                        }
                        if (!(240 & nt)) {
                          for (
                            ct = et, pt = nt, gt = rt;
                            (nt =
                              ((p =
                                r.distcode[
                                  gt + ((F & ((1 << (ct + pt)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (rt = 65535 & p),
                              !(ct + (et = p >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (F >>>= ct), ($ -= ct), (r.back += ct);
                        }
                        if (((F >>>= et), ($ -= et), (r.back += et), 64 & nt)) {
                          (y.msg = "invalid distance code"), (r.mode = 30);
                          break;
                        }
                        (r.offset = rt), (r.extra = 15 & nt), (r.mode = 24);
                      case 24:
                        if (r.extra) {
                          for (v = r.extra; $ < v; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          (r.offset += F & ((1 << r.extra) - 1)),
                            (F >>>= r.extra),
                            ($ -= r.extra),
                            (r.back += r.extra);
                        }
                        if (r.offset > r.dmax) {
                          (y.msg = "invalid distance too far back"),
                            (r.mode = 30);
                          break;
                        }
                        r.mode = 25;
                      case 25:
                        if (K === 0) break t;
                        if (((j = G - K), r.offset > j)) {
                          if ((j = r.offset - j) > r.whave && r.sane) {
                            (y.msg = "invalid distance too far back"),
                              (r.mode = 30);
                            break;
                          }
                          (st =
                            j > r.wnext
                              ? ((j -= r.wnext), r.wsize - j)
                              : r.wnext - j),
                            j > r.length && (j = r.length),
                            (dt = r.window);
                        } else (dt = q), (st = J - r.offset), (j = r.length);
                        for (
                          K < j && (j = K), K -= j, r.length -= j;
                          (q[J++] = dt[st++]), --j;

                        );
                        r.length === 0 && (r.mode = 21);
                        break;
                      case 26:
                        if (K === 0) break t;
                        (q[J++] = r.length), K--, (r.mode = 21);
                        break;
                      case 27:
                        if (r.wrap) {
                          for (; $ < 32; ) {
                            if (X === 0) break t;
                            X--, (F |= A[B++] << $), ($ += 8);
                          }
                          if (
                            ((G -= K),
                            (y.total_out += G),
                            (r.total += G),
                            G &&
                              (y.adler = r.check =
                                r.flags
                                  ? a(r.check, q, G, J - G)
                                  : i(r.check, q, G, J - G)),
                            (G = K),
                            (r.flags ? F : d(F)) !== r.check)
                          ) {
                            (y.msg = "incorrect data check"), (r.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        r.mode = 28;
                      case 28:
                        if (r.wrap && r.flags) {
                          for (; $ < 32; ) {
                            if (X === 0) break t;
                            X--, (F += A[B++] << $), ($ += 8);
                          }
                          if (F !== (4294967295 & r.total)) {
                            (y.msg = "incorrect length check"), (r.mode = 30);
                            break;
                          }
                          $ = F = 0;
                        }
                        r.mode = 29;
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
                    (r.hold = F),
                    (r.bits = $),
                    (r.wsize ||
                      (G !== y.avail_out &&
                        r.mode < 30 &&
                        (r.mode < 27 || S !== 4))) &&
                    N(y, y.output, y.next_out, G - y.avail_out)
                      ? ((r.mode = 31), -4)
                      : ((V -= y.avail_in),
                        (G -= y.avail_out),
                        (y.total_in += V),
                        (y.total_out += G),
                        (r.total += G),
                        r.wrap &&
                          G &&
                          (y.adler = r.check =
                            r.flags
                              ? a(r.check, q, G, y.next_out - G)
                              : i(r.check, q, G, y.next_out - G)),
                        (y.data_type =
                          r.bits +
                          (r.last ? 64 : 0) +
                          (r.mode === 12 ? 128 : 0) +
                          (r.mode === 20 || r.mode === 15 ? 256 : 0)),
                        ((V == 0 && G === 0) || S === 4) && O === _ && (O = -5),
                        O)
                  );
                }),
                (l.inflateEnd = function (y) {
                  if (!y || !y.state) return c;
                  var S = y.state;
                  return S.window && (S.window = null), (y.state = null), _;
                }),
                (l.inflateGetHeader = function (y, S) {
                  var r;
                  return y && y.state && 2 & (r = y.state).wrap
                    ? (((r.head = S).done = !1), _)
                    : c;
                }),
                (l.inflateSetDictionary = function (y, S) {
                  var r,
                    A = S.length;
                  return y && y.state
                    ? (r = y.state).wrap !== 0 && r.mode !== 11
                      ? c
                      : r.mode === 11 && i(1, S, A, 0) !== r.check
                      ? -3
                      : N(y, S, A, A)
                      ? ((r.mode = 31), -4)
                      : ((r.havedict = 1), _)
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
            function (t, m, l) {
              "use strict";
              var s = t("../utils/common"),
                i = [
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
                h = [
                  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22,
                  22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29,
                  64, 64,
                ];
              m.exports = function (g, u, _, c, b, n, f, d) {
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
                  r = 0,
                  A = 0,
                  q = 0,
                  B = 0,
                  J = 0,
                  X = 0,
                  K = 0,
                  F = 0,
                  $ = null,
                  V = 0,
                  G = new s.Buf16(16),
                  j = new s.Buf16(16),
                  st = null,
                  dt = 0;
                for (y = 0; y <= 15; y++) G[y] = 0;
                for (S = 0; S < c; S++) G[u[_ + S]]++;
                for (q = N, A = 15; 1 <= A && G[A] === 0; A--);
                if ((A < q && (q = A), A === 0))
                  return (
                    (b[n++] = 20971520), (b[n++] = 20971520), (d.bits = 1), 0
                  );
                for (r = 1; r < A && G[r] === 0; r++);
                for (q < r && (q = r), y = X = 1; y <= 15; y++)
                  if (((X <<= 1), (X -= G[y]) < 0)) return -1;
                if (0 < X && (g === 0 || A !== 1)) return -1;
                for (j[1] = 0, y = 1; y < 15; y++) j[y + 1] = j[y] + G[y];
                for (S = 0; S < c; S++)
                  u[_ + S] !== 0 && (f[j[u[_ + S]]++] = S);
                if (
                  ((T =
                    g === 0
                      ? (($ = st = f), 19)
                      : g === 1
                      ? (($ = i), (V -= 257), (st = a), (dt -= 257), 256)
                      : (($ = o), (st = h), -1)),
                  (y = r),
                  (P = n),
                  (J = S = F = 0),
                  (C = -1),
                  (k = (K = 1 << (B = q)) - 1),
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
                          ? ((D = st[dt + f[S]]), $[V + f[S]])
                          : ((D = 96), 0),
                      w = 1 << (y - J),
                      r = x = 1 << B;
                    (b[P + (F >> J) + (x -= w)] =
                      (U << 24) | (D << 16) | I | 0),
                      x !== 0;

                  );
                  for (w = 1 << (y - 1); F & w; ) w >>= 1;
                  if (
                    (w !== 0 ? ((F &= w - 1), (F += w)) : (F = 0),
                    S++,
                    --G[y] == 0)
                  ) {
                    if (y === A) break;
                    y = u[_ + f[S]];
                  }
                  if (q < y && (F & k) !== C) {
                    for (
                      J === 0 && (J = q), P += r, X = 1 << (B = y - J);
                      B + J < A && !((X -= G[B + J]) <= 0);

                    )
                      B++, (X <<= 1);
                    if (
                      ((K += 1 << B),
                      (g === 1 && 852 < K) || (g === 2 && 592 < K))
                    )
                      return 1;
                    b[(C = F & k)] = (q << 24) | (B << 16) | (P - n) | 0;
                  }
                }
                return (
                  F !== 0 && (b[P + F] = ((y - J) << 24) | (64 << 16) | 0),
                  (d.bits = q),
                  0
                );
              };
            },
            { "../utils/common": 41 },
          ],
          51: [
            function (t, m, l) {
              "use strict";
              m.exports = {
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
            function (t, m, l) {
              "use strict";
              var s = t("../utils/common"),
                i = 0,
                a = 1;
              function o(p) {
                for (var E = p.length; 0 <= --E; ) p[E] = 0;
              }
              var h = 0,
                g = 29,
                u = 256,
                _ = u + 1 + g,
                c = 30,
                b = 19,
                n = 2 * _ + 1,
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
                N = new Array(2 * (_ + 2));
              o(N);
              var y = new Array(2 * c);
              o(y);
              var S = new Array(512);
              o(S);
              var r = new Array(256);
              o(r);
              var A = new Array(g);
              o(A);
              var q,
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
              function G(p, E, M) {
                p.bi_valid > d - M
                  ? ((p.bi_buf |= (E << p.bi_valid) & 65535),
                    V(p, p.bi_buf),
                    (p.bi_buf = E >> (d - p.bi_valid)),
                    (p.bi_valid += M - d))
                  : ((p.bi_buf |= (E << p.bi_valid) & 65535),
                    (p.bi_valid += M));
              }
              function j(p, E, M) {
                G(p, M[2 * E], M[2 * E + 1]);
              }
              function st(p, E) {
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
                  W !== 0 && (p[2 * z] = st(Y[W]++, W));
                }
              }
              function et(p) {
                var E;
                for (E = 0; E < _; E++) p.dyn_ltree[2 * E] = 0;
                for (E = 0; E < c; E++) p.dyn_dtree[2 * E] = 0;
                for (E = 0; E < b; E++) p.bl_tree[2 * E] = 0;
                (p.dyn_ltree[2 * x] = 1),
                  (p.opt_len = p.static_len = 0),
                  (p.last_lit = p.matches = 0);
              }
              function nt(p) {
                8 < p.bi_valid
                  ? V(p, p.bi_buf)
                  : 0 < p.bi_valid && (p.pending_buf[p.pending++] = p.bi_buf),
                  (p.bi_buf = 0),
                  (p.bi_valid = 0);
              }
              function rt(p, E, M, L) {
                var z = 2 * E,
                  Y = 2 * M;
                return p[z] < p[Y] || (p[z] === p[Y] && L[E] <= L[M]);
              }
              function ct(p, E, M) {
                for (
                  var L = p.heap[M], z = M << 1;
                  z <= p.heap_len &&
                  (z < p.heap_len &&
                    rt(E, p.heap[z + 1], p.heap[z], p.depth) &&
                    z++,
                  !rt(E, L, p.heap[z], p.depth));

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
                        : (j(p, (Y = r[z]) + u + 1, E),
                          (Z = T[Y]) !== 0 && G(p, (z -= A[Y]), Z),
                          j(p, (Y = $(--L)), M),
                          (Z = U[Y]) !== 0 && G(p, (L -= X[Y]), Z)),
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
                for (p.heap_len = 0, p.heap_max = n, M = 0; M < Q; M++)
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
                  (function (it, vt) {
                    var Dt,
                      xt,
                      It,
                      H,
                      ot,
                      lt,
                      ut = vt.dyn_tree,
                      wt = vt.max_code,
                      Ft = vt.stat_desc.static_tree,
                      Pt = vt.stat_desc.has_stree,
                      zt = vt.stat_desc.extra_bits,
                      St = vt.stat_desc.extra_base,
                      Rt = vt.stat_desc.max_length,
                      Ut = 0;
                    for (H = 0; H <= f; H++) it.bl_count[H] = 0;
                    for (
                      ut[2 * it.heap[it.heap_max] + 1] = 0,
                        Dt = it.heap_max + 1;
                      Dt < n;
                      Dt++
                    )
                      Rt <
                        (H = ut[2 * ut[2 * (xt = it.heap[Dt]) + 1] + 1] + 1) &&
                        ((H = Rt), Ut++),
                        (ut[2 * xt + 1] = H),
                        wt < xt ||
                          (it.bl_count[H]++,
                          (ot = 0),
                          St <= xt && (ot = zt[xt - St]),
                          (lt = ut[2 * xt]),
                          (it.opt_len += lt * (H + ot)),
                          Pt && (it.static_len += lt * (Ft[2 * xt + 1] + ot)));
                    if (Ut !== 0) {
                      do {
                        for (H = Rt - 1; it.bl_count[H] === 0; ) H--;
                        it.bl_count[H]--,
                          (it.bl_count[H + 1] += 2),
                          it.bl_count[Rt]--,
                          (Ut -= 2);
                      } while (0 < Ut);
                      for (H = Rt; H !== 0; H--)
                        for (xt = it.bl_count[H]; xt !== 0; )
                          wt < (It = it.heap[--Dt]) ||
                            (ut[2 * It + 1] !== H &&
                              ((it.opt_len +=
                                (H - ut[2 * It + 1]) * ut[2 * It]),
                              (ut[2 * It + 1] = H)),
                            xt--);
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
                          G(p, W - 3, 2))
                        : W <= 10
                        ? (j(p, k, p.bl_tree), G(p, W - 3, 3))
                        : (j(p, P, p.bl_tree), G(p, W - 11, 7));
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
              function v(p, E, M, L) {
                G(p, (h << 1) + (L ? 1 : 0), 3),
                  (function (z, Y, Z, W) {
                    nt(z),
                      W && (V(z, Z), V(z, ~Z)),
                      s.arraySet(z.pending_buf, z.window, Y, Z, z.pending),
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
                      for (A[z] = L, E = 0; E < 1 << T[z]; E++) r[L++] = z;
                    for (r[L - 1] = z, z = Y = 0; z < 16; z++)
                      for (X[z] = Y, E = 0; E < 1 << U[z]; E++) S[Y++] = z;
                    for (Y >>= 7; z < c; z++)
                      for (X[z] = Y << 7, E = 0; E < 1 << (U[z] - 7); E++)
                        S[256 + Y++] = z;
                    for (M = 0; M <= f; M++) Z[M] = 0;
                    for (E = 0; E <= 143; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (; E <= 255; ) (N[2 * E + 1] = 9), E++, Z[9]++;
                    for (; E <= 279; ) (N[2 * E + 1] = 7), E++, Z[7]++;
                    for (; E <= 287; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (dt(N, _ + 1, Z), E = 0; E < c; E++)
                      (y[2 * E + 1] = 5), (y[2 * E] = st(E, 5));
                    (q = new K(N, T, u + 1, _, f)),
                      (B = new K(y, U, 0, c, f)),
                      (J = new K(new Array(0), D, 0, b, w));
                  })(),
                  (R = !0)),
                  (p.l_desc = new F(p.dyn_ltree, q)),
                  (p.d_desc = new F(p.dyn_dtree, B)),
                  (p.bl_desc = new F(p.bl_tree, J)),
                  (p.bi_buf = 0),
                  (p.bi_valid = 0),
                  et(p);
              }),
                (l._tr_stored_block = v),
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
                            if (1 & at && W.dyn_ltree[2 * Q] !== 0) return i;
                          if (
                            W.dyn_ltree[18] !== 0 ||
                            W.dyn_ltree[20] !== 0 ||
                            W.dyn_ltree[26] !== 0
                          )
                            return a;
                          for (Q = 32; Q < u; Q++)
                            if (W.dyn_ltree[2 * Q] !== 0) return a;
                          return i;
                        })(p)),
                      gt(p, p.l_desc),
                      gt(p, p.d_desc),
                      (Z = (function (W) {
                        var Q;
                        for (
                          e(W, W.dyn_ltree, W.l_desc.max_code),
                            e(W, W.dyn_dtree, W.d_desc.max_code),
                            gt(W, W.bl_desc),
                            Q = b - 1;
                          3 <= Q && W.bl_tree[2 * I[Q] + 1] === 0;
                          Q--
                        );
                        return (W.opt_len += 3 * (Q + 1) + 5 + 5 + 4), Q;
                      })(p)),
                      (z = (p.opt_len + 3 + 7) >>> 3),
                      (Y = (p.static_len + 3 + 7) >>> 3) <= z && (z = Y))
                    : (z = Y = M + 5),
                    M + 4 <= z && E !== -1
                      ? v(p, E, M, L)
                      : p.strategy === 4 || Y === z
                      ? (G(p, 2 + (L ? 1 : 0), 3), pt(p, N, y))
                      : (G(p, 4 + (L ? 1 : 0), 3),
                        (function (W, Q, at, it) {
                          var vt;
                          for (
                            G(W, Q - 257, 5),
                              G(W, at - 1, 5),
                              G(W, it - 4, 4),
                              vt = 0;
                            vt < it;
                            vt++
                          )
                            G(W, W.bl_tree[2 * I[vt] + 1], 3);
                          O(W, W.dyn_ltree, Q - 1), O(W, W.dyn_dtree, at - 1);
                        })(
                          p,
                          p.l_desc.max_code + 1,
                          p.d_desc.max_code + 1,
                          Z + 1,
                        ),
                        pt(p, p.dyn_ltree, p.dyn_dtree)),
                    et(p),
                    L && nt(p);
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
                        p.dyn_ltree[2 * (r[M] + u + 1)]++,
                        p.dyn_dtree[2 * $(E)]++),
                    p.last_lit === p.lit_bufsize - 1
                  );
                }),
                (l._tr_align = function (p) {
                  G(p, 2, 3),
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
            function (t, m, l) {
              "use strict";
              m.exports = function () {
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
            function (t, m, l) {
              (function (s) {
                (function (i, a) {
                  "use strict";
                  if (!i.setImmediate) {
                    var o,
                      h,
                      g,
                      u,
                      _ = 1,
                      c = {},
                      b = !1,
                      n = i.document,
                      f = Object.getPrototypeOf && Object.getPrototypeOf(i);
                    (f = f && f.setTimeout ? f : i),
                      (o =
                        {}.toString.call(i.process) === "[object process]"
                          ? function (C) {
                              process.nextTick(function () {
                                w(C);
                              });
                            }
                          : (function () {
                              if (i.postMessage && !i.importScripts) {
                                var C = !0,
                                  k = i.onmessage;
                                return (
                                  (i.onmessage = function () {
                                    C = !1;
                                  }),
                                  i.postMessage("", "*"),
                                  (i.onmessage = k),
                                  C
                                );
                              }
                            })()
                          ? ((u = "setImmediate$" + Math.random() + "$"),
                            i.addEventListener
                              ? i.addEventListener("message", x, !1)
                              : i.attachEvent("onmessage", x),
                            function (C) {
                              i.postMessage(u + C, "*");
                            })
                          : i.MessageChannel
                          ? (((g = new MessageChannel()).port1.onmessage =
                              function (C) {
                                w(C.data);
                              }),
                            function (C) {
                              g.port2.postMessage(C);
                            })
                          : n &&
                            "onreadystatechange" in n.createElement("script")
                          ? ((h = n.documentElement),
                            function (C) {
                              var k = n.createElement("script");
                              (k.onreadystatechange = function () {
                                w(C),
                                  (k.onreadystatechange = null),
                                  h.removeChild(k),
                                  (k = null);
                              }),
                                h.appendChild(k);
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
                        return (c[_] = T), o(_), _++;
                      }),
                      (f.clearImmediate = d);
                  }
                  function d(C) {
                    delete c[C];
                  }
                  function w(C) {
                    if (b) setTimeout(w, 0, C);
                    else {
                      var k = c[C];
                      if (k) {
                        b = !0;
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
                          d(C), (b = !1);
                        }
                      }
                    }
                  }
                  function x(C) {
                    C.source === i &&
                      typeof C.data == "string" &&
                      C.data.indexOf(u) === 0 &&
                      w(+C.data.slice(u.length));
                  }
                })(typeof self > "u" ? (s === void 0 ? this : s) : self);
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
  var Kt = Be(ie());
  var se = (t) =>
      Array.isArray(t) &&
      t.length === 2 &&
      typeof t[0] == "number" &&
      typeof t[1] == "number",
    ae = (t, m, l) => {
      let s = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (s == 0) return [0, 0];
      let a = Math.atan2(s / m, l) * (180 / Math.PI);
      return [(t[0] * a) / s, (t[1] * a) / s];
    },
    oe = (t, m, l) => {
      let s = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (s >= 90) {
        let a = 89.99999999 / s;
        return oe([t[0] * a, t[1] * a], m, l);
      }
      let i = m * l * Math.tan((s * Math.PI) / 180);
      return s == 0 ? [0, 0] : [(t[0] * i) / s, (t[1] * i) / s];
    },
    ce = (t) => {
      let m = ae(
        [
          t.fixationXYPx[0] - t.nearestPointXYZPx[0],
          t.fixationXYPx[1] - t.nearestPointXYZPx[1],
        ],
        t.pxPerCm,
        t.viewingDistanceCm,
      );
      return [-m[0], -m[1]];
    },
    mt = (t, m) => {
      let l = ce(m),
        s = (i) => {
          let a = [i[0] - l[0], i[1] - l[1]],
            o = oe(a, m.pxPerCm, m.viewingDistanceCm);
          return [o[0] + m.nearestPointXYZPx[0], o[1] + m.nearestPointXYZPx[1]];
        };
      return se(t) ? s(t) : t.map(s);
    },
    bt = (t, m) => {
      let l = ce(m),
        s = (i) => {
          let a = [
              i[0] - m.nearestPointXYZPx[0],
              i[1] - m.nearestPointXYZPx[1],
            ],
            o = ae(a, m.pxPerCm, m.viewingDistanceCm);
          return [o[0] + l[0], o[1] + l[1]];
        };
      return se(t) ? s(t) : t.map(s);
    };
  var Mt = (t) => {
      t.charCodeAt(0) === 65279 && (t = t.slice(1));
      let m = [],
        l = [],
        s = "",
        i = !1,
        a = () => {
          l.push(s.trim()), (s = "");
        },
        o = () => {
          (l.length > 1 || l[0] !== "") && m.push(l), (l = []);
        };
      for (let h = 0; h < t.length; h++) {
        let g = t[h];
        i
          ? g === '"'
            ? t[h + 1] === '"'
              ? ((s += '"'), h++)
              : (i = !1)
            : (s += g)
          : g === '"'
          ? (i = !0)
          : g === ","
          ? a()
          : g ===
              `
` || g === "\r"
          ? (g === "\r" &&
              t[h + 1] ===
                `
` &&
              h++,
            a(),
            o())
          : (s += g);
      }
      return a(), o(), { header: m[0] ?? [], rows: m.slice(1) };
    },
    yt = (t) => {
      if (t === void 0) return;
      let m = Number(t);
      return Number.isFinite(m) ? m : void 0;
    },
    le = (t) => {
      let m = t.match(/(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!m) return;
      let l = Number(m[1]),
        s = Number(m[2]);
      return Number.isFinite(l) && Number.isFinite(s) ? [l, s] : void 0;
    },
    Le = (t) => {
      let m = t.match(
        /\[\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*,\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\]/,
      );
      if (!m) return;
      let l = m.slice(1).map(Number);
      return l.every(Number.isFinite)
        ? [
            [l[0], l[1]],
            [l[2], l[3]],
          ]
        : void 0;
    },
    Ne = (t, m, l) => [t[0] - m / 2, l / 2 - t[1]],
    ue = (t, m, l = [], s = !1) => {
      let i = [
          [-m.screenW / 2, -m.screenH / 2],
          [m.screenW / 2, m.screenH / 2],
        ],
        a = s ? 3 : 2,
        o = (n) => ({
          pxPerCm: m.pxPerCm,
          viewingDistanceCm: s ? n[2] : m.viewingDistanceCm,
          fixationXYPx: m.fixationXYPx ?? [0, 0],
          nearestPointXYZPx: [n[0], n[1]],
        }),
        h = (n) => {
          let f = 0;
          for (let d = 0; d < 2; d++) {
            let w = bt(i[d], o(n)),
              x = w[0] - t[d][0],
              C = w[1] - t[d][1];
            f += x * x + C * C;
          }
          return Math.sqrt(f);
        },
        g = (n) => (s ? [...n, m.viewingDistanceCm] : [...n]),
        u = [
          ...l.map((n) => g([...n])),
          g([0, 0]),
          g([m.screenW / 2, m.screenH / 2]),
          g([m.screenW / 4, m.screenH / 4]),
        ],
        _ = u[0],
        c = h(_);
      for (let n of u.slice(1)) {
        let f = h(n);
        f < c && ((c = f), (_ = n));
      }
      let b = Math.max(m.screenW, m.screenH) / 8;
      for (; b >= 0.25; ) {
        let n = !0;
        for (; n; ) {
          n = !1;
          for (let f = 0; f < a; f++)
            for (let d of [1, -1]) {
              let w = [..._];
              w[f] += d * b;
              let x = h(w);
              x < c - 1e-12 && ((c = x), (_ = w), (n = !0));
            }
        }
        b /= 2;
      }
      return {
        nearest: [_[0], _[1]],
        viewingDistanceCm: _[2] ?? m.viewingDistanceCm,
        residualDeg: c,
      };
    },
    Gt = 0.15,
    Xt = 150,
    de = 2.5,
    fe = 3,
    he = (t, m, l) =>
      t[0] > 0.1 * m && t[0] < 0.9 * m && t[1] > -0.25 * l && t[1] < 0.95 * l,
    Me = (t, m, l) => Math.abs(t[0]) < 0.4 * m && Math.abs(t[1]) < 0.4 * l,
    Ue = (t, m, l) => {
      if (
        (t("fixationLocationStrategy") ?? "centerFixation") !== "centerFixation"
      )
        return [0, 0];
      let i = (t("fixationOriginXYScreen") ?? "0.5, 0.5").match(
        /([\d.]+)\s*,\s*([\d.]+)/,
      );
      if (!i) return [0, 0];
      let a = Number(i[1]),
        o = Number(i[2]),
        h = yt(t("targetImageSpareFraction") ?? "");
      if (h && h > 0) {
        let g = t("targetImageWhere") ?? "top",
          u = 0,
          _ = 1,
          c = 0,
          b = 1;
        g === "top"
          ? (c = h)
          : g === "bottom"
          ? (b = 1 - h)
          : g === "left"
          ? (_ = 1 - h)
          : (u = h),
          (a = u + a * (_ - u)),
          (o = c + o * (b - c));
      }
      return [
        Math.round((2 * a - 1) * (m / 2)),
        Math.round((2 * o - 1) * (l / 2)),
      ];
    },
    kt = (t) => ({
      status: "FLAGGED",
      statusReason: t,
      columns: { repairStatus: "FLAGGED", repairStatusReason: t },
    }),
    Yt = (t) => {
      if (/-repaired(\.results)?\.csv$/i.test(t)) return t;
      let m = t.match(/^(.*?)(\.results)?\.csv$/i);
      return m ? `${m[1]}-repaired${m[2] ?? ""}.csv` : `${t}-repaired.csv`;
    },
    ge = (t) => {
      let { header: m, rows: l } = Mt(t);
      if (m.includes("repairStatus") || m.includes("repairImputedColumns"))
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
      let s = (I) => m.indexOf(I),
        i = (I, N) => {
          let y = s(N);
          if (y < 0) return;
          let S = I[y];
          return S === "" ? void 0 : S;
        },
        a = (I) => {
          for (let N of l) {
            let y = i(N, I);
            if (y !== void 0) return y;
          }
        },
        o = yt(a("screenWidthPx")),
        h = yt(a("screenHeightPx")),
        g = yt(a("pxPerCm")),
        u = "2025-08-30",
        _ = "2026-09-15",
        c = a("date") ?? "",
        b = c.match(/(\d{4})-(\d{2})-(\d{2})/),
        n = b ? `${b[1]}-${b[2]}-${b[3]}` : "",
        f = !!n && n < u,
        d = !!n && n < _,
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
          let y = s(N);
          if (y < 0) continue;
          let S = I[y];
          S !== "" && S !== void 0
            ? C.set(N, S)
            : C.has(N) && (I[y] = C.get(N));
        }
      });
      let k = (I, N) => {
          let y = s(N);
          if (y < 0) return;
          let S = I[y];
          return S === "" ? void 0 : S;
        },
        P = l.map(() => kt("not assessed")),
        T = 0,
        U = 0,
        D = 0;
      l.forEach((I, N) => {
        let y = x[N],
          S = k(y, "nearpointXYPxAppleCoords"),
          r = k(y, "screenBoundingRectDeg"),
          A = k(y, "nearestXYPx"),
          q = yt(k(y, "targetEccentricityXDeg")),
          B = yt(k(y, "targetEccentricityYDeg")),
          J = yt(k(y, "markingFixationMotionRadiusDeg")),
          X = k(y, "thresholdParameter"),
          K = yt(k(y, "level")),
          F =
            yt(k(y, "distanceCm")) ??
            yt(k(y, "viewingDistancePredictedCm")) ??
            yt(a("viewingDistanceDesiredCm")),
          $ = Ue((H) => k(y, H), o, h);
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
        if (!(o && o > 0) || !(h && h > 0) || !(g && g > 0) || !(F && F > 0)) {
          P[N] = kt(
            "missing apparatus columns (pxPerCm/screenWidthPx/screenHeightPx/distance)",
          );
          return;
        }
        let V = S ? le(S) : void 0,
          G = r ? Le(r) : void 0;
        if (
          V &&
          !A &&
          Math.abs(V[0] - o / 2) <= de &&
          Math.abs(V[1] - h / 2) <= de
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
        if (!G) {
          P[N] = kt(
            V
              ? "no screenBoundingRectDeg, non-center apple \u2014 window size unknown"
              : "no nearest-point data on this row or prior (metadata row?)",
          );
          return;
        }
        let j = V ? [V[0] - o / 2, h / 2 - V[1]] : void 0,
          st = {
            pxPerCm: g,
            viewingDistanceCm: F,
            screenW: o,
            screenH: h,
            fixationXYPx: $,
          },
          dt = ue(G, st, j ? [j] : []),
          et = F,
          nt = "";
        if (dt.residualDeg > Gt) {
          let H = ue(G, st, j ? [j] : [], !0);
          H.residualDeg <= Gt &&
            H.viewingDistanceCm >= 15 &&
            H.viewingDistanceCm <= 250 &&
            ((dt = H),
            (et = H.viewingDistanceCm),
            (nt = `; rect fit moved viewing distance ${F.toFixed(
              1,
            )}->${et.toFixed(1)} cm`));
        }
        if (dt.residualDeg > Gt) {
          P[N] = kt(
            `screenBoundingRectDeg not reproducible (fit residual ${dt.residualDeg.toFixed(
              3,
            )} deg). Likely cause: viewing distance at logging time differed, or the (unlogged) random fixation offset was nonzero \u2014 neither recoverable from this file.`,
          );
          return;
        }
        let rt = dt.nearest,
          ct = !0;
        j &&
          (ct = Math.abs(j[0] - rt[0]) <= fe && Math.abs(j[1] - rt[1]) <= fe);
        let pt = ct
          ? ""
          : " (appleCoords disagrees \u2014 non-fullscreen window; rect fit used)";
        if (!A && Math.abs(rt[0]) <= 5 && Math.abs(rt[1]) <= 5) {
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
        let gt = he(rt, o, h),
          e = Me(rt, o, h),
          O,
          R = rt;
        if (A) {
          let H = le(A);
          if (!H) {
            P[N] = kt("nearestXYPx column unparseable");
            return;
          }
          let ot = Math.hypot(H[0] - rt[0], H[1] - rt[1]),
            lt = [rt[0] + o / 2, h / 2 - rt[1]],
            ut = Math.hypot(H[0] - lt[0], H[1] - lt[1]),
            wt = Math.abs(rt[0]) <= 5 && Math.abs(rt[1]) <= 5;
          if (d) {
            if (!wt && ot > Xt && ut > Xt) {
              P[N] = kt(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${Math.min(
                  ot,
                  ut,
                ).toFixed(0)} px)`,
              );
              return;
            }
            (O = !0), (R = H);
          } else if (gt && !e) {
            if (ot > Xt) {
              P[N] = kt(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${ot.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            (O = !0), (R = H);
          } else if (e && !gt) {
            if (ut > Xt) {
              P[N] = kt(
                `trial-time nearestXYPx inconsistent with condition geometry (drift ${ut.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            O = !1;
          } else {
            P[N] = kt(
              "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
                pt,
            );
            return;
          }
        } else if (gt && !e) O = !0;
        else if (e && !gt) O = !1;
        else {
          P[N] = kt(
            "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
              pt,
          );
          return;
        }
        if (O && !d && !he(R, o, h)) {
          P[N] = kt(
            "nearest outside plausible rc band \u2014 not corrected" + pt,
          );
          return;
        }
        if (O && !A && rt.some((H) => H !== 0)) {
          P[N] = kt(
            "buggy session; no stimulus-time nearestXYPx on this row \u2014 live eye unknown" +
              pt,
          );
          return;
        }
        if (!O) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason: "fix already applied (converted nearest used)" + pt,
            nearestUsedXY: rt,
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "fixed-code run",
            },
          };
          return;
        }
        if (J !== void 0 && J > 0) {
          P[N] = kt(
            "moving crosshair (markingFixationMotionRadiusDeg > 0); per-frame fixation unknown",
          );
          return;
        }
        let v = Ne(R, o, h),
          p = yt(k(y, "distanceCm")) ?? et,
          E = {
            pxPerCm: g,
            viewingDistanceCm: p,
            fixationXYPx: $,
            nearestPointXYZPx: R,
          },
          M = { ...E, nearestPointXYZPx: v },
          L = {},
          z = {
            status: "CORRECTED",
            statusReason:
              "nearest recovered; corrected (static fixation assumed \u2014 random offset not logged)" +
              pt +
              nt,
            nearestUsedXY: R,
            nearestCorrectXY: v,
            columns: L,
          },
          Y = (H, ot, lt) => {
            if (!(lt > 0) || !Number.isFinite(lt)) return;
            let ut = mt(H, E),
              wt = mt([H[0] + ot[0] * lt, H[1] + ot[1] * lt], E),
              Ft = bt(ut, M),
              Pt = bt(wt, M);
            return Math.hypot(Pt[0] - Ft[0], Pt[1] - Ft[1]);
          },
          Z = q !== void 0 && B !== void 0 ? [q, B] : void 0;
        if (Z) {
          let H = mt(Z, E),
            ot = bt(H, M);
          (z.actualTargetEccentricityXDeg = ot[0]),
            (z.actualTargetEccentricityYDeg = ot[1]),
            (L.actualTargetEccentricityXDeg = ot[0].toFixed(4)),
            (L.actualTargetEccentricityYDeg = ot[1].toFixed(4)),
            (L.drawnTargetXYPx = `${H[0].toFixed(1)}, ${H[1].toFixed(1)}`);
          let lt = mt(Z, M);
          L.correctedTargetXYPx = `${lt[0].toFixed(1)}, ${lt[1].toFixed(1)}`;
        }
        let W = Z
            ? (() => {
                let H = Math.hypot(Z[0], Z[1]) || 1;
                return [Z[0] / H, Z[1] / H];
              })()
            : [1, 0],
          Q = [-W[1], W[0]],
          at = K === void 0 ? NaN : Math.pow(10, K);
        if (Z && X === "spacingDeg") {
          let H = k(y, "spacingDirection") ?? "radial",
            lt = Y(
              Z,
              ((ut) =>
                ut.includes("horizontal")
                  ? [1, 0]
                  : ut.includes("vertical")
                  ? [0, 1]
                  : ut.includes("tangential")
                  ? Q
                  : W)(H),
              at,
            );
          if (
            (lt !== void 0 &&
              ((z.actualSpacingDeg = lt),
              (z.actualLevelLog10Deg = Math.log10(lt)),
              (L.actualSpacingDeg = lt.toFixed(4)),
              (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4))),
            /And/.test(H))
          ) {
            let ut = H.includes("radial") ? Q : [1, 0],
              wt = Y(Z, ut, at);
            wt !== void 0 && (L.actualSpacingSecondaryDeg = wt.toFixed(4));
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
          let H = Math.hypot(
            z.actualTargetEccentricityXDeg,
            z.actualTargetEccentricityYDeg ?? 0,
          );
          (z.actualLevelLog10Deg = Math.log10(H)),
            (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4));
        }
        if (Z && X === "targetOffsetDeg") {
          let H = Y(Z, [1, 0], at);
          H !== void 0 &&
            ((z.actualLevelLog10Deg = Math.log10(H)),
            (L.actualLevelLog10Deg = z.actualLevelLog10Deg.toFixed(4)));
        }
        let it = (() => {
            let H = k(y, "spacingDirection") ?? "radial";
            return H.includes("horizontal")
              ? [1, 0]
              : H.includes("vertical")
              ? [0, 1]
              : H.includes("tangential")
              ? Q
              : W;
          })(),
          vt = yt(k(y, "spacingDeg") ?? "");
        if (Z && vt !== void 0 && vt > 0 && X !== "spacingDeg") {
          let H = Y(Z, it, vt);
          H !== void 0 && (L.actualSpacingDegNominal = H.toFixed(4));
        }
        let Dt = yt(k(y, "targetSizeDeg") ?? "");
        if (Z && Dt !== void 0 && Dt > 0 && X !== "targetSizeDeg") {
          let H = /true/i.test(k(y, "targetSizeIsHeightBool") ?? "FALSE"),
            ot = Y(Z, H ? [0, 1] : [1, 0], Dt);
          ot !== void 0 && (L.actualSizeDegNominal = ot.toFixed(4));
        }
        let xt = yt(k(y, "flankerSpacingDeg") ?? "");
        if (Z && xt !== void 0 && xt > 0) {
          let H = Y(Z, W, xt);
          H !== void 0 && (L.actualFlankerSpacingDeg = H.toFixed(4));
        }
        {
          let H = bt([-o / 2, -h / 2], M),
            ot = bt([o / 2, h / 2], M);
          L.screenBoundingRectDegCorrected = `[(${H[0].toFixed(
            4,
          )}, ${H[1].toFixed(4)}), (${ot[0].toFixed(4)}, ${ot[1].toFixed(4)})]`;
        }
        if (
          k(y, "gazeMeasuredXDeg") !== "" ||
          k(y, "gazeMeasuredYDeg") !== "" ||
          k(y, "gazeMeasuredRawDeg") !== ""
        )
          if (!ct)
            z.statusReason += "; gaze left as logged (window size unknown)";
          else {
            let H = (zt) => {
                let St = mt(zt, E);
                return bt(St, M);
              },
              ot = yt(k(y, "gazeMeasuredXDeg")),
              lt = yt(k(y, "gazeMeasuredYDeg")),
              ut,
              wt;
            if (
              (ot !== void 0 &&
                ((ut = H([ot, lt ?? 0])),
                (L.gazeMeasuredXDeg = ut[0].toFixed(5))),
              lt !== void 0 &&
                ((wt = H([ot ?? 0, lt])),
                (L.gazeMeasuredYDeg = wt[1].toFixed(5))),
              ut !== void 0 || wt !== void 0)
            ) {
              let zt = ut ? ut[0] : ot,
                St = wt ? wt[1] : lt;
              L.gazeMeasuredRDeg = Math.hypot(zt, St).toFixed(5);
            }
            let Ft = ut !== void 0 || wt !== void 0,
              Pt = k(y, "gazeMeasuredRawDeg");
            if (Pt !== "")
              try {
                let zt = JSON.parse(Pt);
                Array.isArray(zt) &&
                  zt.length > 0 &&
                  ((L.gazeMeasuredRawDeg = JSON.stringify(
                    zt.map((St) => {
                      let Rt = H([Number(St[0]), Number(St[1])]);
                      return [
                        Number(Rt[0].toFixed(5)),
                        Number(Rt[1].toFixed(5)),
                      ];
                    }),
                  )),
                  (Ft = !0));
              } catch {}
            Ft &&
              (z.statusReason +=
                "; gaze corrected via stimulus-time eye position (gaze-time position not logged)");
          }
        (L.repairStatus = "CORRECTED"),
          (L.repairStatusReason = z.statusReason),
          (L.nearestUsedXY = `${R[0].toFixed(1)}, ${R[1].toFixed(1)}`),
          (L.nearestCorrectXY = `${v[0].toFixed(1)}, ${v[1].toFixed(1)}`),
          (P[N] = z);
      });
      for (let I of P)
        I.status === "CORRECTED" ? T++ : I.status === "UNAFFECTED" ? U++ : D++;
      return {
        rows: P,
        summary: { total: P.length, corrected: T, unaffected: U, flagged: D },
      };
    },
    Xe = [
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
    pe = (t) => (/[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t),
    Ye = {
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
    qt = (t, m) => {
      if (m.summary.alreadyRepaired) return t;
      let { header: l, rows: s } = Mt(t),
        i = s.map((_) => [..._]),
        a = new Set();
      s.forEach((_, c) => {
        let b = m.rows[c].columns,
          n = [];
        for (let [f, d] of Object.entries(Ye)) {
          if (!(f in b)) continue;
          let w = l.indexOf(d);
          w >= 0 && ((i[c][w] = b[f]), a.add(f), n.includes(d) || n.push(d));
        }
        n.length && (b.repairImputedColumns = n.join("; "));
      });
      let o = Xe.filter(
          (_) => !a.has(_) && s.some((c, b) => _ in m.rows[b].columns),
        ),
        h = o.map((_) =>
          l.includes(_) ? `repair${_[0].toUpperCase()}${_.slice(1)}` : _,
        ),
        g = [
          [...l, ...h].join(","),
          ...i.map((_, c) =>
            [
              ..._.map(pe),
              ...h.map((b, n) => pe(m.rows[c].columns[o[n]] ?? "")),
            ].join(","),
          ),
        ];
      return (
        (t.charCodeAt(0) === 65279 ? "\uFEFF" : "") +
        g.join(`
`)
      );
    },
    me = (t) => t.sort((m, l) => m - l)[Math.floor(t.length / 2)],
    be = (t, m) => {
      if (m.summary.alreadyRepaired) return { correctedTrials: 0 };
      let { header: l, rows: s } = Mt(t),
        i = l.indexOf("targetEccentricityXDeg"),
        a = l.indexOf("targetEccentricityYDeg"),
        o = l.indexOf("level"),
        h = [],
        g = [],
        u = 0;
      s.forEach((c, b) => {
        let n = m.rows[b];
        if (n.status === "CORRECTED") {
          if ((u++, i >= 0 && n.actualTargetEccentricityXDeg !== void 0)) {
            let f = Math.hypot(Number(c[i]), Number(c[a])),
              d = Math.hypot(
                n.actualTargetEccentricityXDeg,
                n.actualTargetEccentricityYDeg ?? 0,
              );
            f > 0 && Number.isFinite(f) && h.push(((d - f) / f) * 100);
          }
          if (o >= 0 && n.actualLevelLog10Deg !== void 0) {
            let f = Math.pow(10, Number(c[o])),
              d = Math.pow(10, n.actualLevelLog10Deg);
            f > 0 && Number.isFinite(f) && g.push(((d - f) / f) * 100);
          }
        }
      });
      let _ = { correctedTrials: u };
      return (
        h.length &&
          (_.eccentricityErrPct = [me(h), Math.max(...h.map(Math.abs))]),
        g.length &&
          (_.sizeSpacingInflationPct = [me(g), Math.max(...g.map(Math.abs))]),
        _
      );
    };
  var ft = (t, m = 1) => (t == null || !Number.isFinite(t) ? "" : t.toFixed(m)),
    Zt = (t) => `${t >= 0 ? "+" : ""}${ft(t)}%`,
    ht = (t) =>
      String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    Et = (t, m, l) =>
      `<span class="pill ${t}"${l ? ` data-tip="${ht(l)}"` : ""}>${ht(
        m,
      )}</span>`,
    je = (t, m, l) => {
      let s = [],
        i = (a) => {
          let o = l.indexOf(a);
          return o >= 0 ? m[o] : "";
        };
      return (
        t.status === "CORRECTED" &&
          (t.nearestUsedXY &&
            t.nearestCorrectXY &&
            s.push(
              `eye used (${ft(t.nearestUsedXY[0], 0)}, ${ft(
                t.nearestUsedXY[1],
                0,
              )}) px; true (${ft(t.nearestCorrectXY[0], 0)}, ${ft(
                t.nearestCorrectXY[1],
                0,
              )}) px`,
            ),
          t.actualTargetEccentricityXDeg !== void 0 &&
            (s.push(
              `position asked (${i("targetEccentricityXDeg")}, ${i(
                "targetEccentricityYDeg",
              )})\xB0 \u2192 drew (${
                t.columns.drawnTargetXYPx
              }) px = truly (${ft(t.actualTargetEccentricityXDeg, 2)}, ${ft(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`,
            ),
            t.columns.correctedTargetXYPx &&
              s.push(
                `to place as asked: (${t.columns.correctedTargetXYPx}) px`,
              )),
          t.actualLevelLog10Deg !== void 0 &&
            s.push(
              `size/spacing asked ${ft(
                Math.pow(10, Number(i("level"))),
                2,
              )}\xB0 \u2192 showed ${ft(
                Math.pow(10, t.actualLevelLog10Deg),
                2,
              )}\xB0`,
            )),
        s.push(t.statusReason),
        s.join(`
`)
      );
    },
    We = {
      CORRECTED: ["corrected", "st-corrected"],
      UNAFFECTED: ["unaffected", "st-unaffected"],
      FLAGGED: ["flagged", "st-flagged"],
    },
    ye = {
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
    xe = (t) => {
      let m = new Set();
      for (let l of Object.keys(t.columns)) l in ye && m.add(ye[l]);
      return [...m];
    },
    Vt = (t, m) =>
      m === void 0 || m === ""
        ? `<span class="ov">${ht(t)}</span>`
        : `<span class="ov">${ht(
            t,
          )}</span><span class="arw">\u2192</span><span class="nv">${ht(
            m,
          )}</span>`,
    Ze = (t, m, l, s) => {
      let i = (x) => {
          let C = l.indexOf(x);
          return C >= 0 ? m[C] : "";
        },
        [a, o] = We[t.status],
        h = je(t, m, l),
        g =
          i("targetEccentricityXDeg") !== ""
            ? `(${i("targetEccentricityXDeg")}, ${i(
                "targetEccentricityYDeg",
              )})\xB0`
            : "",
        u =
          t.actualTargetEccentricityXDeg !== void 0
            ? `(${ft(t.actualTargetEccentricityXDeg, 2)}, ${ft(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`
            : void 0,
        _ =
          i("level") !== "" && Number.isFinite(Number(i("level")))
            ? ft(Number(i("level")), 3)
            : i("level"),
        c =
          t.actualLevelLog10Deg !== void 0
            ? ft(t.actualLevelLog10Deg, 3)
            : void 0,
        b = i("screenBoundingRectDeg"),
        n = t.columns.screenBoundingRectDegCorrected,
        f = xe(t)
          .map((x) => `<span class="pchip">${ht(x)}</span>`)
          .join(""),
        d =
          t.status === "FLAGGED" || t.status === "UNAFFECTED"
            ? `<td class="reason">${ht(t.statusReason)}</td>`
            : '<td class="reason"></td>',
        w = u !== void 0 || c !== void 0;
      return `<tr data-st="${t.status}" class="${
        w ? "r-diff" : ""
      }" data-tip="${ht(h)}">
    <td>${s + 1}</td>
    <td>${Et(o, a, h)}</td>
    <td class="${u !== void 0 ? "diff" : ""}">${Vt(g, u)}</td>
    <td class="${c !== void 0 ? "diff" : ""}">${Vt(_, c)}</td>
    <td class="rect ${n ? "diff" : ""}">${Vt(b, n)}</td>
    <td class="chipscell">${f}</td>
    ${d}
  </tr>`;
    },
    _e = (t, m, l) => {
      if (!t.length) return "";
      let s = 300,
        i = 220,
        a = 34,
        o = t.map((n) => n[0]),
        h = t.map((n) => n[1]),
        g = Math.max(...o, ...h) * 1.1 || 1,
        u = (n) => a + (n / g) * (s - a - 8),
        _ = (n) => i - a + 8 - (n / g) * (i - a - 8),
        c = t
          .map(
            (n) =>
              `<circle cx="${u(n[0]).toFixed(1)}" cy="${_(n[1]).toFixed(
                1,
              )}" r="3.5" fill="#b26a00" fill-opacity="0.85"><title>asked ${n[0].toFixed(
                2,
              )}\xB0, actually showed ${n[1].toFixed(2)}\xB0 (${Zt(
                ((n[1] - n[0]) / n[0]) * 100,
              )})</title></circle>`,
          )
          .join(""),
        b = [0, g / 2, g]
          .map(
            (n) =>
              `<line x1="${u(n)}" y1="${_(0)}" x2="${u(n)}" y2="${
                _(0) + 4
              }" stroke="#999"/><text x="${u(n)}" y="${
                _(0) + 15
              }" font-size="9" text-anchor="middle" fill="#666">${n.toFixed(
                1,
              )}</text><line x1="${u(0) - 4}" y1="${_(n)}" x2="${u(0)}" y2="${_(
                n,
              )}" stroke="#999"/><text x="${u(0) - 6}" y="${
                _(n) + 3
              }" font-size="9" text-anchor="end" fill="#666">${n.toFixed(
                1,
              )}</text>`,
          )
          .join("");
      return `<svg width="${s}" height="${i}" class="plot" role="img">
    <line x1="${u(0)}" y1="${_(0)}" x2="${u(g)}" y2="${_(
      g,
    )}" stroke="#2e7d32" stroke-dasharray="4 3"/>
    <text x="${u(g * 0.82)}" y="${
      _(g * 0.82) - 6
    }" font-size="9" fill="#2e7d32">no error</text>
    <line x1="${u(0)}" y1="${_(0)}" x2="${u(g)}" y2="${_(0)}" stroke="#bbb"/>
    <line x1="${u(0)}" y1="${_(0)}" x2="${u(0)}" y2="${_(g)}" stroke="#bbb"/>
    ${b}${c}
    <text x="${s / 2}" y="${
      i - 2
    }" font-size="10" text-anchor="middle" fill="#444">${ht(m)}</text>
    <text x="10" y="${
      i / 2
    }" font-size="10" text-anchor="middle" fill="#444" transform="rotate(-90 10 ${
      i / 2
    })">${ht(l)}</text>
  </svg>`;
    },
    ke = (t, m) => {
      let l = new Blob([m], { type: "text/csv" }),
        s = document.createElement("a");
      (s.href = URL.createObjectURL(l)),
        (s.download = t),
        s.click(),
        setTimeout(() => URL.revokeObjectURL(s.href), 5e3);
    },
    Ot = document.getElementById("results"),
    $t = document.createElement("div");
  $t.className = "rtip";
  document.body.appendChild($t);
  var Ee = (t) => {
    let l = $t.getBoundingClientRect(),
      s = t.clientX + 14,
      i = t.clientY - l.height / 2;
    s + l.width > innerWidth - 8 && (s = t.clientX - l.width - 14),
      (i = Math.min(Math.max(i, 8), innerHeight - l.height - 8)),
      ($t.style.left = s + "px"),
      ($t.style.top = i + "px");
  };
  document.body.addEventListener("mouseover", (t) => {
    let m = t.target.closest("[data-tip]");
    m &&
      (($t.innerHTML = ht(m.getAttribute("data-tip")).replace(/\n/g, "<br>")),
      ($t.style.display = "block"),
      Ee(t));
  });
  document.body.addEventListener("mousemove", (t) => {
    $t.style.display === "block" && Ee(t);
  });
  document.body.addEventListener("mouseout", (t) => {
    t.target.closest("[data-tip]") && ($t.style.display = "none");
  });
  var Ct = [],
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
    jt = (t, m) => {
      if (!tt.entries.has(t)) return tt.entries.set(t, m), t;
      let l = 2,
        s;
      do
        (s = /\.csv$/i.test(t)
          ? t.replace(/\.csv$/i, ` (${l}).csv`)
          : `${t} (${l})`),
          l++;
      while (tt.entries.has(s));
      return tt.entries.set(s, m), s;
    },
    Tt = () => {
      if (!tt.processed && !tt.errors && !tt.skippedNonCsv) return;
      let t = document.getElementById("batchbar");
      t.style.display = "flex";
      let m = [];
      tt.repaired &&
        m.push(
          `${tt.repaired} repaired \u2014 renamed with \u201C-repaired\u201D`,
        ),
        tt.clean && m.push(`${tt.clean} needed nothing`),
        tt.flaggedOnly && m.push(`${tt.flaggedOnly} flagged for review`),
        tt.already && m.push(`${tt.already} already repaired`),
        tt.errors && m.push(`${tt.errors} unreadable`);
      let l = tt.processed + tt.errors,
        s = `${l} file${l === 1 ? "" : "s"}`;
      document.getElementById("batchcounts").textContent = m.length
        ? `${s}: ${m.join(" \xB7 ")}${
            tt.skippedNonCsv
              ? ` \u2014 ${tt.skippedNonCsv} non-CSV skipped`
              : ""
          }`
        : `${s} \u2014 no repairs needed${
            tt.skippedNonCsv ? `, ${tt.skippedNonCsv} non-CSV skipped` : ""
          }`;
    },
    Ce = () =>
      `EasyEyes results repair report
` +
      new Date().toISOString() +
      `
${tt.processed} files assessed: ${tt.repaired} repaired (renamed "-repaired"), ${tt.clean} needed nothing, ${tt.flaggedOnly} flagged for review, ${tt.already} already repaired, ${tt.errors} unreadable` +
      (tt.skippedNonCsv ? `, ${tt.skippedNonCsv} non-CSV files skipped` : "") +
      `
Repaired files list what changed per row in the repairImputedColumns column.

` +
      Ct.join(`
`) +
      `
`,
    He = async (t) => {
      let m = [...tt.entries.keys()],
        l = new Set(m.map((u) => (u.includes("/") ? u.split("/")[0] : ""))),
        s = l.size === 1 && !l.has("") ? [...l][0] : "",
        i = [...new Set(tt.archiveStems)],
        o =
          i.length === 1 && i[0].endsWith(".results")
            ? `${i[0]
                .replace(/\.results$/i, "")
                .replace(/-repaired$/i, "")}-repaired.results.zip`
            : s
            ? s.endsWith(".results")
              ? `${s.slice(0, -8)}-repaired.results.zip`
              : `${s}-repaired.zip`
            : "easyeyes-results-repaired.zip",
        h = await t.generateAsync({ type: "blob", compression: "DEFLATE" }),
        g = document.createElement("a");
      (g.href = URL.createObjectURL(h)),
        (g.download = o),
        g.click(),
        setTimeout(() => URL.revokeObjectURL(g.href), 5e3);
    },
    ve =
      "These trials were not affected by the bug (e.g. eye at screen center, untracked session, or recorded outside the bug window).",
    we =
      "The tool cannot prove what was shown on these rows \u2014 nothing was changed; the report lists the reasons.",
    Ge =
      "This file already carries the repair audit columns \u2014 it was repaired before. It passes through unchanged; correcting twice is impossible.",
    De = async (t, m) => {
      let l = m || t.name,
        s;
      try {
        let r = await t.arrayBuffer();
        s = new TextDecoder("utf-8", { ignoreBOM: !0 }).decode(r);
      } catch {
        s = null;
      }
      let i = null,
        a = null;
      if (s !== null)
        try {
          i = ge(s);
        } catch (r) {
          a = r && r.message ? String(r.message) : null;
        }
      if (!i) {
        tt.errors++,
          s !== null && jt(l, s),
          Ot.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Et(
              "st-flagged",
              "could not parse",
              a || "The file is not a readable results CSV.",
            )}</div>`,
          ),
          Ct.push(`${l}: ERROR ${a || "could not parse"}`),
          Tt();
        return;
      }
      if (i.summary.alreadyRepaired) {
        tt.already++,
          jt(l, s),
          Ot.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Et(
              "st-done",
              "already repaired",
              Ge,
            )}</div>`,
          ),
          Ct.push(`${l}: already repaired \u2014 unchanged`),
          tt.processed++,
          Tt();
        return;
      }
      let o = i.summary;
      if (o.corrected === 0) {
        jt(l, s);
        let r = {};
        i.rows.forEach((B) => {
          B.status === "FLAGGED" &&
            (r[B.statusReason] = (r[B.statusReason] || 0) + 1);
        });
        let A = Object.entries(r)
            .sort((B, J) => J[1] - B[1])
            .map(([B, J]) => `${J}\xD7 ${B}`).join(`
`),
          q = [
            o.unaffected
              ? Et("st-unaffected", `${o.unaffected} unaffected`, ve)
              : "",
            o.flagged ? Et("st-flagged", `${o.flagged} flagged`, A || we) : "",
          ].join("");
        Ot.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${ht(l)}</span>${q}</div>`,
        ),
          Ct.push(
            `${l}: no corrections \u2014 ${o.unaffected} unaffected / ${o.flagged} flagged (${o.total} rows); file unchanged`,
          ),
          Object.entries(r).forEach(([B, J]) => Ct.push(`  FLAG ${J}x: ${B}`)),
          tt[o.flagged ? "flaggedOnly" : "clean"]++,
          tt.processed++,
          Tt();
        return;
      }
      let { header: h, rows: g } = Mt(s),
        u = be(s, i),
        _ = [
          Et(
            "st-corrected",
            `${o.corrected} corrected`,
            "These trials were recorded with the warped conversion. The repaired CSV replaces the requested values with what was truly shown.",
          ),
          o.unaffected
            ? Et("st-unaffected", `${o.unaffected} unaffected`, ve)
            : "",
          o.flagged ? Et("st-flagged", `${o.flagged} flagged`, we) : "",
        ].join(" "),
        c = "";
      if (u.correctedTrials > 0) {
        let r = [];
        u.eccentricityErrPct &&
          r.push(
            `position off by median ${ft(
              Math.abs(u.eccentricityErrPct[0]),
            )}% (max ${ft(u.eccentricityErrPct[1])}%)`,
          ),
          u.sizeSpacingInflationPct &&
            r.push(
              `size/spacing off by median ${ft(
                Math.abs(u.sizeSpacingInflationPct[0]),
              )}% (max ${ft(u.sizeSpacingInflationPct[1])}%)`,
            ),
          (c = `<div class="wrong st-corrected-bg">On the ${
            u.correctedTrials
          } corrected trial${
            u.correctedTrials > 1 ? "s" : ""
          }, what was shown differed from what was requested: ${r.join(
            "; ",
          )}.</div>`);
      }
      let b = 400,
        n = o.corrected + o.flagged,
        f = n > 0 && n < o.total,
        d = i.rows
          .map((r, A) => Ze(r, g[A], h, A))
          .map((r) =>
            f && r.includes('data-st="UNAFFECTED"')
              ? r.replace("<tr ", '<tr class="r-hidden" ')
              : r,
          )
          .slice(0, b)
          .join(""),
        w = new Map();
      i.rows.forEach((r) => {
        if (r.status === "CORRECTED")
          for (let A of xe(r)) w.set(A, (w.get(A) || 0) + 1);
      });
      let x = w.size
          ? `<div class="pstrip"><b>Corrected parameters:</b> ${[...w]
              .map(
                ([r, A]) =>
                  `<span class="pchip big">${ht(r)} <b>\xD7${A}</b></span>`,
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
        <th title="requested (muted) \u2192 actually shown (green), in degrees">target position</th>
        <th title="requested (muted) \u2192 actually shown (green), log10 degrees">level</th>
        <th title="as logged (muted) \u2192 corrected (green), degrees">bounding rect</th>
        <th title="parameters this row carries corrections for">corrected</th>
        <th>reason</th></tr></thead>
      <tbody>${d}</tbody></table>
      ${o.total > b ? `<div class="note">Showing first ${b} rows.</div>` : ""}
      </div>`,
        k = h.indexOf("targetEccentricityXDeg"),
        P = h.indexOf("targetEccentricityYDeg"),
        T = h.indexOf("level"),
        U = [],
        D = [];
      i.rows.forEach((r, A) => {
        if (r.status === "CORRECTED") {
          if (k >= 0 && r.actualTargetEccentricityXDeg !== void 0) {
            let q = Math.hypot(Number(g[A][k]), Number(g[A][P])),
              B = Math.hypot(
                r.actualTargetEccentricityXDeg,
                r.actualTargetEccentricityYDeg ?? 0,
              );
            q > 0 && Number.isFinite(q) && U.push([q, B]);
          }
          if (T >= 0 && r.actualLevelLog10Deg !== void 0) {
            let q = Math.pow(10, Number(g[A][T]));
            q > 0 &&
              Number.isFinite(q) &&
              D.push([q, Math.pow(10, r.actualLevelLog10Deg)]);
          }
        }
      });
      let I =
          U.length || D.length
            ? `<div class="plots">${_e(
                U,
                "requested eccentricity (\xB0)",
                "actual (\xB0)",
              )}${_e(
                D,
                "requested size/spacing (\xB0)",
                "actual (\xB0)",
              )}</div>`
            : "",
        N = Yt(t.name),
        y = document.createElement("div");
      (y.className = "card"),
        (y.innerHTML = `
      <div class="fhead"><span class="fname">${ht(
        l,
      )} <span class="mark">\u2192 repaired as <b>${ht(N)}</b></span></span>
        <button class="dl" title="Requested values in the original columns are replaced with what was actually shown; the repairImputedColumns column lists the altered cells; the file is marked "-repaired"; your source file is untouched">\u2B07 repaired CSV</button></div>
      <div class="chips">${_}</div>
      ${c}
      ${x}
      ${I}
      ${C}`),
        y.querySelector(".dl").addEventListener("click", () => ke(N, qt(s, i))),
        y.querySelector(".rowtoggle input").addEventListener("change", (r) => {
          y.querySelectorAll("tr[data-st]").forEach((A) => {
            A.getAttribute("data-st") === "UNAFFECTED" &&
              A.classList.toggle("r-hidden", r.target.checked);
          });
        }),
        Ot.appendChild(y),
        tt.repaired++,
        jt(Yt(l), qt(s, i)),
        Ct.push(
          `${l}: ${o.corrected} corrected / ${o.unaffected} unaffected / ${
            o.flagged
          } flagged (${o.total} rows) \u2014 fixed -> ${Yt(l)}`,
        ),
        c &&
          Ct.push(
            `  shown-vs-requested: ${
              u.eccentricityErrPct
                ? `position median ${ft(
                    Math.abs(u.eccentricityErrPct[0]),
                  )}% max ${ft(u.eccentricityErrPct[1])}%; `
                : ""
            }${
              u.sizeSpacingInflationPct
                ? `size/spacing median ${ft(
                    Math.abs(u.sizeSpacingInflationPct[0]),
                  )}% max ${ft(u.sizeSpacingInflationPct[1])}%`
                : ""
            }`,
          );
      let S = {};
      i.rows.forEach((r) => {
        r.status === "FLAGGED" &&
          (S[r.statusReason] = (S[r.statusReason] || 0) + 1);
      }),
        Object.entries(S).forEach(([r, A]) => Ct.push(`  FLAG ${A}x: ${r}`)),
        tt.processed++,
        Tt();
    },
    qe = async (t) => {
      let m = [],
        l = t.items
          ? [...t.items]
              .map((i) => (i.webkitGetAsEntry ? i.webkitGetAsEntry() : null))
              .filter(Boolean)
          : [];
      if (!l.length)
        return [...t.files].map((i) => ({ file: i, relPath: i.name }));
      let s = async (i, a) => {
        if (i.isFile) {
          let o = await new Promise((h, g) => i.file(h, g));
          m.push({ file: o, relPath: a + i.name });
        } else if (i.isDirectory) {
          let o = i.createReader(),
            h = await new Promise((g, u) => o.readEntries(g, u));
          for (; h.length; ) {
            for (let g of h) await s(g, a + i.name + "/");
            h = await new Promise((g, u) => o.readEntries(g, u));
          }
        }
      };
      for (let i of l) await s(i, "");
      return m;
    },
    Ve = async (t, m) => {
      let l = m || t.name,
        s = null;
      try {
        s = await Kt.default.loadAsync(await t.arrayBuffer());
      } catch {
        s = null;
      }
      if (!s) {
        tt.errors++,
          Ot.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${ht(l)}</span>${Et(
              "st-flagged",
              "could not unzip",
              "The archive is corrupt, encrypted, or not a ZIP file \u2014 it is included unchanged.",
            )}</div>`,
          ),
          Ct.push(`${l}: ERROR could not unzip`),
          Tt();
        return;
      }
      let i = Object.values(s.files).filter((u) => !u.dir),
        a = (u) => u.split("/").pop(),
        o = (u) =>
          /^__MACOSX\//i.test(u) ||
          /^\./.test(a(u)) ||
          u === "REPAIR-REPORT.txt",
        h = (u) => /\.csv$/i.test(a(u)) && !o(u),
        g = i.filter((u) => h(u.name));
      if (
        (i.forEach((u) => {
          !h(u.name) && !o(u.name) && tt.skippedNonCsv++;
        }),
        !g.length)
      ) {
        Ot.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${ht(l)}</span>${Et(
            "st-flagged",
            "no data files",
            "No .csv results files inside this archive.",
          )}</div>`,
        ),
          Ct.push(`${l}: no CSV files inside \u2014 unchanged`),
          Tt();
        return;
      }
      tt.archiveStems.push(
        l
          .replace(/\.zip$/i, "")
          .split("/")
          .pop(),
      );
      for (let u of g) {
        let _ = a(u.name);
        await De(
          { name: _, arrayBuffer: () => u.async("arraybuffer") },
          u.name,
        );
      }
    },
    Jt = async (t) => {
      for (let { file: m, relPath: l } of t) {
        let s = (l || m.name).split("/").pop();
        if (/\.zip$/i.test(s)) {
          await Ve(m, l);
          continue;
        }
        if (!/\.csv$/i.test(s) || /^\./.test(s)) {
          tt.skippedNonCsv++, Tt();
          continue;
        }
        await De(m, l);
      }
    },
    At = document.getElementById("drop"),
    Lt = document.getElementById("file"),
    Wt = document.getElementById("folder");
  At.addEventListener("click", (t) => {
    t.target.closest("button, input") || Lt.click();
  });
  At.addEventListener("keydown", (t) => {
    t.target.closest(".linkbtn") ||
      ((t.key === "Enter" || t.key === " ") &&
        (t.preventDefault(), Lt.click()));
  });
  document.getElementById("pickFiles").addEventListener("click", (t) => {
    t.stopPropagation(), Lt.click();
  });
  document.getElementById("pickFolder").addEventListener("click", (t) => {
    t.stopPropagation(), Wt.click();
  });
  At.addEventListener("dragover", (t) => {
    t.preventDefault(), At.classList.add("over");
  });
  At.addEventListener("dragleave", () => At.classList.remove("over"));
  At.addEventListener("drop", async (t) => {
    t.preventDefault(),
      At.classList.remove("over"),
      Jt(await qe(t.dataTransfer));
  });
  Lt.addEventListener("change", () => {
    Jt([...Lt.files].map((t) => ({ file: t, relPath: t.name }))),
      (Lt.value = "");
  });
  Wt.addEventListener("change", () => {
    Jt(
      [...Wt.files].map((t) => ({
        file: t,
        relPath: t.webkitRelativePath || t.name,
      })),
    ),
      (Wt.value = "");
  });
  document
    .getElementById("reportBtn")
    .addEventListener("click", () => ke("repair-report.txt", Ce()));
  document.getElementById("zipBtn").addEventListener("click", async () => {
    let t = new Kt.default();
    for (let [m, l] of tt.entries) t.file(m, l);
    t.file("REPAIR-REPORT.txt", Ce()), await He(t);
  });
  var Bt = null,
    Ke = () => {
      let t = document.getElementById("xp-char").value || "E",
        m = document.createElement("canvas").getContext("2d");
      m.font = "700 100px Arial, sans-serif";
      let l = m.measureText(t[0]),
        s =
          l.actualBoundingBoxAscent && l.actualBoundingBoxDescent !== void 0
            ? l.actualBoundingBoxAscent + l.actualBoundingBoxDescent
            : 72;
      Bt = { ch: t[0], capH: s, width: l.width || 60 };
    };
  var ze = "placement",
    _t = {};
  ["preset", "w", "h", "ppc", "dist", "ex", "ey", "grid", "ref"].forEach(
    (t) => (_t[t] = document.getElementById("xp-" + t)),
  );
  var Qt = () => {
      let t = Number(_t.w.value),
        m = Number(_t.h.value),
        l = Number(_t.ppc.value);
      return (
        _t.preset.value !== "custom" &&
          ([t, m, l] = _t.preset.value.split(",").map(Number)),
        (l = Math.max(1, l)),
        _t.preset.value === "custom" &&
          Number(_t.ppc.value) !== l &&
          (_t.ppc.value = l),
        {
          w: t,
          h: m,
          ppc: l,
          dist: Number(_t.dist.value),
          eyeXPx: Number(_t.ex.value) * l,
          eyeYPx: Number(_t.ey.value) * l,
          showGrid: _t.grid.checked,
          showRef: _t.ref.checked,
          mode: ze,
          sizeDeg: Number(document.getElementById("xp-size").value),
          sizeDim: document.getElementById("xp-sizedim").value,
        }
      );
    },
    Je = (t) => {
      let m = Math.max(-1, Math.min(1, (t - 1) / 0.2)),
        l = (i, a, o) => Math.round(i + (a - i) * o);
      if (m >= 0) {
        let i = m;
        return `rgb(${l(250, 212, i)},${l(250, 78, i)},${l(250, 0, i)})`;
      }
      let s = -m;
      return `rgb(${l(250, 26, s)},${l(250, 90, s)},${l(250, 200, s)})`;
    },
    te = () => {
      let t = Qt();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      (document.getElementById("xp-dist-v").textContent = t.dist),
        (document.getElementById("xp-ex-v").textContent = (
          t.eyeXPx / t.ppc
        ).toFixed(1)),
        (document.getElementById("xp-ey-v").textContent = (
          t.eyeYPx / t.ppc
        ).toFixed(1)),
        document
          .getElementById("explore")
          .classList.toggle("showCustom", _t.preset.value === "custom");
      let m = [t.eyeXPx, t.eyeYPx],
        l = [t.eyeXPx + t.w / 2, t.h / 2 - t.eyeYPx],
        s = { pxPerCm: t.ppc, viewingDistanceCm: t.dist, fixationXYPx: [0, 0] },
        i = { ...s, nearestPointXYZPx: m },
        a = { ...s, nearestPointXYZPx: l },
        o = 640,
        h = Math.round((o * t.h) / t.w),
        g = (D) => ((D + t.w / 2) / t.w) * o,
        u = (D) => ((t.h / 2 - D) / t.h) * h,
        _ = 52,
        c = 32,
        b = o / _,
        n = h / c,
        f = [];
      for (let D = 0; D < c; D++)
        for (let I = 0; I < _; I++) {
          let N = -t.w / 2 + ((I + 0.5) / _) * t.w,
            y = t.h / 2 - ((D + 0.5) / c) * t.h,
            S = bt([N, y], i),
            r = Math.hypot(S[0], S[1]);
          if (r < 0.5) continue;
          let A;
          if (t.mode === "size") {
            let q = t.sizeDim === "h" ? [0, 1] : [1, 0],
              B = mt(S, a),
              J = mt([S[0] + q[0] * t.sizeDeg, S[1] + q[1] * t.sizeDeg], a),
              X = bt(B, i),
              K = bt(J, i);
            A = Math.hypot(K[0] - X[0], K[1] - X[1]) / t.sizeDeg;
          } else {
            let q = mt(S, a),
              B = bt(q, i);
            A = Math.hypot(B[0], B[1]) / r;
          }
          f.push(
            `<rect x="${(I * b).toFixed(1)}" y="${(D * n).toFixed(
              1,
            )}" width="${(b + 0.5).toFixed(1)}" height="${(n + 0.5).toFixed(
              1,
            )}" fill="${Je(A)}"/>`,
          );
        }
      let d = 5,
        w = (D, I) => {
          let N = [],
            S = (r, A) => {
              let q = "",
                B = null,
                J = Math.max(t.w, t.h) * 4,
                X = Math.max(t.w, t.h) * 3;
              for (let K = -80; K <= 80; K += 1) {
                let $ = mt(r ? [A, K] : [K, A], D);
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
                (q += `${q && !V ? "L" : "M"}${g($[0]).toFixed(1)},${u(
                  $[1],
                ).toFixed(1)}`),
                  (B = $);
              }
              q && N.push(`<path d="${q}" fill="none" ${I}/>`);
            };
          for (let r = -80; r <= 80; r += d) S(!0, r), S(!1, r);
          return N.join("");
        },
        x = "";
      if (t.showRef) {
        x += w(
          i,
          'stroke="#2e7d32" stroke-opacity="0.6" stroke-width="0.8" stroke-dasharray="5 4"',
        );
        let D = [];
        for (let I = -80; I <= 80; I += d) {
          if (I === 0) continue;
          let N = mt([I, 0], i);
          Number.isFinite(N[0]) &&
            N[0] > -t.w / 2 + 8 &&
            N[0] < t.w / 2 - 8 &&
            D.push(
              `<text x="${g(N[0]).toFixed(
                1,
              )}" y="11" font-size="9" fill="#1e6b2f" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${I}\xB0</text>`,
            );
          let y = mt([0, I], i);
          Number.isFinite(y[1]) &&
            y[1] > -t.h / 2 + 8 &&
            y[1] < t.h / 2 - 8 &&
            D.push(
              `<text x="4" y="${(u(y[1]) + 3).toFixed(
                1,
              )}" font-size="9" fill="#1e6b2f" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${I}\xB0</text>`,
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
          ? '<span class="sw" style="background:#1a5ac8"></span> shown smaller than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown larger than requested'
          : '<span class="sw" style="background:#1a5ac8"></span> shown closer than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown farther than requested';
      let k = `<svg id="xp-svg" viewBox="0 0 ${o} ${h}" width="${o}" height="${h}">
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
            S = bt([N, y], i),
            r = Math.hypot(S[0], S[1]),
            A;
          if (t.mode === "size") {
            let V = t.sizeDim === "h" ? [0, 1] : [1, 0],
              G = mt(S, a),
              j = mt([S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg], a),
              st = bt(G, i),
              dt = bt(j, i),
              et = Math.hypot(dt[0] - st[0], dt[1] - st[1]);
            (A = `<b>${Zt(
              ((et - t.sizeDeg) / t.sizeDeg) * 100,
            )}</b> size error`),
              Bt || Ke();
            let nt = mt(S, i),
              rt = G,
              ct = (R, v) => {
                let p = mt(
                  [S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg],
                  v,
                );
                return Math.hypot(p[0] - R[0], p[1] - R[1]);
              },
              pt = ct(nt, i),
              gt = ct(rt, a),
              e = t.sizeDim === "h" ? Bt.capH : Bt.width,
              O = (R, v, p, E) =>
                `<text x="${g(R[0]).toFixed(1)}" y="${u(R[1]).toFixed(
                  1,
                )}" font-family="Arial, sans-serif" font-weight="700" font-size="${(
                  (v / e) *
                  100
                ).toFixed(
                  1,
                )}" fill="${p}" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${ht(
                  Bt.ch,
                )}</text><text x="${g(R[0]).toFixed(1)}" y="${(
                  u(R[1]) +
                  ((v / e) * 100) / 2 +
                  12
                ).toFixed(
                  1,
                )}" font-size="10" fill="${p}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${E}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              O(nt, pt, "#2e7d32", `requested ${t.sizeDeg}\xB0`) +
              O(rt, gt, "#16344d", `actual ${et.toFixed(2)}\xB0`);
          } else {
            let V = mt(S, a),
              G = bt(V, i),
              j = Math.hypot(G[0], G[1]);
            A = `<b>${
              r > 0.1 ? Zt(((j - r) / r) * 100) : "\u2014"
            }</b> eccentricity error`;
            let st = mt(S, i),
              dt = (et, nt, rt, ct) =>
                `<text x="${g(et[0]).toFixed(1)}" y="${(
                  u(et[1]) + (ct ? -12 : 20)
                ).toFixed(
                  1,
                )}" font-size="10" fill="${nt}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${rt}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              `<line x1="${g(st[0]).toFixed(1)}" y1="${u(st[1]).toFixed(
                1,
              )}" x2="${g(V[0]).toFixed(1)}" y2="${u(V[1]).toFixed(
                1,
              )}" stroke="#555" stroke-width="1" stroke-opacity="0.6"/><circle cx="${g(
                st[0],
              ).toFixed(1)}" cy="${u(st[1]).toFixed(
                1,
              )}" r="7" fill="#2e7d32" fill-opacity="0.55"/><circle cx="${g(
                V[0],
              ).toFixed(1)}" cy="${u(V[1]).toFixed(
                1,
              )}" r="7" fill="#16344d" fill-opacity="0.55"/>` +
              dt(
                st,
                "#2e7d32",
                `requested (${S[0].toFixed(1)}, ${S[1].toFixed(
                  1,
                )})\xB0 \xB7 ${r.toFixed(2)}\xB0`,
                !0,
              ) +
              dt(
                V,
                "#16344d",
                `actual (${G[0].toFixed(1)}, ${G[1].toFixed(
                  1,
                )})\xB0 \xB7 ${j.toFixed(2)}\xB0`,
                !1,
              );
          }
          (U.innerHTML = A), (U.style.display = "block");
          let q = P.getBoundingClientRect();
          (U.style.left = "0px"), (U.style.top = "0px");
          let B = U.offsetWidth,
            J = U.offsetHeight,
            X = D.clientX - q.left,
            K = D.clientY - q.top,
            F = X + 16;
          F + B > q.width - 4 && (F = X - B - 16);
          let $ = Math.min(Math.max(K - J / 2, 2), q.height - J - 2);
          U.style.transform = `translate(${F}px, ${$}px)`;
        }),
        T.addEventListener("mouseleave", () => {
          (U.style.display = "none"),
            (T.querySelector("#xp-glyphs").innerHTML = "");
        });
    },
    Qe = () => {
      let t = Qt();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      let m = t.w,
        l = t.h,
        s = t.ppc,
        i = t.dist,
        a = [t.eyeXPx, t.eyeYPx],
        o = [a[0] + m / 2, l / 2 - a[1]],
        h = (c) => `<span class="st" data-tip="${ht(c)}">`,
        g = "</span>",
        u = `
    <div class="fx"><span class="lbl">pixels &rarr; angle (radial):</span>
      ${h(
        "R: radial projection of a screen-space px offset to the visual angle it subtends at the eye",
      )}<i><b>R</b>(<b>u</b>)</i>${g} = <span class="frac"><span class="num">180</span><span class="den">&pi;</span></span> atan<span class="frac"><span class="num">&Vert;<b>u</b>&Vert;</span><span class="den">${h(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${g}</span></span> &middot; <span class="frac"><span class="num"><b>u</b></span><span class="den">&Vert;<b>u</b>&Vert;</span></span>
    </div>
    <div class="fx"><span class="lbl">angle &rarr; pixels (its inverse):</span>
      ${h(
        "R\u207B\xB9: places a point that subtends a given angle \u2014 this is what draws a stimulus",
      )}<i><b>R</b><sup>&minus;1</sup>(<b>v</b>)</i>${g} = ${h(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${g} tan<span class="frac"><span class="num">&pi;&Vert;<b>v</b>&Vert;</span><span class="den">180</span></span> &middot; <span class="frac"><span class="num"><b>v</b></span><span class="den">&Vert;<b>v</b>&Vert;</span></span>
    </div>
    <div class="fx fxline-bug"><span class="lbl">drawn on screen (buggy eye):</span>
      <b class="v">p</b> = ${h(
        "n_bug: the assumed nearest point",
      )}<b class="v">n<sub>bug</sub></b>${g} + <i><b>R</b><sup>&minus;1</sup></i>(&theta; &minus; <i><b>R</b></i>(<b class="v">n<sub>bug</sub></b>))
    </div>
    <div class="fx fxline-act"><span class="lbl">what you actually saw (true eye):</span>
      <b class="v">a</b> = <i><b>R</b></i>(<b class="v">p</b> &minus; ${h(
        "n: the true nearest point",
      )}<b class="v">n</b>${g}) + <i><b>R</b></i>(<b class="v">n</b>)
    </div>
    <div class="fx"><span class="lbl">the bug, in full ${h(
      "The webcam tracker's top-left-origin coordinates were used verbatim in the center-origin frame.",
    )}(raw rc, unconverted)${g}:</span>
      <b class="v">n<sub>bug</sub></b> = ( n<sub>x</sub> + W/2 , &nbsp;H/2 &minus; n<sub>y</sub> )
    </div>
    <div class="fxvals">s ${s} px/cm&nbsp;|&nbsp;d ${i} cm&nbsp;|&nbsp;n (${
      a[0]
    }, ${a[1]}) px&nbsp;|&nbsp;n<sub>bug</sub> (${o[0]}, ${o[1]}) px</div>`,
        _ = document.getElementById("xp-formulas");
      _ && (_.innerHTML = `<div class="formulas">${u}</div>`);
    },
    Se = () => {
      let t = document.getElementById("xp-diagram");
      if (!t) return;
      let m = Qt();
      if (!(m.w > 0 && m.h > 0 && m.ppc > 0 && m.dist > 0)) return;
      let l = document.getElementById("xp-req"),
        s = Number(l.value);
      document.getElementById("xp-req-v").textContent = s;
      let i = [m.eyeXPx, m.eyeYPx],
        a = [m.eyeXPx + m.w / 2, m.h / 2 - m.eyeYPx],
        o = { pxPerCm: m.ppc, viewingDistanceCm: m.dist, fixationXYPx: [0, 0] },
        h = mt([s, 0], { ...o, nearestPointXYZPx: a }),
        g = bt(h, { ...o, nearestPointXYZPx: i }),
        u = m.w / m.ppc,
        _ = m.eyeXPx / m.ppc,
        c = _ + u / 2,
        b = h[0] / m.ppc,
        n = m.dist,
        f = 30,
        d = Math.min(-u / 2, _, b) - 6,
        w = Math.max(u / 2, c, b) + 6,
        x = 352,
        C = Math.min((x - 2 * f) / (w - d), 350 / (n + 6)),
        k = x,
        P = (d + w) / 2,
        T = (k - 2 * f) / C,
        U = P - T / 2,
        D = (K) => f + (K - U) * C,
        I = Math.round(70 + (n + 6) * C),
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
        r = [
          `<line x1="${D(c)}" y1="${N(n)}" x2="${D(b)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="2"/>`,
          `<line x1="${D(c)}" y1="${N(n)}" x2="${D(0)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="1" stroke-dasharray="4 3"/>`,
          `<line x1="${D(_)}" y1="${N(n)}" x2="${D(b)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="2"/>`,
          `<line x1="${D(_)}" y1="${N(n)}" x2="${D(0)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="1" stroke-dasharray="4 3"/>`,
        ].join(""),
        A = `
    <circle cx="${D(c)}" cy="${N(n)}" r="5" fill="#b26a00"/>
    <text x="${D(c)}" y="${
      N(n) + 18
    }" font-size="10" fill="#b26a00" text-anchor="middle">eye as the bug assumed</text>
    <circle cx="${D(_)}" cy="${N(n)}" r="5" fill="#2b6cb0"/>
    <text x="${D(_)}" y="${
      N(n) - 10
    }" font-size="10" fill="#2b6cb0" text-anchor="middle">your actual eye</text>`,
        q = [(c + b) / 2, n / 2],
        B = [(_ + b) / 2, n / 2],
        J = s !== 0 ? ((Math.abs(g[0]) - Math.abs(s)) / Math.abs(s)) * 100 : 0,
        X = `<circle cx="${D(b)}" cy="${N(0)}" r="4.5" fill="#b3261e"/>
    <text x="${D(b) - 6}" y="${
      N(0) - 8
    }" font-size="10" fill="#b3261e" text-anchor="end">drawn ${b.toFixed(
      1,
    )} cm</text>
    <text x="${D(q[0]) + 8}" y="${
      N(q[1]) + 4
    }" font-size="10" fill="#b26a00">requested ${s}\xB0</text>
    <text x="${D(B[0]) - 8}" y="${
      N(B[1]) - 6
    }" font-size="10" fill="#2b6cb0">actual ${g[0].toFixed(2)}\xB0${
      s ? ` (${Zt(J)})` : ""
    }</text>`;
      t.innerHTML = `<svg viewBox="0 0 ${k} ${I}" width="${k}" height="${I}">${y}${S}${r}${A}${X}</svg>`;
    },
    ee = () => {
      Se(), te(), Qe();
    };
  ["preset", "w", "h", "ppc", "grid", "ref"].forEach((t) =>
    _t[t].addEventListener("change", ee),
  );
  ["dist", "ex", "ey"].forEach((t) => _t[t].addEventListener("input", ee));
  document.getElementById("xp-req").addEventListener("input", Se);
  document.getElementById("xp-char").addEventListener("input", () => {
    Bt = null;
  });
  ["size", "sizedim"].forEach((t) =>
    document.getElementById("xp-" + t).addEventListener("input", () => {
      (document.getElementById("xp-size-v").textContent =
        document.getElementById("xp-size").value),
        te();
    }),
  );
  var $e = (t) => {
    (ze = t),
      document
        .getElementById("xp-mode-pos")
        .classList.toggle("on", t === "placement"),
      document
        .getElementById("xp-mode-size")
        .classList.toggle("on", t === "size"),
      document
        .getElementById("xp-sizeopts")
        .classList.toggle("show", t === "size"),
      te();
  };
  document
    .getElementById("xp-mode-pos")
    .addEventListener("click", () => $e("placement"));
  document
    .getElementById("xp-mode-size")
    .addEventListener("click", () => $e("size"));
  ee();
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
