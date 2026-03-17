# Backend Implementation Step 3: Service / Controller

このステップでは、ビジネスロジック（サービス層）と REST API（コントローラー）を実装し、設計書に沿った予約・管理機能を完成させます。

## ✅ 目標
- 予約作成 / 更新 / キャンセルのビジネスルールをサービス層に実装
- REST API を定義し、フロントと連携する
- バリデーション・例外ハンドリング・認可を組み込む

## 🧱 やること
### 1. サービス層実装
- `service/` に `ReservationService`, `PlanService`, `UserService` などを実装
- 予約作成/更新/キャンセルに対する以下の要件を満たす
  - 参加者数と参加者リスト一致チェック
  - 予約枠が存在・オープン・容量内であること
  - 予約日が過去でないこと（当日も可）
  - `reserved_count` の増減をトランザクションで整合させる
  - 取消は idempotent（2回目は 409）

### 2. REST API 実装
- Admin API（/api/admin/**）
  - 認証（セッションベース）
  - `AdminAuthController`, `AdminReservationController`, `AdminCustomerController`, `AdminSlotController`
- Public API
  - `PlanController`（プラン一覧/詳細/タイムスロット）
  - `ReservationController`（公開予約作成）

### 3. セキュリティ実装
- Spring Security 設定（`SecurityConfig`）
- `UserDetailsService` の実装
- `/api/admin/**` は `ROLE_ADMIN` のみアクセス可能
- `/api/plans/**`, `POST /api/reservations` は public
- JSON エラー応答、401/403 を返すように調整

### 4. バリデーション・例外
- Bean Validation (@Valid) を使用
- 共通 `@RestControllerAdvice` で例外を JSON 化
- 以下をカバー
  - `MethodArgumentNotValidException`
  - `ConstraintViolationException`
  - `ResourceNotFoundException` / `DuplicateResourceException` / `BusinessRuleViolationException`
  - `AuthenticationException` / `AccessDeniedException`
  - `DataIntegrityViolationException`

---

> **備考**
> - ここまでで外部から API が動作確認できる状態にする。
> - 構造体は DTO で統一し、エンティティを直接返さない。
