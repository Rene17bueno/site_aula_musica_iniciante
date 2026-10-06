// Graficos (HTML/SVG) usados nas cenas dos videos. Area util: ~960 x 860 px.
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---- Notas e teoria basica ----
export const PC_NAMES = ["Dó", "Dó♯", "Ré", "Ré♯", "Mi", "Fá", "Fá♯", "Sol", "Sol♯", "Lá", "Lá♯", "Si"];
export const PC_SUB = ["", "Ré♭", "", "Mi♭", "", "", "Sol♭", "", "Lá♭", "", "Si♭", ""];
export const OPEN_PC = { 6: 4, 5: 9, 4: 2, 3: 7, 2: 11, 1: 4 }; // E A D G B E

// kind: "" | "on" (laranja) | "tonic" (azul escuro) | "dim" (apagado)
export function chips(items, { size } = {}) {
    const n = items.length, sz = size || (n <= 4 ? 190 : n <= 5 ? 170 : n <= 6 ? 150 : 124);
    const font = Math.round(sz * 0.38);
    const cells = items.map((it) => {
        const o = typeof it === "string" ? { t: it } : it;
        return `<div class="chip ${o.kind || ""}" style="width:${sz}px;height:${sz}px;font-size:${font}px">
            <span>${esc(o.t)}</span>${o.sub ? `<small style="font-size:${Math.round(sz * 0.2)}px">${esc(o.sub)}</small>` : ""}</div>`;
    });
    return `<div class="chips">${cells.join("")}</div>`;
}

// Escada vertical de notas com os passos tom / semitom entre elas
export function chain(notes, steps, { hlNotes = [], hlSteps = [], tonic = 0 } = {}) {
    const n = notes.length, big = n <= 6;
    const parts = [];
    notes.forEach((nt, i) => {
        const cls = hlNotes.includes(i) ? "on" : i === tonic ? "tonic" : "";
        parts.push(`<div class="node ${cls}">${esc(nt)}</div>`);
        if (i < steps.length) {
            const st = steps[i], hl = hlSteps.includes(i) ? "hl" : "";
            parts.push(`<div class="link ${hl}"><u></u><b>${st === "st" ? "½ semitom" : "1 tom"}</b></div>`);
        }
    });
    const nw = n <= 3 ? 150 : big ? 92 : 70, lh = n <= 3 ? 110 : big ? 54 : 38;
    return `<div class="chain" style="--nw:${nw}px;--lh:${lh}px;--lf:${n <= 3 ? 46 : big ? 34 : 30}px">${parts.join("")}</div>`;
}

// Doze teclas cromaticas
export function keys({ sel = [], tonic = null } = {}) {
    const cells = PC_NAMES.map((nm, pc) => {
        const cls = pc === tonic ? "tonic" : sel.includes(pc) ? "on" : "";
        return `<div class="key ${cls}"><span>${esc(nm)}</span><small>${esc(PC_SUB[pc] || " ")}</small></div>`;
    });
    return `<div class="keys">${cells.join("")}</div>`;
}

// Faixa de uma corda: cada casa com a nota; bracket opcional entre duas casas
export function strip({ stringNo = 6, from = 0, to = 4, hl = null, label = "", names = null }) {
    const cells = [];
    for (let f = from; f <= to; f++) {
        const pc = (OPEN_PC[stringNo] + f) % 12;
        const on = hl && f >= hl[0] && f <= hl[1] ? "on" : "";
        cells.push(`<div class="fcell ${on}"><small>${f === 0 ? "solta" : f + "ª casa"}</small><span>${esc(names ? names[f - from] : PC_NAMES[pc])}</span></div>`);
    }
    return `<div class="strip">${cells.join("")}</div>${label ? `<div class="brace">${esc(label)}</div>` : ""}`;
}

export function big(text, sub = "") {
    return `<div class="bigtxt"><h2>${esc(text)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>`;
}

export function list(items, { hl = [] } = {}) {
    return `<ul class="biglist">${items.map((t, i) => `<li class="${hl.includes(i) ? "hl" : ""}"><i></i><span>${esc(t)}</span></li>`).join("")}</ul>`;
}

// Dois grupos de notas, um sobre o outro
export function compare(top, bottom) {
    const row = (c) => `<div class="cmp"><h3>${esc(c.titulo)}</h3>${chips(c.itens, { size: c.size || (c.itens.length <= 4 ? 170 : 112) })}${c.nota ? `<p>${esc(c.nota)}</p>` : ""}</div>`;
    return `<div class="compare">${row(top)}${row(bottom)}</div>`;
}

// ---- Diagrama vertical (caixa de acorde / posicao de escala) ----
// frets: array de 6 (corda 6..1): -1 abafada, 0 solta, n casa. dots: [[corda, casa, rotulo, tonica?]]
export function box({ lo = 1, rows = 4, dots = [], open = [], mute = [], barre = null, width = 640, nut = null }) {
    const SG = 92, FG = 126, X0 = 150, Y0 = 90, W = X0 + 5 * SG + 80, H = Y0 + rows * FG + 90;
    const sx = (s) => X0 + (6 - s) * SG;
    const showNut = nut !== null ? nut : lo === 1;
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:${width}px" xmlns="http://www.w3.org/2000/svg">`;
    for (let r = 0; r <= rows; r++) svg += `<line x1="${X0}" x2="${X0 + 5 * SG}" y1="${Y0 + r * FG}" y2="${Y0 + r * FG}" stroke="#7b7b86" stroke-width="${r === 0 && showNut ? 0 : 5}"/>`;
    if (showNut) svg += `<rect x="${X0 - 4}" y="${Y0 - 8}" width="${5 * SG + 8}" height="14" fill="#14285a"/>`;
    for (let s = 1; s <= 6; s++) svg += `<line x1="${sx(s)}" x2="${sx(s)}" y1="${Y0}" y2="${Y0 + rows * FG}" stroke="#7b7b86" stroke-width="5"/>`;
    for (let r = 0; r < rows; r++) svg += `<text x="${X0 - 78}" y="${Y0 + r * FG + FG / 2 + 14}" font-size="38" fill="#8a8a94" text-anchor="middle">${lo + r}ª</text>`;
    for (let s = 1; s <= 6; s++) svg += `<text x="${sx(s)}" y="${Y0 + rows * FG + 62}" font-size="40" fill="#6f6f7a" text-anchor="middle">${s}</text>`;
    if (barre) {
        const y = Y0 + (barre.fret - lo) * FG + FG / 2, a = sx(barre.from), b = sx(barre.to);
        svg += `<rect x="${Math.min(a, b) - 36}" y="${y - 36}" width="${Math.abs(a - b) + 72}" height="72" rx="36" fill="#e08a3c" opacity=".35"/>`;
    }
    for (const s of open) svg += `<circle cx="${sx(s)}" cy="${Y0 - 40}" r="22" fill="none" stroke="#14285a" stroke-width="5"/>`;
    for (const s of mute) svg += `<text x="${sx(s)}" y="${Y0 - 24}" font-size="52" font-weight="700" fill="#c0392b" text-anchor="middle">×</text>`;
    for (const [s, f, label, tonic] of dots) {
        const cx = sx(s), cy = Y0 + (f - lo) * FG + FG / 2;
        svg += `<circle cx="${cx}" cy="${cy}" r="40" fill="${tonic ? "#14285a" : "#e08a3c"}"/><text x="${cx}" y="${cy + 12}" font-size="${String(label).length > 2 ? 28 : 36}" font-weight="700" fill="#fff" text-anchor="middle">${esc(label)}</text>`;
    }
    return svg + "</svg>";
}

// Forma de acorde a partir das casas [corda6..corda1]; rotulos = mapa pc -> nome
export function shape(frets, names, tonicPc, { width = 640, barre = null } = {}) {
    const dots = [], open = [], mute = [];
    frets.forEach((f, i) => {
        const s = 6 - i;
        if (f < 0) { mute.push(s); return; }
        const pc = (OPEN_PC[s] + f) % 12;
        if (!(pc in names)) throw new Error("nota fora do acorde: corda " + s + " casa " + f);
        if (f === 0) open.push(s); else dots.push([s, f, names[pc], pc === tonicPc]);
    });
    const used = frets.filter((f) => f > 0);
    const hasOpen = open.length > 0;
    const top = Math.max(...used), bot = Math.min(...used);
    const lo = hasOpen || bot <= 2 ? 1 : bot;
    const rows = Math.max(4, top - lo + 1);
    return box({ lo, rows, dots, open, mute, barre: barre && { ...barre }, width });
}

export function twoBoxes(a, b, labelA, labelB) {
    return `<div class="twobox"><div>${a}<p>${esc(labelA)}</p></div><div>${b}<p>${esc(labelB)}</p></div></div>`;
}
