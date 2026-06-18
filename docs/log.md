# 開発ログ

## 2026/06/09
### 実施内容
* プロジェクトのフォルダ構成を作成
* HTML/CSSの作成
* JavaScriptの作成
### 発生した問題①
#### 現象
HTML/CSSは反映されるがJavaScriptが動作しない。
#### 調査
ブラウザの開発者ツール（F12）を開き、Consoleを確認。
#### 原因
script.jsの先頭に以下の文字列が残っていた。
` ```javascript `
ChatGPTの回答をコピーした際に混入したものだった。
#### 解決方法
不要な文字列を削除し、Ctrl + F5でブラウザを再読み込みした。
#### 学んだこと
JavaScriptが動作しない場合は、まずConsoleを確認する。
### 発生した問題②
#### 現象
Node.jsサーバーは起動しているが、Todo一覧が取得できない。
#### 調査
* Consoleのエラーを確認
* Networkタブを確認
* fetch処理の動作を確認
#### 考えられる原因
JavaScript自体は読み込まれていたが、loadTodos() 内の fetch が失敗していた。
フロントエンドとバックエンドのポート番号が一致しておらず、CORSエラーが発生していた。
#### 解決方法
後日詳細を再確認することとした。
#### 次回確認事項
* CORSの仕組み
* フロントエンドとバックエンドの通信経路
* ポート番号の役割

---

## 2026/06/10
### 実施内容
前日の通信エラーについて調査。
### 原因整理
バックエンド（Hono）は`http://localhost:3000`で起動していた。
一方、フロントエンドは`npx serve .`で起動していたため、別のポート番号が割り当てられていた。
その結果、CORS設定に一致せず通信エラーが発生していた。

### 解決方法
fetchの接続先を`http://localhost:3000`へ統一。
また、CORS設定を下記へ変更。
```js
cors({
  origin: "http://localhost"
})
```
フロントエンドは`http://localhost`からアクセスする構成へ変更した。
### 環境改善
specialistの提案により、`npx serve`を廃止。
代わりに`Caddy`を導入。
また、プロジェクト構成を整理した。
変更前
```text
frontend
backend
```
変更後
```text
public
api
```
### 学んだこと
* JavaScriptが動かないように見えても、実際はAPI通信で失敗している場合がある。
* ConsoleだけでなくNetworkタブの確認も重要。
* localhostでもポート番号が異なると別オリジンとして扱われる。
* CORS設定はアクセス元のオリジンと一致させる必要がある。
### 次回予定
MariaDBの導入と接続確認。

---

## 2026/06/12
### 実施内容
* MariaDBの導入
* データベース接続確認
* テーブル作成準備
### 難しかったこと
データベースのユーザー名とパスワードの考え方。
当初はプロジェクトごとにユーザーを作成する必要があると思っていた。
### 理解したこと
学習環境ではユーザーを共通化しても運用可能。
ただし実務ではセキュリティや権限管理の観点から設計を検討する必要がある。
### 次回予定
Todoテーブルの設計。

---

## 2026/06/15
### 実施内容
* Gitの学習
* GitHubの学習
* リポジトリ管理方法の理解

### 学んだこと
* `git init`
* `git remote add origin`
* `git add`
* `git commit`
* `git push`
* `git clone`
* `git pull`
の役割と違いを理解した。
### 次回予定
Todoテーブルの設計。

---

## 2026/06/16
### 実施内容
* Todoテーブルの設計
* MariaDBへの完全移行
* Githubへ公開（予定）

### 発生した問題
#### 現象
* `server.js`を修正してTodoデータの取得先をMariaDBへ変更したが、ブラウザ上の表示内容が更新されなかった。
#### 調査内容
* `http://localhost:3000/todos`にアクセスし、返却されるJSONを確認
* MariaDBの`todos`テーブルへ直接データを追加
* ブラウザを再読み込みして挙動を確認
#### 原因
* `server.js`の変更後にHonoサーバーを再起動していなかったため、変更内容が反映されていなかった。
#### 解決方法
1.実行中のHonoサーバーを停止
2.`node server.js` で再起動
3.ブラウザを再読み込みして動作確認
#### 学んだこと
* server.jsを変更した場合はサーバーの再起動が必要
* ブラウザ側の問題かサーバー側の問題かを切り分けるために、APIエンドポイント
`http://localhost:3000/todos`を直接確認すると原因調査がしやすい
#### 次回予定
* GitHubへ公開
* 公開後の動作確認
* READMEの機能部分の整理

---

## 2026/06/17
### 実施内容
* 検索機能の追加
* 並び替え機能の追加（登録順・お気に入り・完了順）
* テキスト編集機能の追加（インライン編集）
* お気に入り（ピックアップ）機能の追加
* ドラッグ＆ドロップによる並び替え機能の追加
* 完了済み一括削除機能の追加
* 完了チェックボックスの追加（完了はチェックボックスで管理するよう変更）

### 変更内容

#### server.js
* CORSに `PATCH` メソッドを追加
* `GET /todos`：`ORDER BY sort_order ASC` で登録順に返すよう変更
* `POST /todos`：`sort_order` を自動採番して挿入するよう変更
* `DELETE /todos/completed`：完了済みの一括削除エンドポイントを追加
* `PUT /todos/reorder`：並び替え結果を一括更新するエンドポイントを追加
* `PUT /todos/:id`：完了トグル時に `completed_at` も更新するよう変更
* `PATCH /todos/:id`：テキスト編集用エンドポイントを追加
* `PATCH /todos/:id/pickup`：お気に入りトグル用エンドポイントを追加
* 不要なDB確認コードを削除

#### index.html
* 検索入力エリアを追加
* 並び替えボタンエリア（登録順・お気に入り・完了順）を追加
* 枠外アクションエリア（完了済一括削除ボタン）を追加

#### script.js
* `allTodos` / `searchQuery` / `sortMode` / `editingId` / `dragSrcId` の状態変数を追加
* `applyFiltersAndSort()` でフィルタ・並び替え・描画を一元管理するよう設計変更
* `renderTodos()` を大幅更新：完了チェックボックス・インライン編集UI・ドラッグ操作を追加
* `editTodo()` / `togglePickup()` / `reorderTodos()` / `deleteCompleted()` を追加
* 旧 `toggleTodo()`：削除＋追加の疑似実装から `PUT` による正規の完了トグルに変更

#### style.css
* 検索エリア・並び替えボタンのスタイルを追加
* 完了チェックボックス・編集入力・アイコンボタン・テキストボタンのスタイルを追加
* ドラッグ中（`.dragging`）・ドロップ先（`.drag-over`）のスタイルを追加
* フッターアクションエリアのスタイルを追加
* `body` のレイアウト調整（`flex-direction: column` / `min-height` / `gap`）

### 設計で意識したこと
* `PUT /todos/reorder` や `DELETE /todos/completed` は、`/todos/:id` より先にルート登録しないと `:id` にマッチしてしまう。Honoはルートを登録順に評価するため、特定パスを先に書く必要がある。
* フロントの状態は `allTodos` に一元管理し、フィルタ・並び替えは毎回 `applyFiltersAndSort()` を呼んで再計算する設計にした。

### 次回予定
* `sort_order` カラムの追加（DBマイグレーション）確認
* `pickup` / `completed_at` カラムの追加確認
* GitHubへ公開・READMEの整備

---

## 2026/06/18
### 実施内容
* お気に入り（ピックアップ）機能の廃止
* ドラッグハンドル（☰）の追加：ハンドル部分のみドラッグ起点として限定
* 追加位置切り替えボタンの追加：↓（下に追加）と↑（上に追加）の2ボタン構成
* 並び替えボタン（登録順・お気に入り・完了順）の廃止
* 「完了済一括削除」→「☑ 一括消去」に名称変更
* 本バージョンをv1完成版とする

### 変更内容

#### index.html
* 並び替えエリアを「↓ / ↑」追加位置切り替えボタン2つに変更
* フッターボタンのラベルを「☑ 一括消去」に変更
* `?v=3` クエリパラメータをCSS・JS読み込みに付与（ブラウザキャッシュ対策）

#### script.js
* `sortMode` / `sortBtns` を削除
* `addPosition`（`"bottom"` / `"top"`）状態変数を追加
* `addBottomBtn` / `addTopBtn` の各クリックで `addPosition` を切り替え、アクティブクラスをトグル
* 昇順追加（`addPosition === "top"`）時は POST 後に再取得し、末尾の新規アイテムを先頭へ `reorderTodos()` で移動
* `togglePickup()` を削除
* `applyFiltersAndSort()` からピックアップ・完了順ソートロジックを削除（`sort_order` 昇順のみに統一）
* ドラッグ実装を `li.draggable = true` + `dragFromHandle` フラグ方式に変更
  * ハンドル（☰）の `mousedown` でフラグを立て、`li` の `dragstart` でフラグを確認
  * フラグが立っていない場合は `e.preventDefault()` でドラッグをキャンセル
  * `dragend` でフラグをリセット

#### style.css
* `.sort-btn` 関連スタイルを削除し `.add-position-btn` / `.add-position-btn.active` を追加
* `#todo-list li span` → `#todo-list li > span` に変更（直接子セレクター）
* `.completed span` → `.completed > span` に変更（同上）
* `#todo-list li` から `cursor: grab` を削除
* `.drag-handle` に `cursor: grab` と `user-select: none` を追加

### 発生した問題と解決

#### アクティブ状態が反映されない
* **原因**：ブラウザが古い script.js / style.css をキャッシュしていたため、コード変更が反映されていなかった。
* **解決**：CSS・JS の読み込みURLに `?v=3` クエリを付与してキャッシュを無効化。

#### ドラッグハンドルが動かない（その1）
* **原因**：`#todo-list li span { flex: 1; }` というCSSが、Todoテキストの `span` だけでなくドラッグハンドルの `span`（`.action-btns` 内）にも適用され、レイアウトが崩れていた。
* **解決**：`#todo-list li > span`（直接子セレクター）に変更し、ネスト内の `span` に適用されないよう修正。

#### ドラッグハンドルが動かない（その2）
* **原因**：当初 `button[draggable=true]` → `span[draggable=true]` と試みたが、ブラウザによってはインタラクティブ要素や子要素の `draggable` 属性を正しく処理しないケースがある。
* **解決**：`li.draggable = true` を維持しつつ、ハンドルの `mousedown` イベントで `dragFromHandle` フラグを立て、`li` の `dragstart` でフラグを確認してハンドル以外から始まるドラッグをキャンセルする方式に変更。HTML5 DnD における標準的なハンドル限定ドラッグの実装パターン。

### 設計で意識したこと
* ドラッグの「起点を限定する」には、ドラッグされる要素（li）はそのままにしてフラグで制御する方が、子要素を draggable にするより信頼性が高い。
* CSSセレクターの範囲は常に意識する。`li span` は孫要素にも適用されるため、直接子のみを対象にしたい場合は `li > span` を使う。
* ブラウザキャッシュは開発中に混乱の原因になりやすい。静的ファイルを更新したらクエリパラメータやバージョン番号でキャッシュバスティングを行う。
