# ShizuKa — 香水ワークショップ予約サービス

## 公開デモ
- 公開用デモサイト: https://202510-aw-sugihara.github.io/Project-Kaori/repo-root/site/


## 概要
ShizuKa（シズカ）は、香水ワークショップの予約をオンラインで完結できるサービスです。
来店前の不安を減らし、予約〜当日体験までの導線をわかりやすく整理することを目的としています。

## できること（要点）
- 予約プランの一覧表示と詳細確認
- 空き枠（日時・枠数）の確認
- 予約の作成（公開API）
- 管理者向けの予約・プラン・枠・顧客の管理（管理API）

## 画面一覧（フロント）
`repo-root/site/` 配下に実装済みの画面が揃っています。
- トップ / 予約導線 / コース詳細 / 比較 / FAQ / レビュー / アクセス
- 予約フロー（コース選択 → 日時選択 → 入力 → 確認 → 完了）

## バックエンド（公開APIの確認用）
Base URL: `https://project-kaori-fmup.onrender.com`

ブラウザで確認できるエンドポイント:
- `GET /health`
- `GET /api/plans`
- `GET /api/plans/{id}`
- `GET /api/plans/{id}/time-slots`
- `GET /api/reservations/{id}`

予約作成（POST）には CSRF トークンが必要です。
実行方法は `repo-root/txt/` にあるガイドや、別途提供する API ガイドを参照してください。

## システム構成（概要）
- フロントエンド: 静的サイト（HTML/CSS/JS）
- バックエンド: Java / Spring Boot
- DB: MySQL（開発時は H2）
- ORM: MyBatis

## リポジトリ構成
```
repo-root/
  site/       フロント実装
  backend/    Spring Boot バックエンド
  docs/       仕様・設計資料
  design/     デザインガイド
  prompts/    作業用プロンプト
  txt/        テキスト資材
```

## 参考資料
詳細な仕様・画面設計は `repo-root/docs/` と `repo-root/design/` を参照してください。
