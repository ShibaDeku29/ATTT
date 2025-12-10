#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci --include=dev
npm ci --prefix backend --include=dev
npm ci --prefix frontend --include=dev

echo "Building application..."
npm run build

echo "Starting application..."
npm start

