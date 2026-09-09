#!/usr/bin/env bash
export PATH=/home/accioly/.local/share/mise/installs/node/24.14.1/bin:/usr/bin:/bin:$PATH
mkdir -p /home/accioly/workspace/QALearning/prototypes/screenshots

echo "Capturing Option C Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-c&mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/option-c-dark.png

echo "Capturing Option C Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-c&mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/option-c-light.png

echo "Capturing Option A Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-a&mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/option-a-dark.png

echo "Capturing Option A Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/design-system-showcase.html?theme=option-a&mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/option-a-light.png

echo "Recapture finished!"
