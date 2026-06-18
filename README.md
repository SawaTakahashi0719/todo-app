# Todo App

## 概要

学習目的で開発しているTodo管理アプリ。
フロントエンドとバックエンドを分離し、実務を意識した構成で開発している。

**制作目的**

- HTML / CSS / JavaScript の基礎習得
- Node.js を用いたAPI開発の学習
- MariaDB を利用したデータ管理の学習
- Git / GitHub によるソースコード管理の学習

---

## 使用技術

| レイヤー | 技術 |
| --- | --- |
| Frontend | HTML / CSS / JavaScript |
| Backend | Node.js / Hono |
| Database | MariaDB |
| Tools | Git / GitHub / Caddy |

---

## 機能

**実装済み**

- Todo 追加 / 一覧表示 / 削除
- 完了 / 未完了切り替え
- 編集機能
- 検索・フィルタ
- ドラッグ＆ドロップによる並び替え
- お気に入り（優先表示）
- 完了済み一括削除

**実装予定**

- 入力バリデーション
- エラーハンドリング改善
- レスポンシブ対応
- テスト追加

---

## フォルダ構成

```text
todo/
├─ public/
│  ├─ index.html
│  ├─ script.js
│  └─ style.css
├─ api/
│  ├─ server.js
│  ├─ package.json
│  ├─ package-lock.json
│  └─ db/
│     └─ connection.js
├─ docs/
│  ├─ memo.md
│  └─ log.md
├─ README.md
└─ .gitignore
```

---

## 起動方法

```bash
cd api
node server.js
```

ブラウザで `http://localhost` へアクセス。

---

## API

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | /todos | 一覧取得 |
| POST | /todos | Todo 追加 |
| PUT | /todos/:id | Todo 編集 |
| PUT | /todos/reorder | 並び替え |
| PATCH | /todos/:id | 完了 / 未完了切り替え |
| PATCH | /todos/:id/pickup | お気に入り設定 |
| DELETE | /todos/:id | Todo 削除 |
| DELETE | /todos/completed | 完了済み一括削除 |

---

## 開発記録

- 設計メモ: `docs/memo.md`
- 開発ログ: `docs/log.md`
