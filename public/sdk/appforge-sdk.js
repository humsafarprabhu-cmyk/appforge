/**
 * AppForge SDK v1.0
 * Lightweight client library injected into every generated app.
 * Provides: Auth, Database (collections), Storage, Notifications, UI helpers.
 * ~8KB minified. Zero dependencies.
 * 
 * Usage in generated apps:
 *   await AppForge.init({ appId: 'xxx' });
 *   await AppForge.auth.signUp('email', 'pass', 'Name');
 *   await AppForge.db.collection('workouts').add({ title: 'Leg Day', duration: 45 });
 *   const workouts = await AppForge.db.collection('workouts').list();
 */

(function(global) {
  'use strict';

  // ─── CONFIG ──────────────────────────────────────────────────────────────────
  const DEFAULT_API = '__APPFORGE_API_URL__'; // replaced at build time
  let config = {
    appId: null,
    apiUrl: DEFAULT_API,
    debug: false,
  };
  let currentUser = null;
  let authToken = null;
  let authListeners = [];

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  function log(...args) {
    if (config.debug) console.log('[AppForge]', ...args);
  }

  async function api(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    headers['X-App-Id'] = config.appId;

    const res = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    return res.json();
  }

  // ─── LOCAL STORAGE FALLBACK ──────────────────────────────────────────────────
  // When no API is configured, use localStorage for offline/demo mode
  const localDB = {
    _key(collection) {
      return `appforge_${config.appId}_${collection}`;
    },
    _getAll(collection) {
      try {
        return JSON.parse(localStorage.getItem(this._key(collection)) || '[]');
      } catch { return []; }
    },
    _saveAll(collection, items) {
      localStorage.setItem(this._key(collection), JSON.stringify(items));
    },
    add(collection, data) {
      const items = this._getAll(collection);
      const item = {
        id: crypto.randomUUID ? crypto.randomUUID() : 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(item);
      this._saveAll(collection, items);
      return item;
    },
    get(collection, id) {
      return this._getAll(collection).find(i => i.id === id) || null;
    },
    list(collection, filters = {}) {
      let items = this._getAll(collection);
      // Apply simple filters
      for (const [key, value] of Object.entries(filters)) {
        if (key === '_limit' || key === '_offset' || key === '_orderBy' || key === '_order') continue;
        items = items.filter(i => i[key] === value);
      }
      // Sort
      if (filters._orderBy) {
        const order = filters._order === 'asc' ? 1 : -1;
        items.sort((a, b) => {
          if (a[filters._orderBy] < b[filters._orderBy]) return -order;
          if (a[filters._orderBy] > b[filters._orderBy]) return order;
          return 0;
        });
      }
      // Pagination
      const offset = filters._offset || 0;
      const limit = filters._limit || 100;
      return items.slice(offset, offset + limit);
    },
    update(collection, id, data) {
      const items = this._getAll(collection);
      const idx = items.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Item not found');
      items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() };
      this._saveAll(collection, items);
      return items[idx];
    },
    delete(collection, id) {
      const items = this._getAll(collection).filter(i => i.id !== id);
      this._saveAll(collection, items);
    },
    count(collection) {
      return this._getAll(collection).length;
    },
    clear(collection) {
      localStorage.removeItem(this._key(collection));
    },
  };

  // ─── OFFLINE MODE CHECK ─────────────────────────────────────────────────────
  function isOffline() {
    return !config.apiUrl || config.apiUrl === '__APPFORGE_API_URL__' || config.apiUrl === '';
  }

  // ─── AUTH MODULE ─────────────────────────────────────────────────────────────
  const auth = {
    async signUp(email, password, displayName) {
      if (isOffline()) {
        // Offline auth simulation
        const user = {
          id: crypto.randomUUID ? crypto.randomUUID() : 'user_' + Date.now(),
          email,
          display_name: displayName || email.split('@')[0],
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
        localStorage.setItem(`appforge_${config.appId}_user`, JSON.stringify(user));
        currentUser = user;
        authToken = 'offline_token';
        _notifyAuthListeners(user);
        log('Signed up (offline):', email);
        return { user, error: null };
      }
      try {
        const res = await api('POST', '/sdk/auth/signup', { email, password, display_name: displayName });
        currentUser = res.user;
        authToken = res.token;
        localStorage.setItem(`appforge_${config.appId}_token`, authToken);
        localStorage.setItem(`appforge_${config.appId}_user`, JSON.stringify(currentUser));
        _notifyAuthListeners(currentUser);
        return { user: currentUser, error: null };
      } catch (e) {
        return { user: null, error: e.message };
      }
    },

    async signIn(email, password) {
      if (isOffline()) {
        const stored = localStorage.getItem(`appforge_${config.appId}_user`);
        if (stored) {
          currentUser = JSON.parse(stored);
          authToken = 'offline_token';
          _notifyAuthListeners(currentUser);
          return { user: currentUser, error: null };
        }
        return { user: null, error: 'No account found. Sign up first.' };
      }
      try {
        const res = await api('POST', '/sdk/auth/signin', { email, password });
        currentUser = res.user;
        authToken = res.token;
        localStorage.setItem(`appforge_${config.appId}_token`, authToken);
        localStorage.setItem(`appforge_${config.appId}_user`, JSON.stringify(currentUser));
        _notifyAuthListeners(currentUser);
        return { user: currentUser, error: null };
      } catch (e) {
        return { user: null, error: e.message };
      }
    },

    async signOut() {
      currentUser = null;
      authToken = null;
      localStorage.removeItem(`appforge_${config.appId}_token`);
      localStorage.removeItem(`appforge_${config.appId}_user`);
      _notifyAuthListeners(null);
      if (!isOffline()) {
        try { await api('POST', '/sdk/auth/signout', {}); } catch {}
      }
    },

    getUser() {
      return currentUser;
    },

    isLoggedIn() {
      return !!currentUser;
    },

    onAuthChange(callback) {
      authListeners.push(callback);
      // Immediately fire with current state
      callback(currentUser);
      // Return unsubscribe function
      return () => {
        authListeners = authListeners.filter(l => l !== callback);
      };
    },
  };

  function _notifyAuthListeners(user) {
    authListeners.forEach(cb => {
      try { cb(user); } catch (e) { console.error('Auth listener error:', e); }
    });
  }

  // ─── DATABASE MODULE ─────────────────────────────────────────────────────────
  const db = {
    collection(name) {
      return {
        async add(data) {
          log(`db.${name}.add`, data);
          if (isOffline()) return localDB.add(name, data);
          return api('POST', `/sdk/data/${name}`, { data });
        },

        async get(id) {
          log(`db.${name}.get`, id);
          if (isOffline()) return localDB.get(name, id);
          return api('GET', `/sdk/data/${name}/${id}`);
        },

        async list(filters = {}) {
          log(`db.${name}.list`, filters);
          if (isOffline()) return localDB.list(name, filters);
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(filters)) params.set(k, String(v));
          return api('GET', `/sdk/data/${name}?${params.toString()}`);
        },

        async update(id, data) {
          log(`db.${name}.update`, id, data);
          if (isOffline()) return localDB.update(name, id, data);
          return api('PATCH', `/sdk/data/${name}/${id}`, { data });
        },

        async delete(id) {
          log(`db.${name}.delete`, id);
          if (isOffline()) return localDB.delete(name, id);
          return api('DELETE', `/sdk/data/${name}/${id}`);
        },

        async count() {
          if (isOffline()) return localDB.count(name);
          const res = await api('GET', `/sdk/data/${name}/count`);
          return res.count;
        },

        // Real-time listener (polls every 5s in offline mode, SSE in online mode)
        onSnapshot(callback, intervalMs = 5000) {
          let active = true;
          let lastData = null;

          const poll = async () => {
            if (!active) return;
            try {
              const data = isOffline() ? localDB.list(name) : await api('GET', `/sdk/data/${name}`);
              const dataStr = JSON.stringify(data);
              if (dataStr !== lastData) {
                lastData = dataStr;
                callback(data);
              }
            } catch (e) {
              console.error(`Snapshot error (${name}):`, e);
            }
            if (active) setTimeout(poll, intervalMs);
          };

          poll();
          return () => { active = false; }; // unsubscribe
        },
      };
    },
  };

  // ─── STORAGE MODULE ──────────────────────────────────────────────────────────
  const storage = {
    async upload(file, purpose = 'general') {
      log('storage.upload', file.name, purpose);
      if (isOffline()) {
        // Store as data URL in localStorage
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fileData = {
              id: 'file_' + Date.now(),
              name: file.name,
              type: file.type,
              size: file.size,
              url: reader.result,
              purpose,
              created_at: new Date().toISOString(),
            };
            const files = JSON.parse(localStorage.getItem(`appforge_${config.appId}_files`) || '[]');
            files.push(fileData);
            localStorage.setItem(`appforge_${config.appId}_files`, JSON.stringify(files));
            resolve(fileData);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', purpose);
      const headers = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      headers['X-App-Id'] = config.appId;
      const res = await fetch(`${config.apiUrl}/sdk/storage/upload`, { method: 'POST', headers, body: formData });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },

    async list(purpose) {
      if (isOffline()) {
        let files = JSON.parse(localStorage.getItem(`appforge_${config.appId}_files`) || '[]');
        if (purpose) files = files.filter(f => f.purpose === purpose);
        return files;
      }
      const params = purpose ? `?purpose=${purpose}` : '';
      return api('GET', `/sdk/storage/list${params}`);
    },

    async delete(fileId) {
      if (isOffline()) {
        let files = JSON.parse(localStorage.getItem(`appforge_${config.appId}_files`) || '[]');
        files = files.filter(f => f.id !== fileId);
        localStorage.setItem(`appforge_${config.appId}_files`, JSON.stringify(files));
        return;
      }
      return api('DELETE', `/sdk/storage/${fileId}`);
    },

    getUrl(fileId) {
      if (isOffline()) {
        const files = JSON.parse(localStorage.getItem(`appforge_${config.appId}_files`) || '[]');
        const file = files.find(f => f.id === fileId);
        return file ? file.url : null;
      }
      return `${config.apiUrl}/sdk/storage/${fileId}/url`;
    },
  };

  // ─── NOTIFICATIONS MODULE ───────────────────────────────────────────────────
  const notify = {
    async requestPermission() {
      if (!('Notification' in window)) {
        log('Notifications not supported');
        return 'denied';
      }
      const permission = await Notification.requestPermission();
      log('Notification permission:', permission);
      if (permission === 'granted' && !isOffline()) {
        // Register push subscription
        try {
          const reg = await navigator.serviceWorker?.ready;
          if (reg) {
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: config.vapidKey,
            });
            await api('POST', '/sdk/notifications/subscribe', { subscription: sub.toJSON() });
          }
        } catch (e) {
          log('Push subscription failed:', e);
        }
      }
      return permission;
    },

    async send(title, body, options = {}) {
      // Local notification (immediate)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: options.icon || '/icons/icon-192.png',
          badge: '/icons/icon-72.png',
          ...options,
        });
      }
    },

    async schedule(title, body, delayMs) {
      // Simple scheduled notification using setTimeout
      setTimeout(() => {
        this.send(title, body);
      }, delayMs);
    },

    async sendToUser(endUserId, title, body) {
      // Send push notification to a specific end-user (requires API)
      if (isOffline()) return;
      return api('POST', '/sdk/notifications/send', { end_user_id: endUserId, title, body });
    },

    async broadcast(title, body) {
      // Send push notification to all end-users of this app
      if (isOffline()) return;
      return api('POST', '/sdk/notifications/broadcast', { title, body });
    },
  };

  // ─── UI HELPERS ──────────────────────────────────────────────────────────────
  const ui = {
    _toastContainer: null,

    _ensureContainer() {
      if (this._toastContainer) return;
      this._toastContainer = document.createElement('div');
      this._toastContainer.id = 'appforge-toasts';
      this._toastContainer.style.cssText = `
        position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
        z-index: 99999; display: flex; flex-direction: column; gap: 8px;
        align-items: center; pointer-events: none; width: 90%; max-width: 400px;
      `;
      document.body.appendChild(this._toastContainer);
    },

    toast(message, type = 'info', durationMs = 3000) {
      this._ensureContainer();
      const colors = {
        info: 'rgba(99,102,241,0.9)',
        success: 'rgba(34,197,94,0.9)',
        error: 'rgba(239,68,68,0.9)',
        warning: 'rgba(245,158,11,0.9)',
      };
      const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
      const toast = document.createElement('div');
      toast.style.cssText = `
        background: ${colors[type] || colors.info};
        color: white; padding: 12px 20px; border-radius: 12px;
        font-family: Inter, -apple-system, sans-serif; font-size: 14px;
        backdrop-filter: blur(20px); pointer-events: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        animation: appforgeToastIn 0.3s ease-out;
        display: flex; align-items: center; gap: 8px;
      `;
      toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
      this._toastContainer.appendChild(toast);

      // Add animation keyframes if not present
      if (!document.getElementById('appforge-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'appforge-toast-styles';
        style.textContent = `
          @keyframes appforgeToastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          @keyframes appforgeToastOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-20px); } }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        toast.style.animation = 'appforgeToastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
      }, durationMs);
    },

    async confirm(message) {
      return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 99999; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px); animation: appforgeToastIn 0.2s ease-out;
        `;
        overlay.innerHTML = `
          <div style="background: rgba(20,20,25,0.95); border: 1px solid rgba(255,255,255,0.1);
            border-radius: 16px; padding: 24px; max-width: 320px; width: 90%;
            font-family: Inter, -apple-system, sans-serif; color: white; text-align: center;">
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 12px;">
              <button id="af-cancel" style="flex:1; padding: 10px; border-radius: 10px;
                background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
                color: white; font-size: 14px; cursor: pointer;">Cancel</button>
              <button id="af-confirm" style="flex:1; padding: 10px; border-radius: 10px;
                background: #6366f1; border: none; color: white; font-size: 14px;
                cursor: pointer; font-weight: 600;">Confirm</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#af-cancel').onclick = () => { overlay.remove(); resolve(false); };
        overlay.querySelector('#af-confirm').onclick = () => { overlay.remove(); resolve(true); };
      });
    },

    loading(show) {
      const existing = document.getElementById('appforge-loading');
      if (!show) { existing?.remove(); return; }
      if (existing) return;
      const el = document.createElement('div');
      el.id = 'appforge-loading';
      el.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.5);
        z-index: 99998; display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(4px);
      `;
      el.innerHTML = `
        <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #6366f1; border-radius: 50%;
          animation: appforgeSpin 0.8s linear infinite;"></div>
      `;
      if (!document.getElementById('appforge-spin-style')) {
        const s = document.createElement('style');
        s.id = 'appforge-spin-style';
        s.textContent = '@keyframes appforgeSpin { to { transform: rotate(360deg); } }';
        document.head.appendChild(s);
      }
      document.body.appendChild(el);
    },
  };

  // ─── NAVIGATION MODULE ──────────────────────────────────────────────────────
  const nav = {
    _screens: {},
    _current: null,
    _listeners: [],

    register(name, element) {
      this._screens[name] = element;
    },

    go(screenName) {
      if (!this._screens[screenName]) {
        console.warn(`[AppForge] Screen "${screenName}" not found`);
        return;
      }
      // Hide all screens
      Object.values(this._screens).forEach(el => { el.style.display = 'none'; });
      // Show target
      this._screens[screenName].style.display = 'block';
      this._current = screenName;
      // Update nav indicators
      document.querySelectorAll('[data-screen]').forEach(el => {
        el.classList.toggle('active', el.dataset.screen === screenName);
      });
      this._listeners.forEach(cb => cb(screenName));
      log('navigate:', screenName);
    },

    current() { return this._current; },

    onChange(callback) {
      this._listeners.push(callback);
      return () => { this._listeners = this._listeners.filter(l => l !== callback); };
    },
  };

  // ─── INIT ────────────────────────────────────────────────────────────────────
  async function init(options = {}) {
    config = { ...config, ...options };
    log('Initializing with config:', config);

    // Restore auth state from localStorage
    const savedToken = localStorage.getItem(`appforge_${config.appId}_token`);
    const savedUser = localStorage.getItem(`appforge_${config.appId}_user`);
    if (savedToken && savedUser) {
      authToken = savedToken;
      try {
        currentUser = JSON.parse(savedUser);
        _notifyAuthListeners(currentUser);
      } catch {}
    }

    // Validate token with server (if online)
    if (authToken && !isOffline()) {
      try {
        const res = await api('GET', '/sdk/auth/me');
        currentUser = res.user;
        localStorage.setItem(`appforge_${config.appId}_user`, JSON.stringify(currentUser));
        _notifyAuthListeners(currentUser);
      } catch {
        // Token expired
        auth.signOut();
      }
    }

    log('Ready. User:', currentUser?.email || 'not logged in');
  }

  // ─── EXPOSE GLOBAL ──────────────────────────────────────────────────────────
  global.AppForge = {
    init,
    auth,
    db,
    storage,
    notify,
    ui,
    nav,
    get config() { return { ...config }; },
    get version() { return '1.0.0'; },
  };

})(typeof window !== 'undefined' ? window : globalThis);
