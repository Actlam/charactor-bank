import { ConvexError } from "convex/values";

/**
 * Convex関数内でのエラーハンドリングユーティリティ
 */

/**
 * 認証エラーをスロー
 */
export function throwAuthenticationError(message: string = "認証が必要です"): never {
  throw new ConvexError(message);
}

/**
 * 認可エラーをスロー
 */
export function throwAuthorizationError(
  resource?: string,
  action?: string
): never {
  const message = resource && action
    ? `${resource}に対する${action}権限がありません`
    : "この操作を実行する権限がありません";
  throw new ConvexError(message);
}

/**
 * バリデーションエラーをスロー
 */
export function throwValidationError(
  field: string,
  message: string
): never {
  throw new ConvexError(`${field}: ${message}`);
}

/**
 * リソースが見つからないエラーをスロー
 */
export function throwNotFoundError(
  resource: string,
  id?: string
): never {
  const message = id
    ? `${resource} (ID: ${id}) が見つかりません`
    : `${resource}が見つかりません`;
  throw new ConvexError(message);
}

/**
 * ビジネスロジックエラーをスロー
 */
export function throwBusinessError(message: string): never {
  throw new ConvexError(message);
}

/**
 * 認証チェックヘルパー
 */
export async function requireAuth(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throwAuthenticationError();
  }
  return identity.subject;
}

/**
 * リソースの所有者チェック
 */
export function requireOwnership(
  resource: any,
  userId: string,
  resourceType: string = "リソース"
): void {
  if (!resource) {
    throwNotFoundError(resourceType);
  }
  
  if (resource.userId !== userId) {
    throwAuthorizationError(resourceType, "編集");
  }
}

/**
 * 入力値バリデーション
 */
export function validateString(
  value: string | undefined,
  field: string,
  options: {
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    pattern?: RegExp;
  } = {}
): string | undefined {
  if (options.required && !value) {
    throwValidationError(field, "必須項目です");
  }

  if (!value) return undefined;

  const trimmed = value.trim();

  if (options.required && !trimmed) {
    throwValidationError(field, "空白のみの入力は無効です");
  }

  if (options.minLength && trimmed.length < options.minLength) {
    throwValidationError(field, `${options.minLength}文字以上入力してください`);
  }

  if (options.maxLength && trimmed.length > options.maxLength) {
    throwValidationError(field, `${options.maxLength}文字以内で入力してください`);
  }

  if (options.pattern && !options.pattern.test(trimmed)) {
    throwValidationError(field, "無効な形式です");
  }

  return trimmed;
}

/**
 * 配列バリデーション
 */
export function validateArray<T>(
  value: T[] | undefined,
  field: string,
  options: {
    minItems?: number;
    maxItems?: number;
    required?: boolean;
  } = {}
): T[] | undefined {
  if (options.required && (!value || value.length === 0)) {
    throwValidationError(field, "1つ以上の項目が必要です");
  }

  if (!value) return undefined;

  if (options.minItems && value.length < options.minItems) {
    throwValidationError(field, `${options.minItems}個以上必要です`);
  }

  if (options.maxItems && value.length > options.maxItems) {
    throwValidationError(field, `${options.maxItems}個以内にしてください`);
  }

  return value;
}