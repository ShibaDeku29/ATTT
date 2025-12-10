#!/bin/bash
set -e

echo "Installing dependencies..."
npm install
npm install --prefix backend
npm install --prefix frontend

echo "Building application..."
npm run build

echo "Starting application..."
npm start

