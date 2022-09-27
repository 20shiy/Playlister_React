import jsTPS_Transaction from "../common/jsTPS.js"
/**
 * MoveSong_Transaction
 * 
 * This class represents a transaction that works with drag
 * and drop. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class MoveSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initSongIndex, initNewSong) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.song = initNewSong;
    }

    doTransaction() {
        this.app.addSong(this.songIndex, this.song);
    }
    
    undoTransaction() {
        this.app.deleteSongActual(this.songIndex, this.song);
    }
}