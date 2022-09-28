import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';
import EditSongModal from './components/EditSongModal';
import DeleteSongModal from './components/DeleteSongModal';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            // songIdMarkForEdit: null,
            currentSong: null,
            songIndexMarkForEdit: null,
            newSong: null,
            songBeRemoved: null,
            toggleOpen: false
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }

    addSongInitial = () => {
        if(this.state.currentList !== null) {
            let list = this.state.currentList;

            let newSong = {"title":"Untitled", "artist":"Unknown", "youTubeId":"dQw4w9WgXcQ"};
            let songss = list.songs;
            let len = songss.length;
            this.addSongTransaction(len, newSong);
        }
        
    }

    addSong = (songIndex, song) => {
        if(this.state.currentList !== null) {
            // console.log(songIndex + " " + song);
            let list = this.state.currentList;
            let songss = list.songs;
            songss.splice(songIndex, 0, song);
            list.songs = songss;
            this.setState(prevState => ({
                currentList: list,
                listKeyPairMarkedForDeletion : prevState.keyPair,
                sessionData: prevState.sessionData
            }), () => {
                this.setStateWithUpdatedList(list);
            });
        }
        
    }

    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    addSongTransaction = (songIndex, song) => {
        let transaction = new AddSong_Transaction(this, songIndex, song);
        this.tps.addTransaction(transaction);
    }

    addDeleteSongTransaction = (songIndex, song) => {
        let transaction = new RemoveSong_Transaction(this, songIndex, song);
        this.tps.addTransaction(transaction);
    }

    addEditSongTransaction = (songIndex, oldSong, newSong) => {
        let transaction = new EditSong_Transaction(this, songIndex, oldSong, newSong);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }

    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            toggleOpen:true
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal = () => {
        let modal = document.getElementById("delete-list-modal");
        this.setState(prevState => ({
            toggleOpen:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
        // this.setState(prevState => ({
        //     toggleOpen:false
        // })), () => {
        //     modal.classList.remove("is-visible");
        // }
    }

    hideEditSongModal = () => {
        let modal = document.getElementById("edit-song-modal");
        this.setState(prevState => ({
            toggleOpen:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
        // modal.classList.remove("is-visible");
    }

    markSongForEdit = (songIndex, oldSong, newSong) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.keyPair,
            sessionData: prevState.sessionData,
            songIndexMarkForEdit: songIndex,
            currentSong: oldSong,
            newSong: newSong,
            toggleOpen: true
        }), () => {
            // PROMPT THE USER
            this.showEditSongModal();
        });
    }

    showEditSongModal() {
        let modal = document.getElementById("edit-song-modal");
        // let list = this.state.currentList;
        // let curSong = list.songs[this.state.songIndexMarkForEdit-1];
        // let curTitle = curSong.title;
        // let curArtist = curSong.artist;
        // let curYoutubeId = curSong.youTubeId;
        let oldSong = this.state.currentSong;
        let curTitle = oldSong.title;
        let curArtist = oldSong.artist;
        let curYoutubeId = oldSong.youTubeId;

        document.getElementById("songTitle").value = curTitle;
        document.getElementById("songArtist").value = curArtist;
        document.getElementById("youtubeId").value = curYoutubeId;

        modal.classList.add("is-visible");
    }

    editSongConfirm = () => {
        let modal = document.getElementById("edit-song-modal");
        let newTitle = document.getElementById("songTitle").value;
        let newArtist = document.getElementById("songArtist").value;
        let newyoutubeId = document.getElementById("youtubeId").value;
        // let list = this.state.currentList;

        let newSong = {"title":newTitle, "artist":newArtist, "youTubeId":newyoutubeId};
        // list.songs[this.state.songIndexMarkForEdit-1] = newSong;
        this.addEditSongTransaction(this.state.songIndexMarkForEdit-1, this.state.currentSong, newSong);
        this.setState(prevState => ({
            toggleOpen: false
        }), () => {
            // PROMPT THE USER
            // this.showEditSongModal();
            modal.classList.remove("is-visible");
        });
        
    }

    editSongActual = (songIndex, oldSong, newSong) => {
        let list = this.state.currentList;
        let songss = list.songs;
        songss.splice(songIndex, 1, newSong);
        list.songs = songss;

        this.setState(prevState => ({
            currentList: list,
            listKeyPairMarkedForDeletion : prevState.keyPair,
            sessionData: prevState.sessionData,
            newSong: newSong
        }), () => {
            this.setStateWithUpdatedList(list);
        });

    }

    markSongForRemove = (songIndex, song) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.keyPair,
            sessionData: prevState.sessionData,
            songIndexMarkForEdit: songIndex,
            songBeRemoved: song,
            toggleOpen:true
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });

    }

    deleteSongActual = (songIndex, song) => {
        let list = this.state.currentList;
        let songsList = list.songs;
        songsList.splice(songIndex, 1);

        list.songs = songsList;

        this.setState(prevState => ({
            currentList: list,
            listKeyPairMarkedForDeletion : prevState.keyPair,
            sessionData: prevState.sessionData,
            songBeRemoved: song
        }), () => {
            this.setStateWithUpdatedList(list);
        });

    }

    deleteSongConfirm = () => {
        let modal = document.getElementById("delete-song-modal");
        this.addDeleteSongTransaction(this.state.songIndexMarkForEdit-1, this.state.songBeRemoved);
        this.setState(prevState => ({
            toggleOpen:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
        
    }

    hideDeleteSongModal = () => {
        let modal = document.getElementById("delete-song-modal");
        this.setState(prevState => ({
            toggleOpen:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
        // modal.classList.remove("is-visible");

    }

    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
    }

    handleKeyDown = (event) => {
        if(event.ctrlKey) {
            if(event.keyCode === 90) {
                console.log("90");
                if(this.tps.hasTransactionToUndo()) {
                    this.undo();
                }
                event.preventDefault();
            } else if(event.keyCode === 89) {
                console.log("89")
                if(this.tps.hasTransactionToRedo()) {
                    this.redo();
                }
            }
        }

    }

    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        let canAddList = this.state.currentList == null;
        let toggle = this.state.toggleOpen === true;
        return (
            <div id="root" onKeyDown={this.handleKeyDown} tabIndex="0">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                    canAddList={canAddList}
                    toggle={toggle}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    toggle={toggle}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                    addSongCallback={this.addSongInitial}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction} 
                    editSongCallback={this.markSongForEdit}
                    removeSongCallback={this.markSongForRemove}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    deleteListCallback={this.deleteMarkedList}
                />
                <EditSongModal
                    editSongCallback={this.editSongConfirm}
                    hideEditSongModalCallback={this.hideEditSongModal}
                />
                <DeleteSongModal 
                    selectedSong={this.state.songBeRemoved}
                    deleteSongCallback={this.deleteSongConfirm}
                    hideDeleteSongModalCallback={this.hideDeleteSongModal}
                />
            </div>
        );
    }
}

export default App;
