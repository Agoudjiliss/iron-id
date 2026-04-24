"""Internal HTTP transport for the IronID Python SDK."""

from __future__ import annotations

import httpx

from .exceptions import IronIDAuthError, IronIDError, IronIDRateLimitError, IronIDTimeoutError


def _raise_for_response(res: httpx.Response) -> None:
    if res.is_success:
        return

    try:
        body = res.json()
        message = body.get("error", f"Request failed with status {res.status_code}")
        code    = body.get("code",  "UNKNOWN")
    except Exception:
        message = f"Request failed with status {res.status_code}"
        code    = "UNKNOWN"

    if res.status_code == 401:
        raise IronIDAuthError(message)
    if res.status_code == 429:
        raise IronIDRateLimitError(message)
    raise IronIDError(message, code=code, status=res.status_code)


class HttpClient:
    def __init__(self, api_key: str, base_url: str, timeout: float) -> None:
        self._client = httpx.Client(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}", "Accept": "application/json"},
            timeout=timeout,
        )

    def get(self, path: str) -> dict:
        try:
            res = self._client.get(path)
        except httpx.TimeoutException as exc:
            raise IronIDTimeoutError() from exc
        _raise_for_response(res)
        return res.json()

    def post(self, path: str, *, json: dict | None = None, files: dict | None = None, data: dict | None = None) -> dict:
        try:
            res = self._client.post(path, json=json, files=files, data=data)
        except httpx.TimeoutException as exc:
            raise IronIDTimeoutError() from exc
        _raise_for_response(res)
        if res.status_code == 204:
            return {}
        return res.json()

    def delete(self, path: str) -> None:
        try:
            res = self._client.delete(path)
        except httpx.TimeoutException as exc:
            raise IronIDTimeoutError() from exc
        _raise_for_response(res)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "HttpClient":
        return self

    def __exit__(self, *_: object) -> None:
        self.close()
