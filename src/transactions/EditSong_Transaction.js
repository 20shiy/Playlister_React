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
    constructor(initApp, initSongIndex, initOldSong, initNewSong) {
        super();
        this.app = initApp;
        this.songIndex = initSongIndex;
        this.oldSong = initOldSong;
        this.newSong = initNewSong;
    }

    doTransaction() {
        this.app.editSongActual(this.songIndex, this.oldSong, this.newSong);
    }
    
    undoTransaction() {
        this.app.editSongActual(this.songIndex, this.newSong, this.oldSong);
    }
}