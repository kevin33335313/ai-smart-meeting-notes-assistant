@echo off
echo 正在創建專案備份...

set backup_dir=D:\AI_Tools_Backup_%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set backup_dir=%backup_dir: =0%

mkdir "%backup_dir%"

echo 複製前端文件...
xcopy "frontend\*" "%backup_dir%\frontend\" /E /I /H /Y

echo 複製後端文件...  
xcopy "backend\*" "%backup_dir%\backend\" /E /I /H /Y

echo 複製配置文件...
copy "*.md" "%backup_dir%\" 2>nul
copy "*.json" "%backup_dir%\" 2>nul

echo 備份完成！備份位置: %backup_dir%
pause