const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

const zoneWidth = 80;
const zoneHeight = 45;

let redScore = 0;
let blueScore = 0;

//////////////////////////////////////////////////
// robots
//////////////////////////////////////////////////

const redRobot = {
    x:100,
    y:H/2,
    color:"red",
    carry:0
};

const blueRobot = {
    x:W-100,
    y:H/2,
    color:"blue",
    carry:0
};

//////////////////////////////////////////////////
// bottles
//////////////////////////////////////////////////

const redBottles = [];

for(let i=0;i<15;i++){
    redBottles.push({
        x:250 + (i%5)*20,
        y:550 + Math.floor(i/5)*20,
        taken:false
    });
}

const blueBottles = [];

for(let i=0;i<15;i++){
    blueBottles.push({
        x:1150 + (i%5)*20,
        y:550 + Math.floor(i/5)*20,
        taken:false
    });
}

//////////////////////////////////////////////////
// common zones
//////////////////////////////////////////////////

const zones = [];

for(let i=0;i<12;i++){

    zones.push({
        x:660,
        y:H-60-(i*50),
        red:false,
        blue:false
    });
}

//////////////////////////////////////////////////
// keyboard
//////////////////////////////////////////////////

const keys = {};

window.addEventListener("keydown",e=>{
    keys[e.key]=true;
});

window.addEventListener("keyup",e=>{
    keys[e.key]=false;
});

//////////////////////////////////////////////////
// movement
//////////////////////////////////////////////////

function updateRobot(){

    const speed=4;

    // red
    if(keys["w"]) redRobot.y-=speed;
    if(keys["s"]) redRobot.y+=speed;
    if(keys["a"]) redRobot.x-=speed;
    if(keys["d"]) redRobot.x+=speed;

    // blue
    if(keys["ArrowUp"]) blueRobot.y-=speed;
    if(keys["ArrowDown"]) blueRobot.y+=speed;
    if(keys["ArrowLeft"]) blueRobot.x-=speed;
    if(keys["ArrowRight"]) blueRobot.x+=speed;

    clamp(redRobot);
    clamp(blueRobot);
}

function clamp(robot){

    robot.x=Math.max(0,Math.min(W,robot.x));
    robot.y=Math.max(0,Math.min(H,robot.y));
}

//////////////////////////////////////////////////
// pick bottles
//////////////////////////////////////////////////

window.addEventListener("keydown",(e)=>{

    if(e.key==="e"){
        pickBottle(redRobot,redBottles);
    }

    if(e.key==="/"){
        pickBottle(blueRobot,blueBottles);
    }

    if(e.key==="q"){
        placeBottle(redRobot,"red");
    }

    if(e.key==="Shift"){
        placeBottle(blueRobot,"blue");
    }

});

function pickBottle(robot,bottles){

    if(robot.carry>=5) return;

    for(const b of bottles){

        if(b.taken) continue;

        const dx=robot.x-b.x;
        const dy=robot.y-b.y;

        if(Math.hypot(dx,dy)<35){

            b.taken=true;
            robot.carry++;

            break;
        }
    }
}

//////////////////////////////////////////////////
// place bottle
//////////////////////////////////////////////////

function placeBottle(robot,team){

    if(robot.carry===0) return;

    for(let i=0;i<12;i++){

        const z=zones[i];

        const inside=
            robot.x>z.x &&
            robot.x<z.x+zoneWidth &&
            robot.y>z.y &&
            robot.y<z.y+zoneHeight;

        if(!inside) continue;

        // 12番

        if(i===11){

            if(countZones(team)<5){
                return;
            }
        }

        // 下位ゾーン条件

        let ok=true;

        for(let j=0;j<i;j++){

            if(team==="red" && !zones[j].red){
                ok=false;
            }

            if(team==="blue" && !zones[j].blue){
                ok=false;
            }

        }

        if(!ok) return;

        if(team==="red") zones[i].red=true;
        else zones[i].blue=true;

        robot.carry--;

        return;
    }
}

//////////////////////////////////////////////////
// score
//////////////////////////////////////////////////

function countZones(team){

    let c=0;

    zones.forEach(z=>{

        if(team==="red" && z.red) c++;
        if(team==="blue" && z.blue) c++;

    });

    return c;
}

function score(team){

    let s=0;

    zones.forEach(z=>{

        if(team==="red" && z.red) s+=30;
        if(team==="blue" && z.blue) s+=30;

    });

    if(countZones(team)>=5)
        s+=90;

    if(team==="red" && zones[11].red)
        s+=180;

    if(team==="blue" && zones[11].blue)
        s+=180;

    return s;
}

//////////////////////////////////////////////////
// draw
//////////////////////////////////////////////////

function drawField(){

    ctx.clearRect(0,0,W,H);

    // court

    ctx.fillStyle="#ffd0d0";
    ctx.fillRect(0,0,W/2,H);

    ctx.fillStyle="#d0d0ff";
    ctx.fillRect(W/2,0,W/2,H);

    //////////////////////////////////////////////////
    // common zones
    //////////////////////////////////////////////////

    zones.forEach((z,i)=>{

        ctx.fillStyle="white";
        ctx.fillRect(
            z.x,
            z.y,
            zoneWidth,
            zoneHeight
        );

        ctx.strokeRect(
            z.x,
            z.y,
            zoneWidth,
            zoneHeight
        );

        ctx.fillStyle="black";
        ctx.fillText(
            i+1,
            z.x+30,
            z.y+25
        );

        if(z.red){

            ctx.fillStyle="red";
            ctx.beginPath();
            ctx.arc(
                z.x+20,
                z.y+25,
                8,
                0,
                Math.PI*2
            );
            ctx.fill();
        }

        if(z.blue){

            ctx.fillStyle="blue";
            ctx.beginPath();
            ctx.arc(
                z.x+60,
                z.y+25,
                8,
                0,
                Math.PI*2
            );
            ctx.fill();
        }
    });

    //////////////////////////////////////////////////
    // bottles
    //////////////////////////////////////////////////

    redBottles.forEach(b=>{

        if(b.taken) return;

        ctx.fillStyle="red";

        ctx.beginPath();
        ctx.arc(b.x,b.y,8,0,Math.PI*2);
        ctx.fill();
    });

    blueBottles.forEach(b=>{

        if(b.taken) return;

        ctx.fillStyle="blue";

        ctx.beginPath();
        ctx.arc(b.x,b.y,8,0,Math.PI*2);
        ctx.fill();
    });

    //////////////////////////////////////////////////
    // robots
    //////////////////////////////////////////////////

    ctx.fillStyle="red";
    ctx.fillRect(
        redRobot.x-15,
        redRobot.y-15,
        30,
        30
    );

    ctx.fillStyle="blue";
    ctx.fillRect(
        blueRobot.x-15,
        blueRobot.y-15,
        30,
        30
    );

    //////////////////////////////////////////////////

    document.getElementById("info").innerHTML=
    `
    赤得点:${score("red")}
    ｜保持:${redRobot.carry}
    <br>
    青得点:${score("blue")}
    ｜保持:${blueRobot.carry}
    <br><br>

    赤移動: WASD
    /
    回収:E
    /
    配置:Q
    <br>

    青移動: ↑↓←→
    /
    回収: /
    /
    配置: Shift
    `;
}

//////////////////////////////////////////////////

function loop(){

    updateRobot();
    drawField();

    requestAnimationFrame(loop);
}

loop();
