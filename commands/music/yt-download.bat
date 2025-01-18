@echo off

set "url=%*"
set "output_folder=%CD%\songs"
set "YTDLP_PATH=C:\yt-dlp\yt-dlp.exe"
echo "%url%"
"%YTDLP_PATH%" -x --audio-format opus --output "%output_folder%\%%(title)s.%%(ext)s" "%url%"
