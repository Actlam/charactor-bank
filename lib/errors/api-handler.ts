import { ConvexError } from 'convex/values';
import {
  BaseError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  DatabaseError,
  BusinessLogicError,
  ErrorCategory,
} from './types';
import { handleError, normalizeError } from './handler';

/**
 * Convex API エラーハンドリング
 */
export class ConvexErrorHandler {
  /**
   * Convex エラーを適切なエラータイプに変換
   */
  static transformError(error: unknown): BaseError {
    // ConvexError の場合
    if (error instanceof ConvexError) {
      const message = error.data;

      // 認証エラー
      if (message.includes('Unauthenticated') || message.includes('認証')) {
        return new AuthenticationError(message);
      }

      // 認可エラー
      if (message.includes('Unauthorized') || message.includes('権限')) {
        return new AuthorizationError(message);
      }

      // バリデーションエラー
      if (message.includes('Invalid') || message.includes('無効')) {
        return new ValidationError(message);
      }

      // データベースエラー
      if (message.includes('Database') || message.includes('データベース')) {
        return new DatabaseError(message, undefined, undefined, undefined, error);
      }

      // その他のビジネスロジックエラー
      return new BusinessLogicError(message);
    }

    // ネットワークエラー
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('ネットワークエラーが発生しました', undefined, undefined, undefined, error as Error);
    }

    // その他のエラー
    const normalizedError = normalizeError(error);
    return new BaseError(
      normalizedError.message,
      ErrorCategory.UNKNOWN,
      undefined,
      undefined,
      normalizedError
    );
  }

  /**
   * API呼び出しをラップしてエラーハンドリング
   */
  static async wrapApiCall<T>(
    apiCall: () => Promise<T>,
    context?: { action?: string; promptId?: string; userId?: string }
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      const transformedError = this.transformError(error);
      
      // エラーハンドラーに送信
      handleError(transformedError, context);
      
      // エラーを再スロー
      throw transformedError;
    }
  }
}

/**
 * useMutation のエラーハンドリングラッパー
 */
export function createMutationHandler<TArgs extends Record<string, any>, TResult>(
  mutation: (args: TArgs) => Promise<TResult>,
  options?: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: BaseError) => void;
    context?: { action?: string };
  }
) {
  return async (args: TArgs): Promise<TResult | null> => {
    try {
      const result = await ConvexErrorHandler.wrapApiCall(
        () => mutation(args),
        options?.context
      );
      
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const baseError = error instanceof BaseError ? error : ConvexErrorHandler.transformError(error);
      options?.onError?.(baseError);
      return null;
    }
  };
}

/**
 * useQuery のエラーハンドリング
 */
export function handleQueryError(
  error: unknown,
  context?: { action?: string }
): void {
  const transformedError = ConvexErrorHandler.transformError(error);
  handleError(transformedError, context);
}

/**
 * フォームバリデーションエラーの処理
 */
export function createFormValidationError(
  errors: Record<string, string | string[]>
): ValidationError[] {
  const validationErrors: ValidationError[] = [];

  Object.entries(errors).forEach(([field, messages]) => {
    const messageArray = Array.isArray(messages) ? messages : [messages];
    messageArray.forEach((message) => {
      validationErrors.push(new ValidationError(message, field));
    });
  });

  return validationErrors;
}

/**
 * エラーメッセージをユーザーフレンドリーに変換
 */
export function getUserFriendlyMessage(error: BaseError | Error): string {
  if (error instanceof AuthenticationError) {
    return 'ログインが必要です。ログインページに移動します。';
  }

  if (error instanceof AuthorizationError) {
    return 'この操作を実行する権限がありません。';
  }

  if (error instanceof NetworkError) {
    return 'ネットワーク接続に問題があります。しばらくしてからもう一度お試しください。';
  }

  if (error instanceof DatabaseError) {
    return 'データの処理中にエラーが発生しました。しばらくしてからもう一度お試しください。';
  }

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof BusinessLogicError) {
    return error.message;
  }

  // デフォルトメッセージ
  return '予期しないエラーが発生しました。しばらくしてからもう一度お試しください。';
}