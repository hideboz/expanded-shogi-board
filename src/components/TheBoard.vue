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
        this.x.value = Number(targetElem.getAttribute("x")) + 100;
        this.y.value = Number(targetElem.getAttribute("y")) - 10;

        this.masu = masu;

        // 先後逆にした駒の symbolid をセット
        this.komaSengoGyaku = koma.getCopy();
        this.komaSengoGyaku.toSengoGyaku();
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
const senteMochiKomaList = new board.MochiKomaList(true);
const goteMochiKomaList = new board.MochiKomaList(false);
const gomibakoKomaList = new board.MochiKomaList(true);
const rightClickMenu = new RightClickMenu();

// 前のクリックをリセットする
function resetClickAll() {
    banKomaList.resetClick();
    senteMochiKomaList.resetClick();
    goteMochiKomaList.resetClick();
    gomibakoKomaList.resetClick();
}

// 先手の駒台がクリックされたときの処理
function clickSenteKomadai() {
    if (banKomaList.wasClicked()) {
        // 盤から駒台に駒を追加
        const preClickKoma = banKomaList.pickPreClickKoma();
        if (preClickKoma) {
            senteMochiKomaList.add(preClickKoma);
        }
    } else if (goteMochiKomaList.wasClicked()) {
        // 後手の駒台から先手の駒台へ駒を移動
        senteMochiKomaList.add(goteMochiKomaList.pickPreClickKoma());
    } else if (gomibakoKomaList.wasClicked()) {
        // 使わない駒置き場から先手の駒台へ駒を移動
        senteMochiKomaList.add(gomibakoKomaList.pickPreClickKoma());
    }

    resetClickAll();
}

// 後手の駒台がクリックされたときの処理
function clickGoteKomadai() {
    if (banKomaList.wasClicked()) {
        // 盤から駒台に駒を追加
        const preClickKoma = banKomaList.pickPreClickKoma();
        if (preClickKoma) {
            goteMochiKomaList.add(preClickKoma);
        }
    } else if (senteMochiKomaList.wasClicked()) {
        // 先手の駒台から後手の駒台へ駒を移動
        goteMochiKomaList.add(senteMochiKomaList.pickPreClickKoma());
    } else if (gomibakoKomaList.wasClicked()) {
        // 使わない駒置き場から後手の駒台へ駒を移動
        goteMochiKomaList.add(gomibakoKomaList.pickPreClickKoma());
    }

    resetClickAll();
}

// 先手の駒台の持駒がクリックされたときの処理
function clickSenteMochiKoma(event: Event, index: number) {
    resetClickAll();
    senteMochiKomaList.newClick(event, index);
}

// 後手の駒台の持駒がクリックされたときの処理
function clickGoteMochiKoma(event: Event, index: number) {
    resetClickAll();
    goteMochiKomaList.newClick(event, index);
}

// 使わない駒置き場がクリックされたときの処理
function clickGomibako() {
    if (banKomaList.wasClicked()) {
        // 駒台に駒を追加
        const preClickKoma = banKomaList.pickPreClickKoma();
        if (preClickKoma) {
            gomibakoKomaList.add(preClickKoma);
        }
    } else if (senteMochiKomaList.wasClicked()) {
        // 先手の持駒から使わない駒置き場へ移動
        gomibakoKomaList.add(senteMochiKomaList.pickPreClickKoma());
    } else if (goteMochiKomaList.wasClicked()) {
        // 後手の持駒から使わない駒置き場へ移動
        gomibakoKomaList.add(goteMochiKomaList.pickPreClickKoma());
    }

    resetClickAll();
}

// 使わない駒置き場の駒がクリックされたときの処理
function clickGomibakoKoma(event: Event, index: number) {
    resetClickAll();
    gomibakoKomaList.newClick(event, index);
}

// マスがクリックされたときの処理
function clickMasu(event: Event, masu: board.Masu) {
    // ひとつ前にマスがクリックされていた場合
    if (banKomaList.wasClicked()) {
        const preClickMasu = banKomaList.getPreClickMasu();
        if (preClickMasu && (!masu.equal(preClickMasu))) { // 違うマスがクリックされた場合
            const moveKoma = banKomaList.getKoma(preClickMasu); // 移動する駒

            // 駒を移動 (取った駒が返される)
            const torareKoma = banKomaList.moveTo(preClickMasu, masu);

            if (moveKoma && torareKoma) {
                if (moveKoma.isSente()) { // 先手が駒を取った場合
                    // 先手の駒台に駒を追加
                    senteMochiKomaList.add(torareKoma);
                } else { // 後手が駒を取った場合
                    // 後手の駒台に駒を追加
                    goteMochiKomaList.add(torareKoma);
                }
            }
        }

        banKomaList.resetClick();

    } else if (senteMochiKomaList.wasClicked()) { // 先手の持駒がクリックされていた場合
        if (!banKomaList.hasKomaAt(masu)) {
            banKomaList.add(senteMochiKomaList.pickPreClickKoma(), masu);
        }
        senteMochiKomaList.resetClick();
    } else if (goteMochiKomaList.wasClicked()) { // 後手の持駒がクリックされていた場合
        if (!banKomaList.hasKomaAt(masu)) {
            banKomaList.add(goteMochiKomaList.pickPreClickKoma(), masu);
        }
        goteMochiKomaList.resetClick();
    } else if (gomibakoKomaList.wasClicked()) { // 使わない駒置き場の駒がクリックされていた場合
        if (!banKomaList.hasKomaAt(masu)) {
            banKomaList.add(gomibakoKomaList.pickPreClickKoma(), masu);
        }
        gomibakoKomaList.resetClick();
    } else {
        banKomaList.newClick(event, masu);
    }
}

// マスが右グリックされたときの処理
function rightClickMasu(event: Event, masu: board.Masu) {
    resetClickAll();

    // クリックされたマス目に駒があればメニューを表示する
    const koma = banKomaList.getKoma(masu);
    if (koma) {
        if (event.target) {
            rightClickMenu.set(event.target as HTMLElement, masu, koma);
        }
    }
}

// 右クリックした駒を先後逆にする
function clickSetSengoGyaku() {
    const masu = rightClickMenu.getMasu();
    const komaSengoGyaku = rightClickMenu.getKomaSengoGyaku();

    if (masu && komaSengoGyaku) {
        banKomaList.remove(masu);
        banKomaList.add(komaSengoGyaku, masu);
    }

    rightClickMenu.hideMenu();
}

// 右クリックした駒を裏返す
function clickSetUra() {
    const masu = rightClickMenu.getMasu();
    const komaUra = rightClickMenu.getKomaUra();

    if (masu && komaUra) {
        banKomaList.remove(masu);
        banKomaList.add(komaUra, masu);
    }

    rightClickMenu.hideMenu();
}

const boardWidth = ref("100%");  // 将棋盤の幅
const editFlag = ref(true); // 使わない駒置き場を表示するかどうか

// 編集モードに変更
function changeToEditMode() {
    if (!editFlag.value) {
        editFlag.value = true;
    }
}

// 操作モードに変更
function changeToPlayMode() {
    if (editFlag.value) {
        editFlag.value = false;
    }
}

// divの大きさをセットする
function setTopDivSize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const minWH = (w < h) ? w : h;

    boardWidth.value = `${minWH}px`;

    // const elem = document.getElementById("svg-top");
    // 
    // if (elem) {
    //     elem.style.width = `${minWH}px`;
    //     elem.style.height = `${minWH}px`;
    // }

    // const elem1 = document.getElementById("svg-board");

    // if (elem1) {
    //     elem1.style.width = `${minWH}px`;
    //     // elem1.style.height = `${minWH}px`;
    // }

    // const elem2 = document.getElementById("svg-gomibako");

    // if (elem2) {
    //     elem2.style.width = `${minWH}px`;
    //     // elem2.style.height = `${minWH}px`;
    // }
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
                <svg id="svg-board" :width="boardWidth" viewBox="0 0 1190 980" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">

                    <defs>
                        <g id="stars" style="stroke: black; fill: black;">
                            <polygon points="0,-6 6,0 0,6 -6,0" />
                        </g>
                    </defs>

                    <rect x="0" y="0" width="1190" height="980" style="fill: #8b968d;" />

                    <!-- 先手の持駒 -->
                    <g transform="translate(1080, 30)">
                        <!-- 駒台全体 -->
                        <rect width="100" height="920" x="0" y="0" style="fill: #f7c167;" />
                        <rect @click="clickSenteKomadai" width="100" height="920" x="0" y="0" class="square" />

                        <use href="#Sente" x="20" y="-30" width="60" height="60" />

                        <g transform="translate(10, 20)">
                            <!-- 持駒 -->
                            <use width="80" height="80" v-for="(k, idx) in senteMochiKomaList.getList()" :key="k.getKey()"
                                x="0" :y="idx * 80 + 30" :href="k.getSymbolid()" />

                            <!-- 各持駒の個数 -->
                            <g id="nMochiKomaSente"
                                style="text-anchor: start; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                <text v-for="(k, idx) in senteMochiKomaList.getList()" :key="k.getKey()" x="60"
                                    :y="idx * 80 + 100">{{
                                        k.getN() > 1 ? k.getN() : '' }}</text>
                            </g>

                            <!-- 持駒の場所のマス -->
                            <rect v-for="(k, idx) in senteMochiKomaList.getList()" @click="clickSenteMochiKoma($event, idx)"
                                width="80" height="80" class="square" :key="k.getKey()" x="0" :y="idx * 80" />
                        </g>
                    </g>

                    <!-- 後手の持駒 -->
                    <g transform="translate(10, 30)">
                        <!-- 駒台全体 -->
                        <rect width="100" height="920" x="0" y="0" style="fill: #f7c167;" />
                        <rect @click="clickGoteKomadai" width="100" height="920" class="square" x="0" y="0" />

                        <use href="#Gote" x="20" y="-30" width="60" height="60" />

                        <g transform="translate(10, 20)">
                            <!-- 持駒 -->
                            <use width="80" height="80" v-for="(k, idx) in goteMochiKomaList.getList()" :key="k.getKey()"
                                x="0" :y="idx * 80 + 30" :href="k.getSymbolid()" />

                            <!-- 各持駒の個数 -->
                            <g id="nMochiKomaGote"
                                style="text-anchor: start; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                <text v-for="(k, idx) in goteMochiKomaList.getList()" :key="k.getKey()" x="60"
                                    :y="idx * 80 + 100">{{
                                        k.getN() > 1 ? k.getN() : '' }}</text>
                            </g>

                            <!-- 持駒の場所のマス -->
                            <rect v-for="(k, idx) in goteMochiKomaList.getList()" @click="clickGoteMochiKoma($event, idx)"
                                width="80" height="80" class="square" :key="k.getKey()" x="0" :y="idx * 80" />
                        </g>
                    </g>


                    <!-- 段の数字 -->
                    <g id="numbers-row" transform="translate(190, 30)"
                        style="text-anchor: middle; font-size: 20px; font-weight: bold;">
                        <text x="0" y="0">9</text>
                        <text x="100" y="0">8</text>
                        <text x="200" y="0">7</text>
                        <text x="300" y="0">6</text>
                        <text x="400" y="0">5</text>
                        <text x="500" y="0">4</text>
                        <text x="600" y="0">3</text>
                        <text x="700" y="0">2</text>
                        <text x="800" y="0">1</text>
                    </g>

                    <!-- 筋の数字 -->
                    <g id="numbersc-column" transform="translate(1050, 90)"
                        style="text-anchor: start; font-size: 20px; font-weight: bold;" dominant-baseline="central">
                        <text x="0" y="0">一</text>
                        <text x="0" y="100">二</text>
                        <text x="0" y="200">三</text>
                        <text x="0" y="300">四</text>
                        <text x="0" y="400">五</text>
                        <text x="0" y="500">六</text>
                        <text x="0" y="600">七</text>
                        <text x="0" y="700">八</text>
                        <text x="0" y="800">九</text>
                    </g>

                    <!-- 盤面 -->
                    <g transform="translate(130, 30)">
                        <rect x="0" y="0" width="920" height="920" style="fill: #f7c167;" />

                        <!-- 盤面のマスと駒 -->
                        <g transform="translate(10, 10)">
                            <g>
                                <!-- マス目よりも駒を先に追加して、マス目が上にくるようにする -->
                                <use width="100" height="100" v-for="bk in banKomaList.getList()"
                                    :x="(9 - bk.getSuji()) * 100" :y="(bk.getDan() - 1) * 100" :href="bk.getSymbolid()"
                                    :key="bk.getKey()" />
                            </g>

                            <g style="stroke: black; stroke-width: 2;">
                                <rect v-for="ms in masuList.getList()" @click.left="clickMasu($event, ms)"
                                    @click.right.prevent="rightClickMasu($event, ms)" width="100" height="100"
                                    class="square" :key="ms.getKey()" :x="(9 - ms.getSuji()) * 100"
                                    :y="(ms.getDan() - 1) * 100" />

                                <use href="#stars" x="300" y="300" />
                                <use href="#stars" x="600" y="300" />
                                <use href="#stars" x="300" y="600" />
                                <use href="#stars" x="600" y="600" />
                            </g>
                        </g>
                    </g>

                    <!-- 駒を右クリックしたときに表示されるメニュー -->
                    <rect v-if="rightClickMenu.getDisplay()" @click="rightClickMenu.hideMenu()"
                        @click.right.prevent="rightClickMenu.hideMenu()" x="0" y="0" width="1190" height="1190"
                        style="fill: #8b968d; fill-opacity: 0.7;" />
                    <g transform="translate(140, 40)">
                        <g v-if="rightClickMenu.getDisplay()"
                            :transform="'translate(' + rightClickMenu.getX() + ', ' + rightClickMenu.getY() + ')'">
                            <!-- 裏側 -->
                            <g transform="translate(0, 0)" v-if="rightClickMenu.hasUra()">
                                <rect width="120" height="120" style="fill: #666666; fill-opacity: 0.9;" />
                                <g transform="translate(10, 10)">
                                    <use width="100" height="100" :href="rightClickMenu.getKomaUraId()" />
                                    <rect width="100" height="100" class="square" @click="clickSetUra" />
                                </g>
                            </g>

                            <!-- 先後逆 -->
                            <g :transform="'translate(0, ' + (rightClickMenu.hasUra() ? 120 : 0) + ')'">
                                <rect width="120" height="110" style="fill: #666666; fill-opacity: 0.9;" />
                                <g transform="translate(10, 0)">
                                    <use width="100" height="100" :href="rightClickMenu.getKomaSengoGyakuId()" />
                                    <rect width="100" height="100" class="square" @click="clickSetSengoGyaku" />
                                </g>
                            </g>
                        </g>
                    </g>

                </svg>

                <!-- 使わない駒置き場 -->
                <svg v-if="editFlag" id="svg-gomibako" :width="boardWidth" viewBox="0 0 1190 130"
                    xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">
                    <rect width="1190" height="130" style="fill: #8b968d;" />
                    <g transform="translate(130, 0)">
                        <rect width="920" height="100" style="fill: #f7c167;" />
                        <rect @click="clickGomibako" width="920" height="100" class="square" x="0" y="0" />

                        <!-- ゴミ箱アイコン -->
                        <use href="#Gomibako" x="-30" y="0" width="60" height="60" style="fill: #666666;" />

                        <g transform="translate(40, 0)">
                            <!-- 駒 -->
                            <use width="80" height="80" v-for="(k, idx) in gomibakoKomaList.getList()" :key="k.getKey()"
                                :x="idx * 80" y="10" :href="k.getSymbolid()" />

                            <!-- 各駒の個数 -->
                            <g style="text-anchor: middle; font-size: 30px; font-weight: bold; stroke: white; fill: red;">
                                <text v-for="(k, idx) in gomibakoKomaList.getList()" :key="k.getKey()" :x="idx * 80 + 40"
                                    y="100">{{
                                        k.getN() > 1 ? k.getN() : '' }}</text>
                            </g>

                            <!-- 駒の場所のマス -->
                            <rect v-for="(k, idx) in gomibakoKomaList.getList()" @click="clickGomibakoKoma($event, idx)"
                                width="80" height="80" class="square" :key="k.getKey()" :x="idx * 80" y="10" />
                        </g>
                    </g>
                </svg>
            </div>

            <div class="col">
                <!-- 操作パネル -->
                <div class="btn-group my-3" role="group" aria-label="Basic radio toggle button group">
                    <input @click="changeToEditMode" type="radio" class="btn-check" name="btnradio" id="btnradio1"
                        autocomplete="off" checked>
                    <label class="btn btn-outline-primary" for="btnradio1">編集モード</label>

                    <input @click="changeToPlayMode" type="radio" class="btn-check" name="btnradio" id="btnradio2"
                        autocomplete="off">
                    <label class="btn btn-outline-primary" for="btnradio2">操作モード</label>
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
}</style>
        ./boardCommon.js