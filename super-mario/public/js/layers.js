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