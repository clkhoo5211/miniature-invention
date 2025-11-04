const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'miniature-invention';
const assetPrefix = `/${repo}/`;
const basePath = `/${repo}`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: assetPrefix,
  basePath: basePath,
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // For static export to IPFS
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // generate /route/index.html so /route works
  // Enable ES modules
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    // For client-side builds, configure @dfinity packages to work in browser
    if (!isServer) {
      // Don't polyfill Node.js built-ins in browser - let browser handle them
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        // crypto is available in browser via Web Crypto API
        crypto: false,
        // child_process doesn't exist in browser
        child_process: false,
        // process is polyfilled by Next.js, but we can be explicit
        process: false,
      };
      
      // Ensure @dfinity packages are properly resolved
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Ignore warnings about missing optional dependencies
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Can't resolve .* in .*node_modules\/@dfinity/,
      ];
      
      // Add bundle analyzer in production when ANALYZE=true
      if (process.env.ANALYZE === 'true') {
        // Bundle analyzer will be injected below in the exported wrapper
      }
    }
    return config;
  },
};
// Import BundleAnalyzerPlugin at top-level (ESM) and conditionally apply in webpack
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// Wrap export to inject plugin based on ANALYZE flag without using require()
const configExport = {
  ...nextConfig,
  webpack: (config, ctx) => {
    const updated = nextConfig.webpack(config, ctx);
    if (!ctx.isServer && process.env.ANALYZE === 'true') {
      updated.plugins = updated.plugins || [];
      updated.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
    }
    return updated;
  },
};
export default configExport;
