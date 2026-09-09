import { useEffect, useState } from 'react';
import { subscribeProducts, type SubscribeProductsOptions } from '../lib/products';
import { subscribeCategories } from '../lib/categories';
import { subscribeQuoteRequests } from '../lib/quotes';
import type { Category, Product, QuoteRequest } from '../lib/types';

interface AsyncList<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useProducts(options: SubscribeProductsOptions = {}): AsyncList<Product> {
  const [state, setState] = useState<AsyncList<Product>>({
    data: [],
    loading: true,
    error: null,
  });

  const publishedOnly = Boolean(options.publishedOnly);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    return subscribeProducts(
      { publishedOnly },
      (data) => setState({ data, loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: err.message }),
    );
  }, [publishedOnly]);

  return state;
}

export function useCategories(): AsyncList<Category> {
  const [state, setState] = useState<AsyncList<Category>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    return subscribeCategories(
      (data) => setState({ data, loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  return state;
}

export function useQuoteRequests(): AsyncList<QuoteRequest> {
  const [state, setState] = useState<AsyncList<QuoteRequest>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    return subscribeQuoteRequests(
      (data) => setState({ data, loading: false, error: null }),
      (err) => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  return state;
}
