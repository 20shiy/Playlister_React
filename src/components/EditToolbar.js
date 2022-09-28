import React from "react";

export default class EditToolbar extends React.Component {
    render() {
        const { canAddSong, canUndo, canRedo, canClose, 
                undoCallback, redoCallback, closeCallback, addSongCallback, toggle} = this.props;
        let addSongClass = "toolbar-button";
        let undoClass = "toolbar-button";
        let redoClass = "toolbar-button";
        let closeClass = "toolbar-button";

        let addSongDisable = false;
        if (!canAddSong || toggle) {
            addSongClass += " disabled";
            addSongDisable = true;
        } 

        let undoDisable = false;
        if (!canUndo || toggle) {
            undoClass += " disabled";
            undoDisable = true;
        } 

        let redoDisable = false;
        if (!canRedo || toggle) {
            redoClass += " disabled";
            redoDisable = true;
        } 

        let closeDisable = false;
        if (!canClose || toggle) {
            closeClass += " disabled";
            closeDisable = true;
        } 
        
        // if (canUndo) undoClass += " disabled";
        // if (canRedo) redoClass += " disabled";
        // if (canClose) closeClass += " disabled";
        // let boo = this.canAddSong;
        // console.log("can add: " + boo);
        return (
            <div id="edit-toolbar">
            <input 
                type="button" 
                id='add-song-button' 
                value="+" 
                disabled={addSongDisable}
                className={addSongClass}
                onClick={addSongCallback}
            />
            <input 
                type="button" 
                id='undo-button' 
                value="⟲" 
                disabled={undoDisable}
                className={undoClass} 
                onClick={undoCallback}
            />
            <input 
                type="button" 
                id='redo-button' 
                value="⟳" 
                disabled={redoDisable}
                className={redoClass} 
                onClick={redoCallback}
            />
            <input 
                type="button" 
                id='close-button' 
                value="&#x2715;" 
                disabled={closeDisable}
                className={closeClass} 
                onClick={closeCallback}
            />
        </div>
        )
    }
}