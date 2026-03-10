# AI Context
Project understanding guide for AI coding agents

This document summarizes the purpose and context of the project.

Agents should read this file before implementing UI or page content.

---

# Project Name

オリジナル香水作り体験

Original Perfume Workshop Experience

---

# Service Overview

このサイトは「オリジナル香水作り体験」を紹介し、
ユーザーが体験内容を理解し、安心して予約できるようにするためのWebサイトです。

ユーザーは自分だけの香水を作る体験を予約できます。

主な目的：

体験予約数の増加

---

# Target Users

主なターゲット：

- 20代〜40代女性
- カップル
- 観光客
- 初めてワークショップに参加する人

特徴：

- 香水や香りに興味がある
- 思い出体験を探している
- SNS映えする体験に興味がある

---

# Core Experience

このサービスでは、ユーザーが複数の香りを組み合わせて
自分だけの香水を作ることができます。

体験は主に以下の流れです。

1. 香りの説明
2. 香りの選択
3. ブレンド
4. 香水完成
5. 持ち帰り

初心者でも楽しめる体験であることが重要です。

---

# Courses

体験には2つのコースがあります。

### 12種ブレンド体験

- 初心者向け
- 香りの種類：12種類
- シンプルで体験しやすい

### 20種ブレンド体験（月末限定）

- 香りの種類：20種類
- より自由度の高いブレンド
- 月末限定の特別コース

サイトでは
この **2つのコースの違いを分かりやすく伝えること** が重要です。

---

# Reservation System

予約は静的サイトのため
疑似予約フローとして実装されています。

状態管理：

sessionStorage

予約ステップ：

1. コース選択
2. 日時選択
3. 予約情報入力
4. 確認
5. 完了

---

# Reservation Time Slots

1日3回開催

- 11:00
- 13:00
- 15:00

---

# Key UX Goals

このサイトのUX目標：

1. 体験内容がすぐ理解できる
2. コースの違いが分かりやすい
3. 初心者でも安心できる
4. スマホで迷わず予約できる

---

# Homepage Structure

トップページの構成：

1 ヒーロー
2 コース紹介
3 コース比較
4 体験の流れ
5 口コミ
6 FAQ
7 予約CTA

---

# Reviews

口コミは外部サービスを想定しています。

主な口コミ元：

- Google
- じゃらん

トップページでは
横スクロール型のレビューUIで表示します。

---

# Design Intent

デザインの方向性：

- シンプル
- 上質
- 温かみ
- 体験の特別感

ユーザーが

「楽しそう」
「自分もやってみたい」

と感じることが重要です。

---

# Language Rule

ユーザー向け表示テキストは
すべて **日本語で表示する必要があります。**

対象：

- 見出し
- ナビゲーション
- ボタン
- フォーム
- CTA
- FAQ
- 口コミセクション
- 予約フロー

英語のプレースホルダーを使用しないでください。

---

# Implementation Reminder

AIエージェントは以下を守ってください。

- docs/ と design/ を参照する
- 日本語UIを使用する
- site/ 配下のみ実装する
- CSSは .perfume-site スコープにする
- 静的サイトとして実装する