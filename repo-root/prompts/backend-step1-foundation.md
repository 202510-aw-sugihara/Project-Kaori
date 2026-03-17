# Backend Implementation Step 1: 基盤生成

このステップでは、ShizuKaバックエンドの『土台となるプロジェクト構造と設定』を生成します。

## ✅ 目標
- Maven プロジェクトを作成し、ビルドが通る状態にする
- パッケージ構成・基本設定ファイル・依存関係を追加する
- Spring Boot が起動し、H2 で動作することを確認する

## 🧱 やること
### 1. プロジェクト構造を作る
- `repo-root/backend/` 以下に以下の構造を作成
  - `src/main/java/com/example/shizuka/...`
  - `src/main/resources/`
  - `src/test/java/...`
  - `src/main/resources/mapper/`
- ルートに `pom.xml`, `README.md`, `.gitignore`, `Dockerfile`, `docker-compose.yml` を用意

### 2. 共通設定ファイル
- `application.yml`, `application-dev.yml`, `application-test.yml` を追加
- H2（MySQLモード）をデフォルトデータソースに設定
- MyBatis の mapper ファイル読み込み設定を追加

### 3. Spring Boot 起動確認
- 最小の `ShizukaApplication`（@SpringBootApplication）を作成
- `mvn clean package` が通ることを確認
- `mvn test` が通る状態（テストはとりあえず空でも可）

---

> **備考**
> - ここではまだビジネスロジックを実装しない。
> - 次ステップで DB テーブルと MyBatis マッパーを追加するための基盤を整える。
