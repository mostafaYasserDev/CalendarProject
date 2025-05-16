const cache = new Map();

export const cacheMiddleware = (duration) => async (req, res, next) => {
    try {
        const key = req.originalUrl;
        const cachedItem = cache.get(key);

        if (cachedItem && cachedItem.expiry > Date.now()) {
            return res.json(cachedItem.data);
        }

        const originalJson = res.json;
        res.json = function(data) {
            cache.set(key, {
                data,
                expiry: Date.now() + (duration * 1000)
            });
            return originalJson.call(this, data);
        };

        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};

export const clearCache = async (pattern) => {
    try {
        if (!pattern.includes('*')) {
            cache.delete(pattern);
            return;
        }

        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of cache.keys()) {
            if (regex.test(key)) {
                cache.delete(key);
            }
        }
    } catch (error) {
        console.error('Clear cache error:', error);
    }
};