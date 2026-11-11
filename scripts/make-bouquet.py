"""Generates public/models/bouquet.glb — a realistic-style rose bouquet (glTF 2.0 binary, PBR materials).

Everything is procedural, so there are no licence worries: layered petals in red / pink / white,
a wrapped-paper cone, a satin ribbon with bow, leaves and baby's-breath filler.
Run:  python3 scripts/make-bouquet.py   (needs numpy)
"""
import json
import math
import os
import struct
import sys

import numpy as np

rng = np.random.default_rng(2026)
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'bouquet.glb')


def lin(c):
    """sRGB 0-1 -> linear (glTF vertex colours are linear)."""
    return np.array(c, float) ** 2.2


class Prim:
    def __init__(self):
        self.V, self.C, self.F, self.n = [], [], [], 0

    def add(self, V, C, F):
        V = np.asarray(V, float).reshape(-1, 3)
        C = np.asarray(C, float).reshape(-1, 3)
        self.V.append(V)
        self.C.append(C)
        self.F.append(np.asarray(F, int) + self.n)
        self.n += len(V)

    def finalize(self):
        V, C, F = np.vstack(self.V), np.vstack(self.C), np.vstack(self.F)
        fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
        N = np.zeros_like(V)
        for k in range(3):
            np.add.at(N, F[:, k], fn)
        l = np.linalg.norm(N, axis=1, keepdims=True)
        l[l == 0] = 1
        return V, N / l, C, F


def grid_faces(nu, nv, wrap_u=False):
    idx = np.arange(nu * nv).reshape(nu, nv)
    a, d = idx[:, :-1], idx[:, 1:]
    b, c = np.roll(idx, -1, axis=0)[:, :-1], np.roll(idx, -1, axis=0)[:, 1:]
    if not wrap_u:
        a, b, c, d = a[:-1], b[:-1], c[:-1], d[:-1]
    return np.concatenate([np.stack([a, b, c], -1).reshape(-1, 3), np.stack([a, c, d], -1).reshape(-1, 3)])


def rot_from_y(d):
    d = np.asarray(d, float) / np.linalg.norm(d)
    y = np.array([0, 1.0, 0])
    v, c = np.cross(y, d), float(np.dot(y, d))
    if np.linalg.norm(v) < 1e-8:
        return np.eye(3) if c > 0 else np.diag([1.0, -1, -1])
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx * (1 / (1 + c))


def rot_y(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def xform(V, R, pos, s=1.0):
    return (R @ (np.asarray(V) * s).T).T + pos


TONES = {  # (shadow colour at petal base, colour at the petal rim) in sRGB
    'red': ((0.30, 0.0, 0.02), (0.72, 0.04, 0.10)),
    'pink': ((0.80, 0.30, 0.45), (0.99, 0.76, 0.83)),
    'white': ((0.88, 0.84, 0.72), (1.0, 0.98, 0.95)),
}


def petal(phi, L, nl, count, openness, base, rim):
    nu, nv = 9, 7
    t = L / (nl - 1)
    u = np.linspace(-1, 1, nu)[:, None] * np.ones((1, nv))
    v = np.linspace(0, 1, nv)[None, :] * np.ones((nu, 1))
    half = (2 * math.pi / count) * 0.92 + rng.normal(0, 0.05)
    prof = np.sin(math.pi * (0.05 + 0.92 * v)) ** 0.5
    th = phi + u * half * (0.45 + 0.55 * prof)
    r0 = 0.005 + 0.0062 * L * 1.5
    H = 0.052 - 0.0035 * L
    open_ = (-0.004 + 0.021 * t ** 1.15) * openness
    curl = (0.002 + 0.012 * t) * openness
    r = r0 + open_ * v ** 1.6 + curl * (np.clip(v - 0.72, 0, 1) / 0.28) ** 2
    r += 0.0015 * np.sin(5 * u + L) * v ** 2
    y = H * v * (1 - 0.10 * u ** 2 * v) + 0.0012 * L
    P = np.stack([r * np.cos(th), y, r * np.sin(th)], -1).reshape(-1, 3)
    occ = (0.55 + 0.45 * t) * (0.6 + 0.4 * np.minimum(1, v * 1.7))
    k = (v ** 0.8).reshape(-1, 1)
    col = (lin(base) * (1 - k) + lin(rim) * k) * occ.reshape(-1, 1)
    return P, col, grid_faces(nu, nv)


def make_rose(tone, openness):
    base, rim = TONES[tone]
    nl, counts = 5, [3, 4, 5, 6, 7]
    phase = rng.uniform(0, 2 * math.pi)
    Vs, Cs, Fs, n = [], [], [], 0
    for L in range(nl):
        for k in range(counts[L]):
            phi = phase + k * 2 * math.pi / counts[L] + L * 2.399 + rng.normal(0, 0.08)
            V, C, F = petal(phi, L, nl, counts[L], openness, base, rim)
            Vs.append(V), Cs.append(C), Fs.append(F + n)
            n += len(V)
    # small green receptacle under the bloom
    th = np.linspace(0, 2 * math.pi, 10, endpoint=False)[:, None]
    hh = np.linspace(0, 1, 3)[None, :]
    rr = 0.012 * (1 - 0.55 * hh)
    P = np.stack([rr * np.cos(th) * np.ones_like(hh), -0.008 + 0.014 * hh * np.ones_like(th), rr * np.sin(th) * np.ones_like(hh)], -1).reshape(-1, 3)
    return np.vstack(Vs), np.vstack(Cs), np.vstack(Fs), (P, grid_faces(10, 3, True))


def tube(path, radius, seg=8):
    """Tube along a polyline. Returns V, F."""
    path = np.asarray(path)
    T = np.gradient(path, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    ref = np.array([0, 0, 1.0]) if abs(T[0, 2]) < 0.9 else np.array([1.0, 0, 0])
    V = []
    for p, t in zip(path, T):
        a = np.cross(t, ref)
        a /= np.linalg.norm(a)
        b = np.cross(t, a)
        for s in range(seg):
            ang = 2 * math.pi * s / seg
            V.append(p + radius * (math.cos(ang) * a + math.sin(ang) * b))
    nv = len(path)
    idx = np.arange(nv * seg).reshape(nv, seg)
    a, b = idx[:-1], idx[1:]
    a2, b2 = np.roll(a, -1, axis=1), np.roll(b, -1, axis=1)
    F = np.concatenate([np.stack([a, b, b2], -1).reshape(-1, 3), np.stack([a, b2, a2], -1).reshape(-1, 3)])
    return np.array(V), F


def strip(curve, width_dir, width, twist=0.0):
    """Flat ribbon strip along a curve."""
    curve = np.asarray(curve)
    n = len(curve)
    Vs = []
    for i, p in enumerate(curve):
        w = np.asarray(width_dir, float)
        w = w / np.linalg.norm(w)
        Vs.append([p - w * width / 2, p + w * width / 2])
    V = np.array(Vs).reshape(-1, 3)
    idx = np.arange(n * 2).reshape(n, 2)
    a, b, c, d = idx[:-1, 0], idx[:-1, 1], idx[1:, 1], idx[1:, 0]
    F = np.concatenate([np.stack([a, b, c], -1), np.stack([a, c, d], -1)])
    return V, F


def icosphere(radius, center):
    t = (1 + 5 ** 0.5) / 2
    V = np.array([[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]], float)
    F = np.array([[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]])
    V /= np.linalg.norm(V, axis=1, keepdims=True)
    return V * radius + center, F


P = {k: Prim() for k in ['red', 'pink', 'white', 'leaf', 'stem', 'wrap_out', 'wrap_in', 'ribbon', 'filler']}

BASE = np.array([0, 0.0, 0])
heads = []  # (tone, dir, length)
ring1 = ['pink', 'white', 'red', 'pink', 'white']
ring2 = ['red', 'white', 'pink', 'red', 'white', 'pink']
heads.append(('red', np.array([0, 1.0, 0]), 0.31, 0.0))
for k, tone in enumerate(ring1):
    b, a = 2 * math.pi * k / 5 + 0.3, 0.45
    heads.append((tone, np.array([math.sin(a) * math.cos(b), math.cos(a), math.sin(a) * math.sin(b)]), 0.30, b))
for k, tone in enumerate(ring2):
    b, a = 2 * math.pi * k / 6 + 0.75, 0.88
    heads.append((tone, np.array([math.sin(a) * math.cos(b), math.cos(a), math.sin(a) * math.sin(b)]), 0.27, b))

head_pos = []
for tone, d, Ln, _ in heads:
    d = d / np.linalg.norm(d)
    pos = BASE + d * Ln
    head_pos.append(pos)
    V, C, F, (SV, SF) = make_rose(tone, rng.uniform(0.85, 1.25))
    R = rot_from_y(d) @ rot_y(rng.uniform(0, 6.28))
    s = rng.uniform(0.82, 0.98)
    P[tone].add(xform(V, R, pos, s), C, F)
    P['stem'].add(xform(SV, R, pos, s), np.tile(lin((0.10, 0.28, 0.09)), (len(SV), 1)), SF)
    # stem: gentle curve from the binding point up to the bloom
    ts = np.linspace(0, 1, 12)[:, None]
    perp = np.cross(d, [0.3, 0, 1.0])
    perp /= np.linalg.norm(perp)
    path = BASE * (1 - ts) + (pos - d * 0.006) * ts + perp * 0.012 * np.sin(math.pi * ts)
    SVt, SFt = tube(path, 0.0042, 8)
    P['stem'].add(SVt, np.tile(lin((0.12, 0.30, 0.10)), (len(SVt), 1)), SFt)

# --- leaves
def leaf(length=0.12, wid=0.032):
    nu, nv = 7, 11
    u = np.linspace(-1, 1, nu)[:, None] * np.ones((1, nv))
    v = np.linspace(0, 1, nv)[None, :] * np.ones((nu, 1))
    hw = wid * np.sin(math.pi * v) ** 0.85 * (1 - 0.25 * v)
    x = u * hw
    y = v * length
    z = 0.06 * v ** 2 + 0.45 * np.abs(u) * hw + 0.004 * np.sin(8 * v) * np.abs(u)
    Pt = np.stack([x, y, z], -1).reshape(-1, 3)
    k = v.reshape(-1, 1)
    c0, c1 = lin((0.04, 0.17, 0.05)), lin((0.17, 0.42, 0.12))
    return Pt, c0 * (1 - k) + c1 * k, grid_faces(nu, nv)


for k in range(10):
    b = 2 * math.pi * k / 10 + 0.2
    tilt = rng.uniform(0.95, 1.2)
    d = np.array([math.sin(tilt) * math.cos(b), math.cos(tilt), math.sin(tilt) * math.sin(b)])
    pos = np.array([0.1 * math.cos(b), 0.13, 0.1 * math.sin(b)])
    V, C, F = leaf(rng.uniform(0.10, 0.14), rng.uniform(0.026, 0.034))
    # spin so the leaf curls back, then aim it along d
    R = rot_from_y(d) @ rot_y(-b + math.pi / 2 + rng.normal(0, 0.2))
    P['leaf'].add(xform(V, R, pos), C, F)

# --- baby's breath
placed = []
tries = 0
while len(placed) < 34 and tries < 4000:
    tries += 1
    a, b = rng.uniform(0.15, 1.15), rng.uniform(0, 2 * math.pi)
    d = np.array([math.sin(a) * math.cos(b), math.cos(a), math.sin(a) * math.sin(b)])
    pos = BASE + d * rng.uniform(0.27, 0.34)
    if min(np.linalg.norm(pos - h) for h in head_pos) < 0.075 or any(np.linalg.norm(pos - q) < 0.035 for q in placed):
        continue
    placed.append(pos)
    for dx in (0, 1, 2):  # a little cluster of three blossoms
        off = rng.normal(0, 0.011, 3)
        V, F = icosphere(rng.uniform(0.0055, 0.0085), pos + off)
        P['filler'].add(V, np.tile(lin((0.99, 0.98, 0.96)) * rng.uniform(0.85, 1.0), (len(V), 1)), F)
    path = BASE + (pos - BASE) * np.linspace(0, 1, 6)[:, None]
    SV, SF = tube(path, 0.0014, 4)
    P['stem'].add(SV, np.tile(lin((0.2, 0.36, 0.15)), (len(SV), 1)), SF)

# --- wrapping paper (double layer) and ribbon
Y0, Y1, R0, R1 = -0.12, 0.17, 0.035, 0.165


def wrap_r(y, scale=1.0):
    t = np.clip((y - Y0) / (Y1 - Y0), 0, 1)
    return (R0 + (R1 - R0) * t ** 0.9) * scale


def wrap_surface(scale, ruffle):
    nu, nv = 56, 14
    th = np.linspace(0, 2 * math.pi, nu, endpoint=False)[:, None] * np.ones((1, nv))
    t = np.linspace(0, 1, nv)[None, :] * np.ones((nu, 1))
    y = Y0 + (Y1 - Y0) * t
    r = wrap_r(y, scale) * (1 + ruffle * np.sin(7 * th + 0.5) * t ** 3)
    y = y + ruffle * 0.16 * np.sin(5 * th + 1.0) * t ** 4 * 0.1
    Pt = np.stack([r * np.cos(th), y, r * np.sin(th)], -1).reshape(-1, 3)
    return Pt, grid_faces(nu, nv, True)


Vo, Fo = wrap_surface(1.03, 0.07)
shade = np.clip((Vo[:, 1] - Y0) / (Y1 - Y0), 0, 1).reshape(-1, 1)
P['wrap_out'].add(Vo, lin((0.95, 0.74, 0.78)) * (0.75 + 0.25 * shade), Fo)
Vi, Fi = wrap_surface(0.96, 0.05)
P['wrap_in'].add(Vi, np.tile(lin((0.99, 0.96, 0.9)), (len(Vi), 1)), Fi)
# base cap
cap_th = np.linspace(0, 2 * math.pi, 24, endpoint=False)
capV = np.vstack([[0, Y0, 0]] + [[R0 * 1.03 * math.cos(a), Y0, R0 * 1.03 * math.sin(a)] for a in cap_th])
capF = np.array([[0, 1 + (i + 1) % 24, 1 + i] for i in range(24)])
P['wrap_out'].add(capV, np.tile(lin((0.9, 0.68, 0.72)), (len(capV), 1)), capF)

RIB = lin((0.62, 0.03, 0.10))
ry = -0.02
nu, nv = 64, 3
th = np.linspace(0, 2 * math.pi, nu, endpoint=False)[:, None] * np.ones((1, nv))
yy = ry + np.array([-0.014, 0.0, 0.014])[None, :] * np.ones((nu, 1))
rr = wrap_r(yy, 1.03) + 0.004
RV = np.stack([rr * np.cos(th), yy, rr * np.sin(th)], -1).reshape(-1, 3)
P['ribbon'].add(RV, np.tile(RIB, (len(RV), 1)), grid_faces(nu, nv, True))
kz = wrap_r(ry, 1.03) + 0.012
K = np.array([0, ry, kz])
sgrid = np.linspace(0, 2 * math.pi, 28)
for sgn in (-1, 1):  # two bow loops
    cx = sgn * 0.052
    curve = np.stack([K[0] + sgn * 0.052 * (1 - np.cos(sgrid)), K[1] + 0.03 * np.sin(sgrid) * (0.7 + 0.3 * np.cos(sgrid * 0.5) ** 2), K[2] + 0.012 * np.sin(sgrid / 2) + sgn * 0.0 * sgrid], -1)
    V, F = strip(curve, [0, 0.35, 1.0], 0.026)
    P['ribbon'].add(V, np.tile(RIB * 1.1, (len(V), 1)), F)
for sgn in (-1, 1):  # two tails
    s = np.linspace(0, 1, 14)
    curve = np.stack([K[0] + sgn * (0.012 + 0.05 * s ** 1.4), K[1] - 0.012 - 0.11 * s, K[2] + 0.008 + 0.012 * s], -1)
    V, F = strip(curve, [1.0, 0, 0.0], 0.022)
    # swallow-tail cut at the end
    V[-2:, 1] += np.array([0.0, 0.018])
    P['ribbon'].add(V, np.tile(RIB * 0.95, (len(V), 1)), F)
kv, kf = icosphere(0.017, K + np.array([0, 0, 0.004]))
kv[:, 0] *= 1.2
P['ribbon'].add(kv, np.tile(RIB * 1.2, (len(kv), 1)), kf)

# --- assemble glTF
MATS = {
    'red': dict(name='Rose red', rough=0.52, sheen=[0.6, 0.12, 0.15]),
    'pink': dict(name='Rose pink', rough=0.52, sheen=[1.0, 0.7, 0.78]),
    'white': dict(name='Rose white', rough=0.55, sheen=[1.0, 0.97, 0.92]),
    'leaf': dict(name='Leaf', rough=0.5),
    'stem': dict(name='Stem', rough=0.6),
    'wrap_out': dict(name='Paper blush', rough=0.72),
    'wrap_in': dict(name='Paper cream', rough=0.8),
    'ribbon': dict(name='Satin ribbon', rough=0.28, sheen=[1.0, 0.4, 0.45]),
    'filler': dict(name="Baby's breath", rough=0.6),
}

# lift so the bottom of the wrap rests on y = 0
ymin = min(p.finalize()[0][:, 1].min() for p in P.values())
bin_parts, views, accessors, prims, mats = [], [], [], [], []


def push(arr, target=None):
    data = arr.tobytes()
    while len(data) % 4:
        data += b'\0'
    off = sum(len(b) for b in bin_parts)
    bin_parts.append(data)
    views.append({'buffer': 0, 'byteOffset': off, 'byteLength': len(data), **({'target': target} if target else {})})
    return len(views) - 1


tri_total = 0
for mi, (key, prim) in enumerate(P.items()):
    V, N, C, F = prim.finalize()
    V = V - np.array([0, ymin, 0])
    tri_total += len(F)
    big = len(V) > 65535
    idx = F.astype(np.uint32 if big else np.uint16).reshape(-1)
    acc = {}
    for name, arr, typ in (('POSITION', V.astype(np.float32), 'VEC3'), ('NORMAL', N.astype(np.float32), 'VEC3'), ('COLOR_0', C.astype(np.float32), 'VEC3')):
        bv = push(arr, 34962)
        a = {'bufferView': bv, 'componentType': 5126, 'count': len(arr), 'type': typ}
        if name == 'POSITION':
            a['min'], a['max'] = arr.min(0).tolist(), arr.max(0).tolist()
        accessors.append(a)
        acc[name] = len(accessors) - 1
    bv = push(idx, 34963)
    accessors.append({'bufferView': bv, 'componentType': 5125 if big else 5123, 'count': len(idx), 'type': 'SCALAR'})
    prims.append({'attributes': acc, 'indices': len(accessors) - 1, 'material': mi, 'mode': 4})
    m = MATS[key]
    mat = {'name': m['name'], 'doubleSided': True, 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0.0, 'roughnessFactor': m['rough']}}
    if 'sheen' in m:
        mat['extensions'] = {'KHR_materials_sheen': {'sheenColorFactor': m['sheen'], 'sheenRoughnessFactor': 0.5}}
    mats.append(mat)

gltf = {
    'asset': {'version': '2.0', 'generator': 'little-hall-of-stars make-bouquet.py'},
    'extensionsUsed': ['KHR_materials_sheen'],
    'scene': 0,
    'scenes': [{'nodes': [0]}],
    'nodes': [{'name': 'Bouquet', 'mesh': 0}],
    'meshes': [{'name': 'Bouquet', 'primitives': prims}],
    'materials': mats,
    'accessors': accessors,
    'bufferViews': views,
    'buffers': [{'byteLength': sum(len(b) for b in bin_parts)}],
}
js = json.dumps(gltf, separators=(',', ':')).encode()
while len(js) % 4:
    js += b' '
binb = b''.join(bin_parts)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(binb)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(binb), 0x004E4942) + binb
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'wb').write(glb)
print(f'wrote {os.path.relpath(OUT)}  {len(glb)/1024:.0f} KB  {tri_total} triangles  height {max(p.finalize()[0][:,1].max() for p in P.values()) - ymin:.2f} m')
