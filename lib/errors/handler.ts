import * as Sentry from '@sentry/nextjs';
import { ErrorContext, BaseError, ErrorSeverity } from './types';

/**
 * エラーハンドリングの設定
 */
interface ErrorHandlerConfig {
  logToConsole?: boolean;
  sendToSentry?: boolean;
  includeStackTrace?: boolean;
}

const defaultConfig: ErrorHandlerConfig = {
  logToConsole: process.env.NODE_ENV === 'development',
  sendToSentry: process.env.NODE_ENV === 'production',
  includeStackTrace: process.env.NODE_ENV === 'development',
};

/**
 * エラーハンドラークラス
 */
class ErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: ErrorHandlerConfig = defaultConfig) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * エラーを処理する
   */
  public handle(
    error: Error | BaseError,
    context?: ErrorContext,
    additionalData?: Record<string, string | number | boolean | null>
  ): void {
    // エラーコンテキストの構築
    const errorContext = this.buildErrorContext(error, context, additionalData);

    // コンソールログ
    if (this.config.logToConsole) {
      this.logToConsole(error, errorContext);
    }

    // Sentryへの送信
    if (this.config.sendToSentry && this.shouldSendToSentry(error)) {
      this.sendToSentry(error, errorContext);
    }
  }

  /**
   * エラーをキャッチして処理する高階関数
   */
  public async catchAsync<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      throw error;
    }
  }

  /**
   * エラーコンテキストを構築
   */
  private buildErrorContext(
    error: Error | BaseError,
    context?: ErrorContext,
    additionalData?: Record<string, string | number | boolean | null>
  ): Record<string, unknown> {
    const baseContext = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      ...context,
      ...additionalData,
    };

    if (error instanceof BaseError) {
      return {
        ...baseContext,
        category: String(error.category),
        severity: String(error.severity),
        errorContext: JSON.stringify(error.context),
      };
    }

    return baseContext;
  }

  /**
   * コンソールにログ出力
   */
  private logToConsole(error: Error | BaseError, context: Record<string, unknown>): void {
    const isBaseError = error instanceof BaseError;

    console.group(`🚨 ${error.name}: ${error.message}`);
    
    if (isBaseError) {
      console.log('Category:', error.category);
      console.log('Severity:', error.severity);
    }

    console.log('Context:', context);

    if (this.config.includeStackTrace && error.stack) {
      console.log('Stack Trace:', error.stack);
    }

    console.groupEnd();
  }

  /**
   * Sentryにエラーを送信
   */
  private sendToSentry(error: Error | BaseError, context: Record<string, unknown>): void {
    // エラーレベルの設定
    const sentryLevel = this.getSentryLevel(error);

    // Sentryスコープの設定
    Sentry.withScope((scope) => {
      // レベル設定
      scope.setLevel(sentryLevel);

      // タグの設定
      if (error instanceof BaseError) {
        scope.setTag('error.category', error.category);
        scope.setTag('error.severity', error.severity);
      }

      // コンテキストの設定
      scope.setContext('error_details', context);

      // ユーザー情報の設定
      if (context.userId) {
        scope.setUser({ id: String(context.userId) });
      }

      // エラーの送信
      Sentry.captureException(error);
    });
  }

  /**
   * Sentryに送信すべきかどうかを判定
   */
  private shouldSendToSentry(error: Error | BaseError): boolean {
    // 開発環境では送信しない
    if (process.env.NODE_ENV === 'development') {
      return false;
    }

    // BaseErrorの場合、重要度で判定
    if (error instanceof BaseError) {
      // LOW severityは送信しない
      return error.severity !== ErrorSeverity.LOW;
    }

    return true;
  }

  /**
   * エラー重要度に応じたログメソッドを取得
   */
  private getLogMethod(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }

  /**
   * Sentryのエラーレベルを取得
   */
  private getSentryLevel(error: Error | BaseError): Sentry.SeverityLevel {
    if (!(error instanceof BaseError)) {
      return 'error';
    }

    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      default:
        return 'error';
    }
  }
}

// シングルトンインスタンス
export const errorHandler = new ErrorHandler();

/**
 * エラーハンドリングのヘルパー関数
 */
export function handleError(
  error: Error | BaseError,
  context?: ErrorContext,
  additionalData?: Record<string, string | number | boolean | null>
): void {
  errorHandler.handle(error, context, additionalData);
}

/**
 * 非同期関数のエラーハンドリング
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): Promise<T> {
  return errorHandler.catchAsync(fn, context);
}

/**
 * エラーを適切な型に変換
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    return new Error(JSON.stringify(error));
  }

  return new Error('Unknown error occurred');
}