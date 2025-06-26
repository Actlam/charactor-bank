/**
 * カスタムエラータイプ定義
 */

/**
 * エラーカテゴリの列挙型
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNKNOWN = 'UNKNOWN',
}

/**
 * エラー重要度の列挙型
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * エラーコンテキスト情報
 */
export interface ErrorContext {
  userId?: string;
  promptId?: string;
  action?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

/**
 * 基本エラークラス
 */
export class BaseError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;

    // Error クラスの継承に必要
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends BaseError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context);
    this.field = field;
    this.value = value;
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends BaseError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context);
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends BaseError {
  public readonly resource?: string;
  public readonly action?: string;

  constructor(
    message: string,
    resource?: string,
    action?: string,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.AUTHORIZATION, ErrorSeverity.HIGH, context);
    this.resource = resource;
    this.action = action;
  }
}

/**
 * ネットワークエラー
 */
export class NetworkError extends BaseError {
  public readonly statusCode?: number;
  public readonly url?: string;

  constructor(
    message: string,
    statusCode?: number,
    url?: string,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(
      message,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      context,
      originalError
    );
    this.statusCode = statusCode;
    this.url = url;
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends BaseError {
  public readonly operation?: string;
  public readonly table?: string;

  constructor(
    message: string,
    operation?: string,
    table?: string,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(
      message,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      context,
      originalError
    );
    this.operation = operation;
    this.table = table;
  }
}

/**
 * 外部サービスエラー
 */
export class ExternalServiceError extends BaseError {
  public readonly service: string;

  constructor(
    message: string,
    service: string,
    context?: ErrorContext,
    originalError?: Error
  ) {
    super(
      message,
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.MEDIUM,
      context,
      originalError
    );
    this.service = service;
  }
}

/**
 * ビジネスロジックエラー
 */
export class BusinessLogicError extends BaseError {
  public readonly code?: string;

  constructor(
    message: string,
    code?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ) {
    super(message, ErrorCategory.BUSINESS_LOGIC, severity, context);
    this.code = code;
  }
}

/**
 * エラーレスポンスの型定義
 */
export interface ErrorResponse {
  error: {
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    timestamp: string;
    context?: ErrorContext;
    details?: any;
  };
}