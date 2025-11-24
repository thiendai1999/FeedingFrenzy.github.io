var canvas_main = document.getElementById('game-canvas');
var context_main = canvas_main.getContext('2d');

var canvas_render = document.createElement('canvas');
var context_render = canvas_render.getContext('2d');

var background_left, background_right, background_top, background_bottom;
var canvas_left, canvas_right, canvas_top, canvas_bottom;
var trans_x, trans_y, trans_x_max, trans_y_max, trans_value;

trans_x = 0;
trans_y = 0;
trans_value = 5;
trans_x_max = 0;
trans_y_max = 0;

window.CURRENT_STAGE = null;

function loadStage(chapterId, stageId) {
    const chapter = GAME_STAGES.chapters.find(c => c.id === chapterId);
    const stage = chapter.stages.find(s => s.id === stageId);
    window.CURRENT_STAGE = stage;
}

function getSpawnRates() { return window.CURRENT_STAGE.spawn; }
function getStageSpeed() { return window.CURRENT_STAGE.speed; }
function getStageMode() { return window.CURRENT_STAGE.mode; }
function getStageBackground() { return window.CURRENT_STAGE.background; }

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// TEMP: auto load stage 1-1 for now:
loadStage(1, 1);

var DEFAULT_VOCAB_SETS = {
    "Động vật": [
        { word: "cat", meaning: "con mèo" },
        { word: "dog", meaning: "con chó" },
        { word: "fish", meaning: "con cá" },
        { word: "bird", meaning: "con chim" },
        { word: "tiger", meaning: "con hổ" }
    ],
    "Màu sắc": [
        { word: "red", meaning: "màu đỏ" },
        { word: "blue", meaning: "màu xanh dương" },
        { word: "green", meaning: "màu xanh lá" },
        { word: "yellow", meaning: "màu vàng" },
        { word: "orange", meaning: "màu cam" }
    ],
    "Đồ ăn": [
        { word: "rice", meaning: "cơm" },
        { word: "bread", meaning: "bánh mì" },
        { word: "noodle", meaning: "mì" },
        { word: "meat", meaning: "thịt" },
        { word: "milk", meaning: "sữa" }
    ]
};

var userData = { users: [], scores: {}, vocabStats: {} };
var activeUser = null;
var selectedSets = [];
var quizQueue = [];
var quizIndex = 0;
var askedWords = [];
var quizTimer = null;
var fishScore = 0;
var quizScore = 0;
var hasShownSummary = false;


var global_mouse_x = 0;
var global_mouse_y = 0;



var marines_number = 4;
var base_marines_number = 4;
var isPause = true,
    isWin = false,
    isGameOver = false;

var score_to_level_2 = 30;
var score_to_level_3 = 80;
var score_to_win = 140;

var level_thresholds = [
    score_to_level_2,
    score_to_level_3,
    score_to_win,
];

var background = new Image();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyCanvas = {

    canvas_width: 1000,
    canvas_height: 600,


    background_width: 0,
    background_height: 0,

    canvas_max_top: 80,


    screen_size: {
        width: window.innerWidth || document.body.clientWidth,
        height: window.innerHeight || document.body.clientHeight
    },

    init: function() {
        console.log('MyCanvas crazy');
        this.canvas_width = MyCanvas.screen_size.width;
        this.canvas_height = MyCanvas.screen_size.height - 4;

        canvas_main.width = this.canvas_width;
        canvas_main.height = this.canvas_height;

        this.background_width = background.width;
        this.background_height = background.height;

        canvas_render.width = background.width;
        canvas_render.height = background.height;

        background_left = 40;
        background_right = this.background_width - 150;
        background_top = 80;
        background_bottom = this.background_height - 80;

        canvas_left = 40;
        canvas_right = this.canvas_width - 150;
        canvas_top = 80;
        canvas_bottom = this.canvas_height - 100;

        trans_x_max = this.background_width - this.canvas_width;
        trans_y_max = this.background_height - this.canvas_height;

        console.log(this.canvas_width, this.canvas_height);

        console.log(background_left, background_right, background_top, background_bottom);
        console.log(canvas_left, canvas_right, canvas_top, canvas_bottom);

        console.log(trans_x_max, trans_y_max);

        console.log(canvas_render);
        console.log(canvas_main);

    },
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyScore = {
    left: 30,
    top: 60,
    lineWidth: 20,
    score: 0,
    color: 'rgb(255,255,255)',

    draw: function() {
        this.left = 30 + trans_x;
        this.top = 60 + trans_y;
        context_render.lineWidth = this.lineWidth;
        context_render.fillStyle = this.color;

        context_render.font = 'normal bold 2em courier';

        context_render.fillText("Score: " + this.score, this.left, this.top);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyHeart = {
    left: 250,
    top: 60,
    lineWidth: 20,
    heart: -1,
    color: 'rgb(255,255,255)',

    draw: function() {
        this.left = 250 + trans_x;
        this.top = 60 + trans_y;
        context_render.lineWidth = this.lineWidth;
        context_render.fillStyle = this.color;

        context_render.font = 'normal bold 2em courier';

        context_render.fillText("Heart: " + this.heart, this.left, this.top);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyNoti = {
    left: 500,
    top: 60,
    lineWidth: 10,
    noti: '',
    color: 'rgb(255,255,255)',

    lostHeart: function() {
        this.noti = 'Immortal!!!';

        setTimeout(function() {
            MyNoti.noti = '';
        }, 3000);
    },

    levelUp: function() {
        this.noti = 'Level Up!!!';

        setTimeout(function() {
            MyNoti.noti = '';
        }, 3000);
    },

    pause: function() {
        this.noti = 'Pause!!!';

        setTimeout(function() {
            MyNoti.noti = '';
        }, 3000);
    },

    draw: function() {
        this.left = 500 + trans_x;
        this.top = 60 + trans_y;
        context_render.lineWidth = this.lineWidth;
        context_render.fillStyle = this.color;

        context_render.font = 'normal bold 2em courier';

        context_render.fillText(this.noti, this.left, this.top);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyProgressBar = {
    value: 0,
    max_value: 100,
    width: 500,
    height: 10,
    offsetX: 0,
    offsetY: 0,
    bg_color: 'rgb(0,0,0)',
    line_color: 'rgb(249,28,12)',
    value_color: 'rgb(226,226,42)',

    line_offsets: [],


    init: function() {
        this.value = 0;
        this.max_value = score_to_win;
        this.offsetX = MyCanvas.canvas_width - this.width - 50;
        this.offsetY = 50;
        this.line_offsets = level_thresholds.map(function(threshold) {
            return MyProgressBar.offsetX + threshold / MyProgressBar.max_value * MyProgressBar.width;
        });
    },

    draw: function() {

        if (this.value > this.max_value) {
            this.value = this.max_value;
        }

        context_render.lineJoin = 'round';
        context_render.lineCap = 'round';
        context_render.fillStyle = this.bg_color;
        context_render.fillRect(this.offsetX + trans_x, this.offsetY + trans_y, this.width, this.height);

        context_render.fillStyle = this.value_color;
        context_render.fillRect(
            this.offsetX + trans_x,
            this.offsetY + trans_y,
            this.value / this.max_value * this.width,
            this.height
        );

        context_render.fillStyle = this.line_color;

        for (var i = 0; i < this.line_offsets.length; i++) {
            context_render.fillRect(this.line_offsets[i] + trans_x, this.offsetY + trans_y - 1, 2, this.height + 1);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
var MyFish = {
    value: 1,

    x: 0,
    y: 0,
    fish_left_image: 0,
    fish_right_image: 0,

    width: 0,
    height: 0,

    direction: 0,

    init: function() {
        this.x = MyCanvas.screen_size.width / 2;
        this.y = MyCanvas.screen_size.height / 2;
        this.direction = 'R';
        this.fish_left_image = new Image();
        this.fish_left_image.src = "images/fish_left.gif"; // 200x123
        this.fish_right_image = new Image();
        this.fish_right_image.src = "images/fish_right.gif"; // 200x123
        this.width = 186 / 2;
        this.height = 85 / 2;
    },

    draw: function() {
        // context_render.beginPath();
        // context_render.arc(this.x, this.y, 10, 0, 2 * Math.PI, true);
        // context_render.fillStyle = "#FF6A6A";
        // context_render.fill();
        // if (this.value == 100) {
        //     context_render.drawImage(this.fish_left_image, MyCanvas.screen_size.width / 2, MyCanvas.screen_size.height / 2, this.width, this.height);
        // }

        // document.write('<div name="cursor" id="trailimageid" style="position:absolute;visibility:visible;left:500px;top:200px;width:100px;height:auto" ><img id = "cursorID" src="'+ this.fish_right_image.src+'" border="0" width="'+this.width+'px" height= auto"><\/div>')

        // ----- nothing here :P ----- //
        // ----- :))  ahihi  :)) ----- //
        //      draw with mouse cursor //
        // check mousemove event       //
        // ----- :))  ahihi  :)) ----- //

        // if (this.direction == 'L') {
        //     context_render.drawImage(this.fish_left_image, this.x, this.y, this.width, this.height);
        // } else {
        //     context_render.drawImage(this.fish_right_image, this.x, this.y, this.width, this.height);
        // }

    },

    lostHeart: function(cur_value) {
        this.value = 100;
        console.log('lost heart' + cur_value);

        setTimeout(function() {
            console.log('normal' + cur_value);
            MyFish.value = cur_value;
            console.log('normal' + MyFish.value);
        }, 3000);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// marine
var marines_source = [
    "images/marines/star.png", //200x213            // 0
    "images/marines/fish_1_left.png", // 200x100    // 1
    "images/marines/fish_1_right.png",
    "images/marines/fish_2_left.png", // 200x106    // 3
    "images/marines/fish_2_right.png",
    "images/marines/fish_3_left.png", // 200x153    // 5
    "images/marines/fish_3_right.png",
    "images/marines/fish_4_left.png", // 200x86     // 7
    "images/marines/fish_4_right.png",

];

var marines_ = [];

var MyMarines = {
    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    pickMarineType: function() {
        const spawn = getSpawnRates();
        const roll = Math.random();
        if (roll < spawn.small) return 'small';
        if (roll < spawn.small + spawn.medium) return 'medium';
        if (roll < spawn.small + spawn.medium + spawn.large) return 'large';
        return 'shark';
    },

    add: function() {
        const speed = getStageSpeed();
        var mr = {
            value: 0, // 0 1 2 3 4
            top: 0,
            left: 0,
            width: 30,
            height: 30,

            img: 0,

            velocityX: -50,
            velocityY: 0,
        }

        var pickedValue = this.pickMarineType();
        var rand = 0;

        if (pickedValue === 'small') {
            rand = this.getRandomInt(1, 2);
        } else if (pickedValue === 'medium') {
            rand = this.getRandomInt(3, 4);
        } else if (pickedValue === 'large') {
            rand = this.getRandomInt(5, 6);
        } else {
            rand = this.getRandomInt(7, 8);
        }

        mr.img = new Image();
        mr.img.src = marines_source[rand];

        mr.velocityY = 0;

        if (rand == 1 || rand == 2) {
            mr.value = 1;
            mr.width = 70;
            mr.height = 35;
        }

        if (rand == 3 || rand == 4) {
            mr.value = 2;
            mr.width = 100;
            mr.height = 50;
        }

        if (rand == 5 || rand == 6) {
            mr.value = 3;
            mr.width = 100;
            mr.height = 70;
        }

        if (rand == 7 || rand == 8) {
            mr.value = 4;
            mr.width = 140;
            mr.height = 80;
        }

        var swimSpeed = randomRange(speed.min, speed.max);

        // right
        if (rand % 2 == 0) {
            mr.velocityX = swimSpeed;
            mr.left = 0;
            mr.top = this.getRandomInt(MyCanvas.canvas_max_top, MyCanvas.background_height - mr.height);
        } else {
            // left
            mr.velocityX = -swimSpeed;
            mr.left = MyCanvas.background_width;
            mr.top = this.getRandomInt(MyCanvas.canvas_max_top, MyCanvas.background_height - mr.height);
        }

        marines_.push(mr);
    },

    update: function() {
        for (var i = 0; i < marines_.length; i++) {
            marines_[i].left += marines_[i].velocityX;
            marines_[i].top += marines_[i].velocityY;
        }
    },

    draw: function() {
        for (var i = 0; i < marines_.length; i++) {
            var mr = marines_[i];
            context_render.drawImage(mr.img, mr.left, mr.top, mr.width, mr.height);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// check logic
var MyCheck = {
    outOfRange: function() {
        for (var i = 0; i < marines_.length; i++) {
            var mr = marines_[i];
            if (mr.left + mr.width < 0) {
                marines_.splice(i, 1);
                continue;
            }
            if (mr.left > MyCanvas.background_width) {
                marines_.splice(i, 1);
                continue;
            }
            if (mr.top > MyCanvas.background_height) {
                marines_.splice(i, 1);
                continue;
            }
        }

        while (marines_.length <= marines_number) {
            MyMarines.add(MyFish.value);
        }
    },

    collision: function() {

        var mr;
        var fish_x, fish_y;
        var cur_score = MyScore.score;
        var cur_heart = MyHeart.heart;
        var cur_value = MyFish.value;

        // immortal :))
        if (cur_value == 100) {
            return;
        }

        if (MyFish.direction == "L") {
            fish_x = MyFish.x;
            fish_y = MyFish.y + MyFish.height / 2;
        } else {
            fish_x = MyFish.x + MyFish.width;
            fish_y = MyFish.y + MyFish.height / 2;
        }


        for (var i = 0; i < marines_.length; i++) {
            mr = marines_[i];

            if (mr.left < fish_x && fish_x < mr.left + mr.width &&
                mr.top < fish_y && fish_y < mr.top + mr.height) {
                if (mr.value <= MyFish.value) {
                    if (mr.value == 1) {
                        cur_score += 2;
                        fishScore += 2;
                    } else if (mr.value == 2) {
                        cur_score += 3;
                        fishScore += 3;
                    } else if (mr.value == 3) {
                        cur_score += 5;
                        fishScore += 5;
                    } else {
                        cur_score += 5;
                        fishScore += 5;
                    }
                    marines_.splice(i, 1);
                } else {
                    MyFish.lostHeart(cur_value);
                    MyNoti.lostHeart();
                    MyHeart.heart--;

                    if (MyHeart.heart < 0) {
                        isGameOver = true;
                    }

                    return;
                }
            }
        }

        while (marines_.length <= marines_number) {
            MyMarines.add(MyFish.value);
        }

        //
        if (cur_value != 1 && 0 <= cur_score && cur_score < score_to_level_2) {
            cur_value = 1;
            console.log('level 1');
        }
        if (cur_value != 2 && score_to_level_2 <= cur_score && cur_score < score_to_level_3) {
            cur_value = 2;
            MyHeart.heart = 3;
            MyNoti.levelUp();
            MyFish.width = 120;
            MyFish.height = 60;
            marines_number = base_marines_number + 1;
            console.log('level 2');
        }
        if (cur_value != 3 && score_to_level_3 <= cur_score) {
            cur_value = 3;
            MyHeart.heart = 3;
            MyNoti.levelUp();
            MyFish.width = 150;
            MyFish.height = 90;
            marines_number = base_marines_number + 2;
            console.log('level 3');
        }

        if (cur_score >= score_to_win) {
            isWin = true;
        }

        // UI
        MyFish.value = cur_value;
        MyScore.score = cur_score;
        MyProgressBar.value = cur_score;
    },
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// event
function setMousePosition(e) {

    var mouse_x = e.clientX;
    var mouse_y = e.clientY;

    if (global_mouse_x < mouse_x) {
        MyFish.direction = 'R';
        document.getElementById('cursorID').src = 'images/fish_right.gif'
    } else {
        MyFish.direction = 'L';
        document.getElementById('cursorID').src = 'images/fish_left.gif'
    }

    global_mouse_x = mouse_x;
    global_mouse_y = mouse_y;

    if (global_mouse_x < canvas_left) {
        global_mouse_x = canvas_left - 1;
    }

    if (global_mouse_x > canvas_right) {
        global_mouse_x = canvas_right + 1;
    }

    if (global_mouse_y < canvas_top) {
        global_mouse_y = canvas_top - 1;
    }

    if (global_mouse_y > canvas_bottom) {
        global_mouse_y = canvas_bottom + 1;
    }

    document.getElementById('cursorID').width = MyFish.width;
    document.getElementById('cursorID').style.left = (global_mouse_x) + 'px';
    document.getElementById('cursorID').style.top = (global_mouse_y) + 'px';
}

document.addEventListener("mousemove", setMousePosition, false);

function changeScreenSize() {
    console.log('changeScreenSize');
}
window.addEventListener("resize", changeScreenSize); // đúng rồi
document.onkeypress = function(e) {
    e = e || window.event;
    if (e.keyCode == 112) { // P key
        if (isPause) {
            isPause = false;
            update();
        } else {
            isPause = true;
            MyNoti.pause();
        }
    }

    if (e.keyCode == 109){
        var my_audio = document.getElementById("game-audio");
        if (!my_audio.paused){
            document.getElementById("game-audio").pause();
        } else {
            document.getElementById("game-audio").play();
        }
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// init data
function init() {
    MyCanvas.init();
    MyFish.init();
    MyScore.score = 0;
    MyHeart.heart = 3;
    marines_number = base_marines_number;
    MyProgressBar.init();

    isPause = false;
    isWin = false;
    isGameOver = false;


    while (marines_.length > 0) {
        marines_.pop();
    }

    while (marines_.length < marines_number) {
        MyMarines.add(MyFish.value);
    }

    console.log('init');
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// update


function beforeupdate() {
    MyFish.x = global_mouse_x + trans_x;
    MyFish.y = global_mouse_y + trans_y;

    if (MyFish.x < background_left) {
        MyFish.x = background_left;
    }

    if (MyFish.x > background_right) {
        MyFish.x = background_right;
    }

    if (MyFish.y < background_top) {
        MyFish.y = background_top;
    }

    if (MyFish.y > background_bottom) {
        MyFish.y = background_bottom;
    }

    if (global_mouse_x < canvas_left) {
        trans_x -= trans_value;
    }

    if (global_mouse_x > canvas_right) {
        trans_x += trans_value;
    }

    if (global_mouse_y < canvas_top) {
        trans_y -= trans_value;
    }

    if (global_mouse_y > canvas_bottom) {
        trans_y += trans_value;
    }

    trans_x = (trans_x < 0) ? 0 : trans_x;
    trans_y = (trans_y < 0) ? 0 : trans_y;

    trans_x = (trans_x > trans_x_max) ? trans_x_max : trans_x;
    trans_y = (trans_y > trans_y_max) ? trans_y_max : trans_y;
}

function update() {

    // draw background
    // var background = new Image();
    // background.src = "images/background_level1.jpg";
    context_render.drawImage(background, 0, 0);
    beforeupdate();

    // context_render.clearRect(0, 0, canvas_main.width, canvas_main.height);

    MyCheck.outOfRange();
    MyCheck.collision();

    MyMarines.update();
    MyMarines.draw();

    MyFish.draw();
    MyScore.draw();
    MyHeart.draw();
    MyNoti.draw();
    MyProgressBar.draw();

    context_main.drawImage(canvas_render, trans_x, trans_y, MyCanvas.canvas_width, MyCanvas.canvas_height,

        0, 0, MyCanvas.canvas_width, MyCanvas.canvas_height);

    if (isWin) {
        showLevelSummary();
        return;
    }

    if (isGameOver) {
        showLevelSummary();
        return;
    }

    if (!isPause) {
        requestAnimationFrame(update);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// run
background.src = "images/background_level1.jpg";

background.onload = function() {
    init();
    bindEducationUI();
    update();
}

// ---------------------------
// Learning + account helpers
// ---------------------------
function persistData() {
    localStorage.setItem('ff-user-data', JSON.stringify(userData));
}

function loadUserData() {
    var cached = localStorage.getItem('ff-user-data');
    if (cached) {
        userData = JSON.parse(cached);
        return;
    }
    fetch('data/users.json').then(function(res) { return res.json(); }).then(function(json) {
        userData = json;
    }).catch(function() {
        userData = { users: [], scores: {}, vocabStats: {} };
    });
}

function renderVocabOptions() {
    var container = document.getElementById('vocab-options');
    container.innerHTML = '';
    Object.keys(DEFAULT_VOCAB_SETS).forEach(function(key) {
        var label = document.createElement('label');
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.value = key;
        label.appendChild(input);
        var span = document.createElement('span');
        span.textContent = key + ' (' + DEFAULT_VOCAB_SETS[key].length + ' từ)';
        label.appendChild(span);
        container.appendChild(label);
    });
}

function toggleTabs(showRegister) {
    document.getElementById('login-form').classList.toggle('hidden', showRegister);
    document.getElementById('register-form').classList.toggle('hidden', !showRegister);
    document.getElementById('login-tab').classList.toggle('active', !showRegister);
    document.getElementById('register-tab').classList.toggle('active', showRegister);
}

function showOverlay(id) {
    ['auth-screen', 'vocab-menu', 'question-modal', 'level-summary'].forEach(function(key) {
        var element = document.getElementById(key);
        if (!element) return;
        element.classList.toggle('hidden', key !== id);
    });
}

function buildWordPool() {
    var combined = [];
    selectedSets.forEach(function(setName) {
        var words = DEFAULT_VOCAB_SETS[setName] || [];
        words.forEach(function(entry) {
            combined.push(Object.assign({}, entry));
        });
    });
    return combined;
}

function getStatKey(word) {
    return (activeUser || 'guest') + '::' + word;
}

function nextQuizWord(wordPool) {
    if (askedWords.length >= wordPool.length) {
        askedWords = [];
    }

    var mastered = wordPool.filter(function(item) {
        var key = getStatKey(item.word);
        var count = userData.vocabStats[key] || 0;
        return count >= 10;
    });
    var learning = wordPool.filter(function(item) {
        var key = getStatKey(item.word);
        var count = userData.vocabStats[key] || 0;
        return count > 0 && count < 10;
    });
    var unseen = wordPool.filter(function(item) {
        var key = getStatKey(item.word);
        return !userData.vocabStats[key];
    });

    quizIndex++;
    if (quizIndex > 10) quizIndex = 1;

    function pick(candidates) {
        var filtered = candidates.filter(function(item) { return askedWords.indexOf(item.word) === -1; });
        if (filtered.length === 0) { return null; }
        return filtered[Math.floor(Math.random() * filtered.length)];
    }

    var choice = null;
    if (quizIndex === 1) {
        choice = pick(unseen) || pick(learning) || pick(mastered);
    } else if (quizIndex >= 2 && quizIndex <= 8) {
        choice = pick(learning) || pick(unseen) || pick(mastered);
    } else {
        choice = pick(mastered) || pick(learning) || pick(unseen);
    }

    if (!choice) {
        choice = wordPool[Math.floor(Math.random() * wordPool.length)];
    }
    askedWords.push(choice.word);
    return choice;
}

function renderQuestion() {
    var pool = buildWordPool();
    if (pool.length === 0) {
        document.getElementById('question-word').textContent = 'Chưa chọn bộ từ vựng';
        document.getElementById('answer-options').innerHTML = '';
        return;
    }
    var current = nextQuizWord(pool);
    var optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = '';
    var distractors = pool.filter(function(item) { return item.word !== current.word; });
    distractors = distractors.sort(function() { return 0.5 - Math.random(); }).slice(0, 2);
    var answers = distractors.concat([current]).sort(function() { return 0.5 - Math.random(); });
    document.getElementById('question-word').textContent = current.word;
    answers.forEach(function(ans, index) {
        var button = document.createElement('button');
        button.textContent = String.fromCharCode(65 + index) + '. ' + ans.meaning;
        button.onclick = function() {
            handleAnswer(ans.word === current.word, current.word);
        };
        optionsContainer.appendChild(button);
    });
    document.getElementById('question-feedback').textContent = '';
    showOverlay('question-modal');
}

function handleAnswer(isCorrect, word) {
    var key = getStatKey(word);
    userData.vocabStats[key] = userData.vocabStats[key] || 0;
    if (isCorrect) {
        userData.vocabStats[key] += 1;
        quizScore += 10;
        MyScore.score += 10;
        document.getElementById('question-feedback').textContent = 'Chính xác! +10 điểm';
        scheduleNextQuestion(10000);
    } else {
        if (userData.vocabStats[key] > 0) {
            userData.vocabStats[key] -= 1;
        }
        MyScore.score = Math.max(0, MyScore.score - 5);
        quizScore = Math.max(0, quizScore - 5);
        document.getElementById('question-feedback').textContent = 'Sai rồi! -5 điểm';
        scheduleNextQuestion(5000);
    }
    MyProgressBar.value = MyScore.score;
    persistData();
}

function scheduleNextQuestion(delay) {
    showOverlay(null);
    if (quizTimer) {
        clearTimeout(quizTimer);
    }
    quizTimer = setTimeout(function() {
        renderQuestion();
    }, delay);
}

function startQuizCycle() {
    askedWords = [];
    quizIndex = 0;
    renderQuestion();
}

function saveHighScore(level, totalScore) {
    if (!activeUser) return;
    if (!userData.scores[level]) {
        userData.scores[level] = {};
    }
    var prev = userData.scores[level][activeUser];
    if (!prev || totalScore > prev) {
        userData.scores[level][activeUser] = totalScore;
        persistData();
    }
}

function renderLeaderboard(level) {
    var board = document.getElementById('leaderboard');
    board.classList.remove('hidden');
    var scores = userData.scores[level] || {};
    var entries = Object.keys(scores).map(function(name) { return { name: name, score: scores[name] }; });
    entries.sort(function(a, b) { return b.score - a.score; });
    entries = entries.slice(0, 10);
    var html = '<table><thead><tr><th>Hạng</th><th>Người chơi</th><th>Điểm</th></tr></thead><tbody>';
    entries.forEach(function(item, idx) {
        html += '<tr><td>' + (idx + 1) + '</td><td>' + item.name + '</td><td>' + item.score + '</td></tr>';
    });
    html += '</tbody></table>';
    board.innerHTML = html;
}

function showLevelSummary() {
    if (hasShownSummary) return;
    hasShownSummary = true;
    isPause = true;
    var bonus = Math.max(0, MyHeart.heart) * 20;
    var total = MyScore.score + bonus;
    document.getElementById('fish-score').textContent = 'Điểm ăn cá: ' + fishScore;
    document.getElementById('bonus-score').textContent = 'Điểm bonus: ' + bonus;
    document.getElementById('total-score').textContent = 'Tổng điểm: ' + total;
    var levelKey = 'level_' + MyFish.value;
    saveHighScore(levelKey, total);
    showOverlay('level-summary');
}

function startGameFlow() {
    isPause = false;
    hasShownSummary = false;
    fishScore = 0;
    quizScore = 0;
    MyScore.score = 0;
    MyHeart.heart = 3;
    update();
    startQuizCycle();
}

function bindEducationUI() {
    loadUserData();
    renderVocabOptions();
    showOverlay('auth-screen');
    document.getElementById('login-tab').onclick = function() { toggleTabs(false); };
    document.getElementById('register-tab').onclick = function() { toggleTabs(true); };
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var username = document.getElementById('login-username').value.trim();
        var password = document.getElementById('login-password').value;
        var user = userData.users.find(function(u) { return u.username === username && u.password === password; });
        if (user) {
            activeUser = username;
            document.getElementById('login-message').textContent = '';
            showOverlay('vocab-menu');
        } else {
            document.getElementById('login-message').textContent = 'Tên đăng nhập hoặc mật khẩu chưa đúng';
        }
    });

    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        var username = document.getElementById('register-username').value.trim();
        var password = document.getElementById('register-password').value;
        var confirm = document.getElementById('register-password-confirm').value;
        if (!username || !password) {
            document.getElementById('register-message').textContent = 'Vui lòng nhập đủ thông tin';
            return;
        }
        if (password !== confirm) {
            document.getElementById('register-message').textContent = 'Mật khẩu không khớp';
            return;
        }
        var existed = userData.users.some(function(u) { return u.username === username; });
        if (existed) {
            document.getElementById('register-message').textContent = 'Tên đăng nhập đã tồn tại';
            return;
        }
        userData.users.push({ username: username, password: password });
        persistData();
        document.getElementById('register-message').textContent = 'Đã tạo tài khoản thành công';
        document.getElementById('login-username').value = username;
        toggleTabs(false);
    });

    document.getElementById('start-game').onclick = function() {
        selectedSets = [];
        document.querySelectorAll('#vocab-options input[type="checkbox"]').forEach(function(input) {
            if (input.checked) {
                selectedSets.push(input.value);
            }
        });
        if (selectedSets.length === 0) {
            selectedSets = Object.keys(DEFAULT_VOCAB_SETS);
        }
        showOverlay(null);
        startGameFlow();
    };

    document.getElementById('logout').onclick = function() {
        activeUser = null;
        showOverlay('auth-screen');
    };
    document.getElementById('logout-end').onclick = function() {
        activeUser = null;
        showOverlay('auth-screen');
    };
    document.getElementById('back-to-menu').onclick = function() {
        showOverlay('vocab-menu');
    };
    document.getElementById('next-level').onclick = function() {
        showOverlay(null);
        isPause = false;
        update();
    };
    document.getElementById('view-leaderboard').onclick = function() {
        renderLeaderboard('level_' + MyFish.value);
    };
}

