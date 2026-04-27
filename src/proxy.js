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
  ],
};
