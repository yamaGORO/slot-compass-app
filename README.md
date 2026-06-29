# Slot Compass

v0で作成したSlot CompassのUIをベースにした、パチスロ実戦データ用の期待値・予想設定計算アプリです。

## ローカルで起動する手順

```bash
cd /Users/yamamotoaya/slot-compass-app
npm install --no-package-lock
npm run dev
```

起動後、ブラウザで `http://localhost:3000` を開きます。別ポートで起動された場合は、ターミナルに表示されたURLを開いてください。

`pnpm` が使える環境では、既存の `pnpm-lock.yaml` に合わせて次の手順でも起動できます。

```bash
pnpm install
pnpm dev
```

本番ビルド確認は次のコマンドで実行します。

```bash
npm run build
```

## Vercelへ公開する手順

1. このプロジェクトをGitHubリポジトリへpushします。
2. VercelのDashboardで `Add New...` から `Project` を選び、GitHubリポジトリをImportします。
3. Framework Presetが `Next.js` になっていることを確認します。
4. Install CommandとBuild Commandは基本的に空欄のまま、Vercelの自動検出に任せます。手動指定する場合は、既存の `pnpm-lock.yaml` に合わせてInstall Commandを `pnpm install --frozen-lockfile`、Build Commandを `pnpm run build` にします。
5. `Deploy` を押すとPreview URLが発行されます。問題なければProductionへPromoteします。

Vercel CLIを使う場合は、ログイン後に以下を実行します。

```bash
vercel
vercel --prod
```

## GitHub Pagesで0円公開する手順

このリポジトリはGitHub Pages向けの静的デプロイにも対応しています。

1. `main` ブランチへpushします。
2. `STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/slot-compass-app npm run build` で `out/` を生成します。
3. `out/` の中身を `gh-pages` ブランチへpushします。
4. GitHubリポジトリの `Settings` → `Pages` で、公開元を `gh-pages` ブランチに設定します。

公開URLは次の形式です。

```text
https://yamaGORO.github.io/slot-compass-app/
```

このURLを知人へ共有すれば、追加コストなしで利用できます。iPhone Safariでは共有ボタンから「ホーム画面に追加」を選ぶと、PWAとして起動できます。

## 実装メモ

- 機種選択は計算画面右上のプルダウンに統一しています。
- Aタイプとスマスロは選択肢上では分けず、20機種を1つのリストとして表示します。
- 機種を選択するまで数値入力欄は表示しません。
- 数値入力欄は空欄から入力できます。残り時間の時間欄だけ、設定画面の「残り時間の初期値」を反映します。
- 出力は「期待値（円）」と「予想設定」を中心に表示し、GO/STOP/ヤメ推奨などの判断文は表示しません。
- PWA用の `manifest.webmanifest` とiPhone Safariのホーム画面追加用アイコンを追加しています。

## 計算ロジックと仮データ

計算画面は `lib/calculator.ts` だけを参照します。現在の実体は `lib/calculation/placeholder-engine.ts` に分離してあります。

仮の分布・補正値は `data/calculation-placeholder.ts` に分離しています。将来、本計算ロジックや正式な機種スペックへ差し替える場合は、UI側ではなくこの周辺を置き換えてください。

機種マスタの現在データは `data/machines.ts` にあります。参照用に受け取ったSlot Compassデータパッケージ内の機種名・追加入力項目を反映しています。計算値が参照データに含まれていない箇所は、仮データとして明確に分離しています。

## 変更したファイル一覧

- `README.md`
- `.gitignore`
- `app/calculation/page.tsx`
- `app/history/page.tsx`
- `app/layout.tsx`
- `app/machines/page.tsx`
- `app/result/page.tsx`
- `app/settings/page.tsx`
- `components/home/ExpectedValueCard.tsx`
- `components/layout/AccessGate.tsx`
- `data/calculation-placeholder.ts`
- `data/machines.ts`
- `lib/calculation/placeholder-engine.ts`
- `lib/calculator.ts`
- `next.config.mjs`
- `next-env.d.ts`
- `public/apple-touch-icon.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/manifest.webmanifest`
- `types/index.ts`
