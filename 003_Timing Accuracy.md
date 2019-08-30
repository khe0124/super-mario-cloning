# 003 Timing Accuracy
meth meth method라는 유튜브 채널의 javascript강좌를 토대로 작업한 것입니다.
개인 공부용 기록입니다.

- 링크 : https://www.youtube.com/watch?v=HlloFDayGgk&list=PLS8HfBXv9ZWWe8zXrViYbIM2Hhylx8DZx&index=3


## 1) 새로 추가된 디렉토리 점검
지난 회차에 이어서 작업한 내용이다. 새로 추가된 파일들을 점검하겠다. <br>
이번 회차의 튜토리오는 마리오의 점프의 포물선 기울기와 높이, 속도를 맞추는 것이었다.

*public 폴더
```
C:.
│  index.html
│  tree.txt
│  
├─img
│      characters.gif
│      tile.png
│      
├─js
│      Compositor.js
│      entities.js <--new
│      Entity.js <--new
│      layers.js
│      loaders.js
│      main.js
│      math.js <--new
│      sprites.js
│      SpriteSheet.js
│      Timer.js <--new
│      
└─levels
        1-1.json
```
### js 구조
- <code>Compositor.js</code>: Compositor 클래스
- <code>entities.js</code>: sprite 이미지에서 마리오부분을 불러와 마리오의 위치를 넘겨주는 js
- <code>Entity.js</code>: 개체의 위치를 담는 js
- <code>layers.js</code>: sprite 이미지 레이어, canvas 레이어가 있는 js
- <code>loaders.js</code>: 이미지와 JSON을 로딩하는 js
- <code>main.js</code>: 메인 js, 다른 js들을 불러온다.
- <code>math.js</code>: 위치의 값 js
- <code>sprites.js</code>: sprite 이미지, 배경와 캐릭터 이미지를 불러오는 js
- <code>SpriteSheet.js</code>: 좌표와 반복횟수, 크기 등을 받아와 배경을 그려주는 js
- <code>Timer.js</code>: 시간, 속도를 계산하는 js
- <code>layers.js</code>: 레이어 js
- <code>Compositor.js</code>: 구성 js

<br>

## 2) 전체 js
### 1. Compositor.js
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

### 2. entities.js
```javascript
import Entity from './Entity.js';
import {loadMarioSprite} from './sprites.js';

export function createMario(){
        return loadMarioSprite()
        .then(sprite => {    
        const mario = new Entity();
        
        mario.draw = function drawMario(context) {
            sprite.draw('idle', context, this.pos.x, this.pos.y);
        }

        mario.update = function updateMario(deltaTime){
            this.pos.x += this.vel.x * deltaTime;
            this.pos.y += this.vel.y * deltaTime;
        }
        return mario;
    });
}
```

### 3. Entity.js
```javascript
import {Vec2} from './math.js';

export default class Entity {
    constructor(){
        this.pos = new Vec2(0,0);
        this.vel = new Vec2(0,0);
    }
}
```

### 4. layers.js
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

export function createSpriteLayer(entity) {
    return function drawSpriteLayer(context){
        entity.draw(context);
    };
}
```

### 5. loaders.js
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

### 6. main.js
```javascript
import Compositor from './Compositor.js';
import Timer from './Timer.js';
import {loadLevel} from './loaders.js';
import {createMario} from './entities.js';
import {loadBackgroundSprites} from './sprites.js';
import {createBackgroundLayer, createSpriteLayer} from './layers.js';

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

Promise.all([
    createMario(),
    loadBackgroundSprites(),
    loadLevel('1-1'),
])
.then(([mario, BackgroundSprites, level]) => {
    const comp = new Compositor();
    
    const backgroundLayer = createBackgroundLayer(level.backgrounds, BackgroundSprites);
    comp.layers.push(backgroundLayer);
    
    const gravity = 30;
    mario.pos.set(64, 180);
    mario.vel.set(200, -600);

    const spriteLayer = createSpriteLayer(mario);
    comp.layers.push(spriteLayer);

    const timer = new Timer(1/60);

    timer.update = function update(deltaTime){
            comp.draw(context);     
            mario.update(deltaTime);
            mario.vel.y += gravity;
        }        
   timer.start();
});
```

### 7. math.js
```javascript
export class Vec2 {
    constructor(x, y){
        this.set(x, y);
    }
    set(x, y){
        this.x = x;
        this.y = y;
    }
}
```

### 8. sprites.js
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

### 9. SpriteSheet.js
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

### 10. Timer.js
```javascript
export default class Timer {
    constructor(deltaTime = 1/60) {
        let accumulatedTime = 0;
        let lastTime = 0;

        this.updateProxy = (time) => {
            accumulatedTime += (time - lastTime) / 1000;
            
            while( accumulatedTime > deltaTime ){
                this.update(deltaTime);
                accumulatedTime -= deltaTime;
            }                        
            lastTime = time;
            this.enqueue();
        }
    }

    enqueue() {
        requestAnimationFrame(this.updateProxy);
    }

    start() {
        this.enqueue();
    }

}
```

