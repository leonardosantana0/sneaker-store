# 👟 SneakerStore — Guia de Configuração e APK

App de e-commerce de tênis estilo Nike, construído com **Expo + Expo Router + TypeScript**.

---

## 🚀 Rodando o Projeto Localmente

### 1. Pré-requisitos

- Node.js 18+
- npm ou yarn
- [Expo Go](https://expo.dev/client) instalado no celular (ou emulador Android)

### 2. Instalar dependências

```bash
cd sneaker-store
npm install
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

Escaneie o QR Code com o **Expo Go** no celular (iOS ou Android).

---

## 📱 Gerando o APK com EAS Build

### 1. Instalar o EAS CLI globalmente

```bash
npm install -g eas-cli
```

### 2. Criar uma conta no Expo (se não tiver)

```bash
# Acesse https://expo.dev e crie uma conta gratuita
eas login
```

### 3. Configurar o projeto (primeira vez)

```bash
eas build:configure
```

### 4. Gerar o APK de preview (instalável diretamente)

```bash
eas build -p android --profile preview
```

> O build roda na nuvem (~10–15 min). Ao final, você recebe o link do `.apk` para download e instalação direta no Android.

### 5. (Opcional) Build de produção para Google Play

```bash
eas build -p android --profile production
```

> Gera um `.aab` (Android App Bundle) pronto para upload na Play Store.

---

## 📂 Estrutura de Arquivos

```
sneaker-store/
├── app/                    # Expo Router — telas
│   ├── _layout.tsx         # Root layout (CartProvider)
│   ├── index.tsx           # Home / Catálogo
│   ├── product/[id].tsx    # Detalhe do produto
│   ├── cart.tsx            # Carrinho
│   ├── profile.tsx         # Perfil (expo-image-picker)
│   └── checkout.tsx        # Checkout (ViaCEP + GPS)
├── components/
│   ├── CustomButton.tsx    # Botão reutilizável
│   ├── ProductCard.tsx     # Card de produto
│   ├── CartItem.tsx        # Item do carrinho
│   └── Header.tsx          # Cabeçalho
├── context/
│   └── CartContext.tsx     # Estado global do carrinho
├── hooks/
│   ├── useCart.ts
│   └── useProducts.ts
├── services/
│   ├── storageService.ts   # AsyncStorage
│   └── viaCepService.ts    # API ViaCEP
├── types/index.ts
├── utils/
│   ├── constants.ts        # Cores, tipografia
│   ├── mockData.ts         # 12 produtos Nike-style
│   └── formatters.ts
├── app.json
├── eas.json
└── package.json
```

---

## ✅ Funcionalidades Implementadas

| Feature | Status |
|---------|--------|
| Catálogo de tênis (FlatList 2 colunas) | ✅ |
| Banner "Em Destaque" (scroll horizontal) | ✅ |
| Filtros por categoria + busca | ✅ |
| Detalhes do produto (tamanho, cor) | ✅ |
| Adicionar ao carrinho | ✅ |
| Carrinho com controle de quantidade | ✅ |
| Persistência do carrinho (AsyncStorage) | ✅ |
| **Foto de perfil — expo-image-picker** 📷 | ✅ |
| **GPS para cidade — expo-location** 📍 | ✅ |
| **Busca de endereço — API ViaCEP** 🌐 | ✅ |
| Seleção de pagamento (PIX, Cartão, Boleto) | ✅ |
| Design estilo Nike (preto + laranja) | ✅ |
