#!/usr/bin/env bash
export PATH="/home/accioly/.local/share/mise/installs/node/24.14.1/bin:/usr/bin:/bin:$PATH"
echo "Capturing Investigation Desk Dark..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/investigation-desk.html?mode=dark" /home/accioly/workspace/QALearning/prototypes/screenshots/investigation-desk-dark.png

echo "Capturing Investigation Desk Light..."
npx -y playwright screenshot --viewport-size=1280,900 --full-page "http://localhost:8085/investigation-desk.html?mode=light" /home/accioly/workspace/QALearning/prototypes/screenshots/investigation-desk-light.png

echo "Done!"
ls -lh /home/accioly/workspace/QALearning/prototypes/screenshots/investigation-desk-*.png
