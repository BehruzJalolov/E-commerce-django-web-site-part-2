from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse, JsonResponse


def csrf_failure(request, reason=""):
    return JsonResponse(
        {
            "detail": (
                "CSRF verification failed. Refresh the page and try again."
            )
        },
        status=403,
    )


def spa_index(request):
    """Serve the built React application for client-side routes."""
    if request.method not in {"GET", "HEAD"}:
        raise Http404

    index_file: Path = settings.FRONTEND_DIST / "index.html"
    if index_file.exists():
        return FileResponse(index_file.open("rb"), content_type="text/html")

    if settings.DEBUG:
        return HttpResponse(
            """<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>TaskFlow backend</title></head>
  <body style="font-family: system-ui; max-width: 720px; margin: 80px auto; padding: 0 24px; line-height: 1.6;">
    <h1>TaskFlow API is running</h1>
    <p>The production frontend bundle has not been built yet.</p>
    <p>Run <code>npm run dev</code> in <code>frontend/</code> for local development.</p>
    <ul>
      <li><a href="/api/v1/">API index</a></li>
      <li><a href="/api/docs/">OpenAPI documentation</a></li>
      <li><a href="/admin/">Django admin</a></li>
    </ul>
  </body>
</html>""",
            content_type="text/html",
        )

    return HttpResponse(
        "TaskFlow frontend is not built. Run `npm run build` in frontend/ "
        "and collect static files.",
        status=503,
        content_type="text/plain",
    )
