// Gera data/enciclopedia.json: para cada acorde da planilha, as notas, a formula e as formas no braco todo.
// Uso: node tools/enciclopedia/gerar.mjs   (le tools/enciclopedia/fonte.json)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const { findShapes, spread, dedos } = require(path.join(ROOT, "js/js/formas.js"));

const PT = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"], LET = "CDEFGAB";
const NAT = [0, 2, 4, 5, 7, 9, 11], MAJ = [0, 2, 4, 5, 7, 9, 11];
const sign = (a) => (a === 0 ? "" : a > 0 ? "♯♯".slice(0, a) : "♭♭".slice(0, -a));

// sufixo da cifra -> semitons e deslocamento de letra de cada nota
const Q = {
    "": [[0, 4, 7], [0, 2, 4]], m: [[0, 3, 7], [0, 2, 4]], "7": [[0, 4, 7, 10], [0, 2, 4, 6]], "7M": [[0, 4, 7, 11], [0, 2, 4, 6]],
    m7: [[0, 3, 7, 10], [0, 2, 4, 6]], "9": [[0, 4, 7, 14], [0, 2, 4, 1]], sus4: [[0, 5, 7], [0, 3, 4]], dim: [[0, 3, 6], [0, 2, 4]],
    m6: [[0, 3, 7, 9], [0, 2, 4, 5]], "7(9)": [[0, 4, 7, 10, 14], [0, 2, 4, 6, 1]], "7(b13)": [[0, 4, 10, 20], [0, 2, 6, 5]],
    "m7(b5)": [[0, 3, 6, 10], [0, 2, 4, 6]]
};

function parseLetterAcc(txt) {
    const m = /^([A-G])(#|b)?$/.exec(txt);
    if (!m) throw new Error("nota invalida: " + txt);
    return { l: LET.indexOf(m[1]), a: m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0 };
}
const pcOf = (n) => (NAT[n.l] + n.a + 120) % 12;
const nameOf = (n) => PT[n.l] + sign(n.a);

function degrees(s, l) {
    return s.map((semis, i) => {
        const n = l[i] + 1 + (semis >= 12 ? 7 : 0), base = MAJ[(n - 1) % 7] + (n > 7 ? 12 : 0), diff = semis - base;
        return (diff < 0 ? "♭♭".slice(0, -diff) : diff > 0 ? "♯♯".slice(0, diff) : "") + n;
    });
}

const fonte = JSON.parse(fs.readFileSync(path.join(HERE, "fonte.json"), "utf8"));
const out = [];
for (const a of fonte.acordes) {
    const cifra = a.cifra.replace(/\s+\(.*\)$/, "");            // "Cdim (Cº)" -> "Cdim"
    const [corpo, baixoTxt] = cifra.split("/");
    const m = /^([A-G](?:#|b)?)(.*)$/.exec(corpo);
    const root = parseLetterAcc(m[1]), suf = m[2];
    if (!(suf in Q)) throw new Error("tipo desconhecido: " + a.cifra);
    const [s, l] = Q[suf];
    const notes = s.map((semis, i) => {
        const letter = (root.l + l[i]) % 7, pc = (NAT[root.l] + root.a + semis) % 12;
        let acc = ((pc - NAT[letter] + 18) % 12) - 6;
        return { pc, nome: PT[letter] + sign(acc) };
    });
    const bass = baixoTxt ? parseLetterAcc(baixoTxt) : null;
    const tones = s.map((semis, i) => ({ pc: notes[i].pc, s: semis }));
    const rootPc = pcOf(root), bassPc = bass ? pcOf(bass) : null;
    const todas = findShapes(rootPc, tones, bass ? { bass: bassPc } : undefined);
    const formas = spread(todas, 8).map((sh) => ({ v: sh.v, base: sh.base, top: sh.top, barre: sh.barre, dedos: dedos(sh) }));
    if (!formas.length) throw new Error("sem formas: " + a.cifra);
    out.push({
        id: cifra.replace("#", "s").replace("/", "-").replace(/[()]/g, "").toLowerCase(),
        cifra, nome: a.nome, tipo: a.tipo, grupo: a.grupo, descricao: a.descricao,
        tom: nameOf(root), baixo: bass ? nameOf(bass) : null,
        notas: notes.map((n) => n.nome), formula: degrees(s, l), formas,
        pcs: notes.map((n) => n.pc), rootPc, bassPc
    });
}
fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data/enciclopedia.json"), JSON.stringify({ notas: fonte.notas, acordes: out }));
const tot = out.reduce((n, c) => n + c.formas.length, 0);
console.log(`${out.length} acordes, ${tot} formas (media ${(tot / out.length).toFixed(1)}), ${(fs.statSync(path.join(ROOT, "data/enciclopedia.json")).size / 1024).toFixed(0)} KB`);
const sem = out.filter((c) => c.formas.length < 4).map((c) => c.cifra + ":" + c.formas.length);
if (sem.length) console.log("poucas formas:", sem.join(", "));
