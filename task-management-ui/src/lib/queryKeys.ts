export default {
  session: () => ['auth', 'session'] as const,
  tasks: (
    page?: number,
    limit?: number,
    status?: string,
    search?: string,
    dateFilter?: string
  ) => ['tasks', { page, limit, status, search, dateFilter }] as const,
}
