import LRUCache from 'lru-cache'
import Debug from 'debug'
import { KBucket } from './kbucket'

const debug = Debug('devp2p:dpt:ban-list')

export class BanList {
  private lru: LRUCache<any, boolean>
  constructor() {
    this.lru = new LRUCache({ max: 30000 }) // 10k should be enough (each peer obj can has 3 keys)
  }

  add(obj: any, maxAge?: number) {
    for (const key of KBucket.getKeys(obj)) {
      debug(`add ${key}, size: ${this.lru.length}`)
      this.lru.set(key, true, maxAge)
    }
  }

  has(obj: any): boolean {
    return KBucket.getKeys(obj).some((key: string) => Boolean(this.lru.get(key)))
  }
}
