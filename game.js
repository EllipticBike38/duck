const setMaxScore = (score) => {
    document.cookie = `maxScore=${score}`;
}

// Get the canvas element
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

dim = window.innerWidth - 20
h_dim = dim
v_dim = dim
entity_size = 3 / 16 * dim
padding = 1 / 16 * dim
rapporto_h_v = 1
base_speed = 3
speed = base_speed / 800 * dim

// the width of the canvas is the width of the screen, constantly, unless the sceen height doesn't fit the canvas height
// in that case, the canvas height is the screen height and the width is the screen height divided by the rapporto
// this is made up by the resize function

addEventListener('resize', () => {
    gameOver = true
    resize()
})

const resize = () => {
    w = window.innerWidth - 20
    h = w * rapporto_h_v
    if (h > window.innerHeight) {
        h = window.innerHeight - 20
        w = h / rapporto_h_v
    }
    h_dim = h
    v_dim = w
    canvas.width = w
    canvas.height = h
    entity_size = 3 / 16 * h
    padding = 1 / 16 * h
    speed = base_speed / 800 * h_dim

}

enemies = [] // array di oggetti con posizione e velocità: {x: 0, y: 0, speed: 0, type: 'flying', model: Image}
score = 0
is_jumping = false
gameOver = false
is_first_click = false
jumping_timeout = 0;

canvas.width = dim;
canvas.height = dim;


const sfondo = new Image();
sfondo.src = 'assets/sfondo.webp';
const duck = new Image();
duck.src = 'assets/duck.png';
const duck_fly = new Image();
duck_fly.src = 'assets/duck_fly.png';


const victor = new Image();
victor.src = 'assets/guy.png';
const baloon = new Image();
baloon.src = 'assets/baloon.png';

const whale = new Image();
whale.src = 'assets/whale.png';
const car = new Image();
car.src = 'assets/car.png';
const boiler = new Image();
boiler.src = 'assets/boiler.png';

flyingObjects = [victor, baloon]
notFlyingObjects = [whale, car, boiler]


sfondo.onload = () => {
    rapporto_h_v = sfondo.height / sfondo.width
    canvas.height = h_dim = dim * rapporto_h_v;
    resize()

    ctx.drawImage(sfondo, 0, 1, v_dim, h_dim);
    cookies = document.cookie;
    maxScore = cookies ? cookies.split(';').filter((cookie) => cookie.includes('maxScore'))[0].split('=')[1] || 0 : 0;

    // devo mettere uno sfondo un po' trasparente bianco
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(0, 0, v_dim, canvas.height);
    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Click to play", v_dim / 2, canvas.height / 2);
    ctx.fillText("Title", v_dim / 2, padding);
    ctx.font = "15px Arial";
    ctx.fillText("Credits: @andreamazzini00", v_dim / 2, canvas.height - padding);
    ctx.fillText(`Max Score: ${maxScore}`, v_dim - padding, padding);

    // logica dei click
    canvas.addEventListener('click', starterClick)

};
const starterClick = (e) => {
    // take the click position
    if (is_first_click) {
        is_first_click = false
        return
    }
    is_first_click = true
    gameOver = false
    gameStart()
    gameLoop()
    canvas.removeEventListener('click', starterClick)


}

const draw_a_not_flying = (ctx, enemy) => {
    ctx.drawImage(enemy.model, enemy.x, h_dim - entity_size, entity_size, entity_size);
}
const draw_a_flying = (ctx, enemy) => {
    ctx.drawImage(enemy.model, enemy.x, h_dim - (entity_size * 2), entity_size, entity_size);
}


// gameloooooooop:
// 1. eliminare tutto tranne il background
// 2. disegnare la papera
// 3. dare alla papera la possibilità di  saltare
// 4. disegnare i nemici e farli scorrere verso sinistra (con una certa velocità)
// 5. se la papera tocca un nemico, game over

const goUp = (e) => {
    jump(true)
}
const goDown = (e) => {
    jump(false)
}
const gameStart = () => {
    ctx.clearRect(0, 0, v_dim, canvas.height);
    ctx.drawImage(sfondo, 0, 1, v_dim, h_dim);

    player = ctx.drawImage(duck, 0, h_dim - entity_size, entity_size, entity_size);

    canvas.addEventListener('mousedown', goUp)
    canvas.addEventListener('mouseup', goDown)
    canvas.addEventListener('touchstart', goUp)

    canvas.addEventListener('touchend', goDown)

    gameOver = false
    enemies = []
    score = 0
    base_speed = 3
    speed = base_speed / 800 * h_dim

    draw_logic()
    requestAnimationFrame(gameLoop)
}
const gameLoop = () => {


    ctx.clearRect(0, 0, v_dim, canvas.height);
    ctx.drawImage(sfondo, 0, 1, v_dim, h_dim);

    player = ctx.drawImage((is_jumping ? duck_fly : duck), 0, h_dim - (entity_size + (is_jumping ? entity_size : 0)), entity_size, entity_size);

    draw_logic()

    ctx.font = "bold 30px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "right";
    ctx.fillText(`Score: ${score}`, v_dim - padding, padding);
    if (gameOver) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, 0, v_dim, canvas.height);
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", v_dim / 2, canvas.height / 2);
        if (score > maxScore) {
            ctx.fillText("New Max Score!", v_dim / 2, canvas.height / 2 + padding);

            setMaxScore(score)
        }
        canvas.addEventListener('click', starterClick)
        return
    }
    requestAnimationFrame(gameLoop)
}
const jumping_timeout_handler = () => {
    is_jumping = false
}
const jump = (up) => {
    if (up) {
        is_jumping = true
        jumping_timeout = setInterval(jumping_timeout_handler, 1000)
    } else {
        is_jumping = false
        clearInterval(jumping_timeout)

    }


}

const add_random_enemy = () => {
    if (Math.random() > 0.04) {
        return
    }
    // random tra whale e victor
    enemy = Math.random() > 0.2 ? 'not_flying' : 'flying'
    model = enemy === 'not_flying' ? notFlyingObjects[Math.floor(Math.random() * notFlyingObjects.length)] :
        flyingObjects[Math.floor(Math.random() * flyingObjects.length)]

    enemies.push({
        x: v_dim - entity_size,
        y: h_dim - entity_size + (enemy === 'not_flying' ? 0 : entity_size),
        speed: speed,
        type: enemy,
        model: model


    })
}

const draw_logic = () => {



    if (enemies.length === 0) {
        add_random_enemy()
        return
    }

    if (enemies[0].x < 0) {
        console.log({
            y: enemies[0].y,
            confronto: h_dim - entity_size + (is_jumping ? entity_size : 0),
            bool: enemies[0].y === h_dim - entity_size + (is_jumping ? entity_size : 0)
        })

        if (enemies[0].y === h_dim - entity_size + (is_jumping ? entity_size : 0)) {
            gameOver = true
            return
        }
        score += 1

        base_speed += 0.1
        speed = base_speed / 800 * h_dim
        enemies.shift()
    }

    if (enemies[enemies.length - 1].x < v_dim - entity_size * 3 && enemies[enemies.length - 1].x % (entity_size / 2)) {
        add_random_enemy()

    }
    enemies.forEach((enemy) => {
        enemy.x -= enemy.speed
        if (enemy.type === 'not_flying') {
            draw_a_not_flying(ctx, enemy)
        } else {
            draw_a_flying(ctx, enemy)
        }
    })
}