# Git 運用と CI/CD による開発フロー自動化

## 1. 背景と目的

本ドキュメントは、Git のトラブルシューティング手法から CI/CD による開発フロー自動化まで、チーム開発の品質と効率を向上させるための運用指針をまとめたものである。

### チーム開発における Git 運用の課題

- コミット履歴が整理されていないと、バグの原因調査に時間がかかる
- ブランチ運用のルールが曖昧だと、main ブランチの品質が安定しない
- 依存パッケージの更新が放置されると、セキュリティリスクが蓄積する
- CI の実行時間が長いと、開発者の待ち時間が増え生産性が下がる

### 本ドキュメントの対象

NestJS + React（Vite）モノレポ環境での実践に基づく。GitHub をリモートリポジトリ、GitHub Actions を CI/CD 基盤として使用している。

---

## 2. ブランチ戦略

### GitHub Flow の採用

本プロジェクトでは GitHub Flow を採用している。GitFlow と比較してシンプルであり、CI/CD との相性が良い。

```
main ──────────────────────────────────
           \       /      \       /
            ──────          ─────
          feat/cart        fix/total
```

**ルール：**
- `main` ブランチは常にデプロイ可能な状態を保つ
- 全ての変更は feature ブランチから PR 経由でマージする
- `main` への直接 push は禁止（ブランチ保護ルールで強制）

### GitHub Flow vs GitFlow

| 観点 | GitHub Flow | GitFlow |
|------|------------|---------|
| ブランチ数 | 少ない（main + feature） | 多い（main, develop, feature, release, hotfix） |
| リリースフロー | main = 常にリリース可能 | release ブランチで管理 |
| 複雑さ | シンプル | 複雑 |
| 向いている規模 | 小〜中規模、継続的デリバリー | 大規模、リリーススケジュールが固定 |

GitHub Flow を選択した理由は、CI/CD で品質を自動担保する前提であれば、ブランチ構成をシンプルに保てるため。

### ブランチ命名規約

```
feat/<機能名>       新機能
fix/<バグ内容>      バグ修正
ci/<変更内容>       CI/CD 設定変更
docs/<対象>         ドキュメント変更
refactor/<対象>     リファクタリング
test/<対象>         テスト追加・修正
chore/<内容>        その他（依存更新等）
```

例：`feat/cart-discount`, `fix/total-calculation`, `ci/playwright-cache`

---

## 3. コミット・PR 運用

### Conventional Commits

コミットメッセージのフォーマットを以下の規約で統一している。

```
<type>(<scope>): <description>
```

| type | 用途 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: add discount feature to CartService` |
| `fix` | バグ修正 | `fix: correct getTotal calculation` |
| `docs` | ドキュメント | `docs: update README with API endpoints` |
| `test` | テスト | `test: add unit tests for CartService` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |
| `refactor` | リファクタリング | `refactor: extract discount logic` |
| `chore` | その他 | `chore: update dependencies` |

### commitlint + husky による強制

`commitlint` と `husky` の `commit-msg` フックにより、規約に沿わないコミットメッセージを自動的に拒否する。

```bash
# NG: 規約に沿わない → エラー
git commit -m "updated stuff"
# → ✖   subject may not be empty
# → ✖   type may not be empty

# OK: 規約に沿っている → 成功
git commit -m "feat: add tax calculation method"
```

設定ファイル構成：

```
commitlint.config.js    # @commitlint/config-conventional を継承
.husky/commit-msg       # commitlint を実行するフック
```

### Conventional Commits の利点

- コミット履歴が統一され、`git log` での調査効率が上がる
- type を見るだけで変更の性質がわかる（feat = 新機能、fix = バグ修正）
- 将来的にはリリースノートの自動生成にも活用できる

---

## 4. Git によるトラブルシューティング

バグの原因コミットを特定する調査フローとして、`git log` → `git blame` → `git bisect` の3段階を使い分ける。

### 調査フロー全体像

```
① git log     何が変わったか全体像を把握する（時系列・ファイル単位）
      ↓
② git blame   怪しい行の犯人（コミット）を特定する
      ↓
③ git bisect  機械的に原因コミットを二分探索で特定する
      ↓
  git show     原因コミットの詳細を確認する
      ↓
  修正 → テスト → コミット
```

### git log — 変更の全体像を把握する

「いつ・誰が・何を変えたか」を調査する最も基本的なツール。

```bash
# 直近のコミット一覧
git log --oneline

# 特定ファイルの変更履歴に絞る
git log --oneline -- src/cart/cart.service.ts

# 変更内容（diff）を表示
git log -p -- src/cart/cart.service.ts

# ツリー表示で全体の流れを視覚化
git log --oneline --graph --all

# 時間指定
git log --since="1 week ago" --oneline
```

**使いどころ：** 「先週まで動いていた機能がいつ壊れたか」の時期の特定や、ファイル単位で絞り込むことで、関連するコミットだけを効率的に確認できる。

### git blame — 行単位の変更追跡

特定の行が「いつ・誰のコミットで」書かれたかを特定する。

```bash
# ファイル全体の blame
git blame src/cart/cart.service.ts

# 行範囲を指定（例：30〜40行目）
git blame -L 30,40 src/cart/cart.service.ts
```

出力例：

```
a1b2c3d4 (Author 2025-01-10) export class CartService {
e5f6g7h8 (Author 2025-02-01)   getTotal(): number {
e5f6g7h8 (Author 2025-02-01)     return this.items.reduce(
f664059a (Author 2025-02-05)       (sum, item) => sum + item.price + item.quantity,
```

blame で特定したコミットハッシュから `git show <hash>` でコミットの全変更内容を確認し、GitHub 上では対応する PR やレビューコメントまで追跡できる。

### git bisect — 二分探索による原因特定

コミット数が多い場合に威力を発揮する。100コミットの中から原因を探す場合、線形探索なら最大100回の確認が必要だが、二分探索なら約7回で特定できる。

#### 手動 bisect

```bash
git bisect start
git bisect bad                    # 現在の状態 = バグあり
git bisect good <good-commit>     # 正常だったコミットを指定

# Git が中間のコミットにチェックアウトする
# → テストを実行して good / bad を判定
git bisect good   # または git bisect bad

# 繰り返すと原因コミットが特定される
# "abc1234 is the first bad commit"

git bisect reset   # 元に戻る
```

#### 自動 bisect（bisect run）

テストがあれば、good/bad の判定を自動化できる。

```bash
git bisect start
git bisect bad
git bisect good <good-commit>
git bisect run npx vitest run --config packages/backend/vitest.config.ts
```

Git が各コミットで自動的にテストを実行し、テスト成功 = good、テスト失敗 = bad と判定して、原因コミットを自動特定する。

**これが「自動テストと Git トラブルシューティングが繋がるポイント」である。** テストが整備されていれば、バグの原因特定も自動化できる。

### 実務での使い分け

| 状況 | 推奨手法 |
|------|---------|
| コミット数が少ない（数件〜数十件） | `git log` + `git blame` で十分 |
| コミット数が多い / 原因が不明確 | `git bisect` |
| テストが整備されている | `git bisect run` で完全自動化 |

---

## 5. GitHub Actions による開発フロー自動化

### ワークフロー全体像

```
PR 作成 / 更新
  │
  ├─ Checkout
  ├─ pnpm setup + Node.js setup
  ├─ pnpm install（キャッシュ利用）
  │
  ├─ Vitest ユニットテスト + カバレッジ計測
  │   ├─ Backend（閾値 80%）
  │   └─ Frontend
  │
  ├─ カバレッジレポート → PR サマリに表示
  │
  ├─ Playwright API テスト
  │
  └─ （失敗時のみ）Playwright レポート保存
```

### ブランチ保護ルール

GitHub の Ruleset 機能で以下を設定している。

| ルール | 設定 | 効果 |
|--------|------|------|
| Require a pull request | ON | main への直接 push を禁止 |
| Require status checks | ON | CI（Test & Coverage）が通らないとマージ不可 |
| Require up-to-date branch | ON | マージ前に最新の main を取り込む |

これにより、main ブランチは「CI が通った PR 経由でのみ変更される」状態が保証される。

---

## 6. パフォーマンス最適化・セキュリティ

### CI キャッシュ戦略

CI の実行時間短縮のため、以下のキャッシュを導入した。

#### pnpm store キャッシュ

`setup-node` の `cache: "pnpm"` オプションにより、pnpm のパッケージキャッシュが GitHub Actions のキャッシュに保存される。2回目以降の `pnpm install` を大幅に高速化する。

#### Playwright ブラウザキャッシュ

Playwright のブラウザインストールは毎回 30 秒以上かかる。バージョンをキーにしたキャッシュで短縮する。

```yaml
- name: Get Playwright version
  id: playwright-version
  run: echo "version=$(cd e2e && npx playwright --version)" >> $GITHUB_OUTPUT

- name: Cache Playwright browsers
  id: playwright-cache
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ steps.playwright-version.outputs.version }}

- name: Install Playwright browsers
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: cd e2e && npx playwright install --with-deps chromium

- name: Install Playwright OS dependencies
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: cd e2e && npx playwright install-deps chromium
```

キャッシュヒット時でも OS 依存ライブラリ（`install-deps`）は必要な点に注意。

#### 効果

```
最適化前：約 1分3秒
最適化後：約 47〜49秒（キャッシュヒット時）
改善率：約 20% 短縮
```

### Dependabot による依存管理の自動化

GitHub の Dependabot を設定し、依存パッケージの更新を自動化している。

```yaml
# .github/dependabot.yml（抜粋）
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      timezone: "Asia/Tokyo"
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

#### 設計のポイント

| 設計判断 | 理由 |
|---------|------|
| `weekly` で毎週月曜チェック | `daily` だと PR が多すぎ、`monthly` だと脆弱性放置リスク |
| マイナー・パッチをグループ化 | 小さな更新をまとめて1 PR にし、レビュー負荷を軽減 |
| GitHub Actions も対象に含める | `actions/checkout@v4` 等のバージョンも自動更新 |
| セキュリティアラート有効化 | 脆弱性発見時に自動で修正 PR を作成 |

### セキュリティアラートの運用

GitHub の Code security 設定で以下を有効化している。

- **Dependabot alerts** : 脆弱性のある依存を検出したら通知
- **Dependabot security updates** : 脆弱性修正の PR を自動作成

これにより、セキュリティパッチの適用が開発者の能動的な作業を待たずに進む。
