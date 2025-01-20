@echo off

set "url=%*"
set "output_folder=%CD%\commands\music\songs"
set "YTDLP_PATH=C:\yt-dlp\yt-dlp.exe"

"%YTDLP_PATH%" -x --audio-format opus --output "%output_folder%\%%(id)s.%%(ext)s" "%url%"