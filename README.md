# Todo App

## 概要

学習目的で開発しているTodo管理アプリです。
フロントエンドとバックエンドを分離し、実務を意識した構成で開発しています。

---

## 制作目的

* HTML/CSS/JavaScriptの基礎習得
* Node.jsを用いたAPI開発の学習
* MariaDBを利用したデータ管理の学習
* Git/GitHubを利用したソースコード管理の学習

---

## 使用技術

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Hono

### Database

* MariaDB

### Tools

* Git
* GitHub
* Caddy

---

## 機能

### 実装済み

* Todo追加
* Todo一覧表示
* Todo削除

### 実装予定

* 完了／未完了切り替え
* 編集機能
* 並び替え
* 優先Todo表示
* MariaDB保存
* API連携強化

---

## フォルダ構成

```text
todo/
├─ public/
│  ├─ index.html
│  ├─ script.js
│  └─ style.css
│
├─ api/
│  ├─ server.js
│  ├─ package.json
│  ├─ package-lock.json
│    └─ db/
│      └─ connection.js
│
├─ docs/
│  ├─ memo.md
│  └─ log.md
│
├─ README.md
└─ .gitignore
```

---

## 起動方法

### バックエンド起動

```bash
cd api
node server.js
```

### フロントエンド表示

ブラウザで以下へアクセス

```text
http://localhost
```

---

## API

### Todo一覧取得

```http
GET /todos
```

### Todo追加

```http
POST /todos
```

### Todo削除

```http
DELETE /todos/:id
```

---

## 開発記録

設計メモ

```text
docs/memo.md
```

開発ログ

```text
docs/log.md
```

---

## 今後の改善予定

* MariaDBとの完全連携
* 入力バリデーション
* エラーハンドリング改善
* UI改善
* レスポンシブ対応
* テスト追加

---

## 学習ポイント

本アプリは完成品ではなく、学習過程を記録することを目的としています。
設計メモや開発ログも含めて公開し、試行錯誤の過程が分かる構成を目指しています。

