# 005 Tile Collision
meth meth method라는 유튜브 채널의 javascript강좌를 토대로 작업한 것입니다.
개인 공부용 기록입니다.

- 링크 : https://www.youtube.com/watch?v=YLMP5jmtpYc&list=PLS8HfBXv9ZWWe8zXrViYbIM2Hhylx8DZx&index=5

## 1) 새로 추가된 디렉토리 점검
이번 회차는 키보드로 조작할 수 있게 인풋기능을 연결한다.

*public 폴더
```

C:.
│  index.html
│  tree1.txt
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
│  │  input.js <--new
│  │  KeyboardState.js
│  │  layers.js
│  │  Level.js <--new
│  │  loaders.js
│  │  main.js
│  │  math.js
│  │  sprites.js
│  │  SpriteSheet.js
│  │  TileCollider.js <--new
│  │  TileResolver.js <--new
│  │  Timer.js
│  │  
│  └─traits
│          Go.js <--new
│          Jump.js
│          Velocity.js
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
- <code>KeyboardState.js</code>: 키보드 제어 js
- <code>Jump.js</code>: 캐릭터 점프기능 js
- <code>Velocity.js</code>: 속도 js
### 추가된 js
- <code>input.js</code>: 키보드인풋 연결하는 js
- <code>TileCollider.js</code>: .. js
- <code>TileResolver.js</code>: .. js
- <code>Go.js</code>: 캐릭터가 전진후진할 수 있게 하는 js

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
import Go from './traits/Go.js'
import Velocity from './traits/Velocity.js'
import {loadMarioSprite} from './sprites.js';

export function createMario(){
    return loadMarioSprite()
    .then(sprite => {    
        const mario = new Entity();
        mario.size.set(14, 16);
        
        mario.addTrait(new Go());        
        mario.addTrait(new Jump());
        //mario.addTrait(new Velocity());

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
        this.size = new Vec2(0,0);

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
import {Matrix} from './math.js';

export function createBackgroundLayer(level, sprites) {
    const Buffer = document.createElement('canvas');
    Buffer.width = 256;
    Buffer.height = 240;

    const context = Buffer.getContext('2d');

    level.tiles.forEach((tile, x, y) => {
        sprites.drawTile(tile.name, context, x, y);
    });    

    return function drawBackgroundLayer(context) {
        context.drawImage(Buffer, 0 ,0);
    };
}

export function createSpriteLayer(entities) {
    return function drawSpriteLayer(context){
        entities.forEach(entity => {
            entity.draw(context);
        }); 
    };
}

export function createCollisionLayer(level) {    
    const tileResolver = level.tileCollider.tiles;
    const tileSize = tileResolver.tileSize;

    const resolvedTiles = new Matrix();

    const getByIndexOriginal = tileResolver.getByIndex;

    tileResolver.getByIndex = function getByIndexFake(x, y){
        resolvedTiles.set(x, y, true);
        return getByIndexOriginal.call(tileResolver, x, y);
    }

    return function drawCollision(context){
        context.strokeStyle = 'blue';
        resolvedTiles.forEach((value, x, y) => {           
           context.beginPath();
           context.rect(
               x*tileSize, y*tileSize,  
               tileSize, tileSize );
           context.stroke();
        });

        level.entities.forEach(entity => {    
            context.strokeStyle = 'red';       
            context.beginPath();
            context.rect(
                entity.pos.x, entity.pos.y,  
                entity.size.x, entity.size.y );
            context.stroke();
         });
        resolvedTiles.clear();
    };
}
```

### 5. loaders.js
```javascript
import Level from './Level.js';
import {createBackgroundLayer, createSpriteLayer} from './layers.js';
import {loadBackgroundSprites} from './sprites.js';

export function loadImage(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=> {
            resolve(image);
        });
        image.src = url;
    });
}

function createTiles(level, backgrounds){
    backgrounds.forEach(background => {    
        background.ranges.forEach(([x1, x2, y1, y2]) =>{
            for(let x = x1; x < x2; ++x){
                for(let y = y1; y < y2; ++y){
                    level.tiles.set(x, y, {
                        name: background.tile,
                    })
                }
            }
        });
    });
}


export function loadLevel(name) {
    return Promise.all([
        fetch(`/levels/${name}.json`)
        .then(r => r.json()),
        loadBackgroundSprites(),
    ])
    .then(([levelSpec, BackgroundSprites]) => {
        const level = new Level();

        createTiles(level, levelSpec.backgrounds);

        const backgroundLayer = createBackgroundLayer(level, BackgroundSprites);
        level.comp.layers.push(backgroundLayer);

        const spriteLayer = createSpriteLayer(level.entities);
        level.comp.layers.push(spriteLayer);

        return level;
        });
    
}
```

### 6. main.js
```javascript
import Timer from './Timer.js';
import {loadLevel} from './loaders.js';
import {createMario} from './entities.js';
import {createCollisionLayer} from './layers.js'
import {setupKeyboard} from './input.js';

const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');

Promise.all([
    createMario(),
    loadLevel('1-1'),
])
.then(([mario, level]) => {        
    mario.pos.set(64, -64);    

    level.entities.add(mario);

    const input = setupKeyboard(mario);
    input.listenTo(window);

    const timer = new Timer(1/60);
    timer.update = function update(deltaTime){                
            level.update(deltaTime);
            level.comp.draw(context); 
            
            
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

   addMapping (code, callback) {
       this.keyMap.set(code, callback);
   }

   handleEvent (event){
       const {code} = event;

       if(!this.keyMap.has(code)){
           //Did not have key mapped;
           return false;
       }

       event.preventDefault();

       const keyState = event.type === 'keydown' ? PRESSED : RELEASED;
       
       if(this.keyStates.get(code) === keyState){
           return;
       }
       this.keyStates.set(code, keyState);
       console.log(this.keyStates);

       this.keyMap.get(code)(keyState);
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


### 14. input.js
```javascript
import Keyboard from './KeyboardState.js'

export function setupKeyboard(entity) {
    
    const input = new Keyboard();

    input.addMapping('Space', keyState =>{
        if(keyState){
            entity.jump.start();
        } else {
            entity.jump.cancel();
        }
        console.log(keyState);
    });

    input.addMapping('ArrowRight', keyState =>{
        entity.go.dir = keyState;       
    });
    input.addMapping('ArrowLeft', keyState =>{
        entity.go.dir = -keyState;       
    });

    return input;
}
```

### 15. TileCollider.js
```javascript
import TileResolver from './TileResolver.js'

export default class TileCollider {
    constructor(tileMatrix) {
        this.tiles = new TileResolver(tileMatrix);
    }

    checkX(entity) {
        let x;
        if (entity.vel.x > 0){
            x = entity.pos.x + entity.size.x;
        } else if(entity.vel < 0) {
            x = entity.pos.x;
        } else {
            return;
        }
        const matches = this.tiles.searchByRange(
            x, x,
            entity.pos.y, entity.pos.y + entity.size.y);
        
        matches.forEach(match => {       
            if(match.tile.name !== 'ground'){
                return;
            }

            if(entity.vel.x > 0){
                if(entity.pos.x + entity.size.x > match.x1){
                    entity.pos.x = match.x1 - entity.size.x;
                    entity.vel.x = 0;
                }
            }

            else if(entity.vel.x < 0){
                if(entity.pos.x < match.x2){
                    entity.pos.x = match.x2;
                    entity.vel.x = 0;
                }
            }
        });
    }

    checkY(entity) {
        let y;
        if (entity.vel.y > 0){
            y = entity.pos.y + entity.size.y;
        } else if(entity.vel < 0) {
            y = entity.pos.y;
        } else {
            return;
        }
        const matches = this.tiles.searchByRange(
            entity.pos.x, entity.pos.x + entity.size.x,
            y, y);
        
        matches.forEach(match => {       
            if(match.tile.name !== 'ground'){
                return;
            }

            if(entity.vel.y > 0){
                if(entity.pos.y + entity.size.y > match.y1){
                    entity.pos.y = match.y1 - entity.size.y;
                    entity.vel.y = 0;
                }
            }

            else if(entity.vel.y < 0){
                if(entity.pos.y < match.y2){
                    entity.pos.y = match.y2;
                    entity.vel.y = 0;
                }
            }
        });
    }

    test(entity){
        this.checkY(entity);       
    }
}
```

### 16. TileResolver.js
```javascript
export default class TileResolver {
    constructor(matrix,tileSize = 16) {
        this.matrix = matrix;
        this.tileSize = tileSize;
    }

    toIndex(pos){
        return Math.floor(pos / this.tileSize)
    }

    toIndexRange(pos1, pos2) {
        const pMax = Math.ceil(pos2 / this.tileSize) * this.tileSize;
        const range = [];
        let pos = pos1;
        do {
            range.push(this.toIndex(pos));
            pos += this.tileSize;
        } while(pos < pMax);
        return range;
    }

    getByIndex(indexX, indexY){
        const tile = this.matrix.get(indexX, indexY);
        if(tile){
            const x1 = indexX * this.tileSize;
            const x2 = x1 + this.tileSize;
            const y1 = indexY * this.tileSize;
            const y2 = y1 + this.tileSize;
            return {
                tile,
                x1,
                x2,
                y1,
                y2,
            };
        }
    }
    matchByPositoin(posX, posY){
        return this.getByIndex(
            this.toIndex(posX),
            this.toIndex(posY));
    }

    searchByRange(x1, x2, y1, y2) {
        const matches = [];
        this.toIndexRange(x1, x2).forEach(indexX => {
            this.toIndexRange(y1, y2).forEach(indexY => {
                const match = this.getByIndex(indexX, indexY);
                if(match) {
                    matches.push(match);
                }
            });
        });
        return matches;
    }

}

```

### 17. Go.js
```javascript
import {Trait} from '../Entity.js';

export default class Go extends Trait{
    constructor() {
       super('go');

       this.dir = 0;
       this.speed = 2000;
   
    }
    
    update(entity, deltaTime){
        entity.vel.x = this.speed * this.dir * deltaTime;
    }
}
```



