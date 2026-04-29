export function createQueryKeys<TScope extends string>(scope: TScope) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [scope, 'list', filters] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: string | number) => [scope, 'detail', id] as const,
  }
}
