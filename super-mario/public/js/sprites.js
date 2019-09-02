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