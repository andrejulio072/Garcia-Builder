(function () {
  function deepClone(value) {
    if (value === null || typeof value === 'undefined') {
      return value;
    }
    return JSON.parse(JSON.stringify(value));
  }

  function seedLocalStorage(user, profile) {
    try {
      var authKey = 'sb-qejtjcaldnuokoofpqap-auth-token';
      var profileKey = 'garcia_profile_' + user.id;
      var guestKey = 'garcia_profile_guest';
      var expiresAt = Math.floor(Date.now() / 1000) + 3600;
      var profilePayload = profile ? JSON.stringify(profile) : '{}';

      if (!localStorage.getItem(authKey)) {
        localStorage.setItem(authKey, JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: expiresAt,
          user: user
        }));
      }

      localStorage.setItem('gb_current_user', JSON.stringify(user));
  localStorage.setItem(profileKey, profilePayload);
  localStorage.setItem(guestKey, profilePayload);

      window.__TEST_PROFILE_KEY__ = profileKey;
    } catch (error) {
      console.error('supabase-stub: failed to seed localStorage', error);
    }
  }

  function createSupabaseClientStub(user, profile) {
    var store = {
      profiles: {},
      body_metrics: []
    };

    if (profile && profile.basic) {
      store.profiles[user.id] = deepClone(profile.basic);
    }

    if (profile && profile.body_metrics) {
      store.body_metrics.push(deepClone(profile.body_metrics));
    }

    var response = function (data) {
      return { data: data, error: null };
    };

    var asyncResponse = function (data) {
      return Promise.resolve(response(data));
    };

    var buildQuery = function (table) {
      var state = { table: table };

      var exec = function () {
        if (table === 'profiles') {
          if (state.single) {
            return response(store.profiles[user.id] || null);
          }
          return response(Object.values(store.profiles));
        }

        if (table === 'body_metrics') {
          if (state.single) {
            var latest = store.body_metrics.length > 0
              ? store.body_metrics[store.body_metrics.length - 1]
              : null;
            return response(latest);
          }
          return response(store.body_metrics.slice());
        }

        return response(null);
      };

      var api = {
        select: function () { return api; },
        eq: function () { return api; },
        order: function () { return api; },
        in: function () { return api; },
        neq: function () { return api; },
        limit: function (count) {
          state.limit = count;
          if (count === 1) {
            state.single = true;
          }
          return api;
        },
        maybeSingle: function () {
          state.single = true;
          return asyncResponse(exec().data);
        },
        single: function () {
          state.single = true;
          return asyncResponse(exec().data);
        },
        insert: function (payload) {
          var records = Array.isArray(payload) ? payload : [payload];
          if (table === 'body_metrics') {
            records.forEach(function (record) {
              store.body_metrics.push(deepClone(record));
            });
          }
          return asyncResponse(payload);
        },
        upsert: function (payload) {
          var records = Array.isArray(payload) ? payload : [payload];
          if (table === 'profiles') {
            records.forEach(function (record) {
              store.profiles[record.id || user.id] = deepClone(record);
            });
          } else if (table === 'body_metrics') {
            records.forEach(function (record) {
              var idx = store.body_metrics.findIndex(function (item) {
                return item.user_id === record.user_id && item.date === record.date;
              });
              if (idx >= 0) {
                store.body_metrics[idx] = Object.assign({}, store.body_metrics[idx], deepClone(record));
              } else {
                store.body_metrics.push(deepClone(record));
              }
            });
          }
          return asyncResponse(payload);
        },
        update: function (payload) {
          return asyncResponse(payload);
        },
        delete: function () {
          return asyncResponse(null);
        },
        then: function (resolve, reject) {
          return asyncResponse(exec().data).then(resolve, reject);
        }
      };

      return api;
    };

    return {
      auth: {
        getUser: function () {
          return Promise.resolve({ data: { user: user }, error: null });
        },
        updateUser: function (payload) {
          var data = payload && payload.data ? payload.data : {};
          user.user_metadata = Object.assign({}, user.user_metadata || {}, data);
          return Promise.resolve({ data: { user: user }, error: null });
        },
        getSession: function () {
          return Promise.resolve({ data: { session: { user: user } }, error: null });
        },
        onAuthStateChange: function (callback) {
          if (typeof callback === 'function') {
            setTimeout(function () { callback('SIGNED_IN', { user: user }); }, 10);
          }
          return { data: { subscription: { unsubscribe: function () {} } }, error: null };
        },
        signOut: function () {
          return Promise.resolve({ error: null });
        }
      },
      storage: {
        from: function () {
          return {
            upload: function (path, file) {
              return Promise.resolve({ data: { path: path, size: file ? file.size : 0 }, error: null });
            },
            getPublicUrl: function (path) {
              return { data: { publicUrl: 'https://storage.local/' + path } };
            },
            list: function () {
              return Promise.resolve({ data: [], error: null });
            },
            remove: function () {
              return Promise.resolve({ data: null, error: null });
            }
          };
        }
      },
      rpc: function () {
        return Promise.resolve({ data: null, error: null });
      },
      from: function (table) {
        return buildQuery(table);
      }
    };
  }

  window.__setupSupabaseStub = function (user, profile) {
    var userClone = deepClone(user);
    var profileClone = deepClone(profile);

    seedLocalStorage(userClone, profileClone);

    if (!window.fetch) {
      window.fetch = function () {
        return Promise.resolve({ ok: true, json: function () { return Promise.resolve({}); }, text: function () { return Promise.resolve(''); } });
      };
    }

    window.supabase = window.supabase || {};
    window.supabase.createClient = function () {
      var client = createSupabaseClientStub(userClone, profileClone);
      window.supabaseClient = client;
      return client;
    };

    if (!window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient();
    }
  };
})();
