import csv
import sys
from collections import defaultdict


def generate_summary(csv_file_path):
    metrics = defaultdict(list)
    checks = defaultdict(lambda: {"passes": 0, "fails": 0})
    vus = []
    vus_max = []
    total_iterations = 0
    iteration_durations = []
    start_times = []
    end_times = []
    data_sent_total = 0
    data_received_total = 0
    total_failed_requests = 0
    total_requests = 0
    http_req_sending_sizes = []
    http_req_receiving_sizes = []

    with open(csv_file_path, mode="r", newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            metric_name = row.get("metric_name")
            timestamp = float(row.get("timestamp", 0))
            metric_value = float(row.get("metric_value", 0))
            check_name = row.get("check")
            status = row.get("status")

            # Collect start and end times
            start_times.append(timestamp)
            end_times.append(timestamp)

            if metric_name == "http_reqs":
                metrics["http_reqs"].append(metric_value)
                total_requests += metric_value
            elif metric_name.startswith("http_req_"):
                metrics[metric_name].append(metric_value)
            elif metric_name == "http_req_failed":
                total_failed_requests += metric_value
            elif metric_name == "checks":
                if metric_value == 1.0:
                    checks[check_name]["passes"] += 1
                else:
                    checks[check_name]["fails"] += 1
            elif metric_name == "iterations":
                total_iterations += metric_value
            elif metric_name == "iteration_duration":
                iteration_durations.append(metric_value)
            elif metric_name == "data_sent":
                data_sent_total += metric_value  # Sum up per-iteration values
            elif metric_name == "data_received":
                data_received_total += metric_value  # Sum up per-iteration values
            elif metric_name == "vus":
                vus.append(metric_value)
            elif metric_name == "vus_max":
                vus_max.append(metric_value)
            # Parse HTTP request body and header sizes
            elif metric_name == "http_req_sending":
                # Assuming 'http_req_sending' represents data sent per request
                http_req_sending_sizes.append(metric_value)
            elif metric_name == "http_req_receiving":
                # Assuming 'http_req_receiving' represents data received per request
                http_req_receiving_sizes.append(metric_value)

    # Sum up data from HTTP requests
    total_http_data_sent = sum(http_req_sending_sizes)
    total_http_data_received = sum(http_req_receiving_sizes)

    # Update total data sent and received to include HTTP request data
    data_sent_total += total_http_data_sent
    data_received_total += total_http_data_received

    # Calculate statistics
    def calc_stats(data):
        if not data:
            return {"avg": 0, "min": 0, "med": 0, "max": 0, "p90": 0, "p95": 0}
        data_sorted = sorted(data)
        n = len(data)
        return {
            "avg": sum(data) / n,
            "min": min(data),
            "med": data_sorted[n // 2],
            "max": max(data),
            "p90": data_sorted[min(int(n * 0.9), n - 1)],
            "p95": data_sorted[min(int(n * 0.95), n - 1)],
        }

    http_req_metrics_order = [
        "http_req_blocked",
        "http_req_connecting",
        "http_req_duration",
        "http_req_failed",
        "http_req_receiving",
        "http_req_sending",
        "http_req_tls_handshaking",
        "http_req_waiting",
    ]
    stats = {}
    for metric in http_req_metrics_order:
        stats[metric] = calc_stats(metrics.get(metric, []))

    # Calculate total time and rates
    total_time = max(end_times) - min(start_times)  # Timestamps are in seconds
    requests_per_second = total_requests / total_time if total_time > 0 else 0
    iterations_per_second = total_iterations / total_time if total_time > 0 else 0
    failed_requests_percentage = (
        (total_failed_requests / total_requests) * 100 if total_requests else 0
    )

    # Calculate total checks and pass rate
    total_checks = sum(c["passes"] + c["fails"] for c in checks.values())
    total_passed_checks = sum(c["passes"] for c in checks.values())
    checks_pass_rate = (total_passed_checks / total_checks) * 100 if total_checks else 0

    # Calculate VU stats
    vus_min = int(min(vus)) if vus else 0
    vus_current = int(vus[-1]) if vus else 0  # Current VUs is the last recorded value
    vus_max_value = int(max(vus_max)) if vus_max else 0

    # Calculate iteration duration stats
    iteration_duration_stats = calc_stats(iteration_durations)

    # Convert data sent/received from bytes to MB
    data_sent_mb = data_sent_total / (1024 * 1024)
    data_received_mb = data_received_total / (1024 * 1024)

    # Calculate data rates (in kB/s)
    data_sent_rate = (data_sent_total / total_time) / 1024 if total_time > 0 else 0
    data_received_rate = (
        (data_received_total / total_time) / 1024 if total_time > 0 else 0
    )

    # Output individual checks with pass rates (before metrics)
    for check_name, results in checks.items():
        passes = results["passes"]
        fails = results["fails"]
        total = passes + fails
        pass_rate = (passes / total) * 100 if total else 0
        status_icon = "✓" if fails == 0 else "✗"
        if fails > 0:
            print(f"     {status_icon} {check_name}")
            print(f"      ↳  {int(pass_rate)}% — ✓ {passes} / ✗ {fails}")
        else:
            print(f"     {status_icon} {check_name}")

    # Output the summary line for checks
    print(
        f"\n     checks.........................: {checks_pass_rate:.2f}% {int(total_passed_checks)} out of {int(total_checks)}"
    )
    print(
        f"     data_received..................: {int(data_received_mb)} MB  {int(data_received_rate)} kB/s"
    )
    print(
        f"     data_sent......................: {int(data_sent_mb)} MB  {int(data_sent_rate)} kB/s"
    )

    # Output metrics in the order matching k6
    print(
        f"     http_req_blocked...............: avg={stats['http_req_blocked']['avg']:.2f}ms min={stats['http_req_blocked']['min']:.2f}ms med={stats['http_req_blocked']['med']:.2f}ms max={stats['http_req_blocked']['max']:.2f}ms p(90)={stats['http_req_blocked']['p90']:.2f}ms p(95)={stats['http_req_blocked']['p95']:.2f}ms"
    )
    print(
        f"     http_req_connecting............: avg={stats['http_req_connecting']['avg']:.2f}ms min={stats['http_req_connecting']['min']:.2f}ms med={stats['http_req_connecting']['med']:.2f}ms max={stats['http_req_connecting']['max']:.2f}ms p(90)={stats['http_req_connecting']['p90']:.2f}ms p(95)={stats['http_req_connecting']['p95']:.2f}ms"
    )
    print(
        f"     http_req_duration..............: avg={stats['http_req_duration']['avg']:.2f}ms min={stats['http_req_duration']['min']:.2f}ms med={stats['http_req_duration']['med']:.2f}ms max={stats['http_req_duration']['max']:.2f}ms p(90)={stats['http_req_duration']['p90']:.2f}ms p(95)={stats['http_req_duration']['p95']:.2f}ms"
    )
    print(
        f"     http_req_failed................: {failed_requests_percentage:.2f}%  {int(total_failed_requests)} out of {int(total_requests)}"
    )
    print(
        f"     http_req_receiving.............: avg={stats['http_req_receiving']['avg']:.2f}ms min={stats['http_req_receiving']['min']:.2f}ms med={stats['http_req_receiving']['med']:.2f}ms max={stats['http_req_receiving']['max']:.2f}ms p(90)={stats['http_req_receiving']['p90']:.2f}ms p(95)={stats['http_req_receiving']['p95']:.2f}ms"
    )
    print(
        f"     http_req_sending...............: avg={stats['http_req_sending']['avg']:.2f}ms min={stats['http_req_sending']['min']:.2f}ms med={stats['http_req_sending']['med']:.2f}ms max={stats['http_req_sending']['max']:.2f}ms p(90)={stats['http_req_sending']['p90']:.2f}ms p(95)={stats['http_req_sending']['p95']:.2f}ms"
    )
    print(
        f"     http_req_tls_handshaking.......: avg={stats['http_req_tls_handshaking']['avg']:.2f}ms min={stats['http_req_tls_handshaking']['min']:.2f}ms med={stats['http_req_tls_handshaking']['med']:.2f}ms max={stats['http_req_tls_handshaking']['max']:.2f}ms p(90)={stats['http_req_tls_handshaking']['p90']:.2f}ms p(95)={stats['http_req_tls_handshaking']['p95']:.2f}ms"
    )
    print(
        f"     http_req_waiting...............: avg={stats['http_req_waiting']['avg']:.2f}ms min={stats['http_req_waiting']['min']:.2f}ms med={stats['http_req_waiting']['med']:.2f}ms max={stats['http_req_waiting']['max']:.2f}ms p(90)={stats['http_req_waiting']['p90']:.2f}ms p(95)={stats['http_req_waiting']['p95']:.2f}ms"
    )
    print(
        f"     http_reqs......................: {int(total_requests)}  {requests_per_second:.6f}/s"
    )
    print(
        f"     iteration_duration.............: avg={iteration_duration_stats['avg']:.2f}ms min={iteration_duration_stats['min']:.2f}ms med={iteration_duration_stats['med']:.2f}ms max={iteration_duration_stats['max']:.2f}ms p(90)={iteration_duration_stats['p90']:.2f}ms p(95)={iteration_duration_stats['p95']:.2f}ms"
    )
    print(
        f"     iterations.....................: {int(total_iterations)}    {iterations_per_second:.6f}/s"
    )
    print(
        f"     vus............................: {vus_current}      min={vus_min}             max={vus_max_value}"
    )
    print(
        f"     vus_max........................: {vus_max_value}    min={vus_max_value}            max={vus_max_value}\n"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python summarize_k6_csv.py <path_to_csv_file>")
        sys.exit(1)

    csv_file_path = sys.argv[1]
    generate_summary(csv_file_path)
