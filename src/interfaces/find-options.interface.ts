export interface FindOptionsInterface<T> {
  filter: any
  select: Record<string, number>
  sort: Record<string, number>
  limit?: number
}
