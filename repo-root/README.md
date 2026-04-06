# ShizuKa — 香水ワークショップ予約サービス

---

## 公開デモ
- フロントデモ
  https://202510-aw-sugihara.github.io/Project-Kaori/repo-root/site/

- バックエンドAPI
  https://project-kaori-fmup.onrender.com

---

## 概要
ShizuKa（シズカ）は、香水ワークショップの予約をオンラインで完結できるサービスです。
来店前の不安を減らし、予約〜当日体験までの導線を最適化することを目的としています。

---

## 主な機能
- 予約プランの一覧・詳細表示
- 空き枠（日時・残席）の確認
- 予約作成（公開API）
- 管理者向けの予約・顧客・プラン管理

---

## フロント画面
`repo-root/site/` に実装済み

- トップページ
- コース詳細 / 比較
- FAQ / レビュー / アクセス
- 予約フロー
  （コース選択 → 日時選択 → 入力 → 確認 → 完了）

---

## 公開API（すぐ試せます）

### ✔ ブラウザで確認可能
- https://project-kaori-fmup.onrender.com/health
- https://project-kaori-fmup.onrender.com/api/plans
- https://project-kaori-fmup.onrender.com/api/plans/1
- https://project-kaori-fmup.onrender.com/api/plans/1/time-slots

---

### ✔ 予約作成（POST）

CSRFトークンが必要です。

#### ① トークン取得
```bash
curl -i -c cookies.txt https://project-kaori-fmup.onrender.com/api/csrf
② 予約作成
curl -i -b cookies.txt \
  -H "Content-Type: application/json" \
  -H "X-XSRF-TOKEN: <TOKEN>" \
  -X POST https://project-kaori-fmup.onrender.com/api/reservations \
  -d '{
    "planId": 1,
    "planTimeSlotId": 1,
    "participantCount": 1,
    "participants": [
      {
        "participantName": "Taro Yamada",
        "participantNameKana": "ヤマダ タロウ",
        "ageGroup": "20s",
        "allergyNote": "None"
      }
    ],
    "customerName": "Taro Yamada",
    "email": "taro@example.com",
    "phone": "090-1234-5678"
  }'
技術スタック

フロントエンド: HTML / CSS / JavaScript

バックエンド: Java / Spring Boot

データベース: MySQL（開発時は H2）

ORM: MyBatis

技術的ポイント

トランザクション制御による予約整合性の担保

残席チェック（capacity - reserved_count）による同時予約対策

DTOによるAPIレスポンス設計の分離

HTTPステータスを統一したエラーハンドリング

ディレクトリ構成
repo-root/
  site/       フロント実装
  backend/    Spring Boot バックエンド
  docs/       仕様・設計資料
  design/     デザインガイド
  prompts/    作業用プロンプト
  txt/        テキスト資材
参考資料

詳細な仕様・設計は以下を参照してください：

repo-root/docs/

repo-root/design/
## 運用メモ
- 予約停止告知は `repo-root/site/assets/js/ops-config.js` の `reservationStop` と `reservationStopMessage` で切り替えます。
---

## 管理画面UI改善（ステータス・操作整合性）

### 問題

- ステータスが英語表記（CONFIRMED / CANCELLED）で直感的に分かりづらい
- 「予約を確定」ボタンを押しても、実際の状態は「受付中（pending）」となり、UIと挙動が一致していなかった
- 操作ボタンが英語で統一感がなく、管理画面としてのUXが低かった

---

### 改善内容

- ステータスを日本語化
  - 受付中 / 予約確定 / キャンセル
- ボタン文言を実際の挙動に合わせて修正
  - 予約を確定 → 予約を作成
- 詳細画面の操作ボタンを日本語統一
  - 編集 / 予約確定 / キャンセル

---

### 設計意図

- ステータスの value（pending / confirmed / cancelled）は変更せず、表示のみ日本語化することでAPIとの整合性を維持
- 「操作」と「状態」の意味を一致させ、ユーザーの誤解を防止
- 既存ロジックを壊さず、最小変更で改善（1変更ルール）

---

### 技術的ポイント

- ステータスselectはHTML側で管理
- 操作ボタンはJavaScript（admin.js）で動的生成
- 表示とロジックを分離した構造を活かして安全に改善
