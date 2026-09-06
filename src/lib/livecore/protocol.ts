/**
 * Bilibili live danmaku binary protocol.
 *
 * Packet header (16 bytes, big-endian):
 *   0  u32 packet length
 *   4  u16 header length (16)
 *   6  u16 protocol version (0 raw / 1 heartbeat / 2 zlib / 3 brotli)
 *   8  u32 operation
 *  12  u32 sequence
 */

export const HEADER_SIZE = 16;

export const OP = {
  HEARTBEAT: 2,
  HEARTBEAT_REPLY: 3,
  NOTIFY: 5,
  AUTH: 7,
  AUTH_REPLY: 8,
} as const;

export const PROTO = {
  RAW: 0,
  INT: 1,
  ZLIB: 2,
  BROTLI: 3,
} as const;

export interface Packet {
  op: number;
  protover: number;
  body: Uint8Array;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodePacket(op: number, body: Uint8Array, protover: number = PROTO.INT): ArrayBuffer {
  const buf = new ArrayBuffer(HEADER_SIZE + body.byteLength);
  const view = new DataView(buf);
  view.setUint32(0, HEADER_SIZE + body.byteLength);
  view.setUint16(4, HEADER_SIZE);
  view.setUint16(6, protover);
  view.setUint32(8, op);
  view.setUint32(12, 1);
  new Uint8Array(buf, HEADER_SIZE).set(body);
  return buf;
}

export function encodeJson(op: number, payload: unknown): ArrayBuffer {
  return encodePacket(op, encoder.encode(JSON.stringify(payload)), PROTO.RAW);
}

export function encodeAuth(roomId: number, token: string, uid = 0): ArrayBuffer {
  return encodeJson(OP.AUTH, {
    uid,
    roomid: roomId,
    protover: PROTO.ZLIB,
    platform: "web",
    type: 2,
    key: token,
  });
}

export function encodeHeartbeat(): ArrayBuffer {
  return encodePacket(OP.HEARTBEAT, encoder.encode("[object Object]"));
}

export function decodePackets(buf: ArrayBuffer | Uint8Array): Packet[] {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const packets: Packet[] = [];
  let offset = 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  while (offset + HEADER_SIZE <= bytes.byteLength) {
    const packetLen = view.getUint32(offset);
    if (packetLen < HEADER_SIZE || offset + packetLen > bytes.byteLength) break;
    const headerLen = view.getUint16(offset + 4);
    const protover = view.getUint16(offset + 6);
    const op = view.getUint32(offset + 8);
    const bodyStart = offset + headerLen;
    const body = bytes.subarray(bodyStart, offset + packetLen);
    packets.push({ op, protover, body });
    offset += packetLen;
  }
  return packets;
}

export async function inflate(body: Uint8Array, format: CompressionFormat): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DecompressionStream is not available");
  }
  const stream = new Blob([body as BlobPart]).stream().pipeThrough(new DecompressionStream(format));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

export async function expandPackets(raw: ArrayBuffer | Uint8Array): Promise<Packet[]> {
  const top = decodePackets(raw);
  const out: Packet[] = [];
  for (const pkt of top) {
    if (pkt.protover === PROTO.ZLIB && pkt.body.byteLength > 0) {
      try {
        const inflated = await inflate(pkt.body, "deflate");
        out.push(...(await expandPackets(inflated)));
      } catch {
        out.push(pkt);
      }
    } else if (pkt.protover === PROTO.BROTLI && pkt.body.byteLength > 0) {
      try {
        const inflated = await inflate(pkt.body, "deflate");
        out.push(...(await expandPackets(inflated)));
      } catch {
        out.push(pkt);
      }
    } else {
      out.push(pkt);
    }
  }
  return out;
}

export function readText(body: Uint8Array): string {
  return decoder.decode(body);
}

export function readPopularity(body: Uint8Array): number {
  if (body.byteLength < 4) return 0;
  return new DataView(body.buffer, body.byteOffset, body.byteLength).getUint32(0);
}

export function parseJsonBody(body: Uint8Array): unknown {
  const text = readText(body).trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
