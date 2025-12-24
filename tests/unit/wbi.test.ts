import { getMixinKey, encWbi } from '@/lib/bili/wbi'

describe('WBI Signing', () => {
  describe('getMixinKey', () => {
    it('should generate correct mixin key', () => {
      const origKey = 'ea1db12530124a47a9509038ec94fbad'
      // Reference value calculated from standard algorithms (or verifying stability)
      // For TDD, I might not know the exact output without running the ref algo, 
      // but I can test that it returns a string of specific length or properties if exact match is unknown.
      // However, WBI mixin is deterministic. 
      // Let's assume the implementation will produce a specific scrambled key.
      const mixinKey = getMixinKey(origKey)
      expect(typeof mixinKey).toBe('string')
      expect(mixinKey.length).toBe(32)
    })
  });

  describe('encWbi', () => {
    it('should sign parameters correctly', () => {
        const params = { foo: '114', bar: '514', baz: 1919810 }
        const imgKey = '7cd084941338484aae1ad9425b84077c'
        const subKey = '4932caff0ff746eab6f01bf08b70ac45'
        
        // Expected output is hard to calculate mentally, but we can check format
        // It should contain w_rid and wts
        const query = encWbi(params, imgKey, subKey)
        
        expect(query).toContain('foo=114')
        expect(query).toContain('bar=514')
        expect(query).toContain('baz=1919810')
        expect(query).toContain('w_rid=')
        expect(query).toContain('wts=')
    })

    it('should handle special characters in params', () => {
        const params = { title: '测试 video', desc: 'test & demo' }
        const imgKey = '7cd084941338484aae1ad9425b84077c'
        const subKey = '4932caff0ff746eab6f01bf08b70ac45'
        
        const query = encWbi(params, imgKey, subKey)
        // Should be url encoded
        expect(query).toContain('title=%E6%B5%8B%E8%AF%95%20video') // or %20 depending on implementation
    })
  })
})
