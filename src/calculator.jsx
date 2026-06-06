import { useState, useCallback, useEffect } from "react";

function evaluate(a, b, op) {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b !== 0 ? a / b : "Error";
    default:
      return b;
  }
}

function fmt(n) {
  if (n === "Error") return "Error";
  const s = String(n);
  if (s.length > 12) return parseFloat(Number(n).toPrecision(8)).toString();
  return s;
}

function CalcButton({ label, variant = "num", wide = false, active = false, onClick }) {
  return (
    <button
      className={[
        "calc-btn",
        `calc-btn--${variant}`,
        wide ? "calc-btn--wide" : "",
        active ? "calc-btn--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick(label)}
      aria-label={label}
    >
      {label}
    </button>
  );
}

function CalcDisplay({ value, expression }) {
  const long = String(value).length > 9;
  return (
    <div className="calc-display">
      <div className="calc-expr">{expression || "\u00a0"}</div>
      <div className={`calc-value${long ? " calc-value--sm" : ""}`}>{value}</div>
    </div>
  );
}

const BUTTONS = [
  [
    { label: "AC", variant: "fn" },
    { label: "+/−", variant: "fn" },
    { label: "%", variant: "fn" },
    { label: "÷", variant: "op" },
  ],
  [{ label: "7" }, { label: "8" }, { label: "9" }, { label: "×", variant: "op" }],
  [{ label: "4" }, { label: "5" }, { label: "6" }, { label: "−", variant: "op" }],
  [{ label: "1" }, { label: "2" }, { label: "3" }, { label: "+", variant: "op" }],
  [{ label: "0", wide: true }, { label: "." }, { label: "=", variant: "eq" }],
];

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [fresh, setFresh] = useState(false);
  const [expression, setExpr] = useState("");

  const handle = useCallback(
    (label) => {
      setDisplay((cur) => {
        let nd = cur,
          np = prev,
          nop = op,
          nf = fresh,
          ne = expression;

        if ("0123456789".includes(label)) {
          if (nf || nd === "0") nd = label;
          else if (nd.replace(".", "").replace("-", "").length < 10) nd += label;
          nf = false;
        } else if (label === ".") {
          if (nf) {
            nd = "0.";
            nf = false;
          } else if (!nd.includes(".")) nd += ".";
        } else if (label === "AC") {
          nd = "0";
          np = null;
          nop = null;
          nf = false;
          ne = "";
        } else if (label === "+/−") {
          nd = nd.startsWith("-") ? nd.slice(1) : nd !== "0" ? "-" + nd : nd;
        } else if (label === "%") {
          nd = fmt(parseFloat(nd) / 100);
        } else if (["+", "−", "×", "÷"].includes(label)) {
          if (np !== null && nop && !nf) {
            nd = fmt(evaluate(parseFloat(np), parseFloat(nd), nop));
          }
          np = parseFloat(nd);
          nop = label;
          nf = true;
          ne = fmt(np) + " " + label;
        } else if (label === "=") {
          if (np !== null && nop) {
            ne = fmt(np) + " " + nop + " " + nd + " =";
            nd = fmt(evaluate(parseFloat(np), parseFloat(nd), nop));
            np = null;
            nop = null;
            nf = true;
          }
        }

        setPrev(np);
        setOp(nop);
        setFresh(nf);
        setExpr(ne);
        return nd;
      });
    },
    [prev, op, fresh, expression]
  );

  useEffect(() => {
    const map = {
      "0": "0",
      "1": "1",
      "2": "2",
      "3": "3",
      "4": "4",
      "5": "5",
      "6": "6",
      "7": "7",
      "8": "8",
      "9": "9",
      ".": ".",
      Enter: "=",
      Backspace: "AC",
      Escape: "AC",
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
      "%": "%",
    };

    const onKey = (e) => {
      if (map[e.key]) {
        e.preventDefault();
        handle(map[e.key]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handle]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; }
        .calc-shell { width: 320px; border-radius: 28px; overflow: hidden; border: 1px solid rgba(255,120,0,0.15); background: #111111; }
        .calc-display { background: #0a0a0a; padding: 20px 20px 16px; min-height: 112px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; gap: 6px; border-bottom: 1px solid rgba(255,120,0,0.12); }
        .calc-expr { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,140,0,0.45); min-height: 18px; text-align: right; }
        .calc-value { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 400; color: #fff; line-height: 1; letter-spacing: -2px; text-align: right; transition: font-size 0.1s; }
        .calc-value--sm { font-size: 30px; letter-spacing: -1px; }
        .calc-grid { padding: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .calc-btn { height: 64px; border: none; border-radius: 14px; font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 500; cursor: pointer; transition: transform 0.07s, filter 0.07s; outline: none; -webkit-tap-highlight-color: transparent; }
        .calc-btn:active { transform: scale(0.91); filter: brightness(1.2); }
        .calc-btn--wide { grid-column: span 2; border-radius: 32px; }
        .calc-btn--num { background: #1e1e1e; color: #f0f0f0; }
        .calc-btn--num:hover { background: #272727; }
        .calc-btn--fn { background: #1a1a1a; color: #ff8c00; font-size: 16px; border: 1px solid rgba(255,140,0,0.2); }
        .calc-btn--fn:hover { background: #222; border-color: rgba(255,140,0,0.4); }
        .calc-btn--op { background: #1f1200; color: #ff8c00; font-size: 20px; border: 1px solid rgba(255,140,0,0.25); }
        .calc-btn--op:hover { background: #2a1800; border-color: rgba(255,140,0,0.5); }
        .calc-btn--op.calc-btn--active { background: #ff8c00; color: #000; border-color: #ff8c00; }
        .calc-btn--eq { background: #ff8c00; color: #000; font-size: 22px; font-weight: 600; }
        .calc-btn--eq:hover { background: #ff9d14; }
      `}</style>

      <div className="calc-shell">
        <CalcDisplay value={display} expression={expression} />
        <div className="calc-grid">
          {BUTTONS.flatMap((row, ri) =>
            row.map((btn) => (
              <CalcButton
                key={btn.label + ri}
                {...btn}
                active={op === btn.label && fresh}
                onClick={handle}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

