# Requirements Document

## Introduction

タスク管理において期限日・優先度の把握が困難な個人ユーザーを対象に、シンプルかつ直感的なタスク管理 Web アプリを提供する。タスクの追加・編集・完了・削除、期限日と優先度の設定、フィルタリング・ソートによる整理、およびブラウザへのデータ永続化を実現し、ブラウザを閉じても状態が保持される快適な操作体験を目指す。

## Boundary Context

- **In scope**: タスク CRUD、期限日管理（期限切れ検知）、優先度管理（高・中・低）、フィルタリング（全て / 未完了 / 完了済み / 期限切れ）、ソート（期限日・優先度・作成日）、ブラウザへのデータ永続化、レスポンシブ UI、UI アニメーション、単体テスト
- **Out of scope**: ユーザー認証・ログイン、バックエンド API・データベース、複数ユーザーによる共有・コラボレーション、プッシュ通知・リマインダー、モバイルアプリ（iOS / Android）、サブタスク・階層構造、E2E テスト
- **Adjacent expectations**: 将来的にバックエンド API へ移行できるよう永続化の入出口を抽象化することが期待されるが、API クライアント実装はこのスペックのスコープ外である

## Requirements

### Requirement 1: タスク追加

**Objective:** As a 個人ユーザー, I want タスクのタイトルを入力してリストに追加できる, so that 今後のタスクを記録できる

#### Acceptance Criteria

1. When ユーザーがタスクタイトルを入力してフォームを送信すると, the Todo App shall タイトルを持つ新しいタスクをリストに追加する
2. If ユーザーが空のタイトルでフォームを送信しようとすると, the Todo App shall 送信を阻止してバリデーションエラーメッセージを表示する
3. The Todo App shall タスク追加後に入力フィールドをクリアしてフォーカスを入力欄に戻す

---

### Requirement 2: タスク編集

**Objective:** As a 個人ユーザー, I want 既存タスクのタイトル・期限日・優先度を変更できる, so that タスクの内容を最新の状態に保てる

#### Acceptance Criteria

1. When ユーザーがタスクの編集操作をトリガーすると, the Todo App shall タイトル・期限日・優先度を編集可能なフォームを表示する
2. When ユーザーが編集内容を保存すると, the Todo App shall 変更内容をタスクリストに即座に反映する
3. When ユーザーが編集をキャンセルすると, the Todo App shall 変更を破棄して元の表示状態に戻す
4. If タスクタイトルが空の状態で保存しようとすると, the Todo App shall 保存を阻止してバリデーションエラーメッセージを表示する

---

### Requirement 3: タスク完了

**Objective:** As a 個人ユーザー, I want タスクに完了マークをつけて進捗を管理できる, so that 作業の進捗を一目で把握できる

#### Acceptance Criteria

1. When ユーザーがタスクの完了チェックボックスをオンにすると, the Todo App shall そのタスクを完了済み状態に変更して未完了タスクと視覚的に区別できるスタイルを適用する
2. When ユーザーが完了済みタスクのチェックボックスをオフにすると, the Todo App shall そのタスクを未完了状態に戻す
3. The Todo App shall 完了状態の切り替え時に視覚的なトランジションを付与する

---

### Requirement 4: タスク削除

**Objective:** As a 個人ユーザー, I want 不要なタスクをリストから削除できる, so that リストを整理できる

#### Acceptance Criteria

1. When ユーザーがタスクの削除操作をトリガーすると, the Todo App shall そのタスクをリストから除去する
2. The Todo App shall 削除時に要素が滑らかに消えるアニメーションを表示する

---

### Requirement 5: 期限日管理

**Objective:** As a 個人ユーザー, I want タスクに期限日を設定して期限切れを視覚的に確認できる, so that タスクの見落としを防げる

#### Acceptance Criteria

1. When ユーザーがタスク作成・編集時に期限日を入力すると, the Todo App shall その日付をタスクに関連付けて表示する
2. While タスクの期限日が現在の日付より過去である, the Todo App shall そのタスクを期限切れとして他のタスクと視覚的に区別できるスタイルで表示する
3. The Todo App shall 期限日が設定されていないタスクを期限なしとして正常に処理する

---

### Requirement 6: 優先度管理

**Objective:** As a 個人ユーザー, I want タスクに優先度（高・中・低）を設定してバッジで確認できる, so that 重要度に応じた作業順序を判断できる

#### Acceptance Criteria

1. The Todo App shall タスク作成・編集時に優先度として高・中・低の 3 段階から選択できる UI を提供する
2. When ユーザーが優先度を選択すると, the Todo App shall 選択した優先度をタスクアイテムにバッジとして表示する
3. The Todo App shall 優先度が設定されていないタスクをデフォルト優先度（低）として扱い、低バッジを表示する

---

### Requirement 7: フィルタリング

**Objective:** As a 個人ユーザー, I want タスクリストをステータスでフィルタリングできる, so that 関心のあるタスクのみに集中できる

#### Acceptance Criteria

1. The Todo App shall 全て・未完了・完了済み・期限切れの 4 つのフィルター選択肢を提供する
2. When ユーザーがフィルターを選択すると, the Todo App shall そのフィルター条件に合致するタスクのみを表示する
3. If 選択したフィルターに合致するタスクが存在しない場合, the Todo App shall 該当タスクがないことをユーザーに伝えるメッセージを表示する
4. The Todo App shall フィルターとソートを同時に適用できる

---

### Requirement 8: ソート

**Objective:** As a 個人ユーザー, I want タスクリストを期限日・優先度・作成日でソートできる, so that 優先すべきタスクを素早く見つけられる

#### Acceptance Criteria

1. The Todo App shall 期限日・優先度・作成日の 3 つのソート基準を選択できる UI を提供する
2. When ユーザーがソート基準を選択すると, the Todo App shall タスクリストをその基準に従って並べ替えて表示する

---

### Requirement 9: データ永続化

**Objective:** As a 個人ユーザー, I want ブラウザを閉じても再訪問時にタスクが保持されている, so that 作業内容を失うことなく継続的に管理できる

#### Acceptance Criteria

1. The Todo App shall タスクの作成・更新・削除のたびにデータをブラウザに自動保存する
2. When ユーザーがブラウザでアプリを再度開くと, the Todo App shall 最後に保存されたタスク一覧を復元して表示する
3. If データの保存または読み込みに失敗すると, the Todo App shall エラーメッセージをユーザーに表示してセッション内での操作は継続できることを伝える

---

### Requirement 10: レスポンシブデザイン

**Objective:** As a 個人ユーザー, I want スマートフォンやタブレットでも快適にアプリを利用できる, so that デバイスを選ばずタスク管理できる

#### Acceptance Criteria

1. The Todo App shall モバイル（幅 375px 以上）・タブレット・デスクトップの各画面幅でレイアウトが崩れずに表示される
2. The Todo App shall タッチ操作でタスクの追加・完了トグル・削除・フィルタリングが操作できる

---

### Requirement 11: UI アニメーション

**Objective:** As a 個人ユーザー, I want タスクの操作に滑らかなアニメーションが付いている, so that 操作のフィードバックが直感的に理解できる

#### Acceptance Criteria

1. When タスクがリストに追加されると, the Todo App shall 要素が滑らかに現れるアニメーションを表示する
2. When タスクが削除されると, the Todo App shall 要素が滑らかに消えるアニメーションを表示する
3. When タスクの完了状態が切り替わると, the Todo App shall 視覚的なトランジションアニメーションを表示する

---

### Requirement 12: 単体テスト

**Objective:** As a 開発者, I want コアロジックを単体テストで検証できる, so that リファクタリング時のデグレードを防げる

#### Acceptance Criteria

1. The Todo App shall タスクの追加・編集・削除・完了切り替えのドメインロジックを単体テストでカバーする
2. The Todo App shall フィルタリング・ソートのロジックを単体テストでカバーする
3. The Todo App shall データ永続化（保存・復元）のロジックを単体テストでカバーする
