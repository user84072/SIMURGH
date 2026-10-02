"""Move an MP4's moov atom ahead of mdat (what `ffmpeg -movflags +faststart` does).

Media data is copied byte-for-byte; only the chunk-offset tables (stco/co64)
are shifted by the size of the relocated moov.
"""
import struct
import sys

CONTAINERS = {b"moov", b"trak", b"mdia", b"minf", b"stbl", b"edts", b"udta", b"dinf"}


def top_level(data):
    off, out = 0, []
    while off < len(data):
        n, t = struct.unpack(">I4s", data[off:off + 8])
        hdr = 8
        if n == 1:
            n, hdr = struct.unpack(">Q", data[off + 8:off + 16])[0], 16
        elif n == 0:
            n = len(data) - off
        out.append((t, off, n, hdr))
        off += n
    return out


def patch_offsets(moov, delta):
    moov = bytearray(moov)

    def walk(start, end):
        off = start
        while off + 8 <= end:
            n, t = struct.unpack(">I4s", moov[off:off + 8])
            if n < 8:
                return
            if t in CONTAINERS:
                walk(off + 8, off + n)
            elif t == b"stco":
                count = struct.unpack(">I", moov[off + 12:off + 16])[0]
                for i in range(count):
                    p = off + 16 + 4 * i
                    v = struct.unpack(">I", moov[p:p + 4])[0] + delta
                    if v > 0xFFFFFFFF:
                        sys.exit("offset overflow; needs co64 conversion")
                    moov[p:p + 4] = struct.pack(">I", v)
            elif t == b"co64":
                count = struct.unpack(">I", moov[off + 12:off + 16])[0]
                for i in range(count):
                    p = off + 16 + 8 * i
                    moov[p:p + 8] = struct.pack(">Q", struct.unpack(">Q", moov[p:p + 8])[0] + delta)
            off += n

    walk(8, len(moov))
    return bytes(moov)


def faststart(src, dst):
    data = open(src, "rb").read()
    atoms = top_level(data)
    names = [a[0] for a in atoms]
    if b"moov" not in names or b"mdat" not in names:
        sys.exit(f"{src}: missing moov or mdat")
    if names.index(b"moov") < names.index(b"mdat"):
        print(f"{src}: already faststart")
        return
    moov_atom = next(a for a in atoms if a[0] == b"moov")
    if moov_atom[3] != 8:
        sys.exit(f"{src}: 64-bit moov header unsupported")
    moov = data[moov_atom[1]:moov_atom[1] + moov_atom[2]]
    moov = patch_offsets(moov, len(moov))

    out = []
    for t, off, n, _ in atoms:
        if t == b"moov":
            continue
        if t == b"mdat" and moov is not None:
            out.append(moov)
            moov = None
        out.append(data[off:off + n])
    open(dst, "wb").write(b"".join(out))
    print(f"{src}: moov moved to front")


if __name__ == "__main__":
    faststart(sys.argv[1], sys.argv[2])
