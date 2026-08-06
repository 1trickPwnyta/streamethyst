mkdir "D:\Program Files\streamethyst" -ErrorAction SilentlyContinue
Copy-Item .\* "D:\Program Files\streamethyst\" -Recurse -Force -Exclude ".git", "deploy*", "*.x", "test.bat"
Copy-Item ..\streamethyst-plugins\* "D:\Program Files\streamethyst\" -Recurse -Force -Exclude ".git", "README.md", "deploy*"
