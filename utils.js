// debounce
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function getObjValueByPath(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path) ? path : path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

export function setObjValueByPath(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split(".");
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}
