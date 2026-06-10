import requests

# Check Grafana API endpoints - these are unauthenticated in misconfigured instances
grafana_paths = [
    "/grafana/api/health",
    "/grafana/api/org",
    "/grafana/api/users",
    "/grafana/api/dashboards/home",
    "/grafana/api/search",
    "/grafana/api/datasources",
    "/grafana/api/admin/settings",
    "/grafana/api/admin/stats",
    "/grafana/api/frontend/settings",
    "/grafana/api/annotations",
    "/grafana/api/alerts",
    "/grafana/login",
]

for path in grafana_paths:
    try:
        r = requests.get(f"https://monitor.superearn.io{path}", timeout=10)
        if r.status_code != 404:
            print(f"{path}: {r.status_code} - {r.text[:300]}")
    except Exception as e:
        print(f"{path}: ERROR - {e}")