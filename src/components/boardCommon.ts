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
    key: string;

    constructor(s: number, d: number) {
        this.suji = s;
        this.dan = d;
        this.key = `Masu-${s}${d}`;
    }

    getSuji() { return this.suji; }
    getDan() { return this.dan; }
    getKey() { return this.key; }

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
        this.senteFlag = senteFlag; // 先手を示すFlag (false なら後手)
        this.nariFlag = nariFlag; // 成りを示すFlag
        this.symbolid = "";  // symbol の id
        this.priority = 0;  // 駒の優先順位 (数字が大きい方が優先)
        this.setSymbolID();
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
    }

    // 裏側がある駒かどうか
    hasUra() {
        return ((this.name != "王") && (this.name != "玉") && (this.name != "金"));
    }

    // オブジェクトのコピーを返す
    getCopy() { return new Koma(this.name, this.senteFlag, this.nariFlag); }

    getSymbolid() { return this.symbolid; }
    getName() { return this.name; }
    getPriority() { return this.priority; }

    // Vue.js のリストレンダリングで使用する key を取得 (symbolid を使用)
    getKey() { return this.symbolid; }

    isSente() { return this.senteFlag; }
    toString() { return this.getSymbolid(); }
}

// 盤上にある駒クラス
class BanKoma {
    koma: Koma;
    masu: Masu;

    constructor(koma: Koma, masu: Masu) {
        this.koma = koma; // 駒 (Komaクラスのオブジェクト)
        this.masu = masu; // マス (Masuクラスのオブジェクト)
    }

    at(masu: Masu) { return this.masu.equal(masu); }  // BanKoma が指定のマスにあるかどうか

    // 駒を新しいマスに動かす
    moveTo(newMasu: Masu) { this.masu = newMasu; }

    // Vue.js のリストレンダリングで使用する key を取得するゲッター
    getKey() { return `${this.masu.getSuji()}${this.masu.getDan()}`; }

    isSente() { return this.koma.isSente(); }
    getSymbolid() { return this.koma.getSymbolid(); }
    getName() { return this.koma.getName(); }

    getKoma() { return this.koma.getCopy(); }  // Komaオブジェクトのコピーを返す
    getMasu() { return this.masu; }
    getSuji() { return this.masu.getSuji(); }
    getDan() { return this.masu.getDan(); }

    toString() { return `${this.masu.getSuji()}-${this.masu.getDan()}-${this.koma.toString()}`; }
}

// 盤上にあるすべての駒を含むクラス
class BanKomaList {
    reflist: Ref<BanKoma[]> = ref([]);
    preClickMasu: Masu | null;
    preClickHTMLElem: HTMLElement | null;

    constructor() {
        this.reflist = ref([]); // BanKomaクラスのオブジェクトのリスト
        this.preClickMasu = null;  // ひとつ前にクリックされたマス
        this.preClickHTMLElem = null;  // ひとつ前にクリックされた HTML element
    }

    add(koma: Koma, masu: Masu) {
        if (this.hasKomaAt(masu)) {
            // console.log("すでに駒がある場所には持駒を打てません。"); // debug
        } else {
            this.getList().push(new BanKoma(koma, masu));
        }
    }

    remove(masu: Masu) {
        const idx = this.getIndexAt(masu);
        if (idx != -1) {
            this.getList().splice(idx, 1);
        }
    }

    // 駒を動かす
    // 移動先に相手の駒があれば返す
    moveTo(nowMasu: Masu, nextMasu: Masu) {
        if (this.hasKomaAt(nowMasu)) {
            let torareKoma = null;
            if (this.hasKomaAt(nextMasu)) {
                const moveKoma = this.getKoma(nowMasu); // 移動する駒
                torareKoma = this.getKoma(nextMasu); // 移動先にある駒

                if (moveKoma && torareKoma && (moveKoma.isSente() === torareKoma.isSente())) {
                    // console.log("味方の駒がある場所には移動できません。"); // debug
                    return null;
                } else {
                    // 盤から駒を削除
                    this.remove(nextMasu);
                }
            }

            // 駒を動かす
            this.getList()[this.getIndexAt(nowMasu)].moveTo(nextMasu);

            // 取った駒を返す
            return torareKoma;
        } else {
            // console.log("元の位置に駒がありません");
            return null;
        }
    }

    getKoma(masu: Masu) {
        const idx = this.getIndexAt(masu);
        if (idx != -1) {
            return this.getList()[idx].getKoma();
        }
        return null;
    }

    // 指定したマスにある駒の index を返す (なければ -1 を返す)
    getIndexAt(masu: Masu) { return this.getList().findIndex((bk) => bk.at(masu)); }

    // 指定した位置に駒があるかどうかを返す
    hasKomaAt(masu: Masu) { return (this.getIndexAt(masu) != -1); }

    getList() { return this.reflist.value; }

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
            this.preClickMasu = null;
            this.resetElemClass();
        }
    }

    // ひとつ前にクリックされているかどうかを示す
    wasClicked() { return (this.preClickMasu != null); }

    // ひとつ前にクリックされたマスを返す
    getPreClickMasu() { return this.preClickMasu; }

    // ひとつ前にクリックされた駒を削除して返す
    pickPreClickKoma() {
        let koma = null;
        if (this.preClickMasu) {
            koma = this.getKoma(this.preClickMasu);
            this.remove(this.preClickMasu);
        }
        return koma;
    }

    // 他にどこもクリックされていない状態で、新たにクリックされた場合の処理
    newClick(event: Event, masu: Masu) {
        if (this.hasKomaAt(masu)) {
            this.preClickMasu = masu;
            this.setElemClass(event.target as HTMLElement);
        }
    }

    // 平手の配置になるように駒を追加する
    setHirate() {
        this.add(new Koma("歩", true, false), new Masu(1, 7));
        this.add(new Koma("歩", true, false), new Masu(2, 7));
        this.add(new Koma("歩", true, false), new Masu(3, 7));
        this.add(new Koma("歩", true, false), new Masu(4, 7));
        this.add(new Koma("歩", true, false), new Masu(5, 7));
        this.add(new Koma("歩", true, false), new Masu(6, 7));
        this.add(new Koma("歩", true, false), new Masu(7, 7));
        this.add(new Koma("歩", true, false), new Masu(8, 7));
        this.add(new Koma("歩", true, false), new Masu(9, 7));
        this.add(new Koma("飛", true, false), new Masu(2, 8));
        this.add(new Koma("角", true, false), new Masu(8, 8));
        this.add(new Koma("香", true, false), new Masu(1, 9));
        this.add(new Koma("桂", true, false), new Masu(2, 9));
        this.add(new Koma("銀", true, false), new Masu(3, 9));
        this.add(new Koma("金", true, false), new Masu(4, 9));
        this.add(new Koma("玉", true, false), new Masu(5, 9));
        this.add(new Koma("金", true, false), new Masu(6, 9));
        this.add(new Koma("銀", true, false), new Masu(7, 9));
        this.add(new Koma("桂", true, false), new Masu(8, 9));
        this.add(new Koma("香", true, false), new Masu(9, 9));

        this.add(new Koma("香", false, false), new Masu(1, 1));
        this.add(new Koma("桂", false, false), new Masu(2, 1));
        this.add(new Koma("銀", false, false), new Masu(3, 1));
        this.add(new Koma("金", false, false), new Masu(4, 1));
        this.add(new Koma("玉", false, false), new Masu(5, 1));
        this.add(new Koma("金", false, false), new Masu(6, 1));
        this.add(new Koma("銀", false, false), new Masu(7, 1));
        this.add(new Koma("桂", false, false), new Masu(8, 1));
        this.add(new Koma("香", false, false), new Masu(9, 1));
        this.add(new Koma("角", false, false), new Masu(2, 2));
        this.add(new Koma("飛", false, false), new Masu(8, 2));
        this.add(new Koma("歩", false, false), new Masu(1, 3));
        this.add(new Koma("歩", false, false), new Masu(2, 3));
        this.add(new Koma("歩", false, false), new Masu(3, 3));
        this.add(new Koma("歩", false, false), new Masu(4, 3));
        this.add(new Koma("歩", false, false), new Masu(5, 3));
        this.add(new Koma("歩", false, false), new Masu(6, 3));
        this.add(new Koma("歩", false, false), new Masu(7, 3));
        this.add(new Koma("歩", false, false), new Masu(8, 3));
        this.add(new Koma("歩", false, false), new Masu(9, 3));
    }
}

// 持駒クラス
class MochiKoma {
    koma: Koma;
    n: number;
    senteFlag: boolean;

    constructor(koma: Koma, n: number, senteFlag: boolean) {
        this.koma = new Koma(koma.getName(), true, false); // 持駒はすべて先手の駒と同じ向き
        this.n = n; // 個数
        this.senteFlag = senteFlag; // 先手の持駒かどうか
    }

    inc() { this.n++; }
    dec() { this.n--; }

    isSente() { return this.senteFlag; }

    getKey() { return this.koma.getKey(); }

    getSymbolid() { return this.koma.getSymbolid(); }
    getName() { return this.koma.getName(); }

    getKoma() { return this.koma.getCopy(); }
    getN() { return this.n; }

    toString() { return `${this.koma.getSymbolid()}-${this.getN()}`; }
}

// すべての持駒を含むクラス (先手、後手別)
class MochiKomaList {
    reflist: Ref<MochiKoma[]> = ref([]); // MochiKomaクラスのオブジェクトのリスト
    senteFlag: boolean; // 先手の持駒かどうか
    preClickIndex: number = -1; // ひとつ前にクリックされた持駒の index
    preClickHTMLElem: HTMLElement | null = null; // ひとつ前にクリックされた HTML element

    constructor(senteFlag: boolean) {
        this.senteFlag = senteFlag; 
    }

    add(koma: Koma) {
        const idx = this.getList().findIndex((mk) => koma.getName() === mk.getName());

        if (idx === -1) {
            this.getList().push(new MochiKoma(koma, 1, this.senteFlag));
            this.getList().sort((mk1, mk2) => (mk2.getKoma().getPriority() - mk1.getKoma().getPriority()));
        } else {
            this.getList()[idx].inc();
        }
    }

    remove(idx: number) {
        if (this.getList()[idx].getN() === 1) {
            this.getList().splice(idx, 1);
        } else {
            this.getList()[idx].dec();
        }
    }

    // 盤上に打つときに使うメンバ関数
    // 後手の持駒を打つときは、後手の向きにする
    getKoma(idx: number) {
        const koma = this.getList()[idx].getKoma();
        if (!this.senteFlag) {
            koma.toGote();
        }
        return koma;
    }

    getList() { return this.reflist.value; }

    // クリックされたマスの class を変える
    setElemClass(elem: HTMLElement) {
        this.preClickHTMLElem = elem;
        this.preClickHTMLElem.classList.replace('square', 'clicked');
    }

    // マスの class を元に戻す
    resetElemClass() {
        if (this.preClickHTMLElem) {
            this.preClickHTMLElem.classList.replace('clicked', 'square');
            this.preClickHTMLElem = null;
        }
    }

    // クリックをリセットする
    resetClick() {
        if (this.wasClicked()) {
            this.preClickIndex = -1;
            this.resetElemClass();
        }
    }

    // ひとつ前にクリックされているかどうかを示す
    wasClicked() { return (this.preClickIndex != -1); }

    // ひとつ前にクリックされた持駒を打つ (komaを削除して、返す)
    pickPreClickKoma() {
        const koma = this.getKoma(this.preClickIndex)
        this.remove(this.preClickIndex);
        return koma;
    }

    // 他にどこもクリックされていない状態で、新たにクリックされた場合の処理
    newClick(event: Event, index: number) {
        this.preClickIndex = index;
        this.setElemClass(event.target as HTMLElement);
    }
}

export { Masu, MasuList, Koma, BanKoma, BanKomaList, MochiKoma, MochiKomaList };
