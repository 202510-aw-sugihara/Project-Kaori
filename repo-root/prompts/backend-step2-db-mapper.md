# Backend Implementation Step 2: DB / Mapper

このステップでは、DB スキーマと MyBatis マッパーを実装して、アプリケーションの基礎となる永続化層を構築します。

## ✅ 目標
- `schema.sql` と `data.sql` でテーブル定義および初期データを用意
- エンティティ（POJO）を定義
- MyBatis Mapper + XML を用意し、CRUD・検索ができるようにする
- 論理削除（`deleted_at IS NULL`）を全ての SELECT に適用

## 🧱 やること
### 1. DB スキーマ実装
- `src/main/resources/schema.sql` に以下テーブルを定義
  - `users`, `plans`, `plan_time_slots`, `reservations`, `reservation_participants`
- 制約：
  - `users.email` は UNIQUE
  - `plan_time_slots` は `(plan_id, slot_date, start_time)` で UNIQUE
  - 外部キー制約（FK）を設定

### 2. 初期データ（seed）
- `src/main/resources/data.sql` にサンプルデータを投入
  - 管理者 1 件（BCrypt でハッシュ済みパスワード）
  - 顧客ユーザー、プラン、スロット、予約、参加者データ

### 3. Entity / Mapper
- `entity/` に以下エンティティを追加
  - `User`, `Plan`, `PlanTimeSlot`, `Reservation`, `ReservationParticipant`
- `mapper/` に以下 Mapper インターフェースと XML を追加
  - `UserMapper`, `PlanMapper`, `PlanTimeSlotMapper`, `ReservationMapper`, `ReservationParticipantMapper`

### 4. クエリ要件（MyBatis）
- 予約一覧取得時は JOIN で関連データを取得
- 予約詳細取得時は参加者リストも取得
- 検索フィルタリング（ステータス/日付/顧客名）を MyBatis dynamic SQL で実装

---

> **備考**
> - まずは基本 CRUD が動作することを最優先とする。
> - ビジネスロジックは次ステップで実装する。
