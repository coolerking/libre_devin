# 書籍管理システム

## 概要

購入済み書籍の一覧参照・詳細参照機能を提供するWebアプリケーション。

### 技術スタック

- **バックエンド**: Node.js + Express
- **フロントエンド**: Vue.js 3（CDN利用）
- **データベース**: SQLite3（better-sqlite3）
- **外部API**: Google Books API（サムネイル画像取得）

## クイックスタート

```bash
npm install
npm start
```

ブラウザで http://localhost:3000 にアクセス。

詳細な手順は [セットアップ手順書](./docs/setup_guide.md) を参照。

## 仕様

サンプルシステム2として「書籍管理システム」の以下の機能を実装する。

ユースケース図：

```mermaid
flowchart LR
    user((ユーザ))

    subgraph system[書籍購入システム]
        UC1([購入済みの書籍一覧を参照する])
        UC2([購入済みの書籍の詳細を参照する])
    end

    user --> UC1
    user --> UC2
```

### 画面仕様

- [一覧画面（動的版）](http://localhost:3000) — サーバ起動後にアクセス
- [一覧画面（ダミーデータ）](./public/booklist.html)
- [詳細画面（ダミーデータ）](./public/bookdetail.html)

### 機能仕様

- [サンプルシステム2 仕様](./docs/requirement_samplesystem2.md)
- [プロジェクト計画書](./docs/project_plan.md)

## ディレクトリ・ファイル構成

| ディレクトリ名・ファイル名 | 内容 |
|:--|:--|
| `app/` | バックエンドアプリケーションディレクトリ |
| `app/server.js` | Expressサーバ（エントリーポイント） |
| `app/routes/booklistRoute.js` | 一覧取得APIルート |
| `app/routes/bookdetailRoute.js` | 詳細取得APIルート |
| `app/models/database.js` | SQLite3データベース接続モジュール |
| `app/services/googleBooksApi.js` | Google Books APIサービス |
| `docs/` | ドキュメントディレクトリ |
| `docs/requirement_samplesystem2.md` | サンプルシステム2(書籍管理システム)の仕様 |
| `docs/project_plan.md` | プロジェクト計画書 |
| `docs/setup_guide.md` | セットアップ手順書 |
| `docs/how_to_setup_sqlite3_for_samplesystem2.pdf` | SQLite3セットアップ手順 |
| `data/` | データディレクトリ（変更不可） |
| `data/booklist.sqlite3` | SQLite3データベースファイル |
| `data/books.csv` | CSV/UTF-8形式の books テーブルデータ |
| `data/orders.csv` | CSV/UTF-8形式の orders テーブルデータ |
| `data/employees.csv` | CSV/UTF-8形式の employees テーブルデータ |
| `public/` | 静的ファイル配置ディレクトリ |
| `public/index.html` | 一覧画面（動的版・Vue.js） |
| `public/detail.html` | 詳細画面（動的版・Vue.js） |
| `public/booklist.html` | 一覧画面（ダミーデータ・サンプル） |
| `public/bookdetail.html` | 詳細画面（ダミーデータ・サンプル） |
| `public/css/` | CSSファイル配置ディレクトリ |
| `public/css/booklist.css` | 一覧画面用スタイルシート |
| `public/css/bookdetail.css` | 詳細画面用スタイルシート |
| `public/image/` | 画像ファイル配置ディレクトリ（変更不可） |
| `public/image/20200501_noimage.png` | イメージなし画像データ(フリー素材) |
| `public/image/curve12.png` | トップへ矢印アイコン画像データ |
| `public/image/stripe.png` | ストライプ背景用画像データ |
| `package.json` | Node.js依存パッケージ定義 |
| `README.md` | このファイル |

## API仕様

### 一覧取得 `GET /api/books?page={ページ番号}`

購入済み書籍一覧を10件ずつ返却。No（id-branch）の昇順。

### 詳細取得 `GET /api/book/{id}/{branch}`

指定された書籍の詳細情報をGoogle Booksサムネイル付きで返却。
