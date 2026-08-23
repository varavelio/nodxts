#!/bin/bash

# Create the root's .bashrc
cat << 'EOF' >> /root/.bashrc

# Define command aliases
alias ll='ls -alh'
alias task='deno task'
alias t='deno task'
alias c='clear'

# Set the user file-creation mode mask to 000
umask 000

EOF

# Configure file permissions for the /workspaces directory
chmod -R 777 /workspaces

# Configure git
git config --global core.fileMode false || true
