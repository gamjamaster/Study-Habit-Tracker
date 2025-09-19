import json
import time
from typing import Any, Optional, Dict
from threading import Lock

class CacheManager:
    """In-memory cache manager class (Redis alternative)"""

    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()

    def get_cache_key(self, user_id: str, endpoint: str, params: dict = None) -> str:
        """Generate cache key"""
        key_parts = [user_id, endpoint]
        if params:
            # Sort parameters to create consistent keys
            sorted_params = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
            key_parts.append(sorted_params)
        return ":".join(key_parts)

    def get(self, key: str) -> Optional[Any]:
        """Get data from cache"""
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if time.time() < entry['expires_at']:
                    return entry['data']
                else:
                    # Delete expired cache
                    del self._cache[key]
            return None

    def set(self, key: str, value: Any, expire_seconds: int = 300) -> bool:
        """Store data in cache"""
        try:
            with self._lock:
                self._cache[key] = {
                    'data': value,
                    'expires_at': time.time() + expire_seconds
                }
            return True
        except Exception as e:
            print(f"Cache set error: {e}")
            return False

    def delete(self, key: str) -> bool:
        """Delete data from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear_user_cache(self, user_id: str) -> int:
        """Clear all cache for a user"""
        deleted_count = 0
        with self._lock:
            keys_to_delete = [k for k in self._cache.keys() if k.startswith(f"{user_id}:")]
            for key in keys_to_delete:
                del self._cache[key]
                deleted_count += 1
        return deleted_count

# cache instance
cache_manager = CacheManager()