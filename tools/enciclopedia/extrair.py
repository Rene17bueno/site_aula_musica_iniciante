"""Le a planilha da enciclopedia de acordes e grava tools/enciclopedia/fonte.json.
Uso: python3 tools/enciclopedia/extrair.py caminho/enciclopedia_acordes_violao_completo.xlsx"""
import json, sys, pandas as pd
xlsx = sys.argv[1]
xl = pd.ExcelFile(xlsx)
clean = lambda v: "" if pd.isna(v) else str(v).strip()
notas = [dict(cifra=clean(r.iloc[0]), nota=clean(r.iloc[1]), sustenido=clean(r.iloc[2]), bemol=clean(r.iloc[3]), explicacao=clean(r.iloc[4]))
         for _, r in xl.parse(xl.sheet_names[0]).iterrows()]
acordes = []
for grupo, sheet in (("maior-menor", 1), ("variacao", 2), ("slash", 3)):
    for _, r in xl.parse(xl.sheet_names[sheet]).iterrows():
        acordes.append(dict(grupo=grupo, cifra=clean(r.iloc[0]), nome=clean(r.iloc[1]), tipo=clean(r.iloc[2]),
                            descricao=clean(r.iloc[3]) if len(r) > 3 else ""))
json.dump(dict(notas=notas, acordes=acordes), open("tools/enciclopedia/fonte.json", "w"), ensure_ascii=False, indent=1)
print(len(notas), "notas,", len(acordes), "acordes")
