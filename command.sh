# Use the actual commit hash from your log output
git revert --no-commit c2aec81fdcc6f23675f228bffe67d92d409ffe..HEAD
git commit -m "Revert all changes made after 7AM today"
