---
name: react-component
description: |
  Reactコンポーネントの設計と実装パターン。
  関数コンポーネント、カスタムフック、状態管理、アクセシビリティ、Plumeria（@plumeria/core）によるスタイリング。
  Reactコンポーネント作成、フロントエンド実装、スタイリング実装時に使用。
version: 1.0.0
---

# React Component Skill

## Overview
保守性の高いReactコンポーネント設計パターンを提供します。スタイリングにはコンパイル時CSS-in-JSの [Plumeria](https://plumeria.dev/docs)（`@plumeria/core`）を使用します。ランタイムにスタイル計算・CSS注入は発生せず、`classStyle`に渡したスタイルはビルド時に静的なCSSへ変換されます。

## Component Structure

```
src/
├── components/
│   ├── ui/              # 汎用UIコンポーネント
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   ├── features/        # 機能別コンポーネント
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── hooks/
│   └── layouts/         # レイアウト
├── hooks/               # 共通カスタムフック
└── types/               # 型定義
```

## Plumeriaでのスタイリング

- `css.create({...})` でスタイルオブジェクトを定義し、DOM要素には `className` ではなく `classStyle` prop で適用する。
- `classStyle` は配列を受け取れる。`false` / `null` / `undefined` は自動で無視されるため、`condition && styles.x` の形で条件付き適用ができる。
- 同じCSSプロパティが複数のエントリで指定された場合、**配列内で後に書かれたものが勝つ**（Tailwindの`cn()`と同じ「後勝ち」のメンタルモデル）。
- `css.create()` の呼び出しはコンポーネント外（モジュールスコープ）で1回だけ行う。レンダーごとに生成しない。
- サードパーティコンポーネントなど `classStyle` を受け取れない（`className` しか受け取れない）相手には `css.use(...)` でクラス名文字列に変換して渡す。
- 疑似クラス・疑似要素はオブジェクトキーとして `':hover'` `':focus-visible'` `':disabled'` のように書く（`&:hover`ではない）。メディアクエリは `'@media (...)'` として**疑似クラスの外側**にネストする（逆方向のネストは不可）。

```tsx
import * as css from '@plumeria/core';

const styles = css.create({
  card: {
    borderRadius: '8px',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
    '@media (max-width: 768px)': {
      ':hover': {
        transform: 'none',
      },
    },
  },
});
```

### プロジェクトのセットアップ（Next.js）

```bash
npm i -D @plumeria/core @plumeria/next-plugin
```

```typescript
// next.config.ts
import { withPlumeria } from '@plumeria/next-plugin';

export default withPlumeria(nextConfig);
```

```typescript
// plumeria.d.ts
/// <reference types="@plumeria/core/class-style" />
```

この参照型を追加すると、`ComponentPropsWithoutRef<'button'>` などJSX標準の属性に `classStyle` prop が自動で型付けされる。

## Component Template

```tsx
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import * as css from '@plumeria/core';

// Props定義（classStyleは型参照の設定によりComponentPropsWithoutRefに自動で含まれる）
interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// ベーススタイル
const styles = css.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: 500,
    transition: 'background-color 0.2s',
    ':focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.5)',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

// バリアント別スタイル
const variantStyles = css.create({
  primary: {
    backgroundColor: '#2563eb',
    color: '#fff',
    ':hover': { backgroundColor: '#1d4ed8' },
  },
  secondary: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    ':hover': { backgroundColor: '#d1d5db' },
  },
  danger: {
    backgroundColor: '#dc2626',
    color: '#fff',
    ':hover': { backgroundColor: '#b91c1c' },
  },
});

// サイズ別スタイル
const sizeStyles = css.create({
  sm: { height: '32px', padding: '0 12px', fontSize: '14px' },
  md: { height: '40px', padding: '0 16px', fontSize: '16px' },
  lg: { height: '48px', padding: '0 24px', fontSize: '18px' },
});

// コンポーネント実装
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      classStyle,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        classStyle={[
          styles.base,
          variantStyles[variant],
          sizeStyles[size],
          // 呼び出し側のclassStyleは配列末尾に置き、後勝ちで上書きを許可する
          classStyle,
        ]}
        {...props}
      >
        {isLoading && <Spinner />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 動的な値・デザイントークン

引数を取るスタイルは関数として定義できる。

```tsx
const styles = css.create({
  palette: (color: string) => ({
    backgroundColor: color,
  }),
});

export const Swatch = ({ color }: { color: string }) => (
  <span classStyle={styles.palette(color)} />
);
```

色やスペーシングなどの共通トークンはハードコードせず `css.createTheme` でスコープ付きCSS変数として定義し、テーマ切り替え（例: `.dark` クラスや `prefers-color-scheme`）に対応する。

```tsx
export const theme = css.createTheme('[data-theme="dark"]', {
  text: {
    default: '#111827',
    theme: '#eaeaea',
  },
});
```

## Custom Hook Pattern

```tsx
import { useState, useCallback } from 'react';

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseAsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAsync<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const data = await asyncFn(...args);
        setState({ data, error: null, isLoading: false });
        options.onSuccess?.(data);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, isLoading: false });
        options.onError?.(err);
        throw err;
      }
    },
    [asyncFn, options]
  );

  return { ...state, execute };
}

// 使用例
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, execute: fetchUser } = useAsync(
    () => api.getUser(userId),
    { onError: (e) => toast.error(e.message) }
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return null;

  return <div>{user.name}</div>;
}
```

## Accessibility Checklist

- [ ] セマンティックHTML要素を使用
- [ ] キーボード操作可能（Tab, Enter, Escape）
- [ ] aria-label, aria-describedby 適切に設定
- [ ] フォーカス表示が明確（`:focus-visible` のPlumeriaスタイルで定義する）
- [ ] 色だけに依存しない情報伝達
- [ ] 十分なカラーコントラスト

```tsx
// アクセシブルなモーダル例
<Dialog
  open={isOpen}
  onClose={onClose}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">確認</DialogTitle>
  <DialogDescription id="dialog-description">
    この操作は取り消せません。
  </DialogDescription>
  <DialogActions>
    <Button onClick={onClose}>キャンセル</Button>
    <Button onClick={onConfirm} variant="danger">削除</Button>
  </DialogActions>
</Dialog>
```

## Performance Patterns

```tsx
// 1. メモ化
const MemoizedComponent = memo(ExpensiveComponent);

// 2. 仮想化（大量リスト）
import { useVirtualizer } from '@tanstack/react-virtual';

// 3. 遅延ロード
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 4. 適切な状態配置
// ❌ 全体で共有
const [formData, setFormData] = useGlobalState();

// ✅ 必要な範囲で管理
function Form() {
  const [formData, setFormData] = useState();
  return <FormFields data={formData} onChange={setFormData} />;
}

// 5. css.create()はモジュールスコープで1回だけ呼ぶ
// ❌ レンダーごとに再生成
function Bad() {
  const styles = css.create({ box: { color: 'red' } });
  return <div classStyle={styles.box} />;
}

// ✅ モジュールスコープで定義済みのものを参照
const styles = css.create({ box: { color: 'red' } });
function Good() {
  return <div classStyle={styles.box} />;
}
```
