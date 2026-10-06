// Roteiro das aulas 4 a 6. Cada cena = uma frase narrada (<= ~190 caracteres) + um grafico.
import * as G from "./graficos.mjs";

const T = { t: "T", sub: "tom" }, S = { t: "½", sub: "semitom" };
const maj = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si", "Dó"];
const stepsMaj = ["T", "T", "st", "T", "T", "T", "st"];
const N = (names) => names;
const on = (t, sub) => ({ t, sub, kind: "on" });
const tn = (t, sub) => ({ t, sub, kind: "tonic" });

// Formas de acorde (cordas 6..1); validadas pelas notas de cada acorde
const NM = {
    C: { 0: "Dó", 4: "Mi", 7: "Sol" }, Cm: { 0: "Dó", 3: "Mi♭", 7: "Sol" }, Am: { 9: "Lá", 0: "Dó", 4: "Mi" },
    C7: { 0: "Dó", 4: "Mi", 7: "Sol", 10: "Si♭" }, C7M: { 0: "Dó", 4: "Mi", 7: "Sol", 11: "Si" },
    Cm7: { 0: "Dó", 3: "Mi♭", 7: "Sol", 10: "Si♭" }, C6: { 0: "Dó", 4: "Mi", 7: "Sol", 9: "Lá" },
    C9: { 0: "Dó", 4: "Mi", 7: "Sol", 10: "Si♭", 2: "Ré" }, Csus4: { 0: "Dó", 5: "Fá", 7: "Sol" },
    Csus2: { 0: "Dó", 2: "Ré", 7: "Sol" }, Cdim: { 0: "Dó", 3: "Mi♭", 6: "Sol♭" }, Caug: { 0: "Dó", 4: "Mi", 8: "Sol♯" }
};
const sh = (frets, nm, tonic = 0, o = {}) => G.shape(frets, nm, tonic, { width: 760, ...o });
const shC = sh([-1, 3, 2, 0, 1, 0], NM.C), shCm = sh([-1, 3, 5, 5, 4, 3], NM.Cm, 0, { barre: { fret: 3, from: 5, to: 1 } });
const shAm = sh([-1, 0, 2, 2, 1, 0], NM.Am, 9), shC7 = sh([-1, 3, 2, 3, 1, 0], NM.C7), shC7M = sh([-1, 3, 2, 0, 0, 0], NM.C7M);
const shCm7 = sh([-1, 3, 5, 3, 4, 3], NM.Cm7, 0, { barre: { fret: 3, from: 5, to: 1 } });
const shC6 = sh([-1, 3, 2, 2, 1, 0], NM.C6), shC9 = sh([-1, 3, 2, 3, 3, 3], NM.C9, 0, { barre: { fret: 3, from: 2, to: 1 } });
const shCsus4 = sh([-1, 3, 3, 0, 1, 1], NM.Csus4), shCsus2 = sh([-1, 3, 0, 0, 1, 3], NM.Csus2);
const shCdim = sh([-1, 3, 4, 5, 4, -1], NM.Cdim), shCaug = sh([-1, 3, 2, 1, 1, 0], NM.Caug);
const shCbarre = sh([8, 10, 10, 9, 8, 8], NM.C, 0, { barre: { fret: 8, from: 6, to: 1 } });

const pentAm = G.box({
    lo: 5, rows: 4, width: 780,
    dots: [[6, 5, "Lá", 1], [6, 8, "Dó"], [5, 5, "Ré"], [5, 7, "Mi"], [4, 5, "Sol"], [4, 7, "Lá", 1], [3, 5, "Dó"], [3, 7, "Ré"], [2, 5, "Mi"], [2, 8, "Sol"], [1, 5, "Lá", 1], [1, 8, "Dó"]]
});
const spider = (strs) => G.box({ lo: 1, rows: 4, width: 760, dots: strs.flatMap((s) => [1, 2, 3, 4].map((f) => [s, f, String(f), 0])) });

export const aulas = [
    {
        n: 4, titulo: "Tons, semitons e escalas", livre: false,
        desc: "Distância entre as notas, escala maior, escala menor, pentatônica e o exercício Construir Escalas.",
        partes: [
            {
                id: "a4p1", titulo: "Tom e semitom", desc: "A menor distância entre duas notas e como ela aparece nas casas do violão.", cenas: [
                    { say: "Até agora você aprendeu os nomes das notas. Agora vamos entender a distância entre elas.", g: G.chips(["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"]) },
                    { say: "A menor distância entre duas notas é o semitom. No violão, um semitom é a distância de uma casa.", g: G.strip({ from: 0, to: 4, hl: [0, 1], label: "um semitom = uma casa" }) },
                    { say: "Dois semitons formam um tom. Então, um tom são duas casas, como de Fá para Sol.", g: G.strip({ from: 0, to: 4, hl: [1, 3], label: "um tom = duas casas" }) },
                    { say: "Entre as notas naturais, quase tudo é tom. As exceções são de Mi para Fá e de Si para Dó, que são semitons.", g: G.chain(maj, stepsMaj, { hlSteps: [2, 6], tonic: -1 }) },
                    { say: "As notas do meio ganham outro nome: o sustenido sobe um semitom, e o bemol desce um semitom.", g: G.keys({ sel: [1], tonic: null }) },
                    { say: "No total são doze notas diferentes, antes de tudo se repetir. No site, o exercício Construir Escalas usa essas doze teclas.", g: G.keys({ sel: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }) }
                ]
            },
            {
                id: "a4p2", titulo: "A escala maior", desc: "A fórmula tom, tom, semitom, tom, tom, tom, semitom e a escala de Dó maior.", cenas: [
                    { say: "Uma escala é uma sequência de notas organizada por tons e semitons. A mais importante é a escala maior.", g: G.big("Escala maior", "a base de quase tudo") },
                    { say: "A fórmula da escala maior é: tom, tom, semitom, tom, tom, tom, semitom.", g: G.chips([T, T, S, T, T, T, S], { size: 120 }) },
                    { say: "Começando no Dó e seguindo a fórmula, chegamos em: Dó, Ré, Mi, Fá, Sol, Lá, Si e Dó de novo.", g: G.chain(maj, stepsMaj, { tonic: 0 }) },
                    { say: "Repare: de Mi para Fá e de Si para Dó estão os dois semitons, exatamente onde a fórmula pede.", g: G.chain(maj, stepsMaj, { hlSteps: [2, 6], tonic: 0 }) },
                    { say: "Cada nota recebe um número, o grau. Dó é o grau um, Ré é o dois, e assim por diante.", g: G.chips(["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"].map((t, i) => (i === 0 ? tn(t, "1") : { t, sub: String(i + 1) }))) },
                    { say: "Essas são as sete notas da escala de Dó maior. Guarde essa fórmula, porque ela vale para qualquer tom.", g: G.keys({ sel: [0, 2, 4, 5, 7, 9, 11], tonic: 0 }) }
                ]
            },
            {
                id: "a4p3", titulo: "Escala maior em qualquer tom", desc: "A mesma fórmula começando em outra nota: Sol maior e o fá sustenido.", cenas: [
                    { say: "A fórmula da escala maior funciona começando em qualquer nota. Vamos testar com o Sol.", g: G.big("Sol maior", "tom, tom, semitom, tom, tom, tom, semitom") },
                    { say: "Sol, Lá, Si, Dó, Ré e Mi seguem a fórmula, só com notas naturais: tom, tom, semitom, tom, tom.", g: G.chain(["Sol", "Lá", "Si", "Dó", "Ré", "Mi"], ["T", "T", "st", "T", "T"], { tonic: 0 }) },
                    { say: "Depois do Mi, a fórmula pede um tom. Mi mais um tom é o Fá sustenido, e não o Fá natural.", g: G.chain(["Ré", "Mi", "Fá♯"], ["T", "T"], { hlNotes: [2], tonic: -1 }) },
                    { say: "Por fim, do Fá sustenido para o Sol é um semitom, como a fórmula pede.", g: G.chain(["Mi", "Fá♯", "Sol"], ["T", "st"], { hlNotes: [1], hlSteps: [1], tonic: -1 }) },
                    { say: "A escala de Sol maior é: Sol, Lá, Si, Dó, Ré, Mi e Fá sustenido. Ela tem um sustenido.", g: G.chips([tn("Sol"), { t: "Lá" }, { t: "Si" }, { t: "Dó" }, { t: "Ré" }, { t: "Mi" }, on("Fá♯")]) },
                    { say: "Para treinar, abra o exercício Construir Escalas, escolha um tom e marque as notas que formam a escala.", g: G.keys({ sel: [2, 4, 6, 7, 9, 11], tonic: 7 }) }
                ]
            },
            {
                id: "a4p4", titulo: "Escala menor natural", desc: "A fórmula da escala menor e a diferença de som para a escala maior.", cenas: [
                    { say: "A escala menor tem um som mais sério e triste, ao contrário da escala maior, que soa alegre.", g: G.big("Escala menor", "um som mais sério") },
                    { say: "A fórmula da escala menor natural é: tom, semitom, tom, tom, semitom, tom, tom.", g: G.chips([T, S, T, T, S, T, T], { size: 120 }) },
                    { say: "Começando no Lá, temos: Lá, Si, Dó, Ré, Mi, Fá, Sol e Lá.", g: G.chain(["Lá", "Si", "Dó", "Ré", "Mi", "Fá", "Sol", "Lá"], ["T", "st", "T", "T", "st", "T", "T"], { tonic: 0 }) },
                    {
                        say: "Compare com Lá maior. A diferença está no terceiro, no sexto e no sétimo grau, que ficam um semitom mais baixos.",
                        g: G.compare({ titulo: "Lá maior", itens: ["Lá", "Si", { t: "Dó♯", kind: "on" }, "Ré", "Mi", { t: "Fá♯", kind: "on" }, { t: "Sol♯", kind: "on" }], size: 112 },
                            { titulo: "Lá menor", itens: ["Lá", "Si", { t: "Dó", kind: "on" }, "Ré", "Mi", { t: "Fá", kind: "on" }, { t: "Sol", kind: "on" }], size: 112 })
                    },
                    { say: "Curiosidade: Lá menor natural usa as mesmas notas de Dó maior, só que começando no Lá.", g: G.compare({ titulo: "Dó maior", itens: ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"], size: 112 }, { titulo: "Lá menor", itens: [tn("Lá"), "Si", "Dó", "Ré", "Mi", "Fá", "Sol"], size: 112 }) },
                    { say: "No exercício Construir Escalas, escolha Menor Natural e confira a fórmula e as notas no braço do violão.", g: G.keys({ sel: [0, 2, 4, 5, 7, 11], tonic: 9 }) }
                ]
            },
            {
                id: "a4p5", titulo: "Escala pentatônica menor", desc: "A escala de cinco notas mais usada em solos e o desenho no braço.", cenas: [
                    { say: "A pentatônica tem apenas cinco notas, por isso o nome. É a escala mais usada em solos de rock, blues e música popular.", g: G.big("Pentatônica", "cinco notas") },
                    { say: "A pentatônica menor usa o grau um, a terça menor, o quatro, o cinco e a sétima menor.", g: G.chips([tn("1"), { t: "♭3" }, { t: "4" }, { t: "5" }, { t: "♭7" }]) },
                    { say: "Em Lá, as notas são: Lá, Dó, Ré, Mi e Sol.", g: G.chips([tn("Lá", "1"), { t: "Dó", sub: "♭3" }, { t: "Ré", sub: "4" }, { t: "Mi", sub: "5" }, { t: "Sol", sub: "♭7" }]) },
                    { say: "No braço, o desenho mais famoso começa na quinta casa, com duas notas em cada corda.", g: pentAm },
                    { say: "Comece pela sexta corda, na quinta casa, que é a nota Lá. Suba tocando duas notas em cada corda, até a primeira.", g: pentAm },
                    { say: "Para treinar, use o exercício Construir Escalas, escolha Pentatônica Menor e veja todas as notas no braço.", g: G.keys({ sel: [0, 2, 4, 7], tonic: 9 }) }
                ]
            },
            {
                id: "a4p6", titulo: "Treinando escalas no site", desc: "Como usar o exercício Construir Escalas e o jogo Nome da Escala.", cenas: [
                    { say: "Agora que você conhece as escalas, vamos praticar no site. Abra o menu Exercícios e escolha Construir Escalas.", g: G.list(["Menu Exercícios", "Construir Escalas"], { hl: [1] }) },
                    { say: "Escolha o tom e o tipo de escala. A tônica já vem marcada para você.", g: G.keys({ sel: [], tonic: 2 }) },
                    { say: "Marque as teclas das notas da escala e clique em Verificar.", g: G.keys({ sel: [4, 5, 7, 9, 11, 0], tonic: 2 }) },
                    { say: "Se errar, o site avisa quantas notas faltam. Você tem duas chances, e depois a resposta aparece em verde para memorizar.", g: G.list(["1ª tentativa: o site avisa", "2ª tentativa: última chance", "Depois: resposta em verde"], { hl: [2] }) },
                    { say: "Embaixo, o desenho do braço mostra onde cada nota fica. Você pode escolher a região do braço que quer ver.", g: pentAm },
                    { say: "Depois, jogue o Nome da Escala, no menu Jogos. Você vê as notas e escolhe o nome certo. Acertando, você sobe no ranking.", g: G.list(["Menu Jogos", "Nome da Escala", "Suba no ranking"], { hl: [1] }) }
                ]
            }
        ]
    },
    {
        n: 5, titulo: "Construindo acordes", livre: false,
        desc: "Graus, tríades maiores e menores, diminutos, aumentados, sétimas, sextas, nonas e as formas no braço.",
        partes: [
            {
                id: "a5p1", titulo: "Graus e intervalos", desc: "Como contar os graus a partir da tônica: terça e quinta.", cenas: [
                    { say: "Um acorde é feito de notas escolhidas dentro de uma escala. Para construir acordes, precisamos entender os graus.", g: G.big("Graus", "o número de cada nota") },
                    { say: "Os graus são os números das notas da escala, contados a partir da tônica. Em Dó maior, Dó é o um, Ré é o dois, Mi é o três.", g: G.chips([tn("Dó", "1"), { t: "Ré", sub: "2" }, { t: "Mi", sub: "3" }, { t: "Fá", sub: "4" }, { t: "Sol", sub: "5" }, { t: "Lá", sub: "6" }, { t: "Si", sub: "7" }]) },
                    { say: "A tônica é a nota que dá nome ao acorde. No acorde de Dó, a tônica é o Dó.", g: G.big("Tônica", "a nota que dá nome ao acorde") },
                    { say: "A distância entre duas notas se chama intervalo. De Dó até Mi, contando Dó, Ré e Mi, temos uma terça.", g: G.chips([tn("Dó", "1"), { t: "Ré", sub: "2" }, on("Mi", "3")], { size: 190 }) },
                    { say: "De Dó até Sol, contando cinco notas, temos uma quinta.", g: G.chips([tn("Dó", "1"), { t: "Ré", sub: "2" }, { t: "Mi", sub: "3" }, { t: "Fá", sub: "4" }, on("Sol", "5")]) },
                    { say: "Quase todo acorde começa com a tônica, a terça e a quinta. Guarde esses três nomes.", g: G.chips([tn("1", "tônica"), on("3", "terça"), on("5", "quinta")], { size: 220 }) }
                ]
            },
            {
                id: "a5p2", titulo: "Tríade maior", desc: "O acorde de três notas: tônica, terça maior e quinta.", cenas: [
                    { say: "A tríade é o acorde mais simples. Ela tem três notas: a tônica, a terça e a quinta.", g: G.chips([tn("1"), on("3"), on("5")], { size: 220 }) },
                    { say: "Na tríade maior, a terça fica a dois tons da tônica, e a quinta fica a três tons e meio acima da tônica.", g: G.keys({ sel: [4, 7], tonic: 0 }) },
                    { say: "Em Dó, a terça é o Mi e a quinta é o Sol. Por isso o acorde de Dó maior tem as notas Dó, Mi e Sol.", g: shC },
                    { say: "Para Sol maior, a tônica é o Sol, a terça é o Si e a quinta é o Ré.", g: G.chips([tn("Sol", "1"), on("Si", "3"), on("Ré", "5")], { size: 220 }) },
                    { say: "A fórmula vale para qualquer tom: um, três e cinco. Em Ré maior, as notas são Ré, Fá sustenido e Lá.", g: G.chips([tn("Ré", "1"), on("Fá♯", "3"), on("Lá", "5")], { size: 220 }) },
                    { say: "No exercício Construir Acordes, escolha o tipo Maior e marque essas três notas.", g: G.keys({ sel: [2, 6, 9], tonic: 2 }) }
                ]
            },
            {
                id: "a5p3", titulo: "Tríade menor", desc: "A terça menor e a diferença de som entre acorde maior e menor.", cenas: [
                    { say: "Para fazer um acorde menor, só uma nota muda: a terça fica um semitom mais baixa.", g: G.big("Menor", "a terça desce um semitom") },
                    { say: "Dó maior tem Dó, Mi e Sol. Dó menor tem Dó, Mi bemol e Sol.", g: G.compare({ titulo: "Dó maior", itens: [tn("Dó"), "Mi", "Sol"], size: 170 }, { titulo: "Dó menor", itens: [tn("Dó"), on("Mi♭"), "Sol"], size: 170 }) },
                    { say: "A fórmula do acorde menor é: um, terça menor e cinco.", g: G.chips([tn("1"), on("♭3"), { t: "5" }], { size: 220 }) },
                    { say: "Essa pequena mudança deixa o som mais triste. Toque os dois no violão e compare.", g: G.twoBoxes(shC, shCm, "Dó maior", "Dó menor") },
                    { say: "Lá menor, que você já aprendeu, tem as notas Lá, Dó e Mi. A terça é o Dó, a um tom e meio da tônica.", g: shAm },
                    { say: "Para treinar, escolha o tipo Menor no exercício e marque a tônica, a terça menor e a quinta.", g: G.keys({ sel: [0, 3, 7], tonic: 0 }) }
                ]
            },
            {
                id: "a5p4", titulo: "Acordes diminuto e aumentado", desc: "As duas tríades que mudam a quinta: diminuta e aumentada.", cenas: [
                    { say: "Existem mais duas tríades: a diminuta e a aumentada. Elas mudam a quinta do acorde.", g: G.big("Diminuto e aumentado", "mudam a quinta") },
                    { say: "No acorde diminuto, a terça é menor e a quinta fica um semitom mais baixa. Em Dó: Dó, Mi bemol e Sol bemol.", g: G.chips([tn("Dó", "1"), { t: "Mi♭", sub: "♭3" }, on("Sol♭", "♭5")], { size: 220 }) },
                    { say: "Ele soa tenso e pede para resolver em outro acorde. A cifra é a letra seguida de d i m.", g: shCdim },
                    { say: "No acorde aumentado, a terça é maior e a quinta fica um semitom mais alta. Em Dó: Dó, Mi e Sol sustenido.", g: G.chips([tn("Dó", "1"), { t: "Mi", sub: "3" }, on("Sol♯", "♯5")], { size: 220 }) },
                    { say: "A cifra do aumentado é a letra seguida de a u g.", g: shCaug },
                    { say: "Veja os quatro tipos no exercício Construir Acordes e compare as fórmulas.", g: G.list(["Maior: 1 – 3 – 5", "Menor: 1 – ♭3 – 5", "Diminuto: 1 – ♭3 – ♭5", "Aumentado: 1 – 3 – ♯5"]) }
                ]
            },
            {
                id: "a5p5", titulo: "Acordes com sétima", desc: "Sétima menor, sétima maior e o menor com sétima.", cenas: [
                    { say: "Acrescentando mais uma nota, a sétima, o acorde ganha uma cor nova.", g: G.chips([tn("1"), { t: "3" }, { t: "5" }, on("7")], { size: 180 }) },
                    { say: "Três sétimas são muito usadas: a dominante, a sétima maior e o menor com sétima.", g: G.list(["C7 · dominante", "C7M · sétima maior", "Cm7 · menor com sétima"]) },
                    { say: "O acorde C com sete, o dominante, tem Dó, Mi, Sol e Si bemol. A fórmula é um, três, cinco e sétima menor.", g: shC7 },
                    { say: "O acorde de sétima maior, escrito C sete M, tem Dó, Mi, Sol e Si. O Si fica um semitom abaixo do Dó seguinte.", g: shC7M },
                    { say: "O acorde menor com sétima, o C m sete, tem Dó, Mi bemol, Sol e Si bemol.", g: shCm7 },
                    { say: "Para treinar, escolha esses três tipos no exercício Construir Acordes e compare as notas de cada um.", g: G.list(["1 – 3 – 5 – ♭7", "1 – 3 – 5 – 7", "1 – ♭3 – 5 – ♭7"]) }
                ]
            },
            {
                id: "a5p6", titulo: "Sexta, nona e suspensos", desc: "Os acordes com sexta, nona e os suspensos sus dois e sus quatro.", cenas: [
                    { say: "Ainda existem acordes com outros nomes. Vamos ver os mais comuns.", g: G.list(["Com sexta: C6", "Com nona: C9", "Suspensos: Csus2 e Csus4"]) },
                    { say: "O acorde com sexta, C seis, acrescenta a sexta nota da escala. Em Dó, é o Lá. As notas são Dó, Mi, Sol e Lá.", g: shC6 },
                    { say: "A nona fica dois graus acima da tônica, uma oitava depois. Em Dó, é o Ré. O C nove tem Dó, Mi, Sol, Si bemol e Ré.", g: shC9 },
                    { say: "Os acordes suspensos trocam a terça por outra nota. No sus quatro, a terça vira a quarta: Dó, Fá e Sol.", g: shCsus4 },
                    { say: "No sus dois, a terça vira a segunda: Dó, Ré e Sol.", g: shCsus2 },
                    { say: "Todos esses acordes estão na lista do exercício Construir Acordes. Escolha o tipo e treine.", g: G.keys({ sel: [0, 2, 7], tonic: 0 }) }
                ]
            },
            {
                id: "a5p7", titulo: "Acordes no braço do violão", desc: "Como ler o desenho do acorde e usar Outra forma e o seletor de casas.", cenas: [
                    { say: "No exercício Construir Acordes, depois de responder, o site mostra o acorde no braço do violão.", g: shC },
                    { say: "O X é a corda que não toca, a bolinha vazia é a corda solta, e as bolinhas coloridas são as notas apertadas.", g: shC },
                    { say: "Clique em Outra forma para ver o mesmo acorde em outras posições do braço.", g: G.twoBoxes(shC, shCbarre, "Forma aberta", "Forma na 8ª casa") },
                    { say: "O acorde com pestana usa o dedo um para apertar várias cordas na mesma casa. Dó maior na oitava casa é um exemplo.", g: shCbarre },
                    { say: "O seletor de casa deixa você escolher a região do braço. Escolha a casa sete, por exemplo, e veja as formas mais próximas.", g: G.list(["Perto da casa 7", "Outra forma", "Veja todas as posições"], { hl: [0] }) },
                    { say: "Assim você descobre onde está cada acorde em todo o braço do violão, e não só nas primeiras casas.", g: G.big("O braço todo", "um acorde, várias posições") }
                ]
            }
        ]
    },
    {
        n: 6, titulo: "Técnica e treino", livre: false,
        desc: "O exercício Aranha, suas variações e uma rotina de estudo diária.",
        partes: [
            {
                id: "a6p1", titulo: "Por que treinar técnica", desc: "A numeração dos dedos e por que poucos minutos por dia funcionam.", cenas: [
                    { say: "Tocar bem violão depende da coordenação entre os dedos. Exercícios de técnica treinam isso.", g: G.big("Técnica", "coordenação dos dedos") },
                    { say: "Os dedos da mão esquerda são numerados: o indicador é o um, o médio é o dois, o anelar é o três e o mindinho é o quatro.", g: G.chips([{ t: "1", sub: "indicador" }, { t: "2", sub: "médio" }, { t: "3", sub: "anelar" }, { t: "4", sub: "mindinho" }], { size: 200 }) },
                    { say: "No começo, os dedos três e quatro são fracos e desobedientes. Isso é normal, e o treino resolve.", g: G.chips([{ t: "1", kind: "on" }, { t: "2", kind: "on" }, { t: "3" }, { t: "4" }], { size: 200 }) },
                    { say: "Cinco a dez minutos por dia valem mais do que uma hora só no fim de semana.", g: G.big("5 a 10 min", "por dia") },
                    { say: "No menu Exercícios do site, você encontra o exercício Aranha, que treina exatamente isso.", g: G.list(["Menu Exercícios", "Técnica (Aranha)"], { hl: [1] }) }
                ]
            },
            {
                id: "a6p2", titulo: "O exercício Aranha", desc: "Um dedo para cada casa: dedos 1, 2, 3 e 4 nas casas 1, 2, 3 e 4.", cenas: [
                    { say: "O exercício Aranha usa um dedo para cada casa: dedo um na casa um, dedo dois na casa dois, dedo três na casa três e dedo quatro na casa quatro.", g: spider([6]) },
                    { say: "Em cada nota, a mão direita toca com o polegar. Ao terminar uma corda, você sobe para a próxima.", g: spider([6, 5]) },
                    { say: "O nome vem do movimento dos dedos, que caminham pelo braço como as pernas de uma aranha.", g: spider([6, 5, 4]) },
                    { say: "Cada dedo fica perto da casa, sem encostar nas cordas vizinhas, e o polegar da mão esquerda fica atrás do braço.", g: G.list(["Dedo perto do traste", "Sem encostar na corda vizinha", "Polegar atrás do braço"]) },
                    { say: "No site, o exercício acende os dedos no braço, e você acompanha com o violão.", g: spider([6, 5, 4, 3, 2, 1]) }
                ]
            },
            {
                id: "a6p3", titulo: "Fazendo a Aranha, passo a passo", desc: "Como configurar e praticar o exercício com a velocidade certa.", cenas: [
                    { say: "Abra o exercício Aranha e deixe a velocidade em sessenta notas por minuto.", g: G.big("60", "notas por minuto") },
                    { say: "Escolha a ordem um, dois, três, quatro, e as cordas da sexta para a primeira.", g: G.chips(["1", "2", "3", "4"], { size: 180 }) },
                    { say: "Aperte o botão Iniciar. O dedo que acende é o dedo que você deve apertar, na casa indicada.", g: spider([6]) },
                    { say: "Os dedos que já tocaram ficam apertados até o fim da corda. Isso treina a firmeza e a independência dos dedos.", g: G.list(["Dedo 1 fica apertado", "Dedo 2 fica apertado", "Dedo 3 fica apertado"], { hl: [0, 1, 2] }) },
                    { say: "Quando errar, pare, respire e volte mais devagar. A velocidade vem depois da limpeza do som.", g: G.big("Devagar", "primeiro o som limpo") },
                    { say: "Só aumente a velocidade quando conseguir fazer três voltas seguidas sem errar.", g: G.list(["3 voltas sem errar", "Aumente a velocidade"], { hl: [1] }) }
                ]
            },
            {
                id: "a6p4", titulo: "Variações da Aranha", desc: "Outras ordens de dedos, ida e volta, pestana e avançar casa.", cenas: [
                    { say: "Depois de dominar a ordem um, dois, três, quatro, mude a ordem para desafiar os dedos.", g: G.chips(["1", "2", "3", "4"], { size: 180 }) },
                    { say: "Experimente um, três, dois, quatro. Depois, um, dois, quatro, três, e também a ordem inversa.", g: G.list(["1 – 3 – 2 – 4", "1 – 2 – 4 – 3", "4 – 3 – 2 – 1"]) },
                    { say: "A opção ida e volta toca as cordas descendo e subindo, sem parar.", g: G.big("Ida e volta", "6 → 1 → 6") },
                    { say: "A opção pestana usa o dedo um apertando todas as cordas, e treina a firmeza da pestana.", g: G.box({ lo: 1, rows: 4, width: 760, barre: { fret: 1, from: 6, to: 1 }, dots: [[6, 2, "2"], [5, 3, "3"], [4, 4, "4"]] }) },
                    { say: "A opção avançar casa muda a posição a cada rodada, e você treina em todo o braço.", g: G.list(["Casa 1", "Casa 2", "Casa 3…"], { hl: [2] }) },
                    { say: "Escolha uma variação por dia. Assim o treino não fica repetitivo.", g: G.big("Uma por dia", "treino sem tédio") }
                ]
            },
            {
                id: "a6p5", titulo: "Rotina de estudo diária", desc: "Um plano de dez a quinze minutos com os exercícios e jogos do site.", cenas: [
                    { say: "Uma boa rotina de estudo tem poucos minutos e várias partes. Vamos montar a sua.", g: G.big("Sua rotina", "10 a 15 minutos") },
                    { say: "Primeiro, dois a três minutos de Aranha para aquecer os dedos.", g: G.list(["1. Aranha · 3 min"], { hl: [0] }) },
                    { say: "Depois, cinco minutos de Construir Acordes ou Construir Escalas, escolhendo um tom novo a cada dia.", g: G.list(["1. Aranha · 3 min", "2. Construir · 5 min"], { hl: [1] }) },
                    { say: "Em seguida, jogue um dos jogos do site para fixar os nomes. Acertando, você sobe no ranking.", g: G.list(["1. Aranha · 3 min", "2. Construir · 5 min", "3. Jogos · 3 min"], { hl: [2] }) },
                    { say: "Termine tocando os acordes que você já sabe, com a batida da aula três.", g: G.list(["1. Aranha · 3 min", "2. Construir · 5 min", "3. Jogos · 3 min", "4. Tocar · 5 min"], { hl: [3] }) },
                    { say: "Com dez a quinze minutos por dia, em um mês você sente a diferença. Bons estudos!", g: G.big("Bons estudos!", "até a próxima aula") }
                ]
            }
        ]
    }
];
