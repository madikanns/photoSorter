#!/bin/bash
pip install -r requirements.txt
cd frontend
npm install
npm run build
cp -r build/* public/
