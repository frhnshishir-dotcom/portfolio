@echo off
rem Opens the Nestle France x Japan presentation. Press F for full screen.
rem If Python is installed, the deck is served on http://localhost:8000 so the two
rem advertising videos on slide 11 play inside the slide (YouTube needs a web page,
rem not a file opened from disk). Without Python, index.html opens directly and the
rem videos open on YouTube in a new tab instead. Close this window to stop.
cd /d "%~dp0"
py -3 -c "import http.server" >nul 2>nul && goto :py
python -c "import http.server" >nul 2>nul && goto :python
start "" "%~dp0index.html"
goto :eof
:py
start "" cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:8000/"
py -3 -m http.server 8000 --bind 127.0.0.1
goto :eof
:python
start "" cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:8000/"
python -m http.server 8000 --bind 127.0.0.1
