"use strict";
(() => {
  var $e = Object.create;
  var ee = Object.defineProperty;
  var Re = Object.getOwnPropertyDescriptor;
  var Fe = Object.getOwnPropertyNames;
  var Ae = Object.getPrototypeOf,
    Pe = Object.prototype.hasOwnProperty;
  var Bt = ((t) =>
    typeof require < "u"
      ? require
      : typeof Proxy < "u"
      ? new Proxy(t, { get: (g, l) => (typeof require < "u" ? require : g)[l] })
      : t)(function (t) {
    if (typeof require < "u") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + t + '" is not supported');
  });
  var Te = (t, g) => () => (
    g || t((g = { exports: {} }).exports, g), g.exports
  );
  var Ie = (t, g, l, a) => {
    if ((g && typeof g == "object") || typeof g == "function")
      for (let s of Fe(g))
        !Pe.call(t, s) &&
          s !== l &&
          ee(t, s, {
            get: () => g[s],
            enumerable: !(a = Re(g, s)) || a.enumerable,
          });
    return t;
  };
  var Oe = (t, g, l) => (
    (l = t != null ? $e(Ae(t)) : {}),
    Ie(
      g || !t || !t.__esModule
        ? ee(l, "default", { value: t, enumerable: !0 })
        : l,
      t,
    )
  );
  var ne = Te((re, Ht) => {
    (function (t) {
      typeof re == "object" && typeof Ht < "u"
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
      return (function t(g, l, a) {
        function s(p, y) {
          if (!l[p]) {
            if (!g[p]) {
              var f = typeof Bt == "function" && Bt;
              if (!y && f) return f(p, !0);
              if (i) return i(p, !0);
              var _ = new Error("Cannot find module '" + p + "'");
              throw ((_.code = "MODULE_NOT_FOUND"), _);
            }
            var c = (l[p] = { exports: {} });
            g[p][0].call(
              c.exports,
              function (m) {
                var n = g[p][1][m];
                return s(n || m);
              },
              c,
              c.exports,
              t,
              g,
              l,
              a,
            );
          }
          return l[p].exports;
        }
        for (var i = typeof Bt == "function" && Bt, o = 0; o < a.length; o++)
          s(a[o]);
        return s;
      })(
        {
          1: [
            function (t, g, l) {
              "use strict";
              var a = t("./utils"),
                s = t("./support"),
                i =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
              (l.encode = function (o) {
                for (
                  var p,
                    y,
                    f,
                    _,
                    c,
                    m,
                    n,
                    d = [],
                    u = 0,
                    w = o.length,
                    x = w,
                    D = a.getTypeOf(o) !== "string";
                  u < o.length;

                )
                  (x = w - u),
                    (f = D
                      ? ((p = o[u++]),
                        (y = u < w ? o[u++] : 0),
                        u < w ? o[u++] : 0)
                      : ((p = o.charCodeAt(u++)),
                        (y = u < w ? o.charCodeAt(u++) : 0),
                        u < w ? o.charCodeAt(u++) : 0)),
                    (_ = p >> 2),
                    (c = ((3 & p) << 4) | (y >> 4)),
                    (m = 1 < x ? ((15 & y) << 2) | (f >> 6) : 64),
                    (n = 2 < x ? 63 & f : 64),
                    d.push(
                      i.charAt(_) + i.charAt(c) + i.charAt(m) + i.charAt(n),
                    );
                return d.join("");
              }),
                (l.decode = function (o) {
                  var p,
                    y,
                    f,
                    _,
                    c,
                    m,
                    n = 0,
                    d = 0,
                    u = "data:";
                  if (o.substr(0, u.length) === u)
                    throw new Error(
                      "Invalid base64 input, it looks like a data url.",
                    );
                  var w,
                    x =
                      (3 * (o = o.replace(/[^A-Za-z0-9+/=]/g, "")).length) / 4;
                  if (
                    (o.charAt(o.length - 1) === i.charAt(64) && x--,
                    o.charAt(o.length - 2) === i.charAt(64) && x--,
                    x % 1 != 0)
                  )
                    throw new Error(
                      "Invalid base64 input, bad content length.",
                    );
                  for (
                    w = s.uint8array ? new Uint8Array(0 | x) : new Array(0 | x);
                    n < o.length;

                  )
                    (p =
                      (i.indexOf(o.charAt(n++)) << 2) |
                      ((_ = i.indexOf(o.charAt(n++))) >> 4)),
                      (y =
                        ((15 & _) << 4) |
                        ((c = i.indexOf(o.charAt(n++))) >> 2)),
                      (f = ((3 & c) << 6) | (m = i.indexOf(o.charAt(n++)))),
                      (w[d++] = p),
                      c !== 64 && (w[d++] = y),
                      m !== 64 && (w[d++] = f);
                  return w;
                });
            },
            { "./support": 30, "./utils": 32 },
          ],
          2: [
            function (t, g, l) {
              "use strict";
              var a = t("./external"),
                s = t("./stream/DataWorker"),
                i = t("./stream/Crc32Probe"),
                o = t("./stream/DataLengthProbe");
              function p(y, f, _, c, m) {
                (this.compressedSize = y),
                  (this.uncompressedSize = f),
                  (this.crc32 = _),
                  (this.compression = c),
                  (this.compressedContent = m);
              }
              (p.prototype = {
                getContentWorker: function () {
                  var y = new s(a.Promise.resolve(this.compressedContent))
                      .pipe(this.compression.uncompressWorker())
                      .pipe(new o("data_length")),
                    f = this;
                  return (
                    y.on("end", function () {
                      if (this.streamInfo.data_length !== f.uncompressedSize)
                        throw new Error(
                          "Bug : uncompressed data size mismatch",
                        );
                    }),
                    y
                  );
                },
                getCompressedWorker: function () {
                  return new s(a.Promise.resolve(this.compressedContent))
                    .withStreamInfo("compressedSize", this.compressedSize)
                    .withStreamInfo("uncompressedSize", this.uncompressedSize)
                    .withStreamInfo("crc32", this.crc32)
                    .withStreamInfo("compression", this.compression);
                },
              }),
                (p.createWorkerFrom = function (y, f, _) {
                  return y
                    .pipe(new i())
                    .pipe(new o("uncompressedSize"))
                    .pipe(f.compressWorker(_))
                    .pipe(new o("compressedSize"))
                    .withStreamInfo("compression", f);
                }),
                (g.exports = p);
            },
            {
              "./external": 6,
              "./stream/Crc32Probe": 25,
              "./stream/DataLengthProbe": 26,
              "./stream/DataWorker": 27,
            },
          ],
          3: [
            function (t, g, l) {
              "use strict";
              var a = t("./stream/GenericWorker");
              (l.STORE = {
                magic: "\0\0",
                compressWorker: function () {
                  return new a("STORE compression");
                },
                uncompressWorker: function () {
                  return new a("STORE decompression");
                },
              }),
                (l.DEFLATE = t("./flate"));
            },
            { "./flate": 7, "./stream/GenericWorker": 28 },
          ],
          4: [
            function (t, g, l) {
              "use strict";
              var a = t("./utils"),
                s = (function () {
                  for (var i, o = [], p = 0; p < 256; p++) {
                    i = p;
                    for (var y = 0; y < 8; y++)
                      i = 1 & i ? 3988292384 ^ (i >>> 1) : i >>> 1;
                    o[p] = i;
                  }
                  return o;
                })();
              g.exports = function (i, o) {
                return i !== void 0 && i.length
                  ? a.getTypeOf(i) !== "string"
                    ? (function (p, y, f, _) {
                        var c = s,
                          m = _ + f;
                        p ^= -1;
                        for (var n = _; n < m; n++)
                          p = (p >>> 8) ^ c[255 & (p ^ y[n])];
                        return -1 ^ p;
                      })(0 | o, i, i.length, 0)
                    : (function (p, y, f, _) {
                        var c = s,
                          m = _ + f;
                        p ^= -1;
                        for (var n = _; n < m; n++)
                          p = (p >>> 8) ^ c[255 & (p ^ y.charCodeAt(n))];
                        return -1 ^ p;
                      })(0 | o, i, i.length, 0)
                  : 0;
              };
            },
            { "./utils": 32 },
          ],
          5: [
            function (t, g, l) {
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
            function (t, g, l) {
              "use strict";
              var a = null;
              (a = typeof Promise < "u" ? Promise : t("lie")),
                (g.exports = { Promise: a });
            },
            { lie: 37 },
          ],
          7: [
            function (t, g, l) {
              "use strict";
              var a =
                  typeof Uint8Array < "u" &&
                  typeof Uint16Array < "u" &&
                  typeof Uint32Array < "u",
                s = t("pako"),
                i = t("./utils"),
                o = t("./stream/GenericWorker"),
                p = a ? "uint8array" : "array";
              function y(f, _) {
                o.call(this, "FlateWorker/" + f),
                  (this._pako = null),
                  (this._pakoAction = f),
                  (this._pakoOptions = _),
                  (this.meta = {});
              }
              (l.magic = "\b\0"),
                i.inherits(y, o),
                (y.prototype.processChunk = function (f) {
                  (this.meta = f.meta),
                    this._pako === null && this._createPako(),
                    this._pako.push(i.transformTo(p, f.data), !1);
                }),
                (y.prototype.flush = function () {
                  o.prototype.flush.call(this),
                    this._pako === null && this._createPako(),
                    this._pako.push([], !0);
                }),
                (y.prototype.cleanUp = function () {
                  o.prototype.cleanUp.call(this), (this._pako = null);
                }),
                (y.prototype._createPako = function () {
                  this._pako = new s[this._pakoAction]({
                    raw: !0,
                    level: this._pakoOptions.level || -1,
                  });
                  var f = this;
                  this._pako.onData = function (_) {
                    f.push({ data: _, meta: f.meta });
                  };
                }),
                (l.compressWorker = function (f) {
                  return new y("Deflate", f);
                }),
                (l.uncompressWorker = function () {
                  return new y("Inflate", {});
                });
            },
            { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 },
          ],
          8: [
            function (t, g, l) {
              "use strict";
              function a(c, m) {
                var n,
                  d = "";
                for (n = 0; n < m; n++)
                  (d += String.fromCharCode(255 & c)), (c >>>= 8);
                return d;
              }
              function s(c, m, n, d, u, w) {
                var x,
                  D,
                  k = c.file,
                  P = c.compression,
                  T = w !== p.utf8encode,
                  U = i.transformTo("string", w(k.name)),
                  C = i.transformTo("string", p.utf8encode(k.name)),
                  I = k.comment,
                  N = i.transformTo("string", w(I)),
                  b = i.transformTo("string", p.utf8encode(I)),
                  S = C.length !== k.name.length,
                  r = b.length !== I.length,
                  F = "",
                  q = "",
                  B = "",
                  J = k.dir,
                  X = k.date,
                  K = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
                (m && !n) ||
                  ((K.crc32 = c.crc32),
                  (K.compressedSize = c.compressedSize),
                  (K.uncompressedSize = c.uncompressedSize));
                var A = 0;
                m && (A |= 8), T || (!S && !r) || (A |= 2048);
                var $ = 0,
                  V = 0;
                J && ($ |= 16),
                  u === "UNIX"
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
                  (D = X.getUTCFullYear() - 1980),
                  (D <<= 4),
                  (D |= X.getUTCMonth() + 1),
                  (D <<= 5),
                  (D |= X.getUTCDate()),
                  S &&
                    ((q = a(1, 1) + a(y(U), 4) + C),
                    (F += "up" + a(q.length, 2) + q)),
                  r &&
                    ((B = a(1, 1) + a(y(N), 4) + b),
                    (F += "uc" + a(B.length, 2) + B));
                var G = "";
                return (
                  (G += `
\0`),
                  (G += a(A, 2)),
                  (G += P.magic),
                  (G += a(x, 2)),
                  (G += a(D, 2)),
                  (G += a(K.crc32, 4)),
                  (G += a(K.compressedSize, 4)),
                  (G += a(K.uncompressedSize, 4)),
                  (G += a(U.length, 2)),
                  (G += a(F.length, 2)),
                  {
                    fileRecord: f.LOCAL_FILE_HEADER + G + U + F,
                    dirRecord:
                      f.CENTRAL_FILE_HEADER +
                      a(V, 2) +
                      G +
                      a(N.length, 2) +
                      "\0\0\0\0" +
                      a($, 4) +
                      a(d, 4) +
                      U +
                      F +
                      N,
                  }
                );
              }
              var i = t("../utils"),
                o = t("../stream/GenericWorker"),
                p = t("../utf8"),
                y = t("../crc32"),
                f = t("../signature");
              function _(c, m, n, d) {
                o.call(this, "ZipFileWorker"),
                  (this.bytesWritten = 0),
                  (this.zipComment = m),
                  (this.zipPlatform = n),
                  (this.encodeFileName = d),
                  (this.streamFiles = c),
                  (this.accumulate = !1),
                  (this.contentBuffer = []),
                  (this.dirRecords = []),
                  (this.currentSourceOffset = 0),
                  (this.entriesCount = 0),
                  (this.currentFile = null),
                  (this._sources = []);
              }
              i.inherits(_, o),
                (_.prototype.push = function (c) {
                  var m = c.meta.percent || 0,
                    n = this.entriesCount,
                    d = this._sources.length;
                  this.accumulate
                    ? this.contentBuffer.push(c)
                    : ((this.bytesWritten += c.data.length),
                      o.prototype.push.call(this, {
                        data: c.data,
                        meta: {
                          currentFile: this.currentFile,
                          percent: n ? (m + 100 * (n - d - 1)) / n : 100,
                        },
                      }));
                }),
                (_.prototype.openedSource = function (c) {
                  (this.currentSourceOffset = this.bytesWritten),
                    (this.currentFile = c.file.name);
                  var m = this.streamFiles && !c.file.dir;
                  if (m) {
                    var n = s(
                      c,
                      m,
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
                  var m = this.streamFiles && !c.file.dir,
                    n = s(
                      c,
                      m,
                      !0,
                      this.currentSourceOffset,
                      this.zipPlatform,
                      this.encodeFileName,
                    );
                  if ((this.dirRecords.push(n.dirRecord), m))
                    this.push({
                      data: (function (d) {
                        return (
                          f.DATA_DESCRIPTOR +
                          a(d.crc32, 4) +
                          a(d.compressedSize, 4) +
                          a(d.uncompressedSize, 4)
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
                    var c = this.bytesWritten, m = 0;
                    m < this.dirRecords.length;
                    m++
                  )
                    this.push({
                      data: this.dirRecords[m],
                      meta: { percent: 100 },
                    });
                  var n = this.bytesWritten - c,
                    d = (function (u, w, x, D, k) {
                      var P = i.transformTo("string", k(D));
                      return (
                        f.CENTRAL_DIRECTORY_END +
                        "\0\0\0\0" +
                        a(u, 2) +
                        a(u, 2) +
                        a(w, 4) +
                        a(x, 4) +
                        a(P.length, 2) +
                        P
                      );
                    })(
                      this.dirRecords.length,
                      n,
                      c,
                      this.zipComment,
                      this.encodeFileName,
                    );
                  this.push({ data: d, meta: { percent: 100 } });
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
                  var m = this;
                  return (
                    c.on("data", function (n) {
                      m.processChunk(n);
                    }),
                    c.on("end", function () {
                      m.closedSource(m.previous.streamInfo),
                        m._sources.length ? m.prepareNextSource() : m.end();
                    }),
                    c.on("error", function (n) {
                      m.error(n);
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
                  var m = this._sources;
                  if (!o.prototype.error.call(this, c)) return !1;
                  for (var n = 0; n < m.length; n++)
                    try {
                      m[n].error(c);
                    } catch {}
                  return !0;
                }),
                (_.prototype.lock = function () {
                  o.prototype.lock.call(this);
                  for (var c = this._sources, m = 0; m < c.length; m++)
                    c[m].lock();
                }),
                (g.exports = _);
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
            function (t, g, l) {
              "use strict";
              var a = t("../compressions"),
                s = t("./ZipFileWorker");
              l.generateWorker = function (i, o, p) {
                var y = new s(o.streamFiles, p, o.platform, o.encodeFileName),
                  f = 0;
                try {
                  i.forEach(function (_, c) {
                    f++;
                    var m = (function (w, x) {
                        var D = w || x,
                          k = a[D];
                        if (!k)
                          throw new Error(
                            D + " is not a valid compression method !",
                          );
                        return k;
                      })(c.options.compression, o.compression),
                      n =
                        c.options.compressionOptions ||
                        o.compressionOptions ||
                        {},
                      d = c.dir,
                      u = c.date;
                    c._compressWorker(m, n)
                      .withStreamInfo("file", {
                        name: _,
                        dir: d,
                        date: u,
                        comment: c.comment || "",
                        unixPermissions: c.unixPermissions,
                        dosPermissions: c.dosPermissions,
                      })
                      .pipe(y);
                  }),
                    (y.entriesCount = f);
                } catch (_) {
                  y.error(_);
                }
                return y;
              };
            },
            { "../compressions": 3, "./ZipFileWorker": 8 },
          ],
          10: [
            function (t, g, l) {
              "use strict";
              function a() {
                if (!(this instanceof a)) return new a();
                if (arguments.length)
                  throw new Error(
                    "The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.",
                  );
                (this.files = Object.create(null)),
                  (this.comment = null),
                  (this.root = ""),
                  (this.clone = function () {
                    var s = new a();
                    for (var i in this)
                      typeof this[i] != "function" && (s[i] = this[i]);
                    return s;
                  });
              }
              ((a.prototype = t("./object")).loadAsync = t("./load")),
                (a.support = t("./support")),
                (a.defaults = t("./defaults")),
                (a.version = "3.10.1"),
                (a.loadAsync = function (s, i) {
                  return new a().loadAsync(s, i);
                }),
                (a.external = t("./external")),
                (g.exports = a);
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
            function (t, g, l) {
              "use strict";
              var a = t("./utils"),
                s = t("./external"),
                i = t("./utf8"),
                o = t("./zipEntries"),
                p = t("./stream/Crc32Probe"),
                y = t("./nodejsUtils");
              function f(_) {
                return new s.Promise(function (c, m) {
                  var n = _.decompressed.getContentWorker().pipe(new p());
                  n.on("error", function (d) {
                    m(d);
                  })
                    .on("end", function () {
                      n.streamInfo.crc32 !== _.decompressed.crc32
                        ? m(new Error("Corrupted zip : CRC32 mismatch"))
                        : c();
                    })
                    .resume();
                });
              }
              g.exports = function (_, c) {
                var m = this;
                return (
                  (c = a.extend(c || {}, {
                    base64: !1,
                    checkCRC32: !1,
                    optimizedBinaryString: !1,
                    createFolders: !1,
                    decodeFileName: i.utf8decode,
                  })),
                  y.isNode && y.isStream(_)
                    ? s.Promise.reject(
                        new Error(
                          "JSZip can't accept a stream when loading a zip file.",
                        ),
                      )
                    : a
                        .prepareContent(
                          "the loaded zip file",
                          _,
                          !0,
                          c.optimizedBinaryString,
                          c.base64,
                        )
                        .then(function (n) {
                          var d = new o(c);
                          return d.load(n), d;
                        })
                        .then(function (n) {
                          var d = [s.Promise.resolve(n)],
                            u = n.files;
                          if (c.checkCRC32)
                            for (var w = 0; w < u.length; w++) d.push(f(u[w]));
                          return s.Promise.all(d);
                        })
                        .then(function (n) {
                          for (
                            var d = n.shift(), u = d.files, w = 0;
                            w < u.length;
                            w++
                          ) {
                            var x = u[w],
                              D = x.fileNameStr,
                              k = a.resolve(x.fileNameStr);
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
                              x.dir || (m.file(k).unsafeOriginalName = D);
                          }
                          return (
                            d.zipComment.length && (m.comment = d.zipComment), m
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
            function (t, g, l) {
              "use strict";
              var a = t("../utils"),
                s = t("../stream/GenericWorker");
              function i(o, p) {
                s.call(this, "Nodejs stream input adapter for " + o),
                  (this._upstreamEnded = !1),
                  this._bindStream(p);
              }
              a.inherits(i, s),
                (i.prototype._bindStream = function (o) {
                  var p = this;
                  (this._stream = o).pause(),
                    o
                      .on("data", function (y) {
                        p.push({ data: y, meta: { percent: 0 } });
                      })
                      .on("error", function (y) {
                        p.isPaused ? (this.generatedError = y) : p.error(y);
                      })
                      .on("end", function () {
                        p.isPaused ? (p._upstreamEnded = !0) : p.end();
                      });
                }),
                (i.prototype.pause = function () {
                  return (
                    !!s.prototype.pause.call(this) && (this._stream.pause(), !0)
                  );
                }),
                (i.prototype.resume = function () {
                  return (
                    !!s.prototype.resume.call(this) &&
                    (this._upstreamEnded ? this.end() : this._stream.resume(),
                    !0)
                  );
                }),
                (g.exports = i);
            },
            { "../stream/GenericWorker": 28, "../utils": 32 },
          ],
          13: [
            function (t, g, l) {
              "use strict";
              var a = t("readable-stream").Readable;
              function s(i, o, p) {
                a.call(this, o), (this._helper = i);
                var y = this;
                i.on("data", function (f, _) {
                  y.push(f) || y._helper.pause(), p && p(_);
                })
                  .on("error", function (f) {
                    y.emit("error", f);
                  })
                  .on("end", function () {
                    y.push(null);
                  });
              }
              t("../utils").inherits(s, a),
                (s.prototype._read = function () {
                  this._helper.resume();
                }),
                (g.exports = s);
            },
            { "../utils": 32, "readable-stream": 16 },
          ],
          14: [
            function (t, g, l) {
              "use strict";
              g.exports = {
                isNode: typeof Buffer < "u",
                newBufferFrom: function (a, s) {
                  if (Buffer.from && Buffer.from !== Uint8Array.from)
                    return Buffer.from(a, s);
                  if (typeof a == "number")
                    throw new Error('The "data" argument must not be a number');
                  return new Buffer(a, s);
                },
                allocBuffer: function (a) {
                  if (Buffer.alloc) return Buffer.alloc(a);
                  var s = new Buffer(a);
                  return s.fill(0), s;
                },
                isBuffer: function (a) {
                  return Buffer.isBuffer(a);
                },
                isStream: function (a) {
                  return (
                    a &&
                    typeof a.on == "function" &&
                    typeof a.pause == "function" &&
                    typeof a.resume == "function"
                  );
                },
              };
            },
            {},
          ],
          15: [
            function (t, g, l) {
              "use strict";
              function a(k, P, T) {
                var U,
                  C = i.getTypeOf(P),
                  I = i.extend(T || {}, y);
                (I.date = I.date || new Date()),
                  I.compression !== null &&
                    (I.compression = I.compression.toUpperCase()),
                  typeof I.unixPermissions == "string" &&
                    (I.unixPermissions = parseInt(I.unixPermissions, 8)),
                  I.unixPermissions &&
                    16384 & I.unixPermissions &&
                    (I.dir = !0),
                  I.dosPermissions && 16 & I.dosPermissions && (I.dir = !0),
                  I.dir && (k = u(k)),
                  I.createFolders && (U = d(k)) && w.call(this, U, !0);
                var N = C === "string" && I.binary === !1 && I.base64 === !1;
                (T && T.binary !== void 0) || (I.binary = !N),
                  ((P instanceof f && P.uncompressedSize === 0) ||
                    I.dir ||
                    !P ||
                    P.length === 0) &&
                    ((I.base64 = !1),
                    (I.binary = !0),
                    (P = ""),
                    (I.compression = "STORE"),
                    (C = "string"));
                var b = null;
                b =
                  P instanceof f || P instanceof o
                    ? P
                    : m.isNode && m.isStream(P)
                    ? new n(k, P)
                    : i.prepareContent(
                        k,
                        P,
                        I.binary,
                        I.optimizedBinaryString,
                        I.base64,
                      );
                var S = new _(k, b, I);
                this.files[k] = S;
              }
              var s = t("./utf8"),
                i = t("./utils"),
                o = t("./stream/GenericWorker"),
                p = t("./stream/StreamHelper"),
                y = t("./defaults"),
                f = t("./compressedObject"),
                _ = t("./zipObject"),
                c = t("./generate"),
                m = t("./nodejsUtils"),
                n = t("./nodejs/NodejsStreamInputAdapter"),
                d = function (k) {
                  k.slice(-1) === "/" && (k = k.substring(0, k.length - 1));
                  var P = k.lastIndexOf("/");
                  return 0 < P ? k.substring(0, P) : "";
                },
                u = function (k) {
                  return k.slice(-1) !== "/" && (k += "/"), k;
                },
                w = function (k, P) {
                  return (
                    (P = P !== void 0 ? P : y.createFolders),
                    (k = u(k)),
                    this.files[k] ||
                      a.call(this, k, null, { dir: !0, createFolders: P }),
                    this.files[k]
                  );
                };
              function x(k) {
                return Object.prototype.toString.call(k) === "[object RegExp]";
              }
              var D = {
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
                    return (k = this.root + k), a.call(this, k, P, T), this;
                  if (x(k)) {
                    var U = k;
                    return this.filter(function (I, N) {
                      return !N.dir && U.test(I);
                    });
                  }
                  var C = this.files[this.root + k];
                  return C && !C.dir ? C : null;
                },
                folder: function (k) {
                  if (!k) return this;
                  if (x(k))
                    return this.filter(function (C, I) {
                      return I.dir && k.test(C);
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
                      var T = this.filter(function (C, I) {
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
                      (((T = i.extend(k || {}, {
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
                    i.checkSupport(T.type),
                      (T.platform !== "darwin" &&
                        T.platform !== "freebsd" &&
                        T.platform !== "linux" &&
                        T.platform !== "sunos") ||
                        (T.platform = "UNIX"),
                      T.platform === "win32" && (T.platform = "DOS");
                    var U = T.comment || this.comment || "";
                    P = c.generateWorker(this, T, U);
                  } catch (C) {
                    (P = new o("error")).error(C);
                  }
                  return new p(P, T.type || "string", T.mimeType);
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
              g.exports = D;
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
            function (t, g, l) {
              "use strict";
              g.exports = t("stream");
            },
            { stream: void 0 },
          ],
          17: [
            function (t, g, l) {
              "use strict";
              var a = t("./DataReader");
              function s(i) {
                a.call(this, i);
                for (var o = 0; o < this.data.length; o++) i[o] = 255 & i[o];
              }
              t("../utils").inherits(s, a),
                (s.prototype.byteAt = function (i) {
                  return this.data[this.zero + i];
                }),
                (s.prototype.lastIndexOfSignature = function (i) {
                  for (
                    var o = i.charCodeAt(0),
                      p = i.charCodeAt(1),
                      y = i.charCodeAt(2),
                      f = i.charCodeAt(3),
                      _ = this.length - 4;
                    0 <= _;
                    --_
                  )
                    if (
                      this.data[_] === o &&
                      this.data[_ + 1] === p &&
                      this.data[_ + 2] === y &&
                      this.data[_ + 3] === f
                    )
                      return _ - this.zero;
                  return -1;
                }),
                (s.prototype.readAndCheckSignature = function (i) {
                  var o = i.charCodeAt(0),
                    p = i.charCodeAt(1),
                    y = i.charCodeAt(2),
                    f = i.charCodeAt(3),
                    _ = this.readData(4);
                  return o === _[0] && p === _[1] && y === _[2] && f === _[3];
                }),
                (s.prototype.readData = function (i) {
                  if ((this.checkOffset(i), i === 0)) return [];
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + i,
                  );
                  return (this.index += i), o;
                }),
                (g.exports = s);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          18: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils");
              function s(i) {
                (this.data = i),
                  (this.length = i.length),
                  (this.index = 0),
                  (this.zero = 0);
              }
              (s.prototype = {
                checkOffset: function (i) {
                  this.checkIndex(this.index + i);
                },
                checkIndex: function (i) {
                  if (this.length < this.zero + i || i < 0)
                    throw new Error(
                      "End of data reached (data length = " +
                        this.length +
                        ", asked index = " +
                        i +
                        "). Corrupted zip ?",
                    );
                },
                setIndex: function (i) {
                  this.checkIndex(i), (this.index = i);
                },
                skip: function (i) {
                  this.setIndex(this.index + i);
                },
                byteAt: function () {},
                readInt: function (i) {
                  var o,
                    p = 0;
                  for (
                    this.checkOffset(i), o = this.index + i - 1;
                    o >= this.index;
                    o--
                  )
                    p = (p << 8) + this.byteAt(o);
                  return (this.index += i), p;
                },
                readString: function (i) {
                  return a.transformTo("string", this.readData(i));
                },
                readData: function () {},
                lastIndexOfSignature: function () {},
                readAndCheckSignature: function () {},
                readDate: function () {
                  var i = this.readInt(4);
                  return new Date(
                    Date.UTC(
                      1980 + ((i >> 25) & 127),
                      ((i >> 21) & 15) - 1,
                      (i >> 16) & 31,
                      (i >> 11) & 31,
                      (i >> 5) & 63,
                      (31 & i) << 1,
                    ),
                  );
                },
              }),
                (g.exports = s);
            },
            { "../utils": 32 },
          ],
          19: [
            function (t, g, l) {
              "use strict";
              var a = t("./Uint8ArrayReader");
              function s(i) {
                a.call(this, i);
              }
              t("../utils").inherits(s, a),
                (s.prototype.readData = function (i) {
                  this.checkOffset(i);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + i,
                  );
                  return (this.index += i), o;
                }),
                (g.exports = s);
            },
            { "../utils": 32, "./Uint8ArrayReader": 21 },
          ],
          20: [
            function (t, g, l) {
              "use strict";
              var a = t("./DataReader");
              function s(i) {
                a.call(this, i);
              }
              t("../utils").inherits(s, a),
                (s.prototype.byteAt = function (i) {
                  return this.data.charCodeAt(this.zero + i);
                }),
                (s.prototype.lastIndexOfSignature = function (i) {
                  return this.data.lastIndexOf(i) - this.zero;
                }),
                (s.prototype.readAndCheckSignature = function (i) {
                  return i === this.readData(4);
                }),
                (s.prototype.readData = function (i) {
                  this.checkOffset(i);
                  var o = this.data.slice(
                    this.zero + this.index,
                    this.zero + this.index + i,
                  );
                  return (this.index += i), o;
                }),
                (g.exports = s);
            },
            { "../utils": 32, "./DataReader": 18 },
          ],
          21: [
            function (t, g, l) {
              "use strict";
              var a = t("./ArrayReader");
              function s(i) {
                a.call(this, i);
              }
              t("../utils").inherits(s, a),
                (s.prototype.readData = function (i) {
                  if ((this.checkOffset(i), i === 0)) return new Uint8Array(0);
                  var o = this.data.subarray(
                    this.zero + this.index,
                    this.zero + this.index + i,
                  );
                  return (this.index += i), o;
                }),
                (g.exports = s);
            },
            { "../utils": 32, "./ArrayReader": 17 },
          ],
          22: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils"),
                s = t("../support"),
                i = t("./ArrayReader"),
                o = t("./StringReader"),
                p = t("./NodeBufferReader"),
                y = t("./Uint8ArrayReader");
              g.exports = function (f) {
                var _ = a.getTypeOf(f);
                return (
                  a.checkSupport(_),
                  _ !== "string" || s.uint8array
                    ? _ === "nodebuffer"
                      ? new p(f)
                      : s.uint8array
                      ? new y(a.transformTo("uint8array", f))
                      : new i(a.transformTo("array", f))
                    : new o(f)
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
            function (t, g, l) {
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
            function (t, g, l) {
              "use strict";
              var a = t("./GenericWorker"),
                s = t("../utils");
              function i(o) {
                a.call(this, "ConvertWorker to " + o), (this.destType = o);
              }
              s.inherits(i, a),
                (i.prototype.processChunk = function (o) {
                  this.push({
                    data: s.transformTo(this.destType, o.data),
                    meta: o.meta,
                  });
                }),
                (g.exports = i);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          25: [
            function (t, g, l) {
              "use strict";
              var a = t("./GenericWorker"),
                s = t("../crc32");
              function i() {
                a.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
              }
              t("../utils").inherits(i, a),
                (i.prototype.processChunk = function (o) {
                  (this.streamInfo.crc32 = s(
                    o.data,
                    this.streamInfo.crc32 || 0,
                  )),
                    this.push(o);
                }),
                (g.exports = i);
            },
            { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 },
          ],
          26: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils"),
                s = t("./GenericWorker");
              function i(o) {
                s.call(this, "DataLengthProbe for " + o),
                  (this.propName = o),
                  this.withStreamInfo(o, 0);
              }
              a.inherits(i, s),
                (i.prototype.processChunk = function (o) {
                  if (o) {
                    var p = this.streamInfo[this.propName] || 0;
                    this.streamInfo[this.propName] = p + o.data.length;
                  }
                  s.prototype.processChunk.call(this, o);
                }),
                (g.exports = i);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          27: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils"),
                s = t("./GenericWorker");
              function i(o) {
                s.call(this, "DataWorker");
                var p = this;
                (this.dataIsReady = !1),
                  (this.index = 0),
                  (this.max = 0),
                  (this.data = null),
                  (this.type = ""),
                  (this._tickScheduled = !1),
                  o.then(
                    function (y) {
                      (p.dataIsReady = !0),
                        (p.data = y),
                        (p.max = (y && y.length) || 0),
                        (p.type = a.getTypeOf(y)),
                        p.isPaused || p._tickAndRepeat();
                    },
                    function (y) {
                      p.error(y);
                    },
                  );
              }
              a.inherits(i, s),
                (i.prototype.cleanUp = function () {
                  s.prototype.cleanUp.call(this), (this.data = null);
                }),
                (i.prototype.resume = function () {
                  return (
                    !!s.prototype.resume.call(this) &&
                    (!this._tickScheduled &&
                      this.dataIsReady &&
                      ((this._tickScheduled = !0),
                      a.delay(this._tickAndRepeat, [], this)),
                    !0)
                  );
                }),
                (i.prototype._tickAndRepeat = function () {
                  (this._tickScheduled = !1),
                    this.isPaused ||
                      this.isFinished ||
                      (this._tick(),
                      this.isFinished ||
                        (a.delay(this._tickAndRepeat, [], this),
                        (this._tickScheduled = !0)));
                }),
                (i.prototype._tick = function () {
                  if (this.isPaused || this.isFinished) return !1;
                  var o = null,
                    p = Math.min(this.max, this.index + 16384);
                  if (this.index >= this.max) return this.end();
                  switch (this.type) {
                    case "string":
                      o = this.data.substring(this.index, p);
                      break;
                    case "uint8array":
                      o = this.data.subarray(this.index, p);
                      break;
                    case "array":
                    case "nodebuffer":
                      o = this.data.slice(this.index, p);
                  }
                  return (
                    (this.index = p),
                    this.push({
                      data: o,
                      meta: {
                        percent: this.max ? (this.index / this.max) * 100 : 0,
                      },
                    })
                  );
                }),
                (g.exports = i);
            },
            { "../utils": 32, "./GenericWorker": 28 },
          ],
          28: [
            function (t, g, l) {
              "use strict";
              function a(s) {
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
              (a.prototype = {
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
                on: function (s, i) {
                  return this._listeners[s].push(i), this;
                },
                cleanUp: function () {
                  (this.streamInfo =
                    this.generatedError =
                    this.extraStreamInfo =
                      null),
                    (this._listeners = []);
                },
                emit: function (s, i) {
                  if (this._listeners[s])
                    for (var o = 0; o < this._listeners[s].length; o++)
                      this._listeners[s][o].call(this, i);
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
                  var i = this;
                  return (
                    s.on("data", function (o) {
                      i.processChunk(o);
                    }),
                    s.on("end", function () {
                      i.end();
                    }),
                    s.on("error", function (o) {
                      i.error(o);
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
                withStreamInfo: function (s, i) {
                  return (
                    (this.extraStreamInfo[s] = i), this.mergeStreamInfo(), this
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
                (g.exports = a);
            },
            {},
          ],
          29: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils"),
                s = t("./ConvertWorker"),
                i = t("./GenericWorker"),
                o = t("../base64"),
                p = t("../support"),
                y = t("../external"),
                f = null;
              if (p.nodestream)
                try {
                  f = t("../nodejs/NodejsStreamOutputAdapter");
                } catch {}
              function _(m, n) {
                return new y.Promise(function (d, u) {
                  var w = [],
                    x = m._internalType,
                    D = m._outputType,
                    k = m._mimeType;
                  m.on("data", function (P, T) {
                    w.push(P), n && n(T);
                  })
                    .on("error", function (P) {
                      (w = []), u(P);
                    })
                    .on("end", function () {
                      try {
                        var P = (function (T, U, C) {
                          switch (T) {
                            case "blob":
                              return a.newBlob(
                                a.transformTo("arraybuffer", U),
                                C,
                              );
                            case "base64":
                              return o.encode(U);
                            default:
                              return a.transformTo(T, U);
                          }
                        })(
                          D,
                          (function (T, U) {
                            var C,
                              I = 0,
                              N = null,
                              b = 0;
                            for (C = 0; C < U.length; C++) b += U[C].length;
                            switch (T) {
                              case "string":
                                return U.join("");
                              case "array":
                                return Array.prototype.concat.apply([], U);
                              case "uint8array":
                                for (
                                  N = new Uint8Array(b), C = 0;
                                  C < U.length;
                                  C++
                                )
                                  N.set(U[C], I), (I += U[C].length);
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
                        d(P);
                      } catch (T) {
                        u(T);
                      }
                      w = [];
                    })
                    .resume();
                });
              }
              function c(m, n, d) {
                var u = n;
                switch (n) {
                  case "blob":
                  case "arraybuffer":
                    u = "uint8array";
                    break;
                  case "base64":
                    u = "string";
                }
                try {
                  (this._internalType = u),
                    (this._outputType = n),
                    (this._mimeType = d),
                    a.checkSupport(u),
                    (this._worker = m.pipe(new s(u))),
                    m.lock();
                } catch (w) {
                  (this._worker = new i("error")), this._worker.error(w);
                }
              }
              (c.prototype = {
                accumulate: function (m) {
                  return _(this, m);
                },
                on: function (m, n) {
                  var d = this;
                  return (
                    m === "data"
                      ? this._worker.on(m, function (u) {
                          n.call(d, u.data, u.meta);
                        })
                      : this._worker.on(m, function () {
                          a.delay(n, arguments, d);
                        }),
                    this
                  );
                },
                resume: function () {
                  return a.delay(this._worker.resume, [], this._worker), this;
                },
                pause: function () {
                  return this._worker.pause(), this;
                },
                toNodejsStream: function (m) {
                  if (
                    (a.checkSupport("nodestream"),
                    this._outputType !== "nodebuffer")
                  )
                    throw new Error(
                      this._outputType + " is not supported by this method",
                    );
                  return new f(
                    this,
                    { objectMode: this._outputType !== "nodebuffer" },
                    m,
                  );
                },
              }),
                (g.exports = c);
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
            function (t, g, l) {
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
                var a = new ArrayBuffer(0);
                try {
                  l.blob =
                    new Blob([a], { type: "application/zip" }).size === 0;
                } catch {
                  try {
                    var s = new (self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder)();
                    s.append(a),
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
            function (t, g, l) {
              "use strict";
              for (
                var a = t("./utils"),
                  s = t("./support"),
                  i = t("./nodejsUtils"),
                  o = t("./stream/GenericWorker"),
                  p = new Array(256),
                  y = 0;
                y < 256;
                y++
              )
                p[y] =
                  252 <= y
                    ? 6
                    : 248 <= y
                    ? 5
                    : 240 <= y
                    ? 4
                    : 224 <= y
                    ? 3
                    : 192 <= y
                    ? 2
                    : 1;
              p[254] = p[254] = 1;
              function f() {
                o.call(this, "utf-8 decode"), (this.leftOver = null);
              }
              function _() {
                o.call(this, "utf-8 encode");
              }
              (l.utf8encode = function (c) {
                return s.nodebuffer
                  ? i.newBufferFrom(c, "utf-8")
                  : (function (m) {
                      var n,
                        d,
                        u,
                        w,
                        x,
                        D = m.length,
                        k = 0;
                      for (w = 0; w < D; w++)
                        (64512 & (d = m.charCodeAt(w))) == 55296 &&
                          w + 1 < D &&
                          (64512 & (u = m.charCodeAt(w + 1))) == 56320 &&
                          ((d = 65536 + ((d - 55296) << 10) + (u - 56320)),
                          w++),
                          (k += d < 128 ? 1 : d < 2048 ? 2 : d < 65536 ? 3 : 4);
                      for (
                        n = s.uint8array ? new Uint8Array(k) : new Array(k),
                          w = x = 0;
                        x < k;
                        w++
                      )
                        (64512 & (d = m.charCodeAt(w))) == 55296 &&
                          w + 1 < D &&
                          (64512 & (u = m.charCodeAt(w + 1))) == 56320 &&
                          ((d = 65536 + ((d - 55296) << 10) + (u - 56320)),
                          w++),
                          d < 128
                            ? (n[x++] = d)
                            : (d < 2048
                                ? (n[x++] = 192 | (d >>> 6))
                                : (d < 65536
                                    ? (n[x++] = 224 | (d >>> 12))
                                    : ((n[x++] = 240 | (d >>> 18)),
                                      (n[x++] = 128 | ((d >>> 12) & 63))),
                                  (n[x++] = 128 | ((d >>> 6) & 63))),
                              (n[x++] = 128 | (63 & d)));
                      return n;
                    })(c);
              }),
                (l.utf8decode = function (c) {
                  return s.nodebuffer
                    ? a.transformTo("nodebuffer", c).toString("utf-8")
                    : (function (m) {
                        var n,
                          d,
                          u,
                          w,
                          x = m.length,
                          D = new Array(2 * x);
                        for (n = d = 0; n < x; )
                          if ((u = m[n++]) < 128) D[d++] = u;
                          else if (4 < (w = p[u]))
                            (D[d++] = 65533), (n += w - 1);
                          else {
                            for (
                              u &= w === 2 ? 31 : w === 3 ? 15 : 7;
                              1 < w && n < x;

                            )
                              (u = (u << 6) | (63 & m[n++])), w--;
                            1 < w
                              ? (D[d++] = 65533)
                              : u < 65536
                              ? (D[d++] = u)
                              : ((u -= 65536),
                                (D[d++] = 55296 | ((u >> 10) & 1023)),
                                (D[d++] = 56320 | (1023 & u)));
                          }
                        return (
                          D.length !== d &&
                            (D.subarray
                              ? (D = D.subarray(0, d))
                              : (D.length = d)),
                          a.applyFromCharCode(D)
                        );
                      })(
                        (c = a.transformTo(
                          s.uint8array ? "uint8array" : "array",
                          c,
                        )),
                      );
                }),
                a.inherits(f, o),
                (f.prototype.processChunk = function (c) {
                  var m = a.transformTo(
                    s.uint8array ? "uint8array" : "array",
                    c.data,
                  );
                  if (this.leftOver && this.leftOver.length) {
                    if (s.uint8array) {
                      var n = m;
                      (m = new Uint8Array(n.length + this.leftOver.length)).set(
                        this.leftOver,
                        0,
                      ),
                        m.set(n, this.leftOver.length);
                    } else m = this.leftOver.concat(m);
                    this.leftOver = null;
                  }
                  var d = (function (w, x) {
                      var D;
                      for (
                        (x = x || w.length) > w.length && (x = w.length),
                          D = x - 1;
                        0 <= D && (192 & w[D]) == 128;

                      )
                        D--;
                      return D < 0 || D === 0 ? x : D + p[w[D]] > x ? D : x;
                    })(m),
                    u = m;
                  d !== m.length &&
                    (s.uint8array
                      ? ((u = m.subarray(0, d)),
                        (this.leftOver = m.subarray(d, m.length)))
                      : ((u = m.slice(0, d)),
                        (this.leftOver = m.slice(d, m.length)))),
                    this.push({ data: l.utf8decode(u), meta: c.meta });
                }),
                (f.prototype.flush = function () {
                  this.leftOver &&
                    this.leftOver.length &&
                    (this.push({ data: l.utf8decode(this.leftOver), meta: {} }),
                    (this.leftOver = null));
                }),
                (l.Utf8DecodeWorker = f),
                a.inherits(_, o),
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
            function (t, g, l) {
              "use strict";
              var a = t("./support"),
                s = t("./base64"),
                i = t("./nodejsUtils"),
                o = t("./external");
              function p(n) {
                return n;
              }
              function y(n, d) {
                for (var u = 0; u < n.length; ++u) d[u] = 255 & n.charCodeAt(u);
                return d;
              }
              t("setimmediate"),
                (l.newBlob = function (n, d) {
                  l.checkSupport("blob");
                  try {
                    return new Blob([n], { type: d });
                  } catch {
                    try {
                      var u = new (self.BlobBuilder ||
                        self.WebKitBlobBuilder ||
                        self.MozBlobBuilder ||
                        self.MSBlobBuilder)();
                      return u.append(n), u.getBlob(d);
                    } catch {
                      throw new Error("Bug : can't construct the Blob.");
                    }
                  }
                });
              var f = {
                stringifyByChunk: function (n, d, u) {
                  var w = [],
                    x = 0,
                    D = n.length;
                  if (D <= u) return String.fromCharCode.apply(null, n);
                  for (; x < D; )
                    d === "array" || d === "nodebuffer"
                      ? w.push(
                          String.fromCharCode.apply(
                            null,
                            n.slice(x, Math.min(x + u, D)),
                          ),
                        )
                      : w.push(
                          String.fromCharCode.apply(
                            null,
                            n.subarray(x, Math.min(x + u, D)),
                          ),
                        ),
                      (x += u);
                  return w.join("");
                },
                stringifyByChar: function (n) {
                  for (var d = "", u = 0; u < n.length; u++)
                    d += String.fromCharCode(n[u]);
                  return d;
                },
                applyCanBeUsed: {
                  uint8array: (function () {
                    try {
                      return (
                        a.uint8array &&
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
                        a.nodebuffer &&
                        String.fromCharCode.apply(null, i.allocBuffer(1))
                          .length === 1
                      );
                    } catch {
                      return !1;
                    }
                  })(),
                },
              };
              function _(n) {
                var d = 65536,
                  u = l.getTypeOf(n),
                  w = !0;
                if (
                  (u === "uint8array"
                    ? (w = f.applyCanBeUsed.uint8array)
                    : u === "nodebuffer" && (w = f.applyCanBeUsed.nodebuffer),
                  w)
                )
                  for (; 1 < d; )
                    try {
                      return f.stringifyByChunk(n, u, d);
                    } catch {
                      d = Math.floor(d / 2);
                    }
                return f.stringifyByChar(n);
              }
              function c(n, d) {
                for (var u = 0; u < n.length; u++) d[u] = n[u];
                return d;
              }
              l.applyFromCharCode = _;
              var m = {};
              (m.string = {
                string: p,
                array: function (n) {
                  return y(n, new Array(n.length));
                },
                arraybuffer: function (n) {
                  return m.string.uint8array(n).buffer;
                },
                uint8array: function (n) {
                  return y(n, new Uint8Array(n.length));
                },
                nodebuffer: function (n) {
                  return y(n, i.allocBuffer(n.length));
                },
              }),
                (m.array = {
                  string: _,
                  array: p,
                  arraybuffer: function (n) {
                    return new Uint8Array(n).buffer;
                  },
                  uint8array: function (n) {
                    return new Uint8Array(n);
                  },
                  nodebuffer: function (n) {
                    return i.newBufferFrom(n);
                  },
                }),
                (m.arraybuffer = {
                  string: function (n) {
                    return _(new Uint8Array(n));
                  },
                  array: function (n) {
                    return c(new Uint8Array(n), new Array(n.byteLength));
                  },
                  arraybuffer: p,
                  uint8array: function (n) {
                    return new Uint8Array(n);
                  },
                  nodebuffer: function (n) {
                    return i.newBufferFrom(new Uint8Array(n));
                  },
                }),
                (m.uint8array = {
                  string: _,
                  array: function (n) {
                    return c(n, new Array(n.length));
                  },
                  arraybuffer: function (n) {
                    return n.buffer;
                  },
                  uint8array: p,
                  nodebuffer: function (n) {
                    return i.newBufferFrom(n);
                  },
                }),
                (m.nodebuffer = {
                  string: _,
                  array: function (n) {
                    return c(n, new Array(n.length));
                  },
                  arraybuffer: function (n) {
                    return m.nodebuffer.uint8array(n).buffer;
                  },
                  uint8array: function (n) {
                    return c(n, new Uint8Array(n.length));
                  },
                  nodebuffer: p,
                }),
                (l.transformTo = function (n, d) {
                  if (((d = d || ""), !n)) return d;
                  l.checkSupport(n);
                  var u = l.getTypeOf(d);
                  return m[u][n](d);
                }),
                (l.resolve = function (n) {
                  for (var d = n.split("/"), u = [], w = 0; w < d.length; w++) {
                    var x = d[w];
                    x === "." ||
                      (x === "" && w !== 0 && w !== d.length - 1) ||
                      (x === ".." ? u.pop() : u.push(x));
                  }
                  return u.join("/");
                }),
                (l.getTypeOf = function (n) {
                  return typeof n == "string"
                    ? "string"
                    : Object.prototype.toString.call(n) === "[object Array]"
                    ? "array"
                    : a.nodebuffer && i.isBuffer(n)
                    ? "nodebuffer"
                    : a.uint8array && n instanceof Uint8Array
                    ? "uint8array"
                    : a.arraybuffer && n instanceof ArrayBuffer
                    ? "arraybuffer"
                    : void 0;
                }),
                (l.checkSupport = function (n) {
                  if (!a[n.toLowerCase()])
                    throw new Error(n + " is not supported by this platform");
                }),
                (l.MAX_VALUE_16BITS = 65535),
                (l.MAX_VALUE_32BITS = -1),
                (l.pretty = function (n) {
                  var d,
                    u,
                    w = "";
                  for (u = 0; u < (n || "").length; u++)
                    w +=
                      "\\x" +
                      ((d = n.charCodeAt(u)) < 16 ? "0" : "") +
                      d.toString(16).toUpperCase();
                  return w;
                }),
                (l.delay = function (n, d, u) {
                  setImmediate(function () {
                    n.apply(u || null, d || []);
                  });
                }),
                (l.inherits = function (n, d) {
                  function u() {}
                  (u.prototype = d.prototype), (n.prototype = new u());
                }),
                (l.extend = function () {
                  var n,
                    d,
                    u = {};
                  for (n = 0; n < arguments.length; n++)
                    for (d in arguments[n])
                      Object.prototype.hasOwnProperty.call(arguments[n], d) &&
                        u[d] === void 0 &&
                        (u[d] = arguments[n][d]);
                  return u;
                }),
                (l.prepareContent = function (n, d, u, w, x) {
                  return o.Promise.resolve(d)
                    .then(function (D) {
                      return a.blob &&
                        (D instanceof Blob ||
                          ["[object File]", "[object Blob]"].indexOf(
                            Object.prototype.toString.call(D),
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
                              T.readAsArrayBuffer(D);
                          })
                        : D;
                    })
                    .then(function (D) {
                      var k = l.getTypeOf(D);
                      return k
                        ? (k === "arraybuffer"
                            ? (D = l.transformTo("uint8array", D))
                            : k === "string" &&
                              (x
                                ? (D = s.decode(D))
                                : u &&
                                  w !== !0 &&
                                  (D = (function (P) {
                                    return y(
                                      P,
                                      a.uint8array
                                        ? new Uint8Array(P.length)
                                        : new Array(P.length),
                                    );
                                  })(D))),
                          D)
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
            function (t, g, l) {
              "use strict";
              var a = t("./reader/readerFor"),
                s = t("./utils"),
                i = t("./signature"),
                o = t("./zipEntry"),
                p = t("./support");
              function y(f) {
                (this.files = []), (this.loadOptions = f);
              }
              (y.prototype = {
                checkSignature: function (f) {
                  if (!this.reader.readAndCheckSignature(f)) {
                    this.reader.index -= 4;
                    var _ = this.reader.readString(4);
                    throw new Error(
                      "Corrupted zip or bug: unexpected signature (" +
                        s.pretty(_) +
                        ", expected " +
                        s.pretty(f) +
                        ")",
                    );
                  }
                },
                isSignature: function (f, _) {
                  var c = this.reader.index;
                  this.reader.setIndex(f);
                  var m = this.reader.readString(4) === _;
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
                  var f = this.reader.readData(this.zipCommentLength),
                    _ = p.uint8array ? "uint8array" : "array",
                    c = s.transformTo(_, f);
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
                    var f, _, c, m = this.zip64EndOfCentralSize - 44;
                    0 < m;

                  )
                    (f = this.reader.readInt(2)),
                      (_ = this.reader.readInt(4)),
                      (c = this.reader.readData(_)),
                      (this.zip64ExtensibleData[f] = {
                        id: f,
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
                  var f, _;
                  for (f = 0; f < this.files.length; f++)
                    (_ = this.files[f]),
                      this.reader.setIndex(_.localHeaderOffset),
                      this.checkSignature(i.LOCAL_FILE_HEADER),
                      _.readLocalPart(this.reader),
                      _.handleUTF8(),
                      _.processAttributes();
                },
                readCentralDir: function () {
                  var f;
                  for (
                    this.reader.setIndex(this.centralDirOffset);
                    this.reader.readAndCheckSignature(i.CENTRAL_FILE_HEADER);

                  )
                    (f = new o(
                      { zip64: this.zip64 },
                      this.loadOptions,
                    )).readCentralPart(this.reader),
                      this.files.push(f);
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
                  var f = this.reader.lastIndexOfSignature(
                    i.CENTRAL_DIRECTORY_END,
                  );
                  if (f < 0)
                    throw this.isSignature(0, i.LOCAL_FILE_HEADER)
                      ? new Error(
                          "Corrupted zip: can't find end of central directory",
                        )
                      : new Error(
                          "Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html",
                        );
                  this.reader.setIndex(f);
                  var _ = f;
                  if (
                    (this.checkSignature(i.CENTRAL_DIRECTORY_END),
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
                      (f = this.reader.lastIndexOfSignature(
                        i.ZIP64_CENTRAL_DIRECTORY_LOCATOR,
                      )) < 0)
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory locator",
                      );
                    if (
                      (this.reader.setIndex(f),
                      this.checkSignature(i.ZIP64_CENTRAL_DIRECTORY_LOCATOR),
                      this.readBlockZip64EndOfCentralLocator(),
                      !this.isSignature(
                        this.relativeOffsetEndOfZip64CentralDir,
                        i.ZIP64_CENTRAL_DIRECTORY_END,
                      ) &&
                        ((this.relativeOffsetEndOfZip64CentralDir =
                          this.reader.lastIndexOfSignature(
                            i.ZIP64_CENTRAL_DIRECTORY_END,
                          )),
                        this.relativeOffsetEndOfZip64CentralDir < 0))
                    )
                      throw new Error(
                        "Corrupted zip: can't find the ZIP64 end of central directory",
                      );
                    this.reader.setIndex(
                      this.relativeOffsetEndOfZip64CentralDir,
                    ),
                      this.checkSignature(i.ZIP64_CENTRAL_DIRECTORY_END),
                      this.readBlockZip64EndOfCentral();
                  }
                  var c = this.centralDirOffset + this.centralDirSize;
                  this.zip64 &&
                    ((c += 20), (c += 12 + this.zip64EndOfCentralSize));
                  var m = _ - c;
                  if (0 < m)
                    this.isSignature(_, i.CENTRAL_FILE_HEADER) ||
                      (this.reader.zero = m);
                  else if (m < 0)
                    throw new Error(
                      "Corrupted zip: missing " + Math.abs(m) + " bytes.",
                    );
                },
                prepareReader: function (f) {
                  this.reader = a(f);
                },
                load: function (f) {
                  this.prepareReader(f),
                    this.readEndOfCentral(),
                    this.readCentralDir(),
                    this.readLocalFiles();
                },
              }),
                (g.exports = y);
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
            function (t, g, l) {
              "use strict";
              var a = t("./reader/readerFor"),
                s = t("./utils"),
                i = t("./compressedObject"),
                o = t("./crc32"),
                p = t("./utf8"),
                y = t("./compressions"),
                f = t("./support");
              function _(c, m) {
                (this.options = c), (this.loadOptions = m);
              }
              (_.prototype = {
                isEncrypted: function () {
                  return (1 & this.bitFlag) == 1;
                },
                useUTF8: function () {
                  return (2048 & this.bitFlag) == 2048;
                },
                readLocalPart: function (c) {
                  var m, n;
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
                    (m = (function (d) {
                      for (var u in y)
                        if (
                          Object.prototype.hasOwnProperty.call(y, u) &&
                          y[u].magic === d
                        )
                          return y[u];
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
                  this.decompressed = new i(
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
                    var c = a(this.extraFields[1].value);
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
                    n,
                    d,
                    u = c.index + this.extraFieldsLength;
                  for (
                    this.extraFields || (this.extraFields = {});
                    c.index + 4 < u;

                  )
                    (m = c.readInt(2)),
                      (n = c.readInt(2)),
                      (d = c.readData(n)),
                      (this.extraFields[m] = { id: m, length: n, value: d });
                  c.setIndex(u);
                },
                handleUTF8: function () {
                  var c = f.uint8array ? "uint8array" : "array";
                  if (this.useUTF8())
                    (this.fileNameStr = p.utf8decode(this.fileName)),
                      (this.fileCommentStr = p.utf8decode(this.fileComment));
                  else {
                    var m = this.findExtraFieldUnicodePath();
                    if (m !== null) this.fileNameStr = m;
                    else {
                      var n = s.transformTo(c, this.fileName);
                      this.fileNameStr = this.loadOptions.decodeFileName(n);
                    }
                    var d = this.findExtraFieldUnicodeComment();
                    if (d !== null) this.fileCommentStr = d;
                    else {
                      var u = s.transformTo(c, this.fileComment);
                      this.fileCommentStr = this.loadOptions.decodeFileName(u);
                    }
                  }
                },
                findExtraFieldUnicodePath: function () {
                  var c = this.extraFields[28789];
                  if (c) {
                    var m = a(c.value);
                    return m.readInt(1) !== 1 ||
                      o(this.fileName) !== m.readInt(4)
                      ? null
                      : p.utf8decode(m.readData(c.length - 5));
                  }
                  return null;
                },
                findExtraFieldUnicodeComment: function () {
                  var c = this.extraFields[25461];
                  if (c) {
                    var m = a(c.value);
                    return m.readInt(1) !== 1 ||
                      o(this.fileComment) !== m.readInt(4)
                      ? null
                      : p.utf8decode(m.readData(c.length - 5));
                  }
                  return null;
                },
              }),
                (g.exports = _);
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
            function (t, g, l) {
              "use strict";
              function a(m, n, d) {
                (this.name = m),
                  (this.dir = d.dir),
                  (this.date = d.date),
                  (this.comment = d.comment),
                  (this.unixPermissions = d.unixPermissions),
                  (this.dosPermissions = d.dosPermissions),
                  (this._data = n),
                  (this._dataBinary = d.binary),
                  (this.options = {
                    compression: d.compression,
                    compressionOptions: d.compressionOptions,
                  });
              }
              var s = t("./stream/StreamHelper"),
                i = t("./stream/DataWorker"),
                o = t("./utf8"),
                p = t("./compressedObject"),
                y = t("./stream/GenericWorker");
              a.prototype = {
                internalStream: function (m) {
                  var n = null,
                    d = "string";
                  try {
                    if (!m) throw new Error("No output type specified.");
                    var u = (d = m.toLowerCase()) === "string" || d === "text";
                    (d !== "binarystring" && d !== "text") || (d = "string"),
                      (n = this._decompressWorker());
                    var w = !this._dataBinary;
                    w && !u && (n = n.pipe(new o.Utf8EncodeWorker())),
                      !w && u && (n = n.pipe(new o.Utf8DecodeWorker()));
                  } catch (x) {
                    (n = new y("error")).error(x);
                  }
                  return new s(n, d, "");
                },
                async: function (m, n) {
                  return this.internalStream(m).accumulate(n);
                },
                nodeStream: function (m, n) {
                  return this.internalStream(m || "nodebuffer").toNodejsStream(
                    n,
                  );
                },
                _compressWorker: function (m, n) {
                  if (
                    this._data instanceof p &&
                    this._data.compression.magic === m.magic
                  )
                    return this._data.getCompressedWorker();
                  var d = this._decompressWorker();
                  return (
                    this._dataBinary || (d = d.pipe(new o.Utf8EncodeWorker())),
                    p.createWorkerFrom(d, m, n)
                  );
                },
                _decompressWorker: function () {
                  return this._data instanceof p
                    ? this._data.getContentWorker()
                    : this._data instanceof y
                    ? this._data
                    : new i(this._data);
                },
              };
              for (
                var f = [
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
                c < f.length;
                c++
              )
                a.prototype[f[c]] = _;
              g.exports = a;
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
            function (t, g, l) {
              (function (a) {
                "use strict";
                var s,
                  i,
                  o = a.MutationObserver || a.WebKitMutationObserver;
                if (o) {
                  var p = 0,
                    y = new o(m),
                    f = a.document.createTextNode("");
                  y.observe(f, { characterData: !0 }),
                    (s = function () {
                      f.data = p = ++p % 2;
                    });
                } else if (a.setImmediate || a.MessageChannel === void 0)
                  s =
                    "document" in a &&
                    "onreadystatechange" in a.document.createElement("script")
                      ? function () {
                          var n = a.document.createElement("script");
                          (n.onreadystatechange = function () {
                            m(),
                              (n.onreadystatechange = null),
                              n.parentNode.removeChild(n),
                              (n = null);
                          }),
                            a.document.documentElement.appendChild(n);
                        }
                      : function () {
                          setTimeout(m, 0);
                        };
                else {
                  var _ = new a.MessageChannel();
                  (_.port1.onmessage = m),
                    (s = function () {
                      _.port2.postMessage(0);
                    });
                }
                var c = [];
                function m() {
                  var n, d;
                  i = !0;
                  for (var u = c.length; u; ) {
                    for (d = c, c = [], n = -1; ++n < u; ) d[n]();
                    u = c.length;
                  }
                  i = !1;
                }
                g.exports = function (n) {
                  c.push(n) !== 1 || i || s();
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
            function (t, g, l) {
              "use strict";
              var a = t("immediate");
              function s() {}
              var i = {},
                o = ["REJECTED"],
                p = ["FULFILLED"],
                y = ["PENDING"];
              function f(u) {
                if (typeof u != "function")
                  throw new TypeError("resolver must be a function");
                (this.state = y),
                  (this.queue = []),
                  (this.outcome = void 0),
                  u !== s && n(this, u);
              }
              function _(u, w, x) {
                (this.promise = u),
                  typeof w == "function" &&
                    ((this.onFulfilled = w),
                    (this.callFulfilled = this.otherCallFulfilled)),
                  typeof x == "function" &&
                    ((this.onRejected = x),
                    (this.callRejected = this.otherCallRejected));
              }
              function c(u, w, x) {
                a(function () {
                  var D;
                  try {
                    D = w(x);
                  } catch (k) {
                    return i.reject(u, k);
                  }
                  D === u
                    ? i.reject(
                        u,
                        new TypeError("Cannot resolve promise with itself"),
                      )
                    : i.resolve(u, D);
                });
              }
              function m(u) {
                var w = u && u.then;
                if (
                  u &&
                  (typeof u == "object" || typeof u == "function") &&
                  typeof w == "function"
                )
                  return function () {
                    w.apply(u, arguments);
                  };
              }
              function n(u, w) {
                var x = !1;
                function D(T) {
                  x || ((x = !0), i.reject(u, T));
                }
                function k(T) {
                  x || ((x = !0), i.resolve(u, T));
                }
                var P = d(function () {
                  w(k, D);
                });
                P.status === "error" && D(P.value);
              }
              function d(u, w) {
                var x = {};
                try {
                  (x.value = u(w)), (x.status = "success");
                } catch (D) {
                  (x.status = "error"), (x.value = D);
                }
                return x;
              }
              ((g.exports = f).prototype.finally = function (u) {
                if (typeof u != "function") return this;
                var w = this.constructor;
                return this.then(
                  function (x) {
                    return w.resolve(u()).then(function () {
                      return x;
                    });
                  },
                  function (x) {
                    return w.resolve(u()).then(function () {
                      throw x;
                    });
                  },
                );
              }),
                (f.prototype.catch = function (u) {
                  return this.then(null, u);
                }),
                (f.prototype.then = function (u, w) {
                  if (
                    (typeof u != "function" && this.state === p) ||
                    (typeof w != "function" && this.state === o)
                  )
                    return this;
                  var x = new this.constructor(s);
                  return (
                    this.state !== y
                      ? c(x, this.state === p ? u : w, this.outcome)
                      : this.queue.push(new _(x, u, w)),
                    x
                  );
                }),
                (_.prototype.callFulfilled = function (u) {
                  i.resolve(this.promise, u);
                }),
                (_.prototype.otherCallFulfilled = function (u) {
                  c(this.promise, this.onFulfilled, u);
                }),
                (_.prototype.callRejected = function (u) {
                  i.reject(this.promise, u);
                }),
                (_.prototype.otherCallRejected = function (u) {
                  c(this.promise, this.onRejected, u);
                }),
                (i.resolve = function (u, w) {
                  var x = d(m, w);
                  if (x.status === "error") return i.reject(u, x.value);
                  var D = x.value;
                  if (D) n(u, D);
                  else {
                    (u.state = p), (u.outcome = w);
                    for (var k = -1, P = u.queue.length; ++k < P; )
                      u.queue[k].callFulfilled(w);
                  }
                  return u;
                }),
                (i.reject = function (u, w) {
                  (u.state = o), (u.outcome = w);
                  for (var x = -1, D = u.queue.length; ++x < D; )
                    u.queue[x].callRejected(w);
                  return u;
                }),
                (f.resolve = function (u) {
                  return u instanceof this ? u : i.resolve(new this(s), u);
                }),
                (f.reject = function (u) {
                  var w = new this(s);
                  return i.reject(w, u);
                }),
                (f.all = function (u) {
                  var w = this;
                  if (Object.prototype.toString.call(u) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var x = u.length,
                    D = !1;
                  if (!x) return this.resolve([]);
                  for (
                    var k = new Array(x), P = 0, T = -1, U = new this(s);
                    ++T < x;

                  )
                    C(u[T], T);
                  return U;
                  function C(I, N) {
                    w.resolve(I).then(
                      function (b) {
                        (k[N] = b),
                          ++P !== x || D || ((D = !0), i.resolve(U, k));
                      },
                      function (b) {
                        D || ((D = !0), i.reject(U, b));
                      },
                    );
                  }
                }),
                (f.race = function (u) {
                  var w = this;
                  if (Object.prototype.toString.call(u) !== "[object Array]")
                    return this.reject(new TypeError("must be an array"));
                  var x = u.length,
                    D = !1;
                  if (!x) return this.resolve([]);
                  for (var k = -1, P = new this(s); ++k < x; )
                    (T = u[k]),
                      w.resolve(T).then(
                        function (U) {
                          D || ((D = !0), i.resolve(P, U));
                        },
                        function (U) {
                          D || ((D = !0), i.reject(P, U));
                        },
                      );
                  var T;
                  return P;
                });
            },
            { immediate: 36 },
          ],
          38: [
            function (t, g, l) {
              "use strict";
              var a = {};
              (0, t("./lib/utils/common").assign)(
                a,
                t("./lib/deflate"),
                t("./lib/inflate"),
                t("./lib/zlib/constants"),
              ),
                (g.exports = a);
            },
            {
              "./lib/deflate": 39,
              "./lib/inflate": 40,
              "./lib/utils/common": 41,
              "./lib/zlib/constants": 44,
            },
          ],
          39: [
            function (t, g, l) {
              "use strict";
              var a = t("./zlib/deflate"),
                s = t("./utils/common"),
                i = t("./utils/strings"),
                o = t("./zlib/messages"),
                p = t("./zlib/zstream"),
                y = Object.prototype.toString,
                f = 0,
                _ = -1,
                c = 0,
                m = 8;
              function n(u) {
                if (!(this instanceof n)) return new n(u);
                this.options = s.assign(
                  {
                    level: _,
                    method: m,
                    chunkSize: 16384,
                    windowBits: 15,
                    memLevel: 8,
                    strategy: c,
                    to: "",
                  },
                  u || {},
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
                  (this.strm = new p()),
                  (this.strm.avail_out = 0);
                var x = a.deflateInit2(
                  this.strm,
                  w.level,
                  w.method,
                  w.windowBits,
                  w.memLevel,
                  w.strategy,
                );
                if (x !== f) throw new Error(o[x]);
                if (
                  (w.header && a.deflateSetHeader(this.strm, w.header),
                  w.dictionary)
                ) {
                  var D;
                  if (
                    ((D =
                      typeof w.dictionary == "string"
                        ? i.string2buf(w.dictionary)
                        : y.call(w.dictionary) === "[object ArrayBuffer]"
                        ? new Uint8Array(w.dictionary)
                        : w.dictionary),
                    (x = a.deflateSetDictionary(this.strm, D)) !== f)
                  )
                    throw new Error(o[x]);
                  this._dict_set = !0;
                }
              }
              function d(u, w) {
                var x = new n(w);
                if ((x.push(u, !0), x.err)) throw x.msg || o[x.err];
                return x.result;
              }
              (n.prototype.push = function (u, w) {
                var x,
                  D,
                  k = this.strm,
                  P = this.options.chunkSize;
                if (this.ended) return !1;
                (D = w === ~~w ? w : w === !0 ? 4 : 0),
                  typeof u == "string"
                    ? (k.input = i.string2buf(u))
                    : y.call(u) === "[object ArrayBuffer]"
                    ? (k.input = new Uint8Array(u))
                    : (k.input = u),
                  (k.next_in = 0),
                  (k.avail_in = k.input.length);
                do {
                  if (
                    (k.avail_out === 0 &&
                      ((k.output = new s.Buf8(P)),
                      (k.next_out = 0),
                      (k.avail_out = P)),
                    (x = a.deflate(k, D)) !== 1 && x !== f)
                  )
                    return this.onEnd(x), !(this.ended = !0);
                  (k.avail_out !== 0 &&
                    (k.avail_in !== 0 || (D !== 4 && D !== 2))) ||
                    (this.options.to === "string"
                      ? this.onData(
                          i.buf2binstring(s.shrinkBuf(k.output, k.next_out)),
                        )
                      : this.onData(s.shrinkBuf(k.output, k.next_out)));
                } while ((0 < k.avail_in || k.avail_out === 0) && x !== 1);
                return D === 4
                  ? ((x = a.deflateEnd(this.strm)),
                    this.onEnd(x),
                    (this.ended = !0),
                    x === f)
                  : D !== 2 || (this.onEnd(f), !(k.avail_out = 0));
              }),
                (n.prototype.onData = function (u) {
                  this.chunks.push(u);
                }),
                (n.prototype.onEnd = function (u) {
                  u === f &&
                    (this.options.to === "string"
                      ? (this.result = this.chunks.join(""))
                      : (this.result = s.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = u),
                    (this.msg = this.strm.msg);
                }),
                (l.Deflate = n),
                (l.deflate = d),
                (l.deflateRaw = function (u, w) {
                  return ((w = w || {}).raw = !0), d(u, w);
                }),
                (l.gzip = function (u, w) {
                  return ((w = w || {}).gzip = !0), d(u, w);
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
            function (t, g, l) {
              "use strict";
              var a = t("./zlib/inflate"),
                s = t("./utils/common"),
                i = t("./utils/strings"),
                o = t("./zlib/constants"),
                p = t("./zlib/messages"),
                y = t("./zlib/zstream"),
                f = t("./zlib/gzheader"),
                _ = Object.prototype.toString;
              function c(n) {
                if (!(this instanceof c)) return new c(n);
                this.options = s.assign(
                  { chunkSize: 16384, windowBits: 0, to: "" },
                  n || {},
                );
                var d = this.options;
                d.raw &&
                  0 <= d.windowBits &&
                  d.windowBits < 16 &&
                  ((d.windowBits = -d.windowBits),
                  d.windowBits === 0 && (d.windowBits = -15)),
                  !(0 <= d.windowBits && d.windowBits < 16) ||
                    (n && n.windowBits) ||
                    (d.windowBits += 32),
                  15 < d.windowBits &&
                    d.windowBits < 48 &&
                    !(15 & d.windowBits) &&
                    (d.windowBits |= 15),
                  (this.err = 0),
                  (this.msg = ""),
                  (this.ended = !1),
                  (this.chunks = []),
                  (this.strm = new y()),
                  (this.strm.avail_out = 0);
                var u = a.inflateInit2(this.strm, d.windowBits);
                if (u !== o.Z_OK) throw new Error(p[u]);
                (this.header = new f()),
                  a.inflateGetHeader(this.strm, this.header);
              }
              function m(n, d) {
                var u = new c(d);
                if ((u.push(n, !0), u.err)) throw u.msg || p[u.err];
                return u.result;
              }
              (c.prototype.push = function (n, d) {
                var u,
                  w,
                  x,
                  D,
                  k,
                  P,
                  T = this.strm,
                  U = this.options.chunkSize,
                  C = this.options.dictionary,
                  I = !1;
                if (this.ended) return !1;
                (w = d === ~~d ? d : d === !0 ? o.Z_FINISH : o.Z_NO_FLUSH),
                  typeof n == "string"
                    ? (T.input = i.binstring2buf(n))
                    : _.call(n) === "[object ArrayBuffer]"
                    ? (T.input = new Uint8Array(n))
                    : (T.input = n),
                  (T.next_in = 0),
                  (T.avail_in = T.input.length);
                do {
                  if (
                    (T.avail_out === 0 &&
                      ((T.output = new s.Buf8(U)),
                      (T.next_out = 0),
                      (T.avail_out = U)),
                    (u = a.inflate(T, o.Z_NO_FLUSH)) === o.Z_NEED_DICT &&
                      C &&
                      ((P =
                        typeof C == "string"
                          ? i.string2buf(C)
                          : _.call(C) === "[object ArrayBuffer]"
                          ? new Uint8Array(C)
                          : C),
                      (u = a.inflateSetDictionary(this.strm, P))),
                    u === o.Z_BUF_ERROR && I === !0 && ((u = o.Z_OK), (I = !1)),
                    u !== o.Z_STREAM_END && u !== o.Z_OK)
                  )
                    return this.onEnd(u), !(this.ended = !0);
                  T.next_out &&
                    ((T.avail_out !== 0 &&
                      u !== o.Z_STREAM_END &&
                      (T.avail_in !== 0 ||
                        (w !== o.Z_FINISH && w !== o.Z_SYNC_FLUSH))) ||
                      (this.options.to === "string"
                        ? ((x = i.utf8border(T.output, T.next_out)),
                          (D = T.next_out - x),
                          (k = i.buf2string(T.output, x)),
                          (T.next_out = D),
                          (T.avail_out = U - D),
                          D && s.arraySet(T.output, T.output, x, D, 0),
                          this.onData(k))
                        : this.onData(s.shrinkBuf(T.output, T.next_out)))),
                    T.avail_in === 0 && T.avail_out === 0 && (I = !0);
                } while (
                  (0 < T.avail_in || T.avail_out === 0) &&
                  u !== o.Z_STREAM_END
                );
                return (
                  u === o.Z_STREAM_END && (w = o.Z_FINISH),
                  w === o.Z_FINISH
                    ? ((u = a.inflateEnd(this.strm)),
                      this.onEnd(u),
                      (this.ended = !0),
                      u === o.Z_OK)
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
                      : (this.result = s.flattenChunks(this.chunks))),
                    (this.chunks = []),
                    (this.err = n),
                    (this.msg = this.strm.msg);
                }),
                (l.Inflate = c),
                (l.inflate = m),
                (l.inflateRaw = function (n, d) {
                  return ((d = d || {}).raw = !0), m(n, d);
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
            function (t, g, l) {
              "use strict";
              var a =
                typeof Uint8Array < "u" &&
                typeof Uint16Array < "u" &&
                typeof Int32Array < "u";
              (l.assign = function (o) {
                for (
                  var p = Array.prototype.slice.call(arguments, 1);
                  p.length;

                ) {
                  var y = p.shift();
                  if (y) {
                    if (typeof y != "object")
                      throw new TypeError(y + "must be non-object");
                    for (var f in y) y.hasOwnProperty(f) && (o[f] = y[f]);
                  }
                }
                return o;
              }),
                (l.shrinkBuf = function (o, p) {
                  return o.length === p
                    ? o
                    : o.subarray
                    ? o.subarray(0, p)
                    : ((o.length = p), o);
                });
              var s = {
                  arraySet: function (o, p, y, f, _) {
                    if (p.subarray && o.subarray)
                      o.set(p.subarray(y, y + f), _);
                    else for (var c = 0; c < f; c++) o[_ + c] = p[y + c];
                  },
                  flattenChunks: function (o) {
                    var p, y, f, _, c, m;
                    for (p = f = 0, y = o.length; p < y; p++) f += o[p].length;
                    for (
                      m = new Uint8Array(f), p = _ = 0, y = o.length;
                      p < y;
                      p++
                    )
                      (c = o[p]), m.set(c, _), (_ += c.length);
                    return m;
                  },
                },
                i = {
                  arraySet: function (o, p, y, f, _) {
                    for (var c = 0; c < f; c++) o[_ + c] = p[y + c];
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
                    l.assign(l, i));
              }),
                l.setTyped(a);
            },
            {},
          ],
          42: [
            function (t, g, l) {
              "use strict";
              var a = t("./common"),
                s = !0,
                i = !0;
              try {
                String.fromCharCode.apply(null, [0]);
              } catch {
                s = !1;
              }
              try {
                String.fromCharCode.apply(null, new Uint8Array(1));
              } catch {
                i = !1;
              }
              for (var o = new a.Buf8(256), p = 0; p < 256; p++)
                o[p] =
                  252 <= p
                    ? 6
                    : 248 <= p
                    ? 5
                    : 240 <= p
                    ? 4
                    : 224 <= p
                    ? 3
                    : 192 <= p
                    ? 2
                    : 1;
              function y(f, _) {
                if (_ < 65537 && ((f.subarray && i) || (!f.subarray && s)))
                  return String.fromCharCode.apply(null, a.shrinkBuf(f, _));
                for (var c = "", m = 0; m < _; m++)
                  c += String.fromCharCode(f[m]);
                return c;
              }
              (o[254] = o[254] = 1),
                (l.string2buf = function (f) {
                  var _,
                    c,
                    m,
                    n,
                    d,
                    u = f.length,
                    w = 0;
                  for (n = 0; n < u; n++)
                    (64512 & (c = f.charCodeAt(n))) == 55296 &&
                      n + 1 < u &&
                      (64512 & (m = f.charCodeAt(n + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (m - 56320)), n++),
                      (w += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4);
                  for (_ = new a.Buf8(w), n = d = 0; d < w; n++)
                    (64512 & (c = f.charCodeAt(n))) == 55296 &&
                      n + 1 < u &&
                      (64512 & (m = f.charCodeAt(n + 1))) == 56320 &&
                      ((c = 65536 + ((c - 55296) << 10) + (m - 56320)), n++),
                      c < 128
                        ? (_[d++] = c)
                        : (c < 2048
                            ? (_[d++] = 192 | (c >>> 6))
                            : (c < 65536
                                ? (_[d++] = 224 | (c >>> 12))
                                : ((_[d++] = 240 | (c >>> 18)),
                                  (_[d++] = 128 | ((c >>> 12) & 63))),
                              (_[d++] = 128 | ((c >>> 6) & 63))),
                          (_[d++] = 128 | (63 & c)));
                  return _;
                }),
                (l.buf2binstring = function (f) {
                  return y(f, f.length);
                }),
                (l.binstring2buf = function (f) {
                  for (
                    var _ = new a.Buf8(f.length), c = 0, m = _.length;
                    c < m;
                    c++
                  )
                    _[c] = f.charCodeAt(c);
                  return _;
                }),
                (l.buf2string = function (f, _) {
                  var c,
                    m,
                    n,
                    d,
                    u = _ || f.length,
                    w = new Array(2 * u);
                  for (c = m = 0; c < u; )
                    if ((n = f[c++]) < 128) w[m++] = n;
                    else if (4 < (d = o[n])) (w[m++] = 65533), (c += d - 1);
                    else {
                      for (
                        n &= d === 2 ? 31 : d === 3 ? 15 : 7;
                        1 < d && c < u;

                      )
                        (n = (n << 6) | (63 & f[c++])), d--;
                      1 < d
                        ? (w[m++] = 65533)
                        : n < 65536
                        ? (w[m++] = n)
                        : ((n -= 65536),
                          (w[m++] = 55296 | ((n >> 10) & 1023)),
                          (w[m++] = 56320 | (1023 & n)));
                    }
                  return y(w, m);
                }),
                (l.utf8border = function (f, _) {
                  var c;
                  for (
                    (_ = _ || f.length) > f.length && (_ = f.length), c = _ - 1;
                    0 <= c && (192 & f[c]) == 128;

                  )
                    c--;
                  return c < 0 || c === 0 ? _ : c + o[f[c]] > _ ? c : _;
                });
            },
            { "./common": 41 },
          ],
          43: [
            function (t, g, l) {
              "use strict";
              g.exports = function (a, s, i, o) {
                for (
                  var p = (65535 & a) | 0, y = ((a >>> 16) & 65535) | 0, f = 0;
                  i !== 0;

                ) {
                  for (
                    i -= f = 2e3 < i ? 2e3 : i;
                    (y = (y + (p = (p + s[o++]) | 0)) | 0), --f;

                  );
                  (p %= 65521), (y %= 65521);
                }
                return p | (y << 16) | 0;
              };
            },
            {},
          ],
          44: [
            function (t, g, l) {
              "use strict";
              g.exports = {
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
            function (t, g, l) {
              "use strict";
              var a = (function () {
                for (var s, i = [], o = 0; o < 256; o++) {
                  s = o;
                  for (var p = 0; p < 8; p++)
                    s = 1 & s ? 3988292384 ^ (s >>> 1) : s >>> 1;
                  i[o] = s;
                }
                return i;
              })();
              g.exports = function (s, i, o, p) {
                var y = a,
                  f = p + o;
                s ^= -1;
                for (var _ = p; _ < f; _++) s = (s >>> 8) ^ y[255 & (s ^ i[_])];
                return -1 ^ s;
              };
            },
            {},
          ],
          46: [
            function (t, g, l) {
              "use strict";
              var a,
                s = t("../utils/common"),
                i = t("./trees"),
                o = t("./adler32"),
                p = t("./crc32"),
                y = t("./messages"),
                f = 0,
                _ = 4,
                c = 0,
                m = -2,
                n = -1,
                d = 4,
                u = 2,
                w = 8,
                x = 9,
                D = 286,
                k = 30,
                P = 19,
                T = 2 * D + 1,
                U = 15,
                C = 3,
                I = 258,
                N = I + C + 1,
                b = 42,
                S = 113,
                r = 1,
                F = 2,
                q = 3,
                B = 4;
              function J(e, O) {
                return (e.msg = y[O]), O;
              }
              function X(e) {
                return (e << 1) - (4 < e ? 9 : 0);
              }
              function K(e) {
                for (var O = e.length; 0 <= --O; ) e[O] = 0;
              }
              function A(e) {
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
                i._tr_flush_block(
                  e,
                  0 <= e.block_start ? e.block_start : -1,
                  e.strstart - e.block_start,
                  O,
                ),
                  (e.block_start = e.strstart),
                  A(e.strm);
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
                  h = e.max_chain_length,
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
                e.prev_length >= e.good_match && (h >>= 2),
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
                while ((O = W[O & Z]) > z && --h != 0);
                return M <= e.lookahead ? M : e.lookahead;
              }
              function st(e) {
                var O,
                  R,
                  v,
                  h,
                  E,
                  M,
                  L,
                  z,
                  Y,
                  Z,
                  W = e.w_size;
                do {
                  if (
                    ((h = e.window_size - e.lookahead - e.strstart),
                    e.strstart >= W + (W - N))
                  ) {
                    for (
                      s.arraySet(e.window, e.window, W, W, 0),
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
                    h += W;
                  }
                  if (e.strm.avail_in === 0) break;
                  if (
                    ((M = e.strm),
                    (L = e.window),
                    (z = e.strstart + e.lookahead),
                    (Y = h),
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
                              (M.adler = p(M.adler, L, Z, z)),
                          (M.next_in += Z),
                          (M.total_in += Z),
                          Z)),
                    (e.lookahead += R),
                    e.lookahead + e.insert >= C)
                  )
                    for (
                      E = e.strstart - e.insert,
                        e.ins_h = e.window[E],
                        e.ins_h =
                          ((e.ins_h << e.hash_shift) ^ e.window[E + 1]) &
                          e.hash_mask;
                      e.insert &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^ e.window[E + C - 1]) &
                        e.hash_mask),
                      (e.prev[E & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = E),
                      E++,
                      e.insert--,
                      !(e.lookahead + e.insert < C));

                    );
                } while (e.lookahead < N && e.strm.avail_in !== 0);
              }
              function dt(e, O) {
                for (var R, v; ; ) {
                  if (e.lookahead < N) {
                    if ((st(e), e.lookahead < N && O === f)) return r;
                    if (e.lookahead === 0) break;
                  }
                  if (
                    ((R = 0),
                    e.lookahead >= C &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^
                          e.window[e.strstart + C - 1]) &
                        e.hash_mask),
                      (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = e.strstart)),
                    R !== 0 &&
                      e.strstart - R <= e.w_size - N &&
                      (e.match_length = j(e, R)),
                    e.match_length >= C)
                  )
                    if (
                      ((v = i._tr_tally(
                        e,
                        e.strstart - e.match_start,
                        e.match_length - C,
                      )),
                      (e.lookahead -= e.match_length),
                      e.match_length <= e.max_lazy_match && e.lookahead >= C)
                    ) {
                      for (
                        e.match_length--;
                        e.strstart++,
                          (e.ins_h =
                            ((e.ins_h << e.hash_shift) ^
                              e.window[e.strstart + C - 1]) &
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
                    (v = i._tr_tally(e, 0, e.window[e.strstart])),
                      e.lookahead--,
                      e.strstart++;
                  if (v && ($(e, !1), e.strm.avail_out === 0)) return r;
                }
                return (
                  (e.insert = e.strstart < C - 1 ? e.strstart : C - 1),
                  O === _
                    ? ($(e, !0), e.strm.avail_out === 0 ? q : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? r
                    : F
                );
              }
              function tt(e, O) {
                for (var R, v, h; ; ) {
                  if (e.lookahead < N) {
                    if ((st(e), e.lookahead < N && O === f)) return r;
                    if (e.lookahead === 0) break;
                  }
                  if (
                    ((R = 0),
                    e.lookahead >= C &&
                      ((e.ins_h =
                        ((e.ins_h << e.hash_shift) ^
                          e.window[e.strstart + C - 1]) &
                        e.hash_mask),
                      (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                      (e.head[e.ins_h] = e.strstart)),
                    (e.prev_length = e.match_length),
                    (e.prev_match = e.match_start),
                    (e.match_length = C - 1),
                    R !== 0 &&
                      e.prev_length < e.max_lazy_match &&
                      e.strstart - R <= e.w_size - N &&
                      ((e.match_length = j(e, R)),
                      e.match_length <= 5 &&
                        (e.strategy === 1 ||
                          (e.match_length === C &&
                            4096 < e.strstart - e.match_start)) &&
                        (e.match_length = C - 1)),
                    e.prev_length >= C && e.match_length <= e.prev_length)
                  ) {
                    for (
                      h = e.strstart + e.lookahead - C,
                        v = i._tr_tally(
                          e,
                          e.strstart - 1 - e.prev_match,
                          e.prev_length - C,
                        ),
                        e.lookahead -= e.prev_length - 1,
                        e.prev_length -= 2;
                      ++e.strstart <= h &&
                        ((e.ins_h =
                          ((e.ins_h << e.hash_shift) ^
                            e.window[e.strstart + C - 1]) &
                          e.hash_mask),
                        (R = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h]),
                        (e.head[e.ins_h] = e.strstart)),
                        --e.prev_length != 0;

                    );
                    if (
                      ((e.match_available = 0),
                      (e.match_length = C - 1),
                      e.strstart++,
                      v && ($(e, !1), e.strm.avail_out === 0))
                    )
                      return r;
                  } else if (e.match_available) {
                    if (
                      ((v = i._tr_tally(e, 0, e.window[e.strstart - 1])) &&
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
                    ((v = i._tr_tally(e, 0, e.window[e.strstart - 1])),
                    (e.match_available = 0)),
                  (e.insert = e.strstart < C - 1 ? e.strstart : C - 1),
                  O === _
                    ? ($(e, !0), e.strm.avail_out === 0 ? q : B)
                    : e.last_lit && ($(e, !1), e.strm.avail_out === 0)
                    ? r
                    : F
                );
              }
              function nt(e, O, R, v, h) {
                (this.good_length = e),
                  (this.max_lazy = O),
                  (this.nice_length = R),
                  (this.max_chain = v),
                  (this.func = h);
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
                  (this.heap = new s.Buf16(2 * D + 1)),
                  K(this.heap),
                  (this.heap_len = 0),
                  (this.heap_max = 0),
                  (this.depth = new s.Buf16(2 * D + 1)),
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
                    (e.data_type = u),
                    ((O = e.state).pending = 0),
                    (O.pending_out = 0),
                    O.wrap < 0 && (O.wrap = -O.wrap),
                    (O.status = O.wrap ? b : S),
                    (e.adler = O.wrap === 2 ? 0 : 1),
                    (O.last_flush = f),
                    i._tr_init(O),
                    c)
                  : J(e, m);
              }
              function ht(e) {
                var O = ct(e);
                return (
                  O === c &&
                    (function (R) {
                      (R.window_size = 2 * R.w_size),
                        K(R.head),
                        (R.max_lazy_match = a[R.level].max_lazy),
                        (R.good_match = a[R.level].good_length),
                        (R.nice_match = a[R.level].nice_length),
                        (R.max_chain_length = a[R.level].max_chain),
                        (R.strstart = 0),
                        (R.block_start = 0),
                        (R.lookahead = 0),
                        (R.insert = 0),
                        (R.match_length = R.prev_length = C - 1),
                        (R.match_available = 0),
                        (R.ins_h = 0);
                    })(e.state),
                  O
                );
              }
              function gt(e, O, R, v, h, E) {
                if (!e) return m;
                var M = 1;
                if (
                  (O === n && (O = 6),
                  v < 0 ? ((M = 0), (v = -v)) : 15 < v && ((M = 2), (v -= 16)),
                  h < 1 ||
                    x < h ||
                    R !== w ||
                    v < 8 ||
                    15 < v ||
                    O < 0 ||
                    9 < O ||
                    E < 0 ||
                    d < E)
                )
                  return J(e, m);
                v === 8 && (v = 9);
                var L = new rt();
                return (
                  ((e.state = L).strm = e),
                  (L.wrap = M),
                  (L.gzhead = null),
                  (L.w_bits = v),
                  (L.w_size = 1 << L.w_bits),
                  (L.w_mask = L.w_size - 1),
                  (L.hash_bits = h + 7),
                  (L.hash_size = 1 << L.hash_bits),
                  (L.hash_mask = L.hash_size - 1),
                  (L.hash_shift = ~~((L.hash_bits + C - 1) / C)),
                  (L.window = new s.Buf8(2 * L.w_size)),
                  (L.head = new s.Buf16(L.hash_size)),
                  (L.prev = new s.Buf16(L.w_size)),
                  (L.lit_bufsize = 1 << (h + 6)),
                  (L.pending_buf_size = 4 * L.lit_bufsize),
                  (L.pending_buf = new s.Buf8(L.pending_buf_size)),
                  (L.d_buf = 1 * L.lit_bufsize),
                  (L.l_buf = 3 * L.lit_bufsize),
                  (L.level = O),
                  (L.strategy = E),
                  (L.method = R),
                  ht(e)
                );
              }
              (a = [
                new nt(0, 0, 0, 0, function (e, O) {
                  var R = 65535;
                  for (
                    R > e.pending_buf_size - 5 && (R = e.pending_buf_size - 5);
                    ;

                  ) {
                    if (e.lookahead <= 1) {
                      if ((st(e), e.lookahead === 0 && O === f)) return r;
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
                new nt(4, 4, 16, 16, tt),
                new nt(8, 16, 32, 32, tt),
                new nt(8, 16, 128, 128, tt),
                new nt(8, 32, 128, 256, tt),
                new nt(32, 128, 258, 1024, tt),
                new nt(32, 258, 258, 4096, tt),
              ]),
                (l.deflateInit = function (e, O) {
                  return gt(e, O, w, 15, 8, 0);
                }),
                (l.deflateInit2 = gt),
                (l.deflateReset = ht),
                (l.deflateResetKeep = ct),
                (l.deflateSetHeader = function (e, O) {
                  return e && e.state
                    ? e.state.wrap !== 2
                      ? m
                      : ((e.state.gzhead = O), c)
                    : m;
                }),
                (l.deflate = function (e, O) {
                  var R, v, h, E;
                  if (!e || !e.state || 5 < O || O < 0) return e ? J(e, m) : m;
                  if (
                    ((v = e.state),
                    !e.output ||
                      (!e.input && e.avail_in !== 0) ||
                      (v.status === 666 && O !== _))
                  )
                    return J(e, e.avail_out === 0 ? -5 : m);
                  if (
                    ((v.strm = e),
                    (R = v.last_flush),
                    (v.last_flush = O),
                    v.status === b)
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
                              (e.adler = p(
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
                        h = v.pending;
                        v.gzindex < (65535 & v.gzhead.extra.length) &&
                        (v.pending !== v.pending_buf_size ||
                          (v.gzhead.hcrc &&
                            v.pending > h &&
                            (e.adler = p(
                              e.adler,
                              v.pending_buf,
                              v.pending - h,
                              h,
                            )),
                          A(e),
                          (h = v.pending),
                          v.pending !== v.pending_buf_size));

                      )
                        V(v, 255 & v.gzhead.extra[v.gzindex]), v.gzindex++;
                      v.gzhead.hcrc &&
                        v.pending > h &&
                        (e.adler = p(e.adler, v.pending_buf, v.pending - h, h)),
                        v.gzindex === v.gzhead.extra.length &&
                          ((v.gzindex = 0), (v.status = 73));
                    } else v.status = 73;
                  if (v.status === 73)
                    if (v.gzhead.name) {
                      h = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > h &&
                            (e.adler = p(
                              e.adler,
                              v.pending_buf,
                              v.pending - h,
                              h,
                            )),
                          A(e),
                          (h = v.pending),
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
                        v.pending > h &&
                        (e.adler = p(e.adler, v.pending_buf, v.pending - h, h)),
                        E === 0 && ((v.gzindex = 0), (v.status = 91));
                    } else v.status = 91;
                  if (v.status === 91)
                    if (v.gzhead.comment) {
                      h = v.pending;
                      do {
                        if (
                          v.pending === v.pending_buf_size &&
                          (v.gzhead.hcrc &&
                            v.pending > h &&
                            (e.adler = p(
                              e.adler,
                              v.pending_buf,
                              v.pending - h,
                              h,
                            )),
                          A(e),
                          (h = v.pending),
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
                        v.pending > h &&
                        (e.adler = p(e.adler, v.pending_buf, v.pending - h, h)),
                        E === 0 && (v.status = 103);
                    } else v.status = 103;
                  if (
                    (v.status === 103 &&
                      (v.gzhead.hcrc
                        ? (v.pending + 2 > v.pending_buf_size && A(e),
                          v.pending + 2 <= v.pending_buf_size &&
                            (V(v, 255 & e.adler),
                            V(v, (e.adler >> 8) & 255),
                            (e.adler = 0),
                            (v.status = S)))
                        : (v.status = S)),
                    v.pending !== 0)
                  ) {
                    if ((A(e), e.avail_out === 0))
                      return (v.last_flush = -1), c;
                  } else if (e.avail_in === 0 && X(O) <= X(R) && O !== _)
                    return J(e, -5);
                  if (v.status === 666 && e.avail_in !== 0) return J(e, -5);
                  if (
                    e.avail_in !== 0 ||
                    v.lookahead !== 0 ||
                    (O !== f && v.status !== 666)
                  ) {
                    var L =
                      v.strategy === 2
                        ? (function (z, Y) {
                            for (var Z; ; ) {
                              if (
                                z.lookahead === 0 &&
                                (st(z), z.lookahead === 0)
                              ) {
                                if (Y === f) return r;
                                break;
                              }
                              if (
                                ((z.match_length = 0),
                                (Z = i._tr_tally(z, 0, z.window[z.strstart])),
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
                                : F
                            );
                          })(v, O)
                        : v.strategy === 3
                        ? (function (z, Y) {
                            for (var Z, W, Q, at, it = z.window; ; ) {
                              if (z.lookahead <= I) {
                                if ((st(z), z.lookahead <= I && Y === f))
                                  return r;
                                if (z.lookahead === 0) break;
                              }
                              if (
                                ((z.match_length = 0),
                                z.lookahead >= C &&
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
                                (z.match_length >= C
                                  ? ((Z = i._tr_tally(
                                      z,
                                      1,
                                      z.match_length - C,
                                    )),
                                    (z.lookahead -= z.match_length),
                                    (z.strstart += z.match_length),
                                    (z.match_length = 0))
                                  : ((Z = i._tr_tally(
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
                                : F
                            );
                          })(v, O)
                        : a[v.level].func(v, O);
                    if (
                      ((L !== q && L !== B) || (v.status = 666),
                      L === r || L === q)
                    )
                      return e.avail_out === 0 && (v.last_flush = -1), c;
                    if (
                      L === F &&
                      (O === 1
                        ? i._tr_align(v)
                        : O !== 5 &&
                          (i._tr_stored_block(v, 0, 0, !1),
                          O === 3 &&
                            (K(v.head),
                            v.lookahead === 0 &&
                              ((v.strstart = 0),
                              (v.block_start = 0),
                              (v.insert = 0)))),
                      A(e),
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
                      A(e),
                      0 < v.wrap && (v.wrap = -v.wrap),
                      v.pending !== 0 ? c : 1);
                }),
                (l.deflateEnd = function (e) {
                  var O;
                  return e && e.state
                    ? (O = e.state.status) !== b &&
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
                    v,
                    h,
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
                    (E === 1 && R.status !== b) ||
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
                      st(R);
                    R.lookahead >= C;

                  ) {
                    for (
                      v = R.strstart, h = R.lookahead - (C - 1);
                      (R.ins_h =
                        ((R.ins_h << R.hash_shift) ^ R.window[v + C - 1]) &
                        R.hash_mask),
                        (R.prev[v & R.w_mask] = R.head[R.ins_h]),
                        (R.head[R.ins_h] = v),
                        v++,
                        --h;

                    );
                    (R.strstart = v), (R.lookahead = C - 1), st(R);
                  }
                  return (
                    (R.strstart += R.lookahead),
                    (R.block_start = R.strstart),
                    (R.insert = R.lookahead),
                    (R.lookahead = 0),
                    (R.match_length = R.prev_length = C - 1),
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
            function (t, g, l) {
              "use strict";
              g.exports = function () {
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
            function (t, g, l) {
              "use strict";
              g.exports = function (a, s) {
                var i,
                  o,
                  p,
                  y,
                  f,
                  _,
                  c,
                  m,
                  n,
                  d,
                  u,
                  w,
                  x,
                  D,
                  k,
                  P,
                  T,
                  U,
                  C,
                  I,
                  N,
                  b,
                  S,
                  r,
                  F;
                (i = a.state),
                  (o = a.next_in),
                  (r = a.input),
                  (p = o + (a.avail_in - 5)),
                  (y = a.next_out),
                  (F = a.output),
                  (f = y - (s - a.avail_out)),
                  (_ = y + (a.avail_out - 257)),
                  (c = i.dmax),
                  (m = i.wsize),
                  (n = i.whave),
                  (d = i.wnext),
                  (u = i.window),
                  (w = i.hold),
                  (x = i.bits),
                  (D = i.lencode),
                  (k = i.distcode),
                  (P = (1 << i.lenbits) - 1),
                  (T = (1 << i.distbits) - 1);
                t: do {
                  x < 15 &&
                    ((w += r[o++] << x),
                    (x += 8),
                    (w += r[o++] << x),
                    (x += 8)),
                    (U = D[w & P]);
                  e: for (;;) {
                    if (
                      ((w >>>= C = U >>> 24),
                      (x -= C),
                      (C = (U >>> 16) & 255) === 0)
                    )
                      F[y++] = 65535 & U;
                    else {
                      if (!(16 & C)) {
                        if (!(64 & C)) {
                          U = D[(65535 & U) + (w & ((1 << C) - 1))];
                          continue e;
                        }
                        if (32 & C) {
                          i.mode = 12;
                          break t;
                        }
                        (a.msg = "invalid literal/length code"), (i.mode = 30);
                        break t;
                      }
                      (I = 65535 & U),
                        (C &= 15) &&
                          (x < C && ((w += r[o++] << x), (x += 8)),
                          (I += w & ((1 << C) - 1)),
                          (w >>>= C),
                          (x -= C)),
                        x < 15 &&
                          ((w += r[o++] << x),
                          (x += 8),
                          (w += r[o++] << x),
                          (x += 8)),
                        (U = k[w & T]);
                      r: for (;;) {
                        if (
                          ((w >>>= C = U >>> 24),
                          (x -= C),
                          !(16 & (C = (U >>> 16) & 255)))
                        ) {
                          if (!(64 & C)) {
                            U = k[(65535 & U) + (w & ((1 << C) - 1))];
                            continue r;
                          }
                          (a.msg = "invalid distance code"), (i.mode = 30);
                          break t;
                        }
                        if (
                          ((N = 65535 & U),
                          x < (C &= 15) &&
                            ((w += r[o++] << x),
                            (x += 8) < C && ((w += r[o++] << x), (x += 8))),
                          c < (N += w & ((1 << C) - 1)))
                        ) {
                          (a.msg = "invalid distance too far back"),
                            (i.mode = 30);
                          break t;
                        }
                        if (((w >>>= C), (x -= C), (C = y - f) < N)) {
                          if (n < (C = N - C) && i.sane) {
                            (a.msg = "invalid distance too far back"),
                              (i.mode = 30);
                            break t;
                          }
                          if (((S = u), (b = 0) === d)) {
                            if (((b += m - C), C < I)) {
                              for (I -= C; (F[y++] = u[b++]), --C; );
                              (b = y - N), (S = F);
                            }
                          } else if (d < C) {
                            if (((b += m + d - C), (C -= d) < I)) {
                              for (I -= C; (F[y++] = u[b++]), --C; );
                              if (((b = 0), d < I)) {
                                for (I -= C = d; (F[y++] = u[b++]), --C; );
                                (b = y - N), (S = F);
                              }
                            }
                          } else if (((b += d - C), C < I)) {
                            for (I -= C; (F[y++] = u[b++]), --C; );
                            (b = y - N), (S = F);
                          }
                          for (; 2 < I; )
                            (F[y++] = S[b++]),
                              (F[y++] = S[b++]),
                              (F[y++] = S[b++]),
                              (I -= 3);
                          I && ((F[y++] = S[b++]), 1 < I && (F[y++] = S[b++]));
                        } else {
                          for (
                            b = y - N;
                            (F[y++] = F[b++]),
                              (F[y++] = F[b++]),
                              (F[y++] = F[b++]),
                              2 < (I -= 3);

                          );
                          I && ((F[y++] = F[b++]), 1 < I && (F[y++] = F[b++]));
                        }
                        break;
                      }
                    }
                    break;
                  }
                } while (o < p && y < _);
                (o -= I = x >> 3),
                  (w &= (1 << (x -= I << 3)) - 1),
                  (a.next_in = o),
                  (a.next_out = y),
                  (a.avail_in = o < p ? p - o + 5 : 5 - (o - p)),
                  (a.avail_out = y < _ ? _ - y + 257 : 257 - (y - _)),
                  (i.hold = w),
                  (i.bits = x);
              };
            },
            {},
          ],
          49: [
            function (t, g, l) {
              "use strict";
              var a = t("../utils/common"),
                s = t("./adler32"),
                i = t("./crc32"),
                o = t("./inffast"),
                p = t("./inftrees"),
                y = 1,
                f = 2,
                _ = 0,
                c = -2,
                m = 1,
                n = 852,
                d = 592;
              function u(b) {
                return (
                  ((b >>> 24) & 255) +
                  ((b >>> 8) & 65280) +
                  ((65280 & b) << 8) +
                  ((255 & b) << 24)
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
                  (this.lens = new a.Buf16(320)),
                  (this.work = new a.Buf16(288)),
                  (this.lendyn = null),
                  (this.distdyn = null),
                  (this.sane = 0),
                  (this.back = 0),
                  (this.was = 0);
              }
              function x(b) {
                var S;
                return b && b.state
                  ? ((S = b.state),
                    (b.total_in = b.total_out = S.total = 0),
                    (b.msg = ""),
                    S.wrap && (b.adler = 1 & S.wrap),
                    (S.mode = m),
                    (S.last = 0),
                    (S.havedict = 0),
                    (S.dmax = 32768),
                    (S.head = null),
                    (S.hold = 0),
                    (S.bits = 0),
                    (S.lencode = S.lendyn = new a.Buf32(n)),
                    (S.distcode = S.distdyn = new a.Buf32(d)),
                    (S.sane = 1),
                    (S.back = -1),
                    _)
                  : c;
              }
              function D(b) {
                var S;
                return b && b.state
                  ? (((S = b.state).wsize = 0),
                    (S.whave = 0),
                    (S.wnext = 0),
                    x(b))
                  : c;
              }
              function k(b, S) {
                var r, F;
                return b && b.state
                  ? ((F = b.state),
                    S < 0
                      ? ((r = 0), (S = -S))
                      : ((r = 1 + (S >> 4)), S < 48 && (S &= 15)),
                    S && (S < 8 || 15 < S)
                      ? c
                      : (F.window !== null &&
                          F.wbits !== S &&
                          (F.window = null),
                        (F.wrap = r),
                        (F.wbits = S),
                        D(b)))
                  : c;
              }
              function P(b, S) {
                var r, F;
                return b
                  ? ((F = new w()),
                    ((b.state = F).window = null),
                    (r = k(b, S)) !== _ && (b.state = null),
                    r)
                  : c;
              }
              var T,
                U,
                C = !0;
              function I(b) {
                if (C) {
                  var S;
                  for (
                    T = new a.Buf32(512), U = new a.Buf32(32), S = 0;
                    S < 144;

                  )
                    b.lens[S++] = 8;
                  for (; S < 256; ) b.lens[S++] = 9;
                  for (; S < 280; ) b.lens[S++] = 7;
                  for (; S < 288; ) b.lens[S++] = 8;
                  for (
                    p(y, b.lens, 0, 288, T, 0, b.work, { bits: 9 }), S = 0;
                    S < 32;

                  )
                    b.lens[S++] = 5;
                  p(f, b.lens, 0, 32, U, 0, b.work, { bits: 5 }), (C = !1);
                }
                (b.lencode = T),
                  (b.lenbits = 9),
                  (b.distcode = U),
                  (b.distbits = 5);
              }
              function N(b, S, r, F) {
                var q,
                  B = b.state;
                return (
                  B.window === null &&
                    ((B.wsize = 1 << B.wbits),
                    (B.wnext = 0),
                    (B.whave = 0),
                    (B.window = new a.Buf8(B.wsize))),
                  F >= B.wsize
                    ? (a.arraySet(B.window, S, r - B.wsize, B.wsize, 0),
                      (B.wnext = 0),
                      (B.whave = B.wsize))
                    : (F < (q = B.wsize - B.wnext) && (q = F),
                      a.arraySet(B.window, S, r - F, q, B.wnext),
                      (F -= q)
                        ? (a.arraySet(B.window, S, r - F, F, 0),
                          (B.wnext = F),
                          (B.whave = B.wsize))
                        : ((B.wnext += q),
                          B.wnext === B.wsize && (B.wnext = 0),
                          B.whave < B.wsize && (B.whave += q))),
                  0
                );
              }
              (l.inflateReset = D),
                (l.inflateReset2 = k),
                (l.inflateResetKeep = x),
                (l.inflateInit = function (b) {
                  return P(b, 15);
                }),
                (l.inflateInit2 = P),
                (l.inflate = function (b, S) {
                  var r,
                    F,
                    q,
                    B,
                    J,
                    X,
                    K,
                    A,
                    $,
                    V,
                    G,
                    j,
                    st,
                    dt,
                    tt,
                    nt,
                    rt,
                    ct,
                    ht,
                    gt,
                    e,
                    O,
                    R,
                    v,
                    h = 0,
                    E = new a.Buf8(4),
                    M = [
                      16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14,
                      1, 15,
                    ];
                  if (
                    !b ||
                    !b.state ||
                    !b.output ||
                    (!b.input && b.avail_in !== 0)
                  )
                    return c;
                  (r = b.state).mode === 12 && (r.mode = 13),
                    (J = b.next_out),
                    (q = b.output),
                    (K = b.avail_out),
                    (B = b.next_in),
                    (F = b.input),
                    (X = b.avail_in),
                    (A = r.hold),
                    ($ = r.bits),
                    (V = X),
                    (G = K),
                    (O = _);
                  t: for (;;)
                    switch (r.mode) {
                      case m:
                        if (r.wrap === 0) {
                          r.mode = 13;
                          break;
                        }
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if (2 & r.wrap && A === 35615) {
                          (E[(r.check = 0)] = 255 & A),
                            (E[1] = (A >>> 8) & 255),
                            (r.check = i(r.check, E, 2, 0)),
                            ($ = A = 0),
                            (r.mode = 2);
                          break;
                        }
                        if (
                          ((r.flags = 0),
                          r.head && (r.head.done = !1),
                          !(1 & r.wrap) || (((255 & A) << 8) + (A >> 8)) % 31)
                        ) {
                          (b.msg = "incorrect header check"), (r.mode = 30);
                          break;
                        }
                        if ((15 & A) != 8) {
                          (b.msg = "unknown compression method"), (r.mode = 30);
                          break;
                        }
                        if (
                          (($ -= 4), (e = 8 + (15 & (A >>>= 4))), r.wbits === 0)
                        )
                          r.wbits = e;
                        else if (e > r.wbits) {
                          (b.msg = "invalid window size"), (r.mode = 30);
                          break;
                        }
                        (r.dmax = 1 << e),
                          (b.adler = r.check = 1),
                          (r.mode = 512 & A ? 10 : 12),
                          ($ = A = 0);
                        break;
                      case 2:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if (((r.flags = A), (255 & r.flags) != 8)) {
                          (b.msg = "unknown compression method"), (r.mode = 30);
                          break;
                        }
                        if (57344 & r.flags) {
                          (b.msg = "unknown header flags set"), (r.mode = 30);
                          break;
                        }
                        r.head && (r.head.text = (A >> 8) & 1),
                          512 & r.flags &&
                            ((E[0] = 255 & A),
                            (E[1] = (A >>> 8) & 255),
                            (r.check = i(r.check, E, 2, 0))),
                          ($ = A = 0),
                          (r.mode = 3);
                      case 3:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        r.head && (r.head.time = A),
                          512 & r.flags &&
                            ((E[0] = 255 & A),
                            (E[1] = (A >>> 8) & 255),
                            (E[2] = (A >>> 16) & 255),
                            (E[3] = (A >>> 24) & 255),
                            (r.check = i(r.check, E, 4, 0))),
                          ($ = A = 0),
                          (r.mode = 4);
                      case 4:
                        for (; $ < 16; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        r.head &&
                          ((r.head.xflags = 255 & A), (r.head.os = A >> 8)),
                          512 & r.flags &&
                            ((E[0] = 255 & A),
                            (E[1] = (A >>> 8) & 255),
                            (r.check = i(r.check, E, 2, 0))),
                          ($ = A = 0),
                          (r.mode = 5);
                      case 5:
                        if (1024 & r.flags) {
                          for (; $ < 16; ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (r.length = A),
                            r.head && (r.head.extra_len = A),
                            512 & r.flags &&
                              ((E[0] = 255 & A),
                              (E[1] = (A >>> 8) & 255),
                              (r.check = i(r.check, E, 2, 0))),
                            ($ = A = 0);
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
                              a.arraySet(r.head.extra, F, B, j, e)),
                            512 & r.flags && (r.check = i(r.check, F, j, B)),
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
                            (e = F[B + j++]),
                              r.head &&
                                e &&
                                r.length < 65536 &&
                                (r.head.name += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & r.flags && (r.check = i(r.check, F, j, B)),
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
                            (e = F[B + j++]),
                              r.head &&
                                e &&
                                r.length < 65536 &&
                                (r.head.comment += String.fromCharCode(e)),
                              e && j < X;

                          );
                          if (
                            (512 & r.flags && (r.check = i(r.check, F, j, B)),
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
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          if (A !== (65535 & r.check)) {
                            (b.msg = "header crc mismatch"), (r.mode = 30);
                            break;
                          }
                          $ = A = 0;
                        }
                        r.head &&
                          ((r.head.hcrc = (r.flags >> 9) & 1),
                          (r.head.done = !0)),
                          (b.adler = r.check = 0),
                          (r.mode = 12);
                        break;
                      case 10:
                        for (; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        (b.adler = r.check = u(A)), ($ = A = 0), (r.mode = 11);
                      case 11:
                        if (r.havedict === 0)
                          return (
                            (b.next_out = J),
                            (b.avail_out = K),
                            (b.next_in = B),
                            (b.avail_in = X),
                            (r.hold = A),
                            (r.bits = $),
                            2
                          );
                        (b.adler = r.check = 1), (r.mode = 12);
                      case 12:
                        if (S === 5 || S === 6) break t;
                      case 13:
                        if (r.last) {
                          (A >>>= 7 & $), ($ -= 7 & $), (r.mode = 27);
                          break;
                        }
                        for (; $ < 3; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        switch (((r.last = 1 & A), ($ -= 1), 3 & (A >>>= 1))) {
                          case 0:
                            r.mode = 14;
                            break;
                          case 1:
                            if ((I(r), (r.mode = 20), S !== 6)) break;
                            (A >>>= 2), ($ -= 2);
                            break t;
                          case 2:
                            r.mode = 17;
                            break;
                          case 3:
                            (b.msg = "invalid block type"), (r.mode = 30);
                        }
                        (A >>>= 2), ($ -= 2);
                        break;
                      case 14:
                        for (A >>>= 7 & $, $ -= 7 & $; $ < 32; ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if ((65535 & A) != ((A >>> 16) ^ 65535)) {
                          (b.msg = "invalid stored block lengths"),
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.length = 65535 & A),
                          ($ = A = 0),
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
                          a.arraySet(q, F, B, j, J),
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
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if (
                          ((r.nlen = 257 + (31 & A)),
                          (A >>>= 5),
                          ($ -= 5),
                          (r.ndist = 1 + (31 & A)),
                          (A >>>= 5),
                          ($ -= 5),
                          (r.ncode = 4 + (15 & A)),
                          (A >>>= 4),
                          ($ -= 4),
                          286 < r.nlen || 30 < r.ndist)
                        ) {
                          (b.msg = "too many length or distance symbols"),
                            (r.mode = 30);
                          break;
                        }
                        (r.have = 0), (r.mode = 18);
                      case 18:
                        for (; r.have < r.ncode; ) {
                          for (; $ < 3; ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (r.lens[M[r.have++]] = 7 & A), (A >>>= 3), ($ -= 3);
                        }
                        for (; r.have < 19; ) r.lens[M[r.have++]] = 0;
                        if (
                          ((r.lencode = r.lendyn),
                          (r.lenbits = 7),
                          (R = { bits: r.lenbits }),
                          (O = p(0, r.lens, 0, 19, r.lencode, 0, r.work, R)),
                          (r.lenbits = R.bits),
                          O)
                        ) {
                          (b.msg = "invalid code lengths set"), (r.mode = 30);
                          break;
                        }
                        (r.have = 0), (r.mode = 19);
                      case 19:
                        for (; r.have < r.nlen + r.ndist; ) {
                          for (
                            ;
                            (nt =
                              ((h = r.lencode[A & ((1 << r.lenbits) - 1)]) >>>
                                16) &
                              255),
                              (rt = 65535 & h),
                              !((tt = h >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          if (rt < 16)
                            (A >>>= tt), ($ -= tt), (r.lens[r.have++] = rt);
                          else {
                            if (rt === 16) {
                              for (v = tt + 2; $ < v; ) {
                                if (X === 0) break t;
                                X--, (A += F[B++] << $), ($ += 8);
                              }
                              if (((A >>>= tt), ($ -= tt), r.have === 0)) {
                                (b.msg = "invalid bit length repeat"),
                                  (r.mode = 30);
                                break;
                              }
                              (e = r.lens[r.have - 1]),
                                (j = 3 + (3 & A)),
                                (A >>>= 2),
                                ($ -= 2);
                            } else if (rt === 17) {
                              for (v = tt + 3; $ < v; ) {
                                if (X === 0) break t;
                                X--, (A += F[B++] << $), ($ += 8);
                              }
                              ($ -= tt),
                                (e = 0),
                                (j = 3 + (7 & (A >>>= tt))),
                                (A >>>= 3),
                                ($ -= 3);
                            } else {
                              for (v = tt + 7; $ < v; ) {
                                if (X === 0) break t;
                                X--, (A += F[B++] << $), ($ += 8);
                              }
                              ($ -= tt),
                                (e = 0),
                                (j = 11 + (127 & (A >>>= tt))),
                                (A >>>= 7),
                                ($ -= 7);
                            }
                            if (r.have + j > r.nlen + r.ndist) {
                              (b.msg = "invalid bit length repeat"),
                                (r.mode = 30);
                              break;
                            }
                            for (; j--; ) r.lens[r.have++] = e;
                          }
                        }
                        if (r.mode === 30) break;
                        if (r.lens[256] === 0) {
                          (b.msg = "invalid code -- missing end-of-block"),
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.lenbits = 9),
                          (R = { bits: r.lenbits }),
                          (O = p(
                            y,
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
                          (b.msg = "invalid literal/lengths set"),
                            (r.mode = 30);
                          break;
                        }
                        if (
                          ((r.distbits = 6),
                          (r.distcode = r.distdyn),
                          (R = { bits: r.distbits }),
                          (O = p(
                            f,
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
                          (b.msg = "invalid distances set"), (r.mode = 30);
                          break;
                        }
                        if (((r.mode = 20), S === 6)) break t;
                      case 20:
                        r.mode = 21;
                      case 21:
                        if (6 <= X && 258 <= K) {
                          (b.next_out = J),
                            (b.avail_out = K),
                            (b.next_in = B),
                            (b.avail_in = X),
                            (r.hold = A),
                            (r.bits = $),
                            o(b, G),
                            (J = b.next_out),
                            (q = b.output),
                            (K = b.avail_out),
                            (B = b.next_in),
                            (F = b.input),
                            (X = b.avail_in),
                            (A = r.hold),
                            ($ = r.bits),
                            r.mode === 12 && (r.back = -1);
                          break;
                        }
                        for (
                          r.back = 0;
                          (nt =
                            ((h = r.lencode[A & ((1 << r.lenbits) - 1)]) >>>
                              16) &
                            255),
                            (rt = 65535 & h),
                            !((tt = h >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if (nt && !(240 & nt)) {
                          for (
                            ct = tt, ht = nt, gt = rt;
                            (nt =
                              ((h =
                                r.lencode[
                                  gt + ((A & ((1 << (ct + ht)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (rt = 65535 & h),
                              !(ct + (tt = h >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (A >>>= ct), ($ -= ct), (r.back += ct);
                        }
                        if (
                          ((A >>>= tt),
                          ($ -= tt),
                          (r.back += tt),
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
                          (b.msg = "invalid literal/length code"),
                            (r.mode = 30);
                          break;
                        }
                        (r.extra = 15 & nt), (r.mode = 22);
                      case 22:
                        if (r.extra) {
                          for (v = r.extra; $ < v; ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (r.length += A & ((1 << r.extra) - 1)),
                            (A >>>= r.extra),
                            ($ -= r.extra),
                            (r.back += r.extra);
                        }
                        (r.was = r.length), (r.mode = 23);
                      case 23:
                        for (
                          ;
                          (nt =
                            ((h = r.distcode[A & ((1 << r.distbits) - 1)]) >>>
                              16) &
                            255),
                            (rt = 65535 & h),
                            !((tt = h >>> 24) <= $);

                        ) {
                          if (X === 0) break t;
                          X--, (A += F[B++] << $), ($ += 8);
                        }
                        if (!(240 & nt)) {
                          for (
                            ct = tt, ht = nt, gt = rt;
                            (nt =
                              ((h =
                                r.distcode[
                                  gt + ((A & ((1 << (ct + ht)) - 1)) >> ct)
                                ]) >>>
                                16) &
                              255),
                              (rt = 65535 & h),
                              !(ct + (tt = h >>> 24) <= $);

                          ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (A >>>= ct), ($ -= ct), (r.back += ct);
                        }
                        if (((A >>>= tt), ($ -= tt), (r.back += tt), 64 & nt)) {
                          (b.msg = "invalid distance code"), (r.mode = 30);
                          break;
                        }
                        (r.offset = rt), (r.extra = 15 & nt), (r.mode = 24);
                      case 24:
                        if (r.extra) {
                          for (v = r.extra; $ < v; ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          (r.offset += A & ((1 << r.extra) - 1)),
                            (A >>>= r.extra),
                            ($ -= r.extra),
                            (r.back += r.extra);
                        }
                        if (r.offset > r.dmax) {
                          (b.msg = "invalid distance too far back"),
                            (r.mode = 30);
                          break;
                        }
                        r.mode = 25;
                      case 25:
                        if (K === 0) break t;
                        if (((j = G - K), r.offset > j)) {
                          if ((j = r.offset - j) > r.whave && r.sane) {
                            (b.msg = "invalid distance too far back"),
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
                            X--, (A |= F[B++] << $), ($ += 8);
                          }
                          if (
                            ((G -= K),
                            (b.total_out += G),
                            (r.total += G),
                            G &&
                              (b.adler = r.check =
                                r.flags
                                  ? i(r.check, q, G, J - G)
                                  : s(r.check, q, G, J - G)),
                            (G = K),
                            (r.flags ? A : u(A)) !== r.check)
                          ) {
                            (b.msg = "incorrect data check"), (r.mode = 30);
                            break;
                          }
                          $ = A = 0;
                        }
                        r.mode = 28;
                      case 28:
                        if (r.wrap && r.flags) {
                          for (; $ < 32; ) {
                            if (X === 0) break t;
                            X--, (A += F[B++] << $), ($ += 8);
                          }
                          if (A !== (4294967295 & r.total)) {
                            (b.msg = "incorrect length check"), (r.mode = 30);
                            break;
                          }
                          $ = A = 0;
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
                    (b.next_out = J),
                    (b.avail_out = K),
                    (b.next_in = B),
                    (b.avail_in = X),
                    (r.hold = A),
                    (r.bits = $),
                    (r.wsize ||
                      (G !== b.avail_out &&
                        r.mode < 30 &&
                        (r.mode < 27 || S !== 4))) &&
                    N(b, b.output, b.next_out, G - b.avail_out)
                      ? ((r.mode = 31), -4)
                      : ((V -= b.avail_in),
                        (G -= b.avail_out),
                        (b.total_in += V),
                        (b.total_out += G),
                        (r.total += G),
                        r.wrap &&
                          G &&
                          (b.adler = r.check =
                            r.flags
                              ? i(r.check, q, G, b.next_out - G)
                              : s(r.check, q, G, b.next_out - G)),
                        (b.data_type =
                          r.bits +
                          (r.last ? 64 : 0) +
                          (r.mode === 12 ? 128 : 0) +
                          (r.mode === 20 || r.mode === 15 ? 256 : 0)),
                        ((V == 0 && G === 0) || S === 4) && O === _ && (O = -5),
                        O)
                  );
                }),
                (l.inflateEnd = function (b) {
                  if (!b || !b.state) return c;
                  var S = b.state;
                  return S.window && (S.window = null), (b.state = null), _;
                }),
                (l.inflateGetHeader = function (b, S) {
                  var r;
                  return b && b.state && 2 & (r = b.state).wrap
                    ? (((r.head = S).done = !1), _)
                    : c;
                }),
                (l.inflateSetDictionary = function (b, S) {
                  var r,
                    F = S.length;
                  return b && b.state
                    ? (r = b.state).wrap !== 0 && r.mode !== 11
                      ? c
                      : r.mode === 11 && s(1, S, F, 0) !== r.check
                      ? -3
                      : N(b, S, F, F)
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
            function (t, g, l) {
              "use strict";
              var a = t("../utils/common"),
                s = [
                  3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35,
                  43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
                ],
                i = [
                  16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18,
                  18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72,
                  78,
                ],
                o = [
                  1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
                  257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193,
                  12289, 16385, 24577, 0, 0,
                ],
                p = [
                  16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22,
                  22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29,
                  64, 64,
                ];
              g.exports = function (y, f, _, c, m, n, d, u) {
                var w,
                  x,
                  D,
                  k,
                  P,
                  T,
                  U,
                  C,
                  I,
                  N = u.bits,
                  b = 0,
                  S = 0,
                  r = 0,
                  F = 0,
                  q = 0,
                  B = 0,
                  J = 0,
                  X = 0,
                  K = 0,
                  A = 0,
                  $ = null,
                  V = 0,
                  G = new a.Buf16(16),
                  j = new a.Buf16(16),
                  st = null,
                  dt = 0;
                for (b = 0; b <= 15; b++) G[b] = 0;
                for (S = 0; S < c; S++) G[f[_ + S]]++;
                for (q = N, F = 15; 1 <= F && G[F] === 0; F--);
                if ((F < q && (q = F), F === 0))
                  return (
                    (m[n++] = 20971520), (m[n++] = 20971520), (u.bits = 1), 0
                  );
                for (r = 1; r < F && G[r] === 0; r++);
                for (q < r && (q = r), b = X = 1; b <= 15; b++)
                  if (((X <<= 1), (X -= G[b]) < 0)) return -1;
                if (0 < X && (y === 0 || F !== 1)) return -1;
                for (j[1] = 0, b = 1; b < 15; b++) j[b + 1] = j[b] + G[b];
                for (S = 0; S < c; S++)
                  f[_ + S] !== 0 && (d[j[f[_ + S]]++] = S);
                if (
                  ((T =
                    y === 0
                      ? (($ = st = d), 19)
                      : y === 1
                      ? (($ = s), (V -= 257), (st = i), (dt -= 257), 256)
                      : (($ = o), (st = p), -1)),
                  (b = r),
                  (P = n),
                  (J = S = A = 0),
                  (D = -1),
                  (k = (K = 1 << (B = q)) - 1),
                  (y === 1 && 852 < K) || (y === 2 && 592 < K))
                )
                  return 1;
                for (;;) {
                  for (
                    U = b - J,
                      I =
                        d[S] < T
                          ? ((C = 0), d[S])
                          : d[S] > T
                          ? ((C = st[dt + d[S]]), $[V + d[S]])
                          : ((C = 96), 0),
                      w = 1 << (b - J),
                      r = x = 1 << B;
                    (m[P + (A >> J) + (x -= w)] =
                      (U << 24) | (C << 16) | I | 0),
                      x !== 0;

                  );
                  for (w = 1 << (b - 1); A & w; ) w >>= 1;
                  if (
                    (w !== 0 ? ((A &= w - 1), (A += w)) : (A = 0),
                    S++,
                    --G[b] == 0)
                  ) {
                    if (b === F) break;
                    b = f[_ + d[S]];
                  }
                  if (q < b && (A & k) !== D) {
                    for (
                      J === 0 && (J = q), P += r, X = 1 << (B = b - J);
                      B + J < F && !((X -= G[B + J]) <= 0);

                    )
                      B++, (X <<= 1);
                    if (
                      ((K += 1 << B),
                      (y === 1 && 852 < K) || (y === 2 && 592 < K))
                    )
                      return 1;
                    m[(D = A & k)] = (q << 24) | (B << 16) | (P - n) | 0;
                  }
                }
                return (
                  A !== 0 && (m[P + A] = ((b - J) << 24) | (64 << 16) | 0),
                  (u.bits = q),
                  0
                );
              };
            },
            { "../utils/common": 41 },
          ],
          51: [
            function (t, g, l) {
              "use strict";
              g.exports = {
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
            function (t, g, l) {
              "use strict";
              var a = t("../utils/common"),
                s = 0,
                i = 1;
              function o(h) {
                for (var E = h.length; 0 <= --E; ) h[E] = 0;
              }
              var p = 0,
                y = 29,
                f = 256,
                _ = f + 1 + y,
                c = 30,
                m = 19,
                n = 2 * _ + 1,
                d = 15,
                u = 16,
                w = 7,
                x = 256,
                D = 16,
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
                C = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
                I = [
                  16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1,
                  15,
                ],
                N = new Array(2 * (_ + 2));
              o(N);
              var b = new Array(2 * c);
              o(b);
              var S = new Array(512);
              o(S);
              var r = new Array(256);
              o(r);
              var F = new Array(y);
              o(F);
              var q,
                B,
                J,
                X = new Array(c);
              function K(h, E, M, L, z) {
                (this.static_tree = h),
                  (this.extra_bits = E),
                  (this.extra_base = M),
                  (this.elems = L),
                  (this.max_length = z),
                  (this.has_stree = h && h.length);
              }
              function A(h, E) {
                (this.dyn_tree = h), (this.max_code = 0), (this.stat_desc = E);
              }
              function $(h) {
                return h < 256 ? S[h] : S[256 + (h >>> 7)];
              }
              function V(h, E) {
                (h.pending_buf[h.pending++] = 255 & E),
                  (h.pending_buf[h.pending++] = (E >>> 8) & 255);
              }
              function G(h, E, M) {
                h.bi_valid > u - M
                  ? ((h.bi_buf |= (E << h.bi_valid) & 65535),
                    V(h, h.bi_buf),
                    (h.bi_buf = E >> (u - h.bi_valid)),
                    (h.bi_valid += M - u))
                  : ((h.bi_buf |= (E << h.bi_valid) & 65535),
                    (h.bi_valid += M));
              }
              function j(h, E, M) {
                G(h, M[2 * E], M[2 * E + 1]);
              }
              function st(h, E) {
                for (var M = 0; (M |= 1 & h), (h >>>= 1), (M <<= 1), 0 < --E; );
                return M >>> 1;
              }
              function dt(h, E, M) {
                var L,
                  z,
                  Y = new Array(d + 1),
                  Z = 0;
                for (L = 1; L <= d; L++) Y[L] = Z = (Z + M[L - 1]) << 1;
                for (z = 0; z <= E; z++) {
                  var W = h[2 * z + 1];
                  W !== 0 && (h[2 * z] = st(Y[W]++, W));
                }
              }
              function tt(h) {
                var E;
                for (E = 0; E < _; E++) h.dyn_ltree[2 * E] = 0;
                for (E = 0; E < c; E++) h.dyn_dtree[2 * E] = 0;
                for (E = 0; E < m; E++) h.bl_tree[2 * E] = 0;
                (h.dyn_ltree[2 * x] = 1),
                  (h.opt_len = h.static_len = 0),
                  (h.last_lit = h.matches = 0);
              }
              function nt(h) {
                8 < h.bi_valid
                  ? V(h, h.bi_buf)
                  : 0 < h.bi_valid && (h.pending_buf[h.pending++] = h.bi_buf),
                  (h.bi_buf = 0),
                  (h.bi_valid = 0);
              }
              function rt(h, E, M, L) {
                var z = 2 * E,
                  Y = 2 * M;
                return h[z] < h[Y] || (h[z] === h[Y] && L[E] <= L[M]);
              }
              function ct(h, E, M) {
                for (
                  var L = h.heap[M], z = M << 1;
                  z <= h.heap_len &&
                  (z < h.heap_len &&
                    rt(E, h.heap[z + 1], h.heap[z], h.depth) &&
                    z++,
                  !rt(E, L, h.heap[z], h.depth));

                )
                  (h.heap[M] = h.heap[z]), (M = z), (z <<= 1);
                h.heap[M] = L;
              }
              function ht(h, E, M) {
                var L,
                  z,
                  Y,
                  Z,
                  W = 0;
                if (h.last_lit !== 0)
                  for (
                    ;
                    (L =
                      (h.pending_buf[h.d_buf + 2 * W] << 8) |
                      h.pending_buf[h.d_buf + 2 * W + 1]),
                      (z = h.pending_buf[h.l_buf + W]),
                      W++,
                      L === 0
                        ? j(h, z, E)
                        : (j(h, (Y = r[z]) + f + 1, E),
                          (Z = T[Y]) !== 0 && G(h, (z -= F[Y]), Z),
                          j(h, (Y = $(--L)), M),
                          (Z = U[Y]) !== 0 && G(h, (L -= X[Y]), Z)),
                      W < h.last_lit;

                  );
                j(h, x, E);
              }
              function gt(h, E) {
                var M,
                  L,
                  z,
                  Y = E.dyn_tree,
                  Z = E.stat_desc.static_tree,
                  W = E.stat_desc.has_stree,
                  Q = E.stat_desc.elems,
                  at = -1;
                for (h.heap_len = 0, h.heap_max = n, M = 0; M < Q; M++)
                  Y[2 * M] !== 0
                    ? ((h.heap[++h.heap_len] = at = M), (h.depth[M] = 0))
                    : (Y[2 * M + 1] = 0);
                for (; h.heap_len < 2; )
                  (Y[2 * (z = h.heap[++h.heap_len] = at < 2 ? ++at : 0)] = 1),
                    (h.depth[z] = 0),
                    h.opt_len--,
                    W && (h.static_len -= Z[2 * z + 1]);
                for (E.max_code = at, M = h.heap_len >> 1; 1 <= M; M--)
                  ct(h, Y, M);
                for (
                  z = Q;
                  (M = h.heap[1]),
                    (h.heap[1] = h.heap[h.heap_len--]),
                    ct(h, Y, 1),
                    (L = h.heap[1]),
                    (h.heap[--h.heap_max] = M),
                    (h.heap[--h.heap_max] = L),
                    (Y[2 * z] = Y[2 * M] + Y[2 * L]),
                    (h.depth[z] =
                      (h.depth[M] >= h.depth[L] ? h.depth[M] : h.depth[L]) + 1),
                    (Y[2 * M + 1] = Y[2 * L + 1] = z),
                    (h.heap[1] = z++),
                    ct(h, Y, 1),
                    2 <= h.heap_len;

                );
                (h.heap[--h.heap_max] = h.heap[1]),
                  (function (it, vt) {
                    var Et,
                      xt,
                      Tt,
                      H,
                      ot,
                      lt,
                      ut = vt.dyn_tree,
                      wt = vt.max_code,
                      At = vt.stat_desc.static_tree,
                      Pt = vt.stat_desc.has_stree,
                      Dt = vt.stat_desc.extra_bits,
                      Ct = vt.stat_desc.extra_base,
                      St = vt.stat_desc.max_length,
                      Mt = 0;
                    for (H = 0; H <= d; H++) it.bl_count[H] = 0;
                    for (
                      ut[2 * it.heap[it.heap_max] + 1] = 0,
                        Et = it.heap_max + 1;
                      Et < n;
                      Et++
                    )
                      St <
                        (H = ut[2 * ut[2 * (xt = it.heap[Et]) + 1] + 1] + 1) &&
                        ((H = St), Mt++),
                        (ut[2 * xt + 1] = H),
                        wt < xt ||
                          (it.bl_count[H]++,
                          (ot = 0),
                          Ct <= xt && (ot = Dt[xt - Ct]),
                          (lt = ut[2 * xt]),
                          (it.opt_len += lt * (H + ot)),
                          Pt && (it.static_len += lt * (At[2 * xt + 1] + ot)));
                    if (Mt !== 0) {
                      do {
                        for (H = St - 1; it.bl_count[H] === 0; ) H--;
                        it.bl_count[H]--,
                          (it.bl_count[H + 1] += 2),
                          it.bl_count[St]--,
                          (Mt -= 2);
                      } while (0 < Mt);
                      for (H = St; H !== 0; H--)
                        for (xt = it.bl_count[H]; xt !== 0; )
                          wt < (Tt = it.heap[--Et]) ||
                            (ut[2 * Tt + 1] !== H &&
                              ((it.opt_len +=
                                (H - ut[2 * Tt + 1]) * ut[2 * Tt]),
                              (ut[2 * Tt + 1] = H)),
                            xt--);
                    }
                  })(h, E),
                  dt(Y, at, h.bl_count);
              }
              function e(h, E, M) {
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
                        ? (h.bl_tree[2 * z] += W)
                        : z !== 0
                        ? (z !== Y && h.bl_tree[2 * z]++, h.bl_tree[2 * D]++)
                        : W <= 10
                        ? h.bl_tree[2 * k]++
                        : h.bl_tree[2 * P]++,
                      (Y = z),
                      (at =
                        (W = 0) === Z
                          ? ((Q = 138), 3)
                          : z === Z
                          ? ((Q = 6), 3)
                          : ((Q = 7), 4)));
              }
              function O(h, E, M) {
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
                    if (W < at) for (; j(h, z, h.bl_tree), --W != 0; );
                    else
                      z !== 0
                        ? (z !== Y && (j(h, z, h.bl_tree), W--),
                          j(h, D, h.bl_tree),
                          G(h, W - 3, 2))
                        : W <= 10
                        ? (j(h, k, h.bl_tree), G(h, W - 3, 3))
                        : (j(h, P, h.bl_tree), G(h, W - 11, 7));
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
              function v(h, E, M, L) {
                G(h, (p << 1) + (L ? 1 : 0), 3),
                  (function (z, Y, Z, W) {
                    nt(z),
                      W && (V(z, Z), V(z, ~Z)),
                      a.arraySet(z.pending_buf, z.window, Y, Z, z.pending),
                      (z.pending += Z);
                  })(h, E, M, !0);
              }
              (l._tr_init = function (h) {
                R ||
                  ((function () {
                    var E,
                      M,
                      L,
                      z,
                      Y,
                      Z = new Array(d + 1);
                    for (z = L = 0; z < y - 1; z++)
                      for (F[z] = L, E = 0; E < 1 << T[z]; E++) r[L++] = z;
                    for (r[L - 1] = z, z = Y = 0; z < 16; z++)
                      for (X[z] = Y, E = 0; E < 1 << U[z]; E++) S[Y++] = z;
                    for (Y >>= 7; z < c; z++)
                      for (X[z] = Y << 7, E = 0; E < 1 << (U[z] - 7); E++)
                        S[256 + Y++] = z;
                    for (M = 0; M <= d; M++) Z[M] = 0;
                    for (E = 0; E <= 143; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (; E <= 255; ) (N[2 * E + 1] = 9), E++, Z[9]++;
                    for (; E <= 279; ) (N[2 * E + 1] = 7), E++, Z[7]++;
                    for (; E <= 287; ) (N[2 * E + 1] = 8), E++, Z[8]++;
                    for (dt(N, _ + 1, Z), E = 0; E < c; E++)
                      (b[2 * E + 1] = 5), (b[2 * E] = st(E, 5));
                    (q = new K(N, T, f + 1, _, d)),
                      (B = new K(b, U, 0, c, d)),
                      (J = new K(new Array(0), C, 0, m, w));
                  })(),
                  (R = !0)),
                  (h.l_desc = new A(h.dyn_ltree, q)),
                  (h.d_desc = new A(h.dyn_dtree, B)),
                  (h.bl_desc = new A(h.bl_tree, J)),
                  (h.bi_buf = 0),
                  (h.bi_valid = 0),
                  tt(h);
              }),
                (l._tr_stored_block = v),
                (l._tr_flush_block = function (h, E, M, L) {
                  var z,
                    Y,
                    Z = 0;
                  0 < h.level
                    ? (h.strm.data_type === 2 &&
                        (h.strm.data_type = (function (W) {
                          var Q,
                            at = 4093624447;
                          for (Q = 0; Q <= 31; Q++, at >>>= 1)
                            if (1 & at && W.dyn_ltree[2 * Q] !== 0) return s;
                          if (
                            W.dyn_ltree[18] !== 0 ||
                            W.dyn_ltree[20] !== 0 ||
                            W.dyn_ltree[26] !== 0
                          )
                            return i;
                          for (Q = 32; Q < f; Q++)
                            if (W.dyn_ltree[2 * Q] !== 0) return i;
                          return s;
                        })(h)),
                      gt(h, h.l_desc),
                      gt(h, h.d_desc),
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
                      })(h)),
                      (z = (h.opt_len + 3 + 7) >>> 3),
                      (Y = (h.static_len + 3 + 7) >>> 3) <= z && (z = Y))
                    : (z = Y = M + 5),
                    M + 4 <= z && E !== -1
                      ? v(h, E, M, L)
                      : h.strategy === 4 || Y === z
                      ? (G(h, 2 + (L ? 1 : 0), 3), ht(h, N, b))
                      : (G(h, 4 + (L ? 1 : 0), 3),
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
                          h,
                          h.l_desc.max_code + 1,
                          h.d_desc.max_code + 1,
                          Z + 1,
                        ),
                        ht(h, h.dyn_ltree, h.dyn_dtree)),
                    tt(h),
                    L && nt(h);
                }),
                (l._tr_tally = function (h, E, M) {
                  return (
                    (h.pending_buf[h.d_buf + 2 * h.last_lit] = (E >>> 8) & 255),
                    (h.pending_buf[h.d_buf + 2 * h.last_lit + 1] = 255 & E),
                    (h.pending_buf[h.l_buf + h.last_lit] = 255 & M),
                    h.last_lit++,
                    E === 0
                      ? h.dyn_ltree[2 * M]++
                      : (h.matches++,
                        E--,
                        h.dyn_ltree[2 * (r[M] + f + 1)]++,
                        h.dyn_dtree[2 * $(E)]++),
                    h.last_lit === h.lit_bufsize - 1
                  );
                }),
                (l._tr_align = function (h) {
                  G(h, 2, 3),
                    j(h, x, N),
                    (function (E) {
                      E.bi_valid === 16
                        ? (V(E, E.bi_buf), (E.bi_buf = 0), (E.bi_valid = 0))
                        : 8 <= E.bi_valid &&
                          ((E.pending_buf[E.pending++] = 255 & E.bi_buf),
                          (E.bi_buf >>= 8),
                          (E.bi_valid -= 8));
                    })(h);
                });
            },
            { "../utils/common": 41 },
          ],
          53: [
            function (t, g, l) {
              "use strict";
              g.exports = function () {
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
            function (t, g, l) {
              (function (a) {
                (function (s, i) {
                  "use strict";
                  if (!s.setImmediate) {
                    var o,
                      p,
                      y,
                      f,
                      _ = 1,
                      c = {},
                      m = !1,
                      n = s.document,
                      d = Object.getPrototypeOf && Object.getPrototypeOf(s);
                    (d = d && d.setTimeout ? d : s),
                      (o =
                        {}.toString.call(s.process) === "[object process]"
                          ? function (D) {
                              process.nextTick(function () {
                                w(D);
                              });
                            }
                          : (function () {
                              if (s.postMessage && !s.importScripts) {
                                var D = !0,
                                  k = s.onmessage;
                                return (
                                  (s.onmessage = function () {
                                    D = !1;
                                  }),
                                  s.postMessage("", "*"),
                                  (s.onmessage = k),
                                  D
                                );
                              }
                            })()
                          ? ((f = "setImmediate$" + Math.random() + "$"),
                            s.addEventListener
                              ? s.addEventListener("message", x, !1)
                              : s.attachEvent("onmessage", x),
                            function (D) {
                              s.postMessage(f + D, "*");
                            })
                          : s.MessageChannel
                          ? (((y = new MessageChannel()).port1.onmessage =
                              function (D) {
                                w(D.data);
                              }),
                            function (D) {
                              y.port2.postMessage(D);
                            })
                          : n &&
                            "onreadystatechange" in n.createElement("script")
                          ? ((p = n.documentElement),
                            function (D) {
                              var k = n.createElement("script");
                              (k.onreadystatechange = function () {
                                w(D),
                                  (k.onreadystatechange = null),
                                  p.removeChild(k),
                                  (k = null);
                              }),
                                p.appendChild(k);
                            })
                          : function (D) {
                              setTimeout(w, 0, D);
                            }),
                      (d.setImmediate = function (D) {
                        typeof D != "function" && (D = new Function("" + D));
                        for (
                          var k = new Array(arguments.length - 1), P = 0;
                          P < k.length;
                          P++
                        )
                          k[P] = arguments[P + 1];
                        var T = { callback: D, args: k };
                        return (c[_] = T), o(_), _++;
                      }),
                      (d.clearImmediate = u);
                  }
                  function u(D) {
                    delete c[D];
                  }
                  function w(D) {
                    if (m) setTimeout(w, 0, D);
                    else {
                      var k = c[D];
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
                                T.apply(i, U);
                            }
                          })(k);
                        } finally {
                          u(D), (m = !1);
                        }
                      }
                    }
                  }
                  function x(D) {
                    D.source === s &&
                      typeof D.data == "string" &&
                      D.data.indexOf(f) === 0 &&
                      w(+D.data.slice(f.length));
                  }
                })(typeof self > "u" ? (a === void 0 ? this : a) : self);
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
  var we = Oe(ne());
  var ie = (t) =>
      Array.isArray(t) &&
      t.length === 2 &&
      typeof t[0] == "number" &&
      typeof t[1] == "number",
    se = (t, g, l) => {
      let a = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (a == 0) return [0, 0];
      let i = Math.atan2(a / g, l) * (180 / Math.PI);
      return [(t[0] * i) / a, (t[1] * i) / a];
    },
    ae = (t, g, l) => {
      let a = Math.sqrt(t[0] * t[0] + t[1] * t[1]);
      if (a >= 90) {
        let i = 89.99999999 / a;
        return ae([t[0] * i, t[1] * i], g, l);
      }
      let s = g * l * Math.tan((a * Math.PI) / 180);
      return a == 0 ? [0, 0] : [(t[0] * s) / a, (t[1] * s) / a];
    },
    oe = (t) => {
      let g = se(
        [
          t.fixationXYPx[0] - t.nearestPointXYZPx[0],
          t.fixationXYPx[1] - t.nearestPointXYZPx[1],
        ],
        t.pxPerCm,
        t.viewingDistanceCm,
      );
      return [-g[0], -g[1]];
    },
    pt = (t, g) => {
      let l = oe(g),
        a = (s) => {
          let i = [s[0] - l[0], s[1] - l[1]],
            o = ae(i, g.pxPerCm, g.viewingDistanceCm);
          return [o[0] + g.nearestPointXYZPx[0], o[1] + g.nearestPointXYZPx[1]];
        };
      return ie(t) ? a(t) : t.map(a);
    },
    bt = (t, g) => {
      let l = oe(g),
        a = (s) => {
          let i = [
              s[0] - g.nearestPointXYZPx[0],
              s[1] - g.nearestPointXYZPx[1],
            ],
            o = se(i, g.pxPerCm, g.viewingDistanceCm);
          return [o[0] + l[0], o[1] + l[1]];
        };
      return ie(t) ? a(t) : t.map(a);
    };
  var Lt = (t) => {
      t.charCodeAt(0) === 65279 && (t = t.slice(1));
      let g = [],
        l = [],
        a = "",
        s = !1,
        i = () => {
          l.push(a.trim()), (a = "");
        },
        o = () => {
          (l.length > 1 || l[0] !== "") && g.push(l), (l = []);
        };
      for (let p = 0; p < t.length; p++) {
        let y = t[p];
        s
          ? y === '"'
            ? t[p + 1] === '"'
              ? ((a += '"'), p++)
              : (s = !1)
            : (a += y)
          : y === '"'
          ? (s = !0)
          : y === ","
          ? i()
          : y ===
              `
` || y === "\r"
          ? (y === "\r" &&
              t[p + 1] ===
                `
` &&
              p++,
            i(),
            o())
          : (a += y);
      }
      return i(), o(), { header: g[0] ?? [], rows: g.slice(1) };
    },
    yt = (t) => {
      if (t === void 0) return;
      let g = Number(t);
      return Number.isFinite(g) ? g : void 0;
    },
    ce = (t) => {
      let g = t.match(/(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!g) return;
      let l = Number(g[1]),
        a = Number(g[2]);
      return Number.isFinite(l) && Number.isFinite(a) ? [l, a] : void 0;
    },
    Be = (t) => {
      let g = t.match(
        /\[\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*,\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\]/,
      );
      if (!g) return;
      let l = g.slice(1).map(Number);
      return l.every(Number.isFinite)
        ? [
            [l[0], l[1]],
            [l[2], l[3]],
          ]
        : void 0;
    },
    Le = (t, g, l) => [t[0] - g / 2, l / 2 - t[1]],
    le = (t, g, l = [], a = !1) => {
      let s = [
          [-g.screenW / 2, -g.screenH / 2],
          [g.screenW / 2, g.screenH / 2],
        ],
        i = a ? 3 : 2,
        o = (n) => ({
          pxPerCm: g.pxPerCm,
          viewingDistanceCm: a ? n[2] : g.viewingDistanceCm,
          fixationXYPx: g.fixationXYPx ?? [0, 0],
          nearestPointXYZPx: [n[0], n[1]],
        }),
        p = (n) => {
          let d = 0;
          for (let u = 0; u < 2; u++) {
            let w = bt(s[u], o(n)),
              x = w[0] - t[u][0],
              D = w[1] - t[u][1];
            d += x * x + D * D;
          }
          return Math.sqrt(d);
        },
        y = (n) => (a ? [...n, g.viewingDistanceCm] : [...n]),
        f = [
          ...l.map((n) => y([...n])),
          y([0, 0]),
          y([g.screenW / 2, g.screenH / 2]),
          y([g.screenW / 4, g.screenH / 4]),
        ],
        _ = f[0],
        c = p(_);
      for (let n of f.slice(1)) {
        let d = p(n);
        d < c && ((c = d), (_ = n));
      }
      let m = Math.max(g.screenW, g.screenH) / 8;
      for (; m >= 0.25; ) {
        let n = !0;
        for (; n; ) {
          n = !1;
          for (let d = 0; d < i; d++)
            for (let u of [1, -1]) {
              let w = [..._];
              w[d] += u * m;
              let x = p(w);
              x < c - 1e-12 && ((c = x), (_ = w), (n = !0));
            }
        }
        m /= 2;
      }
      return {
        nearest: [_[0], _[1]],
        viewingDistanceCm: _[2] ?? g.viewingDistanceCm,
        residualDeg: c,
      };
    },
    Gt = 0.15,
    Ut = 150,
    ue = 2.5,
    de = 3,
    fe = (t, g, l) =>
      t[0] > 0.1 * g && t[0] < 0.9 * g && t[1] > -0.25 * l && t[1] < 0.95 * l,
    Ne = (t, g, l) => Math.abs(t[0]) < 0.4 * g && Math.abs(t[1]) < 0.4 * l,
    Me = (t, g, l) => {
      if (
        (t("fixationLocationStrategy") ?? "centerFixation") !== "centerFixation"
      )
        return [0, 0];
      let s = (t("fixationOriginXYScreen") ?? "0.5, 0.5").match(
        /([\d.]+)\s*,\s*([\d.]+)/,
      );
      if (!s) return [0, 0];
      let i = Number(s[1]),
        o = Number(s[2]),
        p = yt(t("targetImageSpareFraction") ?? "");
      if (p && p > 0) {
        let y = t("targetImageWhere") ?? "top",
          f = 0,
          _ = 1,
          c = 0,
          m = 1;
        y === "top"
          ? (c = p)
          : y === "bottom"
          ? (m = 1 - p)
          : y === "left"
          ? (_ = 1 - p)
          : (f = p),
          (i = f + i * (_ - f)),
          (o = c + o * (m - c));
      }
      return [
        Math.round((2 * i - 1) * (g / 2)),
        Math.round((2 * o - 1) * (l / 2)),
      ];
    },
    kt = (t) => ({
      status: "FLAGGED",
      statusReason: t,
      columns: { repairStatus: "FLAGGED", repairStatusReason: t },
    }),
    Xt = (t) =>
      /-repaired\.csv$/i.test(t)
        ? t
        : t.replace(/\.csv$/i, "") + "-repaired.csv",
    me = (t) => {
      let { header: g, rows: l } = Lt(t);
      if (g.includes("repairStatus") || g.includes("repairImputedColumns"))
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
      let a = (I) => g.indexOf(I),
        s = (I, N) => {
          let b = a(N);
          if (b < 0) return;
          let S = I[b];
          return S === "" ? void 0 : S;
        },
        i = (I) => {
          for (let N of l) {
            let b = s(N, I);
            if (b !== void 0) return b;
          }
        },
        o = yt(i("screenWidthPx")),
        p = yt(i("screenHeightPx")),
        y = yt(i("pxPerCm")),
        f = "2025-08-30",
        _ = "2026-09-15",
        c = i("date") ?? "",
        m = c.match(/(\d{4})-(\d{2})-(\d{2})/),
        n = m ? `${m[1]}-${m[2]}-${m[3]}` : "",
        d = !!n && n < f,
        u = !!n && n < _,
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
        D = new Map();
      x.forEach((I) => {
        for (let N of w) {
          let b = a(N);
          if (b < 0) continue;
          let S = I[b];
          S !== "" && S !== void 0
            ? D.set(N, S)
            : D.has(N) && (I[b] = D.get(N));
        }
      });
      let k = (I, N) => {
          let b = a(N);
          if (b < 0) return;
          let S = I[b];
          return S === "" ? void 0 : S;
        },
        P = l.map(() => kt("not assessed")),
        T = 0,
        U = 0,
        C = 0;
      l.forEach((I, N) => {
        let b = x[N],
          S = k(b, "nearpointXYPxAppleCoords"),
          r = k(b, "screenBoundingRectDeg"),
          F = k(b, "nearestXYPx"),
          q = yt(k(b, "targetEccentricityXDeg")),
          B = yt(k(b, "targetEccentricityYDeg")),
          J = yt(k(b, "markingFixationMotionRadiusDeg")),
          X = k(b, "thresholdParameter"),
          K = yt(k(b, "level")),
          A =
            yt(k(b, "distanceCm")) ??
            yt(k(b, "viewingDistancePredictedCm")) ??
            yt(i("viewingDistanceDesiredCm")),
          $ = Me((H) => k(b, H), o, p);
        if (d) {
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
        if (!(o && o > 0) || !(p && p > 0) || !(y && y > 0) || !(A && A > 0)) {
          P[N] = kt(
            "missing apparatus columns (pxPerCm/screenWidthPx/screenHeightPx/distance)",
          );
          return;
        }
        let V = S ? ce(S) : void 0,
          G = r ? Be(r) : void 0;
        if (
          V &&
          !F &&
          Math.abs(V[0] - o / 2) <= ue &&
          Math.abs(V[1] - p / 2) <= ue
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
        let j = V ? [V[0] - o / 2, p / 2 - V[1]] : void 0,
          st = {
            pxPerCm: y,
            viewingDistanceCm: A,
            screenW: o,
            screenH: p,
            fixationXYPx: $,
          },
          dt = le(G, st, j ? [j] : []),
          tt = A,
          nt = "";
        if (dt.residualDeg > Gt) {
          let H = le(G, st, j ? [j] : [], !0);
          H.residualDeg <= Gt &&
            H.viewingDistanceCm >= 15 &&
            H.viewingDistanceCm <= 250 &&
            ((dt = H),
            (tt = H.viewingDistanceCm),
            (nt = `; rect fit moved viewing distance ${A.toFixed(
              1,
            )}->${tt.toFixed(1)} cm`));
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
          (ct = Math.abs(j[0] - rt[0]) <= de && Math.abs(j[1] - rt[1]) <= de);
        let ht = ct
          ? ""
          : " (appleCoords disagrees \u2014 non-fullscreen window; rect fit used)";
        if (!F && Math.abs(rt[0]) <= 5 && Math.abs(rt[1]) <= 5) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason:
              "nearest point at screen center [0,0]; bug never active" + ht,
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "nearest point at screen center [0,0]",
            },
          };
          return;
        }
        let gt = fe(rt, o, p),
          e = Ne(rt, o, p),
          O,
          R = rt;
        if (F) {
          let H = ce(F);
          if (!H) {
            P[N] = kt("nearestXYPx column unparseable");
            return;
          }
          let ot = Math.hypot(H[0] - rt[0], H[1] - rt[1]),
            lt = [rt[0] + o / 2, p / 2 - rt[1]],
            ut = Math.hypot(H[0] - lt[0], H[1] - lt[1]),
            wt = Math.abs(rt[0]) <= 5 && Math.abs(rt[1]) <= 5;
          if (u) {
            if (!wt && ot > Ut && ut > Ut) {
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
            if (ot > Ut) {
              P[N] = kt(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${ot.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            (O = !0), (R = H);
          } else if (e && !gt) {
            if (ut > Ut) {
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
                ht,
            );
            return;
          }
        } else if (gt && !e) O = !0;
        else if (e && !gt) O = !1;
        else {
          P[N] = kt(
            "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
              ht,
          );
          return;
        }
        if (O && !u && !fe(R, o, p)) {
          P[N] = kt(
            "nearest outside plausible rc band \u2014 not corrected" + ht,
          );
          return;
        }
        if (O && !F && rt.some((H) => H !== 0)) {
          P[N] = kt(
            "buggy session; no stimulus-time nearestXYPx on this row \u2014 live eye unknown" +
              ht,
          );
          return;
        }
        if (!O) {
          P[N] = {
            status: "UNAFFECTED",
            statusReason: "fix already applied (converted nearest used)" + ht,
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
        let v = Le(R, o, p),
          h = yt(k(b, "distanceCm")) ?? tt,
          E = {
            pxPerCm: y,
            viewingDistanceCm: h,
            fixationXYPx: $,
            nearestPointXYZPx: R,
          },
          M = { ...E, nearestPointXYZPx: v },
          L = {},
          z = {
            status: "CORRECTED",
            statusReason:
              "nearest recovered; corrected (static fixation assumed \u2014 random offset not logged)" +
              ht +
              nt,
            nearestUsedXY: R,
            nearestCorrectXY: v,
            columns: L,
          },
          Y = (H, ot, lt) => {
            if (!(lt > 0) || !Number.isFinite(lt)) return;
            let ut = pt(H, E),
              wt = pt([H[0] + ot[0] * lt, H[1] + ot[1] * lt], E),
              At = bt(ut, M),
              Pt = bt(wt, M);
            return Math.hypot(Pt[0] - At[0], Pt[1] - At[1]);
          },
          Z = q !== void 0 && B !== void 0 ? [q, B] : void 0;
        if (Z) {
          let H = pt(Z, E),
            ot = bt(H, M);
          (z.actualTargetEccentricityXDeg = ot[0]),
            (z.actualTargetEccentricityYDeg = ot[1]),
            (L.actualTargetEccentricityXDeg = ot[0].toFixed(4)),
            (L.actualTargetEccentricityYDeg = ot[1].toFixed(4)),
            (L.drawnTargetXYPx = `${H[0].toFixed(1)}, ${H[1].toFixed(1)}`);
          let lt = pt(Z, M);
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
          let H = k(b, "spacingDirection") ?? "radial",
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
          let ot = /true/i.test(k(b, "targetSizeIsHeightBool") ?? "FALSE")
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
            let H = k(b, "spacingDirection") ?? "radial";
            return H.includes("horizontal")
              ? [1, 0]
              : H.includes("vertical")
              ? [0, 1]
              : H.includes("tangential")
              ? Q
              : W;
          })(),
          vt = yt(k(b, "spacingDeg") ?? "");
        if (Z && vt !== void 0 && vt > 0 && X !== "spacingDeg") {
          let H = Y(Z, it, vt);
          H !== void 0 && (L.actualSpacingDegNominal = H.toFixed(4));
        }
        let Et = yt(k(b, "targetSizeDeg") ?? "");
        if (Z && Et !== void 0 && Et > 0 && X !== "targetSizeDeg") {
          let H = /true/i.test(k(b, "targetSizeIsHeightBool") ?? "FALSE"),
            ot = Y(Z, H ? [0, 1] : [1, 0], Et);
          ot !== void 0 && (L.actualSizeDegNominal = ot.toFixed(4));
        }
        let xt = yt(k(b, "flankerSpacingDeg") ?? "");
        if (Z && xt !== void 0 && xt > 0) {
          let H = Y(Z, W, xt);
          H !== void 0 && (L.actualFlankerSpacingDeg = H.toFixed(4));
        }
        {
          let H = bt([-o / 2, -p / 2], M),
            ot = bt([o / 2, p / 2], M);
          L.screenBoundingRectDegCorrected = `[(${H[0].toFixed(
            4,
          )}, ${H[1].toFixed(4)}), (${ot[0].toFixed(4)}, ${ot[1].toFixed(4)})]`;
        }
        if (
          k(b, "gazeMeasuredXDeg") !== "" ||
          k(b, "gazeMeasuredYDeg") !== "" ||
          k(b, "gazeMeasuredRawDeg") !== ""
        )
          if (!ct)
            z.statusReason += "; gaze left as logged (window size unknown)";
          else {
            let H = (Dt) => {
                let Ct = pt(Dt, E);
                return bt(Ct, M);
              },
              ot = yt(k(b, "gazeMeasuredXDeg")),
              lt = yt(k(b, "gazeMeasuredYDeg")),
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
              let Dt = ut ? ut[0] : ot,
                Ct = wt ? wt[1] : lt;
              L.gazeMeasuredRDeg = Math.hypot(Dt, Ct).toFixed(5);
            }
            let At = ut !== void 0 || wt !== void 0,
              Pt = k(b, "gazeMeasuredRawDeg");
            if (Pt !== "")
              try {
                let Dt = JSON.parse(Pt);
                Array.isArray(Dt) &&
                  Dt.length > 0 &&
                  ((L.gazeMeasuredRawDeg = JSON.stringify(
                    Dt.map((Ct) => {
                      let St = H([Number(Ct[0]), Number(Ct[1])]);
                      return [
                        Number(St[0].toFixed(5)),
                        Number(St[1].toFixed(5)),
                      ];
                    }),
                  )),
                  (At = !0));
              } catch {}
            At &&
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
        I.status === "CORRECTED" ? T++ : I.status === "UNAFFECTED" ? U++ : C++;
      return {
        rows: P,
        summary: { total: P.length, corrected: T, unaffected: U, flagged: C },
      };
    },
    Ue = [
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
    he = (t) => (/[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t),
    Xe = {
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
    qt = (t, g) => {
      if (g.summary.alreadyRepaired) return t;
      let { header: l, rows: a } = Lt(t),
        s = a.map((_) => [..._]),
        i = new Set();
      a.forEach((_, c) => {
        let m = g.rows[c].columns,
          n = [];
        for (let [d, u] of Object.entries(Xe)) {
          if (!(d in m)) continue;
          let w = l.indexOf(u);
          w >= 0 && ((s[c][w] = m[d]), i.add(d), n.includes(u) || n.push(u));
        }
        n.length && (m.repairImputedColumns = n.join("; "));
      });
      let o = Ue.filter(
          (_) => !i.has(_) && a.some((c, m) => _ in g.rows[m].columns),
        ),
        p = o.map((_) =>
          l.includes(_) ? `repair${_[0].toUpperCase()}${_.slice(1)}` : _,
        ),
        y = [
          [...l, ...p].join(","),
          ...s.map((_, c) =>
            [
              ..._.map(he),
              ...p.map((m, n) => he(g.rows[c].columns[o[n]] ?? "")),
            ].join(","),
          ),
        ];
      return (
        (t.charCodeAt(0) === 65279 ? "\uFEFF" : "") +
        y.join(`
`)
      );
    },
    pe = (t) => t.sort((g, l) => g - l)[Math.floor(t.length / 2)],
    ge = (t, g) => {
      if (g.summary.alreadyRepaired) return { correctedTrials: 0 };
      let { header: l, rows: a } = Lt(t),
        s = l.indexOf("targetEccentricityXDeg"),
        i = l.indexOf("targetEccentricityYDeg"),
        o = l.indexOf("level"),
        p = [],
        y = [],
        f = 0;
      a.forEach((c, m) => {
        let n = g.rows[m];
        if (n.status === "CORRECTED") {
          if ((f++, s >= 0 && n.actualTargetEccentricityXDeg !== void 0)) {
            let d = Math.hypot(Number(c[s]), Number(c[i])),
              u = Math.hypot(
                n.actualTargetEccentricityXDeg,
                n.actualTargetEccentricityYDeg ?? 0,
              );
            d > 0 && Number.isFinite(d) && p.push(((u - d) / d) * 100);
          }
          if (o >= 0 && n.actualLevelLog10Deg !== void 0) {
            let d = Math.pow(10, Number(c[o])),
              u = Math.pow(10, n.actualLevelLog10Deg);
            d > 0 && Number.isFinite(d) && y.push(((u - d) / d) * 100);
          }
        }
      });
      let _ = { correctedTrials: f };
      return (
        p.length &&
          (_.eccentricityErrPct = [pe(p), Math.max(...p.map(Math.abs))]),
        y.length &&
          (_.sizeSpacingInflationPct = [pe(y), Math.max(...y.map(Math.abs))]),
        _
      );
    };
  var ft = (t, g = 1) => (t == null || !Number.isFinite(t) ? "" : t.toFixed(g)),
    Zt = (t) => `${t >= 0 ? "+" : ""}${ft(t)}%`,
    mt = (t) =>
      String(t)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    $t = (t, g, l) =>
      `<span class="pill ${t}"${l ? ` data-tip="${mt(l)}"` : ""}>${mt(
        g,
      )}</span>`,
    Ye = (t, g, l) => {
      let a = [],
        s = (i) => {
          let o = l.indexOf(i);
          return o >= 0 ? g[o] : "";
        };
      return (
        t.status === "CORRECTED" &&
          (t.nearestUsedXY &&
            t.nearestCorrectXY &&
            a.push(
              `eye used (${ft(t.nearestUsedXY[0], 0)}, ${ft(
                t.nearestUsedXY[1],
                0,
              )}) px; true (${ft(t.nearestCorrectXY[0], 0)}, ${ft(
                t.nearestCorrectXY[1],
                0,
              )}) px`,
            ),
          t.actualTargetEccentricityXDeg !== void 0 &&
            (a.push(
              `position asked (${s("targetEccentricityXDeg")}, ${s(
                "targetEccentricityYDeg",
              )})\xB0 \u2192 drew (${
                t.columns.drawnTargetXYPx
              }) px = truly (${ft(t.actualTargetEccentricityXDeg, 2)}, ${ft(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`,
            ),
            t.columns.correctedTargetXYPx &&
              a.push(
                `to place as asked: (${t.columns.correctedTargetXYPx}) px`,
              )),
          t.actualLevelLog10Deg !== void 0 &&
            a.push(
              `size/spacing asked ${ft(
                Math.pow(10, Number(s("level"))),
                2,
              )}\xB0 \u2192 showed ${ft(
                Math.pow(10, t.actualLevelLog10Deg),
                2,
              )}\xB0`,
            )),
        a.push(t.statusReason),
        a.join(`
`)
      );
    },
    je = {
      CORRECTED: ["corrected", "st-corrected"],
      UNAFFECTED: ["unaffected", "st-unaffected"],
      FLAGGED: ["flagged", "st-flagged"],
    },
    be = {
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
      let g = new Set();
      for (let l of Object.keys(t.columns)) l in be && g.add(be[l]);
      return [...g];
    },
    Vt = (t, g) =>
      g === void 0 || g === ""
        ? `<span class="ov">${mt(t)}</span>`
        : `<span class="ov">${mt(
            t,
          )}</span><span class="arw">\u2192</span><span class="nv">${mt(
            g,
          )}</span>`,
    We = (t, g, l, a) => {
      let s = (x) => {
          let D = l.indexOf(x);
          return D >= 0 ? g[D] : "";
        },
        [i, o] = je[t.status],
        p = Ye(t, g, l),
        y =
          s("targetEccentricityXDeg") !== ""
            ? `(${s("targetEccentricityXDeg")}, ${s(
                "targetEccentricityYDeg",
              )})\xB0`
            : "",
        f =
          t.actualTargetEccentricityXDeg !== void 0
            ? `(${ft(t.actualTargetEccentricityXDeg, 2)}, ${ft(
                t.actualTargetEccentricityYDeg,
                2,
              )})\xB0`
            : void 0,
        _ =
          s("level") !== "" && Number.isFinite(Number(s("level")))
            ? ft(Number(s("level")), 3)
            : s("level"),
        c =
          t.actualLevelLog10Deg !== void 0
            ? ft(t.actualLevelLog10Deg, 3)
            : void 0,
        m = s("screenBoundingRectDeg"),
        n = t.columns.screenBoundingRectDegCorrected,
        d = xe(t)
          .map((x) => `<span class="pchip">${mt(x)}</span>`)
          .join(""),
        u =
          t.status === "FLAGGED" || t.status === "UNAFFECTED"
            ? `<td class="reason">${mt(t.statusReason)}</td>`
            : '<td class="reason"></td>',
        w = f !== void 0 || c !== void 0;
      return `<tr data-st="${t.status}" class="${
        w ? "r-diff" : ""
      }" data-tip="${mt(p)}">
    <td>${a + 1}</td>
    <td>${$t(o, i, p)}</td>
    <td class="${f !== void 0 ? "diff" : ""}">${Vt(y, f)}</td>
    <td class="${c !== void 0 ? "diff" : ""}">${Vt(_, c)}</td>
    <td class="rect ${n ? "diff" : ""}">${Vt(m, n)}</td>
    <td class="chipscell">${d}</td>
    ${u}
  </tr>`;
    },
    ye = (t, g, l) => {
      if (!t.length) return "";
      let a = 300,
        s = 220,
        i = 34,
        o = t.map((n) => n[0]),
        p = t.map((n) => n[1]),
        y = Math.max(...o, ...p) * 1.1 || 1,
        f = (n) => i + (n / y) * (a - i - 8),
        _ = (n) => s - i + 8 - (n / y) * (s - i - 8),
        c = t
          .map(
            (n) =>
              `<circle cx="${f(n[0]).toFixed(1)}" cy="${_(n[1]).toFixed(
                1,
              )}" r="3.5" fill="#b26a00" fill-opacity="0.85"><title>asked ${n[0].toFixed(
                2,
              )}\xB0, actually showed ${n[1].toFixed(2)}\xB0 (${Zt(
                ((n[1] - n[0]) / n[0]) * 100,
              )})</title></circle>`,
          )
          .join(""),
        m = [0, y / 2, y]
          .map(
            (n) =>
              `<line x1="${f(n)}" y1="${_(0)}" x2="${f(n)}" y2="${
                _(0) + 4
              }" stroke="#999"/><text x="${f(n)}" y="${
                _(0) + 15
              }" font-size="9" text-anchor="middle" fill="#666">${n.toFixed(
                1,
              )}</text><line x1="${f(0) - 4}" y1="${_(n)}" x2="${f(0)}" y2="${_(
                n,
              )}" stroke="#999"/><text x="${f(0) - 6}" y="${
                _(n) + 3
              }" font-size="9" text-anchor="end" fill="#666">${n.toFixed(
                1,
              )}</text>`,
          )
          .join("");
      return `<svg width="${a}" height="${s}" class="plot" role="img">
    <line x1="${f(0)}" y1="${_(0)}" x2="${f(y)}" y2="${_(
      y,
    )}" stroke="#2e7d32" stroke-dasharray="4 3"/>
    <text x="${f(y * 0.82)}" y="${
      _(y * 0.82) - 6
    }" font-size="9" fill="#2e7d32">no error</text>
    <line x1="${f(0)}" y1="${_(0)}" x2="${f(y)}" y2="${_(0)}" stroke="#bbb"/>
    <line x1="${f(0)}" y1="${_(0)}" x2="${f(0)}" y2="${_(y)}" stroke="#bbb"/>
    ${m}${c}
    <text x="${a / 2}" y="${
      s - 2
    }" font-size="10" text-anchor="middle" fill="#444">${mt(g)}</text>
    <text x="10" y="${
      s / 2
    }" font-size="10" text-anchor="middle" fill="#444" transform="rotate(-90 10 ${
      s / 2
    })">${mt(l)}</text>
  </svg>`;
    },
    ke = (t, g) => {
      let l = new Blob([g], { type: "text/csv" }),
        a = document.createElement("a");
      (a.href = URL.createObjectURL(l)),
        (a.download = t),
        a.click(),
        setTimeout(() => URL.revokeObjectURL(a.href), 5e3);
    },
    Yt = document.getElementById("results"),
    zt = document.createElement("div");
  zt.className = "rtip";
  document.body.appendChild(zt);
  var Ee = (t) => {
    let l = zt.getBoundingClientRect(),
      a = t.clientX + 14,
      s = t.clientY - l.height / 2;
    a + l.width > innerWidth - 8 && (a = t.clientX - l.width - 14),
      (s = Math.min(Math.max(s, 8), innerHeight - l.height - 8)),
      (zt.style.left = a + "px"),
      (zt.style.top = s + "px");
  };
  document.body.addEventListener("mouseover", (t) => {
    let g = t.target.closest("[data-tip]");
    g &&
      ((zt.innerHTML = mt(g.getAttribute("data-tip")).replace(/\n/g, "<br>")),
      (zt.style.display = "block"),
      Ee(t));
  });
  document.body.addEventListener("mousemove", (t) => {
    zt.style.display === "block" && Ee(t);
  });
  document.body.addEventListener("mouseout", (t) => {
    t.target.closest("[data-tip]") && (zt.style.display = "none");
  });
  var Rt = [],
    et = {
      processed: 0,
      repaired: 0,
      clean: 0,
      flaggedOnly: 0,
      already: 0,
      errors: 0,
      skippedNonCsv: 0,
      entries: new Map(),
    },
    jt = (t, g) => {
      if (!et.entries.has(t)) return et.entries.set(t, g), t;
      let l = 2,
        a;
      do
        (a = /\.csv$/i.test(t)
          ? t.replace(/\.csv$/i, ` (${l}).csv`)
          : `${t} (${l})`),
          l++;
      while (et.entries.has(a));
      return et.entries.set(a, g), a;
    },
    Nt = () => {
      if (!et.processed && !et.errors && !et.skippedNonCsv) return;
      let t = document.getElementById("batchbar");
      t.style.display = "flex";
      let g = [];
      et.repaired &&
        g.push(
          `${et.repaired} repaired \u2014 renamed with \u201C-repaired\u201D`,
        ),
        et.clean && g.push(`${et.clean} needed nothing`),
        et.flaggedOnly && g.push(`${et.flaggedOnly} flagged for review`),
        et.already && g.push(`${et.already} already repaired`),
        et.errors && g.push(`${et.errors} unreadable`);
      let l = et.processed + et.errors,
        a = `${l} file${l === 1 ? "" : "s"}`;
      document.getElementById("batchcounts").textContent = g.length
        ? `${a}: ${g.join(" \xB7 ")}${
            et.skippedNonCsv
              ? ` \u2014 ${et.skippedNonCsv} non-CSV skipped`
              : ""
          }`
        : `${a} \u2014 no repairs needed${
            et.skippedNonCsv ? `, ${et.skippedNonCsv} non-CSV skipped` : ""
          }`;
    },
    De = () =>
      `EasyEyes results repair report
` +
      new Date().toISOString() +
      `
${et.processed} files assessed: ${et.repaired} repaired (renamed "-repaired"), ${et.clean} needed nothing, ${et.flaggedOnly} flagged for review, ${et.already} already repaired, ${et.errors} unreadable` +
      (et.skippedNonCsv ? `, ${et.skippedNonCsv} non-CSV files skipped` : "") +
      `
Repaired files list what changed per row in the repairImputedColumns column.

` +
      Rt.join(`
`) +
      `
`,
    Ze = async (t) => {
      let g = [...et.entries.keys()],
        l = new Set(g.map((o) => (o.includes("/") ? o.split("/")[0] : ""))),
        a =
          l.size === 1 && !l.has("")
            ? `${[...l][0]}-repaired.zip`
            : "easyeyes-results-repaired.zip",
        s = await t.generateAsync({ type: "blob", compression: "DEFLATE" }),
        i = document.createElement("a");
      (i.href = URL.createObjectURL(s)),
        (i.download = a),
        i.click(),
        setTimeout(() => URL.revokeObjectURL(i.href), 5e3);
    },
    _e =
      "These trials were not affected by the bug (e.g. eye at screen center, untracked session, or recorded outside the bug window).",
    ve =
      "The tool cannot prove what was shown on these rows \u2014 nothing was changed; the report lists the reasons.",
    He =
      "This file already carries the repair audit columns \u2014 it was repaired before. It passes through unchanged; correcting twice is impossible.",
    Ge = async (t, g) => {
      let l = g || t.name,
        a;
      try {
        a = new TextDecoder("utf-8", { ignoreBOM: !0 }).decode(
          await t.arrayBuffer(),
        );
      } catch {
        a = null;
      }
      let s = null,
        i = null;
      if (a !== null)
        try {
          s = me(a);
        } catch (r) {
          i = r && r.message ? String(r.message) : null;
        }
      if (!s) {
        et.errors++,
          a !== null && jt(l, a),
          Yt.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${mt(l)}</span>${$t(
              "st-flagged",
              "could not parse",
              i || "The file is not a readable results CSV.",
            )}</div>`,
          ),
          Rt.push(`${l}: ERROR ${i || "could not parse"}`),
          Nt();
        return;
      }
      if (s.summary.alreadyRepaired) {
        et.already++,
          jt(l, a),
          Yt.insertAdjacentHTML(
            "beforeend",
            `<div class="frow"><span class="fpath">${mt(l)}</span>${$t(
              "st-done",
              "already repaired",
              He,
            )}</div>`,
          ),
          Rt.push(`${l}: already repaired \u2014 unchanged`),
          et.processed++,
          Nt();
        return;
      }
      let o = s.summary;
      if (o.corrected === 0) {
        jt(l, a);
        let r = {};
        s.rows.forEach((B) => {
          B.status === "FLAGGED" &&
            (r[B.statusReason] = (r[B.statusReason] || 0) + 1);
        });
        let F = Object.entries(r)
            .sort((B, J) => J[1] - B[1])
            .map(([B, J]) => `${J}\xD7 ${B}`).join(`
`),
          q = [
            o.unaffected
              ? $t("st-unaffected", `${o.unaffected} unaffected`, _e)
              : "",
            o.flagged ? $t("st-flagged", `${o.flagged} flagged`, F || ve) : "",
          ].join("");
        Yt.insertAdjacentHTML(
          "beforeend",
          `<div class="frow"><span class="fpath">${mt(l)}</span>${q}</div>`,
        ),
          Rt.push(
            `${l}: no corrections \u2014 ${o.unaffected} unaffected / ${o.flagged} flagged (${o.total} rows); file unchanged`,
          ),
          Object.entries(r).forEach(([B, J]) => Rt.push(`  FLAG ${J}x: ${B}`)),
          et[o.flagged ? "flaggedOnly" : "clean"]++,
          et.processed++,
          Nt();
        return;
      }
      let { header: p, rows: y } = Lt(a),
        f = ge(a, s),
        _ = [
          $t(
            "st-corrected",
            `${o.corrected} corrected`,
            "These trials were recorded with the warped conversion. The repaired CSV replaces the requested values with what was truly shown.",
          ),
          o.unaffected
            ? $t("st-unaffected", `${o.unaffected} unaffected`, _e)
            : "",
          o.flagged ? $t("st-flagged", `${o.flagged} flagged`, ve) : "",
        ].join(" "),
        c = "";
      if (f.correctedTrials > 0) {
        let r = [];
        f.eccentricityErrPct &&
          r.push(
            `position off by median ${ft(
              Math.abs(f.eccentricityErrPct[0]),
            )}% (max ${ft(f.eccentricityErrPct[1])}%)`,
          ),
          f.sizeSpacingInflationPct &&
            r.push(
              `size/spacing off by median ${ft(
                Math.abs(f.sizeSpacingInflationPct[0]),
              )}% (max ${ft(f.sizeSpacingInflationPct[1])}%)`,
            ),
          (c = `<div class="wrong st-corrected-bg">On the ${
            f.correctedTrials
          } corrected trial${
            f.correctedTrials > 1 ? "s" : ""
          }, what was shown differed from what was requested: ${r.join(
            "; ",
          )}.</div>`);
      }
      let m = 400,
        n = o.corrected + o.flagged,
        d = n > 0 && n < o.total,
        u = s.rows
          .map((r, F) => We(r, y[F], p, F))
          .map((r) =>
            d && r.includes('data-st="UNAFFECTED"')
              ? r.replace("<tr ", '<tr class="r-hidden" ')
              : r,
          )
          .slice(0, m)
          .join(""),
        w = new Map();
      s.rows.forEach((r) => {
        if (r.status === "CORRECTED")
          for (let F of xe(r)) w.set(F, (w.get(F) || 0) + 1);
      });
      let x = w.size
          ? `<div class="pstrip"><b>Corrected parameters:</b> ${[...w]
              .map(
                ([r, F]) =>
                  `<span class="pchip big">${mt(r)} <b>\xD7${F}</b></span>`,
              )
              .join(
                "",
              )}<span class="hint">Corrected values are imputed into these original columns, so your existing analysis works unchanged; the added <code>repairImputedColumns</code> column lists what changed on each row. Your source file is untouched.</span></div>`
          : "",
        D = `<div class="rowswrap">
      <div class="rowscap">Row-by-row details \u2014 ${
        o.total
      } rows; hover for derivations</div>
      <label class="rowtoggle"><input type="checkbox" ${
        d ? "checked" : ""
      }/> show only affected rows (corrected + flagged)</label>
      <table><thead><tr>
        <th>#</th><th>status</th>
        <th title="requested (muted) \u2192 actually shown (green), in degrees">target position</th>
        <th title="requested (muted) \u2192 actually shown (green), log10 degrees">level</th>
        <th title="as logged (muted) \u2192 corrected (green), degrees">bounding rect</th>
        <th title="parameters this row carries corrections for">corrected</th>
        <th>reason</th></tr></thead>
      <tbody>${u}</tbody></table>
      ${o.total > m ? `<div class="note">Showing first ${m} rows.</div>` : ""}
      </div>`,
        k = p.indexOf("targetEccentricityXDeg"),
        P = p.indexOf("targetEccentricityYDeg"),
        T = p.indexOf("level"),
        U = [],
        C = [];
      s.rows.forEach((r, F) => {
        if (r.status === "CORRECTED") {
          if (k >= 0 && r.actualTargetEccentricityXDeg !== void 0) {
            let q = Math.hypot(Number(y[F][k]), Number(y[F][P])),
              B = Math.hypot(
                r.actualTargetEccentricityXDeg,
                r.actualTargetEccentricityYDeg ?? 0,
              );
            q > 0 && Number.isFinite(q) && U.push([q, B]);
          }
          if (T >= 0 && r.actualLevelLog10Deg !== void 0) {
            let q = Math.pow(10, Number(y[F][T]));
            q > 0 &&
              Number.isFinite(q) &&
              C.push([q, Math.pow(10, r.actualLevelLog10Deg)]);
          }
        }
      });
      let I =
          U.length || C.length
            ? `<div class="plots">${ye(
                U,
                "requested eccentricity (\xB0)",
                "actual (\xB0)",
              )}${ye(
                C,
                "requested size/spacing (\xB0)",
                "actual (\xB0)",
              )}</div>`
            : "",
        N = Xt(t.name),
        b = document.createElement("div");
      (b.className = "card"),
        (b.innerHTML = `
      <div class="fhead"><span class="fname">${mt(
        l,
      )} <span class="mark">\u2192 repaired as <b>${mt(N)}</b></span></span>
        <button class="dl" title="Requested values in the original columns are replaced with what was actually shown; the repairImputedColumns column lists the altered cells; the file is marked "-repaired"; your source file is untouched">\u2B07 repaired CSV</button></div>
      <div class="chips">${_}</div>
      ${c}
      ${x}
      ${I}
      ${D}`),
        b.querySelector(".dl").addEventListener("click", () => ke(N, qt(a, s))),
        b.querySelector(".rowtoggle input").addEventListener("change", (r) => {
          b.querySelectorAll("tr[data-st]").forEach((F) => {
            F.getAttribute("data-st") === "UNAFFECTED" &&
              F.classList.toggle("r-hidden", r.target.checked);
          });
        }),
        Yt.appendChild(b),
        et.repaired++,
        jt(Xt(l), qt(a, s)),
        Rt.push(
          `${l}: ${o.corrected} corrected / ${o.unaffected} unaffected / ${
            o.flagged
          } flagged (${o.total} rows) \u2014 fixed -> ${Xt(l)}`,
        ),
        c &&
          Rt.push(
            `  shown-vs-requested: ${
              f.eccentricityErrPct
                ? `position median ${ft(
                    Math.abs(f.eccentricityErrPct[0]),
                  )}% max ${ft(f.eccentricityErrPct[1])}%; `
                : ""
            }${
              f.sizeSpacingInflationPct
                ? `size/spacing median ${ft(
                    Math.abs(f.sizeSpacingInflationPct[0]),
                  )}% max ${ft(f.sizeSpacingInflationPct[1])}%`
                : ""
            }`,
          );
      let S = {};
      s.rows.forEach((r) => {
        r.status === "FLAGGED" &&
          (S[r.statusReason] = (S[r.statusReason] || 0) + 1);
      }),
        Object.entries(S).forEach(([r, F]) => Rt.push(`  FLAG ${F}x: ${r}`)),
        et.processed++,
        Nt();
    },
    qe = async (t) => {
      let g = [],
        l = t.items
          ? [...t.items]
              .map((s) => (s.webkitGetAsEntry ? s.webkitGetAsEntry() : null))
              .filter(Boolean)
          : [];
      if (!l.length)
        return [...t.files].map((s) => ({ file: s, relPath: s.name }));
      let a = async (s, i) => {
        if (s.isFile) {
          let o = await new Promise((p, y) => s.file(p, y));
          g.push({ file: o, relPath: i + s.name });
        } else if (s.isDirectory) {
          let o = s.createReader(),
            p = await new Promise((y, f) => o.readEntries(y, f));
          for (; p.length; ) {
            for (let y of p) await a(y, i + s.name + "/");
            p = await new Promise((y, f) => o.readEntries(y, f));
          }
        }
      };
      for (let s of l) await a(s, "");
      return g;
    },
    Kt = async (t) => {
      for (let { file: g, relPath: l } of t) {
        let a = (l || g.name).split("/").pop();
        if (!/\.csv$/i.test(a) || /^\./.test(a)) {
          et.skippedNonCsv++, Nt();
          continue;
        }
        await Ge(g, l);
      }
    },
    Ft = document.getElementById("drop"),
    Ot = document.getElementById("file"),
    Wt = document.getElementById("folder");
  Ft.addEventListener("click", (t) => {
    t.target.closest("button, input") || Ot.click();
  });
  Ft.addEventListener("keydown", (t) => {
    t.target.closest(".linkbtn") ||
      ((t.key === "Enter" || t.key === " ") &&
        (t.preventDefault(), Ot.click()));
  });
  document.getElementById("pickFiles").addEventListener("click", (t) => {
    t.stopPropagation(), Ot.click();
  });
  document.getElementById("pickFolder").addEventListener("click", (t) => {
    t.stopPropagation(), Wt.click();
  });
  Ft.addEventListener("dragover", (t) => {
    t.preventDefault(), Ft.classList.add("over");
  });
  Ft.addEventListener("dragleave", () => Ft.classList.remove("over"));
  Ft.addEventListener("drop", async (t) => {
    t.preventDefault(),
      Ft.classList.remove("over"),
      Kt(await qe(t.dataTransfer));
  });
  Ot.addEventListener("change", () => {
    Kt([...Ot.files].map((t) => ({ file: t, relPath: t.name }))),
      (Ot.value = "");
  });
  Wt.addEventListener("change", () => {
    Kt(
      [...Wt.files].map((t) => ({
        file: t,
        relPath: t.webkitRelativePath || t.name,
      })),
    ),
      (Wt.value = "");
  });
  document
    .getElementById("reportBtn")
    .addEventListener("click", () => ke("repair-report.txt", De()));
  document.getElementById("zipBtn").addEventListener("click", async () => {
    let t = new we.default();
    for (let [g, l] of et.entries) t.file(g, l);
    t.file("REPAIR-REPORT.txt", De()), await Ze(t);
  });
  var It = null,
    Ve = () => {
      let t = document.getElementById("xp-char").value || "E",
        g = document.createElement("canvas").getContext("2d");
      g.font = "700 100px Arial, sans-serif";
      let l = g.measureText(t[0]),
        a =
          l.actualBoundingBoxAscent && l.actualBoundingBoxDescent !== void 0
            ? l.actualBoundingBoxAscent + l.actualBoundingBoxDescent
            : 72;
      It = { ch: t[0], capH: a, width: l.width || 60 };
    };
  var Ce = "placement",
    _t = {};
  ["preset", "w", "h", "ppc", "dist", "ex", "ey", "grid", "ref"].forEach(
    (t) => (_t[t] = document.getElementById("xp-" + t)),
  );
  var Jt = () => {
      let t = Number(_t.w.value),
        g = Number(_t.h.value),
        l = Number(_t.ppc.value);
      return (
        _t.preset.value !== "custom" &&
          ([t, g, l] = _t.preset.value.split(",").map(Number)),
        (l = Math.max(1, l)),
        _t.preset.value === "custom" &&
          Number(_t.ppc.value) !== l &&
          (_t.ppc.value = l),
        {
          w: t,
          h: g,
          ppc: l,
          dist: Number(_t.dist.value),
          eyeXPx: Number(_t.ex.value) * l,
          eyeYPx: Number(_t.ey.value) * l,
          showGrid: _t.grid.checked,
          showRef: _t.ref.checked,
          mode: Ce,
          sizeDeg: Number(document.getElementById("xp-size").value),
          sizeDim: document.getElementById("xp-sizedim").value,
        }
      );
    },
    Ke = (t) => {
      let g = Math.max(-1, Math.min(1, (t - 1) / 0.2)),
        l = (s, i, o) => Math.round(s + (i - s) * o);
      if (g >= 0) {
        let s = g;
        return `rgb(${l(250, 212, s)},${l(250, 78, s)},${l(250, 0, s)})`;
      }
      let a = -g;
      return `rgb(${l(250, 26, a)},${l(250, 90, a)},${l(250, 200, a)})`;
    },
    Qt = () => {
      let t = Jt();
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
      let g = [t.eyeXPx, t.eyeYPx],
        l = [t.eyeXPx + t.w / 2, t.h / 2 - t.eyeYPx],
        a = { pxPerCm: t.ppc, viewingDistanceCm: t.dist, fixationXYPx: [0, 0] },
        s = { ...a, nearestPointXYZPx: g },
        i = { ...a, nearestPointXYZPx: l },
        o = 640,
        p = Math.round((o * t.h) / t.w),
        y = (C) => ((C + t.w / 2) / t.w) * o,
        f = (C) => ((t.h / 2 - C) / t.h) * p,
        _ = 52,
        c = 32,
        m = o / _,
        n = p / c,
        d = [];
      for (let C = 0; C < c; C++)
        for (let I = 0; I < _; I++) {
          let N = -t.w / 2 + ((I + 0.5) / _) * t.w,
            b = t.h / 2 - ((C + 0.5) / c) * t.h,
            S = bt([N, b], s),
            r = Math.hypot(S[0], S[1]);
          if (r < 0.5) continue;
          let F;
          if (t.mode === "size") {
            let q = t.sizeDim === "h" ? [0, 1] : [1, 0],
              B = pt(S, i),
              J = pt([S[0] + q[0] * t.sizeDeg, S[1] + q[1] * t.sizeDeg], i),
              X = bt(B, s),
              K = bt(J, s);
            F = Math.hypot(K[0] - X[0], K[1] - X[1]) / t.sizeDeg;
          } else {
            let q = pt(S, i),
              B = bt(q, s);
            F = Math.hypot(B[0], B[1]) / r;
          }
          d.push(
            `<rect x="${(I * m).toFixed(1)}" y="${(C * n).toFixed(
              1,
            )}" width="${(m + 0.5).toFixed(1)}" height="${(n + 0.5).toFixed(
              1,
            )}" fill="${Ke(F)}"/>`,
          );
        }
      let u = 5,
        w = (C, I) => {
          let N = [],
            S = (r, F) => {
              let q = "",
                B = null,
                J = Math.max(t.w, t.h) * 4,
                X = Math.max(t.w, t.h) * 3;
              for (let K = -80; K <= 80; K += 1) {
                let $ = pt(r ? [F, K] : [K, F], C);
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
                (q += `${q && !V ? "L" : "M"}${y($[0]).toFixed(1)},${f(
                  $[1],
                ).toFixed(1)}`),
                  (B = $);
              }
              q && N.push(`<path d="${q}" fill="none" ${I}/>`);
            };
          for (let r = -80; r <= 80; r += u) S(!0, r), S(!1, r);
          return N.join("");
        },
        x = "";
      if (t.showRef) {
        x += w(
          s,
          'stroke="#2e7d32" stroke-opacity="0.6" stroke-width="0.8" stroke-dasharray="5 4"',
        );
        let C = [];
        for (let I = -80; I <= 80; I += u) {
          if (I === 0) continue;
          let N = pt([I, 0], s);
          Number.isFinite(N[0]) &&
            N[0] > -t.w / 2 + 8 &&
            N[0] < t.w / 2 - 8 &&
            C.push(
              `<text x="${y(N[0]).toFixed(
                1,
              )}" y="11" font-size="9" fill="#1e6b2f" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${I}\xB0</text>`,
            );
          let b = pt([0, I], s);
          Number.isFinite(b[1]) &&
            b[1] > -t.h / 2 + 8 &&
            b[1] < t.h / 2 - 8 &&
            C.push(
              `<text x="4" y="${(f(b[1]) + 3).toFixed(
                1,
              )}" font-size="9" fill="#1e6b2f" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${I}\xB0</text>`,
            );
        }
        x += C.join("");
      }
      t.showGrid &&
        (x += w(
          i,
          'stroke="#16344d" stroke-opacity="0.85" stroke-width="1.3"',
        ));
      let D = `<circle cx="${y(0)}" cy="${f(
        0,
      )}" r="4" fill="none" stroke="#222" stroke-width="1.4"><title>fixation</title></circle>`;
      document.querySelector(".legend").innerHTML =
        t.mode === "size"
          ? '<span class="sw" style="background:#1a5ac8"></span> shown smaller than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown larger than requested'
          : '<span class="sw" style="background:#1a5ac8"></span> shown closer than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown farther than requested';
      let k = `<svg id="xp-svg" viewBox="0 0 ${o} ${p}" width="${o}" height="${p}">
    ${d.join("")}${x}${D}<g id="xp-glyphs"></g>
  </svg>`,
        P = document.getElementById("xp-plot");
      P.innerHTML = k;
      let T = document.getElementById("xp-svg"),
        U = document.createElement("div");
      (U.id = "xp-tooltip"),
        (P.style.position = "relative"),
        P.appendChild(U),
        T.addEventListener("mousemove", (C) => {
          let I = T.getBoundingClientRect(),
            N = ((C.clientX - I.left) / I.width) * t.w - t.w / 2,
            b = t.h / 2 - ((C.clientY - I.top) / I.height) * t.h,
            S = bt([N, b], s),
            r = Math.hypot(S[0], S[1]),
            F;
          if (t.mode === "size") {
            let V = t.sizeDim === "h" ? [0, 1] : [1, 0],
              G = pt(S, i),
              j = pt([S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg], i),
              st = bt(G, s),
              dt = bt(j, s),
              tt = Math.hypot(dt[0] - st[0], dt[1] - st[1]);
            (F = `<b>${Zt(
              ((tt - t.sizeDeg) / t.sizeDeg) * 100,
            )}</b> size error`),
              It || Ve();
            let nt = pt(S, s),
              rt = G,
              ct = (R, v) => {
                let h = pt(
                  [S[0] + V[0] * t.sizeDeg, S[1] + V[1] * t.sizeDeg],
                  v,
                );
                return Math.hypot(h[0] - R[0], h[1] - R[1]);
              },
              ht = ct(nt, s),
              gt = ct(rt, i),
              e = t.sizeDim === "h" ? It.capH : It.width,
              O = (R, v, h, E) =>
                `<text x="${y(R[0]).toFixed(1)}" y="${f(R[1]).toFixed(
                  1,
                )}" font-family="Arial, sans-serif" font-weight="700" font-size="${(
                  (v / e) *
                  100
                ).toFixed(
                  1,
                )}" fill="${h}" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${mt(
                  It.ch,
                )}</text><text x="${y(R[0]).toFixed(1)}" y="${(
                  f(R[1]) +
                  ((v / e) * 100) / 2 +
                  12
                ).toFixed(
                  1,
                )}" font-size="10" fill="${h}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${E}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              O(nt, ht, "#2e7d32", `requested ${t.sizeDeg}\xB0`) +
              O(rt, gt, "#16344d", `actual ${tt.toFixed(2)}\xB0`);
          } else {
            let V = pt(S, i),
              G = bt(V, s),
              j = Math.hypot(G[0], G[1]);
            F = `<b>${
              r > 0.1 ? Zt(((j - r) / r) * 100) : "\u2014"
            }</b> eccentricity error`;
            let st = pt(S, s),
              dt = (tt, nt, rt, ct) =>
                `<text x="${y(tt[0]).toFixed(1)}" y="${(
                  f(tt[1]) + (ct ? -12 : 20)
                ).toFixed(
                  1,
                )}" font-size="10" fill="${nt}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${rt}</text>`;
            T.querySelector("#xp-glyphs").innerHTML =
              `<line x1="${y(st[0]).toFixed(1)}" y1="${f(st[1]).toFixed(
                1,
              )}" x2="${y(V[0]).toFixed(1)}" y2="${f(V[1]).toFixed(
                1,
              )}" stroke="#555" stroke-width="1" stroke-opacity="0.6"/><circle cx="${y(
                st[0],
              ).toFixed(1)}" cy="${f(st[1]).toFixed(
                1,
              )}" r="7" fill="#2e7d32" fill-opacity="0.55"/><circle cx="${y(
                V[0],
              ).toFixed(1)}" cy="${f(V[1]).toFixed(
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
          (U.innerHTML = F), (U.style.display = "block");
          let q = P.getBoundingClientRect();
          (U.style.left = "0px"), (U.style.top = "0px");
          let B = U.offsetWidth,
            J = U.offsetHeight,
            X = C.clientX - q.left,
            K = C.clientY - q.top,
            A = X + 16;
          A + B > q.width - 4 && (A = X - B - 16);
          let $ = Math.min(Math.max(K - J / 2, 2), q.height - J - 2);
          U.style.transform = `translate(${A}px, ${$}px)`;
        }),
        T.addEventListener("mouseleave", () => {
          (U.style.display = "none"),
            (T.querySelector("#xp-glyphs").innerHTML = "");
        });
    },
    Je = () => {
      let t = Jt();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      let g = t.w,
        l = t.h,
        a = t.ppc,
        s = t.dist,
        i = [t.eyeXPx, t.eyeYPx],
        o = [i[0] + g / 2, l / 2 - i[1]],
        p = (c) => `<span class="st" data-tip="${mt(c)}">`,
        y = "</span>",
        f = `
    <div class="fx"><span class="lbl">pixels &rarr; angle (radial):</span>
      ${p(
        "R: radial projection of a screen-space px offset to the visual angle it subtends at the eye",
      )}<i><b>R</b>(<b>u</b>)</i>${y} = <span class="frac"><span class="num">180</span><span class="den">&pi;</span></span> atan<span class="frac"><span class="num">&Vert;<b>u</b>&Vert;</span><span class="den">${p(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${y}</span></span> &middot; <span class="frac"><span class="num"><b>u</b></span><span class="den">&Vert;<b>u</b>&Vert;</span></span>
    </div>
    <div class="fx"><span class="lbl">angle &rarr; pixels (its inverse):</span>
      ${p(
        "R\u207B\xB9: places a point that subtends a given angle \u2014 this is what draws a stimulus",
      )}<i><b>R</b><sup>&minus;1</sup>(<b>v</b>)</i>${y} = ${p(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${y} tan<span class="frac"><span class="num">&pi;&Vert;<b>v</b>&Vert;</span><span class="den">180</span></span> &middot; <span class="frac"><span class="num"><b>v</b></span><span class="den">&Vert;<b>v</b>&Vert;</span></span>
    </div>
    <div class="fx fxline-bug"><span class="lbl">drawn on screen (buggy eye):</span>
      <b class="v">p</b> = ${p(
        "n_bug: the assumed nearest point",
      )}<b class="v">n<sub>bug</sub></b>${y} + <i><b>R</b><sup>&minus;1</sup></i>(&theta; &minus; <i><b>R</b></i>(<b class="v">n<sub>bug</sub></b>))
    </div>
    <div class="fx fxline-act"><span class="lbl">what you actually saw (true eye):</span>
      <b class="v">a</b> = <i><b>R</b></i>(<b class="v">p</b> &minus; ${p(
        "n: the true nearest point",
      )}<b class="v">n</b>${y}) + <i><b>R</b></i>(<b class="v">n</b>)
    </div>
    <div class="fx"><span class="lbl">the bug, in full ${p(
      "The webcam tracker's top-left-origin coordinates were used verbatim in the center-origin frame.",
    )}(raw rc, unconverted)${y}:</span>
      <b class="v">n<sub>bug</sub></b> = ( n<sub>x</sub> + W/2 , &nbsp;H/2 &minus; n<sub>y</sub> )
    </div>
    <div class="fxvals">s ${a} px/cm&nbsp;|&nbsp;d ${s} cm&nbsp;|&nbsp;n (${
      i[0]
    }, ${i[1]}) px&nbsp;|&nbsp;n<sub>bug</sub> (${o[0]}, ${o[1]}) px</div>`,
        _ = document.getElementById("xp-formulas");
      _ && (_.innerHTML = `<div class="formulas">${f}</div>`);
    },
    ze = () => {
      let t = document.getElementById("xp-diagram");
      if (!t) return;
      let g = Jt();
      if (!(g.w > 0 && g.h > 0 && g.ppc > 0 && g.dist > 0)) return;
      let l = document.getElementById("xp-req"),
        a = Number(l.value);
      document.getElementById("xp-req-v").textContent = a;
      let s = [g.eyeXPx, g.eyeYPx],
        i = [g.eyeXPx + g.w / 2, g.h / 2 - g.eyeYPx],
        o = { pxPerCm: g.ppc, viewingDistanceCm: g.dist, fixationXYPx: [0, 0] },
        p = pt([a, 0], { ...o, nearestPointXYZPx: i }),
        y = bt(p, { ...o, nearestPointXYZPx: s }),
        f = g.w / g.ppc,
        _ = g.eyeXPx / g.ppc,
        c = _ + f / 2,
        m = p[0] / g.ppc,
        n = g.dist,
        d = 30,
        u = Math.min(-f / 2, _, m) - 6,
        w = Math.max(f / 2, c, m) + 6,
        x = 352,
        D = Math.min((x - 2 * d) / (w - u), 350 / (n + 6)),
        k = x,
        P = (u + w) / 2,
        T = (k - 2 * d) / D,
        U = P - T / 2,
        C = (K) => d + (K - U) * D,
        I = Math.round(70 + (n + 6) * D),
        N = (K) => 40 + K * D,
        b = `<line x1="${C(-f / 2)}" y1="${N(0)}" x2="${C(f / 2)}" y2="${N(
          0,
        )}" stroke="#222" stroke-width="4"/>
    <text x="${C(f / 2)}" y="${
      N(0) + 16
    }" font-size="10" fill="#444" text-anchor="end">screen (${f.toFixed(
      0,
    )} cm wide)</text>`,
        S = `<circle cx="${C(0)}" cy="${N(
          0,
        )}" r="4" fill="#222"><title>fixation</title></circle>
    <text x="${C(0) + 6}" y="${
      N(0) - 6
    }" font-size="10" fill="#222">fixation</text>`,
        r = [
          `<line x1="${C(c)}" y1="${N(n)}" x2="${C(m)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="2"/>`,
          `<line x1="${C(c)}" y1="${N(n)}" x2="${C(0)}" y2="${N(
            0,
          )}" stroke="#b26a00" stroke-width="1" stroke-dasharray="4 3"/>`,
          `<line x1="${C(_)}" y1="${N(n)}" x2="${C(m)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="2"/>`,
          `<line x1="${C(_)}" y1="${N(n)}" x2="${C(0)}" y2="${N(
            0,
          )}" stroke="#2b6cb0" stroke-width="1" stroke-dasharray="4 3"/>`,
        ].join(""),
        F = `
    <circle cx="${C(c)}" cy="${N(n)}" r="5" fill="#b26a00"/>
    <text x="${C(c)}" y="${
      N(n) + 18
    }" font-size="10" fill="#b26a00" text-anchor="middle">eye as the bug assumed</text>
    <circle cx="${C(_)}" cy="${N(n)}" r="5" fill="#2b6cb0"/>
    <text x="${C(_)}" y="${
      N(n) - 10
    }" font-size="10" fill="#2b6cb0" text-anchor="middle">your actual eye</text>`,
        q = [(c + m) / 2, n / 2],
        B = [(_ + m) / 2, n / 2],
        J = a !== 0 ? ((Math.abs(y[0]) - Math.abs(a)) / Math.abs(a)) * 100 : 0,
        X = `<circle cx="${C(m)}" cy="${N(0)}" r="4.5" fill="#b3261e"/>
    <text x="${C(m) - 6}" y="${
      N(0) - 8
    }" font-size="10" fill="#b3261e" text-anchor="end">drawn ${m.toFixed(
      1,
    )} cm</text>
    <text x="${C(q[0]) + 8}" y="${
      N(q[1]) + 4
    }" font-size="10" fill="#b26a00">requested ${a}\xB0</text>
    <text x="${C(B[0]) - 8}" y="${
      N(B[1]) - 6
    }" font-size="10" fill="#2b6cb0">actual ${y[0].toFixed(2)}\xB0${
      a ? ` (${Zt(J)})` : ""
    }</text>`;
      t.innerHTML = `<svg viewBox="0 0 ${k} ${I}" width="${k}" height="${I}">${b}${S}${r}${F}${X}</svg>`;
    },
    te = () => {
      ze(), Qt(), Je();
    };
  ["preset", "w", "h", "ppc", "grid", "ref"].forEach((t) =>
    _t[t].addEventListener("change", te),
  );
  ["dist", "ex", "ey"].forEach((t) => _t[t].addEventListener("input", te));
  document.getElementById("xp-req").addEventListener("input", ze);
  document.getElementById("xp-char").addEventListener("input", () => {
    It = null;
  });
  ["size", "sizedim"].forEach((t) =>
    document.getElementById("xp-" + t).addEventListener("input", () => {
      (document.getElementById("xp-size-v").textContent =
        document.getElementById("xp-size").value),
        Qt();
    }),
  );
  var Se = (t) => {
    (Ce = t),
      document
        .getElementById("xp-mode-pos")
        .classList.toggle("on", t === "placement"),
      document
        .getElementById("xp-mode-size")
        .classList.toggle("on", t === "size"),
      document
        .getElementById("xp-sizeopts")
        .classList.toggle("show", t === "size"),
      Qt();
  };
  document
    .getElementById("xp-mode-pos")
    .addEventListener("click", () => Se("placement"));
  document
    .getElementById("xp-mode-size")
    .addEventListener("click", () => Se("size"));
  te();
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
