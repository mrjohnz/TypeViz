del ../../Release/TypeViz.js
dir *.ts /b /s > ts-files.txt
tsc --out ../../Release/TypeViz.js --target "ES5" @ts-files.txt
del ts-files.txt
