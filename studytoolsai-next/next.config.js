/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Your webpack config here if needed
    return config
  }
};

module.exports = nextConfig; 