class SimpleCache {
    constructor() {
        this.cache = new Map();
    }

    // Set a value in cache with optional TTL (time to live) in seconds
    set(key, value, ttl = 0) {
        const item = {
            value,
            expiry: ttl ? Date.now() + (ttl * 1000) : null
        };
        this.cache.set(key, item);
    }

    // Get a value from cache
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Check if item has expired
        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    // Delete a value from cache
    delete(key) {
        this.cache.delete(key);
    }
}

module.exports = SimpleCache;