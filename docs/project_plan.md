# 書籍管理システム プロジェクト計画書

## 1. プロジェクト概要

### 1.1 目的

「書籍管理システム」のWebアプリケーションとして、購入済み書籍の一覧参照・詳細参照の2機能を実装する。

### 1.2 ユースケース

| ユースケース | 説明 |
|:--|:--|
| UC1: 購入済みの書籍一覧を参照する | DBから取得した書籍データを10件ずつページングして一覧表示する |
| UC2: 購入済み書籍の詳細を参照する | 一覧から選択した書籍の詳細情報をGoogle Books APIのサムネイル付きで表示する |

---

## 2. 現状分析

### 2.1 提供済みリソース

| リソース | 状態 | 内容 |
|:--|:--|:--|
| `data/booklist.sqlite3` | 提供済み（変更不可） | SQLite3データベース（books:241件, orders:283件, employees:95件） |
| `data/*.csv` | 提供済み（変更不可） | 各テーブルデータのCSV（UTF-8） |
| `public/booklist.html` | サンプルHTML | 一覧画面のモックアップ（ダミーデータ） |
| `public/bookdetail.html` | サンプルHTML | 詳細画面のモックアップ（ダミーデータ） |
| `public/css/booklist.css` | サンプルCSS | 一覧画面用スタイルシート |
| `public/css/bookdetail.css` | サンプルCSS | 詳細画面用スタイルシート |
| `public/image/*` | 提供済み（変更不可） | 画像素材（noimage, 矢印アイコン, 背景） |

### 2.2 データベース構成

```
【books】書籍マスタ（241件）
  isbn(TEXT,INDEX) / title(TEXT) / subtitle(TEXT) / writer(TEXT) / print(TEXT)

【orders】購入トランザクション（283件）
  id(TEXT,INDEX) / branch(TEXT,INDEX) / isbn(TEXT) / recorddate(TEXT) / emp_no(TEXT) / buy(TEXT) / price(TEXT)

【employees】従業員マスタ（95件）
  emp_no(TEXT,INDEX) / post(TEXT) / name(TEXT) / mail(TEXT)
```

一覧画面で表示するデータは `orders` + `books` + `employees` の3テーブルJOIN結果（283件）。

### 2.3 画面仕様の要点

**一覧画面**
- No（id-branch）の昇順でソート
- 10件/ページのページング
- 現在ページは灰色背景・リンク不活性
- 書籍タイトルクリックで詳細画面を**別タブ**で開く
- ページ選択リンクはテーブルの上下に配置

**詳細画面**
- 書籍の全詳細情報（タイトル、サブタイトル、著者、出版、登録日、要望部署、要望者、購入方法、価格）を表示
- ISBNコードを使ってGoogle Books APIからサムネイル画像を取得・表示
- 画像がない場合は `NO IMAGE` 画像（`20200501_noimage.png`）を代替表示
- 別タブで表示、他画面への遷移なし

---

## 3. 技術選定

### 3.1 採用技術スタック

| 区分 | 技術 | 理由 |
|:--|:--|:--|
| バックエンド | **Node.js + Express** | 仕様書のサンプル実装例に準拠。軽量で迅速な開発が可能 |
| フロントエンド | **Vue.js 3** | 仕様書のサンプル実装例に準拠。既存モックアップでVue.jsをCDN利用しているため親和性が高い |
| データベース | **SQLite3** | 提供済みの `booklist.sqlite3` をそのまま使用 |
| 外部API | **Google Books API** | ISBNによるサムネイル画像取得（1日1,000回制限あり） |
| スタイリング | **既存CSS流用** | 提供済みの `booklist.css` / `bookdetail.css` をベースに利用 |

### 3.2 プロジェクト構成（予定）

```
libre_devin/
├── app/                          ← 新規作成
│   ├── server.js                     バックエンドサーバ（Express）
│   ├── routes/
│   │   ├── booklistRoute.js          一覧API
│   │   └── bookdetailRoute.js        詳細API
│   ├── models/
│   │   └── database.js               SQLite3接続・クエリ
│   └── services/
│       └── googleBooksApi.js         Google Books APIサービス
├── public/                       ← サンプルを動的化
│   ├── index.html                    Vue.jsアプリ エントリーポイント
│   ├── booklist.html                 （参考用に保持）
│   ├── bookdetail.html               （参考用に保持）
│   ├── css/
│   │   ├── booklist.css
│   │   └── bookdetail.css
│   └── image/                        変更不可
├── data/                         ← 変更不可
│   └── booklist.sqlite3
├── package.json                  ← 新規作成
├── docs/
│   ├── requirement_samplesystem2.md
│   ├── project_plan.md               この計画書
│   └── setup_guide.md            ← 新規作成（セットアップ手順）
└── README.md                     ← 更新
```

---

## 4. 実装計画

### フェーズ1: プロジェクト基盤構築（目安: 1時間）

| # | タスク | 成果物 |
|:--|:--|:--|
| 1-1 | Node.jsプロジェクト初期化（`npm init`） | `package.json` |
| 1-2 | 必要パッケージのインストール（express, better-sqlite3, axios 等） | `node_modules/`, `package-lock.json` |
| 1-3 | Expressサーバの基本構成作成 | `app/server.js` |
| 1-4 | SQLite3データベース接続モジュール作成 | `app/models/database.js` |
| 1-5 | 静的ファイル配信設定（`public/`） | サーバ設定 |

### フェーズ2: バックエンドAPI実装（目安: 1.5時間）

| # | タスク | 成果物 |
|:--|:--|:--|
| 2-1 | 一覧取得APIの実装 (`GET /api/books`) | `app/routes/booklistRoute.js` |
|  | - orders + books + employees のJOIN | |
|  | - No（id-branch）昇順ソート | |
|  | - ページング（10件/ページ、page パラメータ） | |
|  | - 総件数・総ページ数の返却 | |
| 2-2 | 詳細取得APIの実装 (`GET /api/books/:id/:branch`) | `app/routes/bookdetailRoute.js` |
|  | - 指定id/branchの書籍詳細情報取得 | |
| 2-3 | Google Books APIサービス実装 | `app/services/googleBooksApi.js` |
|  | - ISBNからサムネイルURL取得 | |
|  | - 画像なし時のフォールバック処理 | |

### フェーズ3: フロントエンド実装（目安: 2時間）

| # | タスク | 成果物 |
|:--|:--|:--|
| 3-1 | 一覧画面の動的化 | `public/index.html` または Vue SFCコンポーネント |
|  | - ページ選択リンク（上下配置） | |
|  | - 現在ページの灰色背景・リンク不活性 | |
|  | - 該当件数表示 | |
|  | - テーブルへのデータバインディング | |
|  | - タイトルリンク → 詳細画面（別タブ） | |
| 3-2 | 詳細画面の動的化 | 詳細画面HTMLまたはコンポーネント |
|  | - URLパラメータからid/branch取得 | |
|  | - 書籍詳細情報の表示 | |
|  | - Google Books APIサムネイル表示 | |
|  | - NO IMAGE画像のフォールバック | |
| 3-3 | 既存CSSの適用・微調整 | CSS調整 |

### フェーズ4: テスト・品質確保（目安: 1.5時間）

| # | タスク | 成果物 |
|:--|:--|:--|
| 4-1 | 一覧画面の動作確認 | テスト結果記録 |
|  | - ページング動作（全ページ遷移確認） | |
|  | - データ表示の正確性（件数、ソート順） | |
|  | - 現在ページの表示状態 | |
| 4-2 | 詳細画面の動作確認 | テスト結果記録 |
|  | - 各書籍の詳細情報表示 | |
|  | - サムネイル画像取得・表示 | |
|  | - NO IMAGE フォールバック動作 | |
|  | - 別タブでの表示確認 | |
| 4-3 | エッジケースの確認 | テスト結果記録 |
|  | - 最終ページ（端数データ）の表示 | |
|  | - 不正なページ番号の処理 | |
|  | - Google Books API エラー時の処理 | |

### フェーズ5: ドキュメント・納品準備（目安: 0.5時間）

| # | タスク | 成果物 |
|:--|:--|:--|
| 5-1 | セットアップ手順書の作成 | `docs/setup_guide.md` |
| 5-2 | README.md の更新 | `README.md` |
| 5-3 | 最終動作確認 | 動作確認結果 |

---

## 5. API設計

### 5.1 一覧取得API

```
GET /api/books?page=1
```

**レスポンス:**
```json
{
  "totalCount": 283,
  "totalPages": 29,
  "currentPage": 1,
  "books": [
    {
      "no": "4838-0",
      "id": "4838",
      "branch": "0",
      "title": "仮説思考",
      "subtitle": "BCG流問題発見・解決の発想法",
      "writer": "内田　和成",
      "print": "東洋経済新報社",
      "recorddate": "2009/7/15",
      "post": "第1製造部",
      "name": "佐久間　健介",
      "buy": "紀伊国屋",
      "price": "1680"
    }
  ]
}
```

### 5.2 詳細取得API

```
GET /api/books/:id/:branch
```

**レスポンス:**
```json
{
  "no": "4838-0",
  "title": "仮説思考",
  "subtitle": "BCG流問題発見・解決の発想法",
  "writer": "内田　和成",
  "print": "東洋経済新報社",
  "recorddate": "2009/7/15",
  "post": "第1製造部",
  "name": "佐久間　健介",
  "buy": "紀伊国屋",
  "price": "1680",
  "isbn": "978-4-492-55555-5",
  "thumbnail": "http://books.google.com/books/content?id=..."
}
```

---

## 6. 注意事項・リスク

| 項目 | 内容 | 対策 |
|:--|:--|:--|
| Google Books API 上限 | 1日1,000回まで | テスト時はAPI呼び出し回数を意識。キャッシュ機能の検討 |
| データベース変更不可 | `data/` ディレクトリは変更禁止 | 読み取り専用（SELECT）で利用 |
| 画像変更不可 | `public/image/` は変更禁止 | 既存画像をそのまま使用 |
| CSS互換性 | 既存CSSのデザインを踏襲 | サンプルHTMLのレイアウトを忠実に再現 |
| 文字コード | CSVはUTF-8、SQLite3内のデータもUTF-8 | 全体でUTF-8統一 |

---

## 7. スケジュール概要

| フェーズ | 内容 | 所要時間目安 |
|:--|:--|:--|
| フェーズ1 | プロジェクト基盤構築 | 1.0時間 |
| フェーズ2 | バックエンドAPI実装 | 1.5時間 |
| フェーズ3 | フロントエンド実装 | 2.0時間 |
| フェーズ4 | テスト・品質確保 | 1.5時間 |
| フェーズ5 | ドキュメント・納品準備 | 0.5時間 |
| **合計** | | **6.5時間** |

> ※ 最長作業時間7時間30分以内で完了する計画。バッファ1時間あり。

---

## 8. 成果物一覧

| 成果物 | 説明 |
|:--|:--|
| `app/` ディレクトリ一式 | バックエンドサーバ・ルーティング・DB接続・外部APIサービス |
| `public/index.html` | 動的一覧画面 |
| 詳細画面HTML | 動的詳細画面 |
| `package.json` | 依存パッケージ定義 |
| `docs/setup_guide.md` | インストール・実行手順書 |
| `README.md`（更新版） | プロジェクト説明の更新 |
