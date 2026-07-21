# Guia de Teste do Deploy - Site Aula Música Iniciante

## ✅ Checklist Pré-Deploy

- [ ] Firebase Rules (Firestore) - Aplicadas no Firebase Console
- [ ] Firebase Rules (Storage) - Aplicadas no Firebase Console
- [ ] Firebase Config - `js/js/community/firebase-config.js` preenchida corretamente
- [ ] Repositório GitHub - Último commit enviado (`997db78`)
- [ ] Netlify - Site conectado e em produção

---

## 🧪 Testes Recomendados

### 1. **Teste de Autenticação**
**URL**: `https://seu-site.netlify.app/comunidade.html`

#### Teste 1.1 - Signup com email
1. Clique em "Cadastro"
2. Preencha: Email, Senha (mín 8 caracteres)
3. Clique "Cadastrar"
4. ✅ Esperado: Redirecionado para formulário de visitante

#### Teste 1.2 - Login com email
1. Faça logout (se necessário)
2. Clique em "Login"
3. Use credenciais do teste anterior
4. ✅ Esperado: Login bem-sucedido, aparece seção de formulário

#### Teste 1.3 - Logout
1. Clique em "Sair"
2. ✅ Esperado: Volta para tela de login

---

### 2. **Teste de Formulário de Visitante**
**Pré-requisito**: Estar logado

1. Preencha:
   - Nome (auto-preenchido do Firebase Auth)
   - Email (auto-preenchido do Firebase Auth)
   - Assunto (ex: "Dúvida")
   - Mensagem (ex: "Qual o primeiro passo?")
2. Clique "Enviar"
3. ✅ Esperado: Mensagem de sucesso, entrada criada no Firestore

**Verificação no Firestore Console**:
```
Collection: visitorEntries
Document: {novo-id}
Fields:
  - uid: {seu-uid}
  - email: {seu-email}
  - name: {seu-nome}
  - topic: "Dúvida"
  - message: "Qual o primeiro passo?"
  - createdAt: {timestamp}
  - status: "new"
  - role: "user"
```

---

### 3. **Teste de Chat (Visitante)**
**Pré-requisito**: Estar logado com formulário preenchido

1. Role para a seção "Chat com Admin"
2. Digite mensagem: "Olá, tudo bem?"
3. Clique "Enviar"
4. ✅ Esperado: Mensagem aparece na thread

**Verificação no Firestore Console**:
```
Collection: chats
Document: {uid}
Fields:
  - updatedAt: {timestamp}
  - participantUids: [{uid}]
  
Subcollection: messages
Document: {msg-id}
Fields:
  - text: "Olá, tudo bem?"
  - senderId: {uid}
  - senderRole: "user"
  - createdAt: {timestamp}
```

---

### 4. **Teste de Upload de Imagem (Visitante)**
**Pré-requisito**: Estar logado no chat

1. Clique no botão de upload (📎 ou 🎬)
2. Selecione uma imagem PNG/JPG menor que 20MB
3. Clique "Enviar"
4. ✅ Esperado: Imagem aparece no chat com preview

**Verificação no Storage Console**:
```
Path: chatAttachments/{seu-uid}/{timestamp}_{filename}
```

---

### 5. **Teste de Painel Admin**
**URL**: `https://seu-site.netlify.app/comunidade-admin.html`

#### 5.1 - Acesso sem privilégios
1. Faça logout do visitante
2. Crie novo usuário (email de teste diferente)
3. Acesse a URL do painel admin
4. ✅ Esperado: Mensagem "Sem permissão para acessar painel admin"

#### 5.2 - Acesso com privilégios
1. No Firestore Console, vá para `userProfiles/{seu-primeiro-uid}`
2. Adicione/edite campo: `role: "admin"`
3. Faça logout e login novamente com essa conta
4. Acesse a URL do painel admin
5. ✅ Esperado: Carrega lista de entradas de visitantes

---

### 6. **Teste de Gerenciamento de Entradas (Admin)**
**Pré-requisito**: Estar logado como admin

1. Veja a lista de entradas (da seção 2)
2. Clique em uma entrada
3. Mude status: New → Open
4. ✅ Esperado: Pill de status muda de cor, timestamp atualizado

**Status esperados**:
- 🔴 **new** (vermelho) - Entrada recém-criada
- 🟡 **open** (amarelo) - Em atendimento
- 🟢 **resolved** (verde) - Resolvida

---

### 7. **Teste de Resposta Rápida (Admin)**
**Pré-requisito**: Admin logado com entrada selecionada

1. Na seção "Resposta Rápida", escolha um template
2. Ou digite manualmente: "Obrigado pelo contato!"
3. Clique "Enviar"
4. ✅ Esperado: Mensagem aparece no chat com `senderRole: "admin"`

**Verificação**:
- Chat do visitante deve receber a mensagem imediatamente
- Message aparece com avatar/identificação de admin

---

### 8. **Teste de Filtros (Admin)**
**Pré-requisito**: Admin com múltiplas entradas

1. Clique botão "Todas" → vê todas as entradas
2. Clique botão "Novas" → vê apenas status="new"
3. Clique botão "Abertas" → vê apenas status="open"
4. Clique botão "Resolvidas" → vê apenas status="resolved"
5. ✅ Esperado: Lista filtra corretamente

---

### 9. **Teste de Segurança - Firestore Rules**
**Objetivo**: Validar que regras estão funcionando

#### 9.1 - Usuário não pode editar entrada de outro
1. Visitante A cria uma entrada
2. Visitante B tenta atualizar via console: `db.collection('visitorEntries').doc(A_id).update(...)`
3. ✅ Esperado: Erro de permissão

#### 9.2 - Visitante não pode acessar chat de outro
1. Visitante A envia mensagem
2. Visitante B tenta acessar via console: `db.collection('chats').doc(A_uid)`
3. ✅ Esperado: Erro de permissão

#### 9.3 - Admin pode fazer tudo
1. Admin atualiza qualquer entrada
2. Admin envia mensagens em qualquer thread
3. ✅ Esperado: Sem erros de permissão

---

### 10. **Teste de Performance**
1. Abra DevTools (F12)
2. Aba "Network" → veja tamanho dos arquivos
3. Aba "Performance" → faça alguns testes
4. ✅ Esperado:
   - HTML/CSS/JS carregam em <2s
   - Interactions respondem em <500ms
   - Sem memory leaks após múltiplas aberturas de chat

---

## 🔍 Verificações no Firebase Console

### Firestore
```
✅ Collections criadas automaticamente:
  - userProfiles (com role='admin' para seu usuário)
  - visitorEntries (com entradas de teste)
  - chats/{uid}/messages (com mensagens de teste)

✅ Indexes (se necessário):
  - visitorEntries: orderBy(status, createdAt)
  - chats: orderBy(updatedAt)
```

### Storage
```
✅ Bucket criado com path:
  - chatAttachments/{threadId}/{timestamp}_{filename}

✅ Imagens/videos fazem upload sem erro
```

### Authentication
```
✅ Usuários de teste criados:
  - Email 1 (visitante)
  - Email 2 (admin)
```

---

## 🚨 Resolução de Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Firebase config inválida" | Verifique `js/js/community/firebase-config.js` - nenhum campo pode estar vazio ou com "SEU_" |
| "Sem permissão para criar entrada" | Firestore rules não aplicadas ou usuário não autenticado |
| "Chat não carrega" | Verifique se a subcollection `/messages` existe ou se há erro de permissão |
| "Upload falha" | Arquivo maior que 20MB ou tipo não é image/* ou video/* |
| "Admin não vê entradas" | Usuário não tem `role: "admin"` no `userProfiles` |
| "Imagem não mostra" | Storage rules não aplicadas ou path incorreto |

---

## 📋 Checklist Final

- [ ] Todos os 10 testes passaram
- [ ] Nenhuma mensagem de erro no Console (F12)
- [ ] Firestore Console mostra dados de teste
- [ ] Storage Console mostra arquivos de teste
- [ ] Admin consegue filtrar e responder entradas
- [ ] Site responde rápido em mobile (<2s)
- [ ] Netlify build logs sem warnings críticos

**Se tudo passou**: 🎉 Seu site está pronto para produção!

---

## 📞 Próximos Passos

1. Comunicar a URL para seus usuários
2. Monitorar Firebase Console para picos de uso
3. Revisar feedback regularmente no Painel Admin
4. Ajustar templates de resposta rápida conforme necessário

**Documentação**: Ver [README.md](README.md) para mais detalhes técnicos e deployment.
