---
description: Automatically add, commit, and push changes to GitHub
---

This workflow automates the process of saving your work to GitHub.

// turbo
1. Add all local changes to the staging area:
```powershell
git add .
```

2. Commit the changes with an automatic timestamp message:
```powershell
git commit -m "Auto-update: %DATE% %TIME%"
```

3. Push the changes to the main repository:
```powershell
git push origin main
```

> [!IMPORTANT]
> If this is your first time pushing, you may need to sign in when the browser window appears.
