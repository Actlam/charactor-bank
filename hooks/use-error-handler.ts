import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BaseError, AuthenticationError } from '@/lib/errors/types';
import { handleError } from '@/lib/errors/handler';
import { getUserFriendlyMessage } from '@/lib/errors/api-handler';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  context?: Record<string, any>;
}

/**
 * エラーハンドリング用のカスタムフック
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<BaseError | Error | null>(null);

  const handleErrorWithOptions = useCallback(
    (error: BaseError | Error, additionalContext?: Record<string, any>) => {
      setIsError(true);
      setError(error);

      // エラーハンドラーに送信
      handleError(error, {
        ...options.context,
        ...additionalContext,
      });

      // トーストを表示
      if (options.showToast !== false) {
        const message = getUserFriendlyMessage(error);
        toast.error(message);
      }

      // 認証エラーの場合、ログインページにリダイレクト
      if (options.redirectOnAuth !== false && error instanceof AuthenticationError) {
        setTimeout(() => {
          router.push('/sign-in');
        }, 1500);
      }
    },
    [router, options]
  );

  const resetError = useCallback(() => {
    setIsError(false);
    setError(null);
  }, []);

  return {
    isError,
    error,
    handleError: handleErrorWithOptions,
    resetError,
  };
}

/**
 * 非同期処理のエラーハンドリング用フック
 */
export function useAsyncError() {
  const { handleError } = useErrorHandler();

  return useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        handleError(error);
      } else {
        handleError(new Error(String(error)));
      }
    },
    [handleError]
  );
}

/**
 * try-catch を簡潔に書くためのヘルパーフック
 */
export function useTryCatch() {
  const { handleError } = useErrorHandler();

  const tryAsync = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options?: {
        onSuccess?: (result: T) => void;
        onError?: (error: BaseError | Error) => void;
        showToast?: boolean;
      }
    ): Promise<T | null> => {
      try {
        const result = await fn();
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        
        if (options?.showToast !== false) {
          handleError(normalizedError);
        }
        
        options?.onError?.(normalizedError);
        return null;
      }
    },
    [handleError]
  );

  return { tryAsync };
}