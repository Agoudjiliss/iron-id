#!/usr/bin/env python3
"""
IronID Enterprise Benchmark Tool
=================================
Measures the end-to-end latency and throughput of the IronID certification API.

Usage:
  python benchmark.py --api-key iid_live_xxxx --n 50 --workers 5

Outputs:
  - Per-request latency (ms)
  - P50 / P95 / P99 latency
  - Throughput (requests/sec)
  - Success / failure count
  - A JSON report file for sharing with the client

Requirements:
  pip install httpx rich

Author: IronID
"""

import argparse
import asyncio
import io
import json
import os
import statistics
import sys
import time
import uuid
from pathlib import Path
from typing import NamedTuple

try:
    import httpx
except ImportError:
    sys.exit("Missing dependency: pip install httpx")

try:
    from rich.console import Console
    from rich.table import Table
    from rich import print as rprint
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

# ─── Config ──────────────────────────────────────────────────────────────────

DEFAULT_API_URL = os.environ.get("IRONID_API_URL", "https://api.iron-id.io")
DEFAULT_N = 20
DEFAULT_WORKERS = 4

# Tiny synthetic PNG (1×1 pixel) used as test file — no real file needed
_SYNTHETIC_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00"
    b"\x00\x01\x01\x00\x05\x18\xd8N\x00\x00\x00\x00IEND\xaeB`\x82"
)


# ─── Types ───────────────────────────────────────────────────────────────────

class RequestResult(NamedTuple):
    index: int
    latency_ms: float
    status_code: int
    cert_id: str | None
    error: str | None


# ─── Core benchmark logic ─────────────────────────────────────────────────────

async def _certify_once(
    client: httpx.AsyncClient,
    api_url: str,
    api_key: str,
    index: int,
    semaphore: asyncio.Semaphore,
) -> RequestResult:
    async with semaphore:
        start = time.perf_counter()
        try:
            resp = await client.post(
                f"{api_url}/v1/certify",
                headers={"Authorization": f"Bearer {api_key}"},
                files={"file": ("benchmark_test.png", io.BytesIO(_SYNTHETIC_PNG), "image/png")},
                data={
                    "metadata": json.dumps({
                        "benchmark": True,
                        "run_id": str(uuid.uuid4()),
                        "index": index,
                    })
                },
                timeout=30.0,
            )
            latency_ms = (time.perf_counter() - start) * 1000
            body = resp.json()
            return RequestResult(
                index=index,
                latency_ms=latency_ms,
                status_code=resp.status_code,
                cert_id=body.get("id") if resp.is_success else None,
                error=None if resp.is_success else body.get("detail", str(body)),
            )
        except Exception as exc:
            latency_ms = (time.perf_counter() - start) * 1000
            return RequestResult(
                index=index,
                latency_ms=latency_ms,
                status_code=0,
                cert_id=None,
                error=str(exc),
            )


async def run_benchmark(
    api_url: str,
    api_key: str,
    n: int,
    workers: int,
    verbose: bool,
) -> dict:
    semaphore = asyncio.Semaphore(workers)
    console = Console() if HAS_RICH else None

    if console:
        console.rule("[bold gold1]IronID Enterprise Benchmark[/bold gold1]")
        console.print(f"  API URL  : {api_url}")
        console.print(f"  Requests : {n}")
        console.print(f"  Workers  : {workers}")
        console.print()
    else:
        print(f"IronID Benchmark — {n} requests, {workers} concurrent workers")
        print(f"API: {api_url}\n")

    overall_start = time.perf_counter()

    async with httpx.AsyncClient() as client:
        tasks = [
            _certify_once(client, api_url, api_key, i, semaphore)
            for i in range(n)
        ]
        results: list[RequestResult] = await asyncio.gather(*tasks)

    total_elapsed = time.perf_counter() - overall_start

    # ─── Compute stats ────────────────────────────────────────────────────────
    successes = [r for r in results if r.status_code == 202]
    failures  = [r for r in results if r.status_code != 202]
    latencies = [r.latency_ms for r in successes]

    def percentile(data: list[float], pct: float) -> float:
        if not data:
            return 0.0
        sorted_data = sorted(data)
        k = (len(sorted_data) - 1) * pct / 100
        lo, hi = int(k), min(int(k) + 1, len(sorted_data) - 1)
        return sorted_data[lo] + (sorted_data[hi] - sorted_data[lo]) * (k - lo)

    stats = {
        "total_requests": n,
        "success": len(successes),
        "failure": len(failures),
        "throughput_rps": round(len(successes) / total_elapsed, 2),
        "total_elapsed_s": round(total_elapsed, 3),
        "latency_ms": {
            "min":  round(min(latencies), 1) if latencies else None,
            "max":  round(max(latencies), 1) if latencies else None,
            "mean": round(statistics.mean(latencies), 1) if latencies else None,
            "p50":  round(percentile(latencies, 50), 1) if latencies else None,
            "p95":  round(percentile(latencies, 95), 1) if latencies else None,
            "p99":  round(percentile(latencies, 99), 1) if latencies else None,
        },
    }

    # ─── Display ──────────────────────────────────────────────────────────────
    if console:
        table = Table(title="Results", show_header=True, header_style="bold cyan")
        table.add_column("Metric", style="dim")
        table.add_column("Value", justify="right")

        lms = stats["latency_ms"]
        table.add_row("Requests",           str(n))
        table.add_row("Success",            f"[green]{len(successes)}[/green]")
        table.add_row("Failure",            f"[red]{len(failures)}[/red]" if failures else "0")
        table.add_row("Throughput",         f"{stats['throughput_rps']} req/s")
        table.add_row("Total time",         f"{stats['total_elapsed_s']} s")
        table.add_row("Latency min",        f"{lms['min']} ms")
        table.add_row("Latency mean",       f"{lms['mean']} ms")
        table.add_row("[bold]P50[/bold]",   f"[bold]{lms['p50']} ms[/bold]")
        table.add_row("[bold]P95[/bold]",   f"[bold yellow]{lms['p95']} ms[/bold yellow]")
        table.add_row("[bold]P99[/bold]",   f"[bold red]{lms['p99']} ms[/bold red]")
        table.add_row("Latency max",        f"{lms['max']} ms")

        console.print(table)

        if failures and verbose:
            console.print("\n[bold red]Failures:[/bold red]")
            for r in failures[:10]:
                console.print(f"  #{r.index}  HTTP {r.status_code}  {r.error}")
    else:
        lms = stats["latency_ms"]
        print(f"Success:      {len(successes)} / {n}")
        print(f"Failures:     {len(failures)}")
        print(f"Throughput:   {stats['throughput_rps']} req/s")
        print(f"Total time:   {stats['total_elapsed_s']} s")
        print(f"Latency P50:  {lms['p50']} ms")
        print(f"Latency P95:  {lms['p95']} ms")
        print(f"Latency P99:  {lms['p99']} ms")
        if failures and verbose:
            for r in failures[:10]:
                print(f"  FAIL #{r.index}  HTTP {r.status_code}  {r.error}")

    return stats


# ─── Report export ────────────────────────────────────────────────────────────

def save_report(stats: dict, output: str) -> None:
    import datetime
    report = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "provider": "IronID — C2PA Certification API",
        **stats,
    }
    path = Path(output)
    path.write_text(json.dumps(report, indent=2))
    print(f"\nReport saved → {path.resolve()}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="IronID Enterprise Benchmark — measure certification API performance.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--api-key",
        required=True,
        help="IronID API key (iid_live_xxxx or iid_test_xxxx)",
    )
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        help="IronID API base URL",
    )
    parser.add_argument(
        "--n",
        type=int,
        default=DEFAULT_N,
        help="Number of certification requests to send",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_WORKERS,
        help="Number of concurrent requests",
    )
    parser.add_argument(
        "--output",
        default="ironid_benchmark_report.json",
        help="Path to save JSON report",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print individual request failures",
    )

    args = parser.parse_args()

    if not (args.api_key.startswith("iid_live_") or args.api_key.startswith("iid_test_")):
        sys.exit("Invalid API key format. Expected: iid_live_xxxx or iid_test_xxxx")

    stats = asyncio.run(
        run_benchmark(
            api_url=args.api_url,
            api_key=args.api_key,
            n=args.n,
            workers=args.workers,
            verbose=args.verbose,
        )
    )
    save_report(stats, args.output)


if __name__ == "__main__":
    main()
