# 004 Keyboard Input
meth meth method라는 유튜브 채널의 javascript강좌를 토대로 작업한 것입니다.
개인 공부용 기록입니다.

- 링크 : https://www.youtube.com/watch?v=1rBOUyRGQuU&list=PLS8HfBXv9ZWWe8zXrViYbIM2Hhylx8DZx&index=4


## 1) 새로 추가된 디렉토리 점검
이번 회차는 키보드로 조작할 수 있게 인풋기능을 연결한다.

*public 폴더
```
C:.
│  index.html
│  tree.txt
│  tree2.txt
│  
├─img
│      characters.gif
│      tile.png
│      
├─js
│  │  Compositor.js
│  │  entities.js
│  │  Entity.js
│  │  KeyboardState.js <--new
│  │  layers.js
│  │  loaders.js
│  │  main.js
│  │  math.js
│  │  sprites.js
│  │  SpriteSheet.js
│  │  Timer.js
│  │  
│  └─traits <--new
│          Jump.js <--new
│          Velocity.js <--new
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
### 추가된 js
- <code>KeyboardState.js</code>: 키보드 제어 js
- <code>Jump.js</code>: 캐릭터 점프기능 js
- <code>Velocity.js</code>: 속도 js
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
import Jump from './traits/Jump.js'
import Velocity from './traits/Velocity.js'
import {loadMarioSprite} from './sprites.js';

export function createMario(){
    return loadMarioSprite()
    .then(sprite => {    
        const mario = new Entity();
        
        mario.addTrait(new Velocity());
        mario.addTrait(new Jump());

        mario.draw = function drawMario(context) {
            sprite.draw('idle', context, this.pos.x, this.pos.y);
        }
        
        return mario;
    });
}
```

### 3. Entity.js
```javascript
import {Vec2} from './math.js';

export class Trait {
    constructor(name){
        this.NAME = name;
    }
    update() {
        console.warn('Unhandled update call in Trait');
    }
}

export default class Entity {
    constructor(){
        this.pos = new Vec2(0,0);
        this.vel = new Vec2(0,0);

        this.traits = [];        
    }

    addTrait(trait){
        this.traits.push(trait);
        this[trait.NAME] = trait;
    }

    update(deltaTime) {
        this.traits.forEach(trait => {
            trait.update(this, deltaTime);
        })
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
import Keyboard from './KeyboardState.js'

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
    
    const gravity = 2000;
    mario.pos.set(64, 180);
    mario.vel.set(200, -600);

    const SPACE = 32;
    const input = new Keyboard();
    input.addMapping(SPACE, keyState =>{
        if(keyState){
            mario.jump.start();
        } else {
            mario.jump.cancel();
        }
        console.log(keyState);
    });
    input.listenTo(window);


    const spriteLayer = createSpriteLayer(mario);
    comp.layers.push(spriteLayer);

    const timer = new Timer(1/60);
    timer.update = function update(deltaTime){                
            mario.update(deltaTime);
            comp.draw(context); 
            mario.vel.y += gravity * deltaTime;
            
        }        
   timer.start();
});
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
### 11. KeyboardState.js
```javascript
const PRESSED = 1;
const RELEASED = 0;


export default class KeyboardState {
   constructor(){
       //Holds the current state of a given key
       this.keyStates = new Map();

       //Holds the callback function for a key code
       this.keyMap = new Map();
   } 

   addMapping (keycode, callback) {
       this.keyMap.set(keycode, callback);
   }

   handleEvent (event){
       const {keyCode} = event;

       if(!this.keyMap.has(keyCode)){
           //Did not have key mapped;
           return false;
       }

       event.preventDefault();

       const keyState = event.type === 'keydown' ? PRESSED : RELEASED;
       
       if(this.keyStates.get(keyCode) === keyState){
           return;
       }
       this.keyStates.set(keyCode, keyState);
       console.log(this.keyStates);

       this.keyMap.get(keyCode)(keyState);
    }

    listenTo(window) {
            ['keydown','keyup'].forEach(eventName => {
            window.addEventListener(eventName,event =>{
                this.handleEvent(event);            
            });
        });
    }
}
```

### 12. Jump.js
```javascript
import {Trait} from '../Entity.js';

export default class Jump extends Trait{
    constructor() {
       super('jump');
       this.duration = 0.5;
       this.velocity = 200;
       this.engageTime = 0;
    }
    
    start() {
        this.engageTime = this.duration;
    }

    cancel() {
        this.engageTime = 0;
    }

    update(entity, deltaTime){
        if(this.engageTime > 0){
            entity.vel.y = -this.velocity;
            this.engageTime -= deltaTime;
        }
    }
}
```

### 13. Velocity.js
```javascript
import {Trait} from '../Entity.js';

export default class Velocity extends Trait{
    constructor() {
       super('velocity');
    }

    update(entity, deltaTime){
        entity.pos.x += entity.vel.x * deltaTime;
        entity.pos.y += entity.vel.y * deltaTime;
    }
}
```
