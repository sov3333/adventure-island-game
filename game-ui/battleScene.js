const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./img/battleBackground.png";
const battleBackground = new Sprite({position: {x:0, y:0}, image: battleBackgroundImage})

let enemy;
let fighter;
let renderedSprites;
let battleAnimationId;
let queue;

let randomMonster = () => {
    if (Math.random() < 0.5) {
        document.querySelector("#enemyName").innerHTML = "Draggle"
        return monsters.Draggle;
    } else {
        document.querySelector("#enemyName").innerHTML = "Emby"
        return monsters.Emby;
    }
}

function initBattle() {
    document.querySelector("#userInterface").style.display = "block";
    document.querySelector("#dialogueBox").style.display = "none";
    document.querySelector("#enemyHealthBar").style.width = "100%";
    document.querySelector("#playerHealthBar").style.width = "100%";
    document.querySelector("#attacksBox").replaceChildren();

    enemy = new Monster(randomMonster());
    fighter = new Monster(monsters.Fighter);
    renderedSprites = [fighter, enemy];
    queue = [];

    fighter.attacks.forEach(attack => {
        // populate attacksBox dynamically with player's available attacks
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.querySelector("#attacksBox").append(button);
    })

    // event listeners related to battle
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", (e)=>{
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            fighter.attack({ 
                attack: selectedAttack,
                recipient: enemy,
                renderedSprites
            })

            if (enemy.health <= 0) {
                // handle drops
                player.bag.push(enemy.drops[0]);
                if (Math.random() < 0.2) player.bag.push(enemy.rareDrops[0]); // rare item
                document.querySelector("#itemOverlay").innerHTML = `ITEMS: ${player.bag.length}`;

                // handle gold
                player.gold += enemy.gold - Math.floor(Math.random() * enemy.gold/4); // e.g. minus (up to ~25%)
                document.querySelector("#goldOverlay").innerHTML = `GOLD: ${player.gold}`;

                // handle XP
                player.xp += enemy.xp;
                document.querySelector("#xpOverlay").innerHTML = `XP: ${player.xp}`;


                queue.push(()=>{
                enemy.faint();
                })
                queue.push(()=>{
                    gsap.to("#overlappingDiv", {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId);
                            animate();
                            document.querySelector("#userInterface").style.display = `none`;
                            gsap.to("#overlappingDiv", {
                                opacity: 0
                            })
                            battle.initiated = false;
                            audio.Map.play();
                        }
                    })
                })
            }

            // enemy attacks
            const randomAttack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)];

            queue.push(()=>{
                enemy.attack({ 
                    attack: randomAttack,
                    recipient: fighter,
                    renderedSprites
                })
                if (fighter.health <= 0) {
                    queue.push(()=>{
                    fighter.faint();
                    })
                    queue.push(()=>{
                        gsap.to("#overlappingDiv", {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId);
                                animate();
                                document.querySelector("#userInterface").style.display = `none`;
                                gsap.to("#overlappingDiv", {
                                    opacity: 0
                                })
                                battle.initiated = false;
                                audio.Map.play();
                            }
                        })
                    })
                }
            })
        })
        button.addEventListener("mouseenter", (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.querySelector("#attackType").innerHTML = selectedAttack.type;
            document.querySelector("#attackType").style.color = selectedAttack.color;
        })
    })

}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();

    renderedSprites.forEach(sprite => {
        sprite.draw()
    })
}

animate();
// initBattle();
// animateBattle();

document.querySelector("#dialogueBox").addEventListener("click", (e)=>{
    if (queue.length > 0){
        queue[0]();
        queue.shift();
    } else e.currentTarget.style.display = 'none';
})