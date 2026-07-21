# Site Aula Musica Iniciante

Implementacao de autenticacao, formulario de visitantes e chat com upload de imagem/video para um site estatico hospedado no Netlify.

## Estrutura adicionada

```text
comunidade.html
comunidade-admin.html
css/css/community.css
css/css/community-admin.css
js/js/community/
	firebase-config.js
	firebase-client.js
	auth-service.js
	visitor-service.js
	chat-service.js
	main.js
	admin-main.js
```

## O que cada modulo faz

1. `firebase-config.js`: recebe as chaves do projeto Firebase.
2. `firebase-client.js`: inicializa Auth, Firestore e Storage.
3. `auth-service.js`: cadastro, login, logout e perfil com role.
4. `visitor-service.js`: envia formulario vinculado ao UID.
5. `chat-service.js`: mensagens, lista de conversas e upload de anexo.
6. `main.js`: conecta UI da pagina `comunidade.html` com os servicos.
7. `admin-main.js`: painel restrito para admins com filtros, status e resposta rapida.

## Painel Admin separado

URL:

- `comunidade-admin.html`

Recursos:

1. Lista de entradas de `visitorEntries`.
2. Filtro por status: `new`, `open`, `resolved`.
3. Alteracao de status com um clique.
4. Resposta rapida no chat do usuario da entrada selecionada.
5. Upload de imagem/video na resposta admin.

Observacao:

- O painel so libera dados se `role` do usuario for `admin` em `userProfiles/{uid}`.

## Fluxo funcional

1. Usuario cria conta ou faz login com email/senha.
2. Perfil e role sao gravados em `userProfiles/{uid}`.
3. Formulario de visitante grava em `visitorEntries` com `uid`.
4. Chat do usuario usa thread `chats/{uid}` e subcolecao `messages`.
5. Admin enxerga lista de threads e responde no mesmo canal.
6. Imagem/video sao enviados para Storage em `chatAttachments/{threadId}`.

## Setup Firebase (passo a passo)

1. Crie um projeto em Firebase Console.
2. Ative Authentication com Email/Password.
3. Crie Firestore em modo production.
4. Crie Storage em modo production.
5. Em Project Settings > General > Your apps (Web), copie as credenciais.
6. Preencha `js/js/community/firebase-config.js`.

Exemplo de `firebase-config.js`:

```js
export const firebaseConfig = {
		apiKey: "...",
		authDomain: "seu-projeto.firebaseapp.com",
		projectId: "seu-projeto",
		storageBucket: "seu-projeto.appspot.com",
		messagingSenderId: "...",
		appId: "..."
};
```

## Regras recomendadas do Firestore

Copie as regras do arquivo `firestore.rules` ja incluido no projeto:

service cloud.firestore {
	match /databases/{database}/documents {
		function isSignedIn() {
			return request.auth != null;
		}

		function isOwner(uid) {
			return isSignedIn() && request.auth.uid == uid;
		}

		function isAdmin() {
			return isSignedIn() &&
				get(/databases/$(database)/documents/userProfiles/$(request.auth.uid)).data.role == 'admin';
		}

		match /userProfiles/{uid} {
			allow read: if isOwner(uid) || isAdmin();
			allow create: if isOwner(uid);
			allow update: if isOwner(uid) || isAdmin();
		}

		match /visitorEntries/{entryId} {
			allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid;
			allow read: if isAdmin() || (isSignedIn() && resource.data.uid == request.auth.uid);
			allow update, delete: if isAdmin();
		}

		match /chats/{threadId} {
			allow read, create, update: if isAdmin() || isOwner(threadId);

			match /messages/{messageId} {
				allow read, create: if isAdmin() || isOwner(threadId);
				allow update, delete: if false;
			}
		}
	}
}
```

## Regras recomendadas do Storage

Copie as regras do arquivo `storage.rules` ja incluido no projeto:

service firebase.storage {
	match /b/{bucket}/o {
		match /chatAttachments/{threadId}/{fileName} {
			allow read: if request.auth != null;
			allow write: if request.auth != null &&
				(request.auth.uid == threadId ||
				firestore.get(/databases/(default)/documents/userProfiles/$(request.auth.uid)).data.role == 'admin') &&
				request.resource.size < 20 * 1024 * 1024 &&
				request.resource.contentType.matches('image/.*|video/.*');
		}
	}
}
```

## Definir Admin

1. Crie um usuario normal pelo front.
2. No Firestore, abra `userProfiles/<uid>`.
3. Altere o campo `role` para `admin`.

## Deploy no Netlify

1. Commit e push para o repositorio conectado ao Netlify.
2. Aguarde novo deploy automatico.
3. Acesse `comunidade.html` no site publicado.

## Termos de uso

O link de termos foi adicionado na pagina de comunidade apontando para:

`Termos_de_Uso_e_Politica_de_Privacidade.pdf`# Deploy rebuild
