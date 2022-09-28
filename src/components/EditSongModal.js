import React, {Component} from "react";

export default class EditSongModal extends Component {
    render() {
        const {editSongCallback, hideEditSongModalCallback} = this.props;

        return (
            <div className="modal" id="edit-song-modal" data-animation="slideInOutLeft">
                <div className="edit-modal-root" id='edit-song-root'>
                    <div className="modal-north">
                        Edit Song
                    </div>
                    <div className='modal-center'>
                        <div className="modal-center-content">
                            <form id="frm">
                                <div className="frm-component">
                                    <label for="songTitle">Title:</label><br/>
                                    <label for="songArtist">Artist:</label><br/>
                                    <label for="youtubeId">Youtube ID:</label>
                                </div>
                                <div>
                                    <input className="frm-component"type="text" id="songTitle" name="songTitle"/><br/>
                                    <input className="frm-component"type="text" id="songArtist" name="songArtist"/><br/>
                                    <input className="frm-component"type="text" id="youtubeId" name="youtubeId"/>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="modal-south">
                        <input 
                            type="button" 
                            id="edit-song-confirm-button" 
                            className="modal-button" 
                            onClick={editSongCallback}
                            value='Confirm' />

                        <input 
                            type="button" 
                            id="edit-song-cancel-button" 
                            className="modal-button" 
                            onClick={hideEditSongModalCallback}
                            value='Cancel' />
                    </div>
                </div>
            </div>
        )
    }

}