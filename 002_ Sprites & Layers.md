# 002 Sprites & Layers
meth meth method라는 유튜브 채널의 javascript강좌를 토대로 작업한 것입니다.
개인 공부용 기록입니다.

- 링크 : https://www.youtube.com/watch?v=FF93S8rLL_Q&list=PLS8HfBXv9ZWWe8zXrViYbIM2Hhylx8DZx&index=2


## 1) 새로 추가된 디렉토리 점검
지난 회차에 이어서 작업한 내용이다. 새로 추가된 파일들을 점검하겠다.

*public 폴더
```
C:.
│  index.html
│  
├─img
│      characters.gif <--new
│      tile.png
│      
├─js
│      Compositor.js <--new
│      layers.js <--new
│      loaders.js
│      main.js
│      sprites.js <--new
│      SpriteSheet.js
│      
└─levels
        1-1.json
```
- <code>layers.js</code>: sprite 이미지 레이어, canvas 레이어가 있는 js
- <code>Compositor.js</code>: Compositor 클래스
- <code>sprite.js</code>: sprite이미지, 배경와 캐릭터 이미지를 불러오는 js

<br>

## 2) 캐릭터 스프라이트 가져오기 & JS파일 나누기
마리오 스프라이트 이미지를 가져와서 배경과 캐릭터 레이어를 나눈다.

<br>

### 1. main.js
```javascript
import Compositor from './Compositor.js';
import {loadLevel} from './loaders.js';
import {loadBackgroundSprites, loadMarioSprite} from './sprites.js';
import {createBackgroundLayer} from './layers.js';

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

function createSpriteLayer(sprite, pos) {
    return function drawSpriteLayer(context){
        for (let i = 0; i<20; ++i ){
            sprite.draw('idle', context, pos.x + i * 16, pos.y);
        }        
    };
}

Promise.all([
    loadMarioSprite(),
    loadBackgroundSprites(),
    loadLevel('1-1'),
])
.then(([marioSprite, BackgroundSprites,level]) => {
    const comp = new Compositor();
    
    const backgroundLayer = createBackgroundLayer(level.backgrounds, BackgroundSprites);
    comp.layers.push(backgroundLayer);

    const pos = {
        x: 0,
        y: 0,
    };
    const spriteLayer = createSpriteLayer(marioSprite, pos);
    comp.layers.push(spriteLayer);


    function update(){
        comp.draw(context);     
        pos.x += 2;
        pos.y += 2;
        requestAnimationFrame(update);
    }
    update();
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

### 3. sprites.js
```javascript
import {loadImage} from './loaders.js';
import SpriteSheet from './SpriteSheet.js';

export function loadMarioSprite(){
    return loadImage('/img/characters.gif') // 이미지 불러오기
    .then(image => {        
        const sprites = new SpriteSheet(image, 16, 16);
        sprites.define('idle', 276, 44, 16, 16);
        return sprites;
    });
}

export function loadBackgroundSprites(){
    return loadImage('/img/tile.png') //타일 이미지 불러오기
    .then(image => {        
        const sprites = new SpriteSheet(image, 16, 16);
        sprites.defineTile('ground', 0, 0);
        sprites.defineTile('sky', 3, 23);
        return sprites;
    });
}
```

### 4. SpriteSheet.js
```javascript
export default class SpriteSheet {
    constructor(image, width, height){
        this.image = image;
        this.width = width;
        this.height = height;
        this.tiles = new Map();
    }

    define(name, x, y, width, height){
        const buffer = document.createElement('canvas');
        buffer.width = width;
        buffer.height = height;
        buffer
            .getContext('2d')
            .drawImage(
                this.image,
                x,
                y,
                width,
                height,
                0,
                0,
                width,
                height
                );
        this.tiles.set(name, buffer);
    }

    defineTile(name, x, y){
        this.define(name, x*this.width, y*this.height, this.width, this.height);
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

### 5. Compositor.js
```javascript
export default class Compositor {
    constructor(){
        this.layers = [];
    }

    draw(context) {
        this.layers.forEach(layer => {
            layer(context);
        });
    }
}
```

### 6. layers.js
```javascript
export function drawBackground(background, context, sprites){
    background.ranges.forEach(([x1, x2, y1, y2]) =>{
        for(let x = x1; x < x2; ++x){
            for(let y = y1; y < y2; ++y){
                sprites.drawTile(background.tile, context, x, y); 
            }
        }
    });
}

export function createBackgroundLayer(backgrounds, sprites) {
    const Buffer = document.createElement('canvas');
    Buffer.width = 256;
    Buffer.height = 240;

    backgrounds.forEach(background => {
        drawBackground(background, Buffer.getContext('2d'), sprites);
    });

    return function createBackgroundLayer(context) {
        context.drawImage(Buffer, 0 ,0);
    };
}
```





