#!/usr/bin/env bash
set -e
export PATH=/home/accioly/.local/share/mise/installs/node/24.14.1/bin:/usr/bin:/bin:$PATH
mkdir -p /home/accioly/workspace/QALearning/prototypes/screenshots

echo "1/6 Capturing Option A Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-a&mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/option-a-light.png

echo "2/6 Capturing Option A Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-a&mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/option-a-dark.png

echo "3/6 Capturing Option B Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-b&mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/option-b-light.png

echo "4/6 Capturing Option B Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-b&mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/option-b-dark.png

echo "5/6 Capturing Option C Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-c&mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/option-c-light.png

echo "6/6 Capturing Option C Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-c&mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/option-c-dark.png

echo "All captures finished!"
ls -lh /home/accioly/workspace/QALearning/prototypes/screenshots/
