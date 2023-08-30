<!-- Board definitions.
    Copyright (C) 2023 Hideaki Sakai
    
    This file is part of Expanded-Shogi-Board.
    
    Expanded-Shogi-Board is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Expanded-Shogi-Board is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Expanded-Shogi-Board.  If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import * as board from './boardCommon'
import KomaSymbols from './KomaSymbols.vue'
import { ref, onMounted, onBeforeMount } from 'vue'
import type { Ref } from 'vue'

// 右クリックメニューのクラス
class RightClickMenu {
    display: Ref<boolean> = ref(false);
    masu: board.Masu | null = null;
    x: Ref<number> = ref(0);
    y: Ref<number> = ref(0);
    komaSengoGyaku: board.Koma | null = null; // 右クリックした駒を先後逆にした駒 (koma)
    komaSengoGyakuId: Ref<string> = ref(""); // 先後逆にした駒の symbolid
    komaUra: board.Koma | null = null; // 右クリックした駒を裏返した駒 (koma)
    komaUraId: Ref<string> = ref(""); // 裏側にした駒の symbolid
    komaHasUra: Ref<boolean> = ref(true); // 裏側がある駒かどうか

    constructor() {
    }

    // メニューの位置とマスと駒をセットする。
    set(targetElem: HTMLElement, masu: board.Masu, koma: board.Koma) {
        this.x.value = Number(targetElem.getAttribute("x")) + 100 + 140;
        this.y.value = Number(targetElem.getAttribute("y")) - 10 + 40;

        this.masu = masu;

        // 先後逆にした駒の symbolid をセット
        this.komaSengoGyaku = koma.getCopy();

        // 操作モードでは、そのままの駒を表示する
        if (editFlag.value) {
            this.komaSengoGyaku.toSengoGyaku();
        }

        this.komaSengoGyakuId.value = this.komaSengoGyaku.getSymbolid();

        // 裏側のある駒ならば、裏にした駒の symbolid をセット
        // 王と玉を変更できるようにする
        this.komaHasUra.value = (koma.hasUra() || (koma.getName() == "王") || (koma.getName() == "玉"));
        if (this.hasUra()) {
            this.komaUra = koma.getCopy();

            if (koma.hasUra()) {
                this.komaUra.toUra();
            } else if (koma.getName() == "王") {
                this.komaUra.setName("玉");
            } else if (koma.getName() == "玉") {
                this.komaUra.setName("王");
            }

            this.komaUraId.value = this.komaUra.getSymbolid();
        }

        this.display.value = true; // メニューを表示する
    }

    // メニューを非表示にする
    hideMenu() {
        if (this.getDisplay()) {
            this.display.value = false;
        }
    }

    getDisplay() { return this.display.value; }
    getMasu() { return this.masu; }
    getX() { return this.x.value; }
    getY() { return this.y.value; }
    hasUra() { return this.komaHasUra.value; }

    getKomaSengoGyaku() { return this.komaSengoGyaku; }
    getKomaSengoGyakuId() { return this.komaSengoGyakuId.value; }

    getKomaUra() { return this.komaUra; }
    getKomaUraId() { return this.komaUraId.value; }
}

// 各クラスのインスタンス
const masuList = new board.MasuList();
const banKomaList = new board.BanKomaList();
const rightClickMenu = new RightClickMenu();
const moveList = new board.MoveList();

// 前のクリックをリセットする
function resetClickAll() {
    banKomaList.resetClick();
}

// 先手の駒台がクリックされたときの処理
function clickSenteKomadai() {
    if (editFlag.value && banKomaList.wasClicked()) {
        banKomaList.movePreClickBanKoma("senteMochiKoma");
    }

    resetClickAll();
}

// 後手の駒台がクリックされたときの処理
function clickGoteKomadai() {
    if (editFlag.value && banKomaList.wasClicked()) {
        banKomaList.movePreClickBanKoma("goteMochiKoma");
    }

    resetClickAll();
}

// 先手の駒台の持駒がクリックされたときの処理
function clickSenteMochiKoma(event: Event, index: number) {
    resetClickAll();
    banKomaList.newClickAtSenteIdx(event, index);
}

// 後手の駒台の持駒がクリックされたときの処理
function clickGoteMochiKoma(event: Event, index: number) {
    resetClickAll();
    banKomaList.newClickAtGoteIdx(event, index);
}

// 使わない駒置き場がクリックされたときの処理
function clickGomibako() {
    if (editFlag.value && banKomaList.wasClicked()) {
        banKomaList.movePreClickBanKoma("gomibako");
    }

    resetClickAll();
}

// 使わない駒置き場の駒がクリックされたときの処理
function clickGomibakoKoma(event: Event, index: number) {
    resetClickAll();
    banKomaList.newClickAtGomibakoIdx(event, index);
}

// マスがクリックされたときの処理
function clickMasu(event: Event, masu: board.Masu) {
    // ひとつ前にマスがクリックされていた場合
    if (banKomaList.wasClickedAt("ban")) {
        // 駒を移動 (駒を取った場合は、Move に含めて返される)
        const move = banKomaList.moveOnBan(masu);

        // 操作モードの場合
        if (!editFlag.value) {
            if (move) {
                moveList.add(move);

                // 成るか不成か確認する画面を表示
                if (move.canNari() && event.target) {
                    rightClickMenu.set(event.target as HTMLElement, masu, move.getAfterKoma());
                }
            }
        }

        banKomaList.resetClick();
    }
    // 持駒(先手、後手、使わない駒置き場)がクリックされていた場合
    else if (banKomaList.wasClicked()) {
        // 駒を移動
        const move = banKomaList.moveToBan(masu);
        if (!editFlag.value) {
            if (move) {
                moveList.add(move);
            }
        }

        banKomaList.resetClick();
    }
    // まだどこもクリックされていなかった場合
    else {
        banKomaList.newClickAtMasu(event, masu);
    }
}

// マスが右グリックされたときの処理
function rightClickMasu(event: Event, masu: board.Masu) {
    resetClickAll();

    // 編集モードでのみ有効 
    if (editFlag.value) {
        // クリックされたマス目に駒があればメニューを表示する
        const koma = banKomaList.getAtMasu(masu)?.getKoma();
        if (koma) {
            if (event.target) {
                rightClickMenu.set(event.target as HTMLElement, masu, koma);
            }
        }
    }
}

// 右クリックした駒を先後逆にする
function clickSetSengoGyaku() {
    const masu = rightClickMenu.getMasu();

    // 操作モードでは何もしない
    if (masu && editFlag.value) {
        banKomaList.toSengoGyaku(masu);
    }

    rightClickMenu.hideMenu();
}

// 右クリックした駒を裏返す
function clickSetUra() {
    const masu = rightClickMenu.getMasu();

    if (masu) {
        banKomaList.toUra(masu);

        if (!editFlag.value) {
            moveList.lastToNari();
        }
    }

    rightClickMenu.hideMenu();
}

// 履歴を進める
function forwardHistory() {
    const forwardMove = moveList.getForward();
    if (forwardMove) {
        banKomaList.moveForward(forwardMove);
    }
}

// 履歴を戻す
function backwardHistory() {
    const backwardMove = moveList.getBackward();
    if (backwardMove) {
        banKomaList.moveBackward(backwardMove);
    }
}

const viewBoxHeightEdit = 1110; // SVGの viewBox の高さ (編集モード)
const viewBoxHeightPlay = 1060; // SVGの viewBox の高さ (操作モード)
const viewBoxHeight = ref(viewBoxHeightEdit); // SVGの viewBox の高さ
const viewBoxWidth = 1190; // SVGの viewBox の幅 (幅は変化しない)
const boardWidth = ref("100%");  // 将棋盤の幅
const editFlag = ref(true); // 使わない駒置き場を表示するかどうか
const directionFlag = ref(true); // 盤を通常の向きにするか、先後逆にするか

// 編集モードに変更
function changeToEditMode() {
    if (!editFlag.value) {
        editFlag.value = true;
    }

    moveList.clear();
    viewBoxHeight.value = viewBoxHeightEdit;
}

// 操作モードに変更
function changeToPlayMode() {
    if (editFlag.value) {
        editFlag.value = false;
    }

    viewBoxHeight.value = viewBoxHeightPlay;
}

// svg の大きさをセットする
function setTopDivSize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minWH = (w < h) ? w : h;

    boardWidth.value = `${minWH}px`;
}

// 将棋盤全体を先後逆にする関数
function setDirection(flag: boolean) {
    directionFlag.value = flag;
}

// 筋の数字の配列を返す
function getSujiArray() {
    let sujiArray: number[] = [9, 8, 7, 6, 5, 4, 3, 2, 1];

    if (! directionFlag.value) {
        sujiArray.reverse();
    }

    return sujiArray;
}

// 段の数字の配列を返す
function getDanArray() {
    let danArray: string[] = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];

    if (! directionFlag.value) {
        danArray.reverse();
    }

    return danArray;
}

// コンポーネントがマウントされる直前に呼び出されるフックを登録
onBeforeMount(() => {
    banKomaList.setHirate();
})

// コンポーネントがマウントされた後に呼び出されるコールバックを登録
onMounted(() => {
    setTopDivSize();
    window.addEventListener('resize', setTopDivSize);
})

</script>
                    
<template>
    <KomaSymbols />

    <div class="container-fluid p-0">
        <div class="row">
            <div class="col text-center">
                <svg id="svg-board" :width="boardWidth" :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
                    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">

                    <defs>
                        <g id="stars" style="stroke: black; fill: black;">
                            <polygon points="0,-6 6,0 0,6 -6,0" />
                        </g>
                    </defs>

                    <rect x="0" y="0" :width="viewBoxWidth" :height="viewBoxHeight" style="fill: #8b968d;" />

                    <!-- 先手の持駒 -->
                    <g :transform="directionFlag ? 'translate(1080, 30)' : 'translate(10, 30)'">
                        <!-- 駒台全体 -->
                        <rect width="100" height="920" x="0" y="0" style="fill: #f7c167;" />
                        <rect @click="clickSenteKomadai" width="100" height="920" x="0" y="0" class="square" />

                        <use href="#Sente" x="20" y="-30" width="60" height="60" :transform="directionFlag ? '' : 'rotate(180, 50, 0)'"/>

                        <g transform="translate(10, 20)">
                            <!-- 持駒 -->
                            <use width="80" height="80" v-for="(k, idx) in banKomaList.getSenteMochiKomaList()"
                                :key="k.getKey()" x="0" :y="idx * 80 + 30" :href="k.getSymbolid()" />

                            <!-- 各持駒の個数 -->
                            <g id="nMochiKomaSente"
                                style="text-anchor: start; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                <text v-for="(k, idx) in banKomaList.getSenteMochiKomaList()" :key="k.getKey()" x="60"
                                    :y="idx * 80 + 100">{{
                                        k.getN() > 1 ? k.getN() : '' }}</text>
                            </g>

                            <!-- 持駒の場所のマス -->
                            <rect v-for="(k, idx) in banKomaList.getSenteMochiKomaList()"
                                @click="clickSenteMochiKoma($event, idx)" width="80" height="80" class="square"
                                :key="k.getKey()" x="0" :y="idx * 80 + 30" />
                        </g>
                    </g>

                    <!-- 後手の持駒 -->
                    <g :transform="directionFlag ? 'translate(10, 30)' : 'translate(1080, 30)'">
                        <!-- 駒台全体 -->
                        <rect width="100" height="920" x="0" y="0" style="fill: #f7c167;" />
                        <rect @click="clickGoteKomadai" width="100" height="920" class="square" x="0" y="0" />

                        <use href="#Gote" x="20" y="-30" width="60" height="60" :transform="directionFlag ? '' : 'rotate(180, 50, 0)'" />

                        <g transform="translate(10, 20)">
                            <!-- 持駒 -->
                            <use width="80" height="80" v-for="(k, idx) in banKomaList.getGoteMochiKomaList()"
                                :key="k.getKey()" x="0" :y="idx * 80 + 30" :href="k.getSymbolid()" />

                            <!-- 各持駒の個数 -->
                            <g id="nMochiKomaGote"
                                style="text-anchor: start; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                <text v-for="(k, idx) in banKomaList.getGoteMochiKomaList()" :key="k.getKey()" x="60"
                                    :y="idx * 80 + 100">{{
                                        k.getN() > 1 ? k.getN() : '' }}</text>
                            </g>

                            <!-- 持駒の場所のマス -->
                            <rect v-for="(k, idx) in banKomaList.getGoteMochiKomaList()"
                                @click="clickGoteMochiKoma($event, idx)" width="80" height="80" class="square"
                                :key="k.getKey()" x="0" :y="idx * 80 + 30" />
                        </g>
                    </g>

                    <!-- 使わない駒置き場 -->
                    <g v-if="editFlag" transform="translate(0, 980)">
                        <rect width="1190" height="130" style="fill: #8b968d;" />
                        <g transform="translate(130, 0)">
                            <rect width="920" height="100" style="fill: #f7c167;" />
                            <rect @click="clickGomibako" width="920" height="100" class="square" x="0" y="0" />

                            <!-- ゴミ箱アイコン -->
                            <use href="#Gomibako" x="-30" y="0" width="60" height="60" style="fill: #666666;" />

                            <g transform="translate(40, 0)">
                                <!-- 駒 -->
                                <use width="80" height="80" v-for="(k, idx) in banKomaList.getGomibakoList()"
                                    :key="k.getKey()" :x="idx * 80" y="10" :href="k.getSymbolid()" />

                                <!-- 各駒の個数 -->
                                <g
                                    style="text-anchor: middle; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                    <text v-for="(k, idx) in banKomaList.getGomibakoList()" :key="k.getKey()"
                                        :x="idx * 80 + 40" y="100">{{ k.getN() > 1 ? k.getN() : '' }}</text>
                                </g>

                                <!-- 駒の場所のマス -->
                                <rect v-for="(k, idx) in banKomaList.getGomibakoList()"
                                    @click="clickGomibakoKoma($event, idx)" width="80" height="80" class="square"
                                    :key="k.getKey()" :x="idx * 80" y="10" />
                            </g>
                        </g>
                    </g>

                    <!-- 筋の数字 -->
                    <g id="numbers-suji" transform="translate(190, 30)"
                        style="text-anchor: middle; font-size: 20px; font-weight: bold;">
                        <text v-for="(s, idx) in getSujiArray()" :x="idx * 100" y="0" :key="idx">{{s}}</text>
                    </g>

                    <!-- 段の数字 -->
                    <g id="numbersc-dan" transform="translate(1050, 90)"
                        style="text-anchor: start; font-size: 20px; font-weight: bold;" dominant-baseline="central">
                        <text v-for="(s, idx) in getDanArray()" x="0" :y="idx * 100" :key="idx">{{s}}</text>
                    </g>

                    <!-- 盤面 -->
                    <g transform="translate(130, 30)">
                        <rect x="0" y="0" width="920" height="920" style="fill: #f7c167;" />

                        <!-- 盤面のマスと駒 -->
                        <g transform="translate(10, 10)">
                            <g>
                                <!-- マス目よりも駒を先に追加して、マス目が上にくるようにする -->
                                <use width="100" height="100" v-for="bk in banKomaList.getBanList()"
                                    :x="bk.getX(directionFlag, 100)" :y="bk.getY(directionFlag, 100)" :href="bk.getSymbolid()"
                                    :key="bk.getKey()" :transform="directionFlag ? '' : `rotate(180, ${bk.getX(directionFlag, 100) + 50}, ${bk.getY(directionFlag, 100) + 50})`" />
                            </g>

                            <g style="stroke: black; stroke-width: 2;">
                                <rect v-for="ms in masuList.getList()" @click.left="clickMasu($event, ms)"
                                    @click.right.prevent="rightClickMasu($event, ms)" width="100" height="100"
                                    class="square" :key="ms.getKey()" :x="ms.getX(directionFlag, 100)"
                                    :y="ms.getY(directionFlag, 100)" />

                                <use href="#stars" x="300" y="300" />
                                <use href="#stars" x="600" y="300" />
                                <use href="#stars" x="300" y="600" />
                                <use href="#stars" x="600" y="600" />
                            </g>
                        </g>
                    </g>

                    <!-- 駒を右クリックしたときに表示されるメニュー -->
                    <rect v-if="rightClickMenu.getDisplay()" @click="rightClickMenu.hideMenu()"
                        @click.right.prevent="rightClickMenu.hideMenu()" x="0" y="0" :width="viewBoxWidth"
                        :height="viewBoxHeight" style="fill: #8b968d; fill-opacity: 0.7;" />

                    <g v-if="rightClickMenu.getDisplay()"
                        :transform="`translate(${rightClickMenu.getX()}, ${rightClickMenu.getY()})`">
                        <!-- 裏側 -->
                        <g transform="translate(0, 0)" v-if="rightClickMenu.hasUra()">.
                            <rect width="120" height="110" style="fill: #666666; fill-opacity: 0.9;" />
                            <g transform="translate(10, 10)">
                                <use width="100" height="100" :href="rightClickMenu.getKomaUraId()" />
                                <rect width="100" height="100" class="square" @click="clickSetUra" />
                            </g>
                        </g>

                        <!-- 先後逆 -->
                        <g :transform="'translate(0, ' + (rightClickMenu.hasUra() ? 110 : 0) + ')'">
                            <rect width="120" height="120" style="fill: #666666; fill-opacity: 0.9;" />
                            <g transform="translate(10, 10)">
                                <use width="100" height="100" :href="rightClickMenu.getKomaSengoGyakuId()" />
                                <rect width="100" height="100" class="square" @click="clickSetSengoGyaku" />
                            </g>
                        </g>
                    </g>

                </svg>
            </div>

            <div class="col">
                <!-- 操作パネル -->
                <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">

                    <div class="btn-group my-2 mx-1" role="group" aria-label="First group">
                        <input @click="changeToEditMode" type="radio" class="btn-check" name="btnradio" id="btnradio1"
                            autocomplete="off" checked>
                        <label class="btn btn-outline-primary" for="btnradio1">編集モード</label>

                        <input @click="changeToPlayMode" type="radio" class="btn-check" name="btnradio" id="btnradio2"
                            autocomplete="off">
                        <label class="btn btn-outline-primary" for="btnradio2">操作モード</label>
                    </div>

                    <div class="btn-group my-2 mx-1" role="group" aria-label="Second group">
                        <input @click="setDirection(true)" type="radio" class="btn-check" name="btnradioDirection" id="btnradio3"
                            autocomplete="off" checked>
                        <label class="btn btn-outline-primary" for="btnradio3">通常の向き</label>

                        <input @click="setDirection(false)" type="radio" class="btn-check" name="btnradioDirection" id="btnradio4"
                            autocomplete="off">
                        <label class="btn btn-outline-primary" for="btnradio4">先後逆向き</label>
                    </div>

                </div>

                <div v-if="!editFlag" class="my-2">
                    <button :disabled="!moveList.hasBackward()" type="button" class="btn btn-primary mx-1"
                        @click="backwardHistory">&DoubleLeftArrow; 戻る</button>
                    <button :disabled="!moveList.hasForward()" type="button" class="btn btn-primary mx-1"
                        @click="forwardHistory">進む
                        &DoubleRightArrow;</button>
                </div>
            </div>
        </div>
    </div>
</template>
            
<style scoped>
.clicked {
    fill-opacity: 0.4;
    fill: red;
}

.square {
    fill-opacity: 0;
    fill: white;
}

.square:hover {
    fill-opacity: 0.4;
    fill: yellow;
    transition-property: none;
}
</style>
        ./boardCommon.js