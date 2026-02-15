const KEY_ACTIVITIES = 'sc_activities';
const KEY_NUTRITION = 'sc_nutrition';
const KEY_ROUTES = 'sc_routes';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function appendRecord(key, userId, record) {
  const all = readJson(key, []);
  const next = [{ ...record, id: crypto.randomUUID(), userId }, ...all];
  writeJson(key, next);
  return next;
}

function listByUser(key, userId) {
  const all = readJson(key, []);
  return all.filter((item) => item.userId === userId);
}

export function saveLocalActivity(userId, payload) {
  const now = new Date().toISOString();
  return appendRecord(KEY_ACTIVITIES, userId, {
    ...payload,
    createdAt: now,
    startedAt: payload.startedAt || now,
  });
}

export function getLocalActivities(userId) {
  return listByUser(KEY_ACTIVITIES, userId);
}

export function saveLocalNutrition(userId, payload) {
  const now = new Date().toISOString();
  return appendRecord(KEY_NUTRITION, userId, {
    ...payload,
    loggedAt: now,
  });
}

export function getLocalNutrition(userId) {
  return listByUser(KEY_NUTRITION, userId);
}

export function saveLocalRoute(userId, payload) {
  const now = new Date().toISOString();
  return appendRecord(KEY_ROUTES, userId, {
    ...payload,
    createdAt: now,
  });
}

export function getLocalRoutes(userId) {
  return listByUser(KEY_ROUTES, userId);
}
