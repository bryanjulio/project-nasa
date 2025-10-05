/**
 * LRU (Least Recently Used) Cache para tiles de mapa
 * Mantém os tiles mais recentemente usados em memória
 */
export class TileCache {
  private cache: Map<string, ImageBitmap>;
  private maxSize: number;

  constructor(maxSize = 500) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Obtém um tile do cache
   * Move o tile para o final (mais recentemente usado)
   */
  get(key: string): ImageBitmap | null {
    if (!this.cache.has(key)) return null;

    // Mover para o final (mais recentemente usado)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Adiciona um tile ao cache
   * Remove o tile mais antigo se necessário
   */
  set(key: string, value: ImageBitmap): void {
    // Remover mais antigo se na capacidade
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
