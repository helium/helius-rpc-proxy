# RPC Proxy for Helius

The RPC Proxy is handled by a Cloudflare Worker.

Within Cloudflare, the `rpc-proxy-staging` worker denotes the worker corresponding to the Solana Devnet environment. Deployments to the staging RPC Proxy occur directly via GitHub Actions when PRs are merged to Main and on successful completion of the test suite.

Similarly, the `rpc-proxy` worker denotes the worker corresponding to the Solana Mainnet environment. Deployments to the production RPC Proxy occur manually via the GitHub Actions control plane and can only be performed by those with requisite permissions and only after successful completion of the test suite.