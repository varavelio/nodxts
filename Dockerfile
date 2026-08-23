##################
# TOOLS (DEBIAN) #
##################

# Use debian trixie as the base image
FROM debian:trixie AS tools

# Install Node
COPY --from=node:26.7.0-slim /usr/local /usr/local

# Install Deno
COPY --from=denoland/deno:bin-2.9.5 /deno /usr/local/bin/deno

# Set environment variables
ENV \
  PIP_BREAK_SYSTEM_PACKAGES=1 \
  DENO_INSTALL_ROOT=/usr/local

# Set build time variables
ARG DEBIAN_FRONTEND=noninteractive

RUN set -e && \
  # Install system dependencies
  apt-get update -qq && \
  apt-get install -yqq --no-install-recommends \
  ca-certificates wget curl zip unzip p7zip-full tzdata git tree ripgrep jq libatomic1 \
  python3 python3-pip && \
  rm -rf /var/lib/apt/lists/* && \
  # Git config
  git config --global --add safe.directory '*'

WORKDIR /workspaces/nodxts

################
# DEVCONTAINER #
################

FROM tools AS devcontainer

CMD ["sleep", "infinity"]
