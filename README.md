# Celestron Wifi Password Manager

Author: Ryan Chase
Distributed by: Celestron Inc

### Code Signing Instructions
0. run `npm run make` on Windows
1. open Visual Studio in administrator mode
2. open Tools > Command Line > Developer Command Prompt
3. navigate to this repo, then to the location of the executable, e.g. out > make > squirrel.windows > x64 > "Celestron Wifi Password Manager-1.0.0 Setup.exe" 
```
signtool sign /v /n "Celestron" /fd SHA256 /tr http://timestamp.globalsign.com/tsa/r6advanced1 /td SHA256 "Celestron Wifi Password Manager-1.0.0 Setup.exe"
```

Wait until you see this output:

```
Successfully signed: Celestron Wifi Password Manager-1.0.0 Setup.exe

Number of files successfully Signed: 1
Number of warnings: 0
Number of errors: 0
```