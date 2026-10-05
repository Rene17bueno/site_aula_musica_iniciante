// Gera os videos (1080x1920, voz pt-BR + legenda .vtt + poster) das aulas definidas em conteudo.mjs.
// Uso:  npm i  &&  node gerar.mjs [a4p1 a4p2 ...] [--sem-json]
// Requer: ffmpeg/ffprobe no PATH, Chromium (PLAYWRIGHT_BROWSERS_PATH ou CHROMIUM_PATH) e acesso a
// translate.googleapis.com (voz). O JSON das aulas e atualizado em ../../aulas/aulas.json.
import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { aulas } from "./conteudo.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CACHE = path.join(HERE, ".cache");
const FONT_DIR = path.join(HERE, "node_modules/@fontsource/poppins/files");
const args = process.argv.slice(2);
const preview = args.includes("--preview");
const onlyIds = args.filter((a) => /^a\d+p\d+$/.test(a));
const updateJson = !args.includes("--sem-json");
const LEAD = 0.9, PAD = 0.65, FPS = 24;

fs.mkdirSync(path.join(CACHE, "tts"), { recursive: true });
fs.mkdirSync(path.join(CACHE, "html"), { recursive: true });
const run = (cmd, a, o = {}) => {
    const r = spawnSync(cmd, a, { encoding: "utf8", ...o });
    if (r.status !== 0) throw new Error(`${cmd} falhou: ${(r.stderr || "").slice(-400)}`);
    return r.stdout;
};
const dur = (f) => parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]));

// ---- Voz (Google Translate TTS, pt-BR) com cache ----
function tts(text) {
    const key = createHash("sha1").update(text).digest("hex").slice(0, 16);
    const mp3 = path.join(CACHE, "tts", key + ".mp3");
    if (fs.existsSync(mp3) && fs.statSync(mp3).size > 2000) return mp3;
    for (let t = 1; t <= 4; t++) {
        const r = spawnSync("curl", ["-sS", "-A", "Mozilla/5.0", "-G", "--data-urlencode", "q=" + text,
            "-d", "ie=UTF-8", "-d", "client=tw-ob", "-d", "tl=pt-BR", "-o", mp3, "-w", "%{http_code}",
            "https://translate.googleapis.com/translate_tts"], { encoding: "utf8" });
        if (r.stdout === "200" && fs.statSync(mp3).size > 2000) { spawnSync("sleep", ["0.4"]); return mp3; }
        spawnSync("sleep", [String(t * 2)]);
    }
    throw new Error("TTS falhou para: " + text);
}

// ---- Visual ----
const font = (w) => `@font-face{font-family:Poppins;font-weight:${w};src:url(${pathToFileURL(path.join(FONT_DIR, `poppins-latin-${w}-normal.woff2`))})}`;
const CSS = `${[400, 600, 700].map(font).join("")}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;position:relative;overflow:hidden;font-family:Poppins,"DejaVu Sans",sans-serif;color:#14285a;background:linear-gradient(160deg,#faf3e4,#f6e3cb)}
.c1{position:absolute;left:-200px;top:-80px;width:620px;height:620px;border-radius:50%;background:#f6e9d2;opacity:.8}
.c2{position:absolute;right:-300px;top:1500px;width:700px;height:700px;border-radius:50%;background:#f3d9bd;opacity:.7}
.pill{position:absolute;top:108px;left:50%;transform:translateX(-50%);background:#fff;border-radius:40px;padding:14px 38px;font-size:34px;font-weight:600;letter-spacing:1px;white-space:nowrap}
.dots{position:absolute;top:210px;left:0;right:0;display:flex;gap:20px;justify-content:center}
.dots i{width:20px;height:20px;border-radius:10px;background:#b9b9b9}.dots i.a{width:44px;background:#e08a3c}
.card{position:absolute;left:40px;top:290px;width:1000px;height:1080px;background:#fdfcf8;border-radius:48px;padding:40px 20px 20px;display:flex;flex-direction:column;align-items:center}
.card h1{font-size:60px;font-weight:700;text-align:center;line-height:1.15;min-height:140px;display:flex;align-items:center}
.gfx{flex:1;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cap{position:absolute;left:50px;top:1410px;width:980px;min-height:250px;background:#fdfcf8;border-radius:48px;padding:34px 40px;font-size:50px;font-weight:600;line-height:1.35;text-align:center;box-shadow:0 10px 0 #d9cdb8;display:flex;align-items:center;justify-content:center}
.chips{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:960px}
.chip{border-radius:28px;background:#fff3e0;border:4px solid #f1c48f;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;color:#14285a}
.chip small{font-weight:600;opacity:.75;margin-top:2px}.chip.on{background:#e08a3c;border-color:#e08a3c;color:#fff}.chip.tonic{background:#14285a;border-color:#14285a;color:#fff}
.chain{display:flex;flex-direction:column;align-items:center}
.node{width:var(--nw);height:var(--nw);border-radius:50%;background:#fff3e0;border:4px solid #f1c48f;display:flex;align-items:center;justify-content:center;font-size:calc(var(--nw)*.38);font-weight:700;flex:none}
.node.on{background:#e08a3c;border-color:#e08a3c;color:#fff}.node.tonic{background:#14285a;border-color:#14285a;color:#fff}
.link{height:var(--lh);position:relative;width:var(--nw);display:flex;align-items:center;justify-content:center;flex:none;color:#6f6f7a}
.link u{width:6px;height:100%;background:#d7cdb9;border-radius:3px}.link b{position:absolute;left:calc(100% + 22px);white-space:nowrap;font-size:var(--lf);font-weight:600}
.link.hl u{background:#e08a3c}.link.hl b{color:#e08a3c;font-weight:700}
.keys{display:grid;grid-template-columns:repeat(6,1fr);gap:14px;width:940px}
.key{height:190px;border-radius:24px;background:#f4f1ea;border:4px solid #e0d9c8;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700}
.key span{font-size:40px}.key small{font-size:26px;font-weight:600;opacity:.7}.key.on{background:#e08a3c;border-color:#e08a3c;color:#fff}.key.tonic{background:#14285a;border-color:#14285a;color:#fff}
.strip{display:flex;gap:10px;justify-content:center}.fcell{width:176px;height:230px;border-radius:24px;background:#f4f1ea;border:4px solid #e0d9c8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.fcell small{font-size:24px;font-weight:600;color:#6f6f7a}.fcell span{font-size:44px;font-weight:700}.fcell.on{background:#fde7cf;border-color:#e08a3c}
.brace{margin-top:34px;font-size:46px;font-weight:700;color:#e08a3c}
.bigtxt{text-align:center;padding:0 30px}.bigtxt h2{font-size:104px;line-height:1.1;font-weight:700}.bigtxt p{font-size:46px;font-weight:600;color:#e08a3c;margin-top:20px}
.biglist{list-style:none;padding:0 20px;width:100%}.biglist li{display:flex;align-items:center;gap:26px;font-size:48px;font-weight:600;padding:20px 28px;margin:12px 0;border-radius:26px;background:#f4f1ea}
.biglist li i{width:26px;height:26px;border-radius:50%;background:#b9b9b9;flex:none}.biglist li.hl{background:#fde7cf;border:4px solid #e08a3c}.biglist li.hl i{background:#e08a3c}
.compare{display:flex;flex-direction:column;gap:46px;width:100%;align-items:center}.cmp{text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}.cmp h3{font-size:44px;font-weight:700}.cmp p{font-size:30px}
.twobox{display:flex;gap:10px;justify-content:center}.twobox>div{text-align:center}.twobox svg{width:470px!important}.twobox p{font-size:36px;font-weight:700;margin-top:6px}`;

function sceneHtml(aula, parte, scene) {
    const dots = aula.partes.map((p) => `<i class="${p.id === parte.id ? "a" : ""}"></i>`).join("");
    return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="c1"></div><div class="c2"></div>
<div class="pill">AULA ${aula.n} · PARTE ${parte.n} DE ${aula.partes.length}</div><div class="dots">${dots}</div>
<div class="card"><h1>${parte.titulo}</h1><div class="gfx">${scene.g}</div></div>
<div class="cap">${scene.say}</div></body></html>`;
}

const hms = (s) => {
    const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
};

async function previewPart(page, aula, parte) {
    fs.mkdirSync(path.join(CACHE, "preview"), { recursive: true });
    for (let i = 0; i < parte.cenas.length; i++) {
        const f = path.join(CACHE, "html", `${parte.id}-${i}.html`);
        fs.writeFileSync(f, sceneHtml(aula, parte, parte.cenas[i]));
        await page.goto(pathToFileURL(f).href);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: path.join(CACHE, "preview", `${parte.id}-${i}.png`) });
    }
}

async function buildPart(page, aula, parte) {
    const work = path.join(CACHE, parte.id);
    fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
    const wavs = [], durs = [], pngs = [], cues = [];
    let t = 0;
    for (let i = 0; i < parte.cenas.length; i++) {
        const sc = parte.cenas[i], mp3 = tts(sc.say), wav = path.join(work, `s${i}.wav`);
        const lead = i === 0 ? LEAD : 0;
        run("ffmpeg", ["-v", "error", "-y", "-i", mp3, "-ar", "44100", "-ac", "1", "-af",
            `adelay=${Math.round(lead * 1000)}:all=1,apad=pad_dur=${PAD}`, "-c:a", "pcm_s16le", wav]);
        const d = dur(wav);
        const raw = dur(mp3);
        cues.push({ a: t + lead, b: t + lead + raw, text: sc.say });
        t += d; wavs.push(wav); durs.push(d);
        const htmlFile = path.join(CACHE, "html", `${parte.id}-${i}.html`);
        fs.writeFileSync(htmlFile, sceneHtml(aula, parte, sc));
        await page.goto(pathToFileURL(htmlFile).href);
        await page.evaluate(() => document.fonts.ready);
        const png = path.join(work, `s${i}.png`);
        await page.screenshot({ path: png });
        pngs.push(png);
    }
    fs.writeFileSync(path.join(work, "wavs.txt"), wavs.map((w) => `file '${w}'`).join("\n"));
    run("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(work, "wavs.txt"), "-c", "copy", path.join(work, "audio.wav")]);
    const lines = [];
    pngs.forEach((p, i) => lines.push(`file '${p}'`, `duration ${durs[i].toFixed(3)}`));
    lines.push(`file '${pngs[pngs.length - 1]}'`);
    fs.writeFileSync(path.join(work, "imgs.txt"), lines.join("\n"));
    const out = path.join(ROOT, "aulas/video", parte.id + ".mp4");
    run("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(work, "imgs.txt"), "-i", path.join(work, "audio.wav"),
        "-vf", `fps=${FPS},format=yuv420p`, "-c:v", "libx264", "-preset", "medium", "-crf", "28", "-tune", "stillimage",
        "-c:a", "aac", "-b:a", "64k", "-ar", "44100", "-ac", "1", "-movflags", "+faststart", "-shortest", out]);
    const vtt = "WEBVTT\n\n" + cues.map((c, i) => `${i + 1}\n${hms(c.a)} --> ${hms(c.b)}\n${c.text}\n`).join("\n");
    fs.writeFileSync(path.join(ROOT, "aulas/video", parte.id + ".vtt"), vtt);
    // poster: quadro da 2a cena (ou da 1a), 540x960
    const mid = Math.min(cues[Math.min(1, cues.length - 1)].a + 0.8, t - 0.2);
    run("ffmpeg", ["-v", "error", "-y", "-ss", mid.toFixed(2), "-i", out, "-frames:v", "1", "-vf", "scale=540:960", "-q:v", "5", path.join(ROOT, "aulas/poster", parte.id + ".jpg")]);
    parte.dur = Math.round(dur(out));
    console.log(`${parte.id}  ${parte.dur}s  ${(fs.statSync(out).size / 1e6).toFixed(1)} MB  ${parte.cenas.length} cenas`);
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "aulas/aulas.json"), "utf8"));
for (const aula of aulas) {
    aula.partes.forEach((p, i) => { p.n = i + 1; });
    for (const parte of aula.partes) {
        if (onlyIds.length && !onlyIds.includes(parte.id)) continue;
        if (preview) await previewPart(page, aula, parte); else await buildPart(page, aula, parte);
    }
    if (updateJson) {
        const entry = { n: aula.n, titulo: aula.titulo, desc: aula.desc, livre: aula.livre,
            partes: aula.partes.map((p) => ({ id: p.id, n: p.n, titulo: p.titulo, desc: p.desc, dur: p.dur ?? (meta.aulas.find((a) => a.n === aula.n)?.partes.find((q) => q.id === p.id)?.dur ?? 0) })) };
        const idx = meta.aulas.findIndex((a) => a.n === aula.n);
        if (idx >= 0) meta.aulas[idx] = entry; else meta.aulas.push(entry);
    }
}
await browser.close();
if (updateJson) fs.writeFileSync(path.join(ROOT, "aulas/aulas.json"), JSON.stringify(meta, null, 1) + "\n");
