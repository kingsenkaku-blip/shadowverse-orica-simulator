# shadowverse-orica-simulator

Shadowverse風のオリジナルカード調整・検証用に作った、テキストベースの静的Webシミュレーターです。

- Vite + React + TypeScript
- 参照デッキ同士のミラーマッチ
- GitHub Pages向け `base: "/shadowverse-orica-simulator/"`
- 公式カード画像・音声・商標素材は未使用
- カード定義は `src/data/cards/armed-dragon.ts`
- デッキリストは `src/data/decks/armed-dragon.ts`

## 実装範囲

武装ドラゴンです

MVPとして、以下を優先しています。

- カードをプレイする
- フォロワーで攻撃する
- 進化する
- ターンを進める
- 簡易AIと対戦する
- リーダー体力による勝敗判定

カード効果は検証で重要な動きから部分実装しています。公式挙動の完全再現ではありません。未実装または簡略化した挙動はカード定義の `implemented` / `notes` に残しています。

## セットアップ

```bash
npm install
npm run dev
```

## テストとビルド

```bash
npm run test
npm run build
```

## GitHub Pages

`main` ブランチへ push すると `.github/workflows/deploy.yml` が `npm ci`、テスト、ビルドを実行し、`dist` を GitHub Pages にデプロイします。

公開URLは次を想定しています。

```txt
https://<github-user>.github.io/shadowverse-orica-simulator/
```
