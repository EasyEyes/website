/* xlsx-js-style 1.2.0-beta @ 2022-04-05T01:40:48.447Z */
var XLSX = {};
function make_xlsx_lib(a) {
  (a.version = "0.18.5"), (a.style_version = "1.2.0");
  var re,
    f = 1200,
    _ = 1252;
  "undefined" != typeof cptable
    ? (re = cptable)
    : "undefined" != typeof module &&
      "undefined" != typeof require &&
      (re = require("./cpexcel.js"));
  var t = [
      874, 932, 936, 949, 950, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257,
      1258, 1e4,
    ],
    l = {
      0: 1252,
      1: 65001,
      2: 65001,
      77: 1e4,
      128: 932,
      129: 949,
      130: 1361,
      134: 936,
      136: 950,
      161: 1253,
      162: 1254,
      163: 1258,
      177: 1255,
      178: 1256,
      186: 1257,
      204: 1251,
      222: 874,
      238: 1250,
      255: 1252,
      69: 6969,
    },
    c = function (e) {
      -1 != t.indexOf(e) && (_ = l[0] = e);
    };
  var ie = function (e) {
    c((f = e));
  };
  function h() {
    ie(1200), c(1252);
  }
  function ae(e) {
    for (var t = [], r = 0, a = e.length; r < a; ++r) t[r] = e.charCodeAt(r);
    return t;
  }
  function s(e) {
    for (var t = [], r = 0; r < e.length >> 1; ++r)
      t[r] = String.fromCharCode(
        e.charCodeAt(2 * r + 1) + (e.charCodeAt(2 * r) << 8),
      );
    return t.join("");
  }
  var ne = function (e) {
      var t = e.charCodeAt(0),
        r = e.charCodeAt(1);
      return 255 == t && 254 == r
        ? (function (e) {
            for (var t = [], r = 0; r < e.length >> 1; ++r)
              t[r] = String.fromCharCode(
                e.charCodeAt(2 * r) + (e.charCodeAt(2 * r + 1) << 8),
              );
            return t.join("");
          })(e.slice(2))
        : 254 == t && 255 == r
        ? s(e.slice(2))
        : 65279 == t
        ? e.slice(1)
        : e;
    },
    u = function (e) {
      return String.fromCharCode(e);
    },
    n = function (e) {
      return String.fromCharCode(e);
    };
  void 0 !== re &&
    ((ie = function (e) {
      c((f = e));
    }),
    (ne = function (e) {
      return 255 === e.charCodeAt(0) && 254 === e.charCodeAt(1)
        ? re.utils.decode(1200, ae(e.slice(2)))
        : e;
    }),
    (u = function (e) {
      return 1200 === f
        ? String.fromCharCode(e)
        : re.utils.decode(f, [255 & e, e >> 8])[0];
    }),
    (n = function (e) {
      return re.utils.decode(_, [e])[0];
    }));
  var oe = null,
    d = !0,
    p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  function ee(e) {
    for (var t, r, a, n, s, i = "", o = 0, c = 0, l = 0; l < e.length; )
      (n = (t = e.charCodeAt(l++)) >> 2),
        (s = ((3 & t) << 4) | ((r = e.charCodeAt(l++)) >> 4)),
        (o = ((15 & r) << 2) | ((a = e.charCodeAt(l++)) >> 6)),
        (c = 63 & a),
        isNaN(r) ? (o = c = 64) : isNaN(a) && (c = 64),
        (i += p.charAt(n) + p.charAt(s) + p.charAt(o) + p.charAt(c));
    return i;
  }
  function te(e) {
    var t,
      r,
      a,
      n,
      s,
      i,
      o = "";
    e = e.replace(/[^\w\+\/\=]/g, "");
    for (var c = 0; c < e.length; )
      (t =
        (p.indexOf(e.charAt(c++)) << 2) |
        ((n = p.indexOf(e.charAt(c++))) >> 4)),
        (o += String.fromCharCode(t)),
        (r = ((15 & n) << 4) | ((s = p.indexOf(e.charAt(c++))) >> 2)),
        64 !== s && (o += String.fromCharCode(r)),
        (a = ((3 & s) << 6) | (i = p.indexOf(e.charAt(c++)))),
        64 !== i && (o += String.fromCharCode(a));
    return o;
  }
  var se =
      "undefined" != typeof Buffer &&
      "undefined" != typeof process &&
      void 0 !== process.versions &&
      !!process.versions.node,
    ce = (function () {
      if ("undefined" == typeof Buffer) return function () {};
      var t = !Buffer.from;
      if (!t)
        try {
          Buffer.from("foo", "utf8");
        } catch (e) {
          t = !0;
        }
      return t
        ? function (e, t) {
            return t ? new Buffer(e, t) : new Buffer(e);
          }
        : Buffer.from.bind(Buffer);
    })();
  function le(e) {
    return se
      ? Buffer.alloc
        ? Buffer.alloc(e)
        : new Buffer(e)
      : new ("undefined" != typeof Uint8Array ? Uint8Array : Array)(e);
  }
  function fe(e) {
    return se
      ? Buffer.allocUnsafe
        ? Buffer.allocUnsafe(e)
        : new Buffer(e)
      : new ("undefined" != typeof Uint8Array ? Uint8Array : Array)(e);
  }
  var he = function (e) {
    return se
      ? ce(e, "binary")
      : e.split("").map(function (e) {
          return 255 & e.charCodeAt(0);
        });
  };
  function o(e) {
    if ("undefined" == typeof ArrayBuffer) return he(e);
    for (
      var t = new ArrayBuffer(e.length), r = new Uint8Array(t), a = 0;
      a != e.length;
      ++a
    )
      r[a] = 255 & e.charCodeAt(a);
    return t;
  }
  function i(e) {
    if (Array.isArray(e))
      return e
        .map(function (e) {
          return String.fromCharCode(e);
        })
        .join("");
    for (var t = [], r = 0; r < e.length; ++r) t[r] = String.fromCharCode(e[r]);
    return t.join("");
  }
  function m(e) {
    if ("undefined" == typeof ArrayBuffer) throw new Error("Unsupported");
    if (e instanceof ArrayBuffer) return m(new Uint8Array(e));
    for (var t = new Array(e.length), r = 0; r < e.length; ++r) t[r] = e[r];
    return t;
  }
  var ue = se
    ? function (e) {
        return Buffer.concat(
          e.map(function (e) {
            return Buffer.isBuffer(e) ? e : ce(e);
          }),
        );
      }
    : function (e) {
        if ("undefined" == typeof Uint8Array)
          return [].concat.apply(
            [],
            e.map(function (e) {
              return Array.isArray(e) ? e : [].slice.call(e);
            }),
          );
        for (var t = 0, r = 0, t = 0; t < e.length; ++t) r += e[t].length;
        for (
          var a, n = new Uint8Array(r), r = (t = 0);
          t < e.length;
          r += a, ++t
        )
          if (((a = e[t].length), e[t] instanceof Uint8Array)) n.set(e[t], r);
          else {
            if ("string" == typeof e[t]) throw "wtf";
            n.set(new Uint8Array(e[t]), r);
          }
        return n;
      };
  var de = /\u0000/g,
    pe = /[\u0001-\u0006]/g;
  function v(e) {
    for (var t = "", r = e.length - 1; 0 <= r; ) t += e.charAt(r--);
    return t;
  }
  function x(e, t) {
    e = "" + e;
    return t <= e.length ? e : Ge("0", t - e.length) + e;
  }
  function w(e, t) {
    e = "" + e;
    return t <= e.length ? e : Ge(" ", t - e.length) + e;
  }
  function T(e, t) {
    e = "" + e;
    return t <= e.length ? e : e + Ge(" ", t - e.length);
  }
  var g = Math.pow(2, 32);
  function E(e, t) {
    if (g < e || e < -g)
      return (
        (r = e),
        (a = t),
        (r = "" + Math.round(r)),
        a <= r.length ? r : Ge("0", a - r.length) + r
      );
    var r,
      a,
      e = Math.round(e);
    return (t = t) <= (e = "" + (e = e)).length ? e : Ge("0", t - e.length) + e;
  }
  function A(e, t) {
    return (
      (t = t || 0),
      e.length >= 7 + t &&
        103 == (32 | e.charCodeAt(t)) &&
        101 == (32 | e.charCodeAt(t + 1)) &&
        110 == (32 | e.charCodeAt(t + 2)) &&
        101 == (32 | e.charCodeAt(t + 3)) &&
        114 == (32 | e.charCodeAt(t + 4)) &&
        97 == (32 | e.charCodeAt(t + 5)) &&
        108 == (32 | e.charCodeAt(t + 6))
    );
  }
  var C = [
      ["Sun", "Sunday"],
      ["Mon", "Monday"],
      ["Tue", "Tuesday"],
      ["Wed", "Wednesday"],
      ["Thu", "Thursday"],
      ["Fri", "Friday"],
      ["Sat", "Saturday"],
    ],
    R = [
      ["J", "Jan", "January"],
      ["F", "Feb", "February"],
      ["M", "Mar", "March"],
      ["A", "Apr", "April"],
      ["M", "May", "May"],
      ["J", "Jun", "June"],
      ["J", "Jul", "July"],
      ["A", "Aug", "August"],
      ["S", "Sep", "September"],
      ["O", "Oct", "October"],
      ["N", "Nov", "November"],
      ["D", "Dec", "December"],
    ];
  var me = {
      0: "General",
      1: "0",
      2: "0.00",
      3: "#,##0",
      4: "#,##0.00",
      9: "0%",
      10: "0.00%",
      11: "0.00E+00",
      12: "# ?/?",
      13: "# ??/??",
      14: "m/d/yy",
      15: "d-mmm-yy",
      16: "d-mmm",
      17: "mmm-yy",
      18: "h:mm AM/PM",
      19: "h:mm:ss AM/PM",
      20: "h:mm",
      21: "h:mm:ss",
      22: "m/d/yy h:mm",
      37: "#,##0 ;(#,##0)",
      38: "#,##0 ;[Red](#,##0)",
      39: "#,##0.00;(#,##0.00)",
      40: "#,##0.00;[Red](#,##0.00)",
      45: "mm:ss",
      46: "[h]:mm:ss",
      47: "mmss.0",
      48: "##0.0E+0",
      49: "@",
      56: '"上午/下午 "hh"時"mm"分"ss"秒 "',
    },
    b = {
      5: 37,
      6: 38,
      7: 39,
      8: 40,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      27: 14,
      28: 14,
      29: 14,
      30: 14,
      31: 14,
      50: 14,
      51: 14,
      52: 14,
      53: 14,
      54: 14,
      55: 14,
      56: 14,
      57: 14,
      58: 14,
      59: 1,
      60: 2,
      61: 3,
      62: 4,
      67: 9,
      68: 10,
      69: 12,
      70: 13,
      71: 14,
      72: 14,
      73: 15,
      74: 16,
      75: 17,
      76: 20,
      77: 21,
      78: 22,
      79: 45,
      80: 46,
      81: 47,
      82: 0,
    },
    k = {
      5: '"$"#,##0_);\\("$"#,##0\\)',
      63: '"$"#,##0_);\\("$"#,##0\\)',
      6: '"$"#,##0_);[Red]\\("$"#,##0\\)',
      64: '"$"#,##0_);[Red]\\("$"#,##0\\)',
      7: '"$"#,##0.00_);\\("$"#,##0.00\\)',
      65: '"$"#,##0.00_);\\("$"#,##0.00\\)',
      8: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
      66: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
      41: '_(* #,##0_);_(* \\(#,##0\\);_(* "-"_);_(@_)',
      42: '_("$"* #,##0_);_("$"* \\(#,##0\\);_("$"* "-"_);_(@_)',
      43: '_(* #,##0.00_);_(* \\(#,##0.00\\);_(* "-"??_);_(@_)',
      44: '_("$"* #,##0.00_);_("$"* \\(#,##0.00\\);_("$"* "-"??_);_(@_)',
    };
  function y(e, t, r) {
    for (
      var a = e < 0 ? -1 : 1,
        n = e * a,
        s = 0,
        i = 1,
        o = 0,
        c = 1,
        l = 0,
        f = 0,
        h = Math.floor(n);
      l < t &&
      ((o = (h = Math.floor(n)) * i + s), (f = h * l + c), !(n - h < 5e-8));

    )
      (n = 1 / (n - h)), (s = i), (i = o), (c = l), (l = f);
    if ((t < f && (o = t < l ? ((f = c), s) : ((f = l), i)), !r))
      return [0, a * o, f];
    r = Math.floor((a * o) / f);
    return [r, a * o - r * f, f];
  }
  function L(e, t, r) {
    if (2958465 < e || e < 0) return null;
    var a = 0 | e,
      n = Math.floor(86400 * (e - a)),
      s = 0,
      i = [],
      e = {
        D: a,
        T: n,
        u: 86400 * (e - a) - n,
        y: 0,
        m: 0,
        d: 0,
        H: 0,
        M: 0,
        S: 0,
        q: 0,
      };
    return (
      Math.abs(e.u) < 1e-6 && (e.u = 0),
      t && t.date1904 && (a += 1462),
      0.9999 < e.u && ((e.u = 0), 86400 == ++n && ((e.T = n = 0), ++a, ++e.D)),
      60 === a
        ? ((i = r ? [1317, 10, 29] : [1900, 2, 29]), (s = 3))
        : 0 === a
        ? ((i = r ? [1317, 8, 29] : [1900, 1, 0]), (s = 6))
        : (60 < a && --a,
          (t = new Date(1900, 0, 1)).setDate(t.getDate() + a - 1),
          (i = [t.getFullYear(), t.getMonth() + 1, t.getDate()]),
          (s = t.getDay()),
          a < 60 && (s = (s + 6) % 7),
          r &&
            (s = (function (e, t) {
              t[0] -= 581;
              t = e.getDay();
              e < 60 && (t = (t + 6) % 7);
              return t;
            })(t, i))),
      (e.y = i[0]),
      (e.m = i[1]),
      (e.d = i[2]),
      (e.S = n % 60),
      (n = Math.floor(n / 60)),
      (e.M = n % 60),
      (n = Math.floor(n / 60)),
      (e.H = n),
      (e.q = s),
      e
    );
  }
  var S = new Date(1899, 11, 31, 0, 0, 0),
    O = S.getTime(),
    I = new Date(1900, 2, 1, 0, 0, 0);
  function N(e, t) {
    var r = e.getTime();
    return (
      t ? (r -= 1262304e5) : I <= e && (r += 864e5),
      (r - (O + 6e4 * (e.getTimezoneOffset() - S.getTimezoneOffset()))) / 864e5
    );
  }
  function F(e) {
    return -1 == e.indexOf(".")
      ? e
      : e.replace(/(?:\.0*|(\.\d*[1-9])0+)$/, "$1");
  }
  function D(e) {
    var t,
      r,
      a,
      n = Math.floor(Math.log(Math.abs(e)) * Math.LOG10E),
      s =
        -4 <= n && n <= -1
          ? e.toPrecision(10 + n)
          : Math.abs(n) <= 9
          ? ((r = (t = e) < 0 ? 12 : 11),
            (a = F(t.toFixed(12))).length <= r ||
            (a = t.toPrecision(10)).length <= r
              ? a
              : t.toExponential(5))
          : 10 === n
          ? e.toFixed(10).substr(0, 12)
          : (s = F((e = e).toFixed(11))).length > (e < 0 ? 12 : 11) ||
            "0" === s ||
            "-0" === s
          ? e.toPrecision(6)
          : s;
    return F(
      -1 == (s = s.toUpperCase()).indexOf("E")
        ? s
        : s
            .replace(/(?:\.0*|(\.\d*[1-9])0+)[Ee]/, "$1E")
            .replace(/(E[+-])(\d)$/, "$10$2"),
    );
  }
  function P(e, t) {
    switch (typeof e) {
      case "string":
        return e;
      case "boolean":
        return e ? "TRUE" : "FALSE";
      case "number":
        return (0 | e) === e ? e.toString(10) : D(e);
      case "undefined":
        return "";
      case "object":
        if (null == e) return "";
        if (e instanceof Date) return ve(14, N(e, t && t.date1904), t);
    }
    throw new Error("unsupported value in General format: " + e);
  }
  function M(e) {
    if (e.length <= 3) return e;
    for (var t = e.length % 3, r = e.substr(0, t); t != e.length; t += 3)
      r += (0 < r.length ? "," : "") + e.substr(t, 3);
    return r;
  }
  var U = /%/g;
  var B = /# (\?+)( ?)\/( ?)(\d+)/;
  var W = /^#*0*\.([0#]+)/,
    H = /\).*[0#]/,
    z = /\(###\) ###\\?-####/;
  function V(e) {
    for (var t, r = "", a = 0; a != e.length; ++a)
      switch ((t = e.charCodeAt(a))) {
        case 35:
          break;
        case 63:
          r += " ";
          break;
        case 48:
          r += "0";
          break;
        default:
          r += String.fromCharCode(t);
      }
    return r;
  }
  function G(e, t) {
    t = Math.pow(10, t);
    return "" + Math.round(e * t) / t;
  }
  function j(e, t) {
    var r = e - Math.floor(e),
      e = Math.pow(10, t);
    return t < ("" + Math.round(r * e)).length ? 0 : Math.round(r * e);
  }
  function X(e, t, r) {
    if (40 === e.charCodeAt(0) && !t.match(H)) {
      var a = t.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
      return 0 <= r ? X("n", a, r) : "(" + X("n", a, -r) + ")";
    }
    if (44 === t.charCodeAt(t.length - 1))
      return (function (e, t, r) {
        for (var a = t.length - 1; 44 === t.charCodeAt(a - 1); ) --a;
        return K(e, t.substr(0, a), r / Math.pow(10, 3 * (t.length - a)));
      })(e, t, r);
    if (-1 !== t.indexOf("%"))
      return (
        (o = e),
        (l = r),
        (c = (f = t).replace(U, "")),
        (f = f.length - c.length),
        K(o, c, l * Math.pow(10, 2 * f)) + Ge("%", f)
      );
    var n;
    if (-1 !== t.indexOf("E"))
      return (function e(t, r) {
        var a,
          n = t.indexOf("E") - t.indexOf(".") - 1;
        if (t.match(/^#+0.0E\+0$/)) {
          if (0 == r) return "0.0E+0";
          if (r < 0) return "-" + e(t, -r);
          var s = t.indexOf(".");
          -1 === s && (s = t.indexOf("E"));
          var i = Math.floor(Math.log(r) * Math.LOG10E) % s;
          if (
            (i < 0 && (i += s),
            -1 ===
              (a = (r / Math.pow(10, i)).toPrecision(
                1 + n + ((s + i) % s),
              )).indexOf("e"))
          ) {
            var o = Math.floor(Math.log(r) * Math.LOG10E);
            for (
              -1 === a.indexOf(".")
                ? (a =
                    a.charAt(0) + "." + a.substr(1) + "E+" + (o - a.length + i))
                : (a += "E+" + (o - i));
              "0." === a.substr(0, 2);

            )
              a = (a = a.charAt(0) + a.substr(2, s) + "." + a.substr(2 + s))
                .replace(/^0+([1-9])/, "$1")
                .replace(/^0+\./, "0.");
            a = a.replace(/\+-/, "-");
          }
          a = a.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function (e, t, r, a) {
            return t + r + a.substr(0, (s + i) % s) + "." + a.substr(i) + "E";
          });
        } else a = r.toExponential(n);
        return (
          t.match(/E\+00$/) &&
            a.match(/e[+-]\d$/) &&
            (a = a.substr(0, a.length - 1) + "0" + a.charAt(a.length - 1)),
          (a =
            t.match(/E\-/) && a.match(/e\+/)
              ? a.replace(/e\+/, "e")
              : a).replace("e", "E")
        );
      })(t, r);
    if (36 === t.charCodeAt(0))
      return "$" + X(e, t.substr(" " == t.charAt(1) ? 2 : 1), r);
    var s,
      i,
      o,
      c,
      l,
      f,
      h,
      u = Math.abs(r),
      d = r < 0 ? "-" : "";
    if (t.match(/^00+$/)) return d + E(u, t.length);
    if (t.match(/^[#?]+$/))
      return (n = "0" === (n = E(r, 0)) ? "" : n).length > t.length
        ? n
        : V(t.substr(0, t.length - n.length)) + n;
    if ((s = t.match(B)))
      return (
        (h = s),
        (o = u),
        (c = d),
        (l = parseInt(h[4], 10)),
        (f = Math.round(o * l)),
        (o = Math.floor(f / l)),
        l,
        c +
          (0 === o ? "" : "" + o) +
          " " +
          (0 == (f -= o * l)
            ? Ge(" ", h[1].length + 1 + h[4].length)
            : w(f, h[1].length) + h[2] + "/" + h[3] + x(l, h[4].length))
      );
    if (t.match(/^#+0+$/)) return d + E(u, t.length - t.indexOf("0"));
    if ((s = t.match(W)))
      return (
        (n = G(r, s[1].length)
          .replace(/^([^\.]+)$/, "$1." + V(s[1]))
          .replace(/\.$/, "." + V(s[1]))
          .replace(/\.(\d*)$/, function (e, t) {
            return "." + t + Ge("0", V(s[1]).length - t.length);
          })),
        -1 !== t.indexOf("0.") ? n : n.replace(/^0\./, ".")
      );
    if (((t = t.replace(/^#+([0.])/, "$1")), (s = t.match(/^(0*)\.(#*)$/))))
      return (
        d +
        G(u, s[2].length)
          .replace(/\.(\d*[1-9])0*$/, ".$1")
          .replace(/^(-?\d*)$/, "$1.")
          .replace(/^0\./, s[1].length ? "0." : ".")
      );
    if ((s = t.match(/^#{1,3},##0(\.?)$/))) return d + M(E(u, 0));
    if ((s = t.match(/^#,##0\.([#0]*0)$/)))
      return r < 0
        ? "-" + X(e, t, -r)
        : M(
            "" +
              (Math.floor(r) +
                ((h = r),
                (p = s[1].length) <
                ("" + Math.round((h - Math.floor(h)) * Math.pow(10, p))).length
                  ? 1
                  : 0)),
          ) +
            "." +
            x(j(r, s[1].length), s[1].length);
    if ((s = t.match(/^#,#*,#0/))) return X(e, t.replace(/^#,#*,/, ""), r);
    if ((s = t.match(/^([0#]+)(\\?-([0#]+))+$/)))
      return (
        (n = v(X(e, t.replace(/[\\-]/g, ""), r))),
        (i = 0),
        v(
          v(t.replace(/\\/g, "")).replace(/[0#]/g, function (e) {
            return i < n.length ? n.charAt(i++) : "0" === e ? "0" : "";
          }),
        )
      );
    if (t.match(z))
      return (
        "(" +
        (n = X(e, "##########", r)).substr(0, 3) +
        ") " +
        n.substr(3, 3) +
        "-" +
        n.substr(6)
      );
    var p = "";
    if ((s = t.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))
      return (
        (i = Math.min(s[4].length, 7)),
        (m = y(u, Math.pow(10, i) - 1, !1)),
        (n = d),
        " " == (p = K("n", s[1], m[1])).charAt(p.length - 1) &&
          (p = p.substr(0, p.length - 1) + "0"),
        (n += p + s[2] + "/" + s[3]),
        (p = T(m[2], i)).length < s[4].length &&
          (p = V(s[4].substr(s[4].length - p.length)) + p),
        (n += p)
      );
    if ((s = t.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))
      return (
        (i = Math.min(Math.max(s[1].length, s[4].length), 7)),
        d +
          ((m = y(u, Math.pow(10, i) - 1, !0))[0] || (m[1] ? "" : "0")) +
          " " +
          (m[1]
            ? w(m[1], i) + s[2] + "/" + s[3] + T(m[2], i)
            : Ge(" ", 2 * i + 1 + s[2].length + s[3].length))
      );
    if ((s = t.match(/^[#0?]+$/)))
      return (
        (n = E(r, 0)),
        t.length <= n.length ? n : V(t.substr(0, t.length - n.length)) + n
      );
    if ((s = t.match(/^([#0?]+)\.([#0]+)$/))) {
      (n =
        "" + r.toFixed(Math.min(s[2].length, 10)).replace(/([^0])0+$/, "$1")),
        (i = n.indexOf("."));
      var m = t.indexOf(".") - i,
        g = t.length - n.length - m;
      return V(t.substr(0, m) + n + t.substr(t.length - g));
    }
    if ((s = t.match(/^00,000\.([#0]*0)$/)))
      return (
        (i = j(r, s[1].length)),
        r < 0
          ? "-" + X(e, t, -r)
          : M(
              (g = r) < 2147483647 && -2147483648 < g
                ? "" + (0 <= g ? 0 | g : (g - 1) | 0)
                : "" + Math.floor(g),
            )
              .replace(/^\d,\d{3}$/, "0$&")
              .replace(/^\d*$/, function (e) {
                return "00," + (e.length < 3 ? x(0, 3 - e.length) : "") + e;
              }) +
            "." +
            x(i, s[1].length)
      );
    switch (t) {
      case "###,##0.00":
        return X(e, "#,##0.00", r);
      case "###,###":
      case "##,###":
      case "#,###":
        var b = M(E(u, 0));
        return "0" !== b ? d + b : "";
      case "###,###.00":
        return X(e, "###,##0.00", r).replace(/^0\./, ".");
      case "#,###.00":
        return X(e, "#,##0.00", r).replace(/^0\./, ".");
    }
    throw new Error("unsupported format |" + t + "|");
  }
  function Y(e, t, r) {
    if (40 === e.charCodeAt(0) && !t.match(H)) {
      var a = t.replace(/\( */, "").replace(/ \)/, "").replace(/\)/, "");
      return 0 <= r ? Y("n", a, r) : "(" + Y("n", a, -r) + ")";
    }
    if (44 === t.charCodeAt(t.length - 1))
      return (function (e, t, r) {
        for (var a = t.length - 1; 44 === t.charCodeAt(a - 1); ) --a;
        return K(e, t.substr(0, a), r / Math.pow(10, 3 * (t.length - a)));
      })(e, t, r);
    if (-1 !== t.indexOf("%"))
      return (
        (n = e),
        (i = r),
        (a = (s = t).replace(U, "")),
        (s = s.length - a.length),
        K(n, a, i * Math.pow(10, 2 * s)) + Ge("%", s)
      );
    var n, s, i, o;
    if (-1 !== t.indexOf("E"))
      return (function e(t, r) {
        var a,
          n = t.indexOf("E") - t.indexOf(".") - 1;
        if (t.match(/^#+0.0E\+0$/)) {
          if (0 == r) return "0.0E+0";
          if (r < 0) return "-" + e(t, -r);
          var s = t.indexOf(".");
          -1 === s && (s = t.indexOf("E"));
          var i,
            o = Math.floor(Math.log(r) * Math.LOG10E) % s;
          o < 0 && (o += s),
            (a = (r / Math.pow(10, o)).toPrecision(
              1 + n + ((s + o) % s),
            )).match(/[Ee]/) ||
              ((i = Math.floor(Math.log(r) * Math.LOG10E)),
              -1 === a.indexOf(".")
                ? (a =
                    a.charAt(0) + "." + a.substr(1) + "E+" + (i - a.length + o))
                : (a += "E+" + (i - o)),
              (a = a.replace(/\+-/, "-"))),
            (a = a.replace(/^([+-]?)(\d*)\.(\d*)[Ee]/, function (e, t, r, a) {
              return t + r + a.substr(0, (s + o) % s) + "." + a.substr(o) + "E";
            }));
        } else a = r.toExponential(n);
        return (
          t.match(/E\+00$/) &&
            a.match(/e[+-]\d$/) &&
            (a = a.substr(0, a.length - 1) + "0" + a.charAt(a.length - 1)),
          (a =
            t.match(/E\-/) && a.match(/e\+/)
              ? a.replace(/e\+/, "e")
              : a).replace("e", "E")
        );
      })(t, r);
    if (36 === t.charCodeAt(0))
      return "$" + Y(e, t.substr(" " == t.charAt(1) ? 2 : 1), r);
    var c,
      l,
      f = Math.abs(r),
      h = r < 0 ? "-" : "";
    if (t.match(/^00+$/)) return h + x(f, t.length);
    if (t.match(/^[#?]+$/))
      return (o = 0 === r ? "" : "" + r).length > t.length
        ? o
        : V(t.substr(0, t.length - o.length)) + o;
    if ((c = t.match(B)))
      return (
        h +
        (0 === (u = f) ? "" : "" + u) +
        Ge(" ", (u = c)[1].length + 2 + u[4].length)
      );
    if (t.match(/^#+0+$/)) return h + x(f, t.length - t.indexOf("0"));
    if ((c = t.match(W)))
      return (
        (o = (o = ("" + r)
          .replace(/^([^\.]+)$/, "$1." + V(c[1]))
          .replace(/\.$/, "." + V(c[1]))).replace(/\.(\d*)$/, function (e, t) {
          return "." + t + Ge("0", V(c[1]).length - t.length);
        })),
        -1 !== t.indexOf("0.") ? o : o.replace(/^0\./, ".")
      );
    if (((t = t.replace(/^#+([0.])/, "$1")), (c = t.match(/^(0*)\.(#*)$/))))
      return (
        h +
        ("" + f)
          .replace(/\.(\d*[1-9])0*$/, ".$1")
          .replace(/^(-?\d*)$/, "$1.")
          .replace(/^0\./, c[1].length ? "0." : ".")
      );
    if ((c = t.match(/^#{1,3},##0(\.?)$/))) return h + M("" + f);
    if ((c = t.match(/^#,##0\.([#0]*0)$/)))
      return r < 0 ? "-" + Y(e, t, -r) : M("" + r) + "." + Ge("0", c[1].length);
    if ((c = t.match(/^#,#*,#0/))) return Y(e, t.replace(/^#,#*,/, ""), r);
    if ((c = t.match(/^([0#]+)(\\?-([0#]+))+$/)))
      return (
        (o = v(Y(e, t.replace(/[\\-]/g, ""), r))),
        (l = 0),
        v(
          v(t.replace(/\\/g, "")).replace(/[0#]/g, function (e) {
            return l < o.length ? o.charAt(l++) : "0" === e ? "0" : "";
          }),
        )
      );
    if (t.match(z))
      return (
        "(" +
        (o = Y(e, "##########", r)).substr(0, 3) +
        ") " +
        o.substr(3, 3) +
        "-" +
        o.substr(6)
      );
    var u = "";
    if ((c = t.match(/^([#0?]+)( ?)\/( ?)([#0?]+)/)))
      return (
        (l = Math.min(c[4].length, 7)),
        (d = y(f, Math.pow(10, l) - 1, !1)),
        (o = h),
        " " == (u = K("n", c[1], d[1])).charAt(u.length - 1) &&
          (u = u.substr(0, u.length - 1) + "0"),
        (o += u + c[2] + "/" + c[3]),
        (u = T(d[2], l)).length < c[4].length &&
          (u = V(c[4].substr(c[4].length - u.length)) + u),
        (o += u)
      );
    if ((c = t.match(/^# ([#0?]+)( ?)\/( ?)([#0?]+)/)))
      return (
        (l = Math.min(Math.max(c[1].length, c[4].length), 7)),
        h +
          ((d = y(f, Math.pow(10, l) - 1, !0))[0] || (d[1] ? "" : "0")) +
          " " +
          (d[1]
            ? w(d[1], l) + c[2] + "/" + c[3] + T(d[2], l)
            : Ge(" ", 2 * l + 1 + c[2].length + c[3].length))
      );
    if ((c = t.match(/^[#0?]+$/)))
      return (
        (o = "" + r),
        t.length <= o.length ? o : V(t.substr(0, t.length - o.length)) + o
      );
    if ((c = t.match(/^([#0]+)\.([#0]+)$/))) {
      (o =
        "" + r.toFixed(Math.min(c[2].length, 10)).replace(/([^0])0+$/, "$1")),
        (l = o.indexOf("."));
      var u = t.indexOf(".") - l,
        d = t.length - o.length - u;
      return V(t.substr(0, u) + o + t.substr(t.length - d));
    }
    if ((c = t.match(/^00,000\.([#0]*0)$/)))
      return r < 0
        ? "-" + Y(e, t, -r)
        : M("" + r)
            .replace(/^\d,\d{3}$/, "0$&")
            .replace(/^\d*$/, function (e) {
              return "00," + (e.length < 3 ? x(0, 3 - e.length) : "") + e;
            }) +
            "." +
            x(0, c[1].length);
    switch (t) {
      case "###,###":
      case "##,###":
      case "#,###":
        var p = M("" + f);
        return "0" !== p ? h + p : "";
      default:
        if (t.match(/\.[0#?]*$/))
          return (
            Y(e, t.slice(0, t.lastIndexOf(".")), r) +
            V(t.slice(t.lastIndexOf(".")))
          );
    }
    throw new Error("unsupported format |" + t + "|");
  }
  function K(e, t, r) {
    return ((0 | r) === r ? Y : X)(e, t, r);
  }
  var J = /\[[HhMmSs\u0E0A\u0E19\u0E17]*\]/;
  function q(e) {
    for (var t = 0, r = "", a = ""; t < e.length; )
      switch ((r = e.charAt(t))) {
        case "G":
          A(e, t) && (t += 6), t++;
          break;
        case '"':
          for (; 34 !== e.charCodeAt(++t) && t < e.length; );
          ++t;
          break;
        case "\\":
        case "_":
          t += 2;
          break;
        case "@":
          ++t;
          break;
        case "B":
        case "b":
          if ("1" === e.charAt(t + 1) || "2" === e.charAt(t + 1)) return !0;
        case "M":
        case "D":
        case "Y":
        case "H":
        case "S":
        case "E":
        case "m":
        case "d":
        case "y":
        case "h":
        case "s":
        case "e":
        case "g":
          return !0;
        case "A":
        case "a":
        case "上":
          if ("A/P" === e.substr(t, 3).toUpperCase()) return !0;
          if ("AM/PM" === e.substr(t, 5).toUpperCase()) return !0;
          if ("上午/下午" === e.substr(t, 5).toUpperCase()) return !0;
          ++t;
          break;
        case "[":
          for (a = r; "]" !== e.charAt(t++) && t < e.length; ) a += e.charAt(t);
          if (a.match(J)) return !0;
          break;
        case ".":
        case "0":
        case "#":
          for (
            ;
            t < e.length &&
            (-1 < "0#?.,E+-%".indexOf((r = e.charAt(++t))) ||
              ("\\" == r &&
                "-" == e.charAt(t + 1) &&
                -1 < "0#".indexOf(e.charAt(t + 2))));

          );
          break;
        case "?":
          for (; e.charAt(++t) === r; );
          break;
        case "*":
          ++t, (" " != e.charAt(t) && "*" != e.charAt(t)) || ++t;
          break;
        case "(":
        case ")":
          ++t;
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          for (; t < e.length && -1 < "0123456789".indexOf(e.charAt(++t)); );
          break;
        case " ":
        default:
          ++t;
      }
    return !1;
  }
  function Z(e, t, r, a) {
    for (
      var n, s, i, o = [], c = "", l = 0, f = "", h = "t", u = "H";
      l < e.length;

    )
      switch ((f = e.charAt(l))) {
        case "G":
          if (!A(e, l))
            throw new Error("unrecognized character " + f + " in " + e);
          (o[o.length] = { t: "G", v: "General" }), (l += 7);
          break;
        case '"':
          for (c = ""; 34 !== (i = e.charCodeAt(++l)) && l < e.length; )
            c += String.fromCharCode(i);
          (o[o.length] = { t: "t", v: c }), ++l;
          break;
        case "\\":
          var d = e.charAt(++l),
            p = "(" === d || ")" === d ? d : "t";
          (o[o.length] = { t: p, v: d }), ++l;
          break;
        case "_":
          (o[o.length] = { t: "t", v: " " }), (l += 2);
          break;
        case "@":
          (o[o.length] = { t: "T", v: t }), ++l;
          break;
        case "B":
        case "b":
          if ("1" === e.charAt(l + 1) || "2" === e.charAt(l + 1)) {
            if (null == n && null == (n = L(t, r, "2" === e.charAt(l + 1))))
              return "";
            (o[o.length] = { t: "X", v: e.substr(l, 2) }), (h = f), (l += 2);
            break;
          }
        case "M":
        case "D":
        case "Y":
        case "H":
        case "S":
        case "E":
          f = f.toLowerCase();
        case "m":
        case "d":
        case "y":
        case "h":
        case "s":
        case "e":
        case "g":
          if (t < 0) return "";
          if (null == n && null == (n = L(t, r))) return "";
          for (c = f; ++l < e.length && e.charAt(l).toLowerCase() === f; )
            c += f;
          "h" === (f = "m" === f && "h" === h.toLowerCase() ? "M" : f) &&
            (f = u),
            (o[o.length] = { t: f, v: c }),
            (h = f);
          break;
        case "A":
        case "a":
        case "上":
          d = { t: f, v: f };
          if (
            (null == n && (n = L(t, r)),
            "A/P" === e.substr(l, 3).toUpperCase()
              ? (null != n && (d.v = 12 <= n.H ? "P" : "A"),
                (d.t = "T"),
                (u = "h"),
                (l += 3))
              : "AM/PM" === e.substr(l, 5).toUpperCase()
              ? (null != n && (d.v = 12 <= n.H ? "PM" : "AM"),
                (d.t = "T"),
                (l += 5),
                (u = "h"))
              : "上午/下午" === e.substr(l, 5).toUpperCase()
              ? (null != n && (d.v = 12 <= n.H ? "下午" : "上午"),
                (d.t = "T"),
                (l += 5),
                (u = "h"))
              : ((d.t = "t"), ++l),
            null == n && "T" === d.t)
          )
            return "";
          (o[o.length] = d), (h = f);
          break;
        case "[":
          for (c = f; "]" !== e.charAt(l++) && l < e.length; ) c += e.charAt(l);
          if ("]" !== c.slice(-1)) throw 'unterminated "[" block: |' + c + "|";
          if (c.match(J)) {
            if (null == n && null == (n = L(t, r))) return "";
            (o[o.length] = { t: "Z", v: c.toLowerCase() }), (h = c.charAt(1));
          } else
            -1 < c.indexOf("$") &&
              ((c = (c.match(/\$([^-\[\]]*)/) || [])[1] || "$"),
              q(e) || (o[o.length] = { t: "t", v: c }));
          break;
        case ".":
          if (null != n) {
            for (c = f; ++l < e.length && "0" === (f = e.charAt(l)); ) c += f;
            o[o.length] = { t: "s", v: c };
            break;
          }
        case "0":
        case "#":
          for (
            c = f;
            ++l < e.length && -1 < "0#?.,E+-%".indexOf((f = e.charAt(l)));

          )
            c += f;
          o[o.length] = { t: "n", v: c };
          break;
        case "?":
          for (c = f; e.charAt(++l) === f; ) c += f;
          (o[o.length] = { t: f, v: c }), (h = f);
          break;
        case "*":
          ++l, (" " != e.charAt(l) && "*" != e.charAt(l)) || ++l;
          break;
        case "(":
        case ")":
          (o[o.length] = { t: 1 === a ? "t" : f, v: f }), ++l;
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          for (
            c = f;
            l < e.length && -1 < "0123456789".indexOf(e.charAt(++l));

          )
            c += e.charAt(l);
          o[o.length] = { t: "D", v: c };
          break;
        case " ":
          (o[o.length] = { t: f, v: f }), ++l;
          break;
        case "$":
          (o[o.length] = { t: "t", v: "$" }), ++l;
          break;
        default:
          if (-1 === ",$-+/():!^&'~{}<>=€acfijklopqrtuvwxzP".indexOf(f))
            throw new Error("unrecognized character " + f + " in " + e);
          (o[o.length] = { t: "t", v: f }), ++l;
      }
    var m,
      g = 0,
      b = 0;
    for (l = o.length - 1, h = "t"; 0 <= l; --l)
      switch (o[l].t) {
        case "h":
        case "H":
          (o[l].t = u), (h = "h"), g < 1 && (g = 1);
          break;
        case "s":
          (m = o[l].v.match(/\.0+$/)) && (b = Math.max(b, m[0].length - 1)),
            g < 3 && (g = 3);
        case "d":
        case "y":
        case "M":
        case "e":
          h = o[l].t;
          break;
        case "m":
          "s" === h && ((o[l].t = "M"), g < 2 && (g = 2));
          break;
        case "X":
          break;
        case "Z":
          (g =
            (g = g < 1 && o[l].v.match(/[Hh]/) ? 1 : g) < 2 &&
            o[l].v.match(/[Mm]/)
              ? 2
              : g) < 3 &&
            o[l].v.match(/[Ss]/) &&
            (g = 3);
      }
    switch (g) {
      case 0:
        break;
      case 1:
        0.5 <= n.u && ((n.u = 0), ++n.S),
          60 <= n.S && ((n.S = 0), ++n.M),
          60 <= n.M && ((n.M = 0), ++n.H);
        break;
      case 2:
        0.5 <= n.u && ((n.u = 0), ++n.S), 60 <= n.S && ((n.S = 0), ++n.M);
    }
    var v,
      w = "";
    for (l = 0; l < o.length; ++l)
      switch (o[l].t) {
        case "t":
        case "T":
        case " ":
        case "D":
          break;
        case "X":
          (o[l].v = ""), (o[l].t = ";");
          break;
        case "d":
        case "m":
        case "y":
        case "h":
        case "H":
        case "M":
        case "s":
        case "e":
        case "b":
        case "Z":
          (o[l].v = (function (e, t, r, a) {
            var n,
              s = "",
              i = 0,
              o = 0,
              c = r.y,
              l = 0;
            switch (e) {
              case 98:
                c = r.y + 543;
              case 121:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = c % 100), (l = 2);
                    break;
                  default:
                    (n = c % 1e4), (l = 4);
                }
                break;
              case 109:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = r.m), (l = t.length);
                    break;
                  case 3:
                    return R[r.m - 1][1];
                  case 5:
                    return R[r.m - 1][0];
                  default:
                    return R[r.m - 1][2];
                }
                break;
              case 100:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = r.d), (l = t.length);
                    break;
                  case 3:
                    return C[r.q][0];
                  default:
                    return C[r.q][1];
                }
                break;
              case 104:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = 1 + ((r.H + 11) % 12)), (l = t.length);
                    break;
                  default:
                    throw "bad hour format: " + t;
                }
                break;
              case 72:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = r.H), (l = t.length);
                    break;
                  default:
                    throw "bad hour format: " + t;
                }
                break;
              case 77:
                switch (t.length) {
                  case 1:
                  case 2:
                    (n = r.M), (l = t.length);
                    break;
                  default:
                    throw "bad minute format: " + t;
                }
                break;
              case 115:
                if (
                  "s" != t &&
                  "ss" != t &&
                  ".0" != t &&
                  ".00" != t &&
                  ".000" != t
                )
                  throw "bad second format: " + t;
                return 0 !== r.u || ("s" != t && "ss" != t)
                  ? (60 *
                      (o = 2 <= a ? (3 === a ? 1e3 : 100) : 1 === a ? 10 : 1) <=
                      (i = Math.round(o * (r.S + r.u))) && (i = 0),
                    "s" === t
                      ? 0 === i
                        ? "0"
                        : "" + i / o
                      : ((s = x(i, 2 + a)),
                        "ss" === t
                          ? s.substr(0, 2)
                          : "." + s.substr(2, t.length - 1)))
                  : x(r.S, t.length);
              case 90:
                switch (t) {
                  case "[h]":
                  case "[hh]":
                    n = 24 * r.D + r.H;
                    break;
                  case "[m]":
                  case "[mm]":
                    n = 60 * (24 * r.D + r.H) + r.M;
                    break;
                  case "[s]":
                  case "[ss]":
                    n =
                      60 * (60 * (24 * r.D + r.H) + r.M) +
                      Math.round(r.S + r.u);
                    break;
                  default:
                    throw "bad abstime format: " + t;
                }
                l = 3 === t.length ? 1 : 2;
                break;
              case 101:
                (n = c), (l = 1);
            }
            return 0 < l ? x(n, l) : "";
          })(o[l].t.charCodeAt(0), o[l].v, n, b)),
            (o[l].t = "t");
          break;
        case "n":
        case "?":
          for (
            v = l + 1;
            null != o[v] &&
            ("?" === (f = o[v].t) ||
              "D" === f ||
              ((" " === f || "t" === f) &&
                null != o[v + 1] &&
                ("?" === o[v + 1].t ||
                  ("t" === o[v + 1].t && "/" === o[v + 1].v))) ||
              ("(" === o[l].t && (" " === f || "n" === f || ")" === f)) ||
              ("t" === f &&
                ("/" === o[v].v ||
                  (" " === o[v].v && null != o[v + 1] && "?" == o[v + 1].t))));

          )
            (o[l].v += o[v].v), (o[v] = { v: "", t: ";" }), ++v;
          (w += o[l].v), (l = v - 1);
          break;
        case "G":
          (o[l].t = "t"), (o[l].v = P(t, r));
      }
    var T,
      E,
      k = "";
    if (0 < w.length) {
      40 == w.charCodeAt(0)
        ? ((T = t < 0 && 45 === w.charCodeAt(0) ? -t : t), (E = K("n", w, T)))
        : ((E = K("n", w, (T = t < 0 && 1 < a ? -t : t))),
          T < 0 &&
            o[0] &&
            "t" == o[0].t &&
            ((E = E.substr(1)), (o[0].v = "-" + o[0].v))),
        (v = E.length - 1);
      for (var y = o.length, l = 0; l < o.length; ++l)
        if (null != o[l] && "t" != o[l].t && -1 < o[l].v.indexOf(".")) {
          y = l;
          break;
        }
      var S = o.length;
      if (y === o.length && -1 === E.indexOf("E")) {
        for (l = o.length - 1; 0 <= l; --l)
          null != o[l] &&
            -1 !== "n?".indexOf(o[l].t) &&
            (v >= o[l].v.length - 1
              ? ((v -= o[l].v.length),
                (o[l].v = E.substr(v + 1, o[l].v.length)))
              : v < 0
              ? (o[l].v = "")
              : ((o[l].v = E.substr(0, v + 1)), (v = -1)),
            (o[l].t = "t"),
            (S = l));
        0 <= v && S < o.length && (o[S].v = E.substr(0, v + 1) + o[S].v);
      } else if (y !== o.length && -1 === E.indexOf("E")) {
        for (v = E.indexOf(".") - 1, l = y; 0 <= l; --l)
          if (null != o[l] && -1 !== "n?".indexOf(o[l].t)) {
            for (
              s =
                -1 < o[l].v.indexOf(".") && l === y
                  ? o[l].v.indexOf(".") - 1
                  : o[l].v.length - 1,
                k = o[l].v.substr(s + 1);
              0 <= s;
              --s
            )
              0 <= v &&
                ("0" === o[l].v.charAt(s) || "#" === o[l].v.charAt(s)) &&
                (k = E.charAt(v--) + k);
            (o[l].v = k), (o[l].t = "t"), (S = l);
          }
        for (
          0 <= v && S < o.length && (o[S].v = E.substr(0, v + 1) + o[S].v),
            v = E.indexOf(".") + 1,
            l = y;
          l < o.length;
          ++l
        )
          if (null != o[l] && (-1 !== "n?(".indexOf(o[l].t) || l === y)) {
            for (
              s =
                -1 < o[l].v.indexOf(".") && l === y
                  ? o[l].v.indexOf(".") + 1
                  : 0,
                k = o[l].v.substr(0, s);
              s < o[l].v.length;
              ++s
            )
              v < E.length && (k += E.charAt(v++));
            (o[l].v = k), (o[l].t = "t"), (S = l);
          }
      }
    }
    for (l = 0; l < o.length; ++l)
      null != o[l] &&
        -1 < "n?".indexOf(o[l].t) &&
        ((T = 1 < a && t < 0 && 0 < l && "-" === o[l - 1].v ? -t : t),
        (o[l].v = K(o[l].t, o[l].v, T)),
        (o[l].t = "t"));
    var _ = "";
    for (l = 0; l !== o.length; ++l) null != o[l] && (_ += o[l].v);
    return _;
  }
  var Q = /\[(=|>[=]?|<[>=]?)(-?\d+(?:\.\d*)?)\]/;
  function ge(e, t) {
    if (null != t) {
      var r = parseFloat(t[2]);
      switch (t[1]) {
        case "=":
          if (e == r) return 1;
          break;
        case ">":
          if (r < e) return 1;
          break;
        case "<":
          if (e < r) return 1;
          break;
        case "<>":
          if (e != r) return 1;
          break;
        case ">=":
          if (r <= e) return 1;
          break;
        case "<=":
          if (e <= r) return 1;
      }
    }
  }
  function be(e, t) {
    var r = (function (e) {
        for (var t = [], r = !1, a = 0, n = 0; a < e.length; ++a)
          switch (e.charCodeAt(a)) {
            case 34:
              r = !r;
              break;
            case 95:
            case 42:
            case 92:
              ++a;
              break;
            case 59:
              (t[t.length] = e.substr(n, a - n)), (n = a + 1);
          }
        if (((t[t.length] = e.substr(n)), !0 === r))
          throw new Error("Format |" + e + "| unterminated string ");
        return t;
      })(e),
      a = r.length,
      n = r[a - 1].indexOf("@");
    if ((a < 4 && -1 < n && --a, 4 < r.length))
      throw new Error("cannot find right format for |" + r.join("|") + "|");
    if ("number" != typeof t)
      return [4, 4 === r.length || -1 < n ? r[r.length - 1] : "@"];
    switch (r.length) {
      case 1:
        r =
          -1 < n
            ? ["General", "General", "General", r[0]]
            : [r[0], r[0], r[0], "@"];
        break;
      case 2:
        r = -1 < n ? [r[0], r[0], r[0], r[1]] : [r[0], r[1], r[0], "@"];
        break;
      case 3:
        r = -1 < n ? [r[0], r[1], r[0], r[2]] : [r[0], r[1], r[2], "@"];
    }
    var s = 0 < t ? r[0] : t < 0 ? r[1] : r[2];
    if (-1 === r[0].indexOf("[") && -1 === r[1].indexOf("[")) return [a, s];
    if (null == r[0].match(/\[[=<>]/) && null == r[1].match(/\[[=<>]/))
      return [a, s];
    (e = r[0].match(Q)), (s = r[1].match(Q));
    return ge(t, e)
      ? [a, r[0]]
      : ge(t, s)
      ? [a, r[1]]
      : [a, r[null != e && null != s ? 2 : 1]];
  }
  function ve(e, t, r) {
    null == r && (r = {});
    var a = "";
    switch (typeof e) {
      case "string":
        a = "m/d/yy" == e && r.dateNF ? r.dateNF : e;
        break;
      case "number":
        null ==
          (a =
            null ==
            (a =
              14 == e && r.dateNF
                ? r.dateNF
                : (null != r.table ? r.table : me)[e])
              ? (r.table && r.table[b[e]]) || me[b[e]]
              : a) && (a = k[e] || "General");
    }
    if (A(a, 0)) return P(t, r);
    var n = be(a, (t = t instanceof Date ? N(t, r.date1904) : t));
    if (A(n[1])) return P(t, r);
    if (!0 === t) t = "TRUE";
    else if (!1 === t) t = "FALSE";
    else if ("" === t || null == t) return "";
    return Z(n[1], t, r, n[0]);
  }
  function we(e, t) {
    if ("number" != typeof t) {
      t = +t || -1;
      for (var r = 0; r < 392; ++r)
        if (null != me[r]) {
          if (me[r] == e) {
            t = r;
            break;
          }
        } else t < 0 && (t = r);
      t < 0 && (t = 391);
    }
    return (me[t] = e), t;
  }
  function Te(e) {
    for (var t = 0; 392 != t; ++t) void 0 !== e[t] && we(e[t], t);
  }
  function Ee() {
    var e;
    ((e = e || {})[0] = "General"),
      (e[1] = "0"),
      (e[2] = "0.00"),
      (e[3] = "#,##0"),
      (e[4] = "#,##0.00"),
      (e[9] = "0%"),
      (e[10] = "0.00%"),
      (e[11] = "0.00E+00"),
      (e[12] = "# ?/?"),
      (e[13] = "# ??/??"),
      (e[14] = "m/d/yy"),
      (e[15] = "d-mmm-yy"),
      (e[16] = "d-mmm"),
      (e[17] = "mmm-yy"),
      (e[18] = "h:mm AM/PM"),
      (e[19] = "h:mm:ss AM/PM"),
      (e[20] = "h:mm"),
      (e[21] = "h:mm:ss"),
      (e[22] = "m/d/yy h:mm"),
      (e[37] = "#,##0 ;(#,##0)"),
      (e[38] = "#,##0 ;[Red](#,##0)"),
      (e[39] = "#,##0.00;(#,##0.00)"),
      (e[40] = "#,##0.00;[Red](#,##0.00)"),
      (e[45] = "mm:ss"),
      (e[46] = "[h]:mm:ss"),
      (e[47] = "mmss.0"),
      (e[48] = "##0.0E+0"),
      (e[49] = "@"),
      (e[56] = '"上午/下午 "hh"時"mm"分"ss"秒 "'),
      (me = e);
  }
  var e = {
      format: ve,
      load: we,
      _table: me,
      load_table: Te,
      parse_date_code: L,
      is_date: q,
      get_table: function () {
        return (e._table = me);
      },
    },
    ke = {
      5: '"$"#,##0_);\\("$"#,##0\\)',
      6: '"$"#,##0_);[Red]\\("$"#,##0\\)',
      7: '"$"#,##0.00_);\\("$"#,##0.00\\)',
      8: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
      23: "General",
      24: "General",
      25: "General",
      26: "General",
      27: "m/d/yy",
      28: "m/d/yy",
      29: "m/d/yy",
      30: "m/d/yy",
      31: "m/d/yy",
      32: "h:mm:ss",
      33: "h:mm:ss",
      34: "h:mm:ss",
      35: "h:mm:ss",
      36: "m/d/yy",
      41: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)',
      42: '_("$"* #,##0_);_("$"* (#,##0);_("$"* "-"_);_(@_)',
      43: '_(* #,##0.00_);_(* (#,##0.00);_(* "-"??_);_(@_)',
      44: '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
      50: "m/d/yy",
      51: "m/d/yy",
      52: "m/d/yy",
      53: "m/d/yy",
      54: "m/d/yy",
      55: "m/d/yy",
      56: "m/d/yy",
      57: "m/d/yy",
      58: "m/d/yy",
      59: "0",
      60: "0.00",
      61: "#,##0",
      62: "#,##0.00",
      63: '"$"#,##0_);\\("$"#,##0\\)',
      64: '"$"#,##0_);[Red]\\("$"#,##0\\)',
      65: '"$"#,##0.00_);\\("$"#,##0.00\\)',
      66: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
      67: "0%",
      68: "0.00%",
      69: "# ?/?",
      70: "# ??/??",
      71: "m/d/yy",
      72: "m/d/yy",
      73: "d-mmm-yy",
      74: "d-mmm",
      75: "mmm-yy",
      76: "h:mm",
      77: "h:mm:ss",
      78: "m/d/yy h:mm",
      79: "mm:ss",
      80: "[h]:mm:ss",
      81: "mmss.0",
    },
    ye = /[dD]+|[mM]+|[yYeE]+|[Hh]+|[Ss]+/g;
  var Se,
    _e = (function () {
      var e = {};
      e.version = "1.2.0";
      var o = (function () {
        for (var e = 0, t = new Array(256), r = 0; 256 != r; ++r)
          (e =
            1 &
            (e =
              1 &
              (e =
                1 &
                (e =
                  1 &
                  (e =
                    1 &
                    (e =
                      1 &
                      (e =
                        1 & (e = 1 & (e = r) ? -306674912 ^ (e >>> 1) : e >>> 1)
                          ? -306674912 ^ (e >>> 1)
                          : e >>> 1)
                        ? -306674912 ^ (e >>> 1)
                        : e >>> 1)
                      ? -306674912 ^ (e >>> 1)
                      : e >>> 1)
                    ? -306674912 ^ (e >>> 1)
                    : e >>> 1)
                  ? -306674912 ^ (e >>> 1)
                  : e >>> 1)
                ? -306674912 ^ (e >>> 1)
                : e >>> 1)
              ? -306674912 ^ (e >>> 1)
              : e >>> 1),
            (t[r] = e);
        return "undefined" != typeof Int32Array ? new Int32Array(t) : t;
      })();
      var t = (function (e) {
          for (
            var t = 0,
              r = 0,
              a = 0,
              n = new ("undefined" != typeof Int32Array ? Int32Array : Array)(
                4096,
              ),
              a = 0;
            256 != a;
            ++a
          )
            n[a] = e[a];
          for (a = 0; 256 != a; ++a)
            for (r = e[a], t = 256 + a; t < 4096; t += 256)
              r = n[t] = (r >>> 8) ^ e[255 & r];
          var s = [];
          for (a = 1; 16 != a; ++a)
            s[a - 1] =
              "undefined" != typeof Int32Array
                ? n.subarray(256 * a, 256 * a + 256)
                : n.slice(256 * a, 256 * a + 256);
          return s;
        })(o),
        s = t[0],
        i = t[1],
        c = t[2],
        l = t[3],
        f = t[4],
        h = t[5],
        u = t[6],
        d = t[7],
        p = t[8],
        m = t[9],
        g = t[10],
        b = t[11],
        v = t[12],
        w = t[13],
        T = t[14];
      return (
        (e.table = o),
        (e.bstr = function (e, t) {
          for (var r = -1 ^ t, a = 0, n = e.length; a < n; )
            r = (r >>> 8) ^ o[255 & (r ^ e.charCodeAt(a++))];
          return ~r;
        }),
        (e.buf = function (e, t) {
          for (var r = -1 ^ t, a = e.length - 15, n = 0; n < a; )
            r =
              T[e[n++] ^ (255 & r)] ^
              w[e[n++] ^ ((r >> 8) & 255)] ^
              v[e[n++] ^ ((r >> 16) & 255)] ^
              b[e[n++] ^ (r >>> 24)] ^
              g[e[n++]] ^
              m[e[n++]] ^
              p[e[n++]] ^
              d[e[n++]] ^
              u[e[n++]] ^
              h[e[n++]] ^
              f[e[n++]] ^
              l[e[n++]] ^
              c[e[n++]] ^
              i[e[n++]] ^
              s[e[n++]] ^
              o[e[n++]];
          for (a += 15; n < a; ) r = (r >>> 8) ^ o[255 & (r ^ e[n++])];
          return ~r;
        }),
        (e.str = function (e, t) {
          for (var r, a = -1 ^ t, n = 0, s = e.length, i = 0; n < s; )
            a =
              (i = e.charCodeAt(n++)) < 128
                ? (a >>> 8) ^ o[255 & (a ^ i)]
                : i < 2048
                ? ((a = (a >>> 8) ^ o[255 & (a ^ (192 | ((i >> 6) & 31)))]) >>>
                    8) ^
                  o[255 & (a ^ (128 | (63 & i)))]
                : 55296 <= i && i < 57344
                ? ((i = 64 + (1023 & i)),
                  (r = 1023 & e.charCodeAt(n++)),
                  ((a =
                    ((a =
                      ((a =
                        (a >>> 8) ^ o[255 & (a ^ (240 | ((i >> 8) & 7)))]) >>>
                        8) ^
                      o[255 & (a ^ (128 | ((i >> 2) & 63)))]) >>>
                      8) ^
                    o[255 & (a ^ (128 | ((r >> 6) & 15) | ((3 & i) << 4)))]) >>>
                    8) ^
                    o[255 & (a ^ (128 | (63 & r)))])
                : ((a =
                    ((a =
                      (a >>> 8) ^ o[255 & (a ^ (224 | ((i >> 12) & 15)))]) >>>
                      8) ^
                    o[255 & (a ^ (128 | ((i >> 6) & 63)))]) >>>
                    8) ^
                  o[255 & (a ^ (128 | (63 & i)))];
          return ~a;
        }),
        e
      );
    })(),
    xe = (function () {
      var s,
        e = {};
      function d(e) {
        if ("/" == e.charAt(e.length - 1))
          return -1 === e.slice(0, -1).indexOf("/") ? e : d(e.slice(0, -1));
        var t = e.lastIndexOf("/");
        return -1 === t ? e : e.slice(0, t + 1);
      }
      function p(e) {
        if ("/" == e.charAt(e.length - 1)) return p(e.slice(0, -1));
        var t = e.lastIndexOf("/");
        return -1 === t ? e : e.slice(t + 1);
      }
      function g(e) {
        Dr(e, 0);
        for (var t, r = {}; e.l <= e.length - 4; ) {
          var a = e.read_shift(2),
            n = e.read_shift(2),
            s = e.l + n,
            i = {};
          21589 === a &&
            (1 & (t = e.read_shift(1)) && (i.mtime = e.read_shift(4)),
            5 < n &&
              (2 & t && (i.atime = e.read_shift(4)),
              4 & t && (i.ctime = e.read_shift(4))),
            i.mtime && (i.mt = new Date(1e3 * i.mtime))),
            (e.l = s),
            (r[a] = i);
        }
        return r;
      }
      function i() {
        return (s = s || require("fs"));
      }
      function o(e, t) {
        if (80 == e[0] && 75 == e[1]) return q(e, t);
        if (109 == (32 | e[0]) && 105 == (32 | e[1]))
          return (function (e, t) {
            if ("mime-version:" != _(e.slice(0, 13)).toLowerCase())
              throw new Error("Unsupported MAD header");
            var r = (t && t.root) || "",
              a = (
                se && Buffer.isBuffer(e) ? e.toString("binary") : _(e)
              ).split("\r\n"),
              n = 0,
              s = "";
            for (n = 0; n < a.length; ++n)
              if (
                ((s = a[n]),
                /^Content-Location:/i.test(s) &&
                  ((s = s.slice(s.indexOf("file"))),
                  (r = r || s.slice(0, s.lastIndexOf("/") + 1)),
                  s.slice(0, r.length) != r))
              )
                for (
                  ;
                  0 < r.length &&
                  ((r = (r = r.slice(0, r.length - 1)).slice(
                    0,
                    r.lastIndexOf("/") + 1,
                  )),
                  s.slice(0, r.length) != r);

                );
            e = (a[1] || "").match(/boundary="(.*?)"/);
            if (!e) throw new Error("MAD cannot find boundary");
            var i = "--" + (e[1] || ""),
              o = { FileIndex: [], FullPaths: [] };
            w(o);
            var c,
              l = 0;
            for (n = 0; n < a.length; ++n) {
              var f = a[n];
              (f !== i && f !== i + "--") ||
                (l++ &&
                  (function (e, t, r) {
                    for (var a, n = "", s = "", i = "", o = 0; o < 10; ++o) {
                      var c = t[o];
                      if (!c || c.match(/^\s*$/)) break;
                      var l = c.match(/^(.*?):\s*([^\s].*)$/);
                      if (l)
                        switch (l[1].toLowerCase()) {
                          case "content-location":
                            n = l[2].trim();
                            break;
                          case "content-type":
                            i = l[2].trim();
                            break;
                          case "content-transfer-encoding":
                            s = l[2].trim();
                        }
                    }
                    switch ((++o, s.toLowerCase())) {
                      case "base64":
                        a = he(te(t.slice(o).join("")));
                        break;
                      case "quoted-printable":
                        a = (function (e) {
                          for (var t = [], r = 0; r < e.length; ++r) {
                            for (
                              var a = e[r];
                              r <= e.length && "=" == a.charAt(a.length - 1);

                            )
                              a = a.slice(0, a.length - 1) + e[++r];
                            t.push(a);
                          }
                          for (var n = 0; n < t.length; ++n)
                            t[n] = t[n].replace(
                              /[=][0-9A-Fa-f]{2}/g,
                              function (e) {
                                return String.fromCharCode(
                                  parseInt(e.slice(1), 16),
                                );
                              },
                            );
                          return he(t.join("\r\n"));
                        })(t.slice(o));
                        break;
                      default:
                        throw new Error(
                          "Unsupported Content-Transfer-Encoding " + s,
                        );
                    }
                    (r = Q(e, n.slice(r.length), a, { unsafe: !0 })),
                      i && (r.ctype = i);
                  })(o, a.slice(c, n), r),
                (c = n));
            }
            return o;
          })(e, t);
        if (e.length < 512)
          throw new Error("CFB file size " + e.length + " < 512");
        var r,
          m,
          a,
          n = 3,
          s = 512,
          i = 0,
          o = [],
          c = e.slice(0, 512);
        Dr(c, 0);
        var l = (function (e) {
          if (80 == e[e.l] && 75 == e[e.l + 1]) return [0, 0];
          e.chk(y, "Header Signature: "), (e.l += 16);
          var t = e.read_shift(2, "u");
          return [e.read_shift(2, "u"), t];
        })(c);
        switch ((n = l[0])) {
          case 3:
            s = 512;
            break;
          case 4:
            s = 4096;
            break;
          case 0:
            if (0 == l[1]) return q(e, t);
          default:
            throw new Error("Major Version: Expected 3 or 4 saw " + n);
        }
        512 !== s && Dr((c = e.slice(0, s)), 28);
        var f = e.slice(0, s);
        !(function (e, t) {
          var r = 9;
          switch (((e.l += 2), (r = e.read_shift(2)))) {
            case 9:
              if (3 != t) throw new Error("Sector Shift: Expected 9 saw " + r);
              break;
            case 12:
              if (4 != t) throw new Error("Sector Shift: Expected 12 saw " + r);
              break;
            default:
              throw new Error("Sector Shift: Expected 9 or 12 saw " + r);
          }
          e.chk("0600", "Mini Sector Shift: "),
            e.chk("000000000000", "Reserved: ");
        })(c, n);
        var h = c.read_shift(4, "i");
        if (3 === n && 0 !== h)
          throw new Error("# Directory Sectors: Expected 0 saw " + h);
        (c.l += 4),
          (m = c.read_shift(4, "i")),
          (c.l += 4),
          c.chk("00100000", "Mini Stream Cutoff Size: "),
          (a = c.read_shift(4, "i")),
          (r = c.read_shift(4, "i")),
          (b = c.read_shift(4, "i")),
          (i = c.read_shift(4, "i"));
        for (var u, d = 0; d < 109 && !((u = c.read_shift(4, "i")) < 0); ++d)
          o[d] = u;
        var p = (function (e, t) {
          for (var r = Math.ceil(e.length / t) - 1, a = [], n = 1; n < r; ++n)
            a[n - 1] = e.slice(n * t, (n + 1) * t);
          return (a[r - 1] = e.slice(r * t)), a;
        })(e, s);
        !(function e(t, r, a, n, s) {
          var i = k;
          if (t === k) {
            if (0 !== r) throw new Error("DIFAT chain shorter than expected");
          } else if (-1 !== t) {
            var o = a[t],
              c = (n >>> 2) - 1;
            if (o) {
              for (var l = 0; l < c && (i = xr(o, 4 * l)) !== k; ++l) s.push(i);
              e(xr(o, n - 4), r - 1, a, n, s);
            }
          }
        })(b, i, p, s, o);
        var g = (function (e, t, r, a) {
          var n = e.length,
            s = [],
            i = [],
            o = [],
            c = [],
            l = a - 1,
            f = 0,
            h = 0,
            u = 0,
            d = 0;
          for (f = 0; f < n; ++f)
            if (((o = []), n <= (u = f + t) && (u -= n), !i[u])) {
              c = [];
              var p = [];
              for (h = u; 0 <= h; ) {
                (p[h] = !0), (i[h] = !0), (o[o.length] = h), c.push(e[h]);
                var m = r[Math.floor((4 * h) / a)];
                if (a < 4 + (d = (4 * h) & l))
                  throw new Error("FAT boundary crossed: " + h + " 4 " + a);
                if (!e[m]) break;
                if (((h = xr(e[m], d)), p[h])) break;
              }
              s[u] = { nodes: o, data: hr([c]) };
            }
          return s;
        })(p, m, o, s);
        (g[m].name = "!Directory"),
          0 < r && a !== k && (g[a].name = "!MiniFAT"),
          (g[o[0]].name = "!FAT"),
          (g.fat_addrs = o),
          (g.ssz = s);
        var h = [],
          b = [],
          i = [];
        !(function (e, t, r, a, n, s, i) {
          for (
            var o, c = 0, l = r.length ? 2 : 0, f = e[m].data, h = 0, u = 0;
            h < f.length;
            h += 128
          ) {
            var d = f.slice(h, h + 128);
            Dr(d, 64), (u = d.read_shift(2)), (o = ur(d, 0, u - l)), r.push(o);
            var p = {
              name: o,
              type: d.read_shift(1),
              color: d.read_shift(1),
              L: d.read_shift(4, "i"),
              R: d.read_shift(4, "i"),
              C: d.read_shift(4, "i"),
              clsid: d.read_shift(16),
              state: d.read_shift(4, "i"),
              start: 0,
              size: 0,
            };
            0 !==
              d.read_shift(2) +
                d.read_shift(2) +
                d.read_shift(2) +
                d.read_shift(2) && (p.ct = v(d, d.l - 8)),
              0 !==
                d.read_shift(2) +
                  d.read_shift(2) +
                  d.read_shift(2) +
                  d.read_shift(2) && (p.mt = v(d, d.l - 8)),
              (p.start = d.read_shift(4, "i")),
              (p.size = d.read_shift(4, "i")),
              p.size < 0 &&
                p.start < 0 &&
                ((p.size = p.type = 0), (p.start = k), (p.name = "")),
              5 === p.type
                ? ((c = p.start),
                  0 < a && c !== k && (e[c].name = "!StreamData"))
                : 4096 <= p.size
                ? ((p.storage = "fat"),
                  void 0 === e[p.start] &&
                    (e[p.start] = (function (e, t, r, a, n) {
                      var s = [],
                        i = [];
                      n = n || [];
                      var o = a - 1,
                        c = 0,
                        l = 0;
                      for (c = t; 0 <= c; ) {
                        (n[c] = !0), (s[s.length] = c), i.push(e[c]);
                        var f = r[Math.floor((4 * c) / a)];
                        if (a < 4 + (l = (4 * c) & o))
                          throw new Error(
                            "FAT boundary crossed: " + c + " 4 " + a,
                          );
                        if (!e[f]) break;
                        c = xr(e[f], l);
                      }
                      return { nodes: s, data: hr([i]) };
                    })(t, p.start, e.fat_addrs, e.ssz)),
                  (e[p.start].name = p.name),
                  (p.content = e[p.start].data.slice(0, p.size)))
                : ((p.storage = "minifat"),
                  p.size < 0
                    ? (p.size = 0)
                    : c !== k &&
                      p.start !== k &&
                      e[c] &&
                      (p.content = (function (e, t, r) {
                        var a = e.start,
                          n = e.size,
                          s = [],
                          i = a;
                        for (; r && 0 < n && 0 <= i; )
                          s.push(t.slice(i * E, i * E + E)),
                            (n -= E),
                            (i = xr(r, 4 * i));
                        return 0 === s.length ? Lr(0) : ue(s).slice(0, e.size);
                      })(p, e[c].data, (e[i] || {}).data))),
              p.content && Dr(p.content, 0),
              (n[o] = p),
              s.push(p);
          }
        })(g, p, h, r, {}, b, a),
          (function (e, t, r) {
            for (
              var a = 0,
                n = 0,
                s = 0,
                i = 0,
                o = 0,
                c = r.length,
                l = [],
                f = [];
              a < c;
              ++a
            )
              (l[a] = f[a] = a), (t[a] = r[a]);
            for (; o < f.length; ++o)
              (a = f[o]),
                (n = e[a].L),
                (s = e[a].R),
                (i = e[a].C),
                l[a] === a &&
                  (-1 !== n && l[n] !== n && (l[a] = l[n]),
                  -1 !== s && l[s] !== s && (l[a] = l[s])),
                -1 !== i && (l[i] = a),
                -1 !== n &&
                  a != l[a] &&
                  ((l[n] = l[a]), f.lastIndexOf(n) < o && f.push(n)),
                -1 !== s &&
                  a != l[a] &&
                  ((l[s] = l[a]), f.lastIndexOf(s) < o && f.push(s));
            for (a = 1; a < c; ++a)
              l[a] === a &&
                (-1 !== s && l[s] !== s
                  ? (l[a] = l[s])
                  : -1 !== n && l[n] !== n && (l[a] = l[n]));
            for (a = 1; a < c; ++a)
              if (0 !== e[a].type) {
                if ((o = a) != l[o])
                  for (
                    ;
                    (o = l[o]),
                      (t[a] = t[o] + "/" + t[a]),
                      0 !== o && -1 !== l[o] && o != l[o];

                  );
                l[a] = -1;
              }
            for (t[0] += "/", a = 1; a < c; ++a)
              2 !== e[a].type && (t[a] += "/");
          })(b, i, h),
          h.shift();
        i = { FileIndex: b, FullPaths: i };
        return t && t.raw && (i.raw = { header: f, sectors: p }), i;
      }
      function v(e, t) {
        return new Date(
          1e3 *
            ((_r(e, t + 4) / 1e7) * Math.pow(2, 32) +
              _r(e, t) / 1e7 -
              11644473600),
        );
      }
      function w(e, t) {
        var r = t || {},
          t = r.root || "Root Entry";
        if (
          (e.FullPaths || (e.FullPaths = []),
          e.FileIndex || (e.FileIndex = []),
          e.FullPaths.length !== e.FileIndex.length)
        )
          throw new Error("inconsistent CFB structure");
        0 === e.FullPaths.length &&
          ((e.FullPaths[0] = t + "/"), (e.FileIndex[0] = { name: t, type: 5 })),
          r.CLSID && (e.FileIndex[0].clsid = r.CLSID),
          (t = e),
          (r = "Sh33tJ5"),
          xe.find(t, "/" + r) ||
            (((e = Lr(4))[0] = 55),
            (e[1] = e[3] = 50),
            (e[2] = 54),
            t.FileIndex.push({
              name: r,
              type: 2,
              content: e,
              size: 4,
              L: 69,
              R: 69,
              C: 69,
            }),
            t.FullPaths.push(t.FullPaths[0] + r),
            u(t));
      }
      function u(e, t) {
        w(e);
        for (var r = !1, a = !1, n = e.FullPaths.length - 1; 0 <= n; --n) {
          var s = e.FileIndex[n];
          switch (s.type) {
            case 0:
              a ? (r = !0) : (e.FileIndex.pop(), e.FullPaths.pop());
              break;
            case 1:
            case 2:
            case 5:
              (a = !0),
                isNaN(s.R * s.L * s.C) && (r = !0),
                -1 < s.R && -1 < s.L && s.R == s.L && (r = !0);
              break;
            default:
              r = !0;
          }
        }
        if (r || t) {
          for (
            var i = new Date(1987, 1, 19),
              o = 0,
              c = Object.create ? Object.create(null) : {},
              l = [],
              n = 0;
            n < e.FullPaths.length;
            ++n
          )
            (c[e.FullPaths[n]] = !0),
              0 !== e.FileIndex[n].type &&
                l.push([e.FullPaths[n], e.FileIndex[n]]);
          for (n = 0; n < l.length; ++n) {
            var f = d(l[n][0]);
            (a = c[f]) ||
              (l.push([
                f,
                {
                  name: p(f).replace("/", ""),
                  type: 1,
                  clsid: b,
                  ct: i,
                  mt: i,
                  content: null,
                },
              ]),
              (c[f] = !0));
          }
          for (
            l.sort(function (e, t) {
              return (function (e, t) {
                for (
                  var r,
                    a = e.split("/"),
                    n = t.split("/"),
                    s = 0,
                    i = Math.min(a.length, n.length);
                  s < i;
                  ++s
                ) {
                  if ((r = a[s].length - n[s].length)) return r;
                  if (a[s] != n[s]) return a[s] < n[s] ? -1 : 1;
                }
                return a.length - n.length;
              })(e[0], t[0]);
            }),
              e.FullPaths = [],
              e.FileIndex = [],
              n = 0;
            n < l.length;
            ++n
          )
            (e.FullPaths[n] = l[n][0]), (e.FileIndex[n] = l[n][1]);
          for (n = 0; n < l.length; ++n) {
            var h = e.FileIndex[n],
              u = e.FullPaths[n];
            if (
              ((h.name = p(u).replace("/", "")),
              (h.L = h.R = h.C = -(h.color = 1)),
              (h.size = h.content ? h.content.length : 0),
              (h.start = 0),
              (h.clsid = h.clsid || b),
              0 === n)
            )
              (h.C = 1 < l.length ? 1 : -1), (h.size = 0), (h.type = 5);
            else if ("/" == u.slice(-1)) {
              for (o = n + 1; o < l.length && d(e.FullPaths[o]) != u; ++o);
              for (
                h.C = o >= l.length ? -1 : o, o = n + 1;
                o < l.length && d(e.FullPaths[o]) != d(u);
                ++o
              );
              (h.R = o >= l.length ? -1 : o), (h.type = 1);
            } else
              d(e.FullPaths[n + 1] || "") == d(u) && (h.R = n + 1),
                (h.type = 2);
          }
        }
      }
      function a(e, t) {
        var r = t || {};
        if ("mad" == r.fileType)
          return (function (e, t) {
            for (
              var r = t || {},
                a = r.boundary || "SheetJS",
                n = [
                  "MIME-Version: 1.0",
                  'Content-Type: multipart/related; boundary="' +
                    (a = "------=" + a).slice(2) +
                    '"',
                  "",
                  "",
                  "",
                ],
                s = e.FullPaths[0],
                i = s,
                o = e.FileIndex[0],
                c = 1;
              c < e.FullPaths.length;
              ++c
            )
              if (
                ((i = e.FullPaths[c].slice(s.length)),
                (o = e.FileIndex[c]).size && o.content && "Sh33tJ5" != i)
              ) {
                i = i
                  .replace(
                    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF]/g,
                    function (e) {
                      return "_x" + e.charCodeAt(0).toString(16) + "_";
                    },
                  )
                  .replace(/[\u0080-\uFFFF]/g, function (e) {
                    return "_u" + e.charCodeAt(0).toString(16) + "_";
                  });
                for (
                  var l = o.content,
                    f = se && Buffer.isBuffer(l) ? l.toString("binary") : _(l),
                    h = 0,
                    u = Math.min(1024, f.length),
                    d = 0,
                    p = 0;
                  p <= u;
                  ++p
                )
                  32 <= (d = f.charCodeAt(p)) && d < 128 && ++h;
                l = (4 * u) / 5 <= h;
                n.push(a),
                  n.push(
                    "Content-Location: " +
                      (r.root || "file:///C:/SheetJS/") +
                      i,
                  ),
                  n.push(
                    "Content-Transfer-Encoding: " +
                      (l ? "quoted-printable" : "base64"),
                  ),
                  n.push(
                    "Content-Type: " +
                      (function (e, t) {
                        if (e.ctype) return e.ctype;
                        var r = e.name || "",
                          e = r.match(/\.([^\.]+)$/);
                        if (e && Z[e[1]]) return Z[e[1]];
                        if (
                          t &&
                          (e = (r = t).match(/[\.\\]([^\.\\])+$/)) &&
                          Z[e[1]]
                        )
                          return Z[e[1]];
                        return "application/octet-stream";
                      })(o, i),
                  ),
                  n.push(""),
                  n.push(
                    (l
                      ? function (e) {
                          e = e.replace(
                            /[\x00-\x08\x0B\x0C\x0E-\x1F\x7E-\xFF=]/g,
                            function (e) {
                              e = e.charCodeAt(0).toString(16).toUpperCase();
                              return "=" + (1 == e.length ? "0" + e : e);
                            },
                          );
                          "\n" ==
                            (e = e
                              .replace(/ $/gm, "=20")
                              .replace(/\t$/gm, "=09")).charAt(0) &&
                            (e = "=0D" + e.slice(1));
                          e = e
                            .replace(/\r(?!\n)/gm, "=0D")
                            .replace(/\n\n/gm, "\n=0A")
                            .replace(/([^\r\n])\n/gm, "$1=0A");
                          for (
                            var t = [], r = e.split("\r\n"), a = 0;
                            a < r.length;
                            ++a
                          ) {
                            var n = r[a];
                            if (0 != n.length)
                              for (var s = 0; s < n.length; ) {
                                var i = 76,
                                  o = n.slice(s, s + i);
                                "=" == o.charAt(i - 1)
                                  ? i--
                                  : "=" == o.charAt(i - 2)
                                  ? (i -= 2)
                                  : "=" == o.charAt(i - 3) && (i -= 3),
                                  (o = n.slice(s, s + i)),
                                  (s += i) < n.length && (o += "="),
                                  t.push(o);
                              }
                            else t.push("");
                          }
                          return t.join("\r\n");
                        }
                      : function (e) {
                          for (
                            var t = ee(e), r = [], a = 0;
                            a < t.length;
                            a += 76
                          )
                            r.push(t.slice(a, a + 76));
                          return r.join("\r\n") + "\r\n";
                        })(f),
                  );
              }
            return n.push(a + "--\r\n"), n.join("\r\n");
          })(e, r);
        if ((u(e), "zip" === r.fileType))
          return (function (e, t) {
            var t = t || {},
              r = [],
              a = [],
              n = Lr(1),
              s = t.compression ? 8 : 0,
              i = 0;
            0;
            var o = 0,
              c = 0,
              l = 0,
              f = 0,
              h = e.FullPaths[0],
              u = h,
              d = e.FileIndex[0],
              p = [],
              m = 0;
            for (o = 1; o < e.FullPaths.length; ++o)
              if (
                ((u = e.FullPaths[o].slice(h.length)),
                (d = e.FileIndex[o]).size && d.content && "Sh33tJ5" != u)
              ) {
                var g = l,
                  b = Lr(u.length);
                for (c = 0; c < u.length; ++c)
                  b.write_shift(1, 127 & u.charCodeAt(c));
                (b = b.slice(0, b.l)), (p[f] = _e.buf(d.content, 0));
                var v = d.content;
                8 == s &&
                  (v = (function (e) {
                    return T ? T.deflateRawSync(e) : V(e);
                  })(v)),
                  (n = Lr(30)).write_shift(4, 67324752),
                  n.write_shift(2, 20),
                  n.write_shift(2, i),
                  n.write_shift(2, s),
                  d.mt
                    ? (function (e, t) {
                        var r = (t =
                          "string" == typeof t ? new Date(t) : t).getHours();
                        (r =
                          ((r = (r << 6) | t.getMinutes()) << 5) |
                          (t.getSeconds() >>> 1)),
                          e.write_shift(2, r),
                          (r =
                            ((r =
                              ((r = t.getFullYear() - 1980) << 4) |
                              (t.getMonth() + 1)) <<
                              5) |
                            t.getDate()),
                          e.write_shift(2, r);
                      })(n, d.mt)
                    : n.write_shift(4, 0),
                  n.write_shift(-4, 8 & i ? 0 : p[f]),
                  n.write_shift(4, 8 & i ? 0 : v.length),
                  n.write_shift(4, 8 & i ? 0 : d.content.length),
                  n.write_shift(2, b.length),
                  n.write_shift(2, 0),
                  (l += n.length),
                  r.push(n),
                  (l += b.length),
                  r.push(b),
                  (l += v.length),
                  r.push(v),
                  8 & i &&
                    ((n = Lr(12)).write_shift(-4, p[f]),
                    n.write_shift(4, v.length),
                    n.write_shift(4, d.content.length),
                    (l += n.l),
                    r.push(n)),
                  (n = Lr(46)).write_shift(4, 33639248),
                  n.write_shift(2, 0),
                  n.write_shift(2, 20),
                  n.write_shift(2, i),
                  n.write_shift(2, s),
                  n.write_shift(4, 0),
                  n.write_shift(-4, p[f]),
                  n.write_shift(4, v.length),
                  n.write_shift(4, d.content.length),
                  n.write_shift(2, b.length),
                  n.write_shift(2, 0),
                  n.write_shift(2, 0),
                  n.write_shift(2, 0),
                  n.write_shift(2, 0),
                  n.write_shift(4, 0),
                  n.write_shift(4, g),
                  (m += n.l),
                  a.push(n),
                  (m += b.length),
                  a.push(b),
                  ++f;
              }
            return (
              (n = Lr(22)).write_shift(4, 101010256),
              n.write_shift(2, 0),
              n.write_shift(2, 0),
              n.write_shift(2, f),
              n.write_shift(2, f),
              n.write_shift(4, m),
              n.write_shift(4, l),
              n.write_shift(2, 0),
              ue([ue(r), ue(a), n])
            );
          })(e, r);
        for (
          var a = (function (e) {
              for (var t = 0, r = 0, a = 0; a < e.FileIndex.length; ++a) {
                var n = e.FileIndex[a];
                n.content &&
                  0 < (n = n.content.length) &&
                  (n < 4096 ? (t += (n + 63) >> 6) : (r += (n + 511) >> 9));
              }
              for (
                var s = (e.FullPaths.length + 3) >> 2,
                  i = (t + 127) >> 7,
                  o = ((t + 7) >> 3) + r + s + i,
                  c = (o + 127) >> 7,
                  l = c <= 109 ? 0 : Math.ceil((c - 109) / 127);
                c < (o + c + l + 127) >> 7;

              )
                l = ++c <= 109 ? 0 : Math.ceil((c - 109) / 127);
              s = [1, l, c, i, s, r, t, 0];
              return (
                (e.FileIndex[0].size = t << 6),
                (s[7] =
                  (e.FileIndex[0].start =
                    s[0] + s[1] + s[2] + s[3] + s[4] + s[5]) +
                  ((s[6] + 7) >> 3)),
                s
              );
            })(e),
            n = Lr(a[7] << 9),
            s = 0,
            i = 0,
            s = 0;
          s < 8;
          ++s
        )
          n.write_shift(1, m[s]);
        for (s = 0; s < 8; ++s) n.write_shift(2, 0);
        for (
          n.write_shift(2, 62),
            n.write_shift(2, 3),
            n.write_shift(2, 65534),
            n.write_shift(2, 9),
            n.write_shift(2, 6),
            s = 0;
          s < 3;
          ++s
        )
          n.write_shift(2, 0);
        for (
          n.write_shift(4, 0),
            n.write_shift(4, a[2]),
            n.write_shift(4, a[0] + a[1] + a[2] + a[3] - 1),
            n.write_shift(4, 0),
            n.write_shift(4, 4096),
            n.write_shift(4, a[3] ? a[0] + a[1] + a[2] - 1 : k),
            n.write_shift(4, a[3]),
            n.write_shift(-4, a[1] ? a[0] - 1 : k),
            n.write_shift(4, a[1]),
            s = 0;
          s < 109;
          ++s
        )
          n.write_shift(-4, s < a[2] ? a[1] + s : -1);
        if (a[1])
          for (i = 0; i < a[1]; ++i) {
            for (; s < 236 + 127 * i; ++s)
              n.write_shift(-4, s < a[2] ? a[1] + s : -1);
            n.write_shift(-4, i === a[1] - 1 ? k : i + 1);
          }
        function o(e) {
          for (i += e; s < i - 1; ++s) n.write_shift(-4, s + 1);
          e && (++s, n.write_shift(-4, k));
        }
        i = s = 0;
        for (i += a[1]; s < i; ++s) n.write_shift(-4, S.DIFSECT);
        for (i += a[2]; s < i; ++s) n.write_shift(-4, S.FATSECT);
        o(a[3]), o(a[4]);
        for (var c = 0, l = 0, f = e.FileIndex[0]; c < e.FileIndex.length; ++c)
          (f = e.FileIndex[c]).content &&
            ((l = f.content.length) < 4096 ||
              ((f.start = i), o((l + 511) >> 9)));
        for (o((a[6] + 7) >> 3); 511 & n.l; ) n.write_shift(-4, S.ENDOFCHAIN);
        for (c = i = s = 0; c < e.FileIndex.length; ++c)
          (f = e.FileIndex[c]).content &&
            (!(l = f.content.length) ||
              4096 <= l ||
              ((f.start = i), o((l + 63) >> 6)));
        for (; 511 & n.l; ) n.write_shift(-4, S.ENDOFCHAIN);
        for (s = 0; s < a[4] << 2; ++s) {
          var h = e.FullPaths[s];
          if (h && 0 !== h.length) {
            (f = e.FileIndex[s]),
              0 === s && (f.start = f.size ? f.start - 1 : k);
            (h = (0 === s && r.root) || f.name), (l = 2 * (h.length + 1));
            if (
              (n.write_shift(64, h, "utf16le"),
              n.write_shift(2, l),
              n.write_shift(1, f.type),
              n.write_shift(1, f.color),
              n.write_shift(-4, f.L),
              n.write_shift(-4, f.R),
              n.write_shift(-4, f.C),
              f.clsid)
            )
              n.write_shift(16, f.clsid, "hex");
            else for (c = 0; c < 4; ++c) n.write_shift(4, 0);
            n.write_shift(4, f.state || 0),
              n.write_shift(4, 0),
              n.write_shift(4, 0),
              n.write_shift(4, 0),
              n.write_shift(4, 0),
              n.write_shift(4, f.start),
              n.write_shift(4, f.size),
              n.write_shift(4, 0);
          } else {
            for (c = 0; c < 17; ++c) n.write_shift(4, 0);
            for (c = 0; c < 3; ++c) n.write_shift(4, -1);
            for (c = 0; c < 12; ++c) n.write_shift(4, 0);
          }
        }
        for (s = 1; s < e.FileIndex.length; ++s)
          if (4096 <= (f = e.FileIndex[s]).size)
            if (((n.l = (f.start + 1) << 9), se && Buffer.isBuffer(f.content)))
              f.content.copy(n, n.l, 0, f.size), (n.l += (f.size + 511) & -512);
            else {
              for (c = 0; c < f.size; ++c) n.write_shift(1, f.content[c]);
              for (; 511 & c; ++c) n.write_shift(1, 0);
            }
        for (s = 1; s < e.FileIndex.length; ++s)
          if (0 < (f = e.FileIndex[s]).size && f.size < 4096)
            if (se && Buffer.isBuffer(f.content))
              f.content.copy(n, n.l, 0, f.size), (n.l += (f.size + 63) & -64);
            else {
              for (c = 0; c < f.size; ++c) n.write_shift(1, f.content[c]);
              for (; 63 & c; ++c) n.write_shift(1, 0);
            }
        if (se) n.l = n.length;
        else for (; n.l < n.length; ) n.write_shift(1, 0);
        return n;
      }
      e.version = "1.2.1";
      var T,
        E = 64,
        k = -2,
        y = "d0cf11e0a1b11ae1",
        m = [208, 207, 17, 224, 161, 177, 26, 225],
        b = "00000000000000000000000000000000",
        S = {
          MAXREGSECT: -6,
          DIFSECT: -4,
          FATSECT: -3,
          ENDOFCHAIN: k,
          FREESECT: -1,
          HEADER_SIGNATURE: y,
          HEADER_MINOR_VERSION: "3e00",
          MAXREGSID: -6,
          NOSTREAM: -1,
          HEADER_CLSID: b,
          EntryTypes: [
            "unknown",
            "storage",
            "stream",
            "lockbytes",
            "property",
            "root",
          ],
        };
      function _(e) {
        for (var t = new Array(e.length), r = 0; r < e.length; ++r)
          t[r] = String.fromCharCode(e[r]);
        return t.join("");
      }
      var x = [
          16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
        ],
        A = [
          3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51,
          59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
        ],
        C = [
          1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385,
          513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385,
          24577,
        ];
      for (
        var t,
          R = "undefined" != typeof Uint8Array,
          O = R ? new Uint8Array(256) : [],
          r = 0;
        r < 256;
        ++r
      )
        O[r] =
          255 &
          (((t =
            (139536 & (((t = r) << 1) | (t << 11))) |
            (558144 & ((t << 5) | (t << 15)))) >>
            16) |
            (t >> 8) |
            t);
      function I(e, t) {
        var r = 7 & t,
          t = t >>> 3;
        return ((e[t] | (r <= 5 ? 0 : e[1 + t] << 8)) >>> r) & 7;
      }
      function N(e, t) {
        var r = 7 & t,
          t = t >>> 3;
        return ((e[t] | (r <= 3 ? 0 : e[1 + t] << 8)) >>> r) & 31;
      }
      function F(e, t) {
        var r = 7 & t,
          t = t >>> 3;
        return ((e[t] | (r <= 1 ? 0 : e[1 + t] << 8)) >>> r) & 127;
      }
      function D(e, t, r) {
        var a = 7 & t,
          n = t >>> 3,
          s = (1 << r) - 1,
          t = e[n] >>> a;
        return r < 8 - a
          ? t & s
          : ((t |= e[1 + n] << (8 - a)),
            r < 16 - a
              ? t & s
              : ((t |= e[2 + n] << (16 - a)),
                r < 24 - a ? t & s : (t |= e[3 + n] << (24 - a)) & s));
      }
      function P(e, t, r) {
        var a = 7 & t,
          n = t >>> 3;
        return (
          a <= 5
            ? (e[n] |= (7 & r) << a)
            : ((e[n] |= (r << a) & 255), (e[1 + n] = (7 & r) >> (8 - a))),
          t + 3
        );
      }
      function L(e, t, r) {
        var a = t >>> 3;
        return (
          (r <<= 7 & t), (e[a] |= 255 & r), (r >>>= 8), (e[1 + a] = r), t + 8
        );
      }
      function M(e, t, r) {
        var a = t >>> 3;
        return (
          (r <<= 7 & t),
          (e[a] |= 255 & r),
          (r >>>= 8),
          (e[1 + a] = 255 & r),
          (e[2 + a] = r >>> 8),
          t + 16
        );
      }
      function U(e, t) {
        var r = e.length,
          a = t < 2 * r ? 2 * r : t + 5,
          n = 0;
        if (t <= r) return e;
        if (se) {
          var s = fe(a);
          if (e.copy) e.copy(s);
          else for (; n < e.length; ++n) s[n] = e[n];
          return s;
        }
        if (R) {
          var i = new Uint8Array(a);
          if (i.set) i.set(e);
          else for (; n < r; ++n) i[n] = e[n];
          return i;
        }
        return (e.length = a), e;
      }
      function B(e) {
        for (var t = new Array(e), r = 0; r < e; ++r) t[r] = 0;
        return t;
      }
      function W(e, t, r) {
        for (
          var a,
            n = 1,
            s = 0,
            i = 0,
            o = 0,
            c = e.length,
            l = R ? new Uint16Array(32) : B(32),
            s = 0;
          s < 32;
          ++s
        )
          l[s] = 0;
        for (s = c; s < r; ++s) e[s] = 0;
        c = e.length;
        var f = R ? new Uint16Array(c) : B(c);
        for (s = 0; s < c; ++s) l[(a = e[s])]++, n < a && (n = a), (f[s] = 0);
        for (l[0] = 0, s = 1; s <= n; ++s) l[s + 16] = o = (o + l[s - 1]) << 1;
        for (s = 0; s < c; ++s) 0 != (o = e[s]) && (f[s] = l[o + 16]++);
        var h, u, d, p;
        for (s = 0; s < c; ++s)
          if (0 != (h = e[s]))
            for (
              u = f[s],
                d = n,
                p = void 0,
                p = O[255 & u],
                o =
                  (d <= 8
                    ? p >>> (8 - d)
                    : ((p = (p << 8) | O[(u >> 8) & 255]),
                      d <= 16
                        ? p >>> (16 - d)
                        : (p = (p << 8) | O[(u >> 16) & 255]) >>> (24 - d))) >>
                  (n - h),
                i = (1 << (n + 4 - h)) - 1;
              0 <= i;
              --i
            )
              t[o | (i << h)] = (15 & h) | (s << 4);
        return n;
      }
      var H = R ? new Uint16Array(512) : B(512),
        z = R ? new Uint16Array(32) : B(32);
      if (!R) {
        for (var n = 0; n < 512; ++n) H[n] = 0;
        for (n = 0; n < 32; ++n) z[n] = 0;
      }
      !(function () {
        for (var e = [], t = 0; t < 32; t++) e.push(5);
        W(e, z, 32);
        for (var r = [], t = 0; t <= 143; t++) r.push(8);
        for (; t <= 255; t++) r.push(9);
        for (; t <= 279; t++) r.push(7);
        for (; t <= 287; t++) r.push(8);
        W(r, H, 288);
      })();
      var c = (function () {
        for (
          var d = R ? new Uint8Array(32768) : [], e = 0, t = 0;
          e < C.length - 1;
          ++e
        )
          for (; t < C[e + 1]; ++t) d[t] = e;
        for (; t < 32768; ++t) d[t] = 29;
        for (
          var p = R ? new Uint8Array(259) : [], e = 0, t = 0;
          e < A.length - 1;
          ++e
        )
          for (; t < A[e + 1]; ++t) p[t] = e;
        return function (e, t) {
          return (
            e.length < 8
              ? function (e, t) {
                  for (var r = 0; r < e.length; ) {
                    var a = Math.min(65535, e.length - r),
                      n = r + a == e.length;
                    for (
                      t.write_shift(1, +n),
                        t.write_shift(2, a),
                        t.write_shift(2, 65535 & ~a);
                      0 < a--;

                    )
                      t[t.l++] = e[r++];
                  }
                  return t.l;
                }
              : function (e, t) {
                  for (
                    var r = 0, a = 0, n = R ? new Uint16Array(32768) : [];
                    a < e.length;

                  ) {
                    var s = Math.min(65535, e.length - a);
                    if (s < 10) {
                      for (
                        7 & (r = P(t, r, +!(a + s != e.length))) &&
                          (r += 8 - (7 & r)),
                          t.l = (r / 8) | 0,
                          t.write_shift(2, s),
                          t.write_shift(2, 65535 & ~s);
                        0 < s--;

                      )
                        t[t.l++] = e[a++];
                      r = 8 * t.l;
                    } else {
                      r = P(t, r, +!(a + s != e.length) + 2);
                      for (var i = 0; 0 < s--; ) {
                        var o = e[a],
                          i = 32767 & ((i << 5) ^ o),
                          c = -1,
                          l = 0;
                        if (
                          (c = n[i]) &&
                          (a < (c |= -32768 & a) && (c -= 32768), c < a)
                        )
                          for (; e[c + l] == e[a + l] && l < 250; ) ++l;
                        if (2 < l) {
                          (o = p[l]) <= 22
                            ? (r = L(t, r, O[o + 1] >> 1) - 1)
                            : (L(t, r, 3),
                              L(t, (r += 5), O[o - 23] >> 5),
                              (r += 3));
                          var f = o < 8 ? 0 : (o - 4) >> 2;
                          0 < f && (M(t, r, l - A[o]), (r += f)),
                            (o = d[a - c]),
                            (r = L(t, r, O[o] >> 3)),
                            (r -= 3);
                          var h = o < 4 ? 0 : (o - 2) >> 1;
                          0 < h && (M(t, r, a - c - C[o]), (r += h));
                          for (var u = 0; u < l; ++u)
                            (n[i] = 32767 & a),
                              (i = 32767 & ((i << 5) ^ e[a])),
                              ++a;
                          s -= l - 1;
                        } else
                          o <= 143
                            ? (o += 48)
                            : ((f = ((f = 1) & f) << (7 & (h = r))),
                              (t[h >>> 3] |= f),
                              (r = h + 1)),
                            (r = L(t, r, O[o])),
                            (n[i] = 32767 & a),
                            ++a;
                      }
                      r = L(t, r, 0) - 1;
                    }
                  }
                  return (t.l = ((r + 7) / 8) | 0), t.l;
                }
          )(e, t);
        };
      })();
      function V(e) {
        var t = Lr(50 + Math.floor(1.1 * e.length)),
          e = c(e, t);
        return t.slice(0, e);
      }
      var G = R ? new Uint16Array(32768) : B(32768),
        j = R ? new Uint16Array(32768) : B(32768),
        $ = R ? new Uint16Array(128) : B(128),
        X = 1,
        Y = 1;
      function l(e, t) {
        if (3 == e[0] && !(3 & e[1])) return [le(t), 2];
        for (
          var r = 0,
            a = 0,
            n = fe(t || 1 << 18),
            s = 0,
            i = n.length >>> 0,
            o = 0,
            c = 0;
          0 == (1 & a);

        )
          if (((a = I(e, r)), (r += 3), a >>> 1 != 0))
            for (
              c =
                a >> 1 == 1
                  ? ((o = 9), 5)
                  : ((r = (function (e, t) {
                      var r,
                        a,
                        n,
                        s = N(e, t) + 257,
                        i = N(e, (t += 5)) + 1,
                        o =
                          ((n = 7 & (a = t += 5)),
                          4 +
                            ((((r = e)[(a = a >>> 3)] |
                              (n <= 4 ? 0 : r[1 + a] << 8)) >>>
                              n) &
                              15));
                      t += 4;
                      for (
                        var c = 0,
                          l = R ? new Uint8Array(19) : B(19),
                          f = [
                            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                            0, 0,
                          ],
                          h = 1,
                          u = R ? new Uint8Array(8) : B(8),
                          d = R ? new Uint8Array(8) : B(8),
                          p = l.length,
                          m = 0;
                        m < o;
                        ++m
                      )
                        (l[x[m]] = c = I(e, t)),
                          h < c && (h = c),
                          u[c]++,
                          (t += 3);
                      var g = 0;
                      for (u[0] = 0, m = 1; m <= h; ++m)
                        d[m] = g = (g + u[m - 1]) << 1;
                      for (m = 0; m < p; ++m)
                        0 != (g = l[m]) && (f[m] = d[g]++);
                      for (var b, m = 0; m < p; ++m)
                        if (0 != (b = l[m])) {
                          g = O[f[m]] >> (8 - b);
                          for (var v = (1 << (7 - b)) - 1; 0 <= v; --v)
                            $[g | (v << b)] = (7 & b) | (m << 3);
                        }
                      for (var w, T, E, k = [], h = 1; k.length < s + i; )
                        switch (((t += 7 & (g = $[F(e, t)])), (g >>>= 3))) {
                          case 16:
                            for (
                              c =
                                3 +
                                ((E = void 0),
                                (E = 7 & (T = t)),
                                (((w = e)[(T = T >>> 3)] |
                                  (E <= 6 ? 0 : w[1 + T] << 8)) >>>
                                  E) &
                                  3),
                                t += 2,
                                g = k[k.length - 1];
                              0 < c--;

                            )
                              k.push(g);
                            break;
                          case 17:
                            for (c = 3 + I(e, t), t += 3; 0 < c--; ) k.push(0);
                            break;
                          case 18:
                            for (c = 11 + F(e, t), t += 7; 0 < c--; ) k.push(0);
                            break;
                          default:
                            k.push(g), h < g && (h = g);
                        }
                      var y = k.slice(0, s),
                        S = k.slice(s);
                      for (m = s; m < 286; ++m) y[m] = 0;
                      for (m = i; m < 30; ++m) S[m] = 0;
                      return (X = W(y, G, 286)), (Y = W(S, j, 30)), t;
                    })(e, r)),
                    (o = X),
                    Y);
              ;

            ) {
              !t && i < s + 32767 && (i = (n = U(n, s + 32767)).length);
              var l = D(e, r, o),
                f = (a >>> 1 == 1 ? H : G)[l];
              if (((r += 15 & f), 0 == (((f >>>= 4) >>> 8) & 255))) n[s++] = f;
              else {
                if (256 == f) break;
                var h = (f -= 257) < 8 ? 0 : (f - 4) >> 2;
                5 < h && (h = 0);
                var u = s + A[f];
                0 < h && ((u += D(e, r, h)), (r += h)),
                  (l = D(e, r, c)),
                  (r += 15 & (f = (a >>> 1 == 1 ? z : j)[l]));
                var l = (f >>>= 4) < 4 ? 0 : (f - 2) >> 1,
                  d = C[f];
                for (
                  0 < l && ((d += D(e, r, l)), (r += l)),
                    !t && i < u && (i = (n = U(n, u + 100)).length);
                  s < u;

                )
                  (n[s] = n[s - d]), ++s;
              }
            }
          else {
            7 & r && (r += 8 - (7 & r));
            var p = e[r >>> 3] | (e[1 + (r >>> 3)] << 8);
            if (((r += 32), 0 < p))
              for (!t && i < s + p && (i = (n = U(n, s + p)).length); 0 < p--; )
                (n[s++] = e[r >>> 3]), (r += 8);
          }
        return t ? [n, (r + 7) >>> 3] : [n.slice(0, s), (r + 7) >>> 3];
      }
      function K(e, t) {
        t = l(e.slice(e.l || 0), t);
        return (e.l += t[1]), t[0];
      }
      function J(e, t) {
        if (!e) throw new Error(t);
        "undefined" != typeof console && console.error(t);
      }
      function q(e, t) {
        var r = e;
        Dr(r, 0);
        var a = { FileIndex: [], FullPaths: [] };
        w(a, { root: t.root });
        for (
          var n = r.length - 4;
          (80 != r[n] || 75 != r[n + 1] || 5 != r[n + 2] || 6 != r[n + 3]) &&
          0 <= n;

        )
          --n;
        (r.l = n + 4), (r.l += 4);
        var s = r.read_shift(2);
        r.l += 6;
        t = r.read_shift(4);
        for (r.l = t, n = 0; n < s; ++n) {
          r.l += 20;
          var i = r.read_shift(4),
            o = r.read_shift(4),
            c = r.read_shift(2),
            l = r.read_shift(2),
            f = r.read_shift(2);
          r.l += 8;
          var h = r.read_shift(4),
            u = g(r.slice(r.l + c, r.l + c + l));
          r.l += c + l + f;
          f = r.l;
          (r.l = h + 4),
            (function (e, t, r, a, n) {
              e.l += 2;
              var s = e.read_shift(2),
                i = e.read_shift(2),
                o = (function (e) {
                  var t = 65535 & e.read_shift(2),
                    r = 65535 & e.read_shift(2),
                    a = new Date(),
                    n = 31 & r,
                    e = 15 & (r >>>= 5);
                  return (
                    (r >>>= 4),
                    a.setMilliseconds(0),
                    a.setFullYear(1980 + r),
                    a.setMonth(e - 1),
                    a.setDate(n),
                    (e = 31 & t),
                    (n = 63 & (t >>>= 5)),
                    (t >>>= 6),
                    a.setHours(t),
                    a.setMinutes(n),
                    a.setSeconds(e << 1),
                    a
                  );
                })(e);
              if (8257 & s) throw new Error("Unsupported ZIP encryption");
              e.read_shift(4);
              for (
                var c,
                  l = e.read_shift(4),
                  f = e.read_shift(4),
                  h = e.read_shift(2),
                  u = e.read_shift(2),
                  d = "",
                  p = 0;
                p < h;
                ++p
              )
                d += String.fromCharCode(e[e.l++]);
              u &&
                (((c = g(e.slice(e.l, e.l + u)))[21589] || {}).mt &&
                  (o = c[21589].mt),
                ((n || {})[21589] || {}).mt && (o = n[21589].mt)),
                (e.l += u);
              var m = e.slice(e.l, e.l + l);
              switch (i) {
                case 8:
                  m = (function (e, t) {
                    if (!T) return K(e, t);
                    var r = new T.InflateRaw(),
                      t = r._processChunk(e.slice(e.l), r._finishFlushFlag);
                    return (e.l += r.bytesRead), t;
                  })(e, f);
                  break;
                case 0:
                  break;
                default:
                  throw new Error("Unsupported ZIP Compression method " + i);
              }
              (u = !1),
                8 & s &&
                  (134695760 == e.read_shift(4) && (e.read_shift(4), (u = !0)),
                  (l = e.read_shift(4)),
                  (f = e.read_shift(4))),
                l != t && J(u, "Bad compressed size: " + t + " != " + l),
                f != r && J(u, "Bad uncompressed size: " + r + " != " + f),
                Q(a, d, m, { unsafe: !0, mt: o });
            })(r, i, o, a, u),
            (r.l = f);
        }
        return a;
      }
      var Z = {
        htm: "text/html",
        xml: "text/xml",
        gif: "image/gif",
        jpg: "image/jpeg",
        png: "image/png",
        mso: "application/x-mso",
        thmx: "application/vnd.ms-officetheme",
        sh33tj5: "application/octet-stream",
      };
      function Q(e, t, r, a) {
        var n = a && a.unsafe;
        n || w(e);
        var s,
          i = !n && xe.find(e, t);
        return (
          i ||
            ((s = e.FullPaths[0]),
            (s =
              t.slice(0, s.length) == s
                ? t
                : ("/" != s.slice(-1) && (s += "/"),
                  (s + t).replace("//", "/"))),
            (i = { name: p(t), type: 2 }),
            e.FileIndex.push(i),
            e.FullPaths.push(s),
            n || xe.utils.cfb_gc(e)),
          (i.content = r),
          (i.size = r ? r.length : 0),
          a &&
            (a.CLSID && (i.clsid = a.CLSID),
            a.mt && (i.mt = a.mt),
            a.ct && (i.ct = a.ct)),
          i
        );
      }
      return (
        (e.find = function (e, t) {
          var r = e.FullPaths.map(function (e) {
              return e.toUpperCase();
            }),
            a = r.map(function (e) {
              var t = e.split("/");
              return t[t.length - ("/" == e.slice(-1) ? 2 : 1)];
            }),
            n = !1;
          47 === t.charCodeAt(0)
            ? ((n = !0), (t = r[0].slice(0, -1) + t))
            : (n = -1 !== t.indexOf("/"));
          var s = t.toUpperCase(),
            i = (!0 === n ? r : a).indexOf(s);
          if (-1 !== i) return e.FileIndex[i];
          var o = !s.match(pe),
            s = s.replace(de, "");
          for (o && (s = s.replace(pe, "!")), i = 0; i < r.length; ++i) {
            if ((o ? r[i].replace(pe, "!") : r[i]).replace(de, "") == s)
              return e.FileIndex[i];
            if ((o ? a[i].replace(pe, "!") : a[i]).replace(de, "") == s)
              return e.FileIndex[i];
          }
          return null;
        }),
        (e.read = function (e, t) {
          var r,
            a,
            n = t && t.type;
          switch (
            (n || (se && Buffer.isBuffer(e) && (n = "buffer")), n || "base64")
          ) {
            case "file":
              return (r = e), (a = t), i(), o(s.readFileSync(r), a);
            case "base64":
              return o(he(te(e)), t);
            case "binary":
              return o(he(e), t);
          }
          return o(e, t);
        }),
        (e.parse = o),
        (e.write = function (e, t) {
          var r = a(e, t);
          switch ((t && t.type) || "buffer") {
            case "file":
              return i(), s.writeFileSync(t.filename, r), r;
            case "binary":
              return "string" == typeof r ? r : _(r);
            case "base64":
              return ee("string" == typeof r ? r : _(r));
            case "buffer":
              if (se) return Buffer.isBuffer(r) ? r : ce(r);
            case "array":
              return "string" == typeof r ? he(r) : r;
          }
          return r;
        }),
        (e.writeFile = function (e, t, r) {
          i(), (r = a(e, r)), s.writeFileSync(t, r);
        }),
        (e.utils = {
          cfb_new: function (e) {
            var t = {};
            return w(t, e), t;
          },
          cfb_add: Q,
          cfb_del: function (e, t) {
            w(e);
            var r = xe.find(e, t);
            if (r)
              for (var a = 0; a < e.FileIndex.length; ++a)
                if (e.FileIndex[a] == r)
                  return e.FileIndex.splice(a, 1), e.FullPaths.splice(a, 1), !0;
            return !1;
          },
          cfb_mov: function (e, t, r) {
            w(e);
            var a = xe.find(e, t);
            if (a)
              for (var n = 0; n < e.FileIndex.length; ++n)
                if (e.FileIndex[n] == a)
                  return (e.FileIndex[n].name = p(r)), (e.FullPaths[n] = r), !0;
            return !1;
          },
          cfb_gc: function (e) {
            u(e, !0);
          },
          ReadShift: Cr,
          CheckField: Fr,
          prep_blob: Dr,
          bconcat: ue,
          use_zlib: function (e) {
            try {
              var t = new e.InflateRaw();
              if (
                (t._processChunk(new Uint8Array([3, 0]), t._finishFlushFlag),
                !t.bytesRead)
              )
                throw new Error("zlib does not expose bytesRead");
              T = e;
            } catch (e) {
              console.error("cannot use native zlib: " + (e.message || e));
            }
          },
          _deflateRaw: V,
          _inflateRaw: K,
          consts: S,
        }),
        e
      );
    })();
  if ("undefined" != typeof require)
    try {
      Se = require("fs");
    } catch (e) {}
  function Ae(e) {
    return "string" == typeof e
      ? o(e)
      : Array.isArray(e)
      ? (function (e) {
          if ("undefined" == typeof Uint8Array) throw new Error("Unsupported");
          return new Uint8Array(e);
        })(e)
      : e;
  }
  function Ce(e, t, r) {
    if (void 0 !== Se && Se.writeFileSync)
      return r ? Se.writeFileSync(e, t, r) : Se.writeFileSync(e, t);
    if ("undefined" != typeof Deno) {
      if (r && "string" == typeof t)
        switch (r) {
          case "utf8":
            t = new TextEncoder(r).encode(t);
            break;
          case "binary":
            t = o(t);
            break;
          default:
            throw new Error("Unsupported encoding " + r);
        }
      return Deno.writeFileSync(e, t);
    }
    var a = "utf8" == r ? Ut(t) : t;
    if ("undefined" != typeof IE_SaveFile) return IE_SaveFile(a, e);
    if ("undefined" != typeof Blob) {
      a = new Blob([Ae(a)], { type: "application/octet-stream" });
      if ("undefined" != typeof navigator && navigator.msSaveBlob)
        return navigator.msSaveBlob(a, e);
      if ("undefined" != typeof saveAs) return saveAs(a, e);
      if (
        "undefined" != typeof URL &&
        "undefined" != typeof document &&
        document.createElement &&
        URL.createObjectURL
      ) {
        var n = URL.createObjectURL(a);
        if (
          "object" == typeof chrome &&
          "function" == typeof (chrome.downloads || {}).download
        )
          return (
            URL.revokeObjectURL &&
              "undefined" != typeof setTimeout &&
              setTimeout(function () {
                URL.revokeObjectURL(n);
              }, 6e4),
            chrome.downloads.download({ url: n, filename: e, saveAs: !0 })
          );
        a = document.createElement("a");
        if (null != a.download)
          return (
            (a.download = e),
            (a.href = n),
            document.body.appendChild(a),
            a.click(),
            document.body.removeChild(a),
            URL.revokeObjectURL &&
              "undefined" != typeof setTimeout &&
              setTimeout(function () {
                URL.revokeObjectURL(n);
              }, 6e4),
            n
          );
      }
    }
    if (
      "undefined" != typeof $ &&
      "undefined" != typeof File &&
      "undefined" != typeof Folder
    )
      try {
        var s = File(e);
        return (
          s.open("w"),
          (s.encoding = "binary"),
          Array.isArray(t) && (t = i(t)),
          s.write(t),
          s.close(),
          t
        );
      } catch (e) {
        if (!e.message || !e.message.match(/onstruct/)) throw e;
      }
    throw new Error("cannot save file " + e);
  }
  function Re(e) {
    for (var t = Object.keys(e), r = [], a = 0; a < t.length; ++a)
      Object.prototype.hasOwnProperty.call(e, t[a]) && r.push(t[a]);
    return r;
  }
  function Oe(e, t) {
    for (var r = [], a = Re(e), n = 0; n !== a.length; ++n)
      null == r[e[a[n]][t]] && (r[e[a[n]][t]] = a[n]);
    return r;
  }
  function Ie(e) {
    for (var t = [], r = Re(e), a = 0; a !== r.length; ++a) t[e[r[a]]] = r[a];
    return t;
  }
  function Ne(e) {
    for (var t = [], r = Re(e), a = 0; a !== r.length; ++a)
      t[e[r[a]]] = parseInt(r[a], 10);
    return t;
  }
  var Fe = new Date(1899, 11, 30, 0, 0, 0);
  function De(e, t) {
    var r = e.getTime();
    return (
      t && (r -= 1263168e5),
      (r -
        (Fe.getTime() +
          6e4 * (e.getTimezoneOffset() - Fe.getTimezoneOffset()))) /
        864e5
    );
  }
  var r = new Date(),
    Pe = Fe.getTime() + 6e4 * (r.getTimezoneOffset() - Fe.getTimezoneOffset()),
    Le = r.getTimezoneOffset();
  function Me(e) {
    var t = new Date();
    return (
      t.setTime(24 * e * 60 * 60 * 1e3 + Pe),
      t.getTimezoneOffset() !== Le &&
        t.setTime(t.getTime() + 6e4 * (t.getTimezoneOffset() - Le)),
      t
    );
  }
  var Ue = new Date("2017-02-19T19:06:09.000Z"),
    Be = isNaN(Ue.getFullYear()) ? new Date("2/19/17") : Ue,
    We = 2017 == Be.getFullYear();
  function He(e, t) {
    var r = new Date(e);
    if (We)
      return (
        0 < t
          ? r.setTime(r.getTime() + 60 * r.getTimezoneOffset() * 1e3)
          : t < 0 && r.setTime(r.getTime() - 60 * r.getTimezoneOffset() * 1e3),
        r
      );
    if (e instanceof Date) return e;
    if (1917 == Be.getFullYear() && !isNaN(r.getFullYear())) {
      t = r.getFullYear();
      return -1 < e.indexOf("" + t)
        ? r
        : (r.setFullYear(r.getFullYear() + 100), r);
    }
    (r = e.match(/\d+/g) || ["2017", "2", "19", "0", "0", "0"]),
      (r = new Date(
        +r[0],
        +r[1] - 1,
        +r[2],
        +r[3] || 0,
        +r[4] || 0,
        +r[5] || 0,
      ));
    return (r =
      -1 < e.indexOf("Z")
        ? new Date(r.getTime() - 60 * r.getTimezoneOffset() * 1e3)
        : r);
  }
  function ze(e, t) {
    if (se && Buffer.isBuffer(e)) {
      if (t) {
        if (255 == e[0] && 254 == e[1])
          return Ut(e.slice(2).toString("utf16le"));
        if (254 == e[1] && 255 == e[2])
          return Ut(s(e.slice(2).toString("binary")));
      }
      return e.toString("binary");
    }
    if ("undefined" != typeof TextDecoder)
      try {
        if (t) {
          if (255 == e[0] && 254 == e[1])
            return Ut(new TextDecoder("utf-16le").decode(e.slice(2)));
          if (254 == e[0] && 255 == e[1])
            return Ut(new TextDecoder("utf-16be").decode(e.slice(2)));
        }
        var r = {
          "€": "",
          "‚": "",
          ƒ: "",
          "„": "",
          "…": "",
          "†": "",
          "‡": "",
          ˆ: "",
          "‰": "",
          Š: "",
          "‹": "",
          Œ: "",
          Ž: "",
          "‘": "",
          "’": "",
          "“": "",
          "”": "",
          "•": "",
          "–": "",
          "—": "",
          "˜": "",
          "™": "",
          š: "",
          "›": "",
          œ: "",
          ž: "",
          Ÿ: "",
        };
        return (
          Array.isArray(e) && (e = new Uint8Array(e)),
          new TextDecoder("latin1")
            .decode(e)
            .replace(/[€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/g, function (e) {
              return r[e] || e;
            })
        );
      } catch (e) {}
    for (var a = [], n = 0; n != e.length; ++n)
      a.push(String.fromCharCode(e[n]));
    return a.join("");
  }
  function Ve(e) {
    if ("undefined" != typeof JSON && !Array.isArray(e))
      return JSON.parse(JSON.stringify(e));
    if ("object" != typeof e || null == e) return e;
    if (e instanceof Date) return new Date(e.getTime());
    var t,
      r = {};
    for (t in e)
      Object.prototype.hasOwnProperty.call(e, t) && (r[t] = Ve(e[t]));
    return r;
  }
  function Ge(e, t) {
    for (var r = ""; r.length < t; ) r += e;
    return r;
  }
  function je(e) {
    var t = Number(e);
    if (!isNaN(t)) return isFinite(t) ? t : NaN;
    if (!/\d/.test(e)) return t;
    var r = 1,
      e = e
        .replace(/([\d]),([\d])/g, "$1$2")
        .replace(/[$]/g, "")
        .replace(/[%]/g, function () {
          return (r *= 100), "";
        });
    return isNaN((t = Number(e)))
      ? ((e = e.replace(/[(](.*)[)]/, function (e, t) {
          return (r = -r), t;
        })),
        isNaN((t = Number(e))) ? t : t / r)
      : t / r;
  }
  var $e = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  function Xe(e) {
    var t = new Date(e),
      r = new Date(NaN),
      a = t.getYear(),
      n = t.getMonth(),
      s = t.getDate();
    if (isNaN(s)) return r;
    var i = e.toLowerCase();
    if (i.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/)) {
      if (
        3 <
          (i = i
            .replace(/[^a-z]/g, "")
            .replace(/([^a-z]|^)[ap]m?([^a-z]|$)/, "")).length &&
        -1 == $e.indexOf(i)
      )
        return r;
    } else if (i.match(/[a-z]/)) return r;
    return a < 0 ||
      8099 < a ||
      ((!(0 < n || 1 < s) || 101 == a) && e.match(/[^-0-9:,\/\\]/))
      ? r
      : t;
  }
  var Ye,
    Ke =
      ((Ye = 5 == "abacaba".split(/(:?b)/i).length),
      function (e, t, r) {
        if (Ye || "string" == typeof t) return e.split(t);
        for (var a = e.split(t), n = [a[0]], s = 1; s < a.length; ++s)
          n.push(r), n.push(a[s]);
        return n;
      });
  function Je(e) {
    return e
      ? e.content && e.type
        ? ze(e.content, !0)
        : e.data
        ? ne(e.data)
        : e.asNodeBuffer && se
        ? ne(e.asNodeBuffer().toString("binary"))
        : e.asBinary
        ? ne(e.asBinary())
        : e._data && e._data.getContent
        ? ne(ze(Array.prototype.slice.call(e._data.getContent(), 0)))
        : null
      : null;
  }
  function qe(e) {
    if (!e) return null;
    if (e.data) return ae(e.data);
    if (e.asNodeBuffer && se) return e.asNodeBuffer();
    if (e._data && e._data.getContent) {
      var t = e._data.getContent();
      return "string" == typeof t ? ae(t) : Array.prototype.slice.call(t);
    }
    return e.content && e.type ? e.content : null;
  }
  function Ze(e, t) {
    for (
      var r = e.FullPaths || Re(e.files),
        a = t.toLowerCase().replace(/[\/]/g, "\\"),
        n = a.replace(/\\/g, "/"),
        s = 0;
      s < r.length;
      ++s
    ) {
      var i = r[s].replace(/^Root Entry[\/]/, "").toLowerCase();
      if (a == i || n == i) return e.files ? e.files[r[s]] : e.FileIndex[s];
    }
    return null;
  }
  function Qe(e, t) {
    e = Ze(e, t);
    if (null == e) throw new Error("Cannot find file " + t + " in zip");
    return e;
  }
  function et(e, t, r) {
    if (!r) return ((r = Qe(e, t)) && ".bin" === r.name.slice(-4) ? qe : Je)(r);
    if (!t) return null;
    try {
      return et(e, t);
    } catch (e) {
      return null;
    }
  }
  function tt(e, t, r) {
    if (!r) return Je(Qe(e, t));
    if (!t) return null;
    try {
      return tt(e, t);
    } catch (e) {
      return null;
    }
  }
  function rt(e) {
    for (var t = e.FullPaths || Re(e.files), r = [], a = 0; a < t.length; ++a)
      "/" != t[a].slice(-1) && r.push(t[a].replace(/^Root Entry[\/]/, ""));
    return r.sort();
  }
  function at(e, t, r) {
    if (e.FullPaths) {
      if ("string" == typeof r) {
        var a = (
          se
            ? ce
            : function (e) {
                for (
                  var t = [],
                    r = 0,
                    a = e.length + 250,
                    n = le(e.length + 255),
                    s = 0;
                  s < e.length;
                  ++s
                ) {
                  var i,
                    o = e.charCodeAt(s);
                  o < 128
                    ? (n[r++] = o)
                    : o < 2048
                    ? ((n[r++] = 192 | ((o >> 6) & 31)),
                      (n[r++] = 128 | (63 & o)))
                    : 55296 <= o && o < 57344
                    ? ((o = 64 + (1023 & o)),
                      (i = 1023 & e.charCodeAt(++s)),
                      (n[r++] = 240 | ((o >> 8) & 7)),
                      (n[r++] = 128 | ((o >> 2) & 63)),
                      (n[r++] = 128 | ((i >> 6) & 15) | ((3 & o) << 4)),
                      (n[r++] = 128 | (63 & i)))
                    : ((n[r++] = 224 | ((o >> 12) & 15)),
                      (n[r++] = 128 | ((o >> 6) & 63)),
                      (n[r++] = 128 | (63 & o))),
                    a < r &&
                      (t.push(n.slice(0, r)),
                      (r = 0),
                      (n = le(65535)),
                      (a = 65530));
                }
                return t.push(n.slice(0, r)), ue(t);
              }
        )(r);
        return xe.utils.cfb_add(e, t, a);
      }
      xe.utils.cfb_add(e, t, r);
    } else e.file(t, r);
  }
  function nt() {
    return xe.utils.cfb_new();
  }
  function st(e, t) {
    switch (t.type) {
      case "base64":
        return xe.read(e, { type: "base64" });
      case "binary":
        return xe.read(e, { type: "binary" });
      case "buffer":
      case "array":
        return xe.read(e, { type: "buffer" });
    }
    throw new Error("Unrecognized type " + t.type);
  }
  function it(e, t) {
    if ("/" == e.charAt(0)) return e.slice(1);
    var r = t.split("/");
    "/" != t.slice(-1) && r.pop();
    for (var a = e.split("/"); 0 !== a.length; ) {
      var n = a.shift();
      ".." === n ? r.pop() : "." !== n && r.push(n);
    }
    return r.join("/");
  }
  var ot = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n',
    ct =
      /([^"\s?>\/]+)\s*=\s*((?:")([^"]*)(?:")|(?:')([^']*)(?:')|([^'">\s]+))/g,
    lt =
      /<[\/\?]?[a-zA-Z0-9:_-]+(?:\s+[^"\s?>\/]+\s*=\s*(?:"[^"]*"|'[^']*'|[^'">\s=]+))*\s*[\/\?]?>/gm,
    ft = ot.match(lt) ? lt : /<[^>]*>/g,
    ht = /<\w*:/,
    ut = /<(\/?)\w+:/;
  function dt(e, t, r) {
    for (
      var a = {}, n = 0, s = 0;
      n !== e.length && 32 !== (s = e.charCodeAt(n)) && 10 !== s && 13 !== s;
      ++n
    );
    if ((t || (a[0] = e.slice(0, n)), n === e.length)) return a;
    var i,
      o,
      c,
      l = e.match(ct),
      f = 0,
      h = 0,
      u = "",
      d = "";
    if (l)
      for (h = 0; h != l.length; ++h) {
        for (d = l[h], s = 0; s != d.length && 61 !== d.charCodeAt(s); ++s);
        for (u = d.slice(0, s).trim(); 32 == d.charCodeAt(s + 1); ) ++s;
        for (
          o = 34 == (n = d.charCodeAt(s + 1)) || 39 == n ? 1 : 0,
            i = d.slice(s + 1 + o, d.length - o),
            f = 0;
          f != u.length && 58 !== u.charCodeAt(f);
          ++f
        );
        f === u.length
          ? ((a[(u = 0 < u.indexOf("_") ? u.slice(0, u.indexOf("_")) : u)] = i),
            r || (a[u.toLowerCase()] = i))
          : (a[
              (c =
                (5 === f && "xmlns" === u.slice(0, 5) ? "xmlns" : "") +
                u.slice(f + 1))
            ] &&
              "ext" == u.slice(f - 3, f)) ||
            ((a[c] = i), r || (a[c.toLowerCase()] = i));
      }
    return a;
  }
  function pt(e) {
    return e.replace(ut, "<$1");
  }
  var mt,
    gt,
    bt = {
      "&quot;": '"',
      "&apos;": "'",
      "&gt;": ">",
      "&lt;": "<",
      "&amp;": "&",
    },
    vt = Ie(bt),
    wt =
      ((mt = /&(?:quot|apos|gt|lt|amp|#x?([\da-fA-F]+));/gi),
      (gt = /_x([\da-fA-F]{4})_/gi),
      function e(t) {
        var r = t + "",
          a = r.indexOf("<![CDATA[");
        if (-1 == a)
          return r
            .replace(mt, function (e, t) {
              return (
                bt[e] ||
                String.fromCharCode(
                  parseInt(t, -1 < e.indexOf("x") ? 16 : 10),
                ) ||
                e
              );
            })
            .replace(gt, function (e, t) {
              return String.fromCharCode(parseInt(t, 16));
            });
        t = r.indexOf("]]>");
        return e(r.slice(0, a)) + r.slice(a + 9, t) + e(r.slice(t + 3));
      }),
    Tt = /[&<>'"]/g,
    Et = /[\u0000-\u0008\u000b-\u001f]/g;
  function kt(e) {
    return (e + "")
      .replace(Tt, function (e) {
        return vt[e];
      })
      .replace(Et, function (e) {
        return "_x" + ("000" + e.charCodeAt(0).toString(16)).slice(-4) + "_";
      });
  }
  function yt(e) {
    return kt(e).replace(/ /g, "_x0020_");
  }
  var St = /[\u0000-\u001f]/g;
  function _t(e) {
    return (e + "")
      .replace(Tt, function (e) {
        return vt[e];
      })
      .replace(/\n/g, "<br/>")
      .replace(St, function (e) {
        return "&#x" + ("000" + e.charCodeAt(0).toString(16)).slice(-4) + ";";
      });
  }
  var xt,
    At =
      ((xt = /&#(\d+);/g),
      function (e) {
        return e.replace(xt, Ct);
      });
  function Ct(e, t) {
    return String.fromCharCode(parseInt(t, 10));
  }
  function Rt(e) {
    switch (e) {
      case 1:
      case !0:
      case "1":
      case "true":
      case "TRUE":
        return !0;
      default:
        return !1;
    }
  }
  function Ot(e) {
    for (var t, r, a, n, s = "", i = 0, o = 0; i < e.length; )
      (t = e.charCodeAt(i++)) < 128
        ? (s += String.fromCharCode(t))
        : ((r = e.charCodeAt(i++)),
          191 < t && t < 224
            ? ((o = (31 & t) << 6),
              (o |= 63 & r),
              (s += String.fromCharCode(o)))
            : ((a = e.charCodeAt(i++)),
              t < 240
                ? (s += String.fromCharCode(
                    ((15 & t) << 12) | ((63 & r) << 6) | (63 & a),
                  ))
                : ((n =
                    (((7 & t) << 18) |
                      ((63 & r) << 12) |
                      ((63 & a) << 6) |
                      (63 & (o = e.charCodeAt(i++)))) -
                    65536),
                  (s += String.fromCharCode(55296 + ((n >>> 10) & 1023))),
                  (s += String.fromCharCode(56320 + (1023 & n))))));
    return s;
  }
  function It(e) {
    for (
      var t, r, a = le(2 * e.length), n = 1, s = 0, i = 0, o = 0;
      o < e.length;
      o += n
    )
      (n = 1),
        (r = e.charCodeAt(o)) < 128
          ? (t = r)
          : r < 224
          ? ((t = 64 * (31 & r) + (63 & e.charCodeAt(o + 1))), (n = 2))
          : r < 240
          ? ((t =
              4096 * (15 & r) +
              64 * (63 & e.charCodeAt(o + 1)) +
              (63 & e.charCodeAt(o + 2))),
            (n = 3))
          : ((n = 4),
            (t =
              262144 * (7 & r) +
              4096 * (63 & e.charCodeAt(o + 1)) +
              64 * (63 & e.charCodeAt(o + 2)) +
              (63 & e.charCodeAt(o + 3))),
            (i = 55296 + (((t -= 65536) >>> 10) & 1023)),
            (t = 56320 + (1023 & t))),
        0 !== i && ((a[s++] = 255 & i), (a[s++] = i >>> 8), (i = 0)),
        (a[s++] = t % 256),
        (a[s++] = t >>> 8);
    return a.slice(0, s).toString("ucs2");
  }
  function Nt(e) {
    return ce(e, "binary").toString("utf8");
  }
  var Ft,
    Dt,
    Pt,
    Lt = "foo bar bazâð£",
    Mt = (se && (Nt(Lt) == Ot(Lt) ? Nt : It(Lt) == Ot(Lt) && It)) || Ot,
    Ut = se
      ? function (e) {
          return ce(e, "utf8").toString("binary");
        }
      : function (e) {
          for (var t, r = [], a = 0, n = 0; a < e.length; )
            switch (!0) {
              case (n = e.charCodeAt(a++)) < 128:
                r.push(String.fromCharCode(n));
                break;
              case n < 2048:
                r.push(String.fromCharCode(192 + (n >> 6))),
                  r.push(String.fromCharCode(128 + (63 & n)));
                break;
              case 55296 <= n && n < 57344:
                (n -= 55296),
                  (t = e.charCodeAt(a++) - 56320 + (n << 10)),
                  r.push(String.fromCharCode(240 + ((t >> 18) & 7))),
                  r.push(String.fromCharCode(144 + ((t >> 12) & 63))),
                  r.push(String.fromCharCode(128 + ((t >> 6) & 63))),
                  r.push(String.fromCharCode(128 + (63 & t)));
                break;
              default:
                r.push(String.fromCharCode(224 + (n >> 12))),
                  r.push(String.fromCharCode(128 + ((n >> 6) & 63))),
                  r.push(String.fromCharCode(128 + (63 & n)));
            }
          return r.join("");
        },
    Bt =
      ((Ft = {}),
      function (e, t) {
        var r = e + "|" + (t || "");
        return (
          Ft[r] ||
          (Ft[r] = new RegExp(
            "<(?:\\w+:)?" +
              e +
              '(?: xml:space="preserve")?(?:[^>]*)>([\\s\\S]*?)</(?:\\w+:)?' +
              e +
              ">",
            t || "",
          ))
        );
      }),
    Wt =
      ((Dt = [
        ["nbsp", " "],
        ["middot", "·"],
        ["quot", '"'],
        ["apos", "'"],
        ["gt", ">"],
        ["lt", "<"],
        ["amp", "&"],
      ].map(function (e) {
        return [new RegExp("&" + e[0] + ";", "ig"), e[1]];
      })),
      function (e) {
        for (
          var t = e
              .replace(/^[\t\n\r ]+/, "")
              .replace(/[\t\n\r ]+$/, "")
              .replace(/>\s+/g, ">")
              .replace(/\s+</g, "<")
              .replace(/[\t\n\r ]+/g, " ")
              .replace(/<\s*[bB][rR]\s*\/?>/g, "\n")
              .replace(/<[^>]*>/g, ""),
            r = 0;
          r < Dt.length;
          ++r
        )
          t = t.replace(Dt[r][0], Dt[r][1]);
        return t;
      }),
    Ht =
      ((Pt = {}),
      function (e) {
        return void 0 !== Pt[e]
          ? Pt[e]
          : (Pt[e] = new RegExp(
              "<(?:vt:)?" + e + ">([\\s\\S]*?)</(?:vt:)?" + e + ">",
              "g",
            ));
      }),
    zt = /<\/?(?:vt:)?variant>/g,
    Vt = /<(?:vt:)([^>]*)>([\s\S]*)</;
  function Gt(e, t) {
    var r = dt(e),
      e = e.match(Ht(r.baseType)) || [],
      a = [];
    if (e.length == r.size)
      return (
        e.forEach(function (e) {
          e = e.replace(zt, "").match(Vt);
          e && a.push({ v: Mt(e[2]), t: e[1] });
        }),
        a
      );
    if (t.WTF)
      throw new Error("unexpected vector length " + e.length + " != " + r.size);
    return a;
  }
  var jt = /(^\s|\s$|\n)/;
  function $t(e, t) {
    return (
      "<" +
      e +
      (t.match(jt) ? ' xml:space="preserve"' : "") +
      ">" +
      t +
      "</" +
      e +
      ">"
    );
  }
  function Xt(t) {
    return Re(t)
      .map(function (e) {
        return " " + e + '="' + t[e] + '"';
      })
      .join("");
  }
  function Yt(e, t, r) {
    return (
      "<" +
      e +
      (null != r ? Xt(r) : "") +
      (null != t
        ? (t.match(jt) ? ' xml:space="preserve"' : "") + ">" + t + "</" + e
        : "/") +
      ">"
    );
  }
  function Kt(e, t) {
    try {
      return e.toISOString().replace(/\.\d*/, "");
    } catch (e) {
      if (t) throw e;
    }
    return "";
  }
  function Jt(e) {
    if (se && Buffer.isBuffer(e)) return e.toString("utf8");
    if ("string" == typeof e) return e;
    if ("undefined" != typeof Uint8Array && e instanceof Uint8Array)
      return Mt(i(m(e)));
    throw new Error("Bad input format: expected Buffer or string");
  }
  var qt = /<(\/?)([^\s?><!\/:]*:|)([^\s?<>:\/]+)(?:[\s?:\/][^>]*)?>/gm,
    Zt = {
      CORE_PROPS:
        "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
      CUST_PROPS:
        "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",
      EXT_PROPS:
        "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
      CT: "http://schemas.openxmlformats.org/package/2006/content-types",
      RELS: "http://schemas.openxmlformats.org/package/2006/relationships",
      TCMNT:
        "http://schemas.microsoft.com/office/spreadsheetml/2018/threadedcomments",
      dc: "http://purl.org/dc/elements/1.1/",
      dcterms: "http://purl.org/dc/terms/",
      dcmitype: "http://purl.org/dc/dcmitype/",
      mx: "http://schemas.microsoft.com/office/mac/excel/2008/main",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      sjs: "http://schemas.openxmlformats.org/package/2006/sheetjs/core-properties",
      vt: "http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes",
      xsi: "http://www.w3.org/2001/XMLSchema-instance",
      xsd: "http://www.w3.org/2001/XMLSchema",
    },
    Qt = [
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "http://purl.oclc.org/ooxml/spreadsheetml/main",
      "http://schemas.microsoft.com/office/excel/2006/main",
      "http://schemas.microsoft.com/office/excel/2006/2",
    ],
    er = {
      o: "urn:schemas-microsoft-com:office:office",
      x: "urn:schemas-microsoft-com:office:excel",
      ss: "urn:schemas-microsoft-com:office:spreadsheet",
      dt: "uuid:C2F41010-65B3-11d1-A29F-00AA00C14882",
      mv: "http://macVmlSchemaUri",
      v: "urn:schemas-microsoft-com:vml",
      html: "http://www.w3.org/TR/REC-html40",
    };
  function tr(e) {
    for (var t = [], r = 0; r < e[0].length; ++r)
      if (e[0][r])
        for (var a = 0, n = e[0][r].length; a < n; a += 10240)
          t.push.apply(t, e[0][r].slice(a, a + 10240));
    return t;
  }
  function rr(e, t, r) {
    for (var a = [], n = t; n < r; n += 2)
      a.push(String.fromCharCode(yr(e, n)));
    return a.join("").replace(de, "");
  }
  function ar(e, t, r) {
    for (var a = [], n = t; n < t + r; ++n)
      a.push(("0" + e[n].toString(16)).slice(-2));
    return a.join("");
  }
  function nr(e, t, r) {
    for (var a = [], n = t; n < r; n++) a.push(String.fromCharCode(kr(e, n)));
    return a.join("");
  }
  function sr(e, t) {
    var r = _r(e, t);
    return 0 < r ? pr(e, t + 4, t + 4 + r - 1) : "";
  }
  function ir(e, t) {
    var r = _r(e, t);
    return 0 < r ? pr(e, t + 4, t + 4 + r - 1) : "";
  }
  function or(e, t) {
    var r = 2 * _r(e, t);
    return 0 < r ? pr(e, t + 4, t + 4 + r - 1) : "";
  }
  function cr(e, t) {
    var r = _r(e, t);
    return 0 < r ? ur(e, t + 4, t + 4 + r) : "";
  }
  function lr(e, t) {
    var r = _r(e, t);
    return 0 < r ? pr(e, t + 4, t + 4 + r) : "";
  }
  function fr(e, t) {
    for (
      var r = 1 - 2 * (e[t + 7] >>> 7),
        a = ((127 & e[t + 7]) << 4) + ((e[t + 6] >>> 4) & 15),
        n = 15 & e[t + 6],
        s = 5;
      0 <= s;
      --s
    )
      n = 256 * n + e[t + s];
    return 2047 == a
      ? 0 == n
        ? (1 / 0) * r
        : NaN
      : (0 == a ? (a = -1022) : ((a -= 1023), (n += Math.pow(2, 52))),
        r * Math.pow(2, a - 52) * n);
  }
  var hr = se
      ? function (e) {
          return 0 < e[0].length && Buffer.isBuffer(e[0][0])
            ? Buffer.concat(
                e[0].map(function (e) {
                  return Buffer.isBuffer(e) ? e : ce(e);
                }),
              )
            : tr(e);
        }
      : tr,
    ur = se
      ? function (e, t, r) {
          return Buffer.isBuffer(e)
            ? e.toString("utf16le", t, r).replace(de, "")
            : rr(e, t, r);
        }
      : rr,
    dr = se
      ? function (e, t, r) {
          return Buffer.isBuffer(e) ? e.toString("hex", t, t + r) : ar(e, t, r);
        }
      : ar,
    pr = se
      ? function (e, t, r) {
          return Buffer.isBuffer(e) ? e.toString("utf8", t, r) : nr(e, t, r);
        }
      : nr,
    mr = sr,
    gr = ir,
    br = or,
    vr = cr,
    wr = lr,
    Tr = fr,
    Er = function (e) {
      return (
        Array.isArray(e) ||
        ("undefined" != typeof Uint8Array && e instanceof Uint8Array)
      );
    };
  se &&
    ((mr = function (e, t) {
      if (!Buffer.isBuffer(e)) return sr(e, t);
      var r = e.readUInt32LE(t);
      return 0 < r ? e.toString("utf8", t + 4, t + 4 + r - 1) : "";
    }),
    (gr = function (e, t) {
      if (!Buffer.isBuffer(e)) return ir(e, t);
      var r = e.readUInt32LE(t);
      return 0 < r ? e.toString("utf8", t + 4, t + 4 + r - 1) : "";
    }),
    (br = function (e, t) {
      if (!Buffer.isBuffer(e)) return or(e, t);
      var r = 2 * e.readUInt32LE(t);
      return e.toString("utf16le", t + 4, t + 4 + r - 1);
    }),
    (vr = function (e, t) {
      if (!Buffer.isBuffer(e)) return cr(e, t);
      var r = e.readUInt32LE(t);
      return e.toString("utf16le", t + 4, t + 4 + r);
    }),
    (wr = function (e, t) {
      if (!Buffer.isBuffer(e)) return lr(e, t);
      var r = e.readUInt32LE(t);
      return e.toString("utf8", t + 4, t + 4 + r);
    }),
    (Tr = function (e, t) {
      return Buffer.isBuffer(e) ? e.readDoubleLE(t) : fr(e, t);
    }),
    (Er = function (e) {
      return (
        Buffer.isBuffer(e) ||
        Array.isArray(e) ||
        ("undefined" != typeof Uint8Array && e instanceof Uint8Array)
      );
    })),
    void 0 !== re &&
      ((ur = function (e, t, r) {
        return re.utils.decode(1200, e.slice(t, r)).replace(de, "");
      }),
      (pr = function (e, t, r) {
        return re.utils.decode(65001, e.slice(t, r));
      }),
      (mr = function (e, t) {
        var r = _r(e, t);
        return 0 < r ? re.utils.decode(_, e.slice(t + 4, t + 4 + r - 1)) : "";
      }),
      (gr = function (e, t) {
        var r = _r(e, t);
        return 0 < r ? re.utils.decode(f, e.slice(t + 4, t + 4 + r - 1)) : "";
      }),
      (br = function (e, t) {
        var r = 2 * _r(e, t);
        return 0 < r
          ? re.utils.decode(1200, e.slice(t + 4, t + 4 + r - 1))
          : "";
      }),
      (vr = function (e, t) {
        var r = _r(e, t);
        return 0 < r ? re.utils.decode(1200, e.slice(t + 4, t + 4 + r)) : "";
      }),
      (wr = function (e, t) {
        var r = _r(e, t);
        return 0 < r ? re.utils.decode(65001, e.slice(t + 4, t + 4 + r)) : "";
      }));
  var kr = function (e, t) {
      return e[t];
    },
    yr = function (e, t) {
      return 256 * e[t + 1] + e[t];
    },
    Sr = function (e, t) {
      t = 256 * e[t + 1] + e[t];
      return t < 32768 ? t : -1 * (65535 - t + 1);
    },
    _r = function (e, t) {
      return e[t + 3] * (1 << 24) + (e[t + 2] << 16) + (e[t + 1] << 8) + e[t];
    },
    xr = function (e, t) {
      return (e[t + 3] << 24) | (e[t + 2] << 16) | (e[t + 1] << 8) | e[t];
    },
    Ar = function (e, t) {
      return (e[t] << 24) | (e[t + 1] << 16) | (e[t + 2] << 8) | e[t + 3];
    };
  function Cr(e, t) {
    var r,
      a,
      n,
      s,
      i,
      o,
      c = "",
      l = [];
    switch (t) {
      case "dbcs":
        if (((o = this.l), se && Buffer.isBuffer(this)))
          c = this.slice(this.l, this.l + 2 * e).toString("utf16le");
        else
          for (i = 0; i < e; ++i)
            (c += String.fromCharCode(yr(this, o))), (o += 2);
        e *= 2;
        break;
      case "utf8":
        c = pr(this, this.l, this.l + e);
        break;
      case "utf16le":
        (e *= 2), (c = ur(this, this.l, this.l + e));
        break;
      case "wstr":
        if (void 0 === re) return Cr.call(this, e, "dbcs");
        (c = re.utils.decode(f, this.slice(this.l, this.l + 2 * e))), (e *= 2);
        break;
      case "lpstr-ansi":
        (c = mr(this, this.l)), (e = 4 + _r(this, this.l));
        break;
      case "lpstr-cp":
        (c = gr(this, this.l)), (e = 4 + _r(this, this.l));
        break;
      case "lpwstr":
        (c = br(this, this.l)), (e = 4 + 2 * _r(this, this.l));
        break;
      case "lpp4":
        (e = 4 + _r(this, this.l)), (c = vr(this, this.l)), 2 & e && (e += 2);
        break;
      case "8lpp4":
        (e = 4 + _r(this, this.l)),
          (c = wr(this, this.l)),
          3 & e && (e += 4 - (3 & e));
        break;
      case "cstr":
        for (e = 0, c = ""; 0 !== (n = kr(this, this.l + e++)); ) l.push(u(n));
        c = l.join("");
        break;
      case "_wstr":
        for (e = 0, c = ""; 0 !== (n = yr(this, this.l + e)); )
          l.push(u(n)), (e += 2);
        (e += 2), (c = l.join(""));
        break;
      case "dbcs-cont":
        for (c = "", o = this.l, i = 0; i < e; ++i) {
          if (this.lens && -1 !== this.lens.indexOf(o))
            return (
              (n = kr(this, o)),
              (this.l = o + 1),
              (s = Cr.call(this, e - i, n ? "dbcs-cont" : "sbcs-cont")),
              l.join("") + s
            );
          l.push(u(yr(this, o))), (o += 2);
        }
        (c = l.join("")), (e *= 2);
        break;
      case "cpstr":
        if (void 0 !== re) {
          c = re.utils.decode(f, this.slice(this.l, this.l + e));
          break;
        }
      case "sbcs-cont":
        for (c = "", o = this.l, i = 0; i != e; ++i) {
          if (this.lens && -1 !== this.lens.indexOf(o))
            return (
              (n = kr(this, o)),
              (this.l = o + 1),
              (s = Cr.call(this, e - i, n ? "dbcs-cont" : "sbcs-cont")),
              l.join("") + s
            );
          l.push(u(kr(this, o))), (o += 1);
        }
        c = l.join("");
        break;
      default:
        switch (e) {
          case 1:
            return (r = kr(this, this.l)), this.l++, r;
          case 2:
            return (r = ("i" === t ? Sr : yr)(this, this.l)), (this.l += 2), r;
          case 4:
          case -4:
            return "i" === t || 0 == (128 & this[this.l + 3])
              ? ((r = (0 < e ? xr : Ar)(this, this.l)), (this.l += 4), r)
              : ((a = _r(this, this.l)), (this.l += 4), a);
          case 8:
          case -8:
            if ("f" === t)
              return (
                (a =
                  8 == e
                    ? Tr(this, this.l)
                    : Tr(
                        [
                          this[this.l + 7],
                          this[this.l + 6],
                          this[this.l + 5],
                          this[this.l + 4],
                          this[this.l + 3],
                          this[this.l + 2],
                          this[this.l + 1],
                          this[this.l + 0],
                        ],
                        0,
                      )),
                (this.l += 8),
                a
              );
            e = 8;
          case 16:
            c = dr(this, this.l, e);
        }
    }
    return (this.l += e), c;
  }
  var Rr = function (e, t, r) {
      (e[r] = 255 & t),
        (e[r + 1] = (t >>> 8) & 255),
        (e[r + 2] = (t >>> 16) & 255),
        (e[r + 3] = (t >>> 24) & 255);
    },
    Or = function (e, t, r) {
      (e[r] = 255 & t),
        (e[r + 1] = (t >> 8) & 255),
        (e[r + 2] = (t >> 16) & 255),
        (e[r + 3] = (t >> 24) & 255);
    },
    Ir = function (e, t, r) {
      (e[r] = 255 & t), (e[r + 1] = (t >>> 8) & 255);
    };
  function Nr(e, t, r) {
    var a = 0,
      n = 0;
    if ("dbcs" === r) {
      for (n = 0; n != t.length; ++n) Ir(this, t.charCodeAt(n), this.l + 2 * n);
      a = 2 * t.length;
    } else if ("sbcs" === r) {
      if (void 0 !== re && 874 == _)
        for (n = 0; n != t.length; ++n) {
          var s = re.utils.encode(_, t.charAt(n));
          this[this.l + n] = s[0];
        }
      else
        for (t = t.replace(/[^\x00-\x7F]/g, "_"), n = 0; n != t.length; ++n)
          this[this.l + n] = 255 & t.charCodeAt(n);
      a = t.length;
    } else {
      if ("hex" === r) {
        for (; n < e; ++n)
          this[this.l++] = parseInt(t.slice(2 * n, 2 * n + 2), 16) || 0;
        return this;
      }
      if ("utf16le" === r) {
        for (
          var i = Math.min(this.l + e, this.length), n = 0;
          n < Math.min(t.length, e);
          ++n
        ) {
          var o = t.charCodeAt(n);
          (this[this.l++] = 255 & o), (this[this.l++] = o >> 8);
        }
        for (; this.l < i; ) this[this.l++] = 0;
        return this;
      }
      switch (e) {
        case 1:
          (a = 1), (this[this.l] = 255 & t);
          break;
        case 2:
          (a = 2),
            (this[this.l] = 255 & t),
            (t >>>= 8),
            (this[this.l + 1] = 255 & t);
          break;
        case 3:
          (a = 3),
            (this[this.l] = 255 & t),
            (t >>>= 8),
            (this[this.l + 1] = 255 & t),
            (t >>>= 8),
            (this[this.l + 2] = 255 & t);
          break;
        case 4:
          (a = 4), Rr(this, t, this.l);
          break;
        case 8:
          if (((a = 8), "f" === r)) {
            !(function (e, t, r) {
              var a = (t < 0 || 1 / t == -1 / 0 ? 1 : 0) << 7,
                n = 0,
                s = 0,
                i = a ? -t : t;
              isFinite(i)
                ? 0 == i
                  ? (n = s = 0)
                  : ((n = Math.floor(Math.log(i) / Math.LN2)),
                    (s = i * Math.pow(2, 52 - n)),
                    n <= -1023 && (!isFinite(s) || s < Math.pow(2, 52))
                      ? (n = -1022)
                      : ((s -= Math.pow(2, 52)), (n += 1023)))
                : ((n = 2047), (s = isNaN(t) ? 26985 : 0));
              for (var o = 0; o <= 5; ++o, s /= 256) e[r + o] = 255 & s;
              (e[r + 6] = ((15 & n) << 4) | (15 & s)),
                (e[r + 7] = (n >> 4) | a);
            })(this, t, this.l);
            break;
          }
        case 16:
          break;
        case -4:
          (a = 4), Or(this, t, this.l);
      }
    }
    return (this.l += a), this;
  }
  function Fr(e, t) {
    var r = dr(this, this.l, e.length >> 1);
    if (r !== e) throw new Error(t + "Expected " + e + " saw " + r);
    this.l += e.length >> 1;
  }
  function Dr(e, t) {
    (e.l = t), (e.read_shift = Cr), (e.chk = Fr), (e.write_shift = Nr);
  }
  function Pr(e, t) {
    e.l += t;
  }
  function Lr(e) {
    e = le(e);
    return Dr(e, 0), e;
  }
  function Mr(e, t, r) {
    if (e) {
      Dr(e, e.l || 0);
      for (var a, n = e.length, s = 0; e.l < n; ) {
        128 & (s = e.read_shift(1)) &&
          (s = (127 & s) + ((127 & e.read_shift(1)) << 7));
        for (
          var i, o = Df[s] || Df[65535], c = 127 & (i = e.read_shift(1)), l = 1;
          l < 4 && 128 & i;
          ++l
        )
          c += (127 & (i = e.read_shift(1))) << (7 * l);
        a = e.l + c;
        var f = o.f && o.f(e, c, r);
        if (((e.l = a), t(f, o, s))) return;
      }
    }
  }
  function Ur() {
    function t(e) {
      return Dr((e = Lr(e)), 0), e;
    }
    function r() {
      s &&
        (s.length > s.l && ((s = s.slice(0, s.l)).l = s.length),
        0 < s.length && e.push(s),
        (s = null));
    }
    function a(e) {
      return s && e < s.length - s.l ? s : (r(), (s = t(Math.max(e + 1, n))));
    }
    var e = [],
      n = se ? 256 : 2048,
      s = t(n);
    return {
      next: a,
      push: function (e) {
        r(), null == (s = e).l && (s.l = s.length), a(n);
      },
      end: function () {
        return r(), ue(e);
      },
      _bufs: e,
    };
  }
  function Br(e, t, r, a) {
    var n = +t;
    if (!isNaN(n)) {
      (t = 1 + (128 <= n ? 1 : 0) + 1),
        128 <= (a = a || Df[n].p || (r || []).length || 0) && ++t,
        16384 <= a && ++t,
        2097152 <= a && ++t;
      var s = e.next(t);
      n <= 127
        ? s.write_shift(1, n)
        : (s.write_shift(1, 128 + (127 & n)), s.write_shift(1, n >> 7));
      for (var i = 0; 4 != i; ++i) {
        if (!(128 <= a)) {
          s.write_shift(1, a);
          break;
        }
        s.write_shift(1, 128 + (127 & a)), (a >>= 7);
      }
      0 < a && Er(r) && e.push(r);
    }
  }
  function Wr(e, t, r) {
    var a = Ve(e);
    if (
      (t.s
        ? (a.cRel && (a.c += t.s.c), a.rRel && (a.r += t.s.r))
        : (a.cRel && (a.c += t.c), a.rRel && (a.r += t.r)),
      !r || r.biff < 12)
    ) {
      for (; 256 <= a.c; ) a.c -= 256;
      for (; 65536 <= a.r; ) a.r -= 65536;
    }
    return a;
  }
  function Hr(e, t, r) {
    e = Ve(e);
    return (e.s = Wr(e.s, t.s, r)), (e.e = Wr(e.e, t.s, r)), e;
  }
  function zr(e, t) {
    if (e.cRel && e.c < 0)
      for (e = Ve(e); e.c < 0; ) e.c += 8 < t ? 16384 : 256;
    if (e.rRel && e.r < 0)
      for (e = Ve(e); e.r < 0; ) e.r += 8 < t ? 1048576 : 5 < t ? 65536 : 16384;
    var r = Kr(e);
    return (
      e.cRel || null == e.cRel || (r = r.replace(/^([A-Z])/, "$$$1")),
      (r =
        !e.rRel && null != e.rRel ? r.replace(/([A-Z]|^)(\d+)$/, "$1$$$2") : r)
    );
  }
  function Vr(e, t) {
    return 0 != e.s.r ||
      e.s.rRel ||
      e.e.r != (12 <= t.biff ? 1048575 : 8 <= t.biff ? 65536 : 16384) ||
      e.e.rRel
      ? 0 != e.s.c ||
        e.s.cRel ||
        e.e.c != (12 <= t.biff ? 16383 : 255) ||
        e.e.cRel
        ? zr(e.s, t.biff) + ":" + zr(e.e, t.biff)
        : (e.s.rRel ? "" : "$") +
          jr(e.s.r) +
          ":" +
          (e.e.rRel ? "" : "$") +
          jr(e.e.r)
      : (e.s.cRel ? "" : "$") +
          Xr(e.s.c) +
          ":" +
          (e.e.cRel ? "" : "$") +
          Xr(e.e.c);
  }
  function Gr(e) {
    return parseInt(e.replace(/\$(\d+)$/, "$1"), 10) - 1;
  }
  function jr(e) {
    return "" + (e + 1);
  }
  function $r(e) {
    for (
      var t = e.replace(/^\$([A-Z])/, "$1"), r = 0, a = 0;
      a !== t.length;
      ++a
    )
      r = 26 * r + t.charCodeAt(a) - 64;
    return r - 1;
  }
  function Xr(e) {
    if (e < 0) throw new Error("invalid column " + e);
    var t = "";
    for (++e; e; e = Math.floor((e - 1) / 26))
      t = String.fromCharCode(((e - 1) % 26) + 65) + t;
    return t;
  }
  function Yr(e) {
    for (var t = 0, r = 0, a = 0; a < e.length; ++a) {
      var n = e.charCodeAt(a);
      48 <= n && n <= 57
        ? (t = 10 * t + (n - 48))
        : 65 <= n && n <= 90 && (r = 26 * r + (n - 64));
    }
    return { c: r - 1, r: t - 1 };
  }
  function Kr(e) {
    for (var t = e.c + 1, r = ""; t; t = ((t - 1) / 26) | 0)
      r = String.fromCharCode(((t - 1) % 26) + 65) + r;
    return r + (e.r + 1);
  }
  function Jr(e) {
    var t = e.indexOf(":");
    return -1 == t
      ? { s: Yr(e), e: Yr(e) }
      : { s: Yr(e.slice(0, t)), e: Yr(e.slice(t + 1)) };
  }
  function qr(e, t) {
    return void 0 === t || "number" == typeof t
      ? qr(e.s, e.e)
      : (e = "string" != typeof e ? Kr(e) : e) ==
        (t = "string" != typeof t ? Kr(t) : t)
      ? e
      : e + ":" + t;
  }
  function Zr(e) {
    for (
      var t = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } },
        r = 0,
        a = 0,
        n = 0,
        s = e.length,
        r = 0;
      a < s && !((n = e.charCodeAt(a) - 64) < 1 || 26 < n);
      ++a
    )
      r = 26 * r + n;
    for (
      t.s.c = --r, r = 0;
      a < s && !((n = e.charCodeAt(a) - 48) < 0 || 9 < n);
      ++a
    )
      r = 10 * r + n;
    if (((t.s.r = --r), a === s || 10 != n))
      return (t.e.c = t.s.c), (t.e.r = t.s.r), t;
    for (++a, r = 0; a != s && !((n = e.charCodeAt(a) - 64) < 1 || 26 < n); ++a)
      r = 26 * r + n;
    for (
      t.e.c = --r, r = 0;
      a != s && !((n = e.charCodeAt(a) - 48) < 0 || 9 < n);
      ++a
    )
      r = 10 * r + n;
    return (t.e.r = --r), t;
  }
  function Qr(e, t) {
    var r = "d" == e.t && t instanceof Date;
    if (null != e.z)
      try {
        return (e.w = ve(e.z, r ? De(t) : t));
      } catch (e) {}
    try {
      return (e.w = ve((e.XF || {}).numFmtId || (r ? 14 : 0), r ? De(t) : t));
    } catch (e) {
      return "" + t;
    }
  }
  function ea(e, t, r) {
    return null == e || null == e.t || "z" == e.t
      ? ""
      : void 0 !== e.w
      ? e.w
      : ("d" == e.t && !e.z && r && r.dateNF && (e.z = r.dateNF),
        "e" == e.t ? Wa[e.v] || e.v : Qr(e, null == t ? e.v : t));
  }
  function ta(e, t) {
    var r = t && t.sheet ? t.sheet : "Sheet1",
      t = {};
    return (t[r] = e), { SheetNames: [r], Sheets: t };
  }
  function ra(e, t, r) {
    var a = r || {},
      n = e ? Array.isArray(e) : a.dense;
    null != oe && null == n && (n = oe);
    var s = e || (n ? [] : {}),
      i = 0,
      o = 0;
    s &&
      null != a.origin &&
      ("number" == typeof a.origin
        ? (i = a.origin)
        : ((i = (c = "string" == typeof a.origin ? Yr(a.origin) : a.origin).r),
          (o = c.c)),
      s["!ref"] || (s["!ref"] = "A1:A1"));
    var c,
      l = { s: { c: 1e7, r: 1e7 }, e: { c: 0, r: 0 } };
    s["!ref"] &&
      ((c = Zr(s["!ref"])),
      (l.s.c = c.s.c),
      (l.s.r = c.s.r),
      (l.e.c = Math.max(l.e.c, c.e.c)),
      (l.e.r = Math.max(l.e.r, c.e.r)),
      -1 == i && (l.e.r = i = c.e.r + 1));
    for (var f = 0; f != t.length; ++f)
      if (t[f]) {
        if (!Array.isArray(t[f]))
          throw new Error("aoa_to_sheet expects an array of arrays");
        for (var h = 0; h != t[f].length; ++h)
          if (void 0 !== t[f][h]) {
            var u = { v: t[f][h] },
              d = i + f,
              p = o + h;
            if (
              (l.s.r > d && (l.s.r = d),
              l.s.c > p && (l.s.c = p),
              l.e.r < d && (l.e.r = d),
              l.e.c < p && (l.e.c = p),
              !t[f][h] ||
                "object" != typeof t[f][h] ||
                Array.isArray(t[f][h]) ||
                t[f][h] instanceof Date)
            )
              if (
                (Array.isArray(u.v) && ((u.f = t[f][h][1]), (u.v = u.v[0])),
                null === u.v)
              )
                if (u.f) u.t = "n";
                else if (a.nullError) (u.t = "e"), (u.v = 0);
                else {
                  if (!a.sheetStubs) continue;
                  u.t = "z";
                }
              else
                "number" == typeof u.v
                  ? (u.t = "n")
                  : "boolean" == typeof u.v
                  ? (u.t = "b")
                  : u.v instanceof Date
                  ? ((u.z = a.dateNF || me[14]),
                    a.cellDates
                      ? ((u.t = "d"), (u.w = ve(u.z, De(u.v))))
                      : ((u.t = "n"), (u.v = De(u.v)), (u.w = ve(u.z, u.v))))
                  : (u.t = "s");
            else u = t[f][h];
            n
              ? (s[d] || (s[d] = []),
                s[d][p] && s[d][p].z && (u.z = s[d][p].z),
                (s[d][p] = u))
              : (s[(d = Kr({ c: p, r: d }))] && s[d].z && (u.z = s[d].z),
                (s[d] = u));
          }
      }
    return l.s.c < 1e7 && (s["!ref"] = qr(l)), s;
  }
  function aa(e, t) {
    return ra(null, e, t);
  }
  function na(e, t) {
    return (t = t || Lr(4)).write_shift(4, e), t;
  }
  function sa(e) {
    var t = e.read_shift(4);
    return 0 === t ? "" : e.read_shift(t, "dbcs");
  }
  function ia(e, t) {
    var r = !1;
    return (
      null == t && ((r = !0), (t = Lr(4 + 2 * e.length))),
      t.write_shift(4, e.length),
      0 < e.length && t.write_shift(0, e, "dbcs"),
      r ? t.slice(0, t.l) : t
    );
  }
  function oa(e, t) {
    var r,
      a = e.l,
      n = e.read_shift(1),
      s = sa(e),
      i = [],
      s = { t: s, h: s };
    if (0 != (1 & n)) {
      for (var o = e.read_shift(4), c = 0; c != o; ++c)
        i.push({ ich: (r = e).read_shift(2), ifnt: r.read_shift(2) });
      s.r = i;
    } else s.r = [{ ich: 0, ifnt: 0 }];
    return (e.l = a + t), s;
  }
  var ca = oa;
  function la(e, t) {
    var r,
      a = !1;
    return (
      null == t && ((a = !0), (t = Lr(23 + 4 * e.t.length))),
      t.write_shift(1, 1),
      ia(e.t, t),
      t.write_shift(4, 1),
      (r = { ich: 0, ifnt: 0 }),
      (e = (e = t) || Lr(4)).write_shift(2, r.ich || 0),
      e.write_shift(2, r.ifnt || 0),
      a ? t.slice(0, t.l) : t
    );
  }
  function fa(e) {
    var t = e.read_shift(4),
      r = e.read_shift(2);
    return (r += e.read_shift(1) << 16), e.l++, { c: t, iStyleRef: r };
  }
  function ha(e, t) {
    return (
      (t = null == t ? Lr(8) : t).write_shift(-4, e.c),
      t.write_shift(3, e.iStyleRef || e.s),
      t.write_shift(1, 0),
      t
    );
  }
  function ua(e) {
    var t = e.read_shift(2);
    return (t += e.read_shift(1) << 16), e.l++, { c: -1, iStyleRef: t };
  }
  function da(e, t) {
    return (
      (t = null == t ? Lr(4) : t).write_shift(3, e.iStyleRef || e.s),
      t.write_shift(1, 0),
      t
    );
  }
  var pa = sa,
    ma = ia;
  function ga(e) {
    var t = e.read_shift(4);
    return 0 === t || 4294967295 === t ? "" : e.read_shift(t, "dbcs");
  }
  function ba(e, t) {
    var r = !1;
    return (
      null == t && ((r = !0), (t = Lr(127))),
      t.write_shift(4, 0 < e.length ? e.length : 4294967295),
      0 < e.length && t.write_shift(0, e, "dbcs"),
      r ? t.slice(0, t.l) : t
    );
  }
  var va = sa,
    wa = ga,
    Ta = ba;
  function Ea(e) {
    var t = e.slice(e.l, e.l + 4),
      r = 1 & t[0],
      a = 2 & t[0];
    e.l += 4;
    t =
      0 == a
        ? Tr([0, 0, 0, 0, 252 & t[0], t[1], t[2], t[3]], 0)
        : xr(t, 0) >> 2;
    return r ? t / 100 : t;
  }
  function ka(e, t) {
    null == t && (t = Lr(4));
    var r = 0,
      a = 0,
      n = 100 * e;
    if (
      (e == (0 | e) && -(1 << 29) <= e && e < 1 << 29
        ? (a = 1)
        : n == (0 | n) && -(1 << 29) <= n && n < 1 << 29 && (r = a = 1),
      !a)
    )
      throw new Error("unsupported RkNumber " + e);
    t.write_shift(-4, ((r ? n : e) << 2) + (r + 2));
  }
  function ya(e) {
    var t = { s: {}, e: {} };
    return (
      (t.s.r = e.read_shift(4)),
      (t.e.r = e.read_shift(4)),
      (t.s.c = e.read_shift(4)),
      (t.e.c = e.read_shift(4)),
      t
    );
  }
  var Sa = ya,
    _a = function (e, t) {
      return (
        (t = t || Lr(16)).write_shift(4, e.s.r),
        t.write_shift(4, e.e.r),
        t.write_shift(4, e.s.c),
        t.write_shift(4, e.e.c),
        t
      );
    };
  function xa(e) {
    if (e.length - e.l < 8) throw "XLS Xnum Buffer underflow";
    return e.read_shift(8, "f");
  }
  function Aa(e, t) {
    return (t || Lr(8)).write_shift(8, e, "f");
  }
  function Ca(e, t) {
    if (((t = t || Lr(8)), !e || e.auto))
      return t.write_shift(4, 0), t.write_shift(4, 0), t;
    null != e.index
      ? (t.write_shift(1, 2), t.write_shift(1, e.index))
      : null != e.theme
      ? (t.write_shift(1, 6), t.write_shift(1, e.theme))
      : (t.write_shift(1, 5), t.write_shift(1, 0));
    var r = e.tint || 0;
    return (
      0 < r ? (r *= 32767) : r < 0 && (r *= 32768),
      t.write_shift(2, r),
      e.rgb && null == e.theme
        ? ("number" == typeof (e = e.rgb || "FFFFFF") &&
            (e = ("000000" + e.toString(16)).slice(-6)),
          t.write_shift(1, parseInt(e.slice(0, 2), 16)),
          t.write_shift(1, parseInt(e.slice(2, 4), 16)),
          t.write_shift(1, parseInt(e.slice(4, 6), 16)),
          t.write_shift(1, 255))
        : (t.write_shift(2, 0), t.write_shift(1, 0), t.write_shift(1, 0)),
      t
    );
  }
  function Ra(e, t) {
    var r = e.read_shift(4);
    switch (r) {
      case 0:
        return "";
      case 4294967295:
      case 4294967294:
        return (
          { 2: "BITMAP", 3: "METAFILEPICT", 8: "DIB", 14: "ENHMETAFILE" }[
            e.read_shift(4)
          ] || ""
        );
    }
    if (400 < r) throw new Error("Unsupported Clipboard: " + r.toString(16));
    return (e.l -= 4), e.read_shift(0, 1 == t ? "lpstr" : "lpwstr");
  }
  var Oa = 2,
    Ia = 3,
    Na = 12,
    Fa = 81,
    Da = [80, Fa],
    Pa = {
      1: { n: "CodePage", t: Oa },
      2: { n: "Category", t: 80 },
      3: { n: "PresentationFormat", t: 80 },
      4: { n: "ByteCount", t: Ia },
      5: { n: "LineCount", t: Ia },
      6: { n: "ParagraphCount", t: Ia },
      7: { n: "SlideCount", t: Ia },
      8: { n: "NoteCount", t: Ia },
      9: { n: "HiddenCount", t: Ia },
      10: { n: "MultimediaClipCount", t: Ia },
      11: { n: "ScaleCrop", t: 11 },
      12: { n: "HeadingPairs", t: 4108 },
      13: { n: "TitlesOfParts", t: 4126 },
      14: { n: "Manager", t: 80 },
      15: { n: "Company", t: 80 },
      16: { n: "LinksUpToDate", t: 11 },
      17: { n: "CharacterCount", t: Ia },
      19: { n: "SharedDoc", t: 11 },
      22: { n: "HyperlinksChanged", t: 11 },
      23: { n: "AppVersion", t: Ia, p: "version" },
      24: { n: "DigSig", t: 65 },
      26: { n: "ContentType", t: 80 },
      27: { n: "ContentStatus", t: 80 },
      28: { n: "Language", t: 80 },
      29: { n: "Version", t: 80 },
      255: {},
      2147483648: { n: "Locale", t: 19 },
      2147483651: { n: "Behavior", t: 19 },
      1919054434: {},
    },
    La = {
      1: { n: "CodePage", t: Oa },
      2: { n: "Title", t: 80 },
      3: { n: "Subject", t: 80 },
      4: { n: "Author", t: 80 },
      5: { n: "Keywords", t: 80 },
      6: { n: "Comments", t: 80 },
      7: { n: "Template", t: 80 },
      8: { n: "LastAuthor", t: 80 },
      9: { n: "RevNumber", t: 80 },
      10: { n: "EditTime", t: 64 },
      11: { n: "LastPrinted", t: 64 },
      12: { n: "CreatedDate", t: 64 },
      13: { n: "ModifiedDate", t: 64 },
      14: { n: "PageCount", t: Ia },
      15: { n: "WordCount", t: Ia },
      16: { n: "CharCount", t: Ia },
      17: { n: "Thumbnail", t: 71 },
      18: { n: "Application", t: 80 },
      19: { n: "DocSecurity", t: Ia },
      255: {},
      2147483648: { n: "Locale", t: 19 },
      2147483651: { n: "Behavior", t: 19 },
      1919054434: {},
    },
    Ma = {
      1: "US",
      2: "CA",
      3: "",
      7: "RU",
      20: "EG",
      30: "GR",
      31: "NL",
      32: "BE",
      33: "FR",
      34: "ES",
      36: "HU",
      39: "IT",
      41: "CH",
      43: "AT",
      44: "GB",
      45: "DK",
      46: "SE",
      47: "NO",
      48: "PL",
      49: "DE",
      52: "MX",
      55: "BR",
      61: "AU",
      64: "NZ",
      66: "TH",
      81: "JP",
      82: "KR",
      84: "VN",
      86: "CN",
      90: "TR",
      105: "JS",
      213: "DZ",
      216: "MA",
      218: "LY",
      351: "PT",
      354: "IS",
      358: "FI",
      420: "CZ",
      886: "TW",
      961: "LB",
      962: "JO",
      963: "SY",
      964: "IQ",
      965: "KW",
      966: "SA",
      971: "AE",
      972: "IL",
      974: "QA",
      981: "IR",
      65535: "US",
    },
    Ua = [
      null,
      "solid",
      "mediumGray",
      "darkGray",
      "lightGray",
      "darkHorizontal",
      "darkVertical",
      "darkDown",
      "darkUp",
      "darkGrid",
      "darkTrellis",
      "lightHorizontal",
      "lightVertical",
      "lightDown",
      "lightUp",
      "lightGrid",
      "lightTrellis",
      "gray125",
      "gray0625",
    ];
  var Ba = Ve(
      [
        0, 16777215, 16711680, 65280, 255, 16776960, 16711935, 65535, 0,
        16777215, 16711680, 65280, 255, 16776960, 16711935, 65535, 8388608,
        32768, 128, 8421376, 8388736, 32896, 12632256, 8421504, 10066431,
        10040166, 16777164, 13434879, 6684774, 16744576, 26316, 13421823, 128,
        16711935, 16776960, 65535, 8388736, 8388608, 32896, 255, 52479,
        13434879, 13434828, 16777113, 10079487, 16751052, 13408767, 16764057,
        3368703, 3394764, 10079232, 16763904, 16750848, 16737792, 6710937,
        9868950, 13158, 3381606, 13056, 3355392, 10040064, 10040166, 3355545,
        3355443, 16777215, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ].map(function (e) {
        return [(e >> 16) & 255, (e >> 8) & 255, 255 & e];
      }),
    ),
    Wa = {
      0: "#NULL!",
      7: "#DIV/0!",
      15: "#VALUE!",
      23: "#REF!",
      29: "#NAME?",
      36: "#NUM!",
      42: "#N/A",
      43: "#GETTING_DATA",
      255: "#WTF?",
    },
    Ha = {
      "#NULL!": 0,
      "#DIV/0!": 7,
      "#VALUE!": 15,
      "#REF!": 23,
      "#NAME?": 29,
      "#NUM!": 36,
      "#N/A": 42,
      "#GETTING_DATA": 43,
      "#WTF?": 255,
    },
    za = {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml":
        "workbooks",
      "application/vnd.ms-excel.sheet.macroEnabled.main+xml": "workbooks",
      "application/vnd.ms-excel.sheet.binary.macroEnabled.main": "workbooks",
      "application/vnd.ms-excel.addin.macroEnabled.main+xml": "workbooks",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml":
        "workbooks",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml":
        "sheets",
      "application/vnd.ms-excel.worksheet": "sheets",
      "application/vnd.ms-excel.binIndexWs": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml":
        "charts",
      "application/vnd.ms-excel.chartsheet": "charts",
      "application/vnd.ms-excel.macrosheet+xml": "macros",
      "application/vnd.ms-excel.macrosheet": "macros",
      "application/vnd.ms-excel.intlmacrosheet": "TODO",
      "application/vnd.ms-excel.binIndexMs": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml":
        "dialogs",
      "application/vnd.ms-excel.dialogsheet": "dialogs",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml":
        "strs",
      "application/vnd.ms-excel.sharedStrings": "strs",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml":
        "styles",
      "application/vnd.ms-excel.styles": "styles",
      "application/vnd.openxmlformats-package.core-properties+xml": "coreprops",
      "application/vnd.openxmlformats-officedocument.custom-properties+xml":
        "custprops",
      "application/vnd.openxmlformats-officedocument.extended-properties+xml":
        "extprops",
      "application/vnd.openxmlformats-officedocument.customXmlProperties+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.customProperty":
        "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml":
        "comments",
      "application/vnd.ms-excel.comments": "comments",
      "application/vnd.ms-excel.threadedcomments+xml": "threadedcomments",
      "application/vnd.ms-excel.person+xml": "people",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml":
        "metadata",
      "application/vnd.ms-excel.sheetMetadata": "metadata",
      "application/vnd.ms-excel.pivotTable": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotTable+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.drawingml.chart+xml":
        "TODO",
      "application/vnd.ms-office.chartcolorstyle+xml": "TODO",
      "application/vnd.ms-office.chartstyle+xml": "TODO",
      "application/vnd.ms-office.chartex+xml": "TODO",
      "application/vnd.ms-excel.calcChain": "calcchains",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.calcChain+xml":
        "calcchains",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings":
        "TODO",
      "application/vnd.ms-office.activeX": "TODO",
      "application/vnd.ms-office.activeX+xml": "TODO",
      "application/vnd.ms-excel.attachedToolbars": "TODO",
      "application/vnd.ms-excel.connections": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml":
        "TODO",
      "application/vnd.ms-excel.externalLink": "links",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml":
        "links",
      "application/vnd.ms-excel.pivotCacheDefinition": "TODO",
      "application/vnd.ms-excel.pivotCacheRecords": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheDefinition+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotCacheRecords+xml":
        "TODO",
      "application/vnd.ms-excel.queryTable": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.queryTable+xml":
        "TODO",
      "application/vnd.ms-excel.userNames": "TODO",
      "application/vnd.ms-excel.revisionHeaders": "TODO",
      "application/vnd.ms-excel.revisionLog": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionHeaders+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionLog+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.userNames+xml":
        "TODO",
      "application/vnd.ms-excel.tableSingleCells": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.tableSingleCells+xml":
        "TODO",
      "application/vnd.ms-excel.slicer": "TODO",
      "application/vnd.ms-excel.slicerCache": "TODO",
      "application/vnd.ms-excel.slicer+xml": "TODO",
      "application/vnd.ms-excel.slicerCache+xml": "TODO",
      "application/vnd.ms-excel.wsSortMap": "TODO",
      "application/vnd.ms-excel.table": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.theme+xml": "themes",
      "application/vnd.openxmlformats-officedocument.themeOverride+xml": "TODO",
      "application/vnd.ms-excel.Timeline+xml": "TODO",
      "application/vnd.ms-excel.TimelineCache+xml": "TODO",
      "application/vnd.ms-office.vbaProject": "vba",
      "application/vnd.ms-office.vbaProjectSignature": "TODO",
      "application/vnd.ms-office.volatileDependencies": "TODO",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.volatileDependencies+xml":
        "TODO",
      "application/vnd.ms-excel.controlproperties+xml": "TODO",
      "application/vnd.openxmlformats-officedocument.model+data": "TODO",
      "application/vnd.ms-excel.Survey+xml": "TODO",
      "application/vnd.openxmlformats-officedocument.drawing+xml": "drawings",
      "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.drawingml.diagramColors+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.drawingml.diagramData+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.drawingml.diagramLayout+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.drawingml.diagramStyle+xml":
        "TODO",
      "application/vnd.openxmlformats-officedocument.vmlDrawing": "TODO",
      "application/vnd.openxmlformats-package.relationships+xml": "rels",
      "application/vnd.openxmlformats-officedocument.oleObject": "TODO",
      "image/png": "TODO",
      sheet: "js",
    },
    Va = {
      workbooks: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml",
        xlsm: "application/vnd.ms-excel.sheet.macroEnabled.main+xml",
        xlsb: "application/vnd.ms-excel.sheet.binary.macroEnabled.main",
        xlam: "application/vnd.ms-excel.addin.macroEnabled.main+xml",
        xltx: "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml",
      },
      strs: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
        xlsb: "application/vnd.ms-excel.sharedStrings",
      },
      comments: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml",
        xlsb: "application/vnd.ms-excel.comments",
      },
      sheets: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
        xlsb: "application/vnd.ms-excel.worksheet",
      },
      charts: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml",
        xlsb: "application/vnd.ms-excel.chartsheet",
      },
      dialogs: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml",
        xlsb: "application/vnd.ms-excel.dialogsheet",
      },
      macros: {
        xlsx: "application/vnd.ms-excel.macrosheet+xml",
        xlsb: "application/vnd.ms-excel.macrosheet",
      },
      metadata: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetMetadata+xml",
        xlsb: "application/vnd.ms-excel.sheetMetadata",
      },
      styles: {
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml",
        xlsb: "application/vnd.ms-excel.styles",
      },
    };
  function Ga() {
    return {
      workbooks: [],
      sheets: [],
      charts: [],
      dialogs: [],
      macros: [],
      rels: [],
      strs: [],
      comments: [],
      threadedcomments: [],
      links: [],
      coreprops: [],
      extprops: [],
      custprops: [],
      themes: [],
      styles: [],
      calcchains: [],
      vba: [],
      drawings: [],
      metadata: [],
      people: [],
      TODO: [],
      xmlns: "",
    };
  }
  function ja(r, a) {
    var t,
      n = (function (e) {
        for (var t = [], r = Re(e), a = 0; a !== r.length; ++a)
          null == t[e[r[a]]] && (t[e[r[a]]] = []), t[e[r[a]]].push(r[a]);
        return t;
      })(za),
      s = [];
    (s[s.length] = ot),
      (s[s.length] = Yt("Types", null, {
        xmlns: Zt.CT,
        "xmlns:xsd": Zt.xsd,
        "xmlns:xsi": Zt.xsi,
      })),
      (s = s.concat(
        [
          ["xml", "application/xml"],
          ["bin", "application/vnd.ms-excel.sheet.binary.macroEnabled.main"],
          ["vml", "application/vnd.openxmlformats-officedocument.vmlDrawing"],
          ["data", "application/vnd.openxmlformats-officedocument.model+data"],
          ["bmp", "image/bmp"],
          ["png", "image/png"],
          ["gif", "image/gif"],
          ["emf", "image/x-emf"],
          ["wmf", "image/x-wmf"],
          ["jpg", "image/jpeg"],
          ["jpeg", "image/jpeg"],
          ["tif", "image/tiff"],
          ["tiff", "image/tiff"],
          ["pdf", "application/pdf"],
          ["rels", "application/vnd.openxmlformats-package.relationships+xml"],
        ].map(function (e) {
          return Yt("Default", null, { Extension: e[0], ContentType: e[1] });
        }),
      ));
    function e(e) {
      r[e] &&
        0 < r[e].length &&
        ((t = r[e][0]),
        (s[s.length] = Yt("Override", null, {
          PartName: ("/" == t[0] ? "" : "/") + t,
          ContentType: Va[e][a.bookType] || Va[e].xlsx,
        })));
    }
    function i(t) {
      (r[t] || []).forEach(function (e) {
        s[s.length] = Yt("Override", null, {
          PartName: ("/" == e[0] ? "" : "/") + e,
          ContentType: Va[t][a.bookType] || Va[t].xlsx,
        });
      });
    }
    function o(t) {
      (r[t] || []).forEach(function (e) {
        s[s.length] = Yt("Override", null, {
          PartName: ("/" == e[0] ? "" : "/") + e,
          ContentType: n[t][0],
        });
      });
    }
    return (
      e("workbooks"),
      i("sheets"),
      i("charts"),
      o("themes"),
      ["strs", "styles"].forEach(e),
      ["coreprops", "extprops", "custprops"].forEach(o),
      o("vba"),
      o("comments"),
      o("threadedcomments"),
      o("drawings"),
      i("metadata"),
      o("people"),
      2 < s.length &&
        ((s[s.length] = "</Types>"), (s[1] = s[1].replace("/>", ">"))),
      s.join("")
    );
  }
  var $a = {
    WB: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    SHEET:
      "http://sheetjs.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    HLINK:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
    VML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
    XPATH:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLinkPath",
    XMISS:
      "http://schemas.microsoft.com/office/2006/relationships/xlExternalLinkPath/xlPathMissing",
    XLINK:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink",
    CXML: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml",
    CXMLP:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXmlProps",
    CMNT: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
    CORE_PROPS:
      "http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties",
    EXT_PROPS:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties",
    CUST_PROPS:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties",
    SST: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings",
    STY: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
    THEME:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
    CHART:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
    CHARTEX: "http://schemas.microsoft.com/office/2014/relationships/chartEx",
    CS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chartsheet",
    WS: [
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
      "http://purl.oclc.org/ooxml/officeDocument/relationships/worksheet",
    ],
    DS: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/dialogsheet",
    MS: "http://schemas.microsoft.com/office/2006/relationships/xlMacrosheet",
    IMG: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
    DRAW: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing",
    XLMETA:
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sheetMetadata",
    TCMNT:
      "http://schemas.microsoft.com/office/2017/10/relationships/threadedComment",
    PEOPLE: "http://schemas.microsoft.com/office/2017/10/relationships/person",
    VBA: "http://schemas.microsoft.com/office/2006/relationships/vbaProject",
  };
  function Xa(e) {
    var t = e.lastIndexOf("/");
    return e.slice(0, t + 1) + "_rels/" + e.slice(t + 1) + ".rels";
  }
  function Ya(e, a) {
    var n = { "!id": {} };
    if (!e) return n;
    "/" !== a.charAt(0) && (a = "/" + a);
    var s = {};
    return (
      (e.match(ft) || []).forEach(function (e) {
        var t,
          r = dt(e);
        "<Relationship" === r[0] &&
          (((t = {}).Type = r.Type),
          (t.Target = r.Target),
          (t.Id = r.Id),
          r.TargetMode && (t.TargetMode = r.TargetMode),
          (e = "External" === r.TargetMode ? r.Target : it(r.Target, a)),
          (n[e] = t),
          (s[r.Id] = t));
      }),
      (n["!id"] = s),
      n
    );
  }
  function Ka(t) {
    var r = [ot, Yt("Relationships", null, { xmlns: Zt.RELS })];
    return (
      Re(t["!id"]).forEach(function (e) {
        r[r.length] = Yt("Relationship", null, t["!id"][e]);
      }),
      2 < r.length &&
        ((r[r.length] = "</Relationships>"), (r[1] = r[1].replace("/>", ">"))),
      r.join("")
    );
  }
  function Ja(e, t, r, a, n, s) {
    if (
      ((n = n || {}),
      e["!id"] || (e["!id"] = {}),
      e["!idx"] || (e["!idx"] = 1),
      t < 0)
    )
      for (t = e["!idx"]; e["!id"]["rId" + t]; ++t);
    if (
      ((e["!idx"] = t + 1),
      (n.Id = "rId" + t),
      (n.Type = a),
      (n.Target = r),
      s
        ? (n.TargetMode = s)
        : -1 < [$a.HLINK, $a.XPATH, $a.XMISS].indexOf(n.Type) &&
          (n.TargetMode = "External"),
      e["!id"][n.Id])
    )
      throw new Error("Cannot rewrite rId " + t);
    return (
      (e["!id"][n.Id] = n), (e[("/" + n.Target).replace("//", "/")] = n), t
    );
  }
  var qa = "application/vnd.oasis.opendocument.spreadsheet";
  function Za(e, t, r) {
    return [
      '  <rdf:Description rdf:about="' + e + '">\n',
      '    <rdf:type rdf:resource="http://docs.oasis-open.org/ns/office/1.2/meta/' +
        (r || "odf") +
        "#" +
        t +
        '"/>\n',
      "  </rdf:Description>\n",
    ].join("");
  }
  function Qa() {
    return (
      '<office:document-meta xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xlink="http://www.w3.org/1999/xlink" office:version="1.2"><office:meta><meta:generator>SheetJS ' +
      a.version +
      "</meta:generator></office:meta></office:document-meta>"
    );
  }
  var en = [
      ["cp:category", "Category"],
      ["cp:contentStatus", "ContentStatus"],
      ["cp:keywords", "Keywords"],
      ["cp:lastModifiedBy", "LastAuthor"],
      ["cp:lastPrinted", "LastPrinted"],
      ["cp:revision", "RevNumber"],
      ["cp:version", "Version"],
      ["dc:creator", "Author"],
      ["dc:description", "Comments"],
      ["dc:identifier", "Identifier"],
      ["dc:language", "Language"],
      ["dc:subject", "Subject"],
      ["dc:title", "Title"],
      ["dcterms:created", "CreatedDate", "date"],
      ["dcterms:modified", "ModifiedDate", "date"],
    ],
    tn = (function () {
      for (var e = new Array(en.length), t = 0; t < en.length; ++t) {
        var r = en[t],
          r =
            "(?:" +
            r[0].slice(0, r[0].indexOf(":")) +
            ":)" +
            r[0].slice(r[0].indexOf(":") + 1);
        e[t] = new RegExp("<" + r + "[^>]*>([\\s\\S]*?)</" + r + ">");
      }
      return e;
    })();
  function rn(e) {
    var t = {};
    e = Mt(e);
    for (var r = 0; r < en.length; ++r) {
      var a = en[r],
        n = e.match(tn[r]);
      null != n && 0 < n.length && (t[a[1]] = wt(n[1])),
        "date" === a[2] && t[a[1]] && (t[a[1]] = He(t[a[1]]));
    }
    return t;
  }
  function an(e, t, r, a, n) {
    null == n[e] &&
      null != t &&
      "" !== t &&
      ((t = kt((n[e] = t))), (a[a.length] = r ? Yt(e, t, r) : $t(e, t)));
  }
  function nn(e, t) {
    var r = t || {},
      a = [
        ot,
        Yt("cp:coreProperties", null, {
          "xmlns:cp": Zt.CORE_PROPS,
          "xmlns:dc": Zt.dc,
          "xmlns:dcterms": Zt.dcterms,
          "xmlns:dcmitype": Zt.dcmitype,
          "xmlns:xsi": Zt.xsi,
        }),
      ],
      n = {};
    if (!e && !r.Props) return a.join("");
    e &&
      (null != e.CreatedDate &&
        an(
          "dcterms:created",
          "string" == typeof e.CreatedDate
            ? e.CreatedDate
            : Kt(e.CreatedDate, r.WTF),
          { "xsi:type": "dcterms:W3CDTF" },
          a,
          n,
        ),
      null != e.ModifiedDate &&
        an(
          "dcterms:modified",
          "string" == typeof e.ModifiedDate
            ? e.ModifiedDate
            : Kt(e.ModifiedDate, r.WTF),
          { "xsi:type": "dcterms:W3CDTF" },
          a,
          n,
        ));
    for (var s = 0; s != en.length; ++s) {
      var i = en[s],
        o =
          r.Props && null != r.Props[i[1]] ? r.Props[i[1]] : e ? e[i[1]] : null;
      !0 === o
        ? (o = "1")
        : !1 === o
        ? (o = "0")
        : "number" == typeof o && (o = String(o)),
        null != o && an(i[0], o, null, a, n);
    }
    return (
      2 < a.length &&
        ((a[a.length] = "</cp:coreProperties>"),
        (a[1] = a[1].replace("/>", ">"))),
      a.join("")
    );
  }
  var sn = [
      ["Application", "Application", "string"],
      ["AppVersion", "AppVersion", "string"],
      ["Company", "Company", "string"],
      ["DocSecurity", "DocSecurity", "string"],
      ["Manager", "Manager", "string"],
      ["HyperlinksChanged", "HyperlinksChanged", "bool"],
      ["SharedDoc", "SharedDoc", "bool"],
      ["LinksUpToDate", "LinksUpToDate", "bool"],
      ["ScaleCrop", "ScaleCrop", "bool"],
      ["HeadingPairs", "HeadingPairs", "raw"],
      ["TitlesOfParts", "TitlesOfParts", "raw"],
    ],
    on = [
      "Worksheets",
      "SheetNames",
      "NamedRanges",
      "DefinedNames",
      "Chartsheets",
      "ChartNames",
    ];
  function cn(e, t, r, a) {
    var n = [];
    if ("string" == typeof e) n = Gt(e, a);
    else
      for (var s = 0; s < e.length; ++s)
        n = n.concat(
          e[s].map(function (e) {
            return { v: e };
          }),
        );
    var i,
      o =
        "string" == typeof t
          ? Gt(t, a).map(function (e) {
              return e.v;
            })
          : t,
      c = 0;
    if (0 < o.length)
      for (var l = 0; l !== n.length; l += 2) {
        switch (((i = +n[l + 1].v), n[l].v)) {
          case "Worksheets":
          case "工作表":
          case "Листы":
          case "أوراق العمل":
          case "ワークシート":
          case "גליונות עבודה":
          case "Arbeitsblätter":
          case "Çalışma Sayfaları":
          case "Feuilles de calcul":
          case "Fogli di lavoro":
          case "Folhas de cálculo":
          case "Planilhas":
          case "Regneark":
          case "Hojas de cálculo":
          case "Werkbladen":
            (r.Worksheets = i), (r.SheetNames = o.slice(c, c + i));
            break;
          case "Named Ranges":
          case "Rangos con nombre":
          case "名前付き一覧":
          case "Benannte Bereiche":
          case "Navngivne områder":
            (r.NamedRanges = i), (r.DefinedNames = o.slice(c, c + i));
            break;
          case "Charts":
          case "Diagramme":
            (r.Chartsheets = i), (r.ChartNames = o.slice(c, c + i));
        }
        c += i;
      }
  }
  function ln(r) {
    var a = [],
      n = Yt;
    return (
      ((r = r || {}).Application = "SheetJS"),
      (a[a.length] = ot),
      (a[a.length] = Yt("Properties", null, {
        xmlns: Zt.EXT_PROPS,
        "xmlns:vt": Zt.vt,
      })),
      sn.forEach(function (e) {
        if (void 0 !== r[e[1]]) {
          var t;
          switch (e[2]) {
            case "string":
              t = kt(String(r[e[1]]));
              break;
            case "bool":
              t = r[e[1]] ? "true" : "false";
          }
          void 0 !== t && (a[a.length] = n(e[0], t));
        }
      }),
      (a[a.length] = n(
        "HeadingPairs",
        n(
          "vt:vector",
          n("vt:variant", "<vt:lpstr>Worksheets</vt:lpstr>") +
            n("vt:variant", n("vt:i4", String(r.Worksheets))),
          { size: 2, baseType: "variant" },
        ),
      )),
      (a[a.length] = n(
        "TitlesOfParts",
        n(
          "vt:vector",
          r.SheetNames.map(function (e) {
            return "<vt:lpstr>" + kt(e) + "</vt:lpstr>";
          }).join(""),
          { size: r.Worksheets, baseType: "lpstr" },
        ),
      )),
      2 < a.length &&
        ((a[a.length] = "</Properties>"), (a[1] = a[1].replace("/>", ">"))),
      a.join("")
    );
  }
  var fn = /<[^>]+>[^<]*/g;
  function hn(t) {
    var r = [
      ot,
      Yt("Properties", null, { xmlns: Zt.CUST_PROPS, "xmlns:vt": Zt.vt }),
    ];
    if (!t) return r.join("");
    var a = 1;
    return (
      Re(t).forEach(function (e) {
        ++a,
          (r[r.length] = Yt(
            "property",
            (function (e, t) {
              switch (typeof e) {
                case "string":
                  var r = Yt("vt:lpwstr", kt(e));
                  return (r = t ? r.replace(/&quot;/g, "_x0022_") : r);
                case "number":
                  return Yt((0 | e) == e ? "vt:i4" : "vt:r8", kt(String(e)));
                case "boolean":
                  return Yt("vt:bool", e ? "true" : "false");
              }
              if (e instanceof Date) return Yt("vt:filetime", Kt(e));
              throw new Error("Unable to serialize " + e);
            })(t[e], !0),
            {
              fmtid: "{D5CDD505-2E9C-101B-9397-08002B2CF9AE}",
              pid: a,
              name: kt(e),
            },
          ));
      }),
      2 < r.length &&
        ((r[r.length] = "</Properties>"), (r[1] = r[1].replace("/>", ">"))),
      r.join("")
    );
  }
  var un,
    dn = {
      Title: "Title",
      Subject: "Subject",
      Author: "Author",
      Keywords: "Keywords",
      Comments: "Description",
      LastAuthor: "LastAuthor",
      RevNumber: "Revision",
      Application: "AppName",
      LastPrinted: "LastPrinted",
      CreatedDate: "Created",
      ModifiedDate: "LastSaved",
      Category: "Category",
      Manager: "Manager",
      Company: "Company",
      AppVersion: "Version",
      ContentStatus: "ContentStatus",
      Identifier: "Identifier",
      Language: "Language",
    };
  function pn(e) {
    var t = e.read_shift(4),
      e = e.read_shift(4);
    return new Date(1e3 * ((e / 1e7) * Math.pow(2, 32) + t / 1e7 - 11644473600))
      .toISOString()
      .replace(/\.000/, "");
  }
  function mn(e, t, r) {
    var a = e.l,
      n = e.read_shift(0, "lpstr-cp");
    if (r) for (; (e.l - a) & 3; ) ++e.l;
    return n;
  }
  function gn(e, t, r) {
    var a = e.read_shift(0, "lpwstr");
    return r && (e.l += (4 - ((a.length + 1) & 3)) & 3), a;
  }
  function bn(e, t, r) {
    return 31 === t ? gn(e) : mn(e, 0, r);
  }
  function vn(e, t, r) {
    return bn(e, t, !1 === r ? 0 : 4);
  }
  function wn(e) {
    for (var t, r, a, n = e.read_shift(4), s = [], i = 0; i < n / 2; ++i)
      s.push(
        ((a = r = void 0),
        (r = (t = e).l),
        (a = kn(t, Fa)),
        0 == t[t.l] && 0 == t[t.l + 1] && (t.l - r) & 2 && (t.l += 2),
        [a, kn(t, Ia)]),
      );
    return s;
  }
  function Tn(e, t) {
    for (var r = e.read_shift(4), a = {}, n = 0; n != r; ++n) {
      var s = e.read_shift(4),
        i = e.read_shift(4);
      (a[s] = e
        .read_shift(i, 1200 === t ? "utf16le" : "utf8")
        .replace(de, "")
        .replace(pe, "!")),
        1200 === t && i % 2 && (e.l += 2);
    }
    return 3 & e.l && (e.l = (e.l >> 3) << 2), a;
  }
  function En(e) {
    var t = e.read_shift(4),
      r = e.slice(e.l, e.l + t);
    return (e.l += t), 0 < (3 & t) && (e.l += (4 - (3 & t)) & 3), r;
  }
  function kn(e, t, r) {
    var a,
      n,
      s = e.read_shift(2),
      i = r || {};
    if (
      ((e.l += 2),
      t !== Na &&
        s !== t &&
        -1 === Da.indexOf(t) &&
        (4126 != (65534 & t) || 4126 != (65534 & s)))
    )
      throw new Error("Expected type " + t + " saw " + s);
    switch (t === Na ? s : t) {
      case 2:
        return (a = e.read_shift(2, "i")), i.raw || (e.l += 2), a;
      case 3:
        return (a = e.read_shift(4, "i"));
      case 11:
        return 0 !== e.read_shift(4);
      case 19:
        return (a = e.read_shift(4));
      case 30:
        return mn(e, 0, 4).replace(de, "");
      case 31:
        return gn(e);
      case 64:
        return pn(e);
      case 65:
        return En(e);
      case 71:
        return (
          ((n = {}).Size = (a = e).read_shift(4)),
          (a.l += n.Size + 3 - ((n.Size - 1) % 4)),
          n
        );
      case 80:
        return vn(e, s, !i.raw).replace(de, "");
      case 81:
        return (function (e, t) {
          if (!t)
            throw new Error("VtUnalignedString must have positive length");
          return bn(e, t, 0);
        })(e, s).replace(de, "");
      case 4108:
        return wn(e);
      case 4126:
      case 4127:
        return (
          4127 == s
            ? function (e) {
                for (var t = e.read_shift(4), r = [], a = 0; a != t; ++a) {
                  var n = e.l;
                  (r[a] = e.read_shift(0, "lpwstr").replace(de, "")),
                    (e.l - n) & 2 && (e.l += 2);
                }
                return r;
              }
            : function (e) {
                for (var t = e.read_shift(4), r = [], a = 0; a != t; ++a)
                  r[a] = e.read_shift(0, "lpstr-cp").replace(de, "");
                return r;
              }
        )(e);
      default:
        throw new Error("TypedPropertyValue unrecognized type " + t + " " + s);
    }
  }
  function yn(e, t) {
    var r,
      a,
      n,
      s = Lr(4),
      i = Lr(4);
    switch ((s.write_shift(4, 80 == e ? 31 : e), e)) {
      case 3:
        i.write_shift(-4, t);
        break;
      case 5:
        (i = Lr(8)).write_shift(8, t, "f");
        break;
      case 11:
        i.write_shift(4, t ? 1 : 0);
        break;
      case 64:
        (a =
          ("string" == typeof (r = t) ? new Date(Date.parse(r)) : r).getTime() /
            1e3 +
          11644473600),
          (n = a % Math.pow(2, 32)),
          (r = (a - n) / Math.pow(2, 32)),
          (r *= 1e7),
          0 < (a = ((n *= 1e7) / Math.pow(2, 32)) | 0) &&
            ((n %= Math.pow(2, 32)), (r += a)),
          (a = Lr(8)).write_shift(4, n),
          a.write_shift(4, r),
          (i = a);
        break;
      case 31:
      case 80:
        for (
          (i = Lr(4 + 2 * (t.length + 1) + (t.length % 2 ? 0 : 2))).write_shift(
            4,
            t.length + 1,
          ),
            i.write_shift(0, t, "dbcs");
          i.l != i.length;

        )
          i.write_shift(1, 0);
        break;
      default:
        throw new Error("TypedPropertyValue unrecognized type " + e + " " + t);
    }
    return ue([s, i]);
  }
  function Sn(e, t) {
    for (
      var r = e.l,
        a = e.read_shift(4),
        n = e.read_shift(4),
        s = [],
        i = 0,
        o = 0,
        c = -1,
        l = {},
        i = 0;
      i != n;
      ++i
    ) {
      var f = e.read_shift(4),
        h = e.read_shift(4);
      s[i] = [f, h + r];
    }
    s.sort(function (e, t) {
      return e[1] - t[1];
    });
    var u = {};
    for (i = 0; i != n; ++i) {
      if (e.l !== s[i][1]) {
        var d = !0;
        if (0 < i && t)
          switch (t[s[i - 1][0]].t) {
            case 2:
              e.l + 2 === s[i][1] && ((e.l += 2), (d = !1));
              break;
            case 80:
            case 4108:
              e.l <= s[i][1] && ((e.l = s[i][1]), (d = !1));
          }
        if (
          ((!t || 0 == i) && e.l <= s[i][1] && ((d = !1), (e.l = s[i][1])), d)
        )
          throw new Error(
            "Read Error: Expected address " + s[i][1] + " at " + e.l + " :" + i,
          );
      }
      if (t) {
        var p = t[s[i][0]];
        if (
          ((u[p.n] = kn(e, p.t, { raw: !0 })),
          "version" === p.p &&
            (u[p.n] =
              String(u[p.n] >> 16) +
              "." +
              ("0000" + String(65535 & u[p.n])).slice(-4)),
          "CodePage" == p.n)
        )
          switch (u[p.n]) {
            case 0:
              u[p.n] = 1252;
            case 874:
            case 932:
            case 936:
            case 949:
            case 950:
            case 1250:
            case 1251:
            case 1253:
            case 1254:
            case 1255:
            case 1256:
            case 1257:
            case 1258:
            case 1e4:
            case 1200:
            case 1201:
            case 1252:
            case 65e3:
            case -536:
            case 65001:
            case -535:
              ie((o = (u[p.n] >>> 0) & 65535));
              break;
            default:
              throw new Error("Unsupported CodePage: " + u[p.n]);
          }
      } else if (1 === s[i][0]) {
        o = u.CodePage = kn(e, Oa);
        ie(o),
          -1 !== c && ((g = e.l), (e.l = s[c][1]), (l = Tn(e, o)), (e.l = g));
      } else if (0 === s[i][0])
        0 !== o ? (l = Tn(e, o)) : ((c = i), (e.l = s[i + 1][1]));
      else {
        var m,
          g = l[s[i][0]];
        switch (e[e.l]) {
          case 65:
            (e.l += 4), (m = En(e));
            break;
          case 30:
          case 31:
            (e.l += 4), (m = vn(e, e[e.l - 4]).replace(/\u0000+$/, ""));
            break;
          case 3:
            (e.l += 4), (m = e.read_shift(4, "i"));
            break;
          case 19:
            (e.l += 4), (m = e.read_shift(4));
            break;
          case 5:
            (e.l += 4), (m = e.read_shift(8, "f"));
            break;
          case 11:
            (e.l += 4), (m = On(e, 4));
            break;
          case 64:
            (e.l += 4), (m = He(pn(e)));
            break;
          default:
            throw new Error("unparsed value: " + e[e.l]);
        }
        u[g] = m;
      }
    }
    return (e.l = r + a), u;
  }
  var _n = [
    "CodePage",
    "Thumbnail",
    "_PID_LINKBASE",
    "_PID_HLINKS",
    "SystemIdentifier",
    "FMTID",
  ];
  function xn(e, t, r) {
    var a,
      n,
      s,
      i,
      o = Lr(8),
      c = [],
      l = [],
      f = 8,
      h = 0,
      u = Lr(8),
      d = Lr(8);
    if (
      (u.write_shift(4, 2),
      u.write_shift(4, 1200),
      d.write_shift(4, 1),
      l.push(u),
      c.push(d),
      (f += 8 + u.length),
      !t)
    ) {
      (d = Lr(8)).write_shift(4, 0), c.unshift(d);
      var p = [Lr(4)];
      for (p[0].write_shift(4, e.length), h = 0; h < e.length; ++h) {
        var m = e[h][0];
        for (
          (u = Lr(8 + 2 * (m.length + 1) + (m.length % 2 ? 0 : 2))).write_shift(
            4,
            h + 2,
          ),
            u.write_shift(4, m.length + 1),
            u.write_shift(0, m, "dbcs");
          u.l != u.length;

        )
          u.write_shift(1, 0);
        p.push(u);
      }
      (u = ue(p)), l.unshift(u), (f += 8 + u.length);
    }
    for (h = 0; h < e.length; ++h)
      (t && !t[e[h][0]]) ||
        -1 < _n.indexOf(e[h][0]) ||
        -1 < on.indexOf(e[h][0]) ||
        (null != e[h][1] &&
          ((s = e[h][1]),
          (a = 0),
          (u = t
            ? ("version" == (i = r[(a = +t[e[h][0]])]).p &&
                "string" == typeof s &&
                (s = (+(n = s.split("."))[0] << 16) + (+n[1] || 0)),
              yn(i.t, s))
            : (-1 ==
                (i = (function (e) {
                  switch (typeof e) {
                    case "boolean":
                      return 11;
                    case "number":
                      return (0 | e) == e ? 3 : 5;
                    case "string":
                      return 31;
                    case "object":
                      if (e instanceof Date) return 64;
                  }
                  return -1;
                })(s)) && ((i = 31), (s = String(s))),
              yn(i, s))),
          l.push(u),
          (d = Lr(8)).write_shift(4, t ? a : 2 + h),
          c.push(d),
          (f += 8 + u.length)));
    for (var g = 8 * (l.length + 1), h = 0; h < l.length; ++h)
      c[h].write_shift(4, g), (g += l[h].length);
    return (
      o.write_shift(4, f),
      o.write_shift(4, l.length),
      ue([o].concat(c).concat(l))
    );
  }
  function An(e, t, r) {
    var a = e.content;
    if (!a) return {};
    Dr(a, 0);
    var n,
      s = 0;
    a.chk("feff", "Byte Order: "), a.read_shift(2);
    var i = a.read_shift(4),
      o = a.read_shift(16);
    if (o !== xe.utils.consts.HEADER_CLSID && o !== r)
      throw new Error("Bad PropertySet CLSID " + o);
    if (1 !== (e = a.read_shift(4)) && 2 !== e)
      throw new Error("Unrecognized #Sets: " + e);
    if (((r = a.read_shift(16)), (o = a.read_shift(4)), 1 === e && o !== a.l))
      throw new Error("Length mismatch: " + o + " !== " + a.l);
    2 === e && ((n = a.read_shift(16)), (s = a.read_shift(4)));
    var c,
      l,
      f = Sn(a, t),
      h = { SystemIdentifier: i };
    for (c in f) h[c] = f[c];
    if (((h.FMTID = r), 1 === e)) return h;
    if ((s - a.l == 2 && (a.l += 2), a.l !== s))
      throw new Error("Length mismatch 2: " + a.l + " !== " + s);
    try {
      l = Sn(a, null);
    } catch (e) {}
    for (c in l) h[c] = l[c];
    return (h.FMTID = [r, n]), h;
  }
  function Cn(e, t, r, a, n, s) {
    var i = Lr(n ? 68 : 48),
      o = [i];
    i.write_shift(2, 65534),
      i.write_shift(2, 0),
      i.write_shift(4, 842412599),
      i.write_shift(16, xe.utils.consts.HEADER_CLSID, "hex"),
      i.write_shift(4, n ? 2 : 1),
      i.write_shift(16, t, "hex"),
      i.write_shift(4, n ? 68 : 48);
    a = xn(e, r, a);
    return (
      o.push(a),
      n &&
        ((n = xn(n, null, null)),
        i.write_shift(16, s, "hex"),
        i.write_shift(4, 68 + a.length),
        o.push(n)),
      ue(o)
    );
  }
  function Rn(e, t) {
    return e.read_shift(t), null;
  }
  function On(e, t) {
    return 1 === e.read_shift(t);
  }
  function In(e, t) {
    return (t = t || Lr(2)).write_shift(2, +!!e), t;
  }
  function Nn(e) {
    return e.read_shift(2, "u");
  }
  function Fn(e, t) {
    return (t = t || Lr(2)).write_shift(2, e), t;
  }
  function Dn(e, t) {
    return (function (e, t, r) {
      for (var a = [], n = e.l + t; e.l < n; ) a.push(r(e, n - e.l));
      if (n !== e.l) throw new Error("Slurp error");
      return a;
    })(e, t, Nn);
  }
  function Pn(e, t, r) {
    return (
      (r = r || Lr(2)).write_shift(1, "e" == t ? +e : +!!e),
      r.write_shift(1, "e" == t ? 1 : 0),
      r
    );
  }
  function Ln(e, t, r) {
    var a = e.read_shift(r && 12 <= r.biff ? 2 : 1),
      n = "sbcs-cont",
      s = f;
    r && 8 <= r.biff && (f = 1200),
      r && 8 != r.biff
        ? 12 == r.biff && (n = "wstr")
        : e.read_shift(1) && (n = "dbcs-cont"),
      2 <= r.biff && r.biff <= 5 && (n = "cpstr");
    n = a ? e.read_shift(a, n) : "";
    return (f = s), n;
  }
  function Mn(e, t, r) {
    if (r) {
      if (2 <= r.biff && r.biff <= 5) return e.read_shift(t, "cpstr");
      if (12 <= r.biff) return e.read_shift(t, "dbcs-cont");
    }
    return 0 === e.read_shift(1)
      ? e.read_shift(t, "sbcs-cont")
      : e.read_shift(t, "dbcs-cont");
  }
  function Un(e, t, r) {
    var a = e.read_shift(r && 2 == r.biff ? 1 : 2);
    return 0 === a ? (e.l++, "") : Mn(e, a, r);
  }
  function Bn(e, t, r) {
    if (5 < r.biff) return Un(e, 0, r);
    var a = e.read_shift(1);
    return 0 === a
      ? (e.l++, "")
      : e.read_shift(a, r.biff <= 4 || !e.lens ? "cpstr" : "sbcs-cont");
  }
  function Wn(e, t, r) {
    return (
      (r = r || Lr(3 + 2 * e.length)).write_shift(2, e.length),
      r.write_shift(1, 1),
      r.write_shift(31, e, "utf16le"),
      r
    );
  }
  function Hn(e) {
    var t,
      r,
      a,
      n,
      s = e.read_shift(16);
    switch (s) {
      case "e0c9ea79f9bace118c8200aa004ba90b":
        return (
          (r = (t = e).read_shift(4)),
          (a = t.l),
          (n = !1),
          24 < r &&
            ((t.l += r - 24),
            "795881f43b1d7f48af2c825dc4852763" === t.read_shift(16) && (n = !0),
            (t.l = a)),
          (r = t.read_shift((n ? r - 24 : r) >> 1, "utf16le").replace(de, "")),
          n && (t.l += 24),
          r
        );
      case "0303000000000000c000000000000046":
        return (function (e) {
          for (var t = e.read_shift(2), r = ""; 0 < t--; ) r += "../";
          var a = e.read_shift(0, "lpstr-ansi");
          if (((e.l += 2), 57005 != e.read_shift(2)))
            throw new Error("Bad FileMoniker");
          if (0 === e.read_shift(4)) return r + a.replace(/\\/g, "/");
          if (((a = e.read_shift(4)), 3 != e.read_shift(2)))
            throw new Error("Bad FileMoniker");
          return r + e.read_shift(a >> 1, "utf16le").replace(de, "");
        })(e);
      default:
        throw new Error("Unsupported Moniker " + s);
    }
  }
  function zn(e) {
    var t = e.read_shift(4);
    return 0 < t ? e.read_shift(t, "utf16le").replace(de, "") : "";
  }
  function Vn(e, t) {
    (t = t || Lr(6 + 2 * e.length)).write_shift(4, 1 + e.length);
    for (var r = 0; r < e.length; ++r) t.write_shift(2, e.charCodeAt(r));
    return t.write_shift(2, 0), t;
  }
  function Gn(e) {
    return [e.read_shift(1), e.read_shift(1), e.read_shift(1), e.read_shift(1)];
  }
  function jn(e) {
    e = Gn(e);
    return (e[3] = 0), e;
  }
  function $n(e) {
    return { r: e.read_shift(2), c: e.read_shift(2), ixfe: e.read_shift(2) };
  }
  function Xn(e, t, r, a) {
    return (
      (a = a || Lr(6)).write_shift(2, e),
      a.write_shift(2, t),
      a.write_shift(2, r || 0),
      a
    );
  }
  function Yn(e) {
    return [e.read_shift(2), Ea(e)];
  }
  function Kn(e) {
    var t = e.read_shift(2),
      r = e.read_shift(2);
    return { s: { c: e.read_shift(2), r: t }, e: { c: e.read_shift(2), r: r } };
  }
  function Jn(e, t) {
    return (
      (t = t || Lr(8)).write_shift(2, e.s.r),
      t.write_shift(2, e.e.r),
      t.write_shift(2, e.s.c),
      t.write_shift(2, e.e.c),
      t
    );
  }
  function qn(e) {
    var t = e.read_shift(2),
      r = e.read_shift(2);
    return { s: { c: e.read_shift(1), r: t }, e: { c: e.read_shift(1), r: r } };
  }
  var Zn = qn;
  function Qn(e) {
    e.l += 4;
    var t = e.read_shift(2),
      r = e.read_shift(2),
      a = e.read_shift(2);
    return (e.l += 12), [r, t, a];
  }
  function es(e) {
    (e.l += 2), (e.l += e.read_shift(2));
  }
  var ts = {
    0: es,
    4: es,
    5: es,
    6: es,
    7: function (e) {
      return (e.l += 4), (e.cf = e.read_shift(2)), {};
    },
    8: es,
    9: es,
    10: es,
    11: es,
    12: es,
    13: function (e) {
      var t = {};
      return (
        (e.l += 4),
        (e.l += 16),
        (t.fSharedNote = e.read_shift(2)),
        (e.l += 4),
        t
      );
    },
    14: es,
    15: es,
    16: es,
    17: es,
    18: es,
    19: es,
    20: es,
    21: Qn,
  };
  function rs(e, t) {
    var r = { BIFFVer: 0, dt: 0 };
    switch (
      ((r.BIFFVer = e.read_shift(2)),
      2 <= (t -= 2) && ((r.dt = e.read_shift(2)), (e.l -= 2)),
      r.BIFFVer)
    ) {
      case 1536:
      case 1280:
      case 1024:
      case 768:
      case 512:
      case 2:
      case 7:
        break;
      default:
        if (6 < t) throw new Error("Unexpected BIFF Ver " + r.BIFFVer);
    }
    return e.read_shift(t), r;
  }
  function as(e, t, r) {
    var a = 1536,
      n = 16;
    switch (r.bookType) {
      case "biff8":
        break;
      case "biff5":
        (a = 1280), (n = 8);
        break;
      case "biff4":
        (a = 4), (n = 6);
        break;
      case "biff3":
        (a = 3), (n = 6);
        break;
      case "biff2":
        (a = 2), (n = 4);
        break;
      case "xla":
        break;
      default:
        throw new Error("unsupported BIFF version");
    }
    r = Lr(n);
    return (
      r.write_shift(2, a),
      r.write_shift(2, t),
      4 < n && r.write_shift(2, 29282),
      6 < n && r.write_shift(2, 1997),
      8 < n &&
        (r.write_shift(2, 49161),
        r.write_shift(2, 1),
        r.write_shift(2, 1798),
        r.write_shift(2, 0)),
      r
    );
  }
  function ns(e) {
    var t = Lr(8);
    t.write_shift(4, e.Count), t.write_shift(4, e.Unique);
    for (var r, a, n, s = [], i = 0; i < e.length; ++i)
      s[i] =
        ((r = e[i]),
        (n = a = void 0),
        (a = r.t || ""),
        (n = Lr(3)).write_shift(2, a.length),
        n.write_shift(1, 1),
        (r = Lr(2 * a.length)).write_shift(2 * a.length, a, "utf16le"),
        ue([n, r]));
    var o = ue([t].concat(s));
    return (
      (o.parts = [t.length].concat(
        s.map(function (e) {
          return e.length;
        }),
      )),
      o
    );
  }
  function ss(e, t, r) {
    var a = 0;
    (r && 2 == r.biff) || (a = e.read_shift(2));
    e = e.read_shift(2);
    return (
      r && 2 == r.biff && ((a = 1 - (e >> 15)), (e &= 32767)),
      [
        {
          Unsynced: 1 & a,
          DyZero: (2 & a) >> 1,
          ExAsc: (4 & a) >> 2,
          ExDsc: (8 & a) >> 3,
        },
        e,
      ]
    );
  }
  var is = Bn;
  function os(e, t, r) {
    var a = e.l + t,
      n = 8 != r.biff && r.biff ? 2 : 4,
      s = e.read_shift(n),
      t = e.read_shift(n),
      r = e.read_shift(2),
      n = e.read_shift(2);
    return (e.l = a), { s: { r: s, c: r }, e: { r: t, c: n } };
  }
  function cs(e, t, r, a) {
    r = r && 5 == r.biff;
    (a = a || Lr(r ? 16 : 20)).write_shift(2, 0),
      e.style
        ? (a.write_shift(2, e.numFmtId || 0), a.write_shift(2, 65524))
        : (a.write_shift(2, e.numFmtId || 0), a.write_shift(2, t << 4));
    t = 0;
    return (
      0 < e.numFmtId && r && (t |= 1024),
      a.write_shift(4, t),
      a.write_shift(4, 0),
      r || a.write_shift(4, 0),
      a.write_shift(2, 0),
      a
    );
  }
  function ls(e, t, r) {
    var a = $n(e);
    (2 != r.biff && 9 != t) || ++e.l;
    (e = (t = e).read_shift(1)), (e = 1 === t.read_shift(1) ? e : 1 === e);
    return (a.val = e), (a.t = !0 === e || !1 === e ? "b" : "e"), a;
  }
  function fs(e, t, r) {
    return 0 === t ? "" : Bn(e, 0, r);
  }
  function hs(e, t, r) {
    var a,
      n = e.read_shift(2),
      n = {
        fBuiltIn: 1 & n,
        fWantAdvise: (n >>> 1) & 1,
        fWantPict: (n >>> 2) & 1,
        fOle: (n >>> 3) & 1,
        fOleLink: (n >>> 4) & 1,
        cf: (n >>> 5) & 1023,
        fIcon: (n >>> 15) & 1,
      };
    return (
      14849 === r.sbcch &&
        (a = (function (e, t, r) {
          (e.l += 4), (t -= 4);
          var a = e.l + t,
            t = Ln(e, 0, r);
          if ((r = e.read_shift(2)) !== (a -= e.l))
            throw new Error("Malformed AddinUdf: padding = " + a + " != " + r);
          return (e.l += r), t;
        })(e, t - 2, r)),
      (n.body = a || e.read_shift(t - 2)),
      "string" == typeof a && (n.Name = a),
      n
    );
  }
  var us = [
    "_xlnm.Consolidate_Area",
    "_xlnm.Auto_Open",
    "_xlnm.Auto_Close",
    "_xlnm.Extract",
    "_xlnm.Database",
    "_xlnm.Criteria",
    "_xlnm.Print_Area",
    "_xlnm.Print_Titles",
    "_xlnm.Recorder",
    "_xlnm.Data_Form",
    "_xlnm.Auto_Activate",
    "_xlnm.Auto_Deactivate",
    "_xlnm.Sheet_Title",
    "_xlnm._FilterDatabase",
  ];
  function ds(e, t, r) {
    var a = e.l + t,
      n = e.read_shift(2),
      s = e.read_shift(1),
      i = e.read_shift(1),
      o = e.read_shift(r && 2 == r.biff ? 1 : 2),
      t = 0;
    (!r || 5 <= r.biff) &&
      (5 != r.biff && (e.l += 2),
      (t = e.read_shift(2)),
      5 == r.biff && (e.l += 2),
      (e.l += 4));
    i = Mn(e, i, r);
    32 & n && (i = us[i.charCodeAt(0)]);
    n = a - e.l;
    return (
      r && 2 == r.biff && --n,
      {
        chKey: s,
        Name: i,
        itab: t,
        rgce:
          a != e.l && 0 !== o && 0 < n
            ? (function (e, t, r, a) {
                var n,
                  t = e.l + t,
                  a = Ic(e, a, r);
                t !== e.l && (n = Oc(e, t - e.l, a, r));
                return [a, n];
              })(e, n, r, o)
            : [],
      }
    );
  }
  function ps(e, t, r) {
    if (r.biff < 8)
      return (function (e, t) {
        3 == e[e.l + 1] && e[e.l]++;
        t = Ln(e, 0, t);
        return 3 == t.charCodeAt(0) ? t.slice(1) : t;
      })(e, r);
    for (
      var a, n, s = [], t = e.l + t, i = e.read_shift(8 < r.biff ? 4 : 2);
      0 != i--;

    )
      s.push(
        ((a = e),
        r.biff,
        (n = 8 < (n = r).biff ? 4 : 2),
        [a.read_shift(n), a.read_shift(n, "i"), a.read_shift(n, "i")]),
      );
    if (e.l != t) throw new Error("Bad ExternSheet: " + e.l + " != " + t);
    return s;
  }
  function ms(e, t, r) {
    var a = Zn(e, 6);
    switch (r.biff) {
      case 2:
        e.l++, (t -= 7);
        break;
      case 3:
      case 4:
        (e.l += 2), (t -= 8);
        break;
      default:
        (e.l += 6), (t -= 12);
    }
    return [
      a,
      (function (e, t, r) {
        var a,
          n = e.l + t,
          s = 2 == r.biff ? 1 : 2,
          i = e.read_shift(s);
        if (65535 == i) return [[], Pr(e, t - 2)];
        var o = Ic(e, i, r);
        t !== i + s && (a = Oc(e, t - i - s, o, r));
        return (e.l = n), [o, a];
      })(e, t, r),
    ];
  }
  var gs = {
    8: function (e, t) {
      var r = e.l + t;
      e.l += 10;
      var a = e.read_shift(2);
      (e.l += 4), (e.l += 2), (e.l += 2), (e.l += 2), (e.l += 4);
      t = e.read_shift(1);
      return (e.l += t), (e.l = r), { fmt: a };
    },
  };
  function bs(e) {
    var t = Lr(24),
      r = Yr(e[0]);
    t.write_shift(2, r.r),
      t.write_shift(2, r.r),
      t.write_shift(2, r.c),
      t.write_shift(2, r.c);
    for (
      var a = "d0 c9 ea 79 f9 ba ce 11 8c 82 00 aa 00 4b a9 0b".split(" "),
        n = 0;
      n < 16;
      ++n
    )
      t.write_shift(1, parseInt(a[n], 16));
    return ue([
      t,
      (function (e) {
        var t = Lr(512),
          r = 0,
          a = e.Target,
          n =
            -1 <
            (e = (a = "file://" == a.slice(0, 7) ? a.slice(7) : a).indexOf("#"))
              ? 31
              : 23;
        switch (a.charAt(0)) {
          case "#":
            n = 28;
            break;
          case ".":
            n &= -3;
        }
        t.write_shift(4, 2), t.write_shift(4, n);
        for (
          var s = [8, 6815827, 6619237, 4849780, 83], r = 0;
          r < s.length;
          ++r
        )
          t.write_shift(4, s[r]);
        if (28 == n) Vn((a = a.slice(1)), t);
        else if (2 & n) {
          for (
            s = "e0 c9 ea 79 f9 ba ce 11 8c 82 00 aa 00 4b a9 0b".split(" "),
              r = 0;
            r < s.length;
            ++r
          )
            t.write_shift(1, parseInt(s[r], 16));
          var i = -1 < e ? a.slice(0, e) : a;
          for (t.write_shift(4, 2 * (i.length + 1)), r = 0; r < i.length; ++r)
            t.write_shift(2, i.charCodeAt(r));
          t.write_shift(2, 0), 8 & n && Vn(-1 < e ? a.slice(e + 1) : "", t);
        } else {
          for (
            s = "03 03 00 00 00 00 00 00 c0 00 00 00 00 00 00 46".split(" "),
              r = 0;
            r < s.length;
            ++r
          )
            t.write_shift(1, parseInt(s[r], 16));
          for (
            var o = 0;
            "../" == a.slice(3 * o, 3 * o + 3) ||
            "..\\" == a.slice(3 * o, 3 * o + 3);

          )
            ++o;
          for (
            t.write_shift(2, o), t.write_shift(4, a.length - 3 * o + 1), r = 0;
            r < a.length - 3 * o;
            ++r
          )
            t.write_shift(1, 255 & a.charCodeAt(r + 3 * o));
          for (
            t.write_shift(1, 0),
              t.write_shift(2, 65535),
              t.write_shift(2, 57005),
              r = 0;
            r < 6;
            ++r
          )
            t.write_shift(4, 0);
        }
        return t.slice(0, t.l);
      })(e[1]),
    ]);
  }
  function vs(e, t, r) {
    if (!r.cellStyles) return Pr(e, t);
    var a = r && 12 <= r.biff ? 4 : 2,
      n = e.read_shift(a),
      s = e.read_shift(a),
      i = e.read_shift(a),
      o = e.read_shift(a),
      t = e.read_shift(2);
    2 == a && (e.l += 2);
    o = { s: n, e: s, w: i, ixfe: o, flags: t };
    return (5 <= r.biff || !r.biff) && (o.level = (t >> 8) & 7), o;
  }
  var ws = $n,
    Ts = Dn,
    Es = Un;
  var ks,
    ys,
    Ss,
    _s = [2, 3, 48, 49, 131, 139, 140, 245],
    xs =
      ((ks = {
        1: 437,
        2: 850,
        3: 1252,
        4: 1e4,
        100: 852,
        101: 866,
        102: 865,
        103: 861,
        104: 895,
        105: 620,
        106: 737,
        107: 857,
        120: 950,
        121: 949,
        122: 936,
        123: 932,
        124: 874,
        125: 1255,
        126: 1256,
        150: 10007,
        151: 10029,
        152: 10006,
        200: 1250,
        201: 1251,
        202: 1254,
        203: 1253,
        0: 20127,
        8: 865,
        9: 437,
        10: 850,
        11: 437,
        13: 437,
        14: 850,
        15: 437,
        16: 850,
        17: 437,
        18: 850,
        19: 932,
        20: 850,
        21: 437,
        22: 850,
        23: 865,
        24: 437,
        25: 437,
        26: 850,
        27: 437,
        28: 863,
        29: 850,
        31: 852,
        34: 852,
        35: 852,
        36: 860,
        37: 850,
        38: 866,
        55: 850,
        64: 852,
        77: 936,
        78: 949,
        79: 950,
        80: 874,
        87: 1252,
        88: 1252,
        89: 1252,
        108: 863,
        134: 737,
        135: 852,
        136: 857,
        204: 1257,
        255: 16969,
      }),
      (ys = Ie({
        1: 437,
        2: 850,
        3: 1252,
        4: 1e4,
        100: 852,
        101: 866,
        102: 865,
        103: 861,
        104: 895,
        105: 620,
        106: 737,
        107: 857,
        120: 950,
        121: 949,
        122: 936,
        123: 932,
        124: 874,
        125: 1255,
        126: 1256,
        150: 10007,
        151: 10029,
        152: 10006,
        200: 1250,
        201: 1251,
        202: 1254,
        203: 1253,
        0: 20127,
      })),
      (Ss = { B: 8, C: 250, L: 1, D: 8, "?": 0, "": 0 }),
      {
        to_workbook: function (e, t) {
          try {
            return ta(As(e, t), t);
          } catch (e) {
            if (t && t.WTF) throw e;
          }
          return { SheetNames: [], Sheets: {} };
        },
        to_sheet: As,
        from_sheet: function (e, t) {
          if (
            (0 <= +(t = t || {}).codepage && ie(+t.codepage),
            "string" == t.type)
          )
            throw new Error("Cannot write DBF to JS string");
          for (
            var r = Ur(),
              a = (t = iu(e, { header: 1, raw: !0, cellDates: !0 }))[0],
              n = t.slice(1),
              s = e["!cols"] || [],
              i = 0,
              o = 0,
              c = 0,
              l = 1,
              i = 0;
            i < a.length;
            ++i
          )
            if (((s[i] || {}).DBF || {}).name) (a[i] = s[i].DBF.name), ++c;
            else if (null != a[i]) {
              if (
                (++c,
                "number" == typeof a[i] && (a[i] = a[i].toString(10)),
                "string" != typeof a[i])
              )
                throw new Error(
                  "DBF Invalid column name " + a[i] + " |" + typeof a[i] + "|",
                );
              if (a.indexOf(a[i]) !== i)
                for (o = 0; o < 1024; ++o)
                  if (-1 == a.indexOf(a[i] + "_" + o)) {
                    a[i] += "_" + o;
                    break;
                  }
            }
          var f = Zr(e["!ref"]),
            h = [],
            u = [],
            d = [];
          for (i = 0; i <= f.e.c - f.s.c; ++i) {
            for (var p = "", m = "", g = 0, b = [], o = 0; o < n.length; ++o)
              null != n[o][i] && b.push(n[o][i]);
            if (0 != b.length && null != a[i]) {
              for (o = 0; o < b.length; ++o) {
                switch (typeof b[o]) {
                  case "number":
                    m = "B";
                    break;
                  case "string":
                    m = "C";
                    break;
                  case "boolean":
                    m = "L";
                    break;
                  case "object":
                    m = b[o] instanceof Date ? "D" : "C";
                    break;
                  default:
                    m = "C";
                }
                (g = Math.max(g, String(b[o]).length)),
                  (p = p && p != m ? "C" : m);
              }
              250 < g && (g = 250),
                "C" == (m = ((s[i] || {}).DBF || {}).type) &&
                  s[i].DBF.len > g &&
                  (g = s[i].DBF.len),
                "B" == p &&
                  "N" == m &&
                  ((p = "N"), (d[i] = s[i].DBF.dec), (g = s[i].DBF.len)),
                (u[i] = "C" == p || "N" == m ? g : Ss[p] || 0),
                (l += u[i]),
                (h[i] = p);
            } else h[i] = "?";
          }
          var v,
            w,
            T = r.next(32);
          for (
            T.write_shift(4, 318902576),
              T.write_shift(4, n.length),
              T.write_shift(2, 296 + 32 * c),
              T.write_shift(2, l),
              i = 0;
            i < 4;
            ++i
          )
            T.write_shift(4, 0);
          for (
            T.write_shift(4, 0 | ((+ys[_] || 3) << 8)), o = i = 0;
            i < a.length;
            ++i
          )
            null != a[i] &&
              ((v = r.next(32)),
              (w = (a[i].slice(-10) + "\0\0\0\0\0\0\0\0\0\0\0").slice(0, 11)),
              v.write_shift(1, w, "sbcs"),
              v.write_shift(1, "?" == h[i] ? "C" : h[i], "sbcs"),
              v.write_shift(4, o),
              v.write_shift(1, u[i] || Ss[h[i]] || 0),
              v.write_shift(1, d[i] || 0),
              v.write_shift(1, 2),
              v.write_shift(4, 0),
              v.write_shift(1, 0),
              v.write_shift(4, 0),
              v.write_shift(4, 0),
              (o += u[i] || Ss[h[i]] || 0));
          var E = r.next(264);
          for (E.write_shift(4, 13), i = 0; i < 65; ++i) E.write_shift(4, 0);
          for (i = 0; i < n.length; ++i) {
            var k = r.next(l);
            for (k.write_shift(1, 0), o = 0; o < a.length; ++o)
              if (null != a[o])
                switch (h[o]) {
                  case "L":
                    k.write_shift(1, null == n[i][o] ? 63 : n[i][o] ? 84 : 70);
                    break;
                  case "B":
                    k.write_shift(8, n[i][o] || 0, "f");
                    break;
                  case "N":
                    var y = "0";
                    for (
                      "number" == typeof n[i][o] &&
                        (y = n[i][o].toFixed(d[o] || 0)),
                        c = 0;
                      c < u[o] - y.length;
                      ++c
                    )
                      k.write_shift(1, 32);
                    k.write_shift(1, y, "sbcs");
                    break;
                  case "D":
                    n[i][o]
                      ? (k.write_shift(
                          4,
                          ("0000" + n[i][o].getFullYear()).slice(-4),
                          "sbcs",
                        ),
                        k.write_shift(
                          2,
                          ("00" + (n[i][o].getMonth() + 1)).slice(-2),
                          "sbcs",
                        ),
                        k.write_shift(
                          2,
                          ("00" + n[i][o].getDate()).slice(-2),
                          "sbcs",
                        ))
                      : k.write_shift(8, "00000000", "sbcs");
                    break;
                  case "C":
                    var S = String(null != n[i][o] ? n[i][o] : "").slice(
                      0,
                      u[o],
                    );
                    for (
                      k.write_shift(1, S, "sbcs"), c = 0;
                      c < u[o] - S.length;
                      ++c
                    )
                      k.write_shift(1, 32);
                }
          }
          return r.next(1).write_shift(1, 26), r.end();
        },
      });
  function As(e, t) {
    t = t || {};
    t.dateNF || (t.dateNF = "yyyymmdd");
    e = aa(
      (function (e, t) {
        var r = [],
          a = le(1);
        switch (t.type) {
          case "base64":
            a = he(te(e));
            break;
          case "binary":
            a = he(e);
            break;
          case "buffer":
          case "array":
            a = e;
        }
        Dr(a, 0);
        var n = a.read_shift(1),
          s = !!(136 & n),
          i = !1,
          o = !1;
        switch (n) {
          case 2:
          case 3:
            break;
          case 48:
          case 49:
            s = i = !0;
            break;
          case 131:
          case 139:
            break;
          case 140:
            o = !0;
            break;
          case 245:
            break;
          default:
            throw new Error("DBF Unsupported Version: " + n.toString(16));
        }
        var c = 0,
          l = 521;
        2 == n && (c = a.read_shift(2)),
          (a.l += 3),
          1048576 < (c = 2 != n ? a.read_shift(4) : c) && (c = 1e6),
          2 != n && (l = a.read_shift(2));
        var f = a.read_shift(2),
          h = t.codepage || 1252;
        2 != n &&
          ((a.l += 16),
          a.read_shift(1),
          0 !== a[a.l] && (h = ks[a[a.l]]),
          (a.l += 1),
          (a.l += 2)),
          o && (a.l += 36);
        for (
          var u = [],
            d = {},
            p = Math.min(a.length, 2 == n ? 521 : l - 10 - (i ? 264 : 0)),
            m = o ? 32 : 11;
          a.l < p && 13 != a[a.l];

        )
          switch (
            (((d = {}).name = re.utils
              .decode(h, a.slice(a.l, a.l + m))
              .replace(/[\u0000\r\n].*$/g, "")),
            (a.l += m),
            (d.type = String.fromCharCode(a.read_shift(1))),
            2 == n || o || (d.offset = a.read_shift(4)),
            (d.len = a.read_shift(1)),
            2 == n && (d.offset = a.read_shift(2)),
            (d.dec = a.read_shift(1)),
            d.name.length && u.push(d),
            2 != n && (a.l += o ? 13 : 14),
            d.type)
          ) {
            case "B":
              (i && 8 == d.len) ||
                !t.WTF ||
                console.log("Skipping " + d.name + ":" + d.type);
              break;
            case "G":
            case "P":
              t.WTF && console.log("Skipping " + d.name + ":" + d.type);
              break;
            case "+":
            case "0":
            case "@":
            case "C":
            case "D":
            case "F":
            case "I":
            case "L":
            case "M":
            case "N":
            case "O":
            case "T":
            case "Y":
              break;
            default:
              throw new Error("Unknown Field Type: " + d.type);
          }
        if ((13 !== a[a.l] && (a.l = l - 1), 13 !== a.read_shift(1)))
          throw new Error("DBF Terminator not found " + a.l + " " + a[a.l]);
        a.l = l;
        var g = 0,
          b = 0;
        for (r[0] = [], b = 0; b != u.length; ++b) r[0][b] = u[b].name;
        for (; 0 < c--; )
          if (42 !== a[a.l])
            for (++a.l, r[++g] = [], b = b = 0; b != u.length; ++b) {
              var v = a.slice(a.l, a.l + u[b].len);
              (a.l += u[b].len), Dr(v, 0);
              var w = re.utils.decode(h, v);
              switch (u[b].type) {
                case "C":
                  w.trim().length && (r[g][b] = w.replace(/\s+$/, ""));
                  break;
                case "D":
                  8 === w.length
                    ? (r[g][b] = new Date(
                        +w.slice(0, 4),
                        +w.slice(4, 6) - 1,
                        +w.slice(6, 8),
                      ))
                    : (r[g][b] = w);
                  break;
                case "F":
                  r[g][b] = parseFloat(w.trim());
                  break;
                case "+":
                case "I":
                  r[g][b] = o
                    ? 2147483648 ^ v.read_shift(-4, "i")
                    : v.read_shift(4, "i");
                  break;
                case "L":
                  switch (w.trim().toUpperCase()) {
                    case "Y":
                    case "T":
                      r[g][b] = !0;
                      break;
                    case "N":
                    case "F":
                      r[g][b] = !1;
                      break;
                    case "":
                    case "?":
                      break;
                    default:
                      throw new Error("DBF Unrecognized L:|" + w + "|");
                  }
                  break;
                case "M":
                  if (!s)
                    throw new Error(
                      "DBF Unexpected MEMO for type " + n.toString(16),
                    );
                  r[g][b] =
                    "##MEMO##" + (o ? parseInt(w.trim(), 10) : v.read_shift(4));
                  break;
                case "N":
                  (w = w.replace(/\u0000/g, "").trim()) &&
                    "." != w &&
                    (r[g][b] = +w || 0);
                  break;
                case "@":
                  r[g][b] = new Date(v.read_shift(-8, "f") - 621356832e5);
                  break;
                case "T":
                  r[g][b] = new Date(
                    864e5 * (v.read_shift(4) - 2440588) + v.read_shift(4),
                  );
                  break;
                case "Y":
                  r[g][b] =
                    v.read_shift(4, "i") / 1e4 +
                    (v.read_shift(4, "i") / 1e4) * Math.pow(2, 32);
                  break;
                case "O":
                  r[g][b] = -v.read_shift(-8, "f");
                  break;
                case "B":
                  if (i && 8 == u[b].len) {
                    r[g][b] = v.read_shift(8, "f");
                    break;
                  }
                case "G":
                case "P":
                  v.l += u[b].len;
                  break;
                case "0":
                  if ("_NullFlags" === u[b].name) break;
                default:
                  throw new Error("DBF Unsupported data type " + u[b].type);
              }
            }
          else a.l += f;
        if (2 != n && a.l < a.length && 26 != a[a.l++])
          throw new Error(
            "DBF EOF Marker missing " +
              (a.l - 1) +
              " of " +
              a.length +
              " " +
              a[a.l - 1].toString(16),
          );
        return (
          t && t.sheetRows && (r = r.slice(0, t.sheetRows)), (t.DBF = u), r
        );
      })(e, t),
      t,
    );
    return (
      (e["!cols"] = t.DBF.map(function (e) {
        return { wch: e.len, DBF: e };
      })),
      delete t.DBF,
      e
    );
  }
  var Cs,
    Rs,
    Os,
    Is,
    Ns =
      ((Cs = {
        AA: "À",
        BA: "Á",
        CA: "Â",
        DA: 195,
        HA: "Ä",
        JA: 197,
        AE: "È",
        BE: "É",
        CE: "Ê",
        HE: "Ë",
        AI: "Ì",
        BI: "Í",
        CI: "Î",
        HI: "Ï",
        AO: "Ò",
        BO: "Ó",
        CO: "Ô",
        DO: 213,
        HO: "Ö",
        AU: "Ù",
        BU: "Ú",
        CU: "Û",
        HU: "Ü",
        Aa: "à",
        Ba: "á",
        Ca: "â",
        Da: 227,
        Ha: "ä",
        Ja: 229,
        Ae: "è",
        Be: "é",
        Ce: "ê",
        He: "ë",
        Ai: "ì",
        Bi: "í",
        Ci: "î",
        Hi: "ï",
        Ao: "ò",
        Bo: "ó",
        Co: "ô",
        Do: 245,
        Ho: "ö",
        Au: "ù",
        Bu: "ú",
        Cu: "û",
        Hu: "ü",
        KC: "Ç",
        Kc: "ç",
        q: "æ",
        z: "œ",
        a: "Æ",
        j: "Œ",
        DN: 209,
        Dn: 241,
        Hy: 255,
        S: 169,
        c: 170,
        R: 174,
        "B ": 180,
        0: 176,
        1: 177,
        2: 178,
        3: 179,
        5: 181,
        6: 182,
        7: 183,
        Q: 185,
        k: 186,
        b: 208,
        i: 216,
        l: 222,
        s: 240,
        y: 248,
        "!": 161,
        '"': 162,
        "#": 163,
        "(": 164,
        "%": 165,
        "'": 167,
        "H ": 168,
        "+": 171,
        ";": 187,
        "<": 188,
        "=": 189,
        ">": 190,
        "?": 191,
        "{": 223,
      }),
      (Rs = new RegExp(
        "N(" +
          Re(Cs)
            .join("|")
            .replace(/\|\|\|/, "|\\||")
            .replace(/([?()+])/g, "\\$1") +
          "|\\|)",
        "gm",
      )),
      (Os = function (e, t) {
        t = Cs[t];
        return "number" == typeof t ? n(t) : t;
      }),
      (Is = function (e, t, r) {
        r = ((t.charCodeAt(0) - 32) << 4) | (r.charCodeAt(0) - 48);
        return 59 == r ? e : n(r);
      }),
      (Cs["|"] = 254),
      {
        to_workbook: function (e, t) {
          return ta(Ds(e, t), t);
        },
        to_sheet: Ds,
        from_sheet: function (e, t) {
          var r,
            a,
            n = ["ID;PWXL;N;E"],
            s = [],
            i = Zr(e["!ref"]),
            o = Array.isArray(e),
            c = "\r\n";
          n.push("P;PGeneral"),
            n.push("F;P0;DG0G8;M255"),
            e["!cols"] &&
              ((r = n),
              e["!cols"].forEach(function (e, t) {
                t = "F;W" + (t + 1) + " " + (t + 1) + " ";
                e.hidden
                  ? (t += "0")
                  : ("number" != typeof e.width ||
                      e.wpx ||
                      (e.wpx = so(e.width)),
                    "number" != typeof e.wpx || e.wch || (e.wch = io(e.wpx)),
                    "number" == typeof e.wch && (t += Math.round(e.wch))),
                  " " != t.charAt(t.length - 1) && r.push(t);
              })),
            e["!rows"] &&
              ((a = n),
              e["!rows"].forEach(function (e, t) {
                var r = "F;";
                e.hidden
                  ? (r += "M0;")
                  : e.hpt
                  ? (r += "M" + 20 * e.hpt + ";")
                  : e.hpx && (r += "M" + 20 * uo(e.hpx) + ";"),
                  2 < r.length && a.push(r + "R" + (t + 1));
              })),
            n.push(
              "B;Y" +
                (i.e.r - i.s.r + 1) +
                ";X" +
                (i.e.c - i.s.c + 1) +
                ";D" +
                [i.s.c, i.s.r, i.e.c, i.e.r].join(" "),
            );
          for (var l = i.s.r; l <= i.e.r; ++l)
            for (var f = i.s.c; f <= i.e.c; ++f) {
              var h = Kr({ r: l, c: f });
              (h = o ? (e[l] || [])[f] : e[h]) &&
                (null != h.v || (h.f && !h.F)) &&
                s.push(
                  (function (e, t, r) {
                    var a = "C;Y" + (t + 1) + ";X" + (r + 1) + ";K";
                    switch (e.t) {
                      case "n":
                        (a += e.v || 0),
                          e.f && !e.F && (a += ";E" + fc(e.f, { r: t, c: r }));
                        break;
                      case "b":
                        a += e.v ? "TRUE" : "FALSE";
                        break;
                      case "e":
                        a += e.w || e.v;
                        break;
                      case "d":
                        a += '"' + (e.w || e.v) + '"';
                        break;
                      case "s":
                        a +=
                          '"' + e.v.replace(/"/g, "").replace(/;/g, ";;") + '"';
                    }
                    return a;
                  })(h, l, f),
                );
            }
          return n.join(c) + c + s.join(c) + c + "E" + c;
        },
      });
  function Fs(e, t) {
    var r,
      a,
      n = e.split(/[\n\r]+/),
      s = -1,
      i = -1,
      o = 0,
      c = 0,
      l = [],
      f = [],
      h = null,
      e = {},
      u = [],
      d = [],
      p = 0;
    for (0 <= +t.codepage && ie(+t.codepage); o !== n.length; ++o) {
      p = 0;
      var m,
        g = n[o]
          .trim()
          .replace(/\x1B([\x20-\x2F])([\x30-\x3F])/g, Is)
          .replace(Rs, Os),
        b = g
          .replace(/;;/g, "\0")
          .split(";")
          .map(function (e) {
            return e.replace(/\u0000/g, ";");
          }),
        v = b[0];
      if (0 < g.length)
        switch (v) {
          case "ID":
          case "E":
          case "B":
          case "O":
          case "W":
            break;
          case "P":
            "P" == b[1].charAt(0) && f.push(g.slice(3).replace(/;;/g, ";"));
            break;
          case "C":
            for (
              var w = !1, T = !1, E = !1, k = !1, y = -1, S = -1, c = 1;
              c < b.length;
              ++c
            )
              switch (b[c].charAt(0)) {
                case "A":
                  break;
                case "X":
                  (i = parseInt(b[c].slice(1)) - 1), (T = !0);
                  break;
                case "Y":
                  for (
                    s = parseInt(b[c].slice(1)) - 1, T || (i = 0), a = l.length;
                    a <= s;
                    ++a
                  )
                    l[a] = [];
                  break;
                case "K":
                  '"' === (m = b[c].slice(1)).charAt(0)
                    ? (m = m.slice(1, m.length - 1))
                    : "TRUE" === m
                    ? (m = !0)
                    : "FALSE" === m
                    ? (m = !1)
                    : isNaN(je(m))
                    ? isNaN(Xe(m).getDate()) || (m = He(m))
                    : ((m = je(m)), null !== h && q(h) && (m = Me(m))),
                    void 0 !== re &&
                      "string" == typeof m &&
                      "string" != (t || {}).type &&
                      (t || {}).codepage &&
                      (m = re.utils.decode(t.codepage, m)),
                    (w = !0);
                  break;
                case "E":
                  k = !0;
                  var _ = oc(b[c].slice(1), { r: s, c: i });
                  l[s][i] = [l[s][i], _];
                  break;
                case "S":
                  (E = !0), (l[s][i] = [l[s][i], "S5S"]);
                  break;
                case "G":
                  break;
                case "R":
                  y = parseInt(b[c].slice(1)) - 1;
                  break;
                case "C":
                  S = parseInt(b[c].slice(1)) - 1;
                  break;
                default:
                  if (t && t.WTF) throw new Error("SYLK bad record " + g);
              }
            if (
              (w &&
                (l[s][i] && 2 == l[s][i].length
                  ? (l[s][i][0] = m)
                  : (l[s][i] = m),
                (h = null)),
              E)
            ) {
              if (k)
                throw new Error("SYLK shared formula cannot have own formula");
              var x = -1 < y && l[y][S];
              if (!x || !x[1])
                throw new Error("SYLK shared formula cannot find base");
              l[s][i][1] = hc(x[1], { r: s - y, c: i - S });
            }
            break;
          case "F":
            var A = 0;
            for (c = 1; c < b.length; ++c)
              switch (b[c].charAt(0)) {
                case "X":
                  (i = parseInt(b[c].slice(1)) - 1), ++A;
                  break;
                case "Y":
                  for (
                    s = parseInt(b[c].slice(1)) - 1, a = l.length;
                    a <= s;
                    ++a
                  )
                    l[a] = [];
                  break;
                case "M":
                  p = parseInt(b[c].slice(1)) / 20;
                  break;
                case "F":
                case "G":
                  break;
                case "P":
                  h = f[parseInt(b[c].slice(1))];
                  break;
                case "S":
                case "D":
                case "N":
                  break;
                case "W":
                  for (
                    r = b[c].slice(1).split(" "), a = parseInt(r[0], 10);
                    a <= parseInt(r[1], 10);
                    ++a
                  )
                    (p = parseInt(r[2], 10)),
                      (d[a - 1] = 0 === p ? { hidden: !0 } : { wch: p }),
                      fo(d[a - 1]);
                  break;
                case "C":
                  d[(i = parseInt(b[c].slice(1)) - 1)] || (d[i] = {});
                  break;
                case "R":
                  u[(s = parseInt(b[c].slice(1)) - 1)] || (u[s] = {}),
                    0 < p
                      ? ((u[s].hpt = p), (u[s].hpx = po(p)))
                      : 0 === p && (u[s].hidden = !0);
                  break;
                default:
                  if (t && t.WTF) throw new Error("SYLK bad record " + g);
              }
            A < 1 && (h = null);
            break;
          default:
            if (t && t.WTF) throw new Error("SYLK bad record " + g);
        }
    }
    return (
      0 < u.length && (e["!rows"] = u),
      0 < d.length && (e["!cols"] = d),
      [(l = t && t.sheetRows ? l.slice(0, t.sheetRows) : l), e]
    );
  }
  function Ds(e, t) {
    var r = (function (e, t) {
        switch (t.type) {
          case "base64":
            return Fs(te(e), t);
          case "binary":
            return Fs(e, t);
          case "buffer":
            return Fs(
              se && Buffer.isBuffer(e) ? e.toString("binary") : i(e),
              t,
            );
          case "array":
            return Fs(ze(e), t);
        }
        throw new Error("Unrecognized type " + t.type);
      })(e, t),
      e = r[0],
      a = r[1],
      n = aa(e, t);
    return (
      Re(a).forEach(function (e) {
        n[e] = a[e];
      }),
      n
    );
  }
  var Ps = {
    to_workbook: function (e, t) {
      return ta(Ms(e, t), t);
    },
    to_sheet: Ms,
    from_sheet: function (e) {
      var t = [],
        r = Zr(e["!ref"]),
        a = Array.isArray(e);
      Us(t, "TABLE", 0, 1, "sheetjs"),
        Us(t, "VECTORS", 0, r.e.r - r.s.r + 1, ""),
        Us(t, "TUPLES", 0, r.e.c - r.s.c + 1, ""),
        Us(t, "DATA", 0, 0, "");
      for (var n = r.s.r; n <= r.e.r; ++n) {
        Bs(t, -1, 0, "BOT");
        for (var s = r.s.c; s <= r.e.c; ++s) {
          var i,
            o = Kr({ r: n, c: s });
          if ((i = a ? (e[n] || [])[s] : e[o]))
            switch (i.t) {
              case "n":
                var c = d ? i.w : i.v;
                null == (c = !c && null != i.v ? i.v : c)
                  ? d && i.f && !i.F
                    ? Bs(t, 1, 0, "=" + i.f)
                    : Bs(t, 1, 0, "")
                  : Bs(t, 0, c, "V");
                break;
              case "b":
                Bs(t, 0, i.v ? 1 : 0, i.v ? "TRUE" : "FALSE");
                break;
              case "s":
                Bs(t, 1, 0, !d || isNaN(i.v) ? i.v : '="' + i.v + '"');
                break;
              case "d":
                i.w || (i.w = ve(i.z || me[14], De(He(i.v)))),
                  d ? Bs(t, 0, i.w, "V") : Bs(t, 1, 0, i.w);
                break;
              default:
                Bs(t, 1, 0, "");
            }
          else Bs(t, 1, 0, "");
        }
      }
      Bs(t, -1, 0, "EOD");
      return t.join("\r\n");
    },
  };
  function Ls(e, t) {
    for (
      var r = e.split("\n"), a = -1, n = -1, s = 0, i = [];
      s !== r.length;
      ++s
    )
      if ("BOT" !== r[s].trim()) {
        if (!(a < 0)) {
          for (
            var o = r[s].trim().split(","),
              c = o[0],
              l = o[1],
              f = r[++s] || "";
            1 & (f.match(/["]/g) || []).length && s < r.length - 1;

          )
            f += "\n" + r[++s];
          switch (((f = f.trim()), +c)) {
            case -1:
              if ("BOT" === f) {
                (i[++a] = []), (n = 0);
                continue;
              }
              if ("EOD" !== f)
                throw new Error("Unrecognized DIF special command " + f);
              break;
            case 0:
              "TRUE" === f
                ? (i[a][n] = !0)
                : "FALSE" === f
                ? (i[a][n] = !1)
                : isNaN(je(l))
                ? isNaN(Xe(l).getDate())
                  ? (i[a][n] = l)
                  : (i[a][n] = He(l))
                : (i[a][n] = je(l)),
                ++n;
              break;
            case 1:
              (f = (f = f.slice(1, f.length - 1)).replace(/""/g, '"')),
                d && f && f.match(/^=".*"$/) && (f = f.slice(2, -1)),
                (i[a][n++] = "" !== f ? f : null);
          }
          if ("EOD" === f) break;
        }
      } else (i[++a] = []), (n = 0);
    return (i = t && t.sheetRows ? i.slice(0, t.sheetRows) : i);
  }
  function Ms(e, t) {
    return aa(
      (function (e, t) {
        switch (t.type) {
          case "base64":
            return Ls(te(e), t);
          case "binary":
            return Ls(e, t);
          case "buffer":
            return Ls(
              se && Buffer.isBuffer(e) ? e.toString("binary") : i(e),
              t,
            );
          case "array":
            return Ls(ze(e), t);
        }
        throw new Error("Unrecognized type " + t.type);
      })(e, t),
      t,
    );
  }
  function Us(e, t, r, a, n) {
    e.push(t), e.push(r + "," + a), e.push('"' + n.replace(/"/g, '""') + '"');
  }
  function Bs(e, t, r, a) {
    e.push(t + "," + r), e.push(1 == t ? '"' + a.replace(/"/g, '""') + '"' : a);
  }
  var Ws,
    Hs,
    zs,
    Vs,
    Gs =
      ((Ws = [
        "socialcalc:version:1.5",
        "MIME-Version: 1.0",
        "Content-Type: multipart/mixed; boundary=SocialCalcSpreadsheetControlSave",
      ].join("\n")),
      (Hs =
        [
          "--SocialCalcSpreadsheetControlSave",
          "Content-type: text/plain; charset=UTF-8",
        ].join("\n") + "\n"),
      (zs = ["# SocialCalc Spreadsheet Control Save", "part:sheet"].join("\n")),
      (Vs = "--SocialCalcSpreadsheetControlSave--"),
      {
        to_workbook: function (e, t) {
          return ta($s(e, t), t);
        },
        to_sheet: $s,
        from_sheet: function (e) {
          return [
            Ws,
            Hs,
            zs,
            Hs,
            (function (e) {
              if (!e || !e["!ref"]) return "";
              for (
                var t,
                  r,
                  a = [],
                  n = [],
                  s = Jr(e["!ref"]),
                  i = Array.isArray(e),
                  o = s.s.r;
                o <= s.e.r;
                ++o
              )
                for (var c = s.s.c; c <= s.e.c; ++c)
                  if (
                    ((r = Kr({ r: o, c: c })),
                    (t = i ? (e[o] || [])[c] : e[r]) &&
                      null != t.v &&
                      "z" !== t.t)
                  ) {
                    switch (((n = ["cell", r, "t"]), t.t)) {
                      case "s":
                      case "str":
                        n.push(js(t.v));
                        break;
                      case "n":
                        t.f
                          ? ((n[2] = "vtf"),
                            (n[3] = "n"),
                            (n[4] = t.v),
                            (n[5] = js(t.f)))
                          : ((n[2] = "v"), (n[3] = t.v));
                        break;
                      case "b":
                        (n[2] = "vt" + (t.f ? "f" : "c")),
                          (n[3] = "nl"),
                          (n[4] = t.v ? "1" : "0"),
                          (n[5] = js(t.f || (t.v ? "TRUE" : "FALSE")));
                        break;
                      case "d":
                        var l = De(He(t.v));
                        (n[2] = "vtc"),
                          (n[3] = "nd"),
                          (n[4] = "" + l),
                          (n[5] = t.w || ve(t.z || me[14], l));
                        break;
                      case "e":
                        continue;
                    }
                    a.push(n.join(":"));
                  }
              return (
                a.push(
                  "sheet:c:" +
                    (s.e.c - s.s.c + 1) +
                    ":r:" +
                    (s.e.r - s.s.r + 1) +
                    ":tvf:1",
                ),
                a.push("valueformat:1:text-wiki"),
                a.join("\n")
              );
            })(e),
            Vs,
          ].join("\n");
        },
      });
  function js(e) {
    return e.replace(/\\/g, "\\b").replace(/:/g, "\\c").replace(/\n/g, "\\n");
  }
  function $s(e, t) {
    return aa(
      (function (e, t) {
        for (
          var r, a = e.split("\n"), n = -1, s = 0, i = [];
          s !== a.length;
          ++s
        ) {
          var o = a[s].trim().split(":");
          if ("cell" === o[0]) {
            var c = Yr(o[1]);
            if (i.length <= c.r)
              for (n = i.length; n <= c.r; ++n) i[n] || (i[n] = []);
            switch (((n = c.r), (r = c.c), o[2])) {
              case "t":
                i[n][r] = o[3]
                  .replace(/\\b/g, "\\")
                  .replace(/\\c/g, ":")
                  .replace(/\\n/g, "\n");
                break;
              case "v":
                i[n][r] = +o[3];
                break;
              case "vtf":
                var l = o[o.length - 1];
              case "vtc":
                "nl" === o[3] ? (i[n][r] = !!+o[4]) : (i[n][r] = +o[4]),
                  "vtf" == o[2] && (i[n][r] = [i[n][r], l]);
            }
          }
        }
        return (i = t && t.sheetRows ? i.slice(0, t.sheetRows) : i);
      })(e, t),
      t,
    );
  }
  var Xs,
    Ys,
    Ks =
      ((Xs = { 44: ",", 9: "\t", 59: ";", 124: "|" }),
      (Ys = { 44: 3, 9: 2, 59: 1, 124: 0 }),
      {
        to_workbook: function (e, t) {
          return ta(ei(e, t), t);
        },
        to_sheet: ei,
        from_sheet: function (e) {
          for (
            var t = [], r = Zr(e["!ref"]), a = Array.isArray(e), n = r.s.r;
            n <= r.e.r;
            ++n
          ) {
            for (var s = [], i = r.s.c; i <= r.e.c; ++i) {
              var o = Kr({ r: n, c: i });
              if ((o = a ? (e[n] || [])[i] : e[o]) && null != o.v) {
                for (
                  var c = (o.w || (ea(o), o.w) || "").slice(0, 10);
                  c.length < 10;

                )
                  c += " ";
                s.push(c + (0 === i ? " " : ""));
              } else s.push("          ");
            }
            t.push(s.join(""));
          }
          return t.join("\n");
        },
      });
  function Js(e, t, r, a, n) {
    n.raw
      ? (t[r][a] = e)
      : "" === e ||
        ("TRUE" === e
          ? (t[r][a] = !0)
          : "FALSE" === e
          ? (t[r][a] = !1)
          : isNaN(je(e))
          ? isNaN(Xe(e).getDate())
            ? (t[r][a] = e)
            : (t[r][a] = He(e))
          : (t[r][a] = je(e)));
  }
  function qs(e) {
    for (var t = {}, r = !1, a = 0, n = 0; a < e.length; ++a)
      34 == (n = e.charCodeAt(a))
        ? (r = !r)
        : !r && n in Xs && (t[n] = (t[n] || 0) + 1);
    for (a in ((n = []), t))
      Object.prototype.hasOwnProperty.call(t, a) && n.push([t[a], a]);
    if (!n.length)
      for (a in (t = Ys))
        Object.prototype.hasOwnProperty.call(t, a) && n.push([t[a], a]);
    return (
      n.sort(function (e, t) {
        return e[0] - t[0] || Ys[e[1]] - Ys[t[1]];
      }),
      Xs[n.pop()[1]] || 44
    );
  }
  function Zs(a, e) {
    var n = e || {},
      e = "";
    null != oe && null == n.dense && (n.dense = oe);
    var s = n.dense ? [] : {},
      i = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
    "sep=" == a.slice(0, 4)
      ? 13 == a.charCodeAt(5) && 10 == a.charCodeAt(6)
        ? ((e = a.charAt(4)), (a = a.slice(7)))
        : 13 == a.charCodeAt(5) || 10 == a.charCodeAt(5)
        ? ((e = a.charAt(4)), (a = a.slice(6)))
        : (e = qs(a.slice(0, 1024)))
      : (e = n && n.FS ? n.FS : qs(a.slice(0, 1024)));
    var o = 0,
      c = 0,
      l = 0,
      f = 0,
      h = 0,
      u = e.charCodeAt(0),
      t = !1,
      d = 0,
      p = a.charCodeAt(0);
    a = a.replace(/\r\n/gm, "\n");
    var m =
      null != n.dateNF
        ? ((e = (e = "number" == typeof (e = n.dateNF) ? me[e] : e).replace(
            ye,
            "(\\d+)",
          )),
          new RegExp("^" + e + "$"))
        : null;
    function r() {
      var e,
        t = a.slice(f, h),
        r = {};
      if (
        (0 ===
        (t =
          '"' == t.charAt(0) && '"' == t.charAt(t.length - 1)
            ? t.slice(1, -1).replace(/""/g, '"')
            : t).length
          ? (r.t = "z")
          : n.raw || 0 === t.trim().length
          ? ((r.t = "s"), (r.v = t))
          : 61 == t.charCodeAt(0)
          ? 34 == t.charCodeAt(1) && 34 == t.charCodeAt(t.length - 1)
            ? ((r.t = "s"), (r.v = t.slice(2, -1).replace(/""/g, '"')))
            : 1 != t.length
            ? ((r.t = "n"), (r.f = t.slice(1)))
            : ((r.t = "s"), (r.v = t))
          : "TRUE" == t
          ? ((r.t = "b"), (r.v = !0))
          : "FALSE" == t
          ? ((r.t = "b"), (r.v = !1))
          : isNaN((l = je(t)))
          ? !isNaN(Xe(t).getDate()) || (m && t.match(m))
            ? ((r.z = n.dateNF || me[14]),
              (e = 0),
              m &&
                t.match(m) &&
                ((t = (function (e, a) {
                  var n = -1,
                    s = -1,
                    i = -1,
                    o = -1,
                    c = -1,
                    l = -1;
                  (e.match(ye) || []).forEach(function (e, t) {
                    var r = parseInt(a[t + 1], 10);
                    switch (e.toLowerCase().charAt(0)) {
                      case "y":
                        n = r;
                        break;
                      case "d":
                        i = r;
                        break;
                      case "h":
                        o = r;
                        break;
                      case "s":
                        l = r;
                        break;
                      case "m":
                        0 <= o ? (c = r) : (s = r);
                    }
                  }),
                    0 <= l && -1 == c && 0 <= s && ((c = s), (s = -1));
                  var t =
                    ("" + (0 <= n ? n : new Date().getFullYear())).slice(-4) +
                    "-" +
                    ("00" + (1 <= s ? s : 1)).slice(-2) +
                    "-" +
                    ("00" + (1 <= i ? i : 1)).slice(-2);
                  return (
                    8 == (t = 7 == t.length ? "0" + t : t).length &&
                      (t = "20" + t),
                    (e =
                      ("00" + (0 <= o ? o : 0)).slice(-2) +
                      ":" +
                      ("00" + (0 <= c ? c : 0)).slice(-2) +
                      ":" +
                      ("00" + (0 <= l ? l : 0)).slice(-2)),
                    -1 == o && -1 == c && -1 == l
                      ? t
                      : -1 == n && -1 == s && -1 == i
                      ? e
                      : t + "T" + e
                  );
                })(n.dateNF, t.match(m) || [])),
                (e = 1)),
              n.cellDates
                ? ((r.t = "d"), (r.v = He(t, e)))
                : ((r.t = "n"), (r.v = De(He(t, e)))),
              !1 !== n.cellText &&
                (r.w = ve(r.z, r.v instanceof Date ? De(r.v) : r.v)),
              n.cellNF || delete r.z)
            : ((r.t = "s"), (r.v = t))
          : (!(r.t = "n") !== n.cellText && (r.w = t), (r.v = l)),
        "z" == r.t ||
          (n.dense
            ? (s[o] || (s[o] = []), (s[o][c] = r))
            : (s[Kr({ c: c, r: o })] = r)),
        (f = h + 1),
        (p = a.charCodeAt(f)),
        i.e.c < c && (i.e.c = c),
        i.e.r < o && (i.e.r = o),
        d != u)
      )
        return (c = 0), ++o, n.sheetRows && n.sheetRows <= o ? 1 : void 0;
      ++c;
    }
    e: for (; h < a.length; ++h)
      switch ((d = a.charCodeAt(h))) {
        case 34:
          34 === p && (t = !t);
          break;
        case u:
        case 10:
        case 13:
          if (!t && r()) break e;
      }
    return 0 < h - f && r(), (s["!ref"] = qr(i)), s;
  }
  function Qs(e, t) {
    return !t ||
      !t.PRN ||
      t.FS ||
      "sep=" == e.slice(0, 4) ||
      0 <= e.indexOf("\t") ||
      0 <= e.indexOf(",") ||
      0 <= e.indexOf(";")
      ? Zs(e, t)
      : aa(
          (function (e, t) {
            var r = t || {},
              a = [];
            if (!e || 0 === e.length) return a;
            for (
              var n = e.split(/[\r\n]/), s = n.length - 1;
              0 <= s && 0 === n[s].length;

            )
              --s;
            for (var i = 10, o = 0, c = 0; c <= s; ++c)
              -1 == (o = n[c].indexOf(" ")) ? (o = n[c].length) : o++,
                (i = Math.max(i, o));
            for (c = 0; c <= s; ++c) {
              a[c] = [];
              var l = 0;
              for (
                Js(n[c].slice(0, i).trim(), a, c, l, r), l = 1;
                l <= (n[c].length - i) / 10 + 1;
                ++l
              )
                Js(n[c].slice(i + 10 * (l - 1), i + 10 * l).trim(), a, c, l, r);
            }
            return (a = r.sheetRows ? a.slice(0, r.sheetRows) : a);
          })(e, t),
          t,
        );
  }
  function ei(e, t) {
    var r = "",
      a = "string" == t.type ? [0, 0, 0, 0] : $h(e, t);
    switch (t.type) {
      case "base64":
        r = te(e);
        break;
      case "binary":
        r = e;
        break;
      case "buffer":
        r =
          65001 == t.codepage
            ? e.toString("utf8")
            : t.codepage && void 0 !== re
            ? re.utils.decode(t.codepage, e)
            : se && Buffer.isBuffer(e)
            ? e.toString("binary")
            : i(e);
        break;
      case "array":
        r = ze(e);
        break;
      case "string":
        r = e;
        break;
      default:
        throw new Error("Unrecognized type " + t.type);
    }
    return (
      239 == a[0] && 187 == a[1] && 191 == a[2]
        ? (r = Mt(r.slice(3)))
        : "string" != t.type && "buffer" != t.type && 65001 == t.codepage
        ? (r = Mt(r))
        : "binary" == t.type &&
          void 0 !== re &&
          t.codepage &&
          (r = re.utils.decode(t.codepage, re.utils.encode(28591, r))),
      "socialcalc:version:" == r.slice(0, 19)
        ? Gs.to_sheet("string" == t.type ? r : Mt(r), t)
        : Qs(r, t)
    );
  }
  var ti,
    ri,
    ai,
    ni,
    si =
      ((ti = {
        51: ["FALSE", 0],
        52: ["TRUE", 0],
        70: ["LEN", 1],
        80: ["SUM", 69],
        81: ["AVERAGEA", 69],
        82: ["COUNTA", 69],
        83: ["MINA", 69],
        84: ["MAXA", 69],
        111: ["T", 1],
      }),
      (ri = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "+",
        "-",
        "*",
        "/",
        "^",
        "=",
        "<>",
        "<=",
        ">=",
        "<",
        ">",
        "",
        "",
        "",
        "",
        "&",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]),
      (ai = {
        0: { n: "BOF", f: Nn },
        1: { n: "EOF" },
        2: { n: "CALCMODE" },
        3: { n: "CALCORDER" },
        4: { n: "SPLIT" },
        5: { n: "SYNC" },
        6: {
          n: "RANGE",
          f: function (e, t, r) {
            var a = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };
            return (
              8 == t && r.qpro
                ? ((a.s.c = e.read_shift(1)),
                  e.l++,
                  (a.s.r = e.read_shift(2)),
                  (a.e.c = e.read_shift(1)),
                  e.l++,
                  (a.e.r = e.read_shift(2)))
                : ((a.s.c = e.read_shift(2)),
                  (a.s.r = e.read_shift(2)),
                  12 == t && r.qpro && (e.l += 2),
                  (a.e.c = e.read_shift(2)),
                  (a.e.r = e.read_shift(2)),
                  12 == t && r.qpro && (e.l += 2),
                  65535 == a.s.c && (a.s.c = a.e.c = a.s.r = a.e.r = 0)),
              a
            );
          },
        },
        7: { n: "WINDOW1" },
        8: { n: "COLW1" },
        9: { n: "WINTWO" },
        10: { n: "COLW2" },
        11: { n: "NAME" },
        12: { n: "BLANK" },
        13: {
          n: "INTEGER",
          f: function (e, t, r) {
            return ((r = ci(e, 0, r))[1].v = e.read_shift(2, "i")), r;
          },
        },
        14: {
          n: "NUMBER",
          f: function (e, t, r) {
            return ((r = ci(e, 0, r))[1].v = e.read_shift(8, "f")), r;
          },
        },
        15: { n: "LABEL", f: li },
        16: {
          n: "FORMULA",
          f: function (e, t, r) {
            var a = e.l + t;
            return (
              ((t = ci(e, 0, r))[1].v = e.read_shift(8, "f")),
              r.qpro
                ? (e.l = a)
                : ((a = e.read_shift(2)),
                  (function (e, t) {
                    Dr(e, 0);
                    for (
                      var r = [], a = 0, n = "", s = "", i = "", o = "";
                      e.l < e.length;

                    ) {
                      var c = e[e.l++];
                      switch (c) {
                        case 0:
                          r.push(e.read_shift(8, "f"));
                          break;
                        case 1:
                          (s = fi(t[0].c, e.read_shift(2), !0)),
                            (n = fi(t[0].r, e.read_shift(2), !1)),
                            r.push(s + n);
                          break;
                        case 2:
                          var l = fi(t[0].c, e.read_shift(2), !0),
                            f = fi(t[0].r, e.read_shift(2), !1);
                          (s = fi(t[0].c, e.read_shift(2), !0)),
                            (n = fi(t[0].r, e.read_shift(2), !1)),
                            r.push(l + f + ":" + s + n);
                          break;
                        case 3:
                          if (e.l < e.length)
                            return console.error("WK1 premature formula end");
                          break;
                        case 4:
                          r.push("(" + r.pop() + ")");
                          break;
                        case 5:
                          r.push(e.read_shift(2));
                          break;
                        case 6:
                          for (var h = ""; (c = e[e.l++]); )
                            h += String.fromCharCode(c);
                          r.push('"' + h.replace(/"/g, '""') + '"');
                          break;
                        case 8:
                          r.push("-" + r.pop());
                          break;
                        case 23:
                          r.push("+" + r.pop());
                          break;
                        case 22:
                          r.push("NOT(" + r.pop() + ")");
                          break;
                        case 20:
                        case 21:
                          (o = r.pop()),
                            (i = r.pop()),
                            r.push(
                              ["AND", "OR"][c - 20] + "(" + i + "," + o + ")",
                            );
                          break;
                        default:
                          if (c < 32 && ri[c])
                            (o = r.pop()), (i = r.pop()), r.push(i + ri[c] + o);
                          else {
                            if (!ti[c])
                              return c <= 7
                                ? console.error(
                                    "WK1 invalid opcode " + c.toString(16),
                                  )
                                : c <= 24
                                ? console.error(
                                    "WK1 unsupported op " + c.toString(16),
                                  )
                                : c <= 30
                                ? console.error(
                                    "WK1 invalid opcode " + c.toString(16),
                                  )
                                : c <= 115
                                ? console.error(
                                    "WK1 unsupported function opcode " +
                                      c.toString(16),
                                  )
                                : console.error(
                                    "WK1 unrecognized opcode " + c.toString(16),
                                  );
                            if (
                              (a = 69 == (a = ti[c][1]) ? e[e.l++] : a) >
                              r.length
                            )
                              return console.error(
                                "WK1 bad formula parse 0x" +
                                  c.toString(16) +
                                  ":|" +
                                  r.join("|") +
                                  "|",
                              );
                            f = r.slice(-a);
                            (r.length -= a),
                              r.push(ti[c][0] + "(" + f.join(",") + ")");
                          }
                      }
                    }
                    1 == r.length
                      ? (t[1].f = "" + r[0])
                      : console.error(
                          "WK1 bad formula parse |" + r.join("|") + "|",
                        );
                  })(e.slice(e.l, e.l + a), t),
                  (e.l += a)),
              t
            );
          },
        },
        24: { n: "TABLE" },
        25: { n: "ORANGE" },
        26: { n: "PRANGE" },
        27: { n: "SRANGE" },
        28: { n: "FRANGE" },
        29: { n: "KRANGE1" },
        32: { n: "HRANGE" },
        35: { n: "KRANGE2" },
        36: { n: "PROTEC" },
        37: { n: "FOOTER" },
        38: { n: "HEADER" },
        39: { n: "SETUP" },
        40: { n: "MARGINS" },
        41: { n: "LABELFMT" },
        42: { n: "TITLES" },
        43: { n: "SHEETJS" },
        45: { n: "GRAPH" },
        46: { n: "NGRAPH" },
        47: { n: "CALCCOUNT" },
        48: { n: "UNFORMATTED" },
        49: { n: "CURSORW12" },
        50: { n: "WINDOW" },
        51: { n: "STRING", f: li },
        55: { n: "PASSWORD" },
        56: { n: "LOCKED" },
        60: { n: "QUERY" },
        61: { n: "QUERYNAME" },
        62: { n: "PRINT" },
        63: { n: "PRINTNAME" },
        64: { n: "GRAPH2" },
        65: { n: "GRAPHNAME" },
        66: { n: "ZOOM" },
        67: { n: "SYMSPLIT" },
        68: { n: "NSROWS" },
        69: { n: "NSCOLS" },
        70: { n: "RULER" },
        71: { n: "NNAME" },
        72: { n: "ACOMM" },
        73: { n: "AMACRO" },
        74: { n: "PARSE" },
        102: { n: "PRANGES??" },
        103: { n: "RRANGES??" },
        104: { n: "FNAME??" },
        105: { n: "MRANGES??" },
        204: { n: "SHEETNAMECS", f: pi },
        222: {
          n: "SHEETNAMELP",
          f: function (e, t) {
            var r = e[e.l++];
            t - 1 < r && (r = t - 1);
            for (var a = ""; a.length < r; ) a += String.fromCharCode(e[e.l++]);
            return a;
          },
        },
        65535: { n: "" },
      }),
      (ni = {
        0: { n: "BOF" },
        1: { n: "EOF" },
        2: { n: "PASSWORD" },
        3: { n: "CALCSET" },
        4: { n: "WINDOWSET" },
        5: { n: "SHEETCELLPTR" },
        6: { n: "SHEETLAYOUT" },
        7: { n: "COLUMNWIDTH" },
        8: { n: "HIDDENCOLUMN" },
        9: { n: "USERRANGE" },
        10: { n: "SYSTEMRANGE" },
        11: { n: "ZEROFORCE" },
        12: { n: "SORTKEYDIR" },
        13: { n: "FILESEAL" },
        14: { n: "DATAFILLNUMS" },
        15: { n: "PRINTMAIN" },
        16: { n: "PRINTSTRING" },
        17: { n: "GRAPHMAIN" },
        18: { n: "GRAPHSTRING" },
        19: { n: "??" },
        20: { n: "ERRCELL" },
        21: { n: "NACELL" },
        22: {
          n: "LABEL16",
          f: function (e, t) {
            var r = hi(e);
            return (r[1].t = "s"), (r[1].v = e.read_shift(t - 4, "cstr")), r;
          },
        },
        23: { n: "NUMBER17", f: ui },
        24: {
          n: "NUMBER18",
          f: function (e, t) {
            var r = hi(e);
            r[1].v = e.read_shift(2);
            var a = r[1].v >> 1;
            if (1 & r[1].v)
              switch (7 & a) {
                case 0:
                  a = 5e3 * (a >> 3);
                  break;
                case 1:
                  a = 500 * (a >> 3);
                  break;
                case 2:
                  a = (a >> 3) / 20;
                  break;
                case 3:
                  a = (a >> 3) / 200;
                  break;
                case 4:
                  a = (a >> 3) / 2e3;
                  break;
                case 5:
                  a = (a >> 3) / 2e4;
                  break;
                case 6:
                  a = (a >> 3) / 16;
                  break;
                case 7:
                  a = (a >> 3) / 64;
              }
            return (r[1].v = a), r;
          },
        },
        25: {
          n: "FORMULA19",
          f: function (e, t) {
            var r = ui(e);
            return (e.l += t - 14), r;
          },
        },
        26: { n: "FORMULA1A" },
        27: {
          n: "XFORMAT",
          f: function (e, t) {
            for (var r = {}, a = e.l + t; e.l < a; ) {
              var n = e.read_shift(2);
              if (14e3 == n) {
                for (r[n] = [0, ""], r[n][0] = e.read_shift(2); e[e.l]; )
                  (r[n][1] += String.fromCharCode(e[e.l])), e.l++;
                e.l++;
              }
            }
            return r;
          },
        },
        28: { n: "DTLABELMISC" },
        29: { n: "DTLABELCELL" },
        30: { n: "GRAPHWINDOW" },
        31: { n: "CPA" },
        32: { n: "LPLAUTO" },
        33: { n: "QUERY" },
        34: { n: "HIDDENSHEET" },
        35: { n: "??" },
        37: {
          n: "NUMBER25",
          f: function (e, t) {
            var r = hi(e),
              e = e.read_shift(4);
            return (r[1].v = e >> 6), r;
          },
        },
        38: { n: "??" },
        39: { n: "NUMBER27", f: di },
        40: {
          n: "FORMULA28",
          f: function (e, t) {
            var r = di(e);
            return (e.l += t - 10), r;
          },
        },
        142: { n: "??" },
        147: { n: "??" },
        150: { n: "??" },
        151: { n: "??" },
        152: { n: "??" },
        153: { n: "??" },
        154: { n: "??" },
        155: { n: "??" },
        156: { n: "??" },
        163: { n: "??" },
        174: { n: "??" },
        175: { n: "??" },
        176: { n: "??" },
        177: { n: "??" },
        184: { n: "??" },
        185: { n: "??" },
        186: { n: "??" },
        187: { n: "??" },
        188: { n: "??" },
        195: { n: "??" },
        201: { n: "??" },
        204: { n: "SHEETNAMECS", f: pi },
        205: { n: "??" },
        206: { n: "??" },
        207: { n: "??" },
        208: { n: "??" },
        256: { n: "??" },
        259: { n: "??" },
        260: { n: "??" },
        261: { n: "??" },
        262: { n: "??" },
        263: { n: "??" },
        265: { n: "??" },
        266: { n: "??" },
        267: { n: "??" },
        268: { n: "??" },
        270: { n: "??" },
        271: { n: "??" },
        384: { n: "??" },
        389: { n: "??" },
        390: { n: "??" },
        393: { n: "??" },
        396: { n: "??" },
        512: { n: "??" },
        514: { n: "??" },
        513: { n: "??" },
        516: { n: "??" },
        517: { n: "??" },
        640: { n: "??" },
        641: { n: "??" },
        642: { n: "??" },
        643: { n: "??" },
        644: { n: "??" },
        645: { n: "??" },
        646: { n: "??" },
        647: { n: "??" },
        648: { n: "??" },
        658: { n: "??" },
        659: { n: "??" },
        660: { n: "??" },
        661: { n: "??" },
        662: { n: "??" },
        665: { n: "??" },
        666: { n: "??" },
        768: { n: "??" },
        772: { n: "??" },
        1537: {
          n: "SHEETINFOQP",
          f: function (e, t, r) {
            if (r.qpro && !(t < 21)) {
              r = e.read_shift(1);
              return (
                (e.l += 17),
                (e.l += 1),
                (e.l += 2),
                [r, e.read_shift(t - 21, "cstr")]
              );
            }
          },
        },
        1600: { n: "??" },
        1602: { n: "??" },
        1793: { n: "??" },
        1794: { n: "??" },
        1795: { n: "??" },
        1796: { n: "??" },
        1920: { n: "??" },
        2048: { n: "??" },
        2049: { n: "??" },
        2052: { n: "??" },
        2688: { n: "??" },
        10998: { n: "??" },
        12849: { n: "??" },
        28233: { n: "??" },
        28484: { n: "??" },
        65535: { n: "" },
      }),
      {
        sheet_to_wk1: function (e, t) {
          var r = t || {};
          if ((0 <= +r.codepage && ie(+r.codepage), "string" == r.type))
            throw new Error("Cannot write WK1 to JS string");
          var a = Ur(),
            n = Zr(e["!ref"]),
            s = Array.isArray(e),
            i = [];
          Lf(a, 0, ((t = 1030), (r = Lr(2)).write_shift(2, t), r)),
            Lf(
              a,
              6,
              ((t = n),
              (r = Lr(8)).write_shift(2, t.s.c),
              r.write_shift(2, t.s.r),
              r.write_shift(2, t.e.c),
              r.write_shift(2, t.e.r),
              r),
            );
          for (
            var o, c, l, f, h = Math.min(n.e.r, 8191), u = n.s.r;
            u <= h;
            ++u
          )
            for (var d = jr(u), p = n.s.c; p <= n.e.c; ++p) {
              u === n.s.r && (i[p] = Xr(p));
              var m = i[p] + d,
                m = s ? (e[u] || [])[p] : e[m];
              m &&
                "z" != m.t &&
                ("n" == m.t
                  ? (0 | m.v) == m.v && -32768 <= m.v && m.v <= 32767
                    ? Lf(
                        a,
                        13,
                        ((o = u),
                        (c = p),
                        (l = m.v),
                        (f = void 0),
                        (f = Lr(7)).write_shift(1, 255),
                        f.write_shift(2, c),
                        f.write_shift(2, o),
                        f.write_shift(2, l, "i"),
                        f),
                      )
                    : Lf(
                        a,
                        14,
                        ((c = u),
                        (o = p),
                        (l = m.v),
                        (f = void 0),
                        (f = Lr(13)).write_shift(1, 255),
                        f.write_shift(2, o),
                        f.write_shift(2, c),
                        f.write_shift(8, l, "f"),
                        f),
                      )
                  : Lf(
                      a,
                      15,
                      (function (e, t, r) {
                        var a = Lr(7 + r.length);
                        a.write_shift(1, 255),
                          a.write_shift(2, t),
                          a.write_shift(2, e),
                          a.write_shift(1, 39);
                        for (var n = 0; n < a.length; ++n) {
                          var s = r.charCodeAt(n);
                          a.write_shift(1, 128 <= s ? 95 : s);
                        }
                        return a.write_shift(1, 0), a;
                      })(u, p, ea(m).slice(0, 239)),
                    ));
            }
          return Lf(a, 1), a.end();
        },
        book_to_wk3: function (e, t) {
          if (
            (0 <= +(t = t || {}).codepage && ie(+t.codepage),
            "string" == t.type)
          )
            throw new Error("Cannot write WK3 to JS string");
          var r = Ur();
          Lf(
            r,
            0,
            (function (e) {
              var t = Lr(26);
              t.write_shift(2, 4096), t.write_shift(2, 4), t.write_shift(4, 0);
              for (
                var r = 0, a = 0, n = 0, s = 0;
                s < e.SheetNames.length;
                ++s
              ) {
                var i = e.SheetNames[s],
                  i = e.Sheets[i];
                i &&
                  i["!ref"] &&
                  (++n,
                  (i = Jr(i["!ref"])),
                  r < i.e.r && (r = i.e.r),
                  a < i.e.c && (a = i.e.c));
              }
              8191 < r && (r = 8191);
              return (
                t.write_shift(2, r),
                t.write_shift(1, n),
                t.write_shift(1, a),
                t.write_shift(2, 0),
                t.write_shift(2, 0),
                t.write_shift(1, 1),
                t.write_shift(1, 2),
                t.write_shift(4, 0),
                t.write_shift(4, 0),
                t
              );
            })(e),
          );
          for (var a = 0, n = 0; a < e.SheetNames.length; ++a)
            (e.Sheets[e.SheetNames[a]] || {})["!ref"] &&
              Lf(
                r,
                27,
                (function (e, t) {
                  var r = Lr(5 + e.length);
                  r.write_shift(2, 14e3), r.write_shift(2, t);
                  for (var a = 0; a < e.length; ++a) {
                    var n = e.charCodeAt(a);
                    r[r.l++] = 127 < n ? 95 : n;
                  }
                  return (r[r.l++] = 0), r;
                })(e.SheetNames[a], n++),
              );
          for (var s = 0, a = 0; a < e.SheetNames.length; ++a) {
            var i = e.Sheets[e.SheetNames[a]];
            if (i && i["!ref"]) {
              for (
                var o = Zr(i["!ref"]),
                  c = Array.isArray(i),
                  l = [],
                  f = Math.min(o.e.r, 8191),
                  h = o.s.r;
                h <= f;
                ++h
              )
                for (var u = jr(h), d = o.s.c; d <= o.e.c; ++d) {
                  h === o.s.r && (l[d] = Xr(d));
                  var p = l[d] + u,
                    p = c ? (i[h] || [])[d] : i[p];
                  p &&
                    "z" != p.t &&
                    ("n" == p.t
                      ? Lf(
                          r,
                          23,
                          (function (e, t, r, a) {
                            var n = Lr(14);
                            if (
                              (n.write_shift(2, e),
                              n.write_shift(1, r),
                              n.write_shift(1, t),
                              0 == a)
                            )
                              return (
                                n.write_shift(4, 0),
                                n.write_shift(4, 0),
                                n.write_shift(2, 65535),
                                n
                              );
                            var s = 0,
                              e = 0,
                              r = 0,
                              t = 0;
                            a < 0 && ((s = 1), (a = -a));
                            (e = 0 | Math.log2(a)),
                              (a /= Math.pow(2, e - 31)),
                              0 == (2147483648 & (t = a >>> 0)) &&
                                (++e, (t = (a /= 2) >>> 0));
                            return (
                              (a -= t),
                              (t |= 2147483648),
                              (t >>>= 0),
                              (a *= Math.pow(2, 32)),
                              (r = a >>> 0),
                              n.write_shift(4, r),
                              n.write_shift(4, t),
                              (e += 16383 + (s ? 32768 : 0)),
                              n.write_shift(2, e),
                              n
                            );
                          })(h, d, s, p.v),
                        )
                      : Lf(
                          r,
                          22,
                          (function (e, t, r, a) {
                            var n = Lr(6 + a.length);
                            n.write_shift(2, e),
                              n.write_shift(1, r),
                              n.write_shift(1, t),
                              n.write_shift(1, 39);
                            for (var s = 0; s < a.length; ++s) {
                              var i = a.charCodeAt(s);
                              n.write_shift(1, 128 <= i ? 95 : i);
                            }
                            return n.write_shift(1, 0), n;
                          })(h, d, s, ea(p).slice(0, 239)),
                        ));
                }
              ++s;
            }
          }
          return Lf(r, 1), r.end();
        },
        to_workbook: function (e, t) {
          switch (t.type) {
            case "base64":
              return oi(he(te(e)), t);
            case "binary":
              return oi(he(e), t);
            case "buffer":
            case "array":
              return oi(e, t);
          }
          throw "Unsupported type " + t.type;
        },
      });
  function ii(e, t, r) {
    if (e) {
      Dr(e, e.l || 0);
      for (var a = r.Enum || ai; e.l < e.length; ) {
        var n = e.read_shift(2),
          s = a[n] || a[65535],
          i = e.read_shift(2),
          o = e.l + i,
          i = s.f && s.f(e, i, r);
        if (((e.l = o), t(i, s, n))) return;
      }
    }
  }
  function oi(e, t) {
    if (!e) return e;
    var n = t || {};
    null != oe && null == n.dense && (n.dense = oe);
    var s = n.dense ? [] : {},
      i = "Sheet1",
      o = "",
      c = 0,
      l = {},
      f = [],
      a = [],
      h = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } },
      u = n.sheetRows || 0;
    if (
      0 == e[2] &&
      (8 == e[3] || 9 == e[3]) &&
      16 <= e.length &&
      5 == e[14] &&
      108 === e[15]
    )
      throw new Error("Unsupported Works 3 for Mac file");
    if (2 == e[2])
      (n.Enum = ai),
        ii(
          e,
          function (e, t, r) {
            switch (r) {
              case 0:
                4096 <= (n.vers = e) && (n.qpro = !0);
                break;
              case 6:
                h = e;
                break;
              case 204:
                e && (o = e);
                break;
              case 222:
                o = e;
                break;
              case 15:
              case 51:
                n.qpro || (e[1].v = e[1].v.slice(1));
              case 13:
              case 14:
              case 16:
                14 == r &&
                  112 == (112 & e[2]) &&
                  1 < (15 & e[2]) &&
                  (15 & e[2]) < 15 &&
                  ((e[1].z = n.dateNF || me[14]),
                  n.cellDates && ((e[1].t = "d"), (e[1].v = Me(e[1].v)))),
                  n.qpro &&
                    e[3] > c &&
                    ((s["!ref"] = qr(h)),
                    (l[i] = s),
                    f.push(i),
                    (s = n.dense ? [] : {}),
                    (h = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
                    (c = e[3]),
                    (i = o || "Sheet" + (c + 1)),
                    (o = ""));
                var a = n.dense ? (s[e[0].r] || [])[e[0].c] : s[Kr(e[0])];
                if (a) {
                  (a.t = e[1].t),
                    (a.v = e[1].v),
                    null != e[1].z && (a.z = e[1].z),
                    null != e[1].f && (a.f = e[1].f);
                  break;
                }
                n.dense
                  ? (s[e[0].r] || (s[e[0].r] = []), (s[e[0].r][e[0].c] = e[1]))
                  : (s[Kr(e[0])] = e[1]);
            }
          },
          n,
        );
    else {
      if (26 != e[2] && 14 != e[2])
        throw new Error("Unrecognized LOTUS BOF " + e[2]);
      (n.Enum = ni),
        14 == e[2] && ((n.qpro = !0), (e.l = 0)),
        ii(
          e,
          function (e, t, r) {
            switch (r) {
              case 204:
                i = e;
                break;
              case 22:
                e[1].v = e[1].v.slice(1);
              case 23:
              case 24:
              case 25:
              case 37:
              case 39:
              case 40:
                if (
                  (e[3] > c &&
                    ((s["!ref"] = qr(h)),
                    (l[i] = s),
                    f.push(i),
                    (s = n.dense ? [] : {}),
                    (h = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
                    (c = e[3]),
                    (i = "Sheet" + (c + 1))),
                  0 < u && e[0].r >= u)
                )
                  break;
                n.dense
                  ? (s[e[0].r] || (s[e[0].r] = []), (s[e[0].r][e[0].c] = e[1]))
                  : (s[Kr(e[0])] = e[1]),
                  h.e.c < e[0].c && (h.e.c = e[0].c),
                  h.e.r < e[0].r && (h.e.r = e[0].r);
                break;
              case 27:
                e[14e3] && (a[e[14e3][0]] = e[14e3][1]);
                break;
              case 1537:
                (a[e[0]] = e[1]), e[0] == c && (i = e[1]);
            }
          },
          n,
        );
    }
    if (((s["!ref"] = qr(h)), (l[o || i] = s), f.push(o || i), !a.length))
      return { SheetNames: f, Sheets: l };
    for (var r = {}, d = [], p = 0; p < a.length; ++p)
      l[f[p]]
        ? (d.push(a[p] || f[p]), (r[a[p]] = l[a[p]] || l[f[p]]))
        : (d.push(a[p]), (r[a[p]] = { "!ref": "A1" }));
    return { SheetNames: d, Sheets: r };
  }
  function ci(e, t, r) {
    var a = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0, 0];
    return (
      r.qpro && 20768 != r.vers
        ? ((a[0].c = e.read_shift(1)),
          (a[3] = e.read_shift(1)),
          (a[0].r = e.read_shift(2)),
          (e.l += 2))
        : ((a[2] = e.read_shift(1)),
          (a[0].c = e.read_shift(2)),
          (a[0].r = e.read_shift(2))),
      a
    );
  }
  function li(e, t, r) {
    var a = e.l + t,
      t = ci(e, 0, r);
    if (((t[1].t = "s"), 20768 != r.vers))
      return r.qpro && e.l++, (t[1].v = e.read_shift(a - e.l, "cstr")), t;
    e.l++;
    a = e.read_shift(1);
    return (t[1].v = e.read_shift(a, "utf8")), t;
  }
  function fi(e, t, r) {
    var a = 32768 & t;
    return (
      (a ? "" : "$") +
      (r ? Xr : jr)((t = (a ? e : 0) + (8192 <= (t &= -32769) ? t - 16384 : t)))
    );
  }
  function hi(e) {
    var t = [{ c: 0, r: 0 }, { t: "n", v: 0 }, 0];
    return (
      (t[0].r = e.read_shift(2)), (t[3] = e[e.l++]), (t[0].c = e[e.l++]), t
    );
  }
  function ui(e, t) {
    var r = hi(e),
      a = e.read_shift(4),
      n = e.read_shift(4);
    if (65535 == (s = e.read_shift(2)))
      return (
        0 === a && 3221225472 === n
          ? ((r[1].t = "e"), (r[1].v = 15))
          : 0 === a && 3489660928 === n
          ? ((r[1].t = "e"), (r[1].v = 42))
          : (r[1].v = 0),
        r
      );
    var e = 32768 & s,
      s = (32767 & s) - 16446;
    return (
      (r[1].v = (1 - 2 * e) * (n * Math.pow(2, 32 + s) + a * Math.pow(2, s))), r
    );
  }
  function di(e, t) {
    var r = hi(e),
      e = e.read_shift(8, "f");
    return (r[1].v = e), r;
  }
  function pi(e, t) {
    return 0 == e[e.l + t - 1] ? e.read_shift(t, "cstr") : "";
  }
  var mi,
    gi,
    bi,
    vi,
    wi =
      ((mi = Bt("t")),
      (gi = Bt("rPr")),
      (bi = /<(?:\w+:)?r>/g),
      (vi = /<\/(?:\w+:)?r>/),
      function (e) {
        return e
          .replace(bi, "")
          .split(vi)
          .map(Ti)
          .filter(function (e) {
            return e.v;
          });
      });
  function Ti(e) {
    var t = e.match(mi);
    if (!t) return { t: "s", v: "" };
    (t = { t: "s", v: wt(t[1]) }), (e = e.match(gi));
    return (
      e &&
        (t.s = (function (e) {
          var t = {},
            r = e.match(ft),
            a = 0,
            n = !1;
          if (r)
            for (; a != r.length; ++a) {
              var s = dt(r[a]);
              switch (s[0].replace(/\w*:/g, "")) {
                case "<condense":
                case "<extend":
                  break;
                case "<shadow":
                  if (!s.val) break;
                case "<shadow>":
                case "<shadow/>":
                  t.shadow = 1;
                  break;
                case "</shadow>":
                  break;
                case "<charset":
                  if ("1" == s.val) break;
                  t.cp = l[parseInt(s.val, 10)];
                  break;
                case "<outline":
                  if (!s.val) break;
                case "<outline>":
                case "<outline/>":
                  t.outline = 1;
                  break;
                case "</outline>":
                  break;
                case "<rFont":
                  t.name = s.val;
                  break;
                case "<sz":
                  t.sz = s.val;
                  break;
                case "<strike":
                  if (!s.val) break;
                case "<strike>":
                case "<strike/>":
                  t.strike = 1;
                  break;
                case "</strike>":
                  break;
                case "<u":
                  if (!s.val) break;
                  switch (s.val) {
                    case "double":
                      t.uval = "double";
                      break;
                    case "singleAccounting":
                      t.uval = "single-accounting";
                      break;
                    case "doubleAccounting":
                      t.uval = "double-accounting";
                  }
                case "<u>":
                case "<u/>":
                  t.u = 1;
                  break;
                case "</u>":
                  break;
                case "<b":
                  if ("0" == s.val) break;
                case "<b>":
                case "<b/>":
                  t.b = 1;
                  break;
                case "</b>":
                  break;
                case "<i":
                  if ("0" == s.val) break;
                case "<i>":
                case "<i/>":
                  t.i = 1;
                  break;
                case "</i>":
                  break;
                case "<color":
                  s.rgb && (t.color = s.rgb.slice(2, 8));
                  break;
                case "<color>":
                case "<color/>":
                case "</color>":
                  break;
                case "<family":
                  t.family = s.val;
                  break;
                case "<family>":
                case "<family/>":
                case "</family>":
                  break;
                case "<vertAlign":
                  t.valign = s.val;
                  break;
                case "<vertAlign>":
                case "<vertAlign/>":
                case "</vertAlign>":
                case "<scheme":
                  break;
                case "<scheme>":
                case "<scheme/>":
                case "</scheme>":
                  break;
                case "<extLst":
                case "<extLst>":
                case "</extLst>":
                  break;
                case "<ext":
                  n = !0;
                  break;
                case "</ext>":
                  n = !1;
                  break;
                default:
                  if (47 !== s[0].charCodeAt(1) && !n)
                    throw new Error("Unrecognized rich format " + s[0]);
              }
            }
          return t;
        })(e[1])),
      t
    );
  }
  var Ei,
    ki =
      ((Ei = /(\r\n|\n)/g),
      function (e) {
        return e.map(yi).join("");
      });
  function yi(e) {
    var t,
      r,
      a,
      n = [[], e.v, []];
    return e.v
      ? (e.s &&
          ((t = e.s),
          (r = n[0]),
          (a = n[2]),
          (e = []),
          t.u && e.push("text-decoration: underline;"),
          t.uval && e.push("text-underline-style:" + t.uval + ";"),
          t.sz && e.push("font-size:" + t.sz + "pt;"),
          t.outline && e.push("text-effect: outline;"),
          t.shadow && e.push("text-shadow: auto;"),
          r.push('<span style="' + e.join("") + '">'),
          t.b && (r.push("<b>"), a.push("</b>")),
          t.i && (r.push("<i>"), a.push("</i>")),
          t.strike && (r.push("<s>"), a.push("</s>")),
          "superscript" == (e = t.valign || "") || "super" == e
            ? (e = "sup")
            : "subscript" == e && (e = "sub"),
          "" != e && (r.push("<" + e + ">"), a.push("</" + e + ">")),
          a.push("</span>")),
        n[0].join("") + n[1].replace(Ei, "<br/>") + n[2].join(""))
      : "";
  }
  var Si = /<(?:\w+:)?t[^>]*>([^<]*)<\/(?:\w+:)?t>/g,
    _i = /<(?:\w+:)?r>/,
    xi = /<(?:\w+:)?rPh.*?>([\s\S]*?)<\/(?:\w+:)?rPh>/g;
  function Ai(e, t) {
    var r = !t || t.cellHTML,
      t = {};
    return e
      ? (e.match(/^\s*<(?:\w+:)?t[^>]*>/)
          ? ((t.t = wt(
              Mt(e.slice(e.indexOf(">") + 1).split(/<\/(?:\w+:)?t>/)[0] || ""),
            )),
            (t.r = Mt(e)),
            r && (t.h = _t(t.t)))
          : e.match(_i) &&
            ((t.r = Mt(e)),
            (t.t = wt(
              Mt((e.replace(xi, "").match(Si) || []).join("").replace(ft, "")),
            )),
            r && (t.h = ki(wi(t.r)))),
        t)
      : { t: "" };
  }
  var Ci = /<(?:\w+:)?sst([^>]*)>([\s\S]*)<\/(?:\w+:)?sst>/,
    Ri = /<(?:\w+:)?(?:si|sstItem)>/g,
    Oi = /<\/(?:\w+:)?(?:si|sstItem)>/;
  var Ii = /^\s|\s$|[\t\n\r]/;
  function Ni(e, t) {
    if (!t.bookSST) return "";
    var r = [ot];
    r[r.length] = Yt("sst", null, {
      xmlns: Qt[0],
      count: e.Count,
      uniqueCount: e.Unique,
    });
    for (var a, n, s = 0; s != e.length; ++s)
      null != e[s] &&
        ((n = "<si>"),
        (a = e[s]).r
          ? (n += a.r)
          : ((n += "<t"),
            a.t || (a.t = ""),
            a.t.match(Ii) && (n += ' xml:space="preserve"'),
            (n += ">" + kt(a.t) + "</t>")),
        (n += "</si>"),
        (r[r.length] = n));
    return (
      2 < r.length &&
        ((r[r.length] = "</sst>"), (r[1] = r[1].replace("/>", ">"))),
      r.join("")
    );
  }
  var Fi = function (e, t) {
    var r = !1;
    return (
      null == t && ((r = !0), (t = Lr(15 + 4 * e.t.length))),
      t.write_shift(1, 0),
      ia(e.t, t),
      r ? t.slice(0, t.l) : t
    );
  };
  function Di(e) {
    var t,
      r,
      a = Ur();
    Br(
      a,
      159,
      ((t = e),
      (r = r || Lr(8)).write_shift(4, t.Count),
      r.write_shift(4, t.Unique),
      r),
    );
    for (var n = 0; n < e.length; ++n) Br(a, 19, Fi(e[n]));
    return Br(a, 160), a.end();
  }
  function Pi(e) {
    if (void 0 !== re) return re.utils.encode(_, e);
    for (var t = [], r = e.split(""), a = 0; a < r.length; ++a)
      t[a] = r[a].charCodeAt(0);
    return t;
  }
  function Li(e, t) {
    var r = {};
    return (
      (r.Major = e.read_shift(2)),
      (r.Minor = e.read_shift(2)),
      4 <= t && (e.l += t - 4),
      r
    );
  }
  function Mi(e) {
    var t = [];
    e.l += 4;
    for (var r = e.read_shift(4); 0 < r--; )
      t.push(
        (function (e) {
          for (
            var t = e.read_shift(4),
              r = e.l + t - 4,
              t = {},
              a = e.read_shift(4),
              n = [];
            0 < a--;

          )
            n.push({ t: e.read_shift(4), v: e.read_shift(0, "lpp4") });
          if (((t.name = e.read_shift(0, "lpp4")), (t.comps = n), e.l != r))
            throw new Error("Bad DataSpaceMapEntry: " + e.l + " != " + r);
          return t;
        })(e),
      );
    return t;
  }
  function Ui(e) {
    var t,
      r,
      r =
        ((r = {}),
        (t = e).read_shift(4),
        (t.l += 4),
        (r.id = t.read_shift(0, "lpp4")),
        (r.name = t.read_shift(0, "lpp4")),
        (r.R = Li(t, 4)),
        (r.U = Li(t, 4)),
        (r.W = Li(t, 4)),
        r);
    if (
      ((r.ename = e.read_shift(0, "8lpp4")),
      (r.blksz = e.read_shift(4)),
      (r.cmode = e.read_shift(4)),
      4 != e.read_shift(4))
    )
      throw new Error("Bad !Primary record");
    return r;
  }
  function Bi(e, t) {
    var t = e.l + t,
      r = {};
    (r.Flags = 63 & e.read_shift(4)), (e.l += 4), (r.AlgID = e.read_shift(4));
    var a = !1;
    switch (r.AlgID) {
      case 26126:
      case 26127:
      case 26128:
        a = 36 == r.Flags;
        break;
      case 26625:
        a = 4 == r.Flags;
        break;
      case 0:
        a = 16 == r.Flags || 4 == r.Flags || 36 == r.Flags;
        break;
      default:
        throw "Unrecognized encryption algorithm: " + r.AlgID;
    }
    if (!a) throw new Error("Encryption Flags/AlgID mismatch");
    return (
      (r.AlgIDHash = e.read_shift(4)),
      (r.KeySize = e.read_shift(4)),
      (r.ProviderType = e.read_shift(4)),
      (e.l += 8),
      (r.CSPName = e.read_shift((t - e.l) >> 1, "utf16le")),
      (e.l = t),
      r
    );
  }
  function Wi(e, t) {
    var r = {},
      t = e.l + t;
    return (
      (e.l += 4),
      (r.Salt = e.slice(e.l, e.l + 16)),
      (e.l += 16),
      (r.Verifier = e.slice(e.l, e.l + 16)),
      (e.l += 16),
      e.read_shift(4),
      (r.VerifierHash = e.slice(e.l, t)),
      (e.l = t),
      r
    );
  }
  function Hi(e) {
    var t = Li(e);
    switch (t.Minor) {
      case 2:
        return [
          t.Minor,
          (function (e) {
            if (36 != (63 & e.read_shift(4)))
              throw new Error("EncryptionInfo mismatch");
            var t = e.read_shift(4),
              t = Bi(e, t),
              e = Wi(e, e.length - e.l);
            return { t: "Std", h: t, v: e };
          })(e),
        ];
      case 3:
        return [
          t.Minor,
          (function () {
            throw new Error("File is password-protected: ECMA-376 Extensible");
          })(),
        ];
      case 4:
        return [
          t.Minor,
          (function (e) {
            var r = [
              "saltSize",
              "blockSize",
              "keyBits",
              "hashSize",
              "cipherAlgorithm",
              "cipherChaining",
              "hashAlgorithm",
              "saltValue",
            ];
            e.l += 4;
            var e = e.read_shift(e.length - e.l, "utf8"),
              a = {};
            return (
              e.replace(ft, function (e) {
                var t = dt(e);
                switch (pt(t[0])) {
                  case "<?xml":
                    break;
                  case "<encryption":
                  case "</encryption>":
                    break;
                  case "<keyData":
                    r.forEach(function (e) {
                      a[e] = t[e];
                    });
                    break;
                  case "<dataIntegrity":
                    (a.encryptedHmacKey = t.encryptedHmacKey),
                      (a.encryptedHmacValue = t.encryptedHmacValue);
                    break;
                  case "<keyEncryptors>":
                  case "<keyEncryptors":
                    a.encs = [];
                    break;
                  case "</keyEncryptors>":
                    break;
                  case "<keyEncryptor":
                    a.uri = t.uri;
                    break;
                  case "</keyEncryptor>":
                    break;
                  case "<encryptedKey":
                    a.encs.push(t);
                    break;
                  default:
                    throw t[0];
                }
              }),
              a
            );
          })(e),
        ];
    }
    throw new Error("ECMA-376 Encrypted file unrecognized Version: " + t.Minor);
  }
  function zi(e) {
    var t,
      r = 0,
      a = Pi(e),
      n = a.length + 1,
      s = le(n);
    for (s[0] = a.length, t = 1; t != n; ++t) s[t] = a[t - 1];
    for (t = n - 1; 0 <= t; --t)
      r = ((0 == (16384 & r) ? 0 : 1) | ((r << 1) & 32767)) ^ s[t];
    return 52811 ^ r;
  }
  var Vi,
    Gi,
    ji,
    $i =
      ((Vi = [
        187, 255, 255, 186, 255, 255, 185, 128, 0, 190, 15, 0, 191, 15, 0,
      ]),
      (Gi = [
        57840, 7439, 52380, 33984, 4364, 3600, 61902, 12606, 6258, 57657, 54287,
        34041, 10252, 43370, 20163,
      ]),
      (ji = [
        44796, 19929, 39858, 10053, 20106, 40212, 10761, 31585, 63170, 64933,
        60267, 50935, 40399, 11199, 17763, 35526, 1453, 2906, 5812, 11624,
        23248, 885, 1770, 3540, 7080, 14160, 28320, 56640, 55369, 41139, 20807,
        41614, 21821, 43642, 17621, 28485, 56970, 44341, 19019, 38038, 14605,
        29210, 60195, 50791, 40175, 10751, 21502, 43004, 24537, 18387, 36774,
        3949, 7898, 15796, 31592, 63184, 47201, 24803, 49606, 37805, 14203,
        28406, 56812, 17824, 35648, 1697, 3394, 6788, 13576, 27152, 43601,
        17539, 35078, 557, 1114, 2228, 4456, 30388, 60776, 51953, 34243, 7079,
        14158, 28316, 14128, 28256, 56512, 43425, 17251, 34502, 7597, 13105,
        26210, 52420, 35241, 883, 1766, 3532, 4129, 8258, 16516, 33032, 4657,
        9314, 18628,
      ]),
      function (e) {
        for (
          var t,
            r,
            a = Pi(e),
            n = (function (e) {
              for (
                var t = Gi[e.length - 1], r = 104, a = e.length - 1;
                0 <= a;
                --a
              )
                for (var n = e[a], s = 0; 7 != s; ++s)
                  64 & n && (t ^= ji[r]), (n *= 2), --r;
              return t;
            })(a),
            s = a.length,
            i = le(16),
            o = 0;
          16 != o;
          ++o
        )
          i[o] = 0;
        for (
          1 == (1 & s) &&
          ((t = n >> 8),
          (i[s] = Xi(Vi[0], t)),
          --s,
          (t = 255 & n),
          (e = a[a.length - 1]),
          (i[s] = Xi(e, t)));
          0 < s;

        )
          (t = n >> 8),
            (i[--s] = Xi(a[s], t)),
            (t = 255 & n),
            (i[--s] = Xi(a[s], t));
        for (r = (s = 15) - a.length; 0 < r; )
          (t = n >> 8),
            (i[s] = Xi(Vi[r], t)),
            --r,
            (t = 255 & n),
            (i[--s] = Xi(a[s], t)),
            --s,
            --r;
        return i;
      });
  function Xi(e, t) {
    return 255 & (((t = e ^ t) / 2) | (128 * t));
  }
  var Yi = function (e) {
    var t = 0,
      r = $i(e);
    return function (e) {
      e = (function (e, t, r, a, n) {
        var s, i;
        for (n = n || t, a = a || $i(e), s = 0; s != t.length; ++s)
          (i = t[s]),
            (i = 255 & (((i ^= a[r]) >> 5) | (i << 3))),
            (n[s] = i),
            ++r;
        return [n, r, a];
      })("", e, t, r);
      return (t = e[1]), e[0];
    };
  };
  function Ki(e, t, r) {
    r = r || {};
    return (
      (r.Info = e.read_shift(2)),
      (e.l -= 2),
      1 === r.Info
        ? (r.Data = (function (e) {
            var t = {},
              r = (t.EncryptionVersionInfo = Li(e, 4));
            if (1 != r.Major || 1 != r.Minor)
              throw "unrecognized version code " + r.Major + " : " + r.Minor;
            return (
              (t.Salt = e.read_shift(16)),
              (t.EncryptedVerifier = e.read_shift(16)),
              (t.EncryptedVerifierHash = e.read_shift(16)),
              t
            );
          })(e))
        : (r.Data = (function (e, t) {
            var r = {},
              a = (r.EncryptionVersionInfo = Li(e, 4));
            if (((t -= 4), 2 != a.Minor))
              throw new Error("unrecognized minor version code: " + a.Minor);
            if (4 < a.Major || a.Major < 2)
              throw new Error("unrecognized major version code: " + a.Major);
            return (
              (r.Flags = e.read_shift(4)),
              (t -= 4),
              (a = e.read_shift(4)),
              (t -= 4),
              (r.EncryptionHeader = Bi(e, a)),
              (t -= a),
              (r.EncryptionVerifier = Wi(e, t)),
              r
            );
          })(e, t)),
      r
    );
  }
  var Ji = {
    to_workbook: function (e, t) {
      return ta(qi(e, t), t);
    },
    to_sheet: qi,
    from_sheet: function (e) {
      for (
        var t = ["{\\rtf1\\ansi"],
          r = Zr(e["!ref"]),
          a = Array.isArray(e),
          n = r.s.r;
        n <= r.e.r;
        ++n
      ) {
        t.push("\\trowd\\trautofit1");
        for (var s = r.s.c; s <= r.e.c; ++s) t.push("\\cellx" + (s + 1));
        for (t.push("\\pard\\intbl"), s = r.s.c; s <= r.e.c; ++s) {
          var i = Kr({ r: n, c: s });
          (i = a ? (e[n] || [])[s] : e[i]) &&
            (null != i.v || (i.f && !i.F)) &&
            (t.push(" " + (i.w || (ea(i), i.w))), t.push("\\cell"));
        }
        t.push("\\pard\\intbl\\row");
      }
      return t.join("") + "}";
    },
  };
  function qi(e, t) {
    switch (t.type) {
      case "base64":
        return Zi(te(e), t);
      case "binary":
        return Zi(e, t);
      case "buffer":
        return Zi(se && Buffer.isBuffer(e) ? e.toString("binary") : i(e), t);
      case "array":
        return Zi(ze(e), t);
    }
    throw new Error("Unrecognized type " + t.type);
  }
  function Zi(e, t) {
    var i = (t || {}).dense ? [] : {},
      e = e.match(/\\trowd.*?\\row\b/g);
    if (!e.length) throw new Error("RTF missing table");
    var o = { s: { c: 0, r: 0 }, e: { c: 0, r: e.length - 1 } };
    return (
      e.forEach(function (e, t) {
        Array.isArray(i) && (i[t] = []);
        for (var r, a = /\\\w+\b/g, n = 0, s = -1; (r = a.exec(e)); )
          "\\cell" === r[0] &&
            (++s,
            (r =
              " " == (r = e.slice(n, a.lastIndex - r[0].length))[0]
                ? r.slice(1)
                : r).length &&
              ((r = { v: r, t: "s" }),
              Array.isArray(i) ? (i[t][s] = r) : (i[Kr({ r: t, c: s })] = r))),
            (n = a.lastIndex);
        s > o.e.c && (o.e.c = s);
      }),
      (i["!ref"] = qr(o)),
      i
    );
  }
  function Qi(e) {
    for (var t = 0, r = 1; 3 != t; ++t)
      r = 256 * r + (255 < e[t] ? 255 : e[t] < 0 ? 0 : e[t]);
    return r.toString(16).toUpperCase().slice(1);
  }
  function eo(e, t) {
    if (0 === t) return e;
    e = (function (e) {
      var t = e[0] / 255,
        r = e[1] / 255,
        a = e[2] / 255,
        n = Math.max(t, r, a),
        s = Math.min(t, r, a),
        i = n - s;
      if (0 == i) return [0, 0, t];
      var o = 0,
        e = 0,
        e = i / (1 < (s = n + s) ? 2 - s : s);
      switch (n) {
        case t:
          o = ((r - a) / i + 6) % 6;
          break;
        case r:
          o = (a - t) / i + 2;
          break;
        case a:
          o = (t - r) / i + 4;
      }
      return [o / 6, e, s / 2];
    })(
      ((e = (e = e).slice("#" === e[0] ? 1 : 0).slice(0, 6)),
      [
        parseInt(e.slice(0, 2), 16),
        parseInt(e.slice(2, 4), 16),
        parseInt(e.slice(4, 6), 16),
      ]),
    );
    return (
      (e[2] = t < 0 ? e[2] * (1 + t) : 1 - (1 - e[2]) * (1 - t)),
      Qi(
        (function (e) {
          var t,
            r = e[0],
            a = e[1],
            e = e[2],
            n = 2 * a * (e < 0.5 ? e : 1 - e),
            s = [(e = e - n / 2), e, e],
            i = 6 * r;
          if (0 !== a)
            switch (0 | i) {
              case 0:
              case 6:
                (t = n * i), (s[0] += n), (s[1] += t);
                break;
              case 1:
                (t = n * (2 - i)), (s[0] += t), (s[1] += n);
                break;
              case 2:
                (t = n * (i - 2)), (s[1] += n), (s[2] += t);
                break;
              case 3:
                (t = n * (4 - i)), (s[1] += t), (s[2] += n);
                break;
              case 4:
                (t = n * (i - 4)), (s[2] += n), (s[0] += t);
                break;
              case 5:
                (t = n * (6 - i)), (s[2] += t), (s[0] += n);
            }
          for (var o = 0; 3 != o; ++o) s[o] = Math.round(255 * s[o]);
          return s;
        })(e),
      )
    );
  }
  var to = 6,
    ro = 15,
    ao = 1,
    no = to;
  function so(e) {
    return Math.floor((e + Math.round(128 / no) / 256) * no);
  }
  function io(e) {
    return Math.floor(((e - 5) / no) * 100 + 0.5) / 100;
  }
  function oo(e) {
    return Math.round(((e * no + 5) / no) * 256) / 256;
  }
  function co(e) {
    return oo(io(so(e)));
  }
  function lo(e) {
    var t = Math.abs(e - co(e)),
      r = no;
    if (0.005 < t)
      for (no = ao; no < ro; ++no)
        Math.abs(e - co(e)) <= t && ((t = Math.abs(e - co(e))), (r = no));
    no = r;
  }
  function fo(e) {
    e.width
      ? ((e.wpx = so(e.width)), (e.wch = io(e.wpx)), (e.MDW = no))
      : e.wpx
      ? ((e.wch = io(e.wpx)), (e.width = oo(e.wch)), (e.MDW = no))
      : "number" == typeof e.wch &&
        ((e.width = oo(e.wch)), (e.wpx = so(e.width)), (e.MDW = no)),
      e.customWidth && delete e.customWidth;
  }
  var ho = 96;
  function uo(e) {
    return (96 * e) / ho;
  }
  function po(e) {
    return (e * ho) / 96;
  }
  var mo = {
    None: "none",
    Solid: "solid",
    Gray50: "mediumGray",
    Gray75: "darkGray",
    Gray25: "lightGray",
    HorzStripe: "darkHorizontal",
    VertStripe: "darkVertical",
    ReverseDiagStripe: "darkDown",
    DiagStripe: "darkUp",
    DiagCross: "darkGrid",
    ThickDiagCross: "darkTrellis",
    ThinHorzStripe: "lightHorizontal",
    ThinVertStripe: "lightVertical",
    ThinReverseDiagStripe: "lightDown",
    ThinHorzCross: "lightGrid",
  };
  var go = ["numFmtId", "fillId", "fontId", "borderId", "xfId"],
    bo = [
      "applyAlignment",
      "applyBorder",
      "applyFill",
      "applyFont",
      "applyNumberFormat",
      "applyProtection",
      "pivotButton",
      "quotePrefix",
    ];
  var vo,
    wo,
    To,
    Eo,
    ko,
    yo,
    So =
      ((vo = /<(?:\w+:)?numFmts([^>]*)>[\S\s]*?<\/(?:\w+:)?numFmts>/),
      (wo = /<(?:\w+:)?cellXfs([^>]*)>[\S\s]*?<\/(?:\w+:)?cellXfs>/),
      (To = /<(?:\w+:)?fills([^>]*)>[\S\s]*?<\/(?:\w+:)?fills>/),
      (Eo = /<(?:\w+:)?fonts([^>]*)>[\S\s]*?<\/(?:\w+:)?fonts>/),
      (ko = /<(?:\w+:)?borders([^>]*)>[\S\s]*?<\/(?:\w+:)?borders>/),
      function (e, t, r) {
        var a,
          n,
          s,
          i,
          o,
          c = {};
        return (
          e &&
            ((a = (e = e
              .replace(/<!--([\s\S]*?)-->/gm, "")
              .replace(/<!DOCTYPE[^\[]*\[[^\]]*\]>/gm, "")).match(vo)) &&
              (function (e, t, r) {
                t.NumberFmt = [];
                for (var a = Re(me), n = 0; n < a.length; ++n)
                  t.NumberFmt[a[n]] = me[a[n]];
                var s = e[0].match(ft);
                if (s)
                  for (n = 0; n < s.length; ++n) {
                    var i = dt(s[n]);
                    switch (pt(i[0])) {
                      case "<numFmts":
                      case "</numFmts>":
                      case "<numFmts/>":
                      case "<numFmts>":
                        break;
                      case "<numFmt":
                        var o = wt(Mt(i.formatCode)),
                          c = parseInt(i.numFmtId, 10);
                        if (((t.NumberFmt[c] = o), 0 < c)) {
                          if (392 < c) {
                            for (
                              c = 392;
                              60 < c && null != t.NumberFmt[c];
                              --c
                            );
                            t.NumberFmt[c] = o;
                          }
                          we(o, c);
                        }
                        break;
                      case "</numFmt>":
                        break;
                      default:
                        if (r.WTF)
                          throw new Error(
                            "unrecognized " + i[0] + " in numFmts",
                          );
                    }
                  }
              })(a, c, r),
            (a = e.match(Eo)) &&
              (function (e, a, n, s) {
                a.Fonts = [];
                var i = {},
                  o = !1;
                (e[0].match(ft) || []).forEach(function (e) {
                  var t,
                    r = dt(e);
                  switch (pt(r[0])) {
                    case "<fonts":
                    case "<fonts>":
                    case "</fonts>":
                      break;
                    case "<font":
                    case "<font>":
                      break;
                    case "</font>":
                    case "<font/>":
                      a.Fonts.push(i), (i = {});
                      break;
                    case "<name":
                      r.val && (i.name = Mt(r.val));
                      break;
                    case "<name/>":
                    case "</name>":
                      break;
                    case "<b":
                      i.bold = r.val ? Rt(r.val) : 1;
                      break;
                    case "<b/>":
                      i.bold = 1;
                      break;
                    case "<i":
                      i.italic = r.val ? Rt(r.val) : 1;
                      break;
                    case "<i/>":
                      i.italic = 1;
                      break;
                    case "<u":
                      switch (r.val) {
                        case "none":
                          i.underline = 0;
                          break;
                        case "single":
                          i.underline = 1;
                          break;
                        case "double":
                          i.underline = 2;
                          break;
                        case "singleAccounting":
                          i.underline = 33;
                          break;
                        case "doubleAccounting":
                          i.underline = 34;
                      }
                      break;
                    case "<u/>":
                      i.underline = 1;
                      break;
                    case "<strike":
                      i.strike = r.val ? Rt(r.val) : 1;
                      break;
                    case "<strike/>":
                      i.strike = 1;
                      break;
                    case "<outline":
                      i.outline = r.val ? Rt(r.val) : 1;
                      break;
                    case "<outline/>":
                      i.outline = 1;
                      break;
                    case "<shadow":
                      i.shadow = r.val ? Rt(r.val) : 1;
                      break;
                    case "<shadow/>":
                      i.shadow = 1;
                      break;
                    case "<condense":
                      i.condense = r.val ? Rt(r.val) : 1;
                      break;
                    case "<condense/>":
                      i.condense = 1;
                      break;
                    case "<extend":
                      i.extend = r.val ? Rt(r.val) : 1;
                      break;
                    case "<extend/>":
                      i.extend = 1;
                      break;
                    case "<sz":
                      r.val && (i.sz = +r.val);
                      break;
                    case "<sz/>":
                    case "</sz>":
                      break;
                    case "<vertAlign":
                      r.val && (i.vertAlign = r.val);
                      break;
                    case "<vertAlign/>":
                    case "</vertAlign>":
                      break;
                    case "<family":
                      r.val && (i.family = parseInt(r.val, 10));
                      break;
                    case "<family/>":
                    case "</family>":
                      break;
                    case "<scheme":
                      r.val && (i.scheme = r.val);
                      break;
                    case "<scheme/>":
                    case "</scheme>":
                      break;
                    case "<charset":
                      if ("1" == r.val) break;
                      r.codepage = l[parseInt(r.val, 10)];
                      break;
                    case "<color":
                      i.color || (i.color = {}),
                        r.auto && (i.color.auto = Rt(r.auto)),
                        r.rgb
                          ? (i.color.rgb = r.rgb.slice(-6))
                          : r.indexed
                          ? ((i.color.index = parseInt(r.indexed, 10)),
                            (t = Ba[i.color.index]),
                            (t =
                              (t = 81 == i.color.index ? Ba[1] : t) || Ba[1]),
                            (i.color.rgb =
                              t[0].toString(16) +
                              t[1].toString(16) +
                              t[2].toString(16)))
                          : r.theme &&
                            ((i.color.theme = parseInt(r.theme, 10)),
                            r.tint && (i.color.tint = parseFloat(r.tint)),
                            r.theme &&
                              n.themeElements &&
                              n.themeElements.clrScheme &&
                              (i.color.rgb = eo(
                                n.themeElements.clrScheme[i.color.theme].rgb,
                                i.color.tint || 0,
                              )));
                      break;
                    case "<color/>":
                    case "</color>":
                      break;
                    case "<AlternateContent":
                      o = !0;
                      break;
                    case "</AlternateContent>":
                      o = !1;
                      break;
                    case "<extLst":
                    case "<extLst>":
                    case "</extLst>":
                      break;
                    case "<ext":
                      o = !0;
                      break;
                    case "</ext>":
                      o = !1;
                      break;
                    default:
                      if (s && s.WTF && !o)
                        throw new Error("unrecognized " + r[0] + " in fonts");
                  }
                });
              })(a, c, t, r),
            (a = e.match(To)) &&
              (function (e, r, a) {
                r.Fills = [];
                var n = {},
                  s = !1;
                (e[0].match(ft) || []).forEach(function (e) {
                  var t = dt(e);
                  switch (pt(t[0])) {
                    case "<fills":
                    case "<fills>":
                    case "</fills>":
                      break;
                    case "<fill>":
                    case "<fill":
                    case "<fill/>":
                      (n = {}), r.Fills.push(n);
                      break;
                    case "</fill>":
                    case "<gradientFill>":
                      break;
                    case "<gradientFill":
                    case "</gradientFill>":
                      r.Fills.push(n), (n = {});
                      break;
                    case "<patternFill":
                    case "<patternFill>":
                      t.patternType && (n.patternType = t.patternType);
                      break;
                    case "<patternFill/>":
                    case "</patternFill>":
                      break;
                    case "<bgColor":
                      n.bgColor || (n.bgColor = {}),
                        t.indexed &&
                          (n.bgColor.indexed = parseInt(t.indexed, 10)),
                        t.theme && (n.bgColor.theme = parseInt(t.theme, 10)),
                        t.tint && (n.bgColor.tint = parseFloat(t.tint)),
                        t.rgb && (n.bgColor.rgb = t.rgb.slice(-6));
                      break;
                    case "<bgColor/>":
                    case "</bgColor>":
                      break;
                    case "<fgColor":
                      n.fgColor || (n.fgColor = {}),
                        t.theme && (n.fgColor.theme = parseInt(t.theme, 10)),
                        t.tint && (n.fgColor.tint = parseFloat(t.tint)),
                        null != t.rgb && (n.fgColor.rgb = t.rgb.slice(-6));
                      break;
                    case "<fgColor/>":
                    case "</fgColor>":
                      break;
                    case "<stop":
                    case "<stop/>":
                    case "</stop>":
                      break;
                    case "<color":
                    case "<color/>":
                    case "</color>":
                      break;
                    case "<extLst":
                    case "<extLst>":
                    case "</extLst>":
                      break;
                    case "<ext":
                      s = !0;
                      break;
                    case "</ext>":
                      s = !1;
                      break;
                    default:
                      if (a && a.WTF && !s)
                        throw new Error("unrecognized " + t[0] + " in fills");
                  }
                });
              })(a, c, r),
            (a = e.match(ko)) &&
              (function (e, r, a) {
                r.Borders = [];
                var n = {},
                  s = !1;
                (e[0].match(ft) || []).forEach(function (e) {
                  var t = dt(e);
                  switch (pt(t[0])) {
                    case "<borders":
                    case "<borders>":
                    case "</borders>":
                      break;
                    case "<border":
                    case "<border>":
                    case "<border/>":
                      (n = {}),
                        t.diagonalUp && (n.diagonalUp = Rt(t.diagonalUp)),
                        t.diagonalDown && (n.diagonalDown = Rt(t.diagonalDown)),
                        r.Borders.push(n);
                      break;
                    case "</border>":
                    case "<left/>":
                      break;
                    case "<left":
                    case "<left>":
                    case "</left>":
                    case "<right/>":
                      break;
                    case "<right":
                    case "<right>":
                    case "</right>":
                    case "<top/>":
                      break;
                    case "<top":
                    case "<top>":
                    case "</top>":
                    case "<bottom/>":
                      break;
                    case "<bottom":
                    case "<bottom>":
                    case "</bottom>":
                      break;
                    case "<diagonal":
                    case "<diagonal>":
                    case "<diagonal/>":
                    case "</diagonal>":
                      break;
                    case "<horizontal":
                    case "<horizontal>":
                    case "<horizontal/>":
                    case "</horizontal>":
                      break;
                    case "<vertical":
                    case "<vertical>":
                    case "<vertical/>":
                    case "</vertical>":
                      break;
                    case "<start":
                    case "<start>":
                    case "<start/>":
                    case "</start>":
                      break;
                    case "<end":
                    case "<end>":
                    case "<end/>":
                    case "</end>":
                      break;
                    case "<color":
                    case "<color>":
                      break;
                    case "<color/>":
                    case "</color>":
                      break;
                    case "<extLst":
                    case "<extLst>":
                    case "</extLst>":
                      break;
                    case "<ext":
                      s = !0;
                      break;
                    case "</ext>":
                      s = !1;
                      break;
                    default:
                      if (a && a.WTF && !s)
                        throw new Error("unrecognized " + t[0] + " in borders");
                  }
                });
              })(a, c, r),
            (a = e.match(wo)) &&
              ((a = a),
              (s = r),
              (o = !((n = c).CellXf = [])),
              (a[0].match(ft) || []).forEach(function (e) {
                var t = dt(e),
                  r = 0;
                switch (pt(t[0])) {
                  case "<cellXfs":
                  case "<cellXfs>":
                  case "<cellXfs/>":
                  case "</cellXfs>":
                    break;
                  case "<xf":
                  case "<xf/>":
                    for (delete (i = t)[0], r = 0; r < go.length; ++r)
                      i[go[r]] && (i[go[r]] = parseInt(i[go[r]], 10));
                    for (r = 0; r < bo.length; ++r)
                      i[bo[r]] && (i[bo[r]] = Rt(i[bo[r]]));
                    if (n.NumberFmt && 392 < i.numFmtId)
                      for (r = 392; 60 < r; --r)
                        if (n.NumberFmt[i.numFmtId] == n.NumberFmt[r]) {
                          i.numFmtId = r;
                          break;
                        }
                    n.CellXf.push(i);
                    break;
                  case "</xf>":
                    break;
                  case "<alignment":
                  case "<alignment/>":
                    var a = {};
                    t.vertical && (a.vertical = t.vertical),
                      t.horizontal && (a.horizontal = t.horizontal),
                      null != t.textRotation &&
                        (a.textRotation = t.textRotation),
                      t.indent && (a.indent = t.indent),
                      t.wrapText && (a.wrapText = Rt(t.wrapText)),
                      (i.alignment = a);
                    break;
                  case "</alignment>":
                  case "<protection":
                    break;
                  case "</protection>":
                  case "<protection/>":
                    break;
                  case "<AlternateContent":
                    o = !0;
                    break;
                  case "</AlternateContent>":
                    o = !1;
                    break;
                  case "<extLst":
                  case "<extLst>":
                  case "</extLst>":
                    break;
                  case "<ext":
                    o = !0;
                    break;
                  case "</ext>":
                    o = !1;
                    break;
                  default:
                    if (s && s.WTF && !o)
                      throw new Error("unrecognized " + t[0] + " in cellXfs");
                }
              }))),
          c
        );
      });
  function _o(e, t) {
    if (void 0 !== yo) return yo.toXml();
    var r,
      a,
      n,
      s,
      i = [ot, Yt("styleSheet", null, { xmlns: Qt[0], "xmlns:vt": Zt.vt })];
    return (
      e.SSF &&
        null !=
          ((a = e.SSF),
          (n = ["<numFmts>"]),
          [
            [5, 8],
            [23, 26],
            [41, 44],
            [50, 392],
          ].forEach(function (e) {
            for (var t = e[0]; t <= e[1]; ++t)
              null != a[t] &&
                (n[n.length] = Yt("numFmt", null, {
                  numFmtId: t,
                  formatCode: kt(a[t]),
                }));
          }),
          (r =
            1 === n.length
              ? ""
              : ((n[n.length] = "</numFmts>"),
                (n[0] = Yt("numFmts", null, { count: n.length - 2 }).replace(
                  "/>",
                  ">",
                )),
                n.join("")))) &&
        (i[i.length] = r),
      (i[i.length] =
        '<fonts count="1"><font><sz val="12"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>'),
      (i[i.length] =
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'),
      (i[i.length] =
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'),
      (i[i.length] =
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'),
      (t = t.cellXfs),
      ((s = [])[s.length] = "<cellXfs/>"),
      t.forEach(function (e) {
        s[s.length] = Yt("xf", null, e);
      }),
      (s[s.length] = "</cellXfs>"),
      (r =
        2 === s.length
          ? ""
          : ((s[0] = Yt("cellXfs", null, { count: s.length - 2 }).replace(
              "/>",
              ">",
            )),
            s.join(""))) && (i[i.length] = r),
      (i[i.length] =
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'),
      (i[i.length] = '<dxfs count="0"/>'),
      (i[i.length] =
        '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4"/>'),
      2 < i.length &&
        ((i[i.length] = "</styleSheet>"), (i[1] = i[1].replace("/>", ">"))),
      i.join("")
    );
  }
  function xo(e, t) {
    var r;
    (t = t || Lr(153)).write_shift(2, 20 * e.sz),
      (r = e),
      (a = (a = t) || Lr(2)),
      (r =
        (r.italic ? 2 : 0) |
        (r.strike ? 8 : 0) |
        (r.outline ? 16 : 0) |
        (r.shadow ? 32 : 0) |
        (r.condense ? 64 : 0) |
        (r.extend ? 128 : 0)),
      a.write_shift(1, r),
      a.write_shift(1, 0),
      t.write_shift(2, e.bold ? 700 : 400);
    var a = 0;
    "superscript" == e.vertAlign
      ? (a = 1)
      : "subscript" == e.vertAlign && (a = 2),
      t.write_shift(2, a),
      t.write_shift(1, e.underline || 0),
      t.write_shift(1, e.family || 0),
      t.write_shift(1, e.charset || 0),
      t.write_shift(1, 0),
      Ca(e.color, t);
    a = 0;
    return (
      "major" == e.scheme && (a = 1),
      "minor" == e.scheme && (a = 2),
      t.write_shift(1, a),
      ia(e.name, t),
      t.length > t.l ? t.slice(0, t.l) : t
    );
  }
  var Ao,
    Co = [
      "none",
      "solid",
      "mediumGray",
      "darkGray",
      "lightGray",
      "darkHorizontal",
      "darkVertical",
      "darkDown",
      "darkUp",
      "darkGrid",
      "darkTrellis",
      "lightHorizontal",
      "lightVertical",
      "lightDown",
      "lightUp",
      "lightGrid",
      "lightTrellis",
      "gray125",
      "gray0625",
    ],
    Ro = Pr;
  function Oo(e, t) {
    t = t || Lr(84);
    e = (Ao = Ao || Ie(Co))[e.patternType];
    null == e && (e = 40), t.write_shift(4, e);
    var r = 0;
    if (40 != e)
      for (Ca({ auto: 1 }, t), Ca({ auto: 1 }, t); r < 12; ++r)
        t.write_shift(4, 0);
    else {
      for (; r < 4; ++r) t.write_shift(4, 0);
      for (; r < 12; ++r) t.write_shift(4, 0);
    }
    return t.length > t.l ? t.slice(0, t.l) : t;
  }
  function Io(e, t, r) {
    (r = r || Lr(16)).write_shift(2, t || 0),
      r.write_shift(2, e.numFmtId || 0),
      r.write_shift(2, 0),
      r.write_shift(2, 0),
      r.write_shift(2, 0),
      r.write_shift(1, 0),
      r.write_shift(1, 0);
    return (
      r.write_shift(1, 0),
      r.write_shift(1, 0),
      r.write_shift(1, 0),
      r.write_shift(1, 0),
      r
    );
  }
  function No(e, t) {
    return (
      (t = t || Lr(10)).write_shift(1, 0),
      t.write_shift(1, 0),
      t.write_shift(4, 0),
      t.write_shift(4, 0),
      t
    );
  }
  r = Pr;
  function Fo(s, i) {
    var r;
    i &&
      ((r = 0),
      [
        [5, 8],
        [23, 26],
        [41, 44],
        [50, 392],
      ].forEach(function (e) {
        for (var t = e[0]; t <= e[1]; ++t) null != i[t] && ++r;
      }),
      0 != r &&
        (Br(s, 615, na(r)),
        [
          [5, 8],
          [23, 26],
          [41, 44],
          [50, 392],
        ].forEach(function (e) {
          for (var t, r, a, n = e[0]; n <= e[1]; ++n)
            null != i[n] &&
              Br(
                s,
                44,
                ((t = n),
                (r = i[n]),
                (a = (a = void 0) || Lr(6 + 4 * r.length)).write_shift(2, t),
                ia(r, a),
                (r = a.length > a.l ? a.slice(0, a.l) : a),
                null == a.l && (a.l = a.length),
                r),
              );
        }),
        Br(s, 616)));
  }
  function Do(e) {
    var t;
    Br(e, 613, na(1)),
      Br(
        e,
        46,
        ((t = t || Lr(51)).write_shift(1, 0),
        No(0, t),
        No(0, t),
        No(0, t),
        No(0, t),
        No(0, t),
        t.length > t.l ? t.slice(0, t.l) : t),
      ),
      Br(e, 614);
  }
  function Po(e) {
    var t, r;
    Br(e, 619, na(1)),
      Br(
        e,
        48,
        ((t = { xfId: 0, builtinId: 0, name: "Normal" }),
        (r = r || Lr(52)).write_shift(4, t.xfId),
        r.write_shift(2, 1),
        r.write_shift(1, +t.builtinId),
        r.write_shift(1, 0),
        ba(t.name || "", r),
        r.length > r.l ? r.slice(0, r.l) : r),
      ),
      Br(e, 620);
  }
  function Lo(e) {
    var t, r, a, n;
    Br(
      e,
      508,
      ((t = 0),
      (r = "TableStyleMedium9"),
      (a = "PivotStyleMedium4"),
      (n = Lr(2052)).write_shift(4, t),
      ba(r, n),
      ba(a, n),
      n.length > n.l ? n.slice(0, n.l) : n),
    ),
      Br(e, 509);
  }
  function Mo(e, t) {
    var r,
      a = Ur();
    return (
      Br(a, 278),
      Fo(a, e.SSF),
      Br((e = a), 611, na(1)),
      Br(
        e,
        43,
        xo({
          sz: 12,
          color: { theme: 1 },
          name: "Calibri",
          family: 2,
          scheme: "minor",
        }),
      ),
      Br(e, 612),
      Br((e = a), 603, na(2)),
      Br(e, 45, Oo({ patternType: "none" })),
      Br(e, 45, Oo({ patternType: "gray125" })),
      Br(e, 604),
      Do(a),
      Br((e = a), 626, na(1)),
      Br(e, 47, Io({ numFmtId: 0, fontId: 0, fillId: 0, borderId: 0 }, 65535)),
      Br(e, 627),
      (r = a),
      (t = t.cellXfs),
      Br(r, 617, na(t.length)),
      t.forEach(function (e) {
        Br(r, 47, Io(e, 0));
      }),
      Br(r, 618),
      Po(a),
      Br((t = a), 505, na(0)),
      Br(t, 506),
      Lo(a),
      Br(a, 279),
      a.end()
    );
  }
  var Uo = [
    "</a:lt1>",
    "</a:dk1>",
    "</a:lt2>",
    "</a:dk2>",
    "</a:accent1>",
    "</a:accent2>",
    "</a:accent3>",
    "</a:accent4>",
    "</a:accent5>",
    "</a:accent6>",
    "</a:hlink>",
    "</a:folHlink>",
  ];
  function Bo(e, r, a) {
    r.themeElements.clrScheme = [];
    var n = {};
    (e[0].match(ft) || []).forEach(function (e) {
      var t = dt(e);
      switch (t[0]) {
        case "<a:clrScheme":
        case "</a:clrScheme>":
          break;
        case "<a:srgbClr":
          n.rgb = t.val;
          break;
        case "<a:sysClr":
          n.rgb = t.lastClr;
          break;
        case "<a:dk1>":
        case "</a:dk1>":
        case "<a:lt1>":
        case "</a:lt1>":
        case "<a:dk2>":
        case "</a:dk2>":
        case "<a:lt2>":
        case "</a:lt2>":
        case "<a:accent1>":
        case "</a:accent1>":
        case "<a:accent2>":
        case "</a:accent2>":
        case "<a:accent3>":
        case "</a:accent3>":
        case "<a:accent4>":
        case "</a:accent4>":
        case "<a:accent5>":
        case "</a:accent5>":
        case "<a:accent6>":
        case "</a:accent6>":
        case "<a:hlink>":
        case "</a:hlink>":
        case "<a:folHlink>":
        case "</a:folHlink>":
          "/" === t[0].charAt(1)
            ? ((r.themeElements.clrScheme[Uo.indexOf(t[0])] = n), (n = {}))
            : (n.name = t[0].slice(3, t[0].length - 1));
          break;
        default:
          if (a && a.WTF)
            throw new Error("Unrecognized " + t[0] + " in clrScheme");
      }
    });
  }
  function Wo() {}
  function Ho() {}
  var zo = /<a:clrScheme([^>]*)>[\s\S]*<\/a:clrScheme>/,
    Vo = /<a:fontScheme([^>]*)>[\s\S]*<\/a:fontScheme>/,
    Go = /<a:fmtScheme([^>]*)>[\s\S]*<\/a:fmtScheme>/;
  var jo = /<a:themeElements([^>]*)>[\s\S]*<\/a:themeElements>/;
  function $o(e, t) {
    var r,
      a,
      n,
      s,
      i,
      o = {};
    if (!(r = (e = !e || 0 === e.length ? Xo() : e).match(jo)))
      throw new Error("themeElements not found in theme");
    return (
      (a = r[0]),
      (s = t),
      ((n = o).themeElements = {}),
      [
        ["clrScheme", zo, Bo],
        ["fontScheme", Vo, Wo],
        ["fmtScheme", Go, Ho],
      ].forEach(function (e) {
        if (!(i = a.match(e[1])))
          throw new Error(e[0] + " not found in themeElements");
        e[2](i, n, s);
      }),
      (o.raw = e),
      o
    );
  }
  function Xo(e, t) {
    if (t && t.themeXLSX) return t.themeXLSX;
    if (e && "string" == typeof e.raw) return e.raw;
    e = [ot];
    return (
      (e[e.length] =
        '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">'),
      (e[e.length] = "<a:themeElements>"),
      (e[e.length] = '<a:clrScheme name="Office">'),
      (e[e.length] =
        '<a:dk1><a:sysClr val="windowText" lastClr="000000"/></a:dk1>'),
      (e[e.length] =
        '<a:lt1><a:sysClr val="window" lastClr="FFFFFF"/></a:lt1>'),
      (e[e.length] = '<a:dk2><a:srgbClr val="1F497D"/></a:dk2>'),
      (e[e.length] = '<a:lt2><a:srgbClr val="EEECE1"/></a:lt2>'),
      (e[e.length] = '<a:accent1><a:srgbClr val="4F81BD"/></a:accent1>'),
      (e[e.length] = '<a:accent2><a:srgbClr val="C0504D"/></a:accent2>'),
      (e[e.length] = '<a:accent3><a:srgbClr val="9BBB59"/></a:accent3>'),
      (e[e.length] = '<a:accent4><a:srgbClr val="8064A2"/></a:accent4>'),
      (e[e.length] = '<a:accent5><a:srgbClr val="4BACC6"/></a:accent5>'),
      (e[e.length] = '<a:accent6><a:srgbClr val="F79646"/></a:accent6>'),
      (e[e.length] = '<a:hlink><a:srgbClr val="0000FF"/></a:hlink>'),
      (e[e.length] = '<a:folHlink><a:srgbClr val="800080"/></a:folHlink>'),
      (e[e.length] = "</a:clrScheme>"),
      (e[e.length] = '<a:fontScheme name="Office">'),
      (e[e.length] = "<a:majorFont>"),
      (e[e.length] = '<a:latin typeface="Cambria"/>'),
      (e[e.length] = '<a:ea typeface=""/>'),
      (e[e.length] = '<a:cs typeface=""/>'),
      (e[e.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>'),
      (e[e.length] = '<a:font script="Hang" typeface="맑은 고딕"/>'),
      (e[e.length] = '<a:font script="Hans" typeface="宋体"/>'),
      (e[e.length] = '<a:font script="Hant" typeface="新細明體"/>'),
      (e[e.length] = '<a:font script="Arab" typeface="Times New Roman"/>'),
      (e[e.length] = '<a:font script="Hebr" typeface="Times New Roman"/>'),
      (e[e.length] = '<a:font script="Thai" typeface="Tahoma"/>'),
      (e[e.length] = '<a:font script="Ethi" typeface="Nyala"/>'),
      (e[e.length] = '<a:font script="Beng" typeface="Vrinda"/>'),
      (e[e.length] = '<a:font script="Gujr" typeface="Shruti"/>'),
      (e[e.length] = '<a:font script="Khmr" typeface="MoolBoran"/>'),
      (e[e.length] = '<a:font script="Knda" typeface="Tunga"/>'),
      (e[e.length] = '<a:font script="Guru" typeface="Raavi"/>'),
      (e[e.length] = '<a:font script="Cans" typeface="Euphemia"/>'),
      (e[e.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>'),
      (e[e.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>'),
      (e[e.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>'),
      (e[e.length] = '<a:font script="Thaa" typeface="MV Boli"/>'),
      (e[e.length] = '<a:font script="Deva" typeface="Mangal"/>'),
      (e[e.length] = '<a:font script="Telu" typeface="Gautami"/>'),
      (e[e.length] = '<a:font script="Taml" typeface="Latha"/>'),
      (e[e.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>'),
      (e[e.length] = '<a:font script="Orya" typeface="Kalinga"/>'),
      (e[e.length] = '<a:font script="Mlym" typeface="Kartika"/>'),
      (e[e.length] = '<a:font script="Laoo" typeface="DokChampa"/>'),
      (e[e.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>'),
      (e[e.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>'),
      (e[e.length] = '<a:font script="Viet" typeface="Times New Roman"/>'),
      (e[e.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>'),
      (e[e.length] = '<a:font script="Geor" typeface="Sylfaen"/>'),
      (e[e.length] = "</a:majorFont>"),
      (e[e.length] = "<a:minorFont>"),
      (e[e.length] = '<a:latin typeface="Calibri"/>'),
      (e[e.length] = '<a:ea typeface=""/>'),
      (e[e.length] = '<a:cs typeface=""/>'),
      (e[e.length] = '<a:font script="Jpan" typeface="ＭＳ Ｐゴシック"/>'),
      (e[e.length] = '<a:font script="Hang" typeface="맑은 고딕"/>'),
      (e[e.length] = '<a:font script="Hans" typeface="宋体"/>'),
      (e[e.length] = '<a:font script="Hant" typeface="新細明體"/>'),
      (e[e.length] = '<a:font script="Arab" typeface="Arial"/>'),
      (e[e.length] = '<a:font script="Hebr" typeface="Arial"/>'),
      (e[e.length] = '<a:font script="Thai" typeface="Tahoma"/>'),
      (e[e.length] = '<a:font script="Ethi" typeface="Nyala"/>'),
      (e[e.length] = '<a:font script="Beng" typeface="Vrinda"/>'),
      (e[e.length] = '<a:font script="Gujr" typeface="Shruti"/>'),
      (e[e.length] = '<a:font script="Khmr" typeface="DaunPenh"/>'),
      (e[e.length] = '<a:font script="Knda" typeface="Tunga"/>'),
      (e[e.length] = '<a:font script="Guru" typeface="Raavi"/>'),
      (e[e.length] = '<a:font script="Cans" typeface="Euphemia"/>'),
      (e[e.length] = '<a:font script="Cher" typeface="Plantagenet Cherokee"/>'),
      (e[e.length] = '<a:font script="Yiii" typeface="Microsoft Yi Baiti"/>'),
      (e[e.length] = '<a:font script="Tibt" typeface="Microsoft Himalaya"/>'),
      (e[e.length] = '<a:font script="Thaa" typeface="MV Boli"/>'),
      (e[e.length] = '<a:font script="Deva" typeface="Mangal"/>'),
      (e[e.length] = '<a:font script="Telu" typeface="Gautami"/>'),
      (e[e.length] = '<a:font script="Taml" typeface="Latha"/>'),
      (e[e.length] = '<a:font script="Syrc" typeface="Estrangelo Edessa"/>'),
      (e[e.length] = '<a:font script="Orya" typeface="Kalinga"/>'),
      (e[e.length] = '<a:font script="Mlym" typeface="Kartika"/>'),
      (e[e.length] = '<a:font script="Laoo" typeface="DokChampa"/>'),
      (e[e.length] = '<a:font script="Sinh" typeface="Iskoola Pota"/>'),
      (e[e.length] = '<a:font script="Mong" typeface="Mongolian Baiti"/>'),
      (e[e.length] = '<a:font script="Viet" typeface="Arial"/>'),
      (e[e.length] = '<a:font script="Uigh" typeface="Microsoft Uighur"/>'),
      (e[e.length] = '<a:font script="Geor" typeface="Sylfaen"/>'),
      (e[e.length] = "</a:minorFont>"),
      (e[e.length] = "</a:fontScheme>"),
      (e[e.length] = '<a:fmtScheme name="Office">'),
      (e[e.length] = "<a:fillStyleLst>"),
      (e[e.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'),
      (e[e.length] = '<a:gradFill rotWithShape="1">'),
      (e[e.length] = "<a:gsLst>"),
      (e[e.length] =
        '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="50000"/><a:satMod val="300000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="35000"><a:schemeClr val="phClr"><a:tint val="37000"/><a:satMod val="300000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="15000"/><a:satMod val="350000"/></a:schemeClr></a:gs>'),
      (e[e.length] = "</a:gsLst>"),
      (e[e.length] = '<a:lin ang="16200000" scaled="1"/>'),
      (e[e.length] = "</a:gradFill>"),
      (e[e.length] = '<a:gradFill rotWithShape="1">'),
      (e[e.length] = "<a:gsLst>"),
      (e[e.length] =
        '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="100000"/><a:shade val="100000"/><a:satMod val="130000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="100000"><a:schemeClr val="phClr"><a:tint val="50000"/><a:shade val="100000"/><a:satMod val="350000"/></a:schemeClr></a:gs>'),
      (e[e.length] = "</a:gsLst>"),
      (e[e.length] = '<a:lin ang="16200000" scaled="0"/>'),
      (e[e.length] = "</a:gradFill>"),
      (e[e.length] = "</a:fillStyleLst>"),
      (e[e.length] = "<a:lnStyleLst>"),
      (e[e.length] =
        '<a:ln w="9525" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"><a:shade val="95000"/><a:satMod val="105000"/></a:schemeClr></a:solidFill><a:prstDash val="solid"/></a:ln>'),
      (e[e.length] =
        '<a:ln w="25400" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'),
      (e[e.length] =
        '<a:ln w="38100" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln>'),
      (e[e.length] = "</a:lnStyleLst>"),
      (e[e.length] = "<a:effectStyleLst>"),
      (e[e.length] = "<a:effectStyle>"),
      (e[e.length] = "<a:effectLst>"),
      (e[e.length] =
        '<a:outerShdw blurRad="40000" dist="20000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="38000"/></a:srgbClr></a:outerShdw>'),
      (e[e.length] = "</a:effectLst>"),
      (e[e.length] = "</a:effectStyle>"),
      (e[e.length] = "<a:effectStyle>"),
      (e[e.length] = "<a:effectLst>"),
      (e[e.length] =
        '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>'),
      (e[e.length] = "</a:effectLst>"),
      (e[e.length] = "</a:effectStyle>"),
      (e[e.length] = "<a:effectStyle>"),
      (e[e.length] = "<a:effectLst>"),
      (e[e.length] =
        '<a:outerShdw blurRad="40000" dist="23000" dir="5400000" rotWithShape="0"><a:srgbClr val="000000"><a:alpha val="35000"/></a:srgbClr></a:outerShdw>'),
      (e[e.length] = "</a:effectLst>"),
      (e[e.length] =
        '<a:scene3d><a:camera prst="orthographicFront"><a:rot lat="0" lon="0" rev="0"/></a:camera><a:lightRig rig="threePt" dir="t"><a:rot lat="0" lon="0" rev="1200000"/></a:lightRig></a:scene3d>'),
      (e[e.length] = '<a:sp3d><a:bevelT w="63500" h="25400"/></a:sp3d>'),
      (e[e.length] = "</a:effectStyle>"),
      (e[e.length] = "</a:effectStyleLst>"),
      (e[e.length] = "<a:bgFillStyleLst>"),
      (e[e.length] = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'),
      (e[e.length] = '<a:gradFill rotWithShape="1">'),
      (e[e.length] = "<a:gsLst>"),
      (e[e.length] =
        '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="40000"/><a:satMod val="350000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="40000"><a:schemeClr val="phClr"><a:tint val="45000"/><a:shade val="99000"/><a:satMod val="350000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="20000"/><a:satMod val="255000"/></a:schemeClr></a:gs>'),
      (e[e.length] = "</a:gsLst>"),
      (e[e.length] =
        '<a:path path="circle"><a:fillToRect l="50000" t="-80000" r="50000" b="180000"/></a:path>'),
      (e[e.length] = "</a:gradFill>"),
      (e[e.length] = '<a:gradFill rotWithShape="1">'),
      (e[e.length] = "<a:gsLst>"),
      (e[e.length] =
        '<a:gs pos="0"><a:schemeClr val="phClr"><a:tint val="80000"/><a:satMod val="300000"/></a:schemeClr></a:gs>'),
      (e[e.length] =
        '<a:gs pos="100000"><a:schemeClr val="phClr"><a:shade val="30000"/><a:satMod val="200000"/></a:schemeClr></a:gs>'),
      (e[e.length] = "</a:gsLst>"),
      (e[e.length] =
        '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>'),
      (e[e.length] = "</a:gradFill>"),
      (e[e.length] = "</a:bgFillStyleLst>"),
      (e[e.length] = "</a:fmtScheme>"),
      (e[e.length] = "</a:themeElements>"),
      (e[e.length] = "<a:objectDefaults>"),
      (e[e.length] = "<a:spDef>"),
      (e[e.length] =
        '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="1"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="3"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="2"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="lt1"/></a:fontRef></a:style>'),
      (e[e.length] = "</a:spDef>"),
      (e[e.length] = "<a:lnDef>"),
      (e[e.length] =
        '<a:spPr/><a:bodyPr/><a:lstStyle/><a:style><a:lnRef idx="2"><a:schemeClr val="accent1"/></a:lnRef><a:fillRef idx="0"><a:schemeClr val="accent1"/></a:fillRef><a:effectRef idx="1"><a:schemeClr val="accent1"/></a:effectRef><a:fontRef idx="minor"><a:schemeClr val="tx1"/></a:fontRef></a:style>'),
      (e[e.length] = "</a:lnDef>"),
      (e[e.length] = "</a:objectDefaults>"),
      (e[e.length] = "<a:extraClrSchemeLst/>"),
      (e[e.length] = "</a:theme>"),
      e.join("")
    );
  }
  function Yo(e) {
    var t = {};
    switch (
      ((t.xclrType = e.read_shift(2)),
      (t.nTintShade = e.read_shift(2)),
      t.xclrType)
    ) {
      case 0:
        e.l += 4;
        break;
      case 1:
        t.xclrValue = Pr(e, 4);
        break;
      case 2:
        t.xclrValue = Gn(e);
        break;
      case 3:
        t.xclrValue = e.read_shift(4);
        break;
      case 4:
        e.l += 4;
    }
    return (e.l += 8), t;
  }
  function Ko(e) {
    var t = e.read_shift(2),
      r = e.read_shift(2) - 4,
      a = [t];
    switch (t) {
      case 4:
      case 5:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 13:
        a[1] = Yo(e);
        break;
      case 6:
        a[1] = Pr(e, r);
        break;
      case 14:
      case 15:
        a[1] = e.read_shift(1 == r ? 1 : 2);
        break;
      default:
        throw new Error("Unrecognized ExtProp type: " + t + " " + r);
    }
    return a;
  }
  function Jo() {
    var e,
      t,
      r,
      a = Ur();
    return (
      Br(a, 332),
      Br(a, 334, na(1)),
      Br(
        a,
        335,
        ((r = Lr(
          12 +
            2 *
              (t = { name: "XLDAPR", version: 12e4, flags: 3496657072 }).name
                .length,
        )).write_shift(4, t.flags),
        r.write_shift(4, t.version),
        ia(t.name, r),
        r.slice(0, r.l)),
      ),
      Br(a, 336),
      Br(
        a,
        339,
        ((e = 1),
        (r = Lr(8 + 2 * (t = "XLDAPR").length)).write_shift(4, e),
        ia(t, r),
        r.slice(0, r.l)),
      ),
      Br(a, 52),
      Br(a, 35, na(514)),
      Br(a, 4096, na(0)),
      Br(a, 4097, Fn(1)),
      Br(a, 36),
      Br(a, 53),
      Br(a, 340),
      Br(
        a,
        337,
        ((e = 1),
        (t = !0),
        (r = Lr(8)).write_shift(4, e),
        r.write_shift(4, t ? 1 : 0),
        r),
      ),
      Br(
        a,
        51,
        (function (e) {
          var t = Lr(4 + 8 * e.length);
          t.write_shift(4, e.length);
          for (var r = 0; r < e.length; ++r)
            t.write_shift(4, e[r][0]), t.write_shift(4, e[r][1]);
          return t;
        })([[1, 0]]),
      ),
      Br(a, 338),
      Br(a, 333),
      a.end()
    );
  }
  function qo() {
    var e = [ot];
    return (
      e.push(
        '<metadata xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:xlrd="http://schemas.microsoft.com/office/spreadsheetml/2017/richdata" xmlns:xda="http://schemas.microsoft.com/office/spreadsheetml/2017/dynamicarray">\n  <metadataTypes count="1">\n    <metadataType name="XLDAPR" minSupportedVersion="120000" copy="1" pasteAll="1" pasteValues="1" merge="1" splitFirst="1" rowColShift="1" clearFormats="1" clearComments="1" assign="1" coerce="1" cellMeta="1"/>\n  </metadataTypes>\n  <futureMetadata name="XLDAPR" count="1">\n    <bk>\n      <extLst>\n        <ext uri="{bdbb8cdc-fa1e-496e-a857-3c3f30c029c3}">\n          <xda:dynamicArrayProperties fDynamic="1" fCollapsed="0"/>\n        </ext>\n      </extLst>\n    </bk>\n  </futureMetadata>\n  <cellMetadata count="1">\n    <bk>\n      <rc t="1" v="0"/>\n    </bk>\n  </cellMetadata>\n</metadata>',
      ),
      e.join("")
    );
  }
  var Zo = 1024;
  function Qo(e, t) {
    for (
      var r = [21600, 21600],
        a = ["m0,0l0", r[1], r[0], r[1], r[0], "0xe"].join(","),
        n = [
          Yt("xml", null, {
            "xmlns:v": er.v,
            "xmlns:o": er.o,
            "xmlns:x": er.x,
            "xmlns:mv": er.mv,
          }).replace(/\/>/, ">"),
          Yt(
            "o:shapelayout",
            Yt("o:idmap", null, { "v:ext": "edit", data: e }),
            { "v:ext": "edit" },
          ),
          Yt(
            "v:shapetype",
            [
              Yt("v:stroke", null, { joinstyle: "miter" }),
              Yt("v:path", null, {
                gradientshapeok: "t",
                "o:connecttype": "rect",
              }),
            ].join(""),
            {
              id: "_x0000_t202",
              "o:spt": 202,
              coordsize: r.join(","),
              path: a,
            },
          ),
        ];
      Zo < 1e3 * e;

    )
      Zo += 1e3;
    return (
      t.forEach(function (e) {
        var t = Yr(e[0]),
          r = { color2: "#BEFF82", type: "gradient" };
        "gradient" == r.type && (r.angle = "-180");
        var a =
            "gradient" == r.type
              ? Yt("o:fill", null, {
                  type: "gradientUnscaled",
                  "v:ext": "view",
                })
              : null,
          r = Yt("v:fill", a, r);
        ++Zo,
          (n = n.concat([
            "<v:shape" +
              Xt({
                id: "_x0000_s" + Zo,
                type: "#_x0000_t202",
                style:
                  "position:absolute; margin-left:80pt;margin-top:5pt;width:104pt;height:64pt;z-index:10" +
                  (e[1].hidden ? ";visibility:hidden" : ""),
                fillcolor: "#ECFAD4",
                strokecolor: "#edeaa1",
              }) +
              ">",
            r,
            Yt("v:shadow", null, { on: "t", obscured: "t" }),
            Yt("v:path", null, { "o:connecttype": "none" }),
            '<v:textbox><div style="text-align:left"></div></v:textbox>',
            '<x:ClientData ObjectType="Note">',
            "<x:MoveWithCells/>",
            "<x:SizeWithCells/>",
            $t(
              "x:Anchor",
              [t.c + 1, 0, t.r + 1, 0, t.c + 3, 20, t.r + 5, 20].join(","),
            ),
            $t("x:AutoFill", "False"),
            $t("x:Row", String(t.r)),
            $t("x:Column", String(t.c)),
            e[1].hidden ? "" : "<x:Visible/>",
            "</x:ClientData>",
            "</v:shape>",
          ]));
      }),
      n.push("</xml>"),
      n.join("")
    );
  }
  function ec(s, e, i, o) {
    var c,
      l = Array.isArray(s);
    e.forEach(function (e) {
      var t,
        r = Yr(e.ref);
      (c = l ? (s[r.r] || (s[r.r] = []), s[r.r][r.c]) : s[e.ref]) ||
        ((c = { t: "z" }),
        l ? (s[r.r][r.c] = c) : (s[e.ref] = c),
        (t = Zr(s["!ref"] || "BDWGO1000001:A1")).s.r > r.r && (t.s.r = r.r),
        t.e.r < r.r && (t.e.r = r.r),
        t.s.c > r.c && (t.s.c = r.c),
        t.e.c < r.c && (t.e.c = r.c),
        (t = qr(t)) !== s["!ref"] && (s["!ref"] = t)),
        c.c || (c.c = []);
      var a = { a: e.author, t: e.t, r: e.r, T: i };
      e.h && (a.h = e.h);
      for (var n = c.c.length - 1; 0 <= n; --n) {
        if (!i && c.c[n].T) return;
        i && !c.c[n].T && c.c.splice(n, 1);
      }
      if (i && o)
        for (n = 0; n < o.length; ++n)
          if (a.a == o[n].id) {
            a.a = o[n].name || a.a;
            break;
          }
      c.c.push(a);
    });
  }
  function tc(e) {
    var s = [ot, Yt("comments", null, { xmlns: Qt[0] })],
      i = [];
    return (
      s.push("<authors>"),
      e.forEach(function (e) {
        e[1].forEach(function (e) {
          var t = kt(e.a);
          -1 == i.indexOf(t) &&
            (i.push(t), s.push("<author>" + t + "</author>")),
            e.T &&
              e.ID &&
              -1 == i.indexOf("tc=" + e.ID) &&
              (i.push("tc=" + e.ID),
              s.push("<author>tc=" + e.ID + "</author>"));
        });
      }),
      0 == i.length && (i.push("SheetJ5"), s.push("<author>SheetJ5</author>")),
      s.push("</authors>"),
      s.push("<commentList>"),
      e.forEach(function (e) {
        var t = 0,
          r = [];
        if (
          (e[1][0] && e[1][0].T && e[1][0].ID
            ? (t = i.indexOf("tc=" + e[1][0].ID))
            : e[1].forEach(function (e) {
                e.a && (t = i.indexOf(kt(e.a))), r.push(e.t || "");
              }),
          s.push('<comment ref="' + e[0] + '" authorId="' + t + '"><text>'),
          r.length <= 1)
        )
          s.push($t("t", kt(r[0] || "")));
        else {
          for (var a = "Comment:\n    " + r[0] + "\n", n = 1; n < r.length; ++n)
            a += "Reply:\n    " + r[n] + "\n";
          s.push($t("t", kt(a)));
        }
        s.push("</text></comment>");
      }),
      s.push("</commentList>"),
      2 < s.length &&
        ((s[s.length] = "</comments>"), (s[1] = s[1].replace("/>", ">"))),
      s.join("")
    );
  }
  Ue = sa;
  function rc(e) {
    var n = Ur(),
      s = [];
    return (
      Br(n, 628),
      Br(n, 630),
      e.forEach(function (e) {
        e[1].forEach(function (e) {
          -1 < s.indexOf(e.a) ||
            (s.push(e.a.slice(0, 54)), Br(n, 632, ia(e.a.slice(0, 54))));
        });
      }),
      Br(n, 631),
      Br(n, 633),
      e.forEach(function (a) {
        a[1].forEach(function (e) {
          e.iauthor = s.indexOf(e.a);
          var t,
            r = { s: Yr(a[0]), e: Yr(a[0]) };
          Br(
            n,
            635,
            ((r = [r, e]),
            (t = null == t ? Lr(36) : t).write_shift(4, r[1].iauthor),
            _a(r[0], t),
            t.write_shift(4, 0),
            t.write_shift(4, 0),
            t.write_shift(4, 0),
            t.write_shift(4, 0),
            t),
          ),
            e.t && 0 < e.t.length && Br(n, 637, la(e)),
            Br(n, 636),
            delete e.iauthor;
        });
      }),
      Br(n, 634),
      Br(n, 629),
      n.end()
    );
  }
  var ac = "application/vnd.ms-office.vbaProject";
  var nc = ["xlsb", "xlsm", "xlam", "biff8", "xla"];
  var sc,
    ic,
    oc =
      ((ic =
        /(^|[^A-Za-z_])R(\[?-?\d+\]|[1-9]\d*|)C(\[?-?\d+\]|[1-9]\d*|)(?![A-Za-z0-9_])/g),
      function (e, t) {
        return (sc = t), e.replace(ic, cc);
      });
  function cc(e, t, r, a) {
    var n = !1,
      s = !1;
    0 == r.length
      ? (s = !0)
      : "[" == r.charAt(0) && ((s = !0), (r = r.slice(1, -1))),
      0 == a.length
        ? (n = !0)
        : "[" == a.charAt(0) && ((n = !0), (a = a.slice(1, -1)));
    (r = 0 < r.length ? 0 | parseInt(r, 10) : 0),
      (a = 0 < a.length ? 0 | parseInt(a, 10) : 0);
    return (
      n ? (a += sc.c) : --a,
      s ? (r += sc.r) : --r,
      t + (n ? "" : "$") + Xr(a) + (s ? "" : "$") + jr(r)
    );
  }
  var lc =
      /(^|[^._A-Z0-9])([$]?)([A-Z]{1,2}|[A-W][A-Z]{2}|X[A-E][A-Z]|XF[A-D])([$]?)(10[0-3]\d{4}|104[0-7]\d{3}|1048[0-4]\d{2}|10485[0-6]\d|104857[0-6]|[1-9]\d{0,5})(?![_.\(A-Za-z0-9])/g,
    fc = function (e, i) {
      return e.replace(lc, function (e, t, r, a, n, s) {
        (a = $r(a) - (r ? 0 : i.c)), (s = Gr(s) - (n ? 0 : i.r));
        return (
          t +
          "R" +
          (0 == s ? "" : n ? 1 + s : "[" + s + "]") +
          "C" +
          (0 == a ? "" : r ? 1 + a : "[" + a + "]")
        );
      });
    };
  function hc(e, i) {
    return e.replace(lc, function (e, t, r, a, n, s) {
      return (
        t +
        ("$" == r ? r + a : Xr($r(a) + i.c)) +
        ("$" == n ? n + s : jr(Gr(s) + i.r))
      );
    });
  }
  function uc(e) {
    return e.replace(/_xlfn\./g, "");
  }
  function dc(e) {
    e.l += 1;
  }
  function pc(e, t) {
    t = e.read_shift(1 == t ? 1 : 2);
    return [16383 & t, (t >> 14) & 1, (t >> 15) & 1];
  }
  function mc(e, t, r) {
    var a = 2;
    if (r) {
      if (2 <= r.biff && r.biff <= 5) return gc(e);
      12 == r.biff && (a = 4);
    }
    var n = e.read_shift(a),
      r = e.read_shift(a),
      a = pc(e, 2),
      e = pc(e, 2);
    return {
      s: { r: n, c: a[0], cRel: a[1], rRel: a[2] },
      e: { r: r, c: e[0], cRel: e[1], rRel: e[2] },
    };
  }
  function gc(e) {
    var t = pc(e, 2),
      r = pc(e, 2),
      a = e.read_shift(1),
      e = e.read_shift(1);
    return {
      s: { r: t[0], c: a, cRel: t[1], rRel: t[2] },
      e: { r: r[0], c: e, cRel: r[1], rRel: r[2] },
    };
  }
  function bc(e, t, r) {
    if (r && 2 <= r.biff && r.biff <= 5)
      return (
        (n = pc((a = e), 2)),
        (a = a.read_shift(1)),
        { r: n[0], c: a, cRel: n[1], rRel: n[2] }
      );
    var a,
      n,
      r = e.read_shift(r && 12 == r.biff ? 4 : 2),
      e = pc(e, 2);
    return { r: r, c: e[0], cRel: e[1], rRel: e[2] };
  }
  function vc(e, t, r) {
    r = r && r.biff ? r.biff : 8;
    if (2 <= r && r <= 5)
      return (function (e) {
        var t = e.read_shift(2),
          r = e.read_shift(1),
          a = (32768 & t) >> 15,
          e = (16384 & t) >> 14;
        (t &= 16383), 1 == a && 8192 <= t && (t -= 16384);
        1 == e && 128 <= r && (r -= 256);
        return { r: t, c: r, cRel: e, rRel: a };
      })(e);
    var a = e.read_shift(12 <= r ? 4 : 2),
      n = e.read_shift(2),
      r = (16384 & n) >> 14,
      e = (32768 & n) >> 15;
    if (((n &= 16383), 1 == e)) for (; 524287 < a; ) a -= 1048576;
    if (1 == r) for (; 8191 < n; ) n -= 16384;
    return { r: a, c: n, cRel: r, rRel: e };
  }
  function wc(e) {
    var t = 1 & e[e.l + 1];
    return (e.l += 4), [t, 1];
  }
  function Tc(e) {
    return [e.read_shift(1), e.read_shift(1)];
  }
  function Ec(e, t, r) {
    var a = 0,
      n = 0;
    12 == r.biff
      ? ((a = e.read_shift(4)), (n = e.read_shift(4)))
      : ((n = 1 + e.read_shift(1)), (a = 1 + e.read_shift(2))),
      2 <= r.biff && r.biff < 8 && (--a, 0 == --n && (n = 256));
    for (var s = 0, i = []; s != a && (i[s] = []); ++s)
      for (var o = 0; o != n; ++o)
        i[s][o] = (function (e, t) {
          var r = [e.read_shift(1)];
          if (12 == t)
            switch (r[0]) {
              case 2:
                r[0] = 4;
                break;
              case 4:
                r[0] = 16;
                break;
              case 0:
                r[0] = 1;
                break;
              case 1:
                r[0] = 2;
            }
          switch (r[0]) {
            case 4:
              (r[1] = On(e, 1) ? "TRUE" : "FALSE"), 12 != t && (e.l += 7);
              break;
            case 37:
            case 16:
              (r[1] = Wa[e[e.l]]), (e.l += 12 == t ? 4 : 8);
              break;
            case 0:
              e.l += 8;
              break;
            case 1:
              r[1] = xa(e);
              break;
            case 2:
              r[1] = Bn(e, 0, { biff: 0 < t && t < 8 ? 2 : t });
              break;
            default:
              throw new Error("Bad SerAr: " + r[0]);
          }
          return r;
        })(e, r.biff);
    return i;
  }
  function kc(e, t, r) {
    return (
      (e.l += 2),
      [
        ((e = (a = e).read_shift(2)),
        (a = a.read_shift(2)),
        {
          r: e,
          c: 255 & a,
          fQuoted: !!(16384 & a),
          cRel: a >> 15,
          rRel: a >> 15,
        }),
      ]
    );
    var a;
  }
  function yc(e) {
    return (e.l += 6), [];
  }
  function Sc(e) {
    return (e.l += 2), [Nn(e), 1 & e.read_shift(2)];
  }
  var _c = [
    "Data",
    "All",
    "Headers",
    "??",
    "?Data2",
    "??",
    "?DataHeaders",
    "??",
    "Totals",
    "??",
    "??",
    "??",
    "?DataTotals",
    "??",
    "??",
    "??",
    "?Current",
  ];
  var xc = {
      1: {
        n: "PtgExp",
        f: function (e, t, r) {
          return (
            e.l++,
            r && 12 == r.biff
              ? [e.read_shift(4, "i"), 0]
              : [e.read_shift(2), e.read_shift(r && 2 == r.biff ? 1 : 2)]
          );
        },
      },
      2: { n: "PtgTbl", f: Pr },
      3: { n: "PtgAdd", f: dc },
      4: { n: "PtgSub", f: dc },
      5: { n: "PtgMul", f: dc },
      6: { n: "PtgDiv", f: dc },
      7: { n: "PtgPower", f: dc },
      8: { n: "PtgConcat", f: dc },
      9: { n: "PtgLt", f: dc },
      10: { n: "PtgLe", f: dc },
      11: { n: "PtgEq", f: dc },
      12: { n: "PtgGe", f: dc },
      13: { n: "PtgGt", f: dc },
      14: { n: "PtgNe", f: dc },
      15: { n: "PtgIsect", f: dc },
      16: { n: "PtgUnion", f: dc },
      17: { n: "PtgRange", f: dc },
      18: { n: "PtgUplus", f: dc },
      19: { n: "PtgUminus", f: dc },
      20: { n: "PtgPercent", f: dc },
      21: { n: "PtgParen", f: dc },
      22: { n: "PtgMissArg", f: dc },
      23: {
        n: "PtgStr",
        f: function (e, t, r) {
          return e.l++, Ln(e, 0, r);
        },
      },
      26: {
        n: "PtgSheet",
        f: function (e, t, r) {
          return (
            (e.l += 5), (e.l += 2), (e.l += 2 == r.biff ? 1 : 4), ["PTGSHEET"]
          );
        },
      },
      27: {
        n: "PtgEndSheet",
        f: function (e, t, r) {
          return (e.l += 2 == r.biff ? 4 : 5), ["PTGENDSHEET"];
        },
      },
      28: {
        n: "PtgErr",
        f: function (e) {
          return e.l++, Wa[e.read_shift(1)];
        },
      },
      29: {
        n: "PtgBool",
        f: function (e) {
          return e.l++, 0 !== e.read_shift(1);
        },
      },
      30: {
        n: "PtgInt",
        f: function (e) {
          return e.l++, e.read_shift(2);
        },
      },
      31: {
        n: "PtgNum",
        f: function (e) {
          return e.l++, xa(e);
        },
      },
      32: {
        n: "PtgArray",
        f: function (e, t, r) {
          var a = (96 & e[e.l++]) >> 5;
          return (e.l += 2 == r.biff ? 6 : 12 == r.biff ? 14 : 7), [a];
        },
      },
      33: {
        n: "PtgFunc",
        f: function (e, t, r) {
          var a = (96 & e[e.l]) >> 5;
          return (
            (e.l += 1),
            (r = e.read_shift(r && r.biff <= 3 ? 1 : 2)),
            [jc[r], Gc[r], a]
          );
        },
      },
      34: {
        n: "PtgFuncVar",
        f: function (e, t, r) {
          var a = e[e.l++],
            n = e.read_shift(1),
            s =
              r && r.biff <= 3
                ? [88 == a ? -1 : 0, e.read_shift(1)]
                : [(s = e)[s.l + 1] >> 7, 32767 & s.read_shift(2)];
          return [n, (0 === s[0] ? Gc : Vc)[s[1]]];
        },
      },
      35: {
        n: "PtgName",
        f: function (e, t, r) {
          var a = (e.read_shift(1) >>> 5) & 3,
            n = !r || 8 <= r.biff ? 4 : 2,
            n = e.read_shift(n);
          switch (r.biff) {
            case 2:
              e.l += 5;
              break;
            case 3:
            case 4:
              e.l += 8;
              break;
            case 5:
              e.l += 12;
          }
          return [a, 0, n];
        },
      },
      36: {
        n: "PtgRef",
        f: function (e, t, r) {
          var a = (96 & e[e.l]) >> 5;
          return (e.l += 1), [a, bc(e, 0, r)];
        },
      },
      37: {
        n: "PtgArea",
        f: function (e, t, r) {
          return [(96 & e[e.l++]) >> 5, mc(e, 2 <= r.biff && r.biff, r)];
        },
      },
      38: {
        n: "PtgMemArea",
        f: function (e, t, r) {
          var a = (e.read_shift(1) >>> 5) & 3;
          return (
            (e.l += r && 2 == r.biff ? 3 : 4),
            [a, e.read_shift(r && 2 == r.biff ? 1 : 2)]
          );
        },
      },
      39: { n: "PtgMemErr", f: Pr },
      40: { n: "PtgMemNoMem", f: Pr },
      41: {
        n: "PtgMemFunc",
        f: function (e, t, r) {
          return [
            (e.read_shift(1) >>> 5) & 3,
            e.read_shift(r && 2 == r.biff ? 1 : 2),
          ];
        },
      },
      42: {
        n: "PtgRefErr",
        f: function (e, t, r) {
          var a = (e.read_shift(1) >>> 5) & 3;
          return (
            (e.l += 4), r.biff < 8 && e.l--, 12 == r.biff && (e.l += 2), [a]
          );
        },
      },
      43: {
        n: "PtgAreaErr",
        f: function (e, t, r) {
          var a = (96 & e[e.l++]) >> 5;
          return (e.l += r && 8 < r.biff ? 12 : r.biff < 8 ? 6 : 8), [a];
        },
      },
      44: {
        n: "PtgRefN",
        f: function (e, t, r) {
          var a = (96 & e[e.l]) >> 5;
          return (e.l += 1), [a, vc(e, 0, r)];
        },
      },
      45: {
        n: "PtgAreaN",
        f: function (e, t, r) {
          return [
            (96 & e[e.l++]) >> 5,
            (function (e, t) {
              if (t.biff < 8) return gc(e);
              var r = e.read_shift(12 == t.biff ? 4 : 2),
                a = e.read_shift(12 == t.biff ? 4 : 2),
                t = pc(e, 2),
                e = pc(e, 2);
              return {
                s: { r: r, c: t[0], cRel: t[1], rRel: t[2] },
                e: { r: a, c: e[0], cRel: e[1], rRel: e[2] },
              };
            })(e, r),
          ];
        },
      },
      46: {
        n: "PtgMemAreaN",
        f: function (e) {
          return [(e.read_shift(1) >>> 5) & 3, e.read_shift(2)];
        },
      },
      47: {
        n: "PtgMemNoMemN",
        f: function (e) {
          return [(e.read_shift(1) >>> 5) & 3, e.read_shift(2)];
        },
      },
      57: {
        n: "PtgNameX",
        f: function (e, t, r) {
          return 5 == r.biff
            ? (function (e) {
                var t = (e.read_shift(1) >>> 5) & 3,
                  r = e.read_shift(2, "i");
                e.l += 8;
                var a = e.read_shift(2);
                return (e.l += 12), [t, r, a];
              })(e)
            : [(e.read_shift(1) >>> 5) & 3, e.read_shift(2), e.read_shift(4)];
        },
      },
      58: {
        n: "PtgRef3d",
        f: function (e, t, r) {
          var a = (96 & e[e.l]) >> 5;
          e.l += 1;
          var n = e.read_shift(2);
          return r && 5 == r.biff && (e.l += 12), [a, n, bc(e, 0, r)];
        },
      },
      59: {
        n: "PtgArea3d",
        f: function (e, t, r) {
          var a = (96 & e[e.l++]) >> 5,
            n = e.read_shift(2, "i");
          if (r)
            switch (r.biff) {
              case 5:
                (e.l += 12), 0;
                break;
              case 12:
                0;
            }
          return [a, n, mc(e, 0, r)];
        },
      },
      60: {
        n: "PtgRefErr3d",
        f: function (e, t, r) {
          var a = (96 & e[e.l++]) >> 5,
            n = e.read_shift(2),
            s = 4;
          if (r)
            switch (r.biff) {
              case 5:
                s = 15;
                break;
              case 12:
                s = 6;
            }
          return (e.l += s), [a, n];
        },
      },
      61: {
        n: "PtgAreaErr3d",
        f: function (e, t, r) {
          var a = (96 & e[e.l++]) >> 5,
            n = e.read_shift(2),
            s = 8;
          if (r)
            switch (r.biff) {
              case 5:
                (e.l += 12), (s = 6);
                break;
              case 12:
                s = 12;
            }
          return (e.l += s), [a, n];
        },
      },
      255: {},
    },
    Ac = {
      64: 32,
      96: 32,
      65: 33,
      97: 33,
      66: 34,
      98: 34,
      67: 35,
      99: 35,
      68: 36,
      100: 36,
      69: 37,
      101: 37,
      70: 38,
      102: 38,
      71: 39,
      103: 39,
      72: 40,
      104: 40,
      73: 41,
      105: 41,
      74: 42,
      106: 42,
      75: 43,
      107: 43,
      76: 44,
      108: 44,
      77: 45,
      109: 45,
      78: 46,
      110: 46,
      79: 47,
      111: 47,
      88: 34,
      120: 34,
      89: 57,
      121: 57,
      90: 58,
      122: 58,
      91: 59,
      123: 59,
      92: 60,
      124: 60,
      93: 61,
      125: 61,
    },
    Cc = {
      1: { n: "PtgElfLel", f: Sc },
      2: { n: "PtgElfRw", f: kc },
      3: { n: "PtgElfCol", f: kc },
      6: { n: "PtgElfRwV", f: kc },
      7: { n: "PtgElfColV", f: kc },
      10: { n: "PtgElfRadical", f: kc },
      11: { n: "PtgElfRadicalS", f: yc },
      13: { n: "PtgElfColS", f: yc },
      15: { n: "PtgElfColSV", f: yc },
      16: { n: "PtgElfRadicalLel", f: Sc },
      25: {
        n: "PtgList",
        f: function (e) {
          e.l += 2;
          var t = e.read_shift(2),
            r = e.read_shift(2),
            a = e.read_shift(4),
            n = e.read_shift(2),
            e = e.read_shift(2);
          return {
            ixti: t,
            coltype: 3 & r,
            rt: _c[(r >> 2) & 31],
            idx: a,
            c: n,
            C: e,
          };
        },
      },
      29: {
        n: "PtgSxName",
        f: function (e) {
          return (e.l += 2), [e.read_shift(4)];
        },
      },
      255: {},
    },
    Rc = {
      0: {
        n: "PtgAttrNoop",
        f: function (e) {
          return (e.l += 4), [0, 0];
        },
      },
      1: {
        n: "PtgAttrSemi",
        f: function (e, t, r) {
          var a = 255 & e[e.l + 1] ? 1 : 0;
          return (e.l += r && 2 == r.biff ? 3 : 4), [a];
        },
      },
      2: {
        n: "PtgAttrIf",
        f: function (e, t, r) {
          var a = 255 & e[e.l + 1] ? 1 : 0;
          return (e.l += 2), [a, e.read_shift(r && 2 == r.biff ? 1 : 2)];
        },
      },
      4: {
        n: "PtgAttrChoose",
        f: function (e, t, r) {
          e.l += 2;
          for (
            var a = e.read_shift(r && 2 == r.biff ? 1 : 2), n = [], s = 0;
            s <= a;
            ++s
          )
            n.push(e.read_shift(r && 2 == r.biff ? 1 : 2));
          return n;
        },
      },
      8: {
        n: "PtgAttrGoto",
        f: function (e, t, r) {
          var a = 255 & e[e.l + 1] ? 1 : 0;
          return (e.l += 2), [a, e.read_shift(r && 2 == r.biff ? 1 : 2)];
        },
      },
      16: {
        n: "PtgAttrSum",
        f: function (e, t, r) {
          e.l += r && 2 == r.biff ? 3 : 4;
        },
      },
      32: { n: "PtgAttrBaxcel", f: wc },
      33: { n: "PtgAttrBaxcel", f: wc },
      64: {
        n: "PtgAttrSpace",
        f: function (e) {
          return e.read_shift(2), Tc(e);
        },
      },
      65: {
        n: "PtgAttrSpaceSemi",
        f: function (e) {
          return e.read_shift(2), Tc(e);
        },
      },
      128: {
        n: "PtgAttrIfError",
        f: function (e) {
          var t = 255 & e[e.l + 1] ? 1 : 0;
          return (e.l += 2), [t, e.read_shift(2)];
        },
      },
      255: {},
    };
  function Oc(e, t, r, a) {
    if (a.biff < 8) return Pr(e, t);
    for (var n = e.l + t, s = [], i = 0; i !== r.length; ++i)
      switch (r[i][0]) {
        case "PtgArray":
          (r[i][1] = Ec(e, 0, a)), s.push(r[i][1]);
          break;
        case "PtgMemArea":
          (r[i][2] = (function (e, t) {
            for (
              var r = e.read_shift(12 == t.biff ? 4 : 2), a = [], n = 0;
              n != r;
              ++n
            )
              a.push((12 == t.biff ? Sa : Kn)(e, 8));
            return a;
          })(e, (r[i][1], a))),
            s.push(r[i][2]);
          break;
        case "PtgExp":
          a &&
            12 == a.biff &&
            ((r[i][1][1] = e.read_shift(4)), s.push(r[i][1]));
          break;
        case "PtgList":
        case "PtgElfRadicalS":
        case "PtgElfColS":
        case "PtgElfColSV":
          throw "Unsupported " + r[i][0];
      }
    return 0 !== (t = n - e.l) && s.push(Pr(e, t)), s;
  }
  function Ic(e, t, r) {
    for (var a, n, s = e.l + t, i = []; s != e.l; )
      (t = s - e.l),
        (n = e[e.l]),
        (a = xc[n] || xc[Ac[n]]),
        (a = 24 === n || 25 === n ? (24 === n ? Cc : Rc)[e[e.l + 1]] : a) && a.f
          ? i.push([a.n, a.f(e, t, r)])
          : Pr(e, t);
    return i;
  }
  var Nc = {
    PtgAdd: "+",
    PtgConcat: "&",
    PtgDiv: "/",
    PtgEq: "=",
    PtgGe: ">=",
    PtgGt: ">",
    PtgLe: "<=",
    PtgLt: "<",
    PtgMul: "*",
    PtgNe: "<>",
    PtgPower: "^",
    PtgSub: "-",
  };
  function Fc(e, t, r) {
    if (!e) return "SH33TJSERR0";
    if (8 < r.biff && (!e.XTI || !e.XTI[t])) return e.SheetNames[t];
    if (!e.XTI) return "SH33TJSERR6";
    var a = e.XTI[t];
    if (r.biff < 8)
      return (
        1e4 < t && (t -= 65536), 0 == (t = t < 0 ? -t : t) ? "" : e.XTI[t - 1]
      );
    if (!a) return "SH33TJSERR1";
    var n = "";
    if (8 < r.biff)
      switch (e[a[0]][0]) {
        case 357:
          return (
            (n = -1 == a[1] ? "#REF" : e.SheetNames[a[1]]),
            a[1] == a[2] ? n : n + ":" + e.SheetNames[a[2]]
          );
        case 358:
          return null != r.SID
            ? e.SheetNames[r.SID]
            : "SH33TJSSAME" + e[a[0]][0];
        case 355:
        default:
          return "SH33TJSSRC" + e[a[0]][0];
      }
    switch (e[a[0]][0][0]) {
      case 1025:
        return (
          (n = -1 == a[1] ? "#REF" : e.SheetNames[a[1]] || "SH33TJSERR3"),
          a[1] == a[2] ? n : n + ":" + e.SheetNames[a[2]]
        );
      case 14849:
        return e[a[0]]
          .slice(1)
          .map(function (e) {
            return e.Name;
          })
          .join(";;");
      default:
        return e[a[0]][0][3]
          ? ((n = -1 == a[1] ? "#REF" : e[a[0]][0][3][a[1]] || "SH33TJSERR4"),
            a[1] == a[2] ? n : n + ":" + e[a[0]][0][3][a[2]])
          : "SH33TJSERR2";
    }
  }
  function Dc(e, t, r) {
    t = Fc(e, t, r);
    return "#REF" == t
      ? t
      : (function (e, t) {
          if (!(e || (t && t.biff <= 5 && 2 <= t.biff)))
            throw new Error("empty sheet name");
          return /[^\w\u4E00-\u9FFF\u3040-\u30FF]/.test(e) ? "'" + e + "'" : e;
        })(t, r);
  }
  function Pc(e, t, r, a, n) {
    var s,
      i,
      o,
      c = (n && n.biff) || 8,
      l = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } },
      f = [],
      h = 0,
      u = 0,
      d = "";
    if (!e[0] || !e[0][0]) return "";
    for (var p = -1, m = "", g = 0, b = e[0].length; g < b; ++g) {
      var v = e[0][g];
      switch (v[0]) {
        case "PtgUminus":
          f.push("-" + f.pop());
          break;
        case "PtgUplus":
          f.push("+" + f.pop());
          break;
        case "PtgPercent":
          f.push(f.pop() + "%");
          break;
        case "PtgAdd":
        case "PtgConcat":
        case "PtgDiv":
        case "PtgEq":
        case "PtgGe":
        case "PtgGt":
        case "PtgLe":
        case "PtgLt":
        case "PtgMul":
        case "PtgNe":
        case "PtgPower":
        case "PtgSub":
          if (((O = f.pop()), (s = f.pop()), 0 <= p)) {
            switch (e[0][p][1][0]) {
              case 0:
                m = Ge(" ", e[0][p][1][1]);
                break;
              case 1:
                m = Ge("\r", e[0][p][1][1]);
                break;
              default:
                if (((m = ""), n.WTF))
                  throw new Error(
                    "Unexpected PtgAttrSpaceType " + e[0][p][1][0],
                  );
            }
            (s += m), (p = -1);
          }
          f.push(s + Nc[v[0]] + O);
          break;
        case "PtgIsect":
          (O = f.pop()), (s = f.pop()), f.push(s + " " + O);
          break;
        case "PtgUnion":
          (O = f.pop()), (s = f.pop()), f.push(s + "," + O);
          break;
        case "PtgRange":
          (O = f.pop()), (s = f.pop()), f.push(s + ":" + O);
          break;
        case "PtgAttrChoose":
        case "PtgAttrGoto":
        case "PtgAttrIf":
        case "PtgAttrIfError":
          break;
        case "PtgRef":
          (i = Wr(v[1][1], l, n)), f.push(zr(i, c));
          break;
        case "PtgRefN":
          (i = r ? Wr(v[1][1], r, n) : v[1][1]), f.push(zr(i, c));
          break;
        case "PtgRef3d":
          (h = v[1][1]), (i = Wr(v[1][2], l, n));
          d = Dc(a, h, n);
          f.push(d + "!" + zr(i, c));
          break;
        case "PtgFunc":
        case "PtgFuncVar":
          var w = v[1][0],
            T = v[1][1],
            w = w || 0,
            E = 0 == (w &= 127) ? [] : f.slice(-w);
          (f.length -= w),
            "User" === T && (T = E.shift()),
            f.push(T + "(" + E.join(",") + ")");
          break;
        case "PtgBool":
          f.push(v[1] ? "TRUE" : "FALSE");
          break;
        case "PtgInt":
          f.push(v[1]);
          break;
        case "PtgNum":
          f.push(String(v[1]));
          break;
        case "PtgStr":
          f.push('"' + v[1].replace(/"/g, '""') + '"');
          break;
        case "PtgErr":
          f.push(v[1]);
          break;
        case "PtgAreaN":
          (o = Hr(v[1][1], r ? { s: r } : l, n)), f.push(Vr(o, n));
          break;
        case "PtgArea":
          (o = Hr(v[1][1], l, n)), f.push(Vr(o, n));
          break;
        case "PtgArea3d":
          (h = v[1][1]),
            (o = v[1][2]),
            (d = Dc(a, h, n)),
            f.push(d + "!" + Vr(o, n));
          break;
        case "PtgAttrSum":
          f.push("SUM(" + f.pop() + ")");
          break;
        case "PtgAttrBaxcel":
        case "PtgAttrSemi":
          break;
        case "PtgName":
          u = v[1][2];
          var k = (a.names || [])[u - 1] || (a[0] || [])[u],
            y = k ? k.Name : "SH33TJSNAME" + String(u);
          y && "_xlfn." == y.slice(0, 6) && !n.xlfn && (y = y.slice(6)),
            f.push(y);
          break;
        case "PtgNameX":
          var S,
            _ = v[1][1],
            u = v[1][2];
          if (!(n.biff <= 5)) {
            k = "";
            14849 == ((a[_] || [])[0] || [])[0] ||
              (1025 == ((a[_] || [])[0] || [])[0]
                ? a[_][u] &&
                  0 < a[_][u].itab &&
                  (k = a.SheetNames[a[_][u].itab - 1] + "!")
                : (k = a.SheetNames[u - 1] + "!")),
              a[_] && a[_][u]
                ? (k += a[_][u].Name)
                : a[0] && a[0][u]
                ? (k += a[0][u].Name)
                : (y = (Fc(a, _, n) || "").split(";;"))[u - 1]
                ? (k = y[u - 1])
                : (k += "SH33TJSERRX"),
              f.push(k);
            break;
          }
          (S = (S = a[(_ = _ < 0 ? -_ : _)] ? a[_][u] : S) || {
            Name: "SH33TJSERRY",
          }),
            f.push(S.Name);
          break;
        case "PtgParen":
          var x = "(",
            A = ")";
          if (0 <= p) {
            switch (((m = ""), e[0][p][1][0])) {
              case 2:
                x = Ge(" ", e[0][p][1][1]) + x;
                break;
              case 3:
                x = Ge("\r", e[0][p][1][1]) + x;
                break;
              case 4:
                A = Ge(" ", e[0][p][1][1]) + A;
                break;
              case 5:
                A = Ge("\r", e[0][p][1][1]) + A;
                break;
              default:
                if (n.WTF)
                  throw new Error(
                    "Unexpected PtgAttrSpaceType " + e[0][p][1][0],
                  );
            }
            p = -1;
          }
          f.push(x + f.pop() + A);
          break;
        case "PtgRefErr":
        case "PtgRefErr3d":
          f.push("#REF!");
          break;
        case "PtgExp":
          i = { c: v[1][1], r: v[1][0] };
          var C = { c: r.c, r: r.r };
          if (a.sharedf[Kr(i)]) {
            _ = a.sharedf[Kr(i)];
            f.push(Pc(_, 0, C, a, n));
          } else {
            for (var R = !1, O = 0; O != a.arrayf.length; ++O)
              if (
                ((s = a.arrayf[O]),
                !(
                  i.c < s[0].s.c ||
                  i.c > s[0].e.c ||
                  i.r < s[0].s.r ||
                  i.r > s[0].e.r
                ))
              ) {
                f.push(Pc(s[1], 0, C, a, n)), (R = !0);
                break;
              }
            R || f.push(v[1]);
          }
          break;
        case "PtgArray":
          f.push(
            "{" +
              (function (e) {
                for (var t = [], r = 0; r < e.length; ++r) {
                  for (var a = e[r], n = [], s = 0; s < a.length; ++s) {
                    var i = a[s];
                    i
                      ? 2 === i[0]
                        ? n.push('"' + i[1].replace(/"/g, '""') + '"')
                        : n.push(i[1])
                      : n.push("");
                  }
                  t.push(n.join(","));
                }
                return t.join(";");
              })(v[1]) +
              "}",
          );
          break;
        case "PtgMemArea":
          break;
        case "PtgAttrSpace":
        case "PtgAttrSpaceSemi":
          p = g;
          break;
        case "PtgTbl":
        case "PtgMemErr":
          break;
        case "PtgMissArg":
          f.push("");
          break;
        case "PtgAreaErr":
        case "PtgAreaErr3d":
          f.push("#REF!");
          break;
        case "PtgList":
          f.push("Table" + v[1].idx + "[#" + v[1].rt + "]");
          break;
        case "PtgMemAreaN":
        case "PtgMemNoMemN":
        case "PtgAttrNoop":
        case "PtgSheet":
        case "PtgEndSheet":
        case "PtgMemFunc":
        case "PtgMemNoMem":
          break;
        case "PtgElfCol":
        case "PtgElfColS":
        case "PtgElfColSV":
        case "PtgElfColV":
        case "PtgElfLel":
        case "PtgElfRadical":
        case "PtgElfRadicalLel":
        case "PtgElfRadicalS":
        case "PtgElfRw":
        case "PtgElfRwV":
          throw new Error("Unsupported ELFs");
        case "PtgSxName":
        default:
          throw new Error("Unrecognized Formula Token: " + String(v));
      }
      if (
        3 != n.biff &&
        0 <= p &&
        -1 ==
          ["PtgAttrSpace", "PtgAttrSpaceSemi", "PtgAttrGoto"].indexOf(
            e[0][g][0],
          )
      ) {
        var I = !0;
        switch ((v = e[0][p])[1][0]) {
          case 4:
            I = !1;
          case 0:
            m = Ge(" ", v[1][1]);
            break;
          case 5:
            I = !1;
          case 1:
            m = Ge("\r", v[1][1]);
            break;
          default:
            if (((m = ""), n.WTF))
              throw new Error("Unexpected PtgAttrSpaceType " + v[1][0]);
        }
        f.push((I ? m : "") + f.pop() + (I ? "" : m)), (p = -1);
      }
    }
    if (1 < f.length && n.WTF) throw new Error("bad formula stack");
    return f[0];
  }
  function Lc(e, t, r) {
    var a = e.l + t,
      n = $n(e);
    2 == r.biff && ++e.l;
    var s = (function (e) {
        var t;
        if (65535 !== yr(e, e.l + 6)) return [xa(e), "n"];
        switch (e[e.l]) {
          case 0:
            return (e.l += 8), ["String", "s"];
          case 1:
            return (t = 1 === e[e.l + 2]), (e.l += 8), [t, "b"];
          case 2:
            return (t = e[e.l + 2]), (e.l += 8), [t, "e"];
          case 3:
            return (e.l += 8), ["", "s"];
        }
        return [];
      })(e),
      t = e.read_shift(1);
    2 != r.biff && (e.read_shift(1), 5 <= r.biff && e.read_shift(4));
    r = (function (e, t, r) {
      var a,
        n = e.l + t,
        s = 2 == r.biff ? 1 : 2,
        i = e.read_shift(s);
      if (65535 == i) return [[], Pr(e, t - 2)];
      var o = Ic(e, i, r);
      return t !== i + s && (a = Oc(e, t - i - s, o, r)), (e.l = n), [o, a];
    })(e, a - e.l, r);
    return { cell: n, val: s[0], formula: r, shared: (t >> 3) & 1, tt: s[1] };
  }
  function Mc(e, t, r, a, n) {
    (t = Xn(t, r, n)),
      (n =
        null != (r = e.v)
          ? Aa("number" == typeof r ? r : 0)
          : ((r = Lr(8)).write_shift(1, 3),
            r.write_shift(1, 0),
            r.write_shift(2, 0),
            r.write_shift(2, 0),
            r.write_shift(2, 65535),
            r)),
      (r = Lr(6));
    r.write_shift(2, 33), r.write_shift(4, 0);
    for (var s = Lr(e.bf.length), i = 0; i < e.bf.length; ++i) s[i] = e.bf[i];
    return ue([t, n, r, s]);
  }
  function Uc(e, t, r) {
    var a = e.read_shift(4),
      n = Ic(e, a, r),
      a = e.read_shift(4);
    return [n, 0 < a ? Oc(e, a, n, r) : null];
  }
  var Bc = Uc,
    Wc = Uc,
    Hc = Uc,
    zc = Uc,
    Vc = {
      0: "BEEP",
      1: "OPEN",
      2: "OPEN.LINKS",
      3: "CLOSE.ALL",
      4: "SAVE",
      5: "SAVE.AS",
      6: "FILE.DELETE",
      7: "PAGE.SETUP",
      8: "PRINT",
      9: "PRINTER.SETUP",
      10: "QUIT",
      11: "NEW.WINDOW",
      12: "ARRANGE.ALL",
      13: "WINDOW.SIZE",
      14: "WINDOW.MOVE",
      15: "FULL",
      16: "CLOSE",
      17: "RUN",
      22: "SET.PRINT.AREA",
      23: "SET.PRINT.TITLES",
      24: "SET.PAGE.BREAK",
      25: "REMOVE.PAGE.BREAK",
      26: "FONT",
      27: "DISPLAY",
      28: "PROTECT.DOCUMENT",
      29: "PRECISION",
      30: "A1.R1C1",
      31: "CALCULATE.NOW",
      32: "CALCULATION",
      34: "DATA.FIND",
      35: "EXTRACT",
      36: "DATA.DELETE",
      37: "SET.DATABASE",
      38: "SET.CRITERIA",
      39: "SORT",
      40: "DATA.SERIES",
      41: "TABLE",
      42: "FORMAT.NUMBER",
      43: "ALIGNMENT",
      44: "STYLE",
      45: "BORDER",
      46: "CELL.PROTECTION",
      47: "COLUMN.WIDTH",
      48: "UNDO",
      49: "CUT",
      50: "COPY",
      51: "PASTE",
      52: "CLEAR",
      53: "PASTE.SPECIAL",
      54: "EDIT.DELETE",
      55: "INSERT",
      56: "FILL.RIGHT",
      57: "FILL.DOWN",
      61: "DEFINE.NAME",
      62: "CREATE.NAMES",
      63: "FORMULA.GOTO",
      64: "FORMULA.FIND",
      65: "SELECT.LAST.CELL",
      66: "SHOW.ACTIVE.CELL",
      67: "GALLERY.AREA",
      68: "GALLERY.BAR",
      69: "GALLERY.COLUMN",
      70: "GALLERY.LINE",
      71: "GALLERY.PIE",
      72: "GALLERY.SCATTER",
      73: "COMBINATION",
      74: "PREFERRED",
      75: "ADD.OVERLAY",
      76: "GRIDLINES",
      77: "SET.PREFERRED",
      78: "AXES",
      79: "LEGEND",
      80: "ATTACH.TEXT",
      81: "ADD.ARROW",
      82: "SELECT.CHART",
      83: "SELECT.PLOT.AREA",
      84: "PATTERNS",
      85: "MAIN.CHART",
      86: "OVERLAY",
      87: "SCALE",
      88: "FORMAT.LEGEND",
      89: "FORMAT.TEXT",
      90: "EDIT.REPEAT",
      91: "PARSE",
      92: "JUSTIFY",
      93: "HIDE",
      94: "UNHIDE",
      95: "WORKSPACE",
      96: "FORMULA",
      97: "FORMULA.FILL",
      98: "FORMULA.ARRAY",
      99: "DATA.FIND.NEXT",
      100: "DATA.FIND.PREV",
      101: "FORMULA.FIND.NEXT",
      102: "FORMULA.FIND.PREV",
      103: "ACTIVATE",
      104: "ACTIVATE.NEXT",
      105: "ACTIVATE.PREV",
      106: "UNLOCKED.NEXT",
      107: "UNLOCKED.PREV",
      108: "COPY.PICTURE",
      109: "SELECT",
      110: "DELETE.NAME",
      111: "DELETE.FORMAT",
      112: "VLINE",
      113: "HLINE",
      114: "VPAGE",
      115: "HPAGE",
      116: "VSCROLL",
      117: "HSCROLL",
      118: "ALERT",
      119: "NEW",
      120: "CANCEL.COPY",
      121: "SHOW.CLIPBOARD",
      122: "MESSAGE",
      124: "PASTE.LINK",
      125: "APP.ACTIVATE",
      126: "DELETE.ARROW",
      127: "ROW.HEIGHT",
      128: "FORMAT.MOVE",
      129: "FORMAT.SIZE",
      130: "FORMULA.REPLACE",
      131: "SEND.KEYS",
      132: "SELECT.SPECIAL",
      133: "APPLY.NAMES",
      134: "REPLACE.FONT",
      135: "FREEZE.PANES",
      136: "SHOW.INFO",
      137: "SPLIT",
      138: "ON.WINDOW",
      139: "ON.DATA",
      140: "DISABLE.INPUT",
      142: "OUTLINE",
      143: "LIST.NAMES",
      144: "FILE.CLOSE",
      145: "SAVE.WORKBOOK",
      146: "DATA.FORM",
      147: "COPY.CHART",
      148: "ON.TIME",
      149: "WAIT",
      150: "FORMAT.FONT",
      151: "FILL.UP",
      152: "FILL.LEFT",
      153: "DELETE.OVERLAY",
      155: "SHORT.MENUS",
      159: "SET.UPDATE.STATUS",
      161: "COLOR.PALETTE",
      162: "DELETE.STYLE",
      163: "WINDOW.RESTORE",
      164: "WINDOW.MAXIMIZE",
      166: "CHANGE.LINK",
      167: "CALCULATE.DOCUMENT",
      168: "ON.KEY",
      169: "APP.RESTORE",
      170: "APP.MOVE",
      171: "APP.SIZE",
      172: "APP.MINIMIZE",
      173: "APP.MAXIMIZE",
      174: "BRING.TO.FRONT",
      175: "SEND.TO.BACK",
      185: "MAIN.CHART.TYPE",
      186: "OVERLAY.CHART.TYPE",
      187: "SELECT.END",
      188: "OPEN.MAIL",
      189: "SEND.MAIL",
      190: "STANDARD.FONT",
      191: "CONSOLIDATE",
      192: "SORT.SPECIAL",
      193: "GALLERY.3D.AREA",
      194: "GALLERY.3D.COLUMN",
      195: "GALLERY.3D.LINE",
      196: "GALLERY.3D.PIE",
      197: "VIEW.3D",
      198: "GOAL.SEEK",
      199: "WORKGROUP",
      200: "FILL.GROUP",
      201: "UPDATE.LINK",
      202: "PROMOTE",
      203: "DEMOTE",
      204: "SHOW.DETAIL",
      206: "UNGROUP",
      207: "OBJECT.PROPERTIES",
      208: "SAVE.NEW.OBJECT",
      209: "SHARE",
      210: "SHARE.NAME",
      211: "DUPLICATE",
      212: "APPLY.STYLE",
      213: "ASSIGN.TO.OBJECT",
      214: "OBJECT.PROTECTION",
      215: "HIDE.OBJECT",
      216: "SET.EXTRACT",
      217: "CREATE.PUBLISHER",
      218: "SUBSCRIBE.TO",
      219: "ATTRIBUTES",
      220: "SHOW.TOOLBAR",
      222: "PRINT.PREVIEW",
      223: "EDIT.COLOR",
      224: "SHOW.LEVELS",
      225: "FORMAT.MAIN",
      226: "FORMAT.OVERLAY",
      227: "ON.RECALC",
      228: "EDIT.SERIES",
      229: "DEFINE.STYLE",
      240: "LINE.PRINT",
      243: "ENTER.DATA",
      249: "GALLERY.RADAR",
      250: "MERGE.STYLES",
      251: "EDITION.OPTIONS",
      252: "PASTE.PICTURE",
      253: "PASTE.PICTURE.LINK",
      254: "SPELLING",
      256: "ZOOM",
      259: "INSERT.OBJECT",
      260: "WINDOW.MINIMIZE",
      265: "SOUND.NOTE",
      266: "SOUND.PLAY",
      267: "FORMAT.SHAPE",
      268: "EXTEND.POLYGON",
      269: "FORMAT.AUTO",
      272: "GALLERY.3D.BAR",
      273: "GALLERY.3D.SURFACE",
      274: "FILL.AUTO",
      276: "CUSTOMIZE.TOOLBAR",
      277: "ADD.TOOL",
      278: "EDIT.OBJECT",
      279: "ON.DOUBLECLICK",
      280: "ON.ENTRY",
      281: "WORKBOOK.ADD",
      282: "WORKBOOK.MOVE",
      283: "WORKBOOK.COPY",
      284: "WORKBOOK.OPTIONS",
      285: "SAVE.WORKSPACE",
      288: "CHART.WIZARD",
      289: "DELETE.TOOL",
      290: "MOVE.TOOL",
      291: "WORKBOOK.SELECT",
      292: "WORKBOOK.ACTIVATE",
      293: "ASSIGN.TO.TOOL",
      295: "COPY.TOOL",
      296: "RESET.TOOL",
      297: "CONSTRAIN.NUMERIC",
      298: "PASTE.TOOL",
      302: "WORKBOOK.NEW",
      305: "SCENARIO.CELLS",
      306: "SCENARIO.DELETE",
      307: "SCENARIO.ADD",
      308: "SCENARIO.EDIT",
      309: "SCENARIO.SHOW",
      310: "SCENARIO.SHOW.NEXT",
      311: "SCENARIO.SUMMARY",
      312: "PIVOT.TABLE.WIZARD",
      313: "PIVOT.FIELD.PROPERTIES",
      314: "PIVOT.FIELD",
      315: "PIVOT.ITEM",
      316: "PIVOT.ADD.FIELDS",
      318: "OPTIONS.CALCULATION",
      319: "OPTIONS.EDIT",
      320: "OPTIONS.VIEW",
      321: "ADDIN.MANAGER",
      322: "MENU.EDITOR",
      323: "ATTACH.TOOLBARS",
      324: "VBAActivate",
      325: "OPTIONS.CHART",
      328: "VBA.INSERT.FILE",
      330: "VBA.PROCEDURE.DEFINITION",
      336: "ROUTING.SLIP",
      338: "ROUTE.DOCUMENT",
      339: "MAIL.LOGON",
      342: "INSERT.PICTURE",
      343: "EDIT.TOOL",
      344: "GALLERY.DOUGHNUT",
      350: "CHART.TREND",
      352: "PIVOT.ITEM.PROPERTIES",
      354: "WORKBOOK.INSERT",
      355: "OPTIONS.TRANSITION",
      356: "OPTIONS.GENERAL",
      370: "FILTER.ADVANCED",
      373: "MAIL.ADD.MAILER",
      374: "MAIL.DELETE.MAILER",
      375: "MAIL.REPLY",
      376: "MAIL.REPLY.ALL",
      377: "MAIL.FORWARD",
      378: "MAIL.NEXT.LETTER",
      379: "DATA.LABEL",
      380: "INSERT.TITLE",
      381: "FONT.PROPERTIES",
      382: "MACRO.OPTIONS",
      383: "WORKBOOK.HIDE",
      384: "WORKBOOK.UNHIDE",
      385: "WORKBOOK.DELETE",
      386: "WORKBOOK.NAME",
      388: "GALLERY.CUSTOM",
      390: "ADD.CHART.AUTOFORMAT",
      391: "DELETE.CHART.AUTOFORMAT",
      392: "CHART.ADD.DATA",
      393: "AUTO.OUTLINE",
      394: "TAB.ORDER",
      395: "SHOW.DIALOG",
      396: "SELECT.ALL",
      397: "UNGROUP.SHEETS",
      398: "SUBTOTAL.CREATE",
      399: "SUBTOTAL.REMOVE",
      400: "RENAME.OBJECT",
      412: "WORKBOOK.SCROLL",
      413: "WORKBOOK.NEXT",
      414: "WORKBOOK.PREV",
      415: "WORKBOOK.TAB.SPLIT",
      416: "FULL.SCREEN",
      417: "WORKBOOK.PROTECT",
      420: "SCROLLBAR.PROPERTIES",
      421: "PIVOT.SHOW.PAGES",
      422: "TEXT.TO.COLUMNS",
      423: "FORMAT.CHARTTYPE",
      424: "LINK.FORMAT",
      425: "TRACER.DISPLAY",
      430: "TRACER.NAVIGATE",
      431: "TRACER.CLEAR",
      432: "TRACER.ERROR",
      433: "PIVOT.FIELD.GROUP",
      434: "PIVOT.FIELD.UNGROUP",
      435: "CHECKBOX.PROPERTIES",
      436: "LABEL.PROPERTIES",
      437: "LISTBOX.PROPERTIES",
      438: "EDITBOX.PROPERTIES",
      439: "PIVOT.REFRESH",
      440: "LINK.COMBO",
      441: "OPEN.TEXT",
      442: "HIDE.DIALOG",
      443: "SET.DIALOG.FOCUS",
      444: "ENABLE.OBJECT",
      445: "PUSHBUTTON.PROPERTIES",
      446: "SET.DIALOG.DEFAULT",
      447: "FILTER",
      448: "FILTER.SHOW.ALL",
      449: "CLEAR.OUTLINE",
      450: "FUNCTION.WIZARD",
      451: "ADD.LIST.ITEM",
      452: "SET.LIST.ITEM",
      453: "REMOVE.LIST.ITEM",
      454: "SELECT.LIST.ITEM",
      455: "SET.CONTROL.VALUE",
      456: "SAVE.COPY.AS",
      458: "OPTIONS.LISTS.ADD",
      459: "OPTIONS.LISTS.DELETE",
      460: "SERIES.AXES",
      461: "SERIES.X",
      462: "SERIES.Y",
      463: "ERRORBAR.X",
      464: "ERRORBAR.Y",
      465: "FORMAT.CHART",
      466: "SERIES.ORDER",
      467: "MAIL.LOGOFF",
      468: "CLEAR.ROUTING.SLIP",
      469: "APP.ACTIVATE.MICROSOFT",
      470: "MAIL.EDIT.MAILER",
      471: "ON.SHEET",
      472: "STANDARD.WIDTH",
      473: "SCENARIO.MERGE",
      474: "SUMMARY.INFO",
      475: "FIND.FILE",
      476: "ACTIVE.CELL.FONT",
      477: "ENABLE.TIPWIZARD",
      478: "VBA.MAKE.ADDIN",
      480: "INSERTDATATABLE",
      481: "WORKGROUP.OPTIONS",
      482: "MAIL.SEND.MAILER",
      485: "AUTOCORRECT",
      489: "POST.DOCUMENT",
      491: "PICKLIST",
      493: "VIEW.SHOW",
      494: "VIEW.DEFINE",
      495: "VIEW.DELETE",
      509: "SHEET.BACKGROUND",
      510: "INSERT.MAP.OBJECT",
      511: "OPTIONS.MENONO",
      517: "MSOCHECKS",
      518: "NORMAL",
      519: "LAYOUT",
      520: "RM.PRINT.AREA",
      521: "CLEAR.PRINT.AREA",
      522: "ADD.PRINT.AREA",
      523: "MOVE.BRK",
      545: "HIDECURR.NOTE",
      546: "HIDEALL.NOTES",
      547: "DELETE.NOTE",
      548: "TRAVERSE.NOTES",
      549: "ACTIVATE.NOTES",
      620: "PROTECT.REVISIONS",
      621: "UNPROTECT.REVISIONS",
      647: "OPTIONS.ME",
      653: "WEB.PUBLISH",
      667: "NEWWEBQUERY",
      673: "PIVOT.TABLE.CHART",
      753: "OPTIONS.SAVE",
      755: "OPTIONS.SPELL",
      808: "HIDEALL.INKANNOTS",
    },
    Gc = {
      0: "COUNT",
      1: "IF",
      2: "ISNA",
      3: "ISERROR",
      4: "SUM",
      5: "AVERAGE",
      6: "MIN",
      7: "MAX",
      8: "ROW",
      9: "COLUMN",
      10: "NA",
      11: "NPV",
      12: "STDEV",
      13: "DOLLAR",
      14: "FIXED",
      15: "SIN",
      16: "COS",
      17: "TAN",
      18: "ATAN",
      19: "PI",
      20: "SQRT",
      21: "EXP",
      22: "LN",
      23: "LOG10",
      24: "ABS",
      25: "INT",
      26: "SIGN",
      27: "ROUND",
      28: "LOOKUP",
      29: "INDEX",
      30: "REPT",
      31: "MID",
      32: "LEN",
      33: "VALUE",
      34: "TRUE",
      35: "FALSE",
      36: "AND",
      37: "OR",
      38: "NOT",
      39: "MOD",
      40: "DCOUNT",
      41: "DSUM",
      42: "DAVERAGE",
      43: "DMIN",
      44: "DMAX",
      45: "DSTDEV",
      46: "VAR",
      47: "DVAR",
      48: "TEXT",
      49: "LINEST",
      50: "TREND",
      51: "LOGEST",
      52: "GROWTH",
      53: "GOTO",
      54: "HALT",
      55: "RETURN",
      56: "PV",
      57: "FV",
      58: "NPER",
      59: "PMT",
      60: "RATE",
      61: "MIRR",
      62: "IRR",
      63: "RAND",
      64: "MATCH",
      65: "DATE",
      66: "TIME",
      67: "DAY",
      68: "MONTH",
      69: "YEAR",
      70: "WEEKDAY",
      71: "HOUR",
      72: "MINUTE",
      73: "SECOND",
      74: "NOW",
      75: "AREAS",
      76: "ROWS",
      77: "COLUMNS",
      78: "OFFSET",
      79: "ABSREF",
      80: "RELREF",
      81: "ARGUMENT",
      82: "SEARCH",
      83: "TRANSPOSE",
      84: "ERROR",
      85: "STEP",
      86: "TYPE",
      87: "ECHO",
      88: "SET.NAME",
      89: "CALLER",
      90: "DEREF",
      91: "WINDOWS",
      92: "SERIES",
      93: "DOCUMENTS",
      94: "ACTIVE.CELL",
      95: "SELECTION",
      96: "RESULT",
      97: "ATAN2",
      98: "ASIN",
      99: "ACOS",
      100: "CHOOSE",
      101: "HLOOKUP",
      102: "VLOOKUP",
      103: "LINKS",
      104: "INPUT",
      105: "ISREF",
      106: "GET.FORMULA",
      107: "GET.NAME",
      108: "SET.VALUE",
      109: "LOG",
      110: "EXEC",
      111: "CHAR",
      112: "LOWER",
      113: "UPPER",
      114: "PROPER",
      115: "LEFT",
      116: "RIGHT",
      117: "EXACT",
      118: "TRIM",
      119: "REPLACE",
      120: "SUBSTITUTE",
      121: "CODE",
      122: "NAMES",
      123: "DIRECTORY",
      124: "FIND",
      125: "CELL",
      126: "ISERR",
      127: "ISTEXT",
      128: "ISNUMBER",
      129: "ISBLANK",
      130: "T",
      131: "N",
      132: "FOPEN",
      133: "FCLOSE",
      134: "FSIZE",
      135: "FREADLN",
      136: "FREAD",
      137: "FWRITELN",
      138: "FWRITE",
      139: "FPOS",
      140: "DATEVALUE",
      141: "TIMEVALUE",
      142: "SLN",
      143: "SYD",
      144: "DDB",
      145: "GET.DEF",
      146: "REFTEXT",
      147: "TEXTREF",
      148: "INDIRECT",
      149: "REGISTER",
      150: "CALL",
      151: "ADD.BAR",
      152: "ADD.MENU",
      153: "ADD.COMMAND",
      154: "ENABLE.COMMAND",
      155: "CHECK.COMMAND",
      156: "RENAME.COMMAND",
      157: "SHOW.BAR",
      158: "DELETE.MENU",
      159: "DELETE.COMMAND",
      160: "GET.CHART.ITEM",
      161: "DIALOG.BOX",
      162: "CLEAN",
      163: "MDETERM",
      164: "MINVERSE",
      165: "MMULT",
      166: "FILES",
      167: "IPMT",
      168: "PPMT",
      169: "COUNTA",
      170: "CANCEL.KEY",
      171: "FOR",
      172: "WHILE",
      173: "BREAK",
      174: "NEXT",
      175: "INITIATE",
      176: "REQUEST",
      177: "POKE",
      178: "EXECUTE",
      179: "TERMINATE",
      180: "RESTART",
      181: "HELP",
      182: "GET.BAR",
      183: "PRODUCT",
      184: "FACT",
      185: "GET.CELL",
      186: "GET.WORKSPACE",
      187: "GET.WINDOW",
      188: "GET.DOCUMENT",
      189: "DPRODUCT",
      190: "ISNONTEXT",
      191: "GET.NOTE",
      192: "NOTE",
      193: "STDEVP",
      194: "VARP",
      195: "DSTDEVP",
      196: "DVARP",
      197: "TRUNC",
      198: "ISLOGICAL",
      199: "DCOUNTA",
      200: "DELETE.BAR",
      201: "UNREGISTER",
      204: "USDOLLAR",
      205: "FINDB",
      206: "SEARCHB",
      207: "REPLACEB",
      208: "LEFTB",
      209: "RIGHTB",
      210: "MIDB",
      211: "LENB",
      212: "ROUNDUP",
      213: "ROUNDDOWN",
      214: "ASC",
      215: "DBCS",
      216: "RANK",
      219: "ADDRESS",
      220: "DAYS360",
      221: "TODAY",
      222: "VDB",
      223: "ELSE",
      224: "ELSE.IF",
      225: "END.IF",
      226: "FOR.CELL",
      227: "MEDIAN",
      228: "SUMPRODUCT",
      229: "SINH",
      230: "COSH",
      231: "TANH",
      232: "ASINH",
      233: "ACOSH",
      234: "ATANH",
      235: "DGET",
      236: "CREATE.OBJECT",
      237: "VOLATILE",
      238: "LAST.ERROR",
      239: "CUSTOM.UNDO",
      240: "CUSTOM.REPEAT",
      241: "FORMULA.CONVERT",
      242: "GET.LINK.INFO",
      243: "TEXT.BOX",
      244: "INFO",
      245: "GROUP",
      246: "GET.OBJECT",
      247: "DB",
      248: "PAUSE",
      251: "RESUME",
      252: "FREQUENCY",
      253: "ADD.TOOLBAR",
      254: "DELETE.TOOLBAR",
      255: "User",
      256: "RESET.TOOLBAR",
      257: "EVALUATE",
      258: "GET.TOOLBAR",
      259: "GET.TOOL",
      260: "SPELLING.CHECK",
      261: "ERROR.TYPE",
      262: "APP.TITLE",
      263: "WINDOW.TITLE",
      264: "SAVE.TOOLBAR",
      265: "ENABLE.TOOL",
      266: "PRESS.TOOL",
      267: "REGISTER.ID",
      268: "GET.WORKBOOK",
      269: "AVEDEV",
      270: "BETADIST",
      271: "GAMMALN",
      272: "BETAINV",
      273: "BINOMDIST",
      274: "CHIDIST",
      275: "CHIINV",
      276: "COMBIN",
      277: "CONFIDENCE",
      278: "CRITBINOM",
      279: "EVEN",
      280: "EXPONDIST",
      281: "FDIST",
      282: "FINV",
      283: "FISHER",
      284: "FISHERINV",
      285: "FLOOR",
      286: "GAMMADIST",
      287: "GAMMAINV",
      288: "CEILING",
      289: "HYPGEOMDIST",
      290: "LOGNORMDIST",
      291: "LOGINV",
      292: "NEGBINOMDIST",
      293: "NORMDIST",
      294: "NORMSDIST",
      295: "NORMINV",
      296: "NORMSINV",
      297: "STANDARDIZE",
      298: "ODD",
      299: "PERMUT",
      300: "POISSON",
      301: "TDIST",
      302: "WEIBULL",
      303: "SUMXMY2",
      304: "SUMX2MY2",
      305: "SUMX2PY2",
      306: "CHITEST",
      307: "CORREL",
      308: "COVAR",
      309: "FORECAST",
      310: "FTEST",
      311: "INTERCEPT",
      312: "PEARSON",
      313: "RSQ",
      314: "STEYX",
      315: "SLOPE",
      316: "TTEST",
      317: "PROB",
      318: "DEVSQ",
      319: "GEOMEAN",
      320: "HARMEAN",
      321: "SUMSQ",
      322: "KURT",
      323: "SKEW",
      324: "ZTEST",
      325: "LARGE",
      326: "SMALL",
      327: "QUARTILE",
      328: "PERCENTILE",
      329: "PERCENTRANK",
      330: "MODE",
      331: "TRIMMEAN",
      332: "TINV",
      334: "MOVIE.COMMAND",
      335: "GET.MOVIE",
      336: "CONCATENATE",
      337: "POWER",
      338: "PIVOT.ADD.DATA",
      339: "GET.PIVOT.TABLE",
      340: "GET.PIVOT.FIELD",
      341: "GET.PIVOT.ITEM",
      342: "RADIANS",
      343: "DEGREES",
      344: "SUBTOTAL",
      345: "SUMIF",
      346: "COUNTIF",
      347: "COUNTBLANK",
      348: "SCENARIO.GET",
      349: "OPTIONS.LISTS.GET",
      350: "ISPMT",
      351: "DATEDIF",
      352: "DATESTRING",
      353: "NUMBERSTRING",
      354: "ROMAN",
      355: "OPEN.DIALOG",
      356: "SAVE.DIALOG",
      357: "VIEW.GET",
      358: "GETPIVOTDATA",
      359: "HYPERLINK",
      360: "PHONETIC",
      361: "AVERAGEA",
      362: "MAXA",
      363: "MINA",
      364: "STDEVPA",
      365: "VARPA",
      366: "STDEVA",
      367: "VARA",
      368: "BAHTTEXT",
      369: "THAIDAYOFWEEK",
      370: "THAIDIGIT",
      371: "THAIMONTHOFYEAR",
      372: "THAINUMSOUND",
      373: "THAINUMSTRING",
      374: "THAISTRINGLENGTH",
      375: "ISTHAIDIGIT",
      376: "ROUNDBAHTDOWN",
      377: "ROUNDBAHTUP",
      378: "THAIYEAR",
      379: "RTD",
      380: "CUBEVALUE",
      381: "CUBEMEMBER",
      382: "CUBEMEMBERPROPERTY",
      383: "CUBERANKEDMEMBER",
      384: "HEX2BIN",
      385: "HEX2DEC",
      386: "HEX2OCT",
      387: "DEC2BIN",
      388: "DEC2HEX",
      389: "DEC2OCT",
      390: "OCT2BIN",
      391: "OCT2HEX",
      392: "OCT2DEC",
      393: "BIN2DEC",
      394: "BIN2OCT",
      395: "BIN2HEX",
      396: "IMSUB",
      397: "IMDIV",
      398: "IMPOWER",
      399: "IMABS",
      400: "IMSQRT",
      401: "IMLN",
      402: "IMLOG2",
      403: "IMLOG10",
      404: "IMSIN",
      405: "IMCOS",
      406: "IMEXP",
      407: "IMARGUMENT",
      408: "IMCONJUGATE",
      409: "IMAGINARY",
      410: "IMREAL",
      411: "COMPLEX",
      412: "IMSUM",
      413: "IMPRODUCT",
      414: "SERIESSUM",
      415: "FACTDOUBLE",
      416: "SQRTPI",
      417: "QUOTIENT",
      418: "DELTA",
      419: "GESTEP",
      420: "ISEVEN",
      421: "ISODD",
      422: "MROUND",
      423: "ERF",
      424: "ERFC",
      425: "BESSELJ",
      426: "BESSELK",
      427: "BESSELY",
      428: "BESSELI",
      429: "XIRR",
      430: "XNPV",
      431: "PRICEMAT",
      432: "YIELDMAT",
      433: "INTRATE",
      434: "RECEIVED",
      435: "DISC",
      436: "PRICEDISC",
      437: "YIELDDISC",
      438: "TBILLEQ",
      439: "TBILLPRICE",
      440: "TBILLYIELD",
      441: "PRICE",
      442: "YIELD",
      443: "DOLLARDE",
      444: "DOLLARFR",
      445: "NOMINAL",
      446: "EFFECT",
      447: "CUMPRINC",
      448: "CUMIPMT",
      449: "EDATE",
      450: "EOMONTH",
      451: "YEARFRAC",
      452: "COUPDAYBS",
      453: "COUPDAYS",
      454: "COUPDAYSNC",
      455: "COUPNCD",
      456: "COUPNUM",
      457: "COUPPCD",
      458: "DURATION",
      459: "MDURATION",
      460: "ODDLPRICE",
      461: "ODDLYIELD",
      462: "ODDFPRICE",
      463: "ODDFYIELD",
      464: "RANDBETWEEN",
      465: "WEEKNUM",
      466: "AMORDEGRC",
      467: "AMORLINC",
      468: "CONVERT",
      724: "SHEETJS",
      469: "ACCRINT",
      470: "ACCRINTM",
      471: "WORKDAY",
      472: "NETWORKDAYS",
      473: "GCD",
      474: "MULTINOMIAL",
      475: "LCM",
      476: "FVSCHEDULE",
      477: "CUBEKPIMEMBER",
      478: "CUBESET",
      479: "CUBESETCOUNT",
      480: "IFERROR",
      481: "COUNTIFS",
      482: "SUMIFS",
      483: "AVERAGEIF",
      484: "AVERAGEIFS",
    },
    jc = {
      2: 1,
      3: 1,
      10: 0,
      15: 1,
      16: 1,
      17: 1,
      18: 1,
      19: 0,
      20: 1,
      21: 1,
      22: 1,
      23: 1,
      24: 1,
      25: 1,
      26: 1,
      27: 2,
      30: 2,
      31: 3,
      32: 1,
      33: 1,
      34: 0,
      35: 0,
      38: 1,
      39: 2,
      40: 3,
      41: 3,
      42: 3,
      43: 3,
      44: 3,
      45: 3,
      47: 3,
      48: 2,
      53: 1,
      61: 3,
      63: 0,
      65: 3,
      66: 3,
      67: 1,
      68: 1,
      69: 1,
      70: 1,
      71: 1,
      72: 1,
      73: 1,
      74: 0,
      75: 1,
      76: 1,
      77: 1,
      79: 2,
      80: 2,
      83: 1,
      85: 0,
      86: 1,
      89: 0,
      90: 1,
      94: 0,
      95: 0,
      97: 2,
      98: 1,
      99: 1,
      101: 3,
      102: 3,
      105: 1,
      106: 1,
      108: 2,
      111: 1,
      112: 1,
      113: 1,
      114: 1,
      117: 2,
      118: 1,
      119: 4,
      121: 1,
      126: 1,
      127: 1,
      128: 1,
      129: 1,
      130: 1,
      131: 1,
      133: 1,
      134: 1,
      135: 1,
      136: 2,
      137: 2,
      138: 2,
      140: 1,
      141: 1,
      142: 3,
      143: 4,
      144: 4,
      161: 1,
      162: 1,
      163: 1,
      164: 1,
      165: 2,
      172: 1,
      175: 2,
      176: 2,
      177: 3,
      178: 2,
      179: 1,
      184: 1,
      186: 1,
      189: 3,
      190: 1,
      195: 3,
      196: 3,
      197: 1,
      198: 1,
      199: 3,
      201: 1,
      207: 4,
      210: 3,
      211: 1,
      212: 2,
      213: 2,
      214: 1,
      215: 1,
      225: 0,
      229: 1,
      230: 1,
      231: 1,
      232: 1,
      233: 1,
      234: 1,
      235: 3,
      244: 1,
      247: 4,
      252: 2,
      257: 1,
      261: 1,
      271: 1,
      273: 4,
      274: 2,
      275: 2,
      276: 2,
      277: 3,
      278: 3,
      279: 1,
      280: 3,
      281: 3,
      282: 3,
      283: 1,
      284: 1,
      285: 2,
      286: 4,
      287: 3,
      288: 2,
      289: 4,
      290: 3,
      291: 3,
      292: 3,
      293: 4,
      294: 1,
      295: 3,
      296: 1,
      297: 3,
      298: 1,
      299: 2,
      300: 3,
      301: 3,
      302: 4,
      303: 2,
      304: 2,
      305: 2,
      306: 2,
      307: 2,
      308: 2,
      309: 3,
      310: 2,
      311: 2,
      312: 2,
      313: 2,
      314: 2,
      315: 2,
      316: 4,
      325: 2,
      326: 2,
      327: 2,
      328: 2,
      331: 2,
      332: 2,
      337: 2,
      342: 1,
      343: 1,
      346: 2,
      347: 1,
      350: 4,
      351: 3,
      352: 1,
      353: 2,
      360: 1,
      368: 1,
      369: 1,
      370: 1,
      371: 1,
      372: 1,
      373: 1,
      374: 1,
      375: 1,
      376: 1,
      377: 1,
      378: 1,
      382: 3,
      385: 1,
      392: 1,
      393: 1,
      396: 2,
      397: 2,
      398: 2,
      399: 1,
      400: 1,
      401: 1,
      402: 1,
      403: 1,
      404: 1,
      405: 1,
      406: 1,
      407: 1,
      408: 1,
      409: 1,
      410: 1,
      414: 4,
      415: 1,
      416: 1,
      417: 2,
      420: 1,
      421: 1,
      422: 2,
      424: 1,
      425: 2,
      426: 2,
      427: 2,
      428: 2,
      430: 3,
      438: 3,
      439: 3,
      440: 3,
      443: 2,
      444: 2,
      445: 2,
      446: 2,
      447: 6,
      448: 6,
      449: 2,
      450: 2,
      464: 2,
      468: 3,
      476: 2,
      479: 1,
      480: 2,
      65535: 0,
    };
  function $c(e) {
    return (e = (e = (e = (e =
      61 == (e = "of:" == e.slice(0, 3) ? e.slice(3) : e).charCodeAt(0) &&
      61 == (e = e.slice(1)).charCodeAt(0)
        ? e.slice(1)
        : e).replace(/COM\.MICROSOFT\./g, "")).replace(
      /\[((?:\.[A-Z]+[0-9]+)(?::\.[A-Z]+[0-9]+)?)\]/g,
      function (e, t) {
        return t.replace(/\./g, "");
      },
    )).replace(/\[.(#[A-Z]*[?!])\]/g, "$1"))
      .replace(/[;~]/g, ",")
      .replace(/\|/g, ";");
  }
  function Xc(e) {
    e = e.split(":");
    return [
      e[0].split(".")[0],
      e[0].split(".")[1] +
        (1 < e.length ? ":" + (e[1].split(".")[1] || e[1].split(".")[0]) : ""),
    ];
  }
  var Yc = {},
    Kc = {},
    Jc = "undefined" != typeof Map;
  function qc(e, t, r) {
    var a = 0,
      n = e.length;
    if (r) {
      if (Jc ? r.has(t) : Object.prototype.hasOwnProperty.call(r, t))
        for (var s = Jc ? r.get(t) : r[t]; a < s.length; ++a)
          if (e[s[a]].t === t) return e.Count++, s[a];
    } else for (; a < n; ++a) if (e[a].t === t) return e.Count++, a;
    return (
      (e[n] = { t: t }),
      e.Count++,
      e.Unique++,
      r &&
        (Jc
          ? (r.has(t) || r.set(t, []), r.get(t).push(n))
          : (Object.prototype.hasOwnProperty.call(r, t) || (r[t] = []),
            r[t].push(n))),
      n
    );
  }
  function Zc(e, t) {
    var r = { min: e + 1, max: e + 1 },
      e = -1;
    return (
      t.MDW && (no = t.MDW),
      null != t.width
        ? (r.customWidth = 1)
        : null != t.wpx
        ? (e = io(t.wpx))
        : null != t.wch && (e = t.wch),
      -1 < e
        ? ((r.width = oo(e)), (r.customWidth = 1))
        : null != t.width && (r.width = t.width),
      t.hidden && (r.hidden = !0),
      null != t.level && (r.outlineLevel = r.level = t.level),
      r
    );
  }
  function Qc(e, t) {
    e &&
      ((t =
        "xlml" == t
          ? [1, 1, 1, 1, 0.5, 0.5]
          : [0.7, 0.7, 0.75, 0.75, 0.3, 0.3]),
      null == e.left && (e.left = t[0]),
      null == e.right && (e.right = t[1]),
      null == e.top && (e.top = t[2]),
      null == e.bottom && (e.bottom = t[3]),
      null == e.header && (e.header = t[4]),
      null == e.footer && (e.footer = t[5]));
  }
  function el(e, t, r) {
    if (void 0 !== yo) {
      if (/^\d+$/.exec(t.s)) return t.s;
      if (t.s && t.s == +t.s) return t.s;
      var a = t.s || {};
      return t.z && (a.numFmt = t.z), yo.addStyle(a);
    }
    var n = r.revssf[null != t.z ? t.z : "General"],
      s = 60,
      i = e.length;
    if (null == n && r.ssf)
      for (; s < 392; ++s)
        if (null == r.ssf[s]) {
          we(t.z, s), (r.ssf[s] = t.z), (r.revssf[t.z] = n = s);
          break;
        }
    for (s = 0; s != i; ++s) if (e[s].numFmtId === n) return s;
    return (
      (e[i] = {
        numFmtId: n,
        fontId: 0,
        fillId: 0,
        borderId: 0,
        xfId: 0,
        applyNumberFormat: 1,
      }),
      i
    );
  }
  function tl(e, t, r, a, n, s) {
    try {
      a.cellNF && (e.z = me[t]);
    } catch (e) {
      if (a.WTF) throw e;
    }
    if ("z" !== e.t || a.cellStyles) {
      if (
        ("d" === e.t && "string" == typeof e.v && (e.v = He(e.v)),
        (!a || !1 !== a.cellText) && "z" !== e.t)
      )
        try {
          if ((null == me[t] && we(ke[t] || "General", t), "e" === e.t))
            e.w = e.w || Wa[e.v];
          else if (0 === t)
            if ("n" === e.t)
              (0 | e.v) === e.v ? (e.w = e.v.toString(10)) : (e.w = D(e.v));
            else if ("d" === e.t) {
              var i = De(e.v);
              e.w = (0 | i) === i ? i.toString(10) : D(i);
            } else {
              if (void 0 === e.v) return;
              e.w = P(e.v, Kc);
            }
          else
            "d" === e.t ? (e.w = ve(t, De(e.v), Kc)) : (e.w = ve(t, e.v, Kc));
        } catch (e) {
          if (a.WTF) throw e;
        }
      if (a.cellStyles && null != r)
        try {
          (e.s = s.Fills[r]),
            e.s.fgColor &&
              e.s.fgColor.theme &&
              !e.s.fgColor.rgb &&
              ((e.s.fgColor.rgb = eo(
                n.themeElements.clrScheme[e.s.fgColor.theme].rgb,
                e.s.fgColor.tint || 0,
              )),
              a.WTF &&
                (e.s.fgColor.raw_rgb =
                  n.themeElements.clrScheme[e.s.fgColor.theme].rgb)),
            e.s.bgColor &&
              e.s.bgColor.theme &&
              ((e.s.bgColor.rgb = eo(
                n.themeElements.clrScheme[e.s.bgColor.theme].rgb,
                e.s.bgColor.tint || 0,
              )),
              a.WTF &&
                (e.s.bgColor.raw_rgb =
                  n.themeElements.clrScheme[e.s.bgColor.theme].rgb));
        } catch (e) {
          if (a.WTF && s.Fills) throw e;
        }
    }
  }
  var rl = /<(?:\w:)?mergeCell ref="[A-Z0-9:]+"\s*[\/]?>/g,
    al = /<(?:\w+:)?sheetData[^>]*>([\s\S]*)<\/(?:\w+:)?sheetData>/,
    nl = /<(?:\w:)?hyperlink [^>]*>/gm,
    sl = /"(\w*:\w*)"/,
    il = /<(?:\w:)?col\b[^>]*[\/]?>/g,
    ol = /<(?:\w:)?autoFilter[^>]*([\/]|>([\s\S]*)<\/(?:\w:)?autoFilter)>/g,
    cl = /<(?:\w:)?pageMargins[^>]*\/>/g,
    ll = /<(?:\w:)?sheetPr\b(?:[^>a-z][^>]*)?\/>/,
    fl = /<(?:\w:)?sheetPr[^>]*(?:[\/]|>([\s\S]*)<\/(?:\w:)?sheetPr)>/,
    hl = /<(?:\w:)?sheetViews[^>]*(?:[\/]|>([\s\S]*)<\/(?:\w:)?sheetViews)>/;
  function ul(e, t, r, a, n, s, i) {
    if (!e) return e;
    (a = a || { "!id": {} }), null != oe && null == t.dense && (t.dense = oe);
    var o = t.dense ? [] : {},
      c = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } },
      l = "",
      f = "",
      h = e.match(al);
    h
      ? ((l = e.slice(0, h.index)), (f = e.slice(h.index + h[0].length)))
      : (l = f = e);
    var u = l.match(ll);
    u
      ? dl(u[0], 0, n, r)
      : (u = l.match(fl)) &&
        ((e = u[0]),
        u[1],
        (u = o),
        (d = n),
        (p = r),
        dl(e.slice(0, e.indexOf(">")), 0, d, p));
    var d,
      p,
      m = (l.match(/<(?:\w*:)?dimension/) || { index: -1 }).index;
    0 < m &&
      (d = l.slice(m, m + 50).match(sl)) &&
      ((p = o),
      (b = Zr((b = d[1]))).s.r <= b.e.r &&
        b.s.c <= b.e.c &&
        0 <= b.s.r &&
        0 <= b.s.c &&
        (p["!ref"] = qr(b)));
    var g,
      b = l.match(hl);
    b &&
      b[1] &&
      ((w = b[1]),
      (g = n).Views || (g.Views = [{}]),
      (w.match(gl) || []).forEach(function (e, t) {
        e = dt(e);
        g.Views[t] || (g.Views[t] = {}),
          +e.zoomScale && (g.Views[t].zoom = +e.zoomScale),
          Rt(e.rightToLeft) && (g.Views[t].RTL = !0);
      }));
    var v,
      w = [];
    t.cellStyles &&
      (v = l.match(il)) &&
      (function (e, t) {
        for (var r = !1, a = 0; a != t.length; ++a) {
          var n = dt(t[a], !0);
          n.hidden && (n.hidden = Rt(n.hidden));
          var s = parseInt(n.min, 10) - 1,
            i = parseInt(n.max, 10) - 1;
          for (
            n.outlineLevel && (n.level = +n.outlineLevel || 0),
              delete n.min,
              delete n.max,
              n.width = +n.width,
              !r && n.width && ((r = !0), lo(n.width)),
              fo(n);
            s <= i;

          )
            e[s++] = Ve(n);
        }
      })(w, v),
      h && Sl(h[1], o, t, c, s, i);
    i = f.match(ol);
    i && (o["!autofilter"] = { ref: (i[0].match(/ref="([^"]*)"/) || [])[1] });
    var T = [],
      E = f.match(rl);
    if (E)
      for (m = 0; m != E.length; ++m)
        T[m] = Zr(E[m].slice(E[m].indexOf('"') + 1));
    i = f.match(nl);
    i &&
      (function (e, t, r) {
        for (var a = Array.isArray(e), n = 0; n != t.length; ++n) {
          var s = dt(Mt(t[n]), !0);
          if (!s.ref) return;
          var i = ((r || {})["!id"] || [])[s.id];
          i
            ? ((s.Target = i.Target),
              s.location && (s.Target += "#" + wt(s.location)))
            : ((s.Target = "#" + wt(s.location)),
              (i = { Target: s.Target, TargetMode: "Internal" })),
            (s.Rel = i),
            s.tooltip && ((s.Tooltip = s.tooltip), delete s.tooltip);
          for (var o = Zr(s.ref), c = o.s.r; c <= o.e.r; ++c)
            for (var l = o.s.c; l <= o.e.c; ++l) {
              var f = Kr({ c: l, r: c });
              a
                ? (e[c] || (e[c] = []),
                  e[c][l] || (e[c][l] = { t: "z", v: void 0 }),
                  (e[c][l].l = s))
                : (e[f] || (e[f] = { t: "z", v: void 0 }), (e[f].l = s));
            }
        }
      })(o, i, a);
    var k,
      y,
      f = f.match(cl);
    return (
      f &&
        (o["!margins"] =
          ((k = dt(f[0])),
          (y = {}),
          ["left", "right", "top", "bottom", "header", "footer"].forEach(
            function (e) {
              k[e] && (y[e] = parseFloat(k[e]));
            },
          ),
          y)),
      !o["!ref"] && c.e.c >= c.s.c && c.e.r >= c.s.r && (o["!ref"] = qr(c)),
      0 < t.sheetRows &&
        o["!ref"] &&
        ((f = Zr(o["!ref"])),
        t.sheetRows <= +f.e.r &&
          ((f.e.r = t.sheetRows - 1),
          f.e.r > c.e.r && (f.e.r = c.e.r),
          f.e.r < f.s.r && (f.s.r = f.e.r),
          f.e.c > c.e.c && (f.e.c = c.e.c),
          f.e.c < f.s.c && (f.s.c = f.e.c),
          (o["!fullref"] = o["!ref"]),
          (o["!ref"] = qr(f)))),
      0 < w.length && (o["!cols"] = w),
      0 < T.length && (o["!merges"] = T),
      o
    );
  }
  function dl(e, t, r, a) {
    e = dt(e);
    r.Sheets[a] || (r.Sheets[a] = {}),
      e.codeName && (r.Sheets[a].CodeName = wt(Mt(e.codeName)));
  }
  var pl = ["objects", "scenarios", "selectLockedCells", "selectUnlockedCells"],
    ml = [
      "formatColumns",
      "formatRows",
      "formatCells",
      "insertColumns",
      "insertRows",
      "insertHyperlinks",
      "deleteColumns",
      "deleteRows",
      "sort",
      "autoFilter",
      "pivotTables",
    ];
  var gl = /<(?:\w:)?sheetView(?:[^>a-z][^>]*)?\/?>/;
  var bl,
    vl,
    wl,
    Tl,
    El,
    kl,
    yl,
    Sl =
      ((bl = /<(?:\w+:)?c[ \/>]/),
      (vl = /<\/(?:\w+:)?row>/),
      (wl = /r=["']([^"']*)["']/),
      (Tl = /<(?:\w+:)?is>([\S\s]*?)<\/(?:\w+:)?is>/),
      (El = /ref=["']([^"']*)["']/),
      (kl = Bt("v")),
      (yl = Bt("f")),
      function (e, t, r, a, n, s) {
        for (
          var i,
            o,
            c,
            l,
            f,
            h,
            u = 0,
            d = "",
            p = [],
            m = [],
            g = 0,
            b = 0,
            v = "",
            w = 0,
            T = 0,
            E = 0,
            k = 0,
            y = Array.isArray(s.CellXf),
            S = [],
            _ = [],
            x = Array.isArray(t),
            A = [],
            C = {},
            R = !1,
            O = !!r.sheetStubs,
            I = e.split(vl),
            N = 0,
            F = I.length;
          N != F;
          ++N
        ) {
          var D = (d = I[N].trim()).length;
          if (0 !== D) {
            var P = 0;
            e: for (u = 0; u < D; ++u)
              switch (d[u]) {
                case ">":
                  if ("/" != d[u - 1]) {
                    ++u;
                    break e;
                  }
                  if (r && r.cellStyles) {
                    if (
                      ((w =
                        null != (c = dt(d.slice(P, u), !0)).r
                          ? parseInt(c.r, 10)
                          : w + 1),
                      (T = -1),
                      r.sheetRows && r.sheetRows < w)
                    )
                      continue;
                    (R = !(C = {})),
                      c.ht &&
                        ((R = !0),
                        (C.hpt = parseFloat(c.ht)),
                        (C.hpx = po(C.hpt))),
                      "1" == c.hidden && ((R = !0), (C.hidden = !0)),
                      null != c.outlineLevel &&
                        ((R = !0), (C.level = +c.outlineLevel)),
                      R && (A[w - 1] = C);
                  }
                  break;
                case "<":
                  P = u;
              }
            if (u <= P) break;
            if (
              ((w =
                null != (c = dt(d.slice(P, u), !0)).r
                  ? parseInt(c.r, 10)
                  : w + 1),
              (T = -1),
              !(r.sheetRows && r.sheetRows < w))
            ) {
              a.s.r > w - 1 && (a.s.r = w - 1),
                a.e.r < w - 1 && (a.e.r = w - 1),
                r &&
                  r.cellStyles &&
                  ((R = !(C = {})),
                  c.ht &&
                    ((R = !0), (C.hpt = parseFloat(c.ht)), (C.hpx = po(C.hpt))),
                  "1" == c.hidden && ((R = !0), (C.hidden = !0)),
                  null != c.outlineLevel &&
                    ((R = !0), (C.level = +c.outlineLevel)),
                  R && (A[w - 1] = C)),
                (p = d.slice(u).split(bl));
              for (
                var L, M = 0;
                M != p.length && "<" == p[M].trim().charAt(0);
                ++M
              );
              for (p = p.slice(M), u = 0; u != p.length; ++u)
                if (0 !== (d = p[u].trim()).length) {
                  if (
                    ((m = d.match(wl)),
                    (g = u),
                    (b = 0),
                    (d = "<c " + ("<" == d.slice(0, 1) ? ">" : "") + d),
                    null != m && 2 === m.length)
                  ) {
                    for (
                      g = 0, v = m[1], b = 0;
                      b != v.length &&
                      !((i = v.charCodeAt(b) - 64) < 1 || 26 < i);
                      ++b
                    )
                      g = 26 * g + i;
                    T = --g;
                  } else ++T;
                  for (b = 0; b != d.length && 62 !== d.charCodeAt(b); ++b);
                  if (
                    (++b,
                    (c = dt(d.slice(0, b), !0)).r ||
                      (c.r = Kr({ r: w - 1, c: T })),
                    (o = { t: "" }),
                    null != (m = (v = d.slice(b)).match(kl)) &&
                      "" !== m[1] &&
                      (o.v = wt(m[1])),
                    r.cellFormula)
                  ) {
                    null != (m = v.match(yl)) && "" !== m[1]
                      ? ((o.f = wt(Mt(m[1])).replace(/\r\n/g, "\n")),
                        r.xlfn || (o.f = uc(o.f)),
                        -1 < m[0].indexOf('t="array"')
                          ? ((o.F = (v.match(El) || [])[1]),
                            -1 < o.F.indexOf(":") && S.push([Zr(o.F), o.F]))
                          : -1 < m[0].indexOf('t="shared"') &&
                            ((f = dt(m[0])),
                            (L = wt(Mt(m[1]))),
                            r.xlfn || (L = uc(L)),
                            (_[parseInt(f.si, 10)] = [f, L, c.r])))
                      : (m = v.match(/<f[^>]*\/>/)) &&
                        _[(f = dt(m[0])).si] &&
                        (o.f =
                          ((h = _[f.si][1]),
                          (W = _[f.si][2]),
                          (L = c.r),
                          (W = Jr(W).s),
                          (L = Yr(L)),
                          hc(h, { r: L.r - W.r, c: L.c - W.c })));
                    for (var U = Yr(c.r), b = 0; b < S.length; ++b)
                      U.r >= S[b][0].s.r &&
                        U.r <= S[b][0].e.r &&
                        U.c >= S[b][0].s.c &&
                        U.c <= S[b][0].e.c &&
                        (o.F = S[b][1]);
                  }
                  if (null == c.t && void 0 === o.v)
                    if (o.f || o.F) (o.v = 0), (o.t = "n");
                    else {
                      if (!O) continue;
                      o.t = "z";
                    }
                  else o.t = c.t || "n";
                  switch (
                    (a.s.c > T && (a.s.c = T), a.e.c < T && (a.e.c = T), o.t)
                  ) {
                    case "n":
                      if ("" == o.v || null == o.v) {
                        if (!O) continue;
                        o.t = "z";
                      } else o.v = parseFloat(o.v);
                      break;
                    case "s":
                      if (void 0 === o.v) {
                        if (!O) continue;
                        o.t = "z";
                      } else
                        (l = Yc[parseInt(o.v, 10)]),
                          (o.v = l.t),
                          (o.r = l.r),
                          r.cellHTML && (o.h = l.h);
                      break;
                    case "str":
                      (o.t = "s"),
                        (o.v = null != o.v ? Mt(o.v) : ""),
                        r.cellHTML && (o.h = _t(o.v));
                      break;
                    case "inlineStr":
                      (m = v.match(Tl)),
                        (o.t = "s"),
                        null != m && (l = Ai(m[1]))
                          ? ((o.v = l.t), r.cellHTML && (o.h = l.h))
                          : (o.v = "");
                      break;
                    case "b":
                      o.v = Rt(o.v);
                      break;
                    case "d":
                      r.cellDates
                        ? (o.v = He(o.v, 1))
                        : ((o.v = De(He(o.v, 1))), (o.t = "n"));
                      break;
                    case "e":
                      (r && !1 === r.cellText) || (o.w = o.v), (o.v = Ha[o.v]);
                  }
                  var B,
                    E = (k = 0),
                    W = null;
                  y &&
                    void 0 !== c.s &&
                    null != (W = s.CellXf[c.s]) &&
                    (null != W.numFmtId && (E = W.numFmtId),
                    r.cellStyles && null != W.fillId && (k = W.fillId)),
                    tl(o, E, k, r, n, s),
                    r.cellDates &&
                      y &&
                      "n" == o.t &&
                      q(me[E]) &&
                      ((o.t = "d"), (o.v = Me(o.v))),
                    c.cm &&
                      r.xlmeta &&
                      (B = (r.xlmeta.Cell || [])[+c.cm - 1]) &&
                      "XLDAPR" == B.type &&
                      (o.D = !0),
                    x
                      ? (t[(B = Yr(c.r)).r] || (t[B.r] = []), (t[B.r][B.c] = o))
                      : (t[c.r] = o);
                }
            }
          }
        }
        0 < A.length && (t["!rows"] = A);
      });
  function _l(e, t) {
    for (
      var r,
        a,
        n,
        s,
        i = [],
        o = [],
        c = Zr(e["!ref"]),
        l = [],
        f = 0,
        h = 0,
        u = e["!rows"],
        d = Array.isArray(e),
        p = { r: "" },
        m = -1,
        h = c.s.c;
      h <= c.e.c;
      ++h
    )
      l[h] = Xr(h);
    for (f = c.s.r; f <= c.e.r; ++f) {
      for (o = [], n = jr(f), h = c.s.c; h <= c.e.c; ++h) {
        a = l[h] + n;
        var g = d ? (e[f] || [])[h] : e[a];
        void 0 !== g &&
          null !=
            (r = (function (e, t, r, a) {
              if (
                (e.c && r["!comments"].push([t, e.c]),
                (void 0 === e.v && "string" != typeof e.f) ||
                  ("z" === e.t && !e.f))
              )
                return "";
              var n = "",
                s = e.t,
                i = e.v;
              if ("z" !== e.t)
                switch (e.t) {
                  case "b":
                    n = e.v ? "1" : "0";
                    break;
                  case "n":
                    n = "" + e.v;
                    break;
                  case "e":
                    n = Wa[e.v];
                    break;
                  case "d":
                    (n =
                      a && a.cellDates
                        ? He(e.v, -1).toISOString()
                        : (((e = Ve(e)).t = "n"), "" + (e.v = De(He(e.v))))),
                      void 0 === e.z && (e.z = me[14]);
                    break;
                  default:
                    n = e.v;
                }
              var o = $t("v", kt(n)),
                c = { r: t },
                l = el(a.cellXfs, e, a);
              switch ((0 !== l && (c.s = l), e.t)) {
                case "n":
                  break;
                case "d":
                  c.t = "d";
                  break;
                case "b":
                  c.t = "b";
                  break;
                case "e":
                  c.t = "e";
                  break;
                case "z":
                  break;
                default:
                  if (null == e.v) {
                    delete e.t;
                    break;
                  }
                  if (32767 < e.v.length)
                    throw new Error(
                      "Text length must not exceed 32767 characters",
                    );
                  if (a && a.bookSST) {
                    (o = $t("v", "" + qc(a.Strings, e.v, a.revStrings))),
                      (c.t = "s");
                    break;
                  }
                  c.t = "str";
              }
              return (
                e.t != s && ((e.t = s), (e.v = i)),
                "string" == typeof e.f &&
                  e.f &&
                  ((i =
                    e.F && e.F.slice(0, t.length) == t
                      ? { t: "array", ref: e.F }
                      : null),
                  (o = Yt("f", kt(e.f), i) + (null != e.v ? o : ""))),
                e.l && r["!links"].push([t, e.l]),
                e.D && (c.cm = 1),
                Yt("c", o, c)
              );
            })(g, a, e, t)) &&
          o.push(r);
      }
      (0 < o.length || (u && u[f])) &&
        ((p = { r: n }),
        u &&
          u[f] &&
          ((s = u[f]).hidden && (p.hidden = 1),
          (m = -1),
          s.hpx ? (m = uo(s.hpx)) : s.hpt && (m = s.hpt),
          -1 < m && ((p.ht = m), (p.customHeight = 1)),
          s.level && (p.outlineLevel = s.level)),
        (i[i.length] = Yt("row", o.join(""), p)));
    }
    if (u)
      for (; f < u.length; ++f)
        u &&
          u[f] &&
          ((p = { r: f + 1 }),
          (s = u[f]).hidden && (p.hidden = 1),
          (m = -1),
          s.hpx ? (m = uo(s.hpx)) : s.hpt && (m = s.hpt),
          -1 < m && ((p.ht = m), (p.customHeight = 1)),
          s.level && (p.outlineLevel = s.level),
          (i[i.length] = Yt("row", "", p)));
    return i.join("");
  }
  function xl(e, t, r, a) {
    var n,
      s,
      i = [ot, Yt("worksheet", null, { xmlns: Qt[0], "xmlns:r": Zt.r })],
      o = r.SheetNames[e],
      c = r.Sheets[o],
      l = (c = null == c ? {} : c)["!ref"] || "A1",
      f = Zr(l);
    if (16383 < f.e.c || 1048575 < f.e.r) {
      if (t.WTF)
        throw new Error("Range " + l + " exceeds format limit A1:XFD1048576");
      (f.e.c = Math.min(f.e.c, 16383)),
        (f.e.r = Math.min(f.e.c, 1048575)),
        (l = qr(f));
    }
    (a = a || {}), (c["!comments"] = []);
    var h,
      u,
      d = [];
    !(function (e, t, r, a, n) {
      var s = !1,
        i = {},
        o = null;
      if ("xlsx" !== a.bookType && t.vbaraw) {
        var c = t.SheetNames[r];
        try {
          t.Workbook && (c = t.Workbook.Sheets[r].CodeName || c);
        } catch (e) {}
        (s = !0), (i.codeName = Ut(kt(c)));
      }
      e &&
        e["!outline"] &&
        ((a = { summaryBelow: 1, summaryRight: 1 }),
        e["!outline"].above && (a.summaryBelow = 0),
        e["!outline"].left && (a.summaryRight = 0),
        (o = (o || "") + Yt("outlinePr", null, a))),
        (s || o) && (n[n.length] = Yt("sheetPr", o, i));
    })(c, r, e, t, i),
      (i[i.length] = Yt("dimension", null, { ref: l })),
      (i[i.length] =
        ((o = { workbookViewId: "0" }),
        ((((f = r) || {}).Workbook || {}).Views || [])[0] &&
          (o.rightToLeft = f.Workbook.Views[0].RTL ? "1" : "0"),
        Yt("sheetViews", Yt("sheetView", null, o), {}))),
      t.sheetFormat &&
        (i[i.length] = Yt("sheetFormatPr", null, {
          defaultRowHeight: t.sheetFormat.defaultRowHeight || "16",
          baseColWidth: t.sheetFormat.baseColWidth || "10",
          outlineLevelRow: t.sheetFormat.outlineLevelRow || "7",
        })),
      null != c["!cols"] &&
        0 < c["!cols"].length &&
        (i[i.length] = (function (e) {
          for (var t, r = ["<cols>"], a = 0; a != e.length; ++a)
            (t = e[a]) && (r[r.length] = Yt("col", null, Zc(a, t)));
          return (r[r.length] = "</cols>"), r.join("");
        })(c["!cols"])),
      (i[(n = i.length)] = "<sheetData/>"),
      (c["!links"] = []),
      null != c["!ref"] && 0 < (s = _l(c, t)).length && (i[i.length] = s),
      i.length > n + 1 &&
        ((i[i.length] = "</sheetData>"), (i[n] = i[n].replace("/>", ">"))),
      c["!protect"] &&
        (i[i.length] =
          ((h = c["!protect"]),
          (u = { sheet: 1 }),
          pl.forEach(function (e) {
            null != h[e] && h[e] && (u[e] = "1");
          }),
          ml.forEach(function (e) {
            null == h[e] || h[e] || (u[e] = "0");
          }),
          h.password &&
            (u.password = zi(h.password).toString(16).toUpperCase()),
          Yt("sheetProtection", null, u))),
      null != c["!autofilter"] &&
        (i[i.length] = (function (e, t, r, a) {
          var n = "string" == typeof e.ref ? e.ref : qr(e.ref);
          r.Workbook || (r.Workbook = { Sheets: [] }),
            r.Workbook.Names || (r.Workbook.Names = []);
          var s = r.Workbook.Names;
          (e = Jr(n)).s.r == e.e.r &&
            ((e.e.r = Jr(t["!ref"]).e.r), (n = qr(e)));
          for (var i = 0; i < s.length; ++i) {
            var o = s[i];
            if ("_xlnm._FilterDatabase" == o.Name && o.Sheet == a) {
              o.Ref = "'" + r.SheetNames[a] + "'!" + n;
              break;
            }
          }
          return (
            i == s.length &&
              s.push({
                Name: "_xlnm._FilterDatabase",
                Sheet: a,
                Ref: "'" + r.SheetNames[a] + "'!" + n,
              }),
            Yt("autoFilter", null, { ref: n })
          );
        })(c["!autofilter"], c, r, e)),
      null != c["!merges"] &&
        0 < c["!merges"].length &&
        (i[i.length] = (function (e) {
          if (0 === e.length) return "";
          for (
            var t = '<mergeCells count="' + e.length + '">', r = 0;
            r != e.length;
            ++r
          )
            t += '<mergeCell ref="' + qr(e[r]) + '"/>';
          return t + "</mergeCells>";
        })(c["!merges"]));
    var p,
      m,
      g = -1;
    return (
      0 < c["!links"].length &&
        ((i[i.length] = "<hyperlinks>"),
        c["!links"].forEach(function (e) {
          e[1].Target &&
            ((m = { ref: e[0] }),
            "#" != e[1].Target.charAt(0) &&
              ((g = Ja(a, -1, kt(e[1].Target).replace(/#.*$/, ""), $a.HLINK)),
              (m["r:id"] = "rId" + g)),
            -1 < (p = e[1].Target.indexOf("#")) &&
              (m.location = kt(e[1].Target.slice(p + 1))),
            e[1].Tooltip && (m.tooltip = kt(e[1].Tooltip)),
            (i[i.length] = Yt("hyperlink", null, m)));
        }),
        (i[i.length] = "</hyperlinks>")),
      delete c["!links"],
      null != c["!margins"] &&
        (i[i.length] = (Qc((r = c["!margins"])), Yt("pageMargins", null, r))),
      (t && !t.ignoreEC && null != t.ignoreEC) ||
        (i[i.length] = $t(
          "ignoredErrors",
          Yt("ignoredError", null, { numberStoredAsText: 1, sqref: l }),
        )),
      0 < d.length &&
        ((g = Ja(a, -1, "../drawings/drawing" + (e + 1) + ".xml", $a.DRAW)),
        (i[i.length] = Yt("drawing", null, { "r:id": "rId" + g })),
        (c["!drawing"] = d)),
      0 < c["!comments"].length &&
        ((g = Ja(a, -1, "../drawings/vmlDrawing" + (e + 1) + ".vml", $a.VML)),
        (i[i.length] = Yt("legacyDrawing", null, { "r:id": "rId" + g })),
        (c["!legacy"] = g)),
      1 < i.length &&
        ((i[i.length] = "</worksheet>"), (i[1] = i[1].replace("/>", ">"))),
      i.join("")
    );
  }
  function Al(e, t, r, a) {
    r = (function (e, t, r) {
      var a = Lr(145),
        n = (r["!rows"] || [])[e] || {};
      a.write_shift(4, e), a.write_shift(4, 0);
      var s = 320;
      n.hpx ? (s = 20 * uo(n.hpx)) : n.hpt && (s = 20 * n.hpt),
        a.write_shift(2, s),
        a.write_shift(1, 0),
        (s = 0),
        n.level && (s |= n.level),
        n.hidden && (s |= 16),
        (n.hpx || n.hpt) && (s |= 32),
        a.write_shift(1, s),
        a.write_shift(1, 0);
      var i = 0,
        s = a.l;
      a.l += 4;
      for (var o = { r: e, c: 0 }, c = 0; c < 16; ++c)
        if (!(t.s.c > (c + 1) << 10 || t.e.c < c << 10)) {
          for (var l = -1, f = -1, h = c << 10; h < (c + 1) << 10; ++h)
            (o.c = h),
              (Array.isArray(r) ? (r[o.r] || [])[o.c] : r[Kr(o)]) &&
                (l < 0 && (l = h), (f = h));
          l < 0 || (++i, a.write_shift(4, l), a.write_shift(4, f));
        }
      return (
        (e = a.l),
        (a.l = s),
        a.write_shift(4, i),
        (a.l = e),
        a.length > a.l ? a.slice(0, a.l) : a
      );
    })(a, r, t);
    (17 < r.length || (t["!rows"] || [])[a]) && Br(e, 0, r);
  }
  var lt = Sa,
    Cl = _a;
  function Rl(e) {
    return [ua(e), xa(e), "n"];
  }
  var Lt = Sa,
    Ol = _a;
  var Il = ["left", "right", "top", "bottom", "header", "footer"];
  function Nl(e, t, r, a, n, s, i) {
    if (void 0 === t.v) return !1;
    var o = "";
    switch (t.t) {
      case "b":
        o = t.v ? "1" : "0";
        break;
      case "d":
        ((t = Ve(t)).z = t.z || me[14]), (t.v = De(He(t.v))), (t.t = "n");
        break;
      case "n":
      case "e":
        o = "" + t.v;
        break;
      default:
        o = t.v;
    }
    var c,
      l,
      f,
      h,
      u,
      d,
      p,
      m,
      g,
      b,
      v,
      w,
      T,
      E,
      k,
      y,
      S,
      _,
      x,
      A,
      C = { r: r, c: a };
    switch (
      ((C.s = el(n.cellXfs, t, n)),
      t.l && s["!links"].push([Kr(C), t.l]),
      t.c && s["!comments"].push([Kr(C), t.c]),
      t.t)
    ) {
      case "s":
      case "str":
        return (
          n.bookSST
            ? ((o = qc(n.Strings, t.v, n.revStrings)),
              (C.t = "s"),
              (C.v = o),
              i
                ? Br(
                    e,
                    18,
                    (da((S = C), (_ = null == _ ? Lr(8) : _)),
                    _.write_shift(4, S.v),
                    _),
                  )
                : Br(
                    e,
                    7,
                    (ha((S = C), (y = null == y ? Lr(12) : y)),
                    y.write_shift(4, S.v),
                    y),
                  ))
            : ((C.t = "str"),
              i
                ? Br(
                    e,
                    17,
                    ((E = t),
                    da(C, (k = null == k ? Lr(8 + 4 * E.v.length) : k)),
                    ia(E.v, k),
                    k.length > k.l ? k.slice(0, k.l) : k),
                  )
                : Br(
                    e,
                    6,
                    ((E = t),
                    ha(C, (T = null == T ? Lr(12 + 4 * E.v.length) : T)),
                    ia(E.v, T),
                    T.length > T.l ? T.slice(0, T.l) : T),
                  )),
          !0
        );
      case "n":
        return (
          t.v == (0 | t.v) && -1e3 < t.v && t.v < 1e3
            ? i
              ? Br(
                  e,
                  13,
                  ((v = t), da(C, (w = null == w ? Lr(8) : w)), ka(v.v, w), w),
                )
              : Br(
                  e,
                  2,
                  ((v = t), ha(C, (b = null == b ? Lr(12) : b)), ka(v.v, b), b),
                )
            : i
            ? Br(
                e,
                16,
                ((m = t), da(C, (g = null == g ? Lr(12) : g)), Aa(m.v, g), g),
              )
            : Br(
                e,
                5,
                ((m = t), ha(C, (p = null == p ? Lr(16) : p)), Aa(m.v, p), p),
              ),
          !0
        );
      case "b":
        return (
          (C.t = "b"),
          i
            ? Br(
                e,
                15,
                ((u = t),
                da(C, (d = null == d ? Lr(5) : d)),
                d.write_shift(1, u.v ? 1 : 0),
                d),
              )
            : Br(
                e,
                4,
                ((u = t),
                ha(C, (h = null == h ? Lr(9) : h)),
                h.write_shift(1, u.v ? 1 : 0),
                h),
              ),
          !0
        );
      case "e":
        return (
          (C.t = "e"),
          i
            ? Br(
                e,
                14,
                ((l = t),
                da(C, (f = null == f ? Lr(8) : f)),
                f.write_shift(1, l.v),
                f.write_shift(2, 0),
                f.write_shift(1, 0),
                f),
              )
            : Br(
                e,
                3,
                ((l = t),
                ha(C, (c = null == c ? Lr(9) : c)),
                c.write_shift(1, l.v),
                c),
              ),
          !0
        );
    }
    return (
      i
        ? Br(e, 12, da(C, (A = null == A ? Lr(4) : A)))
        : Br(e, 1, ha(C, (x = null == x ? Lr(8) : x))),
      !0
    );
  }
  function Fl(t, e) {
    var r, a;
    e &&
      e["!merges"] &&
      (Br(
        t,
        177,
        ((r = e["!merges"].length),
        (a = null == a ? Lr(4) : a).write_shift(4, r),
        a),
      ),
      e["!merges"].forEach(function (e) {
        Br(t, 176, Ol(e));
      }),
      Br(t, 178));
  }
  function Dl(r, e) {
    e &&
      e["!cols"] &&
      (Br(r, 390),
      e["!cols"].forEach(function (e, t) {
        e &&
          Br(
            r,
            60,
            (function (e, t, r) {
              null == r && (r = Lr(18));
              var a = Zc(e, t);
              return (
                r.write_shift(-4, e),
                r.write_shift(-4, e),
                r.write_shift(4, 256 * (a.width || 10)),
                r.write_shift(4, 0),
                (e = 0),
                t.hidden && (e |= 1),
                "number" == typeof a.width && (e |= 2),
                t.level && (e |= t.level << 8),
                r.write_shift(2, e),
                r
              );
            })(t, e),
          );
      }),
      Br(r, 391));
  }
  function Pl(e, t) {
    var r;
    t &&
      t["!ref"] &&
      (Br(e, 648),
      Br(
        e,
        649,
        ((r = Zr(t["!ref"])),
        (t = Lr(24)).write_shift(4, 4),
        t.write_shift(4, 1),
        _a(r, t),
        t),
      ),
      Br(e, 650));
  }
  function Ll(a, e, n) {
    e["!links"].forEach(function (e) {
      var t, r;
      e[1].Target &&
        ((t = Ja(n, -1, e[1].Target.replace(/#.*$/, ""), $a.HLINK)),
        Br(
          a,
          494,
          ((r = t),
          (e = Lr(
            50 + 4 * ((t = e)[1].Target.length + (t[1].Tooltip || "").length),
          )),
          _a({ s: Yr(t[0]), e: Yr(t[0]) }, e),
          Ta("rId" + r, e),
          ia(
            (-1 == (r = t[1].Target.indexOf("#"))
              ? ""
              : t[1].Target.slice(r + 1)) || "",
            e,
          ),
          ia(t[1].Tooltip || "", e),
          ia("", e),
          e.slice(0, e.l)),
        ));
    }),
      delete e["!links"];
  }
  function Ml(e, t, r) {
    Br(e, 133),
      Br(
        e,
        137,
        (function (e, t) {
          null == t && (t = Lr(30));
          var r = 924;
          return (
            (((e || {}).Views || [])[0] || {}).RTL && (r |= 32),
            t.write_shift(2, r),
            t.write_shift(4, 0),
            t.write_shift(4, 0),
            t.write_shift(4, 0),
            t.write_shift(1, 0),
            t.write_shift(1, 0),
            t.write_shift(2, 0),
            t.write_shift(2, 100),
            t.write_shift(2, 0),
            t.write_shift(2, 0),
            t.write_shift(2, 0),
            t.write_shift(4, 0),
            t
          );
        })(r),
      ),
      Br(e, 138),
      Br(e, 134);
  }
  function Ul(e, t) {
    var r, a;
    t["!protect"] &&
      Br(
        e,
        535,
        ((r = t["!protect"]),
        (a = null == a ? Lr(66) : a).write_shift(
          2,
          r.password ? zi(r.password) : 0,
        ),
        a.write_shift(4, 1),
        [
          ["objects", !1],
          ["scenarios", !1],
          ["formatCells", !0],
          ["formatColumns", !0],
          ["formatRows", !0],
          ["insertColumns", !0],
          ["insertRows", !0],
          ["insertHyperlinks", !0],
          ["deleteColumns", !0],
          ["deleteRows", !0],
          ["selectLockedCells", !1],
          ["sort", !0],
          ["autoFilter", !0],
          ["pivotTables", !0],
          ["selectUnlockedCells", !1],
        ].forEach(function (e) {
          e[1]
            ? a.write_shift(4, null == r[e[0]] || r[e[0]] ? 0 : 1)
            : a.write_shift(4, null != r[e[0]] && r[e[0]] ? 0 : 1);
        }),
        a),
      );
  }
  function Bl(e, t, r, a) {
    var n = Ur(),
      s = r.SheetNames[e],
      i = r.Sheets[s] || {},
      o = s;
    try {
      r && r.Workbook && (o = r.Workbook.Sheets[e].CodeName || o);
    } catch (e) {}
    var c,
      l,
      s = Zr(i["!ref"] || "A1");
    if (16383 < s.e.c || 1048575 < s.e.r) {
      if (t.WTF)
        throw new Error(
          "Range " +
            (i["!ref"] || "A1") +
            " exceeds format limit A1:XFD1048576",
        );
      (s.e.c = Math.min(s.e.c, 16383)), (s.e.r = Math.min(s.e.c, 1048575));
    }
    return (
      (i["!links"] = []),
      (i["!comments"] = []),
      Br(n, 129),
      (r.vbaraw || i["!outline"]) &&
        Br(
          n,
          147,
          (function (e, t, r) {
            null == r && (r = Lr(84 + 4 * e.length));
            var a = 192;
            t && (t.above && (a &= -65), t.left && (a &= -129)),
              r.write_shift(1, a);
            for (var n = 1; n < 3; ++n) r.write_shift(1, 0);
            return (
              Ca({ auto: 1 }, r),
              r.write_shift(-4, -1),
              r.write_shift(-4, -1),
              ma(e, r),
              r.slice(0, r.l)
            );
          })(o, i["!outline"]),
        ),
      Br(n, 148, Cl(s)),
      Ml(n, 0, r.Workbook),
      Dl(n, i),
      (function (e, t, r) {
        var a,
          n = Zr(t["!ref"] || "A1"),
          s = [];
        Br(e, 145);
        var i = Array.isArray(t),
          o = n.e.r;
        t["!rows"] && (o = Math.max(n.e.r, t["!rows"].length - 1));
        for (var c = n.s.r; c <= o; ++c) {
          (a = jr(c)), Al(e, t, n, c);
          var l = !1;
          if (c <= n.e.r)
            for (var f = n.s.c; f <= n.e.c; ++f) {
              c === n.s.r && (s[f] = Xr(f)), (h = s[f] + a);
              var h = i ? (t[c] || [])[f] : t[h];
              h ? (l = Nl(e, h, c, f, r, t, l)) : (l = !1);
            }
        }
        Br(e, 146);
      })(n, i, t),
      Ul(n, i),
      (function (e, t, r, a) {
        if (t["!autofilter"]) {
          var n = t["!autofilter"],
            s = "string" == typeof n.ref ? n.ref : qr(n.ref);
          r.Workbook || (r.Workbook = { Sheets: [] }),
            r.Workbook.Names || (r.Workbook.Names = []);
          var i = r.Workbook.Names,
            n = Jr(s);
          n.s.r == n.e.r && ((n.e.r = Jr(t["!ref"]).e.r), (s = qr(n)));
          for (var o = 0; o < i.length; ++o) {
            var c = i[o];
            if ("_xlnm._FilterDatabase" == c.Name && c.Sheet == a) {
              c.Ref = "'" + r.SheetNames[a] + "'!" + s;
              break;
            }
          }
          o == i.length &&
            i.push({
              Name: "_xlnm._FilterDatabase",
              Sheet: a,
              Ref: "'" + r.SheetNames[a] + "'!" + s,
            }),
            Br(e, 161, _a(Zr(s))),
            Br(e, 162);
        }
      })(n, i, r, e),
      Fl(n, i),
      Ll(n, i, a),
      i["!margins"] &&
        Br(
          n,
          476,
          ((c = i["!margins"]),
          null == l && (l = Lr(48)),
          Qc(c),
          Il.forEach(function (e) {
            Aa(c[e], l);
          }),
          l),
        ),
      (t && !t.ignoreEC && null != t.ignoreEC) || Pl(n, i),
      (s = n),
      (t = e),
      (a = a),
      0 < (i = i)["!comments"].length &&
        ((t = Ja(a, -1, "../drawings/vmlDrawing" + (t + 1) + ".vml", $a.VML)),
        Br(s, 551, Ta("rId" + t)),
        (i["!legacy"] = t)),
      Br(n, 130),
      n.end()
    );
  }
  function Wl(e, t, r, a, n, s) {
    var i = s || { "!type": "chart" };
    if (!e) return s;
    var o,
      c = 0,
      l = 0,
      f = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } };
    return (
      (e.match(/<c:numCache>[\s\S]*?<\/c:numCache>/gm) || []).forEach(
        function (e) {
          var r = (function (e) {
            var t,
              r = [],
              a = e.match(/^<c:numCache>/);
            (e.match(/<c:pt idx="(\d*)">(.*?)<\/c:pt>/gm) || []).forEach(
              function (e) {
                e = e.match(/<c:pt idx="(\d*?)"><c:v>(.*)<\/c:v><\/c:pt>/);
                e && (r[+e[1]] = a ? +e[2] : e[2]);
              },
            );
            var n = wt(
              (e.match(/<c:formatCode>([\s\S]*?)<\/c:formatCode>/) || [
                "",
                "General",
              ])[1],
            );
            return (
              (e.match(/<c:f>(.*?)<\/c:f>/gm) || []).forEach(function (e) {
                t = e.replace(/<.*?>/g, "");
              }),
              [r, n, t]
            );
          })(e);
          (f.s.r = f.s.c = 0),
            (f.e.c = c),
            (o = Xr(c)),
            r[0].forEach(function (e, t) {
              (i[o + jr(t)] = { t: "n", v: e, z: r[1] }), (l = t);
            }),
            f.e.r < l && (f.e.r = l),
            ++c;
        },
      ),
      0 < c && (i["!ref"] = qr(f)),
      i
    );
  }
  var Hl = [
      ["allowRefreshQuery", !1, "bool"],
      ["autoCompressPictures", !0, "bool"],
      ["backupFile", !1, "bool"],
      ["checkCompatibility", !1, "bool"],
      ["CodeName", ""],
      ["date1904", !1, "bool"],
      ["defaultThemeVersion", 0, "int"],
      ["filterPrivacy", !1, "bool"],
      ["hidePivotFieldList", !1, "bool"],
      ["promptedSolutions", !1, "bool"],
      ["publishItems", !1, "bool"],
      ["refreshAllConnections", !1, "bool"],
      ["saveExternalLinkValues", !0, "bool"],
      ["showBorderUnselectedTables", !0, "bool"],
      ["showInkAnnotation", !0, "bool"],
      ["showObjects", "all"],
      ["showPivotChartFilter", !1, "bool"],
      ["updateLinks", "userSet"],
    ],
    zl = [
      ["activeTab", 0, "int"],
      ["autoFilterDateGrouping", !0, "bool"],
      ["firstSheet", 0, "int"],
      ["minimized", !1, "bool"],
      ["showHorizontalScroll", !0, "bool"],
      ["showSheetTabs", !0, "bool"],
      ["showVerticalScroll", !0, "bool"],
      ["tabRatio", 600, "int"],
      ["visibility", "visible"],
    ],
    Vl = [],
    Gl = [
      ["calcCompleted", "true"],
      ["calcMode", "auto"],
      ["calcOnSave", "true"],
      ["concurrentCalc", "true"],
      ["fullCalcOnLoad", "false"],
      ["fullPrecision", "true"],
      ["iterate", "false"],
      ["iterateCount", "100"],
      ["iterateDelta", "0.001"],
      ["refMode", "A1"],
    ];
  function jl(e, t) {
    for (var r = 0; r != e.length; ++r)
      for (var a = e[r], n = 0; n != t.length; ++n) {
        var s = t[n];
        if (null == a[s[0]]) a[s[0]] = s[1];
        else
          switch (s[2]) {
            case "bool":
              "string" == typeof a[s[0]] && (a[s[0]] = Rt(a[s[0]]));
              break;
            case "int":
              "string" == typeof a[s[0]] && (a[s[0]] = parseInt(a[s[0]], 10));
          }
      }
  }
  function $l(e, t) {
    for (var r = 0; r != t.length; ++r) {
      var a = t[r];
      if (null == e[a[0]]) e[a[0]] = a[1];
      else
        switch (a[2]) {
          case "bool":
            "string" == typeof e[a[0]] && (e[a[0]] = Rt(e[a[0]]));
            break;
          case "int":
            "string" == typeof e[a[0]] && (e[a[0]] = parseInt(e[a[0]], 10));
        }
    }
  }
  function Xl(e) {
    $l(e.WBProps, Hl),
      $l(e.CalcPr, Gl),
      jl(e.WBView, zl),
      jl(e.Sheets, Vl),
      (Kc.date1904 = Rt(e.WBProps.date1904));
  }
  var Yl = "][*?/\\".split("");
  function Kl(t, r) {
    if (31 < t.length) {
      if (r) return;
      throw new Error("Sheet names cannot exceed 31 chars");
    }
    var a = !0;
    return (
      Yl.forEach(function (e) {
        if (-1 != t.indexOf(e)) {
          if (!r) throw new Error("Sheet name cannot contain : \\ / ? * [ ]");
          a = !1;
        }
      }),
      a
    );
  }
  function Jl(e) {
    if (!e || !e.SheetNames || !e.Sheets) throw new Error("Invalid Workbook");
    if (!e.SheetNames.length) throw new Error("Workbook is empty");
    var n,
      s,
      i,
      t = (e.Workbook && e.Workbook.Sheets) || [];
    (n = e.SheetNames),
      (s = t),
      (i = !!e.vbaraw),
      n.forEach(function (e, t) {
        Kl(e);
        for (var r = 0; r < t; ++r)
          if (e == n[r]) throw new Error("Duplicate Sheet Name: " + e);
        if (i) {
          var a = (s && s[t] && s[t].CodeName) || e;
          if (95 == a.charCodeAt(0) && 22 < a.length)
            throw new Error("Bad Code Name: Worksheet" + a);
        }
      });
    for (var r = 0; r < e.SheetNames.length; ++r)
      !(function (e, t) {
        if (e && e["!ref"]) {
          var r = Zr(e["!ref"]);
          if (r.e.c < r.s.c || r.e.r < r.s.r)
            throw new Error("Bad range (" + t + "): " + e["!ref"]);
        }
      })(e.Sheets[e.SheetNames[r]], (e.SheetNames[r], r));
  }
  var ql = /<\w+:workbook/;
  function Zl(t) {
    var r = [ot];
    r[r.length] = Yt("workbook", null, { xmlns: Qt[0], "xmlns:r": Zt.r });
    var e = t.Workbook && 0 < (t.Workbook.Names || []).length,
      a = { codeName: "ThisWorkbook" };
    t.Workbook &&
      t.Workbook.WBProps &&
      (Hl.forEach(function (e) {
        null != t.Workbook.WBProps[e[0]] &&
          t.Workbook.WBProps[e[0]] != e[1] &&
          (a[e[0]] = t.Workbook.WBProps[e[0]]);
      }),
      t.Workbook.WBProps.CodeName &&
        ((a.codeName = t.Workbook.WBProps.CodeName), delete a.CodeName)),
      (r[r.length] = Yt("workbookPr", null, a));
    var n = (t.Workbook && t.Workbook.Sheets) || [],
      s = 0;
    if (n && n[0] && n[0].Hidden) {
      for (
        r[r.length] = "<bookViews>", s = 0;
        s != t.SheetNames.length && n[s] && n[s].Hidden;
        ++s
      );
      s == t.SheetNames.length && (s = 0),
        (r[r.length] =
          '<workbookView firstSheet="' + s + '" activeTab="' + s + '"/>'),
        (r[r.length] = "</bookViews>");
    }
    for (r[r.length] = "<sheets>", s = 0; s != t.SheetNames.length; ++s) {
      var i = { name: kt(t.SheetNames[s].slice(0, 31)) };
      if (((i.sheetId = "" + (s + 1)), (i["r:id"] = "rId" + (s + 1)), n[s]))
        switch (n[s].Hidden) {
          case 1:
            i.state = "hidden";
            break;
          case 2:
            i.state = "veryHidden";
        }
      r[r.length] = Yt("sheet", null, i);
    }
    return (
      (r[r.length] = "</sheets>"),
      e &&
        ((r[r.length] = "<definedNames>"),
        t.Workbook &&
          t.Workbook.Names &&
          t.Workbook.Names.forEach(function (e) {
            var t = { name: e.Name };
            e.Comment && (t.comment = e.Comment),
              null != e.Sheet && (t.localSheetId = "" + e.Sheet),
              e.Hidden && (t.hidden = "1"),
              e.Ref && (r[r.length] = Yt("definedName", kt(e.Ref), t));
          }),
        (r[r.length] = "</definedNames>")),
      2 < r.length &&
        ((r[r.length] = "</workbook>"), (r[1] = r[1].replace("/>", ">"))),
      r.join("")
    );
  }
  function Ql(e, t) {
    var r = {};
    return e.read_shift(4), (r.ArchID = e.read_shift(4)), (e.l += t - 8), r;
  }
  function ef(e, t) {
    Br(e, 143);
    for (var r, a = 0; a != t.SheetNames.length; ++a) {
      var n = {
        Hidden:
          (t.Workbook &&
            t.Workbook.Sheets &&
            t.Workbook.Sheets[a] &&
            t.Workbook.Sheets[a].Hidden) ||
          0,
        iTabID: a + 1,
        strRelID: "rId" + (a + 1),
        name: t.SheetNames[a],
      };
      Br(
        e,
        156,
        ((r = n),
        (n = (n = void 0) || Lr(127)).write_shift(4, r.Hidden),
        n.write_shift(4, r.iTabID),
        Ta(r.strRelID, n),
        ia(r.name.slice(0, 31), n),
        n.length > n.l ? n.slice(0, n.l) : n),
      );
    }
    Br(e, 144);
  }
  function tf(e, t) {
    if (t.Workbook && t.Workbook.Sheets) {
      for (
        var r, a = t.Workbook.Sheets, n = 0, s = -1, i = -1;
        n < a.length;
        ++n
      )
        !a[n] || (!a[n].Hidden && -1 == s)
          ? (s = n)
          : 1 == a[n].Hidden && -1 == i && (i = n);
      s < i ||
        (Br(e, 135),
        Br(
          e,
          158,
          ((t = s),
          (r = r || Lr(29)).write_shift(-4, 0),
          r.write_shift(-4, 460),
          r.write_shift(4, 28800),
          r.write_shift(4, 17600),
          r.write_shift(4, 500),
          r.write_shift(4, t),
          r.write_shift(4, t),
          r.write_shift(1, 120),
          r.length > r.l ? r.slice(0, r.l) : r),
        ),
        Br(e, 136));
    }
  }
  function rf(e, t) {
    var r = Ur();
    return (
      Br(r, 131),
      Br(
        r,
        128,
        (function (e) {
          e = e || Lr(127);
          for (var t = 0; 4 != t; ++t) e.write_shift(4, 0);
          return (
            ia("SheetJS", e),
            ia(a.version, e),
            ia(a.version, e),
            ia("7262", e),
            e.length > e.l ? e.slice(0, e.l) : e
          );
        })(),
      ),
      Br(
        r,
        153,
        (function (e, t) {
          t = t || Lr(72);
          var r = 0;
          return (
            e && e.filterPrivacy && (r |= 8),
            t.write_shift(4, r),
            t.write_shift(4, 0),
            ma((e && e.CodeName) || "ThisWorkbook", t),
            t.slice(0, t.l)
          );
        })((e.Workbook && e.Workbook.WBProps) || null),
      ),
      tf(r, e),
      ef(r, e),
      Br(r, 132),
      r.end()
    );
  }
  function af(e, t, r) {
    return (
      ".bin" === t.slice(-4)
        ? function (e, a) {
            var n = {
                AppVersion: {},
                WBProps: {},
                WBView: [],
                Sheets: [],
                CalcPr: {},
                xmlns: "",
              },
              s = [],
              i = !1;
            (a = a || {}).biff = 12;
            var o = [],
              c = [[]];
            return (
              (c.SheetNames = []),
              (c.XTI = []),
              (Df[16] = { n: "BrtFRTArchID$", f: Ql }),
              Mr(
                e,
                function (e, t, r) {
                  switch (r) {
                    case 156:
                      c.SheetNames.push(e.name), n.Sheets.push(e);
                      break;
                    case 153:
                      n.WBProps = e;
                      break;
                    case 39:
                      null != e.Sheet && (a.SID = e.Sheet),
                        (e.Ref = Pc(e.Ptg, 0, null, c, a)),
                        delete a.SID,
                        delete e.Ptg,
                        o.push(e);
                      break;
                    case 1036:
                      break;
                    case 357:
                    case 358:
                    case 355:
                    case 667:
                      c[0].length ? c.push([r, e]) : (c[0] = [r, e]),
                        (c[c.length - 1].XTI = []);
                      break;
                    case 362:
                      0 === c.length && ((c[0] = []), (c[0].XTI = [])),
                        (c[c.length - 1].XTI = c[c.length - 1].XTI.concat(e)),
                        (c.XTI = c.XTI.concat(e));
                      break;
                    case 361:
                      break;
                    case 2071:
                    case 158:
                    case 143:
                    case 664:
                    case 353:
                      break;
                    case 3072:
                    case 3073:
                    case 534:
                    case 677:
                    case 157:
                    case 610:
                    case 2050:
                    case 155:
                    case 548:
                    case 676:
                    case 128:
                    case 665:
                    case 2128:
                    case 2125:
                    case 549:
                    case 2053:
                    case 596:
                    case 2076:
                    case 2075:
                    case 2082:
                    case 397:
                    case 154:
                    case 1117:
                    case 553:
                    case 2091:
                      break;
                    case 35:
                      s.push(r), (i = !0);
                      break;
                    case 36:
                      s.pop(), (i = !1);
                      break;
                    case 37:
                      s.push(r), (i = !0);
                      break;
                    case 38:
                      s.pop(), (i = !1);
                      break;
                    case 16:
                      break;
                    default:
                      if (
                        !t.T &&
                        (!i ||
                          (a.WTF &&
                            37 != s[s.length - 1] &&
                            35 != s[s.length - 1]))
                      )
                        throw new Error(
                          "Unexpected record 0x" + r.toString(16),
                        );
                  }
                },
                a,
              ),
              Xl(n),
              (n.Names = o),
              (n.supbooks = c),
              n
            );
          }
        : function (a, n) {
            if (!a) throw new Error("Could not find file");
            var s = {
                AppVersion: {},
                WBProps: {},
                WBView: [],
                Sheets: [],
                CalcPr: {},
                Names: [],
                xmlns: "",
              },
              i = !1,
              o = "xmlns",
              c = {},
              l = 0;
            if (
              (a.replace(ft, function (e, t) {
                var r = dt(e);
                switch (pt(r[0])) {
                  case "<?xml":
                    break;
                  case "<workbook":
                    e.match(ql) && (o = "xmlns" + e.match(/<(\w+):/)[1]),
                      (s.xmlns = r[o]);
                    break;
                  case "</workbook>":
                    break;
                  case "<fileVersion":
                    delete r[0], (s.AppVersion = r);
                    break;
                  case "<fileVersion/>":
                  case "</fileVersion>":
                  case "<fileSharing":
                  case "<fileSharing/>":
                    break;
                  case "<workbookPr":
                  case "<workbookPr/>":
                    Hl.forEach(function (e) {
                      if (null != r[e[0]])
                        switch (e[2]) {
                          case "bool":
                            s.WBProps[e[0]] = Rt(r[e[0]]);
                            break;
                          case "int":
                            s.WBProps[e[0]] = parseInt(r[e[0]], 10);
                            break;
                          default:
                            s.WBProps[e[0]] = r[e[0]];
                        }
                    }),
                      r.codeName && (s.WBProps.CodeName = Mt(r.codeName));
                    break;
                  case "</workbookPr>":
                  case "<workbookProtection":
                  case "<workbookProtection/>":
                    break;
                  case "<bookViews":
                  case "<bookViews>":
                  case "</bookViews>":
                    break;
                  case "<workbookView":
                  case "<workbookView/>":
                    delete r[0], s.WBView.push(r);
                    break;
                  case "</workbookView>":
                    break;
                  case "<sheets":
                  case "<sheets>":
                  case "</sheets>":
                    break;
                  case "<sheet":
                    switch (r.state) {
                      case "hidden":
                        r.Hidden = 1;
                        break;
                      case "veryHidden":
                        r.Hidden = 2;
                        break;
                      default:
                        r.Hidden = 0;
                    }
                    delete r.state,
                      (r.name = wt(Mt(r.name))),
                      delete r[0],
                      s.Sheets.push(r);
                    break;
                  case "</sheet>":
                    break;
                  case "<functionGroups":
                  case "<functionGroups/>":
                  case "<functionGroup":
                    break;
                  case "<externalReferences":
                  case "</externalReferences>":
                  case "<externalReferences>":
                  case "<externalReference":
                  case "<definedNames/>":
                    break;
                  case "<definedNames>":
                  case "<definedNames":
                    i = !0;
                    break;
                  case "</definedNames>":
                    i = !1;
                    break;
                  case "<definedName":
                    ((c = {}).Name = Mt(r.name)),
                      r.comment && (c.Comment = r.comment),
                      r.localSheetId && (c.Sheet = +r.localSheetId),
                      Rt(r.hidden || "0") && (c.Hidden = !0),
                      (l = t + e.length);
                    break;
                  case "</definedName>":
                    (c.Ref = wt(Mt(a.slice(l, t)))), s.Names.push(c);
                    break;
                  case "<definedName/>":
                    break;
                  case "<calcPr":
                  case "<calcPr/>":
                    delete r[0], (s.CalcPr = r);
                    break;
                  case "</calcPr>":
                  case "<oleSize":
                    break;
                  case "<customWorkbookViews>":
                  case "</customWorkbookViews>":
                  case "<customWorkbookViews":
                    break;
                  case "<customWorkbookView":
                  case "</customWorkbookView>":
                    break;
                  case "<pivotCaches>":
                  case "</pivotCaches>":
                  case "<pivotCaches":
                  case "<pivotCache":
                    break;
                  case "<smartTagPr":
                  case "<smartTagPr/>":
                    break;
                  case "<smartTagTypes":
                  case "<smartTagTypes>":
                  case "</smartTagTypes>":
                  case "<smartTagType":
                    break;
                  case "<webPublishing":
                  case "<webPublishing/>":
                    break;
                  case "<fileRecoveryPr":
                  case "<fileRecoveryPr/>":
                    break;
                  case "<webPublishObjects>":
                  case "<webPublishObjects":
                  case "</webPublishObjects>":
                  case "<webPublishObject":
                    break;
                  case "<extLst":
                  case "<extLst>":
                  case "</extLst>":
                  case "<extLst/>":
                    break;
                  case "<ext":
                    i = !0;
                    break;
                  case "</ext>":
                    i = !1;
                    break;
                  case "<ArchID":
                    break;
                  case "<AlternateContent":
                  case "<AlternateContent>":
                    i = !0;
                    break;
                  case "</AlternateContent>":
                    i = !1;
                    break;
                  case "<revisionPtr":
                    break;
                  default:
                    if (!i && n.WTF)
                      throw new Error("unrecognized " + r[0] + " in workbook");
                }
                return e;
              }),
              -1 === Qt.indexOf(s.xmlns))
            )
              throw new Error("Unknown Namespace: " + s.xmlns);
            return Xl(s), s;
          }
    )(e, r);
  }
  function nf(e, t, r, a, n, s, i, o) {
    return (
      ".bin" === t.slice(-4)
        ? function (e, t, s, i, o, c, l) {
            if (!e) return e;
            var f = t || {};
            (i = i || { "!id": {} }),
              null != oe && null == f.dense && (f.dense = oe);
            var h,
              u,
              d,
              p,
              m,
              g,
              b,
              v,
              w,
              T,
              E = f.dense ? [] : {},
              k = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } },
              y = [],
              S = !1,
              _ = !1,
              x = [];
            f.biff = 12;
            var A = (f["!row"] = 0),
              C = !1,
              R = [],
              O = {},
              I = f.supbooks || o.supbooks || [[]];
            if (
              ((I.sharedf = O),
              (I.arrayf = R),
              (I.SheetNames =
                o.SheetNames ||
                o.Sheets.map(function (e) {
                  return e.name;
                })),
              !f.supbooks && ((f.supbooks = I), o.Names))
            )
              for (var r = 0; r < o.Names.length; ++r) I[0][r + 1] = o.Names[r];
            var N,
              F = [],
              D = [],
              P = !1;
            return (
              (Df[16] = { n: "BrtShortReal", f: Rl }),
              Mr(
                e,
                function (e, t, r) {
                  if (!_)
                    switch (r) {
                      case 148:
                        h = e;
                        break;
                      case 0:
                        (u = e),
                          f.sheetRows && f.sheetRows <= u.r && (_ = !0),
                          (w = jr((m = u.r))),
                          (f["!row"] = u.r),
                          (e.hidden || e.hpt || null != e.level) &&
                            (e.hpt && (e.hpx = po(e.hpt)), (D[e.r] = e));
                        break;
                      case 2:
                      case 3:
                      case 4:
                      case 5:
                      case 6:
                      case 7:
                      case 8:
                      case 9:
                      case 10:
                      case 11:
                      case 13:
                      case 14:
                      case 15:
                      case 16:
                      case 17:
                      case 18:
                      case 62:
                        switch (((d = { t: e[2] }), e[2])) {
                          case "n":
                            d.v = e[1];
                            break;
                          case "s":
                            (v = Yc[e[1]]), (d.v = v.t), (d.r = v.r);
                            break;
                          case "b":
                            d.v = !!e[1];
                            break;
                          case "e":
                            (d.v = e[1]), !1 !== f.cellText && (d.w = Wa[d.v]);
                            break;
                          case "str":
                            (d.t = "s"), (d.v = e[1]);
                            break;
                          case "is":
                            (d.t = "s"), (d.v = e[1].t);
                        }
                        if (
                          ((p = l.CellXf[e[0].iStyleRef]) &&
                            tl(d, p.numFmtId, null, f, c, l),
                          (g = -1 == e[0].c ? g + 1 : e[0].c),
                          f.dense
                            ? (E[m] || (E[m] = []), (E[m][g] = d))
                            : (E[Xr(g) + w] = d),
                          f.cellFormula)
                        ) {
                          for (C = !1, A = 0; A < R.length; ++A) {
                            var a = R[A];
                            u.r >= a[0].s.r &&
                              u.r <= a[0].e.r &&
                              g >= a[0].s.c &&
                              g <= a[0].e.c &&
                              ((d.F = qr(a[0])), (C = !0));
                          }
                          !C && 3 < e.length && (d.f = e[3]);
                        }
                        k.s.r > u.r && (k.s.r = u.r),
                          k.s.c > g && (k.s.c = g),
                          k.e.r < u.r && (k.e.r = u.r),
                          k.e.c < g && (k.e.c = g),
                          f.cellDates &&
                            p &&
                            "n" == d.t &&
                            q(me[p.numFmtId]) &&
                            (n = L(d.v)) &&
                            ((d.t = "d"),
                            (d.v = new Date(
                              n.y,
                              n.m - 1,
                              n.d,
                              n.H,
                              n.M,
                              n.S,
                              n.u,
                            ))),
                          N && ("XLDAPR" == N.type && (d.D = !0), (N = void 0)),
                          0;
                        break;
                      case 1:
                      case 12:
                        if (!f.sheetStubs || S) break;
                        (d = { t: "z", v: void 0 }),
                          (g = -1 == e[0].c ? g + 1 : e[0].c),
                          f.dense
                            ? (E[m] || (E[m] = []), (E[m][g] = d))
                            : (E[Xr(g) + w] = d),
                          k.s.r > u.r && (k.s.r = u.r),
                          k.s.c > g && (k.s.c = g),
                          k.e.r < u.r && (k.e.r = u.r),
                          k.e.c < g && (k.e.c = g),
                          N && ("XLDAPR" == N.type && (d.D = !0), (N = void 0)),
                          0;
                        break;
                      case 176:
                        x.push(e);
                        break;
                      case 49:
                        N = ((f.xlmeta || {}).Cell || [])[e - 1];
                        break;
                      case 494:
                        var n = i["!id"][e.relId];
                        for (
                          n
                            ? ((e.Target = n.Target),
                              e.loc && (e.Target += "#" + e.loc),
                              (e.Rel = n))
                            : "" == e.relId && (e.Target = "#" + e.loc),
                            m = e.rfx.s.r;
                          m <= e.rfx.e.r;
                          ++m
                        )
                          for (g = e.rfx.s.c; g <= e.rfx.e.c; ++g)
                            f.dense
                              ? (E[m] || (E[m] = []),
                                E[m][g] || (E[m][g] = { t: "z", v: void 0 }),
                                (E[m][g].l = e))
                              : ((b = Kr({ c: g, r: m })),
                                E[b] || (E[b] = { t: "z", v: void 0 }),
                                (E[b].l = e));
                        break;
                      case 426:
                        if (!f.cellFormula) break;
                        R.push(e),
                          ((T = f.dense ? E[m][g] : E[Xr(g) + w]).f = Pc(
                            e[1],
                            0,
                            { r: u.r, c: g },
                            I,
                            f,
                          )),
                          (T.F = qr(e[0]));
                        break;
                      case 427:
                        if (!f.cellFormula) break;
                        (O[Kr(e[0].s)] = e[1]),
                          ((T = f.dense ? E[m][g] : E[Xr(g) + w]).f = Pc(
                            e[1],
                            0,
                            { r: u.r, c: g },
                            I,
                            f,
                          ));
                        break;
                      case 60:
                        if (!f.cellStyles) break;
                        for (; e.e >= e.s; )
                          (F[e.e--] = {
                            width: e.w / 256,
                            hidden: !!(1 & e.flags),
                            level: e.level,
                          }),
                            P || ((P = !0), lo(e.w / 256)),
                            fo(F[e.e + 1]);
                        break;
                      case 161:
                        E["!autofilter"] = { ref: qr(e) };
                        break;
                      case 476:
                        E["!margins"] = e;
                        break;
                      case 147:
                        o.Sheets[s] || (o.Sheets[s] = {}),
                          e.name && (o.Sheets[s].CodeName = e.name),
                          (e.above || e.left) &&
                            (E["!outline"] = { above: e.above, left: e.left });
                        break;
                      case 137:
                        o.Views || (o.Views = [{}]),
                          o.Views[0] || (o.Views[0] = {}),
                          e.RTL && (o.Views[0].RTL = !0);
                        break;
                      case 485:
                        break;
                      case 64:
                      case 1053:
                      case 151:
                        break;
                      case 152:
                      case 175:
                      case 644:
                      case 625:
                      case 562:
                      case 396:
                      case 1112:
                      case 1146:
                      case 471:
                      case 1050:
                      case 649:
                      case 1105:
                      case 589:
                      case 607:
                      case 564:
                      case 1055:
                      case 168:
                      case 174:
                      case 1180:
                      case 499:
                      case 507:
                      case 550:
                      case 171:
                      case 167:
                      case 1177:
                      case 169:
                      case 1181:
                      case 551:
                      case 552:
                      case 661:
                      case 639:
                      case 478:
                      case 537:
                      case 477:
                      case 536:
                      case 1103:
                      case 680:
                      case 1104:
                      case 1024:
                      case 663:
                      case 535:
                      case 678:
                      case 504:
                      case 1043:
                      case 428:
                      case 170:
                      case 3072:
                      case 50:
                      case 2070:
                      case 1045:
                        break;
                      case 35:
                        S = !0;
                        break;
                      case 36:
                        S = !1;
                        break;
                      case 37:
                        y.push(r), (S = !0);
                        break;
                      case 38:
                        y.pop(), (S = !1);
                        break;
                      default:
                        if (!t.T && (!S || f.WTF))
                          throw new Error(
                            "Unexpected record 0x" + r.toString(16),
                          );
                    }
                },
                f,
              ),
              delete f.supbooks,
              delete f["!row"],
              !E["!ref"] &&
                (k.s.r < 2e6 ||
                  (h && (0 < h.e.r || 0 < h.e.c || 0 < h.s.r || 0 < h.s.c))) &&
                (E["!ref"] = qr(h || k)),
              f.sheetRows &&
                E["!ref"] &&
                ((e = Zr(E["!ref"])),
                f.sheetRows <= +e.e.r &&
                  ((e.e.r = f.sheetRows - 1),
                  e.e.r > k.e.r && (e.e.r = k.e.r),
                  e.e.r < e.s.r && (e.s.r = e.e.r),
                  e.e.c > k.e.c && (e.e.c = k.e.c),
                  e.e.c < e.s.c && (e.s.c = e.e.c),
                  (E["!fullref"] = E["!ref"]),
                  (E["!ref"] = qr(e)))),
              0 < x.length && (E["!merges"] = x),
              0 < F.length && (E["!cols"] = F),
              0 < D.length && (E["!rows"] = D),
              E
            );
          }
        : ul
    )(e, a, r, n, s, i, o);
  }
  function sf(e, t, r, a, n, s) {
    return ".bin" === t.slice(-4)
      ? (function (e, a, n, t, s) {
          if (!e) return e;
          t = t || { "!id": {} };
          var i = { "!type": "chart", "!drawel": null, "!rel": "" },
            o = [],
            c = !1;
          return (
            Mr(
              e,
              function (e, t, r) {
                switch (r) {
                  case 550:
                    i["!rel"] = e;
                    break;
                  case 651:
                    s.Sheets[n] || (s.Sheets[n] = {}),
                      e.name && (s.Sheets[n].CodeName = e.name);
                    break;
                  case 562:
                  case 652:
                  case 669:
                  case 679:
                  case 551:
                  case 552:
                  case 476:
                  case 3072:
                    break;
                  case 35:
                    c = !0;
                    break;
                  case 36:
                    c = !1;
                    break;
                  case 37:
                    o.push(r);
                    break;
                  case 38:
                    o.pop();
                    break;
                  default:
                    if (0 < t.T) o.push(r);
                    else if (t.T < 0) o.pop();
                    else if (!c || a.WTF)
                      throw new Error("Unexpected record 0x" + r.toString(16));
                }
              },
              a,
            ),
            t["!id"][i["!rel"]] && (i["!drawel"] = t["!id"][i["!rel"]]),
            i
          );
        })(e, a, r, n, s)
      : (function (e, t, r, a) {
          if (!e) return e;
          r = r || { "!id": {} };
          var n = { "!type": "chart", "!drawel": null, "!rel": "" },
            s = e.match(ll);
          return (
            s && dl(s[0], 0, a, t),
            (e = e.match(/drawing r:id="(.*?)"/)) && (n["!rel"] = e[1]),
            r["!id"][n["!rel"]] && (n["!drawel"] = r["!id"][n["!rel"]]),
            n
          );
        })(e, r, n, s);
  }
  function of(e, t, r, a) {
    return (
      ".bin" === t.slice(-4)
        ? function (e, a, n) {
            var t,
              s = { NumberFmt: [] };
            for (t in me) s.NumberFmt[t] = me[t];
            (s.CellXf = []), (s.Fonts = []);
            var i = [],
              o = !1;
            return (
              Mr(e, function (e, t, r) {
                switch (r) {
                  case 44:
                    (s.NumberFmt[e[0]] = e[1]), we(e[1], e[0]);
                    break;
                  case 43:
                    s.Fonts.push(e),
                      null != e.color.theme &&
                        a &&
                        a.themeElements &&
                        a.themeElements.clrScheme &&
                        (e.color.rgb = eo(
                          a.themeElements.clrScheme[e.color.theme].rgb,
                          e.color.tint || 0,
                        ));
                    break;
                  case 1025:
                  case 45:
                  case 46:
                    break;
                  case 47:
                    617 == i[i.length - 1] && s.CellXf.push(e);
                    break;
                  case 48:
                  case 507:
                  case 572:
                  case 475:
                    break;
                  case 1171:
                  case 2102:
                  case 1130:
                  case 512:
                  case 2095:
                  case 3072:
                    break;
                  case 35:
                    o = !0;
                    break;
                  case 36:
                    o = !1;
                    break;
                  case 37:
                    i.push(r), (o = !0);
                    break;
                  case 38:
                    i.pop(), (o = !1);
                    break;
                  default:
                    if (0 < t.T) i.push(r);
                    else if (t.T < 0) i.pop();
                    else if (!o || (n.WTF && 37 != i[i.length - 1]))
                      throw new Error("Unexpected record 0x" + r.toString(16));
                }
              }),
              s
            );
          }
        : So
    )(e, r, a);
  }
  function cf(e, t, r) {
    return ".bin" === t.slice(-4)
      ? ((a = r),
        (s = !(n = [])),
        Mr(e, function (e, t, r) {
          switch (r) {
            case 159:
              (n.Count = e[0]), (n.Unique = e[1]);
              break;
            case 19:
              n.push(e);
              break;
            case 160:
              return 1;
            case 35:
              s = !0;
              break;
            case 36:
              s = !1;
              break;
            default:
              if ((t.T, !s || a.WTF))
                throw new Error("Unexpected record 0x" + r.toString(16));
          }
        }),
        n)
      : (function (e, t) {
          var r = [],
            a = "";
          if (!e) return r;
          if ((e = e.match(Ci))) {
            a = e[2].replace(Ri, "").split(Oi);
            for (var n = 0; n != a.length; ++n) {
              var s = Ai(a[n].trim(), t);
              null != s && (r[r.length] = s);
            }
            (e = dt(e[1])), (r.Count = e.count), (r.Unique = e.uniqueCount);
          }
          return r;
        })(e, r);
    var a, n, s;
  }
  function lf(e, t, r) {
    return ".bin" === t.slice(-4)
      ? ((a = r),
        (n = []),
        (s = []),
        (o = !(i = {})),
        Mr(e, function (e, t, r) {
          switch (r) {
            case 632:
              s.push(e);
              break;
            case 635:
              i = e;
              break;
            case 637:
              (i.t = e.t), (i.h = e.h), (i.r = e.r);
              break;
            case 636:
              if (
                ((i.author = s[i.iauthor]),
                delete i.iauthor,
                a.sheetRows && i.rfx && a.sheetRows <= i.rfx.r)
              )
                break;
              i.t || (i.t = ""), delete i.rfx, n.push(i);
              break;
            case 3072:
              break;
            case 35:
              o = !0;
              break;
            case 36:
              o = !1;
              break;
            case 37:
            case 38:
              break;
            default:
              if (!t.T && (!o || a.WTF))
                throw new Error("Unexpected record 0x" + r.toString(16));
          }
        }),
        n)
      : (function (e, a) {
          if (e.match(/<(?:\w+:)?comments *\/>/)) return [];
          var n = [],
            s = [],
            t = e.match(/<(?:\w+:)?authors>([\s\S]*)<\/(?:\w+:)?authors>/);
          return (
            t &&
              t[1] &&
              t[1].split(/<\/\w*:?author>/).forEach(function (e) {
                "" === e ||
                  "" === e.trim() ||
                  ((e = e.match(/<(?:\w+:)?author[^>]*>(.*)/)) && n.push(e[1]));
              }),
            (e = e.match(
              /<(?:\w+:)?commentList>([\s\S]*)<\/(?:\w+:)?commentList>/,
            )) &&
              e[1] &&
              e[1].split(/<\/\w*:?comment>/).forEach(function (e) {
                var t, r;
                "" === e ||
                  "" === e.trim() ||
                  ((t = e.match(/<(?:\w+:)?comment[^>]*>/)) &&
                    ((t = {
                      author:
                        ((r = dt(t[0])).authorId && n[r.authorId]) ||
                        "sheetjsghost",
                      ref: r.ref,
                      guid: r.guid,
                    }),
                    (r = Yr(r.ref)),
                    (a.sheetRows && a.sheetRows <= r.r) ||
                      ((e = (!!(e = e.match(
                        /<(?:\w+:)?text>([\s\S]*)<\/(?:\w+:)?text>/,
                      )) &&
                        !!e[1] &&
                        Ai(e[1])) || { r: "", t: "", h: "" }),
                      (t.r = e.r),
                      "<t></t>" == e.r && (e.t = e.h = ""),
                      (t.t = (e.t || "")
                        .replace(/\r\n/g, "\n")
                        .replace(/\r/g, "\n")),
                      a.cellHTML && (t.h = e.h),
                      s.push(t))));
              }),
            s
          );
        })(e, r);
    var a, n, s, i, o;
  }
  function ff(e, t) {
    return ".bin" === t.slice(-4)
      ? ((a = []),
        Mr(e, function (e, t, r) {
          if (63 === r) a.push(e);
          else if (!t.T)
            throw new Error("Unexpected record 0x" + r.toString(16));
        }),
        a)
      : (function (e) {
          var r = [];
          if (!e) return r;
          var a = 1;
          return (
            (e.match(ft) || []).forEach(function (e) {
              var t = dt(e);
              switch (t[0]) {
                case "<?xml":
                  break;
                case "<calcChain":
                case "<calcChain>":
                case "</calcChain>":
                  break;
                case "<c":
                  delete t[0], t.i ? (a = t.i) : (t.i = a), r.push(t);
              }
            }),
            r
          );
        })(e);
    var a;
  }
  function hf(e, t, r, a) {
    if (".bin" === r.slice(-4))
      return (function (e, t) {
        if (!e) return e;
        var a = t || {},
          n = !1;
        Mr(
          e,
          function (e, t, r) {
            switch ((0, r)) {
              case 359:
              case 363:
              case 364:
              case 366:
              case 367:
              case 368:
              case 369:
              case 370:
              case 371:
              case 472:
              case 577:
              case 578:
              case 579:
              case 580:
              case 581:
              case 582:
              case 583:
              case 584:
              case 585:
              case 586:
              case 587:
                break;
              case 35:
                n = !0;
                break;
              case 36:
                n = !1;
                break;
              default:
                if (!t.T && (!n || a.WTF))
                  throw new Error("Unexpected record 0x" + r.toString(16));
            }
          },
          a,
        );
      })(e, a);
  }
  function uf(e, t, r) {
    return ".bin" === t.slice(-4)
      ? ((a = { Types: [], Cell: [], Value: [] }),
        (n = r || {}),
        (i = !(s = [])),
        (o = 2),
        Mr(e, function (e, t, r) {
          switch (r) {
            case 335:
              a.Types.push({ name: e.name });
              break;
            case 51:
              e.forEach(function (e) {
                1 == o
                  ? a.Cell.push({ type: a.Types[e[0] - 1].name, index: e[1] })
                  : 0 == o &&
                    a.Value.push({ type: a.Types[e[0] - 1].name, index: e[1] });
              });
              break;
            case 337:
              o = e ? 1 : 0;
              break;
            case 338:
              o = 2;
              break;
            case 35:
              s.push(r), (i = !0);
              break;
            case 36:
              s.pop(), (i = !1);
              break;
            default:
              if (!t.T && (!i || (n.WTF && 35 != s[s.length - 1])))
                throw new Error("Unexpected record 0x" + r.toString(16));
          }
        }),
        a)
      : (function (e, a) {
          var n = { Types: [], Cell: [], Value: [] };
          if (!e) return n;
          var s,
            i = !1,
            o = 2;
          return (
            e.replace(ft, function (e) {
              var t = dt(e);
              switch (pt(t[0])) {
                case "<?xml":
                  break;
                case "<metadata":
                case "</metadata>":
                  break;
                case "<metadataTypes":
                case "</metadataTypes>":
                  break;
                case "<metadataType":
                  n.Types.push({ name: t.name });
                  break;
                case "</metadataType>":
                  break;
                case "<futureMetadata":
                  for (var r = 0; r < n.Types.length; ++r)
                    n.Types[r].name == t.name && (s = n.Types[r]);
                  break;
                case "</futureMetadata>":
                case "<bk>":
                case "</bk>":
                  break;
                case "<rc":
                  1 == o
                    ? n.Cell.push({ type: n.Types[t.t - 1].name, index: +t.v })
                    : 0 == o &&
                      n.Value.push({
                        type: n.Types[t.t - 1].name,
                        index: +t.v,
                      });
                  break;
                case "</rc>":
                  break;
                case "<cellMetadata":
                  o = 1;
                  break;
                case "</cellMetadata>":
                  o = 2;
                  break;
                case "<valueMetadata":
                  o = 0;
                  break;
                case "</valueMetadata>":
                  o = 2;
                  break;
                case "<extLst":
                case "<extLst>":
                case "</extLst>":
                case "<extLst/>":
                  break;
                case "<ext":
                  i = !0;
                  break;
                case "</ext>":
                  i = !1;
                  break;
                case "<rvb":
                  if (!s) break;
                  s.offsets || (s.offsets = []), s.offsets.push(+t.i);
                  break;
                default:
                  if (!i && a.WTF)
                    throw new Error("unrecognized " + t[0] + " in metadata");
              }
              return e;
            }),
            n
          );
        })(e, r);
    var a, n, s, i, o;
  }
  var df,
    pf = /([\w:]+)=((?:")([^"]*)(?:")|(?:')([^']*)(?:'))/g,
    mf = /([\w:]+)=((?:")(?:[^"]*)(?:")|(?:')(?:[^']*)(?:'))/;
  function gf(e, t) {
    var r = e.split(/\s+/),
      a = [];
    if ((t || (a[0] = r[0]), 1 === r.length)) return a;
    var n,
      s,
      i,
      o = e.match(pf);
    if (o)
      for (i = 0; i != o.length; ++i)
        -1 === (s = (n = o[i].match(mf))[1].indexOf(":"))
          ? (a[n[1]] = n[2].slice(1, n[2].length - 1))
          : (a[
              "xmlns:" === n[1].slice(0, 6)
                ? "xmlns" + n[1].slice(6)
                : n[1].slice(s + 1)
            ] = n[2].slice(1, n[2].length - 1));
    return a;
  }
  function bf(e, t, r) {
    if ("z" !== e.t) {
      if (!r || !1 !== r.cellText)
        try {
          "e" === e.t
            ? (e.w = e.w || Wa[e.v])
            : "General" === t
            ? "n" === e.t
              ? (0 | e.v) === e.v
                ? (e.w = e.v.toString(10))
                : (e.w = D(e.v))
              : (e.w = P(e.v))
            : (e.w =
                ((a = t || "General"),
                (n = e.v),
                "General" === (a = df[a] || wt(a)) ? P(n) : ve(a, n)));
        } catch (e) {
          if (r.WTF) throw e;
        }
      var a, n;
      try {
        var s = df[t] || t || "General";
        r.cellNF && (e.z = s),
          r.cellDates &&
            "n" == e.t &&
            q(s) &&
            (s = L(e.v)) &&
            ((e.t = "d"),
            (e.v = new Date(s.y, s.m - 1, s.d, s.H, s.M, s.S, s.u)));
      } catch (e) {
        if (r.WTF) throw e;
      }
    }
  }
  function vf(e, t) {
    var r = t || {};
    Ee();
    var a,
      n = ne(Jt(e)),
      s = (n =
        "binary" == r.type || "array" == r.type || "base64" == r.type
          ? void 0 !== re
            ? re.utils.decode(65001, ae(n))
            : Mt(n)
          : n)
        .slice(0, 1024)
        .toLowerCase(),
      i = !1;
    if (
      (1023 & (s = s.replace(/".*?"/g, "")).indexOf(">")) >
      Math.min(1023 & s.indexOf(","), 1023 & s.indexOf(";"))
    ) {
      var o = Ve(r);
      return (o.type = "string"), Ks.to_workbook(n, o);
    }
    if (
      (-1 == s.indexOf("<?xml") &&
        ["html", "table", "head", "meta", "script", "style", "div"].forEach(
          function (e) {
            0 <= s.indexOf("<" + e) && (i = !0);
          },
        ),
      i)
    )
      return (function (e, r) {
        e = e.match(/<table[\s\S]*?>[\s\S]*?<\/table>/gi);
        if (!e || 0 == e.length)
          throw new Error("Invalid HTML: could not find <table>");
        if (1 == e.length) return ta(Yf(e[0], r), r);
        var a = du();
        return (
          e.forEach(function (e, t) {
            pu(a, Yf(e, r), "Sheet" + (t + 1));
          }),
          a
        );
      })(n, r);
    df = {
      "General Number": "General",
      "General Date": me[22],
      "Long Date": "dddd, mmmm dd, yyyy",
      "Medium Date": me[15],
      "Short Date": me[14],
      "Long Time": me[19],
      "Medium Time": me[18],
      "Short Time": me[20],
      Currency: '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)',
      Fixed: me[2],
      Standard: me[4],
      Percent: me[10],
      Scientific: me[11],
      "Yes/No": '"Yes";"Yes";"No";@',
      "True/False": '"True";"True";"False";@',
      "On/Off": '"Yes";"Yes";"No";@',
    };
    var c,
      l = [];
    null != oe && null == r.dense && (r.dense = oe);
    var f,
      h = {},
      u = [],
      d = r.dense ? [] : {},
      p = "",
      m = {},
      g = {},
      b = gf('<Data ss:Type="String">'),
      v = 0,
      w = 0,
      T = 0,
      E = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } },
      k = {},
      y = {},
      S = "",
      _ = 0,
      x = [],
      A = {},
      C = {},
      R = 0,
      O = [],
      I = [],
      N = {},
      F = [],
      D = !1,
      P = [],
      L = [],
      M = {},
      U = 0,
      B = 0,
      W = { Sheets: [], WBProps: { date1904: !1 } },
      H = {};
    (qt.lastIndex = 0), (n = n.replace(/<!--([\s\S]*?)-->/gm, ""));
    for (var z, V, G, j, $ = ""; (a = qt.exec(n)); )
      switch ((a[3] = ($ = a[3]).toLowerCase())) {
        case "data":
          if ("data" == $) {
            if ("/" === a[1]) {
              if ((c = l.pop())[0] !== a[3])
                throw new Error("Bad state: " + c.join("|"));
            } else "/" !== a[0].charAt(a[0].length - 2) && l.push([a[3], !0]);
            break;
          }
          if (l[l.length - 1][1]) break;
          "/" === a[1]
            ? (function (e, t, r, a, n, s, i, o, c, l) {
                var f = "General",
                  h = a.StyleID,
                  u = {};
                l = l || {};
                var d = [],
                  p = 0;
                for (
                  void 0 === (h = void 0 === h && o ? o.StyleID : h) &&
                  i &&
                  (h = i.StyleID);
                  void 0 !== s[h] &&
                  (s[h].nf && (f = s[h].nf),
                  s[h].Interior && d.push(s[h].Interior),
                  s[h].Parent);

                )
                  h = s[h].Parent;
                switch (r.Type) {
                  case "Boolean":
                    (a.t = "b"), (a.v = Rt(e));
                    break;
                  case "String":
                    (a.t = "s"),
                      (a.r = At(wt(e))),
                      (a.v =
                        -1 < e.indexOf("<")
                          ? wt(t || e).replace(/<.*?>/g, "")
                          : a.r);
                    break;
                  case "DateTime":
                    "Z" != e.slice(-1) && (e += "Z"),
                      (a.v =
                        (He(e) - new Date(Date.UTC(1899, 11, 30))) / 864e5),
                      a.v != a.v ? (a.v = wt(e)) : a.v < 60 && (a.v = a.v - 1),
                      (f && "General" != f) || (f = "yyyy-mm-dd");
                  case "Number":
                    void 0 === a.v && (a.v = +e), a.t || (a.t = "n");
                    break;
                  case "Error":
                    (a.t = "e"), (a.v = Ha[e]), !1 !== l.cellText && (a.w = e);
                    break;
                  default:
                    "" == e && "" == t
                      ? (a.t = "z")
                      : ((a.t = "s"), (a.v = At(t || e)));
                }
                if ((bf(a, f, l), !1 !== l.cellFormula))
                  if (a.Formula) {
                    r = wt(a.Formula);
                    61 == r.charCodeAt(0) && (r = r.slice(1)),
                      (a.f = oc(r, n)),
                      delete a.Formula,
                      "RC" == a.ArrayRange
                        ? (a.F = oc("RC:RC", n))
                        : a.ArrayRange &&
                          ((a.F = oc(a.ArrayRange, n)), c.push([Zr(a.F), a.F]));
                  } else
                    for (p = 0; p < c.length; ++p)
                      n.r >= c[p][0].s.r &&
                        n.r <= c[p][0].e.r &&
                        n.c >= c[p][0].s.c &&
                        n.c <= c[p][0].e.c &&
                        (a.F = c[p][1]);
                l.cellStyles &&
                  (d.forEach(function (e) {
                    !u.patternType &&
                      e.patternType &&
                      (u.patternType = e.patternType);
                  }),
                  (a.s = u)),
                  void 0 !== a.StyleID && (a.ixfe = a.StyleID);
              })(
                n.slice(v, a.index),
                S,
                b,
                "comment" == l[l.length - 1][0] ? N : m,
                { c: w, r: T },
                k,
                F[w],
                g,
                P,
                r,
              )
            : ((S = ""), (b = gf(a[0])), (v = a.index + a[0].length));
          break;
        case "cell":
          if ("/" === a[1])
            if (
              (0 < I.length && (m.c = I),
              (!r.sheetRows || r.sheetRows > T) &&
                void 0 !== m.v &&
                (r.dense
                  ? (d[T] || (d[T] = []), (d[T][w] = m))
                  : (d[Xr(w) + jr(T)] = m)),
              m.HRef &&
                ((m.l = { Target: wt(m.HRef) }),
                m.HRefScreenTip && (m.l.Tooltip = m.HRefScreenTip),
                delete m.HRef,
                delete m.HRefScreenTip),
              (m.MergeAcross || m.MergeDown) &&
                ((U = w + (0 | parseInt(m.MergeAcross, 10))),
                (B = T + (0 | parseInt(m.MergeDown, 10))),
                x.push({ s: { c: w, r: T }, e: { c: U, r: B } })),
              r.sheetStubs)
            )
              if (m.MergeAcross || m.MergeDown) {
                for (var X = w; X <= U; ++X)
                  for (var Y = T; Y <= B; ++Y)
                    (w < X || T < Y) &&
                      (r.dense
                        ? (d[Y] || (d[Y] = []), (d[Y][X] = { t: "z" }))
                        : (d[Xr(X) + jr(Y)] = { t: "z" }));
                w = U + 1;
              } else ++w;
            else m.MergeAcross ? (w = U + 1) : ++w;
          else
            (w = (m = (function (e) {
              var t = {};
              if (1 === e.split(/\s+/).length) return t;
              var r,
                a,
                n,
                s = e.match(pf);
              if (s)
                for (n = 0; n != s.length; ++n)
                  -1 === (a = (r = s[n].match(mf))[1].indexOf(":"))
                    ? (t[r[1]] = r[2].slice(1, r[2].length - 1))
                    : (t[
                        "xmlns:" === r[1].slice(0, 6)
                          ? "xmlns" + r[1].slice(6)
                          : r[1].slice(a + 1)
                      ] = r[2].slice(1, r[2].length - 1));
              return t;
            })(a[0])).Index
              ? +m.Index - 1
              : w) < E.s.c && (E.s.c = w),
              w > E.e.c && (E.e.c = w),
              "/>" === a[0].slice(-2) && ++w,
              (I = []);
          break;
        case "row":
          "/" === a[1] || "/>" === a[0].slice(-2)
            ? (T < E.s.r && (E.s.r = T),
              T > E.e.r && (E.e.r = T),
              "/>" === a[0].slice(-2) &&
                (g = gf(a[0])).Index &&
                (T = +g.Index - 1),
              (w = 0),
              ++T)
            : ((g = gf(a[0])).Index && (T = +g.Index - 1),
              (M = {}),
              ("0" != g.AutoFitHeight && !g.Height) ||
                ((M.hpx = parseInt(g.Height, 10)),
                (M.hpt = uo(M.hpx)),
                (L[T] = M)),
              "1" == g.Hidden && ((M.hidden = !0), (L[T] = M)));
          break;
        case "worksheet":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
            u.push(p),
              E.s.r <= E.e.r &&
                E.s.c <= E.e.c &&
                ((d["!ref"] = qr(E)),
                r.sheetRows &&
                  r.sheetRows <= E.e.r &&
                  ((d["!fullref"] = d["!ref"]),
                  (E.e.r = r.sheetRows - 1),
                  (d["!ref"] = qr(E)))),
              x.length && (d["!merges"] = x),
              0 < F.length && (d["!cols"] = F),
              0 < L.length && (d["!rows"] = L),
              (h[p] = d);
          } else
            (E = { s: { r: 2e6, c: 2e6 }, e: { r: 0, c: 0 } }),
              (T = w = 0),
              l.push([a[3], !1]),
              (c = gf(a[0])),
              (p = wt(c.Name)),
              (d = r.dense ? [] : {}),
              (x = []),
              (P = []),
              (L = []),
              (H = { name: p, Hidden: 0 }),
              W.Sheets.push(H);
          break;
        case "table":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
          } else {
            if ("/>" == a[0].slice(-2)) break;
            l.push([a[3], !1]), (D = !(F = []));
          }
          break;
        case "style":
          "/" === a[1]
            ? ((V = k),
              (G = y),
              (j = r).cellStyles &&
                (!G.Interior ||
                  ((j = G.Interior).Pattern &&
                    (j.patternType = mo[j.Pattern] || j.Pattern))),
              (V[G.ID] = G))
            : (y = gf(a[0]));
          break;
        case "numberformat":
          (y.nf = wt(gf(a[0]).Format || "General")),
            df[y.nf] && (y.nf = df[y.nf]);
          for (var K = 0; 392 != K && me[K] != y.nf; ++K);
          if (392 == K)
            for (K = 57; 392 != K; ++K)
              if (null == me[K]) {
                we(y.nf, K);
                break;
              }
          break;
        case "column":
          if ("table" !== l[l.length - 1][0]) break;
          if (
            ((f = gf(a[0])).Hidden && ((f.hidden = !0), delete f.Hidden),
            f.Width && (f.wpx = parseInt(f.Width, 10)),
            !D && 10 < f.wpx)
          ) {
            (D = !0), (no = to);
            for (var J = 0; J < F.length; ++J) F[J] && fo(F[J]);
          }
          D && fo(f), (F[f.Index - 1 || F.length] = f);
          for (var q = 0; q < +f.Span; ++q) F[F.length] = Ve(f);
          break;
        case "namedrange":
          if ("/" === a[1]) break;
          W.Names || (W.Names = []);
          var Z = dt(a[0]),
            Q = { Name: Z.Name, Ref: oc(Z.RefersTo.slice(1), { r: 0, c: 0 }) };
          0 < W.Sheets.length && (Q.Sheet = W.Sheets.length - 1),
            W.Names.push(Q);
          break;
        case "namedcell":
        case "b":
        case "i":
        case "u":
        case "s":
        case "em":
        case "h2":
        case "h3":
        case "sub":
        case "sup":
        case "span":
        case "alignment":
        case "borders":
        case "border":
          break;
        case "font":
          if ("/>" === a[0].slice(-2)) break;
          "/" === a[1]
            ? (S += n.slice(_, a.index))
            : (_ = a.index + a[0].length);
          break;
        case "interior":
          if (!r.cellStyles) break;
          y.Interior = gf(a[0]);
          break;
        case "protection":
          break;
        case "author":
        case "title":
        case "description":
        case "created":
        case "keywords":
        case "subject":
        case "category":
        case "company":
        case "lastauthor":
        case "lastsaved":
        case "lastprinted":
        case "version":
        case "revision":
        case "totaltime":
        case "hyperlinkbase":
        case "manager":
        case "contentstatus":
        case "identifier":
        case "language":
        case "appname":
          if ("/>" === a[0].slice(-2)) break;
          "/" === a[1]
            ? ((G = A),
              (Z = $),
              (Q = n.slice(R, a.index)),
              (G[(Z = (un = un || Ie(dn))[Z] || Z)] = Q))
            : (R = a.index + a[0].length);
          break;
        case "paragraphs":
          break;
        case "styles":
        case "workbook":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
          } else l.push([a[3], !1]);
          break;
        case "comment":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
            ((z = N).t = z.v || ""),
              (z.t = z.t.replace(/\r\n/g, "\n").replace(/\r/g, "\n")),
              (z.v = z.w = z.ixfe = void 0),
              I.push(N);
          } else l.push([a[3], !1]), (N = { a: (c = gf(a[0])).Author });
          break;
        case "autofilter":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
          } else
            "/" !== a[0].charAt(a[0].length - 2) &&
              ((z = gf(a[0])),
              (d["!autofilter"] = { ref: oc(z.Range).replace(/\$/g, "") }),
              l.push([a[3], !0]));
          break;
        case "name":
          break;
        case "datavalidation":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
          } else "/" !== a[0].charAt(a[0].length - 2) && l.push([a[3], !0]);
          break;
        case "pixelsperinch":
          break;
        case "componentoptions":
        case "documentproperties":
        case "customdocumentproperties":
        case "officedocumentsettings":
        case "pivottable":
        case "pivotcache":
        case "names":
        case "mapinfo":
        case "pagebreaks":
        case "querytable":
        case "sorting":
        case "schema":
        case "conditionalformatting":
        case "smarttagtype":
        case "smarttags":
        case "excelworkbook":
        case "workbookoptions":
        case "worksheetoptions":
          if ("/" === a[1]) {
            if ((c = l.pop())[0] !== a[3])
              throw new Error("Bad state: " + c.join("|"));
          } else "/" !== a[0].charAt(a[0].length - 2) && l.push([a[3], !0]);
          break;
        case "null":
          break;
        default:
          if (0 == l.length && "document" == a[3]) return ih(n, r);
          if (0 == l.length && "uof" == a[3]) return ih(n, r);
          var ee = !0;
          switch (l[l.length - 1][0]) {
            case "officedocumentsettings":
              switch (a[3]) {
                case "allowpng":
                case "removepersonalinformation":
                case "downloadcomponents":
                case "locationofcomponents":
                case "colors":
                case "color":
                case "index":
                case "rgb":
                case "targetscreensize":
                case "readonlyrecommended":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "componentoptions":
              switch (a[3]) {
                case "toolbar":
                case "hideofficelogo":
                case "spreadsheetautofit":
                case "label":
                case "caption":
                case "maxheight":
                case "maxwidth":
                case "nextsheetnumber":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "excelworkbook":
              switch (a[3]) {
                case "date1904":
                  W.WBProps.date1904 = !0;
                  break;
                case "windowheight":
                case "windowwidth":
                case "windowtopx":
                case "windowtopy":
                case "tabratio":
                case "protectstructure":
                case "protectwindow":
                case "protectwindows":
                case "activesheet":
                case "displayinknotes":
                case "firstvisiblesheet":
                case "supbook":
                case "sheetname":
                case "sheetindex":
                case "sheetindexfirst":
                case "sheetindexlast":
                case "dll":
                case "acceptlabelsinformulas":
                case "donotsavelinkvalues":
                case "iteration":
                case "maxiterations":
                case "maxchange":
                case "path":
                case "xct":
                case "count":
                case "selectedsheets":
                case "calculation":
                case "uncalced":
                case "startupprompt":
                case "crn":
                case "externname":
                case "formula":
                case "colfirst":
                case "collast":
                case "wantadvise":
                case "boolean":
                case "error":
                case "text":
                case "ole":
                case "noautorecover":
                case "publishobjects":
                case "donotcalculatebeforesave":
                case "number":
                case "refmoder1c1":
                case "embedsavesmarttags":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "workbookoptions":
              switch (a[3]) {
                case "owcversion":
                case "height":
                case "width":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "worksheetoptions":
              switch (a[3]) {
                case "visible":
                  if ("/>" !== a[0].slice(-2))
                    if ("/" === a[1])
                      switch (n.slice(R, a.index)) {
                        case "SheetHidden":
                          H.Hidden = 1;
                          break;
                        case "SheetVeryHidden":
                          H.Hidden = 2;
                      }
                    else R = a.index + a[0].length;
                  break;
                case "header":
                  d["!margins"] || Qc((d["!margins"] = {}), "xlml"),
                    isNaN(+dt(a[0]).Margin) ||
                      (d["!margins"].header = +dt(a[0]).Margin);
                  break;
                case "footer":
                  d["!margins"] || Qc((d["!margins"] = {}), "xlml"),
                    isNaN(+dt(a[0]).Margin) ||
                      (d["!margins"].footer = +dt(a[0]).Margin);
                  break;
                case "pagemargins":
                  var te = dt(a[0]);
                  d["!margins"] || Qc((d["!margins"] = {}), "xlml"),
                    isNaN(+te.Top) || (d["!margins"].top = +te.Top),
                    isNaN(+te.Left) || (d["!margins"].left = +te.Left),
                    isNaN(+te.Right) || (d["!margins"].right = +te.Right),
                    isNaN(+te.Bottom) || (d["!margins"].bottom = +te.Bottom);
                  break;
                case "displayrighttoleft":
                  W.Views || (W.Views = []),
                    W.Views[0] || (W.Views[0] = {}),
                    (W.Views[0].RTL = !0);
                  break;
                case "freezepanes":
                case "frozennosplit":
                  break;
                case "splithorizontal":
                case "splitvertical":
                case "donotdisplaygridlines":
                case "activerow":
                case "activecol":
                case "toprowbottompane":
                case "leftcolumnrightpane":
                case "unsynced":
                case "print":
                case "printerrors":
                case "panes":
                case "scale":
                case "pane":
                case "number":
                case "layout":
                case "pagesetup":
                case "selected":
                case "protectobjects":
                case "enableselection":
                case "protectscenarios":
                case "validprinterinfo":
                case "horizontalresolution":
                case "verticalresolution":
                case "numberofcopies":
                case "activepane":
                case "toprowvisible":
                case "leftcolumnvisible":
                case "fittopage":
                case "rangeselection":
                case "papersizeindex":
                case "pagelayoutzoom":
                case "pagebreakzoom":
                case "filteron":
                case "fitwidth":
                case "fitheight":
                case "commentslayout":
                case "zoom":
                case "lefttoright":
                case "gridlines":
                case "allowsort":
                case "allowfilter":
                case "allowinsertrows":
                case "allowdeleterows":
                case "allowinsertcols":
                case "allowdeletecols":
                case "allowinserthyperlinks":
                case "allowformatcells":
                case "allowsizecols":
                case "allowsizerows":
                  break;
                case "nosummaryrowsbelowdetail":
                  d["!outline"] || (d["!outline"] = {}),
                    (d["!outline"].above = !0);
                  break;
                case "tabcolorindex":
                case "donotdisplayheadings":
                case "showpagelayoutzoom":
                  break;
                case "nosummarycolumnsrightdetail":
                  d["!outline"] || (d["!outline"] = {}),
                    (d["!outline"].left = !0);
                  break;
                case "blackandwhite":
                case "donotdisplayzeros":
                case "displaypagebreak":
                case "rowcolheadings":
                case "donotdisplayoutline":
                case "noorientation":
                case "allowusepivottables":
                case "zeroheight":
                case "viewablerange":
                case "selection":
                case "protectcontents":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "pivottable":
            case "pivotcache":
              switch (a[3]) {
                case "immediateitemsondrop":
                case "showpagemultipleitemlabel":
                case "compactrowindent":
                case "location":
                case "pivotfield":
                case "orientation":
                case "layoutform":
                case "layoutsubtotallocation":
                case "layoutcompactrow":
                case "position":
                case "pivotitem":
                case "datatype":
                case "datafield":
                case "sourcename":
                case "parentfield":
                case "ptlineitems":
                case "ptlineitem":
                case "countofsameitems":
                case "item":
                case "itemtype":
                case "ptsource":
                case "cacheindex":
                case "consolidationreference":
                case "filename":
                case "reference":
                case "nocolumngrand":
                case "norowgrand":
                case "blanklineafteritems":
                case "hidden":
                case "subtotal":
                case "basefield":
                case "mapchilditems":
                case "function":
                case "refreshonfileopen":
                case "printsettitles":
                case "mergelabels":
                case "defaultversion":
                case "refreshname":
                case "refreshdate":
                case "refreshdatecopy":
                case "versionlastrefresh":
                case "versionlastupdate":
                case "versionupdateablemin":
                case "versionrefreshablemin":
                case "calculation":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "pagebreaks":
              switch (a[3]) {
                case "colbreaks":
                case "colbreak":
                case "rowbreaks":
                case "rowbreak":
                case "colstart":
                case "colend":
                case "rowend":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "autofilter":
              switch (a[3]) {
                case "autofiltercolumn":
                case "autofiltercondition":
                case "autofilterand":
                case "autofilteror":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "querytable":
              switch (a[3]) {
                case "id":
                case "autoformatfont":
                case "autoformatpattern":
                case "querysource":
                case "querytype":
                case "enableredirections":
                case "refreshedinxl9":
                case "urlstring":
                case "htmltables":
                case "connection":
                case "commandtext":
                case "refreshinfo":
                case "notitles":
                case "nextid":
                case "columninfo":
                case "overwritecells":
                case "donotpromptforfile":
                case "textwizardsettings":
                case "source":
                case "number":
                case "decimal":
                case "thousandseparator":
                case "trailingminusnumbers":
                case "formatsettings":
                case "fieldtype":
                case "delimiters":
                case "tab":
                case "comma":
                case "autoformatname":
                case "versionlastedit":
                case "versionlastrefresh":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "datavalidation":
              switch (a[3]) {
                case "range":
                case "type":
                case "min":
                case "max":
                case "sort":
                case "descending":
                case "order":
                case "casesensitive":
                case "value":
                case "errorstyle":
                case "errormessage":
                case "errortitle":
                case "inputmessage":
                case "inputtitle":
                case "combohide":
                case "inputhide":
                case "condition":
                case "qualifier":
                case "useblank":
                case "value1":
                case "value2":
                case "format":
                case "cellrangelist":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "sorting":
            case "conditionalformatting":
              switch (a[3]) {
                case "range":
                case "type":
                case "min":
                case "max":
                case "sort":
                case "descending":
                case "order":
                case "casesensitive":
                case "value":
                case "errorstyle":
                case "errormessage":
                case "errortitle":
                case "cellrangelist":
                case "inputmessage":
                case "inputtitle":
                case "combohide":
                case "inputhide":
                case "condition":
                case "qualifier":
                case "useblank":
                case "value1":
                case "value2":
                case "format":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "mapinfo":
            case "schema":
            case "data":
              switch (a[3]) {
                case "map":
                case "entry":
                case "range":
                case "xpath":
                case "field":
                case "xsdtype":
                case "filteron":
                case "aggregate":
                case "elementtype":
                case "attributetype":
                  break;
                case "schema":
                case "element":
                case "complextype":
                case "datatype":
                case "all":
                case "attribute":
                case "extends":
                case "row":
                  break;
                default:
                  ee = !1;
              }
              break;
            case "smarttags":
              break;
            default:
              ee = !1;
          }
          if (ee) break;
          if (a[3].match(/!\[CDATA/)) break;
          if (!l[l.length - 1][1])
            throw "Unrecognized tag: " + a[3] + "|" + l.join("|");
          if ("customdocumentproperties" === l[l.length - 1][0]) {
            if ("/>" === a[0].slice(-2)) break;
            "/" === a[1]
              ? (function (e, t, r, a) {
                  var n = a;
                  switch ((r[0].match(/dt:dt="([\w.]+)"/) || ["", ""])[1]) {
                    case "boolean":
                      n = Rt(a);
                      break;
                    case "i2":
                    case "int":
                      n = parseInt(a, 10);
                      break;
                    case "r4":
                    case "float":
                      n = parseFloat(a);
                      break;
                    case "date":
                    case "dateTime.tz":
                      n = He(a);
                      break;
                    case "i8":
                    case "string":
                    case "fixed":
                    case "uuid":
                    case "bin.base64":
                      break;
                    default:
                      throw new Error("bad custprop:" + r[0]);
                  }
                  e[wt(t)] = n;
                })(C, $, O, n.slice(R, a.index))
              : (R = (O = a).index + a[0].length);
            break;
          }
          if (r.WTF) throw "Unrecognized tag: " + a[3] + "|" + l.join("|");
      }
    o = {};
    return (
      r.bookSheets || r.bookProps || (o.Sheets = h),
      (o.SheetNames = u),
      (o.Workbook = W),
      (o.SSF = Ve(me)),
      (o.Props = A),
      (o.Custprops = C),
      o
    );
  }
  function wf(e, t) {
    switch ((Mh((t = t || {})), t.type || "base64")) {
      case "base64":
        return vf(te(e), t);
      case "binary":
      case "buffer":
      case "file":
        return vf(e, t);
      case "array":
        return vf(i(e), t);
    }
  }
  function Tf(e, t) {
    var r,
      a,
      n,
      s,
      i,
      o,
      c,
      l = [];
    return (
      e.Props &&
        l.push(
          ((r = e.Props),
          (a = t),
          (n = []),
          Re(dn)
            .map(function (e) {
              for (var t = 0; t < en.length; ++t)
                if (en[t][1] == e) return en[t];
              for (t = 0; t < sn.length; ++t) if (sn[t][1] == e) return sn[t];
              throw e;
            })
            .forEach(function (e) {
              var t;
              null != r[e[1]] &&
                ((t = (a && a.Props && null != a.Props[e[1]] ? a.Props : r)[
                  e[1]
                ]),
                "number" ==
                typeof (t =
                  "date" === e[2]
                    ? new Date(t).toISOString().replace(/\.\d*Z/, "Z")
                    : t)
                  ? (t = String(t))
                  : !0 === t || !1 === t
                  ? (t = t ? "1" : "0")
                  : t instanceof Date &&
                    (t = new Date(t).toISOString().replace(/\.\d*Z/, "")),
                n.push($t(dn[e[1]] || e[1], t)));
            }),
          Yt("DocumentProperties", n.join(""), { xmlns: er.o })),
        ),
      e.Custprops &&
        l.push(
          ((s = e.Props),
          (i = e.Custprops),
          (o = ["Worksheets", "SheetNames"]),
          (e = "CustomDocumentProperties"),
          (c = []),
          s &&
            Re(s).forEach(function (e) {
              if (Object.prototype.hasOwnProperty.call(s, e)) {
                for (var t = 0; t < en.length; ++t) if (e == en[t][1]) return;
                for (t = 0; t < sn.length; ++t) if (e == sn[t][1]) return;
                for (t = 0; t < o.length; ++t) if (e == o[t]) return;
                var r = "string",
                  a =
                    "number" == typeof (a = s[e])
                      ? ((r = "float"), String(a))
                      : !0 === a || !1 === a
                      ? ((r = "boolean"), a ? "1" : "0")
                      : String(a);
                c.push(Yt(yt(e), a, { "dt:dt": r }));
              }
            }),
          i &&
            Re(i).forEach(function (e) {
              var t, r;
              Object.prototype.hasOwnProperty.call(i, e) &&
                ((s && Object.prototype.hasOwnProperty.call(s, e)) ||
                  ((t = "string"),
                  (r =
                    "number" == typeof (r = i[e])
                      ? ((t = "float"), String(r))
                      : !0 === r || !1 === r
                      ? ((t = "boolean"), r ? "1" : "0")
                      : r instanceof Date
                      ? ((t = "dateTime.tz"), r.toISOString())
                      : String(r)),
                  c.push(Yt(yt(e), r, { "dt:dt": t }))));
            }),
          "<" + e + ' xmlns="' + er.o + '">' + c.join("") + "</" + e + ">"),
        ),
      l.join("")
    );
  }
  function Ef(e) {
    return Yt("NamedRange", null, {
      "ss:Name": e.Name,
      "ss:RefersTo": "=" + fc(e.Ref, { r: 0, c: 0 }),
    });
  }
  function kf(e, t, r, a, n, s, i) {
    if (!e || (null == e.v && null == e.f)) return "";
    var o = {};
    if (
      (e.f && (o["ss:Formula"] = "=" + kt(fc(e.f, i))),
      e.F &&
        e.F.slice(0, t.length) == t &&
        ((t = Yr(e.F.slice(t.length + 1))),
        (o["ss:ArrayRange"] =
          "RC:R" +
          (t.r == i.r ? "" : "[" + (t.r - i.r) + "]") +
          "C" +
          (t.c == i.c ? "" : "[" + (t.c - i.c) + "]"))),
      e.l &&
        e.l.Target &&
        ((o["ss:HRef"] = kt(e.l.Target)),
        e.l.Tooltip && (o["x:HRefScreenTip"] = kt(e.l.Tooltip))),
      r["!merges"])
    )
      for (var c = r["!merges"], l = 0; l != c.length; ++l)
        c[l].s.c == i.c &&
          c[l].s.r == i.r &&
          (c[l].e.c > c[l].s.c && (o["ss:MergeAcross"] = c[l].e.c - c[l].s.c),
          c[l].e.r > c[l].s.r && (o["ss:MergeDown"] = c[l].e.r - c[l].s.r));
    var f = "",
      h = "";
    switch (e.t) {
      case "z":
        if (!a.sheetStubs) return "";
        break;
      case "n":
        (f = "Number"), (h = String(e.v));
        break;
      case "b":
        (f = "Boolean"), (h = e.v ? "1" : "0");
        break;
      case "e":
        (f = "Error"), (h = Wa[e.v]);
        break;
      case "d":
        (f = "DateTime"),
          (h = new Date(e.v).toISOString()),
          null == e.z && (e.z = e.z || me[14]);
        break;
      case "s":
        (f = "String"),
          (h = ((e.v || "") + "")
            .replace(Tt, function (e) {
              return vt[e];
            })
            .replace(St, function (e) {
              return "&#x" + e.charCodeAt(0).toString(16).toUpperCase() + ";";
            }));
    }
    r = el(a.cellXfs, e, a);
    (o["ss:StyleID"] = "s" + (21 + r)), (o["ss:Index"] = i.c + 1);
    (r = null != e.v ? h : ""),
      (r = "z" == e.t ? "" : '<Data ss:Type="' + f + '">' + r + "</Data>");
    return (
      0 < (e.c || []).length &&
        (r += e.c
          .map(function (e) {
            var t = Yt(
              "ss:Data",
              (e.t || "").replace(/(\r\n|[\r\n])/g, "&#10;"),
              { xmlns: "http://www.w3.org/TR/REC-html40" },
            );
            return Yt("Comment", t, { "ss:Author": e.a });
          })
          .join("")),
      Yt("Cell", r, o)
    );
  }
  function yf(e, t) {
    if (!e["!ref"]) return "";
    var r = Zr(e["!ref"]),
      a = e["!merges"] || [],
      n = 0,
      s = [];
    e["!cols"] &&
      e["!cols"].forEach(function (e, t) {
        fo(e);
        var r = !!e.width,
          a = Zc(t, e),
          t = { "ss:Index": t + 1 };
        r && (t["ss:Width"] = so(a.width)),
          e.hidden && (t["ss:Hidden"] = "1"),
          s.push(Yt("Column", null, t));
      });
    for (var i, o, c = Array.isArray(e), l = r.s.r; l <= r.e.r; ++l) {
      for (
        var f = [
            ((i = l),
            (o = (e["!rows"] || [])[l]),
            (i = '<Row ss:Index="' + (i + 1) + '"'),
            o &&
              (o.hpt && !o.hpx && (o.hpx = po(o.hpt)),
              o.hpx && (i += ' ss:AutoFitHeight="0" ss:Height="' + o.hpx + '"'),
              o.hidden && (i += ' ss:Hidden="1"')),
            i + ">"),
          ],
          h = r.s.c;
        h <= r.e.c;
        ++h
      ) {
        for (var u, d, p, m = !1, n = 0; n != a.length; ++n)
          if (!(a[n].s.c > h || a[n].s.r > l || a[n].e.c < h || a[n].e.r < l)) {
            (a[n].s.c == h && a[n].s.r == l) || (m = !0);
            break;
          }
        m ||
          ((d = Kr((u = { r: l, c: h }))),
          (p = c ? (e[l] || [])[h] : e[d]),
          f.push(kf(p, d, e, t, 0, 0, u)));
      }
      f.push("</Row>"), 2 < f.length && s.push(f.join(""));
    }
    return s.join("");
  }
  function Sf(e, t, r) {
    var a = [],
      n = r.SheetNames[e],
      s = r.Sheets[n],
      n = s
        ? (function (e, t, r) {
            if (!e) return "";
            if (!((r || {}).Workbook || {}).Names) return "";
            for (var a = r.Workbook.Names, n = [], s = 0; s < a.length; ++s) {
              var i = a[s];
              i.Sheet == t && (i.Name.match(/^_xlfn\./) || n.push(Ef(i)));
            }
            return n.join("");
          })(s, e, r)
        : "";
    return (
      0 < n.length && a.push("<Names>" + n + "</Names>"),
      0 < (n = s ? yf(s, t) : "").length && a.push("<Table>" + n + "</Table>"),
      a.push(
        (function (t, e, r) {
          if (!t) return "";
          var a = [];
          if (
            (t["!margins"] &&
              (a.push("<PageSetup>"),
              t["!margins"].header &&
                a.push(
                  Yt("Header", null, { "x:Margin": t["!margins"].header }),
                ),
              t["!margins"].footer &&
                a.push(
                  Yt("Footer", null, { "x:Margin": t["!margins"].footer }),
                ),
              a.push(
                Yt("PageMargins", null, {
                  "x:Bottom": t["!margins"].bottom || "0.75",
                  "x:Left": t["!margins"].left || "0.7",
                  "x:Right": t["!margins"].right || "0.7",
                  "x:Top": t["!margins"].top || "0.75",
                }),
              ),
              a.push("</PageSetup>")),
            r && r.Workbook && r.Workbook.Sheets && r.Workbook.Sheets[e])
          )
            if (r.Workbook.Sheets[e].Hidden)
              a.push(
                Yt(
                  "Visible",
                  1 == r.Workbook.Sheets[e].Hidden
                    ? "SheetHidden"
                    : "SheetVeryHidden",
                  {},
                ),
              );
            else {
              for (
                var n = 0;
                n < e && (!r.Workbook.Sheets[n] || r.Workbook.Sheets[n].Hidden);
                ++n
              );
              n == e && a.push("<Selected/>");
            }
          return (
            ((((r || {}).Workbook || {}).Views || [])[0] || {}).RTL &&
              a.push("<DisplayRightToLeft/>"),
            t["!protect"] &&
              (a.push($t("ProtectContents", "True")),
              t["!protect"].objects && a.push($t("ProtectObjects", "True")),
              t["!protect"].scenarios && a.push($t("ProtectScenarios", "True")),
              null == t["!protect"].selectLockedCells ||
              t["!protect"].selectLockedCells
                ? null == t["!protect"].selectUnlockedCells ||
                  t["!protect"].selectUnlockedCells ||
                  a.push($t("EnableSelection", "UnlockedCells"))
                : a.push($t("EnableSelection", "NoSelection")),
              [
                ["formatCells", "AllowFormatCells"],
                ["formatColumns", "AllowSizeCols"],
                ["formatRows", "AllowSizeRows"],
                ["insertColumns", "AllowInsertCols"],
                ["insertRows", "AllowInsertRows"],
                ["insertHyperlinks", "AllowInsertHyperlinks"],
                ["deleteColumns", "AllowDeleteCols"],
                ["deleteRows", "AllowDeleteRows"],
                ["sort", "AllowSort"],
                ["autoFilter", "AllowFilter"],
                ["pivotTables", "AllowUsePivotTables"],
              ].forEach(function (e) {
                t["!protect"][e[0]] && a.push("<" + e[1] + "/>");
              })),
            0 == a.length
              ? ""
              : Yt("WorksheetOptions", a.join(""), { xmlns: er.x })
          );
        })(s, e, r),
      ),
      a.join("")
    );
  }
  function _f(e, t) {
    (t = t || {}),
      e.SSF || (e.SSF = Ve(me)),
      e.SSF &&
        (Ee(),
        Te(e.SSF),
        (t.revssf = Ne(e.SSF)),
        (t.revssf[e.SSF[65535]] = 0),
        (t.ssf = e.SSF),
        (t.cellXfs = []),
        el(t.cellXfs, {}, { revssf: { General: 0 } }));
    var r = [];
    r.push(Tf(e, t)), r.push(""), r.push(""), r.push("");
    for (var a, n = 0; n < e.SheetNames.length; ++n)
      r.push(Yt("Worksheet", Sf(n, t, e), { "ss:Name": kt(e.SheetNames[n]) }));
    return (
      (r[2] =
        ((a = [
          '<Style ss:ID="Default" ss:Name="Normal"><NumberFormat/></Style>',
        ]),
        t.cellXfs.forEach(function (e, t) {
          var r = [];
          r.push(Yt("NumberFormat", null, { "ss:Format": kt(me[e.numFmtId]) }));
          t = { "ss:ID": "s" + (21 + t) };
          a.push(Yt("Style", r.join(""), t));
        }),
        Yt("Styles", a.join("")))),
      (r[3] = (function (e) {
        if (!((e || {}).Workbook || {}).Names) return "";
        for (var t = e.Workbook.Names, r = [], a = 0; a < t.length; ++a) {
          var n = t[a];
          null == n.Sheet && (n.Name.match(/^_xlfn\./) || r.push(Ef(n)));
        }
        return Yt("Names", r.join(""));
      })(e)),
      ot +
        Yt("Workbook", r.join(""), {
          xmlns: er.ss,
          "xmlns:o": er.o,
          "xmlns:x": er.x,
          "xmlns:ss": er.ss,
          "xmlns:dt": er.dt,
          "xmlns:html": er.html,
        })
    );
  }
  function xf(e) {
    var t = {},
      r = e.content;
    if (
      ((r.l = 28),
      (t.AnsiUserType = r.read_shift(0, "lpstr-ansi")),
      (t.AnsiClipboardFormat = Ra(r, 1)),
      r.length - r.l <= 4)
    )
      return t;
    e = r.read_shift(4);
    return 0 == e || 40 < e
      ? t
      : ((r.l -= 4),
        (t.Reserved1 = r.read_shift(0, "lpstr-ansi")),
        r.length - r.l <= 4 || 1907505652 !== (e = r.read_shift(4))
          ? t
          : ((t.UnicodeClipboardFormat = Ra(r, 2)),
            0 == (e = r.read_shift(4)) || 40 < e
              ? t
              : ((r.l -= 4), void (t.Reserved2 = r.read_shift(0, "lpwstr")))));
  }
  var Af = [60, 1084, 2066, 2165, 2175];
  function Cf(e, t, r) {
    if ("z" !== e.t && e.XF) {
      var a,
        n = 0;
      try {
        (n = e.z || e.XF.numFmtId || 0), t.cellNF && (e.z = me[n]);
      } catch (e) {
        if (t.WTF) throw e;
      }
      if (!t || !1 !== t.cellText)
        try {
          "e" === e.t
            ? (e.w = e.w || Wa[e.v])
            : 0 === n || "General" == n
            ? "n" === e.t
              ? (0 | e.v) === e.v
                ? (e.w = e.v.toString(10))
                : (e.w = D(e.v))
              : (e.w = P(e.v))
            : (e.w = ve(n, e.v, { date1904: !!r, dateNF: t && t.dateNF }));
        } catch (e) {
          if (t.WTF) throw e;
        }
      t.cellDates &&
        n &&
        "n" == e.t &&
        q(me[n] || String(n)) &&
        (a = L(e.v)) &&
        ((e.t = "d"), (e.v = new Date(a.y, a.m - 1, a.d, a.H, a.M, a.S, a.u)));
    }
  }
  function Rf(e, t, r) {
    return { v: e, ixfe: t, t: r };
  }
  function Of(e, t) {
    var r = { opts: {} },
      a = {};
    null != oe && null == t.dense && (t.dense = oe);
    function o(e) {
      return (!(e < 8) && e < 64 && k[e - 8]) || Ba[e];
    }
    function n(e, t, r) {
      if (!(1 < D || (r.sheetRows && e.r >= r.sheetRows))) {
        var a, n, s;
        if (
          (r.cellStyles &&
            t.XF &&
            t.XF.data &&
            ((n = r),
            (s = (a = t).XF.data) &&
              s.patternType &&
              n &&
              n.cellStyles &&
              ((a.s = {}),
              (a.s.patternType = s.patternType),
              (n = Qi(o(s.icvFore))) && (a.s.fgColor = { rgb: n }),
              (n = Qi(o(s.icvBack))) && (a.s.bgColor = { rgb: n }))),
          delete t.ixfe,
          delete t.XF,
          (v = Kr((c = e))),
          (d && d.s && d.e) || (d = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
          e.r < d.s.r && (d.s.r = e.r),
          e.c < d.s.c && (d.s.c = e.c),
          e.r + 1 > d.e.r && (d.e.r = e.r + 1),
          e.c + 1 > d.e.c && (d.e.c = e.c + 1),
          r.cellFormula && t.f)
        )
          for (var i = 0; i < T.length; ++i)
            if (
              !(
                T[i][0].s.c > e.c ||
                T[i][0].s.r > e.r ||
                T[i][0].e.c < e.c ||
                T[i][0].e.r < e.r
              )
            ) {
              (t.F = qr(T[i][0])),
                (T[i][0].s.c == e.c && T[i][0].s.r == e.r) || delete t.f,
                t.f && (t.f = "" + Pc(T[i][1], 0, e, I, _));
              break;
            }
        r.dense ? (h[e.r] || (h[e.r] = []), (h[e.r][e.c] = t)) : (h[v] = t);
      }
    }
    var c,
      s,
      i,
      l,
      f,
      h = t.dense ? [] : {},
      u = {},
      d = {},
      p = null,
      m = [],
      g = "",
      b = {},
      v = "",
      w = {},
      T = [],
      E = [],
      k = [],
      y = { Sheets: [], WBProps: { date1904: !1 }, Views: [{}] },
      S = {},
      _ = {
        enc: !1,
        sbcch: 0,
        snames: [],
        sharedf: w,
        arrayf: T,
        rrtabid: [],
        lastuser: "",
        biff: 8,
        codepage: 0,
        winlocked: 0,
        cellStyles: !!t && !!t.cellStyles,
        WTF: !!t && !!t.wtf,
      };
    t.password && (_.password = t.password);
    var x = [],
      A = [],
      C = [],
      R = [],
      O = !1,
      I = [];
    (I.SheetNames = _.snames),
      (I.sharedf = _.sharedf),
      (I.arrayf = _.arrayf),
      (I.names = []),
      (I.XTI = []);
    var N,
      F = 0,
      D = 0,
      P = 0,
      L = [],
      M = [];
    (_.codepage = 1200), ie(1200);
    for (var U = !1; e.l < e.length - 1; ) {
      var B = e.l,
        W = e.read_shift(2);
      if (0 === W && 10 === F) break;
      var H = e.l === e.length ? 0 : e.read_shift(2),
        z = Pf[W];
      if (z && z.f) {
        if (t.bookSheets && 133 === F && 133 !== W) break;
        if (((F = W), 2 === z.r || 12 == z.r)) {
          var V = e.read_shift(2);
          if (
            ((H -= 2), !_.enc && V !== W && (((255 & V) << 8) | (V >> 8)) !== W)
          )
            throw new Error("rt mismatch: " + V + "!=" + W);
          12 == z.r && ((e.l += 10), (H -= 10));
        }
        var G,
          j,
          $,
          X = {},
          X =
            10 === W
              ? z.f(e, H, _)
              : (function (e, t, r, a, n) {
                  var s = a,
                    i = [],
                    o = r.slice(r.l, r.l + s);
                  if (n && n.enc && n.enc.insitu && 0 < o.length)
                    switch (e) {
                      case 9:
                      case 521:
                      case 1033:
                      case 2057:
                      case 47:
                      case 405:
                      case 225:
                      case 406:
                      case 312:
                      case 404:
                      case 10:
                      case 133:
                        break;
                      default:
                        n.enc.insitu(o);
                    }
                  i.push(o), (r.l += s);
                  for (
                    var c = yr(r, r.l), l = Pf[c], f = 0;
                    null != l && -1 < Af.indexOf(c);

                  )
                    (s = yr(r, r.l + 2)),
                      (f = r.l + 4),
                      2066 == c
                        ? (f += 4)
                        : (2165 != c && 2175 != c) || (f += 12),
                      (o = r.slice(f, r.l + 4 + s)),
                      i.push(o),
                      (r.l += 4 + s),
                      (l = Pf[(c = yr(r, r.l))]);
                  var h = ue(i);
                  Dr(h, 0);
                  var u = 0;
                  h.lens = [];
                  for (var d = 0; d < i.length; ++d)
                    h.lens.push(u), (u += i[d].length);
                  if (h.length < a)
                    throw (
                      "XLS Record 0x" +
                      e.toString(16) +
                      " Truncated: " +
                      h.length +
                      " < " +
                      a
                    );
                  return t.f(h, h.length, n);
                })(W, z, e, H, _);
        if (0 != D || -1 !== [9, 521, 1033, 2057].indexOf(F))
          switch (W) {
            case 34:
              r.opts.Date1904 = y.WBProps.date1904 = X;
              break;
            case 134:
              r.opts.WriteProtect = !0;
              break;
            case 47:
              if ((_.enc || (e.l = 0), (_.enc = X), !t.password))
                throw new Error("File is password-protected");
              if (null == X.valid)
                throw new Error("Encryption scheme unsupported");
              if (!X.valid) throw new Error("Password is incorrect");
              break;
            case 92:
              _.lastuser = X;
              break;
            case 66:
              var Y = Number(X);
              switch (Y) {
                case 21010:
                  Y = 1200;
                  break;
                case 32768:
                  Y = 1e4;
                  break;
                case 32769:
                  Y = 1252;
              }
              ie((_.codepage = Y)), (U = !0);
              break;
            case 317:
              _.rrtabid = X;
              break;
            case 25:
              _.winlocked = X;
              break;
            case 439:
              r.opts.RefreshAll = X;
              break;
            case 12:
              r.opts.CalcCount = X;
              break;
            case 16:
              r.opts.CalcDelta = X;
              break;
            case 17:
              r.opts.CalcIter = X;
              break;
            case 13:
              r.opts.CalcMode = X;
              break;
            case 14:
              r.opts.CalcPrecision = X;
              break;
            case 95:
              r.opts.CalcSaveRecalc = X;
              break;
            case 15:
              _.CalcRefMode = X;
              break;
            case 2211:
              r.opts.FullCalc = X;
              break;
            case 129:
              X.fDialog && (h["!type"] = "dialog"),
                X.fBelow ||
                  ((h["!outline"] || (h["!outline"] = {})).above = !0),
                X.fRight || ((h["!outline"] || (h["!outline"] = {})).left = !0);
              break;
            case 224:
              E.push(X);
              break;
            case 430:
              I.push([X]), (I[I.length - 1].XTI = []);
              break;
            case 35:
            case 547:
              I[I.length - 1].push(X);
              break;
            case 24:
            case 536:
              (N = { Name: X.Name, Ref: Pc(X.rgce, 0, null, I, _) }),
                0 < X.itab && (N.Sheet = X.itab - 1),
                I.names.push(N),
                I[0] || ((I[0] = []), (I[0].XTI = [])),
                I[I.length - 1].push(X),
                "_xlnm._FilterDatabase" == X.Name &&
                  0 < X.itab &&
                  X.rgce &&
                  X.rgce[0] &&
                  X.rgce[0][0] &&
                  "PtgArea3d" == X.rgce[0][0][0] &&
                  (M[X.itab - 1] = { ref: qr(X.rgce[0][0][1][2]) });
              break;
            case 22:
              _.ExternCount = X;
              break;
            case 23:
              0 == I.length && ((I[0] = []), (I[0].XTI = [])),
                (I[I.length - 1].XTI = I[I.length - 1].XTI.concat(X)),
                (I.XTI = I.XTI.concat(X));
              break;
            case 2196:
              if (_.biff < 8) break;
              null != N && (N.Comment = X[1]);
              break;
            case 18:
              h["!protect"] = X;
              break;
            case 19:
              0 !== X && _.WTF && console.error("Password verifier: " + X);
              break;
            case 133:
              (u[X.pos] = X), _.snames.push(X.name);
              break;
            case 10:
              if (--D) break;
              d.e &&
                (0 < d.e.r &&
                  0 < d.e.c &&
                  (d.e.r--,
                  d.e.c--,
                  (h["!ref"] = qr(d)),
                  t.sheetRows &&
                    t.sheetRows <= d.e.r &&
                    ((K = d.e.r),
                    (d.e.r = t.sheetRows - 1),
                    (h["!fullref"] = h["!ref"]),
                    (h["!ref"] = qr(d)),
                    (d.e.r = K)),
                  d.e.r++,
                  d.e.c++),
                0 < x.length && (h["!merges"] = x),
                0 < A.length && (h["!objects"] = A),
                0 < C.length && (h["!cols"] = C),
                0 < R.length && (h["!rows"] = R),
                y.Sheets.push(S)),
                "" === g ? (b = h) : (a[g] = h),
                (h = t.dense ? [] : {});
              break;
            case 9:
            case 521:
            case 1033:
            case 2057:
              if (
                (8 === _.biff &&
                  (_.biff =
                    { 9: 2, 521: 3, 1033: 4 }[W] ||
                    { 512: 2, 768: 3, 1024: 4, 1280: 5, 1536: 8, 2: 2, 7: 2 }[
                      X.BIFFVer
                    ] ||
                    8),
                (_.biffguess = 0 == X.BIFFVer),
                0 == X.BIFFVer &&
                  4096 == X.dt &&
                  ((_.biff = 5), (U = !0), ie((_.codepage = 28591))),
                8 == _.biff && 0 == X.BIFFVer && 16 == X.dt && (_.biff = 2),
                D++)
              )
                break;
              var K,
                h = t.dense ? [] : {};
              _.biff < 8 &&
                !U &&
                ((U = !0), ie((_.codepage = t.codepage || 1252))),
                _.biff < 5 || (0 == X.BIFFVer && 4096 == X.dt)
                  ? ("" === g && (g = "Sheet1"),
                    (d = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }),
                    (K = { pos: e.l - H, name: g }),
                    (u[K.pos] = K),
                    _.snames.push(g))
                  : (g = (u[B] || { name: "" }).name),
                32 == X.dt && (h["!type"] = "chart"),
                64 == X.dt && (h["!type"] = "macro"),
                (x = []),
                (A = []),
                (_.arrayf = T = []),
                (C = []),
                (O = !(R = [])),
                (S = { Hidden: (u[B] || { hs: 0 }).hs, name: g });
              break;
            case 515:
            case 3:
            case 2:
              "chart" == h["!type"] &&
                (t.dense ? (h[X.r] || [])[X.c] : h[Kr({ c: X.c, r: X.r })]) &&
                ++X.c,
                (Z = { ixfe: X.ixfe, XF: E[X.ixfe] || {}, v: X.val, t: "n" }),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t);
              break;
            case 5:
            case 517:
              (Z = { ixfe: X.ixfe, XF: E[X.ixfe], v: X.val, t: X.t }),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t);
              break;
            case 638:
              (Z = { ixfe: X.ixfe, XF: E[X.ixfe], v: X.rknum, t: "n" }),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t);
              break;
            case 189:
              for (var J = X.c; J <= X.C; ++J) {
                var q = X.rkrec[J - X.c][0],
                  Z = { ixfe: q, XF: E[q], v: X.rkrec[J - X.c][1], t: "n" };
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                  Cf(Z, t, r.opts.Date1904),
                  n({ c: J, r: X.r }, Z, t);
              }
              break;
            case 6:
            case 518:
            case 1030:
              if ("String" == X.val) {
                p = X;
                break;
              }
              ((Z = Rf(X.val, X.cell.ixfe, X.tt)).XF = E[Z.ixfe]),
                t.cellFormula &&
                  (!(
                    (Q = X.formula) &&
                    Q[0] &&
                    Q[0][0] &&
                    "PtgExp" == Q[0][0][0]
                  ) ||
                  w[
                    ($ = Kr({ r: (G = Q[0][0][1][0]), c: (j = Q[0][0][1][1]) }))
                  ]
                    ? (Z.f = "" + Pc(X.formula, 0, X.cell, I, _))
                    : (Z.F = ((t.dense ? (h[G] || [])[j] : h[$]) || {}).F)),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n(X.cell, Z, t),
                (p = X);
              break;
            case 7:
            case 519:
              if (!p) throw new Error("String record expects Formula");
              ((Z = Rf((p.val = X), p.cell.ixfe, "s")).XF = E[Z.ixfe]),
                t.cellFormula && (Z.f = "" + Pc(p.formula, 0, p.cell, I, _)),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n(p.cell, Z, t),
                (p = null);
              break;
            case 33:
            case 545:
              T.push(X);
              var Q = Kr(X[0].s),
                ee = t.dense ? (h[X[0].s.r] || [])[X[0].s.c] : h[Q];
              if (t.cellFormula && ee) {
                if (!p) break;
                if (!Q || !ee) break;
                (ee.f = "" + Pc(X[1], 0, X[0], I, _)), (ee.F = qr(X[0]));
              }
              break;
            case 1212:
              if (!t.cellFormula) break;
              if (v) {
                if (!p) break;
                (w[Kr(p.cell)] = X[0]),
                  ((
                    (ee = t.dense
                      ? (h[p.cell.r] || [])[p.cell.c]
                      : h[Kr(p.cell)]) || {}
                  ).f = "" + Pc(X[0], 0, c, I, _));
              }
              break;
            case 253:
              (Z = Rf(m[X.isst].t, X.ixfe, "s")),
                m[X.isst].h && (Z.h = m[X.isst].h),
                (Z.XF = E[Z.ixfe]),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t);
              break;
            case 513:
              t.sheetStubs &&
                ((Z = { ixfe: X.ixfe, XF: E[X.ixfe], t: "z" }),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t));
              break;
            case 190:
              if (t.sheetStubs)
                for (var te = X.c; te <= X.C; ++te) {
                  var re = X.ixfe[te - X.c];
                  (Z = { ixfe: re, XF: E[re], t: "z" }),
                    0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                    Cf(Z, t, r.opts.Date1904),
                    n({ c: te, r: X.r }, Z, t);
                }
              break;
            case 214:
            case 516:
            case 4:
              ((Z = Rf(X.val, X.ixfe, "s")).XF = E[Z.ixfe]),
                0 < P && (Z.z = L[(Z.ixfe >> 8) & 63]),
                Cf(Z, t, r.opts.Date1904),
                n({ c: X.c, r: X.r }, Z, t);
              break;
            case 0:
            case 512:
              1 === D && (d = X);
              break;
            case 252:
              m = X;
              break;
            case 1054:
              if (4 == _.biff) {
                L[P++] = X[1];
                for (var ae = 0; ae < P + 163 && me[ae] != X[1]; ++ae);
                163 <= ae && we(X[1], P + 163);
              } else we(X[1], X[0]);
              break;
            case 30:
              L[P++] = X;
              for (var ne = 0; ne < P + 163 && me[ne] != X; ++ne);
              163 <= ne && we(X, P + 163);
              break;
            case 229:
              x = x.concat(X);
              break;
            case 93:
              A[X.cmo[0]] = _.lastobj = X;
              break;
            case 438:
              _.lastobj.TxO = X;
              break;
            case 127:
              _.lastobj.ImData = X;
              break;
            case 440:
              for (i = X[0].s.r; i <= X[0].e.r; ++i)
                for (s = X[0].s.c; s <= X[0].e.c; ++s)
                  (ee = t.dense ? (h[i] || [])[s] : h[Kr({ c: s, r: i })]) &&
                    (ee.l = X[1]);
              break;
            case 2048:
              for (i = X[0].s.r; i <= X[0].e.r; ++i)
                for (s = X[0].s.c; s <= X[0].e.c; ++s)
                  (ee = t.dense ? (h[i] || [])[s] : h[Kr({ c: s, r: i })]) &&
                    ee.l &&
                    (ee.l.Tooltip = X[1]);
              break;
            case 28:
              if (_.biff <= 5 && 2 <= _.biff) break;
              ee = t.dense ? (h[X[0].r] || [])[X[0].c] : h[Kr(X[0])];
              var se = A[X[2]];
              ee ||
                ((ee = t.dense
                  ? (h[X[0].r] || (h[X[0].r] = []),
                    (h[X[0].r][X[0].c] = { t: "z" }))
                  : (h[Kr(X[0])] = { t: "z" })),
                (d.e.r = Math.max(d.e.r, X[0].r)),
                (d.s.r = Math.min(d.s.r, X[0].r)),
                (d.e.c = Math.max(d.e.c, X[0].c)),
                (d.s.c = Math.min(d.s.c, X[0].c))),
                ee.c || (ee.c = []),
                (se = { a: X[1], t: se.TxO.t }),
                ee.c.push(se);
              break;
            case 2173:
              E[X.ixfe],
                X.ext.forEach(function (e) {
                  e[0];
                });
              break;
            case 125:
              if (!_.cellStyles) break;
              for (; X.e >= X.s; )
                (C[X.e--] = {
                  width: X.w / 256,
                  level: X.level || 0,
                  hidden: !!(1 & X.flags),
                }),
                  O || ((O = !0), lo(X.w / 256)),
                  fo(C[X.e + 1]);
              break;
            case 520:
              se = {};
              null != X.level && ((R[X.r] = se).level = X.level),
                X.hidden && ((R[X.r] = se).hidden = !0),
                X.hpt && (((R[X.r] = se).hpt = X.hpt), (se.hpx = po(X.hpt)));
              break;
            case 38:
            case 39:
            case 40:
            case 41:
              h["!margins"] || Qc((h["!margins"] = {})),
                (h["!margins"][
                  { 38: "left", 39: "right", 40: "top", 41: "bottom" }[W]
                ] = X);
              break;
            case 161:
              h["!margins"] || Qc((h["!margins"] = {})),
                (h["!margins"].header = X.header),
                (h["!margins"].footer = X.footer);
              break;
            case 574:
              X.RTL && (y.Views[0].RTL = !0);
              break;
            case 146:
              k = X;
              break;
            case 2198:
              f = X;
              break;
            case 140:
              l = X;
              break;
            case 442:
              g
                ? (S.CodeName = X || S.name)
                : (y.WBProps.CodeName = X || "ThisWorkbook");
          }
      } else
        z || console.error("Missing Info for XLS Record 0x" + W.toString(16)),
          (e.l += H);
    }
    return (
      (r.SheetNames = Re(u)
        .sort(function (e, t) {
          return Number(e) - Number(t);
        })
        .map(function (e) {
          return u[e].name;
        })),
      t.bookSheets || (r.Sheets = a),
      !r.SheetNames.length && b["!ref"]
        ? (r.SheetNames.push("Sheet1"), r.Sheets && (r.Sheets.Sheet1 = b))
        : (r.Preamble = b),
      r.Sheets &&
        M.forEach(function (e, t) {
          r.Sheets[r.SheetNames[t]]["!autofilter"] = e;
        }),
      (r.Strings = m),
      (r.SSF = Ve(me)),
      _.enc && (r.Encryption = _.enc),
      f && (r.Themes = f),
      (r.Metadata = {}),
      void 0 !== l && (r.Metadata.Country = l),
      0 < I.names.length && (y.Names = I.names),
      (r.Workbook = y),
      r
    );
  }
  var If = {
    SI: "e0859ff2f94f6810ab9108002b27b3d9",
    DSI: "02d5cdd59c2e1b10939708002b2cf9ae",
    UDI: "05d5cdd59c2e1b10939708002b2cf9ae",
  };
  function Nf(e, t) {
    var r, a, n, s, i;
    if ((Mh((t = t || {})), h(), t.codepage && c(t.codepage), e.FullPaths)) {
      if (xe.find(e, "/encryption"))
        throw new Error("File is password-protected");
      (r = xe.find(e, "!CompObj")),
        (n = xe.find(e, "/Workbook") || xe.find(e, "/Book"));
    } else {
      switch (t.type) {
        case "base64":
          e = he(te(e));
          break;
        case "binary":
          e = he(e);
          break;
        case "buffer":
          break;
        case "array":
          Array.isArray(e) || (e = Array.prototype.slice.call(e));
      }
      Dr(e, 0), (n = { content: e });
    }
    if ((r && xf(r), t.bookProps && !t.bookSheets)) a = {};
    else {
      var o = se ? "buffer" : "array";
      if (n && n.content) a = Of(n.content, t);
      else if ((n = xe.find(e, "PerfectOffice_MAIN")) && n.content)
        a = si.to_workbook(n.content, ((t.type = o), t));
      else {
        if (!(n = xe.find(e, "NativeContent_MAIN")) || !n.content)
          throw (n = xe.find(e, "MN0")) && n.content
            ? new Error("Unsupported Works 4 for Mac file")
            : new Error("Cannot find Workbook stream");
        a = si.to_workbook(n.content, ((t.type = o), t));
      }
      t.bookVBA &&
        e.FullPaths &&
        xe.find(e, "/_VBA_PROJECT_CUR/VBA/dir") &&
        (a.vbaraw =
          ((s = e),
          (i = xe.utils.cfb_new({ root: "R" })),
          s.FullPaths.forEach(function (e, t) {
            "/" !== e.slice(-1) &&
              e.match(/_VBA_PROJECT_CUR/) &&
              ((e = e
                .replace(/^[^\/]*/, "R")
                .replace(/\/_VBA_PROJECT_CUR\u0000*/, "")),
              xe.utils.cfb_add(i, e, s.FileIndex[t].content));
          }),
          xe.write(i)));
    }
    o = {};
    return (
      e.FullPaths &&
        (function (e, t, r) {
          var a = xe.find(e, "/!DocumentSummaryInformation");
          if (a && 0 < a.size)
            try {
              var n,
                s = An(a, Pa, If.DSI);
              for (n in s) t[n] = s[n];
            } catch (e) {
              if (r.WTF) throw e;
            }
          var i = xe.find(e, "/!SummaryInformation");
          if (i && 0 < i.size)
            try {
              var o,
                c = An(i, La, If.SI);
              for (o in c) null == t[o] && (t[o] = c[o]);
            } catch (e) {
              if (r.WTF) throw e;
            }
          t.HeadingPairs &&
            t.TitlesOfParts &&
            (cn(t.HeadingPairs, t.TitlesOfParts, t, r),
            delete t.HeadingPairs,
            delete t.TitlesOfParts);
        })(e, o, t),
      (a.Props = a.Custprops = o),
      t.bookFiles && (a.cfb = e),
      a
    );
  }
  function Ff(e, t) {
    var r,
      a,
      n = t || {},
      t = xe.utils.cfb_new({ root: "R" }),
      s = "/Workbook";
    switch (n.bookType || "xls") {
      case "xls":
        n.bookType = "biff8";
      case "xla":
        n.bookType || (n.bookType = "xla");
      case "biff8":
        (s = "/Workbook"), (n.biff = 8);
        break;
      case "biff5":
        (s = "/Book"), (n.biff = 5);
        break;
      default:
        throw new Error("invalid type " + n.bookType + " for XLS CFB");
    }
    return (
      xe.utils.cfb_add(t, s, Xf(e, n)),
      8 == n.biff &&
        (e.Props || e.Custprops) &&
        (function (e, t) {
          var r,
            a = [],
            n = [],
            s = [],
            i = 0,
            o = Oe(Pa, "n"),
            c = Oe(La, "n");
          if (e.Props)
            for (r = Re(e.Props), i = 0; i < r.length; ++i)
              (Object.prototype.hasOwnProperty.call(o, r[i])
                ? a
                : Object.prototype.hasOwnProperty.call(c, r[i])
                ? n
                : s
              ).push([r[i], e.Props[r[i]]]);
          if (e.Custprops)
            for (r = Re(e.Custprops), i = 0; i < r.length; ++i)
              Object.prototype.hasOwnProperty.call(e.Props || {}, r[i]) ||
                (Object.prototype.hasOwnProperty.call(o, r[i])
                  ? a
                  : Object.prototype.hasOwnProperty.call(c, r[i])
                  ? n
                  : s
                ).push([r[i], e.Custprops[r[i]]]);
          for (var l = [], i = 0; i < s.length; ++i)
            -1 < _n.indexOf(s[i][0]) ||
              -1 < on.indexOf(s[i][0]) ||
              (null != s[i][1] && l.push(s[i]));
          n.length &&
            xe.utils.cfb_add(t, "/SummaryInformation", Cn(n, If.SI, c, La)),
            (a.length || l.length) &&
              xe.utils.cfb_add(
                t,
                "/DocumentSummaryInformation",
                Cn(a, If.DSI, o, Pa, l.length ? l : null, If.UDI),
              );
        })(e, t),
      8 == n.biff &&
        e.vbaraw &&
        ((r = t),
        (a = xe.read(e.vbaraw, {
          type: "string" == typeof e.vbaraw ? "binary" : "buffer",
        })).FullPaths.forEach(function (e, t) {
          0 == t ||
            ("/" !==
              (e = e.replace(/[^\/]*[\/]/, "/_VBA_PROJECT_CUR/")).slice(-1) &&
              xe.utils.cfb_add(r, e, a.FileIndex[t].content));
        })),
      t
    );
  }
  var Df = {
      0: {
        f: function (e, t) {
          var r = {},
            a = e.l + t;
          (r.r = e.read_shift(4)), (e.l += 4);
          var n = e.read_shift(2);
          return (
            (e.l += 1),
            (t = e.read_shift(1)),
            (e.l = a),
            7 & t && (r.level = 7 & t),
            16 & t && (r.hidden = !0),
            32 & t && (r.hpt = n / 20),
            r
          );
        },
      },
      1: {
        f: function (e) {
          return [fa(e)];
        },
      },
      2: {
        f: function (e) {
          return [fa(e), Ea(e), "n"];
        },
      },
      3: {
        f: function (e) {
          return [fa(e), e.read_shift(1), "e"];
        },
      },
      4: {
        f: function (e) {
          return [fa(e), e.read_shift(1), "b"];
        },
      },
      5: {
        f: function (e) {
          return [fa(e), xa(e), "n"];
        },
      },
      6: {
        f: function (e) {
          return [fa(e), sa(e), "str"];
        },
      },
      7: {
        f: function (e) {
          return [fa(e), e.read_shift(4), "s"];
        },
      },
      8: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = fa(e);
          n.r = r["!row"];
          var s = [n, sa(e), "str"];
          return (
            r.cellFormula
              ? ((e.l += 2),
                (t = Wc(e, a - e.l, r)),
                (s[3] = Pc(t, 0, n, r.supbooks, r)))
              : (e.l = a),
            s
          );
        },
      },
      9: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = fa(e);
          n.r = r["!row"];
          var s = [n, xa(e), "n"];
          return (
            r.cellFormula
              ? ((e.l += 2),
                (t = Wc(e, a - e.l, r)),
                (s[3] = Pc(t, 0, n, r.supbooks, r)))
              : (e.l = a),
            s
          );
        },
      },
      10: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = fa(e);
          n.r = r["!row"];
          var s = [n, e.read_shift(1), "b"];
          return (
            r.cellFormula
              ? ((e.l += 2),
                (t = Wc(e, a - e.l, r)),
                (s[3] = Pc(t, 0, n, r.supbooks, r)))
              : (e.l = a),
            s
          );
        },
      },
      11: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = fa(e);
          n.r = r["!row"];
          var s = [n, e.read_shift(1), "e"];
          return (
            r.cellFormula
              ? ((e.l += 2),
                (t = Wc(e, a - e.l, r)),
                (s[3] = Pc(t, 0, n, r.supbooks, r)))
              : (e.l = a),
            s
          );
        },
      },
      12: {
        f: function (e) {
          return [ua(e)];
        },
      },
      13: {
        f: function (e) {
          return [ua(e), Ea(e), "n"];
        },
      },
      14: {
        f: function (e) {
          return [ua(e), e.read_shift(1), "e"];
        },
      },
      15: {
        f: function (e) {
          return [ua(e), e.read_shift(1), "b"];
        },
      },
      16: { f: Rl },
      17: {
        f: function (e) {
          return [ua(e), sa(e), "str"];
        },
      },
      18: {
        f: function (e) {
          return [ua(e), e.read_shift(4), "s"];
        },
      },
      19: { f: oa },
      20: {},
      21: {},
      22: {},
      23: {},
      24: {},
      25: {},
      26: {},
      27: {},
      28: {},
      29: {},
      30: {},
      31: {},
      32: {},
      33: {},
      34: {},
      35: { T: 1 },
      36: { T: -1 },
      37: { T: 1 },
      38: { T: -1 },
      39: {
        f: function (e, t, r) {
          var a = e.l + t;
          (e.l += 4), (e.l += 1);
          var n = e.read_shift(4),
            s = va(e),
            t = Hc(e, 0, r),
            r = ga(e);
          return (
            (e.l = a),
            (t = { Name: s, Ptg: t }),
            n < 268435455 && (t.Sheet = n),
            r && (t.Comment = r),
            t
          );
        },
      },
      40: {},
      42: {},
      43: {
        f: function (e, t, r) {
          var a = {};
          a.sz = e.read_shift(2) / 20;
          var n,
            s =
              ((s = (n = e).read_shift(1)),
              n.l++,
              {
                fBold: 1 & s,
                fItalic: 2 & s,
                fUnderline: 4 & s,
                fStrikeout: 8 & s,
                fOutline: 16 & s,
                fShadow: 32 & s,
                fCondense: 64 & s,
                fExtend: 128 & s,
              });
          switch (
            (s.fItalic && (a.italic = 1),
            s.fCondense && (a.condense = 1),
            s.fExtend && (a.extend = 1),
            s.fShadow && (a.shadow = 1),
            s.fOutline && (a.outline = 1),
            s.fStrikeout && (a.strike = 1),
            700 === e.read_shift(2) && (a.bold = 1),
            e.read_shift(2))
          ) {
            case 1:
              a.vertAlign = "superscript";
              break;
            case 2:
              a.vertAlign = "subscript";
          }
          switch (
            (0 != (s = e.read_shift(1)) && (a.underline = s),
            0 < (s = e.read_shift(1)) && (a.family = s),
            0 < (s = e.read_shift(1)) && (a.charset = s),
            e.l++,
            (a.color = (function (e) {
              var t = {},
                r = e.read_shift(1) >>> 1,
                a = e.read_shift(1),
                n = e.read_shift(2, "i"),
                s = e.read_shift(1),
                i = e.read_shift(1),
                o = e.read_shift(1);
              switch ((e.l++, r)) {
                case 0:
                  t.auto = 1;
                  break;
                case 1:
                  t.index = a;
                  var c = Ba[a];
                  c && (t.rgb = Qi(c));
                  break;
                case 2:
                  t.rgb = Qi([s, i, o]);
                  break;
                case 3:
                  t.theme = a;
              }
              return 0 != n && (t.tint = 0 < n ? n / 32767 : n / 32768), t;
            })(e)),
            e.read_shift(1))
          ) {
            case 1:
              a.scheme = "major";
              break;
            case 2:
              a.scheme = "minor";
          }
          return (a.name = sa(e)), a;
        },
      },
      44: {
        f: function (e, t) {
          return [e.read_shift(2), sa(e)];
        },
      },
      45: { f: Ro },
      46: { f: r },
      47: {
        f: function (e, t) {
          var r = e.l + t,
            a = e.read_shift(2),
            t = e.read_shift(2);
          return (e.l = r), { ixfe: a, numFmtId: t };
        },
      },
      48: {},
      49: {
        f: function (e) {
          return e.read_shift(4, "i");
        },
      },
      50: {},
      51: {
        f: function (e) {
          for (var t = [], r = e.read_shift(4); 0 < r--; )
            t.push([e.read_shift(4), e.read_shift(4)]);
          return t;
        },
      },
      52: { T: 1 },
      53: { T: -1 },
      54: { T: 1 },
      55: { T: -1 },
      56: { T: 1 },
      57: { T: -1 },
      58: {},
      59: {},
      60: { f: vs },
      62: {
        f: function (e) {
          return [fa(e), oa(e), "is"];
        },
      },
      63: {
        f: function (e) {
          var t = {};
          t.i = e.read_shift(4);
          var r = {};
          return (
            (r.r = e.read_shift(4)),
            (r.c = e.read_shift(4)),
            (t.r = Kr(r)),
            2 & (e = e.read_shift(1)) && (t.l = "1"),
            8 & e && (t.a = "1"),
            t
          );
        },
      },
      64: { f: function () {} },
      65: {},
      66: {},
      67: {},
      68: {},
      69: {},
      70: {},
      128: {},
      129: { T: 1 },
      130: { T: -1 },
      131: { T: 1, f: Pr, p: 0 },
      132: { T: -1 },
      133: { T: 1 },
      134: { T: -1 },
      135: { T: 1 },
      136: { T: -1 },
      137: {
        T: 1,
        f: function (e) {
          var t = e.read_shift(2);
          return (e.l += 28), { RTL: 32 & t };
        },
      },
      138: { T: -1 },
      139: { T: 1 },
      140: { T: -1 },
      141: { T: 1 },
      142: { T: -1 },
      143: { T: 1 },
      144: { T: -1 },
      145: { T: 1 },
      146: { T: -1 },
      147: {
        f: function (e, t) {
          var r = {},
            a = e[e.l];
          return (
            ++e.l,
            (r.above = !(64 & a)),
            (r.left = !(128 & a)),
            (e.l += 18),
            (r.name = pa(e, t - 19)),
            r
          );
        },
      },
      148: { f: lt, p: 16 },
      151: { f: function () {} },
      152: {},
      153: {
        f: function (e, t) {
          var r = {},
            a = e.read_shift(4);
          return (
            (r.defaultThemeVersion = e.read_shift(4)),
            0 < (e = 8 < t ? sa(e) : "").length && (r.CodeName = e),
            (r.autoCompressPictures = !!(65536 & a)),
            (r.backupFile = !!(64 & a)),
            (r.checkCompatibility = !!(4096 & a)),
            (r.date1904 = !!(1 & a)),
            (r.filterPrivacy = !!(8 & a)),
            (r.hidePivotFieldList = !!(1024 & a)),
            (r.promptedSolutions = !!(16 & a)),
            (r.publishItems = !!(2048 & a)),
            (r.refreshAllConnections = !!(262144 & a)),
            (r.saveExternalLinkValues = !!(128 & a)),
            (r.showBorderUnselectedTables = !!(4 & a)),
            (r.showInkAnnotation = !!(32 & a)),
            (r.showObjects = ["all", "placeholders", "none"][(a >> 13) & 3]),
            (r.showPivotChartFilter = !!(32768 & a)),
            (r.updateLinks = ["userSet", "never", "always"][(a >> 8) & 3]),
            r
          );
        },
      },
      154: {},
      155: {},
      156: {
        f: function (e, t) {
          var r = {};
          return (
            (r.Hidden = e.read_shift(4)),
            (r.iTabID = e.read_shift(4)),
            (r.strRelID = wa(e, t - 8)),
            (r.name = sa(e)),
            r
          );
        },
      },
      157: {},
      158: {},
      159: {
        T: 1,
        f: function (e) {
          return [e.read_shift(4), e.read_shift(4)];
        },
      },
      160: { T: -1 },
      161: { T: 1, f: Sa },
      162: { T: -1 },
      163: { T: 1 },
      164: { T: -1 },
      165: { T: 1 },
      166: { T: -1 },
      167: {},
      168: {},
      169: {},
      170: {},
      171: {},
      172: { T: 1 },
      173: { T: -1 },
      174: {},
      175: {},
      176: { f: Lt },
      177: { T: 1 },
      178: { T: -1 },
      179: { T: 1 },
      180: { T: -1 },
      181: { T: 1 },
      182: { T: -1 },
      183: { T: 1 },
      184: { T: -1 },
      185: { T: 1 },
      186: { T: -1 },
      187: { T: 1 },
      188: { T: -1 },
      189: { T: 1 },
      190: { T: -1 },
      191: { T: 1 },
      192: { T: -1 },
      193: { T: 1 },
      194: { T: -1 },
      195: { T: 1 },
      196: { T: -1 },
      197: { T: 1 },
      198: { T: -1 },
      199: { T: 1 },
      200: { T: -1 },
      201: { T: 1 },
      202: { T: -1 },
      203: { T: 1 },
      204: { T: -1 },
      205: { T: 1 },
      206: { T: -1 },
      207: { T: 1 },
      208: { T: -1 },
      209: { T: 1 },
      210: { T: -1 },
      211: { T: 1 },
      212: { T: -1 },
      213: { T: 1 },
      214: { T: -1 },
      215: { T: 1 },
      216: { T: -1 },
      217: { T: 1 },
      218: { T: -1 },
      219: { T: 1 },
      220: { T: -1 },
      221: { T: 1 },
      222: { T: -1 },
      223: { T: 1 },
      224: { T: -1 },
      225: { T: 1 },
      226: { T: -1 },
      227: { T: 1 },
      228: { T: -1 },
      229: { T: 1 },
      230: { T: -1 },
      231: { T: 1 },
      232: { T: -1 },
      233: { T: 1 },
      234: { T: -1 },
      235: { T: 1 },
      236: { T: -1 },
      237: { T: 1 },
      238: { T: -1 },
      239: { T: 1 },
      240: { T: -1 },
      241: { T: 1 },
      242: { T: -1 },
      243: { T: 1 },
      244: { T: -1 },
      245: { T: 1 },
      246: { T: -1 },
      247: { T: 1 },
      248: { T: -1 },
      249: { T: 1 },
      250: { T: -1 },
      251: { T: 1 },
      252: { T: -1 },
      253: { T: 1 },
      254: { T: -1 },
      255: { T: 1 },
      256: { T: -1 },
      257: { T: 1 },
      258: { T: -1 },
      259: { T: 1 },
      260: { T: -1 },
      261: { T: 1 },
      262: { T: -1 },
      263: { T: 1 },
      264: { T: -1 },
      265: { T: 1 },
      266: { T: -1 },
      267: { T: 1 },
      268: { T: -1 },
      269: { T: 1 },
      270: { T: -1 },
      271: { T: 1 },
      272: { T: -1 },
      273: { T: 1 },
      274: { T: -1 },
      275: { T: 1 },
      276: { T: -1 },
      277: {},
      278: { T: 1 },
      279: { T: -1 },
      280: { T: 1 },
      281: { T: -1 },
      282: { T: 1 },
      283: { T: 1 },
      284: { T: -1 },
      285: { T: 1 },
      286: { T: -1 },
      287: { T: 1 },
      288: { T: -1 },
      289: { T: 1 },
      290: { T: -1 },
      291: { T: 1 },
      292: { T: -1 },
      293: { T: 1 },
      294: { T: -1 },
      295: { T: 1 },
      296: { T: -1 },
      297: { T: 1 },
      298: { T: -1 },
      299: { T: 1 },
      300: { T: -1 },
      301: { T: 1 },
      302: { T: -1 },
      303: { T: 1 },
      304: { T: -1 },
      305: { T: 1 },
      306: { T: -1 },
      307: { T: 1 },
      308: { T: -1 },
      309: { T: 1 },
      310: { T: -1 },
      311: { T: 1 },
      312: { T: -1 },
      313: { T: -1 },
      314: { T: 1 },
      315: { T: -1 },
      316: { T: 1 },
      317: { T: -1 },
      318: { T: 1 },
      319: { T: -1 },
      320: { T: 1 },
      321: { T: -1 },
      322: { T: 1 },
      323: { T: -1 },
      324: { T: 1 },
      325: { T: -1 },
      326: { T: 1 },
      327: { T: -1 },
      328: { T: 1 },
      329: { T: -1 },
      330: { T: 1 },
      331: { T: -1 },
      332: { T: 1 },
      333: { T: -1 },
      334: { T: 1 },
      335: {
        f: function (e, t) {
          return {
            flags: e.read_shift(4),
            version: e.read_shift(4),
            name: sa(e),
          };
        },
      },
      336: { T: -1 },
      337: {
        f: function (e) {
          return (e.l += 4), 0 != e.read_shift(4);
        },
        T: 1,
      },
      338: { T: -1 },
      339: { T: 1 },
      340: { T: -1 },
      341: { T: 1 },
      342: { T: -1 },
      343: { T: 1 },
      344: { T: -1 },
      345: { T: 1 },
      346: { T: -1 },
      347: { T: 1 },
      348: { T: -1 },
      349: { T: 1 },
      350: { T: -1 },
      351: {},
      352: {},
      353: { T: 1 },
      354: { T: -1 },
      355: { f: wa },
      357: {},
      358: {},
      359: {},
      360: { T: 1 },
      361: {},
      362: { f: ps },
      363: {},
      364: {},
      366: {},
      367: {},
      368: {},
      369: {},
      370: {},
      371: {},
      372: { T: 1 },
      373: { T: -1 },
      374: { T: 1 },
      375: { T: -1 },
      376: { T: 1 },
      377: { T: -1 },
      378: { T: 1 },
      379: { T: -1 },
      380: { T: 1 },
      381: { T: -1 },
      382: { T: 1 },
      383: { T: -1 },
      384: { T: 1 },
      385: { T: -1 },
      386: { T: 1 },
      387: { T: -1 },
      388: { T: 1 },
      389: { T: -1 },
      390: { T: 1 },
      391: { T: -1 },
      392: { T: 1 },
      393: { T: -1 },
      394: { T: 1 },
      395: { T: -1 },
      396: {},
      397: {},
      398: {},
      399: {},
      400: {},
      401: { T: 1 },
      403: {},
      404: {},
      405: {},
      406: {},
      407: {},
      408: {},
      409: {},
      410: {},
      411: {},
      412: {},
      413: {},
      414: {},
      415: {},
      416: {},
      417: {},
      418: {},
      419: {},
      420: {},
      421: {},
      422: { T: 1 },
      423: { T: 1 },
      424: { T: -1 },
      425: { T: -1 },
      426: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = ya(e),
            t = e.read_shift(1);
          return (
            ((n = [n])[2] = t),
            r.cellFormula ? ((r = Bc(e, a - e.l, r)), (n[1] = r)) : (e.l = a),
            n
          );
        },
      },
      427: {
        f: function (e, t, r) {
          var a = e.l + t,
            t = [Sa(e, 16)];
          return (
            r.cellFormula && ((r = zc(e, a - e.l, r)), (t[1] = r)), (e.l = a), t
          );
        },
      },
      428: {},
      429: { T: 1 },
      430: { T: -1 },
      431: { T: 1 },
      432: { T: -1 },
      433: { T: 1 },
      434: { T: -1 },
      435: { T: 1 },
      436: { T: -1 },
      437: { T: 1 },
      438: { T: -1 },
      439: { T: 1 },
      440: { T: -1 },
      441: { T: 1 },
      442: { T: -1 },
      443: { T: 1 },
      444: { T: -1 },
      445: { T: 1 },
      446: { T: -1 },
      447: { T: 1 },
      448: { T: -1 },
      449: { T: 1 },
      450: { T: -1 },
      451: { T: 1 },
      452: { T: -1 },
      453: { T: 1 },
      454: { T: -1 },
      455: { T: 1 },
      456: { T: -1 },
      457: { T: 1 },
      458: { T: -1 },
      459: { T: 1 },
      460: { T: -1 },
      461: { T: 1 },
      462: { T: -1 },
      463: { T: 1 },
      464: { T: -1 },
      465: { T: 1 },
      466: { T: -1 },
      467: { T: 1 },
      468: { T: -1 },
      469: { T: 1 },
      470: { T: -1 },
      471: {},
      472: {},
      473: { T: 1 },
      474: { T: -1 },
      475: {},
      476: {
        f: function (t) {
          var r = {};
          return (
            Il.forEach(function (e) {
              r[e] = xa(t);
            }),
            r
          );
        },
      },
      477: {},
      478: {},
      479: { T: 1 },
      480: { T: -1 },
      481: { T: 1 },
      482: { T: -1 },
      483: { T: 1 },
      484: { T: -1 },
      485: { f: function () {} },
      486: { T: 1 },
      487: { T: -1 },
      488: { T: 1 },
      489: { T: -1 },
      490: { T: 1 },
      491: { T: -1 },
      492: { T: 1 },
      493: { T: -1 },
      494: {
        f: function (e, t) {
          var r = e.l + t,
            a = Sa(e, 16),
            n = ga(e),
            s = sa(e),
            i = sa(e),
            t = sa(e);
          return (
            (e.l = r),
            (t = { rfx: a, relId: n, loc: s, display: t }),
            i && (t.Tooltip = i),
            t
          );
        },
      },
      495: { T: 1 },
      496: { T: -1 },
      497: { T: 1 },
      498: { T: -1 },
      499: {},
      500: { T: 1 },
      501: { T: -1 },
      502: { T: 1 },
      503: { T: -1 },
      504: {},
      505: { T: 1 },
      506: { T: -1 },
      507: {},
      508: { T: 1 },
      509: { T: -1 },
      510: { T: 1 },
      511: { T: -1 },
      512: {},
      513: {},
      514: { T: 1 },
      515: { T: -1 },
      516: { T: 1 },
      517: { T: -1 },
      518: { T: 1 },
      519: { T: -1 },
      520: { T: 1 },
      521: { T: -1 },
      522: {},
      523: {},
      524: {},
      525: {},
      526: {},
      527: {},
      528: { T: 1 },
      529: { T: -1 },
      530: { T: 1 },
      531: { T: -1 },
      532: { T: 1 },
      533: { T: -1 },
      534: {},
      535: {},
      536: {},
      537: {},
      538: { T: 1 },
      539: { T: -1 },
      540: { T: 1 },
      541: { T: -1 },
      542: { T: 1 },
      548: {},
      549: {},
      550: { f: wa },
      551: {},
      552: {},
      553: {},
      554: { T: 1 },
      555: { T: -1 },
      556: { T: 1 },
      557: { T: -1 },
      558: { T: 1 },
      559: { T: -1 },
      560: { T: 1 },
      561: { T: -1 },
      562: {},
      564: {},
      565: { T: 1 },
      566: { T: -1 },
      569: { T: 1 },
      570: { T: -1 },
      572: {},
      573: { T: 1 },
      574: { T: -1 },
      577: {},
      578: {},
      579: {},
      580: {},
      581: {},
      582: {},
      583: {},
      584: {},
      585: {},
      586: {},
      587: {},
      588: { T: -1 },
      589: {},
      590: { T: 1 },
      591: { T: -1 },
      592: { T: 1 },
      593: { T: -1 },
      594: { T: 1 },
      595: { T: -1 },
      596: {},
      597: { T: 1 },
      598: { T: -1 },
      599: { T: 1 },
      600: { T: -1 },
      601: { T: 1 },
      602: { T: -1 },
      603: { T: 1 },
      604: { T: -1 },
      605: { T: 1 },
      606: { T: -1 },
      607: {},
      608: { T: 1 },
      609: { T: -1 },
      610: {},
      611: { T: 1 },
      612: { T: -1 },
      613: { T: 1 },
      614: { T: -1 },
      615: { T: 1 },
      616: { T: -1 },
      617: { T: 1 },
      618: { T: -1 },
      619: { T: 1 },
      620: { T: -1 },
      625: {},
      626: { T: 1 },
      627: { T: -1 },
      628: { T: 1 },
      629: { T: -1 },
      630: { T: 1 },
      631: { T: -1 },
      632: { f: Ue },
      633: { T: 1 },
      634: { T: -1 },
      635: {
        T: 1,
        f: function (e) {
          var t = {};
          t.iauthor = e.read_shift(4);
          var r = Sa(e, 16);
          return (t.rfx = r.s), (t.ref = Kr(r.s)), (e.l += 16), t;
        },
      },
      636: { T: -1 },
      637: { f: ca },
      638: { T: 1 },
      639: {},
      640: { T: -1 },
      641: { T: 1 },
      642: { T: -1 },
      643: { T: 1 },
      644: {},
      645: { T: -1 },
      646: { T: 1 },
      648: { T: 1 },
      649: {},
      650: { T: -1 },
      651: {
        f: function (e, t) {
          return (e.l += 10), { name: sa(e) };
        },
      },
      652: {},
      653: { T: 1 },
      654: { T: -1 },
      655: { T: 1 },
      656: { T: -1 },
      657: { T: 1 },
      658: { T: -1 },
      659: {},
      660: { T: 1 },
      661: {},
      662: { T: -1 },
      663: {},
      664: { T: 1 },
      665: {},
      666: { T: -1 },
      667: {},
      668: {},
      669: {},
      671: { T: 1 },
      672: { T: -1 },
      673: { T: 1 },
      674: { T: -1 },
      675: {},
      676: {},
      677: {},
      678: {},
      679: {},
      680: {},
      681: {},
      1024: {},
      1025: {},
      1026: { T: 1 },
      1027: { T: -1 },
      1028: { T: 1 },
      1029: { T: -1 },
      1030: {},
      1031: { T: 1 },
      1032: { T: -1 },
      1033: { T: 1 },
      1034: { T: -1 },
      1035: {},
      1036: {},
      1037: {},
      1038: { T: 1 },
      1039: { T: -1 },
      1040: {},
      1041: { T: 1 },
      1042: { T: -1 },
      1043: {},
      1044: {},
      1045: {},
      1046: { T: 1 },
      1047: { T: -1 },
      1048: { T: 1 },
      1049: { T: -1 },
      1050: {},
      1051: { T: 1 },
      1052: { T: 1 },
      1053: { f: function () {} },
      1054: { T: 1 },
      1055: {},
      1056: { T: 1 },
      1057: { T: -1 },
      1058: { T: 1 },
      1059: { T: -1 },
      1061: {},
      1062: { T: 1 },
      1063: { T: -1 },
      1064: { T: 1 },
      1065: { T: -1 },
      1066: { T: 1 },
      1067: { T: -1 },
      1068: { T: 1 },
      1069: { T: -1 },
      1070: { T: 1 },
      1071: { T: -1 },
      1072: { T: 1 },
      1073: { T: -1 },
      1075: { T: 1 },
      1076: { T: -1 },
      1077: { T: 1 },
      1078: { T: -1 },
      1079: { T: 1 },
      1080: { T: -1 },
      1081: { T: 1 },
      1082: { T: -1 },
      1083: { T: 1 },
      1084: { T: -1 },
      1085: {},
      1086: { T: 1 },
      1087: { T: -1 },
      1088: { T: 1 },
      1089: { T: -1 },
      1090: { T: 1 },
      1091: { T: -1 },
      1092: { T: 1 },
      1093: { T: -1 },
      1094: { T: 1 },
      1095: { T: -1 },
      1096: {},
      1097: { T: 1 },
      1098: {},
      1099: { T: -1 },
      1100: { T: 1 },
      1101: { T: -1 },
      1102: {},
      1103: {},
      1104: {},
      1105: {},
      1111: {},
      1112: {},
      1113: { T: 1 },
      1114: { T: -1 },
      1115: { T: 1 },
      1116: { T: -1 },
      1117: {},
      1118: { T: 1 },
      1119: { T: -1 },
      1120: { T: 1 },
      1121: { T: -1 },
      1122: { T: 1 },
      1123: { T: -1 },
      1124: { T: 1 },
      1125: { T: -1 },
      1126: {},
      1128: { T: 1 },
      1129: { T: -1 },
      1130: {},
      1131: { T: 1 },
      1132: { T: -1 },
      1133: { T: 1 },
      1134: { T: -1 },
      1135: { T: 1 },
      1136: { T: -1 },
      1137: { T: 1 },
      1138: { T: -1 },
      1139: { T: 1 },
      1140: { T: -1 },
      1141: {},
      1142: { T: 1 },
      1143: { T: -1 },
      1144: { T: 1 },
      1145: { T: -1 },
      1146: {},
      1147: { T: 1 },
      1148: { T: -1 },
      1149: { T: 1 },
      1150: { T: -1 },
      1152: { T: 1 },
      1153: { T: -1 },
      1154: { T: -1 },
      1155: { T: -1 },
      1156: { T: -1 },
      1157: { T: 1 },
      1158: { T: -1 },
      1159: { T: 1 },
      1160: { T: -1 },
      1161: { T: 1 },
      1162: { T: -1 },
      1163: { T: 1 },
      1164: { T: -1 },
      1165: { T: 1 },
      1166: { T: -1 },
      1167: { T: 1 },
      1168: { T: -1 },
      1169: { T: 1 },
      1170: { T: -1 },
      1171: {},
      1172: { T: 1 },
      1173: { T: -1 },
      1177: {},
      1178: { T: 1 },
      1180: {},
      1181: {},
      1182: {},
      2048: { T: 1 },
      2049: { T: -1 },
      2050: {},
      2051: { T: 1 },
      2052: { T: -1 },
      2053: {},
      2054: {},
      2055: { T: 1 },
      2056: { T: -1 },
      2057: { T: 1 },
      2058: { T: -1 },
      2060: {},
      2067: {},
      2068: { T: 1 },
      2069: { T: -1 },
      2070: {},
      2071: {},
      2072: { T: 1 },
      2073: { T: -1 },
      2075: {},
      2076: {},
      2077: { T: 1 },
      2078: { T: -1 },
      2079: {},
      2080: { T: 1 },
      2081: { T: -1 },
      2082: {},
      2083: { T: 1 },
      2084: { T: -1 },
      2085: { T: 1 },
      2086: { T: -1 },
      2087: { T: 1 },
      2088: { T: -1 },
      2089: { T: 1 },
      2090: { T: -1 },
      2091: {},
      2092: {},
      2093: { T: 1 },
      2094: { T: -1 },
      2095: {},
      2096: { T: 1 },
      2097: { T: -1 },
      2098: { T: 1 },
      2099: { T: -1 },
      2100: { T: 1 },
      2101: { T: -1 },
      2102: {},
      2103: { T: 1 },
      2104: { T: -1 },
      2105: {},
      2106: { T: 1 },
      2107: { T: -1 },
      2108: {},
      2109: { T: 1 },
      2110: { T: -1 },
      2111: { T: 1 },
      2112: { T: -1 },
      2113: { T: 1 },
      2114: { T: -1 },
      2115: {},
      2116: {},
      2117: {},
      2118: { T: 1 },
      2119: { T: -1 },
      2120: {},
      2121: { T: 1 },
      2122: { T: -1 },
      2123: { T: 1 },
      2124: { T: -1 },
      2125: {},
      2126: { T: 1 },
      2127: { T: -1 },
      2128: {},
      2129: { T: 1 },
      2130: { T: -1 },
      2131: { T: 1 },
      2132: { T: -1 },
      2133: { T: 1 },
      2134: {},
      2135: {},
      2136: {},
      2137: { T: 1 },
      2138: { T: -1 },
      2139: { T: 1 },
      2140: { T: -1 },
      2141: {},
      3072: {},
      3073: {},
      4096: { T: 1 },
      4097: { T: -1 },
      5002: { T: 1 },
      5003: { T: -1 },
      5081: { T: 1 },
      5082: { T: -1 },
      5083: {},
      5084: { T: 1 },
      5085: { T: -1 },
      5086: { T: 1 },
      5087: { T: -1 },
      5088: {},
      5089: {},
      5090: {},
      5092: { T: 1 },
      5093: { T: -1 },
      5094: {},
      5095: { T: 1 },
      5096: { T: -1 },
      5097: {},
      5099: {},
      65535: { n: "" },
    },
    Pf = {
      6: { f: Lc },
      10: { f: Rn },
      12: { f: Nn },
      13: { f: Nn },
      14: { f: On },
      15: { f: On },
      16: { f: xa },
      17: { f: On },
      18: { f: On },
      19: { f: Nn },
      20: { f: fs },
      21: { f: fs },
      23: { f: ps },
      24: { f: ds },
      25: { f: On },
      26: {},
      27: {},
      28: {
        f: function (e, t, r) {
          return (function (e, t) {
            if (!(t.biff < 8)) {
              var r = e.read_shift(2),
                a = e.read_shift(2),
                n = e.read_shift(2),
                s = e.read_shift(2),
                i = Bn(e, 0, t);
              return t.biff < 8 && e.read_shift(1), [{ r: r, c: a }, i, s, n];
            }
          })(e, r);
        },
      },
      29: {},
      34: { f: On },
      35: { f: hs },
      38: { f: xa },
      39: { f: xa },
      40: { f: xa },
      41: { f: xa },
      42: { f: On },
      43: { f: On },
      47: {
        f: function (e, t, r) {
          var a = { Type: 8 <= r.biff ? e.read_shift(2) : 0 };
          return (
            a.Type
              ? Ki(e, t - 2, a)
              : ((t = e),
                r.biff,
                (e = r),
                (r = a),
                (t = { key: Nn(t), verificationBytes: Nn(t) }),
                e.password && (t.verifier = zi(e.password)),
                (r.valid = t.verificationBytes === t.verifier),
                r.valid && (r.insitu = Yi(e.password))),
            a
          );
        },
      },
      49: {
        f: function (e, t, r) {
          var a = { dyHeight: e.read_shift(2), fl: e.read_shift(2) };
          switch ((r && r.biff) || 8) {
            case 2:
              break;
            case 3:
            case 4:
              e.l += 2;
              break;
            default:
              e.l += 10;
          }
          return (a.name = Ln(e, 0, r)), a;
        },
      },
      51: { f: Nn },
      60: {},
      61: {
        f: function (e) {
          return {
            Pos: [e.read_shift(2), e.read_shift(2)],
            Dim: [e.read_shift(2), e.read_shift(2)],
            Flags: e.read_shift(2),
            CurTab: e.read_shift(2),
            FirstTab: e.read_shift(2),
            Selected: e.read_shift(2),
            TabRatio: e.read_shift(2),
          };
        },
      },
      64: { f: On },
      65: { f: function () {} },
      66: { f: Nn },
      77: {},
      80: {},
      81: {},
      82: {},
      85: { f: Nn },
      89: {},
      90: {},
      91: {},
      92: {
        f: function (e, t, r) {
          if (r.enc) return (e.l += t), "";
          var a = e.l,
            r = Bn(e, 0, r);
          return e.read_shift(t + a - e.l), r;
        },
      },
      93: {
        f: function (e, t, r) {
          return r && r.biff < 8
            ? (function (e, t, r) {
                e.l += 4;
                var a = e.read_shift(2),
                  n = e.read_shift(2),
                  s = e.read_shift(2);
                (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 2),
                  (e.l += 6),
                  (t -= 36);
                var i = [];
                return (
                  i.push((gs[a] || Pr)(e, t, r)), { cmo: [n, a, s], ft: i }
                );
              })(e, t, r)
            : {
                cmo: (r = Qn(e)),
                ft: (function (t, e) {
                  for (var r = t.l + e, a = []; t.l < r; ) {
                    var n = t.read_shift(2);
                    t.l -= 2;
                    try {
                      a.push(ts[n](t, r - t.l));
                    } catch (e) {
                      return (t.l = r), a;
                    }
                  }
                  return t.l != r && (t.l = r), a;
                })(e, t - 22, r[1]),
              };
        },
      },
      94: {},
      95: { f: On },
      96: {},
      97: {},
      99: { f: On },
      125: { f: vs },
      128: {
        f: function (e) {
          if (
            ((e.l += 4),
            0 !== (e = [e.read_shift(2), e.read_shift(2)])[0] && e[0]--,
            0 !== e[1] && e[1]--,
            7 < e[0] || 7 < e[1])
          )
            throw new Error("Bad Gutters: " + e.join("|"));
          return e;
        },
      },
      129: {
        f: function (e, t, r) {
          return {
            fDialog:
              16 &
              (t =
                (r && 8 == r.biff) || 2 == t
                  ? e.read_shift(2)
                  : ((e.l += t), 0)),
            fBelow: 64 & t,
            fRight: 128 & t,
          };
        },
      },
      130: { f: Nn },
      131: { f: On },
      132: { f: On },
      133: {
        f: function (e, t, r) {
          var a = e.read_shift(4),
            n = 3 & e.read_shift(1),
            s = e.read_shift(1);
          switch (s) {
            case 0:
              s = "Worksheet";
              break;
            case 1:
              s = "Macrosheet";
              break;
            case 2:
              s = "Chartsheet";
              break;
            case 6:
              s = "VBAModule";
          }
          return (
            (r = Ln(e, 0, r)),
            { pos: a, hs: n, dt: s, name: (r = 0 === r.length ? "Sheet1" : r) }
          );
        },
      },
      134: {},
      140: {
        f: function (e) {
          var t = [0, 0],
            r = e.read_shift(2);
          return (
            (t[0] = Ma[r] || r), (r = e.read_shift(2)), (t[1] = Ma[r] || r), t
          );
        },
      },
      141: { f: Nn },
      144: {},
      146: {
        f: function (e) {
          for (var t = e.read_shift(2), r = []; 0 < t--; ) r.push(jn(e));
          return r;
        },
      },
      151: {},
      152: {},
      153: {},
      154: {},
      155: {},
      156: { f: Nn },
      157: {},
      158: {},
      160: { f: Ts },
      161: {
        f: function (e, t) {
          var r = {};
          return (
            t < 32 ||
              ((e.l += 16), (r.header = xa(e)), (r.footer = xa(e)), (e.l += 2)),
            r
          );
        },
      },
      174: {},
      175: {},
      176: {},
      177: {},
      178: {},
      180: {},
      181: {},
      182: {},
      184: {},
      185: {},
      189: {
        f: function (e, t) {
          for (
            var r = e.l + t - 2,
              a = e.read_shift(2),
              n = e.read_shift(2),
              s = [];
            e.l < r;

          )
            s.push(Yn(e));
          if (e.l !== r) throw new Error("MulRK read error");
          if (((t = e.read_shift(2)), s.length != t - n + 1))
            throw new Error("MulRK length mismatch");
          return { r: a, c: n, C: t, rkrec: s };
        },
      },
      190: {
        f: function (e, t) {
          for (
            var r = e.l + t - 2,
              a = e.read_shift(2),
              n = e.read_shift(2),
              s = [];
            e.l < r;

          )
            s.push(e.read_shift(2));
          if (e.l !== r) throw new Error("MulBlank read error");
          if (((t = e.read_shift(2)), s.length != t - n + 1))
            throw new Error("MulBlank length mismatch");
          return { r: a, c: n, C: t, ixfe: s };
        },
      },
      193: { f: Rn },
      197: {},
      198: {},
      199: {},
      200: {},
      201: {},
      202: { f: On },
      203: {},
      204: {},
      205: {},
      206: {},
      207: {},
      208: {},
      209: {},
      210: {},
      211: {},
      213: {},
      215: {},
      216: {},
      217: {},
      218: { f: Nn },
      220: {},
      221: { f: On },
      222: {},
      224: {
        f: function (e, t, r) {
          var a,
            n,
            s,
            i = {};
          return (
            (i.ifnt = e.read_shift(2)),
            (i.numFmtId = e.read_shift(2)),
            (i.flags = e.read_shift(2)),
            (i.fStyle = (i.flags >> 2) & 1),
            (t -= 6),
            (i.data =
              ((a = e),
              i.fStyle,
              (n = r),
              (s = {}),
              (t = a.read_shift(4)),
              (e = a.read_shift(4)),
              (r = a.read_shift(4)),
              (a = a.read_shift(2)),
              (s.patternType = Ua[r >> 26]),
              n.cellStyles &&
                ((s.alc = 7 & t),
                (s.fWrap = (t >> 3) & 1),
                (s.alcV = (t >> 4) & 7),
                (s.fJustLast = (t >> 7) & 1),
                (s.trot = (t >> 8) & 255),
                (s.cIndent = (t >> 16) & 15),
                (s.fShrinkToFit = (t >> 20) & 1),
                (s.iReadOrder = (t >> 22) & 2),
                (s.fAtrNum = (t >> 26) & 1),
                (s.fAtrFnt = (t >> 27) & 1),
                (s.fAtrAlc = (t >> 28) & 1),
                (s.fAtrBdr = (t >> 29) & 1),
                (s.fAtrPat = (t >> 30) & 1),
                (s.fAtrProt = (t >> 31) & 1),
                (s.dgLeft = 15 & e),
                (s.dgRight = (e >> 4) & 15),
                (s.dgTop = (e >> 8) & 15),
                (s.dgBottom = (e >> 12) & 15),
                (s.icvLeft = (e >> 16) & 127),
                (s.icvRight = (e >> 23) & 127),
                (s.grbitDiag = (e >> 30) & 3),
                (s.icvTop = 127 & r),
                (s.icvBottom = (r >> 7) & 127),
                (s.icvDiag = (r >> 14) & 127),
                (s.dgDiag = (r >> 21) & 15),
                (s.icvFore = 127 & a),
                (s.icvBack = (a >> 7) & 127),
                (s.fsxButton = (a >> 14) & 1)),
              s)),
            i
          );
        },
      },
      225: {
        f: function (e, t) {
          return 0 === t || e.read_shift(2), 1200;
        },
      },
      226: { f: Rn },
      227: {},
      229: {
        f: function (e, t) {
          for (var r = [], a = e.read_shift(2); a--; ) r.push(Kn(e));
          return r;
        },
      },
      233: {},
      235: {},
      236: {},
      237: {},
      239: {},
      240: {},
      241: {},
      242: {},
      244: {},
      245: {},
      246: {},
      247: {},
      248: {},
      249: {},
      251: {},
      252: {
        f: function (e, t) {
          for (
            var r = e.l + t,
              t = e.read_shift(4),
              a = e.read_shift(4),
              n = [],
              s = 0;
            s != a && e.l < r;
            ++s
          )
            n.push(
              (function (e) {
                var t = f;
                f = 1200;
                var r,
                  a = e.read_shift(2),
                  n = 4 & (c = e.read_shift(1)),
                  s = 8 & c,
                  i = 1 + (1 & c),
                  o = 0,
                  c = {};
                return (
                  s && (o = e.read_shift(2)),
                  n && (r = e.read_shift(4)),
                  (i = 2 == i ? "dbcs-cont" : "sbcs-cont"),
                  (i = 0 === a ? "" : e.read_shift(a, i)),
                  s && (e.l += 4 * o),
                  n && (e.l += r),
                  (c.t = i),
                  s || ((c.raw = "<t>" + c.t + "</t>"), (c.r = c.t)),
                  (f = t),
                  c
                );
              })(e),
            );
          return (n.Count = t), (n.Unique = a), n;
        },
      },
      253: {
        f: function (e) {
          var t = $n(e);
          return (t.isst = e.read_shift(4)), t;
        },
      },
      255: {
        f: function (e, t) {
          var r = {};
          return (r.dsst = e.read_shift(2)), (e.l += t - 2), r;
        },
      },
      256: {},
      259: {},
      290: {},
      311: {},
      312: {},
      315: {},
      317: { f: Dn },
      318: {},
      319: {},
      320: {},
      330: {},
      331: {},
      333: {},
      334: {},
      335: {},
      336: {},
      337: {},
      338: {},
      339: {},
      340: {},
      351: {},
      352: { f: On },
      353: { f: Rn },
      401: {},
      402: {},
      403: {},
      404: {},
      405: {},
      406: {},
      407: {},
      408: {},
      425: {},
      426: {},
      427: {},
      428: {},
      429: {},
      430: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = e.read_shift(2),
            t = e.read_shift(2);
          if (1025 == (r.sbcch = t) || 14849 == t) return [t, n];
          if (t < 1 || 255 < t)
            throw new Error("Unexpected SupBook type: " + t);
          for (var r = Mn(e, t), s = []; a > e.l; ) s.push(Un(e));
          return [t, n, r, s];
        },
      },
      431: { f: On },
      432: {},
      433: {},
      434: {},
      437: {},
      438: {
        f: function (t, r, e) {
          var a = t.l,
            n = "";
          try {
            t.l += 4;
            var s = (e.lastobj || { cmo: [0, 0] }).cmo[1];
            -1 == [0, 5, 7, 11, 12, 14].indexOf(s)
              ? (t.l += 6)
              : (function (e) {
                  var t = e.read_shift(1);
                  e.l++;
                  var r = e.read_shift(2);
                  e.l += 2;
                })(t);
            var i = t.read_shift(2);
            t.read_shift(2), Nn(t);
            s = t.read_shift(2);
            t.l += s;
            for (var o = 1; o < t.lens.length - 1; ++o) {
              if (t.l - a != t.lens[o])
                throw new Error("TxO: bad continue record");
              var c = t[t.l];
              if (
                (n += Mn(t, t.lens[o + 1] - t.lens[o] - 1)).length >=
                (c ? i : 2 * i)
              )
                break;
            }
            if (n.length !== i && n.length !== 2 * i)
              throw new Error("cchText: " + i + " != " + n.length);
            return (t.l = a + r), { t: n };
          } catch (e) {
            return (t.l = a + r), { t: n };
          }
        },
      },
      439: { f: On },
      440: {
        f: function (e, t) {
          var r = Kn(e);
          return (
            (e.l += 16),
            [
              r,
              (function (e, t) {
                var r = e.l + t;
                if (2 !== (c = e.read_shift(4)))
                  throw new Error("Unrecognized streamVersion: " + c);
                (t = e.read_shift(2)), (e.l += 2);
                var a,
                  n,
                  s,
                  i,
                  o,
                  c = "";
                16 & t && (a = zn(e, e.l)),
                  128 & t && (n = zn(e, e.l)),
                  257 == (257 & t) && (s = zn(e, e.l)),
                  1 == (257 & t) && (l = Hn(e, e.l)),
                  8 & t && (c = zn(e, e.l)),
                  32 & t && (i = e.read_shift(16)),
                  64 & t && (o = pn(e)),
                  (e.l = r);
                var l = n || s || l || "";
                return (
                  l && c && (l += "#" + c),
                  (l = l || "#" + c),
                  (l = {
                    Target: (l =
                      2 & t && "/" == l.charAt(0) && "/" != l.charAt(1)
                        ? "file://" + l
                        : l),
                  }),
                  i && (l.guid = i),
                  o && (l.time = o),
                  a && (l.Tooltip = a),
                  l
                );
              })(e, t - 24),
            ]
          );
        },
      },
      441: {},
      442: { f: Un },
      443: {},
      444: { f: Nn },
      445: {},
      446: {},
      448: { f: Rn },
      449: {
        f: function (e) {
          return e.read_shift(2), e.read_shift(4);
        },
        r: 2,
      },
      450: { f: Rn },
      512: { f: os },
      513: { f: ws },
      515: {
        f: function (e, t, r) {
          return (
            r.biffguess && 2 == r.biff && (r.biff = 5),
            (r = $n(e)),
            (e = xa(e)),
            (r.val = e),
            r
          );
        },
      },
      516: {
        f: function (e, t, r) {
          return (
            r.biffguess && 2 == r.biff && (r.biff = 5),
            e.l,
            (t = $n(e)),
            2 == r.biff && e.l++,
            (r = Un(e, e.l, r)),
            (t.val = r),
            t
          );
        },
      },
      517: { f: ls },
      519: { f: Es },
      520: {
        f: function (e) {
          var t = {};
          (t.r = e.read_shift(2)),
            (t.c = e.read_shift(2)),
            (t.cnt = e.read_shift(2) - t.c);
          var r = e.read_shift(2);
          e.l += 4;
          var a = e.read_shift(1);
          return (
            (e.l += 3),
            7 & a && (t.level = 7 & a),
            32 & a && (t.hidden = !0),
            64 & a && (t.hpt = r / 20),
            t
          );
        },
      },
      523: {},
      545: { f: ms },
      549: { f: ss },
      566: {},
      574: {
        f: function (e, t, r) {
          return r && 2 <= r.biff && r.biff < 5
            ? {}
            : { RTL: 64 & e.read_shift(2) };
        },
      },
      638: {
        f: function (e) {
          var t = e.read_shift(2),
            r = e.read_shift(2),
            e = Yn(e);
          return { r: t, c: r, ixfe: e[0], rknum: e[1] };
        },
      },
      659: {},
      1048: {},
      1054: {
        f: function (e, t, r) {
          return [e.read_shift(2), Bn(e, 0, r)];
        },
      },
      1084: {},
      1212: {
        f: function (e, t, r) {
          var a = qn(e);
          e.l++;
          var n = e.read_shift(1);
          return [
            (function (e, t, r) {
              var a,
                n = e.l + t,
                s = e.read_shift(2),
                i = Ic(e, s, r);
              if (65535 == s) return [[], Pr(e, t - 2)];
              t !== s + 2 && (a = Oc(e, n - s - 2, i, r));
              return [i, a];
            })(e, (t -= 8), r),
            n,
            a,
          ];
        },
      },
      2048: {
        f: function (e, t) {
          return (
            e.read_shift(2),
            [Kn(e), e.read_shift((t - 10) / 2, "dbcs-cont").replace(de, "")]
          );
        },
      },
      2049: {},
      2050: {},
      2051: {},
      2052: {},
      2053: {},
      2054: {},
      2055: {},
      2056: {},
      2057: { f: rs },
      2058: {},
      2059: {},
      2060: {},
      2061: {},
      2062: {},
      2063: {},
      2064: {},
      2066: {},
      2067: {},
      2128: {},
      2129: {},
      2130: {},
      2131: {},
      2132: {},
      2133: {},
      2134: {},
      2135: {},
      2136: {},
      2137: {},
      2138: {},
      2146: {},
      2147: { r: 12 },
      2148: {},
      2149: {},
      2150: {},
      2151: { f: Rn },
      2152: {},
      2154: {},
      2155: {},
      2156: {},
      2161: {},
      2162: {},
      2164: {},
      2165: {},
      2166: {},
      2167: {},
      2168: {},
      2169: {},
      2170: {},
      2171: {},
      2172: {
        f: function (e) {
          e.l += 2;
          var t = { cxfs: 0, crc: 0 };
          return (t.cxfs = e.read_shift(2)), (t.crc = e.read_shift(4)), t;
        },
        r: 12,
      },
      2173: {
        f: function (e, t) {
          e.l, (e.l += 2), (t = e.read_shift(2)), (e.l += 2);
          for (var r = e.read_shift(2), a = []; 0 < r--; ) a.push(Ko(e, e.l));
          return { ixfe: t, ext: a };
        },
        r: 12,
      },
      2174: {},
      2175: {},
      2180: {},
      2181: {},
      2182: {},
      2183: {},
      2184: {},
      2185: {},
      2186: {},
      2187: {},
      2188: { f: On, r: 12 },
      2189: {},
      2190: { r: 12 },
      2191: {},
      2192: {},
      2194: {},
      2195: {},
      2196: {
        f: function (e, t, r) {
          if (!(r.biff < 8)) {
            var a = e.read_shift(2),
              n = e.read_shift(2);
            return [Mn(e, a, r), Mn(e, n, r)];
          }
          e.l += t;
        },
        r: 12,
      },
      2197: {},
      2198: {
        f: function (e, t, r) {
          var a = e.l + t;
          if (124226 !== e.read_shift(4))
            if (r.cellStyles) {
              var n,
                s = e.slice(e.l);
              e.l = a;
              try {
                n = st(s, { type: "array" });
              } catch (e) {
                return;
              }
              t = tt(n, "theme/theme/theme1.xml", !0);
              if (t) return $o(t, r);
            } else e.l = a;
        },
        r: 12,
      },
      2199: {},
      2200: {},
      2201: {},
      2202: {
        f: function (e) {
          return [
            0 !== e.read_shift(4),
            0 !== e.read_shift(4),
            e.read_shift(4),
          ];
        },
        r: 12,
      },
      2203: { f: Rn },
      2204: {},
      2205: {},
      2206: {},
      2207: {},
      2211: {
        f: function (e) {
          var t,
            r,
            a =
              ((r = (t = e).read_shift(2)),
              (a = t.read_shift(2)),
              (t.l += 8),
              { type: r, flags: a });
          if (2211 != a.type)
            throw new Error("Invalid Future Record " + a.type);
          return 0 !== e.read_shift(4);
        },
      },
      2212: {},
      2213: {},
      2214: {},
      2215: {},
      4097: {},
      4098: {},
      4099: {},
      4102: {},
      4103: {},
      4105: {},
      4106: {},
      4107: {},
      4108: {},
      4109: {},
      4116: {},
      4117: {},
      4118: {},
      4119: {},
      4120: {},
      4121: {},
      4122: {},
      4123: {},
      4124: {},
      4125: {},
      4126: {},
      4127: {},
      4128: {},
      4129: {},
      4130: {},
      4132: {},
      4133: {},
      4134: { f: Nn },
      4135: {},
      4146: {},
      4147: {},
      4148: {},
      4149: {},
      4154: {},
      4156: {},
      4157: {},
      4158: {},
      4159: {},
      4160: {},
      4161: {},
      4163: {},
      4164: {
        f: function (e, t, r) {
          var a = { area: !1 };
          return (
            5 != r.biff
              ? (e.l += t)
              : ((t = e.read_shift(1)), (e.l += 3), 16 & t && (a.area = !0)),
            a
          );
        },
      },
      4165: {},
      4166: {},
      4168: {},
      4170: {},
      4171: {},
      4174: {},
      4175: {},
      4176: {},
      4177: {},
      4187: {},
      4188: {
        f: function (e) {
          for (var t = e.read_shift(2), r = []; 0 < t--; ) r.push(jn(e));
          return r;
        },
      },
      4189: {},
      4191: {},
      4192: {},
      4193: {},
      4194: {},
      4195: {},
      4196: {},
      4197: {},
      4198: {},
      4199: {},
      4200: {},
      0: { f: os },
      1: {},
      2: {
        f: function (e) {
          var t = $n(e);
          return ++e.l, (e = e.read_shift(2)), (t.t = "n"), (t.val = e), t;
        },
      },
      3: {
        f: function (e) {
          var t = $n(e);
          return ++e.l, (e = xa(e)), (t.t = "n"), (t.val = e), t;
        },
      },
      4: {
        f: function (e, t, r) {
          r.biffguess && 5 == r.biff && (r.biff = 2);
          var a = $n(e);
          return ++e.l, (r = Bn(e, 0, r)), (a.t = "str"), (a.val = r), a;
        },
      },
      5: { f: ls },
      7: {
        f: function (e) {
          var t = e.read_shift(1);
          return 0 === t ? (e.l++, "") : e.read_shift(t, "sbcs-cont");
        },
      },
      8: {},
      9: { f: rs },
      11: {},
      22: { f: Nn },
      30: { f: is },
      31: {},
      32: {},
      33: { f: ms },
      36: {},
      37: { f: ss },
      50: {
        f: function (e, t) {
          (e.l += 6),
            (e.l += 2),
            (e.l += 1),
            (e.l += 3),
            (e.l += 1),
            (e.l += t - 13);
        },
      },
      62: {},
      52: {},
      67: {},
      68: { f: Nn },
      69: {},
      86: {},
      126: {},
      127: {
        f: function (e) {
          var t = e.read_shift(2),
            r = e.read_shift(2),
            a = e.read_shift(4),
            r = { fmt: t, env: r, len: a, data: e.slice(e.l, e.l + a) };
          return (e.l += a), r;
        },
      },
      135: {},
      136: {},
      137: {},
      145: {},
      148: {},
      149: {},
      150: {},
      169: {},
      171: {},
      188: {},
      191: {},
      192: {},
      194: {},
      195: {},
      214: {
        f: function (e, t, r) {
          var a = e.l + t,
            n = $n(e),
            t = e.read_shift(2),
            r = Mn(e, t, r);
          return (e.l = a), (n.t = "str"), (n.val = r), n;
        },
      },
      223: {},
      234: {},
      354: {},
      421: {},
      518: { f: Lc },
      521: { f: rs },
      536: { f: ds },
      547: { f: hs },
      561: {},
      579: {},
      1030: { f: Lc },
      1033: { f: rs },
      1091: {},
      2157: {},
      2163: {},
      2177: {},
      2240: {},
      2241: {},
      2242: {},
      2243: {},
      2244: {},
      2245: {},
      2246: {},
      2247: {},
      2248: {},
      2249: {},
      2250: {},
      2251: {},
      2262: { r: 12 },
      29282: {},
    };
  function Lf(e, t, r, a) {
    var n = t;
    isNaN(n) ||
      ((t = a || (r || []).length || 0),
      (a = e.next(4)).write_shift(2, n),
      a.write_shift(2, t),
      0 < t && Er(r) && e.push(r));
  }
  function Mf(e, t, r) {
    return (
      (e = e || Lr(7)).write_shift(2, t),
      e.write_shift(2, r),
      e.write_shift(2, 0),
      e.write_shift(1, 0),
      e
    );
  }
  function Uf(e, t, r, a) {
    if (null != t.v)
      switch (t.t) {
        case "d":
        case "n":
          var n = "d" == t.t ? De(He(t.v)) : t.v;
          return void (n == (0 | n) && 0 <= n && n < 65536
            ? Lf(
                e,
                2,
                ((f = r),
                (h = a),
                (u = n),
                Mf((d = Lr(9)), f, h),
                d.write_shift(2, u),
                d),
              )
            : Lf(
                e,
                3,
                ((u = r),
                (d = a),
                (n = n),
                Mf((l = Lr(15)), u, d),
                l.write_shift(8, n, "f"),
                l),
              ));
        case "b":
        case "e":
          return void Lf(
            e,
            5,
            ((l = r),
            (s = a),
            (i = t.v),
            (o = t.t),
            Mf((c = Lr(9)), l, s),
            Pn(i, o || "b", c),
            c),
          );
        case "s":
        case "str":
          return void Lf(
            e,
            4,
            ((s = r),
            (i = a),
            (o = (t.v || "").slice(0, 255)),
            Mf((c = Lr(8 + 2 * o.length)), s, i),
            c.write_shift(1, o.length),
            c.write_shift(o.length, o, "sbcs"),
            c.l < c.length ? c.slice(0, c.l) : c),
          );
      }
    var s, i, o, c, l, f, h, u, d;
    Lf(e, 1, Mf(null, r, a));
  }
  function Bf(e, t) {
    var r = t || {};
    null != oe && null == r.dense && (r.dense = oe);
    for (var t = Ur(), a = 0, n = 0; n < e.SheetNames.length; ++n)
      e.SheetNames[n] == r.sheet && (a = n);
    if (0 == a && r.sheet && e.SheetNames[0] != r.sheet)
      throw new Error("Sheet not found: " + r.sheet);
    return (
      Lf(t, 4 == r.biff ? 1033 : 3 == r.biff ? 521 : 9, as(0, 16, r)),
      (function (e, t, r) {
        var a,
          n,
          s = Array.isArray(t),
          i = Zr(t["!ref"] || "A1"),
          o = [];
        if (255 < i.e.c || 16383 < i.e.r) {
          if (r.WTF)
            throw new Error(
              "Range " +
                (t["!ref"] || "A1") +
                " exceeds format limit A1:IV16384",
            );
          (i.e.c = Math.min(i.e.c, 255)),
            (i.e.r = Math.min(i.e.c, 16383)),
            (a = qr(i));
        }
        for (var c = i.s.r; c <= i.e.r; ++c) {
          n = jr(c);
          for (var l = i.s.c; l <= i.e.c; ++l) {
            c === i.s.r && (o[l] = Xr(l)), (a = o[l] + n);
            var f = s ? (t[c] || [])[l] : t[a];
            f && Uf(e, f, c, l);
          }
        }
      })(t, e.Sheets[e.SheetNames[a]], r),
      Lf(t, 10),
      t.end()
    );
  }
  function Wf(e, t, r) {
    var a, n;
    Lf(
      e,
      49,
      ((n =
        (a = {
          sz: 12,
          color: { theme: 1 },
          name: "Arial",
          family: 2,
          scheme: "minor",
        }).name || "Arial"),
      (e = Lr(
        (r = (e = r) && 5 == e.biff) ? 15 + n.length : 16 + 2 * n.length,
      )).write_shift(2, 20 * (a.sz || 12)),
      e.write_shift(4, 0),
      e.write_shift(2, 400),
      e.write_shift(4, 0),
      e.write_shift(2, 0),
      e.write_shift(1, n.length),
      r || e.write_shift(1, 1),
      e.write_shift((r ? 1 : 2) * n.length, n, r ? "sbcs" : "utf16le"),
      e),
    );
  }
  function Hf(i, o, c) {
    o &&
      [
        [5, 8],
        [23, 26],
        [41, 44],
        [50, 392],
      ].forEach(function (e) {
        for (var t, r, a, n, s = e[0]; s <= e[1]; ++s)
          null != o[s] &&
            Lf(
              i,
              1054,
              ((t = s),
              (r = o[s]),
              (n = void 0),
              (a = (a = c) && 5 == a.biff),
              (n = n || Lr(a ? 3 + r.length : 5 + 2 * r.length)).write_shift(
                2,
                t,
              ),
              n.write_shift(a ? 1 : 2, r.length),
              a || n.write_shift(1, 1),
              n.write_shift((a ? 1 : 2) * r.length, r, a ? "sbcs" : "utf16le"),
              null == (n = n.length > n.l ? n.slice(0, n.l) : n).l &&
                (n.l = n.length),
              n),
            );
      });
  }
  function zf(e, t) {
    for (var r = 0; r < t["!links"].length; ++r) {
      var a = t["!links"][r];
      Lf(e, 440, bs(a)),
        a[1].Tooltip &&
          Lf(
            e,
            2048,
            (function (e) {
              var t = e[1].Tooltip,
                r = Lr(10 + 2 * (t.length + 1));
              r.write_shift(2, 2048),
                (e = Yr(e[0])),
                r.write_shift(2, e.r),
                r.write_shift(2, e.r),
                r.write_shift(2, e.c),
                r.write_shift(2, e.c);
              for (var a = 0; a < t.length; ++a)
                r.write_shift(2, t.charCodeAt(a));
              return r.write_shift(2, 0), r;
            })(a),
          );
    }
    delete t["!links"];
  }
  function Vf(a, e) {
    var n;
    e &&
      ((n = 0),
      e.forEach(function (e, t) {
        var r;
        ++n <= 256 &&
          e &&
          Lf(
            a,
            125,
            ((r = Zc(t, e)),
            (e = t),
            (t = Lr(12)).write_shift(2, e),
            t.write_shift(2, e),
            t.write_shift(2, 256 * r.width),
            t.write_shift(2, 0),
            (e = 0),
            r.hidden && (e |= 1),
            t.write_shift(1, e),
            (e = r.level || 0),
            t.write_shift(1, e),
            t.write_shift(2, 0),
            t),
          );
      }));
  }
  function Gf(e, t, r, a, n) {
    var s,
      i,
      o,
      c,
      l,
      f,
      h,
      u,
      d,
      p,
      m,
      g = 16 + el(n.cellXfs, t, n);
    if (null != t.v || t.bf)
      if (t.bf) Lf(e, 6, Mc(t, r, a, 0, g));
      else
        switch (t.t) {
          case "d":
          case "n":
            var b = "d" == t.t ? De(He(t.v)) : t.v;
            Lf(
              e,
              515,
              ((f = r),
              (h = a),
              (u = b),
              (d = g),
              (p = Lr(14)),
              Xn(f, h, d, p),
              Aa(u, p),
              p),
            );
            break;
          case "b":
          case "e":
            Lf(
              e,
              517,
              ((b = r),
              (f = a),
              (h = t.v),
              (d = g),
              (u = t.t),
              (p = Lr(8)),
              Xn(b, f, d, p),
              Pn(h, u, p),
              p),
            );
            break;
          case "s":
          case "str":
            n.bookSST
              ? ((m = qc(n.Strings, t.v, n.revStrings)),
                Lf(
                  e,
                  253,
                  ((s = r),
                  (i = a),
                  (o = m),
                  (c = g),
                  (l = Lr(10)),
                  Xn(s, i, c, l),
                  l.write_shift(4, o),
                  l),
                ))
              : Lf(
                  e,
                  516,
                  ((m = r),
                  (s = a),
                  (i = (t.v || "").slice(0, 255)),
                  (c = g),
                  (o = Lr(
                    +(l = !(o = n) || 8 == o.biff) + 8 + (1 + l) * i.length,
                  )),
                  Xn(m, s, c, o),
                  o.write_shift(2, i.length),
                  l && o.write_shift(1, 1),
                  o.write_shift((1 + l) * i.length, i, l ? "utf16le" : "sbcs"),
                  o),
                );
            break;
          default:
            Lf(e, 513, Xn(r, a, g));
        }
    else Lf(e, 513, Xn(r, a, g));
  }
  function jf(e, t, r) {
    var a,
      n,
      s = Ur(),
      i = r.SheetNames[e],
      o = r.Sheets[i] || {},
      c = (r || {}).Workbook || {},
      l = (c.Sheets || [])[e] || {},
      f = Array.isArray(o),
      h = 8 == t.biff,
      u = [],
      d = Zr(o["!ref"] || "A1"),
      p = h ? 65536 : 16384;
    if (255 < d.e.c || d.e.r >= p) {
      if (t.WTF)
        throw new Error(
          "Range " + (o["!ref"] || "A1") + " exceeds format limit A1:IV16384",
        );
      (d.e.c = Math.min(d.e.c, 255)), (d.e.r = Math.min(d.e.c, p - 1));
    }
    Lf(s, 2057, as(0, 16, t)),
      Lf(s, 13, Fn(1)),
      Lf(s, 12, Fn(100)),
      Lf(s, 15, In(!0)),
      Lf(s, 17, In(!1)),
      Lf(s, 16, Aa(0.001)),
      Lf(s, 95, In(!0)),
      Lf(s, 42, In(!1)),
      Lf(s, 43, In(!1)),
      Lf(s, 130, Fn(1)),
      Lf(
        s,
        128,
        ((r = [0, 0]),
        (e = Lr(8)).write_shift(4, 0),
        e.write_shift(2, r[0] ? r[0] + 1 : 0),
        e.write_shift(2, r[1] ? r[1] + 1 : 0),
        e),
      ),
      Lf(s, 131, In(!1)),
      Lf(s, 132, In(!1)),
      h && Vf(s, o["!cols"]),
      Lf(
        s,
        512,
        ((p = d),
        (r = Lr(2 * (e = 8 != (r = t).biff && r.biff ? 2 : 4) + 6)).write_shift(
          e,
          p.s.r,
        ),
        r.write_shift(e, p.e.r + 1),
        r.write_shift(2, p.s.c),
        r.write_shift(2, p.e.c + 1),
        r.write_shift(2, 0),
        r),
      ),
      h && (o["!links"] = []);
    for (var m = d.s.r; m <= d.e.r; ++m) {
      n = jr(m);
      for (var g = d.s.c; g <= d.e.c; ++g) {
        m === d.s.r && (u[g] = Xr(g)), (a = u[g] + n);
        var b = f ? (o[m] || [])[g] : o[a];
        b && (Gf(s, b, m, g, t), h && b.l && o["!links"].push([a, b.l]));
      }
    }
    var v,
      w,
      i = l.CodeName || l.name || i;
    return (
      h &&
        Lf(
          s,
          574,
          ((c = (c.Views || [])[0]),
          (w = Lr(18)),
          (v = 1718),
          c && c.RTL && (v |= 64),
          w.write_shift(2, v),
          w.write_shift(4, 0),
          w.write_shift(4, 64),
          w.write_shift(4, 0),
          w.write_shift(4, 0),
          w),
        ),
      h &&
        (o["!merges"] || []).length &&
        Lf(
          s,
          229,
          (function (e) {
            var t = Lr(2 + 8 * e.length);
            t.write_shift(2, e.length);
            for (var r = 0; r < e.length; ++r) Jn(e[r], t);
            return t;
          })(o["!merges"]),
        ),
      h && zf(s, o),
      Lf(s, 442, Wn(i)),
      h &&
        ((v = s),
        (w = o),
        (i = Lr(19)).write_shift(4, 2151),
        i.write_shift(4, 0),
        i.write_shift(4, 0),
        i.write_shift(2, 3),
        i.write_shift(1, 1),
        i.write_shift(4, 0),
        Lf(v, 2151, i),
        (i = Lr(39)).write_shift(4, 2152),
        i.write_shift(4, 0),
        i.write_shift(4, 0),
        i.write_shift(2, 3),
        i.write_shift(1, 0),
        i.write_shift(4, 0),
        i.write_shift(2, 1),
        i.write_shift(4, 4),
        i.write_shift(2, 0),
        Jn(Zr(w["!ref"] || "A1"), i),
        i.write_shift(4, 4),
        Lf(v, 2152, i)),
      Lf(s, 10),
      s.end()
    );
  }
  function $f(e, t, r) {
    var a = Ur(),
      n = (e || {}).Workbook || {},
      s = n.Sheets || [],
      i = n.WBProps || {},
      o = 8 == r.biff,
      n = 5 == r.biff;
    Lf(a, 2057, as(0, 5, r)),
      "xla" == r.bookType && Lf(a, 135),
      Lf(a, 225, o ? Fn(1200) : null),
      Lf(
        a,
        193,
        (function (e, t) {
          t = t || Lr(e);
          for (var r = 0; r < e; ++r) t.write_shift(1, 0);
          return t;
        })(2),
      ),
      n && Lf(a, 191),
      n && Lf(a, 192),
      Lf(a, 226),
      Lf(
        a,
        92,
        (function (e) {
          var t = !e || 8 == e.biff,
            r = Lr(t ? 112 : 54);
          for (
            r.write_shift(8 == e.biff ? 2 : 1, 7),
              t && r.write_shift(1, 0),
              r.write_shift(4, 859007059),
              r.write_shift(4, 5458548 | (t ? 0 : 536870912));
            r.l < r.length;

          )
            r.write_shift(1, t ? 0 : 32);
          return r;
        })(r),
      ),
      Lf(a, 66, Fn(o ? 1200 : 1252)),
      o && Lf(a, 353, Fn(0)),
      o && Lf(a, 448),
      Lf(
        a,
        317,
        (function (e) {
          for (var t = Lr(2 * e), r = 0; r < e; ++r) t.write_shift(2, r + 1);
          return t;
        })(e.SheetNames.length),
      ),
      o && e.vbaraw && Lf(a, 211),
      o && e.vbaraw && Lf(a, 442, Wn(i.CodeName || "ThisWorkbook")),
      Lf(a, 156, Fn(17)),
      Lf(a, 25, In(!1)),
      Lf(a, 18, In(!1)),
      Lf(a, 19, Fn(0)),
      o && Lf(a, 431, In(!1)),
      o && Lf(a, 444, Fn(0)),
      Lf(
        a,
        61,
        ((n = Lr(18)).write_shift(2, 0),
        n.write_shift(2, 0),
        n.write_shift(2, 29280),
        n.write_shift(2, 17600),
        n.write_shift(2, 56),
        n.write_shift(2, 0),
        n.write_shift(2, 0),
        n.write_shift(2, 1),
        n.write_shift(2, 500),
        n),
      ),
      Lf(a, 64, In(!1)),
      Lf(a, 141, Fn(0)),
      Lf(
        a,
        34,
        In(
          "true" ==
            ((i = e).Workbook &&
            i.Workbook.WBProps &&
            Rt(i.Workbook.WBProps.date1904)
              ? "true"
              : "false"),
        ),
      ),
      Lf(a, 14, In(!0)),
      o && Lf(a, 439, In(!1)),
      Lf(a, 218, Fn(0)),
      Wf(a, 0, r),
      Hf(a, e.SSF, r),
      (function (t, r) {
        for (var e = 0; e < 16; ++e)
          Lf(t, 224, cs({ numFmtId: 0, style: !0 }, 0, r));
        r.cellXfs.forEach(function (e) {
          Lf(t, 224, cs(e, 0, r));
        });
      })(a, r),
      o && Lf(a, 352, In(!1));
    (n = a.end()), (i = Ur());
    o &&
      Lf(i, 140, ((g = g || Lr(4)).write_shift(2, 1), g.write_shift(2, 1), g)),
      o &&
        r.Strings &&
        (function (e, t, r) {
          var a = void 0 || (r || []).length || 0;
          if (a <= 8224) return Lf(e, t, r, a);
          if (!isNaN(t)) {
            for (
              var n = r.parts || [], s = 0, i = 0, o = 0;
              o + (n[s] || 8224) <= 8224;

            )
              (o += n[s] || 8224), s++;
            var c = e.next(4);
            for (
              c.write_shift(2, t),
                c.write_shift(2, o),
                e.push(r.slice(i, i + o)),
                i += o;
              i < a;

            ) {
              for (
                (c = e.next(4)).write_shift(2, 60), o = 0;
                o + (n[s] || 8224) <= 8224;

              )
                (o += n[s] || 8224), s++;
              c.write_shift(2, o), e.push(r.slice(i, i + o)), (i += o);
            }
          }
        })(i, 252, ns(r.Strings)),
      Lf(i, 10);
    for (
      var a = i.end(), c = Ur(), l = 0, f = 0, f = 0;
      f < e.SheetNames.length;
      ++f
    )
      l += (o ? 12 : 11) + (o ? 2 : 1) * e.SheetNames[f].length;
    var h,
      u,
      d,
      p,
      m = n.length + l + a.length;
    for (f = 0; f < e.SheetNames.length; ++f)
      Lf(
        c,
        133,
        ((h = {
          pos: m,
          hs: (s[f] || {}).Hidden || 0,
          dt: 0,
          name: e.SheetNames[f],
        }),
        (p = d = void 0),
        (d = !(u = r) || 8 <= u.biff ? 2 : 1),
        (p = Lr(8 + d * h.name.length)).write_shift(4, h.pos),
        p.write_shift(1, h.hs || 0),
        p.write_shift(1, h.dt),
        p.write_shift(1, h.name.length),
        8 <= u.biff && p.write_shift(1, 1),
        p.write_shift(
          d * h.name.length,
          h.name,
          u.biff < 8 ? "sbcs" : "utf16le",
        ),
        ((u = p.slice(0, p.l)).l = p.l),
        u),
      ),
        (m += t[f].length);
    var g = c.end();
    if (l != g.length) throw new Error("BS8 " + l + " != " + g.length);
    i = [];
    return (
      n.length && i.push(n), g.length && i.push(g), a.length && i.push(a), ue(i)
    );
  }
  function Xf(e, t) {
    for (var r = 0; r <= e.SheetNames.length; ++r) {
      var a = e.Sheets[e.SheetNames[r]];
      a &&
        a["!ref"] &&
        255 < Jr(a["!ref"]).e.c &&
        "undefined" != typeof console &&
        console.error &&
        console.error(
          "Worksheet '" +
            e.SheetNames[r] +
            "' extends beyond column IV (255).  Data may be lost.",
        );
    }
    var n = t || {};
    switch (n.biff || 2) {
      case 8:
      case 5:
        return (function (e, t) {
          var r = t || {},
            a = [];
          e && !e.SSF && (e.SSF = Ve(me)),
            e &&
              e.SSF &&
              (Ee(),
              Te(e.SSF),
              (r.revssf = Ne(e.SSF)),
              (r.revssf[e.SSF[65535]] = 0),
              (r.ssf = e.SSF)),
            (r.Strings = []),
            (r.Strings.Count = 0),
            (r.Strings.Unique = 0),
            Uh(r),
            (r.cellXfs = []),
            el(r.cellXfs, {}, { revssf: { General: 0 } }),
            e.Props || (e.Props = {});
          for (var n = 0; n < e.SheetNames.length; ++n)
            a[a.length] = jf(n, r, e);
          return a.unshift($f(e, a, r)), ue(a);
        })(e, t);
      case 4:
      case 3:
      case 2:
        return Bf(e, t);
    }
    throw new Error("invalid type " + n.bookType + " for BIFF");
  }
  function Yf(e, t) {
    var r = t || {};
    null != oe && null == r.dense && (r.dense = oe);
    var a = r.dense ? [] : {},
      n = (e = e.replace(/<!--.*?-->/g, "")).match(/<table/i);
    if (!n) throw new Error("Invalid HTML: could not find <table>");
    for (
      var s,
        t = e.match(/<\/table/i),
        i = n.index,
        o = (t && t.index) || e.length,
        c = Ke(e.slice(i, o), /(:?<tr[^>]*>)/i, "<tr>"),
        l = -1,
        f = 0,
        h = { s: { r: 1e7, c: 1e7 }, e: { r: 0, c: 0 } },
        u = [],
        i = 0;
      i < c.length;
      ++i
    ) {
      var d = c[i].trim(),
        p = d.slice(0, 3).toLowerCase();
      if ("<tr" != p) {
        if ("<td" == p || "<th" == p)
          for (var m = d.split(/<\/t[dh]>/i), o = 0; o < m.length; ++o) {
            var g = m[o].trim();
            if (g.match(/<t[dh]/i)) {
              for (
                var b = g, v = 0;
                "<" == b.charAt(0) && -1 < (v = b.indexOf(">"));

              )
                b = b.slice(v + 1);
              for (var w = 0; w < u.length; ++w) {
                var T = u[w];
                T.s.c == f &&
                  T.s.r < l &&
                  l <= T.e.r &&
                  ((f = T.e.c + 1), (w = -1));
              }
              var E = dt(g.slice(0, g.indexOf(">"))),
                k = E.colspan ? +E.colspan : 1;
              (1 < (s = +E.rowspan) || 1 < k) &&
                u.push({
                  s: { r: l, c: f },
                  e: { r: l + (s || 1) - 1, c: f + k - 1 },
                });
              g = E.t || E["data-t"] || "";
              b.length &&
                ((b = Wt(b)),
                h.s.r > l && (h.s.r = l),
                h.e.r < l && (h.e.r = l),
                h.s.c > f && (h.s.c = f),
                h.e.c < f && (h.e.c = f),
                b.length &&
                  ((E = { t: "s", v: b }),
                  r.raw ||
                    !b.trim().length ||
                    "s" == g ||
                    ("TRUE" === b
                      ? (E = { t: "b", v: !0 })
                      : "FALSE" === b
                      ? (E = { t: "b", v: !1 })
                      : isNaN(je(b))
                      ? isNaN(Xe(b).getDate()) ||
                        ((E = { t: "d", v: He(b) }),
                        ((E = !r.cellDates ? { t: "n", v: De(E.v) } : E).z =
                          r.dateNF || me[14]))
                      : (E = { t: "n", v: je(b) })),
                  r.dense
                    ? (a[l] || (a[l] = []), (a[l][f] = E))
                    : (a[Kr({ r: l, c: f })] = E))),
                (f += k);
            }
          }
      } else {
        if ((++l, r.sheetRows && r.sheetRows <= l)) {
          --l;
          break;
        }
        f = 0;
      }
    }
    return (a["!ref"] = qr(h)), u.length && (a["!merges"] = u), a;
  }
  function Kf(e, t, r, a) {
    for (var n = e["!merges"] || [], s = [], i = t.s.c; i <= t.e.c; ++i) {
      for (var o, c, l, f, h = 0, u = 0, d = 0; d < n.length; ++d)
        if (!(n[d].s.r > r || n[d].s.c > i || n[d].e.r < r || n[d].e.c < i)) {
          if (n[d].s.r < r || n[d].s.c < i) {
            h = -1;
            break;
          }
          (h = n[d].e.r - n[d].s.r + 1), (u = n[d].e.c - n[d].s.c + 1);
          break;
        }
      h < 0 ||
        ((o = Kr({ r: r, c: i })),
        (l =
          ((c = a.dense ? (e[r] || [])[i] : e[o]) &&
            null != c.v &&
            (c.h || _t(c.w || (ea(c), c.w) || ""))) ||
          ""),
        (f = {}),
        1 < h && (f.rowspan = h),
        1 < u && (f.colspan = u),
        a.editable
          ? (l = '<span contenteditable="true">' + l + "</span>")
          : c &&
            ((f["data-t"] = (c && c.t) || "z"),
            null != c.v && (f["data-v"] = c.v),
            null != c.z && (f["data-z"] = c.z),
            c.l &&
              "#" != (c.l.Target || "#").charAt(0) &&
              (l = '<a href="' + c.l.Target + '">' + l + "</a>")),
        (f.id = (a.id || "sjs") + "-" + o),
        s.push(Yt("td", l, f)));
    }
    return "<tr>" + s.join("") + "</tr>";
  }
  var Jf =
      '<html><head><meta charset="utf-8"/><title>SheetJS Table Export</title></head><body>',
    qf = "</body></html>";
  function Zf(e, t, r) {
    return (
      [].join("") + "<table" + (r && r.id ? ' id="' + r.id + '"' : "") + ">"
    );
  }
  function Qf(e, t) {
    var r = t || {},
      a = null != r.header ? r.header : Jf,
      t = null != r.footer ? r.footer : qf,
      n = [a],
      s = Jr(e["!ref"]);
    (r.dense = Array.isArray(e)), n.push(Zf(0, 0, r));
    for (var i = s.s.r; i <= s.e.r; ++i) n.push(Kf(e, s, i, r));
    return n.push("</table>" + t), n.join("");
  }
  function eh(e, t, r) {
    var a = r || {};
    null != oe && (a.dense = oe);
    var n = 0,
      s = 0;
    null != a.origin &&
      ("number" == typeof a.origin
        ? (n = a.origin)
        : ((n = (r = "string" == typeof a.origin ? Yr(a.origin) : a.origin).r),
          (s = r.c)));
    var i = t.getElementsByTagName("tr"),
      o = Math.min(a.sheetRows || 1e7, i.length),
      c = { s: { r: 0, c: 0 }, e: { r: n, c: s } };
    e["!ref"] &&
      ((t = Jr(e["!ref"])),
      (c.s.r = Math.min(c.s.r, t.s.r)),
      (c.s.c = Math.min(c.s.c, t.s.c)),
      (c.e.r = Math.max(c.e.r, t.e.r)),
      (c.e.c = Math.max(c.e.c, t.e.c)),
      -1 == n && (c.e.r = n = t.e.r + 1));
    var l,
      f,
      h = [],
      u = 0,
      d = e["!rows"] || (e["!rows"] = []),
      p = 0,
      m = 0,
      g = 0,
      b = 0;
    for (e["!cols"] || (e["!cols"] = []); p < i.length && m < o; ++p) {
      var v = i[p];
      if (rh(v)) {
        if (a.display) continue;
        d[m] = { hidden: !0 };
      }
      for (var w = v.children, g = (b = 0); g < w.length; ++g) {
        var T = w[g];
        if (!a.display || !rh(T)) {
          for (
            var E = T.hasAttribute("data-v")
                ? T.getAttribute("data-v")
                : T.hasAttribute("v")
                ? T.getAttribute("v")
                : Wt(T.innerHTML),
              k = T.getAttribute("data-z") || T.getAttribute("z"),
              u = 0;
            u < h.length;
            ++u
          ) {
            var y = h[u];
            y.s.c == b + s &&
              y.s.r < m + n &&
              m + n <= y.e.r &&
              ((b = y.e.c + 1 - s), (u = -1));
          }
          (f = +T.getAttribute("colspan") || 1),
            (1 < (l = +T.getAttribute("rowspan") || 1) || 1 < f) &&
              h.push({
                s: { r: m + n, c: b + s },
                e: { r: m + n + (l || 1) - 1, c: b + s + (f || 1) - 1 },
              });
          var S = { t: "s", v: E },
            _ = T.getAttribute("data-t") || T.getAttribute("t") || "";
          null != E &&
            (0 == E.length
              ? (S.t = _ || "z")
              : a.raw ||
                0 == E.trim().length ||
                "s" == _ ||
                ("TRUE" === E
                  ? (S = { t: "b", v: !0 })
                  : "FALSE" === E
                  ? (S = { t: "b", v: !1 })
                  : isNaN(je(E))
                  ? isNaN(Xe(E).getDate()) ||
                    ((S = { t: "d", v: He(E) }),
                    ((S = !a.cellDates ? { t: "n", v: De(S.v) } : S).z =
                      a.dateNF || me[14]))
                  : (S = { t: "n", v: je(E) }))),
            void 0 === S.z && null != k && (S.z = k);
          var x = "",
            A = T.getElementsByTagName("A");
          if (A && A.length)
            for (
              var C = 0;
              C < A.length &&
              (!A[C].hasAttribute("href") ||
                "#" == (x = A[C].getAttribute("href")).charAt(0));
              ++C
            );
          x && "#" != x.charAt(0) && (S.l = { Target: x }),
            a.dense
              ? (e[m + n] || (e[m + n] = []), (e[m + n][b + s] = S))
              : (e[Kr({ c: b + s, r: m + n })] = S),
            c.e.c < b + s && (c.e.c = b + s),
            (b += f);
        }
      }
      ++m;
    }
    return (
      h.length && (e["!merges"] = (e["!merges"] || []).concat(h)),
      (c.e.r = Math.max(c.e.r, m - 1 + n)),
      (e["!ref"] = qr(c)),
      o <= m && (e["!fullref"] = qr(((c.e.r = i.length - p + m - 1 + n), c))),
      e
    );
  }
  function th(e, t) {
    return eh((t || {}).dense ? [] : {}, e, t);
  }
  function rh(e) {
    var t,
      r = "",
      t =
        (t = e).ownerDocument.defaultView &&
        "function" == typeof t.ownerDocument.defaultView.getComputedStyle
          ? t.ownerDocument.defaultView.getComputedStyle
          : "function" == typeof getComputedStyle
          ? getComputedStyle
          : null;
    return (
      "none" ===
      (r =
        (r = t ? t(e).getPropertyValue("display") : r) ||
        (e.style && e.style.display))
    );
  }
  var ah = {
    day: ["d", "dd"],
    month: ["m", "mm"],
    year: ["y", "yy"],
    hours: ["h", "hh"],
    minutes: ["m", "mm"],
    seconds: ["s", "ss"],
    "am-pm": ["A/P", "AM/PM"],
    "day-of-week": ["ddd", "dddd"],
    era: ["e", "ee"],
    quarter: ["\\Qm", 'm\\"th quarter"'],
  };
  function nh(e, t) {
    var r = t || {};
    null != oe && null == r.dense && (r.dense = oe);
    var a,
      n,
      s,
      i,
      o,
      c = Jt(e),
      l = [],
      f = { name: "" },
      h = "",
      u = 0,
      d = {},
      p = [],
      m = r.dense ? [] : {},
      g = { value: "" },
      b = "",
      v = 0,
      w = [],
      T = -1,
      E = -1,
      k = { s: { r: 1e6, c: 1e7 }, e: { r: 0, c: 0 } },
      y = 0,
      S = {},
      _ = [],
      x = {},
      A = [],
      C = 1,
      R = 1,
      O = [],
      I = { Names: [] },
      N = {},
      F = ["", ""],
      D = [],
      P = {},
      L = "",
      M = 0,
      U = !1,
      B = !1,
      W = 0;
    for (
      qt.lastIndex = 0,
        c = c
          .replace(/<!--([\s\S]*?)-->/gm, "")
          .replace(/<!DOCTYPE[^\[]*\[[^\]]*\]>/gm, "");
      (i = qt.exec(c));

    )
      switch ((i[3] = i[3].replace(/_.*$/, ""))) {
        case "table":
        case "工作表":
          "/" === i[1]
            ? (k.e.c >= k.s.c && k.e.r >= k.s.r
                ? (m["!ref"] = qr(k))
                : (m["!ref"] = "A1:A1"),
              0 < r.sheetRows &&
                r.sheetRows <= k.e.r &&
                ((m["!fullref"] = m["!ref"]),
                (k.e.r = r.sheetRows - 1),
                (m["!ref"] = qr(k))),
              _.length && (m["!merges"] = _),
              A.length && (m["!rows"] = A),
              (s.name = s["名称"] || s.name),
              "undefined" != typeof JSON && JSON.stringify(s),
              p.push(s.name),
              (d[s.name] = m),
              (B = !1))
            : "/" !== i[0].charAt(i[0].length - 2) &&
              ((s = dt(i[0], !1)),
              (T = E = -1),
              (k.s.r = k.s.c = 1e7),
              (k.e.r = k.e.c = 0),
              (m = r.dense ? [] : {}),
              (_ = []),
              (A = []),
              (B = !0));
          break;
        case "table-row-group":
          "/" === i[1] ? --y : ++y;
          break;
        case "table-row":
        case "行":
          if ("/" === i[1]) {
            (T += C), (C = 1);
            break;
          }
          if (
            ((H = dt(i[0], !1))["行号"]
              ? (T = H["行号"] - 1)
              : -1 == T && (T = 0),
            (C = +H["number-rows-repeated"] || 1) < 10)
          )
            for (W = 0; W < C; ++W) 0 < y && (A[T + W] = { level: y });
          E = -1;
          break;
        case "covered-table-cell":
          "/" !== i[1] && ++E,
            r.sheetStubs &&
              (r.dense
                ? (m[T] || (m[T] = []), (m[T][E] = { t: "z" }))
                : (m[Kr({ r: T, c: E })] = { t: "z" })),
            (b = ""),
            (w = []);
          break;
        case "table-cell":
        case "数据":
          if ("/" === i[0].charAt(i[0].length - 2))
            ++E,
              (g = dt(i[0], !1)),
              (R = parseInt(g["number-columns-repeated"] || "1", 10)),
              (o = { t: "z", v: null }),
              g.formula && 0 != r.cellFormula && (o.f = $c(wt(g.formula))),
              "string" == (g["数据类型"] || g["value-type"]) &&
                ((o.t = "s"),
                (o.v = wt(g["string-value"] || "")),
                r.dense
                  ? (m[T] || (m[T] = []), (m[T][E] = o))
                  : (m[Kr({ r: T, c: E })] = o)),
              (E += R - 1);
          else if ("/" !== i[1]) {
            (b = ""), (v = 0), (w = []), (R = 1);
            var H = C ? T + C - 1 : T;
            if (
              (++E > k.e.c && (k.e.c = E),
              E < k.s.c && (k.s.c = E),
              T < k.s.r && (k.s.r = T),
              H > k.e.r && (k.e.r = H),
              (D = []),
              (P = {}),
              (o = {
                t: (g = dt(i[0], !1))["数据类型"] || g["value-type"],
                v: null,
              }),
              r.cellFormula)
            )
              if (
                (g.formula && (g.formula = wt(g.formula)),
                g["number-matrix-columns-spanned"] &&
                  g["number-matrix-rows-spanned"] &&
                  ((x = {
                    s: { r: T, c: E },
                    e: {
                      r:
                        T +
                        (parseInt(g["number-matrix-rows-spanned"], 10) || 0) -
                        1,
                      c:
                        E +
                        (parseInt(g["number-matrix-columns-spanned"], 10) ||
                          0) -
                        1,
                    },
                  }),
                  (o.F = qr(x)),
                  O.push([x, o.F])),
                g.formula)
              )
                o.f = $c(g.formula);
              else
                for (W = 0; W < O.length; ++W)
                  T >= O[W][0].s.r &&
                    T <= O[W][0].e.r &&
                    E >= O[W][0].s.c &&
                    E <= O[W][0].e.c &&
                    (o.F = O[W][1]);
            switch (
              ((g["number-columns-spanned"] || g["number-rows-spanned"]) &&
                ((x = {
                  s: { r: T, c: E },
                  e: {
                    r: T + (parseInt(g["number-rows-spanned"], 10) || 0) - 1,
                    c: E + (parseInt(g["number-columns-spanned"], 10) || 0) - 1,
                  },
                }),
                _.push(x)),
              g["number-columns-repeated"] &&
                (R = parseInt(g["number-columns-repeated"], 10)),
              o.t)
            ) {
              case "boolean":
                (o.t = "b"), (o.v = Rt(g["boolean-value"]));
                break;
              case "float":
              case "percentage":
              case "currency":
                (o.t = "n"), (o.v = parseFloat(g.value));
                break;
              case "date":
                (o.t = "d"),
                  (o.v = He(g["date-value"])),
                  r.cellDates || ((o.t = "n"), (o.v = De(o.v))),
                  (o.z = "m/d/yy");
                break;
              case "time":
                (o.t = "n"),
                  (o.v =
                    (function (e) {
                      var t = 0,
                        r = 0,
                        a = !1,
                        n = e.match(
                          /P([0-9\.]+Y)?([0-9\.]+M)?([0-9\.]+D)?T([0-9\.]+H)?([0-9\.]+M)?([0-9\.]+S)?/,
                        );
                      if (!n)
                        throw new Error(
                          "|" + e + "| is not an ISO8601 Duration",
                        );
                      for (var s = 1; s != n.length; ++s)
                        if (n[s]) {
                          switch (
                            ((r = 1),
                            3 < s && (a = !0),
                            n[s].slice(n[s].length - 1))
                          ) {
                            case "Y":
                              throw new Error(
                                "Unsupported ISO Duration Field: " +
                                  n[s].slice(n[s].length - 1),
                              );
                            case "D":
                              r *= 24;
                            case "H":
                              r *= 60;
                            case "M":
                              if (!a)
                                throw new Error(
                                  "Unsupported ISO Duration Field: M",
                                );
                              r *= 60;
                          }
                          t += r * parseInt(n[s], 10);
                        }
                      return t;
                    })(g["time-value"]) / 86400),
                  r.cellDates && ((o.t = "d"), (o.v = Me(o.v))),
                  (o.z = "HH:MM:SS");
                break;
              case "number":
                (o.t = "n"), (o.v = parseFloat(g["数据数值"]));
                break;
              default:
                if ("string" !== o.t && "text" !== o.t && o.t)
                  throw new Error("Unsupported value type " + o.t);
                (o.t = "s"),
                  null != g["string-value"] &&
                    ((b = wt(g["string-value"])), (w = []));
            }
          } else {
            if (
              ((U = !1),
              "s" === o.t &&
                ((o.v = b || ""), w.length && (o.R = w), (U = 0 == v)),
              N.Target && (o.l = N),
              0 < D.length && ((o.c = D), (D = [])),
              b && !1 !== r.cellText && (o.w = b),
              U && ((o.t = "z"), delete o.v),
              (!U || r.sheetStubs) && !(r.sheetRows && r.sheetRows <= T))
            )
              for (var z = 0; z < C; ++z) {
                if (
                  ((R = parseInt(g["number-columns-repeated"] || "1", 10)),
                  r.dense)
                )
                  for (
                    m[T + z] || (m[T + z] = []),
                      m[T + z][E] = 0 == z ? o : Ve(o);
                    0 < --R;

                  )
                    m[T + z][E + R] = Ve(o);
                else
                  for (m[Kr({ r: T + z, c: E })] = o; 0 < --R; )
                    m[Kr({ r: T + z, c: E + R })] = Ve(o);
                k.e.c <= E && (k.e.c = E);
              }
            (E += (R = parseInt(g["number-columns-repeated"] || "1", 10)) - 1),
              (R = 0),
              (o = {}),
              (b = ""),
              (w = []);
          }
          N = {};
          break;
        case "document":
        case "document-content":
        case "电子表格文档":
        case "spreadsheet":
        case "主体":
        case "scripts":
        case "styles":
        case "font-face-decls":
        case "master-styles":
          if ("/" === i[1]) {
            if ((a = l.pop())[0] !== i[3]) throw "Bad state: " + a;
          } else "/" !== i[0].charAt(i[0].length - 2) && l.push([i[3], !0]);
          break;
        case "annotation":
          if ("/" === i[1]) {
            if ((a = l.pop())[0] !== i[3]) throw "Bad state: " + a;
            (P.t = b), w.length && (P.R = w), (P.a = L), D.push(P);
          } else "/" !== i[0].charAt(i[0].length - 2) && l.push([i[3], !1]);
          (b = L = ""), (v = M = 0), (w = []);
          break;
        case "creator":
          "/" === i[1]
            ? (L = c.slice(M, i.index))
            : (M = i.index + i[0].length);
          break;
        case "meta":
        case "元数据":
        case "settings":
        case "config-item-set":
        case "config-item-map-indexed":
        case "config-item-map-entry":
        case "config-item-map-named":
        case "shapes":
        case "frame":
        case "text-box":
        case "image":
        case "data-pilot-tables":
        case "list-style":
        case "form":
        case "dde-links":
        case "event-listeners":
        case "chart":
          if ("/" === i[1]) {
            if ((a = l.pop())[0] !== i[3]) throw "Bad state: " + a;
          } else "/" !== i[0].charAt(i[0].length - 2) && l.push([i[3], !1]);
          (b = ""), (v = 0), (w = []);
          break;
        case "scientific-number":
        case "currency-symbol":
        case "currency-style":
          break;
        case "number-style":
        case "percentage-style":
        case "date-style":
        case "time-style":
          if ("/" === i[1]) {
            if (((S[f.name] = h), (a = l.pop())[0] !== i[3]))
              throw "Bad state: " + a;
          } else
            "/" !== i[0].charAt(i[0].length - 2) &&
              ((h = ""), (f = dt(i[0], !1)), l.push([i[3], !0]));
          break;
        case "script":
        case "libraries":
        case "automatic-styles":
          break;
        case "default-style":
        case "page-layout":
        case "style":
        case "map":
        case "font-face":
        case "paragraph-properties":
        case "table-properties":
        case "table-column-properties":
        case "table-row-properties":
        case "table-cell-properties":
          break;
        case "number":
          switch (l[l.length - 1][0]) {
            case "time-style":
            case "date-style":
              (n = dt(i[0], !1)), (h += ah[i[3]]["long" === n.style ? 1 : 0]);
          }
          break;
        case "fraction":
          break;
        case "day":
        case "month":
        case "year":
        case "era":
        case "day-of-week":
        case "week-of-year":
        case "quarter":
        case "hours":
        case "minutes":
        case "seconds":
        case "am-pm":
          switch (l[l.length - 1][0]) {
            case "time-style":
            case "date-style":
              (n = dt(i[0], !1)), (h += ah[i[3]]["long" === n.style ? 1 : 0]);
          }
          break;
        case "boolean-style":
        case "boolean":
        case "text-style":
          break;
        case "text":
          if ("/>" === i[0].slice(-2)) break;
          if ("/" === i[1])
            switch (l[l.length - 1][0]) {
              case "number-style":
              case "date-style":
              case "time-style":
                h += c.slice(u, i.index);
            }
          else u = i.index + i[0].length;
          break;
        case "named-range":
          F = Xc((n = dt(i[0], !1))["cell-range-address"]);
          var V = { Name: n.name, Ref: F[0] + "!" + F[1] };
          B && (V.Sheet = p.length), I.Names.push(V);
          break;
        case "text-content":
        case "text-properties":
        case "embedded-text":
          break;
        case "body":
        case "电子表格":
        case "forms":
        case "table-column":
        case "table-header-rows":
        case "table-rows":
        case "table-column-group":
        case "table-header-columns":
        case "table-columns":
        case "null-date":
        case "graphic-properties":
        case "calculation-settings":
        case "named-expressions":
        case "label-range":
        case "label-ranges":
        case "named-expression":
        case "sort":
        case "sort-by":
        case "sort-groups":
        case "tab":
        case "line-break":
        case "span":
          break;
        case "p":
        case "文本串":
          if (-1 < ["master-styles"].indexOf(l[l.length - 1][0])) break;
          "/" !== i[1] || (g && g["string-value"])
            ? (dt(i[0], !1), (v = i.index + i[0].length))
            : ((V = (V = c.slice(v, i.index))
                .replace(/[\t\r\n]/g, " ")
                .trim()
                .replace(/ +/g, " ")
                .replace(/<text:s\/>/g, " ")
                .replace(/<text:s text:c="(\d+)"\/>/g, function (e, t) {
                  return Array(parseInt(t, 10) + 1).join(" ");
                })
                .replace(/<text:tab[^>]*\/>/g, "\t")
                .replace(/<text:line-break\/>/g, "\n")),
              (V = [wt(V.replace(/<[^>]*>/g, ""))]),
              (b = (0 < b.length ? b + "\n" : "") + V[0]));
          break;
        case "s":
          break;
        case "database-range":
          if ("/" === i[1]) break;
          try {
            d[(F = Xc(dt(i[0])["target-range-address"]))[0]]["!autofilter"] = {
              ref: F[1],
            };
          } catch (e) {}
          break;
        case "date":
        case "object":
          break;
        case "title":
        case "标题":
        case "desc":
        case "binary-data":
        case "table-source":
        case "scenario":
        case "iteration":
        case "content-validations":
        case "content-validation":
        case "help-message":
        case "error-message":
        case "database-ranges":
        case "filter":
        case "filter-and":
        case "filter-or":
        case "filter-condition":
        case "list-level-style-bullet":
        case "list-level-style-number":
        case "list-level-properties":
          break;
        case "sender-firstname":
        case "sender-lastname":
        case "sender-initials":
        case "sender-title":
        case "sender-position":
        case "sender-email":
        case "sender-phone-private":
        case "sender-fax":
        case "sender-company":
        case "sender-phone-work":
        case "sender-street":
        case "sender-city":
        case "sender-postal-code":
        case "sender-country":
        case "sender-state-or-province":
        case "author-name":
        case "author-initials":
        case "chapter":
        case "file-name":
        case "template-name":
        case "sheet-name":
        case "event-listener":
          break;
        case "initial-creator":
        case "creation-date":
        case "print-date":
        case "generator":
        case "document-statistic":
        case "user-defined":
        case "editing-duration":
        case "editing-cycles":
        case "config-item":
        case "page-number":
        case "page-count":
        case "time":
        case "cell-range-source":
        case "detective":
        case "operation":
        case "highlighted-range":
          break;
        case "data-pilot-table":
        case "source-cell-range":
        case "source-service":
        case "data-pilot-field":
        case "data-pilot-level":
        case "data-pilot-subtotals":
        case "data-pilot-subtotal":
        case "data-pilot-members":
        case "data-pilot-member":
        case "data-pilot-display-info":
        case "data-pilot-sort-info":
        case "data-pilot-layout-info":
        case "data-pilot-field-reference":
        case "data-pilot-groups":
        case "data-pilot-group":
        case "data-pilot-group-member":
        case "rect":
          break;
        case "dde-connection-decls":
        case "dde-connection-decl":
        case "dde-link":
        case "dde-source":
        case "properties":
        case "property":
          break;
        case "a":
          if ("/" !== i[1]) {
            if (!(N = dt(i[0], !1)).href) break;
            (N.Target = wt(N.href)),
              delete N.href,
              "#" == N.Target.charAt(0) && -1 < N.Target.indexOf(".")
                ? ((F = Xc(N.Target.slice(1))),
                  (N.Target = "#" + F[0] + "!" + F[1]))
                : N.Target.match(/^\.\.[\\\/]/) &&
                  (N.Target = N.Target.slice(3));
          }
          break;
        case "table-protection":
        case "data-pilot-grand-total":
        case "office-document-common-attrs":
          break;
        default:
          switch (i[2]) {
            case "dc:":
            case "calcext:":
            case "loext:":
            case "ooo:":
            case "chartooo:":
            case "draw:":
            case "style:":
            case "chart:":
            case "form:":
            case "uof:":
            case "表:":
            case "字:":
              break;
            default:
              if (r.WTF) throw new Error(i);
          }
      }
    e = { Sheets: d, SheetNames: p, Workbook: I };
    return r.bookSheets && delete e.Sheets, e;
  }
  function sh(e, t) {
    (t = t || {}),
      Ze(e, "META-INF/manifest.xml") &&
        (function (e, t) {
          for (var r, a, n = Jt(e); (r = qt.exec(n)); )
            switch (r[3]) {
              case "manifest":
                break;
              case "file-entry":
                if ("/" == (a = dt(r[0], !1)).path && a.type !== qa)
                  throw new Error("This OpenDocument is not a spreadsheet");
                break;
              case "encryption-data":
              case "algorithm":
              case "start-key-generation":
              case "key-derivation":
                throw new Error("Unsupported ODS Encryption");
              default:
                if (t && t.WTF) throw r;
            }
        })(et(e, "META-INF/manifest.xml"), t);
    var r = tt(e, "content.xml");
    if (!r) throw new Error("Missing content.xml in ODS / UOF file");
    t = nh(Mt(r), t);
    return Ze(e, "meta.xml") && (t.Props = rn(et(e, "meta.xml"))), t;
  }
  function ih(e, t) {
    return nh(e, t);
  }
  var oh = (function () {
      var e = [
          "<office:master-styles>",
          '<style:master-page style:name="mp1" style:page-layout-name="mp1">',
          "<style:header/>",
          '<style:header-left style:display="false"/>',
          "<style:footer/>",
          '<style:footer-left style:display="false"/>',
          "</style:master-page>",
          "</office:master-styles>",
        ].join(""),
        t =
          "<office:document-styles " +
          Xt({
            "xmlns:office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
            "xmlns:table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
            "xmlns:style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
            "xmlns:text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
            "xmlns:draw": "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
            "xmlns:fo":
              "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "xmlns:dc": "http://purl.org/dc/elements/1.1/",
            "xmlns:number":
              "urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
            "xmlns:svg":
              "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
            "xmlns:of": "urn:oasis:names:tc:opendocument:xmlns:of:1.2",
            "office:version": "1.2",
          }) +
          ">" +
          e +
          "</office:document-styles>";
      return function () {
        return ot + t;
      };
    })(),
    ch = (function () {
      function i(e, t, r) {
        var a = [];
        a.push(
          '      <table:table table:name="' +
            kt(t.SheetNames[r]) +
            '" table:style-name="ta1">\n',
        );
        var n = 0,
          s = 0,
          i = Jr(e["!ref"] || "A1"),
          o = e["!merges"] || [],
          c = 0,
          l = Array.isArray(e);
        if (e["!cols"])
          for (s = 0; s <= i.e.c; ++s)
            a.push(
              "        <table:table-column" +
                (e["!cols"][s]
                  ? ' table:style-name="co' + e["!cols"][s].ods + '"'
                  : "") +
                "></table:table-column>\n",
            );
        for (var f = "", h = e["!rows"] || [], n = 0; n < i.s.r; ++n)
          (f = h[n] ? ' table:style-name="ro' + h[n].ods + '"' : ""),
            a.push("        <table:table-row" + f + "></table:table-row>\n");
        for (; n <= i.e.r; ++n) {
          for (
            f = h[n] ? ' table:style-name="ro' + h[n].ods + '"' : "",
              a.push("        <table:table-row" + f + ">\n"),
              s = 0;
            s < i.s.c;
            ++s
          )
            a.push(v);
          for (; s <= i.e.c; ++s) {
            for (var u = !1, d = {}, p = "", c = 0; c != o.length; ++c)
              if (
                !(o[c].s.c > s || o[c].s.r > n || o[c].e.c < s || o[c].e.r < n)
              ) {
                (o[c].s.c == s && o[c].s.r == n) || (u = !0),
                  (d["table:number-columns-spanned"] = o[c].e.c - o[c].s.c + 1),
                  (d["table:number-rows-spanned"] = o[c].e.r - o[c].s.r + 1);
                break;
              }
            if (u) a.push("          <table:covered-table-cell/>\n");
            else {
              var m = Kr({ r: n, c: s }),
                g = l ? (e[n] || [])[s] : e[m];
              if (
                (g &&
                  g.f &&
                  ((d["table:formula"] = kt(
                    (
                      "of:=" +
                      g.f.replace(lc, "$1[.$2$3$4$5]").replace(/\]:\[/g, ":")
                    )
                      .replace(/;/g, "|")
                      .replace(/,/g, ";"),
                  )),
                  g.F &&
                    g.F.slice(0, m.length) == m &&
                    ((b = Jr(g.F)),
                    (d["table:number-matrix-columns-spanned"] =
                      b.e.c - b.s.c + 1),
                    (d["table:number-matrix-rows-spanned"] =
                      b.e.r - b.s.r + 1))),
                g)
              ) {
                switch (g.t) {
                  case "b":
                    (p = g.v ? "TRUE" : "FALSE"),
                      (d["office:value-type"] = "boolean"),
                      (d["office:boolean-value"] = g.v ? "true" : "false");
                    break;
                  case "n":
                    (p = g.w || String(g.v || 0)),
                      (d["office:value-type"] = "float"),
                      (d["office:value"] = g.v || 0);
                    break;
                  case "s":
                  case "str":
                    (p = null == g.v ? "" : g.v),
                      (d["office:value-type"] = "string");
                    break;
                  case "d":
                    (p = g.w || He(g.v).toISOString()),
                      (d["office:value-type"] = "date"),
                      (d["office:date-value"] = He(g.v).toISOString()),
                      (d["table:style-name"] = "ce1");
                    break;
                  default:
                    a.push(v);
                    continue;
                }
                var b,
                  m = kt(p)
                    .replace(/  +/g, function (e) {
                      return '<text:s text:c="' + e.length + '"/>';
                    })
                    .replace(/\t/g, "<text:tab/>")
                    .replace(/\n/g, "</text:p><text:p>")
                    .replace(/^ /, "<text:s/>")
                    .replace(/ $/, "<text:s/>");
                g.l &&
                  g.l.Target &&
                  (m = Yt("text:a", m, {
                    "xlink:href": (b =
                      "#" !=
                        (b =
                          "#" == (b = g.l.Target).charAt(0)
                            ? "#" + b.slice(1).replace(/\./, "!")
                            : b).charAt(0) && !b.match(/^\w+:/)
                        ? "../" + b
                        : b).replace(/&/g, "&amp;"),
                  })),
                  a.push(
                    "          " +
                      Yt("table:table-cell", Yt("text:p", m, {}), d) +
                      "\n",
                  );
              } else a.push(v);
            }
          }
          a.push("        </table:table-row>\n");
        }
        return a.push("      </table:table>\n"), a.join("");
      }
      var v = "          <table:table-cell />\n";
      return function (e, t) {
        var r = [ot],
          a = Xt({
            "xmlns:office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
            "xmlns:table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
            "xmlns:style": "urn:oasis:names:tc:opendocument:xmlns:style:1.0",
            "xmlns:text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
            "xmlns:draw": "urn:oasis:names:tc:opendocument:xmlns:drawing:1.0",
            "xmlns:fo":
              "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "xmlns:dc": "http://purl.org/dc/elements/1.1/",
            "xmlns:meta": "urn:oasis:names:tc:opendocument:xmlns:meta:1.0",
            "xmlns:number":
              "urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0",
            "xmlns:presentation":
              "urn:oasis:names:tc:opendocument:xmlns:presentation:1.0",
            "xmlns:svg":
              "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0",
            "xmlns:chart": "urn:oasis:names:tc:opendocument:xmlns:chart:1.0",
            "xmlns:dr3d": "urn:oasis:names:tc:opendocument:xmlns:dr3d:1.0",
            "xmlns:math": "http://www.w3.org/1998/Math/MathML",
            "xmlns:form": "urn:oasis:names:tc:opendocument:xmlns:form:1.0",
            "xmlns:script": "urn:oasis:names:tc:opendocument:xmlns:script:1.0",
            "xmlns:ooo": "http://openoffice.org/2004/office",
            "xmlns:ooow": "http://openoffice.org/2004/writer",
            "xmlns:oooc": "http://openoffice.org/2004/calc",
            "xmlns:dom": "http://www.w3.org/2001/xml-events",
            "xmlns:xforms": "http://www.w3.org/2002/xforms",
            "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            "xmlns:sheet": "urn:oasis:names:tc:opendocument:sh33tjs:1.0",
            "xmlns:rpt": "http://openoffice.org/2005/report",
            "xmlns:of": "urn:oasis:names:tc:opendocument:xmlns:of:1.2",
            "xmlns:xhtml": "http://www.w3.org/1999/xhtml",
            "xmlns:grddl": "http://www.w3.org/2003/g/data-view#",
            "xmlns:tableooo": "http://openoffice.org/2009/table",
            "xmlns:drawooo": "http://openoffice.org/2010/draw",
            "xmlns:calcext":
              "urn:org:documentfoundation:names:experimental:calc:xmlns:calcext:1.0",
            "xmlns:loext":
              "urn:org:documentfoundation:names:experimental:office:xmlns:loext:1.0",
            "xmlns:field":
              "urn:openoffice:names:experimental:ooo-ms-interop:xmlns:field:1.0",
            "xmlns:formx":
              "urn:openoffice:names:experimental:ooxml-odf-interop:xmlns:form:1.0",
            "xmlns:css3t": "http://www.w3.org/TR/css3-text/",
            "office:version": "1.2",
          }),
          n = Xt({
            "xmlns:config": "urn:oasis:names:tc:opendocument:xmlns:config:1.0",
            "office:mimetype": "application/vnd.oasis.opendocument.spreadsheet",
          });
        "fods" == t.bookType
          ? (r.push("<office:document" + a + n + ">\n"),
            r.push(Qa().replace(/office:document-meta/g, "office:meta")))
          : r.push("<office:document-content" + a + ">\n"),
          (function (a, t) {
            a.push(" <office:automatic-styles>\n"),
              a.push(
                '  <number:date-style style:name="N37" number:automatic-order="true">\n',
              ),
              a.push('   <number:month number:style="long"/>\n'),
              a.push("   <number:text>/</number:text>\n"),
              a.push('   <number:day number:style="long"/>\n'),
              a.push("   <number:text>/</number:text>\n"),
              a.push("   <number:year/>\n"),
              a.push("  </number:date-style>\n");
            var n = 0;
            t.SheetNames.map(function (e) {
              return t.Sheets[e];
            }).forEach(function (e) {
              if (e && e["!cols"])
                for (var t = 0; t < e["!cols"].length; ++t)
                  if (e["!cols"][t]) {
                    var r = e["!cols"][t];
                    if (null == r.width && null == r.wpx && null == r.wch)
                      continue;
                    fo(r), (r.ods = n);
                    r = e["!cols"][t].wpx + "px";
                    a.push(
                      '  <style:style style:name="co' +
                        n +
                        '" style:family="table-column">\n',
                    ),
                      a.push(
                        '   <style:table-column-properties fo:break-before="auto" style:column-width="' +
                          r +
                          '"/>\n',
                      ),
                      a.push("  </style:style>\n"),
                      ++n;
                  }
            });
            var s = 0;
            t.SheetNames.map(function (e) {
              return t.Sheets[e];
            }).forEach(function (e) {
              if (e && e["!rows"])
                for (var t, r = 0; r < e["!rows"].length; ++r)
                  e["!rows"][r] &&
                    ((e["!rows"][r].ods = s),
                    (t = e["!rows"][r].hpx + "px"),
                    a.push(
                      '  <style:style style:name="ro' +
                        s +
                        '" style:family="table-row">\n',
                    ),
                    a.push(
                      '   <style:table-row-properties fo:break-before="auto" style:row-height="' +
                        t +
                        '"/>\n',
                    ),
                    a.push("  </style:style>\n"),
                    ++s);
            }),
              a.push(
                '  <style:style style:name="ta1" style:family="table" style:master-page-name="mp1">\n',
              ),
              a.push(
                '   <style:table-properties table:display="true" style:writing-mode="lr-tb"/>\n',
              ),
              a.push("  </style:style>\n"),
              a.push(
                '  <style:style style:name="ce1" style:family="table-cell" style:parent-style-name="Default" style:data-style-name="N37"/>\n',
              ),
              a.push(" </office:automatic-styles>\n");
          })(r, e),
          r.push("  <office:body>\n"),
          r.push("    <office:spreadsheet>\n");
        for (var s = 0; s != e.SheetNames.length; ++s)
          r.push(i(e.Sheets[e.SheetNames[s]], e, s));
        return (
          r.push("    </office:spreadsheet>\n"),
          r.push("  </office:body>\n"),
          "fods" == t.bookType
            ? r.push("</office:document>")
            : r.push("</office:document-content>"),
          r.join("")
        );
      };
    })();
  function lh(e, t) {
    if ("fods" == t.bookType) return ch(e, t);
    var r = nt(),
      a = [],
      n = [];
    return (
      at(r, "mimetype", "application/vnd.oasis.opendocument.spreadsheet"),
      at(r, "content.xml", ch(e, t)),
      a.push(["content.xml", "text/xml"]),
      n.push(["content.xml", "ContentFile"]),
      at(r, "styles.xml", oh(e, t)),
      a.push(["styles.xml", "text/xml"]),
      n.push(["styles.xml", "StylesFile"]),
      at(r, "meta.xml", ot + Qa()),
      a.push(["meta.xml", "text/xml"]),
      n.push(["meta.xml", "MetadataFile"]),
      at(
        r,
        "manifest.rdf",
        (function (e) {
          var t = [ot];
          t.push(
            '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">\n',
          );
          for (var r = 0; r != e.length; ++r)
            t.push(Za(e[r][0], e[r][1])),
              t.push(
                [
                  '  <rdf:Description rdf:about="">\n',
                  '    <ns0:hasPart xmlns:ns0="http://docs.oasis-open.org/ns/office/1.2/meta/pkg#" rdf:resource="' +
                    e[r][0] +
                    '"/>\n',
                  "  </rdf:Description>\n",
                ].join(""),
              );
          return (
            t.push(Za("", "Document", "pkg")), t.push("</rdf:RDF>"), t.join("")
          );
        })(n),
      ),
      a.push(["manifest.rdf", "application/rdf+xml"]),
      at(
        r,
        "META-INF/manifest.xml",
        (function (e) {
          var t = [ot];
          t.push(
            '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">\n',
          ),
            t.push(
              '  <manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.spreadsheet"/>\n',
            );
          for (var r = 0; r < e.length; ++r)
            t.push(
              '  <manifest:file-entry manifest:full-path="' +
                e[r][0] +
                '" manifest:media-type="' +
                e[r][1] +
                '"/>\n',
            );
          return t.push("</manifest:manifest>"), t.join("");
        })(a),
      ),
      r
    );
  }
  function fh(e) {
    return new DataView(e.buffer, e.byteOffset, e.byteLength);
  }
  function hh(e) {
    return "undefined" != typeof TextDecoder
      ? new TextDecoder().decode(e)
      : Mt(i(e));
  }
  function uh(e) {
    return "undefined" != typeof TextEncoder
      ? new TextEncoder().encode(e)
      : he(Ut(e));
  }
  function dh(e) {
    var t = e.reduce(function (e, t) {
        return e + t.length;
      }, 0),
      r = new Uint8Array(t),
      a = 0;
    return (
      e.forEach(function (e) {
        r.set(e, a), (a += e.length);
      }),
      r
    );
  }
  function ph(e) {
    return (
      (16843009 *
        (((e =
          (858993459 & (e -= (e >> 1) & 1431655765)) + ((e >> 2) & 858993459)) +
          (e >> 4)) &
          252645135)) >>>
      24
    );
  }
  function mh(e, t) {
    var r = t ? t[0] : 0,
      a = 127 & e[r];
    return (
      128 <= e[r++] &&
        ((a |= (127 & e[r]) << 7),
        e[r++] < 128 ||
          ((a |= (127 & e[r]) << 14),
          e[r++] < 128 ||
            ((a |= (127 & e[r]) << 21),
            e[r++] < 128 ||
              ((a += (127 & e[r]) * Math.pow(2, 28)),
              ++r,
              e[r++] < 128 ||
                ((a += (127 & e[r]) * Math.pow(2, 35)),
                ++r,
                e[r++] < 128 ||
                  ((a += (127 & e[r]) * Math.pow(2, 42)), ++r, e[r++])))))),
      t && (t[0] = r),
      a
    );
  }
  function gh(e) {
    var t = new Uint8Array(7);
    t[0] = 127 & e;
    var r = 1;
    return (
      127 < e &&
        ((t[r - 1] |= 128),
        (t[r] = (e >> 7) & 127),
        ++r,
        e <= 16383 ||
          ((t[r - 1] |= 128),
          (t[r] = (e >> 14) & 127),
          ++r,
          e <= 2097151 ||
            ((t[r - 1] |= 128),
            (t[r] = (e >> 21) & 127),
            ++r,
            e <= 268435455 ||
              ((t[r - 1] |= 128),
              (t[r] = ((e / 256) >>> 21) & 127),
              ++r,
              e <= 34359738367 ||
                ((t[r - 1] |= 128),
                (t[r] = ((e / 65536) >>> 21) & 127),
                ++r,
                e <= 4398046511103 ||
                  ((t[r - 1] |= 128),
                  (t[r] = ((e / 16777216) >>> 21) & 127),
                  ++r)))))),
      t.slice(0, r)
    );
  }
  function bh(e) {
    var t = 0,
      r = 127 & e[0];
    return (
      128 <= e[t++] &&
        ((r |= (127 & e[1]) << 7),
        e[t++] < 128 ||
          ((r |= (127 & e[2]) << 14),
          e[t++] < 128 ||
            ((r |= (127 & e[3]) << 21),
            e[+t] < 128 || (r |= (127 & e[4]) << 28)))),
      r
    );
  }
  function vh(e) {
    for (var t = [], r = [0]; r[0] < e.length; ) {
      var a,
        n = r[0],
        s = mh(e, r),
        i = 7 & s,
        o = 0;
      if (0 == (s = Math.floor(s / 8))) break;
      switch (i) {
        case 0:
          for (var c = r[0]; 128 <= e[r[0]++]; );
          a = e.slice(c, r[0]);
          break;
        case 5:
          (o = 4), (a = e.slice(r[0], r[0] + o)), (r[0] += o);
          break;
        case 1:
          (o = 8), (a = e.slice(r[0], r[0] + o)), (r[0] += o);
          break;
        case 2:
          (o = mh(e, r)), (a = e.slice(r[0], r[0] + o)), (r[0] += o);
          break;
        case 3:
        case 4:
        default:
          throw new Error(
            "PB Type "
              .concat(i, " for Field ")
              .concat(s, " at offset ")
              .concat(n),
          );
      }
      var l = { data: a, type: i };
      null == t[s] ? (t[s] = [l]) : t[s].push(l);
    }
    return t;
  }
  function wh(e) {
    var r = [];
    return (
      e.forEach(function (e, t) {
        0 != t &&
          e.forEach(function (e) {
            e.data &&
              (r.push(gh(8 * t + e.type)),
              2 == e.type && r.push(gh(e.data.length)),
              r.push(e.data));
          });
      }),
      dh(r)
    );
  }
  function Th(e, t) {
    return (
      (null == e
        ? void 0
        : e.map(function (e) {
            return t(e.data);
          })) || []
    );
  }
  function Eh(r) {
    for (var e = [], a = [0]; a[0] < r.length; ) {
      var t = mh(r, a),
        n = vh(r.slice(a[0], a[0] + t));
      a[0] += t;
      var s = { id: bh(n[1][0].data), messages: [] };
      n[2].forEach(function (e) {
        var t = vh(e.data),
          e = bh(t[3][0].data);
        s.messages.push({ meta: t, data: r.slice(a[0], a[0] + e) }),
          (a[0] += e);
      }),
        null != (t = n[3]) && t[0] && (s.merge = 0 < bh(n[3][0].data) >>> 0),
        e.push(s);
    }
    return e;
  }
  function kh(e) {
    var a = [];
    return (
      e.forEach(function (e) {
        var t = [[], [{ data: gh(e.id), type: 0 }], []];
        null != e.merge && (t[3] = [{ data: gh(+!!e.merge), type: 0 }]);
        var r = [];
        e.messages.forEach(function (e) {
          r.push(e.data),
            (e.meta[3] = [{ type: 0, data: gh(e.data.length) }]),
            t[2].push({ data: wh(e.meta), type: 2 });
        });
        e = wh(t);
        a.push(gh(e.length)),
          a.push(e),
          r.forEach(function (e) {
            return a.push(e);
          });
      }),
      dh(a)
    );
  }
  function yh(e) {
    for (var t = [], r = 0; r < e.length; ) {
      var a = e[r++],
        n = e[r] | (e[r + 1] << 8) | (e[r + 2] << 16);
      (r += 3),
        t.push(
          (function (e, t) {
            if (0 != e)
              throw new Error("Unexpected Snappy chunk type ".concat(e));
            for (var r = [0], a = mh(t, r), n = []; r[0] < t.length; ) {
              var s = 3 & t[r[0]];
              if (0 != s) {
                var i = 0,
                  o = 0;
                if (
                  (1 == s
                    ? ((o = 4 + ((t[r[0]] >> 2) & 7)),
                      (i = (224 & t[r[0]++]) << 3),
                      (i |= t[r[0]++]))
                    : ((o = 1 + (t[r[0]++] >> 2)),
                      2 == s
                        ? ((i = t[r[0]] | (t[r[0] + 1] << 8)), (r[0] += 2))
                        : ((i =
                            (t[r[0]] |
                              (t[r[0] + 1] << 8) |
                              (t[r[0] + 2] << 16) |
                              (t[r[0] + 3] << 24)) >>>
                            0),
                          (r[0] += 4))),
                  (n = [dh(n)]),
                  0 == i)
                )
                  throw new Error("Invalid offset 0");
                if (i > n[0].length)
                  throw new Error("Invalid offset beyond length");
                if (i <= o)
                  for (
                    n.push(n[0].slice(-i)), o -= i;
                    o >= n[n.length - 1].length;

                  )
                    n.push(n[n.length - 1]), (o -= n[n.length - 1].length);
                n.push(n[0].slice(-i, -i + o));
              } else {
                s = t[r[0]++] >> 2;
                s < 60
                  ? ++s
                  : ((i = s - 59),
                    (s = t[r[0]]),
                    1 < i && (s |= t[r[0] + 1] << 8),
                    2 < i && (s |= t[r[0] + 2] << 16),
                    3 < i && (s |= t[r[0] + 3] << 24),
                    (s >>>= 0),
                    s++,
                    (r[0] += i)),
                  n.push(t.slice(r[0], r[0] + s)),
                  (r[0] += s);
              }
            }
            if ((e = dh(n)).length != a)
              throw new Error(
                "Unexpected length: ".concat(e.length, " != ").concat(a),
              );
            return e;
          })(a, e.slice(r, r + n)),
        ),
        (r += n);
    }
    if (r !== e.length) throw new Error("data is not a valid framed stream!");
    return dh(t);
  }
  function Sh(e) {
    for (var t = [], r = 0; r < e.length; ) {
      var a = Math.min(e.length - r, 268435455),
        n = new Uint8Array(4);
      t.push(n);
      var s = gh(a),
        i = s.length;
      t.push(s),
        a <= 60
          ? (i++, t.push(new Uint8Array([(a - 1) << 2])))
          : a <= 256
          ? ((i += 2), t.push(new Uint8Array([240, (a - 1) & 255])))
          : a <= 65536
          ? ((i += 3),
            t.push(new Uint8Array([244, (a - 1) & 255, ((a - 1) >> 8) & 255])))
          : a <= 16777216
          ? ((i += 4),
            t.push(
              new Uint8Array([
                248,
                (a - 1) & 255,
                ((a - 1) >> 8) & 255,
                ((a - 1) >> 16) & 255,
              ]),
            ))
          : a <= 4294967296 &&
            ((i += 5),
            t.push(
              new Uint8Array([
                252,
                (a - 1) & 255,
                ((a - 1) >> 8) & 255,
                ((a - 1) >> 16) & 255,
                ((a - 1) >>> 24) & 255,
              ]),
            )),
        t.push(e.slice(r, r + a)),
        (i += a),
        (n[0] = 0),
        (n[1] = 255 & i),
        (n[2] = (i >> 8) & 255),
        (n[3] = (i >> 16) & 255),
        (r += a);
    }
    return dh(t);
  }
  function _h(e, t, r) {
    var a,
      n = fh(e),
      s = n.getUint32(8, !0),
      i = 12,
      o = -1,
      c = -1,
      l = NaN,
      f = NaN,
      h = new Date(2001, 0, 1);
    switch (
      (1 & s &&
        ((l = (function (e, t) {
          for (
            var r = ((127 & e[t + 15]) << 7) | (e[t + 14] >> 1),
              a = 1 & e[t + 14],
              n = t + 13;
            t <= n;
            --n
          )
            a = 256 * a + e[n];
          return (128 & e[t + 15] ? -a : a) * Math.pow(10, r - 6176);
        })(e, i)),
        (i += 16)),
      2 & s && ((f = n.getFloat64(i, !0)), (i += 8)),
      4 & s && (h.setTime(h.getTime() + 1e3 * n.getFloat64(i, !0)), (i += 8)),
      8 & s && ((c = n.getUint32(i, !0)), (i += 4)),
      16 & s && ((o = n.getUint32(i, !0)), (i += 4)),
      e[1])
    ) {
      case 0:
        break;
      case 2:
        a = { t: "n", v: l };
        break;
      case 3:
        a = { t: "s", v: t[c] };
        break;
      case 5:
        a = { t: "d", v: h };
        break;
      case 6:
        a = { t: "b", v: 0 < f };
        break;
      case 7:
        a = { t: "n", v: f / 86400 };
        break;
      case 8:
        a = { t: "e", v: 0 };
        break;
      case 9:
        if (!(-1 < o))
          throw new Error(
            "Unsupported cell type "
              .concat(e[1], " : ")
              .concat(31 & s, " : ")
              .concat(e.slice(0, 4)),
          );
        a = { t: "s", v: r[o] };
        break;
      case 10:
        a = { t: "n", v: l };
        break;
      default:
        throw new Error(
          "Unsupported cell type "
            .concat(e[1], " : ")
            .concat(31 & s, " : ")
            .concat(e.slice(0, 4)),
        );
    }
    return a;
  }
  function xh(e, t) {
    var r = new Uint8Array(32),
      a = fh(r),
      n = 12,
      s = 0;
    switch (((r[0] = 5), e.t)) {
      case "n":
        (r[1] = 2),
          (function (e, t, r) {
            var a =
                Math.floor(0 == r ? 0 : Math.LOG10E * Math.log(Math.abs(r))) +
                6176 -
                16,
              n = r / Math.pow(10, a - 6176);
            (e[t + 15] |= a >> 7), (e[t + 14] |= (127 & a) << 1);
            for (var s = 0; 1 <= n; ++s, n /= 256) e[t + s] = 255 & n;
            e[t + 15] |= 0 <= r ? 0 : 128;
          })(r, n, e.v),
          (s |= 1),
          (n += 16);
        break;
      case "b":
        (r[1] = 6), a.setFloat64(n, e.v ? 1 : 0, !0), (s |= 2), (n += 8);
        break;
      case "s":
        if (-1 == t.indexOf(e.v))
          throw new Error("Value ".concat(e.v, " missing from SST!"));
        (r[1] = 3), a.setUint32(n, t.indexOf(e.v), !0), (s |= 8), (n += 4);
        break;
      default:
        throw "unsupported cell type " + e.t;
    }
    return a.setUint32(8, s, !0), r.slice(0, n);
  }
  function Ah(e, t) {
    var r = new Uint8Array(32),
      a = fh(r),
      n = 12,
      s = 0;
    switch (((r[0] = 3), e.t)) {
      case "n":
        (r[2] = 2), a.setFloat64(n, e.v, !0), (s |= 32), (n += 8);
        break;
      case "b":
        (r[2] = 6), a.setFloat64(n, e.v ? 1 : 0, !0), (s |= 32), (n += 8);
        break;
      case "s":
        if (-1 == t.indexOf(e.v))
          throw new Error("Value ".concat(e.v, " missing from SST!"));
        (r[2] = 3), a.setUint32(n, t.indexOf(e.v), !0), (s |= 16), (n += 4);
        break;
      default:
        throw "unsupported cell type " + e.t;
    }
    return a.setUint32(4, s, !0), r.slice(0, n);
  }
  function Ch(e, t, r) {
    switch (e[0]) {
      case 0:
      case 1:
      case 2:
      case 3:
        return (function (e, t, r, a) {
          var n,
            s = fh(e),
            i = s.getUint32(4, !0),
            o = (1 < a ? 12 : 8) + 4 * ph(i & (1 < a ? 3470 : 398)),
            c = -1,
            l = -1,
            f = NaN,
            h = new Date(2001, 0, 1);
          switch (
            (512 & i && ((c = s.getUint32(o, !0)), (o += 4)),
            (o += 4 * ph(i & (1 < a ? 12288 : 4096))),
            16 & i && ((l = s.getUint32(o, !0)), (o += 4)),
            32 & i && ((f = s.getFloat64(o, !0)), (o += 8)),
            64 & i &&
              (h.setTime(h.getTime() + 1e3 * s.getFloat64(o, !0)), (o += 8)),
            e[2])
          ) {
            case 0:
              break;
            case 2:
              n = { t: "n", v: f };
              break;
            case 3:
              n = { t: "s", v: t[l] };
              break;
            case 5:
              n = { t: "d", v: h };
              break;
            case 6:
              n = { t: "b", v: 0 < f };
              break;
            case 7:
              n = { t: "n", v: f / 86400 };
              break;
            case 8:
              n = { t: "e", v: 0 };
              break;
            case 9:
              if (-1 < c) n = { t: "s", v: r[c] };
              else if (-1 < l) n = { t: "s", v: t[l] };
              else {
                if (isNaN(f))
                  throw new Error(
                    "Unsupported cell type ".concat(e.slice(0, 4)),
                  );
                n = { t: "n", v: f };
              }
              break;
            default:
              throw new Error("Unsupported cell type ".concat(e.slice(0, 4)));
          }
          return n;
        })(e, t, r, e[0]);
      case 5:
        return _h(e, t, r);
      default:
        throw new Error("Unsupported payload version ".concat(e[0]));
    }
  }
  function Rh(e) {
    return mh(vh(e)[1][0].data);
  }
  function Oh(s, e) {
    var e = vh(e.data),
      i = bh(e[1][0].data),
      e = e[3],
      o = [];
    return (
      (e || []).forEach(function (e) {
        var t = vh(e.data),
          r = bh(t[1][0].data) >>> 0;
        switch (i) {
          case 1:
            o[r] = hh(t[3][0].data);
            break;
          case 8:
            var a = vh(s[Rh(t[9][0].data)][0].data),
              n = s[Rh(a[1][0].data)][0],
              a = bh(n.meta[1][0].data);
            if (2001 != a)
              throw new Error("2000 unexpected reference to ".concat(a));
            n = vh(n.data);
            o[r] = n[3]
              .map(function (e) {
                return hh(e.data);
              })
              .join("");
        }
      }),
      o
    );
  }
  function Ih(e, t) {
    var r = vh(t.data),
      a =
        null != (t = null == r ? void 0 : r[7]) && t[0]
          ? 0 < bh(r[7][0].data) >>> 0
            ? 1
            : 0
          : -1,
      t = Th(r[5], function (e) {
        return (function (e, t) {
          var r,
            a,
            n,
            s = vh(e),
            i = bh(s[1][0].data) >>> 0,
            o = bh(s[2][0].data) >>> 0,
            c =
              ((null == (e = null == (c = s[8]) ? void 0 : c[0])
                ? void 0
                : e.data) &&
                0 < bh(s[8][0].data)) ||
              !1;
          if (
            null != (e = null == (e = s[7]) ? void 0 : e[0]) &&
            e.data &&
            0 != t
          )
            (a =
              null == (r = null == (r = s[7]) ? void 0 : r[0])
                ? void 0
                : r.data),
              (n =
                null == (r = null == (r = s[6]) ? void 0 : r[0])
                  ? void 0
                  : r.data);
          else {
            if (
              null == (r = null == (r = s[4]) ? void 0 : r[0]) ||
              !r.data ||
              1 == t
            )
              throw "NUMBERS Tile missing ".concat(t, " cell storage");
            (a =
              null == (t = null == (t = s[4]) ? void 0 : t[0])
                ? void 0
                : t.data),
              (n =
                null == (s = null == (s = s[3]) ? void 0 : s[0])
                  ? void 0
                  : s.data);
          }
          for (
            var l = c ? 4 : 1, f = fh(a), h = [], u = 0;
            u < a.length / 2;
            ++u
          ) {
            var d = f.getUint16(2 * u, !0);
            d < 65535 && h.push([u, d]);
          }
          if (h.length != o)
            throw "Expected ".concat(o, " cells, found ").concat(h.length);
          for (var p = [], u = 0; u < h.length - 1; ++u)
            p[h[u][0]] = n.subarray(h[u][1] * l, h[u + 1][1] * l);
          return (
            1 <= h.length &&
              (p[h[h.length - 1][0]] = n.subarray(h[h.length - 1][1] * l)),
            { R: i, cells: p }
          );
        })(e, a);
      });
    return {
      nrows: bh(r[4][0].data) >>> 0,
      data: t.reduce(function (r, a) {
        return (
          r[a.R] || (r[a.R] = []),
          a.cells.forEach(function (e, t) {
            if (r[a.R][t])
              throw new Error("Duplicate cell r=".concat(a.R, " c=").concat(t));
            r[a.R][t] = e;
          }),
          r
        );
      }, []),
    };
  }
  function Nh(e, t) {
    var r = { "!ref": "A1" },
      a = e[Rh(vh(t.data)[2][0].data)],
      t = bh(a[0].meta[1][0].data);
    if (6001 != t) throw new Error("6000 unexpected reference to ".concat(t));
    return (
      (function (r, e, a) {
        var t = vh(e.data);
        if (
          (((e = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } }).e.r =
            (bh(t[6][0].data) >>> 0) - 1),
          e.e.r < 0)
        )
          throw new Error("Invalid row varint ".concat(t[6][0].data));
        if (((e.e.c = (bh(t[7][0].data) >>> 0) - 1), e.e.c < 0))
          throw new Error("Invalid col varint ".concat(t[7][0].data));
        a["!ref"] = qr(e);
        var e = vh(t[4][0].data),
          n = Oh(r, r[Rh(e[4][0].data)][0]),
          s = null != (t = e[17]) && t[0] ? Oh(r, r[Rh(e[17][0].data)][0]) : [],
          t = vh(e[3][0].data),
          i = 0;
        if (
          (t[1].forEach(function (e) {
            var t = vh(e.data),
              e = r[Rh(t[2][0].data)][0],
              t = bh(e.meta[1][0].data);
            if (6002 != t)
              throw new Error("6001 unexpected reference to ".concat(t));
            e = Ih(0, e);
            e.data.forEach(function (e, r) {
              e.forEach(function (e, t) {
                (t = Kr({ r: i + r, c: t })), (e = Ch(e, n, s));
                e && (a[t] = e);
              });
            }),
              (i += e.nrows);
          }),
          null != (t = e[13]) && t[0])
        ) {
          (t = r[Rh(e[13][0].data)][0]), (e = bh(t.meta[1][0].data));
          if (6144 != e)
            throw new Error("Expected merge type 6144, found ".concat(e));
          a["!merges"] =
            null == (t = vh(t.data))
              ? void 0
              : t[1].map(function (e) {
                  var t = vh(e.data),
                    e = fh(vh(t[1][0].data)[1][0].data),
                    t = fh(vh(t[2][0].data)[1][0].data);
                  return {
                    s: { r: e.getUint16(0, !0), c: e.getUint16(2, !0) },
                    e: {
                      r: e.getUint16(0, !0) + t.getUint16(0, !0) - 1,
                      c: e.getUint16(2, !0) + t.getUint16(2, !0) - 1,
                    },
                  };
                });
        }
      })(e, a[0], r),
      r
    );
  }
  function Fh(s, e) {
    var i = du(),
      t = vh(e.data);
    if (null != (e = t[2]) && e[0])
      throw new Error("Keynote presentations are not supported");
    if (
      (Th(t[1], Rh).forEach(function (e) {
        s[e].forEach(function (e) {
          var r, t, a, n;
          2 == bh(e.meta[1][0].data) &&
            ((t = s),
            (e = vh((a = e).data)),
            (n = {
              name: null != (a = e[1]) && a[0] ? hh(e[1][0].data) : "",
              sheets: [],
            }),
            Th(e[2], Rh).forEach(function (e) {
              t[e].forEach(function (e) {
                6e3 == bh(e.meta[1][0].data) && n.sheets.push(Nh(t, e));
              });
            }),
            (r = n).sheets.forEach(function (e, t) {
              pu(i, e, 0 == t ? r.name : r.name + "_" + t, !0);
            }));
        });
      }),
      0 == i.SheetNames.length)
    )
      throw new Error("Empty NUMBERS file");
    return i;
  }
  function Dh(e) {
    var a = {},
      n = [];
    if (
      (e.FullPaths.forEach(function (e) {
        if (e.match(/\.iwpv2/))
          throw new Error("Unsupported password protection");
      }),
      e.FileIndex.forEach(function (t) {
        if (t.name.match(/\.iwa$/)) {
          var e, r;
          try {
            e = yh(t.content);
          } catch (e) {
            return console.log(
              "?? " + t.content.length + " " + (e.message || e),
            );
          }
          try {
            r = Eh(e);
          } catch (e) {
            return console.log("## " + (e.message || e));
          }
          r.forEach(function (e) {
            (a[e.id] = e.messages), n.push(e.id);
          });
        }
      }),
      !n.length)
    )
      throw new Error("File has no messages");
    if (
      null !=
        (e =
          null ==
          (e =
            null ==
            (e = null == (e = null == a ? void 0 : a[1]) ? void 0 : e[0])
              ? void 0
              : e.meta)
            ? void 0
            : e[1]) &&
      e[0].data &&
      1e4 == bh(a[1][0].meta[1][0].data)
    )
      throw new Error("Pages documents are not supported");
    var t =
      (null ==
      (e =
        null ==
        (e =
          null == (e = null == (e = null == a ? void 0 : a[1]) ? void 0 : e[0])
            ? void 0
            : e.meta)
          ? void 0
          : e[1])
        ? void 0
        : e[0].data) &&
      1 == bh(a[1][0].meta[1][0].data) &&
      a[1][0];
    if (
      (t ||
        n.forEach(function (e) {
          a[e].forEach(function (e) {
            if (1 == bh(e.meta[1][0].data) >>> 0) {
              if (t) throw new Error("Document has multiple roots");
              t = e;
            }
          });
        }),
      !t)
    )
      throw new Error("Cannot find Document root");
    return Fh(a, t);
  }
  function Ph(e, t) {
    if (!t || !t.numbers)
      throw new Error("Must pass a `numbers` option -- check the README");
    var r = e.Sheets[e.SheetNames[0]];
    1 < e.SheetNames.length &&
      console.error("The Numbers writer currently writes only the first table");
    var f = Jr(r["!ref"]);
    f.s.r = f.s.c = 0;
    var a = !1;
    9 < f.e.c && ((a = !0), (f.e.c = 9)),
      49 < f.e.r && ((a = !0), (f.e.r = 49)),
      a &&
        console.error(
          "The Numbers writer is currently limited to ".concat(qr(f)),
        );
    var h = iu(r, { range: f, header: 1 }),
      u = ["~Sh33tJ5~"];
    h.forEach(function (e) {
      return e.forEach(function (e) {
        "string" == typeof e && u.push(e);
      });
    });
    var d = {},
      n = [],
      p = xe.read(t.numbers, { type: "base64" });
    p.FileIndex.map(function (e, t) {
      return [e, p.FullPaths[t]];
    }).forEach(function (e) {
      var t = e[0],
        r = e[1];
      2 == t.type &&
        t.name.match(/\.iwa/) &&
        Eh(yh(t.content)).forEach(function (e) {
          n.push(e.id),
            (d[e.id] = {
              deps: [],
              location: r,
              type: bh(e.messages[0].meta[1][0].data),
            });
        });
    }),
      n.sort(function (e, t) {
        return e - t;
      });
    var s = n
      .filter(function (e) {
        return 1 < e;
      })
      .map(function (e) {
        return [e, gh(e)];
      });
    p.FileIndex.map(function (e, t) {
      return [e, p.FullPaths[t]];
    }).forEach(function (e) {
      var t = e[0];
      e[1];
      t.name.match(/\.iwa/) &&
        Eh(yh(t.content)).forEach(function (r) {
          r.messages.forEach(function (e) {
            s.forEach(function (t) {
              r.messages.some(function (e) {
                return (
                  11006 != bh(e.meta[1][0].data) &&
                  (function (e, t) {
                    e: for (var r = 0; r <= e.length - t.length; ++r) {
                      for (var a = 0; a < t.length; ++a)
                        if (e[r + a] != t[a]) continue e;
                      return !0;
                    }
                    return !1;
                  })(e.data, t[1])
                );
              }) && d[t[0]].deps.push(r.id);
            });
          });
        });
    });
    for (
      var i, o = xe.find(p, d[1].location), c = Eh(yh(o.content)), l = 0;
      l < c.length;
      ++l
    ) {
      var m = c[l];
      1 == m.id && (i = m);
    }
    for (
      var g = Rh(vh(i.messages[0].data)[1][0].data),
        c = Eh(yh((o = xe.find(p, d[g].location)).content)),
        l = 0;
      l < c.length;
      ++l
    )
      (m = c[l]).id == g && (i = m);
    var b = vh(i.messages[0].data);
    for (
      b[1] = [{ type: 2, data: uh(e.SheetNames[0]) }],
        i.messages[0].data = wh(b),
        o.content = Sh(kh(c)),
        o.size = o.content.length,
        g = Rh(b[2][0].data),
        c = Eh(yh((o = xe.find(p, d[g].location)).content)),
        l = 0;
      l < c.length;
      ++l
    )
      (m = c[l]).id == g && (i = m);
    for (
      g = Rh(vh(i.messages[0].data)[2][0].data),
        c = Eh(yh((o = xe.find(p, d[g].location)).content)),
        l = 0;
      l < c.length;
      ++l
    )
      (m = c[l]).id == g && (i = m);
    a = vh(i.messages[0].data);
    (a[6][0].data = gh(f.e.r + 1)), (a[7][0].data = gh(f.e.c + 1));
    for (
      var v = Rh(a[46][0].data),
        t = xe.find(p, d[v].location),
        w = Eh(yh(t.content)),
        T = 0;
      T < w.length && w[T].id != v;
      ++T
    );
    if (w[T].id != v) throw "Bad ColumnRowUIDMapArchive";
    var E = vh(w[T].messages[0].data);
    (E[1] = []), (E[2] = []), (E[3] = []);
    for (var k = 0; k <= f.e.c; ++k)
      E[1].push({
        type: 2,
        data: wh([
          [],
          [{ type: 0, data: gh(k + 420690) }],
          [{ type: 0, data: gh(k + 420690) }],
        ]),
      }),
        E[2].push({ type: 0, data: gh(k) }),
        E[3].push({ type: 0, data: gh(k) });
    (E[4] = []), (E[5] = []), (E[6] = []);
    for (var y = 0; y <= f.e.r; ++y)
      E[4].push({
        type: 2,
        data: wh([
          [],
          [{ type: 0, data: gh(y + 726270) }],
          [{ type: 0, data: gh(y + 726270) }],
        ]),
      }),
        E[5].push({ type: 0, data: gh(y) }),
        E[6].push({ type: 0, data: gh(y) });
    (w[T].messages[0].data = wh(E)),
      (t.content = Sh(kh(w))),
      (t.size = t.content.length),
      delete a[46];
    e = vh(a[4][0].data);
    e[7][0].data = gh(f.e.r + 1);
    b = Rh(vh(e[1][0].data)[2][0].data);
    if ((w = Eh(yh((t = xe.find(p, d[b].location)).content)))[0].id != b)
      throw "Bad HeaderStorageBucket";
    for (var S = vh(w[0].messages[0].data), y = 0; y < h.length; ++y) {
      var _ = vh(S[2][0].data);
      (_[1][0].data = gh(y)),
        (_[4][0].data = gh(h[y].length)),
        (S[2][y] = { type: S[2][0].type, data: wh(_) });
    }
    (w[0].messages[0].data = wh(S)),
      (t.content = Sh(kh(w))),
      (t.size = t.content.length);
    var x,
      b = Rh(e[2][0].data);
    if ((w = Eh(yh((t = xe.find(p, d[b].location)).content)))[0].id != b)
      throw "Bad HeaderStorageBucket";
    for (S = vh(w[0].messages[0].data), k = 0; k <= f.e.c; ++k)
      ((_ = vh(S[2][0].data))[1][0].data = gh(k)),
        (_[4][0].data = gh(f.e.r + 1)),
        (S[2][k] = { type: S[2][0].type, data: wh(_) });
    (w[0].messages[0].data = wh(S)),
      (t.content = Sh(kh(w))),
      (t.size = t.content.length),
      r["!merges"] &&
        ((O = (function (e) {
          for (var t = 927262; t < 2e6; ++t) if (!d[t]) return (d[t] = e), t;
          throw new Error("Too many messages");
        })({ type: 6144, deps: [g], location: d[g].location })),
        (x = [[], []]),
        r["!merges"].forEach(function (e) {
          x[1].push({
            type: 2,
            data: wh([
              [],
              [
                {
                  type: 2,
                  data: wh([
                    [],
                    [
                      {
                        type: 5,
                        data: new Uint8Array(
                          new Uint16Array([e.s.r, e.s.c]).buffer,
                        ),
                      },
                    ],
                  ]),
                },
              ],
              [
                {
                  type: 2,
                  data: wh([
                    [],
                    [
                      {
                        type: 5,
                        data: new Uint8Array(
                          new Uint16Array([
                            e.e.r - e.s.r + 1,
                            e.e.c - e.s.c + 1,
                          ]).buffer,
                        ),
                      },
                    ],
                  ]),
                },
              ],
            ]),
          });
        }),
        (e[13] = [{ type: 2, data: wh([[], [{ type: 0, data: gh(O) }]]) }]),
        c.push({
          id: O,
          messages: [
            ((R = 6144),
            (O = wh(x)),
            { meta: [[], [{ type: 0, data: gh(R) }]], data: O }),
          ],
        }));
    var A = Rh(e[4][0].data);
    !(function () {
      for (
        var e, t = xe.find(p, d[A].location), r = Eh(yh(t.content)), a = 0;
        a < r.length;
        ++a
      ) {
        var n = r[a];
        n.id == A && (e = n);
      }
      var s = vh(e.messages[0].data);
      (s[3] = []),
        u.forEach(function (e, t) {
          s[3].push({
            type: 2,
            data: wh([
              [],
              [{ type: 0, data: gh(t) }],
              [{ type: 0, data: gh(1) }],
              [{ type: 2, data: uh(e) }],
            ]),
          });
        }),
        (e.messages[0].data = wh(s)),
        (t.content = Sh(kh(r))),
        (t.size = t.content.length);
    })();
    var C = vh(e[3][0].data),
      R = C[1][0];
    delete C[2];
    var R,
      O,
      O = vh(R.data),
      I = Rh(O[2][0].data);
    return (
      (function () {
        for (
          var e, t = xe.find(p, d[I].location), r = Eh(yh(t.content)), a = 0;
          a < r.length;
          ++a
        ) {
          var n = r[a];
          n.id == I && (e = n);
        }
        var s = vh(e.messages[0].data);
        delete s[6], delete C[7];
        var i = new Uint8Array(s[5][0].data);
        s[5] = [];
        for (var o = 0, c = 0; c <= f.e.r; ++c) {
          var l = vh(i);
          (o += (function (e, t, r) {
            var a, n;
            if (null == (a = e[6]) || !a[0] || null == (n = e[7]) || !n[0])
              throw "Mutation only works on post-BNC storages!";
            if (
              ((null == (n = null == (n = e[8]) ? void 0 : n[0])
                ? void 0
                : n.data) &&
                0 < bh(e[8][0].data)) ||
              !1
            )
              throw "Math only works with normal offsets";
            for (
              var s,
                i,
                o = 0,
                c = fh(e[7][0].data),
                l = 0,
                f = [],
                h = fh(e[4][0].data),
                u = 0,
                d = [],
                p = 0;
              p < t.length;
              ++p
            )
              if (null != t[p]) {
                switch (
                  (c.setUint16(2 * p, l, !0),
                  h.setUint16(2 * p, u, !0),
                  typeof t[p])
                ) {
                  case "string":
                    (s = xh({ t: "s", v: t[p] }, r)),
                      (i = Ah({ t: "s", v: t[p] }, r));
                    break;
                  case "number":
                    (s = xh({ t: "n", v: t[p] }, r)),
                      (i = Ah({ t: "n", v: t[p] }, r));
                    break;
                  case "boolean":
                    (s = xh({ t: "b", v: t[p] }, r)),
                      (i = Ah({ t: "b", v: t[p] }, r));
                    break;
                  default:
                    throw new Error("Unsupported value " + t[p]);
                }
                f.push(s), (l += s.length), d.push(i), (u += i.length), ++o;
              } else c.setUint16(2 * p, 65535, !0), h.setUint16(2 * p, 65535);
            for (e[2][0].data = gh(o); p < e[7][0].data.length / 2; ++p)
              c.setUint16(2 * p, 65535, !0), h.setUint16(2 * p, 65535, !0);
            return (e[6][0].data = dh(f)), (e[3][0].data = dh(d)), o;
          })(l, h[c], u)),
            (l[1][0].data = gh(c)),
            s[5].push({ data: wh(l), type: 2 });
        }
        (s[1] = [{ type: 0, data: gh(f.e.c + 1) }]),
          (s[2] = [{ type: 0, data: gh(f.e.r + 1) }]),
          (s[3] = [{ type: 0, data: gh(o) }]),
          (s[4] = [{ type: 0, data: gh(f.e.r + 1) }]),
          (e.messages[0].data = wh(s)),
          (t.content = Sh(kh(r))),
          (t.size = t.content.length);
      })(),
      (R.data = wh(O)),
      (e[3][0].data = wh(C)),
      (a[4][0].data = wh(e)),
      (i.messages[0].data = wh(a)),
      (o.content = Sh(kh(c))),
      (o.size = o.content.length),
      p
    );
  }
  function Lh(a) {
    return function (e) {
      for (var t = 0; t != a.length; ++t) {
        var r = a[t];
        void 0 === e[r[0]] && (e[r[0]] = r[1]),
          "n" === r[2] && (e[r[0]] = Number(e[r[0]]));
      }
    };
  }
  function Mh(e) {
    Lh([
      ["cellNF", !1],
      ["cellHTML", !0],
      ["cellFormula", !0],
      ["cellStyles", !1],
      ["cellText", !0],
      ["cellDates", !1],
      ["sheetStubs", !1],
      ["sheetRows", 0, "n"],
      ["bookDeps", !1],
      ["bookSheets", !1],
      ["bookProps", !1],
      ["bookFiles", !1],
      ["bookVBA", !1],
      ["password", ""],
      ["WTF", !1],
    ])(e);
  }
  function Uh(e) {
    Lh([
      ["cellDates", !1],
      ["bookSST", !1],
      ["bookType", "xlsx"],
      ["compression", !1],
      ["WTF", !1],
    ])(e);
  }
  function Bh(t, e) {
    if (!t) return 0;
    try {
      t = e.map(function (e) {
        return (
          e.id || (e.id = e.strRelID),
          [
            e.name,
            t["!id"][e.id].Target,
            ((e = t["!id"][e.id].Type),
            -1 < $a.WS.indexOf(e)
              ? "sheet"
              : $a.CS && e == $a.CS
              ? "chart"
              : $a.DS && e == $a.DS
              ? "dialog"
              : $a.MS && e == $a.MS
              ? "macro"
              : e && e.length
              ? e
              : "sheet"),
          ]
        );
      });
    } catch (e) {
      return null;
    }
    return t && 0 !== t.length ? t : null;
  }
  function Wh(l, f, e, h, t, u, r, a, d, n, s, i) {
    try {
      u[h] = Ya(tt(l, e, !0), f);
      var o = et(l, f);
      switch (a) {
        case "sheet":
          g = nf(o, f, t, d, u[h], n, s, i);
          break;
        case "chart":
          if (!(g = sf(o, f, t, d, u[h], n)) || !g["!drawel"]) break;
          var c = it(g["!drawel"].Target, f),
            p = Xa(c),
            m = it(
              ((m = tt(l, c, !0)),
              (p = Ya(tt(l, p, !0), c)),
              m
                ? ((m = (m.match(/<c:chart [^>]*r:id="([^"]*)"/) || [
                    "",
                    "",
                  ])[1]),
                  p["!id"][m].Target)
                : "??"),
              c,
            ),
            c = Xa(m),
            g = Wl(tt(l, m, !0), 0, 0, Ya(tt(l, c, !0), m), 0, g);
          break;
        case "macro":
          (v = f), u[h], v.slice(-4), (g = { "!type": "macro" });
          break;
        case "dialog":
          (v = f), u[h], v.slice(-4), (g = { "!type": "dialog" });
          break;
        default:
          throw new Error("Unrecognized sheet type " + a);
      }
      r[h] = g;
      var b = [];
      u &&
        u[h] &&
        Re(u[h]).forEach(function (e) {
          var a,
            n,
            s,
            i,
            o,
            c,
            t = "";
          if (u[h][e].Type == $a.CMNT) {
            t = it(u[h][e].Target, f);
            var r = lf(et(l, t, !0), t, d);
            if (!r || !r.length) return;
            ec(g, r, !1);
          }
          u[h][e].Type == $a.TCMNT &&
            ((t = it(u[h][e].Target, f)),
            (b = b.concat(
              ((a = et(l, t, !0)),
              (n = d),
              (i = !(s = [])),
              (o = {}),
              (c = 0),
              a.replace(ft, function (e, t) {
                var r = dt(e);
                switch (pt(r[0])) {
                  case "<?xml":
                  case "<ThreadedComments":
                  case "</ThreadedComments>":
                    break;
                  case "<threadedComment":
                    o = { author: r.personId, guid: r.id, ref: r.ref, T: 1 };
                    break;
                  case "</threadedComment>":
                    null != o.t && s.push(o);
                    break;
                  case "<text>":
                  case "<text":
                    c = t + e.length;
                    break;
                  case "</text>":
                    o.t = a
                      .slice(c, t)
                      .replace(/\r\n/g, "\n")
                      .replace(/\r/g, "\n");
                    break;
                  case "<mentions":
                  case "<mentions>":
                    i = !0;
                    break;
                  case "</mentions>":
                    i = !1;
                    break;
                  case "<extLst":
                  case "<extLst>":
                  case "</extLst>":
                  case "<extLst/>":
                    break;
                  case "<ext":
                    i = !0;
                    break;
                  case "</ext>":
                    i = !1;
                    break;
                  default:
                    if (!i && n.WTF)
                      throw new Error(
                        "unrecognized " + r[0] + " in threaded comments",
                      );
                }
                return e;
              }),
              s),
            )));
        }),
        b && b.length && ec(g, b, !0, d.people || []);
    } catch (e) {
      if (d.WTF) throw e;
    }
    var v, m;
  }
  function Hh(e) {
    return "/" == e.charAt(0) ? e.slice(1) : e;
  }
  function zh(r, t) {
    if ((Ee(), Mh((t = t || {})), Ze(r, "META-INF/manifest.xml")))
      return sh(r, t);
    if (Ze(r, "objectdata.xml")) return sh(r, t);
    if (Ze(r, "Index/Document.iwa")) {
      if ("undefined" == typeof Uint8Array)
        throw new Error("NUMBERS file parsing requires Uint8Array support");
      if ((0, r.FileIndex)) return Dh(r);
      var a = xe.utils.cfb_new();
      return (
        rt(r).forEach(function (e) {
          at(
            a,
            e,
            (function e(t, r, a) {
              if (!a) return qe(Qe(t, r));
              if (!r) return null;
              try {
                return e(t, r);
              } catch (e) {
                return null;
              }
            })(r, e),
          );
        }),
        Dh(a)
      );
    }
    if (!Ze(r, "[Content_Types].xml")) {
      if (Ze(r, "index.xml.gz")) throw new Error("Unsupported NUMBERS 08 file");
      if (Ze(r, "index.xml")) throw new Error("Unsupported NUMBERS 09 file");
      throw new Error("Unsupported ZIP file");
    }
    var e,
      n,
      s = rt(r),
      i = (function (e) {
        var r = Ga();
        if (!e || !e.match) return r;
        var a = {};
        if (
          ((e.match(ft) || []).forEach(function (e) {
            var t = dt(e);
            switch (t[0].replace(ht, "<")) {
              case "<?xml":
                break;
              case "<Types":
                r.xmlns = t["xmlns" + (t[0].match(/<(\w+):/) || ["", ""])[1]];
                break;
              case "<Default":
                a[t.Extension] = t.ContentType;
                break;
              case "<Override":
                void 0 !== r[za[t.ContentType]] &&
                  r[za[t.ContentType]].push(t.PartName);
            }
          }),
          r.xmlns !== Zt.CT)
        )
          throw new Error("Unknown Namespace: " + r.xmlns);
        return (
          (r.calcchain = 0 < r.calcchains.length ? r.calcchains[0] : ""),
          (r.sst = 0 < r.strs.length ? r.strs[0] : ""),
          (r.style = 0 < r.styles.length ? r.styles[0] : ""),
          (r.defaults = a),
          delete r.calcchains,
          r
        );
      })(tt(r, "[Content_Types].xml")),
      o = !1;
    if (
      (0 === i.workbooks.length &&
        et(r, (n = "xl/workbook.xml"), !0) &&
        i.workbooks.push(n),
      0 === i.workbooks.length)
    ) {
      if (!et(r, (n = "xl/workbook.bin"), !0))
        throw new Error("Could not find workbook");
      i.workbooks.push(n), (o = !0);
    }
    "bin" == i.workbooks[0].slice(-3) && (o = !0);
    var c = {},
      l = {};
    if (!t.bookSheets && !t.bookProps) {
      if (((Yc = []), i.sst))
        try {
          Yc = cf(et(r, Hh(i.sst)), i.sst, t);
        } catch (e) {
          if (t.WTF) throw e;
        }
      t.cellStyles &&
        i.themes.length &&
        ((m = tt(r, i.themes[0].replace(/^\//, ""), !0) || ""),
        i.themes[0],
        (c = $o(m, t))),
        i.style && (l = of(et(r, Hh(i.style)), i.style, c, t));
    }
    i.links.map(function (e) {
      try {
        Ya(tt(r, Xa(Hh(e))), e);
        return hf(et(r, Hh(e)), 0, e, t);
      } catch (e) {}
    });
    var f,
      h,
      u,
      d = af(et(r, Hh(i.workbooks[0])), i.workbooks[0], t),
      p = {},
      m = "";
    i.coreprops.length &&
      ((m = et(r, Hh(i.coreprops[0]), !0)) && (p = rn(m)),
      0 !== i.extprops.length &&
        (m = et(r, Hh(i.extprops[0]), !0)) &&
        ((g = t),
        (u = {}),
        (h = (h = p) || {}),
        (f = Mt((f = m))),
        sn.forEach(function (e) {
          var t = (f.match(Bt(e[0])) || [])[1];
          switch (e[2]) {
            case "string":
              t && (h[e[1]] = wt(t));
              break;
            case "bool":
              h[e[1]] = "true" === t;
              break;
            case "raw":
              var r = f.match(
                new RegExp("<" + e[0] + "[^>]*>([\\s\\S]*?)</" + e[0] + ">"),
              );
              r && 0 < r.length && (u[e[1]] = r[1]);
          }
        }),
        u.HeadingPairs &&
          u.TitlesOfParts &&
          cn(u.HeadingPairs, u.TitlesOfParts, h, g)));
    var g = {};
    (t.bookSheets && !t.bookProps) ||
      (0 !== i.custprops.length &&
        (m = tt(r, Hh(i.custprops[0]), !0)) &&
        (g = (function (e, t) {
          var r = {},
            a = "",
            n = e.match(fn);
          if (n)
            for (var s = 0; s != n.length; ++s) {
              var i = n[s],
                o = dt(i);
              switch (o[0]) {
                case "<?xml":
                case "<Properties":
                  break;
                case "<property":
                  a = wt(o.name);
                  break;
                case "</property>":
                  a = null;
                  break;
                default:
                  if (0 === i.indexOf("<vt:")) {
                    var c = i.split(">"),
                      l = c[0].slice(4),
                      f = c[1];
                    switch (l) {
                      case "lpstr":
                      case "bstr":
                      case "lpwstr":
                        r[a] = wt(f);
                        break;
                      case "bool":
                        r[a] = Rt(f);
                        break;
                      case "i1":
                      case "i2":
                      case "i4":
                      case "i8":
                      case "int":
                      case "uint":
                        r[a] = parseInt(f, 10);
                        break;
                      case "r4":
                      case "r8":
                      case "decimal":
                        r[a] = parseFloat(f);
                        break;
                      case "filetime":
                      case "date":
                        r[a] = He(f);
                        break;
                      case "cy":
                      case "error":
                        r[a] = wt(f);
                        break;
                      default:
                        if ("/" == l.slice(-1)) break;
                        t.WTF &&
                          "undefined" != typeof console &&
                          console.warn("Unexpected", i, l, c);
                    }
                  } else if ("</" !== i.slice(0, 2) && t.WTF)
                    throw new Error(i);
              }
            }
          return r;
        })(m, t)));
    var b = {};
    if (
      (t.bookSheets || t.bookProps) &&
      (d.Sheets
        ? (e = d.Sheets.map(function (e) {
            return e.name;
          }))
        : p.Worksheets && 0 < p.SheetNames.length && (e = p.SheetNames),
      t.bookProps && ((b.Props = p), (b.Custprops = g)),
      t.bookSheets && void 0 !== e && (b.SheetNames = e),
      t.bookSheets ? b.SheetNames : t.bookProps)
    )
      return b;
    e = {};
    m = {};
    t.bookDeps && i.calcchain && (m = ff(et(r, Hh(i.calcchain)), i.calcchain));
    var v,
      w,
      T = 0,
      E = {},
      k = d.Sheets;
    (p.Worksheets = k.length), (p.SheetNames = []);
    for (var y = 0; y != k.length; ++y) p.SheetNames[y] = k[y].name;
    var S = o ? "bin" : "xml",
      o = i.workbooks[0].lastIndexOf("/"),
      _ = (
        i.workbooks[0].slice(0, o + 1) +
        "_rels/" +
        i.workbooks[0].slice(o + 1) +
        ".rels"
      ).replace(/^\//, "");
    Ze(r, _) || (_ = "xl/_rels/workbook." + S + ".rels");
    var x,
      A,
      C,
      R = Ya(tt(r, _, !0), _.replace(/_rels.*/, "s5s"));
    1 <= (i.metadata || []).length &&
      (t.xlmeta = uf(et(r, Hh(i.metadata[0])), i.metadata[0], t)),
      1 <= (i.people || []).length &&
        (t.people =
          ((o = et(r, Hh(i.people[0]))),
          (x = t),
          (C = !(A = [])),
          o.replace(ft, function (e) {
            var t = dt(e);
            switch (pt(t[0])) {
              case "<?xml":
              case "<personList":
              case "</personList>":
                break;
              case "<person":
                A.push({ name: t.displayname, id: t.id });
                break;
              case "</person>":
                break;
              case "<extLst":
              case "<extLst>":
              case "</extLst>":
              case "<extLst/>":
                break;
              case "<ext":
                C = !0;
                break;
              case "</ext>":
                C = !1;
                break;
              default:
                if (!C && x.WTF)
                  throw new Error(
                    "unrecognized " + t[0] + " in threaded comments",
                  );
            }
            return e;
          }),
          A)),
      (R = R && Bh(R, d.Sheets));
    var O = et(r, "xl/worksheets/sheet.xml", !0) ? 1 : 0;
    e: for (T = 0; T != p.Worksheets; ++T) {
      var I = "sheet";
      if (
        (R && R[T]
          ? ((v = "xl/" + R[T][1].replace(/[\/]?xl\//, "")),
            Ze(r, v) || (v = R[T][1]),
            Ze(r, v) || (v = _.replace(/_rels\/.*$/, "") + R[T][1]),
            (I = R[T][2]))
          : (v = (v = "xl/worksheets/sheet" + (T + 1 - O) + "." + S).replace(
              /sheet0\./,
              "sheet.",
            )),
        (w = v.replace(/^(.*)(\/)([^\/]*)$/, "$1/_rels/$3.rels")),
        t && null != t.sheets)
      )
        switch (typeof t.sheets) {
          case "number":
            if (T != t.sheets) continue e;
            break;
          case "string":
            if (p.SheetNames[T].toLowerCase() != t.sheets.toLowerCase())
              continue e;
            break;
          default:
            if (Array.isArray && Array.isArray(t.sheets)) {
              for (var N = !1, F = 0; F != t.sheets.length; ++F)
                "number" == typeof t.sheets[F] && t.sheets[F] == T && (N = 1),
                  "string" == typeof t.sheets[F] &&
                    t.sheets[F].toLowerCase() ==
                      p.SheetNames[T].toLowerCase() &&
                    (N = 1);
              if (!N) continue e;
            }
        }
      Wh(r, v, w, p.SheetNames[T], T, E, e, I, t, d, c, l);
    }
    return (
      (b = {
        Directory: i,
        Workbook: d,
        Props: p,
        Custprops: g,
        Deps: m,
        Sheets: e,
        SheetNames: p.SheetNames,
        Strings: Yc,
        Styles: l,
        Themes: c,
        SSF: Ve(me),
      }),
      t &&
        t.bookFiles &&
        (r.files
          ? ((b.keys = s), (b.files = r.files))
          : ((b.keys = []),
            (b.files = {}),
            r.FullPaths.forEach(function (e, t) {
              (e = e.replace(/^Root Entry[\/]/, "")),
                b.keys.push(e),
                (b.files[e] = r.FileIndex[t]);
            }))),
      t &&
        t.bookVBA &&
        (0 < i.vba.length
          ? (b.vbaraw = et(r, Hh(i.vba[0]), !0))
          : i.defaults &&
            i.defaults.bin === ac &&
            (b.vbaraw = et(r, "xl/vbaProject.bin", !0))),
      b
    );
  }
  function Vh(e, t) {
    var r,
      a = t || {},
      n = "Workbook",
      s = xe.find(e, n);
    try {
      if (((n = "/!DataSpaces/Version"), !(s = xe.find(e, n)) || !s.content))
        throw new Error("ECMA-376 Encrypted file missing " + n);
      if (
        ((i = s.content),
        ((r = {}).id = i.read_shift(0, "lpp4")),
        (r.R = Li(i, 4)),
        (r.U = Li(i, 4)),
        (r.W = Li(i, 4)),
        (n = "/!DataSpaces/DataSpaceMap"),
        !(s = xe.find(e, n)) || !s.content)
      )
        throw new Error("ECMA-376 Encrypted file missing " + n);
      var i = Mi(s.content);
      if (
        1 !== i.length ||
        1 !== i[0].comps.length ||
        0 !== i[0].comps[0].t ||
        "StrongEncryptionDataSpace" !== i[0].name ||
        "EncryptedPackage" !== i[0].comps[0].v
      )
        throw new Error("ECMA-376 Encrypted file bad " + n);
      if (
        ((n = "/!DataSpaces/DataSpaceInfo/StrongEncryptionDataSpace"),
        !(s = xe.find(e, n)) || !s.content)
      )
        throw new Error("ECMA-376 Encrypted file missing " + n);
      i = (function (e) {
        var t = [];
        e.l += 4;
        for (var r = e.read_shift(4); 0 < r--; )
          t.push(e.read_shift(0, "lpp4"));
        return t;
      })(s.content);
      if (1 != i.length || "StrongEncryptionTransform" != i[0])
        throw new Error("ECMA-376 Encrypted file bad " + n);
      if (
        ((n = "/!DataSpaces/TransformInfo/StrongEncryptionTransform/!Primary"),
        !(s = xe.find(e, n)) || !s.content)
      )
        throw new Error("ECMA-376 Encrypted file missing " + n);
      Ui(s.content);
    } catch (e) {}
    if (((n = "/EncryptionInfo"), !(s = xe.find(e, n)) || !s.content))
      throw new Error("ECMA-376 Encrypted file missing " + n);
    (t = Hi(s.content)), (n = "/EncryptedPackage");
    if (!(s = xe.find(e, n)) || !s.content)
      throw new Error("ECMA-376 Encrypted file missing " + n);
    if (4 == t[0] && "undefined" != typeof decrypt_agile)
      return decrypt_agile(t[1], s.content, a.password || "", a);
    if (2 == t[0] && "undefined" != typeof decrypt_std76)
      return decrypt_std76(t[1], s.content, a.password || "", a);
    throw new Error("File is password-protected");
  }
  function Gh(e, t) {
    return (
      "ods" == t.bookType
        ? lh
        : "numbers" == t.bookType
        ? Ph
        : "xlsb" == t.bookType
        ? function (e, t) {
            (Zo = 1024), e && !e.SSF && (e.SSF = Ve(me));
            e &&
              e.SSF &&
              (Ee(),
              Te(e.SSF),
              (t.revssf = Ne(e.SSF)),
              (t.revssf[e.SSF[65535]] = 0),
              (t.ssf = e.SSF));
            (t.rels = {}),
              (t.wbrels = {}),
              (t.Strings = []),
              (t.Strings.Count = 0),
              (t.Strings.Unique = 0),
              Jc
                ? (t.revStrings = new Map())
                : ((t.revStrings = {}),
                  (t.revStrings.foo = []),
                  delete t.revStrings.foo);
            var r = "xlsb" == t.bookType ? "bin" : "xml",
              a = -1 < nc.indexOf(t.bookType),
              n = Ga();
            Uh((t = t || {}));
            var s = nt(),
              i = "",
              o = 0;
            (t.cellXfs = []),
              el(t.cellXfs, {}, { revssf: { General: 0 } }),
              e.Props || (e.Props = {});
            if (
              (at(s, (i = "docProps/core.xml"), nn(e.Props, t)),
              n.coreprops.push(i),
              Ja(t.rels, 2, i, $a.CORE_PROPS),
              (i = "docProps/app.xml"),
              !e.Props || !e.Props.SheetNames)
            )
              if (e.Workbook && e.Workbook.Sheets) {
                for (var c = [], l = 0; l < e.SheetNames.length; ++l)
                  2 != (e.Workbook.Sheets[l] || {}).Hidden &&
                    c.push(e.SheetNames[l]);
                e.Props.SheetNames = c;
              } else e.Props.SheetNames = e.SheetNames;
            (e.Props.Worksheets = e.Props.SheetNames.length),
              at(s, i, ln(e.Props)),
              n.extprops.push(i),
              Ja(t.rels, 3, i, $a.EXT_PROPS),
              e.Custprops !== e.Props &&
                0 < Re(e.Custprops || {}).length &&
                (at(s, (i = "docProps/custom.xml"), hn(e.Custprops)),
                n.custprops.push(i),
                Ja(t.rels, 4, i, $a.CUST_PROPS));
            for (o = 1; o <= e.SheetNames.length; ++o) {
              var f,
                h,
                u,
                d = { "!id": {} },
                p = e.Sheets[e.SheetNames[o - 1]];
              at(
                s,
                (i = "xl/worksheets/sheet" + o + "." + r),
                (function (e, t, r, a, n) {
                  return (".bin" === t.slice(-4) ? Bl : xl)(e, r, a, n);
                })(o - 1, i, t, e, d),
              ),
                n.sheets.push(i),
                Ja(t.wbrels, -1, "worksheets/sheet" + o + "." + r, $a.WS[0]),
                p &&
                  ((f = p["!comments"]),
                  (h = !1),
                  (u = ""),
                  f &&
                    0 < f.length &&
                    (at(
                      s,
                      (u = "xl/comments" + o + "." + r),
                      (function (e, t, r) {
                        return (".bin" === t.slice(-4) ? rc : tc)(e, r);
                      })(f, u, t),
                    ),
                    n.comments.push(u),
                    Ja(d, -1, "../comments" + o + "." + r, $a.CMNT),
                    (h = !0)),
                  p["!legacy"] &&
                    h &&
                    at(
                      s,
                      "xl/drawings/vmlDrawing" + o + ".vml",
                      Qo(o, p["!comments"]),
                    ),
                  delete p["!comments"],
                  delete p["!legacy"]),
                d["!id"].rId1 && at(s, Xa(i), Ka(d));
            }
            null != t.Strings &&
              0 < t.Strings.length &&
              (at(
                s,
                (i = "xl/sharedStrings." + r),
                (function (e, t, r) {
                  return (".bin" === t.slice(-4) ? Di : Ni)(e, r);
                })(t.Strings, i, t),
              ),
              n.strs.push(i),
              Ja(t.wbrels, -1, "sharedStrings." + r, $a.SST));
            at(
              s,
              (i = "xl/workbook." + r),
              (function (e, t, r) {
                return (".bin" === t.slice(-4) ? rf : Zl)(e, r);
              })(e, i, t),
            ),
              n.workbooks.push(i),
              Ja(t.rels, 1, i, $a.WB),
              at(s, (i = "xl/theme/theme1.xml"), Xo(e.Themes, t)),
              n.themes.push(i),
              Ja(t.wbrels, -1, "theme/theme1.xml", $a.THEME),
              at(
                s,
                (i = "xl/styles." + r),
                (function (e, t, r) {
                  return (".bin" === t.slice(-4) ? Mo : _o)(e, r);
                })(e, i, t),
              ),
              n.styles.push(i),
              Ja(t.wbrels, -1, "styles." + r, $a.STY),
              e.vbaraw &&
                a &&
                (at(s, (i = "xl/vbaProject.bin"), e.vbaraw),
                n.vba.push(i),
                Ja(t.wbrels, -1, "vbaProject.bin", $a.VBA));
            return (
              at(
                s,
                (i = "xl/metadata." + r),
                (function (e) {
                  return (".bin" === e.slice(-4) ? Jo : qo)();
                })(i),
              ),
              n.metadata.push(i),
              Ja(t.wbrels, -1, "metadata." + r, $a.XLMETA),
              at(s, "[Content_Types].xml", ja(n, t)),
              at(s, "_rels/.rels", Ka(t.rels)),
              at(s, "xl/_rels/workbook." + r + ".rels", Ka(t.wbrels)),
              delete t.revssf,
              delete t.ssf,
              s
            );
          }
        : jh
    )(e, t);
  }
  function jh(e, t) {
    (Zo = 1024),
      e && !e.SSF && (e.SSF = Ve(me)),
      e &&
        e.SSF &&
        (Ee(),
        Te(e.SSF),
        (t.revssf = Ne(e.SSF)),
        (t.revssf[e.SSF[65535]] = 0),
        (t.ssf = e.SSF)),
      (t.rels = {}),
      (t.wbrels = {}),
      (t.Strings = []),
      (t.Strings.Count = 0),
      (t.Strings.Unique = 0),
      Jc
        ? (t.revStrings = new Map())
        : ((t.revStrings = {}),
          (t.revStrings.foo = []),
          delete t.revStrings.foo);
    var r = "xml",
      a = -1 < nc.indexOf(t.bookType),
      n = Ga();
    Uh((t = t || {}));
    var s = nt(),
      i = "",
      o = 0;
    if (
      ((t.cellXfs = []),
      el(t.cellXfs, {}, { revssf: { General: 0 } }),
      e.Props || (e.Props = {}),
      (i = "docProps/core.xml"),
      at(s, i, nn(e.Props, t)),
      n.coreprops.push(i),
      Ja(t.rels, 2, i, $a.CORE_PROPS),
      (i = "docProps/app.xml"),
      !e.Props || !e.Props.SheetNames)
    )
      if (e.Workbook && e.Workbook.Sheets) {
        for (var c = [], l = 0; l < e.SheetNames.length; ++l)
          2 != (e.Workbook.Sheets[l] || {}).Hidden && c.push(e.SheetNames[l]);
        e.Props.SheetNames = c;
      } else e.Props.SheetNames = e.SheetNames;
    (e.Props.Worksheets = e.Props.SheetNames.length),
      at(s, i, ln(e.Props)),
      n.extprops.push(i),
      Ja(t.rels, 3, i, $a.EXT_PROPS),
      e.Custprops !== e.Props &&
        0 < Re(e.Custprops || {}).length &&
        (at(s, (i = "docProps/custom.xml"), hn(e.Custprops)),
        n.custprops.push(i),
        Ja(t.rels, 4, i, $a.CUST_PROPS));
    var f,
      h = ["SheetJ5"];
    for (t.tcid = 0, o = 1; o <= e.SheetNames.length; ++o) {
      var u,
        d,
        p,
        m,
        g = { "!id": {} },
        b = e.Sheets[e.SheetNames[o - 1]];
      at(s, (i = "xl/worksheets/sheet" + o + "." + r), xl(o - 1, t, e, g)),
        n.sheets.push(i),
        Ja(t.wbrels, -1, "worksheets/sheet" + o + "." + r, $a.WS[0]),
        b &&
          ((d = !1),
          (p = ""),
          (u = b["!comments"]) &&
            0 < u.length &&
            ((m = !1),
            u.forEach(function (e) {
              e[1].forEach(function (e) {
                1 == e.T && (m = !0);
              });
            }),
            m &&
              (at(
                s,
                (p = "xl/threadedComments/threadedComment" + o + "." + r),
                (function (e, s, i) {
                  var o = [
                    ot,
                    Yt("ThreadedComments", null, { xmlns: Zt.TCMNT }).replace(
                      /[\/]>/,
                      ">",
                    ),
                  ];
                  return (
                    e.forEach(function (a) {
                      var n = "";
                      (a[1] || []).forEach(function (e, t) {
                        var r;
                        e.T
                          ? (e.a && -1 == s.indexOf(e.a) && s.push(e.a),
                            (r = {
                              ref: a[0],
                              id:
                                "{54EE7951-7262-4200-6969-" +
                                ("000000000000" + i.tcid++).slice(-12) +
                                "}",
                            }),
                            0 == t ? (n = r.id) : (r.parentId = n),
                            (e.ID = r.id),
                            e.a &&
                              (r.personId =
                                "{54EE7950-7262-4200-6969-" +
                                ("000000000000" + s.indexOf(e.a)).slice(-12) +
                                "}"),
                            o.push(
                              Yt("threadedComment", $t("text", e.t || ""), r),
                            ))
                          : delete e.ID;
                      });
                    }),
                    o.push("</ThreadedComments>"),
                    o.join("")
                  );
                })(u, h, t),
              ),
              n.threadedcomments.push(p),
              Ja(
                g,
                -1,
                "../threadedComments/threadedComment" + o + "." + r,
                $a.TCMNT,
              )),
            at(s, (p = "xl/comments" + o + "." + r), tc(u)),
            n.comments.push(p),
            Ja(g, -1, "../comments" + o + "." + r, $a.CMNT),
            (d = !0)),
          b["!legacy"] &&
            d &&
            at(s, "xl/drawings/vmlDrawing" + o + ".vml", Qo(o, b["!comments"])),
          delete b["!comments"],
          delete b["!legacy"]),
        g["!id"].rId1 && at(s, Xa(i), Ka(g));
    }
    return (
      null != t.Strings &&
        0 < t.Strings.length &&
        (at(s, (i = "xl/sharedStrings.xml"), Ni(t.Strings, t)),
        n.strs.push(i),
        Ja(t.wbrels, -1, "sharedStrings.xml", $a.SST)),
      at(s, (i = "xl/workbook.xml"), Zl(e)),
      n.workbooks.push(i),
      Ja(t.rels, 1, i, $a.WB),
      at(s, (i = "xl/theme/theme1.xml"), Xo(e.Themes, t)),
      n.themes.push(i),
      Ja(t.wbrels, -1, "theme/theme1.xml", $a.THEME),
      at(s, (i = "xl/styles.xml"), _o(e, t)),
      n.styles.push(i),
      Ja(t.wbrels, -1, "styles.xml", $a.STY),
      e.vbaraw &&
        a &&
        (at(s, (i = "xl/vbaProject.bin"), e.vbaraw),
        n.vba.push(i),
        Ja(t.wbrels, -1, "vbaProject.bin", $a.VBA)),
      at(s, (i = "xl/metadata.xml"), qo()),
      n.metadata.push(i),
      Ja(t.wbrels, -1, "metadata.xml", $a.XLMETA),
      1 < h.length &&
        (at(
          s,
          (i = "xl/persons/person.xml"),
          ((a = h),
          (f = [
            ot,
            Yt("personList", null, {
              xmlns: Zt.TCMNT,
              "xmlns:x": Qt[0],
            }).replace(/[\/]>/, ">"),
          ]),
          a.forEach(function (e, t) {
            f.push(
              Yt("person", null, {
                displayName: e,
                id:
                  "{54EE7950-7262-4200-6969-" +
                  ("000000000000" + t).slice(-12) +
                  "}",
                userId: e,
                providerId: "None",
              }),
            );
          }),
          f.push("</personList>"),
          f.join("")),
        ),
        n.people.push(i),
        Ja(t.wbrels, -1, "persons/person.xml", $a.PEOPLE)),
      at(s, "[Content_Types].xml", ja(n, t)),
      at(s, "_rels/.rels", Ka(t.rels)),
      at(s, "xl/_rels/workbook.xml.rels", Ka(t.wbrels)),
      delete t.revssf,
      delete t.ssf,
      s
    );
  }
  function $h(e, t) {
    var r = "";
    switch ((t || {}).type || "base64") {
      case "buffer":
        return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
      case "base64":
        r = te(e.slice(0, 12));
        break;
      case "binary":
        r = e;
        break;
      case "array":
        return [e[0], e[1], e[2], e[3], e[4], e[5], e[6], e[7]];
      default:
        throw new Error("Unrecognized type " + ((t && t.type) || "undefined"));
    }
    return [
      r.charCodeAt(0),
      r.charCodeAt(1),
      r.charCodeAt(2),
      r.charCodeAt(3),
      r.charCodeAt(4),
      r.charCodeAt(5),
      r.charCodeAt(6),
      r.charCodeAt(7),
    ];
  }
  function Xh(e, t) {
    var r = 0;
    e: for (; r < e.length; )
      switch (e.charCodeAt(r)) {
        case 10:
        case 13:
        case 32:
          ++r;
          break;
        case 60:
          return wf(e.slice(r), t);
        default:
          break e;
      }
    return Ks.to_workbook(e, t);
  }
  function Yh(e, t, r, a) {
    return a
      ? ((r.type = "string"), Ks.to_workbook(e, r))
      : Ks.to_workbook(t, r);
  }
  function Kh(e, t) {
    h();
    var r = t || {};
    if ("undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer)
      return Kh(new Uint8Array(e), (((r = Ve(r)).type = "array"), r));
    "undefined" != typeof Uint8Array &&
      e instanceof Uint8Array &&
      !r.type &&
      (r.type = "undefined" != typeof Deno ? "buffer" : "array");
    var a,
      n,
      s,
      i,
      o,
      c = e,
      l = !1;
    if (
      (r.cellStyles && ((r.cellNF = !0), (r.sheetStubs = !0)),
      (Kc = {}),
      r.dateNF && (Kc.dateNF = r.dateNF),
      r.type || (r.type = se && Buffer.isBuffer(e) ? "buffer" : "base64"),
      "file" == r.type &&
        ((r.type = se ? "buffer" : "binary"),
        (c = (function (e) {
          if (void 0 !== Se) return Se.readFileSync(e);
          if ("undefined" != typeof Deno) return Deno.readFileSync(e);
          if (
            "undefined" != typeof $ &&
            "undefined" != typeof File &&
            "undefined" != typeof Folder
          )
            try {
              var t = File(e);
              t.open("r"), (t.encoding = "binary");
              var r = t.read();
              return t.close(), r;
            } catch (e) {
              if (!e.message || !e.message.match(/onstruct/)) throw e;
            }
          throw new Error("Cannot access file " + e);
        })(e)),
        "undefined" == typeof Uint8Array || se || (r.type = "array")),
      "string" == r.type &&
        ((l = !0),
        (r.type = "binary"),
        (r.codepage = 65001),
        (c = (f = e).match(/[^\x00-\x7F]/) ? Ut(f) : f)),
      "array" == r.type &&
        "undefined" != typeof Uint8Array &&
        e instanceof Uint8Array &&
        "undefined" != typeof ArrayBuffer)
    ) {
      var f = new ArrayBuffer(3),
        f = new Uint8Array(f);
      if (((f.foo = "bar"), !f.foo))
        return ((r = Ve(r)).type = "array"), Kh(m(c), r);
    }
    switch ((a = $h(c, r))[0]) {
      case 208:
        if (
          207 === a[1] &&
          17 === a[2] &&
          224 === a[3] &&
          161 === a[4] &&
          177 === a[5] &&
          26 === a[6] &&
          225 === a[7]
        )
          return (
            (i = xe.read(c, r)),
            (o = r),
            (xe.find(i, "EncryptedPackage") ? Vh : Nf)(i, o)
          );
        break;
      case 9:
        if (a[1] <= 8) return Nf(c, r);
        break;
      case 60:
        return wf(c, r);
      case 73:
        if (73 === a[1] && 42 === a[2] && 0 === a[3])
          throw new Error("TIFF Image File is not a spreadsheet");
        if (68 === a[1])
          return (function (t, r) {
            var a = r || {},
              n = !!a.WTF;
            a.WTF = !0;
            try {
              var e = Ns.to_workbook(t, a);
              return (a.WTF = n), e;
            } catch (e) {
              if (((a.WTF = n), !e.message.match(/SYLK bad record ID/) && n))
                throw e;
              return Ks.to_workbook(t, r);
            }
          })(c, r);
        break;
      case 84:
        if (65 === a[1] && 66 === a[2] && 76 === a[3])
          return Ps.to_workbook(c, r);
        break;
      case 80:
        return 75 === a[1] && a[2] < 9 && a[3] < 9
          ? ((s = o = c),
            (n = (n = r) || {}).type ||
              (n.type = se && Buffer.isBuffer(o) ? "buffer" : "base64"),
            zh(st(s, n), n))
          : Yh(e, c, r, l);
      case 239:
        return 60 === a[3] ? wf(c, r) : Yh(e, c, r, l);
      case 255:
        if (254 === a[1])
          return (
            (s = c),
            "base64" == (n = r).type && (s = te(s)),
            (s = re.utils.decode(1200, s.slice(2), "str")),
            (n.type = "binary"),
            Xh(s, n)
          );
        if (0 === a[1] && 2 === a[2] && 0 === a[3]) return si.to_workbook(c, r);
        break;
      case 0:
        if (0 === a[1]) {
          if (2 <= a[2] && 0 === a[3]) return si.to_workbook(c, r);
          if (0 === a[2] && (8 === a[3] || 9 === a[3]))
            return si.to_workbook(c, r);
        }
        break;
      case 3:
      case 131:
      case 139:
      case 140:
        return xs.to_workbook(c, r);
      case 123:
        if (92 === a[1] && 114 === a[2] && 116 === a[3])
          return Ji.to_workbook(c, r);
        break;
      case 10:
      case 13:
      case 32:
        return (function (e, t) {
          var r = "",
            a = $h(e, t);
          switch (t.type) {
            case "base64":
              r = te(e);
              break;
            case "binary":
              r = e;
              break;
            case "buffer":
              r = e.toString("binary");
              break;
            case "array":
              r = ze(e);
              break;
            default:
              throw new Error("Unrecognized type " + t.type);
          }
          return (
            239 == a[0] && 187 == a[1] && 191 == a[2] && (r = Mt(r)),
            (t.type = "binary"),
            Xh(r, t)
          );
        })(c, r);
      case 137:
        if (80 === a[1] && 78 === a[2] && 71 === a[3])
          throw new Error("PNG Image File is not a spreadsheet");
    }
    return -1 < _s.indexOf(a[0]) && a[2] <= 12 && a[3] <= 31
      ? xs.to_workbook(c, r)
      : Yh(e, c, r, l);
  }
  function Jh(e, t) {
    t = t || {};
    return (t.type = "file"), Kh(e, t);
  }
  function qh(e, t) {
    switch (t.type) {
      case "base64":
      case "binary":
        break;
      case "buffer":
      case "array":
        t.type = "";
        break;
      case "file":
        return Ce(t.file, xe.write(e, { type: se ? "buffer" : "" }));
      case "string":
        throw new Error(
          "'string' output type invalid for '" + t.bookType + "' files",
        );
      default:
        throw new Error("Unrecognized type " + t.type);
    }
    return xe.write(e, t);
  }
  function Zh(e, t) {
    var r = {},
      a = se
        ? "nodebuffer"
        : "undefined" != typeof Uint8Array
        ? "array"
        : "string";
    if ((t.compression && (r.compression = "DEFLATE"), t.password)) r.type = a;
    else
      switch (t.type) {
        case "base64":
          r.type = "base64";
          break;
        case "binary":
          r.type = "string";
          break;
        case "string":
          throw new Error(
            "'string' output type invalid for '" + t.bookType + "' files",
          );
        case "buffer":
        case "file":
          r.type = a;
          break;
        default:
          throw new Error("Unrecognized type " + t.type);
      }
    e = e.FullPaths
      ? xe.write(e, {
          fileType: "zip",
          type: { nodebuffer: "buffer", string: "binary" }[r.type] || r.type,
          compression: !!t.compression,
        })
      : e.generate(r);
    if ("undefined" != typeof Deno && "string" == typeof e) {
      if ("binary" == t.type || "base64" == t.type) return e;
      e = new Uint8Array(o(e));
    }
    return t.password && "undefined" != typeof encrypt_agile
      ? qh(encrypt_agile(e, t.password), t)
      : "file" === t.type
      ? Ce(t.file, e)
      : "string" == t.type
      ? Mt(e)
      : e;
  }
  function Qh(e, t, r) {
    var a = (r = r || "") + e;
    switch (t.type) {
      case "base64":
        return ee(Ut(a));
      case "binary":
        return Ut(a);
      case "string":
        return e;
      case "file":
        return Ce(t.file, a, "utf8");
      case "buffer":
        return se
          ? ce(a, "utf8")
          : "undefined" != typeof TextEncoder
          ? new TextEncoder().encode(a)
          : Qh(a, { type: "binary" })
              .split("")
              .map(function (e) {
                return e.charCodeAt(0);
              });
    }
    throw new Error("Unrecognized type " + t.type);
  }
  function eu(e, t) {
    switch (t.type) {
      case "string":
      case "base64":
      case "binary":
        for (var r = "", a = 0; a < e.length; ++a)
          r += String.fromCharCode(e[a]);
        return "base64" == t.type ? ee(r) : "string" == t.type ? Mt(r) : r;
      case "file":
        return Ce(t.file, e);
      case "buffer":
        return e;
      default:
        throw new Error("Unrecognized type " + t.type);
    }
  }
  function tu(e, t) {
    h(), Jl(e);
    var r,
      a = Ve(t || {});
    if (
      (a.cellStyles && ((a.cellNF = !0), (a.sheetStubs = !0)),
      "array" != a.type)
    )
      return (r = e), (t = Ve((t = a) || {})), Zh(jh(r, t), t);
    a.type = "binary";
    e = tu(e, a);
    return (a.type = "array"), o(e);
  }
  function ru(e, t) {
    h(), Jl(e);
    var r = Ve(t || {});
    if (
      (r.cellStyles && ((r.cellNF = !0), (r.sheetStubs = !0)),
      "array" == r.type)
    ) {
      r.type = "binary";
      t = ru(e, r);
      return (r.type = "array"), o(t);
    }
    var a,
      n,
      s,
      i = 0;
    if (
      r.sheet &&
      ((i =
        "number" == typeof r.sheet ? r.sheet : e.SheetNames.indexOf(r.sheet)),
      !e.SheetNames[i])
    )
      throw new Error("Sheet not found: " + r.sheet + " : " + typeof r.sheet);
    switch (r.bookType || "xlsb") {
      case "xml":
      case "xlml":
        return Qh(_f(e, r), r);
      case "slk":
      case "sylk":
        return Qh(Ns.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "htm":
      case "html":
        return Qh(Qf(e.Sheets[e.SheetNames[i]], r), r);
      case "txt":
        return (function (e, t) {
          switch (t.type) {
            case "base64":
              return ee(e);
            case "binary":
            case "string":
              return e;
            case "file":
              return Ce(t.file, e, "binary");
            case "buffer":
              return se
                ? ce(e, "binary")
                : e.split("").map(function (e) {
                    return e.charCodeAt(0);
                  });
          }
          throw new Error("Unrecognized type " + t.type);
        })(fu(e.Sheets[e.SheetNames[i]], r), r);
      case "csv":
        return Qh(lu(e.Sheets[e.SheetNames[i]], r), r, "\ufeff");
      case "dif":
        return Qh(Ps.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "dbf":
        return eu(xs.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "prn":
        return Qh(Ks.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "rtf":
        return Qh(Ji.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "eth":
        return Qh(Gs.from_sheet(e.Sheets[e.SheetNames[i]], r), r);
      case "fods":
        return Qh(lh(e, r), r);
      case "wk1":
        return eu(si.sheet_to_wk1(e.Sheets[e.SheetNames[i]], r), r);
      case "wk3":
        return eu(si.book_to_wk3(e, r), r);
      case "biff2":
        r.biff || (r.biff = 2);
      case "biff3":
        r.biff || (r.biff = 3);
      case "biff4":
        return r.biff || (r.biff = 4), eu(Xf(e, r), r);
      case "biff5":
        r.biff || (r.biff = 5);
      case "biff8":
      case "xla":
      case "xls":
        return r.biff || (r.biff = 8), qh(Ff(e, (s = (s = r) || {})), s);
      case "xlsx":
      case "xlsm":
      case "xlam":
      case "xlsb":
      case "numbers":
      case "ods":
        return (
          (a = e), (s = Ve((n = r) || {})), (yo = new wu(n)), Zh(Gh(a, s), s)
        );
      default:
        throw new Error("Unrecognized bookType |" + r.bookType + "|");
    }
  }
  function au(e) {
    var t;
    e.bookType ||
      ((t = e.file.slice(e.file.lastIndexOf(".")).toLowerCase()).match(
        /^\.[a-z]+$/,
      ) && (e.bookType = t.slice(1)),
      (e.bookType =
        {
          xls: "biff8",
          htm: "html",
          slk: "sylk",
          socialcalc: "eth",
          Sh33tJS: "WTF",
        }[e.bookType] || e.bookType));
  }
  function nu(e, t, r) {
    r = r || {};
    return (r.type = "file"), (r.file = t), au(r), ru(e, r);
  }
  function su(e, t, r, a, n, s, i, o) {
    var c = jr(r),
      l = o.defval,
      f = o.raw || !Object.prototype.hasOwnProperty.call(o, "raw"),
      h = !0,
      u = 1 === n ? [] : {};
    if (1 !== n)
      if (Object.defineProperty)
        try {
          Object.defineProperty(u, "__rowNum__", { value: r, enumerable: !1 });
        } catch (e) {
          u.__rowNum__ = r;
        }
      else u.__rowNum__ = r;
    if (!i || e[r])
      for (var d = t.s.c; d <= t.e.c; ++d) {
        var p = i ? e[r][d] : e[a[d] + c];
        if (void 0 !== p && void 0 !== p.t) {
          var m = p.v;
          switch (p.t) {
            case "z":
              if (null == m) break;
              continue;
            case "e":
              m = 0 == m ? null : void 0;
              break;
            case "s":
            case "d":
            case "b":
            case "n":
              break;
            default:
              throw new Error("unrecognized type " + p.t);
          }
          if (null != s[d]) {
            if (null == m)
              if ("e" == p.t && null === m) u[s[d]] = null;
              else if (void 0 !== l) u[s[d]] = l;
              else {
                if (!f || null !== m) continue;
                u[s[d]] = null;
              }
            else
              u[s[d]] =
                f && ("n" !== p.t || ("n" === p.t && !1 !== o.rawNumbers))
                  ? m
                  : ea(p, m, o);
            null != m && (h = !1);
          }
        } else void 0 !== l && null != s[d] && (u[s[d]] = l);
      }
    return { row: u, isempty: h };
  }
  function iu(e, t) {
    if (null == e || null == e["!ref"]) return [];
    var r,
      a = { t: "n", v: 0 },
      n = 0,
      s = 1,
      i = [],
      o = "",
      c = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } },
      l = t || {},
      f = null != l.range ? l.range : e["!ref"];
    switch (
      (1 === l.header
        ? (n = 1)
        : "A" === l.header
        ? (n = 2)
        : Array.isArray(l.header)
        ? (n = 3)
        : null == l.header && (n = 0),
      typeof f)
    ) {
      case "string":
        c = Zr(f);
        break;
      case "number":
        (c = Zr(e["!ref"])).s.r = f;
        break;
      default:
        c = f;
    }
    0 < n && (s = 0);
    var h = jr(c.s.r),
      u = [],
      d = [],
      p = 0,
      m = 0,
      g = Array.isArray(e),
      b = c.s.r,
      v = 0,
      w = {};
    g && !e[b] && (e[b] = []);
    for (
      var T,
        E = (l.skipHidden && e["!cols"]) || [],
        k = (l.skipHidden && e["!rows"]) || [],
        v = c.s.c;
      v <= c.e.c;
      ++v
    )
      if (!(E[v] || {}).hidden)
        switch (((u[v] = Xr(v)), (a = g ? e[b][v] : e[u[v] + h]), n)) {
          case 1:
            i[v] = v - c.s.c;
            break;
          case 2:
            i[v] = u[v];
            break;
          case 3:
            i[v] = l.header[v - c.s.c];
            break;
          default:
            if (
              ((o = r =
                ea((a = null == a ? { w: "__EMPTY", t: "s" } : a), null, l)),
              (m = w[r] || 0))
            ) {
              for (; (o = r + "_" + m++), w[o]; );
              (w[r] = m), (w[o] = 1);
            } else w[r] = 1;
            i[v] = o;
        }
    for (b = c.s.r + s; b <= c.e.r; ++b)
      (k[b] || {}).hidden ||
        (!1 !== (T = su(e, c, b, u, n, i, g, l)).isempty &&
          (1 === n ? !1 === l.blankrows : !l.blankrows)) ||
        (d[p++] = T.row);
    return (d.length = p), d;
  }
  var ou = /"/g;
  function cu(e, t, r, a, n, s, i, o) {
    for (var c = !0, l = [], f = "", h = jr(r), u = t.s.c; u <= t.e.c; ++u)
      if (a[u]) {
        var d = o.dense ? (e[r] || [])[u] : e[a[u] + h];
        if (null == d) f = "";
        else if (null != d.v) {
          (c = !1),
            (f = "" + (o.rawNumbers && "n" == d.t ? d.v : ea(d, null, o)));
          for (var p, m = 0; m !== f.length; ++m)
            if (
              (p = f.charCodeAt(m)) === n ||
              p === s ||
              34 === p ||
              o.forceQuotes
            ) {
              f = '"' + f.replace(ou, '""') + '"';
              break;
            }
          "ID" == f && (f = '"ID"');
        } else
          null == d.f || d.F
            ? (f = "")
            : ((c = !1),
              0 <= (f = "=" + d.f).indexOf(",") &&
                (f = '"' + f.replace(ou, '""') + '"'));
        l.push(f);
      }
    return !1 === o.blankrows && c ? null : l.join(i);
  }
  function lu(e, t) {
    var r = [],
      a = null == t ? {} : t;
    if (null == e || null == e["!ref"]) return "";
    var n = Zr(e["!ref"]),
      s = void 0 !== a.FS ? a.FS : ",",
      i = s.charCodeAt(0),
      o = void 0 !== a.RS ? a.RS : "\n",
      c = o.charCodeAt(0),
      l = new RegExp(("|" == s ? "\\|" : s) + "+$"),
      f = "",
      h = [];
    a.dense = Array.isArray(e);
    for (
      var u = (a.skipHidden && e["!cols"]) || [],
        d = (a.skipHidden && e["!rows"]) || [],
        p = n.s.c;
      p <= n.e.c;
      ++p
    )
      (u[p] || {}).hidden || (h[p] = Xr(p));
    for (var m = 0, g = n.s.r; g <= n.e.r; ++g)
      (d[g] || {}).hidden ||
        (null != (f = cu(e, n, g, h, i, c, s, a)) &&
          ((!(f = a.strip ? f.replace(l, "") : f) && !1 === a.blankrows) ||
            r.push((m++ ? o : "") + f)));
    return delete a.dense, r.join("");
  }
  function fu(e, t) {
    ((t = t || {}).FS = "\t"), (t.RS = "\n");
    e = lu(e, t);
    if (void 0 === re || "string" == t.type) return e;
    e = re.utils.encode(1200, e, "str");
    return String.fromCharCode(255) + String.fromCharCode(254) + e;
  }
  function hu(e, t, r) {
    var i,
      o = r || {},
      c = +!o.skipHeader,
      l = e || {},
      f = 0,
      h = 0;
    l &&
      null != o.origin &&
      ("number" == typeof o.origin
        ? (f = o.origin)
        : ((a = "string" == typeof o.origin ? Yr(o.origin) : o.origin),
          (f = a.r),
          (h = a.c)));
    var a,
      e = { s: { c: 0, r: 0 }, e: { c: h, r: f + t.length - 1 + c } };
    l["!ref"]
      ? ((a = Zr(l["!ref"])),
        (e.e.c = Math.max(e.e.c, a.e.c)),
        (e.e.r = Math.max(e.e.r, a.e.r)),
        -1 == f && ((f = a.e.r + 1), (e.e.r = f + t.length - 1 + c)))
      : -1 == f && ((f = 0), (e.e.r = t.length - 1 + c));
    var u = o.header || [],
      d = 0;
    t.forEach(function (n, s) {
      Re(n).forEach(function (e) {
        -1 == (d = u.indexOf(e)) && (u[(d = u.length)] = e);
        var t = n[e],
          r = "z",
          a = "",
          e = Kr({ c: h + d, r: f + s + c });
        (i = uu(l, e)),
          !t || "object" != typeof t || t instanceof Date
            ? ("number" == typeof t
                ? (r = "n")
                : "boolean" == typeof t
                ? (r = "b")
                : "string" == typeof t
                ? (r = "s")
                : t instanceof Date
                ? ((r = "d"),
                  o.cellDates || ((r = "n"), (t = De(t))),
                  (a = o.dateNF || me[14]))
                : null === t && o.nullError && ((r = "e"), (t = 0)),
              i
                ? ((i.t = r), (i.v = t), delete i.w, delete i.R, a && (i.z = a))
                : (l[e] = i = { t: r, v: t }),
              a && (i.z = a))
            : (l[e] = t);
      });
    }),
      (e.e.c = Math.max(e.e.c, h + u.length - 1));
    var n = jr(f);
    if (c)
      for (d = 0; d < u.length; ++d) l[Xr(d + h) + n] = { t: "s", v: u[d] };
    return (l["!ref"] = qr(e)), l;
  }
  function uu(e, t, r) {
    if ("string" != typeof t)
      return uu(e, Kr("number" != typeof t ? t : { r: t, c: r || 0 }));
    if (Array.isArray(e)) {
      r = Yr(t);
      return e[r.r] || (e[r.r] = []), e[r.r][r.c] || (e[r.r][r.c] = { t: "z" });
    }
    return e[t] || (e[t] = { t: "z" });
  }
  function du() {
    return { SheetNames: [], Sheets: {} };
  }
  function pu(e, t, r, a) {
    var n = 1;
    if (!r)
      for (
        ;
        n <= 65535 && -1 != e.SheetNames.indexOf((r = "Sheet" + n));
        ++n, r = void 0
      );
    if (!r || 65535 <= e.SheetNames.length)
      throw new Error("Too many worksheets");
    if (a && 0 <= e.SheetNames.indexOf(r)) {
      var a = r.match(/(^.*?)(\d+)$/),
        n = (a && +a[2]) || 0,
        s = (a && a[1]) || r;
      for (++n; n <= 65535 && -1 != e.SheetNames.indexOf((r = s + n)); ++n);
    }
    if ((Kl(r), 0 <= e.SheetNames.indexOf(r)))
      throw new Error("Worksheet with name |" + r + "| already exists!");
    return e.SheetNames.push(r), (e.Sheets[r] = t), r;
  }
  function mu(e, t, r) {
    return t ? ((e.l = { Target: t }), r && (e.l.Tooltip = r)) : delete e.l, e;
  }
  var gu,
    Es = {
      encode_col: Xr,
      encode_row: jr,
      encode_cell: Kr,
      encode_range: qr,
      decode_col: $r,
      decode_row: Gr,
      split_cell: function (e) {
        return e.replace(/(\$?[A-Z]*)(\$?\d*)/, "$1,$2").split(",");
      },
      decode_cell: Yr,
      decode_range: Jr,
      format_cell: ea,
      sheet_add_aoa: ra,
      sheet_add_json: hu,
      sheet_add_dom: eh,
      aoa_to_sheet: aa,
      json_to_sheet: function (e, t) {
        return hu(null, e, t);
      },
      table_to_sheet: th,
      table_to_book: function (e, t) {
        return ta(th(e, t), t);
      },
      sheet_to_csv: lu,
      sheet_to_txt: fu,
      sheet_to_json: iu,
      sheet_to_html: Qf,
      sheet_to_formulae: function (e) {
        var t,
          r = "",
          a = "";
        if (null == e || null == e["!ref"]) return [];
        for (
          var n,
            s = Zr(e["!ref"]),
            i = [],
            o = [],
            c = Array.isArray(e),
            l = s.s.c;
          l <= s.e.c;
          ++l
        )
          i[l] = Xr(l);
        for (var f = s.s.r; f <= s.e.r; ++f)
          for (n = jr(f), l = s.s.c; l <= s.e.c; ++l)
            if (
              ((r = i[l] + n),
              (a = ""),
              void 0 !== (t = c ? (e[f] || [])[l] : e[r]))
            ) {
              if (null != t.F) {
                if (((r = t.F), !t.f)) continue;
                (a = t.f), -1 == r.indexOf(":") && (r = r + ":" + r);
              }
              if (null != t.f) a = t.f;
              else {
                if ("z" == t.t) continue;
                if ("n" == t.t && null != t.v) a = "" + t.v;
                else if ("b" == t.t) a = t.v ? "TRUE" : "FALSE";
                else if (void 0 !== t.w) a = "'" + t.w;
                else {
                  if (void 0 === t.v) continue;
                  a = "s" == t.t ? "'" + t.v : "" + t.v;
                }
              }
              o[o.length] = r + "=" + a;
            }
        return o;
      },
      sheet_to_row_object_array: iu,
      sheet_get_cell: uu,
      book_new: du,
      book_append_sheet: pu,
      book_set_sheet_visibility: function (e, t, r) {
        switch (
          (e.Workbook || (e.Workbook = {}),
          e.Workbook.Sheets || (e.Workbook.Sheets = []),
          (t = (function (e, t) {
            if ("number" == typeof t) {
              if (0 <= t && e.SheetNames.length > t) return t;
              throw new Error("Cannot find sheet # " + t);
            }
            if ("string" != typeof t)
              throw new Error("Cannot find sheet |" + t + "|");
            if (-1 < (e = e.SheetNames.indexOf(t))) return e;
            throw new Error("Cannot find sheet name |" + t + "|");
          })(e, t)),
          e.Workbook.Sheets[t] || (e.Workbook.Sheets[t] = {}),
          r)
        ) {
          case 0:
          case 1:
          case 2:
            break;
          default:
            throw new Error("Bad sheet visibility setting " + r);
        }
        e.Workbook.Sheets[t].Hidden = r;
      },
      cell_set_number_format: function (e, t) {
        return (e.z = t), e;
      },
      cell_set_hyperlink: mu,
      cell_set_internal_link: function (e, t, r) {
        return mu(e, "#" + t, r);
      },
      cell_add_comment: function (e, t, r) {
        e.c || (e.c = []), e.c.push({ t: t, a: r || "SheetJS" });
      },
      sheet_set_array_formula: function (e, t, r, a) {
        for (
          var n = "string" != typeof t ? t : Zr(t),
            s = "string" == typeof t ? t : qr(t),
            i = n.s.r;
          i <= n.e.r;
          ++i
        )
          for (var o = n.s.c; o <= n.e.c; ++o) {
            var c = uu(e, i, o);
            (c.t = "n"),
              (c.F = s),
              delete c.v,
              i == n.s.r && o == n.s.c && ((c.f = r), a && (c.D = !0));
          }
        return e;
      },
      consts: { SHEET_VISIBLE: 0, SHEET_HIDDEN: 1, SHEET_VERY_HIDDEN: 2 },
    };
  function bu(e) {
    gu = e;
  }
  var is = {
      to_json: function (t, e) {
        var r = gu({ objectMode: !0 });
        if (null == t || null == t["!ref"]) return r.push(null), r;
        var a,
          n = { t: "n", v: 0 },
          s = 0,
          i = 1,
          o = [],
          c = "",
          l = { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } },
          f = e || {},
          h = null != f.range ? f.range : t["!ref"];
        switch (
          (1 === f.header
            ? (s = 1)
            : "A" === f.header
            ? (s = 2)
            : Array.isArray(f.header) && (s = 3),
          typeof h)
        ) {
          case "string":
            l = Zr(h);
            break;
          case "number":
            (l = Zr(t["!ref"])).s.r = h;
            break;
          default:
            l = h;
        }
        0 < s && (i = 0);
        var u = jr(l.s.r),
          d = [],
          p = 0,
          m = Array.isArray(t),
          g = l.s.r,
          b = 0,
          v = {};
        m && !t[g] && (t[g] = []);
        for (
          var w = (f.skipHidden && t["!cols"]) || [],
            T = (f.skipHidden && t["!rows"]) || [],
            b = l.s.c;
          b <= l.e.c;
          ++b
        )
          if (!(w[b] || {}).hidden)
            switch (((d[b] = Xr(b)), (n = m ? t[g][b] : t[d[b] + u]), s)) {
              case 1:
                o[b] = b - l.s.c;
                break;
              case 2:
                o[b] = d[b];
                break;
              case 3:
                o[b] = f.header[b - l.s.c];
                break;
              default:
                if (
                  ((c = a =
                    ea(
                      (n = null == n ? { w: "__EMPTY", t: "s" } : n),
                      null,
                      f,
                    )),
                  (p = v[a] || 0))
                ) {
                  for (; (c = a + "_" + p++), v[c]; );
                  (v[a] = p), (v[c] = 1);
                } else v[a] = 1;
                o[b] = c;
            }
        return (
          (g = l.s.r + i),
          (r._read = function () {
            for (; g <= l.e.r; )
              if (!(T[g - 1] || {}).hidden) {
                var e = su(t, l, g, d, s, o, m, f);
                if (
                  (++g,
                  !1 === e.isempty ||
                    (1 === s ? !1 !== f.blankrows : f.blankrows))
                )
                  return void r.push(e.row);
              }
            return r.push(null);
          }),
          r
        );
      },
      to_html: function (e, t) {
        var r = gu(),
          a = t || {},
          t = null != a.header ? a.header : Jf,
          n = null != a.footer ? a.footer : qf;
        r.push(t);
        var s = Jr(e["!ref"]);
        (a.dense = Array.isArray(e)), r.push(Zf(0, 0, a));
        var i = s.s.r,
          o = !1;
        return (
          (r._read = function () {
            if (i > s.e.r)
              return o || ((o = !0), r.push("</table>" + n)), r.push(null);
            for (; i <= s.e.r; ) {
              r.push(Kf(e, s, i, a)), ++i;
              break;
            }
          }),
          r
        );
      },
      to_csv: function (e, t) {
        var r = gu(),
          a = null == t ? {} : t;
        if (null == e || null == e["!ref"]) return r.push(null), r;
        var n = Zr(e["!ref"]),
          s = void 0 !== a.FS ? a.FS : ",",
          i = s.charCodeAt(0),
          o = void 0 !== a.RS ? a.RS : "\n",
          c = o.charCodeAt(0),
          l = new RegExp(("|" == s ? "\\|" : s) + "+$"),
          f = "",
          h = [];
        a.dense = Array.isArray(e);
        for (
          var u = (a.skipHidden && e["!cols"]) || [],
            d = (a.skipHidden && e["!rows"]) || [],
            p = n.s.c;
          p <= n.e.c;
          ++p
        )
          (u[p] || {}).hidden || (h[p] = Xr(p));
        var m = n.s.r,
          g = !1,
          b = 0;
        return (
          (r._read = function () {
            if (!g) return (g = !0), r.push("\ufeff");
            for (; m <= n.e.r; )
              if (
                (++m,
                !(d[m - 1] || {}).hidden &&
                  ((f = cu(e, n, m - 1, h, i, c, s, a)),
                  null != f &&
                    ((f = a.strip ? f.replace(l, "") : f) ||
                      !1 !== a.blankrows)))
              )
                return r.push((b++ ? o : "") + f);
            return r.push(null);
          }),
          r
        );
      },
      set_readable: bu,
    },
    vu = (function () {
      function a(e, t, r) {
        return this instanceof a
          ? ((this.tagName = e),
            (this._attributes = t || {}),
            (this._children = r || []),
            (this._prefix = ""),
            this)
          : new a(e, t, r);
      }
      (a.prototype.createElement = function () {
        return new a(arguments);
      }),
        (a.prototype.children = function () {
          return this._children;
        }),
        (a.prototype.append = function (e) {
          return this._children.push(e), this;
        }),
        (a.prototype.prefix = function (e) {
          return 0 == arguments.length
            ? this._prefix
            : ((this._prefix = e), this);
        }),
        (a.prototype.attr = function (e, t) {
          if (null == t) return delete this._attributes[e], this;
          if (0 == arguments.length) return this._attributes;
          if ("string" == typeof e && 1 == arguments.length)
            return this._attributes.attr[e];
          if ("object" == typeof e && 1 == arguments.length)
            for (var r in e) this._attributes[r] = e[r];
          else
            2 == arguments.length &&
              "string" == typeof e &&
              (this._attributes[e] = t);
          return this;
        });
      return (
        (a.prototype.escapeAttributeValue = function (e) {
          return '"' + e.replace(/\"/g, "&quot;") + '"';
        }),
        (a.prototype.toXml = function (e) {
          var t = (e = e || this)._prefix;
          if (((t += "<" + e.tagName), e._attributes))
            for (var r in e._attributes)
              t +=
                " " +
                r +
                "=" +
                this.escapeAttributeValue("" + e._attributes[r]);
          if (e._children && 0 < e._children.length) {
            t += ">";
            for (var a = 0; a < e._children.length; a++)
              t += this.toXml(e._children[a]);
            t += "</" + e.tagName + ">";
          } else t += "/>";
          return t;
        }),
        a
      );
    })(),
    wu = function (e) {
      var t,
        r = 164,
        a = {
          0: "General",
          1: "0",
          2: "0.00",
          3: "#,##0",
          4: "#,##0.00",
          9: "0%",
          10: "0.00%",
          11: "0.00E+00",
          12: "# ?/?",
          13: "# ??/??",
          14: "m/d/yy",
          15: "d-mmm-yy",
          16: "d-mmm",
          17: "mmm-yy",
          18: "h:mm AM/PM",
          19: "h:mm:ss AM/PM",
          20: "h:mm",
          21: "h:mm:ss",
          22: "m/d/yy h:mm",
          37: "#,##0 ;(#,##0)",
          38: "#,##0 ;[Red](#,##0)",
          39: "#,##0.00;(#,##0.00)",
          40: "#,##0.00;[Red](#,##0.00)",
          45: "mm:ss",
          46: "[h]:mm:ss",
          47: "mmss.0",
          48: "##0.0E+0",
          49: "@",
          56: '"上午/下午 "hh"時"mm"分"ss"秒 "',
        },
        n = {};
      for (t in a) n[a[t]] = t;
      var s = {};
      return {
        initialize: function (e) {
          (this.$fonts = vu("fonts")
            .attr("count", 0)
            .attr("x14ac:knownFonts", "1")),
            (this.$fills = vu("fills").attr("count", 0)),
            (this.$borders = vu("borders").attr("count", 0)),
            (this.$numFmts = vu("numFmts").attr("count", 0)),
            (this.$cellStyleXfs = vu("cellStyleXfs")),
            (this.$xf = vu("xf")
              .attr("numFmtId", 0)
              .attr("fontId", 0)
              .attr("fillId", 0)
              .attr("borderId", 0)),
            (this.$cellXfs = vu("cellXfs").attr("count", 0)),
            (this.$cellStyles = vu("cellStyles").append(
              vu("cellStyle")
                .attr("name", "Normal")
                .attr("xfId", 0)
                .attr("builtinId", 0),
            )),
            (this.$dxfs = vu("dxfs").attr("count", "0")),
            (this.$tableStyles = vu("tableStyles")
              .attr("count", "0")
              .attr("defaultTableStyle", "TableStyleMedium9")
              .attr("defaultPivotStyle", "PivotStyleMedium4")),
            (this.$styles = vu("styleSheet")
              .attr(
                "xmlns:mc",
                "http://schemas.openxmlformats.org/markup-compatibility/2006",
              )
              .attr(
                "xmlns:x14ac",
                "http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac",
              )
              .attr(
                "xmlns",
                "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
              )
              .attr("mc:Ignorable", "x14ac")
              .prefix('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
              .append(this.$numFmts)
              .append(this.$fonts)
              .append(this.$fills)
              .append(this.$borders)
              .append(this.$cellStyleXfs.append(this.$xf))
              .append(this.$cellXfs)
              .append(this.$cellStyles)
              .append(this.$dxfs)
              .append(this.$tableStyles));
          var t = e.defaultCellStyle || {};
          t.font || (t.font = { name: "Calibri", sz: "11" }),
            t.font.name || (t.font.name = "Calibri"),
            t.font.sz || (t.font.sz = 11),
            t.fill || (t.fill = { patternType: "none", fgColor: {} }),
            t.border || (t.border = {}),
            t.numFmt || (t.numFmt = 0),
            (this.defaultStyle = t);
          e = JSON.parse(JSON.stringify(t));
          return (
            (e.fill = { patternType: "gray125", fgColor: {} }),
            this.addStyles([t, e]),
            this
          );
        },
        addStyle: function (e) {
          var t = JSON.stringify(e),
            r = s[t];
          return null == r ? ((r = this._addXf(e)), (s[t] = r)) : (r = s[t]), r;
        },
        addStyles: function (e) {
          var t = this;
          return e.map(function (e) {
            return t.addStyle(e);
          });
        },
        _duckTypeStyle: function (e) {
          return "object" == typeof e && (e.patternFill || e.fgColor)
            ? { fill: e }
            : e.font || e.numFmt || e.border || e.fill
            ? e
            : this._getStyleCSS(e);
        },
        _getStyleCSS: function (e) {
          return e;
        },
        _addXf: function (e) {
          var t = this._addFont(e.font),
            r = this._addFill(e.fill),
            a = this._addBorder(e.border),
            n = this._addNumFmt(e.numFmt),
            s = vu("xf")
              .attr("numFmtId", n)
              .attr("fontId", t)
              .attr("fillId", r)
              .attr("borderId", a)
              .attr("xfId", "0");
          0 < t && s.attr("applyFont", "1"),
            0 < r && s.attr("applyFill", "1"),
            0 < a && s.attr("applyBorder", "1"),
            0 < n && s.attr("applyNumberFormat", "1"),
            e.alignment &&
              ((n = vu("alignment")),
              e.alignment.horizontal &&
                n.attr("horizontal", e.alignment.horizontal),
              e.alignment.vertical && n.attr("vertical", e.alignment.vertical),
              e.alignment.indent && n.attr("indent", e.alignment.indent),
              e.alignment.readingOrder &&
                n.attr("readingOrder", e.alignment.readingOrder),
              e.alignment.wrapText && n.attr("wrapText", e.alignment.wrapText),
              null != e.alignment.textRotation &&
                n.attr("textRotation", e.alignment.textRotation),
              s.append(n).attr("applyAlignment", 1)),
            this.$cellXfs.append(s);
          s = +this.$cellXfs.children().length;
          return this.$cellXfs.attr("count", s), s - 1;
        },
        _addFont: function (e) {
          if (!e) return 0;
          var t = vu("font")
            .append(vu("sz").attr("val", e.sz || this.defaultStyle.font.sz))
            .append(
              vu("name").attr("val", e.name || this.defaultStyle.font.name),
            );
          e.bold && t.append(vu("b")),
            e.underline && t.append(vu("u")),
            e.italic && t.append(vu("i")),
            e.strike && t.append(vu("strike")),
            e.outline && t.append(vu("outline")),
            e.shadow && t.append(vu("shadow")),
            e.vertAlign && t.append(vu("vertAlign").attr("val", e.vertAlign)),
            e.color &&
              (e.color.theme
                ? (t.append(vu("color").attr("theme", e.color.theme)),
                  e.color.tint &&
                    t.append(vu("tint").attr("theme", e.color.tint)))
                : e.color.rgb &&
                  t.append(vu("color").attr("rgb", e.color.rgb))),
            this.$fonts.append(t);
          t = this.$fonts.children().length;
          return this.$fonts.attr("count", t), t - 1;
        },
        _addNumFmt: function (e) {
          if (!e) return 0;
          if ("string" == typeof e) {
            var t = n[e];
            if (0 <= t) return t;
          }
          if (/^[0-9]+$/.exec(e)) return e;
          e = e
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
          e = vu("numFmt").attr("numFmtId", ++r).attr("formatCode", e);
          this.$numFmts.append(e);
          e = this.$numFmts.children().length;
          return this.$numFmts.attr("count", e), r;
        },
        _addFill: function (e) {
          if (!e) return 0;
          var t,
            r = vu("patternFill").attr("patternType", e.patternType || "solid");
          e.fgColor &&
            ((t = vu("fgColor")),
            e.fgColor.rgb
              ? (6 == e.fgColor.rgb.length &&
                  (e.fgColor.rgb = "FF" + e.fgColor.rgb),
                t.attr("rgb", e.fgColor.rgb),
                r.append(t))
              : e.fgColor.theme &&
                (t.attr("theme", e.fgColor.theme),
                e.fgColor.tint && t.attr("tint", e.fgColor.tint),
                r.append(t)),
            e.bgColor || (e.bgColor = { indexed: "64" })),
            e.bgColor && ((e = vu("bgColor").attr(e.bgColor)), r.append(e));
          r = vu("fill").append(r);
          this.$fills.append(r);
          r = this.$fills.children().length;
          return this.$fills.attr("count", r), r - 1;
        },
        _getSubBorder: function (e, t) {
          var r = vu(e);
          return (
            t &&
              (r.attr("style", t.style || "medium"),
              t.color &&
                ((e = vu("color")),
                t.color.auto
                  ? e.attr("auto", t.color.auto)
                  : t.color.rgb
                  ? e.attr("rgb", t.color.rgb)
                  : (t.color.theme || t.color.tint) &&
                    (e.attr("theme", t.color.theme || "1"),
                    e.attr("tint", t.color.tint || "0")),
                r.append(e))),
            r
          );
        },
        _addBorder: function (t) {
          if (!t) return 0;
          var r = this,
            a = vu("border")
              .attr("diagonalUp", t.diagonalUp)
              .attr("diagonalDown", t.diagonalDown);
          ["left", "right", "top", "bottom", "diagonal"].forEach(function (e) {
            a.append(r._getSubBorder(e, t[e]));
          }),
            this.$borders.append(a);
          var e = this.$borders.children().length;
          return this.$borders.attr("count", e), e - 1;
        },
        toXml: function () {
          return this.$styles.toXml();
        },
      }.initialize(e || {});
    };
  void 0 !== Nf && (a.parse_xlscfb = Nf),
    (a.parse_zip = zh),
    (a.read = Kh),
    (a.readFile = Jh),
    (a.readFileSync = Jh),
    (a.write = ru),
    (a.writeFile = nu),
    (a.writeFileSync = nu),
    (a.writeFileAsync = function (e, t, r, a) {
      var n = r || {};
      return (
        (n.type = "file"),
        (n.file = e),
        au(n),
        (n.type = "buffer"),
        a instanceof Function || (a = r),
        Se.writeFile(e, ru(t, n), a)
      );
    }),
    (a.utils = Es),
    (a.writeXLSX = tu),
    (a.writeFileXLSX = function (e, t, r) {
      return ((r = r || {}).type = "file"), (r.file = t), au(r), tu(e, r);
    }),
    (a.SSF = e),
    void 0 !== is && (a.stream = is),
    void 0 !== xe && (a.CFB = xe),
    "undefined" == typeof require ||
      (((is = require("stream")) || {}).Readable && bu(is.Readable));
}
if (
  ("undefined" != typeof exports
    ? make_xlsx_lib(exports)
    : "undefined" != typeof module && module.exports
    ? make_xlsx_lib(module.exports)
    : "function" == typeof define && define.amd
    ? define("xlsx", function () {
        return XLSX.version || make_xlsx_lib(XLSX), XLSX;
      })
    : make_xlsx_lib(XLSX),
  "undefined" != typeof window && !window.XLSX)
)
  try {
    window.XLSX = XLSX;
  } catch (e) {}
//# sourceMappingURL=xlsx.bundle.js.map
