# ShizuKa Backend

ShizuKa 香水ワークショップ予約システムのバックエンド API です。

## 概要
ワークショップのコース、予約枠、顧客、予約情報を管理する Spring Boot ベースの REST API を実装しています。

## 技術スタック
- Java 17
- Spring Boot 3
- MyBatis
- Spring Security
- Maven
- JUnit 5 + MockMvc
- H2（開発・テスト）
- MySQL 互換 SQL（本番想定）

## セットアップ
### ビルド
```bash
cd repo-root/backend
mvn clean package
```

### 起動（開発）
```bash
mvn spring-boot:run
```

### Docker で起動
```bash
docker-compose up --build
```

### テスト実行
```bash
mvn test
```

### Maven Wrapper (mvnw)
このプロジェクトには Maven Wrapper が含まれているため、Maven をローカルにインストールしなくてもビルド・テストが実行できます。

Windows:
```powershell
cd repo-root/backend
.\mvnw.cmd clean test
.\mvnw.cmd package
```

Mac/Linux:
```bash
cd repo-root/backend
./mvnw clean test
./mvnw package
```

## API 一覧
- 管理者認証: `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`
- 管理者予約: `GET /api/admin/reservations`, `GET /api/admin/reservations/{id}`, `POST /api/admin/reservations`, `PUT /api/admin/reservations/{id}`, `PATCH /api/admin/reservations/{id}/cancel`
- 管理者顧客: `GET /api/admin/customers`, `GET /api/admin/customers/{id}`
- 管理者枠管理: `GET /api/admin/plan-time-slots`, `GET /api/admin/plan-time-slots/{id}`, `POST /api/admin/plan-time-slots`, `PUT /api/admin/plan-time-slots/{id}`
- 公開コース: `GET /api/plans`, `GET /api/plans/{id}`, `GET /api/plans/{id}/time-slots?date=YYYY-MM-DD`
- 公開予約: `POST /api/reservations`

## セキュリティメモ
- CSRF 保護は `POST` / `PUT` / `PATCH` / `DELETE` の状態変更リクエストに対して有効です。
- 認証済みセッションで状態変更リクエストを送る際は、`X-XSRF-TOKEN` ヘッダに CSRF トークンを付与する必要があります。
- CSRF トークンは最初の GET リクエスト応答時に `XSRF-TOKEN` Cookie として送信されます。ブラウザ系クライアントはこの Cookie を読み取ってヘッダにコピーしてください。
- バックエンドでは `CookieCsrfTokenRepository.withHttpOnlyFalse()` を使用しているため、ブラウザ系クライアントから Cookie を取得できます。

## 前提
- 予約ステータスの初期値は `pending`
- `deleted_at` は論理削除を表し、通常の検索では除外される
- パスワードは BCrypt で保存する
- 公開予約では管理者メールアドレスを使用できない
