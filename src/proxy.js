export { proxy } from "./dashboardGuard";

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/api/shutdown",
    "/api/settings/:path*",
    "/api/keys",
    "/api/keys/:path*",
    "/api/providers",
    "/api/providers/:path*",
    "/api/provider-nodes",
    "/api/provider-nodes/:path*",
    "/api/combos",
    "/api/combos/:path*",
    "/api/proxy-pools",
    "/api/proxy-pools/:path*",
    "/api/tags",
    "/api/tags/:path*",
    "/api/cli-tools/:path*",
    "/api/cloud/:path*",
    "/api/media-providers/:path*",
    "/api/translator/:path*",
    "/api/tunnel/:path*",
    "/api/usage/:path*",
    "/api/models/:path*",
  ],
};
