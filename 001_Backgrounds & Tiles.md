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
#### * npm 권한문제 생겼을 때 *
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
```JSON
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

<br>

## 2) 백그라운드 그리기
게임의 배경을 만들어줄 것이다. 스트라이프 이미지를 반복문을 이용해 배경을 깔아줄 것이다. 이번 차시에 실습한 파일의 디렉토리 구조는 아래와 같다.<br>
*public 폴더
```
│  index.html
│  tree.txt
│  
├─img
│      tile.png
│      
├─js
│      loaders.js
│      main.js
│      SpriteSheet.js
│      
└─levels
        1-1.json
```

- <code>tile.png</code>: 스트라이프 이미지
- <code>main.js</code>: 메인 JS, 다른 JS들을 불러온다.
- <code>loaders.js</code>: 이미지와 JSON을 로딩하는 JS
- <code>SpriteSheet.js</code>: 좌표와 반복횟수, 크기 등을 받아와 그려주는 JS
- <code>1-1.js</code>: 하늘과 땅 이미지의 좌표와 반복횟수를 담은 JSON 파일

<br>

### 1. main.js
```javascript
import SpriteSheet from './SpriteSheet.js';
import {loadImage, loadLevel} from './loaders.js';

function drawBackground(background, context, sprites){
    background.ranges.forEach(([x1, x2, y1, y2]) =>{
        for(let x = x1; x < x2; ++x){
            for(let y = y1; y < y2; ++y){
                sprites.drawTile(background.tile, context, x, y); 
            }
        }
    });
}

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d')

loadImage('/img/tile.png') //타일 이미지 불러오기
.then(image => {
    const sprites = new SpriteSheet(image, 16, 16);
    sprites.define('ground', 0, 0);
    sprites.define('sky', 3, 23);
    
    loadLevel('1-1')
    .then(level => {
        level.backgrounds.forEach(background => {
            drawBackground(background, context, sprites);
        });        
    });  
       
});
```
main.js이다.

### 2. loaders.js
```javascript
export function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=> {
            resolve(image);
        });
        image.src = url;
    });
}

export function loadLevel(name) {
    return fetch(`/levels/${name}.json`)
    .then(r => r.json());
}
```

### 3. loaders.js
```javascript
export default class SpriteSheet {
    constructor(image, width, height){
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    define(name, x, y){
        const buffer = document.createElement('canvas');
        buffer.width = this.width;
        buffer.height = this.height;
        buffer
            .getContext('2d')
            .drawImage(
                this.image,
                x * this.width,
                y * this.height,
                this.width,
                this.height,
                0,
                0,
                this.width,
                this.height
                );
        this.tiles.set(name, buffer);
    }

    draw(name, context, x, y){
        const buffer = this.tiles.get(name);
        context.drawImage(buffer, x, y);
    }

    drawTile(name, context, x, y) {
        this.draw(name, context, x*this.width, y*this.height)
    }
}
```

### 4. 1-1.JSON
```JSON
{
    "backgrounds" : [
        {
            "tile": "sky",
            "ranges": [
                [
                    0, 25,
                    0, 14
                ]
            ]
        },

        {
            "tile": "ground",
            "ranges": [
                [
                    0, 25,
                    12, 14
                ]
            ]
        }
        
    ]
}
```

### 5. index.html
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Super Mario</title>
    <script type = "module" src="/js/main.js"></script>
</head>
<body>
    <canvas id ="screen" width="640" height="640"></canvas>
</body>
</html>

```







