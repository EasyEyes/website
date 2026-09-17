"use strict";
(() => {
  var qe = (e) =>
      Array.isArray(e) &&
      e.length === 2 &&
      typeof e[0] == "number" &&
      typeof e[1] == "number",
    Ue = (e, t, n) => {
      let s = Math.sqrt(e[0] * e[0] + e[1] * e[1]);
      if (s == 0) return [0, 0];
      let g = Math.atan2(s / t, n) * (180 / Math.PI);
      return [(e[0] * g) / s, (e[1] * g) / s];
    },
    He = (e, t, n) => {
      let s = Math.sqrt(e[0] * e[0] + e[1] * e[1]);
      if (s >= 90) {
        let g = 89.99999999 / s;
        return He([e[0] * g, e[1] * g], t, n);
      }
      let r = t * n * Math.tan((s * Math.PI) / 180);
      return s == 0 ? [0, 0] : [(e[0] * r) / s, (e[1] * r) / s];
    },
    je = (e) => {
      let t = Ue(
        [
          e.fixationXYPx[0] - e.nearestPointXYZPx[0],
          e.fixationXYPx[1] - e.nearestPointXYZPx[1],
        ],
        e.pxPerCm,
        e.viewingDistanceCm,
      );
      return [-t[0], -t[1]];
    },
    T = (e, t) => {
      let n = je(t),
        s = (r) => {
          let g = [r[0] - n[0], r[1] - n[1]],
            o = He(g, t.pxPerCm, t.viewingDistanceCm);
          return [o[0] + t.nearestPointXYZPx[0], o[1] + t.nearestPointXYZPx[1]];
        };
      return qe(e) ? s(e) : e.map(s);
    },
    I = (e, t) => {
      let n = je(t),
        s = (r) => {
          let g = [
              r[0] - t.nearestPointXYZPx[0],
              r[1] - t.nearestPointXYZPx[1],
            ],
            o = Ue(g, t.pxPerCm, t.viewingDistanceCm);
          return [o[0] + n[0], o[1] + n[1]];
        };
      return qe(e) ? s(e) : e.map(s);
    };
  var Fe = (e) => {
      e.charCodeAt(0) === 65279 && (e = e.slice(1));
      let t = [],
        n = [],
        s = "",
        r = !1,
        g = () => {
          n.push(s.trim()), (s = "");
        },
        o = () => {
          (n.length > 1 || n[0] !== "") && t.push(n), (n = []);
        };
      for (let c = 0; c < e.length; c++) {
        let u = e[c];
        r
          ? u === '"'
            ? e[c + 1] === '"'
              ? ((s += '"'), c++)
              : (r = !1)
            : (s += u)
          : u === '"'
          ? (r = !0)
          : u === ","
          ? g()
          : u ===
              `
` || u === "\r"
          ? (u === "\r" &&
              e[c + 1] ===
                `
` &&
              c++,
            g(),
            o())
          : (s += u);
      }
      return g(), o(), { header: t[0] ?? [], rows: t.slice(1) };
    },
    H = (e) => {
      if (e === void 0) return;
      let t = Number(e);
      return Number.isFinite(t) ? t : void 0;
    },
    Ge = (e) => {
      let t = e.match(/(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
      if (!t) return;
      let n = Number(t[1]),
        s = Number(t[2]);
      return Number.isFinite(n) && Number.isFinite(s) ? [n, s] : void 0;
    },
    mt = (e) => {
      let t = e.match(
        /\[\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*,\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*\]/,
      );
      if (!t) return;
      let n = t.slice(1).map(Number);
      return n.every(Number.isFinite)
        ? [
            [n[0], n[1]],
            [n[2], n[3]],
          ]
        : void 0;
    },
    ft = (e, t, n) => [e[0] - t / 2, n / 2 - e[1]],
    _e = (e, t, n = [], s = !1) => {
      let r = [
          [-t.screenW / 2, -t.screenH / 2],
          [t.screenW / 2, t.screenH / 2],
        ],
        g = s ? 3 : 2,
        o = (i) => ({
          pxPerCm: t.pxPerCm,
          viewingDistanceCm: s ? i[2] : t.viewingDistanceCm,
          fixationXYPx: t.fixationXYPx ?? [0, 0],
          nearestPointXYZPx: [i[0], i[1]],
        }),
        c = (i) => {
          let $ = 0;
          for (let v = 0; v < 2; v++) {
            let O = I(r[v], o(i)),
              M = O[0] - e[v][0],
              A = O[1] - e[v][1];
            $ += M * M + A * A;
          }
          return Math.sqrt($);
        },
        u = (i) => (s ? [...i, t.viewingDistanceCm] : [...i]),
        d = [
          ...n.map((i) => u([...i])),
          u([0, 0]),
          u([t.screenW / 2, t.screenH / 2]),
          u([t.screenW / 4, t.screenH / 4]),
        ],
        m = d[0],
        b = c(m);
      for (let i of d.slice(1)) {
        let $ = c(i);
        $ < b && ((b = $), (m = i));
      }
      let y = Math.max(t.screenW, t.screenH) / 8;
      for (; y >= 0.25; ) {
        let i = !0;
        for (; i; ) {
          i = !1;
          for (let $ = 0; $ < g; $++)
            for (let v of [1, -1]) {
              let O = [...m];
              O[$] += v * y;
              let M = c(O);
              M < b - 1e-12 && ((b = M), (m = O), (i = !0));
            }
        }
        y /= 2;
      }
      return {
        nearest: [m[0], m[1]],
        viewingDistanceCm: m[2] ?? t.viewingDistanceCm,
        residualDeg: b,
      };
    },
    Te = 0.15,
    Ce = 150,
    We = 2.5,
    Ze = 3,
    Ve = (e, t, n) =>
      e[0] > 0.1 * t && e[0] < 0.9 * t && e[1] > -0.25 * n && e[1] < 0.95 * n,
    pt = (e, t, n) => Math.abs(e[0]) < 0.4 * t && Math.abs(e[1]) < 0.4 * n,
    xt = (e, t, n) => {
      if (
        (e("fixationLocationStrategy") ?? "centerFixation") !== "centerFixation"
      )
        return [0, 0];
      let r = (e("fixationOriginXYScreen") ?? "0.5, 0.5").match(
        /([\d.]+)\s*,\s*([\d.]+)/,
      );
      if (!r) return [0, 0];
      let g = Number(r[1]),
        o = Number(r[2]),
        c = H(e("targetImageSpareFraction") ?? "");
      if (c && c > 0) {
        let u = e("targetImageWhere") ?? "top",
          d = 0,
          m = 1,
          b = 0,
          y = 1;
        u === "top"
          ? (b = c)
          : u === "bottom"
          ? (y = 1 - c)
          : u === "left"
          ? (m = 1 - c)
          : (d = c),
          (g = d + g * (m - d)),
          (o = b + o * (y - b));
      }
      return [
        Math.round((2 * g - 1) * (t / 2)),
        Math.round((2 * o - 1) * (n / 2)),
      ];
    },
    K = (e) => ({
      status: "FLAGGED",
      statusReason: e,
      columns: { repairStatus: "FLAGGED", repairStatusReason: e },
    }),
    Qe = (e) => {
      let { header: t, rows: n } = Fe(e),
        s = (h) => t.indexOf(h),
        r = (h, l) => {
          let a = s(l);
          if (a < 0) return;
          let p = h[a];
          return p === "" ? void 0 : p;
        },
        g = (h) => {
          for (let l of n) {
            let a = r(l, h);
            if (a !== void 0) return a;
          }
        },
        o = H(g("screenWidthPx")),
        c = H(g("screenHeightPx")),
        u = H(g("pxPerCm")),
        d = "2025-08-30",
        m = "2026-09-15",
        b = g("date") ?? "",
        y = b.match(/(\d{4})-(\d{2})-(\d{2})/),
        i = y ? `${y[1]}-${y[2]}-${y[3]}` : "",
        $ = !!i && i < d,
        v = !!i && i < m,
        O = [
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
        M = n.map((h) => [...h]),
        A = new Map();
      M.forEach((h) => {
        for (let l of O) {
          let a = s(l);
          if (a < 0) continue;
          let p = h[a];
          p !== "" && p !== void 0
            ? A.set(l, p)
            : A.has(l) && (h[a] = A.get(l));
        }
      });
      let D = (h, l) => {
          let a = s(l);
          if (a < 0) return;
          let p = h[a];
          return p === "" ? void 0 : p;
        },
        w = n.map(() => K("not assessed")),
        Z = 0,
        q = 0,
        x = 0;
      n.forEach((h, l) => {
        let a = M[l],
          p = D(a, "nearpointXYPxAppleCoords"),
          E = D(a, "screenBoundingRectDeg"),
          L = D(a, "nearestXYPx"),
          Y = H(D(a, "targetEccentricityXDeg")),
          k = H(D(a, "targetEccentricityYDeg")),
          ee = H(D(a, "markingFixationMotionRadiusDeg")),
          U = D(a, "thresholdParameter"),
          _ = H(D(a, "level")),
          ae =
            H(D(a, "distanceCm")) ??
            H(D(a, "viewingDistancePredictedCm")) ??
            H(g("viewingDistanceDesiredCm")),
          V = xt((f) => D(a, f), o, c);
        if ($) {
          w[l] = {
            status: "UNAFFECTED",
            statusReason: `run predates the bug (date ${b.slice(
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
        if (
          !(o && o > 0) ||
          !(c && c > 0) ||
          !(u && u > 0) ||
          !(ae && ae > 0)
        ) {
          w[l] = K(
            "missing apparatus columns (pxPerCm/screenWidthPx/screenHeightPx/distance)",
          );
          return;
        }
        let z = p ? Ge(p) : void 0,
          te = E ? mt(E) : void 0;
        if (
          z &&
          !L &&
          Math.abs(z[0] - o / 2) <= We &&
          Math.abs(z[1] - c / 2) <= We
        ) {
          w[l] = {
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
        if (!te) {
          w[l] = K(
            z
              ? "no screenBoundingRectDeg, non-center apple \u2014 window size unknown"
              : "no nearest-point data on this row or prior (metadata row?)",
          );
          return;
        }
        let Q = z ? [z[0] - o / 2, c / 2 - z[1]] : void 0,
          ne = {
            pxPerCm: u,
            viewingDistanceCm: ae,
            screenW: o,
            screenH: c,
            fixationXYPx: V,
          },
          se = _e(te, ne, Q ? [Q] : []),
          ie = ae,
          ue = "";
        if (se.residualDeg > Te) {
          let f = _e(te, ne, Q ? [Q] : [], !0);
          f.residualDeg <= Te &&
            f.viewingDistanceCm >= 15 &&
            f.viewingDistanceCm <= 250 &&
            ((se = f),
            (ie = f.viewingDistanceCm),
            (ue = `; rect fit moved viewing distance ${ae.toFixed(
              1,
            )}->${ie.toFixed(1)} cm`));
        }
        if (se.residualDeg > Te) {
          w[l] = K(
            `screenBoundingRectDeg not reproducible (fit residual ${se.residualDeg.toFixed(
              3,
            )} deg). Likely cause: viewing distance at logging time differed, or the (unlogged) random fixation offset was nonzero \u2014 neither recoverable from this file.`,
          );
          return;
        }
        let S = se.nearest,
          le = !0;
        Q && (le = Math.abs(Q[0] - S[0]) <= Ze && Math.abs(Q[1] - S[1]) <= Ze);
        let ce = le
          ? ""
          : " (appleCoords disagrees \u2014 non-fullscreen window; rect fit used)";
        if (!L && Math.abs(S[0]) <= 5 && Math.abs(S[1]) <= 5) {
          w[l] = {
            status: "UNAFFECTED",
            statusReason:
              "nearest point at screen center [0,0]; bug never active" + ce,
            nearestUsedXY: [0, 0],
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "nearest point at screen center [0,0]",
            },
          };
          return;
        }
        let ye = Ve(S, o, c),
          ge = pt(S, o, c),
          re,
          W = S;
        if (L) {
          let f = Ge(L);
          if (!f) {
            w[l] = K("nearestXYPx column unparseable");
            return;
          }
          let F = Math.hypot(f[0] - S[0], f[1] - S[1]),
            P = [S[0] + o / 2, c / 2 - S[1]],
            B = Math.hypot(f[0] - P[0], f[1] - P[1]),
            J = Math.abs(S[0]) <= 5 && Math.abs(S[1]) <= 5;
          if (v) {
            if (!J && F > Ce && B > Ce) {
              w[l] = K(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${Math.min(
                  F,
                  B,
                ).toFixed(0)} px)`,
              );
              return;
            }
            (re = !0), (W = f);
          } else if (ye && !ge) {
            if (F > Ce) {
              w[l] = K(
                `nearestXYPx (trial time) inconsistent with condition-row geometry (drift ${F.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            (re = !0), (W = f);
          } else if (ge && !ye) {
            if (B > Ce) {
              w[l] = K(
                `trial-time nearestXYPx inconsistent with condition geometry (drift ${B.toFixed(
                  0,
                )} px)`,
              );
              return;
            }
            re = !1;
          } else {
            w[l] = K(
              "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
                ce,
            );
            return;
          }
        } else if (ye && !ge) re = !0;
        else if (ge && !ye) re = !1;
        else {
          w[l] = K(
            "ambiguous: nearest fits raw rc (buggy) and converted (fixed) equally" +
              ce,
          );
          return;
        }
        if (re && !v && !Ve(W, o, c)) {
          w[l] = K(
            "nearest outside plausible rc band \u2014 not corrected" + ce,
          );
          return;
        }
        if (re && !L && S.some((f) => f !== 0)) {
          w[l] = K(
            "buggy session; no stimulus-time nearestXYPx on this row \u2014 live eye unknown" +
              ce,
          );
          return;
        }
        if (!re) {
          w[l] = {
            status: "UNAFFECTED",
            statusReason: "fix already applied (converted nearest used)" + ce,
            nearestUsedXY: S,
            columns: {
              repairStatus: "UNAFFECTED",
              repairStatusReason: "fixed-code run",
            },
          };
          return;
        }
        if (ee !== void 0 && ee > 0) {
          w[l] = K(
            "moving crosshair (markingFixationMotionRadiusDeg > 0); per-frame fixation unknown",
          );
          return;
        }
        let oe = ft(W, o, c),
          me = H(D(a, "distanceCm")) ?? ie,
          fe = {
            pxPerCm: u,
            viewingDistanceCm: me,
            fixationXYPx: V,
            nearestPointXYZPx: W,
          },
          pe = { ...fe, nearestPointXYZPx: oe },
          C = {},
          N = {
            status: "CORRECTED",
            statusReason:
              "nearest recovered; corrected (static fixation assumed \u2014 random offset not logged)" +
              ce +
              ue,
            nearestUsedXY: W,
            nearestCorrectXY: oe,
            columns: C,
          },
          xe = (f, F, P) => {
            if (!(P > 0) || !Number.isFinite(P)) return;
            let B = T(f, fe),
              J = T([f[0] + F[0] * P, f[1] + F[1] * P], fe),
              ve = I(B, pe),
              Ee = I(J, pe);
            return Math.hypot(Ee[0] - ve[0], Ee[1] - ve[1]);
          },
          R = Y !== void 0 && k !== void 0 ? [Y, k] : void 0;
        if (R) {
          let f = T(R, fe),
            F = I(f, pe);
          (N.actualTargetEccentricityXDeg = F[0]),
            (N.actualTargetEccentricityYDeg = F[1]),
            (C.actualTargetEccentricityXDeg = F[0].toFixed(4)),
            (C.actualTargetEccentricityYDeg = F[1].toFixed(4)),
            (C.drawnTargetXYPx = `${f[0].toFixed(1)}, ${f[1].toFixed(1)}`);
          let P = T(R, pe);
          C.correctedTargetXYPx = `${P[0].toFixed(1)}, ${P[1].toFixed(1)}`;
        }
        let we = R
            ? (() => {
                let f = Math.hypot(R[0], R[1]) || 1;
                return [R[0] / f, R[1] / f];
              })()
            : [1, 0],
          Xe = [-we[1], we[0]],
          Pe = _ === void 0 ? NaN : Math.pow(10, _);
        if (R && U === "spacingDeg") {
          let f = D(a, "spacingDirection") ?? "radial",
            P = xe(
              R,
              ((B) =>
                B.includes("horizontal")
                  ? [1, 0]
                  : B.includes("vertical")
                  ? [0, 1]
                  : B.includes("tangential")
                  ? Xe
                  : we)(f),
              Pe,
            );
          if (
            (P !== void 0 &&
              ((N.actualSpacingDeg = P),
              (N.actualLevelLog10Deg = Math.log10(P)),
              (C.actualSpacingDeg = P.toFixed(4)),
              (C.actualLevelLog10Deg = N.actualLevelLog10Deg.toFixed(4))),
            /And/.test(f))
          ) {
            let B = f.includes("radial") ? Xe : [1, 0],
              J = xe(R, B, Pe);
            J !== void 0 && (C.actualSpacingSecondaryDeg = J.toFixed(4));
          }
        }
        if (R && U === "targetSizeDeg") {
          let F = /true/i.test(D(a, "targetSizeIsHeightBool") ?? "FALSE")
              ? [0, 1]
              : [1, 0],
            P = xe(R, F, Pe);
          P !== void 0 &&
            ((N.actualSizeDeg = P),
            (N.actualLevelLog10Deg = Math.log10(P)),
            (C.actualSizeDeg = P.toFixed(4)),
            (C.actualLevelLog10Deg = N.actualLevelLog10Deg.toFixed(4)));
        }
        if (
          R &&
          U === "targetEccentricityXDeg" &&
          N.actualTargetEccentricityXDeg !== void 0
        ) {
          let f = Math.hypot(
            N.actualTargetEccentricityXDeg,
            N.actualTargetEccentricityYDeg ?? 0,
          );
          (N.actualLevelLog10Deg = Math.log10(f)),
            (C.actualLevelLog10Deg = N.actualLevelLog10Deg.toFixed(4));
        }
        if (R && U === "targetOffsetDeg") {
          let f = xe(R, [1, 0], Pe);
          f !== void 0 &&
            ((N.actualLevelLog10Deg = Math.log10(f)),
            (C.actualLevelLog10Deg = N.actualLevelLog10Deg.toFixed(4)));
        }
        let gt = (() => {
            let f = D(a, "spacingDirection") ?? "radial";
            return f.includes("horizontal")
              ? [1, 0]
              : f.includes("vertical")
              ? [0, 1]
              : f.includes("tangential")
              ? Xe
              : we;
          })(),
          Le = H(D(a, "spacingDeg") ?? "");
        if (R && Le !== void 0 && Le > 0 && U !== "spacingDeg") {
          let f = xe(R, gt, Le);
          f !== void 0 && (C.actualSpacingDegNominal = f.toFixed(4));
        }
        let Ye = H(D(a, "targetSizeDeg") ?? "");
        if (R && Ye !== void 0 && Ye > 0 && U !== "targetSizeDeg") {
          let f = /true/i.test(D(a, "targetSizeIsHeightBool") ?? "FALSE"),
            F = xe(R, f ? [0, 1] : [1, 0], Ye);
          F !== void 0 && (C.actualSizeDegNominal = F.toFixed(4));
        }
        let Se = H(D(a, "flankerSpacingDeg") ?? "");
        if (R && Se !== void 0 && Se > 0) {
          let f = xe(R, we, Se);
          f !== void 0 && (C.actualFlankerSpacingDeg = f.toFixed(4));
        }
        {
          let f = I([-o / 2, -c / 2], pe),
            F = I([o / 2, c / 2], pe);
          C.screenBoundingRectDegCorrected = `[(${f[0].toFixed(
            4,
          )}, ${f[1].toFixed(4)}), (${F[0].toFixed(4)}, ${F[1].toFixed(4)})]`;
        }
        if (
          D(a, "gazeMeasuredXDeg") !== "" ||
          D(a, "gazeMeasuredYDeg") !== "" ||
          D(a, "gazeMeasuredRawDeg") !== ""
        )
          if (!le)
            N.statusReason += "; gaze left as logged (window size unknown)";
          else {
            let f = (he) => {
                let $e = T(he, fe);
                return I($e, pe);
              },
              F = H(D(a, "gazeMeasuredXDeg")),
              P = H(D(a, "gazeMeasuredYDeg")),
              B,
              J;
            if (
              (F !== void 0 &&
                ((B = f([F, P ?? 0])), (C.gazeMeasuredXDeg = B[0].toFixed(5))),
              P !== void 0 &&
                ((J = f([F ?? 0, P])), (C.gazeMeasuredYDeg = J[1].toFixed(5))),
              B !== void 0 || J !== void 0)
            ) {
              let he = B ? B[0] : F,
                $e = J ? J[1] : P;
              C.gazeMeasuredRDeg = Math.hypot(he, $e).toFixed(5);
            }
            let ve = B !== void 0 || J !== void 0,
              Ee = D(a, "gazeMeasuredRawDeg");
            if (Ee !== "")
              try {
                let he = JSON.parse(Ee);
                Array.isArray(he) &&
                  he.length > 0 &&
                  ((C.gazeMeasuredRawDeg = JSON.stringify(
                    he.map(($e) => {
                      let Ie = f([Number($e[0]), Number($e[1])]);
                      return [
                        Number(Ie[0].toFixed(5)),
                        Number(Ie[1].toFixed(5)),
                      ];
                    }),
                  )),
                  (ve = !0));
              } catch {}
            ve &&
              (N.statusReason +=
                "; gaze corrected via stimulus-time eye position (gaze-time position not logged)");
          }
        (C.repairStatus = "CORRECTED"),
          (C.repairStatusReason = N.statusReason),
          (C.nearestUsedXY = `${W[0].toFixed(1)}, ${W[1].toFixed(1)}`),
          (C.nearestCorrectXY = `${oe[0].toFixed(1)}, ${oe[1].toFixed(1)}`),
          (w[l] = N);
      });
      for (let h of w)
        h.status === "CORRECTED" ? Z++ : h.status === "UNAFFECTED" ? q++ : x++;
      return {
        rows: w,
        summary: { total: w.length, corrected: Z, unaffected: q, flagged: x },
      };
    },
    ht = [
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
    Je = (e) => (/[",\r\n]/.test(e) ? `"${e.replace(/"/g, '""')}"` : e),
    bt = {
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
    et = (e, t) => {
      let { header: n, rows: s } = Fe(e),
        r = s.map((d) => [...d]),
        g = new Set();
      s.forEach((d, m) => {
        let b = t.rows[m].columns,
          y = [];
        for (let [i, $] of Object.entries(bt)) {
          if (!(i in b)) continue;
          let v = n.indexOf($);
          v >= 0 && ((r[m][v] = b[i]), g.add(i), y.includes($) || y.push($));
        }
        y.length && (b.repairImputedColumns = y.join("; "));
      });
      let o = ht.filter(
          (d) => !g.has(d) && s.some((m, b) => d in t.rows[b].columns),
        ),
        c = o.map((d) =>
          n.includes(d) ? `repair${d[0].toUpperCase()}${d.slice(1)}` : d,
        );
      return [
        [...n, ...c].join(","),
        ...r.map((d, m) =>
          [
            ...d.map(Je),
            ...c.map((b, y) => Je(t.rows[m].columns[o[y]] ?? "")),
          ].join(","),
        ),
      ].join(`
`);
    },
    Ke = (e) => e.sort((t, n) => t - n)[Math.floor(e.length / 2)],
    tt = (e, t) => {
      let { header: n, rows: s } = Fe(e),
        r = n.indexOf("targetEccentricityXDeg"),
        g = n.indexOf("targetEccentricityYDeg"),
        o = n.indexOf("level"),
        c = [],
        u = [],
        d = 0;
      s.forEach((b, y) => {
        let i = t.rows[y];
        if (i.status === "CORRECTED") {
          if ((d++, r >= 0 && i.actualTargetEccentricityXDeg !== void 0)) {
            let $ = Math.hypot(Number(b[r]), Number(b[g])),
              v = Math.hypot(
                i.actualTargetEccentricityXDeg,
                i.actualTargetEccentricityYDeg ?? 0,
              );
            $ > 0 && Number.isFinite($) && c.push(((v - $) / $) * 100);
          }
          if (o >= 0 && i.actualLevelLog10Deg !== void 0) {
            let $ = Math.pow(10, Number(b[o])),
              v = Math.pow(10, i.actualLevelLog10Deg);
            $ > 0 && Number.isFinite($) && u.push(((v - $) / $) * 100);
          }
        }
      });
      let m = { correctedTrials: d };
      return (
        c.length &&
          (m.eccentricityErrPct = [Ke(c), Math.max(...c.map(Math.abs))]),
        u.length &&
          (m.sizeSpacingInflationPct = [Ke(u), Math.max(...u.map(Math.abs))]),
        m
      );
    };
  var X = (e, t = 1) => (e == null || !Number.isFinite(e) ? "" : e.toFixed(t)),
    ze = (e) => `${e >= 0 ? "+" : ""}${X(e)}%`,
    G = (e) =>
      String(e)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    Me = (e, t, n) =>
      `<span class="pill ${e}"${n ? ` data-tip="${G(n)}"` : ""}>${G(t)}</span>`,
    yt = (e, t, n) => {
      let s = [],
        r = (g) => {
          let o = n.indexOf(g);
          return o >= 0 ? t[o] : "";
        };
      return (
        e.status === "CORRECTED" &&
          (e.nearestUsedXY &&
            e.nearestCorrectXY &&
            s.push(
              `eye used (${X(e.nearestUsedXY[0], 0)}, ${X(
                e.nearestUsedXY[1],
                0,
              )}) px; true (${X(e.nearestCorrectXY[0], 0)}, ${X(
                e.nearestCorrectXY[1],
                0,
              )}) px`,
            ),
          e.actualTargetEccentricityXDeg !== void 0 &&
            (s.push(
              `position asked (${r("targetEccentricityXDeg")}, ${r(
                "targetEccentricityYDeg",
              )})\xB0 \u2192 drew (${
                e.columns.drawnTargetXYPx
              }) px = truly (${X(e.actualTargetEccentricityXDeg, 2)}, ${X(
                e.actualTargetEccentricityYDeg,
                2,
              )})\xB0`,
            ),
            e.columns.correctedTargetXYPx &&
              s.push(
                `to place as asked: (${e.columns.correctedTargetXYPx}) px`,
              )),
          e.actualLevelLog10Deg !== void 0 &&
            s.push(
              `size/spacing asked ${X(
                Math.pow(10, Number(r("level"))),
                2,
              )}\xB0 \u2192 showed ${X(
                Math.pow(10, e.actualLevelLog10Deg),
                2,
              )}\xB0`,
            )),
        s.push(e.statusReason),
        s.join(`
`)
      );
    },
    $t = {
      CORRECTED: ["corrected", "st-corrected"],
      UNAFFECTED: ["unaffected", "st-unaffected"],
      FLAGGED: ["flagged", "st-flagged"],
    },
    nt = {
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
    at = (e) => {
      let t = new Set();
      for (let n of Object.keys(e.columns)) n in nt && t.add(nt[n]);
      return [...t];
    },
    ke = (e, t) =>
      t === void 0 || t === ""
        ? `<span class="ov">${G(e)}</span>`
        : `<span class="ov">${G(
            e,
          )}</span><span class="arw">\u2192</span><span class="nv">${G(
            t,
          )}</span>`,
    Dt = (e, t, n, s) => {
      let r = (M) => {
          let A = n.indexOf(M);
          return A >= 0 ? t[A] : "";
        },
        [g, o] = $t[e.status],
        c = yt(e, t, n),
        u =
          r("targetEccentricityXDeg") !== ""
            ? `(${r("targetEccentricityXDeg")}, ${r(
                "targetEccentricityYDeg",
              )})\xB0`
            : "",
        d =
          e.actualTargetEccentricityXDeg !== void 0
            ? `(${X(e.actualTargetEccentricityXDeg, 2)}, ${X(
                e.actualTargetEccentricityYDeg,
                2,
              )})\xB0`
            : void 0,
        m =
          r("level") !== "" && Number.isFinite(Number(r("level")))
            ? X(Number(r("level")), 3)
            : r("level"),
        b =
          e.actualLevelLog10Deg !== void 0
            ? X(e.actualLevelLog10Deg, 3)
            : void 0,
        y = r("screenBoundingRectDeg"),
        i = e.columns.screenBoundingRectDegCorrected,
        $ = at(e)
          .map((M) => `<span class="pchip">${G(M)}</span>`)
          .join(""),
        v =
          e.status === "FLAGGED" || e.status === "UNAFFECTED"
            ? `<td class="reason">${G(e.statusReason)}</td>`
            : '<td class="reason"></td>',
        O = d !== void 0 || b !== void 0;
      return `<tr data-st="${e.status}" class="${
        O ? "r-diff" : ""
      }" data-tip="${G(c)}">
    <td>${s + 1}</td>
    <td>${Me(o, g, c)}</td>
    <td class="${d !== void 0 ? "diff" : ""}">${ke(u, d)}</td>
    <td class="${b !== void 0 ? "diff" : ""}">${ke(m, b)}</td>
    <td class="rect ${i ? "diff" : ""}">${ke(y, i)}</td>
    <td class="chipscell">${$}</td>
    ${v}
  </tr>`;
    },
    st = (e, t, n) => {
      if (!e.length) return "";
      let s = 300,
        r = 220,
        g = 34,
        o = e.map((i) => i[0]),
        c = e.map((i) => i[1]),
        u = Math.max(...o, ...c) * 1.1 || 1,
        d = (i) => g + (i / u) * (s - g - 8),
        m = (i) => r - g + 8 - (i / u) * (r - g - 8),
        b = e
          .map(
            (i) =>
              `<circle cx="${d(i[0]).toFixed(1)}" cy="${m(i[1]).toFixed(
                1,
              )}" r="3.5" fill="#b26a00" fill-opacity="0.85"><title>asked ${i[0].toFixed(
                2,
              )}\xB0, actually showed ${i[1].toFixed(2)}\xB0 (${ze(
                ((i[1] - i[0]) / i[0]) * 100,
              )})</title></circle>`,
          )
          .join(""),
        y = [0, u / 2, u]
          .map(
            (i) =>
              `<line x1="${d(i)}" y1="${m(0)}" x2="${d(i)}" y2="${
                m(0) + 4
              }" stroke="#999"/><text x="${d(i)}" y="${
                m(0) + 15
              }" font-size="9" text-anchor="middle" fill="#666">${i.toFixed(
                1,
              )}</text><line x1="${d(0) - 4}" y1="${m(i)}" x2="${d(0)}" y2="${m(
                i,
              )}" stroke="#999"/><text x="${d(0) - 6}" y="${
                m(i) + 3
              }" font-size="9" text-anchor="end" fill="#666">${i.toFixed(
                1,
              )}</text>`,
          )
          .join("");
      return `<svg width="${s}" height="${r}" class="plot" role="img">
    <line x1="${d(0)}" y1="${m(0)}" x2="${d(u)}" y2="${m(
      u,
    )}" stroke="#2e7d32" stroke-dasharray="4 3"/>
    <text x="${d(u * 0.82)}" y="${
      m(u * 0.82) - 6
    }" font-size="9" fill="#2e7d32">no error</text>
    <line x1="${d(0)}" y1="${m(0)}" x2="${d(u)}" y2="${m(0)}" stroke="#bbb"/>
    <line x1="${d(0)}" y1="${m(0)}" x2="${d(0)}" y2="${m(u)}" stroke="#bbb"/>
    ${y}${b}
    <text x="${s / 2}" y="${
      r - 2
    }" font-size="10" text-anchor="middle" fill="#444">${G(t)}</text>
    <text x="10" y="${
      r / 2
    }" font-size="10" text-anchor="middle" fill="#444" transform="rotate(-90 10 ${
      r / 2
    })">${G(n)}</text>
  </svg>`;
    },
    it = (e, t) => {
      let n = new Blob([t], { type: "text/csv" }),
        s = document.createElement("a");
      (s.href = URL.createObjectURL(n)),
        (s.download = e),
        s.click(),
        setTimeout(() => URL.revokeObjectURL(s.href), 5e3);
    },
    rt = document.getElementById("results"),
    de = document.createElement("div");
  de.className = "rtip";
  document.body.appendChild(de);
  var ct = (e) => {
    let n = de.getBoundingClientRect(),
      s = e.clientX + 14,
      r = e.clientY - n.height / 2;
    s + n.width > innerWidth - 8 && (s = e.clientX - n.width - 14),
      (r = Math.min(Math.max(r, 8), innerHeight - n.height - 8)),
      (de.style.left = s + "px"),
      (de.style.top = r + "px");
  };
  document.body.addEventListener("mouseover", (e) => {
    let t = e.target.closest("[data-tip]");
    t &&
      ((de.innerHTML = G(t.getAttribute("data-tip")).replace(/\n/g, "<br>")),
      (de.style.display = "block"),
      ct(e));
  });
  document.body.addEventListener("mousemove", (e) => {
    de.style.display === "block" && ct(e);
  });
  document.body.addEventListener("mouseout", (e) => {
    e.target.closest("[data-tip]") && (de.style.display = "none");
  });
  var Re = [],
    ot = (e) => {
      let t = new FileReader();
      (t.onload = () => {
        let n = String(t.result),
          s;
        try {
          s = Qe(n);
        } catch (a) {
          rt.insertAdjacentHTML(
            "beforeend",
            `<div class="card"><div class="fname">${G(e.name)}</div>
         <div class="wrong st-flagged-bg">Could not parse: ${G(
           a.message,
         )}</div></div>`,
          );
          return;
        }
        let { header: r, rows: g } = Fe(n),
          o = s.summary,
          c = tt(n, s),
          u = [
            o.corrected
              ? Me(
                  "st-corrected",
                  `${o.corrected} corrected`,
                  "These trials were recorded with the warped conversion. The imputed CSV replaces the requested values with what was truly shown.",
                )
              : "",
            o.unaffected
              ? Me(
                  "st-unaffected",
                  `${o.unaffected} unaffected`,
                  "These trials were not affected by the bug (e.g. eye at screen center, untracked session, or recorded after the fix).",
                )
              : "",
            o.flagged
              ? Me(
                  "st-flagged",
                  `${o.flagged} flagged`,
                  "The tool cannot prove what was shown on these rows \u2014 nothing was changed; see reasons in the row details.",
                )
              : "",
          ].join(" "),
          d = "";
        if (c.correctedTrials > 0) {
          let a = [];
          c.eccentricityErrPct &&
            a.push(
              `position off by median ${X(
                Math.abs(c.eccentricityErrPct[0]),
              )}% (max ${X(c.eccentricityErrPct[1])}%)`,
            ),
            c.sizeSpacingInflationPct &&
              a.push(
                `size/spacing off by median ${X(
                  Math.abs(c.sizeSpacingInflationPct[0]),
                )}% (max ${X(c.sizeSpacingInflationPct[1])}%)`,
              ),
            (d = `<div class="wrong st-corrected-bg">On the ${
              c.correctedTrials
            } corrected trial${
              c.correctedTrials > 1 ? "s" : ""
            }, what was shown differed from what was requested: ${a.join(
              "; ",
            )}.</div>`);
        }
        let m = 400,
          b = o.corrected + o.flagged,
          y = b > 0 && b < o.total,
          i = s.rows
            .map((a, p) => Dt(a, g[p], r, p))
            .map((a) =>
              y && a.includes('data-st="UNAFFECTED"')
                ? a.replace("<tr ", '<tr class="r-hidden" ')
                : a,
            )
            .slice(0, m)
            .join(""),
          $ = new Map();
        s.rows.forEach((a) => {
          if (a.status === "CORRECTED")
            for (let p of at(a)) $.set(p, ($.get(p) || 0) + 1);
        });
        let v = $.size
            ? `<div class="pstrip"><b>Corrected parameters:</b> ${[...$]
                .map(
                  ([a, p]) =>
                    `<span class="pchip big">${G(a)} <b>\xD7${p}</b></span>`,
                )
                .join(
                  "",
                )}<span class="hint">Corrected values are imputed into these original columns, so your existing analysis works unchanged; the added <code>repairImputedColumns</code> column lists what changed on each row. Your source file is untouched.</span></div>`
            : "",
          O = `<div class="rowswrap">
      <div class="rowscap">Row-by-row details \u2014 ${
        o.total
      } rows; hover for derivations</div>
      <label class="rowtoggle"><input type="checkbox" ${
        y ? "checked" : ""
      }/> show only affected rows (corrected + flagged)</label>
      <table><thead><tr>
        <th>#</th><th>status</th>
        <th title="requested (muted) \u2192 actually shown (green), in degrees">target position</th>
        <th title="requested (muted) \u2192 actually shown (green), log10 degrees">level</th>
        <th title="as logged (muted) \u2192 corrected (green), degrees">bounding rect</th>
        <th title="parameters this row carries corrections for">corrected</th>
        <th>reason</th></tr></thead>
      <tbody>${i}</tbody></table>
      ${o.total > m ? `<div class="note">Showing first ${m} rows.</div>` : ""}
      </div>`,
          M = r.indexOf("targetEccentricityXDeg"),
          A = r.indexOf("targetEccentricityYDeg"),
          D = r.indexOf("level"),
          w = [],
          Z = [];
        s.rows.forEach((a, p) => {
          if (a.status === "CORRECTED") {
            if (M >= 0 && a.actualTargetEccentricityXDeg !== void 0) {
              let E = Math.hypot(Number(g[p][M]), Number(g[p][A])),
                L = Math.hypot(
                  a.actualTargetEccentricityXDeg,
                  a.actualTargetEccentricityYDeg ?? 0,
                );
              E > 0 && Number.isFinite(E) && w.push([E, L]);
            }
            if (D >= 0 && a.actualLevelLog10Deg !== void 0) {
              let E = Math.pow(10, Number(g[p][D]));
              E > 0 &&
                Number.isFinite(E) &&
                Z.push([E, Math.pow(10, a.actualLevelLog10Deg)]);
            }
          }
        });
        let q =
            w.length || Z.length
              ? `<div class="plots">${st(
                  w,
                  "requested eccentricity (\xB0)",
                  "actual (\xB0)",
                )}${st(
                  Z,
                  "requested size/spacing (\xB0)",
                  "actual (\xB0)",
                )}</div>`
              : "",
          x = e.name.replace(/\.csv$/i, "") + "-imputed.csv",
          h = document.createElement("div");
        (h.className = "card"),
          (h.innerHTML = `
      <div class="fhead"><span class="fname">${G(e.name)}</span>
        <button class="dl" title="Requested values in the original columns are replaced with what was actually shown; the repairImputedColumns column lists the altered cells; your source file is untouched">\u2B07 imputed CSV</button></div>
      <div class="chips">${u}</div>
      ${d}
      ${v}
      ${q}
      ${O}`),
          h
            .querySelector(".dl")
            .addEventListener("click", () => it(x, et(n, s))),
          h
            .querySelector(".rowtoggle input")
            .addEventListener("change", (a) => {
              h.querySelectorAll("tr[data-st]").forEach((p) => {
                p.getAttribute("data-st") === "UNAFFECTED" &&
                  p.classList.toggle("r-hidden", a.target.checked);
              });
            }),
          rt.appendChild(h),
          Re.push(
            `${e.name}: ${o.corrected} corrected / ${o.unaffected} unaffected / ${o.flagged} flagged (${o.total} rows)`,
          ),
          d &&
            Re.push(
              `  shown-vs-requested: ${
                c.eccentricityErrPct
                  ? `position median ${X(
                      Math.abs(c.eccentricityErrPct[0]),
                    )}% max ${X(c.eccentricityErrPct[1])}%; `
                  : ""
              }${
                c.sizeSpacingInflationPct
                  ? `size/spacing median ${X(
                      Math.abs(c.sizeSpacingInflationPct[0]),
                    )}% max ${X(c.sizeSpacingInflationPct[1])}%`
                  : ""
              }`,
            );
        let l = {};
        s.rows.forEach((a) => {
          a.status === "FLAGGED" &&
            (l[a.statusReason] = (l[a.statusReason] || 0) + 1);
        }),
          Object.entries(l).forEach(([a, p]) => Re.push(`  FLAG ${p}x: ${a}`)),
          (document.getElementById("reportBtn").style.display = "inline-block");
      }),
        t.readAsText(e);
    },
    be = document.getElementById("drop"),
    Ne = document.getElementById("file");
  be.addEventListener("click", () => Ne.click());
  be.addEventListener("dragover", (e) => {
    e.preventDefault(), be.classList.add("over");
  });
  be.addEventListener("dragleave", () => be.classList.remove("over"));
  be.addEventListener("drop", (e) => {
    e.preventDefault(),
      be.classList.remove("over"),
      [...e.dataTransfer.files].forEach(ot);
  });
  Ne.addEventListener("change", () => [...Ne.files].forEach(ot));
  document.getElementById("reportBtn").addEventListener("click", () =>
    it(
      "repair-report.txt",
      `EasyEyes results repair report
` +
        new Date().toISOString() +
        `

` +
        Re.join(`
`) +
        `
`,
    ),
  );
  var De = null,
    wt = () => {
      let e = document.getElementById("xp-char").value || "E",
        t = document.createElement("canvas").getContext("2d");
      t.font = "700 100px Arial, sans-serif";
      let n = t.measureText(e[0]),
        s =
          n.actualBoundingBoxAscent && n.actualBoundingBoxDescent !== void 0
            ? n.actualBoundingBoxAscent + n.actualBoundingBoxDescent
            : 72;
      De = { ch: e[0], capH: s, width: n.width || 60 };
    };
  var dt = "placement",
    j = {};
  ["preset", "w", "h", "ppc", "dist", "ex", "ey", "grid", "ref"].forEach(
    (e) => (j[e] = document.getElementById("xp-" + e)),
  );
  var Be = () => {
      let e = Number(j.w.value),
        t = Number(j.h.value),
        n = Number(j.ppc.value);
      return (
        j.preset.value !== "custom" &&
          ([e, t, n] = j.preset.value.split(",").map(Number)),
        (n = Math.max(1, n)),
        j.preset.value === "custom" &&
          Number(j.ppc.value) !== n &&
          (j.ppc.value = n),
        {
          w: e,
          h: t,
          ppc: n,
          dist: Number(j.dist.value),
          eyeXPx: Number(j.ex.value) * n,
          eyeYPx: Number(j.ey.value) * n,
          showGrid: j.grid.checked,
          showRef: j.ref.checked,
          mode: dt,
          sizeDeg: Number(document.getElementById("xp-size").value),
          sizeDim: document.getElementById("xp-sizedim").value,
        }
      );
    },
    vt = (e) => {
      let t = Math.max(-1, Math.min(1, (e - 1) / 0.2)),
        n = (r, g, o) => Math.round(r + (g - r) * o);
      if (t >= 0) {
        let r = t;
        return `rgb(${n(250, 212, r)},${n(250, 78, r)},${n(250, 0, r)})`;
      }
      let s = -t;
      return `rgb(${n(250, 26, s)},${n(250, 90, s)},${n(250, 200, s)})`;
    },
    Oe = () => {
      let e = Be();
      if (!(e.w > 0 && e.h > 0 && e.ppc > 0 && e.dist > 0)) return;
      (document.getElementById("xp-dist-v").textContent = e.dist),
        (document.getElementById("xp-ex-v").textContent = (
          e.eyeXPx / e.ppc
        ).toFixed(1)),
        (document.getElementById("xp-ey-v").textContent = (
          e.eyeYPx / e.ppc
        ).toFixed(1)),
        document
          .getElementById("explore")
          .classList.toggle("showCustom", j.preset.value === "custom");
      let t = [e.eyeXPx, e.eyeYPx],
        n = [e.eyeXPx + e.w / 2, e.h / 2 - e.eyeYPx],
        s = { pxPerCm: e.ppc, viewingDistanceCm: e.dist, fixationXYPx: [0, 0] },
        r = { ...s, nearestPointXYZPx: t },
        g = { ...s, nearestPointXYZPx: n },
        o = 640,
        c = Math.round((o * e.h) / e.w),
        u = (x) => ((x + e.w / 2) / e.w) * o,
        d = (x) => ((e.h / 2 - x) / e.h) * c,
        m = 52,
        b = 32,
        y = o / m,
        i = c / b,
        $ = [];
      for (let x = 0; x < b; x++)
        for (let h = 0; h < m; h++) {
          let l = -e.w / 2 + ((h + 0.5) / m) * e.w,
            a = e.h / 2 - ((x + 0.5) / b) * e.h,
            p = I([l, a], r),
            E = Math.hypot(p[0], p[1]);
          if (E < 0.5) continue;
          let L;
          if (e.mode === "size") {
            let Y = e.sizeDim === "h" ? [0, 1] : [1, 0],
              k = T(p, g),
              ee = T([p[0] + Y[0] * e.sizeDeg, p[1] + Y[1] * e.sizeDeg], g),
              U = I(k, r),
              _ = I(ee, r);
            L = Math.hypot(_[0] - U[0], _[1] - U[1]) / e.sizeDeg;
          } else {
            let Y = T(p, g),
              k = I(Y, r);
            L = Math.hypot(k[0], k[1]) / E;
          }
          $.push(
            `<rect x="${(h * y).toFixed(1)}" y="${(x * i).toFixed(
              1,
            )}" width="${(y + 0.5).toFixed(1)}" height="${(i + 0.5).toFixed(
              1,
            )}" fill="${vt(L)}"/>`,
          );
        }
      let v = 5,
        O = (x, h) => {
          let l = [],
            p = (E, L) => {
              let Y = "",
                k = null,
                ee = Math.max(e.w, e.h) * 4,
                U = Math.max(e.w, e.h) * 3;
              for (let _ = -80; _ <= 80; _ += 1) {
                let V = T(E ? [L, _] : [_, L], x);
                if (
                  !Number.isFinite(V[0]) ||
                  !Number.isFinite(V[1]) ||
                  Math.abs(V[0]) > U ||
                  Math.abs(V[1]) > U
                ) {
                  k = null;
                  continue;
                }
                let z = k && Math.hypot(V[0] - k[0], V[1] - k[1]) > ee;
                (Y += `${Y && !z ? "L" : "M"}${u(V[0]).toFixed(1)},${d(
                  V[1],
                ).toFixed(1)}`),
                  (k = V);
              }
              Y && l.push(`<path d="${Y}" fill="none" ${h}/>`);
            };
          for (let E = -80; E <= 80; E += v) p(!0, E), p(!1, E);
          return l.join("");
        },
        M = "";
      if (e.showRef) {
        M += O(
          r,
          'stroke="#2e7d32" stroke-opacity="0.6" stroke-width="0.8" stroke-dasharray="5 4"',
        );
        let x = [];
        for (let h = -80; h <= 80; h += v) {
          if (h === 0) continue;
          let l = T([h, 0], r);
          Number.isFinite(l[0]) &&
            l[0] > -e.w / 2 + 8 &&
            l[0] < e.w / 2 - 8 &&
            x.push(
              `<text x="${u(l[0]).toFixed(
                1,
              )}" y="11" font-size="9" fill="#1e6b2f" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${h}\xB0</text>`,
            );
          let a = T([0, h], r);
          Number.isFinite(a[1]) &&
            a[1] > -e.h / 2 + 8 &&
            a[1] < e.h / 2 - 8 &&
            x.push(
              `<text x="4" y="${(d(a[1]) + 3).toFixed(
                1,
              )}" font-size="9" fill="#1e6b2f" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${h}\xB0</text>`,
            );
        }
        M += x.join("");
      }
      e.showGrid &&
        (M += O(
          g,
          'stroke="#16344d" stroke-opacity="0.85" stroke-width="1.3"',
        ));
      let A = `<circle cx="${u(0)}" cy="${d(
        0,
      )}" r="4" fill="none" stroke="#222" stroke-width="1.4"><title>fixation</title></circle>`;
      document.querySelector(".legend").innerHTML =
        e.mode === "size"
          ? '<span class="sw" style="background:#1a5ac8"></span> shown smaller than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown larger than requested'
          : '<span class="sw" style="background:#1a5ac8"></span> shown closer than requested &nbsp;\xB7&nbsp; white: no error &nbsp;\xB7&nbsp; <span class="sw" style="background:#d44e00"></span> shown farther than requested';
      let D = `<svg id="xp-svg" viewBox="0 0 ${o} ${c}" width="${o}" height="${c}">
    ${$.join("")}${M}${A}<g id="xp-glyphs"></g>
  </svg>`,
        w = document.getElementById("xp-plot");
      w.innerHTML = D;
      let Z = document.getElementById("xp-svg"),
        q = document.createElement("div");
      (q.id = "xp-tooltip"),
        (w.style.position = "relative"),
        w.appendChild(q),
        Z.addEventListener("mousemove", (x) => {
          let h = Z.getBoundingClientRect(),
            l = ((x.clientX - h.left) / h.width) * e.w - e.w / 2,
            a = e.h / 2 - ((x.clientY - h.top) / h.height) * e.h,
            p = I([l, a], r),
            E = Math.hypot(p[0], p[1]),
            L;
          if (e.mode === "size") {
            let z = e.sizeDim === "h" ? [0, 1] : [1, 0],
              te = T(p, g),
              Q = T([p[0] + z[0] * e.sizeDeg, p[1] + z[1] * e.sizeDeg], g),
              ne = I(te, r),
              se = I(Q, r),
              ie = Math.hypot(se[0] - ne[0], se[1] - ne[1]);
            (L = `<b>${ze(
              ((ie - e.sizeDeg) / e.sizeDeg) * 100,
            )}</b> size error`),
              De || wt();
            let ue = T(p, r),
              S = te,
              le = (W, oe) => {
                let me = T(
                  [p[0] + z[0] * e.sizeDeg, p[1] + z[1] * e.sizeDeg],
                  oe,
                );
                return Math.hypot(me[0] - W[0], me[1] - W[1]);
              },
              ce = le(ue, r),
              ye = le(S, g),
              ge = e.sizeDim === "h" ? De.capH : De.width,
              re = (W, oe, me, fe) =>
                `<text x="${u(W[0]).toFixed(1)}" y="${d(W[1]).toFixed(
                  1,
                )}" font-family="Arial, sans-serif" font-weight="700" font-size="${(
                  (oe / ge) *
                  100
                ).toFixed(
                  1,
                )}" fill="${me}" fill-opacity="0.55" text-anchor="middle" dominant-baseline="central">${G(
                  De.ch,
                )}</text><text x="${u(W[0]).toFixed(1)}" y="${(
                  d(W[1]) +
                  ((oe / ge) * 100) / 2 +
                  12
                ).toFixed(
                  1,
                )}" font-size="10" fill="${me}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${fe}</text>`;
            Z.querySelector("#xp-glyphs").innerHTML =
              re(ue, ce, "#2e7d32", `requested ${e.sizeDeg}\xB0`) +
              re(S, ye, "#16344d", `actual ${ie.toFixed(2)}\xB0`);
          } else {
            let z = T(p, g),
              te = I(z, r),
              Q = Math.hypot(te[0], te[1]);
            L = `<b>${
              E > 0.1 ? ze(((Q - E) / E) * 100) : "\u2014"
            }</b> eccentricity error`;
            let ne = T(p, r),
              se = (ie, ue, S, le) =>
                `<text x="${u(ie[0]).toFixed(1)}" y="${(
                  d(ie[1]) + (le ? -12 : 20)
                ).toFixed(
                  1,
                )}" font-size="10" fill="${ue}" text-anchor="middle" style="paint-order:stroke;stroke:#fff;stroke-width:2.5">${S}</text>`;
            Z.querySelector("#xp-glyphs").innerHTML =
              `<line x1="${u(ne[0]).toFixed(1)}" y1="${d(ne[1]).toFixed(
                1,
              )}" x2="${u(z[0]).toFixed(1)}" y2="${d(z[1]).toFixed(
                1,
              )}" stroke="#555" stroke-width="1" stroke-opacity="0.6"/><circle cx="${u(
                ne[0],
              ).toFixed(1)}" cy="${d(ne[1]).toFixed(
                1,
              )}" r="7" fill="#2e7d32" fill-opacity="0.55"/><circle cx="${u(
                z[0],
              ).toFixed(1)}" cy="${d(z[1]).toFixed(
                1,
              )}" r="7" fill="#16344d" fill-opacity="0.55"/>` +
              se(
                ne,
                "#2e7d32",
                `requested (${p[0].toFixed(1)}, ${p[1].toFixed(
                  1,
                )})\xB0 \xB7 ${E.toFixed(2)}\xB0`,
                !0,
              ) +
              se(
                z,
                "#16344d",
                `actual (${te[0].toFixed(1)}, ${te[1].toFixed(
                  1,
                )})\xB0 \xB7 ${Q.toFixed(2)}\xB0`,
                !1,
              );
          }
          (q.innerHTML = L), (q.style.display = "block");
          let Y = w.getBoundingClientRect();
          (q.style.left = "0px"), (q.style.top = "0px");
          let k = q.offsetWidth,
            ee = q.offsetHeight,
            U = x.clientX - Y.left,
            _ = x.clientY - Y.top,
            ae = U + 16;
          ae + k > Y.width - 4 && (ae = U - k - 16);
          let V = Math.min(Math.max(_ - ee / 2, 2), Y.height - ee - 2);
          q.style.transform = `translate(${ae}px, ${V}px)`;
        }),
        Z.addEventListener("mouseleave", () => {
          (q.style.display = "none"),
            (Z.querySelector("#xp-glyphs").innerHTML = "");
        });
    },
    Et = () => {
      let e = Be();
      if (!(e.w > 0 && e.h > 0 && e.ppc > 0 && e.dist > 0)) return;
      let t = e.w,
        n = e.h,
        s = e.ppc,
        r = e.dist,
        g = [e.eyeXPx, e.eyeYPx],
        o = [g[0] + t / 2, n / 2 - g[1]],
        c = (b) => `<span class="st" data-tip="${G(b)}">`,
        u = "</span>",
        d = `
    <div class="fx"><span class="lbl">pixels &rarr; angle (radial):</span>
      ${c(
        "R: radial projection of a screen-space px offset to the visual angle it subtends at the eye",
      )}<i><b>R</b>(<b>u</b>)</i>${u} = <span class="frac"><span class="num">180</span><span class="den">&pi;</span></span> atan<span class="frac"><span class="num">&Vert;<b>u</b>&Vert;</span><span class="den">${c(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${u}</span></span> &middot; <span class="frac"><span class="num"><b>u</b></span><span class="den">&Vert;<b>u</b>&Vert;</span></span>
    </div>
    <div class="fx"><span class="lbl">angle &rarr; pixels (its inverse):</span>
      ${c(
        "R\u207B\xB9: places a point that subtends a given angle \u2014 this is what draws a stimulus",
      )}<i><b>R</b><sup>&minus;1</sup>(<b>v</b>)</i>${u} = ${c(
        "s = pixels per cm, d = viewing distance",
      )}<i>s&middot;d</i>${u} tan<span class="frac"><span class="num">&pi;&Vert;<b>v</b>&Vert;</span><span class="den">180</span></span> &middot; <span class="frac"><span class="num"><b>v</b></span><span class="den">&Vert;<b>v</b>&Vert;</span></span>
    </div>
    <div class="fx fxline-bug"><span class="lbl">drawn on screen (buggy eye):</span>
      <b class="v">p</b> = ${c(
        "n_bug: the assumed nearest point",
      )}<b class="v">n<sub>bug</sub></b>${u} + <i><b>R</b><sup>&minus;1</sup></i>(&theta; &minus; <i><b>R</b></i>(<b class="v">n<sub>bug</sub></b>))
    </div>
    <div class="fx fxline-act"><span class="lbl">what you actually saw (true eye):</span>
      <b class="v">a</b> = <i><b>R</b></i>(<b class="v">p</b> &minus; ${c(
        "n: the true nearest point",
      )}<b class="v">n</b>${u}) + <i><b>R</b></i>(<b class="v">n</b>)
    </div>
    <div class="fx"><span class="lbl">the bug, in full ${c(
      "The webcam tracker's top-left-origin coordinates were used verbatim in the center-origin frame.",
    )}(raw rc, unconverted)${u}:</span>
      <b class="v">n<sub>bug</sub></b> = ( n<sub>x</sub> + W/2 , &nbsp;H/2 &minus; n<sub>y</sub> )
    </div>
    <div class="fxvals">s ${s} px/cm&nbsp;|&nbsp;d ${r} cm&nbsp;|&nbsp;n (${
      g[0]
    }, ${g[1]}) px&nbsp;|&nbsp;n<sub>bug</sub> (${o[0]}, ${o[1]}) px</div>`,
        m = document.getElementById("xp-formulas");
      m && (m.innerHTML = `<div class="formulas">${d}</div>`);
    },
    lt = () => {
      let e = document.getElementById("xp-diagram");
      if (!e) return;
      let t = Be();
      if (!(t.w > 0 && t.h > 0 && t.ppc > 0 && t.dist > 0)) return;
      let n = document.getElementById("xp-req"),
        s = Number(n.value);
      document.getElementById("xp-req-v").textContent = s;
      let r = [t.eyeXPx, t.eyeYPx],
        g = [t.eyeXPx + t.w / 2, t.h / 2 - t.eyeYPx],
        o = { pxPerCm: t.ppc, viewingDistanceCm: t.dist, fixationXYPx: [0, 0] },
        c = T([s, 0], { ...o, nearestPointXYZPx: g }),
        u = I(c, { ...o, nearestPointXYZPx: r }),
        d = t.w / t.ppc,
        m = t.eyeXPx / t.ppc,
        b = m + d / 2,
        y = c[0] / t.ppc,
        i = t.dist,
        $ = 30,
        v = Math.min(-d / 2, m, y) - 6,
        O = Math.max(d / 2, b, y) + 6,
        M = 352,
        A = Math.min((M - 2 * $) / (O - v), 350 / (i + 6)),
        D = M,
        w = (v + O) / 2,
        Z = (D - 2 * $) / A,
        q = w - Z / 2,
        x = (_) => $ + (_ - q) * A,
        h = Math.round(70 + (i + 6) * A),
        l = (_) => 40 + _ * A,
        a = `<line x1="${x(-d / 2)}" y1="${l(0)}" x2="${x(d / 2)}" y2="${l(
          0,
        )}" stroke="#222" stroke-width="4"/>
    <text x="${x(d / 2)}" y="${
      l(0) + 16
    }" font-size="10" fill="#444" text-anchor="end">screen (${d.toFixed(
      0,
    )} cm wide)</text>`,
        p = `<circle cx="${x(0)}" cy="${l(
          0,
        )}" r="4" fill="#222"><title>fixation</title></circle>
    <text x="${x(0) + 6}" y="${
      l(0) - 6
    }" font-size="10" fill="#222">fixation</text>`,
        E = [
          `<line x1="${x(b)}" y1="${l(i)}" x2="${x(y)}" y2="${l(
            0,
          )}" stroke="#b26a00" stroke-width="2"/>`,
          `<line x1="${x(b)}" y1="${l(i)}" x2="${x(0)}" y2="${l(
            0,
          )}" stroke="#b26a00" stroke-width="1" stroke-dasharray="4 3"/>`,
          `<line x1="${x(m)}" y1="${l(i)}" x2="${x(y)}" y2="${l(
            0,
          )}" stroke="#2b6cb0" stroke-width="2"/>`,
          `<line x1="${x(m)}" y1="${l(i)}" x2="${x(0)}" y2="${l(
            0,
          )}" stroke="#2b6cb0" stroke-width="1" stroke-dasharray="4 3"/>`,
        ].join(""),
        L = `
    <circle cx="${x(b)}" cy="${l(i)}" r="5" fill="#b26a00"/>
    <text x="${x(b)}" y="${
      l(i) + 18
    }" font-size="10" fill="#b26a00" text-anchor="middle">eye as the bug assumed</text>
    <circle cx="${x(m)}" cy="${l(i)}" r="5" fill="#2b6cb0"/>
    <text x="${x(m)}" y="${
      l(i) - 10
    }" font-size="10" fill="#2b6cb0" text-anchor="middle">your actual eye</text>`,
        Y = [(b + y) / 2, i / 2],
        k = [(m + y) / 2, i / 2],
        ee = s !== 0 ? ((Math.abs(u[0]) - Math.abs(s)) / Math.abs(s)) * 100 : 0,
        U = `<circle cx="${x(y)}" cy="${l(0)}" r="4.5" fill="#b3261e"/>
    <text x="${x(y) - 6}" y="${
      l(0) - 8
    }" font-size="10" fill="#b3261e" text-anchor="end">drawn ${y.toFixed(
      1,
    )} cm</text>
    <text x="${x(Y[0]) + 8}" y="${
      l(Y[1]) + 4
    }" font-size="10" fill="#b26a00">requested ${s}\xB0</text>
    <text x="${x(k[0]) - 8}" y="${
      l(k[1]) - 6
    }" font-size="10" fill="#2b6cb0">actual ${u[0].toFixed(2)}\xB0${
      s ? ` (${ze(ee)})` : ""
    }</text>`;
      e.innerHTML = `<svg viewBox="0 0 ${D} ${h}" width="${D}" height="${h}">${a}${p}${E}${L}${U}</svg>`;
    },
    Ae = () => {
      lt(), Oe(), Et();
    };
  ["preset", "w", "h", "ppc", "grid", "ref"].forEach((e) =>
    j[e].addEventListener("change", Ae),
  );
  ["dist", "ex", "ey"].forEach((e) => j[e].addEventListener("input", Ae));
  document.getElementById("xp-req").addEventListener("input", lt);
  document.getElementById("xp-char").addEventListener("input", () => {
    De = null;
  });
  ["size", "sizedim"].forEach((e) =>
    document.getElementById("xp-" + e).addEventListener("input", () => {
      (document.getElementById("xp-size-v").textContent =
        document.getElementById("xp-size").value),
        Oe();
    }),
  );
  var ut = (e) => {
    (dt = e),
      document
        .getElementById("xp-mode-pos")
        .classList.toggle("on", e === "placement"),
      document
        .getElementById("xp-mode-size")
        .classList.toggle("on", e === "size"),
      document
        .getElementById("xp-sizeopts")
        .classList.toggle("show", e === "size"),
      Oe();
  };
  document
    .getElementById("xp-mode-pos")
    .addEventListener("click", () => ut("placement"));
  document
    .getElementById("xp-mode-size")
    .addEventListener("click", () => ut("size"));
  Ae();
})();
