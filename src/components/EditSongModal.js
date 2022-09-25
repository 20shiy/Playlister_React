import React, {Component} from "react";

export default class EditSongModal extends Component {
    render() {
        const {editSongCallback, hideEditSongModalCallback} = this.props;

        return (
            <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
                <div class="edit-modal-root" id='edit-song-root'>
                    <div class="modal-north">
                        Edit Song
                    </div>
                    <div class='modal-center'>
                        <div class="modal-center-content">
                            <form id="frm">
                                <div>
                                    <label for="songTitle">Title:</label><br/>
                                    <label for="songArtist">Artist:</label><br/>
                                    <label for="youtubeId">Youtube ID:</label>
                                </div>
                                <div>
                                    <input type="text" id="songTitle" name="songTitle"/><br/>
                                    <input type="text" id="songArtist" name="songArtist"/><br/>
                                    <input type="text" id="youtubeId" name="youtubeId"/>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-south">
                        <input 
                            type="button" 
                            id="edit-song-confirm-button" 
                            class="modal-button" 
                            onClick={editSongCallback}
                            value='Confirm' />

                        <input 
                            type="button" 
                            id="edit-song-cancel-button" 
                            class="modal-button" 
                            onClick={hideEditSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
            </div>
        )
    }

}