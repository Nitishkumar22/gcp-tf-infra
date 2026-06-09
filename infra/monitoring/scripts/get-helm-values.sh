#!/bin/bash

# ============================================
# TEMPLATE: Fetch Helm Chart Default Values
# ============================================
# Instructions: Change the values below and run the script

# CHART CONFIGURATION - CHANGE THESE VALUES
CHART_NAME="promtail"
REPO_URL="https://grafana.github.io/helm-charts"
VERSION="6.16.6"
OUTPUT_FILE="../charts/promtail/value.yaml"

# ============================================
# Script execution (no need to change below)
# ============================================

echo "Fetching: $CHART_NAME (version: $VERSION)"

# Create directory if needed
mkdir -p $(dirname "$OUTPUT_FILE")

# Fetch and save values
helm show values $CHART_NAME --repo $REPO_URL --version $VERSION > "$OUTPUT_FILE"

echo "✓ Saved to: $OUTPUT_FILE"
echo "✓ Lines: $(wc -l < $OUTPUT_FILE)"
