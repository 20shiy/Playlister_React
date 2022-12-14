import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", event.target.id);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        // console.log(targetId);
        let sourceId = event.dataTransfer.getData("song");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceId, targetId);
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            event.stopPropagation();
            const { song } = this.props;
            this.props.editCallback(this.getItemNum(this.props), song, null);
        }
    }

    handleDeleteSong = (event) => {
        event.stopPropagation();
        const { song } = this.props;
        this.props.removeCallback(this.getItemNum(this.props), song)
    }

    getItemNum = () => {
        return this.props.id.substring("playlist-song-".length);
    }

    render() {
        // console.log(this.props);
        const { song } = this.props;
        let youtubeId = "https://www.youtube.com/watch?v=" + song.youTubeId;
        let num = this.getItemNum();
        // console.log("num: " + num);
        let itemClass = "playlister-song";
        if (this.state.draggedTo) {
            itemClass = "playlister-song-dragged-to";
        }
        return (
           
            <div
                id={'song-' + num}
                className={itemClass + " unselected-list-card"} // 
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                onClick={this.handleClick}
                draggable="true"
            >
                <div id={'song-' + num}>{num}. <a id={'song-' + num} href={youtubeId}> {song.title} by {song.artist}</a></div>
   
                <input
                    type="button"
                    id={"delete-song-" + num}
                    className="list-card-button"
                    onClick={this.handleDeleteSong}
                    value={"X"} />
            </div>     
        )
    }
}