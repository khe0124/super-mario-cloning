# 001 Backgrounds & Tiles
## 1) 기본환경 설정
1. 폴더생성
2. 터미널켜서 폴더로 경로이동
3. npm init 실행

```
user@user-PC MINGW64 ~/super-mario
$ npm init
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (super-mario)
version: (1.0.0)
description:
entry point: (index.js)
test command:
git repository:
keywords:
author:
license: (ISC)
About to write to C:\Users\khe\super-mario\package.json:

{
  "name": "super-mario",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}


Is this OK? (yes)

```
### npm 권한문제 생겼을 때
- cmd 관리자 권한 실행
- <code>npm config edit</code>를 입력하면 메모장 뜸 -> 아무것도 하지 않고 종료
- 관리자 권한이 없는 cmd 실행 -> <code>npm -v</code>명령어 실행
이렇게 하면 권한 문제가 해결된다.

<br>

4. 생성된 json파일 에디터로 열기
5. public 폴더 만들어서 html 파일 만들기


## 2) 서버 설치
1. <code>npm install serve --save</code>로 설치
2. package.json 파일에서
```
{
  "name": "super-mario",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "serve ./public", //이부분 추가
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "serve": "^11.1.0"
  }
}
```
이렇게 <code>"scripts"</code>안에 <code>"start": "serve ./public",</code> 이부분을 추가해주고 다시 터미널
```
$ npm run start

> super-mario@1.0.0 start C:\Users\khe\super-mario
> serve ./public

INFO: Accepting connections at http://localhost:5000
```
localhost:5000에서 서버가 시작되었다.




