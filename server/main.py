from __future__ import annotations

import asyncio
import json
import os
from dataclasses import asdict
from typing import Any

from aiohttp import web
from livecore import MultiRoomSupervisor
from livecore.logger import RingLogger
from livecore.monitor import monitor_event
from livecore.types import LiveEvent

HOST = os.getenv("LIVECORE_API_HOST", "127.0.0.1")
PORT = int(os.getenv("LIVECORE_API_PORT", "8787"))

log = RingLogger()
supervisor = MultiRoomSupervisor(log)
subscribers: dict[int, set[web.WebSocketResponse]] = {}


def health_dict(item: Any) -> dict[str, Any]:
    data = asdict(item)
    data["live_for_sec"] = item.live_for_sec
    return data


def event_dict(event: LiveEvent) -> dict[str, Any]:
    data = asdict(event)
    # ``monitor`` is the stable UI/log projection. ``meta`` remains available
    # for advanced consumers that need protocol-specific fields.
    data["monitor"] = monitor_event(event)
    return data


def json_response(payload: Any, status: int = 200) -> web.Response:
    return web.json_response(payload, status=status, headers={"Access-Control-Allow-Origin": "*"})


async def broadcast(room_id: int, payload: dict[str, Any]) -> None:
    sockets = subscribers.get(room_id, set()).copy()
    if not sockets:
        return
    message = json.dumps(payload, ensure_ascii=False)
    stale: set[web.WebSocketResponse] = set()
    for ws in sockets:
        if ws.closed:
            stale.add(ws)
            continue
        try:
            await ws.send_str(message)
        except (ConnectionResetError, RuntimeError):
            stale.add(ws)
    subscribers.get(room_id, set()).difference_update(stale)


def attach_observers(room_id: int) -> None:
    room = supervisor.rooms[room_id]

    async def on_event(event: LiveEvent) -> None:
        await broadcast(room_id, {"type": "event", "event": event_dict(event)})

    async def on_state(state: str) -> None:
        await broadcast(
            room_id,
            {
                "type": "state",
                "roomId": room_id,
                "state": state,
                "health": health_dict(room.snapshot()),
            },
        )

    room.on_event(on_event)
    room.on_state(on_state)


async def list_rooms(_: web.Request) -> web.Response:
    return json_response({"rooms": [health_dict(item) for item in supervisor.health()]})


async def room_health(request: web.Request) -> web.Response:
    room_id = int(request.match_info["room_id"])
    room = supervisor.rooms.get(room_id)
    if room is None:
        return json_response({"error": "room not found"}, 404)
    return json_response(health_dict(room.snapshot()))


async def start_room(request: web.Request) -> web.Response:
    room_id = int(request.match_info["room_id"])
    try:
        body = await request.json()
    except Exception:
        body = {}
    require_token = bool(body.get("require_token", False)) if isinstance(body, dict) else False
    try:
        room = await supervisor.add(room_id, http_config=None if not require_token else _required_token_config())
        if room_id not in subscribers:
            subscribers[room_id] = set()
            attach_observers(room_id)
        return json_response(health_dict(room.snapshot()), 200)
    except Exception as exc:
        return json_response({"error": str(exc)}, 502)


def _required_token_config():
    from livecore.bili_http import HttpConfig
    return HttpConfig(require_token=True)


async def stop_room(request: web.Request) -> web.Response:
    room_id = int(request.match_info["room_id"])
    await supervisor.remove(room_id)
    for ws in subscribers.pop(room_id, set()):
        await ws.close()
    return json_response({"ok": True})


async def room_events(request: web.Request) -> web.StreamResponse:
    room_id = int(request.match_info["room_id"])
    if room_id not in supervisor.rooms:
        return json_response({"error": "room not found; start the room first"}, 404)
    ws = web.WebSocketResponse(heartbeat=30)
    await ws.prepare(request)
    subscribers.setdefault(room_id, set()).add(ws)
    try:
        await ws.send_str(
            json.dumps(
                {
                    "type": "state",
                    "roomId": room_id,
                    "state": supervisor.rooms[room_id].snapshot().state,
                    "health": health_dict(supervisor.rooms[room_id].snapshot()),
                },
                ensure_ascii=False,
            )
        )
        async for _ in ws:
            pass
    finally:
        subscribers.get(room_id, set()).discard(ws)
    return ws


async def health(_: web.Request) -> web.Response:
    return json_response({"ok": True, "sdk": "livecore-bilibili", "rooms": len(supervisor.rooms)})


async def on_shutdown(_: web.Application) -> None:
    await supervisor.stop()
    for sockets in subscribers.values():
        for ws in sockets:
            if not ws.closed:
                await ws.close()
    subscribers.clear()


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/api/health", health)
    app.router.add_get("/api/rooms", list_rooms)
    app.router.add_get("/api/rooms/{room_id}/health", room_health)
    app.router.add_post("/api/rooms/{room_id}/start", start_room)
    app.router.add_delete("/api/rooms/{room_id}", stop_room)
    app.router.add_get("/api/rooms/{room_id}/events", room_events)
    app.on_shutdown.append(on_shutdown)
    return app


if __name__ == "__main__":
    web.run_app(create_app(), host=HOST, port=PORT)
