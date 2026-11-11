import { useSyncExternalStore } from 'react';
import { buildAll, FILE_OVERRIDES } from '../data/students.js';

// Tiny store: built-in content + overrides.json + this device's admin edits (localStorage).
const LS_KEY = 'lhos.overrides.v1';

function readLocal() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

let local = readLocal();
let cache = buildAll(local);
const subscribers = new Set();

function commit() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(local));
  } catch {
    /* storage unavailable */
  }
  cache = buildAll(local);
  subscribers.forEach((fn) => fn());
}

export function saveOverride(rollNumber, patch) {
  local = { ...local, [rollNumber]: { ...(local[rollNumber] || {}), ...patch } };
  commit();
}

/** Replace this device's edits for one student (an empty patch removes them). */
export function setOverride(rollNumber, patch) {
  const next = { ...local };
  if (patch && Object.keys(patch).length) next[rollNumber] = patch;
  else delete next[rollNumber];
  local = next;
  commit();
}

export function resetOverride(rollNumber) {
  const next = { ...local };
  delete next[rollNumber];
  local = next;
  commit();
}

export function importOverrides(map) {
  local = { ...map };
  commit();
}

export function hasLocalEdits(rollNumber) {
  return Boolean(local[rollNumber]);
}

/** All edits (overrides.json + this device) as {rollNumber: {field: value}} — what you drop into src/data/overrides.json. */
export function getOverridesForExport() {
  const out = {};
  for (const [k, v] of Object.entries(FILE_OVERRIDES)) out[k] = { ...v };
  for (const [k, v] of Object.entries(local)) out[k] = { ...(out[k] || {}), ...v };
  return out;
}

export function getAllStudents() {
  return cache;
}

export function useStudents() {
  return useSyncExternalStore(
    (cb) => {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    () => cache,
  );
}
