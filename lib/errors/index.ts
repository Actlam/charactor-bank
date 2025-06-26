/**
 * エラーハンドリング関連のエクスポート
 */

// エラータイプ
export * from './types';

// エラーハンドラー
export * from './handler';

// APIエラーハンドラー
export * from './api-handler';

// よく使うものを名前付きエクスポート
export {
  BaseError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  DatabaseError,
  BusinessLogicError,
  ErrorCategory,
  ErrorSeverity,
} from './types';

export {
  handleError,
  withErrorHandling,
  normalizeError,
} from './handler';

export {
  ConvexErrorHandler,
  createMutationHandler,
  handleQueryError,
  getUserFriendlyMessage,
} from './api-handler';