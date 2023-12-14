## これは何か？
[mini next.js を作るという記事](https://hire.jonasgalvez.com.br/2022/may/18/building-a-mini-next-js/)があったが、vite を使っていて「魔法」に見えてしまったので、getServerSideProps つきの簡単な next.js もどきを自分で作ろうという試み。

## 使い方
1. `pages`配下にサーバーサイドで実行させたいコード（`getServerSideProps.js`と命名しないといけない）と、フロントで表示させたいReactのコード（`index.jsx`と命名しないといけない）を追加します。
ただこれだけでは足りないと思うので、その他のコンポーネントは、`src`配下に置き、pages配下からインポートします。

例：pages フォルダ配下に、`/pages/hoge` `/pages/test` `/pages/test/nest` のフォルダがあり、そこに `getServerSideProps.js` と `index.jsx` があると思います。この `index.jsx` がエントリーポイントになりますが、内部では `src` 配下の Test というコンポーネントを呼び出しています。

2. サーバーを立ち上げます。立ち上げるには以下のコマンドを打てば立ち上がります。
```
node ./next/index.js
```

3. pages のディレクトリのパスに沿って、URLにアクセスします。
例えば、`/pages/test/nest` に `getServerSideProps.js` と `index.jsx` を置いている場合は、`localhost:3002/test/nest` からアクセスできます。

## 実装してない部分
- Link・Router
- hydrate（サーバーサイドでReactのHTMLを生成するのではなく、webpackを使いフロントで生成している）
- SSG
