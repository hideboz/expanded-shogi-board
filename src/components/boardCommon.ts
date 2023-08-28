// Class declarations.
// Copyright (C) 2023 Hideaki Sakai

// This file is part of Expanded-Shogi-Board.

// Expanded-Shogi-Board is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Expanded-Shogi-Board is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Expanded-Shogi-Board.  If not, see <https://www.gnu.org/licenses/>.

import { ref } from 'vue'
import type { Ref } from 'vue'

// マスを表わすクラス
class Masu {
    suji: number;
    dan: number;

    constructor(s: number, d: number) {
        this.suji = s;
        this.dan = d;
    }

    // オブジェクトのコピーを返す
    getCopy() { return new Masu(this.suji, this.dan); }

    getSuji() { return this.suji; }
    getDan() { return this.dan; }
    getKey() { return `Masu-${this.suji}${this.dan}`; }

    equal(masu: Masu) { return ((masu.suji === this.suji) && (masu.dan === this.dan)); }

    toString() { return `${this.suji} ${this.dan}`; }
}

// 盤上にすべてのマスを含むクラス
class MasuList {
    reflist: Ref<Masu[]> = ref([]); // Masuクラスのオブジェクトのリスト

    constructor() {
        for (let s = 1; s <= 9; s++) {
            for (let d = 1; d <= 9; d++) {
                this.reflist.value.push(new Masu(s, d));
            }
        }
    }

    getList() { return this.reflist.value; }
}

// 駒クラス
class Koma {
    name: string;
    senteFlag: boolean;
    nariFlag: boolean;
    symbolid: string;
    priority: number;

    constructor(name: string, senteFlag: boolean, nariFlag: boolean) {
        this.name = name; // 駒を表わす文字列 (例: "歩")
        this.senteFlag = senteFlag; // 先手を示すFlag (駒の向きに影響する)
        this.nariFlag = nariFlag; // 成りを示すFlag
        this.symbolid = "";  // symbol の id
        this.priority = 0;  // 駒の優先順位 (数字が大きい方が優先)
        this.setSymbolID();
    }

    // オブジェクトのコピーを返す
    getCopy() { return new Koma(this.name, this.senteFlag, this.nariFlag); }

    // 基本状態(先手、不成り)の駒を返す
    getBaseKoma() {
        const koma = this.getCopy();
        koma.toSente();
        koma.toFunari();
        return koma;
    }

    // this.name, this.senteFlag, this.nariFlag を元にして this.symbolid をセットする
    // 優先順位もセットする
    setSymbolID() {
        switch (this.name) {
            case "歩":
                this.priority = 10;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-TO";
                    else
                        this.symbolid = "#S-FU";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-TO";
                    else
                        this.symbolid = "#G-FU";
                }
                break;
            case "飛":
                this.priority = 92;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-RY";
                    else
                        this.symbolid = "#S-HI";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-RY";
                    else
                        this.symbolid = "#G-HI";
                }
                break;
            case "角": // 
                this.priority = 91;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-UM";
                    else
                        this.symbolid = "#S-KA";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-UM";
                    else
                        this.symbolid = "#G-KA";
                }
                break;
            case "香":
                this.priority = 71;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-NY";
                    else
                        this.symbolid = "#S-KY";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-NY";
                    else
                        this.symbolid = "#G-KY";
                }
                break;
            case "桂":
                this.priority = 72;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-NK";
                    else
                        this.symbolid = "#S-KE";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-NK";
                    else
                        this.symbolid = "#G-KE";
                }
                break;
            case "銀":
                this.priority = 81;
                if (this.senteFlag) {
                    if (this.nariFlag)
                        this.symbolid = "#S-NG";
                    else
                        this.symbolid = "#S-GI";
                } else {
                    if (this.nariFlag)
                        this.symbolid = "#G-NG";
                    else
                        this.symbolid = "#G-GI";
                }
                break;
            case "金":
                this.priority = 82;
                if (this.senteFlag) {
                    this.symbolid = "#S-KI";
                } else {
                    this.symbolid = "#G-KI";
                }
                break;
            case "王":
                this.priority = 102;
                if (this.senteFlag) {
                    this.symbolid = "#S-OU";
                } else {
                    this.symbolid = "#G-OU";
                }
                break;
            case "玉":
                this.priority = 101;
                if (this.senteFlag) {
                    this.symbolid = "#S-GY";
                } else {
                    this.symbolid = "#G-GY";
                }
                break;
        }
    }

    // name をセットする (玉と王を入れ替える操作に使う)
    setName(name: string) {
        this.name = name;
        this.setSymbolID();
    }

    // 後手から先手に変える (駒の向きが変わる)
    toSente() {
        if (!this.senteFlag) {
            this.senteFlag = true;
            this.setSymbolID();
        }
    }

    // 先手から後手に変える (駒の向きが変わる)
    toGote() {
        if (this.senteFlag) {
            this.senteFlag = false;
            this.setSymbolID();
        }
    }

    // 先後逆にする
    toSengoGyaku() {
        this.senteFlag = (!this.senteFlag);
        this.setSymbolID();
    }

    // 不成りの状態から成りの状態に変える
    toNari() {
        if ((!this.nariFlag) && this.hasUra()) {
            this.nariFlag = true;
            this.setSymbolID();
        }
    }

    // 成りの状態から不成りの状態に変える
    toFunari() {
        if (this.nariFlag) {
            this.nariFlag = false;
            this.setSymbolID();
        }
    }

    // 裏返しにする
    toUra() {
        if (this.hasUra()) {
            this.nariFlag = (!this.nariFlag);
            this.setSymbolID();
        }
        // 以下は編集モード用
        else if (this.name == "王") {
            this.setName("玉");
        } else if (this.name == "玉") {
            this.setName("王");
        }
    }

    // 裏側がある駒かどうか
    hasUra() {
        return ((this.name != "王") && (this.name != "玉") && (this.name != "金"));
    }

    getSymbolid() { return this.symbolid; }
    getName() { return this.name; }
    getPriority() { return this.priority; }

    // Vue.js のリストレンダリングで使用する key を取得 (symbolid を使用)
    getKey() { return this.symbolid; }

    isSente() { return this.senteFlag; }
    isNari() { return this.nariFlag; }  // 成った状態かどうか
    isFunari() { return (!this.nariFlag); }  // 不成りの状態かどうか
    toString() { return this.getSymbolid(); }
}

// 盤の場所を表わす型エイリアス
type Place = "ban" | "senteMochiKoma" | "goteMochiKoma" | "gomibako";

// 盤上にある駒クラス (持駒、使わない駒置き場を含む)
class BanKoma {
    koma: Koma;
    place: Place = "ban"; // リテラル型
    masu: Masu;
    n: number;  // 盤上のマスにある駒の場合は 1

    constructor(koma: Koma, place: Place, masu: Masu = new Masu(0, 0), n: number = 1) {
        this.koma = koma; // 駒 (Komaクラスのオブジェクト)
        this.place = place;
        this.masu = masu; // マス (Masuクラスのオブジェクト)
        this.n = n;
    }

    // オブジェクトのコピーを返す
    getCopy() { return new BanKoma(this.koma.getCopy(), this.place, this.masu.getCopy(), this.n); }

    getPlace() { return this.place; }

    atPlace(place: Place) { return this.place === place; }
    atMasu(masu: Masu) { return (this.atPlace("ban") && this.masu.equal(masu)); }

    // 新しい場所に動かした後の BanKoma を返す
    getMoveTo(newPlace: Place, masu: Masu = new Masu(0, 0)) {
        let koma = this.koma;
        if (this.place != newPlace) {
            // 盤から駒台 (使わない駒置き場含む) へ移動する場合
            if (this.place == "ban") {
                koma = this.koma.getBaseKoma();
            }
            // 後手の持駒を打つ場合
            else if (this.place == "goteMochiKoma") {
                koma.toGote();
            }
        }
        return new BanKoma(koma, newPlace, masu, 1);
    }

    // Vue.js のリストレンダリングで使用する key を取得するゲッター
    getKey() { return `${this.koma.getName()}${this.place}${this.masu.getKey()}`; }

    isSente() { return this.koma.isSente(); }
    toSente() { this.koma.toSente(); }
    toGote() { this.koma.toGote(); }
    getSymbolid() { return this.koma.getSymbolid(); }
    getName() { return this.koma.getName(); }

    getKoma() {
        const koma = this.koma.getCopy();
        if (this.place == "goteMochiKoma") {
            koma.toGote();
        }
        return koma;
    }

    getMasu() { return this.masu.getCopy(); }
    getSuji() { return this.masu.getSuji(); }
    getDan() { return this.masu.getDan(); }

    nInc() { this.n++; }
    nDec() { this.n--; }
    getN() { return this.n; }

    hasUra() { return this.koma.hasUra(); }
    toUra() { this.koma.toUra(); }
    toNari() { this.koma.toNari(); }
    toFunari() { this.koma.toFunari(); }

    // 先後逆にする
    toSengoGyaku() { this.koma.toSengoGyaku(); }

    isFunari() { return this.koma.isFunari(); }

    toString() { return `${this.koma.toString()}-${this.place}-${this.masu.getKey()}`; }
}

// 盤上にあるすべての駒を含むクラス
class BanKomaList {
    banList: Ref<BanKoma[]> = ref([]);
    senteMochiKomaList: Ref<BanKoma[]> = ref([]);
    goteMochiKomaList: Ref<BanKoma[]> = ref([]);
    gomibakoList: Ref<BanKoma[]> = ref([]);
    
    preClickBanKoma: BanKoma | null = null;
    // preClickPlace: Place | null = null;
    preClickHTMLElem: HTMLElement | null = null;
    // preClickMasu: Masu | null = null;
    // preClickIdx: number = -1; // ひとつ前にクリックされた持駒の index

    constructor() { }

    // 駒を追加
    add(banKoma: BanKoma) {
        if (banKoma.atPlace("ban")) {
            if (this.hasKomaAtMasu(banKoma.getMasu())) {
                // console.log("すでに駒がある場所には持駒を打てません。"); // debug
            } else {
                this.getBanList().push(banKoma);
            }
        } else {
            // 持駒の場合は、駒を先手の向きにして、不成の状態にする
            // banKoma.toSente();
            // banKoma.toFunari();

            let list: BanKoma[] = [];
            if (banKoma.atPlace("senteMochiKoma")) {
                list = this.getSenteMochiKomaList();
            } else if (banKoma.atPlace("goteMochiKoma")) {
                list = this.getGoteMochiKomaList();
            } else if (banKoma.atPlace("gomibako")) {
                list = this.getGomibakoList();
            }

            const idx = list.findIndex((k) => banKoma.getName() === k.getName());

            if (idx === -1) {
                list.push(banKoma);
                list.sort((k1, k2) => (k2.getKoma().getPriority() - k1.getKoma().getPriority()));
            } else {
                list[idx].nInc();
            }
        }
    }

    // 駒を削除
    remove(banKoma: BanKoma) {
        if (banKoma.atPlace("ban")) {
            if (this.hasKomaAtMasu(banKoma.getMasu())) {
                this.removeAtMasu(banKoma.getMasu());
            } else {
                // console.log("該当する駒はありません。"); // debug
            }
        } else {
            let list: BanKoma[] = [];
            if (banKoma.atPlace("senteMochiKoma")) {
                list = this.getSenteMochiKomaList();
            } else if (banKoma.atPlace("goteMochiKoma")) {
                list = this.getGoteMochiKomaList();
            } else if (banKoma.atPlace("gomibako")) {
                list = this.getGomibakoList();
            }

            const idx = list.findIndex((k) => banKoma.getName() === k.getName());

            if (idx === -1) {
                // console.log("該当する駒はありません。"); // debug
            } else {
                this.removeAtIdx(banKoma.getPlace(), idx);
            }
        }
    }

    // 盤上の masu にある駒を削除
    removeAtMasu(masu: Masu) {
        const idx = this.getIndexAtMasu(masu);
        if (idx != -1) {
            this.getBanList().splice(idx, 1);
        }
    }

    // idx にある持駒を削除
    removeAtIdx(place: Place, idx: number) {
        let list: BanKoma[] = [];
        if (place === "senteMochiKoma") {
            list = this.getSenteMochiKomaList();
        } else if (place === "goteMochiKoma") {
            list = this.getGoteMochiKomaList();
        } else if (place === "gomibako") {
            list = this.getGomibakoList();
        }

        if (list[idx].getN() === 1) {
            list.splice(idx, 1);
        } else {
            list[idx].nDec();
        }
    }

    // preClick された駒を別の place に移動する
    movePreClickBanKoma(place: Place, masu: Masu = new Masu(0, 0)) {
        // 同じ place がクリックされた場合は何もしない
        if (this.preClickBanKoma && (place !== this.preClickBanKoma.getPlace())) {
            const movedBanKoma = this.preClickBanKoma.getMoveTo(place, masu);
            this.remove(this.preClickBanKoma);
            this.add(movedBanKoma);
        }

        this.resetClick();
    }

    // 盤上で駒を動かす
    // Move を返す
    moveOnBan(nextMasu: Masu): Move | null {
        if (this.preClickBanKoma && (!nextMasu.equal(this.preClickBanKoma.getMasu()))) {
            let torareAfter = null;

            if (this.preClickBanKoma) {
                const torareBefore = this.getAtMasu(nextMasu); // 移動先にある駒

                if (torareBefore) {
                    if (this.preClickBanKoma.isSente() === torareBefore.isSente()) {
                        // console.log("味方の駒がある場所には移動できません。"); // debug
                        return null;
                    } else {
                        // 盤から駒を削除
                        this.remove(torareBefore);

                        if (this.preClickBanKoma.isSente()) {
                            torareAfter = torareBefore.getMoveTo("senteMochiKoma");
                        } else {
                            torareAfter = torareBefore.getMoveTo("goteMochiKoma");
                        }

                        if (torareAfter) {
                            this.add(torareAfter);
                        }
                    }
                }

                // 駒を動かす
                const afterBanKoma = this.preClickBanKoma.getMoveTo("ban", nextMasu);
                this.remove(this.preClickBanKoma);
                this.add(afterBanKoma);

                // 取った駒を返す
                return new Move(this.preClickBanKoma, afterBanKoma, torareBefore, torareAfter);
            } else {
                // console.log("元の位置に駒がありません");
                return null;
            }
        }

        return null;
    }

    // 駒台、使わない駒置き場から盤上へ駒を動かす
    moveToBan(nextMasu: Masu): Move | null {
        if ((!this.hasKomaAtMasu(nextMasu)) && this.preClickBanKoma) {
            const afterBanKoma = this.preClickBanKoma.getMoveTo("ban", nextMasu);
            this.remove(this.preClickBanKoma);
            this.add(afterBanKoma);

            return new Move(this.preClickBanKoma, afterBanKoma);
        }

        return null;
    }

    // 盤上の BanKoma のコピーを返す
    getAtMasu(masu: Masu): BanKoma | null {
        const idx = this.getIndexAtMasu(masu);
        if (idx != -1) {
            return this.getBanList()[idx].getCopy();
        }
        return null;
    }

    // 持駒の BanKoma のコピーを返す
    // 盤上に打つときに使うメンバ関数
    getAtIdx(place: Place, idx: number) {
        if (place === "senteMochiKoma") {
            return this.getSenteMochiKomaList()[idx].getCopy();
        } else if (place === "goteMochiKoma") {
            return this.getGoteMochiKomaList()[idx].getCopy();
        } else if (place === "gomibako") {
            return this.getGomibakoList()[idx].getCopy();
        }

        return null;
    }

    // masu にある駒を先後逆にする
    toSengoGyaku(masu: Masu) {
        const idx = this.getIndexAtMasu(masu);
        if (idx != -1) {
            this.getBanList()[idx].toSengoGyaku();
        }
    }

    // masu にある駒を裏返しにする
    toUra(masu: Masu) {
        const idx = this.getIndexAtMasu(masu);
        if (idx != -1) {
            this.getBanList()[idx].toUra();
        }
    }

    // 指定したマスにある駒の index を返す (なければ -1 を返す)
    getIndexAtMasu(masu: Masu) { return this.getBanList().findIndex((bk) => bk.atMasu(masu)); }

    // 指定した位置に駒があるかどうかを返す
    hasKomaAtMasu(masu: Masu) { return (this.getIndexAtMasu(masu) != -1); }

    getBanList() { return this.banList.value; }
    getSenteMochiKomaList() { return this.senteMochiKomaList.value; }
    getGoteMochiKomaList() { return this.goteMochiKomaList.value; }
    getGomibakoList() { return this.gomibakoList.value; }

    // クリックされたマスの class を変える
    setElemClass(elem: HTMLElement) {
        this.preClickHTMLElem = elem;
        this.preClickHTMLElem.classList.replace('square', 'clicked');
    }

    // マスの class を元に戻す
    resetElemClass() {
        this.preClickHTMLElem?.classList.replace('clicked', 'square');
        this.preClickHTMLElem = null;
    }

    // クリックをリセットする
    resetClick() {
        if (this.wasClicked()) {
            this.preClickBanKoma = null;
            this.resetElemClass();
        }
    }

    // ひとつ前にクリックされているかどうかを示す
    wasClicked() { return (this.preClickBanKoma !== null); }

    // ひとつ前に Place がクリックされているかどうかを示す
    wasClickedAt(place: Place) { return (this.preClickBanKoma?.getPlace() === place); }

    // 他にどこもクリックされていない状態で、新たにクリックされた場合の処理
    newClickAtMasu(event: Event, masu: Masu) {
        if (this.hasKomaAtMasu(masu)) {
            this.preClickBanKoma = this.getAtMasu(masu);
            this.setElemClass(event.target as HTMLElement);
        }
    }

    newClickAtSenteIdx(event: Event, index: number) {
        this.preClickBanKoma = this.getAtIdx("senteMochiKoma", index);
        this.setElemClass(event.target as HTMLElement);
    }

    newClickAtGoteIdx(event: Event, index: number) {
        this.preClickBanKoma = this.getAtIdx("goteMochiKoma", index);
        this.setElemClass(event.target as HTMLElement);
    }

    newClickAtGomibakoIdx(event: Event, index: number) {
        this.preClickBanKoma = this.getAtIdx("gomibako", index);
        this.setElemClass(event.target as HTMLElement);
    }

    // 平手の配置になるように駒を追加する
    setHirate() {
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(1, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(2, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(3, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(4, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(5, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(6, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(7, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(8, 7)));
        this.add(new BanKoma(new Koma("歩", true, false), "ban", new Masu(9, 7)));

        this.add(new BanKoma(new Koma("飛", true, false), "ban", new Masu(2, 8)));
        this.add(new BanKoma(new Koma("角", true, false), "ban", new Masu(8, 8)));

        this.add(new BanKoma(new Koma("香", true, false), "ban", new Masu(1, 9)));
        this.add(new BanKoma(new Koma("桂", true, false), "ban", new Masu(2, 9)));
        this.add(new BanKoma(new Koma("銀", true, false), "ban", new Masu(3, 9)));
        this.add(new BanKoma(new Koma("金", true, false), "ban", new Masu(4, 9)));
        this.add(new BanKoma(new Koma("玉", true, false), "ban", new Masu(5, 9)));
        this.add(new BanKoma(new Koma("金", true, false), "ban", new Masu(6, 9)));
        this.add(new BanKoma(new Koma("銀", true, false), "ban", new Masu(7, 9)));
        this.add(new BanKoma(new Koma("桂", true, false), "ban", new Masu(8, 9)));
        this.add(new BanKoma(new Koma("香", true, false), "ban", new Masu(9, 9)));

        this.add(new BanKoma(new Koma("香", false, false), "ban", new Masu(1, 1)));
        this.add(new BanKoma(new Koma("桂", false, false), "ban", new Masu(2, 1)));
        this.add(new BanKoma(new Koma("銀", false, false), "ban", new Masu(3, 1)));
        this.add(new BanKoma(new Koma("金", false, false), "ban", new Masu(4, 1)));
        this.add(new BanKoma(new Koma("玉", false, false), "ban", new Masu(5, 1)));
        this.add(new BanKoma(new Koma("金", false, false), "ban", new Masu(6, 1)));
        this.add(new BanKoma(new Koma("銀", false, false), "ban", new Masu(7, 1)));
        this.add(new BanKoma(new Koma("桂", false, false), "ban", new Masu(8, 1)));
        this.add(new BanKoma(new Koma("香", false, false), "ban", new Masu(9, 1)));

        this.add(new BanKoma(new Koma("角", false, false), "ban", new Masu(2, 2)));
        this.add(new BanKoma(new Koma("飛", false, false), "ban", new Masu(8, 2)));

        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(1, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(2, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(3, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(4, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(5, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(6, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(7, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(8, 3)));
        this.add(new BanKoma(new Koma("歩", false, false), "ban", new Masu(9, 3)));
    }

    // move の動きを進める
    moveForward(move: Move) {
        const torareBefore = move.getTorareBefore();
        if (torareBefore) {
            this.remove(torareBefore);
        }
        const torareAfter = move.getTorareAfter();
        if (torareAfter) {
            this.add(torareAfter);
        }

        this.remove(move.getBefore());
        this.add(move.getAfter());
    }

    // move の動きを戻す
    moveBackward(move: Move) {
        this.remove(move.getAfter());
        this.add(move.getBefore());

        const torareAfter = move.getTorareAfter();
        if (torareAfter) {
            this.remove(torareAfter);
        }
        const torareBefore = move.getTorareBefore();
        if (torareBefore) {
            this.add(torareBefore);
        }
    }
}

// 駒の動きを表わすクラス
class Move {
    before: BanKoma;
    after: BanKoma;
    torareBefore: BanKoma | null; // 取られた駒
    torareAfter: BanKoma | null;

    constructor(before: BanKoma, after: BanKoma, torareBefore: BanKoma | null = null, torareAfter: BanKoma | null = null) {
        this.before = before.getCopy();
        this.after = after.getCopy();
        this.torareBefore = null;
        if (torareBefore) {
            this.torareBefore = torareBefore.getCopy();
        }
        this.torareAfter = null;
        if (torareAfter) {
            this.torareAfter = torareAfter.getCopy();
        }
    }

    getBefore() { return this.before.getCopy(); }
    getAfter() { return this.after.getCopy(); }
    getTorareBefore() { 
        if (this.torareBefore) {
            return this.torareBefore.getCopy(); 
        }
        return null;
    }
    getTorareAfter() { 
        if (this.torareAfter) {
            return this.torareAfter.getCopy(); 
        }
        return null;
    }

    afterToNari() { this.after.toNari(); }

    // before から after に移動するとき、成れるかどうか
    canNari() {
        if (this.before.atPlace("ban") && this.after.atPlace("ban") && this.before.hasUra() && this.before.isFunari()) {
            if (this.before.isSente()) {
                return ((this.before.getDan() <= 3) || (this.after.getDan() <= 3));
            } else {
                return ((this.before.getDan() >= 7) || (this.after.getDan() >= 7));
            }
        }
        return false;
    }

    getAfterKoma() { return this.after.getKoma(); }

    toString() { 
        let s = `${this.before.toString()} -> ${this.after.toString()}`;
        if (this.torareBefore && this.torareAfter) {
            s += ` (${this.torareBefore.toString()} -> ${this.torareAfter.toString()})`;
        }
        return s;
    }
}

// 履歴を保存するクラス
class MoveList {
    moveList: Move[] = [];
    lastPosition: number = -1; // 最後に返した位置

    add(newMove: Move) {
        this.lastPosition += 1;

        // lastPosition が moveList の最後の要素の次を指していなければ
        // lastPositionより先の履歴を削除
        if (this.lastPosition < this.moveList.length) {
            const newList = this.moveList.slice(0, this.lastPosition);
            this.moveList = newList;
        }

        this.moveList[this.lastPosition] = newMove;

        // console.log(newMove.toString()); // debug
    }

    // 履歴の最後の Move の after を成りにする
    lastToNari() {
        if (this.lastPosition != -1) {
            this.moveList[this.lastPosition].afterToNari();
            console.log(this.moveList[this.lastPosition].toString()); // debug
        }
    }

    // lastPosition より次に進めるかどうかを示す
    hasForward() {
        return (this.lastPosition < (this.moveList.length - 1));
    }

    // lastPosition の次の Move を返す
    getForward() {
        if (this.hasForward()) {
            this.lastPosition += 1;
            return this.moveList[this.lastPosition];
        }

        return null;
    }

    // lastPosition より前(0の方向)に進めるかどうかを示す
    hasBackward() {
        return (this.lastPosition > -1);
    }

    // lastPosition の Move を返して、lastPosition を decriment
    getBackward() {
        if (this.lastPosition > -1) {
            const position = this.lastPosition;
            this.lastPosition -= 1;
            return this.moveList[position];
        }

        return null;
    }
}

export { Masu, MasuList, Koma, type Place, BanKoma, BanKomaList, Move, MoveList };
