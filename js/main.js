// マス目の定数
var Constants = {
    'squares':6,
    'size':100,
    'subRoutinSquares':4
}

//移動時間
var MoveDuration = {
    'forward':2000,
    'turn':2000
}

//移動コマンド
var Move = {
    'forward':1,
    'left':2,
    'right':3,
    'function':4
}
//パーツ上限値
var UsedMax = {
    'forward':4,
    'left':4,
    'right':4,
    'function':4
}

//方向（反時計周り）
var Direction = {
    'Up':1,
    'Left':2,
    'Right':4,
    'Down':3
}
//方向(時計回り)
var RightDirection = {
    'Up':1,
    'Left':4,
    'Right':2,
    'Down':3
}

//状態
var State = {
    'init':1,
    'startPosition':1,
    'endPostion':2,
    'makeCommand':3,
    'started':4
}

//状態管理変数
var stateFlag = null;

//行動リスト
var moveList = [];

//サブルーチン用行動リスト
var routinList = [];

//自キャラの座標
var positionX = 0;
var positionY = 0;

//自キャラの位置
var gridX = 0;
var gridY = 0;

//自キャラの向き 初期は上向き
var direction = Direction.Up;

//左右判定変数
var leftAndRight = 0;
//パーツ使用回数
var forwardCount = 0;
var leftCount = 0;
var rightCount = 0;
var functionCount = 0;

//サブルーチンリスト最大サイズ
var routinListMaxSize =4; 



//初期化処理
function init(){

    //移動コマンドリストを初期化
    moveList = [];

    //サブルーチン用リスト初期化
    routinList = [];

    //マス目を描画
    makeGrid();
    
    //ボタンにイベントを設定
    addEvent();

    //画面の準備ができたらスタート位置決めフラグに変更
    stateFlag = State.startPosition;

    //初期の向きを上に設定
    direction = Direction.Up;
}

//UIの初期化
function addEvent(){
    $( '#jquery-ui-sortable' ) . disableSelection();
    $( '#subRoutin' ) . disableSelection();
    $( '#subRoutinList' ) . sortable({
        update: function (ev, ui) {
            var result = $(this).sortable("toArray");
            console.log(result);
            $("#result").html(result.join(','));
        }
    });
    $( '#jquery-ui-sortable' ) . sortable({
        update: function (ev, ui) {
            var result = $(this).sortable("toArray");
            console.log(result);
            $("#result").html(result.join(','));
        }
    });
    $("#trash").droppable({
        hoverClass: 'ui-state-hover',
        drop: function( event, ui ){
            if(stateFlag === State.makeCommand) {       
                //行動を取得
                var moveAction = ui.draggable.attr("id");
                var point = moveAction.indexOf("/");
                if(point == -1) {
                　　　//インデックスを取得
                    var index = ui.draggable.attr("name");
                    //行動に応じて使用回数を1減らす
                    if(moveAction == Move.forward) {
                        forwardCount = forwardCount - 1;
                    } else if(moveAction == Move.left) {
                        leftCount = leftCount - 1;
                    } else if(moveAction == Move.right) {
                        rightCount = rightCount - 1;
                    } else if(moveAction == Move.function) {
                        functionCount = functionCount - 1;
                    }
                    //リストから該当箇所を削除
                    moveList.splice(index,1);
                    ui.draggable.remove();
                } else {
                    var moveRoutinAction = moveAction.split("/");
                    //行動に応じて使用回数を1減らす
                    if(moveRoutinAction[0] == Move.forward) {
                        forwardCount = forwardCount - 1;
                    } else if(moveRoutinAction[0] == Move.left) {
                        leftCount = leftCount - 1;
                    } else if(moveRoutinAction[0] == Move.right) {
                        rightCount = rightCount - 1;
                    } 
                    //リストから該当箇所を削除
                    routinList.splice(moveRoutinAction[1],1);
                    ui.draggable.remove();
                    subRoutinCommand();

                }
            }
        }
    });
    $('#forward').bind('click',function(){
        if(stateFlag === State.makeCommand){
            //使用回数が最大でない場合
            if(forwardCount < UsedMax.forward){
            	//メインリストに15個のパーツをセットしている場合
                if(forwardCount == 3 && leftCount == UsedMax.left && rightCount == UsedMax.right && functionCount == UsedMax.function){
                    alert("リストの最大値を超えています");
                    return;
                }
                moveList.push(Move.forward);
                forwardCount = forwardCount + 1;
            } else{
                alert("パーツ使用上限に達しています！！");
            }
            resetCommand();
        }
    });
    $('#right').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            //使用回数が最大でない場合
            if(rightCount < UsedMax.right){
                //メインリストに15個のパーツをセットしている場合
                if(forwardCount == UsedMax.forward && leftCount == UsedMax.left && rightCount == 3 && functionCount == UsedMax.function){
                    alert("リストの最大値を超えています");
                    return;
                }
                moveList.push(Move.right);
                rightCount = rightCount +1;
            }else{
                alert("パーツ使用上限に達しています！！");
            }
            resetCommand();
        }
    });
    $('#left').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            //使用回数が最大でない場合
            if(leftCount < UsedMax.left){
                //メインリストに15個のパーツをセットしている場合
                if(forwardCount == UsedMax.forward && leftCount == 3 && rightCount == UsedMax.right && functionCount == UsedMax.function){
                    alert("リストの最大値を超えています");
                    return;
                }
                moveList.push(Move.left);
                leftCount = leftCount +1;
            }else{
                alert("パーツ使用上限に達しています！！");
            }
            resetCommand();
        }
            
    });
    $('#function').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            //使用回数が最大でない場合
            if(functionCount < UsedMax.function){
                //メインリストに15個のパーツをセットしている場合
                if(forwardCount == UsedMax.forward && leftCount == UsedMax.left && rightCount == UsedMax.right && functionCount == 3){
                    alert("リストの最大値を超えています");
                    return;
                }
                moveList.push(Move.function);
                functionCount = functionCount + 1;
            } else {
                alert("パーツ使用上限に達しています！！");
            }
            resetCommand();
        }
    });
    //前進追加処理
     $('#forwardRoutin').bind('click',function(){
        if(stateFlag === State.makeCommand){
            //サブルーチンリストが最大値以下の場合（4以下）
            if(routinList.length < routinListMaxSize){
                //パーツ使用回数が最大でない場合
                if(forwardCount < UsedMax.forward){
                    routinList.push(Move.forward);
                    forwardCount = forwardCount + 1;
                    subRoutinCommand();
                } else {
                    alert("パーツ使用上限に達しています！！");
                }  
            } else {
                alert("リストの最大値を超えています");
            }
            subRoutinCommand();
        }
    });
    

    //右回転追加処理
    $('#rightRoutin').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            //サブルーチンリストが最大値以下の場合（4以下）
            if(routinList.length < routinListMaxSize){
                //パーツ使用回数が最大でない場合
                if(rightCount < UsedMax.right){
                    routinList.push(Move.right);
                    rightCount = rightCount +1;
                    subRoutinCommand();
                } else {
                    alert("パーツ使用上限に達しています！！");
                }
            }else {
                alert("リストの最大値を超えています");
            }
            subRoutinCommand();
        }
    });
    //左回転追加処理
    $('#leftRoutin').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            //サブルーチンリストが最大値以下の場合（4以下）
            if(routinList.length < routinListMaxSize){
                //パーツ使用回数が最大でない場合
                if(leftCount < UsedMax.left){
                    routinList.push(Move.left);
                    leftCount = leftCount +1;
                    subRoutinCommand();
                } else {
                    alert("パーツ使用上限に達しています！！");
                }
            }else{
                alert("リストの最大値を超えています");   
            }
            subRoutinCommand();
        }
            
    });
    
    $('#start').bind('click',function(){
        if(stateFlag === State.makeCommand) {
            stateFlag = State.started
            moveProcess();
        }
    });
}

//実際に行動させる
function moveProcess(){
    for (var command in moveList){
        switch (moveList[command]){
            case Move.forward:
                if (direction == Direction.Up) {
                    moveUp(gridX * 100,(gridY * 100) - 100);
                    gridY--;
                }
                if (direction == Direction.Down) {
;                    moveDown(gridX * 100,(gridY * 100)-100);
                    gridY++;
                }
                if (leftAndRight == 1){
                    if (direction == Direction.Right) {
                        moveRight((gridX * 100) - 100,(gridY * 100));
                        gridX++;
                    }
                    if (direction == Direction.Left) {
                        moveLeft((gridX * 100) - 100,(gridY * 100));
                        gridX--;
                    }
                }
                if (leftAndRight == 2){
                    if (direction == RightDirection.Right) {
                        moveRight((gridX * 100) - 100,(gridY * 100));
                        gridX++;
                    }
                    if (direction == RightDirection.Left) {
                        moveLeft((gridX * 100) - 100,(gridY * 100));
                        gridX--;
                    }
                }
                
                break;
            case Move.left:
                leftAndRight = 1;
                turnLeft();
                if (direction == Direction.Up) {
                    direction = Direction.Left;
                } else if ( direction == Direction.Down ){
                    direction = Direction.Right;
                } else if ( direction == Direction.Right ){
                    direction = Direction.Up;
                } else if ( direction == Direction.Left ){
                    direction = Direction.Down;
                }
                break;
            case Move.right:
                leftAndRight = 2;
                turnRight();
                if (direction == RightDirection.Up) {
                    direction = RightDirection.Right;
                } else if ( direction == RightDirection.Down ){
                    direction = RightDirection.Left;
                } else if ( direction == RightDirection.Right ){
                    direction = RightDirection.Down;
                } else if ( direction == RightDirection.Left ){
                    direction = RightDirection.Up;
                }
                break;
            //サブルーチン実行
            case Move.function:
                for (var command in routinList){
                    switch (routinList[command]){
                        case Move.forward:
                            if (direction == Direction.Up) {
                                moveUp(gridX * 100,(gridY * 100) - 100);
                                gridY--;
                            }
                            if (direction == Direction.Down) {
                                moveDown(gridX * 100,(gridY * 100) - 100);
                                gridY++;
                            }
                            if (leftAndRight == 1){
                                if (direction == Direction.Right) {
                                    moveRight((gridX * 100) - 100,(gridY * 100));
                                    gridX++;
                                }
                                if (direction == Direction.Left) {
                                    moveLeft((gridX * 100) - 100,(gridY * 100));
                                    gridX--;
                                }
                            }
                            if (leftAndRight == 2){
                                if (direction == RightDirection.Right) {
                                    moveRight((gridX * 100) - 100,(gridY * 100));
                                    gridX++;
                                }
                                if (direction == RightDirection.Left) {
                                    moveLeft((gridX * 100) - 100,(gridY * 100));
                                    gridX--;
                                }
                            }
                            break;
                        case Move.left:
                            turnLeft();
                            if(leftAndRight != 0){
                                if (direction == Direction.Up) {
                                    direction = Direction.Left;
                                } else if ( direction == Direction.Down){
                                    direction = Direction.Right;
                                } else if ( direction == Direction.Right && leftAndRight == 1 ){
                                    direction = Direction.Up;
                                } else if ( direction == RightDirection.Right && leftAndRight == 2 ){
                                    direction = Direction.Up;
                                    turnLeft();
                                } else if ( direction == Direction.Left && leftAndRight == 1 ){
                                    direction = Direction.Down;
                                } else if ( direction == RightDirection.Left && leftAndRight == 2 ){
                                    direction = Direction.Up;
                                    turnLeft();
                                }
                            }else{
                                direction = Direction.Left;
                            }
                            leftAndRight = 1;
                            break;
                        case Move.right:
                            turnRight();
                            if(leftAndRight != 0){
                                if (direction == Direction.Up) {
                                    direction = RightDirection.Right
                                } else if ( direction == Direction.Down){
                                    direction = RightDirection.Left
                                } else if ( direction == Direction.Right && leftAndRight == 1 || direction == RightDirection.Right && leftAndRight == 2 ){
                                    direction = RightDirection.Down
                                } else if ( direction == Direction.Left && leftAndRight == 1 || direction == RightDirection.Left && leftAndRight == 2 ){
                                    direction = RightDirection.Up
                                }
                            }else{
                                direction = RightDirection.Right;
                            }
                            leftAndRight = 2;
                            break;
                    }
                }
         break;
        }
    }
}

function resetCommand() {
    //リスト内インデックス
    var positionId = 0;
    $('#jquery-ui-sortable').empty();
    for (var id in moveList) {
        switch (moveList[id]) {
            case Move.forward:
                $('#jquery-ui-sortable').append('<li name="' + positionId + '"id="' + Move.forward + '" class="ui-state-default"><img class="thumbnail" src="img/forward.png"></li>');
                positionId = positionId + 1;
                break;
            case Move.left:
                $('#jquery-ui-sortable').append('<li name="' + positionId + '"id="' + Move.left + '" class="ui-state-default"><img class="thumbnail" src="img/left.png"></li>');
                positionId = positionId + 1;
                break;
            case Move.right:
                $('#jquery-ui-sortable').append('<li name="' + positionId + '"id="' + Move.right + '" class="ui-state-default"><img class="thumbnail" src="img/right.png"></li>');
                positionId = positionId + 1;
                break;
            case Move.function:
                $('#jquery-ui-sortable').append('<li name="' + positionId +'"id="' + Move.function + '" class="ui-state-default"><img class="thumbnail" src="img/function.png"></li>');
                positionId = positionId + 1;
                break;
        }
    }

    $('#jquery-ui-sortable').sortable('refresh');
}

//サブルーチンコマンド表示
function subRoutinCommand(){
    var routinPositionId = 0;
    $('#subRoutinList').empty();
    $('#subRoutinList').append('<tr>');
     $('#subRoutinList').append('<th bgcolor="#ffff00"><font color="black">|-1-|</font></th>');
     $('#subRoutinList').append('<th bgcolor="#ffff00"><font color="black">|-2-|</font></th>');
     $('#subRoutinList').append('<th bgcolor="#ffff00"><font color="black">|-3-|</font></th>');
     $('#subRoutinList').append('<th bgcolor="#ffff00"><font color="black">|-4-|</font></th>');
     $('#subRoutinList').append('</tr>');
     $('#subRoutinList').append('<tr>');
    for (var id in routinList) {
        switch (routinList[id]) {
            case Move.forward:
                $('#subRoutinList').append('<td id="' + Move.forward + "/" + routinPositionId + '"class="ui-state-default"><img class="thumbnail" src="img/forward.png"></td>')
                routinPositionId = routinPositionId + 1;
                break;
            case Move.left:
                $('#subRoutinList').append('<td id="' + Move.left + "/" + routinPositionId + '"class="ui-state-default"><img class="thumbnail" src="img/left.png"></td>')
                routinPositionId = routinPositionId + 1;
                break;
            case Move.right:
                $('#subRoutinList').append('<td id="' + Move.right + "/" + routinPositionId + '"class="ui-state-default"><img class="thumbnail" src="img/right.png"></td>')
                routinPositionId = routinPositionId + 1;
                break;
        }
    }
    $('#subRoutinList').append('</tr>');
    $('#subRoutinList').sortable('refresh');
}

//再読み込み
function reload(){
    location.reload();
}

function makeGrid(){

    var clear = 0;
    var line = 1;
    var count = 1;

    //マス目を描画する
    for(var l = 0;l<Constants.squares;l++) {
        for (var i = 0; i < Constants.squares; i++) {
            if (clear === 0) {
                $('#map').append('<div class="line" id="line' + line + '"></div>');
            }
            if (clear < Constants.squares) {
                $('#line' + line).append('<div id="box' + count + '-' + line + ' " class="block"></div>');
                clear++;
            }
            count++;
        }
        clear = 0;
        count = 1;
        line++;
    }

    $('.block').bind('click',function(){
        if(stateFlag === State.endPostion){
            var rect = $(this).offset() ;
            $('#home').css('top', rect.top);
            $('#home').css('left', rect.left);
            $('#home').css('display','block');
            stateFlag = State.makeCommand
        }
    });
    $('.block').bind('click',function(){
        if(stateFlag === State.startPosition){
            var rect = $(this).offset() ;
            $('#utan').css('top', rect.top);
            $('#utan').css('left', rect.left);
            $('#utan').css('display','block');

            gridX = $(this).attr('id').replace("box","").split("-")[0];
            gridY = $(this).attr('id').replace("box","").split("-")[1];
            stateFlag = State.endPostion;
        }
    });
    //描画するマス目1このサイズを定数で指定
    $('.block').css('width',Constants.size - 2);
    $('.block').css('height',Constants.size - 2);
}

function turnLeft(){
    $('#utan').animate(
        {'z-index': direction},
        {	
            duration: 3000,
            step: function (num) {
                $(this).css({
                    transform: 'rotate(' + (num * -90) + 'deg)'
                });
            },
/*            complete: function () {
                $('#utan').css('z-idex', 0);
            }
*/
        }
    );

}

function turnRight(){
    $('#utan').animate(
        {'z-index': direction},
        {
            duration: 3000,
            step: function (num) {
                $(this).css({
                    transform: 'rotate(' + (num * +90) + 'deg)'
                });
            },
/*            complete: function () {
                $('#utan').css('z-index', 0);
            }
*/
        }
    );
}

function moveUp(x,y){
    positionX = x;
    positionY = y - Constants.size;
    //マップ外（上側）へ出る場合
    if(positionY < 0){
        alert("開始アイコンが画面外へ出てしまいます。やり直してください。");
        javascript_die;
    }
    $('#utan').animate(
        {'top': positionY + 'px'},
        {duration: MoveDuration.forward}
    );
}
function moveDown(x,y){
    positionX = x;
    positionY = y + Constants.size;
    //マップ外（下側）へ出る場合
    if(positionY > 500){
        alert("開始アイコンが画面外へ出てしまいます。やり直してください。");
        javascript_die;
    }
    $('#utan').animate(
        {'top': positionY + 'px'},
        {duration: MoveDuration.forward}
    );
}
function moveRight(x,y){
    positionX = x + Constants.size;
    positionY = y;
    //マップ外（右側）へ出る場合
    if(positionX > 500){
        alert("開始アイコンが画面外へ出てしまいます。やり直してください。");
        javascript_die;
    }
    $('#utan').animate(
        {'left': positionX + 'px'},
        {duration: MoveDuration.forward}
    );
}
function moveLeft(x,y){
    positionX = x - Constants.size;
    positionY = y;
    //マップ外（左側）へ出る場合
    if(positionX < 0){
        alert("開始アイコンが画面外へ出てしまいます。やり直してください。");
        javascript_die;
    }
    $('#utan').animate(
        {'left': positionX + 'px'},
        {duration: MoveDuration.forward}
    );
}
