#!/bin/bash
set -e

echo "Installing dependencies..."
npm ci
npm ci --prefix backend
npm ci --prefix frontend

echo "Building application..."
npm run build

echo "Starting application..."
npm start

