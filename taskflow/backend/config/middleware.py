class SecurityHeadersMiddleware:
    """Add conservative browser hardening headers to HTML and API responses."""

    EXEMPT_PREFIXES = (
        "/admin/",
        "/api/schema/",
        "/api/docs/",
        "/api/redoc/",
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if (
            not request.path.startswith(self.EXEMPT_PREFIXES)
            and not response.has_header("Content-Security-Policy")
        ):
            response["Content-Security-Policy"] = (
                "default-src 'self'; "
                "base-uri 'self'; "
                "frame-ancestors 'none'; "
                "form-action 'self'; "
                "img-src 'self' data:; "
                "font-src 'self' data:; "
                "style-src 'self' 'unsafe-inline'; "
                "script-src 'self'; "
                "connect-src 'self'"
            )

        if not response.has_header("Permissions-Policy"):
            response["Permissions-Policy"] = (
                "camera=(), microphone=(), geolocation=(), payment=()"
            )
        if not response.has_header("X-Permitted-Cross-Domain-Policies"):
            response["X-Permitted-Cross-Domain-Policies"] = "none"
        return response
